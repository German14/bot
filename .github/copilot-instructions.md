# Crypto Bots Codebase - AI Agent Instructions

## Architecture Overview

This workspace contains two complementary cryptocurrency analysis bots:

### mi-bot-crypto (Sentiment Analysis Bot)
- **Purpose**: Real-time sentiment monitoring using news and social media
- **Data Sources**: CoinGecko API (prices), NewsData API (news), sentiment analysis
- **Storage**: File-based JSON storage (`historial.json`)
- **Entry Point**: `index.js` - runs every 60 seconds monitoring configured coins

### crypto-quant-bot (Quantitative Trading Bot)
- **Purpose**: Technical analysis and portfolio allocation using indicators
- **Data Sources**: Binance API (klines/candlestick data)
- **Indicators**: RSI(14), EMA(12/26), momentum calculations
- **Allocation**: 60% BTC/ETH core, 40% top 3 altcoins by score

## Key Patterns & Conventions

### Configuration Management
- Use `config.json` for monitored coins with `{id, simbolo, keywords}` structure
- Full CoinGecko coin list embedded in `config.json` as `lista_coingecko` field
- `monedas_a_monitorear` contains all ~19,000 CoinGecko coins with auto-generated keywords
- Keywords auto-generated as "Coin Name, SYMBOL" for each coin
- Cache TTL configured in minutes (`cache_tiempo_minutos: 15`)

### API Integration Patterns
```javascript
// Rate limit handling - return null on 429, don't crash
if (error.response?.status === 429) {
  console.warn(`⚠️ Rate limit hit. Skipping...`);
  return null;
}
```

### Caching Strategy
- In-memory Map with TTL for API responses
- File-based cache for expensive operations (6-hour TTL)
- Cache keys: API endpoints or computed results

### Data Flow
1. **mi-bot-crypto**: Price fetch → News analysis → Sentiment scoring → JSON append
2. **crypto-quant-bot**: Klines fetch → Indicator calculation → Signal generation → Allocation

### CLI Tools
- `npm run download` downloads CoinGecko list and embeds in config.json
- `npm run add` launches interactive coin adder using embedded CoinGecko list
- `npm run predict` runs comprehensive analysis to identify coins with upside potential
- `npm run predict-scheduler` runs predictor automatically every 15 minutes
- `npm run show-history` displays prediction history and trend analysis
- Validates symbols against embedded list before adding to config

### Prediction Engine
- `predictor.js` combines technical, sentiment, and market data for scoring
- `predictor_scheduler.js` runs predictor automatically every 15 minutes
- Saves prediction history to `prediction_history.json` for trend analysis
- Technical factors: RSI, momentum, price signals from Binance
- Sentiment factors: News analysis using NewsData API
- Market factors: Market cap rank, 24h change, trading volume
- Composite scoring algorithm weights multiple indicators
- Outputs top 15 coins with highest upside potential

### Error Handling
- Graceful degradation: Return null/fallback values instead of crashing
- Detailed error messages for API key issues (401 responses)
- Continue processing other coins if one fails

### Output Formatting
- Console clearing for fresh displays
- Emoji indicators: 🚀 bullish, 📉 bearish, ⚖️ neutral
- Table formatting for quantitative data
- Real-time progress updates with stdout manipulation

## Development Workflow

### Adding New Coins
```bash
# 1. Download CoinGecko list and embed in config (one-time)
npm run download

# 2. Interactive addition
npm run add
```

### Running Bots
```bash
# Sentiment bot (continuous monitoring)
npm start

# Quant bot (single analysis run)
node src/index.js
```

### Key Files to Reference
- `mi-bot-crypto/config.json` - monitored coins configuration
- `crypto-quant-bot/src/indicators/` - technical analysis implementations
- `mi-bot-crypto/src/scanner.js` - sentiment analysis logic
- `crypto-quant-bot/src/allocation.js` - portfolio allocation algorithm

## Integration Points
- **External APIs**: CoinGecko, NewsData, Binance (no authentication required)
- **Environment**: `.env` files for API keys (GECKO_API_KEY, NewsData hardcoded)
- **Data Exchange**: JSON files for persistence, no databases
- **Cross-bot**: Independent execution, could be combined for hybrid signals</content>
<parameter name="filePath">d:\GIT\bot\.github\copilot-instructions.md