import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { practiceService } from '../../services/practiceService';
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
      const [termsData, coursesData, timetableData] = await Promise.all([
        practiceService.getAcademicTerms().catch(() => []),
        practiceService.getCourses().catch(() => []),
        practiceService.getStudentTimetable({
          studentId,
          termId: termIdFilter !== 'ALL' ? termIdFilter : null
        })
      ]);

      if (request !== requestVersion.current) return;
      setTerms(Array.isArray(termsData) ? termsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
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
