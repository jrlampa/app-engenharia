const express = require('express');
const router = express.Router();
const { tracaoSchema, validate } = require('../utils/validation');
const { calcularTracaoController } = require('../controllers/tracaoController');

/**
 * POST /tracao/calcular
 * Calcula a flecha e sugere estrutura.
 * Query params: ?projectId=123 (opcional)
 */
router.post('/tracao/calcular', validate(tracaoSchema), calcularTracaoController);

module.exports = router;

