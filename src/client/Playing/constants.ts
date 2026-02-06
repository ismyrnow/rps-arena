import type { Move } from "../../server/game";

export const MOVE_EMOJI: Record<Move, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export const MOVES: Move[] = ["rock", "paper", "scissors"];
