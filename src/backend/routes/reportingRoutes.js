const express = require('express');
const router = express.Router();
const { getProjectReport } = require('../controllers/reportingController');

/**
 * @route GET /api/projects/:id/report
 * @desc Retorna o relatório consolidado de materiais do projeto
 */
router.get('/:id/report', getProjectReport);

module.exports = router;
