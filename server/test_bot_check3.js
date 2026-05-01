const { Chess } = require("chess.js");
const { getBotMove } = require("./services/botService");

async function run() {
  const game = new Chess();
  game.move("e4");
  game.move("f6");
  game.move("d4");
  game.move("g5");
  game.move("Qh5+");
  
  console.log("FEN:", game.fen());
  console.log("Is checkmate?", game.isCheckmate());
  console.log("Is check?", game.isCheck());
  
  // This is checkmate. Let's make a non-checkmate check.
  const game2 = new Chess();
  game2.move("e4");
  game2.move("d5");
  game2.move("exd5");
  game2.move("Qxd5");
  game2.move("Nc3");
  game2.move("Qe5+");
  
  console.log("FEN 2:", game2.fen());
  console.log("Is check?", game2.isCheck());
  
  try {
    const move = await getBotMove(game2, 3);
    console.log("Bot move:", move);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
