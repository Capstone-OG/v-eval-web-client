import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
  BookOpen,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Flame,
  ShieldCheck,
  Target,
  ChevronRight,
  QrCode,
  HeartHandshake,
  KeyRound,
  Link2,
  Mail,
  UserPlus,
  Send
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { userService } from '../../services/userService';
import StudentEarlyWarningsCard from './StudentEarlyWarningsCard';
import { toast } from '../../context/ToastContext';
import PayOsCheckoutModal from '../modals/PayOsCheckoutModal';
import paymentService from '../../services/paymentService';

const TIER_MAP = {
  READY: {
    label: 'Sẵn sàng chinh phục nguyện vọng',
    badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    scoreCls: 'text-emerald-600',
    statusText: 'Đang đạt phong độ thi cử rất tốt'
  },
  ACCELERATING: {
    label: 'Đang bứt phá tiến độ',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-200',
    scoreCls: 'text-blue-600',
    statusText: 'Tiến độ làm chủ kiến thức khả quan'
  },
  PREPARING: {
    label: 'Đang củng cố nền tảng',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    scoreCls: 'text-amber-600',
    statusText: 'Cần duy trì luyện đề đều đặn hơn'
  },
  NEAR_READY: {
    label: 'Tiệm cận ngưỡng an toàn',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    scoreCls: 'text-amber-600',
    statusText: 'Cần duy trì nhịp học đều đặn'
  },
  NOT_READY: {
    label: 'Cần tăng cường ôn tập',
    badgeCls: 'bg-rose-50 text-rose-800 border-rose-200',
    scoreCls: 'text-rose-600',
    statusText: 'Cần gia đình động viên và kèm cặp thêm'
  },
  AT_RISK: {
    label: 'Cần tăng cường ôn tập',
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

const DISCIPLINE_MAP = {
  EXCEEDED_GOAL: {
    label: 'Vượt định mức 12 giờ/tuần',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  ON_TRACK: {
    label: 'Đúng tiến độ cam kết',
    cls: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  NEEDS_IMPROVEMENT: {
    label: 'Chưa đủ định mức 12 giờ/tuần',
    cls: 'bg-amber-100 text-amber-800 border-amber-200'
  }
};

export default function ParentDashboardView({ currentUser, onNavigateTuition }) {
  const [portalData, setPortalData] = useState(null);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('UNPAID'); // UNPAID | ACTIVE

  // State cho Trung tâm Liên kết Tài khoản Học sinh (3 phương thức: Mã Code / Link & QR / Gửi yêu cầu Email)
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkTab, setLinkTab] = useState('code'); // 'code' | 'request' | 'qr'
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [studentIdentifierInput, setStudentIdentifierInput] = useState('');
  const [linkingBusy, setLinkingBusy] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  const parentId = currentUser?.id || currentUser?.userId;

  const loadParentPortal = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await practiceService.getParentDashboard(parentId);
        setPortalData(data);
        setSelectedChildIdx(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parentId]
  );

  useEffect(() => {
    loadParentPortal(false);
  }, [loadParentPortal]);

  // Tự động nhận diện ?parentLinkCode=... khi Phụ huynh mở Đường liên kết mời hoặc quét QR của con
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('parentLinkCode') || params.get('studentCode');
    if (codeFromUrl && parentId) {
      setLinkCodeInput(codeFromUrl);
      setShowLinkPanel(true);
      setLinkTab('code');
      userService
        .connectParentByCode({ codeOrLink: codeFromUrl, parentId })
        .then((res) => {
          const msg = res?.message || 'Đã liên kết thành công với tài khoản học sinh từ đường dẫn QR/Link!';
          toast.success(msg);
          setLinkFeedback({ type: 'success', text: msg });
          window.history.replaceState({}, document.title, window.location.pathname);
          loadParentPortal(true);
        })
        .catch((err) => {
          setLinkFeedback({
            type: 'error',
            text: err.message || 'Mã liên kết từ đường dẫn không hợp lệ hoặc đã hết hạn.'
          });
        });
    }
  }, [parentId, loadParentPortal]);

  const handleConnectByCodeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!linkCodeInput.trim()) {
      setLinkFeedback({
        type: 'error',
        text: 'Vui lòng nhập Mã tài khoản học sinh (VE-XXXXXX), Mã PIN 6 số hoặc dán Đường liên kết mời.'
      });
      return;
    }
    setLinkingBusy(true);
    setLinkFeedback(null);
    try {
      const res = await userService.connectParentByCode({
        codeOrLink: linkCodeInput.trim(),
        parentId
      });
      const msg = res?.message || 'Liên kết tài khoản học sinh thành công!';
      toast.success(msg);
      setLinkFeedback({ type: 'success', text: msg });
      setLinkCodeInput('');
      setShowLinkPanel(false);
      await loadParentPortal(true);
    } catch (err) {
      const errMsg =
        err.data?.error?.description ||
        err.message ||
        'Không thể liên kết tài khoản. Vui lòng kiểm tra lại mã code.';
      setLinkFeedback({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setLinkingBusy(false);
    }
  };

  const handleRequestByEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!studentIdentifierInput.trim()) {
      setLinkFeedback({
        type: 'error',
        text: 'Vui lòng nhập Email hoặc Số điện thoại của con.'
      });
      return;
    }
    setLinkingBusy(true);
    setLinkFeedback(null);
    try {
      const res = await userService.requestParentLink({
        studentIdentifier: studentIdentifierInput.trim(),
        parentId
      });
      const msg =
        res?.message ||
        'Đã gửi yêu cầu liên kết! Học sinh có thể bấm Chấp nhận trên Cổng Học Viên hoặc đọc mã xác nhận 6 số cho bạn.';
      toast.success(msg);
      setLinkFeedback({ type: 'success', text: msg });
      await loadParentPortal(true);
    } catch (err) {
      const errMsg =
        err.data?.error?.description ||
        err.message ||
        'Không tìm thấy tài khoản học sinh với thông tin này.';
      setLinkFeedback({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setLinkingBusy(false);
    }
  };

  const renderStudentLinkingCenter = () => (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Trung Tâm Liên Kết Tài Khoản Phụ Huynh - Học Sinh</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Chọn 1 Trong 3 Cách Để Kết Nối Với Tài Khoản Của Con
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Hoạt động trực tiếp 100% trên Cơ sở dữ liệu V-Eval (không phụ thuộc máy chủ gửi thư SMTP).
          </p>
        </div>

        {/* 3 Method Tabs */}
        <div className="p-1 bg-slate-100 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              setLinkTab('code');
              setLinkFeedback(null);
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              linkTab === 'code'
                ? 'bg-white text-blue-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>1. Mã Code / Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLinkTab('request');
              setLinkFeedback(null);
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              linkTab === 'request'
                ? 'bg-white text-blue-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>2. Gửi Yêu Cầu Xác Nhận</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLinkTab('qr');
              setLinkFeedback(null);
            }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              linkTab === 'qr'
                ? 'bg-white text-blue-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>3. Quét Mã QR</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* TAB 1: NHẬP MÃ TÀI KHOẢN / MÃ PIN 6 SỐ / DÁN ĐƯỜNG LIÊN KẾT */}
      {linkTab === 'code' && (
        <form onSubmit={handleConnectByCodeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-8 space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Nhập Mã Tài Khoản Học Sinh (`VE-XXXXXX`), Mã PIN 6 Số hoặc Dán Đường Liên Kết Mời
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={linkCodeInput}
                  onChange={(e) => setLinkCodeInput(e.target.value)}
                  placeholder="Ví dụ: VE-8F3A1C hoặc 482910 hoặc http://localhost:5173/?parentLinkCode=..."
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <KeyRound className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="lg:col-span-4">
              <button
                type="submit"
                disabled={linkingBusy}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {linkingBusy ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                <span>{linkingBusy ? 'Đang kết nối...' : 'Kết Nối Ngay Với Con'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="font-extrabold text-slate-800">Bước 1: Mở Cổng Học Viên</div>
              <p className="text-[11px] text-slate-500">
                Học sinh đăng nhập vào Cổng Học Viên, nhìn thanh <strong>Liên Kết Tài Khoản Phụ Huynh</strong> ngay đầu trang.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="font-extrabold text-slate-800">Bước 2: Lấy Mã Code / Link</div>
              <p className="text-[11px] text-slate-500">
                Học sinh copy <strong>Mã học sinh (VE-XXXXXX)</strong>, <strong>Mã PIN 6 số</strong> hoặc <strong>Đường liên kết mời</strong> gửi cho Phụ huynh.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1">
              <div className="font-extrabold text-blue-900">Bước 3: Dán Mã & Đồng Hành</div>
              <p className="text-[11px] text-blue-700">
                Phụ huynh nhập mã vào ô trên và bấm <strong>Kết Nối Ngay Với Con</strong> để mở khóa toàn bộ báo cáo học tập.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: GỬI YÊU CẦU THEO EMAIL / SĐT HỌC SINH & XÁC NHẬN 2 CHIỀU TRÊN WEB */}
      {linkTab === 'request' && (
        <form onSubmit={handleRequestByEmailSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-8 space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Nhập Địa Chỉ Email hoặc Số Điện Thoại Tài Khoản Của Con
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentIdentifierInput}
                  onChange={(e) => setStudentIdentifierInput(e.target.value)}
                  placeholder="Ví dụ: hocsinh@gmail.com hoặc 0912345678"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <Mail className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="lg:col-span-4">
              <button
                type="submit"
                disabled={linkingBusy}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {linkingBusy ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{linkingBusy ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Xác Nhận'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-extrabold">Cơ chế Xác nhận 2 chiều trực tiếp trên Web (Không cần Email SMTP):</div>
            <p className="text-[11px] leading-relaxed">
              Ngay sau khi bạn bấm <strong>Gửi Yêu Cầu Xác Nhận</strong>, trên màn hình <strong>Cổng Học Viên</strong> của con sẽ xuất hiện hộp thoại thông báo yêu cầu liên kết từ bạn. Con chỉ cần bấm nút <strong>&ldquo;Chấp Nhận Liên Kết&rdquo;</strong> trên màn hình của con (hoặc đọc mã xác nhận 6 số hiện trên thông báo đó để bạn nhập ở Tab 1) là hai tài khoản được kết nối tức thì!
            </p>
          </div>
        </form>
      )}

      {/* TAB 3: HƯỚNG DẪN QUÉT MÃ QR & ĐƯỜNG LIÊN KẾT 1-CLICK */}
      {linkTab === 'qr' && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>Quét Mã QR Hoặc Nhấn Đường Liên Kết Mời Từ Học Sinh</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Trên máy tính/điện thoại của con, đăng nhập vào <strong>Cổng Học Viên</strong> và bấm nút <strong>&ldquo;Mở Mã PIN, Link &amp; QR&rdquo;</strong>.<br />
              2. Dùng Camera điện thoại hoặc Zalo của Phụ huynh quét <strong>Mã QR</strong> trên màn hình của con (hoặc bấm vào đường liên kết con gửi qua Zalo).<br />
              3. Trình duyệt sẽ tự động mở Cổng Phụ Huynh kèm tham số <code className="px-1.5 py-0.5 bg-white rounded border border-blue-200 text-blue-700 font-mono">?parentLinkCode=...</code> và tự động kích hoạt liên kết 100%!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLinkTab('code')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shrink-0 cursor-pointer"
          >
            Nhập Mã / Dán Link Thủ Công
          </button>
        </div>
      )}
    </div>
  );

  if (loading && !portalData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center animate-pulse space-y-3">
        <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
        <div className="text-sm font-extrabold text-slate-800">
          Đang tải dữ liệu học tập của con...
        </div>
      </div>
    );
  }

  const children = portalData?.children || [];
  const child = children[selectedChildIdx] || null;

  if (!child) {
    return (
      <div className="space-y-6 animate-fade w-full">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-600/30 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#FACC15] text-xs font-extrabold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Cổng Thông Tin Phụ Huynh</span>
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Chào phụ huynh{currentUser?.fullName ? ` ${currentUser.fullName}` : ''}!
            </h1>
            <p className="text-xs lg:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Tài khoản phụ huynh của bạn đã được kích hoạt. Hãy liên kết với tài khoản của con bằng <strong>Mã Code Tài Khoản (VE-XXXXXX / Mã PIN 6 số)</strong>, <strong>Đường Liên Kết / Mã QR</strong> hoặc <strong>Gửi Yêu Cầu Xác Nhận 2 Chiều</strong> bên dưới để bắt đầu theo dõi lộ trình học tập.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => loadParentPortal(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới dữ liệu</span>
            </button>
            {onNavigateTuition && (
              <button
                onClick={onNavigateTuition}
                className="px-4 py-2.5 rounded-xl bg-[#FACC15] text-slate-950 font-black text-xs shadow-md cursor-pointer"
              >
                Mở Cổng Học Phí PayOS
              </button>
            )}
          </div>
        </div>

        {/* Hiển thị Trung tâm Liên kết Học sinh ngay bên dưới */}
        {renderStudentLinkingCenter()}
      </div>
    );
  }

  const readiness = child.examReadiness || {};
  const discipline = child.weeklyDisciplines || {};
  const tierInfo = getTierInfo(readiness);
  const disciplineInfo = DISCIPLINE_MAP[discipline.completionStatus] || DISCIPLINE_MAP.ON_TRACK;
  const recommendedHours = Number(discipline.recommendedHours || 12);
  const studyHours = Number(discipline.studyHoursThisWeek || 0);
  const disciplinePct = Math.min(100, Math.round((studyHours / recommendedHours) * 100));

  const handleQuickPay = async () => {
    try {
      const payload = {
        studentId: child.studentId || currentUser?.id,
        parentId: currentUser?.id,
        courseId: 'c2222222-2222-2222-2222-222222222222',
        returnUrl: window.location.origin + '/payment/success',
        cancelUrl: window.location.origin + '/payment/cancel'
      };
      const result = await paymentService.createPaymentLink(payload);
      setActivePaymentData({
        orderCode: result.orderCode,
        checkoutUrl: result.checkoutUrl,
        amount: result.amount || 5000,
        courseName: 'Khóa Luyện Thi Chuẩn (Standard Adaptive 12 Tuần)',
        studentName: child.studentName || 'Học viên',
        durationWeeks: 12
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade w-full">
      {/* Hero Header: Thông tin học sinh & Thao tác đồng hành */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-extrabold uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
                Không Gian Đồng Hành Cùng Con
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cập nhật trực tiếp theo thời gian thực
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Đồng Hành Cùng Con: {child.studentName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Theo dõi tiến độ học tập, mức độ sẵn sàng cho kỳ thi ĐGNL và nhận định sư phạm từ hệ thống V-Eval.
              </p>
            </div>

            {/* Student metadata context pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {child.school && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{child.school}</span>
                </span>
              )}
              {child.grade && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{child.grade}</span>
                </span>
              )}
              {child.targetMajor && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 font-medium">
                  <Target className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Mục tiêu: {child.targetMajor}</span>
                </span>
              )}
            </div>

            {children.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-xs text-slate-400 font-bold">Chọn con để theo dõi:</span>
                {children.map((c, idx) => (
                  <button
                    key={c.studentId || idx}
                    onClick={() => setSelectedChildIdx(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      idx === selectedChildIdx
                        ? 'bg-[#FACC15] text-slate-950 shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {c.studentName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowLinkPanel((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showLinkPanel ? 'Đóng khung liên kết' : '+ Liên kết thêm con'}</span>
            </button>

            <button
              onClick={() => loadParentPortal(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Cập nhật báo cáo</span>
            </button>
          </div>
        </div>
      </div>

      {showLinkPanel && renderStudentLinkingCenter()}

      {/* Thanh toán học phí: Sáng sủa, thanh lịch, đồng bộ không lấn át giao diện */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                Dịch vụ học tập
              </span>
              <span className="text-xs font-bold text-slate-600">Khóa Luyện Thi Chuẩn (12 Tuần)</span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              {paymentStatus === 'ACTIVE'
                ? 'Học Phí Khóa Học: ĐÃ THANH TOÁN (Lộ Trình Đang Kích Hoạt)'
                : 'Mở Khóa Toàn Diện Lộ Trình Học Cá Nhân Hóa Cho Con'}
            </h2>
            <p className="text-xs text-slate-500">
              {paymentStatus === 'ACTIVE'
                ? 'Con đã được kích hoạt bài giảng chuyên sâu, bài luyện tập thích ứng và gia sư sư phạm hỗ trợ.'
                : 'Học phí: 5.000 ₫ • Quét mã VietQR ngân hàng kích hoạt tức thì sau 3 giây.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {paymentStatus !== 'ACTIVE' ? (
            <button
              onClick={handleQuickPay}
              className="w-full sm:w-auto py-2.5 px-4.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Nộp Học Phí Cho Con</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã Kích Hoạt</span>
            </span>
          )}

          {onNavigateTuition && (
            <button
              onClick={onNavigateTuition}
              className="w-full sm:w-auto py-2.5 px-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Xem Gói Học</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Chỉ Số Trọng Tâm Của Con */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mức Độ Sẵn Sàng Thi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
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
                {Number(readiness.readinessIndex ?? 0).toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{tierInfo.statusText}</p>
          </div>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${tierInfo.badgeCls}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Card 2: Giờ Tự Học Tuần Này */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Giờ Tự Học Tuần Này
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-indigo-600">
                {studyHours.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {recommendedHours} giờ</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Thời lượng bài học & bài tập thực tế</p>
          </div>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${disciplineInfo.cls}`}>
              {disciplineInfo.label}
            </span>
          </div>
        </div>

        {/* Card 3: Chuỗi Ngày Chuyên Cần */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Chuỗi Ngày Chuyên Cần
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-600">
                {discipline.currentStreak ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400">ngày liên tục</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Duy trì nhịp học đều đặn mỗi ngày</p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold bg-slate-50 text-slate-700 border-slate-200">
              {(discipline.currentStreak ?? 0) > 0 ? `Đang duy trì ${discipline.currentStreak} ngày` : 'Chưa có chuỗi ngày'}
            </span>
          </div>
        </div>

        {/* Card 4: Độ Phủ Kiến Thức 4 Phần */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Độ Phủ Kiến Thức ĐGNL
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-100">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-teal-600">
                {Number(readiness.skillCoverageScore ?? 0).toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-slate-400">bao quát</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Bao quát 4 môn thi ĐGNL ĐHQG-HCM</p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold bg-teal-50 text-teal-700 border-teal-200">
              {Number(readiness.skillCoverageScore ?? 0) >= 70 ? 'Nắm chắc kiến thức' : 'Đang mở rộng độ phủ'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: 3 Trụ Cột, AI Khuyến Nghị & Giáo Viên Phụ Trách */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: 3 Trụ Cột & Khuyến Nghị Đồng Hành */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3 Trụ Cột Đánh Giá Mức Độ Sẵn Sàng Đi Thi Của Con */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>3 Trụ Cột Đánh Giá Mức Độ Sẵn Sàng Đi Thi Của Con</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tổng hợp từ năng lực làm đề, độ bao quát kiến thức và kỷ luật tự học giúp gia đình dễ dàng đồng hành cùng con.
              </p>
            </div>

            <div className="space-y-3">
              {/* Factor 1: Năng lực làm đề (50%) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">1</span>
                    <span className="text-xs font-extrabold text-slate-800">Năng lực làm bài &amp; giải đề thi</span>
                    <span className="text-[11px] font-semibold text-slate-400">(Trọng số 50%)</span>
                  </div>
                  <span className="text-sm font-black text-blue-700">{Number(readiness.normalizedThetaScore ?? 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.normalizedThetaScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Đo lường độ chính xác và khả năng xử lý bài thi từ cơ bản đến vận dụng cao.</p>
              </div>

              {/* Factor 2: Độ phủ kiến thức (35%) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">2</span>
                    <span className="text-xs font-extrabold text-slate-800">Độ vững kiến thức các môn thi ĐGNL</span>
                    <span className="text-[11px] font-semibold text-slate-400">(Trọng số 35%)</span>
                  </div>
                  <span className="text-sm font-black text-indigo-700">{Number(readiness.skillCoverageScore ?? 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.skillCoverageScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Bao quát các chuyên đề: Ngôn ngữ, Toán học, Tư duy logic &amp; Giải quyết vấn đề.</p>
              </div>

              {/* Factor 3: Kỷ luật tự học (15%) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">3</span>
                    <span className="text-xs font-extrabold text-slate-800">Kỷ luật &amp; sự đều đặn tự học</span>
                    <span className="text-[11px] font-semibold text-slate-400">(Trọng số 15%)</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{Number(readiness.consistencyScore ?? 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 100</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(readiness.consistencyScore || 0)))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Đánh giá tính kiên trì và thói quen rèn luyện hằng ngày của con trên hệ thống.</p>
              </div>
            </div>
          </div>

          {/* AI Alerts for Parents */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Nhận Định &amp; Khuyến Nghị Đồng Hành Từ AI Sư Phạm</span>
            </h2>

            <div className="space-y-3">
              {(child.aiParentAlerts || []).map((alert, idx) => {
                const isSuccess = String(alert.type || '').toUpperCase() === 'SUCCESS';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSuccess
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90 pl-6">{alert.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Cam Kết Giờ Học & Giáo Viên Phụ Trách */}
        <div className="lg:col-span-5 space-y-6">
          {/* Định Mức Giờ Tự Học */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Cam Kết Giờ Tự Học Tuần (12 giờ/tuần)</span>
            </h2>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-100/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-700">Thời lượng học thực tế:</span>
                <span className="text-lg font-black text-indigo-700">
                  {studyHours.toFixed(1)}h / {recommendedHours}h <span className="text-xs font-extrabold text-indigo-500">({disciplinePct}%)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${disciplinePct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hệ thống chỉ ghi nhận thời gian thực chất khi con xem bài giảng và hoàn thành bài tập rèn luyện (chống treo máy ảo), giúp phụ huynh theo dõi chính xác nỗ lực học tập của con.
              </p>
            </div>
          </div>

          {/* Giáo Viên Phụ Trách & Đặt Lịch Trao Đổi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Giáo Viên Phụ Trách &amp; Cố Vấn Học Vụ</span>
            </h2>

            {/* Khối Thông Tin Giáo Viên */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  {child.assignedTeacherName && !child.assignedTeacherName.includes('Chưa có')
                    ? child.assignedTeacherName.split(' ').slice(-1)[0][0]
                    : 'GV'}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Giáo viên phụ trách lớp Offline
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 truncate">
                    {child.assignedTeacherName || 'Chưa có giáo viên phụ trách'}
                  </div>
                  {child.teacherContactPhone && child.teacherContactPhone !== 'Chưa có' ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      <span>{child.teacherContactPhone}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic pt-0.5">Chưa có số liên hệ</div>
                  )}
                </div>
              </div>

              {child.grade && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Lớp học:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">{child.grade}</span>
                </div>
              )}
            </div>

            {/* Nút Đặt Lịch Trao Đổi */}
            <button
              type="button"
              onClick={() => {
                const hasTeacher =
                  child.assignedTeacherName &&
                  !child.assignedTeacherName.includes('Chưa có') &&
                  child.assignedTeacherName !== 'Chưa phân công';

                if (!hasTeacher) {
                  toast.info('Lớp học của con hiện đang trong quá trình điều phối phân công giáo viên phụ trách.');
                  return;
                }
                const phonePart =
                  child.teacherContactPhone && child.teacherContactPhone !== 'Chưa có'
                    ? ` (${child.teacherContactPhone})`
                    : '';
                toast.success(
                  `Đã gửi yêu cầu kết nối trao đổi học vụ tới ${child.assignedTeacherName}${phonePart}!`
                );
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Đăng Ký Lịch Trao Đổi 1-1 Với Giáo Viên</span>
            </button>
          </div>
        </div>
      </div>
      {/* Early Warnings & Counseling Feed for Guardian */}
      <StudentEarlyWarningsCard studentId={child?.studentId} />

      {/* PayOS Modal */}
      <PayOsCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentData={activePaymentData}
        onPaymentSuccess={() => {
          setPaymentStatus('ACTIVE');
        }}
      />
    </div>
  );
}
