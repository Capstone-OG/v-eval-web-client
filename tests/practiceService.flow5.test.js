import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) ?? null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

import { practiceService, FLOW5_DEFAULTS } from '../src/services/practiceService.js';

describe('practiceService Core Flow 5 APIs', () => {
  const originalFetch = globalThis.fetch;
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
    globalThis.localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('calls exact /api/practice/... Core Flow 5 endpoints and sanitizes non-GUID IDs', async () => {
    globalThis.fetch = async (url, options = {}) => {
      capturedCalls.push({ url, method: options.method || 'GET' });
      return {
        ok: true,
        status: 200,
        headers: { get: (k) => (k.toLowerCase() === 'content-type' ? 'application/json' : null) },
        json: async () => ({ mocked: true })
      };
    };

    await practiceService.getStudentDashboard('non-guid-student');
    await practiceService.getClassHeatmap('CLS-HCM01-01', { domainCode: 'DOM_MATH', minMastery: 0.6 });
    await practiceService.forceAggregateClassHeatmap('CLS-HCM01-01');
    await practiceService.getParentDashboard('non-guid-parent');
    await practiceService.getCampusComparativeHeatmap('CAMPUS_HCM_01');

    assert.strictEqual(capturedCalls.length, 5);
    assert.ok(capturedCalls[0].url.endsWith(`/api/practice/analytics/student/${FLOW5_DEFAULTS.STUDENT_ID}/dashboard`));
    assert.ok(capturedCalls[1].url.endsWith(`/api/practice/classes/${FLOW5_DEFAULTS.CLASS_ID}/heatmap?domainCode=DOM_MATH&minMastery=0.6`));
    assert.ok(capturedCalls[2].url.endsWith(`/api/practice/classes/${FLOW5_DEFAULTS.CLASS_ID}/heatmap/force-aggregate`));
    assert.strictEqual(capturedCalls[2].method, 'POST');
    assert.ok(capturedCalls[3].url.endsWith(`/api/practice/analytics/parent/${FLOW5_DEFAULTS.PARENT_ID}/children`));
    assert.ok(capturedCalls[4].url.endsWith(`/api/practice/analytics/campus/${FLOW5_DEFAULTS.CAMPUS_ID}/comparative-heatmap`));
  });

  it('provides schema-compliant seed fallbacks when Gateway is offline', async () => {
    globalThis.fetch = async () => {
      throw new Error('Failed to fetch');
    };

    const student = await practiceService.getStudentDashboard();
    assert.strictEqual(student._source, 'seed_fallback');
    assert.strictEqual(student.radarCompetency.length, 4);
    assert.strictEqual(student.streakAnalytics.weeklyActivityDays.length, 7);

    const heatmap = await practiceService.getClassHeatmap(FLOW5_DEFAULTS.CLASS_ID, { domainCode: 'DOM_MATH' });
    assert.strictEqual(heatmap._source, 'seed_fallback');
    assert.ok(heatmap.columns.every((c) => c.domainCode === 'DOM_MATH'));
    assert.ok(heatmap.pedagogicalAlerts.some((a) => a.alertLevel === 'CRITICAL_RED'));

    const parent = await practiceService.getParentDashboard();
    assert.strictEqual(parent.children.length, 1);
    assert.strictEqual(parent.children[0].examReadiness.readinessTier, 'READY');

    const campus = await practiceService.getCampusComparativeHeatmap();
    assert.strictEqual(campus.domainAverages.length, 4);
    assert.ok(campus.classComparisons.length >= 3);
  });
});
