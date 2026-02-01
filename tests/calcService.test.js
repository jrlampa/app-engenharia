const { calcularTracao, calcularQuedaTensao } = require('../src/backend/services/calcService');

describe('CalculationService', () => {

  test('Deve calcular corretamente a flecha e sugerir kit CE2', () => {
    // vao=40, peso=0.5, tracao=200 -> Flecha = (0.5 * 40^2) / (8 * 200) = 800 / 1600 = 0.5m
    const result = calcularTracao(40, 0.5, 200);
    expect(result.flecha).toBe(0.5);
    expect(result.sugestao).toBe("CE2 BRAÇO J");
  });

  test('Deve sugerir kit CE3 para flecha > 1.5m', () => {
    // vao=80, peso=0.5, tracao=100 -> Flecha = (0.5 * 6400) / 800 = 3200 / 800 = 4.0m
    const result = calcularTracao(80, 0.5, 100);
    expect(result.flecha).toBe(4.00);
    expect(result.sugestao).toBe("CE3 BRAÇO J");
  });

  test('Deve calcular corretamente a queda de tensão e status DENTRO DO LIMITE', () => {
    // 220V, 10A, 50m, 1.83 Ohm/km -> Queda = (2 * 50 * 10 * 1.83) / 1000 = 1830 / 1000 = 1.83V
    // % = (1.83 / 220) * 100 = 0.83%
    const result = calcularQuedaTensao(220, 10, 50, 1.83);
    expect(result.quedaVolts).toBe("1.83");
    expect(Number(result.quedaPercentual)).toBeCloseTo(0.83, 2);
    expect(result.status).toBe("DENTRO DO LIMITE");
  });

  test('Deve indicar status CRÍTICO para queda > 5%', () => {
    // 220V, 50A, 200m, 1.83 Ohm/km -> Queda = (2 * 200 * 50 * 1.83) / 1000 = 36.6V
    // % = (36.6 / 220) * 100 = 16.63%
    const result = calcularQuedaTensao(220, 50, 200, 1.83);
    expect(result.status).toBe("CRÍTICO");
  });
});
