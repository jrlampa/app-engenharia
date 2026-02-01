/**
 * Lógica de Cálculo de Tração de Rede
 * Baseado nos parâmetros da planilha CÁLCULO DE TRAÇÃO DE REDE.xlsm
 */

const express = require('express');
const router = express.Router();

router.post('/calcular', (req, res) => {
  try {
    const {
      vão,            // Distância entre postes (m)
      pesoCabo,       // Peso unitário do condutor (kg/m)
      tracaoInicial,  // Tração aplicada (daN)
      temperatura,    // Temperatura de projeto (°C)
      coeficienteExp  // Coeficiente de expansão térmica
    } = req.body;

    // --- Exemplo de Lógica de Engenharia (Catenária Simplificada) ---

    // 1. Cálculo da Flecha (f = (P * L²) / (8 * T))
    const flecha = (pesoCabo * Math.pow(vão, 2)) / (8 * tracaoInicial);

    // 2. Comprimento do condutor no vão (aproximação)
    const comprimentoCabo = vão + (8 * Math.pow(flecha, 2)) / (3 * vão);

    // 3. Esforço resultante no poste (considerando ângulo se houver)
    // (Aqui entraríamos com a lógica de mudança de direção da sua planilha)

    res.json({
      success: true,
      dados: {
        flechaMetros: flecha.toFixed(3),
        comprimentoReal: comprimentoCabo.toFixed(3),
        esforçoNoPoste: (tracaoInicial * 1.0).toFixed(2), // Simplificado
        status: flecha > 2 ? "Atenção: Flecha excessiva" : "Dentro dos limites"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro no cálculo mecânico." });
  }
});

module.exports = router;
