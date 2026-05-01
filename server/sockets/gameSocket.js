// server/sockets/gameSocket.js
const { Chess } = require("chess.js");
const { createLobby, getLobby, updateLobby, getAllLobbies, findLobbyByInviteCode } = require("../models/Lobby");
const { createGame, getGame, updateGame, deleteGame } = require("../models/Game");
const { checkGameOver, getLegalMovesUCI } = require("../services/chessEngine");
const { getBotMove, getThinkDelay } = require("../services/botService");
const { startTimers, onMoveComplete, stopTimers } = require("../services/timerService");
const { sanitizeMoveInput, checkRateLimit } = require("../middleware/validateMove");

// In-memory chess instances keyed by lobbyId
const chessInstances = new Map();

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // ── Lobby Events ──
    socket.on("lobby:create", (data) => {
      const lobby = createLobby({ ...data, hostId: socket.id });
      socket.join(lobby.id);
      socket.emit("lobby:created", { lobby });
      io.emit("lobby:list_updated", { lobbies: getAllLobbies() });

      // If bot mode, start game immediately
      if (lobby.mode === "bot") {
        startBotGame(io, socket, lobby);
      }
    });

    socket.on("lobby:join", ({ lobbyId, inviteCode }) => {
      let lobby;
      if (inviteCode) {
        lobby = findLobbyByInviteCode(inviteCode);
        if (lobby) lobbyId = lobby.id;
      } else {
        lobby = getLobby(lobbyId);
      }
      if (!lobby) return socket.emit("error", { code: "LOBBY_NOT_FOUND", message: "Lobby not found" });
      if (lobby.status !== "waiting") return socket.emit("error", { code: "LOBBY_NOT_WAITING", message: "Game already started" });
      if (lobby.guestId) return socket.emit("error", { code: "LOBBY_FULL", message: "Lobby is full" });
      if (socket.id === lobby.hostId) return socket.emit("error", { code: "SELF_JOIN", message: "Cannot join your own lobby" });

      updateLobby(lobbyId, { guestId: socket.id, status: "active" });
      socket.join(lobbyId);

      // Resolve colors
      let hostColor, guestColor;
      if (lobby.colorAssignment === "white") { hostColor = "w"; guestColor = "b"; }
      else if (lobby.colorAssignment === "black") { hostColor = "b"; guestColor = "w"; }
      else { hostColor = Math.random() < 0.5 ? "w" : "b"; guestColor = hostColor === "w" ? "b" : "w"; }

      const game = new Chess();
      chessInstances.set(lobbyId, game);

      const timerConfig = lobby.timerConfig;
      const gameData = createGame({
        lobbyId,
        whitePlayerId: hostColor === "w" ? lobby.hostId : socket.id,
        blackPlayerId: hostColor === "b" ? lobby.hostId : socket.id,
        timerConfig,
        isBotGame: false,
      });

      io.to(lobbyId).emit("game:start", {
        lobbyId,
        fen: game.fen(),
        whitePlayerId: gameData.whitePlayerId,
        blackPlayerId: gameData.blackPlayerId,
        timers: gameData.timers,
        timerConfig,
      });

      // Start timers
      startTimers(gameData, io);
      io.emit("lobby:list_updated", { lobbies: getAllLobbies() });
    });

    socket.on("lobby:leave", ({ lobbyId }) => {
      socket.leave(lobbyId);
      const lobby = getLobby(lobbyId);
      if (lobby && lobby.hostId === socket.id) {
        updateLobby(lobbyId, { status: "completed" });
        io.to(lobbyId).emit("lobby:closed", { reason: "Host left" });
      }
    });

    socket.on("lobby:list", () => {
      socket.emit("lobby:list_updated", { lobbies: getAllLobbies() });
    });

    // ── Game Move Events ──
    socket.on("game:move", async ({ lobbyId, from, to, promotion, clientHandlesBot }) => {
      const gameData = getGame(lobbyId);
      const game = chessInstances.get(lobbyId);
      if (!gameData || !game) return socket.emit("error", { code: "GAME_NOT_FOUND", message: "Game not found" });
      if (!checkRateLimit(socket.id)) return socket.emit("error", { code: "RATE_LIMITED", message: "Too fast" });

      // Validate turn
      const currentTurn = game.turn();
      const isWhite = socket.id === gameData.whitePlayerId;
      const isBlack = socket.id === gameData.blackPlayerId;
      
      // In a bot game, the human player is allowed to submit moves for the bot
      const isBotTurn = gameData.isBotGame && (
        (currentTurn === "w" && gameData.whitePlayerId === "bot") ||
        (currentTurn === "b" && gameData.blackPlayerId === "bot")
      );

      if (!isWhite && !isBlack && !isBotTurn) {
        console.log(`[Socket] Unauthorized move attempt by ${socket.id}`);
        return socket.emit("error", { code: "NOT_YOUR_TURN", message: "It is not your turn" });
      }

      // If it's the bot's turn but it's not a bot game move from client, block it
      if (!isBotTurn && ((currentTurn === "w" && !isWhite) || (currentTurn === "b" && !isBlack))) {
        return socket.emit("error", { code: "NOT_YOUR_TURN", message: "It is not your turn" });
      }

      const sanitized = sanitizeMoveInput({ from, to, promotion });
      const move = game.move({ from: sanitized.from, to: sanitized.to, promotion: sanitized.promotion ?? "q" });
      if (!move) return socket.emit("error", { code: "ILLEGAL_MOVE", message: `Illegal move: ${from} → ${to}` });

      // Update game data
      gameData.fen = game.fen();
      gameData.pgn = game.pgn();
      gameData.moveHistory.push(move);
      onMoveComplete(gameData, currentTurn);

      const isCheck = game.isCheck();
      const gameOverResult = checkGameOver(game);

      io.to(lobbyId).emit("game:move", {
        move, fen: game.fen(),
        timers: gameData.timers,
        isCheck, isCheckmate: gameOverResult.over && gameOverResult.reason === "checkmate",
        isDraw: gameOverResult.over && !gameOverResult.winner,
      });

      if (isCheck && !gameOverResult.over) {
        io.to(lobbyId).emit("game:check", { checkedColor: game.turn(), fen: game.fen() });
      }

      if (gameOverResult.over) {
        stopTimers(gameData);
        updateGame(lobbyId, { result: gameOverResult, endedAt: new Date().toISOString() });
        io.to(lobbyId).emit("game:over", { ...gameOverResult, pgn: game.pgn(), finalFen: game.fen() });
        return;
      }

      // If bot game, trigger bot move (unless client handles it)
      if (gameData.isBotGame && !clientHandlesBot) {
        triggerBotMove(io, lobbyId, game, gameData);
      }
    });

    socket.on("game:bot_thinking", ({ lobbyId }) => {
      io.to(lobbyId).emit("game:bot_thinking", {});
    });

    // ── Resign ──
    socket.on("game:resign", ({ lobbyId }) => {
      const gameData = getGame(lobbyId);
      const game = chessInstances.get(lobbyId);
      if (!gameData || !game) return;
      const isWhite = socket.id === gameData.whitePlayerId;
      const winner = isWhite ? "b" : "w";
      stopTimers(gameData);
      const result = { over: true, winner, reason: "resignation" };
      updateGame(lobbyId, { result, endedAt: new Date().toISOString() });
      io.to(lobbyId).emit("game:over", { ...result, pgn: game.pgn(), finalFen: game.fen() });
    });

    // ── Draw Offer ──
    socket.on("game:draw_offer", ({ lobbyId }) => {
      io.to(lobbyId).emit("game:draw_offered", { byPlayerId: socket.id });
    });

    socket.on("game:draw_accept", ({ lobbyId }) => {
      const gameData = getGame(lobbyId);
      const game = chessInstances.get(lobbyId);
      if (!gameData || !game) return;
      stopTimers(gameData);
      const result = { over: true, winner: null, reason: "draw_agreement" };
      updateGame(lobbyId, { result, endedAt: new Date().toISOString() });
      io.to(lobbyId).emit("game:over", { ...result, pgn: game.pgn(), finalFen: game.fen() });
    });

    socket.on("game:draw_decline", ({ lobbyId }) => {
      io.to(lobbyId).emit("game:draw_declined", {});
    });

    // ── Rematch ──
    socket.on("game:rematch", ({ lobbyId }) => {
      io.to(lobbyId).emit("game:rematch_offered", { byPlayerId: socket.id });
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);
    });
  });

  // ── Helper: Start a bot game ──
  function startBotGame(io, socket, lobby) {
    const game = new Chess();
    chessInstances.set(lobby.id, game);

    let hostColor, botColor;
    if (lobby.colorAssignment === "white") { hostColor = "w"; botColor = "b"; }
    else if (lobby.colorAssignment === "black") { hostColor = "b"; botColor = "w"; }
    else { hostColor = Math.random() < 0.5 ? "w" : "b"; botColor = hostColor === "w" ? "b" : "w"; }

    const timerConfig = lobby.timerConfig;
    const gameData = createGame({
      lobbyId: lobby.id,
      whitePlayerId: hostColor === "w" ? socket.id : "bot",
      blackPlayerId: hostColor === "b" ? socket.id : "bot",
      timerConfig,
      isBotGame: true,
      botDifficulty: lobby.botDifficulty,
    });

    updateLobby(lobby.id, { status: "active" });

    socket.emit("game:start", {
      lobbyId: lobby.id,
      fen: game.fen(),
      whitePlayerId: gameData.whitePlayerId,
      blackPlayerId: gameData.blackPlayerId,
      timers: gameData.timers,
      timerConfig,
      isBotGame: true,
      botDifficulty: lobby.botDifficulty,
      playerColor: hostColor,
    });

    startTimers(gameData, io);

    // If bot plays white, make bot move first
    if (botColor === "w") {
      triggerBotMove(io, lobby.id, game, gameData);
    }
  }

  // ── Helper: Trigger bot move ──
  function triggerBotMove(io, lobbyId, game, gameData) {
    io.to(lobbyId).emit("game:bot_thinking", {});
    const delay = getThinkDelay(gameData.botDifficulty);

    setTimeout(async () => {
      try {
        const botMoveObj = await getBotMove(game, gameData.botDifficulty);
        if (!botMoveObj) throw new Error("Bot returned no move");

        // Apply the move to the actual game instance using {from, to, promotion}
        let move = game.move({ from: botMoveObj.from, to: botMoveObj.to, promotion: botMoveObj.promotion || "q" });
        
        if (!move) {
          throw new Error(`Move invalid: ${botMoveObj.from}-${botMoveObj.to}`);
        }

        const appliedMove = game.history({ verbose: true }).slice(-1)[0];
        gameData.fen = game.fen();
        gameData.pgn = game.pgn();
        if (appliedMove) gameData.moveHistory.push(appliedMove);

        const botTurn = game.turn() === "w" ? "b" : "w"; // the bot just moved
        onMoveComplete(gameData, botTurn);

        const isCheck = game.isCheck();
        const gameOverResult = checkGameOver(game);

        io.to(lobbyId).emit("game:bot_move", {
          move: appliedMove, fen: game.fen(), timers: gameData.timers,
          isCheck, isCheckmate: gameOverResult.over && gameOverResult.reason === "checkmate",
          isDraw: gameOverResult.over && !gameOverResult.winner,
        });

        if (isCheck && !gameOverResult.over) {
          io.to(lobbyId).emit("game:check", { checkedColor: game.turn(), fen: game.fen() });
        }

        if (gameOverResult.over) {
          stopTimers(gameData);
          updateGame(lobbyId, { result: gameOverResult, endedAt: new Date().toISOString() });
          io.to(lobbyId).emit("game:over", { ...gameOverResult, pgn: game.pgn(), finalFen: game.fen() });
        }
      } catch (err) {
        console.error("Bot move error or engine crash:", err);
        // Emergency fallback: If the engine crashes, pick a random legal move
        const legal = game.moves({ verbose: true });
        if (legal.length > 0) {
          const emergencyMove = legal[Math.floor(Math.random() * legal.length)];
          game.move(emergencyMove);
          
          gameData.fen = game.fen();
          gameData.pgn = game.pgn();
          gameData.moveHistory.push(emergencyMove);
          
          const botTurn = game.turn() === "w" ? "b" : "w";
          onMoveComplete(gameData, botTurn);
          
          const isCheck = game.isCheck();
          const gameOverResult = checkGameOver(game);

          io.to(lobbyId).emit("game:bot_move", { 
            move: emergencyMove, fen: game.fen(), timers: gameData.timers,
            isCheck, isCheckmate: gameOverResult.over && gameOverResult.reason === "checkmate",
            isDraw: gameOverResult.over && !gameOverResult.winner,
          });

          if (isCheck && !gameOverResult.over) {
            io.to(lobbyId).emit("game:check", { checkedColor: game.turn(), fen: game.fen() });
          }

          if (gameOverResult.over) {
            stopTimers(gameData);
            updateGame(lobbyId, { result: gameOverResult, endedAt: new Date().toISOString() });
            io.to(lobbyId).emit("game:over", { ...gameOverResult, pgn: game.pgn(), finalFen: game.fen() });
          }
        } else {
          // It was actually checkmate or stalemate
          const gameOverResult = checkGameOver(game);
          if (gameOverResult.over) {
            stopTimers(gameData);
            updateGame(lobbyId, { result: gameOverResult, endedAt: new Date().toISOString() });
            io.to(lobbyId).emit("game:over", { ...gameOverResult, pgn: game.pgn(), finalFen: game.fen() });
          }
        }
      }
    }, delay);
  }
};
