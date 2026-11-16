export const DIAGNOSTIC_TARGET = 3;

export function completedDiagnosticExamIds(items, studentId) {
  if (!studentId || !Array.isArray(items) || items.some((item) => item.studentId !== studentId)) {
    throw new Error('Không xác nhận được lịch sử của học sinh. Vui lòng thử lại.');
  }
  const completed = items.filter((item) => item.status === 'COMPLETED' && item.examType === 'DIAGNOSTIC');
  if (completed.some((item) => !item.examId)) throw new Error('Lịch sử thiếu mã đề thi.');
  return new Set(completed.map((item) => item.examId));
}
