import { describe, test, expect, mock } from "bun:test";
import { GameManager, determineWinner, type GameEvent } from "../server/game";

function createTestManager() {
  return new GameManager({
    gameIdGenerator: () => "abcd",
    matchedDelay: 0,
    countdownInterval: 0,
  });
}

/** Wait for all pending timers/microtasks to flush */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

describe("GameManager", () => {
  test("adds players to lobby and matches them", () => {
    const manager = new GameManager({
      gameIdGenerator: () => "abcd",
    });

    const gameCreatedListener = mock();
    manager.on("game:created", gameCreatedListener);

    manager.addPlayer("player-1");
    expect(gameCreatedListener).not.toHaveBeenCalled();
    expect(manager.getPlayer("player-1")?.room).toBe("lobby");

    manager.addPlayer("player-2");
    expect(gameCreatedListener).toHaveBeenCalled();

    const game = manager.listGames()[0];
    expect(game.id).toBe("game-abcd");
    expect(game.player1).toBe("player-1");
    expect(game.player2).toBe("player-2");
    expect(game.status).toBe("matched");

    expect(manager.getPlayer("player-1")?.room).toBe("game-abcd");
    expect(manager.getPlayer("player-2")?.room).toBe("game-abcd");

    manager.off("game:created", gameCreatedListener);
  });

  test("removes player from lobby without affecting games", () => {
    const manager = new GameManager();
    const gameUpdatedListener = mock();
    manager.on("game:updated", gameUpdatedListener);

    manager.addPlayer("player-1");

    manager.removePlayer("player-1");
    expect(gameUpdatedListener).not.toHaveBeenCalled();
    expect(manager.getPlayer("player-1")).toBeUndefined();
    expect(manager.listGames().length).toBe(0);

    manager.off("game:updated", gameUpdatedListener);
  });

  test("marks game abandoned when a player leaves", () => {
    const manager = new GameManager({
      gameIdGenerator: () => "wxyz",
    });

    const gameUpdatedListener = mock();
    manager.on("game:updated", gameUpdatedListener);

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    manager.removePlayer("player-1");
    expect(gameUpdatedListener).toHaveBeenCalled();

    const game = manager.getGame("game-wxyz");
    expect(game?.status).toBe("abandoned");
    expect(game?.abandonedBy).toBe("player-1");

    manager.off("game:updated", gameUpdatedListener);
  });

  test("deletes game when both players leave", () => {
    const manager = new GameManager({
      gameIdGenerator: () => "zzzz",
    });

    const gameDeletedListener = mock();
    manager.on("game:deleted", gameDeletedListener);

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    manager.removePlayer("player-1");
    manager.removePlayer("player-2");

    expect(gameDeletedListener).toHaveBeenCalled();
    expect(manager.listGames().length).toBe(0);

    manager.off("game:deleted", gameDeletedListener);
  });
});

describe("determineWinner", () => {
  test("rock beats scissors", () => {
    expect(determineWinner("rock", "scissors")).toBe("player1");
    expect(determineWinner("scissors", "rock")).toBe("player2");
  });

  test("scissors beats paper", () => {
    expect(determineWinner("scissors", "paper")).toBe("player1");
    expect(determineWinner("paper", "scissors")).toBe("player2");
  });

  test("paper beats rock", () => {
    expect(determineWinner("paper", "rock")).toBe("player1");
    expect(determineWinner("rock", "paper")).toBe("player2");
  });

  test("same move is a draw", () => {
    expect(determineWinner("rock", "rock")).toBe("draw");
    expect(determineWinner("paper", "paper")).toBe("draw");
    expect(determineWinner("scissors", "scissors")).toBe("draw");
  });
});

describe("Gameplay", () => {
  test("transitions from matched to playing after delay", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    const game = manager.listGames()[0];
    expect(game.status).toBe("matched");

    await flush();

    const updated = manager.getGame(game.id);
    expect(updated?.status).toBe("playing");
  });

  test("records a move without transitioning when only one player submits", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "rock");

    const updated = manager.getGame(game.id);
    expect(updated?.player1Move).toBe("rock");
    expect(updated?.player2Move).toBeNull();
    expect(updated?.status).toBe("playing");
  });

  test("ignores duplicate move from same player", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "rock");
    manager.submitMove(game.id, "player-1", "paper");

    const updated = manager.getGame(game.id);
    expect(updated?.player1Move).toBe("rock");
  });

  test("both moves triggers countdown and finished", async () => {
    const manager = createTestManager();
    const listener = mock();
    manager.on("game:updated", listener);

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "rock");
    manager.submitMove(game.id, "player-2", "scissors");

    await flush();

    const final = manager.getGame(game.id);
    expect(final?.status).toBe("finished");
    expect(final?.winner).toBe("player-1");
    expect(final?.player1Move).toBe("rock");
    expect(final?.player2Move).toBe("scissors");

    manager.off("game:updated", listener);
  });

  test("draw result is recorded correctly", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "paper");
    manager.submitMove(game.id, "player-2", "paper");

    await flush();

    const final = manager.getGame(game.id);
    expect(final?.status).toBe("finished");
    expect(final?.winner).toBe("draw");
  });

  test("rematch resets game to playing when both request", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "rock");
    manager.submitMove(game.id, "player-2", "scissors");
    await flush();

    expect(manager.getGame(game.id)?.status).toBe("finished");

    manager.requestRematch(game.id, "player-1");
    expect(manager.getGame(game.id)?.player1Rematch).toBe(true);
    expect(manager.getGame(game.id)?.status).toBe("finished");

    manager.requestRematch(game.id, "player-2");

    const reset = manager.getGame(game.id);
    expect(reset?.status).toBe("playing");
    expect(reset?.player1Move).toBeNull();
    expect(reset?.player2Move).toBeNull();
    expect(reset?.winner).toBeNull();
    expect(reset?.player1Rematch).toBe(false);
    expect(reset?.player2Rematch).toBe(false);
  });

  test("leaveGame marks game abandoned and returns leaving player to lobby", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");
    await flush();

    const game = manager.listGames()[0];
    manager.leaveGame(game.id, "player-1");

    expect(manager.getPlayer("player-1")?.room).toBe("lobby");
    expect(manager.getPlayer("player-2")?.room).toBe(game.id);
    expect(manager.getGame(game.id)?.status).toBe("abandoned");
    expect(manager.getGame(game.id)?.abandonedBy).toBe("player-1");
  });

  test("ignores move when game is not in playing state", async () => {
    const manager = createTestManager();

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    // Game is still in "matched" state
    const game = manager.listGames()[0];
    manager.submitMove(game.id, "player-1", "rock");

    expect(manager.getGame(game.id)?.player1Move).toBeNull();
  });
});
