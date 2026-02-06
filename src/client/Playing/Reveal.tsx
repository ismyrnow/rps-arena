import type { GameRecord } from "../../server/game";
import { MOVE_EMOJI } from "./constants";

interface Props {
  game: GameRecord;
  playerId: string;
}

export default function Reveal({ game, playerId }: Props) {
  const myMove =
    playerId === game.player1 ? game.player1Move : game.player2Move;
  const opponentMove =
    playerId === game.player1 ? game.player2Move : game.player1Move;

  const resultText =
    game.winner === "draw"
      ? "Draw!"
      : game.winner === playerId
        ? "You win!"
        : "You lose!";

  const resultClass =
    game.winner === "draw"
      ? "text-warning"
      : game.winner === playerId
        ? "text-success"
        : "text-error";

  const yourScore =
    playerId === game.player1 ? game.player1Score : game.player2Score;
  const opponentScore =
    playerId === game.player1 ? game.player2Score : game.player1Score;

  return (
    <div className="flex flex-col items-center gap-8">
      <h2
        data-testid="result-text"
        className={`text-3xl sm:text-4xl font-bold text-center ${resultClass}`}
      >
        {resultText}
      </h2>
      <div className="flex gap-8 text-6xl">
        <div className="flex flex-col items-center gap-2">
          <span data-testid="my-move">{myMove ? MOVE_EMOJI[myMove] : "?"}</span>
          <span className="text-sm text-base-content/70">You</span>
        </div>
        <div
          className="text-2xl self-center text-base-content/50"
          data-testid="score"
        >
          {yourScore} - {opponentScore}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span data-testid="opponent-move">
            {opponentMove ? MOVE_EMOJI[opponentMove] : "?"}
          </span>
          <span className="text-sm text-base-content/70">Opponent</span>
        </div>
      </div>
    </div>
  );
}
