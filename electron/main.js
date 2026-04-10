const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { discoverSessions } = require('./sessions/discovery');
const { SessionWatcher } = require('./sessions/watcher');
const { setupTray, updateTray } = require('./tray');
const { NotificationEngine } = require('./notifications');
const { setupWebhookIPC, sendWebhook } = require('./webhooks');

let mainWindow = null;
let watcher = null;
let tray = null;
let notifier = null;

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

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function refreshTray() {
  if (watcher && tray) {
    updateTray(mainWindow, watcher.getSessions());
  }
}

function startSessionWatcher() {
  const initialSessions = discoverSessions();
  console.log(`[PixelOps] Discovered ${initialSessions.length} active sessions`);

  watcher = new SessionWatcher(mainWindow);

  notifier = new NotificationEngine();

  // Hook into watcher events to update tray and fire notifications
  const origEmit = watcher.emit.bind(watcher);
  watcher.emit = (channel, data) => {
    origEmit(channel, data);
    refreshTray();

    // Fire notifications on state transitions
    if (channel === 'session-updated' && data.oldStatus) {
      notifier.enqueue(data.session, data.oldStatus);
    } else if (channel === 'session-ended') {
      notifier.enqueue(data, 'active');
    }
  };

  watcher.start(initialSessions);
  refreshTray();

  ipcMain.handle('get-sessions', () => {
    return watcher.getSessions();
  });
}

app.whenReady().then(() => {
  createWindow();
  tray = setupTray(mainWindow);
  setupWebhookIPC();
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
