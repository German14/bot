import googleTrends from "google-trends-api";

export async function getTrend12M(keyword) {
  const res = await googleTrends.interestOverTime({
    keyword,
    startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  });

  const data = JSON.parse(res).default.timelineData;

  return data.map(d => Number(d.value[0]));
}
