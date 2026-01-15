const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config();

// ============================================
// SCHEDULER MEJORADO PARA REPORTE COMPLETO
// ============================================

const INTERVAL_MINUTES = process.env.REPORT_INTERVAL_MINUTES || 60;
const MAX_REPORTS = process.env.MAX_REPORTS || 0; // 0 = ilimitados

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║    📊 SCHEDULER - REPORTE COMPLETO CON ACTUALIZACIÓN           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

⚙️ CONFIGURACIÓN:
   Intervalo: ${INTERVAL_MINUTES} minutos
   Reporte máximo: ${MAX_REPORTS === 0 ? 'Ilimitados' : MAX_REPORTS}
   Iniciado: ${new Date().toLocaleString('es-ES')}

Presiona Ctrl+C para detener

`);

let reportCount = 0;
let isRunning = false;

async function executeReport() {
  if (isRunning) {
    console.log('[⏳] Reporte anterior aún en ejecución...\n');
    return;
  }

  isRunning = true;
  reportCount++;

  console.log(`\n[${new Date().toLocaleTimeString('es-ES')}] 📊 Ejecutando reporte #${reportCount}...\n`);

  return new Promise((resolve) => {
    const process = spawn('node', ['reporte_completo.js']);
    
    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
      process.stderr.write(data);
    });

    process.on('close', (code) => {
      isRunning = false;

      if (code === 0) {
        console.log(`\n✅ Reporte #${reportCount} completado exitosamente`);
        
        // Limpiar reportes antiguos si hay más de 10
        cleanOldReports();
      } else {
        console.error(`\n❌ Error en reporte #${reportCount} (código: ${code})`);
      }

      // Calcular próxima ejecución
      const nextTime = new Date(Date.now() + INTERVAL_MINUTES * 60 * 1000);
      console.log(`\n⏰ Próximo reporte: ${nextTime.toLocaleTimeString('es-ES')} (${INTERVAL_MINUTES} min)`);

      resolve();
    });
  });
}

function cleanOldReports() {
  try {
    const files = fs.readdirSync('./')
      .filter(f => f.startsWith('reporte_completo_') && f.endsWith('.html'))
      .sort()
      .reverse();

    // Mantener solo los últimos 10 reportes
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(f => {
        try {
          fs.unlinkSync(f);
          console.log(`🗑️ Limpiado: ${f}`);
        } catch (e) {
          // Ignorar errores
        }
      });
    }

    // Limpiar snapshots también
    const snapshots = fs.readdirSync('./')
      .filter(f => f.startsWith('snapshot_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (snapshots.length > 10) {
      const snapshotsToDelete = snapshots.slice(10);
      snapshotsToDelete.forEach(f => {
        try {
          fs.unlinkSync(f);
        } catch (e) {
          // Ignorar errores
        }
      });
    }
  } catch (e) {
    // Ignorar errores de limpieza
  }
}

async function runScheduler() {
  // Ejecutar inmediatamente
  await executeReport();

  // Luego cada X minutos
  const intervalId = setInterval(async () => {
    if (MAX_REPORTS > 0 && reportCount >= MAX_REPORTS) {
      console.log(`\n✅ Se alcanzó el límite de ${MAX_REPORTS} reportes`);
      clearInterval(intervalId);
      process.exit(0);
    }

    await executeReport();
  }, INTERVAL_MINUTES * 60 * 1000);

  // Permitir salir con Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n\n👋 Scheduler detenido después de ${reportCount} reporte(s)`);
    clearInterval(intervalId);
    process.exit(0);
  });
}

// Ejecutar
runScheduler().catch(console.error);
