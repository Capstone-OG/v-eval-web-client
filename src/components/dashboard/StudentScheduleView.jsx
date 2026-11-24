import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { practiceService } from '../../services/practiceService';
import { paymentService } from '../../services/paymentService';
import WeeklyScheduleCalendar from './WeeklyScheduleCalendar';
import { getOfflineSessionPlan } from '../../utils/offlineSessionStore';
import { getAllRemedialSessions } from '../../utils/remedialSessionStore';
import { studentOfflineSessions } from '../../utils/studentOfflineSchedule';
export default function StudentScheduleView({
  studentId = null,
  onOpenPracticeModal,
  onOpenAiTutor
}) {
  const [terms, setTerms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [selectedCourseCode, setSelectedCourseCode] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | SCHEDULED | COMPLETED | MAKEUP_SUB
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const [planVersion, setPlanVersion] = useState(0);
  useEffect(() => {
    const refresh = () => { setPlanVersion((value) => value + 1); setSelectedSession(null); };
    const events = ['storage', 'veval:offline-session-updated', 'veval:remedial-session-scheduled', 'veval:remedial-session-deleted'];
    events.forEach((event) => window.addEventListener(event, refresh));
    return () => events.forEach((event) => window.removeEventListener(event, refresh));
  }, []);

  const loadScheduleData = useCallback(async (termIdFilter) => {
    const request = ++requestVersion.current;
    setIsLoading(true);
    setError('');
    setSelectedSession(null);
    setTimetable(null);
    if (!studentId) {
      setError('Chưa xác định được tài khoản học sinh.');
      setIsLoading(false);
      return;
    }
    try {
      const [timetableData, tuitionStatus] = await Promise.all([
        practiceService.getStudentTimetable({
          studentId,
          termId: termIdFilter !== 'ALL' ? termIdFilter : null
        }),
        paymentService.getStudentTuitionStatus(studentId).catch(() => null)
      ]);

      if (request !== requestVersion.current) return;

      // Chỉ giữ các Đợt học thực sự gắn với lớp đang học / khóa học đã mua của học sinh
      const termMap = new Map();
      (timetableData?.availableTerms || []).forEach((t) => {
        if (t?.termId) termMap.set(t.termId, t);
      });
      (timetableData?.enrolledClasses || []).forEach((cls) => {
        if (cls.termId && !termMap.has(cls.termId)) {
          termMap.set(cls.termId, {
            termId: cls.termId,
            code: cls.termCode || 'TERM',
            name: cls.termName || cls.academicYear || 'Đợt học hiện tại'
          });
        }
      });

      // Chỉ giữ các Khóa học mà học sinh thực sự đang ghi danh hoặc đã thanh toán (không kéo toàn bộ catalog 4 khóa)
      const courseMap = new Map();
      (timetableData?.enrolledClasses || []).forEach((cls) => {
        const key = cls.courseCode || cls.courseId;
        if (key && !courseMap.has(key)) {
          courseMap.set(key, {
            courseId: cls.courseId,
            code: cls.courseCode || cls.courseId,
            name: cls.courseName || cls.courseCode || 'Khóa học đang theo học'
          });
        }
      });
      if (tuitionStatus?.isPaid && (tuitionStatus.courseCode || tuitionStatus.courseName || tuitionStatus.courseId)) {
        const key = tuitionStatus.courseCode || tuitionStatus.courseId || tuitionStatus.courseName;
        if (key && !courseMap.has(key)) {
          courseMap.set(key, {
            courseId: tuitionStatus.courseId || null,
            code: tuitionStatus.courseCode || key,
            name: tuitionStatus.courseName || tuitionStatus.courseCode || key
          });
        }
      }
      (tuitionStatus?.payments || [])
        .filter((p) => p?.status === 'SUCCESS' || p?.status === 'PAID')
        .forEach((p) => {
          const key = p.courseCode || p.courseId || p.courseName;
          if (key && !courseMap.has(key)) {
            courseMap.set(key, {
              courseId: p.courseId || null,
              code: p.courseCode || key,
              name: p.courseName || p.courseCode || key
            });
          }
        });

      setTerms(Array.from(termMap.values()));
      setCourses(Array.from(courseMap.values()));
      setTimetable(timetableData);

    } catch {
      if (request !== requestVersion.current) return;
      setError('Chưa tải được thời khóa biểu. Vui lòng làm mới để thử lại.');
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
      if (request === requestVersion.current) setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const requests = requestVersion;
    loadScheduleData(selectedTermId);
    return () => { requests.current++; };
  }, [selectedTermId, loadScheduleData]);




  const filteredSessions = useMemo(() => {
    const all = studentOfflineSessions(timetable, studentId, getOfflineSessionPlan, getAllRemedialSessions());
    void planVersion; // Local storage events invalidate the derived teacher plan.
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
  }, [timetable, studentId, selectedCourseCode, statusFilter, planVersion]);

  return (
    <WeeklyScheduleCalendar
      timetable={timetable} terms={terms} courses={courses} sessions={filteredSessions}
      isLoading={isLoading} error={error}
      selectedTermId={selectedTermId} onTermChange={setSelectedTermId}
      selectedCourseCode={selectedCourseCode} onCourseChange={setSelectedCourseCode}
      statusFilter={statusFilter} onStatusChange={setStatusFilter}
      onRefresh={() => loadScheduleData(selectedTermId)}
      selectedSession={selectedSession} onSelectSession={setSelectedSession}
      onPractice={onOpenPracticeModal} onAiTutor={onOpenAiTutor}
    />
  );
}
