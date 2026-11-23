import test from 'node:test';
import assert from 'node:assert/strict';
import { getPaymentStatusView, refreshPendingPayments, getPaymentContinuation } from '../src/utils/paymentStatus.js';

test('only explicit success statuses display successful receipts', () => {
  for (const status of ['SUCCESS', 'PAID', ' paid ']) assert.equal(getPaymentStatusView(status).success, true);
  for (const status of ['PENDING', 'PROCESSING', 'FAILED', 'CANCELLED', 'EXPIRED', null, 'unexpected']) {
    assert.equal(getPaymentStatusView(status).success, false);
  }
});
test('pending, failed, cancelled, expired and unknown have distinct labels', () => {
  const labels = ['PENDING', 'FAILED', 'CANCELLED', 'EXPIRED', 'unexpected'].map((status) => getPaymentStatusView(status).label);
  assert.equal(new Set(labels).size, 5);
});
const pending = { paymentId: 'payment-a', orderCode: 123, status: 'PENDING', amount: 2000, createdAt: '2026-11-20' };
test('refresh replaces pending with server-confirmed status without losing row data', async () => {
  const [updated] = await refreshPendingPayments([pending], async () => ({ paymentId: 'payment-a', orderCode: 123, studentId: 'student-a', status: 'SUCCESS', paidAt: '2026-11-20T14:00:00Z' }), 'student-a');
  assert.equal(updated.status, 'SUCCESS');
  assert.equal(updated.amount, 2000);
  assert.equal(updated.createdAt, pending.createdAt);
  assert.ok(updated.paidAt);
});
test('refresh failures preserve pending rather than inventing success', async () => {
  assert.deepEqual(await refreshPendingPayments([pending], async () => { throw Error('offline'); }, 'student-a'), [pending]);
});
test('mismatched order, owner or payment cannot overwrite a row', async () => {
  for (const changes of [{ orderCode: 999 }, { studentId: 'student-b' }, { paymentId: 'payment-b' }]) {
    const result = await refreshPendingPayments([pending], async () => ({ ...pending, studentId: 'student-a', status: 'SUCCESS', ...changes }), 'student-a');
    assert.deepEqual(result, [pending]);
  }
});
test('terminal transactions are not re-requested or downgraded', async () => {
  const paid = { ...pending, status: 'PAID' };
  const result = await refreshPendingPayments([paid], async () => { assert.fail('should not request a paid transaction'); }, 'student-a');
  assert.deepEqual(result, [paid]);
});

const latestPending = { ...pending, studentId: 'student-a', checkoutUrl: 'https://pay.payos.vn/web/existing-order' };
test('resume uses the same pending order and its existing checkout link', () => {
  const result = getPaymentContinuation(pending, latestPending, 'student-a');
  assert.equal(result.kind, 'continue');
  assert.equal(result.payment.orderCode, pending.orderCode);
  assert.equal(result.payment.checkoutUrl, latestPending.checkoutUrl);
});
test('already-paid order is updated rather than reopened', () => {
  assert.equal(getPaymentContinuation(pending, { ...latestPending, status: 'SUCCESS' }, 'student-a').kind, 'success');
});
test('cancelled, expired and failed orders cannot resume', () => {
  for (const status of ['CANCELLED', 'EXPIRED', 'FAILED']) {
    assert.equal(getPaymentContinuation(pending, { ...latestPending, status }, 'student-a').kind, 'unavailable');
  }
});
test('missing or unsafe checkout link cannot be opened', () => {
  for (const checkoutUrl of [null, '', 'javascript:alert(1)', 'http://example.com']) {
    assert.equal(getPaymentContinuation(pending, { ...latestPending, checkoutUrl }, 'student-a').kind, 'unavailable');
  }
});
test('mismatched payment or owner and unknown status cannot resume', () => {
  for (const changed of [{ orderCode: 456 }, { studentId: 'student-b' }, { paymentId: 'other' }, { status: 'unknown' }]) {
    assert.throws(() => getPaymentContinuation(pending, { ...latestPending, ...changed }, 'student-a'));
  }
});
