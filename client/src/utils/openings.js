// client/src/utils/openings.js
export const OPENING_BOOK = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
    { move: "e2e4", weight: 40 }, { move: "d2d4", weight: 35 },
    { move: "c2c4", weight: 15 }, { move: "g1f3", weight: 10 },
  ],
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": [
    { move: "e7e5", weight: 35 }, { move: "c7c5", weight: 30 },
    { move: "e7e6", weight: 15 }, { move: "c7c6", weight: 10 },
    { move: "d7d6", weight: 5 }, { move: "g8f6", weight: 5 },
  ],
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1": [
    { move: "d7d5", weight: 35 }, { move: "g8f6", weight: 35 },
    { move: "e7e6", weight: 15 }, { move: "f7f5", weight: 5 },
  ],
};

export const OPENING_NAMES = {
  "e2e4": "King's Pawn Opening",
  "d2d4": "Queen's Pawn Opening",
  "c2c4": "English Opening",
  "g1f3": "Réti Opening",
  "e2e4 e7e5 g1f3 b8c6 f1b5": "Ruy Lopez",
  "e2e4 e7e5 g1f3 b8c6 f1c4": "Italian Game",
  "e2e4 c7c5": "Sicilian Defense",
  "e2e4 e7e6": "French Defense",
  "e2e4 c7c6": "Caro-Kann Defense",
  "d2d4 d7d5 c2c4": "Queen's Gambit",
  "d2d4 g8f6 c2c4 g7g6": "King's Indian Defense",
};
