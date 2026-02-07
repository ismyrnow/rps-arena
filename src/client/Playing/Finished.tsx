import type { GameRecord } from "../../server/game";
import Button from "../shared/Button";
import Heading from "../shared/Heading";
import LoadingDots from "../shared/LoadingDots";
import Subheading from "../shared/Subheading";
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
            <Subheading>Waiting for opponent...</Subheading>
            <LoadingDots />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Button data-testid="rematch-btn" onClick={onRematch}>
              Rematch
            </Button>
            <div>
              or{" "}
              <a
                className="underline cursor-pointer"
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
