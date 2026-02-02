const { db } = require('../db/client');
const { calculosTracao, calculosTensao, projects } = require('../db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../utils/logger');

/**
 * Service de Auditoria Técnica (v0.3.1).
 * Funciona como um "Engenheiro Virtual" que analisa o projeto em busca de inconsistências e riscos.
 */
class AuditService {
  /**
   * Realiza uma auditoria completa no projeto.
   * @param {number} projectId 
   */
  static async auditProject(projectId) {
    try {
      const inconsistencies = [];

      // 1. Validar Projeto
      const project = await db.select().from(projects).where(eq(projects.id, projectId)).execute();
      if (project.length === 0) throw new Error('Projeto não encontrado.');

      // 2. Regra: Risco de Vão Longo sem Estrutura (Long Span Risk)
      // Vãos > 50m geralmente exigem estruturas robustas. Se não houver materiais definidos, é um risco.
      const tracaoCalculations = await db.select()
        .from(calculosTracao)
        .where(eq(calculosTracao.projectId, projectId))
        .execute();

      tracaoCalculations.forEach(calc => {
        const spanLength = calc.vao || 0;
        const hasMaterials = calc.materiais && calc.materiais !== '[]' && calc.materiais !== '';

        if (spanLength > 50 && !hasMaterials) {
          inconsistencies.push({
            rule: 'MISSING_STRUCTURE_LONG_SPAN',
            severity: 'HIGH',
            title: 'Vão Crítico Sem Estrutura',
            message: `O vão de ${spanLength}m (Cálculo #${calc.id}) não possui lista de materiais definida. Vãos longos exigem validação estrutural.`,
            entityId: calc.id,
            entityType: 'TRACAO'
          });
        }
      });

      // 3. Regra: Tensão Crítica (Critical Voltage Drop)
      // Quedas de tensão acima de 5% são normativamente inaceitáveis para certos padrões.
      const tensaoCalculations = await db.select()
        .from(calculosTensao)
        .where(eq(calculosTensao.projectId, projectId))
        .execute();

      tensaoCalculations.forEach(calc => {
        if (calc.quedaPercentual > 5) {
          inconsistencies.push({
            rule: 'CRITICAL_VOLTAGE_DROP',
            severity: 'MEDIUM', // É um problema, mas o cálculo já avisa. Aqui reforçamos no report geral.
            title: 'Violação de Norma de Tensão',
            message: `Queda de tensão de ${calc.quedaPercentual}% (Cálculo #${calc.id}) excede o limite de 5%. Aumente a bitola do cabo.`,
            entityId: calc.id,
            entityType: 'TENSAO'
          });
        }
      });

      logger.info(`Auditoria Projeto #${projectId}: ${inconsistencies.length} inconsistências encontradas.`);

      return {
        timestamp: new Date().toISOString(),
        totalIssues: inconsistencies.length,
        issues: inconsistencies
      };

    } catch (error) {
      logger.error(`Erro na auditoria do projeto: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AuditService;
