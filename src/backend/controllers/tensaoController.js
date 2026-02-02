const { calcularQuedaTensao } = require('../services/calcService');
const { saveCalculoTensao } = require('../services/HistoryService');
const logger = require('../utils/logger');

/**
 * Controller para cálculo de queda de tensão.
 */
const calcularTensaoController = (req, res) => {
  try {
    const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;
    const { projectId } = req.query;

    // Lógica de cálculo delegada para o Service
    const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

    // Persistência delegada para o HistoryService
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
  } catch (error) {
    logger.error("Erro no cálculo de queda de tensão", { error: error.message });
    res.status(500).json({
      sucesso: false,
      error: error.message || "Erro interno ao calcular queda de tensão."
    });
  }
};

module.exports = { calcularTensaoController };
