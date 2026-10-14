import React, { useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  GitFork,
  Zap,
  Bot,
  Award,
  PlayCircle,
  Lock,
  Star,
  Clock,
  FileText,
  Layers,
  CheckCircle2,
  X,
  LogIn,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import studentsBadge from '../../assets/students_cutout_badge.jpg';
import studentsClean from '../../assets/students_cutout_clean.jpg';
import studentsOriginal from '../../assets/students_original.png';

export default function PublicLandingPage({
  onOpenLogin,
  onOpenDiagnostic,
  onOpenDashboard,
  onOpenArchModal,
  onStartGuestExam
}) {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [examPasscode, setExamPasscode] = useState('VACT2026');
  const [passcodeError, setPasscodeError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const handleOpenDiagnosticConfirm = () => {
    setPasscodeError('');
    setShowGuestModal(true);
  };

  const handleLaunchGuestExam = () => {
    const cleanCode = examPasscode.trim().toUpperCase();
    if (!cleanCode) {
      setPasscodeError('Vui lòng nhập mã code phòng thi (hoặc dùng mã mặc định VACT2026)!');
      return;
    }
    setPasscodeError('');
    setShowGuestModal(false);
    if (onStartGuestExam) {
      onStartGuestExam({ examCode: cleanCode, autoStart: true });
    } else {
      onOpenDiagnostic?.();
    }
  };

  const handleNavigateAuthWithIntent = (authMode) => {
    const cleanCode = examPasscode.trim().toUpperCase() || 'VACT2026';
    try {
      sessionStorage.setItem('veval_pending_exam_intent', JSON.stringify({
        examId: '11111111-1111-1111-1111-111111111111',
        examCode: cleanCode,
        title: 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu Chẩn Đoán)',
        autoStart: true,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Cannot save session intent', err);
    }
    setShowGuestModal(false);
    const noticeText = authMode === 'register'
      ? '🎯 Đăng ký tài khoản để hệ thống lưu kết quả khảo sát 30 câu và tự động kích hoạt Lộ Trình Học Thích Ứng (Flow 2)!'
      : '🎯 Đăng nhập để tiếp tục làm bài khảo sát năng lực 30 câu và lưu kết quả vào học bạ cá nhân!';
    onOpenLogin?.({ mode: authMode, notice: noticeText });
  };

  // ScrollSpy listener to detect current active section when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'exam-matrix', 'tech-grid', 'process-steps', 'testimonials'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live Toast Activity Notification State
  const liveActivities = [
    "🔥 Học sinh Phạm Minh H. vừa làm xong đề IRT: 965 / 1200 điểm!",
    "⚡ Lộ trình ZPD vừa tự động mở chặng 04 (Logic & Số liệu) cho 84 học sinh.",
    "🤖 AI Tutor vừa giải thích câu 42 Socratic cho bạn Lê Quỳnh A.",
    "🎯 94% học sinh làm test chẩn đoán tăng trung bình +75 điểm sau 2 tuần.",
    "📢 Lớp Bứt Phá có buổi Live Q&A giải đề trực tuyến lúc 19h30 tối nay!"
  ];
  const [actIdx, setActIdx] = useState(0);
  const [actVisible, setActVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setActVisible(false);
      setTimeout(() => {
        setActIdx((prev) => (prev + 1) % liveActivities.length);
        setActVisible(true);
      }, 500);
    }, 4500);
    return () => clearInterval(timer);
  }, [liveActivities.length]);

  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setShowStickyBar(latest > 400);
    });
  }, [scrollY]);

  // Core Tech List
  const techCards = [
    {
      id: 'dag',
      title: 'Cây Tri Thức Định Hướng (DAG): Không Học Thừa Một Dạng Bài',
      icon: GitFork,
      badge: 'BỐC TÁCH MA TRẬN 120 CÂU',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      color: 'from-blue-600 to-indigo-600',
      desc: 'Ma trận bài học được sắp xếp theo Đồ thị DAG không chu trình. Thuật toán Topo Sort xác định chính xác kiến thức mấu chốt, tự động chèn Remedial Node khi bạn sai để lấp lỗ hổng nhanh nhất mà không mất thời gian học lại kiến thức đã vững.',
      subTag1: '✓ Sắp xếp Topo Sort tối ưu',
      subTag2: '✓ Tự động khắc phục lún kiến thức'
    },
    {
      id: 'irt',
      title: 'Đo Lường Chuẩn IRT: Ước Tính Độ Khó & Năng Lực Thí Sinh',
      icon: Target,
      badge: 'IRT 3PL & BKT MODEL',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      color: 'from-emerald-500 to-teal-600',
      desc: 'Mô phỏng đo lường điểm năng lực thí sinh Theta 0 chuẩn xác theo 3 tham số (Độ khó a, Độ phân hóa b, Yếu tố đoán mò c). Đánh giá đúng thực lực điểm sàn trúng tuyển thực tế của bạn tại các trường đại học TOP đầu.',
      subTag1: '✓ Mô hình IRT 3PL chuẩn quốc tế',
      subTag2: '✓ Ước tính Theta 0 real-time'
    },
    {
      id: 'socratic',
      title: 'AI Socratic Tutor: Hướng Dẫn Tư Duy Phản Biện 24/7',
      icon: Bot,
      badge: 'RAG POWERED & SOCRATIC',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'from-amber-500 to-orange-600',
      desc: 'Không cho sẵn đáp án để học vẹt! Trợ lý AI dựa trên gợi mở Socratic đặt những câu hỏi phản biện từng bước, hỗ trợ bạn tự nghĩ ra hướng giải đúng với chỉ số tương đồng tri thức Cosine Similarity ≥ 0.78.',
      subTag1: '✓ Phản hồi trong 2 giây',
      subTag2: '✓ Bám sát giáo trình ĐHQG'
    },
    {
      id: 'lockdown',
      title: 'Chống Gian Lận & Lockdown Exam: 100% Áp Lực Phòng Thi Thật',
      icon: Lock,
      badge: 'BẢO MẬT & MÔ PHỎNG THI',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      color: 'from-indigo-600 to-violet-600',
      desc: 'Trải nghiệm thi thử với khóa màn hình Fullscreen, chống chuyển tab linh hoạt, bấm giờ đếm ngược 150 phút và xáo trộn mã đề tự động giúp học sinh rèn luyện tâm lý vững vàng nhất trước kỳ thi chính thức.',
      subTag1: '✓ 120 câu / 150 phút chuẩn đợt 1 & 2',
      subTag2: '✓ Báo cáo vi phạm realtime'
    }
  ];

  // 4 Steps Process Flow
  const processSteps = [
    {
      step: '01',
      title: 'Chẩn Đoán Năng Lực IRT',
      desc: 'Thi bài test 15-30 câu chẩn đoán đầu vào để hệ thống tính toán ngay lập tức Vector Năng lực Theta 0 của bạn.',
      linkText: 'Khảo sát năng lực ngay →'
    },
    {
      step: '02',
      title: 'Ải Lập Cây DAG Cá Nhân',
      desc: 'Hệ thống tự động vẽ ra cây lộ trình tự học gồm các chặng kiến thức tối ưu theo thứ tự ưu tiên nhất.',
      linkText: 'Khám phá sơ đồ lộ trình →'
    },
    {
      step: '03',
      title: 'Luyện ZPD & Hỏi AI Socratic',
      desc: 'Làm bài tập vừa tầm P(Correct) 0.65-0.75 kết hợp sự trợ giúp gợi mở 24/7 từ AI Tutor.',
      linkText: 'Trải nghiệm AI Tutor →'
    },
    {
      step: '04',
      title: 'Thi Thử Tổng Hợp & Đỗ NV1',
      desc: 'Cọ xát với phòng thi thật 120 câu, nhận dự báo tỷ lệ trúng tuyển nguyện vọng vào trường mơ ước.',
      linkText: 'Tự tin bước vào phòng thi →'
    }
  ];

  // Student Success Stories
  const successStories = [
    {
      name: 'Phạm Minh Hoàng',
      school: 'Thủ khoa ĐGNL 965/1200 • ĐH Bách Khoa TP.HCM',
      avatar: studentsClean,
      target: '965 / 1200 Điểm',
      uni: 'ĐH Bách Khoa TP.HCM',
      quote: 'Mô hình IRT và lộ trình ZPD của ĐGNL AI đã giúp mình không bị ngợp trước ma trận 120 câu. AI Socratic hướng dẫn gợi mở giúp mình tự tư duy bài tập Logic & Số liệu cực kỳ chắc chắn!'
    },
    {
      name: 'Nguyễn Thu Thảo',
      school: 'Á khoa 940/1200 • ĐH Y Dược TP.HCM',
      avatar: studentsBadge,
      target: '940 / 1200 Điểm',
      uni: 'ĐH Y Dược TP.HCM',
      quote: 'Ban đầu mình chỉ đạt 720 điểm ở lần test chẩn đoán đầu tiên. Nhưng nhờ Cây Tri Thức DAG chỉ rõ chặng yếu môn Hóa và Sinh, mình đã tăng liền +220 điểm chỉ sau 3 tuần ôn tập!'
    },
    {
      name: 'Lê Quốc Huy',
      school: 'Đỗ NV1 955/1200 • ĐH Kinh Tế - Luật (UEL)',
      avatar: studentsClean,
      target: '955 / 1200 Điểm',
      uni: 'ĐH Kinh Tế - Luật ĐHQG',
      quote: 'Thời gian thi thử Lockdown Exam áp lực 150 phút như thi thật giúp mình phân bổ thời gian hợp lý cho từng phần Ngôn ngữ và Số liệu. Mình hoàn toàn tự tin trúng tuyển nguyện vọng 1!'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-[#FACC15] selection:text-slate-950 relative overflow-x-clip">

      {/* 1. MODULAR TOP HEADER */}
      <PublicHeader
        onOpenLogin={onOpenLogin}
        onOpenDiagnostic={handleOpenDiagnosticConfirm}
        onOpenArchModal={onOpenArchModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
      />

      {/* 2. HERO SECTION - WITH ATMOSPHERIC CLASSROOM BACKGROUND BLEND */}
      <section id="hero" className="relative min-h-[660px] lg:min-h-[720px] w-full flex items-center overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-blue-50/30 to-white pt-8 pb-16">

        {/* ATMOSPHERIC CLASSROOM BACKGROUND IMAGE ON RIGHT SIDE */}
        <div className="absolute top-0 right-0 w-full lg:w-[52%] h-full pointer-events-none z-0 overflow-hidden select-none">
          {/* Real Classroom Photo background */}
          <img
            src={studentsOriginal}
            alt="Lớp học sinh ĐGNL"
            className="w-full h-full object-cover object-center opacity-25 lg:opacity-35 filter saturate-120 blur-[1.5px]"
          />
          {/* Smooth gradient fade overlay from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/85 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-[#FDFBF7]/60"></div>
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">

          {/* LEFT COLUMN (7 Spans: Headline, Copy, Action CTAs, Stat Badges) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >

            {/* Top Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-900 text-xs font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>KHẢO THÍ ĐỀ THI ĐHQG | Nền tảng khảo thí ĐGNL hàng đầu TP.HCM</span>
            </div>

            {/* Huge Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-slate-950 font-sans">
                Chinh Phục Kỳ Thi ĐGNL ĐHQG Với <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Trí Tuệ Nhân Tạo & Chuẩn Khảo Thí IRT
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
              Tối ưu hóa điểm số với thuật toán Vùng phát triển gần nhất (ZPD), cây tri thức DAG cá nhân hóa và AI Socratic hướng dẫn tư duy phản biện 24/7. Không học vẹt, rèn bản lĩnh thi thật.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenDiagnosticConfirm}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Zap className="w-4.5 h-4.5 text-[#FACC15] fill-[#FACC15]" />
                <span>Khảo sát chẩn đoán 45 phút (Miễn phí)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDashboard}
                className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/90 hover:bg-white border border-slate-300 backdrop-blur-md text-slate-800 font-extrabold text-sm transition-all shadow-sm"
              >
                <PlayCircle className="w-4.5 h-4.5 text-blue-600" />
                <span>Phòng thi thử 120 câu</span>
              </motion.button>
            </div>

            {/* Stats Summary Counter Strip */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200/80 max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-sans tracking-tight">45.000+</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">Học sinh quy chuẩn</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 font-sans tracking-tight">94.8%</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">Tăng 150+ điểm nền</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-sans tracking-tight">Top 1%</div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">Thủ khoa & Á khoa học tại đây</div>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN (5 Spans: Interactive Student Profile & Vector Theta Score Card Showcase over Classroom Scene) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Background Ambient Glow Halo */}
            <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 blur-2xl opacity-50 animate-pulse"></div>

            {/* Main Interactive Student Showcase Ultra-Glass Card */}
            <div className="relative bg-white/95 border border-white/90 rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl space-y-5">

              {/* Floating Top Admission Target Badge */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-blue-900">
                  <Award className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-blue-600 font-bold tracking-wide">XÁC SUẤT TRÚNG TUYỂN NV1</div>
                    <div className="text-xs text-slate-900 font-extrabold">Khoa Khoa Học Máy Tính - ĐH Bách Khoa</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shrink-0 shadow-sm animate-pulse">
                  82% Đạt Chuẩn
                </div>
              </div>

              {/* Student Header Info with 4-Students Cutout Thumbnail */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 p-0.5 shadow-md bg-amber-400">
                    <img src={studentsClean} alt="Student Avatar" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-950">Học sinh Phạm Minh H.</div>
                    <div className="text-xs text-slate-500 font-medium">Khóa ĐGNL ĐHQG TP.HCM 2026</div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                  Lớp Bứt Phá
                </div>
              </div>

              {/* Vector Theta Score Meter */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Ước tính Vector Theta 0</div>
                  <div className="text-xl font-black text-blue-600 font-sans mt-0.5 flex items-center gap-1">
                    <span>+1.84</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Top 1.2%</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Dự báo Điểm Thi Thật</div>
                  <div className="text-xl font-black text-slate-950 font-sans mt-0.5">
                    945 <span className="text-xs font-normal text-slate-400">/ 1200</span>
                  </div>
                </div>
              </div>

              {/* Domain Progress Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Sử dụng Ngôn ngữ (50 câu)</span>
                  <span className="text-blue-600 font-extrabold">88% (P=0.88)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[88%]"></div>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-700 pt-1">
                  <span>Toán - Logic & Số liệu (30 câu)</span>
                  <span className="text-indigo-600 font-extrabold">92% (P=0.92)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[92%]"></div>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-700 pt-1">
                  <span>Giải quyết Vấn đề (40 câu)</span>
                  <span className="text-cyan-600 font-extrabold">86% (P=0.86)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-cyan-600 rounded-full w-[86%]"></div>
                </div>
              </div>

              {/* AI Socratic Tutor Recommendation Snippet */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                <div>
                  <strong className="text-amber-950 font-extrabold">AI Socratic gợi ý:</strong> Luyện Tốc Độ — Khảo sát thêm 3 đề phân tích số liệu để đạt mốc 980+!
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dữ liệu quy chuẩn theo chuẩn IRT 3PL</span>
                </span>
                <span className="text-slate-500">Cập nhật 2 phút trước</span>
              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* 3. STATS HIGHLIGHT COUNTER STRIP */}
      <section id="exam-matrix" className="py-12 px-6 lg:px-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-6 rounded-3xl bg-[#FDFBF7] border border-slate-200/80 shadow-sm text-center space-y-2 hover:border-blue-300 transition-all"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 font-sans tracking-tight">120+</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">Đề Thi Chuẩn Ma Trận ĐHQG</div>
            <div className="text-[11px] text-slate-500 font-medium">Bao quát đủ 3 phân môn lớn 150 phút</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-6 rounded-3xl bg-[#FDFBF7] border border-slate-200/80 shadow-sm text-center space-y-2 hover:border-indigo-300 transition-all"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 font-sans tracking-tight">15.000+</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">Câu Hỏi Được Gán Nhãn IRT</div>
            <div className="text-[11px] text-slate-500 font-medium">Định độ khó a, b, c phân hóa chính xác</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-6 rounded-3xl bg-[#FDFBF7] border border-slate-200/80 shadow-sm text-center space-y-2 hover:border-cyan-300 transition-all"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 font-sans tracking-tight">3.2 Triệu</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">Lượt Giải Bài & Tương Tác</div>
            <div className="text-[11px] text-slate-500 font-medium">Cộng đồng tự học lớn nhất toàn quốc</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-6 rounded-3xl bg-[#FDFBF7] border border-slate-200/80 shadow-sm text-center space-y-2 hover:border-emerald-300 transition-all"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 font-sans tracking-tight">99.2%</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">Độ Tin Cậy K-20 Đo Lường</div>
            <div className="text-[11px] text-slate-500 font-medium">Đã kiểm chứng trên 45.000 sĩ tử</div>
          </motion.div>

        </div>
      </section>

      {/* 4. BỘ TỨ CÔNG NGHỆ ĐỘC QUYỀN DẪN LỐI ĐIỂM 900+ */}
      <section id="tech-grid" className="py-20 px-6 lg:px-14 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider mb-2">
              KHOA HỌC KHẢO THÍ HIỆN ĐẠI
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 font-sans tracking-tight">
              Bộ Tứ Công Nghệ Độc Quyền Dẫn Lối Điểm 900+
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Không còn phương pháp học tràn lan, ngập tràn đề thi; kho dữ liệu thông minh và thuật toán gợi ý tuyến tính sẽ dẫn bạn tới từng cột mốc điểm số.
            </p>
          </motion.div>

          {/* Grid 2x2 Tech Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {techCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-5 hover:border-blue-400 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
                    <span className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">{card.subTag1}</span>
                    <span className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">{card.subTag2}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. LỘ TRÌNH 4 BƯỚC CHINH PHỤC ĐIỂM SỐ 900+ MỤC TIÊU */}
      <section id="process-steps" className="py-20 px-6 lg:px-14 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
              SỐ HÓA TỰ HỌC TỔNG THỂ 4 BƯỚC
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 font-sans tracking-tight">
              4 Bước Chinh Phục Điểm Số 900+ Mục Tiêu
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Khoa học giáo dục đã chứng minh học có phương pháp rút ngắn 65% thời gian so với tập đề làm tự do.
            </p>
          </motion.div>

          {/* 4 Process Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((st, idx) => (
              <motion.div
                key={st.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-6 rounded-3xl bg-[#FDFBF7] border border-slate-200/80 shadow-md space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md font-sans">
                    {st.step}
                  </div>
                  <h3 className="text-base font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <button
                  onClick={handleOpenDiagnosticConfirm}
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors pt-2 border-t border-slate-200/60"
                >
                  <span>{st.linkText}</span>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Big CTA Button */}
          <div className="text-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenDiagnosticConfirm}
              className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all inline-flex items-center gap-2"
            >
              <span>🚀 4 Bước Bắt Đầu Ngay Bây Giờ</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

        </div>
      </section>

      {/* 6. CÂU CHUYỆN THÀNH CÔNG TỪ SĨ TỬ ĐGNL KHÓA TRƯỚC */}
      <section id="testimonials" className="py-20 px-6 lg:px-14 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto space-y-12">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
              BẢNG VÀNG THÀNH TÍCH
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 font-sans tracking-tight">
              Câu Chuyện Thành Công Từ Sĩ Tử ĐGNL Khóa Trước
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Hàng ngàn học viên ĐGNL AI đã hiện thực hóa ước mơ bước chân vào giảng đường đại học mơ ước.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-extrabold text-slate-800 ml-2">{story.target}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                    "{story.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-blue-500 shrink-0">
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-950">{story.name}</div>
                    <div className="text-[11px] text-blue-600 font-bold">{story.uni}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="py-16 px-6 lg:px-14 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-10 lg:p-14 shadow-2xl text-center space-y-6">

            {/* Ambient Orbs inside Banner */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-cyan-200 text-xs font-black uppercase tracking-wider">
                ⚡ MỞ KHÓA TỰ HỌC THÔNG MINH
              </span>

              <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight mt-3">
                Đừng Để Sự Bất Định Cản Bước Ước Mơ Giảng Đường Đại Học Của Bạn
              </h2>

              <p className="text-sm text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
                Tham gia khảo sát chẩn đoán trình độ ngay hôm nay để nhận báo cáo năng lực IRT chi tiết và mở khóa lộ trình tự học cá nhân hóa hoàn toàn miễn phí.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleOpenDiagnosticConfirm}
                  className="px-8 py-4 rounded-full bg-white text-blue-800 font-black text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-xl hover:scale-105 cursor-pointer"
                >
                  🚀 Bắt đầu khảo sát chẩn đoán miễn phí
                </button>

                <button
                  onClick={onOpenArchModal}
                  className="px-6 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  🎬 Xem video hướng dẫn 3 phút
                </button>
              </div>

              <div className="text-[11px] text-cyan-200 font-medium pt-2">
                Không bắt buộc trả phí • Khởi tạo tài khoản tự học ngay chỉ sau 60 giây.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. MODULAR FOOTER */}
      <PublicFooter
        onOpenLogin={onOpenLogin}
        onOpenDiagnostic={handleOpenDiagnosticConfirm}
      />

      {/* ===================================================================== */}
      {/* 9. POPUP XÁC NHẬN VÀO THI THỬ & LỰA CHỌN ĐĂNG NHẬP LƯU KẾT QUẢ        */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showGuestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-900"
            >
              {/* Modal Top Gradient Header with Glow */}
              <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-black text-[#FACC15] uppercase tracking-wider backdrop-blur-xs">
                      <Zap className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                      <span>Khảo Thí Đầu Vào Chuẩn Hóa</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      Khảo Sát Năng Lực Đầu Vào V-ACT
                    </h2>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Bộ đề chuẩn hóa 30 câu đa miền đánh giá chính xác tham số năng lực khởi điểm IRT 2PL <strong className="text-[#FACC15] font-bold">Theta (θ₀)</strong>. Bạn có thể vào thi ngay hoặc đăng nhập để lưu kết quả.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGuestModal(false);
                      setPasscodeError('');
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
                {/* 4 Specs Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-800">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Clock className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-[11px] text-slate-500 font-bold">Thời gian</span>
                    <strong className="text-xs font-black text-slate-900">45 Phút</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <FileText className="w-4 h-4 text-purple-600 mb-1" />
                    <span className="text-[11px] text-slate-500 font-bold">Số câu hỏi</span>
                    <strong className="text-xs font-black text-slate-900">30 Câu</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Layers className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-[11px] text-slate-500 font-bold">Phạm vi</span>
                    <strong className="text-xs font-black text-slate-900">5 Miền thi</strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-[11px] text-emerald-700 font-bold">Mô hình</span>
                    <strong className="text-xs font-black text-emerald-800">IRT 2PL + ZPD</strong>
                  </div>
                </div>

                {/* OPTION 1: VÀO THI TRỰC TIẾP (KHÁCH / GUEST) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>1. Vào Thi Trực Tiếp (Chế Độ Khách)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                      Thi Ngay
                    </span>
                  </div>

                  {/* Passcode input row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-[11px] font-extrabold text-slate-600">Mã Code Phòng Thi:</label>
                      <button
                        type="button"
                        onClick={() => {
                          setExamPasscode('VACT2026');
                          setPasscodeError('');
                          setCodeCopied(true);
                          setTimeout(() => setCodeCopied(false), 2000);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? 'Đã điền!' : 'Mã mặc định: VACT2026'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={examPasscode}
                        onChange={(e) => {
                          setExamPasscode(e.target.value.toUpperCase());
                          setPasscodeError('');
                        }}
                        placeholder="Nhập mã phòng thi (Vd: VACT2026)..."
                        className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-300 font-mono text-sm font-black text-slate-900 uppercase tracking-widest focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-xs shadow-inner"
                      />
                    </div>

                    {passcodeError && (
                      <div className="text-xs font-bold text-rose-600 flex items-center gap-1 animate-pulse pt-0.5">
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span>{passcodeError}</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Launch Button */}
                  <button
                    type="button"
                    onClick={handleLaunchGuestExam}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀 Bắt Đầu Vào Làm Bài Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* OPTION 2: ĐĂNG NHẬP HOẶC ĐĂNG KÝ ĐỂ LƯU KẾT QUẢ */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/70 border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>2. Đăng Nhập / Đăng Ký Để Lưu Kết Quả</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Khuyên Dùng
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Để điểm số được ghi nhận vào <strong className="text-indigo-900">học bạ cá nhân</strong> và thuật toán AI tự động xếp bạn vào lớp vi mô mở <strong className="text-blue-900">Lộ Trình Học Thích Ứng (Flow 2)</strong>, bạn nên đăng nhập trước. Hệ thống sẽ tự động nhắc bạn quay lại bài thi ngay sau khi đăng nhập thành công.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleNavigateAuthWithIntent('login')}
                      className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs transition-all border border-slate-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:border-blue-400 active:scale-98"
                    >
                      <LogIn className="w-4 h-4 text-blue-600" />
                      <span>Đăng Nhập Tài Khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateAuthWithIntent('register')}
                      className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>✨ Đăng Ký Tài Khoản Mới</span>
                    </button>
                  </div>
                </div>

                {/* CANCEL / STAY ON LANDING PAGE */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuestModal(false);
                      setPasscodeError('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 px-4 cursor-pointer"
                  >
                    ✕ Hủy / Ở Lại Trang Chủ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
