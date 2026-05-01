// server/services/botService.js
const { Chess } = require("chess.js");
const { Game } = require("js-chess-engine");

const BOT_PROFILES = {
  1: { name: "Some Bad Chess Player", elo: 250, engineLevel: 0, model: "llama-3.1-8b-instant" },
  2: { name: "The Beginner", elo: 500, engineLevel: 0, model: "llama-3.1-8b-instant" },
  3: { name: "Club Casual", elo: 1000, engineLevel: 1, model: "llama-3.1-8b-instant" },
  4: { name: "The Intermediate", elo: 1500, engineLevel: 2, model: "mixtral-8x7b-32768" },
  5: { name: "Expert Bot", elo: 2000, engineLevel: 3, model: "mixtral-8x7b-32768" },
  6: { name: "Magnus Carlsen", elo: 2500, engineLevel: 4, model: "llama-3.1-70b-versatile" },
};

const BOT_THINK_DELAY_MS = {
  1: { min: 300, max: 800 },
  2: { min: 500, max: 1500 },
  3: { min: 800, max: 2500 },
  4: { min: 1000, max: 3500 },
  5: { min: 1500, max: 5000 },
  6: { min: 2000, max: 8000 },
};

function getThinkDelay(level) {
  const { min, max } = BOT_THINK_DELAY_MS[level] || BOT_THINK_DELAY_MS[3];
  return Math.floor(Math.random() * (max - min)) + min;
}

// Opening book
const OPENING_BOOK = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
    { move: "e2e4", weight: 40 }, { move: "d2d4", weight: 35 },
    { move: "c2c4", weight: 15 }, { move: "g1f3", weight: 10 },
  ],
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": [
    { move: "e7e5", weight: 35 }, { move: "c7c5", weight: 30 },
    { move: "e7e6", weight: 15 }, { move: "c7c6", weight: 10 },
    { move: "d7d6", weight: 5 }, { move: "g8f6", weight: 5 },
  ],
};

const useBookProbability = { 1: 0.0, 2: 0.1, 3: 0.4, 4: 0.7, 5: 0.9, 6: 0.98 };

function getOpeningBookMove(fen, difficulty) {
  const moves = OPENING_BOOK[fen];
  if (!moves || moves.length === 0) return null;
  if (Math.random() > (useBookProbability[difficulty] || 0)) return null;
  const totalWeight = moves.reduce((sum, m) => sum + m.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const move of moves) {
    rand -= move.weight;
    if (rand <= 0) return move.move;
  }
  return moves[0].move;
}

async function getBotMove(game, difficulty) {
  const fen = game.fen();
  
  // 1. Check opening book
  const bookMove = getOpeningBookMove(fen, difficulty);
  if (bookMove) {
    const from = bookMove.slice(0, 2);
    const to = bookMove.slice(2, 4);
    const promotion = bookMove.length > 4 ? bookMove[4] : 'q';
    return { from, to, promotion };
  }

  // 2. Use local engine (js-chess-engine)
  try {
    const profile = BOT_PROFILES[difficulty] || BOT_PROFILES[3];
    const engine = new Game(fen);
    const moveMap = engine.aiMove(profile.engineLevel);
    
    if (moveMap && Object.keys(moveMap).length > 0) {
      const from = Object.keys(moveMap)[0].toLowerCase();
      const to = moveMap[Object.keys(moveMap)[0]].toLowerCase();
      return { from, to, promotion: 'q' };
    }
  } catch (err) {
    console.error("[Bot] Engine failed:", err);
  }

  // Fallback to random
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;
  const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion || 'q' };
}

module.exports = { getBotMove, getThinkDelay, BOT_PROFILES };
