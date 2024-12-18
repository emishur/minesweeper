import { memo } from "react";
import { GameCtx } from "../App";
import * as Immutable from "immutable";

export const GameBoard = memo(
  ({ board }: GameCtx) => {
    console.log("render", board.width);
    const cells = board.cells.flatMap((row, x) =>
      row.map((_, y) => <div key={`${x}:${y}`}>C</div>)
    );
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board.width}, 1fr)`,
        }}
      >
        {cells}
      </div>
    );
  },
  (prev, current) => {
    console.log("compare", Immutable.is(prev.board.cells, current.board.cells));
    return Immutable.is(prev.board.cells, current.board.cells);
  }
);
