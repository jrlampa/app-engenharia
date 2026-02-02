const express = require('express');
const router = express.Router();
const {
  listarProjetosController,
  criarProjetoController,
  obterHistoricoProjetoController,
  listarCalculosRecentesController
} = require('../controllers/historyController');

/**
 * GET /history/projects
 * Lista todos os projetos com contadores de cálculos.
 */
router.get('/history/projects', listarProjetosController);

/**
 * POST /history/projects
 * Cria um novo projeto.
 */
router.post('/history/projects', criarProjetoController);

/**
 * GET /history/projects/:id
 * Retorna o histórico completo de um projeto.
 */
router.get('/history/projects/:id', obterHistoricoProjetoController);

/**
 * GET /history/recent
 * Retorna os últimos cálculos (sem projeto associado).
 */
router.get('/history/recent', listarCalculosRecentesController);

module.exports = router;

