import React from 'react';
import { statusLabel, statusColor, formatDuration } from '../../types/session.js';

export default function Tooltip({ session, position }) {
  if (!session || !position) return null;

  const color = statusColor(session.status);

  return (
    <div
      className="pixel-tooltip"
      style={{
        left: position.x + 40,
        top: position.y - 10,
      }}
    >
      <div className="tooltip-label">{session.label}</div>
      <div className="tooltip-status" style={{ color }}>{statusLabel(session.status)}</div>
      <div className="tooltip-duration">{formatDuration(session.info.startedAt)}</div>
      <div className="tooltip-cwd">{session.info.cwd}</div>
    </div>
  );
}
