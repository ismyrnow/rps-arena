import { useEffect, useState } from "react";
import {
  getOrCreatePlayerId,
  buildWebSocketUrl,
  createMessage,
  parseMessage,
} from "./utils";
import Connecting from "./Connecting";
import Lobby from "./Lobby";
import Matched from "./Matched";
import Abandoned from "./Abandoned";

export default function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<
    "connecting" | "lobby" | "matched" | "abandoned"
  >("connecting");

  useEffect(() => {
    // Retrieve player ID from local storage (or create one if it doesn't exist)
    const storedPlayerId = getOrCreatePlayerId();
    setPlayerId(storedPlayerId);

    // Set up native WebSocket
    const ws = new WebSocket(buildWebSocketUrl(storedPlayerId));

    ws.onopen = () => {
      console.log("Connected to server");
      setIsConnected(true);
      setStatus("lobby");
      console.log("Joining lobby as", storedPlayerId);
      ws.send(createMessage("lobby:join", { playerId: storedPlayerId }));
      console.log("Joined lobby, waiting for match...");
    };

    ws.onmessage = (event) => {
      const data = parseMessage(event.data);
      if (!data) {
        console.warn("Received invalid message from server");
        return;
      }
      console.log("Received:", data);
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
      setStatus("connecting");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      {status === "connecting" && <Connecting />}
      {status === "lobby" && <Lobby playerId={playerId} />}
      {status === "matched" && <Matched playerId={playerId} />}
      {status === "abandoned" && <Abandoned playerId={playerId} />}
    </>
  );
}
