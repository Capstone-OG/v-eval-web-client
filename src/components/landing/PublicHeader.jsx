import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Menu, X, ArrowRight, LogIn, LayoutDashboard, HelpCircle, Layers, Target, Compass, BookOpen, Trophy } from 'lucide-react';

export default function PublicHeader({ 
  onOpenLogin, 
  onOpenDiagnostic, 
  onOpenArchModal, 
  onOpenDashboard,
  currentUser = null,
  searchQuery, 
  setSearchQuery,
  activeSection = 'hero'
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Giới thiệu', icon: Compass },
    { id: 'exam-matrix', label: 'Đặc tả 120 câu', icon: Layers },
    { id: 'tech-grid', label: 'Lộ trình & AI', icon: Target },
    { id: 'process-steps', label: '4 Bước học', icon: BookOpen },
    { id: 'testimonials', label: 'Bảng xếp hạng', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 transition-all shadow-xs">
      <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        
        {/* Brand Logo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0" 
          onClick={(e) => scrollToSection(e, 'hero')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md font-black text-sm">
            ĐG
          </div>
          <div>
            <div className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight text-slate-950 font-sans leading-none flex items-center gap-1">
              <span>ĐGNL AI</span>
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FACC15] inline-block animate-pulse"></span>
            </div>
            <div className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Khảo thí & Luyện thi ĐGNL 4.0
            </div>
          </div>
        </motion.div>

        {/* Desktop Navigation (>= 1280px xl only, completely prevents overlap) */}
        <div className="hidden xl:flex items-center justify-center gap-4 lg:gap-6 flex-1 min-w-0 px-2">
          {setSearchQuery && (
            <div className="relative shrink-0">
              <input 
                type="text"
                placeholder="Tìm khóa học, đề thi..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-56 pl-8 pr-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          )}

          <nav className="flex items-center gap-1.5 lg:gap-2 text-xs font-extrabold text-slate-700 whitespace-nowrap">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
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
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {currentUser ? (
            <button 
              type="button"
              onClick={onOpenDashboard}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-blue-500 bg-blue-50 text-blue-900 font-extrabold text-xs hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Vào Dashboard ({currentUser.fullName ? currentUser.fullName.split(' ').slice(-1)[0] : 'Tôi'})</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={onOpenLogin}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-slate-300 hover:border-slate-900 text-slate-800 font-extrabold text-xs hover:bg-slate-900 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          )}

          <button 
            type="button"
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:scale-102 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
          >
            <span className="hidden xs:inline sm:inline">Thi thử ngay</span>
            <span className="xs:hidden sm:hidden">Thi Thử</span>
            <Zap className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
          </button>

          {/* Hamburger Menu Toggle Button (< 1280px xl) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Dropdown Navigation Drawer (< 1280px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="xl:hidden overflow-hidden border-t border-slate-200/80 mt-2.5 pt-3 pb-2 space-y-3"
          >
            {/* Search Input in Mobile Menu */}
            {setSearchQuery && (
              <div className="relative w-full">
                <input 
                  type="text"
                  placeholder="Tìm khóa học, chuyên đề, đề thi..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            )}

            {/* Nav Links Grid */}
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white font-black shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Extra Mobile Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              {currentUser ? (
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard?.();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>Vào Dashboard ({currentUser.fullName || 'Học sinh'})</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin?.();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-200" />
                  <span>Đăng Nhập / Tạo Tài Khoản</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
