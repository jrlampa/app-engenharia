const { app, BrowserWindow } = require('electron');
const path = require('path');
const serverApp = require('../backend/server');

// Inicia o servidor Express quando o Electron iniciar
const PORT = 5000;
serverApp.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});

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
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
