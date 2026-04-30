// client/src/components/Lobby/LobbyList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useLobbyStore from "../../store/lobbyStore";
import { TIMER_PRESETS } from "../../constants/timerModes";

export default function LobbyList({ emit }) {
  const navigate = useNavigate();
  const { lobbies, filterMode, setFilterMode } = useLobbyStore();
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    emit("lobby:list", {});
    const interval = setInterval(() => emit("lobby:list", {}), 10000);
    return () => clearInterval(interval);
  }, [emit]);

  const filtered = lobbies.filter((l) => {
    if (filterMode === "all") return true;
    return l.mode === filterMode;
  });

  const handleJoin = (lobbyId) => {
    emit("lobby:join", { lobbyId });
    navigate("/game");
  };

  const handleJoinByCode = () => {
    if (inviteCode.trim()) {
      emit("lobby:join", { inviteCode: inviteCode.trim().toUpperCase() });
      navigate("/game");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Game Lobbies</h1>
              <p className="text-gray-400 mt-1">Join an open game or create your own</p>
            </div>
            <button
              onClick={() => navigate("/create")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            >
              + Create Game
            </button>
          </div>

          {/* Invite Code */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code..."
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all uppercase tracking-widest text-center font-mono"
            />
            <button
              onClick={handleJoinByCode}
              disabled={!inviteCode.trim()}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {["all", "pvp", "bot"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterMode(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterMode === f
                    ? "bg-amber-400/15 border border-amber-400/40 text-amber-400"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {f === "all" ? "All" : f === "pvp" ? "PvP" : "vs Bot"}
              </button>
            ))}
          </div>

          {/* Lobby List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-5xl block mb-4">♟️</span>
              <p className="text-gray-400 text-lg">No open lobbies</p>
              <p className="text-gray-500 text-sm mt-1">Create a game to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lobby, i) => {
                const timer = TIMER_PRESETS[lobby.timerMode];
                return (
                  <motion.div
                    key={lobby.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center text-xl">
                        {lobby.mode === "bot" ? "🤖" : "👥"}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{lobby.name}</h3>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {lobby.mode === "pvp" ? "PvP" : "vs Bot"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {timer ? timer.label : lobby.timerMode}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(lobby.id)}
                      className="px-5 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/20 transition-all opacity-70 group-hover:opacity-100"
                    >
                      Join
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
