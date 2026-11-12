import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completedDiagnosticExamIds, DIAGNOSTIC_TARGET } from './diagnosticEligibility.js';

const attempt = (examId, overrides = {}) => ({ studentId: 'A', examId,
  status: 'COMPLETED', examType: 'DIAGNOSTIC', ...overrides });

test('new student has zero completed exams', () => {
  assert.equal(completedDiagnosticExamIds([], 'A').size, 0);
});
test('counts distinct completed diagnostic exams only', () => {
  const ids = completedDiagnosticExamIds([attempt('one'), attempt('one'), attempt('two'),
    attempt('three', { status: 'IN_PROGRESS' }), attempt('mock', { examType: 'MOCK' })], 'A');
  assert.equal(ids.size, 2);
  assert.equal(ids.has('one'), true);
  assert.equal(ids.has('three'), false);
  assert.equal(ids.size >= DIAGNOSTIC_TARGET, false);
  assert.equal(completedDiagnosticExamIds(['one', 'two', 'three'].map((id) => attempt(id)), 'A').size >= DIAGNOSTIC_TARGET, true);
});
test('invalid or other-student history cannot permit entry', () => {
  assert.throws(() => completedDiagnosticExamIds(null, 'A'));
  assert.throws(() => completedDiagnosticExamIds([attempt('one')], 'B'));
  assert.throws(() => completedDiagnosticExamIds([attempt(null)], 'A'));
});
