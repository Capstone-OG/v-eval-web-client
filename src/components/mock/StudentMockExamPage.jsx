import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Clock,
  Play,
  Flag,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
  Sparkles,
  Bot,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  SlidersHorizontal,
  ShieldAlert,
  Lock
} from 'lucide-react';
import MathText from '../common/MathText';
import AttemptAnswerReviewList from '../common/AttemptAnswerReviewList';
import FlagQuestionModal from '../common/FlagQuestionModal';
import { addFlaggedQuestion, getFlaggedQuestionIdSet } from '../../utils/questionFlagStore';
import { contentService } from '../../services/contentService';
import { practiceService } from '../../services/practiceService';

const SUBJECT_PRESETS = [
  { code: 'ALL', label: 'Tổng hợp 8 môn V-ACT', defaultCount: 40, defaultMinutes: 50 },
  { code: 'MATH', label: 'Toán học', defaultCount: 25, defaultMinutes: 35 },
  { code: 'PHYS', label: 'Vật lí', defaultCount: 20, defaultMinutes: 25 },
  { code: 'CHEM', label: 'Hóa học', defaultCount: 20, defaultMinutes: 25 },
  { code: 'BIO', label: 'Sinh học', defaultCount: 20, defaultMinutes: 25 },
  { code: 'LIT', label: 'Ngữ văn', defaultCount: 20, defaultMinutes: 25 },
  { code: 'ENG', label: 'Tiếng Anh', defaultCount: 20, defaultMinutes: 25 },
  { code: 'HIST', label: 'Lịch sử', defaultCount: 20, defaultMinutes: 25 },
  { code: 'GEO', label: 'Địa lí', defaultCount: 20, defaultMinutes: 25 }
];

const BLOOM_LABELS = {
  1: 'Nhận biết',
  2: 'Thông hiểu',
  3: 'Vận dụng cơ bản',
  4: 'Vận dụng cao'
};

function detectSubjectCode(text = '') {
  const s = String(text || '').toLowerCase();
  if (s.includes('toán') || s.includes('math')) return 'MATH';
  if (s.includes('vật lí') || s.includes('vật lý') || s.includes('phys')) return 'PHYS';
  if (s.includes('hóa') || s.includes('hoá') || s.includes('chem')) return 'CHEM';
  if (s.includes('sinh') || s.includes('bio')) return 'BIO';
  if (s.includes('ngữ văn') || s.includes('văn học') || s.includes('tiếng việt') || s.includes('lit')) return 'LIT';
  if (s.includes('tiếng anh') || s.includes('english') || s.includes('eng')) return 'ENG';
  if (s.includes('lịch sử') || s.includes('hist')) return 'HIST';
  if (s.includes('địa lí') || s.includes('địa lý') || s.includes('geo')) return 'GEO';
  return 'OTHER';
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatClock(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function normalizeExamQuestions(examDto) {
  const list = [];
  if (Array.isArray(examDto?.passages)) {
    examDto.passages.forEach((p) => {
      (p.questions || []).forEach((q) => {
        const optDict = q.options || {};
        const opts = Array.isArray(optDict)
          ? optDict.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
          : ['A', 'B', 'C', 'D'].map((k) => optDict[k] || '');
        const corr = String(q.correctOption || q.correct_option || 'A').trim().toUpperCase().slice(0, 1);
        list.push({
          id: String(q.questionId || q.id || `p_${list.length + 1}`),
          number: q.questionNumber || list.length + 1,
          passage: p.content || '',
          content: q.content || q.contentLatex || '',
          options: opts,
          correct: ['A', 'B', 'C', 'D'].includes(corr) ? corr : 'A',
          explanation: q.explanation || `Đáp án đúng là ${corr}.`,
          skillName: q.suggestedSkillName || q.skillName || 'Đọc hiểu & Tổng hợp',
          subjectLabel: q.domainName || 'Ngữ liệu đọc hiểu',
          bloom: Math.max(1, Math.min(4, Number(q.difficultyLevel || 2)))
        });
      });
    });
  }
  const singles = examDto?.singleQuestions || examDto?.single_questions || [];
  singles.forEach((q) => {
    const optDict = q.options || {};
    const opts = Array.isArray(optDict)
      ? optDict.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
      : ['A', 'B', 'C', 'D'].map((k) => optDict[k] || '');
    const corr = String(q.correctOption || q.correct_option || 'A').trim().toUpperCase().slice(0, 1);
    list.push({
      id: String(q.questionId || q.id || `s_${list.length + 1}`),
      number: q.questionNumber || list.length + 1,
      passage: '',
      content: q.content || q.contentLatex || '',
      options: opts,
      correct: ['A', 'B', 'C', 'D'].includes(corr) ? corr : 'A',
      explanation: q.explanation || `Đáp án đúng là ${corr}.`,
      skillName: q.suggestedSkillName || q.skillName || 'Tổng hợp V-ACT',
      subjectLabel: q.domainName || 'ĐGNL V-ACT',
      bloom: Math.max(1, Math.min(4, Number(q.difficultyLevel || 2)))
    });
  });
  return list.sort((a, b) => a.number - b.number).map((q, idx) => ({ ...q, number: idx + 1 }));
}

export default function StudentMockExamPage({ onOpenAiTutorWithContext, onNavigateHistory }) {
  const [stage, setStage] = useState('lobby'); // 'lobby' | 'testing' | 'result'
  const [officialExams, setOfficialExams] = useState([]);
  const [curriculumPatterns, setCurriculumPatterns] = useState([]);
  const [loadingLobby, setLoadingLobby] = useState(true);
  const [startingExam, setStartingExam] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom mock builder state
  const [customSubject, setCustomSubject] = useState('ALL');
  const [customCount, setCustomCount] = useState(40);
  const [customMinutes, setCustomMinutes] = useState(50);

  // Active exam state
  const [activeExamTitle, setActiveExamTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [flagged, setFlagged] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDurationSec, setTotalDurationSec] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagNotice, setFlagNotice] = useState('');

  // Proctored Fullscreen Lock & Anti-Cheat Violation state
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('tab_switch'); // 'tab_switch' | 'exit_fullscreen'

  const enterFullscreen = () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch {
      // ignore
    }
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  // Result state
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'WRONG' | 'CORRECT' | 'UNANSWERED'

  useEffect(() => {
    let mounted = true;
    setLoadingLobby(true);
    Promise.all([
      contentService.getMockExams({ page: 1, limit: 50 }).catch(() => []),
      contentService.getCurriculum().catch(() => [])
    ])
      .then(([examsRes, currRes]) => {
        if (!mounted) return;
        const rawExams = Array.isArray(examsRes) ? examsRes : (examsRes?.items || examsRes?.exams || examsRes?.data || []);
        // Chỉ lấy đề FULL_MOCK đã xuất bản (lọc sạch các đề TOPICAL_PRACTICE nội bộ của PLAR)
        const publishedFull = rawExams.filter((e) => {
          const cat = String(e.examCategory || e.exam_category || '').toUpperCase();
          const pub = e.isPublished ?? e.is_published ?? true;
          return cat === 'FULL_MOCK' && pub;
        });
        setOfficialExams(publishedFull);

        const domains = Array.isArray(currRes) ? currRes : (currRes?.domains || currRes?.data || []);
        const pats = [];
        const seen = new Set();
        domains.forEach((dom) => {
          const domTitle = dom.title || dom.name || '';
          (dom.chapters || []).forEach((ch) => {
            const chName = ch.name || '';
            const subFromCh = detectSubjectCode(`${chName} ${domTitle}`);
            (ch.lessons || []).forEach((les) => {
              (les.patterns || []).forEach((pat) => {
                const sid = pat.patternId || pat.skillId || pat.id;
                if (!sid || seen.has(String(sid))) return;
                seen.add(String(sid));
                const sub = subFromCh !== 'OTHER' ? subFromCh : detectSubjectCode(`${les.name || ''} ${pat.name || ''} ${domTitle}`);
                pats.push({
                  skillId: String(sid),
                  name: pat.name || 'Chuyên đề GDPT 2018',
                  subjectCode: sub,
                  subjectLabel: SUBJECT_PRESETS.find((s) => s.code === sub)?.label || domTitle || 'Tổng hợp',
                  questionCount: Number(pat.questionBankCount || 0)
                });
              });
            });
          });
        });
        setCurriculumPatterns(pats);
      })
      .finally(() => {
        if (mounted) setLoadingLobby(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Proctored Anti-Cheat listeners while testing
  useEffect(() => {
    if (stage !== 'testing') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setViolationCount((c) => c + 1);
        setViolationReason('tab_switch');
        setShowViolationModal(true);
      }
    };

    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFull) {
        setViolationCount((c) => c + 1);
        setViolationReason('exit_fullscreen');
        setShowViolationModal(true);
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  // Countdown timer
  useEffect(() => {
    if (stage !== 'testing') return;
    if (timeRemaining <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeRemaining]);

  const startSession = (title, qList, durationMinutes) => {
    setActiveExamTitle(title);
    setQuestions(qList);
    setCurrentIdx(0);
    setAnswers({});
    setFlagged({});
    const durSec = Math.max(60, Math.round(durationMinutes * 60));
    setTotalDurationSec(durSec);
    setTimeRemaining(durSec);
    setShowSubmitConfirm(false);
    setViolationCount(0);
    setShowViolationModal(false);
    setReviewFilter('ALL');
    setStage('testing');
    enterFullscreen();
  };

  const handleStartOfficialExam = async (exam) => {
    setStartingExam(true);
    setErrorMsg('');
    try {
      const detail = await contentService.getExamDetail(exam.examId || exam.id);
      const qList = normalizeExamQuestions(detail);
      if (qList.length === 0) {
        setErrorMsg('Đề thi này chưa có câu hỏi trong CSDL.');
        return;
      }
      startSession(
        exam.title || detail.title || 'Đề Thi Thử V-ACT Chính Thức',
        qList,
        Number(exam.durationMinutes || detail.durationMinutes || 150)
      );
    } catch {
      setErrorMsg('Không thể tải chi tiết đề thi. Vui lòng thử lại.');
    } finally {
      setStartingExam(false);
    }
  };

  const handleStartCustomMock = async () => {
    setStartingExam(true);
    setErrorMsg('');
    try {
      const matching = customSubject === 'ALL'
        ? curriculumPatterns
        : curriculumPatterns.filter((p) => p.subjectCode === customSubject);
      const withQ = matching.filter((p) => p.questionCount > 0);
      const sourcePool = shuffle(withQ.length > 0 ? withQ : matching);
      const picked = sourcePool.slice(0, Math.min(sourcePool.length, Math.max(12, Math.ceil(customCount * 0.7))));

      const fetched = await Promise.all(
        picked.map((sk) =>
          contentService
            .getQuestionsBySkill(sk.skillId)
            .then((res) => {
              const raw = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
              return raw.map((q) => ({ q, sk }));
            })
            .catch(() => [])
        )
      );

      const seen = new Set();
      const built = [];
      shuffle(fetched.flat()).forEach(({ q, sk }) => {
        const qid = String(q.questionId || q.id || '');
        if (!qid || seen.has(qid)) return;
        seen.add(qid);
        const opts = Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
          : [q.optionA || '', q.optionB || '', q.optionC || '', q.optionD || ''];
        const corr = String(q.correctOption || 'A').trim().toUpperCase().slice(0, 1);
        built.push({
          id: qid,
          number: built.length + 1,
          passage: '',
          content: q.contentLatex || q.content || '',
          options: opts,
          correct: ['A', 'B', 'C', 'D'].includes(corr) ? corr : 'A',
          explanation: q.explanation || `Đáp án chính xác là ${corr}.`,
          skillName: sk.name.replace(/^(Dạng|Pattern)\s*\d+\s*[:.\-–]\s*/i, ''),
          subjectLabel: sk.subjectLabel,
          bloom: Math.max(1, Math.min(4, Number(q.difficultyLevel || 2)))
        });
      });

      const finalQs = built.slice(0, customCount).map((q, i) => ({ ...q, number: i + 1 }));
      if (finalQs.length === 0) {
        setErrorMsg('Chưa đủ câu hỏi cho tổ hợp vừa chọn. Hãy thử chọn "Tổng hợp 8 môn V-ACT".');
        return;
      }
      const preset = SUBJECT_PRESETS.find((s) => s.code === customSubject);
      startSession(
        `Đề Thi Thử ${preset?.label || 'V-ACT'} (${finalQs.length} Câu — ${customMinutes} Phút)`,
        finalQs,
        customMinutes
      );
    } catch {
      setErrorMsg('Không thể tổ hợp đề thi thử từ ngân hàng câu hỏi.');
    } finally {
      setStartingExam(false);
    }
  };

  const handleConfirmFlagMockQuestion = async ({ reasonCode, note }) => {
    const q = questions[currentIdx];
    if (!q) return;
    setFlagBusy(true);
    addFlaggedQuestion({
      questionId: q.id,
      skillId: q.skillId || '',
      skillName: q.skillName,
      subjectName: q.subjectLabel,
      questionContent: q.content,
      options: q.options,
      correctOption: q.correct,
      explanation: q.explanation,
      difficultyLevel: q.bloom,
      reasonCode,
      note,
      sourcePage: `Phòng Thi thử V-ACT (${activeExamTitle})`
    });

    const usedIds = new Set([...questions.map((x) => x.id), ...getFlaggedQuestionIdSet()]);
    const subCode = detectSubjectCode(`${q.subjectLabel} ${q.skillName}`);
    const candidates = shuffle(
      curriculumPatterns.filter((p) => p.questionCount > 0 && (subCode === 'OTHER' || p.subjectCode === subCode))
    ).slice(0, 5);

    let replacement = null;
    for (const sk of candidates) {
      try {
        const res = await contentService.getQuestionsBySkill(sk.skillId);
        const raw = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
        const found = raw.find((item) => !usedIds.has(String(item.questionId || item.id || '')));
        if (found) {
          const opts = Array.isArray(found.options) && found.options.length > 0
            ? found.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
            : [found.optionA || '', found.optionB || '', found.optionC || '', found.optionD || ''];
          const corr = String(found.correctOption || 'A').trim().toUpperCase().slice(0, 1);
          replacement = {
            id: String(found.questionId || found.id),
            number: q.number,
            passage: '',
            content: found.contentLatex || found.content || '',
            options: opts,
            correct: ['A', 'B', 'C', 'D'].includes(corr) ? corr : 'A',
            explanation: found.explanation || `Đáp án đúng là ${corr}.`,
            skillId: sk.skillId,
            skillName: sk.name.replace(/^(Dạng|Pattern)\s*\d+\s*[:.\-–]\s*/i, ''),
            subjectLabel: sk.subjectLabel,
            bloom: Math.max(1, Math.min(4, Number(found.difficultyLevel || 2)))
          };
          break;
        }
      } catch {
        // continue
      }
    }

    if (replacement) {
      setQuestions((prev) => prev.map((it, idx) => (idx === currentIdx ? replacement : it)));
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[q.id];
        return next;
      });
      const msg = `Đã gửi báo cáo lỗi Câu ${q.number} thành công và đổi sang câu hỏi mới!`;
      setFlagNotice(msg);
      if (window.toast?.success) window.toast.success(msg, 'Báo cáo lỗi thành công');
    } else {
      const msg = `Đã gửi báo cáo lỗi Câu ${q.number} thành công tới Giảng viên / Ban quản lý.`;
      setFlagNotice(msg);
      if (window.toast?.success) window.toast.success(msg, 'Báo cáo lỗi thành công');
    }
    setFlagBusy(false);
    setFlagModalOpen(false);
  };

  const handleFinishExam = () => {
    setShowSubmitConfirm(false);
    setShowViolationModal(false);
    exitFullscreen();
    const timeSpent = Math.max(1, totalDurationSec - timeRemaining);
    const reviewedQuestions = questions.map((q) => {
      const chosen = answers[q.id] || '';
      return {
        id: q.id,
        question_number: q.number,
        content: q.content,
        passage_content: q.passage,
        options: q.options,
        skill_name: q.skillName,
        domain_name: q.subjectLabel,
        bloom: q.bloom,
        studentChoice: chosen,
        correctChoice: q.correct,
        correct: q.correct,
        isCorrect: chosen === q.correct,
        timeSpent: Math.round(timeSpent / Math.max(1, questions.length)),
        explanation: q.explanation
      };
    });
    const correctCount = reviewedQuestions.filter((q) => q.isCorrect).length;
    const score1200 = Math.round((correctCount / Math.max(1, questions.length)) * 1200);

    practiceService.saveSubmissionToHistory({
      id: `mock_${Date.now()}`,
      title: activeExamTitle,
      examType: 'MOCK_EXAM',
      completedAt: new Date().toISOString(),
      theta_0: Number((((score1200 / 1200) - 0.5) * 3).toFixed(2)),
      placement_class: score1200 >= 900 ? 'BREAKTHROUGH' : score1200 >= 750 ? 'ACCELERATION' : 'FOUNDATION',
      ai_commentary: `Hoàn thành ${activeExamTitle}: đúng ${correctCount}/${questions.length} câu, quy đổi đạt ${score1200}/1200 điểm V-ACT.`,
      reviewedQuestions,
      pacing: {
        totalCorrect: correctCount,
        totalQuestions: questions.length,
        totalTimeSpent: timeSpent,
        avgTimePerQ: Math.round(timeSpent / Math.max(1, questions.length))
      }
    });
    setStage('result');
  };

  // Computed metrics for testing & result
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correct).length,
    [questions, answers]
  );
  const score1200 = Math.round((correctCount / Math.max(1, questions.length)) * 1200);
  const score10 = ((correctCount / Math.max(1, questions.length)) * 10).toFixed(1);

  const subjectBreakdown = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      const key = q.subjectLabel || 'Tổng hợp';
      if (!map.has(key)) map.set(key, { label: key, total: 0, correct: 0 });
      const entry = map.get(key);
      entry.total += 1;
      if (answers[q.id] === q.correct) entry.correct += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [questions, answers]);

  const filteredReviewList = useMemo(() => {
    return questions.filter((q) => {
      const chosen = answers[q.id];
      if (reviewFilter === 'CORRECT') return chosen === q.correct;
      if (reviewFilter === 'WRONG') return chosen && chosen !== q.correct;
      if (reviewFilter === 'UNANSWERED') return !chosen;
      return true;
    });
  }, [questions, answers, reviewFilter]);

  const totalBankQuestions = useMemo(
    () => curriculumPatterns.reduce((s, p) => s + (p.questionCount || 0), 0),
    [curriculumPatterns]
  );

  // =========================================================================
  // STAGE 1: LOBBY (CHỌN ĐỀ THI THỬ)
  // =========================================================================
  if (stage === 'lobby') {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero Header */}
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Phòng Thi Thử ĐGNL V-ACT</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Luyện làm bài có bấm giờ, quy đổi thang điểm 1200 và chữa chi tiết từng câu sau khi nộp bài.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-800">
              {officialExams.length} Bộ đề chuẩn 120 câu / 150 phút
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 inline-flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Giám sát toàn màn hình
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Official Full-Length V-ACT Exams */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Bộ Đề Thi Thử Chính Thức ĐHQG-HCM (Chuẩn V-ACT 120 Câu — 150 Phút)
            </h2>
          </div>

          {loadingLobby ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              Đang tải danh sách bộ đề thi thử chính thức...
            </div>
          ) : officialExams.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Chưa có bộ đề thi thử V-ACT 120 câu nào được xuất bản trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {officialExams.map((exam) => (
                <div
                  key={exam.examId || exam.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10.5px] font-black">
                        FULL V-ACT • THANG 1200
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {exam.durationMinutes || 150} phút
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{exam.title}</h3>
                    <p className="text-xs text-slate-500">
                      Gồm <strong>{exam.totalQuestions || 120} câu hỏi</strong> chuẩn cấu trúc ĐHQG-HCM (Ngôn ngữ, Toán học – Tư duy logic, Giải quyết vấn đề KHTN/KHXH). Bật tự động khóa toàn màn hình và giám sát chuyển tab khi vào phòng thi.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={startingExam}
                    onClick={() => handleStartOfficialExam(exam)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {startingExam ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Vào Phòng Thi Ngay</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: TIMED EXAM ROOM (PHÒNG THI THỜI GIAN THỰC)
  // =========================================================================
  if (stage === 'testing') {
    const q = questions[currentIdx];
    const isLowTime = timeRemaining <= 300;

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-5 space-y-4">
        {/* Sticky Exam Header */}
        <div className="sticky top-2 z-20 rounded-2xl bg-white border border-slate-200 px-5 py-3 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10.5px] font-black inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> ĐANG KHÓA PHÒNG THI
              </span>
              {violationCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 text-[10.5px] font-black">
                  Vi phạm: {violationCount}
                </span>
              )}
              <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">{activeExamTitle}</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Đã trả lời <strong className="text-emerald-700">{answeredCount}/{questions.length}</strong> câu • Chế độ giám thị toàn màn hình
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-1.5 rounded-xl border text-sm font-mono font-black flex items-center gap-1.5 ${
                isLowTime
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatClock(timeRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Active Question */}
          <div className="lg:col-span-8 min-w-0 overflow-hidden bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            {q && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-black">
                      Câu {q.number}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold">
                      {q.subjectLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                      {BLOOM_LABELS[q.bloom] || 'Thông hiểu'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFlagModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Báo lỗi &amp; Đổi câu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        flagged[q.id]
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flagged[q.id] ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}</span>
                    </button>
                  </div>
                </div>

                {flagNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {flagNotice}
                  </div>
                )}

                {q.passage && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto">
                    <div className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Ngữ liệu đọc hiểu
                    </div>
                    <MathText text={q.passage} />
                  </div>
                )}

                <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                  <MathText text={q.content} />
                </div>

                <div className="space-y-2.5">
                  {q.options.map((opt, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx];
                    const selected = answers[q.id] === letter;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          selected
                            ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-100 font-semibold'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <div className="flex-1 min-w-0 overflow-x-auto text-sm pt-0.5 leading-snug break-words">
                          <MathText text={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    type="button"
                    disabled={currentIdx >= questions.length - 1}
                    onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right: Question Navigator */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Phiếu Trả Lời</h3>
              <span className="text-xs font-bold text-slate-500">
                {answeredCount}/{questions.length} đã làm
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((item, idx) => {
                const isCurrent = idx === currentIdx;
                const isDone = Boolean(answers[item.id]);
                const isFlag = Boolean(flagged[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative h-9 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-300'
                        : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.number}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Đã làm</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200" /> Chưa làm</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đánh dấu</span>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-black text-slate-900">Xác nhận nộp bài thi thử?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn đã hoàn thành <strong>{answeredCount}/{questions.length}</strong> câu hỏi.
                {answeredCount < questions.length && (
                  <span className="text-amber-700 font-semibold"> Còn {questions.length - answeredCount} câu chưa chọn đáp án.</span>
                )}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Làm tiếp
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer"
                >
                  Nộp bài & Chấm điểm
                </button>
              </div>
            </div>
          </div>
        )}
        <FlagQuestionModal
          isOpen={flagModalOpen}
          onClose={() => setFlagModalOpen(false)}
          onConfirm={handleConfirmFlagMockQuestion}
          questionPreview={q?.content}
          busy={flagBusy}
        />

        {/* Proctored Violation Warning Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border-2 border-rose-300 p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Cảnh Báo Giám Thị Phòng Thi (Lần {violationCount})
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {violationReason === 'exit_fullscreen'
                  ? 'Hệ thống phát hiện bạn vừa thoát chế độ Toàn Màn Hình trong lúc đang làm bài thi thử.'
                  : 'Hệ thống phát hiện bạn vừa chuyển tab hoặc rời khỏi cửa sổ phòng thi.'}
                {' '}Vui lòng quay lại chế độ toàn màn hình để tiếp tục làm bài nghiêm túc.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowViolationModal(false);
                  enterFullscreen();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Quay Lại Toàn Màn Hình &amp; Tiếp Tục Thi
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: SCORE REPORT & DETAILED REVIEW (CHỮA ĐỀ CHI TIẾT)
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-blue-50 border border-emerald-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
              KẾT QUẢ THI THỬ V-ACT
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{activeExamTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStage('lobby')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Thi đề khác</span>
            </button>
            {onNavigateHistory && (
              <button
                type="button"
                onClick={onNavigateHistory}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Lịch sử làm bài
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-blue-200">
            <div className="text-[11px] font-bold text-blue-700">Điểm quy đổi V-ACT</div>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{score1200} <span className="text-xs font-bold text-slate-400">/ 1200</span></div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-700">Số câu đúng</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{correctCount} <span className="text-xs font-bold text-slate-400">/ {questions.length}</span></div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500">Thang điểm 10</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{score10}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-amber-200">
            <div className="text-[11px] font-bold text-amber-700">Thời gian làm bài</div>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{formatClock(totalDurationSec - timeRemaining)}</div>
          </div>
        </div>

        {/* Breakdown by subject */}
        {subjectBreakdown.length > 0 && (
          <div className="pt-3 border-t border-slate-200/70 space-y-2">
            <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Phân tích theo môn / lĩnh vực
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {subjectBreakdown.map((sb) => {
                const pct = Math.round((sb.correct / Math.max(1, sb.total)) * 100);
                return (
                  <div key={sb.label} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 truncate">{sb.label}</span>
                      <span className="text-emerald-700">{sb.correct}/{sb.total} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Review Filter Bar & 7-Question Chunked Answer Review (MUI) */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Chữa Đề &amp; Lời Giải Chi Tiết ({questions.length} câu — chia cụm 7 câu dễ tra cứu)
        </h2>
        <AttemptAnswerReviewList
          questions={questions.map((q) => ({
            id: q.id,
            question_number: q.number,
            content: q.content,
            skillName: q.skillName || q.subjectLabel,
            options: q.options,
            studentChoice: answers[q.id] || '',
            correctChoice: q.correct,
            isCorrect: answers[q.id] === q.correct,
            explanation: q.explanation,
          }))}
          chunkSize={7}
          onAskAiTutor={onOpenAiTutorWithContext}
          allowAiTutor={Boolean(onOpenAiTutorWithContext)}
        />
      </div>
    </div>
  );
}
