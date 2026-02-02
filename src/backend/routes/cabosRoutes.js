const express = require('express');
const router = express.Router();
const { listarCabosController } = require('../controllers/cabosController');

/**
 * GET /tensao/cabos
 * Retorna a tabela de cabos e suas resistências.
 */
router.get('/tensao/cabos', listarCabosController);

module.exports = router;

