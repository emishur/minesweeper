import { memo } from "react";
import { GameCtx } from "../App";
import * as Immutable from "immutable";
import { Cell } from "../domain/board";
import { Action } from "../domain/game";
import assertNever from "../assert-never";

export const GameBoard = memo(
  ({ board, onAction }: GameCtx) => {
    console.log("render", board.width);
    const cells = board.cells.flatMap((row, x) =>
      row.map((cell, y) => (
        <GameCell x={x} y={y} cell={cell} onAction={onAction} />
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
  }) => {
    switch (cell.kind) {
      case "open_empty":
        return (
          <GameOpenCell
            x={x}
            y={y}
            text={
              cell.neighborMinesCount === 0
                ? ""
                : cell.neighborMinesCount.toString()
            }
          />
        );
      case "exploded":
        return <GameOpenCell x={x} y={y} text="🔥" />;
      case "open_mined":
        return <GameOpenCell x={x} y={y} text="💣" />;
      case "covered":
        return <GameCoveredCell x={x} y={y} onAction={onAction} />;
      default:
        assertNever(cell);
    }
  },
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
