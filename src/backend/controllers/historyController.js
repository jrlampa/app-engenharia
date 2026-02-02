const {
  createProject,
  listAllProjects,
  getProjectHistory,
  getRecentCalculations
} = require('../services/HistoryService');
const logger = require('../utils/logger');

/**
 * Controller para listar projetos.
 */
const listarProjetosController = (req, res) => {
  try {
    const projects = listAllProjects();
    res.json({ sucesso: true, projects });
  } catch (error) {
    logger.error('Error listing projects', { error: error.message });
    res.status(500).json({ sucesso: false, error: 'Erro ao listar projetos' });
  }
};

/**
 * Controller para criar projeto.
 */
const criarProjetoController = (req, res) => {
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
    res.status(500).json({ sucesso: false, error: 'Erro ao criar projeto' });
  }
};

/**
 * Controller para obter histórico de um projeto.
 */
const obterHistoricoProjetoController = (req, res) => {
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
    res.status(500).json({ sucesso: false, error: 'Erro ao obter histórico do projeto' });
  }
};

/**
 * Controller para listar cálculos recentes.
 */
const listarCalculosRecentesController = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const calculations = getRecentCalculations(limit);
    res.json({ sucesso: true, calculations });
  } catch (error) {
    logger.error('Error getting recent calculations', { error: error.message });
    res.status(500).json({ sucesso: false, error: 'Erro ao obter cálculos recentes' });
  }
};

module.exports = {
  listarProjetosController,
  criarProjetoController,
  obterHistoricoProjetoController,
  listarCalculosRecentesController
};
