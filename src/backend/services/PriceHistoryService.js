const { db } = require('../db/client');
const { historicoPrecos } = require('../db/schema');
const { eq, desc } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Rastreabilidade de Preços (v0.3.5).
 */
class PriceHistoryService {
  /**
   * Registra uma alteração de preço.
   * @param {number} materialId 
   * @param {number|null} oldPrice 
   * @param {number} newPrice 
   */
  static async recordPriceChange(materialId, oldPrice, newPrice) {
    try {
      if (oldPrice === newPrice) return;

      await db.insert(historicoPrecos)
        .values({
          materialId,
          precoAntigo: oldPrice,
          precoNovo: newPrice
        })
        .execute();

      logger.info(`Alteração de preço registrada para material #${materialId}: ${oldPrice} -> ${newPrice}`);
    } catch (error) {
      logger.error(`Erro ao registrar histórico de preço: ${error.message}`);
    }
  }

  /**
   * Retorna a tendência de preço de um material específico.
   * @param {number} materialId 
   */
  static async getPriceTrends(materialId) {
    try {
      return await db.select()
        .from(historicoPrecos)
        .where(eq(historicoPrecos.materialId, materialId))
        .orderBy(desc(historicoPrecos.dataAlteracao))
        .execute();
    } catch (error) {
      logger.error(`Erro ao obter tendências de preço: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PriceHistoryService;
