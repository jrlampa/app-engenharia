const { db } = require('../db/client');
const { calculosTracao, projects } = require('../db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Geração de Relatórios Consolidados (v0.2.9).
 * Responsável por agregar dados de múltiplos cálculos em uma visão unificada para compras/orçamento.
 */
class ReportingService {
  /**
   * Gera uma lista consolidada de materiais para um projeto específico.
   * Agrega quantidades de itens idênticos provenientes de diferentes cálculos de tração.
   * 
   * @param {number} projectId - ID do projeto alvo.
   * @returns {Promise<object>} Objeto contendo o resumo do projeto e a lista consolidada.
   */
  static async generateMaterialReport(projectId) {
    try {
      // 1. Validar existência do projeto
      const project = await db.select().from(projects).where(eq(projects.id, projectId)).execute();
      if (project.length === 0) {
        throw new Error('Projeto não encontrado.');
      }

      // 2. Buscar todos os cálculos de tração do projeto
      const calculations = await db.select()
        .from(calculosTracao)
        .where(eq(calculosTracao.projectId, projectId))
        .execute();

      if (calculations.length === 0) {
        return {
          projeto: project[0],
          totalCalculos: 0,
          materiaisConsolidados: []
        };
      }

      // 3. Algoritmo de Agregação (Map/Reduce Pattern)
      const aggregationMap = new Map();

      for (const calc of calculations) {
        if (!calc.materiais) continue;

        let materiaisList;
        try {
          // O campo 'materiais' é armazenado como string JSON no SQLite
          materiaisList = JSON.parse(calc.materiais);
        } catch (e) {
          logger.warn(`Falha ao fazer parse dos materiais do cálculo #${calc.id}: ${e.message}`);
          continue;
        }

        if (!Array.isArray(materiaisList)) continue;

        for (const item of materiaisList) {
          const key = item.codigo; // Chave única é o código do material

          if (aggregationMap.has(key)) {
            const existing = aggregationMap.get(key);
            existing.quantidade += Number(item.quantidade);
            // Mantemos a descrição mais recente ou a primeira, assumindo consistência pelo código
          } else {
            aggregationMap.set(key, {
              codigo: item.codigo,
              item: item.item, // Descrição
              quantidade: Number(item.quantidade),
              unidade: 'UN' // Assumimos UN por padrão, ou poderia vir do objeto se existisse
            });
          }
        }
      }

      // 4. Transformar Map em Array ordenado
      const consolidatedList = Array.from(aggregationMap.values()).sort((a, b) => {
        return a.item.localeCompare(b.item);
      });

      logger.info(`Relatório gerado para Projeto #${projectId}: ${consolidatedList.length} itens únicos a partir de ${calculations.length} cálculos.`);

      return {
        projeto: project[0],
        totalCalculos: calculations.length,
        materiaisConsolidados: consolidatedList
      };

    } catch (error) {
      logger.error(`Erro ao gerar relatório de materiais: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ReportingService;
