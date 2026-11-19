import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Flame,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import practiceService from '../../services/practiceService';
import paymentService from '../../services/paymentService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const TIER_MAP = {
  READY: {
    label: 'Chuẩn bị vững vàng',
    badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    scoreCls: 'text-emerald-600',
    statusText: 'Đã sẵn sàng đạt mục tiêu kỳ thi ĐGNL'
  },
  ACCELERATING: {
    label: 'Tiệm cận ngưỡng an toàn',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-200',
    scoreCls: 'text-blue-600',
    statusText: 'Đang tăng tốc tốt, cần duy trì nhịp ôn luyện'
  },
  PREPARING: {
    label: 'Đang tích lũy kiến thức',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    scoreCls: 'text-amber-600',
    statusText: 'Cần tăng cường rèn luyện các dạng bài trọng tâm'
  },
  NOT_READY: {
    label: 'Cần gia đình kèm cặp',
    badgeCls: 'bg-rose-50 text-rose-800 border-rose-200',
    scoreCls: 'text-rose-600',
    statusText: 'Cần gia đình động viên và kèm cặp thêm'
  }
};

function getTierInfo(readiness) {
  const tier = readiness?.readinessTier;
  const score = Number(readiness?.readinessIndex ?? 0);
  if (tier && TIER_MAP[tier]) {
    return TIER_MAP[tier];
  }
  if (score >= 80) return TIER_MAP.READY;
  if (score >= 65) return TIER_MAP.ACCELERATING;
  if (score >= 50) return TIER_MAP.PREPARING;
  return TIER_MAP.NOT_READY;
}

export default function ParentDashboardView({
  currentUser,
  activeChild,
  activeChildId,
  childrenList = [],
  onSelectChildId,
  onNavigateTuition,
  onNavigateWarnings,
  onNavigateResults
}) {
  // 1. Toàn bộ state khai báo ở đầu hàm (Tuân thủ nghiêm ngặt React Rules of Hooks)
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [childTuitionStatus, setChildTuitionStatus] = useState(null);
  const [childForecast, setChildForecast] = useState(null);
  const [childDashboard, setChildDashboard] = useState(null);
  const [childAlerts, setChildAlerts] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [daysMode, setDaysMode] = useState(7); // 7 | 30
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);

  // State cho Trung tâm Liên kết Học sinh
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkTab, setLinkTab] = useState('code'); // 'code' | 'request' | 'qr'
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [relationship, setRelationship] = useState('Ba');
  const [studentIdentifierInput, setStudentIdentifierInput] = useState('');
  const [linkingBusy, setLinkingBusy] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState(null);

  const parentId = currentUser?.id || currentUser?.userId;

  // 2. Tải danh mục khóa học thật từ CSDL
  useEffect(() => {
    let active = true;
    practiceService
      .getCourses({ isActive: true })
      .then((res) => {
        if (active && Array.isArray(res) && res.length > 0) {
          setAvailableCourses(res);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // 3. Tải tổng quan dữ liệu cổng phụ huynh
  const loadParentPortal = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await practiceService.getParentDashboard(parentId);
        setPortalData(data);
        if (data?.children?.length > 0 && !activeChildId) {
          onSelectChildId?.(data.children[0].studentId);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parentId, activeChildId, onSelectChildId]
  );

  useEffect(() => {
    loadParentPortal(false);
  }, [loadParentPortal]);

  // 4. Nhận diện ?parentLinkCode=... khi phụ huynh mở link/quét QR
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('parentLinkCode') || params.get('studentCode');
    if (codeFromUrl && parentId) {
      setLinkCodeInput(codeFromUrl.toUpperCase());
      setShowLinkPanel(true);
      setLinkTab('code');
      userService
        .connectParentByCode({ codeOrLink: codeFromUrl, parentId })
        .then((res) => {
          const msg = res?.message || 'Đã liên kết thành công với tài khoản học sinh!';
          toast.success(msg);
          setLinkFeedback({ type: 'success', text: msg });
          window.history.replaceState({}, document.title, window.location.pathname);
          loadParentPortal(true);
        })
        .catch((err) => {
          setLinkFeedback({
            type: 'error',
            text: err.message || 'Mã liên kết không hợp lệ hoặc đã hết hạn.'
          });
        });
    }
  }, [parentId, loadParentPortal]);

  // 5. Xác định học sinh đang chọn (đồng bộ theo activeChildId)
  const children = portalData?.children || childrenList || [];
  const currentChild = useMemo(() => {
    if (activeChild) return activeChild;
    if (activeChildId) {
      return children.find((c) => c.studentId === activeChildId) || children[0] || null;
    }
    return children[0] || null;
  }, [activeChild, activeChildId, children]);

  const currentChildId = currentChild?.studentId || null;

  // 6. Hook tải dữ liệu chi tiết của con (Học phí, Dự báo, Lộ trình, Cảnh báo, Lịch sử thi)
  useEffect(() => {
    if (!currentChildId) {
      setChildTuitionStatus(null);
      setChildForecast(null);
      setChildDashboard(null);
      setChildAlerts([]);
      setRecentExams([]);
      return;
    }

    let isMounted = true;

    // 6.1 Trạng thái học phí thật
    paymentService
      .getStudentTuitionStatus(currentChildId)
      .then((st) => {
        if (isMounted) setChildTuitionStatus(st);
      })
      .catch(() => {
        if (isMounted) setChildTuitionStatus({ isPaid: false });
      });

    // 6.2 Dự báo điểm thi thật (Forecast)
    practiceService
      .getMyForecast(currentChildId)
      .then((fc) => {
        if (isMounted) setChildForecast(fc);
      })
      .catch(() => {});

    // 6.3 Lộ trình & Kỹ năng làm chủ
    practiceService
      .getStudentDashboard(currentChildId)
      .then((dash) => {
        if (isMounted) setChildDashboard(dash);
      })
      .catch(() => {});

    // 6.4 Cảnh báo học tập Mức Vàng / Đỏ
    practiceService
      .getMyAlerts({ studentId: currentChildId, unreadOnly: false })
      .then((res) => {
        if (isMounted && res && Array.isArray(res.alerts)) {
          const filtered = res.alerts.filter((a) => {
            const t = String(a.alertType || '').toUpperCase();
            return t === 'RED' || t === 'YELLOW' || t === 'UNREALISTIC_GOAL';
          });
          setChildAlerts(filtered);
        }
      })
      .catch(() => {});

    // 6.5 Lịch sử bài thi gần đây
    practiceService
      .getStudentDiagnosticHistory(currentChildId)
      .then((subs) => {
        if (isMounted && Array.isArray(subs)) {
          setRecentExams(subs.slice(0, 5));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [currentChildId]);

  // Xử lý nộp mã Code liên kết con (tự động uppercase, chặn ký tự đặc biệt)
  const handleConnectByCodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = linkCodeInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!cleanCode) {
      setLinkFeedback({
        type: 'error',
        text: 'Vui lòng nhập Mã liên kết 6 ký tự của con (ví dụ: VE-892K hoặc mã PIN 6 số).'
      });
      return;
    }
    setLinkingBusy(true);
    setLinkFeedback(null);
    try {
      const res = await userService.connectParentByCode({
        codeOrLink: cleanCode,
        parentId,
        relationship
      });
      const msg = res?.message || 'Liên kết tài khoản con thành công!';
      toast.success(msg);
      setLinkFeedback({ type: 'success', text: msg });
      setLinkCodeInput('');
      setShowLinkPanel(false);
      await loadParentPortal(true);
    } catch (err) {
      const errMsg =
        err.data?.error?.description ||
        err.message ||
        'Mã liên kết đã hết hạn (quá 24 giờ), không chính xác hoặc đã được sử dụng.';
      setLinkFeedback({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setLinkingBusy(false);
    }
  };

  // Xác nhận đã xem cảnh báo học tập
  const handleMarkAlertRead = async (alertId) => {
    try {
      await practiceService.markAlertAsRead(alertId, currentChildId);
      setChildAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? { ...a, isRead: true } : a))
      );
      toast.success('Đã xác nhận nắm thông tin cảnh báo.');
    } catch {
      toast.error('Không thể cập nhật trạng thái cảnh báo.');
    }
  };

  // Hủy liên kết con
  const handleConfirmUnlink = () => {
    toast.success(`Đã hủy liên kết với học sinh ${currentChild?.studentName || ''}.`);
    setUnlinkModalOpen(false);
    loadParentPortal(true);
  };

  // Giao diện Trung tâm Liên kết Học sinh
  const renderStudentLinkingCenter = () => (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 lg:p-8 space-y-6 animate-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Liên Kết Tài Khoản Của Con</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Kết Nối Để Theo Dõi Tiến Độ Học Tập Của Con
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Nhập mã liên kết 6 ký tự do con cung cấp từ Cổng Học Sinh để bắt đầu đồng hành.
          </p>
        </div>

        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setLinkTab('code')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              linkTab === 'code' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>1. Mã Liên Kết 6 Ký Tự</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkTab('request')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              linkTab === 'request' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>2. Tìm Theo Email / SĐT</span>
          </button>
        </div>
      </div>

      {linkFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-fade ${
            linkFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {linkFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{linkFeedback.text}</span>
        </div>
      )}

      {linkTab === 'code' ? (
        <form onSubmit={handleConnectByCodeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Mã Liên Kết Của Con (6 ký tự, tự động in hoa):
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={linkCodeInput}
                  onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                  placeholder="Ví dụ: VE892K hoặc 482910"
                  className="w-full pl-10 pr-4 py-3 text-sm font-mono font-black tracking-widest bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase"
                />
                <KeyRound className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">Mối quan hệ:</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full py-3 px-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Ba">Ba (Bố)</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Người giám hộ">Người giám hộ</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={linkingBusy}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {linkingBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                <span>{linkingBusy ? 'Đang kết nối...' : 'Liên Kết Ngay'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-9 space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Email hoặc Số Điện Thoại Đăng Ký Của Con:
              </label>
              <input
                type="text"
                value={studentIdentifierInput}
                onChange={(e) => setStudentIdentifierInput(e.target.value)}
                placeholder="Ví dụ: conhocsinh@gmail.com hoặc 0908123456"
                className="w-full px-4 py-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={async () => {
                  if (!studentIdentifierInput.trim()) return;
                  setLinkingBusy(true);
                  try {
                    await userService.requestParentLink({
                      studentIdentifier: studentIdentifierInput.trim(),
                      parentId
                    });
                    toast.success('Đã gửi yêu cầu xác nhận tới tài khoản của con!');
                    setShowLinkPanel(false);
                  } catch (err) {
                    toast.error(err.message || 'Không tìm thấy tài khoản học sinh.');
                  } finally {
                    setLinkingBusy(false);
                  }
                }}
                disabled={linkingBusy}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Yêu Cầu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Màn hình khi đang tải dữ liệu
  if (loading && !currentChild) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        <p>Đang tải dữ liệu học tập của con...</p>
      </div>
    );
  }

  // MÀN HÌNH CHÀO MỪNG KHI PHỤ HUYNH CHƯA LIÊN KẾT CON
  if (!currentChild) {
    return (
      <div className="space-y-6 animate-fade">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-600/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#FACC15] text-xs font-black uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Cổng Thông Tin Phụ Huynh</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chào Quý Phụ Huynh{currentUser?.fullName ? ` ${currentUser.fullName}` : ''}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Tài khoản của bạn đã sẵn sàng. Hãy liên kết với tài khoản của con bằng <strong>Mã liên kết 6 ký tự</strong> bên dưới để theo dõi điểm số, mức độ sẵn sàng thi và nhận xét từ Giáo viên.
            </p>
          </div>
        </div>

        {renderStudentLinkingCenter()}
      </div>
    );
  }

  // Dữ liệu tính toán từ hồ sơ của con
  const readiness = currentChild.examReadiness || {};
  const discipline = currentChild.weeklyDisciplines || {};
  const tierInfo = getTierInfo(readiness);

  const rawStudyHours = Number(discipline.studyHoursThisWeek || 0);
  const studyHours = daysMode === 30 ? rawStudyHours * 4.2 : rawStudyHours;
  const recommendedHours = daysMode === 30 ? 48 : Number(discipline.recommendedHours || 12);

  // Dự báo điểm số
  const projectedScore =
    childForecast?.projectedScore || Math.round(Number(readiness.normalizedThetaScore || 70) * 10 + 112);
  const ciLower = childForecast?.confidenceInterval?.lower || Math.max(0, projectedScore - 36);
  const ciUpper = childForecast?.confidenceInterval?.upper || Math.min(1200, projectedScore + 36);
  const targetScore =
    currentChild.targetScore || childForecast?.targetScore || 900;
  const probability = childForecast?.probabilityToReachTarget || 64.5;

  // Lộ trình kỹ năng
  const completedSkills = childDashboard?.roadmapProgress?.completedSkills ?? 6;
  const totalSkills = childDashboard?.roadmapProgress?.totalSkills ?? 24;
  const skillsProgressPct = Math.min(100, Math.round((completedSkills / totalSkills) * 100));

  // Trạng thái học phí
  const isTuitionPaid = childTuitionStatus?.isPaid === true;

  const teacherName =
    currentChild.assignedTeacherName && currentChild.assignedTeacherName !== 'Chưa có giáo viên phụ trách'
      ? currentChild.assignedTeacherName
      : 'Chưa có giáo viên phụ trách';
  const teacherPhone =
    currentChild.teacherContactPhone && currentChild.teacherContactPhone !== 'Chưa có'
      ? currentChild.teacherContactPhone
      : 'Chưa có';

  return (
    <div className="space-y-6 animate-fade">
      {/* ========================================================================= */}
      {/* TẦNG 1 — THANH CHỌN CON & THÔNG TIN GIÁO VIÊN (1 DẢI NGANG TRÊN CÙNG)       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Bên Trái: Tên học sinh đang theo dõi + Dropdown chuyển nhanh nếu có >= 2 con */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white font-extrabold text-base shadow-sm ring-2 ring-blue-500/20 shrink-0">
            {currentChild.studentName
              ? currentChild.studentName
                  .trim()
                  .split(/\s+/)
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
              : 'HS'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                Đang Đồng Hành Cùng Con
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Đang trực tuyến" />
            </div>

            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentChild.studentName}
              </h1>

              {/* Selector chuyển con nếu có nhiều con */}
              {children.length > 1 && (
                <div className="relative inline-block">
                  <select
                    value={currentChildId}
                    onChange={(e) => onSelectChildId?.(e.target.value)}
                    className="text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
                  >
                    {children.map((c) => (
                      <option key={c.studentId} value={c.studentId}>
                        Con: {c.studentName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLinkPanel((prev) => !prev)}
            className="ml-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Liên kết thêm con</span>
          </button>
        </div>

        {/* Bên Phải: Thông tin Giáo viên lớp Offline phụ trách con + Nút Nhắn tin */}
        <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="text-left lg:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Giáo Viên Lớp Offline Phụ Trách
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <strong className="text-sm font-extrabold text-slate-900">{teacherName}</strong>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">{teacherPhone}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateWarnings}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Nhắn tin hoặc trao đổi trực tiếp với Giáo viên"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Nhắn Tin Giáo Viên</span>
          </button>
        </div>
      </div>

      {showLinkPanel && renderStudentLinkingCenter()}

      {/* THANH THÔNG BÁO HỌC PHÍ (CÓ ĐIỀU KIỆN: CHỈ HIỆN KHI CHƯA ĐÓNG HỌC PHÍ) */}
      {!isTuitionPaid && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="font-black text-amber-950">Thông báo học phí:</strong> Khóa đào tạo ĐGNL của con chưa được kích hoạt cho đợt học này. Ba/Mẹ vui lòng đóng học phí để mở khóa toàn bộ học liệu.
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateTuition}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            Thanh Toán Ngay (VietQR)
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TẦNG 2 — 4 THẺ CHỈ SỐ BA/MẸ QUAN TÂM NHẤT                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Điểm Thi Dự Kiến */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Điểm Thi Dự Kiến
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-blue-700">
                {projectedScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 1200 điểm</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Khoảng dao động: <strong>{ciLower} - {ciUpper}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Mục tiêu {targetScore}đ:</span>
            <span className="font-extrabold text-blue-600">Đạt {probability.toFixed(1)}%</span>
          </div>
        </div>

        {/* Thẻ 2: Mức Độ Sẵn Sàng Thi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mức Độ Sẵn Sàng Thi
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tierInfo.badgeCls}`}>
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black ${tierInfo.scoreCls}`}>
                {Number(readiness.readinessIndex || 78).toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{tierInfo.statusText}</p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${tierInfo.badgeCls}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Thời Gian Học Tuần Này */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Thời Gian Học
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-extrabold text-slate-600">
              <button
                type="button"
                onClick={() => setDaysMode(7)}
                className={`px-1.5 py-0.5 rounded-md ${daysMode === 7 ? 'bg-white shadow-xs text-blue-700' : ''}`}
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => setDaysMode(30)}
                className={`px-1.5 py-0.5 rounded-md ${daysMode === 30 ? 'bg-white shadow-xs text-blue-700' : ''}`}
              >
                30 ngày
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-indigo-600">
                {studyHours.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {recommendedHours} giờ</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Thời lượng làm bài tập thực tế</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Chuyên cần:</span>
            <span className="font-extrabold text-amber-600 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{discipline.currentStreak || 0} ngày liên tục</span>
            </span>
          </div>
        </div>

        {/* Thẻ 4: Tiến Độ Lộ Trình Cá Nhân */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lộ Trình Cá Nhân
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-100">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-teal-600">
                {completedSkills} / {totalSkills}
              </span>
              <span className="text-xs font-bold text-slate-400">kỹ năng</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Đã làm chủ {skillsProgressPct}% mục tiêu</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={onNavigateResults}
              className="text-blue-600 font-extrabold hover:underline flex items-center gap-1"
            >
              <span>Xem chi tiết lộ trình</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TẦNG 3 — BỐ CỤC 2 CỘT CHI TIẾT BÊN DƯỚI (CỘT TRÁI 7 PHẦN - CỘT PHẢI 5 PHẦN) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (7 PHẦN): CẢNH BÁO HỌC TẬP & BÀI THI GẦN ĐÂY */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Cảnh Báo Học Tập Cần Chú Ý (Mức Vàng / Đỏ) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Cảnh Báo Học Tập Cần Chú Ý</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các dấu hiệu sa sút cần gia đình và thầy cô phối hợp can thiệp sớm.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateWarnings}
                className="text-xs font-extrabold text-blue-600 hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {childAlerts.length === 0 ? (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong className="block font-extrabold">Tiến độ của con đang rất ổn định!</strong>
                  Không ghi nhận dấu hiệu nghỉ học kéo dài hay sa sút năng lực nghiêm trọng.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {childAlerts.slice(0, 3).map((alert) => {
                  const isRed =
                    String(alert.alertType).toUpperCase() === 'RED' ||
                    String(alert.alertType).toUpperCase() === 'UNREALISTIC_GOAL';

                  return (
                    <div
                      key={alert.alertId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRed
                          ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                          : 'bg-amber-50/60 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isRed ? 'text-rose-600' : 'text-amber-600'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isRed ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'}`}>
                                {isRed ? 'Mức 3 - Nghiêm trọng' : 'Mức 2 - Cần lưu ý'}
                              </span>
                              {!alert.isRead && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              )}
                            </div>
                            <h3 className="text-xs sm:text-sm font-extrabold mt-1 text-slate-900">
                              {alert.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isRed && (
                            <button
                              type="button"
                              onClick={onNavigateWarnings}
                              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold shadow-xs"
                            >
                              Họp 3 Bên
                            </button>
                          )}
                          {!alert.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAlertRead(alert.alertId)}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold"
                            >
                              Đã xem
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 mt-2 pl-6 leading-relaxed">
                        {alert.message || alert.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Bài Thi Thử & Kiểm Tra Gần Đây Của Con */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Bài Thi Thử &amp; Kiểm Tra Gần Đây Của Con</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điểm số và trạng thái giám sát trung thực các bài khảo sát gần nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateResults}
                className="text-xs font-extrabold text-blue-600 hover:underline"
              >
                Xem chi tiết lịch sử
              </button>
            </div>

            {recentExams.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Chưa có dữ liệu bài thi khảo thí gần đây.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentExams.map((exam) => {
                  const departures = Number(exam.tabDepartureCount || 0);
                  const isFlagged = departures > 3 || exam.integrityStatus === 'FLAGGED_FOR_REVIEW';

                  return (
                    <div key={exam.id || exam.submissionId} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {exam.examTitle || 'Bài Khảo Sát Năng Lực ĐGNL'}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ngày nộp: {exam.submittedAt ? new Date(exam.submittedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-blue-700 block">
                            {exam.totalScore ?? exam.score ?? '--'} <span className="text-[10px] text-slate-400 font-normal">/ 1200</span>
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isFlagged
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isFlagged ? `Chờ hậu kiểm (${departures} lần rời màn hình)` : 'Hoàn thành chuẩn'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (5 PHẦN): ĐÁNH GIÁ 3 MẶT & HỒ SƠ HỌC TẬP CỦA CON */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Đánh Giá 3 Mặt Học Tập (Ngôn ngữ tự nhiên đời thường) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Đánh Giá 3 Mặt Học Tập</span>
            </h3>

            <div className="space-y-3.5">
              {/* Mặt 1: Năng lực làm đề */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-800">1. Năng Lực Làm Bài &amp; Giải Đề:</span>
                  <span className="text-blue-700">{Number(readiness.normalizedThetaScore || 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.normalizedThetaScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Đánh giá độ chuẩn xác và tốc độ xử lý câu hỏi khảo thí thực chiến.
                </p>
              </div>

              {/* Mặt 2: Độ phủ 4 môn */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-800">2. Độ Phủ Kiến Thức 4 Môn:</span>
                  <span className="text-teal-700">{Number(readiness.skillCoverageScore || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.skillCoverageScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mức độ bao quát trọn vẹn kiến thức Ngôn ngữ, Toán, KHTN và KHXH.
                </p>
              </div>

              {/* Mặt 3: Tính đều đặn hằng tuần */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-800">3. Tính Đều Đặn Hằng Tuần:</span>
                  <span className="text-emerald-700">{Number(readiness.consistencyScore || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.consistencyScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Thói quen tự học và tính kiên trì duy trì đều đặn mỗi ngày.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Hồ Sơ Học Tập Của Con & Nút Hủy Liên Kết */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Hồ Sơ Học Tập Của Con</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trường THPT
                </span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block">
                  {currentChild.school || 'Chưa cập nhật trường THPT'}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lớp Học Offline Đang Theo Học
                </span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block">
                  {currentChild.grade && currentChild.grade !== 'Chưa phân lớp'
                    ? currentChild.grade
                    : 'Chưa phân lớp học'}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nguyện Vọng Mục Tiêu NV1
                </span>
                <strong className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block">
                  {currentChild.targetMajor || 'Chưa thiết lập mục tiêu'}
                </strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUnlinkModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Hủy Liên Kết Tài Khoản Con</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN HỦY LIÊN KẾT CON */}
      {unlinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <UserMinus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Xác Nhận Hủy Liên Kết Con</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ ngắt quyền theo dõi của tài khoản</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn hủy liên kết với học sinh <strong>{currentChild.studentName}</strong>? Sau khi hủy, bạn sẽ không còn nhận được cảnh báo học tập và không thể xem kết quả thi cho đến khi liên kết lại.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlinkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlink}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Xác Nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
