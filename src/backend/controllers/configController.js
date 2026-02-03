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

const themes = require('../config/exportThemes');

// Obter Design Tokens Universais (v0.3.8)
const getUITokens = asyncHandler(async (req, res) => {
  const themeName = req.query.theme || 'default';
  const tokens = themes[themeName] || themes.default;
  res.json({ sucesso: true, tokens });
});

module.exports = { getConfig, updateConfig, getUITokens };

