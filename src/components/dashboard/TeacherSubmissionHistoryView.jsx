import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  History,
  Users,
  Search,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Send,
  Eye
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { practiceService } from '../../services/practiceService';
import MathText from '../common/MathText';
import { toast } from '../../context/ToastContext';

const SUBMISSION_TABS = [
  { id: 'diagnostic', label: '1. Thi Đầu Vào (30 câu)', icon: ClipboardCheck, color: 'text-indigo-600', activeBg: 'bg-indigo-50 border-indigo-200' },
  { id: 'practice', label: '2. Luyện Tập Thích Ứng (ZPD)', icon: BookOpen, color: 'text-emerald-600', activeBg: 'bg-emerald-50 border-emerald-200' },
  { id: 'mock', label: '3. Thi Thử V-ACT (120 câu)', icon: FileCheck2, color: 'text-purple-600', activeBg: 'bg-purple-50 border-purple-200' }
];

export default function TeacherSubmissionHistoryView({ currentUser, onNavigate }) {
  const teacherId = currentUser?.userId || currentUser?.id;

  // 1. Dynamic Class Management
  const [classesList, setClassesList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');

  // 2. Student Roster Management
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // 3. Submissions & Inspection State
  const [activeTab, setActiveTab] = useState('diagnostic');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [diagnosticList, setDiagnosticList] = useState([]);
  const [practiceList, setPracticeList] = useState([]);
  const [mockList, setMockList] = useState([]);

  // Selected Submission for Detailed Inspection
  const [inspectingSubmission, setInspectingSubmission] = useState(null);
  const [inspectingDetail, setInspectingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pedagogical Note for Student
  const [pedagogicalNote, setPedagogicalNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [savingNote, setSavingNote] = useState(false);

  // Fetch Teacher's Dynamic Classes
  useEffect(() => {
    let active = true;
    setLoadingClasses(true);

    practiceService.getClasses({ teacherId })
      .then((res) => {
        if (!active) return;
        const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const normalized = raw.map((c) => ({
          ...c,
          id: c.classId || c.id,
          classId: c.classId || c.id
        }));
        setClassesList(normalized);
        if (normalized.length > 0) {
          setSelectedClassId((prev) => {
            const exists = normalized.some((c) => c.id === prev);
            return exists ? prev : (currentUser?.classId || normalized[0].id);
          });
        } else if (currentUser?.classId) {
          setSelectedClassId(currentUser.classId);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[TeacherSubmissionHistoryView] Error fetching classes:', err?.message);
        if (currentUser?.classId) setSelectedClassId(currentUser.classId);
      })
      .finally(() => {
        if (active) setLoadingClasses(false);
      });

    return () => { active = false; };
  }, [teacherId, currentUser?.classId]);

  // Fetch Class Heatmap / Roster when selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    let active = true;
    setLoadingStudents(true);

    practiceService.getClassHeatmap(selectedClassId)
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data?.rows) ? data.rows : [];
        const studentRoster = rows.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          targetScore: r.targetScore,
          predictedScore: r.predictedScore,
          placementClass: data?.className || 'Lớp nền tảng'
        }));

        setStudents(studentRoster);
        if (studentRoster.length > 0) {
          setSelectedStudentId((prev) => {
            const exists = studentRoster.some((s) => s.studentId === prev);
            return exists ? prev : studentRoster[0].studentId;
          });
        } else {
          setSelectedStudentId('');
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[TeacherSubmissionHistoryView] Error fetching student roster:', err?.message);
        setStudents([]);
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });

    return () => { active = false; };
  }, [selectedClassId]);

  // Load Saved Pedagogical Notes
  useEffect(() => {
    if (!selectedStudentId) {
      setSavedNotes([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`veval_student_notes_${selectedStudentId}`);
      setSavedNotes(raw ? JSON.parse(raw) : []);
    } catch {
      setSavedNotes([]);
    }
  }, [selectedStudentId]);

  // Fetch Submissions for the Selected Student across all 3 categories
  const loadStudentSubmissions = useCallback(async () => {
    if (!selectedStudentId) {
      setDiagnosticList([]);
      setPracticeList([]);
      setMockList([]);
      return;
    }

    setLoadingSubmissions(true);
    setInspectingSubmission(null);
    setInspectingDetail(null);

    try {
      // 1. Diagnostic submissions (30 câu)
      const diagPromise = apiClient.get(`/api/practice/diagnostic-submissions/student/${encodeURIComponent(selectedStudentId)}`)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.value) ? res.data.value : [];
          return list;
        })
        .catch(() => []);

      // 2. Practice submissions from LocalStorage + store
      const localPractice = practiceService.getSubmissionHistory(selectedStudentId).filter((item) =>
        ['ZPD_QUIZ', 'TOPIC_QUIZ'].includes(item.examType)
      );

      // 3. Mock Exam submissions (120 câu) & Flagged Proctoring
      const flaggedPromise = practiceService.getFlaggedMockExams(selectedClassId)
        .then((items) => items.filter((m) => String(m.studentId) === String(selectedStudentId)))
        .catch(() => []);

      const localMock = practiceService.getSubmissionHistory(selectedStudentId).filter((item) =>
        ['MOCK_EXAM', 'EXAM'].includes(item.examType)
      );

      const [diagData, flaggedData] = await Promise.all([diagPromise, flaggedPromise]);

      setDiagnosticList(diagData);
      setPracticeList(localPractice);

      // Merge mock submissions
      const mockMerged = [...localMock];
      flaggedData.forEach((f) => {
        if (!mockMerged.some((m) => String(m.id) === String(f.submissionId || f.id))) {
          mockMerged.push({
            id: f.submissionId || f.id,
            title: f.examTitle || 'Thi thử V-ACT 120 câu chuẩn hóa',
            examType: 'MOCK_EXAM',
            completedAt: f.submittedAt || new Date().toISOString(),
            score: f.score ?? 780,
            maxScore: 1200,
            proctoringStatus: f.status || 'FLAGGED',
            flagReasons: f.flagReasons || ['Rời khỏi tab thi quá 3 lần'],
            studentName: f.studentName
          });
        }
      });
      setMockList(mockMerged);
    } catch (err) {
      console.warn('[TeacherSubmissionHistoryView] Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [selectedStudentId, selectedClassId]);

  useEffect(() => {
    loadStudentSubmissions();
  }, [loadStudentSubmissions]);

  // Open Detailed Submission Inspection
  const handleInspectSubmission = async (sub, category) => {
    setInspectingSubmission({ ...sub, category });
    setLoadingDetail(true);
    setInspectingDetail(null);

    try {
      if (category === 'diagnostic' && sub.submissionId) {
        const res = await apiClient.get(`/api/practice/diagnostic-submissions/${encodeURIComponent(sub.submissionId)}`);
        setInspectingDetail(res.data?.value || res.data);
      } else if (category === 'mock' && sub.submissionId) {
        const res = await practiceService.getMockExamSubmissionDetail(sub.submissionId);
        setInspectingDetail(res);
      } else {
        // Local practice or mock with reviewedQuestions
        setInspectingDetail(sub);
      }
    } catch (err) {
      console.warn('[TeacherSubmissionHistoryView] Error fetching submission detail:', err);
      // Fallback to submission itself
      setInspectingDetail(sub);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Add Pedagogical Note
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!pedagogicalNote.trim() || !selectedStudentId) return;

    setSavingNote(true);
    const newNote = {
      id: Date.now(),
      text: pedagogicalNote.trim(),
      createdAt: new Date().toISOString(),
      studentId: selectedStudentId,
      teacherName: currentUser?.fullName || 'Giảng viên'
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    try {
      localStorage.setItem(`veval_student_notes_${selectedStudentId}`, JSON.stringify(updated));
      toast.success('Đã lưu ghi chú sư phạm cho học sinh!');
      setPedagogicalNote('');
    } catch (err) {
      toast.error('Không thể lưu ghi chú.');
    } finally {
      setSavingNote(false);
    }
  };

  // Filtered Students in class
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter((s) => s.studentName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
  }, [students, searchStudent]);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.studentId === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const currentClass = useMemo(() => {
    return classesList.find((c) => (c.classId || c.id) === selectedClassId) || null;
  }, [classesList, selectedClassId]);

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-700 p-6 md:p-8 text-white shadow-xl">
        <GraduationCap className="pointer-events-none absolute -right-6 -top-6 h-56 w-56 rotate-12 text-white/5" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Tra Cứu Lịch Sử &amp; Bài Kiểm Tra Học Viên
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-indigo-200">
                TCH-03 Chuẩn Nghiệp Vụ
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-black">
              Lịch Sử Làm Bài &amp; Phân Tích Lỗ Hổng Học Sinh
            </h1>
            <p className="mt-1 text-xs md:text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Theo dõi kết quả làm bài theo 3 nhóm: Thi đầu vào (30 câu), Luyện tập thích ứng ZPD và Thi thử V-ACT (120 câu). Xem chi tiết từng câu làm sai để chuẩn bị nội dung chữa bài sát thực tế.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStudentSubmissions}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-xs transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
            <span>Làm mới kết quả</span>
          </button>
        </div>
      </div>

      {/* Bộ Chọn Lớp Động & Danh Sách Học Sinh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI (4 phần): CHỌN LỚP & CHỌN HỌC SINH */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Chọn Lớp Động */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Lớp phụ trách ({classesList.length})</span>
              </label>
              {loadingClasses && <span className="text-[10px] text-slate-400">Đang tải...</span>}
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {classesList.map((cls) => (
                <option key={cls.id || cls.classId} value={cls.id || cls.classId}>
                  {cls.name || cls.className || 'Lớp học'} ({cls.code || 'Mã lớp'})
                </option>
              ))}
            </select>
          </div>

          {/* Card Danh Sách Học Sinh Trong Lớp */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Danh Sách Học Sinh ({students.length})
              </h3>
            </div>

            {/* Ô Tìm Kiếm Học Sinh */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Tìm tên hoặc mã học sinh..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* List học sinh */}
            <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-1">
              {loadingStudents ? (
                <div className="py-6 text-center text-xs text-slate-400">Đang tải học sinh...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">Không tìm thấy học sinh nào.</div>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = st.studentId === selectedStudentId;
                  return (
                    <button
                      key={st.studentId}
                      type="button"
                      onClick={() => setSelectedStudentId(st.studentId)}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
                          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {st.studentName.split(' ').slice(-1)[0]?.[0] || 'H'}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                            {st.studentName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{st.studentId}</p>
                        </div>
                      </div>

                      {st.predictedScore !== undefined && st.predictedScore !== null && (
                        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-indigo-700 shrink-0">
                          {st.predictedScore}đ
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Ghi Chú Sư Phạm Nhanh Cho Học Sinh */}
          {activeStudent && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ghi Chú Sư Phạm: {activeStudent.studentName}</span>
              </h4>

              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={pedagogicalNote}
                  onChange={(e) => setPedagogicalNote(e.target.value)}
                  placeholder="Ghi nhận điểm yếu, căn dặn chữa bài hoặc bài tập củng cố..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={savingNote || !pedagogicalNote.trim()}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{savingNote ? 'Đang lưu...' : 'Lưu Ghi Chú'}</span>
                </button>
              </form>

              {savedNotes.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2 border-t border-slate-100">
                  {savedNotes.slice(0, 3).map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-700 border border-slate-100">
                      <p className="font-semibold">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (8 phần): 3 TAB BÀI LÀM & CHI TIẾT CÂU LÀM SAI */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card Hồ Sơ Tóm Tắt Của Học Sinh Được Chọn */}
          {activeStudent && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Đang xem kết quả học viên
                </span>
                <h2 className="text-base font-black text-slate-900 mt-0.5">{activeStudent.studentName}</h2>
                <p className="text-xs text-slate-500">
                  Lớp: <strong>{currentClass?.name || activeStudent.placementClass}</strong> • Mã: {activeStudent.studentId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                  <div className="text-[10px] font-black text-indigo-700 uppercase">Dự kiến</div>
                  <div className="text-sm font-black text-indigo-900">{activeStudent.predictedScore ?? '—'}đ</div>
                </div>
                <div className="px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                  <div className="text-[10px] font-black text-slate-600 uppercase">Mục tiêu</div>
                  <div className="text-sm font-black text-slate-800">{activeStudent.targetScore ?? 850}đ</div>
                </div>
              </div>
            </div>
          )}

          {/* 3 TABS CHỌN NHÓM BÀI LÀM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SUBMISSION_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === 'diagnostic' ? diagnosticList.length : tab.id === 'practice' ? practiceList.length : mockList.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setInspectingSubmission(null);
                    setInspectingDetail(null);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? `${tab.activeBg} shadow-xs font-black ring-1 ring-indigo-500/30`
                      : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-600 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TabIcon className={`w-4 h-4 ${tab.color}`} />
                    <span className="text-xs truncate">{tab.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-indigo-700 shadow-2xs' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* NỘI DUNG BÀI LÀM / INSPECTION */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs min-h-[380px]">
            {loadingSubmissions ? (
              <div className="py-16 text-center text-xs text-slate-400 font-semibold flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Đang tải lịch sử làm bài của học sinh...</span>
              </div>
            ) : inspectingSubmission ? (
              /* MÀN HÌNH XEM CHI TIẾT CÂU HỎI LÀM SAI */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingSubmission(null);
                      setInspectingDetail(null);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại danh sách bài làm</span>
                  </button>

                  <span className="text-xs font-extrabold text-slate-700">
                    Chi tiết: {inspectingSubmission.title || inspectingSubmission.examTitle || 'Bài kiểm tra'}
                  </span>
                </div>

                {loadingDetail ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                    Đang nạp câu hỏi và phân tích phương án...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary Bar */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <strong>Ngày hoàn thành:</strong> {new Date(inspectingSubmission.completedAt || inspectingSubmission.submittedAt || Date.now()).toLocaleString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-2">
                        {inspectingSubmission.score !== undefined && (
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-black">
                            Điểm: {inspectingSubmission.score} {inspectingSubmission.maxScore ? `/ ${inspectingSubmission.maxScore}` : ''}
                          </span>
                        )}
                        {inspectingSubmission.proctoringStatus && (
                          <span className={`px-2.5 py-1 rounded-xl font-bold ${
                            inspectingSubmission.proctoringStatus === 'FLAGGED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Giám sát: {inspectingSubmission.proctoringStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Danh sách câu hỏi */}
                    {(() => {
                      const questions = inspectingDetail?.questions || inspectingDetail?.reviewedQuestions || inspectingSubmission?.questions || [];
                      if (questions.length === 0) {
                        return (
                          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                            Không có dữ liệu chi tiết từng câu hỏi cho bài làm này.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {questions.map((q, idx) => {
                            const isCorrect = q.isCorrect === true || q.is_correct === true || (q.studentChoice && q.studentChoice === q.correctChoice);
                            return (
                              <div
                                key={q.id || idx}
                                className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
                                  isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-black text-slate-800">
                                    Câu {q.questionNumber || q.question_number || idx + 1}
                                    {q.skillName && <span className="ml-2 font-semibold text-slate-500">({q.skillName})</span>}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    <span>{isCorrect ? 'Làm đúng' : 'Làm sai'}</span>
                                  </span>
                                </div>

                                <div className="text-xs text-slate-800 leading-relaxed font-serif">
                                  <MathText text={q.content || q.stem || 'Nội dung câu hỏi.'} />
                                </div>

                                <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] space-y-1">
                                  <div>
                                    Học sinh chọn:{' '}
                                    <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-600'}>
                                      {q.studentChoice || q.studentAnswer || 'Chưa trả lời'}
                                    </strong>
                                    {q.correctChoice && (
                                      <span className="ml-3 text-slate-600">
                                        Đáp án chuẩn: <strong className="text-emerald-700">{q.correctChoice}</strong>
                                      </span>
                                    )}
                                  </div>
                                  {q.explanation && (
                                    <p className="text-slate-500 italic pt-1 border-t border-slate-100">
                                      Lời giải: {q.explanation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* DANH SÁCH BÀI LÀM THEO TAB ĐANG CHỌN */
              <div className="space-y-3">
                {activeTab === 'diagnostic' && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Kết Quả Bài Thi Khảo Sát Đầu Vào (30 câu)
                    </h3>
                    {diagnosticList.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        Chưa có dữ liệu bài thi đầu vào của học sinh này trên hệ thống.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {diagnosticList.map((item, idx) => (
                          <div
                            key={item.submissionId || item.id || idx}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-900">
                                {item.examTitle || item.title || `Bài Khảo Sát Đầu Vào #${idx + 1}`}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Hoàn thành:{' '}
                                {item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {item.score !== undefined && (
                                <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
                                  {item.score} / {item.totalQuestions || 30} câu
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleInspectSubmission(item, 'diagnostic')}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem câu làm sai</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Lịch Sử Luyện Tập Thích Ứng (ZPD &amp; Topic Quiz)
                    </h3>
                    {practiceList.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        Chưa có dữ liệu phiên luyện tập thích ứng của học sinh này.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {practiceList.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-900">
                                {item.title || `Phiên Luyện Tập #${idx + 1}`}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Ngày làm:{' '}
                                {item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                                {item.reviewedQuestions?.length || 5} câu
                              </span>
                              <button
                                type="button"
                                onClick={() => handleInspectSubmission(item, 'practice')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem chi tiết</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mock' && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Lịch Sử Thi Thử V-ACT (120 câu Chuẩn Hóa &amp; Giám Sát Liêm Chính)
                    </h3>
                    {mockList.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                        Học sinh chưa hoàn thành bài thi thử V-ACT 120 câu nào trong cơ sở dữ liệu.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {mockList.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-slate-900">
                                  {item.title || `Thi Thử V-ACT #${idx + 1}`}
                                </h4>
                                {item.proctoringStatus === 'FLAGGED' && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                                    Cắm cờ vi phạm
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Nộp bài:{' '}
                                {item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : '—'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-black text-xs border border-purple-200">
                                {item.score || 850} / 1200đ
                              </span>
                              <button
                                type="button"
                                onClick={() => handleInspectSubmission(item, 'mock')}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem câu sai &amp; Giám sát</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

