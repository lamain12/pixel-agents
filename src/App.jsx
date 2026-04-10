import React from 'react';
import useSessionStore from './stores/sessionStore.js';
import useSessionEvents from './hooks/useSessionEvents.js';
import { statusLabel, statusColor, formatDuration } from './types/session.js';

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

function App() {
  useSessionEvents();
  const getSortedSessions = useSessionStore((s) => s.getSortedSessions);
  const sessions = getSortedSessions();

  return (
    <div className="app">
      <header className="app-header">
        <h1>PixelOps</h1>
        <span className="session-count">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
      </header>
      <div className="session-list">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <p>No active Claude sessions detected</p>
            <p className="empty-hint">Start a Claude Code session and it will appear here</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard key={session.info.sessionId} session={session} />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
