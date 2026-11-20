import { ExamRoomBody, ExamRoomHeader, ExamSubmitConfirmation } from './ExamRoom';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  ExternalLink,
  CreditCard,
  Network
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
import apiClient, { tokenStorage } from '../../services/apiClient';
import MathText from '../common/MathText';
import DiagnosticResultSummary from './DiagnosticResultSummary';
import { createExamClock } from './examClock';
import { createSubmissionSnapshot } from './submissionSnapshot';
import { draftKey, readDraft, findSavedDiagnostic, domainScoresFromQuestions, removeDiagnosticDraft } from './diagnosticRecovery';
import WeakSkills from './WeakSkills';
import DiagnosticReportTabs, { DiagnosticReportPanel } from './DiagnosticReportTabs';
import DiagnosticSkillProfile from './DiagnosticSkillProfile';
import { completedDiagnosticExamIds, DIAGNOSTIC_TARGET } from './diagnosticEligibility';
import { DOMAINS } from './diagnosticData';
import { sampleQuestionsForDiagnostic } from '../../data/mockData';
import { cleanVietnameseDiacritics } from '../../utils/vietnameseUtils';

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
        const domainInfo = { id: q.domainId || 'unknown', name: q.domainName || 'Chưa xác định miền' };

        const startQ = passage.startQuestion ?? passage.start_question ?? passage.StartQuestion;
        const endQ = passage.endQuestion ?? passage.end_question ?? passage.EndQuestion;
        const passageTitle = cleanVietnameseDiacritics((startQ && endQ)
          ? `Ngữ liệu đọc hiểu (Câu ${startQ} - ${endQ})`
          : (passage.title || 'Ngữ liệu đọc hiểu'));

        allQuestions.push({
          id: q.questionId,
          question_number: q.questionNumber,
          passage_content: cleanVietnameseDiacritics(passage.content || ''),
          passage_title: passageTitle,
          content: cleanVietnameseDiacritics(q.content || ''),
          options: optionsList.map(cleanVietnameseDiacritics),
          skill_id: q.skillId || 'sk_vact',
          skill_name: skillName,
          domain_id: domainInfo.id,
          domain_name: domainInfo.name,
          domain_code: q.domainCode || '',
          subject_name: q.subjectName || '',
          chapter_name: q.chapterName || '',
          lesson_name: q.lessonName || '',
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
      const domainInfo = { id: q.domainId || 'unknown', name: q.domainName || 'Chưa xác định miền' };

      allQuestions.push({
        id: q.questionId,
        question_number: q.questionNumber,
        passage_content: '',
        passage_title: '',
        content: cleanVietnameseDiacritics(q.content || ''),
        options: optionsList.map(cleanVietnameseDiacritics),
        skill_id: q.skillId || 'sk_vact',
        skill_name: skillName,
        domain_id: domainInfo.id,
        domain_name: domainInfo.name,
        domain_code: q.domainCode || '',
        subject_name: q.subjectName || '',
        chapter_name: q.chapterName || '',
        lesson_name: q.lessonName || '',
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

function normalizeRadarChart(rawRadarChart, domainScores = []) {
  if (Array.isArray(rawRadarChart) && rawRadarChart.length > 0) {
    return rawRadarChart.map((r) => {
      const studentPct = r.studentPct ?? r.student_pct;
      const benchmarkPct = r.benchmarkPct ?? r.benchmark_pct;
      return {
        domain_id: r.domainId || r.domain_id || '',
        domain_name: r.domainName || r.domain_name || '',
        student_pct: studentPct == null ? undefined : Number(studentPct),
        benchmark_pct: benchmarkPct == null ? undefined : Number(benchmarkPct)
      };
    }).filter((r) => Number.isFinite(r.student_pct));
  }

  const validDomains = Array.isArray(domainScores)
    ? domainScores.filter((d) => d && d.domain_id !== 'unknown')
    : [];
  if (validDomains.length > 0) {
    return validDomains.map((d) => ({
      domain_id: d.domain_id,
      domain_name: d.domain_name || '',
      student_pct: Number(d.accuracy_pct),
      benchmark_pct: undefined
    })).filter((r) => Number.isFinite(r.student_pct));
  }

  return [];
}

function normalizeSkillPriors(rawSkillPriors, skillBreakdowns = [], questions = []) {
  if (Array.isArray(rawSkillPriors) && rawSkillPriors.length > 0) {
    return rawSkillPriors.map((sp, idx) => {
      const rawPL0 = sp.pL0 ?? sp.pl0 ?? sp.p_l0;
      const rawTheta = sp.thetaSkill ?? sp.theta_skill;
      const parsedPL0 = rawPL0 == null ? undefined : Number(rawPL0);
      const parsedTheta = rawTheta == null ? undefined : Number(rawTheta);
      const pL0 = Number.isFinite(parsedPL0)
        ? parsedPL0
        : Number.isFinite(parsedTheta) ? 1 / (1 + Math.exp(-parsedTheta)) : undefined;
      const thetaSkill = Number.isFinite(parsedTheta)
        ? parsedTheta
        : Number.isFinite(pL0) ? Math.log(Math.max(0.05, Math.min(0.98, pL0)) / (1 - Math.max(0.05, Math.min(0.98, pL0)))) : undefined;
      if (!Number.isFinite(pL0) && !Number.isFinite(thetaSkill)) return null;
      return {
        skill_id: sp.skillId || sp.skill_id || `sk_${idx + 1}`,
        skillId: sp.skillId || sp.skill_id || `sk_${idx + 1}`,
        skill_name: sp.skillName || sp.skill_name || '',
        skillName: sp.skillName || sp.skill_name || '',
        domain_id: sp.domainId || sp.domain_id || '',
        domain_name: sp.domainName || sp.domain_name || '',
        domainName: sp.domainName || sp.domain_name || '',
        theta_skill: Number.isFinite(thetaSkill) ? Math.round(thetaSkill * 100) / 100 : undefined,
        thetaSkill: Number.isFinite(thetaSkill) ? Math.round(thetaSkill * 100) / 100 : undefined,
        p_l0: Number.isFinite(pL0) ? Math.round(pL0 * 10000) / 10000 : undefined,
        pL0: Number.isFinite(pL0) ? Math.round(pL0 * 10000) / 10000 : undefined,
        source: sp.source || 'measured'
      };
    }).filter(Boolean);
  }

  if (Array.isArray(skillBreakdowns) && skillBreakdowns.length > 0) {
    return skillBreakdowns.map((sb, idx) => {
      const rawAccuracy = sb.accuracyPercentage ?? sb.accuracy_pct;
      const acc = rawAccuracy == null ? NaN : Number(rawAccuracy);
      if (!Number.isFinite(acc)) return null;
      const pL0 = Math.min(0.98, Math.max(0.05, Math.round((acc / 100) * 10000) / 10000));
      const thetaSkill = Math.round(Math.log(pL0 / (1 - pL0)) * 100) / 100;
      const skillId = sb.skillId || sb.skill_id || `sk_${idx + 1}`;
      const skillName = sb.skillName || sb.skill_name || '';
      const domainName = sb.domainName || sb.domain_name || '';
      return {
        skill_id: skillId,
        skillId,
        skill_name: skillName,
        skillName,
        domain_id: sb.domainId || sb.domain_id || '',
        domain_name: domainName,
        domainName,
        theta_skill: thetaSkill,
        thetaSkill,
        p_l0: pL0,
        pL0,
        source: 'measured'
      };
    }).filter(Boolean);
  }

  if (Array.isArray(questions) && questions.length > 0) {
    const grouped = {};
    questions.forEach((q) => {
      const key = q.skillId || q.skill_id || q.skillName || q.skill_name;
      if (!key) return;
      if (!grouped[key]) {
        grouped[key] = {
          skill_id: String(key),
          skill_name: q.skillName || q.skill_name || String(key),
          domain_id: q.domainId || q.domain_id || '',
          domain_name: q.domainName || q.domain_name || '',
          total: 0,
          correct: 0
        };
      }
      grouped[key].total += 1;
      if (q.isCorrect) grouped[key].correct += 1;
    });

    const entries = Object.values(grouped);
    if (entries.length > 0) {
      return entries.map((g) => {
        const pL0 = Math.min(0.98, Math.max(0.05, Math.round((g.correct / Math.max(1, g.total)) * 10000) / 10000));
        const thetaSkill = Math.round(Math.log(pL0 / (1 - pL0)) * 100) / 100;
        const skillId = g.skill_id;
        const skillName = g.skill_name;
        const domainName = g.domain_name;
        return {
          skill_id: skillId,
          skillId,
          skill_name: skillName,
          skillName,
          domain_id: g.domain_id,
          domain_name: domainName,
          domainName,
          theta_skill: thetaSkill,
          thetaSkill,
          p_l0: pL0,
          pL0,
          source: 'measured'
        };
      });
    }
  }

  return [];
}

export default function DiagnosticAssessmentPage({
  onCompleteDiagnostic,
  onNavigateDashboard,
  onNavigateHistory,
  onNavigateRoadmap,
  onNavigateTuition,
  onNavigateHome,
  onNavigateLogin,
  onNavigateQuestionBank,
  currentUser = null,
  isEmbedded = false,
  historyOnly = false,
  onExamStateChange,
  onHistoryDetailChange,
  autoStart = false,
  examCode = 'VACT2026'
}) {
  // Page states: 'setup' | 'testing' | 'analyzing' | 'result'
  const [stage, setStage] = useState('setup');
  const autoStartedRef = useRef(false);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [showCampusSetup, setShowCampusSetup] = useState(false);
  const [campusSaving, setCampusSaving] = useState(false);
  const [campusError, setCampusError] = useState('');

  // Setup / Lobby states
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);
  const [modalAccessCode, setModalAccessCode] = useState('');
  const [modalCodeError, setModalCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // Selected attempt from history to view in detail (null = show history overview list)
  const [selectedHistoryExam, setSelectedHistoryExam] = useState(null);
  useEffect(() => {
    onHistoryDetailChange?.(Boolean(selectedHistoryExam));
  }, [selectedHistoryExam, onHistoryDetailChange]);

  // Ignore legacy browser caches: they can contain sample submissions.
  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const [examHistory, setExamHistory] = useState([]);
  const [recovering, setRecovering] = useState(() => !historyOnly && Boolean(readDraft(localStorage, currentUser?.userId || currentUser?.id || currentUser?.studentId)));
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryRetry, setRecoveryRetry] = useState(0);
  const recoveryBlocked = useRef(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyReload, setHistoryReload] = useState(0);
  const completedExamCount = new Set(examHistory.map((item) => item.examId)).size;
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRef = useRef(0);
  const [resultData, setResultData] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [reportTab, setReportTab] = useState('overview');
  const currentDisplayResult = selectedHistoryExam?.resultData || resultData;

  useEffect(() => {
    setSelectedHistoryExam(null);
    setResultData(null);
    setExamHistory([]);
    setDetailError('');
    setDetailLoading(false);
    ++detailRef.current;
    return () => { ++detailRef.current; };
  }, [studentId]);

  useEffect(() => {
    let active = true;
    setHistoryError('');
    setHistoryLoading(true);
    if (!studentId || !tokenStorage.getAccessToken()) {
      setHistoryLoading(false);
      return;
    }
    practiceService.getDiagnosticHistory(studentId).then(async (items) => {
      if (!active) return;
      if (!Array.isArray(items) || items.some((item) => item.studentId !== studentId)) {
        throw new Error('Dữ liệu lịch sử không hợp lệ.');
      }
      // Fetch confirmed details for trend chart with graceful summary fallback
      const completed = items.filter((item) => item.status === 'COMPLETED' && item.examType === 'DIAGNOSTIC');
      const details = await Promise.all(
        completed.map(async (item) => {
          try {
            const detail = await practiceService.getDiagnosticResult(item.submissionId);
            return detail;
          } catch {
            return {
              submissionId: item.submissionId,
              studentId: item.studentId,
              examId: item.examId,
              completedAt: item.completedAt,
              totalCorrect: item.totalCorrect,
              totalQuestions: item.totalQuestions,
              theta0: Number.isFinite(item.theta0) ? item.theta0 : (Number.isFinite(item.theta_0) ? item.theta_0 : 0),
              totalTimeSpentSeconds: item.totalTimeSpentSeconds,
              placementClass: item.placementClass || 'ACCELERATION',
            };
          }
        })
      );
      if (!active) return;
      const validDetails = details.filter((item) => item && Number.isFinite(item.theta0));
      setExamHistory(validDetails.map((item) => ({
        id: item.submissionId, examId: item.examId, examTitle: 'Khảo sát năng lực đầu vào',
        completedAt: item.completedAt, totalCorrect: item.totalCorrect,
        totalQuestions: item.totalQuestions, theta: item.theta0,
        timeSpentSeconds: item.totalTimeSpentSeconds
      })).sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)));
    }).catch((err) => { if (active) setHistoryError(err.message); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [studentId, historyReload]);

  const openHistoryExam = async (attempt, cachedData = null) => {
    const request = ++detailRef.current;
    setDetailError('');
    setDetailLoading(true);
    try {
      const data = cachedData || await practiceService.getDiagnosticResult(attempt.id);
      if (request !== detailRef.current) return;
      if (data.studentId !== studentId || data.submissionId !== attempt.id || !Number.isFinite(data.theta0)) {
        throw new Error('Kết quả bài kiểm tra không hợp lệ.');
      }

      // 1. Nạp ngân hàng câu hỏi gốc từ Content Service đúng theo data.examId (KHÔNG dùng câu hỏi mock)
      let examQuestionsMap = new Map();
      let examQuestionsList = [];

      const hasAllServerContent = Array.isArray(data.questions) && data.questions.every((q) => q.content && Array.isArray(q.options) && q.options.length > 0);
      if (!hasAllServerContent) {
        if (examData?.id === data.examId && examData?.questions?.length > 0) {
          examQuestionsList = examData.questions;
        } else if (data.examId) {
          try {
            const rawExam = await contentService.getExamDetail(data.examId);
            const transformed = transformBackendExamToQuestions(rawExam);
            if (transformed.questions?.length > 0) {
              examQuestionsList = transformed.questions;
            }
          } catch (contentErr) {
            console.warn('[DiagnosticAssessmentPage] Không thể nạp chi tiết đề thi từ Content Service:', contentErr);
          }
        }
      }

      examQuestionsList.forEach((eq, idx) => {
        if (eq.id) examQuestionsMap.set(String(eq.id).toLowerCase(), eq);
        examQuestionsMap.set(`num_${eq.question_number || (idx + 1)}`, eq);
      });

      const reviewed = (data.questions || []).map((q, idx) => {
        const qId = String(q.questionId || '').toLowerCase();
        const qNum = (q.questionOrder && q.questionOrder > 0) ? q.questionOrder : (idx + 1);
        const matched = examQuestionsMap.get(qId) || examQuestionsMap.get(`num_${qNum}`) || null;

        const content = q.content || matched?.content || `Câu hỏi #${qNum} (đã lưu trên máy chủ)`;
        const options = (q.options && q.options.length > 0)
          ? q.options
          : (matched?.options && matched.options.length > 0 ? matched.options : []);

        const skillName = q.skillName || matched?.skill_name || 'Kỹ năng chuẩn hóa ĐGNL';
        const domainMapping = mapSkillToDomain(skillName, idx);
        const domainName = (q.domainName && !q.domainName.includes('Chưa xác định'))
          ? q.domainName
          : domainMapping.name;
        const domainId = q.domainCode || q.domainId || domainMapping.id;
        const bloom = (q.difficultyLevel && q.difficultyLevel > 0)
          ? q.difficultyLevel
          : (matched?.bloom || 2);

        const timeSpent = q.timeSpentSeconds ?? 0;
        let speedCategory = 'normal';
        if (timeSpent < 25) speedCategory = 'fast';
        else if (timeSpent > 90) speedCategory = 'slow';

        const correctChoice = (q.correctOption || matched?.correctChoice || '').trim().toUpperCase();

        const explanation = (q.explanation && q.explanation.trim()) ||
          (matched?.explanation && matched.explanation.trim()) ||
          '';

        return {
          id: q.questionId || matched?.id || `q_${idx + 1}`,
          question_number: qNum,
          passage_content: cleanVietnameseDiacritics(q.passageContent || matched?.passage_content || ''),
          passage_title: cleanVietnameseDiacritics(q.passageTitle || matched?.passage_title || ''),
          content: cleanVietnameseDiacritics(content),
          options: (options || []).map(cleanVietnameseDiacritics),
          skill_name: cleanVietnameseDiacritics(skillName),
          domain_id: domainId,
          domain_name: cleanVietnameseDiacritics(domainName),
          bloom: bloom,
          studentChoice: q.selectedOption || '',
          correctChoice: correctChoice,
          isCorrect: Boolean(q.isCorrect),
          timeSpent: timeSpent,
          isFlagged: false,
          speedCategory,
          explanation: cleanVietnameseDiacritics(explanation)
        };
      });

      setReportTab('overview');
      setReviewFilter('ALL');

      const computedDomainScores = domainScoresFromQuestions(data.questions);
      const normalizedRadar = normalizeRadarChart(
        data.radarChart || data.radar_chart,
        computedDomainScores,
        data.totalCorrect,
        data.totalQuestions
      );
      const normalizedPriors = normalizeSkillPriors(
        data.skillPriors || data.skill_priors,
        data.skillBreakdowns,
        data.questions,
        data.theta0
      );
      setSelectedHistoryExam({ ...attempt, resultData: {
        theta_0: data.theta0, placement_class: data.placementClass,
        ai_commentary: data.aiCommentary, reviewedQuestions: reviewed, domain_scores: computedDomainScores,
        weakSkills: data.weakSkills, skillBreakdowns: data.skillBreakdowns,
        subjectBreakdowns: data.subjectBreakdowns || [],
        radar_chart: normalizedRadar,
        radarChart: normalizedRadar,
        skill_priors: normalizedPriors,
        skillPriors: normalizedPriors,
        pacing: { totalCorrect: data.totalCorrect, totalQuestions: data.totalQuestions,
          totalTimeSpent: data.totalTimeSpentSeconds,
          avgTimePerQ: data.totalQuestions ? Math.round(data.totalTimeSpentSeconds / data.totalQuestions) : 0,
          fastCount: reviewed.filter((q) => q.speedCategory === 'fast').length,
          normalCount: reviewed.filter((q) => q.speedCategory === 'normal').length,
          slowCount: reviewed.filter((q) => q.speedCategory === 'slow').length, flaggedCount: 0 }
      }});
    } catch (err) {
      if (request === detailRef.current) setDetailError(err.message);
    } finally {
      if (request === detailRef.current) setDetailLoading(false);
    }
  };

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
    if (!historyOnly && autoStart && !autoStartedRef.current && !readDraft(localStorage, studentId)) {
      autoStartedRef.current = true;
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
  const launchFullscreenPendingRef = useRef(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('tab_switch'); // 'tab_switch' | 'exit_fullscreen'

  // Submit confirmation modal state (custom React modal to avoid browser window.confirm tab switch bugs)
  const [showSubmitModal, setShowSubmitModal] = useState(false);


  // Custom system alert modal popup state (custom React modal to replace raw window.alert)
  const [customAlert, setCustomAlert] = useState(null); // { title, message, type: 'error' | 'warning' | 'info', onConfirm?: () => void }

  const showPopupAlert = (message, title = 'Thông Báo Hệ Thống', type = 'info', onConfirm = null) => {
    setCustomAlert({ title, message, type, onConfirm });
  };

  const showSubmitModalRef = useRef(false);
  showSubmitModalRef.current = showSubmitModal || !!customAlert;

  // Browsers can warn before closing/reloading; they cannot lock the tab.
  useEffect(() => {
    if (stage !== 'testing' && stage !== 'analyzing') return;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [stage]);

  // Fullscreen Helper Functions
  const requestFullScreenMode = () => {
    const elem = document.documentElement;
    try {
      let request;
      if (elem.requestFullscreen) request = elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) request = elem.webkitRequestFullscreen();
      else return Promise.resolve(false);

      return Promise.resolve(request).then(() => {
        setIsFullscreen(true);
        return true;
      }).catch(() => {
        setIsFullscreen(false);
        return false;
      });
    } catch {
      setIsFullscreen(false);
      return Promise.resolve(false);
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
      setIsFullscreen(false);
    } catch (e) {
      console.warn('Exit fullscreen error:', e);
    }
  };

  // Automatically exit fullscreen and close all exam modals when not in testing stage
  useEffect(() => {
    if (stage === 'result' || (stage === 'setup' && !launchFullscreenPendingRef.current)) {
      setShowViolationModal(false);
      setShowSubmitModal(false);
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

  // Reaching the threshold commits the attempt immediately.
  useEffect(() => {
    if (stage === 'testing' && tabSwitchCount >= 3) submitTimerRef.current?.();
  }, [tabSwitchCount, stage]);

  // AI Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorStreaming, setTutorStreaming] = useState(false);
  const [tutorResponse, setTutorResponse] = useState('');
  const tutorAbortRef = useRef(null);

  // (Result state is declared at top of component)

  const examClockRef = useRef(null);
  const submitTimerRef = useRef(null);
  useEffect(() => {
    const clock = examClockRef.current;
    if (stage !== 'testing' || !clock) return;
    clock.visit(questions[currentIndex]?.id, Date.now());
    let expired = false;
    const tick = () => {
      const now = Date.now();
      const remaining = clock.remaining(now);
      setTimeRemaining(remaining);
      setTimeSpentPerQ(clock.snapshot(now));
      if (remaining === 0 && !expired) {
        expired = true;
        submitTimerRef.current?.();
      }
    };
    const timer = setInterval(tick, 250);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      clock.stop(Date.now());
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [stage, currentIndex, questions]);

  // Format timer MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Tải đề thi thật từ Backend Content Service (Port 5249 qua API Gateway :5212)
  const handleStartAssessment = async () => {
    if (historyOnly) return;
    if (recovering || recoveryBlocked.current || submittingRef.current) return;
    // Request fullscreen synchronously from the user's click before API awaits consume the gesture.
    launchFullscreenPendingRef.current = true;
    requestFullScreenMode();
    setStage('setup');
    setIsLoading(true);
    setLoadingMsg('Đang kiểm tra cơ sở theo học trước khi vào thi...');

    try {
      if (!tokenStorage.getAccessToken()) throw new Error('Vui lòng đăng nhập trước khi làm bài kiểm tra đầu vào.');
      const owner = tokenStorage.getUser();
      const ownerId = owner?.userId || owner?.id || owner?.studentId;
      if (!ownerId || ownerId !== studentId) throw new Error('Vui lòng đăng nhập lại.');
      const history = await practiceService.getDiagnosticHistory(ownerId);
      const completedIds = completedDiagnosticExamIds(history, ownerId);
      if (completedIds.size >= DIAGNOSTIC_TARGET) {
        launchFullscreenPendingRef.current = false;
        exitFullScreenMode();
        showPopupAlert(`Bạn đã hoàn thành bài đánh giá đầu vào. Hãy xem kết quả hoặc mở lộ trình học cá nhân.`, 'Đã hoàn thành đánh giá đầu vào', 'info', onNavigateRoadmap);
        setHistoryReload((value) => value + 1);
        return;
      }
      let profile = null;
      try {
        profile = (await apiClient.get('/api/v1/students/me/profile')).data;
      } catch (err) {
        if (err.status !== 404) throw err;
      }
      const activeCampuses = (await apiClient.get('/api/v1/campuses')).data;
      if (!Array.isArray(activeCampuses) || !activeCampuses.length) throw new Error('Không tải được danh sách cơ sở đào tạo.');
      if (!activeCampuses.some((campus) => campus.campusId === profile?.campusId)) {
        setCampuses(activeCampuses);
        setSelectedCampusId('');
        setCampusError('');
        setShowCampusSetup(true);
        setStage('setup');
        return;
      }
      setLoadingMsg('Đang nạp đề kiểm tra đầu vào...');
      const rawExamDto = await contentService.getDiagnosticTest(Array.from(completedIds));
      const transformed = transformBackendExamToQuestions(rawExamDto);
      if (!transformed.id) throw new Error('Máy chủ chưa cung cấp mã đề thi.');
      if (completedIds.has(transformed.id)) {
        launchFullscreenPendingRef.current = false;
        exitFullScreenMode();
        setSelectedHistoryExam(null);
        setResultData(null);
        setCustomAlert({
          title: 'Bạn đã hoàn thành bài đánh giá đầu vào',
          message: 'Mở lộ trình để hệ thống tạo kế hoạch học cá nhân từ kết quả đánh giá của bạn.',
          type: 'info',
          onConfirm: onNavigateRoadmap
        });
        setHistoryReload((value) => value + 1);
        return;
      }
      if (!transformed.questions || transformed.questions.length === 0) {
        throw new Error('Đề thi trả về từ máy chủ không chứa câu hỏi nào. Vui lòng kiểm tra lại Content Service!');
      }

      submissionRef.current = null;
      needsReconcileRef.current = false;
      setSubmissionError('');
      setExamData(transformed);
      setQuestions(transformed.questions);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeSpentPerQ({});
      examClockRef.current = createExamClock(Date.now(), (transformed.durationMinutes || 45) * 60000, transformed.questions[0].id);
      setTimeRemaining((transformed.durationMinutes || 45) * 60);
      setTabSwitchCount(0);
      setShowViolationModal(false);
      launchFullscreenPendingRef.current = false;
      setStage('testing');
    } catch (err) {
      launchFullscreenPendingRef.current = false;
      exitFullScreenMode();
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

  const saveCampusAndStart = async () => {
    if (!campuses.some((campus) => campus.campusId === selectedCampusId) || campusSaving) return;
    setCampusSaving(true);
    setCampusError('');
    try {
      const profile = (await apiClient.put('/api/v1/students/me/profile', { campusId: selectedCampusId })).data;
      if (profile?.campusId !== selectedCampusId) throw new Error('Chưa xác nhận được cơ sở đã đăng ký. Vui lòng thử lại.');
      window.dispatchEvent(new CustomEvent('veval-campus-updated', { detail: { campusId: profile.campusId } }));
      setShowCampusSetup(false);
      await handleStartAssessment();
    } catch (err) {
      setCampusError(err.message);
    } finally {
      setCampusSaving(false);
    }
  };

  // 2. Select Option
  const handleSelectOption = (qId, optionChar) => {
    if (submissionRef.current || stage !== 'testing' || tabSwitchCount >= 3 || examClockRef.current?.remaining(Date.now()) === 0) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionChar
    }));
  };

  // 3. Toggle Flag
  const handleToggleFlag = (qId) => {
    if (submissionRef.current || tabSwitchCount >= 3 || stage !== 'testing') return;
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // 4. Submit & Psychometrics Analysis
  const handlePromptSubmitExam = () => {
    setShowSubmitModal(true);
  };

  const submissionRef = useRef(null);
  const needsReconcileRef = useRef(false);
  const submittingRef = useRef(false);
  const [submissionError, setSubmissionError] = useState('');
  const aliveRef = useRef(false);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const executeSubmitExam = async () => {
    if (submittingRef.current) return;
    const sessionVersion = tokenStorage.getSessionVersion();
    const owner = studentId;
    const isCurrentSession = () => aliveRef.current
      && tokenStorage.getSessionVersion() === sessionVersion
      && (tokenStorage.getUser()?.userId || tokenStorage.getUser()?.id || tokenStorage.getUser()?.studentId) === owner;
    const clock = examClockRef.current;
    if (!clock) return;
    clock.stop(Date.now());
    const measuredTimes = clock.snapshot(Date.now());
    setTimeSpentPerQ(measuredTimes);
    setShowSubmitModal(false);
    setShowViolationModal(false);
    submittingRef.current = true;
    setSubmissionError('');
    setStage('analyzing');
    setIsLoading(true);
    setLoadingMsg('Đang gửi bài nộp đến Practice Service (Port 5261) để chấm điểm IRT 2PL Theta_0 & xếp lớp...');

    try {
      const user = tokenStorage.getUser();
      const studentId = user?.userId || user?.id || user?.studentId;
      if (!studentId || studentId !== owner) throw new Error('Please sign in again before submitting.');


      if (!submissionRef.current) {
        submissionRef.current = createSubmissionSnapshot(studentId, examData?.id,
          clock.startedAt, questions, answers, measuredTimes);
      }
      const submissionPayload = submissionRef.current;
      if (submissionPayload.studentId !== owner) throw new Error('Please sign in again.');
      const totalTimeSpent = submissionPayload.answers.reduce((total, q) => total + q.timeSpentSeconds, 0);

      persistDraft();
      let apiResponse = null;
      if (needsReconcileRef.current) {
        setLoadingMsg('Đang kiểm tra bài đã được lưu chưa...');
        apiResponse = await findSavedDiagnostic(practiceService, submissionPayload);
        if (!isCurrentSession()) return;
      }
      if (!apiResponse) {
        needsReconcileRef.current = true;
        apiResponse = await practiceService.submitDiagnosticTest(submissionPayload);
      }
      if (!isCurrentSession()) return;
      if (apiResponse?.studentId !== owner) throw new Error('Result does not belong to this student.');
      if (apiResponse.examId !== submissionPayload.examId) throw new Error('Kết quả không thuộc đề đã nộp.');
      if (!apiResponse?.submissionId || !Number.isFinite(apiResponse.theta0)
        || !apiResponse.placementClass || !Array.isArray(apiResponse.questions)
        || apiResponse.questions.length !== questions.length
        || !Number.isInteger(apiResponse.totalCorrect)
        || apiResponse.totalQuestions !== questions.length
        || !questions.every((q) => apiResponse.questions.some((item) =>
          item.questionId === q.id && typeof item.isCorrect === 'boolean'
          && typeof item.correctOption === 'string' && item.correctOption.trim()))) {
        throw new Error('Máy chủ chưa trả về đầy đủ kết quả bài nộp.');
      }

      let totalCorrect = 0;
      const domainStats = {};
      Object.keys(DOMAINS).forEach((k) => {
        domainStats[k] = { domain_id: k, domain_name: DOMAINS[k].name, total: 0, correct: 0 };
      });

      const reviewedQuestionsList = questions.map((q, idx) => {
        const backendQ = apiResponse.questions.find((bq) => bq.questionId === q.id);
        const studentChoice = backendQ.selectedOption || '';
        const correctChoice = backendQ.correctOption.trim().toUpperCase();
        const isCorrect = backendQ.isCorrect;
        const timeSpent = backendQ.timeSpentSeconds ?? 0;

        if (isCorrect) totalCorrect += 1;

        const dId = backendQ.domainId || 'unknown';
        if (!domainStats[dId]) domainStats[dId] = { domain_id: dId, domain_name: backendQ.domainName || 'Chưa xác định miền', total: 0, correct: 0 };
        domainStats[dId].total += 1;
        if (isCorrect) domainStats[dId].correct += 1;

        let speedCategory = 'normal';
        if (timeSpent < 25) speedCategory = 'fast';
        else if (timeSpent > 90) speedCategory = 'slow';

        return {
          ...q,
          passage_content: cleanVietnameseDiacritics(backendQ.passageContent || q.passage_content || ''),
          passage_title: cleanVietnameseDiacritics(backendQ.passageTitle || q.passage_title || ''),
          explanation: cleanVietnameseDiacritics(backendQ.explanation || q.explanation || ''),
          domain_id: backendQ.domainId || 'unknown',
          domain_name: cleanVietnameseDiacritics(backendQ.domainName || 'Chưa xác định miền'),
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
      const domainScoresCalculated = Object.values(domainStats).filter((d) => d.total > 0).map((d) => ({
        domain_id: d.domain_id,
        domain_name: d.domain_name,
        total_questions: d.total,
        correct_count: d.correct,
        accuracy_pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
      }));

      const finalTheta = apiResponse.theta0;
      const finalPlacement = apiResponse.placementClass;
      const finalSubmissionId = apiResponse.submissionId;
      const normalizedRadar = normalizeRadarChart(
        apiResponse.radarChart || apiResponse.radar_chart,
        domainScoresCalculated,
        apiResponse?.totalCorrect ?? totalCorrect,
        apiResponse?.totalQuestions ?? questions.length
      );
      const normalizedPriors = normalizeSkillPriors(
        apiResponse.skillPriors || apiResponse.skill_priors,
        apiResponse?.skillBreakdowns,
        apiResponse?.questions,
        finalTheta
      );

      const finalResult = {
        submission_id: finalSubmissionId,
        theta_0: finalTheta,
        placement_class: finalPlacement,
        campus_name: apiResponse?.campusName || 'Cơ sở Thủ Đức',
        class_name: apiResponse?.className || '',
        class_id: apiResponse?.classId || null,
        enrollment_id: apiResponse?.enrollmentId || null,
        domain_scores: domainScoresCalculated,
        radar_chart: normalizedRadar,
        radarChart: normalizedRadar,
        skill_priors: normalizedPriors,
        skillPriors: normalizedPriors,
        ai_commentary: apiResponse.aiCommentary || '',
        reviewedQuestions: reviewedQuestionsList,
        weakSkills: apiResponse?.weakSkills || [],
        skillBreakdowns: apiResponse?.skillBreakdowns || [],
        subjectBreakdowns: apiResponse?.subjectBreakdowns || [],
        skillPriors: normalizedPriors,
        pacing: {
          totalCorrect: apiResponse?.totalCorrect ?? totalCorrect,
          totalQuestions: apiResponse?.totalQuestions ?? questions.length,
          totalTimeSpent: apiResponse.totalTimeSpentSeconds ?? totalTimeSpent,
          avgTimePerQ: Math.round(totalTimeSpent / (questions.length || 1)),
          fastCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'fast').length,
          normalCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'normal').length,
          slowCount: reviewedQuestionsList.filter((q) => q.speedCategory === 'slow').length,
          flaggedCount: Object.keys(flagged).filter((k) => flagged[k]).length
        }
      };

      removeDiagnosticDraft(localStorage, owner);
      needsReconcileRef.current = false;
      setResultData(finalResult);
      onCompleteDiagnostic?.(finalResult);
      window.dispatchEvent(new CustomEvent('veval:submission-updated'));

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

      setHistoryReload((value) => value + 1);

      setShowViolationModal(false);
      setShowSubmitModal(false);
      setReportTab('overview');
      setReviewFilter('ALL');
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
      if (!isCurrentSession()) return;
      setSubmissionError(err.message);
      setStage('analyzing');
    } finally {
      submittingRef.current = false;
      if (isCurrentSession()) {
        setIsLoading(false);
        setLoadingMsg('');
      }
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
  submitTimerRef.current = executeSubmitExam;

  const filteredReviewQuestions = useMemo(() => {
    const list = currentDisplayResult?.reviewedQuestions || [];
    if (reviewFilter === 'CORRECT') return list.filter((q) => q.isCorrect);
    if (reviewFilter === 'WRONG') return list.filter((q) => !q.isCorrect);
    if (reviewFilter === 'FLAGGED') return list.filter((q) => q.isFlagged);
    return list;
  }, [currentDisplayResult, reviewFilter]);

  const currentQ = questions[currentIndex];

  const persistDraft = () => {
    if (!studentId || !examData?.id || !examClockRef.current) return;
    const user = tokenStorage.getUser();
    if ((user?.userId || user?.id || user?.studentId) !== studentId) return;
    const draft = { studentId, exam: { ...examData, questions }, answers, flagged,
      currentIndex, warnings: tabSwitchCount, clock: examClockRef.current.serialize(Date.now()),
      payload: submissionRef.current, needsReconcile: needsReconcileRef.current };
    try {
      localStorage.setItem(draftKey(studentId), JSON.stringify(draft));
    } catch {
      setRecoveryError('Trình duyệt không lưu được bản nháp. Đừng tải lại hoặc đóng trang.');
    }
  };

  useEffect(() => {
    if (stage !== 'testing' && stage !== 'analyzing') return;
    persistDraft();
    const save = () => persistDraft();
    window.addEventListener('pagehide', save);
    const interval = setInterval(save, 1000);
    return () => { clearInterval(interval); window.removeEventListener('pagehide', save); };
  }, [stage, answers, flagged, currentIndex, tabSwitchCount, examData, studentId]);

  useEffect(() => {
    let active = true;
    if (historyOnly) { setRecovering(false); return; }
    const draft = studentId && readDraft(localStorage, studentId);
    if (!draft) { setRecovering(false); return; }
    recoveryBlocked.current = true;
    setRecovering(true);
    setRecoveryError('');
    const sessionVersion = tokenStorage.getSessionVersion();
    const stillCurrent = () => active && tokenStorage.getSessionVersion() === sessionVersion
      && (tokenStorage.getUser()?.userId || tokenStorage.getUser()?.id || tokenStorage.getUser()?.studentId) === studentId;
    (async () => {
      try {
        const identity = draft.payload || { studentId, examId: draft.exam.id };
        const saved = await findSavedDiagnostic(practiceService, identity);
        if (!stillCurrent()) return;
        if (saved) {
          removeDiagnosticDraft(localStorage, studentId);
          await openHistoryExam({ id: saved.submissionId, examId: saved.examId,
            completedAt: saved.completedAt, examTitle: draft.exam.title }, saved);
          if (!stillCurrent()) return;
          setStage('setup');
          setHistoryReload((value) => value + 1);
        } else {
          const clock = createExamClock(draft.clock.startedAt, draft.clock.durationMs,
            null, draft.clock.elapsed, Date.now());
          examClockRef.current = clock;
          setExamData(draft.exam);
          setQuestions(draft.exam.questions);
          setAnswers(draft.answers);
          setFlagged(draft.flagged || {});
          setCurrentIndex(draft.currentIndex);
          setTabSwitchCount(draft.warnings || 0);
          setTimeSpentPerQ(clock.snapshot(Date.now()));
          setTimeRemaining(clock.remaining(Date.now()));
          const locked = draft.payload || clock.remaining(Date.now()) === 0 || draft.warnings >= 3;
          if (locked) {
            submissionRef.current = draft.payload || createSubmissionSnapshot(studentId,
              draft.exam.id, clock.startedAt, draft.exam.questions, draft.answers, clock.snapshot(Date.now()));
            needsReconcileRef.current = true;
            setSubmissionError('Đã khôi phục bài đã chốt. Bấm thử gửi lại để kiểm tra và gửi bài.');
            setStage('analyzing');
          } else {
            submissionRef.current = null;
            setStage('testing');
          }
        }
        recoveryBlocked.current = false;
        setRecovering(false);
      } catch (err) {
        if (stillCurrent()) { setRecoveryError(err.message); setRecovering(false); }
      }
    })();
    return () => { active = false; };
  }, [studentId, recoveryRetry, historyOnly]);

  const isTakingExam = stage === 'testing' || stage === 'analyzing';

  // Khóa cuộn trang nền khi học sinh đang làm bài thi ở chế độ trang riêng toàn màn hình nền trắng
  useEffect(() => {
    if (!isTakingExam || typeof document === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isTakingExam]);

  const rootContent = (
    <div
      className={`${
        isTakingExam
          ? 'fixed inset-0 z-[200] w-screen h-screen overflow-y-auto bg-white'
          : `${historyOnly ? 'min-w-0' : 'min-h-screen'} ${isEmbedded ? 'bg-transparent' : 'bg-[#F4F7FC]'}`
      } text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white`}
    >
      {showCampusSetup && <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/70 p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="campus-title" className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4">
          <h2 id="campus-title" className="text-xl font-bold">Đăng ký cơ sở trước khi làm bài</h2>
          <p className="text-sm text-slate-600">Hồ sơ của bạn chưa có cơ sở theo học hợp lệ. Vui lòng chọn và lưu cơ sở để tiếp tục vào bài kiểm tra. Thời gian làm bài chưa bắt đầu.</p>
          <label htmlFor="diagnostic-campus" className="block">Cơ sở theo học</label>
          <select id="diagnostic-campus" className="w-full border rounded-xl p-3" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)} disabled={campusSaving}>
            <option value="">Chọn cơ sở</option>
            {campuses.map((c) => <option key={c.campusId} value={c.campusId}>{c.name}</option>)}
          </select>
          {campusError && <p role="alert" className="text-red-600">{campusError}</p>}
          <button type="button" disabled={!selectedCampusId || campusSaving} onClick={saveCampusAndStart} className="rounded-xl bg-blue-600 text-white p-3 disabled:opacity-50">{campusSaving ? 'Đang lưu...' : 'Lưu và bắt đầu'}</button>
          <button type="button" disabled={campusSaving} onClick={() => {
            launchFullscreenPendingRef.current = false;
            exitFullScreenMode();
            setShowCampusSetup(false);
          }} className="p-3">Hủy</button>
        </div>
      </div>}


      {/* Top Header Navigation - ONLY sticky during exam testing */}
      {stage === 'testing' && <ExamRoomHeader examData={examData} questionCount={questions.length} timeRemaining={timeRemaining} isFullscreen={isFullscreen} tabSwitchCount={tabSwitchCount} requestFullScreenMode={requestFullScreenMode} handlePromptSubmitExam={handlePromptSubmitExam} />}

      {/* ===================================================================== */}
      {/* 1. SETUP / EXAM LOBBY & CATALOG SCREEN (Flow 1: Khảo Thí & Chẩn Đoán) */}
      {/* ===================================================================== */}
      {stage === 'setup' && (
        <div className={`flex-1 w-full mx-auto space-y-5 animate-fade-in ${isEmbedded ? 'min-w-0 pb-3' : 'max-w-[1700px] px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-8'}`}>

          {selectedHistoryExam ? (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">

              {/* Top Navigation Bar with Back Button */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 border border-indigo-800 shadow-lg shadow-indigo-950/10">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHistoryExam(null);
                      setResultData(null);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                    aria-label="Quay lại danh sách lần thi"
                    title="Quay lại danh sách lần thi"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0 space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-300">Chi tiết lần thi</span>
                    <h1 className="text-base sm:text-lg font-bold text-white leading-snug">{selectedHistoryExam.examTitle || 'Bài Khảo Sát Năng Lực'}</h1>
                    <span className="block text-xs text-blue-100/80">
                      Nộp lúc {new Date(selectedHistoryExam.completedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className={historyOnly ? 'hidden' : 'flex flex-wrap items-center gap-2'}>
                  {onNavigateRoadmap && (
                    <button
                      type="button"
                      onClick={onNavigateRoadmap}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Xem Lộ Trình Cá Nhân (PLAR)</span>
                    </button>
                  )}
                  {onNavigateTuition && (
                    <button
                      type="button"
                      onClick={onNavigateTuition}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Đóng Học Phí Mở Khóa</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                    className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Làm Đề Tiếp Theo</span>
                  </button>
                </div>
              </div>

              <DiagnosticResultSummary result={currentDisplayResult} compact={historyOnly} />
<DiagnosticReportTabs value={reportTab} onChange={setReportTab} />
<DiagnosticReportPanel id="overview" active={reportTab}>

              <WeakSkills result={currentDisplayResult} />

              {Array.isArray(currentDisplayResult?.subjectBreakdowns) && currentDisplayResult.subjectBreakdowns.length > 0 && (
                <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-4 text-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-black text-slate-900">Bản Đồ Năng Lực Chi Tiết Theo Môn Học (Chuẩn GDPT 2018)</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {currentDisplayResult.subjectBreakdowns.length} môn được đánh giá trực tiếp
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentDisplayResult.subjectBreakdowns.map((subj) => {
                      const pct = Math.round(subj.accuracyPercentage ?? 0);
                      const tone = pct < 50 ? 'border-rose-200 bg-rose-50/70 text-rose-700' : pct < 75 ? 'border-amber-200 bg-amber-50/70 text-amber-800' : 'border-emerald-200 bg-emerald-50/70 text-emerald-700';
                      const bar = pct < 50 ? 'bg-rose-500' : pct < 75 ? 'bg-amber-500' : 'bg-emerald-500';
                      return (
                        <div key={subj.subjectName} className={`rounded-2xl border p-3.5 space-y-2 ${tone}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">{subj.subjectName}</span>
                            <span className="text-xs font-black">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/80 overflow-hidden">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(4, pct)}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>Đúng {subj.correctCount}/{subj.totalQuestions} câu</span>
                            <span className="font-bold">{subj.isWeak ? 'Ưu tiên PLAR' : 'Đạt chuẩn'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


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
                    {currentDisplayResult.radar_chart?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={currentDisplayResult.radar_chart}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="domain_name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                          {currentDisplayResult.radar_chart.some((item) => Number.isFinite(item.student_pct)) && (
                            <Radar name="Điểm Thí Sinh" dataKey="student_pct" stroke="#2563eb" fill="#2563eb" fillOpacity={0.45} />
                          )}
                          {currentDisplayResult.radar_chart.some((item) => Number.isFinite(item.benchmark_pct)) && (
                            <Radar name="Chuẩn Mục Tiêu" dataKey="benchmark_pct" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                          )}
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                        API chưa trả dữ liệu radar cho lần thi này.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                      <span>Kết quả của bạn</span>
                    </div>
                    <div className={`flex items-center gap-2 text-indigo-600 ${currentDisplayResult.radar_chart?.some((item) => Number.isFinite(item.benchmark_pct)) ? '' : 'hidden'}`}>
                      <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                      <span>Chuẩn đầu vào 900+</span>
                    </div>
                  </div>
                </div>

                {/* Right: Domain Bar Chart & AI Commentary */}
                <div className="lg:col-span-6 flex flex-col space-y-5">
                  {/* AI Socratic Commentary Box */}
                  <div className="p-6 bg-linear-to-br from-purple-50/90 to-indigo-50/80 border border-purple-200/80 rounded-3xl shadow-xl space-y-3 text-slate-900">
                    <div className="flex items-center gap-2 text-sm font-black text-purple-900">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span>Lời Khuyên Sư Phạm Từ Cố Vấn AI (Gemini Commentary)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-4 rounded-2xl border border-purple-200 shadow-xs whitespace-pre-line">
                      "{currentDisplayResult.ai_commentary || 'Chưa có nhận xét AI cho bài kiểm tra này.'}"
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
              {/* BẢNG TIÊN NGHIỆM KỸ NĂNG BKT P(L0) & THAM SỐ THETA_SKILL          */}
              {/* ================================================================= */}
              {Array.isArray(currentDisplayResult.skill_priors) && currentDisplayResult.skill_priors.length > 0 && (
                <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-black text-slate-900">
                        Ma Trận Tiên Nghiệm Kỹ Năng BKT P(L₀) &amp; Tham Số Năng Lực θ_skill ({currentDisplayResult.skill_priors.length} kỹ năng)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      Bayesian Knowledge Tracing Prior • Đồng bộ Lịch sử &amp; Kết quả Thi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {currentDisplayResult.skill_priors.map((sp, idx) => {
                      const pl0Pct = Math.round((Number(sp.p_l0 ?? sp.pL0 ?? 0.5)) * 100);
                      const thetaVal = Number(sp.theta_skill ?? sp.thetaSkill ?? 0);
                      const isMastered = pl0Pct >= 75;
                      const isWeak = pl0Pct < 55;

                      return (
                        <div
                          key={`${sp.skill_id || idx}`}
                          className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                            isMastered
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : isWeak
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                {sp.skill_name || sp.skillName}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {sp.domain_name || sp.domainName}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                                sp.source === 'measured'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {sp.source === 'measured' ? 'Đo trực tiếp' : 'Suy diễn DAG'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold pt-1">
                            <span className="text-slate-600">
                              Xác suất làm chủ P(L₀):{' '}
                              <strong className={isMastered ? 'text-emerald-700' : isWeak ? 'text-amber-800' : 'text-blue-700'}>
                                {pl0Pct}% ({Number(sp.p_l0 ?? sp.pL0 ?? 0.5).toFixed(2)})
                              </strong>
                            </span>
                            <span className="font-mono text-xs font-black text-indigo-700">
                              θ = {thetaVal > 0 ? `+${thetaVal.toFixed(2)}` : thetaVal.toFixed(2)}
                            </span>
                          </div>

                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isMastered ? 'bg-emerald-500' : isWeak ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, pl0Pct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

</DiagnosticReportPanel>
<DiagnosticReportPanel id="answers" active={reportTab}>

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
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0 flex-wrap">
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
                          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-200/80 text-slate-800 font-sans leading-relaxed shadow-xs">
                            <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5 mb-3">
                              <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase tracking-wider">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span>{cleanVietnameseDiacritics(q.passage_title) || 'Ngữ liệu đọc hiểu'}</span>
                              </div>
                              <span className="text-[11px] font-bold text-blue-700 bg-white/90 px-2.5 py-0.5 rounded-md border border-blue-200">
                                Bài đọc ngữ cảnh
                              </span>
                            </div>
                            <div className="whitespace-pre-line leading-relaxed text-slate-800 text-xs sm:text-sm select-text font-normal max-h-72 overflow-y-auto pr-1">
                              {cleanVietnameseDiacritics(q.passage_content)}
                            </div>
                          </div>
                        )}

                        {/* Question Content */}
                        <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-1">
                          <MathText text={cleanVietnameseDiacritics(q.content)} />
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {q.options.map((optText, optIdx) => {
                            const optChar = ['A', 'B', 'C', 'D'][optIdx];
                            const isStudentChoice = q.studentChoice === optChar;
                            const isCorrectChoice = q.correctChoice === optChar;

                            let cardStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
                            if (isCorrectChoice) {
                              cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500/30 shadow-xs';
                            } else if (isStudentChoice && !q.isCorrect) {
                              cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-semibold ring-1 ring-rose-500/30 shadow-xs';
                            }

                            return (
                              <div
                                key={optChar}
                                className={`p-3.5 sm:p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${cardStyle}`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${isCorrectChoice
                                    ? 'bg-emerald-600 text-white'
                                    : isStudentChoice
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                >
                                  {optChar}
                                </div>
                                <div className="flex-1 pt-0.5 leading-relaxed font-medium">
                                  <MathText text={cleanVietnameseDiacritics(optText)} />
                                </div>
                                {isCorrectChoice && (
                                  <span className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-600 text-white font-black shrink-0 shadow-xs flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-3" />
                                    <span>Đáp án đúng</span>
                                  </span>
                                )}
                                {isStudentChoice && !isCorrectChoice && (
                                  <span className="px-2.5 py-1 rounded-md text-[11px] bg-rose-600 text-white font-black shrink-0 shadow-xs flex items-center gap-1">
                                    <X className="w-3 h-3 stroke-3" />
                                    <span>Bạn đã chọn</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Explanation */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm space-y-2 text-slate-800">
                          <div className="text-xs font-black text-purple-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                          </div>
                          <div className="text-slate-800 leading-relaxed font-medium pl-6">
                            <MathText text={cleanVietnameseDiacritics(q.explanation)} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


</DiagnosticReportPanel>
<DiagnosticReportPanel id="analysis" active={reportTab}>

<DiagnosticSkillProfile result={currentDisplayResult} />

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

</DiagnosticReportPanel>
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

                <div className={historyOnly ? 'hidden' : 'flex items-center gap-3 w-full sm:w-auto'}>
                  <button
                    type="button"
                    onClick={() => onNavigateQuestionBank ? onNavigateQuestionBank() : handleRetakeExam()}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Làm Đề Mới (Ngân Hàng Đề)</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">

              {/* Top Title & Header – Hero Banner (with embedded KPI stats) */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-blue-900/30">
                {/* Decorative background blobs */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-32 rounded-full bg-blue-400/5 blur-2xl" />

                <div className="relative space-y-6">
                  {/* Top row: title + ring */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    {/* Left: Text content */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <Target className="w-3.5 h-3.5 text-blue-300" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">Flow 1 • Khảo Thí & Chẩn Đoán Năng Lực</span>
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/25 border border-blue-400/25 flex items-center justify-center shrink-0 backdrop-blur-sm">
                          <History className="w-5 h-5 text-blue-300" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                          {historyOnly ? 'Kết Quả Đánh Giá Đầu Vào' : 'Đánh Giá Năng Lực Đầu Vào'}
                        </h1>
                      </div>

                      {/* Progress status */}
                      {!historyLoading && !historyError && studentId && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {[...Array(DIAGNOSTIC_TARGET)].map((_, i) => (
                              <div key={i} className={`h-2 rounded-full transition-all ${i < completedExamCount ? 'w-6 bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'w-2 bg-white/20'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-emerald-400" role="status">
                            {completedExamCount >= DIAGNOSTIC_TARGET ? '✓ Hoàn thành đánh giá đầu vào' : `${completedExamCount}/${DIAGNOSTIC_TARGET} bài đánh giá đầu vào`}
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-blue-200/70 font-medium max-w-lg">
                        {historyOnly ? 'Xem bài đánh giá đầu vào đã hoàn thành và báo cáo năng lực.' : 'Hoàn thành bài đánh giá đầu vào để hệ thống xây dựng lộ trình học cá nhân phù hợp.'}
                      </p>
                    </div>

                    {/* Right: CTA button or progress ring */}
                    {historyOnly ? (
                      <div className="shrink-0 hidden sm:flex items-center justify-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                            <circle cx="48" cy="48" r="38" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 38}`}
                              strokeDashoffset={`${2 * Math.PI * 38 * (1 - completedExamCount / DIAGNOSTIC_TARGET)}`}
                              className="transition-all duration-700"
                            />
                            <defs>
                              <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#60a5fa" />
                              </linearGradient>
                            </defs>
                          </svg>
                          {/* Fix: flex-row + items-baseline để "1/3" nằm ngang */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-white leading-none">{completedExamCount}</span>
                            <span className="text-sm font-bold text-blue-300 leading-none">/{DIAGNOSTIC_TARGET}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={handleRetakeExam}
                          disabled={isLoading || historyLoading || recovering || recoveryBlocked.current || completedExamCount >= DIAGNOSTIC_TARGET}
                          className="px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-black text-sm shadow-lg shadow-black/20 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 disabled:opacity-50 border border-white/80"
                        >
                          <Play className="w-4 h-4 fill-blue-600 text-blue-600" />
                          <span>🚀 Làm Bài Kiểm Tra Mới</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* 4 KPI Cards — nền trắng, màu sắc riêng từng card */}
              {historyOnly && examHistory.length > 0 && (() => {
                const best = Math.max(...examHistory.map(h => h.totalCorrect || 0));
                const pct = Math.round((best / 30) * 100);
                const peakTheta = Math.max(...examHistory.map(h => Number(h.theta) || 0));
                const thetaDisplay = (peakTheta > 0 ? '+' : '') + peakTheta.toFixed(2);
                const avgMin = Math.round(examHistory.reduce((acc, h) => acc + (h.timeSpentSeconds || 0), 0) / (examHistory.length || 1) / 60);
                const speedLabel = avgMin <= 10 ? '⚡ Rất nhanh' : avgMin <= 20 ? '✓ Nhịp chuẩn' : '⏳ Hơi chậm';

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 – Tổng đợt thi */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-blue-100 shadow-sm shadow-blue-100 p-5 group hover:shadow-md hover:shadow-blue-100 transition-all">
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-400">Tổng Đợt Thi</span>
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
                            <Layers className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-black text-blue-700 font-mono leading-none">{examHistory.length}</span>
                          <span className="text-sm font-semibold text-slate-400 pb-0.5">lần làm bài</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            {[...Array(DIAGNOSTIC_TARGET)].map((_, i) => (
                              <div key={i} className={`h-1.5 rounded-full transition-all ${i < examHistory.length ? 'w-6 bg-gradient-to-r from-blue-400 to-indigo-500' : 'w-2 bg-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-blue-400 font-bold">{completedExamCount}/{DIAGNOSTIC_TARGET} bài</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 – Điểm cao nhất */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-sm shadow-emerald-100 p-5 group hover:shadow-md hover:shadow-emerald-100 transition-all">
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-emerald-400 to-teal-500" />
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500">Điểm Cao Nhất</span>
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-black text-emerald-600 font-mono leading-none">{best}</span>
                          <span className="text-sm font-semibold text-slate-400 pb-0.5">/ 30 câu</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-emerald-500 font-bold">{pct}% chính xác</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 – Năng lực đỉnh θ */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-100 shadow-sm shadow-amber-100 p-5 group hover:shadow-md hover:shadow-amber-100 transition-all">
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-amber-400 to-orange-500" />
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-50 group-hover:bg-amber-100 transition-colors" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-500">Năng Lực Đỉnh θ</span>
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-black text-amber-600 font-mono leading-none">{thetaDisplay}</span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${peakTheta >= 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                            {peakTheta >= 0 ? '▲ Trên trung bình' : '▼ Đang cải thiện'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4 – Thời gian TB */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-violet-100 shadow-sm shadow-violet-100 p-5 group hover:shadow-md hover:shadow-violet-100 transition-all">
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-violet-500 to-purple-600" />
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-violet-50 group-hover:bg-violet-100 transition-colors" />
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-violet-500">Thời Gian TB</span>
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-black text-violet-700 font-mono leading-none">{avgMin}</span>
                          <span className="text-sm font-semibold text-slate-400 pb-0.5">phút / bài</span>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-50 text-violet-600 border border-violet-200">
                            {speedLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {historyLoading ? <p role="status">Đang tải lịch sử...</p>
                : historyError ? <div role="alert"><p>Không tải được lịch sử: {historyError}</p><button type="button" onClick={() => setHistoryReload((v) => v + 1)}>Thử lại</button></div>
                : examHistory.length === 0 ? <p>{studentId ? (historyOnly ? 'Chưa có bài đánh giá đầu vào hoàn thành.' : 'Bạn chưa làm bài chẩn đoán. Bấm Làm Bài Kiểm Tra Mới để bắt đầu.') : 'Vui lòng đăng nhập để xem lịch sử.'}</p>
                : <>
              {detailLoading && <p role="status">Đang tải báo cáo...</p>}
              {detailError && <p role="alert">Không tải được báo cáo: {detailError}. Bấm Xem báo cáo để thử lại.</p>}
              {!historyOnly && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
                Kết quả các bài đã hoàn thành được lưu trong Lịch sử làm bài.
                {onNavigateHistory && <button type="button" onClick={onNavigateHistory} className="ml-2 font-bold underline underline-offset-4">Xem lịch sử đầu vào →</button>}
              </div>}
              {historyOnly && <>

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
              <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden text-slate-900">
                <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-900">Bảng Chi Tiết Các Lần Làm Bài Thi</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Sắp xếp theo thời gian mới nhất
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                        <th className="py-3.5 px-5">Đợt Thi & Đề Bài</th>
                        <th className="py-3.5 px-4">Ngày Nộp Bài</th>
                        <th className="py-3.5 px-4">Điểm Số & Tỷ Lệ</th>
                        <th className="py-3.5 px-4">Tham Số IRT θ</th>
                        <th className="py-3.5 px-4">Thời Lượng</th>
                        <th className="py-3.5 px-5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {examHistory.map((attempt, index) => {
                        const isLatest = index === 0;
                        const attemptAccuracy = attempt.totalQuestions > 0 ? Math.round((attempt.totalCorrect ?? 0) / attempt.totalQuestions * 100) : 0;
                        const formattedDate = new Date(attempt.completedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const durationM = Math.floor((attempt.timeSpentSeconds ?? 0) / 60);
                        const durationS = (attempt.timeSpentSeconds ?? 0) % 60;

                        return (
                          <tr
                            key={attempt.id}
                            onClick={() => openHistoryExam(attempt)}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer group even:bg-slate-50/40"
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
                                      style={{ width: `${Math.min(attemptAccuracy, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-600">{attemptAccuracy}%</span>
                                </div>
                              </div>
                            </td>

                            {/* Theta */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono font-black text-xs">
                                {Number(attempt.theta) > 0 ? `+${Number(attempt.theta).toFixed(2)}` : Number(attempt.theta).toFixed(2)}
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
                                  onClick={() => openHistoryExam(attempt)}
                                  className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                                  title="Xem báo cáo và biểu đồ bài thi này"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Xem báo cáo</span>
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

              </>}
              </>}
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
      {stage === 'testing' && currentQ && <ExamRoomBody currentQ={currentQ} currentIndex={currentIndex} questions={questions} answers={answers} flagged={flagged} timeSpentPerQ={timeSpentPerQ} handleSelectOption={handleSelectOption} handleToggleFlag={handleToggleFlag} setCurrentIndex={setCurrentIndex} handlePromptSubmitExam={handlePromptSubmitExam} />}

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
              <h2 className="text-xl font-extrabold text-slate-900">{submissionError ? 'Chưa xác nhận được bài nộp' : 'Đang nộp bài'}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bài làm đã được chốt và không thể chỉnh sửa. Giữ trang này mở cho đến khi có kết quả.
              </p>
            </div>
            {submissionError && <div className="space-y-3">
              <p role="alert" className="text-sm text-rose-700">{submissionError}</p>
              <button type="button" disabled={isLoading} onClick={executeSubmitExam} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50">Thử gửi lại</button>
              <p className="text-xs text-slate-500">Gửi lại nguyên đáp án và thời gian đã chốt.</p>
            </div>}
            {!submissionError && <div role="status" aria-label="Đang gửi bài" className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onNavigateRoadmap ? onNavigateRoadmap : handleReturnDashboard}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Xem Lộ Trình (Lớp Chung & Cá Nhân)</span>
                  </button>
                  {onNavigateTuition && (
                    <button
                      type="button"
                      onClick={onNavigateTuition}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Đóng Học Phí</span>
                    </button>
                  )}
                </div>
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
                      className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng Nhập Để Lưu Điểm</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post-Exam Roadmap & Tuition Notice Banner */}
          {currentUser && (
            <div className="p-5 rounded-3xl bg-linear-to-r from-blue-50 via-indigo-50 to-amber-50/70 border border-indigo-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/25">
                  <Target className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-indigo-950">
                      Lộ Trình Học Tập Đã Khởi Tạo (Lớp Học Chung & Cá Nhân Riêng)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">
                      Chế độ xem tổng quát
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Kết quả bài thi đã được ánh xạ vào khung chương trình: bạn có thể xem tổng quát các chuyên đề của <strong>Lớp học chung</strong> và <strong>Lộ trình cá nhân</strong> để nắm bắt các dạng bài cần bù điểm. Để bắt đầu học chi tiết, làm bài tập và mở khóa video bài giảng, vui lòng hoàn tất học phí.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={onNavigateRoadmap ? onNavigateRoadmap : handleReturnDashboard}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Xem Lộ Trình Tổng Quát</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onNavigateTuition && (
                  <button
                    type="button"
                    onClick={onNavigateTuition}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Kích Hoạt Học Phí</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Guest Notice Call-to-Action Banner */}
          {!currentUser && (
            <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-50 via-indigo-50 to-blue-50 border border-amber-300/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                    className="w-full md:w-auto px-5 py-3 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập / Đăng Ký Lưu Kết Quả</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <DiagnosticResultSummary result={resultData} />
<DiagnosticReportTabs value={reportTab} onChange={setReportTab} />
<DiagnosticReportPanel id="overview" active={reportTab}>

          <WeakSkills result={resultData} />


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
                  {resultData.radar_chart?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={resultData.radar_chart}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="domain_name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                        {resultData.radar_chart.some((item) => Number.isFinite(item.student_pct)) && (
                          <Radar name="Điểm Thí Sinh" dataKey="student_pct" stroke="#2563eb" fill="#2563eb" fillOpacity={0.45} />
                        )}
                        {resultData.radar_chart.some((item) => Number.isFinite(item.benchmark_pct)) && (
                          <Radar name="Chuẩn Mục Tiêu" dataKey="benchmark_pct" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                        )}
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                      API chưa trả dữ liệu radar cho lần thi này.
                    </div>
                  )}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>Kết quả của bạn</span>
                </div>
                <div className={`flex items-center gap-2 text-indigo-600 ${resultData.radar_chart?.some((item) => Number.isFinite(item.benchmark_pct)) ? '' : 'hidden'}`}>
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span>Chuẩn đầu vào 900+</span>
                </div>
              </div>
            </div>

            {/* Right: Gemini AI Socratic Commentary & Domain breakdown */}
            <div className="lg:col-span-6 flex flex-col space-y-5">

              {/* AI Socratic Commentary Box */}
              <div className="p-6 bg-linear-to-br from-purple-50/90 to-indigo-50/80 border border-purple-200/80 rounded-3xl shadow-xl space-y-3 text-slate-900">
                <div className="flex items-center gap-2 text-sm font-black text-purple-900">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Lời Khuyên Sư Phạm Từ Cố Vấn AI (Gemini Commentary)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
                  "{resultData.ai_commentary || 'Chưa có nhận xét AI cho bài kiểm tra này.'}"
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
                          className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
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
          {/* BẢNG TIÊN NGHIỆM KỸ NĂNG BKT P(L0) & THAM SỐ THETA_SKILL              */}
          {/* ===================================================================== */}
          {Array.isArray(resultData.skill_priors) && resultData.skill_priors.length > 0 && (
            <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl space-y-4 text-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Ma Trận Tiên Nghiệm Kỹ Năng BKT P(L₀) &amp; Tham Số Năng Lực θ_skill ({resultData.skill_priors.length} kỹ năng)
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Bayesian Knowledge Tracing Prior • Khởi tạo Đồ thị Lộ trình Học tập
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {resultData.skill_priors.map((sp, idx) => {
                  const pl0Pct = Math.round((Number(sp.p_l0 ?? sp.pL0 ?? 0.5)) * 100);
                  const thetaVal = Number(sp.theta_skill ?? sp.thetaSkill ?? 0);
                  const isMastered = pl0Pct >= 75;
                  const isWeak = pl0Pct < 55;

                  return (
                    <div
                      key={`${sp.skill_id || idx}`}
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                        isMastered
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isWeak
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {sp.skill_name || sp.skillName}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 truncate">
                            {sp.domain_name || sp.domainName}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                            sp.source === 'measured'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {sp.source === 'measured' ? 'Đo trực tiếp' : 'Suy diễn DAG'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="text-slate-600">
                          Xác suất làm chủ P(L₀):{' '}
                          <strong className={isMastered ? 'text-emerald-700' : isWeak ? 'text-amber-800' : 'text-blue-700'}>
                            {pl0Pct}% ({Number(sp.p_l0 ?? sp.pL0 ?? 0.5).toFixed(2)})
                          </strong>
                        </span>
                        <span className="font-mono text-xs font-black text-indigo-700">
                          θ = {thetaVal > 0 ? `+${thetaVal.toFixed(2)}` : thetaVal.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isMastered ? 'bg-emerald-500' : isWeak ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, pl0Pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* BẢNG ĐÁNH GIÁ CHI TIẾT & ĐÁP ÁN 30 CÂU (ANSWER KEY & EXPLANATIONS)    */}
          {/* ===================================================================== */}

</DiagnosticReportPanel>
<DiagnosticReportPanel id="answers" active={reportTab}>

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
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
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
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-200/80 text-slate-800 font-sans leading-relaxed shadow-xs">
                        <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5 mb-3">
                          <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase tracking-wider">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>{cleanVietnameseDiacritics(q.passage_title) || 'Ngữ liệu đọc hiểu'}</span>
                          </div>
                          <span className="text-[11px] font-bold text-blue-700 bg-white/90 px-2.5 py-0.5 rounded-md border border-blue-200">
                            Bài đọc ngữ cảnh
                          </span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed text-slate-800 text-xs sm:text-sm select-text font-normal max-h-72 overflow-y-auto pr-1">
                          {cleanVietnameseDiacritics(q.passage_content)}
                        </div>
                      </div>
                    )}

                    {/* Question Content */}
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-1">
                      <MathText text={cleanVietnameseDiacritics(q.content)} />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const optChar = ['A', 'B', 'C', 'D'][optIdx];
                        const isStudentChoice = q.studentChoice === optChar;
                        const isCorrectChoice = q.correctChoice === optChar;

                        let cardStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
                        if (isCorrectChoice) {
                          cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500/30 shadow-xs';
                        } else if (isStudentChoice && !q.isCorrect) {
                          cardStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-semibold ring-1 ring-rose-500/30 shadow-xs';
                        }

                        return (
                          <div
                            key={optChar}
                            className={`p-3.5 sm:p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${cardStyle}`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${isCorrectChoice
                                ? 'bg-emerald-600 text-white'
                                : isStudentChoice
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                            >
                              {optChar}
                            </div>
                            <div className="flex-1 pt-0.5 leading-relaxed font-medium">
                              <MathText text={cleanVietnameseDiacritics(optText)} />
                            </div>
                            {isCorrectChoice && (
                              <span className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-600 text-white font-black shrink-0 shadow-xs flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-3" />
                                <span>Đáp án đúng</span>
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="px-2.5 py-1 rounded-md text-[11px] bg-rose-600 text-white font-black shrink-0 shadow-xs flex items-center gap-1">
                                <X className="w-3 h-3 stroke-3" />
                                <span>Bạn đã chọn</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm space-y-2 text-slate-800">
                      <div className="text-xs font-black text-purple-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                      </div>
                      <div className="text-slate-800 leading-relaxed font-medium pl-6">
                        <MathText text={cleanVietnameseDiacritics(q.explanation)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


</DiagnosticReportPanel>
<DiagnosticReportPanel id="analysis" active={reportTab}>

<DiagnosticSkillProfile result={resultData} />

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


</DiagnosticReportPanel>
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
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onNavigateRoadmap ? onNavigateRoadmap : handleReturnDashboard}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Xem Lộ Trình Học Tập (Lớp Chung & Cá Nhân)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onNavigateTuition && (
                  <button
                    type="button"
                    onClick={onNavigateTuition}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Đóng Học Phí Để Vào Học</span>
                  </button>
                )}
              </div>
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
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
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
      {showSubmitModal && <ExamSubmitConfirmation answers={answers} questions={questions} onCancel={() => setShowSubmitModal(false)} onSubmit={executeSubmitExam} />}

      {/* Custom System Alert Popup Modal (React Overlay - Replaces raw window.alert) */}
      {customAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div role="dialog" aria-modal="true" aria-labelledby="diagnostic-alert-title" className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-2xl relative overflow-hidden text-slate-900">
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
              ) : customAlert.type === 'diagnostic-progress' ? (
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              ) : (
                <Sparkles className="w-8 h-8 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-2">
              <h2 id="diagnostic-alert-title" className="text-xl font-black text-slate-900">
                {customAlert.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {customAlert.message}
              </p>
            </div>

            {customAlert.type === 'diagnostic-progress' && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">Tiến độ chẩn đoán</span>
                  <span className="text-sm font-bold text-blue-700">{customAlert.completedCount}/{DIAGNOSTIC_TARGET} bài</span>
                </div>
                <div className="mt-3 flex gap-2" aria-label={`Đã hoàn thành ${customAlert.completedCount} trên ${DIAGNOSTIC_TARGET} bài`}>
                  {Array.from({ length: DIAGNOSTIC_TARGET }, (_, index) => index + 1).map((step) => (
                    <span key={step} className={`h-2 flex-1 rounded-full ${step <= customAlert.completedCount ? 'bg-blue-600' : 'bg-blue-100'}`} />
                  ))}
                </div>
              </div>
            )}

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
                {customAlert.onConfirm ? 'Mở lộ trình học cá nhân' : customAlert.type === 'diagnostic-progress' ? 'Về lịch sử' : 'Đã Hiểu & Đóng'}
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
                className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
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
                className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
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
            <div className="relative overflow-hidden p-6 bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
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
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>🚀 Bắt Đầu Vào Làm Bài Ngay</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {recoveryError && <div className="fixed bottom-5 left-4 right-4 z-[60] mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-4 shadow-xl" role="alert">
        <p className="text-sm text-amber-900">{recoveryError}</p>
        {recoveryBlocked.current && <button type="button" onClick={() => setRecoveryRetry((v) => v + 1)} className="mt-3 font-bold text-blue-600">Thử khôi phục lại</button>}
      </div>}
      {recovering && <div role="status" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60"><p className="rounded-2xl bg-white p-6">Đang kiểm tra và khôi phục bài...</p></div>}
      {/* Fullscreen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[220] bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
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

  if (isTakingExam && typeof document !== 'undefined' && document.body) {
    return createPortal(rootContent, document.body);
  }

  return rootContent;
}
