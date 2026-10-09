import React from 'react';
import { Sparkles, ShieldCheck, Mail, Phone, MapPin, Globe, ArrowRight, Lock, Award, Heart } from 'lucide-react';

export default function PublicFooter({ onOpenLogin, onOpenDiagnostic }) {
  return (
    <footer className="bg-slate-950 text-white py-16 px-6 lg:px-14 border-t border-slate-900 relative overflow-hidden font-sans">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Top CTA Bar inside Footer */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#FACC15] flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span>Sẵn Sàng Chinh Phục Điểm 900+ ĐGNL ĐHQG-HCM?</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white">
              Bắt Đầu Bài Khảo Sát Chẩn Đoán Năng Lực 15 Phút Ngay Hôm Nay
            </div>
          </div>

          <button
            onClick={onOpenDiagnostic}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/20 hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <span>🚀 Khảo Sát Năng Lực Miễn Phí</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main 4 Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="text-xl font-black text-white tracking-tight">
                ĐGNL AI <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold ml-1">v2.4</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed font-medium">
              Hệ thống khảo thí & luyện thi thích ứng ĐGNL ĐHQG TP.HCM hàng đầu Việt Nam. Tự động hóa lộ trình cá nhân hóa bằng thuật toán <strong className="text-white">IRT 3PL</strong>, cây tri thức <strong className="text-white">DAG Topo</strong> và trợ lý <strong className="text-[#FACC15]">AI Socratic 24/7</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-slate-400">
              <span className="px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 Certified</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>SSL 256-bit Encryption</span>
              </span>
            </div>
          </div>

          {/* Column 2: Exams & Assessment */}
          <div className="space-y-3">
            <div className="font-black text-white text-sm tracking-wide uppercase border-b border-slate-800 pb-2">
              Khảo Thí & Luyện Thi
            </div>
            <ul className="space-y-2.5 text-slate-400 font-semibold">
              <li><a href="#exam-matrix" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Đề thi thử IRT 120 câu chuẩn ĐHQG</a></li>
              <li><a href="#exam-matrix" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Bài khảo sát chẩn đoán 30 câu</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Luyện tập ZPD thích ứng theo năng lực</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Ma trận lỗ hổng kiến thức 5 miền</a></li>
              <li>
                <button onClick={onOpenDiagnostic} className="hover:text-blue-400 text-left transition-colors flex items-center gap-1.5">
                  ➔ Thi thử Azota Fullscreen Lockdown Exam
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Proprietary Technologies */}
          <div className="space-y-3">
            <div className="font-black text-white text-sm tracking-wide uppercase border-b border-slate-800 pb-2">
              Công Nghệ Độc Quyền
            </div>
            <ul className="space-y-2.5 text-slate-400 font-semibold">
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Mô hình Tâm trắc học IRT 3PL</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Cây tri thức định hướng Đồ thị DAG</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Trợ lý AI Socratic Tutor 24/7</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Chuỗi kỹ năng Bayesian Knowledge Tracing</a></li>
              <li><a href="#tech-grid" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">➔ Dự báo dải điểm & Tỷ lệ trúng tuyển NV1</a></li>
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div className="space-y-3">
            <div className="font-black text-white text-sm tracking-wide uppercase border-b border-slate-800 pb-2">
              Hỗ Trợ Thí Sinh 24/7
            </div>
            <ul className="space-y-2.5 text-slate-400 font-semibold">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Hotline: <strong className="text-white font-mono text-sm">0909.888.999</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Email: <strong className="text-white font-mono">academic@dgnl.edu.vn</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Địa chỉ: Cơ sở 1 - ĐHQG TP.HCM, Phường Linh Trung, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="pt-2">
                <button 
                  onClick={onOpenDiagnostic} 
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>🎧 Trợ Lý AI Trực Tuyến 24/7</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Terms Bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] font-medium gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 ĐGNL AI. Trung tâm Đào tạo & Khảo thí ĐGNL ĐHQG TP.HCM. Bảo lưu mọi quyền.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-bold">
            <a href="#hero" className="hover:text-white transition-colors">Quy định bản quyền</a>
            <span>•</span>
            <a href="#hero" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#hero" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>

      </div>

    </footer>
  );
}
