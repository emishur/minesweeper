import { CSSProperties, memo } from "react";
import * as Immutable from "immutable";
import { Board, Cell } from "../domain/board";
import { Action } from "../domain/game";
import { match } from "ts-pattern";
import { useClickHandler, useCustomContextMenu } from "./double-click";

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
          fontSize={board.width > 10 ? "0.7rem" : "1rem"}
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
    fontSize,
  }: {
    row: number;
    col: number;
    cell: Cell;
    onAction: (a: Action) => void;
    fontSize: string;
  }) =>
    match<Cell>(cell)
      .with({ kind: "open_empty" }, ({ neighborMinesCount }) => (
        <GameOpenCell
          text={neighborMinesCount === 0 ? "" : neighborMinesCount.toString()}
          fontSize={fontSize}
        />
      ))
      .with({ kind: "exploded" }, () => (
        <GameOpenCell text="🔥" fontSize={fontSize} />
      ))
      .with({ kind: "open_mined" }, () => (
        <GameOpenCell text="💣" fontSize={fontSize} />
      ))
      .with({ kind: "covered" }, ({ isFlagged }) => (
        <GameCoveredCell
          row={row}
          col={col}
          isFlagged={isFlagged}
          onAction={onAction}
          fontSize={fontSize}
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
  userSelect: "none",
  WebkitUserSelect: "none",
};

const GameOpenCell = ({
  text,
  fontSize,
}: {
  text: string;
  fontSize: string;
}) => {
  return (
    <div
      style={{
        ...cellStyle,
        color: "black",
        background: "#F0F0F0",
        fontSize: fontSize,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {text}
    </div>
  );
};

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

const GameCoveredCell = ({
  row,
  col,
  isFlagged,
  onAction,
  fontSize,
}: {
  row: number;
  col: number;
  isFlagged: boolean;
  onAction: (a: Action) => void;
  fontSize: string;
}) => {
  const toggleFlag = () => onAction({ kind: "flag", row, col });
  const text = isFlagged ? "🚩" : "";
  const clickHandler = useClickHandler(
    () => onAction({ kind: "open", row, col }),
    toggleFlag,
    250
  );
  const { onTouchStart, onTouchEnd } = useCustomContextMenu(toggleFlag);
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
        fontSize: fontSize,
      }}
      onContextMenu={(e) => {
        if (!isIOS) {
          e.preventDefault();
          toggleFlag();
        }
      }}
      onTouchStart={() => {
        if (isIOS) onTouchStart();
      }}
      onTouchEnd={(e) => {
        if (isIOS) onTouchEnd(() => e.preventDefault());
      }}
    >
      {text}
    </div>
  );
};
