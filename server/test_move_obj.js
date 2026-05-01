const { Chess } = require("chess.js");
const game = new Chess();
const moveObj = game.move("e4");
game.undo();
console.log("Move object:", moveObj);

try {
  const move2 = game.move(moveObj);
  console.log("Move 2 successful:", move2);
} catch (e) {
  console.error("Move 2 failed:", e.message);
}
