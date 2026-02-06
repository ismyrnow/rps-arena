import { ServerWebSocket } from "bun";
import { parseMessage } from "../client/utils";
import { GameManager, type GameRecord } from "./game";

export type WebSocketData = {
  playerId: string;
};

export class ConnectionManager {
  private connections = new Map<string, ServerWebSocket<WebSocketData>>();

  constructor(private gameManager: GameManager) {}

  getConnection(playerId: string): ServerWebSocket<WebSocketData> | undefined {
    return this.connections.get(playerId);
  }

  open(ws: ServerWebSocket<WebSocketData>): void {
    this.connections.set(ws.data.playerId, ws);
    this.gameManager.addPlayer(ws.data.playerId);
  }

  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer): void {
    const data = parseMessage(message.toString());

    if (!data) {
      return;
    }

    if (data.type === "move:select") {
      const gameId = data.gameId as string;
      const move = data.move as string;
      this.gameManager.submitMove(
        gameId as GameRecord["id"],
        ws.data.playerId,
        move as "rock" | "paper" | "scissors",
      );
    }

    if (data.type === "rematch:request") {
      const gameId = data.gameId as string;
      this.gameManager.requestRematch(
        gameId as GameRecord["id"],
        ws.data.playerId,
      );
    }

    if (data.type === "game:leave") {
      const gameId = data.gameId as string;
      this.gameManager.leaveGame(gameId as GameRecord["id"], ws.data.playerId);
    }
  }

  close(ws: ServerWebSocket<WebSocketData>): void {
    this.connections.delete(ws.data.playerId);
    this.gameManager.removePlayer(ws.data.playerId);
  }
}
