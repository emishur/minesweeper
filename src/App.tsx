import { useState } from "react";
import "./App.css";
import { Board, generateBoard } from "./domain/board";
import { Action, dispatchAction } from "./domain/game";
import { GameBoard } from "./components/Board";

export type GameCtx = {
  readonly board: Board;
  onAction: (a: Action) => void;
};

function App() {
  const [board, setBoard] = useState<Board>(() =>
    generateBoard({
      width: 16,
      height: 16,
      mines: [
        [1, 1],
        [0, 2],
      ],
    })
  );
  const onAction = (a: Action) => {
    const newBoard = dispatchAction(a, board);
    setBoard(newBoard);
  };
  return (
    <>
      <h1> Minesweeper Game</h1>
      <GameBoard board={board} onAction={onAction} />
    </>
  );
}

export default App;
