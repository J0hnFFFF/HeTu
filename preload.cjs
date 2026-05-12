const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey) => ipcRenderer.invoke('set-api-key', apiKey),
  deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),
  getExternalApiKeys: () => ipcRenderer.invoke('get-external-api-keys'),
  setExternalApiKeys: (keys) => ipcRenderer.invoke('set-external-api-keys', keys),
  fetchExternalApi: (options) => ipcRenderer.invoke('fetch-external-api', options),
  onShowApiKeySetup: (callback) => ipcRenderer.on('show-api-key-setup', callback)
});
