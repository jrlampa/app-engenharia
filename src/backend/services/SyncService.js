const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db, sqlite } = require('../db/client');
const { materiais } = require('../db/schema');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * DOCUMENTAÇÃO: Serviço de Sincronização CSV -> SQLite.
 * Realiza a leitura e persistência dos kits de materiais.
 */
class SyncService {
  /**
   * Gatilho principal de sincronização.
   * Verifica mudanças no CSV e reconstrói a tabela de materiais se necessário.
   */
  static async syncMaterialsWithDB() {
    try {
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));

      if (files.length === 0) {
        logger.warn('Nenhum arquivo CSV encontrado na pasta data.');
        return;
      }

      // Inteligência de Cache (Hash de mtime)
      let stateHash = "";
      const fileStats = files.map(file => {
        const fullPath = path.join(DATA_DIR, file);
        const stats = fs.statSync(fullPath);
        stateHash += `${file}:${stats.mtimeMs};`;
        return { file, fullPath };
      });

      const lastHash = sqlite.prepare('SELECT value FROM sync_metadata WHERE key = ?').get('global_csv_state');

      if (lastHash && lastHash.value === stateHash) {
        logger.info('Base de dados de materiais íntegra e atualizada.');
        return;
      }

      logger.info("Sincronizando materiais (CSV -> SQLite)...");

      const allRows = [];
      for (const item of fileStats) {
        const rows = await this.parseCSV(item.fullPath);
        allRows.push(...rows);
      }

      // Transação Atômica via Drizzle
      await db.transaction(async (tx) => {
        await tx.delete(materiais).execute();
        if (allRows.length > 0) {
          await tx.insert(materiais).values(allRows).execute();
        }
        // Atualiza metadado de sincronização via better-sqlite3 (mais direto para metadados simples)
        sqlite.prepare('INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)').run('global_csv_state', stateHash);
      });

      logger.info(`Concluído: ${allRows.length} materiais importados.`);

    } catch (error) {
      logger.error(`Erro no SyncService: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parsing de arquivo CSV via Stream.
   */
  static parseCSV(caminhoCSV) {
    return new Promise((resolve, reject) => {
      const rows = [];
      let kitAtual = null;

      fs.createReadStream(caminhoCSV)
        .pipe(csv({ headers: false }))
        .on('data', (row) => {
          const identificador = row[1] ? row[1].trim() : "";
          const descricao = row[2] ? row[2].trim() : "";
          const qtd = row[3] ? row[3].trim() : "";

          // Detecção de Kit
          if (identificador && identificador.includes('BRAÇO J') && !descricao) {
            kitAtual = identificador;
            return;
          }

          if (kitAtual && identificador && descricao) {
            rows.push({
              kit_nome: kitAtual,
              codigo: identificador,
              item: descricao,
              quantidade: parseFloat(qtd.replace(',', '.')) || 1
            });
          }
        })
        .on('end', () => resolve(rows))
        .on('error', (err) => reject(err));
    });
  }
}

module.exports = SyncService;
