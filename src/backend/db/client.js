const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = path.join(__dirname, '../data', 'calculations.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL'); // Performance optimization

// Initialize Drizzle
const db = drizzle(sqlite);

const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

// ...

/**
 * Initialize Database with Auto-Migrations (v0.2.7)
 */
const initializeDatabase = () => {
  try {
    // Verificação de Migração de Adoção (v0.2.7 - Retrofit)
    // Se a tabela 'projects' existe mas '__drizzle_migrations' não, marcamos a migração inicial como feita.
    const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'").get();
    const migrationTableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'").get();

    if (tableCheck && !migrationTableCheck) {
      logger.info("Base legado detectada. Inicializando tabela de controle de migração...");
      // Obtemos o nome do arquivo de migração gerado (precisa ser o 0000_...)
      const fs = require('fs');
      const migrationsDir = path.join(__dirname, 'migrations');
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

      if (files.length > 0) {
        const initialMigration = files[0].replace('.sql', '');
        // Drizzle migration table schema (simplified for better-sqlite3 adapter expectation)
        // CREATE TABLE `__drizzle_migrations` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `hash` text NOT NULL, `created_at` integer);
        sqlite.exec("CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `hash` text NOT NULL, `created_at` integer)");

        // Inserimos "fake" record. O hash real seria necessário, mas o Drizzle check é complexo.
        // Para "pular", a melhor estratégia é rodar o CREATE IF NOT EXISTS nos arquivos SQL manualmente se falhar,
        // ou... deletar o db em desenvolvimento (mas não é opção pro user).

        // Better strategy: Catch the "table already exists" error during migrate and ignore it for the *first* run? 
        // No, that's risky.

        // Let's modify the generated SQL file to be `IF NOT EXISTS`.
      }
    }

    // Run migrations using the generated files
    migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });

    logger.info('Database migrations applied successfully (v0.2.7)');


  } catch (error) {
    logger.error('Failed to apply database migrations', { error: error.message });
    throw error;
  }
};


// Auto-initialize on import
initializeDatabase();

module.exports = { db, sqlite };
