import { ServerWebSocket } from "bun";
import homepage from "../public/index.html";
import { generatePlayerId, parseMessage, createMessage } from "./client/utils";
import {
  MatchmakingManager,
  type GameRecord,
  type MatchmakingEvent,
} from "./server/matchmaking";

type WebSocketData = {
  playerId: string;
};

const matchmaking = new MatchmakingManager();
const connections = new Map<string, ServerWebSocket<WebSocketData>>();

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
      matchmaking.addPlayer(ws.data.playerId);
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
      matchmaking.removePlayer(ws.data.playerId);
    },
  },
});

const handleRoomJoined = (event: MatchmakingEvent) => {
  if (event.type !== "room:joined") return;
  console.log("Matchmaking event:", event);
  const ws = connections.get(event.playerId);
  ws?.subscribe(event.room);

  if (event.room === "lobby") {
    server.publish(
      "lobby",
      createMessage("player:joined", { playerId: event.playerId }),
    );
  }
};

const handleRoomLeft = (event: MatchmakingEvent) => {
  if (event.type !== "room:left") return;
  const ws = connections.get(event.playerId);
  ws?.unsubscribe(event.room);

  if (event.room === "lobby") {
    server.publish(
      "lobby",
      createMessage("player:left", { playerId: event.playerId }),
    );
  }
};

const handleGameChange = (event: MatchmakingEvent) => {
  if (event.type !== "game:created" && event.type !== "game:updated") return;
  const game: GameRecord = event.game;
  server.publish(game.id, createMessage("game:update", { game }));
};

// Register listeners
matchmaking.on("room:joined", handleRoomJoined);
matchmaking.on("room:left", handleRoomLeft);
matchmaking.on("game:created", handleGameChange);
matchmaking.on("game:updated", handleGameChange);

console.log(`Server listening on http://localhost:${server.port}`);
