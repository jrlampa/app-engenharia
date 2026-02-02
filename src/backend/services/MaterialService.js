const fs = require('fs');
const path = require('path');
const { db, sqlite } = require('../db/client');
const { materiais } = require('../db/schema');
const { eq, asc } = require('drizzle-orm');
const SyncService = require('./SyncService');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * DOCUMENTAÇÃO: Serviço de Materiais.
 * Gerencia a consulta de materiais no SQLite e a inicialização do cache.
 */
class MaterialService {
  /**
   * Inicializa o cache de materiais e configura o monitoramento da pasta data.
   */
  static async initializeMaterialsCache() {
    try {
      // Sincroniza no boot (inteligente: baseado no hash mtime)
      await SyncService.syncMaterialsWithDB();

      // Configura Watcher para mudanças dinâmicas na PASTA inteira
      if (fs.existsSync(DATA_DIR)) {
        let timeout;
        fs.watch(DATA_DIR, (eventType, filename) => {
          if (filename && filename.endsWith('.csv')) {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
              logger.info(`Mudança detectada em ${filename}, sincronizando...`);
              await SyncService.syncMaterialsWithDB();
            }, 1000);
          }
        });
        logger.info(`Monitorando alterações em: ${path.basename(DATA_DIR)}`);
      }
    } catch (error) {
      logger.error('Erro ao inicializar cache de materiais', { error: error.message });
      throw error;
    }
  }

  /**
   * Busca materiais diretamente do SQLite (Performance O(1) via índices).
   * @param {string} kitNome - Nome do kit para buscar materiais.
   */
  static async getMaterialsForKit(kitNome) {
    if (!kitNome || typeof kitNome !== 'string') {
      throw new Error("Nome do kit inválido.");
    }

    const kitNormalizado = kitNome.trim();

    // Consulta via Drizzle ORM
    const results = await db.select({
      codigo: materiais.codigo,
      item: materiais.item,
      quantidade: materiais.quantidade
    })
      .from(materiais)
      .where(eq(materiais.kit_nome, kitNormalizado));

    if (!results || results.length === 0) {
      logger.warn(`Kit não encontrado no banco: ${kitNome}`);
      throw new Error(`Kit "${kitNome}" não encontrado. Verifique se o CSV está atualizado.`);
    }

    return results;
  }

  /**
   * Retorna todos os kits disponíveis no banco de dados.
   */
  static async getAvailableKits() {
    try {
      const rows = await db.selectDistinct({
        kit_nome: materiais.kit_nome
      })
        .from(materiais)
        .orderBy(asc(materiais.kit_nome));

      return rows.map(r => r.kit_nome);
    } catch (error) {
      logger.error('Erro ao listar kits do banco', { error: error.message });
      return [];
    }
  }
}

module.exports = { MaterialService };

