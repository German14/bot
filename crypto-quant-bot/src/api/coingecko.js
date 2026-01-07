import axios from "axios";
import { sleep } from "../utils/sleep.js";

export async function fetchMarketData(geckoId) {
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart`,
    {
      params: {
        vs_currency: "usd",
        days: 90
      }
    }
  );

  // MUY IMPORTANTE
  await sleep(3000);

  return res.data.prices.map(p => p[1]);
}
