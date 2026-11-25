import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
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
                Danh Sách Đề Thi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {exams.length} đề
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Xem trực quan, chỉnh sửa, phê duyệt xuất bản hoặc xóa đề thi.
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
            placeholder="Tìm theo tên đề thi, môn học..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-0.5 hidden sm:block" />
          <Select
            size="small"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            sx={{
              height: 32,
              minWidth: 130,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: '#fff',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
            }}
          >
            {FILTER_SUBJECTS.map((s) => (
              <MenuItem key={s.code} value={s.code} sx={{ fontSize: '0.78rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              height: 32,
              minWidth: 135,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: '#fff',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>Mọi trạng thái</MenuItem>
            <MenuItem value="published" sx={{ fontSize: '0.78rem' }}>Đã xuất bản</MenuItem>
            <MenuItem value="draft" sx={{ fontSize: '0.78rem' }}>Chờ duyệt / Nháp</MenuItem>
          </Select>
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
 * Modal Quick-Switcher (MUI Dialog) để chọn & đổi đề thi gọn gàng, sạch sẽ
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

  return (
    <Dialog
      open={Boolean(isOpen)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          maxHeight: '85vh'
        }
      }}
    >
      <DialogTitle sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Đổi Đề Thi
            </Typography>
            <Chip
              size="small"
              label={`${filtered.length}/${exams.length} đề`}
              variant="outlined"
              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, borderColor: '#cbd5e1' }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Tooltip title="Làm mới danh sách">
              <span>
                <IconButton size="small" onClick={() => onRefresh?.(true)} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" onClick={onClose} aria-label="Đóng">
              <X className="w-4 h-4 text-slate-500" />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đề thi, môn học..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-4 h-4 text-slate-400" />
                </InputAdornment>
              ),
              sx: { bgcolor: '#fff', borderRadius: '10px', fontSize: '0.82rem' }
            }}
          />
          <TextField
            select
            size="small"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '10px', fontSize: '0.82rem' } }}
          >
            {FILTER_SUBJECTS.map((s) => (
              <MenuItem key={s.code} value={s.code}>{s.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 135, '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '10px', fontSize: '0.82rem' } }}
          >
            <MenuItem value="all">Mọi trạng thái</MenuItem>
            <MenuItem value="published">Đã duyệt</MenuItem>
            <MenuItem value="draft">Chờ duyệt</MenuItem>
          </TextField>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {loading && exams.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 6, color: 'text.secondary' }}>
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <Typography variant="caption">Đang tải danh sách đề thi...</Typography>
          </Stack>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Không tìm thấy đề thi nào phù hợp.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {filtered.map((exam) => {
              const isBusy = busyExamId === exam.examId;
              const isActive = Boolean(activeExamId && activeExamId === exam.examId);
              return (
                <Paper
                  key={exam.examId}
                  variant="outlined"
                  onClick={() => !isBusy && onSelectExam?.(exam)}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    cursor: isBusy ? 'wait' : 'pointer',
                    borderColor: isActive ? 'primary.main' : '#cbd5e1',
                    bgcolor: isActive ? 'rgba(79,70,229,0.04)' : '#fff',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(79,70,229,0.03)' }
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.4 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                          {exam.title || 'Đề thi chưa đặt tên'}
                        </Typography>
                        <Chip
                          size="small"
                          label={exam.isPublished ? 'Đã duyệt' : 'Chờ duyệt'}
                          color={exam.isPublished ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                        />
                        {isActive && (
                          <Chip
                            size="small"
                            label="Đang mở"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
                        <span className="font-semibold text-indigo-700">{formatSubjectLabel(exam.subjectCode)}</span>
                        <span>•</span>
                        <span>{exam.totalQuestions || 0} câu</span>
                        <span>•</span>
                        <span>{exam.durationMinutes || 150} phút</span>
                        <span>•</span>
                        <span>{exam.createdAtVn || formatExamDate(exam.createdAt)}</span>
                      </Stack>
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant={isActive ? 'outlined' : 'contained'}
                        color="primary"
                        disabled={isBusy}
                        startIcon={isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                        onClick={() => onSelectExam?.(exam)}
                        sx={{ height: 30, px: 1.5, fontSize: '0.75rem', borderRadius: '8px' }}
                      >
                        {isActive ? 'Đang xem' : 'Mở đề'}
                      </Button>

                      {!exam.isPublished && onPublishExam && (
                        <Tooltip title="Phê duyệt & xuất bản">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={isBusy}
                              onClick={() => onPublishExam(exam)}
                              sx={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}
                            >
                              <Send className="w-3.5 h-3.5" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {onDeleteExam && (
                        <Tooltip title="Xóa đề thi">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isBusy}
                              onClick={() => onDeleteExam(exam)}
                              sx={{ border: '1px solid #fecdd3', bgcolor: '#fff1f2', borderRadius: '8px' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
