const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSessions: () => ipcRenderer.invoke('get-sessions'),
  onSessionStarted: (callback) => {
    ipcRenderer.on('session-started', (_event, data) => callback(data));
  },
  onSessionUpdated: (callback) => {
    ipcRenderer.on('session-updated', (_event, data) => callback(data));
  },
  onSessionEnded: (callback) => {
    ipcRenderer.on('session-ended', (_event, data) => callback(data));
  },
  testWebhook: (url) => ipcRenderer.invoke('test-webhook', url),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
