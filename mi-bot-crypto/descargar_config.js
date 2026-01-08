const axios = require('axios');
const fs = require('fs');

async function descargarYGuardarEnConfig() {
  try {
    console.log("⏳ Descargando base de datos de CoinGecko...");

    const res = await axios.get('https://api.coingecko.com/api/v3/coins/list');

    // Leer el config actual
    const configPath = './config.json';
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Agregar la lista de CoinGecko al config
    config.lista_coingecko = res.data;

    // Guardar el config actualizado
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ ¡Éxito! Se han guardado ${res.data.length} monedas en config.json`);
    console.log("Ahora puedes usar 'npm run add' sin necesidad de descargar la lista por separado.");

  } catch (error) {
    console.error("❌ Error al descargar:", error.message);
  }
}

descargarYGuardarEnConfig();