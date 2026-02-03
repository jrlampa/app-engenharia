const PDFDocument = require('pdfkit');
const ConfigService = require('./ConfigService');
const ReportingService = require('./ReportingService');
const YieldService = require('./YieldService');
const DataTransformer = require('../utils/DataTransformer');
const logger = require('../utils/logger');

/**
 * Service para Geração de PDF Profissional (v0.3.6 - Executive & Stream).
 */
class PdfService {
  /**
   * Gera o Stream do PDF completo do projeto.
   * @param {number} projectId 
   * @param {Stream} res - Express response stream
   */
  static async streamProjectPdf(projectId, res) {
    try {
      const config = await ConfigService.getConfig();
      const report = await ReportingService.generateMaterialReport(projectId);
      const yieldData = await YieldService.calculateVariance(projectId);

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      doc.pipe(res); // Pipe direto pro response

      // --- PÁGINA 1: EXECUTIVE SUMMARY (RESUMO VISUAL) ---
      this.drawHeader(doc, config, "RESUMO EXECUTIVO");

      doc.moveDown(4);
      doc.fontSize(18).fillColor('#333').text("Visão Geral do Investimento", { align: 'center' });
      doc.moveDown(2);

      // Caixa de Resumo Financeiro
      const boxTop = doc.y;
      doc.rect(50, boxTop, 500, 100).fill('#f8f9fa').stroke('#dee2e6');

      doc.fillColor('#000').fontSize(12);
      doc.text("TOTAL ESTIMADO:", 70, boxTop + 20);
      doc.fontSize(24).fillColor('#007bff').text(DataTransformer.formatCurrency(yieldData.totalReal), 70, boxTop + 40);

      doc.fillColor('#666').fontSize(10);
      doc.text("STATUS DA MARGEM:", 300, boxTop + 20);
      doc.fillColor('#28a745').fontSize(14).text("OTIMIZADO", 300, boxTop + 40);
      doc.fillColor('#666').fontSize(9).text(`VARIANCIA: ${yieldData.percentualDesperdicio} vs Ideal`, 300, boxTop + 60);

      doc.moveDown(6);
      doc.fillColor('#000').fontSize(14).text("Notas Técnicas & ROI", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(yieldData.sugestao);
      doc.moveDown(2);
      doc.text(`Responsável Técnico: ${config.engenheiroResponsavel}`);

      // --- PÁGINA 2+: LISTA DE MATERIAIS ---
      doc.addPage();
      this.drawHeader(doc, config, "DETALHAMENTO TÉCNICO");
      doc.moveDown(4);

      // Tabela (Simplified for Stream)
      doc.fontSize(14).text("Lista de Materiais Consolidada");
      doc.moveDown(1);

      let y = doc.y;
      const xCode = 50, xDesc = 150, xQtd = 450, xUn = 520;
      doc.fontSize(10).font('Helvetica-Bold').text('CÓDIGO', xCode, y);
      doc.text('DESCRIÇÃO', xDesc, y);
      doc.text('QTD.', xQtd, y, { width: 50, align: 'right' });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      doc.moveDown(1.5).font('Helvetica');

      report.materiaisConsolidados.forEach((item, i) => {
        if (doc.y > 750) {
          doc.addPage();
          this.drawHeader(doc, config, "DETALHAMENTO TÉCNICO (CONT.)");
          doc.moveDown(4);
        }
        y = doc.y;
        doc.fontSize(9).text(item.codigo, xCode, y);
        doc.text(DataTransformer.cleanString(item.item.substring(0, 55)), xDesc, y);
        doc.text(item.quantidade.toString(), xQtd, y, { width: 50, align: 'right' });
        doc.moveDown(0.8);
      });

      // Rodapé
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('grey').text(`Gerado por SisEngenharia Pro v0.3.6 - Página ${i + 1}`, 50, doc.page.height - 30, { align: 'center', width: 500 });
      }

      doc.end();
    } catch (error) {
      logger.error(`Erro ao gerar PDF (Stream): ${error.message}`);
      throw error;
    }
  }

  static drawHeader(doc, config, subtitle) {
    doc.rect(0, 0, 595.28, 80).fill(config.corPrimaria || '#007bff');
    doc.fillColor('white').fontSize(20).text(config.empresaNome, 50, 25);
    doc.fontSize(10).text(subtitle, 50, 50);
  }
}

module.exports = PdfService;
