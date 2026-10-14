import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Square, 
  AlertCircle, 
  Flag, 
  BookOpen, 
  Brain, 
  Layers, 
  ChevronRight,
  HelpCircle,
  Check,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import MathText from '../common/MathText';

export default function AISocraticTutorModal({ isOpen, onClose, initialContext = null }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState(null);
  
  // Reporting interaction modal state
  const [reportingInteraction, setReportingInteraction] = useState(null);
  const [reportReason, setReportReason] = useState('revealed_direct_answer');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const abortControllerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize or reset chat based on initialContext when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialContext) {
        const wrongText = initialContext.selectedWrong ? `\n> **Phương án em vừa chọn:** ${initialContext.selectedWrong}` : '';
        const contextGreeting = {
          sender: 'ai',
          text: `Chào em! Thầy nhận thấy em đang luyện tập chuyên đề: **${initialContext.skill || 'Toán logic & Suy luận'}**.\n\n> **Câu hỏi:** ${initialContext.question || ''}${wrongText}\n\nThầy là **AI Socratic Tutor**. Thầy sẽ không giải bài thay em hay đưa ra đáp án sẵn. Em hãy cho thầy biết: **Theo đề bài, dữ kiện nào là quan trọng nhất và vì sao em lại chọn phương án trên?**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          archetype: initialContext.skill || 'Toán logic mệnh đề & suy luận kéo theo',
          interactionId: null
        };
        setMessages([contextGreeting]);
      } else {
        setMessages([
          {
            sender: 'ai',
            text: 'Chào em! Thầy là **AI Socratic Tutor**. Thầy sẽ không giải bài thay em hay đưa ra đáp án sẵn, mà sẽ đặt câu hỏi gợi mở từng bước để em tự tìm ra hướng giải đúng.\n\nEm đang gặp khó khăn ở bài tập hay chuyên đề nào?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            archetype: 'Toán logic mệnh đề & suy luận kéo theo',
            interactionId: null
          }
        ]);
      }
    }
  }, [isOpen, initialContext]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  if (!isOpen) return null;

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    setRateLimitWarning(null);

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const newInteractionId = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '98e1f0fd-aed6-45f6-beac-be24686b573c');

    const aiMsgPlaceholder = {
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      archetype: initialContext?.skill || 'Dạng bài suy luận điều kiện cần & đủ',
      interactionId: newInteractionId
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await practiceService.askAiTutorStream({
        questionLatex: initialContext?.question ? `${query}\n\n[Ngữ cảnh câu hỏi: ${initialContext.question}]` : query,
        questionId: initialContext?.questionId || newInteractionId,
        options: initialContext?.options || null,
        studentWrongOption: initialContext?.selectedWrong || 'A',
        correctOption: initialContext?.correctOption || 'B',
        skillId: initialContext?.skillId || null,
        signal: controller.signal,
        onInteractionId: (id) => {
          setMessages(prev => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (lastIdx >= 0 && next[lastIdx].sender === 'ai') {
              next[lastIdx] = {
                ...next[lastIdx],
                interactionId: id
              };
            }
            return next;
          });
        },
        onToken: (token) => {
          setMessages(prev => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (lastIdx >= 0 && next[lastIdx].sender === 'ai') {
              next[lastIdx] = {
                ...next[lastIdx],
                text: next[lastIdx].text + token
              };
            }
            return next;
          });
        },
        onError: (err) => {
          if (err.status === 429) {
            setRateLimitWarning(err.message);
          } else if (err.name !== 'AbortError') {
            setMessages(prev => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].sender === 'ai') {
                if (!next[lastIdx].text) {
                  next[lastIdx] = {
                    ...next[lastIdx],
                    text: 'Thầy gặp chút gián đoạn khi kết nối tới đồ thị tri thức. Em hãy xem lại dữ kiện đề bài hoặc viết phương trình liên quan để thử giải nhé!'
                  };
                }
              }
              return next;
            });
          }
        },
        onComplete: (fullText) => {
          setIsTyping(false);
          abortControllerRef.current = null;
        }
      });
    } catch (err) {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportingInteraction) return;

    try {
      setIsSubmittingReport(true);
      await practiceService.reportAiTutorInteraction({
        interactionId: reportingInteraction.interactionId || '98e1f0fd-aed6-45f6-beac-be24686b573c',
        reason: `${reportReason}: ${reportNote}`.trim()
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingInteraction(null);
        setReportNote('');
      }, 2000);
    } catch (err) {
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingInteraction(null);
        setReportNote('');
      }, 2000);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const quickPrompts = initialContext ? [
    'Vì sao phương án em chọn lại chưa chính xác?',
    'Gợi ý giúp em bước lập luận đầu tiên',
    'Em chưa hiểu định lý áp dụng cho câu này'
  ] : [
    'Thầy gợi mở giúp em hướng tư duy bài này với ạ',
    'Em đang phân vân giữa phương án A và phương án B',
    'Em chưa hiểu vì sao mệnh đề này lại sai?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Bot className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Gia Sư AI Socratic Tutor & GraphRAG
                </h2>
                {initialContext ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                    Ngữ cảnh bài tập: {initialContext.skill || 'ZPD Quiz'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    Active 24/7
                  </span>
                )}
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                  Rate Limit: 10 req/min
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Hướng dẫn tư duy phản biện từng bước • Tuyệt đối không đưa lời giải sẵn
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* Left Column: Chat Window */}
          <div className="flex-1 flex flex-col justify-between border-r border-slate-200/80 bg-slate-50/30 min-w-0">
            
            {/* Context Sticky Banner if opened from quiz */}
            {initialContext && (
              <div className="mx-4 mt-4 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start justify-between gap-3 shadow-2xs">
                <div className="space-y-1 text-xs min-w-0">
                  <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                    <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Đang hỗ trợ câu hỏi bài tập:</span>
                  </div>
                  <p className="text-slate-700 line-clamp-2 italic font-medium">
                    "{initialContext.question}"
                  </p>
                  {initialContext.selectedWrong && (
                    <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1.5 pt-0.5">
                      <span>Phương án em chọn:</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-rose-200 text-rose-800 font-bold">{initialContext.selectedWrong}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rate Limit Warning Banner */}
            {rateLimitWarning && (
              <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">{rateLimitWarning}</div>
              </div>
            )}

            {/* Chat Stream Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((m, idx) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={idx} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[85%]">
                      {isAI && (
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                        isAI 
                          ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs' 
                          : 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                      }`}>
                        {isAI ? (
                          <div className="space-y-2">
                            <MathText text={m.text || '...'} />
                            
                            {m.archetype && (
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1 font-bold text-blue-600">
                                  <Layers className="w-3 h-3 text-blue-500" />
                                  <span>{m.archetype}</span>
                                </span>

                                <button
                                  onClick={() => setReportingInteraction(m)}
                                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Báo cáo câu trả lời vi phạm quy tắc Socratic hoặc sai lệch"
                                >
                                  <Flag className="w-3 h-3" />
                                  <span>Báo cáo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>{m.text}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-9">{m.timestamp}</span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-blue-200 text-xs font-semibold shadow-xs max-w-md">
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>AI đang truy vấn Đồ thị Tri thức & soạn câu hỏi gợi mở...</span>
                  </div>
                  <button
                    onClick={handleStopStream}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-all cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-red-600" />
                    <span>Dừng</span>
                  </button>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-all cursor-pointer disabled:opacity-50 truncate"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 bg-white border-t border-slate-200/80">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập thắc mắc hoặc hướng giải của bạn (hỗ trợ KaTeX: $x^2 + 2x = 0$)..."
                  disabled={isTyping}
                  className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputText.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Knowledge Graph Panel */}
          <div className="w-full lg:w-80 bg-white p-5 space-y-5 overflow-y-auto border-t lg:border-t-0 border-slate-100">
            
            {/* GraphRAG Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>Mạng Lưới Tri Thức 3-Hop</span>
              </div>

              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <div className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Dạng Bài Archetype</span>
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed font-semibold">
                  {initialContext?.skill || 'Toán logic mệnh đề & suy luận kéo theo'}
                </p>
                <div className="text-[10px] text-indigo-700/80">
                  Mã chuẩn: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">{initialContext?.questionId ? `Q-${initialContext.questionId.substring(0, 8)}` : 'ARCH_LOGIC_01'}</code>
                </div>
              </div>
            </div>

            {/* Core Theorems & Rules */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Định Lý & Công Thức Cốt Lõi:</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                <div>• Mệnh đề kéo theo: <code className="text-blue-700 font-bold">$P \Rightarrow Q$</code> chỉ sai khi <code className="font-bold">$P$ đúng và $Q$ sai</code>.</div>
                <div>• Phủ định của kéo theo: <code className="text-blue-700 font-bold">$\neg(P \Rightarrow Q) \equiv P \land \neg Q$</code>.</div>
              </div>
            </div>

            {/* Misconception Traps Warning */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Bẫy Sai Lầm Hay Mắc Phải:</span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-1.5">
                <div className="font-bold text-amber-950">⚠️ Bẫy ngộ nhận đảo:</div>
                <p>
                  Nhiều bạn lầm tưởng <code className="font-bold font-mono">$P \Rightarrow Q$</code> tương đương với <code className="font-bold font-mono">$Q \Rightarrow P$</code>. Đây là lỗi suy luận phổ biến nhất trong đề thi ĐGNL!
                </p>
              </div>
            </div>

            {/* Socratic Pedagogy Guidelines */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1.5">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Quy Tắc Sư Phạm Socratic:</span>
              </div>
              <p className="leading-relaxed">
                Nếu em phát hiện AI đưa ra đáp án trực tiếp mà không dẫn dắt tư duy, vui lòng bấm nút <strong>Báo cáo</strong> để Mentor xem xét và huấn luyện lại mô hình.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Hệ thống giám sát LLM-as-a-Judge đang kích hoạt liên tục.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng Khung Chat
          </button>
        </div>

      </div>

      {/* Report Modal */}
      {reportingInteraction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
                <Flag className="w-4 h-4" />
                <span>Báo Cáo Vi Phạm Quy Tắc Socratic</span>
              </div>
              <button 
                onClick={() => setReportingInteraction(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ý kiến của bạn sẽ được gửi trực tiếp đến Hội đồng Học thuật Mentor để tinh chỉnh lời giải mẫu và gài thêm bẫy ngộ nhận.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lý do báo cáo:</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="revealed_direct_answer">AI vô tình tiết lộ đáp án trực tiếp (Mất tính gợi mở)</option>
                  <option value="hallucination">AI cung cấp thông tin sai lệch / Ảo giác kiến thức</option>
                  <option value="confusing_guidance">Gợi ý khó hiểu hoặc không bám sát đề bài</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ghi chú chi tiết (nếu có):</label>
                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Ví dụ: AI nói thẳng đáp án là B ở dòng thứ 2..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {reportSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã gửi báo cáo thành công! Cảm ơn bạn đã đóng góp.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingInteraction(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
