import React from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  UserCheck, 
  Building2, 
  Users, 
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
  handleQuickDemo,
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
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
              }}
              placeholder="0912... hoặc email@gmail.com"
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
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
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
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Xác thực từ Backend...</span>
            </span>
          ) : (
            <>
              <span>Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>

      {/* Social Logins */}
      <div className="space-y-2 pt-1">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-2 text-[10px] font-bold uppercase text-slate-400">Hoặc đăng nhập bằng</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
          <button 
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google ID</span>
          </button>

          <button 
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              Z
            </div>
            <span>Zalo Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
