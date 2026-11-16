import React from 'react';
import { 
  Lock, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  X, 
  BookOpen, 
  CheckCircle2
} from 'lucide-react';

export default function TuitionRequiredModal({
  isOpen = true,
  onClose,
  pattern = null,
  chapterName = '',
  lessonName = '',
  onNavigateTuition,
  onPreviewOverview
}) {
  if (!isOpen) return null;

  const patternName = pattern?.name || 'Bài học chuyên đề';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tuition-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Chế độ Xem Lộ Trình Tổng Quát</span>
          </div>

          <h2 id="tuition-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Khóa Học Chưa Được Kích Hoạt
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 leading-relaxed">
            Bạn đã hoàn thành bài khảo sát năng lực và được xem toàn bộ khung lộ trình tổng quát. Để mở khóa bài giảng và bắt đầu học, vui lòng hoàn tất học phí.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Target Pattern Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dạng bài bạn muốn truy cập:</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900">
              {patternName}
            </div>
            {(chapterName || lessonName) && (
              <div className="text-xs text-slate-500 font-medium">
                {chapterName} {lessonName ? `• ${lessonName}` : ''}
              </div>
            )}
          </div>

          {/* Benefits when paid */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quyền lợi mở khóa khi hoàn tất học phí:</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Toàn quyền học chi tiết tất cả bài giảng của <strong>Lớp học chung</strong> & <strong>Lộ trình cá nhân riêng</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Xem video bài giảng độc quyền, phương pháp giải tối ưu và công thức then chốt.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Hệ thống luyện tập thích ứng ZPD cá nhân hóa & Gia sư AI Socratic kèm cặp 24/7.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={onNavigateTuition}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Đóng Học Phí / Mở Khóa Bài Học Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onPreviewOverview && (
              <button
                type="button"
                onClick={onPreviewOverview}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Xem Thông Tin Tổng Quát Dạng Bài Này
              </button>
            )}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Thanh toán bảo mật chuẩn VietQR / PayOS • Tự động kích hoạt tức thì</span>
        </div>
      </div>
    </div>
  );
}
