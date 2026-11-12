import { useEffect, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, RefreshCw, Sparkles } from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import { completedDiagnosticExamIds, DIAGNOSTIC_TARGET } from '../diagnostic/diagnosticEligibility';
import { readDraft } from '../diagnostic/diagnosticRecovery';

export default function DiagnosticOnboardingCard({ currentUser, onOpenDiagnostic, onOpenRoadmap }) {
  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const isCurrent = () => active && (tokenStorage.getUser()?.userId
      || tokenStorage.getUser()?.id || tokenStorage.getUser()?.studentId) === studentId;
    setLoading(true);
    setFailed(false);
    setProgress(null);
    if (!studentId || !tokenStorage.getAccessToken()) {
      setLoading(false);
      setFailed(true);
      return;
    }
    practiceService.getDiagnosticHistory(studentId).then((history) => {
      if (!isCurrent()) return;
      const ids = completedDiagnosticExamIds(history, studentId);
      const draft = readDraft(localStorage, studentId);
      const pending = draft && !ids.has(draft.exam.id) ? draft : null;
      const locked = pending && (pending.payload || pending.warnings >= 3
        || Date.now() >= pending.clock.startedAt + pending.clock.durationMs);
      setProgress({ count: ids.size, pending: Boolean(pending), locked: Boolean(locked) });
    }).catch(() => {
      if (isCurrent()) setFailed(true);
    }).finally(() => {
      if (isCurrent()) setLoading(false);
    });
    return () => { active = false; };
  }, [studentId, reload]);

  const complete = progress?.count >= DIAGNOSTIC_TARGET;
  const title = loading ? 'Đang kiểm tra đánh giá đầu vào…'
    : failed ? 'Chưa tải được tiến độ đầu vào'
    : complete ? 'Bạn đã hoàn thành đánh giá đầu vào'
    : progress.locked ? 'Bài đánh giá đang chờ gửi'
    : progress.pending ? 'Tiếp tục bài đánh giá của bạn'
    : progress.count === 0 ? 'Bắt đầu với đánh giá năng lực đầu vào' : 'Tiếp tục đánh giá năng lực đầu vào';
  const description = loading ? 'Vui lòng chờ trong giây lát.'
    : failed ? 'Thử lại để xem đúng tiến độ của bạn.'
    : complete ? 'Khám phá lộ trình và chọn nội dung học tiếp theo.'
    : progress.locked ? 'Đáp án đã được chốt. Mở bài để kiểm tra kết quả hoặc gửi lại.'
    : progress.pending ? 'Bài làm đã được lưu. Mở lại để tiếp tục với thời gian còn lại.'
    : 'Hoàn thành các bài đầu vào để đánh giá năng lực và xây dựng lộ trình phù hợp.';
  const action = failed ? 'Thử lại' : complete ? 'Xem lộ trình'
    : progress?.locked ? 'Mở bài đã chốt' : progress?.pending ? 'Tiếp tục bài đang làm'
    : progress?.count === 0 ? 'Bắt đầu đánh giá' : 'Kiểm tra bài tiếp theo';

  return <section aria-label="Hướng dẫn đánh giá đầu vào"
    className={`@container relative isolate flex min-w-0 flex-col justify-center overflow-hidden rounded-[28px] border p-5 shadow-lg sm:p-6 ${complete ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-emerald-100/40' : 'border-blue-200/80 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-violet-100/60 shadow-indigo-100/50'}`}>
    <div aria-hidden="true" className={`pointer-events-none absolute -left-16 -top-24 -z-10 h-64 w-64 rounded-full blur-3xl ${complete ? 'bg-emerald-200/40' : 'bg-blue-200/50'}`} />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 right-40 -z-10 h-72 w-72 rounded-full border-[36px] border-white/40" />
    <div className="relative flex flex-col gap-5 @[46rem]:flex-row @[46rem]:items-center @[46rem]:justify-between @[46rem]:gap-6">
      <div className="flex min-w-0 items-start gap-4 sm:gap-5">
        <span className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 text-white shadow-lg sm:flex ${complete ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/60' : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-blue-200/80'}`}>
          {complete ? <Check className="h-8 w-8" /> : <ClipboardCheck className="h-8 w-8" />}
        </span>
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${complete ? 'border-emerald-200 text-emerald-700' : 'border-blue-200 text-blue-700'}`}>
              <Sparkles className="h-3 w-3" />{complete ? 'Sẵn sàng học tập' : 'Bắt đầu từ đây'}
            </span>
          </div>
          <h2 className="max-w-xl text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-4 rounded-[22px] border border-white bg-white/80 p-4 shadow-sm backdrop-blur-sm @[46rem]:w-64">
        {progress && <div aria-label={`Đã hoàn thành ${progress.count} trên ${DIAGNOSTIC_TARGET} bài`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">Tiến độ đầu vào</span>
            <span className={`text-xs font-bold ${complete ? 'text-emerald-700' : 'text-indigo-700'}`}>{progress.count}/{DIAGNOSTIC_TARGET} bài hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => <div key={step} className="flex flex-1 items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step <= progress.count ? (complete ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-sm shadow-blue-200') : 'border border-slate-200 bg-slate-50 text-slate-400'}`}>
                {step <= progress.count ? <Check className="h-4 w-4" /> : step}
              </span>
              {step < 3 && <span className={`h-1 flex-1 rounded-full ${step < progress.count ? (complete ? 'bg-emerald-300' : 'bg-blue-300') : 'bg-slate-100'}`} />}
            </div>)}
          </div>
        </div>}
        <button type="button" disabled={loading} onClick={failed ? () => setReload((value) => value + 1) : complete ? onOpenRoadmap : onOpenDiagnostic}
          className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${complete ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-200/70 hover:from-emerald-700 hover:to-teal-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200/80 hover:from-blue-700 hover:to-indigo-700'}`}>
          {failed ? <RefreshCw className="h-4 w-4" /> : null}{loading ? 'Đang tải…' : action}{!loading && !failed && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  </section>;
}
