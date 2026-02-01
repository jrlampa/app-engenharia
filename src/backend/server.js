const express = require('express');
const cors = require('cors');
// Middleware de Logs e Validação
const logger = require('./utils/logger');

// Rotas
const tracaoRoutes = require('./routes/tracaoRoutes');
const tensaoRoutes = require('./routes/tensaoRoutes');
const cabosRoutes = require('./routes/cabosRoutes');

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

app.listen(5000, () => logger.info("Backend modularizado rodando na porta 5000."));
