const fs = require('fs');
const path = require('path');
const { sqlite } = require('../db/client');
const { syncMaterialsFromCSV } = require('./MaterialSyncService');
const logger = require('../utils/logger');

const CSV_PATH = path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

/**
 * Encapsula a lógica de sincronização com o banco.
 */
const syncMaterialsWithDB = async (caminho = null) => {
  try {
    await syncMaterialsFromCSV(caminho || CSV_PATH);
    logger.info('Dynamic sync performed successfully');
  } catch (error) {
    logger.error('Dynamic sync failed', { error: error.message });
  }
};

/**
 * Inicializa o cache de materiais e configura o monitoramento do CSV.
 */
const initializeMaterialsCache = async () => {
  try {
    // Sync inicial
    await syncMaterialsWithDB();

    // Configura Watcher para mudanças dinâmicas
    if (fs.existsSync(CSV_PATH)) {
      let timeout;
      fs.watch(CSV_PATH, (eventType) => {
        if (eventType === 'change') {
          // Debounce de 1 segundo para evitar múltiplas leituras durante gravação
          clearTimeout(timeout);
          timeout = setTimeout(async () => {
            logger.info('CSV change detected, triggering sync...');
            await syncMaterialsWithDB();
          }, 1000);
        }
      });
      logger.info(`Started watching CSV for changes: ${path.basename(CSV_PATH)}`);
    }
  } catch (error) {
    logger.error('Failed to initialize materials cache with watcher', { error: error.message });
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


