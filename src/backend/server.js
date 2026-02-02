const express = require('express');
const cors = require('cors');
// Middleware de Logs e Validação
const logger = require('./utils/logger');

// Rotas
const tracaoRoutes = require('./routes/tracaoRoutes');
const tensaoRoutes = require('./routes/tensaoRoutes');
const cabosRoutes = require('./routes/cabosRoutes');
const historyRoutes = require('./routes/historyRoutes');
const historicoRoutes = require('./routes/historicoRoutes');

const errorHandler = require('./middleware/errorHandler');
const performanceLogger = require('./middleware/performanceLogger');

// Services (para cache warmup)
const { MaterialService } = require('./services/MaterialService');


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
app.use('/api/historico', historicoRoutes);


const { checkDbIntegrity } = require('./db/health');
const SyncService = require('./services/SyncService');

// --- ERROR HANDLER (Deve ser o último) ---
app.use(errorHandler);


// Função de inicialização atômica e resiliente (v0.2.6)
async function bootstrap() {
  try {
    logger.info("Iniciando Verificação de Sistema v0.2.6...");

    // 1. Inicializa Banco e Verifica Integridade (Autocura)
    require('./db/client');
    await checkDbIntegrity();

    // 2. Sincroniza materiais (Apenas se necessário - Alta performance)
    await SyncService.syncMaterialsWithDB();

    app.listen(5000, () => {
      logger.info("Backend Blindado operando na porta 5000");
    });

  } catch (error) {
    logger.error("FALHA CRÍTICA NO BOOTSTRAP: " + error.message);
    process.exit(1);
  }
}

// Executa o bootstrap
bootstrap();



