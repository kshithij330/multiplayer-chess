const { Game } = require("js-chess-engine");
const { Chess } = require("chess.js");

const fen = "rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3"; // Black is NOT in check here, wait.
// Let's create a FEN where black is in check.
// e4 e5 Qh5 Nc6 Bc4 Nf6 Qxf7# (checkmate)
// Let's do a simple check:
const checkFen = "rnbqkbnr/pppp1ppp/8/4p3/4P2Q/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2"; // Qh4+ on black

try {
  console.log("FEN:", checkFen);
  const engine = new Game(checkFen);
  const moveMap = engine.aiMove(1);
  console.log("Engine move:", moveMap);
} catch (e) {
  console.error("Error:", e);
}
