import { GameRecord } from "../../server/game";

interface Props {
  game: GameRecord;
  playerId: string;
}

export default function GameStats({ game, playerId }: Props) {
  const myScore =
    playerId === game.player1 ? game.player1Score : game.player2Score;
  const opponentScore =
    playerId === game.player1 ? game.player2Score : game.player1Score;

  return (
    <div className="flex">
      <div className="border-2 border-neutral-800 px-2 py-1 rounded-md font-bold text-xs">
        Round {game.round} &nbsp;| &nbsp;Score {myScore}-{opponentScore}
      </div>
    </div>
  );
}
