import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, RefreshCw, ShieldAlert, CheckCircle2, Square, AlertCircle, Maximize2 } from 'lucide-react';
import { mockAiInitialMessage } from '../../data/mockData';
import { practiceService } from '../../services/practiceService';
import MathText from '../common/MathText';

export default function AISocraticTutorWidget({ onOpenFullChat }) {
  const [messages, setMessages] = useState([
    mockAiInitialMessage
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState(null);

  const abortControllerRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = inputText.trim();
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

    // Placeholder message cho AI streaming
    const aiMsgPlaceholder = {
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      retrievedChunk: 'Đồ thị Tri thức ĐGNL ĐHQG-HCM • GraphRAG Archetype'
    };
    setMessages(prev => [...prev, aiMsgPlaceholder]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await practiceService.askAiTutorStream({
        questionLatex: query,
        signal: controller.signal,
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
                    text: 'Thầy gặp chút gián đoạn kết nối với cơ sở tri thức. Để tư duy bài này, em hãy thử xác định các điều kiện tiên quyết và viết công thức liên quan nhé!'
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

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">AI Socratic Tutor</h3>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Trực tuyến (GraphRAG Powered)</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onOpenFullChat}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Mở toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Trợ lý gợi mở tư duy Socratic:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          AI không cho sẵn đáp án mà đặt câu hỏi phản biện từng bước, giúp em tự phát hiện bẫy ngộ nhận và làm chủ bài tập.
        </p>
      </div>

      {/* Rate Limit Alert */}
      {rateLimitWarning && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{rateLimitWarning}</span>
        </div>
      )}

      {/* Mini Chat Stream Window */}
      <div className="max-h-56 min-h-[140px] overflow-y-auto space-y-2.5 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[92%] font-medium leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
            }`}>
              {m.sender === 'ai' ? (
                <div>
                  <MathText text={m.text || '...'} />
                  {m.retrievedChunk && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">{m.retrievedChunk}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>{m.text}</div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center justify-between p-2 text-slate-500 text-xs font-semibold bg-white rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px]">AI đang truy vấn Tri thức ĐGNL & gợi mở...</span>
            </div>
            <button
              onClick={handleStopStream}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-bold transition-all"
            >
              <Square className="w-2.5 h-2.5 fill-red-600" />
              <span>Dừng</span>
            </button>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="relative">
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập thắc mắc tư duy bài tập (KaTeX: $x^2$)..."
          disabled={isTyping}
          className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 disabled:opacity-60"
        />
        <button 
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button 
          onClick={onOpenFullChat}
          className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all truncate text-center cursor-pointer"
        >
          Gợi mở Socratic (Không đưa giải sẵn)
        </button>
        <button 
          onClick={onOpenFullChat}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
        >
          <span>Mở Chat Toàn Diện</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
}
