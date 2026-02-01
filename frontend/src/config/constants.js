/**
 * Tabela de Cabos e suas resistências (Ohm/km).
 * Usado para cálculo de queda de tensão.
 * Valores de referência NBR 5410 (cobre, 70°C).
 */
export const TABELA_CABOS = [
  { nome: "10mm²", r: 1.83 },
  { nome: "16mm²", r: 1.15 },
  { nome: "25mm²", r: 0.727 },
  { nome: "35mm²", r: 0.524 }
];
