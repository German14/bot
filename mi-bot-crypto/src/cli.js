const readline = require('readline');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function agregarMoneda() {
  // 1. Verificar que existe el config con la lista de CoinGecko
  if (!fs.existsSync(configPath)) {
    console.log("❌ Error: El archivo config.json no existe.");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (!config.lista_coingecko) {
    console.log("❌ Error: La lista de CoinGecko no está en config.json. Ejecuta 'node descargar_config.js' primero.");
    process.exit(1);
  }

  const geckoList = config.lista_coingecko;

  console.log("\n--- 🛠️ CONFIGURADOR INTELIGENTE ---");

  rl.question('Escribe el SÍMBOLO de la moneda (ej: SOL, BTC, ETH): ', (simboloInput) => {
    const simboloBusqueda = simboloInput.toLowerCase().trim();

    // 2. Buscar el ID real en la lista descargada
    const monedaEncontrada = geckoList.find(m => m.symbol.toLowerCase() === simboloBusqueda);

    if (!monedaEncontrada) {
      console.log(`❌ No se encontró ninguna moneda con el símbolo "${simboloInput}" en CoinGecko.`);
      rl.close();
      return;
    }

    console.log(`✨ Encontrado: ${monedaEncontrada.name} (ID: ${monedaEncontrada.id})`);

    rl.question('Escribe las palabras clave para noticias (separadas por coma): ', (keywords) => {

      const nuevoItem = {
        id: monedaEncontrada.id,
        simbolo: monedaEncontrada.symbol.toUpperCase(),
        keywords: keywords.trim()
      };

      // 3. Guardar en config.json evitando duplicados
      const index = config.monedas_a_monitorear.findIndex(m => m.id === nuevoItem.id);
      if (index !== -1) {
        config.monedas_a_monitorear[index] = nuevoItem;
        console.log(`\n✅ Datos actualizados para ${nuevoItem.simbolo}.`);
      } else {
        config.monedas_a_monitorear.push(nuevoItem);
        console.log(`\n✅ ${nuevoItem.simbolo} añadida al config.json.`);
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      rl.close();
    });
  });
}

agregarMoneda();