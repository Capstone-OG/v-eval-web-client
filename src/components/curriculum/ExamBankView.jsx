import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Database,
  Edit3,
  FileText,
  GitBranch,
  PenTool,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { ExamDatabaseCardsGrid } from './ExamDatabaseModal';
import ExamPaperView from './ExamPaperView';
import ExamOrganizerTab from './ExamOrganizerTab';
import ExamWorkspaceHeader, { ExamPageFlowBar } from './ExamWorkspaceHeader';
import ExamSharedModals from './ExamSharedModals';
import { useExamWorkspaceController } from './useExamWorkspaceController';
import { useToast } from '../../context/ToastContext';

/**
 * Trang 1 (exam-bank) — Kho Đề Thi Supabase, Xem Đề Thi Chuẩn In & Sắp Xếp / Trộn Mã Đề
 * Mirrors SGK Page 1 (TextbookStandardView) in the 3-page workflow.
 */
export default function ExamBankView({ onNavigateTab, role = 'director' }) {
  const isReadOnly = role === 'teacher';
  const { toast } = useToast();
  const controller = useExamWorkspaceController({
    onNavigateTab,
    enableClipboardPaste: true
  });

  const {
    currentExam,
    orderedView,
    blueprintStats,
    pendingBloomCount,
    processingJob,
    bankSubView,
    setBankSubView,
    isLocked,
    dbExams,
    dbLoading,
    dbError,
    busyExamId,
    flatCurriculumNodes,
    pasteTarget,
    setPasteTarget,
    fetchDatabaseExams,
    handleCreateBlankExam,
    handleLoadExamFromDb,
    handlePublishExam,
    requestDeleteExam,
    handleAddSingleQuestion,
    handleAddPassageCluster,
    handleUpdatePassage,
    handleUpdateQuestion,
    setCurrentExamDirect,
    setNodePickerState,
    setLightboxImage,
    handleEditQuestionInStudio,
    setIngestPart
  } = controller;

  // Local Exam Paper Viewer filter & scroll-sync state
  const [activeNavQuestion, setActiveNavQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [matrixFilter, setMatrixFilter] = useState('all'); // 'all' | 'passage' | 'single' | 'media' | 'unmapped'
  const [chapterFilter, setChapterFilter] = useState('');

  const matrixNumbers = useMemo(() => {
    const { totalQuestions, maxQuestionNumber } = orderedView.stats;
    if (totalQuestions === 0 && maxQuestionNumber === 0) return [];
    const upperBound =
      currentExam?.source === 'ai' && maxQuestionNumber >= 60
        ? Math.max(maxQuestionNumber, 120)
        : Math.max(maxQuestionNumber, totalQuestions);
    return Array.from({ length: upperBound }, (_, idx) => idx + 1);
  }, [orderedView.stats, currentExam?.source]);

  const filteredItems = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();

    const matchesQuestion = (q, isPassageQ) => {
      if (matrixFilter === 'passage' && !isPassageQ) return false;
      if (matrixFilter === 'single' && isPassageQ) return false;
      if (matrixFilter === 'media' && !q.imageUrl && !(q.images && q.images.length > 0)) return false;
      if (matrixFilter === 'unmapped' && q.curriculumNode?.chapterName) return false;
      if (chapterFilter && (q.curriculumNode?.chapterName || '') !== chapterFilter) return false;
      if (!qLower) return true;
      const numMatch = `câu ${q.questionNumber}`.includes(qLower) || String(q.questionNumber) === qLower;
      const contentMatch = (q.content || '').toLowerCase().includes(qLower);
      const skillMatch = (q.suggestedSkillName || '').toLowerCase().includes(qLower);
      const nodeMatch =
        (q.curriculumNode?.chapterName || '').toLowerCase().includes(qLower) ||
        (q.curriculumNode?.lessonName || '').toLowerCase().includes(qLower) ||
        (q.curriculumNode?.patternName || '').toLowerCase().includes(qLower) ||
        (q.curriculumNode?.domainName || '').toLowerCase().includes(qLower);
      const optMatch = Object.values(q.options || {}).some((v) => String(v || '').toLowerCase().includes(qLower));
      return numMatch || contentMatch || skillMatch || nodeMatch || optMatch;
    };

    const result = [];
    for (const item of orderedView.items) {
      if (item.type === 'passage') {
        const p = item.data;
        if (matrixFilter === 'single') continue;
        const passageHasMedia = Boolean(p.imageUrl) || (p.images && p.images.length > 0);
        const passageMatchesText = qLower ? (p.content || '').toLowerCase().includes(qLower) : false;

        const matchingQuestions = (p.questions || []).filter((q) => {
          if (passageMatchesText && !chapterFilter && (matrixFilter === 'all' || matrixFilter === 'passage')) {
            return true;
          }
          return matchesQuestion(q, true);
        });

        const includePassage =
          matchingQuestions.length > 0 ||
          (!chapterFilter && matrixFilter === 'media' && passageHasMedia) ||
          (!chapterFilter && matrixFilter === 'passage' && !qLower) ||
          (!chapterFilter && matrixFilter === 'all' && !qLower);

        if (includePassage) {
          result.push({
            type: 'passage',
            data: {
              ...p,
              questions:
                matchingQuestions.length > 0 || qLower || chapterFilter || matrixFilter === 'media' || matrixFilter === 'unmapped'
                  ? matchingQuestions
                  : p.questions
            }
          });
        }
      } else if (matchesQuestion(item.data, false)) {
        result.push(item);
      }
    }
    return result;
  }, [orderedView.items, searchQuery, matrixFilter, chapterFilter]);

  // IntersectionObserver for Matrix Scroll Sync while viewing Exam Paper
  useEffect(() => {
    if (!currentExam || bankSubView !== 'paper') return undefined;
    const cards = Array.from(document.querySelectorAll('[data-qnum]'));
    if (cards.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const num = Number(visible[0].target.getAttribute('data-qnum'));
          if (num) setActiveNavQuestion(num);
        }
      },
      { rootMargin: '-100px 0px -55% 0px', threshold: 0.1 }
    );

    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentExam, bankSubView, filteredItems.length]);

  const handleJumpToQuestion = (num) => {
    setActiveNavQuestion(num);
    if (bankSubView !== 'paper') {
      setBankSubView('paper');
      setTimeout(() => {
        document.getElementById(`exam-q-${num}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
      return;
    }
    const el = document.getElementById(`exam-q-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toast.info(`Câu ${num} hiện chưa có trong đề hoặc đang bị ẩn bởi bộ lọc.`);
    }
  };

  const handleAddSingleAndScroll = () => {
    const newQ = handleAddSingleQuestion();
    if (newQ && bankSubView === 'paper') {
      setTimeout(() => {
        document.getElementById(`exam-q-${newQ.questionNumber}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 80);
    }
  };

  const publishedCount = dbExams.filter((e) => e.isPublished).length;
  const draftCount = Math.max(0, dbExams.length - publishedCount);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F6F5F1] -m-4 sm:-m-6 p-4 sm:p-6 text-slate-900 space-y-4">
      {!isReadOnly && (
        <ExamPageFlowBar
          activePage="exam-bank"
          onNavigateTab={onNavigateTab}
          pendingBloomCount={pendingBloomCount}
          processingJob={processingJob}
        />
      )}

      {!currentExam ? (
        <div className="max-w-7xl mx-auto space-y-5 pb-8">
          {/* Scholarly Bank Header */}
          <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2F7] border border-[#D4DFED] text-[#1E3A5F] text-[11px] font-extrabold">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trang 1 / 3 · Kho Đề Chuẩn, Xem Đề Thi & Sắp Xếp Mã Đề</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Kho Đề Thi & Trình Xem Đề Chuẩn In
                </h1>
                <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                  Mở bất kỳ đề thi nào từ Supabase để xem dạng tờ đề học thuật chuẩn in, thi thử chấm nhanh,
                  kiểm tra <strong>Ma trận Chương / Bài</strong>, hoặc kéo-thả <strong>Sắp xếp & Trộn mã đề</strong>.
                </p>
              </div>

              {isReadOnly ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Chế độ Tra Cứu Kho Đề Đã Xuất Bản (Read-only)</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIngestPart('pdf');
                      onNavigateTab?.('exam-ingest');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Parse PDF (Trang 2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIngestPart('bloom');
                      onNavigateTab?.('exam-ingest');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Bloom L1–L6</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateBlankExam({ navigateTo: 'exam-studio' })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Soạn Trong Studio</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compact KPI Row */}
            <div className="mt-5 pt-4 border-t border-[#ECEAE4] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF2F7] text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900 leading-none">{dbExams.length}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tổng đề trong Kho</div>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-emerald-700 leading-none">{publishedCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đề đã phê duyệt</div>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-amber-700 leading-none">{draftCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Bản nháp chờ duyệt</div>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-indigo-700 leading-none">{flatCurriculumNodes.length}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Node Khung chương trình</div>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Saved Exams Grid */}
          <ExamDatabaseCardsGrid
            exams={isReadOnly ? dbExams.filter((e) => e.isPublished) : dbExams}
            loading={dbLoading}
            error={dbError}
            activeExamId={currentExam?.examId}
            busyExamId={busyExamId}
            onRefresh={fetchDatabaseExams}
            onSelectExam={(examSummary) => {
              setSearchQuery('');
              setMatrixFilter('all');
              setChapterFilter('');
              handleLoadExamFromDb(examSummary, { subView: 'paper' });
            }}
            onPublishExam={isReadOnly ? undefined : handlePublishExam}
            onDeleteExam={isReadOnly ? undefined : requestDeleteExam}
          />
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          <ExamWorkspaceHeader
            controller={controller}
            activePage="exam-bank"
            onNavigateTab={onNavigateTab}
            showBackToBank={true}
            isReadOnly={isReadOnly}
            leftRow2Slot={
              <>
                <nav className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4F3EE] border border-[#E5E3DC]">
                  <button
                    type="button"
                    onClick={() => setBankSubView('paper')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bankSubView === 'paper'
                        ? 'bg-[#1E3A5F] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem Đề Thi</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        bankSubView === 'paper' ? 'bg-white/20 text-white' : 'bg-[#E7E5DF] text-slate-700'
                      }`}
                    >
                      {orderedView.stats.totalQuestions}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBankSubView('organize')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      bankSubView === 'organize'
                        ? 'bg-[#1E3A5F] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sắp Xếp & Trộn Đề</span>
                  </button>
                </nav>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('exam-studio')}
                    className="px-3 py-1.5 rounded-xl border border-[#D4DFED] bg-[#EEF2F7] hover:bg-[#E2EAF4] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa Từng Câu (Trang 3)</span>
                  </button>
                )}
              </>
            }
          />

          {bankSubView === 'paper' ? (
            <ExamPaperView
              exam={currentExam}
              orderedView={orderedView}
              blueprintStats={blueprintStats}
              filteredItems={filteredItems}
              matrixNumbers={matrixNumbers}
              isLocked={isLocked}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              matrixFilter={matrixFilter}
              setMatrixFilter={setMatrixFilter}
              chapterFilter={chapterFilter}
              setChapterFilter={setChapterFilter}
              activeNavQuestion={activeNavQuestion}
              pasteTarget={pasteTarget}
              setPasteTarget={setPasteTarget}
              onJumpToQuestion={handleJumpToQuestion}
              onEditInStudio={handleEditQuestionInStudio}
              onOpenNodePicker={(q, passageId, passageContent) =>
                setNodePickerState({
                  mode: 'question',
                  question: q,
                  parentPassageLocalId: passageId,
                  passageContent: passageContent || ''
                })
              }
              onAddSingleQuestion={handleAddSingleAndScroll}
              onAddPassageCluster={handleAddPassageCluster}
              onUpdatePassage={handleUpdatePassage}
              onUpdateQuestion={handleUpdateQuestion}
              onZoomImage={(src, caption) => setLightboxImage({ src, caption })}
            />
          ) : (
            <ExamOrganizerTab
              exam={currentExam}
              orderedView={orderedView}
              isLocked={isLocked}
              onApplyExamTransform={(nextExam, msg) => {
                setCurrentExamDirect(nextExam, true);
                if (msg) toast.success(msg);
              }}
              onEditInStudio={handleEditQuestionInStudio}
            />
          )}
        </div>
      )}

      <ExamSharedModals
        controller={controller}
        onJumpToQuestion={handleJumpToQuestion}
        onFilterByChapter={(chapName) => {
          setChapterFilter(chapName);
          setMatrixFilter('all');
          setBankSubView('paper');
        }}
        onSelectExamFromModal={(examSummary) => {
          setSearchQuery('');
          setMatrixFilter('all');
          setChapterFilter('');
          handleLoadExamFromDb(examSummary, { subView: 'paper' });
        }}
      />
    </div>
  );
}

