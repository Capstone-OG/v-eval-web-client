import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Users, 
  User, 
  Building2,
  X,
  CheckCircle2
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [role, setRole] = useState('student'); // student | parent | teacher | manager
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('minhhoang.vnu@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess(role);
  };

  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'student') setEmail('minhhoang.vnu@gmail.com');
    if (demoRole === 'teacher') setEmail('thayphamduy.dgnl@gmail.com');
    if (demoRole === 'manager') setEmail('manager.thuduc@dgnl.edu.vn');
    if (demoRole === 'parent') setEmail('phuhuynh.minhhoang@gmail.com');
    onLoginSuccess(demoRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Branding */}
        <div className="p-6 pb-4 text-center border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ĐGNL AI
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Hệ thống Khảo thí & Luyện thi Thích ứng 4.0
          </p>

          {/* Role selector tabbar matching left mobile design */}
          <div className="mt-4 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Học sinh</span>
            </button>

            <button
              onClick={() => setRole('parent')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'parent' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phụ huynh</span>
            </button>

            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Giáo viên</span>
            </button>

            <button
              onClick={() => setRole('manager')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'manager' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Quản lý</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Mode Tabs: Login / Register */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-extrabold text-center border-b-2 transition-all ${
                mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-extrabold text-center border-b-2 transition-all ${
                mode === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Phone input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Email hoặc Số điện thoại
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="0912... hoặc email@edu.vn"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full px-4 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="font-bold text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>{mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">
              Hoặc đăng nhập nhanh bằng tài khoản Demo:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleQuickDemo('student')}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold border border-blue-200 transition-all text-left flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Học sinh Minh Hoàng</span>
              </button>
              <button 
                onClick={() => handleQuickDemo('teacher')}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold border border-emerald-200 transition-all text-left flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>GV Thầy Phạm Duy</span>
              </button>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] font-bold uppercase text-slate-400">Hoặc đăng nhập với</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onLoginSuccess('student')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                <span>Google</span>
              </button>
              <button 
                onClick={() => onLoginSuccess('student')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                <span>Apple ID</span>
              </button>
            </div>
          </div>

          {/* Adaptive Test Promo Banner matching screenshot */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-700 leading-snug">
              <span className="font-extrabold text-blue-700">Đề thi thử Thích ứng Chuẩn hoá (MIỄN PHÍ)</span>: Đo lường năng lực chuẩn ma trận ĐHQG-HCM trong 15 phút.
            </div>
          </div>

          {/* Support Hotline Footer */}
          <div className="text-center pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>Hỗ trợ kỹ thuật Hotline: <strong className="text-blue-700">1900 8889</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
}
