import test from 'node:test';
import assert from 'node:assert/strict';
import { canShowPrescription, hasValidForecastScores } from '../src/utils/prescriptionEligibility.js';

const roadmap = { roadmapId: 'roadmap', studentId: 'student', totalMilestones: 3, completedMilestones: 3 };
const forecast = { studentId: 'student', _source: 'backend', _hasValidScores: true, forecast: { predictedScore: 850 }, balanceSheet: { targetScore: 900 } };

test('shows only after completing the roadmap and below the target', () => {
  assert.equal(canShowPrescription(roadmap, forecast, 'student'), true);
  assert.equal(canShowPrescription({ ...roadmap, completedMilestones: 2, progressPercentage: 100 }, forecast, 'student'), false);
  for (const predictedScore of [900, 950]) {
    assert.equal(canShowPrescription(roadmap, { ...forecast, forecast: { predictedScore } }, 'student'), false);
  }
});

test('missing, invalid, fallback and different-student data cannot unlock prescriptions', () => {
  for (const value of [null, {}, { ...roadmap, totalMilestones: 0, completedMilestones: 0 }, { ...roadmap, completedMilestones: 4 }, { ...roadmap, studentId: 'other' }]) {
    assert.equal(canShowPrescription(value, forecast, 'student'), false);
  }
  for (const value of [null, {}, { ...forecast, _source: 'empty_backend' }, { ...forecast, _hasValidScores: false }, { ...forecast, studentId: 'other' }]) {
    assert.equal(canShowPrescription(roadmap, value, 'student'), false);
  }
});

test('validates original scores before normalization can insert defaults', () => {
  for (const predictedScore of [undefined, null, '', ' ', false, NaN, Infinity, -1, 1201]) {
    assert.equal(hasValidForecastScores({ forecast: { predictedScore }, balanceSheet: { targetScore: 900 } }), false);
  }
  for (const targetScore of [undefined, null, '', 0, -1, 1201]) {
    assert.equal(hasValidForecastScores({ predictedScore: 850, targetScore }), false);
  }
  assert.equal(hasValidForecastScores({ predictedScore: 0, targetScore: 900 }), true);
  assert.equal(hasValidForecastScores({ predictedScore: '850', targetScore: '900' }), true);
});
