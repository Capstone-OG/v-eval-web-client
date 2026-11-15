import React, { useState } from 'react';
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
  Users,
  AlertCircle,
  Network
} from 'lucide-react';
import PayOsCheckoutModal from '../modals/PayOsCheckoutModal';
import paymentService from '../../services/paymentService';
import { isTuitionPaid, setTuitionPaid } from '../curriculum/curriculumAccess';

export default function TuitionPaymentView({ currentUser, onNavigateRoadmap, showToast }) {
  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId || 's1111111-1111-1111-1111-111111111111';
  const [selectedPlan, setSelectedPlan] = useState('STANDARD');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState(null);
  const [isPaid, setIsPaid] = useState(() => isTuitionPaid(studentId));

  React.useEffect(() => {
    setIsPaid(isTuitionPaid(studentId));
    const handleTuitionPaid = (event) => {
      if (!studentId || event.detail?.studentId === studentId) {
        setIsPaid(isTuitionPaid(studentId));
      }
    };
    window.addEventListener('veval:tuition-paid', handleTuitionPaid);
    return () => window.removeEventListener('veval:tuition-paid', handleTuitionPaid);
  }, [studentId]);

  const handleToggleTestPayment = () => {
    const nextState = !isPaid;
    setTuitionPaid(studentId, nextState);
    setIsPaid(nextState);
    if (showToast) {
      showToast(nextState ? 'Đã kích hoạt học phí (Môi trường Test)!' : 'Đã hoàn tác trạng thái học phí.');
    }
  };

  // Danh mục 3 gói đào tạo thích ứng ĐGNL
  const coursePackages = [
    {
      id: 'FAST_TRACK',
      courseId: 'c1111111-1111-1111-1111-111111111111',
      code: 'CRS_SPRINT',
      name: 'Khóa Cấp Tốc Về Đích (Sprint)',
      planType: 'FAST_TRACK',
      durationWeeks: 8,
      price: 2000,
      badge: 'Test PayOS (2K)',
      highlightColor: 'from-amber-500 to-orange-600',
      description: 'Dành cho học sinh cần tổng ôn bấm giờ thực chiến và vá lỗ hổng kiến thức thần tốc trong 2 tháng cuối.',
      features: [
        'Khảo sát chẩn đoán IRT 30 câu chuẩn Bloom',
        '8 tuần luyện đề thực chiến có bấm giờ',
        'Sổ tay lỗi sai & Lặp lại ngắt quãng SM-2',
        'Hỏi đáp Gia sư AI Socratic cơ bản'
      ]
    },
    {
      id: 'STANDARD',
      courseId: 'c2222222-2222-2222-2222-222222222222',
      code: 'CRS_STD',
      name: 'Khóa Luyện Thi Chuẩn (Standard Adaptive)',
      planType: 'STANDARD',
      durationWeeks: 12,
      price: 5000,
      badge: 'Phổ Biến (5K Test)',
      isPopular: true,
      highlightColor: 'from-blue-600 to-indigo-600',
      description: 'Lộ trình cá nhân hóa toàn diện theo chu trình 4 bước PLAR, tối ưu hóa điểm số cho mục tiêu 800+ ĐGNL.',
      features: [
        'Toàn bộ quyền lợi gói Fast-Track',
        'Lộ trình thích ứng 4 bước PLAR (P-L-A-R)',
        'Gia sư AI Socratic thông minh kèm 24/7',
        'Tự động xếp lớp chuyên đề tại cơ sở',
        'Cam kết điểm số chuẩn đầu ra ĐHQG'
      ]
    },
    {
      id: 'INTENSIVE_PLUS',
      courseId: 'c3333333-3333-3333-3333-333333333333',
      code: 'CRS_PRO',
      name: 'Khóa Chuyên Đề Bứt Phá (Intensive Plus)',
      planType: 'INTENSIVE',
      durationWeeks: 16,
      price: 10000,
      badge: 'Top 10% (10K Test)',
      highlightColor: 'from-indigo-600 to-purple-600',
      description: 'Khóa học kèm vi mô 3-5 bạn cùng Toa thuốc bù điểm Knapsack ROI và Hệ thống cảnh báo sớm 3 cấp.',
      features: [
        'Toàn bộ quyền lợi gói Standard',
        'Nhóm học tập vi mô (3 - 5 học sinh) trên lớp',
        'Dự báo khoảng điểm SEM 95% & Toa thuốc Knapsack',
        'Giám sát webcam & thi thử 120 câu chuẩn ĐHQG',
        'Hỗ trợ 1-1 cùng Giáo viên & Mentor cơ sở'
      ]
    }
  ];

  // Lịch sử giao dịch thực tế từ cổng PayOS Backend
  const [transactionHistory, setTransactionHistory] = useState([]);

  const handleCreatePayment = async (pkg) => {
    setIsLoading(true);
    try {
      const studentId = currentUser?.id || 's1111111-1111-1111-1111-111111111111';
      const parentId = currentUser?.role === 'parent' ? currentUser.id : studentId;
      
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
        amount: pkg.price,
        courseName: pkg.name,
        studentName: currentUser?.fullName || 'Học viên V-Eval',
        durationWeeks: pkg.durationWeeks
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error('Error creating payment link:', err);
      if (showToast) showToast('Không thể tạo link PayOS. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentInfo) => {
    setTuitionPaid(studentId, true);
    setIsPaid(true);

    setTransactionHistory(prev => [
      {
        id: `TX-${Date.now().toString().slice(-4)}`,
        orderCode: paymentInfo.orderCode,
        courseName: activePaymentData?.courseName || 'Khóa Luyện Thi ĐGNL',
        amount: activePaymentData?.amount || 2500000,
        paidAt: new Date().toLocaleDateString('vi-VN'),
        method: 'PAYOS VIETQR',
        status: 'SUCCESS'
      },
      ...prev
    ]);

    if (showToast) {
      showToast('Kích hoạt khóa học & mở khóa Lộ trình PLAR thành công!');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phân Hệ Học Phí & Đăng Ký Khóa Học (PayOS / VietQR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nộp Học Phí & Kích Hoạt Lộ Trình Thích Ứng PLAR
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Tích hợp Cổng thanh toán trực tuyến PayOS: Quét mã VietQR tiện lợi, xử lý giao dịch nguyên khối (ACID Transaction) và tự động mở khóa chặng học đầu tiên tức thì.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-xs text-white space-y-1.5 shrink-0">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Thanh toán bảo mật chuẩn NAPAS</span>
          </div>
          <div className="text-blue-100/90 text-[11px]">
            Tự động kích hoạt sau 1-3 giây quét mã
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
                {isPaid ? 'Trạng Thái Khóa Học: Đã Kích Hoạt (Đã Đóng Học Phí)' : 'Trạng Thái Khóa Học: Chế Độ Xem Lộ Trình Tổng Quát'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                isPaid ? 'bg-emerald-200 text-emerald-900 border-emerald-300' : 'bg-amber-200 text-amber-900 border-amber-300'
              }`}>
                {isPaid ? 'Toàn Quyền Truy Cập' : 'Cần Kích Hoạt'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl font-medium">
              {isPaid 
                ? 'Tài khoản của bạn đã được mở khóa toàn bộ bài giảng chi tiết, video lý thuyết và bài tập củng cố của Lớp học chung & Lộ trình cá nhân.' 
                : 'Bạn đang xem lộ trình dạng tổng quát sau khi hoàn thành bài thi. Hãy chọn gói học bên dưới và thanh toán để vào học ngay.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {onNavigateRoadmap && (
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

          <button
            type="button"
            onClick={handleToggleTestPayment}
            title="Chuyển đổi trạng thái đóng học phí để kiểm thử nghiệm thu"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
          >
            {isPaid ? 'Hủy kích hoạt (Test)' : '⚡ Kích hoạt nhanh (Test)'}
          </button>
        </div>
      </div>

      {/* 3 Course Packages Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Chọn Gói Đào Tạo Thích Ứng ĐGNL
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Các gói học được thiết kế bám sát năng lực thực tế, tự động phân cụm lớp học và tối ưu điểm số.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coursePackages.map((pkg) => {
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
                    <span>Nộp Học Phí Qua PayOS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Lịch Sử Đăng Ký & Giao Dịch Học Phí
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ dữ liệu được đối soát và ghi vết kiểm toán (Audit Log) minh bạch
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Mã Giao Dịch</th>
                <th className="py-3 px-4">Khóa Học</th>
                <th className="py-3 px-4">Số Tiền</th>
                <th className="py-3 px-4">Phương Thức</th>
                <th className="py-3 px-4">Ngày Thanh Toán</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      #{tx.orderCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {tx.courseName}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {tx.amount === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {tx.method}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {tx.paidAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ĐÃ HOÀN TẤT</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-xs text-slate-500 font-medium">
                    Chưa có giao dịch học phí nào được ghi nhận trên hệ thống PayOS cho tài khoản này.
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
      />

    </div>
  );
}

