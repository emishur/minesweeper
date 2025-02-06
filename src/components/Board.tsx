import { CSSProperties, memo } from "react";
import * as Immutable from "immutable";
import { Board, Cell } from "../domain/board";
import { Action } from "../domain/game";
import { match } from "ts-pattern";
import { useClickHandler } from "./double-click";

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
          border: "4px solid lightBlue",
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
      .with({ kind: "covered" }, ({ isFlagged }) => (
        <GameCoveredCell
          row={row}
          col={col}
          isFlagged={isFlagged}
          onAction={onAction}
        />
      ))
      .exhaustive(),
  (prev, curr) => Immutable.is(prev, curr)
);

const cellStyle: CSSProperties = {
  flex: "1 1 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  aspectRatio: "1/ 1",
  fontWeight: "bold",
};

const GameOpenCell = ({ text }: { text: string }) => {
  return (
    <div
      style={{
        ...cellStyle,
        color: "black",
        background: "#F0F0F0",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {text}
    </div>
  );
};

const GameCoveredCell = ({
  row,
  col,
  isFlagged,
  onAction,
}: {
  row: number;
  col: number;
  isFlagged: boolean;
  onAction: (a: Action) => void;
}) => {
  const text = isFlagged ? "🚩" : "XX";
  const clickHandler = useClickHandler(
    () => onAction({ kind: "open", row, col }),
    () => onAction({ kind: "flag", row, col })
  );
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        clickHandler();
      }}
      style={{
        ...cellStyle,
        background: "#A0A0A0",
        color: "#A0A0A0",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onAction({ kind: "flag", row, col });
      }}
    >
      {text}
    </div>
  );
};
