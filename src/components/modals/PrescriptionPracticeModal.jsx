import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bot,
  Award,
  RefreshCw,
  Target,
  TrendingUp
} from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

function formatDifficultyLabel(difficultyB) {
  const b = Number(difficultyB ?? 0.35);
  if (b < 0.25) return 'Mức độ: Cơ bản';
  if (b <= 0.6) return 'Mức độ: Vận dụng';
  return 'Mức độ: Nâng cao';
}

export default function PrescriptionPracticeModal({
  isOpen,
  onClose,
  prescription,
  studentId,
  onRemedySuccess,
  onOpenAiTutorWithContext
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [timeMap, setTimeMap] = useState({});
  const [result, setResult] = useState(null);

  const questionStartRef = useRef(Date.now());

  const patternId = prescription?.patternId || prescription?.pattern_id || 'PAT_TOAN_LOGIC_01';
  const patternName =
    prescription?.patternName || prescription?.pattern_name || 'Chuyên đề ôn tập trọng tâm';
  const deltaScore = Number(prescription?.deltaScore ?? prescription?.delta_score ?? 25);

  const loadSession = async () => {
    setLoading(true);
    setResult(null);
    setCurrentIdx(0);
    setAnswersMap({});
    setTimeMap({});
    questionStartRef.current = Date.now();
    try {
      const data = await practiceService.getPrescriptionPracticeSession(patternId, studentId);
      setSession(data);
    } catch (err) {
      toast.error(err?.message || 'Không thể tải bài luyện tập lúc này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patternId) {
      loadSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patternId, studentId]);

  if (!isOpen) return null;

  const questions = session?.questions || [];
  const activeQuestion = questions[currentIdx] || null;
  const answeredCount = Object.keys(answersMap).length;

  const recordElapsedForActive = () => {
    if (!activeQuestion) return;
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setTimeMap((prev) => ({
      ...prev,
      [activeQuestion.questionId]: (prev[activeQuestion.questionId] || 0) + elapsedSec
    }));
    questionStartRef.current = Date.now();
  };

  const handleSelectOption = (optionId) => {
    if (!activeQuestion || result) return;
    setAnswersMap((prev) => ({
      ...prev,
      [activeQuestion.questionId]: optionId
    }));
  };

  const handleNavigate = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= questions.length) return;
    recordElapsedForActive();
    setCurrentIdx(nextIdx);
  };

  const handleSubmitSession = async () => {
    if (questions.length === 0 || submitting) return;
    recordElapsedForActive();
    setSubmitting(true);

    try {
      const elapsedNow = activeQuestion
        ? Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000))
        : 10;

      const formattedAnswers = questions.map((q) => ({
        questionId: q.questionId,
        selectedOption: answersMap[q.questionId] || 'A',
        timeSpentSeconds:
          (timeMap[q.questionId] || 0) + (q.questionId === activeQuestion?.questionId ? elapsedNow : 15)
      }));

      const res = await practiceService.submitPrescriptionPracticeSession(
        patternId,
        {
          sessionId: session?.sessionId,
          answers: formattedAnswers
        },
        studentId
      );

      setResult(res);

      if (res?.isMastered) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignore canvas-confetti errors in headless environments
        }
        toast.success(
          `Tuyệt vời! Bạn đã hoàn thành chủ đề này và tích lũy thêm +${res?.pointsRecovered || deltaScore} điểm dự kiến!`
        );
        if (onRemedySuccess) onRemedySuccess(res);
      } else {
        toast.warning(
          'Bạn cần làm đúng ít nhất 2/3 số câu để hoàn thành chủ đề. Hãy xem lại câu sai cùng Gia sư AI nhé!'
        );
      }
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi nộp bài luyện tập.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskTutorOnQuestion = (q) => {
    if (!onOpenAiTutorWithContext) return;
    const chosen = answersMap[q.questionId] || 'A';
    const correctKey = result?.questionKeyMap?.[q.questionId] || null;
    const optionsDict = {};
    (q.options || []).forEach((opt) => {
      optionsDict[opt.optionId] = opt.content;
    });

    onOpenAiTutorWithContext({
      questionId: q.questionId,
      skillId: prescription?.skillId || prescription?.skill_id || null,
      skill: patternName,
      question: q.content,
      options: optionsDict,
      studentWrongOption: chosen,
      correctOption: correctKey
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Bài luyện tập tăng điểm nhanh
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold">
                Mục tiêu tăng thêm: +{session?.targetDeltaScore ?? deltaScore}đ
              </span>
            </div>
            <h3 className="text-base lg:text-lg font-extrabold truncate">{patternName}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="text-sm font-extrabold text-slate-800">
                Đang chuẩn bị bộ câu hỏi ôn tập...
              </div>
              <p className="text-xs text-slate-500">
                Hệ thống đang chọn các câu hỏi vừa sức giúp bạn nắm chắc chủ đề này
              </p>
            </div>
          ) : result ? (
            /* POST-SUBMISSION RESULT */
            <div className="space-y-5">
              <div
                className={`p-5 rounded-2xl border-2 ${
                  result.isMastered
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        result.isMastered
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {result.isMastered ? <Award className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                    </div>
                    <div>
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wider ${
                          result.isMastered ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {result.isMastered
                          ? 'Đã nắm vững chủ đề • Hoàn thành mục tiêu'
                          : 'Cần ôn thêm để nắm chắc chủ đề'}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-0.5">
                        Đúng {result.correctCount}/{result.totalQuestions} câu (
                        {Math.round((result.accuracy || 0) * 100)}%)
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {result.isMastered
                          ? 'Chúc mừng bạn đã vượt qua bài luyện tập và cải thiện điểm dự kiến!'
                          : 'Đừng lo lắng, hãy xem lại các câu chưa đúng bên dưới hoặc hỏi Gia sư AI để hiểu rõ cách giải nhé.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 shrink-0">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Độ nắm vững</div>
                      <div className="text-sm font-black text-indigo-700 mt-0.5 flex items-center justify-center gap-1">
                        <span>{Math.round((result.previousMasteryPlt || 0.42) * 100)}%</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">
                          {Math.round((result.newMasteryPlt || 0.75) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Điểm cộng thêm</div>
                      <div className="text-sm font-black text-emerald-600 mt-0.5">
                        +{result.pointsRecovered || 0}đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Review */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Xem lại chi tiết từng câu
                </div>

                {questions.map((q, idx) => {
                  const chosen = answersMap[q.questionId] || 'A';
                  const knownCorrect = result?.questionKeyMap?.[q.questionId] || null;
                  const isCorrect = knownCorrect ? chosen === knownCorrect : null;

                  return (
                    <div
                      key={q.questionId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-extrabold">
                            Câu {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            Bạn chọn: <strong className="text-indigo-700">{chosen}</strong>
                            {knownCorrect ? (
                              <>
                                {' '}
                                • Đáp án đúng: <strong className="text-emerald-700">{knownCorrect}</strong>
                              </>
                            ) : null}
                          </span>
                          {isCorrect === true && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                            </span>
                          )}
                          {isCorrect === false && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600">
                              <XCircle className="w-3.5 h-3.5" /> Cần xem lại
                            </span>
                          )}
                        </div>

                        {onOpenAiTutorWithContext && (
                          <button
                            onClick={() => handleAskTutorOnQuestion(q)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Bot className="w-3.5 h-3.5 text-amber-300" />
                            <span>Hỏi Gia sư AI câu này</span>
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                        <MathText text={q.content} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeQuestion ? (
            /* ACTIVE PRACTICE RUNNER */
            <div className="space-y-5">
              {/* Question Navigator Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answersMap[q.questionId]);
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => handleNavigate(idx)}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all border ${
                          isCurrent
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : isAnswered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Thời gian gợi ý: {session?.suggestedDurationMinutes || 12} phút
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                    Đã chọn {answeredCount}/{questions.length} câu
                  </span>
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                    Câu {currentIdx + 1} / {questions.length}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {formatDifficultyLabel(activeQuestion.difficultyB)}
                  </span>
                </div>
                <div className="text-sm text-slate-900 font-medium leading-relaxed">
                  <MathText text={activeQuestion.content} />
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {(activeQuestion.options || []).map((opt) => {
                  const isSelected = answersMap[activeQuestion.questionId] === opt.optionId;
                  return (
                    <button
                      key={opt.optionId}
                      type="button"
                      onClick={() => handleSelectOption(opt.optionId)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {opt.optionId}
                      </span>
                      <div className="text-xs lg:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">
                        <MathText text={opt.content} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              Không tìm thấy câu hỏi cho chủ đề này.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {result ? (
            <>
              {!result.isMastered ? (
                <button
                  onClick={loadSession}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm bộ câu hỏi khác</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã cập nhật trực tiếp vào điểm dự kiến của bạn!
                </span>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all ml-auto"
              >
                Hoàn tất & Quay lại
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate(currentIdx - 1)}
                  disabled={currentIdx === 0}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Câu trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate(currentIdx + 1)}
                  disabled={currentIdx >= questions.length - 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <span>Câu tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitSession}
                disabled={submitting || answeredCount === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang chấm bài...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nộp bài ({answeredCount}/{questions.length})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
