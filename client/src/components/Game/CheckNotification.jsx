// client/src/components/Game/CheckNotification.jsx
import { motion, AnimatePresence } from "framer-motion";
import useGameStore from "../../store/gameStore";

export default function CheckNotification() {
  const { isCheck, isGameOver } = useGameStore();

  return (
    <AnimatePresence>
      {isCheck && !isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/40 backdrop-blur-xl shadow-2xl shadow-red-500/20"
          >
            <span className="text-red-400 font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">♚</span> CHECK!
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
