import { useEffect, useId, useRef } from 'react';
import {
  Bot,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  Info,
  Play,
  X,
  MapPin,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  BookOpen,
} from 'lucide-react';
import { ATTENDANCE_LABELS, sessionPresentation } from '../../utils/weeklySchedule';
import { parseCalendarDate } from '../../utils/calendarDate';

export default function ScheduleSessionDialog({ session, slotNumber, onClose, onPractice, onAiTutor }) {
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (session && !dialog.current?.open) dialog.current?.showModal();
    if (!session && dialog.current?.open) dialog.current?.close();
  }, [session]);

  const date = parseCalendarDate(String(session?.sessionDate || '').slice(0, 10));
  const appearance = sessionPresentation(session || {});
  const close = () => {
    dialog.current?.close();
    onClose();
  };

  const checkIn = session?.checkInAt ? new Date(session.checkInAt) : null;
  const checkInLabel =
    checkIn && !Number.isNaN(checkIn.getTime())
      ? checkIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : 'Chưa ghi nhận';

  const weekday = date
    ? ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()]
    : '';

  const attendanceStatus = session?.attendanceStatus || 'UNRECORDED';
  const isPresent = attendanceStatus === 'PRESENT';
  const isLate = attendanceStatus === 'LATE';
  const isAbsent = attendanceStatus === 'ABSENT';

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-[560px] overflow-y-auto rounded-[28px] border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-md outline-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {session && (
        <div className="flex flex-col">
          {/* 1. Header Banner - Executive Indigo Gradient with Glassmorphism */}
          <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 px-6 pt-6 pb-7 text-white sm:px-8">
            {/* Ambient Lighting Orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-indigo-400/20 blur-xl" />

            {/* Close Button */}
            <button
              type="button"
              aria-label="Đóng chi tiết buổi học"
              onClick={close}
              className="absolute right-4 top-4 rounded-2xl bg-white/10 p-2.5 text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-90 cursor-pointer shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Session Tag & Category */}
            <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2 pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1 text-xs font-black tracking-wide text-white backdrop-blur-md shadow-xs">
                Buổi {session.sessionNo}
              </span>
              <span className="rounded-full bg-blue-500/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-100 backdrop-blur-sm border border-blue-400/20">
                Chữa đề & Phụ đạo
              </span>
            </div>

            {/* Main Title */}
            <h2 id={titleId} className="relative z-10 text-xl sm:text-2xl font-black leading-snug tracking-tight text-white">
              {session.hasTeacherPlan === false ? 'Chữa đề & phụ đạo tại lớp' : session.topicTitle || 'Chữa đề & phụ đạo tại lớp'}
            </h2>
            <p className="relative z-10 mt-1.5 text-xs text-blue-100/90 font-medium">
              Chi tiết lịch học, vị trí phòng học và tiến độ buổi học trực tiếp
            </p>
          </header>

          {/* 2. Main Dialog Body */}
          <div className="space-y-4 p-6 sm:p-7">
            {/* Quick Hero Metrics: Date & Time */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              {/* Date Card */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày học</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-black text-slate-900 truncate">
                    {date ? `${weekday}, ${date.toLocaleDateString('vi-VN')}` : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Time Card */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {slotNumber ? `Ca ${slotNumber} · Khung giờ` : 'Khung giờ học'}
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm font-mono font-black text-indigo-950 truncate">
                    {session.startTime} – {session.endTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Class & Campus Info Card */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-blue-50/50 p-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                      Lớp học của bạn
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      <MapPin className="h-3 w-3" /> Trực tiếp tại cơ sở
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-black text-slate-900 leading-snug break-words">
                    {session.className || 'Chưa cập nhật lớp'}
                  </p>
                  {session.courseName && (
                    <p className="mt-1 text-xs text-slate-600 font-medium">
                      Khóa: {session.courseName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Room & Teacher Mini Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Room Card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phòng học
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {session.room || 'P.---'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Sẵn sàng
                  </span>
                </div>
              </div>

              {/* Teacher Card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Giảng viên phụ trách
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600 shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {session.teacherName || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notice if Teacher has no plan or has preparation note */}
            {session.hasTeacherPlan === false && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Giảng viên chưa giao chuyên đề chữa đề / sửa lỗi cụ thể cho buổi này.</span>
              </div>
            )}

            {session.preparationNote && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs text-blue-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                <span><strong>Chuẩn bị:</strong> {session.preparationNote}</span>
              </div>
            )}

            {/* Special status alert (Make up, Substitute, etc.) */}
            {(session.isMakeupSession || session.isSubstituteTeacher || session.status === 'RESCHEDULED' || session.status === 'CANCELLED') && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-relaxed text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p>
                  {session.status === 'CANCELLED' ? 'Buổi học tạm hoãn. ' : ''}
                  {session.isMakeupSession ? 'Đây là buổi học bù. ' : ''}
                  {session.isSubstituteTeacher ? 'Buổi học có giảng viên dạy thay. ' : ''}
                  {session.status === 'RESCHEDULED' ? 'Buổi học đã được dời lịch.' : ''}
                </p>
              </div>
            )}

            {/* Attendance & Check-in Verification Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">Điểm danh buổi học</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                    isPresent
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isLate
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : isAbsent
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPresent
                        ? 'bg-emerald-500'
                        : isLate
                        ? 'bg-amber-500'
                        : isAbsent
                        ? 'bg-rose-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  {ATTENDANCE_LABELS[session.attendanceStatus] || 'Chưa điểm danh'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">Giờ check-in tại lớp:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {checkInLabel}
                </span>
              </div>

              {session.attendanceNote && (
                <p className="text-xs text-slate-500 italic pt-1">{session.attendanceNote}</p>
              )}
            </div>

            {/* Worksheet & Socratic Micro-Group Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100/70 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Phiếu bài tập · Buổi {session.sessionNo}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Tài liệu lớp
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-700">
                {session.assignedWorksheetTitle || 'Phiếu bài tập vi mô: Củng cố trọng tâm buổi học'}
              </p>

              {session.microGroupName && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50/80 border border-blue-200/60 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  <span>{session.microGroupName}</span>
                </div>
              )}

              {session.groupFocus && (
                <p className="text-xs text-slate-500">
                  <strong>Trọng tâm phụ đạo:</strong> {session.groupFocus}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col min-[420px]:flex-row gap-2.5 pt-2">
              {onPractice && session.skillId && session.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onPractice({ id: session.skillId, name: session.skillName, status: 'ACTIVE' });
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-4 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-98 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Ôn chuyên đề buổi {session.sessionNo}
                </button>
              )}

              {onAiTutor && (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onAiTutor();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 px-4 py-3.5 text-xs font-extrabold text-purple-800 transition-all hover:bg-purple-100/70 hover:border-purple-300 active:scale-98 cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                  Hỏi Gia sư AI
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
