import test from 'node:test';
import assert from 'node:assert/strict';
import { ensurePaidRoadmap } from '../src/utils/paidRoadmap.js';

const input = { studentId: 'student-a', paid: true,
  profile: { examDate: '2099-06-01', studyHoursDay: 2.5 },
  history: [{ studentId: 'student-a', status: 'COMPLETED', examType: 'DIAGNOSTIC', submissionId: 'submission-a' }] };
const missing = () => Object.assign(new Error('Not found'), { status: 404 });

test('unpaid never reads or generates a roadmap', async () => {
  assert.equal(await ensurePaidRoadmap({ ...input, paid: false }, {}), null);
});
test('existing roadmap progress is preserved', async () => {
  const roadmap = { roadmapId: 'old-roadmap', nodes: [{ status: 'COMPLETED' }] };
  assert.equal(await ensurePaidRoadmap(input, { getMyRoadmap: async () => roadmap }), roadmap);
});
test('paid missing roadmap uses saved profile and completed submission exactly once', async () => {
  let reads = 0; const payloads = [];
  const service = { getMyRoadmap: async () => { if (++reads === 1) throw missing(); return { roadmapId: 'new' }; },
    generateRoadmap: async (payload) => { payloads.push(payload); } };
  const first = ensurePaidRoadmap(input, service);
  const second = ensurePaidRoadmap(input, service);
  assert.equal(first, second);
  assert.deepEqual(await first, { roadmapId: 'new' });
  assert.deepEqual(payloads, [{ studentId: 'student-a', diagnosticSubmissionId: 'submission-a', examDate: '2099-06-01T00:00:00', studyHoursPerDay: 2.5 }]);
});
test('network or authorization error never triggers regeneration', async () => {
  for (const status of [0, 401, 403, 500]) {
    await assert.rejects(ensurePaidRoadmap(input, { getMyRoadmap: async () => { throw Object.assign(new Error('Unavailable'), { status }); } }));
  }
});
test('another student submission never generates this student roadmap', async () => {
  await assert.rejects(ensurePaidRoadmap({ ...input, history: [{ ...input.history[0], studentId: 'student-b' }] }, { getMyRoadmap: async () => { throw missing(); } }), /kiểm tra đầu vào/);
});
test('past date does not invent a future exam date', async () => {
  await assert.rejects(ensurePaidRoadmap({ ...input, profile: { ...input.profile, examDate: '2020-01-01' } }, { getMyRoadmap: async () => { throw missing(); } }), /ngày thi trong tương lai/);
});
