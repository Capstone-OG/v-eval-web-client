import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for headless Node environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) ?? null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
};

import { paymentService } from '../src/services/paymentService.js';

describe('paymentService', () => {
  it('creates simulated payment link fallback when gateway is offline', async () => {
    const payload = {
      studentId: 's1',
      parentId: 'p1',
      courseId: 'c1',
      returnUrl: 'https://localhost/return',
      cancelUrl: 'https://localhost/cancel'
    };

    const res = await paymentService.createPaymentLink(payload);
    assert.ok(res);
    assert.ok(res.orderCode > 0);
    assert.strictEqual(res.status, 'PENDING');
    assert.ok(res.checkoutUrl.includes('payos.vn'));
  });

  it('checks payment status fallback cleanly without throwing', async () => {
    const res = await paymentService.getPaymentStatus(123456789);
    assert.ok(res);
    assert.strictEqual(res.orderCode, 123456789);
    assert.strictEqual(res.status, 'PENDING');
  });

  it('fetches transactions fallback as empty list without throwing', async () => {
    const res = await paymentService.getPaymentTransactions('pay-123');
    assert.ok(Array.isArray(res));
  });
});

