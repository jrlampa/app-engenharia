/**
 * Configuração de Temas para Exportação (v0.3.6).
 * Centraliza cores, fontes e estilos para Excel e PDF.
 */
const exportThemes = {
  default: {
    primary: '#1E293B', // Slate 800 - Profissional
    secondary: '#007BFF', // Azul SisEngenharia
    accent: '#28A745', // Verde Sucesso
    danger: '#DC3545', // Vermelho Erro
    warning: '#FFC107', // Amarelo Alerta
    background: '#F8F9FA',
    text: {
      main: '#333333',
      light: '#666666',
      white: '#FFFFFF'
    },
    fonts: {
      header: 'Helvetica-Bold',
      body: 'Helvetica'
    }
  },
  enterprise: {
    primary: '#111827',
    secondary: '#3B82F6',
    accent: '#10B981',
    text: {
      main: '#1F2937',
      light: '#4B5563',
      white: '#FFFFFF'
    }
  }
};

module.exports = exportThemes;
