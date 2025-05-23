import { GameBoard } from "./Board";
import { GameCtx } from "../App";
import { Board } from "../domain/board";
import { match } from "ts-pattern";
import { ReactNode } from "react";
import { Action } from "../domain/game";

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
      .with({ kind: "select" }, () => <SelectGame onAction={onAction} />)
      .with({ kind: "start" }, ({ board }) => (
        <GamePlay board={board} onAction={onAction} />
      ))
      .with({ kind: "play" }, ({ board }) => (
        <GamePlay board={board} onAction={onAction} />
      ))
      .with({ kind: "won" }, ({ board }) => (
        <GameWon board={board} onAction={onAction} />
      ))
      .with({ kind: "lost" }, ({ board }) => (
        <GameLost board={board} onAction={onAction} />
      ))
      .exhaustive()}
  </div>
);

function SelectGame({ onAction }: { onAction: (a: Action) => void }) {
  return (
    <fieldset>
      <legend>Select Game</legend>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          gap: "1rem",
        }}
      >
        <ActionButton
          onClick={() =>
            onAction({ kind: "new", width: 8, height: 8, mines: 9 })
          }
        >
          Easy 8 X 8
        </ActionButton>
        <ActionButton
          onClick={() =>
            onAction({ kind: "new", width: 9, height: 9, mines: 10 })
          }
        >
          Classic 9 X 9
        </ActionButton>
        <ActionButton
          onClick={() =>
            onAction({ kind: "new", width: 12, height: 12, mines: 20 })
          }
        >
          Medium 12 X 12
        </ActionButton>
        <ActionButton
          onClick={() =>
            onAction({ kind: "new", width: 12, height: 20, mines: 50 })
          }
        >
          Expert 12 X 20
        </ActionButton>
      </div>
    </fieldset>
  );
}

function GameScore({ board, message }: { board: Board; message: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
      }}
    >
      <div>Mines: {board.minesCount}</div>
      <div
        style={{
          color: "#FF7070",
        }}
      >
        {message}
      </div>
      <div>Flags: {board.flagsCount}</div>
    </div>
  );
}

type BoardCtx = { board: Board; onAction: (a: Action) => void };

function GamePlay({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="" />
      <GameBoard board={board} onAction={onAction} />
      <div>Double tap to toggle a flag</div>
    </>
  );
}

function GameWon({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="😎 You won!!! 😎" />
      <GameBoard board={board} onAction={onAction} />
      <EndOfGameButtons onAction={onAction} />
    </>
  );
}

function GameLost({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="😞 You lost 😞" />
      <GameBoard board={board} onAction={onAction} />
      <EndOfGameButtons onAction={onAction} />
    </>
  );
}

function EndOfGameButtons({ onAction }: { onAction: (a: Action) => void }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        gap: "1rem",
      }}
    >
      <ActionButton onClick={() => onAction({ kind: "reset" })}>
        Reset Game
      </ActionButton>
      <ActionButton onClick={() => onAction({ kind: "select" })}>
        Different Game
      </ActionButton>
    </div>
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
        backgroundColor: "#80B0FF",
        color: "black",
        flex: "1 1 0",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
