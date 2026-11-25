import React, { useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  Database,
  Edit3,
  Layers,
  Loader2,
  Lock,
  Save,
  Send,
  Sparkles,
  Trash2,
  Unlock,
  UploadCloud,
  Wand2
} from 'lucide-react';
import {
  SUBJECT_OPTIONS,
  EXAM_CATEGORY_OPTIONS,
  formatTimerSeconds
} from '../../utils/examParserUtils';
import aiService from '../../services/aiService';
import { toast } from '../../context/ToastContext';

const EXAM_FLOW_PAGES = [
  { id: 'exam-bank', step: '1', label: 'Kho Đề', icon: BookOpen },
  { id: 'exam-ingest', step: '2', label: 'Phân Tích Đề', icon: UploadCloud },
  { id: 'exam-studio', step: '3', label: 'Studio Biên Soạn', icon: Edit3 }
];

/**
 * ExamPageFlowBar — Bỏ thanh 3 nút điều hướng dư thừa; chỉ hiện pill nhỏ khi đang có tiến trình phân tích chạy nền
 */
export function ExamPageFlowBar({ onNavigateTab, processingJob = null }) {
  if (!processingJob) return null;
  return (
    <div className="flex items-center justify-end print:hidden">
      <button
        type="button"
        onClick={() => onNavigateTab?.('exam-ingest')}
        className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-bold flex items-center gap-2 hover:bg-cyan-100 cursor-pointer"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-700" />
        <span className="truncate max-w-[180px]">Đang phân tích: {processingJob.fileName}</span>
        <span className="font-mono text-[11px] font-extrabold text-cyan-700">
          {formatTimerSeconds(processingJob.elapsedSeconds)}
        </span>
      </button>
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
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [solutionProgress, setSolutionProgress] = useState({ done: 0, total: 0 });
  const {
    currentExam,
    orderedView,
    isLocked,
    hasUnsavedChanges,
    dbExams,
    savingExam,
    publishingExam,
    mutateExam,
    toggleLock,
    setBlueprintOpen,
    setDbModalOpen,
    fetchDatabaseExams,
    handleSaveExamToDb,
    handlePublishExam,
    requestDeleteExam,
    handleCloseExamToBank
  } = controller;

  if (!currentExam) return null;
  const { stats, allQuestions } = orderedView;

  const handleAutoGenerateExplanations = async () => {
    if (generatingSolutions || isLocked) return;
    const missing = (allQuestions || []).filter((q) => !String(q.explanation || '').trim());
    const targets =
      missing.length > 0
        ? missing
        : window.confirm('Tất cả câu hỏi trong đề đều đã có lời giải. Bạn có muốn AI viết lại lời giải mới cho toàn bộ đề không?')
        ? allQuestions || []
        : [];
    if (targets.length === 0) return;

    setGeneratingSolutions(true);
    setSolutionProgress({ done: 0, total: targets.length });
    let successCount = 0;

    try {
      for (let i = 0; i < targets.length; i++) {
        const q = targets[i];
        const optsText = ['A', 'B', 'C', 'D']
          .map((k) => `${k}. ${q.options?.[k] || ''}`)
          .join('\n');
        const prompt =
          `Hãy viết lời giải chi tiết, ngắn gọn, dễ hiểu bằng tiếng Việt (dùng công thức KaTeX dạng $...$ nếu có toán/lý/hóa) cho câu trắc nghiệm sau. ` +
          `Chỉ trả về phần lời giải trực tiếp, không mở đầu/chào hỏi.\n\n` +
          `Câu hỏi: ${q.content || ''}\n${optsText}\nĐáp án đúng: ${q.correctOption || 'A'}`;
        try {
          const res = await aiService.askSocraticTutor({
            question: prompt,
            sessionId: `exam-explain-${currentExam.examId || 'draft'}-${q.localId}`
          });
          const answerText = String(res?.answer || res?.response || res?.reply || res?.content || '').trim();
          if (answerText) {
            successCount += 1;
            mutateExam((prev) => ({
              ...prev,
              questions: (prev.questions || []).map((item) =>
                item.localId === q.localId ? { ...item, explanation: answerText } : item
              ),
              passages: (prev.passages || []).map((p) => ({
                ...p,
                questions: (p.questions || []).map((item) =>
                  item.localId === q.localId ? { ...item, explanation: answerText } : item
                )
              }))
            }));
          }
        } catch {
          // Tiếp tục câu tiếp theo nếu 1 câu lỗi mạng
        }
        setSolutionProgress({ done: i + 1, total: targets.length });
      }
      if (successCount > 0) {
        toast.success(`AI đã tự động tạo lời giải cho ${successCount}/${targets.length} câu hỏi. Nhấn nút Lưu để cập nhật đề!`);
      } else {
        toast.warning('Chưa thể tạo lời giải từ AI Engine. Vui lòng kiểm tra kết nối AI Service.');
      }
    } finally {
      setGeneratingSolutions(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 rounded-2xl border border-[#E7E5DF] bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(15,23,42,0.04)] px-4 py-2.5 space-y-2 print:hidden">
      {/* Row 1: Back + Title + Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBackToBank && (
            <button
              type="button"
              onClick={handleCloseExamToBank}
              title="Quay lại Kho Đề"
              aria-label="Quay lại Kho Đề"
              className="p-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
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
          </button>

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
              <span>Chế độ xem đề thi</span>
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

              {(() => {
                const canSave = currentExam.source !== 'database' || hasUnsavedChanges;
                return (
                  <button
                    type="button"
                    disabled={savingExam || !canSave}
                    onClick={handleSaveExamToDb}
                    title={!canSave ? 'Chưa có thay đổi nào để lưu' : isTeacher ? 'Lưu bản nháp' : 'Lưu đề thi'}
                    aria-label={isTeacher ? 'Lưu bản nháp' : 'Lưu đề thi'}
                    className={`p-1.5 rounded-xl flex items-center justify-center transition-colors ${
                      canSave
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer disabled:opacity-60'
                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {savingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                );
              })()}

              {/* Action theo vai trò Maker vs Checker */}
              {isTeacher ? (
                <button
                  type="button"
                  disabled={publishingExam}
                  onClick={() => {
                    toast.success('Đã gửi đề thi lên Giám đốc Học thuật chờ duyệt!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Gửi đề thi lên Giám đốc Học thuật phê duyệt xuất bản toàn hệ thống"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi duyệt</span>
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
                  title="Xóa đề thi"
                  aria-label="Xóa đề thi"
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
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
            <>
              <button
                type="button"
                onClick={() => {
                  controller.setIngestPart('bloom');
                  onNavigateTab?.('exam-ingest');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tạo Câu Hỏi</span>
              </button>

              {!isLocked && (
                <button
                  type="button"
                  disabled={generatingSolutions || (allQuestions || []).length === 0}
                  onClick={handleAutoGenerateExplanations}
                  title="Tự động tạo lời giải chi tiết cho các câu chưa có lời giải trong đề"
                  className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {generatingSolutions ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>
                    {generatingSolutions
                      ? `Đang tạo (${solutionProgress.done}/${solutionProgress.total})...`
                      : 'Tạo Lời Giải'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Compact Exam Metadata (MUI Select) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Select
            size="small"
            disabled={isLocked}
            value={currentExam.subjectCode || 'GENERAL'}
            onChange={(e) => mutateExam((prev) => ({ ...prev, subjectCode: e.target.value }))}
            sx={{
              height: 30,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1E3A5F',
              bgcolor: '#FAF9F6',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
              '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
            }}
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: '10px', mt: 0.5, border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' }
              }
            }}
          >
            {SUBJECT_OPTIONS.map((s) => (
              <MenuItem key={s.code} value={s.code} sx={{ fontSize: '0.78rem', fontWeight: 600, py: 0.75 }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            disabled={isLocked}
            value={currentExam.examCategory || 'TOPIC'}
            onChange={(e) => mutateExam((prev) => ({ ...prev, examCategory: e.target.value }))}
            sx={{
              height: 30,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#334155',
              bgcolor: '#FAF9F6',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
              '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
            }}
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: '10px', mt: 0.5, border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' }
              }
            }}
          >
            {EXAM_CATEGORY_OPTIONS.map((c) => (
              <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.78rem', fontWeight: 600, py: 0.75 }}>
                {c.label}
              </MenuItem>
            ))}
          </Select>

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
