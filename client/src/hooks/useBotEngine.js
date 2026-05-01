// client/src/hooks/useBotEngine.js
import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { stockfish } from '../services/stockfishService';

/**
 * useBotEngine Hook
 * Automatically triggers Stockfish.js when it's the bot's turn.
 */
export default function useBotEngine(emit) {
  const {
    lobbyId, fen, isBotGame, botDifficulty, 
    playerColor, isGameOver, botThinking
  } = useGameStore();

  const lastProcessedFen = useRef(null);

  useEffect(() => {
    if (!isBotGame || isGameOver || !lobbyId) return;

    const currentTurn = fen.split(' ')[1];
    const isBotTurn = currentTurn !== playerColor;

    // Only trigger if it's the bot's turn, we haven't processed this FEN yet, and it's not already thinking
    if (isBotTurn && fen !== lastProcessedFen.current) {
      console.log('[BotEngine] Bot turn detected. Starting Stockfish...');
      lastProcessedFen.current = fen;
      
      // Tell server bot is thinking
      emit('game:bot_thinking', { lobbyId });
      
      // Calculate move
      stockfish.findMove(fen, botDifficulty, (move) => {
        console.log('[BotEngine] Stockfish found move:', move);
        
        // Send move to server
        // Note: we pass clientHandlesBot: true so the server doesn't try to calculate its own move
        emit('game:move', {
          lobbyId,
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          clientHandlesBot: true
        });
      });
    }
  }, [fen, isBotGame, playerColor, isGameOver, lobbyId, botDifficulty, emit]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stockfish.terminate();
    };
  }, []);
}
