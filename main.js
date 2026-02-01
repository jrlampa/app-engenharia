/**
 * DOCUMENTAÇÃO:
 * Este é o processo principal do Electron. 
 * Ele inicia um servidor Express na porta 5000 para processar cálculos
 * e carrega a interface do React.
 */

const { app, BrowserWindow } = require('electron');
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Configuração do Servidor Express (Backend) ---
const server = express();
server.use(cors());
server.use(express.json());

// Exemplo de rota para cálculo de Queda de Tensão
server.post('/calcular-queda', (req, res) => {
  const { tensao, corrente, resistencia } = req.body;
  // Lógica baseada na sua planilha
  const queda = (resistencia * corrente) / tensao;
  res.json({ resultado: queda });
});

server.listen(5000, () => console.log('Backend rodando na porta 5000'));

// --- Configuração da Janela do Electron ---
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Em desenvolvimento, aponta para o servidor do React
  // Em produção, apontaria para o arquivo index.html buildado
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
