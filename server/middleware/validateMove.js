// server/middleware/validateMove.js
const { Chess } = require("chess.js");

// Rate limiting per player
const lastMoveTimestamps = new Map();
const MOVE_RATE_LIMIT_MS = 100;

function sanitizeMoveInput(input) {
  return {
    from: String(input.from || "").toLowerCase().slice(0, 2),
    to: String(input.to || "").toLowerCase().slice(0, 2),
    promotion: ["q", "r", "b", "n"].includes(String(input.promotion || "").toLowerCase())
      ? String(input.promotion).toLowerCase()
      : null,
  };
}

function validateMove(currentFen, from, to, promotion) {
  const game = new Chess(currentFen);

  const result = game.move({ from, to, promotion: promotion ?? "q" });

  if (!result) {
    return {
      valid: false,
      error: `Illegal move: ${from} → ${to}. Not a valid move in this position.`,
    };
  }

  return { valid: true, move: result, newFen: game.fen() };
}

function validatePlayerTurn(socketId, gameData) {
  const currentTurn = gameData.currentTurn || "w";

  if (currentTurn === "w" && socketId !== gameData.whitePlayerId) {
    return false;
  }
  if (currentTurn === "b" && socketId !== gameData.blackPlayerId) {
    return false;
  }
  return true;
}

function checkRateLimit(playerId) {
  const now = Date.now();
  const lastMove = lastMoveTimestamps.get(playerId);

  if (lastMove && now - lastMove < MOVE_RATE_LIMIT_MS) {
    return false;
  }

  lastMoveTimestamps.set(playerId, now);
  return true;
}

module.exports = {
  sanitizeMoveInput,
  validateMove,
  validatePlayerTurn,
  checkRateLimit,
};
