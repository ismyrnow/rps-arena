import { describe, test, expect, beforeEach } from "bun:test";
import {
  generatePlayerId,
  getOrCreatePlayerId,
  getPlayerName,
  setPlayerName,
  buildWebSocketUrl,
  createMessage,
  parseMessage,
} from "./utils";

// Mock storage for testing
function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key in store) {
        delete store[key];
      }
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe("generatePlayerId", () => {
  test("generates id with default prefix", () => {
    const id = generatePlayerId();
    expect(id.startsWith("player-")).toBe(true);
  });

  test("generates id with custom prefix", () => {
    const id = generatePlayerId("guest");
    expect(id.startsWith("guest-")).toBe(true);
  });

  test("generates unique ids", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generatePlayerId());
    }
    expect(ids.size).toBe(50);
  });

  test("id has correct format", () => {
    const id = generatePlayerId();
    expect(id).toMatch(/^player-[a-z0-9]+$/);
  });
});

describe("getOrCreatePlayerId", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  test("creates new id when none exists", () => {
    const id = getOrCreatePlayerId(storage);
    expect(id.startsWith("player-")).toBe(true);
  });

  test("stores created id in storage", () => {
    const id = getOrCreatePlayerId(storage);
    expect(storage.getItem("rps_playerId")).toBe(id);
  });

  test("returns existing id from storage", () => {
    storage.setItem("rps_playerId", "existing-player-123");
    const id = getOrCreatePlayerId(storage);
    expect(id).toBe("existing-player-123");
  });

  test("does not overwrite existing id", () => {
    storage.setItem("rps_playerId", "existing-player-123");
    getOrCreatePlayerId(storage);
    expect(storage.getItem("rps_playerId")).toBe("existing-player-123");
  });
});

describe("getPlayerName / setPlayerName", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  test("returns null when no name is stored", () => {
    expect(getPlayerName(storage)).toBeNull();
  });

  test("returns stored name after setPlayerName", () => {
    setPlayerName("Alice", storage);
    expect(getPlayerName(storage)).toBe("Alice");
  });

  test("overwrites existing name", () => {
    setPlayerName("Alice", storage);
    setPlayerName("Bob", storage);
    expect(getPlayerName(storage)).toBe("Bob");
  });
});

describe("buildWebSocketUrl", () => {
  // Save original window object properties
  const originalLocation = globalThis.window?.location;

  beforeEach(() => {
    // Mock window.location for tests
    (globalThis as any).window = {
      location: {
        protocol: "http:",
        host: "localhost:3000",
      },
    };
  });

  test("builds URL with player id", () => {
    const url = buildWebSocketUrl("test-player", "Alice", "localhost:3000");
    expect(url).toContain("playerId=test-player");
  });

  test("uses ws protocol for http", () => {
    const url = buildWebSocketUrl("test-player", "Alice", "localhost:3000");
    expect(url.startsWith("ws://")).toBe(true);
  });

  test("uses wss protocol for https", () => {
    (globalThis as any).window.location.protocol = "https:";
    const url = buildWebSocketUrl("test-player", "Alice", "example.com");
    expect(url.startsWith("wss://")).toBe(true);
  });

  test("encodes special characters in player id", () => {
    const url = buildWebSocketUrl("player with spaces", "Alice", "localhost:3000");
    expect(url).toContain("playerId=player%20with%20spaces");
  });

  test("uses provided host", () => {
    const url = buildWebSocketUrl("test-player", "Alice", "example.com:8080");
    expect(url).toContain("example.com:8080");
  });

  test("includes player name in URL", () => {
    const url = buildWebSocketUrl("test-player", "Alice", "localhost:3000");
    expect(url).toContain("name=Alice");
  });

  test("encodes special characters in player name", () => {
    const url = buildWebSocketUrl("test-player", "Alice Smith", "localhost:3000");
    expect(url).toContain("name=Alice%20Smith");
  });
});

describe("createMessage", () => {
  test("creates message with type only", () => {
    const result = createMessage("ping");
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ type: "ping" });
  });

  test("creates message with payload", () => {
    const result = createMessage("move", { move: "rock", gameId: "123" });
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ type: "move", move: "rock", gameId: "123" });
  });

  test("handles nested objects", () => {
    const result = createMessage("data", { user: { name: "test", score: 10 } });
    const parsed = JSON.parse(result);
    expect(parsed.user.name).toBe("test");
    expect(parsed.user.score).toBe(10);
  });
});

describe("parseMessage", () => {
  test("parses valid JSON message", () => {
    const result = parseMessage('{"type":"test","value":123}');
    expect(result).toEqual({ type: "test", value: 123 });
  });

  test("returns null for invalid JSON", () => {
    expect(parseMessage("not valid json")).toBeNull();
  });

  test("returns null for message without type", () => {
    expect(parseMessage('{"value":123}')).toBeNull();
  });

  test("returns null for null JSON", () => {
    expect(parseMessage("null")).toBeNull();
  });

  test("returns null for array JSON", () => {
    expect(parseMessage("[]")).toBeNull();
  });

  test("returns null for primitive JSON", () => {
    expect(parseMessage("123")).toBeNull();
    expect(parseMessage('"string"')).toBeNull();
  });
});
