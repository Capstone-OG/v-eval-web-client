import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  GitFork, 
  Zap, 
  BookOpenCheck, 
  Bot, 
  Video, 
  BarChart3, 
  Settings,
  Sparkles,
  HelpCircle,
  Award,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeRole, 
  onOpenDiagnostic, 
  onOpenZPD, 
  onOpenAiTutor,
  isMobileOpen = false,
  onCloseMobile
}) {
  
  const navItemsSection1 = [
    { id: 'dashboard', label: 'Dashboard (Tổng quan)', icon: LayoutDashboard },
    { id: 'diagnostic', label: 'Khảo thí & Chẩn đoán', icon: Target, badge: 'Flow 1', onClick: onOpenDiagnostic },
    { id: 'roadmap', label: 'Lộ trình học (DAG)', icon: GitFork, badge: 'Flow 2' },
    { id: 'adaptive', label: 'Luyện tập ZPD', icon: Zap, badge: 'Flow 3', onClick: onOpenZPD },
    { id: 'question_bank', label: 'Ngân hàng đề & Thi thử', icon: BookOpenCheck },
  ];

  const navItemsSection2 = [
    { id: 'ai_tutor', label: 'AI Socratic Tutor', icon: Bot, badge: 'Flow 4', highlight: true, onClick: onOpenAiTutor },
    { id: 'live_qa', label: 'Lớp học & Live Q&A', icon: Video, badge: 'Realtime' },
    { id: 'analytics', label: 'Báo cáo & Dự báo', icon: BarChart3, badge: 'Flow 5 & 6' },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ];

  const handleSelectTab = (item) => {
    setActiveTab(item.id);
    if (item.onClick) item.onClick();
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavContent = () => (
    <div className="space-y-4">
      {/* Section 1: Khảo thí & Luyện tập */}
      <div>
        <div className="px-3 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Khảo thí & Luyện tập
        </div>
        <nav className="space-y-1">
          {navItemsSection1.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section 2: Hỗ trợ & Năng lực */}
      <div className="pt-3 border-t border-slate-100">
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Hỗ trợ & Năng lực
        </div>
        <nav className="space-y-1">
          {navItemsSection2.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold' 
                    : item.highlight 
                      ? 'bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 border border-blue-200/50' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.highlight ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sticky Aside (>= 1024px lg) */}
      <aside className="hidden lg:flex w-64 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 my-4 ml-4 lg:ml-8 lg:my-6 flex-col justify-between shrink-0 select-none sticky top-20 z-30 shadow-md shadow-slate-200/40 self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile / Tablet Slide-over Drawer (< 1024px lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-4 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Header with Logo and Close button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 leading-none">ĐGNL AI</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Menu Hệ Thống</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Items */}
                {renderNavContent()}
              </div>

              {/* Bottom Version Tag */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium text-center">
                ĐGNL AI • Chuẩn V-ACT 2026
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

