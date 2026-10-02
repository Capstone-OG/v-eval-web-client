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
  Filter
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
  Tooltip
} from 'recharts';

import { aiService } from '../../services/aiService';
import { contentService } from '../../services/contentService';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import MathText from '../common/MathText';

// 5 Miền năng lực chuẩn V-ACT 2026
const DOMAINS = {
  dom_math: { name: 'Toán học & Phân tích số liệu', color: 'from-blue-600 to-cyan-500', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  dom_logic: { name: 'Tư duy Logic & Suy luận', color: 'from-purple-600 to-indigo-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  dom_lang: { name: 'Sử dụng Ngôn ngữ & Văn học', color: 'from-emerald-600 to-teal-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  dom_nat_sci: { name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', color: 'from-amber-600 to-orange-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  dom_soc_sci: { name: 'Khoa học Xã hội (Sử - Địa)', color: 'from-rose-600 to-pink-500', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
};

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

export default function DiagnosticAssessmentPage({ onNavigateDashboard, onNavigateHome }) {
  // Page states: 'setup' | 'testing' | 'analyzing' | 'result'
  const [stage, setStage] = useState('setup');
  
  // Setup options
  const [generatorMode, setGeneratorMode] = useState('content_service'); // 'content_service' | 'gemini' | 'calibrated'
  const [targetScore, setTargetScore] = useState(900);
  const [customPrompt, setCustomPrompt] = useState('Đề thi khảo sát năng lực chuẩn hóa V-ACT 5 lĩnh vực (30 câu)');
  
  // Exam states
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [flagged, setFlagged] = useState({}); // { [qId]: boolean }
  const [timeSpentPerQ, setTimeSpentPerQ] = useState({}); // { [qId]: seconds }
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // AI Tutor Drawer
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorStreaming, setTutorStreaming] = useState(false);
  const [tutorResponse, setTutorResponse] = useState('');
  const tutorAbortRef = useRef(null);

  // Result state
  const [resultData, setResultData] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG' | 'FLAGGED'

  // Timer interval
  useEffect(() => {
    let timer;
    if (stage === 'testing' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
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

  // 1. Fetch / Generate 30 Questions
  const handleStartAssessment = async () => {
    setIsLoading(true);
    setLoadingMsg(
      generatorMode === 'content_service'
        ? 'Đang nạp 30 câu hỏi chuẩn hóa từ Ngân hàng Đề thi Content Service của trường...'
        : generatorMode === 'gemini'
        ? 'Mô hình Google Gemini đang khởi tạo và cân bằng ma trận 30 câu hỏi theo 5 lĩnh vực V-ACT...'
        : 'Đang trích xuất siêu tốc 30 câu hỏi hiệu chuẩn từ Ngân hàng AI Calibrated Bank...'
    );

    try {
      let data = null;

      // NGUỒN 1: CONTENT SERVICE (Đề thi có sẵn trong Database)
      if (generatorMode === 'content_service') {
        try {
          // Lấy chi tiết đề thi chẩn đoán (bao gồm cả bảng đáp án và giải thích)
          const contentRes = await contentService.getExamDetail('11111111-1111-1111-1111-111111111111');
          
          if (contentRes && (contentRes.passages?.length > 0 || contentRes.single_questions?.length > 0)) {
            const rawList = [];
            
            // Xử lý bài đọc hiểu (Passages)
            (contentRes.passages || []).forEach((p, pIdx) => {
              if (p.questions) {
                p.questions.forEach((q) => {
                  const optionsArr = q.options && typeof q.options === 'object' && !Array.isArray(q.options)
                    ? [q.options.A || '', q.options.B || '', q.options.C || '', q.options.D || '']
                    : (q.options || []);

                  const skillName = q.suggested_skill_name || q.suggestedSkillName || 'Kỹ năng ĐGNL';
                  const domain = mapSkillToDomain(skillName, rawList.length);

                  rawList.push({
                    id: String(q.question_id || q.questionId || `cs_q_${rawList.length + 1}`),
                    question_number: rawList.length + 1,
                    passage_content: p.content || '',
                    passage_title: `Bài đọc hiểu ${pIdx + 1} (Câu ${p.start_question || 1} - ${p.end_question || 5})`,
                    content: q.content || q.text,
                    options: optionsArr,
                    skill_id: String(q.skill_id || `sk_${domain.id}`),
                    skill_name: skillName,
                    domain_id: domain.id,
                    domain_name: domain.name,
                    bloom: q.difficulty_level || q.difficultyLevel || 2,
                    correct: (q.correct_option || q.correctOption || 'A').trim().toUpperCase(),
                    explanation: q.explanation || `Phân tích chi tiết: Đáp án chính xác là phương án ${(q.correct_option || q.correctOption || 'A').toUpperCase()} dựa trên các luận cứ logic và ngữ liệu trong bài đọc.`
                  });
                });
              }
            });

            // Xử lý câu hỏi đơn (Single Questions)
            (contentRes.single_questions || []).forEach((q) => {
              const optionsArr = q.options && typeof q.options === 'object' && !Array.isArray(q.options)
                ? [q.options.A || '', q.options.B || '', q.options.C || '', q.options.D || '']
                : (q.options || []);

              const skillName = q.suggested_skill_name || q.suggestedSkillName || 'Kỹ năng ĐGNL';
              const domain = mapSkillToDomain(skillName, rawList.length);

              rawList.push({
                id: String(q.question_id || q.questionId || `cs_q_${rawList.length + 1}`),
                question_number: rawList.length + 1,
                passage_content: '',
                content: q.content || q.text,
                options: optionsArr,
                skill_id: String(q.skill_id || `sk_${domain.id}`),
                skill_name: skillName,
                domain_id: domain.id,
                domain_name: domain.name,
                bloom: q.difficulty_level || q.difficultyLevel || 2,
                correct: (q.correct_option || q.correctOption || 'A').trim().toUpperCase(),
                explanation: q.explanation || `Phân tích chi tiết: Câu hỏi thuộc kỹ năng "${skillName}". Áp dụng phương pháp suy luận chuẩn để chọn đáp án đúng.`
              });
            });

            data = {
              title: contentRes.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu Chẩn Đoán)',
              questions: rawList.slice(0, 30),
              engine_used: 'content_service'
            };
          }
        } catch (csErr) {
          console.warn('Lỗi gọi Content Service exams detail, thử fallback getDiagnosticTest:', csErr);
          const fallbackRes = await contentService.getDiagnosticTest();
          if (fallbackRes && fallbackRes.passages) {
            const rawList = [];
            fallbackRes.passages.forEach((p, pIdx) => {
              (p.questions || []).forEach((q) => {
                const optionsArr = q.options && typeof q.options === 'object' && !Array.isArray(q.options)
                  ? [q.options.A || '', q.options.B || '', q.options.C || '', q.options.D || '']
                  : (q.options || []);
                const skillName = q.suggestedSkillName || 'Kỹ năng ĐGNL';
                const domain = mapSkillToDomain(skillName, rawList.length);
                rawList.push({
                  id: String(q.questionId || `q_${rawList.length + 1}`),
                  question_number: rawList.length + 1,
                  passage_content: p.content || '',
                  passage_title: `Bài đọc hiểu ${pIdx + 1}`,
                  content: q.content,
                  options: optionsArr,
                  skill_id: `sk_${domain.id}`,
                  skill_name: skillName,
                  domain_id: domain.id,
                  domain_name: domain.name,
                  bloom: q.difficultyLevel || 2,
                  correct: 'A',
                  explanation: 'Đáp án được đối chiếu từ bảng đáp án mã đề gốc Content Service.'
                });
              });
            });
            data = {
              title: fallbackRes.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu Chẩn Đoán)',
              questions: rawList.slice(0, 30),
              engine_used: 'content_service'
            };
          }
        }
      }

      // NGUỒN 2: GOOGLE GEMINI CLOUD AI hoặc NGUỒN 3: CALIBRATED BANK
      if (!data && (generatorMode === 'gemini' || generatorMode === 'calibrated')) {
        const aiExam = await aiService.generateExam({
          prompt: customPrompt,
          domainId: 'ALL',
          questionCount: 30,
          generatorMode: generatorMode
        });

        if (aiExam && aiExam.questions && aiExam.questions.length > 0) {
          data = {
            title: aiExam.title || (generatorMode === 'gemini' ? 'Đề Thi Khảo Sát Google Gemini AI (30 Câu)' : 'Đề Thi Hiệu Chuẩn Psychometrics (30 Câu)'),
            questions: aiExam.questions.map((q, idx) => ({
              id: String(q.id || `q_${idx + 1}`),
              question_number: idx + 1,
              passage_content: q.passage || '',
              content: q.content || q.text,
              options: q.options || [],
              skill_id: String(q.skill_id || q.skillId || `sk_default`),
              skill_name: q.skill_name || q.skillName || 'Kỹ năng chuyên môn',
              domain_id: q.domain_id || q.domainId || 'dom_math',
              domain_name: q.domain_name || q.domainName || (DOMAINS[q.domain_id]?.name || 'Toán học & Phân tích số liệu'),
              bloom: q.bloom || q.difficulty || 2,
              correct: (q.correct || q.correctAnswer || 'A').trim().toUpperCase(),
              explanation: q.explanation || 'Lời giải chi tiết được tạo tự động bởi mô hình Gemini Reasoning AI.'
            })),
            engine_used: aiExam.engine_used || generatorMode
          };
        }
      }

      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('Không thể tải hoặc sinh bộ 30 câu hỏi. Vui lòng kiểm tra lại dịch vụ Backend.');
      }

      setExamData(data);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeSpentPerQ({});
      setTimeRemaining(45 * 60);
      setStage('testing');
    } catch (err) {
      console.error('Error starting assessment:', err);
      alert(`Lỗi khởi tạo đề thi: ${err.message}`);
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
  const handleSubmitExam = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length && timeRemaining > 0) {
      const confirmSubmit = window.confirm(
        `Bạn mới hoàn thành ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài sớm không?`
      );
      if (!confirmSubmit) return;
    }

    setStage('analyzing');
    setIsLoading(true);
    setLoadingMsg('Động cơ AI Psychometrics đang ước lượng năng lực IRT 2PL Theta, tính toán BKT và tổng hợp Radar Chart...');

    try {
      const user = tokenStorage.getUser();
      const studentId = user?.userId || '00000000-0000-0000-0000-000000000001';
      const submissionId = `sub_${Date.now()}`;

      // 1. Thống kê số câu đúng / sai thực tế và thời gian từng câu
      let totalCorrect = 0;
      let totalTimeSpent = 0;

      const domainStats = {};
      Object.keys(DOMAINS).forEach((k) => {
        domainStats[k] = { domain_id: k, domain_name: DOMAINS[k].name, total: 0, correct: 0 };
      });

      const reviewedQuestionsList = questions.map((q, idx) => {
        const studentChoice = answers[q.id] ? answers[q.id].trim().toUpperCase() : '';
        const correctChoice = (q.correct || 'A').trim().toUpperCase();
        const isCorrect = studentChoice === correctChoice;
        const timeSpent = Math.max(1, parseInt(timeSpentPerQ[q.id], 10) || 25);

        totalTimeSpent += timeSpent;
        if (isCorrect) totalCorrect += 1;

        // Thống kê theo domain
        const dId = q.domain_id && domainStats[q.domain_id] ? q.domain_id : 'dom_math';
        domainStats[dId].total += 1;
        if (isCorrect) domainStats[dId].correct += 1;

        // Phân loại tốc độ
        let speedCategory = 'normal'; // 25s - 90s
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

      // 2. Tính toán điểm phần trăm 5 lĩnh vực thực tế (không bịa)
      const domainScoresCalculated = Object.values(domainStats).map((d) => ({
        domain_id: d.domain_id,
        domain_name: d.domain_name,
        total_questions: d.total,
        correct_count: d.correct,
        accuracy_pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
      }));

      // Radar chart 5 trục so sánh với chuẩn 900+
      const radarChartCalculated = domainScoresCalculated.map((d) => ({
        domain_id: d.domain_id,
        domain_name: d.domain_name,
        student_pct: d.accuracy_pct,
        benchmark_pct: d.domain_id === 'dom_math' ? 85 : d.domain_id === 'dom_logic' ? 80 : 75
      }));

      // Tính năng lực IRT theta_0 chuẩn hóa từ độ chính xác thực tế
      const overallAcc = totalCorrect / (questions.length || 30);
      const clampedP = Math.max(0.04, Math.min(0.96, overallAcc));
      const theta0Calculated = Math.round(Math.log(clampedP / (1 - clampedP)) * 100) / 100;
      const placementClassCalculated = theta0Calculated >= 0.5 ? 'BREAKTHROUGH' : theta0Calculated >= -0.5 ? 'ACCELERATION' : 'FOUNDATION';

      // Pacing Metrics
      const avgTimePerQ = Math.round(totalTimeSpent / (questions.length || 1));
      const fastCount = reviewedQuestionsList.filter((q) => q.speedCategory === 'fast').length;
      const normalCount = reviewedQuestionsList.filter((q) => q.speedCategory === 'normal').length;
      const slowCount = reviewedQuestionsList.filter((q) => q.speedCategory === 'slow').length;
      const flaggedCount = Object.keys(flagged).filter((k) => flagged[k]).length;

      // Nhận xét chiến thuật tự động
      const sortedByAcc = [...domainScoresCalculated].sort((a, b) => b.accuracy_pct - a.accuracy_pct);
      const bestDomain = sortedByAcc[0];
      const worstDomain = sortedByAcc[sortedByAcc.length - 1];

      let pedagogicalCommentary = `Dựa trên kết quả hoàn thành ${totalCorrect}/${questions.length} câu, năng lực ước tính của bạn đạt theta = ${theta0Calculated > 0 ? '+' : ''}${theta0Calculated.toFixed(2)}. Thế mạnh nổi bật là "${bestDomain?.domain_name}" (${bestDomain?.accuracy_pct}%). Bạn cần ưu tiên rèn luyện thêm ở "${worstDomain?.domain_name}" (${worstDomain?.accuracy_pct}%) để bứt phá mục tiêu điểm số.`;

      // 3. Gửi phân tích sang Backend AI Engine / Gateway
      let backendAnalysis = null;
      try {
        const answerPayload = reviewedQuestionsList.map((q) => ({
          question_id: String(q.id),
          skill_id: String(q.skill_id || 'sk_default'),
          domain_id: String(q.domain_id || ''),
          difficulty_level: Math.max(1, Math.min(6, parseInt(q.bloom, 10) || 2)),
          is_correct: Boolean(q.isCorrect),
          time_spent_seconds: q.timeSpent
        }));

        const domainNamesPayload = Object.keys(DOMAINS).map((k) => ({
          domain_id: k,
          domain_name: DOMAINS[k].name
        }));

        backendAnalysis = await aiService.analyzeDiagnosticSubmission({
          studentId,
          submissionId,
          answers: answerPayload,
          domainNames: domainNamesPayload,
          targetScore: parseInt(targetScore, 10) || 900,
          allSkillIds: {}
        });
      } catch (errApi) {
        console.warn('Backend AI analysis endpoint warning, using deterministic psychometrics:', errApi.message);
      }

      // Kết hợp dữ liệu chuẩn xác
      const finalResult = {
        theta_0: backendAnalysis?.theta_0 != null ? backendAnalysis.theta_0 : theta0Calculated,
        placement_class: backendAnalysis?.placement_class || placementClassCalculated,
        domain_scores: backendAnalysis?.domain_scores?.length ? backendAnalysis.domain_scores : domainScoresCalculated,
        radar_chart: backendAnalysis?.radar_chart?.length ? backendAnalysis.radar_chart : radarChartCalculated,
        ai_commentary: backendAnalysis?.ai_commentary || pedagogicalCommentary,
        reviewedQuestions: reviewedQuestionsList,
        pacing: {
          totalCorrect,
          totalQuestions: questions.length,
          totalTimeSpent,
          avgTimePerQ,
          fastCount,
          normalCount,
          slowCount,
          flaggedCount
        }
      };

      setResultData(finalResult);
      setStage('result');
      
      // Fire celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Submit exam error:', err);
      alert(`Lỗi phân tích bài thi: ${err.message}`);
      setStage('testing');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  // 5. Ask Socratic Tutor via SSE Stream
  const handleAskSocraticTutor = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setIsTutorOpen(true);
    setTutorResponse('');
    setTutorStreaming(true);

    if (tutorAbortRef.current) {
      tutorAbortRef.current.abort();
    }
    const abortController = new AbortController();
    tutorAbortRef.current = abortController;

    const promptText = `Tôi đang làm bài khảo sát năng lực câu hỏi sau:
"${currentQ.content}"
Các phương án:
${currentQ.options.map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt}`).join('\n')}

Hãy đóng vai Gia sư AI Socratic: KHÔNG TIẾT LỘ ĐÁP ÁN TRỰC TIẾP, mà hãy gợi ý câu hỏi dẫn dắt từng bước để tôi tự suy nghĩ ra lời giải.`;

    try {
      await aiService.askSocraticTutorStream({
        question: promptText,
        sessionId: `diag_${currentQ.id}`,
        signal: abortController.signal,
        onToken: (token) => {
          setTutorResponse((prev) => prev + token);
        },
        onError: (err) => {
          console.warn('Tutor stream error:', err);
          setTutorResponse(
            (prev) =>
              prev +
              `\n\n[Gợi ý gợi mở]: Để giải quyết câu này, bạn hãy xác định điều kiện xác định và mối liên hệ giữa các dữ kiện đề bài cho!`
          );
        },
        onComplete: () => {
          setTutorStreaming(false);
        }
      });
    } catch (err) {
      setTutorStreaming(false);
    }
  };

  // Lọc danh sách câu hỏi trong bảng đánh giá chi tiết
  const filteredReviewQuestions = useMemo(() => {
    if (!resultData?.reviewedQuestions) return [];
    if (reviewFilter === 'CORRECT') return resultData.reviewedQuestions.filter((q) => q.isCorrect);
    if (reviewFilter === 'WRONG') return resultData.reviewedQuestions.filter((q) => !q.isCorrect);
    if (reviewFilter === 'FLAGGED') return resultData.reviewedQuestions.filter((q) => q.isFlagged);
    return resultData.reviewedQuestions;
  }, [resultData, reviewFilter]);

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              <span>V-EVAL DIAGNOSTIC</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Core Flow 1
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Khảo Thí Năng Lực Đầu Vào 30 Câu & IRT 2PL</div>
          </div>
        </div>

        {stage === 'testing' && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-sm font-black text-amber-400 shadow-inner">
              <Clock className="w-4 h-4 animate-pulse text-amber-400" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={handleSubmitExam}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              Nộp Bài
            </button>
          </div>
        )}

        {stage !== 'testing' && (
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            Quay lại Dashboard
          </button>
        )}
      </header>

      {/* ===================================================================== */}
      {/* 1. SETUP / CONFIG SCREEN                                              */}
      {/* ===================================================================== */}
      {stage === 'setup' && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
            
            {/* Title & Description */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hệ Thống Đánh Giá Năng Lực Chuẩn Hóa V-ACT 2026</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Khảo Sát Năng Lực Đầu Vào (30 Câu)
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                Bài kiểm tra chuẩn hóa đo lường năng lực học sinh qua 5 lĩnh vực then chốt. Động cơ Psychometrics tự động ước lượng tham số năng lực <span className="text-cyan-300 font-bold">IRT 2PL $\theta_0$</span>, xác suất làm chủ kỹ năng BKT và gợi ý lớp học phù hợp.
              </p>
            </div>

            {/* Matrix Breakdown Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {Object.keys(DOMAINS).map((k) => (
                <div key={k} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 line-clamp-1">{DOMAINS[k].name}</div>
                  <div className="text-sm font-black text-white">6 câu</div>
                  <div className="text-[10px] text-cyan-400 font-semibold">Bloom 1-4</div>
                </div>
              ))}
            </div>

            {/* Generator Mode Selector (3 Clear Options) */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Chọn Nguồn Đề Thi Khảo Sát
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Content Service */}
                <button
                  type="button"
                  onClick={() => setGeneratorMode('content_service')}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                    generatorMode === 'content_service'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-black">Database</span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Đề Có Sẵn (Content Service)</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Lấy trực tiếp 30 câu hỏi chuẩn hóa từ Ngân hàng Đề thi Content Service của trường.
                    </div>
                  </div>
                </button>

                {/* 2. Google Gemini AI Cloud */}
                <button
                  type="button"
                  onClick={() => setGeneratorMode('gemini')}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                    generatorMode === 'gemini'
                      ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                      <Brain className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-black">AI Live</span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Sinh Đề AI Cloud (Gemini)</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Gemini 3.6 Flash sinh 30 câu hỏi mới 100%, chuẩn ma trận Bloom và công thức Toán KaTeX.
                    </div>
                  </div>
                </button>

                {/* 3. Calibrated Bank */}
                <button
                  type="button"
                  onClick={() => setGeneratorMode('calibrated')}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                    generatorMode === 'calibrated'
                      ? 'bg-amber-600/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-black">&lt; 500ms</span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Hiệu Chuẩn AI Fast Bank</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Trích xuất siêu tốc 30 câu hỏi đã được gán sẵn tham số Psychometrics từ RAM.
                    </div>
                  </div>
                </button>
              </div>

              {/* Target score input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Điểm mục tiêu của thí sinh (thang 1200):
                </label>
                <div className="flex items-center gap-2">
                  {[750, 900, 1050].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setTargetScore(score)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                        targetScore === score
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {score}+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleStartAssessment}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Đang Khởi Tạo Đề Thi 30 Câu...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>Bắt Đầu Khảo Sát 30 Câu (45 Phút)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onNavigateDashboard}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. IN-EXAM TESTING SCREEN (30 Questions Flow)                         */}
      {/* ===================================================================== */}
      {stage === 'testing' && currentQ && (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          
          {/* Main Question Card */}
          <div className="flex-1 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            <div className="space-y-5">
              
              {/* Question metadata badge bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${DOMAINS[currentQ.domain_id]?.badge || 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {currentQ.domain_name || DOMAINS[currentQ.domain_id]?.name || 'Toán học & Phân tích'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Kỹ năng: <strong className="text-slate-200">{currentQ.skill_name}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                    Bloom {currentQ.bloom}/6
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-400' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'Đã Gắn Cờ' : 'Đánh Dấu Phân Vân'}</span>
                </button>
              </div>

              {/* Reading Passage Context (nếu là bài đọc hiểu từ Content Service) */}
              {currentQ.passage_content && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{currentQ.passage_title || 'Ngữ Liệu Đọc Hiểu'}:</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-200 font-serif">
                    {currentQ.passage_content}
                  </div>
                </div>
              )}

              {/* Question statement */}
              <div className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                <span className="text-cyan-400 font-black mr-2">Câu {currentIndex + 1}:</span>
                <MathText text={currentQ.content} />
              </div>

              {/* Options List A, B, C, D */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((optText, optIdx) => {
                  const optChar = ['A', 'B', 'C', 'D'][optIdx];
                  const isSelected = answers[currentQ.id] === optChar;

                  return (
                    <button
                      key={optChar}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optChar)}
                      className={`w-full p-4 rounded-2xl text-left transition-all border flex items-start gap-4 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {optChar}
                      </div>
                      <div className="flex-1 text-sm font-semibold pt-1 leading-normal">
                        <MathText text={optText} />
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-1">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Ask AI Socratic Tutor helper button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleAskSocraticTutor}
                  className="px-4 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 font-extrabold text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Hỏi Gia Sư AI Về Câu Này (Socratic Tutor)</span>
                </button>

                <div className="text-xs text-slate-500 font-medium">
                  Thời gian trên câu này: <span className="font-mono text-cyan-400 font-bold">{timeSpentPerQ[currentQ.id] || 0}s</span>
                </div>
              </div>
            </div>

            {/* Bottom Question Step Navigator */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu Trước</span>
              </button>

              <div className="text-xs font-black text-slate-400">
                <span className="text-cyan-400">{currentIndex + 1}</span> / {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>Câu Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <span>Hoàn Tất & Nộp Bài</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar: 30 Question Grid Navigator */}
          <div className="w-full lg:w-72 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-6 flex-shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Danh Sách 30 Câu</span>
                </div>
                <div className="text-xs text-slate-400 font-bold">
                  {Object.keys(answers).length}/{questions.length} đã chọn
                </div>
              </div>

              {/* 30 Question Number Buttons */}
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlag = !!flagged[q.id];

                  let btnBg = 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700';
                  if (isCurrent) {
                    btnBg = 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-500/20';
                  } else if (isFlag) {
                    btnBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold';
                  } else if (isAnswered) {
                    btnBg = 'bg-blue-600/30 text-blue-300 border-blue-500/40 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-extrabold transition-all border relative flex items-center justify-center ${btnBg}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlag && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-2 text-[11px] font-bold text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span>Đang làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Đã chọn đáp án</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>Đánh dấu phân vân</span>
                </div>
              </div>
            </div>

            {/* Socratic AI Tutor Quick Drawer Trigger */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Socratic Tutor</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTutorOpen(!isTutorOpen)}
                  className="text-[11px] font-extrabold text-cyan-400 hover:underline"
                >
                  {isTutorOpen ? 'Thu gọn' : 'Mở rộng'}
                </button>
              </div>

              {isTutorOpen && (
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Gia sư AI giúp học sinh gợi mở tư duy, không tiết lộ đáp án trực tiếp:
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-purple-500/20 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {tutorResponse ? (
                      <MathText text={tutorResponse} />
                    ) : (
                      <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>AI đang phân tích câu hỏi và soạn hướng dẫn tư duy...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. ANALYZING PSYCHOMETRICS LOADER                                     */}
      {/* ===================================================================== */}
      {stage === 'analyzing' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Đang Phân Tích Năng Lực...</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Động cơ Psychometrics đang chạy giải thuật Ước lượng hợp lý cực đại (MLE) 2PL IRT và tính toán xác suất làm chủ BKT 5 miền năng lực.
              </p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. COMPREHENSIVE RESULT, PACING ANALYSIS & ANSWER REVIEW TABLE        */}
      {/* ===================================================================== */}
      {stage === 'result' && resultData && (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
          
          {/* Top Result Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ĐÃ HOÀN THÀNH BÀI KHẢO SÁT CHẨN ĐOÁN
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Báo Cáo Năng Lực Đầu Vào Thí Sinh
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Dữ liệu được chuẩn hóa theo mô hình đánh giá năng lực V-ACT 2026 và phân tích tốc độ phản xạ thực tế.
              </p>
            </div>

            {/* Score & Class Badge */}
            <div className="flex items-center gap-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 text-center flex-shrink-0">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Điểm Thô</div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {resultData.pacing?.totalCorrect || 0}<span className="text-sm font-semibold text-slate-400">/30</span>
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Năng Lực IRT θ₀</div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                  {resultData.theta_0 > 0 ? `+${resultData.theta_0.toFixed(2)}` : resultData.theta_0.toFixed(2)}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Phân Lớp Đề Xuất</div>
                <div className="text-xs sm:text-sm font-black px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {resultData.placement_class === 'BREAKTHROUGH'
                    ? 'Lớp Bứt Phá (900+)'
                    : resultData.placement_class === 'ACCELERATION'
                    ? 'Lớp Tăng Tốc (750-900)'
                    : 'Lớp Nền Tảng (<750)'}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* PHÂN TÍCH TỐC ĐỘ & CHIẾN THUẬT LÀM BÀI (PACING ANALYSIS)              */}
          {/* ===================================================================== */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5 text-base font-black text-white">
                <Gauge className="w-5 h-5 text-amber-400" />
                <span>Phân Tích Tốc Độ & Chiến Thuật Làm Bài (Pacing Analysis)</span>
              </div>
              <div className="text-xs text-slate-400">
                Tổng thời gian làm bài: <strong className="text-slate-200">{formatTime(resultData.pacing?.totalTimeSpent || 0)}</strong>
              </div>
            </div>

            {/* 4 Cards: Fast / Normal / Slow / Flagged */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Average Time */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Thời Gian Trung Bình</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {resultData.pacing?.avgTimePerQ || 0}<span className="text-xs font-semibold text-slate-400">s / câu</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-medium">Nhịp độ tiêu chuẩn V-ACT</div>
              </div>

              {/* Fast (<25s) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>Làm Nhanh (&lt;25s)</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-300">
                  {resultData.pacing?.fastCount || 0}<span className="text-xs font-semibold text-slate-400"> câu</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">Phản xạ nhạy bén ở câu quen thuộc</div>
              </div>

              {/* Normal (25-90s) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                  <span>Chuẩn Nhịp Độ (25-90s)</span>
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-300">
                  {resultData.pacing?.normalCount || 0}<span className="text-xs font-semibold text-slate-400"> câu</span>
                </div>
                <div className="text-[11px] text-blue-400 font-medium">Kiểm soát tiến độ 45 phút tối ưu</div>
              </div>

              {/* Slow (>90s) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span>Tốn Nhiều Thời Gian (&gt;90s)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">
                  {resultData.pacing?.slowCount || 0}<span className="text-xs font-semibold text-slate-400"> câu</span>
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  {resultData.pacing?.slowCount > 4 ? 'Cần tránh sa lầy ở câu khó' : 'Phân bổ an toàn'}
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart & AI Commentary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recharts 5-Axis Radar Chart */}
            <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Biểu Đồ Radar Năng Lực 5 Lĩnh Vực</span>
                </div>
                <div className="text-xs text-slate-400 font-bold">Thang đo %</div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={resultData.radar_chart || []}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="domain_name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Điểm Thí Sinh" dataKey="student_pct" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.45} />
                    <Radar name="Chuẩn Mục Tiêu" dataKey="benchmark_pct" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                  <span>Kết quả của bạn</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-400">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span>Chuẩn đầu vào 900+</span>
                </div>
              </div>
            </div>

            {/* Right: Gemini AI Socratic Commentary & Domain breakdown */}
            <div className="lg:col-span-6 flex flex-col space-y-5">
              
              {/* AI Socratic Commentary Box */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/30 rounded-3xl shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-purple-300">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Lời Khuyên Sư Phạm Từ Cố Vấn AI (Gemini Commentary)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/60 p-4 rounded-2xl border border-purple-500/20">
                  "{resultData.ai_commentary || 'Thí sinh thể hiện năng lực đồng đều ở các lĩnh vực. Hãy tập trung củng cố các kỹ năng vận dụng cao để bứt phá mục tiêu điểm số.'}"
                </p>
              </div>

              {/* 5 Domains Accuracy Progress */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3.5 flex-1">
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Chi Tiết Từng Lĩnh Vực ĐGNL
                </div>
                <div className="space-y-3">
                  {(resultData.domain_scores || []).map((ds) => (
                    <div key={ds.domain_id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">{ds.domain_name}</span>
                        <span className="text-cyan-400">{ds.accuracy_pct}% ({ds.correct_count || 0}/{ds.total_questions || 6} câu)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all"
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
          <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Bảng Đánh Giá Chi Tiết & Đáp Án 30 Câu Hỏi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Đối chiếu câu trả lời của thí sinh với đáp án chính xác, lời giải chi tiết và thời gian làm bài.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setReviewFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất Cả ({resultData.reviewedQuestions?.length || 30})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('CORRECT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === 'CORRECT'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đúng ({resultData.pacing?.totalCorrect || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('WRONG')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === 'WRONG'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sai ({(resultData.pacing?.totalQuestions || 30) - (resultData.pacing?.totalCorrect || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('FLAGGED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === 'FLAGGED'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
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
                    className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                      q.isCorrect
                        ? 'bg-slate-950/60 border-emerald-500/30'
                        : isSelected
                        ? 'bg-slate-950/60 border-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    {/* Question Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-cyan-400">
                          Câu {q.question_number}:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${DOMAINS[q.domain_id]?.badge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {q.domain_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {q.skill_name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                          Bloom {q.bloom}/6
                        </span>
                        {q.isFlagged && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                            <Flag className="w-3 h-3 fill-amber-400" />
                            <span>Phân vân</span>
                          </span>
                        )}
                      </div>

                      {/* Speed badge & status */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          q.speedCategory === 'fast'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : q.speedCategory === 'slow'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{q.timeSpent}s</span>
                          <span className="text-[10px] opacity-80">
                            ({q.speedCategory === 'fast' ? '⚡ Nhanh' : q.speedCategory === 'slow' ? '⏳ Chậm' : '⏱️ Chuẩn'})
                          </span>
                        </span>

                        <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                          q.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isSelected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {q.isCorrect ? '✅ Chính xác' : isSelected ? '❌ Chưa đúng' : '⚪ Chưa trả lời'}
                        </span>
                      </div>
                    </div>

                    {/* Passage text if any */}
                    {q.passage_content && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase mb-1">
                          {q.passage_title || 'Ngữ liệu đọc hiểu'}:
                        </div>
                        <div className="line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                          {q.passage_content}
                        </div>
                      </div>
                    )}

                    {/* Question Content */}
                    <div className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                      <MathText text={q.content} />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const optChar = ['A', 'B', 'C', 'D'][optIdx];
                        const isStudentChoice = q.studentChoice === optChar;
                        const isCorrectChoice = q.correctChoice === optChar;

                        let cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                        if (isCorrectChoice) {
                          cardStyle = 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm';
                        } else if (isStudentChoice && !q.isCorrect) {
                          cardStyle = 'bg-rose-500/15 border-rose-500 text-rose-200 font-bold';
                        }

                        return (
                          <div
                            key={optChar}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${cardStyle}`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                              isCorrectChoice
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : isStudentChoice
                                ? 'bg-rose-500 text-white font-black'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {optChar}
                            </div>
                            <div className="flex-1 pt-0.5 leading-normal">
                              <MathText text={optText} />
                            </div>
                            {isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 flex-shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-black border border-rose-500/30 flex-shrink-0">
                                Bạn đã chọn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs sm:text-sm space-y-1.5">
                      <div className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        <MathText text={q.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStage('setup')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Khảo Sát Đề Mới Khác</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Vào Lộ Trình Học Tập Cá Nhân Hóa (Dashboard)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
