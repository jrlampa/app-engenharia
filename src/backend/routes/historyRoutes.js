const express = require('express');
const router = express.Router();
const {
  createProject,
  listAllProjects,
  getProjectHistory,
  getRecentCalculations
} = require('../services/HistoryService');
const logger = require('../utils/logger');

/**
 * GET /history/projects
 * Lista todos os projetos com contadores de cálculos.
 */
router.get('/history/projects', (req, res) => {
  try {
    const projects = listAllProjects();
    res.json({ sucesso: true, projects });
  } catch (error) {
    logger.error('Error listing projects', { error: error.message });
    res.status(500).json({ sucesso: false, error: error.message });
  }
});

/**
 * POST /history/projects
 * Cria um novo projeto.
 */
router.post('/history/projects', (req, res) => {
  try {
    const { name, description, client, location } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        sucesso: false,
        error: 'Nome do projeto é obrigatório'
      });
    }

    const projectId = createProject(name, description, client, location);

    res.json({
      sucesso: true,
      projectId,
      message: `Projeto "${name}" criado com sucesso`
    });
  } catch (error) {
    logger.error('Error creating project', { error: error.message });
    res.status(500).json({ sucesso: false, error: error.message });
  }
});

/**
 * GET /history/projects/:id
 * Retorna o histórico completo de um projeto.
 */
router.get('/history/projects/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        sucesso: false,
        error: 'ID de projeto inválido'
      });
    }

    const history = getProjectHistory(projectId);
    res.json({ sucesso: true, history });
  } catch (error) {
    logger.error('Error getting project history', { error: error.message });
    res.status(500).json({ sucesso: false, error: error.message });
  }
});

/**
 * GET /history/recent
 * Retorna os últimos cálculos (sem projeto associado).
 */
router.get('/history/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const calculations = getRecentCalculations(limit);
    res.json({ sucesso: true, calculations });
  } catch (error) {
    logger.error('Error getting recent calculations', { error: error.message });
    res.status(500).json({ sucesso: false, error: error.message });
  }
});

module.exports = router;
