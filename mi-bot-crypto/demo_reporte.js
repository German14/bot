#!/usr/bin/env node

/**
 * DEMO - Mostrar cómo usar los reportes HTML
 * Ejecuta: node demo_reporte.js
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        📊 DEMO - SISTEMA DE REPORTES HTML CRYPTO              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

const commands = {
  "1": {
    title: "📈 Generar reporte una sola vez",
    command: "npm run market-report",
    description: "Genera un reporte HTML inmediatamente"
  },
  "2": {
    title: "⏰ Iniciar scheduler (reportes cada hora)",
    command: "npm run market-report-scheduler",
    description: "Genera reportes automáticamente cada 60 minutos"
  },
  "3": {
    title: "🌐 Abrir último reporte en navegador",
    command: "npm run open-market",
    description: "Abre el reporte HTML más reciente"
  },
  "4": {
    title: "📋 Ver archivos de reportes generados",
    command: "ls reporte_mercado_*.html",
    description: "Lista todos los reportes disponibles"
  },
  "5": {
    title: "🔄 Predictor + Reporte (pipeline completo)",
    command: "npm run predict && npm run market-report",
    description: "Ejecuta predictor Y genera reporte"
  },
  "6": {
    title: "🧹 Limpiar reportes anteriores",
    command: "Remove-Item reporte_mercado_*.html -Exclude @()",
    description: "Elimina todos los reportes (CUIDADO)"
  }
};

console.log("📌 OPCIONES DISPONIBLES:\n");

Object.entries(commands).forEach(([key, cmd]) => {
  console.log(`  ${key}. ${cmd.title}`);
  console.log(`     └─ ${cmd.description}`);
  console.log(`     └─ $ ${cmd.command}\n`);
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                       CARACTERÍSTICAS                          ║
╚════════════════════════════════════════════════════════════════╝

✅ TABLAS DE GANANCIAS
   • Últimas 24 horas (ordenadas por mayor ganancia)
   • Últimos 7 días (ordenadas por mayor ganancia)
   • Ranking con 🥇 🥈 🥉 para top 3
   • Total de ganancias sumadas

✅ TABLAS DE PÉRDIDAS
   • Últimas 24 horas (ordenadas por mayor caída)
   • Últimos 7 días (ordenadas por mayor caída)
   • Ranking de posiciones
   • Total de pérdidas sumadas

✅ ESTADÍSTICAS RESUMIDAS
   • Cantidad de monedas ganando/perdiendo
   • Suma total de cambios
   • Promedios de cambios (24h y 7d)

✅ ANÁLISIS DE VOLATILIDAD
   • Alto y bajo de la semana para cada moneda
   • Porcentaje de volatilidad
   • Volumen de trading 24h

✅ DISEÑO PROFESIONAL
   • Responsive (móvil, tablet, desktop)
   • Colores: Verde (ganancias), Rojo (pérdidas)
   • Tablas interactivas con hover
   • Estilos modernos con gradientes

╔════════════════════════════════════════════════════════════════╗
║                       MONEDAS MONITOREADAS                     ║
╚════════════════════════════════════════════════════════════════╝

🪙 BTC (Bitcoin)       🪙 LINK (Chainlink)
🪙 ETH (Ethereum)      🪙 AVAX (Avalanche)
🪙 SOL (Solana)        🪙 ADA (Cardano)
🪙 DOT (Polkadot)      🪙 MATIC (Polygon)
🪙 LTC (Litecoin)      🪙 BCH (Bitcoin Cash)
🪙 XLM (Stellar)       🪙 XRP (Ripple)
🪙 TRX (Tron)          🪙 BNB (Binance Coin)

╔════════════════════════════════════════════════════════════════╗
║                         EJEMPLO DE SALIDA                      ║
╚════════════════════════════════════════════════════════════════╝

✅ Reporte guardado: reporte_mercado_1768501872893.html

📊 Resumen:
   Ganancias 24h: 1 monedas (+1.35%)
   Pérdidas 24h:  13 monedas (-39.43%)
   Ganancias 7d:  9 monedas (+32.42%)
   Pérdidas 7d:   5 monedas (-20.68%)

📂 Abre: reporte_mercado_1768501872893.html en tu navegador

╔════════════════════════════════════════════════════════════════╗
║                       CONFIGURACIÓN AVANZADA                   ║
╚════════════════════════════════════════════════════════════════╝

📝 Archivo .env:
   REPORT_INTERVAL_MINUTES=60  (cambiar intervalo del scheduler)

🔧 Ejecutar con intervalo personalizado:
   $env:REPORT_INTERVAL_MINUTES=30; npm run market-report-scheduler

📋 Scripts disponibles en package.json:
   • npm run market-report            (generar 1 reporte)
   • npm run market-report-scheduler  (scheduler 24/7)
   • npm run open-market              (abrir último reporte)

╔════════════════════════════════════════════════════════════════╗
║                           GUÍA RÁPIDA                          ║
╚════════════════════════════════════════════════════════════════╝

🚀 FLUJO TÍPICO:

1. Generar reporte inicial:
   $ npm run market-report

2. Ver el reporte en navegador:
   $ npm run open-market

3. Iniciar scheduler para actualizaciones cada hora:
   $ npm run market-report-scheduler

4. Dejar ejecutándose 24/7 para análisis continuo

💡 TIPS:

• Los reportes se guardan en la carpeta actual
• Cada reporte tiene timestamp único en el nombre
• Los datos vienen de Binance API (tiempo real)
• Se actualizan cada 24 horas en Binance
• No requiere autenticación con API keys

⚠️  IMPORTANTE:

• No es asesoramiento financiero
• Use solo para propósitos informativos
• Las criptos son altamente volátiles
• Siempre investigue antes de invertir

╔════════════════════════════════════════════════════════════════╗
║                         PRÓXIMOS PASOS                         ║
╚════════════════════════════════════════════════════════════════╝

Selecciona una opción (1-6) o escribe el comando directamente.

Ejemplos:
  $ npm run market-report
  $ npm run market-report-scheduler
  $ npm run open-market

Presiona Ctrl+C en cualquier momento para cancelar.

`);

// Información de archivos existentes
const reportFiles = fs.readdirSync('./').filter(f => f.startsWith('reporte_mercado_') && f.endsWith('.html'));

if (reportFiles.length > 0) {
  console.log(`📁 ${reportFiles.length} reportes existentes:\n`);
  reportFiles
    .sort()
    .reverse()
    .slice(0, 3)
    .forEach(f => {
      const stat = fs.statSync(f);
      const size = (stat.size / 1024).toFixed(1);
      const time = new Date(stat.mtime).toLocaleString('es-ES');
      console.log(`   • ${f} (${size}KB) - ${time}`);
    });
  if (reportFiles.length > 3) {
    console.log(`   ... y ${reportFiles.length - 3} más`);
  }
  console.log();
}

console.log("💬 Para más ayuda, consulta REPORTE_HTML_README.md\n");
