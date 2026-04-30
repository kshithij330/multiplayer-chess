// client/src/utils/chessHelpers.js
export function getLegalMovesUCI(game) {
  return game.moves({ verbose: true }).map((m) => {
    let uci = m.from + m.to;
    if (m.promotion) uci += m.promotion;
    return uci;
  });
}

export function getSquareColor(square) {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1]) - 1;   // 1=0, 8=7
  return (file + rank) % 2 === 0 ? "dark" : "light";
}

export function getPieceAtSquare(game, square) {
  const piece = game.get(square);
  if (!piece) return null;
  return piece;
}

export function getKingSquare(game, color) {
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === color) {
        const file = String.fromCharCode(97 + c);
        const rank = 8 - r;
        return `${file}${rank}`;
      }
    }
  }
  return null;
}

export function getMoveHistoryPairs(history) {
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i] || null,
      black: history[i + 1] || null,
    });
  }
  return pairs;
}
