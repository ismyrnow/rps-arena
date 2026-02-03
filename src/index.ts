import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Server } from "socket.io";

const app = new Hono();

// Serve static files from the 'public' directory
app.use("/*", serveStatic({ root: "./public" }));

const server = serve({
  fetch: app.fetch,
  port: 3000,
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("lobby:join", (playerId) => {
    console.log(`Player ${playerId} joined the lobby`);
    // Here you can add the logic to handle the lobby
  });
});

console.log("Server listening on port 3000");
