const fs = require('fs');
const { STATUS } = require('./models');

class SessionTailer {
  constructor() {
    // Map of filePath -> byte offset
    this.cursors = new Map();
  }

  readNewLines(filePath) {
    if (!fs.existsSync(filePath)) return [];

    const stat = fs.statSync(filePath);
    const cursor = this.cursors.get(filePath) || 0;

    if (stat.size <= cursor) return [];

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(stat.size - cursor);
    fs.readSync(fd, buffer, 0, buffer.length, cursor);
    fs.closeSync(fd);

    const text = buffer.toString('utf-8');
    const lines = text.split('\n');

    // Only process complete lines (ending with newline)
    // Keep the last incomplete line by not advancing cursor past it
    const completeLines = [];
    let bytesRead = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i < lines.length - 1) {
        // Complete line (has a newline after it)
        bytesRead += Buffer.byteLength(line + '\n', 'utf-8');
        if (line.trim()) {
          try {
            completeLines.push(JSON.parse(line));
          } catch {
            // Skip malformed JSON lines
          }
        }
      } else if (line === '') {
        // File ended with a newline, nothing left
      }
      // else: incomplete last line, don't advance cursor past it
    }

    this.cursors.set(filePath, cursor + bytesRead);
    return completeLines;
  }

  determineStatus(lines) {
    if (lines.length === 0) return null;

    // Look at the last few entries to determine status
    const recent = lines.slice(-10);

    for (let i = recent.length - 1; i >= 0; i--) {
      const entry = recent[i];

      // Check for errors in assistant messages
      if (entry.type === 'assistant' && entry.message) {
        if (entry.message.stop_reason === 'error') {
          return STATUS.ERRORED;
        }
        // Check for tool use results that indicate errors
        if (entry.message.content && Array.isArray(entry.message.content)) {
          for (const block of entry.message.content) {
            if (block.type === 'text' && block.text &&
                (block.text.includes('Error:') || block.text.includes('error:'))) {
              // Only flag if it looks like a real error, not just discussing errors
              // This is heuristic — may need tuning
            }
          }
        }
      }

      // If the last entry is a user type with tool approval needed, it's waiting
      if (entry.type === 'user' && entry.message && entry.message.content) {
        const content = typeof entry.message.content === 'string'
          ? entry.message.content
          : JSON.stringify(entry.message.content);
        if (content.includes('permission') || content.includes('approve')) {
          return STATUS.WAITING;
        }
      }
    }

    return STATUS.ACTIVE;
  }

  // Initialize cursor to end of file (skip existing content)
  seekToEnd(filePath) {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    this.cursors.set(filePath, stat.size);
  }
}

module.exports = { SessionTailer };
