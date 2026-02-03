const logger = require('../utils/logger');

/**
 * DOCUMENTAÇÃO: ValidatorService v0.3.7.
 * O "Guardian Layer" da aplicação.
 * Realiza verificações de sanidade técnica e financeira antes da exportação.
 */
class ValidatorService {
  /**
   * Executa uma bateria de testes sobre os dados do projeto.
   * @param {Object} dadosResumo - Dados agregados do projeto.
   * @returns {Object} { valido: boolean, alertas: Array, erros: Array }
   */
  static validarProjetoParaExportacao(dadosResumo) {
    const alertas = [];
    const erros = [];

    logger.info(`Iniciando validação de pré-exportação...`);

    // 1. Verificação de Integridade Financeira
    // dadosResumo aqui deve conter totalGeral e items
    const custoTotal = dadosResumo.totalGeral || 0;
    const items = dadosResumo.items || [];

    if (custoTotal <= 0) {
      alertas.push("O projeto não possui custos associados ou os materiais têm preço zero.");
    }

    // 2. Verificação de Coerência Técnica (Exemplos de Engenharia)
    items.forEach(item => {
      // Regra: Estruturas Braço J não devem ter vãos acima de 120m sem reforço
      // (Lógica de exemplo integrada)
      if (item.codigo.includes('BRACO-J') && item.quantidade > 5) {
        // Alerta preventivo
        alertas.push(`Densidade alta de Braço J detectada no código ${item.codigo}. Verifique reforços.`);
      }

      // Validar se existem itens com "NaN" ou indefinidos (Safety First)
      if (isNaN(item.subtotal)) {
        erros.push(`Erro de cálculo financeiro no item: ${item.codigo}`);
      }
    });

    // 3. Verificação de Dados de Branding
    if (!dadosResumo.projeto || !dadosResumo.projeto.id) {
      erros.push("Projeto sem ID de referência. Base de dados inconsistente.");
    }

    const eValido = erros.length === 0;

    if (!eValido) {
      logger.error(`Validação falhou: ${erros.join(' | ')}`);
    }

    return {
      valido: eValido,
      alertas,
      erros
    };
  }
}

module.exports = ValidatorService;
