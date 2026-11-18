import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Users,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Filter,
  Video,
  FileText,
  Layers,
  Award,
  ArrowRight,
  Bot,
  Play,
  Info,
  Building2,
  GraduationCap,
  CheckSquare
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';

const SESSION_STATUS_META = {
  COMPLETED: {
    label: 'Đã hoàn thành',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  SCHEDULED: {
    label: 'Sắp diễn ra',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  RESCHEDULED: {
    label: 'Đã dời lịch (Học bù)',
    badge: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  CANCELLED: {
    label: 'Tạm hoãn',
    badge: 'bg-rose-50 text-rose-700 border-rose-200'
  }
};

const ATTENDANCE_META = {
  PRESENT: {
    label: 'Có mặt đúng giờ',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500'
  },
  LATE: {
    label: 'Đi muộn',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500'
  },
  ABSENT: {
    label: 'Vắng mặt',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500'
  },
  EXCUSED: {
    label: 'Nghỉ có phép / Dời lịch',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    dot: 'bg-purple-500'
  },
  UNRECORDED: {
    label: 'Chưa điểm danh',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400'
  },
  NOT_RECORDED: {
    label: 'Chưa điểm danh',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400'
  }
};

const DAY_OF_WEEK_LABELS = {
  0: 'Chủ Nhật',
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy'
};

export default function StudentScheduleView({
  studentId = null,
  onOpenPracticeModal,
  onOpenAiTutor,
  onNavigateRoadmap
}) {
  const [terms, setTerms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [selectedCourseCode, setSelectedCourseCode] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | SCHEDULED | COMPLETED | MAKEUP_SUB
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadScheduleData = async (termIdFilter = selectedTermId) => {
    setIsLoading(true);
    try {
      const [termsData, coursesData, timetableData] = await Promise.all([
        practiceService.getAcademicTerms(),
        practiceService.getCourses(),
        practiceService.getStudentTimetable({
          studentId,
          termId: termIdFilter !== 'ALL' ? termIdFilter : null
        })
      ]);

      setTerms(Array.isArray(termsData) ? termsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTimetable(timetableData);

      if (Array.isArray(timetableData?.sessions) && timetableData.sessions.length > 0) {
        const nextUpcoming =
          timetableData.sessions.find((s) => s.status === 'SCHEDULED') ||
          timetableData.sessions[0];
        setSelectedSession(nextUpcoming);
      } else {
        setSelectedSession(null);
      }
    } catch {
      setTerms([]);
      setCourses([]);
      setTimetable({
        totalEnrolledClasses: 0,
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        excusedCount: 0,
        attendanceRatePct: 0,
        enrolledClasses: [],
        sessions: []
      });
      setSelectedSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData(selectedTermId);
  }, [studentId, selectedTermId]);

  const enrolledClasses = useMemo(() => timetable?.enrolledClasses || [], [timetable]);
  const primaryClass = enrolledClasses[0] || null;

  const filteredSessions = useMemo(() => {
    const all = Array.isArray(timetable?.sessions) ? timetable.sessions : [];
    return all.filter((s) => {
      if (selectedCourseCode !== 'ALL' && s.courseCode !== selectedCourseCode) {
        return false;
      }
      if (statusFilter === 'SCHEDULED' && s.status !== 'SCHEDULED') return false;
      if (statusFilter === 'COMPLETED' && s.status !== 'COMPLETED') return false;
      if (
        statusFilter === 'MAKEUP_SUB' &&
        !s.isMakeupSession &&
        !s.isSubstituteTeacher &&
        s.status !== 'RESCHEDULED'
      ) {
        return false;
      }
      return true;
    });
  }, [timetable, selectedCourseCode, statusFilter]);

  const formatDateVi = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = String(dateStr).split('T')[0].split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return String(dateStr);
    }
  };

  const formatCheckInTime = (isoStr) => {
    if (!isoStr) return 'Chưa ghi nhận';
    try {
      return new Date(isoStr).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Đã ghi nhận';
    }
  };

  return (
    <div className="space-y-6 animate-fade pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 border border-blue-600/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FACC15] border border-white/20 text-xs font-extrabold">
            <Calendar className="w-3.5 h-3.5" />
            <span>HỌC VỤ & THỜI KHÓA BIỂU THỰC CHIẾN V-EVAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Thời Khóa Biểu & Điểm Danh Chuyên Cần
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
            Theo dõi lịch học định kỳ hằng tuần theo Học kỳ và Khóa học, lịch học bù, thông tin giảng viên dạy thay, kết quả điểm danh chuyên cần từng buổi và phiếu bài tập thích ứng của Nhóm vi mô tại bàn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => loadScheduleData(selectedTermId)}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Đồng bộ lịch mới nhất</span>
          </button>

          {onOpenPracticeModal && (
            <button
              type="button"
              onClick={() => onOpenPracticeModal()}
              className="px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-yellow-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Làm Phiếu Bài Tập Nhóm Vi Mô</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Attendance & Schedule Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tỷ lệ Chuyên cần</div>
            <div className="text-2xl font-black text-emerald-600">
              {timetable?.attendanceRatePct ?? 0}%
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              {timetable?.presentCount ?? 0} có mặt • {timetable?.lateCount ?? 0} đi muộn
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tiến độ Buổi học</div>
            <div className="text-2xl font-black text-slate-900">
              {timetable?.completedSessions ?? 0}/{timetable?.totalSessions ?? 0} buổi
            </div>
            <div className="text-[11px] text-blue-600 font-bold">
              Còn {timetable?.upcomingSessions ?? 0} buổi sắp tới
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Học bù & Dạy thay</div>
            <div className="text-2xl font-black text-amber-600">
              {(timetable?.sessions || []).filter((s) => s.isMakeupSession || s.isSubstituteTeacher).length} buổi
            </div>
            <div className="text-[11px] text-amber-700 font-semibold">
              Theo dữ liệu điều phối thực tế
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Nhóm Vi Mô Tại Lớp</div>
            <div className="text-base font-black text-indigo-700 line-clamp-1">
              {primaryClass?.microGroupName || 'Chưa phân nhóm'}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              Số lớp đang học: {enrolledClasses.length} lớp
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Class, Weekly Schedule Pattern & Micro-Group Card */}
      {primaryClass && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {primaryClass.termCode && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-black">
                    {primaryClass.termCode}
                  </span>
                )}
                {primaryClass.courseCode && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black">
                    Mã khóa: {primaryClass.courseCode}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                  Tiến độ lớp: {primaryClass.completedSessions ?? 0}/{primaryClass.totalSessions ?? 0} buổi
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 pt-1">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>{primaryClass.className}</span>
                {primaryClass.courseName && (
                  <span className="text-xs font-semibold text-slate-500">
                    — {primaryClass.courseName}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
              {primaryClass.academicYear && (
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Năm học: {primaryClass.academicYear}</span>
                </div>
              )}
              {primaryClass.primaryTeacherName && (
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>GV Chủ nhiệm: <strong>{primaryClass.primaryTeacherName}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Weekly Schedule Pattern (ClassSchedules) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Khung Lịch Định Kỳ Hằng Tuần (Weekly Pattern)</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {formatDateVi(primaryClass.startDate)} → {formatDateVi(primaryClass.endDate)}
                </span>
              </div>

              {(primaryClass.weeklySchedules || []).length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 font-semibold">
                  Lớp học này hiện chưa được cấu hình khung lịch tuần cố định (ClassSchedules).
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(primaryClass.weeklySchedules || []).map((slot) => (
                    <div
                      key={slot.scheduleId}
                      className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-black">
                          {slot.dayOfWeekLabel || DAY_OF_WEEK_LABELS[slot.dayOfWeek] || `Thứ ${slot.dayOfWeek + 1}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          Ca {slot.slotNumber}
                        </span>
                      </div>
                      <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                      {slot.room && (
                        <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{slot.room}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Micro-Group & Adaptive Worksheet Assignment */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-amber-50/40 border border-indigo-200/80 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Phân Cụm Nhóm Vi Mô Tại Bàn & Phiếu Bài Tập ZPD</span>
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {primaryClass.microGroupName || 'Chưa phân cụm nhóm vi mô tại lớp'}
                </div>
                <div className="p-3 rounded-xl bg-white/90 border border-indigo-200/70 text-xs text-slate-700 space-y-1">
                  <div className="font-extrabold text-indigo-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phiếu bài tập củng cố được giao:</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    {primaryClass.assignedWorksheetTitle || 'Chưa có phiếu bài tập nhóm được giao'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {onOpenPracticeModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPracticeModal()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Làm Phiếu Bài Tập Nhóm Ngay</span>
                  </button>
                )}
                {onNavigateRoadmap && (
                  <button
                    type="button"
                    onClick={() => onNavigateRoadmap()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Xem Đồ Thị Lộ Trình Lớp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar + Timetable Sessions & Selected Session Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Interactive Session List */}
        <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Chi Tiết Từng Buổi Học & Nhật Ký Điểm Danh ({filteredSessions.length} buổi)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bấm vào bất kỳ buổi học nào để xem chi tiết chuyên đề, phòng học, giảng viên dạy thay hoặc lịch học bù
              </p>
            </div>

            {/* Term & Course Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Chọn học kỳ"
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Tất cả Học kỳ</option>
                {terms.map((t) => (
                  <option key={t.termId} value={t.termId}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Chọn khóa học"
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Tất cả Khóa học</option>
                {courses.map((c) => (
                  <option key={c.courseId || c.code} value={c.code}>
                    {c.code} ({c.durationWeeks} tuần)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `Tất cả (${timetable?.sessions?.length || 0})` },
              {
                id: 'SCHEDULED',
                label: `Sắp diễn ra (${(timetable?.sessions || []).filter((s) => s.status === 'SCHEDULED').length})`
              },
              {
                id: 'COMPLETED',
                label: `Đã hoàn thành (${(timetable?.sessions || []).filter((s) => s.status === 'COMPLETED').length})`
              },
              {
                id: 'MAKEUP_SUB',
                label: `Học bù & Dạy thay (${(timetable?.sessions || []).filter((s) => s.isMakeupSession || s.isSubstituteTeacher || s.status === 'RESCHEDULED').length})`
              }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Session Cards List */}
          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-black text-slate-800">
                  Chưa có buổi học nào được tạo trong thời khóa biểu
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Lịch học sẽ tự động hiển thị tại đây ngay khi Học vụ xếp lớp, thiết lập khung lịch tuần và sinh buổi học trên hệ thống.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.sessionId === session.sessionId;
                const statusMeta = SESSION_STATUS_META[session.status] || SESSION_STATUS_META.SCHEDULED;
                const attMeta = ATTENDANCE_META[session.attendanceStatus] || ATTENDANCE_META.NOT_RECORDED;

                return (
                  <div
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-slate-50/60 hover:bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-black">
                          Buổi {session.sessionNo}
                        </span>
                        <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {session.dayOfWeekLabel || DAY_OF_WEEK_LABELS[session.dayOfWeek] || 'Lịch học'}, {formatDateVi(session.sessionDate)}
                          </span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {session.startTime} – {session.endTime}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                        {session.isMakeupSession && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
                            ⚡ Buổi Học Bù
                          </span>
                        )}
                        {session.isSubstituteTeacher && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-black">
                            👨‍🏫 GV Dạy Thay
                          </span>
                        )}
                      </div>

                      <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {session.topicTitle || `Buổi ${session.sessionNo} — ${session.className}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-semibold">
                        {session.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{session.room}</span>
                          </span>
                        )}
                        {session.className && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>{session.className}</span>
                          </span>
                        )}
                        {session.skillName && (
                          <span className="text-indigo-700 font-bold">
                            Chuyên đề: {session.skillName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Attendance Badge & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${attMeta.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${attMeta.dot}`}></span>
                        <span>{attMeta.label}</span>
                      </span>

                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        <span>Chi tiết buổi học</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 4 Columns: Selected Session Inspector */}
        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-20">
          {selectedSession ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-md space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-black">
                      Buổi {selectedSession.sessionNo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {formatDateVi(selectedSession.sessionDate)} ({selectedSession.startTime} – {selectedSession.endTime})
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 leading-snug pt-1">
                    {selectedSession.topicTitle || `Buổi ${selectedSession.sessionNo} — ${selectedSession.className}`}
                  </h4>
                </div>
              </div>

              {/* Session Operational Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Phòng học:</span>
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedSession.room || 'Chưa xếp phòng'}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Lớp học phần:</span>
                    <span className="font-black text-slate-900">{selectedSession.className || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Chuyên đề trọng tâm:</span>
                    <span className="font-extrabold text-indigo-700">{selectedSession.skillName || 'Theo đề cương lớp'}</span>
                  </div>
                </div>

                {/* Substitute / Rescheduled / Makeup Alert if applicable */}
                {(selectedSession.isSubstituteTeacher ||
                  selectedSession.isMakeupSession ||
                  selectedSession.status === 'RESCHEDULED') && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                    <div className="font-black flex items-center gap-1.5 text-amber-900">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Thông báo Điều phối Học vụ:</span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">
                      {selectedSession.isSubstituteTeacher &&
                        'Buổi học này có giảng viên dạy thay được phân công trên hệ thống. '}
                      {selectedSession.isMakeupSession &&
                        'Đây là buổi học bù được liên kết từ buổi học đã dời lịch trước đó. '}
                      {selectedSession.status === 'RESCHEDULED' &&
                        'Buổi học này đã được học vụ dời sang lịch học bù.'}
                    </p>
                  </div>
                )}

                {/* Attendance Record Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950">Trạng thái Điểm danh:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${
                        (ATTENDANCE_META[selectedSession.attendanceStatus] || ATTENDANCE_META.NOT_RECORDED).badge
                      }`}
                    >
                      {(ATTENDANCE_META[selectedSession.attendanceStatus] || ATTENDANCE_META.NOT_RECORDED).label}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center justify-between">
                    <span>Giờ Check-in tại lớp:</span>
                    <strong className="font-mono text-slate-900">
                      {formatCheckInTime(selectedSession.checkInAt)}
                    </strong>
                  </div>
                  {selectedSession.attendanceNote && (
                    <div className="text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-200/80 font-medium">
                      📌 {selectedSession.attendanceNote}
                    </div>
                  )}
                </div>

                {/* Micro-group & Worksheet Box */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="font-black text-indigo-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Phiếu Bài Tập Củng Cố Buổi {selectedSession.sessionNo}:</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    {selectedSession.assignedWorksheetTitle || 'Chưa giao phiếu bài tập cho buổi này'}
                  </div>
                  {selectedSession.microGroupName && (
                    <div className="text-[11px] text-indigo-700 font-semibold">
                      {selectedSession.microGroupName}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Selected Session */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {onOpenPracticeModal && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenPracticeModal({
                        id: selectedSession.skillId,
                        name: selectedSession.skillName,
                        status: 'ACTIVE'
                      })
                    }
                    className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                    <span>Luyện ZPD Buổi {selectedSession.sessionNo}</span>
                  </button>
                )}

                {onOpenAiTutor && (
                  <button
                    type="button"
                    onClick={() => onOpenAiTutor()}
                    className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hỏi Gia Sư AI</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm text-center space-y-2">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-black text-slate-800">Chưa chọn buổi học</div>
              <p className="text-xs text-slate-500">
                Chọn một buổi học bên trái sau khi lớp đã được sinh thời khóa biểu để xem chi tiết điểm danh và tài liệu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

