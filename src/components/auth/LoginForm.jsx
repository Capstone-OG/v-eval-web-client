import React from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isSubmitting,
  fieldErrors,
  setFieldErrors,
  handleLoginSubmit,
  onOpenForgotPassword
}) {
  return (
    <div className="space-y-4">
      <form onSubmit={handleLoginSubmit} className="space-y-3.5" noValidate>
        {/* Email or Phone Input */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Email hoặc Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="Nhập email hoặc số điện thoại đã đăng ký"
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.email
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="Nhập mật khẩu của bạn"
              className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.password
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Options: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang đăng nhập...</span>
            </span>
          ) : (
            <>
              <span>Đăng Nhập Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Role Routing Notice */}
      <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 space-y-1 text-[11px] text-slate-600">
        <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Đăng nhập một tài khoản cho mọi vai trò</span>
        </div>
        <p className="leading-relaxed">
          Hệ thống tự động nhận diện tài khoản để đưa bạn vào đúng không gian học tập và làm việc dành cho <strong>Học viên</strong>, <strong>Phụ huynh</strong>, <strong>Giảng viên</strong> hoặc <strong>Quản lý</strong>.
        </p>
      </div>
    </div>
  );
}
