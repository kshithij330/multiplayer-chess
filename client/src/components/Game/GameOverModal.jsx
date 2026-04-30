// client/src/components/Game/GameOverModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import useGameStore from "../../store/gameStore";

const RESULT_MESSAGES = {
  checkmate: (w) => `Checkmate! ${w === "w" ? "White" : "Black"} wins!`,
  timeout: (w) => `Time out! ${w === "w" ? "White" : "Black"} wins!`,
  stalemate: () => "Stalemate! The game is a draw.",
  insufficient_material: () => "Draw by insufficient material.",
  threefold_repetition: () => "Draw by threefold repetition.",
  fifty_move_rule: () => "Draw by the fifty-move rule.",
  resignation: (w) => `${w === "w" ? "Black" : "White"} resigned. ${w === "w" ? "White" : "Black"} wins!`,
  draw_agreement: () => "Both players agreed to a draw.",
  abandonment: (w) => `Player abandoned. ${w === "w" ? "White" : "Black"} wins!`,
};

export default function GameOverModal({ onRematch, onBackToLobby }) {
  const { isGameOver, gameOverResult, playerColor } = useGameStore();

  if (!isGameOver || !gameOverResult) return null;

  const reason = gameOverResult.reason || "checkmate";
  const winner = gameOverResult.winner;
  const getMessage = RESULT_MESSAGES[reason] || (() => "Game over.");
  const message = getMessage(winner);

  const isWin = winner === playerColor;
  const isDraw = !winner;
  const resultEmoji = isDraw ? "🤝" : isWin ? "🏆" : "😔";
  const resultLabel = isDraw ? "Draw" : isWin ? "You Win!" : "You Lose";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gray-800 border border-white/10 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {resultEmoji}
          </motion.div>

          <h2 className={`text-3xl font-bold mb-2 ${
            isDraw ? "text-gray-300" : isWin ? "text-amber-400" : "text-gray-400"
          }`}>
            {resultLabel}
          </h2>

          <p className="text-gray-400 text-sm mb-6">{message}</p>

          <div className="space-y-3">
            <button
              onClick={onRematch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            >
              Rematch
            </button>
            <button
              onClick={onBackToLobby}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all"
            >
              Back to Lobby
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
