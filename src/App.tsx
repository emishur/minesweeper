import { useState } from "react";
import "./App.css";
import { generateBoard } from "./domain/board";
import { Action, dispatchAction, GameState } from "./domain/game";
import { Game } from "./components/Game";

export type GameCtx = {
  readonly game: GameState;
  onAction: (a: Action) => void;
};

function App() {
  const [game, setGame] = useState<GameState>(() => {
    const board = generateBoard({
      width: 16,
      height: 16,
      mines: [
        [1, 1],
        [0, 2],
      ],
    });
    return { kind: "play", board };
  });
  const onAction = (a: Action) => {
    const newGame = dispatchAction(a, game);
    setGame(newGame);
  };
  return (
    <>
      <h1> Minesweeper Game</h1>
      <Game game={game} onAction={onAction} />
    </>
  );
}

export default App;
