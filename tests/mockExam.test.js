import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockExamService } from '../src/services/mockExamService.js';
import { mockExamAnswers, mockExamDraftKey } from '../src/utils/mockExam.js';

test('only published full mock exams are offered', async () => {
  const calls = [];
  const service = createMockExamService({ get: async (url) => { calls.push(url); return { data: [
    { examId: 'full', isPublished: true, examCategory: 'FULL_MOCK' },
    { examId: 'draft', isPublished: false, examCategory: 'FULL_MOCK' },
    { examId: 'diagnostic', isPublished: true, examCategory: 'DIAGNOSTIC' },
    { examId: 'quiz', isPublished: true, examCategory: 'QUIZ' }
  ] }; } });
  assert.deepEqual((await service.getExams()).map((exam) => exam.examId), ['full']);
  assert.deepEqual(calls, ['/api/content/exams']);
});

test('start posts the selected real exam and current student, without limiting questions', async () => {
  const questions = Array.from({ length: 120 }, (_, index) => ({ questionId: `question-${index}` }));
  const session = { studentId: 'student-a', submissionId: 'submission-a', questions };
  const calls = [];
  const service = createMockExamService({ post: async (...args) => { calls.push(args); return { data: session }; } });
  assert.equal(await service.start('exam-a', 'student-a'), session);
  assert.equal(session.questions.length, 120);
  assert.deepEqual(calls, [['/api/practice/mock-exams/exam-a/start', { studentId: 'student-a' }]]);
});

test('missing identifiers and wrong student session are rejected', async () => {
  const service = createMockExamService({ post: async () => ({ data: { studentId: 'student-b', submissionId: 'submission-b', questions: [{}] } }) });
  await assert.rejects(service.start('exam-a', null));
  await assert.rejects(service.start('exam-a', 'student-a'), /không hợp lệ/);
});

test('submit uses the server submission ID and returns server grading without local scoring', async () => {
  const calls = []; const result = { totalScore: 742, status: 'UNDER_REVIEW' };
  const service = createMockExamService({ post: async (...args) => { calls.push(args); return { data: result }; } });
  const answers = [{ questionId: 'q-a', selectedOption: 'C', timeSpentSeconds: 12 }];
  assert.equal(await service.submit('submission-a', answers), result);
  assert.deepEqual(calls, [['/api/practice/mock-exams/submission-a/submit', { answers }]]);
});

test('result and tab departure use their dedicated submission APIs', async () => {
  const calls = [];
  const service = createMockExamService({
    get: async (...args) => { calls.push(args); return { data: { status: 'COMPLETED' } }; },
    post: async (...args) => { calls.push(args); return { data: { tabDepartureCount: 1 } }; }
  });
  assert.equal((await service.getResult('submission-a')).status, 'COMPLETED');
  await service.logTabDeparture('submission-a');
  assert.equal(calls[0][0], '/api/practice/mock-exams/submission-a');
  assert.equal(calls[1][0], '/api/practice/mock-exams/submission-a/log-tab-departure');
});

test('answer payload preserves all question IDs, blank answers and measured seconds', () => {
  const questions = [{ questionId: 'q-a', options: [{ optionId: 'A' }, { optionId: 'B' }] }, { questionId: 'q-b', options: [{ optionId: 'A' }] }];
  assert.deepEqual(mockExamAnswers(questions, { 'q-a': 'B', 'q-b': 'invalid' }, { 'q-a': 12.8, 'q-b': -2 }), [
    { questionId: 'q-a', selectedOption: 'B', timeSpentSeconds: 12 },
    { questionId: 'q-b', selectedOption: '', timeSpentSeconds: 0 }
  ]);
});

test('drafts are separated by student account', () => {
  assert.notEqual(mockExamDraftKey('student-a'), mockExamDraftKey('student-b'));
});

test('API failure is propagated without replacing it with a demo exam', async () => {
  const service = createMockExamService({ get: async () => { throw new Error('Network error'); } });
  await assert.rejects(service.getExams(), /Network error/);
});
