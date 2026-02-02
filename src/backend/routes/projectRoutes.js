const express = require('express');
const router = express.Router();
const { createProject, listProjects, deleteProject } = require('../controllers/projectController');

/**
 * @route GET /api/projects
 * @desc Lista todos os projetos cadastrados
 */
router.get('/', listProjects);

/**
 * @route POST /api/projects
 * @desc Cria um novo projeto
 */
router.post('/', createProject);

/**
 * @route DELETE /api/projects/:id
 * @desc Remove um projeto e todos os seus dados associados
 */
router.delete('/:id', deleteProject);

module.exports = router;
