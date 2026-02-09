import clsx from "clsx";
import type { Move } from "../../server/game";
import { MOVE_IMAGES } from "./constants";

interface Props {
  myMove: Move | null;
  onMove: (move: Move) => void;
}

const MoveButton: React.FC<{
  move: Move;
  onClick: (move: Move) => void;
  disabled: boolean;
  isSelected: boolean;
  className?: string;
}> = ({ move, onClick, disabled, isSelected, className }) => {
  const buttonStyles = clsx(
    "p-2",
    disabled ? "cursor-not-allowed opacity-30" : "",
    isSelected ? "!opacity-100" : "",
    className,
  );

  return (
    <button
      data-testid={`move-${move}`}
      onClick={() => onClick(move)}
      className={buttonStyles}
      disabled={disabled}
    >
      <img src={MOVE_IMAGES[move]} alt={move} className="h-18" />
    </button>
  );
};

export default function MoveCircle({ myMove, onMove }: Props) {
  return (
    <div className="w-[60vw] h-[60vw] relative">
      <MoveButton
        move={"rock"}
        onClick={onMove}
        disabled={!!myMove}
        isSelected={myMove === "rock"}
        className="absolute left-1/2 top-0 -translate-x-1/2"
      />
      <MoveButton
        move={"paper"}
        onClick={onMove}
        disabled={!!myMove}
        isSelected={myMove === "paper"}
        className="absolute left-0 bottom-0"
      />
      <MoveButton
        move={"scissors"}
        onClick={onMove}
        disabled={!!myMove}
        isSelected={myMove === "scissors"}
        className="absolute right-0 bottom-0"
      />
      <img
        src="images/arrow.png"
        alt="top-left-arrow"
        className="absolute left-1/6 top-2/5 -translate-x-1/2 -translate-y-1/2 h-12 opacity-50"
      />
      <img
        src="images/arrow.png"
        alt="top-right-arrow"
        className="absolute right-0 top-2/5 rotate-[120deg] -translate-x-1/2 -translate-y-1/2 h-12 opacity-50"
      />
      <img
        src="images/arrow.png"
        alt="bottom-arrow"
        className="absolute -bottom-4 left-1/2 rotate-[240deg] -translate-x-1/2 h-12 opacity-50"
      />
    </div>
  );
}
