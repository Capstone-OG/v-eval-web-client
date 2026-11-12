export const draftKey = (studentId) => `veval:diagnostic-draft:v1:${studentId}`;

// Cleanup is best-effort and must never invalidate a confirmed server result.
export function removeDiagnosticDraft(storage, studentId) {
  try {
    storage.removeItem(draftKey(studentId));
    return true;
  } catch {
    return false;
  }
}

export function readDraft(storage, studentId) {
  try {
    const draft = JSON.parse(storage.getItem(draftKey(studentId)) || 'null');
    if (!draft) return null;
    if (draft.studentId !== studentId || !draft.exam?.id || !draft.exam.questions?.length
      || !Number.isFinite(draft.clock?.startedAt) || !(draft.clock.durationMs > 0)
      || !draft.answers || typeof draft.answers !== 'object' || !Number.isInteger(draft.currentIndex)
      || !draft.exam.questions.every((q) => typeof q.id === 'string' && q.id && Array.isArray(q.options))
      || !draft.clock.elapsed || Object.values(draft.clock.elapsed).some((ms) => !Number.isFinite(ms) || ms < 0)
      || draft.currentIndex < 0 || draft.currentIndex >= draft.exam.questions.length
      || (draft.payload && (draft.payload.studentId !== studentId || draft.payload.examId !== draft.exam.id
        || !Array.isArray(draft.payload.answers) || draft.payload.answers.length !== draft.exam.questions.length
        || draft.payload.answers.some((q, i) => q.questionId !== draft.exam.questions[i].id
          || !Number.isInteger(q.timeSpentSeconds) || q.timeSpentSeconds < 0)))) {
      throw new Error('Invalid draft');
    }
    return draft;
  } catch {
    try { storage.removeItem(draftKey(studentId)); } catch { /* Storage is unavailable. */ }
    return null;
  }
}

export async function findSavedDiagnostic(service, payload) {
  const history = await service.getDiagnosticHistory(payload.studentId);
  if (!Array.isArray(history) || history.some((item) => item.studentId !== payload.studentId)) {
    throw new Error('Không xác nhận được lịch sử. Chưa gửi lại bài để tránh nộp trùng.');
  }
  const saved = history.find((item) => item.examId === payload.examId
    && item.examType === 'DIAGNOSTIC' && item.status === 'COMPLETED');
  if (!saved) return null;
  const result = await service.getDiagnosticResult(saved.submissionId);
  if (result.studentId !== payload.studentId || result.examId !== payload.examId
    || result.submissionId !== saved.submissionId) throw new Error('Kết quả không thuộc bài đang kiểm tra.');
  return result;
}

export function domainScoresFromQuestions(questions = []) {
  const groups = new Map();
  for (const question of questions) {
    const id = question.domainId || 'unknown';
    if (!groups.has(id)) groups.set(id, { domain_id: id,
      domain_name: question.domainName || 'Chưa xác định miền', total_questions: 0, correct_count: 0 });
    const group = groups.get(id);
    group.total_questions++;
    if (question.isCorrect) group.correct_count++;
  }
  return [...groups.values()].map((group) => ({ ...group,
    accuracy_pct: Math.round(group.correct_count / group.total_questions * 100) }));
}
