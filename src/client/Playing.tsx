import type { Move, GameRecord } from "../server/game";

interface Props {
  playerId: string;
  game: GameRecord;
  onMove: (move: Move) => void;
  onRematch: () => void;
  onLeave: () => void;
}

const MOVE_EMOJI: Record<Move, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const MOVES: Move[] = ["rock", "paper", "scissors"];

function MoveSelection({
  game,
  playerId,
  onMove,
}: {
  game: GameRecord;
  playerId: string;
  onMove: (move: Move) => void;
}) {
  const myMove =
    playerId === game.player1 ? game.player1Move : game.player2Move;

  if (myMove) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          You chose {MOVE_EMOJI[myMove]}
        </h2>
        <p className="text-lg text-base-content/70">Waiting for opponent...</p>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-center">
        Choose your move
      </h2>
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

function Countdown() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-center">Get ready!</h2>
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}

function Reveal({ game, playerId }: { game: GameRecord; playerId: string }) {
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
        <div className="text-2xl self-center text-base-content/50">vs</div>
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

function Finished({
  game,
  playerId,
  onRematch,
  onLeave,
}: {
  game: GameRecord;
  playerId: string;
  onRematch: () => void;
  onLeave: () => void;
}) {
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

export default function Playing({
  playerId,
  game,
  onMove,
  onRematch,
  onLeave,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          {game.status === "playing" && (
            <MoveSelection game={game} playerId={playerId} onMove={onMove} />
          )}
          {game.status === "countdown" && <Countdown />}
          {game.status === "reveal" && (
            <Reveal game={game} playerId={playerId} />
          )}
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
    </div>
  );
}
