import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRemedialSessions,
  saveRemedialSession,
  getRemedialSessionByGroup,
  deleteRemedialSession
} from '../src/utils/remedialSessionStore.js';

const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

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
