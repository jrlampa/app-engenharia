const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db, sqlite } = require('../db/client');
const { materiais, metadadosSync } = require('../db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * DOCUMENTAÇÃO: Serviço de Sincronização CSV -> SQLite.
 * Implementa cache por data de modificação (mtime) para máxima eficiência.
 */
class SyncService {
  /**
   * Verifica se o arquivo precisa ser sincronizado comparando o mtime.
   */
  static async checkNeedsSync(filePath) {
    try {
      if (!fs.existsSync(filePath)) return false;

      const stats = fs.statSync(filePath);
      const currentMtime = stats.mtime.toISOString();
      const fileName = path.basename(filePath);

      // Consulta via Drizzle (Padrão Sênior)
      const record = await db.select()
        .from(metadadosSync)
        .where(eq(metadadosSync.chave, `SYNC_MTIME_${fileName}`))
        .execute();

      if (record.length > 0 && record[0].valor === currentMtime) {
        return false; // Já sincronizado
      }

      return currentMtime;
    } catch (error) {
      logger.error(`Erro ao verificar mtime: ${error.message}`);
      return false;
    }
  }

  /**
   * Gatilho principal de sincronização.
   */
  static async syncMaterialsWithDB() {
    try {
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));

      if (files.length === 0) {
        logger.warn('Nenhum arquivo CSV encontrado para sincronização.');
        return;
      }

      let somethingChanged = false;
      const fileDataToSync = [];

      for (const file of files) {
        const fullPath = path.join(DATA_DIR, file);
        const needsSync = await this.checkNeedsSync(fullPath);

        if (needsSync) {
          somethingChanged = true;
          fileDataToSync.push({ file, fullPath, mtime: needsSync });
        }
      }

      if (!somethingChanged) {
        logger.info('Base de dados de materiais já está atualizada (Cache MTIME).');
        return;
      }

      logger.info("Mudanças detectadas nos CSVs. Iniciando reconstrução da base...");

      let allMaterials = [];
      for (const item of fileDataToSync) {
        const rows = await this.parseCSV(item.fullPath);
        allMaterials.push(...rows);
      }

      // No better-sqlite3, transações do Drizzle são síncronas
      db.transaction((tx) => {
        // v0.3.5: Usar UPSERT em vez de DELETE para preservar preços manuais
        if (allMaterials.length > 0) {
          for (const mat of allMaterials) {
            tx.insert(materiais)
              .values(mat)
              .onConflictDoUpdate({
                target: [materiais.kit_nome, materiais.codigo],
                set: {
                  item: mat.item,
                  quantidade: mat.quantidade
                  // Não sobrescrevemos precoUnitario aqui pois o CSV v0.3.5 ainda não o possui
                }
              })
              .execute();
          }
        }

        // Atualiza os metadados para cada arquivo sincronizado
        for (const item of fileDataToSync) {
          tx.insert(metadadosSync)
            .values({ chave: `SYNC_MTIME_${item.file}`, valor: item.mtime })
            .onConflictDoUpdate({
              target: metadadosSync.chave,
              set: { valor: item.mtime }
            })
            .execute();
        }
      });



      logger.info(`Sincronização inteligente concluída.`);

    } catch (error) {
      logger.error(`Falha no SyncService de v0.2.4: ${error.message}`);
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
