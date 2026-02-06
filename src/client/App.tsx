import { useEffect, useState, useRef, useCallback } from "react";
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
import Playing from "./Playing";
import type { GameRecord, GameStatus, Move } from "../server/game";

type AppStatus =
  | "connecting"
  | "lobby"
  | "matched"
  | "playing"
  | "countdown"
  | "reveal"
  | "finished"
  | "abandoned";

const PLAYING_STATUSES: GameStatus[] = [
  "playing",
  "countdown",
  "reveal",
  "finished",
];

export default function App() {
  const [playerId, setPlayerId] = useState<string>("");
  const [status, setStatus] = useState<AppStatus>("connecting");
  const [gameState, setGameState] = useState<GameRecord | null>(null);
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
        if (data.type === "game:updated" && typeof data.game === "object") {
          const game = data.game as GameRecord;
          if (
            game.player1 === storedPlayerId ||
            game.player2 === storedPlayerId
          ) {
            setGameState(game);
            if (game.status === "abandoned") {
              setStatus("abandoned");
            } else {
              setStatus(game.status);
            }
          }
        }
      },
    );

    return () => {
      wsServiceRef.current.close();
    };
  }, []);

  const handleMove = useCallback(
    (move: Move) => {
      if (!gameState) return;
      wsServiceRef.current.send(
        createMessage("move:select", { gameId: gameState.id, move }),
      );
    },
    [gameState],
  );

  const handleRematch = useCallback(() => {
    if (!gameState) return;
    wsServiceRef.current.send(
      createMessage("rematch:request", { gameId: gameState.id }),
    );
  }, [gameState]);

  const handleLeave = useCallback(() => {
    if (!gameState) return;
    wsServiceRef.current.send(
      createMessage("game:leave", { gameId: gameState.id }),
    );
    window.location.href = "/";
  }, [gameState]);

  const isPlaying =
    PLAYING_STATUSES.includes(status as GameStatus) && gameState;

  return (
    <>
      {status === "connecting" && <Connecting />}
      {status === "lobby" && <Lobby playerId={playerId} />}
      {status === "matched" && <Matched />}
      {isPlaying && (
        <Playing
          playerId={playerId}
          game={gameState}
          onMove={handleMove}
          onRematch={handleRematch}
          onLeave={handleLeave}
        />
      )}
      {status === "abandoned" && <Abandoned />}
    </>
  );
}
