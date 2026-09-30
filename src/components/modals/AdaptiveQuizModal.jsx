import React, { useState } from 'react';
import { Zap, CheckCircle2, XCircle, ArrowRight, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdaptiveQuizModal({ isOpen, onClose }) {
  const [bktMastery, setBktMastery] = useState(0.72);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(1);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [remedialNodeActive, setRemedialNodeActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sample ZPD Item
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const sampleItems = [
    {
      id: "ZPD-101",
      skill: "Toán logic mệnh đề & suy luận kéo theo",
      question: "Nếu A kéo theo B (A => B) là đúng, và B là sai, thì ta có thể kết luận gì về A?",
      options: ["A. A có thể đúng hoặc sai", "B. A bắt buộc phải sai", "C. A bắt buộc phải đúng", "D. Không đủ dữ kiện"],
      correct: 1,
      difficultyB: 0.15,
      predictedProb: 0.68
    },
    {
      id: "ZPD-102",
      skill: "Toán logic mệnh đề & suy luận kéo theo",
      question: "Cho hệ 3 phát biểu P, Q, R. Nếu P => Q, Q => R và R sai. Phát biểu nào chắc chắn ĐÚNG?",
      options: ["A. P đúng", "B. P sai", "C. Q đúng", "D. Cả P và Q đều đúng"],
      correct: 1,
      difficultyB: 0.52, // Application level (b >= 0.50)
      predictedProb: 0.64
    }
  ];

  if (!isOpen) return null;

  const currentItem = sampleItems[itemIndex] || sampleItems[0];

  const handleAnswerSubmit = (optIdx) => {
    setSelectedOpt(optIdx);
    const isCorrect = optIdx === currentItem.correct;
    
    if (isCorrect) {
      const newMastery = Math.min(0.95, bktMastery + 0.12);
      setBktMastery(newMastery);
      const newConsec = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsec);
      setConsecutiveWrong(0);
      setFeedback({ type: 'correct', msg: `Chính xác! Mô hình BKT cập nhật P(Lt) lên ${(newMastery * 100).toFixed(0)}%.` });

      if (newMastery >= 0.85 && newConsec >= 2 && currentItem.difficultyB >= 0.50) {
        setQuizFinished(true);
      }
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
        setFeedback({ type: 'wrong', msg: `Chưa chính xác. BKT cập nhật P(Lt) giảm còn ${(newMastery * 100).toFixed(0)}%.` });
      }
    }
  };

  const handleNextItem = () => {
    setSelectedOpt(null);
    setFeedback(null);
    if (itemIndex < sampleItems.length - 1) {
      setItemIndex(itemIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
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
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
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
              
              {/* Question card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Kỹ năng: {currentItem.skill}</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    P(Correct) dự đoán = {currentItem.predictedProb}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {currentItem.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentItem.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => handleAnswerSubmit(idx)}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between border ${
                      selectedOpt === idx 
                        ? idx === currentItem.correct 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                          : 'bg-red-50 border-red-500 text-red-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              {/* Feedback alert */}
              {feedback && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  feedback.type === 'correct' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : feedback.type === 'remedial' 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {feedback.type === 'correct' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span>{feedback.msg}</span>
                </div>
              )}

              {/* Next button */}
              {feedback && (
                <button
                  onClick={handleNextItem}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Câu tiếp theo trong dải ZPD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>
          ) : (
            /* Quiz completed view */
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900">
                Chúc mừng! Chặng học đã được Mở khóa (BR-01)
              </h3>

              <p className="text-xs text-slate-600">
                Xác suất P(Lt) đạt <strong>{(bktMastery * 100).toFixed(0)}%</strong> và bạn đã làm đúng liên tiếp 2 câu vận dụng b &ge; 0.50.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20"
              >
                Trở về Lộ trình Dashboard
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
