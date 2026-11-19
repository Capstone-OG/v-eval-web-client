import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Lock,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  Plus,
  CheckCircle2,
  BarChart3,
  Layers,
  Calendar,
  TrendingUp,
  Mail,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  Zap,
  Clock,
  Download,
  Filter,
  MapPin,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { userService } from '../../services/userService';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';
import EarlyWarningsMentorPanel from './EarlyWarningsMentorPanel';

const DOMAIN_ORDER = [
  { code: 'DOM_LANG', short: 'Ngôn ngữ', name: 'Sử dụng Ngôn ngữ', icon: BookOpen },
  { code: 'DOM_MATH', short: 'Toán & Logic', name: 'Toán & Tư duy Logic', icon: Zap },
  { code: 'DOM_NAT_SCI', short: 'KH Tự nhiên', name: 'Khoa học Tự nhiên', icon: Sparkles },
  { code: 'DOM_SOC_SCI', short: 'KH Xã hội', name: 'Khoa học Xã hội', icon: Layers }
];

const DAY_LABELS = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  0: 'Chủ Nhật'
};

// Normalize mastery value (0-1 decimal OR 0-100 percentage) to 0-100% integer
export const normalizeMasteryPct = (val) => {
  const num = Number(val || 0);
  const pct = num > 1 ? num : num * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
};

const formatWeeklyScheduleSummary = (weeklySchedules) => {
  if (!Array.isArray(weeklySchedules) || weeklySchedules.length === 0) {
    return 'Chưa xếp lịch tuần';
  }
  return weeklySchedules
    .map((slot) => {
      const day = slot.dayOfWeekLabel || DAY_LABELS[slot.dayOfWeek] || `Thứ ${slot.dayOfWeek}`;
      const start = String(slot.startTime || '').slice(0, 5);
      const end = String(slot.endTime || '').slice(0, 5);
      const room = slot.room ? ` • ${slot.room}` : '';
      return `${day} (${start}-${end}${room})`;
    })
    .join('; ');
};

export default function AcademicManagerDashboardView({
  currentUser,
  activeSection = 'dashboard',
  onNavigateSection
}) {
  const userRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map((r) => String(r).toUpperCase())
    : [];
  const isGlobalRole = userRoles.some(
    (r) => r.includes('ADMIN') || r.includes('DIRECTOR')
  );
  const assignedCampusId = currentUser?.campusId || null;

  const [campusesList, setCampusesList] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(assignedCampusId || '');

  const currentCampusObj = useMemo(() => {
    if (!campusesList || campusesList.length === 0) return null;
    if (assignedCampusId) {
      const matchAssigned = campusesList.find((c) => String(c.id) === String(assignedCampusId));
      if (matchAssigned) return matchAssigned;
    }
    if (selectedCampus) {
      const matchSelected = campusesList.find((c) => String(c.id) === String(selectedCampus));
      if (matchSelected) return matchSelected;
    }
    return campusesList[0];
  }, [campusesList, assignedCampusId, selectedCampus]);

  const currentCampusName = useMemo(() => {
    if (currentUser?.campusName) return currentUser.campusName;
    if (currentCampusObj) {
      return `${currentCampusObj.name}${currentCampusObj.code ? ` (${currentCampusObj.code})` : ''}`;
    }
    return '';
  }, [currentUser, currentCampusObj]);
  const [termsList, setTermsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [rawClassesList, setRawClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [campusHeatmap, setCampusHeatmap] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Filters for Section 1 & Section 2
  const [filterTermId, setFilterTermId] = useState('ALL');
  const [filterCourseId, setFilterCourseId] = useState('ALL');
  const [filterDomainCode, setFilterDomainCode] = useState('ALL');
  const [filterTeacherId, setFilterTeacherId] = useState('ALL');

  // Active sub-section controller (synced with Sidebar activeTab)
  const resolvedSection = useMemo(() => {
    if (['classes_schedule', 'clustering', 'escalations'].includes(activeSection)) {
      return activeSection;
    }
    return 'dashboard';
  }, [activeSection]);

  const handleSelectSection = (sec) => {
    if (onNavigateSection) {
      onNavigateSection(sec);
    }
  };

  // K-Means Clustering states (Section 3)
  const [maxKInput, setMaxKInput] = useState(4);
  const [clusteringLoading, setClusteringLoading] = useState(false);
  const [clusterResult, setClusterResult] = useState(null);
  const [clusterError, setClusterError] = useState('');

  // Teacher Assignment Modal states (MGR_01, MGR_03, MGR_06, MGR_07)
  const [assignModalClass, setAssignModalClass] = useState(null);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Manual Student Enroll / Transfer & Overflow Modal (MGR_02, MGR_04, MGR_13)
  const [enrollModalClass, setEnrollModalClass] = useState(null);
  const [studentIdToEnroll, setStudentIdToEnroll] = useState('');
  const [campusStudentsList, setCampusStudentsList] = useState([]);
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [enrollResultNotice, setEnrollResultNotice] = useState(null);

  // Create Term Modal
  const [showTermModal, setShowTermModal] = useState(false);
  const [termForm, setTermForm] = useState({
    code: '',
    name: '',
    academicYear: '2026-2027',
    termOrder: 1,
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });
  const [termBusy, setTermBusy] = useState(false);

  // Create Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    planType: 'STANDARD',
    durationWeeks: 12,
    tuitionFee: 4500000,
    maxClassSize: 20
  });
  const [courseBusy, setCourseBusy] = useState(false);

  // Create Class with Schedule Modal
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    termId: '',
    courseId: '',
    teacherId: '',
    classType: 0,
    focusDomain: 'DOM_MATH',
    maxCapacity: 20,
    dayOfWeek: 1,
    slotNo: 1,
    startTime: '18:00',
    endTime: '20:00',
    room: 'P.301'
  });
  const [createClassBusy, setCreateClassBusy] = useState(false);

  // Class Schedule & Sessions Modal
  const [scheduleModalClass, setScheduleModalClass] = useState(null);
  const [classSessions, setClassSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [scheduleSlotForm, setScheduleSlotForm] = useState({
    dayOfWeek: 1,
    slotNo: 1,
    startTime: '18:00',
    endTime: '20:00',
    room: 'P.301'
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [editingSlotIdx, setEditingSlotIdx] = useState(null);

  // Rotating operational guidance banner
  const tips = [
    'Đối sánh hiệu năng đào tạo 4 miền ĐGNL giữa các lớp trong cùng cơ sở.',
    'Kiểm soát trần sĩ số tối đa 20 học sinh/lớp và tự động xếp lớp theo 4 miền năng lực.',
    'Điều phối Thời khóa biểu Offline, phòng học và phân công giảng viên thuộc cơ sở.',
    'Theo dõi và chủ trì cuộc họp 3 bên cho các hồ sơ cảnh báo học thuật Cấp 3.'
  ];
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % tips.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tips.length]);

  // 1. Load Campuses & Users
  const loadInitialCampusesAndTeachers = useCallback(async () => {
    try {
      const [campusesData, usersRes, studentsRes] = await Promise.all([
        userService.getCampuses().catch(() => []),
        userService.getUsers({ role: 'TEACHER', page: 1, pageSize: 100 }).catch(() => ({ items: [] })),
        userService.getUsers({ role: 'STUDENT', page: 1, pageSize: 100 }).catch(() => ({ items: [] }))
      ]);

      const mappedCampuses = (Array.isArray(campusesData) ? campusesData : []).map((c) => ({
        id: c.campusId || c.id,
        name: c.name,
        code: c.code
      }));
      setCampusesList(mappedCampuses);

      const initialCampus =
        (assignedCampusId && mappedCampuses.some((c) => String(c.id) === String(assignedCampusId))
          ? assignedCampusId
          : mappedCampuses[0]?.id) ||
        assignedCampusId ||
        '';

      setSelectedCampus((prev) => (!isGlobalRole && assignedCampusId ? assignedCampusId : prev || initialCampus));

      const rawTeachers = Array.isArray(usersRes?.items) ? usersRes.items : [];
      setTeachersList(
        rawTeachers.map((u) => ({
          id: u.userId || u.id,
          name: u.fullName || u.email,
          email: u.email,
          phone: u.phone || '',
          campusId: u.campusId || null,
          campusName: u.campusName || '',
          subject: u.specialty || 'Giảng viên ĐGNL',
          status: u.isActive !== false ? 'Active' : 'Locked'
        }))
      );

      const rawStudents = Array.isArray(studentsRes?.items) ? studentsRes.items : [];
      setCampusStudentsList(
        rawStudents.map((s) => ({
          id: s.userId || s.id,
          name: s.fullName || s.email,
          email: s.email,
          campusId: s.campusId || null
        }))
      );
    } catch (err) {
      console.warn('[CampusManagerDashboardView] Error loading campuses/teachers:', err?.message);
    }
  }, [assignedCampusId]);

  useEffect(() => {
    loadInitialCampusesAndTeachers();
  }, [loadInitialCampusesAndTeachers]);

  // 2. Load Campus-Specific Terms, Courses, Classes, and Heatmap from real Backend APIs
  const loadCampusOperationalData = useCallback(async () => {
    if (!selectedCampus) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const [termsRes, coursesRes, classesRes, heatmapRes] = await Promise.all([
        practiceService.getAcademicTerms({ campusId: selectedCampus }).catch(() => []),
        practiceService.getCourses({ campusId: selectedCampus }).catch(() => []),
        practiceService.getClasses({ campusId: selectedCampus }).catch(() => []),
        practiceService.getCampusComparativeHeatmap(selectedCampus).catch(() => null)
      ]);

      setTermsList(Array.isArray(termsRes) ? termsRes : []);
      setCoursesList(Array.isArray(coursesRes) ? coursesRes : []);
      setRawClassesList(Array.isArray(classesRes) ? classesRes : []);
      setCampusHeatmap(heatmapRes);
    } finally {
      setLoadingData(false);
    }
  }, [selectedCampus]);

  useEffect(() => {
    loadCampusOperationalData();
  }, [loadCampusOperationalData]);

  // Handle campus change with RBAC Scope Check (MGR_22)
  const handleCampusSelectChange = (targetCampusId) => {
    if (!isGlobalRole) {
      toast.error(
        `403 Access Denied - Tài khoản Quản lý Học thuật chỉ có quyền quản lý cơ sở được phân công (${currentCampusName || 'Cơ sở trực thuộc'})`
      );
      return;
    }
    setSelectedCampus(targetCampusId);
  };

  // Merge real classes from GET /api/practice/classes with heatmap metrics from GET /comparative-heatmap
  const mergedClasses = useMemo(() => {
    const heatmapByClassId = new Map(
      (campusHeatmap?.classComparisons || []).map((c) => [String(c.classId), c])
    );
    const teacherById = new Map(teachersList.map((t) => [String(t.id), t]));

    if (rawClassesList.length > 0) {
      return rawClassesList.map((cls) => {
        const hm = heatmapByClassId.get(String(cls.classId));
        const domMasteries = hm?.domainMasteries || [];
        const avgMastery =
          domMasteries.length > 0
            ? normalizeMasteryPct(
                domMasteries.reduce((acc, m) => acc + Number(m.averagePlt || 0), 0) /
                  domMasteries.length
              )
            : 0;
        const matchedTeacher = cls.teacherId ? teacherById.get(String(cls.teacherId)) : null;

        return {
          classId: cls.classId,
          name: cls.name,
          campusId: cls.campusId,
          termId: cls.termId || null,
          termCode: cls.termCode || '',
          termName: cls.termName || '',
          academicYear: cls.academicYear || '',
          courseId: cls.courseId || null,
          courseCode: cls.courseCode || '',
          courseName: cls.courseName || '',
          teacherId: cls.teacherId || null,
          teacherName: matchedTeacher?.name || hm?.teacherName || 'Chưa phân công',
          classType: cls.classType ?? 0,
          classTypeLabel: cls.classTypeLabel || (cls.classType === 1 ? 'Lớp Chuyên Đề' : 'Lớp Xếp Hạng'),
          focusDomain: cls.focusDomain || '',
          maxCapacity: Number(cls.maxCapacity || 20),
          studentCount: Number(cls.enrolledStudentsCount ?? hm?.totalStudents ?? 0),
          status: cls.status || 'ACTIVE',
          weeklySchedules: Array.isArray(cls.weeklySchedules) ? cls.weeklySchedules : [],
          scheduleSummary: formatWeeklyScheduleSummary(cls.weeklySchedules),
          totalSessionsCount: Number(cls.totalSessionsCount ?? 0),
          completedSessionsCount: Number(cls.completedSessionsCount ?? 0),
          overallRiskLevel: hm?.overallRiskLevel || 'SAFE',
          domainMasteries: domMasteries,
          progressPct: avgMastery
        };
      });
    }

    // If GET /api/practice/classes returned empty but heatmap has classes
    return (campusHeatmap?.classComparisons || []).map((hm) => ({
      classId: hm.classId,
      name: hm.className,
      campusId: selectedCampus,
      termId: null,
      termCode: '',
      termName: '',
      academicYear: '',
      courseId: null,
      courseCode: '',
      courseName: '',
      teacherId: null,
      teacherName: hm.teacherName || 'Chưa phân công',
      classType: 0,
      classTypeLabel: 'Lớp Học Thuật',
      focusDomain: '',
      maxCapacity: 20,
      studentCount: Number(hm.totalStudents ?? 0),
      status: 'ACTIVE',
      weeklySchedules: [],
      scheduleSummary: 'Chưa xếp lịch tuần',
      totalSessionsCount: 0,
      completedSessionsCount: 0,
      overallRiskLevel: hm.overallRiskLevel || 'SAFE',
      domainMasteries: hm.domainMasteries || [],
      progressPct:
        (hm.domainMasteries || []).length > 0
          ? normalizeMasteryPct(
              hm.domainMasteries.reduce((acc, m) => acc + Number(m.averagePlt || 0), 0) /
                hm.domainMasteries.length
            )
          : 0
    }));
  }, [rawClassesList, campusHeatmap, teachersList, selectedCampus]);

  // Filtered classes for comparative matrix & class list (MGR_21)
  const filteredClasses = useMemo(() => {
    return mergedClasses.filter((cls) => {
      if (filterTermId !== 'ALL' && String(cls.termId) !== String(filterTermId)) return false;
      if (filterCourseId !== 'ALL' && String(cls.courseId) !== String(filterCourseId)) return false;
      if (
        filterDomainCode !== 'ALL' &&
        cls.focusDomain &&
        String(cls.focusDomain) !== String(filterDomainCode)
      ) {
        return false;
      }
      if (filterTeacherId !== 'ALL') {
        const matchId = cls.teacherId && String(cls.teacherId) === String(filterTeacherId);
        const targetTeacher = teachersList.find((t) => String(t.id) === String(filterTeacherId));
        const matchName =
          targetTeacher &&
          cls.teacherName &&
          cls.teacherName.toLowerCase() === targetTeacher.name.toLowerCase();
        if (!matchId && !matchName) return false;
      }
      return true;
    });
  }, [mergedClasses, filterTermId, filterCourseId, filterDomainCode, filterTeacherId, teachersList]);

  // ---------------------------------------------------------------------------
  // Realtime Conflict Detection Logic (Phòng học & Giảng viên)
  // ---------------------------------------------------------------------------
  const isTimeOverlap = (start1, end1, start2, end2) => {
    const s1 = String(start1 || '').slice(0, 5);
    const e1 = String(end1 || '').slice(0, 5);
    const s2 = String(start2 || '').slice(0, 5);
    const e2 = String(end2 || '').slice(0, 5);
    return s1 < e2 && s2 < e1;
  };

  // Map of conflicts between active classes currently loaded
  const classConflictsMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < mergedClasses.length; i++) {
      const c1 = mergedClasses[i];
      if (c1.status === 'CANCELLED' || c1.status === 'DELETED') continue;
      const sList1 = Array.isArray(c1.weeklySchedules) ? c1.weeklySchedules : [];

      for (let j = i + 1; j < mergedClasses.length; j++) {
        const c2 = mergedClasses[j];
        if (c2.status === 'CANCELLED' || c2.status === 'DELETED') continue;
        const sList2 = Array.isArray(c2.weeklySchedules) ? c2.weeklySchedules : [];

        for (const s1 of sList1) {
          if (s1.isActive === false) continue;
          const d1 = Number(s1.dayOfWeek);
          const r1 = (s1.room || '').trim().toLowerCase();
          const start1 = String(s1.startTime || '').slice(0, 5);
          const end1 = String(s1.endTime || '').slice(0, 5);

          for (const s2 of sList2) {
            if (s2.isActive === false) continue;
            const d2 = Number(s2.dayOfWeek);
            const r2 = (s2.room || '').trim().toLowerCase();
            const start2 = String(s2.startTime || '').slice(0, 5);
            const end2 = String(s2.endTime || '').slice(0, 5);

            if (d1 === d2 && isTimeOverlap(start1, end1, start2, end2)) {
              const dowLabel = DAY_LABELS[d1] || `Thứ ${d1}`;
              // Room conflict
              if (r1 && r2 && r1 === r2) {
                map[c1.classId] = map[c1.classId] || [];
                map[c1.classId].push(`Trùng phòng ${s1.room} vào ${dowLabel} (${start1}-${end1}) với lớp "${c2.name}"`);
                map[c2.classId] = map[c2.classId] || [];
                map[c2.classId].push(`Trùng phòng ${s2.room} vào ${dowLabel} (${start2}-${end2}) với lớp "${c1.name}"`);
              }
              // Teacher conflict
              if (c1.teacherId && c2.teacherId && String(c1.teacherId) === String(c2.teacherId)) {
                const tName = c1.teacherName || 'Giảng viên';
                map[c1.classId] = map[c1.classId] || [];
                map[c1.classId].push(`Trùng lịch GV ${tName} vào ${dowLabel} (${start1}-${end1}) với lớp "${c2.name}"`);
                map[c2.classId] = map[c2.classId] || [];
                map[c2.classId].push(`Trùng lịch GV ${tName} vào ${dowLabel} (${start2}-${end2}) với lớp "${c1.name}"`);
              }
            }
          }
        }
      }
    }
    return map;
  }, [mergedClasses]);

  // Realtime Conflict Detection when creating a new class
  const createClassConflict = useMemo(() => {
    if (!showCreateClassModal) return null;
    const dow = Number(classForm.dayOfWeek);
    const start = String(classForm.startTime || '').slice(0, 5);
    const end = String(classForm.endTime || '').slice(0, 5);
    const room = (classForm.room || '').trim().toLowerCase();
    const teacherId = classForm.teacherId;

    if (!start || !end) return null;
    if (start >= end) {
      return { type: 'TIME_INVALID', message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' };
    }

    for (const c of mergedClasses) {
      if (c.status === 'CANCELLED' || c.status === 'DELETED') continue;
      const schedules = Array.isArray(c.weeklySchedules) ? c.weeklySchedules : [];
      for (const s of schedules) {
        if (s.isActive === false) continue;
        const sDow = Number(s.dayOfWeek);
        if (sDow === dow) {
          const sStart = String(s.startTime || '').slice(0, 5);
          const sEnd = String(s.endTime || '').slice(0, 5);
          if (isTimeOverlap(start, end, sStart, sEnd)) {
            const sRoom = (s.room || '').trim().toLowerCase();
            const dowLabel = DAY_LABELS[dow] || `Thứ ${dow}`;
            if (room && sRoom && room === sRoom) {
              return {
                type: 'ROOM_CONFLICT',
                message: `Phòng ${s.room || classForm.room} đã được phân bổ cho lớp "${c.name}" vào ${dowLabel} (${sStart} - ${sEnd}). Vui lòng chọn phòng khác hoặc đổi khung giờ.`
              };
            }
            if (teacherId && c.teacherId && String(teacherId) === String(c.teacherId)) {
              const teacherObj = teachersList.find((t) => String(t.id) === String(teacherId));
              const teacherName = teacherObj?.name || 'Giảng viên này';
              return {
                type: 'TEACHER_CONFLICT',
                message: `${teacherName} đã có lịch dạy lớp "${c.name}" vào ${dowLabel} (${sStart} - ${sEnd}). Vui lòng phân công giảng viên khác hoặc đổi khung giờ.`
              };
            }
          }
        }
      }
    }
    return null;
  }, [showCreateClassModal, classForm, mergedClasses, teachersList]);

  // Realtime Conflict Detection when adding a schedule slot to existing class
  const scheduleSlotConflict = useMemo(() => {
    if (!scheduleModalClass) return null;
    const dow = Number(scheduleSlotForm.dayOfWeek);
    const start = String(scheduleSlotForm.startTime || '').slice(0, 5);
    const end = String(scheduleSlotForm.endTime || '').slice(0, 5);
    const room = (scheduleSlotForm.room || '').trim().toLowerCase();
    const currentClassId = scheduleModalClass.classId;
    const teacherId = scheduleModalClass.teacherId;

    if (!start || !end) return null;
    if (start >= end) {
      return { type: 'TIME_INVALID', message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' };
    }

    for (const c of mergedClasses) {
      if (c.status === 'CANCELLED' || c.status === 'DELETED') continue;
      const isCurrent = String(c.classId) === String(currentClassId);
      const schedules = Array.isArray(c.weeklySchedules) ? c.weeklySchedules : [];
      for (let sIdx = 0; sIdx < schedules.length; sIdx++) {
        const s = schedules[sIdx];
        if (s.isActive === false) continue;
        if (isCurrent && editingSlotIdx === sIdx) continue;
        const sDow = Number(s.dayOfWeek);
        if (sDow === dow) {
          const sStart = String(s.startTime || '').slice(0, 5);
          const sEnd = String(s.endTime || '').slice(0, 5);
          if (isTimeOverlap(start, end, sStart, sEnd)) {
            const sRoom = (s.room || '').trim().toLowerCase();
            const dowLabel = DAY_LABELS[dow] || `Thứ ${dow}`;
            if (room && sRoom && room === sRoom) {
              return {
                type: 'ROOM_CONFLICT',
                message: isCurrent
                  ? `Lớp này đã có ca học tại phòng ${s.room || scheduleSlotForm.room} vào ${dowLabel} (${sStart} - ${sEnd}).`
                  : `Phòng ${s.room || scheduleSlotForm.room} đã được xếp cho lớp "${c.name}" vào ${dowLabel} (${sStart} - ${sEnd}). Vui lòng chọn phòng khác.`
              };
            }
            if (!isCurrent && teacherId && c.teacherId && String(teacherId) === String(c.teacherId)) {
              return {
                type: 'TEACHER_CONFLICT',
                message: `Giảng viên phụ trách lớp đã có lịch dạy lớp "${c.name}" vào ${dowLabel} (${sStart} - ${sEnd}). Vui lòng chọn khung giờ khác.`
              };
            }
          }
        }
      }
    }
    return null;
  }, [scheduleModalClass, scheduleSlotForm, mergedClasses, editingSlotIdx]);

  // Compute real activeClasses count per teacher (Zero Hardcoding)
  const campusTeachers = useMemo(() => {
    return teachersList
      .filter((t) => !t.campusId || !selectedCampus || String(t.campusId) === String(selectedCampus))
      .map((t) => {
        const assignedCount = mergedClasses.filter(
          (cls) =>
            (cls.teacherId && String(cls.teacherId) === String(t.id)) ||
            (cls.teacherName && cls.teacherName.toLowerCase() === String(t.name).toLowerCase())
        ).length;
        return {
          ...t,
          activeClasses: assignedCount
        };
      });
  }, [teachersList, mergedClasses, selectedCampus]);

  const totalCampusStudents = useMemo(
    () => mergedClasses.reduce((acc, c) => acc + c.studentCount, 0),
    [mergedClasses]
  );

  // Real overall campus mastery (0% when no data, never hardcoded 67%)
  const overallCampusMasteryPct = useMemo(() => {
    const avgs = campusHeatmap?.domainAverages || [];
    if (avgs.length === 0) return 0;
    return Math.round(
      avgs.reduce((acc, d) => acc + normalizeMasteryPct(d.averageMastery), 0) / avgs.length
    );
  }, [campusHeatmap]);

  // =========================================================================
  // HANDLERS: EXPORT EXCEL/CSV, ASSIGN TEACHER, K-MEANS, TERMS, COURSES, SCHEDULE
  // =========================================================================

  // Export real Campus Report to Excel-compatible CSV (MGR_18)
  const handleExportCampusReport = () => {
    if (filteredClasses.length === 0) {
      toast.error('Chưa có dữ liệu lớp học để xuất báo cáo.');
      return;
    }
    const headers = [
      'Mã Lớp',
      'Tên Lớp',
      'Đợt Học',
      'Khóa Học',
      'Miền Trọng Tâm',
      'Giảng Viên Phụ Trách',
      'Sĩ Số Hiện Tại',
      'Trần Sĩ Số',
      'Ngôn Ngữ (%)',
      'Toán & Logic (%)',
      'KHTN (%)',
      'KHXH (%)',
      'Mức Rủi Ro',
      'Lịch Học Tuần'
    ];

    const rows = filteredClasses.map((cls) => {
      const domMap = new Map((cls.domainMasteries || []).map((m) => [m.domainCode, m]));
      const getPct = (code) => normalizeMasteryPct(domMap.get(code)?.averagePlt ?? 0);
      return [
        cls.classId,
        `"${(cls.name || '').replace(/"/g, '""')}"`,
        `"${(cls.termName || cls.termCode || 'Mặc định').replace(/"/g, '""')}"`,
        `"${(cls.courseName || cls.courseCode || 'Mặc định').replace(/"/g, '""')}"`,
        cls.focusDomain || 'Tổng hợp 4 miền',
        `"${(cls.teacherName || 'Chưa phân công').replace(/"/g, '""')}"`,
        cls.studentCount,
        cls.maxCapacity,
        getPct('DOM_LANG'),
        getPct('DOM_MATH'),
        getPct('DOM_NAT_SCI'),
        getPct('DOM_SOC_SCI'),
        cls.overallRiskLevel,
        `"${(cls.scheduleSummary || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const campusCode = currentCampusObj?.code || 'CAMPUS';
    link.setAttribute('download', `Bao_Cao_Chat_Luong_${campusCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã xuất tệp báo cáo chất lượng cơ sở thành công.');
  };

  // Assign / Reassign Teacher to Class (MGR_01, MGR_03, MGR_06, MGR_07, MGR_22)
  const handleOpenAssignModal = (cls) => {
    if (!isGlobalRole && assignedCampusId && String(cls.campusId) !== String(assignedCampusId)) {
      toast.error('403 Access Denied - Bạn chỉ có quyền quản lý cơ sở được phân công.');
      return;
    }
    setAssignModalClass(cls);
    setSelectedTeacherForAssign(cls.teacherId || '');
    setAssignError('');
  };

  const handleConfirmAssignTeacher = async (e) => {
    e.preventDefault();
    if (!assignModalClass) return;

    if (!selectedTeacherForAssign) {
      setAssignError('Vui lòng chọn giáo viên phụ trách hợp lệ');
      return;
    }

    const chosenTeacher = teachersList.find((t) => String(t.id) === String(selectedTeacherForAssign));
    if (
      chosenTeacher?.campusId &&
      selectedCampus &&
      String(chosenTeacher.campusId) !== String(selectedCampus)
    ) {
      setAssignError(
        `Không thể phân công giảng viên thuộc cơ sở khác (${chosenTeacher.campusName || chosenTeacher.campusId}) cho lớp thuộc cơ sở hiện tại.`
      );
      return;
    }

    setAssignBusy(true);
    setAssignError('');
    try {
      const res = await practiceService.assignTeacher(
        assignModalClass.classId,
        selectedTeacherForAssign,
        {
          teacherCampusId: chosenTeacher?.campusId || null,
          managerCampusId: !isGlobalRole ? assignedCampusId : null
        }
      );
      toast.success(
        res?.message || `Phân công giáo viên phụ trách cho lớp ${assignModalClass.name} thành công.`
      );
      setAssignModalClass(null);
      await loadCampusOperationalData();
    } catch (err) {
      const msg = err?.data?.error?.description || err?.message || 'Không thể phân công giáo viên.';
      setAssignError(msg);
      toast.error(msg);
    } finally {
      setAssignBusy(false);
    }
  };

  // Manual Student Enrollment / Overflow Handler (MGR_02, MGR_04, MGR_13)
  const handleEnrollOrTransferStudentSubmit = async (e) => {
    e.preventDefault();
    if (!enrollModalClass) return;
    if (!studentIdToEnroll.trim()) {
      toast.error('Vui lòng chọn hoặc nhập mã học sinh.');
      return;
    }
    setEnrollBusy(true);
    setEnrollResultNotice(null);
    try {
      const res = await practiceService.enrollOrTransferStudent(enrollModalClass.classId, {
        studentId: studentIdToEnroll.trim(),
        managerCampusId: !isGlobalRole ? assignedCampusId : null
      });
      setEnrollResultNotice(res);
      toast.success(res?.message || 'Đã cập nhật xếp lớp cho học sinh.');
      await loadCampusOperationalData();
    } catch (err) {
      const msg = err?.data?.error?.description || err?.message || 'Không thể xếp học sinh vào lớp.';
      toast.error(msg);
    } finally {
      setEnrollBusy(false);
    }
  };

  // Run K-Means Auto-Clustering (DryRun Simulation MGR_15 vs Official Publish MGR_09, MGR_10)
  const executeKMeansClustering = async (isDryRun = false) => {
    setClusterError('');

    if (!isGlobalRole && assignedCampusId && String(selectedCampus) !== String(assignedCampusId)) {
      const msg = '403 Access Denied - Bạn chỉ có quyền quản lý cơ sở được phân công.';
      setClusterError(msg);
      toast.error(msg);
      return;
    }

    const kVal = Number(maxKInput);
    const maxAllowedK = Math.max(2, Math.min(10, Math.floor(Math.max(10, totalCampusStudents) / 5)));
    if (!Number.isInteger(kVal) || kVal < 1 || kVal > Math.max(7, maxAllowedK)) {
      const msg = `Số lượng cụm K không hợp lệ. Vui lòng nhập số cụm K nằm trong khoảng từ 1 đến ${Math.max(7, maxAllowedK)} (đảm bảo sĩ số 5 - 20 học sinh/lớp).`;
      setClusterError(msg);
      toast.error(msg);
      return;
    }

    setClusteringLoading(true);
    try {
      const res = await practiceService.autoClusterClasses(selectedCampus, kVal, {
        minCapacity: 5,
        maxCapacity: 20,
        dryRun: isDryRun,
        managerCampusId: !isGlobalRole ? assignedCampusId : null
      });
      setClusterResult(res);
      toast.success(
        res?.message ||
          (isDryRun
            ? `Đã chạy mô phỏng xem trước (${res?.optimalK || kVal} cụm lớp đề xuất).`
            : `Đã phê duyệt và xuất bản ${res?.optimalK || kVal} lớp chuyên đề chính thức.`)
      );
      if (!isDryRun) {
        await loadCampusOperationalData();
      }
    } catch (err) {
      const msg = err?.data?.error?.description || err?.message || 'Không thể chạy phân cụm lớp học.';
      setClusterError(msg);
      toast.error(msg);
    } finally {
      setClusteringLoading(false);
    }
  };

  const handleRunKMeansClustering = async (e) => {
    if (e) e.preventDefault();
    await executeKMeansClustering(true);
  };

  const handlePrefillSampleTerm = () => {
    const nextOrder = termsList.length + 1;
    setTermForm({
      code: `DOT${nextOrder}_2026`,
      name: `Đợt ${nextOrder} - Luyện Thi ĐGNL V-ACT Khóa Mùa Xuân 2026`,
      academicYear: '2026-2027',
      termOrder: nextOrder,
      startDate: '2026-02-01',
      endDate: '2026-06-30',
      status: 'ACTIVE'
    });
    setShowTermModal(true);
  };

  const handleFillSampleTermData = () => {
    const nextOrder = termsList.length + 1;
    setTermForm({
      code: `DOT${nextOrder}_2026`,
      name: `Đợt ${nextOrder} - Luyện Thi ĐGNL V-ACT Khóa Mùa Xuân 2026`,
      academicYear: '2026-2027',
      termOrder: nextOrder,
      startDate: '2026-02-01',
      endDate: '2026-06-30',
      status: 'ACTIVE'
    });
  };

  const handlePrefillSampleCourse = () => {
    const nextOrder = coursesList.length + 1;
    setCourseForm({
      code: `CRS_VACT_${String(nextOrder).padStart(2, '0')}`,
      name: `Khóa Luyện Thi ĐGNL Chuẩn Hóa 4 Miền (Đợt ${nextOrder})`,
      planType: 'STANDARD',
      durationWeeks: 12,
      tuitionFee: 4500000,
      maxClassSize: 20
    });
    setShowCourseModal(true);
  };

  const handleFillSampleCourseData = () => {
    const nextOrder = coursesList.length + 1;
    setCourseForm({
      code: `CRS_VACT_${String(nextOrder).padStart(2, '0')}`,
      name: `Khóa Luyện Thi ĐGNL Chuẩn Hóa 4 Miền (Đợt ${nextOrder})`,
      planType: 'STANDARD',
      durationWeeks: 12,
      tuitionFee: 4500000,
      maxClassSize: 20
    });
  };

  // Create Academic Term
  const handleCreateTermSubmit = async (e) => {
    e.preventDefault();
    if (!termForm.code.trim() || !termForm.name.trim() || !termForm.startDate || !termForm.endDate) {
      toast.error('Vui lòng điền đầy đủ Mã đợt, Tên đợt học, Ngày bắt đầu và Ngày kết thúc.');
      return;
    }
    setTermBusy(true);
    try {
      await practiceService.createAcademicTerm({
        campusId: selectedCampus,
        code: termForm.code.trim().toUpperCase(),
        name: termForm.name.trim(),
        academicYear: termForm.academicYear.trim(),
        termOrder: Number(termForm.termOrder || 1),
        startDate: termForm.startDate,
        endDate: termForm.endDate,
        status: termForm.status
      });
      toast.success(`Đã tạo đợt học "${termForm.name}" thành công.`);
      setShowTermModal(false);
      setTermForm({
        code: '',
        name: '',
        academicYear: '2026-2027',
        termOrder: termsList.length + 1,
        startDate: '',
        endDate: '',
        status: 'ACTIVE'
      });
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo đợt học.');
    } finally {
      setTermBusy(false);
    }
  };

  const handleToggleTermStatus = async (term, nextStatus) => {
    try {
      await practiceService.updateAcademicTermStatus(term.termId, nextStatus);
      toast.success(`Đã cập nhật trạng thái đợt học "${term.name}" sang ${nextStatus}.`);
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái đợt học.');
    }
  };

  // Create Course
  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim()) {
      toast.error('Vui lòng nhập Mã khóa học và Tên khóa học.');
      return;
    }
    setCourseBusy(true);
    try {
      await practiceService.createCourse({
        campusId: selectedCampus,
        code: courseForm.code.trim().toUpperCase(),
        name: courseForm.name.trim(),
        planType: courseForm.planType,
        durationWeeks: Number(courseForm.durationWeeks || 12),
        tuitionFee: Number(courseForm.tuitionFee || 0),
        maxClassSize: Math.min(20, Math.max(5, Number(courseForm.maxClassSize || 20)))
      });
      toast.success(`Đã tạo khóa học "${courseForm.name}" thành công.`);
      setShowCourseModal(false);
      setCourseForm({
        code: '',
        name: '',
        planType: 'STANDARD',
        durationWeeks: 12,
        tuitionFee: 4500000,
        maxClassSize: 20
      });
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo khóa học.');
    } finally {
      setCourseBusy(false);
    }
  };

  // Open Create Class Modal with intelligent room suggestion
  const handleOpenCreateClassModal = () => {
    const usedRoomsAtMonEvening = (mergedClasses || [])
      .flatMap((c) => (c.weeklySchedules || []))
      .filter(
        (s) =>
          Number(s.dayOfWeek) === 1 &&
          String(s.startTime).slice(0, 5) < '20:00' &&
          '18:00' < String(s.endTime).slice(0, 5)
      )
      .map((s) => (s.room || '').trim());
    const candidateRooms = ['P.301', 'P.302', 'P.303', 'P.304', 'P.305', 'Lab 01', 'Lab 02'];
    const freeRoom = candidateRooms.find((r) => !usedRoomsAtMonEvening.includes(r)) || 'P.302';
    setClassForm((prev) => ({
      ...prev,
      dayOfWeek: 1,
      startTime: '18:00',
      endTime: '20:00',
      room: freeRoom
    }));
    setShowCreateClassModal(true);
  };

  // Create Class with Weekly Schedule
  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) {
      toast.error('Vui lòng nhập tên lớp học.');
      return;
    }
    if (createClassConflict) {
      toast.error(createClassConflict.message);
      return;
    }
    const cap = Number(classForm.maxCapacity || 20);
    if (cap < 5 || cap > 20) {
      toast.error('Trần sĩ số lớp học bắt buộc từ 5 đến tối đa 20 học sinh/lớp.');
      return;
    }
    setCreateClassBusy(true);
    try {
      await practiceService.createClassWithSchedule({
        campusId: selectedCampus,
        termId: classForm.termId || null,
        courseId: classForm.courseId || null,
        name: classForm.name.trim(),
        teacherId: classForm.teacherId || null,
        classType: Number(classForm.classType || 0),
        focusDomain: classForm.focusDomain || null,
        maxCapacity: cap,
        weeklySchedules: [
          {
            dayOfWeek: Number(classForm.dayOfWeek),
            slotNo: Number(classForm.slotNo || 1),
            startTime: `${classForm.startTime}:00`,
            endTime: `${classForm.endTime}:00`,
            room: classForm.room.trim() || 'P.301'
          }
        ],
        autoGenerateSessions: true
      });
      toast.success(`Đã mở lớp "${classForm.name}" và khởi tạo lịch học thành công.`);
      setShowCreateClassModal(false);
      setClassForm((prev) => ({ ...prev, name: '' }));
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể mở lớp học mới.');
    } finally {
      setCreateClassBusy(false);
    }
  };

  // Open Class Schedule & Sessions Modal
  const handleOpenScheduleModal = async (cls) => {
    setScheduleModalClass(cls);
    setEditingSlotIdx(null);
    setSessionsLoading(true);

    // Smart default for scheduleSlotForm: select next available day & free room
    const currentClassSchedules = Array.isArray(cls.weeklySchedules) ? cls.weeklySchedules : [];
    const existingDays = currentClassSchedules.map((s) => Number(s.dayOfWeek));
    const nextDay = [1, 2, 3, 4, 5, 6].find((d) => !existingDays.includes(d)) || 3;

    const usedRooms = (mergedClasses || [])
      .flatMap((c) => (c.weeklySchedules || []))
      .filter((s) => Number(s.dayOfWeek) === nextDay)
      .map((s) => (s.room || '').trim());
    const candidateRooms = ['P.301', 'P.302', 'P.303', 'P.304', 'P.305', 'Lab 01', 'Lab 02'];
    const freeRoom = candidateRooms.find((r) => !usedRooms.includes(r)) || 'P.302';

    setScheduleSlotForm({
      dayOfWeek: nextDay,
      slotNo: 1,
      startTime: '18:00',
      endTime: '20:00',
      room: freeRoom
    });

    try {
      const sessions = await practiceService.getClassSessions(cls.classId);
      setClassSessions(Array.isArray(sessions) ? sessions : []);
    } catch {
      setClassSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleStartEditSlot = (slot, idx) => {
    setEditingSlotIdx(idx);
    setScheduleSlotForm({
      dayOfWeek: Number(slot.dayOfWeek),
      slotNo: Number(slot.slotNo || slot.slotNumber || 1),
      startTime: String(slot.startTime || '').slice(0, 5),
      endTime: String(slot.endTime || '').slice(0, 5),
      room: slot.room || 'P.302'
    });
  };

  const handleCancelEditSlot = () => {
    setEditingSlotIdx(null);
    setScheduleSlotForm({
      dayOfWeek: 1,
      slotNo: 1,
      startTime: '18:00',
      endTime: '20:00',
      room: 'P.302'
    });
  };

  const handleDeleteWeeklySlot = async (idxToDelete) => {
    if (!scheduleModalClass) return;
    const existingSlots = (scheduleModalClass.weeklySchedules || []).map((s) => ({
      dayOfWeek: Number(s.dayOfWeek),
      slotNo: Number(s.slotNo || s.slotNumber || 1),
      startTime: String(s.startTime).length === 5 ? `${s.startTime}:00` : String(s.startTime),
      endTime: String(s.endTime).length === 5 ? `${s.endTime}:00` : String(s.endTime),
      room: s.room || 'P.301'
    }));

    const finalSlots = existingSlots.filter((_, idx) => idx !== idxToDelete);
    if (finalSlots.length === 0) {
      toast.error('Lớp học cần có ít nhất 1 ca học trong tuần.');
      return;
    }

    setScheduleSaving(true);
    try {
      await practiceService.saveClassWeeklySchedules(scheduleModalClass.classId, {
        slots: finalSlots,
        regenerateFutureSessions: true
      });
      await practiceService.generateClassSessions(scheduleModalClass.classId, {});
      toast.success('Đã xóa ca học thành công.');
      setEditingSlotIdx(null);
      setScheduleModalClass((prev) => ({
        ...prev,
        weeklySchedules: finalSlots,
        scheduleSummary: formatWeeklyScheduleSummary(finalSlots)
      }));
      const updatedSessions = await practiceService.getClassSessions(scheduleModalClass.classId);
      setClassSessions(Array.isArray(updatedSessions) ? updatedSessions : []);
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể xóa ca học.');
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleSaveWeeklySlotAndGenerate = async (e) => {
    e.preventDefault();
    if (!scheduleModalClass) return;
    if (scheduleSlotConflict) {
      toast.error(scheduleSlotConflict.message);
      return;
    }
    setScheduleSaving(true);
    try {
      const existingSlots = (scheduleModalClass.weeklySchedules || []).map((s) => ({
        dayOfWeek: Number(s.dayOfWeek),
        slotNo: Number(s.slotNo || s.slotNumber || 1),
        startTime: String(s.startTime).length === 5 ? `${s.startTime}:00` : String(s.startTime),
        endTime: String(s.endTime).length === 5 ? `${s.endTime}:00` : String(s.endTime),
        room: s.room || 'P.301'
      }));

      const newOrUpdatedSlot = {
        dayOfWeek: Number(scheduleSlotForm.dayOfWeek),
        slotNo: Number(scheduleSlotForm.slotNo || 1),
        startTime: String(scheduleSlotForm.startTime).length === 5 ? `${scheduleSlotForm.startTime}:00` : String(scheduleSlotForm.startTime),
        endTime: String(scheduleSlotForm.endTime).length === 5 ? `${scheduleSlotForm.endTime}:00` : String(scheduleSlotForm.endTime),
        room: scheduleSlotForm.room.trim() || 'P.302'
      };

      let finalSlots = [];
      if (editingSlotIdx !== null && editingSlotIdx >= 0 && editingSlotIdx < existingSlots.length) {
        // Replacing the slot being edited
        finalSlots = existingSlots.map((s, idx) => (idx === editingSlotIdx ? newOrUpdatedSlot : s));
      } else {
        // Adding a new slot
        finalSlots = [...existingSlots, newOrUpdatedSlot];
      }

      await practiceService.saveClassWeeklySchedules(scheduleModalClass.classId, {
        slots: finalSlots,
        regenerateFutureSessions: true
      });
      await practiceService.generateClassSessions(scheduleModalClass.classId, {});
      toast.success(
        editingSlotIdx !== null
          ? 'Đã cập nhật ca học thành công.'
          : 'Đã thêm ca học trong tuần và đồng bộ buổi học Offline.'
      );
      setEditingSlotIdx(null);
      setScheduleModalClass((prev) => ({
        ...prev,
        weeklySchedules: finalSlots,
        scheduleSummary: formatWeeklyScheduleSummary(finalSlots)
      }));
      const updatedSessions = await practiceService.getClassSessions(scheduleModalClass.classId);
      setClassSessions(Array.isArray(updatedSessions) ? updatedSessions : []);
      await loadCampusOperationalData();
    } catch (err) {
      toast.error(err?.message || 'Không thể cập nhật lịch học.');
    } finally {
      setScheduleSaving(false);
    }
  };

  const managerDisplayName =
    currentUser?.fullName || currentUser?.email || 'Quản lý Học thuật Cơ sở';

  return (
    <div className="space-y-6 animate-fade w-full pb-12 font-sans">
      {/* 1. Top Flagship Hero Banner (No Hardcoded Name!) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-blue-600/30">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#FACC15] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#FACC15]" />
              <span>Cổng Quản Lý Học Thuật Cơ Sở • Điều Phối Đào Tạo & Lớp Học</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Xin chào, {managerDisplayName}
            </h1>

            <div className="min-h-[36px] flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIdx}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0" />
                  <span>{tips[tipIdx]}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold pt-1">
              <span className="flex items-center gap-1.5 font-extrabold text-slate-950 bg-[#FACC15] px-3 py-1.5 rounded-xl shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-slate-950" />
                Làm chủ TB cơ sở: <strong>{overallCampusMasteryPct}%</strong>
              </span>

              <span className="flex items-center gap-1.5 text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Lớp đang mở: <strong className="text-white">{mergedClasses.length} Lớp</strong>
              </span>

              <span className="flex items-center gap-1.5 text-slate-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                Tổng học viên: <strong className="text-white">{totalCampusStudents} học viên</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Campus Scope Selector */}
          <div className="w-full sm:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-xl space-y-3 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FACC15] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Phạm Vi Cơ Sở Phụ Trách</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Max 20 HS/Lớp
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Cơ sở được giao phụ trách:</span>
                {!isGlobalRole && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                    <Lock className="w-3 h-3 text-amber-300" />
                    Cố định theo phân quyền
                  </span>
                )}
              </div>

              {isGlobalRole ? (
                <div className="bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <select
                    value={selectedCampus}
                    onChange={(e) => handleCampusSelectChange(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer truncate"
                  >
                    {campusesList.length === 0 && (
                      <option value="" className="text-slate-900">
                        Đang tải danh sách cơ sở...
                      </option>
                    )}
                    {campusesList.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-900 font-semibold bg-white">
                        {c.name} {c.code ? `(${c.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-white/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-white shadow-inner">
                  <Building2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <div className="truncate font-black text-xs text-white" title={currentCampusName}>
                    {currentCampusName || 'Đang tải thông tin cơ sở...'}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-cyan-200/90 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>
                  {isGlobalRole
                    ? 'Tài khoản Giám đốc/Admin: Được phép điều phối chuyển đổi giữa tất cả cơ sở.'
                    : 'Phân quyền RBAC: Quản lý cơ sở chỉ có thẩm quyền điều phối trong cơ sở được giao.'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Dedicated Module Switcher Tabs (Synchronized with Sidebar) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'dashboard', label: '1. Tổng quan & Đối sánh Cơ sở', icon: BarChart3 },
            { id: 'classes_schedule', label: '2. Đợt học, Lớp học & Phân công GV', icon: Calendar },
            { id: 'clustering', label: '3. Xếp lớp Đầu vào & Phân cụm AI', icon: Sparkles },
            { id: 'escalations', label: '4. Cảnh báo Cấp 3 & Họp 3 bên', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSection(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={loadCampusOperationalData}
          disabled={loadingData}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* 3. 4 Real KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng học viên cơ sở
            </span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-extrabold text-slate-900">{totalCampusStudents}</span>
            <span className="text-xs font-semibold text-slate-400">học viên</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Sĩ số trung bình:</span>
            <strong className="text-blue-700">
              {mergedClasses.length > 0
                ? `${Math.round(totalCampusStudents / mergedClasses.length)} / 20 HS`
                : '0 / 20 HS'}
            </strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Giảng viên cơ sở
            </span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-extrabold text-slate-900">{campusTeachers.length}</span>
            <span className="text-xs font-semibold text-slate-400">giảng viên</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Đang phụ trách lớp:</span>
            <strong className="text-indigo-700">
              {campusTeachers.filter((t) => t.activeClasses > 0).length} giảng viên
            </strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Lớp học & Đợt đào tạo
            </span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-extrabold text-slate-900">{mergedClasses.length}</span>
            <span className="text-xs font-semibold text-slate-400">
              lớp ({termsList.length} đợt học)
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Lớp đầy sĩ số (20/20):</span>
            <strong className="text-purple-700">
              {mergedClasses.filter((c) => c.studentCount >= c.maxCapacity).length} lớp
            </strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Độ làm chủ 4 miền TB
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-extrabold text-slate-900">{overallCampusMasteryPct}%</span>
            <span className="text-xs font-semibold text-slate-400">toàn cơ sở</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span>Trạng thái:</span>
            <strong className={overallCampusMasteryPct >= 65 ? 'text-emerald-700' : 'text-amber-700'}>
              {overallCampusMasteryPct === 0
                ? 'Chưa có dữ liệu'
                : overallCampusMasteryPct >= 65
                  ? 'Đạt ngưỡng ổn định'
                  : 'Cần tăng cường phụ đạo'}
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TỔNG QUAN & ĐỐI SÁNH CHẤT LƯỢNG CƠ SỞ (MGR_16, MGR_18, MGR_21) */}
      {/* ========================================================================= */}
      {resolvedSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Bản Đồ Nhiệt & Đối Sánh Chất Lượng Giữa Các Lớp Trong Cơ Sở</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {currentCampusObj?.name || 'Cơ sở đang chọn'} • Lọc đa chiều theo Đợt học, Khóa học, Miền năng lực và Giảng viên phụ trách.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportCampusReport}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Báo Cáo Cơ Sở (.csv/.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Multi-Dimension Filter Bar (MGR_21) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lọc theo Đợt học (Cohort/Term)
                </label>
                <select
                  value={filterTermId}
                  onChange={(e) => setFilterTermId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Tất cả Đợt học ({termsList.length})</option>
                  {termsList.map((t) => (
                    <option key={t.termId} value={t.termId}>
                      {t.name} ({t.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lọc theo Khóa học
                </label>
                <select
                  value={filterCourseId}
                  onChange={(e) => setFilterCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Tất cả Khóa học ({coursesList.length})</option>
                  {coursesList.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lọc theo Miền năng lực
                </label>
                <select
                  value={filterDomainCode}
                  onChange={(e) => setFilterDomainCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Tất cả 4 Miền ĐGNL</option>
                  {DOMAIN_ORDER.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lọc theo Giảng viên
                </label>
                <select
                  value={filterTeacherId}
                  onChange={(e) => setFilterTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Tất cả Giảng viên ({campusTeachers.length})</option>
                  {campusTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.activeClasses} lớp)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 Domain Averages Cards */}
            {(campusHeatmap?.domainAverages || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {campusHeatmap.domainAverages
                  .filter((d) => filterDomainCode === 'ALL' || d.domainCode === filterDomainCode)
                  .map((dom) => {
                    const meta = DOMAIN_ORDER.find((d) => d.code === dom.domainCode) || DOMAIN_ORDER[0];
                    const DomainIcon = meta.icon;
                    const pct = normalizeMasteryPct(dom.averageMastery);
                    const isWeak = pct < 60;

                    return (
                      <div
                        key={dom.domainCode}
                        className={`p-4 rounded-2xl border ${
                          isWeak
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-slate-50/80 border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-2">
                          <span className="flex items-center gap-2 truncate">
                            <DomainIcon className={`w-4 h-4 ${isWeak ? 'text-amber-600' : 'text-blue-600'}`} />
                            <span>{dom.domainName}</span>
                          </span>
                          <span className={`text-sm font-black ${isWeak ? 'text-amber-700' : 'text-blue-700'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-200/70">
                          <div
                            className={`h-full rounded-full ${
                              isWeak ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Comparative Class Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-4 font-extrabold min-w-[230px]">Lớp học, Đợt học & Giảng viên</th>
                    <th className="p-3.5 font-extrabold text-center min-w-[110px]">Sĩ số (Trần 20)</th>
                    {DOMAIN_ORDER.filter(
                      (d) => filterDomainCode === 'ALL' || d.code === filterDomainCode
                    ).map((d) => (
                      <th key={d.code} className="p-3.5 font-extrabold text-center min-w-[120px]">
                        {d.short}
                      </th>
                    ))}
                    <th className="p-3.5 font-extrabold text-center">Cảnh báo lớp</th>
                    <th className="p-4 font-extrabold text-right">Thao tác quản lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                        Không có lớp học nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((cls) => {
                      const domMap = new Map(
                        (cls.domainMasteries || []).map((m) => [m.domainCode, m])
                      );
                      const hasHighRedZone = (cls.domainMasteries || []).some(
                        (m) => normalizeMasteryPct(m.strugglingRate) > 20
                      );
                      const isFull = cls.studentCount >= cls.maxCapacity;
                      const isNearFull = cls.studentCount >= 15 && cls.studentCount < cls.maxCapacity;
                      const capBarCls = isFull
                        ? 'bg-rose-600'
                        : isNearFull
                          ? 'bg-amber-500'
                          : 'bg-emerald-600';

                      return (
                        <tr
                          key={cls.classId}
                          className={`hover:bg-slate-50/80 transition-all ${
                            hasHighRedZone ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                              <span>{cls.name}</span>
                              {cls.focusDomain && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  {cls.focusDomain}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-3">
                              <span>
                                GV: <strong className="text-slate-800">{cls.teacherName}</strong>
                              </span>
                              {cls.termName && <span>• Đợt: {cls.termName}</span>}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Lịch: {cls.scheduleSummary}
                            </div>
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="font-extrabold text-slate-900">
                              {cls.studentCount}/{cls.maxCapacity}
                              {isFull && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black">
                                  FULL
                                </span>
                              )}
                            </div>
                            <div className="w-16 h-2 bg-slate-200 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${capBarCls}`}
                                style={{
                                  width: `${Math.min(100, Math.round((cls.studentCount / Math.max(1, cls.maxCapacity)) * 100))}%`
                                }}
                              />
                            </div>
                          </td>

                          {DOMAIN_ORDER.filter(
                            (d) => filterDomainCode === 'ALL' || d.code === filterDomainCode
                          ).map((d) => {
                            const cell = domMap.get(d.code);
                            const avgPct = normalizeMasteryPct(cell?.averagePlt ?? 0);
                            const weakPct = normalizeMasteryPct(cell?.strugglingRate ?? 0);
                            const cellCls =
                              avgPct < 50 || weakPct > 20
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : avgPct < 70
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200';
                            return (
                              <td key={d.code} className="p-3.5 text-center">
                                <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl border ${cellCls}`}>
                                  <span className="font-black text-xs">{avgPct}%</span>
                                  <span className="text-[10px] font-semibold">Vùng đỏ: {weakPct}%</span>
                                </div>
                              </td>
                            );
                          })}

                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                cls.overallRiskLevel === 'HIGH_RISK' || hasHighRedZone
                                  ? 'bg-rose-600 text-white'
                                  : cls.overallRiskLevel === 'MEDIUM_RISK'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {cls.overallRiskLevel === 'HIGH_RISK' || hasHighRedZone
                                ? 'Nguy cơ cao (>20% yếu)'
                                : cls.overallRiskLevel === 'MEDIUM_RISK'
                                  ? 'Cần theo dõi'
                                  : 'Ổn định'}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(cls)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs cursor-pointer"
                              >
                                Phân công GV
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenScheduleModal(cls)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                              >
                                Lịch học
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ĐỢT HỌC, LỚP HỌC, LỊCH HỌC & PHÂN CÔNG GIÁO VIÊN (MGR_01..08) */}
      {/* ========================================================================= */}
      {resolvedSection === 'classes_schedule' && (
        <div className="space-y-6">
          {/* 2.1 Academic Terms & Courses Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Academic Terms (Đợt học) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Danh Sách Đợt Học / Học Kỳ ({termsList.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đồng bộ trực tiếp với API AcademicTerms của cơ sở.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tạo Đợt Học</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {termsList.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Chưa có đợt học nào tại cơ sở này. Hãy bấm "+ Tạo Đợt Học" để khởi tạo.
                    </p>
                    <button
                      type="button"
                      onClick={handlePrefillSampleTerm}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Nạp Đợt Học Mẫu Để Kiểm Thử</span>
                    </button>
                  </div>
                ) : (
                  termsList.map((term) => (
                    <div
                      key={term.termId}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {term.name} <span className="text-blue-600">({term.code})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Năm học: {term.academicYear} • Từ {term.startDate} đến {term.endDate}
                        </div>
                      </div>
                      <select
                        value={term.status || 'ACTIVE'}
                        onChange={(e) => handleToggleTermStatus(term, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-[11px]"
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Courses (Khóa học theo đợt) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>Khóa Học & Mức Học Phí Đợt Học ({coursesList.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trần quy chuẩn tối đa 20 học sinh/lớp cho mọi khóa học tại cơ sở.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tạo Khóa Học</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {coursesList.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Chưa có khóa học nào. Hãy tạo khóa học mới cho đợt tuyển sinh.
                    </p>
                    <button
                      type="button"
                      onClick={handlePrefillSampleCourse}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Nạp Khóa Học Mẫu Để Kiểm Thử</span>
                    </button>
                  </div>
                ) : (
                  coursesList.map((crs) => (
                    <div
                      key={crs.courseId}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {crs.name} <span className="text-indigo-600">({crs.code})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Thời lượng: {crs.durationWeeks} tuần • Sĩ số tối đa: {crs.maxClassSize || 20} HS/lớp
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-emerald-700">
                          {Number(crs.tuitionFee || 0).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-[10px] text-slate-500">{crs.totalClassesCount || 0} lớp đang mở</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 2.2 Class Allocation & Teacher Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Classes List with Color-Coded Capacity & Assign Teacher / Schedule */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Điều Phối Lớp Học Offline & Phân Công Giáo Viên</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thanh màu sĩ số: Xanh (&lt; 15 HS), Vàng (15 - 19 HS), Đỏ (20/20 FULL - Tự động tràn lớp mới).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateClassModal}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Mở Lớp Học Mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {mergedClasses.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Chưa có lớp học nào tại cơ sở này.
                  </p>
                ) : (
                  mergedClasses.map((cls) => {
                    const isFull = cls.studentCount >= cls.maxCapacity;
                    const isNear = cls.studentCount >= 15 && cls.studentCount < cls.maxCapacity;
                    const barColor = isFull
                      ? 'bg-rose-600'
                      : isNear
                        ? 'bg-amber-500'
                        : 'bg-emerald-600';
                    const badgeCls = isFull
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : isNear
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                    return (
                      <div
                        key={cls.classId}
                        className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-black text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                              <span>{cls.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                                {cls.classTypeLabel}
                              </span>
                              {cls.focusDomain && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  {cls.focusDomain}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                              <span>
                                Giảng viên phụ trách:{' '}
                                <strong className="text-slate-900">{cls.teacherName}</strong>
                              </span>
                              {cls.termName && <span>• Đợt: {cls.termName}</span>}
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded-xl border text-xs font-black shrink-0 ${badgeCls}`}>
                            {cls.studentCount}/{cls.maxCapacity} {isFull ? 'FULL' : 'HS'}
                          </span>
                        </div>

                        {/* Color-coded capacity progress bar (MGR_08) */}
                        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{
                              width: `${Math.min(100, Math.round((cls.studentCount / Math.max(1, cls.maxCapacity)) * 100))}%`
                            }}
                          />
                        </div>

                        {/* Schedule & Room Conflict Alert if this class conflicts with another */}
                        {classConflictsMap[cls.classId]?.length > 0 && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fade">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-extrabold text-rose-900">Phát hiện xung đột lịch / phòng:</span>
                              {classConflictsMap[cls.classId].map((msg, idx) => (
                                <div key={idx} className="text-rose-700 text-[11px]">• {msg}</div>
                              ))}
                              <div className="text-[10px] text-rose-600 italic">
                                Bấm "Thời Khóa Biểu & Phòng" bên dưới để chọn phòng khác hoặc đổi ca học.
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{cls.scheduleSummary}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEnrollModalClass(cls);
                                setStudentIdToEnroll('');
                                setEnrollResultNotice(null);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Xếp / Chuyển HS</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(cls)}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Phân Công / Đổi GV</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenScheduleModal(cls)}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Thời Khóa Biểu & Phòng</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 5 Cols: Campus Teacher Utilization Roster (Real Class Counts, No Hardcoded 4.9 Star!) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Đội Ngũ Giảng Viên Cơ Sở & Tải Giảng Dạy</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số lớp phụ trách được tính tự động từ danh sách lớp thực tế của cơ sở.
                </p>
              </div>

              <div className="space-y-3">
                {campusTeachers.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Chưa có giảng viên nào thuộc cơ sở này.
                  </p>
                ) : (
                  campusTeachers.map((t) => {
                    const utilPct = Math.min(100, Math.round((t.activeClasses / 4) * 100));
                    return (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-2">
                              <span>{t.name}</span>
                              <span className="px-2 py-0.5 text-[10px] rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {t.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{t.email}</span>
                            </div>
                            <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                              Chuyên môn: {t.subject}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-900">
                              {t.activeClasses} Lớp đang dạy
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Tải phân bổ lớp dạy</span>
                            <span>{t.activeClasses} / 4 lớp khuyến nghị</span>
                          </div>
                          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${utilPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: XẾP LỚP ĐẦU VÀO & PHÂN CỤM LỚP CHUYÊN ĐỀ AI K-MEANS (MGR_09..15) */}
      {/* ========================================================================= */}
      {resolvedSection === 'clustering' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Tự Động Xếp Lớp & Phân Cụm Lớp Chuyên Đề AI K-Means (5 - 20 Học Sinh / Lớp)</span>
                </h2>
                <p className="text-xs text-slate-500 max-w-3xl">
                  Phân tích vector năng lực 4 miền (Ngôn ngữ, Toán & Logic, KHTN, KHXH) từ bài khảo sát đầu vào 30 câu để gom học sinh có cùng lỗ hổng kiến thức vào các Lớp Chuyên Đề tại cơ sở.
                </p>
                <div className="text-[11px] text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-3 py-1 rounded-lg mt-1 inline-flex items-center gap-1.5 font-medium">
                  💡 <strong>Phân biệt nghiệp vụ:</strong> Quản lý cơ sở dùng tính năng này để <u>lập Lớp Chuyên Đề mới</u> cho học sinh toàn campus (5 - 20 HS/lớp). Việc chia nhóm nhỏ vi mô (3 - 5 HS/bàn) trong một lớp cụ thể sẽ do <u>Giáo viên phụ trách lớp</u> thực hiện trên lớp học.
                </div>
              </div>
            </div>

            <form
              onSubmit={handleRunKMeansClustering}
              className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col lg:flex-row lg:items-end justify-between gap-4"
            >
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Số lượng cụm lớp tối đa (Max K):
                  </label>
                  <input
                    type="number"
                    value={maxKInput}
                    onChange={(e) => setMaxKInput(e.target.value)}
                    className="w-36 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm font-black text-slate-900"
                    placeholder="VD: 4"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 pb-1">
                  <div>
                    • Ràng buộc sĩ số chuẩn: <strong>Tối thiểu 5 HS – Tối đa 20 HS / Lớp</strong>
                  </div>
                  <div>
                    • Học sinh chưa hoàn thành bài kiểm tra đầu vào 30 câu sẽ tự động loại khỏi xếp cụm.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="submit"
                  disabled={clusteringLoading}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${clusteringLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {clusteringLoading ? 'Đang mô phỏng...' : 'Chạy Mô Phỏng Xem Trước (Preview)'}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={clusteringLoading}
                  onClick={() => executeKMeansClustering(false)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Phê Duyệt & Xuất Bản Lớp (Approve & Publish)</span>
                </button>
              </div>
            </form>

            {clusterError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{clusterError}</span>
              </div>
            )}

            {/* K-Means Result Display (MGR_09, MGR_10, MGR_11, MGR_14, MGR_15) */}
            {clusterResult && (
              <div className="space-y-5 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {clusterResult.message ||
                        `Đã phân bổ ${clusterResult.totalStudentsClustered} học sinh vào ${clusterResult.optimalK} lớp chuyên đề tối ưu.`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {typeof clusterResult.excludedUndiagnosedCount === 'number' && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold">
                        Đã loại trừ {clusterResult.excludedUndiagnosedCount} HS chưa làm bài 30 câu
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full font-black border ${
                        clusterResult.isDryRun
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-emerald-300 text-emerald-800'
                      }`}
                    >
                      {clusterResult.isDryRun ? 'Chế độ Mô phỏng (DryRun)' : 'Đã Xuất Bản Chính Thức'} • Optimal K ={' '}
                      {clusterResult.optimalK}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(clusterResult.clusters || []).map((cl) => {
                    const centroid = Array.isArray(cl.centroid) ? cl.centroid : [0.5, 0.5, 0.5, 0.5];
                    return (
                      <div
                        key={cl.classId || cl.clusterIndex}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                              Cụm #{cl.clusterIndex + 1} • {cl.domainCode || '4 Miền'}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 mt-1">{cl.className}</h3>
                            {Array.isArray(cl.dominantWeakDomains) && cl.dominantWeakDomains.length > 0 && (
                              <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                                Miền cần bù đắp: {cl.dominantWeakDomains.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-blue-700 shrink-0">
                            {cl.studentCount}/20 HS
                          </span>
                        </div>

                        {/* 4-Domain Centroid Bars (MGR_14) */}
                        <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/80">
                          <div className="text-[11px] font-extrabold text-slate-700">
                            Hồ sơ năng lực tâm cụm 4 miền (Centroid Profile):
                          </div>
                          {DOMAIN_ORDER.map((dom, dIdx) => {
                            const pct = normalizeMasteryPct(centroid[dIdx] ?? 0.5);
                            return (
                              <div key={dom.code} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold">
                                  <span className="text-slate-600">{dom.name}</span>
                                  <span className="font-bold text-slate-900">{pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct < 55 ? 'bg-rose-500' : pct < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-slate-500">
                            WCSS: <strong>{cl.wcss}</strong>
                          </span>
                          {cl.classId && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAssignModal({
                                  classId: cl.classId,
                                  name: cl.className,
                                  campusId: selectedCampus,
                                  teacherId: null
                                })
                              }
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer"
                            >
                              Gán Giáo Viên Phụ Trách
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CẢNH BÁO HỌC THUẬT CẤP 3 & HỌP 3 BÊN (MGR_17, MGR_19, MGR_20) */}
      {/* ========================================================================= */}
      {resolvedSection === 'escalations' && (
        <EarlyWarningsMentorPanel
          currentUser={currentUser}
          defaultClassId="ALL"
          roleLabel="Quản Lý Học Thuật Cơ Sở (Điều Phối Họp 3 Bên & Cảnh Báo Cấp 3)"
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PHÂN CÔNG / ĐỔI GIÁO VIÊN PHỤ TRÁCH LỚP (MGR_01, MGR_03, MGR_06, MGR_07) */}
      {/* ========================================================================= */}
      {assignModalClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Phân Công Giáo Viên Phụ Trách Lớp
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp: <strong className="text-slate-800">{assignModalClass.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Chọn Giảng viên thuộc cơ sở ({currentCampusObj?.name || 'Hiện tại'}):
                </label>
                <select
                  value={selectedTeacherForAssign}
                  onChange={(e) => {
                    setSelectedTeacherForAssign(e.target.value);
                    setAssignError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                >
                  <option value="">-- Chọn giảng viên phụ trách --</option>
                  {campusTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject} • Đang dạy {t.activeClasses} lớp)
                    </option>
                  ))}
                </select>
              </div>

              {assignError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                  {assignError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={assignBusy}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {assignBusy ? 'Đang lưu...' : 'Xác Nhận Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TẠO ĐỢT HỌC MỚI (ACADEMIC TERM) */}
      {/* ========================================================================= */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Khởi Tạo Đợt Học Mới</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillSampleTermData}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                  title="Điền tự động dữ liệu mẫu hợp lệ để kiểm thử nhanh"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Điền Mẫu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateTermSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã đợt học</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: DOT1_2026"
                    value={termForm.code}
                    onChange={(e) => setTermForm({ ...termForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                  <input
                    type="text"
                    required
                    value={termForm.academicYear}
                    onChange={(e) => setTermForm({ ...termForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên đợt học</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đợt 1 - Luyện thi ĐGNL ĐHQG-HCM 2026"
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={termForm.startDate}
                    onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={termForm.endDate}
                    onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={termBusy}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold"
                >
                  {termBusy ? 'Đang tạo...' : 'Tạo Đợt Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TẠO KHÓA HỌC MỚI (COURSE) */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tạo Khóa Học Theo Đợt</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillSampleCourseData}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
                  title="Điền tự động dữ liệu mẫu hợp lệ để kiểm thử nhanh"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Điền Mẫu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateCourseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã khóa học</label>
                <input
                  type="text"
                  required
                  placeholder="VD: CRS_DOT1_2026"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khóa học</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khóa Luyện Thi ĐGNL Trọn Gói Đợt 1 (4 Miền + Thi Thử)"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tuần học</label>
                  <input
                    type="number"
                    min="4"
                    max="52"
                    value={courseForm.durationWeeks}
                    onChange={(e) => setCourseForm({ ...courseForm, durationWeeks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Học phí trọn đợt (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={courseForm.tuitionFee}
                    onChange={(e) => setCourseForm({ ...courseForm, tuitionFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={courseBusy}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold"
                >
                  {courseBusy ? 'Đang tạo...' : 'Lưu Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MỞ LỚP HỌC MỚI KÈM LỊCH HỌC TUẦN */}
      {/* ========================================================================= */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Mở Lớp Học Mới (Trần Tối Đa 20 Học Sinh)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateClassModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lớp Toán & Logic - Tăng Tốc 01"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuộc Đợt học</label>
                  <select
                    value={classForm.termId}
                    onChange={(e) => setClassForm({ ...classForm, termId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Chọn đợt học --</option>
                    {termsList.map((t) => (
                      <option key={t.termId} value={t.termId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuộc Khóa học</label>
                  <select
                    value={classForm.courseId}
                    onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {coursesList.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Miền kiến thức phụ trách</label>
                  <select
                    value={classForm.focusDomain}
                    onChange={(e) => setClassForm({ ...classForm, focusDomain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {DOMAIN_ORDER.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giảng viên đứng lớp</label>
                  <select
                    value={classForm.teacherId}
                    onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {campusTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-800">Khung lịch học Offline hằng tuần:</div>
                  <span className="text-[10px] text-slate-500 font-semibold">Tự động đối chiếu phòng & GV</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Thứ</label>
                    <select
                      value={classForm.dayOfWeek}
                      onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {Object.entries(DAY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={classForm.startTime}
                      onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={classForm.endTime}
                      onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Phòng học</label>
                    <input
                      type="text"
                      placeholder="VD: P.301"
                      value={classForm.room}
                      onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Quick Room Suggestion Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold">Gợi ý phòng:</span>
                  {['P.301', 'P.302', 'P.303', 'P.304', 'P.305', 'Lab 01', 'Lab 02'].map((rm) => (
                    <button
                      key={rm}
                      type="button"
                      onClick={() => setClassForm({ ...classForm, room: rm })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        classForm.room === rm
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {rm}
                    </button>
                  ))}
                </div>

                {/* Realtime Conflict Alert */}
                {createClassConflict && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-start gap-2 animate-fade">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-rose-900">Không thể mở lớp do xung đột lịch:</div>
                      <div className="mt-0.5 font-normal">{createClassConflict.message}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createClassBusy || !!createClassConflict}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createClassBusy ? 'Đang mở lớp...' : 'Mở Lớp & Sinh Lịch Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: QUẢN LÝ THỜI KHÓA BIỂU & BUỔI HỌC OFFLINE CỦA LỚP */}
      {/* ========================================================================= */}
      {scheduleModalClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Thời Khóa Biểu Offline & Buổi Học: {scheduleModalClass.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lịch hiện tại: {scheduleModalClass.scheduleSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DANH SÁCH CÁC CA HỌC ĐANG CÓ TRONG TUẦN */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800">
                  Lịch học trong tuần của lớp ({Array.isArray(scheduleModalClass.weeklySchedules) ? scheduleModalClass.weeklySchedules.length : 0} ca):
                </span>
                <span className="text-[11px] text-slate-500">Bấm &quot;Đổi Phòng / Giờ&quot; để khắc phục xung đột phòng</span>
              </div>
              {(!scheduleModalClass.weeklySchedules || scheduleModalClass.weeklySchedules.length === 0) ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  Lớp chưa có ca học cố định nào. Vui lòng thiết lập ít nhất 1 ca học bên dưới.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {scheduleModalClass.weeklySchedules.map((slot, sIdx) => {
                    const isEditing = editingSlotIdx === sIdx;
                    return (
                      <div
                        key={`slot-${sIdx}`}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isEditing
                            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[10px]">
                            #{sIdx + 1}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900">
                              {DAY_LABELS[slot.dayOfWeek] || `Thứ ${slot.dayOfWeek}`}: {String(slot.startTime || '').slice(0, 5)} - {String(slot.endTime || '').slice(0, 5)}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              Phòng học: <strong className="text-slate-800 font-bold">{slot.room || 'Chưa xếp'}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditSlot(slot, sIdx)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Đổi Phòng / Giờ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWeeklySlot(sIdx)}
                            disabled={scheduleSaving}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors disabled:opacity-50"
                            title="Xóa ca học này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FORM THÊM / CẬP NHẬT CA HỌC */}
            <form
              onSubmit={handleSaveWeeklySlotAndGenerate}
              className={`p-4 rounded-2xl border space-y-3 text-xs transition-colors ${
                editingSlotIdx !== null ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  {editingSlotIdx !== null ? (
                    <>
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span>Cập nhật Ca học #{editingSlotIdx + 1} (Đổi phòng / giờ):</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span>Thêm ca học mới vào tuần & đồng bộ buổi học:</span>
                    </>
                  )}
                </div>
                {editingSlotIdx !== null ? (
                  <button
                    type="button"
                    onClick={handleCancelEditSlot}
                    className="text-[11px] text-slate-600 hover:text-slate-900 underline font-bold cursor-pointer"
                  >
                    Hủy chỉnh sửa
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 font-semibold">Tự động đối chiếu phòng & GV</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select
                  value={scheduleSlotForm.dayOfWeek}
                  onChange={(e) =>
                    setScheduleSlotForm({ ...scheduleSlotForm, dayOfWeek: e.target.value })
                  }
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  {Object.entries(DAY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={scheduleSlotForm.startTime}
                  onChange={(e) =>
                    setScheduleSlotForm({ ...scheduleSlotForm, startTime: e.target.value })
                  }
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="time"
                  value={scheduleSlotForm.endTime}
                  onChange={(e) =>
                    setScheduleSlotForm({ ...scheduleSlotForm, endTime: e.target.value })
                  }
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Phòng (VD: P.302)"
                  value={scheduleSlotForm.room}
                  onChange={(e) =>
                    setScheduleSlotForm({ ...scheduleSlotForm, room: e.target.value })
                  }
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Quick Room Suggestion Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold">Gợi ý phòng:</span>
                {['P.301', 'P.302', 'P.303', 'P.304', 'P.305', 'Lab 01', 'Lab 02'].map((rm) => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => setScheduleSlotForm({ ...scheduleSlotForm, room: rm })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                      scheduleSlotForm.room === rm
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {rm}
                  </button>
                ))}
              </div>

              {/* Realtime Conflict Alert */}
              {scheduleSlotConflict && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-start gap-2 animate-fade">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-rose-900">Không thể lưu do xung đột lịch / phòng:</div>
                    <div className="mt-0.5 font-normal">{scheduleSlotConflict.message}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {editingSlotIdx !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEditSlot}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={scheduleSaving || !!scheduleSlotConflict}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleSaving
                    ? 'Đang đồng bộ...'
                    : editingSlotIdx !== null
                    ? '💾 Lưu Thay Đổi Ca Học & Đồng Bộ'
                    : '+ Lưu Ca Học & Sinh Buổi Học'}
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-slate-800">
                Danh sách buổi học Offline đã sinh ({classSessions.length} buổi):
              </div>
              {sessionsLoading ? (
                <p className="text-slate-500 py-4 text-center">Đang tải danh sách buổi học...</p>
              ) : classSessions.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">
                  Chưa có buổi học nào được sinh cho lớp này.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {classSessions.map((ses) => (
                    <div
                      key={ses.sessionId}
                      className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900">
                          Buổi #{ses.sessionNo} • {ses.dayOfWeekLabel || ''} ({ses.sessionDate})
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Giờ: {String(ses.startTime || '').slice(0, 5)} -{' '}
                          {String(ses.endTime || '').slice(0, 5)} • Phòng: <strong>{ses.room}</strong>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                        {ses.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: XẾP / CHUYỂN HỌC SINH & TỰ ĐỘNG TRÀN LỚP 20/20 (MGR_02, MGR_04, MGR_13) */}
      {/* ========================================================================= */}
      {enrollModalClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Xếp / Chuyển Học Sinh Vào Lớp (Trần 20/20)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp đích: <strong className="text-slate-900">{enrollModalClass.name}</strong> (Hiện tại:{' '}
                  <strong>
                    {enrollModalClass.studentCount}/{enrollModalClass.maxCapacity} HS
                  </strong>
                  )
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnrollModalClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollOrTransferStudentSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                Quy tắc BR-16: Mỗi lớp tối đa <strong>20 học sinh</strong>. Nếu lớp đã đạt 20/20 học sinh, hệ thống sẽ tự động mở lớp chuyên đề song song mới và chuyển học sinh thứ 21 sang lớp mới.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Chọn học viên trong cơ sở hoặc nhập Student UUID:
                </label>
                {campusStudentsList.length > 0 && (
                  <select
                    value={studentIdToEnroll}
                    onChange={(e) => setStudentIdToEnroll(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 mb-2"
                  >
                    <option value="">-- Chọn học viên từ danh sách cơ sở --</option>
                    {campusStudentsList
                      .filter(
                        (s) =>
                          !s.campusId ||
                          !selectedCampus ||
                          String(s.campusId) === String(selectedCampus)
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                  </select>
                )}
                <input
                  type="text"
                  value={studentIdToEnroll}
                  onChange={(e) => setStudentIdToEnroll(e.target.value)}
                  placeholder="Hoặc dán trực tiếp mã UUID học sinh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                />
              </div>

              {enrollResultNotice && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold space-y-1 ${
                    enrollResultNotice.isOverflowTriggered
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div>{enrollResultNotice.message}</div>
                  <div className="text-[11px] font-semibold">
                    Lớp chính thức: <strong>{enrollResultNotice.enrolledClassName}</strong> • Sĩ số:{' '}
                    <strong>
                      {enrollResultNotice.currentEnrolledCount}/{enrollResultNotice.maxCapacity} HS
                    </strong>{' '}
                    {enrollResultNotice.isFull ? '(20/20 FULL)' : ''}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnrollModalClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={enrollBusy}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {enrollBusy ? 'Đang xử lý...' : 'Xác Nhận Xếp Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
