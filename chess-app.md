# ♟️ Chess Application — Full Engineering Specification

> **Purpose:** This document is a complete, self-contained specification for building a full-featured chess web application with multiplayer lobbies, a multi-difficulty AI bot, timers, and standard chess rules. Any AI coding assistant or development team can use this file as a single source of truth to implement the application from scratch.

---

## Table of Contents

1. [Technology Stack & Libraries](#1-technology-stack--libraries)
2. [Project Structure](#2-project-structure)
3. [Chess Piece Assets](#3-chess-piece-assets)
4. [Standard Chess Rules](#4-standard-chess-rules)
5. [Move Notation & Move History](#5-move-notation--move-history)
6. [Lobby System](#6-lobby-system)
7. [Bot System & Difficulty Levels](#7-bot-system--difficulty-levels)
8. [AI Move API Protocol](#8-ai-move-api-protocol)
9. [Illegal Move Detection & Correction](#9-illegal-move-detection--correction)
10. [Timer Modes](#10-timer-modes)
11. [Check, Checkmate & Game End Logic](#11-check-checkmate--game-end-logic)
12. [Opening Library](#12-opening-library)
13. [UI/UX Requirements](#13-uiux-requirements)
14. [Backend API Endpoints](#14-backend-api-endpoints)
15. [WebSocket Events](#15-websocket-events)
16. [Database Schema](#16-database-schema)
17. [Bot Personality & Naming](#17-bot-personality--naming)
18. [Security & Validation](#18-security--validation)
19. [Implementation Checklist](#19-implementation-checklist)

---

## 1. Technology Stack & Libraries

### Frontend

| Library | Version | Purpose |
|---|---|---|
| `chess.js` | ^1.1.0 | Chess rules engine — move generation, validation, FEN parsing |
| `chessboard.js` OR `react-chessboard` | latest | Rendering the chessboard and pieces |
| `socket.io-client` | ^4.x | Real-time multiplayer communication |
| `react` | ^18.x | UI framework (or Vue/Svelte if preferred) |
| `react-dom` | ^18.x | DOM rendering |
| `axios` | ^1.x | HTTP requests to backend & AI API |
| `tailwindcss` | ^3.x | Styling |
| `framer-motion` | ^11.x | Animations (piece moves, check flash) |
| `react-timer-hook` | ^3.x | Countdown timers |
| `zustand` | ^4.x | Global state management |

**Installation (npm):**
```bash
npm install chess.js react-chessboard socket.io-client axios tailwindcss framer-motion react-timer-hook zustand
```

### Backend

| Library | Version | Purpose |
|---|---|---|
| `express` | ^4.x | HTTP server & REST API |
| `socket.io` | ^4.x | WebSocket server for real-time multiplayer |
| `uuid` | ^9.x | Generating unique lobby IDs |
| `cors` | ^2.x | CORS middleware |
| `dotenv` | ^16.x | Environment variable management |
| `node-fetch` | ^3.x | Calling AI API for bot moves |
| `redis` | ^4.x | Session & lobby state storage (optional, can use in-memory Map) |

**Installation (npm):**
```bash
npm install express socket.io uuid cors dotenv node-fetch redis
```

### Rendering the Chessboard — Quick Start

#### Option A: `react-chessboard` (recommended for React)
```jsx
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState } from "react";

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to queen by default; show dialog for choice
    });
    if (move === null) return false; // Illegal move
    setGame(gameCopy);
    return true;
  }

  return (
    
  );
}
```

#### Option B: `chessboard.js` (vanilla JS / jQuery)
```html




```

```javascript
const board = Chessboard('myBoard', {
  position: 'start',
  draggable: true,
  onDrop: handleDrop,
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
});
```

---

## 2. Project Structure

```
chess-app/
├── client/                        # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board/
│   │   │   │   ├── ChessBoard.jsx         # Main board component
│   │   │   │   ├── PromotionDialog.jsx    # Pawn promotion UI
│   │   │   │   └── MoveHistory.jsx        # Algebraic notation list
│   │   │   ├── Lobby/
│   │   │   │   ├── LobbyList.jsx          # Browse open lobbies
│   │   │   │   ├── CreateLobby.jsx        # Lobby creation form
│   │   │   │   └── LobbyRoom.jsx          # In-lobby waiting room
│   │   │   ├── Game/
│   │   │   │   ├── GamePage.jsx           # Full game view
│   │   │   │   ├── PlayerInfo.jsx         # Name, avatar, timer
│   │   │   │   ├── TimerDisplay.jsx       # Countdown timer
│   │   │   │   ├── GameOverModal.jsx      # Checkmate / draw dialog
│   │   │   │   └── CheckNotification.jsx  # "Check!" toast/banner
│   │   │   ├── Bot/
│   │   │   │   └── BotDifficultySelector.jsx
│   │   │   └── UI/
│   │   │       ├── Navbar.jsx
│   │   │       └── Toast.jsx
│   │   ├── hooks/
│   │   │   ├── useChessGame.js            # Core game logic hook
│   │   │   ├── useSocket.js               # Socket.io hook
│   │   │   ├── useTimer.js                # Timer management hook
│   │   │   └── useBotMove.js              # AI bot interaction hook
│   │   ├── store/
│   │   │   ├── gameStore.js               # Zustand game state
│   │   │   └── lobbyStore.js              # Zustand lobby state
│   │   ├── utils/
│   │   │   ├── chessHelpers.js            # FEN parsing, move helpers
│   │   │   ├── openings.js                # Opening book
│   │   │   └── validateMove.js            # Move legality checks
│   │   ├── constants/
│   │   │   ├── botProfiles.js             # Bot names, ELO, personalities
│   │   │   └── timerModes.js              # Timer presets
│   │   └── App.jsx
├── server/                        # Node.js backend
│   ├── routes/
│   │   ├── lobby.js               # Lobby CRUD endpoints
│   │   └── game.js                # Game state endpoints
│   ├── sockets/
│   │   └── gameSocket.js          # Socket.io event handlers
│   ├── services/
│   │   ├── chessEngine.js         # chess.js wrapper & validation
│   │   ├── botService.js          # AI API calls for bot moves
│   │   └── timerService.js        # Server-side timer management
│   ├── models/
│   │   ├── Lobby.js
│   │   └── Game.js
│   ├── middleware/
│   │   └── validateMove.js
│   └── index.js
├── .env
└── package.json
```

---

## 3. Chess Piece Assets

### Wikimedia Commons — Standard Wikipedia Chess Piece Set

All images are SVG, freely licensed (public domain / CC0). Use these URLs directly or download and host locally.

#### White Pieces

| Piece | Symbol | Wikimedia URL |
|---|---|---|
| King | ♔ | `https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg` |
| Queen | ♕ | `https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg` |
| Rook | ♖ | `https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg` |
| Bishop | ♗ | `https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg` |
| Knight | ♘ | `https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg` |
| Pawn | ♙ | `https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg` |

#### Black Pieces

| Piece | Symbol | Wikimedia URL |
|---|---|---|
| King | ♚ | `https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg` |
| Queen | ♛ | `https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg` |
| Rook | ♜ | `https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg` |
| Bishop | ♝ | `https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg` |
| Knight | ♞ | `https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg` |
| Pawn | ♟ | `https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg` |

### Piece Theme URL Template (for chessboard.js)

```javascript
// chessboard.js pieceTheme — uses {piece} placeholder
// Piece codes: wK, wQ, wR, wB, wN, wP, bK, bQ, bR, bB, bN, bP
const PIECE_THEME_URL = "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png";

// Or build a custom map using Wikimedia SVGs:
const PIECE_SVG_MAP = {
  wK: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  wQ: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  wR: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  wB: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  wN: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  wP: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
  bK: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  bQ: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  bR: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  bB: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  bN: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
  bP: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
};
```

### Alternative Piece Sets (Free)

- **Lichess pieces (CC BY-NC-SA):** `https://lichess1.org/assets/piece/cburnett/{piece}.svg`
- **Chess.com free pieces:** Download from their open-source repo
- **Alpha set (Wikipedia):** `https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces/Standard_transparent`

---

## 4. Standard Chess Rules

The engine must enforce **all** of the following rules using `chess.js` as the validation backbone:

### 4.1 Piece Movement

| Piece | Movement Rules |
|---|---|
| **King** | One square in any direction. Cannot move into check. |
| **Queen** | Any number of squares diagonally, horizontally, or vertically. |
| **Rook** | Any number of squares horizontally or vertically. |
| **Bishop** | Any number of squares diagonally. |
| **Knight** | L-shape: 2 squares in one direction + 1 perpendicular. Can jump over pieces. |
| **Pawn** | Forward 1 square (or 2 from starting rank). Captures diagonally 1 square forward. |

### 4.2 Special Moves

#### Castling
- King has not previously moved.
- Chosen rook has not previously moved.
- No pieces between king and rook.
- King is not currently in check.
- King does not pass through or land on a square under attack.
- **Kingside:** King moves e1→g1 (white) or e8→g8 (black).
- **Queenside:** King moves e1→c1 (white) or e8→c8 (black).

#### En Passant
- Only legal immediately after an opponent's pawn advances two squares from its starting position.
- The capturing pawn must be on the 5th rank (white) or 4th rank (black).
- The captured pawn is removed from the board even though the capturing pawn does not land on that square.

#### Pawn Promotion
- When a pawn reaches the opposite back rank (rank 8 for white, rank 1 for black), it must be promoted.
- **Choices:** Queen, Rook, Bishop, or Knight.
- **Implementation:** Show a dialog to the player. Default to Queen if no selection in bot mode.
- In bot mode, the AI specifies the promotion piece in its JSON response.

### 4.3 Draw Conditions

| Condition | Description |
|---|---|
| **Stalemate** | Current player has no legal moves and is NOT in check. |
| **Insufficient Material** | King vs King; K+B vs K; K+N vs K; K+B vs K+B (same color bishops). |
| **Threefold Repetition** | Same position occurs 3 times (same player to move, same castling rights, same en passant). |
| **Fifty-Move Rule** | 50 consecutive moves by both players without a pawn move or capture. |
| **Agreement** | Both players accept a draw offer (implement draw offer button). |

### 4.4 chess.js Integration

```javascript
import { Chess } from "chess.js";

const game = new Chess();

// Attempt a move
const result = game.move({ from: "e2", to: "e4" });
// Returns null if illegal, or a Move object if legal

// Check game state
game.isCheck();          // Boolean — is current player in check
game.isCheckmate();      // Boolean — is current player in checkmate
game.isStalemate();      // Boolean — is it stalemate
game.isDraw();           // Boolean — any draw condition
game.isInsufficientMaterial(); // Boolean
game.isThreefoldRepetition();  // Boolean
game.isGameOver();       // Boolean — any terminal state

// Get all legal moves
game.moves();            // ["e4", "d4", ...] in SAN
game.moves({ verbose: true }); // Full move objects with from/to/flags

// FEN (game state string)
game.fen(); // Returns current FEN string

// PGN (full game record)
game.pgn(); // Returns full PGN text

// Load position from FEN
game.load("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

// History
game.history();          // ["e4", "e5", ...]
game.history({ verbose: true }); // Full move objects
```

---

## 5. Move Notation & Move History

### 5.1 Algebraic Notation (SAN) Rules

| Symbol | Meaning |
|---|---|
| `e4` | Pawn to e4 |
| `Nf3` | Knight to f3 |
| `Bxe5` | Bishop captures on e5 |
| `O-O` | Kingside castling |
| `O-O-O` | Queenside castling |
| `e8=Q` | Pawn promotes to Queen |
| `+` | Check |
| `#` | Checkmate |
| `?` | Mistake (optional annotation) |
| `!` | Good move (optional annotation) |

### 5.2 Move History Display

```
Move History Panel
==================
#   White        Black
1.  e4           e5
2.  Nf3          Nc6
3.  Bb5          a6
4.  Ba4          Nf6
5.  O-O          Be7
...
```

- Display in two columns (White | Black).
- Clicking a move replays the position up to that point (review mode).
- Current move is highlighted.
- Export to PGN button.

### 5.3 Move Object Structure

```javascript
// chess.js verbose move object
{
  color: "w",           // "w" or "b"
  from: "e2",           // Source square
  to: "e4",             // Destination square
  piece: "p",           // Piece type: k/q/r/b/n/p
  captured: undefined,  // Piece type captured (if any)
  promotion: undefined, // Promotion piece (if pawn promotion)
  flags: "b",           // Move flags (b=big pawn, e=en passant, c=capture, etc.)
  san: "e4",            // Standard Algebraic Notation
  lan: "e2e4",          // Long Algebraic Notation
  before: "rnbq...",    // FEN before move
  after: "rnbq...",     // FEN after move
}
```

### 5.4 Flags Reference

| Flag | Meaning |
|---|---|
| `n` | Non-capture |
| `b` | Pawn big advance (2 squares) |
| `e` | En passant capture |
| `c` | Standard capture |
| `p` | Promotion |
| `k` | Kingside castling |
| `q` | Queenside castling |

---

## 6. Lobby System

### 6.1 Lobby Data Model

```javascript
{
  id: "uuid-v4",                    // Unique lobby ID
  name: "My Chess Room",            // Display name
  hostId: "socket-id-or-user-id",   // Host player ID
  guestId: null,                    // Guest player ID (null until joined)
  mode: "pvp" | "bot",              // Player vs Player or Player vs Bot
  botDifficulty: null | 1-6,        // Bot difficulty (1=Easy, 6=Magnus)
  timerMode: "bullet" | "blitz" | "rapid" | "classical" | "custom" | "none",
  timerConfig: {
    initialSeconds: 300,            // Starting time per player
    incrementSeconds: 3,            // Seconds added after each move
  },
  colorAssignment: "random" | "white" | "black", // Host's color preference
  status: "waiting" | "active" | "completed",
  createdAt: "ISO timestamp",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moveHistory: [],                  // Array of verbose move objects
  isPrivate: false,                 // Private (invite-only) lobby
  inviteCode: null | "6-char-code", // For private lobbies
}
```

### 6.2 Lobby Creation Flow

1. Player clicks **"Create Lobby"**.
2. Fill in:
   - Lobby name (optional, auto-generated if blank)
   - Mode: PvP or Bot
   - If Bot: select difficulty (1–6)
   - Timer mode
   - Color preference (random / white / black)
   - Private toggle (generates invite code)
3. Server creates lobby, returns `lobbyId`.
4. Host is taken to lobby waiting room.
5. If PvP: share lobby link or invite code.
6. If Bot: game starts immediately.

### 6.3 Lobby Joining Flow

1. Player browses lobby list or enters invite code.
2. Clicks **"Join"** on an open (status=waiting) lobby.
3. Server assigns guest to lobby.
4. Both players receive `game:start` WebSocket event.
5. Color assignment resolves: if host chose random, server flips a coin.

### 6.4 Lobby List View

```
Available Lobbies
=================
[Name]           [Mode]    [Timer]    [Host]     [Action]
"Quick Game"     PvP       5+3        Player123   [Join]
"Casual Blitz"   PvP       3+2        ChessKing   [Join]
"Bot Practice"   vs Bot    10+0       GrandMaster [Spectate]
```

- Filter by mode (PvP / Bot / All).
- Filter by timer mode.
- Refresh every 10 seconds or via WebSocket push.

---

## 7. Bot System & Difficulty Levels

### 7.1 Bot Profiles

| Level | ELO | Bot Name | Personality |
|---|---|---|---|
| 1 | ~250 | **Some Bad Chess Player** | Blunders frequently; ignores tactics; plays random legal moves often |
| 2 | ~500 | **The Beginner** | Occasionally captures free pieces; misses basic checkmates |
| 3 | ~1000 | **Club Casual** | Knows basic tactics; misses complex combos; develops pieces |
| 4 | ~1500 | **The Intermediate** | Solid play; uses openings; occasional tactical awareness |
| 5 | ~2000 | **Expert Bot** | Strong positional play; calculates 4-5 moves ahead |
| 6 | ~2500 | **Magnus Carlsen** | Near-perfect play; uses full opening book; endgame mastery |

### 7.2 Bot Behavior by Level

#### Level 1 — Some Bad Chess Player (~250 ELO)
- 50% chance to play a completely random legal move.
- Ignores checks on its own king (if random move is selected).
- Rarely develops pieces logically.
- Never castles.
- Never uses the opening book.
- Promotes pawns randomly (not always Queen).
- System prompt must tell AI: "You are a very bad chess player. Make frequent blunders, overlook tactics, and occasionally make moves that seem random. Do NOT play the objectively best move."

#### Level 2 — The Beginner (~500 ELO)
- 30% chance of random legal move.
- Will capture free pieces if obvious.
- Rarely plans more than 1 move ahead.
- Ignores pins and skewers.
- System prompt: "You are a beginner chess player around 500 ELO. You make mistakes, miss tactics, but you try to take free pieces when you see them."

#### Level 3 — Club Casual (~1000 ELO)
- Plays reasonable development moves.
- Knows basic opening principles (control center, develop knights before bishops).
- Misses complex combinations.
- Occasional tactical blunders.
- System prompt: "You are a casual club chess player around 1000 ELO. You know opening principles but miss intermediate tactics."

#### Level 4 — The Intermediate (~1500 ELO)
- Uses the opening book (first 5–8 moves).
- Solid middle game play.
- Recognizes forks, pins, skewers.
- Avoids obvious blunders.
- System prompt: "You are a 1500 ELO chess player. Play solid, principled chess. Use common openings. Find basic tactics but miss deeply calculated combinations."

#### Level 5 — Expert Bot (~2000 ELO)
- Uses the full opening book.
- Strong positional understanding.
- Calculates 4–6 moves ahead.
- Rarely blunders.
- System prompt: "You are a 2000 ELO chess expert. Play strong, precise chess. Use your opening knowledge, calculate carefully, and exploit positional weaknesses."

#### Level 6 — Magnus Carlsen (~2500 ELO)
- Uses full opening book including sidelines.
- Plays the objectively best or near-best move every time.
- Endgame technique is excellent.
- Never blunders.
- System prompt: "You are Magnus Carlsen, the world chess champion at 2500 ELO. Play the best possible move in every position. Use your superior calculation, positional sense, and endgame technique to crush your opponent."

### 7.3 Bot Move Delay (UX)

Add artificial thinking delays to simulate a human opponent:

```javascript
const BOT_THINK_DELAY_MS = {
  1: { min: 300,  max: 800  },   // Some Bad Chess Player — fast random
  2: { min: 500,  max: 1500 },   // Beginner
  3: { min: 800,  max: 2500 },   // Club Casual
  4: { min: 1000, max: 3500 },   // Intermediate
  5: { min: 1500, max: 5000 },   // Expert
  6: { min: 2000, max: 8000 },   // Magnus Carlsen — takes time to "think"
};

function getThinkDelay(level) {
  const { min, max } = BOT_THINK_DELAY_MS[level];
  return Math.floor(Math.random() * (max - min)) + min;
}
```

Show a "Bot is thinking..." indicator with animated dots during the delay.

---

## 8. AI Move API Protocol

### 8.1 Overview

The bot system calls an AI language model (e.g., GROQ Via api) to generate chess moves. The AI **must** respond in strict JSON format. The server validates every move against `chess.js` before applying it to the board.

### 8.2 Request Payload

```javascript
// POST to AI API
{
  model: "openai/gpt-oss-120b",
  max_tokens: 200,
  system: `${BOT_SYSTEM_PROMPT}

You are playing chess. You MUST respond with ONLY a valid JSON object.
No explanation, no markdown, no code blocks. Only raw JSON.

JSON format:
{
  "from": "",
  "to": "",
  "promotion": ""
}

Rules you MUST follow:
1. The move must be 100% legal given the current position.
2. The "from" square must contain one of your pieces.
3. The "to" square must be reachable by that piece.
4. You may ONLY choose from the legal moves listed in the prompt.
5. If promoting a pawn, specify the promotion piece. Otherwise set "promotion" to null.
6. DO NOT make a move that leaves your king in check.`,

  messages: [
    {
      role: "user",
      content: `Current chess position (FEN): ${currentFen}

It is ${colorToMove === 'w' ? 'White' : 'Black'}'s turn to move.

Legal moves available (in UCI format): ${legalMovesUCI.join(", ")}

Move history so far: ${moveHistorySAN.join(" ")}

Choose your move from the legal moves listed. Respond with ONLY a JSON object.`
    }
  ]
}
```

### 8.3 Expected AI Response

```json
{
  "from": "e2",
  "to": "e4",
  "promotion": null
}
```

For a promotion:
```json
{
  "from": "e7",
  "to": "e8",
  "promotion": "q"
}
```

### 8.4 Response Parsing

```javascript
async function parseBotResponse(rawText) {
  // Strip any accidental markdown fences
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.from || !parsed.to) {
      throw new Error("Missing from/to fields");
    }
    
    // Normalize square notation to lowercase
    parsed.from = parsed.from.toLowerCase();
    parsed.to = parsed.to.toLowerCase();
    parsed.promotion = parsed.promotion?.toLowerCase() ?? null;
    
    return parsed;
  } catch (err) {
    throw new Error(`Bot response parsing failed: ${err.message}. Raw: ${rawText}`);
  }
}
```

### 8.5 Legal Move List Generation

```javascript
function getLegalMovesUCI(game) {
  // game is a chess.js Chess instance
  return game.moves({ verbose: true }).map(m => {
    let uci = m.from + m.to;
    if (m.promotion) uci += m.promotion;
    return uci;
  });
}

// Example output: ["e2e4", "d2d4", "g1f3", "b1c3", ...]
```

**Always pass the legal move list to the AI.** This constrains the model to only choose moves that exist.

---

## 9. Illegal Move Detection & Correction

### 9.1 Validation Pipeline

Every bot move goes through this pipeline before being applied:

```
AI Response → Parse JSON → Validate Fields → Check Against chess.js → Apply OR Retry
```

```javascript
const MAX_BOT_RETRIES = 3;

async function getBotMove(game, difficulty, attemptNumber = 0) {
  if (attemptNumber >= MAX_BOT_RETRIES) {
    // Fallback: pick a random legal move
    console.warn("Bot failed to return valid move after retries. Using random.");
    const legalMoves = game.moves({ verbose: true });
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const legalMovesUCI = getLegalMovesUCI(game);
  const rawResponse = await callAIAPI(game.fen(), legalMovesUCI, difficulty, attemptNumber);
  
  let parsed;
  try {
    parsed = await parseBotResponse(rawResponse);
  } catch (err) {
    console.error("Parse error:", err.message);
    return getBotMove(game, difficulty, attemptNumber + 1);
  }

  // Validate against chess.js
  const testGame = new Chess(game.fen());
  const moveResult = testGame.move({
    from: parsed.from,
    to: parsed.to,
    promotion: parsed.promotion ?? "q",
  });

  if (moveResult === null) {
    console.error(`Illegal bot move: ${parsed.from}${parsed.to}. Retrying...`);
    // On retry, add the illegal move to the prompt so AI avoids it
    return getBotMove(game, difficulty, attemptNumber + 1, parsed);
  }

  return moveResult;
}
```

### 9.2 Retry Prompt with Error Context

When the AI makes an illegal move, the retry prompt must include the error:

```javascript
const retryMessages = [
  {
    role: "user",
    content: `Current FEN: ${fen}\nLegal moves: ${legalMovesUCI.join(", ")}\nChoose your move. Respond in JSON only.`
  },
  {
    role: "assistant",
    content: JSON.stringify(illegalMove)
  },
  {
    role: "user",
    content: `That move (${illegalMove.from}${illegalMove.to}) is ILLEGAL. It is not in the list of legal moves.
Legal moves are: ${legalMovesUCI.join(", ")}
You MUST choose from this exact list. Respond with valid JSON only.`
  }
];
```

### 9.3 Fallback: Random Legal Move

If after `MAX_BOT_RETRIES` the AI still fails:
- Select a random move from `game.moves({ verbose: true })`.
- Log the failure for debugging.
- Do not crash the game.

### 9.4 Move Flags Reference for Validation

```javascript
function validateMoveObject(parsed, game) {
  const errors = [];
  
  // Check field presence
  if (!parsed.from) errors.push("Missing 'from' field");
  if (!parsed.to) errors.push("Missing 'to' field");
  
  // Check square format (a-h, 1-8)
  const squareRegex = /^[a-h][1-8]$/;
  if (parsed.from && !squareRegex.test(parsed.from)) errors.push(`Invalid 'from' square: ${parsed.from}`);
  if (parsed.to && !squareRegex.test(parsed.to)) errors.push(`Invalid 'to' square: ${parsed.to}`);
  
  // Check promotion piece
  if (parsed.promotion && !["q","r","b","n"].includes(parsed.promotion)) {
    errors.push(`Invalid promotion piece: ${parsed.promotion}`);
  }
  
  // Check piece at source
  const piece = game.get(parsed.from);
  if (!piece) errors.push(`No piece at ${parsed.from}`);
  
  // Check color
  if (piece && piece.color !== game.turn()) {
    errors.push(`Piece at ${parsed.from} belongs to ${piece.color}, but it is ${game.turn()}'s turn`);
  }
  
  // Check if move is in legal moves list
  const legalMoves = game.moves({ verbose: true });
  const isLegal = legalMoves.some(m => m.from === parsed.from && m.to === parsed.to);
  if (!isLegal) errors.push(`Move ${parsed.from}→${parsed.to} is not legal in this position`);
  
  return errors;
}
```

---

## 10. Timer Modes

### 10.1 Preset Timer Modes

| Mode | Name | Initial Time | Increment | Description |
|---|---|---|---|---|
| `bullet_1_0` | Bullet | 1 min | 0 sec | Ultra-fast, no increment |
| `bullet_2_1` | Bullet | 2 min | 1 sec | Fast with tiny increment |
| `blitz_3_2` | Blitz | 3 min | 2 sec | Standard speed chess |
| `blitz_5_0` | Blitz | 5 min | 0 sec | Five-minute game |
| `blitz_5_3` | Blitz | 5 min | 3 sec | Most popular online format |
| `rapid_10_0` | Rapid | 10 min | 0 sec | Standard rapid |
| `rapid_10_5` | Rapid | 10 min | 5 sec | Rapid with increment |
| `rapid_15_10` | Rapid | 15 min | 10 sec | Long rapid |
| `classical_30_0` | Classical | 30 min | 0 sec | Standard classical |
| `classical_60_0` | Classical | 60 min | 0 sec | Long classical |
| `custom` | Custom | User-defined | User-defined | Flexible |
| `none` | No Timer | ∞ | — | Untimed (casual) |

### 10.2 Timer Configuration Object

```javascript
const TIMER_PRESETS = {
  bullet_1_0:   { label: "Bullet 1+0",    initialSeconds: 60,   incrementSeconds: 0 },
  bullet_2_1:   { label: "Bullet 2+1",    initialSeconds: 120,  incrementSeconds: 1 },
  blitz_3_2:    { label: "Blitz 3+2",     initialSeconds: 180,  incrementSeconds: 2 },
  blitz_5_0:    { label: "Blitz 5+0",     initialSeconds: 300,  incrementSeconds: 0 },
  blitz_5_3:    { label: "Blitz 5+3",     initialSeconds: 300,  incrementSeconds: 3 },
  rapid_10_0:   { label: "Rapid 10+0",    initialSeconds: 600,  incrementSeconds: 0 },
  rapid_10_5:   { label: "Rapid 10+5",    initialSeconds: 600,  incrementSeconds: 5 },
  rapid_15_10:  { label: "Rapid 15+10",   initialSeconds: 900,  incrementSeconds: 10 },
  classical_30: { label: "Classical 30+0",initialSeconds: 1800, incrementSeconds: 0 },
  classical_60: { label: "Classical 60+0",initialSeconds: 3600, incrementSeconds: 0 },
  none:         { label: "No Timer",      initialSeconds: null, incrementSeconds: 0 },
};
```

### 10.3 Timer Logic

```javascript
// Timer state per player
let timers = {
  white: { remaining: initialSeconds, active: false },
  black: { remaining: initialSeconds, active: false },
};

// After each move:
function onMoveComplete(colorWhoJustMoved) {
  // Add increment to the player who just moved
  timers[colorWhoJustMoved].remaining += incrementSeconds;
  
  // Pause that player's clock
  timers[colorWhoJustMoved].active = false;
  
  // Start opponent's clock
  const opponent = colorWhoJustMoved === "white" ? "black" : "white";
  timers[opponent].active = true;
}

// On game start:
// White's clock starts immediately
timers.white.active = true;

// Timer runs on server to prevent cheating (tick every 100ms)
// Broadcast remaining time to both clients every second

// Time out:
function onTimeout(color) {
  // color ran out of time — opponent wins
  endGame({ winner: color === "white" ? "black" : "white", reason: "timeout" });
}
```

### 10.4 Timer Display Format

```javascript
function formatTime(seconds) {
  if (seconds === null) return "∞";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Visual warning: turn clock red when < 10 seconds
// Visual warning: flash clock when < 30 seconds (rapid/classical)
```

### 10.5 Server-Side Timer Authority

- **Server is the authority on time.** Client displays are for UX only.
- Server runs a `setInterval` tick (every 100ms) for active game timers.
- On each move, server timestamps the move and updates remaining time.
- Remaining times are broadcast to both clients via WebSocket after each move.
- If a client disconnects and reconnects, server sends current timer state.

---

## 11. Check, Checkmate & Game End Logic

### 11.1 Check Detection

```javascript
// After every move (before switching turns):
if (game.isCheck()) {
  const checkedColor = game.turn(); // The player NOW in check
  
  // Notify both players via WebSocket
  io.to(lobbyId).emit("game:check", {
    checkedColor,
    position: game.fen(),
  });
  
  // Visual: highlight the checked king's square in red
  // Audio: play check sound effect
  // Toast: show "Check!" banner for the player in check
}
```

### 11.2 Check Notification — Client Side

```jsx
// CheckNotification.jsx
function CheckNotification({ isMyColorInCheck }) {
  return isMyColorInCheck ? (
    
      ♚ CHECK!
    
  ) : null;
}
```

### 11.3 Checkmate Detection & Game Over

```javascript
// After every move:
if (game.isCheckmate()) {
  const loser = game.turn();        // Player in checkmate loses
  const winner = loser === "w" ? "b" : "w";
  
  endGame({
    winner,
    loser,
    reason: "checkmate",
    fen: game.fen(),
    pgn: game.pgn(),
    moveCount: game.history().length,
  });
}
```

### 11.4 All Game Over Conditions

```javascript
function checkGameOver(game) {
  if (game.isCheckmate()) {
    const loser = game.turn();
    return { over: true, winner: loser === "w" ? "b" : "w", reason: "checkmate" };
  }
  if (game.isStalemate()) {
    return { over: true, winner: null, reason: "stalemate" };
  }
  if (game.isInsufficientMaterial()) {
    return { over: true, winner: null, reason: "insufficient_material" };
  }
  if (game.isThreefoldRepetition()) {
    return { over: true, winner: null, reason: "threefold_repetition" };
  }
  if (game.isDraw()) {
    return { over: true, winner: null, reason: "fifty_move_rule" };
  }
  return { over: false };
}
```

### 11.5 Game Over Reasons & Messages

| Reason | Winner | Message |
|---|---|---|
| `checkmate` | Opponent | "Checkmate! [Winner] wins!" |
| `timeout` | Opponent | "[Loser] ran out of time. [Winner] wins!" |
| `stalemate` | None | "Stalemate! The game is a draw." |
| `insufficient_material` | None | "Draw by insufficient material." |
| `threefold_repetition` | None | "Draw by threefold repetition." |
| `fifty_move_rule` | None | "Draw by the fifty-move rule." |
| `resignation` | Opponent | "[Player] resigned. [Opponent] wins!" |
| `draw_agreement` | None | "Both players agreed to a draw." |
| `abandonment` | Opponent | "[Player] abandoned the game. [Opponent] wins!" |

### 11.6 Resignation & Draw Offer

```javascript
// Resignation
socket.on("game:resign", ({ lobbyId, playerId }) => {
  const game = getGame(lobbyId);
  const resigningColor = getPlayerColor(playerId, game);
  endGame({
    lobbyId,
    winner: resigningColor === "w" ? "b" : "w",
    reason: "resignation",
  });
});

// Draw offer
socket.on("game:draw_offer", ({ lobbyId, playerId }) => {
  io.to(lobbyId).emit("game:draw_offered", { byPlayerId: playerId });
});

socket.on("game:draw_accept", ({ lobbyId }) => {
  endGame({ lobbyId, winner: null, reason: "draw_agreement" });
});

socket.on("game:draw_decline", ({ lobbyId }) => {
  io.to(lobbyId).emit("game:draw_declined");
});
```

---

## 12. Opening Library

The following openings should be stored in the bot's opening book. Higher difficulty bots use more of these openings and their variations.

### 12.1 Opening Book Format

```javascript
// openings.js
// Key: starting FEN or move sequence
// Value: array of possible replies weighted by frequency

const OPENING_BOOK = {
  // Initial position
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": [
    { move: "e2e4", weight: 40 },
    { move: "d2d4", weight: 35 },
    { move: "c2c4", weight: 15 },
    { move: "g1f3", weight: 10 },
  ],
  // After 1.e4
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": [
    { move: "e7e5", weight: 35 }, // Open game
    { move: "c7c5", weight: 30 }, // Sicilian
    { move: "e7e6", weight: 15 }, // French
    { move: "c7c6", weight: 10 }, // Caro-Kann
    { move: "d7d6", weight: 5  }, // Pirc
    { move: "g8f6", weight: 5  }, // Alekhine
  ],
  // ...continue for major variations
};
```

### 12.2 Major Openings Catalog

#### A. Open Games (1.e4 e5)

| Opening Name | Moves | ECO Code |
|---|---|---|
| **Ruy Lopez (Spanish Game)** | 1.e4 e5 2.Nf3 Nc6 3.Bb5 | C60-C99 |
| Ruy Lopez — Berlin Defense | 1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 | C65-C67 |
| Ruy Lopez — Morphy Defense | 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 | C68-C99 |
| **Italian Game** | 1.e4 e5 2.Nf3 Nc6 3.Bc4 | C50-C54 |
| Italian — Giuoco Piano | 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 | C53-C54 |
| Italian — Two Knights Defense | 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 | C55-C59 |
| **Scotch Game** | 1.e4 e5 2.Nf3 Nc6 3.d4 | C44-C45 |
| **Vienna Game** | 1.e4 e5 2.Nc3 | C25-C29 |
| **King's Gambit** | 1.e4 e5 2.f4 | C30-C39 |
| King's Gambit Accepted | 1.e4 e5 2.f4 exf4 | C33-C39 |
| King's Gambit Declined | 1.e4 e5 2.f4 Bc5 | C30-C31 |
| **Petrov's Defense** | 1.e4 e5 2.Nf3 Nf6 | C42-C43 |
| **Four Knights Game** | 1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 | C46-C49 |

#### B. Semi-Open Games (1.e4, not 1...e5)

| Opening Name | Moves | ECO Code |
|---|---|---|
| **Sicilian Defense** | 1.e4 c5 | B20-B99 |
| Sicilian — Najdorf | 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 | B90-B99 |
| Sicilian — Dragon | 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 | B70-B79 |
| Sicilian — Scheveningen | 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 | B80-B89 |
| Sicilian — Classical | 1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 | B56-B69 |
| Sicilian — Kan (Paulsen) | 1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 | B41-B43 |
| **French Defense** | 1.e4 e6 | C00-C19 |
| French — Winawer | 1.e4 e6 2.d4 d5 3.Nc3 Bb4 | C15-C19 |
| French — Tarrasch | 1.e4 e6 2.d4 d5 3.Nd2 | C03-C09 |
| French — Advance | 1.e4 e6 2.d4 d5 3.e5 | C02 |
| **Caro-Kann Defense** | 1.e4 c6 | B10-B19 |
| Caro-Kann — Classical | 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 | B18-B19 |
| Caro-Kann — Advance | 1.e4 c6 2.d4 d5 3.e5 | B12 |
| **Pirc Defense** | 1.e4 d6 2.d4 Nf6 3.Nc3 g6 | B07-B09 |
| **Alekhine's Defense** | 1.e4 Nf6 | B02-B05 |
| **Scandinavian Defense** | 1.e4 d5 | B01 |

#### C. Closed Games (1.d4)

| Opening Name | Moves | ECO Code |
|---|---|---|
| **Queen's Gambit** | 1.d4 d5 2.c4 | D06-D69 |
| QGD — Declined | 1.d4 d5 2.c4 e6 | D30-D69 |
| QGA — Accepted | 1.d4 d5 2.c4 dxc4 | D20-D29 |
| QGD — Slav Defense | 1.d4 d5 2.c4 c6 | D10-D19 |
| QGD — Semi-Slav | 1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 e6 | D43-D49 |
| **King's Indian Defense** | 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 | E60-E99 |
| KID — Classical | 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 | E91-E99 |
| KID — Sämisch | 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 | E80-E89 |
| **Nimzo-Indian Defense** | 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 | E20-E59 |
| **Queen's Indian Defense** | 1.d4 Nf6 2.c4 e6 3.Nf3 b6 | E12-E19 |
| **Catalan Opening** | 1.d4 Nf6 2.c4 e6 3.g3 | E00-E09 |
| **Grünfeld Defense** | 1.d4 Nf6 2.c4 g6 3.Nc3 d5 | D70-D99 |
| **Dutch Defense** | 1.d4 f5 | A80-A99 |
| **Benoni Defense** | 1.d4 Nf6 2.c4 c5 3.d5 | A60-A79 |

#### D. Flank Openings

| Opening Name | Moves | ECO Code |
|---|---|---|
| **English Opening** | 1.c4 | A10-A39 |
| English — Symmetrical | 1.c4 c5 | A30-A39 |
| **Réti Opening** | 1.Nf3 | A04-A09 |
| **King's Indian Attack** | 1.Nf3 d5 2.g3 | A07-A08 |
| **Bird's Opening** | 1.f4 | A02-A03 |
| **Larsen's Opening** | 1.b3 | A01 |
| **Sokolsky (Polish) Opening** | 1.b4 | A00 |

### 12.3 Opening Lookup Function

```javascript
function getOpeningBookMove(fen, difficulty) {
  const moves = OPENING_BOOK[fen];
  if (!moves || moves.length === 0) return null;

  // Higher difficulty bots use opening book more reliably
  const useBookProbability = {
    1: 0.0,   // Level 1 never uses book
    2: 0.1,
    3: 0.4,
    4: 0.7,
    5: 0.9,
    6: 0.98,  // Magnus almost always uses book
  };

  if (Math.random() > useBookProbability[difficulty]) return null;

  // Weighted random selection
  const totalWeight = moves.reduce((sum, m) => sum + m.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const move of moves) {
    rand -= move.weight;
    if (rand <= 0) return move.move; // Returns UCI string e.g. "e2e4"
  }
  return moves[0].move;
}
```

---

## 13. UI/UX Requirements

### 13.1 Page Layout — Game View

```
┌─────────────────────────────────────────────────┐
│  [Logo]         Chess App         [Lobby] [Menu] │
├──────────────────┬──────────────────────────────┤
│                  │  ♟ Black Player               │
│                  │  Timer: 4:32                  │
│   CHESSBOARD     │  ───────────────────────────  │
│   560 x 560 px   │  Move History:                │
│                  │  1. e4    e5                  │
│                  │  2. Nf3   Nc6                 │
│                  │  3. Bb5   a6                  │
│                  │  ...                          │
│                  │  ───────────────────────────  │
│                  │  ♔ White Player               │
│                  │  Timer: 3:15  ← Active        │
│                  │  ───────────────────────────  │
│                  │  [Draw] [Resign] [Flip Board] │
└──────────────────┴──────────────────────────────┘
```

### 13.2 Visual Indicators

| Event | Visual Effect |
|---|---|
| **Check** | King's square flashes red; "CHECK!" banner appears |
| **Legal move squares** | Highlight with semi-transparent dots on valid target squares |
| **Selected piece** | Source square highlighted in yellow/gold |
| **Last move** | Source and target squares highlighted in light blue |
| **Checkmate** | Board dims; game-over modal appears |
| **Active timer** | Slight pulsing border on active player's clock |
| **Low time (<10s)** | Timer turns red and blinks |
| **Bot thinking** | Spinning loader or "Magnus is thinking..." text |

### 13.3 Accessibility

- All interactive elements must be keyboard accessible.
- Board squares must have `aria-label` (e.g., `aria-label="e4, White Pawn"`).
- Sufficient color contrast for all UI elements.
- Mobile-responsive: board scales to screen width on mobile.
- Touch drag-and-drop support on mobile.

### 13.4 Board Flip

- Host plays from bottom by default.
- "Flip Board" button lets players view from either side.
- In PvP, each player always sees their own pieces at the bottom.

### 13.5 Pawn Promotion Dialog

```
When a pawn reaches the back rank, show a dialog:
┌──────────────────────────┐
│  Promote your pawn to:   │
│  [♛ Queen] [♜ Rook]      │
│  [♝ Bishop] [♞ Knight]   │
└──────────────────────────┘
```

Block other input until promotion is selected.

---

## 14. Backend API Endpoints

### Base URL: `http://localhost:3001/api`

### Lobbies

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/lobbies` | List all open lobbies | — |
| `POST` | `/lobbies` | Create a new lobby | `{ name, mode, botDifficulty, timerMode, timerConfig, colorAssignment, isPrivate }` |
| `GET` | `/lobbies/:id` | Get lobby details | — |
| `POST` | `/lobbies/:id/join` | Join a lobby | `{ playerId }` |
| `DELETE` | `/lobbies/:id` | Close/delete a lobby | — |
| `GET` | `/lobbies/invite/:code` | Find lobby by invite code | — |

### Games

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/games/:lobbyId` | Get current game state | — |
| `POST` | `/games/:lobbyId/move` | Submit a move (REST fallback) | `{ from, to, promotion }` |
| `GET` | `/games/:lobbyId/pgn` | Export PGN | — |
| `POST` | `/games/:lobbyId/resign` | Resign | `{ playerId }` |
| `POST` | `/games/:lobbyId/draw-offer` | Offer draw | `{ playerId }` |
| `POST` | `/games/:lobbyId/draw-accept` | Accept draw | `{ playerId }` |
| `POST` | `/games/:lobbyId/draw-decline` | Decline draw | `{ playerId }` |

### Bot

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/bot/move` | Get next bot move | `{ fen, difficulty, moveHistory }` |

### Example Response — Game State

```json
{
  "lobbyId": "abc-123",
  "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
  "turn": "w",
  "moveHistory": [
    { "san": "e4", "from": "e2", "to": "e4", "color": "w" },
    { "san": "e5", "from": "e7", "to": "e5", "color": "b" }
  ],
  "isCheck": false,
  "isCheckmate": false,
  "isDraw": false,
  "isGameOver": false,
  "timers": {
    "white": { "remaining": 295, "active": true },
    "black": { "remaining": 297, "active": false }
  },
  "status": "active"
}
```

---

## 15. WebSocket Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `lobby:create` | `{ name, mode, botDifficulty, timerMode, timerConfig, colorAssignment, isPrivate }` | Create a lobby |
| `lobby:join` | `{ lobbyId, playerId }` | Join a lobby |
| `lobby:leave` | `{ lobbyId, playerId }` | Leave lobby |
| `game:move` | `{ lobbyId, from, to, promotion }` | Submit a move |
| `game:resign` | `{ lobbyId, playerId }` | Resign |
| `game:draw_offer` | `{ lobbyId, playerId }` | Offer draw |
| `game:draw_accept` | `{ lobbyId }` | Accept draw |
| `game:draw_decline` | `{ lobbyId }` | Decline draw |
| `game:rematch` | `{ lobbyId }` | Request rematch |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `lobby:created` | `{ lobby }` | Lobby creation confirmation |
| `lobby:joined` | `{ lobby, color }` | Player joined — sends assigned color |
| `lobby:updated` | `{ lobby }` | Lobby state changed |
| `game:start` | `{ fen, colorAssignment, timers }` | Game begins |
| `game:move` | `{ move, fen, timers, isCheck, isCheckmate, isDraw }` | Move applied |
| `game:check` | `{ checkedColor, fen }` | A player is in check |
| `game:over` | `{ winner, reason, pgn, finalFen }` | Game has ended |
| `game:draw_offered` | `{ byPlayerId }` | Opponent offered draw |
| `game:draw_declined` | `{}` | Opponent declined draw |
| `game:bot_thinking` | `{}` | Bot is calculating |
| `game:bot_move` | `{ move, fen, timers }` | Bot has played |
| `game:timer_update` | `{ timers }` | Timer sync (every 1s) |
| `error` | `{ code, message }` | Error from server |

### WebSocket Implementation (Server)

```javascript
// server/sockets/gameSocket.js
const { Chess } = require("chess.js");
const { getBotMove } = require("../services/botService");
const games = new Map(); // lobbyId → { game, timers, players }

module.exports = function(io) {
  io.on("connection", (socket) => {
    
    socket.on("lobby:join", async ({ lobbyId, playerId }) => {
      socket.join(lobbyId);
      const lobby = getLobby(lobbyId);
      // ... assign color, update lobby, check if game can start
      
      if (lobby.guestId && lobby.hostId) {
        // Both players present — start game
        const game = new Chess();
        games.set(lobbyId, { game, timers: initTimers(lobby.timerConfig), players: lobby });
        io.to(lobbyId).emit("game:start", { fen: game.fen(), ... });
      }
    });

    socket.on("game:move", async ({ lobbyId, from, to, promotion }) => {
      const gameData = games.get(lobbyId);
      if (!gameData) return socket.emit("error", { message: "Game not found" });
      
      const { game } = gameData;
      
      // Validate it's the right player's turn
      const playerColor = getPlayerColor(socket.id, gameData.players);
      if (playerColor !== game.turn()) {
        return socket.emit("error", { code: "NOT_YOUR_TURN", message: "It is not your turn" });
      }
      
      // Apply move
      const move = game.move({ from, to, promotion: promotion ?? "q" });
      if (!move) {
        return socket.emit("error", { code: "ILLEGAL_MOVE", message: "Illegal move" });
      }
      
      // Update timers
      updateTimers(gameData.timers, playerColor, gameData.timerConfig);
      
      // Check game state
      const isCheck = game.isCheck();
      const isCheckmate = game.isCheckmate();
      const isDraw = game.isDraw();
      
      // Broadcast move
      io.to(lobbyId).emit("game:move", {
        move, fen: game.fen(), timers: gameData.timers, isCheck, isCheckmate, isDraw
      });
      
      if (isCheck && !isCheckmate) {
        io.to(lobbyId).emit("game:check", { checkedColor: game.turn() });
      }
      
      if (isCheckmate || isDraw) {
        const result = checkGameOver(game);
        io.to(lobbyId).emit("game:over", { ...result, pgn: game.pgn() });
        return;
      }
      
      // If bot game, trigger bot move
      if (gameData.isBotGame) {
        io.to(lobbyId).emit("game:bot_thinking");
        const delay = getThinkDelay(gameData.botDifficulty);
        
        setTimeout(async () => {
          const botMove = await getBotMove(game, gameData.botDifficulty);
          game.move(botMove);
          
          const botIsCheck = game.isCheck();
          const botIsCheckmate = game.isCheckmate();
          
          io.to(lobbyId).emit("game:bot_move", {
            move: botMove, fen: game.fen(), timers: gameData.timers
          });
          
          if (botIsCheck && !botIsCheckmate) {
            io.to(lobbyId).emit("game:check", { checkedColor: game.turn() });
          }
          
          if (botIsCheckmate || game.isDraw()) {
            const result = checkGameOver(game);
            io.to(lobbyId).emit("game:over", { ...result, pgn: game.pgn() });
          }
        }, delay);
      }
    });
  });
};
```

---

## 16. Database Schema

> Using a simple in-memory store or Redis for MVP. For production, use PostgreSQL or MongoDB.

### Lobby Schema

```javascript
// Lobby document / record
{
  id: String (UUID),
  name: String,
  hostId: String,
  guestId: String | null,
  mode: "pvp" | "bot",
  botDifficulty: Number (1-6) | null,
  timerMode: String,
  timerConfig: {
    initialSeconds: Number | null,
    incrementSeconds: Number,
  },
  colorAssignment: "random" | "white" | "black",
  status: "waiting" | "active" | "completed",
  isPrivate: Boolean,
  inviteCode: String | null,
  createdAt: Date,
  updatedAt: Date,
}
```

### Game Schema

```javascript
// Game state
{
  lobbyId: String,
  fen: String,                   // Current position
  pgn: String,                   // Full game PGN
  moveHistory: Array,            // Verbose move objects
  whitePlayerId: String,
  blackPlayerId: String,
  result: null | {
    winner: "w" | "b" | null,    // null = draw
    reason: String,
  },
  timers: {
    white: { remaining: Number, active: Boolean },
    black: { remaining: Number, active: Boolean },
  },
  startedAt: Date,
  endedAt: Date | null,
}
```

---

## 17. Bot Personality & Naming

### 17.1 Bot Roster

```javascript
// constants/botProfiles.js
export const BOT_PROFILES = {
  1: {
    id: "bot_1",
    name: "Some Bad Chess Player",
    elo: 250,
    avatar: "🤡",
    description: "A well-meaning player who forgets which pieces do what.",
    catchphrase: "I think... this is a good move?",
    systemPrompt: `You are "Some Bad Chess Player," a very weak chess player around 250 ELO. 
You make frequent blunders. You often overlook that your pieces are under attack.
You sometimes move pieces to squares that don't help at all.
50% of the time, just pick a random legal move.
Never use opening theory.
Do NOT play the best move. Play like a confused beginner.`,
  },
  2: {
    id: "bot_2",
    name: "The Beginner",
    elo: 500,
    avatar: "🎓",
    description: "Learning the ropes but still very rough around the edges.",
    catchphrase: "Oh wait, can I take that?",
    systemPrompt: `You are a beginner chess player around 500 ELO.
You try to take free pieces when you see them but miss most tactics.
You occasionally hang your own pieces.
You rarely think more than 1 move ahead.
Do not use sophisticated opening theory.`,
  },
  3: {
    id: "bot_3",
    name: "Club Casual",
    elo: 1000,
    avatar: "♟️",
    description: "Plays at the local chess club. Knows the basics.",
    catchphrase: "Center control, right?",
    systemPrompt: `You are a club-level chess player around 1000 ELO.
You know to develop pieces, control the center, and castle early.
You miss complex tactics but spot simple forks and pins occasionally.
Play reasonable chess but make occasional mistakes.`,
  },
  4: {
    id: "bot_4",
    name: "The Intermediate",
    elo: 1500,
    avatar: "🏆",
    description: "A solid player who knows their openings.",
    catchphrase: "I've prepared for this line.",
    systemPrompt: `You are an intermediate chess player around 1500 ELO.
You know common openings and play them correctly for 5-8 moves.
You calculate short combinations (2-3 moves deep).
You avoid major blunders and play positionally sound chess.`,
  },
  5: {
    id: "bot_5",
    name: "Expert Bot",
    elo: 2000,
    avatar: "⚔️",
    description: "A strong expert who rarely makes mistakes.",
    catchphrase: "Your position is strategically lost.",
    systemPrompt: `You are a strong chess expert around 2000 ELO.
You play precise, principled chess.
You use full opening theory, calculate tactics deeply (4-6 moves), and have strong positional understanding.
You rarely blunder and always find strong moves.`,
  },
  6: {
    id: "bot_6",
    name: "Magnus Carlsen",
    elo: 2500,
    avatar: "👑",
    description: "The world chess champion. Good luck.",
    catchphrase: "I see everything.",
    systemPrompt: `You are Magnus Carlsen, the world chess champion, playing at approximately 2500 ELO.
Play the objectively strongest move in every position.
Use deep calculation (8+ moves ahead when needed), superior positional judgment, and endgame mastery.
Never blunder. Exploit every weakness. Play to win.`,
  },
};
```

### 17.2 Bot Avatar Display

- Display the bot's emoji avatar next to their name.
- Show their ELO rating in smaller text beneath their name.
- Show a subtle "thinking..." animation during their turn.

---

## 18. Security & Validation

### 18.1 Server-Side Move Validation

**Never trust the client.** All move validation must happen on the server:

```javascript
// middleware/validateMove.js
const { Chess } = require("chess.js");

function validateMove(currentFen, from, to, promotion) {
  const game = new Chess(currentFen);
  
  // Attempt the move
  const result = game.move({ from, to, promotion: promotion ?? "q" });
  
  if (!result) {
    return {
      valid: false,
      error: `Illegal move: ${from} → ${to}. Not a valid move in this position.`,
    };
  }
  
  return { valid: true, move: result, newFen: game.fen() };
}

module.exports = validateMove;
```

### 18.2 Turn Validation

```javascript
// Ensure the player submitting the move is the player whose turn it is
function validatePlayerTurn(socketId, gameData) {
  const { whitePlayerId, blackPlayerId, game } = gameData;
  const currentTurn = game.turn(); // "w" or "b"
  
  if (currentTurn === "w" && socketId !== whitePlayerId) {
    return false;
  }
  if (currentTurn === "b" && socketId !== blackPlayerId) {
    return false;
  }
  return true;
}
```

### 18.3 Rate Limiting

```javascript
// Limit move submissions to prevent spam
const MOVE_RATE_LIMIT_MS = 100; // Max 1 move per 100ms per player
```

### 18.4 Input Sanitization

```javascript
function sanitizeMoveInput(input) {
  return {
    from: String(input.from || "").toLowerCase().slice(0, 2),
    to: String(input.to || "").toLowerCase().slice(0, 2),
    promotion: ["q","r","b","n"].includes(String(input.promotion || "").toLowerCase())
      ? String(input.promotion).toLowerCase()
      : null,
  };
}
```

### 18.5 Lobby Security

- Private lobbies require the correct invite code to join.
- A player cannot join their own lobby as the guest.
- A full lobby (both players present) rejects new join attempts.
- A player cannot make moves in a lobby they are not part of.

---

## 19. Implementation Checklist

### Phase 1 — Core Chess Engine

- [ ] Integrate `chess.js` for move validation
- [ ] Implement all standard chess rules (castling, en passant, promotion)
- [ ] Implement draw detection (stalemate, insufficient material, repetition, 50-move)
- [ ] Render chessboard with `react-chessboard`
- [ ] Load chess piece SVGs from Wikimedia
- [ ] Drag-and-drop move input
- [ ] Pawn promotion dialog
- [ ] Move history panel (SAN notation)
- [ ] Highlight legal moves on piece selection
- [ ] Highlight last move
- [ ] Check highlighting (king square turns red)

### Phase 2 — Bot System

- [ ] Implement `getBotMove()` with AI API call
- [ ] Implement JSON response parsing
- [ ] Implement illegal move detection and retry logic
- [ ] Implement fallback to random legal move after max retries
- [ ] Implement opening book lookup
- [ ] Implement all 6 difficulty levels with correct system prompts
- [ ] Implement bot think delay (per difficulty level)
- [ ] Show "Bot is thinking..." indicator
- [ ] Name bots correctly (Some Bad Chess Player → Magnus Carlsen)

### Phase 3 — Lobby System

- [ ] Create lobby creation form
- [ ] Implement lobby list view
- [ ] Implement lobby joining
- [ ] Implement private lobbies with invite codes
- [ ] WebSocket room management
- [ ] Handle player disconnection and reconnection
- [ ] Color assignment (random / host preference)

### Phase 4 — Timer System

- [ ] Implement all preset timer modes
- [ ] Server-side timer authority
- [ ] Client timer display
- [ ] Increment after each move
- [ ] Low-time visual warnings
- [ ] Timeout detection and game-over trigger

### Phase 5 — Game End & UI Polish

- [ ] Check notification toast
- [ ] Checkmate modal with game summary
- [ ] Resignation functionality
- [ ] Draw offer / accept / decline flow
- [ ] Rematch functionality
- [ ] PGN export
- [ ] Board flip button
- [ ] Responsive / mobile layout
- [ ] Sound effects (move, capture, check, game over)

### Phase 6 — Production

- [ ] Environment variable management (`.env`)
- [ ] Error handling and logging
- [ ] Input sanitization on all endpoints
- [ ] Rate limiting on move submissions
- [ ] Server-side timer to prevent cheating
- [ ] Reconnection handling (save game state)
- [ ] Deploy frontend (Vercel / Netlify)
- [ ] Deploy backend (Railway / Fly.io / AWS)
- [ ] Configure CORS for production domains

---

## Appendix A — Environment Variables

```env
# .env
PORT=3001
CLIENT_URL=http://localhost:3000

# AI API Key for bot moves
GROQ_API_KEY=your_api_key_here

# Redis (optional, for production)
REDIS_URL=redis://localhost:6379

# JWT Secret (if implementing auth)
JWT_SECRET=your_secret_here
```

---

## Appendix B — FEN String Reference

```
FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

Breakdown:
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR  → Piece placement (rank 8 to rank 1)
w                                              → Active color (w=white, b=black)
KQkq                                           → Castling availability (K=white kingside, Q=white queenside, k=black kingside, q=black queenside)
-                                              → En passant target square (- if none)
0                                              → Halfmove clock (fifty-move rule)
1                                              → Fullmove number

Piece codes:
  Uppercase = White:  K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
  Lowercase = Black:  k=king, q=queen, r=rook, b=bishop, n=knight, p=pawn
  Numbers   = Empty squares (e.g., 8 = eight empty squares)
```

---

## Appendix C — PGN Format Reference

```pgn
[Event "Casual Game"]
[Site "Chess App"]
[Date "2025.01.15"]
[White "Player1"]
[Black "Magnus Carlsen"]
[Result "1-0"]
[TimeControl "300+3"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 ...
1-0

Results: 1-0 (white wins), 0-1 (black wins), 1/2-1/2 (draw), * (ongoing)
```

---

## Appendix D — Square Coordinates Reference

```
  a   b   c   d   e   f   g   h
8 [a8][b8][c8][d8][e8][f8][g8][h8]  ← Black's back rank
7 [a7][b7][c7][d7][e7][f7][g7][h7]
6 [a6][b6][c6][d6][e6][f6][g6][h6]
5 [a5][b5][c5][d5][e5][f5][g5][h5]
4 [a4][b4][c4][d4][e4][f4][g4][h4]
3 [a3][b3][c3][d3][e3][f3][g3][h3]
2 [a2][b2][c2][d2][e2][f2][g2][h2]
1 [a1][b1][c1][d1][e1][f1][g1][h1]  ← White's back rank
  a   b   c   d   e   f   g   h

White starts on ranks 1-2, Black starts on ranks 7-8.
Files:  a (queenside) → h (kingside)
Ranks:  1 (white's back rank) → 8 (black's back rank)

Starting positions:
  White King:   e1    Black King:   e8
  White Queen:  d1    Black Queen:  d8
  White Rooks:  a1, h1    Black Rooks:  a8, h8
  White Bishops: c1, f1   Black Bishops: c8, f8
  White Knights: b1, g1   Black Knights: b8, g8
  White Pawns:  a2-h2     Black Pawns:  a7-h7
```

---

*End of Chess Application Specification — Version 1.0*

*This document is intended to be used as a complete engineering specification. Every section is self-contained and cross-referenced. Pass the entire document to your AI coding assistant or development team to begin implementation.*