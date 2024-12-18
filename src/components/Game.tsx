import { GameBoard } from "./Board";
import { GameCtx } from "../App";
import { Board } from "../domain/board";
import { match } from "ts-pattern";

export const Game = ({ game, onAction }: GameCtx) =>
  match(game)
    .with({ kind: "play" }, () => <GamePlay game={game} onAction={onAction} />)
    .with({ kind: "won" }, () => <GameWon game={game} onAction={onAction} />)
    .with({ kind: "lost" }, () => <GameLost game={game} onAction={onAction} />)
    .exhaustive();

function GameScore({ board, message }: { board: Board; message: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "1rem",
        fontWeight: "bold",
        fontSize: "2em",
      }}
    >
      <div>Mines: {board.minesCount}</div>
      <div
        style={{
          color: "blue",
        }}
      >
        {message}
      </div>
      <div>Uncovered: {board.uncoveredCount}</div>
    </div>
  );
}

function GamePlay({ game, onAction }: GameCtx) {
  return (
    <div>
      <GameScore board={game.board} message="***" />
      <GameBoard board={game.board} onAction={onAction} />;
    </div>
  );
}

function GameWon({ game, onAction }: GameCtx) {
  return (
    <div>
      <GameScore board={game.board} message="You won!!!" />
      <GameBoard board={game.board} onAction={onAction} />
    </div>
  );
}

function GameLost({ game, onAction }: GameCtx) {
  return (
    <div>
      <GameScore board={game.board} message="You lost" />
      <GameBoard board={game.board} onAction={onAction} />
    </div>
  );
}
