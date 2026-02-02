const { calcularTracao: calcularFlecha } = require('../services/CalculationService');
const { MaterialService } = require('../services/MaterialService');

const HistoryService = require('../services/HistoryService');

const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

/**
 * DOCUMENTAÇÃO: Controller de Tração.
 * Centraliza validação, cálculo e busca de materiais com persistência.
 * 
 * Orquestração:
 * 1. Recebe dados validados pelo middleware de rota.
 * 2. Executa cálculo de flecha (Service Layer).
 * 3. Busca materiais recomendados (Data Layer).
 * 4. Persiste no histórico (Persistence Layer).
 */
const calcularTracaoController = asyncHandler(async (req, res) => {
  const { vao, pesoCabo, tracaoInicial } = req.body;
  const { projectId } = req.query;

  // 1. Cálculo (Service Layer)
  const resultadoCalculo = calcularFlecha(vao, pesoCabo, tracaoInicial);

  // 2. Busca de Materiais (Drizzle ORM / SQLite)
  const materiais = await MaterialService.getMaterialsForKit(resultadoCalculo.sugestao);


  const resultadoFinal = { ...resultadoCalculo, materiais };

  // 3. Persistência em background (não bloqueia a resposta ao utilizador)
  HistoryService.salvarCalculo('TRACAO', req.body, resultadoFinal, projectId)
    .catch(err => logger.error(`Erro ao salvar histórico em background: ${err.message}`));


  // 4. Auditoria de Performance e Log
  logger.info(`Cálculo de tração realizado: Vão ${vao}m, Sugestão: ${resultadoCalculo.sugestao}`);

  res.json({
    sucesso: true,
    resultado: resultadoFinal
  });
});

module.exports = { calcularTracaoController };


