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
  BarChart3
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import ScorePredictionPanel from './ScorePredictionPanel';
import StudentEarlyWarningsCard from './StudentEarlyWarningsCard';

const SHORT_DOMAIN_LABELS = {
  DOM_LANG: 'Ngôn ngữ (Việt - Anh)',
  DOM_MATH: 'Toán & Tư duy Logic',
  DOM_NAT_SCI: 'Khoa học Tự nhiên',
  DOM_SOC_SCI: 'Khoa học Xã hội'
};

const WEEKDAY_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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
  const [onboardingOverride, setOnboardingOverride] = useState(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState('all'); // 'all' | 'flow6' | 'flow5'

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
      setOnboardingOverride(null);
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
          Đang tổng hợp dữ liệu Phân tích Năng lực Học tập (Core Flow 5)...
        </div>
        <div className="text-xs text-slate-500">
          Đồng bộ ma trận BKT, chuỗi chuyên cần 7 ngày và biểu đồ Radar 4 miền từ Practice Service
        </div>
      </div>
    );
  }

  const data = dashboard || {};
    const hasHistory =
    (Array.isArray(data.recentMockExams) && data.recentMockExams.length > 0) ||
    Number(data.currentEstimatedScore || 0) > 0 ||
    practiceService.getRealUserSubmissions(currentUser?.id).length > 0;
  const isOnboarding =
    onboardingOverride !== null
      ? onboardingOverride
      : (hasHistory ? false : Boolean(data.needsOnboarding));
  const studentDisplayName =
    currentUser?.fullName ||
    (data.fullName && data.fullName !== 'Học sinh V-Eval' ? data.fullName : 'Học sinh V-Eval');

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

  const roadmap = data.roadmapProgress || {
    totalMilestones: 0,
    completedMilestones: 0,
    progressPercentage: 0,
    currentMilestoneTitle: 'Chưa khởi tạo lộ trình'
  };

  const mockExams = data.recentMockExams || [];
  const scoreGap = Math.max(0, (data.targetScore || 900) - (data.currentEstimatedScore || 0));

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 lg:p-7 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Core Flow 5 & 6 • Analytics, SEM Forecast & Knapsack ROI
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                data._source === 'backend'
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : data._source === 'local_history'
                    ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-200'
                    : 'bg-amber-500/20 border-amber-400/30 text-amber-200'
              }`}
            >
              {data._source === 'backend'
                ? '● Live Gateway API (:5212)'
                : data._source === 'local_history'
                  ? '● Đồng bộ Lịch sử Khảo sát'
                  : '● Dữ liệu chuẩn Seed CSDL'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Trung Tâm Phân Tích Học Tập & Đa Giác Năng Lực ĐGNL
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Theo dõi thời gian thực điểm ước tính IRT 2PL, đối sánh Radar 4 miền năng lực chuẩn V-ACT ĐHQG TP.HCM, tiến độ đồ thị tiên quyết DAG và chuỗi kỷ luật tự học 7 ngày liên tiếp của{' '}
            <strong className="text-white">{studentDisplayName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeRole !== 'student' && onNavigateRoleDashboard && (
            <button
              onClick={onNavigateRoleDashboard}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all shadow-md"
            >
              Mở Ma Trận Nhiệt Vai Trò ({activeRole.toUpperCase()})
            </button>
          )}

          <button
            onClick={() => setOnboardingOverride(!isOnboarding)}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 transition-all"
            title="Chuyển đổi kiểm thử trạng thái học sinh mới chưa làm bài chẩn đoán (needsOnboarding)"
          >
            {isOnboarding ? 'Xem Chế Độ Đã Có Dữ Liệu' : 'Xem Thử Ghost Onboarding'}
          </button>

          <button
            onClick={() => {
              setOnboardingOverride(null);
              loadAnalytics(true);
            }}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới số liệu</span>
          </button>
        </div>
      </div>

      {/* GHOST ONBOARDING STATE (AD-5A: needsOnboarding === true) */}
      {isOnboarding ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-blue-300 p-8 lg:p-10 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider">
              Khởi tạo hồ sơ năng lực ban đầu (Onboarding State)
            </span>
            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900">
              Bạn chưa có dữ liệu chẩn đoán năng lực IRT 2PL đầu vào!
            </h2>
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
              Hoàn thành bài Khảo sát Chẩn đoán 30 câu chuẩn cấu trúc V-ACT để hệ thống ước lượng vector năng lực{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">Theta_0</code>, vẽ biểu đồ Radar 4 miền và mở khóa lộ trình học tập thích ứng DAG cá nhân hóa.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartDiagnostic}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Bắt Đầu Bài Khảo Sát Chẩn Đoán 30 Câu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Sub-Navigation Pills for Flow 5 & Flow 6 */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Tổng Hợp Toàn Diện (Flow 5 & 6)' },
                { id: 'flow6', label: 'Dự Báo Điểm SEM & Toa Thuốc ROI (Flow 6)' },
                { id: 'flow5', label: 'Đa Giác Năng Lực & Chuỗi Chuyên Cần (Flow 5)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAnalyticsSubTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    analyticsSubTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {onOpenMistakesSM2 && (
              <button
                type="button"
                onClick={onOpenMistakesSM2}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
              >
                <span>Mở Sổ Tay Lỗi Sai SM-2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {analyticsSubTab !== 'flow5' && (
            <div className="space-y-6">
              <ScorePredictionPanel
                studentId={currentUser?.id}
                mode="full"
                onOpenAiTutorWithContext={onOpenAiTutor}
              />
              <StudentEarlyWarningsCard studentId={currentUser?.id} />
            </div>
          )}

          {analyticsSubTab !== 'flow6' && (
            <>
          {/* TOP 4 SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 1. Estimated Score */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Điểm ĐGNL Ước Tính
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {data.theta0 !== undefined && data.theta0 !== null
                    ? `Theta ${data.theta0 > 0 ? `+${data.theta0}` : data.theta0}`
                    : 'IRT 2PL'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-slate-900">{data.currentEstimatedScore ?? 0}</span>
                <span className="text-xs font-bold text-slate-400">/ 1200 điểm</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Dải tin cậy 95% SEM:</span>
                <strong className="text-blue-700 font-extrabold">{data.confidenceInterval || 'Chưa có dữ liệu'}</strong>
              </div>
            </div>

            {/* 2. Target Score & Deficit */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Khoảng Cách Mục Tiêu
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${
                    scoreGap <= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : scoreGap <= 80
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {scoreGap <= 0 ? 'Đạt mục tiêu' : `Cần bù +${scoreGap}đ`}
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-indigo-600">{data.targetScore ?? 900}</span>
                <span className="text-xs font-bold text-slate-400">điểm mục tiêu</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between">
                <span className="text-indigo-900 font-semibold">Tiến độ tiệm cận đích:</span>
                <strong className="text-indigo-700 font-extrabold">
                  {Math.min(100, Math.round(((data.currentEstimatedScore || 0) / (data.targetScore || 900)) * 100))}%
                </strong>
              </div>
            </div>

            {/* 3. DAG Roadmap Progress */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tiến Độ Lộ Trình DAG
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200">
                  {roadmap.completedMilestones}/{roadmap.totalMilestones} chặng
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-emerald-600">{roadmap.progressPercentage ?? 0}%</span>
                <span className="text-xs font-bold text-slate-400">hoàn thành</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, roadmap.progressPercentage || 0)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-600 font-semibold truncate" title={roadmap.currentMilestoneTitle}>
                  Đang học: <strong className="text-slate-900">{roadmap.currentMilestoneTitle}</strong>
                </div>
              </div>
            </div>

            {/* 4. Active Streak Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Chuỗi Ngày Chuyên Cần
                </span>
                {streak.hasStreakFreeze && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-extrabold border border-cyan-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Khiên bảo vệ
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <Flame className="w-7 h-7 text-orange-500 fill-orange-500 shrink-0 self-center" />
                <span className="text-3xl font-black text-orange-600">{streak.currentStreak ?? 0}</span>
                <span className="text-xs font-bold text-slate-500">ngày liên tiếp</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-xs flex items-center justify-between">
                <span className="text-orange-900 font-semibold">Kỷ lục dài nhất:</span>
                <strong className="text-orange-700 font-extrabold">{streak.longestStreak ?? 0} ngày</strong>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN ANALYTICS GRID: 4-DOMAIN RADAR + 7-DAY STREAK & DOMAIN BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Dual Polygon 4-Domain Radar Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span>Biểu Đồ Đa Giác Năng Lực 4 Miền Chuẩn ĐGNL (Dual Radar)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đối sánh mức độ làm chủ thực tế từ bài làm so với chuẩn đầu ra ngành mục tiêu
                    </p>
                  </div>
                  <button
                    onClick={onOpenRoadmap}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mở Dàn Kiến Thức</span>
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
                        name="Năng lực hiện tại (%)"
                        dataKey="studentScore"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fill="#3B82F6"
                        fillOpacity={0.35}
                      />
                      <Radar
                        name="Chuẩn mục tiêu (%)"
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
                          Hiện tại: <strong className="text-slate-900">{dom.studentScore}%</strong> • Đích:{' '}
                          <strong>{dom.targetScore}%</strong>
                        </div>
                      </div>
                      {needsBoost ? (
                        <button
                          onClick={onOpenZPD}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Bù +{dom.gap}%</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold shrink-0">
                          Đạt chuẩn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 cols: 7-Day Streak Tracker + Recent Diagnostic & Mock Exams */}
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
                        Nhịp Độ Kỷ Luật Tự Học 7 Ngày Qua
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Ghi nhận khi hoàn thành Khảo sát ĐGNL, ≥ 15 phút video hoặc ≥ 1 bài Quiz ZPD
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
                    {streak.isTodayCompleted ? 'Hôm nay: Đã hoàn thành' : 'Hôm nay: Chưa học'}
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
                        ? 'Đang kích hoạt 01 Khiên bảo vệ chuỗi chuyên cần (Streak Freeze).'
                        : 'Hoàn thành đủ 7 ngày liên tiếp để nhận thêm Khiên bảo vệ chuỗi.'}
                    </span>
                  </div>
                  <button
                    onClick={onOpenZPD}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shrink-0"
                  >
                    Luyện ZPD
                  </button>
                </div>
              </div>

              {/* Recent Diagnostic & Mock Exams Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                      <span>Lịch Sử Bài Khảo Sát & Thi Thử ĐGNL Gần Nhất</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Bấm vào Lịch sử làm bài để xem lại đáp án & hỏi Gia sư AI Socratic
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
                    <div className="text-xs font-bold text-slate-700">Chưa có bài khảo sát hoặc thi thử nào</div>
                    <button
                      onClick={onStartDiagnostic}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Làm Đề Khảo Sát Ngay
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
                            <div className="text-xs font-extrabold text-slate-900 truncate">{exam.examTitle}</div>
                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Đúng {exam.totalCorrect}/{exam.totalQuestions} câu ({accPct}%)
                              </span>
                              {exam.theta0 !== undefined && exam.theta0 !== null && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                                  Theta: {exam.theta0 > 0 ? `+${exam.theta0}` : exam.theta0}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(exam.completedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-base font-black text-indigo-700">{exam.score}đ</div>
                            <button
                              onClick={onOpenHistory}
                              className="text-[10px] font-extrabold text-blue-600 hover:underline"
                            >
                              Xem & Hỏi AI
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
                  <span>Nhờ Gia Sư AI Socratic Phân Tích Lỗ Hổng Từ Lịch Sử Thi</span>
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
