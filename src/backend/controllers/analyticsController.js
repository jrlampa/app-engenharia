const AnalyticsService = require('../services/AnalyticsService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Retorna tendências de volume de projetos (Séries Temporais).
 * GET /api/analytics/trends/projects
 */
const getProjectTrends = asyncHandler(async (req, res) => {
  const trends = await AnalyticsService.getProjectTimelineStats();
  res.json({ sucesso: true, trends });
});

/**
 * Retorna evolução de custos totais (v0.3.5).
 * GET /api/analytics/trends/costs
 */
const getCostTrends = asyncHandler(async (req, res) => {
  const costs = await AnalyticsService.getCostEvolution();
  res.json({ sucesso: true, costs });
});

/**
 * Retorna Top Clientes (BI).
 * GET /api/analytics/top-clients
 */
const getTopClients = asyncHandler(async (req, res) => {
  const top = await AnalyticsService.getTopClients();
  res.json({ sucesso: true, top });
});

module.exports = { getProjectTrends, getCostTrends, getTopClients };
