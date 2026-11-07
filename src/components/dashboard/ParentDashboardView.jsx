import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Flame,
  ShieldCheck,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import StudentEarlyWarningsCard from './StudentEarlyWarningsCard';
import { toast } from '../../context/ToastContext';

const TIER_MAP = {
  READY: {
    label: 'Sẵn sàng chinh phục nguyện vọng',
    badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    scoreCls: 'text-emerald-600'
  },
  NEAR_READY: {
    label: 'Tiệm cận ngưỡng an toàn',
    badgeCls: 'bg-amber-100 text-amber-800 border-amber-200',
    scoreCls: 'text-amber-600'
  },
  AT_RISK: {
    label: 'Cần tăng cường kèm cặp ngay',
    badgeCls: 'bg-rose-100 text-rose-800 border-rose-200',
    scoreCls: 'text-rose-600'
  }
};

const DISCIPLINE_MAP = {
  EXCEEDED_GOAL: {
    label: 'Vượt định mức 12 giờ/tuần',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  ON_TRACK: {
    label: 'Đúng tiến độ cam kết',
    cls: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  NEEDS_IMPROVEMENT: {
    label: 'Chưa đủ định mức 12 giờ/tuần',
    cls: 'bg-amber-100 text-amber-800 border-amber-200'
  }
};

export default function ParentDashboardView({ currentUser }) {
  const [portalData, setPortalData] = useState(null);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadParentPortal = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await practiceService.getParentDashboard(currentUser?.id);
        setPortalData(data);
        setSelectedChildIdx(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser?.id]
  );

  useEffect(() => {
    loadParentPortal(false);
  }, [loadParentPortal]);

  if (loading && !portalData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center animate-pulse space-y-3">
        <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
        <div className="text-sm font-extrabold text-slate-800">
          Đang đồng bộ Cổng Phụ Huynh Đồng Hành (Core Flow 5)...
        </div>
      </div>
    );
  }

  const children = portalData?.children || [];
  const child = children[selectedChildIdx] || {
    studentName: 'Phạm Minh Hoàng',
    grade: 'Lớp 12A1',
    school: 'THPT Chuyên Lê Hồng Phong - TP.HCM',
    targetMajor: 'Khoa học Máy tính - ĐH Bách Khoa (ĐHQG TP.HCM)',
    assignedTeacherName: 'ThS. Nguyễn Minh Triết',
    teacherContactPhone: '0908 246 357',
    examReadiness: {
      readinessIndex: 82.4,
      readinessTier: 'READY',
      normalizedThetaScore: 81.2,
      skillCoverageScore: 79.5,
      consistencyScore: 95.0
    },
    weeklyDisciplines: {
      studyHoursThisWeek: 13.5,
      recommendedHours: 12.0,
      currentStreak: 12,
      completionStatus: 'EXCEEDED_GOAL'
    },
    aiParentAlerts: []
  };

  const readiness = child.examReadiness || {};
  const discipline = child.weeklyDisciplines || {};
  const tierInfo = TIER_MAP[readiness.readinessTier] || TIER_MAP.READY;
  const disciplineInfo = DISCIPLINE_MAP[discipline.completionStatus] || DISCIPLINE_MAP.ON_TRACK;
  const recommendedHours = Number(discipline.recommendedHours || 12);
  const studyHours = Number(discipline.studyHoursThisWeek || 0);
  const disciplinePct = Math.min(100, Math.round((studyHours / recommendedHours) * 100));

  return (
    <div className="space-y-6 animate-fade max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-blue-800/60 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Core Flow 5 • Parent Companion Portal
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                portalData?._source === 'backend'
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400/30 text-amber-200'
              }`}
            >
              {portalData?._source === 'backend' ? '● Live Identity + Practice gRPC' : '● Dữ liệu chuẩn Seed CSDL'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đồng Hành Cùng Con: {child.studentName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/85 max-w-2xl leading-relaxed">
            Báo cáo minh bạch Chỉ số Sẵn sàng Thi (<code className="text-cyan-300 font-bold">R_exam</code>), kỷ luật tự học xác thực 12 giờ/tuần và các thông điệp đồng hành tâm lý từ Hệ thống Sư phạm V-Eval.
          </p>

          {children.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {children.map((c, idx) => (
                <button
                  key={c.studentId || idx}
                  onClick={() => setSelectedChildIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    idx === selectedChildIdx
                      ? 'bg-[#FACC15] text-slate-950 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {c.studentName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-white space-y-1">
            <div className="text-cyan-300 font-bold">Giáo viên phụ trách lớp Offline:</div>
            <div className="font-extrabold text-sm">{child.assignedTeacherName}</div>
            <div className="flex items-center gap-1.5 text-blue-200 text-[11px] pt-0.5">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              <span>Điện thoại: {child.teacherContactPhone}</span>
            </div>
          </div>

          <button
            onClick={() => loadParentPortal(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Cập nhật báo cáo mới nhất</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Composite Exam Readiness Index R_exam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chỉ số Sẵn sàng Thi (R_exam)
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-3xl font-black ${tierInfo.scoreCls}`}>
            {Number(readiness.readinessIndex ?? 0).toFixed(1)}
            <span className="text-sm font-bold text-slate-400"> / 100</span>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold ${tierInfo.badgeCls}`}>
            {tierInfo.label}
          </span>
        </div>

        {/* Card 2: Weekly Verified Study Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Giờ tự học tuần này
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {studyHours.toFixed(1)}
            <span className="text-sm font-bold text-slate-400"> / {recommendedHours}h</span>
          </div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold ${disciplineInfo.cls}`}>
            {disciplineInfo.label}
          </span>
        </div>

        {/* Card 3: Consecutive Study Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chuỗi ngày chuyên cần
            </span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-600">
            {discipline.currentStreak ?? 0} <span className="text-sm font-bold text-slate-400">ngày</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            Duy trì đều đặn mỗi ngày trên hệ thống
          </div>
        </div>

        {/* Card 4: Skill Coverage Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Độ phủ kỹ năng nền tảng
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">
            {Number(readiness.skillCoverageScore ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            Trung bình xác suất làm chủ BKT 4 miền
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: R_exam 3-Factor Breakdown + AI Parent Alerts & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: R_exam Formula Breakdown & AI Parent Alerts */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3-Factor Exam Readiness Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Cấu Thành Chỉ Số Sẵn Sàng Thi (R_exam = 50% Năng lực + 35% Độ phủ + 15% Chuyên cần)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chuyển hóa số liệu đo lường tâm trắc học IRT & BKT thành 3 trụ cột dễ theo dõi cho gia đình
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Factor 1: Normalized Theta (50%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">1. Năng lực giải đề chuẩn hóa (Trọng số 50%)</span>
                  <span className="text-blue-700 font-black">{Number(readiness.normalizedThetaScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.normalizedThetaScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Factor 2: Skill Coverage BKT (35%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">2. Độ bao phủ kiến thức 4 miền ĐGNL (Trọng số 35%)</span>
                  <span className="text-indigo-700 font-black">{Number(readiness.skillCoverageScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.skillCoverageScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Factor 3: Consistency Score (15%) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">3. Kỷ luật & sự đều đặn tự học 7 ngày (Trọng số 15%)</span>
                  <span className="text-emerald-700 font-black">{Number(readiness.consistencyScore ?? 0).toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(readiness.consistencyScore || 0))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Alerts for Parents */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Nhận Định & Khuyến Nghị Đồng Hành Từ AI Sư Phạm</span>
            </h2>

            <div className="space-y-3">
              {(child.aiParentAlerts || []).map((alert, idx) => {
                const isSuccess = String(alert.type || '').toUpperCase() === 'SUCCESS';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSuccess
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-extrabold text-sm mb-1">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90 pl-6">{alert.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Weekly Discipline Progress & Child Academic Profile */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly 12h Baseline Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Cam Kết Kỷ Luật Tự Học Tuần ({recommendedHours} giờ/tuần)</span>
            </h2>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-indigo-950">Thời lượng học xác thực:</span>
                <span className="text-lg font-black text-indigo-700">
                  {studyHours.toFixed(1)}h / {recommendedHours}h ({disciplinePct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white border border-indigo-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${disciplinePct}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                Hệ thống chỉ tính giờ học thực chất khi con xem video bài giảng (≥ 80% thời lượng) và làm bài luyện tập thích ứng ZPD, chống treo máy ảo.
              </p>
            </div>
          </div>

          {/* Child Academic Profile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Hồ Sơ Học Viên & Kênh Trao Đổi Giáo Viên</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Họ tên học viên:</span>
                <span className="font-extrabold text-slate-800">{child.studentName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Khối lớp:</span>
                <span className="font-extrabold text-slate-800">{child.grade}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Trường THPT:</span>
                <span className="font-extrabold text-slate-800 text-right">{child.school}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between gap-2">
                <span className="text-slate-500 font-medium">Ngành mục tiêu NV1:</span>
                <span className="font-extrabold text-blue-700 text-right">{child.targetMajor}</span>
              </div>
            </div>

            <button
              onClick={() =>
                toast.success(
                  `Đã gửi yêu cầu kết nối trao đổi học vụ tới ${child.assignedTeacherName} (${child.teacherContactPhone})!`
                )
              }
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Đăng Ký Lịch Trao Đổi 1-1 Cùng Giáo Viên Phụ Trách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Flow 6: Real-time BR-04 Early Warnings & Tripartite Counseling Feed for Guardian */}
      <StudentEarlyWarningsCard studentId={child?.studentId} />
    </div>
  );
}
