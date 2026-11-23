import test from 'node:test';
import assert from 'node:assert/strict';
import { monitorPayment } from '../src/utils/paymentMonitor.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));
test('pending then success notifies once and stops polling', async () => {
  const results = ['PENDING', 'SUCCESS'];
  const scheduled = [];
  let success = 0;
  monitorPayment({ orderCode: 123, getStatus: async () => ({ orderCode: 123, status: results.shift() }),
    onSuccess: () => success++, onFailure: () => assert.fail(), schedule: (fn) => scheduled.push(fn) });
  await flush();
  assert.equal(success, 0);
  await scheduled.shift()();
  assert.equal(success, 1);
  assert.equal(scheduled.length, 0);
});
for (const status of ['FAILED', 'CANCELLED', 'EXPIRED']) {
  test(`${status} notifies failure once without success or another poll`, async () => {
    let failure = 0;
    monitorPayment({ orderCode: 123, getStatus: async () => ({ orderCode: 123, status }),
      onSuccess: () => assert.fail(), onFailure: (payment) => { assert.equal(payment.status, status); failure++; }, schedule: () => assert.fail() });
    await flush();
    assert.equal(failure, 1);
  });
}
test('connection errors warn once, retry and never report payment failure', async () => {
  const scheduled = [];
  let warnings = 0;
  monitorPayment({ orderCode: 123, getStatus: async () => { throw Error('offline'); },
    onSuccess: () => assert.fail(), onFailure: () => assert.fail(), onConnectionError: () => warnings++,
    schedule: (fn) => scheduled.push(fn) });
  await flush();
  await scheduled.shift()();
  assert.equal(warnings, 1);
  assert.equal(scheduled.length, 1);
});
test('closing modal ignores an in-flight successful response', async () => {
  let resolve;
  let notified = false;
  const stop = monitorPayment({ orderCode: 123, getStatus: () => new Promise((done) => { resolve = done; }),
    onSuccess: () => { notified = true; }, onFailure: () => assert.fail(), schedule: () => assert.fail() });
  stop();
  resolve({ orderCode: 123, status: 'SUCCESS' });
  await flush();
  assert.equal(notified, false);
});
test('a different order response cannot trigger success', async () => {
  let warnings = 0;
  monitorPayment({ orderCode: 123, getStatus: async () => ({ orderCode: 999, status: 'SUCCESS' }),
    onSuccess: () => assert.fail(), onFailure: () => assert.fail(), onConnectionError: () => warnings++, schedule: () => 1 });
  await flush();
  assert.equal(warnings, 1);
});
