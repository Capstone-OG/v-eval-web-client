import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Star,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import contentService from '../../services/contentService';
import MathText from '../common/MathText';

const PLAR_STEPS = [
  { key: 'PREVIEW', code: 'P', label: 'Preview', subtitle: 'Khởi động 3 câu' },
  { key: 'LEARN', code: 'L', label: 'Learn', subtitle: 'Lý thuyết SGK ≥80%' },
  { key: 'APPLY', code: 'A', label: 'Apply', subtitle: 'Luyện tập ZPD + BKT' },
  { key: 'REFLECT', code: 'R', label: 'Reflect', subtitle: 'Phản tư & Mở khóa' }
];

const BLOOM_LABELS = {
  1: 'L1 • Nhận biết',
  2: 'L2 • Thông hiểu',
  3: 'L3 • Vận dụng',
  4: 'L4 • Vận dụng cao',
  5: 'L5 • Phân tích',
  6: 'L6 • Sáng tạo'
};

const REFLECT_TAGS = [
  'Đã nắm chắc bản chất công thức',
  'Cần chú ý điều kiện xác định & dấu',
  'Cần cải thiện tốc độ tính toán',
  'Hay bị đánh lừa bởi phương án nhiễu'
];

const ASSESSMENT_BADGES = {
  WEAK: { label: 'Ưu tiên cải thiện', cls: 'bg-rose-500/25 text-rose-100 border-rose-400/40' },
  MASTERED: { label: 'Đã đạt chuẩn OK', cls: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/40' },
  COMPLETED: { label: 'Đã hoàn thành PLAR', cls: 'bg-emerald-500/30 text-emerald-100 border-emerald-300/50' },
  UNASSESSED: { label: 'Chưa đánh giá', cls: 'bg-white/15 text-slate-200 border-white/25' }
};

function PassageContextBox({ title, content, imageUrl }) {
  if (!content && !imageUrl) return null;
  return (
    <div className="rounded-2xl border border-indigo-200/90 bg-indigo-50/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100/70 border-b border-indigo-200/80 text-xs font-extrabold text-indigo-950">
        <BookOpen className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
        <span>{title ? `Ngữ cảnh / Đoạn văn: ${title}` : 'Đoạn văn ngữ cảnh (Đọc kỹ trước khi trả lời)'}</span>
      </div>
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title || 'Hình minh họa ngữ cảnh câu hỏi'}
            className="max-h-56 rounded-xl border border-slate-200 object-contain bg-white p-1"
          />
        )}
        {content && <MathText text={content} />}
      </div>
    </div>
  );
}

const getVideoEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.endsWith('youtube.com')) {
      const videoId = url.searchParams.get('v') || url.pathname.split('/embed/')[1];
      return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : null;
    }
    return null;
  } catch {
    return null;
  }
};

export default function PlarNodeStudioPanel({
  node,
  studentId,
  isPaid,
  onNavigateTuition,
  onOpenAiTutorWithContext,
  onNodeCompleted,
  onNodeEvaluated,
  onSelectNextNode
}) {
  const [detail, setDetail] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tuitionBlocked, setTuitionBlocked] = useState(false);

  // Phase P (Preview) state
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewResult, setPreviewResult] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const previewStartTimeRef = useRef(0);

  // Phase L (Learn) state
  const [learnProgressPct, setLearnProgressPct] = useState(0);
  const [learnSeconds, setLearnSeconds] = useState(0);
  const [learnBusy, setLearnBusy] = useState(false);
  const [learnMessage, setLearnMessage] = useState('');
  const [checkedMaterialIds, setCheckedMaterialIds] = useState({});
  const lastVideoReportRef = useRef(0);

  // Phase A (Apply - ZPD + BKT) state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyFinishedMsg, setApplyFinishedMsg] = useState('');
  const questionStartRef = useRef(0);

  // BR-03 Remedial state
  const [remedialPkg, setRemedialPkg] = useState(null);
  const [remedialAnswers, setRemedialAnswers] = useState({});
  const [remedialResult, setRemedialResult] = useState(null);
  const [remedialBusy, setRemedialBusy] = useState(false);

  // Phase R (Reflect) state
  const [confidenceRating, setConfidenceRating] = useState(4);
  const [learnedSummary, setLearnedSummary] = useState('');
  const [mistakeNotes, setMistakeNotes] = useState('');
  const [reflectBusy, setReflectBusy] = useState(false);
  const [reflectResult, setReflectResult] = useState(null);

  const requestSeqRef = useRef(0);

  const loadRemedialPackage = useCallback(async (stageProgressId) => {
    setRemedialBusy(true);
    setRemedialResult(null);
    setRemedialAnswers({});
    try {
      const pkg = await practiceService.getStageRemedial(stageProgressId);
      setRemedialPkg(pkg);
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể tải gói cứu trợ phụ đạo BR-03.');
    } finally {
      setRemedialBusy(false);
    }
  }, []);

  const loadNextAdaptiveQuestion = useCallback(async (stageProgressId) => {
    setApplyBusy(true);
    setAnswerFeedback(null);
    setSelectedOption('');
    setApplyFinishedMsg('');
    try {
      const next = await practiceService.getNextStageQuestion(stageProgressId);
      setStage((prev) => prev ? {
        ...prev,
        currentStep: next.currentStep || prev.currentStep,
        status: next.status || prev.status,
        bktMasteryPlt: typeof next.bktMasteryPlt === 'number' ? next.bktMasteryPlt : prev.bktMasteryPlt
      } : prev);

      if (next.status === 'REMEDIAL_REQUIRED') {
        setCurrentQuestion(null);
        await loadRemedialPackage(stageProgressId);
        return;
      }

      if (next.isFinished || !next.questionId) {
        setCurrentQuestion(null);
        setApplyFinishedMsg(next.message || 'Bạn đã hoàn thành các câu hỏi thích ứng của chặng này.');
      } else {
        setCurrentQuestion(next);
        questionStartRef.current = Date.now();
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không tải được câu hỏi thích ứng tiếp theo.');
    } finally {
      setApplyBusy(false);
    }
  }, [loadRemedialPackage]);

  // Boot node details + materials + PLAR StageProgress
  useEffect(() => {
    if (!node?.nodeId || !studentId) return;
    const reqId = ++requestSeqRef.current;

    setLoading(true);
    setError('');
    setTuitionBlocked(false);
    setDetail(null);
    setMaterials([]);
    setStage(null);
    setPreviewAnswers({});
    setPreviewResult(null);
    setLearnMessage('');
    setCheckedMaterialIds({});
    setCurrentQuestion(null);
    setAnswerFeedback(null);
    setApplyFinishedMsg('');
    setRemedialPkg(null);
    setRemedialResult(null);
    setReflectResult(null);
    setLearnedSummary('');
    setMistakeNotes('');
    setConfidenceRating(4);
    setLearnSeconds(0);

    (async () => {
      try {
        const [detailRes, matRes] = await Promise.all([
          practiceService.getRoadmapNodeDetail(node.nodeId, studentId),
          contentService.getMaterialsBySkill(node.skillId).catch(() => null)
        ]);
        if (reqId !== requestSeqRef.current) return;

        setDetail(detailRes);
        const matList = matRes?.materials || matRes?.data?.materials || (Array.isArray(matRes) ? matRes : []);
        setMaterials(matList);

        if (node.status === 'SKIPPED_PRUNED') {
          setLoading(false);
          return;
        }

        if (!isPaid) {
          setTuitionBlocked(true);
          setLoading(false);
          return;
        }

        const started = await practiceService.startRoadmapStage(node.nodeId, studentId);
        if (reqId !== requestSeqRef.current) return;

        setStage(started);
        setLearnProgressPct(Number(started.videoWatchPercentage || 0));
        if (started.confidenceRating) setConfidenceRating(started.confidenceRating);
        if (started.learnedSummary) setLearnedSummary(started.learnedSummary);
        if (started.mistakeNotes) setMistakeNotes(started.mistakeNotes);
        previewStartTimeRef.current = Date.now();

        if (started.status === 'REMEDIAL_REQUIRED') {
          await loadRemedialPackage(started.stageProgressId);
        } else if (started.currentStep === 'APPLY' && started.status !== 'COMPLETED') {
          await loadNextAdaptiveQuestion(started.stageProgressId);
        }
      } catch (err) {
        if (reqId !== requestSeqRef.current) return;
        const errCode = err?.data?.errorCode || err?.data?.title || '';
        const errMsg = err?.data?.detail || err?.data?.message || err?.message || 'Không thể khởi tạo chặng học P-L-A-R.';
        if (err?.status === 403 || String(errCode).includes('Tuition.Required') || String(errMsg).toLowerCase().includes('học phí')) {
          setTuitionBlocked(true);
        } else {
          setError(errMsg);
        }
      } finally {
        if (reqId === requestSeqRef.current) setLoading(false);
      }
    })();
  }, [node?.nodeId, node?.skillId, node?.status, studentId, isPaid, loadNextAdaptiveQuestion, loadRemedialPackage]);

  // Real study reading timer during Phase L (LEARN)
  useEffect(() => {
    if (stage?.currentStep !== 'LEARN' || stage?.status === 'COMPLETED') return undefined;
    const timer = setInterval(() => {
      setLearnSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage?.currentStep, stage?.status]);

  // Phase P: Submit Preview 3 questions
  const handleSubmitPreview = async () => {
    if (!stage || previewBusy) return;
    setPreviewBusy(true);
    setError('');
    try {
      const totalElapsed = Math.max(3, Math.round((Date.now() - previewStartTimeRef.current) / 1000));
      const previewQs = stage.previewQuestions || [];
      const perQSec = Math.max(1, Math.round(totalElapsed / Math.max(1, previewQs.length)));
      const answers = previewQs.map((q) => ({
        questionId: q.questionId,
        selectedOption: previewAnswers[q.questionId] || '',
        timeSpentSeconds: perQSec
      }));

      const res = await practiceService.submitRoadmapPreview(stage.stageProgressId, answers);
      setPreviewResult(res);
      const totalQ = Number(res.totalQuestions || previewQs.length || 0);
      const totalRight = Number(res.totalCorrect || 0);
      const acc = totalQ > 0 ? totalRight / totalQ : 0;
      const evaluatedPlt = totalQ > 0
        ? (acc >= 0.7 ? Math.max(stage.bktMasteryPlt || 0, Math.min(0.85, 0.75 + (acc - 0.7) * 0.3)) : Math.max(0.2, Math.min(0.65, acc * 0.85)))
        : stage.bktMasteryPlt;
      setStage((prev) => prev ? {
        ...prev,
        bktMasteryPlt: evaluatedPlt,
        currentStep: res.currentStep || 'LEARN',
        status: res.status || prev.status,
        resolvedVideoUrl: res.videoUrl || prev.resolvedVideoUrl
      } : prev);
      onNodeEvaluated?.({ nodeId: node?.nodeId, evaluatedPlt, isEvaluatedOk: acc >= 0.7 });
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không gửi được bài khởi động Preview.');
    } finally {
      setPreviewBusy(false);
    }
  };

  // Phase L: Report Learn progress (Video watching OR SGK Theory mastery confirmation >= 80%)
  const reportLearnProgress = async (watchedSeconds, totalSeconds) => {
    if (!stage?.stageProgressId || learnBusy) return;
    setLearnBusy(true);
    setError('');
    try {
      const res = await practiceService.trackStageVideo(stage.stageProgressId, {
        studentId,
        watchedSeconds,
        totalSeconds
      });
      setLearnProgressPct(Number(res.videoWatchPercentage || 0));
      setLearnMessage(res.message || '');
      setStage((prev) => prev ? {
        ...prev,
        currentStep: res.currentStep || prev.currentStep,
        videoWatchPercentage: res.videoWatchPercentage
      } : prev);

      if (res.isCompletedLearn || res.currentStep === 'APPLY') {
        await loadNextAdaptiveQuestion(stage.stageProgressId);
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể ghi nhận tiến độ học lý thuyết.');
    } finally {
      setLearnBusy(false);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const vid = e.currentTarget;
    if (!vid.duration || vid.duration <= 0) return;
    const now = Date.now();
    const pct = Math.min(100, Math.round((vid.currentTime / vid.duration) * 100));
    setLearnProgressPct((prev) => Math.max(prev, pct));
    if (now - lastVideoReportRef.current >= 5000 || pct >= 80) {
      lastVideoReportRef.current = now;
      reportLearnProgress(Math.round(vid.currentTime), Math.round(vid.duration));
    }
  };

  // Phase A: Submit ZPD Adaptive Answer -> BKT update
  const handleSubmitApplyAnswer = async () => {
    if (!stage?.stageProgressId || !currentQuestion?.questionId || !selectedOption || applyBusy) return;
    setApplyBusy(true);
    setError('');
    try {
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
      const res = await practiceService.submitStageAnswer(stage.stageProgressId, {
        studentId,
        questionId: currentQuestion.questionId,
        selectedOption,
        timeSpentSeconds: timeSpent,
        patternId: node?.skillName || 'STANDARD'
      });

      setAnswerFeedback(res);
      setStage((prev) => prev ? {
        ...prev,
        bktMasteryPlt: res.posteriorPlt,
        currentStep: res.currentStep || prev.currentStep,
        status: res.status || prev.status,
        consecutiveAdvancedCorrect: res.consecutiveAdvancedCorrect,
        consecutiveIncorrect: res.consecutiveIncorrect
      } : prev);
      onNodeEvaluated?.({ nodeId: node?.nodeId, evaluatedPlt: res.posteriorPlt, isEvaluatedOk: res.posteriorPlt >= 0.7 });
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể chấm câu trả lời thích ứng.');
    } finally {
      setApplyBusy(false);
    }
  };

  const handleAfterApplyFeedback = async () => {
    if (!stage?.stageProgressId) return;
    if (answerFeedback?.isRemedialTriggered || stage.status === 'REMEDIAL_REQUIRED') {
      await loadRemedialPackage(stage.stageProgressId);
      return;
    }
    if (answerFeedback?.isMasteryAchieved || stage.currentStep === 'REFLECT') {
      setCurrentQuestion(null);
      setAnswerFeedback(null);
      return;
    }
    await loadNextAdaptiveQuestion(stage.stageProgressId);
  };

  // BR-03: Submit Remedial Rescue 3 easy questions
  const handleSubmitRemedial = async () => {
    if (!stage?.stageProgressId || !remedialPkg?.questions?.length || remedialBusy) return;
    setRemedialBusy(true);
    setError('');
    try {
      const answers = remedialPkg.questions.map((q) => ({
        questionId: q.questionId,
        selectedOption: remedialAnswers[q.questionId] || '',
        timeSpentSeconds: 20
      }));
      const res = await practiceService.submitStageRemedial(stage.stageProgressId, {
        studentId,
        answers
      });
      setRemedialResult(res);

      if (res.isRemedialPassed || res.isPassed || res.currentStatus === 'IN_PROGRESS' || res.status === 'IN_PROGRESS') {
        setStage((prev) => prev ? {
          ...prev,
          status: 'IN_PROGRESS',
          currentStep: 'APPLY',
          consecutiveIncorrect: 0
        } : prev);
      }
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể nộp gói cứu trợ phụ đạo.');
    } finally {
      setRemedialBusy(false);
    }
  };

  // Phase R: Reflect & Complete Node -> Unlock Next Node
  const handleSubmitReflect = async (e) => {
    e.preventDefault();
    if (!stage?.stageProgressId || reflectBusy) return;
    setReflectBusy(true);
    setError('');
    try {
      const res = await practiceService.reflectCompleteStage(stage.stageProgressId, {
        studentId,
        confidenceRating,
        learnedSummary: learnedSummary.trim() || `Đã hoàn thành chuyên đề ${detail?.skillName || node.skillName}`,
        mistakeNotes: mistakeNotes.trim()
      });
      setReflectResult(res);
      setStage((prev) => prev ? {
        ...prev,
        status: 'COMPLETED',
        currentStep: 'REFLECT',
        confidenceRating,
        learnedSummary: learnedSummary.trim() || `Đã hoàn thành chuyên đề ${detail?.skillName || node.skillName}`,
        mistakeNotes: mistakeNotes.trim()
      } : prev);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
      onNodeCompleted?.(res);
    } catch (err) {
      setError(err?.data?.detail || err?.message || 'Không thể hoàn tất phản tư chặng học.');
    } finally {
      setReflectBusy(false);
    }
  };

  const activeStepKey = stage?.status === 'COMPLETED'
    ? 'REFLECT'
    : (stage?.currentStep || 'PREVIEW');
  const activeStepIndex = Math.max(0, PLAR_STEPS.findIndex((s) => s.key === activeStepKey));
  const masteryPct = Math.round(Number(stage?.bktMasteryPlt ?? node?.masteryPlt ?? 0) * 100);

  const primaryVideoUrl = stage?.resolvedVideoUrl || detail?.videoUrl || materials.find((m) => m.videoUrl)?.videoUrl || '';
  const hasAnyVideo = Boolean(primaryVideoUrl);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Node Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-slate-900 to-indigo-950 text-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 font-extrabold">
                Chặng #{node.stepOrder}
              </span>
              {Number(node.gradeLevel) > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-100 border border-cyan-400/40 font-extrabold">
                  Lớp {node.gradeLevel}
                </span>
              )}
              {(detail?.subjectName || node.subjectName) && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-bold">
                  {detail?.subjectName || node.subjectName}
                </span>
              )}
              {ASSESSMENT_BADGES[node.assessmentStatus] && (
                <span className={`px-2.5 py-0.5 rounded-full border font-bold ${ASSESSMENT_BADGES[node.assessmentStatus].cls}`}>
                  {ASSESSMENT_BADGES[node.assessmentStatus].label}
                </span>
              )}
              <span className="text-blue-200/90 font-medium">
                {detail?.domainName || node.domainName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {detail?.skillName || node.skillName}
            </h2>
            {(detail?.chapterName || node.chapterName) && (
              <p className="text-xs text-slate-300">
                {detail?.chapterName || node.chapterName}
                {(detail?.lessonName || node.lessonName) ? ` › ${detail?.lessonName || node.lessonName}` : ''}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenAiTutorWithContext && (
              <button
                type="button"
                onClick={() => onOpenAiTutorWithContext({
                  topic: detail?.skillName || node.skillName,
                  subject: detail?.subjectName || node.subjectName || detail?.domainName,
                  questionContent: currentQuestion?.content || `Giải thích phương pháp giải dạng bài: ${detail?.skillName || node.skillName}`
                })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-cyan-300" />
                <span>Hỏi Gia Sư AI Socratic</span>
              </button>
            )}
          </div>
        </div>

        {/* PLAR 4-Phase Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {PLAR_STEPS.map((step, idx) => {
            const isDone = stage?.status === 'COMPLETED' || idx < activeStepIndex;
            const isCurrent = stage?.status !== 'COMPLETED' && idx === activeStepIndex;
            return (
              <div
                key={step.key}
                className={`rounded-2xl px-3 py-2.5 border transition-all flex items-center gap-2.5 ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                    : isCurrent
                    ? 'bg-blue-500/30 border-cyan-300/70 text-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-300/70'
                }`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.code}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{step.label}</div>
                  <div className="text-[10px] opacity-80 truncate">{step.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live BKT Mastery Meter */}
        {stage && (
          <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <Target className="w-4 h-4 text-cyan-300" />
                <span>Độ thành thạo BKT P(Lt): <strong className="text-cyan-300">{masteryPct}%</strong> / Mục tiêu 85%</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-200">
                <span>Vận dụng đúng liên tiếp: <strong>{stage.consecutiveAdvancedCorrect || 0}/2</strong></span>
                {(stage.consecutiveIncorrect || 0) > 0 && (
                  <span className="text-amber-300 font-bold">Sai liên tiếp: {stage.consecutiveIncorrect}/3</span>
                )}
              </div>
            </div>
            <div className="relative h-2.5 rounded-full bg-slate-900/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  masteryPct >= 85 ? 'bg-emerald-400' : masteryPct >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.max(4, Math.min(100, masteryPct))}%` }}
              />
              <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-white/80" title="Ngưỡng đạt chuẩn BR-01: 85%" />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {loading && (
          <div className="py-12 text-center space-y-2 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-semibold">Đang đồng bộ chu trình P-L-A-R &amp; học liệu SGK...</p>
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* PRUNED NODE ON DAG */}
        {!loading && node.status === 'SKIPPED_PRUNED' && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center space-y-3">
            <Lock className="w-9 h-9 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800">
              Chặng học đã được tối ưu rút gọn
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Chặng #{node.stepOrder} nằm ngoài danh sách đang kích hoạt trên lộ trình hiện tại.
            </p>
          </div>
        )}

        {/* TUITION GATE LOCK (REAL BACKEND + FRONTEND CHECK) */}
        {!loading && tuitionBlocked && node.status !== 'SKIPPED_PRUNED' && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                Yêu cầu kích hoạt khóa học (Backend Verified)
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Đóng học phí PayOS để mở khóa Chu Trình Tự Học Thích Ứng P-L-A-R
              </h3>
              <p className="text-sm text-slate-600">
                Lộ trình cá nhân hóa của bạn đã được khởi tạo xong từ bài kiểm tra đầu vào. Sau khi thanh toán học phí qua VietQR PayOS, toàn bộ 4 pha <strong>Preview → Learn → Apply (ZPD/BKT) → Reflect</strong> và Gia sư AI Socratic sẽ mở khóa ngay lập tức.
              </p>
            </div>
            {materials.length > 0 && (
              <div className="text-left rounded-2xl border border-slate-200 bg-white p-4 max-w-2xl mx-auto space-y-2">
                <div className="text-xs font-extrabold text-slate-500 uppercase">Xem trước mục lục học liệu SGK của chặng này</div>
                <div className="text-sm font-bold text-slate-800">{materials[0].title || detail?.skillName}</div>
                <p className="text-xs text-slate-600 line-clamp-3">{materials[0].content}</p>
              </div>
            )}
            {onNavigateTuition && (
              <button
                type="button"
                onClick={onNavigateTuition}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Đến Trang Đóng Học Phí PayOS VietQR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* PHASE P: PREVIEW (3 QUICK CHECK QUESTIONS)                       */}
        {/* =============================================================== */}
        {!loading && !tuitionBlocked && stage && stage.currentStep === 'PREVIEW' && stage.status !== 'COMPLETED' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
              <div>
                <h3 className="text-sm font-black text-indigo-950">Pha P — Preview: Khởi Động Phản Xạ (3 Câu Quick Check)</h3>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Đánh giá nhanh trực giác ban đầu (không trừ điểm BKT) để kích hoạt nhận thức trước khi học Lý thuyết SGK.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-extrabold border border-indigo-200">
                {(stage.previewQuestions || []).length} câu hỏi thật
              </span>
            </div>

            {(stage.previewQuestions || []).length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-amber-800">Chặng này chưa có câu khởi động riêng — bạn có thể chuyển thẳng sang pha Learn.</p>
                <button
                  type="button"
                  onClick={handleSubmitPreview}
                  disabled={previewBusy}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  Sang Pha Learn
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(stage.previewQuestions || []).map((q) => (
                  <fieldset key={q.questionId} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <PassageContextBox
                      title={q.passageTitle}
                      content={q.passageContent}
                      imageUrl={q.passageImageUrl}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <legend className="text-sm font-bold text-slate-900 leading-relaxed">
                        <span className="inline-block mr-1.5 text-indigo-700">Câu {q.questionOrder}.</span>
                        <MathText text={q.content} />
                      </legend>
                      <span className="shrink-0 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {BLOOM_LABELS[q.difficultyLevel] || `L${q.difficultyLevel}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(q.options || []).map((opt) => {
                        const checked = previewAnswers[q.questionId] === opt.optionId;
                        return (
                          <label
                            key={opt.optionId}
                            className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm cursor-pointer transition-all ${
                              checked
                                ? 'border-indigo-500 bg-indigo-50/80 font-semibold text-indigo-950'
                                : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`preview-${q.questionId}`}
                              value={opt.optionId}
                              checked={checked}
                              onChange={() => setPreviewAnswers((prev) => ({ ...prev, [q.questionId]: opt.optionId }))}
                              className="mt-1 accent-indigo-600"
                            />
                            <span>
                              <strong className="mr-1.5">{opt.optionId}.</strong>
                              <MathText text={opt.content} />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitPreview}
                    disabled={previewBusy || (stage.previewQuestions || []).some((q) => !previewAnswers[q.questionId])}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
                  >
                    <span>{previewBusy ? 'Đang chấm bài khởi động...' : 'Nộp Quick Check & Sang Pha Learn'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* PHASE L: LEARN (REAL SGK THEORY + VIDEO TRACKING >= 80%)        */}
        {/* =============================================================== */}
        {!loading && !tuitionBlocked && stage && stage.currentStep === 'LEARN' && stage.status !== 'COMPLETED' && (
          <div className="space-y-5">
            {previewResult && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kết quả Preview: Đúng {previewResult.totalCorrect}/{previewResult.totalQuestions} câu</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-800">{previewResult.message}</p>
                {Array.isArray(previewResult.feedbacks) && previewResult.feedbacks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                    {previewResult.feedbacks.map((fb, idx) => (
                      <div key={fb.questionId || idx} className={`rounded-xl border p-2.5 text-xs ${fb.isCorrect ? 'bg-white border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                        <div className="font-bold">
                          Câu {idx + 1}: Chọn {fb.selectedOption || '—'} • Đáp án <strong className="text-emerald-700">{fb.correctOption || '?'}</strong>
                        </div>
                        {fb.explanation && <p className="mt-1 text-slate-600 line-clamp-3"><MathText text={fb.explanation} /></p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div>
                <h3 className="text-sm font-black text-blue-950">Pha L — Learn: Lý Thuyết Trọng Tâm SGK &amp; Phương Pháp Giải</h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  {hasAnyVideo
                    ? 'Xem video bài giảng và đọc kỹ lý thuyết đạt tối thiểu 80% để mở khóa pha Luyện tập thích ứng APPLY.'
                    : 'Đọc kỹ Lý thuyết SGK, công thức & phương pháp giải dưới đây, sau đó xác nhận hoàn thành (≥ 80%) để mở khóa pha APPLY.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Đã học: {Math.floor(learnSeconds / 60)}p {learnSeconds % 60}s • Tiến độ: {Math.round(learnProgressPct)}%</span>
              </div>
            </div>

            {/* Video Player if real videoUrl exists */}
            {hasAnyVideo && (
              <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden">
                {getVideoEmbedUrl(primaryVideoUrl) ? (
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={getVideoEmbedUrl(primaryVideoUrl)}
                      title={detail?.skillName || node.skillName}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    className="w-full max-h-[420px]"
                    controls
                    preload="metadata"
                    src={primaryVideoUrl}
                    onTimeUpdate={handleVideoTimeUpdate}
                  />
                )}
              </div>
            )}

            {/* Real SGK Materials from Content Service */}
            <div className="space-y-3">
              {materials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  Chuyên đề <strong>{detail?.skillName || node.skillName}</strong> chưa có bài đọc riêng trong bảng Materials. Bạn có thể bấm nút bên dưới để chuyển sang pha Luyện tập thích ứng APPLY ngay.
                </div>
              ) : (
                materials.map((mat, idx) => {
                  const isChecked = !!checkedMaterialIds[mat.materialId];
                  return (
                    <article key={mat.materialId || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-extrabold text-sm text-slate-900">{mat.title || `Tài liệu SGK #${idx + 1}`}</h4>
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setCheckedMaterialIds((prev) => ({ ...prev, [mat.materialId]: e.target.checked }))}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span>Đã đọc mục này</span>
                        </label>
                      </div>
                      {mat.content && (
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          <MathText text={mat.content} />
                        </div>
                      )}
                      {mat.fileUrl && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Mở tài liệu đính kèm</span>
                        </a>
                      )}
                    </article>
                  );
                })
              )}
            </div>

            {learnMessage && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-800">
                {learnMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Xác nhận tiến độ ≥ 80% qua API <code>POST /stages/track-video</code> để mở khóa Pha APPLY.
              </span>
              <button
                type="button"
                disabled={learnBusy}
                onClick={() => reportLearnProgress(Math.max(100, learnSeconds), 100)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{learnBusy ? 'Đang xác nhận tiến độ...' : 'Đã Nắm Vững Lý Thuyết (Mở Khóa Pha APPLY)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* BR-03 REMEDIAL INTERVENTION PANEL (3 CONSECUTIVE WRONG)          */}
        {/* =============================================================== */}
        {!loading && !tuitionBlocked && stage && stage.status === 'REMEDIAL_REQUIRED' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Kích Hoạt Cứu Trợ Phụ Đạo (Quy tắc BR-03: Sai 3 câu liên tiếp)</span>
              </div>
              <p className="text-xs text-amber-800">
                {remedialPkg?.instruction || 'Hãy xem lại tóm tắt công thức nền tảng và hoàn thành 3 câu hỏi cơ bản dưới đây để khôi phục pha Luyện tập thích ứng APPLY.'}
              </p>
              {remedialPkg?.summaryFormula && (
                <div className="mt-2 rounded-xl bg-white border border-amber-200 p-3.5 text-xs text-slate-700 whitespace-pre-wrap">
                  <MathText text={remedialPkg.summaryFormula} />
                </div>
              )}
            </div>

            {remedialBusy && !remedialPkg && (
              <div className="py-6 text-center text-sm text-slate-500">Đang tải gói cứu trợ phụ đạo...</div>
            )}

            {remedialPkg?.questions?.map((q) => (
              <fieldset key={q.questionId} className="rounded-2xl border border-amber-200 bg-white p-4 space-y-3">
                <PassageContextBox
                  title={q.passageTitle}
                  content={q.passageContent}
                  imageUrl={q.passageImageUrl}
                />
                <legend className="text-sm font-bold text-slate-900">
                  <span className="text-amber-700 mr-1.5">Câu cứu trợ {q.questionOrder}.</span>
                  <MathText text={q.content} />
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || []).map((opt) => {
                    const optKey = opt.optionId || opt.key;
                    const optText = opt.content || opt.text;
                    return (
                      <label
                        key={optKey}
                        className={`flex items-start gap-2 rounded-xl border p-3 text-sm cursor-pointer ${
                          remedialAnswers[q.questionId] === optKey
                            ? 'border-amber-500 bg-amber-50 font-semibold'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`rem-${q.questionId}`}
                          value={optKey}
                          checked={remedialAnswers[q.questionId] === optKey}
                          onChange={() => setRemedialAnswers((prev) => ({ ...prev, [q.questionId]: optKey }))}
                          className="mt-1 accent-amber-600"
                        />
                        <span><strong>{optKey}.</strong> <MathText text={optText} /></span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {remedialResult && (
              <div className={`rounded-2xl border p-4 text-sm space-y-3 ${
                remedialResult.isRemedialPassed || remedialResult.isPassed || remedialResult.currentStatus === 'IN_PROGRESS' || remedialResult.status === 'IN_PROGRESS'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}>
                <p className="font-bold">{remedialResult.message}</p>
                {Array.isArray(remedialResult.results) && remedialResult.results.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {remedialResult.results.map((r, idx) => (
                      <div key={r.questionId || idx} className={`rounded-xl border p-2.5 text-xs ${r.isCorrect ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'}`}>
                        <div className="font-bold">
                          Câu {idx + 1}: Chọn {r.selectedOption || '—'} • Đáp án <strong className="text-emerald-700">{r.correctOption}</strong>
                        </div>
                        {r.explanation && <p className="mt-1 text-slate-600"><MathText text={r.explanation} /></p>}
                      </div>
                    ))}
                  </div>
                )}
                {(remedialResult.isRemedialPassed || remedialResult.isPassed || remedialResult.currentStatus === 'IN_PROGRESS' || remedialResult.status === 'IN_PROGRESS') ? (
                  <button
                    type="button"
                    onClick={() => loadNextAdaptiveQuestion(stage.stageProgressId)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
                  >
                    <span>Quay Lại Pha Luyện Tập APPLY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => loadRemedialPackage(stage.stageProgressId)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tải Đợt Biến Thể Cứu Trợ Mới</span>
                  </button>
                )}
              </div>
            )}

            {!remedialResult && remedialPkg?.questions?.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitRemedial}
                  disabled={remedialBusy || remedialPkg.questions.some((q) => !remedialAnswers[q.questionId])}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-white cursor-pointer"
                >
                  <span>{remedialBusy ? 'Đang chấm gói cứu trợ...' : 'Nộp Gói Cứu Trợ BR-03'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* PHASE A: APPLY (REAL ZPD QUESTION SELECTOR + BKT ENGINE)         */}
        {/* =============================================================== */}
        {!loading && !tuitionBlocked && stage && stage.currentStep === 'APPLY' && stage.status === 'IN_PROGRESS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cyan-50 border border-cyan-100 p-4">
              <div>
                <h3 className="text-sm font-black text-cyan-950">Pha A — Apply: Luyện Tập Thích Ứng (IRT ZPD + BKT Mastery)</h3>
                <p className="text-xs text-cyan-800 mt-0.5">
                  Hệ thống tự chọn câu hỏi tối ưu vùng ZPD <code>[0.60 – 0.75]</code> và chấm trực tiếp với ngân hàng câu hỏi thật. Đạt <strong>P(Lt) ≥ 85%</strong> (BR-01) để mở khóa Pha Reflect.
                </p>
              </div>
              {currentQuestion && (
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-800">
                    Câu #{currentQuestion.attemptOrder}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-cyan-200 text-indigo-700">
                    {BLOOM_LABELS[currentQuestion.difficultyLevel] || `Bloom L${currentQuestion.difficultyLevel}`} (b={Number(currentQuestion.itemDifficultyB ?? 0).toFixed(1)})
                  </span>
                </div>
              )}
            </div>

            {applyBusy && !currentQuestion && (
              <div className="py-10 text-center text-sm text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                Đang chọn câu hỏi tối ưu theo năng lực ZPD...
              </div>
            )}

            {currentQuestion && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                <PassageContextBox
                  title={currentQuestion.passageTitle}
                  content={currentQuestion.passageContent}
                  imageUrl={currentQuestion.passageImageUrl}
                />
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  <MathText text={currentQuestion.content} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(currentQuestion.options || []).map((opt) => {
                    const isSelected = selectedOption === opt.optionId;
                    const showResult = Boolean(answerFeedback);
                    const isRightOpt = showResult && answerFeedback.correctOption === opt.optionId;
                    const isWrongSelected = showResult && isSelected && !answerFeedback.isCorrect;

                    let cardStyle = 'border-slate-200 bg-slate-50/50 hover:border-blue-400 text-slate-800';
                    if (isRightOpt) cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    else if (isWrongSelected) cardStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                    else if (isSelected) cardStyle = 'border-blue-600 bg-blue-50 text-blue-950 font-bold';

                    return (
                      <button
                        key={opt.optionId}
                        type="button"
                        disabled={showResult || applyBusy}
                        onClick={() => setSelectedOption(opt.optionId)}
                        className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left text-sm transition-all cursor-pointer disabled:cursor-default ${cardStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isRightOpt ? 'bg-emerald-600 text-white' : isWrongSelected ? 'bg-rose-600 text-white' : isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                        }`}>
                          {opt.optionId}
                        </span>
                        <span className="leading-relaxed">
                          <MathText text={opt.content} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!answerFeedback ? (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitApplyAnswer}
                      disabled={!selectedOption || applyBusy}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
                    >
                      <span>{applyBusy ? 'Đang chấm & cập nhật BKT...' : 'Kiểm Tra Đáp Án'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className={`rounded-2xl border p-4 space-y-3 ${
                    answerFeedback.isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-sm font-black ${answerFeedback.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {answerFeedback.isCorrect ? '✓ Chính xác!' : `✗ Chưa chính xác (Đáp án đúng: ${answerFeedback.correctOption})`}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                        BKT P(Lt): {(answerFeedback.priorPlt * 100).toFixed(1)}% → <strong>{(answerFeedback.posteriorPlt * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{answerFeedback.feedbackMessage}</p>
                    {answerFeedback.explanation && (
                      <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1">
                        <div className="font-extrabold text-indigo-700">Lời giải chi tiết:</div>
                        <div className="leading-relaxed whitespace-pre-wrap">
                          <MathText text={answerFeedback.explanation} />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAfterApplyFeedback}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-extrabold text-white cursor-pointer"
                      >
                        <span>
                          {answerFeedback.isRemedialTriggered
                            ? 'Vào Gói Cứu Trợ Phụ Đạo BR-03'
                            : answerFeedback.isMasteryAchieved
                            ? 'Chuyển Sang Pha REFLECT Tổng Kết'
                            : 'Câu Hỏi Thích Ứng Tiếp Theo'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!applyBusy && !currentQuestion && applyFinishedMsg && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
                <p className="text-sm font-bold text-indigo-950">{applyFinishedMsg}</p>
                {stage.currentStep !== 'REFLECT' && (
                  <button
                    type="button"
                    onClick={() => loadNextAdaptiveQuestion(stage.stageProgressId)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    Tải lại trạng thái
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* PHASE R: REFLECT & COMPLETE NODE (UNLOCK NEXT NODE ON ROADMAP)   */}
        {/* =============================================================== */}
        {!loading && !tuitionBlocked && stage && (stage.currentStep === 'REFLECT' || stage.status === 'COMPLETED') && (
          <div className="space-y-5">
            {stage.status === 'COMPLETED' || reflectResult ? (
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                    Hoàn thành trọn vẹn chu trình P-L-A-R
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Độ thành thạo đạt {Math.round((reflectResult?.finalMasteryPlt ?? stage.bktMasteryPlt ?? 0.85) * 100)}%
                  </h3>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto">
                    {reflectResult?.message || 'Chặng học này đã hoàn thành và được đồng bộ vào hồ sơ năng lực LearningProfiles của bạn!'}
                  </p>
                </div>
                {(stage.confidenceRating || stage.learnedSummary || stage.mistakeNotes) && (
                  <div className="max-w-xl mx-auto text-left rounded-2xl border border-emerald-200 bg-white p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-emerald-900">Nhật ký phản tư đã lưu trong CSDL</span>
                      {stage.confidenceRating && (
                        <span className="inline-flex items-center gap-1 font-black text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {stage.confidenceRating}/5 sao
                        </span>
                      )}
                    </div>
                    {stage.learnedSummary && (
                      <div>
                        <span className="font-bold text-slate-500">Kiến thức cốt lõi rút ra: </span>
                        <span className="text-slate-800">{stage.learnedSummary}</span>
                      </div>
                    )}
                    {stage.mistakeNotes && (
                      <div>
                        <span className="font-bold text-slate-500">Bẫy / Lỗi sai cần tránh: </span>
                        <span className="text-slate-800">{stage.mistakeNotes}</span>
                      </div>
                    )}
                  </div>
                )}
                {reflectResult?.nextUnlockedNodeId && onSelectNextNode && (
                  <button
                    type="button"
                    onClick={() => onSelectNextNode(reflectResult.nextUnlockedNodeId)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
                  >
                    <span>Chuyển Sang Chặng Kế Tiếp Đã Mở Khóa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReflect} className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-emerald-950">Pha R — Reflect: Phản Tư Nhận Thức &amp; Mở Khóa Chặng Kế Tiếp</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Tuyệt vời! Bạn đã đạt ngưỡng thành thạo <strong>{masteryPct}%</strong>. Hãy tự đánh giá mức độ tự tin và ghi chú lại kinh nghiệm để đóng chặng học này.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700">Mức độ tự tin của bạn với dạng bài này (1–5 sao)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setConfidenceRating(star)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          star <= confidenceRating
                            ? 'border-amber-400 bg-amber-50 text-amber-500'
                            : 'border-slate-200 bg-white text-slate-300'
                        }`}
                        aria-label={`${star} sao`}
                      >
                        <Star className={`w-5 h-5 ${star <= confidenceRating ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">{confidenceRating}/5 sao</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {REFLECT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setLearnedSummary((prev) => prev ? `${prev}; ${tag}` : tag)}
                      className="rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-700">Kiến thức cốt lõi em rút ra được</span>
                    <textarea
                      rows={3}
                      value={learnedSummary}
                      onChange={(e) => setLearnedSummary(e.target.value)}
                      placeholder="Ví dụ: Nhớ kiểm tra điều kiện xác định trước khi rút gọn và đối chiếu nghiệm..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-700">Bẫy / Lỗi sai cần tránh lần sau</span>
                    <textarea
                      rows={3}
                      value={mistakeNotes}
                      onChange={(e) => setMistakeNotes(e.target.value)}
                      placeholder="Ví dụ: Dễ nhầm dấu đạo hàm hàm hợp hoặc đọc sót từ KHÔNG trong đề..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={reflectBusy}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 px-6 py-3 text-sm font-extrabold text-white shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{reflectBusy ? 'Đang lưu & mở khóa chặng tiếp theo...' : 'Hoàn Thành Chặng & Mở Khóa Chặng Kế Tiếp'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
