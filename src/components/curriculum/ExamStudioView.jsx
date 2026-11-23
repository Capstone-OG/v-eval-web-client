import React from 'react';
import {
  ArrowUpDown,
  BookOpen,
  Edit3,
  PenTool,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { ExamDatabaseCardsGrid } from './ExamDatabaseModal';
import ExamQuestionStudioTab from './ExamQuestionStudioTab';
import ExamWorkspaceHeader, { ExamPageFlowBar } from './ExamWorkspaceHeader';
import ExamSharedModals from './ExamSharedModals';
import { useExamWorkspaceController } from './useExamWorkspaceController';

/**
 * Trang 3 (exam-studio) — Studio Biên Soạn Từng Câu Hỏi Đề Thi (2-Pane Editor + Full 838-Item Studio)
 * Mirrors SGK Page 3 (TextbookStudioView) in the 3-page workflow.
 */
export default function ExamStudioView({ onNavigateTab }) {
  const controller = useExamWorkspaceController({
    onNavigateTab,
    enableClipboardPaste: true
  });

  const {
    currentExam,
    orderedView,
    selectedQuestionLocalId,
    setSelectedQuestionLocalId,
    pendingBloomCount,
    processingJob,
    isLocked,
    dbExams,
    dbLoading,
    dbError,
    busyExamId,
    fetchDatabaseExams,
    handleCreateBlankExam,
    handleLoadExamFromDb,
    handlePublishExam,
    requestDeleteExam,
    handleUpdateQuestion,
    handleUpdatePassage,
    handleAddSingleQuestion,
    handleAddPassageCluster,
    handleDuplicateQuestion,
    requestDeleteQuestion,
    setNodePickerState,
    setFullStudioTarget,
    setLightboxImage,
    setPasteTarget,
    setBankSubView,
    setIngestPart
  } = controller;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F6F5F1] -m-4 sm:-m-6 p-4 sm:p-6 text-slate-900 space-y-4">
      <ExamPageFlowBar
        activePage="exam-studio"
        onNavigateTab={onNavigateTab}
        pendingBloomCount={pendingBloomCount}
        processingJob={processingJob}
      />

      {!currentExam ? (
        <div className="max-w-7xl mx-auto space-y-5 pb-8">
          {/* Studio Quick-Start Banner */}
          <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2F7] border border-[#D4DFED] text-[#1E3A5F] text-[11px] font-extrabold">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trang 3 / 3 · Studio Biên Soạn Từng Câu Hỏi Đề Thi</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Studio Biên Soạn & Chỉnh Sửa Từng Câu Hỏi
                </h1>
                <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                  Chọn một đề thi bên dưới để bắt đầu biên tập từng câu hỏi trong giao diện 2 cột (KaTeX live preview,
                  6 mức độ Bloom, gắn Node Chương/Bài, dán ảnh <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">Ctrl+V</kbd>,
                  và tích hợp Full Studio 838 ký hiệu &amp; 3D MathLab) — hoặc tạo mới đề thi ngay lập tức.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCreateBlankExam({ navigateTo: null })}
                  className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tạo Đề Trống &amp; Soạn Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIngestPart('pdf');
                    onNavigateTab?.('exam-ingest');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-2 cursor-pointer"
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
                  className="px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Bloom L1–L6</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct Database Exam Selector to enter Studio in 1 click */}
          <ExamDatabaseCardsGrid
            exams={dbExams}
            loading={dbLoading}
            error={dbError}
            activeExamId={currentExam?.examId}
            busyExamId={busyExamId}
            onRefresh={fetchDatabaseExams}
            onSelectExam={(examSummary) => handleLoadExamFromDb(examSummary)}
            onPublishExam={handlePublishExam}
            onDeleteExam={requestDeleteExam}
          />
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          <ExamWorkspaceHeader
            controller={controller}
            activePage="exam-studio"
            onNavigateTab={onNavigateTab}
            showBackToBank={false}
            leftRow2Slot={
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-extrabold">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Studio Sửa Từng Câu</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setBankSubView('paper');
                    onNavigateTab?.('exam-bank');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem Tờ Đề (Trang 1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBankSubView('organize');
                    onNavigateTab?.('exam-bank');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sắp Xếp Đề</span>
                </button>
              </>
            }
          />

          <ExamQuestionStudioTab
            exam={currentExam}
            orderedView={orderedView}
            isLocked={isLocked}
            selectedQuestionLocalId={selectedQuestionLocalId}
            onSelectQuestionLocalId={setSelectedQuestionLocalId}
            onUpdateQuestion={handleUpdateQuestion}
            onUpdatePassage={handleUpdatePassage}
            onAddSingleQuestion={handleAddSingleQuestion}
            onAddPassageCluster={handleAddPassageCluster}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={requestDeleteQuestion}
            onOpenNodePicker={(q, passageId, passageContent) =>
              setNodePickerState({
                mode: 'question',
                question: q,
                parentPassageLocalId: passageId,
                passageContent: passageContent || ''
              })
            }
            onOpenFullStudio={(questionObj, passageId) =>
              setFullStudioTarget({ question: questionObj, parentPassageLocalId: passageId })
            }
            onZoomImage={(src, caption) => setLightboxImage({ src, caption })}
            onHoverTarget={setPasteTarget}
          />
        </div>
      )}

      <ExamSharedModals
        controller={controller}
        onJumpToQuestion={(num) => {
          const qObj = orderedView.questionMap.get(num);
          if (qObj) setSelectedQuestionLocalId(qObj.localId);
        }}
        onFilterByChapter={() => {
          setBankSubView('paper');
          onNavigateTab?.('exam-bank');
        }}
      />
    </div>
  );
}
