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

  // Lógica de cálculo delegada para o Service
  const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

  // 3. Persistência em background (não bloqueia a resposta ao utilizador)
  HistoryService.salvarCalculo('TENSAO', req.body, resultado, projectId)
    .catch(err => logger.error(`Erro ao salvar histórico em background: ${err.message}`));


  logger.info("Cálculo de queda de tensão realizado", resultado);

  res.json({
    sucesso: true,
    resultado
  });
});

module.exports = { calcularTensaoController };

