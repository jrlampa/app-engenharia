/**
 * Lógica de Cálculo de Tração de Rede
 * Baseado nos parâmetros da planilha CÁLCULO DE TRAÇÃO DE REDE.xlsm
 */

const express = require('express');
const router = express.Router();

/**
 * DOCUMENTAÇÃO: Middleware de validação para cálculos de tração.
 * Garante que os valores de entrada estejam dentro de faixas seguras de engenharia.
 */
const validarTracao = (req, res, next) => {
  const { vão, pesoCabo, tracaoInicial } = req.body;

  // 1. Verificar se são números positivos
  if (vão <= 0 || pesoCabo <= 0 || tracaoInicial <= 0) {
    return res.status(400).json({
      erro: "Valores inválidos",
      mensagem: "Vão, peso e tração devem ser maiores que zero."
    });
  }

  // 2. Limite de Engenharia: Vão máximo (Ex: 200m para redes urbanas)
  if (vão > 200) {
    return res.status(400).json({
      erro: "Vão excessivo",
      mensagem: "O vão informado excede o limite de segurança para este cálculo (200m)."
    });
  }

  // Se passar por tudo, segue para o cálculo
  next();
};

router.post('/calcular', validarTracao, (req, res) => {
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
