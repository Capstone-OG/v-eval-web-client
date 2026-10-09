import React from 'react';
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
  Award
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeRole, onOpenDiagnostic, onOpenZPD, onOpenAiTutor }) {
  
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

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 my-4 ml-4 lg:ml-8 lg:my-6 flex flex-col justify-between shrink-0 select-none sticky top-20 z-30 shadow-md shadow-slate-200/40 self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto">
      <div>
        
        {/* Section 1: Khảo thí & Luyện tập */}
        <div className="px-1 py-1">
          <div className="px-3 my-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Khảo thí & Luyện tập
          </div>
          <nav className="space-y-1">
            {navItemsSection1.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.onClick) item.onClick();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
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
        <div className="px-3 py-2 border-t border-slate-100 pb-6">
          <div className="px-3 mb-2 mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hỗ trợ & Năng lực
          </div>
          <nav className="space-y-1">
            {navItemsSection2.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.onClick) item.onClick();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
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
    </aside>
  );
}
