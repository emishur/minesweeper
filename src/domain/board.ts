import { List, Range } from "immutable";
import { match } from "ts-pattern";

export type CoveredCell = {
  kind: "covered";
  isMined: boolean;
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
  cells: List<List<Cell>>;
};

const isMined = (cell: Cell): boolean =>
  match(cell)
    .with({ kind: "covered" }, ({ isMined }) => isMined)
    .with({ kind: "exploded" }, () => true)
    .with({ kind: "open_empty" }, () => false)
    .with({ kind: "open_mined" }, () => true)
    .exhaustive();

export type Coords = { x: number; y: number };

const offsets = [-1, 0, 1];
const coordOffsets = offsets
  .flatMap((x) => offsets.map((y) => ({ x, y })))
  .filter(({ x, y }) => !(x === 0 && y === 0));

const findNeighborCoords = (board: Board, { x, y }: Coords): Coords[] =>
  coordOffsets
    .map((d): Coords => ({ x: x + d.x, y: y + d.y }))
    .filter(({ x }) => x >= 0 && x < board.height)
    .filter(({ y }) => y >= 0 && y < board.width);

export function getNeighborMinesCount(board: Board, coords: Coords): number {
  const neighborCoords = findNeighborCoords(board, coords);

  const count = neighborCoords
    .map(({ x, y }): number => {
      const cell = board.cells.get(x)?.get(y);
      if (!cell) throw new Error(`Cannot access grid cell ${x}, ${y}`);
      return isMined(cell) ? 1 : 0;
    })
    .reduce((a, b) => a + b);
  return count;
}

export function findUnminedNeighbors(board: Board, { x, y }: Coords): Coords[] {
  const neighborCoords = findNeighborCoords(board, { x, y });
  return neighborCoords.filter(({ x, y }) => {
    const cell = board.cells.get(x)?.get(y);
    if (!cell) throw new Error(`Cannot access cell with coordinates ${x},${y}`);
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
    .map((x) =>
      Range(0, seed.width)
        .map(
          (y): Cell => ({
            kind: "covered",
            isMined: seed.mines.some(([mx, my]) => mx === x && my === y),
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
  };
}
