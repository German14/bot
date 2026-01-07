export function momentum(values, days) {
  if (values.length < days) return 0;
  return (values.at(-1) - values.at(-days)) / values.at(-days);
}
