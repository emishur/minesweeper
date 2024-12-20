import {
  Board,
  Cell,
  Coords,
  coordsKey,
  CoveredCell,
  findUnminedNeighbors,
  generateBoard,
  generateMines,
  getNeighborMinesCount,
} from "./board";
import { match } from "ts-pattern";

export type OpenCell = {
  kind: "open";
  row: number;
  col: number;
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

export type ToggleFlag = {
  kind: "flag";
  row: number;
  col: number;
};

export type Action = Select | OpenCell | Reset | NewGame | ToggleFlag;

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
      openCellOnStart({ row: action.row, col: action.col }, game.board)
    )
    .with([{ kind: "play" }, { kind: "open" }], ([game, action]) =>
      openCellOnPlay({ row: action.row, col: action.col }, game.board)
    )
    .with([{ kind: "play" }, { kind: "flag" }], ([game, action]) => {
      const board = toggleFlag(
        { row: action.row, col: action.col },
        game.board
      );
      return { ...game, board };
    })
    .with([{ kind: "start" }, { kind: "open" }], ([game, action]) => {
      const board = toggleFlag(
        { row: action.row, col: action.col },
        game.board
      );
      return { ...game, board };
    })
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

function toggleFlag({ row, col }: Coords, board: Board): Board {
  const cell = board.cells.get(row)?.get(col);
  if (!cell) throw new Error(`Cannot access cell ${row}, ${col}`);
  if (cell.kind !== "covered")
    throw new Error(`Cannot flag uncovered cell ${row}, ${col}`);

  const newCell: CoveredCell = { ...cell, isFlagged: !cell.isFlagged };
  const newCells = board.cells.setIn([row, col], newCell);
  const flagsDelta = newCell.isFlagged ? 1 : -1;
  return {
    ...board,
    cells: newCells,
    flagsCount: board.flagsCount + flagsDelta,
  };
}

function openCellOnPlay(coords: Coords, board: Board): GameState {
  const [newBoard, isExploded] = openCellCascade(coords, board);
  if (isExploded) return { kind: "lost", board: uncoverAll(newBoard) };
  if (newBoard.minesCount === newBoard.uncoveredCount)
    return { kind: "won", board: uncoverAll(newBoard) };
  return { kind: "play", board: newBoard };
}

function uncoverAll(board: Board): Board {
  const cells = board.cells.map((row, rowIdx) =>
    row.map((cell, colIdx) =>
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
                neighborMinesCount: getNeighborMinesCount(board, {
                  row: rowIdx,
                  col: colIdx,
                }),
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

function openCell({ row, col }: Coords, board: Board): OpenCellResult {
  const cell = board.cells.get(row)?.get(col);
  if (!cell) throw new Error(`Invalid grid cell coordinates ${row},${col}`);
  if (cell.kind !== "covered")
    throw new Error(`Attempt to open already open cell ${row},${col}`);

  const newCell: Cell = cell.isMined
    ? { kind: "exploded" }
    : {
        kind: "open_empty",
        neighborMinesCount: getNeighborMinesCount(board, { row, col }),
      };

  const isExploded = newCell.kind === "exploded";
  const cells = board.cells.setIn([row, col], newCell);
  const neighbors: Coords[] =
    newCell.kind === "open_empty" && newCell.neighborMinesCount === 0
      ? findUnminedNeighbors(board, { row, col })
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
  const newBoard = generateBoard({
    width: board.width,
    height: board.height,
    mines,
  });
  return openCellOnPlay(coords, newBoard);
}
