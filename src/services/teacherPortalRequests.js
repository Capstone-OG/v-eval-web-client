// Never load system-wide alerts when the teacher's assigned class is unavailable.
export function teacherPortalRequests(user) {
  const mentorId = user?.userId || user?.id;
  if (!mentorId) return {};
  const requests = { exams: '/api/content/exams' };
  if (user.classId) {
    const classId = encodeURIComponent(user.classId);
    requests.heatmap = `/api/practice/classes/${classId}/heatmap`;
    requests.alerts = `/api/practice/early-warnings/dashboard?classId=${classId}&mentorId=${encodeURIComponent(mentorId)}`;
  }
  return requests;
}
