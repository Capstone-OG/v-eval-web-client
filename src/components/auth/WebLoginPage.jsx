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
  CheckCircle
} from 'lucide-react';

import studentAvatar from '../../assets/vietnamese_student_real.jpg';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import authService from '../../services/authService';
import {
  validateEmailSyntaxAndRules,
  validateEmailComprehensive
} from '../../utils/emailValidator';

export default function WebLoginPage({ initialMode = 'login', onLoginSuccess, onNavigateHome }) {
  const [role, setRole] = useState('student'); // student | parent (for registration)
  const [mode, setMode] = useState(initialMode || 'login'); // login | register

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

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

  // Campuses state from Backend API
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  // Custom rounded dropdown open states
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  // Show/Hide password toggles for registration
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('forgot'); // 'activation' | 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  // Submit Feedback & Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Real-time Email Validation state for Registration
  const [emailValidationStatus, setEmailValidationStatus] = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [emailValidationMessage, setEmailValidationMessage] = useState('');
  const [emailSuggestedFix, setEmailSuggestedFix] = useState(null);

  // Run live email check (syntax + Gmail rules + fake pattern + DNS MX + DB availability)
  const runLiveEmailValidation = async (rawEmailValue) => {
    const trimmed = (rawEmailValue || '').trim();
    if (!trimmed) {
      setEmailValidationStatus('idle');
      setEmailValidationMessage('');
      setEmailSuggestedFix(null);
      return;
    }

    const syncCheck = validateEmailSyntaxAndRules(trimmed);
    if (!syncCheck.isValid) {
      setEmailValidationStatus('invalid');
      setEmailValidationMessage(syncCheck.message);
      setEmailSuggestedFix(syncCheck.suggestedEmail || null);
      setFieldErrors((prev) => ({ ...prev, regEmail: syncCheck.message }));
      return;
    }

    setEmailValidationStatus('checking');
    setEmailSuggestedFix(null);

    const asyncCheck = await validateEmailComprehensive(trimmed, (em) =>
      authService.validateEmail(em)
    );

    if (!asyncCheck.isValid) {
      setEmailValidationStatus('invalid');
      setEmailValidationMessage(asyncCheck.message);
      setEmailSuggestedFix(asyncCheck.suggestedEmail || null);
      setFieldErrors((prev) => ({ ...prev, regEmail: asyncCheck.message }));
    } else {
      setEmailValidationStatus('valid');
      setEmailValidationMessage(
        asyncCheck.message || 'Email hợp lệ (Máy chủ mail MX hoạt động)'
      );
      setEmailSuggestedFix(null);
      setFieldErrors((prev) => ({ ...prev, regEmail: null }));
    }
  };

  // Debounced live validation while typing registration email
  useEffect(() => {
    if (mode !== 'register') return;
    const trimmed = regEmail.trim();
    if (!trimmed) {
      setEmailValidationStatus('idle');
      setEmailValidationMessage('');
      setEmailSuggestedFix(null);
      return;
    }

    const timer = setTimeout(() => {
      runLiveEmailValidation(trimmed);
    }, 550);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regEmail, mode]);

  // Fetch Campuses on Mount
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

  // Dynamic System & Campus Status Ticker on Left Panel
  const liveActivities = campuses.length > 0
    ? campuses.map((c) => `🏫 Đang kết nối trực tuyến: ${c.name} (${c.code || 'ACTIVE'})`)
    : [
        "🔗 Cổng xác thực tập trung V-Eval IAM Gateway (:5212) đang hoạt động.",
        "📐 Hệ thống chấm điểm tâm trắc học IRT 2PL & BKT thời gian thực.",
        "🤖 Gia sư AI Socratic & Đồ thị tri thức tiền đề DAG 4 miền V-ACT."
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
    const roles = res?.user?.roles || res?.roles || [];
    if (roles.some(r => r.toLowerCase().includes('admin') || r.toLowerCase().includes('administrator'))) return 'admin';
    if (roles.some(r => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('giaovien'))) return 'teacher';
    if (roles.some(r => r.toLowerCase().includes('manager') || r.toLowerCase().includes('director') || r.toLowerCase().includes('quanly'))) return 'manager';
    if (roles.some(r => r.toLowerCase().includes('parent') || r.toLowerCase().includes('phuhuynh'))) return 'parent';
    return 'student';
  };

  // Handle Login Submit with Real API Integration
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setSubmitSuccessMsg(null);

    const errs = {};
    if (!email.trim()) {
      errs.email = "Vui lòng nhập Email hoặc Số điện thoại.";
    }
    if (!password) {
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
      const response = await authService.login({ email, password });
      setIsSubmitting(false);

      const loggedUser = response.user || {
        id: response.userId || response.id,
        email: response.email || email,
        fullName: response.fullName || email,
        roles: response.roles || []
      };

      const resolvedRole = authService.resolveAppRole(loggedUser);

      if (onLoginSuccess) {
        onLoginSuccess(resolvedRole, loggedUser);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.warn('[WebLoginPage] Login error:', err);

      // Account not yet activated with OTP
      if (err.data?.error?.code === 'Auth.AccountNotActivated' || err.message?.includes('chưa được kích hoạt')) {
        setModalMode('activation');
        setForgotEmail(email);
        setOtpCode('');
        setModalError(null);
        setModalSuccess('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhập mã OTP 6 số để kích hoạt.');
        setForgotStep(2);
        setIsForgotModalOpen(true);
        setFormError('Tài khoản chưa được kích hoạt OTP. Vui lòng nhập mã OTP 6 số để kích hoạt.');
        return;
      }

      const msg = err.data?.error?.description || err.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.';
      setFormError(msg);
    }
  };

  // Handle Registration Submit with Real API Integration
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setSubmitSuccessMsg(null);

    const errs = {};

    if (!regFullName.trim()) {
      errs.regFullName = "Vui lòng nhập Họ và tên.";
    }

    const syncEmailCheck = validateEmailSyntaxAndRules(regEmail);
    if (!syncEmailCheck.isValid) {
      errs.regEmail = syncEmailCheck.message;
      setEmailValidationStatus('invalid');
      setEmailValidationMessage(syncEmailCheck.message);
      setEmailSuggestedFix(syncEmailCheck.suggestedEmail || null);
    }

    if (!regPhone.trim()) {
      errs.regPhone = "Vui lòng nhập Số điện thoại liên hệ.";
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
      const cleanPhone = regPhone.trim().replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errs.regPhone = "SĐT không hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).";
      }
    }

    if (!regPassword) {
      errs.regPassword = "Vui lòng nhập Mật khẩu.";
    } else if (regPassword.length < 8) {
      errs.regPassword = "Mật khẩu phải chứa ít nhất 8 ký tự.";
    } else if (!/[A-Z]/.test(regPassword) || !/[0-9]/.test(regPassword)) {
      errs.regPassword = "Mật khẩu phải có ít nhất 1 chữ in hoa và 1 chữ số.";
    }

    if (!regConfirmPassword) {
      errs.regConfirmPassword = "Vui lòng nhập lại mật khẩu để xác nhận.";
    } else if (regPassword && regPassword !== regConfirmPassword) {
      errs.regConfirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!regAgreeTerms) {
      errs.regAgreeTerms = "Vui lòng đồng ý với Điều khoản dịch vụ.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(errs.regEmail || "Vui lòng kiểm tra và hoàn thiện chính xác các trường thông tin bên dưới.");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      // BẮT BUỘC kiểm tra toàn diện Email (DNS MX + Chống email ảo + Kiểm tra tồn tại CSDL) trước khi gọi API đăng ký
      setEmailValidationStatus('checking');
      const liveEmailCheck = await validateEmailComprehensive(regEmail.trim(), (em) =>
        authService.validateEmail(em)
      );

      if (!liveEmailCheck.isValid) {
        setIsSubmitting(false);
        setEmailValidationStatus('invalid');
        setEmailValidationMessage(liveEmailCheck.message);
        setEmailSuggestedFix(liveEmailCheck.suggestedEmail || null);
        setFieldErrors({ regEmail: liveEmailCheck.message });
        setFormError(liveEmailCheck.message);
        return;
      }

      setEmailValidationStatus('valid');
      setEmailValidationMessage(liveEmailCheck.message);

      const payload = {
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        roleName: role === 'parent' ? 'PARENT' : 'STUDENT',
        campusId: selectedCampusId || (campuses[0]?.campusId || campuses[0]?.id)
      };

      await authService.register(payload);
      setIsSubmitting(false);

      // Open OTP verification step in modal without auto-filling OTP
      setModalMode('activation');
      setForgotEmail(regEmail.trim());
      setOtpCode(''); // Empty input field so user must enter OTP from email
      setModalError(null);
      setModalSuccess(
        "Đã kiểm tra email hợp lệ! Mã xác thực OTP 6 chữ số đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư và nhập mã OTP để xác minh tài khoản."
      );
      setForgotStep(2);
      setIsForgotModalOpen(true);
    } catch (err) {
      setIsSubmitting(false);
      console.warn('[WebLoginPage] Register error:', err);
      const msg =
        err.data?.error?.description ||
        err.data?.errors?.[0]?.description ||
        err.data?.message ||
        err.message ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
      setFormError(msg);
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('tên miền') || msg.toLowerCase().includes('gmail')) {
        setEmailValidationStatus('invalid');
        setFieldErrors((prev) => ({ ...prev, regEmail: msg }));
      }
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

  // Forgot password & Account activation submit handler with Real API Integration
  const handleForgotSubmit = async (e) => {
    if (e) e.preventDefault();
    setModalError(null);
    setModalSuccess(null);
    setIsSubmitting(true);

    try {
      if (forgotStep === 1) {
        const cleanEmail = (forgotEmail || '').trim();
        if (!cleanEmail) {
          setIsSubmitting(false);
          setModalError("Vui lòng nhập địa chỉ Email tài khoản.");
          return;
        }
        // Gọi API forgot-password để kiểm tra email tồn tại và gửi mã OTP
        await authService.forgotPassword(cleanEmail);
        setIsSubmitting(false);
        setOtpCode('');
        setModalSuccess(`Đã kiểm tra tài khoản thành công! Mã OTP xác thực đặt lại mật khẩu đã được gửi đến email ${cleanEmail}. Vui lòng kiểm tra hộp thư.`);
        setForgotStep(2);
      } else if (forgotStep === 2) {
        if (!otpCode || otpCode.trim().length !== 6) {
          setIsSubmitting(false);
          setModalError("Vui lòng nhập đầy đủ mã xác thực OTP gồm 6 chữ số.");
          return;
        }
        if (modalMode === 'activation') {
          // Activation flow for registration
          await authService.verifyOtp(forgotEmail.trim(), otpCode.trim());
          setIsSubmitting(false);
          setModalSuccess("Xác thực và kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.");
          setForgotStep(4);
        } else {
          // Forgot password flow: BẮT BUỘC KIỂM TRA MÃ OTP VỚI BACKEND TRƯỚC KHI CHO QUA BƯỚC 3!
          await authService.verifyResetOtp(forgotEmail.trim(), otpCode.trim());
          setIsSubmitting(false);
          setModalError(null);
          setModalSuccess(null);
          setNewPassword('');
          setConfirmPassword('');
          setForgotStep(3);
        }
      } else if (forgotStep === 3) {
        if (!newPassword || newPassword.length < 8) {
          setIsSubmitting(false);
          setModalError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
          return;
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
          setIsSubmitting(false);
          setModalError("Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số (VD: Password123@).");
          return;
        }
        if (newPassword !== confirmPassword) {
          setIsSubmitting(false);
          setModalError("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
          return;
        }
        await authService.resetPassword({
          email: forgotEmail.trim(),
          otpCode: otpCode.trim(),
          newPassword,
          confirmPassword
        });
        setIsSubmitting(false);
        setModalSuccess("Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.");
        setForgotStep(4);
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.data?.error?.description || err.message || 'Thao tác không thành công. Vui lòng kiểm tra lại.';
      setModalError(msg);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    setModalError(null);
    try {
      if (modalMode === 'activation') {
        setModalSuccess('Đã gửi lại mã OTP kích hoạt đến email ' + forgotEmail);
      } else {
        await authService.forgotPassword(forgotEmail.trim());
        setModalSuccess('Đã gửi lại mã OTP đặt lại mật khẩu mới đến email ' + forgotEmail);
      }
    } catch (err) {
      const msg = err.data?.error?.description || err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
      setModalError(msg);
      throw err;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-[#FACC15] selection:text-slate-950">

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
                <span className="w-2 h-2 rounded-full bg-[#FACC15] ring-4 ring-yellow-400/20 animate-pulse"></span>
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
                  onOpenForgotPassword={() => {
                    setModalMode('forgot');
                    setForgotEmail('');
                    setOtpCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setModalError(null);
                    setModalSuccess(null);
                    setForgotStep(1);
                    setIsForgotModalOpen(true);
                  }}
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
                  campuses={campuses}
                  selectedCampusId={selectedCampusId}
                  setSelectedCampusId={setSelectedCampusId}
                  campusDropdownOpen={campusDropdownOpen}
                  setCampusDropdownOpen={setCampusDropdownOpen}
                  isSubmitting={isSubmitting}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                  handleRegisterSubmit={handleRegisterSubmit}
                  emailValidationStatus={emailValidationStatus}
                  emailValidationMessage={emailValidationMessage}
                  emailSuggestedFix={emailSuggestedFix}
                  onEmailBlur={(val) => runLiveEmailValidation(val)}
                  onApplySuggestedEmail={(suggested) => {
                    setRegEmail(suggested);
                    setEmailSuggestedFix(null);
                    setFieldErrors((prev) => ({ ...prev, regEmail: null }));
                    runLiveEmailValidation(suggested);
                  }}
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setModalError(null);
          setModalSuccess(null);
        }}
        modalMode={modalMode}
        forgotStep={forgotStep}
        setForgotStep={setForgotStep}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handleForgotSubmit={handleForgotSubmit}
        isSubmitting={isSubmitting}
        modalError={modalError}
        modalSuccess={modalSuccess}
        onResendOtp={handleResendOtp}
      />

    </div>
  );
}
