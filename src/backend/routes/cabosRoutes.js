const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Retorna a tabela de cabos e suas resistências.
 * Baseado na NBR 5410 (cobre, 70°C).
 */
router.get('/tensao/cabos', (req, res) => {
  const tabelaCabos = [
    { nome: "10mm²", r: 1.83 },
    { nome: "16mm²", r: 1.15 },
    { nome: "25mm²", r: 0.727 },
    { nome: "35mm²", r: 0.524 }
  ];

  logger.info("Tabela de cabos solicitada");

  res.json({
    sucesso: true,
    cabos: tabelaCabos
  });
});

module.exports = router;
