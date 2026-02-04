# RPS Arena - Project Specification

## Project Overview

A real-time multiplayer rock-paper-scissors web game where players are automatically matched with opponents in a lobby system. Players make their move choices, see animated results, and can choose to rematch or return to the lobby.

## Technical Stack

- **Runtime**: Bun
- **Backend**: Bun.serve() with native WebSockets
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
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
│   Lobby     │ ← Entry point
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
      │   └─→ One leaves → Notify other → Lobby
      │
      └─→ Both rematch → Move Selection
```

If a player disconnects during a match, the remaining player is shown an abandoned status screen: "Opponent disconnected — return to lobby?" If they confirm, they are returned to the lobby.

## Currently Implemented Features

- Pick technologies (Bun, React 18, TypeScript, Tailwind, DaisyUI)
- Project scaffolding (server + client structure, build and dev scripts)
- Server and client communication via WebSockets (Bun native WebSocket API)
- Unit and E2E tests (Bun unit tests in `src/__tests__`; Playwright E2E in `e2e/`)
- Lobby and matchmaking (automatic pairing from lobby into game rooms)
- Handling opponent disconnect (mark game abandoned and notify remaining player)

## Features to Implement

- Game UI and flow (move selection, show results, rematch)
- Containerization with Docker (single-container deployment)
- GitHub Actions for tests (unit + E2E pipeline)
- README (project README with setup, dev, and test instructions)

### Technical Implementation Details

Architecture overview:

- Runtime: Bun (server + package manager)
- Server: `src/index.ts` (Bun.serve) — handles HTTP + WebSocket upgrade, maintains a `connections` map, and publishes updates to channels.
- Matchmaking: `src/server/matchmaking.ts` — manages `players` and `games`, emits events via `EventEmitter` (`room:joined`, `room:left`, `game:created`, `game:updated`, `game:deleted`).
- Client: `src/client/*` — React components, `App.tsx` renders UI and subscribes to server channels via a small WebSocket service.
- Tests:
       - Unit tests: `src/__tests__/*` (Bun test runner) for pure logic (matchmaking, utils).
       - E2E tests: `e2e/*` (Playwright) to exercise full browser flow (two contexts, match, disconnect).

File structure (top-level)

- `package.json` — scripts and devDependencies (Bun + Playwright tooling)
- `playwright.config.ts` — Playwright configuration (e2e)
- `e2e/` — Playwright tests (matching flow)
- `src/index.ts` — server entry (Bun.serve)
- `src/server/matchmaking.ts` — matchmaking manager and events
- `src/client/index.tsx` — client entry
- `src/client/App.tsx` — main React app and UI
- `src/client/utils.ts` — helpers (message parsing, player id generation)
- `src/__tests__/` — unit tests (Bun)
- `public/index.html` — client HTML shell
- `dist/` — build output (generated)

Message contract (high level):

- Client -> Server:
       - `lobby:join` { playerId }
       - `move:select` { playerId, gameId, move }

- Server -> Client (published on channels):
       - `player:joined` / `player:left` (lobby channel)
       - `game:update` (game channel, includes full `GameRecord`)

Match data structures:

- `PlayerRecord`: `{ id: string; room: RoomId }` where `RoomId` is `lobby` or `game-...`.
- `GameRecord`: `{ id: string; player1: string; player2: string; status: 'matched'|'abandoned'; abandonedBy: string | null }`.

Notes:

- Keep game logic in small, testable modules (matchmaking is server-owned).
- Use `data-testid` attributes for UI elements you want Playwright to assert.
- The `test:e2e` script starts the Bun dev server and runs Playwright; Playwright browser install still requires `npx playwright install --with-deps` once.

## Project Goals

**Primary Goal**: Create a fun, simple, real-time multiplayer game that works reliably. It's meant to be played on a mobile device.It should be hostable in a single Docker container, without being dependent on external services.

---

**Last Updated**: February 3, 2026
