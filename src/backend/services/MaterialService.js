const fs = require('fs');
const path = require('path');
const { sqlite } = require('../db/client');
const SyncService = require('./SyncService');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Inicializa o cache de materiais e configura o monitoramento da pasta data.
 */
const initializeMaterialsCache = async () => {
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
};

/**
 * Busca materiais no banco de dados SQLite.
 */
const buscarMateriaisNoCSV = async (kitSugerido) => {
  if (!kitSugerido || typeof kitSugerido !== 'string') {
    throw new Error("Nome do kit inválido.");
  }

  const kitNormalizado = kitSugerido.trim();

  const materiais = sqlite.prepare('SELECT codigo, item, quantidade FROM materiais WHERE kit_nome = ?')
    .all(kitNormalizado);

  if (!materiais || materiais.length === 0) {
    logger.warn(`Kit não encontrado no banco: ${kitSugerido}`);
    throw new Error(`Kit "${kitSugerido}" não encontrado. Verifique se o CSV está atualizado.`);
  }

  return materiais;
};

/**
 * Retorna todos os kits disponíveis no banco de dados.
 */
const getAvailableKits = () => {
  try {
    const rows = sqlite.prepare('SELECT DISTINCT kit_nome FROM materiais ORDER BY kit_nome ASC').all();
    return rows.map(r => r.kit_nome);
  } catch (error) {
    logger.error('Erro ao listar kits do banco', { error: error.message });
    return [];
  }
};

module.exports = {
  buscarMateriaisNoCSV,
  initializeMaterialsCache,
  getAvailableKits
};
