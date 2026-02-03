# AGENTS.md

This document provides information for AI agents working on this project.

## Project Overview

This project is a real-time multiplayer rock-paper-scissors web game called RPS Arena. Players are matched with opponents in a lobby, make their moves, see the results, and can choose to rematch or return to the lobby.

The backend is built with Bun's native HTTP server and uses Bun's native WebSockets for real-time communication. The frontend is built with React and styled with Tailwind CSS and DaisyUI.

## Build and Test Commands

### Build

To build the project, run the following command:

```bash
npm run build
```

This will compile the TypeScript code into JavaScript and output it to the `dist` directory.

### Running the Application

To run the application, use one of the following commands:

-   `npm start`: Starts the production server.
-   `npm run dev`: Starts the development server with hot-reloading.

### Test

There are currently no test commands configured for this project.

## Code Style Guidelines

This project uses Prettier for code formatting. To format the code, run:

```bash
npm run format
```

The project also uses TypeScript with strict type checking enabled. Please ensure that all new code is strongly typed.

## Testing Instructions

There is no testing framework set up for this project yet. When adding new features, please also add corresponding tests. If you are the first one to add tests, please set up a testing framework (e.g., Jest, Vitest).

## Security Considerations

-   **Input Validation**: All data received from clients through WebSocket messages should be validated on the server to prevent malicious input.
-   **Rate Limiting**: Consider implementing rate limiting on API endpoints and Socket.io events to prevent abuse.
-   **Dependencies**: Regularly audit dependencies for known vulnerabilities.
