export function createSubmissionSnapshot(studentId, examId, startedAt, questions, answers, times) {
  if (!studentId || !examId || !startedAt) throw new Error('Thiếu thông tin bài thi. Vui lòng đăng nhập lại và kiểm tra lịch sử.');
  return Object.freeze({ studentId, examId, startedAt,
    answers: Object.freeze(questions.map((q) => Object.freeze({
      questionId: q.id,
      selectedOption: answers[q.id]?.trim().toUpperCase() || null,
      timeSpentSeconds: times[q.id] ?? 0
    })))
  });
}
