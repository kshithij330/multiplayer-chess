const { Chess } = require("chess.js");
const { getBotMove } = require("./services/botService");

async function run() {
  const game = new Chess("rnbqkbnr/pppp1ppp/8/1B2p3/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"); // Black under check by Bb5+
  console.log("FEN:", game.fen());
  console.log("Is check?", game.isCheck());
  
  const move = await getBotMove(game, 3);
  console.log("Bot move:", move);
}

run();
