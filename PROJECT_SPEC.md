# RPS Arena - Project Specification

## Project Overview

A real-time multiplayer rock-paper-scissors web game where players are automatically matched with opponents in a lobby system. Players make their move choices, see animated results, and can choose to rematch or return to the lobby.

## Technical Stack

- **Runtime**: Bun
- **Backend**: Bun.serve() with native WebSockets
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Memory
- **Container**: Docker

## Developer Commands (Bun)

Use Bun for runtime and package management. Examples:

- Install deps: `bun install`
- Start dev server: `bun run dev`
- Run unit tests: `bun run test`
- Run e2e tests: `bun run test:e2e`

## Game Flow

```
┌─────────────┐
│   Entry     │ ← Entry point (enter/confirm name)
│  (name)     │
└──────┬──────┘
       │ Name submitted
       ↓
┌─────────────┐
│   Lobby     │ Waiting for opponent
│  (waiting)  │
└──────┬──────┘
       │ Match found
       ↓
┌─────────────┐
│ Match Found!│ 3-second transition
│  (matched)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Move Selection│ Rock / Paper / Scissors buttons
│  (playing)  │
└──────┬──────┘
       │ Both players selected
       ↓
┌─────────────┐
│ Countdown   │
│   3-2-1     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Results   │ Shows both moves
│ Win/Loss/   │
│    Draw     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Rematch or   │
│Leave Choice │
└─────┬───┬───┘
      │   │
      │   └─→ One leaves → Notify other (abandoned screen)
      │                     Leaving player returns to lobby
      │
      └─→ Both rematch → Move Selection
```

If a player disconnects or leaves during a match, the remaining player is shown an abandoned screen displaying the opponent's name. The leaving player is returned directly to the lobby.

## Currently Implemented Features

- Pick technologies (Bun, React 18, TypeScript, Tailwind)
- Project scaffolding (server + client structure, build and dev scripts)
- Server and client communication via WebSockets (Bun native WebSocket API)
- Unit and E2E tests (Bun unit tests in `src/__tests__`; Playwright E2E in `e2e/`)
- Lobby and matchmaking (automatic pairing from lobby into game rooms)
- Custom player names (entered on arrival; persisted in localStorage; changeable on return)
- Game UI and flow (move selection, countdown, results, rematch, leave)
- Handling opponent disconnect or leave (mark game abandoned, show opponent name, leaving player returns to lobby)

## Features to Implement

- Containerization with Docker (single-container deployment)
- GitHub Actions for tests (unit + E2E pipeline)
- README (project README with setup, dev, and test instructions)

### Technical Implementation Details

Architecture overview:

- Runtime: Bun (server + package manager)
- Server: `src/index.ts` (Bun.serve) — handles HTTP + WebSocket upgrade, logs connections, and publishes updates to channels.
- Connection management: `src/server/connection.ts` — `ConnectionManager` class tracks WebSocket connections (private map, exposed via `getConnection`), delegates player registration and message handling to the `GameManager`.
- Game logic: `src/server/game.ts` — `GameManager` class manages `players` and `games`, handles matchmaking, gameplay (moves, countdown, results), rematch, leave, and disconnect. Emits events via `EventEmitter` (`room:joined`, `room:left`, `game:created`, `game:updated`, `game:deleted`).
- Client: `src/client/*` — React components, `App.tsx` renders UI and subscribes to server channels via a small WebSocket service.
- Tests: - Unit tests: `src/__tests__/*` (Bun test runner) for pure logic (game manager, utils).
  - E2E tests: `e2e/*` (Playwright) to exercise full browser flow (matchmaking, gameplay, disconnect).

File structure (top-level)

- `package.json` — scripts and devDependencies (Bun + Playwright tooling)
- `playwright.config.ts` — Playwright configuration (e2e)
- `e2e/` — Playwright tests (matchmaking and gameplay flows)
- `src/index.ts` — server entry (Bun.serve)
- `src/server/connection.ts` — connection manager (WebSocket tracking + message routing)
- `src/server/game.ts` — game manager (matchmaking + gameplay logic)
- `src/client/index.tsx` — client entry
- `src/client/App.tsx` — main React app and UI
- `src/client/Playing.tsx` — gameplay UI (move selection, countdown, results, rematch)
- `src/client/utils.ts` — helpers (message parsing, player id generation)
- `src/__tests__/` — unit tests (Bun)
- `public/index.html` — client HTML shell
- `dist/` — build output (generated)

Message contract (high level):

- Connection: WebSocket upgrade at `/ws?playerId=<id>&name=<name>`

- Client -> Server:
  - `move:select` { gameId, move }
  - `rematch:request` { gameId }
  - `game:leave` { gameId }

- Server -> Client (published on channels):
  - `game:updated` (game channel, includes full `GameRecord`)

Match data structures:

- `Move`: `'rock' | 'paper' | 'scissors'`.
- `PlayerRecord`: `{ id: string; name: string; room: RoomId }` where `RoomId` is `lobby` or `game-...`.
- `GameRecord`: `{ id: string; player1: string; player1Name: string; player2: string; player2Name: string; status: 'matched'|'playing'|'countdown'|'results'|'abandoned'; player1Move: Move | null; player2Move: Move | null; winner: string | 'draw' | null; player1Rematch: boolean; player2Rematch: boolean; abandonedBy: string | null; player1Score: number; player2Score: number }`.

Notes:

- Keep game logic in a single, testable module (`GameManager` owns all state).
- Use `data-testid` attributes for UI elements you want Playwright to assert.
- The `test:e2e` script starts the Bun dev server and runs Playwright; Playwright browser install still requires `npx playwright install --with-deps` once.

## Project Goals

**Primary Goal**: Create a fun, simple, real-time multiplayer game that works reliably. It's meant to be played on a mobile device.It should be hostable in a single Docker container, without being dependent on external services.

---

**Last Updated**: February 24, 2026
