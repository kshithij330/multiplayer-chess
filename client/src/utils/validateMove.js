// client/src/utils/validateMove.js
export function isValidSquare(square) {
  return /^[a-h][1-8]$/.test(square);
}

export function isValidPromotion(piece) {
  return ["q", "r", "b", "n"].includes(piece);
}

export function sanitizeMoveInput(input) {
  return {
    from: String(input.from || "").toLowerCase().slice(0, 2),
    to: String(input.to || "").toLowerCase().slice(0, 2),
    promotion: ["q", "r", "b", "n"].includes(String(input.promotion || "").toLowerCase())
      ? String(input.promotion).toLowerCase()
      : null,
  };
}
