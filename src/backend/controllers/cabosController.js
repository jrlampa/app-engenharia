const logger = require('../utils/logger');

/**
 * Controller para listar cabos.
 */
const listarCabosController = (req, res) => {
  try {
    const tabelaCabos = [
      { nome: "10mm²", r: 1.83 },
      { nome: "16mm²", r: 1.15 },
      { nome: "25mm²", r: 0.727 },
      { nome: "35mm²", r: 0.524 }
    ];

    logger.info("Tabela de cabos solicitada");

    res.json({
      sucesso: true,
      cabos: tabelaCabos
    });
  } catch (error) {
    logger.error("Erro ao listar cabos", { error: error.message });
    res.status(500).json({
      sucesso: false,
      error: "Erro interno ao buscar tabela de cabos."
    });
  }
};

module.exports = { listarCabosController };
