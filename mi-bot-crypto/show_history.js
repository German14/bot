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

      // Obtener fechas
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgoStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Filtrar predicciones por período
      const todayPredictions = history.filter(entry => {
        const predDate = new Date(entry.result.timestamp);
        return predDate >= todayStart;
      });

      const weekPredictions = history.filter(entry => {
        const predDate = new Date(entry.result.timestamp);
        return predDate >= weekAgoStart;
      });

      // Función auxiliar para analizar predicciones
      function analyzePredictions(predictions, label) {
        if (predictions.length === 0) {
          console.log(`\n${label}: Sin predicciones disponibles\n`);
          return;
        }

        const coinFrequency = {};
        const scoreHistory = {};

        predictions.forEach(entry => {
          if (entry.result.success) {
            const coinsToAnalyze = entry.result.allCoins || entry.result.top3 || [];

            coinsToAnalyze.forEach(line => {
              const match = line.match(/(?:🥇|🥈|🥉|\d+\.)\s+(\w+)\s+\|\s+Score:\s+(\d+\.\d+)/);
              if (match) {
                const symbol = match[1];
                const score = parseFloat(match[2]);

                coinFrequency[symbol] = (coinFrequency[symbol] || 0) + 1;

                if (!scoreHistory[symbol]) {
                  scoreHistory[symbol] = [];
                }
                scoreHistory[symbol].push(score);
              }
            });
          }
        });

        console.log(`${label}:`);
        console.log(`\n📊 Monedas más frecuentes (${predictions.length} predicciones):`);
        Object.entries(coinFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([coin, count]) => {
            const avgScore = scoreHistory[coin].reduce((sum, score) => sum + score, 0) / scoreHistory[coin].length;
            const maxScore = Math.max(...scoreHistory[coin]);
            console.log(`   ${coin.padEnd(6)}: ${count} veces | Score promedio: ${avgScore.toFixed(1)} | Máximo: ${maxScore.toFixed(1)}`);
          });

        console.log('\n📉 Monedas con MENOR potencial (más pierden):\n');
        Object.entries(coinFrequency)
          .sort(([coinA], [coinB]) => {
            const avgA = scoreHistory[coinA].reduce((sum, score) => sum + score, 0) / scoreHistory[coinA].length;
            const avgB = scoreHistory[coinB].reduce((sum, score) => sum + score, 0) / scoreHistory[coinB].length;
            return avgA - avgB;
          })
          .slice(0, 10)
          .forEach(([coin, count], index) => {
            const avgScore = scoreHistory[coin].reduce((sum, score) => sum + score, 0) / scoreHistory[coin].length;
            const minScore = Math.min(...scoreHistory[coin]);
            const medal = index < 3 ? ['📉', '⬇️', '🔴'][index] : '  ';
            console.log(`   ${medal} ${coin.padEnd(6)}: ${count} veces | Score promedio: ${avgScore.toFixed(1)} | Mínimo: ${minScore.toFixed(1)}`);
          });

        console.log('');
      }

      // Mostrar análisis de hoy
      analyzePredictions(todayPredictions, '📅 HOY');

      // Mostrar análisis de la semana
      analyzePredictions(weekPredictions, '📆 ÚLTIMA SEMANA');

      console.log('📊 Estadísticas generales:');
      const totalPredictions = history.slice(0, Math.min(10, history.length)).length;
      const successfulPredictions = history.slice(0, Math.min(10, history.length)).filter(p => p.result.success).length;

      console.log(`   • Total de predicciones: ${history.length}`);
      console.log(`   • Predicciones hoy: ${todayPredictions.length}`);
      console.log(`   • Predicciones en la semana: ${weekPredictions.length}`);
    }

  } catch (error) {
    console.error('❌ Error leyendo historial:', error.message);
  }
}

showPredictionHistory();