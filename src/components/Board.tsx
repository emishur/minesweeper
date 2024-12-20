import { memo } from "react";
import * as Immutable from "immutable";
import { Board, Cell } from "../domain/board";
import { Action } from "../domain/game";
import { match } from "ts-pattern";

export const GameBoard = memo(
  ({ board, onAction }: { board: Board; onAction: (a: Action) => void }) => {
    const cells = board.cells.flatMap((row, rowIdx) =>
      row.map((cell, colIdx) => (
        <GameCell
          key={`${rowIdx}:${colIdx}`}
          row={rowIdx}
          col={colIdx}
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
    row,
    col,
    cell,
    onAction,
  }: {
    row: number;
    col: number;
    cell: Cell;
    onAction: (a: Action) => void;
  }) =>
    match<Cell>(cell)
      .with({ kind: "open_empty" }, ({ neighborMinesCount }) => (
        <GameOpenCell
          text={neighborMinesCount === 0 ? "" : neighborMinesCount.toString()}
        />
      ))
      .with({ kind: "exploded" }, () => <GameOpenCell text="🔥" />)
      .with({ kind: "open_mined" }, () => <GameOpenCell text="💣" />)
      .with({ kind: "covered" }, () => (
        <GameCoveredCell row={row} col={col} onAction={onAction} />
      ))
      .exhaustive(),
  (prev, curr) => Immutable.is(prev, curr)
);

const GameOpenCell = ({ text }: { text: string }) => {
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
    >
      {text}
    </div>
  );
};

const GameCoveredCell = ({
  row,
  col,
  onAction,
}: {
  row: number;
  col: number;
  onAction: (a: Action) => void;
}) => {
  return (
    <button
      onClick={() => onAction({ kind: "open", row, col })}
      style={{
        aspectRatio: "1/ 1",
        background: "#C0C0C0",
      }}
    />
  );
};
