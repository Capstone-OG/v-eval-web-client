import React from 'react';
import { KeyRound, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  forgotStep,
  setForgotStep,
  forgotEmail,
  setForgotEmail,
  otpCode,
  setOtpCode,
  newPassword,
  setNewPassword,
  handleForgotSubmit,
  isSubmitting = false,
  modalError = null,
  modalSuccess = null
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-slate-900">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {forgotStep === 4 ? 'Khôi Phục Thành Công!' : 'Khôi Phục Mật Khẩu'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {forgotStep === 1 && 'Nhập email để nhận mã xác minh OTP'}
            {forgotStep === 2 && 'Mã xác thực OTP đã được gửi đến email/SĐT của bạn'}
            {forgotStep === 3 && 'Tạo mật khẩu mới cho tài khoản ĐGNL AI'}
            {forgotStep === 4 && 'Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay.'}
          </p>
        </div>

        {modalError && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{modalError}</span>
          </div>
        )}

        {modalSuccess && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{modalSuccess}</span>
          </div>
        )}

        <form onSubmit={handleForgotSubmit} className="space-y-4">

          {forgotStep === 1 && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email  đăng ký
              </label>
              <input
                type="text"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="minhhoang.vnu@gmail.com"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                required
              />
            </div>
          )}

          {forgotStep === 2 && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Mã xác thực OTP (6 chữ số)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 text-center tracking-widest text-base font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <p className="text-[10px] text-slate-400 text-center mt-1">Mã dùng thử: 123456</p>
            </div>
          )}

          {forgotStep === 3 && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                required
              />
            </div>
          )}

          {forgotStep < 4 ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  {forgotStep === 1 && 'Gửi Mã Xác Thực OTP'}
                  {forgotStep === 2 && 'Xác Nhận Mã OTP'}
                  {forgotStep === 3 && 'Lưu Mật Khẩu Mới'}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Đăng Nhập Ngay
            </button>
          )}

        </form>

      </div>
    </div>
  );
}
