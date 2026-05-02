// client/src/components/Board/ChessBoard.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import useGameStore from "../../store/gameStore";
import PromotionDialog from "./PromotionDialog";
import { PIECE_URLS } from "../../constants/chessPieces";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function ChessBoard({ onMove }) {
  const fen = useGameStore(s => s.fen);
  const playerColor = useGameStore(s => s.playerColor);
  const boardOrientation = useGameStore(s => s.boardOrientation);
  const isGameOver = useGameStore(s => s.isGameOver);
  const botThinking = useGameStore(s => s.botThinking);
  const reviewFen = useGameStore(s => s.reviewFen);
  const reviewIndex = useGameStore(s => s.reviewIndex);
  const isCheck = useGameStore(s => s.isCheck);
  const moveHistory = useGameStore(s => s.moveHistory);
  const hintMove = useGameStore(s => s.hintMove);
  const premove = useGameStore(s => s.premove);
  const setPremove = useGameStore(s => s.setPremove);
  const clearPremove = useGameStore(s => s.clearPremove);

  const [moveFrom, setMoveFrom] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [draggedSquare, setDraggedSquare] = useState(null);
  
  // Local chess instance strictly for reading the board and validation
  const game = useMemo(() => new Chess(), []);
  
  const displayFen = reviewFen || fen;
  const currentTurn = displayFen.split(" ")[1] || "w";
  const isMyTurn = currentTurn === playerColor && reviewIndex === null && !isGameOver;

  // Sync internal game state
  useEffect(() => {
    try {
      game.load(displayFen);
    } catch (e) {
      console.error("Board: Invalid FEN", displayFen);
    }
  }, [displayFen, game]);

  // Determine last move for highlighting
  const lastMove = useMemo(() => {
    if (moveHistory.length > 0 && reviewIndex === null) {
      return moveHistory[moveHistory.length - 1];
    }
    return null;
  }, [moveHistory, reviewIndex]);

  // Get current board 8x8 matrix
  const board = game.board();

  // Helper to get square notation (e.g. "e4") from grid coordinates
  const getSquareNotation = (r, c) => {
    const file = FILES[c];
    const rank = RANKS[r];
    return file + rank;
  };

  const handleSquareClick = useCallback((square) => {
    if (isGameOver || reviewIndex !== null) return;

    // --- If it's NOT my turn, handle Premove ---
    if (!isMyTurn) {
      if (moveFrom && moveFrom !== square) {
        // Attempt to set a premove
        const piece = game.get(moveFrom);
        if (piece && piece.color === playerColor) {
          setPremove({ from: moveFrom, to: square, promotion: 'q' });
        }
        setMoveFrom(null);
        setLegalMoves([]);
        return;
      }

      // Select piece for premove
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setMoveFrom(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      } else {
        setMoveFrom(null);
        setLegalMoves([]);
        clearPremove();
      }
      return;
    }

    // --- If it IS my turn, handle standard move ---
    if (botThinking) return;

    // Execute Move
    if (moveFrom && legalMoves.includes(square)) {
      const piece = game.get(moveFrom);
      // Promotion check
      if (piece?.type === "p" && ((piece.color === "w" && square[1] === "8") || (piece.color === "b" && square[1] === "1"))) {
        setPendingPromotion({ from: moveFrom, to: square });
        return;
      }
      onMove(moveFrom, square);
      setMoveFrom(null);
      setLegalMoves([]);
      return;
    }

    // Select Piece
    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
      setMoveFrom(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
    } else {
      setMoveFrom(null);
      setLegalMoves([]);
    }
  }, [game, isMyTurn, botThinking, moveFrom, legalMoves, playerColor, onMove]);

  // Drag and drop handlers
  const handleDragStart = (e, square, piece) => {
    if (isGameOver || reviewIndex !== null || piece.color !== playerColor) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(square);
    setMoveFrom(square);
    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
    e.dataTransfer.setData("text/plain", square);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, square) => {
    e.preventDefault();
    if (!isMyTurn) {
      e.dataTransfer.dropEffect = "move";
      return;
    }
    if (legalMoves.includes(square)) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDrop = (e, targetSquare) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData("text/plain");
    setDraggedSquare(null);

    if (isGameOver || reviewIndex !== null) return;
    if (sourceSquare === targetSquare) return;

    if (!isMyTurn) {
      // Set Premove via drag
      const piece = game.get(sourceSquare);
      if (piece && piece.color === playerColor) {
        setPremove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      }
      setMoveFrom(null);
      setLegalMoves([]);
      return;
    }

    if (botThinking) return;
    if (!legalMoves.includes(targetSquare)) {
      // If dropped on an illegal square, just clear selection
      setMoveFrom(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(sourceSquare);
    if (piece?.type === "p" && ((piece.color === "w" && targetSquare[1] === "8") || (piece.color === "b" && targetSquare[1] === "1"))) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return;
    }

    onMove(sourceSquare, targetSquare);
    setMoveFrom(null);
    setLegalMoves([]);
  };

  const renderSquare = (r, c) => {
    const squareNotation = getSquareNotation(r, c);
    const piece = board[r][c];
    
    // Board logic: Row 0 is Rank 8. Col 0 is File 'a'.
    const isLight = (r + c) % 2 === 0;
    const baseColor = isLight ? "bg-[#ebecd0]" : "bg-[#779556]";

    // Highlights
    const isLastMove = lastMove && (lastMove.from === squareNotation || lastMove.to === squareNotation);
    const isSelected = moveFrom === squareNotation;
    const isLegalMove = legalMoves.includes(squareNotation);
    const isHintMove = hintMove && (hintMove.from === squareNotation || hintMove.to === squareNotation);
    const isPremove = premove && (premove.from === squareNotation || premove.to === squareNotation);
    const isKingInCheck = isCheck && piece?.type === 'k' && piece?.color === currentTurn && reviewIndex === null;

    let highlightClass = "";
    if (isKingInCheck) highlightClass = "bg-red-500/60 shadow-[inset_0_0_15px_rgba(255,0,0,0.8)] rounded-full m-1";
    else if (isPremove) highlightClass = "bg-red-500/40 shadow-[inset_0_0_10px_rgba(239,68,68,0.5)]";
    else if (isSelected) highlightClass = "bg-yellow-400/50";
    else if (isHintMove) highlightClass = "bg-blue-400/50 shadow-[inset_0_0_10px_rgba(59,130,246,0.5)]";
    else if (isLastMove) highlightClass = "bg-yellow-400/30";

    return (
      <div
        key={squareNotation}
        className={`relative w-full h-full ${baseColor} flex items-center justify-center`}
        onClick={() => handleSquareClick(squareNotation)}
        onContextMenu={(e) => {
          e.preventDefault();
          clearPremove();
          setMoveFrom(null);
          setLegalMoves([]);
        }}
        onDragOver={(e) => handleDragOver(e, squareNotation)}
        onDrop={(e) => handleDrop(e, squareNotation)}
      >
        {highlightClass && (
          <div className={`absolute inset-0 pointer-events-none ${highlightClass}`} />
        )}
        
        {/* Legal move indicator */}
        {isLegalMove && !piece && (
          <div className="w-1/3 h-1/3 rounded-full bg-black/15 pointer-events-none z-10" />
        )}
        {isLegalMove && piece && (
          <div className="absolute inset-0 rounded-full border-4 border-black/15 pointer-events-none z-10 scale-[0.85]" />
        )}

        {/* Piece */}
        {piece && (
          <div
            draggable={isMyTurn && !botThinking && piece.color === playerColor}
            onDragStart={(e) => handleDragStart(e, squareNotation, piece)}
            onDragEnd={() => setDraggedSquare(null)}
            className={`w-[90%] h-[90%] z-20 ${draggedSquare === squareNotation ? 'opacity-50' : 'opacity-100'} ${isMyTurn && piece.color === playerColor && !botThinking ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          >
            <img 
              src={PIECE_URLS[piece.color][piece.type]} 
              alt={`${piece.color}${piece.type}`} 
              className="w-full h-full object-contain drop-shadow-sm pointer-events-none"
            />
          </div>
        )}

        {/* Coordinate Labels */}
        {(boardOrientation === "white" ? c === 0 : c === 7) && (
          <span className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-semibold select-none pointer-events-none ${isLight ? 'text-[#779556]' : 'text-[#ebecd0]'}`}>
            {RANKS[r]}
          </span>
        )}
        {(boardOrientation === "white" ? r === 7 : r === 0) && (
          <span className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-semibold select-none pointer-events-none ${isLight ? 'text-[#779556]' : 'text-[#ebecd0]'}`}>
            {FILES[c]}
          </span>
        )}
      </div>
    );
  };

  // Generate grid array based on orientation
  const renderGrid = () => {
    const squares = [];
    const rows = boardOrientation === "white" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const cols = boardOrientation === "white" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

    for (const r of rows) {
      for (const c of cols) {
        squares.push(renderSquare(r, c));
      }
    }
    return squares;
  };

  return (
    <div className="w-full max-w-[720px] mx-auto select-none touch-none">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl border-4 border-[#262421]">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 bg-gray-800">
          {renderGrid()}
        </div>
      </div>
      
      {pendingPromotion && (
        <PromotionDialog
          color={playerColor}
          onSelect={(piece) => {
            onMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }}
          onClose={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}
