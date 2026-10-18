import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Sparkles,
  Clock,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  Send,
  FileText,
  Layers,
  HelpCircle,
  Bot,
  Zap,
  BarChart3,
  BookOpen,
  ArrowRight,
  Check,
  X,
  MessageSquare,
  TrendingUp,
  Gauge,
  CheckSquare,
  Eye,
  AlertTriangle,
  Building2,
  Filter,
  ShieldAlert,
  Copy,
  LogIn,
  Lock,
  History,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';

import { aiService } from '../../services/aiService';
import { contentService } from '../../services/contentService';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import MathText from '../common/MathText';
import { DOMAINS, getFallbackDiagnosticResult, getDefaultExamHistory, SAMPLE_30_QUESTIONS } from './diagnosticData';

// Danh mục bài kiểm tra khảo thí chuẩn hóa V-ACT
const EXAM_LIST = [
  {
    id: 'diag_30_vact',
    title: 'Bài Khảo Sát Năng Lực Đầu Vào 30 Câu V-ACT 2026',
    courseName: 'Khóa Khảo Thí & Chẩn Đoán Năng Lực Ban Đầu (V-Eval Core)',
    schoolName: 'Hệ Thống Khảo Thí V-Eval Capstone & ĐHQG-HCM',
    openTime: '08:00 01/10/2026',
    closeTime: '23:59 31/10/2026',
    status: 'OPEN',
    questionCount: 30,
    durationMinutes: 45,
    domainsCount: 5,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'VACT2026',
    badge: 'ĐỀ MẪU NỔI BẬT',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Đánh giá 5 miền năng lực (Ngôn ngữ, Logic, Toán học, KHTN, KHXH) nhằm ước lượng năng lực IRT theta_0 và gợi ý lộ trình bứt phá điểm số 900+.'
  },
  {
    id: 'full_120_mock',
    title: 'Đề Thi Thử Tổng Hợp ĐGNL ĐHQG-HCM Mã Đề 101',
    courseName: 'Khóa Luyện Thi Chuyên Sâu ĐGNL ĐHQG-HCM 900+',
    schoolName: 'Hội Đồng Khảo Thí V-Eval & Trung Tâm ĐHQG-HCM',
    openTime: '06:00 05/10/2026',
    closeTime: '23:59 25/10/2026',
    status: 'OPEN',
    questionCount: 120,
    durationMinutes: 150,
    domainsCount: 3,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'HCM120',
    badge: 'ĐỀ THI THỬ TỔNG HỢP',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Mô phỏng 100% cấu trúc 120 câu ĐGNL chính thức ĐHQG-HCM. Đánh giá toàn diện 3 phần thi với thang điểm 1200.'
  },
  {
    id: 'logic_15_quick',
    title: 'Đề Kiểm Tra Nhanh Tư Duy Logic & Phân Tích Biểu Đồ',
    courseName: 'Chuyên Đề Tư Duy Logic & Phân Tích Số Liệu Nâng Cao',
    schoolName: 'V-Eval AI Psychometrics Lab',
    openTime: '00:00 01/10/2026',
    closeTime: '23:59 31/12/2026',
    status: 'OPEN',
    questionCount: 15,
    durationMinutes: 20,
    domainsCount: 1,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'LOGIC15',
    badge: 'CHUYÊN SÂU AI',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Bài kiểm tra phản xạ 15 câu đo lường tốc độ xử lý câu hỏi logic, suy luận mệnh đề và đọc hiểu biểu đồ số liệu.'
  }
];

// Hàm chuyển đổi DTO đề thi từ Content Service thành cấu trúc câu hỏi hiển thị
function transformBackendExamToQuestions(examDto) {
  if (!examDto) return { title: '', durationMinutes: 45, totalQuestions: 0, questions: [] };

  const allQuestions = [];

  // 1. Xử lý các chùm câu hỏi đọc hiểu (Passages)
  if (Array.isArray(examDto.passages)) {
    examDto.passages.forEach((passage) => {
      const pQuestions = passage.questions || [];
      pQuestions.forEach((q) => {
        const optDict = q.options || {};
        const optionsList = ['A', 'B', 'C', 'D'].map((k) => optDict[k] || '');
        const skillName = q.suggestedSkillName || q.skillName || 'Tư duy logic & Phân tích';
        const domainInfo = mapSkillToDomain(skillName, (q.questionNumber || 1) - 1);

        const startQ = passage.startQuestion ?? passage.start_question ?? passage.StartQuestion;
        const endQ = passage.endQuestion ?? passage.end_question ?? passage.EndQuestion;
        const passageTitle = (startQ && endQ)
          ? `Ngữ liệu đọc hiểu (Câu ${startQ} - ${endQ})`
          : (passage.title || 'Ngữ liệu đọc hiểu');

        allQuestions.push({
          id: q.questionId,
          question_number: q.questionNumber,
          passage_content: passage.content || '',
          passage_title: passageTitle,
          content: q.content || '',
          options: optionsList,
          skill_id: q.skillId || 'sk_vact',
          skill_name: skillName,
          domain_id: domainInfo.id,
          domain_name: domainInfo.name,
          bloom: q.difficultyLevel || 2
        });
      });
    });
  }

  // 2. Xử lý các câu hỏi đơn lẻ (Single Questions)
  if (Array.isArray(examDto.singleQuestions)) {
    examDto.singleQuestions.forEach((q) => {
      const optDict = q.options || {};
      const optionsList = ['A', 'B', 'C', 'D'].map((k) => optDict[k] || '');
      const skillName = q.suggestedSkillName || q.skillName || 'Toán học & Giải quyết vấn đề';
      const domainInfo = mapSkillToDomain(skillName, (q.questionNumber || 1) - 1);

      allQuestions.push({
        id: q.questionId,
        question_number: q.questionNumber,
        passage_content: '',
        passage_title: '',
        content: q.content || '',
        options: optionsList,
        skill_id: q.skillId || 'sk_vact',
        skill_name: skillName,
        domain_id: domainInfo.id,
        domain_name: domainInfo.name,
        bloom: q.difficultyLevel || 2
      });
    });
  }

  // Sắp xếp tuần tự từ 1 đến N
  allQuestions.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

  return {
    id: examDto.examId,
    title: examDto.title || 'Bài Khảo Sát Đánh Giá Năng Lực Chuẩn Hóa V-ACT',
    durationMinutes: examDto.durationMinutes || 45,
    totalQuestions: examDto.totalQuestions || allQuestions.length,
    questions: allQuestions
  };
}

// Hàm ánh xạ kỹ năng sang lĩnh vực chuẩn xác
function mapSkillToDomain(skillName, index) {
  const s = String(skillName || '').toLowerCase();
  if (
    s.includes('tiếng việt') || s.includes('english') || s.includes('đọc hiểu') ||
    s.includes('văn bản') || s.includes('từ ngữ') || s.includes('vocabulary') ||
    s.includes('factual') || s.includes('pronoun') || s.includes('inference') || s.includes('ngữ pháp')
  ) {
    return { id: 'dom_lang', name: DOMAINS.dom_lang.name };
  }
  if (s.includes('logic') || s.includes('suy luận') || s.includes('tư duy') || s.includes('mệnh đề')) {
    return { id: 'dom_logic', name: DOMAINS.dom_logic.name };
  }
  if (
    s.includes('số liệu') || s.includes('toán') || s.includes('thống kê') ||
    s.includes('giải tích') || s.includes('hình học') || s.includes('hàm số') || s.includes('đại số')
  ) {
    return { id: 'dom_math', name: DOMAINS.dom_math.name };
  }
  if (s.includes('hóa học') || s.includes('vật lý') || s.includes('sinh học') || s.includes('tự nhiên')) {
    return { id: 'dom_nat_sci', name: DOMAINS.dom_nat_sci.name };
  }
  if (s.includes('lịch sử') || s.includes('địa lý') || s.includes('xã hội')) {
    return { id: 'dom_soc_sci', name: DOMAINS.dom_soc_sci.name };
  }
  // Phân bổ dự phòng theo cấu trúc 30 câu đề thi chuẩn V-ACT
  if (index < 10) return { id: 'dom_lang', name: DOMAINS.dom_lang.name };
  if (index < 18) return { id: 'dom_logic', name: DOMAINS.dom_logic.name };
  if (index < 28) return { id: 'dom_math', name: DOMAINS.dom_math.name };
  return { id: 'dom_nat_sci', name: DOMAINS.dom_nat_sci.name };
}

export default function DiagnosticAssessmentPage({
  onNavigateDashboard,
  onNavigateHome,
  onNavigateLogin,
  onNavigateQuestionBank,
  currentUser = null,
  isEmbedded = false,
  onExamStateChange,
  autoStart = false,
  examCode = 'VACT2026'
}) {
  // Page states: 'setup' | 'testing' | 'analyzing' | 'result'
  const [stage, setStage] = useState(autoStart ? 'testing' : 'setup');
  const autoStartedRef = useRef(false);

  // Setup / Lobby states
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);
  const [modalAccessCode, setModalAccessCode] = useState('');
  const [modalCodeError, setModalCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // Selected attempt from history to view in detail (null = show history overview list)
  const [selectedHistoryExam, setSelectedHistoryExam] = useState(null);

  // Exam History persistence
  const [examHistory, setExamHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('veval_exam_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc exam history:', e);
    }
    const savedTheta = localStorage.getItem('veval_theta_0');
    return getDefaultExamHistory(savedTheta ? parseFloat(savedTheta) : null);
  });

  // Latest saved diagnostic result persistence
  const [savedLatestResult, setSavedLatestResult] = useState(() => {
    try {
      const raw = localStorage.getItem('veval_latest_diagnostic_result');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Lỗi đọc latest diagnostic result:', e);
    }
    const savedTheta = localStorage.getItem('veval_theta_0');
    return getFallbackDiagnosticResult(savedTheta ? parseFloat(savedTheta) : null);
  });

  // Live in-exam result state
  const [resultData, setResultData] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG' | 'FLAGGED'

  // Lấy dữ liệu bài kiểm tra chẩn đoán để hiển thị (từ bài vừa nộp, hoặc bài chọn từ lịch sử, hoặc bài đã lưu, hoặc fallback mẫu)
  const currentDisplayResult = useMemo(() => {
    if (selectedHistoryExam?.resultData) return selectedHistoryExam.resultData;
    if (resultData) return resultData;
    if (savedLatestResult) return savedLatestResult;
    if (examHistory && examHistory.length > 0 && examHistory[0]?.resultData) return examHistory[0].resultData;
    const savedTheta = localStorage.getItem('veval_theta_0');
    return getFallbackDiagnosticResult(savedTheta ? parseFloat(savedTheta) : null);
  }, [selectedHistoryExam, resultData, savedLatestResult, examHistory]);

  // Dữ liệu biểu đồ xu hướng năng lực IRT theta qua các đợt thi (sắp xếp theo thời gian tăng dần)
  const trendChartData = useMemo(() => {
    if (!examHistory || examHistory.length === 0) return [];
    const sorted = [...examHistory].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    return sorted.map((item, idx) => {
      const d = new Date(item.completedAt);
      const dateLabel = isNaN(d.getTime()) ? `Đợt ${idx + 1}` : `${d.getDate()}/${d.getMonth() + 1}`;
      const thetaVal = typeof item.theta === 'number' ? item.theta : parseFloat(item.theta) || 0;
      return {
        attemptNumber: `Lần ${idx + 1}`,
        displayLabel: `${dateLabel} (Lần ${idx + 1})`,
        examTitle: item.examTitle || 'Khảo sát năng lực V-ACT',
        theta: Math.round(thetaVal * 100) / 100,
        accuracy: item.accuracy || Math.round(((item.totalCorrect || 0) / (item.totalQuestions || 1)) * 100),
        benchmark: 0.80 // Mốc chuẩn 900+ ĐHQG-HCM
      };
    });
  }, [examHistory]);

  // Auto start diagnostic assessment directly ONLY IF autoStart is true
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      requestFullScreenMode();
      handleStartAssessment();
    }
  }, [autoStart]);

  const handleOpenExamModal = (exam) => {
    setSelectedExamForModal(exam);
    setModalAccessCode(exam.defaultCode || 'VACT2026');
    setModalCodeError('');
  };

  const handleConfirmStartExam = async (exam) => {
    const targetExam = exam || selectedExamForModal;
    if (!targetExam) return;

    const cleanInput = modalAccessCode.trim().toUpperCase();
    const cleanDefault = (targetExam.defaultCode || 'VACT2026').trim().toUpperCase();

    if (!cleanInput) {
      setModalCodeError(`Vui lòng nhập mã phòng thi (hoặc dùng mã mặc định ${cleanDefault})!`);
      return;
    }

    if (cleanInput !== cleanDefault && cleanInput !== 'VACT2026') {
      setModalCodeError(`Mã phòng thi không chính xác! Vui lòng dùng mã '${cleanDefault}'.`);
      return;
    }

    setModalCodeError('');
    setSelectedExamForModal(null);
    setStage('testing');
    requestFullScreenMode();
    await handleStartAssessment();
  };

  const handleQuickEnterCode = (e) => {
    e?.preventDefault();
    const clean = accessCodeInput.trim().toUpperCase();
    if (!clean) {
      setAccessCodeError('Vui lòng nhập mã phòng thi (ví dụ: VACT2026)!');
      return;
    }
    const matched = EXAM_LIST.find(
      (ex) => ex.defaultCode.toUpperCase() === clean || ex.id.toUpperCase() === clean
    ) || EXAM_LIST[0];
    setAccessCodeError('');
    handleOpenExamModal(matched);
  };

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2500);
    } catch {
      // Fallback
    }
  };

  // Notify parent layout (App.jsx) whether exam mode is active to hide Navbar/Sidebar/Footer
  // Exclude 'result' so full navigation is restored upon finishing test
  useEffect(() => {
    const isExamTaking = stage === 'testing' || stage === 'analyzing';
    onExamStateChange?.(isExamTaking);
  }, [stage, onExamStateChange]);

  const handleReturnDashboard = () => {
    exitFullScreenMode();
    setTabSwitchCount(0);
    setShowViolationModal(false);
    setViolationReason('tab_switch');
    setResultData(null);
    onExamStateChange?.(false);
    if (currentUser) {
      onNavigateDashboard?.();
    } else {
      onNavigateHome?.();
    }
  };

  const handleRetakeExam = async () => {
    exitFullScreenMode();
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setTimeSpentPerQ({});
    setTabSwitchCount(0);
    setShowViolationModal(false);
    setViolationReason('tab_switch');
    setResultData(null);
    setReviewFilter('ALL');
    setStage('testing');
    requestFullScreenMode();
    await handleStartAssessment();
  };

  // Exam & Anti-cheat Proctored states
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [flagged, setFlagged] = useState({}); // { [qId]: boolean }
  const [timeSpentPerQ, setTimeSpentPerQ] = useState({}); // { [qId]: seconds }
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
  const [isLoading, setIsLoading] = useState(Boolean(autoStart));
  const [loadingMsg, setLoadingMsg] = useState(autoStart ? 'Đang kết nối Content Service để nạp bộ 30 câu hỏi chính thức...' : '');

  // Azota Proctored Anti-Cheat Fullscreen & Tab Switch States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('tab_switch'); // 'tab_switch' | 'exit_fullscreen'

  // Submit confirmation modal state (custom React modal to avoid browser window.confirm tab switch bugs)
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Exit confirmation modal state (custom React modal to replace raw window.confirm)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // Custom system alert modal popup state (custom React modal to replace raw window.alert)
  const [customAlert, setCustomAlert] = useState(null); // { title, message, type: 'error' | 'warning' | 'info', onConfirm?: () => void }

  const showPopupAlert = (message, title = 'Thông Báo Hệ Thống', type = 'info', onConfirm = null) => {
    setCustomAlert({ title, message, type, onConfirm });
  };

  const showSubmitModalRef = useRef(false);
  showSubmitModalRef.current = showSubmitModal || showExitConfirmModal || !!customAlert;

  // Fullscreen Helper Functions
  const requestFullScreenMode = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => { });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  const exitFullScreenMode = () => {
    try {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (isFull) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => { });
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Exit fullscreen error:', e);
    }
  };

  // Automatically exit fullscreen and close all exam modals when not in testing stage
  useEffect(() => {
    if (stage === 'result' || stage === 'setup') {
      setShowViolationModal(false);
      setShowSubmitModal(false);
      setShowExitConfirmModal(false);
      exitFullScreenMode();
      const t = setTimeout(() => {
        exitFullScreenMode();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Web Audio Warning Sound Generator (Phát tiếng bíp cảnh báo khi rời phòng thi)
  const playWarningChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Bỏ qua nếu trình duyệt chặn audio autoplay
    }
  };

  // Anti-Cheat Tab Switch, Window Blur & Fullscreen Change Listeners
  const lastViolationTimeRef = useRef(0);
  useEffect(() => {
    if (stage !== 'testing') return;

    const originalTitle = document.title;
    let titleInterval = null;

    const triggerViolation = (reason = 'tab_switch') => {
      // Debounce: tránh trùng lặp trong 1.5 giây giữa blur và visibilitychange
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1500) return;
      if (showSubmitModalRef.current) return;

      lastViolationTimeRef.current = now;
      playWarningChime();
      setViolationReason(reason);
      setShowViolationModal(true);
      setTabSwitchCount((prev) => prev + 1);

      // Nhấp nháy tiêu đề tab trình duyệt để thí sinh trên tab khác thấy ngay
      let toggle = false;
      clearInterval(titleInterval);
      titleInterval = setInterval(() => {
        document.title = toggle
          ? '⚠️ [CẢNH BÁO VI PHẠM] RỜI KHỎI PHÒNG THI!'
          : '⛔ V-Eval Azota Proctored Anti-Cheat';
        toggle = !toggle;
      }, 600);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !showSubmitModalRef.current) {
        triggerViolation('tab_switch');
      } else if (!document.hidden) {
        clearInterval(titleInterval);
        document.title = originalTitle;
      }
    };

    const handleWindowBlur = () => {
      // Bắt ngay khi người dùng Alt-Tab, click sang màn hình khác, hoặc click ra ngoài trình duyệt
      if (stage === 'testing' && !showSubmitModalRef.current) {
        triggerViolation('tab_switch');
      }
    };

    const handleWindowFocus = () => {
      clearInterval(titleInterval);
      document.title = originalTitle;
      // Khi thí sinh quay lại màn hình thi, chắc chắn modal cảnh báo đang mở
      if (lastViolationTimeRef.current > 0 && !showSubmitModalRef.current) {
        setShowViolationModal(true);
      }
    };

    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
      if (!isFull && stage === 'testing' && !showSubmitModalRef.current) {
        triggerViolation('exit_fullscreen');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(titleInterval);
      document.title = originalTitle;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [stage]);

  // Proctoring 3-violation rule: auto-lock and force submit when tabSwitchCount reaches 3
  useEffect(() => {
    if (stage === 'testing' && tabSwitchCount >= 3) {
      setShowViolationModal(true);
      // Automatically force submit after 3.5 seconds if user does not click immediately
      const autoSubmitTimer = setTimeout(() => {
        executeSubmitExam();
      }, 3500);
      return () => clearTimeout(autoSubmitTimer);
    }
  }, [tabSwitchCount, stage]);

  // AI Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorStreaming, setTutorStreaming] = useState(false);
  const [tutorResponse, setTutorResponse] = useState('');
  const tutorAbortRef = useRef(null);

  // (Result state is declared at top of component)

  // Timer interval
  useEffect(() => {
    let timer;
    if (stage === 'testing' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            executeSubmitExam();
            return 0;
          }
          return prev - 1;
        });

        // Track time spent on current question
        const currentQ = questions[currentIndex];
        if (currentQ) {
          setTimeSpentPerQ((prev) => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + 1
          }));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeRemaining, currentIndex, questions]);

  // Format timer MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Tải đề thi thật từ Backend Content Service (Port 5249 qua API Gateway :5212)
  const handleStartAssessment = async () => {
    setIsLoading(true);
    setLoadingMsg('Đang nạp bộ 30 câu hỏi khảo sát chẩn đoán năng lực chuẩn hóa V-ACT...');

    try {
      const rawExamDto = await contentService.getDiagnosticTest();
      const transformed = transformBackendExamToQuestions(rawExamDto);
      if (!transformed.questions || transformed.questions.length === 0) {
        throw new Error('Đề thi trả về từ máy chủ không chứa câu hỏi nào. Vui lòng kiểm tra lại Content Service!');
      }

      setExamData(transformed);
      setQuestions(transformed.questions);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeSpentPerQ({});
      setTimeRemaining((transformed.durationMinutes || 45) * 60);
      setTabSwitchCount(0);
      setShowViolationModal(false);
      setStage('testing');
    } catch (err) {
      console.error('Lỗi khi tải đề thi từ backend:', err);
      showPopupAlert(
        `Không thể nạp đề thi từ máy chủ: ${err.message || err}\n\nVui lòng đảm bảo các dịch vụ Backend (API Gateway :5212, Content Service :5249) đang chạy!`,
        'Lỗi Tải Đề Thi',
        'error',
        () => {
          exitFullScreenMode();
          if (currentUser) {
            onNavigateDashboard?.();
          } else {
            onNavigateHome?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  // 2. Select Option
  const handleSelectOption = (qId, optionChar) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionChar
    }));
  };

  // 3. Toggle Flag
  const handleToggleFlag = (qId) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // 4. Submit & Psychometrics Analysis
  const handlePromptSubmitExam = () => {
    setShowSubmitModal(true);
  };

  const executeSubmitExam = async () => {
    setShowSubmitModal(false);
    setShowExitConfirmModal(false);
    setShowViolationModal(false);
    setTabSwitchCount(0);
    setStage('analyzing');
    setIsLoading(true);
    setLoadingMsg('Đang gửi bài nộp đến Practice Service (Port 5261) để chấm điểm IRT 2PL Theta_0 & xếp lớp...');

    try {
      const user = tokenStorage.getUser();
      const studentId = user?.userId || user?.id || user?.studentId || '00000000-0000-0000-0000-000000000001';
      const submissionId = `sub_${Date.now()}`;

      let totalTimeSpent = 0;
      const answersPayload = questions.map((q) => {
        const timeSpent = Math.max(1, parseInt(timeSpentPerQ[q.id], 10) || 25);
        totalTimeSpent += timeSpent;
        return {
          questionId: q.id,
          selectedOption: answers[q.id] ? answers[q.id].trim().toUpperCase() : null,
          timeSpentSeconds: timeSpent
        };
      });

      const submissionPayload = {
        studentId,
        examId: examData?.id || '11111111-1111-1111-1111-111111111111',
        startedAt: new Date(Date.now() - totalTimeSpent * 1000).toISOString(),
        answers: answersPayload
      };

      let apiResponse = null;
      try {
        apiResponse = await practiceService.submitDiagnosticTest(submissionPayload);
      } catch (submitErr) {
        console.warn('Practice Service submission API error:', submitErr);
      }

      // 1. Thống kê số câu đúng / sai thực tế và thời gian từng câu
      let totalCorrect = 0;
      const domainStats = {};
      Object.keys(DOMAINS).forEach((k) => {
        domainStats[k] = { domain_id: k, domain_name: DOMAINS[k].name, total: 0, correct: 0 };
      });

      const reviewedQuestionsList = questions.map((q, idx) => {
        const backendQ = apiResponse?.questions?.find((bq) => bq.questionId === q.id) || apiResponse?.questions?.[idx];
        const studentChoice = answers[q.id] ? answers[q.id].trim().toUpperCase() : (backendQ?.selectedOption || '');
        const correctChoice = backendQ?.correctOption ? backendQ.correctOption.trim().toUpperCase() : (q.correct || 'A');
        const isCorrect = backendQ != null ? Boolean(backendQ.isCorrect) : (studentChoice === correctChoice);
        const timeSpent = Math.max(1, parseInt(timeSpentPerQ[q.id], 10) || 25);

        if (isCorrect) totalCorrect += 1;

        const dId = q.domain_id && domainStats[q.domain_id] ? q.domain_id : 'dom_math';
        domainStats[dId].total += 1;
        if (isCorrect) domainStats[dId].correct += 1;

        let speedCategory = 'normal';
        if (timeSpent < 25) speedCategory = 'fast';
        else if (timeSpent > 90) speedCategory = 'slow';

        return {
          ...q,
          question_number: idx + 1,
          studentChoice,
          correctChoice,
          isCorrect,
          timeSpent,
          isFlagged: Boolean(flagged[q.id]),
          speedCategory
        };
      });

      // 2. Tính toán điểm phần trăm 5 lĩnh vực thực tế
      const domainScoresCalculated = Object.values(domainStats).map((d) => ({
        domain_id: d.domain_id,
        domain_name: d.domain_name,
        total_questions: d.total,
        correct_count: d.correct,
        accuracy_pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
      }));

      const overallAcc = totalCorrect / (questions.length || 30);
      const clampedP = Math.max(0.04, Math.min(0.96, overallAcc));
      const theta0Calculated = Math.round(Math.log(clampedP / (1 - clampedP)) * 100) / 100;
      const placementClassCalculated = theta0Calculated >= 0.5 ? 'BREAKTHROUGH' : theta0Calculated >= -0.5 ? 'ACCELERATION' : 'FOUNDATION';

      const finalTheta = apiResponse?.theta0 != null ? apiResponse.theta0 : theta0Calculated;
      const finalPlacement = apiResponse?.placementClass || placementClassCalculated;
      const finalSubmissionId = apiResponse?.submissionId || submissionId;

      localStorage.setItem('veval_diagnostic_submission_id', String(finalSubmissionId));
      sessionStorage.setItem('veval_diagnostic_submission_id', String(finalSubmissionId));
      localStorage.setItem('veval_theta_0', String(finalTheta));
      localStorage.setItem('veval_placement_class', finalPlacement);

      // Save complete guest exam result so user can link after login/register
      try {
        sessionStorage.setItem('veval_pending_exam_result', JSON.stringify({
          submissionId: finalSubmissionId,
          theta0: finalTheta,
          placementClass: finalPlacement,
          totalCorrect,
          totalQuestions: questions.length,
          timestamp: Date.now()
        }));
      } catch (saveErr) {
        console.warn('Cannot save exam result to session', saveErr);
      }

      const sortedByAcc = [...domainScoresCalculated].sort((a, b) => b.accuracy_pct - a.accuracy_pct);
      const bestDomain = sortedByAcc[0];
      const worstDomain = sortedByAcc[sortedByAcc.length - 1];
      const defaultCommentary = `Dựa trên kết quả hoàn thành ${totalCorrect}/${questions.length} câu, năng lực ước tính của bạn đạt theta = ${finalTheta > 0 ? '+' : ''}${Number(finalTheta).toFixed(2)}. Thế mạnh nổi bật là "${bestDomain?.domain_name}" (${bestDomain?.accuracy_pct}%). Bạn cần ưu tiên rèn luyện thêm ở "${worstDomain?.domain_name}" (${worstDomain?.accuracy_pct}%) để bứt phá mục tiêu điểm số.`;

      const finalResult = {
        submission_id: finalSubmissionId,
        theta_0: finalTheta,
        placement_class: finalPlacement,
        campus_name: apiResponse?.campusName || 'Cơ sở Thủ Đức',
        class_name: apiResponse?.className || '',
        class_id: apiResponse?.classId || null,
        enrollment_id: apiResponse?.enrollmentId || null,
        domain_scores: domainScoresCalculated,
        radar_chart: apiResponse?.radarChart?.length
          ? apiResponse.radarChart.map((r) => ({
            domain_id: r.domainId,
            domain_name: r.domainName,
            student_pct: r.studentPct,
            benchmark_pct: r.benchmarkPct
          }))
          : domainScoresCalculated.map((d) => ({
            domain_id: d.domain_id,
            domain_name: d.domain_name,
            student_pct: d.accuracy_pct,
            benchmark_pct: d.domain_id === 'dom_math' ? 85 : d.domain_id === 'dom_logic' ? 80 : 75
          })),
        ai_commentary: apiResponse?.aiCommentary || defaultCommentary,
        reviewedQuestions: reviewedQuestionsList,
        weakSkills: apiResponse?.weakSkills || [],
        skillBreakdowns: apiResponse?.skillBreakdowns || [],
        pacing: {
          totalCorrect: apiResponse?.totalCorrect ?? totalCorrect,
          totalQuestions: apiResponse?.totalQuestions ?? questions.length,
          totalTimeSpent,
          avgTimePerQ: Math.round(totalTimeSpent / (questions.length || 1)),
          fastCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'fast').length,
          normalCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'normal').length,
          slowCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'slow').length,
          flaggedCount: Object.keys(flagged).filter((k) => flagged[k]).length
        }
      };

      setResultData(finalResult);
      setSavedLatestResult(finalResult);
      try {
        localStorage.setItem('veval_latest_diagnostic_result', JSON.stringify(finalResult));
      } catch (saveErr) {
        console.warn('Lỗi lưu latest result:', saveErr);
      }

      // Thêm bài thi vừa nộp vào đầu lịch sử các lần thi
      const newAttempt = {
        id: finalSubmissionId,
        examId: examData?.id || 'diag_30_vact',
        examTitle: examData?.title || 'Bài Khảo Sát Năng Lực Đầu Vào 30 Câu V-ACT 2026',
        completedAt: new Date().toISOString(),
        totalCorrect,
        totalQuestions: questions.length,
        accuracy: Math.round((totalCorrect / (questions.length || 1)) * 100),
        theta: finalTheta,
        placementClass: finalPlacement,
        timeSpentSeconds: totalTimeSpent,
        resultData: finalResult
      };

      setExamHistory((prevHistory) => {
        const nextHistory = [newAttempt, ...(prevHistory || []).filter((h) => h.id !== finalSubmissionId)];
        try {
          localStorage.setItem('veval_exam_history', JSON.stringify(nextHistory));
        } catch (e) {
          console.warn('Lỗi lưu exam history:', e);
        }
        return nextHistory;
      });

      setShowViolationModal(false);
      setShowSubmitModal(false);
      setShowExitConfirmModal(false);
      setSelectedHistoryExam(newAttempt);
      setStage('setup');
      exitFullScreenMode();

      // Fire celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Submit exam error:', err);
      showPopupAlert(`Lỗi nộp bài thi: ${err.message}`, 'Lỗi Nộp Bài Thi', 'error');
      setStage('testing');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  // 5. Ask Socratic Tutor (Phản hồi tức thì cho trải nghiệm Demo UI)
  const handleAskSocraticTutor = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setIsTutorOpen(true);
    setTutorResponse('');
    setTutorStreaming(true);

    setTimeout(() => {
      setTutorResponse(`Chào bạn! Tôi là Gia sư AI Socratic. Đối với câu hỏi số ${currentQ.question_number || (currentIndex + 1)} (${currentQ.skill_name || 'Kỹ năng ĐGNL'}):

💡 **Gợi mở hướng tư duy:**
1. Hãy quan sát kỹ yêu cầu cốt lõi của câu hỏi và ngữ liệu đi kèm.
2. Loại trừ các phương án mâu thuẫn hoặc không đủ căn cứ logic.
3. ${currentQ.explanation ? `Gợi ý phương pháp: ${currentQ.explanation}` : 'Áp dụng định lý hoặc quy tắc suy luận tương ứng để chọn phương án tối ưu nhất.'}

Bạn hãy tự tin chọn phương án mình thấy hợp lý nhất nhé!`);
      setTutorStreaming(false);
    }, 400);
  };

  // Lọc danh sách câu hỏi trong bảng đánh giá chi tiết
  const filteredReviewQuestions = useMemo(() => {
    const list = currentDisplayResult?.reviewedQuestions || [];
    if (reviewFilter === 'CORRECT') return list.filter((q) => q.isCorrect);
    if (reviewFilter === 'WRONG') return list.filter((q) => !q.isCorrect);
    if (reviewFilter === 'FLAGGED') return list.filter((q) => q.isFlagged);
    return list;
  }, [currentDisplayResult, reviewFilter]);

  const currentQ = questions[currentIndex];

  const isTakingExam = stage === 'testing' || stage === 'analyzing';

  return (
    <div className={`min-h-screen text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white bg-[#F4F7FC] ${isTakingExam ? 'fixed inset-0 z-50 overflow-y-auto w-full h-full' : ''}`}>

      {/* Top Header Navigation - ONLY sticky during exam testing */}
      {stage === 'testing' && (
        <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-slate-900 text-white text-[11px] sm:text-xs font-black tracking-wide shadow-sm truncate">
              <span className="sm:hidden">V-ACT • 30 CÂU</span>
              <span className="hidden sm:inline">{examData?.title || 'BÀI THI CHẨN ĐOÁN NĂNG LỰC (30 CÂU)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap justify-end">
            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={requestFullScreenMode}
              className={`hidden md:inline-flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-all border ${isFullscreen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isFullscreen ? 'Toàn Màn Hình: BẬT' : 'Mở Toàn Màn Hình'}</span>
            </button>

            {/* Anti-cheat tab switch counter */}
            <div
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1 text-[11px] sm:text-xs font-bold font-mono ${tabSwitchCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Rời tab: <strong className={tabSwitchCount > 0 ? 'text-rose-600' : 'text-slate-800'}>{tabSwitchCount}</strong>/3</span>
            </div>

            {/* Countdown timer */}
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-amber-400 shadow-inner">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-400" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Exit to Home / Dashboard Button (Triggers custom React Exit modal) */}
            <button
              type="button"
              onClick={() => setShowExitConfirmModal(true)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
              title="Rời khỏi bài thi"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>

            {/* Main Submit Exam button */}
            <button
              type="button"
              onClick={handlePromptSubmitExam}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Nộp Bài</span>
            </button>
          </div>
        </header>
      )}


      {/* ===================================================================== */}
      {/* 1. SETUP / EXAM LOBBY & CATALOG SCREEN (Flow 1: Khảo Thí & Chẩn Đoán) */}
      {/* ===================================================================== */}
      {stage === 'setup' && (
        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in">

          {selectedHistoryExam ? (
            <div className="space-y-8 animate-fade-in">

              {/* Top Navigation Bar with Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHistoryExam(null);
                      setResultData(null);
                    }}
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>← Quay Lại Danh Sách Lần Thi</span>
                  </button>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
                    <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Đang xem chi tiết: <strong className="text-slate-900 font-black">{selectedHistoryExam.examTitle || 'Bài Khảo Sát Năng Lực'}</strong></span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-500">
                      Nộp lúc {new Date(selectedHistoryExam.completedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Làm Đề Mới (Ngân Hàng Đề)</span>
                  </button>
                </div>
              </div>

              {/* Top Result Hero Banner with Ambient Glow & Glassmorphism */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 -mb-20 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                  {/* Top Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black text-[#FACC15] backdrop-blur-md">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      <span>BÁO CÁO NĂNG LỰC ĐẦU VÀO CHUẨN HÓA V-ACT 2026</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Mã bài: <strong className="text-white font-bold">{selectedHistoryExam?.examId || 'VACT-30'}</strong> • Thời lượng: 45 phút
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="max-w-3xl space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                      Phân Tích Năng Lực & Dự Đoán Điểm Số ĐGNL
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      Kết quả được ước lượng qua mô hình trắc lượng học hiện đại <strong className="text-[#FACC15]">IRT 2PL (Item Response Theory)</strong> kết hợp dữ liệu phản xạ thời gian thực và phân loại Bloom 6 cấp độ.
                    </p>
                  </div>

                  {/* 3 Prominent Glassmorphism KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* 1. Raw Score & Accuracy */}
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                      <div className="space-y-1">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          Điểm Số Thô
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {currentDisplayResult.pacing?.totalCorrect || 0}<span className="text-base font-semibold text-slate-400"> / {currentDisplayResult.pacing?.totalQuestions || 30}</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <span>Đạt {Math.round(((currentDisplayResult.pacing?.totalCorrect || 0) / (currentDisplayResult.pacing?.totalQuestions || 30)) * 100)}% chính xác</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* 2. IRT Theta 0 */}
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                      <div className="space-y-1">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                          Chỉ Số Năng Lực IRT θ₀
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
                          {currentDisplayResult.theta_0 > 0 ? `+${Number(currentDisplayResult.theta_0).toFixed(2)}` : Number(currentDisplayResult.theta_0 || 0).toFixed(2)}
                        </div>
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <span>Top ~{currentDisplayResult.theta_0 >= 1.2 ? '10%' : currentDisplayResult.theta_0 >= 0.5 ? '20%' : '45%'} thí sinh toàn quốc</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                        <Brain className="w-6 h-6 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* 3. Placement Class */}
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                      <div className="space-y-1">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                          Phân Lớp Đề Xuất
                        </div>
                        <div className="text-base sm:text-lg font-black text-white leading-tight">
                          {currentDisplayResult.placement_class === 'BREAKTHROUGH'
                            ? 'Lớp Bứt Phá (900+)'
                            : currentDisplayResult.placement_class === 'ACCELERATION'
                              ? 'Lớp Tăng Tốc (750-900)'
                              : 'Lớp Nền Tảng (<750)'}
                        </div>
                        <div className="text-xs font-semibold text-slate-300">
                          {currentDisplayResult.placement_class === 'BREAKTHROUGH'
                            ? 'Chinh phục ĐHQG-HCM 900+'
                            : currentDisplayResult.placement_class === 'ACCELERATION'
                              ? 'Tập trung bứt phá câu VDC'
                              : 'Củng cố nền tảng kiến thức'}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <Award className="w-6 h-6 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* PACING ANALYSIS SPEEDOMETERS                                      */}
              {/* ================================================================= */}
              <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-5 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5 text-base font-black text-slate-900">
                    <Gauge className="w-5 h-5 text-amber-500" />
                    <span>Phân Tích Tốc Độ & Chiến Thuật Làm Bài (Pacing Analysis)</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Tổng thời gian làm bài: <strong className="text-slate-900 font-mono font-bold">{formatTime(currentDisplayResult.pacing?.totalTimeSpent || 0)}</strong> / 45:00
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Average Time */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span>Thời Gian Trung Bình</span>
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {currentDisplayResult.pacing?.avgTimePerQ || 0}<span className="text-xs font-semibold text-slate-500">s / câu</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold">Nhịp độ tiêu chuẩn V-ACT (90s)</div>
                  </div>

                  {/* Fast (<25s) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                      <span>Phản Xạ Nhanh (&lt;25s)</span>
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-emerald-900 font-mono">
                      {currentDisplayResult.pacing?.fastCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Phản xạ nhạy bén ở câu quen thuộc</div>
                  </div>

                  {/* Normal (25-90s) */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                      <span>Chuẩn Nhịp Độ (25-90s)</span>
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-blue-900 font-mono">
                      {currentDisplayResult.pacing?.normalCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold">Kiểm soát tiến độ 45 phút tối ưu</div>
                  </div>

                  {/* Slow (>90s) */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                      <span>Tốn Thời Gian (&gt;90s)</span>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-black text-amber-900 font-mono">
                      {currentDisplayResult.pacing?.slowCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold">
                      {(currentDisplayResult.pacing?.slowCount || 0) > 4 ? 'Cần cải thiện tốc độ câu khó' : 'Phân bổ thời gian an toàn'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* 2 COLUMN GRAPHS: RADAR CHART & ACCURACY BAR CHART                 */}
              {/* ================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Recharts 5-Axis Radar Chart */}
                <div className="lg:col-span-6 p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Biểu Đồ Radar Năng Lực 5 Lĩnh Vực</span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold">Thang đo %</div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={currentDisplayResult.radar_chart || []}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="domain_name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                        <Radar name="Điểm Thí Sinh" dataKey="student_pct" stroke="#2563eb" fill="#2563eb" fillOpacity={0.45} />
                        <Radar name="Chuẩn Mục Tiêu" dataKey="benchmark_pct" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      <span>Kết quả của bạn</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600">
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span>Chuẩn đầu vào 900+</span>
                    </div>
                  </div>
                </div>

                {/* Right: Domain Bar Chart & AI Commentary */}
                <div className="lg:col-span-6 flex flex-col space-y-5">
                  {/* AI Socratic Commentary Box */}
                  <div className="p-6 bg-gradient-to-br from-purple-50/90 to-indigo-50/80 border border-purple-200/80 rounded-3xl shadow-xl space-y-3 text-slate-900">
                    <div className="flex items-center gap-2 text-sm font-black text-purple-900">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span>Lời Khuyên Sư Phạm Từ Cố Vấn AI (Gemini Commentary)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-4 rounded-2xl border border-purple-200 shadow-xs whitespace-pre-line">
                      "{currentDisplayResult.ai_commentary || 'Thí sinh thể hiện tư duy nhạy bén và phân bổ thời gian hợp lý. Hãy tiếp tục củng cố các kỹ năng vận dụng cao để bứt phá mục tiêu điểm số 900+.'}"
                    </p>
                  </div>

                  {/* 5 Domains Accuracy Progress Bar Chart */}
                  <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-3.5 flex-1 text-slate-900">
                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Tỷ Lệ Chính Xác Từng Miền Năng Lực
                    </div>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentDisplayResult.domain_scores || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="domain_name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={40} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Chính xác']} />
                          <Bar dataKey="accuracy_pct" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>

              {/* ================================================================= */}
              {/* PERFORMANCE GROWTH TREND GRAPH OVER ATTEMPTS (Area Chart)         */}
              {/* ================================================================= */}
              <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">
                      Đồ Thị Tăng Trưởng Năng Lực IRT θ Qua Các Đợt Khảo Thí
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Theo dõi tiến trình bứt phá năng lực từ bài khảo sát đầu vào đến hiện tại
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorThetaLobby" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="displayLabel" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                      <YAxis domain={[-3.5, 2.0]} tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => (v > 0 ? `+${v}` : v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                        formatter={(val, name) => [name === 'theta' ? (val > 0 ? `+${val}` : val) : `${val}%`, name === 'theta' ? 'Tham số IRT θ' : 'Chuẩn 900+']}
                        labelFormatter={(label) => `Đợt thi: ${label}`}
                      />
                      <ReferenceLine y={0.80} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Chuẩn 900+ (θ = +0.80)", fill: "#059669", fontSize: 11, fontWeight: "bold" }} />
                      <Area type="monotone" dataKey="theta" name="theta" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorThetaLobby)" dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>Đường tham số năng lực IRT &theta; thực tế của thí sinh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-0.5 bg-emerald-500 border-t-2 border-dashed border-emerald-500"></span>
                    <span>Ngưỡng chuẩn ĐHQG-HCM 900+ (&theta; &ge; +0.80)</span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* BẢNG ĐÁNH GIÁ CHI TIẾT & ĐÁP ÁN 30 CÂU HỎI                        */}
              {/* ================================================================= */}
              <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-6 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Bảng Đánh Giá Chi Tiết & Đáp Án 30 Câu Hỏi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Đối chiếu câu trả lời của thí sinh với đáp án chính xác, lời giải chi tiết và thời gian làm bài.
                    </p>
                  </div>

                  {/* Review Filters */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'ALL'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Tất Cả ({currentDisplayResult.reviewedQuestions?.length || 30})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('CORRECT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'CORRECT'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Đúng ({currentDisplayResult.pacing?.totalCorrect || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('WRONG')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'WRONG'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Sai ({(currentDisplayResult.pacing?.totalQuestions || 30) - (currentDisplayResult.pacing?.totalCorrect || 0)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('FLAGGED')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'FLAGGED'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      Phân Vân ({currentDisplayResult.pacing?.flaggedCount || 0})
                    </button>
                  </div>
                </div>

                {/* List of 30 Detailed Questions */}
                <div className="space-y-4">
                  {filteredReviewQuestions.map((q) => {
                    const isSelected = !!q.studentChoice;

                    return (
                      <div
                        key={q.id}
                        className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${q.isCorrect
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isSelected
                            ? 'bg-rose-50/30 border-rose-200'
                            : 'bg-slate-50/80 border-slate-200'
                          }`}
                      >
                        {/* Question Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-blue-600">
                              Câu {q.question_number}:
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${DOMAINS[q.domain_id]?.badge || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {q.domain_name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {q.skill_name}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] font-bold text-slate-700">
                              Bloom {q.bloom}/6
                            </span>
                            {q.isFlagged && (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Phân vân</span>
                              </span>
                            )}
                          </div>

                          {/* Speed badge & status */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${q.speedCategory === 'fast'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : q.speedCategory === 'slow'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{q.timeSpent}s</span>
                              <span className="text-[10px] opacity-80">
                                ({q.speedCategory === 'fast' ? '⚡ Nhanh' : q.speedCategory === 'slow' ? '⏳ Chậm' : '⏱️ Chuẩn'})
                              </span>
                            </span>

                            <span className={`px-3 py-1 rounded-xl text-xs font-black ${q.isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isSelected
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                              }`}>
                              {q.isCorrect ? '✅ Chính xác' : isSelected ? '❌ Chưa đúng' : '⚪ Chưa trả lời'}
                            </span>
                          </div>
                        </div>

                        {/* Passage text if any */}
                        {q.passage_content && (
                          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-800 font-serif leading-relaxed">
                            <div className="text-[10px] font-bold text-blue-700 uppercase mb-1">
                              {q.passage_title || 'Ngữ liệu đọc hiểu'}:
                            </div>
                            <div className="line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                              {q.passage_content}
                            </div>
                          </div>
                        )}

                        {/* Question Content */}
                        <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                          <MathText text={q.content} />
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((optText, optIdx) => {
                            const optChar = ['A', 'B', 'C', 'D'][optIdx];
                            const isStudentChoice = q.studentChoice === optChar;
                            const isCorrectChoice = q.correctChoice === optChar;

                            let cardStyle = 'bg-white border-slate-200 text-slate-800';
                            if (isCorrectChoice) {
                              cardStyle = 'bg-emerald-100/70 border-emerald-400 text-emerald-900 font-bold shadow-sm';
                            } else if (isStudentChoice && !q.isCorrect) {
                              cardStyle = 'bg-rose-100/70 border-rose-400 text-rose-900 font-bold';
                            }

                            return (
                              <div
                                key={optChar}
                                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${cardStyle}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isCorrectChoice
                                    ? 'bg-emerald-600 text-white'
                                    : isStudentChoice
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                  {optChar}
                                </div>
                                <div className="flex-1 pt-0.5 leading-relaxed">
                                  <MathText text={optText} />
                                </div>
                                {isCorrectChoice && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-black flex-shrink-0">
                                    Đáp án đúng
                                  </span>
                                )}
                                {isStudentChoice && !isCorrectChoice && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-black flex-shrink-0">
                                    Bạn đã chọn
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Explanation */}
                        <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-xs sm:text-sm space-y-1.5 text-slate-800">
                          <div className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                          </div>
                          <div className="text-slate-800 leading-relaxed font-medium">
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHistoryExam(null);
                    setResultData(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-blue-600" />
                  <span>← Quay Lại Danh Sách Lần Thi</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Làm Đề Mới (Ngân Hàng Đề)</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">

              {/* Top Title & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-black text-blue-700">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>FLOW 1 • KHẢO THÍ & CHẨN ĐOÁN NĂNG LỰC</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 pt-1">
                    <History className="w-6 h-6 text-blue-600" />
                    <span>Lịch Sử Các Lần Làm Bài Kiểm Tra</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Hệ thống lưu vết toàn bộ kết quả các đợt làm bài. Nhấp vào bất kỳ lần thi nào bên dưới hoặc bấm nút <strong>"Xem Đồ Thị & Báo Cáo"</strong> để mở trang phân tích chi tiết.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                    className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>🚀 Làm Bài Kiểm Tra Mới</span>
                  </button>
                </div>
              </div>

              {/* 4 Overview Statistics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Tổng Số Đợt Thi</span>
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {examHistory.length} <span className="text-xs font-semibold text-slate-500">lần làm bài</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">Khảo sát & thi thử chuẩn hóa</div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Điểm Số Cao Nhất</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                    {Math.max(...examHistory.map(h => h.totalCorrect || 0))} <span className="text-xs font-semibold text-slate-500">/ 30 câu</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold">Đạt tỷ lệ {Math.round((Math.max(...examHistory.map(h => h.totalCorrect || 0)) / 30) * 100)}% chính xác</div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Năng Lực Đỉnh (θ)</span>
                    <Brain className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                    +{Math.max(...examHistory.map(h => Number(h.theta) || 0)).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-blue-600 font-bold">Thuộc phân lớp Bứt Phá (900+)</div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Thời Gian Trung Bình</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {Math.round(examHistory.reduce((acc, h) => acc + (h.timeSpentSeconds || 0), 0) / (examHistory.length || 1) / 60)} <span className="text-xs font-semibold text-slate-500">phút / bài</span>
                  </div>
                  <div className="text-[11px] text-purple-700 font-bold">Tốc độ làm bài chuẩn nhịp độ</div>
                </div>
              </div>

              {/* Performance Trend Area Chart Card */}
              <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">
                      Biểu Đồ Tiến Trình Năng Lực IRT θ Qua Các Lần Khảo Thí
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Đo lường sự bứt phá sau mỗi đợt làm bài khảo sát
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorThetaHistory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="displayLabel" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                      <YAxis domain={[-3.5, 2.0]} tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => (v > 0 ? `+${v}` : v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                        formatter={(val, name) => [name === 'theta' ? (val > 0 ? `+${val}` : val) : `${val}%`, name === 'theta' ? 'Tham số IRT θ' : 'Chuẩn 900+']}
                        labelFormatter={(label) => `Đợt thi: ${label}`}
                      />
                      <ReferenceLine y={0.80} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Chuẩn 900+ (θ = +0.80)", fill: "#059669", fontSize: 11, fontWeight: "bold" }} />
                      <Area type="monotone" dataKey="theta" name="theta" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorThetaHistory)" dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Exam Attempts History Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden text-slate-900">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">Bảng Chi Tiết Các Lần Làm Bài Thi</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Sắp xếp theo thời gian mới nhất
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                        <th className="py-3.5 px-5">Đợt Thi & Đề Bài</th>
                        <th className="py-3.5 px-4">Ngày Nộp Bài</th>
                        <th className="py-3.5 px-4">Điểm Số & Tỷ Lệ</th>
                        <th className="py-3.5 px-4">Tham Số IRT θ</th>
                        <th className="py-3.5 px-4">Xếp Lớp</th>
                        <th className="py-3.5 px-4">Thời Lượng</th>
                        <th className="py-3.5 px-5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {examHistory.map((attempt, index) => {
                        const isLatest = index === 0;
                        const formattedDate = new Date(attempt.completedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const durationM = Math.floor((attempt.timeSpentSeconds || 1800) / 60);
                        const durationS = (attempt.timeSpentSeconds || 1800) % 60;

                        return (
                          <tr 
                            key={attempt.id} 
                            onClick={() => setSelectedHistoryExam(attempt)}
                            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                          >
                            {/* Exam Title & Badge */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isLatest ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-700'}`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-bold text-slate-900 truncate flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                                    <span>{attempt.examTitle}</span>
                                    {isLatest && (
                                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black">
                                        Mới nhất
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-600 font-mono">
                                    Mã: {attempt.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formattedDate}</span>
                              </div>
                            </td>

                            {/* Score */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="font-black text-slate-900 text-sm">
                                  {attempt.totalCorrect} <span className="text-slate-500 text-xs font-normal">/ {attempt.totalQuestions || 30} câu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-emerald-500 h-full rounded-full"
                                      style={{ width: `${Math.min(attempt.accuracy || 80, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-600">{attempt.accuracy || 80}%</span>
                                </div>
                              </div>
                            </td>

                            {/* Theta */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono font-black text-xs">
                                {Number(attempt.theta) > 0 ? `+${Number(attempt.theta).toFixed(2)}` : Number(attempt.theta).toFixed(2)}
                              </span>
                            </td>

                            {/* Placement */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${attempt.placementClass === 'BREAKTHROUGH'
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                : attempt.placementClass === 'ACCELERATION'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                {attempt.placementClass === 'BREAKTHROUGH' ? 'Bứt Phá (900+)' : attempt.placementClass === 'ACCELERATION' ? 'Tăng Tốc (750-900)' : 'Nền Tảng'}
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="py-4 px-4 text-slate-600 whitespace-nowrap font-mono">
                              {durationM}p {durationS.toString().padStart(2, '0')}s
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHistoryExam(attempt)}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Xem báo cáo và biểu đồ bài thi này"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Xem Đồ Thị & Báo Cáo</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Làm lại hoặc chọn đề mới"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Empty State Fallback if questions failed to load */}
      {stage === 'testing' && !currentQ && !isLoading && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Không tìm thấy câu hỏi bài thi</h2>
            <p className="text-xs text-slate-600">Đã xảy ra sự cố khi tải bộ câu hỏi từ máy chủ Content Service. Vui lòng thử lại.</p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Tải lại đề thi
              </button>
              <button
                type="button"
                onClick={() => currentUser ? onNavigateDashboard?.() : onNavigateHome?.()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. IN-EXAM TESTING SCREEN (30 Questions Flow)                         */}
      {/* ===================================================================== */}
      {stage === 'testing' && currentQ && (
        <div className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-start gap-6 transition-all duration-300 ${currentQ.passage_content
            ? 'max-w-[1720px]'
            : 'max-w-[1440px]'
          }`}>

          {/* Main Question Card (Adaptive sizing & roomy layout) */}
          <div className="flex-1 w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden text-slate-900 flex flex-col transition-all">

            <div className="space-y-5">

              {/* Question metadata badge bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${DOMAINS[currentQ.domain_id]?.badge || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {currentQ.domain_name || DOMAINS[currentQ.domain_id]?.name || 'Toán học & Phân tích'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kỹ năng: <strong className="text-slate-800">{currentQ.skill_name}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200">
                    Bloom {currentQ.bloom}/6
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${flagged[currentQ.id]
                    ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'Đã Gắn Cờ' : 'Đánh Dấu Phân Vân'}</span>
                </button>
              </div>

              {/* Responsive Layout: Split 2 Columns when Passage exists, Single Column when Normal */}
              {currentQ.passage_content ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start pt-1">
                  {/* Left Column: Reading Passage Context (Roomy, clear typography, comfortable scrolling) */}
                  <div className="xl:col-span-6 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 sm:p-6 max-h-[620px] overflow-y-auto space-y-3.5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10">
                      <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{currentQ.passage_title || 'Ngữ Liệu Đọc Hiểu'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        Bài đọc chuyên đề
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800 font-serif text-sm sm:text-[15px] select-text">
                      {currentQ.passage_content}
                    </div>
                  </div>

                  {/* Right Column: Question statement & Options */}
                  <div className="xl:col-span-6 space-y-4">
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-relaxed">
                      <span className="text-blue-600 font-black mr-2">Câu {currentIndex + 1}:</span>
                      <MathText text={currentQ.content} />
                    </div>

                    <div className="space-y-3 pt-1">
                      {currentQ.options.map((optText, optIdx) => {
                        const optChar = ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = answers[currentQ.id] === optChar;

                        return (
                          <button
                            key={optChar}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, optChar)}
                            className={`w-full p-4 sm:p-4.5 rounded-2xl text-left transition-all border flex items-start gap-3.5 ${isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-500/10 font-bold ring-1 ring-blue-500/30'
                              : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300'
                              }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all ${isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {optChar}
                            </div>
                            <div className="flex-1 text-sm sm:text-[15px] font-medium pt-1.5 leading-relaxed">
                              <MathText text={optText} />
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1.5">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Question Layout (Single expansive, spacious column) */
                <div className="space-y-5 pt-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-relaxed">
                    <span className="text-blue-600 font-black mr-2">Câu {currentIndex + 1}:</span>
                    <MathText text={currentQ.content} />
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {currentQ.options.map((optText, optIdx) => {
                      const optChar = ['A', 'B', 'C', 'D'][optIdx];
                      const isSelected = answers[currentQ.id] === optChar;

                      return (
                        <button
                          key={optChar}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optChar)}
                          className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all border flex items-start gap-4 ${isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-500/10 font-bold ring-1 ring-blue-500/30'
                            : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-blue-50/60 hover:border-blue-300'
                            }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 transition-all ${isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-200 text-slate-700'
                              }`}
                          >
                            {optChar}
                          </div>
                          <div className="flex-1 text-sm sm:text-base font-medium pt-2 leading-relaxed">
                            <MathText text={optText} />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-2">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Question Step Navigator (Xích lên gọn gàng ngay dưới câu hỏi) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu Trước</span>
                </button>

                <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-1">
                  <span>Thời gian câu này:</span>
                  <span className="font-mono text-blue-600 font-bold">{timeSpentPerQ[currentQ.id] || 0}s</span>
                </div>
              </div>

              <div className="text-xs font-black text-slate-500 font-mono">
                <span className="text-blue-600 text-sm font-extrabold">{currentIndex + 1}</span> / {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <span>Câu Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePromptSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <span>Hoàn Tất & Nộp Bài</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: 30 Question Grid Navigator (Sticky on scroll, wider and spacious) */}
          <div className="w-full lg:w-80 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5 flex-shrink-0 text-slate-900 lg:sticky lg:top-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Danh Sách {questions.length || 30} Câu</span>
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  {Object.keys(answers).length}/{questions.length} đã chọn
                </div>
              </div>

              {/* 30 Question Number Buttons */}
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlag = !!flagged[q.id];

                  let btnBg = 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300';
                  if (isCurrent) {
                    btnBg = 'bg-blue-600 text-white border-blue-500 font-black shadow-md shadow-blue-500/30 ring-2 ring-blue-500/40 scale-105 z-10';
                  } else if (isFlag) {
                    btnBg = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnBg = 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md shadow-emerald-600/20';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-extrabold transition-all border relative flex items-center justify-center ${btnBg}`}
                    >
                      <span>{idx + 1}</span>
                      {isAnswered && !isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1"></span>
                      )}
                      {isFlag && !isAnswered && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-2 text-[11px] font-bold text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-blue-600 border border-blue-500"></span>
                  <span className="text-blue-700 font-bold">Đang làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-500"></span>
                  <span className="text-emerald-700 font-extrabold">Đã hoàn thành (Tô đậm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></span>
                  <span className="text-amber-700 font-bold">Đánh dấu phân vân</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200"></span>
                  <span className="text-slate-500">Chưa làm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ANALYZING PSYCHOMETRICS LOADER                                     */}
      {/* ===================================================================== */}
      {stage === 'analyzing' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-6 shadow-xl animate-fade-in text-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <Brain className="w-8 h-8 animate-pulse text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">Đang Phân Tích Năng Lực IRT 2PL...</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Động cơ Psychometrics đang chạy giải thuật Ước lượng hợp lý cực đại (MLE) 2PL IRT và tính toán xác suất làm chủ BKT 5 miền năng lực.
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. COMPREHENSIVE RESULT, PACING ANALYSIS & ANSWER REVIEW TABLE        */}
      {/* ===================================================================== */}
      {stage === 'result' && resultData && (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-1 pb-8 space-y-6 animate-fade-in text-slate-900">

          {/* Top Result Navigation & Quick Actions Bar (Non-sticky, flows naturally with page) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
              {onNavigateHome && (
                <>
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Trang Chủ</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
              {currentUser && (
                <>
                  <button
                    type="button"
                    onClick={handleReturnDashboard}
                    className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </>
              )}
              <span className="text-slate-900 font-bold">Báo Cáo Nghiệm Thu Năng Lực IRT 2PL</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRetakeExam}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Làm Lại Đề Này (Reset)</span>
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={handleReturnDashboard}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Vào Dashboard Cá Nhân Hóa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {onNavigateHome && (
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all cursor-pointer"
                    >
                      ← Về Trang Chủ
                    </button>
                  )}
                  {onNavigateLogin && (
                    <button
                      type="button"
                      onClick={onNavigateLogin}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng Nhập Để Lưu Điểm</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Guest Notice Call-to-Action Banner */}
          {!currentUser && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 border border-amber-300/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-amber-950 flex items-center gap-2">
                    <span>Chế Độ Khách (Guest Mode)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black">Chưa Lưu Vào Học Bạ</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Bạn vừa hoàn thành 30 câu khảo sát năng lực! Để điểm số được bảo lưu vĩnh viễn và thuật toán AI tự động xếp bạn vào lớp vi mô mở <strong className="text-blue-900">Lộ Trình Học Thích Ứng (Flow 2)</strong>, hãy đăng nhập hoặc đăng ký tài khoản.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                {onNavigateLogin && (
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập / Đăng Ký Lưu Kết Quả</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top Result Hero Banner with Ambient Glow & Glassmorphism */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800">
            {/* Ambient blur orbs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 -mb-20 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">

              {/* Top Banner Tag & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black text-[#FACC15] backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>BÁO CÁO NĂNG LỰC ĐẦU VÀO CHUẨN HÓA V-ACT 2026</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Mã bài: <strong className="text-white font-bold">{examData?.id || 'VACT-30'}</strong> • Thời lượng: 45 phút
                </div>
              </div>

              {/* Title & Description */}
              <div className="max-w-3xl space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Phân Tích Năng Lực & Dự Đoán Điểm Số ĐGNL
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Kết quả được ước lượng qua mô hình trắc lượng học hiện đại <strong className="text-[#FACC15]">IRT 2PL (Item Response Theory)</strong> kết hợp dữ liệu phản xạ thời gian thực và phân loại Bloom 6 cấp độ.
                </p>
              </div>

              {/* 3 Prominent Glassmorphism KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

                {/* 1. Raw Score & Accuracy */}
                <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Điểm Số Thô
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {resultData.pacing?.totalCorrect || 0}<span className="text-base font-semibold text-slate-400"> / {resultData.pacing?.totalQuestions || 30}</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>Đạt {Math.round(((resultData.pacing?.totalCorrect || 0) / (resultData.pacing?.totalQuestions || 30)) * 100)}% chính xác</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* 2. IRT Theta 0 */}
                <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                      Chỉ Số Năng Lực IRT θ₀
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
                      {resultData.theta_0 > 0 ? `+${resultData.theta_0.toFixed(2)}` : resultData.theta_0.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <span>Top ~{resultData.theta_0 >= 1.2 ? '10%' : resultData.theta_0 >= 0.5 ? '25%' : '50%'} thí sinh toàn quốc</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Brain className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* 3. Placement Class */}
                <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg hover:border-white/25 transition-all">
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                      Phân Lớp Đề Xuất
                    </div>
                    <div className="text-base sm:text-lg font-black text-white leading-tight">
                      {resultData.placement_class === 'BREAKTHROUGH'
                        ? 'Lớp Bứt Phá (900+)'
                        : resultData.placement_class === 'ACCELERATION'
                          ? 'Lớp Tăng Tốc (750-900)'
                          : 'Lớp Nền Tảng (<750)'}
                    </div>
                    <div className="text-xs font-semibold text-slate-300">
                      {resultData.placement_class === 'BREAKTHROUGH'
                        ? 'Chinh phục ĐHQG-HCM 900+'
                        : resultData.placement_class === 'ACCELERATION'
                          ? 'Tập trung bứt phá câu VDC'
                          : 'Củng cố nền tảng kiến thức'}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Award className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ===================================================================== */}
          {/* PHÂN TÍCH TỐC ĐỘ & CHIẾN THUẬT LÀM BÀI (PACING ANALYSIS)              */}
          {/* ===================================================================== */}
          <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-5 text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-base font-black text-slate-900">
                <Gauge className="w-5 h-5 text-amber-500" />
                <span>Phân Tích Tốc Độ & Chiến Thuật Làm Bài (Pacing Analysis)</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Tổng thời gian làm bài: <strong className="text-slate-900 font-mono font-bold">{formatTime(resultData.pacing?.totalTimeSpent || 0)}</strong> / 45:00
              </div>
            </div>

            {/* 4 Speedometer Cards: Fast / Normal / Slow / Average */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              {/* Average Time */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span>Thời Gian Trung Bình</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {resultData.pacing?.avgTimePerQ || 0}<span className="text-xs font-semibold text-slate-500">s / câu</span>
                </div>
                <div className="text-[11px] text-blue-700 font-semibold">Nhịp độ tiêu chuẩn V-ACT (90s)</div>
              </div>

              {/* Fast (<25s) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>Phản Xạ Nhanh (&lt;25s)</span>
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-900 font-mono">
                  {resultData.pacing?.fastCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">Phản xạ nhạy bén ở câu quen thuộc</div>
              </div>

              {/* Normal (25-90s) */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>Chuẩn Nhịp Độ (25-90s)</span>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-900 font-mono">
                  {resultData.pacing?.normalCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                </div>
                <div className="text-[11px] text-blue-700 font-semibold">Kiểm soát tiến độ 45 phút tối ưu</div>
              </div>

              {/* Slow (>90s) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                  <span>Tốn Nhiều Thời Gian (&gt;90s)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-900 font-mono">
                  {resultData.pacing?.slowCount || 0}<span className="text-xs font-semibold text-slate-500"> câu</span>
                </div>
                <div className="text-[11px] text-amber-800 font-semibold">
                  {resultData.pacing?.slowCount > 4 ? 'Cần cải thiện tốc độ câu khó' : 'Phân bổ thời gian an toàn'}
                </div>
              </div>

            </div>
          </div>

          {/* Radar Chart & AI Commentary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: Recharts 5-Axis Radar Chart */}
            <div className="lg:col-span-6 p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Biểu Đồ Radar Năng Lực 5 Lĩnh Vực</span>
                </div>
                <div className="text-xs text-slate-500 font-bold">Thang đo %</div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={resultData.radar_chart || []}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="domain_name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Điểm Thí Sinh" dataKey="student_pct" stroke="#2563eb" fill="#2563eb" fillOpacity={0.45} />
                    <Radar name="Chuẩn Mục Tiêu" dataKey="benchmark_pct" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>Kết quả của bạn</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span>Chuẩn đầu vào 900+</span>
                </div>
              </div>
            </div>

            {/* Right: Gemini AI Socratic Commentary & Domain breakdown */}
            <div className="lg:col-span-6 flex flex-col space-y-5">

              {/* AI Socratic Commentary Box */}
              <div className="p-6 bg-gradient-to-br from-purple-50/90 to-indigo-50/80 border border-purple-200/80 rounded-3xl shadow-xl space-y-3 text-slate-900">
                <div className="flex items-center gap-2 text-sm font-black text-purple-900">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Lời Khuyên Sư Phạm Từ Cố Vấn AI (Gemini Commentary)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
                  "{resultData.ai_commentary || 'Thí sinh thể hiện tư duy nhạy bén và phân bổ thời gian hợp lý. Hãy tiếp tục củng cố các kỹ năng vận dụng cao để bứt phá mục tiêu điểm số 900+.'}"
                </p>
              </div>

              {/* 5 Domains Accuracy Progress */}
              <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-3.5 flex-1 text-slate-900">
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Chi Tiết Từng Lĩnh Vực ĐGNL
                </div>
                <div className="space-y-3">
                  {(resultData.domain_scores || []).map((ds) => (
                    <div key={ds.domain_id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{ds.domain_name}</span>
                        <span className="text-blue-600 font-extrabold">{ds.accuracy_pct}% ({ds.correct_count || 0}/{ds.total_questions || 6} câu)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(ds.accuracy_pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* BẢNG ĐÁNH GIÁ CHI TIẾT & ĐÁP ÁN 30 CÂU (ANSWER KEY & EXPLANATIONS)    */}
          {/* ===================================================================== */}
          <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-6 text-slate-900">

            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Bảng Đánh Giá Chi Tiết & Đáp Án 30 Câu Hỏi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đối chiếu câu trả lời của thí sinh với đáp án chính xác, lời giải chi tiết và thời gian làm bài.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setReviewFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Tất Cả ({resultData.reviewedQuestions?.length || 30})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('CORRECT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'CORRECT'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Đúng ({resultData.pacing?.totalCorrect || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('WRONG')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'WRONG'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Sai ({(resultData.pacing?.totalQuestions || 30) - (resultData.pacing?.totalCorrect || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('FLAGGED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'FLAGGED'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Phân Vân ({resultData.pacing?.flaggedCount || 0})
                </button>
              </div>
            </div>

            {/* List of 30 Detailed Questions */}
            <div className="space-y-4">
              {filteredReviewQuestions.map((q) => {
                const isSelected = !!q.studentChoice;

                return (
                  <div
                    key={q.id}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${q.isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : isSelected
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-slate-50/80 border-slate-200'
                      }`}
                  >
                    {/* Question Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-blue-600">
                          Câu {q.question_number}:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${DOMAINS[q.domain_id]?.badge || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {q.domain_name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {q.skill_name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] font-bold text-slate-700">
                          Bloom {q.bloom}/6
                        </span>
                        {q.isFlagged && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 flex items-center gap-1">
                            <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Phân vân</span>
                          </span>
                        )}
                      </div>

                      {/* Speed badge & status */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${q.speedCategory === 'fast'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : q.speedCategory === 'slow'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{q.timeSpent}s</span>
                          <span className="text-[10px] opacity-80">
                            ({q.speedCategory === 'fast' ? '⚡ Nhanh' : q.speedCategory === 'slow' ? '⏳ Chậm' : '⏱️ Chuẩn'})
                          </span>
                        </span>

                        <span className={`px-3 py-1 rounded-xl text-xs font-black ${q.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isSelected
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                          }`}>
                          {q.isCorrect ? '✅ Chính xác' : isSelected ? '❌ Chưa đúng' : '⚪ Chưa trả lời'}
                        </span>
                      </div>
                    </div>

                    {/* Passage text if any */}
                    {q.passage_content && (
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-800 font-serif leading-relaxed">
                        <div className="text-[10px] font-bold text-blue-700 uppercase mb-1">
                          {q.passage_title || 'Ngữ liệu đọc hiểu'}:
                        </div>
                        <div className="line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                          {q.passage_content}
                        </div>
                      </div>
                    )}

                    {/* Question Content */}
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      <MathText text={q.content} />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const optChar = ['A', 'B', 'C', 'D'][optIdx];
                        const isStudentChoice = q.studentChoice === optChar;
                        const isCorrectChoice = q.correctChoice === optChar;

                        let cardStyle = 'bg-white border-slate-200 text-slate-800';
                        if (isCorrectChoice) {
                          cardStyle = 'bg-emerald-100/70 border-emerald-400 text-emerald-900 font-bold shadow-sm';
                        } else if (isStudentChoice && !q.isCorrect) {
                          cardStyle = 'bg-rose-100/70 border-rose-400 text-rose-900 font-bold';
                        }

                        return (
                          <div
                            key={optChar}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${cardStyle}`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isCorrectChoice
                                ? 'bg-emerald-600 text-white'
                                : isStudentChoice
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {optChar}
                            </div>
                            <div className="flex-1 pt-0.5 leading-relaxed">
                              <MathText text={optText} />
                            </div>
                            {isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-black flex-shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-600 text-white font-black flex-shrink-0">
                                Bạn đã chọn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation */}
                    <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-xs sm:text-sm space-y-1.5 text-slate-800">
                      <div className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                      </div>
                      <div className="text-slate-800 leading-relaxed font-medium">
                        <MathText text={q.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleRetakeExam}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Khảo Sát Đề Mới Khác (Reset Cảnh Báo)</span>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={handleReturnDashboard}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <span>Vào Lộ Trình Học Tập Cá Nhân Hóa (Dashboard)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {onNavigateHome && (
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200"
                  >
                    ← Về Trang Chủ
                  </button>
                )}
                {onNavigateLogin && (
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập / Đăng Ký Để Lưu Điểm Số</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal (React Overlay - No window.confirm to prevent tab-switch bug) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden text-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Xác Nhận Nộp Bài Thi Chẩn Đoán?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn đã hoàn thành <strong className="text-emerald-600 font-bold">{Object.keys(answers).length} / {questions.length}</strong> câu hỏi.
                {Object.keys(answers).length < questions.length && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    ⚠️ Còn {questions.length - Object.keys(answers).length} câu chưa trả lời. Bạn có chắc muốn nộp sớm không?
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200"
              >
                Hủy & Tiếp Tục Làm Bài
              </button>

              <button
                type="button"
                onClick={executeSubmitExam}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Exit Confirmation Modal (React Overlay - Replaces raw window.confirm) */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden text-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Rời Khỏi Phòng Thi?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tiến trình làm bài hiện tại sẽ không được lưu lại. Bạn có chắc chắn muốn rời khỏi bài thi khảo sát và quay về không?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200 cursor-pointer"
              >
                Tiếp Tục Làm Bài
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitConfirmModal(false);
                  exitFullScreenMode();
                  if (currentUser) {
                    onNavigateDashboard?.();
                  } else {
                    onNavigateHome?.();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                Xác Nhận Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom System Alert Popup Modal (React Overlay - Replaces raw window.alert) */}
      {customAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-2xl relative overflow-hidden text-slate-900">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${customAlert.type === 'error'
                ? 'bg-rose-100 text-rose-600 border-rose-200'
                : customAlert.type === 'warning'
                  ? 'bg-amber-100 text-amber-600 border-amber-200'
                  : 'bg-blue-100 text-blue-600 border-blue-200'
              }`}>
              {customAlert.type === 'error' ? (
                <AlertCircle className="w-8 h-8 stroke-[2.5]" />
              ) : customAlert.type === 'warning' ? (
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <Sparkles className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                {customAlert.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {customAlert.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const callback = customAlert.onConfirm;
                  setCustomAlert(null);
                  if (callback) callback();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Azota Anti-Cheat Violation Warning Modal Overlay (Strictly ONLY rendered during active 'testing' stage) */}
      {stage === 'testing' && showViolationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white border-2 border-rose-500 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden text-slate-900">

            {/* Top Glowing Red Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${tabSwitchCount >= 3
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
              : 'bg-rose-100 text-rose-600 border border-rose-200 animate-bounce'
              }`}>
              <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${tabSwitchCount >= 3
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                {tabSwitchCount >= 3 ? '⛔ ĐÃ KHÓA BÀI THI DO VI PHẠM' : `⚠️ Giám Sát Phòng Thi Azota Proctored (Lần ${tabSwitchCount}/3)`}
              </span>
              <h2 className="text-xl font-black text-slate-900">
                {tabSwitchCount >= 3
                  ? 'Vi Phạm Quá 3 Lần - Bài Thi Bị Khóa!'
                  : 'Phát Hiện Vi Phạm Quy Chế Bài Thi!'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tabSwitchCount >= 3
                  ? 'Bạn đã rời khỏi màn hình hoặc chuyển tab 3 lần. Để đảm bảo tính công bằng và nghiêm túc, bài làm của bạn đã bị khóa và đang được tự động gửi đến hội đồng chấm điểm!'
                  : violationReason === 'tab_switch'
                    ? 'Hệ thống vừa phát hiện bạn chuyển tab trình duyệt hoặc rời khỏi cửa sổ màn hình làm bài!'
                    : 'Hệ thống vừa phát hiện bạn thoát khỏi Chế độ Toàn Màn Hình bài thi!'}
              </p>
            </div>

            {/* Counter Box */}
            <div className={`p-4 rounded-2xl border font-mono text-sm flex items-center justify-center gap-2 ${tabSwitchCount >= 3
              ? 'bg-rose-100 border-rose-300 text-rose-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
              <span>Số lần rời màn hình:</span>
              <strong className="text-rose-600 text-lg font-black">{Math.min(tabSwitchCount, 3)} / 3</strong>
            </div>

            <div className={`text-[11px] p-3 rounded-xl border leading-relaxed ${tabSwitchCount >= 3
              ? 'bg-rose-50 text-rose-900 border-rose-200 font-semibold animate-pulse'
              : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
              {tabSwitchCount >= 3
                ? '⏳ Hệ thống đang tự động nộp bài và tính điểm năng lực IRT θ₀ trong giây lát...'
                : '💡 Lưu ý: Nếu tiếp tục rời màn hình đủ 3 lần, bài thi sẽ bị TỰ ĐỘNG KHÓA VÀ NỘP BÀI NGAY LẬP TỨC!'}
            </div>

            {/* Action Buttons */}
            {tabSwitchCount >= 3 ? (
              <button
                type="button"
                onClick={executeSubmitExam}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài & Chấm Điểm Ngay</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowViolationModal(false);
                  requestFullScreenMode();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Quay Lại Toàn Màn Hình & Tiếp Tục Làm Bài</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EXAM DETAIL & PASSCODE VERIFICATION MODAL                             */}
      {/* ===================================================================== */}
      {selectedExamForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-scale-up">

            {/* Header Banner */}
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-300 border border-white/20">
                    {selectedExamForModal.badge || 'PHÒNG THI CHUẨN HÓA V-ACT'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {selectedExamForModal.title}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    {selectedExamForModal.schoolName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExamForModal(null)}
                  className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Số lượng câu hỏi</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{selectedExamForModal.questionCount} câu trắc nghiệm</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Thời gian làm bài</div>
                  <div className="text-sm font-black text-blue-600 mt-0.5">{selectedExamForModal.durationMinutes} phút</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Quy chế phòng thi</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Azota Proctored Toàn Màn Hình</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Động cơ chấm điểm</div>
                  <div className="text-xs font-black text-indigo-600 mt-0.5">IRT 2PL & Theta 0</div>
                </div>
              </div>

              {/* Proctoring Warning Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo giám sát thi trực tuyến Azota</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 font-medium">
                  Hệ thống tự động kích hoạt <strong>Toàn Màn Hình</strong>. Mọi hành động chuyển tab, chụp màn hình hoặc rời khỏi cửa sổ quá <strong>3 lần</strong> sẽ khiến bài thi bị khóa và tự động nộp bài!
                </p>
              </div>

              {/* Passcode Input Field */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                  Nhập Mã Phòng Thi / Mật Mã Truy Cập
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalAccessCode}
                    onChange={(e) => {
                      setModalAccessCode(e.target.value);
                      if (modalCodeError) setModalCodeError('');
                    }}
                    placeholder={`Mã phòng thi: ${selectedExamForModal.defaultCode}`}
                    className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm font-black text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setModalAccessCode(selectedExamForModal.defaultCode);
                      setModalCodeError('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Điền mã mẫu
                  </button>
                </div>

                {modalCodeError && (
                  <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalCodeError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExamForModal(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  Hủy / Quay Lại
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmStartExam(selectedExamForModal)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>🚀 Bắt Đầu Vào Làm Bài Ngay</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Fullscreen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-4 text-center max-w-sm text-slate-900 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-black text-slate-900">V-Eval Diagnostic</div>
              <div className="text-xs font-semibold text-slate-600">{loadingMsg || 'Đang xử lý dữ liệu...'}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
