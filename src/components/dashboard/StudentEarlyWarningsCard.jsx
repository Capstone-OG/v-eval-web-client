import React, { useState, useEffect, useCallback } from 'react';
import {
  BellRing,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Compass,
  CheckCheck,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

const TIER_CONFIG = {
  RED: {
    label: 'Cảnh Báo Đỏ (Nguy cơ lệch mục tiêu)',
    cardCls: 'bg-rose-50/50 border-rose-200',
    badgeCls: 'bg-rose-600 text-white',
    icon: AlertOctagon,
    iconWrapCls: 'bg-rose-100 text-rose-600'
  },
  YELLOW: {
    label: 'Nhắc Nhở Vàng (Lệch nhịp ôn tập)',
    cardCls: 'bg-amber-50/50 border-amber-200',
    badgeCls: 'bg-amber-500 text-white',
    icon: AlertTriangle,
    iconWrapCls: 'bg-amber-100 text-amber-700'
  },
  UNREALISTIC_GOAL: {
    label: 'Cảnh Báo Mục Tiêu Vượt Ngưỡng (Cần tư vấn 3 bên)',
    cardCls: 'bg-purple-50/50 border-purple-200',
    badgeCls: 'bg-purple-600 text-white',
    icon: Compass,
    iconWrapCls: 'bg-purple-100 text-purple-700'
  },
  GREEN: {
    label: 'Tín Hiệu Xanh (Đúng quỹ đạo)',
    cardCls: 'bg-emerald-50/40 border-emerald-200',
    badgeCls: 'bg-emerald-600 text-white',
    icon: CheckCircle2,
    iconWrapCls: 'bg-emerald-100 text-emerald-700'
  }
};

export default function StudentEarlyWarningsCard({ studentId }) {
  const [alertsRes, setAlertsRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [markingId, setMarkingId] = useState(null);

  const loadMyAlerts = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await practiceService.getMyAlerts({
          unreadOnly,
          alertType: typeFilter === 'ALL' ? null : typeFilter,
          studentId
        });
        setAlertsRes(res);
      } finally {
        setLoading(false);
      }
    },
    [studentId, unreadOnly, typeFilter]
  );

  useEffect(() => {
    loadMyAlerts(false);
  }, [loadMyAlerts]);

  useEffect(() => {
    const handleSync = () => loadMyAlerts(true);
    window.addEventListener('veval:flow6-updated', handleSync);
    return () => window.removeEventListener('veval:flow6-updated', handleSync);
  }, [loadMyAlerts]);

  const handleMarkRead = async (alertId) => {
    if (markingId) return;
    setMarkingId(alertId);
    try {
      await practiceService.markAlertAsRead(alertId, studentId);
      toast.success('Đã xác nhận đọc cảnh báo sớm.');
      await loadMyAlerts(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể đánh dấu đã đọc.');
    } finally {
      setMarkingId(null);
    }
  };

  const alerts = alertsRes?.alerts || [];

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" />
              Core Flow 6 • Hệ Thống Cảnh Báo Sớm 3 Tầng (BR-04)
            </span>
            {(alertsRes?.unreadCount ?? 0) > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold">
                {alertsRes.unreadCount} thông báo mới chưa đọc
              </span>
            )}
          </div>
          <h3 className="text-base lg:text-lg font-extrabold text-slate-900">
            Hộp Thư Cảnh Báo Sớm & Nhật Ký Đồng Hành Từ Cố Vấn Học Tập
          </h3>
          <p className="text-xs text-slate-500">
            Tự động giám sát độ lệch quỹ đạo điểm dự báo SEM, tiến độ chặng DAG và chu kỳ ôn tập SM-2 để cảnh báo kịp thời trước kỳ thi ĐGNL.
          </p>
        </div>

        {/* Summary Chips & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              unreadOnly
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Chỉ hiện chưa đọc ({alertsRes?.unreadCount ?? 0})
          </button>

          {['ALL', 'RED', 'YELLOW', 'GREEN'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTypeFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                typeFilter === tier
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tier === 'ALL'
                ? `Tất cả (${alertsRes?.totalAlerts ?? 0})`
                : tier === 'RED'
                  ? `Đỏ (${alertsRes?.redAlertsCount ?? 0})`
                  : tier === 'YELLOW'
                    ? `Vàng (${alertsRes?.yellowAlertsCount ?? 0})`
                    : 'Tín hiệu Xanh'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading && !alertsRes ? (
        <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Đang đồng bộ danh sách cảnh báo sớm BR-04...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
          Không có cảnh báo nào khớp với bộ lọc hiện tại. Em đang duy trì nhịp độ học tập rất tốt!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const cfg = TIER_CONFIG[alert.alertType] || TIER_CONFIG.YELLOW;
            const TierIcon = cfg.icon;

            return (
              <div
                key={alert.alertId}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${cfg.cardCls}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconWrapCls}`}>
                        <TierIcon className="w-4 h-4" />
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${cfg.badgeCls}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{alert.message}</p>

                  {alert.resolutionNotes && (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="font-extrabold text-emerald-700 flex items-center gap-1.5 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Phương án hỗ trợ từ Giáo viên / Cố vấn học tập:</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{alert.resolutionNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  {alert.isRead ? (
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Đã đọc
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={markingId === alert.alertId}
                      onClick={() => handleMarkRead(alert.alertId)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition-all"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{markingId === alert.alertId ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}</span>
                    </button>
                  )}

                  {alert.resolvedAt && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                      Đã can thiệp ({new Date(alert.resolvedAt).toLocaleDateString('vi-VN')})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
