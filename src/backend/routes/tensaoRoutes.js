const express = require('express');
const router = express.Router();
const { tensaoSchema, validate } = require('../utils/validation');
const { calcularTensaoController } = require('../controllers/tensaoController');

/**
 * POST /tensao/calcular
 * Calcula queda de tensão.
 * Query params: ?projectId=123 (opcional)
 */
router.post('/tensao/calcular', validate(tensaoSchema), calcularTensaoController);

module.exports = router;

