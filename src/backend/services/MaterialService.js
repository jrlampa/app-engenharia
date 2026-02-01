const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const buscarMateriaisNoCSV = (kitSugerido, caminhoArquivo = null) => {
  return new Promise((resolve, reject) => {
    const resultados = [];
    let capturando = false;
    const caminhoCSV = caminhoArquivo || path.join(__dirname, '../data', 'RESUMO KITS MAIS USADOS.xlsx - ESTRUTURAS BRAÇO J.csv');

    // Check if file exists
    if (!fs.existsSync(caminhoCSV)) {
      console.error(`CSV file not found at: ${caminhoCSV}`);
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
          return;
        }

        // Fim do Bloco: Encontrou outro header relevante (BRAÇO J) ou fim de estrutura
        // Melhoria: Detectar se mudou de kit (qualquer texto na coluna 1 que pareça um título e não seja o atual)
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
        if (resultados.length === 0) {
          // Pode não ser um erro técnico, mas é um aviso de negócio
          console.warn(`Nenhum material encontrado para o kit: ${kitSugerido}`);
        }
        resolve(resultados);
      })
      .on('error', (err) => {
        reject(new Error(`Erro ao ler arquivo CSV: ${err.message}`));
      });
  });
};

module.exports = { buscarMateriaisNoCSV };
