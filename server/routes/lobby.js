// server/routes/lobby.js
const express = require("express");
const router = express.Router();
const {
  createLobby, getLobby, getAllLobbies, updateLobby, deleteLobby, findLobbyByInviteCode,
} = require("../models/Lobby");

// GET /api/lobbies — List all open lobbies
router.get("/", (req, res) => {
  const lobbies = getAllLobbies();
  res.json({ lobbies });
});

// POST /api/lobbies — Create a new lobby
router.post("/", (req, res) => {
  const { name, mode, botDifficulty, timerMode, timerConfig, colorAssignment, isPrivate } = req.body;
  const hostId = req.body.hostId || `host_${Date.now()}`;
  const lobby = createLobby({ name, hostId, mode, botDifficulty, timerMode, timerConfig, colorAssignment, isPrivate });
  res.status(201).json({ lobby });
});

// GET /api/lobbies/:id — Get lobby details
router.get("/:id", (req, res) => {
  const lobby = getLobby(req.params.id);
  if (!lobby) return res.status(404).json({ error: "Lobby not found" });
  res.json({ lobby });
});

// POST /api/lobbies/:id/join — Join a lobby
router.post("/:id/join", (req, res) => {
  const lobby = getLobby(req.params.id);
  if (!lobby) return res.status(404).json({ error: "Lobby not found" });
  if (lobby.status !== "waiting") return res.status(400).json({ error: "Lobby is not accepting players" });
  if (lobby.guestId) return res.status(400).json({ error: "Lobby is full" });
  const { playerId } = req.body;
  if (playerId === lobby.hostId) return res.status(400).json({ error: "Cannot join your own lobby" });
  const updated = updateLobby(req.params.id, { guestId: playerId });
  res.json({ lobby: updated });
});

// DELETE /api/lobbies/:id — Delete a lobby
router.delete("/:id", (req, res) => {
  const deleted = deleteLobby(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Lobby not found" });
  res.json({ success: true });
});

// GET /api/lobbies/invite/:code — Find lobby by invite code
router.get("/invite/:code", (req, res) => {
  const lobby = findLobbyByInviteCode(req.params.code);
  if (!lobby) return res.status(404).json({ error: "Invalid invite code" });
  res.json({ lobby });
});

module.exports = router;
