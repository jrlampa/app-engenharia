const fs = require('fs');
const path = require('path');
const { sqlite } = require('../db/client');
const { syncDatabase } = require('./MaterialSyncService');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Encapsula a lógica de sincronização com o banco.
 * De agora em diante, sincroniza a pasta inteira.
 */
const syncMaterialsWithDB = async () => {
  try {
    await syncDatabase();
  } catch (error) {
    logger.error('Intelligent sync failed', { error: error.message });
  }
};

/**
 * Inicializa o cache de materiais e configura o monitoramento da pasta data.
 */
const initializeMaterialsCache = async () => {
  try {
    // Sync inicial (inteligente: só faz se houver mudanças)
    await syncMaterialsWithDB();

    // Configura Watcher para mudanças dinâmicas na PASTA inteira
    if (fs.existsSync(DATA_DIR)) {
      let timeout;
      fs.watch(DATA_DIR, (eventType, filename) => {
        // Ignora mudanças em arquivos que não sejam CSV (como o calculations.db)
        if (filename && filename.endsWith('.csv')) {
          clearTimeout(timeout);
          timeout = setTimeout(async () => {
            logger.info(`Change detected in ${filename}, triggering intelligent sync...`);
            await syncMaterialsWithDB();
          }, 1000);
        }
      });
      logger.info(`Started watching data directory for CSV changes: ${path.basename(DATA_DIR)}`);
    }
  } catch (error) {
    logger.error('Failed to initialize materials cache with directory watcher', { error: error.message });
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

  const materiais = sqlite.prepare('SELECT codigo, item, qtd FROM materiais WHERE kit_name = ?')
    .all(kitNormalizado);

  if (!materiais || materiais.length === 0) {
    logger.warn(`Kit not found in DB: ${kitSugerido}`);
    throw new Error(`Kit "${kitSugerido}" não encontrado. Verifique se o CSV está atualizado.`);
  }

  return materiais;
};

/**
 * Retorna todos os kits disponíveis no banco de dados.
 */
const getAvailableKits = () => {
  try {
    const rows = sqlite.prepare('SELECT DISTINCT kit_name FROM materiais ORDER BY kit_name ASC').all();
    return rows.map(r => r.kit_name);
  } catch (error) {
    logger.error('Error listing kits from DB', { error: error.message });
    return [];
  }
};

module.exports = {
  buscarMateriaisNoCSV,
  initializeMaterialsCache,
  syncMaterialsWithDB,
  getAvailableKits
};


