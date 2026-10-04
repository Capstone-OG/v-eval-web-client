import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  BookOpen,
  Brain,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { mockMilestone } from '../../data/mockData';
import { practiceService } from '../../services/practiceService';

export default function MilestoneCard({ currentUser, onStartTask, onContinueMilestone, onStartDiagnostic }) {
  const [roadmapData, setRoadmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoRoadmap, setHasNoRoadmap] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Only attempt fetch if user has active session
    const fetchRoadmap = async () => {
      setIsLoading(true);
      try {
        const res = await practiceService.getMyRoadmap();
        if (isMounted) {
          if (res && res.stages && res.stages.length > 0) {
            setRoadmapData(res);
            setHasNoRoadmap(false);
          } else {
            setHasNoRoadmap(true);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
          // 404 means no roadmap generated yet
          if (err.status === 404 || err.response?.status === 404) {
            setHasNoRoadmap(true);
          } else {
            // Fallback to mock data for demo smoothness
            setRoadmapData(null);
            setHasNoRoadmap(false);
          }
        }
      }
    };

    fetchRoadmap();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 rounded-full w-48"></div>
        <div className="h-7 bg-slate-200 rounded-xl w-3/4"></div>
        <div className="h-3 bg-slate-100 rounded-full w-full"></div>
        <div className="space-y-3 pt-4">
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Case: User is logged in but hasn't generated a roadmap yet
  if (hasNoRoadmap) {
    return (
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-blue-300 card-shadow space-y-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Brain className="w-8 h-8 text-cyan-200 animate-pulse" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Chưa có Lộ trình Cá nhân hóa</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Khởi tạo Lộ trình Ôn luyện Thích ứng 120 câu
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bạn hãy hoàn thành bài khảo sát chẩn đoán 30 câu chuẩn khoa học khảo thí IRT. Hệ thống AI sẽ phân tích ma trận năng lực và quy hoạch lộ trình học tập tối ưu theo Vùng phát triển ZPD.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onStartDiagnostic}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Brain className="w-4 h-4 text-cyan-300" />
            <span>Khởi động Bài test Chẩn đoán 30 câu ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-400 font-semibold">
            Thời lượng: ~15 phút • Chuẩn KaTeX & Anti-cheat
          </span>
        </div>
      </div>
    );
  }

  // If real roadmap data exists, map it; otherwise fallback to mockMilestone
  const activeMilestone = roadmapData ? {
    currentMilestoneIndex: 1,
    totalMilestones: roadmapData.totalStages || roadmapData.stages?.length || 4,
    estimatedTime: `${roadmapData.targetWeeklyHours || 6} giờ/tuần`,
    title: roadmapData.stages?.[0]?.stageName || mockMilestone.title,
    progressPercent: Math.round(roadmapData.overallProgressPercent || 35),
    nextMilestoneTitle: roadmapData.stages?.[1]?.stageName || mockMilestone.nextMilestoneTitle,
    tasks: mockMilestone.tasks
  } : mockMilestone;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-6">
      
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            Chặng {activeMilestone.currentMilestoneIndex}/{activeMilestone.totalMilestones} • Thời lượng: {activeMilestone.estimatedTime}
          </span>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1 cursor-pointer">
            <span>Xem danh sách tất cả chặng học</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-3">
          {activeMilestone.title}
        </h2>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Tiến độ chặng hiện tại</span>
            <span className="text-blue-600 font-extrabold">{activeMilestone.progressPercent}% Hoàn thành</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${activeMilestone.progressPercent}%` }}
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
          {activeMilestone.tasks.map((t) => {
            const isDone = t.status === 'completed';
            const isInProg = t.status === 'in_progress';

            return (
              <div 
                key={t.id}
                onClick={() => onStartTask && onStartTask(t)}
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
          <span>Hoàn thành chặng này để mở khóa <strong>{activeMilestone.nextMilestoneTitle}</strong>.</span>
        </div>

        <button 
          onClick={onContinueMilestone}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
        >
          <span>Tiếp tục học chặng này</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
}
