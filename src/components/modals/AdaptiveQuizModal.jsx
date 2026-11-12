import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, XCircle, ArrowRight, X, AlertCircle, Bot, FileText, RefreshCw } from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';

export default function AdaptiveQuizModal({ isOpen, onClose, onOpenAiTutorWithContext }) {
  const [bktMastery, setBktMastery] = useState(0.5);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [remedialNodeActive, setRemedialNodeActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const [quizItems, setQuizItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answerHistory, setAnswerHistory] = useState({}); // { [questionId]: selectedOptIndex }

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingItems(true);
    setItemIndex(0);
    setSelectedOpt(null);
    setFeedback(null);
    setAnswerHistory({});
    setQuizFinished(false);

    contentService
      .getExamDetail('11111111-1111-1111-1111-111111111111')
      .then((res) => {
        if (!isMounted) return;
        const single = Array.isArray(res?.single_questions) ? res.single_questions : [];
        const mapped = single.slice(0, 5).map((q, idx) => {
          const rawOpts =
            q.options && typeof q.options === 'object' && !Array.isArray(q.options)
              ? [q.options.A || '', q.options.B || '', q.options.C || '', q.options.D || '']
              : q.options || [];
          const formattedOpts = rawOpts.map((opt, oIdx) => {
            const prefix = ['A', 'B', 'C', 'D'][oIdx] || 'A';
            return String(opt).match(/^[A-D]\.\s*/) ? opt : `${prefix}. ${opt}`;
          });
          const correctLetter = (q.correct_option || q.correctOption || 'A').trim().toUpperCase();
          const correctIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(correctLetter));
          return {
            id: String(q.question_id || q.questionId || `zpd_q_${idx + 1}`),
            skill: q.suggested_skill_name || q.suggestedSkillName || 'Kỹ năng ZPD ĐGNL',
            question: q.content || q.text || '',
            options: formattedOpts,
            correct: correctIdx,
            difficultyB: Number(((Number(q.difficulty_level || 2) - 2) * 0.45).toFixed(2)),
            predictedProb: 0.68,
            explanation: q.explanation || `Đáp án chính xác là phương án ${correctLetter}.`
          };
        });
        setQuizItems(mapped);
      })
      .catch(() => {
        if (isMounted) setQuizItems([]);
      })
      .finally(() => {
        if (isMounted) setLoadingItems(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleItems = quizItems;
  const currentItem = sampleItems[itemIndex] || null;

  const handleAnswerSubmit = (optIdx) => {
    setSelectedOpt(optIdx);
    setAnswerHistory((prev) => ({ ...prev, [currentItem.id]: optIdx }));
    const isCorrect = optIdx === currentItem.correct;

    if (isCorrect) {
      const newMastery = Math.min(0.95, bktMastery + 0.12);
      setBktMastery(newMastery);
      const newConsec = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsec);
      setConsecutiveWrong(0);
      setFeedback({ type: 'correct', msg: `Chính xác! Độ nắm vững chủ đề tăng lên ${(newMastery * 100).toFixed(0)}%.` });
    } else {
      const newMastery = Math.max(0.05, bktMastery - 0.15);
      setBktMastery(newMastery);
      const newWrong = consecutiveWrong + 1;
      setConsecutiveWrong(newWrong);
      setConsecutiveCorrect(0);

      if (newWrong >= 3) {
        setRemedialNodeActive(true);
        setFeedback({ type: 'remedial', msg: 'Em vừa làm sai 3 câu liên tiếp. Hệ thống đã gợi ý thêm bài ôn nền tảng để củng cố kiến thức!' });
      } else {
        setFeedback({ type: 'wrong', msg: `Đã ghi nhận câu trả lời. Độ nắm vững hiện tại là ${(newMastery * 100).toFixed(0)}%.` });
      }
    }
  };

  const handleNextItem = () => {
    setSelectedOpt(null);
    setFeedback(null);
    if (itemIndex < sampleItems.length - 1) {
      setItemIndex(itemIndex + 1);
    } else {
      const reviewedQuestions = sampleItems.map((item, idx) => {
        const chosenIdx = answerHistory[item.id];
        const chosenChar = chosenIdx !== undefined ? ['A', 'B', 'C', 'D'][chosenIdx] : '';
        const correctChar = ['A', 'B', 'C', 'D'][item.correct] || 'B';
        return {
          id: item.id,
          question_number: idx + 1,
          content: item.question,
          options: item.options.map((o) => o.replace(/^[A-D]\.\s*/, '')),
          skill_name: item.skill,
          domain_name: 'Luyện tập theo chủ đề',
          bloom: 2,
          studentChoice: chosenChar,
          correctChoice: correctChar,
          correct: correctChar,
          isCorrect: chosenIdx === item.correct,
          timeSpent: 30,
          explanation: item.explanation
        };
      });
      const correctCount = reviewedQuestions.filter((q) => q.isCorrect).length;
      practiceService.saveSubmissionToHistory({
        id: `zpd_${Date.now()}`,
        title: 'Bài luyện tập chuyên đề',
        examType: 'ZPD_QUIZ',
        completedAt: new Date().toISOString(),
        theta_0: Number((bktMastery - 0.25).toFixed(2)),
        placement_class: bktMastery >= 0.85 ? 'BREAKTHROUGH' : 'ACCELERATION',
        ai_commentary: `Hoàn thành bài luyện tập chuyên đề với độ nắm vững đạt ${(bktMastery * 100).toFixed(0)}%.`,
        reviewedQuestions,
        pacing: {
          totalCorrect: correctCount,
          totalQuestions: sampleItems.length,
          totalTimeSpent: sampleItems.length * 30,
          avgTimePerQ: 30
        }
      });
      setQuizFinished(true);
    }
  };

  const handleAskSocraticForQuestion = (item) => {
    const chosenIdx = answerHistory[item.id];
    onOpenAiTutorWithContext?.({
      questionId: item.id,
      question: item.question,
      options: item.options,
      skill: item.skill,
      selectedWrong: chosenIdx !== undefined && chosenIdx !== item.correct ? item.options[chosenIdx] : null,
      correctOption: item.options[item.correct] || 'B',
      difficultyB: item.difficultyB,
      predictedProb: item.predictedProb
    });
  };

  const handleResetQuiz = () => {
    setItemIndex(0);
    setSelectedOpt(null);
    setFeedback(null);
    setAnswerHistory({});
    setQuizFinished(false);
  };

  const totalCorrectCount = sampleItems.filter(
    (item) => answerHistory[item.id] === item.correct
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Zap className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Bài Luyện Tập Theo Chủ Đề
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Câu hỏi được chọn vừa sức với mức độ nắm vững hiện tại của em
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mastery Gauge */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Độ nắm vững chủ đề:</span>
            <span className="text-lg font-extrabold text-white">{(bktMastery * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mục tiêu qua bài:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              bktMastery >= 0.85 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {bktMastery >= 0.85 ? 'Đạt ≥ 85%' : 'Cần đạt 85%'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {loadingItems ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-600">
                Đang nạp câu hỏi thích ứng ZPD từ Content Service Backend...
              </div>
            </div>
          ) : !currentItem ? (
            <div className="py-10 text-center space-y-3">
              <div className="text-xs font-bold text-slate-600">
                Chưa có câu hỏi ZPD từ Backend Content Service. Vui lòng kiểm tra kết nối Gateway (:5212).
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          ) : !quizFinished ? (
            <div className="space-y-4">

              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Câu hỏi {itemIndex + 1} / {sampleItems.length}</span>
                <span className="text-[11px] text-slate-400">
                  Mức độ: {currentItem.difficultyB >= 0.5 ? 'Vận dụng' : 'Thông hiểu'}
                </span>
              </div>

              {/* Question card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Chủ đề: {currentItem.skill}</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Phù hợp sức học
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 leading-snug">
                  <MathText text={currentItem.question} />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentItem.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      selectedOpt === idx
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex-1"><MathText text={opt} /></span>
                  </button>
                ))}
              </div>

              {/* Next / Finish button */}
              {feedback && (
                <button
                  onClick={handleNextItem}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{itemIndex < sampleItems.length - 1 ? 'Sang câu tiếp theo' : 'Nộp bài & Xem đáp án'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>
          ) : (
            /* Quiz completed view: Result Summary + Answer Review + Ask AI Tutor */
            <div className="space-y-5 py-2 animate-fade-in">

              {/* Top Result Banner */}
              <div className="text-center space-y-2 pb-4 border-b border-slate-200">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">
                  Hoàn Thành Bài Luyện Tập!
                </h3>

                <p className="text-xs text-slate-600">
                  Kết quả: Đúng <strong>{totalCorrectCount}/{sampleItems.length}</strong> câu • Độ nắm vững chủ đề đạt <strong>{(bktMastery * 100).toFixed(0)}%</strong>
                </p>
              </div>

              {/* Answer Review List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Xem Lại Đáp Án & Hỏi Gia Sư AI</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Bấm hỏi AI ở bất kỳ câu nào em cần giải thích thêm
                  </span>
                </div>

                {sampleItems.map((item, idx) => {
                  const chosenIdx = answerHistory[item.id];
                  const isCorrect = chosenIdx === item.correct;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-slate-800">
                          Câu {idx + 1}: <span className="font-semibold text-slate-500">({item.skill})</span>
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isCorrect ? '✓ Chính xác' : '✗ Chưa chính xác'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 leading-relaxed">
                        <MathText text={item.question} />
                      </div>

                      {/* Options comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.options.map((opt, oIdx) => {
                          const isItemCorrect = oIdx === item.correct;
                          const isUserSelected = oIdx === chosenIdx;

                          let optStyle = 'bg-white border-slate-200 text-slate-600';
                          if (isItemCorrect) {
                            optStyle = 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-extrabold';
                          } else if (isUserSelected && !isItemCorrect) {
                            optStyle = 'bg-rose-100/80 border-rose-500 text-rose-950 font-extrabold';
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${optStyle}`}
                            >
                              <span><MathText text={opt} /></span>
                              {isItemCorrect && (
                                <span className="text-[10px] font-extrabold text-emerald-700 shrink-0">Đáp án đúng</span>
                              )}
                              {isUserSelected && !isItemCorrect && (
                                <span className="text-[10px] font-extrabold text-rose-700 shrink-0">Bạn chọn</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {item.explanation && (
                        <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Giải thích: </strong>
                          <MathText text={item.explanation} />
                        </div>
                      )}

                      {/* Ask AI Tutor Button */}
                      <button
                        type="button"
                        onClick={() => handleAskSocraticForQuestion(item)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Bot className="w-4 h-4 text-cyan-200" />
                        <span>💡 Chưa hiểu rõ câu {idx + 1}? Nhờ Gia sư AI hướng dẫn từng bước</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer transition-all"
                >
                  Làm lại bộ câu hỏi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
                >
                  Trở về Lộ trình Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
