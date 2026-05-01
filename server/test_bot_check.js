const { Chess } = require("chess.js");
const { getBotMove } = require("./services/botService");

async function run() {
  const game = new Chess("rnbqkbnr/pppp1ppp/8/4p3/4P2Q/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2"); // Black under check by Qh4+
  console.log("FEN:", game.fen());
  console.log("Is check?", game.isCheck());
  
  const move = await getBotMove(game, 3);
  console.log("Bot move:", move);
}

run();
