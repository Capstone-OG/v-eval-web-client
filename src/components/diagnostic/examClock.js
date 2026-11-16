// Milliseconds are retained across visits; round only when building the API payload.
export function createExamClock(startedAt, durationMs, firstQuestionId, savedElapsed = {}, resumedAt = startedAt) {
  const elapsed = { ...savedElapsed };
  let currentId = firstQuestionId;
  let since = resumedAt;
  const deadline = startedAt + durationMs;
  const flush = (now) => {
    const end = Math.min(now, deadline);
    if (currentId && end > since) elapsed[currentId] = (elapsed[currentId] || 0) + end - since;
    since = end;
  };
  return {
    startedAt: new Date(startedAt).toISOString(),
    remaining: (now) => Math.max(0, Math.ceil((deadline - now) / 1000)),
    visit(id, now) { flush(now); currentId = id; },
    stop(now) { flush(now); currentId = null; },
    serialize(now) { flush(now); return { startedAt, durationMs, elapsed: { ...elapsed } }; },
    snapshot(now) {
      flush(now);
      return Object.fromEntries(Object.entries(elapsed).map(([id, ms]) => [id, Math.floor(ms / 1000)]));
    }
  };
}
