const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sqlite } = require('../db/client');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Sincroniza todos os CSVs da pasta data com o banco de dados.
 * Detecta mudanças baseando-se no mtime dos arquivos.
 */
const syncDatabase = async () => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));

    if (files.length === 0) {
      logger.warn('No CSV files found for synchronization in data directory.');
      return;
    }

    // Gera um "hash" simplificado do estado atual (combinação de mtimes)
    let stateHash = "";
    const fileStats = files.map(file => {
      const fullPath = path.join(DATA_DIR, file);
      const stats = fs.statSync(fullPath);
      stateHash += `${file}:${stats.mtimeMs};`;
      return { file, fullPath, mtime: stats.mtimeMs.toString() };
    });

    // Verifica se o estado global mudou
    const lastSyncHash = sqlite.prepare('SELECT value FROM sync_metadata WHERE key = ?').get('global_csv_state');

    if (lastSyncHash && lastSyncHash.value === stateHash) {
      logger.info('Database is already up to date with all CSV files (stable state).');
      return;
    }

    logger.info(`Changes detected in CSV directory. Starting full re-sync...`);

    let allMaterials = {};

    // Processa cada arquivo e acumula os materiais
    for (const item of fileStats) {
      logger.debug(`Parsing ${item.file}...`);
      const fileData = await parseCSV(item.fullPath);
      // Merge dos materiais (kits de arquivos diferentes são acumulados)
      Object.assign(allMaterials, fileData);
    }

    // Inserção atômica em transação
    const deleteStmt = sqlite.prepare('DELETE FROM materiais');
    const insertStmt = sqlite.prepare('INSERT INTO materiais (kit_name, codigo, item, qtd) VALUES (?, ?, ?, ?)');
    const upsertMetadata = sqlite.prepare('INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)');

    const transaction = sqlite.transaction((data) => {
      deleteStmt.run();
      for (const kitName in data) {
        for (const material of data[kitName]) {
          insertStmt.run(kitName, material.codigo, material.item, material.qtd);
        }
      }
      upsertMetadata.run('global_csv_state', stateHash);
    });

    transaction(allMaterials);
    logger.info(`Intelligent sync complete. Database rebuilt from ${files.length} CSV files.`);

  } catch (error) {
    logger.error('Failed to perform intelligent database sync', { error: error.message });
    throw error;
  }
};

/**
 * Faz o parsing de um CSV específico.
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

        // Regra de detecção de Kit (específica para o formato atual)
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

module.exports = {
  syncDatabase,
  // Mantido para compatibilidade se necessário em testes unitários específicos
  syncMaterialsFromCSV: syncDatabase
};

