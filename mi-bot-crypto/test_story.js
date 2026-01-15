const axios = require('axios');

(async () => {
  try {
    console.log('Obteniendo datos de story-2...\n');
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/story-2?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
    const coin = response.data;
    
    console.log(`Nombre: ${coin.name}`);
    console.log(`Símbolo: ${coin.symbol?.toUpperCase()}`);
    console.log(`Rank: ${coin.market_cap_rank}`);
    console.log(`Market Cap: $${coin.market_data?.market_cap?.usd?.toLocaleString()}`);
    console.log(`24h Change: ${coin.market_data?.price_change_percentage_24h?.toFixed(2)}%`);
    console.log(`24h Volume: $${coin.market_data?.total_volume?.usd?.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
