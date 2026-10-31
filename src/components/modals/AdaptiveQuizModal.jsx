import React, { useState } from 'react';
import { Zap, CheckCircle2, XCircle, ArrowRight, X, AlertCircle, Bot, FileText } from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';

export default function AdaptiveQuizModal({ isOpen, onClose, onOpenAiTutorWithContext }) {
  const [bktMastery, setBktMastery] = useState(0.72);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(1);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [remedialNodeActive, setRemedialNodeActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sample ZPD Item
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answerHistory, setAnswerHistory] = useState({}); // { [questionId]: selectedOptIndex }

  const sampleItems = [
    {
      id: "a1b2c3d4-0001-4000-8000-000000000001",
      skill: "Toán logic mệnh đề & suy luận kéo theo",
      question: "Nếu mệnh đề kéo theo $P \\Rightarrow Q$ là đúng, và $Q$ là sai, thì ta có thể kết luận chắc chắn gì về $P$?",
      options: ["A. P có thể đúng hoặc sai", "B. P bắt buộc phải sai", "C. P bắt buộc phải đúng", "D. Không đủ dữ kiện"],
      correct: 1,
      difficultyB: 0.15,
      predictedProb: 0.68,
      explanation: "Trong bảng chân trị của mệnh đề kéo theo $P \\Rightarrow Q$, mệnh đề chỉ sai khi $P$ đúng và $Q$ sai. Vì $P \\Rightarrow Q$ đúng và $Q$ sai, nên $P$ bắt buộc phải sai."
    },
    {
      id: "a1b2c3d4-0002-4000-8000-000000000002",
      skill: "Toán logic mệnh đề & suy luận kéo theo",
      question: "Cho hệ 3 phát biểu $P, Q, R$. Nếu $P \\Rightarrow Q$, $Q \\Rightarrow R$ và $R$ sai. Phát biểu nào chắc chắn ĐÚNG?",
      options: ["A. P đúng", "B. P sai", "C. Q đúng", "D. Cả P và Q đều đúng"],
      correct: 1,
      difficultyB: 0.52, // Application level (b >= 0.50)
      predictedProb: 0.64,
      explanation: "Theo quy tắc Modus Tollens (phản đảo): Vì $Q \\Rightarrow R$ đúng mà $R$ sai nên $Q$ sai. Tiếp tục vì $P \\Rightarrow Q$ đúng mà $Q$ sai nên $P$ bắt buộc phải sai."
    }
  ];

  if (!isOpen) return null;

  const currentItem = sampleItems[itemIndex] || sampleItems[0];

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
      setFeedback({ type: 'correct', msg: `Đã ghi nhận câu trả lời! Mô hình BKT cập nhật P(Lt) lên ${(newMastery * 100).toFixed(0)}%.` });
    } else {
      const newMastery = Math.max(0.05, bktMastery - 0.15);
      setBktMastery(newMastery);
      const newWrong = consecutiveWrong + 1;
      setConsecutiveWrong(newWrong);
      setConsecutiveCorrect(0);
      
      if (newWrong >= 3) {
        setRemedialNodeActive(true);
        setFeedback({ type: 'remedial', msg: 'Quy tắc BR-03 kích hoạt: Bạn đã sai 3 câu liên tiếp. Hệ thống tự động chèn Remedial Node củng cố kiến thức!' });
      } else {
        setFeedback({ type: 'wrong', msg: `Đã ghi nhận câu trả lời. BKT cập nhật P(Lt) còn ${(newMastery * 100).toFixed(0)}%.` });
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
          domain_name: 'Luyện tập Thích ứng ZPD',
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
        title: 'Phiếu Luyện Tập Thích Ứng ZPD & BKT (Flow 3)',
        examType: 'ZPD_QUIZ',
        completedAt: new Date().toISOString(),
        theta_0: Number((bktMastery - 0.25).toFixed(2)),
        placement_class: bktMastery >= 0.85 ? 'BREAKTHROUGH' : 'ACCELERATION',
        ai_commentary: `Hoàn thành phiên luyện tập ZPD với xác suất làm chủ BKT P(Lt) = ${(bktMastery * 100).toFixed(0)}%.`,
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
                Luyện Tập Thích Ứng ZPD & BKT (Flow 3)
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Quy tắc BR-02: Chọn câu có P(Correct) từ 0.60 đến 0.75
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

        {/* Dynamic BKT Gauge */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Xác suất làm chủ BKT P(Lt):</span>
            <span className="text-lg font-extrabold text-white">{(bktMastery * 100).toFixed(0)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Điều kiện mở khóa BR-01:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              bktMastery >= 0.85 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {bktMastery >= 0.85 ? 'Đạt ≥ 85%' : 'Chưa đạt (<85%)'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {!quizFinished ? (
            <div className="space-y-4">
              
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Câu hỏi {itemIndex + 1} / {sampleItems.length}</span>
                <span className="text-[11px] text-slate-400">Độ khó IRT: b = {currentItem.difficultyB}</span>
              </div>

              {/* Question card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Kỹ năng: {currentItem.skill}</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    P(Correct) dự đoán = {currentItem.predictedProb}
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
                  <span>{itemIndex < sampleItems.length - 1 ? 'Câu tiếp theo trong dải ZPD' : 'Nộp bài & Xem kết quả đáp án'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>
          ) : (
            /* Quiz completed view: Result Summary + Answer Review + Ask AI Socratic Tutor */
            <div className="space-y-5 py-2 animate-fade-in">
              
              {/* Top Result Banner */}
              <div className="text-center space-y-2 pb-4 border-b border-slate-200">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-extrabold text-slate-900">
                  Hoàn Thành Phiên Luyện Tập ZPD!
                </h3>

                <p className="text-xs text-slate-600">
                  Kết quả: Đúng <strong>{totalCorrectCount}/{sampleItems.length}</strong> câu • Xác suất làm chủ BKT P(Lt) đạt <strong>{(bktMastery * 100).toFixed(0)}%</strong>
                </p>
              </div>

              {/* Answer Review List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Xem Lại Đáp Án & Hỏi Gia Sư AI Socratic</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Bấm hỏi AI ở bất kỳ câu nào bạn cần giải thích sâu
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

                      {/* Ask AI Socratic Tutor Button (Only in Post-Quiz Answer Review) */}
                      <button
                        type="button"
                        onClick={() => handleAskSocraticForQuestion(item)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Bot className="w-4 h-4 text-cyan-200" />
                        <span>💡 Chưa hiểu bản chất câu {idx + 1}? Hỏi Gia sư AI Socratic bẻ khóa tư duy</span>
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
