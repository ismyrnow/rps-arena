import { EventEmitter } from "node:events";

export type RoomId = "lobby" | `game-${string}`;

export type PlayerRecord = {
  id: string;
  room: RoomId;
};

export type GameRecord = {
  id: `game-${string}`;
  player1: string;
  player2: string;
  status: "matched" | "abandoned";
  abandonedBy: string | null;
};

export type MatchmakingEvent =
  | { type: "player:added"; player: PlayerRecord }
  | { type: "player:removed"; playerId: string }
  | { type: "room:joined"; playerId: string; room: RoomId }
  | { type: "room:left"; playerId: string; room: RoomId }
  | { type: "game:created"; game: GameRecord }
  | { type: "game:updated"; game: GameRecord }
  | { type: "game:deleted"; gameId: GameRecord["id"] };

type MatchmakingOptions = {
  gameIdGenerator?: () => string;
};

export class MatchmakingManager extends EventEmitter {
  private players = new Map<string, PlayerRecord>();
  private games = new Map<GameRecord["id"], GameRecord>();
  private gameIdGenerator: () => string;

  constructor(options: MatchmakingOptions = {}) {
    super();
    this.gameIdGenerator =
      options.gameIdGenerator ?? (() => Math.random().toString(36).slice(2, 6));
  }

  getPlayer(playerId: string): PlayerRecord | undefined {
    return this.players.get(playerId);
  }

  getGame(gameId: GameRecord["id"]): GameRecord | undefined {
    return this.games.get(gameId);
  }

  listPlayers(): PlayerRecord[] {
    return Array.from(this.players.values());
  }

  listGames(): GameRecord[] {
    return Array.from(this.games.values());
  }

  addPlayer(playerId: string): void {
    const events: MatchmakingEvent[] = [];
    const player: PlayerRecord = { id: playerId, room: "lobby" };
    this.players.set(playerId, player);

    events.push({ type: "player:added", player });
    events.push({ type: "room:joined", playerId, room: "lobby" });

    const lobbyPlayers = this.listPlayers().filter(
      (entry) => entry.room === "lobby",
    );

    if (lobbyPlayers.length >= 2) {
      const [player1, player2] = lobbyPlayers;
      const game = this.createGame(player1.id, player2.id);

      events.push({ type: "room:left", playerId: player1.id, room: "lobby" });
      events.push({ type: "room:left", playerId: player2.id, room: "lobby" });

      this.players.set(player1.id, { ...player1, room: game.id });
      this.players.set(player2.id, { ...player2, room: game.id });

      events.push({ type: "room:joined", playerId: player1.id, room: game.id });
      events.push({ type: "room:joined", playerId: player2.id, room: game.id });
      events.push({ type: "game:created", game });
    }

    this.emitAll(events);
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) {
      return;
    }

    const events: MatchmakingEvent[] = [];
    events.push({ type: "room:left", playerId, room: player.room });
    events.push({ type: "player:removed", playerId });
    this.players.delete(playerId);

    if (player.room.startsWith("game-")) {
      const game = this.games.get(player.room);
      if (game) {
        const updatedGame: GameRecord = {
          ...game,
          status: "abandoned",
          abandonedBy: playerId,
        };

        const remainingPlayers = this.listPlayers().filter(
          (entry) => entry.room === game.id,
        );

        if (remainingPlayers.length === 0) {
          this.games.delete(game.id);
          events.push({ type: "game:deleted", gameId: game.id });
        } else {
          this.games.set(game.id, updatedGame);
          events.push({ type: "game:updated", game: updatedGame });
        }
      }
    }

    this.emitAll(events);
  }

  private emitAll(events: MatchmakingEvent[]) {
    for (const event of events) {
      this.emit(event.type, event);
    }
  }

  private createGame(player1: string, player2: string): GameRecord {
    let gameId: `game-${string}` = `game-${this.gameIdGenerator()}`;
    while (this.games.has(gameId)) {
      gameId = `game-${this.gameIdGenerator()}`;
    }

    const game: GameRecord = {
      id: gameId,
      player1,
      player2,
      status: "matched",
      abandonedBy: null,
    };

    this.games.set(gameId, game);
    return game;
  }
}
