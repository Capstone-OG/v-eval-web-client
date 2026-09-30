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
  Building2,
  Home,
  GitFork,
  Zap,
  Bot,
  User,
  Flame,
  Bell
} from 'lucide-react';
import { mockUser } from '../../data/mockData';

export default function MobileAuthFrame({ onLoginSuccess }) {
  const [role, setRole] = useState('student'); // student | parent | teacher | manager
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('0912... hoặc email@edu.vn');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess(role);
  };

  return (
    <div className="w-full max-w-[380px] bg-white rounded-[36px] shadow-2xl border-4 border-slate-200/90 overflow-hidden flex flex-col my-auto transition-all animate-fade">
      
      {/* Mobile Top Status Bar Simulation */}
      <div className="bg-slate-50 px-6 py-2.5 flex items-center justify-between border-b border-slate-100 text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px]">
            ĐGNL
          </div>
          <span className="text-slate-900 font-extrabold text-xs tracking-tight">ĐGNL AI</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
            12 Ngày
          </span>
          <Bell className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Main Container */}
      <div className="p-5 space-y-4 overflow-y-auto max-h-[720px] custom-scroll">
        
        {/* Logo Branding */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-8 h-8 text-cyan-200" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ĐGNL AI
          </h2>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
            Hệ thống Khảo thí & Luyện thi Thích ứng 4.0
          </p>
        </div>

        {/* Role Switcher Pill Bar matching exact mobile image */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
            BẠN THAM GIA VỚI TƯ CÁCH
          </div>
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80 text-[11px] font-bold">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Học sinh</span>
            </button>

            <button
              onClick={() => setRole('parent')}
              className={`flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Phụ huynh</span>
            </button>

            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Giáo viên</span>
            </button>

            <button
              onClick={() => setRole('manager')}
              className={`flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${
                role === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Quản lý</span>
            </button>
          </div>
        </div>

        {/* Login / Register Mode Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-extrabold text-center border-b-2 transition-all ${
              mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-extrabold text-center border-b-2 transition-all ${
              mode === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-extrabold text-slate-700">Email hoặc Số điện thoại</label>
              <span className="text-[10px] text-blue-600 font-bold">Bảo mật</span>
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="0912... hoặc email@edu.vn"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
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
          <div className="flex items-center justify-between text-[11px]">
            <label className="flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Social Login Buttons */}
        <div className="space-y-2 pt-1">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[9px] font-bold uppercase text-slate-400">HOẶC ĐĂNG NHẬP VỚI</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => onLoginSuccess('student')}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-all"
            >
              <span>Google</span>
            </button>
            <button 
              onClick={() => onLoginSuccess('student')}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-all"
            >
              <span>Apple ID</span>
            </button>
          </div>
        </div>

        {/* Adaptive Test Promo Banner */}
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-slate-700 leading-snug">
            <span className="font-extrabold text-blue-700">Đề thi thử Thích ứng Chuẩn hoá (MIỄN PHÍ)</span>: Đo lường năng lực chuẩn ma trận ĐHQG trong 15p.
          </div>
        </div>

        {/* Hotline support */}
        <div className="text-center text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1 pt-1">
          <PhoneCall className="w-3 h-3 text-blue-600" />
          <span>Hỗ trợ kỹ thuật Hotline: <strong className="text-blue-700">1900 8889</strong></span>
        </div>

      </div>

      {/* Bottom Nav Bar Simulation */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <div className="flex flex-col items-center gap-0.5 text-blue-600">
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <GitFork className="w-4 h-4" />
          <span>Lộ trình</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Zap className="w-4 h-4" />
          <span>Luyện tập</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Bot className="w-4 h-4" />
          <span>AI Tutor</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <User className="w-4 h-4" />
          <span>Cá nhân</span>
        </div>
      </div>

    </div>
  );
}
