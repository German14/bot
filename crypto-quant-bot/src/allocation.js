export function allocate(ranking, capital) {
    const core = ranking.filter(c => ["BTC", "ETH"].includes(c.symbol));
    const asym = ranking.filter(c => !["BTC", "ETH"].includes(c.symbol));

    const allocation = [];
    const coreCapital = capital * 0.6;
    const asymCapital = capital * 0.4;

    core.forEach(c => {
      allocation.push({
        coin: c.symbol,
        usd: coreCapital / core.length
      });
    });

    asym.slice(0, 3).forEach(c => {
      allocation.push({
        coin: c.symbol,
        usd: asymCapital / 3
      });
    });

    return allocation;
  }
