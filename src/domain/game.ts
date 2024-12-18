import { Board, Cell, getNeighborMinesCount } from "./board";
import { match } from "ts-pattern";

export type OpenCell = {
  kind: "open";
  x: number;
  y: number;
};

export type Reset = {
  kind: "reset";
};

export type Action = OpenCell | Reset;

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

export const dispatchAction = (action: Action, game: GameState): GameState =>
  match<[GameState, Action]>([game, action])
    .with([{ kind: "play" }, { kind: "open" }], ([game, action]) =>
      dispatchOpenAction(action, game.board)
    )
    .with([{ kind: "won" }, { kind: "reset" }], () => game)
    .with([{ kind: "lost" }, { kind: "reset" }], () => game)
    .otherwise(([state, action]): never => {
      throw new Error(
        `Invalid action ${action.kind} for game state ${state.kind}`
      );
    });

function dispatchOpenAction(
  coords: { x: number; y: number },
  board: Board
): GameState {
  const [newBoard, isExploded] = openCell(coords, board);
  if (isExploded) return { kind: "lost", board: uncoverAll(newBoard) };
  if (newBoard.minesCount === newBoard.uncoveredCount)
    return { kind: "won", board: uncoverAll(newBoard) };
  return { kind: "play", board: newBoard };
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
