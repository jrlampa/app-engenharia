const express = require('express');
const router = express.Router();
const { listarHistorico } = require('../controllers/historicoController');

/**
 * @route GET /api/historico
 * @desc Lista histórico unificado com suporte a filtro por ?tipo=TRACAO|TENSAO
 * @version 0.2.5
 */
router.get('/', listarHistorico);

module.exports = router;
