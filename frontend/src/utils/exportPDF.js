import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * DOCUMENTAÇÃO: Gera um relatório técnico em PDF
 * inclui os parâmetros de cálculo e a lista de materiais do kit.
 */
export const gerarRelatorioTracao = (dadosEntrada, resultado) => {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.text("Relatório Técnico de Engenharia", 14, 20);

  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.line(14, 32, 196, 32);

  // Seção 1: Dados de Entrada
  doc.setFontSize(14);
  doc.text("1. Parâmetros de Cálculo", 14, 45);
  doc.setFontSize(11);
  doc.text(`Vão: ${dadosEntrada.vao} m`, 14, 55);
  doc.text(`Peso do Cabo: ${dadosEntrada.pesoCabo} kg/m`, 14, 62);
  doc.text(`Tração Aplicada: ${dadosEntrada.tracaoInicial} daN`, 14, 69);

  // Seção 2: Resultados
  doc.setFontSize(14);
  doc.text("2. Resultados Obtidos", 14, 85);
  doc.setFontSize(11);
  doc.text(`Flecha Calculada: ${resultado.flecha} metros`, 14, 95);
  doc.text(`Estrutura Sugerida: ${resultado.sugestao}`, 14, 102);

  // Seção 3: Lista de Materiais (Tabela)
  doc.setFontSize(14);
  doc.text("3. Lista de Materiais do Kit", 14, 115);

  const colunas = ["Código", "Descrição do Item", "Qtd"];
  const linhas = resultado.materiais.map(m => [m.codigo, m.item, m.qtd]);

  doc.autoTable({
    startY: 120,
    head: [colunas],
    body: linhas,
    theme: 'striped'
  });

  // Salvar o arquivo
  doc.save(`Relatorio_Tracao_${resultado.sugestao}.pdf`);
};
