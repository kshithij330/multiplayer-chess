const { Chess } = require("chess.js");
const game = new Chess();
try {
  game.move(undefined);
  console.log("Success");
} catch (e) {
  console.log("Failed:", e.message);
}
