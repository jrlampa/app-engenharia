const express = require('express');
const router = express.Router();
const HistoryService = require('../services/HistoryService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/historico
 * @desc Lista todos os cálculos guardados no SQLite (Tração e Tensão)
 * @version 0.2.4 - Unified History
 */
router.get('/', asyncHandler(async (req, res) => {
  const lista = await HistoryService.listarHistorico();
  res.json({
    sucesso: true,
    dados: lista
  });
}));

/**
 * @route GET /api/historico/projeto/:id
 * @desc Lista histórico de um projeto específico
 */
router.get('/projeto/:id', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const lista = await HistoryService.listarPorProjeto(projectId);
  res.json({
    sucesso: true,
    dados: lista
  });
}));

module.exports = router;
