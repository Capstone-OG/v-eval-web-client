import { test } from 'node:test';
import assert from 'node:assert/strict';
import apiClient, { tokenStorage } from '../src/services/apiClient.js';
import { authService } from '../src/services/authService.js';
import { practiceService } from '../src/services/practiceService.js';

const makeStorage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key) };
};
const response = (data) => ({ ok: true, status: 200,
  headers: { get: () => 'application/json' }, json: async () => data });

test('merged client supports develop params/PATCH and local diagnostic API helpers', async () => {
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return response([]); };
  try {
    await apiClient.get('/test?existing=1', { params: { filter: 'a b', empty: null } });
    await apiClient.patch('/test', { handled: true });
    await practiceService.getDiagnosticHistory('student-A');
    await practiceService.getDiagnosticResult('submission-A');
    assert.match(calls[0].url, /existing=1&filter=a\+b/);
    assert.equal(calls[1].method, 'PATCH');
    assert.deepEqual(JSON.parse(calls[1].body), { handled: true });
    assert.match(calls[2].url, /diagnostic-submissions\/student\/student-A$/);
    assert.match(calls[3].url, /diagnostic-submissions\/submission-A$/);
  } finally { globalThis.fetch = original; }
});

test('merged login enriches user while preserving session-only login and logout isolation', async () => {
  globalThis.localStorage = makeStorage();
  globalThis.sessionStorage = makeStorage();
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => url.endsWith('/login')
    ? response({ accessToken: 'test-token', refreshToken: 'test-refresh', user: { userId: 'A', roles: ['STUDENT'] } })
    : response({ userId: 'A', email: 'a@example.test', roles: ['STUDENT'] });
  try {
    const result = await authService.login({ email: 'a@example.test', password: 'test', rememberMe: false });
    assert.equal(result.user.userId, 'A');
    assert.equal(localStorage.getItem('veval_access_token'), null);
    assert.equal(sessionStorage.getItem('veval_access_token'), 'test-token');
    const version = tokenStorage.getSessionVersion();
    tokenStorage.setTokens('refreshed-token', 'refreshed-refresh');
    assert.equal(sessionStorage.getItem('veval_access_token'), 'refreshed-token');
    assert.equal(localStorage.getItem('veval_access_token'), null);
    assert.equal(tokenStorage.getUser().userId, 'A');
    assert.equal(tokenStorage.getSessionVersion(), version);
    localStorage.setItem('veval_latest_diagnostic', 'old-result');
    tokenStorage.clearTokens();
    assert.equal(tokenStorage.getUser(), null);
    assert.equal(localStorage.getItem('veval_latest_diagnostic'), null);
    assert.ok(tokenStorage.getSessionVersion() > version);
  } finally { globalThis.fetch = original; }
});
