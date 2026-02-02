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


// Função de inicialização atômica no boot
async function startServer() {
  try {
    logger.info("Iniciando bootstrap do sistema...");

    // 1. Inicializa Banco de Dados e Migrações
    require('./db/client');

    // 2. Sincroniza CSV com SQLite no boot (Garante integridade antes de aceitar conexões)
    await initializeMaterialsCache();

    app.listen(5000, () => {
      logger.info("Backend de Engenharia v0.2.4 operando na porta 5000");
    });

  } catch (error) {
    logger.error("Falha crítica no bootstrap: " + error.message);
    process.exit(1);
  }
}

// Executa o servidor
startServer();


