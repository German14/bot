const fs = require('fs');

function guardarEnHistorial(datos) {
  const path = './historial.json';
  let json = [];
  if (fs.existsSync(path)) json = JSON.parse(fs.readFileSync(path));
  json.push(datos);
  fs.writeFileSync(path, JSON.stringify(json, null, 2));
}

module.exports = { guardarEnHistorial };