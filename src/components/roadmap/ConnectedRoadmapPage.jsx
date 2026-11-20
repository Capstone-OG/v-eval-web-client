import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  HelpCircle,
  Lock,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
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
  PREVIEW: { label: 'P • Preview', cls: 'bg-indigo-100 text-indigo-800' },
  LEARN: { label: 'L • Learn', cls: 'bg-blue-100 text-blue-800' },
  APPLY: { label: 'A • Apply', cls: 'bg-cyan-100 text-cyan-800' },
  REMEDIAL: { label: 'BR-03 • Cứu trợ', cls: 'bg-amber-100 text-amber-800' },
  REFLECT: { label: 'R • Reflect', cls: 'bg-emerald-100 text-emerald-800' },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-100 text-emerald-800' }
};

function RoadmapNodeCard({ node, isSelected, onSelect }) {
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
      className={`w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer space-y-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-50/75 ring-1 ring-blue-500/30 shadow-xs'
          : isWeak
          ? 'border-rose-200/90 bg-rose-50/25 hover:border-rose-300 hover:bg-rose-50/50'
          : isCompleted || isMastered
          ? 'border-emerald-200/80 bg-emerald-50/25 hover:bg-emerald-50/55'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : isWeak
                ? 'bg-rose-600 text-white'
                : isMastered
                ? 'bg-emerald-100 text-emerald-800'
                : isPruned
                ? 'bg-slate-200 text-slate-500'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isPruned ? <Lock className="w-3.5 h-3.5" /> : node.stepOrder}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
              {node.skillName}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {node.subjectName || node.domainName}
              {node.chapterName ? ` • ${node.chapterName}` : ''}
            </div>
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {node._gradeLevel > 0 && (
            <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700">
              Lớp {node._gradeLevel}
            </span>
          )}
          {isWeak && (
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
              Ưu tiên cải thiện
            </span>
          )}
          {isMastered && !isCompleted && (
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              Đã đạt điểm OK
            </span>
          )}
          {isCompleted && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
              Hoàn thành PLAR
            </span>
          )}
          {isUnassessed && (
            <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Chưa đánh giá
            </span>
          )}
          {plarInfo && !isCompleted && !isPruned && node.currentPlarStep !== 'PREVIEW' && (
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${plarInfo.cls}`}>
              {plarInfo.label}
            </span>
          )}
        </div>

        <span className="text-[11px] font-bold text-slate-600 shrink-0">
          {isUnassessed ? (
            <span className="text-slate-400">Chưa đo BKT</span>
          ) : (
            <>
              BKT:{' '}
              <strong className={mastery >= 70 ? 'text-emerald-600' : 'text-rose-600'}>
                {mastery}%
              </strong>
            </>
          )}
        </span>
      </div>
    </button>
  );
}

export default function ConnectedRoadmapPage({
  onNavigateDiagnostic,
  onNavigateDashboard,
  onNavigateTuition,
  onOpenAiTutorWithContext
}) {
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [submissionId, setSubmissionId] = useState('');
  const [diagnostic, setDiagnostic] = useState(null);
  const [examDate, setExamDate] = useState(getDefaultFutureExamDate);
  const [hours, setHours] = useState('2');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Real Tuition Status from Backend
  const [tuitionStatus, setTuitionStatus] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  // Filters & Active PLAR Node
  const [zoneFilter, setZoneFilter] = useState('ALL'); // ALL | WEAK | MASTERED | UNASSESSED
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState(0); // 0 = all, 10, 11, 12
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [showMasteredSection, setShowMasteredSection] = useState(true);
  const [unassessedVisibleCount, setUnassessedVisibleCount] = useState(30);

  const creatingRef = useRef(false);
  const user = tokenStorage.getUser();
  const studentId = user?.userId || user?.id || user?.studentId;

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

      const serverPaid = Boolean(paymentStatusRes?.isPaid);
      setTuitionStatus(paymentStatusRes);
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
          // keep sensible defaults (+90d, 2h/day)
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
    const onTuitionUpdated = () => {
      load();
    };
    window.addEventListener('veval:tuition-paid', onTuitionUpdated);
    return () => window.removeEventListener('veval:tuition-paid', onTuitionUpdated);
  }, [load]);

  useEffect(() => {
    let active = true;
    setDiagnostic(null);
    if (submissionId) {
      practiceService.getDiagnosticResult(submissionId)
        .then((result) => {
          if (active && result?.studentId === studentId) setDiagnostic(result);
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [submissionId, studentId]);

  // Reset pagination when filters change
  useEffect(() => {
    setUnassessedVisibleCount(30);
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
      if (firstActive) setSelectedNodeId(firstActive.nodeId);
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

  // Enrich every node with normalized _assessmentStatus & _gradeLevel and sort along sequential learning path:
  // 1. WEAK (Ưu tiên cải thiện) -> 2. UNASSESSED (Học tuần tự từ đầu đến cuối Lớp 10->11->12, Chương 1..N, Bài 1..M) -> 3. MASTERED/COMPLETED (Hiển thị sau)
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

      if (selectedGradeFilter > 0 && n._gradeLevel !== selectedGradeFilter) {
        return false;
      }

      if (q) {
        const hay = `${n.skillName || ''} ${n.chapterName || ''} ${n.lessonName || ''} ${n.subjectName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [allNodes, zoneFilter, selectedSubjectFilter, selectedGradeFilter, searchQuery]);

  const groupedFiltered = useMemo(() => {
    const weak = [];
    const ok = [];
    const unassessed = [];
    filteredNodes.forEach((n) => {
      if (n._assessmentStatus === 'WEAK') weak.push(n);
      else if (n._assessmentStatus === 'MASTERED' || n._assessmentStatus === 'COMPLETED') ok.push(n);
      else unassessed.push(n);
    });
    return { weak, ok, unassessed };
  }, [filteredNodes]);

  const selectedNode = useMemo(
    () => allNodes.find((n) => n.nodeId === selectedNodeId) || filteredNodes[0] || null,
    [allNodes, filteredNodes, selectedNodeId]
  );

  const isLegacyShortRoadmap = Boolean(roadmap && allNodes.length > 0 && allNodes.length < 50 && history.length > 0);
  const progressPct = roadmap?.totalMilestones > 0
    ? Math.round((roadmap.completedMilestones / roadmap.totalMilestones) * 100)
    : 0;

  return (
    <div className="space-y-6 text-slate-900">
      {/* 1. HEADER + TUITION STATUS BANNER */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-100">
                <Compass className="w-3.5 h-3.5" />
                <span>Lộ Trình Toàn Diện Lớp 10–12 (Chuẩn GDPT 2018)</span>
              </span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Đã Mở Khóa Học Phí ({tuitionStatus?.courseCode || 'ACTIVE'})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Chế Độ Xem Trước • Chưa Đóng Học Phí</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Lộ Trình Tự Học Thích Ứng P-L-A-R
            </h1>
            <p className="text-sm text-slate-500">
              Học tuần tự từ đầu đến cuối: ưu tiên các dạng bài <strong>đã test &amp; còn yếu lên đầu</strong>, nối tiếp liền mạch với <strong>lộ trình các chương Lớp 10–12 chưa đánh giá</strong> (sẽ tự động được đánh giá lại khi bạn làm bài test đạt OK) và xếp các dạng <strong>đã đạt điểm OK ở sau cùng</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isPaid && onNavigateTuition && (
              <button
                type="button"
                onClick={onNavigateTuition}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Đóng Học Phí Mở Khóa PLAR</span>
              </button>
            )}
            {roadmap && history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRegenerateForm((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2.5 text-xs font-bold text-indigo-800 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cập Nhật Lộ Trình Mới</span>
              </button>
            )}
            <button
              type="button"
              onClick={load}
              disabled={loading || creating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            {onNavigateDiagnostic && (
              <button
                type="button"
                onClick={onNavigateDiagnostic}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Bài Test Đầu Vào
              </button>
            )}
            {onNavigateDashboard && (
              <button
                type="button"
                onClick={onNavigateDashboard}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Tổng quan
              </button>
            )}
          </div>
        </div>

        {/* Upgrade Banner when existing DB roadmap is still old 24-node format */}
        {isLegacyShortRoadmap && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Phiên bản lộ trình mới: Phủ toàn bộ phổ kiến thức Lớp 10–12 (9 môn GDPT 2018)</span>
              </div>
              <p className="text-xs text-indigo-800">
                Lộ trình hiện tại đang ở phiên bản rút gọn ({allNodes.length} chặng). Bấm nút bên phải để đồng bộ toàn bộ 300+ dạng bài Lớp 10–12 với 3 nhóm rõ ràng: <strong>Cần cải thiện</strong> → <strong>Đạt điểm OK</strong> → <strong>Chưa đánh giá</strong>.
              </p>
            </div>
            <button
              type="button"
              disabled={creating}
              onClick={() => runGenerateRoadmap(submissionId)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{creating ? 'Đang nâng cấp...' : 'Nâng Cấp Lộ Trình Lớp 10–12 Ngay'}</span>
            </button>
          </div>
        )}

        {/* Progress KPI Strip when roadmap exists */}
        {roadmap && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="rounded-2xl bg-rose-50/70 border border-rose-200/80 p-3.5">
              <div className="text-[11px] font-bold text-rose-700 uppercase">1. Ưu Tiên Cải Thiện Ngay</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-rose-700">{zoneCounts.weak} dạng bài</span>
                <span className="text-[11px] font-bold text-rose-600">Đã test &amp; yếu</span>
              </div>
              <div className="text-[11px] text-rose-700/80 mt-0.5">Xếp đầu lộ trình để bù lỗ hổng</div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase">2. Học Tiếp Nối (Chưa Đánh Giá)</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-800">{zoneCounts.unassessed} dạng bài</span>
                <span className="text-[11px] font-bold text-indigo-600">{availableSubjects.length} môn • Lớp 10–12</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Học tuần tự • Tự đánh giá lại khi làm test</div>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">3. Đạt Điểm OK / Hoàn Thành</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-700">{zoneCounts.ok} dạng bài</span>
                <span className="text-xs font-extrabold text-emerald-600">{progressPct}% PLAR</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-emerald-200/70 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${Math.max(progressPct, zoneCounts.ok > 0 ? 4 : 0)}%` }} />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50/60 border border-indigo-200/80 p-3.5">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">Mục Tiêu Điểm ĐGNL</div>
              <div className="mt-1 text-xl font-black text-indigo-700">{roadmap.targetScore} / 1200</div>
              <div className="text-[11px] text-indigo-800/80 mt-0.5">
                Xếp lớp: <strong>{diagnostic?.placementClass || 'ACCELERATION'}</strong>
                {typeof diagnostic?.theta0 === 'number' ? ` (θ₀ = ${diagnostic.theta0.toFixed(2)})` : ''}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
        {loading && <p role="status" className="text-sm text-slate-500">Đang đồng bộ dữ liệu lộ trình &amp; năng lực từ máy chủ...</p>}
      </section>

      {/* 2. NO DIAGNOSTIC YET */}
      {!loading && !roadmap && history.length === 0 && (
        <section className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-8 text-center space-y-4">
          <Target className="w-10 h-10 text-blue-600 mx-auto" />
          <div className="space-y-1 max-w-lg mx-auto">
            <h2 className="text-lg font-black text-slate-900">Hãy hoàn thành Bài Test Đầu Vào 30 Câu trước tiên!</h2>
            <p className="text-sm text-slate-600">
              Hệ thống cần kết quả chẩn đoán năng lực trên 4 Miền / 9 Môn GDPT 2018 để đo IRT θ₀, phân loại các kỹ năng yếu đầu tiên và mở bản đồ toàn diện Lớp 10–12 cho bạn.
            </p>
          </div>
          {onNavigateDiagnostic && (
            <button
              type="button"
              onClick={onNavigateDiagnostic}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt Đầu Bài Test Đầu Vào 30 Câu</span>
            </button>
          )}
        </section>
      )}

      {/* 3. GENERATE / REGENERATE ROADMAP FORM */}
      {!loading && history.length > 0 && (!roadmap || showRegenerateForm) && (
        <form onSubmit={generate} className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-black text-base text-indigo-950">
                {roadmap ? 'Sinh Lại Lộ Trình Toàn Diện Lớp 10–12' : 'Khởi Tạo Lộ Trình Cá Nhân Hóa Toàn Diện Lớp 10–12'}
              </h2>
              <p className="text-xs text-indigo-700">
                Tự động ưu tiên các dạng bài yếu nhất từ bài Test 30 câu lên đầu, xếp dạng đã đạt điểm OK ở sau và giữ trọn bộ phổ kiến thức Lớp 10–12 chưa đánh giá ở cuối.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block text-xs font-bold text-slate-700">
              Chọn bài kiểm tra đầu vào
              <select
                required
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                {history.map((item) => (
                  <option key={item.submissionId} value={item.submissionId}>
                    {new Date(item.completedAt).toLocaleString('vi-VN')} · {item.totalCorrect}/{item.totalQuestions} câu (θ₀={Number(item.theta0 ?? 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Ngày thi ĐGNL dự kiến
              <input
                required
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Số giờ tự học mỗi ngày
              <input
                required
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 text-sm font-extrabold text-white shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{creating ? 'Đang chạy thuật toán sinh lộ trình...' : 'Khởi Tạo Lộ Trình Toàn Diện Ngay'}</span>
            </button>
            {showRegenerateForm && (
              <button
                type="button"
                onClick={() => setShowRegenerateForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      )}

      {/* 4. REAL 9-SUBJECT COMPETENCY BREAKDOWN FROM DIAGNOSTIC */}
      {diagnostic && Array.isArray(diagnostic.subjectBreakdowns) && diagnostic.subjectBreakdowns.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-black text-slate-900">
                Kết Quả Test Đầu Vào Theo 9 Môn Học (Bấm vào môn để lọc nhanh lộ trình bên dưới)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {diagnostic.totalCorrect}/{diagnostic.totalQuestions} câu đúng ({diagnostic.accuracyPercentage}%)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {diagnostic.subjectBreakdowns.map((subj) => {
              const pct = Math.round(subj.accuracyPercentage ?? 0);
              const badgeCls = pct < 50 ? 'border-rose-200 bg-rose-50/70 text-rose-700' : pct < 75 ? 'border-amber-200 bg-amber-50/70 text-amber-800' : 'border-emerald-200 bg-emerald-50/70 text-emerald-700';
              return (
                <button
                  key={subj.subjectName}
                  type="button"
                  onClick={() => setSelectedSubjectFilter((prev) => prev === subj.subjectName ? 'ALL' : subj.subjectName)}
                  className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${badgeCls} ${
                    selectedSubjectFilter === subj.subjectName ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">{subj.subjectName}</span>
                    <span className="text-xs font-black">{pct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Đúng {subj.correctCount}/{subj.totalQuestions} • {subj.isWeak ? 'Cần ưu tiên' : 'Tốt'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. SPLIT WORKSPACE: LEFT 3-ZONE GRADE 10-12 ROADMAP + RIGHT 4-PHASE PLAR STUDIO */}
      {roadmap && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column (5/12): Full-Spectrum 3-Zone Personalized Roadmap */}
          <div className="xl:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-black text-base text-slate-900">
                  Bản Đồ Kiến Thức Lớp 10–12 ({filteredNodes.length}/{allNodes.length})
                </h2>
              </div>

              {/* 3-Zone Assessment Status Tabs (ordered along sequential learning flow) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoneFilter('ALL')}
                  className={`rounded-xl px-2.5 py-2 text-[11px] font-extrabold transition-colors cursor-pointer border ${
                    zoneFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({allNodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('WEAK')}
                  className={`rounded-xl px-2.5 py-2 text-[11px] font-extrabold transition-colors cursor-pointer border ${
                    zoneFilter === 'WEAK'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  1. Cần cải thiện ({zoneCounts.weak})
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('UNASSESSED')}
                  className={`rounded-xl px-2.5 py-2 text-[11px] font-extrabold transition-colors cursor-pointer border ${
                    zoneFilter === 'UNASSESSED'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  2. Chưa đánh giá ({zoneCounts.unassessed})
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('MASTERED')}
                  className={`rounded-xl px-2.5 py-2 text-[11px] font-extrabold transition-colors cursor-pointer border ${
                    zoneFilter === 'MASTERED'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  3. Đạt OK ({zoneCounts.ok})
                </button>
              </div>

              {/* Search + Grade Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm chương, bài học, dạng bài..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {availableGrades.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedGradeFilter(0)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
                        selectedGradeFilter === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      10–12
                    </button>
                    {availableGrades.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGradeFilter((prev) => prev === g ? 0 : g)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
                          selectedGradeFilter === g ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Lớp {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter('ALL')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedSubjectFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả môn ({allNodes.length})
                </button>
                {availableSubjects.map((subj) => (
                  <button
                    key={subj.name}
                    type="button"
                    onClick={() => setSelectedSubjectFilter(subj.name)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedSubjectFilter === subj.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {subj.name} ({subj.count})
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Zone Grouped Scrollable List */}
            <div className="space-y-4 max-h-[760px] overflow-y-auto pr-1">
              {filteredNodes.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  Không có dạng bài nào khớp với bộ lọc hiện tại. Hãy chọn "Tất cả" hoặc xóa từ khóa tìm kiếm.
                </div>
              )}

              {/* ZONE 1: WEAK — PRIORITY IMPROVEMENT FIRST */}
              {groupedFiltered.weak.length > 0 && (
                <div className="space-y-2">
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-900">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>1. Ưu Tiên Cải Thiện Ngay ({groupedFiltered.weak.length})</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700">Đã kiểm tra • Cần bù lỗ hổng</span>
                  </div>
                  <div className="space-y-2">
                    {groupedFiltered.weak.map((node) => (
                      <RoadmapNodeCard
                        key={node.nodeId}
                        node={node}
                        isSelected={selectedNode?.nodeId === node.nodeId}
                        onSelect={setSelectedNodeId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ZONE 2: UNASSESSED — SEQUENTIAL LEARNING PATH FROM START TO FINISH (GRADE 10 -> 11 -> 12) */}
              {groupedFiltered.unassessed.length > 0 && (
                <div className="space-y-2">
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-xl bg-indigo-50/90 border border-indigo-200 px-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>2. Lộ Trình Học Tiếp Nối — Chưa Đánh Giá ({groupedFiltered.unassessed.length})</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700">Lớp 10→12 • Tự đánh giá lại khi test OK</span>
                  </div>
                  <div className="space-y-2">
                    {groupedFiltered.unassessed.slice(0, unassessedVisibleCount).map((node) => (
                      <RoadmapNodeCard
                        key={node.nodeId}
                        node={node}
                        isSelected={selectedNode?.nodeId === node.nodeId}
                        onSelect={setSelectedNodeId}
                      />
                    ))}
                  </div>
                  {groupedFiltered.unassessed.length > unassessedVisibleCount && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setUnassessedVisibleCount((c) => c + 40)}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Xem thêm 40 chặng ({groupedFiltered.unassessed.length - unassessedVisibleCount} còn lại)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnassessedVisibleCount(groupedFiltered.unassessed.length)}
                        className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 cursor-pointer"
                      >
                        Hiện toàn bộ lộ trình
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ZONE 3: MASTERED / COMPLETED — SHOWN AT THE END */}
              {groupedFiltered.ok.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowMasteredSection((v) => !v)}
                    className="sticky top-0 z-10 w-full flex items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>3. Đã Đánh Giá Đạt Điểm OK / Hoàn Thành ({groupedFiltered.ok.length})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0">
                      <span>Hiển thị sau</span>
                      {showMasteredSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {showMasteredSection && (
                    <div className="space-y-2">
                      {groupedFiltered.ok.map((node) => (
                        <RoadmapNodeCard
                          key={node.nodeId}
                          node={node}
                          isSelected={selectedNode?.nodeId === node.nodeId}
                          onSelect={setSelectedNodeId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7/12): Full 4-Phase PLAR Node Learning Studio */}
          <div className="xl:col-span-7">
            {selectedNode ? (
              <PlarNodeStudioPanel
                node={selectedNode}
                studentId={studentId}
                isPaid={isPaid}
                onNavigateTuition={onNavigateTuition}
                onOpenAiTutorWithContext={onOpenAiTutorWithContext}
                onNodeCompleted={() => load({ silent: true })}
                onNodeEvaluated={() => load({ silent: true })}
                onSelectNextNode={(nextId) => {
                  setSelectedNodeId(nextId);
                  load({ silent: true });
                }}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Chọn một chặng học bên trái để bắt đầu chu trình P-L-A-R.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
