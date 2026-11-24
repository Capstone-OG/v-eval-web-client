import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Bot,
  RefreshCw,
  Play,
  Award,
  Sparkles,
  BookOpen,
  Flag,
  Clock,
  Layers,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import MathText from '../common/MathText';
import MathScratchpadButton from '../common/MathScratchpadButton';
import FlagQuestionModal from '../common/FlagQuestionModal';
import { addFlaggedQuestion, getFlaggedQuestionIdSet } from '../../utils/questionFlagStore';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';

const CORE_SUBJECTS = [
  { code: 'MATH', label: 'Toán học', dot: 'bg-indigo-500' },
  { code: 'PHYS', label: 'Vật lí', dot: 'bg-sky-500' },
  { code: 'CHEM', label: 'Hóa học', dot: 'bg-emerald-500' },
  { code: 'BIO', label: 'Sinh học', dot: 'bg-lime-500' },
  { code: 'LIT', label: 'Ngữ văn', dot: 'bg-rose-500' },
  { code: 'ENG', label: 'Tiếng Anh', dot: 'bg-violet-500' },
  { code: 'HIST', label: 'Lịch sử', dot: 'bg-amber-500' },
  { code: 'GEO', label: 'Địa lí', dot: 'bg-teal-500' }
];

const SUBJECT_LABEL_MAP = CORE_SUBJECTS.reduce((acc, item) => {
  acc[item.code] = item.label;
  return acc;
}, { ALL: 'Tổng hợp 8 môn V-ACT' });

const DIFFICULTY_OPTIONS = [
  { value: 0, label: 'Thích ứng (ZPD)', desc: 'Tự động cân bằng độ khó' },
  { value: 1, label: 'Nhận biết', desc: 'Củng cố nền tảng' },
  { value: 2, label: 'Thông hiểu', desc: 'Hiểu bản chất & công thức' },
  { value: 3, label: 'Vận dụng', desc: 'Bài tập chuẩn đề ĐGNL' },
  { value: 4, label: 'Vận dụng cao', desc: 'Câu hỏi phân loại 900+' }
];

const BLOOM_BADGE = {
  1: { label: 'Nhận biết', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  2: { label: 'Thông hiểu', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  3: { label: 'Vận dụng', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  4: { label: 'Vận dụng cao', cls: 'bg-violet-50 text-violet-700 border-violet-200' }
};

const COUNT_PRESETS = [10, 20, 30, 45, 60];
const MAX_QUESTIONS = 60;
const MIN_QUESTIONS = 5;

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

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function AdaptiveQuizModal({ isOpen, isEmbedded = false, onClose, onOpenAiTutorWithContext }) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'practice' | 'summary'
  const [curriculumPatterns, setCurriculumPatterns] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Setup filters: empty array = ALL 8 subjects; non-empty = multi-selected subject codes
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [questionCount, setQuestionCount] = useState(20);

  // Practice state
  const [bktMastery, setBktMastery] = useState(0.5);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [remedialNodeActive, setRemedialNodeActive] = useState(false);

  const [quizItems, setQuizItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answerHistory, setAnswerHistory] = useState({});
  const [extraQuestionPool, setExtraQuestionPool] = useState([]);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagNotice, setFlagNotice] = useState('');

  // Load real curriculum pattern pool once
  useEffect(() => {
    if (!isOpen && !isEmbedded) return;
    setStage('setup');
    setLoadError('');
    if (curriculumPatterns.length > 0) return;

    let mounted = true;
    setLoadingCurriculum(true);
    contentService
      .getCurriculum()
      .then((res) => {
        if (!mounted) return;
        const domains = Array.isArray(res) ? res : (res?.domains || res?.data || []);
        const patterns = [];
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
                const sub = subFromCh !== 'OTHER'
                  ? subFromCh
                  : detectSubjectCode(`${les.name || ''} ${pat.name || ''} ${domTitle}`);
                patterns.push({
                  skillId: String(sid),
                  name: pat.name || 'Chuyên đề GDPT 2018',
                  lessonName: les.name || '',
                  chapterName: chName,
                  subjectCode: sub,
                  questionCount: Number(pat.questionBankCount || 0)
                });
              });
            });
          });
        });

        setCurriculumPatterns(patterns);
      })
      .catch(() => {
        if (mounted) setCurriculumPatterns([]);
      })
      .finally(() => {
        if (mounted) setLoadingCurriculum(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, isEmbedded]);

  const subjectStats = useMemo(() => {
    const map = {};
    CORE_SUBJECTS.forEach((s) => {
      map[s.code] = { questions: 0, patterns: 0 };
    });
    curriculumPatterns.forEach((p) => {
      if (map[p.subjectCode]) {
        map[p.subjectCode].questions += p.questionCount || 0;
        map[p.subjectCode].patterns += 1;
      }
    });
    return map;
  }, [curriculumPatterns]);

  const isAllSubjects = selectedSubjects.length === 0 || selectedSubjects.length === CORE_SUBJECTS.length;

  const filteredPatterns = useMemo(() => {
    if (isAllSubjects) return curriculumPatterns;
    const set = new Set(selectedSubjects);
    return curriculumPatterns.filter((p) => set.has(p.subjectCode));
  }, [curriculumPatterns, selectedSubjects, isAllSubjects]);

  const availableQuestionEstimate = useMemo(() => {
    return filteredPatterns.reduce((acc, p) => acc + (p.questionCount || 0), 0);
  }, [filteredPatterns]);

  const selectedSubjectsLabel = useMemo(() => {
    if (isAllSubjects) return 'Tổng hợp 8 môn V-ACT';
    return selectedSubjects.map((c) => SUBJECT_LABEL_MAP[c] || c).join(', ');
  }, [selectedSubjects, isAllSubjects]);

  const toggleSubject = (code) => {
    if (code === 'ALL') {
      setSelectedSubjects([]);
      return;
    }
    setSelectedSubjects((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((c) => c !== code) : [...prev, code];
      if (next.length === CORE_SUBJECTS.length) return [];
      return next;
    });
  };

  if (!isOpen && !isEmbedded) return null;

  const handleStartPractice = async () => {
    const targetCount = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, Number(questionCount) || 20));
    setLoadingItems(true);
    setLoadError('');
    setItemIndex(0);
    setSelectedOpt(null);
    setFeedback(null);
    setAnswerHistory({});
    setBktMastery(0.5);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setRemedialNodeActive(false);

    try {
      const poolWithQ = filteredPatterns.filter((p) => p.questionCount > 0);
      const candidates = shuffleArray(poolWithQ.length > 0 ? poolWithQ : filteredPatterns);
      const flaggedSet = getFlaggedQuestionIdSet();
      const uniqueMap = new Map();
      const fallbackMap = new Map();

      // Batch fetch in chunks of 10 skills until we collect enough questions (fast even for 60 questions)
      const batchSize = 10;
      const maxSkillsToScan = Math.min(candidates.length, 40);

      for (let start = 0; start < maxSkillsToScan; start += batchSize) {
        const chunk = candidates.slice(start, start + batchSize);
        const responses = await Promise.all(
          chunk.map((sk) =>
            contentService
              .getQuestionsBySkill(sk.skillId)
              .then((res) => {
                const rawList = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
                return rawList.map((q) => ({ q, sk }));
              })
              .catch(() => [])
          )
        );

        shuffleArray(responses.flat()).forEach(({ q, sk }) => {
          const qid = String(q.questionId || q.id || '');
          if (!qid || flaggedSet.has(qid) || uniqueMap.has(qid) || fallbackMap.has(qid)) return;
          const opts = Array.isArray(q.options) && q.options.length > 0
            ? q.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
            : [q.optionA || '', q.optionB || '', q.optionC || '', q.optionD || ''];
          const corrLetter = String(q.correctOption || 'A').trim().toUpperCase().slice(0, 1);
          const corrIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(corrLetter));
          const normalized = {
            id: qid,
            skillId: sk.skillId,
            skill: sk.name.replace(/^(Dạng|Pattern)\s*\d+\s*[:.\-–]\s*/i, ''),
            lessonName: sk.lessonName,
            subjectCode: sk.subjectCode,
            bloom: Math.max(1, Math.min(4, Number(q.difficultyLevel || 2))),
            question: q.contentLatex || q.content || '',
            options: opts,
            correct: corrIdx,
            explanation: q.explanation || `Đáp án chính xác là phương án ${corrLetter}.`
          };

          if (selectedDifficulty === 0 || normalized.bloom === selectedDifficulty) {
            uniqueMap.set(qid, normalized);
          } else {
            fallbackMap.set(qid, normalized);
          }
        });

        if (uniqueMap.size >= targetCount + 5) break;
      }

      // If strict difficulty didn't yield enough, top up from fallback pool
      const combined = [...Array.from(uniqueMap.values())];
      if (combined.length < targetCount && fallbackMap.size > 0) {
        for (const item of fallbackMap.values()) {
          combined.push(item);
          if (combined.length >= targetCount + 5) break;
        }
      }

      const finalItems = combined.slice(0, targetCount);
      if (finalItems.length === 0) {
        setLoadError('Chưa tìm thấy câu hỏi phù hợp cho bộ lọc này. Hãy thử chọn "Tổng hợp 8 môn V-ACT" hoặc mức độ "Thích ứng (ZPD)".');
        setLoadingItems(false);
        return;
      }

      setQuizItems(finalItems);
      setExtraQuestionPool(combined.slice(targetCount));
      setFlagNotice('');
      setStage('practice');
    } catch {
      setLoadError('Không thể kết nối máy chủ ngân hàng câu hỏi. Vui lòng thử lại sau giây lát.');
    } finally {
      setLoadingItems(false);
    }
  };

  const currentItem = quizItems[itemIndex] || null;

  const handleConfirmFlag = async ({ reasonCode, note }) => {
    if (!currentItem) return;
    setFlagBusy(true);
    addFlaggedQuestion({
      questionId: currentItem.id,
      skillId: currentItem.skillId,
      skillName: currentItem.skill,
      subjectName: SUBJECT_LABEL_MAP[currentItem.subjectCode] || 'Luyện tập Quiz',
      questionContent: currentItem.question,
      options: currentItem.options,
      correctOption: ['A', 'B', 'C', 'D'][currentItem.correct] || 'A',
      explanation: currentItem.explanation,
      difficultyLevel: currentItem.bloom,
      reasonCode,
      note,
      sourcePage: 'Luyện tập Quiz Tự Chọn'
    });

    const usedIds = new Set([...quizItems.map((x) => x.id), ...getFlaggedQuestionIdSet()]);
    let replacement = extraQuestionPool.find((x) => !usedIds.has(x.id));
    if (replacement) {
      setExtraQuestionPool((prev) => prev.filter((x) => x.id !== replacement.id));
    } else {
      const candidates = shuffleArray(filteredPatterns.filter((p) => p.questionCount > 0)).slice(0, 4);
      for (const sk of candidates) {
        try {
          const res = await contentService.getQuestionsBySkill(sk.skillId);
          const rawList = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
          const found = rawList.find((q) => !usedIds.has(String(q.questionId || q.id || '')));
          if (found) {
            const opts = Array.isArray(found.options) && found.options.length > 0
              ? found.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
              : [found.optionA || '', found.optionB || '', found.optionC || '', found.optionD || ''];
            const corrLetter = String(found.correctOption || 'A').trim().toUpperCase().slice(0, 1);
            replacement = {
              id: String(found.questionId || found.id),
              skillId: sk.skillId,
              skill: sk.name.replace(/^(Dạng|Pattern)\s*\d+\s*[:.\-–]\s*/i, ''),
              lessonName: sk.lessonName,
              subjectCode: sk.subjectCode,
              bloom: Math.max(1, Math.min(4, Number(found.difficultyLevel || 2))),
              question: found.contentLatex || found.content || '',
              options: opts,
              correct: Math.max(0, ['A', 'B', 'C', 'D'].indexOf(corrLetter)),
              explanation: found.explanation || `Đáp án chính xác là ${corrLetter}.`
            };
            break;
          }
        } catch {
          // continue
        }
      }
    }

    if (replacement) {
      setQuizItems((prev) => prev.map((it, idx) => (idx === itemIndex ? replacement : it)));
      setSelectedOpt(null);
      setFeedback(null);
      const msg = 'Đã gửi báo cáo lỗi thành công và tự động đổi sang câu hỏi mới.';
      setFlagNotice(msg);
      if (window.toast?.success) window.toast.success(msg, 'Báo cáo lỗi thành công');
    } else {
      const msg = 'Đã gửi báo cáo lỗi thành công tới hệ thống xét duyệt.';
      setFlagNotice(msg);
      if (window.toast?.success) window.toast.success(msg, 'Báo cáo lỗi thành công');
    }
    setFlagBusy(false);
    setFlagModalOpen(false);
  };

  const handleAnswerSubmit = (optIdx) => {
    if (selectedOpt !== null || !currentItem) return;
    setSelectedOpt(optIdx);
    setAnswerHistory((prev) => ({ ...prev, [currentItem.id]: optIdx }));
    const isCorrect = optIdx === currentItem.correct;

    if (isCorrect) {
      const newMastery = Math.min(0.98, bktMastery + 0.08);
      setBktMastery(newMastery);
      setConsecutiveCorrect((c) => c + 1);
      setConsecutiveWrong(0);
      setFeedback({
        type: 'correct',
        msg: `Chính xác! Độ nắm vững đạt ${Math.round(newMastery * 100)}%.`
      });
    } else {
      const newMastery = Math.max(0.08, bktMastery - 0.1);
      setBktMastery(newMastery);
      const nextWrong = consecutiveWrong + 1;
      setConsecutiveWrong(nextWrong);
      setConsecutiveCorrect(0);
      if (nextWrong >= 3) {
        setRemedialNodeActive(true);
        setFeedback({
          type: 'remedial',
          msg: 'Bạn vừa sai 3 câu liên tiếp — hãy xem kỹ lời giải hoặc hỏi Gia sư AI trước khi chuyển câu.'
        });
      } else {
        setFeedback({
          type: 'wrong',
          msg: `Chưa chính xác. Đáp án đúng là ${['A', 'B', 'C', 'D'][currentItem.correct]}.`
        });
      }
    }
  };

  const handleNextItem = () => {
    setSelectedOpt(null);
    setFeedback(null);
    setFlagNotice('');
    if (itemIndex < quizItems.length - 1) {
      setItemIndex(itemIndex + 1);
    } else {
      const reviewedQuestions = quizItems.map((item, idx) => {
        const chosenIdx = answerHistory[item.id];
        const chosenChar = chosenIdx !== undefined ? ['A', 'B', 'C', 'D'][chosenIdx] : '';
        const correctChar = ['A', 'B', 'C', 'D'][item.correct] || 'A';
        return {
          id: item.id,
          question_number: idx + 1,
          content: item.question,
          options: item.options,
          skill_name: item.skill,
          domain_name: SUBJECT_LABEL_MAP[item.subjectCode] || 'Luyện tập Quiz',
          bloom: item.bloom,
          studentChoice: chosenChar,
          correctChoice: correctChar,
          correct: correctChar,
          isCorrect: chosenIdx === item.correct,
          timeSpent: 35,
          explanation: item.explanation
        };
      });
      const correctCount = reviewedQuestions.filter((q) => q.isCorrect).length;
      practiceService.saveSubmissionToHistory({
        id: `zpd_${Date.now()}`,
        title: `Luyện tập Quiz • ${selectedSubjectsLabel} (${quizItems.length} câu)`,
        examType: 'ZPD_QUIZ',
        completedAt: new Date().toISOString(),
        theta_0: Number((bktMastery - 0.25).toFixed(2)),
        placement_class: bktMastery >= 0.8 ? 'BREAKTHROUGH' : bktMastery >= 0.55 ? 'ACCELERATION' : 'FOUNDATION',
        ai_commentary: `Hoàn thành ${correctCount}/${quizItems.length} câu đúng (${Math.round((correctCount / Math.max(1, quizItems.length)) * 100)}%) với độ nắm vững đạt ${Math.round(bktMastery * 100)}%.`,
        reviewedQuestions,
        pacing: {
          totalCorrect: correctCount,
          totalQuestions: quizItems.length,
          totalTimeSpent: quizItems.length * 35,
          avgTimePerQ: 35
        }
      });
      setStage('summary');
    }
  };

  const correctTotal = quizItems.filter((it) => answerHistory[it.id] === it.correct).length;
  const accuracyPct = Math.round((correctTotal / Math.max(1, quizItems.length)) * 100);
  const progressPct = quizItems.length > 0 ? Math.round(((itemIndex + 1) / quizItems.length) * 100) : 0;
  const estimatedMinutes = Math.max(5, Math.round(questionCount * 1.1));
  const selectedDiffObj = DIFFICULTY_OPTIONS.find((d) => d.value === selectedDifficulty) || DIFFICULTY_OPTIONS[0];

  const subjectBreakdown = useMemo(() => {
    if (stage !== 'summary') return [];
    const bySub = {};
    quizItems.forEach((it) => {
      const code = it.subjectCode || 'OTHER';
      if (!bySub[code]) bySub[code] = { code, label: SUBJECT_LABEL_MAP[code] || 'Tổng hợp', total: 0, correct: 0 };
      bySub[code].total += 1;
      if (answerHistory[it.id] === it.correct) bySub[code].correct += 1;
    });
    return Object.values(bySub);
  }, [stage, quizItems, answerHistory]);

  const content = (
    <div className="w-full space-y-5">
      {/* ========================================================= */}
      {/* STAGE 1: MODERN 2-COLUMN QUIZ BUILDER                     */}
      {/* ========================================================= */}
      {stage === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Configuration Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1: Subject Picker (Single, Multi, or All 8) */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    1. Chọn môn học luyện tập
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn 1 môn, kết hợp nhiều môn hoặc luyện tổng hợp cả 8 môn ĐGNL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSubject('ALL')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    isAllSubjects
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                >
                  {isAllSubjects && <Check className="w-3.5 h-3.5" />}
                  <span>Tổng hợp 8 môn</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CORE_SUBJECTS.map((sub) => {
                  const isPicked = !isAllSubjects && selectedSubjects.includes(sub.code);
                  const count = subjectStats[sub.code]?.questions || 0;
                  return (
                    <button
                      key={sub.code}
                      type="button"
                      onClick={() => toggleSubject(sub.code)}
                      className={`group relative rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isPicked
                          ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${sub.dot}`} />
                        {isPicked && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className={`mt-2 text-xs font-bold ${isPicked ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {sub.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400 font-medium">
                        {loadingCurriculum ? '...' : `${count.toLocaleString('vi-VN')} câu`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Difficulty Level */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="mb-3.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  2. Mức độ nhận thức
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn mức độ mục tiêu hoặc để hệ thống tự điều chỉnh theo năng lực.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const active = selectedDifficulty === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDifficulty(opt.value)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{opt.label}</div>
                      <div className={`text-[10px] mt-1 leading-snug ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Question Count (Up to 60) */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    3. Số lượng câu hỏi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chọn nhanh hoặc kéo thanh trượt (tối thiểu 5 câu, tối đa 60 câu).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-extrabold whitespace-nowrap">
                  {questionCount} / {MAX_QUESTIONS} câu
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {COUNT_PRESETS.map((cnt) => {
                  const active = questionCount === cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                      }`}
                    >
                      {cnt} câu
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <input
                  type="range"
                  min={MIN_QUESTIONS}
                  max={MAX_QUESTIONS}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  aria-label="Chọn số lượng câu hỏi"
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>5 câu</span>
                  <span>20 câu</span>
                  <span>40 câu</span>
                  <span>60 câu (Tối đa)</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Launch Summary Column */}
          <aside className="lg:col-span-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tóm tắt phiên Quiz</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Chấm điểm & giải thích tức thì</p>
                </div>
                {!isEmbedded && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500 shrink-0">Môn học</dt>
                  <dd className="font-semibold text-slate-900 text-right">{selectedSubjectsLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Mức độ</dt>
                  <dd className="font-semibold text-slate-900">{selectedDiffObj.label}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Số câu hỏi</dt>
                  <dd className="font-extrabold text-indigo-600">{questionCount} câu</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Thời gian dự kiến</dt>
                  <dd className="font-semibold text-slate-700 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ~{estimatedMinutes} phút
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                  <dt className="text-slate-500">Kho câu phù hợp</dt>
                  <dd className="font-semibold text-emerald-700">
                    {loadingCurriculum
                      ? 'Đang nạp...'
                      : `${availableQuestionEstimate.toLocaleString('vi-VN')} câu (${filteredPatterns.length} dạng)`}
                  </dd>
                </div>
              </dl>

              {loadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loadError}</span>
                </div>
              )}

              <button
                type="button"
                disabled={loadingItems || loadingCurriculum}
                onClick={handleStartPractice}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingItems ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo đề {questionCount} câu...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Bắt đầu làm {questionCount} câu</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 2: CLEAN INTERACTIVE PRACTICE STUDIO                */}
      {/* ========================================================= */}
      {stage === 'practice' && currentItem && (
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            {/* Top Session Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStage('setup')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Đổi cấu hình</span>
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold">
                  Câu {itemIndex + 1} / {quizItems.length}
                </span>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${(BLOOM_BADGE[currentItem.bloom] || BLOOM_BADGE[2]).cls}`}>
                  {(BLOOM_BADGE[currentItem.bloom] || BLOOM_BADGE[2]).label}
                </span>
                <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                  {SUBJECT_LABEL_MAP[currentItem.subjectCode] || ''} · {currentItem.skill}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                {consecutiveCorrect >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
                    {consecutiveCorrect} liên tiếp
                  </span>
                )}
                <span className="text-slate-500">
                  Đúng: <strong className="text-emerald-600">{correctTotal}</strong>/{Object.keys(answerHistory).length}
                </span>
              </div>
            </div>

            {/* Question Stem (hỗ trợ kéo thả vào Sổ tay Gia sư AI) */}
            <div
              draggable
              onDragStart={(e) => {
                const payload = {
                  questionId: currentItem.id,
                  skill: currentItem.skillName || selectedSkillObj?.name || 'Luyện tập tự chọn',
                  question: currentItem.question || '',
                  options: (currentItem.options || []).map((opt, idx) => `${['A', 'B', 'C', 'D'][idx]}. ${opt}`),
                  selectedWrong: selectedOpt !== null && selectedOpt !== currentItem.correct ? ['A', 'B', 'C', 'D'][selectedOpt] : undefined,
                  correctOption: selectedOpt !== null ? ['A', 'B', 'C', 'D'][currentItem.correct] : undefined,
                };
                e.dataTransfer.setData('application/x-veval-question', JSON.stringify(payload));
                e.dataTransfer.setData('text/plain', payload.question);
              }}
              title="Kéo thả câu hỏi này sang Sổ tay Gia sư AI để được phân tích từng bước"
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-sm sm:text-[15px] font-medium text-slate-900 leading-relaxed cursor-grab active:cursor-grabbing"
            >
              <MathText text={currentItem.question} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentItem.options.map((opt, oIdx) => {
                const letter = ['A', 'B', 'C', 'D'][oIdx];
                const isAnswered = selectedOpt !== null;
                const isSelected = selectedOpt === oIdx;
                const isCorrectOpt = oIdx === currentItem.correct;

                let cardStyle = 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800';
                if (isAnswered) {
                  if (isCorrectOpt) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrectOpt) {
                    cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-200';
                  } else {
                    cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswerSubmit(oIdx)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAnswered && isCorrectOpt
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !isCorrectOpt
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 min-w-0 overflow-x-auto text-sm leading-snug pt-0.5 break-words">
                      <MathText text={opt} />
                    </div>
                    {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                    {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback & Detailed Solution */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  feedback.type === 'correct'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : feedback.type === 'remedial'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-2">
                  {feedback.type === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{feedback.msg}</span>
                </div>
                <div className="pt-2 border-t border-black/10 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Lời giải chi tiết
                  </div>
                  <MathText text={currentItem.explanation} />
                </div>
              </div>
            )}

            {flagNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                {flagNotice}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Báo lỗi &amp; Đổi câu</span>
                </button>
                <MathScratchpadButton
                  text={`${currentItem.skill || ''} ${currentItem.lessonName || ''} ${currentItem.question || ''}`}
                  subjectHint={SUBJECT_LABEL_MAP[currentItem.subjectCode] || ''}
                  className="py-2"
                />
                {onOpenAiTutorWithContext && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAiTutorWithContext({
                        questionContent: currentItem.question,
                        skillName: currentItem.skill,
                        studentChoice: selectedOpt !== null ? ['A', 'B', 'C', 'D'][selectedOpt] : '',
                        correctChoice: ['A', 'B', 'C', 'D'][currentItem.correct],
                        explanation: currentItem.explanation
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Hỏi Gia sư AI</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={selectedOpt === null}
                onClick={handleNextItem}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
              >
                <span>{itemIndex < quizItems.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FlagQuestionModal
            isOpen={flagModalOpen}
            onClose={() => setFlagModalOpen(false)}
            onConfirm={handleConfirmFlag}
            questionPreview={currentItem?.question}
            busy={flagBusy}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 3: SUMMARY REPORT                                   */}
      {/* ========================================================= */}
      {stage === 'summary' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Hoàn Thành Phiên Luyện Tập</h3>
            <p className="text-xs text-slate-500 mt-1">
              Kết quả đã được lưu vào Lịch sử làm bài.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-medium text-slate-500">Số câu đúng</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {correctTotal}/{quizItems.length}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-medium text-slate-500">Độ chính xác</div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                {accuracyPct}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-medium text-slate-500">Độ nắm vững</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {Math.round(bktMastery * 100)}%
              </div>
            </div>
          </div>

          {subjectBreakdown.length > 1 && (
            <div className="max-w-lg mx-auto text-left rounded-xl border border-slate-200/80 p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-700">Kết quả theo từng môn</div>
              <div className="grid grid-cols-2 gap-2">
                {subjectBreakdown.map((sb) => (
                  <div key={sb.code} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50">
                    <span className="font-medium text-slate-700">{sb.label}</span>
                    <span className="font-bold text-slate-900">{sb.correct}/{sb.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {remedialNodeActive && (
            <div className="max-w-lg mx-auto p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Gợi ý: Bạn có thể xem lại phần <strong>Kiến thức nền</strong> hoặc <strong>Luyện tập (P-L-A-R)</strong> để củng cố các dạng bài vừa sai.
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStage('setup')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tạo bộ Quiz mới</span>
            </button>
            {!isEmbedded && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return <div className="w-full max-w-6xl mx-auto py-1">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
        {content}
      </div>
    </div>
  );
}
