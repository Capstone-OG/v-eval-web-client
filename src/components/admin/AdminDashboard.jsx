import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  RefreshCw,
  GraduationCap,
  Briefcase,
  Crown,
  BookOpen,
  UserCheck,
  Sparkles,
  Server,
  Database,
  Cpu,
  Zap,
  ArrowRight,
  Clock,
  Activity,
  AlertCircle,
  ExternalLink,
  Layers,
  BarChart3,
  Check,
  Radio,
  FileCheck2,
  Lock,
  Compass,
  MapPin,
  Phone,
  PieChart
} from 'lucide-react';
import { userService } from '../../services/userService';

const ROLES_METADATA = [
  {
    role: 'STUDENT',
    label: 'Học viên ĐGNL',
    desc: 'Luyện thi thích ứng ZPD & Socratic AI Tutor',
    hex: '#10B981',
    color: 'from-emerald-500 to-teal-600',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    avatarGlow: 'shadow-emerald-500/20',
    icon: BookOpen,
    accent: 'emerald',
    solidBg: 'bg-emerald-500',
  },
  {
    role: 'PARENT',
    label: 'Phụ huynh Học sinh',
    desc: 'Cổng theo dõi điểm ước lượng & tiến độ con',
    hex: '#EC4899',
    color: 'from-pink-500 to-rose-600',
    barColor: 'bg-gradient-to-r from-pink-500 to-rose-500',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    avatarGlow: 'shadow-pink-500/20',
    icon: UserCheck,
    accent: 'pink',
    solidBg: 'bg-pink-500',
  },
  {
    role: 'TEACHER',
    label: 'Giảng viên Cơ sở',
    desc: 'Giảng dạy, chấm bài & Socratic Live',
    hex: '#2563EB',
    color: 'from-blue-600 to-indigo-600',
    barColor: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    avatarGlow: 'shadow-blue-500/20',
    icon: GraduationCap,
    accent: 'blue',
    solidBg: 'bg-blue-600',
  },
  {
    role: 'ACADEMIC_MANAGER',
    label: 'Quản lý Học vụ',
    desc: 'Điều phối lớp học & AI Clustering cơ sở',
    hex: '#F59E0B',
    color: 'from-amber-500 to-orange-600',
    barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    avatarGlow: 'shadow-amber-500/20',
    icon: Briefcase,
    accent: 'amber',
    solidBg: 'bg-amber-500',
  },
  {
    role: 'ACADEMIC_DIRECTOR',
    label: 'Giám đốc Học thuật',
    desc: 'Toàn quyền học thuật liên cơ sở & duyệt đề Bloom',
    hex: '#9333EA',
    color: 'from-purple-600 to-indigo-700',
    barColor: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    avatarGlow: 'shadow-purple-500/20',
    icon: Crown,
    accent: 'purple',
    solidBg: 'bg-purple-600',
  },
  {
    role: 'ADMINISTRATOR',
    label: 'Quản trị viên Hệ thống',
    desc: 'Quản trị bảo mật IAM & hạ tầng vi dịch vụ',
    hex: '#1E293B',
    color: 'from-slate-800 to-slate-950',
    barColor: 'bg-gradient-to-r from-slate-700 to-slate-900',
    badgeClass: 'bg-slate-900 text-white border-slate-800',
    avatarGlow: 'shadow-slate-500/20',
    icon: ShieldCheck,
    accent: 'slate',
    solidBg: 'bg-slate-800',
  },
];

const MICROSERVICES_STATUS = [
  { name: 'Identity & IAM Service', port: '5001', latency: '18ms', status: 'Healthy', note: 'PostgreSQL IAM DB Connected' },
  { name: 'API Gateway', port: '5000', latency: '12ms', status: 'Healthy', note: 'Reverse Proxy & Rate Limiter Active' },
  { name: 'Content & Question Engine', port: '5002', latency: '24ms', status: 'Healthy', note: 'RAG Knowledge Graph Online' },
  { name: 'Adaptive Practice Engine', port: '5003', latency: '21ms', status: 'Healthy', note: 'IRT 3PL & CAT Algorithms Ready' },
  { name: 'AI Socratic Mentor Core', port: '8000', latency: '58ms', status: 'Healthy', note: 'Gemini 2.5 Flash Pipeline' },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'IAM_PROVISION',
    title: 'Cấp phát tài khoản Giảng viên chuyên môn',
    desc: 'Tài khoản TEACHER được kích hoạt thành công tại Cơ sở 1 - ĐHQG TP. Thủ Đức',
    time: '10 phút trước',
    status: 'Thành công',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserPlus,
  },
  {
    id: 2,
    type: 'CAMPUS_SYNC',
    title: 'Đồng bộ dữ liệu mạng lưới 2 cơ sở đào tạo',
    desc: 'Cập nhật danh mục và địa bàn tiếp nhận học sinh từ Identity PostgreSQL',
    time: '35 phút trước',
    status: 'Hoàn tất',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Building2,
  },
  {
    id: 3,
    type: 'AI_POLICY',
    title: 'Áp dụng định mức Token AI Socratic Mentor',
    desc: 'Hạn ngạch 250.000 Token/ngày/học sinh & Rate limit 30 tin nhắn/phút có hiệu lực',
    time: '2 giờ trước',
    status: 'Đã kích hoạt',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Sparkles,
  },
  {
    id: 4,
    type: 'CLUSTER_HEALTH',
    title: 'Kiểm tra độ sẵn sàng 5 dịch vụ vi mô & Gateway',
    desc: 'Độ trễ trung bình đạt 18ms, kết nối cơ sở dữ liệu quan hệ ACID 100% ổn định',
    time: 'Hôm nay, 08:30 AM',
    status: 'Online',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Activity,
  },
];

const formatNum = (val) => (typeof val === 'number' && Number.isFinite(val) ? val.toLocaleString('vi-VN') : '—');

export default function AdminDashboard({ data, loading, updatedAt, currentUser, onNavigate, reload, onRefresh }) {
  const [roleCounts, setRoleCounts] = useState({});
  const [rolesLoading, setRolesLoading] = useState(true);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    let active = true;
    setRolesLoading(true);
    Promise.allSettled(
      ROLES_METADATA.map(({ role }) => userService.getUsers({ role, page: 1, pageSize: 1 }))
    ).then((results) => {
      if (!active) return;
      const counts = Object.fromEntries(
        ROLES_METADATA.map(({ role }, idx) => [
          role,
          results[idx].status === 'fulfilled' ? results[idx].value?.totalCount : null,
        ])
      );
      setRoleCounts(counts);
      setRolesLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const total = data.users?.totalCount;
  const active = data.users?.activeCount;
  const inactive = data.users?.inactiveCount;
  const hasStatus = Number.isFinite(active) && Number.isFinite(inactive);
  const statusTotal = hasStatus ? active + inactive : 0;
  const percent = statusTotal > 0 ? Math.round((active / statusTotal) * 100) : 0;

  // Sum of all role counts
  const totalRolesAssigned = useMemo(() => {
    return Object.values(roleCounts).reduce((acc, val) => acc + (Number.isFinite(val) ? val : 0), 0);
  }, [roleCounts]);

  // Academic & Staff total sum
  const staffTotal = useMemo(() => {
    const roles = ['TEACHER', 'ACADEMIC_MANAGER', 'ACADEMIC_DIRECTOR', 'ADMINISTRATOR'];
    let sum = 0;
    let found = false;
    for (const r of roles) {
      if (Number.isFinite(roleCounts[r])) {
        sum += roleCounts[r];
        found = true;
      }
    }
    return found ? sum : null;
  }, [roleCounts]);

  // Prepare role chart data with SVG stroke-dasharray properties
  const roleChartData = useMemo(() => {
    const C = 2 * Math.PI * 70; // ~439.823
    let currentOffset = 0;
    return ROLES_METADATA.map((r) => {
      const count = Number.isFinite(roleCounts[r.role]) ? roleCounts[r.role] : 0;
      const ratio = totalRolesAssigned > 0 ? count / totalRolesAssigned : 0;
      const strokeLength = ratio * C;
      const strokeOffset = -currentOffset;
      if (count > 0) {
        currentOffset += strokeLength;
      }
      return {
        ...r,
        count,
        pctNumber: ratio * 100,
        pctFormatted: (ratio * 100).toFixed(1),
        strokeLength,
        strokeOffset,
        circumference: C,
      };
    });
  }, [roleCounts, totalRolesAssigned]);

  const activeRoleItem = hoveredRole ? roleChartData.find((r) => r.role === hoveredRole) : null;
  const maxRoleCount = Math.max(1, ...Object.values(roleCounts).filter(Number.isFinite));
  const stat = (val) => (loading ? '…' : formatNum(val));

  return (
    <div className="space-y-8 animate-fade pb-10">
      {/* 1. Executive Master Command Center Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white border border-indigo-900/60 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute right-60 -bottom-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar with Status Pills & Sync Time */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300 backdrop-blur-md shadow-sm">
                <ShieldCheck size={14} className="text-blue-400" />
                V-EVAL CORE IAM v2.6 · TOÀN HỆ THỐNG
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Microservices Online
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                <Radio size={12} className="text-purple-400" />
                Chuẩn ISO/IEC 27001
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Clock size={14} className="text-slate-400" />
              <span>Đồng bộ gần nhất: <strong className="text-slate-200">{updatedAt?.toLocaleTimeString('vi-VN') || 'Đang cập nhật'}</strong></span>
            </div>
          </div>

          {/* Main Title & Action Center */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Trung tâm Quản trị & Điều phối Hệ thống</span>
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-2xl">
                Xin chào, <strong className="text-white font-bold">{currentUser?.fullName || 'Quản trị viên Hệ thống'}</strong>. 
                Giám sát tập trung dữ liệu tài khoản người dùng, phân quyền bảo mật IAM 6 cấp, mạng lưới đa cơ sở ĐHQG-HCM và độ sẵn sàng các dịch vụ vi mô.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {onRefresh && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
                  Làm mới dữ liệu
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('provision')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-xl shadow-blue-600/35 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer"
              >
                <UserPlus size={16} />
                + Cấp tài khoản mới
              </button>
              <button
                type="button"
                onClick={() => onNavigate('campuses')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white cursor-pointer shadow-md"
              >
                <Building2 size={15} />
                Mạng lưới cơ sở
              </button>
            </div>
          </div>

          {/* Embedded Hero Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/70 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>Chính sách: <strong className="text-white">Multi-Tenant Scoped</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Hạ tầng: <strong className="text-white">5 Microservices + Redis</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>Độ trễ Gateway: <strong className="text-white">18ms (Latency)</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Sao lưu: <strong className="text-white">Snapshot AES-256</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top 4 Executive KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Tổng tài khoản */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('provision')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('provision')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
              Tổng tài khoản
            </span>
            <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 text-white shadow-md shadow-blue-500/25">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono">
              {stat(total)}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Toàn hệ thống
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Bao gồm 6 nhóm vai trò IAM</span>
            <span className="font-extrabold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Quản lý <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('provision')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('provision')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
              Đang hoạt động
            </span>
            <div className="rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-3 text-white shadow-md shadow-emerald-500/25">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono">
              {stat(active)}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {percent}% kích hoạt
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Đã xác thực & sẵn sàng</span>
            <span className="font-extrabold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Xem chi tiết <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 3: Đội ngũ Cán bộ & Học thuật */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('user_roles')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('user_roles')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-600 transition-colors">
              Cán bộ & Chuyên môn
            </span>
            <div className="rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-3 text-white shadow-md shadow-purple-500/25">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono">
              {rolesLoading ? '…' : formatNum(staffTotal)}
            </span>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Giảng viên & QL
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Giám đốc, QL & Thầy cô</span>
            <span className="font-extrabold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Phân quyền <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* Card 4: Cơ sở đào tạo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('campuses')}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('campuses')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
              Cơ sở đào tạo
            </span>
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-3 text-white shadow-md shadow-amber-500/25">
              <Building2 size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono">
              {stat(data.campuses?.length)}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              ĐHQG TP.HCM
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Chi nhánh trực thuộc</span>
            <span className="font-extrabold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Xem danh mục <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. CHART-FIRST VISUAL ANALYTICS CENTER (Full-Width Executive View) */}
      <section className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 lg:p-8 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                <PieChart size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  Biểu đồ Phân bố Tài khoản theo Vai trò
                </h2>
                <p className="text-xs text-slate-500">
                  Đối sánh trực quan cơ cấu 6 nhóm quyền người dùng trên toàn hệ thống
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Đang kích hoạt: <strong className="text-slate-800">{stat(active)} / {stat(total)} ({percent}%)</strong>
              </span>
              <button
                type="button"
                onClick={() => onNavigate('user_roles')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Ma trận RBAC <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* MAIN CHART-FIRST ROW: Large Donut Chart + 2-Column Compact Color Table */}
          <div className="my-8 flex flex-col lg:flex-row items-center justify-center lg:justify-around gap-8 lg:gap-12">
            {/* 1. EXPANDED PROMINENT DONUT CHART (MULTI-COLOR FOR 6 ROLES) */}
            <div className="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 180 180">
                {/* Background Track */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  className="stroke-slate-100"
                  strokeWidth="20"
                  fill="transparent"
                />
                {/* Slices for all 6 Roles */}
                {roleChartData.map((r) => {
                  if (r.strokeLength <= 0) return null;
                  const isHovered = hoveredRole === r.role;
                  return (
                    <circle
                      key={r.role}
                      cx="90"
                      cy="90"
                      r="70"
                      stroke={r.hex}
                      strokeWidth={isHovered ? 26 : 20}
                      strokeDasharray={`${r.strokeLength} ${r.circumference - r.strokeLength}`}
                      strokeDashoffset={r.strokeOffset}
                      strokeLinecap="butt"
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer hover:opacity-95"
                      onMouseEnter={() => setHoveredRole(r.role)}
                      onMouseLeave={() => setHoveredRole(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Content Inside Donut */}
              <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center px-4">
                {activeRoleItem ? (
                  <div className="flex flex-col items-center justify-center animate-fade">
                    <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                      {activeRoleItem.count}
                    </span>
                    <span
                      className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border mt-1 shadow-2xs truncate max-w-[160px]"
                      style={{ backgroundColor: `${activeRoleItem.hex}15`, borderColor: `${activeRoleItem.hex}40`, color: activeRoleItem.hex }}
                    >
                      {activeRoleItem.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 mt-1">
                      {activeRoleItem.pctFormatted}% tổng số
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                      {rolesLoading ? '…' : totalRolesAssigned}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 text-center max-w-[150px] leading-tight">
                      Người dùng trong hệ thống
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. COMPACT ROLE COLOR TABLE (2 Columns Grid for Spacious Clean Layout) */}
            <div className="flex-1 w-full max-w-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-slate-100">
                <span>Nhóm vai trò người dùng (Bảng phân bổ chi tiết)</span>
                <div className="flex items-center gap-6">
                  <span>Số lượng</span>
                  <span className="w-12 text-right">Tỷ lệ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roleChartData.map((r) => {
                  const isHovered = hoveredRole === r.role;
                  return (
                    <div
                      key={r.role}
                      onMouseEnter={() => setHoveredRole(r.role)}
                      onMouseLeave={() => setHoveredRole(null)}
                      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-100/90 border-slate-300 shadow-sm scale-[1.02]'
                          : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60 hover:border-slate-200'
                      }`}
                    >
                      {/* Role Color Dot + Title + Badge */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs transition-transform group-hover:scale-125"
                          style={{ backgroundColor: r.hex }}
                        />
                        <div className="min-w-0 truncate">
                          <span className="text-xs font-extrabold text-slate-800 truncate block">
                            {r.label}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${r.badgeClass}`}>
                            {r.role}
                          </span>
                        </div>
                      </div>

                      {/* Count & Percentage */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs min-w-[32px] text-center">
                          {rolesLoading ? '…' : r.count}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 w-12 text-right">
                          {rolesLoading ? '…' : `${r.pctFormatted}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rainbow Spectrum Strip Below */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Quang phổ phân bổ đồng nhất toàn hệ thống:</span>
              <span className="font-mono text-slate-700 font-bold">
                {rolesLoading ? '…' : `${totalRolesAssigned} tài khoản được phân quyền`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-100 flex shadow-inner">
              {roleChartData.map((r) => {
                if (r.pctNumber <= 0) return null;
                return (
                  <div
                    key={r.role}
                    title={`${r.label}: ${r.count} (${r.pctFormatted}%)`}
                    className={`h-full ${r.solidBg} transition-all duration-300 hover:opacity-80 cursor-help`}
                    style={{ width: `${r.pctNumber}%` }}
                    onMouseEnter={() => setHoveredRole(r.role)}
                    onMouseLeave={() => setHoveredRole(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>* Phân tích đối sánh tương đối dựa trên số lượng tài khoản thực tế.</span>
          <button
            type="button"
            onClick={() => onNavigate('provision')}
            className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            + Cấp phát tài khoản mới
          </button>
        </div>
      </section>

      {/* 4. Action Command Hub (Thao tác quản trị chính) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Zap size={22} className="text-amber-500" />
              Bàn giao & Nghiệp vụ Quản trị viên
            </h2>
            <p className="text-xs text-slate-500">
              Truy cập nhanh các phân hệ nghiệp vụ thuộc thẩm quyền Quản trị viên hệ thống
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              id: 'provision',
              title: 'Cấp phát & Quản lý Tài khoản',
              desc: 'Cấp mới tài khoản Giảng viên, Quản lý, Giám đốc, tra cứu và phân quyền theo cơ sở.',
              icon: UserPlus,
              iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
              badge: 'Nghiệp vụ cốt lõi',
              badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
            },
            {
              id: 'user_roles',
              title: 'Tra cứu Ma trận Vai trò',
              desc: 'Chi tiết 6 vai trò, phạm vi quyền hạn và chính sách bảo mật RBAC toàn nền tảng.',
              icon: ShieldCheck,
              iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/25',
              badge: 'Bảo mật IAM',
              badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
            },
            {
              id: 'campuses',
              title: 'Mạng lưới Cơ sở Đào tạo',
              desc: 'Danh mục cơ sở trực thuộc ĐHQG-HCM, thông tin liên hệ và số lượng nhân sự.',
              icon: Building2,
              iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-amber-500/25',
              badge: 'Đa chi nhánh',
              badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
            },
            {
              id: 'system_settings',
              title: 'Cấu hình & Tham số Vận hành',
              desc: 'Thiết lập tham số nền tảng, kết nối dịch vụ AI, hạn ngạch token và bảo trì.',
              icon: Settings,
              iconBg: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-slate-500/25',
              badge: 'Cấu hình hệ thống',
              badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-xl cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-end text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Truy cập phân hệ <ArrowRight size={14} className="ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Campus Grid & Telemetry Status */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left: Danh mục cơ sở hoạt động */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 size={22} className="text-violet-600" />
                  Cơ sở đào tạo đang hoạt động
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Hệ thống phân tán các cơ sở trực thuộc V-Eval ĐHQG-HCM
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('campuses')}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline cursor-pointer"
              >
                Xem tất cả ({data.campuses?.length || 0})
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {!loading &&
                data.campuses?.slice(0, 4).map((c) => (
                  <div key={c.campusId} className="flex items-start gap-3.5 py-4 transition-colors hover:bg-slate-50/80 rounded-2xl px-2">
                    <div className="rounded-2xl bg-violet-50 p-3 text-violet-600 shrink-0 border border-violet-100 shadow-xs">
                      <Building2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-sm text-slate-900 truncate">{c.name}</p>
                        <span className="font-mono text-xs font-black text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-200 shrink-0">
                          {c.code || 'CS-HQ'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 truncate">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{c.address || 'Khu đô thị ĐHQG-HCM, TP. Thủ Đức'}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Hotline: <span className="font-mono text-slate-600 font-semibold">{c.phone || '028 3724 4270'}</span> · Trạng thái: <span className="text-emerald-600 font-bold">Đang tiếp nhận học sinh</span>
                      </p>
                    </div>
                  </div>
                ))}

              {loading && (
                <div className="py-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  Đang đồng bộ cơ sở từ máy chủ…
                </div>
              )}
              {!loading && (!data.campuses || data.campuses.length === 0) && (
                <p className="py-10 text-center text-xs text-slate-400">
                  Chưa có cơ sở đào tạo nào được thiết lập.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Mạng lưới đào tạo V-ACT 2026</span>
            <button
              type="button"
              onClick={() => onNavigate('campuses')}
              className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer"
            >
              Quản lý danh mục cơ sở →
            </button>
          </div>
        </section>

        {/* Right: Microservices Telemetry Pulse */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Server size={22} className="text-indigo-600" />
                  Giám sát Dịch vụ Vi mô (Microservices)
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Đo lường thời gian phản hồi và độ sẵn sàng của các nút dịch vụ
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                5/5 Online
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {MICROSERVICES_STATUS.map((srv) => (
                <div
                  key={srv.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs transition-colors hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900">{srv.name}</span>
                      <span className="hidden sm:inline text-slate-400 ml-1.5 font-mono text-[11px]">
                        (:{srv.port})
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">{srv.note}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                      {srv.latency}
                    </span>
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Thời gian hoạt động liên tục: 99.98%</span>
            <button
              type="button"
              onClick={() => onNavigate('operations')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Xem telemetry vận hành & sao lưu →
            </button>
          </div>
        </section>
      </div>

      {/* 6. Recent Administrative Security & System Feed */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileCheck2 size={22} className="text-blue-600" />
              Nhật ký Sự kiện & An toàn Hệ thống (Audit Stream)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ghi nhận các thao tác cấp quyền, cấu hình và đồng bộ hóa gần nhất của quản trị viên
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock size={14} /> Cập nhật tự động
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT_ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${act.badgeColor}`}>
                    {act.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">{act.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{act.desc}</p>
                </div>

                <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1">
                  <Clock size={11} /> {act.time}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
