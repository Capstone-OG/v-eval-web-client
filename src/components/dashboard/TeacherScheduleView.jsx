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
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Bookmark,
  ArrowRight
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import ClassMicroGroupsModal from '../modals/ClassMicroGroupsModal';
import OfflineSessionPreparationModal from '../modals/OfflineSessionPreparationModal';
import { getOfflineSessionPlan } from '../../utils/offlineSessionStore';
import { getRemedialSessions, getAllRemedialSessions } from '../../utils/remedialSessionStore';
import { toast } from '../../context/ToastContext';

const ATTENDANCE_BADGE_MAP = {
  PRESENT: { label: 'Có mặt', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  LATE: { label: 'Đi muộn', badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  ABSENT: { label: 'Vắng mặt', badge: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  EXCUSED: { label: 'Nghỉ có phép', badge: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' }
};

// 6 Standard Academic Teaching Slots (Khung 6 Slot chuẩn của trung tâm)
const TIME_SLOTS = [
  { slot: 1, label: 'Slot 1', timeRange: '07:30 - 09:30', period: 'Sáng', startHour: 7.5, endHour: 9.5 },
  { slot: 2, label: 'Slot 2', timeRange: '09:45 - 11:45', period: 'Sáng', startHour: 9.75, endHour: 11.75 },
  { slot: 3, label: 'Slot 3', timeRange: '13:00 - 15:00', period: 'Chiều', startHour: 13.0, endHour: 15.0 },
  { slot: 4, label: 'Slot 4', timeRange: '15:15 - 17:15', period: 'Chiều', startHour: 15.25, endHour: 17.25 },
  { slot: 5, label: 'Slot 5', timeRange: '18:00 - 20:00', period: 'Tối', startHour: 18.0, endHour: 20.0 },
  { slot: 6, label: 'Slot 6', timeRange: '20:15 - 22:30', period: 'Tối', startHour: 20.25, endHour: 22.5 }
];

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// Helper functions for Date calculations
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(date.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatDateVi(d) {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toYMD(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

// Map a session's startTime or slotNo to slot 1-6
function getSessionSlot(session) {
  if (session.slotNo && session.slotNo >= 1 && session.slotNo <= 6) {
    return session.slotNo;
  }
  const timeStr = String(session.startTime || '');
  if (!timeStr) return 5;
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0], 10) + (parseInt(parts[1], 10) || 0) / 60;
  if (hour < 9.6) return 1;
  if (hour < 12.0) return 2;
  if (hour < 15.1) return 3;
  if (hour < 17.5) return 4;
  if (hour < 20.1) return 5;
  return 6;
}

export default function TeacherScheduleView({ currentUser }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | SCHEDULED | COMPLETED
  const [searchQuery, setSearchQuery] = useState('');

  // Weekly Matrix View Controls
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Lưới tuần - Ảnh 2) | 'agenda' (Danh sách thẻ)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  // Attendance Modal State
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Micro-Groups Modal State
  const [microGroupClass, setMicroGroupClass] = useState(null);
  const [isMicroGroupsOpen, setIsMicroGroupsOpen] = useState(false);

  // Offline Session Preparation Modal State (Flipped Classroom 2 Parts)
  const [prepSession, setPrepSession] = useState(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [offlineRefreshTick, setOfflineRefreshTick] = useState(0);

  useEffect(() => {
    const handler = () => setOfflineRefreshTick((v) => v + 1);
    window.addEventListener('veval:offline-session-updated', handler);
    return () => window.removeEventListener('veval:offline-session-updated', handler);
  }, []);

  const handleOpenPrepModal = (session) => {
    setPrepSession(session);
    setIsPrepModalOpen(true);
  };

  const teacherId = currentUser?.id || currentUser?.userId;

  // 1. Fetch ONLY classes assigned to this teacher (không kéo toàn bộ lớp các cơ sở khác)
  useEffect(() => {
    if (!teacherId) {
      setClassesList([]);
      return;
    }
    let active = true;
    practiceService.getClasses({
      teacherId,
      termId: selectedTermId !== 'ALL' ? selectedTermId : null
    })
      .then((res) => {
        if (!active) return;
        const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const mapped = raw
          .filter((c) => !c.teacherId || String(c.teacherId).toLowerCase() === String(teacherId).toLowerCase())
          .map((c) => ({
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
  }, [teacherId, selectedTermId]);

  // 2. Load Teacher Schedule (Kết hợp lịch chính khóa & các buổi phụ đạo nhóm vi mô đã lên)
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      // Nạp các buổi phụ đạo vi mô từ remedialSessionStore
      const remedialList = selectedClassId && selectedClassId !== 'ALL'
        ? getRemedialSessions(selectedClassId)
        : getAllRemedialSessions();

      const mappedRemedial = remedialList.map((rs) => {
        const rawSkill = rs.focusSkill || rs.topic?.replace(/^Phụ đạo:\s*/i, '') || rs.skillName || 'Bồi dưỡng chuyên đề';
        const currentCls = classesList.find(c => (c.classId || c.id) === rs.classId);
        const enrolledCount = rs.studentCount || (rs.members || rs.students || []).length || 0;
        const studentIds = (rs.members || rs.students || []).map(m => m.studentId || m.id).filter(Boolean);

        return {
          sessionId: rs.id || `RS-${rs.groupId}`,
          id: rs.id || `RS-${rs.groupId}`,
          sessionNo: 'Phụ đạo',
          sessionDate: rs.sessionDate,
          slotNo: rs.slotNo || getSessionSlot({ startTime: rs.startTime || rs.timeSlot?.split(' - ')[0] }),
          startTime: rs.startTime || '13:00',
          endTime: rs.endTime || '15:00',
          className: rs.className || currentCls?.name || 'Lớp phụ trách',
          classId: rs.classId,
          classCode: currentCls?.code || `CLS-${String(rs.classId || '').slice(0, 8)}`,
          topicTitle: `Phụ đạo: ${rawSkill}`,
          skillName: rawSkill,
          focusSkill: rawSkill,
          focusSkillId: rs.focusSkillId || null,
          room: rs.room || (rs.format === 'ONLINE' ? 'Trực tuyến (Live Q&A)' : 'Phòng phụ đạo P.204'),
          deliveryMode: rs.format === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
          sessionStatus: 'SCHEDULED',
          isRemedial: true,
          groupId: rs.groupId,
          groupName: rs.groupName,
          enrolledStudentsCount: enrolledCount,
          totalStudentsCount: enrolledCount,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          targetStudentIds: studentIds,
          members: rs.members || rs.students || [],
          students: rs.members || rs.students || [],
          primaryTeacherName: rs.teacherName || currentUser?.fullName || currentUser?.name || 'Giảng viên phụ trách',
          notes: rs.notes
        };
      });

      let regularSessions = [];
      let assignedFromSchedule = [];
      let availableTermsFromSchedule = [];

      if (selectedClassId && selectedClassId !== 'ALL') {
        const classSessions = await practiceService.getClassSessions(selectedClassId);
        const list = Array.isArray(classSessions) ? classSessions : [];
        const currentClass = classesList.find((c) => (c.classId || c.id) === selectedClassId);
        regularSessions = list.map((s) => ({
          ...s,
          className: s.className || currentClass?.name || 'Lớp học',
          sessionStatus: s.sessionStatus || s.status || 'SCHEDULED',
          enrolledStudentsCount: s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0
        }));
      } else {
        const data = await practiceService.getTeacherSchedule({
          teacherId,
          termId: selectedTermId !== 'ALL' ? selectedTermId : null
        });

        assignedFromSchedule = Array.isArray(data?.assignedClassesByTermAndCourse)
          ? data.assignedClassesByTermAndCourse
          : [];
        availableTermsFromSchedule = Array.isArray(data?.availableTerms) ? data.availableTerms : [];

        if (data?.sessions && data.sessions.length > 0) {
          regularSessions = data.sessions.map((s) => ({
            ...s,
            sessionStatus: s.sessionStatus || s.status || 'SCHEDULED',
            enrolledStudentsCount: s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0
          }));
        } else if (classesList.length > 0) {
          // Chỉ tổng hợp lịch từ các lớp thực sự thuộc giảng viên này (không lấy lớp toàn hệ thống)
          const aggregatedSessions = [];
          for (const cls of classesList) {
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
          regularSessions = aggregatedSessions;
        }
      }

      const combined = [...regularSessions, ...mappedRemedial];
      const assignedCount = assignedFromSchedule.length > 0 ? assignedFromSchedule.length : classesList.length;
      setScheduleData({
        totalAssignedClasses: assignedCount,
        totalSessionsInView: combined.length,
        completedSessionsCount: combined.filter((s) => (s.sessionStatus || s.status) === 'COMPLETED').length,
        substituteSessionsCount: combined.filter((s) => s.isSubstituteTeacher).length,
        upcomingSessionsCount: combined.filter((s) => (s.sessionStatus || s.status) !== 'COMPLETED').length,
        availableTerms: availableTermsFromSchedule,
        assignedClassesByTermAndCourse: assignedFromSchedule,
        sessions: combined
      });
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
  }, [teacherId, selectedClassId, selectedTermId, classesList, currentUser]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Đồng bộ tức thời khi có lịch phụ đạo mới được lên hoặc bị xóa từ ClassMicroGroupsModal
  useEffect(() => {
    const handleRemedialChange = () => {
      loadSchedule();
    };
    window.addEventListener('veval:remedial-session-scheduled', handleRemedialChange);
    window.addEventListener('veval:remedial-session-deleted', handleRemedialChange);
    return () => {
      window.removeEventListener('veval:remedial-session-scheduled', handleRemedialChange);
      window.removeEventListener('veval:remedial-session-deleted', handleRemedialChange);
    };
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

  // Group Sessions by Date for Agenda / Timeline mode
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

  // 7 Days of the currently selected week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const monday = getMonday(currentWeekDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentWeekDate]);

  const weekLabel = useMemo(() => {
    if (weekDays.length < 7) return '';
    return `Tuần (${formatDateVi(weekDays[0])} - ${formatDateVi(weekDays[6])})`;
  }, [weekDays]);

  // Find next upcoming session in the future to offer a quick jump if current week is empty
  const nextUpcomingSession = useMemo(() => {
    const todayStr = toYMD(new Date());
    const upcoming = filteredSessions
      .filter((s) => s.sessionDate && s.sessionDate >= todayStr)
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
    return upcoming[0] || null;
  }, [filteredSessions]);

  // Sessions falling into the current week view
  const currentWeekSessionsCount = useMemo(() => {
    const startStr = toYMD(weekDays[0]);
    const endStr = toYMD(weekDays[6]);
    return filteredSessions.filter((s) => s.sessionDate >= startStr && s.sessionDate <= endStr).length;
  }, [filteredSessions, weekDays]);

  // Week navigation handlers
  const handlePrevWeek = () => {
    setCurrentWeekDate((prev) => new Date(prev.getTime() - 7 * 86400000));
  };

  const handleNextWeek = () => {
    setCurrentWeekDate((prev) => new Date(prev.getTime() + 7 * 86400000));
  };

  const handleTodayWeek = () => {
    setCurrentWeekDate(new Date());
  };

  const handleJumpToSessionWeek = (sessionDateStr) => {
    if (!sessionDateStr) return;
    const parts = sessionDateStr.split('-');
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    setCurrentWeekDate(target);
  };

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
        setAttendanceRecords(
          records.map((r) => ({
            studentId: r.studentId,
            studentName: r.studentName || nameMap.get(r.studentId) || (r.studentId ? `Học sinh ${String(r.studentId).slice(0, 6)}` : 'Học sinh'),
            status: r.status || 'PRESENT',
            note: r.note || ''
          }))
        );
      } else {
        // 2. If no attendance records yet, fetch class roster to initialize
        const heatmap = await practiceService.getClassHeatmap(session.classId);
        const rows = heatmap?.rows || [];
        setAttendanceRecords(
          rows.map((row) => ({
            studentId: row.studentId,
            studentName: row.studentName,
            status: 'PRESENT',
            note: ''
          }))
        );
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
    setAttendanceRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' })));
    toast.info('Đã đánh dấu tất cả học sinh có mặt!');
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!attendanceSession || attendanceRecords.length === 0) return;
    setSavingAttendance(true);
    try {
      const payload = {
        attendances: attendanceRecords.map((r) => ({
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
    const focusSkillName = session.focusSkill || session.skillName || (session.isRemedial ? session.topicTitle?.replace(/^Phụ đạo:\s*/i, '') : null);
    const targetStudentIds = (session.targetStudentIds && session.targetStudentIds.length > 0)
      ? session.targetStudentIds
      : ((session.members || session.students || []).map(m => m.studentId || m.id).filter(Boolean));

    setMicroGroupClass({
      id: session.classId,
      classId: session.classId,
      name: session.className,
      code: session.classCode || `CLS-${String(session.classId || '').slice(0, 8)}`,
      totalStudents: session.enrolledStudentsCount ?? session.totalStudentsCount ?? 0,
      assignedTeacher: session.primaryTeacherName || currentUser?.fullName || 'Thầy/Cô phụ trách',
      focusSkill: focusSkillName || null,
      focusSkillId: session.focusSkillId || null,
      targetGroupId: session.groupId || null,
      targetStudentIds: targetStudentIds || [],
      initialMembers: session.members || session.students || [],
      isRemedial: !!session.isRemedial
    });
    setIsMicroGroupsOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade">
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

      {/* Main Weekly Timetable Container (Ma Trận Thời Khóa Biểu Tuần) */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-200/90 shadow-sm space-y-5">
        {/* Top Header Bar: Title, Week Navigator & View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Thời khóa biểu tuần</span>
            </h2>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {weekLabel}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-medium">
                {currentWeekSessionsCount} ca học trong tuần này
              </span>
            </div>
          </div>

          {/* Week Navigation Controls & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Prev / Today / Next Week Buttons */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={handlePrevWeek}
                title="Tuần trước"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleTodayWeek}
                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-white transition-all cursor-pointer"
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={handleNextWeek}
                title="Tuần sau"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle: Grid vs Agenda */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới tuần</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Reload Schedule Button */}
            <button
              type="button"
              onClick={loadSchedule}
              disabled={loading}
              title="Làm mới lịch dạy"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Search, Class, Term, Status) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
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
            Tổng cộng: <span className="text-indigo-600 font-black">{filteredSessions.length}</span> ca học
          </div>
        </div>

        {/* Smart Notice: If current week has 0 sessions but upcoming sessions exist, show helpful jump banner */}
        {currentWeekSessionsCount === 0 && nextUpcomingSession && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-950 font-semibold">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Tuần này không có ca dạy. Ca dạy gần nhất diễn ra vào{' '}
                <strong>{nextUpcomingSession.dayOfWeekLabel || 'Lịch'} ngày {formatDateVi(new Date(nextUpcomingSession.sessionDate))}</strong> ({nextUpcomingSession.className}).
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleJumpToSessionWeek(nextUpcomingSession.sessionDate)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Chuyển đến tuần này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area: Grid Mode (Ảnh 2) OR Agenda Mode */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Đang tải ma trận thời khóa biểu tuần...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-extrabold text-slate-700">
              Không có ca dạy nào khớp với bộ lọc hiện tại.
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thời khóa biểu sẽ tự động hiển thị khi học vụ phân công ca dạy cho các lớp bạn phụ trách.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ========================================================================= */
          /* VIEW 1: WEEKLY TIMETABLE MATRIX TABLE (Chuẩn Thiết Kế Ảnh 2)             */
          /* ========================================================================= */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full border-collapse text-left min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {/* Slot Column Header */}
                  <th className="w-28 min-w-[100px] p-3 text-center text-xs font-black uppercase text-slate-600 bg-slate-100/80 border-r border-slate-200">
                    Slot
                  </th>

                  {/* 7 Day Column Headers */}
                  {weekDays.map((day, idx) => {
                    const isCurrentDay = isSameDay(day, new Date());
                    return (
                      <th
                        key={idx}
                        className={`p-3 text-center text-xs border-r border-slate-200 transition-colors ${
                          isCurrentDay
                            ? 'bg-emerald-100/80 text-emerald-950 font-black border-b-2 border-b-emerald-600'
                            : 'bg-slate-50 text-slate-700 font-extrabold'
                        } ${idx === 6 ? 'border-r-0' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={isCurrentDay ? 'text-emerald-900 font-black' : 'text-slate-800'}>
                            {DAY_NAMES[idx]} ({formatDateVi(day)})
                          </span>
                          {isCurrentDay && (
                            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                              (Hôm nay)
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {TIME_SLOTS.map((slotObj) => (
                  <tr key={slotObj.slot} className="hover:bg-slate-50/50 transition-colors">
                    {/* Column 1: Slot Indicator */}
                    <td className="p-3 text-center bg-slate-50/60 border-r border-slate-200 align-middle">
                      <div className="font-black text-xs text-slate-900">{slotObj.label}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5 whitespace-nowrap">
                        {slotObj.timeRange}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                        {slotObj.period}
                      </span>
                    </td>

                    {/* Columns 2-8: 7 Days Cells */}
                    {weekDays.map((day, dIdx) => {
                      const dayStr = toYMD(day);
                      const isCurrentDay = isSameDay(day, new Date());

                      // Find all sessions on this day and in this slot
                      const cellSessions = filteredSessions.filter(
                        (s) => s.sessionDate === dayStr && getSessionSlot(s) === slotObj.slot
                      );

                      return (
                        <td
                          key={dIdx}
                          className={`p-2.5 border-r border-slate-200 align-top transition-colors ${
                            isCurrentDay ? 'bg-emerald-50/20' : ''
                          } ${dIdx === 6 ? 'border-r-0' : ''}`}
                        >
                          {cellSessions.length === 0 ? (
                            /* Empty Cell: Clean dash '-' like in Image 2 */
                            <div className="text-slate-300 font-bold text-center select-none py-6 text-sm">
                              -
                            </div>
                          ) : (
                            /* Sessions Cell: Structured Card like in Image 2 */
                            <div className="space-y-2">
                              {cellSessions.map((s) => {
                                if (s.isRemedial) {
                                  return (
                                    <div
                                      key={s.sessionId}
                                      className="p-3 rounded-xl bg-purple-50/90 border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all space-y-2 text-xs relative overflow-hidden"
                                    >
                                      {/* Header: Badge & Group */}
                                      <div className="space-y-1">
                                        <div className="flex items-start justify-between gap-1.5">
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                                            <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                                            <span>Phụ đạo vi mô</span>
                                          </span>
                                          <span className="text-[10px] font-bold text-purple-700 bg-white/90 px-1.5 py-0.5 rounded border border-purple-100">
                                            {s.enrolledStudentsCount || s.totalStudentsCount || 0} HS
                                          </span>
                                        </div>

                                        <div
                                          className="font-black text-xs text-purple-950 line-clamp-2 leading-tight pt-0.5"
                                          title={s.topicTitle || s.skillName}
                                        >
                                          {s.topicTitle || s.skillName}
                                        </div>

                                        <div className="text-[10px] font-semibold text-purple-700 truncate">
                                          {s.className} • {s.groupName || 'Nhóm học tập'}
                                        </div>
                                      </div>

                                      {/* Time & Room & Mode */}
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-purple-900 bg-white/70 p-1.5 rounded-lg border border-purple-100">
                                        <span className="flex items-center gap-1 font-bold">
                                          <Clock className="w-3 h-3 text-purple-600" />
                                          <span>
                                            {String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}
                                          </span>
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold truncate max-w-[120px]" title={s.room}>
                                          <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                                          <span className="truncate">{s.room || 'Phòng P.204'}</span>
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                          s.deliveryMode === 'ONLINE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {s.deliveryMode === 'ONLINE' ? 'Live Q&A' : 'Tại lớp'}
                                        </span>
                                      </div>

                                      {/* Teacher info */}
                                      <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                        <UserCheck className="w-3 h-3 text-purple-500 shrink-0" />
                                        <span className="font-semibold truncate">
                                          {s.primaryTeacherName || 'Thầy/Cô phụ trách'}
                                        </span>
                                      </div>

                                      {/* Action: Open Micro-groups modal */}
                                      <div className="pt-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenMicroGroups(s)}
                                          className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                                        >
                                          <Users className="w-3 h-3" />
                                          <span>Xem nhóm phụ đạo</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                const hasAttendance = s.presentCount > 0 || s.absentCount > 0 || s.lateCount > 0;
                                const studentCount = s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0;
                                const attendancePct =
                                  studentCount > 0 && s.presentCount > 0
                                    ? Math.round((s.presentCount / studentCount) * 100)
                                    : 0;

                                return (
                                  <div
                                    key={s.sessionId}
                                    className="p-3 rounded-xl bg-white border border-blue-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-2 text-xs"
                                  >
                                    {/* Class / Subject Title & Attendance Badge */}
                                    <div className="space-y-1">
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div
                                          className="font-black text-xs text-blue-900 line-clamp-1 flex items-center gap-1.5"
                                          title={s.className}
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                          <span className="truncate">{s.className}</span>
                                        </div>
                                      </div>

                                      {/* Attendance Badge */}
                                      <div>
                                        {hasAttendance ? (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>
                                              Có mặt ({s.presentCount}/{studentCount})
                                            </span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                                            <span>Chưa điểm danh</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Time & Room & Mode (Offline/Online) */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
                                      <span className="flex items-center gap-1 font-bold text-slate-800">
                                        <Clock className="w-3 h-3 text-indigo-600" />
                                        <span>
                                          {String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}
                                        </span>
                                      </span>
                                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                                        <MapPin className="w-3 h-3 text-slate-500" />
                                        <span>{s.room || (s.deliveryMode === 'ONLINE' ? 'Trực tuyến' : 'Chưa xếp phòng')}</span>
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                        s.deliveryMode === 'ONLINE' || (!s.room && s.onlineMeetingUrl)
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {s.deliveryMode === 'ONLINE' || (!s.room && s.onlineMeetingUrl) ? 'Online' : 'Offline'}
                                      </span>
                                    </div>

                                    {/* Teacher / Lecturer */}
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <UserCheck className="w-3 h-3 text-slate-500 shrink-0" />
                                      <span className="font-semibold truncate">
                                        {s.primaryTeacherName || currentUser?.fullName || currentUser?.name || 'Giảng viên phụ trách'}
                                      </span>
                                    </div>

                                    {/* 2-Part Flipped Classroom Structure & Actions */}
                                    {(() => {
                                      const plan = getOfflineSessionPlan(s.sessionId, s);
                                      const p1Count = plan?.part1?.focusTopics?.length || 0;
                                      const p2Count = plan?.part2?.microGroups?.length || 0;
                                      return (
                                        <div className="space-y-1.5">
                                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700">
                                              <span>1. Chữa bài chung</span>
                                              <span className="text-slate-400">{p1Count} dạng</span>
                                            </div>
                                            <div
                                              className="font-bold line-clamp-1 text-slate-900 leading-tight"
                                              title={plan?.part1?.focusTopics?.[0]?.skillName || s.topicTitle}
                                            >
                                              {plan?.part1?.focusTopics?.[0]?.skillName || s.topicTitle || 'Từ vựng & Suy luận'}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                                              <span>2. Nhóm tại bàn</span>
                                              <span className="font-bold text-slate-700">{p2Count} bàn</span>
                                            </div>
                                          </div>

                                          <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between px-0.5">
                                            <span>Sĩ số: {studentCount} HS</span>
                                            <span className="text-slate-400">Buổi {s.sessionNo}</span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleOpenPrepModal(s)}
                                            className="w-full py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                            title="Chuẩn bị nội dung chữa bài và bài tập nhóm"
                                          >
                                            <BookOpen className="w-3 h-3 text-indigo-600" />
                                            <span>Chuẩn bị buổi học</span>
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {/* Action Buttons: Điểm danh & Nhóm vi mô */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAttendance(s)}
                                        className={`flex-1 py-1.5 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                                          hasAttendance
                                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                      >
                                        <CheckSquare className="w-3 h-3" />
                                        <span>{hasAttendance ? 'Xem / Sửa' : 'Điểm danh'}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenMicroGroups(s)}
                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                                        title="Xếp nhóm học tập vi mô 3–5 em"
                                      >
                                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: AGENDA / TIMELINE LIST MODE (Chế độ xem danh sách)                 */
          /* ========================================================================= */
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
                    if (s.isRemedial) {
                      return (
                        <div
                          key={s.sessionId}
                          className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-2.5">
                            {/* Time & Room & Mode */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-100 border border-purple-200 text-purple-900 text-xs font-black">
                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                <span>
                                  {String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}
                                </span>
                              </span>

                              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-800 bg-white px-2.5 py-1 rounded-xl border border-purple-100">
                                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                                <span>{s.room || 'Phòng P.204'}</span>
                              </span>
                            </div>

                            {/* Title & Class */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-200 text-purple-800">
                                  ⚡ Phụ đạo vi mô
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.deliveryMode === 'ONLINE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {s.deliveryMode === 'ONLINE' ? 'Trực tuyến (Live Q&A)' : 'Tại lớp học'}
                                </span>
                              </div>
                              <div className="font-black text-sm text-purple-950 line-clamp-1">
                                {s.topicTitle || s.skillName}
                              </div>
                              <div className="text-[11px] text-purple-700 font-semibold line-clamp-1">
                                {s.className} • {s.groupName || 'Nhóm học tập 3–5 em'}
                              </div>
                            </div>

                            {/* Student List preview */}
                            <div className="p-2.5 rounded-xl bg-white border border-purple-100 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Thành viên nhóm ({s.enrolledStudentsCount || s.students?.length || 0} em):</span>
                                </span>
                              </div>
                              <div className="text-[11px] font-medium text-slate-700 line-clamp-2">
                                {Array.isArray(s.students) && s.students.length > 0
                                  ? s.students.map((st) => st.name || st.studentName || 'Học sinh').join(', ')
                                  : 'Đã phân nhóm theo năng lực chuyên đề'}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-100">
                            <button
                              type="button"
                              onClick={() => handleOpenMicroGroups(s)}
                              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Quản lý sơ đồ nhóm</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const hasAttendance = s.presentCount > 0 || s.absentCount > 0 || s.lateCount > 0;
                    const studentCount = s.enrolledStudentsCount ?? s.totalStudentsCount ?? 0;
                    const attendancePct =
                      studentCount > 0 && s.presentCount > 0
                        ? Math.round((s.presentCount / studentCount) * 100)
                        : 0;

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
                              <span>
                                {String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{s.room || (s.deliveryMode === 'ONLINE' ? 'Trực tuyến' : 'Chưa xếp phòng')}</span>
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

                          {/* 2-Part Offline Session Structure */}
                          {(() => {
                            const plan = getOfflineSessionPlan(s.sessionId, s);
                            const p1Topics = plan?.part1?.focusTopics || [];
                            const p2Groups = plan?.part2?.microGroups || [];
                            return (
                              <div className="space-y-2">
                                {/* 1. Chữa bài chung */}
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>1. Chữa bài chung cả lớp:</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">
                                      {p1Topics.length} dạng bài
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {p1Topics.map((t) => t.skillName).join(' • ') || s.topicTitle || 'Từ vựng trong ngữ cảnh & Suy luận'}
                                  </div>
                                </div>

                                {/* 2. Nhóm học tập tại bàn */}
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-slate-500" />
                                      <span>2. Nhóm học tập tại bàn:</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">
                                      {p2Groups.length} bàn học
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-700 line-clamp-1">
                                    {p2Groups.map((g) => `${g.tableName} (${g.studentCount} bạn)`).join(' • ') || 'Đã xếp các bàn học kèm phiếu bài tập'}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Attendance Status Pill */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-bold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>Sĩ số: <strong>{studentCount} HS</strong></span>
                            </span>

                            {hasAttendance ? (
                              <span className="text-emerald-700 font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                  {s.presentCount} có mặt ({attendancePct}%)
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
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleOpenPrepModal(s)}
                            className="flex-1 sm:flex-initial py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Chuẩn bị nội dung chữa bài và bài tập nhóm"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Chuẩn bị buổi học</span>
                          </button>

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

      {/* Offline Session Preparation Modal (Flipped Classroom 2 Parts) */}
      <OfflineSessionPreparationModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        session={prepSession}
      />
    </div>
  );
}
