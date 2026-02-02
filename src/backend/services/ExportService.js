const ExcelJS = require('exceljs');
const ReportingService = require('./ReportingService');
const { db } = require('../db/client');
const { projects } = require('../db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service para Exportação de Dados Profissionais (Excel/BOM).
 * Transforma dados do sistema em planilhas formatadas para o setor de compras.
 */
class ExportService {
  /**
   * Gera um arquivo Excel (.xlsx) completo do projeto.
   * Contém abas: "Resumo" e "Lista de Materiais".
   * 
   * @param {number} projectId 
   * @returns {Promise<Buffer>} Buffer do arquivo Excel
   */
  static async generateProjectExcel(projectId) {
    try {
      // 1. Obter dados via ReportingService (Reutilização inteligente)
      const reportData = await ReportingService.generateMaterialReport(projectId);
      const { projeto, totalCalculos, materiaisConsolidados } = reportData;

      // 2. Criar Workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Engenharia Pro System';
      workbook.lastModifiedBy = 'Engenharia Backend v0.3.0';
      workbook.created = new Date();
      workbook.modified = new Date();

      // --- ABA 1: RESUMO DO PROJETO ---
      const sheetResumo = workbook.addWorksheet('Visão Geral', { tabColor: { argb: 'FF007ACC' } }); // Azul Tech

      // Estilização de Título
      sheetResumo.mergeCells('B2:E2');
      const titleCell = sheetResumo.getCell('B2');
      titleCell.value = `Relatório Técnico: ${projeto.name}`;
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Dados do Projeto
      sheetResumo.getCell('B4').value = "Cliente:";
      sheetResumo.getCell('C4').value = projeto.client || "N/A";

      sheetResumo.getCell('B5').value = "Localização:";
      sheetResumo.getCell('C5').value = projeto.location || "N/A";

      sheetResumo.getCell('B6').value = "Total de Cálculos:";
      sheetResumo.getCell('C6').value = totalCalculos;

      sheetResumo.getCell('B7').value = "Data de Emissão:";
      sheetResumo.getCell('C7').value = new Date().toLocaleString('pt-BR');

      // Ajuste de largura
      sheetResumo.getColumn('B').width = 20;
      sheetResumo.getColumn('C').width = 40;


      // --- ABA 2: LISTA DE MATERIAIS (bill of materials) ---
      const sheetBOM = workbook.addWorksheet('Lista de Materiais', { tabColor: { argb: 'FF27AE60' } }); // Verde Sucesso

      // Cabeçalhos Profissionais
      sheetBOM.columns = [
        { header: 'Item', key: 'idx', width: 10 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Descrição do Material', key: 'desc', width: 50 },
        { header: 'Qtd.', key: 'qtd', width: 12 },
        { header: 'Unid.', key: 'unid', width: 10 },
      ];

      // Estilo do Cabeçalho
      const headerRow = sheetBOM.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
      headerRow.alignment = { horizontal: 'center' };

      // Preenchimento dos Dados
      materiaisConsolidados.forEach((mat, index) => {
        const row = sheetBOM.addRow({
          idx: index + 1,
          code: mat.codigo,
          desc: mat.item,
          qtd: mat.quantidade,
          unid: mat.unidade || 'UN'
        });

        // Alternar cores (Zebra striping) para legibilidade
        if (index % 2 !== 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        }

        row.getCell('qtd').alignment = { horizontal: 'center' };
        row.getCell('unid').alignment = { horizontal: 'center' };
        row.getCell('idx').alignment = { horizontal: 'center' };
      });

      // Bordas
      sheetBOM.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // 3. Gerar Buffer
      const buffer = await workbook.xlsx.writeBuffer();
      logger.info(`Excel gerado para Projeto #${projectId} (${buffer.byteLength} bytes).`);

      return buffer;

    } catch (error) {
      logger.error(`Erro ao gerar Excel: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ExportService;
