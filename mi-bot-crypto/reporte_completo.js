const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

// ============================================
// CONFIG DE MONEDAS A MONITOREAR
// ============================================
const CONFIG_FILE = './monedas_config.json';

function loadOrCreateConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Error leyendo config, usando default');
    }
  }

  // Config por defecto - 25 monedas (más opciones de ganancias)
  const defaultConfig = {
    markets: [
      "BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "AVAXUSDT", 
      "ADAUSDT", "DOTUSDT", "MATICUSDT", "LTCUSDT", "BCHUSDT", 
      "XLMUSDT", "XRPUSDT", "TRXUSDT", "BNBUSDT", "DYDXUSDT",
      "UNIUSDT", "AAVEUSD", "OPUSDT", "ARBUSDT", "SUIUSDT",
      "ORDERUSDT", "INJUSDT", "KASUSDT", "WIFUSDT", "GMTUSDT"
    ],
    lastUpdated: new Date().toISOString(),
    version: "1.0"
  };

  saveConfig(defaultConfig);
  return defaultConfig;
}

function saveConfig(config) {
  config.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log('💾 Configuración de monedas actualizada');
}

// ============================================
// OBTENER DATOS DE MERCADO MEJORADO
// ============================================
async function getMarketDataWithRetry(markets, maxRetries = 3) {
  console.log(`\n📊 Obteniendo datos de ${markets.length} monedas...\n`);

  const coinsData = [];
  let successful = 0;
  let failed = 0;

  for (const market of markets) {
    let retries = 0;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${market}&interval=1d&limit=7`,
          { timeout: 5000 }
        );

        if (!response.data || response.data.length < 7) {
          throw new Error('Datos insuficientes');
        }

        const symbol = market.replace('USDT', '').replace('USD', '');
        const closes = response.data.map(k => parseFloat(k[4]));
        const volumes = response.data.map(k => parseFloat(k[7]));

        // Cambio 24h
        const change24h = ((closes[6] - closes[5]) / closes[5]) * 100;
        const volume24h = volumes[6];

        // Cambio 7d
        const change7d = ((closes[6] - closes[0]) / closes[0]) * 100;

        // Precio actual
        const currentPrice = closes[6];

        // Alto y Bajo de la semana
        const high7d = Math.max(...closes);
        const low7d = Math.min(...closes);
        const volatility7d = ((high7d - low7d) / low7d) * 100;

        coinsData.push({
          symbol,
          price: currentPrice,
          change24h,
          change7d,
          high7d,
          low7d,
          volatility: volatility7d,
          volume24h,
          type: change24h >= 0 ? 'GANANCIA' : 'PÉRDIDA'
        });

        successful++;
        success = true;
        process.stdout.write(`\r✅ Procesadas: ${successful + failed}/${markets.length}`);

      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          failed++;
          process.stdout.write(`\r⚠️ Procesadas: ${successful + failed}/${markets.length}`);
        } else {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }
  }

  console.log(`\n✅ Datos obtenidos exitosamente: ${successful}/${markets.length}\n`);
  return coinsData;
}

// ============================================
// SEPARAR DATOS - MEJORADO
// ============================================
function separateByType(coinsData) {
  const gains24h = coinsData.filter(c => c.change24h >= 0).sort((a, b) => b.change24h - a.change24h);
  const losses24h = coinsData.filter(c => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);

  const gains7d = coinsData.filter(c => c.change7d >= 0).sort((a, b) => b.change7d - a.change7d);
  const losses7d = coinsData.filter(c => c.change7d < 0).sort((a, b) => a.change7d - b.change7d);

  return {
    gains24h,
    losses24h,
    gains7d,
    losses7d,
    total: coinsData.length,
    avgChange24h: (coinsData.reduce((sum, c) => sum + c.change24h, 0) / coinsData.length).toFixed(2),
    avgChange7d: (coinsData.reduce((sum, c) => sum + c.change7d, 0) / coinsData.length).toFixed(2),
    ratio24h: `${gains24h.length}/${losses24h.length}`,
    ratio7d: `${gains7d.length}/${losses7d.length}`
  };
}

// ============================================
// GENERAR HTML MEJORADO
// ============================================
function generateHtmlReport(data, timestamp) {
  const totalGains24h = data.gains24h.length;
  const totalLosses24h = data.losses24h.length;
  const totalGains7d = data.gains7d.length;
  const totalLosses7d = data.losses7d.length;

  const sumGains24h = data.gains24h.reduce((sum, c) => sum + c.change24h, 0);
  const sumLosses24h = data.losses24h.reduce((sum, c) => sum + c.change24h, 0);
  const sumGains7d = data.gains7d.reduce((sum, c) => sum + c.change7d, 0);
  const sumLosses7d = data.losses7d.reduce((sum, c) => sum + c.change7d, 0);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Mercado Crypto - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            padding: 25px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
            text-align: center;
        }
        .stat-card.gains { border-left-color: #28a745; }
        .stat-card.losses { border-left-color: #dc3545; }
        .stat-card h3 { font-size: 0.85em; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        .stat-value { font-size: 1.8em; font-weight: bold; }
        .stat-value.positive { color: #28a745; }
        .stat-value.negative { color: #dc3545; }
        .content { padding: 25px; }
        .section { margin-bottom: 35px; }
        .section-title { font-size: 1.6em; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #667eea; }
        .tables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 15px; }
        .table-wrapper { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .table-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; font-weight: bold; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #dee2e6; }
        td { padding: 10px; border-bottom: 1px solid #dee2e6; }
        tr:hover { background: #f8f9fa; }
        .symbol { font-weight: bold; color: #667eea; }
        .price { font-family: 'Courier New', monospace; font-weight: 500; }
        .change { font-weight: bold; text-align: right; }
        .change.positive { color: #28a745; background: #d4edda; border-radius: 5px; padding: 3px 8px; }
        .change.negative { color: #dc3545; background: #f8d7da; border-radius: 5px; padding: 3px 8px; }
        .rank { text-align: center; font-weight: bold; color: #667eea; background: #f0f3ff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; font-size: 0.9em; }
        .total-row { background: #f0f3ff; font-weight: bold; border-top: 2px solid #667eea; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .badge-gain { background: #d4edda; color: #155724; }
        .badge-loss { background: #f8d7da; color: #721c24; }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.8em; }
            .stats-grid { grid-template-columns: 1fr; gap: 10px; }
            .tables-grid { grid-template-columns: 1fr; }
            table { font-size: 0.9em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte Completo de Mercado Crypto</h1>
            <p>${timestamp} | Monitoreo de ${data.total} activos</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card gains">
                <h3>💹 Ganancias 24h</h3>
                <div class="stat-value positive">${totalGains24h}</div>
                <small>+${sumGains24h.toFixed(2)}%</small>
            </div>
            <div class="stat-card losses">
                <h3>📉 Pérdidas 24h</h3>
                <div class="stat-value negative">${totalLosses24h}</div>
                <small>${sumLosses24h.toFixed(2)}%</small>
            </div>
            <div class="stat-card gains">
                <h3>💹 Ganancias 7d</h3>
                <div class="stat-value positive">${totalGains7d}</div>
                <small>+${sumGains7d.toFixed(2)}%</small>
            </div>
            <div class="stat-card losses">
                <h3>📉 Pérdidas 7d</h3>
                <div class="stat-value negative">${totalLosses7d}</div>
                <small>${sumLosses7d.toFixed(2)}%</small>
            </div>
            <div class="stat-card">
                <h3>📊 Ratio 24h</h3>
                <div class="stat-value">${data.ratio24h}</div>
                <small>Ganancias/Pérdidas</small>
            </div>
            <div class="stat-card">
                <h3>📊 Ratio 7d</h3>
                <div class="stat-value">${data.ratio7d}</div>
                <small>Ganancias/Pérdidas</small>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2 class="section-title">🚀 Monedas en SUBIDA</h2>
                <div class="tables-grid">
                    <div class="table-wrapper">
                        <div class="table-header">📈 Ganancias Últimas 24h (${totalGains24h})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    <th>Moneda</th>
                                    <th>Precio</th>
                                    <th>Cambio 24h</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.gains24h.length > 0 ? data.gains24h.map((coin, idx) => `
                                    <tr>
                                        <td><span class="rank">${idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}</span></td>
                                        <td><span class="symbol">${coin.symbol}</span></td>
                                        <td><span class="price">$${coin.price.toFixed(4)}</span></td>
                                        <td><span class="change positive">+${coin.change24h.toFixed(2)}%</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change positive">+${sumGains24h.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="table-wrapper">
                        <div class="table-header">📈 Ganancias Últimos 7 Días (${totalGains7d})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    <th>Moneda</th>
                                    <th>Precio</th>
                                    <th>Cambio 7d</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.gains7d.length > 0 ? data.gains7d.map((coin, idx) => `
                                    <tr>
                                        <td><span class="rank">${idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}</span></td>
                                        <td><span class="symbol">${coin.symbol}</span></td>
                                        <td><span class="price">$${coin.price.toFixed(4)}</span></td>
                                        <td><span class="change positive">+${coin.change7d.toFixed(2)}%</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change positive">+${sumGains7d.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">📉 Monedas en PÉRDIDA</h2>
                <div class="tables-grid">
                    <div class="table-wrapper">
                        <div class="table-header">📉 Pérdidas Últimas 24h (${totalLosses24h})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    <th>Moneda</th>
                                    <th>Precio</th>
                                    <th>Cambio 24h</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.losses24h.length > 0 ? data.losses24h.map((coin, idx) => `
                                    <tr>
                                        <td><span class="rank">${idx + 1}</span></td>
                                        <td><span class="symbol">${coin.symbol}</span></td>
                                        <td><span class="price">$${coin.price.toFixed(4)}</span></td>
                                        <td><span class="change negative">${coin.change24h.toFixed(2)}%</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change negative">${sumLosses24h.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="table-wrapper">
                        <div class="table-header">📉 Pérdidas Últimos 7 Días (${totalLosses7d})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 40px;">#</th>
                                    <th>Moneda</th>
                                    <th>Precio</th>
                                    <th>Cambio 7d</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.losses7d.length > 0 ? data.losses7d.map((coin, idx) => `
                                    <tr>
                                        <td><span class="rank">${idx + 1}</span></td>
                                        <td><span class="symbol">${coin.symbol}</span></td>
                                        <td><span class="price">$${coin.price.toFixed(4)}</span></td>
                                        <td><span class="change negative">${coin.change7d.toFixed(2)}%</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change negative">${sumLosses7d.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">⚖️ Análisis de Volatilidad</h2>
                <div class="table-wrapper">
                    <div class="table-header">Todas las Monedas Ordenadas por Volatilidad</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Moneda</th>
                                <th>Precio</th>
                                <th>Alto 7d</th>
                                <th>Bajo 7d</th>
                                <th>Volatilidad</th>
                                <th>24h</th>
                                <th>Volumen 24h</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.gains24h.concat(data.losses24h).sort((a, b) => b.volatility - a.volatility).map((coin, idx) => `
                                <tr>
                                    <td><span class="symbol">${coin.symbol}</span></td>
                                    <td><span class="price">$${coin.price.toFixed(4)}</span></td>
                                    <td>$${coin.high7d.toFixed(4)}</td>
                                    <td>$${coin.low7d.toFixed(4)}</td>
                                    <td><strong>${coin.volatility.toFixed(2)}%</strong></td>
                                    <td><span class="change ${coin.change24h >= 0 ? 'positive' : 'negative'}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</span></td>
                                    <td>$${(coin.volume24h / 1000000).toFixed(1)}M</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>💡 Reporte generado: ${new Date().toLocaleString('es-ES')}</p>
            <p>📌 Monedas monitoreadas: ${data.total} | ⚠️ No es asesoramiento financiero</p>
            <p>Datos en tiempo real desde Binance API</p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

// ============================================
// FUNCIÓN PRINCIPAL INTEGRADA
// ============================================
async function generateCompleteReport() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('🔄 GENERADOR DE REPORTES CON ACTUALIZACIÓN DE MONEDAS');
  console.log(`${'='.repeat(70)}\n`);

  // 1. Cargar o crear configuración
  console.log('📋 Cargando configuración de monedas...');
  const config = loadOrCreateConfig();
  console.log(`✅ ${config.markets.length} monedas configuradas\n`);

  // 2. Obtener datos con reintentos
  const coinsData = await getMarketDataWithRetry(config.markets);

  if (coinsData.length === 0) {
    console.error('❌ No se pudieron obtener datos de ninguna moneda');
    return;
  }

  // 3. Separar datos
  console.log('\n📊 Analizando datos...');
  const data = separateByType(coinsData);

  // 4. Timestamp
  const timestamp = new Date().toLocaleString('es-ES');

  // 5. Generar HTML
  console.log('🎨 Generando reporte HTML...');
  const html = generateHtmlReport(data, timestamp);

  // 6. Guardar reporte
  const filename = `reporte_completo_${Date.now()}.html`;
  fs.writeFileSync(filename, html);

  // 7. Guardar snapshot de datos en JSON
  const dataSnapshot = {
    timestamp,
    stats: {
      totalMonedas: data.total,
      ganancias24h: data.gains24h.length,
      perdidas24h: data.losses24h.length,
      ganancias7d: data.gains7d.length,
      perdidas7d: data.losses7d.length,
      ratio24h: data.ratio24h,
      ratio7d: data.ratio7d,
      promedio24h: data.avgChange24h,
      promedio7d: data.avgChange7d
    },
    topGains24h: data.gains24h.slice(0, 5).map(c => ({ symbol: c.symbol, change: c.change24h })),
    topLosses24h: data.losses24h.slice(0, 5).map(c => ({ symbol: c.symbol, change: c.change24h })),
    allCoins: coinsData
  };

  const jsonFilename = `snapshot_${Date.now()}.json`;
  fs.writeFileSync(jsonFilename, JSON.stringify(dataSnapshot, null, 2));

  // 8. Mostrar resumen
  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ REPORTE GENERADO EXITOSAMENTE');
  console.log(`${'='.repeat(70)}\n`);

  console.log('📈 RESUMEN:');
  console.log(`   Total de monedas: ${data.total}`);
  console.log(`   Ganancias 24h: ${data.gains24h.length} monedas (+${data.gains24h.reduce((s, c) => s + c.change24h, 0).toFixed(2)}%)`);
  console.log(`   Pérdidas 24h:  ${data.losses24h.length} monedas (${data.losses24h.reduce((s, c) => s + c.change24h, 0).toFixed(2)}%)`);
  console.log(`   Ganancias 7d:  ${data.gains7d.length} monedas (+${data.gains7d.reduce((s, c) => s + c.change7d, 0).toFixed(2)}%)`);
  console.log(`   Pérdidas 7d:   ${data.losses7d.length} monedas (${data.losses7d.reduce((s, c) => s + c.change7d, 0).toFixed(2)}%)`);

  console.log(`\n🏆 TOP 5 GANANCIAS 24h:`);
  data.gains24h.slice(0, 5).forEach((coin, i) => {
    const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `  `;
    console.log(`   ${medal} ${coin.symbol.padEnd(6)} +${coin.change24h.toFixed(2)}%`);
  });

  console.log(`\n📉 TOP 5 PÉRDIDAS 24h:`);
  data.losses24h.slice(0, 5).forEach((coin, i) => {
    console.log(`   ${i + 1}. ${coin.symbol.padEnd(6)} ${coin.change24h.toFixed(2)}%`);
  });

  console.log(`\n📁 ARCHIVOS GENERADOS:`);
  console.log(`   📄 HTML: ${filename}`);
  console.log(`   📊 JSON: ${jsonFilename}`);
  console.log(`   📂 Config: ${CONFIG_FILE}`);

  console.log(`\n📂 Archivos generados:`);
  console.log(`   📄 HTML: ${filename}`);
  console.log(`   📊 JSON: ${jsonFilename}`);

  console.log(`\n${'='.repeat(70)}\n`);

  // Abrir automáticamente en el navegador
  openBrowser(filename);

  return { filename, jsonFilename };
}

// ============================================
// ABRIR NAVEGADOR
// ============================================
function openBrowser(filename) {
  const absolutePath = fs.realpathSync(filename);
  const command = process.platform === 'win32' 
    ? `start "" "${absolutePath}"` 
    : process.platform === 'darwin' 
    ? `open "${absolutePath}"` 
    : `xdg-open "${absolutePath}"`;
  
  exec(command, (error) => {
    if (error) {
      console.error('❌ Error abriendo navegador:', error);
      console.log(`📂 Abre manualmente: ${filename}`);
    } else {
      console.log('🌐 Abriendo reporte en navegador...\n');
    }
  });
}

// Ejecutar
generateCompleteReport().catch(console.error);
