const { db, sqlite } = require('../db/client');
const { projects, historicoCalculos } = require('../db/schema');
const { eq, desc } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * DOCUMENTAÇÃO: Serviço de persistência de histórico.
 * Armazena inputs e outputs de cálculos para auditoria e reuso.
 * Implementa padrão de classe estática (v0.2.4).
 */
class HistoryService {
  /**
   * Cria um novo projeto.
   */
  static async createProject(name, description = null, client = null, location = null) {
    try {
      const result = await db.insert(projects).values({
        name,
        description,
        client,
        location
      }).returning({ id: projects.id });

      const projectId = result[0].id;
      logger.info(`Projeto criado: #${projectId} - ${name}`);
      return projectId;
    } catch (error) {
      logger.error('Falha ao criar projeto', { error: error.message });
      throw error;
    }
  }

  /**
   * Lista todos os projetos.
   */
  static async listAllProjects() {
    try {
      return await db.select()
        .from(projects)
        .orderBy(desc(projects.createdAt));
    } catch (error) {
      logger.error('Falha ao listar projetos', { error: error.message });
      throw error;
    }
  }

  /**
   * Registra um cálculo no histórico.
   * @param {string} tipo - 'TRACAO' ou 'TENSAO'
   * @param {object} inputs - Parâmetros de entrada
   * @param {object} resultados - Resultados gerados
   * @param {number|null} projectId - ID do projeto (opcional)
   */
  static async salvarCalculo(tipo, inputs, resultados, projectId = null) {
    try {
      // Inserção via Drizzle ORM
      await db.insert(historicoCalculos).values({
        projectId: projectId ? parseInt(projectId) : null,
        tipo,
        inputs: JSON.stringify(inputs),
        resultados: JSON.stringify(resultados),
        data_execucao: new Date().toISOString()
      }).execute();

      logger.info(`Cálculo de ${tipo} persistido no histórico.`);
    } catch (error) {
      logger.error(`Erro ao salvar histórico: ${error.message}`);
      // Lançamos o erro para que o controller possa tratar se necessário, 
      // embora persistência de histórico geralmente seja "non-blocking" para o usuário.
      throw error;
    }
  }

  /**
   * Lista o histórico completo, ordenado por data descendente.
   */
  static async listarHistorico() {
    try {
      const rows = await db.select()
        .from(historicoCalculos)
        .orderBy(desc(historicoCalculos.id));

      return rows.map(row => ({
        ...row,
        inputs: JSON.parse(row.inputs),
        resultados: JSON.parse(row.resultados)
      }));
    } catch (error) {
      logger.error(`Erro ao listar histórico: ${error.message}`);
      return [];
    }
  }

  /**
   * Lista histórico de um projeto específico.
   */
  static async listarPorProjeto(projectId) {
    try {
      const rows = await db.select()
        .from(historicoCalculos)
        .where(eq(historicoCalculos.projectId, parseInt(projectId)))
        .orderBy(desc(historicoCalculos.id));

      return rows.map(row => ({
        ...row,
        inputs: JSON.parse(row.inputs),
        resultados: JSON.parse(row.resultados)
      }));
    } catch (error) {
      logger.error(`Erro ao listar histórico do projeto ${projectId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Métodos legados mantidos para compatibilidade temporária (v0.2.3)
   */
  static async saveCalculoTracao(projectId, dados, resultado) {
    return this.salvarCalculo('TRACAO', dados, resultado, projectId);
  }

  static async saveCalculoTensao(projectId, dados, resultado) {
    return this.salvarCalculo('TENSAO', dados, resultado, projectId);
  }
}

module.exports = HistoryService;
