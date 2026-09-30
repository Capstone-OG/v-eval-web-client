import React, { useState } from 'react';
import { Radio, Calendar, Users, ChevronRight, Check } from 'lucide-react';
import { mockLiveSession } from '../../data/mockData';

export default function LiveQnACard() {
  const [isReminderSet, setIsReminderSet] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4">
      
      {/* Live Badge & Time Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-extrabold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>{mockLiveSession.time}</span>
        </div>
        <span className="text-xs font-bold text-slate-400">Thời lượng: {mockLiveSession.duration}</span>
      </div>

      {/* Main Title & Description */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1.5">
          {mockLiveSession.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {mockLiveSession.description}
        </p>
      </div>

      {/* Teacher Profile Box */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <img 
          src={mockLiveSession.teacherAvatar} 
          alt={mockLiveSession.teacherName}
          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/20" 
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-slate-900 truncate">
            {mockLiveSession.teacherName}
          </div>
          <div className="text-[11px] text-slate-500 truncate font-medium">
            {mockLiveSession.teacherTitle}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-xl shrink-0">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>{mockLiveSession.registeredCount + (isReminderSet ? 1 : 0)} đăng ký</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
        <button 
          onClick={() => setIsReminderSet(!isReminderSet)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
            isReminderSet 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          {isReminderSet ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã đặt lịch nhắc thành công</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Đặt lịch nhắc</span>
            </>
          )}
        </button>

        <button className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-all flex items-center gap-1 shrink-0">
          <span>Tất cả buổi Live</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
