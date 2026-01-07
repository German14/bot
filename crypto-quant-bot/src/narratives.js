export const NARRATIVES = {
    AI: ["ai", "artificial intelligence", "compute", "gpu"],
    RWA: ["real world assets", "tokenization"],
    INFRA: ["oracle", "data feeds", "infrastructure"],
    L2: ["layer 2", "rollup", "scaling"]
  };

  export function classifyNarrative(text = "") {
    const scores = {};
    const lower = text.toLowerCase();

    for (const [n, keys] of Object.entries(NARRATIVES)) {
      let hits = 0;
      keys.forEach(k => {
        if (lower.includes(k)) hits++;
      });
      scores[n] = hits / keys.length;
    }
    return scores;
  }
