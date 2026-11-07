import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Scale,
  Gauge
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import PrescriptionPracticeModal from '../modals/PrescriptionPracticeModal';
import { toast } from '../../context/ToastContext';

const STATUS_META = {
  ON_TRACK: {
    label: 'Đúng quỹ đạo mục tiêu (ON_TRACK)',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotCls: 'bg-emerald-500'
  },
  AT_RISK: {
    label: 'Cần tăng tốc bù điểm (AT_RISK)',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    dotCls: 'bg-amber-500'
  },
  CRITICAL: {
    label: 'Cảnh báo thiếu hụt lớn (CRITICAL)',
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
    dotCls: 'bg-rose-600'
  }
};

export default function ScorePredictionPanel({
  studentId,
  mode = 'full',
  onOpenFullForecast,
  onOpenAiTutorWithContext
}) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null);

  const loadForecast = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await practiceService.getMyForecast(studentId);
        setForecastData(data);
      } finally {
        setLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    loadForecast(false);
  }, [loadForecast]);

  useEffect(() => {
    const handleSync = () => loadForecast(true);
    window.addEventListener('veval:flow6-updated', handleSync);
    window.addEventListener('veval:submission-updated', handleSync);
    return () => {
      window.removeEventListener('veval:flow6-updated', handleSync);
      window.removeEventListener('veval:submission-updated', handleSync);
    };
  }, [loadForecast]);

  const handleRecalculate = async () => {
    if (recalculating) return;
    setRecalculating(true);
    try {
      const res = await practiceService.recalculatePrediction({
        studentId,
        triggerSource: 'MANUAL'
      });
      await loadForecast(true);
      toast.success(
        `Đã tái tính toán dự báo điểm chuẩn SEM 95%: ${res?.predictedScore ?? forecastData?.forecast?.predictedScore}đ!`
      );
    } catch (err) {
      toast.error(err?.message || 'Không thể tái tính toán dự báo điểm lúc này.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading && !forecastData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs animate-pulse space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        <div className="h-16 w-full bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const forecast = forecastData?.forecast || {};
  const balance = forecastData?.balanceSheet || {};
  const prescriptions = forecastData?.prescriptions || [];

  const predictedScore = Number(forecast.predictedScore ?? 845);
  const sem = Number(forecast.sem ?? 24.5);
  const minScore = Number(forecast.scoreRange?.min ?? Math.max(0, Math.round(predictedScore - 1.96 * sem)));
  const maxScore = Number(forecast.scoreRange?.max ?? Math.min(1200, Math.round(predictedScore + 1.96 * sem)));
  const targetScore = Number(balance.targetScore ?? 920);
  const deficitScore = Number(balance.deficitScore ?? Math.max(0, targetScore - predictedScore));
  const statusKey = STATUS_META[balance.status] ? balance.status : deficitScore <= 0 ? 'ON_TRACK' : deficitScore <= 80 ? 'AT_RISK' : 'CRITICAL';
  const statusInfo = STATUS_META[statusKey];

  const minPct = Math.min(100, Math.max(0, (minScore / 1200) * 100));
  const maxPct = Math.min(100, Math.max(minPct + 2, (maxScore / 1200) * 100));
  const predPct = Math.min(100, Math.max(0, (predictedScore / 1200) * 100));
  const targetPct = Math.min(100, Math.max(0, (targetScore / 1200) * 100));

  const unRemediedList = prescriptions.filter((p) => !p.isRemedied);
  const potentialRecovery = unRemediedList.reduce((sum, p) => sum + Number(p.deltaScore || 0), 0);

  if (mode === 'compact') {
    const topPrescription = unRemediedList[0] || prescriptions[0] || null;
    return (
      <>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Dự Báo Điểm SEM 95%</h3>
                <p className="text-[11px] text-slate-500">Core Flow 6 • Toa thuốc Knapsack ROI</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusInfo.badgeCls}`}>
              {deficitScore <= 0 ? 'Đạt đích' : `Thiếu ${deficitScore}đ`}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Điểm dự báo thực chiến
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black">{predictedScore}</span>
                  <span className="text-xs text-slate-300">/ 1200đ</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-300 font-semibold">Khoảng 95% (±1.96 SEM)</div>
                <div className="text-xs font-extrabold text-amber-300">
                  [{minScore} — {maxScore}đ]
                </div>
              </div>
            </div>

            <div className="relative h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-cyan-400/45 rounded-full"
                style={{ left: `${minPct}%`, width: `${Math.max(3, maxPct - minPct)}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full"
                style={{ left: `calc(${predPct}% - 3px)` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400"
                style={{ left: `calc(${targetPct}% - 2px)` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span>SEM: ±{sem}</span>
              <span>Đích: {targetScore}đ</span>
            </div>
          </div>

          {topPrescription && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Ưu tiên ROI #{topPrescription.priorityRank} ({topPrescription.roiScore}đ/giờ)
                </span>
                <span className="text-[11px] font-black text-emerald-700">+{topPrescription.deltaScore}đ</span>
              </div>
              <div className="text-xs font-bold text-slate-900 line-clamp-2">{topPrescription.patternName}</div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActivePrescription(topPrescription)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{topPrescription.isRemedied ? 'Ôn lại dạng này' : 'Làm bài bù điểm'}</span>
                </button>
                {onOpenFullForecast && (
                  <button
                    onClick={onOpenFullForecast}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <PrescriptionPracticeModal
          isOpen={Boolean(activePrescription)}
          onClose={() => setActivePrescription(null)}
          prescription={activePrescription}
          studentId={studentId}
          onRemedySuccess={() => loadForecast(true)}
          onOpenAiTutorWithContext={onOpenAiTutorWithContext}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Core Flow 6 • SEM 95% Score Forecast & Knapsack ROI
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border flex items-center gap-1.5 ${statusInfo.badgeCls}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotCls}`} />
                {statusInfo.label}
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900">
              Dự Báo Điểm Thi Chuẩn Sai Số Đo Lường SEM & Toa Thuốc Bù Điểm Tối Ưu ROI
            </h2>
            <p className="text-xs text-slate-500">
              Ước lượng khoảng điểm tin cậy 95% (`Predicted ± 1.96 × SEM`) và quy hoạch Greedy Knapsack chọn các dạng bài mang lại nhiều điểm số nhất trên mỗi giờ tự học.
            </p>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-2 self-start lg:self-auto transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Đang tính lại SEM...' : 'Tính Lại Dự Báo SEM'}</span>
          </button>
        </div>

        {/* Top Grid: 95% SEM Confidence Band + Deficit Balance Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 cols: 1200-Point SEM Scale */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col justify-between space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Điểm Dự Báo Trung Tâm (Thang V-ACT 1200)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black tracking-tight">{predictedScore}</span>
                  <span className="text-sm font-bold text-slate-300">/ 1200 điểm</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Khoảng tin cậy {Math.round(Number(forecast.confidenceRate ?? 0.95) * 100)}%
                </div>
                <div className="text-base font-black text-amber-300 mt-0.5">
                  {minScore}đ — {maxScore}đ
                </div>
                <div className="text-[10px] text-cyan-200 font-semibold">
                  Sai số chuẩn SEM = ±{sem}đ
                </div>
              </div>
            </div>

            {/* Interactive Scale Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span>0đ</span>
                <span className="text-cyan-300">Dải dao động 95%: [{minScore} — {maxScore}]</span>
                <span>1200đ</span>
              </div>

              <div className="relative h-4 rounded-full bg-white/10 border border-white/15 overflow-hidden">
                {/* 95% Confidence Band */}
                <div
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-400/40 via-blue-400/60 to-cyan-400/40 rounded-full"
                  style={{ left: `${minPct}%`, width: `${Math.max(3, maxPct - minPct)}%` }}
                  title={`Khoảng tin cậy 95%: ${minScore} - ${maxScore} điểm`}
                />
                {/* Predicted Center Pin */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow"
                  style={{ left: `calc(${predPct}% - 4px)` }}
                  title={`Điểm dự báo: ${predictedScore} điểm`}
                />
                {/* Target Flag */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400"
                  style={{ left: `calc(${targetPct}% - 2px)` }}
                  title={`Điểm mục tiêu: ${targetScore} điểm`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                  Dự báo hiện tại: <strong className="text-white">{predictedScore}đ</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                  Đích đăng ký: <strong className="text-amber-300">{targetScore}đ</strong>
                </span>
                <span className="text-slate-400">
                  Nguồn: <strong className="text-slate-200">{forecast.calculationSource || 'MOCK_EXAM'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Deficit Balance Sheet */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                Bảng Cân Đối Thiếu Hụt Điểm Mục Tiêu
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {forecast.lastUpdated
                  ? new Date(forecast.lastUpdated).toLocaleDateString('vi-VN')
                  : 'Hôm nay'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">Mục tiêu nguyện vọng</div>
                <div className="text-2xl font-black text-indigo-700 mt-0.5 flex items-baseline gap-1">
                  <Target className="w-4 h-4 text-indigo-500 self-center" />
                  <span>{targetScore}đ</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-400">Điểm thiếu hụt cần bù</div>
                <div
                  className={`text-2xl font-black mt-0.5 ${
                    deficitScore <= 0
                      ? 'text-emerald-600'
                      : deficitScore <= 80
                        ? 'text-amber-600'
                        : 'text-rose-600'
                  }`}
                >
                  {deficitScore <= 0 ? '0đ (Đạt)' : `-${deficitScore}đ`}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                {deficitScore <= 0 ? (
                  <span>
                    Điểm dự báo của em đã <strong className="text-emerald-700">tiệm cận/vượt mục tiêu</strong>. Tiếp tục duy trì ôn tập SM-2 để giữ biên sai số SEM thấp!
                  </span>
                ) : (
                  <span>
                    Hoàn thành <strong className="text-indigo-800">{unRemediedList.length} dạng bài</strong> trong Toa thuốc Knapsack bên dưới giúp em thu hồi ngay{' '}
                    <strong className="text-emerald-700">+{potentialRecovery} điểm</strong> với quỹ thời gian ngắn nhất.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Greedy Knapsack ROI Prescriptions List */}
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm lg:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Toa Thuốc Bù Điểm Cá Nhân Hóa (Thuật Toán Quy Hoạch Greedy Knapsack ROI)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Xếp hạng theo chỉ số sinh lời điểm số `ROI = ΔScore / Số giờ ôn` — đạt tối thiểu 67% câu hỏi biến thể để gạch nợ ngay lập tức
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
              Đã gạch nợ {prescriptions.filter((p) => p.isRemedied).length}/{prescriptions.length} dạng bài
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
              Hiện chưa có dạng bài thiếu hụt nào trong Toa thuốc bù điểm. Bấm &quot;Tính Lại Dự Báo SEM&quot; để cập nhật từ bài làm mới nhất.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prescriptions.map((item) => {
                const isDone = Boolean(item.isRemedied);
                return (
                  <div
                    key={item.patternId}
                    className={`rounded-2xl p-5 border-2 flex flex-col justify-between gap-4 transition-all ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : item.priorityRank === 1
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : item.priorityRank === 1
                                ? 'bg-amber-500 text-white'
                                : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isDone ? 'Đã bù điểm' : `Ưu tiên ROI #${item.priorityRank}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                          ROI: {item.roiScore} đ/giờ
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">{item.patternId}</div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug mt-0.5">
                          {item.patternName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                          <div className="text-[10px] font-bold text-slate-400">Điểm bù tiềm năng</div>
                          <div className="text-sm font-black text-emerald-600">+{item.deltaScore} điểm</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/90">
                          <div className="text-[10px] font-bold text-slate-400">Thời lượng cần ôn</div>
                          <div className="text-sm font-black text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{item.studyHoursNeeded} giờ</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivePrescription(item)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        isDone
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã Gạch Nợ • Luyện Lại</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>Luyện Bù +{item.deltaScore}đ Ngay (3-5 Câu)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PrescriptionPracticeModal
        isOpen={Boolean(activePrescription)}
        onClose={() => setActivePrescription(null)}
        prescription={activePrescription}
        studentId={studentId}
        onRemedySuccess={() => loadForecast(true)}
        onOpenAiTutorWithContext={onOpenAiTutorWithContext}
      />
    </>
  );
}
