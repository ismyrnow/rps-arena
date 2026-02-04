import { useEffect, useState, useRef } from "react";
import {
  getOrCreatePlayerId,
  buildWebSocketUrl,
  createMessage,
  parseMessage,
} from "./utils";
import { wsService } from "./WebSocketService";
import Connecting from "./Connecting";
import Lobby from "./Lobby";
import Matched from "./Matched";
import Abandoned from "./Abandoned";

export default function App() {
  const [playerId, setPlayerId] = useState<string>("");
  const [status, setStatus] = useState<
    "connecting" | "lobby" | "matched" | "abandoned"
  >("connecting");
  const wsServiceRef = useRef(wsService);

  useEffect(() => {
    const storedPlayerId = getOrCreatePlayerId();
    setPlayerId(storedPlayerId);

    const url = buildWebSocketUrl(storedPlayerId);
    wsServiceRef.current.connect(
      storedPlayerId,
      url,
      (newStatus) => {
        setStatus(newStatus);
      },
      (rawData) => {
        const data = parseMessage(rawData);
        if (!data) {
          console.warn("Received invalid message from server");
          return;
        }
        console.log("Received:", data);
        if (data.type === "game:update" && typeof data.game === "object") {
          const game = data.game as {
            id: string;
            player1: string;
            player2: string;
            status: "matched" | "abandoned";
            abandonedBy: string | null;
          };
          if (
            game.player1 === storedPlayerId ||
            game.player2 === storedPlayerId
          ) {
            if (game.status === "matched") {
              setStatus("matched");
            } else if (game.status === "abandoned") {
              setStatus("abandoned");
            }
          }
        }
      },
    );

    return () => {
      wsServiceRef.current.close();
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
