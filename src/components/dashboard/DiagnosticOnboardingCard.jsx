import { useEffect, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, RefreshCw, Sparkles, Zap, Minimize2, Maximize2, BookOpen, Compass } from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import { completedDiagnosticExamIds, DIAGNOSTIC_TARGET } from '../diagnostic/diagnosticEligibility';
import { readDraft } from '../diagnostic/diagnosticRecovery';

export default function DiagnosticOnboardingCard({ currentUser, onOpenDiagnostic, onOpenRoadmap, activation }) {
  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // TRƯỜNG HỢP 1: ĐÃ HOÀN THÀNH VÀ BẬT CHẾ ĐỘ THU GỌN (SIÊU TIẾT KIỆM DIỆN TÍCH)
  if (complete && activation && activation.step !== 'ready') {
    return (
      <section className="rounded-[28px] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700"><Check className="h-3.5 w-3.5" />Đã hoàn thành đánh giá đầu vào</span>
        <h2 className="mt-3 text-lg font-extrabold text-slate-900">Tiếp tục chuẩn bị lộ trình học</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Hoàn thiện hồ sơ, sau đó chọn gói học và thanh toán để mở lộ trình cá nhân.</p>
        <button type="button" onClick={onOpenRoadmap} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer">Xem hướng dẫn tiếp theo<ArrowRight className="h-4 w-4" /></button>
        <button type="button" onClick={onOpenDiagnostic} className="ml-3 mt-3 text-xs font-semibold text-blue-600 hover:underline cursor-pointer">Xem kết quả đầu vào</button>
      </section>
    );
  }
  if (complete && isCollapsed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-900">Lộ trình học đã kích hoạt</span>
            <span className="text-slate-400 mx-2">•</span>
            <button
              onClick={onOpenDiagnostic}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Xem lại kết quả bài test đầu vào
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <span>Tiếp tục học chặng 1</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Mở rộng chi tiết"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐÃ HOÀN THÀNH - CHUYỂN KHUNG TO THÀNH "TRẠM HÀNH ĐỘNG HỌC TẬP CHẶNG 1"
  if (complete) {
    return (
      <section
        aria-label="Chặng học tập tiếp theo"
        className="@container relative isolate flex min-w-0 flex-col justify-between overflow-hidden rounded-[28px] border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 p-5 shadow-lg shadow-blue-100/40 sm:p-6"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 -z-10 h-64 w-64 rounded-full blur-3xl bg-blue-300/30" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 right-40 -z-10 h-72 w-72 rounded-full border-[36px] border-white/40" />

        <div className="relative flex flex-col gap-5 @[46rem]:flex-row @[46rem]:items-center @[46rem]:justify-between @[46rem]:gap-6">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 text-white shadow-lg sm:flex bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-200/80">
              <Compass className="h-7 w-7" />
            </span>
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  <Sparkles className="h-3 w-3" /> Chặng học hiện tại • Cây Tri Thức DAG
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  ✓ Đã kích hoạt lộ trình cá nhân
                </span>
              </div>
              <h2 className="max-w-xl text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                Chặng 1: Luyện Tập Chuyên Đề & Vùng Phát Triển ZPD
              </h2>
              <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                Hệ thống đã phân hóa các nút bài tập thích ứng từ bài đánh giá đầu vào. Hãy bắt đầu chinh phục các chuyên đề ưu tiên để nâng điểm mục tiêu!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80">
                  📌 <strong>Nhiệm vụ:</strong> 0/15 bài tập thích ứng
                </span>
                <span className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-xl border border-slate-200/80 text-emerald-700 font-bold">
                  ⚡ <strong>Dự báo tăng:</strong> +45 ~ +65 điểm
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-[22px] border border-white bg-white/90 p-4 shadow-sm backdrop-blur-sm @[46rem]:w-64">
            <button
              type="button"
              onClick={onOpenRoadmap}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black text-slate-950 bg-[#FACC15] hover:bg-[#eab308] shadow-md shadow-yellow-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Vào học chặng 1</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <button
                type="button"
                onClick={onOpenDiagnostic}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                📊 Xem lại kết quả đầu vào
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer font-medium"
                title="Thu nhỏ để tiết kiệm diện tích"
              >
                <Minimize2 className="h-3 w-3" /> Thu gọn
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // TRƯỜNG HỢP 3: CHƯA HOÀN THÀNH - LÀM NỔI BẬT ĐỂ HỌC SINH MỚI BẤM VÀO NGAY
  const title = loading ? 'Đang kiểm tra đánh giá đầu vào…'
    : failed ? 'Chưa tải được tiến độ đầu vào'
    : progress?.locked ? 'Bài đánh giá đang chờ gửi'
    : progress?.pending ? 'Tiếp tục bài đánh giá của bạn'
    : 'Bắt đầu với bài đánh giá năng lực đầu vào (15 phút)';
  const description = loading ? 'Vui lòng chờ trong giây lát.'
    : failed ? 'Thử lại để xem đúng tiến độ của bạn.'
    : progress?.locked ? 'Đáp án đã được chốt. Mở bài để kiểm tra kết quả hoặc gửi lại.'
    : progress?.pending ? 'Bài làm đã được lưu. Mở lại để tiếp tục với thời gian còn lại.'
    : 'Hoàn thành bài khảo sát ngắn 15-30 câu để mô hình IRT 3PL xác định thực lực xuất phát và tự động kích hoạt Cây Tri Thức DAG riêng cho bạn.';
  const action = failed ? 'Thử lại'
    : progress?.locked ? 'Mở bài đã chốt' : progress?.pending ? 'Tiếp tục bài đang làm'
    : 'Bắt đầu đánh giá ngay';

  return (
    <section
      aria-label="Hướng dẫn đánh giá đầu vào"
      className="relative isolate flex min-w-0 flex-col justify-center overflow-hidden rounded-[28px] border-2 border-blue-400/90 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white p-6 shadow-xl shadow-blue-500/25 ring-4 ring-blue-400/20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 -z-10 h-64 w-64 rounded-full blur-3xl bg-cyan-300/40" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 right-20 -z-10 h-72 w-72 rounded-full blur-2xl bg-yellow-400/20" />

      <div className="relative flex flex-col gap-5 @[46rem]:flex-row @[46rem]:items-center @[46rem]:justify-between @[46rem]:gap-6">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 shadow-lg sm:flex animate-bounce">
            <Zap className="h-8 w-8 fill-slate-950" />
          </span>
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm animate-pulse">
                <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> Bước 1: Khởi tạo lộ trình (Bắt buộc)
              </span>
            </div>
            <h2 className="max-w-xl text-xl font-black tracking-tight text-white sm:text-2xl leading-snug">
              {title}
            </h2>
            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-blue-100 font-medium">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 @[46rem]:w-64">
          <button
            type="button"
            disabled={loading}
            onClick={failed ? () => setReload((value) => value + 1) : onOpenDiagnostic}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-black text-slate-950 bg-[#FACC15] hover:bg-[#eab308] shadow-lg shadow-yellow-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {failed ? <RefreshCw className="h-4 w-4" /> : null}
            {loading ? 'Đang tải…' : action}
            {!loading && !failed && <ArrowRight className="h-4.5 w-4.5" />}
          </button>
          <div className="text-[11px] text-center text-blue-100 font-semibold">
            Thời gian: 15 ~ 20 phút • 100% Miễn phí
          </div>
        </div>
      </div>
    </section>
  );
}
