// client/src/services/stockfishService.js

/**
 * Stockfish.js Service
 * Integrates the Stockfish engine via CDN as a Web Worker.
 */

const STOCKFISH_CDN_URL = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

class StockfishService {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.onMoveFound = null;
    this.initializationPromise = null;
  }

  async init() {
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = new Promise((resolve, reject) => {
      try {
        console.log('[Stockfish] Fetching engine from CDN...');
        fetch(STOCKFISH_CDN_URL)
          .then(response => response.text())
          .then(scriptContent => {
            const blob = new Blob([scriptContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            
            this.worker = new Worker(blobUrl);
            this.worker.onmessage = (e) => this.handleMessage(e.data);
            
            // Initialize UCI
            this.sendMessage('uci');
            this.isReady = true;
            console.log('[Stockfish] Engine initialized and ready.');
            resolve();
          })
          .catch(err => {
            console.error('[Stockfish] Failed to fetch script:', err);
            reject(err);
          });
      } catch (err) {
        console.error('[Stockfish] Initialization error:', err);
        reject(err);
      }
    });

    return this.initializationPromise;
  }

  sendMessage(msg) {
    if (this.worker) {
      this.worker.postMessage(msg);
    }
  }

  handleMessage(msg) {
    // console.log('[Stockfish] Message:', msg);

    if (msg.startsWith('bestmove')) {
      const parts = msg.split(' ');
      const bestMove = parts[1]; // e.g., "e2e4"
      
      if (this.onMoveFound) {
        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);
        const promotion = bestMove.length > 4 ? bestMove[4] : 'q';
        this.onMoveFound({ from, to, promotion });
      }
    }
  }

  /**
   * Find the best move for a given FEN and difficulty level
   * @param {string} fen 
   * @param {number} difficulty (1-6)
   * @param {function} callback 
   */
  async findMove(fen, difficulty, callback) {
    await this.init();
    
    this.onMoveFound = callback;
    
    // UCI parameters based on difficulty
    // Level 1-6 map to Skill Levels (0-20)
    const skillLevel = Math.min(20, (difficulty - 1) * 4);
    this.sendMessage(`setoption name Skill Level value ${skillLevel}`);
    
    // Position
    this.sendMessage(`position fen ${fen}`);
    
    // Search parameters
    // Higher difficulty = higher depth/time
    const depth = 2 + (difficulty * 2); // 4 to 14
    const movetime = 200 * difficulty;  // 200ms to 1.2s
    
    this.sendMessage(`go depth ${depth} movetime ${movetime}`);
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
      this.initializationPromise = null;
    }
  }
}

export const stockfish = new StockfishService();
