import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import {
  ArrowDown,
  FileSpreadsheet,
  Search,
  X,
  Eye,
  EyeOff,
  Lightbulb,
  Printer,
  CheckCircle2,
  GitBranch,
  Edit3,
  Plus,
  BookOpen,
  ClipboardPaste,
  Award,
  RotateCcw,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ExamRichContent from './ExamRichContent';
import { ExamFigureBox } from './ExamMediaLightbox';
import {
  formatSubjectLabel,
  EXAM_CATEGORY_OPTIONS
} from '../../utils/examParserUtils';
import { BLOOM_LEVEL_DETAILS } from '../../utils/examOrganizerUtils';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];
const QUESTIONS_PER_PAGE = 5;

/**
 * ExamPaperView — Scholarly Print-Ready Exam Paper View + Sticky Navigator + Quick Practice Grading
 */
export default function ExamPaperView({
  exam,
  orderedView,
  blueprintStats,
  filteredItems,
  matrixNumbers,
  isLocked,
  searchQuery,
  setSearchQuery,
  matrixFilter,
  setMatrixFilter,
  chapterFilter,
  setChapterFilter,
  activeNavQuestion,
  pasteTarget,
  setPasteTarget,
  onJumpToQuestion,
  onEditInStudio,
  onOpenNodePicker,
  onAddSingleQuestion,
  onAddPassageCluster,
  onUpdatePassage,
  onUpdateQuestion,
  onZoomImage
}) {
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);
  const [showMetadataTags, setShowMetadataTags] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [pickedAnswers, setPickedAnswers] = useState({});
  const [gradedResult, setGradedResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPageSlot, setEditingPageSlot] = useState(null);
  const [pageInputVal, setPageInputVal] = useState('');
  const bottomPaginationRef = useRef(null);

  const { stats, questionMap, passageQuestionNumbers, allQuestions } = orderedView;
  const categoryLabel =
    EXAM_CATEGORY_OPTIONS.find((c) => c.value === exam.examCategory)?.label || exam.examCategory;

  // Danh sách câu hỏi phẳng sau khi lọc để phân trang cố định 5 câu / trang
  const filteredFlatQuestions = useMemo(() => {
    const out = [];
    for (const item of filteredItems || []) {
      if (item.type === 'passage') {
        for (const q of item.data?.questions || []) out.push(q);
      } else if (item.data) {
        out.push(item.data);
      }
    }
    return out;
  }, [filteredItems]);

  const totalPages = Math.max(1, Math.ceil(filteredFlatQuestions.length / QUESTIONS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [exam?.examId, exam?.title, searchQuery, matrixFilter, chapterFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageStartIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = useMemo(
    () => filteredFlatQuestions.slice(pageStartIdx, pageStartIdx + QUESTIONS_PER_PAGE),
    [filteredFlatQuestions, pageStartIdx]
  );

  const paginatedItems = useMemo(() => {
    const pageIds = new Set(pageQuestions.map((q) => q.localId));
    const result = [];
    for (const item of filteredItems || []) {
      if (item.type === 'passage') {
        const subQs = (item.data?.questions || []).filter((q) => pageIds.has(q.localId));
        if (subQs.length > 0) {
          result.push({ type: 'passage', data: { ...item.data, questions: subQs } });
        }
      } else if (item.data && pageIds.has(item.data.localId)) {
        result.push(item);
      }
    }
    return result;
  }, [filteredItems, pageQuestions]);

  const handleMatrixJumpWithPagination = (num) => {
    const idx = filteredFlatQuestions.findIndex((q) => Number(q.questionNumber) === Number(num));
    if (idx >= 0) {
      const targetPage = Math.floor(idx / QUESTIONS_PER_PAGE) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
        setTimeout(() => {
          document.getElementById(`exam-q-${num}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return;
      }
    }
    onJumpToQuestion?.(num);
  };

  const handleTogglePractice = () => {
    setPracticeMode((prev) => {
      const next = !prev;
      if (next) {
        setShowAnswerKey(false);
        setShowExplanations(false);
        setGradedResult(null);
      } else {
        setShowAnswerKey(true);
        setGradedResult(null);
      }
      return next;
    });
  };

  const handleGradePractice = () => {
    let correct = 0;
    let answered = 0;
    for (const q of allQuestions) {
      const picked = pickedAnswers[q.questionNumber];
      if (picked) {
        answered += 1;
        if (picked === q.correctOption) correct += 1;
      }
    }
    const total = allQuestions.length;
    setGradedResult({
      correct,
      answered,
      total,
      score10: total > 0 ? Number(((correct / total) * 10).toFixed(2)) : 0
    });
    setShowAnswerKey(true);
  };

  const handleResetPractice = () => {
    setPickedAnswers({});
    setGradedResult(null);
    if (practiceMode) setShowAnswerKey(false);
  };

  const renderPaperQuestion = (q, parentPassageLocalId = null, parentPassageContent = '') => {
    const bloom =
      BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(q.difficultyLevel)) || BLOOM_LEVEL_DETAILS[1];
    const picked = pickedAnswers[q.questionNumber];
    const isActive = activeNavQuestion === q.questionNumber;
    const isPasteHere = pasteTarget?.type === 'question' && pasteTarget?.localId === q.localId;
    const node = q.curriculumNode;

    return (
      <article
        key={q.localId}
        id={`exam-q-${q.questionNumber}`}
        data-qnum={q.questionNumber}
        onMouseEnter={() => setPasteTarget?.({ type: 'question', localId: q.localId, parentPassageLocalId })}
        onClick={() => setPasteTarget?.({ type: 'question', localId: q.localId, parentPassageLocalId })}
        className={`scroll-mt-32 rounded-xl border p-4 sm:p-5 transition-all break-inside-avoid ${
          isActive
            ? 'border-[#1E3A5F]/40 bg-[#FAFBFC] ring-1 ring-[#1E3A5F]/15'
            : isPasteHere
            ? 'border-cyan-300/90 bg-white'
            : 'border-[#ECEAE4] bg-white hover:border-[#D6D3C9]'
        } ${parentPassageLocalId ? 'sm:ml-4 border-l-3 border-l-[#2C4C7E]/50' : ''}`}
      >
        {/* Question Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-[13px] text-[#1E3A5F] bg-[#EEF2F7] border border-[#D4DFED] px-2.5 py-0.5 rounded-lg">
              Câu {q.questionNumber}
            </span>

            {showMetadataTags && (
              <>
                <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${bloom.chipClass}`}>
                  {bloom.name}
                </span>

                {(() => {
                  const stemFold = `${q.content || ''} ${q.suggestedSkillName || ''}`;
                  const hasVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(stemFold);
                  const engHits = (stemFold.match(/\b(the|of|and|to|is|are|was|were|has|have|had|would|could|should|which|that|with|for|in|on|by|at|from|magazine|participants|journalist|ability|attractions|beautiful|lovely|always|greet|question|student|students|teacher)\b/gi) || []).length;
                  const isPureEng = (!hasVi && engHits >= 2) || /<\s*u\b[^>]*>[\s\S]+?<\s*\/\s*u\s*>/i.test(q.content || '');
                  const nodeFold = `${node?.domainName || ''} ${node?.chapterName || ''} ${node?.lessonName || ''}`.toLowerCase();
                  const isCrossSubjectMismatch = isPureEng && (
                    nodeFold.includes('vật lí') ||
                    nodeFold.includes('vật lý') ||
                    nodeFold.includes('hoá học') ||
                    nodeFold.includes('hóa học') ||
                    nodeFold.includes('toán') ||
                    nodeFold.includes('sinh học') ||
                    nodeFold.includes('lịch sử') ||
                    nodeFold.includes('địa lí') ||
                    nodeFold.includes('ngữ văn')
                  );

                  if (node?.chapterName && !isCrossSubjectMismatch) {
                    return (
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLocked) onOpenNodePicker?.(q, parentPassageLocalId, parentPassageContent);
                        }}
                        title={`${node.domainName} › ${node.chapterName}${node.lessonName ? ` › ${node.lessonName}` : ''}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 text-[10.5px] font-semibold text-indigo-800 max-w-[340px] truncate cursor-pointer disabled:cursor-default print:hidden"
                      >
                        <GitBranch className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {node.chapterName}
                          {node.lessonName ? ` › ${node.lessonName}` : ''}
                        </span>
                      </button>
                    );
                  }

                  if (isCrossSubjectMismatch && !isLocked) {
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNodePicker?.(q, parentPassageLocalId, parentPassageContent);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-sky-400 bg-sky-50/80 hover:bg-sky-100 text-[10.5px] font-bold text-sky-800 cursor-pointer print:hidden"
                        title="Câu hỏi Tiếng Anh đang bị gán sai môn. Nhấn để chọn đúng Chương/Bài Tiếng Anh."
                      >
                        <GitBranch className="w-3 h-3 text-sky-600" />
                        <span>Gắn Chương/Bài (Tiếng Anh)</span>
                      </button>
                    );
                  }

                  return (
                    !isLocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNodePicker?.(q, parentPassageLocalId, parentPassageContent);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-[10.5px] font-bold text-amber-800 cursor-pointer print:hidden"
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>Gắn Chương/Bài</span>
                      </button>
                    )
                  );
                })()}
              </>
            )}
          </div>

          {!isLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditInStudio?.(q.localId);
              }}
              className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] hover:border-[#2C4C7E]/40 text-[#1E3A5F] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer print:hidden"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa trong Studio</span>
            </button>
          )}
        </div>

        {/* Stem */}
        <ExamRichContent text={q.content} onImageClick={onZoomImage} />

        {/* Figure */}
        <ExamFigureBox
          imageUrl={q.imageUrl}
          images={q.images}
          imageUserAttached={q.imageUserAttached}
          content={q.content}
          isPassage={false}
          isLocked={isLocked}
          onZoom={onZoomImage}
          onRemoveImage={() =>
            onUpdateQuestion?.(q.localId, parentPassageLocalId, (item) => ({
              ...item,
              imageUrl: null,
              imageUserAttached: false,
              images: []
            }))
          }
        />

        {/* Options 2x2 Grid */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {OPTION_KEYS.map((key) => {
            const val = q.options?.[key] ?? '';
            const isCorrect = q.correctOption === key;
            const isPicked = picked === key;

            let cardStyle = 'border-[#E7E5DF] bg-[#FCFCFA] hover:border-[#2C4C7E]/50 hover:bg-white';
            let badgeStyle = 'bg-white border border-[#DCD9D0] text-slate-700';

            if (gradedResult) {
              if (isCorrect) {
                cardStyle = 'border-emerald-400 bg-emerald-50/75';
                badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
              } else if (isPicked && !isCorrect) {
                cardStyle = 'border-rose-400 bg-rose-50/75';
                badgeStyle = 'bg-rose-600 text-white border-rose-600';
              }
            } else if (showAnswerKey && isCorrect) {
              cardStyle = 'border-emerald-400 bg-emerald-50/65';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isPicked) {
              cardStyle = 'border-[#2C4C7E] bg-[#EEF2F7]/80';
              badgeStyle = 'bg-[#1E3A5F] text-white border-[#1E3A5F]';
            }

            return (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPickedAnswers((prev) => ({ ...prev, [q.questionNumber]: key }));
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer ${cardStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-md text-[11.5px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}
                >
                  {key}
                </span>
                <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-slate-800">
                  {val ? (
                    <ExamRichContent text={val} inline onImageClick={onZoomImage} />
                  ) : (
                    <span className="italic text-slate-400 text-xs">(Trống)</span>
                  )}
                </div>
                {showAnswerKey && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanations && q.explanation && q.explanation.trim() && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50/65 border border-amber-200/80 text-xs text-slate-800">
            <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Hướng dẫn giải chi tiết</span>
            </div>
            <ExamRichContent text={q.explanation} onImageClick={onZoomImage} />
          </div>
        )}
      </article>
    );
  };

  const commitPageInput = () => {
    const parsed = parseInt(String(pageInputVal).trim(), 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setCurrentPage(parsed);
    }
    setEditingPageSlot(null);
    setPageInputVal('');
  };

  const getVisiblePageItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
  };

  const renderPaginationBar = (barId = 'top') => {
    if (filteredFlatQuestions.length <= QUESTIONS_PER_PAGE) return null;
    const pageItems = getVisiblePageItems();

    return (
      <div className="flex items-center justify-center gap-1.5 py-1 print:hidden">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => {
            setEditingPageSlot(null);
            setCurrentPage((p) => Math.max(1, p - 1));
          }}
          title="Trang trước"
          aria-label="Trang trước"
          className="w-8 h-8 rounded-lg border border-[#DCD9D0] bg-white hover:bg-[#EEF2F7] text-slate-700 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageItems.map((item) => {
          const slotKey = `${barId}-${item}`;
          const isEditingThis = editingPageSlot === slotKey;

          if (isEditingThis) {
            return (
              <input
                key={slotKey}
                type="number"
                min={1}
                max={totalPages}
                autoFocus
                value={pageInputVal}
                onChange={(e) => setPageInputVal(e.target.value)}
                onBlur={commitPageInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitPageInput();
                  } else if (e.key === 'Escape') {
                    setEditingPageSlot(null);
                    setPageInputVal('');
                  }
                }}
                className="w-11 h-8 px-1.5 rounded-lg border-2 border-[#1E3A5F] bg-white text-center text-xs font-extrabold text-[#1E3A5F] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Nhập số trang"
              />
            );
          }

          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <button
                key={slotKey}
                type="button"
                onClick={() => {
                  setEditingPageSlot(slotKey);
                  setPageInputVal(String(currentPage));
                }}
                title="Bấm để nhập số trang"
                className="w-8 h-8 rounded-lg border border-transparent hover:border-[#DCD9D0] hover:bg-white text-xs font-bold text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                …
              </button>
            );
          }

          const active = item === currentPage;
          return (
            <button
              key={slotKey}
              type="button"
              onClick={() => {
                if (active) {
                  setEditingPageSlot(slotKey);
                  setPageInputVal(String(currentPage));
                } else {
                  setEditingPageSlot(null);
                  setCurrentPage(item);
                }
              }}
              title={active ? 'Bấm để nhập số trang muốn đến' : `Trang ${item}`}
              className={`min-w-8 h-8 px-2 rounded-lg border text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                active
                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                  : 'bg-white border-[#DCD9D0] text-slate-700 hover:bg-[#EEF2F7]'
              }`}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => {
            setEditingPageSlot(null);
            setCurrentPage((p) => Math.min(totalPages, p + 1));
          }}
          title="Trang sau"
          aria-label="Trang sau"
          className="w-8 h-8 rounded-lg border border-[#DCD9D0] bg-white hover:bg-[#EEF2F7] text-slate-700 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tách riêng phần tiêu đề đề thi lên trên cùng (không gộp chung trong khung phân trang câu hỏi) */}
      <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] px-5 py-4 text-center space-y-1.5">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {exam.title || 'Đề thi trắc nghiệm'}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600 pt-0.5">
          <span>Môn: <strong className="text-slate-900">{formatSubjectLabel(exam.subjectCode)}</strong></span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#2C4C7E]" />
            Thời gian: <strong className="text-slate-900">{exam.durationMinutes} phút</strong>
          </span>
          <span>•</span>
          <span>Tổng số: <strong className="text-slate-900">{stats.totalQuestions} câu hỏi</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT STICKY MATRIX NAVIGATOR */}
      <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[136px] space-y-3 print:hidden">
        <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)] p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A5F] flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2C4C7E]" />
              <span>Mục Lục Đề Thi</span>
            </h2>
            <span className="text-[11px] font-bold text-[#1E3A5F] bg-[#EEF2F7] px-2 py-0.5 rounded-full">
              {stats.totalQuestions} câu
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số câu, từ khóa, Chương..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'passage', label: `Đọc hiểu (${stats.totalPassages})` },
              { id: 'single', label: `Đơn lẻ (${stats.totalSingles})` },
              { id: 'media', label: `Có ảnh (${stats.withImages})` },
              { id: 'unmapped', label: `Chưa gắn Node (${blueprintStats.unmappedCount})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMatrixFilter(f.id)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer truncate ${
                  f.id === 'unmapped' ? 'col-span-2' : ''
                } ${
                  matrixFilter === f.id
                    ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                    : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600 hover:border-[#2C4C7E]/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Chapter Filter (MUI Select) + Nút tắt lọc nhanh */}
          {blueprintStats.byChapter.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={chapterFilter || ''}
                onChange={(e) => setChapterFilter(e.target.value)}
                sx={{
                  height: 32,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  color: '#1E3A5F',
                  bgcolor: '#FAF9F6',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { borderRadius: '10px', mt: 0.5, maxWidth: 340, border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' }
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.76rem', fontWeight: 700 }}>
                  Tất cả Chương ({blueprintStats.byChapter.length} chương)
                </MenuItem>
                {blueprintStats.byChapter.map((ch) => (
                  <MenuItem key={ch.chapterKey} value={ch.chapterName} sx={{ fontSize: '0.76rem', whiteSpace: 'normal' }}>
                    {ch.chapterName} ({ch.count} câu)
                  </MenuItem>
                ))}
              </Select>
              {chapterFilter && (
                <button
                  type="button"
                  onClick={() => setChapterFilter('')}
                  title="Tắt lọc chương"
                  className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Question Matrix */}
          <div className="max-h-[42vh] overflow-y-auto pr-1">
            {matrixNumbers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">Chưa có câu hỏi nào.</div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1.5">
                {matrixNumbers.map((num) => {
                  const qObj = questionMap.get(num);
                  const exists = Boolean(qObj);
                  const isPassageQ = passageQuestionNumbers.has(num);
                  const isActive = activeNavQuestion === num;
                  const hasImg = exists && (Boolean(qObj.imageUrl) || (qObj.images && qObj.images.length > 0));
                  const picked = pickedAnswers[num];

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleMatrixJumpWithPagination(num)}
                      title={
                        exists
                          ? `Câu ${num}${qObj.curriculumNode?.chapterName ? ` · ${qObj.curriculumNode.chapterName}` : ''}`
                          : `Câu ${num} (Chưa có dữ liệu)`
                      }
                      className={`relative h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                        !exists
                          ? 'border-dashed border-slate-200 bg-slate-50/50 text-slate-300'
                          : isActive
                          ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs scale-105'
                          : picked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : isPassageQ
                          ? 'bg-sky-50 border-sky-200 text-sky-900 hover:border-sky-400'
                          : 'bg-white border-[#E5E3DC] text-slate-700 hover:border-[#2C4C7E]/60'
                      }`}
                    >
                      <span>{num}</span>
                      {hasImg && (
                        <span
                          className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-amber-300' : 'bg-indigo-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!isLocked && (
            <div className="pt-2 border-t border-[#ECEAE4] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAddSingleQuestion}
                className="px-2.5 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm câu</span>
              </button>
              <button
                type="button"
                onClick={onAddPassageCluster}
                className="px-2.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#EEF2F7] border border-[#E5E3DC] text-[#1E3A5F] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chùm đọc</span>
              </button>
            </div>
          )}
        </div>

        {!isLocked && (
          <div className="rounded-2xl border border-[#E5E3DC] bg-white p-3.5 text-[11px] text-slate-600 flex items-start gap-2">
            <ClipboardPaste className="w-4 h-4 text-[#2C4C7E] shrink-0 mt-0.5" />
            <div>
              Di chuột vào câu hỏi hoặc ngữ cảnh rồi nhấn{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F6] border border-[#DCD9D0] font-mono text-[10px] font-bold">
                Ctrl + V
              </kbd>{' '}
              để dán ảnh chụp đồ thị trực tiếp.
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT SCHOLARLY EXAM PAPER */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4 min-w-0">
        {/* Paper Display Toolbar */}
        <div className="rounded-2xl border border-[#E7E5DF] bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowAnswerKey((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                showAnswerKey
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600'
              }`}
            >
              {showAnswerKey ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Đáp án đúng</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExplanations((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                showExplanations
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Lời giải ({stats.withExplanations})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMetadataTags((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                showMetadataTags
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Nhãn Chương/Độ khó</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleTogglePractice}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                practiceMode
                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-700 hover:bg-[#EEF2F7]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{practiceMode ? 'Đang Thi Thử' : 'Thi Thử Nhanh'}</span>
            </button>

            {practiceMode && (
              <>
                <button
                  type="button"
                  onClick={handleGradePractice}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Chấm Điểm
                </button>
                <button
                  type="button"
                  onClick={handleResetPractice}
                  title="Làm lại"
                  className="p-1.5 rounded-lg border border-[#E5E3DC] text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#FAF9F6] text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span>In Đề</span>
            </button>
          </div>
        </div>

        {/* Practice Score Result Banner */}
        {gradedResult && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center">
                {gradedResult.score10}
              </div>
              <div>
                <div className="text-sm font-extrabold text-emerald-950">
                  Kết quả làm thử: Đúng {gradedResult.correct}/{gradedResult.total} câu ({gradedResult.score10}/10 điểm)
                </div>
                <div className="text-xs text-emerald-800">
                  Đã trả lời {gradedResult.answered}/{gradedResult.total} câu · Đáp án đúng đã được tô xanh bên dưới.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetPractice}
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold cursor-pointer"
            >
              Làm lại
            </button>
          </div>
        )}

        {/* Active Filter Banner (khi lọc từ Ma Trận hoặc Bộ lọc -> có nút Tắt lọc 1 bấm) */}
        {(chapterFilter || matrixFilter !== 'all' || searchQuery.trim()) && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-900">
              <span>Đang lọc đề:</span>
              {chapterFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800">
                  <span>Chương: {chapterFilter}</span>
                  <button
                    type="button"
                    onClick={() => setChapterFilter('')}
                    className="hover:text-rose-600 cursor-pointer"
                    title="Bỏ lọc chương"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {matrixFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800">
                  <span>Phân loại: {matrixFilter}</span>
                  <button
                    type="button"
                    onClick={() => setMatrixFilter('all')}
                    className="hover:text-rose-600 cursor-pointer"
                    title="Bỏ lọc phân loại"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-800">
                  <span>Từ khóa: "{searchQuery.trim()}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-rose-600 cursor-pointer"
                    title="Xóa từ khóa"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setChapterFilter('');
                setMatrixFilter('all');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tắt bộ lọc</span>
            </button>
          </div>
        )}

        {/* Academic Exam Paper Sheet (Phân trang 5 câu / trang) */}
        <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-4 sm:p-6 space-y-4">
          {/* Exam Body Items */}
          {paginatedItems.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-600">
                {stats.totalQuestions === 0
                  ? 'Đề thi chưa có câu hỏi nào. Chuyển sang mục "Tạo Câu Hỏi" hoặc bấm "Thêm câu" để bắt đầu!'
                  : 'Không có câu hỏi nào khớp với bộ lọc hiện tại.'}
              </div>
              {(searchQuery || matrixFilter !== 'all' || chapterFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMatrixFilter('all');
                    setChapterFilter('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-bold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedItems.map((item) => {
                if (item.type === 'passage') {
                  const p = item.data;
                  return (
                    <div key={p.localId} className="space-y-3">
                      <section
                        onMouseEnter={() => setPasteTarget?.({ type: 'passage', localId: p.localId })}
                        onClick={() => setPasteTarget?.({ type: 'passage', localId: p.localId })}
                        className="rounded-xl border border-[#D4DFED] bg-[#F7F9FC] p-4 sm:p-5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-[#1E3A5F]">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {p.startQuestion === p.endQuestion
                                ? `Dựa vào thông tin dưới đây để trả lời câu ${p.startQuestion}`
                                : `Dựa vào thông tin dưới đây để trả lời các câu từ ${p.startQuestion} đến ${p.endQuestion}`}
                            </span>
                          </span>
                          <span className="text-[11px] font-bold text-[#2C4C7E] bg-white px-2 py-0.5 rounded-full border border-[#D4DFED]">
                            {p.questions?.length || 0} câu
                          </span>
                        </div>

                        <ExamRichContent text={p.content} onImageClick={onZoomImage} />

                        <ExamFigureBox
                          imageUrl={p.imageUrl}
                          images={p.images}
                          imageUserAttached={p.imageUserAttached}
                          content={p.content}
                          isPassage
                          isLocked={isLocked}
                          onZoom={onZoomImage}
                          onRemoveImage={() =>
                            onUpdatePassage?.(p.localId, (pass) => ({
                              ...pass,
                              imageUrl: null,
                              imageUserAttached: false,
                              images: []
                            }))
                          }
                        />
                      </section>

                      {(p.questions || []).map((q) => renderPaperQuestion(q, p.localId, p.content))}
                    </div>
                  );
                }

                return renderPaperQuestion(item.data, null, '');
              })}
            </div>
          )}

          <div ref={bottomPaginationRef}>
            {renderPaginationBar('bottom')}
          </div>
        </div>
      </div>
      </div>

      {/* Nút cuộn nhanh xuống cuối trang (mờ mờ ở góc dưới bên phải) */}
      <button
        type="button"
        onClick={() => {
          if (bottomPaginationRef.current) {
            bottomPaginationRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          }
        }}
        title="Xuống cuối trang"
        aria-label="Xuống cuối trang"
        className="fixed bottom-5 right-5 z-40 w-9 h-9 rounded-full bg-[#1E3A5F]/80 text-white shadow-md border border-white/25 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-[#1E3A5F] transition-all cursor-pointer print:hidden"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  );
}
