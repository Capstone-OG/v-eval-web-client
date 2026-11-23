import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  Database,
  Edit3,
  GitBranch,
  Layers,
  Loader2,
  Lock,
  Save,
  Send,
  Sparkles,
  Trash2,
  Unlock,
  UploadCloud
} from 'lucide-react';
import {
  SUBJECT_OPTIONS,
  EXAM_CATEGORY_OPTIONS,
  formatTimerSeconds
} from '../../utils/examParserUtils';

const EXAM_FLOW_PAGES = [
  { id: 'exam-bank', step: '1', label: 'Kho Đề & Xem Đề', icon: BookOpen },
  { id: 'exam-ingest', step: '2', label: 'Parse PDF & AI Bloom', icon: UploadCloud },
  { id: 'exam-studio', step: '3', label: 'Studio Biên Soạn', icon: Edit3 }
];

/**
 * ExamPageFlowBar — Lightweight 3-step cross-page navigation strip mirroring SGK's 3-page flow
 */
export function ExamPageFlowBar({ activePage, onNavigateTab, pendingBloomCount = 0, processingJob = null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_1px_6px_rgba(15,23,42,0.03)] print:hidden">
      <div className="flex items-center gap-1.5 flex-wrap">
        {EXAM_FLOW_PAGES.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.id;
          const showBloomBadge = page.id === 'exam-ingest' && pendingBloomCount > 0;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onNavigateTab?.(page.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'bg-[#FAF9F6] text-slate-600 hover:bg-[#EEF2F7] hover:text-[#1E3A5F] border border-[#ECEAE4]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                  active ? 'bg-white/20 text-white' : 'bg-[#E7E5DF] text-slate-700'
                }`}
              >
                {page.step}
              </span>
              <Icon className="w-3.5 h-3.5" />
              <span>{page.label}</span>
              {showBloomBadge && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                  {pendingBloomCount} chờ duyệt
                </span>
              )}
            </button>
          );
        })}
      </div>

      {processingJob && (
        <button
          type="button"
          onClick={() => onNavigateTab?.('exam-ingest')}
          className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold flex items-center gap-2 hover:bg-cyan-100 cursor-pointer"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-700" />
          <span className="truncate max-w-[180px]">AI OCR: {processingJob.fileName}</span>
          <span className="font-mono text-[11px] font-extrabold text-cyan-700">
            {formatTimerSeconds(processingJob.elapsedSeconds)}
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * ExamWorkspaceHeader — Sticky scholarly header shared when an Exam is active on Page 1 (Bank) or Page 3 (Studio)
 */
export default function ExamWorkspaceHeader({
  controller,
  activePage,
  onNavigateTab,
  showBackToBank = false,
  leftRow2Slot = null,
  isReadOnly = false,
  role = 'director'
}) {
  const isTeacher = role === 'teacher';
  const {
    currentExam,
    orderedView,
    blueprintStats,
    isLocked,
    hasUnsavedChanges,
    dbExams,
    classifyingNodes,
    flatCurriculumNodes,
    savingExam,
    publishingExam,
    mutateExam,
    toggleLock,
    setBlueprintOpen,
    setDbModalOpen,
    fetchDatabaseExams,
    handleRunAiNodeClassification,
    handleSaveExamToDb,
    handlePublishExam,
    requestDeleteExam,
    handleCloseExamToBank
  } = controller;

  if (!currentExam) return null;
  const { stats } = orderedView;

  return (
    <header className="sticky top-0 z-30 rounded-2xl border border-[#E7E5DF] bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(15,23,42,0.04)] px-4 py-3 space-y-3 print:hidden">
      {/* Row 1: Back + Title + Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBackToBank && (
            <button
              type="button"
              onClick={handleCloseExamToBank}
              title="Đóng đề hiện tại và quay lại danh sách Kho Đề"
              className="px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-xs font-bold text-[#1E3A5F] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh Sách Kho</span>
            </button>
          )}

          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            {isLocked ? (
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {currentExam.title}
              </h1>
            ) : (
              <input
                type="text"
                value={currentExam.title}
                onChange={(e) => mutateExam((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề đề thi..."
                className="flex-1 min-w-[180px] max-w-lg px-2.5 py-1 rounded-xl border border-transparent hover:border-[#DCD9D0] focus:border-[#2C4C7E] bg-[#FAF9F6] focus:bg-white text-sm sm:text-[15px] font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/15"
              />
            )}

            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${
                currentExam.source === 'database'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentExam.source === 'manual'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}
            >
              {currentExam.source === 'database'
                ? 'Supabase DB'
                : currentExam.source === 'manual'
                ? 'Soạn thủ công'
                : 'Gemini Vision AI'}
            </span>

            {currentExam.source === 'database' && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${
                  currentExam.isPublished
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {currentExam.isPublished ? 'Đã duyệt' : 'Chờ duyệt'}
              </span>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setBlueprintOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-bold text-indigo-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ma Trận</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
              {blueprintStats.mappedCount}/{blueprintStats.totalQuestions}
            </span>
          </button>

          {!isReadOnly && !isLocked && (
            <button
              type="button"
              disabled={classifyingNodes || flatCurriculumNodes.length === 0}
              onClick={handleRunAiNodeClassification}
              className="px-2.5 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {classifyingNodes ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GitBranch className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {classifyingNodes ? 'Đang gắn...' : 'AI Gắn Chương/Bài'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setDbModalOpen(true);
              fetchDatabaseExams(false);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] bg-white hover:bg-[#FAF9F6] text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span className="hidden lg:inline">Đổi Đề ({dbExams.length})</span>
          </button>

          {isReadOnly ? (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chế độ Xem Đề (Read-only)</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleLock}
                title={isLocked ? 'Mở khóa chỉnh sửa' : 'Khóa chỉnh sửa'}
                className={`p-1.5 rounded-xl border cursor-pointer ${
                  isLocked
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-[#E5E3DC] text-slate-600 hover:bg-[#FAF9F6]'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              {(currentExam.source !== 'database' || hasUnsavedChanges) && (
                <button
                  type="button"
                  disabled={savingExam}
                  onClick={handleSaveExamToDb}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {savingExam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isTeacher ? 'Lưu Bản Nháp' : currentExam.source === 'database' ? 'Lưu Bản Mới' : 'Lưu Database'}</span>
                </button>
              )}

              {/* Action theo vai trò Maker vs Checker */}
              {isTeacher ? (
                <button
                  type="button"
                  disabled={publishingExam}
                  onClick={() => {
                    toast.success('Đã gửi đề thi lên Giám đốc Học thuật chờ duyệt (PENDING_REVIEW)!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Gửi đề thi lên Giám đốc Học thuật phê duyệt xuất bản toàn hệ thống"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi duyệt (PENDING_REVIEW)</span>
                </button>
              ) : (
                currentExam.source === 'database' && currentExam.examId && !currentExam.isPublished && (
                  <button
                    type="button"
                    disabled={publishingExam}
                    onClick={() => handlePublishExam(currentExam)}
                    className="px-3 py-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {publishingExam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Phê Duyệt</span>
                  </button>
                )
              )}

              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => requestDeleteExam(currentExam)}
                  title={
                    currentExam.source === 'database' && currentExam.examId
                      ? 'Xóa vĩnh viễn đề thi khỏi Database'
                      : 'Xóa đề thi đang soạn khỏi phiên làm việc'
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Đề</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 2: Page-Specific Sub-Tabs/Shortcuts + Compact Exam Metadata */}
      <div className="pt-2.5 border-t border-[#ECEAE4] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {leftRow2Slot}

          {activePage !== 'exam-ingest' && !isReadOnly && (
            <button
              type="button"
              onClick={() => {
                controller.setIngestPart('bloom');
                onNavigateTab?.('exam-ingest');
              }}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Sinh Thêm Câu Bloom</span>
            </button>
          )}
        </div>

        {/* Compact Exam Metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <select
            disabled={isLocked}
            value={currentExam.subjectCode}
            onChange={(e) => mutateExam((prev) => ({ ...prev, subjectCode: e.target.value }))}
            className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-bold text-[#1E3A5F] disabled:opacity-70"
          >
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            disabled={isLocked}
            value={currentExam.examCategory}
            onChange={(e) => mutateExam((prev) => ({ ...prev, examCategory: e.target.value }))}
            className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-semibold text-slate-700 disabled:opacity-70"
          >
            {EXAM_CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min={5}
              max={300}
              disabled={isLocked}
              value={currentExam.durationMinutes}
              onChange={(e) =>
                mutateExam((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 150 }))
              }
              className="w-11 bg-transparent font-mono font-bold text-slate-900 focus:outline-none text-center"
            />
            <span className="text-slate-500">ph</span>
          </label>

          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#EEF2F7] text-[#1E3A5F] text-[11px] font-bold">
            <Layers className="w-3 h-3" /> {stats.totalQuestions} câu · {stats.totalPassages} chùm
          </span>
        </div>
      </div>
    </header>
  );
}

