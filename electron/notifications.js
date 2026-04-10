const { Notification } = require('electron');
const { focusTerminalForPid } = require('./focus');

const PRIORITY = {
  errored: 0,
  waiting: 1,
  completed: 2,
};

class NotificationEngine {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(session, oldStatus) {
    // Only notify on meaningful transitions
    if (session.status === 'completed' && oldStatus === 'active') {
      this.queue.push({ session, priority: PRIORITY.completed });
    } else if (session.status === 'errored') {
      this.queue.push({ session, priority: PRIORITY.errored });
    } else if (session.status === 'waiting') {
      this.queue.push({ session, priority: PRIORITY.waiting });
    } else {
      return;
    }

    // Sort by priority (lower number = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority);
    this.processQueue();
  }

  processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const item = this.queue.shift();
    this.sendNotification(item.session);

    // Small delay between notifications to avoid flooding
    setTimeout(() => {
      this.processing = false;
      this.processQueue();
    }, 500);
  }

  sendNotification(session) {
    if (!Notification.isSupported()) {
      console.log('[PixelOps] Notifications not supported on this system');
      return;
    }

    const title = this.getTitle(session);
    const body = this.getBody(session);

    const notification = new Notification({
      title,
      body,
      silent: session.status === 'completed',
    });

    notification.on('click', () => {
      focusTerminalForPid(session.info.pid);
    });

    notification.show();
  }

  getTitle(session) {
    switch (session.status) {
      case 'errored':
        return `Error: ${session.label}`;
      case 'waiting':
        return `Needs attention: ${session.label}`;
      case 'completed':
        return `Done: ${session.label}`;
      default:
        return `PixelOps: ${session.label}`;
    }
  }

  getBody(session) {
    const duration = this.formatDuration(session.info.startedAt);
    switch (session.status) {
      case 'errored':
        return `Session encountered an error after ${duration}`;
      case 'waiting':
        return `Session is waiting for your input (${duration})`;
      case 'completed':
        return `Session completed in ${duration}`;
      default:
        return `Status: ${session.status} (${duration})`;
    }
  }

  formatDuration(startedAt) {
    const ms = Date.now() - startedAt;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }
}

module.exports = { NotificationEngine };
