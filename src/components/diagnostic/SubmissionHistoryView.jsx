import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  Bot,
  MessageSquare,
  ChevronLeft,
  Eye,
  Trash2,
  Play,
  Flag,
  BookOpen,
  AlertTriangle,
  Filter,
  TrendingUp,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import MathText from '../common/MathText';

const EXAM_TYPE_LABELS = {
  DIAGNOSTIC: {
    label: 'Khảo sát ĐGNL (30 câu)',
    badge: 'bg-blue-500/15 text-cyan-300 border-blue-500/30'
  },
  ZPD_QUIZ: {
    label: 'Luyện tập Thích ứng ZPD',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  TOPIC_QUIZ: {
    label: 'Kiểm tra Chuyên đề',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  }
};

export default function SubmissionHistoryView({
  onStartNewDiagnostic,
  onOpenAiTutorWithContext,
  initialSubmissionId = null
}) {
  const [historyList, setHistoryList] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'mistakes'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'DIAGNOSTIC' | 'ZPD_QUIZ' | 'TOPIC_QUIZ'
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'CORRECT' | 'WRONG' | 'FLAGGED'
  const [isSyncingBackend, setIsSyncingBackend] = useState(false);

  // Inline Socratic AI Tutor Stream State
  const [activeTutorQuestionId, setActiveTutorQuestionId] = useState(null);
  const [tutorResponse, setTutorResponse] = useState('');
  const [tutorStreaming, setTutorStreaming] = useState(false);
  const tutorAbortRef = useRef(null);

  const loadHistory = async () => {
    const localItems = practiceService.getSubmissionHistory();
    setHistoryList(localItems);

    if (initialSubmissionId) {
      const found = localItems.find((item) => item.id === initialSubmissionId);
      if (found) setSelectedSubmission(found);
    }

    // Attempt to sync summaries from Backend Practice Service if available
    setIsSyncingBackend(true);
    try {
      const user = tokenStorage.getUser();
      const remoteList = await practiceService.getStudentDiagnosticHistory(user?.id || user?.userId);
      const unwrapped = Array.isArray(remoteList)
        ? remoteList
        : Array.isArray(remoteList?.data)
        ? remoteList.data
        : Array.isArray(remoteList?.value)
        ? remoteList.value
        : [];

      if (unwrapped.length > 0) {
        const existingIds = new Set(localItems.map((i) => String(i.id)));
        const merged = [...localItems];
        unwrapped.forEach((remoteItem) => {
          const rId = String(remoteItem.submissionId || remoteItem.id);
          if (rId && !existingIds.has(rId)) {
            merged.push({
              id: rId,
              title: `Bài Khảo Sát ĐGNL (${remoteItem.examType || 'DIAGNOSTIC'})`,
              examType: remoteItem.examType || 'DIAGNOSTIC',
              completedAt: remoteItem.completedAt || new Date().toISOString(),
              theta_0: remoteItem.theta0 ?? 0.35,
              placement_class: remoteItem.placementClass || 'ACCELERATION',
              pacing: {
                totalCorrect: remoteItem.totalCorrect ?? 0,
                totalQuestions: remoteItem.totalQuestions ?? 30,
                totalTimeSpent: remoteItem.totalTimeSpentSeconds ?? 0,
                avgTimePerQ:
                  remoteItem.totalQuestions > 0
                    ? Math.round((remoteItem.totalTimeSpentSeconds || 0) / remoteItem.totalQuestions)
                    : 0
              },
              reviewedQuestions: []
            });
          }
        });
        setHistoryList(merged);
      }
    } catch {
      // Backend offline or no remote submissions yet — local history is already loaded
    } finally {
      setIsSyncingBackend(false);
    }
  };

  useEffect(() => {
    loadHistory();
    return () => {
      if (tutorAbortRef.current) {
        tutorAbortRef.current.abort();
      }
    };
  }, [initialSubmissionId]);

  const handleSelectSubmission = async (sub) => {
    setActiveTutorQuestionId(null);
    setTutorResponse('');
    setReviewFilter('ALL');

    // If remote submission has no local reviewedQuestions yet, try fetching detail by ID
    if ((!sub.reviewedQuestions || sub.reviewedQuestions.length === 0) && sub.id) {
      try {
        const detailRes = await practiceService.getDiagnosticSubmissionById(sub.id);
        const dto = detailRes?.data || detailRes?.value || detailRes;
        if (dto && Array.isArray(dto.questions) && dto.questions.length > 0) {
          const mappedQuestions = dto.questions.map((q, idx) => ({
            id: String(q.questionId || `q_${idx + 1}`),
            question_number: q.questionOrder || idx + 1,
            content: q.content || `Câu hỏi số ${q.questionOrder || idx + 1} (${q.skillName || 'Kỹ năng ĐGNL'})`,
            options: q.options || ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
            skill_id: q.skillId,
            skill_name: q.skillName || 'Kỹ năng ĐGNL',
            domain_id: q.domainId,
            domain_name: q.domainName || 'Toán học & Tư duy Logic',
            bloom: q.difficultyLevel || 2,
            studentChoice: q.selectedOption || '',
            correctChoice: q.correctOption || 'A',
            correct: q.correctOption || 'A',
            isCorrect: Boolean(q.isCorrect),
            timeSpent: q.timeSpentSeconds || 30,
            explanation:
              q.explanation ||
              `Đáp án đúng là ${q.correctOption || 'A'} thuộc chuyên đề ${q.skillName || 'ĐGNL'}.`
          }));
          const enriched = { ...sub, reviewedQuestions: mappedQuestions };
          setSelectedSubmission(enriched);
          return;
        }
      } catch {
        // Fallback to existing sub
      }
    }

    setSelectedSubmission(sub);
  };

  const handleDeleteSubmission = (e, submissionId) => {
    e.stopPropagation();
    const updated = practiceService.deleteSubmissionFromHistory(submissionId);
    setHistoryList(updated);
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(null);
    }
  };

  // Build contextual Socratic guidance for any reviewed question
  const buildContextualSocraticAnalysis = (q) => {
    const chosenChar = q.studentChoice || '';
    const chosenIdx = ['A', 'B', 'C', 'D'].indexOf(chosenChar);
    const chosenText = chosenIdx >= 0 && q.options?.[chosenIdx] ? q.options[chosenIdx] : '';

    const correctChar = q.correctChoice || q.correct || 'A';
    const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctChar);
    const correctText = correctIdx >= 0 && q.options?.[correctIdx] ? q.options[correctIdx] : '';

    const choiceLine = chosenChar
      ? q.isCorrect
        ? `- **Ghi nhận kết quả:** Em đã chọn đúng phương án **${chosenChar}** (${chosenText}). Hãy cùng kiểm tra lại bản chất toán học để nắm chắc phương pháp giải nhanh cho dạng bài **${q.skill_name || 'ĐGNL'}** này.`
        : `- **Phân tích lựa chọn của em:** Em đã chọn phương án **${chosenChar}** (${chosenText}), trong khi đáp án chuẩn của câu hỏi là **${correctChar}** (${correctText}). Điểm dễ nhầm lẫn ở câu này thường nằm ở việc chưa xét hết điều kiện trên toàn miền xác định hoặc nhầm dấu khi biến đổi.`
      : `- **Phân tích câu hỏi:** Ở câu này em chưa chọn phương án trả lời. Đáp án đúng là **${correctChar}** (${correctText}) thuộc chuyên đề **${q.skill_name || 'ĐGNL'}**.`;

    const theoremLine = q.explanation
      ? `- **Định lý & Lập luận cốt lõi:** ${q.explanation}`
      : `- **Định lý & Lập luận cốt lõi:** Áp dụng trực tiếp tính chất của chuyên đề **${q.skill_name || 'ĐGNL'}** để loại trừ các phương án vi phạm điều kiện cần.`;

    const socraticQuestion = !q.isCorrect && chosenChar
      ? `👉 *Câu hỏi gợi mở:* Khi thay một giá trị cụ thể hoặc xét đạo hàm / điều kiện của phương án **${chosenChar}** (${chosenText}) so với phương án **${correctChar}** (${correctText}), em thấy phương án **${chosenChar}** bị vi phạm ở điều kiện nào?`
      : `👉 *Câu hỏi gợi mở:* Nếu bài toán đổi dữ kiện theo chiều ngược lại, em sẽ biến đổi bước nào trong lập luận trên để tìm nhanh đáp án?`;

    return `💡 **Phân tích tư duy Socratic (${q.skill_name || 'Chuyên đề ĐGNL'}):**\n\n${choiceLine}\n${theoremLine}\n\n${socraticQuestion}`;
  };

  const handleAskSocraticTutor = async (q) => {
    if (!q) return;
    setActiveTutorQuestionId(q.id);
    setTutorResponse('');
    setTutorStreaming(true);

    if (tutorAbortRef.current) {
      tutorAbortRef.current.abort();
    }
    const abortController = new AbortController();
    tutorAbortRef.current = abortController;

    const optionsDict = {};
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, i) => {
        optionsDict[['A', 'B', 'C', 'D'][i] || `${i}`] = opt;
      });
    }

    const studentAttempt = q.studentChoice || 'A';
    const correctChoice = q.correctChoice || q.correct || 'A';
    let accumulated = '';

    try {
      await practiceService.askAiTutorStream({
        questionId: q.id,
        questionLatex: q.content,
        options: optionsDict,
        studentWrongOption: studentAttempt,
        correctOption: correctChoice,
        skillId: q.skill_id || null,
        signal: abortController.signal,
        onToken: (token) => {
          accumulated += token;
          if (
            accumulated.includes('Bước nào trong quá trình biến đổi khiến em chọn phương án này') ||
            accumulated.includes('Hướng kiểm tra bản chất:')
          ) {
            setTutorResponse(buildContextualSocraticAnalysis(q));
          } else {
            setTutorResponse(accumulated);
          }
        },
        onError: () => {
          setTutorResponse(buildContextualSocraticAnalysis(q));
        },
        onComplete: () => {
          if (
            !accumulated ||
            accumulated.includes('Bước nào trong quá trình biến đổi khiến em chọn phương án này') ||
            accumulated.includes('Hướng kiểm tra bản chất:')
          ) {
            setTutorResponse(buildContextualSocraticAnalysis(q));
          }
          setTutorStreaming(false);
        }
      });
    } catch {
      if (!accumulated) {
        setTutorResponse(buildContextualSocraticAnalysis(q));
      }
      setTutorStreaming(false);
    }
  };

  const handleOpenFullSocraticModal = (q) => {
    if (!q || !onOpenAiTutorWithContext) return;
    const chosenChar = q.studentChoice;
    const chosenIdx = ['A', 'B', 'C', 'D'].indexOf(chosenChar);
    const correctChar = q.correctChoice || q.correct || 'A';
    const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctChar);
    onOpenAiTutorWithContext({
      questionId: q.id,
      question: q.content,
      options: q.options,
      skill: q.skill_name,
      selectedWrong: !q.isCorrect && chosenIdx >= 0 ? `${chosenChar}. ${q.options?.[chosenIdx] || ''}` : null,
      correctOption: correctIdx >= 0 ? `${correctChar}. ${q.options?.[correctIdx] || ''}` : correctChar,
      difficultyB: q.bloom ? ((q.bloom - 3) * 0.5).toFixed(2) : 0.25,
      predictedProb: 0.65
    });
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (typeFilter === 'ALL') return historyList;
    return historyList.filter((item) => (item.examType || 'DIAGNOSTIC') === typeFilter);
  }, [historyList, typeFilter]);

  // Aggregated wrong questions across all submissions (Mistake Notebook)
  const allWrongQuestions = useMemo(() => {
    const list = [];
    historyList.forEach((sub) => {
      (sub.reviewedQuestions || []).forEach((q) => {
        if (!q.isCorrect) {
          list.push({
            ...q,
            id: `${sub.id}_${q.id}`,
            submissionTitle: sub.title,
            completedAt: sub.completedAt
          });
        }
      });
    });
    return list;
  }, [historyList]);

  // Filtered questions inside selected submission
  const filteredReviewQuestions = useMemo(() => {
    if (!selectedSubmission?.reviewedQuestions) return [];
    if (reviewFilter === 'CORRECT') return selectedSubmission.reviewedQuestions.filter((q) => q.isCorrect);
    if (reviewFilter === 'WRONG') return selectedSubmission.reviewedQuestions.filter((q) => !q.isCorrect);
    if (reviewFilter === 'FLAGGED') return selectedSubmission.reviewedQuestions.filter((q) => q.isFlagged);
    return selectedSubmission.reviewedQuestions;
  }, [selectedSubmission, reviewFilter]);

  // Overall stats
  const summaryStats = useMemo(() => {
    const totalAttempts = historyList.length;
    let totalQ = 0;
    let totalRight = 0;
    historyList.forEach((s) => {
      totalQ += s.pacing?.totalQuestions || s.reviewedQuestions?.length || 0;
      totalRight += s.pacing?.totalCorrect || (s.reviewedQuestions || []).filter((q) => q.isCorrect).length;
    });
    const avgAcc = totalQ > 0 ? Math.round((totalRight / totalQ) * 100) : 0;
    const latestTheta = historyList[0]?.theta_0 ?? 0.42;
    return { totalAttempts, totalQ, totalRight, avgAcc, latestTheta };
  }, [historyList]);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Vừa xong';
    }
  };

  // ============================================================================
  // VIEW 1: DETAILED SUBMISSION REVIEW (WHEN A STUDENT CLICKS A PAST EXAM)
  // ============================================================================
  if (selectedSubmission) {
    const totalCorrect =
      selectedSubmission.pacing?.totalCorrect ??
      (selectedSubmission.reviewedQuestions || []).filter((q) => q.isCorrect).length;
    const totalQuestions =
      selectedSubmission.pacing?.totalQuestions ||
      (selectedSubmission.reviewedQuestions || []).length ||
      1;
    const accPct = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="space-y-6 animate-fade pb-12">
        {/* Top Back Navigation Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-400 hover:text-cyan-300 mb-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Danh sách Lịch sử làm bài</span>
            </button>
            <h2 className="text-lg sm:text-xl font-black text-white flex flex-wrap items-center gap-2.5">
              <span>{selectedSubmission.title}</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${
                  EXAM_TYPE_LABELS[selectedSubmission.examType]?.badge ||
                  EXAM_TYPE_LABELS.DIAGNOSTIC.badge
                }`}
              >
                {EXAM_TYPE_LABELS[selectedSubmission.examType]?.label || 'Khảo sát ĐGNL'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Hoàn thành lúc: <strong className="text-slate-200">{formatDate(selectedSubmission.completedAt)}</strong> • Bấm vào bất kỳ câu hỏi nào bên dưới để xem đáp án giải chi tiết và hỏi Gia sư AI Socratic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Kết quả</div>
              <div className="text-base font-black text-emerald-400">
                {totalCorrect}/{totalQuestions} câu ({accPct}%)
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Chỉ số IRT</div>
              <div className="text-base font-black text-cyan-400">
                {selectedSubmission.theta_0 > 0 ? `+${selectedSubmission.theta_0}` : selectedSubmission.theta_0 ?? '+0.42'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Commentary Banner */}
        {selectedSubmission.ai_commentary && (
          <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/30 rounded-2xl p-5 text-xs sm:text-sm text-slate-200 flex items-start gap-3.5 shadow-lg">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-cyan-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-cyan-300 text-xs uppercase tracking-wider">
                Nhận Xét Chiến Thuật Từ AI Psychometrics:
              </div>
              <div className="leading-relaxed text-slate-200">{selectedSubmission.ai_commentary}</div>
            </div>
          </div>
        )}

        {/* Question Review List + Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Bảng Đáp Án Chi Tiết & Hỏi Gia Sư AI Socratic</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem lại phương án bạn đã chọn, đối chiếu lời giải gốc và hỏi AI Socratic từng bước tư duy
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setReviewFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('CORRECT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'CORRECT'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đúng ({totalCorrect})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('WRONG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'WRONG'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sai ({totalQuestions - totalCorrect})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviewQuestions.map((q, idx) => {
              const isSelected = Boolean(q.studentChoice);
              return (
                <div
                  key={q.id || idx}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                    q.isCorrect
                      ? 'bg-slate-950/70 border-emerald-500/30'
                      : 'bg-slate-950/70 border-rose-500/30'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-cyan-400">
                        Câu {q.question_number || idx + 1}:
                      </span>
                      {q.domain_name && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {q.domain_name}
                        </span>
                      )}
                      {q.skill_name && (
                        <span className="text-xs text-slate-400 font-medium">{q.skill_name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {q.timeSpent && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{q.timeSpent}s</span>
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black ${
                          q.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isSelected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {q.isCorrect ? '✅ Chính xác' : isSelected ? '❌ Chưa đúng' : '⚪ Bỏ trống'}
                      </span>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(q.options || []).map((optText, optIdx) => {
                      const optChar = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);
                      const isStudentChoice = q.studentChoice === optChar;
                      const isCorrectChoice = (q.correctChoice || q.correct) === optChar;

                      let cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                      if (isCorrectChoice) {
                        cardStyle = 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-sm';
                      } else if (isStudentChoice && !q.isCorrect) {
                        cardStyle = 'bg-rose-500/15 border-rose-500 text-rose-200 font-bold';
                      }

                      return (
                        <div
                          key={optChar}
                          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${cardStyle}`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              isCorrectChoice
                                ? 'bg-emerald-500 text-slate-950'
                                : isStudentChoice
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {optChar}
                          </div>
                          <div className="flex-1 pt-0.5 leading-normal">
                            <MathText text={optText} />
                          </div>
                          {isCorrectChoice && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                          {isStudentChoice && !isCorrectChoice && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-black border border-rose-500/30 shrink-0">
                              Bạn đã chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Socratic AI Tutor Action Bar */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs sm:text-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Lời Giải & Hướng Dẫn Tư Duy Chi Tiết:</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAskSocraticTutor(q)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span>💡 Hỏi Gia Sư AI Socratic Về Câu Này</span>
                        </button>

                        {onOpenAiTutorWithContext && (
                          <button
                            type="button"
                            onClick={() => handleOpenFullSocraticModal(q)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Chat Socratic Chuyên Sâu</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-300 leading-relaxed">
                      <MathText text={q.explanation} />
                    </div>

                    {/* Inline Socratic Tutor Stream */}
                    {activeTutorQuestionId === q.id && (
                      <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-400/40 shadow-lg space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-indigo-400/20 pb-2.5">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-cyan-300">
                            <Bot className="w-4 h-4 text-cyan-400" />
                            <span>
                              Gia Sư AI Socratic Phân Tích Tư Duy Câu {q.question_number || idx + 1}:
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTutorQuestionId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-all"
                          >
                            Đóng
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm text-white leading-relaxed">
                          {tutorResponse ? (
                            <MathText text={tutorResponse} className="text-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-cyan-300 animate-pulse py-2">
                              <Sparkles className="w-4 h-4 animate-spin" />
                              <span>Gia sư Socratic đang phân tích lỗi sai và gợi mở hướng tư duy...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: SUBMISSION HISTORY LIST & MISTAKE NOTEBOOK
  // ============================================================================
  return (
    <div className="space-y-6 animate-fade pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <History className="w-3.5 h-3.5" />
            <span>Hồ Sơ Học Thuật & Lịch Sử Khảo Thí</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Lưu trữ toàn bộ các bài khảo sát ĐGNL, phiếu luyện tập thích ứng ZPD và bài kiểm tra chuyên đề đã hoàn thành. Bấm vào bất kỳ bài làm nào để xem lại đáp án chi tiết và hỏi Gia sư AI Socratic.
          </p>
        </div>

        {onStartNewDiagnostic && (
          <button
            type="button"
            onClick={onStartNewDiagnostic}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Làm Đề Khảo Sát Mới</span>
          </button>
        )}
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tổng số bài đã làm</div>
            <div className="text-2xl font-black text-slate-900">{summaryStats.totalAttempts} bài</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Độ chính xác TB</div>
            <div className="text-2xl font-black text-emerald-600">{summaryStats.avgAcc}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Năng lực IRT gần nhất</div>
            <div className="text-2xl font-black text-purple-600">
              {summaryStats.latestTheta > 0 ? `+${summaryStats.latestTheta}` : summaryStats.latestTheta}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Câu cần ôn lại (Sai)</div>
            <div className="text-2xl font-black text-rose-600">{allWrongQuestions.length} câu</div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs: Lịch Sử Bài Làm vs Sổ Tay Lỗi Sai */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Danh Sách Đề Đã Làm ({historyList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'mistakes'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Sổ Tay Câu Làm Sai ({allWrongQuestions.length})</span>
            </button>
          </div>

          {activeTab === 'submissions' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'DIAGNOSTIC', label: 'Khảo sát ĐGNL' },
                { id: 'ZPD_QUIZ', label: 'Luyện tập ZPD' },
                { id: 'TOPIC_QUIZ', label: 'Chuyên đề' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: SUBMISSIONS LIST */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">Chưa có bài làm nào trong danh mục này</div>
                <p className="text-xs text-slate-500">
                  Hãy bắt đầu một bài khảo sát hoặc luyện tập để hệ thống lưu lại lịch sử và phân tích đáp án cùng AI.
                </p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const totalCorrect =
                  sub.pacing?.totalCorrect ??
                  (sub.reviewedQuestions || []).filter((q) => q.isCorrect).length;
                const totalQuestions =
                  sub.pacing?.totalQuestions || (sub.reviewedQuestions || []).length || 1;
                const accPct = Math.round((totalCorrect / totalQuestions) * 100);
                const wrongCount = totalQuestions - totalCorrect;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md bg-slate-50/70 hover:bg-white transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-100 text-blue-700">
                          {EXAM_TYPE_LABELS[sub.examType]?.label || 'Khảo sát ĐGNL'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(sub.completedAt)}</span>
                        </span>
                        {sub.placement_class && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Nhóm: {sub.placement_class}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {sub.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold">
                        <span>
                          Điểm: <strong className="text-slate-900">{totalCorrect}/{totalQuestions} câu</strong> ({accPct}%)
                        </span>
                        <span className="text-emerald-600">✓ {totalCorrect} câu đúng</span>
                        <span className="text-rose-600">✗ {wrongCount} câu cần xem lại</span>
                        {sub.theta_0 !== undefined && (
                          <span className="text-indigo-600">
                            Theta IRT: <strong>{sub.theta_0 > 0 ? `+${sub.theta_0}` : sub.theta_0}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSubmission(sub);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem Lại Đáp Án & Hỏi AI</span>
                      </button>

                      {historyList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSubmission(e, sub.id)}
                          title="Xóa bản ghi này"
                          className="p-2.5 rounded-xl bg-slate-200/70 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MISTAKE NOTEBOOK (ALL WRONG QUESTIONS ACROSS EXAMS) */}
        {activeTab === 'mistakes' && (
          <div className="space-y-4">
            {allWrongQuestions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-800">Tuyệt vời! Bạn không có câu hỏi làm sai nào tồn đọng.</div>
              </div>
            ) : (
              allWrongQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                        Câu sai #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-cyan-400">{q.skill_name || 'Chuyên đề ĐGNL'}</span>
                      <span className="text-xs text-slate-400">• Từ đề: {q.submissionTitle}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(q.completedAt)}</span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                    <MathText text={q.content} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(q.options || []).map((optText, optIdx) => {
                      const optChar = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);
                      const isStudentChoice = q.studentChoice === optChar;
                      const isCorrectChoice = (q.correctChoice || q.correct) === optChar;

                      let cardStyle = 'bg-slate-950/60 border-slate-800 text-slate-300';
                      if (isCorrectChoice) {
                        cardStyle = 'bg-emerald-500/15 border-emerald-500 text-white font-bold';
                      } else if (isStudentChoice) {
                        cardStyle = 'bg-rose-500/15 border-rose-500 text-rose-200 font-bold';
                      }

                      return (
                        <div key={optChar} className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${cardStyle}`}>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              isCorrectChoice
                                ? 'bg-emerald-500 text-slate-950'
                                : isStudentChoice
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {optChar}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <MathText text={optText} />
                          </div>
                          {isCorrectChoice && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                          {isStudentChoice && !isCorrectChoice && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-black border border-rose-500/30 shrink-0">
                              Bạn đã chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Giải thích & Phân tích Socratic:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAskSocraticTutor(q)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span>💡 Hỏi Gia Sư AI Socratic Về Câu Này</span>
                        </button>
                        {onOpenAiTutorWithContext && (
                          <button
                            type="button"
                            onClick={() => handleOpenFullSocraticModal(q)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Chat Socratic Chuyên Sâu</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <MathText text={q.explanation} />
                    </div>

                    {activeTutorQuestionId === q.id && (
                      <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-400/40 shadow-lg space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-400/20 pb-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-cyan-300">
                            <Bot className="w-4 h-4 text-cyan-400" />
                            <span>Gia Sư AI Socratic Phân Tích Tư Duy:</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTutorQuestionId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                          >
                            Đóng
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm text-white leading-relaxed">
                          {tutorResponse ? (
                            <MathText text={tutorResponse} className="text-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-cyan-300 animate-pulse py-2">
                              <Sparkles className="w-4 h-4 animate-spin" />
                              <span>Gia sư Socratic đang phân tích lỗi sai...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
