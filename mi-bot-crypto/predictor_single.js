const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔮 EJECUCIÓN ÚNICA DE PREDICTOR PARA REPORTE\n');

// Archivo para guardar historial de predicciones
const HISTORY_FILE = './prediction_history.json';

// Función para guardar resultado en historial
function saveToHistory(result) {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (error) {
      console.log('⚠️ Error leyendo historial, creando nuevo archivo');
    }
  }

  // Mantener solo las últimas 100 predicciones
  history.unshift({
    timestamp: new Date().toISOString(),
    result: result
  });

  if (history.length > 100) {
    history = history.slice(0, 100);
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Función para ejecutar el predictor una sola vez
function runPredictorOnce() {
  const timestamp = new Date().toLocaleString();
  console.log(`🔮 Ejecutando predictor - ${timestamp}`);

  const predictor = spawn('node', ['predictor.js'], {
    stdio: 'pipe', // Capturar output en lugar de heredar
    cwd: __dirname
  });

  let output = '';
  let errorOutput = '';

  predictor.stdout.on('data', (data) => {
    output += data.toString();
    process.stdout.write(data); // Mostrar en tiempo real
  });

  predictor.stderr.on('data', (data) => {
    errorOutput += data.toString();
    process.stderr.write(data);
  });

  predictor.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Predictor completado exitosamente\n`);
      // Extraer todas las monedas del output, no solo top 3
      const lines = output.split('\n');
      const allCoins = lines.filter(line =>
        /^\s*\d+\.\s+\w+/.test(line.trim()) || // Formato: " 4. LINK   | Score:  34.0 | TECHNICAL"
        /^\s*🥇|🥈|🥉/.test(line.trim()) // Formato: "🥇 SOL    | Score:  79.0 | TECHNICAL"
      );

      saveToHistory({
        timestamp: timestamp,
        success: true,
        allCoins: allCoins,
        top3: allCoins.slice(0, 3), // Mantener compatibilidad
        fullOutput: output
      });

      console.log('📁 Historial actualizado exitosamente');
      process.exit(0); // Terminar el proceso

    } else {
      console.log(`❌ Error en predictor (código: ${code})\n`);
      saveToHistory({
        timestamp: timestamp,
        success: false,
        error: errorOutput
      });
      process.exit(1); // Terminar con error
    }
  });

  predictor.on('error', (error) => {
    console.error(`❌ Error ejecutando predictor:`, error.message);
    saveToHistory({
      timestamp: timestamp,
      success: false,
      error: error.message
    });
    process.exit(1);
  });
}

// Ejecutar una sola vez
runPredictorOnce();