const express = require('express');
const router = express.Router({ mergeParams: true });
const { downloadExcel, getProjectAnalytics, downloadPdf } = require('../controllers/exportController');


/**
 * @route GET /api/projects/:id/export/excel
 * @desc Download de planilha Excel rica
 */
router.get('/:id/export/excel', downloadExcel);

/**
 * @route GET /api/projects/:id/export/excel
 * @desc Download de planilha Excel rica
 */
router.get('/:id/export/excel', downloadExcel);

/**
 * @route GET /api/projects/:id/export/pdf
 * @desc Download de relatório PDF oficial
 */
router.get('/:id/export/pdf', downloadPdf);

/**
 * @route GET /api/projects/:id/analytics
 * @desc KPI Dashboard Data
 */
router.get('/:id/analytics', getProjectAnalytics);

module.exports = router;

