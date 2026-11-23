import { Target, TrendingUp, Trophy, BookOpenCheck, Flame, ShieldCheck, ChevronRight } from 'lucide-react';

const formatFriendlyMilestoneTitle = title => String(title || 'Chưa bắt đầu lộ trình')
  .replace(/thích ứng/gi, 'trọng tâm').replace(/\bDAG\b/gi, '').replace(/\s{2,}/g, ' ').trim();

export default function StudentSummaryCards({ data = {}, onOpenRadar, onOpenDAG, onOpenZPD, onOpenAnalytics }) {
  const roadmap = data.roadmapProgress || { completedMilestones: 0, totalMilestones: 0, progressPercentage: 0 };
  const streak = data.streakAnalytics || {};
  const scoreGap = Math.max(0, (data.targetScore || 900) - (data.currentEstimatedScore || 0));
  return (

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* 1. Estimated Score */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 min-h-[230px] border border-slate-200/80 shadow-[0_4px_16px_-5px_rgba(15,23,42,0.18)] hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/20">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Điểm ĐGNL Ước Tính
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200/80 flex items-center gap-1 shadow-2xs">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        Theo bài làm
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                        {data.currentEstimatedScore ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ 1.200 điểm</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-xs flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Khoảng điểm dự kiến:</span>
                    <strong className="text-blue-700 font-black">
                      {data.confidenceInterval || 'Chưa có dữ liệu'}
                    </strong>
                  </div>
                  {onOpenRadar && <button type="button" onClick={onOpenRadar} className="mt-4 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-3 text-left text-xs font-bold text-slate-500 transition-colors hover:text-blue-600"><span>Xem biểu đồ năng lực</span><ChevronRight className="h-4 w-4" /></button>}
                </div>

                {/* 2. Target Score & Deficit */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 min-h-[230px] border border-slate-200/80 shadow-[0_4px_16px_-5px_rgba(15,23,42,0.18)] hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shadow-indigo-500/20">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Khoảng Cách Mục Tiêu
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shadow-2xs ${
                          scoreGap <= 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : scoreGap <= 80
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {scoreGap <= 0 ? '✓ Đạt mục tiêu' : `Cần thêm +${scoreGap} điểm`}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-indigo-600">
                        {data.targetScore ?? 900}
                      </span>
                      <span className="text-xs font-bold text-slate-400">điểm mục tiêu</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-xs flex items-center justify-between">
                    <span className="text-indigo-950 font-medium">Mức độ hoàn thành đích:</span>
                    <strong className="text-indigo-700 font-black">
                      {Math.min(100, Math.round(((data.currentEstimatedScore || 0) / (data.targetScore || 900)) * 100))}%
                    </strong>
                  </div>
                  {onOpenZPD && <button type="button" onClick={onOpenZPD} className="mt-4 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-3 text-left text-xs font-bold text-slate-500 transition-colors hover:text-blue-600"><span>Luyện tập nội dung trọng tâm</span><ChevronRight className="h-4 w-4" /></button>}
                </div>

                {/* 3. Learning Roadmap Progress */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 min-h-[230px] border border-slate-200/80 shadow-[0_4px_16px_-5px_rgba(15,23,42,0.18)] hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20">
                          <BookOpenCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Tiến Độ Lộ Trình Học
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200/80 shadow-2xs">
                        {roadmap.completedMilestones}/{roadmap.totalMilestones} bài học
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600">
                        {roadmap.progressPercentage ?? 0}%
                      </span>
                      <span className="text-xs font-bold text-slate-400">hoàn thành</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, roadmap.progressPercentage || 0)}%` }}
                      />
                    </div>
                    <div
                      className="text-[11px] text-slate-600 font-semibold truncate flex items-center gap-1.5"
                      title={formatFriendlyMilestoneTitle(roadmap.currentMilestoneTitle)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <span className="truncate">
                        Đang học:{' '}
                        <strong className="text-slate-900">
                          {formatFriendlyMilestoneTitle(roadmap.currentMilestoneTitle)}
                        </strong>
                      </span>
                    </div>
                  </div>
                  {onOpenDAG && <button type="button" onClick={onOpenDAG} className="mt-4 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-3 text-left text-xs font-bold text-slate-500 transition-colors hover:text-blue-600"><span>Xem chi tiết lộ trình</span><ChevronRight className="h-4 w-4" /></button>}
                </div>

                {/* 4. Active Streak Summary */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 min-h-[230px] border border-slate-200/80 shadow-[0_4px_16px_-5px_rgba(15,23,42,0.18)] hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs shadow-orange-500/25">
                          <Flame className="w-4 h-4 fill-white" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Chuỗi Ngày Chuyên Cần
                        </span>
                      </div>
                      {streak.hasStreakFreeze ? (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-extrabold border border-cyan-200/80 flex items-center gap-1 shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-cyan-600" />
                          Bảo vệ chuỗi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-extrabold border border-orange-200/80 flex items-center gap-1 shadow-2xs">
                          <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                          Duy trì nhịp học
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 my-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-orange-600">
                        {streak.currentStreak ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-500">ngày liên tiếp</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100/80 text-xs flex items-center justify-between">
                    <span className="text-orange-950 font-medium">Kỷ lục tốt nhất:</span>
                    <strong className="text-orange-700 font-black">{streak.longestStreak ?? 0} ngày</strong>
                  </div>
                  {onOpenAnalytics && <button type="button" onClick={onOpenAnalytics} className="mt-4 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-3 text-left text-xs font-bold text-slate-500 transition-colors hover:text-blue-600"><span>Xem chi tiết học tập</span><ChevronRight className="h-4 w-4" /></button>}
                </div>
              </div>


  );
}
