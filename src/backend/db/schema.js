const { sqliteTable, integer, real, text } = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');

// Projects table
// (Antiga declaração de projects removida - Ver abaixo v0.3.3)


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
 * v0.3.4: Adiciona campos de precificação.
 */
const materiais = sqliteTable('materiais', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kit_nome: text('kit_nome').notNull(), // Ex: CE2 BRAÇO J
  codigo: text('codigo').notNull(),     // Ex: F-4/13
  item: text('item').notNull(),         // Descrição do material
  quantidade: real('quantidade').notNull(), // Quantidade para o kit
  precoUnitario: real('preco_unitario'), // v0.3.4: Preço unitário
  moeda: text('moeda').default('BRL')    // v0.3.6: Moeda (R$)
}, (table) => ({
  unq: uniqueIndex('materiais_kit_codigo_idx').on(table.kit_nome, table.codigo)
}));




// Metadados de Sincronização (v0.2.4)
const metadadosSync = sqliteTable('metadados_sync', {
  chave: text('chave').primaryKey(),
  valor: text('valor').notNull()
});

// Configurações do Sistema (v0.3.2 - Singleton)
const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  empresaNome: text('empresa_nome').default('Minha Empresa de Engenharia'),
  empresaLogo: text('empresa_logo'),
  corPrimaria: text('cor_primaria').default('#007bff'),
  engenheiroResponsavel: text('engenheiro_responsavel').default('Engenheiro Chefe'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// CRM: Clientes (v0.3.3)
const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Perfis de Branding (v0.3.8) - SaaS e Multi-tema
const brandingProfiles = sqliteTable('branding_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  configJson: text('config_json').notNull(), // JSON com os Design Tokens Universais
  isDefault: integer('is_default').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Projetos (Atualizado v0.3.8)
const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  client: text('client'), // Mantido para legado
  clientId: integer('client_id').references(() => clients.id), // Nova FK
  brandingProfileId: integer('branding_profile_id').references(() => brandingProfiles.id), // v0.3.8
  statusFinanceiro: text('status_financeiro').default('SAUDAVEL'), // v0.3.8: 'SAUDAVEL', 'RISCO', 'ALERTA'
  location: text('location'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Rastreabilidade de Preços (v0.3.5)
const historicoPrecos = sqliteTable('historico_precos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  materialId: integer('material_id').references(() => materiais.id, { onDelete: 'cascade' }),
  precoAntigo: real('preco_antigo'),
  precoNovo: real('preco_novo').notNull(),
  dataAlteracao: text('data_alteracao').default(sql`CURRENT_TIMESTAMP`)
});


module.exports = { projects, calculosTracao, calculosTensao, materiais, metadadosSync, historicoCalculos, settings, clients, historicoPrecos, brandingProfiles };




