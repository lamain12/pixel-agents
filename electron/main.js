const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { discoverSessions } = require('./sessions/discovery');
const { SessionWatcher } = require('./sessions/watcher');

let mainWindow = null;
let watcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    title: 'PixelOps',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In dev, load from Vite dev server; in prod, load built files
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function startSessionWatcher() {
  const initialSessions = discoverSessions();
  console.log(`[PixelOps] Discovered ${initialSessions.length} active sessions`);

  watcher = new SessionWatcher(mainWindow);
  watcher.start(initialSessions);

  // IPC handler for renderer to get current sessions
  ipcMain.handle('get-sessions', () => {
    return watcher.getSessions();
  });
}

app.whenReady().then(() => {
  createWindow();
  startSessionWatcher();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (watcher) {
    watcher.stop();
  }
});
