import homepage from "../public/index.html";
import { generatePlayerId, parseMessage, createMessage } from "./client/utils";

type WebSocketData = {
  playerId: string;
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
      ws.subscribe("lobby");
      server.publish(
        "lobby",
        createMessage("player:joined", { playerId: ws.data.playerId }),
      );
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
      ws.unsubscribe("lobby");
      server.publish(
        "lobby",
        createMessage("player:left", { playerId: ws.data.playerId }),
      );
    },
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
