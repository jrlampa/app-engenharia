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
const projectRoutes = require('./routes/projectRoutes');

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
app.use('/api/projects', projectRoutes);
app.use('/api/projects', require('./routes/reportingRoutes'));




const { checkDbIntegrity } = require('./db/health');
const SyncService = require('./services/SyncService');

// --- ERROR HANDLER (Deve ser o último) ---
app.use(errorHandler);


// Função de inicialização atômica e resiliente (v0.2.7)
async function bootstrap() {
  try {
    logger.info("Iniciando Verificação de Sistema v0.2.7...");

    // 1. Inicializa Banco e Verifica Integridade (Autocura)
    const { initializeDatabase } = require('./db/client');

    // Executa migrações
    initializeDatabase();

    // Verifica saúde dos dados
    await checkDbIntegrity();

    // 2. Sincroniza materiais (Apenas se necessário - Alta performance)
    await SyncService.syncMaterialsWithDB();

    app.listen(5000, () => {
      logger.info("Backend Blindado v0.2.7 operando na porta 5000");
    });

  } catch (error) {
    logger.error("FALHA CRÍTICA NO BOOTSTRAP: " + error.message);

    // Autocura para Corrupção de Banco (v0.2.7)
    // Se o banco estiver corrompido, removemos o arquivo para que o próximo boot o recrie do zero.
    if (error.message.includes('malformed') || error.message.includes('corrupt') || error.message.includes('file is not a database')) {
      const path = require('path');
      const fs = require('fs');
      const DB_PATH = path.join(__dirname, 'data', 'calculations.db');

      logger.warn("Detectada corrupção irreversível no banco de dados. Resetando arquivo para recuperação automática...");
      try {
        if (require('./db/client').sqlite && require('./db/client').sqlite.open) {
          require('./db/client').sqlite.close();
        }
        fs.unlinkSync(DB_PATH);
        logger.info("Arquivo de banco corrompido removido. Reinicie o aplicativo para regeneração.");
      } catch (rmError) {
        logger.error("Falha ao remover banco corrompido: " + rmError.message);
      }
    }

    process.exit(1);
  }
}


// Executa o bootstrap
bootstrap();



