import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, Bot, Clock, Sparkles, Award, Flame, TrendingUp } from 'lucide-react';
import studentAvatar from '../../assets/students_cutout_badge.jpg';
import { accountGreeting } from '../../utils/accountPresentation';

export default function HeroBanner({
  currentUser,
  studentDashboard,
  latestDiagnosticResult,
  onStartMilestone,
  onOpenAdaptiveQuiz,
  onStartMockTest,
  onOpenDiagnostic,
  onOpenAiTutor
}) {
  const handleMilestoneClick = onStartMilestone || onOpenAdaptiveQuiz;
  const handleMockOrDiagnosticClick = onStartMockTest || onOpenDiagnostic;
  const targetScore = Number(studentDashboard?.targetScore || currentUser?.targetScore || 900);
  const estimatedScore = Number(
    latestDiagnosticResult?.estimated_score ??
      studentDashboard?.currentEstimatedScore ??
      0
  );
  const currentStreak = Number(studentDashboard?.streakAnalytics?.currentStreak ?? 0);
  const confidenceInterval = studentDashboard?.confidenceInterval || 'Chưa có dữ liệu';
  const currentMilestone =
    studentDashboard?.roadmapProgress?.currentMilestoneTitle ||
    'Chưa khởi tạo lộ trình thích ứng DAG';

  // Calculate real days remaining until next V-ACT exam window (March 29, 2026 / next cycle)
  const examDate = new Date('2026-03-29T08:00:00');
  const daysLeft = Math.max(1, Math.ceil((examDate.getTime() - Date.now()) / 86400000));

  const tips = [
    estimatedScore > 0
      ? `Điểm dự báo hiện tại: ${estimatedScore}/1200 điểm (Dải dự báo: ${confidenceInterval}).`
      : 'Hoàn thành bài đánh giá 30 câu đầu vào để nhận dự báo điểm thi và lộ trình ôn tập phù hợp.',
    'Lộ trình ôn luyện được cá nhân hóa theo điểm mạnh và vùng kiến thức cần bổ trợ.',
    'Trợ lý Gia sư AI sẵn sàng gợi mở phương pháp tư duy và hướng dẫn giải chi tiết 24/7.',
    currentStreak > 0
      ? `Bạn đang duy trì chuỗi ${currentStreak} ngày học liên tục. Hãy tiếp tục giữ vững phong độ!`
      : 'Học tập đều đặn mỗi ngày để xây dựng phản xạ làm bài thi nhanh và chuẩn xác!'
  ];
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % tips.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 lg:p-8 shadow-xl border border-blue-600/30">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FACC15]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Greeting & Info */}
        <div className="space-y-4 max-w-2xl flex-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            {accountGreeting('student', { fullName: currentUser?.fullName || studentDashboard?.fullName })}
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
              Mục tiêu: <span>{targetScore}+ điểm</span>
            </span>
            <span className="flex items-center gap-1.5 text-orange-200 bg-orange-500/20 px-3 py-1.5 rounded-xl border border-orange-400/30 font-bold">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              Streak: <strong className="text-white font-extrabold">{currentStreak} ngày</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-[#FACC15]" />
              Còn <strong className="text-white font-extrabold text-sm">{daysLeft} ngày</strong> đến đợt thi
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleMilestoneClick}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FACC15] text-slate-950 font-black text-sm hover:bg-[#eab308] transition-all shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Vào học theo lộ trình</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={handleMockOrDiagnosticClick}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#FACC15]" />
              <span>Đánh giá năng lực đầu vào</span>
            </button>

            <button
              type="button"
              onClick={onOpenAiTutor}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-950/60 hover:bg-blue-950/80 border border-blue-400/30 backdrop-blur-md text-white font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#FACC15]" />
              <span>Hỏi Gia sư AI 24/7</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D POP-OUT STUDENT AVATAR */}
        <div className="relative shrink-0 w-full sm:w-72 lg:w-80 group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FACC15] via-amber-500 to-indigo-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />

          <div className="relative bg-slate-950/80 border border-slate-700 rounded-3xl p-2.5 backdrop-blur-md shadow-2xl transition-all duration-500 transform group-hover:scale-[1.03]">
            <div className="relative overflow-hidden rounded-2xl h-56 sm:h-64 w-full bg-slate-900">
              <img
                src={studentAvatar}
                alt="Học sinh ĐGNL"
                className="w-full h-full object-cover object-center filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Floating Badge overlays */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 text-[11px] font-extrabold">
                <div className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-slate-950 shadow-md flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ước tính: {estimatedScore}đ</span>
                </div>

                <div className="px-2.5 py-1 bg-[#FACC15] text-slate-950 rounded-xl shadow-md flex items-center gap-1 animate-pulse">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Đích: {targetScore}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
