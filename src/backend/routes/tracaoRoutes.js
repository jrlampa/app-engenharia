const express = require('express');
const router = express.Router();
const { tracaoSchema, validate } = require('../utils/validation');
const { calcularTracao } = require('../services/calcService');
const { buscarMateriaisNoCSV } = require('../services/MaterialService');
const logger = require('../utils/logger');

router.post('/tracao/calcular', validate(tracaoSchema), async (req, res) => {
  const { vao, pesoCabo, tracaoInicial } = req.body;

  // Lógica de cálculo delegada para o Service
  const { flecha, sugestao } = calcularTracao(vao, pesoCabo, tracaoInicial);

  // Acesso a Dados delegado para o Service
  try {
    const materiais = await buscarMateriaisNoCSV(sugestao);

    // Log de sucesso
    logger.info("Cálculo de tração realizado com sucesso", { flecha, sugestao });

    res.json({
      sucesso: true,
      resultado: {
        flecha,
        sugestao,
        materiais
      }
    });
  } catch (error) {
    logger.error("Erro no processamento do kit", { error: error.message });
    res.status(500).json({
      sucesso: false,
      error: error.message || "Erro interno ao buscar materiais."
    });
  }
});

module.exports = router;
