const express = require('express');
const cors = require('cors');
// Middleware de Logs e Validação
const logger = require('./utils/logger');
const { tracaoSchema, tensaoSchema, validate } = require('./utils/validation');

// Services
const { buscarMateriaisNoCSV } = require('./services/MaterialService');
const { calcularTracao, calcularQuedaTensao } = require('./services/calcService');

const app = express();
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { body: req.body });
  next();
});

// Wrapper Global para evitar crash
process.on('uncaughtException', (err) => {
  logger.error(`FATAL ERROR: ${err.message}`, { stack: err.stack });
  // Não encerra abruptamente, tenta manter o estado
});

// --- ROTAS ---

app.post('/api/tracao/calcular', validate(tracaoSchema), async (req, res) => {
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

/**
 * DOCUMENTAÇÃO: Cálculo de Queda de Tensão
 * Baseado na norma NBR 5410 / Planilha de Queda de Tensão.
 */
app.post('/api/tensao/calcular', validate(tensaoSchema), (req, res) => {
  const { tensaoNominal, corrente, comprimento, resistenciaKm } = req.body;

  // Lógica de cálculo delegada para o Service
  const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);

  logger.info("Cálculo de queda de tensão realizado", resultado);

  res.json({
    sucesso: true,
    resultado
  });
});

app.listen(5000, () => logger.info("Backend modularizado rodando na porta 5000."));
