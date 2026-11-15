import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aiSessionManager,
  getStorageKey,
  generateSessionTitle,
  formatSessionTime,
  createSession,
  getSessions,
  updateSessionMessages,
  deleteSession,
  findSessionByQuestionId,
  mergeCloudInteractions,
  clearAllSessions
} from '../src/utils/aiSessionManager.js';

// Polyfill global localStorage for NodeJS test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

test('aiSessionManager - storage key and title generation', () => {
  assert.equal(getStorageKey('student-123'), 'veval_socratic_sessions_student-123');
  assert.equal(getStorageKey(''), 'veval_socratic_sessions_guest_student');

  const titleFromLatex = generateSessionTitle('Tìm tập xác định của hàm số $y = \\sqrt{x-1}$', 'Toán');
  assert.ok(titleFromLatex.includes('Tìm tập xác định của hàm số'));

  const titleFromSkill = generateSessionTitle('', 'Toán & Tư duy Logic');
  assert.equal(titleFromSkill, 'Ôn tập: Toán & Tư duy Logic');
});

test('aiSessionManager - creates and retrieves sessions for isolated students', () => {
  const studentA = 'user_aaa';
  const studentB = 'user_bbb';

  clearAllSessions(studentA);
  clearAllSessions(studentB);

  const sessionA = createSession(studentA, {
    questionId: 'Q_MATH_01',
    questionLatex: 'Phương trình bậc 2 có 2 nghiệm phân biệt khi nào?',
    skill: 'Phương trình',
    selectedWrong: 'A',
    correctOption: 'C',
    initialMessages: [
      { sender: 'ai', text: 'Chào em, hãy kiểm tra delta nhé!', timestamp: '10:00' }
    ]
  });

  assert.ok(sessionA.id);
  assert.equal(sessionA.questionId, 'Q_MATH_01');
  assert.equal(sessionA.messages.length, 1);

  // User B has no sessions yet
  assert.equal(getSessions(studentB).length, 0);

  // User A has 1 session
  const listA = getSessions(studentA);
  assert.equal(listA.length, 1);
  assert.equal(listA[0].id, sessionA.id);

  // Find by question id
  const found = findSessionByQuestionId(studentA, 'Q_MATH_01');
  assert.ok(found);
  assert.equal(found.id, sessionA.id);
});

test('aiSessionManager - updates messages and preserves multi-turn conversation', () => {
  const student = 'user_turns';
  clearAllSessions(student);

  const s = createSession(student, {
    questionId: 'Q_LOGIC_02',
    questionLatex: 'Mệnh đề đảo của P suy ra Q là gì?',
    skill: 'Logic mệnh đề',
    initialMessages: [{ sender: 'ai', text: 'Chào em!', timestamp: '10:00' }]
  });

  const turns = [
    ...s.messages,
    { sender: 'user', text: 'Em nghĩ là phủ định của P?', timestamp: '10:01' },
    { sender: 'ai', text: 'Gần đúng rồi, nhưng mệnh đề đảo là đổi chỗ giả thiết và kết luận.', timestamp: '10:02' }
  ];

  const updated = updateSessionMessages(student, s.id, turns);
  assert.equal(updated.messages.length, 3);

  const reloaded = getSessions(student);
  assert.equal(reloaded[0].messages.length, 3);
  assert.equal(reloaded[0].messages[1].text, 'Em nghĩ là phủ định của P?');
});

test('aiSessionManager - merges cloud interactions without duplicating', () => {
  const student = 'user_cloud';
  clearAllSessions(student);

  // Create 1 local session
  const local = createSession(student, {
    questionId: 'Q_LOCAL_01',
    questionLatex: 'Câu hỏi cục bộ',
    skill: 'Kỹ năng A',
    initialMessages: [{ sender: 'ai', text: 'Local message', timestamp: '11:00' }]
  });

  const mockCloudInteractions = [
    {
      id: 'int_supabase_001',
      question_id: 'Q_CLOUD_01',
      pattern_name: 'Dạng bài tiệm cận',
      core_theory_latex: 'Khảo sát tiệm cận ngang và đứng',
      student_selected_option: 'B',
      correct_option: 'D',
      created_at: '2026-11-15T14:00:00Z',
      ai_guidance_transcript: [
        { role: 'assistant', text: 'Chào em, câu này ta xét giới hạn x tiến về vô cùng.' },
        { role: 'user', text: 'Dạ em hiểu rồi ạ.' }
      ]
    },
    // Duplicate question or interaction shouldn't duplicate
    {
      id: 'int_supabase_002',
      question_id: 'Q_LOCAL_01',
      pattern_name: 'Trùng questionId',
      ai_guidance_transcript: []
    }
  ];

  const merged = mergeCloudInteractions(student, mockCloudInteractions);

  // Should have 2 sessions (the local one and the 1 new cloud one)
  assert.equal(merged.length, 2);
  const cloudSession = merged.find(s => s.questionId === 'Q_CLOUD_01');
  assert.ok(cloudSession);
  assert.equal(cloudSession.skill, 'Dạng bài tiệm cận');
  assert.equal(cloudSession.messages.length, 2);
  assert.equal(cloudSession.isSynced, true);
});

test('aiSessionManager - deletes session cleanly', () => {
  const student = 'user_del';
  clearAllSessions(student);

  const s1 = createSession(student, { title: 'Phiên 1' });
  const s2 = createSession(student, { title: 'Phiên 2' });

  assert.equal(getSessions(student).length, 2);
  deleteSession(student, s1.id);

  const remaining = getSessions(student);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, s2.id);
});

