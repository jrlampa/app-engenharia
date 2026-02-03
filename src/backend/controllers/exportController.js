const ExportService = require('../services/ExportService');
const AnalyticsService = require('../services/AnalyticsService');
const PdfService = require('../services/PdfService');
const YieldService = require('../services/YieldService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Download do arquivo Excel do projeto (STREAM).
 * GET /api/projects/:id/export/excel
 */
const downloadExcel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.xlsx`);

  await ExportService.streamProjectExcel(parseInt(id), res);
});

/**
 * Download do arquivo PDF do projeto (STREAM).
 * GET /api/projects/:id/export/pdf
 */
const downloadPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.pdf`);

  await PdfService.streamProjectPdf(parseInt(id), res);
});

/**
 * Retorna análise de variância e ROI (v0.3.6).
 * GET /api/projects/:id/yield
 */
const getYieldAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analysis = await YieldService.calculateVariance(parseInt(id));
  res.json({ sucesso: true, yield: analysis });
});

/**
 * Retorna dados de inteligência do projeto.
 */
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const kpis = await AnalyticsService.getProjectKPIs(parseInt(id));
  res.json({ sucesso: true, analytics: kpis });
});

/**
 * Retorna orçamento do projeto.
 */
const getBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const BudgetService = require('../services/BudgetService');
  const budget = await BudgetService.calculateProjectBudget(parseInt(id));
  res.json({ sucesso: true, budget: budget });
});

module.exports = { downloadExcel, getProjectAnalytics, downloadPdf, getBudget, getYieldAnalysis };
