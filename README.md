# PixelOps

A pixel art command center for monitoring multiple Claude Code sessions. PixelOps gives you ambient awareness of all your running Claude agents through an animated pixel art scene, reliable notifications, and a menu bar presence.

## Features

- **Pixel art command center** — animated characters represent each Claude session, with visual states for working, done, and errored
- **Auto-detects sessions** — watches `~/.claude/` to find running Claude Code processes in real time
- **Menu bar icon** — shows active session count with color-coded status (green/yellow/red)
- **Priority notifications** — errors surface before completions, with click-to-focus terminal
- **Webhook push** — forward notifications to Slack, Discord, or Telegram for AFK monitoring
- **Hover tooltips** — session name, status, and duration at a glance
- **Dual view** — switch between the pixel art scene and a compact session list
- **Settings panel** — configure notifications, sound, and webhook preferences

## Tech Stack

- **Electron** — desktop shell with native tray, notifications, and window management
- **React 18** — UI framework (plain JavaScript)
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

1. **Session Discovery** — reads `~/.claude/sessions/*.json` to find active Claude Code processes and checks PID liveness
2. **Activity Monitoring** — tails `~/.claude/projects/{path}/{sessionId}.jsonl` files for real-time status updates
3. **Visual Rendering** — maps each session to a pixel art character in a command center scene
4. **Notifications** — fires desktop alerts (and optional webhooks) when sessions complete or error, prioritized by severity
5. **System Tray** — persistent menu bar icon with aggregate status and quick-access session list

## Project Structure

```
pixel-agents/
  electron/               # Electron main process
    main.js               # App entry, window, tray, watcher, notifications
    preload.js            # IPC bridge to renderer
    tray.js               # System tray icon and menu
    notifications.js      # Priority notification engine
    focus.js              # Click-to-focus terminal (AppleScript)
    webhooks.js           # Slack/Discord/Telegram webhook
    sessions/
      models.js           # Session state types and constants
      discovery.js        # Finds active Claude sessions
      parser.js           # Tails JSONL files, determines status
      watcher.js          # File watcher, emits events
  src/                    # React frontend (renderer process)
    App.jsx               # Root with scene/list toggle + settings
    components/
      PixelScene/         # PixiJS command center with characters
      Settings/           # Notification and webhook preferences
    stores/               # Zustand state management
    hooks/                # IPC event listeners
  assets/                 # Sprites, icons, sounds
```

## Roadmap

| Version | Theme | Key Features |
|---------|-------|-------------|
| **v0.1** | Awareness MVP | Session detection, menu bar, notifications, pixel scene, webhooks |
| v0.2 | Intelligence | Token/cost tracking, daily cost dashboard, session timeline |
| v0.3 | Interaction | Mid-session messaging, pause/cancel, scene themes |
| v1.0 | Teams | Shared dashboards, team cost controls |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture guide, and contribution guidelines.

## License

MIT
