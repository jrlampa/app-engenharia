const express = require('express');
const router = express.Router();
const { tracaoSchema, validate } = require('../utils/validation');
const { calcularTracao } = require('../services/calcService');
const { buscarMateriaisNoCSV } = require('../services/MaterialService');
const { saveCalculoTracao } = require('../services/HistoryService');
const logger = require('../utils/logger');

router.post('/tracao/calcular', validate(tracaoSchema), async (req, res) => {
  const { vao, pesoCabo, tracaoInicial } = req.body;
  const { projectId } = req.query;

  // Lógica de cálculo delegada para o Service
  const { flecha, sugestao } = calcularTracao(vao, pesoCabo, tracaoInicial);

  // Acesso a Dados delegado para o Service
  try {
    const materiais = await buscarMateriaisNoCSV(sugestao);
    const resultado = { flecha, sugestao, materiais };

    // Save to database
    try {
      saveCalculoTracao(projectId, req.body, resultado);
    } catch (dbError) {
      logger.warn('Failed to save calculation to database', { error: dbError.message });
    }

    // Log de sucesso
    logger.info("Cálculo de tração realizado com sucesso", { flecha, sugestao });

    res.json({ sucesso: true, resultado });
  } catch (error) {
    logger.error("Erro no processamento do kit", { error: error.message });
    res.status(500).json({
      sucesso: false,
      error: error.message || "Erro interno ao buscar materiais."
    });
  }
});

module.exports = router;
