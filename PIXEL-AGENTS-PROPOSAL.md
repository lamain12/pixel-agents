# PixelOps — Pixel Art Agent Mission Control

> A pixel art command center that actually helps you manage multiple Claude sessions — with reliable notifications, cross-session awareness, and "needs attention" prioritization.

---

## The Problem

Running multiple Claude sessions (Claude Code + Cowork) simultaneously is increasingly common, but the experience is broken:

- **Notifications are unreliable.** macOS Focus Mode silently swallows them, different terminals handle them differently, and there's no consistent way to know when a task finishes. There are 7+ open GitHub issues on this.
- **No cross-session awareness.** If you're running 5 agents, none of them know what the others are doing. You have no centralized view.
- **"Needs attention" doesn't exist.** When 3 sessions finish at once, there's no way to know which needs your review first — did one error out? Is one waiting for approval?
- **Existing pixel art tools are pure spectators.** Pixel Agents, Claude Office, AgentRoom — they're fun to look at but you can't intervene, get cost alerts, or receive reliable notifications.

**Nobody combines the fun visual layer with actually useful operational features.** The pixel art tools are eye candy. The notification tools are ugly CLI hooks. PixelOps does both.

---

## Vision

A desktop app that renders a **living pixel art scene** — a command center / workshop where each running Claude session is represented by an animated pixel character. Characters visually reflect their state (working, idle, errored, waiting for input). The app lives in your menu bar and delivers **reliable, prioritized notifications** across macOS, with optional push to your phone.

---

## User Stories

### Epic 1: Notifications & Awareness (MVP Priority)

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| N-1 | As a user running multiple Claude sessions, I want to receive a reliable desktop notification when any session completes, so I never miss a finished task. | Notification fires even when app is in background. Works regardless of macOS Focus Mode (uses critical alert or menu bar fallback). Includes session name and outcome (success/error). |
| N-2 | As a user, I want to see a persistent menu bar icon showing how many sessions are active and their aggregate status, so I have ambient awareness without switching windows. | Menu bar shows count of active sessions. Icon changes color: green (all good), yellow (one needs attention), red (one errored). Click to expand quick status list. |
| N-3 | As a user, I want notifications to be prioritized by urgency, so that errors and approval-waits surface before routine completions. | Notifications are ranked: (1) errors/failures, (2) waiting for user input, (3) successful completions. Errors get persistent banners, completions get transient toasts. |
| N-4 | As a user, I want to click a notification and be taken directly to the relevant session/terminal, so I can act immediately. | Clicking notification focuses the correct terminal window/tab or opens the Cowork session. |
| N-5 | As a user, I want optional push notifications to my phone (via Slack, Discord, or Telegram webhook), so I can monitor long-running tasks while AFK. | User can configure a webhook URL in settings. Notifications are forwarded with session name + status + duration. |
| N-6 | As a user, I want a notification sound that's distinct from my other apps, so I can audio-identify Claude events. | Custom pixel-art-themed notification sounds (8-bit chimes). Configurable per event type. Option to mute. |

### Epic 2: Pixel Art Command Center

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| P-1 | As a user, I want to see a pixel art scene where each active Claude session is represented by a character, so monitoring feels fun and engaging. | Each session spawns a pixel character in the scene. Characters have idle, working, and error animations. Scene is a "command center" or "workshop" theme. |
| P-2 | As a user, I want characters to visually reflect their session's state (coding, reading, thinking, errored, waiting), so I can glance at the scene and understand status. | At least 5 distinct visual states with unique animations: idle, active/working, reading/thinking, errored (sparks/smoke), waiting for input (waving/question mark). |
| P-3 | As a user, I want to hover over a character to see a tooltip with session details (name, duration, last action, token count), so I can get details without leaving the scene. | Tooltip shows: session label, uptime, last status message, token usage (if available). Appears on hover within 200ms. |
| P-4 | As a user, I want to click a character to open a detail panel with full session info and action buttons, so I can interact with sessions from the pixel view. | Click opens side panel with: full session log summary, cost estimate, "Focus Terminal" button, "Mark as Reviewed" button. |
| P-5 | As a user, I want the scene to feel alive with ambient animations (blinking lights, moving elements), so it's satisfying to keep open. | Scene has at least 3 ambient animation loops independent of session characters. Consistent pixel art style (16x16 or 32x32 sprite base). |
| P-6 | As a user, I want to choose between different scene themes (command center, forest workshop, space station), so I can personalize my experience. | At least 2 themes available. Theme selection persists across restarts. Characters adapt to theme context. |

### Epic 3: Session Discovery & Monitoring

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| S-1 | As a user, I want the app to automatically detect all running Claude Code sessions on my machine, so I don't have to manually register them. | App watches `~/.claude/projects/` for JSONL session files. New sessions appear as characters within 5 seconds. Ended sessions transition to "completed" state. |
| S-2 | As a user, I want to label/rename sessions with friendly names, so I can tell them apart. | Right-click character → rename. Auto-suggested names based on working directory or first task description. Labels persist across restarts. |
| S-3 | As a user, I want to see a timeline view of session activity over the past 24 hours, so I can review what happened while I was away. | Timeline shows session start/end bars, color-coded by outcome. Hoverable for details. Scrollable. |
| S-4 | As a user, I want the app to detect Cowork sessions in addition to Claude Code sessions, so all my Claude work is in one place. | Cowork sessions detected and displayed alongside Claude Code sessions. Visually distinguished (different character sprite or badge). |

### Epic 4: Cost & Token Awareness

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| C-1 | As a user, I want to see estimated token usage per session, so I understand resource consumption. | Each session shows estimated input/output tokens. Updated in near real-time from JSONL parsing. |
| C-2 | As a user, I want a daily/weekly cost summary dashboard, so I can track spending trends. | Aggregated cost view with configurable model pricing. Chart showing cost over time. Exportable. |
| C-3 | As a user, I want an alert when a session's token burn rate is unusually high, so I can catch runaway agents. | Configurable threshold (e.g., >10k tokens/minute). Visual alert on character (fire animation) + notification. |

### Epic 5: Intervention & Control (Future)

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| I-1 | As a user, I want to send a message to a running session from the pixel view, so I can redirect or guide an agent without switching terminals. | Text input in detail panel that injects into the session's stdin. Requires confirmation before sending. |
| I-2 | As a user, I want to pause/resume or cancel a session from the dashboard, so I can manage runaway tasks. | Pause, resume, and cancel buttons in the detail panel. Visual state change on the character. |

---

## Tech Stack

### Recommended: Tauri + React + PixiJS

| Layer | Technology | Why |
|-------|-----------|-----|
| **Desktop shell** | [Tauri v2](https://v2.tauri.app/) | Lightweight (10-20MB vs Electron's 200MB+). Native macOS menu bar/tray support. Rust backend for performant file watching. Cross-platform. |
| **Frontend framework** | React 18 + TypeScript | Mature ecosystem. Great for mixing PixiJS canvas with UI panels. |
| **Pixel art renderer** | [PixiJS v8](https://pixijs.com/) | Industry-standard 2D WebGL renderer. Excellent sprite animation support. `@pixi/react` for React integration. |
| **Sprite animation** | [Aseprite](https://www.aseprite.org/) (creation) + PixiJS spritesheets | Aseprite is the gold standard for pixel art. Export as spritesheets, load in PixiJS. |
| **File watching** | Rust `notify` crate (via Tauri backend) | Watches `~/.claude/` for JSONL changes. More reliable than Node's `fs.watch`. No polling needed. |
| **JSONL parsing** | Rust `serde_json` (backend) | Parse Claude session JSONL files. Stream new lines as they're appended. |
| **State management** | Zustand | Lightweight, simple. Perfect for session state that updates frequently. |
| **Notifications** | Tauri notification plugin + native macOS APIs | `tauri-plugin-notification` for cross-platform. Direct macOS `NSUserNotification` via Rust for critical alerts that bypass Focus Mode. |
| **Phone push** | Webhook integration (Slack/Discord/Telegram API) | User provides webhook URL. App sends POST on events. Zero infrastructure needed. |
| **Styling** | Tailwind CSS | For the UI panels/overlays outside the pixel canvas. |
| **Build/bundle** | Vite | Fast dev server, great Tauri integration via `@tauri-apps/cli`. |

### Alternative: Electron (if Rust is a barrier)

If you'd prefer to avoid Rust entirely, Electron + React + PixiJS works too. Trade-offs: 10x larger binary, higher memory usage, but the entire stack is JavaScript. Use `chokidar` for file watching instead of `notify`.

### Art & Assets Pipeline

| Tool | Purpose |
|------|---------|
| **Aseprite** ($20) | Create and animate pixel art sprites. Export as spritesheets. |
| **Tiled** (free) | Design the command center scene/tilemap. Export as JSON. |
| **TexturePacker** (free tier) | Optimize spritesheets for PixiJS. |
| **LMMS or jsfxr** (free) | Create 8-bit notification sounds. |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Tauri Window                       │
│  ┌───────────────────────────────────────────────┐  │
│  │              React + PixiJS                    │  │
│  │  ┌─────────────────┐  ┌────────────────────┐  │  │
│  │  │  Pixel Art Scene │  │  Detail Panels     │  │  │
│  │  │  (PixiJS Canvas) │  │  (React + Tailwind)│  │  │
│  │  │                  │  │                    │  │  │
│  │  │  - Characters    │  │  - Session info    │  │  │
│  │  │  - Animations    │  │  - Timeline        │  │  │
│  │  │  - Tooltips      │  │  - Cost summary    │  │  │
│  │  └─────────────────┘  └────────────────────┘  │  │
│  │              ▲ Zustand Store ▲                  │  │
│  └──────────────┼──────────────┼──────────────────┘  │
│                 │   Tauri IPC  │                      │
│  ┌──────────────┴──────────────┴──────────────────┐  │
│  │            Rust Backend                         │  │
│  │                                                 │  │
│  │  ┌──────────────┐  ┌────────────────────────┐  │  │
│  │  │ File Watcher  │  │ Session Parser         │  │  │
│  │  │ (~/.claude/)  │  │ (JSONL → SessionState) │  │  │
│  │  └──────┬───────┘  └───────────┬────────────┘  │  │
│  │         │                      │                │  │
│  │  ┌──────┴──────────────────────┴────────────┐  │  │
│  │  │ Notification Engine                       │  │  │
│  │  │ - macOS native alerts                     │  │  │
│  │  │ - Webhook dispatcher (Slack/Discord)      │  │  │
│  │  │ - Priority queue (error > wait > done)    │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Menu Bar / System Tray                          │  │
│  │  - Session count badge                           │  │
│  │  - Status color (green/yellow/red)               │  │
│  │  - Quick actions dropdown                        │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
pixelops/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   ├── watcher.rs            # File system watcher for ~/.claude/
│   │   ├── parser.rs             # JSONL session parser
│   │   ├── notifications.rs      # Native notification engine
│   │   ├── webhooks.rs           # Slack/Discord/Telegram push
│   │   ├── tray.rs               # Menu bar / system tray logic
│   │   └── models.rs             # Session state types
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                          # React frontend
│   ├── App.tsx                   # Root layout
│   ├── main.tsx                  # Entry point
│   ├── stores/
│   │   └── sessionStore.ts       # Zustand store for session state
│   ├── components/
│   │   ├── PixelScene/
│   │   │   ├── PixelScene.tsx    # PixiJS canvas wrapper
│   │   │   ├── Character.tsx     # Animated agent character
│   │   │   ├── CommandCenter.tsx # Background scene/tilemap
│   │   │   └── Tooltip.tsx       # Hover tooltip
│   │   ├── Panels/
│   │   │   ├── SessionDetail.tsx # Session info side panel
│   │   │   ├── Timeline.tsx      # 24hr activity timeline
│   │   │   └── CostDashboard.tsx # Token/cost summary
│   │   ├── MenuBar/
│   │   │   └── TrayMenu.tsx      # System tray quick actions
│   │   └── Settings/
│   │       ├── Notifications.tsx # Notification preferences
│   │       └── Webhooks.tsx      # Webhook configuration
│   ├── hooks/
│   │   ├── useSessionEvents.ts   # Tauri IPC listener
│   │   └── usePixiApp.ts         # PixiJS lifecycle
│   ├── types/
│   │   └── session.ts            # TypeScript session types
│   └── assets/
│       ├── sprites/              # Exported spritesheets (.png + .json)
│       ├── tilemaps/             # Tiled scene exports
│       └── sounds/               # 8-bit notification sounds
├── .github/
│   ├── workflows/
│   │   └── release.yml           # GitHub Actions: build + release
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
├── LICENSE                       # MIT
├── CONTRIBUTING.md
└── .gitignore
```

---

## MVP Scope (v0.1)

Focus: **Notifications + Awareness + Basic Pixel Scene**

### What's in v0.1

1. **Auto-detect Claude Code sessions** by watching `~/.claude/` JSONL files
2. **Menu bar icon** showing active session count with color-coded status
3. **Reliable desktop notifications** on session complete/error (with macOS Focus Mode workaround)
4. **Priority ranking** — errors surface before completions
5. **Click-to-focus** — notification click opens the relevant terminal
6. **Basic pixel art scene** — command center background with animated characters for each session (3 states: working, done, errored)
7. **Hover tooltips** on characters showing session name + status + duration
8. **Settings page** — notification preferences, webhook URL for phone push

### What's NOT in v0.1

- Cost/token tracking (v0.2)
- Session timeline/history (v0.2)
- Mid-session intervention (v0.3)
- Multiple themes (v0.3)
- Cowork session detection (v0.2)
- Team/shared dashboards (v1.0)

---

## Roadmap

| Version | Theme | Key Features |
|---------|-------|-------------|
| **v0.1** | Awareness MVP | Session detection, menu bar, notifications, basic pixel scene, webhooks |
| **v0.2** | Intelligence | Token/cost tracking, daily cost dashboard, Cowork session support, session timeline |
| **v0.3** | Interaction | Mid-session messaging, pause/cancel, scene themes, custom character skins |
| **v0.4** | Post-Mortems | Session replay, AI-powered session summaries, comparison view |
| **v1.0** | Teams | Shared dashboards, team cost controls, centralized governance |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Rust** toolchain (`rustup` — install from https://rustup.rs)
- **Tauri CLI**: `cargo install tauri-cli`
- **Aseprite** (for creating/editing sprites — $20 on Steam, or compile from source free)

### Quick Setup

```bash
# 1. Create the project
pnpm create tauri-app pixelops --template react-ts

# 2. Move into the project
cd pixelops

# 3. Install frontend dependencies
pnpm add pixi.js @pixi/react zustand
pnpm add -D tailwindcss @tailwindcss/vite

# 4. Add Tauri plugins (in src-tauri/)
cd src-tauri
cargo add tauri-plugin-notification
cargo add tauri-plugin-shell
cargo add notify          # file watcher
cargo add serde_json      # JSONL parsing
cargo add tokio --features full  # async runtime
cd ..

# 5. Run in development
pnpm tauri dev
```

### GitHub Setup

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: PixelOps project scaffold"

# Create GitHub repo (requires gh CLI)
gh repo create pixelops --public --source=. --push

# Set up CI/CD for cross-platform builds
# (The .github/workflows/release.yml template handles this)
```

### Recommended GitHub Actions Workflow

Use Tauri's official GitHub Action for automated cross-platform builds:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    permissions:
      contents: write
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: dtolnay/rust-toolchain@stable
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - run: pnpm install
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v__VERSION__
          releaseName: 'PixelOps v__VERSION__'
          releaseBody: 'See CHANGELOG.md for details.'
          releaseDraft: true
```

---

## Key Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **JSONL parsing is fragile** — files can be written mid-line | Missed events, corrupted state | Use a line-buffered reader that only processes complete JSON lines. Keep a cursor position per file. |
| **macOS Focus Mode blocks notifications** | Core feature broken | Use Tauri's native notification with `critical` flag. Fallback: menu bar badge flash + sound. Test with Focus Mode on. |
| **Claude changes JSONL format** | Parser breaks silently | Version-detect the format. Add a "format unknown" graceful fallback with a GitHub issue template link. |
| **PixiJS performance with many characters** | Lag on older machines | Object pool sprites. Cap at ~20 visible characters, paginate/scroll beyond that. Use PixiJS's built-in batching. |
| **Tauri v2 is newer, fewer examples** | Dev friction | Tauri v2 is stable as of 2024. Active Discord community. Fall back to Electron only if truly blocked. |

---

## Competitive Positioning

| Feature | Pixel Agents | Claude Office | AgentRoom | **PixelOps** |
|---------|-------------|--------------|-----------|-------------|
| Pixel art scene | ✅ Basic | ❌ | ✅ Basic | ✅ Full animated scene |
| Reliable notifications | ❌ Sound only | ❌ | ❌ | ✅ Native + webhooks |
| Priority alerts | ❌ | ❌ | ❌ | ✅ Error > wait > done |
| Menu bar presence | ❌ | ❌ | ❌ | ✅ Color-coded badge |
| Phone push | ❌ | ❌ | ❌ | ✅ Slack/Discord/Telegram |
| Click-to-focus | ❌ | ❌ | ❌ | ✅ Opens terminal |
| Token/cost tracking | ❌ | ❌ | Partial | ✅ (v0.2) |
| Mid-task intervention | ❌ | ❌ | ❌ | ✅ (v0.3) |
| Cross-platform | macOS only | macOS only | Web | ✅ macOS, Linux, Windows |

---

## License

MIT — keeps it simple for open source adoption and contribution.
