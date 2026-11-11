import React from 'react';
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  CreditCard,
  Flame,
  GraduationCap,
  HeartHandshake,
  History,
  Home,
  LayoutGrid,
  LogOut,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus
} from 'lucide-react';

const ROLE_HEADER_INFO = {
  student: {
    portalTitle: 'Cổng Học Viên ĐGNL',
    statusIcon: Flame,
    statusClass: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-500 fill-amber-500',
    roleBadge: 'Học Viên ĐGNL'
  },
  parent: {
    portalTitle: 'Cổng Phụ Huynh Đồng Hành',
    statusIcon: HeartHandshake,
    statusClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600',
    roleBadge: 'Phụ Huynh Học Sinh'
  },
  teacher: {
    portalTitle: 'Cổng Giảng Viên Sư Phạm',
    statusIcon: BookOpen,
    statusClass: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    iconColor: 'text-indigo-600',
    roleBadge: 'Giảng Viên Chuyên Môn'
  },
  manager: {
    portalTitle: 'Cổng Quản Lý Học Thuật Cơ Sở',
    statusIcon: Building2,
    statusClass: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
    roleBadge: 'Quản Lý Học Thuật Cơ Sở'
  },
  admin: {
    portalTitle: 'Cổng Quản Trị Viên Hệ Thống IAM',
    statusIcon: ShieldCheck,
    statusClass: 'bg-rose-50 border-rose-200 text-rose-800',
    iconColor: 'text-rose-600',
    roleBadge: 'Quản Trị Hệ Thống Toàn Quyền'
  }
};

const MOBILE_ROLE_TABS = {
  student: [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutGrid },
    { id: 'diagnostic', label: 'Khảo thí 30 câu', icon: ClipboardCheck },
    { id: 'history', label: 'Lịch sử', icon: History },
    { id: 'roadmap', label: 'Lộ trình', icon: Network },
    { id: 'analytics', label: 'Dự báo', icon: TrendingUp },
    { id: 'tuition', label: 'Học phí', icon: CreditCard }
  ],
  parent: [
    { id: 'dashboard', label: 'Đồng hành', icon: HeartHandshake },
    { id: 'analytics', label: 'Năng lực con', icon: TrendingUp },
    { id: 'history', label: 'Bài thi con', icon: History },
    { id: 'roadmap', label: 'Chuyên đề', icon: Network },
    { id: 'tuition', label: 'Đóng học phí', icon: CreditCard }
  ],
  teacher: [
    { id: 'dashboard', label: 'Heatmap 2D', icon: LayoutGrid },
    { id: 'roadmap', label: 'Studio Học liệu', icon: BookOpen },
    { id: 'diagnostic', label: 'Đề khảo thí', icon: ClipboardCheck },
    { id: 'history', label: 'Bài làm HV', icon: History },
    { id: 'analytics', label: 'Thống kê IRT', icon: TrendingUp }
  ],
  manager: [
    { id: 'dashboard', label: 'Điều phối Cơ sở', icon: Building2 },
    { id: 'teacher_heatmap', label: 'Heatmap Lớp', icon: LayoutGrid },
    { id: 'roadmap', label: 'Khung CT', icon: Network },
    { id: 'provision', label: 'Cấp tài khoản', icon: UserPlus },
    { id: 'analytics', label: 'Chất lượng', icon: TrendingUp }
  ],
  admin: [
    { id: 'provision', label: 'Quản trị IAM', icon: ShieldCheck },
    { id: 'dashboard', label: 'Đa Cơ sở', icon: Building2 },
    { id: 'teacher_heatmap', label: 'Heatmap Hệ thống', icon: LayoutGrid },
    { id: 'roadmap', label: 'Cây Tri thức', icon: Network },
    { id: 'tuition', label: 'Đối soát PayOS', icon: CreditCard }
  ]
};

export default function Navbar({
  role = 'student',
  activeTab,
  setActiveTab,
  currentUser,
  portalMetrics = {},
  onLogout,
  onOpenLandingPage
}) {
  const info = ROLE_HEADER_INFO[role] || ROLE_HEADER_INFO.student;
  const StatusIcon = info.statusIcon;
  const displayName = currentUser?.fullName || currentUser?.email || info.roleBadge;
  const avatarText = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'VE';

  const mobileTabs = MOBILE_ROLE_TABS[role] || MOBILE_ROLE_TABS.student;

  const getDynamicStatusText = () => {
    if (role === 'student') {
      const streak = Number(portalMetrics.studentDashboard?.streakAnalytics?.currentStreak ?? 0);
      const score = Number(portalMetrics.studentDashboard?.currentEstimatedScore ?? 0);
      return score > 0
        ? `Streak: ${streak} ngày • Ước tính: ${score}/1200đ`
        : `Streak: ${streak} ngày • Chưa làm bài khảo sát`;
    }
    if (role === 'parent') {
      const firstChild = portalMetrics.parentPortalData?.children?.[0];
      if (firstChild) {
        const rIdx = Number(firstChild.examReadiness?.readinessIndex ?? 0).toFixed(1);
        return `${firstChild.studentName} • R_exam: ${rIdx}%`;
      }
      return 'Chưa liên kết hồ sơ học sinh';
    }
    if (role === 'teacher') {
      const totalStudents = Number(portalMetrics.teacherHeatmapData?.totalStudents ?? 0);
      const className = portalMetrics.teacherHeatmapData?.className;
      return className
        ? `${className} • ${totalStudents} học sinh`
        : `Theo dõi ${totalStudents} học sinh`;
    }
    if (role === 'manager') {
      const totalClasses = Number(portalMetrics.managerPortalData?.totalClasses ?? 0);
      const campusCount = Number(portalMetrics.campusesCount ?? 0);
      return `${campusCount} Cơ sở • ${totalClasses} Lớp đang vận hành`;
    }
    const totalUsers = Number(portalMetrics.totalUsersCount ?? 0);
    return totalUsers > 0
      ? `PostgreSQL IAM • ${totalUsers} tài khoản thực tế`
      : 'PostgreSQL IAM • Gateway :5212';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Authenticated Role Portal Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mobile Brand Logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
              ĐG
            </div>
            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
              <span>ĐGNL AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
            </span>
          </div>

          {/* Authenticated Role Portal Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs font-extrabold shadow-sm shadow-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>{info.portalTitle}</span>
          </div>

          {currentUser?.email && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FDFBF7] border border-slate-200/80 text-[11px] font-bold text-slate-600">
              <span>Tài khoản xác thực:</span>
              <strong className="text-slate-900">{currentUser.email}</strong>
            </span>
          )}
        </div>

        {/* Right: Role Status Pill + Home Button + Profile + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Role-Specific Live Status Pill from Backend */}
          <div
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${info.statusClass}`}
          >
            <StatusIcon className={`w-3.5 h-3.5 ${info.iconColor}`} />
            <span>{getDynamicStatusText()}</span>
          </div>

          {/* Home Landing Page Button */}
          {onOpenLandingPage && (
            <button
              type="button"
              onClick={onOpenLandingPage}
              title="Xem Trang chủ giới thiệu (Home Template)"
              className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
          )}

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-xl bg-[#FDFBF7] border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
          </button>

          {/* Profile Info + Logout */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black flex items-center justify-center text-xs shadow-sm shadow-blue-500/20">
              {avatarText}
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <div className="font-extrabold text-slate-900">{displayName}</div>
              <div className="text-slate-500 text-[11px] font-medium">
                {currentUser?.campusName || info.roleBadge}
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất khỏi hệ thống"
                className="ml-1 p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Role Tab Strip (Visible when Sidebar is hidden on < lg screens) */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto px-4 py-2 bg-[#FDFBF7] border-t border-slate-200/70">
        {mobileTabs.map((t) => {
          const Icon = t.icon;
          const isTabActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab && setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isTabActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
