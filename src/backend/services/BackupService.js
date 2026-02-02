const fs = require('fs');
const path = require('path');
const { sqlite } = require('../db/client');
const logger = require('../utils/logger');
const os = require('os');

/**
 * Serviço de Backup e Exportação (v0.2.7)
 */
class BackupService {
  /**
   * Gera um dump SQL completo do banco de dados atual.
   * @returns {string} Caminho do arquivo de backup gerado.
   */
  static async exportDataToSQL() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_engenharia_${timestamp}.sql`;

      // Define diretório de saída (Pasta Downloads do usuário para fácil acesso)
      // Em produção, isso garante que o usuário ache o arquivo
      const outputDir = path.join(os.homedir(), 'Downloads');
      const outputPath = path.join(outputDir, filename);

      // Comando .dump do SQLite via better-sqlite3 (precisa de implementação manual ou comando de shell)
      // Como better-sqlite3 não tem .dump nativo exposto facilmente, faremos uma leitura tabela a tabela
      // ou usaremos um script simples de backup.

      // Strategy: Ler dados e gerar INSERTs.
      // Para v0.2.7, vamos focar em exportar o HISTÓRICO, que é o dado mais valioso.

      // Gerar script SQL
      let sqlContent = `-- Backup Engenharia Pro - ${timestamp}\n\n`;

      const tables = ['projects', 'historico_calculos'];

      for (const table of tables) {
        const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        sqlContent += `-- Table: ${table}\n`;

        for (const row of rows) {
          const keys = Object.keys(row).join(', ');
          const values = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            return v;
          }).join(', ');

          sqlContent += `INSERT INTO ${table} (${keys}) VALUES (${values});\n`;
        }
        sqlContent += `\n`;
      }

      fs.writeFileSync(outputPath, sqlContent);
      logger.info(`Backup exportado com sucesso para: ${outputPath}`);

      return { filePath: outputPath, filename };
    } catch (error) {
      logger.error(`Falha na exportação de backup: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BackupService;
