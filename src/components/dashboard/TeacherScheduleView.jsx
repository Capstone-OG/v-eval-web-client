import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Filter,
  CheckSquare,
  Building2,
  GraduationCap,
  RotateCw,
  X,
  Layers,
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import ClassMicroGroupsModal from '../modals/ClassMicroGroupsModal';
import { toast } from '../../context/ToastContext';

const ATTENDANCE_BADGE_MAP = {
  PRESENT: { label: 'Có mặt', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  LATE: { label: 'Đi muộn', badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  ABSENT: { label: 'Vắng mặt', badge: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  EXCUSED: { label: 'Nghỉ có phép', badge: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' }
};

export default function TeacherScheduleView({ currentUser }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | SCHEDULED | COMPLETED
  const [searchQuery, setSearchQuery] = useState('');

  // Attendance Modal State
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Micro-Groups Modal State
  const [microGroupClass, setMicroGroupClass] = useState(null);
  const [isMicroGroupsOpen, setIsMicroGroupsOpen] = useState(false);

  const teacherId = currentUser?.id || currentUser?.userId;

  // 1. Fetch available classes for filtering
  useEffect(() => {
    let active = true;
    practiceService.getClasses()
      .then((res) => {
        if (!active) return;
        const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const mapped = raw.map((c) => ({
          ...c,
          id: c.classId || c.id,
          classId: c.classId || c.id
        }));
        setClassesList(mapped);
      })
      .catch((err) => {
        console.warn('[TeacherScheduleView] Error loading classes:', err.message);
      });
    return () => { active = false; };
  }, []);

  // 2. Load Teacher Schedule
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedClassId && selectedClassId !== 'ALL') {
        const classSessions = await practiceService.getClassSessions(selectedClassId);
        const list = Array.isArray(classSessions) ? classSessions : [];
        const currentClass = classesList.find((c) => (c.classId || c.id) === selectedClassId);
        setScheduleData({
          totalAssignedClasses: 1,
          totalSessionsInView: list.length,
          completedSessionsCount: list.filter((s) => (s.sessionStatus || s.status) === 'COMPLETED').length,
          substituteSessionsCount: list.filter((s) => s.isSubstituteTeacher).length,
          upcomingSessionsCount: list.filter((s) => (s.sessionStatus || s.status) !== 'COMPLETED').length,
          availableTerms: [],
          sessions: list.map((s) => ({
            ...s,
            className: s.className || currentClass?.name || 'Lớp học',
            sessionStatus: s.sessionStatus || s.status || 'SCHEDULED',
            enrolledStudentsCount: s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0
          }))
        });
      } else {
        const data = await practiceService.getTeacherSchedule({
          teacherId,
          termId: selectedTermId !== 'ALL' ? selectedTermId : null
        });

        if (data?.sessions && data.sessions.length > 0) {
          setScheduleData({
            ...data,
            sessions: data.sessions.map((s) => ({
              ...s,
              sessionStatus: s.sessionStatus || s.status || 'SCHEDULED',
              enrolledStudentsCount: s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0
            }))
          });
        } else {
          // If teacher has no directly mapped sessions, aggregate sessions from the active classes
          const allClasses = await practiceService.getClasses();
          const validClasses = (Array.isArray(allClasses) ? allClasses : []).slice(0, 5);
          const aggregatedSessions = [];

          for (const cls of validClasses) {
            const cid = cls.classId || cls.id;
            try {
              const cs = await practiceService.getClassSessions(cid);
              if (Array.isArray(cs)) {
                cs.forEach((s) => {
                  aggregatedSessions.push({
                    ...s,
                    className: s.className || cls.name,
                    sessionStatus: s.sessionStatus || s.status || 'SCHEDULED',
                    enrolledStudentsCount: s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0
                  });
                });
              }
            } catch {
              // skip
            }
          }

          setScheduleData({
            totalAssignedClasses: validClasses.length,
            totalSessionsInView: aggregatedSessions.length,
            completedSessionsCount: aggregatedSessions.filter((s) => (s.sessionStatus || s.status) === 'COMPLETED').length,
            substituteSessionsCount: aggregatedSessions.filter((s) => s.isSubstituteTeacher).length,
            upcomingSessionsCount: aggregatedSessions.filter((s) => (s.sessionStatus || s.status) !== 'COMPLETED').length,
            availableTerms: [],
            sessions: aggregatedSessions
          });
        }
      }
    } catch (err) {
      console.warn('[TeacherScheduleView] Error loading teacher schedule:', err.message);
      setScheduleData({
        totalAssignedClasses: 0,
        totalSessionsInView: 0,
        completedSessionsCount: 0,
        substituteSessionsCount: 0,
        upcomingSessionsCount: 0,
        availableTerms: [],
        assignedClassesByTermAndCourse: [],
        sessions: []
      });
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedClassId, selectedTermId, classesList]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    const list = scheduleData?.sessions || [];
    return list.filter((s) => {
      if (statusFilter !== 'ALL' && s.sessionStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const className = String(s.className || '').toLowerCase();
        const topic = String(s.topicTitle || s.skillName || '').toLowerCase();
        const room = String(s.room || '').toLowerCase();
        if (!className.includes(q) && !topic.includes(q) && !room.includes(q)) return false;
      }
      return true;
    });
  }, [scheduleData?.sessions, statusFilter, searchQuery]);

  // Group Sessions by Date
  const groupedSessions = useMemo(() => {
    const map = new Map();
    for (const session of filteredSessions) {
      const dateKey = session.sessionDate || 'Lịch chưa xếp ngày';
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(session);
    }
    return Array.from(map.entries());
  }, [filteredSessions]);

  // Open Attendance Modal
  const handleOpenAttendance = async (session) => {
    setAttendanceSession(session);
    setLoadingAttendance(true);
    setAttendanceRecords([]);
    try {
      // 1. Fetch current attendances for this session
      const res = await practiceService.getSessionAttendances(session.sessionId);
      const records = res?.records || res?.Records || [];

      // Fetch class heatmap to get real student names
      let nameMap = new Map();
      try {
        const heatmap = await practiceService.getClassHeatmap(session.classId);
        (heatmap?.rows || []).forEach((row) => {
          nameMap.set(row.studentId, row.studentName);
        });
      } catch {
        // ignore
      }

      if (records.length > 0) {
        setAttendanceRecords(records.map(r => ({
          studentId: r.studentId,
          studentName: r.studentName || nameMap.get(r.studentId) || `Học sinh #${String(r.studentId).slice(0, 6).toUpperCase()}`,
          status: r.status || 'PRESENT',
          note: r.note || ''
        })));
      } else {
        // 2. If no attendance records yet, fetch class roster to initialize
        const heatmap = await practiceService.getClassHeatmap(session.classId);
        const rows = heatmap?.rows || [];
        setAttendanceRecords(rows.map(row => ({
          studentId: row.studentId,
          studentName: row.studentName,
          status: 'PRESENT',
          note: ''
        })));
      }
    } catch (err) {
      console.warn('[TeacherScheduleView] Error loading session attendances:', err.message);
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Change single student attendance
  const handleChangeStatus = (studentId, status) => {
    setAttendanceRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, status: 'PRESENT' })));
    toast.info('Đã đánh dấu tất cả học sinh có mặt!');
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!attendanceSession || attendanceRecords.length === 0) return;
    setSavingAttendance(true);
    try {
      const payload = {
        attendances: attendanceRecords.map(r => ({
          studentId: r.studentId,
          status: r.status,
          note: r.note || null
        })),
        markSessionCompleted: true
      };
      await practiceService.submitSessionAttendances(attendanceSession.sessionId, payload);
      toast.success('Đã lưu kết quả điểm danh thành công!');
      setAttendanceSession(null);
      loadSchedule();
    } catch (err) {
      toast.error('Không thể lưu điểm danh: ' + (err?.message || 'Lỗi kết nối'));
    } finally {
      setSavingAttendance(false);
    }
  };

  // Open Micro Groups Modal
  const handleOpenMicroGroups = (session) => {
    setMicroGroupClass({
      id: session.classId,
      name: session.className,
      totalStudents: session.enrolledStudentsCount ?? session.totalStudentsCount ?? 0,
      assignedTeacher: session.primaryTeacherName || currentUser?.fullName || 'Thầy/Cô phụ trách'
    });
    setIsMicroGroupsOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 lg:p-7 text-white border border-indigo-900/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Lịch Lên Lớp & Giảng Dạy
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 border-emerald-400/30 text-emerald-300">
              ● Đồng bộ thời gian thực
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Thời Khóa Biểu & Điểm Danh Chuyên Cần
          </h1>
          <p className="text-xs lg:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
            Theo dõi các ca dạy trong tuần, phòng học, chuyên đề bài học và thực hiện điểm danh học sinh trực tiếp tại lớp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={loadSchedule}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới thời khóa biểu</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Lớp học phụ trách</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {scheduleData?.totalAssignedClasses ?? 0} lớp
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Ca dạy sắp tới</div>
            <div className="text-2xl font-black text-indigo-600 mt-0.5">
              {scheduleData?.upcomingSessionsCount ?? 0} ca
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Ca đã hoàn thành</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {scheduleData?.completedSessionsCount ?? 0} ca
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Dạy thay / Học bù</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {scheduleData?.substituteSessionsCount ?? 0} ca
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm lớp, phòng, chuyên đề..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Class Filter */}
            {classesList.length > 0 && (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Tất cả lớp phụ trách</option>
                {classesList.map((c) => {
                  const cid = c.classId || c.id;
                  return (
                    <option key={cid} value={cid}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Term Filter */}
            {(scheduleData?.availableTerms || []).length > 0 && (
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Tất cả học kỳ</option>
                {scheduleData.availableTerms.map((t) => (
                  <option key={t.termId} value={t.termId}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tất cả ca dạy</option>
              <option value="SCHEDULED">Sắp diễn ra</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Hiển thị <span className="text-indigo-600 font-black">{filteredSessions.length}</span> ca giảng dạy
          </div>
        </div>

        {/* Sessions Calendar / Timeline */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Đang tải thời khóa biểu giảng dạy...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-xs font-extrabold text-slate-700">
              Không có ca dạy nào khớp với bộ lọc hiện tại.
            </div>
            <p className="text-xs text-slate-500">
              Thời khóa biểu sẽ tự động hiển thị khi học vụ phân công ca dạy cho các lớp bạn phụ trách.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedSessions.map(([dateStr, sessions]) => (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {sessions[0]?.dayOfWeekLabel || 'Lịch dạy'} • {dateStr}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    ({sessions.length} ca học)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {sessions.map((s) => {
                    const isCompleted = s.sessionStatus === 'COMPLETED';
                    const hasAttendance = s.presentCount > 0 || s.absentCount > 0 || s.lateCount > 0;

                    return (
                      <div
                        key={s.sessionId}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2.5">
                          {/* Time & Room */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{s.room || 'Phòng học'}</span>
                            </span>
                          </div>

                          {/* Class Name & Course */}
                          <div>
                            <div className="font-black text-sm text-slate-900 line-clamp-1">
                              {s.className}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                              {s.courseName || s.courseCode || 'Khóa học ĐGNL'} • Buổi số {s.sessionNo}
                            </div>
                          </div>

                          {/* Topic / Skill */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="text-xs font-bold text-slate-800 line-clamp-2">
                              {s.topicTitle || s.skillName || 'Luyện tập chuyên đề theo năng lực'}
                            </div>
                          </div>

                          {/* Attendance Status Pill */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>Sĩ số: <strong>{s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0} HS</strong></span>
                            </span>

                            {hasAttendance ? (
                              <span className="text-emerald-700 font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                  {s.presentCount} có mặt ({
                                    (s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0) > 0
                                      ? Math.round(((s.presentCount || 0) / (s.enrolledStudentsCount ?? s.totalStudentsCount ?? 1)) * 100)
                                      : 0
                                  }%)
                                </span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-extrabold">
                                Chưa điểm danh
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleOpenAttendance(s)}
                            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              hasAttendance
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{hasAttendance ? 'Xem / Sửa điểm danh' : 'Điểm danh lớp'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenMicroGroups(s)}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                            title="Xếp nhóm học tập vi mô cho lớp này"
                          >
                            <Layers className="w-4 h-4 text-amber-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {attendanceSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Điểm Danh Chuyên Cần — {attendanceSession.className}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Buổi số {attendanceSession.sessionNo} • {attendanceSession.sessionDate} ({attendanceSession.dayOfWeekLabel})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAttendanceSession(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                Sĩ số lớp: <strong>{attendanceRecords.length} học sinh</strong>
              </span>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tất cả có mặt</span>
              </button>
            </div>

            {/* Students Attendance List */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1 max-h-[50vh]">
              {loadingAttendance ? (
                <div className="py-12 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Đang tải danh sách học sinh...</span>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Lớp học chưa có danh sách học sinh. Vui lòng kiểm tra lại thông tin phân lớp.
                </div>
              ) : (
                attendanceRecords.map((st) => (
                  <div
                    key={st.studentId}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                        {String(st.studentName || 'H').charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">{st.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{st.studentId}</div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-wrap items-center gap-1">
                      {['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((statusKey) => {
                        const meta = ATTENDANCE_BADGE_MAP[statusKey];
                        const isSelected = st.status === statusKey;
                        return (
                          <button
                            key={statusKey}
                            type="button"
                            onClick={() => handleChangeStatus(st.studentId, statusKey)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                              isSelected
                                ? meta.badge + ' shadow-xs ring-1 ring-black/10'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAttendanceSession(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={savingAttendance || attendanceRecords.length === 0}
                onClick={handleSaveAttendance}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingAttendance && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Lưu điểm danh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Micro-Groups Modal */}
      <ClassMicroGroupsModal
        isOpen={isMicroGroupsOpen}
        onClose={() => setIsMicroGroupsOpen(false)}
        classData={microGroupClass}
      />
    </div>
  );
}

