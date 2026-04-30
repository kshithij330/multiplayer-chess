// client/src/socketManager.js
import { io } from "socket.io-client";
import useGameStore from "./store/gameStore";
import useLobbyStore from "./store/lobbyStore";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// Persistent socket instance on window to survive HMR
if (!window.__CHESS_SOCKET__) {
  window.__CHESS_SOCKET__ = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  window.__CHESS_SOCKET__.on("connect", () => {
    console.log("[Socket] Connected:", window.__CHESS_SOCKET__.id);
  });
}

const socket = window.__CHESS_SOCKET__;

export function setupSocketListeners() {
  // Always clear and re-attach to ensure we have the latest store references and logic
  console.log("[Socket] Refreshing listeners...");
  
  socket.off("lobby:created");
  socket.off("lobby:list_updated");
  socket.off("game:start");
  socket.off("game:move");
  socket.off("game:bot_thinking");
  socket.off("game:bot_move");
  socket.off("game:over");
  socket.off("game:timer_update");
  socket.off("game:draw_offered");
  socket.off("error");

  socket.on("lobby:created", ({ lobby }) => {
    console.log("[Socket] lobby:created", lobby.id);
    useLobbyStore.getState().setCurrentLobby(lobby);
  });

  socket.on("lobby:list_updated", ({ lobbies }) => {
    useLobbyStore.getState().setLobbies(lobbies);
  });

  socket.on("game:start", (data) => {
    console.log("[Socket] game:start received", data);
    const store = useGameStore.getState();
    store.resetGame(); // Clear old state
    
    store.setLobbyId(data.lobbyId);
    store.setFen(data.fen);
    store.setPlayers(data.whitePlayerId, data.blackPlayerId);
    store.setTimerConfig(data.timerConfig);
    if (data.timers) store.setTimers(data.timers);
    
    // Explicitly set color from data or socket ID
    if (data.playerColor) {
      console.log("[Socket] Setting player color to:", data.playerColor);
      store.setPlayerColor(data.playerColor);
    } else {
      const myId = socket.id;
      const assigned = data.whitePlayerId === myId ? "w" : "b";
      console.log("[Socket] Derived player color:", assigned, "MyID:", myId);
      store.setPlayerColor(assigned);
    }
    
    if (data.isBotGame) {
      store.setBotGame(true, data.botDifficulty);
    }
  });

  socket.on("game:move", (data) => {
    console.log("[Socket] game:move", data.move?.san);
    const store = useGameStore.getState();
    store.setFen(data.fen);
    if (data.move) store.addMove(data.move);
    if (data.timers) store.setTimers(data.timers);
    store.setCheck(data.isCheck || false);
  });

  socket.on("game:bot_thinking", () => {
    console.log("[Socket] game:bot_thinking");
    useGameStore.getState().setBotThinking(true);
  });

  socket.on("game:bot_move", (data) => {
    console.log("[Socket] game:bot_move", data.move?.san || "unknown");
    const store = useGameStore.getState();
    store.setBotThinking(false);
    store.setFen(data.fen);
    if (data.move) store.addMove(data.move);
    if (data.timers) store.setTimers(data.timers);
    store.setCheck(data.isCheck || false);
  });

  socket.on("game:over", (data) => {
    console.log("[Socket] game:over", data.reason);
    const store = useGameStore.getState();
    store.setGameOver(data);
  });

  socket.on("game:timer_update", ({ timers }) => {
    useGameStore.getState().setTimers(timers);
  });

  socket.on("game:draw_offered", ({ byPlayerId }) => {
    useGameStore.getState().setDrawOffer(true, byPlayerId);
  });

  socket.on("error", (err) => {
    console.error("[Socket] Server error:", err);
  });
}

export function emit(event, data) {
  console.log("[Socket] Emit:", event, data);
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    socket.once("connect", () => {
      socket.emit(event, data);
    });
  }
}

export function getSocketId() {
  return socket?.id || null;
}
