const axios = require('axios');

(async () => {
  try {
    console.log('Buscando Story en CoinGecko...\n');
    const searchRes = await axios.get('https://api.coingecko.com/api/v3/search?query=story');
    console.log('Resultados de búsqueda Story:');
    searchRes.data.coins.slice(0, 10).forEach(coin => {
      console.log(`  - ${coin.name} (${coin.symbol?.toUpperCase()}) - ID: ${coin.id}`);
    });
    
    // Buscar también por IP
    console.log('\n\nBuscando IP en CoinGecko...\n');
    const searchRes2 = await axios.get('https://api.coingecko.com/api/v3/search?query=IP');
    console.log('Resultados de búsqueda IP:');
    searchRes2.data.coins.slice(0, 10).forEach(coin => {
      console.log(`  - ${coin.name} (${coin.symbol?.toUpperCase()}) - ID: ${coin.id}`);
    });

    // Intentar acceder directamente a storyip
    console.log('\n\nIntentando acceder a storyip directamente...');
    try {
      const r = await axios.get('https://api.coingecko.com/api/v3/coins/storyip');
      console.log(`✓ Encontrado: ${r.data.name} (${r.data.symbol}) - Rank: ${r.data.market_cap_rank}`);
    } catch (e) {
      console.log('✗ storyip no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
