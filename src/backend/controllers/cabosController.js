const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller para listar cabos.
 */
const listarCabosController = asyncHandler(async (req, res) => {
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
});

module.exports = { listarCabosController };

