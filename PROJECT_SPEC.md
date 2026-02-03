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

## Currently Implemented Features

TODO

## Features to Implement

TODO

### Technical Implementation Details

TODO

## Project Goals

**Primary Goal**: Create a fun, simple, real-time multiplayer game that works reliably. It's meant to be played on a mobile device.It should be hostable in a single Docker container, without being dependent on external services.

---

**Last Updated**: February 3, 2026
