// client/src/hooks/useChessGame.js
import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import useGameStore from "../store/gameStore";

export default function useChessGame() {
  const gameRef = useRef(new Chess());
  const store = useGameStore();

  const resetChessInstance = useCallback((fen) => {
    if (fen) {
      gameRef.current = new Chess(fen);
    } else {
      gameRef.current = new Chess();
    }
  }, []);

  const loadFen = useCallback((fen) => {
    try {
      gameRef.current.load(fen);
    } catch (e) {
      console.error("Failed to load FEN:", e);
    }
  }, []);

  const makeMove = useCallback((from, to, promotion) => {
    const result = gameRef.current.move({ from, to, promotion: promotion || "q" });
    return result;
  }, []);

  const getLegalMoves = useCallback((square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    return moves.map((m) => m.to);
  }, []);

  const isMoveLegal = useCallback((from, to) => {
    const moves = gameRef.current.moves({ square: from, verbose: true });
    return moves.some((m) => m.to === to);
  }, []);

  const isPromotion = useCallback((from, to) => {
    const piece = gameRef.current.get(from);
    if (!piece || piece.type !== "p") return false;
    const targetRank = to[1];
    return (piece.color === "w" && targetRank === "8") || (piece.color === "b" && targetRank === "1");
  }, []);

  const getGameState = useCallback(() => {
    const game = gameRef.current;
    return {
      fen: game.fen(),
      turn: game.turn(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      isGameOver: game.isGameOver(),
      history: game.history(),
      historyVerbose: game.history({ verbose: true }),
      pgn: game.pgn(),
    };
  }, []);

  return {
    game: gameRef.current,
    resetChessInstance,
    loadFen,
    makeMove,
    getLegalMoves,
    isMoveLegal,
    isPromotion,
    getGameState,
  };
}
