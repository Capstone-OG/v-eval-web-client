import React from 'react';
import { 
  PlayCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { mockMilestone } from '../../data/mockData';

export default function MilestoneCard({ onStartTask, onContinueMilestone }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-6">
      
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            Chặng {mockMilestone.currentMilestoneIndex}/{mockMilestone.totalMilestones} • Thời lượng dự kiến: {mockMilestone.estimatedTime}
          </span>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1">
            <span>Xem danh sách tất cả chặng học</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-3">
          {mockMilestone.title}
        </h2>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Tiến độ chặng hiện tại</span>
            <span className="text-blue-600 font-extrabold">{mockMilestone.progressPercent}% Hoàn thành</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${mockMilestone.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Nhiệm vụ trọng tâm hôm nay</span>
        </div>

        <div className="space-y-3">
          {mockMilestone.tasks.map((t) => {
            const isDone = t.status === 'completed';
            const isInProg = t.status === 'in_progress';

            return (
              <div 
                key={t.id}
                onClick={() => onStartTask(t)}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone 
                    ? 'bg-slate-50/70 border-slate-200 opacity-90' 
                    : isInProg 
                      ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/10 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : isInProg 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t.type === 'video' ? (
                      <PlayCircle className="w-5 h-5" />
                    ) : t.type === 'quiz' ? (
                      <HelpCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold ${isDone ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {t.meta}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                  isDone 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : isInProg 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlock Footer Note & Main Action Button */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Hoàn thành chặng này để mở khóa <strong>{mockMilestone.nextMilestoneTitle}</strong>.</span>
        </div>

        <button 
          onClick={onContinueMilestone}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <span>Tiếp tục học chặng này</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
}
