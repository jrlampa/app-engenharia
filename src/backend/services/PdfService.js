const PDFDocument = require('pdfkit');
const ConfigService = require('./ConfigService');
const ReportingService = require('./ReportingService');
const YieldService = require('./YieldService');
const AnalyticsService = require('./AnalyticsService');
const DataTransformer = require('../utils/DataTransformer');
const themes = require('../config/exportThemes').default;
const logger = require('../utils/logger');

/**
 * Service para Geração de PDF Profissional (v0.3.7 - Strategic & Visual).
 */
class PdfService {
  /**
   * Gera o Stream do PDF completo do projeto.
   */
  static async streamProjectPdf(projectId, res) {
    try {
      const config = await ConfigService.getConfig();
      const report = await ReportingService.generateMaterialReport(projectId);
      const yieldData = await YieldService.calculateVariance(projectId);
      const benchmarks = await AnalyticsService.getBenchmarkingStats(projectId);

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      doc.pipe(res);

      // --- PÁGINA 1: EXECUTIVE VISUAL SUMMARY ---
      this.drawHeader(doc, config, "RELATÓRIO ESTRATÉGICO DE ENGENHARIA");

      doc.moveDown(4);
      doc.fontSize(20).font(themes.fonts.header).fillColor(themes.primary).text("Executive Insight Dashboard", { align: 'center' });
      doc.moveDown(2);

      // 1. Box Financeiro Premium
      const boxTop = doc.y;
      doc.rect(50, boxTop, 500, 110).fill('#f1f5f9').stroke(themes.secondary);

      doc.fillColor(themes.text.main).fontSize(10).font(themes.fonts.body);
      doc.text("CAPEX ESTIMADO (ORÇADO)", 70, boxTop + 20);
      doc.fontSize(28).font(themes.fonts.header).fillColor(themes.secondary).text(DataTransformer.formatCurrency(yieldData.totalReal), 70, boxTop + 35);

      doc.fillColor(themes.text.light).fontSize(9).font(themes.fonts.body);
      doc.text("POTENCIAL DE ECONOMIA (Meta ROI)", 320, boxTop + 20);
      doc.fillColor(themes.accent).fontSize(18).text(DataTransformer.formatCurrency(yieldData.varianciaAbsoluta), 320, boxTop + 35);
      doc.fontSize(8).text(`Status: ${benchmarks.status}`, 320, boxTop + 60);

      // 2. Gráfico de Benchmarking (Barra Comparativa Simples)
      doc.moveDown(8);
      doc.fillColor(themes.text.main).fontSize(14).font(themes.fonts.header).text("Benchmarking de Custos por Vão");
      doc.moveDown(1);

      const chartX = 50, chartY = doc.y, chartW = 400, chartH = 20;
      // Barra Fundo
      doc.rect(chartX, chartY, chartW, chartH).fill('#e2e8f0');
      // Barra Valor Atual (Proporcional)
      doc.rect(chartX, chartY, chartW * 0.85, chartH).fill(themes.secondary);
      doc.fillColor(themes.text.main).fontSize(9).text(`Média Histórica: ${benchmarks.mediaMercado}`, chartX, chartY + 25);
      doc.text(`Este Projeto: ${benchmarks.custoMedioPorVao}`, chartX + 250, chartY + 25, { align: 'right', width: 150 });

      // 3. Notas do Valuador
      doc.moveDown(4);
      doc.fillColor(themes.primary).fontSize(12).font(themes.fonts.header).text("Análise de Viabilidade & Yield");
      doc.moveDown(0.5);
      doc.fillColor(themes.text.main).fontSize(10).font(themes.fonts.body).text(yieldData.sugestao);
      doc.moveDown(2);
      doc.text(`Engenheiro Responsável: ${config.engenheiroResponsavel}`);

      // --- PÁGINA 2+: LISTA TÉCNICA ---
      doc.addPage();
      this.drawHeader(doc, config, "DETALHAMENTO TÉCNICO DE MATERIAIS");
      doc.moveDown(4);

      // Tabela
      let y = doc.y;
      const col = { code: 50, desc: 120, qtd: 450, total: 500 };

      doc.fontSize(10).font(themes.fonts.header).fillColor(themes.primary);
      doc.text('CÓD. ITEM', col.code, y);
      doc.text('DESCRIÇÃO DOS MATERIAIS', col.desc, y);
      doc.text('QTD', col.qtd, y, { width: 40, align: 'right' });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor(themes.primary).lineWidth(1).stroke();
      doc.moveDown(1.5).font(themes.fonts.body).fillColor(themes.text.main);

      report.materiaisConsolidados.forEach((item) => {
        if (doc.y > 750) {
          doc.addPage();
          this.drawHeader(doc, config, "DETALHAMENTO TÉCNICO (CONT.)");
          doc.moveDown(4);
        }
        y = doc.y;
        doc.fontSize(8).text(item.codigo, col.code, y);
        doc.text(DataTransformer.cleanString(item.item.substring(0, 75)), col.desc, y, { width: 320 });
        doc.text(item.quantidade.toString(), col.qtd, y, { width: 40, align: 'right' });
        doc.moveDown(0.5);
      });

      // Paginação
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(themes.text.light).text(`Gerado por Engenharia Pro v0.3.7 - Página ${i + 1}`, 50, doc.page.height - 30, { align: 'center', width: 500 });
      }

      doc.end();
      logger.info(`PDF Gerado com sucesso para Projeto #${projectId}`);
    } catch (error) {
      logger.error(`Erro ao gerar PDF (v0.3.7): ${error.message}`);
      throw error;
    }
  }

  static drawHeader(doc, config, subtitle) {
    doc.rect(0, 0, 595.28, 70).fill('#' + themes.colors.primary.substring(2)); // Remove FF prefix for PDF
    doc.fillColor(themes.colors.textHeader === 'FFFFFFFF' ? 'white' : 'black').fontSize(themes.fonts.sizeTitle).font(themes.fonts.main).text(config.empresaNome, 50, 20);
    doc.fontSize(9).font(themes.fonts.main).text(subtitle, 50, 42);
  }

}

module.exports = PdfService;
