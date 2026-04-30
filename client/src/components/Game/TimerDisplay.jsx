// client/src/components/Game/TimerDisplay.jsx
import { motion } from "framer-motion";
import { formatTime } from "../../constants/timerModes";

export default function TimerDisplay({ seconds, isActive, isLow, hasTimer }) {
  if (!hasTimer) {
    return (
      <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-lg font-mono">
        ∞
      </div>
    );
  }

  return (
    <motion.div
      animate={isActive ? { borderColor: ["rgba(245,158,11,0.3)", "rgba(245,158,11,0.6)", "rgba(245,158,11,0.3)"] } : {}}
      transition={isActive ? { duration: 2, repeat: Infinity } : {}}
      className={`px-4 py-2 rounded-lg font-mono text-xl font-bold border-2 transition-all ${
        isLow
          ? "bg-red-500/15 border-red-500/50 text-red-400"
          : isActive
          ? "bg-amber-400/10 border-amber-400/30 text-white"
          : "bg-white/5 border-white/10 text-gray-400"
      }`}
    >
      <motion.span
        animate={isLow ? { opacity: [1, 0.3, 1] } : {}}
        transition={isLow ? { duration: 0.5, repeat: Infinity } : {}}
      >
        {formatTime(seconds)}
      </motion.span>
    </motion.div>
  );
}
