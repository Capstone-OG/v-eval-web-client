import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  X,
  AlertCircle,
  Bot,
  RefreshCw,
  SlidersHorizontal,
  Play,
  Award,
  Sparkles,
  BookOpen,
  Flag
} from 'lucide-react';
import MathText from '../common/MathText';
import FlagQuestionModal from '../common/FlagQuestionModal';
import { addFlaggedQuestion, getFlaggedQuestionIdSet } from '../../utils/questionFlagStore';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';

const SUBJECT_FILTERS = [
  { code: 'ALL', label: 'Tất cả 8 môn V-ACT' },
  { code: 'MATH', label: 'Toán học' },
  { code: 'PHYS', label: 'Vật lí' },
  { code: 'CHEM', label: 'Hóa học' },
  { code: 'BIO', label: 'Sinh học' },
  { code: 'LIT', label: 'Ngữ văn' },
  { code: 'ENG', label: 'Tiếng Anh' },
  { code: 'HIST', label: 'Lịch sử' },
  { code: 'GEO', label: 'Địa lí' }
];

const DIFFICULTY_OPTIONS = [
  { value: 0, label: 'Thích ứng tự động (ZPD)' },
  { value: 1, label: 'Nhận biết' },
  { value: 2, label: 'Thông hiểu' },
  { value: 3, label: 'Vận dụng cơ bản' },
  { value: 4, label: 'Vận dụng cao' }
];

const BLOOM_BADGE = {
  1: { label: 'Nhận biết', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  2: { label: 'Thông hiểu', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  3: { label: 'Vận dụng cơ bản', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  4: { label: 'Vận dụng cao', cls: 'bg-sky-50 text-sky-700 border-sky-200' }
};

const COUNT_OPTIONS = [5, 10, 15, 20];

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

  // Setup filters
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);

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

  // Load real curriculum pattern pool once when modal opens
  useEffect(() => {
    if (!isOpen) return;
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
                const sub = subFromCh !== 'OTHER' ? subFromCh : detectSubjectCode(`${les.name || ''} ${pat.name || ''} ${domTitle}`);
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
  }, [isOpen]);

  const filteredPatterns = useMemo(() => {
    if (selectedSubject === 'ALL') return curriculumPatterns;
    return curriculumPatterns.filter((p) => p.subjectCode === selectedSubject);
  }, [curriculumPatterns, selectedSubject]);

  const availableQuestionEstimate = useMemo(() => {
    return filteredPatterns.reduce((acc, p) => acc + (p.questionCount || 0), 0);
  }, [filteredPatterns]);

  if (!isOpen && !isEmbedded) return null;

  const handleStartPractice = async () => {
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
      const pickedSkills = candidates.slice(0, Math.min(candidates.length, Math.max(8, Math.ceil(questionCount * 1.2))));

      const responses = await Promise.all(
        pickedSkills.map((sk) =>
          contentService
            .getQuestionsBySkill(sk.skillId)
            .then((res) => {
              const rawList = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
              return rawList.map((q) => ({ q, sk }));
            })
            .catch(() => [])
        )
      );

      let flat = responses.flat();
      // Filter by requested difficulty if specified
      if (selectedDifficulty > 0) {
        const exactDiff = flat.filter(({ q }) => Number(q.difficultyLevel || 2) === selectedDifficulty);
        if (exactDiff.length >= Math.min(questionCount, 3)) {
          flat = exactDiff;
        }
      }

      const uniqueMap = new Map();
      shuffleArray(flat).forEach(({ q, sk }) => {
        const qid = String(q.questionId || q.id || '');
        if (!qid || uniqueMap.has(qid)) return;
        const opts = Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
          : [q.optionA || '', q.optionB || '', q.optionC || '', q.optionD || ''];
        const corrLetter = String(q.correctOption || 'A').trim().toUpperCase().slice(0, 1);
        const corrIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(corrLetter));
        uniqueMap.set(qid, {
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
        });
      });

      const flaggedSet = getFlaggedQuestionIdSet();
      const allUnique = Array.from(uniqueMap.values()).filter((it) => !flaggedSet.has(it.id));
      const finalItems = allUnique.slice(0, questionCount);
      if (finalItems.length === 0) {
        setLoadError('Chưa tìm thấy câu hỏi phù hợp cho bộ lọc này. Hãy thử chọn "Tất cả 8 môn V-ACT" hoặc mức độ "Thích ứng tự động".');
        setLoadingItems(false);
        return;
      }

      setQuizItems(finalItems);
      setExtraQuestionPool(allUnique.slice(questionCount));
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
      subjectName: SUBJECT_FILTERS.find((s) => s.code === currentItem.subjectCode)?.label || 'Luyện tập ZPD',
      questionContent: currentItem.question,
      options: currentItem.options,
      correctOption: ['A', 'B', 'C', 'D'][currentItem.correct] || 'A',
      explanation: currentItem.explanation,
      difficultyLevel: currentItem.bloom,
      reasonCode,
      note,
      sourcePage: 'Luyện tập Thích ứng ZPD'
    });

    const usedIds = new Set([...quizItems.map((x) => x.id), ...getFlaggedQuestionIdSet()]);
    let replacement = extraQuestionPool.find((x) => !usedIds.has(x.id));
    if (replacement) {
      setExtraQuestionPool((prev) => prev.filter((x) => x.id !== replacement.id));
    } else {
      // Fetch fresh replacement from another skill in current subject filter
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
      setFlagNotice('Đã gửi báo lỗi tới Giảng viên / Ban quản lý và tự động đổi sang câu hỏi mới!');
    } else {
      setFlagNotice('Đã gửi báo lỗi tới Giảng viên / Ban quản lý để xét duyệt lại miền kiến thức.');
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
        msg: `Chính xác! Độ nắm vững tăng lên ${Math.round(newMastery * 100)}%.`
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
          msg: 'Bạn vừa sai 3 câu liên tiếp — hãy đọc kỹ lời giải chi tiết hoặc hỏi Gia sư AI để củng cố nền tảng trước khi sang câu tiếp theo.'
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
          domain_name: SUBJECT_FILTERS.find((s) => s.code === item.subjectCode)?.label || 'Luyện tập ZPD',
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
      const subLabel = SUBJECT_FILTERS.find((s) => s.code === selectedSubject)?.label || 'Tổng hợp';
      practiceService.saveSubmissionToHistory({
        id: `zpd_${Date.now()}`,
        title: `Luyện tập Thích ứng ZPD • ${subLabel} (${quizItems.length} câu)`,
        examType: 'ZPD_QUIZ',
        completedAt: new Date().toISOString(),
        theta_0: Number((bktMastery - 0.25).toFixed(2)),
        placement_class: bktMastery >= 0.8 ? 'BREAKTHROUGH' : bktMastery >= 0.55 ? 'ACCELERATION' : 'FOUNDATION',
        ai_commentary: `Hoàn thành ${correctCount}/${quizItems.length} câu đúng (${Math.round((correctCount / Math.max(1, quizItems.length)) * 100)}%) với độ nắm vững BKT đạt ${Math.round(bktMastery * 100)}%.`,
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

  const innerCard = (
    <div className={isEmbedded
      ? 'bg-white rounded-3xl shadow-xs border border-slate-200 w-full flex flex-col overflow-hidden'
      : 'bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden'
    }>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                Luyện Tập Thích Ứng ZPD (Chuẩn GDPT 2018)
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Ngân hàng câu hỏi chuẩn V-ACT có lời giải từng bước & theo dõi độ nắm vững BKT
              </p>
            </div>
          </div>
          {!isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {stage === 'setup' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-sm font-black text-emerald-950">
                      Kho câu hỏi sẵn sàng: {loadingCurriculum ? 'Đang nạp...' : `${availableQuestionEstimate.toLocaleString('vi-VN')} câu hỏi`}
                    </div>
                    <div className="text-xs text-emerald-800">
                      Phủ {filteredPatterns.length} dạng bài trọng tâm chuẩn SGK Chân trời sáng tạo
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Chấm điểm & Giải thích tức thì
                </span>
              </div>

              {/* Subject Grid */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                  1. Chọn môn học luyện tập
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SUBJECT_FILTERS.map((sub) => {
                    const active = selectedSubject === sub.code;
                    return (
                      <button
                        key={sub.code}
                        type="button"
                        onClick={() => setSelectedSubject(sub.code)}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2.5">
                    2. Mức độ nhận thức
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedDifficulty(opt.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedDifficulty === opt.value
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2.5">
                    3. Số câu hỏi mỗi phiên
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COUNT_OPTIONS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQuestionCount(cnt)}
                        className={`px-4 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          questionCount === cnt
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cnt} câu
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={loadingItems || loadingCurriculum}
                  onClick={handleStartPractice}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingItems ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{loadingItems ? 'Đang chọn câu hỏi thích ứng...' : `Bắt đầu luyện ${questionCount} câu ngay`}</span>
                </button>
              </div>
            </div>
          )}

          {stage === 'practice' && currentItem && (
            <div className="space-y-5">
              {/* Top Telemetry Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-black">
                    Câu {itemIndex + 1} / {quizItems.length}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${(BLOOM_BADGE[currentItem.bloom] || BLOOM_BADGE[2]).cls}`}>
                    {(BLOOM_BADGE[currentItem.bloom] || BLOOM_BADGE[2]).label}
                  </span>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-xs">
                    {currentItem.skill}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  {consecutiveCorrect >= 2 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      🔥 Chuỗi {consecutiveCorrect} câu đúng
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Nắm vững:</span>
                    <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${Math.round(bktMastery * 100)}%` }}
                      />
                    </div>
                    <span className="text-emerald-700 font-black">{Math.round(bktMastery * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-sm sm:text-[15px] font-medium text-slate-900 leading-relaxed">
                <MathText text={currentItem.question} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentItem.options.map((opt, oIdx) => {
                  const letter = ['A', 'B', 'C', 'D'][oIdx];
                  const isAnswered = selectedOpt !== null;
                  const isSelected = selectedOpt === oIdx;
                  const isCorrectOpt = oIdx === currentItem.correct;

                  let cardStyle = 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800';
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrectOpt) {
                      cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200';
                    } else {
                      cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-500 opacity-75';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
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
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : feedback.type === 'remedial'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="text-xs font-black flex items-center gap-2">
                    {feedback.type === 'correct' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                  <div className="pt-2 border-t border-black/10 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Lời giải chi tiết:
                    </div>
                    <MathText text={currentItem.explanation} />
                  </div>
                </div>
              )}

              {/* Bottom Action Row */}
              {flagNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  {flagNotice}
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(true)}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Báo lỗi &amp; Đổi câu</span>
                  </button>
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
                      className="px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Hỏi Gia sư AI câu này</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={selectedOpt === null}
                  onClick={handleNextItem}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>{itemIndex < quizItems.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết phiên luyện tập'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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

          {stage === 'summary' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Hoàn Thành Phiên Luyện Tập!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kết quả đã được lưu tự động vào Lịch sử làm bài của bạn.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-700">Số câu đúng</div>
                  <div className="text-2xl font-black text-emerald-900 mt-0.5">
                    {correctTotal}/{quizItems.length}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-700">Tỷ lệ chính xác</div>
                  <div className="text-2xl font-black text-blue-900 mt-0.5">
                    {Math.round((correctTotal / Math.max(1, quizItems.length)) * 100)}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-700">Độ nắm vững</div>
                  <div className="text-2xl font-black text-amber-900 mt-0.5">
                    {Math.round(bktMastery * 100)}%
                  </div>
                </div>
              </div>

              {remedialNodeActive && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  Gợi ý: Bạn nên quay lại phần <strong>Lý thuyết & Ví dụ mẫu</strong> trong Lộ trình PLAR để củng cố thêm các dạng bài vừa sai.
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('setup')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Luyện bộ câu hỏi mới</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (isEmbedded) {
    return <div className="max-w-5xl mx-auto p-4 sm:p-6">{innerCard}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      {innerCard}
    </div>
  );
}
