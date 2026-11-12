import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Compass,
  CheckCircle2,
  CalendarClock,
  FileCheck2,
  RefreshCw,
  MapPin,
  Target,
  X
} from 'lucide-react';
import { practiceService, FLOW5_DEFAULTS } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

const ALERT_BADGE_META = {
  RED: {
    label: 'Cảnh báo Đỏ (Nguy cấp)',
    badgeCls: 'bg-rose-600 text-white',
    rowCls: 'border-rose-200 bg-rose-50/35',
    icon: AlertOctagon
  },
  YELLOW: {
    label: 'Nhắc nhở Vàng (Lệch nhịp)',
    badgeCls: 'bg-amber-500 text-white',
    rowCls: 'border-amber-200 bg-amber-50/35',
    icon: AlertTriangle
  },
  UNREALISTIC_GOAL: {
    label: 'Mục tiêu vượt ngưỡng (BR-04 Tier 3)',
    badgeCls: 'bg-purple-600 text-white',
    rowCls: 'border-purple-200 bg-purple-50/40',
    icon: Compass
  }
};

const QUICK_RESOLUTION_TEMPLATES = [
  'Đã kèm 1-1 tại Bàn vi mô và giao Toa thuốc bù điểm ROI #1 (3 câu đồng cấu).',
  'Đã trao đổi trực tiếp với học sinh, rà soát lại Sổ tay lỗi sai SM-2 và cam kết lịch tự học 45 phút/tối.',
  'Đã gửi báo cáo tiến độ SEM sang Cổng Phụ huynh đồng hành để phối hợp nhắc nhở chuyên cần.'
];

const getDefaultFutureDateTimeLocal = () => {
  const d = new Date(Date.now() + 2 * 86400000);
  d.setHours(19, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EarlyWarningsMentorPanel({
  currentUser,
  defaultClassId = 'ALL',
  roleLabel = 'Giáo Viên & Cố Vấn Học Tập'
}) {
  const [classFilter, setClassFilter] = useState(defaultClassId || 'ALL');
  const [alertTypeFilter, setAlertTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolve Intervention Modal State
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  // Schedule Tripartite Counseling Modal State
  const [counselingTarget, setCounselingTarget] = useState(null);
  const [counselingDate, setCounselingDate] = useState(getDefaultFutureDateTimeLocal);
  const [counselingLocation, setCounselingLocation] = useState(
    'Phòng Tư Vấn Học Đường - Cơ sở chính (hoặc Google Meet)'
  );
  const [proposedTargetScore, setProposedTargetScore] = useState(850);
  const [mentorNotes, setMentorNotes] = useState('');
  const [submittingCounseling, setSubmittingCounseling] = useState(false);

  useEffect(() => {
    if (defaultClassId) {
      setClassFilter(defaultClassId);
    }
  }, [defaultClassId]);

  const loadAlertsDashboard = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const isResolvedParam =
          statusFilter === 'ACTIVE' ? false : statusFilter === 'RESOLVED' ? true : null;

        const data = await practiceService.getEarlyWarningsDashboard({
          classId: classFilter === 'ALL' ? null : classFilter,
          alertType: alertTypeFilter === 'ALL' ? null : alertTypeFilter,
          isResolved: isResolvedParam,
          mentorId: currentUser?.id
        });
        setDashboardData(data);
      } finally {
        setLoading(false);
      }
    },
    [classFilter, alertTypeFilter, statusFilter, currentUser?.id]
  );

  useEffect(() => {
    loadAlertsDashboard(false);
  }, [loadAlertsDashboard]);

  useEffect(() => {
    const handleSync = () => loadAlertsDashboard(true);
    window.addEventListener('veval:flow6-updated', handleSync);
    return () => window.removeEventListener('veval:flow6-updated', handleSync);
  }, [loadAlertsDashboard]);

  const openResolveModal = (alert) => {
    setResolveTarget(alert);
    setResolutionNotes('');
  };

  const openCounselingModal = (alert) => {
    setCounselingTarget(alert);
    setCounselingDate(getDefaultFutureDateTimeLocal());
    const suggested = alert.currentPredictedScore
      ? Math.min(1200, Math.round((alert.currentPredictedScore + 140) / 10) * 10)
      : 820;
    setProposedTargetScore(suggested);
    setMentorNotes(
      `Đề xuất lộ trình 2 giai đoạn: Chốt mốc khả thi ${suggested}đ trong 4 tuần tới dựa trên tốc độ tích lũy SEM hiện tại (${alert.currentPredictedScore ?? 610}đ).`
    );
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolveTarget || !resolutionNotes.trim() || submittingResolve) return;
    setSubmittingResolve(true);
    try {
      const res = await practiceService.resolveEarlyWarningAlert(resolveTarget.alertId, {
        mentorId: currentUser?.id,
        resolutionNotes: resolutionNotes.trim()
      });
      toast.success(res?.message || `Đã ghi nhận can thiệp sư phạm cho ${resolveTarget.studentName}!`);
      setResolveTarget(null);
      setResolutionNotes('');
      await loadAlertsDashboard(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể lưu biên bản can thiệp lúc này.');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleConfirmCounseling = async (e) => {
    e.preventDefault();
    if (!counselingTarget || submittingCounseling) return;

    const chosenMs = new Date(counselingDate).getTime();
    if (Number.isNaN(chosenMs) || chosenMs <= Date.now()) {
      toast.warning('Thời gian hẹn tư vấn 3 bên phải nằm trong tương lai!');
      return;
    }

    const numericScore = Number(proposedTargetScore);
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 1200) {
      toast.warning('Điểm mục tiêu đề xuất phải nằm trong thang 0 — 1200 điểm!');
      return;
    }

    setSubmittingCounseling(true);
    try {
      const res = await practiceService.scheduleAlertCounseling(counselingTarget.alertId, {
        mentorId: currentUser?.id,
        counselingDate: new Date(counselingDate).toISOString(),
        counselingLocation,
        proposedTargetScore: numericScore,
        mentorNotes
      });
      toast.success(
        res?.message || `Đã đặt lịch tư vấn 3 bên cho ${counselingTarget.studentName} thành công!`
      );
      setCounselingTarget(null);
      await loadAlertsDashboard(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể xếp lịch tư vấn 3 bên lúc này.');
    } finally {
      setSubmittingCounseling(false);
    }
  };

  const alerts = dashboardData?.alerts || [];

  return (
    <>
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Core Flow 6 • Trung Tâm Cảnh Báo Sớm & Can Thiệp Sư Phạm (BR-04)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                Phân quyền: {roleLabel}
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900">
              Bảng Điều Phối Cảnh Báo Sớm 3 Tầng & Đặt Lịch Tư Vấn Mục Tiêu 3 Bên
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi các ca học sinh lệch quỹ đạo điểm dự báo SEM, ghi nhận biên bản can thiệp tại lớp và tổ chức phiên tư vấn 3 bên (Giáo viên - Học sinh - Phụ huynh) khi mục tiêu vượt ngưỡng khả thi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAlertsDashboard(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 self-start lg:self-auto transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới cảnh báo</span>
          </button>
        </div>

        {/* 6 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Tổng cảnh báo</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {dashboardData?.totalAlerts ?? 0}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <div className="text-[10px] font-bold uppercase text-indigo-700">Chờ can thiệp</div>
            <div className="text-2xl font-black text-indigo-700 mt-0.5">
              {dashboardData?.activeAlertsCount ?? 0}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="text-[10px] font-bold uppercase text-rose-700">Cảnh báo Đỏ</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {dashboardData?.redAlertsCount ?? 0}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="text-[10px] font-bold uppercase text-amber-800">Nhắc nhở Vàng</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {dashboardData?.yellowAlertsCount ?? 0}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="text-[10px] font-bold uppercase text-purple-800">Mục tiêu ảo</div>
            <div className="text-2xl font-black text-purple-700 mt-0.5">
              {dashboardData?.unrealisticGoalCount ?? 0}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[10px] font-bold uppercase text-emerald-700">Đã xử lý</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {dashboardData?.resolvedAlertsCount ?? 0}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">Tất cả các lớp phụ trách</option>
              <option value={FLOW5_DEFAULTS.CLASS_ID}>Lớp ĐGNL Cơ sở 1 (Mã: 01)</option>
              <option value={FLOW5_DEFAULTS.SECONDARY_CLASS_ID}>Lớp Tăng Tốc 01 (Mã: 02)</option>
            </select>

            {[
              { id: 'ALL', label: 'Mọi phân tầng' },
              { id: 'RED', label: 'Cảnh báo Đỏ' },
              { id: 'UNREALISTIC_GOAL', label: 'Mục tiêu vượt ngưỡng' },
              { id: 'YELLOW', label: 'Nhắc nhở Vàng' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAlertTypeFilter(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  alertTypeFilter === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tất cả trạng thái' },
              { id: 'ACTIVE', label: 'Chờ can thiệp' },
              { id: 'RESOLVED', label: 'Đã đóng' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Cards List */}
        {loading && !dashboardData ? (
          <div className="py-10 text-center text-xs text-slate-500 font-semibold">
            Đang tải danh sách học sinh thuộc diện cảnh báo sớm...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-bold">
            Không có học sinh nào nằm trong diện cảnh báo theo bộ lọc hiện tại.
          </div>
        ) : (
          <div className="space-y-3.5">
            {alerts.map((alert) => {
              const meta = ALERT_BADGE_META[alert.alertType] || ALERT_BADGE_META.YELLOW;
              const TierIcon = meta.icon;
              const isResolved = Boolean(alert.resolvedAt);

              return (
                <div
                  key={alert.alertId}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    isResolved ? 'border-emerald-200 bg-emerald-50/25' : meta.rowCls
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 ${meta.badgeCls}`}>
                        <TierIcon className="w-3.5 h-3.5" />
                        {meta.label}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {alert.studentName || 'Học sinh V-Eval'}
                      </span>
                      {alert.currentPredictedScore !== null && alert.currentPredictedScore !== undefined && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">
                          Dự báo SEM: <strong className="text-indigo-700">{alert.currentPredictedScore}đ</strong> / Đích:{' '}
                          <strong>{alert.targetScore}đ</strong>{' '}
                          <span className="text-rose-600 font-extrabold">
                            (Thiếu {alert.deficitScore ?? Math.max(0, (alert.targetScore || 0) - alert.currentPredictedScore)}đ)
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isResolved ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xử lý ({new Date(alert.resolvedAt).toLocaleDateString('vi-VN')})
                        </span>
                      ) : (
                        <>
                          {(alert.alertType === 'UNREALISTIC_GOAL' || alert.alertType === 'RED') && (
                            <button
                              type="button"
                              onClick={() => openCounselingModal(alert)}
                              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all"
                            >
                              <CalendarClock className="w-3.5 h-3.5" />
                              <span>Hẹn Tư Vấn 3 Bên</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openResolveModal(alert)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Ghi Nhận Can Thiệp</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{alert.message}</p>

                  {alert.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700">
                      <strong className="text-emerald-700">Biên bản xử lý sư phạm:</strong> {alert.resolutionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: RESOLVE EARLY WARNING INTERVENTION */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Biên bản Can thiệp Sư phạm (Resolve Alert)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Xử lý cảnh báo cho: <span className="text-indigo-700">{resolveTarget.studentName}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500">Mẫu ghi chú can thiệp nhanh:</div>
              <div className="flex flex-col gap-1.5">
                {QUICK_RESOLUTION_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setResolutionNotes(tpl)}
                    className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-[11px] text-slate-700 font-medium transition-all"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nội dung biện pháp can thiệp đã thực hiện <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  required
                  placeholder="Nhập chi tiết phương án hỗ trợ học sinh (sẽ hiển thị trên Hộp thư cảnh báo của Học sinh & Phụ huynh)..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve || !resolutionNotes.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{submittingResolve ? 'Đang lưu...' : 'Xác Nhận Đóng Cảnh Báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE TRIPARTITE GOAL COUNSELING */}
      {counselingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                  Phiên Tư Vấn 3 Bên: Giáo Viên - Học Sinh - Phụ Huynh
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Hiệu chỉnh mục tiêu khả thi cho:{' '}
                  <span className="text-purple-700">{counselingTarget.studentName}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCounselingTarget(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <span>
                Dự báo hiện tại: <strong>{counselingTarget.currentPredictedScore ?? 610}đ</strong>
              </span>
              <span>
                Đích cũ: <strong>{counselingTarget.targetScore ?? 980}đ</strong>
              </span>
              <span className="text-rose-700 font-black">
                Chênh lệch: -{counselingTarget.deficitScore ?? 370}đ
              </span>
            </div>

            <form onSubmit={handleConfirmCounseling} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Ngày & Giờ hẹn tư vấn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={counselingDate}
                    onChange={(e) => setCounselingDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Điểm mục tiêu đề xuất (0 — 1200) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Target className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      max={1200}
                      step={10}
                      value={proposedTargetScore}
                      onChange={(e) => setProposedTargetScore(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Địa điểm / Phòng họp trực tuyến <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={counselingLocation}
                    onChange={(e) => setCounselingLocation(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Định hướng lộ trình & Ghi chú gửi Phụ huynh
                </label>
                <textarea
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounselingTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingCounseling}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>{submittingCounseling ? 'Đang xếp lịch...' : 'Xác Nhận Đặt Lịch Tư Vấn 3 Bên'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
