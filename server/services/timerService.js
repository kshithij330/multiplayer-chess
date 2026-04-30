// server/services/timerService.js

function initTimers(timerConfig) {
  return {
    white: { remaining: timerConfig.initialSeconds, active: false },
    black: { remaining: timerConfig.initialSeconds, active: false },
  };
}

function startTimers(gameData, io) {
  if (gameData.timerConfig.initialSeconds === null) return;
  gameData.timers.white.active = true;
  gameData.lastTickTime = Date.now();

  gameData.timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = (now - gameData.lastTickTime) / 1000;
    gameData.lastTickTime = now;
    const activeColor = gameData.timers.white.active ? "white" : "black";
    if (gameData.timers[activeColor].remaining !== null) {
      gameData.timers[activeColor].remaining -= elapsed;
      if (gameData.timers[activeColor].remaining <= 0) {
        gameData.timers[activeColor].remaining = 0;
        clearInterval(gameData.timerInterval);
        gameData.timerInterval = null;
        const winner = activeColor === "white" ? "b" : "w";
        io.to(gameData.lobbyId).emit("game:over", {
          winner, reason: "timeout",
          message: `${activeColor} ran out of time. ${winner === "w" ? "White" : "Black"} wins!`,
        });
      }
    }
  }, 100);

  gameData.timerBroadcast = setInterval(() => {
    io.to(gameData.lobbyId).emit("game:timer_update", {
      timers: {
        white: { remaining: Math.max(0, Math.floor(gameData.timers.white.remaining * 10) / 10), active: gameData.timers.white.active },
        black: { remaining: Math.max(0, Math.floor(gameData.timers.black.remaining * 10) / 10), active: gameData.timers.black.active },
      },
    });
  }, 1000);
}

function onMoveComplete(gameData, colorWhoJustMoved) {
  if (gameData.timerConfig.initialSeconds === null) return;
  const colorKey = colorWhoJustMoved === "w" ? "white" : "black";
  const opponentKey = colorWhoJustMoved === "w" ? "black" : "white";
  gameData.timers[colorKey].remaining += gameData.timerConfig.incrementSeconds;
  gameData.timers[colorKey].active = false;
  gameData.timers[opponentKey].active = true;
  gameData.lastTickTime = Date.now();
}

function stopTimers(gameData) {
  if (gameData.timerInterval) { clearInterval(gameData.timerInterval); gameData.timerInterval = null; }
  if (gameData.timerBroadcast) { clearInterval(gameData.timerBroadcast); gameData.timerBroadcast = null; }
  gameData.timers.white.active = false;
  gameData.timers.black.active = false;
}

module.exports = { initTimers, startTimers, onMoveComplete, stopTimers };
