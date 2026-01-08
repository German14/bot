const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
  const reportPath = path.join(__dirname, 'prediction_report.html');
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).send(`
      <h1>Reporte no encontrado</h1>
      <p>Ejecuta primero: <code>npm run generate-report</code></p>
      <a href="/generate">Generar Reporte</a>
    `);
  }
});

// Ruta para regenerar el reporte
app.get('/generate', (req, res) => {
  const { spawn } = require('child_process');
  const generateProcess = spawn('node', ['generate_report.js'], { cwd: __dirname });

  generateProcess.on('close', (code) => {
    if (code === 0) {
      res.redirect('/');
    } else {
      res.status(500).send('Error generando el reporte');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de reportes iniciado en http://localhost:${PORT}`);
  console.log(`📊 Abre tu navegador en: http://localhost:${PORT}`);
  console.log(`🔄 Para actualizar datos: http://localhost:${PORT}/generate`);
});