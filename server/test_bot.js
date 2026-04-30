const { Chess } = require('chess.js');
const { getBotMove } = require('./services/botService');

async function testBot() {
  const game = new Chess();
  console.log('Initial FEN:', game.fen());
  
  const move = await getBotMove(game, 3); // Level 3
  console.log('Bot move:', move.san);
  
  game.move(move);
  console.log('New FEN:', game.fen());
}

testBot().catch(console.error);
