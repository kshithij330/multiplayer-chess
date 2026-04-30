// client/src/components/Lobby/CreateLobby.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BotDifficultySelector from "../Bot/BotDifficultySelector";
import { TIMER_PRESETS } from "../../constants/timerModes";

export default function CreateLobby({ emit, getSocketId }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mode, setMode] = useState("bot");
  const [botDifficulty, setBotDifficulty] = useState(3);
  const [timerMode, setTimerMode] = useState("blitz_5_3");
  const [colorAssignment, setColorAssignment] = useState("random");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    const lobbyData = {
      name: name || undefined,
      mode,
      botDifficulty: mode === "bot" ? botDifficulty : null,
      timerMode,
      timerConfig: TIMER_PRESETS[timerMode]
        ? {
            initialSeconds: TIMER_PRESETS[timerMode].initialSeconds,
            incrementSeconds: TIMER_PRESETS[timerMode].incrementSeconds,
          }
        : { initialSeconds: 300, incrementSeconds: 3 },
      colorAssignment,
      isPrivate,
    };
    emit("lobby:create", lobbyData);
    navigate("/game");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Game</h1>
            <p className="text-gray-400 mt-2">
              Set up your game preferences and start playing
            </p>
          </div>

          <div className="space-y-6 bg-white/5 rounded-2xl border border-white/10 p-6">
            {/* Lobby Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Chess Room"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "bot", label: "vs Bot", icon: "🤖", desc: "Play against AI" },
                  { value: "pvp", label: "vs Player", icon: "👥", desc: "Play online" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mode === opt.value
                        ? "bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <h4 className="text-white font-medium mt-2">{opt.label}</h4>
                    <p className="text-gray-400 text-xs mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Difficulty (only for bot mode) */}
            {mode === "bot" && (
              <BotDifficultySelector
                selected={botDifficulty}
                onSelect={setBotDifficulty}
              />
            )}

            {/* Timer Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Control
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setTimerMode(key)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      timerMode === key
                        ? "bg-amber-400/15 border border-amber-400/40 text-amber-400"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="block text-base mb-0.5">{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Play As
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "random", label: "Random", icon: "🎲" },
                  { value: "white", label: "White", icon: "♔" },
                  { value: "black", label: "Black", icon: "♚" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColorAssignment(opt.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      colorAssignment === opt.value
                        ? "bg-amber-400/10 border-amber-400/40 text-amber-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl block">{opt.icon}</span>
                    <span className="text-sm mt-1 block">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Private Toggle (PvP only) */}
            {mode === "pvp" && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Private Game</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Only players with the invite code can join
                  </p>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    isPrivate ? "bg-amber-400" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                      isPrivate ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCreate}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
          >
            {mode === "bot" ? "Start Game" : "Create Lobby"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
