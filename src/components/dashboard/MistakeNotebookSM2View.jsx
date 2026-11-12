import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  RefreshCw,
  Play,
  ArrowRight,
  Bot,
  Award,
  Flame,
  X
} from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

const COGNITIVE_TAG_META = {
  CARELESS: {
    label: 'Tính nhẩm sai / Biến đổi nhầm dấu',
    shortLabel: 'Tính ẩu',
    cls: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  MISREAD_QUESTION: {
    label: 'Đọc thiếu dữ kiện / Nhầm yêu cầu đề bài',
    shortLabel: 'Đọc sót đề',
    cls: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  MISSING_CONCEPT: {
    label: 'Chưa nắm vững công thức / Lý thuyết gốc',
    shortLabel: 'Chưa vững lý thuyết',
    cls: 'bg-rose-100 text-rose-700 border-rose-200'
  }
};

export default function MistakeNotebookSM2View({
  currentUser,
  onOpenAiTutorWithContext
}) {
  const [notebookData, setNotebookData] = useState(null);
  const [dailyReviewData, setDailyReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [masteryFilter, setMasteryFilter] = useState('ALL'); // 'ALL' | 'UNMASTERED' | 'MASTERED'
  const [tagFilter, setTagFilter] = useState('ALL'); // 'ALL' | 'CARELESS' | 'MISREAD_QUESTION' | 'MISSING_CONCEPT'

  // Active SM-2 Review Runner State
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const questionStartRef = useRef(Date.now());

  // Metacognition Tagging Modal State
  const [tagModalItem, setTagModalItem] = useState(null);
  const [editTag, setEditTag] = useState('MISSING_CONCEPT');
  const [editNotes, setEditNotes] = useState('');
  const [savingTag, setSavingTag] = useState(false);

  const studentId = currentUser?.id;

  const loadNotebookAndDue = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const isMasteredParam =
          masteryFilter === 'UNMASTERED' ? false : masteryFilter === 'MASTERED' ? true : null;

        const [nbRes, dueRes] = await Promise.all([
          practiceService.getMistakeNotebook({
            studentId,
            cognitiveErrorTag: tagFilter === 'ALL' ? null : tagFilter,
            isMastered: isMasteredParam,
            pageIndex: 1,
            pageSize: 20
          }),
          practiceService.getDailyMistakeReview({ studentId })
        ]);

        setNotebookData(nbRes);
        setDailyReviewData(dueRes);
      } finally {
        setLoading(false);
      }
    },
    [studentId, masteryFilter, tagFilter]
  );

  useEffect(() => {
    loadNotebookAndDue(false);
  }, [loadNotebookAndDue]);

  useEffect(() => {
    const handleSync = () => loadNotebookAndDue(true);
    window.addEventListener('veval:flow6-updated', handleSync);
    return () => window.removeEventListener('veval:flow6-updated', handleSync);
  }, [loadNotebookAndDue]);

  const dueQuestions = dailyReviewData?.questions || [];
  const activeReviewQ = dueQuestions[reviewIdx] || null;
  const items = notebookData?.items || [];

  const handleStartReviewSession = () => {
    if (dueQuestions.length === 0) {
      toast.info('Hôm nay chưa có câu hỏi nào đến lịch ôn lại! Em có thể xem lại các câu đã lưu bên dưới.');
      return;
    }
    setReviewIdx(0);
    setSelectedOption(null);
    setReviewFeedback(null);
    questionStartRef.current = Date.now();
    setIsReviewMode(true);
  };

  const handleSubmitReviewAnswer = async () => {
    if (!activeReviewQ || !selectedOption || submittingReview) return;
    setSubmittingReview(true);
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));

    try {
      const res = await practiceService.submitDailyMistakeReview(activeReviewQ.mistakeNotebookId, {
        selectedOption,
        timeSpentSeconds: elapsedSec
      });
      setReviewFeedback(res);

      if (res?.isMastered) {
        try {
          confetti({ particleCount: 80, spread: 65, origin: { y: 0.65 } });
        } catch {
          // Ignore confetti errors in headless mode
        }
        toast.success('Tuyệt vời! Em đã làm đúng 3 lần liên tiếp và nắm vững dạng bài này!');
      } else if (res?.isCorrect) {
        toast.success('Chính xác! Đã cập nhật lịch hẹn ôn lại tiếp theo.');
      } else {
        toast.warning('Chưa chính xác! Hệ thống sẽ nhắc em ôn lại câu này vào ngày mai.');
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể nộp câu trả lời ôn tập.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleNextReviewQuestion = async () => {
    if (reviewIdx + 1 < dueQuestions.length) {
      setReviewIdx((prev) => prev + 1);
      setSelectedOption(null);
      setReviewFeedback(null);
      questionStartRef.current = Date.now();
    } else {
      setIsReviewMode(false);
      setReviewFeedback(null);
      setSelectedOption(null);
      await loadNotebookAndDue(true);
      toast.success('Đã hoàn thành toàn bộ bài ôn tập đến hạn hôm nay!');
    }
  };

  const handleOpenTagModal = (item) => {
    setTagModalItem(item);
    setEditTag(item.cognitiveErrorTag || 'MISSING_CONCEPT');
    setEditNotes(item.studentNotes || '');
  };

  const handleSaveCognitiveTag = async (e) => {
    e.preventDefault();
    if (!tagModalItem || savingTag) return;
    setSavingTag(true);
    try {
      await practiceService.tagMistakeCognitiveError(tagModalItem.id, {
        cognitiveErrorTag: editTag,
        studentNotes: editNotes
      });
      toast.success('Đã lưu ghi chú lý do làm sai!');
      setTagModalItem(null);
      await loadNotebookAndDue(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể lưu ghi chú.');
    } finally {
      setSavingTag(false);
    }
  };

  const handleAskSocraticOnReview = () => {
    if (!activeReviewQ || !onOpenAiTutorWithContext) return;
    const optsDict = {};
    (activeReviewQ.options || []).forEach((o) => {
      optsDict[o.key] = o.text;
    });
    onOpenAiTutorWithContext({
      questionId: activeReviewQ.reviewQuestionId || activeReviewQ.originalQuestionId,
      skillId: activeReviewQ.skillId,
      skill: activeReviewQ.skillName,
      question: activeReviewQ.content,
      options: optsDict,
      studentWrongOption: selectedOption || 'A',
      correctOption: reviewFeedback?.correctOption || null
    });
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 lg:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/35 text-purple-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Sổ tay ôn tập thông minh
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/35 text-amber-200 text-[10px] font-extrabold">
              Làm đúng 3 lần liên tiếp = Nắm vững hoàn toàn
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Sổ Tay Câu Làm Sai & Lịch Nhắc Ôn Tập Định Kỳ
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Ghi chú lại nguyên nhân làm sai (tính ẩu, đọc sót đề hay chưa vững lý thuyết) và luyện lại các câu hỏi tương tự đúng thời điểm để nhớ lâu trước kỳ thi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => loadNotebookAndDue(false)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới danh sách</span>
          </button>

          <button
            type="button"
            onClick={handleStartReviewSession}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Ôn Lại Hôm Nay ({dailyReviewData?.totalDueQuestions ?? dueQuestions.length} câu)</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Cần ôn lại hôm nay</div>
          <div className="text-3xl font-black text-amber-600 mt-1 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>{dailyReviewData?.totalDueQuestions ?? dueQuestions.length}</span>
            <span className="text-xs font-bold text-slate-400">câu hỏi</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Đang theo dõi ôn lại</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">
            {notebookData?.unmasteredCount ?? 0}
            <span className="text-xs font-bold text-slate-400 ml-1.5">câu hỏi</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Đã nắm vững (đúng 3 lần)</div>
          <div className="text-3xl font-black text-emerald-600 mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-500" />
            <span>{notebookData?.masteredCount ?? 0}</span>
            <span className="text-xs font-bold text-slate-400">dạng bài</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Tổng số câu trong sổ tay</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {(notebookData?.masteredCount ?? 0) + (notebookData?.unmasteredCount ?? 0)}
            <span className="text-xs font-bold text-slate-400 ml-1.5">câu hỏi</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SM-2 DAILY REVIEW RUNNER */}
      {isReviewMode && activeReviewQ && (
        <div className="bg-white rounded-3xl border-2 border-indigo-500 shadow-xl overflow-hidden animate-fade">
          <div className="px-6 py-4 bg-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black">
                Câu {reviewIdx + 1} / {dueQuestions.length}
              </span>
              <span className="text-sm font-extrabold">{activeReviewQ.skillName}</span>
              {activeReviewQ.isIsomorphicVariant && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[10px] font-bold">
                  Câu hỏi tương tự cùng dạng
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsReviewMode(false)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tạm dừng phiên</span>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Past Reflection Reminder */}
            {activeReviewQ.studentNotes && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Ghi chú tự nhắc từ lần sai trước:</strong> {activeReviewQ.studentNotes}
                </div>
              </div>
            )}

            {/* Question Stem */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-medium leading-relaxed">
              <MathText text={activeReviewQ.content} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(activeReviewQ.options || []).map((opt) => {
                const isChosen = selectedOption === opt.key;
                const isCorrectOpt = reviewFeedback && reviewFeedback.correctOption === opt.key;
                const isWrongChosen = reviewFeedback && isChosen && !reviewFeedback.isCorrect;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={Boolean(reviewFeedback)}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                      isCorrectOpt
                        ? 'border-emerald-500 bg-emerald-50'
                        : isWrongChosen
                          ? 'border-rose-500 bg-rose-50'
                          : isChosen
                            ? 'border-indigo-600 bg-indigo-50/70'
                            : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                        isCorrectOpt
                          ? 'bg-emerald-600 text-white'
                          : isWrongChosen
                            ? 'bg-rose-600 text-white'
                            : isChosen
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <div className="text-xs lg:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">
                      <MathText text={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SM-2 Feedback Box */}
            {reviewFeedback && (
              <div
                className={`p-5 rounded-2xl border-2 space-y-3 ${
                  reviewFeedback.isCorrect
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {reviewFeedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-sm font-black text-slate-900">{reviewFeedback.message}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-700">
                      Số lần đúng liên tiếp: {reviewFeedback.consecutiveCorrectReviews}/3
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      Hẹn ôn lại sau: {reviewFeedback.intervalDays} ngày
                    </span>
                  </div>
                </div>

                {reviewFeedback.explanation && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    <strong className="text-indigo-700 block mb-1">Lời giải chi tiết:</strong>
                    <MathText text={reviewFeedback.explanation} />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {onOpenAiTutorWithContext && (
                    <button
                      type="button"
                      onClick={handleAskSocraticOnReview}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <Bot className="w-4 h-4 text-amber-300" />
                      <span>Hỏi Gia sư AI giải thích thêm</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextReviewQuestion}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 ml-auto"
                  >
                    <span>
                      {reviewIdx + 1 < dueQuestions.length ? 'Sang Câu Tiếp Theo' : 'Hoàn Tất Bài Ôn Hôm Nay'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!reviewFeedback && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!selectedOption || submittingReview}
                  onClick={handleSubmitReviewAnswer}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingReview ? 'Đang chấm bài...' : 'Kiểm Tra Đáp Án'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MISTAKE NOTEBOOK LIST & FILTERS */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base lg:text-lg font-extrabold text-slate-900">
              Danh Sách Các Câu Từng Làm Sai & Lịch Ôn Lại
            </h2>
            <p className="text-xs text-slate-500">
              Khi em làm đúng lại cùng một dạng bài 3 lần liên tiếp, hệ thống sẽ tự động đánh dấu Đã nắm vững.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UNMASTERED', label: 'Đang cần ôn lại' },
              { id: 'MASTERED', label: 'Đã nắm vững' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setMasteryFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  masteryFilter === st.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="ALL">Mọi lý do làm sai</option>
              <option value="MISSING_CONCEPT">Chưa vững lý thuyết</option>
              <option value="CARELESS">Tính ẩu / Nhầm dấu</option>
              <option value="MISREAD_QUESTION">Đọc sót đề</option>
            </select>
          </div>
        </div>

        {loading && !notebookData ? (
          <div className="py-10 text-center text-xs text-slate-500">Đang tải sổ tay câu làm sai...</div>
        ) : items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
            Chưa có câu làm sai nào trong mục lọc này.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => {
              const tagMeta = COGNITIVE_TAG_META[item.cognitiveErrorTag] || null;
              const isDueNow = !item.isMastered && new Date(item.nextReviewDate).getTime() <= Date.now();
              const streakCount = Math.min(3, Number(item.consecutiveCorrectReviews || 0));

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all ${
                    item.isMastered
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isDueNow
                        ? 'border-amber-300 bg-amber-50/35'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tagMeta ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${tagMeta.cls}`}>
                            {tagMeta.shortLabel}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                            Chưa ghi lý do sai
                          </span>
                        )}
                      </div>

                      {item.isMastered ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                          Đã nắm vững (3/3)
                        </span>
                      ) : isDueNow ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                          Cần ôn lại hôm nay
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5 text-indigo-500" />
                          Hẹn ôn: {new Date(item.nextReviewDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900">{item.skillName}</h3>

                    {item.questionContent && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                        <MathText text={item.questionContent} />
                      </div>
                    )}

                    {item.studentNotes && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950 font-medium">
                        <strong>Ghi chú tự nhắc:</strong> {item.studentNotes}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1" title="Số lần làm đúng lại liên tiếp">
                        {[0, 1, 2].map((step) => (
                          <span
                            key={step}
                            className={`w-2.5 h-2.5 rounded-full ${
                              step < streakCount ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                        <span className="ml-1">Đúng {streakCount}/3 lần</span>
                      </span>
                      <span>Nhắc lại mỗi {item.intervalDays || 1} ngày</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenTagModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-extrabold flex items-center gap-1.5 transition-all"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Ghi chú lý do sai</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOTE / TAG MODAL */}
      {tagModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Ghi chú rút kinh nghiệm
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{tagModalItem.skillName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setTagModalItem(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCognitiveTag} className="space-y-3.5">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  Vì sao em làm sai câu này?
                </label>
                {Object.entries(COGNITIVE_TAG_META).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditTag(key)}
                    className={`w-full text-left p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      editTag === key
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Ghi chú nhắc bản thân cho lần sau:
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Nhớ đặt điều kiện cơ số logarit và kiểm tra tổng thể tích sau khi trộn dung dịch..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTagModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingTag}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {savingTag ? 'Đang lưu...' : 'Lưu Ghi Chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

