import { trendMomentum } from "./indicators/momentum.js";

export function trendScoreAndSignal(trendValues) {
  if (!trendValues || trendValues.length < 2) {
    return { score: 0, signal: "NO DATA" };
  }

  const momentum = trendMomentum(trendValues);

  let signal = "NEUTRO";
  if (momentum > 0.3) signal = "SUBE 🚀";
  else if (momentum < -0.1) signal = "BAJA 🔻";

  let score = 20;
  if (momentum > 1) score = 80;
  else if (momentum > 0.5) score = 60;
  else if (momentum > 0.2) score = 40;

  return { score, signal };
}

export function totalScore({ trend, narrative }) {
  const narrativeScore =
    Math.max(...Object.values(narrative)) * 100;

  return trend * 0.6 + narrativeScore * 0.4;
}
