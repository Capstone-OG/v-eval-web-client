import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  Target, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle,
  Building2 
} from 'lucide-react';

export default function RegisterForm({
  role,
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regPhone,
  setRegPhone,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  regGrade,
  setRegGrade,
  regTargetScore,
  setRegTargetScore,
  regAgreeTerms,
  setRegAgreeTerms,
  gradeDropdownOpen,
  setGradeDropdownOpen,
  targetDropdownOpen,
  setTargetDropdownOpen,
  regShowPassword,
  setRegShowPassword,
  regShowConfirmPassword,
  setRegShowConfirmPassword,
  passStrength,
  gradeOptions,
  targetOptions,
  campuses = [],
  selectedCampusId,
  setSelectedCampusId,
  campusDropdownOpen,
  setCampusDropdownOpen,
  isSubmitting,
  fieldErrors,
  setFieldErrors,
  handleRegisterSubmit
}) {
  return (
    <form onSubmit={handleRegisterSubmit} className="space-y-3" noValidate>
      
      {/* Full Name */}
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
            className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
              fieldErrors.regFullName
                ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
            }`}
          />
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {fieldErrors.regFullName && (
          <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{fieldErrors.regFullName}</span>
          </p>
        )}
      </div>

      {/* SEPARATE EMAIL & PHONE FIELDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Địa chỉ Email <span className="text-rose-500">*</span>
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
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.regEmail
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.regPhone
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
              className="w-full pl-8 pr-7 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-left relative"
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
              className="w-full pl-8 pr-7 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-left relative"
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

      {/* Cơ Sở Đào Tạo (Campuses from Backend API) */}
      {campuses && campuses.length > 0 && (
        <div className="relative">
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Cơ sở Đào tạo <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (setCampusDropdownOpen) setCampusDropdownOpen(!campusDropdownOpen);
              if (setGradeDropdownOpen) setGradeDropdownOpen(false);
              if (setTargetDropdownOpen) setTargetDropdownOpen(false);
            }}
            className="w-full pl-8 pr-7 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs text-left relative"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {campuses.find(c => (c.campusId || c.id) === selectedCampusId)?.name || 'Chọn cơ sở theo học'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${campusDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {campusDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 space-y-1 max-h-48 overflow-y-auto"
              >
                {campuses.map((camp) => {
                  const cid = camp.campusId || camp.id;
                  const isSelected = selectedCampusId === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => {
                        if (setSelectedCampusId) setSelectedCampusId(cid);
                        if (setCampusDropdownOpen) setCampusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl font-bold transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{camp.name}</div>
                        {camp.address && <div className="text-[10px] text-slate-400 font-normal truncate">{camp.address}</div>}
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Password & Confirm Password */}
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
              className={`w-full pl-8 pr-7 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.regPassword
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setRegShowPassword(!regShowPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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
            Nhập lại mật khẩu <span className="text-rose-500">*</span>
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
              className={`w-full pl-8 pr-7 py-2 text-xs rounded-xl focus:outline-none transition-all font-semibold ${
                fieldErrors.regConfirmPassword
                  ? 'bg-rose-50/50 border border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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

      {/* Terms Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer font-medium leading-tight">
          <input 
            type="checkbox" 
            checked={regAgreeTerms}
            onChange={(e) => {
              setRegAgreeTerms(e.target.checked);
              if (fieldErrors.regAgreeTerms) setFieldErrors(prev => ({ ...prev, regAgreeTerms: null }));
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5" 
          />
          <span>Tôi đồng ý với <strong className="text-blue-600">Điều khoản dịch vụ</strong> & <strong className="text-blue-600">Chính sách bảo mật</strong> của Cổng ĐGNL AI.</span>
        </label>
        {fieldErrors.regAgreeTerms && (
          <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-fade">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{fieldErrors.regAgreeTerms}</span>
          </p>
        )}
      </div>

      {/* Submit Register Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 mt-1"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Đang kiểm tra & khởi tạo...</span>
          </span>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tạo Tài Khoản & Mở Lộ Trình ZPD</span>
          </>
        )}
      </button>

    </form>
  );
}
