import { GameBoard } from "./Board";
import { GameCtx } from "../App";
import assertNever from "../assert-never";

export function Game({ game, onAction }: GameCtx) {
  switch (game.kind) {
    case "play":
      return <GameBoard board={game.board} onAction={onAction} />;
    case "won":
      return <GameBoard board={game.board} onAction={onAction} />;
    case "lost":
      return <GameBoard board={game.board} onAction={onAction} />;
    default:
      assertNever(game);
      return <></>;
  }
}
