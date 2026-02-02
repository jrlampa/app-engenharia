const { db } = require('../db/client');
const { projects, historicoCalculos } = require('../db/schema');
const { eq, desc } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Gestão de Projectos (v0.2.8).
 * Centraliza a lógica de negócios para projetos de engenharia.
 */
class ProjectService {
  /**
   * Cria um novo projeto e retorna o registro criado.
   * @param {object} data { name, description, client, location }
   */
  static async createProject(data) {
    try {
      if (!data.name) throw new Error("Nome do projeto é obrigatório.");

      const [newProject] = await db.insert(projects)
        .values({
          name: data.name,
          description: data.description || '',
          client: data.client || '',
          location: data.location || ''
        })
        .returning()
        .execute();

      logger.info(`Projeto criado com sucesso: ${newProject.name} (ID: ${newProject.id})`);
      return newProject;
    } catch (error) {
      logger.error(`Erro ao criar projeto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todos os projetos, ordenados pelos mais recentes.
   */
  static async listAllProjects() {
    try {
      return await db.select()
        .from(projects)
        .orderBy(desc(projects.createdAt))
        .execute();
    } catch (error) {
      logger.error(`Erro ao listar projetos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove um projeto e, via cascade delete, todos os seus cálculos.
   */
  static async deleteProject(id) {
    try {
      // Drizzle/SQLite com FK cascade tratará dos filhos automaticamente,
      // mas é boa prática no código verificar existência primeiro.
      const deleted = await db.delete(projects)
        .where(eq(projects.id, parseInt(id)))
        .returning()
        .execute();

      if (deleted.length > 0) {
        logger.info(`Projeto #${id} e seus dados associados foram removidos.`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Erro ao deletar projeto #${id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ProjectService;
