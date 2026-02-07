import homepage from "../public/index.html";
import { generatePlayerId, createMessage } from "./client/utils";
import { GameManager, type GameRecord, type GameEvent } from "./server/game";
import { ConnectionManager, type WebSocketData } from "./server/connection";
import { BunRequest } from "bun";

const gameManager = new GameManager();
const connectionManager = new ConnectionManager(gameManager);

const server = Bun.serve<WebSocketData>({
  port: 3000,
  development: true,

  routes: {
    "/": homepage,
    "/health": new Response("ok"),
    "/ws": (req: BunRequest<"/ws">, server: Bun.Server<WebSocketData>) => {
      const url = new URL(req.url);
      const playerId = url.searchParams.get("playerId") || generatePlayerId();

      if (server.upgrade(req, { data: { playerId } })) {
        return; // Bun returns 101 Switching Protocols automatically
      }
      return new Response("WebSocket upgrade failed", { status: 500 });
    },
  },

  fetch(req, server) {
    const url = new URL(req.url);

    // Serve static files from the public directory
    const staticFile = Bun.file(`./public${url.pathname}`);
    if (staticFile.size) {
      return new Response(staticFile);
    }

    return new Response(null, { status: 404 });
  },
  websocket: {
    open(ws) {
      console.log(`WS: Player ${ws.data.playerId} connected`);
      connectionManager.open(ws);
    },
    message(ws, message) {
      console.log(`WS: Received from ${ws.data.playerId}:`, message.toString());
      connectionManager.message(ws, message);
    },
    close(ws) {
      console.log(`WS: Player ${ws.data.playerId} disconnected`);
      connectionManager.close(ws);
    },
  },
});

const handleRoomJoined = (event: GameEvent) => {
  if (event.type !== "room:joined") {
    return;
  }

  console.log("GM: Room joined:", event);

  const playerSocket = connectionManager.getConnection(event.playerId);
  playerSocket?.subscribe(event.room);

  if (event.room === "lobby") {
    server.publish(
      "lobby",
      createMessage("player:joined", { playerId: event.playerId }),
    );
  }
};

const handleRoomLeft = (event: GameEvent) => {
  if (event.type !== "room:left") {
    return;
  }

  console.log("GM: Room left:", event);

  const playerSocket = connectionManager.getConnection(event.playerId);
  playerSocket?.unsubscribe(event.room);

  if (event.room === "lobby") {
    server.publish(
      "lobby",
      createMessage("player:left", { playerId: event.playerId }),
    );
  }
};

const handleGameChange = (event: GameEvent) => {
  if (event.type !== "game:created" && event.type !== "game:updated") {
    return;
  }

  const eventName =
    event.type === "game:created" ? "Game created" : "Game updated";
  console.log(`GM: ${eventName}:`, event);

  const game: GameRecord = event.game;
  server.publish(game.id, createMessage("game:updated", { game }));
};

// Register listeners
gameManager.on("room:joined", handleRoomJoined);
gameManager.on("room:left", handleRoomLeft);
gameManager.on("game:created", handleGameChange);
gameManager.on("game:updated", handleGameChange);

console.log(`Server listening on http://localhost:${server.port}`);
