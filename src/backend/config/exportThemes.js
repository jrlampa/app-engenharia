/**
 * DOCUMENTAÇÃO: Design Tokens Universais (v0.3.8).
 * Governa a identidade visual tanto dos relatórios (Excel/PDF) quanto da UI (Glassmorphism).
 */
const exportThemes = {
  default: {
    // Tokens de Cores (Hex ARGB para Excel / RGB para PDF e UI)
    colors: {
      primary: 'FF1E293B',    // Slate 800
      accent: 'FF2563EB',     // Blue 600
      success: 'FF10B981',    // Emerald 500
      warning: 'FFF59E0B',    // Amber 500
      danger: 'FFEF4444',     // Red 500
      textHeader: 'FFFFFFFF', // White
      rowEven: 'FFF8FAFC',    // Slate 50
      border: 'FFE2E8F0'      // Slate 200
    },
    // Tokens de Tipografia
    fonts: {
      main: 'Arial',
      sizeHeader: 12,
      sizeBody: 10,
      sizeTitle: 16
    },
    // Universal UI Tokens (Glassmorphism & UX)
    ui: {
      glassBlur: '12px',      // Intensidade do borrão de fundo
      glassOpacity: 0.7,      // Transparência do painel
      borderRadius: '16px',   // Curvatura premium
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      borderOpacity: 0.18
    }
  },
  enterprise: {
    // Tema escuro/escovado para modo de alta densidade
    colors: {
      primary: 'FF111827',
      accent: 'FF3B82F6',
      success: 'FF34D399',
      warning: 'FFFBBF24',
      textHeader: 'FFFFFFFF',
      rowEven: 'FF1F2937',
      border: 'FF374151'
    },
    ui: {
      glassBlur: '20px',
      glassOpacity: 0.85,
      borderRadius: '8px',
      shadow: '0 4px 10px rgba(0,0,0,0.5)',
      borderOpacity: 0.3
    }
  }
};

module.exports = exportThemes;
