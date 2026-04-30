// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/UI/Navbar";
import { ToastProvider } from "./components/UI/Toast";
import LobbyList from "./components/Lobby/LobbyList";
import CreateLobby from "./components/Lobby/CreateLobby";
import GamePage from "./components/Game/GamePage";
import * as socketManager from "./socketManager";

const { setupSocketListeners, emit, getSocketId } = socketManager;

function HomePage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-8xl mb-8 inline-block"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            ♛
          </motion.div>

          <h1 className="text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Chess Arena
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed">
            Play chess against AI opponents of varying difficulty or challenge friends in real-time multiplayer matches.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/create"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow inline-block"
              >
                ⚔️ Play Now
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/lobbies"
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/15 text-gray-300 font-bold text-lg hover:bg-white/10 hover:border-white/25 transition-all inline-block"
              >
                🏠 Browse Lobbies
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20"
        >
          {[
            { icon: "🤖", title: "AI Opponents", desc: "6 difficulty levels from beginner to Magnus Carlsen" },
            { icon: "⚡", title: "Real-Time", desc: "Play live with friends using WebSocket multiplayer" },
            { icon: "⏱️", title: "Time Controls", desc: "Bullet, Blitz, Rapid, Classical, or untimed" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <span className="text-3xl block mb-3">{feature.icon}</span>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  // Setup socket listeners once on mount — no hooks involved
  useEffect(() => {
    setupSocketListeners();
  }, []);

  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-gray-950 text-white">
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gray-950" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[128px]" />
          </div>

          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobbies" element={<LobbyList emit={emit} />} />
            <Route path="/create" element={<CreateLobby emit={emit} getSocketId={getSocketId} />} />
            <Route path="/game" element={<GamePage emit={emit} />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}
