import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Compass,
  CheckCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

const ALERT_TIER_META = {
  RED: {
    label: 'Cảnh báo Đỏ',
    badgeCls: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: AlertOctagon,
    iconCls: 'text-rose-600 bg-rose-50 border-rose-200'
  },
  YELLOW: {
    label: 'Nhắc nhở Vàng',
    badgeCls: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: AlertTriangle,
    iconCls: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  UNREALISTIC_GOAL: {
    label: 'Mục tiêu vượt ngưỡng',
    badgeCls: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Compass,
    iconCls: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  GREEN: {
    label: 'Tín hiệu Xanh',
    badgeCls: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    iconCls: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  }
};

export default function NotificationBellPopover({
  currentUser,
  activeRole = 'student',
  onNavigateTarget
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'UNREAD' | 'RED' | 'YELLOW'
  const [alertsPayload, setAlertsPayload] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const containerRef = useRef(null);

  const isStaffView = activeRole === 'teacher' || activeRole === 'manager' || activeRole === 'admin';

  const loadNotifications = useCallback(async () => {
    try {
      if (isStaffView) {
        const dash = await practiceService.getEarlyWarningsDashboard({
          mentorId: currentUser?.id
        });
        setAlertsPayload({
          mode: 'staff',
          badgeCount: Number(dash?.activeAlertsCount ?? 0),
          redCount: Number(dash?.redAlertsCount ?? 0),
          items: dash?.alerts || []
        });
      } else {
        const res = await practiceService.getMyAlerts({
          studentId: currentUser?.id
        });
        setAlertsPayload({
          mode: 'student',
          badgeCount: Number(res?.unreadCount ?? 0),
          redCount: Number(res?.redAlertsCount ?? 0),
          items: res?.alerts || []
        });
      }
    } catch {
      // Fallback handled inside practiceService
    }
  }, [currentUser?.id, isStaffView]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleSync = () => loadNotifications();
    window.addEventListener('veval:flow6-updated', handleSync);
    return () => window.removeEventListener('veval:flow6-updated', handleSync);
  }, [loadNotifications]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleMarkRead = async (alertId) => {
    if (markingId) return;
    setMarkingId(alertId);
    try {
      await practiceService.markAlertAsRead(alertId, currentUser?.id);
      toast.success('Đã đánh dấu đã đọc thông báo.');
      await loadNotifications();
    } catch (err) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái thông báo.');
    } finally {
      setMarkingId(null);
    }
  };

  const badgeCount = alertsPayload?.badgeCount ?? 0;
  const allItems = alertsPayload?.items || [];

  const filteredItems = allItems.filter((item) => {
    if (filterMode === 'UNREAD') {
      return isStaffView ? !item.resolvedAt : !item.isRead;
    }
    if (filterMode === 'RED') return item.alertType === 'RED' || item.alertType === 'UNREALISTIC_GOAL';
    if (filterMode === 'YELLOW') return item.alertType === 'YELLOW';
    return true;
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"
        title="Trung tâm Cảnh báo sớm 3 tầng BR-04 (Core Flow 6)"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-rose-600 text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Core Flow 6 • Early Warning BR-04
              </div>
              <h4 className="text-sm font-extrabold">
                {isStaffView ? 'Cảnh Báo Học Sinh Cần Can Thiệp' : 'Thông Báo & Cảnh Báo Sớm Cá Nhân'}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-200 text-[10px] font-extrabold">
              {badgeCount} {isStaffView ? 'chờ xử lý' : 'chưa đọc'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UNREAD', label: isStaffView ? 'Chờ can thiệp' : 'Chưa đọc' },
              { id: 'RED', label: 'Đỏ / Khẩn' },
              { id: 'YELLOW', label: 'Nhắc nhở Vàng' }
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilterMode(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all ${
                  filterMode === pill.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">
                Không có cảnh báo nào trong mục lọc này.
              </div>
            ) : (
              filteredItems.slice(0, 8).map((alert) => {
                const meta = ALERT_TIER_META[alert.alertType] || ALERT_TIER_META.YELLOW;
                const TierIcon = meta.icon;
                const unread = isStaffView ? !alert.resolvedAt : !alert.isRead;

                return (
                  <div
                    key={alert.alertId}
                    className={`p-3.5 transition-all space-y-2 ${
                      unread ? 'bg-indigo-50/35' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.iconCls}`}
                      >
                        <TierIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.badgeCls}`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>

                        {isStaffView && alert.studentName && (
                          <div className="text-xs font-extrabold text-slate-900">
                            HS: {alert.studentName}{' '}
                            {alert.deficitScore ? (
                              <span className="text-rose-600 font-bold">(Thiếu {alert.deficitScore}đ)</span>
                            ) : null}
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{alert.message}</p>

                        {alert.resolutionNotes && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                            <strong>Phản hồi Cố vấn:</strong> {alert.resolutionNotes}
                          </div>
                        )}

                        {!isStaffView && !alert.isRead && (
                          <button
                            type="button"
                            disabled={markingId === alert.alertId}
                            onClick={() => handleMarkRead(alert.alertId)}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 pt-0.5"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>{markingId === alert.alertId ? 'Đang lưu...' : 'Đánh dấu đã đọc'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          {onNavigateTarget && (
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTarget();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>
                  {isStaffView
                    ? 'Mở Bảng Điều Khiển Can Thiệp Sư Phạm'
                    : 'Xem Chi Tiết Cảnh Báo & Toa Thuốc Bù Điểm'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
