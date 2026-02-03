const BudgetService = require('./BudgetService');
const logger = require('../utils/logger');

/**
 * Service para Análise de Rendimento e Variância (v0.3.6).
 * Compara o custo real/orçado com metas de otimização (ROI).
 */
class YieldService {
  /**
   * Calcula a variância entre o orçamento atual e o "Projeto Ideal" (meta).
   * @param {number} projectId 
   */
  static async calculateVariance(projectId) {
    try {
      const budget = await BudgetService.calculateProjectBudget(projectId);

      // Simulação de meta de engenharia: O projeto "Ideal" custaria 5% menos (exemplo)
      const targetSavingsRate = 0.05;
      const idealCost = budget.totalGeral * (1 - targetSavingsRate);
      const variance = budget.totalGeral - idealCost;

      logger.info(`Análise de Variância concluída para Projeto #${projectId}. Desperdício estimado: R$ ${variance.toFixed(2)}`);

      return {
        totalReal: budget.totalGeral,
        totalIdeal: parseFloat(idealCost.toFixed(2)),
        varianciaAbsoluta: parseFloat(variance.toFixed(2)),
        percentualDesperdicio: (targetSavingsRate * 100).toFixed(1) + '%',
        sugestao: "Considere revisar o uso de conectores e sobras técnicos para atingir a meta ideal."
      };
    } catch (error) {
      logger.error(`Erro na análise de variância: ${error.message}`);
      throw error;
    }
  }
}

module.exports = YieldService;
