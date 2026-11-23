import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { userService } from '../../services/userService';
import { parentTeacherMessagingStore } from '../../utils/parentTeacherMessagingStore';
import { Building2, MessageSquare, Send, ArrowUpRight } from 'lucide-react';
import { toast } from '../../context/ToastContext';

const ALERT_BADGE_META = {
  RED: {
    tierLabel: 'Cấp 3 — Nguy cơ cao',
    handlerLabel: 'Quản lý cơ sở chủ trì họp 3 bên',
    handlerDesc: 'Học sinh sa sút nghiêm trọng (> 7 ngày). Giảng viên chuyển cấp hồ sơ để Quản lý cơ sở tổ chức Họp 3 bên.',
    label: 'Cấp 3 — Nguy Cơ Cao',
    badgeCls: 'bg-rose-600 text-white',
    rowCls: 'border-rose-300 bg-rose-50/40',
    icon: AlertOctagon
  },
  YELLOW: {
    tierLabel: 'Cấp 1 — Nhắc nhở',
    handlerLabel: 'Giảng viên trực tiếp kèm cặp',
    handlerDesc: 'Học sinh giảm nhịp tự học hoặc chuyên cần. Giảng viên trực tiếp kèm cặp và giao bài tập củng cố tại lớp.',
    label: 'Cấp 1 — Nhắc Nhở',
    badgeCls: 'bg-amber-500 text-white',
    rowCls: 'border-amber-200 bg-amber-50/35',
    icon: AlertTriangle
  },
  UNREALISTIC_GOAL: {
    tierLabel: 'Cấp 2 — Lệch mục tiêu',
    handlerLabel: 'Tư vấn điều chỉnh sư phạm',
    handlerDesc: 'Điểm dự kiến chênh lệch với mục tiêu. Giảng viên tư vấn điều chỉnh phương pháp học tập.',
    label: 'Cấp 2 — Lệch Mục Tiêu',
    badgeCls: 'bg-purple-600 text-white',
    rowCls: 'border-purple-200 bg-purple-50/40',
    icon: Compass
  }
};

const getStoredEscalations = () => {
  try {
    const raw = localStorage.getItem('veval_alert_escalations');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const QUICK_RESOLUTION_TEMPLATES = [
  'Đã kèm 1-1 theo nhóm và giao phiếu bài tập trọng tâm bổ trợ kiến thức.',
  'Đã trao đổi trực tiếp với học sinh, rà soát lại sổ tay câu sai và thống nhất lịch tự học mỗi tối.',
  'Đã gửi thông tin tiến độ học tập sang Cổng Phụ huynh để phối hợp nhắc nhở chuyên cần.'
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
  classesList = [],
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

  // TCH-05: Escalation state to Branch Manager
  const [escalations, setEscalations] = useState(getStoredEscalations);
  const [escalateTarget, setEscalateTarget] = useState(null);
  const [escalateNotes, setEscalateNotes] = useState('');
  const [submittingEscalate, setSubmittingEscalate] = useState(false);

  // TCH-04: Parent-Teacher Two-Way Messaging
  const [parentMessages, setParentMessages] = useState(() => parentTeacherMessagingStore.getAllMessages());
  const [activeMessageTarget, setActiveMessageTarget] = useState(null); // student object or null for all
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [replyingMsgId, setReplyingMsgId] = useState(null);

  useEffect(() => {
    const unsubscribe = parentTeacherMessagingStore.subscribe(() => {
      setParentMessages(parentTeacherMessagingStore.getAllMessages());
    });
    return () => unsubscribe();
  }, []);

  const handleConfirmEscalate = (e) => {
    e.preventDefault();
    if (!escalateTarget || !escalateNotes.trim()) return;
    setSubmittingEscalate(true);

    const alertId = String(escalateTarget.alertId);
    const newRecord = {
      alertId,
      studentId: escalateTarget.studentId,
      studentName: escalateTarget.studentName,
      escalatedAt: new Date().toISOString(),
      notes: escalateNotes.trim(),
      mentorName: currentUser?.fullName || 'Giảng viên phụ trách'
    };

    const updated = { ...escalations, [alertId]: newRecord };
    setEscalations(updated);
    try {
      localStorage.setItem('veval_alert_escalations', JSON.stringify(updated));
      toast.success('Đã chuyển cấp cảnh báo lên Quản lý cơ sở thành công! Quản lý cơ sở sẽ chủ trì buổi họp 3 bên.');
      setEscalateTarget(null);
      setEscalateNotes('');
    } catch {
      toast.error('Không thể lưu trạng thái chuyển cấp.');
    } finally {
      setSubmittingEscalate(false);
    }
  };

  const handleSendTeacherReply = (msgId) => {
    if (!teacherReplyText.trim() || !msgId) return;
    parentTeacherMessagingStore.replyToMessage(msgId, {
      text: teacherReplyText.trim(),
      teacherName: currentUser?.fullName || 'Giảng viên phụ trách',
      teacherId: currentUser?.id || currentUser?.userId
    });
    toast.success('Đã gửi phản hồi thành công tới Phụ huynh!');
    setTeacherReplyText('');
    setReplyingMsgId(null);
    setParentMessages(parentTeacherMessagingStore.getAllMessages());
  };

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

  // Nạp danh sách User từ Identity Service để liên kết FullName động (Không hardcode)
  const [identityUsersMap, setIdentityUsersMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    userService
      .getUsers({ role: 'STUDENT', pageSize: 100 })
      .then((data) => {
        if (!isMounted || !data) return;
        const items = data.items || data.Items || [];
        const map = {};
        for (const u of items) {
          const id = String(u.userId || u.id || '').toLowerCase();
          if (id && u.fullName) {
            map[id] = u.fullName;
          }
        }
        setIdentityUsersMap(map);
      })
      .catch((err) => {
        console.warn('[EarlyWarningsMentorPanel] Không thể nạp danh sách user từ Identity Service:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const rawAlerts = dashboardData?.alerts || [];

  const alerts = useMemo(() => {
    const seen = new Set();
    return rawAlerts
      .map((a) => {
        const idLower = String(a.studentId || '').toLowerCase();
        // 1. Ưu tiên lấy studentName đã resolve từ Backend (qua Identity gRPC)
        // 2. Nếu Backend chưa có tên hoặc trả về prefix mặc định, tra cứu trực tiếp từ Identity REST API
        let displayName = a.studentName;
        if (
          (!displayName || displayName.toLowerCase().startsWith('học sinh') || displayName.toLowerCase().startsWith('học viên')) &&
          identityUsersMap[idLower]
        ) {
          displayName = identityUsersMap[idLower];
        }

        return {
          ...a,
          studentName: displayName || a.studentName || 'Học viên'
        };
      })
      .filter((a) => {
        const key = `${a.studentId}_${a.alertType}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [rawAlerts, identityUsersMap]);

  return (
    <>
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Theo Dõi Học Sinh Cần Hỗ Trợ
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                Phân quyền: {roleLabel}
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-black text-slate-900">
              Danh Sách Học Sinh Cần Hỗ Trợ & Lịch Tư Vấn
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dõi các học sinh có xu hướng giảm sút hoặc chưa đạt mục tiêu, ghi nhận nội dung hỗ trợ và tổ chức buổi tư vấn (Thầy cô - Học sinh - Phụ huynh) để điều chỉnh kế hoạch học tập.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveMessageTarget(null);
                setIsMessageModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              title="Xem và phản hồi tin nhắn từ Phụ huynh học sinh"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hộp Thư Phụ Huynh</span>
              {parentMessages.filter((m) => m.status === 'unread' || !m.reply).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => loadAlertsDashboard(false)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới cảnh báo</span>
            </button>
          </div>
        </div>

        {/* 6 KPI Summary Cards - Modern Card Shadow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 card-shadow hover:border-slate-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">Tổng cảnh báo</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {dashboardData?.totalAlerts ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Toàn cơ sở</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-indigo-200 card-shadow hover:border-indigo-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-indigo-700">Chờ can thiệp</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">
              {dashboardData?.activeAlertsCount ?? 0}
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Cần xử lý gấp</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-rose-200 card-shadow hover:border-rose-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-rose-700">Cảnh báo Đỏ</div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {dashboardData?.redAlertsCount ?? 0}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Nguy cơ cao</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 card-shadow hover:border-amber-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-amber-800">Nhắc nhở Vàng</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {dashboardData?.yellowAlertsCount ?? 0}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Chậm tiến độ tuần</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-purple-200 card-shadow hover:border-purple-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-purple-800">Mục tiêu lệch</div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {dashboardData?.unrealisticGoalCount ?? 0}
            </div>
            <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Cần điều chỉnh</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 card-shadow hover:border-emerald-400 transition-all">
            <div className="text-[10px] font-black tracking-wider uppercase text-emerald-700">Đã xử lý</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {dashboardData?.resolvedAlertsCount ?? 0}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Đã lưu biên bản</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả các lớp phụ trách</option>
              {classesList.map((cls) => (
                <option key={cls.id || cls.classId} value={cls.id || cls.classId}>
                  {cls.name || cls.className || `Lớp ${cls.code || cls.id}`}
                </option>
              ))}
            </select>

            {[
              { id: 'ALL', label: 'Tất cả mức độ' },
              { id: 'RED', label: 'Cảnh báo Đỏ' },
              { id: 'UNREALISTIC_GOAL', label: 'Mục tiêu cần hiệu chỉnh' },
              { id: 'YELLOW', label: 'Nhắc nhở Vàng' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAlertTypeFilter(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  alertTypeFilter === item.id
                    ? 'bg-slate-900 text-white shadow-xs'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white shadow-xs'
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
                          Điểm dự kiến: <strong className="text-indigo-700">{alert.currentPredictedScore}đ</strong> / Mục tiêu:{' '}
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
                          {/* Nút xem tin nhắn từ phụ huynh nếu có */}
                          {(() => {
                            const studentMsgs = parentMessages.filter((m) => String(m.studentId) === String(alert.studentId));
                            if (studentMsgs.length === 0) return null;
                            const hasUnreplied = studentMsgs.some((m) => !m.reply);
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMessageTarget({ studentId: alert.studentId, studentName: alert.studentName });
                                  setIsMessageModalOpen(true);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                  hasUnreplied
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs animate-pulse'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                }`}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Phụ huynh nhắn ({studentMsgs.length})</span>
                              </button>
                            );
                          })()}

                          {/* Cảnh báo Cấp 3 (RED): Phân định quyền chuyển Quản lý cơ sở */}
                          {alert.alertType === 'RED' && (
                            escalations[alert.alertId] ? (
                              <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-extrabold flex items-center gap-1.5 border border-purple-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                                <span>Đã chuyển Quản lý cơ sở (Chờ họp 3 bên)</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEscalateTarget(alert);
                                  setEscalateNotes(`Học sinh sa sút nghiêm trọng kéo dài (>7 ngày). Đã can thiệp sư phạm tại lớp nhưng chưa cải thiện, đề nghị Quản lý cơ sở triệu tập cuộc họp 3 bên với Phụ huynh.`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Chuyển Lên Quản Lý Cơ Sở (Họp 3 Bên)</span>
                              </button>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() => openResolveModal(alert)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{alert.alertType === 'RED' ? 'Ghi Nhận Can Thiệp' : 'Ghi Nhận Can Thiệp Sư Phạm'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Banner hướng dẫn phân cấp xử lý sư phạm */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium">
                      <strong className="text-slate-900">{meta.handlerLabel || 'Phân công'}:</strong> {meta.handlerDesc || alert.message}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      {alert.message}
                    </span>
                  </div>

                  {/* Hiển thị ghi chú bàn giao nếu đã chuyển Quản lý cơ sở */}
                  {escalations[alert.alertId] && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-700" />
                          <span>Hồ sơ đã bàn giao lên Quản lý cơ sở để tổ chức Họp 3 bên:</span>
                        </span>
                        <span className="text-[10px] text-purple-600 font-normal">
                          {new Date(escalations[alert.alertId].escalatedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="italic">"{escalations[alert.alertId].notes}"</p>
                    </div>
                  )}

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
      {/* MODAL 3: ESCALATE TO BRANCH MANAGER (TCH-05) */}
      {escalateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Chuyển Cấp Cảnh Báo Lên Quản Lý Cơ Sở (Cấp 3)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Bàn giao hồ sơ: <span className="text-rose-700">{escalateTarget.studentName}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEscalateTarget(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <p><strong>Lý do chuyển cấp:</strong> {escalateTarget.message}</p>
              <p className="text-[11px] text-rose-700">
                Theo quy trình Core Flow 6, các ca cảnh báo Cấp 3 (nguy cơ cao, sa sút &gt; 7 ngày) sẽ do Quản lý cơ sở chủ trì triệu tập phiên họp 3 bên với Phụ huynh.
              </p>
            </div>

            <form onSubmit={handleConfirmEscalate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Ghi chú bàn giao &amp; Đề xuất giải pháp cho Quản lý cơ sở <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  placeholder="Ghi rõ tình hình học sinh, các biện pháp kèm cặp sư phạm đã thực hiện tại lớp và nội dung cần trao đổi trong phiên họp 3 bên..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/25 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalateTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEscalate || !escalateNotes.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{submittingEscalate ? 'Đang bàn giao...' : 'Xác Nhận Bàn Giao Quản Lý Cơ Sở'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PARENT MESSAGES & TWO-WAY REPLY (TCH-04) */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Kênh Trao Đổi 2 Chiều Với Phụ Huynh Học Sinh (TCH-04)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {activeMessageTarget ? `Hộp thư: ${activeMessageTarget.studentName}` : 'Tất cả tin nhắn từ Phụ huynh'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setActiveMessageTarget(null);
                  setReplyingMsgId(null);
                  setTeacherReplyText('');
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const targetMsgs = activeMessageTarget
                  ? parentMessages.filter((m) => String(m.studentId) === String(activeMessageTarget.studentId))
                  : parentMessages;

                if (targetMsgs.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      Chưa có tin nhắn trao đổi nào từ Phụ huynh.
                    </div>
                  );
                }

                return targetMsgs.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-blue-900">{msg.parentName || 'Phụ huynh'}</strong>
                        <span className="text-slate-500 ml-1.5">(Học sinh: <strong>{msg.studentName}</strong>)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {msg.alertTitle && (
                      <div className="text-[10px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                        Đính kèm cảnh báo: <strong>{msg.alertTitle}</strong>
                      </div>
                    )}

                    <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {msg.content}
                    </p>

                    {/* Phản hồi từ Giảng viên */}
                    {msg.reply ? (
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-black text-indigo-900">
                          <span>Phản hồi của Thầy/Cô ({msg.reply.teacherName}):</span>
                          <span className="text-[10px] text-indigo-400 font-normal">
                            {new Date(msg.reply.repliedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-indigo-950 font-medium">{msg.reply.text}</p>
                      </div>
                    ) : (
                      replyingMsgId === msg.id ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <textarea
                            rows={3}
                            value={teacherReplyText}
                            onChange={(e) => setTeacherReplyText(e.target.value)}
                            placeholder="Nhập nội dung phản hồi sư phạm tới Phụ huynh..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 resize-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingMsgId(null);
                                setTeacherReplyText('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-700"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              disabled={!teacherReplyText.trim()}
                              onClick={() => handleSendTeacherReply(msg.id)}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>Gửi phản hồi</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>Chưa phản hồi</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingMsgId(msg.id);
                              setTeacherReplyText('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Soạn phản hồi</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
