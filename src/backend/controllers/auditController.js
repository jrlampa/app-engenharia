const AuditService = require('../services/AuditService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Executa a auditoria no projeto.
 * GET /api/projects/:id/audit
 */
const auditProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await AuditService.auditProject(parseInt(id));

  res.json({
    sucesso: true,
    audit: report
  });
});

module.exports = { auditProject };
