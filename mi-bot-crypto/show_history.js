const fs = require('fs');

const HISTORY_FILE = './prediction_history.json';

function showPredictionHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    console.log('❌ No existe historial de predicciones');
    console.log('Ejecuta primero: npm run predict-scheduler');
    return;
  }

  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));

    console.log('📊 HISTORIAL DE PREDICCIONES\n');
    console.log(`Total de predicciones: ${history.length}\n`);

    // Mostrar las últimas 3 predicciones con todas las monedas
    history.slice(0, 3).forEach((entry, index) => {
      const date = new Date(entry.result.timestamp).toLocaleString();
      console.log(`${index + 1}. ${date}`);

      if (entry.result.success) {
        console.log('   ✅ Exitosa');

        // Mostrar todas las monedas (o top 15 si hay muchas)
        const coinsToShow = entry.result.allCoins || entry.result.top3 || [];
        if (coinsToShow.length > 0) {
          console.log(`   📊 Top ${coinsToShow.length} monedas:`);
          coinsToShow.slice(0, 15).forEach((line, coinIndex) => {
            const cleanLine = line.trim();
            if (cleanLine) {
              console.log(`      ${coinIndex + 1}. ${cleanLine}`);
            }
          });

          if (coinsToShow.length > 15) {
            console.log(`      ... y ${coinsToShow.length - 15} monedas más`);
          }
        }
      } else {
        console.log('   ❌ Fallida');
        if (entry.result.error) {
          console.log(`   Error: ${entry.result.error}`);
        }
      }
      console.log('');
    });

    // Análisis de tendencias mejorado
    if (history.length >= 2) {
      console.log('📈 ANÁLISIS DE TENDENCIAS\n');

      const recentPredictions = history.slice(0, Math.min(10, history.length)); // Últimas predicciones disponibles
      const coinFrequency = {};
      const scoreHistory = {};

      recentPredictions.forEach(entry => {
        if (entry.result.success) {
          const coinsToAnalyze = entry.result.allCoins || entry.result.top3 || [];

          coinsToAnalyze.forEach(line => {
            // Extraer símbolo y score de la línea
            const match = line.match(/(?:🥇|🥈|🥉|\d+\.)\s+(\w+)\s+\|\s+Score:\s+(\d+\.\d+)/);
            if (match) {
              const symbol = match[1];
              const score = parseFloat(match[2]);

              // Contar frecuencia
              coinFrequency[symbol] = (coinFrequency[symbol] || 0) + 1;

              // Guardar historial de scores
              if (!scoreHistory[symbol]) {
                scoreHistory[symbol] = [];
              }
              scoreHistory[symbol].push(score);
            }
          });
        }
      });

      console.log(`Monedas más frecuentes en predicciones (últimas ${recentPredictions.length}):`);
      Object.entries(coinFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([coin, count]) => {
          const avgScore = scoreHistory[coin].reduce((sum, score) => sum + score, 0) / scoreHistory[coin].length;
          const maxScore = Math.max(...scoreHistory[coin]);
          console.log(`   ${coin.padEnd(6)}: ${count} veces | Score promedio: ${avgScore.toFixed(1)} | Máximo: ${maxScore.toFixed(1)}`);
        });

      console.log('\n📊 Estadísticas generales:');
      const totalPredictions = recentPredictions.length;
      const successfulPredictions = recentPredictions.filter(p => p.result.success).length;
      const totalCoinsAnalyzed = Object.keys(coinFrequency).length;

      console.log(`   • Predicciones exitosas: ${successfulPredictions}/${totalPredictions}`);
      console.log(`   • Monedas analizadas: ${totalCoinsAnalyzed}`);
      console.log(`   • Monedas únicas en top 10: ${Math.min(10, Object.keys(coinFrequency).length)}`);
    }

  } catch (error) {
    console.error('❌ Error leyendo historial:', error.message);
  }
}

showPredictionHistory();