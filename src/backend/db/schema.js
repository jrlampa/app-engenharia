const { sqliteTable, integer, real, text } = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');

// Projects table
const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  client: text('client'),
  location: text('location'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Calculos de Tração table
const calculosTracao = sqliteTable('calculos_tracao', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id),
  vao: real('vao').notNull(),
  pesoCabo: real('peso_cabo').notNull(),
  tracaoInicial: real('tracao_inicial').notNull(),
  flecha: real('flecha').notNull(),
  sugestao: text('sugestao').notNull(),
  materiais: text('materiais'), // JSON serialized
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`)
});

// Calculos de Tensão table
const calculosTensao = sqliteTable('calculos_tensao', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id),
  tensaoNominal: real('tensao_nominal').notNull(),
  corrente: real('corrente').notNull(),
  comprimento: real('comprimento').notNull(),
  resistenciaKm: real('resistencia_km').notNull(),
  quedaVolts: real('queda_volts').notNull(),
  quedaPercentual: real('queda_percentual').notNull(),
  status: text('status').notNull(),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`)
});

module.exports = { projects, calculosTracao, calculosTensao };
