import { parseCalendarDate, serializeCalendarDate } from './calendarDate.js';

export const DEFAULT_SCHEDULE_SLOTS = [
  { number: 1, start: '07:30', end: '09:30' },
  { number: 2, start: '09:45', end: '11:45' },
  { number: 3, start: '13:00', end: '15:00' },
  { number: 4, start: '15:15', end: '17:15' },
  { number: 5, start: '18:00', end: '20:00' },
  { number: 6, start: '20:15', end: '22:30' }
];

export const ATTENDANCE_LABELS = {
  PRESENT: 'Có mặt', LATE: 'Đi muộn', ABSENT: 'Vắng mặt', EXCUSED: 'Nghỉ có phép',
  NOT_RECORDED: 'Chưa điểm danh', UNRECORDED: 'Chưa điểm danh'
};

export function scheduleDate(value) {
  const day = String(value || '').slice(0, 10);
  return parseCalendarDate(day) ? day : '';
}

export function weekDays(anchor) {
  const date = typeof anchor === 'string' ? parseCalendarDate(anchor) : anchor;
  if (!date || Number.isNaN(date.getTime())) return [];
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => serializeCalendarDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)));
}

export function shiftWeek(anchor, direction) {
  const date = parseCalendarDate(anchor);
  return date ? serializeCalendarDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + direction * 7)) : anchor;
}

export function scheduleTimeKey(session) {
  return `${String(session.startTime || '').slice(0, 5)}-${String(session.endTime || '').slice(0, 5)}`;
}

export function scheduleRows(sessions, classes = []) {
  const rows = new Map(DEFAULT_SCHEDULE_SLOTS.map((slot) => [`${slot.start}-${slot.end}`, { ...slot, key: `${slot.start}-${slot.end}` }]));
  const configured = new Map();
  for (const cls of classes) for (const slot of cls.weeklySchedules || []) {
    if (Number(slot.slotNumber) > 0) configured.set(`${cls.classId}:${scheduleTimeKey(slot)}`, Number(slot.slotNumber));
  }
  let extra = Math.max(6, ...configured.values());
  for (const session of sessions) {
    const start = String(session.startTime || '').slice(0, 5);
    const end = String(session.endTime || '').slice(0, 5);
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || end <= start) continue;
    const key = scheduleTimeKey(session);
    if (!rows.has(key)) rows.set(key, { key, start, end, number: configured.get(`${session.classId}:${key}`) || ++extra });
  }
  return [...rows.values()].sort((a, b) => a.number - b.number || a.start.localeCompare(b.start));
}

export function sessionsForCell(sessions, date, rowKey) {
  return sessions.filter((session) => scheduleDate(session.sessionDate) === date && scheduleTimeKey(session) === rowKey)
    .sort((a, b) => String(a.className || '').localeCompare(String(b.className || ''), 'vi'));
}

export function sessionPresentation(session) {
  if (session.status === 'CANCELLED') return { label: 'Tạm hoãn', tone: 'border-l-slate-400 bg-slate-50', text: 'text-slate-500' };
  const status = session.attendanceStatus;
  if (status === 'PRESENT') return { label: 'Có mặt', tone: 'border-l-emerald-500 bg-emerald-50/80', text: 'text-emerald-700' };
  if (status === 'LATE') return { label: 'Đi muộn', tone: 'border-l-amber-500 bg-amber-50/80', text: 'text-amber-700' };
  if (status === 'ABSENT') return { label: 'Vắng mặt', tone: 'border-l-rose-500 bg-rose-50/80', text: 'text-rose-700' };
  if (status === 'EXCUSED') return { label: 'Nghỉ có phép', tone: 'border-l-purple-500 bg-purple-50/80', text: 'text-purple-700' };
  return { label: session.status === 'COMPLETED' ? 'Chưa điểm danh' : session.status === 'RESCHEDULED' ? 'Đã dời lịch' : 'Sắp học', tone: 'border-l-blue-500 bg-blue-50/80', text: 'text-blue-600' };
}
