import test from 'node:test';
import assert from 'node:assert/strict';
import { readForecastRange } from '../src/utils/forecastRange.js';

test('preserves API range, including zero and flat response shape', () => {
  assert.deepEqual(readForecastRange({ forecast: { scoreRange: { min: 252, max: 348 } } }), { min: 252, max: 348 });
  assert.deepEqual(readForecastRange({ scoreRange: { min: 0, max: 0 } }), { min: 0, max: 0 });
});

test('does not synthesize a range from prediction or SEM', () => {
  assert.equal(readForecastRange({ forecast: { predictedScore: 300, sem: 24.5 } }), null);
  for (const scoreRange of [null, {}, { min: null, max: 348 }, { min: '', max: 348 }, { min: 350, max: 252 }, { min: -1, max: 20 }, { min: 300, max: 1201 }, { min: NaN, max: 348 }]) {
    assert.equal(readForecastRange({ forecast: { scoreRange } }), null);
  }
});
