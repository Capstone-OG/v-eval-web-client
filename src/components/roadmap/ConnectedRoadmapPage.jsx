import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
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
import { contentService } from '../../services/contentService';
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
  const fsm = node._fsmStatus || 'LOCKED';
  const isCompleted = fsm === 'COMPLETED';
  const isInProgress = fsm === 'IN_PROGRESS';
  const isLocked = fsm === 'LOCKED';
  const isUnassessed = node._assessmentStatus === 'UNASSESSED';
  const plarInfo = PLAR_BADGE_MAP[node.currentPlarStep] || null;
  const mastery = Math.round(Number(node.masteryPlt || 0) * 100);

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => !isLocked && onSelect(node.nodeId)}
      title={
        isLocked
          ? 'Chặng đã khóa — Hoàn thành đủ 4 bước P-L-A-R của chặng đang học để mở khóa chặng tiếp theo'
          : isInProgress
            ? 'Vào học 4 bước P-L-A-R cho chặng này'
            : 'Xem lại chặng đã hoàn thành'
      }
      className={`group w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors border-t border-slate-100 first:border-t-0 ${
        isLocked
          ? 'bg-slate-50/70 opacity-65 cursor-not-allowed'
          : isInProgress
            ? 'bg-blue-50/70 hover:bg-blue-50 cursor-pointer ring-1 ring-inset ring-blue-200'
            : isSelected
              ? 'bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer'
              : 'bg-white hover:bg-slate-50 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
            isCompleted
              ? 'bg-emerald-600 text-white'
              : isInProgress
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-500'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold truncate ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
              Chặng #{node.stepOrder}: {cleanDisplaySkillName(node.skillName)}
            </span>
            {isInProgress && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shrink-0">
                Đang học
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
                Hoàn thành
              </span>
            )}
            {isLocked && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold shrink-0">
                Đã khóa
              </span>
            )}
          </div>
          {node.lessonName && (
            <div className="text-xs text-slate-500 truncate mt-0.5">
              {node.lessonName}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {plarInfo && isInProgress && (
          <span className={`hidden sm:inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${plarInfo.cls}`}>
            Pha: {plarInfo.label}
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
        {isLocked ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-500">
            <Lock className="w-3 h-3" />
            <span>Khóa</span>
          </span>
        ) : isInProgress ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 group-hover:bg-blue-700 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition-colors">
            <span>Học chặng này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 transition-colors">
            <span>Xem lại</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </button>
  );
}

export default function ConnectedRoadmapPage({
  viewMode = 'map', // 'map' (Core Flow 2: Lộ trình cá nhân hóa) | 'study' (Core Flow 3: Luyện tập P-L-A-R)
  initialNodeId = null,
  onOpenPlarNode,
  onBackToRoadmap,
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

  const [workspaceMode, setWorkspaceMode] = useState(viewMode);
  const [zoneFilter, setZoneFilter] = useState('ALL'); // ALL | COMPLETED | WEAK | UNASSESSED | MASTERED
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [visibleChapterCount, setVisibleChapterCount] = useState(10);

  useEffect(() => {
    setWorkspaceMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (initialNodeId) {
      setSelectedNodeId(initialNodeId);
    }
  }, [initialNodeId]);

  const creatingRef = useRef(false);
  const user = tokenStorage.getUser();
  const studentId = user?.userId || user?.id || user?.studentId;

  const handleOpenNodeStudio = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
    if (onOpenPlarNode) {
      onOpenPlarNode(nodeId);
    } else {
      setWorkspaceMode('study');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onOpenPlarNode]);

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

      let current = roadmapRes ? validateRoadmap(roadmapRes, studentId) : null;

      const enrichRoadmapNodes = async (targetRoadmap) => {
        if (
          !targetRoadmap?.nodes?.some(
            (n) => !n.skillName || n.skillName === 'Kỹ năng chuyên đề' || !n.chapterName || n.chapterName === 'Chuyên đề tổng hợp'
          )
        ) {
          return targetRoadmap;
        }
        try {
          const curriculumRes = await contentService.getCurriculum();
          const domains = Array.isArray(curriculumRes) ? curriculumRes : (curriculumRes?.domains || curriculumRes?.data || []);
          const skillLookup = new Map();
          domains.forEach((dom) => {
            const domName = dom.title || dom.name || '';
            (dom.chapters || []).forEach((ch) => {
              const chName = ch.name || '';
              const chGrade = inferGradeFromText(chName, '', domName);
              const subjMatch = chName.match(/\(([^–\-()]+)/);
              const inferredSubject = subjMatch ? subjMatch[1].trim() : domName;
              (ch.lessons || []).forEach((les) => {
                (les.patterns || []).forEach((pat) => {
                  const sid = String(pat.patternId || pat.skillId || pat.id || '').toLowerCase();
                  if (!sid) return;
                  skillLookup.set(sid, {
                    skillName: pat.name || '',
                    lessonName: les.name || '',
                    chapterName: chName,
                    subjectName: inferredSubject || domName,
                    domainName: domName,
                    gradeLevel: Number(pat.gradeLevel || chGrade || 0)
                  });
                });
              });
            });
            // Bổ sung cả danh sách dom.skills[] phòng trường hợp skillId không nằm trong chapters[].lessons[].patterns[]
            (dom.skills || []).forEach((sk) => {
              const sid = String(sk.skillId || sk.patternId || sk.id || '').toLowerCase();
              if (!sid || skillLookup.has(sid)) return;
              const chName = sk.chapterName || '';
              const lesName = sk.lessonName || '';
              const skGrade = Number(sk.gradeLevel || inferGradeFromText(chName, lesName, sk.name || domName) || 0);
              const subjMatch = chName.match(/\(([^–\-()]+)/);
              const inferredSubject = sk.subjectName || (subjMatch ? subjMatch[1].trim() : domName);
              skillLookup.set(sid, {
                skillName: sk.name || '',
                lessonName: lesName,
                chapterName: chName || domName || 'Chuyên đề tổng hợp',
                subjectName: inferredSubject || domName,
                domainName: domName,
                gradeLevel: skGrade
              });
            });
          });

          if (skillLookup.size > 0) {
            return {
              ...targetRoadmap,
              nodes: targetRoadmap.nodes.map((n) => {
                const meta = skillLookup.get(String(n.skillId || '').toLowerCase());
                if (!meta) return n;
                const needsSkill = !n.skillName || n.skillName === 'Kỹ năng chuyên đề';
                const needsChapter = !n.chapterName || n.chapterName === 'Chuyên đề tổng hợp';
                const needsSubject = !n.subjectName || n.subjectName === 'Lĩnh vực chung' || n.subjectName === 'Chuyên đề chung';
                return {
                  ...n,
                  skillName: needsSkill && meta.skillName ? meta.skillName : n.skillName,
                  lessonName: (!n.lessonName && meta.lessonName) ? meta.lessonName : n.lessonName,
                  chapterName: needsChapter && meta.chapterName ? meta.chapterName : n.chapterName,
                  subjectName: needsSubject && meta.subjectName ? meta.subjectName : n.subjectName,
                  domainName: (!n.domainName || n.domainName === 'Lĩnh vực chung') && meta.domainName ? meta.domainName : n.domainName,
                  gradeLevel: Number(n.gradeLevel || 0) || meta.gradeLevel
                };
              })
            };
          }
        } catch {
          // non-fatal fallback
        }
        return targetRoadmap;
      };

      // Tự động bù đắp tên dạng bài / chương / môn thật từ Content Curriculum nếu gRPC trả về nhãn mặc định "Kỹ năng chuyên đề"
      current = await enrichRoadmapNodes(current);

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
        const sortedNodes = [...current.nodes].sort((a, b) => a.stepOrder - b.stepOrder);
        setSelectedNodeId((prev) => {
          if (prev && sortedNodes.some((n) => n.nodeId === prev)) return prev;
          const firstActive = sortedNodes.find(
            (n) => n.status !== 'COMPLETED' && resolveAssessmentStatus(n) !== 'COMPLETED' && n.status !== 'SKIPPED_PRUNED'
          );
          return firstActive?.nodeId || sortedNodes[0].nodeId;
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
    const sorted = (roadmap?.nodes || [])
      .map((n) => ({
        ...n,
        _assessmentStatus: resolveAssessmentStatus(n),
        _gradeLevel: Number(n.gradeLevel || 0) || inferGradeFromText(n.chapterName, n.lessonName, n.skillName),
        _chapterNum: extractNumber(n.chapterName, 'Chương'),
        _lessonNum: extractNumber(n.lessonName, 'Bài')
      }))
      .sort((a, b) => a.stepOrder - b.stepOrder);

    // Áp dụng chặt cơ chế mở khóa tuần tự theo đúng thứ tự Chặng #1 -> #2 -> #3... (FSM):
    // - COMPLETED: đã hoàn thành (được mở để Xem lại)
    // - IN_PROGRESS: chặng đang học dở P-L-A-R (LEARN/APPLY/REFLECT/REMEDIAL) hoặc chặng chưa hoàn thành ĐẦU TIÊN theo stepOrder
    // - LOCKED: toàn bộ các chặng sau đều bị khóa cho tới khi hoàn thành đủ 4 bước P-L-A-R chặng hiện tại
    // Non-blocking approval: Học sinh luôn có thể học ngay chặng đầu tiên trừ khi lộ trình đã bị lưu trữ (ARCHIVED)
    const isRoadmapApproved = String(roadmap?.status || 'ACTIVE').toUpperCase() !== 'ARCHIVED';
    const ACTIVE_PLAR_STEPS = new Set(['LEARN', 'APPLY', 'REFLECT', 'REMEDIAL']);
    const firstActiveNode = isRoadmapApproved
      ? sorted.find(
          (n) => !n.isPruned && n.status !== 'COMPLETED' && n._assessmentStatus !== 'COMPLETED' && n.status !== 'SKIPPED_PRUNED'
        )
      : null;

    return sorted
      .filter((n) => !n.isPruned && n.status !== 'SKIPPED_PRUNED')
      .map((n) => {
        if (!isRoadmapApproved) {
          return { ...n, _fsmStatus: 'LOCKED' };
        }
        const isDone =
          n.status === 'COMPLETED' ||
          n._assessmentStatus === 'COMPLETED' ||
          n._assessmentStatus === 'MASTERED';
        const hasOngoingPlar = !isDone && ACTIVE_PLAR_STEPS.has(String(n.currentPlarStep || '').toUpperCase());
        const isCurrent = (firstActiveNode && n.nodeId === firstActiveNode.nodeId) || hasOngoingPlar;
        return {
          ...n,
          _fsmStatus: isDone ? 'COMPLETED' : isCurrent ? 'IN_PROGRESS' : 'LOCKED'
        };
      });
  }, [roadmap]);

  const activeFsmNode = useMemo(
    () => allNodes.find((n) => n._fsmStatus === 'IN_PROGRESS') || allNodes.find((n) => n._fsmStatus === 'COMPLETED') || allNodes[0] || null,
    [allNodes]
  );

  const zoneCounts = useMemo(() => {
    let weak = 0;
    let ok = 0;
    let unassessed = 0;
    let completed = 0;
    allNodes.forEach((n) => {
      if (n._fsmStatus === 'COMPLETED') completed++;
      if (n._assessmentStatus === 'WEAK') weak++;
      else if (n._assessmentStatus === 'MASTERED' || n._assessmentStatus === 'COMPLETED') ok++;
      else unassessed++;
    });
    return { all: allNodes.length, completed, weak, ok, unassessed };
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
      if (zoneFilter === 'COMPLETED' && n._fsmStatus !== 'COMPLETED') return false;
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
      {/* TOP HEADER BAR — PHÂN TÁCH RÕ CORE FLOW 2 (LỘ TRÌNH) & CORE FLOW 3 (LUYỆN TẬP P-L-A-R) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {workspaceMode === 'map' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" />
                </span>
                <div>
                  <h1 className="text-sm font-black text-slate-900">Lộ Trình Cá Nhân Hóa</h1>
                </div>
              </div>
              {activeFsmNode && String(roadmap?.status || 'ACTIVE').toUpperCase() !== 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => handleOpenNodeStudio(activeFsmNode.nodeId)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Học ngay Chặng #{activeFsmNode.stepOrder}</span>
                </button>
              )}
              {roadmap && (
                roadmap.isTeacherApproved ? (
                  <Chip
                    label="Đã được Giáo viên xác nhận"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    label="Đang chờ Giáo viên xác nhận"
                    color="warning"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => (onBackToRoadmap ? onBackToRoadmap() : setWorkspaceMode('map'))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>← Lộ trình cá nhân hóa</span>
              </button>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {selectedNode ? `Luyện tập P-L-A-R • Chặng #${selectedNode.stepOrder}` : 'Luyện tập Thích ứng (P-L-A-R)'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {roadmap && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600">
              <span>Tiến độ: <strong className="text-emerald-600">{Math.round((zoneCounts.ok / Math.max(1, allNodes.length)) * 100)}%</strong> ({zoneCounts.ok}/{allNodes.length})</span>
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
          <button
            type="button"
            onClick={load}
            disabled={loading}
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

      {/* APPROVAL WORKFLOW TRACKER BANNER (Học sinh không tự tạo lộ trình: Hệ thống tạo nháp -> Giảng viên duyệt -> Giám đốc phê duyệt) */}
      {!loading && workspaceMode !== 'curriculum' && roadmap && String(roadmap.status || '').toUpperCase() !== 'ACTIVE' && (
        <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-blue-50/50 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-0.5 text-[11px] font-black uppercase text-amber-800">
                <Sparkles className="w-3 h-3" />
                {roadmap.status === 'PENDING_DIRECTOR_APPROVAL'
                  ? 'Bước 3/3 • Đang chờ Ban Giám đốc phê duyệt cuối cùng'
                  : 'Bước 2/3 • Bản nháp đang chờ Giảng viên rà soát & tinh chỉnh'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Lộ trình cá nhân hóa của bạn đang trong quy trình kiểm duyệt học thuật
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Sau bài kiểm tra đầu vào 30 câu, hệ thống đã tự động sinh bản nháp lộ trình dựa trên năng lực của bạn. Giảng viên sẽ rà soát, thêm/bớt chặng phù hợp và trình Ban Giám đốc phê duyệt trước khi mở khóa học P-L-A-R.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-black text-emerald-900">1. Thi đầu vào 30 câu</div>
                <div className="text-[11px] text-emerald-700">Đã sinh bản nháp tự động</div>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
              roadmap.status === 'PENDING_DIRECTOR_APPROVAL'
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-amber-300 bg-amber-50 ring-1 ring-amber-200'
            }`}>
              {roadmap.status === 'PENDING_DIRECTOR_APPROVAL' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-black text-slate-900">2. Giảng viên tinh chỉnh</div>
                <div className="text-[11px] text-slate-600">
                  {roadmap.status === 'PENDING_DIRECTOR_APPROVAL' ? 'Đã duyệt & gửi lên Giám đốc' : 'Đang rà soát & điều chỉnh chặng'}
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
              roadmap.status === 'PENDING_DIRECTOR_APPROVAL'
                ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                : 'border-slate-200 bg-slate-50/80 opacity-75'
            }`}>
              <Lock className={`w-4 h-4 shrink-0 ${roadmap.status === 'PENDING_DIRECTOR_APPROVAL' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-black text-slate-900">3. Giám đốc phê duyệt</div>
                <div className="text-[11px] text-slate-600">
                  {roadmap.status === 'PENDING_DIRECTOR_APPROVAL' ? 'Đang chờ duyệt kích hoạt ACTIVE' : 'Chờ bước 2 hoàn tất'}
                </div>
              </div>
            </div>
          </div>

          {roadmap.prunedReason && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700">
              <strong className="text-slate-900">Ghi chú chuyên môn: </strong>
              {roadmap.prunedReason}
            </div>
          )}
        </section>
      )}

      {/* COMPLETED DIAGNOSTIC BUT DRAFT NOT YET GENERATED */}
      {!loading && workspaceMode !== 'curriculum' && !roadmap && history.length > 0 && (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Bài thi đầu vào 30 câu của bạn đã được ghi nhận
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Hệ thống sẽ khởi tạo bản nháp lộ trình cá nhân hóa gửi Giảng viên rà soát và Ban Giám đốc phê duyệt. Học sinh không cần tự tạo lộ trình — bạn chỉ cần bấm làm mới sau ít phút hoặc liên hệ Giảng viên phụ trách.
          </p>
        </section>
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

      {/* CORE FLOW 3: FULL-WIDTH DEDICATED P-L-A-R PRACTICE STUDIO */}
      {workspaceMode === 'study' && !loading && roadmap && (selectedNode || activeFsmNode) && (() => {
        const currentStudyNode = selectedNode || activeFsmNode;
        const currentIdx = allNodes.findIndex((n) => n.nodeId === currentStudyNode.nodeId);
        const nextSequentialNode =
          (currentIdx >= 0
            ? allNodes.slice(currentIdx + 1).find((n) => n.status !== 'SKIPPED_PRUNED')
            : null)
          || allNodes.find((n) => n.nodeId !== currentStudyNode.nodeId && n._fsmStatus === 'IN_PROGRESS')
          || null;
        return (
          <PlarNodeStudioPanel
            node={currentStudyNode}
            nextNode={nextSequentialNode}
            studentId={studentId}
            isPaid={isPaid}
            onBackToMap={() => (onBackToRoadmap ? onBackToRoadmap() : setWorkspaceMode('map'))}
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
        );
      })()}

      {/* BANNER ĐỊNH HƯỚNG LỘ TRÌNH TỪ GIÁO VIÊN (CHỈ HIỆN KHI ĐÃ CÓ ĐỊNH HƯỚNG / XÁC NHẬN) */}
      {workspaceMode === 'map' && !loading && roadmap && (roadmap.teacherKickoffNote || roadmap.isTeacherApproved) && (
        <Paper
          variant="outlined"
          sx={{
            px: 2.25,
            py: 1.5,
            borderRadius: 3,
            borderColor: 'success.light',
            bgcolor: 'rgba(16,185,129,0.05)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, whiteSpace: 'pre-line' }}>
                {roadmap.teacherKickoffNote ? (
                  <><strong>Định hướng từ Giáo viên phụ trách:</strong> {roadmap.teacherKickoffNote}</>
                ) : (
                  'Giáo viên phụ trách đã rà soát và xác nhận lộ trình học tập cá nhân hóa này cho bạn.'
                )}
              </Typography>
            </Box>
            {roadmap.approvedAt && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, flexShrink: 0 }}>
                Xác nhận: {new Date(roadmap.approvedAt).toLocaleString('vi-VN')}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}
      {workspaceMode === 'map' && !loading && roadmap && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Single Compact Filter Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            {/* Unified Segmented Status Tabs */}
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/70">
              {[
                { key: 'WEAK', label: 'Ưu tiên', count: zoneCounts.weak, activeCls: 'bg-white text-rose-700 shadow-xs ring-1 ring-rose-200/80', badgeCls: 'bg-rose-50 text-rose-700' },
                { key: 'UNASSESSED', label: 'Chưa đánh giá', count: zoneCounts.unassessed, activeCls: 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300/80', badgeCls: 'bg-slate-200/80 text-slate-700' },
                { key: 'MASTERED', label: 'Đã nắm vững', count: zoneCounts.ok, activeCls: 'bg-white text-teal-700 shadow-xs ring-1 ring-teal-200/80', badgeCls: 'bg-teal-50 text-teal-700' },
                { key: 'COMPLETED', label: 'Đã hoàn thành', count: zoneCounts.completed, activeCls: 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-200/80', badgeCls: 'bg-emerald-50 text-emerald-700' },
                { key: 'ALL', label: 'Tất cả', count: zoneCounts.all, activeCls: 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-200/80', badgeCls: 'bg-blue-50 text-blue-700' },
              ].map((tab) => {
                const isActive = zoneFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setZoneFilter(tab.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                      isActive
                        ? tab.activeCls
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${
                        isActive ? tab.badgeCls : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Subject, Grade & Search */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                aria-label="Lọc theo môn học"
                className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
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
                  className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value={0}>Lớp 10–12</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              )}

              <div className="relative min-w-[170px] flex-1 sm:w-48 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh bài học..."
                  className="h-8.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ×
                  </button>
                )}
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
