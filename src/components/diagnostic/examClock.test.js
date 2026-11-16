import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExamClock } from './examClock.js';

test('revisits retain subsecond time and unseen questions remain absent', () => {
  const clock = createExamClock(1000, 60000, 'a');
  clock.visit('b', 1600);
  clock.visit('a', 2300);
  assert.deepEqual(clock.snapshot(3000), { a: 1, b: 0 });
  assert.equal(clock.snapshot(3000).unseen ?? 0, 0);
  assert.equal(clock.startedAt, new Date(1000).toISOString());
});

test('delayed callbacks respect deadline and cap question time', () => {
  const clock = createExamClock(1000, 60000, 'a');
  assert.equal(clock.remaining(31500), 30);
  assert.equal(clock.remaining(120000), 0);
  assert.deepEqual(clock.snapshot(120000), { a: 60 });
});

test('submission pauses question tracking without extending deadline', () => {
  const clock = createExamClock(1000, 60000, 'a');
  clock.stop(3000);
  assert.deepEqual(clock.snapshot(8000), { a: 2 });
  clock.visit('a', 9000);
  assert.deepEqual(clock.snapshot(10000), { a: 3 });
  assert.equal(clock.remaining(10000), 51);
});
