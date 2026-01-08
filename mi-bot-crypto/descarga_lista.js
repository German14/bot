const axios = require('axios');
const fs = require('fs');

async function descargar() {
  try {
    console.log("⏳ Descargando base de datos de CoinGecko (esto puede tardar unos segundos)...");
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/list');

    fs.writeFileSync('coingecko_list.json', JSON.stringify(res.data, null, 2));
    console.log(`✅ ¡Éxito! Se han guardado ${res.data.length} monedas.`);
    console.log("Ahora ya puedes usar 'npm run add'.");
  } catch (error) {
    console.error("❌ Error al descargar:", error.message);
  }
}

descargar();