const axios = require('axios');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

async function analizarTendencia(keyword) {
  try {
    // Usamos encodeURIComponent para que palabras con espacios no rompan la URL
    const query = encodeURIComponent(keyword);
    const apiKey = "pub_e58c19436dc646ee90dcc52459102f9a";

    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${query}&language=en`;

    const res = await axios.get(url);

    // NewsData usa "results" para los artículos
    const articles = res.data.results || [];

    if (articles.length === 0) {
      return { menciones: 0, puntaje: 0, veredicto: "SIN NOTICIAS" };
    }

    let scoreTotal = 0;
    articles.forEach(a => {
      const text = `${a.title || ''} ${a.description || ''}`;
      const analysis = sentiment.analyze(text);
      scoreTotal += analysis.score;
    });

    return {
      menciones: res.data.totalResults || articles.length,
      puntaje: scoreTotal,
      veredicto: scoreTotal > 2 ? "BULLISH 🚀" : (scoreTotal < -2 ? "BEARISH 📉" : "NEUTRAL ⚖️")
    };
  } catch (error) {
    // Si sigue dando 401, imprimimos el error detallado
    if (error.response && error.response.status === 401) {
      console.error("❌ Error 401: La API Key de NewsData no es válida o aún no está activa.");
    } else {
      console.error("❌ Error en NewsData:", error.message);
    }
    return { menciones: 0, puntaje: 0, veredicto: "ERROR" };
  }
}

module.exports = { analizarTendencia };