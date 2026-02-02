const express = require('express');
const router = express.Router();
const { listarHistorico, excluirHistorico } = require('../controllers/historicoController');
const asyncHandler = require('../utils/asyncHandler');


/**
 * @route GET /api/historico
 * @desc Lista histórico unificado com suporte a filtro por ?tipo=TRACAO|TENSAO
 * @version 0.2.5
 */
router.get('/', listarHistorico);

/**
 * @route GET /api/historico/export
 * @desc Exporta backup SQL do histórico para a pasta Downloads
 */
router.get('/export', asyncHandler(async (req, res) => {
  const BackupService = require('../services/BackupService');
  const result = await BackupService.exportDataToSQL();
  res.json({ sucesso: true, ...result });
}));

/**
 * @route DELETE /api/historico/:id
 * @desc Remove um registro específico do histórico
 */
router.delete('/:id', excluirHistorico);

module.exports = router;

