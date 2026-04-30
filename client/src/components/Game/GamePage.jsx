// client/src/components/Game/GamePage.jsx
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChessBoard from "../Board/ChessBoard";
import MoveHistory from "../Board/MoveHistory";
import PlayerInfo from "./PlayerInfo";
import CheckNotification from "./CheckNotification";
import GameOverModal from "./GameOverModal";
import useGameStore from "../../store/gameStore";
import useTimer from "../../hooks/useTimer";
import { BOT_PROFILES } from "../../constants/botProfiles";

export default function GamePage({ emit }) {
  const navigate = useNavigate();
  const {
    lobbyId, fen, playerColor, boardOrientation, isGameOver, isBotGame,
    botDifficulty, botThinking, drawOffered, drawOfferedBy, flipBoard,
    resetGame, clearGameOver,
  } = useGameStore();

  const timer = useTimer();
  const currentTurn = fen.split(" ")[1];

  // Determine which player info is on top/bottom based on board orientation
  const isWhiteBottom = boardOrientation === "white";
  const topColor = isWhiteBottom ? "b" : "w";
  const bottomColor = isWhiteBottom ? "w" : "b";

  const isTopBot = isBotGame && topColor !== playerColor;
  const isBottomBot = isBotGame && bottomColor !== playerColor;

  const handleMove = useCallback(
    (from, to, promotion) => {
      emit("game:move", { lobbyId, from, to, promotion: promotion || null });
      return true;
    },
    [emit, lobbyId]
  );

  const handleResign = () => {
    if (window.confirm("Are you sure you want to resign?")) {
      emit("game:resign", { lobbyId });
    }
  };

  const handleDrawOffer = () => {
    emit("game:draw_offer", { lobbyId });
  };

  const handleDrawAccept = () => {
    emit("game:draw_accept", { lobbyId });
  };

  const handleDrawDecline = () => {
    emit("game:draw_decline", { lobbyId });
    useGameStore.getState().setDrawOffer(false, null);
  };

  const handleRematch = () => {
    clearGameOver();
    resetGame();
    navigate("/create");
  };

  const handleBackToLobby = () => {
    clearGameOver();
    resetGame();
    navigate("/lobbies");
  };

  // If no lobby, show redirect
  if (!lobbyId) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">♟️</span>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Game</h2>
          <p className="text-gray-400 mb-6">Create or join a game to start playing</p>
          <button
            onClick={() => navigate("/create")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold"
          >
            Create Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <CheckNotification />

      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-6 items-start">
        {/* Board Section */}
        <div className="flex-shrink-0">
          {/* Top Player */}
          <PlayerInfo
            color={topColor}
            isBot={isTopBot}
            botDifficulty={botDifficulty}
            timer={topColor === "w" ? timer.whiteTime : timer.blackTime}
            isActive={topColor === "w" ? timer.whiteActive : timer.blackActive}
            isLow={topColor === "w" ? timer.isWhiteLow : timer.isBlackLow}
            hasTimer={timer.hasTimer}
            isCurrentTurn={currentTurn === topColor}
          />

          {/* Chess Board */}
          <div className="my-3">
            <ChessBoard onMove={handleMove} />
          </div>

          {/* Bottom Player */}
          <PlayerInfo
            color={bottomColor}
            isBot={isBottomBot}
            botDifficulty={botDifficulty}
            timer={bottomColor === "w" ? timer.whiteTime : timer.blackTime}
            isActive={bottomColor === "w" ? timer.whiteActive : timer.blackActive}
            isLow={bottomColor === "w" ? timer.isWhiteLow : timer.isBlackLow}
            hasTimer={timer.hasTimer}
            isCurrentTurn={currentTurn === bottomColor}
          />
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Bot Thinking Indicator */}
          {botThinking && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {BOT_PROFILES[botDifficulty]?.avatar || "🤖"}
                </span>
                <div>
                  <p className="text-purple-300 text-sm font-medium">
                    {BOT_PROFILES[botDifficulty]?.name || "Bot"} is thinking
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ...
                    </motion.span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Draw Offer Banner */}
          {drawOffered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <p className="text-amber-300 text-sm font-medium mb-3">
                Draw has been offered
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDrawAccept}
                  className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={handleDrawDecline}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}

          {/* Move History */}
          <div className="bg-white/5 rounded-xl border border-white/10 h-[360px] flex flex-col overflow-hidden">
            <MoveHistory />
          </div>

          {/* Action Buttons */}
          {!isGameOver && (
            <div className="grid grid-cols-3 gap-2">
              {!isBotGame && (
                <button
                  onClick={handleDrawOffer}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                >
                  🤝 Draw
                </button>
              )}
              <button
                onClick={handleResign}
                className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
              >
                🏳️ Resign
              </button>
              <button
                onClick={flipBoard}
                className="py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                🔄 Flip
              </button>
            </div>
          )}
        </div>
      </div>

      <GameOverModal onRematch={handleRematch} onBackToLobby={handleBackToLobby} />
    </div>
  );
}
