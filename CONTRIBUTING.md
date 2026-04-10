# Contributing to PixelOps

Thanks for your interest in contributing to PixelOps! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Start dev mode: `pnpm dev`

This launches both the Vite dev server (for React hot reload) and Electron pointing at it.

## Project Architecture

PixelOps is an Electron app with two processes:

- **Main process** (`electron/`) — Node.js. Handles file watching, session discovery, notifications, system tray. Communicates with the renderer via IPC.
- **Renderer process** (`src/`) — React + PixiJS. Renders the pixel art scene and UI panels. Receives session state updates from main process via the preload bridge.

### Key Conventions

- **Plain JavaScript** — no TypeScript. Use JSDoc comments for complex function signatures.
- **Plain CSS** — no CSS frameworks. Keep styles colocated with components.
- **React with hooks** — functional components only.
- **Zustand for state** — keep stores small and focused.

## Making Changes

1. Create a branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes
3. Test manually by running `pnpm dev` and verifying with real Claude Code sessions
4. Commit with a descriptive message following conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `chore:` for build/tooling changes
   - `docs:` for documentation
5. Open a pull request against `main`

## Code Style

- Use `const` and `let`, not `var`
- Use arrow functions for callbacks, regular functions for top-level exports
- Keep files focused — one module per concern
- Error handling: catch and log, don't let the app crash on bad session data

## Areas Where Help Is Needed

- **Pixel art assets** — we need proper sprites for agent characters (working, idle, errored, waiting states) and command center backgrounds. 32x32 base size.
- **Notification sounds** — 8-bit chimes for different event types
- **macOS Focus Mode workaround** — testing and improving notification reliability
- **Cross-platform testing** — Linux and Windows support

## Reporting Issues

Use GitHub Issues. Include:
- What you expected to happen
- What actually happened
- Your OS and Node.js version
- Steps to reproduce

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
