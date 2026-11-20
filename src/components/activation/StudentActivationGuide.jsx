import { useEffect, useId, useRef } from 'react';
import { ArrowRight, Check, ClipboardCheck, CreditCard, LoaderCircle, Route, UserRound, X } from 'lucide-react';

export function ActivationChecklist({ activation, onAction }) {
  const headingId = useId();
  const { step, missing = [] } = activation;
  const loading = step === 'loading';
  const error = step === 'error';
  const ready = step === 'ready';
  const labels = { diagnostic: 'Làm bài đánh giá đầu vào', profile: 'Cập nhật hồ sơ ngay', payment: 'Chọn gói học & Thanh toán', ready: 'Mở lộ trình học', error: 'Kiểm tra lại' };
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"><Route className="h-3.5 w-3.5" />Lộ trình học cá nhân</div>
      <div>
        <h2 id={headingId} className="text-xl font-extrabold text-slate-900">{ready ? 'Bạn đã sẵn sàng bắt đầu' : 'Hoàn tất các bước để mở lộ trình'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{error ? 'Chưa xác minh được thông tin. Hãy thử lại để xem đúng bước tiếp theo.' : 'Kết quả đầu vào được giữ lại. Hãy hoàn thiện hồ sơ và học phí để tiếp tục với lộ trình cá nhân.'}</p>
      </div>
      <ol className="space-y-2.5">
        {[
          { id: 'diagnostic', name: 'Đánh giá đầu vào', detail: 'Xác định năng lực hiện tại', icon: ClipboardCheck, done: activation.diagnosticComplete },
          { id: 'profile', name: 'Hoàn thiện hồ sơ', detail: 'Trường THPT, nguyện vọng và mục tiêu thi cử', icon: UserRound, done: ['payment', 'ready'].includes(step) },
          { id: 'payment', name: 'Thanh toán học phí', detail: 'Chọn gói học tại Học phí & Gói học', icon: CreditCard, done: ready }
        ].map(({ id, name, detail, icon: Icon, done }, index) => (
          <li key={id} className={`flex items-center gap-3 rounded-2xl border p-3 ${step === id ? 'border-blue-200 bg-blue-50/70' : 'border-slate-100 bg-slate-50/70'}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-emerald-100 text-emerald-600' : step === id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>{done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span>
            <div><p className="text-xs font-bold text-slate-800">{index + 1}. {name}</p><p className="mt-0.5 text-[11px] text-slate-500">{detail}</p></div>
          </li>
        ))}
      </ol>
      {step === 'profile' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
          <p className="font-bold">Còn thiếu: {missing.join(', ')}.</p>
          <p className="mt-2 leading-relaxed">Vào <strong>Cài đặt tài khoản → Thông tin cá nhân → Học tập & Mục tiêu thi cử</strong>, bổ sung thông tin rồi bấm <strong>Lưu thay đổi hồ sơ</strong>.</p>
        </div>
      )}
      {step === 'payment' && <p className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-700">Hồ sơ đã đầy đủ. Tiếp theo, mở <strong>Học phí & Gói học</strong> để chọn gói và hoàn tất thanh toán.</p>}
      <button type="button" onClick={onAction} disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 cursor-pointer disabled:cursor-wait">
        {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" />Đang kiểm tra thông tin…</> : <>{labels[step]}<ArrowRight className="h-4 w-4" /></>}
      </button>
    </div>
  );
}

export default function StudentActivationGuide({ open, onClose, activation, onAction }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    else if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return (
    <dialog ref={dialog} onCancel={onClose} aria-label="Hướng dẫn hoàn thiện hồ sơ và mở lộ trình"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm sm:p-7">
      <button type="button" aria-label="Đóng hướng dẫn" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="h-4 w-4" /></button>
      <ActivationChecklist activation={activation} onAction={onAction} />
    </dialog>
  );
}
