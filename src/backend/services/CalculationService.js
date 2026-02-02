
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
  // DeltaV = (2 * L * I * R) / 1000 (Monofásico/Bifásico)
  const quedaVolts = (2 * comprimento * corrente * resistenciaKm) / 1000;
  const quedaPercentual = (quedaVolts / tensaoNominal) * 100;

  // Norma técnica (limite sugerido de 5%)
  const LIMITE_NORMATIVO = 5;
  const status = quedaPercentual > LIMITE_NORMATIVO ? "CRÍTICO" : "DENTRO DO LIMITE";

  return {
    quedaVolts: Number(quedaVolts.toFixed(3)),
    quedaPercentual: Number(quedaPercentual.toFixed(2)),
    status,
    limite: LIMITE_NORMATIVO
  };
};


module.exports = { calcularTracao, calcularQuedaTensao };
