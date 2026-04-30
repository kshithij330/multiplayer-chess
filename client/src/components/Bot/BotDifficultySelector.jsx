// client/src/components/Bot/BotDifficultySelector.jsx
import { motion } from "framer-motion";
import { BOT_PROFILES } from "../../constants/botProfiles";

export default function BotDifficultySelector({ selected, onSelect }) {
  const levels = Object.entries(BOT_PROFILES);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Bot Difficulty
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {levels.map(([level, profile]) => {
          const lvl = parseInt(level);
          const isSelected = selected === lvl;
          const difficultyColor =
            lvl <= 2 ? "emerald" : lvl <= 4 ? "amber" : "red";

          return (
            <motion.button
              key={level}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(lvl)}
              className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? `bg-${difficultyColor}-500/15 border-${difficultyColor}-500/40 ring-1 ring-${difficultyColor}-500/30`
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor:
                        lvl <= 2
                          ? "rgba(16,185,129,0.15)"
                          : lvl <= 4
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(239,68,68,0.15)",
                      borderColor:
                        lvl <= 2
                          ? "rgba(16,185,129,0.4)"
                          : lvl <= 4
                          ? "rgba(245,158,11,0.4)"
                          : "rgba(239,68,68,0.4)",
                    }
                  : {}
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{profile.avatar}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ~{profile.elo} ELO
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic truncate">
                    "{profile.catchphrase}"
                  </p>
                </div>
              </div>

              {/* Difficulty bar */}
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < lvl
                        ? lvl <= 2
                          ? "bg-emerald-500"
                          : lvl <= 4
                          ? "bg-amber-500"
                          : "bg-red-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="bot-selected"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      lvl <= 2
                        ? "rgb(16,185,129)"
                        : lvl <= 4
                        ? "rgb(245,158,11)"
                        : "rgb(239,68,68)",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
