import type { GameRecord, Move } from "../../server/game";
import { MOVE_IMAGES } from "./constants";

interface Props {
  game: GameRecord;
  playerId: string;
}

const MoveDisplay: React.FC<{
  move: Move | null;
  label: string;
  testId: string;
}> = ({ move, label, testId }) => (
  <div className="flex flex-col items-center gap-2">
    <span data-testid={testId} className="text-6xl">
      {move ? <img src={MOVE_IMAGES[move]} alt={move} className="h-18" /> : "?"}
    </span>
    <span className="text-sm text-base-content/70">{label}</span>
  </div>
);

export default function Results({ game, playerId }: Props) {
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
        <div className="w-1/3">
          <MoveDisplay move={myMove} label="You" testId="my-move" />
        </div>
        <div
          className="text-2xl self-center w-1/3 text-center"
          data-testid="score"
        >
          {yourScore} - {opponentScore}
        </div>
        <div className="w-1/3">
          <MoveDisplay
            move={opponentMove}
            label="Opponent"
            testId="opponent-move"
          />
        </div>
      </div>
    </div>
  );
}
