const { Chess } = require("chess.js");

const game = new Chess();
const moveObj = game.move("e4"); // White moves
console.log("Turn after first move:", game.turn());

try {
  // Try to apply the exact same move again (it's black's turn now)
  const move2 = game.move(moveObj);
  console.log("Move 2 successful:", move2);
} catch (e) {
  console.log("Move 2 failed:", e.message);
}
