// client/src/hooks/useSocket.js
import { useEffect, useCallback } from "react";
import socketManager from "../socketManager";
import useGameStore from "../store/gameStore";
import useLobbyStore from "../store/lobbyStore";

// Track if listeners have been attached globally
let listenersAttached = false;

export default function useSocket() {
  useEffect(() => {
    if (listenersAttached) return;
    listenersAttached = true;

    const socket = socketManager.getSocket();
    const store = useGameStore;
    const lobbyStore = useLobbyStore;

    socket.on("lobby:created", ({ lobby }) => {
      console.log("[Socket] lobby:created", lobby.id);
      lobbyStore.getState().setCurrentLobby(lobby);
    });

    socket.on("lobby:list_updated", ({ lobbies }) => {
      lobbyStore.getState().setLobbies(lobbies);
    });

    socket.on("game:start", (data) => {
      console.log("[Socket] game:start", data.lobbyId, "playerColor:", data.playerColor);
      const s = store.getState();
      s.setLobbyId(data.lobbyId);
      s.setFen(data.fen);
      s.setPlayers(data.whitePlayerId, data.blackPlayerId);
      s.setTimerConfig(data.timerConfig);
      if (data.timers) s.setTimers(data.timers);
      if (data.playerColor) {
        s.setPlayerColor(data.playerColor);
      } else {
        const myId = socket.id;
        if (data.whitePlayerId === myId) s.setPlayerColor("w");
        else s.setPlayerColor("b");
      }
      if (data.isBotGame) {
        s.setBotGame(true, data.botDifficulty);
      }
    });

    socket.on("game:move", (data) => {
      console.log("[Socket] game:move", data.move?.san);
      const s = store.getState();
      s.setFen(data.fen);
      if (data.move) s.addMove(data.move);
      if (data.timers) s.setTimers(data.timers);
      s.setCheck(data.isCheck || false);
    });

    socket.on("game:bot_thinking", () => {
      console.log("[Socket] game:bot_thinking");
      store.getState().setBotThinking(true);
    });

    socket.on("game:bot_move", (data) => {
      console.log("[Socket] game:bot_move", data.move?.san);
      const s = store.getState();
      s.setBotThinking(false);
      s.setFen(data.fen);
      if (data.move) s.addMove(data.move);
      if (data.timers) s.setTimers(data.timers);
      s.setCheck(data.isCheck || false);
    });

    socket.on("game:check", ({ checkedColor }) => {
      store.getState().setCheck(true);
    });

    socket.on("game:over", (data) => {
      console.log("[Socket] game:over", data.reason);
      const s = store.getState();
      s.setBotThinking(false);
      s.setGameOver(data);
    });

    socket.on("game:timer_update", ({ timers }) => {
      store.getState().setTimers(timers);
    });

    socket.on("game:draw_offered", ({ byPlayerId }) => {
      store.getState().setDrawOffer(true, byPlayerId);
    });

    socket.on("game:draw_declined", () => {
      store.getState().setDrawOffer(false, null);
    });

    socket.on("error", (err) => {
      console.error("[Socket] Server error:", err);
    });

    // Do NOT return cleanup — singleton
  }, []);

  const emit = useCallback((event, data) => {
    console.log("[Socket] Emitting:", event, data);
    socketManager.emit(event, data);
  }, []);

  const getSocketId = useCallback(() => {
    return socketManager.getId();
  }, []);

  return { emit, getSocketId };
}
