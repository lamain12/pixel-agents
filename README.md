# PixelOps

A pixel art command center for monitoring multiple Claude Code sessions. PixelOps gives you ambient awareness of all your running Claude agents through an animated pixel art scene, reliable notifications, and a menu bar presence.

## What It Does

- **Auto-detects Claude Code sessions** by watching `~/.claude/` session files
- **Pixel art command center** where each session is an animated character with visual state (working, done, errored)
- **Menu bar icon** showing active session count with color-coded status
- **Reliable desktop notifications** with priority ranking (errors surface before completions)
- **Click-to-focus** brings you directly to the relevant terminal
- **Webhook push** to Slack, Discord, or Telegram for AFK monitoring
- **Hover tooltips** on characters showing session name, status, and duration

## Tech Stack

- **Electron** — desktop shell with native tray, notifications, and window management
- **React 18** — UI framework (plain JavaScript, no TypeScript)
- **PixiJS v8** — 2D WebGL renderer for the pixel art scene
- **Zustand** — lightweight state management
- **Vite 5** — fast dev server and bundler
- **chokidar** — file system watcher for session detection

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run in development mode (launches Vite + Electron)
pnpm dev

# Build for production
pnpm build
```

## How It Works

1. **Session Discovery** — Reads `~/.claude/sessions/*.json` to find active Claude Code processes, checks PID liveness
2. **Activity Monitoring** — Tails `~/.claude/projects/{path}/{sessionId}.jsonl` files for real-time status updates
3. **Visual Rendering** — Maps each session to a pixel art character in a command center scene
4. **Notifications** — Fires desktop alerts (and optional webhooks) when sessions complete or error, prioritized by severity

## Project Structure

```
pixel-agents/
  electron/               # Electron main process
    main.js               # App entry, window creation, watcher setup
    preload.js            # IPC bridge to renderer
    sessions/
      models.js           # Session state types and constants
      discovery.js        # Finds active Claude sessions
      parser.js           # Tails JSONL files, determines status
      watcher.js          # chokidar file watcher, emits events
  src/                    # React frontend (renderer process)
    main.jsx              # React entry point
    App.jsx               # Root component
    App.css               # Global styles
  assets/                 # Sprites, icons, sounds
```

## Roadmap

| Version | Theme | Key Features |
|---------|-------|-------------|
| v0.1 | Awareness MVP | Session detection, menu bar, notifications, basic pixel scene, webhooks |
| v0.2 | Intelligence | Token/cost tracking, daily cost dashboard, session timeline |
| v0.3 | Interaction | Mid-session messaging, pause/cancel, scene themes |
| v1.0 | Teams | Shared dashboards, team cost controls |

## License

MIT
