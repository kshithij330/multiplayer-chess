// client/src/components/Lobby/LobbyRoom.jsx
import { motion } from "framer-motion";
import useLobbyStore from "../../store/lobbyStore";

export default function LobbyRoom({ emit }) {
  const { currentLobby } = useLobbyStore();

  if (!currentLobby) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 rounded-2xl border border-white/10 p-8 text-center"
      >
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
        <p className="text-gray-400 mb-6">Share the lobby link or invite code to play</p>

        {currentLobby.inviteCode && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Invite Code</p>
            <p className="text-3xl font-mono font-bold text-amber-400 tracking-[0.3em]">
              {currentLobby.inviteCode}
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-400">
          <p>Game: <span className="text-white">{currentLobby.name}</span></p>
          <p>Mode: <span className="text-white">{currentLobby.mode === "pvp" ? "Player vs Player" : "vs Bot"}</span></p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <button
          onClick={() => emit("lobby:leave", { lobbyId: currentLobby.id })}
          className="mt-6 text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
