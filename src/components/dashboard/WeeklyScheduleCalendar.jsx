import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, RefreshCw, UserCheck } from 'lucide-react';
import { serializeCalendarDate, parseCalendarDate } from '../../utils/calendarDate';
import { scheduleDate, scheduleRows, scheduleTimeKey, sessionsForCell, sessionPresentation, shiftWeek, weekDays } from '../../utils/weeklySchedule';
import ScheduleSessionDialog from './ScheduleSessionDialog';

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const dateLabel = (value) => parseCalendarDate(value)?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) || value;

function SessionTile({ session, onSelect, slotNumber }) {
  const appearance = sessionPresentation(session);
  const StatusIcon = session.attendanceStatus === 'PRESENT' ? CheckCircle2 : Clock;
  return (
    <button type="button" onClick={() => onSelect(session)}
      aria-label={`${session.topicTitle || session.skillName || `Buổi ${session.sessionNo}`}, lớp ${session.className || 'chưa cập nhật'}, ${session.startTime} đến ${session.endTime}, ${appearance.label}. Xem chi tiết buổi học.`}
      className={`flex w-full min-w-0 flex-col gap-1.5 rounded-xl border border-transparent border-l-[3px] p-3 text-left transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer ${appearance.tone}`}>
      <p className="text-xs font-extrabold leading-relaxed text-slate-900 break-words">{session.topicTitle || session.skillName || `Buổi ${session.sessionNo}`}</p>
      <p className="text-[10px] font-bold text-indigo-700">{session.isRemedial ? 'Phụ đạo nhóm nhỏ' : 'Chữa đề & sửa lỗi'}</p>
      <p className="text-[11px] text-slate-600">Phòng: {session.room || 'Chưa xếp phòng'}</p>
      <p className="text-[11px] text-slate-600">GV: {session.teacherName || 'Chưa cập nhật'}</p>
      <p className="text-[11px] text-slate-600">Nhóm: {session.microGroupName || 'Chưa phân nhóm'}</p>
      <p className="flex items-start gap-1 text-[11px] font-semibold leading-relaxed text-slate-600"><GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="break-words">{session.className || 'Chưa cập nhật lớp'}</span></p>
      <p className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500"><Clock className="h-3 w-3" />{slotNumber ? `Ca ${slotNumber} · ` : ''}{session.startTime}–{session.endTime}</p>
      <p className={`flex items-center gap-1 text-[11px] font-bold ${appearance.text}`}><StatusIcon className="h-3 w-3 shrink-0" />{appearance.label}</p>
      {(session.isMakeupSession || session.isSubstituteTeacher) && <p className="text-[10px] font-semibold text-amber-700">{[session.isMakeupSession && 'Học bù', session.isSubstituteTeacher && 'Dạy thay'].filter(Boolean).join(' · ')}</p>}
    </button>
  );
}

export default function WeeklyScheduleCalendar({ timetable, terms, courses, sessions, isLoading, error,
  selectedTermId, onTermChange, selectedCourseCode, onCourseChange, statusFilter, onStatusChange,
  onRefresh, selectedSession, onSelectSession, onPractice, onAiTutor }) {
  const [weekAnchor, setWeekAnchor] = useState(() => serializeCalendarDate(new Date()));
  const today = serializeCalendarDate(new Date());
  const dates = weekDays(weekAnchor);
  const classes = timetable?.enrolledClasses || [];
  const rows = useMemo(() => scheduleRows(sessions, timetable?.enrolledClasses || []), [sessions, timetable]);
  const visibleSessions = sessions.filter((session) => dates.includes(scheduleDate(session.sessionDate)));
  const hours = visibleSessions.reduce((total, session) => {
    const minutes = (time) => Number(time?.slice(0, 2)) * 60 + Number(time?.slice(3, 5));
    const duration = minutes(session.endTime) - minutes(session.startTime);
    return total + (Number.isFinite(duration) && duration > 0 ? duration / 60 : 0);
  }, 0);
  const chronological = sessions.filter((session) => scheduleDate(session.sessionDate)).sort((a, b) => `${a.sessionDate}${a.startTime}`.localeCompare(`${b.sessionDate}${b.startTime}`));
  const nearestSession = chronological.find((session) => scheduleDate(session.sessionDate) >= today && session.status !== 'CANCELLED') || chronological.at(-1);
  const selectedRow = selectedSession && rows.find((row) => row.key === scheduleTimeKey(selectedSession));
  const emptyMessage = sessions.length ? 'Tuần này không có buổi học phù hợp bộ lọc.'
    : timetable?.sessions?.length ? 'Không có buổi học phù hợp bộ lọc đã chọn.'
    : classes.length ? 'Bạn đã có lớp nhưng chưa có buổi học được xếp lịch. Lộ trình tự học được xem riêng tại Lộ trình của tôi.'
    : 'Chưa có lớp được xếp cho tài khoản trong học kỳ đang chọn. Lộ trình cá nhân không tự tạo buổi học trên thời khóa biểu.';
  const selectClass = 'min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer';
  return (
    <div className="space-y-5 pb-10 text-slate-900">
      <div><h1 className="text-2xl font-extrabold">Thời khóa biểu & Lớp học Offline</h1><p className="mt-2 text-sm text-slate-500">Theo dõi lịch chữa đề và phụ đạo cùng giảng viên. Bạn tự học bài mới tại Lộ trình học tập.</p></div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
        <span className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-emerald-600" />Chuyên cần <strong className="text-slate-800">{timetable?.attendanceRatePct ?? 0}%</strong></span>
        <span>Đã học <strong className="text-slate-800">{timetable?.completedSessions ?? 0}/{timetable?.totalSessions ?? 0} buổi</strong></span>
        <span><strong className="text-slate-800">{classes.length}</strong> lớp đang học</span>
        <span>Đi muộn <strong className="text-slate-800">{timetable?.lateCount ?? 0}</strong> · Vắng <strong className="text-slate-800">{timetable?.absentCount ?? 0}</strong></span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <select aria-label="Chọn học kỳ" className={selectClass} value={selectedTermId} onChange={(event) => onTermChange(event.target.value)}><option value="ALL">Tất cả học kỳ</option>{terms.map((term) => <option key={term.termId} value={term.termId}>{term.code} — {term.name}</option>)}</select>
        <select aria-label="Chọn khóa học" className={selectClass} value={selectedCourseCode} onChange={(event) => onCourseChange(event.target.value)}><option value="ALL">Tất cả khóa học</option>{courses.map((course) => <option key={course.courseId || course.code} value={course.code}>{course.name || course.code}</option>)}</select>
        <select aria-label="Lọc trạng thái buổi học" className={selectClass} value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}><option value="ALL">Tất cả trạng thái</option><option value="SCHEDULED">Sắp diễn ra</option><option value="COMPLETED">Đã hoàn thành</option><option value="MAKEUP_SUB">Học bù & Dạy thay</option></select>
        <button type="button" disabled={isLoading} onClick={onRefresh} className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />{isLoading ? 'Đang tải…' : 'Làm mới'}</button>
      </div>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-label="Thời khóa biểu theo tuần">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div><p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400">LỊCH HỌC CỦA BẠN</p><h2 className="text-lg font-extrabold tracking-tight">{dateLabel(dates[0])} – {dateLabel(dates[6])} / {dates[6]?.slice(0, 4)}</h2><p aria-live="polite" className="mt-1 text-xs text-slate-500">{visibleSessions.length} buổi · {hours.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giờ học</p></div>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Tuần trước" onClick={() => setWeekAnchor((date) => shiftWeek(date, -1))} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-blue-50 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => setWeekAnchor(today)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-blue-50 cursor-pointer">Tuần này</button>
            <button type="button" aria-label="Tuần sau" onClick={() => setWeekAnchor((date) => shiftWeek(date, 1))} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-blue-50 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        {isLoading ? <div role="status" className="flex items-center justify-center gap-2 border-t border-slate-100 p-16 text-sm text-slate-400"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải thời khóa biểu…</div>
          : error ? <div role="alert" className="border-t border-slate-100 p-10 text-center text-sm text-rose-600">{error}</div>
          : <>
            {!visibleSessions.length && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500"><span>{emptyMessage}</span>{nearestSession && <button type="button" onClick={() => setWeekAnchor(scheduleDate(nearestSession.sessionDate))} className="font-bold text-blue-600 hover:underline cursor-pointer">Đến buổi học gần nhất →</button>}</div>}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] table-fixed border-collapse text-left" aria-label="Bảng lịch học từ thứ hai đến chủ nhật">
                <colgroup><col className="w-24" />{dates.map((date) => <col key={date} />)}</colgroup>
                <thead><tr className="bg-slate-50"><th scope="col" className="border-t border-slate-100 px-3 py-4 text-[11px] font-semibold text-slate-400">Khung giờ</th>{dates.map((date, index) => <th key={date} scope="col" className={`border-l border-t border-slate-100 py-3 text-center ${date === today ? 'bg-blue-50' : ''}`}><span className={`block text-[11px] font-semibold ${date === today ? 'text-blue-600' : 'text-slate-500'}`}>{DAY_LABELS[index]}</span><span className={`mx-auto mt-1 block w-fit rounded-lg px-2.5 py-1 text-sm font-extrabold ${date === today ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>{dateLabel(date)}</span></th>)}</tr></thead>
                <tbody>{rows.map((row) => <tr key={row.key}><th scope="row" className="border-t border-slate-100 bg-slate-50/60 px-3 py-4 align-top"><p className="text-xs font-bold">Ca {row.number}</p><p className="mt-2 text-[11px] font-normal leading-relaxed text-slate-400">{row.start}<br />– {row.end}</p></th>{dates.map((date) => <td key={date} className={`h-32 border-l border-t border-slate-100 p-1.5 align-top ${date === today ? 'bg-blue-50/25' : ''}`}><div className="space-y-2">{sessionsForCell(visibleSessions, date, row.key).map((session) => <SessionTile key={session.sessionId} session={session} slotNumber={rows.find((item) => item.key === scheduleTimeKey(session))?.number} onSelect={onSelectSession} />)}</div></td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="px-4 pb-4 md:hidden">{dates.map((date, index) => {
              const daySessions = visibleSessions.filter((session) => scheduleDate(session.sessionDate) === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return <div key={date} className="space-y-2 border-t border-slate-100 py-3"><h3 className={`text-xs font-bold ${date === today ? 'text-blue-600' : 'text-slate-700'}`}>{DAY_LABELS[index]} · {dateLabel(date)}{date === today ? ' · Hôm nay' : ''}</h3>{daySessions.length ? daySessions.map((session) => <SessionTile key={session.sessionId} session={session} slotNumber={rows.find((item) => item.key === scheduleTimeKey(session))?.number} onSelect={onSelectSession} />) : <p className="text-xs text-slate-400">Không có lịch học</p>}</div>;
            })}</div>
          </>}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400"><div className="flex flex-wrap gap-4"><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-blue-500" />Sắp học</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Có mặt</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-amber-500" />Đi muộn</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-rose-500" />Vắng mặt</span></div><span>Chọn một buổi để xem chi tiết</span></footer>
      </section>
      <ScheduleSessionDialog session={selectedSession} slotNumber={selectedRow?.number} onClose={() => onSelectSession(null)} onPractice={onPractice} onAiTutor={onAiTutor} />
    </div>
  );
}
