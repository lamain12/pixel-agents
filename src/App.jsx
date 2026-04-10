import React, { useState } from 'react';
import useSessionStore from './stores/sessionStore.js';
import useSessionEvents from './hooks/useSessionEvents.js';
import { statusLabel, statusColor, formatDuration } from './types/session.js';
import PixelScene from './components/PixelScene/PixelScene.jsx';
import Settings from './components/Settings/Settings.jsx';

function SessionCard({ session }) {
  const color = statusColor(session.status);

  return (
    <div className="session-card">
      <div className="session-indicator" style={{ backgroundColor: color }} />
      <div className="session-info">
        <div className="session-label">{session.label}</div>
        <div className="session-meta">
          <span className="session-status" style={{ color }}>
            {statusLabel(session.status)}
          </span>
          <span className="session-duration">
            {formatDuration(session.info.startedAt)}
          </span>
        </div>
        <div className="session-cwd">{session.info.cwd}</div>
      </div>
    </div>
  );
}

function SessionList() {
  const getSortedSessions = useSessionStore((s) => s.getSortedSessions);
  const sessions = getSortedSessions();

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <p>No active Claude sessions detected</p>
        <p className="empty-hint">Start a Claude Code session and it will appear here</p>
      </div>
    );
  }

  return (
    <div className="session-list">
      {sessions.map((session) => (
        <SessionCard key={session.info.sessionId} session={session} />
      ))}
    </div>
  );
}

function App() {
  useSessionEvents();
  const [view, setView] = useState('scene');
  const [showSettings, setShowSettings] = useState(false);
  const getSortedSessions = useSessionStore((s) => s.getSortedSessions);
  const sessions = getSortedSessions();

  return (
    <div className="app">
      <header className="app-header">
        <h1>PixelOps</h1>
        <div className="header-right">
          <span className="session-count">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
          <div className="view-toggle">
            <button
              className={view === 'scene' ? 'active' : ''}
              onClick={() => setView('scene')}
            >
              Scene
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </div>
      </header>
      <main className="app-content">
        {view === 'scene' ? <PixelScene /> : <SessionList />}
      </main>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
