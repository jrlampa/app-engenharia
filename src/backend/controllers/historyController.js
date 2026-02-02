const {
  createProject,
  listAllProjects,
  getProjectHistory,
  getRecentCalculations
} = require('../services/HistoryService');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller para listar projetos.
 */
const listarProjetosController = asyncHandler(async (req, res) => {
  const projects = listAllProjects();
  res.json({ sucesso: true, projects });
});

/**
 * Controller para criar projeto.
 */
const criarProjetoController = asyncHandler(async (req, res) => {
  const { name, description, client, location } = req.body;

  if (!name || name.trim() === '') {
    const error = new Error('Nome do projeto é obrigatório');
    error.status = 400;
    throw error;
  }

  const projectId = createProject(name, description, client, location);

  res.json({
    sucesso: true,
    projectId,
    message: `Projeto "${name}" criado com sucesso`
  });
});

/**
 * Controller para obter histórico de um projeto.
 */
const obterHistoricoProjetoController = asyncHandler(async (req, res) => {
  const projectId = parseInt(req.params.id);

  if (isNaN(projectId)) {
    const error = new Error('ID de projeto inválido');
    error.status = 400;
    throw error;
  }

  const history = getProjectHistory(projectId);
  res.json({ sucesso: true, history });
});

/**
 * Controller para listar cálculos recentes.
 */
const listarCalculosRecentesController = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const calculations = getRecentCalculations(limit);
  res.json({ sucesso: true, calculations });
});

module.exports = {
  listarProjetosController,
  criarProjetoController,
  obterHistoricoProjetoController,
  listarCalculosRecentesController
};

