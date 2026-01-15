#!/usr/bin/env node

/**
 * 🚀 QUICK START - Sistema de Reportes HTML Crypto
 * 
 * Este archivo contiene los comandos más útiles para empezar
 * Ejecuta desde la carpeta mi-bot-crypto
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🚀 QUICK START - SISTEMA DE REPORTES HTML            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📌 PASOS MÁS RÁPIDOS PARA EMPEZAR:
═══════════════════════════════════════════════════════════════

PASO 1️⃣  - Generar un reporte AHORA:
  $ npm run market-report

  ✅ Genera un archivo HTML con datos del mercado
  ✅ Tarda 2-3 segundos
  ✅ Se guarda en la carpeta actual


PASO 2️⃣  - Ver el reporte en navegador:
  $ npm run open-market

  ✅ Se abre automáticamente en tu navegador
  ✅ Muestra tablas de ganancias y pérdidas
  ✅ Análisis de volatilidad


PASO 3️⃣  - Ejecutar scheduler 24/7:
  $ npm run market-report-scheduler

  ✅ Genera reportes cada 60 minutos
  ✅ Funciona de fondo indefinidamente
  ✅ Presiona Ctrl+C para detener


═══════════════════════════════════════════════════════════════

💡 CASOS DE USO RECOMENDADOS:

1. PRIMER USO (5 minutos)
   ➜ npm run market-report
   ➜ npm run open-market
   ➜ Explora el reporte
   
2. USO DIARIO (1-2 minutos)
   ➜ npm run market-report
   ➜ npm run open-market
   ➜ Analiza y cierra
   
3. MONITOREO CONTINUO
   ➜ npm run market-report-scheduler
   ➜ Deja corriendo en otra ventana
   ➜ Actualiza automáticamente cada hora

═══════════════════════════════════════════════════════════════

📊 QUÉ ENCONTRARÁS EN CADA REPORTE:

✅ TABLAS DE GANANCIAS
   Últimas 24h + Últimos 7 días
   Ordenadas por mayor ganancia
   Con ranking 🥇 🥈 🥉

✅ TABLAS DE PÉRDIDAS
   Últimas 24h + Últimos 7 días
   Ordenadas de mayor a menor caída
   Ranking completo

✅ ESTADÍSTICAS
   Cuántas monedas ganan/pierden
   Sumas totales
   Promedios

✅ VOLATILIDAD
   Alto y bajo de la semana
   % de volatilidad
   Volumen de trading

═══════════════════════════════════════════════════════════════

🎯 PRÓXIMOS PASOS SUGERIDOS:

□ Ejecuta: npm run market-report
□ Abre el reporte en navegador
□ Lee la documentación: REPORTE_HTML_README.md
□ Prueba el scheduler: npm run market-report-scheduler
□ Integra con otros bots (opcional)

═══════════════════════════════════════════════════════════════

📁 ARCHIVOS GENERADOS:

Cada reporte se guarda como:
  reporte_mercado_[timestamp].html
  
Ejemplo:
  reporte_mercado_1768501872893.html
  reporte_mercado_1768502472891.html
  
Los puedes abrir en cualquier navegador offline.

═══════════════════════════════════════════════════════════════

⚙️ CONFIGURACIÓN (OPCIONAL):

Cambiar intervalo del scheduler (por defecto 60 min):

  $env:REPORT_INTERVAL_MINUTES=30; npm run market-report-scheduler

Esto genera reportes cada 30 minutos en lugar de 60.

═══════════════════════════════════════════════════════════════

❓ PREGUNTAS FRECUENTES:

P: ¿Necesito API keys?
R: No, todo es público.

P: ¿Funciona offline?
R: La generación necesita internet, pero luego puedes ver
   los reportes offline.

P: ¿Qué monedas se incluyen?
R: 14 principales: BTC, ETH, SOL, LINK, AVAX, ADA, DOT,
   MATIC, LTC, BCH, XLM, XRP, TRX, BNB

P: ¿Puedo cambiar monedas?
R: Sí, edita el array "markets" en reporte_html.js

P: ¿Qué tan preciso es?
R: Es informativo, no para trading automático.
   Lee el disclaimer en cada reporte.

═══════════════════════════════════════════════════════════════

🔗 COMANDOS COMPLETOS DISPONIBLES:

npm run market-report              ← Generar reporte una vez
npm run market-report-scheduler    ← Scheduler 24/7
npm run open-market                ← Abrir último reporte
npm run predict                    ← Predictor técnico
npm run predict-scheduler          ← Predictor 24/7
npm start                          ← Bot de sentimientos

═══════════════════════════════════════════════════════════════

⚡ PIPELINE COMPLETO (recomendado):

Terminal 1:
  $ npm run market-report-scheduler

Terminal 2:
  $ npm run predict-scheduler

Terminal 3:
  $ npm start

Esto te da análisis completo 24/7.

═══════════════════════════════════════════════════════════════

📞 SOPORTE:

• Lee: REPORTE_HTML_README.md
• Ve: demo_reporte.js
• Código bien comentado en reporte_html.js

═══════════════════════════════════════════════════════════════

✨ ¡YA ESTÁS LISTO! 

Comando para empezar AHORA:

  npm run market-report && npm run open-market

═══════════════════════════════════════════════════════════════
`);
