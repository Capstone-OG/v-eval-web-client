import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Layers,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react';

/**
 * Interactive Exam Blueprint Specification Matrix Modal
 * Shows real-time coverage across Competency Domains, Chapters, Lessons, and Bloom levels.
 */
export default function ExamBlueprintDrawer({
  isOpen,
  examTitle = '',
  blueprint,
  classifyingAi = false,
  onRunAutoMap,
  onRunAiClassify,
  onJumpToQuestion,
  onFilterByChapter,
  onClose
}) {
  const [expandedChapters, setExpandedChapters] = useState({});

  if (!isOpen || !blueprint) return null;

  const {
    totalQuestions,
    mappedCount,
    unmappedCount,
    highConfidenceCount,
    coveragePercent,
    byDomain,
    byChapter,
    byBloom
  } = blueprint;

  const toggleChapter = (key) => {
    setExpandedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-cyan-50/50 to-indigo-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 truncate">
                Ma Trận Đặc Tả Khung Năng Lực & Chương / Bài
              </h2>
              <p className="text-xs text-slate-500 truncate">{examTitle || 'Đề thi hiện tại'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onRunAutoMap && (
              <button
                type="button"
                disabled={classifyingAi}
                onClick={onRunAutoMap}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Khớp nhanh lại</span>
              </button>
            )}

            {onRunAiClassify && (
              <button
                type="button"
                disabled={classifyingAi}
                onClick={onRunAiClassify}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {classifyingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{classifyingAi ? 'AI đang phân loại...' : 'AI Phân Loại Sâu'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận diện Node
              </div>
              <div className="mt-1 text-xl font-extrabold text-emerald-950">
                {mappedCount}/{totalQuestions}
                <span className="ml-1.5 text-xs font-bold text-emerald-700">({coveragePercent}%)</span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3.5">
              <div className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Miền năng lực
              </div>
              <div className="mt-1 text-xl font-extrabold text-indigo-950">{byDomain.length}</div>
            </div>

            <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/50 p-3.5">
              <div className="text-[11px] font-bold text-cyan-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Chương phủ sóng
              </div>
              <div className="mt-1 text-xl font-extrabold text-cyan-950">{byChapter.length}</div>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5">
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa gắn / Tin cậy cao
              </div>
              <div className="mt-1 text-xl font-extrabold text-amber-950">
                {unmappedCount}
                <span className="ml-1.5 text-xs font-semibold text-emerald-700">· {highConfidenceCount} chắc chắn</span>
              </div>
            </div>
          </div>

          {/* Domain & Bloom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Domain */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Phân Bổ Theo Miền Năng Lực
              </h3>
              {byDomain.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Chưa có câu hỏi nào gắn Miền năng lực.</div>
              ) : (
                <div className="space-y-2.5">
                  {byDomain.map((d) => (
                    <div key={d.domainName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate pr-2">{d.domainName}</span>
                        <span className="font-mono font-bold text-indigo-700 shrink-0">
                          {d.count} câu ({d.percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                          style={{ width: `${Math.max(d.percent, 3)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By Bloom */}
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Phân Bổ Thang Nhận Thức Bloom (L1 – L6)
              </h3>
              <div className="space-y-2">
                {byBloom.map((b) => (
                  <div key={b.level} className="flex items-center gap-2.5 text-xs">
                    <span className="w-28 font-semibold text-slate-600 shrink-0">{b.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${b.count > 0 ? Math.max(b.percent, 4) : 0}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono font-bold text-slate-700 shrink-0">
                      {b.count} ({b.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Chapter -> Lesson Breakdown */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Chi Tiết Phân Bổ Theo Chương & Bài Học ({byChapter.length} chương)
              </h3>
              <span className="text-[11px] text-slate-500">Nhấp số câu để nhảy nhanh đến câu hỏi</span>
            </div>

            {byChapter.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa phát hiện Chương/Bài học nào. Hãy bấm <strong>AI Phân Loại Sâu</strong> để tự động gắn Node.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {byChapter.map((ch) => {
                  const isOpenChap = expandedChapters[ch.chapterKey] ?? true;
                  return (
                    <div key={ch.chapterKey} className="p-4 space-y-2.5 bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleChapter(ch.chapterKey)}
                          className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                        >
                          {isOpenChap ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {ch.chapterName}
                            </div>
                            <div className="text-[11px] text-indigo-600 font-semibold">{ch.domainName}</div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
                            {ch.count} câu ({ch.percent}%)
                          </span>
                          {onFilterByChapter && (
                            <button
                              type="button"
                              onClick={() => {
                                onFilterByChapter(ch.chapterName);
                                onClose?.();
                              }}
                              title="Lọc danh sách chỉ xem các câu thuộc Chương này"
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Filter className="w-3 h-3" />
                              <span>Lọc</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isOpenChap && (
                        <div className="pl-6 space-y-2">
                          {ch.lessons.map((les) => (
                            <div
                              key={les.lessonName}
                              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-wrap items-center justify-between gap-2"
                            >
                              <span className="text-xs font-semibold text-slate-700">{les.lessonName}</span>
                              <div className="flex flex-wrap items-center gap-1">
                                {les.questionNumbers.map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                      onClose?.();
                                      onJumpToQuestion?.(num);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                                  >
                                    Câu {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

