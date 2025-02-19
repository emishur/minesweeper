import { List, Range } from "immutable";
import { match } from "ts-pattern";

export type CoveredCell = {
  kind: "covered";
  isMined: boolean;
  isFlagged: boolean;
};

export type OpenEmptyCell = {
  kind: "open_empty";
  neighborMinesCount: number;
};

export type ExplodedCell = {
  kind: "exploded";
};

export type OpenMinedCell = {
  kind: "open_mined";
};

export type Cell = CoveredCell | OpenEmptyCell | ExplodedCell | OpenMinedCell;

export type Board = {
  width: number;
  height: number;
  minesCount: number;
  uncoveredCount: number;
  flagsCount: number;
  cells: List<List<Cell>>;
};

const isMined = (cell: Cell): boolean =>
  match(cell)
    .with({ kind: "covered" }, ({ isMined }) => isMined)
    .with({ kind: "exploded" }, () => true)
    .with({ kind: "open_empty" }, () => false)
    .with({ kind: "open_mined" }, () => true)
    .exhaustive();

export type Coords = { row: number; col: number };

export const coordsKey = ({ row, col }: Coords): string => `${row}:${col}`;

const offsets = [-1, 0, 1];
const coordOffsets = offsets
  .flatMap((row) => offsets.map((col) => ({ row, col })))
  .filter(({ row, col }) => !(row === 0 && col === 0));

const findNeighborCoords = (board: Board, { row, col }: Coords): Coords[] =>
  coordOffsets
    .map((d): Coords => ({ row: row + d.row, col: col + d.col }))
    .filter(({ row }) => row >= 0 && row < board.height)
    .filter(({ col }) => col >= 0 && col < board.width);

export function getNeighborMinesCount(board: Board, coords: Coords): number {
  const neighborCoords = findNeighborCoords(board, coords);

  const count = neighborCoords
    .map(({ row, col }): number => {
      const cell = board.cells.get(row)?.get(col);
      if (!cell) throw new Error(`Cannot access grid cell ${row}, ${col}`);
      return isMined(cell) ? 1 : 0;
    })
    .reduce((a, b) => a + b);
  return count;
}

export function findUnminedNeighbors(board: Board, coords: Coords): Coords[] {
  const neighborCoords = findNeighborCoords(board, coords);
  return neighborCoords.filter(({ row, col }) => {
    const cell = board.cells.get(row)?.get(col);
    if (!cell)
      throw new Error(`Cannot access cell with coordinates ${row},${col}`);
    return cell.kind === "covered" && !cell.isMined;
  });
}

export type GameSeed = {
  width: number;
  height: number;
  mines: [number, number][];
};

export function generateBoard(seed: GameSeed): Board {
  const cells = Range(0, seed.height)
    .map((row) =>
      Range(0, seed.width)
        .map(
          (col): Cell => ({
            kind: "covered",
            isMined: seed.mines.some(
              ([mrow, mcol]) => mrow === row && mcol === col
            ),
            isFlagged: false,
          })
        )
        .toList()
    )
    .toList();
  return {
    cells,
    width: seed.width,
    height: seed.height,
    minesCount: seed.mines.length,
    uncoveredCount: seed.width * seed.height,
    flagsCount: 0,
  };
}

export function generateMines(
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
    const row = randomIntFromInterval(0, height);
    const col = randomIntFromInterval(0, width);
    const coords = { row, col };
    placed.set(coordsKey(coords), coords);
  }
  placed.delete(coordsKey(exclude));
  return [...placed.values()].map(({ row, col }): [number, number] => [
    row,
    col,
  ]);
}
function randomIntFromInterval(min: number, max: number): number {
  // min included max excluded
  return Math.floor(Math.random() * (max - min) + min);
}
