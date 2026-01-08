const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Función para obtener datos técnicos (del bot cuantitativo)
async function getTechnicalData() {
  try {
    // Simular datos del bot cuantitativo
    const markets = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "AVAXUSDT", "ADAUSDT", "DOTUSDT"];

    const results = [];
    for (const market of markets) {
      try {
        // Obtener datos de Binance
        const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${market}&interval=1d&limit=30`);
        const closes = response.data.map(k => parseFloat(k[4]));

        // Calcular indicadores simples
        const currentPrice = closes[closes.length - 1];
        const prevPrice = closes[closes.length - 2];
        const priceChange = (currentPrice - prevPrice) / prevPrice;

        // RSI simple (simulado)
        const gains = closes.slice(-14).filter((price, i, arr) => i > 0 && price > arr[i-1]).reduce((sum, price, i, arr) => sum + (price - arr[i-1]), 0);
        const losses = closes.slice(-14).filter((price, i, arr) => i > 0 && price < arr[i-1]).reduce((sum, price, i, arr) => sum + (arr[i-1] - price), 0);
        const rsi = losses === 0 ? 100 : 100 - (100 / (1 + (gains / losses)));

        // Momentum 7d y 30d
        const m7 = closes.length >= 7 ? (closes[closes.length-1] - closes[closes.length-8]) / closes[closes.length-8] : 0;
        const m30 = closes.length >= 30 ? (closes[closes.length-1] - closes[0]) / closes[0] : 0;

        results.push({
          symbol: market.replace('USDT', ''),
          price: currentPrice,
          priceChange: priceChange,
          rsi: rsi,
          momentum7d: m7,
          momentum30d: m30,
          signal: (rsi < 40 && m7 > 0) ? 'BULLISH' : (rsi > 70 && m7 < 0) ? 'BEARISH' : 'NEUTRAL'
        });

      } catch (error) {
        console.log(`Error obteniendo datos de ${market}:`, error.message);
      }
    }

    return results;
  } catch (error) {
    console.error('Error en datos técnicos:', error.message);
    return [];
  }
}

// Función para obtener datos de CoinGecko (market cap, volumen)
async function getCoinGeckoData() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
    return response.data.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h,
      rank: coin.market_cap_rank
    }));
  } catch (error) {
    console.error('Error obteniendo datos de CoinGecko:', error.message);
    return [];
  }
}

// Función para obtener datos de sentimientos (desde historial cacheado)
async function getSentimentData() {
  try {
    // Leer datos del historial en lugar de hacer nuevas llamadas a la API
    let historial = [];
    if (fs.existsSync('./historial.json')) {
      historial = JSON.parse(fs.readFileSync('./historial.json', 'utf8'));
    }

    // Agrupar por moneda y calcular promedio de sentimientos recientes
    const sentimentByCoin = {};

    historial.forEach(entry => {
      if (!sentimentByCoin[entry.moneda]) {
        sentimentByCoin[entry.moneda] = {
          symbol: entry.moneda,
          totalScore: 0,
          totalMentions: 0,
          count: 0,
          latestSentiment: entry.analisis.veredicto
        };
      }

      sentimentByCoin[entry.moneda].totalScore += entry.analisis.puntaje;
      sentimentByCoin[entry.moneda].totalMentions += entry.analisis.menciones;
      sentimentByCoin[entry.moneda].count += 1;
    });

    // Calcular promedios y convertir a formato del predictor
    const results = Object.values(sentimentByCoin).map(coin => ({
      symbol: coin.symbol,
      sentimentScore: coin.totalScore / coin.count,
      mentions: Math.round(coin.totalMentions / coin.count),
      sentiment: coin.latestSentiment === 'BULLISH 🚀' ? 'BULLISH' :
                coin.latestSentiment === 'BEARISH 📉' ? 'BEARISH' : 'NEUTRAL'
    }));

    console.log(`   └─ Usando datos de ${results.length} monedas del historial`);
    return results;

  } catch (error) {
    console.error('Error leyendo datos de sentimientos:', error.message);
    return [];
  }
}

// Función para calcular score de potencial
function calculatePotentialScore(technical, sentiment, coingecko) {
  let score = 0;
  let factors = [];

  // Factor técnico (35% del score)
  if (technical) {
    if (technical.signal === 'BULLISH') {
      score += 35;
      factors.push('Señal técnica BULLISH');
    } else if (technical.signal === 'BEARISH') {
      score -= 15;
      factors.push('Señal técnica BEARISH');
    }

    if (technical.rsi < 30) {
      score += 20;
      factors.push('RSI oversold (<30)');
    } else if (technical.rsi < 40) {
      score += 10;
      factors.push('RSI neutral-bajista');
    } else if (technical.rsi > 70) {
      score -= 10;
      factors.push('RSI overbought (>70)');
    }

    if (technical.momentum7d > 0.05) {
      score += 15;
      factors.push('Momentum 7d fuerte (+5%+)');
    } else if (technical.momentum7d > 0.02) {
      score += 8;
      factors.push('Momentum 7d positivo');
    }

    if (technical.priceChange > 0.03) {
      score += 10;
      factors.push('Movimiento reciente alcista');
    }
  }

  // Factor de sentimientos (30% del score)
  if (sentiment) {
    if (sentiment.sentiment === 'BULLISH') {
      score += 30;
      factors.push('Sentimiento muy positivo');
    } else if (sentiment.sentimentScore > 1) {
      score += 15;
      factors.push('Sentimiento positivo');
    } else if (sentiment.sentiment === 'BEARISH') {
      score -= 15;
      factors.push('Sentimiento negativo');
    }

    if (sentiment.mentions > 30) {
      score += 10;
      factors.push('Alta cobertura mediática');
    } else if (sentiment.mentions > 10) {
      score += 5;
      factors.push('Cobertura mediática moderada');
    }
  }

  // Factor de mercado (25% del score)
  if (coingecko) {
    if (coingecko.rank <= 50) {
      score += 15;
      factors.push(`Top ${coingecko.rank} por market cap`);
    } else if (coingecko.rank <= 100) {
      score += 8;
      factors.push(`Top 100 por market cap`);
    }

    if (coingecko.priceChange24h > 5) {
      score += 10;
      factors.push('Subida 24h >5%');
    } else if (coingecko.priceChange24h > 2) {
      score += 5;
      factors.push('Subida 24h >2%');
    }

    // Bonus por volumen relativo al market cap
    const volumeRatio = coingecko.volume24h / coingecko.marketCap;
    if (volumeRatio > 0.1) {
      score += 8;
      factors.push('Alto volumen de trading');
    } else if (volumeRatio > 0.05) {
      score += 4;
      factors.push('Volumen de trading saludable');
    }
  }

  // Factor de momentum a largo plazo (10% del score)
  if (technical && technical.momentum30d > 0.1) {
    score += 10;
    factors.push('Trend 30d muy positivo');
  } else if (technical && technical.momentum30d > 0.05) {
    score += 5;
    factors.push('Trend 30d positivo');
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

// Función principal
async function predictTopCoins() {
  console.log('🔮 PREDICTOR DE MONEDAS CON POTENCIAL DE SUBIDA\n');

  console.log('📊 Obteniendo datos técnicos de Binance...');
  const technicalData = await getTechnicalData();

  console.log('📰 Analizando sentimientos de noticias (datos cacheados)...');
  const sentimentData = await getSentimentData();

  console.log('💰 Obteniendo datos de mercado de CoinGecko...');
  const coingeckoData = await getCoinGeckoData();

  console.log('🧮 Calculando scores de potencial...\n');

  // Combinar datos y calcular scores
  const predictions = [];

  // Para monedas con datos técnicos (BTC, ETH, etc.)
  technicalData.forEach(tech => {
    const sentiment = sentimentData.find(s => s.symbol === tech.symbol);
    const coingecko = coingeckoData.find(c => c.symbol === tech.symbol);
    const { score, factors } = calculatePotentialScore(tech, sentiment, coingecko);

    predictions.push({
      symbol: tech.symbol,
      score: score,
      factors: factors,
      technical: tech,
      sentiment: sentiment,
      coingecko: coingecko,
      category: 'technical'
    });
  });

  // Para monedas del top 100 de CoinGecko con sentimientos
  coingeckoData.forEach(coin => {
    if (!technicalData.find(t => t.symbol === coin.symbol)) {
      const sentiment = sentimentData.find(s => s.symbol === coin.symbol);
      const { score, factors } = calculatePotentialScore(null, sentiment, coin);

      if (score > 20) { // Solo incluir si tienen score decente
        predictions.push({
          symbol: coin.symbol,
          score: score,
          factors: factors,
          technical: null,
          sentiment: sentiment,
          coingecko: coin,
          category: 'market'
        });
      }
    }
  });

  // Ordenar por score descendente
  predictions.sort((a, b) => b.score - a.score);

  // Mostrar top 15
  console.log('🏆 TOP 15 MONEDAS CON MAYOR POTENCIAL DE SUBIDA:\n');

  predictions.slice(0, 15).forEach((pred, index) => {
    const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : ` ${index + 1}.`;
    console.log(`${medal} ${pred.symbol.padEnd(6)} | Score: ${pred.score.toFixed(1).padStart(5)} | ${pred.category.toUpperCase()}`);
    console.log(`   └─ Factores: ${pred.factors.join(' • ')}`);

    if (pred.coingecko) {
      console.log(`   └─ Market Cap Rank: #${pred.coingecko.rank} | 24h Change: ${pred.coingecko.priceChange24h?.toFixed(2)}%`);
    }

    if (pred.technical) {
      console.log(`   └─ RSI: ${pred.technical.rsi?.toFixed(1).padStart(5)} | Momentum 7d: ${(pred.technical.momentum7d * 100)?.toFixed(1).padStart(5)}%`);
    }

    if (pred.sentiment) {
      console.log(`   └─ Sentimiento: ${pred.sentiment.sentiment.padEnd(8)} | Menciones: ${pred.sentiment.mentions}`);
    }

    console.log('');
  });

  console.log('💡 Recomendaciones:');
  console.log('   • Monitorea las top 3 monedas de cerca');
  console.log('   • Combina con análisis fundamental antes de invertir');
  console.log('   • Considera diversificar en diferentes categorías');
  console.log('   • Revisa volumen de trading antes de entrar');
  console.log('\n⚠️  IMPORTANTE: Esto no es asesoramiento financiero.');
  console.log('   El mercado crypto es altamente volátil y riesgoso.');
  console.log('   Siempre investiga y nunca inviertas más de lo que puedes perder.');
}

predictTopCoins().catch(console.error);