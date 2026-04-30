// server/models/Lobby.js
const { v4: uuidv4 } = require("uuid");

const lobbies = new Map();

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createLobby({
  name,
  hostId,
  mode = "pvp",
  botDifficulty = null,
  timerMode = "blitz_5_3",
  timerConfig = null,
  colorAssignment = "random",
  isPrivate = false,
}) {
  const id = uuidv4();
  const lobby = {
    id,
    name: name || `Game ${id.slice(0, 6)}`,
    hostId,
    guestId: null,
    mode,
    botDifficulty: mode === "bot" ? (botDifficulty || 3) : null,
    timerMode,
    timerConfig: timerConfig || getDefaultTimerConfig(timerMode),
    colorAssignment,
    status: "waiting",
    isPrivate,
    inviteCode: isPrivate ? generateInviteCode() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveHistory: [],
  };

  lobbies.set(id, lobby);
  return lobby;
}

function getDefaultTimerConfig(timerMode) {
  const TIMER_PRESETS = {
    bullet_1_0:   { initialSeconds: 60,   incrementSeconds: 0 },
    bullet_2_1:   { initialSeconds: 120,  incrementSeconds: 1 },
    blitz_3_2:    { initialSeconds: 180,  incrementSeconds: 2 },
    blitz_5_0:    { initialSeconds: 300,  incrementSeconds: 0 },
    blitz_5_3:    { initialSeconds: 300,  incrementSeconds: 3 },
    rapid_10_0:   { initialSeconds: 600,  incrementSeconds: 0 },
    rapid_10_5:   { initialSeconds: 600,  incrementSeconds: 5 },
    rapid_15_10:  { initialSeconds: 900,  incrementSeconds: 10 },
    classical_30: { initialSeconds: 1800, incrementSeconds: 0 },
    classical_60: { initialSeconds: 3600, incrementSeconds: 0 },
    none:         { initialSeconds: null, incrementSeconds: 0 },
  };
  return TIMER_PRESETS[timerMode] || TIMER_PRESETS.blitz_5_3;
}

function getLobby(id) {
  return lobbies.get(id) || null;
}

function getAllLobbies() {
  return Array.from(lobbies.values()).filter(l => l.status === "waiting" && !l.isPrivate);
}

function updateLobby(id, updates) {
  const lobby = lobbies.get(id);
  if (!lobby) return null;
  Object.assign(lobby, updates, { updatedAt: new Date().toISOString() });
  lobbies.set(id, lobby);
  return lobby;
}

function deleteLobby(id) {
  return lobbies.delete(id);
}

function findLobbyByInviteCode(code) {
  for (const lobby of lobbies.values()) {
    if (lobby.inviteCode === code && lobby.status === "waiting") {
      return lobby;
    }
  }
  return null;
}

module.exports = {
  createLobby,
  getLobby,
  getAllLobbies,
  updateLobby,
  deleteLobby,
  findLobbyByInviteCode,
  getDefaultTimerConfig,
};
