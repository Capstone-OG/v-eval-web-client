import React, { useState } from 'react';
import { Target, CheckCircle2, ArrowRight, X, Sparkles, Award } from 'lucide-react';
import { sampleQuestionsForDiagnostic, mockUser } from '../../data/mockData';

export default function DiagnosticTestModal({ isOpen, onClose, onCompleteTest }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculatedTheta, setCalculatedTheta] = useState(0.65);
  const [calculatedClass, setCalculatedClass] = useState("Lớp Bứt Phá (Theta 0 > +0.5)");

  if (!isOpen) return null;

  const currentQ = sampleQuestionsForDiagnostic[currentStep];

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleNext = () => {
    if (currentStep < sampleQuestionsForDiagnostic.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate IRT Theta_0 live
      setIsCalculated(true);
    }
  };

  const handleFinish = () => {
    onCompleteTest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Target className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Bài Kiểm Tra Chẩn Đoán Đầu Vào (Flow 1)
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Ước lượng Vector năng lực Theta 0 chuẩn 3PL IRT & Phân bổ lớp học
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {!isCalculated ? (
            <div className="space-y-4">
              
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Câu hỏi {currentStep + 1} / {sampleQuestionsForDiagnostic.length}</span>
                <span className="text-blue-600 font-extrabold">{currentQ.domain}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / sampleQuestionsForDiagnostic.length) * 100}%` }}
                ></div>
              </div>

              {/* Question content */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-400 mb-1">
                  Kỹ năng: {currentQ.skill} (Độ khó b: {currentQ.difficulty})
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between border ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Next CTA */}
              <button
                disabled={selectedAnswers[currentQ.id] === undefined}
                onClick={handleNext}
                className="w-full py-3 px-4 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>{currentStep < sampleQuestionsForDiagnostic.length - 1 ? 'Câu tiếp theo' : 'Chấm điểm & Ước lượng Theta 0'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                  Hoàn thành Chẩn đoán thành công!
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Vector Theta 0 = +{calculatedTheta}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Giá trị tiên nghiệm P(L0) = 0.657 được lưu vào bảng StudentMasteryStates.
                </p>
              </div>

              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-2 text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Kết quả Phân bổ Lớp học (Placement):</span>
                </div>
                <div className="text-slate-700">
                  • Lớp được gán: <strong className="text-blue-700">{calculatedClass}</strong>
                </div>
                <div className="text-slate-700">
                  • Cơ sở đăng ký: <strong className="text-slate-900">{mockUser.campusName}</strong>
                </div>
                <div className="text-slate-700">
                  • Lộ trình DAG đã sinh: <strong>28 mốc học tự động (Sắp xếp Topo)</strong>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
              >
                Vào Trang chủ Dashboard ngay
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
