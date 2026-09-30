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
  CheckCircle2,
  Flame,
  Award,
  BookOpenCheck,
  Zap,
  Bot
} from 'lucide-react';
import studentAvatar from '../../assets/student_3d_avatar.jpg';

export default function WebLoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('student'); // student | parent | teacher | manager
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('minhhoang.vnu@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 lg:p-8 animate-fade">
      
      {/* Central Web Portal Login Container */}
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] border border-slate-200/80">
        
        {/* LEFT COLUMN (7 Spans): Brand Highlights & 3D Floating Student Avatar */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Background Ambient Glowing Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none animate-pulse-subtle"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-400/30 blur-3xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                ĐGNL AI Portal <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-xs rounded-full border border-cyan-300/30">v2.4</span>
              </div>
              <div className="text-xs text-blue-100 font-semibold">
                Hệ thống Khảo thí & Luyện thi Thích ứng 4.0
              </div>
            </div>
          </div>

          {/* Center Content: Title & 3D Student Image */}
          <div className="relative z-10 my-auto py-4 space-y-6">
            
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider text-cyan-200">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Chiến dịch Ôn thi ĐGNL ĐHQG TP.HCM 2026</span>
              </span>

              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
                Khám phá Năng lực & Bứt phá Điểm số mục tiêu
              </h1>

              <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-xl">
                Đo lường năng lực chuẩn ma trận 120 câu hỏi ĐGNL ĐHQG-HCM bằng mô hình khoa học khảo thí hiện đại (IRT 3PL & BKT).
              </p>
            </div>

            {/* 3D POP-OUT STUDENT AVATAR CONTAINER */}
            <div className="relative max-w-md mx-auto group">
              
              {/* Glowing Background Ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
              
              {/* Card Frame with 3D Effect */}
              <div className="relative bg-slate-900/60 border border-white/30 rounded-3xl p-3 backdrop-blur-md shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]">
                
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl h-64 sm:h-72 w-full">
                  <img 
                    src={studentAvatar} 
                    alt="Vietnamese Grade 12 Student 3D"
                    className="w-full h-full object-cover object-top filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* 3D FLOATING BADGES */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-900 text-xs font-extrabold shadow-lg flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>IRT Theta 0 = +0.65</span>
                    </div>

                    <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>82% Trúng tuyển Bách Khoa</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-blue-100 pt-2">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Test chẩn đoán đầu vào 15p</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Luyện tập Thích ứng ZPD & BKT</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>AI Socratic Tutor gợi mở 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Live Q&A trực tuyến cùng Giáo viên</span>
              </div>
            </div>

          </div>

          {/* Footer Info */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200 font-medium">
            <span>© 2026 Trung tâm Đào tạo ĐGNL ĐHQG TP.HCM</span>
            <span className="flex items-center gap-1 text-white font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              Hotline: 1900 8889
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Spans): Modern Web Auth Form */}
        <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between bg-white">
          
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Đăng nhập Cổng Học viên
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Chọn vai trò của bạn để truy cập hệ thống khảo thí.
              </p>
            </div>

            {/* Role Switcher Tab Bar */}
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                VAI TRÒ TRUY CẬP
              </div>

              <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80 text-xs font-bold">
                <button
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Học sinh</span>
                </button>

                <button
                  onClick={() => setRole('parent')}
                  className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Phụ huynh</span>
                </button>

                <button
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Giáo viên</span>
                </button>

                <button
                  onClick={() => setRole('manager')}
                  className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    role === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Quản lý</span>
                </button>
              </div>
            </div>

            {/* Auth Mode Tabs: Login / Register */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition-all ${
                  mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition-all ${
                  mode === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Email hoặc Số điện thoại
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="0912... hoặc email@edu.vn"
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                  required
                />
              </div>

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
                    className="w-full px-4 py-3 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
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

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>{mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản học viên mới'}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

            </form>

            {/* Quick Demo Login Presets */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">
                Đăng nhập thử tài khoản mẫu (1-Click Demo):
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  onClick={() => handleQuickDemo('student')}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all text-left flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div>Minh Hoàng</div>
                    <div className="text-[10px] text-blue-500 font-normal">Học sinh Lớp 12</div>
                  </div>
                </button>

                <button 
                  onClick={() => handleQuickDemo('teacher')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all text-left flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <div>Thầy Phạm Duy</div>
                    <div className="text-[10px] text-emerald-600 font-normal">Giáo viên Cơ sở 1</div>
                  </div>
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

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button 
                  onClick={() => onLoginSuccess('student')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all"
                >
                  <span>Google</span>
                </button>
                <button 
                  onClick={() => onLoginSuccess('student')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all"
                >
                  <span>Apple ID</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            Hệ thống Khảo thí ĐGNL ĐHQG TP.HCM • Mã Đồ án FA26SE090
          </div>

        </div>

      </div>

    </div>
  );
}
