import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  PhoneCall, 
  UserCheck, 
  GraduationCap, 
  Users, 
  User, 
  X,
  Lock,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle,
  School,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import authService from '../../services/authService';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [role, setRole] = useState('student'); // student | parent (for registration)
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration states with separate Email & Phone fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGrade, setRegGrade] = useState('12');
  const [regTargetScore, setRegTargetScore] = useState('900');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);

  // Custom rounded dropdown open states
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  const gradeOptions = [
    { value: '12', label: 'Lớp 12 (Thi 2026)' },
    { value: '11', label: 'Lớp 11 (Chuẩn bị)' },
    { value: 'freelance', label: 'Thí sinh tự do' }
  ];

  const targetOptions = [
    { value: '900', label: '900+ (Bách Khoa/Y)' },
    { value: '800', label: '800+ (KHTN/Kinh Tế)' },
    { value: '700', label: '700+ (Tiêu chuẩn)' }
  ];

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    const hasLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const score = [hasLen, hasUpper, hasLower, hasDigit].filter(Boolean).length;

    if (score <= 1) return { score: 1, label: 'Yếu (Cần ≥8 ký tự)', color: 'bg-rose-500' };
    if (score < 4) return { score: 2, label: 'Ká (Cần 1 chữ hoa, 1 chữ thường, 1 chữ số)', color: 'bg-amber-500' };
    return { score: 3, label: 'Mạnh (Thỏa mãn yêu cầu bảo mật)', color: 'bg-emerald-500' };
  };
  const passStrength = getPasswordStrength(regPassword);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setFormError(null);
    setSubmitSuccessMsg(null);
    setFieldErrors({});
    if (newMode === 'register' && (role === 'teacher' || role === 'manager')) {
      setRole('student');
    }
  };

  const determineRoleFromResponse = (res) => {
    const roles = res?.user?.roles || [];
    if (roles.some(r => r.toLowerCase().includes('teacher') || r.toLowerCase().includes('giaovien'))) return 'teacher';
    if (roles.some(r => r.toLowerCase().includes('manager') || r.toLowerCase().includes('admin') || r.toLowerCase().includes('quanly'))) return 'manager';
    if (roles.some(r => r.toLowerCase().includes('parent') || r.toLowerCase().includes('phuhuynh'))) return 'parent';
    return 'student';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccessMsg(null);

    const errs = {};

    if (mode === 'login') {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail) {
        errs.email = "Vui lòng nhập Email hoặc Số điện thoại.";
      }
      if (!cleanPassword) {
        errs.password = "Vui lòng nhập Mật khẩu.";
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormError("Vui lòng hoàn thiện các thông tin bên dưới.");
        return;
      }
      setFieldErrors({});
      setIsSubmitting(true);

      try {
        const resData = await authService.login({ email: cleanEmail, password: cleanPassword });
        setIsSubmitting(false);
        const targetRole = determineRoleFromResponse(resData);
        onLoginSuccess(targetRole, resData);
        onClose();
      } catch (err) {
        setIsSubmitting(false);
        const errorMsg = err.message || err.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
        setFormError(errorMsg);
      }
    } else {
      const cleanFullName = regFullName.trim();
      const cleanEmail = regEmail.trim();
      const cleanPhone = regPhone.trim().replace(/\s/g, '');
      const cleanPassword = regPassword.trim();
      const cleanConfirmPassword = regConfirmPassword.trim();

      if (!cleanFullName) {
        errs.regFullName = "Vui lòng nhập Họ và tên.";
      }

      if (!cleanEmail) {
        errs.regEmail = "Vui lòng nhập địa chỉ Email.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          errs.regEmail = "Email không đúng định dạng.";
        }
      }

      if (!cleanPhone) {
        errs.regPhone = "Vui lòng nhập Số điện thoại.";
      } else {
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
          errs.regPhone = "SĐT không hợp lệ (10 chữ số).";
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
        errs.regConfirmPassword = "Vui lòng nhập lại mật khẩu.";
      } else if (cleanPassword && cleanPassword !== cleanConfirmPassword) {
        errs.regConfirmPassword = "Mật khẩu xác nhận không khớp.";
      }

      if (!regAgreeTerms) {
        errs.regAgreeTerms = "Vui lòng tích chọn đồng ý Điều khoản.";
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormError("Vui lòng hoàn thiện các trường thông tin bị lỗi bên dưới.");
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
        setSubmitSuccessMsg("Tạo tài khoản thành công!");
        setTimeout(() => {
          onLoginSuccess(role, resData);
          onClose();
        }, 600);
      } catch (err) {
        setIsSubmitting(false);
        let errorMsg = err.message || err.data?.message;
        if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
          errorMsg = err.data.errors.map(e => e.description || e.message).join(' ');
        }
        if (!errorMsg) errorMsg = "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.";
        setFormError(errorMsg);
      }
    }
  };

  const handleQuickDemo = async (demoRole) => {
    let dEmail = 'student@veval.edu.vn';
    let dPass = 'Student@123';
    let dName = 'Minh Hoàng';
    let dRoles = ['Student'];

    if (demoRole === 'teacher') {
      dEmail = 'teacher@veval.edu.vn';
      dPass = 'Teacher@123';
      dName = 'Thầy Phạm Duy';
      dRoles = ['Teacher'];
    } else if (demoRole === 'manager') {
      dEmail = 'manager@veval.edu.vn';
      dPass = 'Manager@123';
      dName = 'Cô Hà Quản Lý';
      dRoles = ['Manager'];
    } else if (demoRole === 'parent') {
      dEmail = 'parent@veval.edu.vn';
      dPass = 'Parent@123';
      dName = 'Phụ Huynh Minh';
      dRoles = ['Parent'];
    }

    try {
      const resData = await authService.login({ email: dEmail, password: dPass });
      const targetRole = determineRoleFromResponse(resData);
      onLoginSuccess(targetRole, resData);
      onClose();
    } catch {
      const demoPayload = {
        accessToken: "eyDemoToken",
        refreshToken: "eyDemoRefresh",
        user: {
          userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          email: dEmail,
          fullName: dName,
          phone: "0912345678",
          avatarUrl: "",
          roles: dRoles
        }
      };
      onLoginSuccess(demoRole, demoPayload);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Branding */}
        <div className="p-5 pb-3 text-center border-b border-slate-100 bg-gradient-to-b from-slate-900 to-indigo-950 text-white relative">
          
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-cyan-300" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>ĐGNL AI Portal</span>
            <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[10px] rounded-full border border-cyan-400/30">v2.4</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Khảo thí & Luyện thi Thích ứng 4.0
          </p>

          {/* Role selector tabbar shown ONLY IN REGISTER MODE */}
          {mode === 'register' && (
            <div className="mt-3 p-1 bg-slate-800/80 rounded-2xl flex items-center gap-1 border border-slate-700 text-xs font-bold text-white">
              <button
                onClick={() => setRole('student')}
                className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  role === 'student' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Học sinh</span>
              </button>

              <button
                onClick={() => setRole('parent')}
                className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  role === 'parent' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Phụ huynh</span>
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-slate-900">
          
          {/* Mode Tabs: Login / Register */}
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => handleModeSwitch('register')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
            </button>
          </div>

          {/* Alert feedback */}
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {submitSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            
            {/* LOGIN MODE */}
            {mode === 'login' ? (
              <>
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
                      placeholder="0912... hoặc email@edu.vn"
                      className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                        fieldErrors.email
                          ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

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
                      placeholder="Nhập mật khẩu"
                      className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                        fieldErrors.password
                          ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Ghi nhớ</span>
                  </label>
                  <a href="#" className="font-bold text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
              </>
            ) : (
              /* REGISTER MODE */
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Họ và tên {role === 'student' ? 'học sinh' : 'phụ huynh'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => {
                        setRegFullName(e.target.value);
                        if (fieldErrors.regFullName) setFieldErrors(prev => ({ ...prev, regFullName: null }));
                      }}
                      placeholder="Ví dụ: Nguyễn Văn Hoàng"
                      className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                        fieldErrors.regFullName
                          ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {fieldErrors.regFullName && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.regFullName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (fieldErrors.regEmail) setFieldErrors(prev => ({ ...prev, regEmail: null }));
                        }}
                        placeholder="name@gmail.com"
                        className={`w-full pl-8 pr-2 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                          fieldErrors.regEmail
                            ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                            : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {fieldErrors.regEmail && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.regEmail}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          if (fieldErrors.regPhone) setFieldErrors(prev => ({ ...prev, regPhone: null }));
                        }}
                        placeholder="0912345678"
                        className={`w-full pl-8 pr-2 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                          fieldErrors.regPhone
                            ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                            : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {fieldErrors.regPhone && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.regPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Grade & Target Grid (DISPLAYED ONLY FOR STUDENT REGISTER, HIDDEN FOR PARENT) */}
                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* CUSTOM ROUNDED GRADE DROPDOWN */}
                    <div className="relative">
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Khối Lớp
                      </label>
                      <button
                        type="button"
                        onClick={() => { setGradeDropdownOpen(!gradeDropdownOpen); setTargetDropdownOpen(false); }}
                        className="w-full pl-7 pr-6 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-left relative"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{gradeOptions.find(o => o.value === regGrade)?.label}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${gradeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {gradeDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 space-y-1"
                          >
                            {gradeOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setRegGrade(opt.value); setGradeDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold transition-all flex items-center justify-between ${
                                  regGrade === opt.value ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {regGrade === opt.value && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CUSTOM ROUNDED TARGET DROPDOWN */}
                    <div className="relative">
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        Mục tiêu ĐGNL
                      </label>
                      <button
                        type="button"
                        onClick={() => { setTargetDropdownOpen(!targetDropdownOpen); setGradeDropdownOpen(false); }}
                        className="w-full pl-7 pr-6 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-left relative"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{targetOptions.find(o => o.value === regTargetScore)?.label}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${targetDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {targetDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 space-y-1"
                          >
                            {targetOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setRegTargetScore(opt.value); setTargetDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold transition-all flex items-center justify-between ${
                                  regTargetScore === opt.value ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {regTargetScore === opt.value && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (fieldErrors.regPassword) setFieldErrors(prev => ({ ...prev, regPassword: null }));
                        }}
                        placeholder="Mật khẩu"
                        className={`w-full pl-3 pr-7 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                          fieldErrors.regPassword
                            ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                            : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.regPassword && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.regPassword}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">
                      Nhập lại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={regShowConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (fieldErrors.regConfirmPassword) setFieldErrors(prev => ({ ...prev, regConfirmPassword: null }));
                        }}
                        placeholder="Nhập lại"
                        className={`w-full pl-3 pr-7 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                          fieldErrors.regConfirmPassword
                            ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                            : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {regShowConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.regConfirmPassword && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.regConfirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Password strength meter */}
                {regPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Độ mạnh mật khẩu:</span>
                      <span className="text-blue-600">{passStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${passStrength.score >= 1 ? passStrength.color : 'bg-slate-200'}`}></div>
                      <div className={`h-full flex-1 ${passStrength.score >= 2 ? passStrength.color : 'bg-slate-200'}`}></div>
                      <div className={`h-full flex-1 ${passStrength.score >= 3 ? passStrength.color : 'bg-slate-200'}`}></div>
                    </div>
                  </div>
                )}

                <div className="pt-0.5">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={regAgreeTerms}
                      onChange={(e) => {
                        setRegAgreeTerms(e.target.checked);
                        if (fieldErrors.regAgreeTerms) setFieldErrors(prev => ({ ...prev, regAgreeTerms: null }));
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Tôi đồng ý với Điều khoản sử dụng.</span>
                  </label>
                  {fieldErrors.regAgreeTerms && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.regAgreeTerms}</span>
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xử lý...</span>
                </span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản học viên mới'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Support Hotline Footer */}
          <div className="text-center pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>Hotline hỗ trợ: <strong className="text-blue-700">1900 8889</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
}
