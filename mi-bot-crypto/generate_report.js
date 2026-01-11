const fs = require('fs');
const path = require('path');

function generateHTMLReport() {
  const historyFile = './prediction_history.json';

  if (!fs.existsSync(historyFile)) {
    console.log('❌ No existe historial de predicciones');
    return;
  }

  try {
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));

    // Calcular estadísticas
    const totalPredictions = history.length;
    const successfulPredictions = history.filter(p => p.result.success).length;
    const successRate = ((successfulPredictions / totalPredictions) * 100).toFixed(1);

    // Análisis de tendencias
    const coinStats = {};
    history.forEach(entry => {
      if (entry.result.success) {
        const coins = entry.result.allCoins || entry.result.top3 || [];
        coins.forEach(line => {
          const match = line.match(/(?:🥇|🥈|🥉|\d+\.)\s+(\w+)\s+\|\s+Score:\s+(\d+\.\d+)/);
          if (match) {
            const symbol = match[1];
            const score = parseFloat(match[2]);

            if (!coinStats[symbol]) {
              coinStats[symbol] = {
                count: 0,
                scores: [],
                maxScore: 0,
                avgScore: 0
              };
            }

            coinStats[symbol].count++;
            coinStats[symbol].scores.push(score);
            coinStats[symbol].maxScore = Math.max(coinStats[symbol].maxScore, score);
          }
        });
      }
    });

    // Calcular promedios
    Object.keys(coinStats).forEach(symbol => {
      const stats = coinStats[symbol];
      stats.avgScore = stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length;
    });

    // Ordenar monedas por frecuencia
    const topCoins = Object.entries(coinStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 20);

    // Generar HTML
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Historial de Predicciones Crypto</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><i class="fas fa-chart-line"></i> Historial de Predicciones Crypto</h1>
            <p class="subtitle">Análisis automático de monedas con potencial de subida</p>
            <div class="last-update">
                <i class="fas fa-clock"></i> Última actualización: ${new Date().toLocaleString('es-ES')}
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${totalPredictions}</div>
                    <div class="stat-label">Predicciones Totales</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${successRate}%</div>
                    <div class="stat-label">Tasa de Éxito</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${Object.keys(coinStats).length}</div>
                    <div class="stat-label">Monedas Analizadas</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${topCoins.length}</div>
                    <div class="stat-label">Monedas en Ranking</div>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="predictions-section">
                <h2><i class="fas fa-history"></i> Historial de Predicciones (${history.length})</h2>

                <div class="predictions-scroll-container">
                ${history.map((entry, index) => `
                    <div class="prediction-card ${entry.result.success ? 'success' : 'error'}">
                        <div class="prediction-header">
                            <div class="prediction-title">
                                <i class="fas fa-${entry.result.success ? 'check-circle' : 'exclamation-triangle'}"></i>
                                Predicción ${index + 1}
                            </div>
                            <div class="prediction-date">
                                <i class="fas fa-calendar"></i>
                                ${new Date(entry.result.timestamp).toLocaleString('es-ES')}
                            </div>
                        </div>

                        ${entry.result.success ? `
                            <div class="prediction-content">
                                <div class="prediction-coins-scroll">
                                    <div class="coins-list">
                                        ${(entry.result.allCoins || entry.result.top3 || []).map((line, coinIndex) => {
                                            const match = line.match(/(?:🥇|🥈|🥉|\d+\.)\s+(\w+)\s+\|\s+Score:\s+(\d+\.\d+)\s+\|\s+(\w+)(?:\s+\|\s+Forecast:\s+([+-]?\d+\.\d+)%?)?/);
                                            if (match) {
                                                const [, symbol, score, category, forecast] = match;
                                                const scoreNum = parseFloat(score);
                                                const forecastNum = forecast ? parseFloat(forecast) : null;
                                                return `
                                                    <div class="coin-item ${scoreNum >= 50 ? 'high-score' : scoreNum >= 30 ? 'medium-score' : 'low-score'}">
                                                        <div class="coin-rank">#${coinIndex + 1}</div>
                                                        <div class="coin-symbol">${symbol}</div>
                                                        <div class="coin-score">${score}</div>
                                                        <div class="coin-category">${category}</div>
                                                        ${forecast ? `<div class="coin-forecast ${forecastNum > 0 ? 'positive' : forecastNum < 0 ? 'negative' : ''}">📈 ${forecast}%</div>` : ''}
                                                    </div>
                                                `;
                                            }
                                            return '';
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="prediction-error">
                                <i class="fas fa-exclamation-triangle"></i>
                                Error: ${entry.result.error || 'Error desconocido'}
                            </div>
                        `}
                    </div>
                `).join('')}
                </div>
            </div>

            <div class="latest-prediction-section">
                <h2><i class="fas fa-clock"></i> Última Predicción</h2>
                <p class="section-subtitle">Análisis detallado de la predicción más reciente (${history[0] ? new Date(history[0].result.timestamp).toLocaleString('es-ES') : 'N/A'})</p>
                <p class="section-note"><i class="fas fa-info-circle"></i> Para información detallada completa (RSI, momentum, sentimiento, etc.), consulta la sección de Historial de Predicciones más abajo.</p>

                ${history[0] && history[0].result.success ? `
                    <div class="latest-prediction-table-container">
                        <table class="latest-prediction-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Moneda</th>
                                    <th>Score</th>
                                    <th>Categoría</th>
                                    <th>Pronóstico 7d</th>
                                    <th>Factores</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(history[0].result.allCoins || history[0].result.top3 || []).map((line, coinIndex) => {
                                    const match = line.match(/(?:🥇|🥈|🥉|\d+\.)\s+(\w+)\s+\|\s+Score:\s+(\d+\.\d+)\s+\|\s+(\w+)(?:\s+\|\s+Forecast:\s+([+-]?\d+\.\d+)%?)?/);
                                    if (match) {
                                        const [, symbol, score, category, forecast] = match;
                                        const scoreNum = parseFloat(score);
                                        const forecastNum = forecast ? parseFloat(forecast) : null;
                                        
                                        // Extraer factores de la línea siguiente si existe
                                        let factors = 'Ver historial para detalles';
                                        if (history[0].result.allCoins && history[0].result.allCoins.length > coinIndex + 1) {
                                            const nextLine = history[0].result.allCoins[coinIndex + 1];
                                            if (nextLine.includes('└─ Factores:')) {
                                                factors = nextLine.split('└─ Factores:')[1].trim();
                                            }
                                        }
                                        
                                        return `
                                            <tr class="${scoreNum >= 50 ? 'high-score' : scoreNum >= 30 ? 'medium-score' : 'low-score'}">
                                                <td class="rank">${coinIndex + 1}</td>
                                                <td class="symbol"><strong>${symbol}</strong></td>
                                                <td class="score">${score}</td>
                                                <td class="category">${category}</td>
                                                <td class="forecast ${forecastNum > 0 ? 'positive' : forecastNum < 0 ? 'negative' : ''}">${forecast ? `${forecast}%` : 'N/A'}</td>
                                                <td class="factors">${factors}</td>
                                            </tr>
                                        `;
                                    }
                                    return '';
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="no-data">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No hay datos de predicción disponibles</p>
                    </div>
                `}
            </div>

            <div class="trends-section">
                <h2><i class="fas fa-chart-line"></i> Análisis de Tendencias</h2>

                <div class="trends-content">
                    <div class="trend-chart">
                        <h3>Monedas Más Frecuentes</h3>
                        <div class="coins-ranking">
                            ${topCoins.map(([symbol, stats], index) => `
                                <div class="ranking-item">
                                    <div class="ranking-position">${index + 1}</div>
                                    <div class="ranking-coin">
                                        <div class="coin-name">${symbol}</div>
                                        <div class="coin-stats">
                                            <span class="stat">${stats.count} veces</span>
                                            <span class="stat">Ø ${stats.avgScore.toFixed(1)}</span>
                                            <span class="stat">↑ ${stats.maxScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div class="ranking-bar">
                                        <div class="bar-fill" style="width: ${(stats.count / topCoins[0][1].count) * 100}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="insights">
                        <h3><i class="fas fa-lightbulb"></i> Insights</h3>
                        <div class="insights-list">
                            <div class="insight-item">
                                <i class="fas fa-star"></i>
                                <span><strong>${topCoins[0]?.[0] || 'N/A'}</strong> es la moneda más consistente con ${topCoins[0]?.[1]?.count || 0} apariciones</span>
                            </div>
                            <div class="insight-item">
                                <i class="fas fa-chart-line"></i>
                                <span>Score promedio más alto: <strong>${Math.max(...Object.values(coinStats).map(s => s.avgScore)).toFixed(1)}</strong></span>
                            </div>
                            <div class="insight-item">
                                <i class="fas fa-coins"></i>
                                <span>Total de monedas analizadas: <strong>${Object.keys(coinStats).length}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4><i class="fas fa-robot"></i> Sobre el Sistema</h4>
                    <p>Análisis automático que combina datos técnicos, sentimentales y de mercado para identificar monedas con potencial de subida.</p>
                </div>
                <div class="footer-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Descargo de Responsabilidad</h4>
                    <p>Esta información no constituye asesoramiento financiero. El mercado crypto es altamente volátil. Investiga siempre antes de invertir.</p>
                </div>
                <div class="footer-section">
                    <h4><i class="fas fa-code"></i> Tecnologías</h4>
                    <p>Node.js • CoinGecko API • Binance API • NewsData API</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Crypto Prediction Bot. Generado automáticamente.</p>
            </div>
        </footer>
    </div>

    <script>
        // Auto-refresh cada 5 minutos
        setTimeout(() => {
            if (confirm('¿Recargar página para ver datos actualizados?')) {
                location.reload();
            }
        }, 5 * 60 * 1000);
    </script>
</body>
</html>`;

    // Generar CSS
    const css = `
/* Reset y variables */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    --background-color: #f8fafc;
    --card-background: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --border-radius: 12px;
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, var(--background-color) 0%, #e2e8f0 100%);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header */
.header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
}

.header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.header .subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.last-update {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--primary-color);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: var(--card-background);
    padding: 24px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: var(--transition);
    border: 2px solid transparent;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.stat-icon.success {
    background: linear-gradient(135deg, var(--success-color), #34d399);
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 4px;
}

.stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Main Content */
.main-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
}

@media (min-width: 1024px) {
    .main-content {
        grid-template-columns: 1fr 1fr;
    }
}

/* Predictions Section */
.predictions-section h2,
.trends-section h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.prediction-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    margin-bottom: 20px;
    overflow: hidden;
    transition: var(--transition);
}

.prediction-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px -3px rgba(0, 0, 0, 0.12);
}

.prediction-card.success {
    border-left: 4px solid var(--success-color);
}

.prediction-card.error {
    border-left: 4px solid var(--error-color);
}

.prediction-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.prediction-title {
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.prediction-date {
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
}

.prediction-content {
    padding: 24px;
}

.coins-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.coin-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: var(--transition);
}

.coin-item:hover {
    background: #f1f5f9;
    transform: translateX(2px);
}

.coin-item.high-score {
    border-color: var(--success-color);
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.coin-item.medium-score {
    border-color: var(--warning-color);
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.coin-item.low-score {
    border-color: var(--secondary-color);
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.coin-rank {
    font-weight: 600;
    color: var(--primary-color);
    min-width: 30px;
}

.coin-symbol {
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
}

.coin-score {
    font-weight: 700;
    color: var(--primary-color);
    min-width: 50px;
    text-align: right;
}

.coin-category {
    font-size: 0.8rem;
    color: var(--text-secondary);
    background: var(--border-color);
    padding: 2px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.prediction-error {
    padding: 24px;
    color: var(--error-color);
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Trends Section */
.trends-content {
    display: grid;
    gap: 30px;
}

.trend-chart h3,
.insights h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.coins-ranking {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ranking-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: var(--transition);
}

.ranking-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ranking-position {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), #3b82f6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
}

.ranking-coin {
    flex: 1;
}

.coin-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.coin-stats {
    display: flex;
    gap: 12px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.coin-stats .stat {
    background: var(--border-color);
    padding: 2px 8px;
    border-radius: 12px;
}

.ranking-bar {
    width: 120px;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), #3b82f6);
    border-radius: 4px;
    transition: width 0.3s ease;
}

/* Insights */
.insights-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.insight-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
}

.insight-item i {
    color: var(--primary-color);
    margin-top: 2px;
}

.insight-item strong {
    color: var(--primary-color);
}

/* Footer */
.footer {
    margin-top: 60px;
    padding: 40px 0 20px;
    border-top: 1px solid var(--border-color);
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    margin-bottom: 30px;
}

.footer-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.footer-section p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }

    .header h1 {
        font-size: 2rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .main-content {
        grid-template-columns: 1fr;
    }

    .prediction-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .coins-list {
        grid-template-columns: 1fr;
    }

    .coin-item {
        padding: 10px 12px;
    }

    .ranking-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .ranking-bar {
        width: 100%;
        height: 6px;
    }
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.prediction-card,
.stat-card,
.ranking-item {
    animation: fadeIn 0.5s ease-out;
}

/* Loading states */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: var(--background-color);
}

::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}
`;

    // Escribir archivos
    fs.writeFileSync('./prediction_report.html', html);

    // Solo escribir CSS si no existe (para preservar cambios manuales)
    const cssPath = './styles.css';
    if (!fs.existsSync(cssPath)) {
      fs.writeFileSync(cssPath, css);
      console.log('   • styles.css (creado)');
    } else {
      console.log('   • styles.css (existente preservado)');
    }

    console.log('✅ Reporte HTML generado exitosamente!');
    console.log('📁 Archivos procesados:');
    console.log('   • prediction_report.html');
    console.log('\n🌐 Abre prediction_report.html en tu navegador para ver el reporte completo.');
    console.log('\n💡 Los cambios en styles.css se preservan entre regeneraciones.');

  } catch (error) {
    console.error('❌ Error generando reporte HTML:', error.message);
  }
}

generateHTMLReport();