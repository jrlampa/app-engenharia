const { calcularQuedaTensao } = require('../services/CalculationService');
const HistoryService = require('../services/HistoryService');

const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller para cálculo de queda de tensão.
 */
const calcularTensaoController = asyncHandler(async (req, res) => {
  const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;
  const { projectId } = req.query;

  // 1. Cálculo (Service Layer - v0.2.6)
  const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

  // 2. Persistência em background
  HistoryService.salvarCalculo('TENSAO', req.body, resultado, projectId)
    .catch(err => logger.error(`Erro ao salvar histórico (Tensão): ${err.message}`));

  // 3. Auditoria técnica
  logger.info(`Cálculo de Tensão executado: ${resultado.quedaPercentual}% de queda. Status: ${resultado.status}`);

  res.json({
    sucesso: true,
    resultado
  });
});


module.exports = { calcularTensaoController };

