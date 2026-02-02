const PDFDocument = require('pdfkit');
const ConfigService = require('./ConfigService');
const ReportingService = require('./ReportingService');
const logger = require('../utils/logger');

/**
 * Service para Geração de PDF Profissional.
 * Desenha relatórios vetoriais com marca e layout oficial.
 */
class PdfService {
  /**
   * Gera o PDF completo do projeto.
   * @param {number} projectId 
   * @returns {Promise<Buffer>} Buffer do PDF
   */
  static async generateProjectPdf(projectId) {
    try {
      // 1. Dados
      const config = await ConfigService.getConfig();
      const report = await ReportingService.generateMaterialReport(projectId);
      const { projeto, materiaisConsolidados } = report;

      // 2. Setup do Documento
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));

      return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // --- CABEÇALHO ---
        // Fundo do Topo
        doc.rect(0, 0, 595.28, 100).fill(config.corPrimaria || '#007bff');

        // Título
        doc.fillColor('white')
          .fontSize(20)
          .text(config.empresaNome, 50, 35);

        doc.fontSize(10)
          .text(`Projeto: ${projeto.name}`, 50, 65)
          .text(`Local: ${projeto.location || 'N/A'}`, 50, 78);

        // --- CORPO ---
        doc.fillColor('black').moveDown(4);

        doc.fontSize(14).text("Resumo Técnico", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10)
          .text(`Cliente: ${projeto.client || 'N/A'}`)
          .text(`Data Emissão: ${new Date().toLocaleDateString('pt-BR')}`)
          .text(`Engenheiro Resp.: ${config.engenheiroResponsavel}`)
          .moveDown(2);

        // --- TABELA DE MATERIAIS ---
        doc.fontSize(14).text("Lista de Materiais Consolidada", { underline: true });
        doc.moveDown(1);

        // Headers Tabela
        let y = doc.y;
        const xCode = 50, xDesc = 150, xQtd = 450, xUn = 520;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('CÓDIGO', xCode, y);
        doc.text('DESCRIÇÃO', xDesc, y);
        doc.text('QTD.', xQtd, y, { width: 50, align: 'right' });
        doc.text('UN.', xUn, y);

        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown(1.5);

        // Linhas
        doc.font('Helvetica').fontSize(9);

        materiaisConsolidados.forEach((item, i) => {
          // Zebra background
          if (i % 2 === 0) {
            doc.rect(50, doc.y - 2, 500, 15).fillColor('#f5f5f5').fill();
            doc.fillColor('black'); // Reset text color
          }

          y = doc.y;
          doc.text(item.codigo, xCode, y);
          doc.text(item.item.substring(0, 60), xDesc, y);
          doc.text(item.quantidade.toString(), xQtd, y, { width: 50, align: 'right' });
          doc.text(item.unidade || 'UN', xUn, y);

          doc.moveDown(0.8);
        });

        // Rodapé
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).fillColor('grey')
            .text(`Gerado por SisEngenharia Pro v0.3.2 - Página ${i + 1}`,
              50,
              doc.page.height - 30,
              { align: 'center', width: 500 });
        }

        doc.end();
      });

    } catch (error) {
      logger.error(`Erro ao gerar PDF: ${error.message}`);
      throw error;
    }
  }
}

module.exports = PdfService;
