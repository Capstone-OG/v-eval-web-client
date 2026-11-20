import { BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Eye, Flag, Layers, ShieldAlert } from 'lucide-react';
import MathText from '../common/MathText';
import { DOMAINS } from './diagnosticData';
import { cleanVietnameseDiacritics } from '../../utils/vietnameseUtils';

export function ExamRoomHeader({examData, questionCount, timeRemaining, isFullscreen, tabSwitchCount, requestFullScreenMode, handlePromptSubmitExam}) {
  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return (<header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-slate-900 text-white text-[11px] sm:text-xs font-black tracking-wide shadow-sm truncate">
              <span className="sm:hidden">V-ACT • {questionCount} CÂU</span>
              <span className="hidden sm:inline">{examData?.title || 'BÀI THI CHẨN ĐOÁN NĂNG LỰC (30 CÂU)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap justify-end">
            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={requestFullScreenMode}
              className={`hidden md:inline-flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-all border ${isFullscreen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isFullscreen ? 'Toàn Màn Hình: BẬT' : 'Mở Toàn Màn Hình'}</span>
            </button>

            {/* Anti-cheat tab switch counter */}
            <div
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1 text-[11px] sm:text-xs font-bold font-mono ${tabSwitchCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Rời tab: <strong className={tabSwitchCount > 0 ? 'text-rose-600' : 'text-slate-800'}>{tabSwitchCount}</strong>/3</span>
            </div>

            {/* Countdown timer */}
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-amber-400 shadow-inner">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-400" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Main Submit Exam button */}
            <button
              type="button"
              onClick={handlePromptSubmitExam}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Nộp Bài</span>
            </button>
          </div>
        </header>);
}

export function ExamRoomBody({currentQ, currentIndex, questions, answers, flagged, timeSpentPerQ, handleSelectOption, handleToggleFlag, setCurrentIndex, handlePromptSubmitExam}) {
  return (<div className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-start gap-6 transition-all duration-300 ${currentQ.passage_content
            ? 'max-w-[1720px]'
            : 'max-w-[1440px]'
          }`}>

          {/* Main Question Card (Adaptive sizing & roomy layout) */}
          <div className="flex-1 w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden text-slate-900 flex flex-col transition-all">

            <div className="space-y-5">

              {/* Question metadata badge bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${DOMAINS[currentQ.domain_id]?.badge || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {currentQ.domain_name || DOMAINS[currentQ.domain_id]?.name || 'Toán học & Phân tích'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kỹ năng: <strong className="text-slate-800">{currentQ.skill_name}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200">
                    {currentQ.levelLabel || 'Bloom'} {currentQ.bloom}/6
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${flagged[currentQ.id]
                    ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'Đã Gắn Cờ' : 'Đánh Dấu Phân Vân'}</span>
                </button>
              </div>

              {/* Responsive Layout: Split 2 Columns when Passage exists, Single Column when Normal */}
              {currentQ.passage_content ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start pt-1">
                  {/* Left Column: Reading Passage Context (Roomy, clear typography, comfortable scrolling) */}
                  <div className="xl:col-span-6 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 sm:p-6 max-h-[620px] overflow-y-auto space-y-3.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10">
                      <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{cleanVietnameseDiacritics(currentQ.passage_title) || 'Ngữ Liệu Đọc Hiểu'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        Bài đọc chuyên đề
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800 font-sans text-sm sm:text-[15px] select-text">
                      {cleanVietnameseDiacritics(currentQ.passage_content)}
                    </div>
                  </div>

                  {/* Right Column: Question statement & Options */}
                  <div className="xl:col-span-6 space-y-4">
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-relaxed">
                      <span className="text-blue-600 font-black mr-2">Câu {currentIndex + 1}:</span>
                      <MathText text={currentQ.content} />
                    </div>

                    <div className="space-y-3 pt-1">
                      {currentQ.options.map((optText, optIdx) => {
                        const optChar = currentQ.optionIds?.[optIdx] || ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = answers[currentQ.id] === optChar;

                        return (
                          <button
                            key={optChar}
                          aria-pressed={isSelected}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, optChar)}
                            className={`w-full p-4 sm:p-4.5 rounded-2xl text-left transition-all border flex items-start gap-3.5 ${isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-500/10 font-bold ring-1 ring-blue-500/30'
                              : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300'
                              }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {optChar}
                            </div>
                            <div className="flex-1 text-sm sm:text-[15px] font-medium pt-1.5 leading-relaxed">
                              <MathText text={optText} />
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1.5">
                                <Check className="w-4 h-4 stroke-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Question Layout (Single expansive, spacious column) */
                <div className="space-y-5 pt-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-relaxed">
                    <span className="text-blue-600 font-black mr-2">Câu {currentIndex + 1}:</span>
                    <MathText text={currentQ.content} />
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {currentQ.options.map((optText, optIdx) => {
                      const optChar = currentQ.optionIds?.[optIdx] || ['A', 'B', 'C', 'D'][optIdx];
                      const isSelected = answers[currentQ.id] === optChar;

                      return (
                        <button
                          key={optChar}
                          aria-pressed={isSelected}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optChar)}
                          className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all border flex items-start gap-4 ${isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-500/10 font-bold ring-1 ring-blue-500/30'
                            : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300'
                            }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 transition-all ${isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-200 text-slate-700'
                              }`}
                          >
                            {optChar}
                          </div>
                          <div className="flex-1 text-sm sm:text-base font-medium pt-2 leading-relaxed">
                            <MathText text={optText} />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-2">
                              <Check className="w-4 h-4 stroke-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Question Step Navigator (Xích lên gọn gàng ngay dưới câu hỏi) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu Trước</span>
                </button>

                <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-1">
                  <span>Thời gian câu này:</span>
                  <span className="font-mono text-blue-600 font-bold">{timeSpentPerQ[currentQ.id] || 0}s</span>
                </div>
              </div>

              <div className="text-xs font-black text-slate-500 font-mono">
                <span className="text-blue-600 text-sm font-extrabold">{currentIndex + 1}</span> / {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <span>Câu Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePromptSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <span>Hoàn Tất & Nộp Bài</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: 30 Question Grid Navigator (Sticky on scroll, wider and spacious) */}
          <div className="w-full lg:w-80 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5 shrink-0 text-slate-900 lg:sticky lg:top-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Danh Sách {questions.length || 30} Câu</span>
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  {Object.keys(answers).length}/{questions.length} đã chọn
                </div>
              </div>

              {/* 30 Question Number Buttons */}
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlag = !!flagged[q.id];

                  let btnBg = 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300';
                  if (isCurrent) {
                    btnBg = 'bg-blue-600 text-white border-blue-500 font-black shadow-md shadow-blue-500/30 ring-2 ring-blue-500/40 scale-105 z-10';
                  } else if (isFlag) {
                    btnBg = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnBg = 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md shadow-emerald-600/20';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-extrabold transition-all border relative flex items-center justify-center ${btnBg}`}
                    >
                      <span>{idx + 1}</span>
                      {isAnswered && !isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1"></span>
                      )}
                      {isFlag && !isAnswered && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-2 text-[11px] font-bold text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-blue-600 border border-blue-500"></span>
                  <span className="text-blue-700 font-bold">Đang làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-500"></span>
                  <span className="text-emerald-700 font-extrabold">Đã hoàn thành (Tô đậm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></span>
                  <span className="text-amber-700 font-bold">Đánh dấu phân vân</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200"></span>
                  <span className="text-slate-500">Chưa làm</span>
                </div>
              </div>
            </div>
          </div>
        </div>);
}

export function ExamSubmitConfirmation({answers, questions, onCancel, onSubmit, busy = false, title = "Xác Nhận Nộp Bài Thi Chẩn Đoán?"}) {
  return (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden text-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">{title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn đã hoàn thành <strong className="text-emerald-600 font-bold">{Object.keys(answers).length} / {questions.length}</strong> câu hỏi.
                {Object.keys(answers).length < questions.length && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    ⚠️ Còn {questions.length - Object.keys(answers).length} câu chưa trả lời. Bạn có chắc muốn nộp sớm không?
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200"
              >
                Hủy & Tiếp Tục Làm Bài
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={busy}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài Ngay</span>
              </button>
            </div>
          </div>
        </div>);
}
