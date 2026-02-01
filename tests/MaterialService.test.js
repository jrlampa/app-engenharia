const { buscarMateriaisNoCSV } = require('../src/backend/services/MaterialService');
const path = require('path');

describe('MaterialService Integration', () => {
  const mockDbPath = path.join(__dirname, '../src/backend/data/MOCK_DB.csv');

  test('Deve recuperar materiais do kit CE2 corretamente', async () => {
    const materiais = await buscarMateriaisNoCSV("CE2 BRAÇO J", mockDbPath);

    expect(materiais.length).toBe(3);
    expect(materiais[0].codigo).toBe('1001');
    expect(materiais[0].item).toBe('Poste Concreto');
    expect(materiais[0].qtd).toBe('1');
  });

  test('Deve recuperar materiais do kit CE3 corretamente', async () => {
    const materiais = await buscarMateriaisNoCSV("CE3 BRAÇO J", mockDbPath);

    expect(materiais.length).toBe(2);
    expect(materiais[0].codigo).toBe('2001');
  });

  test('Deve lançar erro para kit inexistente (não encontrado no CSV)', async () => {
    await expect(buscarMateriaisNoCSV("KIT INEXISTENTE", mockDbPath))
      .rejects
      .toThrow('Kit "KIT INEXISTENTE" não encontrado no banco de dados');
  });

  test('Deve lançar erro se arquivo não existir', async () => {
    await expect(buscarMateriaisNoCSV("TESTE", "./caminho/falso.csv"))
      .rejects
      .toThrow("Banco de dados de materiais não encontrado.");
  });
});
