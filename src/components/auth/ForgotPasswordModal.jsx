import React from 'react';
import { KeyRound, X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  demoOtpCode = '',
  isActivationMode = false
}) {
  if (!isOpen) return null;

  const storedOtp = demoOtpCode || localStorage.getItem('demo_otp_code') || '';

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
            {isActivationMode ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <KeyRound className="w-6 h-6 text-blue-600" />}
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {forgotStep === 4 
              ? 'Thành Công!' 
              : isActivationMode 
                ? 'Xác Thực Tài Khoản OTP' 
                : 'Khôi Phục Mật Khẩu'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {forgotStep === 1 && 'Nhập email để nhận mã xác minh OTP'}
            {forgotStep === 2 && `Mã xác thực OTP đã được gửi đến: ${forgotEmail || 'email của bạn'}`}
            {forgotStep === 3 && 'Tạo mật khẩu mới cho tài khoản ĐGNL AI'}
            {forgotStep === 4 && 'Tài khoản của bạn đã sẵn sàng sử dụng.'}
          </p>
        </div>

        {/* DEMO OTP HIGHLIGHT BADGE FOR FAST VERIFICATION */}
        {forgotStep === 2 && storedOtp && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2 shadow-2xs animate-fade">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate text-xs font-bold text-amber-900">
                <span>Mã OTP Demo: </span>
                <code className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-950 font-mono rounded-lg text-sm font-black tracking-widest">
                  {storedOtp}
                </code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(storedOtp)}
              className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              Tự động điền
            </button>
          </div>
        )}

        <form onSubmit={handleForgotSubmit} className="space-y-4">

          {forgotStep === 1 && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email đăng ký
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
                Nhập Mã Xác Thực OTP (6 chữ số)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="436637"
                className="w-full px-4 py-3 text-center tracking-[0.3em] text-lg font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 shadow-inner"
                required
              />
              <p className="text-[11px] text-slate-400 text-center mt-1.5 font-medium">
                Kiểm tra hòm thư Email (hoặc sử dụng mã OTP Demo ở trên)
              </p>
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {forgotStep === 1 && 'Gửi Mã Xác Thực OTP'}
              {forgotStep === 2 && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isActivationMode ? 'Xác Nhận OTP & Vào Trang Chủ' : 'Xác Nhận OTP & Đặt Mật Khẩu Mới'}</span>
                </>
              )}
              {forgotStep === 3 && 'Lưu Mật Khẩu Mới & Đăng Nhập'}
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

