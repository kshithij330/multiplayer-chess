// client/src/store/gameStore.js
import { create } from "zustand";

const useGameStore = create((set) => ({
  lobbyId: null,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  playerColor: "w",
  moveHistory: [],
  isCheck: false,
  isGameOver: false,
  gameOverResult: null,
  isBotGame: false,
  botDifficulty: 3,
  botThinking: false,
  boardOrientation: "white",
  drawOffered: false,
  drawOfferedBy: null,

  // Timers
  timers: {
    white: { remaining: 300, active: false },
    black: { remaining: 300, active: false },
  },
  timerConfig: { initialSeconds: 300, incrementSeconds: 3 },

  whitePlayerId: null,
  blackPlayerId: null,
  reviewIndex: null,
  reviewFen: null,

  // Actions
  setLobbyId: (id) => set({ lobbyId: id }),
  setFen: (fen) => set({ fen }),
  setPlayerColor: (color) => set({ 
    playerColor: color, 
    boardOrientation: color === "w" ? "white" : "black" 
  }),
  addMove: (move) => set((s) => ({ moveHistory: [...s.moveHistory, move] })),
  setMoveHistory: (history) => set({ moveHistory: history }),
  setCheck: (isCheck) => set({ isCheck }),
  setGameOver: (result) => set({ 
    isGameOver: true, 
    gameOverResult: result,
    botThinking: false
  }),
  clearGameOver: () => set({ isGameOver: false, gameOverResult: null }),
  setBotGame: (isBotGame, difficulty) => set({ isBotGame, botDifficulty: difficulty }),
  setBotThinking: (thinking) => set({ botThinking: thinking }),
  setTimers: (timers) => set({ timers }),
  setTimerConfig: (config) => set({ timerConfig: config }),
  setPlayers: (white, black) => set({ whitePlayerId: white, blackPlayerId: black }),
  flipBoard: () => set((s) => ({ boardOrientation: s.boardOrientation === "white" ? "black" : "white" })),
  setDrawOffer: (offered, by) => set({ drawOffered: offered, drawOfferedBy: by }),
  setReviewIndex: (index, fen) => set({ reviewIndex: index, reviewFen: fen }),
  clearReview: () => set({ reviewIndex: null, reviewFen: null }),

  resetGame: () => set({
    lobbyId: null,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moveHistory: [],
    isCheck: false, isGameOver: false, gameOverResult: null,
    isBotGame: false, botDifficulty: 3, botThinking: false,
    drawOffered: false, drawOfferedBy: null,
    reviewIndex: null, reviewFen: null,
    hintMove: null,
    premove: null,
    timers: { white: { remaining: 300, active: false }, black: { remaining: 300, active: false } },
  }),
  hintMove: null,
  setHintMove: (move) => set({ hintMove: move }),
  premove: null,
  setPremove: (move) => set({ premove: move }),
  clearPremove: () => set({ premove: null }),
}));

export default useGameStore;
