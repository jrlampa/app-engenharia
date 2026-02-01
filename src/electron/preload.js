const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  calcularTracao: (dados) => ipcRenderer.invoke('calcular-tracao', dados),
  calcularTensao: (dados) => ipcRenderer.invoke('calcular-tensao', dados)
});
