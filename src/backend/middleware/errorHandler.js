const logger = require('../utils/logger');
const { ZodError } = require('zod');

/**
 * Middleware global de tratamento de erros.
 * Captura exceções lançadas nas rotas/controllers e padroniza a resposta.
 */
const errorHandler = (err, req, res, next) => {
  // Loga o erro com detalhes para debugging
  logger.error(`Error specialized handler: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Caso seja um erro de validação do Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      sucesso: false,
      error: 'Erro de validação nos dados de entrada',
      detalhes: (err.issues || []).map(e => ({
        campo: e.path.join('.'),
        mensagem: e.message
      }))
    });
  }

  // Caso seja um erro de banco de dados do better-sqlite3
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      sucesso: false,
      error: 'Erro interno no banco de dados',
      code: err.code
    });
  }

  // Erro genérico/inesperado
  const statusCode = err.status || 500;
  const message = statusCode === 500
    ? "Ocorreu um erro interno no servidor. Tente novamente mais tarde."
    : err.message;

  res.status(statusCode).json({
    sucesso: false,
    error: message,
    code: statusCode
  });
};

module.exports = errorHandler;
