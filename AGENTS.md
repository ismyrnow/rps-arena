# AGENTS.md

## Project overview

RPS Arena is a real-time multiplayer Rock-Paper-Scissors game meant to be played in a mobile browser. Players are matched in a lobby, select their moves, and see results in real-time.

## Build and test commands

- Install deps: `bun install`
- Start dev server: `bun run dev`
- Run unit tests: `bun run test`
- Run e2e tests: `bun run test:e2e`
- Typecheck: `bun run typecheck`
- Format code: `bun run format`
- Full check (format + typecheck + unit tests): `bun run check`

## Architectural snapshot
- Backend: Bun native HTTP server + WebSockets, TypeScript
- Frontend: React 18 + TypeScript, Tailwind CSS + DaisyUI
- Database: In-memory (no persistence)
- Containerization: Docker

## Coding guidelines
- Keep it simple and testable. Favor clarity over cleverness.
- Use React functional components and hooks.
- Keep react components focused on UI and delegate game logic to separate modules where appropriate.
- Server owns game state - clients are mostly dumb terminals that send user actions and render server state.
- Write unit tests for all non-trivial logic.
- Use Tailwind CSS for styling, with DaisyUI components where appropriate.
- Perform a check following major changes: `bun run check` (format + typecheck + unit tests)
- Code should be idiomatic and consistent with the existing codebase style. Follow patterns already established in the project.