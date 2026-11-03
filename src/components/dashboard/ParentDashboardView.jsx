import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BookOpenCheck, 
  GraduationCap, 
  PhoneCall, 
  Sparkles, 
  Calendar, 
  ChevronRight,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { mockUser } from '../../data/mockData';
import PayOsCheckoutModal from '../modals/PayOsCheckoutModal';
import paymentService from '../../services/paymentService';

export default function ParentDashboardView({ onNavigateTuition }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('UNPAID'); // UNPAID | ACTIVE

  const childInfo = {
    name: 'Phạm Minh Hoàng',
    grade: 'Lớp 12 - Chuyên Lý',
    school: 'THPT Chuyên Năng Khiếu ĐHQG TP.HCM',
    campus: 'Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)',
    targetMajor: 'Khoa học Máy tính - ĐH Bách Khoa ĐHQG TP.HCM',
    targetScore: 850,
    currentEstimatedScore: 785,
    irtTheta: '+0.65',
    admissionProb: 82,
    studyHoursThisWeek: 14.5,
    streak: 12
  };

  const aiParentAlerts = [
    {
      id: 'AL-01',
      type: 'success',
      title: 'Tiến bộ vượt trội môn Tư duy Logic',
      desc: 'Hoàng đã hoàn thành 8/10 câu hỏi ZPD độ khó cao với độ chuẩn xác 92%. Năng lực ước lượng tăng +0.15 Theta.'
    },
    {
      id: 'AL-02',
      type: 'warning',
      title: 'Cần chú ý kỹ năng: Đọc hiểu văn bản Hóa học - Sinh học',
      desc: 'Thời gian làm bài chuyên đề này vượt mức khuyến nghị 3 phút/câu. Hệ thống gợi ý gia đình nhắc Hoàng xem video chữa đề của Thầy Phạm Duy.'
    }
  ];

  const handleQuickPay = async () => {
    try {
      const payload = {
        studentId: 's1111111-1111-1111-1111-111111111111',
        parentId: 'p1111111-1111-1111-1111-111111111111',
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
        studentName: childInfo.name,
        durationWeeks: 12
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cổng Phụ Huynh Theo Dõi Học Tập (Parent Companion Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đồng Hành Cùng Con: {childInfo.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Theo dõi minh bạch ma trận năng lực thực tế (IRT 3PL), chỉ số chuyên cần và các khuyến nghị can thiệp sớm từ AI Socratic Tutor.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-white space-y-1 shrink-0">
          <div className="text-cyan-300 font-bold">Giáo viên chủ nhiệm lớp:</div>
          <div className="font-extrabold text-sm">{mockUser.assignedTeacher}</div>
          <div className="flex items-center gap-1.5 text-blue-200 text-[11px] pt-1">
            <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
            <span>Liên hệ: 1900 8889 (Nhánh 1)</span>
          </div>
        </div>
      </div>

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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ước lượng Điểm ĐGNL</div>
          <div className="text-3xl font-black text-blue-600 mt-1">785 / 1200</div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Đạt 92.3% mục tiêu ĐH Bách Khoa</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác suất đỗ NV1</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">82%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Mục tiêu: {childInfo.targetScore} điểm
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên cần tuần này</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">{childInfo.studyHoursThisWeek} giờ</div>
          <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Chuỗi học tập liên tục {childInfo.streak} ngày</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chỉ số Năng lực IRT</div>
          <div className="text-3xl font-black text-cyan-600 mt-1">{childInfo.irtTheta} Theta</div>
          <div className="text-[11px] font-semibold text-cyan-700 mt-1">
            Nhóm Top 15% thí sinh toàn quốc
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AI Alerts for Parents */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Báo Cáo Học Tập & Cảnh Báo Sớm Từ AI</span>
          </h2>

          <div className="space-y-3">
            {aiParentAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.type === 'success' 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                  {alert.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{alert.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90 pl-6">
                  {alert.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <div className="font-extrabold">Buổi học trực tuyến sắp diễn ra:</div>
              <div className="text-blue-700 font-semibold mt-0.5">Tối nay 20:00 • Chữa bẫy đề thi ĐGNL cùng Thầy Phạm Duy</div>
            </div>
            <span className="px-3 py-1.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl">
              Đã đăng ký
            </span>
          </div>
        </div>

        {/* Right: Child Academic Profile */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Thông Tin Hồ Sơ Học Viên</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-500 font-medium">Họ tên con:</span>
              <span className="font-extrabold text-slate-800">{childInfo.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-500 font-medium">Lớp & Trường:</span>
              <span className="font-extrabold text-slate-800">{childInfo.grade}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-500 font-medium">Cơ sở đăng ký:</span>
              <span className="font-extrabold text-blue-600">{childInfo.campus}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
              <span className="text-slate-500 font-medium">Nguyện vọng 1:</span>
              <span className="font-extrabold text-slate-800 text-right max-w-[200px] truncate">{childInfo.targetMajor}</span>
            </div>
          </div>

          <div className="pt-2">
            <button className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Xem Báo cáo Chi tiết BKT & IRT của con</span>
              <ChevronRight className="w-4 h-4" />
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
