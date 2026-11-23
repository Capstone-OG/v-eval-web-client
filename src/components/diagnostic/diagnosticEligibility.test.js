import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completedDiagnosticExamIds, DIAGNOSTIC_TARGET } from './diagnosticEligibility.js';

const attempt = (examId, overrides = {}) => ({ studentId: 'A', examId,
  status: 'COMPLETED', examType: 'DIAGNOSTIC', ...overrides });

test('new student has zero completed exams', () => {
  assert.equal(completedDiagnosticExamIds([], 'A').size, 0);
});
test('one distinct completed diagnostic exam is enough', () => {
  const ids = completedDiagnosticExamIds([attempt('one'), attempt('one'), attempt('two'),
    attempt('three', { status: 'IN_PROGRESS' }), attempt('mock', { examType: 'MOCK' })], 'A');
  assert.equal(ids.size, 2);
  assert.equal(ids.has('one'), true);
  assert.equal(ids.has('three'), false);
  assert.equal(DIAGNOSTIC_TARGET, 1);
  assert.equal(completedDiagnosticExamIds([attempt('one')], 'A').size >= DIAGNOSTIC_TARGET, true);
});
test('invalid or other-student history cannot permit entry', () => {
  assert.throws(() => completedDiagnosticExamIds(null, 'A'));
  assert.throws(() => completedDiagnosticExamIds([attempt('one')], 'B'));
  assert.throws(() => completedDiagnosticExamIds([attempt(null)], 'A'));
});
