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
        style={{ display: "flex", justifyContent: "space-evenly", gap: "1rem" }}
      >
        <button type="button" id="easy">
          Easy 8 X 8
        </button>
        <button type="button" id="classic">
          Classic 9 X 9
        </button>
        <button type="button" id="medium">
          Medium 16 X 16
        </button>
        <button type="button" id="expert">
          Expert 30 X 16
        </button>
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

type BoardCtx = { board: Board; onAction: (a: Action) => void };

function GamePlay({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="" />
      <GameBoard board={board} onAction={onAction} />;
      <div />
    </>
  );
}

function GameWon({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="You won!!!" />
      <GameBoard board={board} onAction={onAction} />
      <div>
        <ActionButton onClick={() => onAction({ kind: "reset" })}>
          ResetGame
        </ActionButton>
      </div>
    </>
  );
}

function GameLost({ board, onAction }: BoardCtx) {
  return (
    <>
      <GameScore board={board} message="You lost" />
      <GameBoard board={board} onAction={onAction} />
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
