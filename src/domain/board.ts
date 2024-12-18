import { List, Range } from "immutable";
import assertNever from "../assert-never";

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

function isMined(cell: Cell): boolean {
  switch (cell.kind) {
    case "covered":
      return cell.isMined;
    case "exploded":
      return true;
    case "open_empty":
      return false;
    case "open_mined":
      return true;
    default:
      assertNever(cell);
      return false;
  }
}

const offsets = [-1, 0, 1];
const coordOffsets = offsets
  .flatMap((x) => offsets.map((y) => [x, y]))
  .filter(([x, y]) => !(x === 0 && y === 0));

export function getNeighborMinesCount(
  board: Board,
  [x, y]: [number, number]
): number {
  const neighborCoords = coordOffsets
    .map(([dX, dY]) => [x + dX, y + dY])
    .filter(([x, _]) => x >= 0 && x < board.width)
    .filter(([_, y]) => y >= 0 && y < board.height);

  const count = neighborCoords
    .map(([x, y]): number => {
      const cell = board.cells.get(x)?.get(y);
      if (!cell) throw new Error(`Cannot access grid cell ${x}, ${y}`);
      return isMined(cell) ? 1 : 0;
    })
    .reduce((a, b) => a + b);
  return count;
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
