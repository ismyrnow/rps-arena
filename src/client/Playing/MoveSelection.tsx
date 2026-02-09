import type { Move, GameRecord } from "../../server/game";
import MoveCircle from "./MoveCircle";

interface Props {
  game: GameRecord;
  playerId: string;
  onMove: (move: Move) => void;
}

export default function MoveSelection({ game, playerId, onMove }: Props) {
  const myMove =
    playerId === game.player1 ? game.player1Move : game.player2Move;
  const statusText = myMove ? "Waiting for opponent..." : "Choose your move";

  return (
    <div className="flex flex-col items-center w-full gap-24">
      <MoveCircle myMove={myMove} onMove={onMove} />
      <div className="bg-neutral-800 px-4 py-2 rounded-md text-neutral-50 text-sm">
        {statusText}
      </div>
    </div>
  );
}
