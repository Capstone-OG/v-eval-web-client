import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  KeyRound,
  ArrowRight,
  X,
  Clock,
  FileText,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  LogIn,
  Sparkles
} from 'lucide-react';
import { tokenStorage } from '../../services/apiClient';

export default function DiagnosticExamModal({
  isOpen,
  onClose,
  onStartExam,
  currentUser = null,
  isLoggedIn: isLoggedInProp = undefined,
  onNavigateAuth = null,
  cancelLabel = null
}) {
  const [examPasscode, setExamPasscode] = useState('VACT2026');
  const [passcodeError, setPasscodeError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  if (!isOpen) return null;

  // Xác định trạng thái đăng nhập:
  // 1. Ưu tiên cao nhất prop isLoggedIn nếu caller truyền vào (true/false)
  // 2. Nếu không truyền prop: chỉ coi là đăng nhập khi có accessToken hợp lệ VÀ currentUser hợp lệ
  const token = tokenStorage.getAccessToken();
  const activeUser = currentUser || tokenStorage.getUser();
  const hasValidAuth = Boolean(token && activeUser && (activeUser.id || activeUser.userId));

  const isLoggedIn = typeof isLoggedInProp === 'boolean'
    ? isLoggedInProp
    : (currentUser ? hasValidAuth : false);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = (examPasscode || '').trim().toUpperCase();
    if (!clean) {
      setPasscodeError('Vui lòng nhập mã phòng thi (hoặc dùng mã mặc định VACT2026)!');
      return;
    }
    if (clean !== 'VACT2026') {
      setPasscodeError("Mã phòng thi không chính xác! Vui lòng dùng mã 'VACT2026'.");
      return;
    }
    setPasscodeError('');
    onStartExam?.(clean);
  };

  const handleAuthRedirect = (authMode) => {
    const clean = (examPasscode || '').trim().toUpperCase() || 'VACT2026';
    try {
      sessionStorage.setItem('veval_pending_exam_intent', JSON.stringify({
        examId: '11111111-1111-1111-1111-111111111111',
        examCode: clean,
        title: 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu Chẩn Đoán)',
        autoStart: true,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Cannot save session intent', err);
    }
    setPasscodeError('');
    onClose?.();
    const noticeText = authMode === 'register'
      ? '🎯 Đăng ký tài khoản để hệ thống lưu kết quả khảo sát 30 câu và tự động kích hoạt Lộ Trình Học Thích Ứng (Flow 2)!'
      : '🎯 Đăng nhập để tiếp tục làm bài khảo sát năng lực 30 câu và lưu kết quả vào học bạ cá nhân!';
    onNavigateAuth?.({ mode: authMode, notice: noticeText });
  };

  const handleNavigateAuthWithIntent = handleAuthRedirect;

  const handleClose = () => {
    setPasscodeError('');
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-900"
          >
            {/* Modal Top Gradient Header with Glow */}
            <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-2 mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-black text-[#FACC15] uppercase tracking-wider backdrop-blur-xs">
                    <Zap className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                    <span>{isLoggedIn ? 'Kiểm Tra Năng Lực Đầu Vào' : 'Khảo Thí Đầu Vào Chuẩn Hóa'}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {isLoggedIn ? 'Kiểm Tra Năng Lực Đầu Vào V-ACT' : 'Khảo Sát Năng Lực Đầu Vào V-ACT'}
                  </h2>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {isLoggedIn
                      ? <>Bộ đề chuẩn hóa 30 câu đa miền đánh giá chính xác tham số năng lực khởi điểm IRT 2PL <strong className="text-[#FACC15] font-bold">Theta (θ₀)</strong>, xếp lớp vi mô và tự động sinh Lộ Trình Học Thích Ứng (Flow 2 - DAG).</>
                      : <>Bộ đề chuẩn hóa 30 câu đa miền đánh giá chính xác tham số năng lực khởi điểm IRT 2PL <strong className="text-[#FACC15] font-bold">Theta (θ₀)</strong>. Bạn có thể vào thi ngay (chế độ khách) hoặc đăng nhập để lưu kết quả và kích hoạt Lộ trình học.</>
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
              {/* 4 Specs Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-800">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Clock className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[11px] text-slate-500 font-bold">Thời gian</span>
                  <strong className="text-xs font-black text-slate-900">45 Phút</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <FileText className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="text-[11px] text-slate-500 font-bold">Số câu hỏi</span>
                  <strong className="text-xs font-black text-slate-900">30 Câu</strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Layers className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="text-[11px] text-slate-500 font-bold">Phạm vi</span>
                  <strong className="text-xs font-black text-slate-900">5 Miền thi</strong>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[11px] text-emerald-700 font-bold">Mô hình</span>
                  <strong className="text-xs font-black text-emerald-800">IRT 2PL + ZPD</strong>
                </div>
              </div>

              {/* OPTION 1: VÀO THI TRỰC TIẾP FORM */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>{isLoggedIn ? 'Vào Phòng Kiểm Tra Năng Lực Đầu Vào' : '1. Vào Thi Trực Tiếp (Chế Độ Khách)'}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${isLoggedIn ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                    {isLoggedIn ? 'Chính Thức' : 'Thi Ngay (Khách)'}
                  </span>
                </div>

                {/* Passcode input row */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-[11px] font-extrabold text-slate-600">Mã Code Phòng Thi:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setExamPasscode('VACT2026');
                        setPasscodeError('');
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? 'Đã điền!' : 'Mã mặc định: VACT2026'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={examPasscode}
                      onChange={(e) => {
                        setExamPasscode(e.target.value.toUpperCase());
                        setPasscodeError('');
                      }}
                      placeholder="Nhập mã phòng thi (Vd: VACT2026)..."
                      className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-300 font-mono text-sm font-black text-slate-900 uppercase tracking-widest focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-xs shadow-inner"
                    />
                  </div>

                  {passcodeError && (
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1 animate-pulse pt-0.5">
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{passcodeError}</span>
                    </div>
                  )}
                </div>

                {/* Direct Launch Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoggedIn ? '🚀 Bắt Đầu Làm Bài Kiểm Tra' : '🚀 Bắt Đầu Vào Làm Bài Ngay'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* OPTION 2: CHỈ HIỆN KHI CHƯA ĐĂNG NHẬP */}
              {!isLoggedIn && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/70 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>2. Đăng Nhập / Đăng Ký Để Lưu Kết Quả</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Khuyên Dùng
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Để điểm số được ghi nhận vào <strong className="text-indigo-900">học bạ cá nhân</strong> và thuật toán AI tự động xếp bạn vào lớp vi mô mở <strong className="text-blue-900">Lộ Trình Học Tương Ứng với từng cá nhân</strong>, bạn nên đăng nhập trước để khi nhận kết quả của bạn .
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleNavigateAuthWithIntent('login')}
                      className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition-all border border-slate-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400 active:scale-98"
                    >
                      <LogIn className="w-4 h-4 text-blue-600" />
                      <span>Đăng Nhập Tài Khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateAuthWithIntent('register')}
                      className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>✨ Đăng Ký Tài Khoản Mới</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CANCEL / STAY ON PAGE BUTTON */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{cancelLabel || (isLoggedIn ? 'Hủy / Ở Lại Dashboard' : 'Hủy / Ở Lại Trang Chủ')}</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
