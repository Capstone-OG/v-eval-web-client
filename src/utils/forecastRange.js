// Only accept a range supplied by the API; never infer one from SEM on the client.
export function readForecastRange(raw) {
  const range = raw?.forecast?.scoreRange ?? raw?.scoreRange;
  const valid = value => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value));
  if (!valid(range?.min) || !valid(range?.max)) return null;
  const min = Number(range.min);
  const max = Number(range.max);
  return min >= 0 && max <= 1200 && min <= max ? { min, max } : null;
}
