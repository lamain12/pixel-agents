# CLAUDE.md — Project Context for Claude Code

## What is this project?

PixelOps is a desktop app (Electron + React + PixiJS) that monitors running Claude Code sessions and displays them as animated pixel art characters in a command center scene. It provides reliable notifications, a menu bar presence, and webhook push for AFK monitoring.

## Tech Stack

- **Electron** for the desktop shell (main process in `electron/`, renderer in `src/`)
- **React 18** with plain JavaScript (no TypeScript)
- **PixiJS v8** with `@pixi/react` for the pixel art canvas
- **Zustand** for state management (with persist middleware for settings)
- **Vite 5** as the dev server and bundler
- **chokidar v3** for file system watching (v3 for CommonJS compat)
- **Plain CSS** for styling (no Tailwind or CSS frameworks)

## Key Architecture

### Two-process model (Electron)
- `electron/main.js` — main process. Creates window, starts session watcher, handles IPC, manages tray and notifications.
- `electron/preload.js` — bridges main<>renderer via `contextBridge`.
- `src/` — renderer process. React app with PixiJS canvas.

### Session discovery
- Reads `~/.claude/sessions/*.json` to find active Claude Code sessions (keyed by PID)
- Tails `~/.claude/projects/{encoded-path}/{sessionId}.jsonl` for activity/status updates
- Determines status heuristically: PID liveness + time since last write + JSONL content
- Uses chokidar to watch for file changes in real time

### Session file formats
- **Session file** (`~/.claude/sessions/{pid}.json`): `{"pid", "sessionId", "cwd", "startedAt", "kind", "entrypoint"}`
- **JSONL entries**: each line has `type` (permission-mode, file-history-snapshot, user, assistant), `message`, `sessionId`
- Assistant messages have `message.stop_reason` and `message.usage` (token counts)

### Notification system
- Priority queue: errors > waiting for input > completions
- Desktop notifications via Electron Notification API
- Click-to-focus terminal via AppleScript (macOS)
- Optional webhook push to Slack/Discord/Telegram

### Pixel art scene
- PixiJS v8 canvas with @pixi/react
- `extend()` to register pixi components, lowercase JSX tags (`<pixiSprite>`, `<pixiContainer>`)
- Spritesheet animation: 4 frames per state (128x32 PNGs), frame switching via interval
- Character positions mapped to predefined desk slots in the command center background

## Coding Conventions

- Plain JavaScript, no TypeScript
- Plain CSS, no Tailwind
- Functional React components with hooks
- Zustand for stores (small, focused stores)
- CommonJS (`require`) in Electron main process, ESM (`import`) in renderer/React

## Running

```bash
pnpm install
pnpm dev          # starts Vite + Electron concurrently
pnpm vite:build   # build frontend only
pnpm build        # full production build
```

## File Layout

```
electron/               # Main process code
  main.js               # Entry: window + tray + watcher + notifications
  preload.js            # IPC bridge
  tray.js               # System tray with color-coded status
  notifications.js      # Priority notification engine
  focus.js              # Click-to-focus terminal (AppleScript)
  webhooks.js           # Slack/Discord/Telegram webhook push
  sessions/
    models.js           # Status constants, SessionState shape
    discovery.js        # Reads ~/.claude/sessions/, checks PID liveness
    parser.js           # Tails JSONL files, determines session status
    watcher.js          # chokidar watcher, emits IPC events
src/                    # Renderer process (React)
  main.jsx              # React entry
  App.jsx               # Root: header + scene/list toggle + settings
  App.css               # Global styles
  types/session.js      # Status constants, colors, formatting
  stores/
    sessionStore.js     # Session state with priority sorting
    settingsStore.js    # Persisted settings (notifications, webhooks)
  hooks/
    useSessionEvents.js # IPC listener for session events
  components/
    PixelScene/         # PixiJS command center
      PixelScene.jsx    # Canvas with background + characters
      Character.jsx     # Animated sprite per session
      Tooltip.jsx       # Hover tooltip overlay
      useCharacterPositions.js
    Settings/           # Settings overlay
      Settings.jsx      # Toggles for notifications, webhook config
assets/
  icons/                # Tray icons (green/yellow/red/gray)
  sprites/              # Spritesheets + command center background
```
