import { useState } from "react";
import "./App.css";
import { Action, dispatchAction, GameState } from "./domain/game";
import { Game } from "./components/Game";

export type GameCtx = {
  readonly game: GameState;
  onAction: (a: Action) => void;
};

function App() {
  const [game, setGame] = useState<GameState>({ kind: "select" });
  const onAction = (a: Action) => {
    const newGame = dispatchAction(a, game);
    setGame(newGame);
  };
  return (
    <>
      <h1> Minesweeper</h1>
      <div>
        <Game game={game} onAction={onAction} />
      </div>
    </>
  );
}

export default App;
