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

/**
 * Create tables if they don't exist (auto-migration).
 */
const initializeDatabase = () => {
  try {
    // Create projects table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        client TEXT,
        location TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create calculos_tracao table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS calculos_tracao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        vao REAL NOT NULL,
        peso_cabo REAL NOT NULL,
        tracao_inicial REAL NOT NULL,
        flecha REAL NOT NULL,
        sugestao TEXT NOT NULL,
        materiais TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    // Create calculos_tensao table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS calculos_tensao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        tensao_nominal REAL NOT NULL,
        corrente REAL NOT NULL,
        comprimento REAL NOT NULL,
        resistencia_km REAL NOT NULL,
        queda_volts REAL NOT NULL,
        queda_percentual REAL NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    // Create materiais table (CSV Cache)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kit_nome TEXT NOT NULL,
        codigo TEXT NOT NULL,
        item TEXT NOT NULL,
        quantidade REAL NOT NULL
      )
    `);


    // Create sync_metadata table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    logger.info('Database tables created/verified successfully');

  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    throw error;
  }
};

// Auto-initialize on import
initializeDatabase();

module.exports = { db, sqlite };
