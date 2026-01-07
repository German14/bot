import axios from "axios";

export async function getAllCoins() {
  const res = await axios.get("https://api.coinbase.com/v2/currencies");
  return res.data.data;
}

export async function getSpotPrice(symbol) {
  const res = await axios.get(
    `https://api.coinbase.com/v2/prices/${symbol}-USD/spot`
  );
  return Number(res.data.data.amount);
}
