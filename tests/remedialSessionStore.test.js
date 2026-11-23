import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRemedialSessions,
  saveRemedialSession,
  getRemedialSessionByGroup,
  deleteRemedialSession,
  getAllRemedialSessions,
  STANDARD_ACADEMIC_SLOTS
} from '../src/utils/remedialSessionStore.js';

const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (i) => Array.from(mockStorage.keys())[i] || null
};

test('remedialSessionStore - provides 6 standard academic slots matching timetable', () => {
  assert.equal(STANDARD_ACADEMIC_SLOTS.length, 6);
  assert.equal(STANDARD_ACADEMIC_SLOTS[0].slot, 1);
  assert.equal(STANDARD_ACADEMIC_SLOTS[0].timeRange, '07:30 - 09:30');
  assert.equal(STANDARD_ACADEMIC_SLOTS[2].slot, 3);
  assert.equal(STANDARD_ACADEMIC_SLOTS[2].timeRange, '13:00 - 15:00');
  assert.equal(STANDARD_ACADEMIC_SLOTS[5].slot, 6);
  assert.equal(STANDARD_ACADEMIC_SLOTS[5].timeRange, '20:15 - 22:30');
});

test('remedialSessionStore - saves and retrieves remedial sessions by class and group', () => {
  mockStorage.clear();
  const classId = 'cls-foundation-01';
  const groupId = 'grp-table-01';

  const sessionData = {
    groupId,
    groupName: 'Nhóm 01 - Bàn 1',
    topic: 'Giải quyết vấn đề Hóa học',
    sessionDate: '2026-11-25',
    timeSlot: '14:00 - 15:30',
    format: 'OFFLINE',
    studentCount: 4,
    notes: 'Ôn tập lại phương pháp cân bằng phản ứng oxi hóa khử'
  };

  const saved = saveRemedialSession(classId, sessionData);
  assert.ok(saved);
  assert.equal(saved.classId, classId);
  assert.equal(saved.topic, 'Giải quyết vấn đề Hóa học');

  const retrieved = getRemedialSessions(classId);
  assert.equal(retrieved.length, 1);
  assert.equal(retrieved[0].groupId, groupId);

  const byGroup = getRemedialSessionByGroup(classId, groupId);
  assert.ok(byGroup);
  assert.equal(byGroup.topic, 'Giải quyết vấn đề Hóa học');
});

test('remedialSessionStore - schedule isolation: isolates schedules by unique skill group IDs', () => {
  mockStorage.clear();
  const classId = 'cls-foundation-01';

  // Group 1: Chemistry remedial
  const chemGroupId = 'GRP-giai-quyet-van-de-ho-01';
  saveRemedialSession(classId, {
    groupId: chemGroupId,
    groupName: 'Nhóm 01 - Bàn Hóa học',
    topic: 'Giải quyết vấn đề Hóa học',
    focusSkill: 'Giải quyết vấn đề Hóa học',
    sessionDate: '2026-11-24',
    slotNo: 3,
    timeSlot: '13:00 - 15:00',
    studentCount: 4
  });

  // Group 2: Biology remedial
  const bioGroupId = 'GRP-dang-1-co-che-sinh-ho-01';
  saveRemedialSession(classId, {
    groupId: bioGroupId,
    groupName: 'Nhóm 01 - Bàn Sinh học',
    topic: 'Dạng 1: Cơ chế sinh học trọng tâm',
    focusSkill: 'Dạng 1: Cơ chế sinh học trọng tâm',
    sessionDate: '2026-11-26',
    slotNo: 4,
    timeSlot: '15:15 - 17:15',
    studentCount: 3
  });

  // Retrieve separately
  const chemSession = getRemedialSessionByGroup(classId, chemGroupId);
  const bioSession = getRemedialSessionByGroup(classId, bioGroupId);

  assert.ok(chemSession, 'Chemistry session should exist');
  assert.ok(bioSession, 'Biology session should exist');
  assert.equal(chemSession.sessionDate, '2026-11-24');
  assert.equal(chemSession.slotNo, 3);
  assert.equal(bioSession.sessionDate, '2026-11-26');
  assert.equal(bioSession.slotNo, 4);

  // Both exist in class sessions without overwriting each other
  const allForClass = getRemedialSessions(classId);
  assert.equal(allForClass.length, 2);

  // getAllRemedialSessions returns across all classes
  const allAcrossClasses = getAllRemedialSessions();
  assert.equal(allAcrossClasses.length, 2);
});

test('remedialSessionStore - deletes session cleanly', () => {
  mockStorage.clear();
  const classId = 'cls-foundation-02';

  const s1 = saveRemedialSession(classId, { groupId: 'g1', topic: 'Topic 1' });
  const s2 = saveRemedialSession(classId, { groupId: 'g2', topic: 'Topic 2' });

  assert.equal(getRemedialSessions(classId).length, 2);

  deleteRemedialSession(classId, s1.id);
  const remaining = getRemedialSessions(classId);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].groupId, 'g2');
});

