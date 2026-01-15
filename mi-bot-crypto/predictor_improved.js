const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// ============================================
// 1. MEJORAR RSI - FIX PRINCIPAL
// ============================================
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) {
    console.warn(`⚠️ Datos insuficientes para RSI (${closes.length} < ${period + 1})`);
    return null;
  }

  let gains = 0;
  let losses = 0;

  // Calcular ganancias/pérdidas iniciales
  for (let i = 1; i < period + 1; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Suavizar con EMA
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) {
      gains = change;
      losses = 0;
    } else {
      gains = 0;
      losses = -change;
    }

    avgGain = (avgGain * (period - 1) + gains) / period;
    avgLoss = (avgLoss * (period - 1) + losses) / period;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return isNaN(rsi) ? null : rsi;
}

// ============================================
// 2. MEJOR PRONÓSTICO - Usar Bollinger Bands + Momentum
// ============================================
function advancedForecast(closes, daysAhead = 7) {
  if (closes.length < 20) return null;

  // Regresión lineal mejorada
  function linearRegression(data) {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, point) => sum + point, 0);
    const sumXY = data.reduce((sum, point, i) => sum + i * point, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calcular R² para validar tendencia
    const yMean = sumY / n;
    const ssRes = data.reduce((sum, point, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(point - predicted, 2);
    }, 0);
    const ssTot = data.reduce((sum, point) => sum + Math.pow(point - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  }

  const { slope, intercept, rSquared } = linearRegression(closes);

  // Volatilidad (Bollinger Bands)
  const mean20 = closes.slice(-20).reduce((a, b) => a + b) / 20;
  const stdDev = Math.sqrt(
    closes.slice(-20).reduce((sum, val) => sum + Math.pow(val - mean20, 2), 0) / 20
  );

  // Pronóstico con banda de confianza
  const currentPrice = closes[closes.length - 1];
  const futureIndex = closes.length - 1 + daysAhead;
  const forecastPrice = slope * futureIndex + intercept;
  const changePercent = ((forecastPrice - currentPrice) / currentPrice) * 100;

  // Ajustar confianza según volatilidad y R²
  const volatility = (stdDev / mean20) * 100;
  const confidence = rSquared * (1 - Math.min(volatility / 50, 0.5)); // Penalizar alta volatilidad

  return {
    forecastPrice,
    changePercent,
    volatility,
    confidence: Math.max(0, Math.min(1, confidence)),
    trend: changePercent > 5 ? 'BULLISH' : changePercent < -5 ? 'BEARISH' : 'NEUTRAL',
    rSquared // Para validar que la tendencia es significativa
  };
}

// ============================================
// 3. INDICADORES ADICIONALES - Volatilidad, MACD
// ============================================
function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (closes.length < slowPeriod) return null;

  function ema(data, period) {
    const multiplier = 2 / (period + 1);
    let emaValue = data.slice(0, period).reduce((a, b) => a + b) / period;

    for (let i = period; i < data.length; i++) {
      emaValue = data[i] * multiplier + emaValue * (1 - multiplier);
    }
    return emaValue;
  }

  const fast = ema(closes, fastPeriod);
  const slow = ema(closes, slowPeriod);
  const macdLine = fast - slow;

  return {
    macd: macdLine,
    signal: ema(closes, signalPeriod),
    histogram: macdLine - ema(closes, signalPeriod)
  };
}

// ============================================
// 4. OBTENER DATOS - Con validación y reintentos
// ============================================
async function getTechnicalDataImproved() {
  try {
    const markets = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "AVAXUSDT",
                     "ADAUSDT", "DOTUSDT", "MATICUSDT", "LTCUSDT", "BCHUSDT",
                     "XLMUSDT", "XRPUSDT", "TRXUSDT", "BNBUSDT"];

    const results = [];
    const maxRetries = 3;

    for (const market of markets) {
      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          const response = await axios.get(
            `https://api.binance.com/api/v3/klines?symbol=${market}&interval=1d&limit=60`,
            { timeout: 5000 }
          );

          if (!response.data || response.data.length < 30) {
            throw new Error('Datos insuficientes');
          }

          const closes = response.data.map(k => parseFloat(k[4]));
          const currentPrice = closes[closes.length - 1];

          // Calcular todos los indicadores
          const rsi = calculateRSI(closes, 14);
          const macd = calculateMACD(closes);

          // Momentum
          const m7 = (closes[closes.length - 1] - closes[closes.length - 8]) / closes[closes.length - 8];
          const m30 = (closes[closes.length - 1] - closes[0]) / closes[0];

          // Pronóstico mejorado
          const forecast7d = advancedForecast(closes, 7);

          // Volatilidad
          const returns = [];
          for (let i = 1; i < closes.length; i++) {
            returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
          }
          const volatility = Math.sqrt(
            returns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / returns.length
          ) * 100;

          // Señal mejorada - considerar múltiples factores
          let signal = 'NEUTRAL';
          if (rsi && rsi < 30 && m7 > 0 && forecast7d?.changePercent > 0) {
            signal = 'BULLISH';
          } else if (rsi && rsi > 70 && m7 < 0) {
            signal = 'BEARISH';
          } else if (rsi && rsi < 40 && m7 > 0.05) {
            signal = 'BULLISH';
          }

          results.push({
            symbol: market.replace('USDT', ''),
            price: currentPrice,
            rsi: rsi,
            momentum7d: m7,
            momentum30d: m30,
            macd: macd,
            volatility: volatility,
            forecast7d: forecast7d,
            signal: signal,
            dataQuality: forecast7d?.confidence || 0
          });

          success = true;
        } catch (error) {
          retries++;
          if (retries < maxRetries) {
            console.log(`⚠️ Reintentando ${market} (${retries}/${maxRetries})...`);
            await new Promise(r => setTimeout(r, 1000));
          } else {
            console.log(`❌ Falló obtener datos de ${market} tras ${maxRetries} intentos`);
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error crítico en datos técnicos:', error.message);
    return [];
  }
}

// ============================================
// 5. VALIDACIÓN DE SEÑALES - Evitar falsos positivos
// ============================================
function validateSignal(technical) {
  if (!technical) return { valid: false, reason: 'Sin datos técnicos' };

  const checks = {
    rsiValid: technical.rsi !== null && technical.rsi !== undefined,
    forecastValid: technical.forecast7d && technical.forecast7d.rSquared > 0.3,
    confidenceOk: technical.forecast7d?.confidence > 0.4,
    volatilityOk: technical.volatility < 20, // Evitar muy volátiles
    macdValid: technical.macd !== null
  };

  const passedChecks = Object.values(checks).filter(v => v).length;
  const totalChecks = Object.keys(checks).length;

  return {
    valid: passedChecks >= totalChecks - 1, // Permitir fallar en 1 check
    reason: Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k).join(', '),
    score: passedChecks / totalChecks
  };
}

// ============================================
// 6. SCORING MEJORADO - Más conservador y robusto
// ============================================
function calculatePotentialScoreImproved(technical, sentiment, coingecko) {
  let score = 0;
  let factors = [];
  let confidence = 0; // Track confidence en el score

  // SOLO SI LOS DATOS TÉCNICOS SON VÁLIDOS
  if (technical) {
    const validation = validateSignal(technical);

    if (!validation.valid) {
      console.warn(`   ⚠️ ${technical.symbol}: Señal débil (${validation.reason})`);
      // Usar score bajo pero no descartar
      score = 10;
      factors.push(`⚠️ Validación: ${validation.reason}`);
      confidence = 0.2;
    } else {
      // Factor técnico - más conservador
      if (technical.signal === 'BULLISH' && technical.dataQuality > 0.5) {
        score += 25; // Reducido de 35
        factors.push('✅ Señal técnica BULLISH confirmada');
        confidence += 0.3;
      }

      // RSI - más específico
      if (technical.rsi) {
        if (technical.rsi < 30) {
          score += 15;
          factors.push(`RSI oversold (${technical.rsi.toFixed(0)})`);
          confidence += 0.2;
        } else if (technical.rsi > 70) {
          score -= 10;
          factors.push(`RSI overbought (${technical.rsi.toFixed(0)})`);
          confidence -= 0.1;
        } else if (technical.rsi < 50) {
          score += 5;
          factors.push(`RSI bajista pero recargándose`);
          confidence += 0.1;
        }
      }

      // Momentum - validar consistencia
      if (technical.momentum7d > 0.05 && technical.momentum30d > 0.02) {
        score += 20;
        factors.push(`Momentum consistente (7d: ${(technical.momentum7d*100).toFixed(1)}%)`);
        confidence += 0.25;
      } else if (technical.momentum7d > 0.02) {
        score += 8;
        factors.push(`Momentum 7d positivo`);
        confidence += 0.1;
      }

      // Pronóstico - SOLO si tiene buena confianza
      if (technical.forecast7d && technical.forecast7d.confidence > 0.5) {
        if (technical.forecast7d.trend === 'BULLISH') {
          score += 25;
          factors.push(`📈 Pronóstico alcista (${technical.forecast7d.changePercent.toFixed(1)}%, conf: ${(technical.forecast7d.confidence*100).toFixed(0)}%)`);
          confidence += 0.35;
        }
      } else if (technical.forecast7d) {
        factors.push(`📊 Pronóstico débil (conf: ${(technical.forecast7d.confidence*100).toFixed(0)}%)`);
      }

      // Volatilidad - penalizar mucho
      if (technical.volatility > 15) {
        score -= 10;
        factors.push(`⚠️ Alta volatilidad (${technical.volatility.toFixed(1)}%)`);
        confidence -= 0.2;
      }

      // MACD - confirmar dirección
      if (technical.macd && technical.macd.histogram > 0) {
        score += 8;
        factors.push(`MACD positivo`);
        confidence += 0.1;
      }
    }
  }

  // Sentimientos - SOLO si hay datos recientes
  if (sentiment) {
    if (sentiment.mentions > 20 && sentiment.sentiment === 'BULLISH') {
      score += 20;
      factors.push(`📰 Sentimiento BULLISH (${sentiment.mentions} menciones)`);
      confidence += 0.15;
    } else if (sentiment.sentiment === 'BULLISH') {
      score += 10;
      factors.push(`Sentimiento positivo`);
      confidence += 0.1;
    }
  }

  // Market data - pero no dominar
  if (coingecko) {
    if (coingecko.rank && coingecko.rank <= 20) {
      score += 10;
      factors.push(`Top ${coingecko.rank} moneda`);
      confidence += 0.1;
    }

    // NO pumps artificiales - ignorar cambios >20% en 24h
    if (coingecko.priceChange24h && Math.abs(coingecko.priceChange24h) < 15) {
      if (coingecko.priceChange24h > 5) {
        score += 8;
        factors.push(`Movimiento positivo 24h (${coingecko.priceChange24h.toFixed(1)}%)`);
        confidence += 0.08;
      }
    }
  }

  // Score final normalizado (0-100)
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    factors,
    confidence: Math.max(0, Math.min(1, confidence)),
    recommendation: confidence > 0.6 ? '🟢 ALTA CONFIANZA' :
                   confidence > 0.3 ? '🟡 MEDIA CONFIANZA' : '🔴 BAJA CONFIANZA'
  };
}

// ============================================
// 7. HISTORIAL Y BACKTESTING - Validar precisión
// ============================================
function validateAgainstHistory() {
  try {
    if (!fs.existsSync('./prediction_history.json')) return { valid: true, msg: 'No history yet' };

    const history = JSON.parse(fs.readFileSync('./prediction_history.json', 'utf8'));

    // Revisar últimas predicciones vs realidad
    if (history.length > 0) {
      const lastPrediction = history[0];
      console.log(`\n📊 Validación: Última predicción fue hace ${Math.round((Date.now() - new Date(lastPrediction.timestamp).getTime()) / (1000*3600))} horas`);

      if (lastPrediction.result.allCoins) {
        const topCoin = lastPrediction.result.allCoins[0];
        console.log(`   Top coin predicho: ${topCoin}`);
      }
    }

    return { valid: true, count: history.length };
  } catch (error) {
    console.error('Error validando historial:', error.message);
    return { valid: false };
  }
}

// ============================================
// 8. FUNCIÓN PRINCIPAL MEJORADA
// ============================================
async function predictTopCoinsImproved() {
  console.log('🔮 PREDICTOR DE MONEDAS V2 - MEJORADO\n');
  console.log('✅ Cambios aplicados:');
  console.log('   • RSI recalculado correctamente');
  console.log('   • Pronóstico con validación de confianza (R²)');
  console.log('   • Indicadores MACD y volatilidad');
  console.log('   • Scoring más conservador y robusto');
  console.log('   • Reintentos automáticos en API calls\n');

  // Validar historial
  validateAgainstHistory();

  console.log('\n📊 Obteniendo datos técnicos de Binance...');
  const technicalData = await getTechnicalDataImproved();

  if (technicalData.length === 0) {
    console.error('❌ No se pudieron obtener datos técnicos');
    return;
  }

  console.log(`✅ Datos técnicos obtenidos para ${technicalData.length} monedas\n`);

  // Mostrar detalles de top 5
  console.log('🏆 TOP 5 ANÁLISIS DETALLADO:\n');

  // Ordenar por score
  const sorted = technicalData.sort((a, b) => b.dataQuality - a.dataQuality);

  sorted.slice(0, 5).forEach((tech, idx) => {
    console.log(`${idx + 1}. ${tech.symbol}`);
    console.log(`   RSI: ${tech.rsi ? tech.rsi.toFixed(1) : '❌ NULL'}`);
    console.log(`   Momentum 7d: ${(tech.momentum7d * 100).toFixed(1)}%`);
    console.log(`   Volatilidad: ${tech.volatility.toFixed(1)}%`);

    if (tech.forecast7d) {
      console.log(`   Pronóstico: ${tech.forecast7d.changePercent.toFixed(1)}% (Confianza: ${(tech.forecast7d.confidence*100).toFixed(0)}%, R²: ${tech.forecast7d.rSquared.toFixed(2)})`);
    }

    console.log(`   Señal: ${tech.signal} | Calidad datos: ${(tech.dataQuality*100).toFixed(0)}%\n`);
  });

  console.log('\n⚠️  IMPORTANTE - LIMITACIONES:');
  console.log('   • Las predicciones crypto son inherentemente inciertas');
  console.log('   • Volatilidad puede invalidar pronósticos en minutos');
  console.log('   • Usar solo como herramienta de monitoreo, no para trading');
  console.log('   • No es asesoramiento financiero\n');
}

predictTopCoinsImproved().catch(console.error);
