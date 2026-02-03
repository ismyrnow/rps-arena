import homepage from "../public/index.html";

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
      const playerId =
        url.searchParams.get("playerId") ||
        `player-${Math.random().toString(36).substr(2, 9)}`;

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
        JSON.stringify({
          type: "player:joined",
          playerId: ws.data.playerId,
        }),
      );
    },
    message(ws, message) {
      const data = JSON.parse(message.toString());
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
        JSON.stringify({
          type: "player:left",
          playerId: ws.data.playerId,
        }),
      );
    },
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
