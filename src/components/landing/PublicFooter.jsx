import React from 'react';

export default function PublicFooter({ onOpenLogin, onOpenDiagnostic }) {
  return (
    <footer className="bg-slate-950 text-white py-14 px-6 lg:px-14 border-t border-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
        
        {/* Column 1: Info */}
        <div className="space-y-3 md:col-span-1">
          <div className="text-xl font-black text-white font-sans flex items-center gap-1">
            <span>ĐGNL AI</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
          </div>
          <p className="text-slate-400 leading-relaxed font-medium">
            Nền tảng khảo thí & luyện thi ĐGNL ĐHQG TP.HCM tự động hóa 4.0, ứng dụng thuật toán IRT 3PL và Vùng phát triển ZPD giúp sĩ tử bứt phá 900+ điểm.
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-400">
            <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 font-mono text-[10px]">🛡️ ISO 27001 Security</span>
            <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 font-mono text-[10px]">🔒 Mã Hóa Dữ Liệu</span>
          </div>
        </div>

        {/* Column 2: Exam */}
        <div className="space-y-2.5">
          <div className="font-extrabold text-white text-sm">KHẢO THÍ & LUYỆN THI</div>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#exam-matrix" className="hover:text-white transition-colors">Đề thi thử IRT 120 câu</a></li>
            <li><a href="#exam-matrix" className="hover:text-white transition-colors">Đặc tả cấu trúc ĐHQG</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Luyện tập ZPD thích ứng</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Ma trận lỗ hổng kiến thức</a></li>
            <li><button onClick={onOpenDiagnostic} className="hover:text-white text-left transition-colors">Phòng thi Lockdown Exam</button></li>
          </ul>
        </div>

        {/* Column 3: Tech */}
        <div className="space-y-2.5">
          <div className="font-extrabold text-white text-sm">CÔNG NGHỆ ĐỘC QUYỀN</div>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Model Khảo thí IRT 3PL</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Cây tri thức định hướng DAG</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Trợ lý AI Socratic 24/7</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Thuật toán Bayesian Tracing (BKT)</a></li>
            <li><a href="#tech-grid" className="hover:text-white transition-colors">Dự báo dải điểm trúng tuyển</a></li>
          </ul>
        </div>

        {/* Column 4: Support */}
        <div className="space-y-2.5">
          <div className="font-extrabold text-white text-sm">HỖ TRỢ THÍ SINH 24/7</div>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li>Hotline: <strong className="text-white">0909.888.999</strong></li>
            <li>Email: <strong className="text-white">academic@dgnl.edu.vn</strong></li>
            <li>Địa chỉ: Cơ sở 1 - ĐHQG TP.HCM, Thủ Đức</li>
            <li className="pt-2">
              <button 
                onClick={onOpenDiagnostic} 
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                🎧 Trợ Lý AI Trực Tuyến
              </button>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
        <div>© 2026 ĐGNL AI. Trung tâm Đào tạo & Khảo thí ĐGNL ĐHQG TP.HCM. Tất cả quyền được bảo lưu.</div>
        <div className="flex gap-4">
          <a href="#hero" className="hover:text-slate-300">Quy định bản quyền</a>
          <a href="#hero" className="hover:text-slate-300">Chính sách bảo mật</a>
          <a href="#hero" className="hover:text-slate-300">Điều khoản sử dụng</a>
        </div>
      </div>
    </footer>
  );
}
