/**
 * DOCUMENTAÇÃO: Configuração de Temas de Exportação (v0.3.7).
 * Centraliza a identidade visual para facilitar o "White-label".
 */
const exportThemes = {
  default: {
    colors: {
      primary: 'FF1E293B',    // Slate 800
      accent: 'FF2563EB',     // Blue 600
      success: 'FF10B981',    // Emerald 500
      warning: 'FFF59E0B',    // Amber 500
      textHeader: 'FFFFFFFF', // White
      rowEven: 'FFF8FAFC',    // Slate 50
      border: 'FFE2E8F0'      // Slate 200
    },
    fonts: {
      main: 'Arial',
      sizeHeader: 12,
      sizeBody: 10,
      sizeTitle: 16
    }
  },
  enterprise: {
    // Espaço para temas customizados por cliente no futuro
  }
};

module.exports = exportThemes;
