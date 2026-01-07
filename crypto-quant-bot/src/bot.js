import { MARKETS } from "./config/coins.js";
import { getKlines } from "./api/binance.js";
import { RSI } from "./indicators/rsi.js";
import { EMA } from "./indicators/ema.js";
import { momentum } from "./indicators/momentum.js";

function signal({ rsi, m7, emaFast, emaSlow }) {
  if (rsi < 40 && m7 > 0 && emaFast > emaSlow) return "SUBE 🚀";
  if (rsi > 70 && m7 < 0 && emaFast < emaSlow) return "BAJA 🔻";
  return "NEUTRO";
}

export async function runBot() {
  const results = [];

  for (const market of MARKETS) {
    const klines = await getKlines(market, "1d", 100);
    const closes = klines.map(k => k.close);

    const rsi = RSI(closes);
    const emaFast = EMA(closes, 12);
    const emaSlow = EMA(closes, 26);

    const m7 = momentum(closes, 7);
    const m30 = momentum(closes, 30);

    results.push({
      market,
      price: closes.at(-1),
      rsi,
      m7,
      m30,
      signal: signal({ rsi, m7, emaFast, emaSlow })
    });
  }

  return results;
}
