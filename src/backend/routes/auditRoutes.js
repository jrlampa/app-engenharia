const express = require('express');
const router = express.Router({ mergeParams: true });
const { auditProject } = require('../controllers/auditController');

/**
 * @route GET /api/projects/:id/audit
 * @desc Retorna relatório de inconsistências do projeto
 */
router.get('/:id/audit', auditProject);

module.exports = router;
