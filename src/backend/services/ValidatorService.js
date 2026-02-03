const logger = require('../utils/logger');

/**
 * DOCUMENTAÇÃO: ValidatorService v0.3.7.
 * O "Guardian Layer" da aplicação.
 * Realiza verificações de sanidade técnica e financeira antes da exportação.
 */
class ValidatorService {
  /**
   * Executa uma bateria de testes sobre os dados do projeto.
   * @param {Object} dadosResumo - Dados agregados do projeto (material report + budget).
   * @returns {Object} { valido: boolean, alertas: Array, erros: Array }
   */
  static validarProjetoParaExportacao(dadosResumo) {
    const alertas = [];
    const erros = [];

    logger.info(`Iniciando validação de pré-exportação para Projeto #${dadosResumo.projeto?.id || '?'}`);

    // 1. Verificação de Integridade Financeira
    if (!dadosResumo.items || dadosResumo.items.length === 0) {
      erros.push("O projeto não possui materiais associados.");
    }

    if (dadosResumo.totalGeral <= 0) {
      alertas.push("O projeto não possui custos associados ou os materiais têm preço zero.");
    }

    // 2. Verificação de Coerência Técnica (Exemplos de Engenharia)
    if (dadosResumo.items) {
      dadosResumo.items.forEach(item => {
        // Validar se existem itens com "NaN" ou indefinidos (Safety First)
        if (isNaN(item.subtotal)) {
          erros.push(`Erro de cálculo financeiro no item: ${item.codigo}`);
        }

        // Regra de Negócio: Quantidades negativas são proibidas
        if (item.quantidade <= 0) {
          erros.push(`Quantidade inválida para o item ${item.codigo}: ${item.quantidade}`);
        }
      });
    }

    // 3. Verificação de Dados de Referência
    if (!dadosResumo.projeto || !dadosResumo.projeto.id) {
      erros.push("Dados do projeto incompletos para exportação.");
    }

    const eValido = erros.length === 0;

    if (!eValido) {
      logger.error(`Validação de exportação falhou: ${erros.join(' | ')}`);
    } else if (alertas.length > 0) {
      logger.warn(`Validação concluída com alertas: ${alertas.join(' | ')}`);
    }

    return {
      valido: eValido,
      alertas,
      erros
    };
  }
}

module.exports = ValidatorService;
