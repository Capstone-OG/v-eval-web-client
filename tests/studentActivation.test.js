import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudentActivation } from '../src/utils/studentActivation.js';

const complete = {
  diagnosticComplete: true,
  user: { fullName: 'Student', phone: '0912345678' },
  profile: { schoolName: 'THPT', targetScore: 900, examDate: '2027-03-29', studyHoursDay: 2.5 },
  aspiration: 'University', paid: true, today: '2026-11-20'
};

test('requires diagnostic before profile or payment, even if already paid', () => {
  assert.equal(getStudentActivation({ ...complete, diagnosticComplete: false }).step, 'diagnostic');
});
test('requires saved profile before payment, even if already paid', () => {
  assert.equal(getStudentActivation({ ...complete, profile: {} }).step, 'profile');
});
test('complete profile and unpaid proceeds to payment', () => {
  assert.equal(getStudentActivation({ ...complete, paid: false }).step, 'payment');
});
test('only confirmed payment opens roadmap', () => {
  assert.equal(getStudentActivation(complete).step, 'ready');
  assert.equal(getStudentActivation({ ...complete, paid: 'true' }).step, 'payment');
});
test('missing device-local aspiration needs profile completion', () => {
  assert.equal(getStudentActivation({ ...complete, aspiration: ' ' }).step, 'profile');
});
test('past and invalid exam dates need correction', () => {
  for (const examDate of ['2025-03-29', '2027-02-30', '']) {
    assert.equal(getStudentActivation({ ...complete, profile: { ...complete.profile, examDate } }).step, 'profile');
  }
});
test('today is a valid planned date', () => {
  assert.equal(getStudentActivation({ ...complete, profile: { ...complete.profile, examDate: complete.today } }).step, 'ready');
});
test('missing account contact details cannot be replaced by profile defaults', () => {
  assert.equal(getStudentActivation({ ...complete, user: {} }).step, 'profile');
});
test('invalid target or daily hours needs profile correction', () => {
  for (const profile of [{ ...complete.profile, targetScore: 1300 }, { ...complete.profile, studyHoursDay: 0 }]) {
    assert.equal(getStudentActivation({ ...complete, profile }).step, 'profile');
  }
});
