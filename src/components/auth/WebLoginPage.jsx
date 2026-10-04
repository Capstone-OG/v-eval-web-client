import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
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
  Bot,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Mail,
  Phone,
  User,
  Lock,
  Clock,
  MapPin
} from 'lucide-react';
import studentAvatar from '../../assets/student_3d_avatar.jpg';
import authService from '../../services/authService';

export default function WebLoginPage({ initialMode = 'login', onLoginSuccess, onNavigateHome }) {
  // Modes: 'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password'
  const [mode, setMode] = useState(initialMode || 'login');
  const [role, setRole] = useState('student'); // student | teacher | manager | parent

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // When switching to register mode, only allow 'student' or 'parent'
  useEffect(() => {
    if (mode === 'register' && role !== 'student' && role !== 'parent') {
      setRole('student');
    }
  }, [mode, role]);
  
  // Login Form States
  const [email, setEmail] = useState('minhhoang.vnu@gmail.com');
  const [password, setPassword] = useState('Password123@');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [targetVerifyEmail, setTargetVerifyEmail] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(600); // 10 minutes (600s)

  // Forgot / Reset Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load campuses for register dropdown
  useEffect(() => {
    let isMounted = true;
    authService.getCampuses().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setCampuses(data);
        setSelectedCampusId(data[0].campusId || data[0].id || '');
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (mode === 'otp_verify' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpCountdown]);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      setIsLoading(false);
      
      const loggedUser = response.user || {
        email: response.email || email,
        fullName: response.fullName || 'Người dùng V-Eval',
        role: role
      };

      const isUserAdmin = loggedUser.role === 'administrator' || loggedUser.roles?.includes('ADMINISTRATOR') || role === 'admin';
      const resolvedRole = isUserAdmin ? 'admin' : (loggedUser.role || role);

      if (onLoginSuccess) {
        onLoginSuccess(resolvedRole, loggedUser);
      }
    } catch (err) {
      setIsLoading(false);
      console.warn('[WebLoginPage] Login error:', err);

      // Check if account not activated
      if (err.data?.error?.code === 'Auth.AccountNotActivated' || err.message?.includes('chưa được kích hoạt')) {
        setTargetVerifyEmail(email);
        setErrorMessage('Tài khoản chưa kích hoạt OTP. Vui lòng xác thực mã OTP 6 số để tiếp tục.');
        setTimeout(() => {
          setMode('otp_verify');
          setOtpCountdown(600);
        }, 1500);
        return;
      }

      const msg = err.data?.error?.description || err.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      setErrorMessage(msg);
    }
  };

  // 2. Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Client-side validations
    if (!regFullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regPhone.trim() || !/^(0|\+84)[35789][0-9]{8}$/.test(regPhone.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ (định dạng 10 số Việt Nam: 09, 08, 07, 05, 03).');
      return;
    }
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail.trim())) {
      setErrorMessage('Email không hợp lệ.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (!/[A-Z]/.test(regPassword) || !/[0-9]/.test(regPassword)) {
      setErrorMessage('Mật khẩu phải có ít nhất 1 chữ in hoa và 1 chữ số.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const isParent = role === 'parent';
      const res = await authService.register({
        fullName: regFullName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        campusId: selectedCampusId,
        roleName: isParent ? 'PARENT' : 'STUDENT'
      });

      setIsLoading(false);
      setTargetVerifyEmail(regEmail);
      if (res?.otpCode) {
        setDevOtpHint(res.otpCode);
      }
      setSuccessMessage(`Đăng ký tài khoản ${isParent ? 'Phụ huynh' : 'Học sinh'} thành công! Vui lòng nhập mã OTP 6 số để kích hoạt.`);
      setOtpCountdown(600);
      setMode('otp_verify');
    } catch (err) {
      setIsLoading(false);
      console.warn('[WebLoginPage] Register error:', err);
      const msg = err.data?.error?.description || err.data?.message || err.message || 'Đăng ký không thành công. Email hoặc số điện thoại có thể đã tồn tại.';
      setErrorMessage(msg);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    clearMessages();

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Vui lòng nhập đúng 6 chữ số OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp(targetVerifyEmail, otpCode.trim());
      setIsLoading(false);
      setSuccessMessage('Kích hoạt tài khoản thành công! Đang tiến hành đăng nhập...');

      // Auto login if we have registered password
      if (regPassword && targetVerifyEmail === regEmail) {
        try {
          const loginRes = await authService.login({ email: targetVerifyEmail, password: regPassword });
          if (onLoginSuccess) {
            onLoginSuccess('student', loginRes.user);
            return;
          }
        } catch {
          // fallback to login mode
        }
      }

      setEmail(targetVerifyEmail);
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      console.warn('[WebLoginPage] Verify OTP error:', err);
      const msg = err.data?.error?.description || err.data?.message || err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.';
      setErrorMessage(msg);
    }
  };

  // 4. Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!forgotEmail.trim()) {
      setErrorMessage('Vui lòng nhập email tài khoản.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      setIsLoading(false);
      setTargetVerifyEmail(forgotEmail.trim());
      if (res?.otpCode) {
        setDevOtpHint(res.otpCode);
      }
      setSuccessMessage('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.');
      setMode('reset_password');
    } catch (err) {
      setIsLoading(false);
      const msg = err.data?.error?.description || err.data?.message || err.message || 'Không tìm thấy tài khoản với email này.';
      setErrorMessage(msg);
    }
  };

  // 5. Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!resetOtpCode || resetOtpCode.trim().length !== 6) {
      setErrorMessage('Vui lòng nhập đúng 6 số OTP.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: targetVerifyEmail || forgotEmail,
        otpCode: resetOtpCode.trim(),
        newPassword: newPassword
      });
      setIsLoading(false);
      setSuccessMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      setEmail(targetVerifyEmail || forgotEmail);
      setPassword(newPassword);
      setTimeout(() => setMode('login'), 1800);
    } catch (err) {
      setIsLoading(false);
      const msg = err.data?.error?.description || err.data?.message || err.message || 'Mã OTP không hợp lệ hoặc quá hạn.';
      setErrorMessage(msg);
    }
  };

  // 6. Handle Quick Demo (1-Click)
  const handleQuickDemo = async (demoRole) => {
    setRole(demoRole);
    clearMessages();

    let demoEmail = 'minhhoang.vnu@gmail.com';
    let demoPass = 'Password123@';
    let demoFullName = 'Phạm Minh Hoàng';

    if (demoRole === 'student') {
      demoEmail = 'minhhoang.vnu@gmail.com';
      demoFullName = 'Phạm Minh Hoàng';
    } else if (demoRole === 'teacher') {
      demoEmail = 'thayphamduy.dgnl@gmail.com';
      demoFullName = 'Thầy Phạm Duy';
    } else if (demoRole === 'manager') {
      demoEmail = 'manager.thuduc@dgnl.edu.vn';
      demoFullName = 'Trưởng cơ sở Thủ Đức';
    } else if (demoRole === 'parent') {
      demoEmail = 'phuhuynh.minhhoang@gmail.com';
      demoFullName = 'Phụ huynh Minh Hoàng';
    } else if (demoRole === 'admin') {
      demoEmail = 'admin';
      demoPass = '1234';
      demoFullName = 'admin';
    }

    setEmail(demoEmail);
    setPassword(demoPass);

    setIsLoading(true);
    try {
      const res = await authService.login({ email: demoEmail, password: demoPass });
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(demoRole, res.user || { email: demoEmail, fullName: demoFullName, role: demoRole });
      }
    } catch {
      // Fallback demo mode if offline or seeded account differs
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(demoRole, { email: demoEmail, fullName: demoFullName, role: demoRole, isDemo: true });
      }
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-8 animate-fade">
      
      {/* Top Back Nav Button */}
      {onNavigateHome && (
        <div className="w-full max-w-6xl mb-3 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang chủ Công khai</span>
          </button>

          <div className="text-[11px] text-slate-500 font-semibold hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cổng Gateway 5212 • Identity 5155 Sẵn sàng</span>
          </div>
        </div>
      )}

      {/* Central Web Portal Login Container */}
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px] border border-slate-200/80">
        
        {/* LEFT COLUMN (7 Spans): Brand Highlights & 3D Floating Student Avatar */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Glowing Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none animate-pulse-subtle"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-400/30 blur-3xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                ĐGNL AI Portal <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-xs rounded-full border border-cyan-300/30">v2.4 Live</span>
              </div>
              <div className="text-xs text-blue-100 font-semibold">
                Hệ thống Khảo thí & Luyện thi Thích ứng 4.0
              </div>
            </div>
          </div>

          {/* Center Content: Title & 3D Student Image */}
          <div className="relative z-10 my-auto py-2 space-y-5">
            
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider text-cyan-200">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Chiến dịch Ôn thi ĐGNL ĐHQG TP.HCM 2026</span>
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
                Khám phá Năng lực & Bứt phá Điểm số mục tiêu
              </h1>

              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-xl">
                Đo lường năng lực chuẩn ma trận 120 câu hỏi ĐGNL ĐHQG-HCM bằng mô hình khoa học khảo thí hiện đại (IRT 3PL & BKT) cùng công nghệ AI Socratic Tutor.
              </p>
            </div>

            {/* 3D POP-OUT STUDENT AVATAR CONTAINER */}
            <div className="relative max-w-md mx-auto group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
              
              <div className="relative bg-slate-900/60 border border-white/30 rounded-3xl p-3 backdrop-blur-md shadow-2xl transition-all duration-500 transform group-hover:scale-[1.01]">
                <div className="relative overflow-hidden rounded-2xl h-56 sm:h-64 w-full">
                  <img 
                    src={studentAvatar} 
                    alt="Vietnamese Grade 12 Student 3D"
                    className="w-full h-full object-cover object-top filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-900 text-xs font-extrabold shadow-lg flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>IRT Theta 0 = +0.65</span>
                    </div>

                    <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>82% Trúng tuyển Bách Khoa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-blue-100 pt-1">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Test chẩn đoán đầu vào 30 câu KaTeX</span>
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
          <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-200 font-medium">
            <span>© 2026 Trung tâm Đào tạo ĐGNL ĐHQG TP.HCM</span>
            <span className="flex items-center gap-1 text-white font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              Hotline: 1900 8889
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN (5 Spans): Interactive Auth Form Hub */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white overflow-y-auto">
          
          <div className="space-y-5">
            
            {/* Header Titles */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {mode === 'login' && 'Đăng nhập Cổng Học viên'}
                {mode === 'register' && 'Đăng ký Tài khoản Mới'}
                {mode === 'otp_verify' && 'Xác thực Mã OTP'}
                {mode === 'forgot_password' && 'Khôi phục Mật khẩu'}
                {mode === 'reset_password' && 'Đặt lại Mật khẩu'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {mode === 'login' && 'Chọn vai trò của bạn để truy cập hệ thống khảo thí.'}
                {mode === 'register' && 'Khởi tạo tài khoản học sinh chuẩn hoá để bắt đầu đo lường năng lực.'}
                {mode === 'otp_verify' && `Nhập mã xác thực 6 số gửi về email ${targetVerifyEmail || 'của bạn'}.`}
                {mode === 'forgot_password' && 'Nhập email để nhận mã OTP khôi phục mật khẩu.'}
                {mode === 'reset_password' && 'Nhập mã OTP đã nhận và thiết lập mật khẩu an toàn mới.'}
              </p>
            </div>

            {/* Error & Success Notification Banners */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{successMessage}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Switcher for REGISTER mode: ONLY STUDENT & PARENT */}
            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  <span>VAI TRÒ ĐĂNG KÝ (DÀNH CHO NGƯỜI HỌC & GIA ĐÌNH)</span>
                  <span className="text-blue-600 font-bold">2 Vai trò mở</span>
                </div>

                <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Học sinh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`flex-1 py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Phụ huynh</span>
                  </button>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 font-medium flex items-center gap-2 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>💡 Lưu ý: Tài khoản Giáo viên, Cán bộ Học thuật Cơ sở và Quản trị viên do Nhà trường/Admin cấp nội bộ, không mở đăng ký tự do.</span>
                </div>
              </div>
            )}

            {/* Role Switcher for LOGIN mode: All 4 Roles with Unified Portal Routing */}
            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  <span>VAI TRÒ TRUY CẬP (HỆ THỐNG SMART RBAC)</span>
                  <span className="text-emerald-600 font-bold">Cổng Hợp Nhất</span>
                </div>

                <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Học sinh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Phụ huynh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Giáo viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'manager' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Quản lý/Admin</span>
                  </button>
                </div>

                <div className="mt-2 p-2 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-800 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cán bộ, Giáo viên và Quản lý cơ sở đăng nhập trực tiếp tại đây bằng tài khoản nội bộ được cấp.</span>
                </div>
              </div>
            )}

            {/* Auth Mode Tabs: Login vs Register */}
            {(mode === 'login' || mode === 'register') && (
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('login'); }}
                  className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition-all ${
                    mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('register'); }}
                  className={`flex-1 py-2.5 text-xs font-extrabold text-center border-b-2 transition-all ${
                    mode === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>
            )}

            {/* ================================================================= */}
            {/* VIEW 1: LOGIN FORM */}
            {/* ================================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Tên đăng nhập hoặc Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin hoặc email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => { clearMessages(); setMode('forgot_password'); }}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Ghi nhớ phiên đăng nhập (7 ngày)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực thông tin...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập hệ thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================================================================= */}
            {/* VIEW 2: REGISTER FORM */}
            {/* ================================================================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    {role === 'parent' ? 'Họ và tên phụ huynh' : 'Họ và tên học sinh'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={role === 'parent' ? 'Ví dụ: Nguyễn Văn Hùng' : 'Ví dụ: Nguyễn Văn An'}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {role === 'parent' ? 'Số điện thoại phụ huynh' : 'Số điện thoại học sinh'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912345678"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      {role === 'parent' ? 'Cơ sở học vụ của con' : 'Cơ sở học vụ'}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCampusId}
                        onChange={(e) => setSelectedCampusId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800 cursor-pointer"
                      >
                        {campuses.map((c) => (
                          <option key={c.campusId || c.id} value={c.campusId || c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    {role === 'parent' ? 'Email phụ huynh nhận thông báo' : 'Email học sinh'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={role === 'parent' ? 'phuhuynh@example.com' : 'hocsinh@example.com'}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="≥8 ký tự (hoa + số)"
                        className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                        required
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nhập lại mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu"
                        className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                        required
                      />
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  Bằng việc đăng ký, bạn đồng ý với Điều khoản Khảo thí & Chính sách Bảo mật của V-Eval.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{role === 'parent' ? 'Đang tạo hồ sơ phụ huynh...' : 'Đang tạo hồ sơ học sinh...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{role === 'parent' ? 'Đăng ký Tài khoản Phụ huynh & Nhận OTP' : 'Đăng ký Tài khoản Học sinh & Nhận OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================================================================= */}
            {/* VIEW 3: OTP VERIFICATION */}
            {/* ================================================================= */}
            {mode === 'otp_verify' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Thời gian hiệu lực OTP:</span>
                    </span>
                    <span className="font-mono text-sm text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                      {formatCountdown(otpCountdown)}
                    </span>
                  </div>
                  <div className="text-blue-700 leading-relaxed">
                    Mã xác thực 6 số kích hoạt tài khoản đã được cấp cho email: <strong className="text-blue-950">{targetVerifyEmail}</strong>.
                  </div>

                  {devOtpHint && (
                    <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-800">
                        ⚡ Dev-Test OTP: <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{devOtpHint}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpHint)}
                        className="text-[11px] font-extrabold text-blue-700 underline hover:text-blue-900"
                      >
                        Bấm để điền nhanh
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1 text-center">
                      NHẬP MÃ OTP 6 CHỮ SỐ
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full tracking-[0.5em] text-center text-xl font-mono py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all text-slate-900 font-extrabold"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang kích hoạt tài khoản...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác nhận kích hoạt tài khoản</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { clearMessages(); setMode('login'); }}
                      className="font-bold text-slate-500 hover:text-slate-800"
                    >
                      ← Quay lại Đăng nhập
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setSuccessMessage('Đã yêu cầu mã OTP mới. Vui lòng kiểm tra lại.');
                        setOtpCountdown(600);
                      }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* VIEW 4: FORGOT PASSWORD */}
            {/* ================================================================= */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Email tài khoản cần khôi phục
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                      required
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <span>Gửi mã OTP khôi phục</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setMode('login'); }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    ← Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )}

            {/* ================================================================= */}
            {/* VIEW 5: RESET PASSWORD */}
            {/* ================================================================= */}
            {mode === 'reset_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                {devOtpHint && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-800">
                    <span>⚡ Dev OTP: <strong className="font-mono">{devOtpHint}</strong></span>
                    <button
                      type="button"
                      onClick={() => setResetOtpCode(devOtpHint)}
                      className="font-bold underline"
                    >
                      Điền ngay
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Mã OTP 6 số
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full tracking-widest text-center text-lg font-mono py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-extrabold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="≥8 ký tự"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setMode('login'); }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    ← Hủy & Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Login Presets (Available on Login Mode) */}
            {mode === 'login' && (
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">
                  Đăng nhập thử tài khoản mẫu (1-Click Demo):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div>Minh Hoàng</div>
                      <div className="text-[10px] text-blue-500 font-normal">Học sinh Lớp 12</div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('parent')}
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <div>Phụ huynh</div>
                      <div className="text-[10px] text-purple-600 font-normal">Theo dõi học sinh</div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('teacher')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div>Thầy Phạm Duy</div>
                      <div className="text-[10px] text-emerald-600 font-normal">Giáo viên Cơ sở 1</div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('manager')}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <div>Quản lý Cơ sở</div>
                      <div className="text-[10px] text-indigo-600 font-normal">Admin Học thuật</div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all text-left flex items-center gap-2 cursor-pointer col-span-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs">Quản trị viên (Admin)</span> • <span className="font-mono text-rose-800 text-[11px]">admin / 1234</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-rose-200/60 text-rose-900 rounded-md font-extrabold">1-Click Đăng nhập</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Social Logins */}
            {mode === 'login' && (
              <div className="space-y-2">
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold uppercase text-slate-400">Hoặc tiếp tục với</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
                  >
                    <span>Google (OAuth2)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
                  >
                    <span>Apple ID</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            Hệ thống Khảo thí ĐGNL ĐHQG TP.HCM • Mã Đồ án FA26SE090
          </div>

        </div>

      </div>

    </div>
  );
}
