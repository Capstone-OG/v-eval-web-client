import { useState } from 'react';
import { BookOpen, ClipboardCheck, FileCheck2, History, ArrowLeft } from 'lucide-react';
import DiagnosticAssessmentPage from './DiagnosticAssessmentPage';
import { practiceService } from '../../services/practiceService';
import MathText from '../common/MathText';

const categories = [
  { id: 'diagnostic', label: 'Đầu vào', icon: ClipboardCheck },
  { id: 'practice', label: 'Luyện tập', icon: BookOpen },
  { id: 'mock', label: 'Thi thử', icon: FileCheck2 }
];

export default function StudentHistoryPage({ currentUser, onOpenDiagnostic }) {
  const [category, setCategory] = useState('diagnostic');
  const [selected, setSelected] = useState(null);
  const owner = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const localPractice = practiceService.getSubmissionHistory().filter((item) =>
    item.studentId === owner && ['ZPD_QUIZ', 'TOPIC_QUIZ'].includes(item.examType));

  return <div className="min-w-0 space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-blue-50 p-3 text-blue-600"><History className="h-5 w-5" /></span>
        <div><h1 className="text-xl font-bold text-slate-900">Lịch sử làm bài</h1><p className="mt-1 text-sm text-slate-500">Chọn loại bài để xem kết quả đã lưu.</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Loại bài làm">
        {categories.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab"
          id={`history-tab-${id}`} aria-selected={category === id} aria-controls="history-category-content"
          onClick={() => { setCategory(id); setSelected(null); }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${category === id ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Icon className="h-4 w-4" />{label}
        </button>)}
      </div>
    </div>
    <div id="history-category-content" role="tabpanel" aria-labelledby={`history-tab-${category}`}>
      {category === 'diagnostic' && <DiagnosticAssessmentPage currentUser={currentUser} historyOnly isEmbedded />}
      {category === 'practice' && <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div><h2 className="font-bold text-slate-900">Kết quả luyện tập</h2><p className="mt-1 text-sm text-slate-500">Các bài dưới đây được lưu trên trình duyệt này, chưa phải lịch sử đồng bộ giữa các thiết bị.</p></div>
        {selected ? <>
          <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft className="h-4 w-4" />Quay lại danh sách</button>
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
            <button type="button" onClick={() => setSelected(item)} className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Xem kết quả</button>
          </li>)}
        </ul> : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có bài luyện tập được lưu trên trình duyệt này.</p>}
      </div>}
      {category === 'mock' && <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <FileCheck2 className="mx-auto mb-3 h-8 w-8 text-slate-400" /><h2 className="font-bold text-slate-800">Lịch sử thi thử chưa khả dụng</h2>
        <p className="mt-2 text-sm text-slate-500">Kết quả thi thử sẽ được hiển thị tại đây khi chức năng được hoàn thiện.</p>
      </div>}
    </div>
    {category === 'diagnostic' && <button type="button" onClick={onOpenDiagnostic} className="text-sm font-semibold text-blue-600">Đi đến đánh giá đầu vào →</button>}
  </div>;
}
