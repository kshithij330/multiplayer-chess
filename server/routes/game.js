// server/routes/game.js
const express = require("express");
const router = express.Router();
const { getGame } = require("../models/Game");

// GET /api/games/:lobbyId — Get current game state
router.get("/:lobbyId", (req, res) => {
  const game = getGame(req.params.lobbyId);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json({
    lobbyId: game.lobbyId,
    fen: game.fen,
    turn: game.fen.split(" ")[1],
    moveHistory: game.moveHistory,
    isGameOver: !!game.result,
    result: game.result,
    timers: {
      white: { remaining: Math.max(0, Math.floor((game.timers.white.remaining || 0) * 10) / 10), active: game.timers.white.active },
      black: { remaining: Math.max(0, Math.floor((game.timers.black.remaining || 0) * 10) / 10), active: game.timers.black.active },
    },
    status: game.result ? "completed" : "active",
  });
});

// GET /api/games/:lobbyId/pgn — Export PGN
router.get("/:lobbyId/pgn", (req, res) => {
  const game = getGame(req.params.lobbyId);
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json({ pgn: game.pgn });
});

module.exports = router;
