import type { Move, GameRecord } from "../../server/game";
import Heading from "../shared/Heading";
import Heading from "../shared/Heading";
import LoadingDots from "../shared/LoadingDots";
import Subheading from "../shared/Subheading";
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
        <Heading>You chose {MOVE_EMOJI[myMove]}</Heading>
        <Subheading>Waiting for opponent...</Subheading>
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Heading>Choose your move</Heading>
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
