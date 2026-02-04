/**
 * Client-side utility functions for the RPS Arena game
 */

const PLAYER_ID_KEY = "rps_playerId";

/**
 * Generates a unique player ID
 * @param prefix - Optional prefix for the ID
 * @returns A unique player ID string
 */
export function generatePlayerId(prefix: string = "player"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retrieves the player ID from localStorage, creating one if it doesn't exist
 * @param storage - Storage implementation (defaults to localStorage)
 * @returns The player ID
 */
export function getOrCreatePlayerId(
  storage: Storage = window.localStorage,
): string {
  let playerId = storage.getItem(PLAYER_ID_KEY);

  if (!playerId) {
    playerId = generatePlayerId();
    storage.setItem(PLAYER_ID_KEY, playerId);
  }

  return playerId;
}

/**
 * Builds the WebSocket URL for connecting to the game server
 * @param playerId - The player's ID
 * @param host - The server host (defaults to current location)
 * @returns The WebSocket URL string
 */
export function buildWebSocketUrl(
  playerId: string,
  host: string = window.location.host,
): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${host}/ws?playerId=${encodeURIComponent(playerId)}`;
}

/**
 * Creates a message payload for sending to the server
 * @param type - Message type
 * @param payload - Additional data
 * @returns JSON string ready to send
 */
export function createMessage(
  type: string,
  payload: Record<string, unknown> = {},
): string {
  return JSON.stringify({ type, ...payload });
}

/**
 * Parses a message received from the server
 * @param message - Raw message string
 * @returns Parsed message object or null if invalid
 */
export function parseMessage(
  message: string,
): { type: string; [key: string]: unknown } | null {
  try {
    const data = JSON.parse(message);
    if (
      typeof data === "object" &&
      data !== null &&
      typeof data.type === "string"
    ) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
