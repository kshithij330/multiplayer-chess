// client/src/components/Game/PlayerInfo.jsx
import { motion } from "framer-motion";
import TimerDisplay from "./TimerDisplay";
import { BOT_PROFILES } from "../../constants/botProfiles";

export default function PlayerInfo({ color, isBot, botDifficulty, timer, isActive, isLow, hasTimer, isCurrentTurn }) {
  const botProfile = isBot && botDifficulty ? BOT_PROFILES[botDifficulty] : null;
  const displayName = botProfile ? botProfile.name : color === "w" ? "White" : "Black";
  const avatar = botProfile ? botProfile.avatar : color === "w" ? "♔" : "♚";
  const elo = botProfile ? `~${botProfile.elo} ELO` : null;

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
      isCurrentTurn ? "bg-white/5 border border-white/10" : ""
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl">
          {avatar}
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            {displayName}
            {isCurrentTurn && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block w-2 h-2 rounded-full bg-emerald-400"
              />
            )}
          </h3>
          {elo && <p className="text-xs text-gray-500">{elo}</p>}
        </div>
      </div>
      <TimerDisplay seconds={timer} isActive={isActive} isLow={isLow} hasTimer={hasTimer} />
    </div>
  );
}
