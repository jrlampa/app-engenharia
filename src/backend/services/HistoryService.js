const { db, sqlite } = require('../db/client');
const { projects, calculosTracao, calculosTensao } = require('../db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Salva um cálculo de tração no histórico.
 */
const saveCalculoTracao = (projectId, dados, resultado) => {
  try {
    const stmt = sqlite.prepare(`
      INSERT INTO calculos_tracao 
        (project_id, vao, peso_cabo, tracao_inicial, flecha, sugestao, materiais)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      projectId || null,
      dados.vao,
      dados.pesoCabo,
      dados.tracaoInicial,
      resultado.flecha,
      resultado.sugestao,
      JSON.stringify(resultado.materiais || [])
    );

    logger.info(`Calculation saved: tracao #${info.lastInsertRowid}`);
    return info.lastInsertRowid;
  } catch (error) {
    logger.error('Failed to save tracao calculation', { error: error.message });
    throw error;
  }
};

/**
 * Salva um cálculo de tensão no histórico.
 */
const saveCalculoTensao = (projectId, dados, resultado) => {
  try {
    const stmt = sqlite.prepare(`
      INSERT INTO calculos_tensao 
        (project_id, tensao_nominal, corrente, comprimento, resistencia_km, 
         queda_volts, queda_percentual, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      projectId || null,
      dados.tensaoNominal,
      dados.corrente,
      dados.comprimento,
      dados.resistenciaKm,
      resultado.quedaVolts,
      resultado.quedaPercentual,
      resultado.status
    );

    logger.info(`Calculation saved: tensao #${info.lastInsertRowid}`);
    return info.lastInsertRowid;
  } catch (error) {
    logger.error('Failed to save tensao calculation', { error: error.message });
    throw error;
  }
};

/**
 * Cria um novo projeto.
 */
const createProject = (name, description = null, client = null, location = null) => {
  try {
    const stmt = sqlite.prepare(`
      INSERT INTO projects (name, description, client, location)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(name, description, client, location);
    logger.info(`Project created: #${info.lastInsertRowid} - ${name}`);
    return info.lastInsertRowid;
  } catch (error) {
    logger.error('Failed to create project', { error: error.message });
    throw error;
  }
};

/**
 * Lista todos os projetos.
 */
const listAllProjects = () => {
  try {
    const stmt = sqlite.prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM calculos_tracao WHERE project_id = p.id) as tracao_count,
        (SELECT COUNT(*) FROM calculos_tensao WHERE project_id = p.id) as tensao_count
      FROM projects p
      ORDER BY p.created_at DESC
    `);

    return stmt.all();
  } catch (error) {
    logger.error('Failed to list projects', { error: error.message });
    throw error;
  }
};

/**
 * Retorna o histórico completo de um projeto.
 */
const getProjectHistory = (projectId) => {
  try {
    const tracaoStmt = sqlite.prepare(`
      SELECT * FROM calculos_tracao 
      WHERE project_id = ? 
      ORDER BY timestamp DESC
    `);

    const tensaoStmt = sqlite.prepare(`
      SELECT * FROM calculos_tensao 
      WHERE project_id = ? 
      ORDER BY timestamp DESC
    `);

    const tracaoCalculos = tracaoStmt.all(projectId).map(calc => ({
      ...calc,
      materiais: calc.materiais ? JSON.parse(calc.materiais) : []
    }));

    const tensaoCalculos = tensaoStmt.all(projectId);

    return {
      tracao: tracaoCalculos,
      tensao: tensaoCalculos
    };
  } catch (error) {
    logger.error('Failed to get project history', { error: error.message });
    throw error;
  }
};

/**
 * Retorna os últimos N cálculos (sem projeto).
 */
const getRecentCalculations = (limit = 20) => {
  try {
    const tracaoStmt = sqlite.prepare(`
      SELECT 'tracao' as type, * FROM calculos_tracao 
      WHERE project_id IS NULL
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    const tensaoStmt = sqlite.prepare(`
      SELECT 'tensao' as type, * FROM calculos_tensao 
      WHERE project_id IS NULL
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    const tracao = tracaoStmt.all(limit).map(calc => ({
      ...calc,
      materiais: calc.materiais ? JSON.parse(calc.materiais) : []
    }));

    const tensao = tensaoStmt.all(limit);

    // Merge and sort by timestamp
    return [...tracao, ...tensao]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    logger.error('Failed to get recent calculations', { error: error.message });
    throw error;
  }
};

module.exports = {
  saveCalculoTracao,
  saveCalculoTensao,
  createProject,
  listAllProjects,
  getProjectHistory,
  getRecentCalculations
};
