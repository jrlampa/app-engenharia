const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * DOCUMENTAÇÃO: Middleware de Tratamento de Erros e Sanitização.
 * Atende ao "The Security Mandate" e "Error Handling Standards" do rules.txt.
 */
const logger = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

app.use((req, res, next) => {
  // Sanitização básica: remove caracteres que podem injetar comandos
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[;$]/g, "");
      }
    }
  }
  next();
});

// Wrapper Global para evitar crash com Stack Trace visível
process.on('uncaughtException', (err) => {
  logger(`FATAL ERROR: ${err.message}`);
  // Não encerra abruptamente, tenta manter o estado
});

// Função auxiliar para ler CSV
const buscarMateriaisNoCSV = (kitSugerido) => {
  return new Promise((resolve) => {
    const resultados = [];
    let capturando = false;
    const caminhoCSV = path.join(__dirname, 'data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

    // Check if file exists before creating stream to avoid errors
    if (!fs.existsSync(caminhoCSV)) {
      console.error(`CSV file not found at: ${caminhoCSV}`);
      return resolve([]);
    }

    fs.createReadStream(caminhoCSV)
      .pipe(csv({ headers: false })) // Lemos sem cabeçalho fixo pois o arquivo é dinâmico
      .on('data', (row) => {
        const colunaIdentificador = row[1]; // Coluna B do Excel
        const descricao = row[2];          // Coluna C do Excel
        const quantidade = row[3];         // Coluna D do Excel

        // Se achou o título do Kit (ex: CE2 BRAÇO J), começa a capturar
        if (colunaIdentificador === kitSugerido) {
          capturando = true;
          return;
        }

        // Se encontrou outra linha de título ou linha vazia, para de capturar
        if (capturando && (!colunaIdentificador || (colunaIdentificador.includes('BRAÇO J') && colunaIdentificador !== kitSugerido))) {
          capturando = false;
        }

        if (capturando && colunaIdentificador) {
          resultados.push({
            codigo: colunaIdentificador,
            item: descricao,
            qtd: quantidade
          });
        }
      })
      .on('end', () => resolve(resultados));
  });
};

app.post('/api/tracao/calcular', async (req, res) => {
  const { vao, pesoCabo, tracaoInicial } = req.body;
  const flecha = (pesoCabo * Math.pow(vao, 2)) / (8 * tracaoInicial);

  const sugestaoKit = flecha > 1.5 ? "CE3 BRAÇO J" : "CE2 BRAÇO J";

  // CHAMADA REAL AO CSV
  const materiais = await buscarMateriaisNoCSV(sugestaoKit);

  res.json({
    sucesso: true,
    resultado: {
      flecha: flecha.toFixed(2),
      sugestao: sugestaoKit,
      materiais: materiais // Enviando a lista para o React
    }
  });
});


/**
 * DOCUMENTAÇÃO: Cálculo de Queda de Tensão
 * Baseado na norma NBR 5410 / Planilha de Queda de Tensão.
 */
app.post('/api/tensao/calcular', (req, res) => {
  const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;

  // 1. Cálculo da queda de tensão unitária (V)
  // DeltaV = (2 * L * I * R) / 1000  (Para monofásico)
  const quedaVolts = (2 * comprimento * corrente * resistenciaKm) / 1000;

  // 2. Cálculo percentual
  const quedaPercentual = (quedaVolts / tensaoNominal) * 100;

  // Limite normativo geralmente é 5%
  const status = quedaPercentual > 5 ? "CRÍTICO" : "DENTRO DO LIMITE";

  res.json({
    sucesso: true,
    resultado: {
      quedaVolts: quedaVolts.toFixed(2),
      quedaPercentual: quedaPercentual.toFixed(2),
      status: status
    }
  });
});

app.listen(5000, () => console.log("Backend com suporte a CSV rodando."));
