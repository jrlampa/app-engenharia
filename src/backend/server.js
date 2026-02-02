const express = require('express');
const cors = require('cors');
// Middleware de Logs e Validação
const logger = require('./utils/logger');

// Rotas
const tracaoRoutes = require('./routes/tracaoRoutes');
const tensaoRoutes = require('./routes/tensaoRoutes');
const cabosRoutes = require('./routes/cabosRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');
const performanceLogger = require('./middleware/performanceLogger');

// Services (para cache warmup)
const { initializeMaterialsCache } = require('./services/MaterialService');

const app = express();
app.use(cors());
app.use(express.json());

// Performance logger middleware (must be registered early)
app.use(performanceLogger);

// Wrapper Global para evitar crash
process.on('uncaughtException', (err) => {
  logger.error(`FATAL ERROR: ${err.message}`, { stack: err.stack });
});

// --- ROTAS ---
app.use('/api', tracaoRoutes);
app.use('/api', tensaoRoutes);
app.use('/api', cabosRoutes);
app.use('/api', historyRoutes);

// --- ERROR HANDLER (Deve ser o último) ---
app.use(errorHandler);


// Função de inicialização e automação no boot
async function bootstrap() {
  try {
    logger.info("Iniciando verificação de integridade de dados...");

    // 1. Inicializa Banco de Dados e Migrações
    require('./db/client');

    // 2. Sincronização Inteligente CSV -> SQLite (Cache Warmup + Watcher)
    await initializeMaterialsCache();

    logger.info("Base de dados de materiais atualizada.");

    // 3. Inicia o Servidor
    app.listen(5000, () => {
      logger.info("Backend modularizado rodando na porta 5000 (cache ativo).");
    });

  } catch (error) {
    logger.error("Falha na sincronização inicial / Boot fail: " + error.message);
    process.exit(1);
  }
}

// Executa o gatilho de boot
bootstrap();

