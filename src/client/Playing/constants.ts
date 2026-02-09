import type { Move } from "../../server/game";

export const MOVES: Move[] = ["rock", "paper", "scissors"];

export const MOVE_IMAGES: Record<Move, string> = {
  rock: "images/rock.png",
  paper: "images/paper.png",
  scissors: "images/scissors.png",
};
