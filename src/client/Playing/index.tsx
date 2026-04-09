import type { Move, GameRecord } from "../../server/game";
import MoveSelection from "./MoveSelection";
import Countdown from "./Countdown";
import Results from "./Results";
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
  const playerImage =
    playerId === game.player1 ? "images/boy.png" : "images/girl.png";
  const opponentImage =
    playerId === game.player1
      ? "images/girl-opponent.png"
      : "images/boy-opponent.png";

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 relative flex-grow">
      <GameStats game={game} playerId={playerId} />
      <div className="flex flex-grow flex-col items-center justify-center gap-4 sm:gap-6 w-full">
        {game.status === "playing" && (
          <MoveSelection game={game} playerId={playerId} onMove={onMove} />
        )}
        {game.status === "countdown" && <Countdown />}
        {game.status === "results" && (
          <Results
            game={game}
            playerId={playerId}
            onRematch={onRematch}
            onLeave={onLeave}
          />
        )}
      </div>
      <div className="absolute left-0 -bottom-24 flex flex-col items-center gap-1">
        <span className="text-xs text-neutral-500 -mt-1">
          {playerId === game.player1 ? game.player1Name : game.player2Name}
        </span>
        <img src={playerImage} alt="You" className="h-56" />
      </div>
      <div className="absolute right-0 top-0 flex flex-col items-center gap-1">
        <img src={opponentImage} alt="Opponent" className="h-32" />
        <span className="text-xs text-neutral-500">
          {playerId === game.player1 ? game.player2Name : game.player1Name}
        </span>
      </div>
    </div>
  );
}
