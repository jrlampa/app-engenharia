const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// Importando serviços diretamente para o IPC
const { buscarMateriaisNoCSV } = require('../backend/services/MaterialService');
const { calcularTracao, calcularQuedaTensao } = require('../backend/services/calcService');

// Flag para identificar desenvolvimento vs produção
const isDev = !app.isPackaged;

let mainWindow;
let serverProcess; // Variável para manter referência do servidor (se usado no futuro)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Sistema de Engenharia - Tração e Materiais",
    webPreferences: {
      nodeIntegration: false, // Segurança: Desabilitar node integration
      contextIsolation: true, // Segurança: Habilitar context isolation
      preload: path.join(__dirname, 'preload.js') // Carregar preload script
    },
    show: false // Começa oculto
  });

  if (isDev) {
    // Carrega o frontend React (Vite) em desenvolvimento
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Carrega o arquivo compilado do React em produção
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// --- IPC HANDLERS ---
// Estes handlers substituem as rotas HTTP do servidor Express na versão Desktop

ipcMain.handle('calcular-tracao', async (event, { vao, pesoCabo, tracaoInicial }) => {
  try {
    const { flecha, sugestao } = calcularTracao(vao, pesoCabo, tracaoInicial);
    const materiais = await buscarMateriaisNoCSV(sugestao);
    return {
      sucesso: true,
      resultado: { flecha, sugestao, materiais }
    };
  } catch (error) {
    return { sucesso: false, error: error.message };
  }
});

ipcMain.handle('calcular-tensao', async (event, { tensaoNominal, corrente, comprimento, resistenciaKm }) => {
  try {
    const resultado = calcularQuedaTensao(tensaoNominal, corrente, comprimento, resistenciaKm);
    return { sucesso: true, resultado };
  } catch (error) {
    return { sucesso: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
