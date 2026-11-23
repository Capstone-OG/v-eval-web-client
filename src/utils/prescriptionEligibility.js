export function hasValidForecastScores(raw) {
  const predicted = raw?.forecast?.predictedScore ?? raw?.predictedScore;
  const target = raw?.balanceSheet?.targetScore ?? raw?.targetScore;
  const valid = (value) => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value));
  return valid(predicted) && valid(target) && Number(predicted) >= 0 && Number(predicted) <= 1200 && Number(target) > 0 && Number(target) <= 1200;
}

export function canShowPrescription(roadmap, forecast, studentId) {
  if (!roadmap?.roadmapId || forecast?._source !== 'backend' || forecast?._hasValidScores !== true) return false;
  if (studentId && [roadmap.studentId, forecast.studentId].some(id => !id || String(id).toLowerCase() !== String(studentId).toLowerCase())) return false;
  const total = roadmap.totalMilestones;
  const completed = roadmap.completedMilestones;
  if (!Number.isInteger(total) || total <= 0 || !Number.isInteger(completed) || completed !== total) return false;
  // Percentages may be rounded. Counters from the roadmap API are authoritative.
  return hasValidForecastScores(forecast) && Number(forecast.forecast.predictedScore) < Number(forecast.balanceSheet.targetScore);
}
