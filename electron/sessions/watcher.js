const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { SESSIONS_DIR, PROJECTS_DIR, isPidAlive, findProjectPath } = require('./discovery');
const { STATUS, createSessionState } = require('./models');
const { SessionTailer } = require('./parser');

class SessionWatcher {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.sessions = new Map(); // sessionId -> SessionState
    this.tailer = new SessionTailer();
    this.watchers = [];
    this.pollInterval = null;
  }

  start(initialSessions) {
    // Populate initial state
    for (const session of initialSessions) {
      this.sessions.set(session.info.sessionId, session);
      // Seek to end of existing JSONL files so we only get new activity
      if (session.projectPath) {
        this.tailer.seekToEnd(session.projectPath);
      }
    }

    // Watch sessions directory for new/removed session files
    if (fs.existsSync(SESSIONS_DIR)) {
      const sessionsWatcher = chokidar.watch(SESSIONS_DIR, {
        ignoreInitial: true,
        depth: 0,
      });

      sessionsWatcher.on('add', (filePath) => this.onSessionFileAdded(filePath));
      sessionsWatcher.on('unlink', (filePath) => this.onSessionFileRemoved(filePath));
      this.watchers.push(sessionsWatcher);
    }

    // Watch projects directory for JSONL changes
    if (fs.existsSync(PROJECTS_DIR)) {
      const projectsWatcher = chokidar.watch(PROJECTS_DIR, {
        ignoreInitial: true,
        depth: 2,
      });

      projectsWatcher.on('change', (filePath) => this.onJsonlChanged(filePath));
      this.watchers.push(projectsWatcher);
    }

    // Poll for PID liveness every 5 seconds
    this.pollInterval = setInterval(() => this.checkPidLiveness(), 5000);
  }

  stop() {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  getSessions() {
    return Array.from(this.sessions.values());
  }

  onSessionFileAdded(filePath) {
    if (!filePath.endsWith('.json')) return;

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const info = JSON.parse(raw);
      const projectPath = findProjectPath(info.sessionId);
      const session = createSessionState(info, projectPath);

      this.sessions.set(info.sessionId, session);

      if (projectPath) {
        this.tailer.seekToEnd(projectPath);
      }

      this.emit('session-started', session);
    } catch {
      // Skip malformed files
    }
  }

  onSessionFileRemoved(filePath) {
    if (!filePath.endsWith('.json')) return;

    const pidStr = path.basename(filePath, '.json');
    for (const [sessionId, session] of this.sessions) {
      if (String(session.info.pid) === pidStr) {
        session.status = STATUS.COMPLETED;
        session.lastActivity = Date.now();
        this.emit('session-ended', session);
        // Keep in map so it shows as completed
        break;
      }
    }
  }

  onJsonlChanged(filePath) {
    if (!filePath.endsWith('.jsonl')) return;

    // Find which session this JSONL belongs to
    const sessionId = path.basename(filePath, '.jsonl');
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Might be a new session whose session file we haven't seen yet
      // Try to discover it
      return;
    }

    // Read new lines and determine status
    const newLines = this.tailer.readNewLines(filePath);
    if (newLines.length === 0) return;

    const newStatus = this.tailer.determineStatus(newLines);
    if (newStatus) {
      const oldStatus = session.status;
      session.status = newStatus;
      session.lastActivity = Date.now();

      // If project path wasn't known before, set it now
      if (!session.projectPath) {
        session.projectPath = filePath;
      }

      this.emit('session-updated', { session, oldStatus });
    }
  }

  checkPidLiveness() {
    for (const [sessionId, session] of this.sessions) {
      if (session.status === STATUS.COMPLETED || session.status === STATUS.ERRORED) {
        continue;
      }

      if (!isPidAlive(session.info.pid)) {
        const oldStatus = session.status;
        session.status = STATUS.COMPLETED;
        session.lastActivity = Date.now();
        this.emit('session-ended', session);
      }
    }
  }

  emit(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, JSON.parse(JSON.stringify(data)));
    }
  }
}

module.exports = { SessionWatcher };
