import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTuitionStatus } from '../src/utils/tuitionStatus.js';

test('only tuition API grants access even if a transaction reports success', () => {
  assert.equal(normalizeTuitionStatus({ isPaid: false }, [{ status: 'SUCCESS', orderCode: 123 }], 'student-a').isPaid, false);
  assert.equal(normalizeTuitionStatus({ isPaid: false }, [{ status: 'PAID' }], 'student-a').isPaid, false);
});
test('summary confirmation stays valid with empty history', () => {
  assert.equal(normalizeTuitionStatus({ isPaid: true }, [], 'student-a').isPaid, true);
});
test('pending, failed and unknown transactions do not unlock', () => {
  for (const status of ['PENDING', 'FAILED', 'CANCELLED', 'EXPIRED', 'unknown']) {
    assert.equal(normalizeTuitionStatus({ isPaid: false }, [{ status }], 'student-a').isPaid, false);
  }
});
test('another student payment cannot grant this account access', () => {
  assert.equal(normalizeTuitionStatus({ isPaid: false }, [{ status: 'SUCCESS', studentId: 'student-b' }], 'student-a').isPaid, false);
  assert.throws(() => normalizeTuitionStatus({ isPaid: true, studentId: 'student-b' }, [], 'student-a'));
});
