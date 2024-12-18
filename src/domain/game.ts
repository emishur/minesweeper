import { Board, Cell } from "./board";
import assertNever from "../assert-never";

export type OpenCell = {
  kind: "open";
  x: number;
  y: number;
};

export type Action = OpenCell;

export function dispatchAction(action: Action, board: Board): Board {
  switch (action.kind) {
    case "open":
      return openCell(action, board);
    default:
      assertNever(action.kind);
  }
  return board;
}

function openCell({ x, y }: { x: number; y: number }, board: Board): Board {
  const cell = board.cells.get(x)?.get(y);
  if (!cell) throw new Error(`Invalid grid cell coordinates ${x},${y}`);
  if (cell.kind !== "covered")
    throw new Error(`Attempt to open already open cell ${x},${y}`);

  const newCell: Cell = cell.isMined
    ? { kind: "exploded" }
    : { kind: "open_empty", neighborMinesCount: 0 };

  const cells = board.cells.setIn([x, y], newCell);
  return { ...board, cells, uncoveredCount: board.uncoveredCount - 1 };
}
