import React, { useState } from 'react';
import { Search, MapPin, Flame, Bell, User, LogOut, ChevronDown, BookOpen, Layers, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { mockUser, campusesList } from '../../data/mockData';

export default function Navbar({ activeRole, setActiveRole, currentUser, onLogout, onOpenAuthModal, onOpenArchModal }) {
  const [selectedCampus, setSelectedCampus] = useState(mockUser.campusId);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentCampusObj = campusesList.find(c => c.id === selectedCampus) || campusesList[0];
  const displayName = currentUser?.fullName || mockUser.name;
  const displayEmail = currentUser?.email || mockUser.email;
  const displayAvatar = currentUser?.avatarUrl || mockUser.avatar;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left Section: Brand Logo + Search Bar */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                ĐGNL AI <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">v2.4</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Khảo thí & Luyện thi Thích ứng 4.0
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full hidden sm:block max-w-md">
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
          
          {/* IRT Psychometrics Live Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs font-bold shadow-sm">
            <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Theta 0: <strong className="text-emerald-400">+0.65</strong> <span className="text-slate-400 font-sans font-normal">(82% Bách Khoa)</span></span>
          </div>

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
                src={displayAvatar} 
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30" 
              />
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{displayName}</div>
                <div className="text-[11px] font-medium text-slate-500 capitalize">{activeRole === 'student' ? 'Học sinh • Lớp 12' : activeRole === 'teacher' ? 'Giáo viên cơ sở' : 'Trưởng phòng Đào tạo'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-sm font-bold text-slate-800">{displayName}</div>
                  <div className="text-xs text-slate-500 truncate">{displayEmail}</div>
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
