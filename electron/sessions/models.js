const STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERRORED: 'errored',
  WAITING: 'waiting',
  UNKNOWN: 'unknown',
};

/**
 * @typedef {Object} SessionInfo
 * @property {number} pid
 * @property {string} sessionId
 * @property {string} cwd
 * @property {number} startedAt
 * @property {string} kind
 * @property {string} entrypoint
 */

/**
 * @typedef {Object} SessionState
 * @property {SessionInfo} info
 * @property {string} status - One of STATUS values
 * @property {number} lastActivity - timestamp ms
 * @property {string|null} projectPath - path to JSONL file
 * @property {string} label - friendly name derived from cwd
 */

function createSessionState(info, projectPath) {
  const cwdParts = info.cwd.split('/');
  const label = cwdParts[cwdParts.length - 1] || info.cwd;

  return {
    info,
    status: STATUS.ACTIVE,
    lastActivity: info.startedAt,
    projectPath,
    label,
  };
}

module.exports = { STATUS, createSessionState };
