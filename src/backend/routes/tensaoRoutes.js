const express = require('express');
const router = express.Router();
const { tensaoSchema, validate } = require('../utils/validation');
const { calcularQuedaTensao } = require('../services/calcService');
const logger = require('../utils/logger');

router.post('/tensao/calcular', validate(tensaoSchema), (req, res) => {
  const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;

  // Lógica de cálculo delegada para o Service
  const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

  logger.info("Cálculo de queda de tensão realizado", resultado);

  res.json({
    sucesso: true,
    resultado
  });
});

module.exports = router;
