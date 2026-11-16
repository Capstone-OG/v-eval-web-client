import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  RefreshCw,
  X,
  Square,
  AlertCircle,
  Flag,
  Layers,
  HelpCircle,
  Check,
  Target,
  MessageSquare,
  Clock,
  Plus,
  Search,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Cloud
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { tokenStorage } from '../../services/apiClient';
import {
  aiSessionManager,
  formatSessionTime
} from '../../utils/aiSessionManager';
import MathText from '../common/MathText';

export default function AISocraticTutorModal({ isOpen, onClose, initialContext = null }) {
  const currentUserId = useMemo(() => {
    const user = tokenStorage.getUser();
    return user?.id || user?.userId || 'guest_student';
  }, []);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

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
  const streamedTextRef = useRef('');

  // Load or initialize sessions when modal opens or initialContext changes
  useEffect(() => {
    if (!isOpen) return;

    let loaded = aiSessionManager.getSessions(currentUserId);

    // Initial context from quiz question review
    if (initialContext?.question) {
      const targetQuestionId = initialContext.questionId ? String(initialContext.questionId) : null;
      let existingSession = targetQuestionId
        ? loaded.find(s => s.questionId === targetQuestionId)
        : null;

      if (!existingSession) {
        const wrongText = initialContext.selectedWrong ? `\n> **Phương án em vừa chọn:** ${initialContext.selectedWrong}` : '';
        const contextGreeting = {
          sender: 'ai',
          text: `Chào em! Thầy thấy em đang xem lại câu hỏi thuộc chủ đề: **${initialContext.skill || 'Ôn tập ĐGNL'}**.\n\n> **Câu hỏi:** ${initialContext.question || ''}${wrongText}\n\nThầy là **Gia Sư AI Đồng Hành**. Để giúp em nhớ bài thật kỹ, thầy sẽ gợi ý từng bước thay vì đưa đáp án sẵn. Em hãy chia sẻ với thầy: **Theo đề bài, dữ kiện nào là quan trọng nhất và vì sao em lại chọn phương án trên?**`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topicLabel: initialContext.skill || null,
          interactionId: null
        };

        const newSess = aiSessionManager.createSession(currentUserId, {
          questionId: targetQuestionId,
          questionLatex: initialContext.question,
          skill: initialContext.skill,
          selectedWrong: initialContext.selectedWrong,
          correctOption: initialContext.correctOption,
          options: initialContext.options,
          initialMessages: [contextGreeting]
        });

        loaded = [newSess, ...loaded];
        setActiveSessionId(newSess.id);
      } else {
        setActiveSessionId(existingSession.id);
      }
    } else {
      // General exploration mode
      if (loaded.length === 0) {
        const defaultGreeting = {
          sender: 'ai',
          text: 'Chào em! Thầy là **Gia Sư AI Đồng Hành**. Thầy sẽ gợi mở từng bước dễ hiểu để em tự tìm ra cách giải và nắm chắc kiến thức.\n\nEm đang gặp khó khăn ở câu hỏi hay chủ đề nào?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topicLabel: null,
          interactionId: null
        };

        const freshSess = aiSessionManager.createSession(currentUserId, {
          title: 'Hỏi đáp chung với Gia sư AI',
          skill: null,
          initialMessages: [defaultGreeting]
        });
        loaded = [freshSess];
        setActiveSessionId(freshSess.id);
      } else if (!activeSessionId || !loaded.some(s => s.id === activeSessionId)) {
        setActiveSessionId(loaded[0].id);
      }
    }

    setSessions(loaded);
  }, [isOpen, initialContext, currentUserId]);

  // Active session object
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const messages = useMemo(() => {
    return activeSession?.messages || [];
  }, [activeSession]);

  const filteredSessions = useMemo(() => {
    if (!historySearchTerm.trim()) return sessions;
    const term = historySearchTerm.toLowerCase();
    return sessions.filter(s =>
      (s.title && s.title.toLowerCase().includes(term)) ||
      (s.skill && s.skill.toLowerCase().includes(term))
    );
  }, [sessions, historySearchTerm]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, activeSessionId]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleCreateNewSession = () => {
    const defaultGreeting = {
      sender: 'ai',
      text: 'Chào em! Thầy là **Gia Sư AI Đồng Hành**. Thầy sẽ gợi mở từng bước dễ hiểu để em tự tìm ra cách giải và nắm chắc kiến thức.\n\nEm đang gặp khó khăn ở câu hỏi hay chủ đề nào?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topicLabel: null,
      interactionId: null
    };

    const newSess = aiSessionManager.createSession(currentUserId, {
      title: 'Phiên hỏi đáp mới',
      skill: null,
      initialMessages: [defaultGreeting]
    });

    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    aiSessionManager.deleteSession(currentUserId, sessionId);

    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          const defaultGreeting = {
            sender: 'ai',
            text: 'Chào em! Thầy là **Gia Sư AI Đồng Hành**. Thầy sẽ gợi mở từng bước dễ hiểu để em tự tìm ra cách giải và nắm chắc kiến thức.\n\nEm đang gặp khó khăn ở câu hỏi hay chủ đề nào?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            topicLabel: null,
            interactionId: null
          };

          const freshSess = aiSessionManager.createSession(currentUserId, {
            title: 'Phiên hỏi đáp mới',
            skill: null,
            initialMessages: [defaultGreeting]
          });
          setActiveSessionId(freshSess.id);
          return [freshSess];
        }
      }
      return remaining;
    });
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping || !activeSession) return;

    setRateLimitWarning(null);

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedWithUser = [...messages, userMsg];
    aiSessionManager.updateSessionMessages(currentUserId, activeSession.id, updatedWithUser);
    setSessions(aiSessionManager.getSessions(currentUserId));
    setInputText('');
    setIsTyping(true);

    const newInteractionId = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '98e1f0fd-aed6-45f6-beac-be24686b573c');

    const aiMsgPlaceholder = {
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topicLabel: activeSession.skill || null,
      interactionId: newInteractionId
    };

    const updatedWithPlaceholder = [...updatedWithUser, aiMsgPlaceholder];
    aiSessionManager.updateSessionMessages(currentUserId, activeSession.id, updatedWithPlaceholder);
    setSessions(aiSessionManager.getSessions(currentUserId));
    streamedTextRef.current = '';

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const isQuestionMode = Boolean(activeSession.questionLatex);
      await practiceService.askAiTutorStream({
        questionLatex: isQuestionMode ? activeSession.questionLatex : query,
        studentQuery: query,
        questionId: activeSession.questionId || newInteractionId,
        options: isQuestionMode ? activeSession.options : null,
        studentWrongOption: isQuestionMode ? (activeSession.selectedWrong || null) : null,
        correctOption: isQuestionMode ? (activeSession.correctOption || null) : null,
        skillId: null,
        signal: controller.signal,
        onInteractionId: (id) => {
          setSessions(prev => {
            const next = prev.map(s => {
              if (s.id !== activeSession.id) return s;
              const msgs = s.messages.map((m, idx) => {
                if (idx === s.messages.length - 1 && m.sender === 'ai') {
                  return { ...m, interactionId: id };
                }
                return m;
              });
              return { ...s, messages: msgs };
            });
            aiSessionManager.saveSessions(currentUserId, next);
            return next;
          });
        },
        onToken: (token) => {
          streamedTextRef.current += token;
          const currentText = streamedTextRef.current;
          setSessions(prev =>
            prev.map(s => {
              if (s.id !== activeSession.id) return s;
              const msgs = s.messages.map((m, idx) => {
                if (idx === s.messages.length - 1 && m.sender === 'ai') {
                  return { ...m, text: currentText };
                }
                return m;
              });
              return { ...s, messages: msgs };
            })
          );
        },
        onError: (err) => {
          setIsTyping(false);
          abortControllerRef.current = null;
          let fallbackErrorText = '';
          if (err.status === 429) {
            setRateLimitWarning(err.message);
            fallbackErrorText = 'Hạn mức kết nối hiện tại đang tạm thời đạt giới hạn (Tối đa 10 câu/phút). Em hãy dành chút thời gian suy ngẫm câu hỏi trước khi gửi tiếp nhé!';
          } else if (err.name !== 'AbortError') {
            fallbackErrorText = 'Thầy gặp chút gián đoạn khi kết nối máy chủ AI. Em hãy bấm thử lại hoặc kiểm tra kết nối mạng nhé!';
          }

          if (fallbackErrorText) {
            setSessions(prev => {
              const next = prev.map(s => {
                if (s.id !== activeSession.id) return s;
                const msgs = s.messages.map((m, idx) => {
                  if (idx === s.messages.length - 1 && m.sender === 'ai' && !m.text) {
                    return { ...m, text: fallbackErrorText };
                  }
                  return m;
                });
                return { ...s, messages: msgs };
              });
              aiSessionManager.saveSessions(currentUserId, next);
              return next;
            });
          }
        },
        onComplete: (completedFullText) => {
          setIsTyping(false);
          abortControllerRef.current = null;
          const finalText = (completedFullText || streamedTextRef.current || '').trim() ||
            'Chào em! Thầy đang lắng nghe thắc mắc của em. Em hãy chia sẻ cụ thể hơn về bài tập hoặc hướng suy luận em muốn thầy gợi mở nhé!';

          setSessions(prev => {
            const next = prev.map(s => {
              if (s.id !== activeSession.id) return s;
              const msgs = s.messages.map((m, idx) => {
                if (idx === s.messages.length - 1 && m.sender === 'ai') {
                  return { ...m, text: finalText };
                }
                return m;
              });
              return { ...s, messages: msgs, updatedAt: new Date().toISOString() };
            });
            aiSessionManager.saveSessions(currentUserId, next);
            return next;
          });
        }
      });
    } catch {
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
    } catch {
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

  const quickPrompts = activeSession?.questionLatex ? [
    'Vì sao phương án em chọn lại chưa chính xác?',
    'Gợi ý giúp em bước lập luận đầu tiên',
    'Em chưa hiểu công thức áp dụng cho câu này'
  ] : [
    'Thầy gợi mở giúp em hướng tư duy bài này với ạ',
    'Em đang phân vân giữa phương án A và phương án B',
    'Em chưa biết bắt đầu từ dữ kiện nào của đề bài'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full ${isHistoryOpen ? 'max-w-5xl' : 'max-w-3xl'} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto h-[90vh] max-h-[860px] transition-all duration-300`}>

        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Toggle History Drawer Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 bg-white/10 hover:bg-white/20 text-cyan-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title={isHistoryOpen ? 'Thu gọn lịch sử' : 'Mở lịch sử phiên hỏi'}
            >
              {isHistoryOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              <span className="hidden sm:inline">Lịch Sử</span>
              <span className="px-1.5 py-0.2 bg-blue-500/30 text-[10px] rounded-full border border-blue-400/30 font-bold">
                {sessions.length}
              </span>
            </button>

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <Bot className="w-5 h-5 text-cyan-200" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
                  Gia Sư AI Đồng Hành
                </h2>
                {activeSession?.skill ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold truncate max-w-[160px]">
                    {activeSession.skill}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    Trực tuyến 24/7
                  </span>
                )}
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                  10 lượt/phút
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                {activeSession?.title || 'Hướng dẫn tư duy phản biện từng bước • Không đưa sẵn đáp án'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleCreateNewSession}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Phiên Mới</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
              title="Đóng khung chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Left Sidebar (History) + Right Workspace (Chat) */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Left History Drawer */}
          {isHistoryOpen && (
            <aside className="w-64 sm:w-72 md:w-80 bg-slate-50 border-r border-slate-200/90 flex flex-col shrink-0 animate-fade-in">
              {/* Top Drawer Controls */}
              <div className="p-3 border-b border-slate-200/80 space-y-2">
                <button
                  onClick={handleCreateNewSession}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Bắt đầu phiên hỏi mới</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    placeholder="Tìm theo chủ đề, câu hỏi..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredSessions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs">Không tìm thấy phiên hỏi nào.</p>
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isActive = s.id === activeSession?.id;
                    const msgCount = s.messages?.length || 0;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveSessionId(s.id)}
                        className={`group relative p-2.5 rounded-2xl transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                            : 'bg-white/60 hover:bg-white border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className={`text-xs font-bold truncate flex-1 ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                            {s.title}
                          </h4>
                          <button
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 rounded-md transition-all cursor-pointer shrink-0"
                            title="Xóa phiên hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 gap-1">
                          <span className="truncate max-w-[120px] font-semibold text-slate-500">
                            {s.skill || 'Tự do'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {s.isSynced && (
                              <span title="Đã đồng bộ máy chủ">
                                <Cloud className="w-3 h-3 text-emerald-500" />
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">
                              {msgCount} tin
                            </span>
                            <span>{formatSessionTime(s.updatedAt || s.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Drawer Telemetry / Local Storage Indicator */}
              <div className="p-2.5 border-t border-slate-200/80 bg-white/50 px-3 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-600">Lưu phiên tự động</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Bảo mật riêng tư</span>
              </div>
            </aside>
          )}

          {/* Right Main Chat Panel */}
          <main className="flex-1 flex flex-col justify-between bg-slate-50/30 overflow-hidden min-h-0">

            {/* Context Sticky Banner if active session is linked to an exam question */}
            {activeSession?.questionLatex && (
              <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start justify-between gap-3 shadow-2xs shrink-0">
                <div className="space-y-1 text-xs min-w-0">
                  <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                    <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Đang hỗ trợ câu hỏi bài tập:</span>
                  </div>
                  <div className="text-slate-700 line-clamp-2 font-medium">
                    <MathText text={activeSession.questionLatex} />
                  </div>
                  {activeSession.selectedWrong && (
                    <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1.5 pt-0.5">
                      <span>Phương án em đã chọn:</span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-rose-200 text-rose-800 font-bold">
                        <MathText text={String(activeSession.selectedWrong)} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rate Limit Warning Banner */}
            {rateLimitWarning && (
              <div className="m-3 sm:m-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">{rateLimitWarning}</div>
              </div>
            )}

            {/* Chat Stream Messages */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4">
              {messages.map((m, idx) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={idx} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-start gap-2.5 max-w-[94%] sm:max-w-[85%]">
                      {isAI && (
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                        isAI
                          ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                          : 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                      }`}>
                        {isAI ? (
                          <div className="space-y-2">
                            <MathText text={m.text || '...'} />

                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                              {m.topicLabel ? (
                                <span className="flex items-center gap-1 font-bold text-blue-600">
                                  <Layers className="w-3 h-3 text-blue-500" />
                                  <span>{m.topicLabel}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <HelpCircle className="w-3 h-3 text-slate-400" />
                                  <span>Hướng dẫn giải bài từng bước</span>
                                </span>
                              )}

                              <button
                                onClick={() => setReportingInteraction(m)}
                                className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Góp ý nếu câu trả lời của AI chưa chính xác hoặc khó hiểu"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Góp ý</span>
                              </button>
                            </div>
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
                    <span>Gia sư AI đang phân tích & gợi mở từng bước...</span>
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
            <div className="px-3 sm:px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5 shrink-0">
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

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập thắc mắc hoặc hướng giải của bạn (hỗ trợ công thức: $x^2 + 2x = 0$)..."
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

          </main>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            <span className="truncate">Nếu AI đưa sẵn đáp án thay vì gợi mở tư duy, hãy bấm nút <strong>Góp ý</strong> trên tin nhắn.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all cursor-pointer shrink-0"
          >
            Đóng
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
                <span>Góp Ý Chất Lượng Câu Trả Lời Của AI</span>
              </div>
              <button
                onClick={() => setReportingInteraction(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ý kiến của bạn sẽ được gửi trực tiếp đến Hội đồng Học thuật Mentor để tinh chỉnh phản hồi của Gia sư AI.
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
