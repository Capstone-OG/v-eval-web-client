import test from 'node:test';
import assert from 'node:assert/strict';
import { studentOfflineSessions } from '../src/utils/studentOfflineSchedule.js';
import { weekDays, sessionsForCell, DEFAULT_SCHEDULE_SLOTS } from '../src/utils/weeklySchedule.js';

test('uses teacher plan and only the current student group, not curriculum titles', () => {
  const timetable = { sessions: [{ sessionId: 's1', topicTitle: 'Theory' }], enrolledClasses: [] };
  const plan = { part1: { focusTopics: [{ skillName: 'Chữa lỗi suy luận' }] }, part2: { microGroups: [
    { tableName: 'Other', students: [{ id: 'other' }] },
    { tableName: 'Bàn 2', students: [{ id: 'STUDENT' }], focusWeakness: 'Suy luận' }
  ] } };
  const [session] = studentOfflineSessions(timetable, 'student', () => plan);
  assert.equal(session.topicTitle, 'Chữa lỗi suy luận');
  assert.equal(session.microGroupName, 'Bàn 2');
  assert.equal(session.groupFocus, 'Suy luận');
  assert.match(studentOfflineSessions(timetable, 'student', () => null)[0].topicTitle, /Chờ giảng viên/);
});

test('remedial sessions require enrollment and explicit student membership', () => {
  const timetable = { enrolledClasses: [{ classId: 'class1' }], sessions: [] };
  const items = [
    { id: 'mine', classId: 'class1', members: [{ studentId: 'student' }] },
    { id: 'other', classId: 'class1', members: [{ studentId: 'other' }] },
    { id: 'unknown', classId: 'class1' },
    { id: 'outside', classId: 'class2', members: [{ studentId: 'student' }] }
  ];
  assert.deepEqual(studentOfflineSessions(timetable, 'student', () => null, items).map(s => s.sessionId), ['mine']);
});

test('week crosses month boundary and keeps multiple sessions in the same cell', () => {
  assert.deepEqual(weekDays('2026-12-01'), ['2026-11-30', '2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06']);
  const items = ['a', 'b'].map(sessionId => ({ sessionId, sessionDate: '2026-12-01', startTime: '13:00', endTime: '15:00' }));
  assert.equal(sessionsForCell(items, '2026-12-01', '13:00-15:00').length, 2);
  assert.equal(DEFAULT_SCHEDULE_SLOTS[2].start, '13:00');
});
