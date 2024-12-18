import { useState } from "react";
import "./App.css";
import { Action, dispatchAction, GameState, generateGame } from "./domain/game";
import { Game } from "./components/Game";

export type GameCtx = {
  readonly game: GameState;
  onAction: (a: Action) => void;
};

function App() {
  const [game, setGame] = useState<GameState>(() => generateGame());
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
