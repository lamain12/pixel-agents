const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

const ICON_DIR = path.join(__dirname, '..', 'assets', 'icons');

let tray = null;

function getIcon(name) {
  return nativeImage.createFromPath(path.join(ICON_DIR, name)).resize({ width: 16, height: 16 });
}

function getAggregateIcon(sessions) {
  const hasErrored = sessions.some((s) => s.status === 'errored');
  const hasWaiting = sessions.some((s) => s.status === 'waiting');
  const hasActive = sessions.some((s) => s.status === 'active');

  if (hasErrored) return getIcon('tray-red.png');
  if (hasWaiting) return getIcon('tray-yellow.png');
  if (hasActive) return getIcon('tray-green.png');
  return getIcon('tray-gray.png');
}

function statusEmoji(status) {
  switch (status) {
    case 'active': return '🟢';
    case 'completed': return '⚪';
    case 'errored': return '🔴';
    case 'waiting': return '🟡';
    default: return '⚫';
  }
}

function setupTray(mainWindow) {
  tray = new Tray(getIcon('tray-gray.png'));
  tray.setToolTip('PixelOps — No active sessions');

  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });

  updateTray(mainWindow, []);
  return tray;
}

function updateTray(mainWindow, sessions) {
  if (!tray || tray.isDestroyed()) return;

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'waiting');
  const icon = getAggregateIcon(sessions);
  tray.setImage(icon);

  const count = activeSessions.length;
  tray.setToolTip(`PixelOps — ${count} active session${count !== 1 ? 's' : ''}`);

  const sessionItems = sessions.slice(0, 10).map((s) => ({
    label: `${statusEmoji(s.status)} ${s.label}`,
    click: () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    },
  }));

  const menu = Menu.buildFromTemplate([
    { label: `PixelOps — ${count} active`, enabled: false },
    { type: 'separator' },
    ...sessionItems,
    ...(sessionItems.length > 0 ? [{ type: 'separator' }] : []),
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
}

module.exports = { setupTray, updateTray };
