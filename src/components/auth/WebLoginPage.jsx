import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  PhoneCall,
  GraduationCap,
  Users,
  CheckCircle2,
  Flame,
  Award,
  BookOpenCheck,
  Zap,
  Bot,
  ArrowLeft,
  Lock,
  User,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import studentAvatar from '../../assets/vietnamese_student_real.jpg';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import authService from '../../services/authService';

export default function WebLoginPage({ onLoginSuccess, onNavigateHome }) {
  const [role, setRole] = useState('student'); // student | parent (for registration)
  const [mode, setMode] = useState('login'); // login | register

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGrade, setRegGrade] = useState('12');
  const [regTargetScore, setRegTargetScore] = useState('900');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // Custom rounded dropdown open states
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  // Show/Hide password toggles for registration
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);

  // Forgot Password & Activation Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [isActivationMode, setIsActivationMode] = useState(false);

  // Toast Notification state
  const [toastInfo, setToastInfo] = useState(null);

  // Submit Feedback & Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Grade & Target Options
  const gradeOptions = [
    { value: '12', label: 'Lớp 12 (Thi 2026)' },
    { value: '11', label: 'Lớp 11 (Chuẩn bị)' },
    { value: 'freelance', label: 'Thí sinh tự do' }
  ];

  const targetOptions = [
    { value: '900', label: '900+ (Bách Khoa/Y Dược)' },
    { value: '800', label: '800+ (KHTN/Kinh Tế)' },
    { value: '700', label: '700+ (Tiêu chuẩn)' }
  ];

  // Live Activity Ticker on Left Panel
  const liveActivities = [
    "🔥 Bạn Nguyễn Hoàng A. vừa làm bài test chẩn đoán: 945 / 1200 điểm!",
    "⚡ 84 học sinh 2k8 vừa đăng ký khóa Luyện thi ĐGNL ĐHQG TP.HCM.",
    "🤖 AI Socratic Tutor vừa tự động sửa bài tập Logic cho 12 bạn.",
    "🎯 94% học sinh sau khi đăng ký đạt tăng trung bình +75 điểm."
  ];
  const [actIdx, setActIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActIdx((prev) => (prev + 1) % liveActivities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveActivities.length]);

  // Mode Switch Handler
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setFormError(null);
    setSubmitSuccessMsg(null);
    setFieldErrors({});
    if (newMode === 'register' && (role === 'teacher' || role === 'manager')) {
      setRole('student');
    }
  };

  // Determine App Role from BE roles array response
  const determineRoleFromResponse = (res) => {
    const roles = res?.user?.roles || [];
    if (roles.some(r => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('giaovien'))) return 'teacher';
    if (roles.some(r => r.toLowerCase().includes('manager') || r.toLowerCase().includes('admin') || r.toLowerCase().includes('quanly'))) return 'manager';
    if (roles.some(r => r.toLowerCase().includes('parent') || r.toLowerCase().includes('phuhuynh'))) return 'parent';
    return 'student';
  };

  // Restore remembered email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('veval_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle Login Submit using Real API Gateway Call
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const errs = {};
    if (!cleanEmail) {
      errs.email = "Vui lòng nhập Email.";
    }
    if (!cleanPassword) {
      errs.password = "Vui lòng nhập Mật khẩu.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError("Vui lòng nhập đầy đủ thông tin bên dưới.");
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const resData = await authService.login({ email: cleanEmail, password: cleanPassword, rememberMe });
      setIsSubmitting(false);

      if (rememberMe) {
        localStorage.setItem('veval_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('veval_remembered_email');
      }

      const userRole = determineRoleFromResponse(resData);
      setSubmitSuccessMsg("Xác thực đăng nhập thành công!");
      setTimeout(() => {
        onLoginSuccess(userRole, resData);
      }, 400);
    } catch (err) {
      setIsSubmitting(false);
      console.warn('[WebLoginPage] Login API error:', err);

      // Handle unactivated account error
      if (err.data?.code === 'Auth.AccountNotActivated' || err.status === 403) {
        setFormError("Tài khoản chưa được kích hoạt. Vui lòng nhập mã OTP để kích hoạt.");
        setForgotEmail(cleanEmail);
        setIsActivationMode(true);
        setIsForgotModalOpen(true);
        setForgotStep(2);
        return;
      }

      const errorMsg = err.message || err.data?.message || "Thông tin đăng nhập email hoặc mật khẩu không chính xác.";
      setFormError(errorMsg);
    }
  };

  // Handle Registration Submit with full field checks using Real API
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccessMsg(null);

    const cleanFullName = regFullName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim().replace(/\s/g, '');
    const cleanPassword = regPassword.trim();
    const cleanConfirmPassword = regConfirmPassword.trim();

    const errs = {};

    if (!cleanFullName) {
      errs.regFullName = "Vui lòng nhập Họ và tên.";
    }

    if (!cleanEmail) {
      errs.regEmail = "Vui lòng nhập địa chỉ Email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        errs.regEmail = "Email không đúng định dạng (ví dụ: name@gmail.com).";
      }
    }

    if (!cleanPhone) {
      errs.regPhone = "Vui lòng nhập Số điện thoại liên hệ.";
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errs.regPhone = "SĐT không hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).";
      }
    }

    if (!cleanPassword) {
      errs.regPassword = "Vui lòng nhập Mật khẩu.";
    } else {
      const pwdErrs = [];
      if (cleanPassword.length < 8) pwdErrs.push("ít nhất 8 ký tự");
      if (!/[A-Z]/.test(cleanPassword)) pwdErrs.push("1 chữ hoa");
      if (!/[a-z]/.test(cleanPassword)) pwdErrs.push("1 chữ thường");
      if (!/[0-9]/.test(cleanPassword)) pwdErrs.push("1 chữ số");
      if (pwdErrs.length > 0) {
        errs.regPassword = `Mật khẩu yêu cầu: ${pwdErrs.join(', ')}.`;
      }
    }

    if (!cleanConfirmPassword) {
      errs.regConfirmPassword = "Vui lòng nhập lại mật khẩu để xác nhận.";
    } else if (cleanPassword && cleanPassword !== cleanConfirmPassword) {
      errs.regConfirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!regAgreeTerms) {
      errs.regAgreeTerms = "Vui lòng đồng ý với Điều khoản dịch vụ.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError("Vui lòng hoàn thiện các trường thông tin bị thiếu bên dưới.");
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const targetRoleName = role === 'parent' ? 'PARENT' : 'STUDENT';

    try {
      const resData = await authService.register({
        email: cleanEmail,
        password: cleanPassword,
        fullName: cleanFullName,
        phone: cleanPhone,
        roleName: targetRoleName
      });
      setIsSubmitting(false);

      const returnedOtp = resData?.otpCode || "436637";
      const msg = resData?.message || "Đăng ký thành công. Vui lòng xác thực tài khoản bằng mã OTP đã được gửi.";
      
      // Save demo OTP code to localStorage for easy retrieval
      localStorage.setItem('demo_otp_code', returnedOtp);
      localStorage.setItem('demo_otp_email', cleanEmail);
      setDemoOtpCode(returnedOtp);
      setSubmitSuccessMsg(msg);

      // Trigger Toast notification
      setToastInfo({
        title: "Đăng Ký Thành Công!",
        message: msg,
        otp: returnedOtp
      });

      // Auto pop-up OTP Verification Modal
      setTimeout(() => {
        setForgotEmail(cleanEmail);
        setOtpCode(returnedOtp);
        setIsActivationMode(true);
        setIsForgotModalOpen(true);
        setForgotStep(2);
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      console.warn('[WebLoginPage] Register API error:', err);
      let errorMsg = err.message || err.data?.message;
      if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
        errorMsg = err.data.errors.map(e => e.description || e.message).join(' ');
      }
      if (!errorMsg) errorMsg = "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.";
      setFormError(errorMsg);
    }
  };

  // Quick Demo Login Handler (connects to real API with dev fallback)
  const handleQuickDemo = async (demoRole) => {
    let demoEmail = 'student@veval.edu.vn';
    let demoPass = 'Student@123';
    let demoName = 'Nguyễn Minh Hoàng';
    let demoRoleArray = ['Student'];

    if (demoRole === 'student') {
      demoEmail = 'student@veval.edu.vn';
      demoPass = 'Student@123';
      demoName = 'Minh Hoàng';
      demoRoleArray = ['Student'];
    } else if (demoRole === 'teacher') {
      demoEmail = 'teacher@veval.edu.vn';
      demoPass = 'Teacher@123';
      demoName = 'Thầy Phạm Duy';
      demoRoleArray = ['Teacher'];
    } else if (demoRole === 'manager') {
      demoEmail = 'manager@veval.edu.vn';
      demoPass = 'Manager@123';
      demoName = 'Cô Hà Quản Lý';
      demoRoleArray = ['Manager'];
    } else if (demoRole === 'parent') {
      demoEmail = 'parent@veval.edu.vn';
      demoPass = 'Parent@123';
      demoName = 'Phụ Huynh Minh';
      demoRoleArray = ['Parent'];
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);

    try {
      const resData = await authService.login({ email: demoEmail, password: demoPass });
      setIsSubmitting(false);
      const targetRole = determineRoleFromResponse(resData);
      onLoginSuccess(targetRole, resData);
    } catch {
      setIsSubmitting(false);
      const demoResponse = {
        accessToken: "eyDemoAccessToken_DevOnly",
        refreshToken: "eyDemoRefreshToken_DevOnly",
        user: {
          userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          email: demoEmail,
          fullName: demoName,
          phone: "0912345678",
          avatarUrl: studentAvatar,
          roles: demoRoleArray
        }
      };
      onLoginSuccess(demoRole, demoResponse);
    }
  };

  // Password strength score
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    if (pass.length < 10 || !/\d/.test(pass)) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, label: 'Mạnh (Tối ưu)', color: 'bg-emerald-500' };
  };
  const passStrength = getPasswordStrength(regPassword);

  // Forgot password & OTP verification submit handler via Real API
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (forgotStep === 1) {
      if (!forgotEmail) return;
      setIsSubmitting(true);
      try {
        const resData = await authService.forgotPassword(forgotEmail.trim());
        setIsSubmitting(false);

        const returnedOtp = resData?.otpCode || "396652";
        const msg = resData?.message || "Mã xác thực OTP đặt lại mật khẩu đã được gửi đến email của bạn.";

        localStorage.setItem('demo_otp_code', returnedOtp);
        setDemoOtpCode(returnedOtp);
        setOtpCode(returnedOtp);

        setToastInfo({
          title: "Mã OTP Đặt Lại Mật Khẩu!",
          message: msg,
          otp: returnedOtp
        });

        setForgotStep(2);
      } catch (err) {
        setIsSubmitting(false);
        let errorMsg = err.message || err.data?.message;
        if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
          errorMsg = err.data.errors.map(e => e.description || e.message).join(' ');
        }
        if (!errorMsg) errorMsg = "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra lại email.";

        setFormError(errorMsg);
        setToastInfo({
          title: "Yêu Cầu Thất Bại!",
          message: errorMsg,
          type: "error"
        });
      }
    } else if (forgotStep === 2) {
      if (!otpCode) return;
      setIsSubmitting(true);

      if (isActivationMode) {
        // Account Activation Flow
        try {
          await authService.verifyOtp(forgotEmail.trim(), otpCode.trim());
          setIsSubmitting(false);

          setToastInfo({
            title: "Xác Thực Kích Hoạt Thành Công!",
            message: "Tài khoản đã được kích hoạt. Đang vào trang chủ...",
            type: "success"
          });

          try {
            const loginRes = await authService.login({ 
              email: forgotEmail.trim(), 
              password: regPassword || 'Student@123',
              rememberMe
            });
            const userRole = determineRoleFromResponse(loginRes);
            setTimeout(() => {
              setIsForgotModalOpen(false);
              onLoginSuccess(userRole, loginRes);
            }, 600);
            return;
          } catch {
            setTimeout(() => {
              setIsForgotModalOpen(false);
              onNavigateHome();
            }, 600);
            return;
          }
        } catch (err) {
          setIsSubmitting(false);
          let errorMsg = err.message || err.data?.message;
          if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
            errorMsg = err.data.errors.map(e => e.description || e.message).join(' ');
          }
          if (!errorMsg) errorMsg = "Mã OTP không chính xác hoặc đã hết hạn.";

          setFormError(errorMsg);
          setToastInfo({
            title: "Xác Thực OTP Thất Bại!",
            message: errorMsg,
            type: "error"
          });
        }
      } else {
        // Password Reset Flow: Advance to Step 3 (New Password Input)
        setIsSubmitting(false);
        setForgotStep(3);
      }
    } else if (forgotStep === 3) {
      if (!newPassword) return;
      setIsSubmitting(true);
      try {
        await authService.resetPassword({
          email: forgotEmail.trim(),
          otpCode: otpCode.trim(),
          newPassword: newPassword.trim()
        });
        setIsSubmitting(false);

        setToastInfo({
          title: "Đổi Mật Khẩu Thành Công!",
          message: "Tài khoản của bạn đã được cập nhật mật khẩu mới. Đang tự động đăng nhập...",
          type: "success"
        });

        // Automatically log in with new password and redirect straight to Home Page
        try {
          const loginRes = await authService.login({
            email: forgotEmail.trim(),
            password: newPassword.trim(),
            rememberMe: true
          });
          const userRole = determineRoleFromResponse(loginRes);
          setTimeout(() => {
            setIsForgotModalOpen(false);
            onLoginSuccess(userRole, loginRes);
          }, 600);
        } catch {
          setTimeout(() => {
            setMode('login');
            setEmail(forgotEmail.trim());
            setIsForgotModalOpen(false);
            onNavigateHome();
          }, 600);
        }
      } catch (err) {
        setIsSubmitting(false);
        let errorMsg = err.message || err.data?.message;
        if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
          errorMsg = err.data.errors.map(e => e.description || e.message).join(' ');
        }
        if (!errorMsg) errorMsg = "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã OTP hoặc thử lại.";

        setFormError(errorMsg);
        setToastInfo({
          title: "Đặt Lại Mật Khẩu Thất Bại!",
          message: errorMsg,
          type: "error"
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">

      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all shadow-xs">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo & Brand Name */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-sm group-hover:scale-105 transition-transform">
              ĐG
            </div>
            <div>
              <div className="font-black text-xl tracking-tight text-slate-950 flex items-center gap-1.5">
                <span>ĐGNL AI</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider">
                Khảo thí & Luyện thi ĐGNL ĐHQG-HCM 4.0
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>Hotline Tư Vấn: <strong className="text-blue-900">1900 8889</strong></span>
            </div>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl border border-slate-200/80 transition-all active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Quay lại Trang Chủ</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CENTER CONTENT CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">

        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-blue-400/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] border border-slate-200/90 text-slate-900 z-10">

          {/* LEFT COLUMN (7 Spans): Light Academic Showcase & Real Authentic Student Photo */}
          <div className="lg:col-span-7 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-cyan-50/40 p-8 lg:p-12 text-slate-900 flex flex-col justify-between relative overflow-hidden border-r border-slate-200/80">

            {/* Ambient inner highlights */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none"></div>

            {/* Top Brand Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-blue-200/80 shadow-sm flex items-center justify-center text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                    Cổng Khảo Thí ĐGNL <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-200 font-bold">v2.4 Live</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Mô hình Khảo thí IRT 3PL & Thuật toán DAG Topo
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Title & Authentic Student Photo Showcase */}
            <div className="relative z-10 my-auto py-6 space-y-6">

              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 text-xs font-bold text-blue-700 shadow-2xs">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Chiến dịch Ôn thi ĐGNL ĐHQG TP.HCM 2026</span>
                </span>

                <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900">
                  Khám phá Năng lực & <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">Bứt phá 900+ Điểm</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                  Đo lường chính xác ma trận 120 câu hỏi ĐGNL bằng thuật toán khảo thí thích ứng CAT, lấp lỗ hổng tức thì cùng AI Socratic Tutor.
                </p>
              </div>

              {/* REAL AUTHENTIC STUDENT PHOTO CONTAINER */}
              <div className="relative max-w-md mx-auto group">

                {/* Outer Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                {/* Card Container */}
                <div className="relative bg-white border border-slate-200/90 rounded-3xl p-3 shadow-xl transition-all duration-500 transform group-hover:scale-[1.01]">

                  {/* Real Student Photograph */}
                  <div className="relative overflow-hidden rounded-2xl h-60 sm:h-64 w-full">
                    <img
                      src={studentAvatar}
                      alt="Học sinh THPT Việt Nam ôn thi ĐGNL"
                      className="w-full h-full object-cover object-center filter drop-shadow-md transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80"></div>

                    {/* FLOATING STATS BADGES */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <div className="px-3 py-1.5 bg-white/95 border border-slate-200 backdrop-blur-md rounded-xl text-slate-900 text-xs font-black shadow-lg flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>IRT Theta: +0.65</span>
                      </div>

                      <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>82% Bách Khoa HCM</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Real-time Ticker */}
              <div className="bg-white border border-blue-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs font-semibold text-slate-800 shadow-2xs">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={actIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="truncate text-slate-800 font-bold"
                  >
                    {liveActivities[actIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Feature Bullet List */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Test chẩn đoán 15 phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Lộ trình ZPD cá nhân hoá</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>AI Socratic gợi mở 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Q&A giải đề trực tuyến</span>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (5 Spans): Form Column */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white relative">

            <div className="space-y-5">

              {/* Header Mode Switcher: Login / Register */}
              <div className="space-y-4">
                <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
                  <button
                    onClick={() => handleModeSwitch('login')}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${mode === 'login'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Đăng nhập</span>
                  </button>

                  <button
                    onClick={() => handleModeSwitch('register')}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${mode === 'register'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Đăng ký mới</span>
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản Mới'}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {mode === 'login'
                      ? 'Nhập Email hoặc Số điện thoại và Mật khẩu để đăng nhập.'
                      : 'Đăng ký tài khoản dành cho Học sinh và Phụ huynh.'}
                  </p>
                </div>
              </div>

              {/* Role Selection Switcher (Register mode: Student vs Parent) */}
              {mode === 'register' && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>BẠN LÀ:</span>
                    <span className="text-blue-600 font-bold">
                      {role === 'student' ? 'Học sinh 2k8/2k9' : 'Phụ huynh'}
                    </span>
                  </div>

                  <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${role === 'student' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Học sinh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('parent')}
                      className={`flex-1 py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 ${role === 'parent' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Phụ huynh</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form Alert Feedback */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade">
                  <X className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {submitSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              {/* Form Views: Login vs Register */}
              {mode === 'login' ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  isSubmitting={isSubmitting}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                  handleLoginSubmit={handleLoginSubmit}
                  handleQuickDemo={handleQuickDemo}
                  onOpenForgotPassword={() => { setIsForgotModalOpen(true); setForgotStep(1); }}
                />
              ) : (
                <RegisterForm
                  role={role}
                  regFullName={regFullName}
                  setRegFullName={setRegFullName}
                  regEmail={regEmail}
                  setRegEmail={setRegEmail}
                  regPhone={regPhone}
                  setRegPhone={setRegPhone}
                  regPassword={regPassword}
                  setRegPassword={setRegPassword}
                  regConfirmPassword={regConfirmPassword}
                  setRegConfirmPassword={setRegConfirmPassword}
                  regGrade={regGrade}
                  setRegGrade={setRegGrade}
                  regTargetScore={regTargetScore}
                  setRegTargetScore={setRegTargetScore}
                  regAgreeTerms={regAgreeTerms}
                  setRegAgreeTerms={setRegAgreeTerms}
                  gradeDropdownOpen={gradeDropdownOpen}
                  setGradeDropdownOpen={setGradeDropdownOpen}
                  targetDropdownOpen={targetDropdownOpen}
                  setTargetDropdownOpen={setTargetDropdownOpen}
                  regShowPassword={regShowPassword}
                  setRegShowPassword={setRegShowPassword}
                  regShowConfirmPassword={regShowConfirmPassword}
                  setRegShowConfirmPassword={setRegShowConfirmPassword}
                  passStrength={passStrength}
                  gradeOptions={gradeOptions}
                  targetOptions={targetOptions}
                  isSubmitting={isSubmitting}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                  handleRegisterSubmit={handleRegisterSubmit}
                />
              )}

            </div>

            {/* Bottom Footer Note */}
            <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
              Hệ thống Bảo mật 256-bit • Hỗ trợ học viên 24/7
            </div>

          </div>

        </div>

      </main>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 max-w-md bg-white border rounded-2xl p-4 shadow-2xl flex items-start gap-3 text-slate-900 ${
              toastInfo.type === 'error' ? 'border-rose-300' : 'border-emerald-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              toastInfo.type === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {toastInfo.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-black text-sm ${toastInfo.type === 'error' ? 'text-rose-950' : 'text-slate-900'}`}>
                  {toastInfo.title}
                </h4>
                <button
                  onClick={() => setToastInfo(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-xs font-semibold leading-relaxed ${toastInfo.type === 'error' ? 'text-rose-700' : 'text-slate-600'}`}>
                {toastInfo.message}
              </p>
              {toastInfo.otp && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">🔑 Mã OTP Demo:</span>
                  <code className="px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-950 font-mono font-black rounded-lg tracking-widest text-sm">
                    {toastInfo.otp}
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password & Activation Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        forgotStep={forgotStep}
        setForgotStep={setForgotStep}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        handleForgotSubmit={handleForgotSubmit}
        demoOtpCode={demoOtpCode}
        isActivationMode={isActivationMode}
      />

    </div>
  );
}
