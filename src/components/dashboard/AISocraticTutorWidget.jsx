import React, { useState } from 'react';
import { Bot, Sparkles, Send, RefreshCw, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { mockAiInitialMessage } from '../../data/mockData';

export default function AISocraticTutorWidget({ onOpenFullChat }) {
  const [messages, setMessages] = useState([
    mockAiInitialMessage
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI Socratic SSE Stream response
    setTimeout(() => {
      const aiReply = {
        sender: 'ai',
        text: 'Thầy hiểu hướng suy luận của em! Nhìn vào giả thiết: "Mọi mệnh đề P đều kéo theo Q". Nếu P sai, ta có thể khẳng định chắc chắn Q sai được không? Em hãy thử vẽ biểu đồ Venn của tập hợp P và Q nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourceConfidence: 0.96,
        retrievedChunk: 'Giáo trình ĐGNL ĐHQG-HCM - Chuyên đề 4: Biểu đồ Venn & Mệnh đề kéo theo'
      };
      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">AI Socratic Tutor</h3>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Trực tuyến 24/7 (RAG Powered)</span>
            </div>
          </div>
        </div>

        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
          BR-05 Similarity ≥ 0.78
        </span>
      </div>

      {/* Summary Box */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Tóm tắt phiên học gần nhất:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Em vừa làm sai câu 8 phần Suy luận logic. AI Tutor đã truy vấn giáo trình chuẩn và sẵn sàng hướng dẫn từng bước.
        </p>
      </div>

      {/* Mini Chat Stream Window */}
      <div className="max-h-48 overflow-y-auto space-y-2.5 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[90%] font-medium leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
            }`}>
              {m.text}
              {m.retrievedChunk && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span className="truncate">{m.retrievedChunk}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-2 text-slate-400 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>AI đang truy vấn RAG & suy luận Socratic...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="relative">
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập thắc mắc tư duy bài tập..."
          className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Action Buttons matching screenshot bottom right */}
      <div className="flex items-center gap-2 pt-1">
        <button 
          onClick={onOpenFullChat}
          className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all truncate"
        >
          Gợi mở Socratic (Không đưa giải sẵn)
        </button>
        <button 
          onClick={onOpenFullChat}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs shrink-0"
        >
          Mô phỏng như AI
        </button>
      </div>

    </div>
  );
}
