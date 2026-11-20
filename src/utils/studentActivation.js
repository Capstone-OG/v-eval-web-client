import { parseCalendarDate, serializeCalendarDate } from './calendarDate.js';

export function getStudentActivation({ diagnosticComplete, user = {}, profile = {}, aspiration = '', paid, today = serializeCalendarDate(new Date()) }) {
  const missing = [];
  if (!user.fullName?.trim()) missing.push('Họ và tên');
  if (!/^(0|\+84)[35789][0-9]{8}$/.test((user.phone || '').replace(/[\s.-]/g, ''))) missing.push('Số điện thoại');
  if (!profile.schoolName?.trim()) missing.push('Trường THPT');
  if (!aspiration.trim()) missing.push('Nguyện vọng và trường đại học mục tiêu');
  if (!(Number(profile.targetScore) >= 300 && Number(profile.targetScore) <= 1200)) missing.push('Điểm mục tiêu');
  if (!parseCalendarDate(profile.examDate) || profile.examDate < today) missing.push('Ngày thi dự kiến từ hôm nay trở đi');
  if (!(Number(profile.studyHoursDay) >= 0.5 && Number(profile.studyHoursDay) <= 8)) missing.push('Thời lượng tự học mỗi ngày');
  return { missing, diagnosticComplete, paid: paid === true,
    step: !diagnosticComplete ? 'diagnostic' : missing.length ? 'profile' : paid === true ? 'ready' : 'payment' };
}
