const { db } = require('../db/client');
const { calculosTracao, calculosTensao } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Analytics e Business Intelligence (v0.3.0).
 * Extrai insights de valor agregado a partir dos dados brutos.
 */
class AnalyticsService {
  /**
   * Calcula KPIs do projeto.
   * @param {number} projectId 
   */
  static async getProjectKPIs(projectId) {
    try {
      // KPIs de Tensão
      const tensaoData = await db.select({
        count: sql`count(*)`,
        criticos: sql`sum(case when status = 'CRÍTICO' then 1 else 0 end)`
      })
        .from(calculosTensao)
        .where(eq(calculosTensao.projectId, projectId))
        .execute();

      const totalTensao = tensaoData[0].count;
      const totalCriticos = tensaoData[0].criticos || 0;
      const saudeEletrica = totalTensao > 0
        ? ((1 - (totalCriticos / totalTensao)) * 100).toFixed(1)
        : 100;

      // KPIs de Tração (Totais)
      const tracaoData = await db.select({ count: sql`count(*)` })
        .from(calculosTracao)
        .where(eq(calculosTracao.projectId, projectId))
        .execute();

      return {
        totalCalculos: Number(totalTensao) + Number(tracaoData[0].count),
        tensao: {
          total: Number(totalTensao),
          criticos: Number(totalCriticos),
          saudeIndex: Number(saudeEletrica) // Índice de "Saúde" do projeto (0-100)
        },
        tracao: {
          total: Number(tracaoData[0].count)
        }
      };

    } catch (error) {
      logger.error(`Erro ao calcular KPIs: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
