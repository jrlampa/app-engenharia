const { sqlite } = require('../db/client');
const { syncMaterialsFromCSV } = require('./MaterialSyncService');
const logger = require('../utils/logger');

/**
 * Inicializa o cache de materiais (chamado na startup do servidor).
 * Delega a sincronização para o MaterialSyncService.
 * 
 * @param {string|null} caminhoArquivo - Caminho customizado do CSV (para testes)
 */
const initializeMaterialsCache = async (caminhoArquivo = null) => {
  try {
    await syncMaterialsFromCSV(caminhoArquivo);
  } catch (error) {
    logger.error('Failed to initialize materials cache in DB', { error: error.message });
    throw error;
  }
};

/**
 * Busca materiais no banco de dados SQLite.
 * 
 * @param {string} kitSugerido - Nome do kit (ex: "CE2 BRAÇO J")
 * @returns {Promise<Array>} Lista de materiais
 */
const buscarMateriaisNoCSV = async (kitSugerido) => {
  if (!kitSugerido || typeof kitSugerido !== 'string') {
    throw new Error("Nome do kit inválido.");
  }

  const kitNormalizado = kitSugerido.trim();

  try {
    const materiais = sqlite.prepare('SELECT codigo, item, qtd FROM materiais WHERE kit_name = ?')
      .all(kitNormalizado);

    if (!materiais || materiais.length === 0) {
      logger.warn(`Kit not found in DB: ${kitSugerido}`);
      throw new Error(`Kit "${kitSugerido}" não encontrado no banco de dados. Verifique o nome do kit.`);
    }

    return materiais;
  } catch (error) {
    logger.error('Error fetching materials from DB', { error: error.message, kit: kitSugerido });
    throw error;
  }
};

/**
 * Retorna todos os kits disponíveis no banco de dados.
 * 
 * @returns {Array<string>} Lista de nomes de kits
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
  getAvailableKits
};

