export function mockExamAnswers(questions, selected, elapsed) {
  return questions.map((question) => ({ questionId: question.questionId,
    selectedOption: question.options.some((option) => option.optionId === selected[question.questionId]) ? selected[question.questionId] : '',
    timeSpentSeconds: Math.max(0, Math.floor(elapsed[question.questionId] || 0)) }));
}

export function mockExamDraftKey(studentId) { return `veval_mock_exam_draft_${studentId}`; }
