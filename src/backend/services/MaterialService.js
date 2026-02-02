const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const logger = require('../utils/logger');

/**
 * Cache em memória para materiais indexados por kit
 * Estrutura: { "CE2 BRAÇO J": [...materiais], "CE3 BRAÇO J": [...materiais] }
 */
let materiaisCache = null;

/**
 * Constrói o índice de materiais a partir do CSV.
 * Executa uma única vez na inicialização do servidor.
 * 
 * @param {string|null} caminhoArquivo - Caminho customizado do CSV (para testes)
 * @returns {Promise<Object>} Índice de materiais por kit
 */
const buildMaterialsIndex = (caminhoArquivo = null) => {
  return new Promise((resolve, reject) => {
    const index = {};
    let currentKit = null;
    const caminhoCSV = caminhoArquivo || path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

    if (!fs.existsSync(caminhoCSV)) {
      logger.error(`CSV file not found at: ${caminhoCSV}`);
      return reject(new Error("Banco de dados de materiais não encontrado."));
    }

    logger.info(`Building materials index from: ${caminhoCSV}`);

    fs.createReadStream(caminhoCSV)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        const col1 = row[1] ? row[1].trim() : "";
        const col2 = row[2] ? row[2].trim() : "";
        const col3 = row[3] ? row[3].trim() : "";

        // Detecta início de novo kit (nome do kit aparece na coluna 1)
        if (col1 && col1.includes('BRAÇO J') && !col2) {
          currentKit = col1;
          index[currentKit] = [];
          return;
        }

        // Adiciona material ao kit atual
        if (currentKit && col1 && col2) {
          index[currentKit].push({
            codigo: col1,
            item: col2,
            qtd: col3 || "1"
          });
        }
      })
      .on('end', () => {
        const kitsCount = Object.keys(index).length;
        const materialsCount = Object.values(index).reduce((sum, arr) => sum + arr.length, 0);
        logger.info(`Materials index built: ${kitsCount} kits, ${materialsCount} total materials`);
        resolve(index);
      })
      .on('error', (err) => {
        logger.error(`Error building materials index: ${err.message}`);
        reject(new Error(`Erro ao ler arquivo CSV: ${err.message}`));
      });
  });
};

/**
 * Inicializa o cache de materiais (chamado na startup do servidor).
 * Tenta carregar de arquivo JSON persistido. Se não existir ou estiver desatualizado,
 * rebuild do CSV e persiste.
 * 
 * @param {string|null} caminhoArquivo - Caminho customizado do CSV (para testes)
 */
const initializeMaterialsCache = async (caminhoArquivo = null) => {
  const caminhoCSV = caminhoArquivo || path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');
  const cacheFilePath = path.join(__dirname, '../data', 'materials-cache.json');

  try {
    // Verifica se cache existe e é mais recente que o CSV
    if (fs.existsSync(cacheFilePath) && fs.existsSync(caminhoCSV)) {
      const cacheStats = fs.statSync(cacheFilePath);
      const csvStats = fs.statSync(caminhoCSV);

      // Se cache é mais recente que CSV, carrega do cache
      if (cacheStats.mtimeMs > csvStats.mtimeMs) {
        const cacheData = fs.readFileSync(cacheFilePath, 'utf8');
        materiaisCache = JSON.parse(cacheData);

        const kitsCount = Object.keys(materiaisCache).length;
        const materialsCount = Object.values(materiaisCache).reduce((sum, arr) => sum + arr.length, 0);

        logger.info(`Materials cache loaded from disk: ${kitsCount} kits, ${materialsCount} materials (instant)`);
        return;
      } else {
        logger.info('CSV is newer than cache, rebuilding...');
      }
    }

    // Build cache do CSV
    materiaisCache = await buildMaterialsIndex(caminhoArquivo);

    // Persiste cache em JSON
    fs.writeFileSync(cacheFilePath, JSON.stringify(materiaisCache, null, 2), 'utf8');
    logger.info('Materials cache built from CSV and persisted to disk');

  } catch (error) {
    logger.error('Failed to initialize materials cache', { error: error.message });
    throw error;
  }
};

/**
 * Busca materiais no cache indexado (O(1) lookup).
 * 
 * @param {string} kitSugerido - Nome do kit (ex: "CE2 BRAÇO J")
 * @returns {Promise<Array>} Lista de materiais
 * @throws {Error} Se o cache não foi inicializado ou kit não encontrado
 */
const buscarMateriaisNoCSV = async (kitSugerido) => {
  // Validação de entrada
  if (!kitSugerido || typeof kitSugerido !== 'string') {
    throw new Error("Nome do kit inválido.");
  }

  // Verifica se o cache foi inicializado
  if (!materiaisCache) {
    logger.error('Materials cache not initialized');
    throw new Error("Cache de materiais não inicializado. Reinicie o servidor.");
  }

  const kitNormalizado = kitSugerido.trim();

  // Busca O(1) no índice
  const materiais = materiaisCache[kitNormalizado];

  if (!materiais) {
    logger.warn(`Kit not found in cache: ${kitSugerido}`);
    throw new Error(`Kit "${kitSugerido}" não encontrado no banco de dados. Verifique o nome do kit.`);
  }

  if (materiais.length === 0) {
    logger.warn(`Kit found but empty: ${kitSugerido}`);
  }

  return materiais;
};

/**
 * Retorna todos os kits disponíveis no cache.
 * 
 * @returns {Array<string>} Lista de nomes de kits
 */
const getAvailableKits = () => {
  if (!materiaisCache) {
    return [];
  }
  return Object.keys(materiaisCache);
};

module.exports = {
  buscarMateriaisNoCSV,
  initializeMaterialsCache,
  getAvailableKits,
  // Exporta buildMaterialsIndex apenas para testes
  __buildMaterialsIndex: buildMaterialsIndex
};
