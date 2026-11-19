import React, { useMemo, useState } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Send,
  Calendar,
  Tag,
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { formatSubjectLabel, formatExamDate } from '../../utils/examParserUtils';

const FILTER_SUBJECTS = [
  { code: 'ALL', label: 'Tất cả môn' },
  { code: 'MATH', label: 'Toán' },
  { code: 'VIET', label: 'Tiếng Việt' },
  { code: 'ENGL', label: 'Tiếng Anh' },
  { code: 'PHYS', label: 'Vật lý' },
  { code: 'CHEM', label: 'Hóa học' },
  { code: 'BIOL', label: 'Sinh học' },
  { code: 'LOGIC', label: 'Logic' },
  { code: 'GENERAL', label: 'Tổng hợp' }
];

function useFilteredExams(exams, query, subjectFilter, statusFilter) {
  return useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return (exams || []).filter((e) => {
      const code = (e.subjectCode || 'GENERAL').toUpperCase();
      if (subjectFilter !== 'ALL' && code !== subjectFilter) return false;
      if (statusFilter === 'published' && !e.isPublished) return false;
      if (statusFilter === 'draft' && e.isPublished) return false;
      if (!q) return true;
      const titleMatch = (e.title || '').toLowerCase().includes(q);
      const subjectMatch = code.toLowerCase().includes(q) || formatSubjectLabel(code).toLowerCase().includes(q);
      const catMatch = (e.examCategory || '').toLowerCase().includes(q);
      return titleMatch || subjectMatch || catMatch;
    });
  }, [exams, query, subjectFilter, statusFilter]);
}

/**
 * Inline Database Saved Exams Grid shown on Home Hub below PDF Upload Box
 */
export function ExamDatabaseCardsGrid({
  exams = [],
  loading = false,
  error = null,
  activeExamId = null,
  busyExamId = null,
  onRefresh,
  onSelectExam,
  onPublishExam,
  onDeleteExam
}) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useFilteredExams(exams, search, subjectFilter, statusFilter);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-slate-900">
                Kho Đề Thi Database (Supabase PostgreSQL)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {exams.length} đề
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Đồng bộ 2 chiều với Content Service — xem trực quan, hiệu đính, phê duyệt xuất bản hoặc xóa đề.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRefresh?.(true)}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đề thi, mã môn (MATH, VIET, PHYS)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-0.5 hidden sm:block" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {FILTER_SUBJECTS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Chờ duyệt / Nháp</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {loading && exams.length === 0 ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs font-medium">Đang tải danh sách đề thi từ Database...</span>
          </div>
        ) : error ? (
          <div className="p-5 rounded-xl border border-dashed border-rose-300 bg-rose-50/70 text-rose-800 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
            <div className="text-xs font-bold">Không thể kết nối tới Content Service</div>
            <div className="text-[11.5px] text-rose-700/90">{error}</div>
            <button
              type="button"
              onClick={() => onRefresh?.(true)}
              className="mt-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              Thử kết nối lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-1.5">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {exams.length === 0 ? 'Chưa có đề thi nào trong Database' : 'Không tìm thấy đề thi phù hợp bộ lọc'}
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {exams.length === 0
                ? 'Hãy kéo thả tệp đề thi PDF ở khung phía trên để Gemini Vision AI bóc tách tự động và lưu vào ngân hàng đề.'
                : 'Thử xóa từ khóa tìm kiếm hoặc chọn "Tất cả môn" để xem toàn bộ kho đề.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filtered.map((exam) => {
              const isBusy = busyExamId === exam.examId;
              const isActive = activeExamId && activeExamId === exam.examId;
              return (
                <div
                  key={exam.examId}
                  className={`group rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-500/15'
                      : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-[13.5px] font-bold text-slate-900 line-clamp-2 leading-snug"
                        title={exam.title}
                      >
                        {exam.title || 'Đề thi chưa đặt tên'}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {exam.isPublished ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200/80 font-semibold">
                        <Tag className="w-3 h-3" />
                        {formatSubjectLabel(exam.subjectCode)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        <FileText className="w-3 h-3 text-slate-500" />
                        {exam.totalQuestions || 0} câu
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {exam.durationMinutes || 150} phút
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{exam.createdAtVn || formatExamDate(exam.createdAt)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onSelectExam?.(exam)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>Xem Đề</span>
                    </button>

                    {!exam.isPublished && onPublishExam && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onPublishExam(exam)}
                        title="Phê duyệt & xuất bản đề thi"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duyệt</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDeleteExam?.(exam)}
                      title="Xóa đề thi khỏi Database"
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Modal Quick-Switcher for browsing & loading Database exams while inside Exam Viewer
 */
export default function ExamDatabaseModal({
  isOpen,
  onClose,
  exams = [],
  loading = false,
  activeExamId = null,
  busyExamId = null,
  onRefresh,
  onSelectExam,
  onPublishExam,
  onDeleteExam
}) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useFilteredExams(exams, search, subjectFilter, statusFilter);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-3xl max-h-[86vh] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 to-cyan-50/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Kho Đề Thi Trong Database</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {exams.length} đề
                </span>
              </div>
              <p className="text-xs text-slate-500">Chọn đề thi để nạp lên Studio xem & hiệu đính</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên đề thi, mã môn (MATH, VIET, PHYS)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            {FILTER_SUBJECTS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đã duyệt</option>
            <option value="draft">Chờ duyệt</option>
          </select>

          <button
            type="button"
            onClick={() => onRefresh?.(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {loading && exams.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs">Đang đồng bộ danh sách đề thi...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Không tìm thấy đề thi nào phù hợp.
            </div>
          ) : (
            filtered.map((exam) => {
              const isBusy = busyExamId === exam.examId;
              const isActive = activeExamId && activeExamId === exam.examId;
              return (
                <div
                  key={exam.examId}
                  className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {exam.title || 'Đề thi chưa đặt tên'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {exam.isPublished ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500">
                      <span className="font-semibold text-cyan-700">
                        {formatSubjectLabel(exam.subjectCode)}
                      </span>
                      <span>•</span>
                      <span>{exam.totalQuestions || 0} câu hỏi</span>
                      <span>•</span>
                      <span>{exam.durationMinutes || 150} phút</span>
                      <span>•</span>
                      <span>{exam.createdAtVn || formatExamDate(exam.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onSelectExam?.(exam)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>Mở Đề</span>
                    </button>

                    {!exam.isPublished && onPublishExam && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onPublishExam(exam)}
                        title="Phê duyệt & xuất bản"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDeleteExam?.(exam)}
                      title="Xóa đề thi khỏi Database"
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

