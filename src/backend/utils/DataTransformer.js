/**
 * Utilitário para transformação e limpeza de dados (v0.3.6).
 * Isola a lógica do banco de dados da estrutura de exportação (Decoupling).
 */
class DataTransformer {
  /**
   * Formata valores monetários para Real (BRL).
   * @param {number} value 
   */
  static formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Prepara os dados consolidados de materiais para a planilha Excel.
   * @param {Array} materials 
   */
  static transformMaterialsForExport(materials) {
    return materials.map(m => ({
      Codigo: m.codigo,
      Descricao: m.item,
      Quantidade: m.quantidade,
      Unidade: m.unidade || 'UN',
      PrecoUnitario: m.precoUnitario || 0,
      Subtotal: (m.quantidade * (m.precoUnitario || 0)).toFixed(2)
    }));
  }

  /**
   * Sanitiza strings para o PDF (remove caracteres que quebram o pdfkit).
   * @param {string} str 
   */
  static cleanString(str) {
    if (!str) return '';
    return str.replace(/[^\x20-\x7E\s]/g, ''); // Básico: remove non-ascii
  }
}

module.exports = DataTransformer;
