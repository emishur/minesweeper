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
export type Select = {
  kind: "select";
};
export type NewGame = {
  kind: "new";
  width: number;
  height: number;
  mines: number;
};

export type Action = Select | OpenCell | Reset | NewGame;

export type GameSelect = {
  kind: "select";
};

export type GameStart = {
  kind: "start";
  board: Board;
};

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

export type GameState = GameSelect | GameStart | GamePlay | GameWon | GameLost;

export const dispatchAction = (action: Action, game: GameState): GameState =>
  match<[GameState, Action]>([game, action])
    .with([{ kind: "select" }, { kind: "new" }], ([_, action]) =>
      newGame(action)
    )
    .with([{ kind: "start" }, { kind: "open" }], ([game, action]) =>
      openCellOnStart({ x: action.x, y: action.y }, game.board)
    )
    .with([{ kind: "play" }, { kind: "open" }], ([game, action]) =>
      openCellOnPlay({ x: action.x, y: action.y }, game.board)
    )
    .with([{ kind: "won" }, { kind: "reset" }], ([{ board }]) =>
      newGameFromBoard(board)
    )
    .with([{ kind: "lost" }, { kind: "reset" }], ([{ board }]) =>
      newGameFromBoard(board)
    )
    .with(
      [{ kind: "won" }, { kind: "select" }],
      (): GameState => ({ kind: "select" })
    )
    .with(
      [{ kind: "lost" }, { kind: "select" }],
      (): GameState => ({ kind: "select" })
    )
    .otherwise(([state, action]): never => {
      throw new Error(
        `Invalid action ${action.kind} for game state ${state.kind}`
      );
    });

function openCellOnPlay(coords: Coords, board: Board): GameState {
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

const newGameFromBoard = (board: Board): GameState =>
  newGame({
    kind: "new",
    width: board.width,
    height: board.height,
    mines: board.minesCount,
  });

function newGame(action: NewGame): GameState {
  const board = generateBoard({
    width: action.width,
    height: action.height,
    mines: [],
  });
  board.minesCount = action.mines;
  return { kind: "start", board };
}

function openCellOnStart(coords: Coords, board: Board): GameState {
  const mines = generateMines(coords, board);
  console.log("MINES", mines);
  const newBoard = generateBoard({
    width: board.width,
    height: board.height,
    mines,
  });
  return openCellOnPlay(coords, newBoard);
}

function generateMines(
  exclude: Coords,
  {
    width,
    height,
    minesCount,
  }: {
    width: number;
    height: number;
    minesCount: number;
  }
): [number, number][] {
  const placed = new Map([[coordsKey(exclude), exclude]]);
  while (placed.size < minesCount + 1) {
    const x = randomIntFromInterval(0, height);
    const y = randomIntFromInterval(0, width);
    const coords = { x, y };
    placed.set(coordsKey(coords), coords);
  }
  placed.delete(coordsKey(exclude));
  return [...placed.values()].map(({ x, y }): [number, number] => [x, y]);
}
function randomIntFromInterval(min: number, max: number): number {
  // min included max excluded
  return Math.floor(Math.random() * (max - min) + min);
}
