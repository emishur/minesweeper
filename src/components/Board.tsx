import { memo } from "react";
import * as Immutable from "immutable";
import { Board, Cell } from "../domain/board";
import { Action } from "../domain/game";
import { match } from "ts-pattern";

export const GameBoard = memo(
  ({ board, onAction }: { board: Board; onAction: (a: Action) => void }) => {
    const cells = board.cells.flatMap((row, x) =>
      row.map((cell, y) => (
        <GameCell
          key={`${x}:${y}`}
          x={x}
          y={y}
          cell={cell}
          onAction={onAction}
        />
      ))
    );
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board.width}, 1fr)`,
          gap: "4px",
          background: "lightBlue",
        }}
      >
        {cells}
      </div>
    );
  },
  (prev, current) => {
    console.log("compare", Immutable.is(prev.board.cells, current.board.cells));
    return Immutable.is(prev.board.cells, current.board.cells);
  }
);

const GameCell = memo(
  ({
    x,
    y,
    cell,
    onAction,
  }: {
    x: number;
    y: number;
    cell: Cell;
    onAction: (a: Action) => void;
  }) =>
    match<Cell>(cell)
      .with({ kind: "open_empty" }, ({ neighborMinesCount }) => (
        <GameOpenCell
          x={x}
          y={y}
          text={neighborMinesCount === 0 ? "" : neighborMinesCount.toString()}
        />
      ))
      .with({ kind: "exploded" }, () => <GameOpenCell x={x} y={y} text="🔥" />)
      .with({ kind: "open_mined" }, () => (
        <GameOpenCell x={x} y={y} text="💣" />
      ))
      .with({ kind: "covered" }, () => (
        <GameCoveredCell x={x} y={y} onAction={onAction} />
      ))
      .exhaustive(),
  (prev, curr) => Immutable.is(prev, curr)
);

const GameOpenCell = ({
  x,
  y,
  text,
}: {
  x: number;
  y: number;
  text: string;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1/ 1",
        background: "#F0F0F0",
        fontWeight: "bold",
      }}
      key={`${x}:${y}`}
    >
      {text}
    </div>
  );
};

const GameCoveredCell = ({
  x,
  y,
  onAction,
}: {
  x: number;
  y: number;
  onAction: (a: Action) => void;
}) => {
  return (
    <button
      key={`${x}:${y}`}
      onClick={() => onAction({ kind: "open", x, y })}
      style={{
        aspectRatio: "1/ 1",
        background: "#C0C0C0",
      }}
    />
  );
};
