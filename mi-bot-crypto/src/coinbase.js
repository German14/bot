const { Coinbase } = require('@coinbase/coinbase-sdk');
require('dotenv').config();

const client = new Coinbase({
  apiKeyName: process.env.COINBASE_KEY_NAME,
  privateKey: process.env.COINBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
});

async function obtenerPrecio(simbolo) {
  try {
    const product = await client.getProduct(`${simbolo}-USD`);
    return parseFloat(product.price);
  } catch (error) {
    console.error(`❌ Error Coinbase (${simbolo}):`, error.message);
    return null;
  }
}

module.exports = { obtenerPrecio };