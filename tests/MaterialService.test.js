const { buscarMateriaisNoCSV, __buildMaterialsIndex } = require('../src/backend/services/MaterialService');
const path = require('path');

describe('MaterialService Integration (Cached)', () => {
  const mockDbPath = path.join(__dirname, '../src/backend/data/MOCK_DB.csv');
  let materialsCache;

  beforeAll(async () => {
    // Constrói o cache uma vez antes de todos os testes
    materialsCache = await __buildMaterialsIndex(mockDbPath);
  });

  test('Deve recuperar materiais do kit CE2 corretamente', async () => {
    const materiais = materialsCache["CE2 BRAÇO J"];

    expect(materiais).toBeDefined();
    expect(materiais.length).toBe(3);
    expect(materiais[0].codigo).toBe('1001');
    expect(materiais[0].item).toBe('Poste Concreto');
    expect(materiais[0].qtd).toBe('1');
  });

  test('Deve recuperar materiais do kit CE3 corretamente', async () => {
    const materiais = materialsCache["CE3 BRAÇO J"];

    expect(materiais).toBeDefined();
    expect(materiais.length).toBe(2);
    expect(materiais[0].codigo).toBe('2001');
  });

  test('Kit inexistente não deve estar no cache', () => {
    const materiais = materialsCache["KIT INEXISTENTE"];
    expect(materiais).toBeUndefined();
  });

  test('Deve construir índice com todos os kits', () => {
    const kits = Object.keys(materialsCache);
    expect(kits).toContain("CE2 BRAÇO J");
    expect(kits).toContain("CE3 BRAÇO J");
    expect(kits.length).toBeGreaterThanOrEqual(2);
  });
});
