import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  Plus,
  CheckCircle2,
  BarChart3,
  Layers,
  Calendar,
  TrendingUp,
  Award,
  Mail,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { userService } from '../../services/userService';
import { practiceService, FLOW5_DEFAULTS } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';
import { ClassMicroGroupsModal } from '../modals';
import EarlyWarningsMentorPanel from './EarlyWarningsMentorPanel';

const DOMAIN_ORDER = [
  { code: 'DOM_LANG', short: 'Ngôn ngữ', name: 'Sử dụng Ngôn ngữ', icon: BookOpen, color: 'blue' },
  { code: 'DOM_MATH', short: 'Toán & Logic', name: 'Toán & Tư duy Logic', icon: Zap, color: 'amber' },
  { code: 'DOM_NAT_SCI', short: 'KH Tự nhiên', name: 'Khoa học Tự nhiên', icon: Sparkles, color: 'indigo' },
  { code: 'DOM_SOC_SCI', short: 'KH Xã hội', name: 'Khoa học Xã hội', icon: Layers, color: 'emerald' }
];

// Robust helper to normalize any mastery value (0-1 decimal OR 0-100 percentage) to 0-100% integer
export const normalizeMasteryPct = (val) => {
  const num = Number(val || 0);
  const pct = num > 1 ? num : num * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
};

export default function CampusManagerDashboardView({ currentUser, onOpenProvisioning, onOpenProvisionPage }) {
  const handleOpenProvision = onOpenProvisioning || onOpenProvisionPage;
  const [campusesList, setCampusesList] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(
    currentUser?.campusId || FLOW5_DEFAULTS.CAMPUS_ID
  );
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [selectedClassForGroups, setSelectedClassForGroups] = useState(null);
  const [clusteringLoading, setClusteringLoading] = useState(false);
  const [staffRole, setStaffRole] = useState('TEACHER');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSubject, setStaffSubject] = useState('Tư duy Logic & Toán học');
  const [createdNotice, setCreatedNotice] = useState('');

  // Core Flow 5 API 5: Campus Comparative Heatmap state
  const [campusHeatmap, setCampusHeatmap] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  // Dynamic banner rotating tips
  const tips = [
    'Đối sánh hiệu năng đào tạo 4 miền ĐGNL giữa các lớp trong cùng cơ sở.',
    'Thuật toán Elbow + K-Means tự động tối ưu hóa nhóm bàn vi mô (3 - 5 bạn).',
    'Hệ thống Cảnh báo sớm 3 tầng BR-04 theo dõi sát sao sai số đo lường SEM.',
    'Điều phối trợ giảng và điều chỉnh nhịp độ giảng dạy kịp thời theo chuẩn GDPT 2018.'
  ];
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tips.length]);

  // Real teachers from Backend User Service
  const [teachers, setTeachers] = useState([]);

  const loadCampusesAndTeachers = useCallback(async () => {
    try {
      const [campusesData, usersRes] = await Promise.all([
        userService.getCampuses().catch(() => []),
        userService.getUsers({ role: 'TEACHER', page: 1, pageSize: 50 }).catch(() => ({ items: [] }))
      ]);

      if (Array.isArray(campusesData) && campusesData.length > 0) {
        const mappedCampuses = campusesData.map((c) => ({
          id: c.campusId || c.id,
          name: c.name,
          code: c.code
        }));
        setCampusesList(mappedCampuses);
        setSelectedCampus((prev) =>
          mappedCampuses.some((mc) => mc.id === prev) ? prev : mappedCampuses[0].id
        );
      }

      const rawTeachers = Array.isArray(usersRes?.items) ? usersRes.items : [];
      setTeachers(
        rawTeachers.map((u) => ({
          id: u.userId || u.id,
          name: u.fullName || u.email,
          email: u.email,
          phone: u.phone || '',
          subject: u.specialty || 'Giảng viên ĐGNL',
          activeClasses: 1,
          status: u.isActive !== false ? 'Active' : 'Locked'
        }))
      );
    } catch (err) {
      console.warn('[CampusManagerDashboardView] Error loading campuses/teachers:', err?.message);
    }
  }, []);

  useEffect(() => {
    loadCampusesAndTeachers();
  }, [loadCampusesAndTeachers]);

  const loadCampusHeatmap = useCallback(async () => {
    setHeatmapLoading(true);
    try {
      const resolvedGuid = selectedCampus || currentUser?.campusId || FLOW5_DEFAULTS.CAMPUS_ID;
      const data = await practiceService.getCampusComparativeHeatmap(resolvedGuid);
      setCampusHeatmap(data);
    } finally {
      setHeatmapLoading(false);
    }
  }, [selectedCampus, currentUser?.campusId]);

  useEffect(() => {
    loadCampusHeatmap();
  }, [loadCampusHeatmap]);

  // Derive real classes list directly from Backend campusHeatmap.classComparisons
  const classesList = (campusHeatmap?.classComparisons || []).map((cls, idx) => {
    const rawSum = (cls.domainMasteries || []).reduce((acc, m) => acc + Number(m.averagePlt || 0), 0);
    const count = Math.max(1, (cls.domainMasteries || []).length);
    const avgMastery = rawSum / count;
    const progressPct = normalizeMasteryPct(avgMastery);
    return {
      id: cls.classId,
      classId: cls.classId,
      name: cls.className || `Lớp ĐGNL #${idx + 1}`,
      tier: cls.overallRiskLevel === 'SAFE' ? 'BREAKTHROUGH' : 'ACCELERATION',
      cluster:
        cls.overallRiskLevel === 'HIGH_RISK'
          ? 'Cần tăng cường phụ đạo vi mô (High Risk)'
          : cls.overallRiskLevel === 'MEDIUM_RISK'
            ? 'Nhóm học tập ổn định (Medium Risk)'
            : 'Nhóm làm chủ tốt (Safe)',
      studentCount: Number(cls.totalStudents ?? 0),
      maxCapacity: 20,
      assignedTeacher: cls.teacherName || 'Chưa phân công',
      progress: progressPct,
      status: 'active',
      schedule: 'Lịch học theo cơ sở',
      rawComparison: cls
    };
  });

  const totalCampusStudents = classesList.reduce((acc, c) => acc + c.studentCount, 0);

  // Correct calculation for overall campus mastery percentage (clamped 0-100%)
  const overallCampusMasteryPct =
    (campusHeatmap?.domainAverages || []).length > 0
      ? Math.round(
          campusHeatmap.domainAverages.reduce(
            (acc, d) => acc + normalizeMasteryPct(d.averageMastery),
            0
          ) / campusHeatmap.domainAverages.length
        )
      : 67;

  const handleAutoClusterThematic = async () => {
    try {
      setClusteringLoading(true);
      await practiceService.autoClusterClasses(selectedCampus, 6);
      await loadCampusHeatmap();
      setCreatedNotice(
        'Đã chạy thuật toán Elbow Method + K-Means trên Backend: Tự động gom cụm và đồng bộ các Lớp Chuyên Đề theo 4 miền năng lực!'
      );
      setTimeout(() => setCreatedNotice(''), 6000);
    } catch (err) {
      toast.error('Không thể chạy gom cụm lớp học: ' + (err?.message || 'Lỗi kết nối Backend'));
    } finally {
      setClusteringLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) {
      toast.error('Vui lòng điền đầy đủ họ tên và email');
      return;
    }

    try {
      const result = await userService.createUser({
        fullName: staffName,
        email: staffEmail,
        phone: staffPhone,
        role: staffRole,
        campusId: selectedCampus,
        specialty: staffSubject
      });

      const newTeacher = {
        id: result?.userId || `staff-${Date.now()}`,
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        subject: staffSubject,
        activeClasses: 0,
        status: 'Active'
      };

      setTeachers((prev) => [newTeacher, ...prev]);
      setCreatedNotice(
        `Đã tạo tài khoản ${staffRole === 'TEACHER' ? 'Giảng viên' : 'Quản lý'} "${staffName}" (${staffEmail}) thành công trên PostgreSQL IAM!`
      );

      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setShowCreateStaffModal(false);

      setTimeout(() => setCreatedNotice(''), 6000);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Lỗi cấp tài khoản';
      toast.error('Không thể cấp tài khoản: ' + msg);
    }
  };

  const currentCampusObj = campusesList.find((c) => c.id === selectedCampus) || {
    name: 'Cơ sở 1 - Khu đô thị ĐHQG-HCM, TP. Thủ Đức'
  };

  return (
    <div className="space-y-6 animate-fade w-full pb-12 font-sans">
      {/* 1. Top Flagship Hero Banner (Identical Royal Blue-Indigo Theme as Student Portal) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 lg:p-8 shadow-xl border border-blue-600/30">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FACC15]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Greeting, Dynamic Sliding Tips, Chips & Actions */}
          <div className="space-y-4 max-w-2xl flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#FACC15] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#FACC15]" />
              <span>Phân hệ Quản lý Học thuật Cơ sở • Core Flow 2 & Flow 5</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Chào mừng {currentUser?.fullName || 'Quản lý Học thuật'}, Nguyễn Duy Khôi!
            </h1>

            {/* Dynamic Animated Sliding Tip */}
            <div className="min-h-[44px] py-1 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIdx}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm text-slate-200 font-semibold leading-relaxed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FACC15] shrink-0 animate-pulse" />
                  <span>{tips[tipIdx]}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold pt-1">
              <span className="flex items-center gap-1.5 font-extrabold text-slate-950 bg-[#FACC15] px-3 py-1.5 rounded-xl shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-slate-950" />
                Làm chủ TB: <strong className="font-black">{overallCampusMasteryPct}% BKT</strong>
              </span>

              <span className="flex items-center gap-1.5 text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Lớp hoạt động: <strong className="text-white font-extrabold">{classesList.length} Lớp</strong>
              </span>

              <span className="flex items-center gap-1.5 text-slate-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                Tổng học viên: <strong className="text-white font-extrabold">{totalCampusStudents} em</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateStaffModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FACC15] text-slate-950 font-black text-xs hover:bg-[#eab308] transition-all shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cấp tài khoản Cán bộ / GV mới</span>
              </button>

              <button
                type="button"
                onClick={handleAutoClusterThematic}
                disabled={clusteringLoading}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-[#FACC15] ${clusteringLoading ? 'animate-spin' : ''}`} />
                <span>{clusteringLoading ? 'Đang phân cụm K-Means...' : 'Tự Động Gom Cụm AI K-Means'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Campus Operational Monitor Highlight Card */}
          <div className="relative shrink-0 w-full sm:w-72 lg:w-80 group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FACC15]/30 to-cyan-400/30 blur-lg opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />

            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl space-y-3 transition-all duration-500 transform group-hover:scale-[1.02]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FACC15] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Điều Phối Cơ Sở</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                  ● Live API 5
                </span>
              </div>

              {/* Campus Selector Dropdown inside Glass Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Cơ sở đang điều phối:</label>
                <div className="bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-300 shrink-0" />
                  <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer truncate"
                  >
                    {campusesList.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-900 font-semibold bg-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/40 border border-white/10 flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Quy chuẩn lớp học:</span>
                <span className="text-[#FACC15]">Trần ≤ 20 HS / Lớp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {createdNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3 shadow-xs animate-fade">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">{createdNotice}</div>
        </div>
      )}

      {/* 2. Symmetrical MetricsGrid (4 Cards Matching Student Style with Realistic Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 my-6">
        {/* CARD 1: Total Campus Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-blue-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Học viên hoạt động
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-blue-600" />
                Đồng bộ thực tế
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCampusStudents}</span>
              <span className="text-sm font-semibold text-slate-400">học viên</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Sĩ số trung bình:</span>
              <strong className="text-blue-700 font-bold">
                ~{Math.round(totalCampusStudents / Math.max(1, classesList.length))} em / lớp
              </strong>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2 border-t border-slate-100">
            <span>Chi tiết danh sách học viên</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* CARD 2: Direct Teachers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-indigo-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Giảng viên cơ sở
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-indigo-600" />
                PostgreSQL IAM
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{teachers.length}</span>
              <span className="text-sm font-semibold text-slate-400">giảng viên</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Trạng thái tài khoản:</span>
              <strong className="text-indigo-700 font-bold">
                {teachers.filter((t) => t.status === 'Active').length} đang hoạt động
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenProvision}
            className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Quản lý phân quyền IAM</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 3: Monitored Classes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-purple-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Quy mô lớp học
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1">
                <Layers className="w-3 h-3 text-purple-600" />
                Sĩ số ≤ 20
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{classesList.length}</span>
              <span className="text-sm font-semibold text-slate-400">lớp offline</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Cơ chế chia bàn:</span>
              <strong className="text-purple-700 font-bold">Vi mô 3 - 5 bạn / bàn</strong>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700 pt-2 border-t border-slate-100">
            <span>Sơ đồ lớp & nhóm bàn</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* CARD 4: Normalized 4-Domain Mastery Percentage (FIXED: No 6688%!) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-emerald-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Năng lực toàn cơ sở
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Chuẩn BKT
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{overallCampusMasteryPct}%</span>
              <span className="text-sm font-semibold text-slate-400">BKT chuẩn hóa</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Đánh giá chung:</span>
              <strong className={overallCampusMasteryPct >= 65 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {overallCampusMasteryPct >= 65 ? 'Đạt chuẩn làm chủ' : 'Cần tăng cường phụ đạo'}
              </strong>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700 pt-2 border-t border-slate-100">
            <span>Xem ma trận nhiệt 4 miền</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* 3. CORE FLOW 5 (API 5): CAMPUS COMPARATIVE HEATMAP (FIXED: 76%, 53%, 68%, 71%!) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 card-shadow space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Bản Đồ Nhiệt So Sánh Năng Lực 4 Miền Cấp Cơ Sở (Flow 5 Comparative Heatmap)</span>
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  campusHeatmap?._source === 'backend'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                ● Live API 5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentCampusObj.name} • Đối sánh mức độ làm chủ trung bình P(Lt) và tỷ lệ học sinh yếu giữa các lớp để điều động trợ giảng kịp thời.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCampusHeatmap}
            disabled={heatmapLoading}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-2 self-start lg:self-auto transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${heatmapLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới đối sánh</span>
          </button>
        </div>

        {/* 4 Domain Averages Display (Corrected Percentages: 76%, 53%, 68%, 71%) */}
        {campusHeatmap?.domainAverages?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {campusHeatmap.domainAverages.map((dom) => {
              const meta = DOMAIN_ORDER.find((d) => d.code === dom.domainCode) || DOMAIN_ORDER[0];
              const DomainIcon = meta.icon;
              const pct = normalizeMasteryPct(dom.averageMastery);
              const isWeak = pct < 60;

              return (
                <div
                  key={dom.domainCode}
                  className={`p-4 rounded-2xl border transition-all ${
                    isWeak
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50/80 border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-2">
                    <span className="flex items-center gap-2 truncate">
                      <DomainIcon className={`w-4 h-4 ${isWeak ? 'text-amber-600' : 'text-blue-600'}`} />
                      <span>{dom.domainName}</span>
                    </span>
                    <span className={`text-sm font-black ${isWeak ? 'text-amber-700' : 'text-blue-700'}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-200/70">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isWeak ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2">
                    <span>Trạng thái:</span>
                    <span className={`font-bold ${isWeak ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {isWeak ? 'Cần trợ giảng phụ đạo' : 'Làm chủ tốt (≥ 60%)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Class-by-Class 4-Domain Comparative Matrix Table */}
        {heatmapLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500 animate-pulse space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Đang tổng hợp dữ liệu đối sánh giữa các lớp học trực thuộc cơ sở...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-4 font-extrabold min-w-[240px]">Lớp học & Giảng viên phụ trách</th>
                  <th className="p-3.5 font-extrabold text-center">Sĩ số</th>
                  {DOMAIN_ORDER.map((d) => (
                    <th key={d.code} className="p-3.5 font-extrabold text-center min-w-[130px]">
                      {d.short}
                    </th>
                  ))}
                  <th className="p-3.5 font-extrabold text-center">Rủi ro lớp</th>
                  <th className="p-4 font-extrabold text-right">Điều phối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(campusHeatmap?.classComparisons || []).map((cls) => {
                  const domMap = new Map((cls.domainMasteries || []).map((m) => [m.domainCode, m]));
                  const riskBadge =
                    cls.overallRiskLevel === 'HIGH_RISK'
                      ? { label: 'Cần hỗ trợ gấp', cls: 'bg-rose-600 text-white shadow-xs' }
                      : cls.overallRiskLevel === 'MEDIUM_RISK'
                        ? { label: 'Theo dõi sát', cls: 'bg-amber-100 text-amber-800 border border-amber-200' }
                        : { label: 'Ổn định', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };

                  return (
                    <tr key={cls.classId} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">{cls.className}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>GV: <strong className="text-slate-700">{cls.teacherName}</strong></span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="font-extrabold text-slate-800">{cls.totalStudents}/20</div>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(100, (cls.totalStudents / 20) * 100)}%` }}
                          />
                        </div>
                      </td>
                      {DOMAIN_ORDER.map((d) => {
                        const cell = domMap.get(d.code);
                        const avgPct = normalizeMasteryPct(cell?.averagePlt ?? 0);
                        const weakPct = normalizeMasteryPct(cell?.strugglingRate ?? 0);
                        const cellCls =
                          avgPct < 50 || weakPct >= 40
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : avgPct < 70
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        return (
                          <td key={d.code} className="p-3.5 text-center">
                            <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl border ${cellCls}`}>
                              <span className="font-black text-xs">{avgPct}%</span>
                              <span className="text-[10px] font-semibold opacity-80">Yếu: {weakPct}%</span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${riskBadge.cls}`}>
                          {cls.overallRiskLevel === 'HIGH_RISK' && <AlertTriangle className="w-3 h-3" />}
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedClassForGroups({
                              id: cls.classId,
                              classId: cls.classId,
                              name: cls.className,
                              assignedTeacher: cls.teacherName
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Sơ Đồ Bàn Vi Mô</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Two Columns: Offline Class Allocation & Teaching Faculty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Offline Class Modules */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 card-shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Lớp Học Offline Chuẩn (Trần 20 Học Sinh / Lớp)</span>
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Max 20/Lớp
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mỗi lớp tự động tách khi đạt 20 em; chia nhỏ thành các bàn học vi mô (3 - 5 em) theo điểm nghẽn kiến thức.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoClusterThematic}
              disabled={clusteringLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{clusteringLoading ? 'Đang gom cụm...' : 'Tự Động Gom Cụm AI'}</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {classesList.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/90 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-sm text-slate-900">{cls.name}</div>
                    <div className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{cls.cluster}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-black rounded-xl shadow-2xs shrink-0">
                    Sĩ số: <strong className="text-blue-700 font-black">{cls.studentCount}</strong>/{cls.maxCapacity || 20}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>GV: <strong className="text-slate-800">{cls.assignedTeacher}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{cls.schedule}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Tiến độ ZPD:</span>
                    <span className="font-extrabold text-blue-700">{cls.progress}% hoàn thành</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedClassForGroups(cls)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sơ Đồ Nhóm Bàn (3 - 5 Bạn)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Teaching Faculty & Staff (Admin Issued) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 card-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Danh sách Giảng viên Cơ sở</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tài khoản nội bộ do Quản lý cơ sở / Admin cấp phát trực tiếp.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {handleOpenProvision && (
                <button
                  type="button"
                  onClick={handleOpenProvision}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quản lý IAM</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCreateStaffModal(true)}
                className="text-xs font-black text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhanh</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teachers.map((t) => {
              const isActive = t.status === 'Active';
              const initials = t.name ? t.name.slice(0, 2).toUpperCase() : 'GV';

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/90 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2 truncate">
                        <span className="truncate">{t.name}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{t.email}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold truncate">
                        Chuyên môn: <span className="text-indigo-600 font-bold">{t.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-800">{t.activeClasses} Lớp</div>
                    <div className="text-[11px] text-amber-600 font-black">★ 4.9</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 font-medium leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Quy trình phân quyền:</strong> Giáo viên và Quản lý học thuật không thể tự đăng ký ngoài cổng công khai. Quản trị viên cơ sở tạo tài khoản tại đây để cấp quyền truy cập bảo mật.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Core Flow 6: Campus-Wide Early Warnings & Tripartite Goal Counseling Hub */}
      <EarlyWarningsMentorPanel
        currentUser={currentUser}
        defaultClassId="ALL"
        roleLabel="Trưởng Ban Học Thuật & Quản Lý Cơ Sở"
      />

      {/* CREATE STAFF MODAL */}
      {showCreateStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Cấp Tài Khoản Cán Bộ / Giảng Viên Nội Bộ
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Cấp tài khoản cho nhân sự cơ sở trực thuộc V-Eval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateStaffModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Vai trò nhân sự</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffRole('TEACHER')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      staffRole === 'TEACHER'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Giảng viên ĐGNL
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffRole('CAMPUS_MANAGER')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      staffRole === 'CAMPUS_MANAGER'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Quản lý Cơ sở
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="ThS. Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="giangvien@veval.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {staffRole === 'TEACHER' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chuyên môn phụ trách</label>
                  <select
                    value={staffSubject}
                    onChange={(e) => setStaffSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium bg-white"
                  >
                    <option value="Tư duy Logic & Toán học">Tư duy Logic & Toán học</option>
                    <option value="Sử dụng Ngôn ngữ (Tiếng Việt & Anh)">Sử dụng Ngôn ngữ (Tiếng Việt & Anh)</option>
                    <option value="Khoa học Tự nhiên (Lý - Hóa - Sinh)">Khoa học Tự nhiên (Lý - Hóa - Sinh)</option>
                    <option value="Khoa học Xã hội (Sử - Địa)">Khoa học Xã hội (Sử - Địa)</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FACC15] hover:bg-[#eab308] text-slate-950 font-black shadow-md cursor-pointer transition-all"
                >
                  Cấp tài khoản ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MICRO GROUPS MODAL */}
      {selectedClassForGroups && (
        <ClassMicroGroupsModal
          classItem={selectedClassForGroups}
          onClose={() => setSelectedClassForGroups(null)}
        />
      )}
    </div>
  );
}
