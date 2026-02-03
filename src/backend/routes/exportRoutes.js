const express = require('express');
const router = express.Router({ mergeParams: true });
const { downloadExcel, getProjectAnalytics, downloadPdf, getBudget, getYieldAnalysis } = require('../controllers/exportController');

// ... (existing routes)

/**
 * @route GET /api/projects/:id/yield
 * @desc Análise de Variância e ROI
 */
router.get('/:id/yield', getYieldAnalysis);

router.get('/:id/export/excel', downloadExcel);
router.get('/:id/export/pdf', downloadPdf);
router.get('/:id/analytics', getProjectAnalytics);
router.get('/:id/budget', getBudget);

module.exports = router;

