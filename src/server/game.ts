import { EventEmitter } from "node:events";

export type RoomId = "lobby" | `game-${string}`;

export type Move = "rock" | "paper" | "scissors";

export type PlayerRecord = {
  id: string;
  room: RoomId;
};

export type GameStatus =
  | "matched"
  | "playing"
  | "countdown"
  | "results"
  | "abandoned";

export type GameRecord = {
  id: `game-${string}`;
  player1: string;
  player2: string;
  status: GameStatus;
  player1Move: Move | null;
  player2Move: Move | null;
  winner: string | "draw" | null;
  player1Rematch: boolean;
  player2Rematch: boolean;
  player1Score: number;
  player2Score: number;
  abandonedBy: string | null;
  round: number;
};

export type GameEvent =
  | { type: "player:added"; player: PlayerRecord }
  | { type: "player:removed"; playerId: string }
  | { type: "room:joined"; playerId: string; room: RoomId }
  | { type: "room:left"; playerId: string; room: RoomId }
  | { type: "game:created"; game: GameRecord }
  | { type: "game:updated"; game: GameRecord }
  | { type: "game:deleted"; gameId: GameRecord["id"] };

type GameManagerOptions = {
  gameIdGenerator?: () => string;
  /** Delay in ms before matched → playing transition. Set to 0 for tests. */
  matchedDelay?: number;
  /** Duration of each countdown tick in ms. Set to 0 for tests. */
  countdownInterval?: number;
};

export function determineWinner(
  player1Move: Move,
  player2Move: Move,
): "player1" | "player2" | "draw" {
  if (player1Move === player2Move) return "draw";
  if (
    (player1Move === "rock" && player2Move === "scissors") ||
    (player1Move === "paper" && player2Move === "rock") ||
    (player1Move === "scissors" && player2Move === "paper")
  ) {
    return "player1";
  }
  return "player2";
}

export class GameManager extends EventEmitter {
  private players = new Map<string, PlayerRecord>();
  private games = new Map<GameRecord["id"], GameRecord>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private gameIdGenerator: () => string;
  private matchedDelay: number;
  private countdownInterval: number;

  constructor(options: GameManagerOptions = {}) {
    super();
    this.gameIdGenerator =
      options.gameIdGenerator ?? (() => Math.random().toString(36).slice(2, 6));
    this.matchedDelay = options.matchedDelay ?? 3000;
    this.countdownInterval = options.countdownInterval ?? 1000;
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
    const events: GameEvent[] = [];
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

  submitMove(gameId: GameRecord["id"], playerId: string, move: Move): void {
    const game = this.games.get(gameId);
    if (!game || game.status !== "playing") return;
    if (playerId !== game.player1 && playerId !== game.player2) return;

    const moveField = playerId === game.player1 ? "player1Move" : "player2Move";
    if (game[moveField] !== null) return; // already submitted

    const updated: GameRecord = { ...game, [moveField]: move };
    this.games.set(gameId, updated);
    this.emitAll([{ type: "game:updated", game: updated }]);

    if (updated.player1Move && updated.player2Move) {
      this.startCountdown(gameId);
    }
  }

  requestRematch(gameId: GameRecord["id"], playerId: string): void {
    const game = this.games.get(gameId);
    if (!game || game.status !== "results") return;
    if (playerId !== game.player1 && playerId !== game.player2) return;

    const field =
      playerId === game.player1 ? "player1Rematch" : "player2Rematch";
    if (game[field]) return; // already requested

    const updated: GameRecord = { ...game, [field]: true };
    this.games.set(gameId, updated);
    this.emitAll([{ type: "game:updated", game: updated }]);

    if (updated.player1Rematch && updated.player2Rematch) {
      this.resetForRematch(gameId);
    }
  }

  leaveGame(gameId: GameRecord["id"], playerId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    if (playerId !== game.player1 && playerId !== game.player2) return;

    this.clearTimers(gameId);

    // Mark game as abandoned so the other player sees the abandoned screen
    const updatedGame: GameRecord = {
      ...game,
      status: "abandoned",
      abandonedBy: playerId,
    };
    this.games.set(gameId, updatedGame);
    this.emitAll([{ type: "game:updated", game: updatedGame }]);

    // Move leaving player back to lobby
    const leavingPlayer = this.players.get(playerId);
    if (leavingPlayer) {
      const events: GameEvent[] = [];
      events.push({ type: "room:left", playerId, room: game.id });
      this.players.set(playerId, { ...leavingPlayer, room: "lobby" });
      events.push({ type: "room:joined", playerId, room: "lobby" });
      this.emitAll(events);
    }
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) {
      return;
    }

    const events: GameEvent[] = [];
    events.push({ type: "room:left", playerId, room: player.room });
    events.push({ type: "player:removed", playerId });
    this.players.delete(playerId);

    if (player.room.startsWith("game-")) {
      const game = this.games.get(player.room as GameRecord["id"]);
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

  private emitAll(events: GameEvent[]) {
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
      player1Move: null,
      player2Move: null,
      winner: null,
      player1Rematch: false,
      player1Score: 0,
      player2Score: 0,
      player2Rematch: false,
      abandonedBy: null,
      round: 1,
    };

    this.games.set(gameId, game);
    this.scheduleMatchedToPlaying(gameId);
    return game;
  }

  private scheduleMatchedToPlaying(gameId: GameRecord["id"]): void {
    const timer = setTimeout(() => {
      this.timers.delete(`${gameId}:matched`);
      const game = this.games.get(gameId);
      if (!game || game.status !== "matched") return;
      const updated: GameRecord = { ...game, status: "playing" };
      this.games.set(gameId, updated);
      this.emitAll([{ type: "game:updated", game: updated }]);
    }, this.matchedDelay);
    this.timers.set(`${gameId}:matched`, timer);
  }

  private startCountdown(gameId: GameRecord["id"]): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const updated: GameRecord = { ...game, status: "countdown" };
    this.games.set(gameId, updated);
    this.emitAll([{ type: "game:updated", game: updated }]);

    const timer = setTimeout(() => {
      this.timers.delete(`${gameId}:countdown`);
      this.finishGame(gameId);
    }, this.countdownInterval * 3);
    this.timers.set(`${gameId}:countdown`, timer);
  }

  private finishGame(gameId: GameRecord["id"]): void {
    const game = this.games.get(gameId);
    if (!game || !game.player1Move || !game.player2Move) return;

    const result = determineWinner(game.player1Move, game.player2Move);
    let winner: string | "draw" | null = null;
    if (result === "draw") {
      winner = "draw";
    } else {
      winner = result === "player1" ? game.player1 : game.player2;
    }

    const results: GameRecord = {
      ...game,
      status: "results",
      winner,
      player1Score:
        winner === game.player1 ? game.player1Score + 1 : game.player1Score,
      player2Score:
        winner === game.player2 ? game.player2Score + 1 : game.player2Score,
    };
    this.games.set(gameId, results);
    this.emitAll([{ type: "game:updated", game: results }]);
  }

  private resetForRematch(gameId: GameRecord["id"]): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const reset: GameRecord = {
      ...game,
      status: "playing",
      player1Move: null,
      player2Move: null,
      winner: null,
      player1Rematch: false,
      player2Rematch: false,
      round: game.round + 1,
    };
    this.games.set(gameId, reset);
    this.emitAll([{ type: "game:updated", game: reset }]);
  }

  private clearTimers(gameId: GameRecord["id"]): void {
    for (const [key, timer] of this.timers) {
      if (key.startsWith(gameId)) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
    }
  }
}
