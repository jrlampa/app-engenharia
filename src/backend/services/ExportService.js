const ExcelJS = require('exceljs');
const ReportingService = require('./ReportingService');
const DataTransformer = require('../utils/DataTransformer');
const logger = require('../utils/logger');

/**
 * Service para Exportação de Dados em Excel (v0.3.6 - Stream Edition).
 * Focado em performance para grandes volumes de dados.
 */
class ExportService {
  /**
   * Gera o Stream do arquivo Excel do projeto.
   * @param {number} projectId 
   * @param {Stream} res - Express response stream
   */
  static async streamProjectExcel(projectId, res) {
    try {
      const report = await ReportingService.generateMaterialReport(projectId);
      const data = DataTransformer.transformMaterialsForExport(report.materiaisConsolidados);

      const options = {
        stream: res, // Pipe direto para o response
        useStyles: true,
        useSharedStrings: true
      };

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options);
      const sheet = workbook.addWorksheet('Lista de Materiais');

      // 1. Configurar Colunas
      sheet.columns = [
        { header: 'CÓDIGO', key: 'Codigo', width: 15 },
        { header: 'DESCRIÇÃO', key: 'Descricao', width: 50 },
        { header: 'QUANTIDADE', key: 'Quantidade', width: 15 },
        { header: 'UNIDADE', key: 'Unidade', width: 10 },
        { header: 'PREÇO UNIT (R$)', key: 'PrecoUnitario', width: 18 },
        { header: 'SUBTOTAL (R$)', key: 'Subtotal', width: 18 }
      ];

      // Estilo Header
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007BFF' } };

      // 2. Adicionar Linhas por Stream
      data.forEach(row => {
        sheet.addRow(row).commit(); // Commit envia pro stream e libera RAM
      });

      // 3. Finalizar
      await workbook.commit();
      logger.info(`Excel gerado via Stream para Projeto #${projectId}`);
    } catch (error) {
      logger.error(`Erro ao exportar Excel (Stream): ${error.message}`);
      throw error;
    }
  }

  // Depreciado: generateProjectExcel (Buffer version). Mantido para compatibilidade se necessário.
}

module.exports = ExportService;
