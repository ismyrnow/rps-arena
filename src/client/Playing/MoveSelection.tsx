import type { Move, GameRecord } from "../../server/game";
import LoadingDots from "../shared/LoadingDots";
import Subheading from "../shared/Subheading";
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
    <div className="flex flex-col items-center w-full gap-8">
      <MoveCircle myMove={myMove} onMove={onMove} />
      <div className="flex flex-col items-center h-32 gap-4">
        <Subheading>{statusText}</Subheading>
        {myMove && <LoadingDots />}
      </div>
    </div>
  );
}
