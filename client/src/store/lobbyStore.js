// client/src/store/lobbyStore.js
import { create } from "zustand";

const useLobbyStore = create((set) => ({
  lobbies: [],
  currentLobby: null,
  filterMode: "all",
  filterTimer: "all",
  loading: false,
  error: null,

  setLobbies: (lobbies) => set({ lobbies }),
  setCurrentLobby: (lobby) => set({ currentLobby: lobby }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  setFilterTimer: (timer) => set({ filterTimer: timer }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearLobby: () => set({ currentLobby: null }),
}));

export default useLobbyStore;
