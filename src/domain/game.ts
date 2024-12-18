import { Board } from "./board";

export type OpenCell = {
  kind: "open";
  x: number;
  y: number;
};

export type Action = OpenCell;

export function dispatchAction(_: Action, board: Board): Board {
  return board;
}
