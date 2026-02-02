const { calcularTracao } = require('../services/calcService');
const { buscarMateriaisNoCSV } = require('../services/MaterialService');
const { saveCalculoTracao } = require('../services/HistoryService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller para cálculo de tração.
 */
const calcularTracaoController = asyncHandler(async (req, res) => {
  const { vao, pesoCabo, tracaoInicial } = req.body;
  const { projectId } = req.query;

  // Lógica de cálculo delegada para o Service
  const { flecha, sugestao } = calcularTracao(vao, pesoCabo, tracaoInicial);

  // Acesso a Dados delegado para o Service
  const materiais = await buscarMateriaisNoCSV(sugestao);
  const resultado = { flecha, sugestao, materiais };

  // Persistência delegada para o HistoryService (não bloqueante para o cálculo)
  try {
    saveCalculoTracao(projectId, req.body, resultado);
  } catch (dbError) {
    logger.warn('Failed to save calculation to database', { error: dbError.message });
  }

  // Log de sucesso
  logger.info("Cálculo de tração realizado com sucesso", { flecha, sugestao });

  res.json({ sucesso: true, resultado });
});

module.exports = { calcularTracaoController };

