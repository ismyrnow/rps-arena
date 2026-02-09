import type { Move, GameRecord } from "../../server/game";
import MoveSelection from "./MoveSelection";
import Countdown from "./Countdown";
import Finished from "./Finished";
import GameStats from "./GameStats";

interface Props {
  playerId: string;
  game: GameRecord;
  onMove: (move: Move) => void;
  onRematch: () => void;
  onLeave: () => void;
}

export default function Playing({
  playerId,
  game,
  onMove,
  onRematch,
  onLeave,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 relative flex-grow">
      <GameStats game={game} playerId={playerId} />
      <div className="flex flex-grow flex-col items-center justify-center gap-4 sm:gap-6">
        {game.status === "playing" && (
          <MoveSelection game={game} playerId={playerId} onMove={onMove} />
        )}
        {game.status === "countdown" && <Countdown />}
        {game.status === "finished" && (
          <Finished
            game={game}
            playerId={playerId}
            onRematch={onRematch}
            onLeave={onLeave}
          />
        )}
      </div>
    </div>
  );
}
