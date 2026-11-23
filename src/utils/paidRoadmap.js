import { parseCalendarDate } from './calendarDate.js';

// Deduplicate simultaneous activation checks (including React StrictMode).
const pending = new Map();
export function ensurePaidRoadmap({ studentId, paid, profile, history }, service) {
  if (!studentId || paid !== true) return Promise.resolve(null);
  if (pending.has(studentId)) return pending.get(studentId);
  const request = (async () => {
    try {
      // A saved roadmap must never be regenerated: generation archives old progress.
      return await service.getMyRoadmap(studentId);
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    const submission = (Array.isArray(history) ? history : [])
      .filter((item) => item.studentId === studentId && item.status === 'COMPLETED' && item.examType === 'DIAGNOSTIC' && item.submissionId)
      .sort((a, b) => String(b.completedAt || b.submittedAt || '').localeCompare(String(a.completedAt || a.submittedAt || '')))[0];
    if (!submission) throw new Error('Chưa tìm thấy bài kiểm tra đầu vào đã hoàn thành để tạo lộ trình.');
    const date = parseCalendarDate(profile?.examDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (!date || date <= today) throw new Error('Học phí đã được xác nhận. Hãy cập nhật ngày thi trong tương lai trong hồ sơ để tạo lộ trình.');
    const hours = Number(profile?.studyHoursDay);
    if (!(hours >= 0.5 && hours <= 8)) throw new Error('Hãy cập nhật thời lượng tự học trong hồ sơ để tạo lộ trình.');
    await service.generateRoadmap({ studentId, diagnosticSubmissionId: submission.submissionId,
      examDate: `${profile.examDate.slice(0, 10)}T00:00:00`, studyHoursPerDay: hours });
    return service.getMyRoadmap(studentId);
  })();
  pending.set(studentId, request);
  request.finally(() => { if (pending.get(studentId) === request) pending.delete(studentId); }).catch(() => {});
  return request;
}
