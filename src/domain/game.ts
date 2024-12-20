import {
  Board,
  Cell,
  Coords,
  findUnminedNeighbors,
  generateBoard,
  getNeighborMinesCount,
} from "./board";
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
      dispatchOpenAction({ x: action.x, y: action.y }, game.board)
    )
    .with([{ kind: "won" }, { kind: "reset" }], () => generateGame())
    .with([{ kind: "lost" }, { kind: "reset" }], () => generateGame())
    .otherwise(([state, action]): never => {
      throw new Error(
        `Invalid action ${action.kind} for game state ${state.kind}`
      );
    });

function dispatchOpenAction(coords: Coords, board: Board): GameState {
  const [newBoard, isExploded] = openCellCascade(coords, board);
  if (isExploded) return { kind: "lost", board: uncoverAll(newBoard) };
  if (newBoard.minesCount === newBoard.uncoveredCount)
    return { kind: "won", board: uncoverAll(newBoard) };
  return { kind: "play", board: newBoard };
}

function uncoverAll(board: Board): Board {
  const cells = board.cells.map((row, x) =>
    row.map((cell, y) =>
      match<Cell>(cell)
        .returnType<Cell>()
        .with({ kind: "open_empty" }, (c) => c)
        .with({ kind: "exploded" }, (c) => c)
        .with({ kind: "open_mined" }, (c) => c)
        .with({ kind: "covered" }, (c) =>
          c.isMined
            ? { kind: "open_mined" }
            : {
                kind: "open_empty",
                neighborMinesCount: getNeighborMinesCount(board, { x, y }),
              }
        )
        .exhaustive()
    )
  );
  return { ...board, cells, uncoveredCount: 0 };
}

type OpenCellResult = {
  board: Board;
  isExploded: boolean;
  neighbors: Coords[];
};

const coordsKey = ({ x, y }: Coords): string => `${x}:${y}`;

function openCellCascade(coords: Coords, board: Board): [Board, boolean] {
  let cellsToOpen = new Map<string, Coords>();
  cellsToOpen.set(coordsKey(coords), coords);
  let currentBoard = board;
  while (true) {
    const [entry, ...tail] = [...cellsToOpen];
    if (!entry) return [currentBoard, false];
    const [_, next] = entry;

    const res = openCell(next, currentBoard);
    if (res.isExploded) return [res.board, true];

    currentBoard = res.board;
    const neighborsMap = new Map<string, Coords>(
      res.neighbors.map((n): [string, Coords] => [coordsKey(n), n])
    );
    cellsToOpen = new Map<string, Coords>([...tail, ...neighborsMap]);
  }
}

function openCell({ x, y }: Coords, board: Board): OpenCellResult {
  const cell = board.cells.get(x)?.get(y);
  if (!cell) throw new Error(`Invalid grid cell coordinates ${x},${y}`);
  if (cell.kind !== "covered")
    throw new Error(`Attempt to open already open cell ${x},${y}`);

  const newCell: Cell = cell.isMined
    ? { kind: "exploded" }
    : {
        kind: "open_empty",
        neighborMinesCount: getNeighborMinesCount(board, { x, y }),
      };

  const isExploded = newCell.kind === "exploded";
  const cells = board.cells.setIn([x, y], newCell);
  const neighbors: Coords[] =
    newCell.kind === "open_empty" && newCell.neighborMinesCount === 0
      ? findUnminedNeighbors(board, { x, y })
      : [];
  const newBoard = {
    ...board,
    cells,
    uncoveredCount: board.uncoveredCount - 1,
  };
  return {
    board: newBoard,
    isExploded,
    neighbors,
  };
}

export function generateGame(): GameState {
  const board = generateBoard({
    width: 16,
    height: 16,
    mines: [
      [1, 1],
      [0, 2],
    ],
  });
  return { kind: "play", board };
}
