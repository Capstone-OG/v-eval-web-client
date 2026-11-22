import { useState } from 'react';
import { BookOpen, ClipboardCheck, FileCheck2, History, ArrowLeft, Brain } from 'lucide-react';
import DiagnosticAssessmentPage from './DiagnosticAssessmentPage';
import MistakeNotebookSM2View from '../dashboard/MistakeNotebookSM2View';
import { practiceService } from '../../services/practiceService';
import MathText from '../common/MathText';

const categories = [
  { id: 'diagnostic', label: 'Đầu vào', icon: ClipboardCheck },
  { id: 'practice', label: 'Luyện tập', icon: BookOpen },
  { id: 'mock', label: 'Thi thử', icon: FileCheck2 },
  { id: 'mistakes', label: 'Sổ tay lỗi sai', icon: Brain }
];

export default function StudentHistoryPage({ currentUser, onOpenDiagnostic, onOpenAiTutorWithContext }) {
  const [category, setCategory] = useState('diagnostic');
  const [selected, setSelected] = useState(null);
  const [diagnosticDetailOpen, setDiagnosticDetailOpen] = useState(false);
  const detailOpen = category === 'diagnostic' ? diagnosticDetailOpen : Boolean(selected);
  const owner = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const allLocal = practiceService.getSubmissionHistory();
  const localPractice = allLocal.filter((item) =>
    (!item.studentId || item.studentId === owner) && ['ZPD_QUIZ', 'TOPIC_QUIZ'].includes(item.examType));
  const localMocks = allLocal.filter((item) =>
    (!item.studentId || item.studentId === owner) && item.examType === 'MOCK_EXAM');

  const subtitleMap = {
    diagnostic: 'Kết quả đánh giá đầu vào',
    practice: 'Các bài luyện tập đã lưu',
    mock: 'Kết quả các lần thi thử V-ACT',
    mistakes: 'Sổ tay lỗi sai SM-2: gắn nhãn nguyên nhân & ôn tập biến thể mỗi ngày'
  };

  const accentMap = {
    diagnostic: { from: 'from-indigo-500', to: 'to-blue-500', light: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-200', active: 'text-indigo-700', indicator: 'bg-indigo-500' },
    practice:   { from: 'from-emerald-500', to: 'to-teal-500', light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', active: 'text-emerald-700', indicator: 'bg-emerald-500' },
    mock:       { from: 'from-violet-500', to: 'to-purple-500', light: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200', active: 'text-violet-700', indicator: 'bg-violet-500' },
    mistakes:   { from: 'from-rose-500', to: 'to-amber-500', light: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200', active: 'text-rose-700', indicator: 'bg-rose-500' },
  };
  const accent = accentMap[category];

  return <div className="min-w-0 space-y-5">
    {!detailOpen && (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Thin gradient top accent line */}
        <div className={`h-1 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3.5">
            <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.from} ${accent.to} shadow-sm`}>
              <History className="h-5 w-5 text-white" />
              {/* Live dot */}
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight tracking-tight">Lịch sử & Lỗi sai</h1>
              <p className={`text-xs font-semibold ${accent.text} transition-all mt-0.5`}>{subtitleMap[category]}</p>
            </div>
          </div>

          {/* Right: pill tab switcher */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl bg-slate-100/80 p-1.5"
            role="tablist"
            aria-label="Loại bài làm"
          >
            {categories.map(({ id, label, icon: Icon }) => {
              const isActive = category === id;
              const a = accentMap[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`history-tab-${id}`}
                  aria-selected={isActive}
                  aria-controls="history-category-content"
                  onClick={() => { setCategory(id); setSelected(null); }}
                  className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                    isActive
                      ? `bg-white shadow-sm ring-1 ${a.ring} ${a.active}`
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                  }`}
                >
                  {isActive && (
                    <span className={`absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full ${a.indicator}`} />
                  )}
                  <Icon className={`h-3.5 w-3.5 ${isActive ? a.text : ''}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}
    <div key={`${owner}-${category}`} id="history-category-content" role={detailOpen ? 'region' : 'tabpanel'}
      aria-labelledby={detailOpen ? undefined : `history-tab-${category}`} aria-label={detailOpen ? 'Chi tiết kết quả bài làm' : undefined}>
      {category === 'diagnostic' && <DiagnosticAssessmentPage currentUser={currentUser} historyOnly isEmbedded onHistoryDetailChange={setDiagnosticDetailOpen} />}
      {category === 'practice' && <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div><h2 className="font-black text-slate-900 tracking-tight">Kết quả luyện tập</h2><p className="mt-1 text-sm text-slate-500">Các bài dưới đây được lưu trên trình duyệt này, chưa phải lịch sử đồng bộ giữa các thiết bị.</p></div>
        {selected ? <>
          <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Quay lại danh sách</button>
          <h3 className="font-semibold">{selected.title || 'Bài luyện tập'}</h3>
          {(selected.reviewedQuestions || []).map((q, i) => <div key={q.id || i} className="rounded-2xl border border-slate-100 p-4 text-sm">
            <p className="mb-2 text-xs font-bold text-slate-500">Câu {q.question_number || i + 1}</p>
            <MathText text={q.content || 'Chưa có nội dung câu hỏi.'} />
            <p className="mt-3 text-slate-600">Bạn chọn: <strong>{q.studentChoice || 'Chưa trả lời'}</strong>{q.correctChoice && <> · Đáp án: <strong>{q.correctChoice}</strong></>}</p>
          </div>)}
        </> : localPractice.length ? <ul className="divide-y divide-slate-100">
          {localPractice.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div><p className="font-semibold text-slate-800">{item.title || 'Bài luyện tập'}</p>
              <p className="mt-1 text-xs text-slate-500">{item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : 'Chưa có ngày hoàn thành'} · Lưu trên trình duyệt</p></div>
            <button type="button" onClick={() => setSelected(item)} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">Xem kết quả</button>
          </li>)}
        </ul> : <p className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5 text-sm text-slate-500">Chưa có bài luyện tập được lưu trên trình duyệt này.</p>}
      </div>}
      {category === 'mock' && <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="font-black text-slate-900 tracking-tight">Lịch sử Thi thử V-ACT</h2>
          <p className="mt-1 text-sm text-slate-500">Tổng hợp các lần thi thử 120 câu có giám sát bạn đã hoàn thành.</p>
        </div>
        {selected ? <>
          <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"><ArrowLeft className="h-4 w-4" />Quay lại danh sách</button>
          <h3 className="font-bold text-slate-900">{selected.title || 'Đề thi thử V-ACT'}</h3>
          <p className="text-xs text-slate-500">{selected.ai_commentary}</p>
          {(selected.reviewedQuestions || []).map((q, i) => <div key={q.id || i} className="rounded-2xl border border-slate-100 p-4 text-sm space-y-2">
            <p className="text-xs font-bold text-slate-500">Câu {q.question_number || i + 1}</p>
            <MathText text={q.content || 'Chưa có nội dung câu hỏi.'} />
            <p className="text-slate-600 text-xs">Bạn chọn: <strong>{q.studentChoice || 'Bỏ trống'}</strong>{q.correctChoice && <> · Đáp án đúng: <strong className="text-emerald-700">{q.correctChoice}</strong></>}</p>
          </div>)}
        </> : localMocks.length ? <ul className="divide-y divide-slate-100">
          {localMocks.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-bold text-slate-800">{item.title || 'Đề thi thử V-ACT'}</p>
              <p className="mt-1 text-xs text-slate-500">{item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : ''} • {item.ai_commentary || ''}</p>
            </div>
            <button type="button" onClick={() => setSelected(item)} className="rounded-xl bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer">Xem bài làm</button>
          </li>)}
        </ul> : <div className="rounded-2xl bg-violet-50/50 border border-violet-100 p-6 text-center text-sm text-slate-500">
          Bạn chưa hoàn thành đề thi thử V-ACT nào. Hãy vào mục <strong>Kiểm tra &amp; Thi thử ➔ Thi thử V-ACT</strong> để thi thử 120 câu chuẩn ĐHQG-HCM!
        </div>}
      </div>}
      {category === 'mistakes' && (
        <MistakeNotebookSM2View
          currentUser={currentUser}
          onOpenAiTutorWithContext={onOpenAiTutorWithContext}
        />
      )}
    </div>
    {category === 'diagnostic' && !detailOpen && <button type="button" onClick={onOpenDiagnostic} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Đi đến đánh giá đầu vào →</button>}
  </div>;
}
