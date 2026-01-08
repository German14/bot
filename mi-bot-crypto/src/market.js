const axios = require('axios');
require('dotenv').config();


async function obtenerPrecio(idMoneda) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idMoneda}&vs_currencies=usd`;
    const response = await axios.get(url, {
      headers: { 'x-cg-demo-api-key': process.env.GECKO_API_KEY }
    });

    return response.data[idMoneda].usd;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn(`⚠️ Límite de CoinGecko alcanzado. Esperando para la próxima vuelta...`);
      // Retornamos null para que el bot no se detenga, simplemente se salta esta vuelta
      return null;
    }
    console.error(`❌ Error CoinGecko:`, error.message);
    return null;
  }
}

module.exports = { obtenerPrecio };