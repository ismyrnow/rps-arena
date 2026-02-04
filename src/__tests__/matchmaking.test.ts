import { describe, test, expect, mock } from "bun:test";
import {
  MatchmakingManager,
  type MatchmakingEvent,
} from "../server/matchmaking";

describe("MatchmakingManager", () => {
  test("adds players to lobby and matches them", () => {
    const manager = new MatchmakingManager({
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
    const manager = new MatchmakingManager();
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
    const manager = new MatchmakingManager({
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
    const manager = new MatchmakingManager({
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
