const { db } = require('../db/client');
const { settings } = require('../db/schema');
const logger = require('../utils/logger');
const { eq } = require('drizzle-orm');

/**
 * Service de Configuração (Singleton).
 * Gerencia as preferências globais do sistema (Empresa, Logo, etc).
 */
class ConfigService {
  /**
   * Obtém as configurações atuais. Se não existir, cria o padrão.
   */
  static async getConfig() {
    try {
      const current = await db.select().from(settings).limit(1).execute();

      if (current.length === 0) {
        // Inicializa com padrão se vazio
        const [inserted] = await db.insert(settings)
          .values({}) // Usa defaults do schema
          .returning()
          .execute();
        return inserted;
      }

      return current[0];
    } catch (error) {
      logger.error(`Erro ao obter configurações: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza as configurações.
   * @param {object} data 
   */
  static async updateConfig(data) {
    try {
      // Garante que existe registro para atualizar
      let current = await this.getConfig();

      const [updated] = await db.update(settings)
        .set({
          empresaNome: data.empresaNome,
          empresaLogo: data.empresaLogo,
          corPrimaria: data.corPrimaria,
          engenheiroResponsavel: data.engenheiroResponsavel,
          updatedAt: new Date().toISOString()
        })
        .where(eq(settings.id, current.id))
        .returning()
        .execute();

      logger.info('Configurações do sistema atualizadas.');
      return updated;
    } catch (error) {
      logger.error(`Erro ao atualizar configurações: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ConfigService;
