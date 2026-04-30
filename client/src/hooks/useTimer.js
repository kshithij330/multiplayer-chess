// client/src/hooks/useTimer.js
import { useState, useEffect, useRef } from "react";
import useGameStore from "../store/gameStore";
import { formatTime } from "../constants/timerModes";

export default function useTimer() {
  const { timers, timerConfig } = useGameStore();
  const [displayTimers, setDisplayTimers] = useState(timers);
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    setDisplayTimers(timers);
    lastUpdate.current = Date.now();
  }, [timers]);

  // Client-side interpolation between server updates
  useEffect(() => {
    if (timerConfig.initialSeconds === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdate.current) / 1000;

      setDisplayTimers((prev) => {
        const next = { ...prev };
        if (prev.white.active) {
          next.white = { ...prev.white, remaining: Math.max(0, prev.white.remaining - elapsed) };
        }
        if (prev.black.active) {
          next.black = { ...prev.black, remaining: Math.max(0, prev.black.remaining - elapsed) };
        }
        return next;
      });
      lastUpdate.current = now;
    }, 100);

    return () => clearInterval(interval);
  }, [timerConfig]);

  return {
    whiteTime: displayTimers.white.remaining,
    blackTime: displayTimers.black.remaining,
    whiteActive: displayTimers.white.active,
    blackActive: displayTimers.black.active,
    whiteFormatted: formatTime(displayTimers.white.remaining),
    blackFormatted: formatTime(displayTimers.black.remaining),
    isWhiteLow: displayTimers.white.remaining !== null && displayTimers.white.remaining < 10,
    isBlackLow: displayTimers.black.remaining !== null && displayTimers.black.remaining < 10,
    hasTimer: timerConfig.initialSeconds !== null,
  };
}
