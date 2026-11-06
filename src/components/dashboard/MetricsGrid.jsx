import React from 'react';
import {
  TrendingUp,
  Flame,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function MetricsGrid({
  studentDashboard,
  onOpenRadar,
  onOpenDAG,
  onOpenZPD,
  onOpenAnalytics
}) {
  const estimatedScore = Number(studentDashboard?.currentEstimatedScore ?? 0);
  const confidenceInterval = studentDashboard?.confidenceInterval || 'Chưa có dữ liệu';
  const roadmap = studentDashboard?.roadmapProgress || {
    completedMilestones: 0,
    totalMilestones: 0,
    progressPercentage: 0,
    currentMilestoneTitle: 'Chưa khởi tạo lộ trình'
  };
  const streak = studentDashboard?.streakAnalytics || {
    currentStreak: 0,
    longestStreak: 0,
    hasStreakFreeze: false,
    weeklyActivityDays: [false, false, false, false, false, false, false]
  };

  const weakDomains = (studentDashboard?.radarCompetency || [])
    .filter((d) => Number(d.studentScore) < Number(d.targetScore))
    .sort((a, b) => a.studentScore - b.studentScore);

  const displayedGaps = weakDomains.slice(0, 2).map((d) => ({
    id: d.domainCode,
    name: `${d.domainName} (${d.studentScore}% / ${d.targetScore}%)`
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 my-6">
      {/* CARD 1: IRT Score Estimation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-blue-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Năng lực ước tính (IRT)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Flow 5
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{estimatedScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 1200 điểm</span>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
            <span>Dải dự báo tự tin:</span>
            <strong className="text-blue-700 font-bold">{confidenceInterval}</strong>
          </div>
        </div>

        <button
          onClick={onOpenRadar}
          className="w-full flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2 border-t border-slate-100"
        >
          <span>Xem biểu đồ Radar 4 miền</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 2: 7-Day Study Streak & Discipline (Core Flow 5) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-orange-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Chuỗi chuyên cần 7 ngày
            </span>
            {streak.hasStreakFreeze && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[11px] font-bold border border-cyan-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Freeze
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 self-center" />
            <span className="text-3xl font-extrabold text-orange-600 tracking-tight">
              {streak.currentStreak}
            </span>
            <span className="text-xs font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md">
              ngày liên tiếp
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 bg-orange-50/50 p-2 rounded-xl border border-orange-100/80 mb-4">
            {(streak.weeklyActivityDays || [true, true, true, true, true, true, true])
              .slice(0, 7)
              .map((done, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                    done
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {idx === 6 ? 'CN' : `T${idx + 2}`}
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={onOpenAnalytics}
          className="w-full flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700 pt-2 border-t border-slate-100"
        >
          <span>Mở Trung tâm Phân tích Flow 5</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 3: Adaptive DAG Roadmap */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-indigo-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Lộ trình học thích ứng (DAG)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {roadmap.completedMilestones}/{roadmap.totalMilestones} mốc
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
              {roadmap.progressPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">hoàn thành</span>
          </div>

          <div className="space-y-1.5 mb-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, roadmap.progressPercentage || 0)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate" title={roadmap.currentMilestoneTitle}>
              Hiện tại: <strong className="text-slate-800">{roadmap.currentMilestoneTitle}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenDAG}
          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700 pt-2 border-t border-slate-100"
        >
          <span>Xem toàn bộ Lộ trình DAG</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* CARD 4: Knowledge Gap Early Warning */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-amber-300 transition-all group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Miền năng lực cần bù đắp
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Cần tối ưu
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {String(displayedGaps.length).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-slate-500">mảng dưới ngưỡng đích</span>
          </div>

          <div className="space-y-1 mb-4 text-xs font-semibold text-slate-700">
            {displayedGaps.length > 0 ? (
              displayedGaps.map((sk) => (
                <div
                  key={sk.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50/60 border border-amber-100 text-[11px] truncate"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">{sk.name}</span>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                Làm bài khảo sát 30 câu để xác định miền năng lực cần bù đắp
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onOpenZPD}
          className="w-full flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700 pt-2 border-t border-slate-100"
        >
          <span>Luyện tập thích ứng ZPD ngay</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
