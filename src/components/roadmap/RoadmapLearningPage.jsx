import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calculator,
  Atom,
  Dna,
  BookOpen,
  FlaskConical,
  Landmark,
  BrainCircuit,
  Globe2,
  Compass,
  PlayCircle,
  Video,
  HelpCircle,
  Clock,
  ExternalLink,
  Maximize2,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Radio,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Sliders,
  Target,
  Trophy,
  Award,
  Zap,
  ShieldCheck,
  Star,
  Layers,
  Calendar,
  GraduationCap,
  Play,
  Lightbulb,
  CheckCheck,
  X
} from 'lucide-react';

import MathText from '../common/MathText';
import { MOCK_SUBJECTS_DATA, MOCK_DIAGNOSTIC_SUMMARY } from './roadmapSubjectsData';

// Helper convert URL Youtube sang Embed
const getEmbedUrl = (rawUrl) => {
  if (!rawUrl) return 'https://www.youtube.com/embed/5qap5aO4i9A';
  if (rawUrl.includes('/embed/')) return rawUrl;
  const matchWatch = rawUrl.match(/(?:watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (matchWatch && matchWatch[1]) {
    return `https://www.youtube.com/embed/${matchWatch[1]}`;
  }
  return rawUrl;
};

const getWatchUrl = (embedUrl) => {
  if (!embedUrl) return 'https://www.youtube.com/watch?v=5qap5aO4i9A';
  const matchEmbed = embedUrl.match(/(?:embed\/)([a-zA-Z0-9_-]{11})/);
  if (matchEmbed && matchEmbed[1]) {
    return `https://www.youtube.com/watch?v=${matchEmbed[1]}`;
  }
  return embedUrl;
};

// Icon tương ứng cho 9 môn thi ĐGNL
const getSubjectIcon = (subId) => {
  switch (subId) {
    case 'sub_math': return Calculator;
    case 'sub_physics': return Atom;
    case 'sub_biology': return Dna;
    case 'sub_vietnamese': return BookOpen;
    case 'sub_chemistry': return FlaskConical;
    case 'sub_history': return Landmark;
    case 'sub_logic_data': return BrainCircuit;
    case 'sub_english': return Globe2;
    case 'sub_geography': return Compass;
    default: return BookOpen;
  }
};

// Bộ màu sắc & gradient riêng biệt cho từng môn
const SUBJECT_THEMES = {
  sub_math: {
    gradient: 'from-blue-600 to-indigo-600',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    ringColor: 'ring-blue-500/30 border-blue-500',
    accentColor: 'text-blue-600',
    chipBg: 'bg-blue-100 text-blue-800',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
  },
  sub_physics: {
    gradient: 'from-cyan-600 to-blue-600',
    lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    ringColor: 'ring-cyan-500/30 border-cyan-500',
    accentColor: 'text-cyan-600',
    chipBg: 'bg-cyan-100 text-cyan-800',
    iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/20'
  },
  sub_biology: {
    gradient: 'from-emerald-600 to-teal-600',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ringColor: 'ring-emerald-500/30 border-emerald-500',
    accentColor: 'text-emerald-600',
    chipBg: 'bg-emerald-100 text-emerald-800',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
  },
  sub_vietnamese: {
    gradient: 'from-amber-600 to-orange-600',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    ringColor: 'ring-amber-500/30 border-amber-500',
    accentColor: 'text-amber-600',
    chipBg: 'bg-amber-100 text-amber-800',
    iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-500/20'
  },
  sub_chemistry: {
    gradient: 'from-purple-600 to-indigo-600',
    lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
    ringColor: 'ring-purple-500/30 border-purple-500',
    accentColor: 'text-purple-600',
    chipBg: 'bg-purple-100 text-purple-800',
    iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20'
  },
  sub_history: {
    gradient: 'from-orange-600 to-amber-700',
    lightBg: 'bg-orange-50 text-orange-700 border-orange-200',
    ringColor: 'ring-orange-500/30 border-orange-500',
    accentColor: 'text-orange-600',
    chipBg: 'bg-orange-100 text-orange-800',
    iconBg: 'bg-gradient-to-tr from-orange-600 to-amber-700 text-white shadow-orange-500/20'
  },
  sub_logic_data: {
    gradient: 'from-fuchsia-600 to-pink-600',
    lightBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    ringColor: 'ring-fuchsia-500/30 border-fuchsia-500',
    accentColor: 'text-fuchsia-600',
    chipBg: 'bg-fuchsia-100 text-fuchsia-800',
    iconBg: 'bg-gradient-to-tr from-fuchsia-600 to-pink-600 text-white shadow-fuchsia-500/20'
  },
  sub_english: {
    gradient: 'from-sky-600 to-blue-600',
    lightBg: 'bg-sky-50 text-sky-700 border-sky-200',
    ringColor: 'ring-sky-500/30 border-sky-500',
    accentColor: 'text-sky-600',
    chipBg: 'bg-sky-100 text-sky-800',
    iconBg: 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-sky-500/20'
  },
  sub_geography: {
    gradient: 'from-teal-600 to-emerald-600',
    lightBg: 'bg-teal-50 text-teal-700 border-teal-200',
    ringColor: 'ring-teal-500/30 border-teal-500',
    accentColor: 'text-teal-600',
    chipBg: 'bg-teal-100 text-teal-800',
    iconBg: 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white shadow-teal-500/20'
  }
};

// 3 Giai đoạn chuẩn hóa: Tinh gọn thành các nút bấm linh hoạt
const STAGES_CONFIG = [
  {
    id: 1,
    title: 'Giai Đoạn 1: Nền Tảng Cốt Lõi',
    shortTitle: 'GĐ 1: Nền Tảng',
    badgeText: 'Điểm < 50%',
    dotColor: 'bg-rose-500',
    activeBadge: 'bg-rose-600 text-white shadow-sm shadow-rose-500/30 ring-2 ring-rose-300',
    description: 'Củng cố lại toàn bộ kiến thức SGK 11-12, định lý và công thức nền tảng.',
    subjectIds: ['sub_math', 'sub_physics', 'sub_biology']
  },
  {
    id: 2,
    title: 'Giai Đoạn 2: Tăng Tốc Chuyên Sâu',
    shortTitle: 'GĐ 2: Tăng Tốc',
    badgeText: 'Điểm 50-74%',
    dotColor: 'bg-amber-500',
    activeBadge: 'bg-amber-600 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-300',
    description: 'Bỏ qua lý thuyết cơ bản, tập trung phương pháp giải nhanh và nhận diện bẫy đề thi VNU-HCM.',
    subjectIds: ['sub_vietnamese', 'sub_chemistry', 'sub_history']
  },
  {
    id: 3,
    title: 'Giai Đoạn 3: Bứt Phá 900+ Master',
    shortTitle: 'GĐ 3: Bứt Phá 900+',
    badgeText: 'Điểm ≥ 75%',
    dotColor: 'bg-emerald-500',
    activeBadge: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-300',
    description: 'Chinh phục các câu hỏi phân loại top 5% thí sinh và rèn luyện kỹ năng giải dưới 1.5 phút/câu.',
    subjectIds: ['sub_logic_data', 'sub_english', 'sub_geography']
  }
];

export default function RoadmapLearningPage() {
  // 1. Giai đoạn đang chọn (1 | 2 | 3)
  const [selectedStage, setSelectedStage] = useState(1);

  // 2. Môn học đang chọn trong giai đoạn đó
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub_math');

  // 3. Chương & Bài học đang chọn
  const [expandedChapterId, setExpandedChapterId] = useState('math_c1');
  const [selectedLessonId, setSelectedLessonId] = useState('math_c1_l1');

  // Tab học tập chi tiết của bài học: 'lecture' | 'video' | 'live' | 'quiz'
  const [activeTab, setActiveTab] = useState('lecture');

  // Video progress state
  const [videoWatched, setVideoWatched] = useState(15 * 60);
  const [videoTotal, setVideoTotal] = useState(25 * 60);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Lấy cấu hình của giai đoạn đang chọn
  const currentStageConfig = STAGES_CONFIG.find(s => s.id === selectedStage) || STAGES_CONFIG[0];

  // Danh sách các môn thuộc giai đoạn đang chọn
  const subjectsInCurrentStage = MOCK_SUBJECTS_DATA.filter(sub => sub.stage === selectedStage);

  // Môn học đang được chọn để xem chi tiết
  const currentSubject = MOCK_SUBJECTS_DATA.find(s => s.id === selectedSubjectId) || subjectsInCurrentStage[0];
  const currentTheme = SUBJECT_THEMES[currentSubject?.id] || SUBJECT_THEMES.sub_math;
  const CurrentSubjectIcon = getSubjectIcon(currentSubject?.id);

  // Chương & bài đang chọn
  const currentChapter = currentSubject?.chapters?.find(c => c.id === expandedChapterId) || currentSubject?.chapters?.[0];
  const currentLesson = currentChapter?.lessons?.find(l => l.id === selectedLessonId)
    || currentChapter?.lessons?.[0]
    || currentSubject?.chapters?.[0]?.lessons?.[0];

  // Khi click đổi Giai đoạn (1, 2, 3): tự động chuyển sang môn đầu tiên của giai đoạn đó
  const handleSelectStage = (stageId) => {
    setSelectedStage(stageId);
    const firstSubOfStage = MOCK_SUBJECTS_DATA.find(sub => sub.stage === stageId);
    if (firstSubOfStage) {
      setSelectedSubjectId(firstSubOfStage.id);
      const firstChap = firstSubOfStage.chapters?.[0];
      if (firstChap) {
        setExpandedChapterId(firstChap.id);
        const firstLess = firstChap.lessons?.[0];
        if (firstLess) {
          setSelectedLessonId(firstLess.id);
          resetLessonInteractions(firstLess);
        }
      }
    }
  };

  // Khi click chọn 1 Môn học trong Giai đoạn
  const handleSelectSubject = (subject) => {
    setSelectedSubjectId(subject.id);
    const firstChap = subject.chapters?.[0];
    if (firstChap) {
      setExpandedChapterId(firstChap.id);
      const firstLess = firstChap.lessons?.[0];
      if (firstLess) {
        setSelectedLessonId(firstLess.id);
        resetLessonInteractions(firstLess);
      }
    }
  };

  // Khi click chọn 1 Bài học trong Chương
  const handleSelectLesson = (chapterId, lesson) => {
    setExpandedChapterId(chapterId);
    setSelectedLessonId(lesson.id);
    resetLessonInteractions(lesson);
  };

  const resetLessonInteractions = (lesson) => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setVideoWatched(lesson.status === 'COMPLETED' ? videoTotal : 12 * 60);
  };

  // Phóng to toàn màn hình video
  const handleRequestFullscreen = (lessonId) => {
    const elem = document.getElementById(`video-player-container-${lessonId}`);
    if (elem) {
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) elem.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }
  };

  // Nộp bài Quiz củng cố
  const handleSubmitQuiz = () => {
    const questions = currentLesson?.quiz || [];
    if (!questions.length) return;

    let correctCount = 0;
    questions.forEach(q => {
      const selectedAns = quizAnswers[q.id];
      if (selectedAns && selectedAns.startsWith(q.correct)) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= 60) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="w-full space-y-5 text-slate-900 animate-fade-in pb-20 max-w-7xl mx-auto">

      {/* ===================================================================== */}
      {/* 1. TOP HEADER GỌN GÀNG: TIÊU ĐỀ & KẾT QUẢ ĐẦU VÀO                     */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
              Khảo Thí ĐGNL ĐHQG-HCM 2026
            </span>
            <span className="text-xs text-slate-400 font-bold font-mono">
              Core Flow 2
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Lộ Trình Học Cá Nhân Hóa (3 Giai Đoạn)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Hệ thống tự động xếp 9 môn thi vào đúng giai đoạn theo Vùng phát triển ZPD dựa trên điểm kiểm tra đầu vào.
          </p>
        </div>

        {/* Điểm đầu vào pill */}
        <div className="flex items-center gap-3 p-2.5 sm:px-4 sm:py-2 rounded-xl bg-slate-50 border border-slate-200/90 self-start md:self-auto shrink-0 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <Target className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Điểm kiểm tra đầu vào</div>
            <div className="text-sm font-black font-mono text-slate-900">
              {MOCK_DIAGNOSTIC_SUMMARY.totalScore} / {MOCK_DIAGNOSTIC_SUMMARY.maxTotalScore} Điểm
              <span className="text-xs font-bold text-blue-600 ml-2">
                (θ₀ = {MOCK_DIAGNOSTIC_SUMMARY.theta0})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THANH ĐIỀU HƯỚNG DÍNH (STICKY TOP BAR):                            */}
      {/*    3 NÚT NHỎ GIAI ĐOẠN 1-2-3 + CÁC MÔN HỌC CHUYỂN ĐỔI TỨC THÌ         */}
      {/* ===================================================================== */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4 space-y-2.5 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* 3 NÚT NHỎ GIAI ĐOẠN 1, 2, 3 */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {STAGES_CONFIG.map((stg) => {
              const isSelected = selectedStage === stg.id;
              return (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => handleSelectStage(stg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? `${stg.activeBadge} scale-102`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : stg.dotColor}`}></span>
                  <span>{stg.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* DẢI MÔN HỌC TRONG GIAI ĐOẠN ĐANG CHỌN (BẤM LÀ CHUYỂN MÔN NGAY, KHÔNG CẦN CUỘN) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
            <span className="text-[11px] font-black uppercase text-slate-400 shrink-0">
              Chọn môn:
            </span>
            {subjectsInCurrentStage.map((sub) => {
              const isSubSelected = sub.id === selectedSubjectId;
              const SubIcon = getSubjectIcon(sub.id);
              const subTheme = SUBJECT_THEMES[sub.id] || SUBJECT_THEMES.sub_math;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer shrink-0 select-none ${
                    isSubSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isSubSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sub.entryScore}đ
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tiêu chí phân lớp của giai đoạn */}
          <div className="hidden xl:flex items-center gap-1.5 shrink-0 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{currentStageConfig.badgeText} ({subjectsInCurrentStage.length} môn)</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. KHÔNG GIAN BÀI HỌC CHI TIẾT (XUẤT HIỆN NGAY BÊN DƯỚI)             */}
      {/* ===================================================================== */}
      {currentSubject && (
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">

          {/* Header Môn Học Đang Xem */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start gap-4">
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shrink-0 ${currentTheme.iconBg}`}>
                <CurrentSubjectIcon className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${currentTheme.chipBg}`}>
                    Môn: {currentSubject.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                    {currentSubject.stageName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    Trọng số: {currentSubject.weight}
                  </span>
                  <span className="text-xs text-blue-600 font-mono font-black">
                    Điểm đầu vào: {currentSubject.entryScore}/100đ
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Giáo Trình Chuyên Đề: {currentSubject.name}
                </h2>

                <p className="text-xs text-slate-500 font-medium max-w-2xl">
                  {currentSubject.summaryDesc}
                </p>
              </div>
            </div>

            {/* Giảng viên phụ trách */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 shrink-0 self-start lg:self-auto">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-black uppercase text-slate-400">Giảng viên phụ trách</div>
                <div className="text-xs font-black text-slate-900">{currentSubject.teacher}</div>
                <div className="text-[10px] font-bold text-emerald-600">Đại học Quốc gia TP.HCM</div>
              </div>
            </div>
          </div>

          {/* BỐ CỤC 2 CỘT: CÂY CHƯƠNG/BÀI BÊN TRÁI, NỘI DUNG 4 TABS BÊN PHẢI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* CỘT TRÁI: CÂY CHƯƠNG & BÀI HỌC (4 CỘT) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    CÂY CHƯƠNG & BÀI HỌC
                  </h3>
                </div>
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentSubject.chapters?.length || 0} Chương
                </span>
              </div>

              {/* Danh sách các Chương Accordion */}
              <div className="space-y-2.5">
                {currentSubject.chapters?.map((chapter, cIdx) => {
                  const isChapterOpen = expandedChapterId === chapter.id;

                  return (
                    <div
                      key={chapter.id}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Tiêu đề chương */}
                      <div
                        onClick={() => setExpandedChapterId(prev => prev === chapter.id ? null : chapter.id)}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/90 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                            Chương 0{cIdx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {chapter.title}
                          </h4>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {chapter.lessons?.length || 0} bài giảng chuyên đề
                          </div>
                        </div>

                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shrink-0 ${
                          isChapterOpen ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600'
                        }`}>
                          {isChapterOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Danh sách bài học trong chương */}
                      <AnimatePresence>
                        {isChapterOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="divide-y divide-slate-100 border-t border-slate-100"
                          >
                            {chapter.lessons?.map((lesson, lIdx) => {
                              const isLessonActive = selectedLessonId === lesson.id;
                              const isCompleted = lesson.status === 'COMPLETED';
                              const isLocked = lesson.status === 'LOCKED';

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => !isLocked && handleSelectLesson(chapter.id, lesson)}
                                  className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                    isLocked
                                      ? 'opacity-40 cursor-not-allowed bg-slate-50/50'
                                      : 'hover:bg-blue-50/50'
                                  } ${isLessonActive ? 'bg-blue-50/80 font-bold border-l-4 border-blue-600 shadow-2xs' : ''}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                                      isCompleted
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : isLessonActive
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isLocked ? <Lock className="w-3 h-3" /> : lIdx + 1}
                                    </div>

                                    <div className="min-w-0">
                                      <div className={`text-xs truncate ${isLessonActive ? 'font-black text-blue-900' : 'font-bold text-slate-800'}`}>
                                        {lesson.title}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span>{lesson.duration}</span>
                                        </span>
                                        {lesson.liveSchedule && (
                                          <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                            <Radio className="w-2.5 h-2.5 animate-pulse" />
                                            <span>Có Live</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {isLessonActive && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping block shrink-0"></span>
                                  )}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: KHÔNG GIAN HỌC TẬP 4 TABS (8 CỘT) */}
            <div className="lg:col-span-8 space-y-4">

              {/* Header Bài Học & Navigation 4 Tabs */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      Bài học đang chọn
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {currentLesson?.title || 'Chưa chọn bài học'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black shrink-0 self-start sm:self-auto border border-blue-200">
                    {currentLesson?.duration}
                  </span>
                </div>

                {/* 4 Tabs: Bài Giảng, Video, Live, Quiz */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('lecture')}
                    className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      activeTab === 'lecture'
                        ? 'bg-white text-indigo-700 border-indigo-300 shadow-sm font-black ring-1 ring-indigo-400/20'
                        : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>1. Bài Giảng & Bẫy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('video')}
                    className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      activeTab === 'video'
                        ? 'bg-white text-blue-700 border-blue-300 shadow-sm font-black ring-1 ring-blue-400/20'
                        : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4 text-blue-600" />
                    <span>2. Video Bài Giảng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('live')}
                    className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      activeTab === 'live'
                        ? 'bg-white text-emerald-700 border-emerald-300 shadow-sm font-black ring-1 ring-emerald-400/20'
                        : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>3. Lịch Học Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      activeTab === 'quiz'
                        ? 'bg-white text-purple-700 border-purple-300 shadow-sm font-black ring-1 ring-purple-400/20'
                        : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>4. Quiz Củng Cố</span>
                  </button>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* TAB 1: BÀI GIẢNG & BẪY ĐỀ (CHUẨN PANORAMA SGK NHƯ ẢNH USER GỬI)       */}
              {/* ===================================================================== */}
              {activeTab === 'lecture' && currentLesson?.lectureNotes && (
                <div className="space-y-4 animate-fade-in">

                  {/* Khối 1: Kiến thức nền tảng SGK */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          1
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          {currentLesson.lectureNotes.block1_sgk.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Định lý & Công thức SGK
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      <MathText text={currentLesson.lectureNotes.block1_sgk.definition} />
                    </div>

                    {/* Công thức tóm tắt */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Công thức cốt lõi cần nhớ:
                      </div>
                      {currentLesson.lectureNotes.block1_sgk.formulaSummary?.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-indigo-950 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          <MathText text={f} />
                        </div>
                      ))}
                    </div>

                    {/* Ví dụ SGK */}
                    {currentLesson.lectureNotes.block1_sgk.example && (
                      <div className="text-xs text-amber-950 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium leading-relaxed">
                        <strong className="text-amber-800 font-bold">📌 Ví dụ minh họa SGK:</strong>{' '}
                        <MathText text={currentLesson.lectureNotes.block1_sgk.example} />
                      </div>
                    )}
                  </div>

                  {/* Khối 2: Phương pháp giải chi tiết & Bẫy đề thi ĐGNL */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
                          2
                        </div>
                        <h4 className="text-sm font-black text-slate-900">
                          {currentLesson.lectureNotes.block2_method.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Thuật toán giải & Bẫy ĐGNL
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {currentLesson.lectureNotes.block2_method.steps?.map((step, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 font-medium text-slate-800">
                          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-black shrink-0 shadow-xs">
                            B{i+1}
                          </span>
                          <span className="leading-relaxed">
                            <MathText text={step} />
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cảnh báo bẫy đề thi */}
                    {currentLesson.lectureNotes.block2_method.traps && (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Cảnh báo các bẫy thường gặp trong đề VNU-HCM:</span>
                        </div>
                        {currentLesson.lectureNotes.block2_method.traps?.map((t, i) => (
                          <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium leading-relaxed">
                            ⚠️ <MathText text={t} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Khối 3: Bài toán mẫu chuẩn đề & Lời giải */}
                  {currentLesson.lectureNotes.block3_sample && (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                            3
                          </div>
                          <h4 className="text-sm font-black text-slate-900">
                            {currentLesson.lectureNotes.block3_sample.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {currentLesson.lectureNotes.block3_sample.level}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900">
                        <MathText text={currentLesson.lectureNotes.block3_sample.question} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {currentLesson.lectureNotes.block3_sample.options?.map((opt, i) => {
                          const isCorrect = opt.startsWith(currentLesson.lectureNotes.block3_sample.correct);
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-xl border font-bold flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span><MathText text={opt} /></span>
                              {isCorrect && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 font-medium leading-relaxed">
                        <strong className="text-blue-950 font-bold">💡 Lời giải chi tiết từng bước:</strong>{' '}
                        <MathText text={currentLesson.lectureNotes.block3_sample.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================================================================== */}
              {/* TAB 2: COI ĐƯỢC VIDEO BÀI GIẢNG (THEATER PLAYER YOUTUBE)             */}
              {/* ===================================================================== */}
              {activeTab === 'video' && currentLesson && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 animate-fade-in shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      Video Bài Giảng: {currentLesson.title}
                    </h4>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRequestFullscreen(currentLesson.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Toàn Màn Hình</span>
                      </button>

                      <a
                        href={getWatchUrl(currentLesson.videoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở YouTube ↗</span>
                      </a>
                    </div>
                  </div>

                  {/* YouTube Player */}
                  <div
                    id={`video-player-container-${currentLesson.id}`}
                    className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800"
                  >
                    <iframe
                      src={getEmbedUrl(currentLesson.videoUrl)}
                      title={currentLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen={true}
                    />
                  </div>

                  {/* Thanh tiến độ xem video */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Thời lượng xem video tích lũy:</span>
                      </span>
                      <span className="font-mono text-blue-600 font-black">
                        {Math.floor(videoWatched / 60)}:00 / {Math.floor(videoTotal / 60)}:00 ({Math.round((videoWatched / videoTotal) * 100)}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round((videoWatched / videoTotal) * 100))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>💡 Xem tối thiểu 80% để mở khóa bài tập củng cố.</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoWatched(prev => Math.min(videoTotal, prev + 5 * 60))}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs cursor-pointer"
                        >
                          +5 Phút
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoWatched(videoTotal);
                            confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs cursor-pointer"
                        >
                          Xem xong 100%
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* TAB 3: LỊCH HỌC LIVE & PHÒNG GOOGLE MEET                              */}
              {/* ===================================================================== */}
              {activeTab === 'live' && currentLesson?.liveSchedule && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-emerald-50/70 border border-indigo-200 text-xs space-y-4 animate-fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Video className="w-4 h-4" />
                      </div>
                      <span>{currentLesson.liveSchedule.title}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase tracking-wider border border-emerald-200">
                      Google Meet Trực Tuyến
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-semibold text-slate-700">
                    <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100 shadow-2xs">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Giảng viên trực tiếp</div>
                      <div className="text-slate-900 font-black mt-0.5 text-sm">{currentLesson.liveSchedule.teacher}</div>
                      <div className="text-[10px] text-slate-500">{currentLesson.liveSchedule.teacherRole}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100 shadow-2xs">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Thời gian học định kỳ</div>
                      <div className="text-slate-900 font-black mt-0.5 text-sm">{currentLesson.liveSchedule.scheduledAt}</div>
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Đã xác nhận phòng học trực tuyến</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút vào phòng Meet */}
                  <a
                    href={currentLesson.liveSchedule.meetUrl || 'https://meet.google.com/xyz-veval-demo'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 group cursor-pointer"
                  >
                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Vào Phòng Học Google Meet Ngay (meet.google.com) ↗</span>
                  </a>

                  {currentLesson.liveSchedule.prepNotes && (
                    <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-600">
                      📌 <strong>Yêu cầu chuẩn bị trước buổi học:</strong> {currentLesson.liveSchedule.prepNotes}
                    </div>
                  )}
                </div>
              )}

              {/* ===================================================================== */}
              {/* TAB 4: QUIZ CỦNG CỐ KIẾN THỨC BÀI HỌC                                */}
              {/* ===================================================================== */}
              {activeTab === 'quiz' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 animate-fade-in shadow-2xs">
                  <div className="font-black text-xs sm:text-sm text-purple-900 bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Bài Tập Củng Cố Kiến Thức ({currentLesson?.quiz?.length || 0} Câu Chuẩn Hóa IRT)</span>
                  </div>

                  {currentLesson?.quiz?.length > 0 ? (
                    <div className="space-y-3.5">
                      {currentLesson.quiz.map((q, qIdx) => (
                        <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                          <div className="font-bold text-slate-900">
                            <span className="text-blue-600 mr-1.5 font-black">Câu {qIdx + 1}:</span>
                            <MathText text={q.question} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const char = ['A', 'B', 'C', 'D'][oIdx];
                              const isSelected = quizAnswers[q.id]?.startsWith(char);
                              const isCorrect = opt.startsWith(q.correct);

                              return (
                                <button
                                  key={char}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                  className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                                    quizSubmitted
                                      ? isCorrect
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                        : isSelected
                                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                                          : 'bg-white text-slate-500 border-slate-200'
                                      : isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                    isSelected && !quizSubmitted ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {char}
                                  </span>
                                  <span className="truncate"><MathText text={opt} /></span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-900 font-medium">
                              <strong>💡 Lời giải:</strong> <MathText text={q.explanation} />
                            </div>
                          )}
                        </div>
                      ))}

                      {quizSubmitted && quizScore !== null && (
                        <div className={`p-4 rounded-xl border text-center font-bold text-xs ${
                          quizScore >= 60 ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                        }`}>
                          Điểm số: <strong className="font-mono text-sm">{quizScore}%</strong>{' '}
                          {quizScore >= 60 ? '🎉 Xuất sắc! Bạn đã vượt qua bài học này.' : '⚠️ Chưa đạt 60%, hãy xem lại bài giảng và thử lại.'}
                        </div>
                      )}

                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(quizAnswers).length === 0}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-black text-xs shadow-md cursor-pointer"
                        >
                          Nộp Bài & Chấm Điểm Tự Động
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setQuizAnswers({});
                            setQuizScore(null);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer"
                        >
                          Làm Lại Bài Tập
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Chưa có câu hỏi trắc nghiệm cho bài học này.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
