// client/src/hooks/useBotMove.js
import useGameStore from "../store/gameStore";

export default function useBotMove() {
  const { botThinking, isBotGame, botDifficulty } = useGameStore();

  return {
    botThinking,
    isBotGame,
    botDifficulty,
  };
}
