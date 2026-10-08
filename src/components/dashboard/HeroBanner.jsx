import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, Bot, Clock, Sparkles, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { mockUser } from '../../data/mockData';
import studentAvatar from '../../assets/students_cutout_badge.jpg';

export default function HeroBanner({ currentUser, onStartMilestone, onStartMockTest, onOpenAiTutor }) {
  const displayName = currentUser?.fullName || currentUser?.user?.fullName || currentUser?.name || mockUser.name;

  const tips = [
    "Hệ thống đang tự động điều chỉnh lộ trình học theo Vùng phát triển ZPD. Hôm nay em có 3 nhiệm vụ mới cần hoàn thành.",
    "Mục tiêu Theta 0 = +0.85 để duy trì tỷ lệ đỗ 82% vào ĐH Bách Khoa TP.HCM.",
    "Trợ lý AI Tutor 24/7 sẵn sàng giải thích gợi mở Socratic bất kỳ bài tập thắc mắc nào.",
    "Hoàn thành chặng thi thử 15 phút hôm nay để cập nhật ma trận lỗ hổng kiến thức BKT."
  ];
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % tips.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-6 lg:p-8 shadow-2xl border border-slate-800">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FACC15]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Greeting & Info */}
        <div className="space-y-4 max-w-2xl flex-1">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase text-[#FACC15]">
            <Sparkles className="w-4 h-4 text-[#FACC15] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Chiến dịch ĐGNL ĐHQG TP.HCM 2026</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Chào {displayName}!
          </h1>

          {/* Dynamic Animated Sliding Text */}
          <div className="min-h-[48px] py-1 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm text-slate-200 font-semibold leading-relaxed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0 animate-pulse" />
                <span>{tips[tipIdx]}</span>
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 font-extrabold text-slate-950 bg-[#FACC15] px-3 py-1.5 rounded-xl shadow-sm">
              Mục tiêu: <span>{mockUser.targetScore}+ điểm</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-[#FACC15]" />
              Còn <strong className="text-white font-extrabold text-sm">{mockUser.daysLeft} ngày</strong> đến đợt thi 1
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={onStartMilestone}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FACC15] text-slate-950 font-black text-sm hover:bg-[#eab308] transition-all shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Vào học chặng hôm nay</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <button 
              onClick={onStartMockTest}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-sm transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-[#FACC15]" />
              <span>Làm đề thi thử mới</span>
            </button>

            <button 
              onClick={onOpenAiTutor}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 backdrop-blur-md text-slate-200 font-bold text-sm transition-all hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4 text-[#FACC15]" />
              <span>Hỏi AI Tutor</span>
            </button>
          </div>

        </div>

        {/* Right Column: 3D POP-OUT STUDENT AVATAR */}
        <div className="relative shrink-0 w-full sm:w-72 lg:w-80 group">
          
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FACC15] via-amber-500 to-indigo-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>

          {/* Container */}
          <div className="relative bg-slate-950/80 border border-slate-700 rounded-3xl p-2.5 backdrop-blur-md shadow-2xl transition-all duration-500 transform group-hover:scale-[1.03]">
            
            <div className="relative overflow-hidden rounded-2xl h-56 sm:h-64 w-full bg-slate-900">
              <img 
                src={studentAvatar} 
                alt="4 Học sinh ĐGNL"
                className="w-full h-full object-cover object-center filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Floating Badge overlays */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 text-[11px] font-extrabold">
                <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-slate-950 shadow-md flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Theta 0 = +0.85</span>
                </div>

                <div className="px-2.5 py-1 bg-[#FACC15] text-slate-950 rounded-xl shadow-md flex items-center gap-1 animate-pulse">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>82% Bách Khoa</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
