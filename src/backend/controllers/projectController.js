const ProjectService = require('../services/ProjectService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Cria um novo projeto.
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.createProject(req.body);
  res.status(201).json({
    sucesso: true,
    projeto: project
  });
});

/**
 * Lista todos os projetos.
 */
const listProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectService.listAllProjects();
  res.json({
    sucesso: true,
    projetos: projects
  });
});

/**
 * Remove um projeto pelo ID.
 */
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ProjectService.deleteProject(id);

  if (!deleted) {
    return res.status(404).json({ sucesso: false, erro: "Projeto não encontrado." });
  }

  res.json({
    sucesso: true,
    mensagem: "Projeto e histórico associado removidos com sucesso."
  });
});

module.exports = { createProject, listProjects, deleteProject };
