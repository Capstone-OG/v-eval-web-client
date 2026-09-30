import React from 'react';
import { motion } from 'framer-motion';
import { Search, Zap } from 'lucide-react';

export default function PublicHeader({ 
  onOpenLogin, 
  onOpenDiagnostic, 
  onOpenArchModal, 
  searchQuery, 
  setSearchQuery,
  activeSection = 'hero'
}) {
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Giới thiệu' },
    { id: 'exam-matrix', label: 'Đặc tả 120 câu' },
    { id: 'tech-grid', label: 'Lộ trình & AI' },
    { id: 'process-steps', label: '4 Bước học' },
    { id: 'testimonials', label: 'Bảng xếp hạng' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all shadow-xs">
      <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-4 lg:gap-6">
        
        {/* Brand Logo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" 
          onClick={(e) => scrollToSection(e, 'hero')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md font-black text-sm">
            ĐG
          </div>
          <div>
            <div className="font-black text-xl lg:text-2xl tracking-tight text-slate-950 font-sans leading-none flex items-center gap-1">
              <span>ĐGNL AI</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] inline-block animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Khảo thí & Luyện thi ĐGNL 4.0
            </div>
          </div>
        </motion.div>

        {/* Search Input & Scroll-Spy Active Nav Links */}
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8 flex-1 min-w-0 px-2">
          {setSearchQuery && (
            <div className="relative shrink-0">
              <input 
                type="text"
                placeholder="Tìm khóa học, đề thi..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 lg:w-52 xl:w-60 pl-8 pr-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          )}

          <nav className="flex items-center gap-1.5 lg:gap-2.5 text-xs font-extrabold text-slate-700 whitespace-nowrap">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black' 
                      : 'hover:text-blue-600 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
                  )}
                  <span>{item.label}</span>
                </a>
              );
            })}

            <button 
              onClick={onOpenArchModal}
              className="hover:text-blue-700 transition-colors text-indigo-600 font-extrabold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200/80 shadow-2xs ml-1"
            >
              Đặc tả 3 Q&A
            </button>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 pl-1">
          <button 
            onClick={onOpenLogin}
            className="hidden sm:inline-block px-4 py-2 rounded-full border-2 border-slate-900 text-slate-900 font-extrabold text-xs hover:bg-slate-900 hover:text-white transition-all duration-200"
          >
            Sign In
          </button>

          <button 
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
          >
            <span>Thi thử ngay</span>
            <Zap className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
          </button>
        </div>

      </div>
    </header>
  );
}
