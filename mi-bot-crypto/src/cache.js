const cache = new Map();

function obtenerCache(llave) {
  const item = cache.get(llave);
  if (item && Date.now() < item.expira) return item.valor;
  return null;
}

function guardarCache(llave, valor, mins) {
  cache.set(llave, { valor, expira: Date.now() + (mins * 60 * 1000) });
}

module.exports = { obtenerCache, guardarCache };