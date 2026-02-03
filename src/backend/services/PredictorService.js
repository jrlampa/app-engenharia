const logger = require('../utils/logger');
const BudgetService = require('./BudgetService');
const PriceHistoryService = require('./PriceHistoryService');

/**
 * DOCUMENTAÇÃO: PredictorService v0.3.8.
 * Camada de Inteligência Preditiva.
 * Identifica riscos financeiros e tendências de margem baseadas no histórico.
 */
class PredictorService {
  /**
   * Calcula o Delta de Margem de um projeto.
   * Compara o custo orçado inicial com o custo atual baseado na inflação de materiais.
   * @param {number} projectId 
   */
  static async calculateMarginDelta(projectId) {
    try {
      logger.info(`Analisando risco financeiro para Projeto #${projectId}`);

      const budget = await BudgetService.calculateProjectBudget(projectId);
      let custoInflacionado = 0;
      let houveVariacao = false;

      // Analisa o histórico de cada material no projeto
      for (const item of budget.items) {
        // Mock de detecção de variação: Se o preço novo no histórico for maior que o preço unitário do orçamento
        // Na prática, consultaríamos PriceHistoryService.getPriceTrends(materialId)
        // placeholder logic:
        const tendencia = await PriceHistoryService.getPriceTrends(item.id);
        const precoMaisRecente = tendencia.length > 0 ? tendencia[0].precoNovo : item.precoUnitario;

        if (precoMaisRecente > item.precoUnitario) houveVariacao = true;
        custoInflacionado += precoMaisRecente * item.quantidade;
      }

      const delta = custoInflacionado - budget.totalGeral;
      const percentualRisco = (delta / budget.totalGeral) * 100;

      let status = 'SAUDAVEL';
      if (percentualRisco > 10) status = 'ALERTA';
      if (percentualRisco > 5 && percentualRisco <= 10) status = 'RISCO';

      return {
        projectId,
        custoOriginal: budget.totalGeral,
        custoProjetado: custoInflacionado,
        deltaAbsoluto: parseFloat(delta.toFixed(2)),
        percentualRisco: percentualRisco.toFixed(1) + '%',
        status,
        mensagem: status === 'SAUDAVEL' ?
          "Margem preservada conforme histórico." :
          `Atenção: Aumento de custo detectado via histórico de preços (${percentualRisco.toFixed(1)}%).`
      };
    } catch (error) {
      logger.error(`Erro na predição de margem: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PredictorService;
