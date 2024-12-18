import { GameBoard } from "./Board";
import { GameCtx } from "../App";
import { Board } from "../domain/board";
import { match } from "ts-pattern";
import { ReactNode } from "react";

export const Game = ({ game, onAction }: GameCtx) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      rowGap: "1rem",
    }}
  >
    {match(game)
      .with({ kind: "play" }, () => (
        <GamePlay game={game} onAction={onAction} />
      ))
      .with({ kind: "won" }, () => <GameWon game={game} onAction={onAction} />)
      .with({ kind: "lost" }, () => (
        <GameLost game={game} onAction={onAction} />
      ))
      .exhaustive()}
  </div>
);

function GameScore({ board, message }: { board: Board; message: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "2em",
      }}
    >
      <div>Mines: {board.minesCount}</div>
      <div
        style={{
          color: "blue",
        }}
      >
        {message}
      </div>
      <div>Remain: {board.uncoveredCount}</div>
    </div>
  );
}

function GamePlay({ game, onAction }: GameCtx) {
  return (
    <>
      <GameScore board={game.board} message="" />
      <GameBoard board={game.board} onAction={onAction} />;
      <div />
    </>
  );
}

function GameWon({ game, onAction }: GameCtx) {
  return (
    <>
      <GameScore board={game.board} message="You won!!!" />
      <GameBoard board={game.board} onAction={onAction} />
      <div>
        <ActionButton onClick={() => onAction({ kind: "reset" })}>
          ResetGame
        </ActionButton>
      </div>
    </>
  );
}

function GameLost({ game, onAction }: GameCtx) {
  return (
    <>
      <GameScore board={game.board} message="You lost" />
      <GameBoard board={game.board} onAction={onAction} />
      <div>
        <ActionButton onClick={() => onAction({ kind: "reset" })}>
          Reset Game
        </ActionButton>
      </div>
    </>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      style={{
        fontWeight: "bold",
        fontSize: "2em",
        backgroundColor: "#8080FF",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
