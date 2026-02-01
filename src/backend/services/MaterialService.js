const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const logger = require('../utils/logger');

/**
 * Busca materiais no arquivo CSV baseado no kit sugerido.
 * 
 * @param {string} kitSugerido - Nome do kit (ex: "CE2 BRAÇO J")
 * @param {string|null} caminhoArquivo - Caminho customizado do CSV (para testes)
 * @returns {Promise<Array>} Lista de materiais
 * @throws {Error} Se o arquivo não existir ou houver erro de leitura
 */
const buscarMateriaisNoCSV = (kitSugerido, caminhoArquivo = null) => {
  return new Promise((resolve, reject) => {
    const resultados = [];
    let capturando = false;
    let kitEncontrado = false; // Flag para rastrear se o kit foi localizado no CSV
    const caminhoCSV = caminhoArquivo || path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

    // Validação de entrada
    if (!kitSugerido || typeof kitSugerido !== 'string') {
      return reject(new Error("Nome do kit inválido."));
    }

    // Check if file exists
    if (!fs.existsSync(caminhoCSV)) {
      logger.error(`CSV file not found at: ${caminhoCSV}`);
      return reject(new Error("Banco de dados de materiais não encontrado."));
    }

    fs.createReadStream(caminhoCSV)
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        // Normalização para evitar erros com espaços extras
        const colunaIdentificador = row[1] ? row[1].trim() : "";
        const descricao = row[2] ? row[2].trim() : "";
        const quantidade = row[3] ? row[3].trim() : "";
        const kitSugeridoNormalizado = kitSugerido.trim();

        // Início do Bloco
        if (colunaIdentificador === kitSugeridoNormalizado) {
          capturando = true;
          kitEncontrado = true;
          logger.info(`Kit encontrado no CSV: ${kitSugerido}`);
          return;
        }

        // Fim do Bloco: Encontrou outro header relevante (BRAÇO J) ou fim de estrutura
        if (capturando && colunaIdentificador && colunaIdentificador !== kitSugeridoNormalizado && colunaIdentificador.includes('BRAÇO J')) {
          capturando = false;
        }

        if (capturando && colunaIdentificador && descricao) {
          // Garante que é uma linha de item válida (tem código e descrição)
          resultados.push({
            codigo: colunaIdentificador,
            item: descricao,
            qtd: quantidade
          });
        }
      })
      .on('end', () => {
        // Distinção entre "kit não encontrado" e "kit vazio"
        if (!kitEncontrado) {
          logger.warn(`Kit não encontrado no CSV: ${kitSugerido}`);
          return reject(new Error(`Kit "${kitSugerido}" não encontrado no banco de dados. Verifique o nome do kit.`));
        }

        if (resultados.length === 0) {
          // Kit foi encontrado, mas não tinha materiais (caso edge legítimo)
          logger.warn(`Kit encontrado mas sem materiais: ${kitSugerido}`);
        }

        resolve(resultados);
      })
      .on('error', (err) => {
        logger.error(`Erro ao ler CSV: ${err.message}`);
        reject(new Error(`Erro ao ler arquivo CSV: ${err.message}`));
      });
  });
};

module.exports = { buscarMateriaisNoCSV };
