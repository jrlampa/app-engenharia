const ExcelJS = require('exceljs');
const ReportingService = require('./ReportingService');
const DataTransformer = require('../utils/DataTransformer');
const themes = require('../config/exportThemes').default;
const logger = require('../utils/logger');

/**
 * Service para Exportação de Dados em Excel (v0.3.7 - True Streaming).
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
        stream: res, // TRUE STREAMING: Pipe direto para o response
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

      // Estilo Header usando Temas
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: themes.primary.replace('#', 'FF') }
      };

      // 2. Adicionar Linhas por Stream
      data.forEach(row => {
        sheet.addRow(row).commit(); // Commit envia pro stream chunk por chunk
      });

      // 3. Finalizar
      await workbook.commit();
      logger.info(`Excel gerado via True Stream para Projeto #${projectId}`);
    } catch (error) {
      logger.error(`Erro ao exportar Excel (Stream): ${error.message}`);
      throw error;
    }
  }
}

module.exports = ExportService;
