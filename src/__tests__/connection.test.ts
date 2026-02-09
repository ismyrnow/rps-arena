import { describe, test, expect, mock } from "bun:test";
import { ConnectionManager, type WebSocketData } from "../server/connection";
import { GameManager } from "../server/game";
import { createMessage } from "../client/utils";

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

/** Create a minimal mock WebSocket for testing */
function createMockWs(playerId: string) {
  return {
    data: { playerId },
    send: mock(),
    close: mock(),
    subscribe: mock(),
    unsubscribe: mock(),
    publish: mock(),
  } as unknown as import("bun").ServerWebSocket<WebSocketData>;
}

describe("ConnectionManager", () => {
  test("open adds connection and registers player", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws = createMockWs("player-1");

    cm.open(ws);

    expect(cm.getConnection("player-1")).toBe(ws);
    expect(gm.getPlayer("player-1")).toBeDefined();
    expect(gm.getPlayer("player-1")?.room).toBe("lobby");
  });

  test("close removes connection and unregisters player", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws = createMockWs("player-1");

    cm.open(ws);
    cm.close(ws);

    expect(cm.getConnection("player-1")).toBeUndefined();
    expect(gm.getPlayer("player-1")).toBeUndefined();
  });

  test("getConnection returns connection by player id", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");

    cm.open(ws1);
    cm.open(ws2);

    expect(cm.getConnection("player-1")).toBe(ws1);
    expect(cm.getConnection("player-2")).toBe(ws2);
  });

  test("getConnection returns undefined for unknown player", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);

    expect(cm.getConnection("nobody")).toBeUndefined();
  });

  test("message ignores invalid JSON", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws = createMockWs("player-1");

    cm.open(ws);

    // Should not throw
    cm.message(ws, "not valid json");
  });

  test("message ignores messages without type", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws = createMockWs("player-1");

    cm.open(ws);

    // Should not throw
    cm.message(ws, JSON.stringify({ foo: "bar" }));
  });

  test("message handles move:select", async () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");

    cm.open(ws1);
    cm.open(ws2);
    await flush(); // matched → playing transition

    const game = gm.listGames()[0];
    expect(game).toBeDefined();
    expect(game.status).toBe("playing");

    cm.message(
      ws1,
      createMessage("move:select", { gameId: game.id, move: "rock" }),
    );

    const updated = gm.getGame(game.id);
    expect(updated?.player1Move).toBe("rock");
  });

  test("message handles rematch:request", async () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");

    cm.open(ws1);
    cm.open(ws2);
    await flush(); // matched → playing

    const game = gm.listGames()[0];

    // Play to finished
    cm.message(
      ws1,
      createMessage("move:select", { gameId: game.id, move: "rock" }),
    );
    cm.message(
      ws2,
      createMessage("move:select", { gameId: game.id, move: "scissors" }),
    );
    await flush(); // countdown → finished

    expect(gm.getGame(game.id)?.status).toBe("finished");

    cm.message(ws1, createMessage("rematch:request", { gameId: game.id }));

    expect(gm.getGame(game.id)?.player1Rematch).toBe(true);
  });

  test("message handles game:leave", async () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");

    cm.open(ws1);
    cm.open(ws2);
    await flush(); // matched → playing

    const game = gm.listGames()[0];

    cm.message(ws1, createMessage("game:leave", { gameId: game.id }));

    const updated = gm.getGame(game.id);
    expect(updated?.status).toBe("abandoned");
    expect(updated?.abandonedBy).toBe("player-1");
    // Player should be back in lobby
    expect(gm.getPlayer("player-1")?.room).toBe("lobby");
  });

  test("close during a game marks it abandoned", async () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);
    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");

    cm.open(ws1);
    cm.open(ws2);
    await flush();

    const game = gm.listGames()[0];
    expect(game.status).toBe("playing");

    cm.close(ws1);

    const updated = gm.getGame(game.id);
    expect(updated?.status).toBe("abandoned");
    expect(updated?.abandonedBy).toBe("player-1");
    expect(cm.getConnection("player-1")).toBeUndefined();
  });

  test("multiple opens and closes track correctly", () => {
    const gm = createTestManager();
    const cm = new ConnectionManager(gm);

    const ws1 = createMockWs("player-1");
    const ws2 = createMockWs("player-2");
    const ws3 = createMockWs("player-3");

    cm.open(ws1);
    cm.open(ws2);
    cm.open(ws3);

    cm.close(ws2);
    expect(cm.getConnection("player-2")).toBeUndefined();
    expect(cm.getConnection("player-1")).toBe(ws1);
    expect(cm.getConnection("player-3")).toBe(ws3);
  });
});
