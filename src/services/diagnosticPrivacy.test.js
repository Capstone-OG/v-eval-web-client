import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearLegacyDiagnosticData, diagnosticUserId } from './diagnosticPrivacy.js';

test('clears old personal results in both storages without deleting login or preferences', () => {
  const makeStorage = () => {
    const data = new Map([['veval_theta_0', '0.85'], ['veval_pending_exam_result', 'A'],
      ['veval_exam_history', 'A'], ['veval_access_token', 'token'], ['theme', 'dark']]);
    return { data, removeItem: (key) => data.delete(key) };
  };
  const local = makeStorage();
  const session = makeStorage();
  clearLegacyDiagnosticData(local, session);
  for (const storage of [local, session]) {
    assert.deepEqual([...storage.data.keys()], ['veval_access_token', 'theme']);
  }
});

test('cleanup tolerates blocked storage and supports user ID variants', () => {
  clearLegacyDiagnosticData({ removeItem() { throw Error('disabled'); } });
  assert.equal(diagnosticUserId({ userId: 'A' }), 'A');
  assert.equal(diagnosticUserId({ id: 'B' }), 'B');
  assert.equal(diagnosticUserId(null), undefined);
});
