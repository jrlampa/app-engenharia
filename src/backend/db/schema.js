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

// Tabela unificada de Histórico (v0.2.4)
const historicoCalculos = sqliteTable('historico_calculos', {

  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(),            // 'TRACAO' ou 'TENSAO'
  data_execucao: text('data_execucao').default(sql`CURRENT_TIMESTAMP`),
  inputs: text('inputs').notNull(),        // JSON Serialized
  resultados: text('resultados').notNull() // JSON Serialized
});



/**
 * DOCUMENTAÇÃO: Schema de Materiais.
 * Armazena a estrutura dos kits extraída do CSV para consultas relacionais.
 */
const materiais = sqliteTable('materiais', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kit_nome: text('kit_nome').notNull(), // Ex: CE2 BRAÇO J
  codigo: text('codigo').notNull(),     // Ex: F-4/13
  item: text('item').notNull(),         // Descrição do material
  quantidade: real('quantidade').notNull() // Quantidade para o kit
});


// Metadados de Sincronização (v0.2.4)
const metadadosSync = sqliteTable('metadados_sync', {
  chave: text('chave').primaryKey(),
  valor: text('valor').notNull()
});

// Configurações do Sistema (v0.3.2 - Singleton)
const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  empresaNome: text('empresa_nome').default('Minha Empresa de Engenharia'),
  empresaLogo: text('empresa_logo'), // Caminho local ou URL
  corPrimaria: text('cor_primaria').default('#007bff'),
  engenheiroResponsavel: text('engenheiro_responsavel').default('Engenheiro Chefe'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

module.exports = { projects, calculosTracao, calculosTensao, materiais, metadadosSync, historicoCalculos, settings };



