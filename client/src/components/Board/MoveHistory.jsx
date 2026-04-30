// client/src/components/Board/MoveHistory.jsx
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useGameStore from "../../store/gameStore";
import { getMoveHistoryPairs } from "../../utils/chessHelpers";

export default function MoveHistory() {
  const { moveHistory, reviewIndex, setReviewIndex } = useGameStore();
  const scrollRef = useRef(null);

  const pairs = getMoveHistoryPairs(moveHistory.map((m) => m.san || m));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  const handleMoveClick = (globalIndex) => {
    if (reviewIndex === globalIndex) {
      useGameStore.getState().clearReview();
    } else {
      const move = moveHistory[globalIndex];
      if (move && move.after) {
        useGameStore.getState().setReviewIndex(globalIndex, move.after);
      }
    }
  };

  const exportPGN = () => {
    const pgn = moveHistory
      .map((m, i) => {
        const moveNum = Math.floor(i / 2) + 1;
        const prefix = i % 2 === 0 ? `${moveNum}. ` : "";
        return prefix + (m.san || m);
      })
      .join(" ");

    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.pgn";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Move History
        </h3>
        {moveHistory.length > 0 && (
          <button
            onClick={exportPGN}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Export PGN
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin"
      >
        {pairs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4 italic">
            No moves yet
          </p>
        ) : (
          pairs.map((pair, i) => (
            <div
              key={i}
              className="grid grid-cols-[2rem_1fr_1fr] gap-1 text-sm"
            >
              <span className="text-gray-500 text-right pr-1">
                {pair.number}.
              </span>
              {pair.white && (
                <button
                  onClick={() => handleMoveClick(i * 2)}
                  className={`text-left px-2 py-0.5 rounded transition-all ${
                    reviewIndex === i * 2
                      ? "bg-amber-400/20 text-amber-400"
                      : i * 2 === moveHistory.length - 1
                      ? "bg-white/5 text-white font-medium"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {pair.white}
                </button>
              )}
              {pair.black && (
                <button
                  onClick={() => handleMoveClick(i * 2 + 1)}
                  className={`text-left px-2 py-0.5 rounded transition-all ${
                    reviewIndex === i * 2 + 1
                      ? "bg-amber-400/20 text-amber-400"
                      : i * 2 + 1 === moveHistory.length - 1
                      ? "bg-white/5 text-white font-medium"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {pair.black}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
