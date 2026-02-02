const ConfigService = require('../services/ConfigService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/config
 */
const getConfig = asyncHandler(async (req, res) => {
  const config = await ConfigService.getConfig();
  res.json({ sucesso: true, config });
});

/**
 * PUT /api/config
 */
const updateConfig = asyncHandler(async (req, res) => {
  const updated = await ConfigService.updateConfig(req.body);
  res.json({ sucesso: true, config: updated });
});

module.exports = { getConfig, updateConfig };
