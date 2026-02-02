/**
 * Utilitário para envolver funções assíncronas e capturar erros automaticamente,
 * encaminhando-os para o middleware de tratamento de erro global.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
