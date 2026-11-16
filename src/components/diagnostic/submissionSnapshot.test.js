import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionSnapshot } from './submissionSnapshot.js';

test('snapshot retains original choices and timing despite later state changes', () => {
  const choices = { q1: ' b ' };
  const times = { q1: 12 };
  const payload = createSubmissionSnapshot('A', 'exam', '2026-11-09T00:00:00Z',
    [{ id: 'q1' }, { id: 'q2' }], choices, times);
  const original = JSON.stringify(payload);
  choices.q1 = 'D';
  times.q1 = 90;
  assert.equal(JSON.stringify(payload), original);
  assert.deepEqual(payload.answers[1], { questionId: 'q2', selectedOption: null, timeSpentSeconds: 0 });
  assert.throws(() => { payload.answers[0].selectedOption = 'C'; }, TypeError);
});

test('missing identity prevents invented exam or student IDs', () => {
  assert.throws(() => createSubmissionSnapshot('A', null, 'date', [], {}, {}));
  assert.throws(() => createSubmissionSnapshot(null, 'exam', 'date', [], {}, {}));
});
