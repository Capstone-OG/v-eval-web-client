import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
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
import { toast } from '../../context/ToastContext';
import PayOsCheckoutModal from '../modals/PayOsCheckoutModal';
import paymentService from '../../services/paymentService';

const TIER_MAP = {
  READY: {
    label: 'Sẵn sàng chinh phục nguyện vọng',
    badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    scoreCls: 'text-emerald-600'
  },
  NEAR_READY: {
    label: 'Tiệm cận ngưỡng an toàn',
    badgeCls: 'bg-amber-100 text-amber-800 border-amber-200',
    scoreCls: 'text-amber-600'
  },
  AT_RISK: {
    label: 'Cần tăng cường kèm cặp ngay',
    badgeCls: 'bg-rose-100 text-rose-800 border-rose-200',
    scoreCls: 'text-rose-600'
  }
};

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
          Đang đồng bộ Cổng Phụ Huynh Đồng Hành (Core Flow 5)...
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
              <span>Cổng Phụ Huynh Đồng Hành • Core Flow 5</span>
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Xin chào {currentUser?.fullName || currentUser?.email || 'Quý Phụ huynh'}
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
  const tierInfo = TIER_MAP[readiness.readinessTier] || TIER_MAP.READY;
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-800/60 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Core Flow 5 • Parent Companion Portal
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                portalData?._source === 'backend'
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400/30 text-amber-200'
              }`}
            >
              {portalData?._source === 'backend' ? '● Live Identity + Practice gRPC' : '● Dữ liệu chuẩn Seed CSDL'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đồng Hành Cùng Con: {child.studentName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/85 max-w-2xl leading-relaxed">
            Báo cáo minh bạch Chỉ số Sẵn sàng Thi (<code className="text-cyan-300 font-bold">R_exam</code>), kỷ luật tự học xác thực 12 giờ/tuần và các thông điệp đồng hành tâm lý từ Hệ thống Sư phạm V-Eval.
          </p>

          {children.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {children.map((c, idx) => (
                <button
                  key={c.studentId || idx}
                  onClick={() => setSelectedChildIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
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

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-white space-y-1">
            <div className="text-cyan-300 font-bold">Giáo viên phụ trách lớp Offline:</div>
            <div className="font-extrabold text-sm">{child.assignedTeacherName}</div>
            <div className="flex items-center gap-1.5 text-blue-200 text-[11px] pt-0.5">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              <span>Điện thoại: {child.teacherContactPhone}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLinkPanel((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showLinkPanel ? 'Đóng khung liên kết' : '+ Liên kết thêm con'}</span>
            </button>

            <button
              onClick={() => loadParentPortal(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Cập nhật báo cáo mới nhất</span>
            </button>
          </div>
        </div>
      </div>

      {showLinkPanel && renderStudentLinkingCenter()}

      {/* Tuition Fee & Course Activation Banner for Parents */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg border border-blue-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-300" />
              <span>Cổng PayOS VietQR</span>
            </span>
            <span className="text-xs font-bold text-blue-100">Khóa Học: Standard Adaptive (12 Tuần)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {paymentStatus === 'ACTIVE' 
              ? 'Học Phí Khóa Học: ĐÃ THANH TOÁN (Lộ Trình Đang Kích Hoạt)' 
              : 'Nộp Học Phí Để Mở Khóa Chu Trình Học Thích Ứng PLAR Cho Con'}
          </h2>
          <p className="text-xs text-blue-100/90 max-w-xl">
            {paymentStatus === 'ACTIVE'
              ? 'Con bạn đã được cấp quyền truy cập toàn bộ 4 chặng học PLAR, làm bài Quiz và nhận gia sư AI kèm 24/7.'
              : 'Học phí: 5.000 ₫ (Giá thử nghiệm PayOS) • Hỗ trợ quét mã VietQR tự động kích hoạt tức thì sau 3 giây.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {paymentStatus !== 'ACTIVE' ? (
            <button
              onClick={handleQuickPay}
              className="w-full sm:w-auto py-2.5 px-5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Nộp Học Phí Ngay (PayOS)</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã Kích Hoạt Thành Công</span>
            </span>
          )}

          {onNavigateTuition && (
            <button
              onClick={onNavigateTuition}
              className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Xem Các Gói Học</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Composite Exam Readiness Index R_exam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chỉ số Sẵn sàng Thi (R_exam)
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-3xl font-black ${tierInfo.scoreCls}`}>
            {Number(readiness.readinessIndex ?? 0).toFixed(1)}
            <span className="text-sm font-bold text-slate-400"> / 100</span>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold ${tierInfo.badgeCls}`}>
            {tierInfo.label}
          </span>
        </div>

        {/* Card 2: Weekly Verified Study Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Giờ tự học tuần này
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {studyHours.toFixed(1)}
            <span className="text-sm font-bold text-slate-400"> / {recommendedHours}h</span>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold ${disciplineInfo.cls}`}>
            {disciplineInfo.label}
          </span>
        </div>

        {/* Card 3: Consecutive Study Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chuỗi ngày chuyên cần
            </span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-600">
            {discipline.currentStreak ?? 0} <span className="text-sm font-bold text-slate-400">ngày</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            Duy trì đều đặn mỗi ngày trên hệ thống
          </div>
        </div>

        {/* Card 4: Skill Coverage Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Độ phủ kỹ năng nền tảng
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">
            {Number(readiness.skillCoverageScore ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            Trung bình xác suất làm chủ BKT 4 miền
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: R_exam 3-Factor Breakdown + AI Parent Alerts & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: R_exam Formula Breakdown & AI Parent Alerts */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3-Factor Exam Readiness Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Cấu Thành Chỉ Số Sẵn Sàng Thi (R_exam = 50% Năng lực + 35% Độ phủ + 15% Chuyên cần)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chuyển hóa số liệu đo lường tâm trắc học IRT & BKT thành 3 trụ cột dễ theo dõi cho gia đình
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Factor 1: Normalized Theta (50%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">1. Năng lực giải đề chuẩn hóa (Trọng số 50%)</span>
                  <span className="text-blue-700 font-black">{Number(readiness.normalizedThetaScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.normalizedThetaScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Factor 2: Skill Coverage BKT (35%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">2. Độ bao phủ kiến thức 4 miền ĐGNL (Trọng số 35%)</span>
                  <span className="text-indigo-700 font-black">{Number(readiness.skillCoverageScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.skillCoverageScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Factor 3: Consistency Score (15%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">3. Kỷ luật & sự đều đặn tự học 7 ngày (Trọng số 15%)</span>
                  <span className="text-emerald-700 font-black">{Number(readiness.consistencyScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.consistencyScore || 0))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Alerts for Parents */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Nhận Định & Khuyến Nghị Đồng Hành Từ AI Sư Phạm</span>
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

        {/* Right 5 cols: Weekly Discipline Progress & Child Academic Profile */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly 12h Baseline Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Cam Kết Kỷ Luật Tự Học Tuần ({recommendedHours} giờ/tuần)</span>
            </h2>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-indigo-950">Thời lượng học xác thực:</span>
                <span className="text-lg font-black text-indigo-700">
                  {studyHours.toFixed(1)}h / {recommendedHours}h ({disciplinePct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white border border-indigo-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${disciplinePct}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                Hệ thống chỉ tính giờ học thực chất khi con xem video bài giảng (≥ 80% thời lượng) và làm bài luyện tập thích ứng ZPD, chống treo máy ảo.
              </p>
            </div>
          </div>

          {/* Child Academic Profile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Hồ Sơ Học Viên & Kênh Trao Đổi Giáo Viên</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Họ tên học viên:</span>
                <span className="font-extrabold text-slate-800">{child.studentName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Khối lớp:</span>
                <span className="font-extrabold text-slate-800">{child.grade}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Trường THPT:</span>
                <span className="font-extrabold text-slate-800 text-right">{child.school}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Ngành mục tiêu NV1:</span>
                <span className="font-extrabold text-blue-700 text-right">{child.targetMajor}</span>
              </div>
            </div>

            <button
              onClick={() =>
                toast.success(
                  `Đã gửi yêu cầu kết nối trao đổi học vụ tới ${child.assignedTeacherName} (${child.teacherContactPhone})!`
                )
              }
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Đăng Ký Lịch Trao Đổi 1-1 Cùng Giáo Viên Phụ Trách</span>
            </button>
          </div>
        </div>
      </div>
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
