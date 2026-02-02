const express = require('express');
const router = express.Router();
const { tensaoSchema, validate } = require('../utils/validation');
const { calcularQuedaTensao } = require('../services/calcService');
const { saveCalculoTensao } = require('../services/HistoryService');
const logger = require('../utils/logger');

router.post('/tensao/calcular', validate(tensaoSchema), (req, res) => {
  const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;
  const { projectId } = req.query;

  // Lógica de cálculo delegada para o Service
  const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

  // Save to database
  try {
    saveCalculoTensao(projectId, req.body, resultado);
  } catch (dbError) {
    logger.warn('Failed to save calculation to database', { error: dbError.message });
  }

  logger.info("Cálculo de queda de tensão realizado", resultado);

  res.json({
    sucesso: true,
    resultado
  });
});

module.exports = router;
