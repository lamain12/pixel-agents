export const STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERRORED: 'errored',
  WAITING: 'waiting',
  UNKNOWN: 'unknown',
};

export const STATUS_PRIORITY = {
  [STATUS.ERRORED]: 0,
  [STATUS.WAITING]: 1,
  [STATUS.ACTIVE]: 2,
  [STATUS.COMPLETED]: 3,
  [STATUS.UNKNOWN]: 4,
};

export function formatDuration(startedAt) {
  const ms = Date.now() - startedAt;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function statusLabel(status) {
  switch (status) {
    case STATUS.ACTIVE: return 'Working';
    case STATUS.COMPLETED: return 'Done';
    case STATUS.ERRORED: return 'Error';
    case STATUS.WAITING: return 'Waiting';
    default: return 'Unknown';
  }
}

export function statusColor(status) {
  switch (status) {
    case STATUS.ACTIVE: return '#7cff7c';
    case STATUS.COMPLETED: return '#888';
    case STATUS.ERRORED: return '#ff5555';
    case STATUS.WAITING: return '#ffcc00';
    default: return '#666';
  }
}
