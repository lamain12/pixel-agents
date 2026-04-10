const { ipcMain } = require('electron');

function formatWebhookPayload(session) {
  const duration = formatDuration(session.info.startedAt);
  const statusText = {
    completed: 'completed',
    errored: 'encountered an error',
    waiting: 'is waiting for input',
  }[session.status] || session.status;

  return {
    text: `PixelOps: *${session.label}* ${statusText} (${duration})`,
    // Discord uses "content" instead of "text"
    content: `PixelOps: **${session.label}** ${statusText} (${duration})`,
  };
}

function formatDuration(startedAt) {
  const ms = Date.now() - startedAt;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

async function sendWebhook(url, session) {
  const payload = formatWebhookPayload(session);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, status: response.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function setupWebhookIPC() {
  ipcMain.handle('test-webhook', async (_event, url) => {
    const testPayload = {
      info: { startedAt: Date.now() - 120000 },
      label: 'Test Session',
      status: 'completed',
    };
    return sendWebhook(url, testPayload);
  });
}

module.exports = { sendWebhook, setupWebhookIPC };
