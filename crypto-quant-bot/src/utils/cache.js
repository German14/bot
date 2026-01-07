import fs from "fs";

const CACHE_FILE = "./cache.json";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 horas

export function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE));
}

export function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export function getCached(cache, key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) return null;
  return entry.data;
}

export function setCached(cache, key, data) {
  cache[key] = {
    timestamp: Date.now(),
    data
  };
}
