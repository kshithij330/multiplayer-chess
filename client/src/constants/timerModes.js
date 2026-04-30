// client/src/constants/timerModes.js
export const TIMER_PRESETS = {
  bullet_1_0:   { label: "Bullet 1+0",     initialSeconds: 60,   incrementSeconds: 0,  icon: "⚡" },
  bullet_2_1:   { label: "Bullet 2+1",     initialSeconds: 120,  incrementSeconds: 1,  icon: "⚡" },
  blitz_3_2:    { label: "Blitz 3+2",      initialSeconds: 180,  incrementSeconds: 2,  icon: "🔥" },
  blitz_5_0:    { label: "Blitz 5+0",      initialSeconds: 300,  incrementSeconds: 0,  icon: "🔥" },
  blitz_5_3:    { label: "Blitz 5+3",      initialSeconds: 300,  incrementSeconds: 3,  icon: "🔥" },
  rapid_10_0:   { label: "Rapid 10+0",     initialSeconds: 600,  incrementSeconds: 0,  icon: "⏱️" },
  rapid_10_5:   { label: "Rapid 10+5",     initialSeconds: 600,  incrementSeconds: 5,  icon: "⏱️" },
  rapid_15_10:  { label: "Rapid 15+10",    initialSeconds: 900,  incrementSeconds: 10, icon: "⏱️" },
  classical_30: { label: "Classical 30+0", initialSeconds: 1800, incrementSeconds: 0,  icon: "🏛️" },
  classical_60: { label: "Classical 60+0", initialSeconds: 3600, incrementSeconds: 0,  icon: "🏛️" },
  none:         { label: "No Timer",       initialSeconds: null, incrementSeconds: 0,  icon: "♾️" },
};

export const TIMER_CATEGORIES = {
  bullet: ["bullet_1_0", "bullet_2_1"],
  blitz: ["blitz_3_2", "blitz_5_0", "blitz_5_3"],
  rapid: ["rapid_10_0", "rapid_10_5", "rapid_15_10"],
  classical: ["classical_30", "classical_60"],
  none: ["none"],
};

export function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "∞";
  const totalSec = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
