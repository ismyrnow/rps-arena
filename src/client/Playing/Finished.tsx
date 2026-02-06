import type { GameRecord } from "../../server/game";
import Reveal from "./Reveal";

interface Props {
  game: GameRecord;
  playerId: string;
  onRematch: () => void;
  onLeave: () => void;
}

export default function Finished({
  game,
  playerId,
  onRematch,
  onLeave,
}: Props) {
  const myRematch =
    playerId === game.player1 ? game.player1Rematch : game.player2Rematch;

  return (
    <div className="flex flex-col items-center gap-4">
      <Reveal game={game} playerId={playerId} />
      <div className="flex mt-4">
        {myRematch ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-base-content/70">
              Waiting for opponent...
            </p>

            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              data-testid="rematch-btn"
              onClick={onRematch}
              className="btn btn-lg"
            >
              Rematch
            </button>
            <div>
              or{" "}
              <a
                className="link"
                data-testid="leave-btn"
                href="#"
                onClick={onLeave}
              >
                return to lobby
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
