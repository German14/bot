import { runBot } from "./bot.js";

(async () => {
  console.log("🚀 Bot Binance (SIN 429, datos reales)\n");

  const data = await runBot();

  console.table(
    data.map(d => ({
      Mercado: d.market,
      Precio: d.price.toFixed(2),
      RSI: d.rsi?.toFixed(1),
      "M 7d %": (d.m7 * 100).toFixed(2),
      "M 30d %": (d.m30 * 100).toFixed(2),
      Señal: d.signal
    }))
  );
})();
