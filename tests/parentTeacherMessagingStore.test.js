import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage and window for Node environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

globalThis.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, eventInitDict) {
    this.type = type;
    this.detail = eventInitDict?.detail;
  }
};

const { parentTeacherMessagingStore } = await import('../src/utils/parentTeacherMessagingStore.js');

test('parentTeacherMessagingStore - sends and retrieves messages for student and teacher', () => {
  mockStorage.clear();

  const msg = parentTeacherMessagingStore.sendMessage({
    studentId: 'hs_001',
    studentName: 'Trần Thái Thịnh',
    parentName: 'Phụ huynh em Thịnh',
    teacherId: 'tch_001',
    teacherName: 'Thầy Hưng',
    alertId: 'alt_001',
    alertTitle: 'Sa sút môn Toán',
    content: 'Em Thịnh dạo này học hình không gian hơi chậm, nhờ Thầy kèm thêm.'
  });

  assert.ok(msg);
  assert.equal(msg.studentName, 'Trần Thái Thịnh');
  assert.equal(msg.status, 'unread');
  assert.equal(msg.reply, null);

  const studentMsgs = parentTeacherMessagingStore.getMessagesForStudent('hs_001');
  assert.equal(studentMsgs.length, 1);
  assert.equal(studentMsgs[0].id, msg.id);

  const teacherUnread = parentTeacherMessagingStore.getUnreadCountForTeacher('tch_001');
  assert.equal(teacherUnread, 1);
});

test('parentTeacherMessagingStore - teacher replies to message', () => {
  mockStorage.clear();

  const msg = parentTeacherMessagingStore.sendMessage({
    studentId: 'hs_002',
    studentName: 'Trần Ngọc Mai',
    parentName: 'Mẹ em Mai',
    teacherId: 'tch_001',
    teacherName: 'Thầy Hưng',
    content: 'Xin Thầy hướng dẫn thêm phương pháp học từ vựng.'
  });

  const replied = parentTeacherMessagingStore.replyToMessage(msg.id, {
    text: 'Thầy đã sắp xếp cho Mai vào nhóm vi mô bàn 2 để luyện bài tập ZPD từ vựng trên lớp nhé.',
    teacherName: 'Thầy Hưng',
    teacherId: 'tch_001'
  });

  assert.ok(replied);
  assert.equal(replied.status, 'replied');
  assert.equal(replied.reply.text, 'Thầy đã sắp xếp cho Mai vào nhóm vi mô bàn 2 để luyện bài tập ZPD từ vựng trên lớp nhé.');
  assert.equal(replied.reply.teacherName, 'Thầy Hưng');

  const teacherUnread = parentTeacherMessagingStore.getUnreadCountForTeacher('tch_001');
  assert.equal(teacherUnread, 0);
});

