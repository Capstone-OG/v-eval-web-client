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
    label: 'Cần chú ý ngay',
    cardCls: 'bg-rose-50/50 border-rose-200',
    badgeCls: 'bg-rose-600 text-white',
    icon: AlertOctagon,
    iconWrapCls: 'bg-rose-100 text-rose-600'
  },
  YELLOW: {
    label: 'Nhắc nhở ôn bài',
    cardCls: 'bg-amber-50/50 border-amber-200',
    badgeCls: 'bg-amber-500 text-white',
    icon: AlertTriangle,
    iconWrapCls: 'bg-amber-100 text-amber-700'
  },
  UNREALISTIC_GOAL: {
    label: 'Định hướng mục tiêu học tập',
    cardCls: 'bg-purple-50/50 border-purple-200',
    badgeCls: 'bg-purple-600 text-white',
    icon: Compass,
    iconWrapCls: 'bg-purple-100 text-purple-700'
  },
  GREEN: {
    label: 'Tiến độ tốt',
    cardCls: 'bg-emerald-50/40 border-emerald-200',
    badgeCls: 'bg-emerald-600 text-white',
    icon: CheckCircle2,
    iconWrapCls: 'bg-emerald-100 text-emerald-700'
  }
};

function cleanAlertMessage(msg) {
  return String(msg || '')
    .replace(/\s*\(BR-04[^)]*\)/gi, '')
    .replace(/\bSM-2\b/gi, 'đến hạn')
    .replace(/\bROI #\d+\b/gi, 'ưu tiên')
    .replace(/\s*\(P\(Lt\)\s*=\s*[\d.]+\)/gi, '')
    .replace(/Toa thuốc/gi, 'danh sách bài tập')
    .trim();
}

export default function StudentEarlyWarningsCard({ studentId }) {
  const [alertsRes, setAlertsRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [markingId, setMarkingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const loadMyAlerts = useCallback(
    async (_silent = false) => {
      setLoading(true);
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
      toast.success('Đã đánh dấu đã xem nhắc nhở.');
      await loadMyAlerts(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái thông báo.');
    } finally {
      setMarkingId(null);
    }
  };

  const alerts = [...(alertsRes?.alerts || [])].sort((a, b) =>
    (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  useEffect(() => { setVisibleCount(5); }, [studentId, unreadOnly, typeFilter]);
  const formatDate = value => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('vi-VN') : 'Chưa có ngày';
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-label="Nhắc nhở học tập">
      <header className="border-b border-slate-100 bg-gradient-to-br from-indigo-50/80 via-white to-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-indigo-600 p-3 text-white shadow-sm"><BellRing className="h-5 w-5" /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">ĐỒNG HÀNH HỌC TẬP</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Nhắc nhở dành cho bạn</h2>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">Theo dõi điều cần chú ý, lịch ôn bài và hướng dẫn hỗ trợ. Mở từng nhắc nhở để xem nội dung đầy đủ.</p>
            </div>
          </div>
          <button type="button" disabled={loading} onClick={() => loadMyAlerts(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Làm mới</button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-indigo-100/60 pt-4">
          <button type="button" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(value => !value)}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${unreadOnly ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
            Chưa xem{!loading && alertsRes && !alertsRes.error ? ` · ${alertsRes.unreadCount ?? 0}` : ''}
          </button>
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          {[
            { id: 'ALL', label: 'Tất cả' }, { id: 'RED', label: 'Cần chú ý' },
            { id: 'YELLOW', label: 'Ôn bài' }, { id: 'UNREALISTIC_GOAL', label: 'Mục tiêu' }
          ].map(item => <button type="button" key={item.id} aria-pressed={typeFilter === item.id} onClick={() => setTypeFilter(item.id)}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${typeFilter === item.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{item.label}</button>)}
        </div>
      </header>
      {loading ? <div role="status" className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><RefreshCw className="h-4 w-4 animate-spin" />Đang tải nhắc nhở…</div>
        : alertsRes?.error ? <div role="alert" className="p-10 text-center text-sm text-rose-600">Chưa tải được nhắc nhở. Bạn hãy thử làm mới.</div>
        : alerts.length === 0 ? <div className="px-6 py-14 text-center"><BellRing className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-bold text-slate-700">Chưa có nhắc nhở phù hợp</h3><p className="mt-1 text-xs text-slate-500">Bạn có thể chọn bộ lọc khác hoặc quay lại sau.</p></div>
        : <div className="p-3 sm:p-5">
          <p aria-live="polite" className="mb-3 px-2 text-xs text-slate-400">Mới nhất trước · {alerts.length} nhắc nhở trong danh sách</p>
          <div className="space-y-2">{alerts.slice(0, visibleCount).map(alert => {
            const cfg = TIER_CONFIG[alert.alertType];
            const TierIcon = cfg?.icon || BellRing;
            const label = cfg?.label || 'Nhắc nhở học tập';
            return <details key={alert.alertId} className="group rounded-2xl border border-slate-200 bg-white transition-colors open:border-indigo-200 open:bg-indigo-50/20">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg?.iconWrapCls || 'bg-slate-100 text-slate-500'}`}><TierIcon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold text-slate-800">{label}</h3>{!alert.isRead && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">Chưa xem</span>}</div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 group-open:hidden">{cleanAlertMessage(alert.message) || 'Chưa có nội dung chi tiết.'}</p>
                  <span className="mt-2 block text-[11px] text-slate-400">{formatDate(alert.createdAt)}</span>
                </div>
                <span aria-hidden="true" className="mt-1 text-slate-400 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="mx-4 space-y-4 border-t border-slate-100 pb-4 pt-4 sm:ml-[4.5rem]">
                <p className="text-sm leading-relaxed text-slate-700">{cleanAlertMessage(alert.message) || 'Chưa có nội dung chi tiết.'}</p>
                {alert.resolutionNotes && <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><p className="flex items-center gap-1.5 text-xs font-bold text-emerald-800"><UserCheck className="h-3.5 w-3.5" />Ghi chú hỗ trợ</p><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{alert.resolutionNotes}</p></div>}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {alert.isRead ? <span className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCheck className="h-3.5 w-3.5 text-emerald-600" />Đã xem</span>
                    : <button type="button" disabled={Boolean(markingId)} onClick={() => handleMarkRead(alert.alertId)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><CheckCheck className="h-3.5 w-3.5" />{markingId === alert.alertId ? 'Đang lưu…' : 'Đánh dấu đã xem'}</button>}
                  {alert.resolvedAt && <span className="text-xs text-emerald-700">Đã hỗ trợ · {formatDate(alert.resolvedAt)}</span>}
                </div>
              </div>
            </details>;
          })}</div>
          {visibleCount < alerts.length && <button type="button" onClick={() => setVisibleCount(value => value + 5)} className="mt-4 w-full rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">Xem thêm nhắc nhở ({alerts.length - visibleCount})</button>}
        </div>}
    </section>
  );
}