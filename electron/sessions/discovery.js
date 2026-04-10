const fs = require('fs');
const path = require('path');
const os = require('os');
const { createSessionState } = require('./models');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SESSIONS_DIR = path.join(CLAUDE_DIR, 'sessions');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function findProjectPath(sessionId) {
  if (!fs.existsSync(PROJECTS_DIR)) return null;

  const projectDirs = fs.readdirSync(PROJECTS_DIR);
  for (const dir of projectDirs) {
    const jsonlPath = path.join(PROJECTS_DIR, dir, `${sessionId}.jsonl`);
    if (fs.existsSync(jsonlPath)) {
      return jsonlPath;
    }
  }
  return null;
}

function discoverSessions() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];

  const sessions = [];
  const files = fs.readdirSync(SESSIONS_DIR);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    try {
      const filePath = path.join(SESSIONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const info = JSON.parse(raw);

      if (!isPidAlive(info.pid)) continue;

      const projectPath = findProjectPath(info.sessionId);
      sessions.push(createSessionState(info, projectPath));
    } catch {
      // Skip malformed session files
    }
  }

  return sessions;
}

module.exports = { discoverSessions, CLAUDE_DIR, SESSIONS_DIR, PROJECTS_DIR, isPidAlive, findProjectPath };
