import { ServerWebSocket } from "bun";
import homepage from "../public/index.html";
import { generatePlayerId, parseMessage, createMessage } from "./client/utils";
import { GameManager, type GameRecord, type GameEvent } from "./server/game";

type WebSocketData = {
  playerId: string;
};

const gameManager = new GameManager();
const connections = new Map<string, ServerWebSocket<WebSocketData>>();

const server = Bun.serve<WebSocketData>({
  port: 3000,

  routes: {
    "/": homepage,
    "/health": new Response("ok"),
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
      gameManager.addPlayer(ws.data.playerId);
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

      if (data.type === "move:select") {
        const gameId = data.gameId as string;
        const move = data.move as string;
        gameManager.submitMove(
          gameId as GameRecord["id"],
          ws.data.playerId,
          move as "rock" | "paper" | "scissors",
        );
      }

      if (data.type === "rematch:request") {
        const gameId = data.gameId as string;
        gameManager.requestRematch(
          gameId as GameRecord["id"],
          ws.data.playerId,
        );
      }

      if (data.type === "game:leave") {
        const gameId = data.gameId as string;
        gameManager.leaveGame(gameId as GameRecord["id"], ws.data.playerId);
      }
    },
    close(ws) {
      console.log(`Player ${ws.data.playerId} disconnected`);
      connections.delete(ws.data.playerId);
      gameManager.removePlayer(ws.data.playerId);
    },
  },
});

const handleRoomJoined = (event: GameEvent) => {
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

const handleRoomLeft = (event: GameEvent) => {
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

const handleGameChange = (event: GameEvent) => {
  if (event.type !== "game:created" && event.type !== "game:updated") return;
  const game: GameRecord = event.game;
  server.publish(game.id, createMessage("game:updated", { game }));
};

// Register listeners
gameManager.on("room:joined", handleRoomJoined);
gameManager.on("room:left", handleRoomLeft);
gameManager.on("game:created", handleGameChange);
gameManager.on("game:updated", handleGameChange);

console.log(`Server listening on http://localhost:${server.port}`);
