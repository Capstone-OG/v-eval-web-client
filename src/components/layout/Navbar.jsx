import React, { useState } from 'react';
import { Search, MapPin, Flame, Bell, User, LogOut, ChevronDown, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { mockUser, campusesList } from '../../data/mockData';

export default function Navbar({ activeRole, setActiveRole, onLogout, onOpenAuthModal, onOpenArchModal }) {
  const [selectedCampus, setSelectedCampus] = useState(mockUser.campusId);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentCampusObj = campusesList.find(c => c.id === selectedCampus) || campusesList[0];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Search Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài học, chuyên đề, mã đề..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          
          {/* Campus Selector */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-100/60 transition-all cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select 
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-blue-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {campusesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Streak Counter Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-700 font-bold text-xs shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{mockUser.streakDays} Ngày</span>
          </div>

          {/* Architecture Q&A Modal Trigger Button */}
          <button
            onClick={onOpenArchModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-all"
            title="Xem giải đáp 3 câu hỏi kiến thức nghiệp vụ (Chống gian lận, Real-time ZPD, Atomic RAG)"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Đặc tả Kiến trúc & 3 Q&A</span>
          </button>

          {/* Role Switcher Pills */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveRole('student')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${activeRole === 'student' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Học sinh
            </button>
            <button
              onClick={() => setActiveRole('teacher')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${activeRole === 'teacher' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Giáo viên
            </button>
            <button
              onClick={() => setActiveRole('manager')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${activeRole === 'manager' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Quản lý
            </button>
          </div>

          {/* Notifications Icon */}
          <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile / Auth State */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-all text-left"
            >
              <img 
                src={mockUser.avatar} 
                alt={mockUser.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30" 
              />
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{mockUser.name}</div>
                <div className="text-[11px] font-medium text-slate-500 capitalize">{activeRole === 'student' ? 'Học sinh • Lớp 12' : activeRole === 'teacher' ? 'Giáo viên cơ sở' : 'Trưởng phòng Đào tạo'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-sm font-bold text-slate-800">{mockUser.name}</div>
                  <div className="text-xs text-slate-500">{mockUser.email}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                    {mockUser.classLevel}
                  </div>
                </div>

                <button 
                  onClick={() => { setShowUserDropdown(false); onOpenAuthModal(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Đổi tài khoản / Màn Đăng nhập
                </button>

                <button 
                  onClick={() => { setShowUserDropdown(false); onOpenArchModal(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  Xem Đặc tả 6 Luồng & 3 Q&A
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                <button 
                  onClick={() => { setShowUserDropdown(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Đăng xuất (Logout)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
