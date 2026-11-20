import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudentActivation } from '../src/utils/studentActivation.js';

const complete = {
  diagnosticComplete: true,
  user: { fullName: 'Student', phone: '0912345678' },
  profile: { schoolName: 'THPT', targetScore: 900, examDate: '2027-03-29', studyHoursDay: 2.5 },
  paid: true, today: '2026-11-20'
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
test('profile can proceed without any device-local aspiration', () => {
  assert.equal(getStudentActivation({ ...complete, paid: false }).step, 'payment');
});
test('invalid and missing exam dates need correction', () => {
  for (const examDate of ['2027-02-30', '']) {
    assert.equal(getStudentActivation({ ...complete, profile: { ...complete.profile, examDate } }).step, 'profile');
  }
});
test('completed profile from the reported case allows payment with a past date and no parent', () => {
  const result = getStudentActivation({
    diagnosticComplete: true, paid: false,
    user: { fullName: 'a123', phone: '0909880099' },
    profile: { schoolName: 'THPT Chuyên Lê Hồng Phong', targetScore: 850, examDate: '2026-03-29', studyHoursDay: 2.5 }
  });
  assert.equal(result.step, 'payment');
  assert.deepEqual(result.missing, []);
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
