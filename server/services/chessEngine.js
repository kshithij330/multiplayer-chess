// server/services/chessEngine.js
const { Chess } = require("chess.js");

function createChessInstance(fen) {
  if (fen) {
    return new Chess(fen);
  }
  return new Chess();
}

function checkGameOver(game) {
  if (game.isCheckmate()) {
    const loser = game.turn();
    return { over: true, winner: loser === "w" ? "b" : "w", reason: "checkmate" };
  }
  if (game.isStalemate()) {
    return { over: true, winner: null, reason: "stalemate" };
  }
  if (game.isInsufficientMaterial()) {
    return { over: true, winner: null, reason: "insufficient_material" };
  }
  if (game.isThreefoldRepetition()) {
    return { over: true, winner: null, reason: "threefold_repetition" };
  }
  if (game.isDraw()) {
    return { over: true, winner: null, reason: "fifty_move_rule" };
  }
  return { over: false };
}

function getLegalMovesUCI(game) {
  return game.moves({ verbose: true }).map((m) => {
    let uci = m.from + m.to;
    if (m.promotion) uci += m.promotion;
    return uci;
  });
}

function getGameOverMessage(reason, winner) {
  const messages = {
    checkmate: winner
      ? `Checkmate! ${winner === "w" ? "White" : "Black"} wins!`
      : "Checkmate!",
    timeout: winner
      ? `Time out! ${winner === "w" ? "White" : "Black"} wins!`
      : "Time out!",
    stalemate: "Stalemate! The game is a draw.",
    insufficient_material: "Draw by insufficient material.",
    threefold_repetition: "Draw by threefold repetition.",
    fifty_move_rule: "Draw by the fifty-move rule.",
    resignation: winner
      ? `${winner === "w" ? "Black" : "White"} resigned. ${winner === "w" ? "White" : "Black"} wins!`
      : "Player resigned.",
    draw_agreement: "Both players agreed to a draw.",
    abandonment: winner
      ? `Player abandoned the game. ${winner === "w" ? "White" : "Black"} wins!`
      : "Player abandoned the game.",
  };
  return messages[reason] || "Game over.";
}

module.exports = {
  createChessInstance,
  checkGameOver,
  getLegalMovesUCI,
  getGameOverMessage,
};
