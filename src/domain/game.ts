import { Board, Cell, getNeighborMinesCount } from "./board";
import assertNever from "../assert-never";

export type OpenCell = {
  kind: "open";
  x: number;
  y: number;
};

export type Action = OpenCell;

export type GamePlay = {
  kind: "play";
  board: Board;
};

export type GameWon = {
  kind: "won";
  board: Board;
};

export type GameLost = {
  kind: "lost";
  board: Board;
};

export type GameState = GamePlay | GameWon | GameLost;

export function dispatchAction(action: Action, game: GameState): GameState {
  switch (game.kind) {
    case "play":
      return dispatchPlayAction(action, game.board);
    case "won":
      return dispatchPlayAction(action, game.board);
    case "lost":
      return dispatchPlayAction(action, game.board);
    default:
      assertNever(game);
      return game;
  }
}

function dispatchPlayAction(action: Action, board: Board): GameState {
  switch (action.kind) {
    case "open":
      const [newBoard, isExploded] = openCell(action, board);
      if (isExploded) return { kind: "lost", board: uncoverAll(newBoard) };
      if (newBoard.minesCount === newBoard.uncoveredCount)
        return { kind: "won", board: uncoverAll(newBoard) };
      return { kind: "play", board: newBoard };
    default:
      assertNever(action.kind);
      throw new Error(`Unsupported action ${action}`);
  }
}

function uncoverAll(board: Board): Board {
  return board;
}

function openCell(
  { x, y }: { x: number; y: number },
  board: Board
): [Board, boolean] {
  const cell = board.cells.get(x)?.get(y);
  if (!cell) throw new Error(`Invalid grid cell coordinates ${x},${y}`);
  if (cell.kind !== "covered")
    throw new Error(`Attempt to open already open cell ${x},${y}`);

  const newCell: Cell = cell.isMined
    ? { kind: "exploded" }
    : {
        kind: "open_empty",
        neighborMinesCount: getNeighborMinesCount(board, [x, y]),
      };

  const isExploded = newCell.kind === "exploded";
  const cells = board.cells.setIn([x, y], newCell);
  return [
    { ...board, cells, uncoveredCount: board.uncoveredCount - 1 },
    isExploded,
  ];
}
