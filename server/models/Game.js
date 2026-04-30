// server/models/Game.js
const games = new Map();

function createGame({
  lobbyId,
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  whitePlayerId,
  blackPlayerId,
  timerConfig,
  isBotGame = false,
  botDifficulty = null,
}) {
  const game = {
    lobbyId,
    fen,
    pgn: "",
    moveHistory: [],
    whitePlayerId,
    blackPlayerId,
    result: null,
    timers: {
      white: { remaining: timerConfig.initialSeconds, active: false },
      black: { remaining: timerConfig.initialSeconds, active: false },
    },
    timerConfig,
    isBotGame,
    botDifficulty,
    startedAt: new Date().toISOString(),
    endedAt: null,
    timerInterval: null,
    lastTickTime: null,
  };

  games.set(lobbyId, game);
  return game;
}

function getGame(lobbyId) {
  return games.get(lobbyId) || null;
}

function updateGame(lobbyId, updates) {
  const game = games.get(lobbyId);
  if (!game) return null;
  Object.assign(game, updates);
  games.set(lobbyId, game);
  return game;
}

function deleteGame(lobbyId) {
  const game = games.get(lobbyId);
  if (game && game.timerInterval) {
    clearInterval(game.timerInterval);
  }
  return games.delete(lobbyId);
}

module.exports = {
  createGame,
  getGame,
  updateGame,
  deleteGame,
};
