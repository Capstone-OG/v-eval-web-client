import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) ?? null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

import { practiceService, FLOW6_DEFAULTS } from '../src/services/practiceService.js';

describe('practiceService Core Flow 6 APIs', () => {
  const originalFetch = globalThis.fetch;
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
    globalThis.localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('calls exact Core Flow 6 endpoints, HTTP verbs, and snake_case/camelCase contracts', async () => {
    globalThis.fetch = async (url, options = {}) => {
      const parsedBody = options.body ? JSON.parse(options.body) : null;
      capturedCalls.push({
        url,
        method: options.method || 'GET',
        body: parsedBody,
        headers: options.headers || {}
      });

      if (url.includes('/predictions/my-forecast')) {
        return {
          ok: true,
          status: 200,
          headers: { get: (k) => (k.toLowerCase() === 'content-type' ? 'application/json' : null) },
          json: async () => ({
            studentId: FLOW6_DEFAULTS.STUDENT_ID,
            forecast: {
              predictedScore: 860,
              scoreRange: { min: 812, max: 908 },
              sem: 24.5,
              confidenceRate: 0.95
            },
            balanceSheet: {
              targetScore: 920,
              deficitScore: 60,
              status: 'AT_RISK'
            },
            prescriptions: [
              {
                pattern_id: 'PAT_TOAN_LOGIC_01',
                pattern_name: 'Mệnh đề kéo theo',
                skill_id: '88888888-9999-aaaa-bbbb-cccccccccccc',
                delta_score: 30,
                study_hours_needed: 2.0,
                roi_score: 15.0,
                priority_rank: 1,
                is_remedied: false
              }
            ]
          })
        };
      }

      return {
        ok: true,
        status: 200,
        headers: { get: (k) => (k.toLowerCase() === 'content-type' ? 'application/json' : null) },
        json: async () => ({ mocked: true })
      };
    };

    const forecast = await practiceService.getMyForecast('non-guid');
    assert.strictEqual(forecast.forecast.predictedScore, 860);
    assert.strictEqual(forecast.prescriptions[0].patternId, 'PAT_TOAN_LOGIC_01');
    assert.strictEqual(forecast.prescriptions[0].deltaScore, 30);
    assert.strictEqual(forecast.prescriptions[0].roiScore, 15.0);

    await practiceService.getPrescriptionPracticeSession('PAT_TOAN_LOGIC_01');
    await practiceService.submitPrescriptionPracticeSession('PAT_TOAN_LOGIC_01', {
      sessionId: '11111111-1111-4111-8111-111111111111',
      answers: [{ questionId: 'f6200001-0000-4000-8000-000000000001', selectedOption: 'C', timeSpentSeconds: 20 }]
    });
    await practiceService.recalculatePrediction({ triggerSource: 'MANUAL' });

    await practiceService.getMyAlerts({ unreadOnly: true, alertType: 'RED' });
    await practiceService.markAlertAsRead(FLOW6_DEFAULTS.ALERT_RED_ID);
    await practiceService.getEarlyWarningsDashboard({ alertType: 'UNREALISTIC_GOAL', isResolved: false });
    await practiceService.resolveEarlyWarningAlert(FLOW6_DEFAULTS.ALERT_RED_ID, {
      resolutionNotes: 'Đã kèm 1-1 dạng mệnh đề kéo theo'
    });
    await practiceService.scheduleAlertCounseling(FLOW6_DEFAULTS.ALERT_UNREALISTIC_ID, {
      counselingDate: '2026-11-15T09:00:00.000Z',
      counselingLocation: 'Phòng Tư vấn Cơ sở 1',
      proposedTargetScore: 860,
      mentorNotes: 'Điều chỉnh lộ trình phù hợp quỹ 6 tuần'
    });

    await practiceService.getMistakeNotebook({ cognitiveErrorTag: 'CARELESS', isMastered: false });
    await practiceService.getDailyMistakeReview();
    await practiceService.tagMistakeCognitiveError(FLOW6_DEFAULTS.MISTAKE_1_ID, {
      cognitiveErrorTag: 'MISREAD_QUESTION',
      studentNotes: 'Đọc kỹ từ khóa phủ định'
    });
    await practiceService.submitDailyMistakeReview(FLOW6_DEFAULTS.MISTAKE_1_ID, {
      selectedOption: 'B',
      timeSpentSeconds: 22
    });

    assert.strictEqual(capturedCalls.length, 13);
    assert.ok(capturedCalls[0].url.includes(`/api/practice/predictions/my-forecast?studentId=${FLOW6_DEFAULTS.STUDENT_ID}`));
    assert.ok(capturedCalls[1].url.includes('/api/practice/predictions/prescriptions/PAT_TOAN_LOGIC_01/practice-session'));
    assert.strictEqual(capturedCalls[2].method, 'POST');
    assert.strictEqual(capturedCalls[3].body.student_id, FLOW6_DEFAULTS.STUDENT_ID);
    assert.strictEqual(capturedCalls[3].body.trigger_source, 'MANUAL');

    assert.ok(capturedCalls[4].url.includes('/api/practice/early-warnings/my-alerts?'));
    assert.ok(capturedCalls[4].url.includes('unreadOnly=true'));
    assert.ok(capturedCalls[4].url.includes('alertType=RED'));

    assert.strictEqual(capturedCalls[5].method, 'PATCH');
    assert.ok(capturedCalls[5].url.includes(`/api/practice/early-warnings/${FLOW6_DEFAULTS.ALERT_RED_ID}/read`));

    assert.ok(capturedCalls[6].url.includes('/api/practice/early-warnings/dashboard?'));
    assert.strictEqual(capturedCalls[7].body.mentor_id, FLOW6_DEFAULTS.MENTOR_ID);
    assert.strictEqual(capturedCalls[7].body.resolution_notes, 'Đã kèm 1-1 dạng mệnh đề kéo theo');

    assert.strictEqual(capturedCalls[8].body.proposed_target_score, 860);
    assert.strictEqual(capturedCalls[8].body.counseling_location, 'Phòng Tư vấn Cơ sở 1');

    assert.ok(capturedCalls[9].url.includes('/api/practice/mistakes?'));
    assert.ok(capturedCalls[10].url.includes('/api/practice/mistakes/daily-review?'));
    assert.ok(capturedCalls[11].url.endsWith(`/api/practice/mistakes/${FLOW6_DEFAULTS.MISTAKE_1_ID}/tag-error`));
    assert.ok(capturedCalls[12].url.endsWith(`/api/practice/mistakes/${FLOW6_DEFAULTS.MISTAKE_1_ID}/review-submit`));
  });

  it('persists offline remediation, alert resolution, and SM-2 mastery progression seamlessly', async () => {
    globalThis.fetch = async () => {
      throw new Error('Failed to fetch');
    };

    const initialForecast = await practiceService.getMyForecast();
    assert.strictEqual(initialForecast.forecast.predictedScore, 845);
    assert.strictEqual(initialForecast.balanceSheet.deficitScore, 75);

    const session = await practiceService.getPrescriptionPracticeSession('PAT_TOAN_LOGIC_01');
    assert.strictEqual(session.questions.length, 3);

    const submitRes = await practiceService.submitPrescriptionPracticeSession('PAT_TOAN_LOGIC_01', {
      sessionId: session.sessionId,
      answers: [
        { questionId: 'f6200001-0000-4000-8000-000000000001', selectedOption: 'C', timeSpentSeconds: 18 },
        { questionId: 'f6200001-0000-4000-8000-000000000002', selectedOption: 'B', timeSpentSeconds: 25 },
        { questionId: 'f6200001-0000-4000-8000-000000000003', selectedOption: 'A', timeSpentSeconds: 15 }
      ]
    });
    assert.strictEqual(submitRes.isMastered, true);
    assert.strictEqual(submitRes.pointsRecovered, 30);
    assert.strictEqual(submitRes.remainingDeficit, 45);

    const updatedForecast = await practiceService.getMyForecast();
    assert.strictEqual(updatedForecast.forecast.predictedScore, 875);
    assert.strictEqual(updatedForecast.prescriptions[0].isRemedied, true);

    // Mistake #2 starts at consecutiveCorrectReviews = 2 -> one correct answer reaches 3 -> Mastered!
    const sm2Res = await practiceService.submitDailyMistakeReview(FLOW6_DEFAULTS.MISTAKE_2_ID, {
      selectedOption: 'A',
      timeSpentSeconds: 20
    });
    assert.strictEqual(sm2Res.isCorrect, true);
    assert.strictEqual(sm2Res.consecutiveCorrectReviews, 3);
    assert.strictEqual(sm2Res.isMastered, true);
  });
});
