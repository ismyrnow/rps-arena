# RPS Arena

A real-time multiplayer Rock-Paper-Scissors game with automatic matchmaking, built for mobile browsers.

**[Play now at rps.ish.lol →](https://rps.ish.lol)**

## Features

- 🎮 Real-time multiplayer gameplay via WebSockets
- 🎯 Automatic matchmaking from lobby
- 📱 Mobile-first responsive design
- 🔄 Rematch system with score tracking
- 🐳 Single-container Docker deployment

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Docker (for containerized deployment)

### Development

```bash
# Install dependencies
bun install

# Start dev server (port 3000)
bun run dev

# Run checks (format + typecheck + unit tests)
bun run check
```

### Testing

```bash
# Unit tests
bun run test

# E2E tests (requires Playwright installation)
npx playwright install --with-deps
bun run test:e2e
```

## Tech Stack

- **Runtime**: Bun
- **Backend**: Bun native HTTP + WebSockets
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Bun Test + Playwright
- See [PROJECT_SPEC.md](PROJECT_SPEC.md) for detailed architecture and implementation notes.

## License

MIT