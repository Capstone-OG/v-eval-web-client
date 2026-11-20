import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SCHEDULE_SLOTS, weekDays, shiftWeek, scheduleRows, scheduleDate, sessionsForCell, sessionPresentation } from '../src/utils/weeklySchedule.js';

test('week begins on Monday and includes Sunday across month/year boundaries', () => {
  assert.deepEqual(weekDays('2026-11-22'), ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']);
  assert.equal(weekDays('2027-01-01')[0], '2026-12-28');
  assert.equal(weekDays('2027-01-01')[6], '2027-01-03');
});
test('week navigation retains local dates and crosses years correctly', () => {
  assert.equal(shiftWeek('2026-12-28', 1), '2027-01-04');
  assert.equal(shiftWeek('2027-01-04', -1), '2026-12-28');
});
test('default timetable has all six numbered slots', () => {
  assert.deepEqual(scheduleRows([]).map((slot) => slot.number), [1, 2, 3, 4, 5, 6]);
  assert.equal(DEFAULT_SCHEDULE_SLOTS[4].start, '18:00');
  assert.equal(DEFAULT_SCHEDULE_SLOTS[5].end, '21:30');
});
test('nonstandard API times remain visible with configured slot number', () => {
  const rows = scheduleRows([{ classId: 'a', startTime: '09:10', endTime: '10:40' }], [{ classId: 'a', weeklySchedules: [{ slotNumber: 2, startTime: '09:10', endTime: '10:40' }] }]);
  assert.equal(rows.find((row) => row.key === '09:10-10:40').number, 2);
});
test('unknown time ranges get a distinct numbered row without losing sessions', () => {
  const rows = scheduleRows([{ startTime: '12:00', endTime: '13:00' }]);
  assert.equal(rows.length, 7);
  assert.equal(rows.find((row) => row.key === '12:00-13:00').number, 7);
});
test('same-day and same-slot classes both render; other dates never leak into cell', () => {
  const lessons = [
    { sessionId: 'a', className: 'Class A', sessionDate: '2026-11-30', startTime: '18:00', endTime: '20:00' },
    { sessionId: 'b', className: 'Class B', sessionDate: '2026-11-30T00:00:00', startTime: '18:00', endTime: '20:00' },
    { sessionId: 'c', sessionDate: '2026-12-01', startTime: '18:00', endTime: '20:00' }
  ];
  assert.deepEqual(sessionsForCell(lessons, '2026-11-30', '18:00-20:00').map((lesson) => lesson.sessionId), ['a', 'b']);
});
test('invalid dates are rejected instead of moving into another day', () => {
  assert.equal(scheduleDate('2026-02-30'), '');
  assert.deepEqual(weekDays('invalid'), []);
});
test('attendance and cancellation have distinct truthful labels', () => {
  assert.equal(sessionPresentation({ attendanceStatus: 'PRESENT' }).label, 'Có mặt');
  assert.equal(sessionPresentation({ attendanceStatus: 'ABSENT' }).label, 'Vắng mặt');
  assert.equal(sessionPresentation({ status: 'COMPLETED', attendanceStatus: 'NOT_RECORDED' }).label, 'Chưa điểm danh');
  assert.equal(sessionPresentation({ status: 'CANCELLED', attendanceStatus: 'PRESENT' }).label, 'Tạm hoãn');
});
