const { db } = require('../db/client');
const { clients, projects } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Gestão de Clientes (CRM) - v0.3.3
 */
class ClientService {
  /**
   * Cria um novo cliente.
   * @param {object} data
   */
  static async createClient(data) {
    try {
      if (!data.name) throw new Error("Nome do cliente é obrigatório.");

      const [newClient] = await db.insert(clients)
        .values({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          notes: data.notes || null
        })
        .returning()
        .execute();

      logger.info(`Cliente criado: ${newClient.name} (ID: ${newClient.id})`);
      return newClient;
    } catch (error) {
      logger.error(`Erro ao criar cliente: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna todos os clientes.
   */
  static async listClients() {
    return await db.select().from(clients).execute();
  }

  /**
   * Retorna estatísticas comerciais do cliente.
   * @param {number} clientId
   */
  static async getClientStats(clientId) {
    try {
      // Conta quantos projetos esse cliente tem
      const result = await db.select({ count: sql`count(*)` })
        .from(projects)
        .where(eq(projects.clientId, clientId))
        .execute();

      return {
        totalProjects: result[0].count
      };
    } catch (error) {
      logger.error(`Erro ao obter estatísticas do cliente: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ClientService;
