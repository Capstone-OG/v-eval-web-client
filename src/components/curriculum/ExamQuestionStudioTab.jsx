import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  Sparkles,
  GitBranch,
  ImagePlus,
  Sigma,
  Shuffle,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Lightbulb,
  Table2,
  FileText,
  Lock
} from 'lucide-react';
import ExamRichContent from './ExamRichContent';
import { ExamFigureBox } from './ExamMediaLightbox';
import { KATEX_QUICK_SNIPPETS } from '../../utils/examParserUtils';
import { BLOOM_LEVEL_DETAILS, shuffleOptionsForQuestion } from '../../utils/examOrganizerUtils';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function readImageAsDataUrl(file, cb) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) cb(e.target.result);
  };
  reader.readAsDataURL(file);
}

/**
 * ExamQuestionStudioTab — Dedicated 2-Pane Soft-Academic Question-by-Question Editor
 */
export default function ExamQuestionStudioTab({
  exam,
  orderedView,
  isLocked,
  selectedQuestionLocalId,
  onSelectQuestionLocalId,
  onUpdateQuestion,
  onUpdatePassage,
  onAddSingleQuestion,
  onAddPassageCluster,
  onDuplicateQuestion,
  onDeleteQuestion,
  onOpenNodePicker,
  onOpenFullStudio,
  onZoomImage,
  onHoverTarget
}) {
  const [listSearch, setListSearch] = useState('');
  const [bloomFilter, setBloomFilter] = useState(0); // 0 = all, 1..6
  const [showPassageEditor, setShowPassageEditor] = useState(false);

  const { allQuestions } = orderedView;

  const filteredQuestions = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return allQuestions.filter((item) => {
      if (bloomFilter > 0 && Number(item.difficultyLevel) !== bloomFilter) return false;
      if (!q) return true;
      return (
        `câu ${item.questionNumber}`.includes(q) ||
        String(item.questionNumber) === q ||
        (item.content || '').toLowerCase().includes(q) ||
        (item.curriculumNode?.chapterName || '').toLowerCase().includes(q) ||
        (item.suggestedSkillName || '').toLowerCase().includes(q)
      );
    });
  }, [allQuestions, listSearch, bloomFilter]);

  const activeIndex = useMemo(() => {
    if (allQuestions.length === 0) return -1;
    const found = allQuestions.findIndex((q) => q.localId === selectedQuestionLocalId);
    return found >= 0 ? found : 0;
  }, [allQuestions, selectedQuestionLocalId]);

  const activeQuestion = activeIndex >= 0 ? allQuestions[activeIndex] : null;

  const parentPassage = useMemo(() => {
    if (!activeQuestion?.parentPassageLocalId || !exam?.passages) return null;
    return exam.passages.find((p) => p.localId === activeQuestion.parentPassageLocalId) || null;
  }, [activeQuestion, exam]);

  // Register active question as paste target when editing in Studio
  useEffect(() => {
    if (!activeQuestion) return;
    onHoverTarget?.({
      type: 'question',
      localId: activeQuestion.localId,
      parentPassageLocalId: activeQuestion.parentPassageLocalId || null
    });
  }, [activeQuestion, onHoverTarget]);

  // Keyboard Alt + ArrowLeft / ArrowRight rapid navigation across questions
  useEffect(() => {
    if (allQuestions.length <= 1) return undefined;
    const onKeyDown = (e) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        e.preventDefault();
        onSelectQuestionLocalId?.(allQuestions[activeIndex - 1].localId);
      } else if (e.key === 'ArrowRight' && activeIndex < allQuestions.length - 1) {
        e.preventDefault();
        onSelectQuestionLocalId?.(allQuestions[activeIndex + 1].localId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allQuestions, activeIndex, onSelectQuestionLocalId]);

  const updateActive = (updater) => {
    if (!activeQuestion || isLocked) return;
    onUpdateQuestion?.(activeQuestion.localId, activeQuestion.parentPassageLocalId || null, updater);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT PANE: Question List Sidebar */}
      <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[136px] rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col max-h-[78vh]">
        <div className="p-3.5 border-b border-[#ECEAE4] bg-[#FAF9F6] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A5F]">
              Danh Sách Câu ({allQuestions.length})
            </h2>
            {!isLocked && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onAddSingleQuestion}
                  title="Thêm câu hỏi đơn lẻ"
                  className="px-2 py-1 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Câu</span>
                </button>
                <button
                  type="button"
                  onClick={onAddPassageCluster}
                  title="Thêm chùm đọc hiểu mới"
                  className="p-1 rounded-lg bg-white hover:bg-[#EEF2F7] border border-[#E5E3DC] text-[#1E3A5F] cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Tìm số câu, nội dung..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#E5E3DC] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/20"
            />
            {listSearch && (
              <button
                type="button"
                onClick={() => setListSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mini Bloom Filter Strip */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setBloomFilter(0)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                bloomFilter === 0
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'bg-white text-slate-600 border-[#E5E3DC]'
              }`}
            >
              Tất cả
            </button>
            {BLOOM_LEVEL_DETAILS.map((b) => (
              <button
                key={b.level}
                type="button"
                onClick={() => setBloomFilter(b.level === bloomFilter ? 0 : b.level)}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                  bloomFilter === b.level ? b.activeClass : 'bg-white text-slate-600 border-[#E5E3DC]'
                }`}
              >
                {b.code}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Question Cards */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredQuestions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">Không có câu hỏi nào.</div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = activeQuestion?.localId === q.localId;
              const bloom =
                BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(q.difficultyLevel)) ||
                BLOOM_LEVEL_DETAILS[1];
              return (
                <button
                  key={q.localId}
                  type="button"
                  onClick={() => onSelectQuestionLocalId?.(q.localId)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs'
                      : 'bg-[#FCFCFA] border-[#ECEAE4] hover:border-[#2C4C7E]/50 hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-[#1E3A5F]'}`}>
                        Câu {q.questionNumber}
                      </span>
                      {q.parentPassageLocalId && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          Đọc hiểu
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${
                        isSelected ? 'bg-white/15 border-white/30 text-white' : bloom.chipClass
                      }`}
                    >
                      {bloom.code}
                    </span>
                  </div>

                  <p className={`text-[11.5px] line-clamp-2 leading-snug ${isSelected ? 'text-slate-100' : 'text-slate-600'}`}>
                    {q.content || '(Chưa nhập nội dung)'}
                  </p>

                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className={`truncate ${isSelected ? 'text-cyan-200' : 'text-indigo-700 font-medium'}`}>
                      {q.curriculumNode?.chapterName || q.suggestedSkillName || 'Chưa gắn Node'}
                    </span>
                    <span className={`shrink-0 font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      ĐA: {q.correctOption}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT PANE: Dedicated Single-Question Studio Editor */}
      <div className="lg:col-span-8 xl:col-span-9 min-w-0">
        {!activeQuestion ? (
          <div className="rounded-2xl border border-dashed border-[#DCD9D0] bg-white p-14 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">Chưa có câu hỏi nào để biên tập</div>
            {!isLocked && (
              <button
                type="button"
                onClick={onAddSingleQuestion}
                className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-bold cursor-pointer"
              >
                + Tạo Câu Hỏi Đầu Tiên
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            {/* Studio Top Stepping Bar */}
            <div className="px-5 py-3 border-b border-[#ECEAE4] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-[#E5E3DC] rounded-xl p-0.5">
                  <button
                    type="button"
                    disabled={activeIndex <= 0}
                    onClick={() => onSelectQuestionLocalId?.(allQuestions[activeIndex - 1].localId)}
                    title="Câu trước (Alt + ←)"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 text-xs font-extrabold text-[#1E3A5F]">
                    Câu {activeQuestion.questionNumber}{' '}
                    <span className="font-semibold text-slate-400">
                      ({activeIndex + 1}/{allQuestions.length})
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={activeIndex >= allQuestions.length - 1}
                    onClick={() => onSelectQuestionLocalId?.(allQuestions[activeIndex + 1].localId)}
                    title="Câu sau (Alt + →)"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {isLocked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                    <Lock className="w-3 h-3" /> Đang khóa chỉnh sửa
                  </span>
                )}
              </div>

              {!isLocked && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenFullStudio?.(activeQuestion, activeQuestion.parentPassageLocalId || null)
                    }
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2C4C7E] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mở Full Studio (838 Ký Hiệu & 3D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDuplicateQuestion?.(activeQuestion.localId, activeQuestion.parentPassageLocalId || null)
                    }
                    title="Nhân bản câu hỏi này"
                    className="px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nhân bản</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteQuestion?.(activeQuestion, activeQuestion.parentPassageLocalId || null)
                    }
                    title="Xóa câu hỏi này"
                    className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Body */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Parent Passage Inline Collapsible Editor (if part of reading passage) */}
              {parentPassage && (
                <div className="rounded-xl border border-[#D4DFED] bg-[#F7F9FC] p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#1E3A5F] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Thuộc Ngữ Cảnh Chùm Câu {parentPassage.startQuestion} – {parentPassage.endQuestion}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassageEditor((v) => !v)}
                      className="text-xs font-bold text-[#2C4C7E] hover:underline cursor-pointer"
                    >
                      {showPassageEditor ? 'Thu gọn ngữ cảnh' : 'Xem / Sửa ngữ cảnh chùm'}
                    </button>
                  </div>

                  {showPassageEditor && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        disabled={isLocked}
                        rows={4}
                        value={parentPassage.content}
                        onChange={(e) =>
                          onUpdatePassage?.(parentPassage.localId, (p) => ({
                            ...p,
                            content: e.target.value
                          }))
                        }
                        className="w-full p-3 rounded-xl border border-[#D4DFED] bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/20"
                      />
                      <div className="p-3 rounded-xl bg-white border border-[#ECEAE4]">
                        <ExamRichContent text={parentPassage.content} onImageClick={onZoomImage} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 1: Bloom 6-Level Selector + Curriculum Node Binding */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* 6 Bloom Level Buttons */}
                <div className="xl:col-span-7 space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Mức độ nhận thức Bloom (6 cấp độ)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {BLOOM_LEVEL_DETAILS.map((b) => {
                      const active = Number(activeQuestion.difficultyLevel) === b.level;
                      return (
                        <button
                          key={b.level}
                          type="button"
                          disabled={isLocked}
                          title={b.shortDesc}
                          onClick={() => updateActive((q) => ({ ...q, difficultyLevel: b.level }))}
                          className={`px-2 py-2 rounded-xl border text-center transition-all cursor-pointer disabled:opacity-60 ${
                            active
                              ? `${b.activeClass} shadow-xs`
                              : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-700 hover:border-[#2C4C7E]/40'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{b.code}</div>
                          <div className="text-[10px] font-medium truncate">{b.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curriculum Node Box */}
                <div className="xl:col-span-5 space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Gắn Nút Khung Năng Lực & Chương / Bài
                  </label>
                  <div className="p-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 flex items-center justify-between gap-2 min-h-[54px]">
                    <div className="min-w-0">
                      {activeQuestion.curriculumNode?.chapterName ? (
                        <>
                          <div className="text-[11.5px] font-extrabold text-indigo-950 truncate">
                            {activeQuestion.curriculumNode.chapterName}
                          </div>
                          <div className="text-[10.5px] text-indigo-700 truncate">
                            {activeQuestion.curriculumNode.lessonName || activeQuestion.curriculumNode.patternName}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-amber-800">
                          Chưa gắn nút Chương / Bài học
                        </div>
                      )}
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenNodePicker?.(
                            activeQuestion,
                            activeQuestion.parentPassageLocalId || null,
                            parentPassage?.content || ''
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Chọn Node</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Question Stem + Live KaTeX Preview */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-[#1E3A5F]">
                    Nội dung câu hỏi (KaTeX, Bảng Markdown, Biểu đồ)
                  </label>

                  {!isLocked && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <label className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[11px] font-bold text-[#1E3A5F] flex items-center gap-1 cursor-pointer">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Đính kèm ảnh / đồ thị</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              readImageAsDataUrl(f, (dataUrl) => {
                                updateActive((q) => ({ ...q, imageUrl: dataUrl, imageUserAttached: true }));
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          updateActive((q) => ({
                            ...q,
                            content: `${q.content || ''}\n| Cột 1 | Cột 2 |\n| --- | --- |\n| Giá trị 1 | Giá trị 2 |`
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Table2 className="w-3.5 h-3.5" />
                        <span>+ Bảng</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick KaTeX Strip */}
                {!isLocked && (
                  <div className="flex flex-wrap items-center gap-1">
                    <Sigma className="w-3.5 h-3.5 text-[#2C4C7E] mr-0.5" />
                    {KATEX_QUICK_SNIPPETS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          updateActive((q) => ({
                            ...q,
                            content: `${q.content || ''} ${s.code}`.trim()
                          }))
                        }
                        className="px-2 py-0.5 rounded-md bg-[#FAF9F6] hover:bg-[#EEF2F7] border border-[#E5E3DC] text-[10.5px] font-semibold text-[#1E3A5F] cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <textarea
                    disabled={isLocked}
                    rows={6}
                    value={activeQuestion.content}
                    onChange={(e) => updateActive((q) => ({ ...q, content: e.target.value }))}
                    placeholder="Nhập đề bài câu hỏi (hỗ trợ $...$ KaTeX và bảng Markdown)..."
                    className="w-full p-3.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] focus:bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25 disabled:opacity-75"
                  />

                  <div className="p-3.5 rounded-xl border border-[#E7E5DF] bg-[#FCFCFA] min-h-[140px] space-y-1.5">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                      Xem trước trực quan
                    </div>
                    <ExamRichContent text={activeQuestion.content} onImageClick={onZoomImage} />
                  </div>
                </div>

                <ExamFigureBox
                  imageUrl={activeQuestion.imageUrl}
                  images={activeQuestion.images}
                  imageUserAttached={activeQuestion.imageUserAttached}
                  content={activeQuestion.content}
                  isPassage={false}
                  isLocked={isLocked}
                  onZoom={onZoomImage}
                  onRemoveImage={() =>
                    updateActive((q) => ({ ...q, imageUrl: null, imageUserAttached: false, images: [] }))
                  }
                />
              </div>

              {/* Row 3: 4 Options Editor (A / B / C / D) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-[#1E3A5F]">
                    4 Phương án trắc nghiệm (Nhấp vào A / B / C / D để đặt đáp án đúng)
                  </label>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => updateActive((q) => shuffleOptionsForQuestion(q))}
                      className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[11px] font-bold text-[#1E3A5F] flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Đảo phương án</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OPTION_KEYS.map((key) => {
                    const isCorrect = activeQuestion.correctOption === key;
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border transition-all space-y-2 ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-50/55 ring-1 ring-emerald-500/15'
                            : 'border-[#E7E5DF] bg-[#FCFCFA]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => updateActive((q) => ({ ...q, correctOption: key }))}
                            className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-default ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white border border-[#DCD9D0] text-slate-700 hover:border-emerald-400'
                            }`}
                          >
                            {key}
                          </button>

                          <input
                            type="text"
                            disabled={isLocked}
                            value={activeQuestion.options?.[key] || ''}
                            onChange={(e) =>
                              updateActive((q) => ({
                                ...q,
                                options: { ...(q.options || {}), [key]: e.target.value }
                              }))
                            }
                            placeholder={`Nhập nội dung phương án ${key}...`}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E5E3DC] bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/20 disabled:opacity-75"
                          />

                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Đáp án đúng" />
                          )}
                        </div>

                        {activeQuestion.options?.[key] && (
                          <div className="pl-9 text-xs text-slate-800">
                            <ExamRichContent text={activeQuestion.options[key]} inline onImageClick={onZoomImage} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Detailed Explanation */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-extrabold text-[#1E3A5F] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lời giải chi tiết & Giải thích đáp án</span>
                </label>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <textarea
                    disabled={isLocked}
                    rows={4}
                    value={activeQuestion.explanation}
                    onChange={(e) => updateActive((q) => ({ ...q, explanation: e.target.value }))}
                    placeholder="Nhập hướng dẫn giải từng bước (hỗ trợ KaTeX)..."
                    className="w-full p-3 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] focus:bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25 disabled:opacity-75"
                  />

                  <div className="p-3 rounded-xl border border-amber-200/70 bg-amber-50/40 min-h-[96px] space-y-1">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800/70">
                      Xem trước lời giải
                    </div>
                    {activeQuestion.explanation ? (
                      <ExamRichContent text={activeQuestion.explanation} onImageClick={onZoomImage} />
                    ) : (
                      <div className="text-xs italic text-slate-400">Chưa có lời giải cho câu hỏi này.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

