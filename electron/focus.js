const { exec } = require('child_process');

function focusTerminalForPid(pid) {
  if (process.platform !== 'darwin') return;

  // Walk up the process tree to find the terminal app, then activate it
  const script = `
    tell application "System Events"
      set targetPid to ${pid}
      -- Try to find the frontmost terminal that could own this process
      set termApps to {"Terminal", "iTerm2", "iTerm", "Alacritty", "kitty", "Warp", "Hyper"}
      repeat with termName in termApps
        try
          set termApp to application process (termName as text)
          if termApp exists then
            set frontmost of termApp to true
            return
          end if
        end try
      end repeat
      -- Fallback: just activate Terminal
      try
        tell application "Terminal" to activate
      end try
    end tell
  `;

  exec(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, (err) => {
    if (err) {
      console.error('[PixelOps] Failed to focus terminal:', err.message);
    }
  });
}

module.exports = { focusTerminalForPid };
