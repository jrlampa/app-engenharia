const express = require('express');
const cors = require('cors');
// Middleware de Logs e Validação
const logger = require('./utils/logger');

// Rotas
const tracaoRoutes = require('./routes/tracaoRoutes');
const tensaoRoutes = require('./routes/tensaoRoutes');
const cabosRoutes = require('./routes/cabosRoutes');

// Services (para cache warmup)
const { initializeMaterialsCache } = require('./services/MaterialService');

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
app.use('/api', tracaoRoutes);
app.use('/api', tensaoRoutes);
app.use('/api', cabosRoutes);

// Inicialização assíncrona do servidor
(async () => {
  try {
    // Warmup: Constrói o índice de materiais antes de aceitar requisições
    logger.info('Warming up materials cache...');
    await initializeMaterialsCache();

    // Inicia o servidor
    app.listen(5000, () => logger.info("Backend modularizado rodando na porta 5000 (cache ativo)."));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
})();
