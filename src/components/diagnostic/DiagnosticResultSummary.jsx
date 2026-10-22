import { ArrowUpRight, Brain, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function DiagnosticResultSummary({ result }) {
  const correct = result.pacing?.totalCorrect ?? 0;
  const total = result.pacing?.totalQuestions ?? 0;
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  const seconds = result.pacing?.totalTimeSpent ?? 0;
  const theta = Number(result.theta_0);
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-6 sm:px-8 sm:py-8">
        <div aria-hidden="true" className="absolute -right-16 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-blue-300 uppercase"><FileText className="h-4 w-4" /> Báo cáo đầu vào</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">Kết quả khảo sát <span className="text-blue-300">năng lực đầu vào</span></h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Nhìn lại bài làm, nhận diện thế mạnh và những kỹ năng cần cải thiện.</p>
          </div>
          <span className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-blue-300"><ArrowUpRight className="h-7 w-7" /></span>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> KẾT QUẢ BÀI LÀM</div>
          <div className="mt-4 text-4xl font-black tracking-tight text-slate-900">{correct}<span className="text-lg font-medium text-slate-400"> / {total} câu</span></div>
          <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(accuracy, 100))}%` }} /></div><span className="text-sm font-bold text-emerald-700">{accuracy}%</span></div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Brain className="h-4 w-4 text-blue-600" /> CHỈ SỐ NĂNG LỰC IRT θ</div>
          <div className="mt-4 text-4xl font-black tracking-tight text-blue-700 tabular-nums">{Number.isFinite(theta) ? `${theta > 0 ? '+' : ''}${theta.toFixed(2)}` : '—'}</div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Ước lượng năng lực từ bài khảo sát này.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Clock className="h-4 w-4 text-violet-600" /> THỜI GIAN HOÀN THÀNH</div>
          <div className="mt-4 text-4xl font-black tracking-tight text-slate-900 tabular-nums">{Math.floor(seconds / 60)}<span className="text-lg font-medium text-slate-400"> phút </span>{String(seconds % 60).padStart(2, '0')}<span className="text-lg font-medium text-slate-400"> giây</span></div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Trung bình {total > 0 ? Math.round(seconds / total) : 0} giây mỗi câu.</p>
        </div>
      </div>
    </section>
  );
}
