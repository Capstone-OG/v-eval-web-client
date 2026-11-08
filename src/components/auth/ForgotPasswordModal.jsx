import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Clock,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Check,
  Sparkles
} from 'lucide-react';

export default function ForgotPasswordModal(props) {
  const {
    isOpen = false,
    onClose = () => { },
    forgotStep = 1,
    setForgotStep = () => { },
    forgotEmail = '',
    setForgotEmail = () => { },
    otpCode = '',
    setOtpCode = () => { },
    newPassword = '',
    setNewPassword = () => { },
    confirmPassword = '',
    setConfirmPassword = () => { },
    handleForgotSubmit = () => { },
    onResendOtp = null,
    isSubmitting = false,
    modalError = null,
    modalSuccess = null,
    modalMode = 'forgot',
  } = props;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync external otpCode with internal 6-digit state
  useEffect(() => {
    if (!otpCode) {
      setDigits(['', '', '', '', '', '']);
    } else if (otpCode.length === 6) {
      setDigits(otpCode.split(''));
    }
  }, [otpCode]);

  // Initialize countdown timer when stepping into OTP entry
  useEffect(() => {
    if (isOpen && forgotStep === 2) {
      setResendCooldown(60);
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, forgotStep]);

  // Countdown clock tick
  useEffect(() => {
    if (!isOpen || forgotStep !== 2 || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, forgotStep, resendCooldown]);

  if (!isOpen) return null;

  const isActivation = modalMode === 'activation';
  const isCompleted = forgotStep === 4;

  // Single digit typing
  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      setOtpCode(next.join(''));
      return;
    }

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const next = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) {
          next[index + i] = pasted[i];
        }
      }
      setDigits(next);
      setOtpCode(next.join(''));
      const targetIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[targetIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean[clean.length - 1];
    setDigits(next);
    setOtpCode(next.join(''));

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Keyboard navigation across the 6 boxes
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        setOtpCode(next.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
        setOtpCode(next.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste full OTP code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setDigits(next);
    setOtpCode(pasted);
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  // Resend OTP action
  const handleResendClick = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      if (typeof onResendOtp === 'function') {
        await onResendOtp();
      }
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      setOtpCode('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      // errors handled by parent
    } finally {
      setIsResending(false);
    }
  };

  // Header Titles & Subtitles
  let title = 'Khôi Phục Mật Khẩu';
  if (isCompleted) {
    title = isActivation ? 'Kích Hoạt Thành Công!' : 'Đổi Mật Khẩu Thành Công!';
  } else if (isActivation) {
    title = 'Kích Hoạt Tài Khoản';
  }

  let buttonText = 'Kiểm Tra Email & Nhận Mã OTP';
  if (forgotStep === 2) {
    buttonText = isActivation ? 'Xác Nhận Kích Hoạt' : 'Xác Thực Mã OTP';
  } else if (forgotStep === 3) {
    buttonText = 'Lưu Mật Khẩu Mới';
  }

  const canGoBackToStep1 = !isActivation && forgotStep === 2;
  const canGoBackToStep2 = !isActivation && forgotStep === 3;

  // Password checklist validation
  const hasMinLength = (newPassword || '').length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword || '');
  const hasLower = /[a-z]/.test(newPassword || '');
  const hasNumber = /[0-9]/.test(newPassword || '');
  const isMatch = Boolean(confirmPassword && newPassword === confirmPassword);
  const isAllOtpFilled = digits.every((d) => d !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-slate-900 transition-all">

        {/* Back navigation buttons */}
        {canGoBackToStep1 ? (
          <button
            type="button"
            onClick={() => setForgotStep(1)}
            className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
            title="Quay lại bước nhập Email"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        {canGoBackToStep2 ? (
          <button
            type="button"
            onClick={() => setForgotStep(2)}
            className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
            title="Quay lại bước nhập OTP"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
          title="Đóng hộp thoại"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP PROGRESS INDICATOR */}
        {!isCompleted ? (
          <div className="flex items-center justify-center gap-2 mb-6 pt-2">
            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${forgotStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${forgotStep > 1
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : forgotStep === 1
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                {forgotStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className="hidden sm:inline font-bold">Email</span>
            </div>

            <div className={`w-8 h-0.5 rounded-full transition-colors ${forgotStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${forgotStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${forgotStep > 2
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : forgotStep === 2
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                {forgotStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className="hidden sm:inline font-bold">Mã OTP</span>
            </div>

            {!isActivation ? (
              <>
                <div className={`w-8 h-0.5 rounded-full transition-colors ${forgotStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />

                <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${forgotStep >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${forgotStep === 4
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : forgotStep === 3
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                    {forgotStep === 4 ? <Check className="w-3.5 h-3.5" /> : '3'}
                  </span>
                  <span className="hidden sm:inline font-bold">Mật khẩu mới</span>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* HERO ICON & TITLE */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            {isCompleted ? (
              <Sparkles className="w-7 h-7 animate-bounce" />
            ) : isActivation ? (
              <ShieldCheck className="w-7 h-7" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h3>

          {forgotStep === 1 ? (
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-sm mx-auto">
              Nhập email tài khoản V-Eval để hệ thống xác thực và gửi mã OTP khôi phục.
            </p>
          ) : null}

          {forgotStep === 2 ? (
            <div className="mt-1.5 space-y-1.5">
              <p className="text-xs text-slate-500 font-medium">
                Vui lòng nhập mã xác thực gồm 6 chữ số đã được gửi đến:
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-bold text-blue-700 shadow-2xs">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono">{forgotEmail}</span>
              </div>
            </div>
          ) : null}

          {forgotStep === 3 ? (
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              Thiết lập mật khẩu mới bảo mật cho tài khoản của bạn.
            </p>
          ) : null}

          {isCompleted ? (
            <p className="text-xs text-slate-500 font-medium mt-2 max-w-sm mx-auto">
              {isActivation
                ? 'Tài khoản của bạn đã được kích hoạt thành công. Đăng nhập ngay để bắt đầu luyện thi ĐGNL!'
                : 'Mật khẩu đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.'}
            </p>
          ) : null}
        </div>

        {/* ERROR NOTIFICATION */}
        {modalError ? (
          <div className="p-3.5 mb-4 bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-start gap-2.5 shadow-2xs animate-fade">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{modalError}</span>
          </div>
        ) : null}

        {/* SUCCESS NOTIFICATION */}
        {modalSuccess && forgotStep !== 2 ? (
          <div className="p-3.5 mb-4 bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-start gap-2.5 shadow-2xs animate-fade">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-relaxed">{modalSuccess}</span>
          </div>
        ) : null}

        <form onSubmit={handleForgotSubmit} className="space-y-5">

          {/* STEP 1: EMAIL INPUT */}
          {forgotStep === 1 ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Địa chỉ Email tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ví dụ: hocsinh.dgnl@gmail.com"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Hệ thống sẽ đối soát email trong CSDL trước khi gửi thư xác thực qua Brevo Relay.
              </p>
            </div>
          ) : null}

          {/* STEP 2: 6-DIGIT OTP BOX GRID (PREMIUM FINTECH STYLE) */}
          {forgotStep === 2 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-center text-xs font-extrabold text-slate-700 mb-2">
                  Nhập mã OTP xác thực (6 chữ số)
                </label>

                {/* 6 Square Digit Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-2.5 my-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const isFilled = Boolean(digits[index]);
                    return (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digits[index]}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all duration-200 outline-none select-none ${isFilled
                            ? 'border-blue-500 bg-blue-50/40 text-blue-900 shadow-xs ring-2 ring-blue-500/10 scale-102'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100'
                          }`}
                        autoFocus={index === 0}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Countdown & Resend Section */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Chưa nhận được mã?</span>
                {resendCooldown > 0 ? (
                  <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    Gửi lại sau {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendClick}
                    disabled={isResending}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}</span>
                  </button>
                )}
              </div>

              {/* Security Hint */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Mã có hiệu lực trong 10 phút • Kiểm tra cả mục Spam/Thư rác</span>
              </div>
            </div>
          ) : null}

          {/* STEP 3: NEW PASSWORD WITH SECURITY CHECKLIST */}
          {forgotStep === 3 ? (
            <div className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Policy Requirements Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-600 mb-1">Yêu cầu bảo mật mật khẩu:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>1 chữ cái in hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>1 chữ cái thường (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span>1 chữ số (0-9)</span>
                  </div>
                </div>

                {confirmPassword ? (
                  <div className={`pt-1 border-t border-slate-200/60 flex items-center gap-1.5 ${isMatch ? 'text-emerald-600 font-bold' : 'text-rose-500 font-semibold'}`}>
                    <Check className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-500' : 'text-rose-400'}`} />
                    <span>{isMatch ? 'Mật khẩu xác nhận trùng khớp' : 'Mật khẩu xác nhận chưa khớp'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* ACTION BUTTON */}
          {forgotStep === 4 ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Đăng Nhập Ngay Bằng Mật Khẩu Mới</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || (forgotStep === 2 && !isAllOtpFilled)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : null}
              <span>{isSubmitting ? 'Đang xử lý...' : buttonText}</span>
            </button>
          )}

        </form>

      </div>
    </div>
  );
}
