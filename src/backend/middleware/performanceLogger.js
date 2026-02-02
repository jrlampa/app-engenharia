const logger = require('../utils/logger');

/**
 * Middleware para medir e registrar o tempo de execução de cada requisição.
 */
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);

    logger.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${timeInMs}ms`, {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: parseFloat(timeInMs)
    });
  });

  next();
};

module.exports = performanceLogger;
