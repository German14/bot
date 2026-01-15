const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// ============================================
// OBTENER DATOS DE CAMBIOS DIARIOS Y SEMANALES
// ============================================
async function getMarketData() {
  try {
    const markets = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "AVAXUSDT", 
                     "ADAUSDT", "DOTUSDT", "MATICUSDT", "LTCUSDT", "BCHUSDT", 
                     "XLMUSDT", "XRPUSDT", "TRXUSDT", "BNBUSDT"];

    const coinsData = [];

    for (const market of markets) {
      try {
        // Obtener velas de 1 día (últimos 7 días)
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${market}&interval=1d&limit=7`,
          { timeout: 5000 }
        );

        if (!response.data || response.data.length < 7) {
          console.log(`⚠️ Datos insuficientes para ${market}`);
          continue;
        }

        const symbol = market.replace('USDT', '');
        const closes = response.data.map(k => parseFloat(k[4]));
        const volumes = response.data.map(k => parseFloat(k[7]));

        // Cambio últimas 24h (vela más reciente vs día anterior)
        const change24h = ((closes[6] - closes[5]) / closes[5]) * 100;
        const volume24h = volumes[6];

        // Cambio últimos 7 días (hoy vs 7 días atrás)
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

      } catch (error) {
        console.log(`❌ Error obteniendo datos de ${market}: ${error.message}`);
      }
    }

    return coinsData;
  } catch (error) {
    console.error('Error en getMarketData:', error.message);
    return [];
  }
}

// ============================================
// SEPARAR DATOS EN GANANCIAS Y PÉRDIDAS
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
    avgChange7d: (coinsData.reduce((sum, c) => sum + c.change7d, 0) / coinsData.length).toFixed(2)
  };
}

// ============================================
// GENERAR HTML CON ESTILOS
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

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

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }

        .stat-card.gains {
            border-left-color: #28a745;
        }

        .stat-card.losses {
            border-left-color: #dc3545;
        }

        .stat-card h3 {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
        }

        .stat-value.positive {
            color: #28a745;
        }

        .stat-value.negative {
            color: #dc3545;
        }

        .content {
            padding: 30px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .tables-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
        }

        .table-wrapper {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .table-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            font-weight: bold;
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #dee2e6;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }

        tr:hover {
            background: #f8f9fa;
        }

        .symbol {
            font-weight: bold;
            color: #667eea;
        }

        .price {
            font-family: 'Courier New', monospace;
            font-weight: 500;
        }

        .change {
            font-weight: bold;
            text-align: right;
            min-width: 80px;
        }

        .change.positive {
            color: #28a745;
            background: #d4edda;
        }

        .change.negative {
            color: #dc3545;
            background: #f8d7da;
        }

        .rank {
            text-align: center;
            font-weight: bold;
            color: #667eea;
            background: #f0f3ff;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .medal {
            font-size: 1.5em;
        }

        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
            font-size: 0.9em;
        }

        .empty-message {
            text-align: center;
            padding: 30px;
            color: #999;
            font-size: 1.1em;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .tables-grid {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 0.9em;
            }

            th, td {
                padding: 8px;
            }
        }

        .total-row {
            background: #f0f3ff;
            font-weight: bold;
            border-top: 2px solid #667eea;
        }

        .total-row td {
            border-bottom: 2px solid #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte de Mercado Crypto</h1>
            <p>Análisis de ganancias y pérdidas - ${timestamp}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card gains">
                <h3>💹 Ganancias 24h</h3>
                <div class="stat-value positive">${totalGains24h} monedas</div>
                <small style="color: #28a745;">+${sumGains24h.toFixed(2)}% total</small>
            </div>
            
            <div class="stat-card losses">
                <h3>📉 Pérdidas 24h</h3>
                <div class="stat-value negative">${totalLosses24h} monedas</div>
                <small style="color: #dc3545;">${sumLosses24h.toFixed(2)}% total</small>
            </div>

            <div class="stat-card gains">
                <h3>💹 Ganancias 7d</h3>
                <div class="stat-value positive">${totalGains7d} monedas</div>
                <small style="color: #28a745;">+${sumGains7d.toFixed(2)}% total</small>
            </div>

            <div class="stat-card losses">
                <h3>📉 Pérdidas 7d</h3>
                <div class="stat-value negative">${totalLosses7d} monedas</div>
                <small style="color: #dc3545;">${sumLosses7d.toFixed(2)}% total</small>
            </div>

            <div class="stat-card">
                <h3>📈 Promedio 24h</h3>
                <div class="stat-value ${data.avgChange24h >= 0 ? 'positive' : 'negative'}">
                    ${data.avgChange24h >= 0 ? '+' : ''}${data.avgChange24h}%
                </div>
            </div>

            <div class="stat-card">
                <h3>📈 Promedio 7d</h3>
                <div class="stat-value ${data.avgChange7d >= 0 ? 'positive' : 'negative'}">
                    ${data.avgChange7d >= 0 ? '+' : ''}${data.avgChange7d}%
                </div>
            </div>
        </div>

        <div class="content">
            <!-- SECCIÓN GANANCIAS -->
            <div class="section">
                <h2 class="section-title">🚀 Monedas en SUBIDA</h2>
                <div class="tables-grid">
                    <!-- GANANCIAS 24h -->
                    <div class="table-wrapper">
                        <div class="table-header">📈 Ganancias Últimas 24h</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                `).join('') : '<tr><td colspan="4" class="empty-message">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change positive">+${sumGains24h.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- GANANCIAS 7d -->
                    <div class="table-wrapper">
                        <div class="table-header">📈 Ganancias Últimos 7 Días</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                `).join('') : '<tr><td colspan="4" class="empty-message">Sin datos</td></tr>'}
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

            <!-- SECCIÓN PÉRDIDAS -->
            <div class="section">
                <h2 class="section-title">📉 Monedas en PÉRDIDA</h2>
                <div class="tables-grid">
                    <!-- PÉRDIDAS 24h -->
                    <div class="table-wrapper">
                        <div class="table-header">📉 Pérdidas Últimas 24h</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                `).join('') : '<tr><td colspan="4" class="empty-message">Sin datos</td></tr>'}
                                <tr class="total-row">
                                    <td colspan="2">TOTAL</td>
                                    <td></td>
                                    <td><span class="change negative">${sumLosses24h.toFixed(2)}%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- PÉRDIDAS 7d -->
                    <div class="table-wrapper">
                        <div class="table-header">📉 Pérdidas Últimos 7 Días</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                `).join('') : '<tr><td colspan="4" class="empty-message">Sin datos</td></tr>'}
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

            <!-- TABLA COMPLETA DE VOLATILIDAD -->
            <div class="section">
                <h2 class="section-title">⚖️ Análisis de Volatilidad</h2>
                <div class="table-wrapper">
                    <div class="table-header">Volatilidad en la última semana (Alto-Bajo)</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Moneda</th>
                                <th>Precio Actual</th>
                                <th>Alto 7d</th>
                                <th>Bajo 7d</th>
                                <th>Volatilidad</th>
                                <th>Cambio 24h</th>
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
                                    <td>$${(coin.volume24h / 1000000).toFixed(2)}M</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>💡 Reporte generado: ${new Date().toLocaleString('es-ES')}</p>
            <p>⚠️ Datos obtenidos de Binance API | No es asesoramiento financiero</p>
        </div>
    </div>
</body>
</html>`;

  return html;
}

// ============================================
// FUNCIÓN PRINCIPAL - GENERAR Y GUARDAR REPORTE
// ============================================
async function generateReport() {
  console.log('📊 Generando reporte de mercado...\n');

  // Obtener datos
  console.log('📈 Obteniendo datos de precios de Binance...');
  const coinsData = await getMarketData();

  if (coinsData.length === 0) {
    console.error('❌ No se pudieron obtener datos');
    return;
  }

  console.log(`✅ Datos obtenidos para ${coinsData.length} monedas\n`);

  // Separar datos
  const data = separateByType(coinsData);

  // Timestamp formateado
  const timestamp = new Date().toLocaleString('es-ES');

  // Generar HTML
  console.log('🎨 Generando HTML...');
  const html = generateHtmlReport(data, timestamp);

  // Guardar archivo
  const filename = `reporte_mercado_${Date.now()}.html`;
  fs.writeFileSync(filename, html);

  console.log(`✅ Reporte guardado: ${filename}`);
  console.log(`\n📊 Resumen:`);
  console.log(`   Ganancias 24h: ${data.gains24h.length} monedas (+${data.gains24h.reduce((s, c) => s + c.change24h, 0).toFixed(2)}%)`);
  console.log(`   Pérdidas 24h:  ${data.losses24h.length} monedas (${data.losses24h.reduce((s, c) => s + c.change24h, 0).toFixed(2)}%)`);
  console.log(`   Ganancias 7d:  ${data.gains7d.length} monedas (+${data.gains7d.reduce((s, c) => s + c.change7d, 0).toFixed(2)}%)`);
  console.log(`   Pérdidas 7d:   ${data.losses7d.length} monedas (${data.losses7d.reduce((s, c) => s + c.change7d, 0).toFixed(2)}%)`);
  console.log(`\n📂 Abre: ${filename} en tu navegador\n`);

  return filename;
}

// Ejecutar
generateReport().catch(console.error);
