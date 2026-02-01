
/**
 * Calcula a flecha e sugere o kit
 * @param {number} vao 
 * @param {number} pesoCabo 
 * @param {number} tracaoInicial 
 * @returns {object} { flecha, sugestao }
 */
const calcularTracao = (vao, pesoCabo, tracaoInicial) => {
  const flecha = (pesoCabo * Math.pow(vao, 2)) / (8 * tracaoInicial);
  const sugestaoKit = flecha > 1.5 ? "CE3 BRAÇO J" : "CE2 BRAÇO J";

  return {
    flecha: Number(flecha.toFixed(2)),
    sugestao: sugestaoKit
  };
};

/**
 * Calcula a queda de tensão
 * @param {number} tensaoNominal 
 * @param {number} corrente 
 * @param {number} comprimento 
 * @param {number} resistenciaKm 
 * @returns {object} { quedaVolts, quedaPercentual, status }
 */
const calcularQuedaTensao = (tensaoNominal, corrente, comprimento, resistenciaKm) => {
  // 1. Cálculo da queda de tensão unitária (V)
  // DeltaV = (2 * L * I * R) / 1000  (Para monofásico/bifásico)
  const quedaVolts = (2 * comprimento * corrente * resistenciaKm) / 1000;

  // 2. Cálculo percentual
  const quedaPercentual = (quedaVolts / tensaoNominal) * 100;

  // Limite normativo geralmente é 5%
  const status = quedaPercentual > 5 ? "CRÍTICO" : "DENTRO DO LIMITE";

  return {
    quedaVolts: quedaVolts.toFixed(2),
    quedaPercentual: quedaPercentual.toFixed(2),
    status: status
  };
};

module.exports = { calcularTracao, calcularQuedaTensao };
