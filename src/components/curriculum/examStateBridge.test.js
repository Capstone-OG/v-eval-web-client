import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getExamWorkspaceState,
  subscribeExamWorkspaceState,
  updateExamWorkspaceState,
  resetExamWorkspaceState
} from './examStateBridge.js';

test('examStateBridge synchronizes active exam, studio selection, and Bloom drafts across pages', () => {
  resetExamWorkspaceState();

  let notifications = 0;
  const unsub = subscribeExamWorkspaceState(() => {
    notifications += 1;
  });

  const sampleExam = {
    examId: 'exam-1',
    title: 'Đề ĐGNL Toán 2026',
    subjectCode: 'MATH',
    passages: [],
    singleQuestions: [{ localId: 'q_10', questionNumber: 10, content: 'Tính đạo hàm' }]
  };

  updateExamWorkspaceState({
    currentExam: sampleExam,
    selectedQuestionLocalId: 'q_10',
    hasUnsavedChanges: true,
    aiBloomDrafts: [{ draftId: 'd_1', status: 'pending', difficultyLevel: 4 }]
  });

  const snap = getExamWorkspaceState();
  assert.equal(notifications, 1);
  assert.equal(snap.currentExam.title, 'Đề ĐGNL Toán 2026');
  assert.equal(snap.selectedQuestionLocalId, 'q_10');
  assert.equal(snap.hasUnsavedChanges, true);
  assert.equal(snap.aiBloomDrafts.length, 1);

  // Functional updater keeps unrelated keys intact
  updateExamWorkspaceState((prev) => ({
    bankSubView: prev.bankSubView === 'paper' ? 'organize' : 'paper'
  }));
  assert.equal(getExamWorkspaceState().bankSubView, 'organize');
  assert.equal(getExamWorkspaceState().selectedQuestionLocalId, 'q_10');
  assert.equal(notifications, 2);

  unsub();
  resetExamWorkspaceState();
  assert.equal(getExamWorkspaceState().currentExam, null);
  assert.equal(notifications, 2);
});

