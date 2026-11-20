import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Edit3,
  FileText,
  GitBranch,
  Layers,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  UploadCloud
} from 'lucide-react';
import ExamBloomAiGeneratorTab from './ExamBloomAiGeneratorTab';
import { ExamPageFlowBar } from './ExamWorkspaceHeader';
import ExamSharedModals from './ExamSharedModals';
import { useExamWorkspaceController } from './useExamWorkspaceController';
import { formatSubjectLabel, formatTimerSeconds } from '../../utils/examParserUtils';

/**
 * Trang 2 (exam-ingest) — 2 Phần Nạp & Sinh Đề Thi:
 *   • Phần 1: Parse Đề Thi PDF Thực Tế (Gemini Vision AI OCR + Nhận diện Node Chương/Bài)
 *   • Phần 2: AI Sinh Câu Hỏi Theo 6 Mức Độ Bloom (L1 – L6) của Skill & Hàng Đợi Kiểm Duyệt
 * Mirrors SGK Page 2 (TextbookIngestView) in the 3-page workflow.
 */
export default function ExamIngestView({ onNavigateTab }) {
  const controller = useExamWorkspaceController({
    onNavigateTab,
    enableClipboardPaste: false
  });

  const {
    currentExam,
    orderedView,
    blueprintStats,
    pendingBloomCount,
    processingJob,
    ingestPart,
    setIngestPart,
    isLocked,
    hasUnsavedChanges,
    savingExam,
    classifyingNodes,
    flatCurriculumNodes,
    aiBloomDrafts,
    setAiBloomDrafts,
    bloomTargetSkillNode,
    setBloomTargetSkillNode,
    dbExams,
    setDbModalOpen,
    fetchDatabaseExams,
    setBlueprintOpen,
    setNodePickerState,
    setLightboxImage,
    handleStartPdfExtraction,
    handleCancelPdfExtraction,
    handleRunAiNodeClassification,
    handleSaveExamToDb,
    requestDeleteExam,
    handleApproveBloomDraft,
    handleApproveAllPendingBloomDrafts,
    setBankSubView
  } = controller;

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDropPdf = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleStartPdfExtraction(file);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F6F5F1] -m-4 sm:-m-6 p-4 sm:p-6 text-slate-900 space-y-4">
      <ExamPageFlowBar
        activePage="exam-ingest"
        onNavigateTab={onNavigateTab}
        pendingBloomCount={pendingBloomCount}
        processingJob={processingJob}
      />

      <div className="max-w-7xl mx-auto space-y-5 pb-8">
        {/* Scholarly Page 2 Header + 2-Part Switcher */}
        <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2F7] border border-[#D4DFED] text-[#1E3A5F] text-[11px] font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Trang 2 / 3 · Nạp Đề PDF (AI Vision OCR) & Sinh Câu Hỏi Bloom 6 Cấp</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Parse Đề Thi PDF & AI Sinh Câu Hỏi Bloom (L1 – L6)
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-600 max-w-3xl leading-relaxed">
                Chọn <strong>Phần 1</strong> để tải đề thi PDF thực tế cho Gemini Vision bóc tách trọn bộ câu hỏi,
                KaTeX & nhận diện Chương/Bài; hoặc chọn <strong>Phần 2</strong> để AI sinh câu hỏi theo đúng Skill
                và 6 mức độ Bloom kèm hàng đợi kiểm duyệt trước khi đưa vào đề.
              </p>
            </div>

            {/* 2-Part Segmented Switch */}
            <nav className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4F3EE] border border-[#E5E3DC] shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setIngestPart('pdf')}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  ingestPart === 'pdf'
                    ? 'bg-[#1E3A5F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Phần 1 · Parse PDF (AI OCR)</span>
              </button>

              <button
                type="button"
                onClick={() => setIngestPart('bloom')}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  ingestPart === 'bloom'
                    ? 'bg-[#1E3A5F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phần 2 · AI Bloom 6 Mức</span>
                {pendingBloomCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {pendingBloomCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* =================================================================
            PHẦN 1: PARSE ĐỀ PDF THỰC TẾ (GEMINI VISION AI OCR)
            ================================================================= */}
        {ingestPart === 'pdf' && (
          <div className="space-y-5">
            {/* Active PDF OCR Job Banner or Dropzone */}
            {processingJob ? (
              <div className="rounded-2xl border border-[#D4DFED] bg-white shadow-sm p-8 text-center space-y-5">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-2xl bg-[#2C4C7E]/20 animate-ping" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-cyan-600 text-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2F7] text-[#1E3A5F] border border-[#D4DFED] text-xs font-extrabold font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimerSeconds(processingJob.elapsedSeconds)}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Đang phân tích đề thi bằng Gemini Vision AI
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">{processingJob.fileName}</p>
                </div>

                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E7E5DF] text-xs text-slate-700 leading-relaxed flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#1E3A5F] animate-spin shrink-0" />
                  <span>{processingJob.step}</span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Bạn có thể chuyển sang Trang 1 hoặc Trang 3 làm việc khác — tiến trình AI OCR vẫn chạy nền và sẽ thông báo ngay khi hoàn tất!
                </p>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleCancelPdfExtraction}
                    className="px-4 py-1.5 rounded-xl border border-[#DCD9D0] hover:bg-[#FAF9F6] text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Hủy theo dõi
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropPdf}
                onClick={() => fileInputRef.current?.click()}
                className={`group rounded-2xl border-2 border-dashed p-9 sm:p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#1E3A5F] bg-[#EEF2F7]/70 scale-[1.003]'
                    : 'border-[#D4DFED] bg-white hover:border-[#2C4C7E] hover:bg-[#FAFBFC]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleStartPdfExtraction(file);
                    e.target.value = '';
                  }}
                />

                <div className="max-w-xl mx-auto flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF2F7] text-[#1E3A5F] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {isDragging
                      ? 'Thả tệp PDF để bắt đầu bóc tách đề thi!'
                      : 'Kéo thả hoặc nhấn chọn tệp Đề thi PDF thực tế (.pdf)'}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Hỗ trợ trọn bộ đề 120 câu ĐGNL / TN THPT · Tự bóc tách chùm đọc hiểu, công thức KaTeX, bảng 2 tầng,
                    biểu đồ tương tác và tự động đối chiếu Chương / Bài / Dạng bài từ{' '}
                    <strong>{flatCurriculumNodes.length} nút Khung chương trình</strong>.
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-extrabold shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                      <span>Chọn tệp PDF từ máy tính</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Result / Active Exam Handoff Card */}
            {currentExam && (
              <div className="rounded-2xl border border-emerald-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {currentExam.source === 'ai'
                          ? 'Đề vừa bóc tách bởi Gemini Vision AI — Sẵn sàng rà soát & lưu Database'
                          : 'Đề thi đang mở trong phiên làm việc'}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{currentExam.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-[#EEF2F7] text-[#1E3A5F] font-bold">
                        {formatSubjectLabel(currentExam.subjectCode)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{orderedView.stats.totalQuestions}</strong> câu hỏi
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{orderedView.stats.totalPassages}</strong> chùm ·{' '}
                        <strong>{orderedView.stats.totalSingles}</strong> đơn
                      </span>
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                        <GitBranch className="w-3.5 h-3.5" />
                        Đã nhận diện Node: {blueprintStats.mappedCount}/{blueprintStats.totalQuestions} câu
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={classifyingNodes || flatCurriculumNodes.length === 0 || isLocked}
                      onClick={handleRunAiNodeClassification}
                      className="px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {classifyingNodes ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <GitBranch className="w-3.5 h-3.5" />
                      )}
                      <span>{classifyingNodes ? 'Đang gắn Node...' : 'AI Gắn Chương/Bài'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBlueprintOpen(true)}
                      className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Ma Trận Đề</span>
                    </button>

                    {(currentExam.source !== 'database' || hasUnsavedChanges) && (
                      <button
                        type="button"
                        disabled={savingExam}
                        onClick={handleSaveExamToDb}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {savingExam ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Lưu Database</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => requestDeleteExam(currentExam)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Đề</span>
                    </button>
                  </div>
                </div>

                {/* Quick Cross-Page Next Steps */}
                <div className="pt-3 border-t border-[#ECEAE4] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBankSubView('paper');
                      onNavigateTab?.('exam-bank');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Mở Xem Đề & Sắp Xếp (Trang 1)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('exam-studio')}
                    className="px-3.5 py-2 rounded-xl border border-[#D4DFED] bg-[#EEF2F7] hover:bg-[#E2EAF4] text-[#1E3A5F] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mở Studio Sửa Từng Câu (Trang 3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIngestPart('bloom')}
                    className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sinh thêm câu Bloom L1–L6 vào đề này</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            PHẦN 2: AI SINH CÂU HỎI THEO 6 MỨC ĐỘ BLOOM (L1 – L6) + HÀNG ĐỢI DUYỆT
            ================================================================= */}
        {ingestPart === 'bloom' && (
          <div className="space-y-4">
            {/* Target Exam Context Bar */}
            <div className="rounded-2xl border border-[#E7E5DF] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2F7] text-[#1E3A5F] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Đề thi đích khi phê duyệt câu hỏi AI
                  </div>
                  {currentExam ? (
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {currentExam.title}{' '}
                      <span className="font-semibold text-slate-500">
                        ({orderedView.stats.totalQuestions} câu hiện có)
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">
                      Chưa chọn đề — khi nhấn <strong>Duyệt & Thêm vào Đề</strong>, hệ thống sẽ tự tạo đề mới cho bạn!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setDbModalOpen(true);
                    fetchDatabaseExams(false);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-xs font-bold text-[#1E3A5F] flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{currentExam ? `Đổi Đề Đích (${dbExams.length})` : `Chọn Đề Có Sẵn (${dbExams.length})`}</span>
                </button>

                {currentExam && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setBankSubView('paper');
                        onNavigateTab?.('exam-bank');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-white hover:bg-[#FAF9F6] text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#1E3A5F]" />
                      <span>Xem Đề</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('exam-studio')}
                      className="px-3 py-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Mở Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDeleteExam(currentExam)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Đề</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <ExamBloomAiGeneratorTab
              exam={currentExam}
              isLocked={isLocked}
              flatCurriculumNodes={flatCurriculumNodes}
              drafts={aiBloomDrafts}
              setDrafts={setAiBloomDrafts}
              selectedSkillNode={bloomTargetSkillNode}
              onSelectSkillNode={setBloomTargetSkillNode}
              onOpenSkillPicker={() => setNodePickerState({ mode: 'bloom-skill' })}
              onApproveDraft={handleApproveBloomDraft}
              onApproveAllPending={handleApproveAllPendingBloomDrafts}
              onZoomImage={(src, caption) => setLightboxImage({ src, caption })}
            />
          </div>
        )}
      </div>

      <ExamSharedModals
        controller={controller}
        onJumpToQuestion={(num) => {
          const qObj = orderedView.questionMap.get(num);
          if (qObj) {
            controller.setSelectedQuestionLocalId(qObj.localId);
          }
          onNavigateTab?.('exam-studio');
        }}
        onFilterByChapter={() => {
          setBankSubView('paper');
          onNavigateTab?.('exam-bank');
        }}
      />
    </div>
  );
}
