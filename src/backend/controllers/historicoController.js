const HistoryService = require('../services/HistoryService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * DOCUMENTAÇÃO: Controller para gestão do histórico.
 * Intermedia a recuperação de dados persistidos no SQLite.
 * Seguindo padrão Senior Dev (asyncHandler + logs técnicos).
 */
const listarHistorico = asyncHandler(async (req, res) => {
  const { tipo } = req.query;
  let dados;

  if (tipo) {
    // Busca filtrada por tipo (v0.2.5)
    dados = await HistoryService.buscarPorTipo(tipo);
    logger.info(`Histórico filtrado por ${tipo}: ${dados.length} registros.`);
  } else {
    // Busca completa
    dados = await HistoryService.listarHistorico();
    logger.info(`Histórico recuperado: ${dados.length} registros encontrados.`);
  }

  res.json({
    sucesso: true,
    dados
  });
});

/**
 * Controller para exclusão de registro.
 */
const excluirHistorico = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ sucesso: false, erro: "ID do registro é obrigatório." });
  }

  await HistoryService.excluirCalculo(id);

  res.json({
    sucesso: true,
    mensagem: `Registro #${id} removido com sucesso.`
  });
});

module.exports = { listarHistorico, excluirHistorico };

