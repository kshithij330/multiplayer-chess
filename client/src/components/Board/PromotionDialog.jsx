// client/src/components/Board/PromotionDialog.jsx
import { motion, AnimatePresence } from "framer-motion";

const PROMOTION_PIECES = [
  { piece: "q", label: "Queen", white: "♕", black: "♛" },
  { piece: "r", label: "Rook", white: "♖", black: "♜" },
  { piece: "b", label: "Bishop", white: "♗", black: "♝" },
  { piece: "n", label: "Knight", white: "♘", black: "♞" },
];

export default function PromotionDialog({ isOpen, color, onSelect }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-800 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white text-center mb-4">
              Promote your pawn to:
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {PROMOTION_PIECES.map(({ piece, label, white, black }) => (
                <button
                  key={piece}
                  onClick={() => onSelect(piece)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-400/20 hover:border-amber-400/40 transition-all duration-200 group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    {color === "w" ? white : black}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-amber-400">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
