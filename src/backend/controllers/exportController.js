const ExportService = require('../services/ExportService');
const AnalyticsService = require('../services/AnalyticsService');
const PdfService = require('../services/PdfService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Download do arquivo Excel do projeto.
 * GET /api/projects/:id/export/excel
 */
const downloadExcel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Gerar o buffer
  const buffer = await ExportService.generateProjectExcel(parseInt(id));

  // Configurar headers para download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.xlsx`);

  res.send(buffer);
});

/**
 * Download do arquivo PDF do projeto.
 * GET /api/projects/:id/export/pdf
 */
const downloadPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Gerar o buffer
  const buffer = await PdfService.generateProjectPdf(parseInt(id));

  // Configurar headers para download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.pdf`);

  res.send(buffer);
});

/**
 * Retorna dados de inteligência do projeto.
 * GET /api/projects/:id/analytics
 */
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const kpis = await AnalyticsService.getProjectKPIs(parseInt(id));

  res.json({
    sucesso: true,
    analytics: kpis
  });
});

module.exports = { downloadExcel, getProjectAnalytics, downloadPdf };
