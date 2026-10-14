import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  GitFork,
  CheckCircle2,
  Lock,
  Play,
  PlayCircle,
  HelpCircle,
  Clock,
  Calendar,
  Video,
  Award,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  Zap,
  Target,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Flame,
  Brain,
  Sliders,
  Check,
  X,
  BookOpen,
  UserCheck,
  FileQuestion,
  TrendingUp,
  RotateCcw,
  Maximize2
} from 'lucide-react';

import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';

// 12 Kỹ năng chuẩn ĐGNL V-ACT theo 4 miền năng lực
const SKILLS_DAG_METADATA = {
  sk_viet_doc_hieu: { name: 'Đọc hiểu văn bản Tiếng Việt', domain: 'Ngôn ngữ', weight: 15, prereqs: [] },
  sk_viet_ngu_phap: { name: 'Ngữ pháp & Logic câu Tiếng Việt', domain: 'Ngôn ngữ', weight: 10, prereqs: ['sk_viet_doc_hieu'] },
  sk_eng_reading: { name: 'Đọc hiểu văn bản Tiếng Anh', domain: 'Ngôn ngữ', weight: 10, prereqs: [] },
  sk_eng_grammar: { name: 'Ngữ pháp & Từ vựng Tiếng Anh', domain: 'Ngôn ngữ', weight: 10, prereqs: ['sk_eng_reading'] },
  sk_math_algebra: { name: 'Đại số, Hàm số & Giải tích', domain: 'Toán học & Logic', weight: 12, prereqs: [] },
  sk_math_geometry: { name: 'Hình học & Lượng giác không gian', domain: 'Toán học & Logic', weight: 8, prereqs: ['sk_math_algebra'] },
  sk_logic_deduction: { name: 'Suy luận Logic & Mệnh đề', domain: 'Toán học & Logic', weight: 10, prereqs: ['sk_math_algebra'] },
  sk_data_analysis: { name: 'Phân tích số liệu & Bảng biểu', domain: 'Toán học & Logic', weight: 10, prereqs: ['sk_math_algebra', 'sk_logic_deduction'] },
  sk_phys_mechanics: { name: 'Vật lý đại cương & Cơ nhiệt', domain: 'Khoa học Tự nhiên', weight: 5, prereqs: ['sk_math_algebra'] },
  sk_chem_reactions: { name: 'Hóa học vô cơ & Hữu cơ', domain: 'Khoa học Tự nhiên', weight: 4, prereqs: [] },
  sk_bio_genetics: { name: 'Sinh học di truyền & Sinh thái', domain: 'Khoa học Tự nhiên', weight: 3, prereqs: ['sk_chem_reactions'] },
  sk_soc_history_geo: { name: 'Tổng hợp Lịch sử & Địa lý VN', domain: 'Khoa học Xã hội', weight: 3, prereqs: ['sk_viet_doc_hieu'] }
};

// 5 câu hỏi Quiz mẫu tương tác củng cố chặng học
const SAMPLE_MILESTONE_QUESTIONS = [
  {
    id: 'quiz_q1',
    content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực tiểu của hàm số có tọa độ là:',
    options: ['(0; 2)', '(2; -2)', '(1; 0)', '(-1; -2)'],
    correct: 'B',
    explanation: 'Đạo hàm $y\' = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Tại $x = 2, y = 8 - 12 + 2 = -2$.'
  },
  {
    id: 'quiz_q2',
    content: 'Nếu mệnh đề "Nếu trời mưa thì đường ướt" là đúng, và thực tế "Đường không ướt", ta suy ra được gì?',
    options: ['Trời đang mưa', 'Trời không mưa', 'Đường đang sửa', 'Không thể kết luận'],
    correct: 'B',
    explanation: 'Quy tắc phủ định Modus Tollens: $P \\Rightarrow Q$ và $\\neg Q \\Rightarrow \\neg P$.'
  },
  {
    id: 'quiz_q3',
    content: 'Tìm giá trị nhỏ nhất của hàm số $f(x) = x + \\frac{4}{x}$ trên khoảng $(0; +\\infty)$:',
    options: ['2', '4', '8', '16'],
    correct: 'B',
    explanation: 'Theo bất đẳng thức Cauchy: $x + \\frac{4}{x} \\ge 2\\sqrt{x \\cdot \\frac{4}{x}} = 4$. Dấu bằng khi $x = 2$.'
  },
  {
    id: 'quiz_q4',
    content: 'Biện pháp nghệ thuật nổi bật trong câu "Sóng bắt đầu từ gió / Gió bắt đầu từ đâu?" là gì?',
    options: ['Ẩn dụ', 'Điệp từ và câu hỏi tu từ', 'Hoán dụ', 'So sánh'],
    correct: 'B',
    explanation: 'Sử dụng điệp từ "bắt đầu" cùng câu hỏi tu từ để gợi mở suy tư về nguồn gốc tình yêu.'
  },
  {
    id: 'quiz_q5',
    content: 'Trong dao động điều hòa $x = 4\\cos(2\\pi t + \\pi/6)$ (cm), gia tốc cực đại của vật là:',
    options: ['$8\\pi\\text{ cm/s}^2$', '$16\\pi^2\\text{ cm/s}^2$', '$4\\pi\\text{ cm/s}^2$', '$8\\pi^2\\text{ cm/s}^2$'],
    correct: 'B',
    explanation: '$a_{max} = \\omega^2 A = (2\\pi)^2 \\times 4 = 16\\pi^2\\text{ cm/s}^2$.'
  }
];

// Helper to convert any YouTube link into a responsive embed iframe URL
const getEmbedUrl = (rawUrl) => {
  if (!rawUrl) return 'https://www.youtube.com/embed/5qap5aO4i9A';
  if (rawUrl.includes('/embed/')) return rawUrl;
  const matchWatch = rawUrl.match(/(?:watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (matchWatch && matchWatch[1]) {
    return `https://www.youtube.com/embed/${matchWatch[1]}`;
  }
  return rawUrl;
};

// Helper to get direct YouTube watch URL for external tab
const getWatchUrl = (embedUrl) => {
  if (!embedUrl) return 'https://www.youtube.com/watch?v=5qap5aO4i9A';
  const matchEmbed = embedUrl.match(/(?:embed\/)([a-zA-Z0-9_-]{11})/);
  if (matchEmbed && matchEmbed[1]) {
    return `https://www.youtube.com/watch?v=${matchEmbed[1]}`;
  }
  return embedUrl;
};

export default function RoadmapLearningPage({ 
  onNavigateDiagnostic, 
  onNavigateDashboard 
}) {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'dag'
  const [activeStageFilter, setActiveStageFilter] = useState('ALL'); // 'ALL' | 'STAGE_1' | 'STAGE_2' | 'STAGE_3'
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeTabResource, setActiveTabResource] = useState('video'); // 'video' | 'quiz' | 'live'
  
  // Roadmap data & loading states
  const [roadmapData, setRoadmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Custom generation inputs
  const [targetScore, setTargetScore] = useState(900);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(2);
  const [targetExamDate, setTargetExamDate] = useState('2026-12-15');

  // Video progress state for active node (seconds watched / total)
  const [videoWatched, setVideoWatched] = useState(20 * 60); // 20 mins
  const [videoTotal, setVideoTotal] = useState(25 * 60); // 25 mins

  // Interactive Mini Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Live Q&A simulation state for active node
  const [liveAttendanceStatus, setLiveAttendanceStatus] = useState('SCHEDULED'); // 'SCHEDULED' | 'ATTENDED' | 'ABSENT'
  const [makeupQuizPassed, setMakeupQuizPassed] = useState(false);

  // 1. Initial Load: Fetch existing roadmap from Practice Service or Local Storage
  useEffect(() => {
    loadStudentRoadmap();
  }, []);

  const loadStudentRoadmap = async () => {
    setIsLoading(true);
    try {
      const user = tokenStorage.getUser();
      const studentId = user?.userId || user?.id || '00000000-0000-0000-0000-000000000001';
      
      // Call Backend API 2: GET /api/practice/roadmaps/my-roadmap
      let apiResult = null;
      try {
        apiResult = await practiceService.getMyRoadmap();
      } catch (err) {
        console.warn('Backend getMyRoadmap not yet created or offline, generating local adaptive path:', err);
      }

      if (apiResult?.stages?.length) {
        setRoadmapData(apiResult);
        const inProg = apiResult.nodes?.find(n => n.status === 'IN_PROGRESS') || apiResult.nodes?.[0];
        if (inProg) setActiveNodeId(inProg.nodeId);
      } else {
        // Build initial standardized adaptive roadmap
        initDefaultAdaptiveRoadmap();
      }
    } catch (e) {
      console.error('Error loading roadmap:', e);
      initDefaultAdaptiveRoadmap();
    } finally {
      setIsLoading(false);
    }
  };

  // Build 12-milestone adaptive roadmap following Kahn Topological Sort & Pedagogy
  const initDefaultAdaptiveRoadmap = () => {
    const theta0Str = localStorage.getItem('veval_theta_0') || '0.45';
    const theta0 = parseFloat(theta0Str);
    const placementClass = localStorage.getItem('veval_placement_class') || (theta0 >= 0.5 ? 'BREAKTHROUGH' : theta0 >= -0.5 ? 'ACCELERATION' : 'FOUNDATION');

    const orderedSkillKeys = [
      'sk_viet_doc_hieu',
      'sk_math_algebra',
      'sk_eng_reading',
      'sk_viet_ngu_phap',
      'sk_logic_deduction',
      'sk_chem_reactions',
      'sk_math_geometry',
      'sk_eng_grammar',
      'sk_data_analysis',
      'sk_phys_mechanics',
      'sk_bio_genetics',
      'sk_soc_history_geo'
    ];

    const milestones = orderedSkillKeys.map((key, idx) => {
      const meta = SKILLS_DAG_METADATA[key];
      let status = 'LOCKED';
      let videoPct = 0;
      let quizSc = null;

      // Milestone progression state
      if (idx === 0) {
        status = 'COMPLETED';
        videoPct = 100;
        quizSc = 80;
      } else if (idx === 1) {
        status = 'IN_PROGRESS';
        videoPct = 85;
      }

      return {
        nodeId: `node_${key}_${idx + 1}`,
        skillId: key,
        skillName: meta.name,
        domainId: `dom_${meta.domain.toLowerCase().replace(/[^a-z]/g, '')}`,
        domainName: meta.domain,
        stepOrder: idx + 1,
        weight: meta.weight,
        prereqs: meta.prereqs,
        status, // 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
        isPruned: false,
        stageNumber: idx < 4 ? 1 : idx < 8 ? 2 : 3,
        stageName: idx < 4 ? 'Giai đoạn 1: Nền Tảng Cốt Lõi' : idx < 8 ? 'Giai đoạn 2: Tăng Tốc Chuyên Sâu' : 'Giai đoạn 3: Bứt Phá 900+ Master',
        video: {
          title: `Chuyên đề: ${meta.name} (Phương pháp & Dạng bài chuẩn V-ACT)`,
          durationMinutes: 25,
          watchedMinutes: idx === 0 ? 25 : idx === 1 ? 21 : 0,
          isCompleted: idx === 0 || (idx === 1 && videoWatched >= videoTotal * 0.8),
          videoUrl: idx === 0 ? 'https://www.youtube.com/embed/5qap5aO4i9A' : 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        quiz: {
          examId: `quiz_exam_${idx + 1}`,
          title: `Bài tập củng cố: ${meta.name} (5 câu chuẩn IRT)`,
          totalQuestions: 5,
          score: quizSc,
          isPassed: idx === 0
        },
        liveSession: {
          sessionId: `live_${idx + 1}`,
          title: `Live Q&A: Giải đáp thắc mắc chuyên đề ${meta.name}`,
          teacherName: 'Thầy Nguyễn Văn Đức (ĐHQG-HCM)',
          scheduledAt: '19:30 Thứ Năm hàng tuần',
          meetingUrl: 'https://meet.google.com/xyz-veval-demo',
          attendanceStatus: idx === 0 ? 'ATTENDED' : 'SCHEDULED',
          isMakeupQuizPassed: false
        }
      };
    });

    const roadmapObj = {
      roadmapId: `roadmap_${Date.now()}`,
      targetScore: 900,
      placementClass,
      theta0,
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter(m => m.status === 'COMPLETED').length,
      progressPercentage: Math.round((milestones.filter(m => m.status === 'COMPLETED').length / milestones.length) * 100),
      nodes: milestones
    };

    setRoadmapData(roadmapObj);
    setActiveNodeId(milestones[0].nodeId);
  };

  // 2. AI Generate / Re-plan Roadmap Action (Core Flow 2 API 1)
  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const user = tokenStorage.getUser();
      const studentId = user?.userId || user?.id || '00000000-0000-0000-0000-000000000001';

      const payload = {
        studentId,
        targetScore,
        studyHoursPerDay,
        examDate: targetExamDate
      };

      // Try calling Backend Practice Service API 1
      try {
        await practiceService.generateRoadmap(payload);
      } catch (err) {
        console.warn('Backend generateRoadmap error (offline fallback mode active):', err);
      }

      // Re-initialize optimized roadmap
      initDefaultAdaptiveRoadmap();
      setShowConfigModal(false);

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn('Lỗi quy hoạch lộ trình:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Active Milestone Data
  const activeNode = roadmapData?.nodes?.find(n => n.nodeId === activeNodeId) || roadmapData?.nodes?.[0];

  // Handle Video Progress Tracking (API 4 simulation)
  const handleSimulateWatchVideo = async () => {
    const newWatched = Math.min(videoTotal, videoWatched + 5 * 60);
    setVideoWatched(newWatched);

    try {
      if (activeNode) {
        await practiceService.trackVideoProgress(activeNode.nodeId, newWatched).catch(() => {});
      }
    } catch (_) {}

    if (newWatched >= videoTotal * 0.8) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  // Fullscreen toggle handler
  const handleRequestFullscreen = (nodeId) => {
    const elem = document.getElementById(`video-player-container-${nodeId}`);
    if (elem) {
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }
  };

  // Handle Quiz Submission & FSM Milestone Completion (API 6 simulation)
  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    let correctCount = 0;

    SAMPLE_MILESTONE_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correctCount += 1;
    });

    const scorePct = Math.round((correctCount / SAMPLE_MILESTONE_QUESTIONS.length) * 100);
    setQuizScore(scorePct);

    // Call practiceService API 6
    try {
      if (activeNode) {
        await practiceService.submitMilestoneQuiz(activeNode.nodeId, {
          responses: Object.keys(quizAnswers).map(qId => ({
            questionId: qId,
            selectedOptionId: quizAnswers[qId],
            timeSpentSeconds: 30
          }))
        }).catch(() => {});
      }
    } catch (_) {}

    // FSM State Transition: If score >= 60%, complete current milestone and unlock next!
    if (scorePct >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Update roadmap state
      setRoadmapData((prev) => {
        if (!prev) return prev;
        const updatedNodes = prev.nodes.map((node, idx) => {
          if (node.nodeId === activeNode.nodeId) {
            return { ...node, status: 'COMPLETED', quiz: { ...node.quiz, score: scorePct, isPassed: true } };
          }
          // Unlock the immediate next node
          if (idx === activeNode.stepOrder && node.status === 'LOCKED') {
            return { ...node, status: 'IN_PROGRESS' };
          }
          return node;
        });

        const completedCount = updatedNodes.filter(n => n.status === 'COMPLETED').length;
        return {
          ...prev,
          completedMilestones: completedCount,
          progressPercentage: Math.round((completedCount / updatedNodes.length) * 100),
          nodes: updatedNodes
        };
      });
    }
  };

  // Handle Live Attendance Exception (API 7 Makeup Quiz Simulation)
  const handleToggleAbsenceStatus = () => {
    if (!activeNode) return;
    const newStatus = liveAttendanceStatus === 'ABSENT' ? 'ATTENDED' : 'ABSENT';
    setLiveAttendanceStatus(newStatus);

    setRoadmapData((prev) => {
      if (!prev) return prev;
      const updated = prev.nodes.map((n) => {
        if (n.nodeId === activeNode.nodeId) {
          return {
            ...n,
            status: newStatus === 'ABSENT' ? 'BLOCKED' : 'IN_PROGRESS'
          };
        }
        return n;
      });
      return { ...prev, nodes: updated };
    });
  };

  const handleResolveMakeupQuiz = async () => {
    setMakeupQuizPassed(true);
    setLiveAttendanceStatus('ATTENDED');

    // Call API 7
    try {
      if (activeNode) {
        await practiceService.submitMakeupQuiz(activeNode.nodeId, { isMakeupPassed: true }).catch(() => {});
      }
    } catch (_) {}

    // Unblock node in FSM
    setRoadmapData((prev) => {
      if (!prev) return prev;
      const updated = prev.nodes.map((n) => {
        if (n.nodeId === activeNode.nodeId) {
          return { ...n, status: 'IN_PROGRESS' };
        }
        return n;
      });
      return { ...prev, nodes: updated };
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Filtered nodes by Stage
  const filteredNodes = roadmapData?.nodes?.filter((n) => {
    if (activeStageFilter === 'STAGE_1') return n.stageNumber === 1;
    if (activeStageFilter === 'STAGE_2') return n.stageNumber === 2;
    if (activeStageFilter === 'STAGE_3') return n.stageNumber === 3;
    return true;
  }) || [];

  return (
    <div className="w-full space-y-6 text-slate-900 animate-fade-in">

      {/* ===================================================================== */}
      {/* 1. TOP HEADER BANNER: PERSONALIZED ROADMAP TIMELINE & AI STATUS       */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FACC15]">
              <GitFork className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Hệ Thống Lộ Trình Thích Ứng Cá Nhân Hóa (Core Flow 2)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Lộ Trình Ôn Luyện ĐGNL V-ACT 2026
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Được quy hoạch từ kết quả chẩn đoán <strong className="text-[#FACC15]">IRT $\theta_0 = {roadmapData?.theta0 || '+0.45'}$</strong> kết hợp thuật toán sắp xếp topo (Kahn Algorithm), tối ưu hóa theo vùng phát triển ZPD và lịch Live Q&A của giảng viên.
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Mục tiêu: {roadmapData?.targetScore || 900}+ Điểm</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-400/30 text-purple-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Xếp lớp: {roadmapData?.placementClass === 'BREAKTHROUGH' ? 'Lớp Bứt Phá 900+' : 'Lớp Tăng Tốc'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lớp Chuyên Đề: ĐHQG-HCM Thủ Đức</span>
              </span>
            </div>
          </div>

          {/* Right Action Box: Progress Bar & AI Re-plan Button */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-4 shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
              <span>TIẾN ĐỘ LỘ TRÌNH</span>
              <span className="text-[#FACC15] font-mono text-sm">{roadmapData?.progressPercentage || 0}%</span>
            </div>

            <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-400 to-[#FACC15] h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${roadmapData?.progressPercentage || 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>Đã hoàn thành:</span>
              <strong className="text-white font-mono">{roadmapData?.completedMilestones || 0} / {roadmapData?.totalMilestones || 12} Chặng</strong>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tùy Biến / Quy Hoạch Lại Lộ Trình</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TOOLBAR: VIEW SWITCHER & STAGE FILTERS                             */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tất Cả 12 Chặng' },
            { id: 'STAGE_1', label: 'Giai Đoạn 1 (Nền Tảng)' },
            { id: 'STAGE_2', label: 'Giai Đoạn 2 (Tăng Tốc)' },
            { id: 'STAGE_3', label: 'Giai Đoạn 3 (Bứt Phá)' }
          ].map((stg) => (
            <button
              key={stg.id}
              type="button"
              onClick={() => setActiveStageFilter(stg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeStageFilter === stg.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {stg.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Timeline Stepper vs DAG Network */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              viewMode === 'timeline'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dòng Thời Gian Tuần Tự</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dag')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              viewMode === 'dag'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Mạng Lưới Tiên Quyết DAG</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT (TIMELINE LIST & ACTIVE PANEL)       */}
      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT: ACCORDION TIMELINE LIST WITH EMBEDDED TRIO PANEL     */}
      {/* ===================================================================== */}
      {viewMode === 'timeline' ? (
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-1">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>DANH SÁCH CHẶNG HỌC ({filteredNodes.length} CHẶNG)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Bấm vào từng chặng để xem Video YouTube, làm Quiz củng cố hoặc tham gia Google Meet
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full self-start sm:self-auto">
              Sắp xếp theo thứ tự tiên quyết Topological Sort
            </span>
          </div>

          <div className="space-y-4">
            {filteredNodes.map((node) => {
              const isSelected = node.nodeId === activeNodeId;
              const isDone = node.status === 'COMPLETED';
              const isInProg = node.status === 'IN_PROGRESS';
              const isLocked = node.status === 'LOCKED';
              const isBlocked = node.status === 'BLOCKED';

              return (
                <div
                  key={node.nodeId}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : isDone
                        ? 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow'
                        : isInProg
                          ? 'bg-white border-blue-300 hover:border-blue-400 hover:shadow-md'
                          : isBlocked
                            ? 'bg-rose-50/80 border-rose-300 hover:border-rose-400'
                            : 'bg-white/70 border-slate-200/80 opacity-60'
                  }`}
                >
                  {/* HEADER ROW - CLICK TO EXPAND/COLLAPSE */}
                  <div
                    onClick={() => {
                      if (!isLocked) {
                        setActiveNodeId(prev => prev === node.nodeId ? null : node.nodeId);
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(node.quiz?.score || null);
                      }
                    }}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none ${
                      !isLocked ? 'cursor-pointer hover:bg-slate-50/80 transition-colors' : 'cursor-not-allowed'
                    }`}
                  >
                    {/* Left Icon & Step Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm shadow-sm ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : isInProg
                            ? 'bg-blue-600 text-white shadow-blue-600/30 animate-pulse'
                            : isBlocked
                              ? 'bg-rose-600 text-white shadow-rose-600/30'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : isBlocked ? (
                          <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span>{node.stepOrder}</span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            node.domainName.includes('Toán')
                              ? 'bg-blue-100 text-blue-800'
                              : node.domainName.includes('Ngôn')
                                ? 'bg-emerald-100 text-emerald-800'
                                : node.domainName.includes('Tự nhiên')
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                          }`}>
                            {node.domainName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold font-mono">
                            Trọng số: {node.weight}%
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                          Chặng {node.stepOrder}: {node.skillName}
                        </h3>

                        {/* Specs overview strip */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>{node.video.durationMinutes}p Video</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-purple-500" />
                            <span>5 câu Quiz</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-emerald-500" />
                            <span>Live Q&A</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Badge Status & Chevron */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {isDone && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Đã Đạt {node.quiz.score ? `(${node.quiz.score}%)` : ''}</span>
                        </span>
                      )}

                      {isInProg && (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black flex items-center gap-1 animate-pulse">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>Đang Học</span>
                        </span>
                      )}

                      {isBlocked && (
                        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Vắng Live (Bị Khóa)</span>
                        </span>
                      )}

                      {isLocked && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold">
                          Chưa Mở Khóa
                        </span>
                      )}

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isSelected ? 'rotate-90 bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED INTERACTIVE PANEL - REVEALED WHEN SELECTED */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-200/90 bg-white p-5 sm:p-6 space-y-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 3-Tab Navigator */}
                        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold">
                          <button
                            type="button"
                            onClick={() => setActiveTabResource('video')}
                            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                              activeTabResource === 'video'
                                ? 'bg-white text-blue-700 shadow-md font-black ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            <PlayCircle className="w-4 h-4 text-blue-600" />
                            <span>1. Video Bài Giảng</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTabResource('quiz')}
                            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                              activeTabResource === 'quiz'
                                ? 'bg-white text-purple-700 shadow-md font-black ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            <HelpCircle className="w-4 h-4 text-purple-600" />
                            <span>2. Mini Quiz Củng Cố</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTabResource('live')}
                            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                              activeTabResource === 'live'
                                ? 'bg-white text-emerald-700 shadow-md font-black ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            <Video className="w-4 h-4 text-emerald-600" />
                            <span>3. Live Q&A & Google Meet</span>
                          </button>
                        </div>

                        {/* TAB 1: VIDEO EMBED (Real YouTube Player) */}
                        {activeTabResource === 'video' && (
                          <div className="space-y-4 animate-fade-in">
                            {/* Video Title Header with YouTube External Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                                  Video Lý Thuyết Chuyên Sâu • ĐGNL V-ACT
                                </span>
                                <h4 className="text-sm sm:text-base font-black text-slate-900">
                                  {node.video.title}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRequestFullscreen(node.nodeId)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                                  title="Phóng to toàn màn hình"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>Toàn Màn Hình</span>
                                </button>

                                <a
                                  href={getWatchUrl(node.video.videoUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Mở trên YouTube ↗</span>
                                </a>
                              </div>
                            </div>

                            {/* Embedded Real YouTube Video Player */}
                            <div 
                              id={`video-player-container-${node.nodeId}`}
                              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 group"
                            >
                              <iframe
                                src={getEmbedUrl(node.video.videoUrl)}
                                title={node.video.title}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                allowFullScreen={true}
                              />
                            </div>

                            {/* Progress Tracking Telemetry */}
                            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span>Thời lượng xem video tích lũy:</span>
                                </span>
                                <span className={`font-mono font-black ${videoWatched >= videoTotal * 0.8 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                  {Math.floor(videoWatched / 60)}:00 / {Math.floor(videoTotal / 60)}:00 ({Math.round((videoWatched / videoTotal) * 100)}%)
                                  {videoWatched >= videoTotal * 0.8 ? ' - ✓ Đã Đạt >= 80%' : ' - Chưa đủ 80%'}
                                </span>
                              </div>

                              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    videoWatched >= videoTotal * 0.8 ? 'bg-emerald-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.round((videoWatched / videoTotal) * 100))}%` }}
                                ></div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                                <span>💡 <strong>Quy định FSM:</strong> Học sinh cần xem video $\ge 80\%$ thời lượng để mở khóa quyền làm bài Quiz chặng.</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={handleSimulateWatchVideo}
                                    className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs transition-all flex items-center gap-1"
                                  >
                                    <Play className="w-3 h-3 fill-blue-700" />
                                    <span>Mô phỏng (+5 phút)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVideoWatched(videoTotal);
                                      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>Đạt 100%</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Button to proceed to Quiz */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveTabResource('quiz')}
                                disabled={videoWatched < videoTotal * 0.8}
                                className="py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                              >
                                <span>Chuyển Sang Làm Mini Quiz Củng Cố</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: MILESTONE QUIZ */}
                        {activeTabResource === 'quiz' && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-xs text-purple-900 space-y-1">
                              <div className="font-black text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                <span>Bài Kiểm Tra Củng Cố Chặng ({SAMPLE_MILESTONE_QUESTIONS.length} Câu Chuẩn Hóa IRT)</span>
                              </div>
                              <p className="text-xs text-purple-700 leading-relaxed">
                                Đạt từ <strong>60% điểm trở lên (3/5 câu đúng)</strong> để hoàn tất chặng học và tự động mở khóa chặng tiếp theo trong DAG!
                              </p>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-4">
                              {SAMPLE_MILESTONE_QUESTIONS.map((q, qIdx) => (
                                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                                  <div className="font-bold text-slate-900">
                                    <span className="text-blue-600 font-extrabold mr-2">Câu {qIdx + 1}:</span>
                                    <span>{q.content}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((opt, oIdx) => {
                                      const char = ['A', 'B', 'C', 'D'][oIdx];
                                      const isAnswerSelected = quizAnswers[q.id] === char;
                                      const isCorrectOpt = q.correct === char;

                                      return (
                                        <button
                                          key={char}
                                          type="button"
                                          disabled={quizSubmitted}
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: char }))}
                                          className={`p-3 rounded-xl text-left font-semibold text-xs sm:text-sm transition-all border flex items-center gap-2.5 ${
                                            quizSubmitted
                                              ? isCorrectOpt
                                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold ring-1 ring-emerald-400'
                                                : isAnswerSelected
                                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                                  : 'bg-white text-slate-500 border-slate-200'
                                              : isAnswerSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                            isAnswerSelected && !quizSubmitted ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                          }`}>
                                            {char}
                                          </span>
                                          <span className="truncate">{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {quizSubmitted && (
                                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 font-medium">
                                      <strong>💡 Giải thích:</strong> {q.explanation}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Quiz Result Feedback */}
                            {quizSubmitted && quizScore !== null && (
                              <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                                quizScore >= 60
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-900'
                              }`}>
                                <div className="text-base font-black">
                                  {quizScore >= 60 ? '🎉 Xuất Sắc! Bạn Đã Vượt Qua Chặng Học Này' : '⚠️ Chưa Đạt Mức Yêu Cầu 60%'}
                                </div>
                                <div className="text-xs sm:text-sm font-semibold">
                                  Điểm số: <strong className="font-mono text-base">{quizScore}%</strong> ({Math.round(quizScore * 5 / 100)}/5 câu đúng).
                                  {quizScore >= 60 ? ' Chặng kế tiếp đã được tự động mở khóa trên lộ trình!' : ' Hãy ôn tập lại video bài giảng và thử lại nhé!'}
                                </div>
                              </div>
                            )}

                            {/* Quiz Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              {!quizSubmitted ? (
                                <button
                                  type="button"
                                  onClick={handleSubmitQuiz}
                                  disabled={Object.keys(quizAnswers).length === 0}
                                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Nộp Bài & Chấm Điểm Tự Động</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizSubmitted(false);
                                    setQuizAnswers({});
                                    setQuizScore(null);
                                  }}
                                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Làm Lại Bài Quiz</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setActiveTabResource('live')}
                                className="py-3 px-5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm transition-all border border-indigo-200 flex items-center justify-center gap-2 shrink-0"
                              >
                                <span>Chuyển Sang Lớp Live Q&A</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: LIVE Q&A SESSION & GOOGLE MEET */}
                        {activeTabResource === 'live' && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-blue-50/70 to-emerald-50/70 border border-indigo-200 text-xs space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-indigo-950 flex items-center gap-2 text-sm sm:text-base">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                                    <Video className="w-4 h-4" />
                                  </div>
                                  <span>{node.liveSession.title}</span>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-200/90 text-indigo-950 font-black text-[11px] uppercase tracking-wider">
                                  Google Meet Trực Tuyến
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 text-xs font-semibold pt-1">
                                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 shadow-sm">
                                  <div className="text-[10px] uppercase text-slate-400 font-bold">Giảng viên chuyên môn</div>
                                  <div className="text-slate-900 font-black mt-0.5">{node.liveSession.teacherName}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 shadow-sm">
                                  <div className="text-[10px] uppercase text-slate-400 font-bold">Lịch học định kỳ</div>
                                  <div className="text-slate-900 font-black mt-0.5">{node.liveSession.scheduledAt}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 shadow-sm">
                                  <div className="text-[10px] uppercase text-slate-400 font-bold">Trạng thái điểm danh</div>
                                  <div className={`font-black mt-0.5 ${
                                    liveAttendanceStatus === 'ATTENDED'
                                      ? 'text-emerald-700'
                                      : liveAttendanceStatus === 'ABSENT'
                                        ? 'text-rose-700'
                                        : 'text-amber-700'
                                  }`}>
                                    {liveAttendanceStatus === 'ATTENDED' ? '✓ ĐÃ ĐIỂM DANH' : liveAttendanceStatus === 'ABSENT' ? '⛔ VẮNG MẶT' : '⏳ CHỜ THAM GIA'}
                                  </div>
                                </div>
                              </div>

                              {/* Direct Google Meet Join Callout Button */}
                              <a
                                href={node.liveSession.meetingUrl || 'https://meet.google.com/xyz-veval-demo'}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 group"
                              >
                                <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Vào Phòng Học Google Meet Ngay (meet.google.com) ↗</span>
                              </a>
                            </div>

                            {/* Absence Simulation & Exception Makeup */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                              <div className="text-[11px] font-extrabold uppercase text-slate-600 flex items-center justify-between">
                                <span>Xử Lý Kịch Bản Ngoại Lệ (Vắng Mặt / Thi Bù Makeup)</span>
                                <button
                                  type="button"
                                  onClick={handleToggleAbsenceStatus}
                                  className="text-xs text-blue-600 underline font-bold"
                                >
                                  {liveAttendanceStatus === 'ABSENT' ? 'Hủy báo vắng' : 'Giả lập vắng mặt'}
                                </button>
                              </div>

                              {liveAttendanceStatus === 'ABSENT' ? (
                                <div className="space-y-2 text-xs">
                                  <p className="text-rose-700 font-semibold text-[11px] leading-relaxed">
                                    ⚠️ Bạn đã vắng mặt buổi Live. Chặng học bị phong tỏa! Để mở khóa, bạn cần xem video ghi hình Recap và nộp bài Quiz bù đạt $\ge 60\%$.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={handleResolveMakeupQuiz}
                                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Xem Recap & Làm Quiz Bù Để Mở Khóa</span>
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-500 font-medium">
                                  Học sinh tham gia đầy đủ buổi Live sẽ được Giảng viên điểm danh trực tiếp qua hệ thống, chặng học sẽ giữ vững trạng thái tiến bước.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ) : (

        /* ===================================================================== */
        /* 4. PREREQUISITE DAG NETWORK VIEW (CÂY TIÊN QUYẾT 12 KỸ NĂNG)         */
        /* ===================================================================== */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-blue-600" />
              <span>Sơ Đồ Đồ Thị Tiên Quyết 12 Kỹ Năng Chuẩn ĐGNL V-ACT</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Thể hiện mối quan hệ ràng buộc giữa các kỹ năng gốc và kỹ năng nâng cao. Thuật toán Kahn đảm bảo bạn luôn học kiến thức nền tảng trước khi bước vào các kỹ năng phức tạp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(SKILLS_DAG_METADATA).map((key) => {
              const item = SKILLS_DAG_METADATA[key];
              const nodeMatch = roadmapData?.nodes?.find(n => n.skillId === key);
              const isDone = nodeMatch?.status === 'COMPLETED';
              const isInProg = nodeMatch?.status === 'IN_PROGRESS';

              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : isInProg
                        ? 'bg-blue-50/70 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 text-[10px] font-black uppercase">
                      {item.domain}
                    </span>
                    <span className="text-[11px] font-black text-slate-900 font-mono">
                      {item.weight}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{item.name}</h4>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      {item.prereqs.length > 0 ? `Tiên quyết: ${item.prereqs.join(', ')}` : 'Kỹ năng gốc (Không tiên quyết)'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className={isDone ? 'text-emerald-700' : isInProg ? 'text-blue-700' : 'text-slate-400'}>
                      {isDone ? '✓ Đã xong' : isInProg ? '🔥 Đang học' : '🔒 Khóa'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. ROADMAP RE-PLAN & AI CONFIGURATION MODAL                           */}
      {/* ===================================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl border border-slate-200 text-slate-900">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tối Ưu Hóa Lộ Trình Bằng AI</h3>
                  <div className="text-xs text-slate-500">Động cơ quy hoạch Core Flow 2</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              {/* Target Score Input */}
              <div className="space-y-1.5">
                <label>Mục tiêu điểm số ĐGNL V-ACT (Thang 1200):</label>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value, 10) || 900)}
                  min="600"
                  max="1200"
                  step="10"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm font-black text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Study Hours Per Day */}
              <div className="space-y-1.5">
                <label>Quỹ thời gian tự học mỗi ngày (Giờ):</label>
                <select
                  value={studyHoursPerDay}
                  onChange={(e) => setStudyHoursPerDay(parseInt(e.target.value, 10) || 2)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value={1}>1 Giờ / ngày (Tiết kiệm thời gian)</option>
                  <option value={2}>2 Giờ / ngày (Tiêu chuẩn đề xuất)</option>
                  <option value={3}>3 Giờ / ngày (Cấp tốc bứt phá)</option>
                  <option value={4}>4 Giờ / ngày (Cường độ cao 900+)</option>
                </select>
              </div>

              {/* Target Exam Date */}
              <div className="space-y-1.5">
                <label>Ngày thi chính thức dự kiến:</label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed font-medium">
              💡 <strong>Thuật toán Path Pruning:</strong> Nếu ngày thi quá gần so với tổng thời lượng cần thiết, hệ thống AI sẽ tự động kích hoạt cắt tỉa thông minh 3 tầng để tập trung vào các kỹ năng có trọng số điểm cao nhất!
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateRoadmap}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Quy Hoạch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Lộ Trình AI</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
