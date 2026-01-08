require('dotenv').config();
const config = require('./config.json');
const { obtenerPrecio } = require('./src/market');
const { analizarTendencia } = require('./src/scanner');
const { guardarEnHistorial } = require('./src/database');

async function iniciarBot() {
  // Limpia la terminal para que los datos siempre se vean frescos
  console.clear();
  console.log(`==================================================`);
  console.log(`🤖 CRYPTO BOT ACTIVO | ${new Date().toLocaleTimeString()}`);
  console.log(`==================================================\n`);

  for (const item of config.monedas_a_monitorear) {
    process.stdout.write(`🔍 Procesando ${item.simbolo}... `);

    const precio = await obtenerPrecio(item.id);
    const analitica = await analizarTendencia(item.keywords);

    if (precio !== null) {
      const data = {
        fecha: new Date().toISOString(),
        moneda: item.simbolo,
        precio_usd: precio,
        analisis: analitica
      };

      guardarEnHistorial(data);

      // Borra la línea de "Procesando..." y muestra el resultado
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log(`✅ ${item.simbolo.padEnd(5)} | $${precio.toLocaleString().padEnd(10)} | ${analitica.veredicto}`);
      console.log(`   └─ Sentimiento: ${analitica.puntaje} (${analitica.menciones} noticias)`);
    } else {
      console.log(`❌ Error al obtener datos de ${item.simbolo}`);
    }
  }

  console.log(`\n⏳ Próxima actualización en 60 segundos...`);
}

// Ejecutar cada 60,000 ms (1 minuto)
setInterval(iniciarBot, 60000);

// Ejecución inicial
iniciarBot();