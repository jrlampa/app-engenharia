const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sqlite } = require('../db/client');
const logger = require('../utils/logger');

/**
 * Sincroniza os materiais do CSV para o banco de dados se houver alterações.
 * 
 * @param {string|null} caminhoArquivo - Caminho customizado do CSV (para testes)
 * @returns {Promise<void>}
 */
const syncMaterialsFromCSV = async (caminhoArquivo = null) => {
  const caminhoCSV = caminhoArquivo || path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

  if (!fs.existsSync(caminhoCSV)) {
    logger.error(`CSV file not found for sync: ${caminhoCSV}`);
    return;
  }

  try {
    const stats = fs.statSync(caminhoCSV);
    const mtime = stats.mtimeMs.toString();

    // Verifica último sync
    const lastSync = sqlite.prepare('SELECT value FROM sync_metadata WHERE key = ?').get('csv_mtime');

    if (lastSync && lastSync.value === mtime) {
      logger.info('Materials DB is up to date with CSV (cached by mtime)');
      return;
    }

    logger.info(`CSV modified. Syncing materials to DB: ${caminhoCSV}`);

    const index = await parseCSV(caminhoCSV);

    // Inserção em transação para performance e atomicidade
    const deleteStmt = sqlite.prepare('DELETE FROM materiais');
    const insertStmt = sqlite.prepare('INSERT INTO materiais (kit_name, codigo, item, qtd) VALUES (?, ?, ?, ?)');
    const upsertMetadata = sqlite.prepare('INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)');

    const transaction = sqlite.transaction((data) => {
      deleteStmt.run();
      for (const kitName in data) {
        for (const item of data[kitName]) {
          insertStmt.run(kitName, item.codigo, item.item, item.qtd);
        }
      }
      upsertMetadata.run('csv_mtime', mtime);
    });

    transaction(index);
    logger.info(`Sync complete. Materials table rebuilt from CSV.`);

  } catch (error) {
    logger.error('Failed to sync materials from CSV', { error: error.message });
    throw error;
  }
};

/**
 * Faz o parsing do CSV para um objeto em memória antes de persistir.
 */
const parseCSV = (caminhoCSV) => {
  return new Promise((resolve, reject) => {
    const index = {};
    let currentKit = null;

    fs.createReadStream(caminhoCSV)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        const col1 = row[1] ? row[1].trim() : "";
        const col2 = row[2] ? row[2].trim() : "";
        const col3 = row[3] ? row[3].trim() : "";

        if (col1 && col1.includes('BRAÇO J') && !col2) {
          currentKit = col1;
          index[currentKit] = [];
          return;
        }

        if (currentKit && col1 && col2) {
          index[currentKit].push({
            codigo: col1,
            item: col2,
            qtd: col3 || "1"
          });
        }
      })
      .on('end', () => resolve(index))
      .on('error', (err) => reject(err));
  });
};

module.exports = { syncMaterialsFromCSV };
