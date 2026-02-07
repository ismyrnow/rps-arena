import type { Move, GameRecord } from "../../server/game";
import MoveSelection from "./MoveSelection";
import Countdown from "./Countdown";
import Reveal from "./Reveal";
import Finished from "./Finished";

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
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
      {game.status === "playing" && (
        <MoveSelection game={game} playerId={playerId} onMove={onMove} />
      )}
      {game.status === "countdown" && <Countdown />}
      {game.status === "reveal" && <Reveal game={game} playerId={playerId} />}
      {game.status === "finished" && (
        <Finished
          game={game}
          playerId={playerId}
          onRematch={onRematch}
          onLeave={onLeave}
        />
      )}
    </div>
  );
}
