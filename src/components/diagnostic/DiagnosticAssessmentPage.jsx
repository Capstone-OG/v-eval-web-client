import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare
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
import { tokenStorage } from '../../services/apiClient';

// 5 Miền năng lực chuẩn V-ACT
const DOMAINS = {
  dom_math: { name: 'Toán học & Phân tích số liệu', color: 'from-blue-600 to-cyan-500', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  dom_logic: { name: 'Tư duy Logic & Suy luận', color: 'from-purple-600 to-indigo-500', badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  dom_lang: { name: 'Sử dụng Ngôn ngữ & Văn học', color: 'from-emerald-600 to-teal-500', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  dom_nat_sci: { name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', color: 'from-amber-600 to-orange-500', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  dom_soc_sci: { name: 'Khoa học Xã hội (Sử - Địa)', color: 'from-rose-600 to-pink-500', badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
};

import MathText from '../common/MathText';
const FormattedMath = MathText;

export default function DiagnosticAssessmentPage({ onNavigateDashboard, onNavigateHome }) {
  // Page states: 'setup' | 'testing' | 'analyzing' | 'result'
  const [stage, setStage] = useState('setup');
  
  // Setup options
  const [generatorMode, setGeneratorMode] = useState('gemini'); // 'gemini' | 'calibrated'
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
      generatorMode === 'gemini'
        ? 'Mô hình Google Gemini đang khởi tạo và cân bằng ma trận 30 câu hỏi theo 5 lĩnh vực V-ACT...'
        : 'Đang trích xuất và tổ hợp 30 câu hỏi chuẩn hóa từ Ngân hàng Đề thi...'
    );

    try {
      let data = null;
      try {
        data = await aiService.generateExam({
          prompt: customPrompt,
          domainId: 'ALL',
          questionCount: 30,
          generatorMode: generatorMode
        });
      } catch (aiErr) {
        console.warn('AI Engine generator failed, falling back to Content Service diagnostic test:', aiErr);
        try {
          const contentRes = await contentService.getDiagnosticTest();
          if (contentRes && contentRes.questions) {
            data = {
              title: contentRes.title || 'Đề Khảo Sát Năng Lực Chuẩn V-ACT 30 Câu',
              questions: contentRes.questions.map((q, idx) => ({
                id: q.id || `q${idx + 1}`,
                domain_id: q.domainId || 'dom_math',
                domain_name: q.domainName || 'Toán học & Phân tích số liệu',
                skill_id: q.skillId || 'sk_default',
                skill_name: q.skillName || 'Kỹ năng chuyên môn',
                bloom: q.difficulty || 2,
                content: q.content || q.text,
                options: q.options || [],
                correct: q.correctAnswer || 'A',
                explanation: q.explanation || ''
              })),
              engine_used: 'content_service'
            };
          }
        } catch (contentErr) {
          console.error('All fetch attempts failed:', contentErr);
        }
      }

      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('Không thể tải bộ 30 câu hỏi. Vui lòng kiểm tra lại dịch vụ Backend.');
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
      const studentId = user?.userId || 'std_demo_01';
      const submissionId = `sub_${Date.now()}`;

      // Build answer items
      const answerPayload = questions.map((q) => {
        const studentChoice = answers[q.id];
        const isCorrect = studentChoice ? studentChoice.toUpperCase() === q.correct.toUpperCase() : false;
        return {
          question_id: String(q.id),
          skill_id: String(q.skill_id || 'sk_default'),
          domain_id: String(q.domain_id || ''),
          difficulty_level: Math.max(1, Math.min(6, parseInt(q.bloom, 10) || 2)),
          is_correct: Boolean(isCorrect),
          time_spent_seconds: Math.max(1, parseInt(timeSpentPerQ[q.id], 10) || 30)
        };
      });

      // Domain names mapping
      const domainNamesPayload = Object.keys(DOMAINS).map((k) => ({
        domain_id: k,
        domain_name: DOMAINS[k].name
      }));

      // Analyze submission via Gateway
      const analysis = await aiService.analyzeDiagnosticSubmission({
        studentId,
        submissionId,
        answers: answerPayload,
        domainNames: domainNamesPayload,
        targetScore: parseInt(targetScore, 10) || 900,
        allSkillIds: {}
      });

      setResultData(analysis);
      setStage('result');
      
      // Fire celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to analyze submission:', err);
      // Fallback deterministic computation
      const correctCount = questions.filter(
        (q) => answers[q.id] && answers[q.id].toUpperCase() === q.correct.toUpperCase()
      ).length;
      const acc = correctCount / questions.length;
      const mockTheta = Number((acc * 4.0 - 2.0).toFixed(2));
      const mockClass = mockTheta >= 0.5 ? 'BREAKTHROUGH' : mockTheta >= -0.5 ? 'ACCELERATION' : 'FOUNDATION';

      setResultData({
        student_id: 'std_demo',
        submission_id: 'sub_fallback',
        theta_0: mockTheta,
        placement_class: mockClass,
        domain_scores: Object.keys(DOMAINS).map((k) => ({
          domain_id: k,
          domain_name: DOMAINS[k].name,
          accuracy_pct: Math.round(acc * 100),
          correct_count: Math.round(acc * 6),
          total_questions: 6
        })),
        radar_chart: Object.keys(DOMAINS).map((k) => ({
          domain_id: k,
          domain_name: DOMAINS[k].name,
          student_pct: Math.round(acc * 100),
          benchmark_pct: 75
        })),
        ai_commentary: `Dựa trên kết quả hoàn thành ${correctCount}/${questions.length} câu, năng lực ước tính của bạn đạt theta = ${mockTheta}. Đề xuất xếp vào ${
          mockClass === 'BREAKTHROUGH' ? 'Lớp Bứt Phá' : mockClass === 'ACCELERATION' ? 'Lớp Tăng Tốc' : 'Lớp Nền Tảng'
        }.`
      });
      setStage('result');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  // 5. Ask Socratic AI Tutor for current question
  const handleAskSocraticTutor = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || tutorStreaming) return;

    setIsTutorOpen(true);
    setTutorStreaming(true);
    setTutorResponse('');

    const promptText = `Tôi đang làm bài khảo sát năng lực câu hỏi sau:\n"${currentQ.content}"\nCác phương án:\n${currentQ.options.join(
      '\n'
    )}\nHãy hướng dẫn tôi tư duy từng bước theo phương pháp Socratic, gợi ý cách giải mà KHÔNG spoil đáp án trực tiếp.`;

    const controller = new AbortController();
    tutorAbortRef.current = controller;

    try {
      await aiService.askSocraticTutorStream({
        question: promptText,
        sessionId: `diag_session_${currentQ.id}`,
        onToken: (token) => {
          setTutorResponse((prev) => prev + token);
        },
        onError: (err) => {
          setTutorResponse((prev) => prev + `\n[Lỗi kết nối AI: ${err.message}]`);
        },
        onComplete: () => {
          setTutorStreaming(false);
        },
        signal: controller.signal
      });
    } catch {
      setTutorStreaming(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredTotal = Object.keys(answers).length;

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ===================================================================== */}
      {/* 1. SETUP / WELCOME SCREEN                                             */}
      {/* ===================================================================== */}
      {stage === 'setup' && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
            
            {/* Header badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-extrabold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                V-Eval Core Flow 1 • Diagnostic Engine
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Khảo Sát Năng Lực Đầu Vào 30 Câu
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Trải nghiệm khảo thí chẩn đoán chuẩn hóa V-ACT 2026 với trí tuệ nhân tạo. Ước lượng năng lực IRT 2PL, Bayesian Knowledge Tracing và vẽ biểu đồ Radar năng lực toàn diện.
              </p>
            </div>

            {/* Matrix preview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.keys(DOMAINS).map((key) => {
                const dom = DOMAINS[key];
                return (
                  <div key={key} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-1">
                    <div className="text-xs font-bold text-slate-300 line-clamp-1">{dom.name}</div>
                    <div className="text-[11px] text-cyan-400 font-extrabold">6 Câu hỏi</div>
                  </div>
                );
              })}
            </div>

            {/* Engine configuration */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cấu Hình Nguồn Sinh Đề Thi
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratorMode('gemini')}
                  className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    generatorMode === 'gemini'
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>Google Gemini Cloud AI</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-bold">Khuyên dùng</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Gemini phân tích và sáng tạo 30 câu hỏi mới 100%, chuẩn ma trận Bloom 6 cấp và công thức LaTeX.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGeneratorMode('calibrated')}
                  className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    generatorMode === 'calibrated'
                      ? 'bg-amber-600/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>Calibrated Question Bank</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-bold">&lt; 500ms</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Trích xuất siêu tốc 30 câu hỏi từ ngân hàng câu hỏi đã được hiệu chuẩn tham số Psychometrics sẵn.
                    </div>
                  </div>
                </button>
              </div>

              {/* Target score input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                        targetScore === score
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
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
                Về Dashboard
              </button>
            </div>

            {/* Loading text feedback */}
            {isLoading && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs text-center flex items-center justify-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{loadingMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. IN-EXAM TESTING SCREEN                                             */}
      {/* ===================================================================== */}
      {stage === 'testing' && currentQ && (
        <div className="flex-1 flex flex-col">
          
          {/* Top Exam Header Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-extrabold text-sm border border-blue-500/30">
                {currentIndex + 1}
              </div>
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{examData?.title || 'Đề Thi Khảo Sát Năng Lực Chuẩn V-ACT'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Câu {currentIndex + 1}/30
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Đã làm: <b className="text-cyan-400">{answeredTotal}/30</b></span>
                  <span>•</span>
                  <span>Tiến độ: <b className="text-white">{Math.round((answeredTotal / 30) * 100)}%</b></span>
                </div>
              </div>
            </div>

            {/* Timer & Actions */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 font-mono text-sm font-black text-amber-400 shadow-inner">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{formatTime(timeRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-extrabold text-xs shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp Bài</span>
              </button>
            </div>
          </div>

          {/* Main Exam Body */}
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Center: Current Question Card */}
            <div className="lg:col-span-8 flex flex-col space-y-5">
              
              {/* Question metadata badge */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${DOMAINS[currentQ.domain_id]?.badge || 'bg-slate-800 text-slate-300'}`}>
                      {currentQ.domain_name || DOMAINS[currentQ.domain_id]?.name || 'Miền Năng Lực'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Kỹ năng: <b className="text-slate-300">{currentQ.skill_name}</b>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold">
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

                {/* Question statement */}
                <div className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                  <span className="text-cyan-400 font-black mr-2">Câu {currentIndex + 1}:</span>
                  <FormattedMath text={currentQ.content} />
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
                          <FormattedMath text={optText} />
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

                  <div className="text-xs text-slate-500">
                    Thời gian trên câu này: <b>{timeSpentPerQ[currentQ.id] || 0}s</b>
                  </div>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold text-xs flex items-center gap-2 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu Trước</span>
                </button>

                <div className="text-xs text-slate-400 font-bold">
                  {currentIndex + 1} / {questions.length}
                </div>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 disabled:opacity-40 transition-all shadow-md shadow-blue-600/20"
                >
                  <span>Câu Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Question Navigator Grid 1..30 */}
            <div className="lg:col-span-4 space-y-5">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Danh Sách 30 Câu Hỏi</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {answeredTotal}/30 Đã Làm
                  </span>
                </div>

                {/* 30 Question Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentIndex;
                    const isFlag = !!flagged[q.id];

                    let btnClass = 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600';
                    if (isAnswered) {
                      btnClass = 'bg-blue-600 text-white border-blue-500 font-extrabold';
                    }
                    if (isCurrent) {
                      btnClass += ' ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900';
                    }
                    if (isFlag) {
                      btnClass += ' border-amber-400 border-2 text-amber-300';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-10 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all relative ${btnClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isFlag && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-600"></span>
                    <span>Đã chọn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800"></span>
                    <span>Chưa làm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-950 border-2 border-amber-400"></span>
                    <span>Phân vân 🚩</span>
                  </div>
                </div>
              </div>

              {/* In-Exam Socratic Tutor Panel (Drawer) */}
              {isTutorOpen && (
                <div className="p-5 bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>Gia Sư AI Socratic (Câu {currentIndex + 1})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTutorOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
      {/* 4. COMPREHENSIVE RESULT & PSYCHOMETRICS RADAR SCREEN                  */}
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
                Dữ liệu được chuẩn hóa theo mô hình đánh giá năng lực V-ACT 2026 và lưu giữ trong hồ sơ năng lực cá nhân.
              </p>
            </div>

            {/* Score & Class Badge */}
            <div className="flex items-center gap-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 text-center flex-shrink-0">
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
