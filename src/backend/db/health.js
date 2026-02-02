const { db } = require('./client');
const { materiais, historicoCalculos, metadadosSync } = require('./schema');
const logger = require('../utils/logger');
const SyncService = require('../services/SyncService');

/**
 * DOCUMENTAÇÃO: Módulo de Integridade e Saúde do Banco de Dados.
 * Garante que as tabelas essenciais existem e estão operacionais.
 * Implementa padrão de auto-regeneração (v0.2.6).
 */
async function checkDbIntegrity() {
  try {
    logger.info("Iniciando verificação de integridade das tabelas...");

    // 1. Verifica se a tabela de materiais está acessível e tem dados
    // Se falhar ou estiver vazia, forçamos um sync.
    try {
      const materiaisCount = await db.select().from(materiais).limit(1).execute();

      if (materiaisCount.length === 0) {
        logger.warn("Tabela de materiais vazia detectada. Acionando sincronização de emergência...");
        await SyncService.syncMaterialsWithDB();
      } else {
        logger.info("Tabela de materiais íntegra.");
      }
    } catch (tblError) {
      logger.error("Falha ao acessar tabela de materiais. Tentando reconstruir...", { error: tblError.message });
      await SyncService.syncMaterialsWithDB();
    }

    // 2. Verifica tabelas de metadados e histórico (integridade estrutural mínima)
    await db.select().from(metadadosSync).limit(1).execute();
    await db.select().from(historicoCalculos).limit(1).execute();

    logger.info("Integridade do banco de dados validada com sucesso.");
    return true;
  } catch (error) {
    logger.error("ERRO CRÍTICO DE INTEGRIDADE: " + error.message);
    // Se chegarmos aqui, algo no driver ou no arquivo .db está muito errado
    throw new Error("Base de dados corrompida ou inacessível.");
  }
}

module.exports = { checkDbIntegrity };
