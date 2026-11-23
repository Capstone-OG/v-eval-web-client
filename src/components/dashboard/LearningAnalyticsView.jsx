import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import {
  Flame,
  ShieldCheck,
  Target,
  TrendingUp,
  GitFork,
  Award,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  Zap,
  Bot,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity,
  Bell,
  Compass
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import ScorePredictionPanel from './ScorePredictionPanel';
import StudentSummaryCards from './StudentSummaryCards';
import StudentEarlyWarningsCard from './StudentEarlyWarningsCard';

const SHORT_DOMAIN_LABELS = {
  DOM_LANG: 'Ngôn ngữ (Việt - Anh)',
  DOM_MATH: 'Toán & Tư duy Logic',
  DOM_NAT_SCI: 'Khoa học Tự nhiên',
  DOM_SOC_SCI: 'Khoa học Xã hội'
};

const WEEKDAY_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatFriendlyExamTitle(rawTitle) {
  const title = String(rawTitle || '').trim();
  if (!title) return 'Bài luyện tập ĐGNL';
  if (/ZPD\s*&\s*BKT|Phiếu Luyện Tập Thích Ứng/i.test(title)) {
    return 'Bài luyện tập chuyên đề';
  }
  return title
    .replace(/\s*\(Flow\s*\d+\)/gi, '')
    .replace(/\s*\(Core Flow\s*\d+\)/gi, '')
    .replace(/\bIRT\s*2PL\b/gi, '')
    .replace(/\bZPD\b/gi, '')
    .replace(/\bBKT\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}


export default function LearningAnalyticsView({
  currentUser,
  activeRole = 'student',
  initialData = null,
  onStartDiagnostic,
  onOpenRoadmap,
  onOpenZPD,
  onOpenHistory,
  onOpenMistakesSM2,
  onOpenAiTutor,
  onNavigateRoleDashboard
}) {
  const [dashboard, setDashboard] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsSubTab, setAnalyticsSubTab] = useState('flow5');

  const loadAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading((prev) => prev && !dashboard);
      try {
        const res = await practiceService.getStudentDashboard(currentUser?.id);
        setDashboard(res);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser?.id]
  );

  useEffect(() => {
    loadAnalytics(false);
  }, [loadAnalytics]);

  useEffect(() => {
    if (initialData) {
      setDashboard(initialData);
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    const handleSubmissionUpdated = () => {
      loadAnalytics(true);
    };
    window.addEventListener('veval:submission-updated', handleSubmissionUpdated);
    return () => window.removeEventListener('veval:submission-updated', handleSubmissionUpdated);
  }, [loadAnalytics]);

  const rollingDaySlots = useMemo(() => {
    const today = new Date();
    const slots = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      slots.push({
        shortLabel: offset === 0 ? 'Hôm nay' : WEEKDAY_VN[d.getDay()],
        dateLabel: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        isToday: offset === 0
      });
    }
    return slots;
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs animate-pulse space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-sm font-extrabold text-slate-800">
          Đang tải kết quả học tập của bạn...
        </div>
        <div className="text-xs text-slate-500">
          Đang tổng hợp điểm dự kiến, tiến độ ôn luyện các môn và lịch sử làm bài gần đây
        </div>
      </div>
    );
  }

  const data = dashboard || {};
  const hasHistory =
    (Array.isArray(data.recentMockExams) && data.recentMockExams.length > 0) ||
    Number(data.currentEstimatedScore || 0) > 0 ||
    practiceService.getRealUserSubmissions(currentUser?.id).length > 0;
  const isOnboarding = hasHistory ? false : Boolean(data.needsOnboarding);
  const studentDisplayName =
    currentUser?.fullName ||
    (data.fullName && data.fullName !== 'Học sinh V-Eval' ? data.fullName : 'Học sinh');

  const radarItems = (data.radarCompetency || []).map((item) => ({
    domainCode: item.domainCode,
    subject: SHORT_DOMAIN_LABELS[item.domainCode] || item.domainName,
    fullName: item.domainName,
    studentScore: Number(item.studentScore || 0),
    targetScore: Number(item.targetScore || 80),
    gap: Number(((item.targetScore || 80) - (item.studentScore || 0)).toFixed(1))
  }));

  const streak = data.streakAnalytics || {
    currentStreak: 0,
    longestStreak: 0,
    hasStreakFreeze: false,
    isTodayCompleted: false,
    weeklyActivityDays: [false, false, false, false, false, false, false]
  };


  const mockExams = data.recentMockExams || [];

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 lg:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Kết quả học tập & Dự báo điểm thi
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 border-emerald-400/30 text-emerald-300">
              ● Cập nhật theo bài làm mới nhất
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Báo cáo học tập của bạn
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Theo dõi điểm thi dự kiến, mức độ nắm vững 4 lĩnh vực kiến thức ĐGNL, tiến độ lộ trình ôn tập và thói quen học tập hằng ngày của{' '}
            <strong className="text-white">{studentDisplayName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeRole !== 'student' && onNavigateRoleDashboard && (
            <button
              onClick={onNavigateRoleDashboard}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all shadow-md"
            >
              Về bảng theo dõi lớp học
            </button>
          )}

          <button
            onClick={() => {
              loadAnalytics(true);
            }}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* NEW STUDENT EMPTY STATE */}
      {isOnboarding ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-blue-300 p-8 lg:p-10 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider">
              Bắt đầu lộ trình ôn luyện
            </span>
            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900">
              Bạn chưa làm bài kiểm tra đánh giá đầu vào!
            </h2>
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
              Hãy hoàn thành bài khảo sát đầu vào 30 câu theo cấu trúc ĐGNL để biết ngay điểm mạnh, điểm yếu ở từng môn và nhận lộ trình ôn tập phù hợp nhất với mục tiêu của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartDiagnostic}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Làm Bài Kiểm Tra Đầu Vào (30 Câu)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <nav aria-label="Các mục báo cáo" className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-3 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.22)] sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">KHÁM PHÁ BÁO CÁO</p>
              {onOpenMistakesSM2 && <button type="button" onClick={onOpenMistakesSM2} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700"><BookOpenCheck className="h-3.5 w-3.5" />Sổ tay lỗi sai<ArrowRight className="h-3 w-3" /></button>}
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-100/70 p-2 sm:grid-cols-3 sm:gap-3 sm:p-2.5">
              {[
                { id: 'flow5', label: 'Năng lực & Tiến độ', description: 'Bạn đã tiến bộ đến đâu?', icon: Activity,
                  selected: 'border-blue-200/60 bg-white shadow-[0_6px_18px_-5px_rgba(37,99,235,0.32),0_2px_5px_rgba(15,23,42,0.06)]', iconTone: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/30', text: 'text-blue-800', line: 'bg-blue-500' },
                { id: 'flow6', label: 'Dự báo & Đơn học tập', description: 'Khoảng cách đến mục tiêu', icon: TrendingUp,
                  selected: 'border-teal-200/60 bg-white shadow-[0_6px_18px_-5px_rgba(13,148,136,0.32),0_2px_5px_rgba(15,23,42,0.06)]', iconTone: 'bg-gradient-to-br from-teal-400 to-teal-700 text-white shadow-teal-500/30', text: 'text-teal-800', line: 'bg-teal-500' },
                { id: 'alerts', label: 'Nhắc nhở học tập', description: 'Những điều bạn cần chú ý', icon: Bell,
                  selected: 'border-violet-200/60 bg-white shadow-[0_6px_18px_-5px_rgba(124,58,237,0.32),0_2px_5px_rgba(15,23,42,0.06)]', iconTone: 'bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-violet-500/30', text: 'text-violet-800', line: 'bg-violet-500' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = analyticsSubTab === tab.id;
                return <button key={tab.id} type="button" aria-pressed={isActive} onClick={() => setAnalyticsSubTab(tab.id)}
                  className={`relative flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${isActive ? tab.selected : 'border-white/80 bg-white shadow-[0_4px_12px_-2px_rgba(15,23,42,0.14),0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-[0_6px_16px_-2px_rgba(15,23,42,0.18)]'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? `${tab.iconTone} shadow-lg` : 'bg-white text-slate-400 ring-1 ring-slate-200/70'}`}><Icon className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0 flex-1"><span className={`block text-xs font-bold leading-relaxed sm:text-[13px] ${isActive ? tab.text : 'text-slate-600'}`}>{tab.label}</span><span className="mt-0.5 block text-[11px] leading-relaxed text-slate-400">{tab.description}</span></span>
                  {isActive && <><span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${tab.line}`} /><span aria-hidden="true" className={`absolute inset-x-5 bottom-0 h-0.5 rounded-t-full ${tab.line}`} /></>}
                </button>;
              })}
            </div>
          </nav>
          {analyticsSubTab === 'flow6' && (
            <div className="space-y-6">
              <ScorePredictionPanel
                studentId={currentUser?.id || currentUser?.userId}
                mode="full"
                onOpenAiTutorWithContext={onOpenAiTutor}
              />

            </div>
          )}

          {analyticsSubTab === 'alerts' && <StudentEarlyWarningsCard studentId={currentUser?.id || currentUser?.userId} />}

          {analyticsSubTab === 'flow5' && (
            <>
              <StudentSummaryCards data={data} />

              {/* MAIN 2-COLUMN ANALYTICS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 cols: 4-Domain Radar Chart */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span>Mức Độ Nắm Vững 4 Lĩnh Vực ĐGNL</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          So sánh kết quả hiện tại của bạn với mức cần đạt ở từng nhóm môn
                        </p>
                      </div>
                      <button
                        onClick={onOpenRoadmap}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all"
                      >
                        <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Xem lộ trình học</span>
                      </button>
                    </div>

                    <div className="h-80 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="76%" data={radarItems}>
                          <PolarGrid stroke="#CBD5E1" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 700 }}
                          />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                          <Radar
                            name="Kết quả hiện tại (%)"
                            dataKey="studentScore"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            fill="#3B82F6"
                            fillOpacity={0.35}
                          />
                          <Radar
                            name="Mức mục tiêu (%)"
                            dataKey="targetScore"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            fill="#FBBF24"
                            fillOpacity={0.12}
                          />
                          <Tooltip
                            formatter={(val, name) => [`${val}%`, name]}
                            contentStyle={{
                              borderRadius: '14px',
                              border: '1px solid #E2E8F0',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Domain Gap Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                    {radarItems.map((dom) => {
                      const needsBoost = dom.gap > 5;
                      return (
                        <div
                          key={dom.domainCode}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                            needsBoost
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-emerald-50/50 border-emerald-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">{dom.subject}</div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Hiện tại: <strong className="text-slate-900">{dom.studentScore}%</strong> • Mục tiêu:{' '}
                              <strong>{dom.targetScore}%</strong>
                            </div>
                          </div>
                          {needsBoost ? (
                            <button
                              onClick={onOpenZPD}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shrink-0 flex items-center gap-1 shadow-xs"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Ôn thêm +{dom.gap}%</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold shrink-0">
                              Đạt mục tiêu
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 5 cols: 7-Day Streak Tracker + Recent Exams */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 7-Day Active Study Streak Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Flame className="w-5 h-5 fill-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Thói Quen Tự Học 7 Ngày Qua
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Tính khi hoàn thành đề khảo sát, xem bài giảng từ 15 phút hoặc làm 1 bài luyện tập
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          streak.isTodayCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {streak.isTodayCompleted ? 'Hôm nay: Đã học' : 'Hôm nay: Chưa học'}
                      </span>
                    </div>

                    {/* 7-Day Checkmarks */}
                    <div className="grid grid-cols-7 gap-2 pt-1">
                      {rollingDaySlots.map((slot, idx) => {
                        const active = Boolean(streak.weeklyActivityDays?.[idx]);
                        return (
                          <div
                            key={idx}
                            title={slot.dateLabel}
                            className={`p-2 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                              active
                                ? 'bg-orange-50 border-orange-200 text-orange-700'
                                : slot.isToday
                                  ? 'bg-blue-50/50 border-blue-200 text-slate-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[9px] font-extrabold uppercase truncate max-w-full">
                              {slot.shortLabel}
                            </span>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                active ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {active ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-[9px] font-semibold opacity-75">{slot.dateLabel}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>
                          {streak.hasStreakFreeze
                            ? 'Bạn đang có 01 lượt giữ chuỗi ngày học khi bận đột xuất.'
                            : 'Học đều 7 ngày liên tiếp để nhận thêm lượt bảo vệ chuỗi ngày học.'}
                        </span>
                      </div>
                      <button
                        onClick={onOpenZPD}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shrink-0"
                      >
                        Luyện tập ngay
                      </button>
                    </div>
                  </div>

                  {/* Recent Exams Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                          <span>Lịch Sử Làm Bài Gần Đây</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Chọn bài làm để xem lại đáp án chi tiết và hỏi Gia sư AI câu chưa hiểu
                        </p>
                      </div>
                      <button
                        onClick={onOpenHistory}
                        className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <span>Xem tất cả</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {mockExams.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <AlertCircle className="w-5 h-5 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-700">Bạn chưa có bài kiểm tra hay luyện tập nào</div>
                        <button
                          onClick={onStartDiagnostic}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                        >
                          Làm bài kiểm tra ngay
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {mockExams.map((exam) => {
                          const accPct =
                            exam.totalQuestions > 0
                              ? Math.round((exam.totalCorrect / exam.totalQuestions) * 100)
                              : 0;
                          return (
                            <div
                              key={exam.submissionId}
                              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-extrabold text-slate-900 truncate">
                                  {formatFriendlyExamTitle(exam.examTitle)}
                                </div>
                                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Đúng {exam.totalCorrect}/{exam.totalQuestions} câu ({accPct}%)
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {new Date(exam.completedAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-base font-black text-indigo-700">{exam.score} điểm</div>
                                <button
                                  onClick={onOpenHistory}
                                  className="text-[10px] font-extrabold text-blue-600 hover:underline"
                                >
                                  Xem đáp án
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={() => onOpenAiTutor && onOpenAiTutor(null)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
                    >
                      <Bot className="w-4 h-4 text-amber-400" />
                      <span>Nhờ Gia Sư AI Giải Đáp Các Câu Hay Sai</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
