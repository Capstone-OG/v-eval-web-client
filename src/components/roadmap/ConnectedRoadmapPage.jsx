import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Lock,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import paymentService from '../../services/paymentService';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../services/apiClient';
import { setTuitionPaid } from '../curriculum/curriculumAccess';
import PlarNodeStudioPanel from './PlarNodeStudioPanel';

const validateRoadmap = (value, studentId) => {
  if (!value?.roadmapId || value.studentId !== studentId || !Array.isArray(value.stages) || !Array.isArray(value.nodes)) {
    throw new Error('Máy chủ trả về lộ trình không hợp lệ.');
  }
  return value;
};

const getDefaultFutureExamDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
};

const inferGradeFromText = (chapterName = '', lessonName = '', skillName = '') => {
  const text = `${chapterName} ${lessonName} ${skillName}`.toLowerCase();
  if (text.includes('lớp 10') || text.includes('lop 10') || text.includes('khối 10') || text.includes('- 10)')) return 10;
  if (text.includes('lớp 11') || text.includes('lop 11') || text.includes('khối 11') || text.includes('- 11)')) return 11;
  if (text.includes('lớp 12') || text.includes('lop 12') || text.includes('khối 12') || text.includes('- 12)')) return 12;
  return 0;
};

const resolveAssessmentStatus = (node) => {
  const raw = String(node?.assessmentStatus || '').toUpperCase();
  if (raw === 'WEAK' || raw === 'MASTERED' || raw === 'COMPLETED' || raw === 'UNASSESSED') {
    return raw;
  }
  if (node?.status === 'COMPLETED') return 'COMPLETED';
  const plt = Number(node?.masteryPlt || 0);
  if (plt >= 0.7) return 'MASTERED';
  if (plt > 0) return 'WEAK';
  return 'UNASSESSED';
};

const ZONE_SORT_ORDER = {
  WEAK: 0,
  UNASSESSED: 1,
  MASTERED: 2,
  COMPLETED: 3
};

const extractNumber = (text = '', prefix = 'Chương') => {
  const m = String(text).match(new RegExp(`${prefix}\\s*(\\d+)`, 'i'));
  return m ? Number(m[1]) : 999;
};

const PLAR_BADGE_MAP = {
  PREVIEW: { label: 'Preview', cls: 'bg-indigo-50 text-indigo-700' },
  LEARN: { label: 'Learn', cls: 'bg-blue-50 text-blue-700' },
  APPLY: { label: 'Apply', cls: 'bg-cyan-50 text-cyan-700' },
  REMEDIAL: { label: 'Cứu trợ', cls: 'bg-amber-50 text-amber-700' },
  REFLECT: { label: 'Reflect', cls: 'bg-emerald-50 text-emerald-700' },
  COMPLETED: { label: 'Xong', cls: 'bg-emerald-50 text-emerald-700' }
};

const cleanDisplaySkillName = (name = '') =>
  String(name).replace(/^(Dạng|Pattern)\s*\d+\s*[:.\-•]\s*/i, '').trim() || name;

function RoadmapLessonRow({ node, isSelected, onSelect }) {
  const assess = node._assessmentStatus;
  const isCompleted = assess === 'COMPLETED' || node.status === 'COMPLETED';
  const isWeak = assess === 'WEAK';
  const isMastered = assess === 'MASTERED';
  const isUnassessed = assess === 'UNASSESSED';
  const isPruned = node.status === 'SKIPPED_PRUNED';
  const plarInfo = PLAR_BADGE_MAP[node.currentPlarStep] || null;
  const mastery = Math.round(Number(node.masteryPlt || 0) * 100);

  return (
    <button
      type="button"
      onClick={() => onSelect(node.nodeId)}
      className={`group w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-t border-slate-100 first:border-t-0 ${
        isSelected ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
            isCompleted
              ? 'bg-emerald-600 text-white'
              : isWeak
              ? 'bg-rose-100 text-rose-700'
              : isMastered
              ? 'bg-emerald-100 text-emerald-700'
              : isPruned
              ? 'bg-slate-200 text-slate-500'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isPruned ? <Lock className="w-3.5 h-3.5" /> : node.stepOrder}
        </span>

        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">
            {cleanDisplaySkillName(node.skillName)}
          </div>
          {node.lessonName && (
            <div className="text-xs text-slate-500 truncate">
              {node.lessonName}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {plarInfo && !isCompleted && !isPruned && node.currentPlarStep !== 'PREVIEW' && (
          <span className={`hidden sm:inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${plarInfo.cls}`}>
            {plarInfo.label}
          </span>
        )}
        <span className="text-xs font-bold tabular-nums w-12 text-right">
          {isUnassessed ? (
            <span className="text-slate-400">—</span>
          ) : (
            <span className={mastery >= 70 ? 'text-emerald-600' : 'text-rose-600'}>
              {mastery}%
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors">
          <span>Học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

export default function ConnectedRoadmapPage({
  curriculum,
  onNavigateDiagnostic,
  onNavigateTuition,
  onOpenAiTutorWithContext
}) {
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [submissionId, setSubmissionId] = useState('');
  const [examDate, setExamDate] = useState(getDefaultFutureExamDate);
  const [hours, setHours] = useState('2');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Real Tuition Status from Backend
  const [isPaid, setIsPaid] = useState(false);

  // Learn-First Navigation: 'study' (Default: PLAR Studio) | 'map' (Compact Chapter Map) | 'curriculum' (SGK 9 môn)
  const [workspaceMode, setWorkspaceMode] = useState('study');
  const [zoneFilter, setZoneFilter] = useState('WEAK'); // WEAK | UNASSESSED | MASTERED
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [visibleChapterCount, setVisibleChapterCount] = useState(10);

  const creatingRef = useRef(false);
  const user = tokenStorage.getUser();
  const studentId = user?.userId || user?.id || user?.studentId;

  const handleOpenNodeStudio = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
    setWorkspaceMode('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      if (!studentId || !tokenStorage.getAccessToken()) {
        throw new Error('Vui lòng đăng nhập bằng tài khoản học sinh.');
      }

      const [roadmapRes, attemptsRes, paymentStatusRes] = await Promise.all([
        practiceService.getMyRoadmap(studentId).catch((err) => {
          if (err?.status === 404) return null;
          throw err;
        }),
        practiceService.getDiagnosticHistory(studentId).catch(() => []),
        paymentService.getStudentTuitionStatus(studentId).catch(() => ({ isPaid: false }))
      ]);

      const current = roadmapRes ? validateRoadmap(roadmapRes, studentId) : null;
      setRoadmap(current);

      const serverPaid = Boolean(
        paymentStatusRes?.isPaid
        || (Array.isArray(paymentStatusRes?.payments) && paymentStatusRes.payments.some((p) => p.status === 'SUCCESS' || p.status === 'PAID'))
      );
      setIsPaid(serverPaid);
      setTuitionPaid(studentId, serverPaid);

      const completed = Array.isArray(attemptsRes)
        ? attemptsRes
            .filter((item) => item.status === 'COMPLETED' && item.studentId === studentId)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        : [];
      setHistory(completed);
      setSubmissionId(current?.diagnosticSubmissionId || completed[0]?.submissionId || '');

      if (current?.nodes?.length > 0) {
        const hasWeak = current.nodes.some((n) => resolveAssessmentStatus(n) === 'WEAK');
        if (!hasWeak) setZoneFilter('UNASSESSED');

        setSelectedNodeId((prev) => {
          if (prev && current.nodes.some((n) => n.nodeId === prev)) return prev;
          const firstWeak = current.nodes.find((n) => resolveAssessmentStatus(n) === 'WEAK');
          const active = current.nodes.find((n) => n.status === 'IN_PROGRESS' || n.status === 'UNLOCKED');
          return firstWeak?.nodeId || active?.nodeId || current.nodes[0].nodeId;
        });
      }

      if (!current) {
        try {
          const profile = await authService.getStudentProfile();
          if (profile?.examDate) setExamDate(profile.examDate.slice(0, 10));
          if (profile?.studyHoursDay) setHours(String(profile.studyHoursDay));
        } catch {
          // keep sensible defaults
        }
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể tải lộ trình học tập.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onTuitionUpdated = (event) => {
      if (!event?.detail?.studentId || event.detail.studentId === studentId) {
        setIsPaid(Boolean(event?.detail?.paid));
      }
    };
    window.addEventListener('veval:tuition-paid', onTuitionUpdated);
    return () => window.removeEventListener('veval:tuition-paid', onTuitionUpdated);
  }, [studentId]);

  useEffect(() => {
    setVisibleChapterCount(10);
    setExpandedChapters({});
  }, [zoneFilter, selectedSubjectFilter, selectedGradeFilter, searchQuery]);

  const runGenerateRoadmap = async (targetSubmissionId) => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true);
    setError('');
    try {
      const subId = targetSubmissionId || submissionId || history[0]?.submissionId;
      if (!subId || !history.some((item) => item.submissionId === subId)) {
        throw new Error('Chọn bài kiểm tra đầu vào đã nộp thành công.');
      }
      const resolvedDate = examDate && new Date(`${examDate}T23:59:59`) > new Date()
        ? examDate
        : getDefaultFutureExamDate();
      const resolvedHours = Number(hours) > 0 && Number(hours) <= 24 ? Number(hours) : 2;

      const result = await practiceService.generateRoadmap({
        studentId,
        diagnosticSubmissionId: subId,
        examDate: `${resolvedDate}T00:00:00`,
        studyHoursPerDay: resolvedHours
      });
      const validated = validateRoadmap(result, studentId);
      setRoadmap(validated);
      setShowRegenerateForm(false);
      const firstWeak = validated.nodes.find((n) => resolveAssessmentStatus(n) === 'WEAK');
      const firstActive = firstWeak || validated.nodes.find((n) => n.status === 'IN_PROGRESS') || validated.nodes[0];
      if (firstActive) {
        setSelectedNodeId(firstActive.nodeId);
        setWorkspaceMode('study');
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể khởi tạo lộ trình. Vui lòng thử lại.');
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  const generate = async (event) => {
    event.preventDefault();
    if (!examDate || new Date(`${examDate}T23:59:59`) <= new Date() || !(Number(hours) > 0 && Number(hours) <= 24)) {
      setError('Ngày thi phải ở tương lai và thời gian học từ trên 0 đến 24 giờ/ngày.');
      return;
    }
    await runGenerateRoadmap(submissionId);
  };

  const allNodes = useMemo(() => {
    return (roadmap?.nodes || [])
      .map((n) => ({
        ...n,
        _assessmentStatus: resolveAssessmentStatus(n),
        _gradeLevel: Number(n.gradeLevel || 0) || inferGradeFromText(n.chapterName, n.lessonName, n.skillName),
        _chapterNum: extractNumber(n.chapterName, 'Chương'),
        _lessonNum: extractNumber(n.lessonName, 'Bài')
      }))
      .sort((a, b) => {
        const za = ZONE_SORT_ORDER[a._assessmentStatus] ?? 1;
        const zb = ZONE_SORT_ORDER[b._assessmentStatus] ?? 1;
        if (za !== zb) return za - zb;
        return a.stepOrder - b.stepOrder;
      });
  }, [roadmap]);

  const zoneCounts = useMemo(() => {
    let weak = 0;
    let ok = 0;
    let unassessed = 0;
    allNodes.forEach((n) => {
      if (n._assessmentStatus === 'WEAK') weak++;
      else if (n._assessmentStatus === 'MASTERED' || n._assessmentStatus === 'COMPLETED') ok++;
      else unassessed++;
    });
    return { weak, ok, unassessed };
  }, [allNodes]);

  const availableSubjects = useMemo(() => {
    const map = new Map();
    allNodes.forEach((n) => {
      const key = n.subjectName || n.domainName || 'Chuyên đề chung';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [allNodes]);

  const availableGrades = useMemo(() => {
    const set = new Set();
    allNodes.forEach((n) => {
      if (n._gradeLevel >= 10 && n._gradeLevel <= 12) set.add(n._gradeLevel);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [allNodes]);

  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allNodes.filter((n) => {
      if (zoneFilter === 'WEAK' && n._assessmentStatus !== 'WEAK') return false;
      if (zoneFilter === 'MASTERED' && n._assessmentStatus !== 'MASTERED' && n._assessmentStatus !== 'COMPLETED') return false;
      if (zoneFilter === 'UNASSESSED' && n._assessmentStatus !== 'UNASSESSED') return false;

      if (selectedSubjectFilter !== 'ALL') {
        const subj = n.subjectName || n.domainName || 'Chuyên đề chung';
        if (subj !== selectedSubjectFilter) return false;
      }

      if (selectedGradeFilter > 0 && n._gradeLevel !== selectedGradeFilter) return false;

      if (q) {
        const hay = `${n.skillName || ''} ${n.chapterName || ''} ${n.lessonName || ''} ${n.subjectName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [allNodes, zoneFilter, selectedSubjectFilter, selectedGradeFilter, searchQuery]);

  // Group filtered nodes cleanly by Subject + Grade + Chapter to avoid dumping 337 flat cards
  const chapterGroups = useMemo(() => {
    const map = new Map();
    filteredNodes.forEach((n) => {
      const subject = n.subjectName || n.domainName || 'Chuyên đề chung';
      const chapter = n.chapterName || 'Chuyên đề tổng hợp';
      const grade = n._gradeLevel || 0;
      const key = `${subject}__${grade}__${chapter}`;
      if (!map.has(key)) {
        map.set(key, { key, subject, grade, chapter, nodes: [] });
      }
      map.get(key).nodes.push(n);
    });
    return Array.from(map.values());
  }, [filteredNodes]);

  const selectedNode = useMemo(
    () => allNodes.find((n) => n.nodeId === selectedNodeId) || allNodes[0] || null,
    [allNodes, selectedNodeId]
  );

  const toggleChapter = (key, defaultOpen) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [key]: prev[key] !== undefined ? !prev[key] : !defaultOpen
    }));
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* SINGLE UNIFIED SLIM TOP BAR (No double headers, no redundant KPI walls) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWorkspaceMode('study')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              workspaceMode === 'study'
                ? 'bg-gradient-to-r from-[#1E3A5F] to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{selectedNode ? `Đang Học • Chặng #${selectedNode.stepOrder}` : 'Đang Học (P-L-A-R)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceMode('map')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              workspaceMode === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Chọn Bài / Lộ Trình</span>
            {zoneCounts.weak > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                workspaceMode === 'map' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {zoneCounts.weak} ưu tiên
              </span>
            )}
          </button>

          {curriculum && (
            <button
              type="button"
              onClick={() => setWorkspaceMode('curriculum')}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                workspaceMode === 'curriculum'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kho SGK 9 Môn</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {roadmap && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              <span>Đạt OK: <strong className="text-emerald-600">{zoneCounts.ok}</strong>/{allNodes.length}</span>
              <span className="text-slate-300">•</span>
              <span>Mục tiêu: <strong className="text-indigo-700">{roadmap.targetScore}</strong></span>
            </span>
          )}
          {!isPaid && onNavigateTuition && (
            <button
              type="button"
              onClick={onNavigateTuition}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-extrabold text-white cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Mở Khóa</span>
            </button>
          )}
          {roadmap && history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRegenerateForm((v) => !v)}
              title="Cập nhật / Sinh lại lộ trình"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading || creating}
            title="Làm mới dữ liệu"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-1.5 text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* REGENERATE ROADMAP DRAWER (Only shown when explicitly clicked or no roadmap yet) */}
      {!loading && history.length > 0 && (!roadmap || showRegenerateForm) && workspaceMode !== 'curriculum' && (
        <form onSubmit={generate} className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-sm sm:text-base text-indigo-950">
              {roadmap ? 'Cập Nhật Lộ Trình Học' : 'Khởi Tạo Lộ Trình Cá Nhân Hóa'}
            </h2>
            {showRegenerateForm && (
              <button
                type="button"
                onClick={() => setShowRegenerateForm(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block text-xs font-bold text-slate-700">
              Bài test đầu vào
              <select
                required
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
              >
                {history.map((item) => (
                  <option key={item.submissionId} value={item.submissionId}>
                    {new Date(item.completedAt).toLocaleString('vi-VN')} · {item.totalCorrect}/{item.totalQuestions} câu
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Ngày thi dự kiến
              <input
                required
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Giờ học / ngày
              <input
                required
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{creating ? 'Đang khởi tạo...' : 'Tạo Lộ Trình Ngay'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: CURRICULUM EXPLORER (SGK 9 MÔN) */}
      {workspaceMode === 'curriculum' && curriculum}

      {/* EMPTY STATE: NO DIAGNOSTIC YET */}
      {workspaceMode !== 'curriculum' && !loading && !roadmap && history.length === 0 && (
        <section className="rounded-3xl border-2 border-dashed border-blue-200 bg-white p-8 text-center space-y-4">
          <Target className="w-10 h-10 text-blue-600 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-black text-slate-900">Làm Bài Test Đầu Vào 30 Câu để bắt đầu</h2>
            <p className="text-sm text-slate-500">
              Hệ thống sẽ đo năng lực nhanh trên 9 môn và mở ngay bài học ưu tiên cho bạn.
            </p>
          </div>
          {onNavigateDiagnostic && (
            <button
              type="button"
              onClick={onNavigateDiagnostic}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt Đầu Bài Test Đầu Vào</span>
            </button>
          )}
        </section>
      )}

      {/* LOADING STATE */}
      {workspaceMode !== 'curriculum' && loading && (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center space-y-2 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p className="text-sm font-semibold">Đang tải không gian học tập...</p>
        </div>
      )}

      {/* TAB 1 (DEFAULT — LEARN FIRST!): FULL-WIDTH DEDICATED PLAR STUDIO */}
      {workspaceMode === 'study' && !loading && roadmap && selectedNode && (
        <PlarNodeStudioPanel
          node={selectedNode}
          studentId={studentId}
          isPaid={isPaid}
          onBackToMap={() => setWorkspaceMode('map')}
          onNavigateTuition={onNavigateTuition}
          onOpenAiTutorWithContext={onOpenAiTutorWithContext}
          onNodeCompleted={() => load({ silent: true })}
          onNodeEvaluated={() => load({ silent: true })}
          onSelectNextNode={(nextId) => {
            setSelectedNodeId(nextId);
            load({ silent: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* TAB 2: COMPACT, DEDUPLICATED CHAPTER-GROUPED ROADMAP BROWSER */}
      {workspaceMode === 'map' && !loading && roadmap && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Single Compact Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoneFilter('WEAK')}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer transition-colors ${
                  zoneFilter === 'WEAK'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Ưu tiên học ({zoneCounts.weak})
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter('UNASSESSED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer transition-colors ${
                  zoneFilter === 'UNASSESSED'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Chưa đánh giá ({zoneCounts.unassessed})
              </button>
              <button
                type="button"
                onClick={() => setZoneFilter('MASTERED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer transition-colors ${
                  zoneFilter === 'MASTERED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Đã đạt OK ({zoneCounts.ok})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                aria-label="Lọc theo môn học"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả môn</option>
                {availableSubjects.map((s) => (
                  <option key={s.name} value={s.name}>{s.name} ({s.count})</option>
                ))}
              </select>

              {availableGrades.length > 0 && (
                <select
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(Number(e.target.value))}
                  aria-label="Lọc theo khối lớp"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value={0}>Lớp 10–12</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              )}

              <div className="relative min-w-[180px] flex-1 sm:w-52 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh bài học..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Compact Chapter Accordions (Clean, Scannable, Zero Clutter) */}
          {chapterGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
              Không có bài học nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="space-y-2.5">
              {chapterGroups.slice(0, visibleChapterCount).map((group, idx) => {
                const defaultOpen = idx < 2;
                const isOpen = expandedChapters[group.key] !== undefined ? expandedChapters[group.key] : defaultOpen;
                return (
                  <div key={group.key} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => toggleChapter(group.key, defaultOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[11px] font-extrabold shrink-0">
                          {group.subject}{group.grade > 0 ? ` ${group.grade}` : ''}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 truncate">
                          {group.chapter}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 shrink-0">
                        {group.nodes.length} dạng bài
                      </span>
                    </button>

                    {isOpen && (
                      <div>
                        {group.nodes.map((node) => (
                          <RoadmapLessonRow
                            key={node.nodeId}
                            node={node}
                            isSelected={selectedNode?.nodeId === node.nodeId}
                            onSelect={handleOpenNodeStudio}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {chapterGroups.length > visibleChapterCount && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleChapterCount((c) => c + 12)}
                    className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Xem thêm chương ({chapterGroups.length - visibleChapterCount} chương còn lại)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
