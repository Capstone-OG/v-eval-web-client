import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  QrCode, 
  FileText, 
  Award,
  Zap,
  AlertCircle,
  Network,
  RefreshCw,
  Eye,
  Check,
  Calendar,
  Layers,
  GraduationCap,
  MessageSquare,
  BookOpen,
  Printer,
  X,
  Users
} from 'lucide-react';
import PayOsCheckoutModal from '../modals/PayOsCheckoutModal';
import paymentService from '../../services/paymentService';
import { getPaymentStatusView, refreshPendingPayments, getPaymentContinuation } from '../../utils/paymentStatus';
import { useToast } from '../../context/ToastContext';
import { practiceService } from '../../services/practiceService';
import { userService } from '../../services/userService';
import { tokenStorage } from '../../services/apiClient';
import { setTuitionPaid } from '../curriculum/curriculumAccess';

export default function TuitionPaymentView({ 
  currentUser, 
  onBeforePayment,
  isParent = false,
  activeChild = null,
  childrenList = [],
  onSelectChildId,
  onNavigateLive,
  onNavigateRoadmap, 
  onNavigateAdaptive,
  onNavigateSchedule,
  onNavigateAiTutor,
  showToast 
}) {
  const { toast } = useToast();
  const notifySuccess = useCallback((msg) => {
    if (showToast) showToast(msg);
    else toast?.success?.(msg);
  }, [showToast, toast]);
  const notifyError = useCallback((msg) => {
    if (showToast) showToast(msg);
    else toast?.error?.(msg);
  }, [showToast, toast]);
  const [selectedChild, setSelectedChild] = useState(activeChild || childrenList[0] || null);

  useEffect(() => {
    if (activeChild) setSelectedChild(activeChild);
    else if (childrenList.length > 0 && !selectedChild) setSelectedChild(childrenList[0]);
  }, [activeChild, childrenList]);

  const targetStudentId = isParent
    ? (selectedChild?.studentId || selectedChild?.id || null)
    : (currentUser?.userId || currentUser?.id || currentUser?.studentId || null);

  const studentId = targetStudentId;
  const directCampusId = isParent
    ? (selectedChild?.campusId || currentUser?.campusId || null)
    : (currentUser?.campusId || null);

  const [resolvedCampusId, setResolvedCampusId] = useState(directCampusId);

  useEffect(() => {
    let active = true;
    if (directCampusId) {
      setResolvedCampusId(directCampusId);
      return () => { active = false; };
    }

    // Với Phụ huynh: nếu ChildAnalyticsDto chưa trả campusId (trước khi restart BE), thử trích xuất từ hồ sơ học sinh
    if (isParent && studentId) {
      const uuidMatch = String(selectedChild?.school || '').match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      if (uuidMatch) {
        setResolvedCampusId(uuidMatch[0]);
        return () => { active = false; };
      }

      userService
        .getUsers({ role: 'STUDENT', pageSize: 100 })
        .then((res) => {
          if (!active) return;
          const items = Array.isArray(res) ? res : (res?.items || res?.data || []);
          const found = items.find((u) => (u.userId || u.id) === studentId);
          if (found?.campusId) {
            setResolvedCampusId(found.campusId);
          } else {
            setResolvedCampusId(null);
          }
        })
        .catch(() => {
          if (active) setResolvedCampusId(null);
        });
    } else {
      setResolvedCampusId(null);
    }

    return () => { active = false; };
  }, [directCampusId, isParent, studentId, selectedChild?.school]);

  const studentCampusId = resolvedCampusId;

  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [tuitionStatus, setTuitionStatus] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptView = getPaymentStatusView(selectedReceipt?.status);
  const [resumingOrder, setResumingOrder] = useState(null);
  const resumeBusy = useRef(false);
  const tuitionRequest = useRef(0);
  const [dbCourses, setDbCourses] = useState([]);
  const [activeTerms, setActiveTerms] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const loadCampusTermsAndCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const courseParams = studentCampusId
        ? { campusId: studentCampusId, isActive: true }
        : { isActive: true };
      const termParams = studentCampusId
        ? { campusId: studentCampusId, status: 'ACTIVE' }
        : { status: 'ACTIVE' };

      const [termsRes, coursesRes] = await Promise.all([
        practiceService.getAcademicTerms(termParams).catch(() => []),
        practiceService.getCourses(courseParams).catch(() => [])
      ]);

      const termsArr = Array.isArray(termsRes) ? termsRes : [];
      let coursesArr = Array.isArray(coursesRes) ? coursesRes : [];

      // Nếu tài khoản chưa có campusId hoặc cơ sở chưa tạo khóa riêng, kiểm tra khóa chung đang active
      if (coursesArr.length === 0 && !studentCampusId) {
        const allCourses = await practiceService.getCourses({ isActive: true }).catch(() => []);
        coursesArr = Array.isArray(allCourses) ? allCourses : [];
      }

      setActiveTerms(termsArr);
      setDbCourses(coursesArr);
      if (coursesArr.length > 0) {
        setSelectedPlan((prev) =>
          coursesArr.some((c) => c.courseId === prev) ? prev : coursesArr[0].courseId
        );
      }
    } finally {
      setCoursesLoading(false);
    }
  }, [studentCampusId]);

  useEffect(() => {
    loadCampusTermsAndCourses();
  }, [loadCampusTermsAndCourses]);

  // Chuẩn hóa danh sách Khóa học theo đợt trực tiếp từ Database (Zero Hardcode)
  const resolvedPackages = useMemo(() => {
    const standardFeatures = [
      'Khảo sát chẩn đoán năng lực 30 câu chuẩn hóa 4 miền',
      'Xếp lớp phân tầng 4 Miền × 3 Cấp bậc phù hợp năng lực',
      'Lộ trình học tập thích ứng & Kho bài giảng chuẩn V-ACT',
      'Hỏi gia sư AI khi cần gợi ý cách giải',
      'Thi thử 120 câu chuẩn cấu trúc ĐHQG-HCM & Sổ tay lỗi sai'
    ];

    return dbCourses.map((c, idx) => ({
      id: c.courseId,
      courseId: c.courseId,
      code: c.code,
      name: c.name,
      planType: c.planType || 'STANDARD',
      durationWeeks: c.durationWeeks || 12,
      maxClassSize: c.maxClassSize || 20,
      price: Number(c.tuitionFee || 0),
      totalClassesCount: c.totalClassesCount || 0,
      badge: activeTerms[idx]?.name
        ? `Đợt ${activeTerms[idx].termOrder || idx + 1}`
        : c.code || 'Đang mở đăng ký',
      isPopular: idx === 0,
      highlightColor: idx % 2 === 0 ? 'from-blue-600 to-indigo-600' : 'from-indigo-600 to-purple-600',
      description: `Khóa luyện thi ĐGNL theo đợt tuyển sinh của cơ sở • Trần sĩ số chuẩn tối đa ${c.maxClassSize || 20} học sinh/lớp.`,
      features: standardFeatures
    }));
  }, [dbCourses, activeTerms]);

  // Nạp dữ liệu học phí và lịch sử thanh toán thực tế từ Database Backend
  const loadTuitionAndHistory = useCallback(async () => {
    const request = ++tuitionRequest.current;
    if (!studentId) return;
    setIsSyncing(true);
    try {
      const statusRes = await paymentService.getStudentTuitionStatus(studentId, { throwOnError: true });
      if (request !== tuitionRequest.current) return;
      if (statusRes) {
        setTuitionStatus(statusRes);

        const history = Array.isArray(statusRes.payments) && statusRes.payments.length > 0
          ? statusRes.payments : await paymentService.getStudentPayments(studentId);
        const refreshed = await refreshPendingPayments(history, (orderCode) => paymentService.getPaymentStatus(orderCode), studentId);
        if (request !== tuitionRequest.current) return;
        setTransactionHistory(refreshed);
        setSelectedReceipt((previous) => previous
          ? refreshed.find((item) => previous.paymentId ? item.paymentId === previous.paymentId : String(item.orderCode) === String(previous.orderCode)) || previous
          : null);
        const paid = statusRes.isPaid === true;
        setIsPaid(paid);
        setTuitionPaid(studentId, paid);
      }
    } catch (err) {
      console.warn('[TuitionPaymentView] Không thể đồng bộ trạng thái thanh toán từ server:', err);
    } finally {
      if (request === tuitionRequest.current) setIsSyncing(false);
    }
  }, [studentId]);

  useEffect(() => {
    setIsPaid(false);
    setTuitionStatus(null);
    setTransactionHistory([]);
    setSelectedReceipt(null);
    loadTuitionAndHistory();

    const handleTuitionPaid = (event) => {
      if (!studentId || event.detail?.studentId === studentId) {
        loadTuitionAndHistory();
      }
    };
    window.addEventListener('veval:tuition-paid', handleTuitionPaid);
    return () => {
      tuitionRequest.current++;
      window.removeEventListener('veval:tuition-paid', handleTuitionPaid);
    };
  }, [studentId, loadTuitionAndHistory]);

  const handleCreatePayment = async (pkg) => {
    if (!studentId) { notifyError('Chưa xác định được tài khoản học sinh để thanh toán.'); return; }
    if (isLoading || resumeBusy.current || onBeforePayment?.() === false) return;
    setIsLoading(true);
    try {
      const parentId = isParent ? (currentUser?.id || currentUser?.userId) : studentId;
      
      const payload = {
        studentId,
        parentId,
        courseId: pkg.courseId,
        returnUrl: window.location.origin + '/payment/success',
        cancelUrl: window.location.origin + '/payment/cancel'
      };

      const result = await paymentService.createPaymentLink(payload);

      setActivePaymentData({
        orderCode: result.orderCode,
        checkoutUrl: result.checkoutUrl,
        amount: result.amount ?? pkg.price,
        courseName: pkg.name,
        studentName: isParent
          ? (selectedChild?.studentName || 'Học viên')
          : (currentUser?.fullName || 'Học viên V-Eval'),
        durationWeeks: pkg.durationWeeks
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error('Error creating payment link:', err);
      const errMsg = err?.data?.detail || err?.data?.message || err?.message || 'Không thể tạo link PayOS. Vui lòng thử lại!';
      notifyError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumePayment = async (transaction) => {
    if (resumeBusy.current || isLoading) return;
    if (onBeforePayment?.() === false) { setSelectedReceipt(null); return; }
    resumeBusy.current = true;
    setResumingOrder(transaction.orderCode);
    try {
      const latest = await paymentService.getPaymentStatus(transaction.orderCode);
      const signedIn = tokenStorage.getUser();
      if ((signedIn?.userId || signedIn?.id || signedIn?.studentId) !== (currentUser?.userId || currentUser?.id || currentUser?.studentId)) return;
      const result = getPaymentContinuation(transaction, latest, studentId);
      const matches = (item) => transaction.paymentId ? item.paymentId === transaction.paymentId : String(item.orderCode) === String(transaction.orderCode);
      setTransactionHistory((items) => items.map((item) => matches(item) ? result.payment : item));
      setSelectedReceipt((previous) => previous && matches(previous) ? result.payment : previous);
      if (result.kind === 'success') {
        await handlePaymentSuccess(result.payment);
      } else if (result.kind === 'unavailable') {
        if (getPaymentStatusView(result.payment.status).kind === 'failed') toast.error(result.message);
        else toast.warning(result.message);
      } else {
        setSelectedReceipt(null);
        setActivePaymentData({
          orderCode: result.payment.orderCode,
          checkoutUrl: result.payment.checkoutUrl,
          amount: result.payment.amount,
          courseName: result.payment.courseName,
          studentName: currentUser?.fullName || 'Học viên V-Eval',
          durationWeeks: resolvedPackages.find((plan) => plan.courseId === result.payment.courseId)?.durationWeeks
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error(error.message || 'Chưa thể tiếp tục thanh toán. Vui lòng thử lại.');
    } finally {
      resumeBusy.current = false;
      setResumingOrder(null);
    }
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    toast.success('Thanh toán thành công! Học phí của bạn đã được xác nhận.');

    // Nạp lại dữ liệu thực tế từ database
    await loadTuitionAndHistory();

  };

  const handlePaymentFailure = (paymentInfo) => {
    const view = getPaymentStatusView(paymentInfo.status);
    if (view.kind === 'failed') toast.error('Thanh toán không thành công. Vui lòng kiểm tra lại hoặc tạo thanh toán mới.');
    else toast.warning(view.title + '. Bạn có thể tạo thanh toán mới tại trang học phí.');
    setTransactionHistory((items) => items.map((item) => String(item.orderCode) === String(paymentInfo.orderCode) ? { ...item, ...paymentInfo } : item));
    void loadTuitionAndHistory();
  };

  // 6 Quyền lợi & Phân hệ được mở khóa hoàn toàn
  const unlockedPerks = [
    {
      id: 'roadmap',
      title: 'Lộ Trình Cá Nhân Thích Ứng',
      desc: 'Mở khóa 100% các chặng học theo năng lực thực tế, phân bổ dạng bài theo điểm thi đầu vào.',
      icon: Network,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      action: isParent ? undefined : onNavigateRoadmap,
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Vào Lộ Trình'
    },
    {
      id: 'curriculum',
      title: 'Bài Giảng Chuyên Đề & Video Độc Quyền',
      desc: 'Toàn quyền học chi tiết tất cả bài giảng của Lớp học chung & Lộ trình cá nhân riêng.',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      action: isParent ? undefined : onNavigateRoadmap,
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Xem Bài Học'
    },
    {
      id: 'adaptive',
      title: 'Kho Luyện Tập Thích Ứng Cá Nhân Hóa',
      desc: 'Hệ thống sinh câu hỏi tự động bám sát năng lực học sinh và cập nhật độ tiến bộ liên tục.',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      action: isParent ? undefined : (onNavigateAdaptive || onNavigateRoadmap),
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Luyện Tập'
    },
    {
      id: 'ai_tutor',
      title: 'Gia Sư AI Đồng Hành Kèm 24/7',
      desc: 'Gia sư AI gợi ý từng bước khi con gặp bài khó.',
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      action: isParent ? undefined : onNavigateAiTutor,
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Hỏi Gia Sư AI'
    },
    {
      id: 'schedule',
      title: 'Thời Khóa Biểu & Điểm Danh Cá Nhân',
      desc: 'Tra cứu lịch học định kỳ, các buổi học bù/dạy thay và theo dõi chuyên cần tại cơ sở.',
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      action: isParent ? undefined : onNavigateSchedule,
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Xem Lịch Học'
    },
    {
      id: 'live',
      title: 'Lớp Học Phần & Trao Đổi Cùng Giáo Viên',
      desc: 'Không gian học tập nhóm nhỏ tại bàn kèm trực tiếp cùng Giảng viên phụ trách cơ sở.',
      icon: Users,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      action: isParent ? undefined : onNavigateLive,
      actionLabel: isParent ? 'Đã Mở Khóa' : 'Vào Lớp Học'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in w-full pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phân Hệ Học Phí & Đăng Ký Khóa Học (PayOS / VietQR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nộp Học Phí & Kích Hoạt Lộ Trình
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Quét mã QR để thanh toán qua PayOS. Khóa học được mở sau khi thanh toán được xác nhận.
          </p>
          {isParent && childrenList.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-white/10">
              <span className="text-xs text-slate-300 font-bold">Chọn con để nộp học phí:</span>
              {childrenList.map((c, idx) => {
                const cId = c.studentId || c.id;
                const isCur = (selectedChild?.studentId || selectedChild?.id) === cId;
                return (
                  <button
                    key={cId || idx}
                    type="button"
                    onClick={() => {
                      setSelectedChild(c);
                      if (cId) onSelectChildId?.(cId);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isCur
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {c.studentName || `Con ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              loadTuitionAndHistory();
              loadCampusTermsAndCourses();
            }}
            disabled={isSyncing || coursesLoading}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-300' : 'text-slate-300'}`} />
            <span>{isSyncing ? 'Đang làm mới...' : 'Làm mới'}</span>
          </button>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-xs text-white space-y-1 shrink-0">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Thanh toán qua PayOS</span>
            </div>
            <div className="text-blue-100/90 text-[11px]">
              Tự động mở khóa khi thanh toán thành công
            </div>
          </div>
        </div>
      </div>

      {/* Tuition Active Status Card & Quick Navigation */}
      <div className={`p-5 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isPaid 
          ? 'bg-linear-to-r from-emerald-50 via-teal-50 to-white border-emerald-200 text-emerald-950' 
          : 'bg-linear-to-r from-amber-50 via-orange-50 to-white border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase">
                {isPaid ? 'Trạng Thái Khóa Học: Đã Kích Hoạt (Đã Đóng Học Phí)' : 'Cần kích hoạt khóa học để xem nội dung'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                isPaid ? 'bg-emerald-200 text-emerald-900 border-emerald-300' : 'bg-amber-200 text-amber-900 border-amber-300'
              }`}>
                {isPaid ? 'Toàn Quyền Truy Cập' : 'Cần Kích Hoạt'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl font-medium">
              {isPaid 
                ? 'Tài khoản của bạn đã được mở khóa toàn bộ bài giảng chi tiết, video lý thuyết và bài tập củng cố của Lớp học chung & Lộ trình cá nhân.' 
                : 'Chọn gói học phù hợp bên dưới và hoàn tất thanh toán để mở khóa bài giảng, bài tập và lộ trình học cá nhân.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {onNavigateRoadmap && isPaid && (
            <button
              type="button"
              onClick={onNavigateRoadmap}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span>Đến Lộ Trình Học Tập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* NẾU ĐÃ THANH TOÁN: Hiển thị Thẻ Gói Đang Kích Hoạt & 6 Phân Hệ Đã Mở Khóa */}
      {(
        <div className="space-y-6">
          {/* Active Course Card */}
          {isPaid && <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gói Đào Tạo Đang Kích Hoạt</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                    Mã: {tuitionStatus?.courseCode || 'CRS_STD'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {tuitionStatus?.courseName || 'Khóa Luyện Thi Chuẩn (Standard Adaptive)'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                    <span className="text-slate-300 text-[11px] block">Thời Hạn Khóa Học</span>
                    <span className="text-sm font-extrabold text-emerald-300 mt-0.5 block">
                      {tuitionStatus?.durationWeeks || 12} tuần học tập
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">
                      {tuitionStatus?.startDate ? `Từ ${tuitionStatus.startDate}` : 'Bắt đầu ngay'} {tuitionStatus?.endDate ? `đến ${tuitionStatus.endDate}` : ''}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                    <span className="text-slate-300 text-[11px] block">Lớp Học Phần Phân Bổ</span>
                    <span className="text-sm font-extrabold text-cyan-300 mt-0.5 block truncate">
                      {tuitionStatus?.assignedClassName || 'Lớp Chuyên Đề ĐGNL 2026 - Chuẩn Đầu Ra'}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-0.5">
                      Tự động phân cụm K-Means cơ sở
                    </span>
                  </div>

                </div>
              </div>

              {onNavigateRoadmap && (
                <div className="shrink-0 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={onNavigateRoadmap}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <span>Vào Học Lộ Trình Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-center text-[11px] text-emerald-200/80">
                    Chặng 1 đã mở khóa sẵn sàng
                  </span>
                </div>
              )}
            </div>
          </div>

          }
          {/* Membership benefits remain visible before payment. */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Đặc Quyền Hội Viên V-Eval</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {unlockedPerks.length} Phân Hệ & Quyền Lợi {isPaid ? 'Đã Được Mở Khóa' : 'Hội Viên'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isPaid ? 'Tất cả tính năng đã sẵn sàng' : 'Thanh toán để mở khóa'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedPerks.map((perk) => {
                const IconComponent = perk.icon;
                return (
                  <div 
                    key={perk.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs ${perk.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isPaid ? 'text-emerald-700 bg-emerald-100/80' : 'text-amber-700 bg-amber-100/80'}`}>
                          {isPaid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{isPaid ? 'Đã Mở' : 'Cần kích hoạt'}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {perk.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>

                    {isPaid && perk.action && (
                      <button
                        type="button"
                        onClick={perk.action}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>{perk.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Academic Terms & Courses Grid (Đồng bộ trực tiếp từ AcademicTerms & Courses của cơ sở) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isPaid ? 'Đăng Ký Khóa Học Đợt Tiếp Theo' : 'Đăng Ký Khóa Học Theo Đợt Tuyển Sinh'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Danh sách đợt học (Đợt 1 &amp; Đợt 2 trong năm) và mức học phí chính thức tại cơ sở theo học.
          </p>
        </div>

        {/* Active Academic Term Banner */}
        {activeTerms.length > 0 && (
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                  Đợt Tuyển Sinh Đang Mở ({activeTerms.length} đợt)
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {activeTerms.map((t) => `${t.name} (${t.startDate} → ${t.endDate})`).join(' • ')}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
              Đang nhận đăng ký
            </span>
          </div>
        )}

        {coursesLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500 animate-pulse">
            Đang tải danh sách đợt học và khóa học của cơ sở...
          </div>
        ) : resolvedPackages.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Cơ sở hiện chưa mở khóa học nào cho đợt tuyển sinh này
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vui lòng liên hệ Quản lý cơ sở để biết lịch khai giảng Đợt 1 / Đợt 2 tiếp theo.
            </p>
          </div>
        ) : (
        <div
          className={`grid grid-cols-1 gap-6 ${
            resolvedPackages.length === 1
              ? 'max-w-lg mx-auto'
              : resolvedPackages.length === 2
                ? 'md:grid-cols-2 max-w-4xl mx-auto'
                : 'md:grid-cols-3'
          }`}
        >
          {resolvedPackages.map((pkg) => {
            const isSelected = selectedPlan === pkg.id;
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(pkg.price);

            return (
              <div 
                key={pkg.id}
                onClick={() => setSelectedPlan(pkg.id)}
                className={`rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between relative cursor-pointer ${
                  pkg.isPopular 
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]' 
                    : 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Popular Badge */}
                {pkg.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm bg-gradient-to-r ${pkg.highlightColor}`}>
                    {pkg.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {pkg.durationWeeks} tuần
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quyền lợi học tập:
                    </div>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreatePayment(pkg);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      pkg.isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isPaid ? 'Đăng Ký Khóa Này Qua PayOS' : 'Nộp Học Phí Qua PayOS'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Transaction History Section (Lấy trực tiếp từ Database) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Lịch Sử Đăng Ký & Hóa Đơn Điện Tử Thực Tế
              </h3>
              <p className="text-xs text-slate-500">
                Được truy xuất trực tiếp từ cơ sở dữ liệu và xác thực cổng PayOS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadTuitionAndHistory}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Tải lại lịch sử</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Mã Đơn Hàng</th>
                <th className="py-3 px-4">Khóa Học</th>
                <th className="py-3 px-4">Số Tiền</th>
                <th className="py-3 px-4">Kênh Thanh Toán</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx, idx) => {
                  const orderCodeDisplay = tx.orderCode ? `#${tx.orderCode}` : (tx.paymentId ? `#${tx.paymentId.slice(0, 8)}` : `#${idx + 1}`);
                  const statusView = getPaymentStatusView(tx.status);
                  const formattedAmount = tx.amount === 0 
                    ? 'Miễn phí' 
                    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount);
                  const formattedDate = tx.paidAt 
                    ? new Date(tx.paidAt).toLocaleString('vi-VN') 
                    : (tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong');

                  return (
                    <tr key={tx.paymentId || tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {orderCodeDisplay}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tx.courseName || 'Khóa Luyện Thi Chuẩn (Standard Adaptive)'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formattedAmount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {tx.counterAccountBankName || tx.method || 'PAYOS VIETQR'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusView.tone}`}>
                          {statusView.success ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{statusView.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {statusView.kind === 'pending' && tx.orderCode && (
                          <button type="button" onClick={() => handleResumePayment(tx)} disabled={resumingOrder !== null || isLoading}
                            className="mr-2 my-1 inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-wait">
                            <CreditCard className="h-3 w-3" />{resumingOrder === tx.orderCode ? 'Đang kiểm tra…' : 'Tiếp tục thanh toán'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-xs text-slate-500 font-medium">
                    {isSyncing ? 'Đang làm mới lịch sử giao dịch...' : 'Chưa có giao dịch học phí nào được ghi nhận trên hệ thống PayOS cho tài khoản này.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PayOS Checkout Modal */}
      <PayOsCheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentData={activePaymentData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        onNavigateRoadmap={onNavigateRoadmap}
      />

      {/* Modal Chi Tiết Biên Lai / Kiểm Toán Giao Dịch */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-cyan-300" />
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-300">
                  Biên Lai Thu Học Phí Điện Tử
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                V-Eval Educational System
              </h3>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Mã đơn hàng: #{selectedReceipt.orderCode || selectedReceipt.paymentId?.slice(0, 8)}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${receiptView.tone}`}>
                <div>
                  <span className="text-[11px] font-bold uppercase block">Trạng Thái Giao Dịch</span>
                  <span className="text-sm font-black block mt-0.5">{receiptView.title}</span>
                </div>
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center ${receiptView.iconTone}`}>
                  {receiptView.success ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-slate-100">
                <div className="pt-2 flex justify-between text-slate-600">
                  <span className="font-medium">Khóa học / Gói:</span>
                  <span className="font-extrabold text-slate-900 text-right">
                    {selectedReceipt.courseName || 'Khóa Luyện Thi Chuẩn (Standard Adaptive)'}
                  </span>
                </div>

                <div className="pt-2.5 flex justify-between text-slate-600">
                  <span className="font-medium">{receiptView.success ? 'Số tiền đã nộp:' : 'Số tiền giao dịch:'}</span>
                  <span className="font-black text-blue-600 text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedReceipt.amount || 0)}
                  </span>
                </div>

                <div className="pt-2.5 flex justify-between text-slate-600">
                  <span className="font-medium">Kênh thanh toán:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReceipt.counterAccountBankName || selectedReceipt.method || 'PayOS VietQR'}
                  </span>
                </div>

                {selectedReceipt.counterAccountName && (
                  <div className="pt-2.5 flex justify-between text-slate-600">
                    <span className="font-medium">Người nộp:</span>
                    <span className="font-bold text-slate-800">
                      {selectedReceipt.counterAccountName}
                    </span>
                  </div>
                )}

                {selectedReceipt.transactionRef && (
                  <div className="pt-2.5 flex justify-between text-slate-600">
                    <span className="font-medium">Mã tham chiếu ngân hàng:</span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {selectedReceipt.transactionRef}
                    </span>
                  </div>
                )}

                <div className="pt-2.5 flex justify-between text-slate-600">
                  <span className="font-medium">Thời gian ghi nhận:</span>
                  <span className="text-slate-800">
                    {selectedReceipt.paidAt ? new Date(selectedReceipt.paidAt).toLocaleString('vi-VN') : 'Chưa có thời gian xác nhận'}
                  </span>
                </div>

                <div className="pt-2.5 flex justify-between text-slate-600">
                  <span className="font-medium">Trạng thái ghi nhận:</span>
                  <span className="font-bold">
                    <span>{receiptView.label}</span>
                  </span>
                </div>
              </div>

              {receiptView.kind === 'pending' && selectedReceipt.orderCode && (
                <button type="button" onClick={() => handleResumePayment(selectedReceipt)} disabled={resumingOrder !== null || isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-wait">
                  <CreditCard className="h-4 w-4" />{resumingOrder === selectedReceipt.orderCode ? 'Đang kiểm tra…' : 'Tiếp tục thanh toán'}
                </button>
              )}
              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Biên Lai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
