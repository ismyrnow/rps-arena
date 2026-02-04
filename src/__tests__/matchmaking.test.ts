import { describe, test, expect } from "bun:test";
import { MatchmakingManager } from "../server/matchmaking";

describe("MatchmakingManager", () => {
  test("adds players to lobby and matches them", () => {
    const manager = new MatchmakingManager({
      gameIdGenerator: () => "abcd",
    });

    const eventsPlayer1 = manager.addPlayer("player-1");
    expect(eventsPlayer1.some((event) => event.type === "game:created")).toBe(
      false,
    );
    expect(manager.getPlayer("player-1")?.room).toBe("lobby");

    const eventsPlayer2 = manager.addPlayer("player-2");
    const gameCreated = eventsPlayer2.find(
      (event) => event.type === "game:created",
    );
    expect(gameCreated).toBeDefined();

    const game = manager.listGames()[0];
    expect(game.id).toBe("game-abcd");
    expect(game.player1).toBe("player-1");
    expect(game.player2).toBe("player-2");
    expect(game.status).toBe("matched");

    expect(manager.getPlayer("player-1")?.room).toBe("game-abcd");
    expect(manager.getPlayer("player-2")?.room).toBe("game-abcd");
  });

  test("removes player from lobby without affecting games", () => {
    const manager = new MatchmakingManager();
    manager.addPlayer("player-1");

    const events = manager.removePlayer("player-1");
    expect(events.some((event) => event.type === "game:updated")).toBe(false);
    expect(manager.getPlayer("player-1")).toBeUndefined();
    expect(manager.listGames().length).toBe(0);
  });

  test("marks game abandoned when a player leaves", () => {
    const manager = new MatchmakingManager({
      gameIdGenerator: () => "wxyz",
    });

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    const events = manager.removePlayer("player-1");
    const gameUpdated = events.find((event) => event.type === "game:updated");
    expect(gameUpdated).toBeDefined();

    const game = manager.getGame("game-wxyz");
    expect(game?.status).toBe("abandoned");
    expect(game?.abandonedBy).toBe("player-1");
  });

  test("deletes game when both players leave", () => {
    const manager = new MatchmakingManager({
      gameIdGenerator: () => "zzzz",
    });

    manager.addPlayer("player-1");
    manager.addPlayer("player-2");

    manager.removePlayer("player-1");
    const events = manager.removePlayer("player-2");

    expect(events.some((event) => event.type === "game:deleted")).toBe(true);
    expect(manager.listGames().length).toBe(0);
  });
});
