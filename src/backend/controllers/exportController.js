const ExportService = require('../services/ExportService');
const AnalyticsService = require('../services/AnalyticsService');
const PdfService = require('../services/PdfService');
const YieldService = require('../services/YieldService');
const BudgetService = require('../services/BudgetService');
const ValidatorService = require('../services/ValidatorService');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * Download do arquivo Excel do projeto (STREAM + VALIDATION).
 * GET /api/projects/:id/export/excel
 */
const downloadExcel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projectId = parseInt(id);

  // 1. Coleta dados para validação
  const budget = await BudgetService.calculateProjectBudget(projectId);

  // 2. O "Guardião" valida os dados
  const validacao = ValidatorService.validarProjetoParaExportacao(budget);

  if (!validacao.valido) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Falha na validação técnica do projeto.",
      erros: validacao.erros
    });
  }

  // 3. Efetua o Stream se válido
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.xlsx`);

  await ExportService.streamProjectExcel(projectId, res);
});

/**
 * Download do arquivo PDF do projeto (STREAM + VALIDATION).
 * GET /api/projects/:id/export/pdf
 */
const downloadPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projectId = parseInt(id);

  // Validação de pré-requisitos
  const budget = await BudgetService.calculateProjectBudget(projectId);
  const validacao = ValidatorService.validarProjetoParaExportacao(budget);

  if (!validacao.valido) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Exportação bloqueada pelo Guardian Layer.",
      erros: validacao.erros
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Project_${id}_Report.pdf`);

  await PdfService.streamProjectPdf(projectId, res);
});

/**
 * Retorna análise de variância e ROI (v0.3.6).
 */
const getYieldAnalysis = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analysis = await YieldService.calculateVariance(parseInt(id));
  res.json({ sucesso: true, yield: analysis });
});

/**
 * Retorna dados de inteligência do projeto com benchmarking.
 */
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const projectId = parseInt(id);

  const kpis = await AnalyticsService.getProjectKPIs(projectId);
  const benchmarking = await AnalyticsService.getBenchmarkingStats(projectId);

  res.json({
    sucesso: true,
    analytics: kpis,
    benchmarking: benchmarking
  });
});

/**
 * Retorna orçamento do projeto.
 */
const getBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const budget = await BudgetService.calculateProjectBudget(parseInt(id));
  res.json({ sucesso: true, budget: budget });
});

module.exports = { downloadExcel, getProjectAnalytics, downloadPdf, getBudget, getYieldAnalysis };
