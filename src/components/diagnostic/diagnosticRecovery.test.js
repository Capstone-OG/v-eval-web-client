import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDraft, draftKey, findSavedDiagnostic, domainScoresFromQuestions, removeDiagnosticDraft } from './diagnosticRecovery.js';
import { createExamClock } from './examClock.js';

const draft = () => ({ studentId: 'A', exam: { id: 'exam', questions: [{ id: 'q', options: [] }] },
  currentIndex: 0, answers: { q: 'B' }, clock: { startedAt: 1000, durationMs: 60000, elapsed: { q: 2000 } } });
const storage = (value) => {
  const data = new Map([[draftKey('A'), JSON.stringify(value)]]);
  return { getItem: (key) => data.get(key), removeItem: (key) => data.delete(key) };
};

test('draft belongs only to its owner; invalid draft is removed', () => {
  assert.equal(readDraft(storage(draft()), 'A').answers.q, 'B');
  assert.equal(readDraft(storage(draft()), 'B'), null);
  assert.equal(readDraft(storage({ ...draft(), studentId: 'B' }), 'A'), null);
  assert.equal(readDraft(storage({ ...draft(), currentIndex: 9 }), 'A'), null);
});

test('reload preserves deadline and prior question duration, without counting closed time', () => {
  const saved = draft().clock;
  const clock = createExamClock(saved.startedAt, saved.durationMs, null, saved.elapsed, 31000);
  assert.equal(clock.remaining(31000), 30);
  assert.deepEqual(clock.snapshot(31000), { q: 2 });
  clock.visit('q', 31000);
  assert.deepEqual(clock.snapshot(33000), { q: 4 });
  assert.equal(clock.remaining(90000), 0);
});

const payload = { studentId: 'A', examId: 'exam' };

test('cleanup removes only the current owner draft', () => {
  const data = new Map([[draftKey('A'), 'draft A'], [draftKey('B'), 'draft B']]);
  assert.equal(removeDiagnosticDraft({ removeItem: (key) => data.delete(key) }, 'A'), true);
  assert.equal(data.has(draftKey('A')), false);
  assert.equal(data.get(draftKey('B')), 'draft B');
});

test('storage cleanup failure does not interrupt confirmed-result handling', async () => {
  const saved = { studentId: 'A', examId: 'exam', submissionId: 's', status: 'COMPLETED', examType: 'DIAGNOSTIC' };
  const service = { getDiagnosticHistory: async () => [saved], getDiagnosticResult: async () => saved };
  const confirmed = await findSavedDiagnostic(service, payload);
  const removed = removeDiagnosticDraft({ removeItem() { throw Error('Storage denied'); } }, 'A');
  assert.equal(removed, false);
  assert.equal(confirmed.submissionId, 's');
});
test('retry discovers saved result without posting', async () => {
  const saved = { studentId: 'A', examId: 'exam', submissionId: 's', status: 'COMPLETED', examType: 'DIAGNOSTIC' };
  const service = { getDiagnosticHistory: async () => [saved], getDiagnosticResult: async () => saved };
  assert.equal((await findSavedDiagnostic(service, payload)).submissionId, 's');
});

test('no completed result permits sending; network/ownership errors do not', async () => {
  assert.equal(await findSavedDiagnostic({ getDiagnosticHistory: async () => [] }, payload), null);
  await assert.rejects(findSavedDiagnostic({ getDiagnosticHistory: async () => { throw Error('offline'); } }, payload));
  await assert.rejects(findSavedDiagnostic({ getDiagnosticHistory: async () => [{ studentId: 'B' }] }, payload));
});

test('report groups by server domain IDs; unknown data is never assigned to math', () => {
  const scores = domainScoresFromQuestions([
    { domainId: 'logic', domainName: 'Logic', isCorrect: true },
    { domainId: 'logic', domainName: 'Logic', isCorrect: false },
    { isCorrect: true }
  ]);
  assert.equal(scores[0].accuracy_pct, 50);
  assert.equal(scores[1].domain_id, 'unknown');
});
