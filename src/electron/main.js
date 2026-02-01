const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  // Iniciar o backend automaticamente junto com o Electron
  // NOTE: Desabilitado pois o 'concurrently' agora gerencia o backend no script 'start'
  // serverProcess = spawn('node', [path.join(__dirname, '../backend/server.js')]);

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Sistema de Engenharia - Tração e Materiais",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    // Carrega o frontend React (Vite) em desenvolvimento
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Carrega o arquivo compilado do React em produção
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill(); // Encerra o servidor ao fechar o app
  if (process.platform !== 'darwin') app.quit();
});
