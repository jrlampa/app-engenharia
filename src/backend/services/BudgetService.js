const { db } = require('../db/client');
const { materiais } = require('../db/schema');
const ReportingService = require('./ReportingService');
const { eq, sql } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Orçamentação e Gestão de Custos (v0.3.4).
 * Calcula valores financeiros baseados em materiais e quantidades.
 */
class BudgetService {
  /**
   * Calcula o orçamento total de um projeto.
   * @param {number} projectId
   * @returns {Promise<object>} Orçamento detalhado
   */
  static async calculateProjectBudget(projectId) {
    try {
      // 1. Obter lista consolidada de materiais do projeto
      const report = await ReportingService.generateMaterialReport(projectId);
      const { projeto, materiaisConsolidados } = report;

      // 2. Para cada material, buscar preço unitário
      const budgetItems = [];
      let totalGeral = 0;

      for (const mat of materiaisConsolidados) {
        // Buscar preço do material pelo código
        const materialData = await db.select()
          .from(materiais)
          .where(eq(materiais.codigo, mat.codigo))
          .limit(1)
          .execute();

        const precoUnit = materialData.length > 0 && materialData[0].precoUnitario
          ? parseFloat(materialData[0].precoUnitario)
          : 0;

        const moeda = materialData.length > 0 && materialData[0].moeda
          ? materialData[0].moeda
          : 'EUR';

        const subtotal = parseFloat((mat.quantidade * precoUnit).toFixed(2)); // Precisão decimal

        budgetItems.push({
          codigo: mat.codigo,
          item: mat.item,
          quantidade: mat.quantidade,
          precoUnitario: precoUnit,
          moeda: moeda,
          subtotal: subtotal
        });

        totalGeral += subtotal;
      }

      // 3. Arredondar total final
      totalGeral = parseFloat(totalGeral.toFixed(2));

      logger.info(`Orçamento calculado para Projeto #${projectId}: ${totalGeral} EUR`);

      return {
        projeto: projeto,
        moeda: 'EUR',
        items: budgetItems,
        totalGeral: totalGeral,
        totalItems: budgetItems.length
      };

    } catch (error) {
      logger.error(`Erro ao calcular orçamento: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BudgetService;
