import { useEffect, useId, useRef } from 'react';
import { Bot, CalendarDays, Clock, FileText, GraduationCap, Info, Play, X } from 'lucide-react';
import { ATTENDANCE_LABELS, sessionPresentation } from '../../utils/weeklySchedule';
import { parseCalendarDate } from '../../utils/calendarDate';

export default function ScheduleSessionDialog({ session, slotNumber, onClose, onPractice, onAiTutor }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (session && !dialog.current.open) dialog.current.showModal();
    if (!session && dialog.current.open) dialog.current.close();
  }, [session]);
  const date = parseCalendarDate(String(session?.sessionDate || '').slice(0, 10));
  const appearance = sessionPresentation(session || {});
  const close = () => { dialog.current.close(); onClose(); };
  const checkIn = session?.checkInAt ? new Date(session.checkInAt) : null;
  const checkInLabel = checkIn && !Number.isNaN(checkIn.getTime())
    ? checkIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa ghi nhận';
  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-[540px] overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
      {session && <>
        <header className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pb-6 pt-5 text-white sm:px-7">
          <button type="button" aria-label="Đóng chi tiết buổi học" onClick={close} className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 cursor-pointer"><X className="h-4 w-4" /></button>
          <div className="mb-4 flex items-center gap-2 pr-9 text-[11px] font-semibold text-blue-100">
            <span className="rounded-lg border border-white/20 bg-white/15 px-2.5 py-1 font-bold text-white">Buổi {session.sessionNo}</span>
            <span className="tracking-wider">CHUYÊN ĐỀ HỌC TẬP</span>
          </div>
          <h2 id={titleId} className="pr-3 text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">{session.topicTitle || session.skillName || `Buổi ${session.sessionNo}`}</h2>
          <p className="mt-2 text-xs text-blue-100">Chi tiết lịch học và tiến độ của buổi học</p>
        </header>
        <div className="space-y-5 px-6 py-5 sm:px-7 sm:pb-7">
          <div className="grid grid-cols-1 gap-4 border-b border-slate-100 pb-5 min-[400px]:grid-cols-2">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><CalendarDays className="h-4 w-4" /></span><div><p className="text-[11px] text-slate-400">Ngày học</p><p className="mt-0.5 text-xs font-bold">{date ? date.toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p></div></div>
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Clock className="h-4 w-4" /></span><div><p className="text-[11px] text-slate-400">{slotNumber ? `Ca ${slotNumber} · Khung giờ` : 'Khung giờ'}</p><p className="mt-0.5 text-xs font-bold">{session.startTime} – {session.endTime}</p></div></div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <span className="shrink-0 rounded-xl bg-blue-100/70 p-2.5 text-blue-600"><GraduationCap className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Lớp học của bạn</p><p className="mt-1 text-sm font-bold leading-relaxed break-words">{session.className || 'Chưa cập nhật lớp'}</p>{session.courseName && <p className="mt-1 text-xs text-slate-500">{session.courseName}</p>}</div>
          </div>
          {(session.isMakeupSession || session.isSubstituteTeacher || session.status === 'RESCHEDULED' || session.status === 'CANCELLED') && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>{session.status === 'CANCELLED' ? 'Buổi học tạm hoãn. ' : ''}{session.isMakeupSession ? 'Đây là buổi học bù. ' : ''}{session.isSubstituteTeacher ? 'Buổi học có giảng viên dạy thay. ' : ''}{session.status === 'RESCHEDULED' ? 'Buổi học đã được dời lịch.' : ''}</p></div>
          )}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold">Điểm danh buổi học</h3><span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${appearance.tone} ${appearance.text}`}>{ATTENDANCE_LABELS[session.attendanceStatus] || 'Chưa điểm danh'}</span></div>
            <div className="mt-3 flex justify-between gap-3 border-b border-slate-100 pb-4 text-xs"><span className="text-slate-400">Giờ check-in tại lớp</span><strong className="font-semibold">{checkInLabel}</strong></div>
            {session.attendanceNote && <p className="mt-2 text-xs text-slate-500">{session.attendanceNote}</p>}
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"><span className="rounded-lg bg-white p-2 text-blue-600"><FileText className="h-4 w-4" /></span><div><h3 className="text-xs font-bold">Phiếu bài tập · Buổi {session.sessionNo}</h3><p className="mt-1 text-xs text-slate-500">{session.assignedWorksheetTitle || 'Chưa giao phiếu bài tập cho buổi này'}</p>{session.microGroupName && <p className="mt-1 text-[11px] text-blue-600">{session.microGroupName}</p>}</div></div>
          <div className="flex flex-col gap-2.5 min-[400px]:flex-row">
            {onPractice && <button type="button" onClick={() => { close(); onPractice({ id: session.skillId, name: session.skillName, status: 'ACTIVE' }); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"><Play className="h-4 w-4" />Luyện ZPD Buổi {session.sessionNo}</button>}
            {onAiTutor && <button type="button" onClick={() => { close(); onAiTutor(); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"><Bot className="h-4 w-4" />Hỏi Gia sư AI</button>}
          </div>
        </div>
      </>}
    </dialog>
  );
}
