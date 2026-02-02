const ReportingService = require('../services/ReportingService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Endpoint para obter o relatório consolidado de materiais de um projeto.
 * GET /api/projects/:id/report
 */
const getProjectReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ sucesso: false, erro: "ID do projeto é obrigatório." });
  }

  const report = await ReportingService.generateMaterialReport(parseInt(id));

  res.json({
    sucesso: true,
    relatorio: report
  });
});

module.exports = { getProjectReport };
