import { ServerWebSocket } from "bun";
import homepage from "../public/index.html";
import { generatePlayerId, parseMessage, createMessage } from "./client/utils";
import {
  MatchmakingManager,
  type MatchmakingEvent,
  type GameRecord,
} from "./server/matchmaking";

type WebSocketData = {
  playerId: string;
};

const matchmaking = new MatchmakingManager();
const connections = new Map<string, ServerWebSocket<WebSocketData>>();

const applyEvents = (
  events: MatchmakingEvent[],
  server: ReturnType<typeof Bun.serve>,
) => {
  for (const event of events) {
    if (event.type === "room:joined") {
      const ws = connections.get(event.playerId);
      ws?.subscribe(event.room);

      if (event.room === "lobby") {
        server.publish(
          "lobby",
          createMessage("player:joined", { playerId: event.playerId }),
        );
      }
    }

    if (event.type === "room:left") {
      const ws = connections.get(event.playerId);
      ws?.unsubscribe(event.room);

      if (event.room === "lobby") {
        server.publish(
          "lobby",
          createMessage("player:left", { playerId: event.playerId }),
        );
      }
    }
  }

  for (const event of events) {
    if (event.type === "game:created" || event.type === "game:updated") {
      const game: GameRecord = event.game;
      server.publish(game.id, createMessage("game:update", { game }));
    }
  }
};

const server = Bun.serve<WebSocketData>({
  port: 3000,

  routes: {
    "/": homepage,
  },

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const playerId = url.searchParams.get("playerId") || generatePlayerId();

      if (server.upgrade(req, { data: { playerId } })) {
        return; // Bun returns 101 Switching Protocols automatically
      }
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      console.log(`Player ${ws.data.playerId} connected`);
      connections.set(ws.data.playerId, ws);
      const events = matchmaking.addPlayer(ws.data.playerId);
      applyEvents(events, server);
    },
    message(ws, message) {
      const data = parseMessage(message.toString());
      if (!data) {
        console.warn(`Invalid message from ${ws.data.playerId}`);
        return;
      }
      console.log(`Received from ${ws.data.playerId}:`, data);

      if (data.type === "lobby:join") {
        console.log(`Player ${ws.data.playerId} joined the lobby`);
      }
    },
    close(ws) {
      console.log(`Player ${ws.data.playerId} disconnected`);
      connections.delete(ws.data.playerId);
      const events = matchmaking.removePlayer(ws.data.playerId);
      applyEvents(events, server);
    },
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
