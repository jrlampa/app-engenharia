const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante para acessar :id do pai se necessário, mas aqui usaremos rota direta
const { downloadExcel, getProjectAnalytics } = require('../controllers/exportController');

/**
 * @route GET /api/projects/:id/export/excel
 * @desc Download de planilha Excel rica
 */
router.get('/:id/export/excel', downloadExcel);

/**
 * @route GET /api/projects/:id/analytics
 * @desc KPI Dashboard Data
 */
router.get('/:id/analytics', getProjectAnalytics);

module.exports = router;
