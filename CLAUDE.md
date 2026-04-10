# CLAUDE.md — Project Context for Claude Code

## What is this project?

PixelOps is a desktop app (Electron + React + PixiJS) that monitors running Claude Code sessions and displays them as animated pixel art characters in a command center scene. It provides reliable notifications, a menu bar presence, and webhook push for AFK monitoring.

## Tech Stack

- **Electron** for the desktop shell (main process in `electron/`, renderer in `src/`)
- **React 18** with plain JavaScript (no TypeScript)
- **PixiJS v8** with `@pixi/react` for the pixel art canvas
- **Zustand** for state management
- **Vite 5** as the dev server and bundler
- **chokidar** for file system watching
- **Plain CSS** for styling (no Tailwind or CSS frameworks)

## Key Architecture

### Two-process model (Electron)
- `electron/main.js` — main process. Creates window, starts session watcher, handles IPC, manages tray.
- `electron/preload.js` — bridges main↔renderer via `contextBridge`.
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
electron/           # Main process code
  main.js           # Entry point, window + watcher setup
  preload.js        # IPC bridge
  sessions/
    models.js       # Status constants, SessionState shape
    discovery.js    # Reads ~/.claude/sessions/, checks PID liveness
    parser.js       # Tails JSONL files, determines session status
    watcher.js      # chokidar watcher, emits IPC events
src/                # Renderer process (React)
  main.jsx          # React entry
  App.jsx           # Root component
  App.css           # Global styles
```
