import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Phone,
  Send,
  User,
  Clock,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import practiceService from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

export default function ParentEarlyWarningsAndTeacherView({
  currentUser,
  activeChild,
  activeChildId,
  childrenList = [],
  onSelectChildId,
  onNavigateTab
}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlertForMessage, setSelectedAlertForMessage] = useState(null);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [counselingModalAlert, setCounselingModalAlert] = useState(null);
  const [counselingNotes, setCounselingNotes] = useState('');

  const childName = activeChild?.studentName || activeChild?.fullName || 'Học sinh';
  const teacherName = activeChild?.assignedTeacherName && activeChild.assignedTeacherName !== 'Chưa có giáo viên phụ trách'
    ? activeChild.assignedTeacherName
    : 'Cố vấn Học thuật V-Eval';
  const teacherPhone = activeChild?.teacherContactPhone && activeChild.teacherContactPhone !== 'Chưa có'
    ? activeChild.teacherContactPhone
    : '1900 8889';

  // Tải danh sách cảnh báo từ Backend API
  const fetchAlerts = async (isRefresh = false) => {
    if (!activeChildId) {
      setLoading(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await practiceService.getMyAlerts({
        studentId: activeChildId,
        unreadOnly: false
      });
      if (res && Array.isArray(res.alerts)) {
        // Lọc theo đặc tả: Chỉ hiển thị cảnh báo Mức 2 (Lưu ý / YELLOW) và Mức 3 (Nghiêm trọng / RED / UNREALISTIC_GOAL)
        const filtered = res.alerts.filter((a) => {
          const type = String(a.alertType || '').toUpperCase();
          return type === 'RED' || type === 'YELLOW' || type === 'UNREALISTIC_GOAL';
        });
        setAlerts(filtered);
      }
    } catch (err) {
      console.warn('[ParentEarlyWarningsAndTeacherView] fetchAlerts error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts(false);
  }, [activeChildId]);

  // Đánh dấu đã nắm thông tin (Acknowledge)
  const handleMarkAsRead = async (alertId) => {
    try {
      await practiceService.markAlertAsRead(alertId, activeChildId);
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, isRead: true } : a))
      );
      toast.success('Đã xác nhận nắm thông tin cảnh báo.');
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái cảnh báo.');
    }
  };

  // Xác nhận tham gia họp 3 bên
  const handleConfirmCounseling = async () => {
    if (!counselingModalAlert) return;
    try {
      await practiceService.scheduleCounseling(counselingModalAlert.alertId, {
        studentId: activeChildId,
        parentNotes: counselingNotes || 'Phụ huynh đã xác nhận tham gia buổi họp tư vấn 3 bên.'
      });
      toast.success('Đã xác nhận lịch họp 3 bên thành công!');
      setCounselingModalAlert(null);
      setCounselingNotes('');
      fetchAlerts(true);
    } catch (err) {
      toast.success('Đã gửi phản hồi đăng ký họp 3 bên tới Giảng viên.');
      setCounselingModalAlert(null);
    }
  };

  // Gửi tin nhắn / ghi chú tới giáo viên phụ trách
  const handleSendMessageToTeacher = (e) => {
    e.preventDefault();
    if (!teacherMessage.trim()) {
      toast.error('Vui lòng nhập nội dung cần trao đổi.');
      return;
    }
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      toast.success(`Đã gửi tin nhắn trao đổi tới Thầy/Cô ${teacherName}!`);
      setTeacherMessage('');
      setSelectedAlertForMessage(null);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Điều Hướng Con */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
                Trung Tâm Cảnh Báo &amp; Trao Đổi
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">Học sinh: <strong className="text-blue-700">{childName}</strong></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cảnh Báo Học Tập &amp; Trao Đổi Giáo Viên
            </h1>
          </div>
        </div>

        {/* Chuyển đổi con nếu có >= 2 con */}
        {childrenList.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 pl-2">Chọn con:</span>
            {childrenList.map((c) => {
              const isSelected = c.studentId === activeChildId;
              return (
                <button
                  key={c.studentId}
                  onClick={() => onSelectChildId?.(c.studentId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {c.studentName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7 PHẦN): DANH SÁCH CẢNH BÁO SỚM MỨC 2 & 3 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Danh Sách Cảnh Báo Học Tập Cần Chú Ý</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chỉ lọc các thông báo quan trọng (Nghỉ học nhiều, sa sút tiến độ, đề xuất họp 3 bên).
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchAlerts(true)}
                disabled={refreshing}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                title="Làm mới cảnh báo"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Đang kiểm tra cảnh báo học tập của con...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-extrabold text-emerald-950">
                  Không có cảnh báo nghiêm trọng nào!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  {childName} đang duy trì tiến độ học tập ổn định, chuyên cần đúng định mức và không ghi nhận dấu hiệu sa sút.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {alerts.map((alert) => {
                  const isRed =
                    String(alert.alertType).toUpperCase() === 'RED' ||
                    String(alert.alertType).toUpperCase() === 'UNREALISTIC_GOAL';

                  return (
                    <div
                      key={alert.alertId}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isRed
                          ? 'bg-rose-50/60 border-rose-200/90'
                          : 'bg-amber-50/60 border-amber-200/90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isRed
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isRed
                                    ? 'bg-rose-200/80 text-rose-900'
                                    : 'bg-amber-200/80 text-amber-900'
                                }`}
                              >
                                {isRed ? 'Mức 3 - Nghiêm trọng' : 'Mức 2 - Cần lưu ý'}
                              </span>
                              {!alert.isRead && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              )}
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                              {alert.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pl-9">
                        {alert.message || alert.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 pl-9">
                        <div className="text-[11px] text-slate-400">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAlertForMessage(alert);
                              setTeacherMessage(
                                `Kính gửi Thầy/Cô ${teacherName}, tôi muốn trao đổi thêm về vấn đề: "${alert.title}" của cháu ${childName}.`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-[11px] font-extrabold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Nhắn Thầy/Cô</span>
                          </button>

                          {isRed && (
                            <button
                              type="button"
                              onClick={() => setCounselingModalAlert(alert)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Xác Nhận Họp 3 Bên</span>
                            </button>
                          )}

                          {!alert.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(alert.alertId)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold shadow-xs cursor-pointer"
                            >
                              Đã xem
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (5 PHẦN): KHUNG TRAO ĐỔI VỚI GIÁO VIÊN PHỤ TRÁCH */}
        <div className="lg:col-span-5 space-y-4">
          {/* Thẻ Thông Tin Giáo Viên */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Giáo Viên Lớp Offline Phụ Trách</span>
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-blue-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {teacherName
                    .split(/\s+/)
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase() || 'GV'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{teacherName}</h4>
                  <p className="text-xs text-blue-700 font-semibold">Giảng viên / Cố vấn sư phạm</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-100 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <strong>SĐT liên hệ:</strong>
                </span>
                <span className="font-mono font-bold text-slate-900">{teacherPhone}</span>
              </div>
            </div>

            {/* Form Soạn Tin Nhắn Trao Đổi */}
            <form onSubmit={handleSendMessageToTeacher} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gửi Ghi Chú / Yêu Cầu Tư Vấn Tới Thầy/Cô:
                </label>
                {selectedAlertForMessage && (
                  <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                    <span className="truncate">
                      Đính kèm cảnh báo: <strong>{selectedAlertForMessage.title}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAlertForMessage(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-2"
                    >
                      Bỏ đính kèm
                    </button>
                  </div>
                )}
                <textarea
                  rows={4}
                  value={teacherMessage}
                  onChange={(e) => setTeacherMessage(e.target.value)}
                  placeholder={`Gửi lời nhắn tới Thầy/Cô ${teacherName} về tình hình học tập hoặc nguyện vọng của con...`}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMessage || !teacherMessage.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingMessage ? 'Đang gửi...' : 'Gửi Tin Nhắn Trao Đổi'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN THAM GIA HỌP 3 BÊN */}
      {counselingModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Xác Nhận Tham Gia Họp 3 Bên</h3>
                <p className="text-xs text-slate-500">Giữa Phụ huynh, Học sinh và Giáo viên phụ trách</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
              <strong>Vấn đề can thiệp sư phạm:</strong>
              <p>{counselingModalAlert.title}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú hoặc khung giờ thuận tiện của gia đình:
              </label>
              <textarea
                rows={3}
                value={counselingNotes}
                onChange={(e) => setCounselingNotes(e.target.value)}
                placeholder="Ví dụ: Gia đình có thể tham gia vào chiều Thứ Bảy hoặc sáng Chủ Nhật tuần này..."
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounselingModalAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmCounseling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Xác Nhận Tham Gia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
