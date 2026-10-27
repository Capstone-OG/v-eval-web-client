import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for headless Node environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) ?? null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
};

import { tokenStorage } from '../src/services/apiClient.js';

describe('tokenStorage', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('sets and retrieves access token correctly', () => {
    tokenStorage.setTokens('access-123', 'refresh-456');
    assert.strictEqual(tokenStorage.getAccessToken(), 'access-123');
    assert.strictEqual(tokenStorage.getRefreshToken(), 'refresh-456');
  });

  it('stores and parses user profile object correctly', () => {
    const user = { id: 'u1', name: 'Student 1', role: 'Student' };
    tokenStorage.setTokens('token-abc', 'refresh-xyz', user);
    assert.deepStrictEqual(tokenStorage.getUser(), user);
  });

  it('clears all tokens and user profile on clearTokens', () => {
    tokenStorage.setTokens('token-abc', 'refresh-xyz', { id: 'u1' });
    tokenStorage.clearTokens();
    assert.strictEqual(tokenStorage.getAccessToken(), null);
    assert.strictEqual(tokenStorage.getRefreshToken(), null);
    assert.strictEqual(tokenStorage.getUser(), null);
  });
});
