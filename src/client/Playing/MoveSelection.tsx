import type { Move, GameRecord } from "../../server/game";
import { MOVE_EMOJI, MOVES } from "./constants";

interface Props {
  game: GameRecord;
  playerId: string;
  onMove: (move: Move) => void;
}

export default function MoveSelection({ game, playerId, onMove }: Props) {
  const myMove =
    playerId === game.player1 ? game.player1Move : game.player2Move;

  if (myMove) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          You chose {MOVE_EMOJI[myMove]}
        </h2>
        <p className="text-lg text-base-content/70">Waiting for opponent...</p>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-center">
        Choose your move
      </h2>
      <div className="flex gap-4">
        {MOVES.map((move) => (
          <button
            key={move}
            data-testid={`move-${move}`}
            onClick={() => onMove(move)}
            className="btn btn-xl"
          >
            {MOVE_EMOJI[move]}
          </button>
        ))}
      </div>
    </div>
  );
}
