import axios from "axios";

const BASE = "https://api.binance.com/api/v3";

export async function getKlines(symbol, interval = "1d", limit = 100) {
  const res = await axios.get(`${BASE}/klines`, {
    params: {
      symbol,
      interval,
      limit
    }
  });

  // kline format:
  // [ openTime, open, high, low, close, volume, ... ]
  return res.data.map(k => ({
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5])
  }));
}
