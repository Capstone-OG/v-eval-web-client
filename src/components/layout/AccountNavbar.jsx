import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Flame,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Target,
  UserCheck,
  X
} from 'lucide-react';
import { accountRoleLabel } from '../../utils/accountPresentation';
import practiceService from '../../services/practiceService';

function formatExamDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(d);
}

function getUpcomingExam(terms = [], studentDash = null, user = null) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Explicit target date from student profile or dashboard
  const explicitDate = studentDash?.targetExamDate || studentDash?.examDate || user?.examDate;
  if (explicitDate) {
    const d = new Date(explicitDate);
    if (!Number.isNaN(d.getTime())) {
      return {
        name: studentDash?.targetExamName || 'Kỳ thi Mục tiêu',
        date: d,
        formattedDate: formatExamDate(d),
        type: 'custom',
        round: 1,
        description: 'Ngày thi do bạn / học sinh tự thiết lập theo kế hoạch học tập cá nhân.'
      };
    }
  }

  // 2. Active or upcoming Academic Term from backend CSDL
  if (Array.isArray(terms) && terms.length > 0) {
    const upcomingTerms = terms
      .map((t) => ({
        ...t,
        targetDate: new Date(t.endDate || t.startDate)
      }))
      .filter((t) => !Number.isNaN(t.targetDate.getTime()) && t.targetDate >= now)
      .sort((a, b) => a.targetDate - b.targetDate);

    if (upcomingTerms.length > 0) {
      const t = upcomingTerms[0];
      return {
        name: t.name || t.code || 'Học kỳ Khảo thí',
        date: t.targetDate,
        formattedDate: formatExamDate(t.targetDate),
        type: 'academic_term',
        termCode: t.code,
        academicYear: t.academicYear,
        description: `Học kỳ ${t.academicYear || `${currentYear}-${currentYear + 1}`} - Hệ thống tổ chức lớp học và kiểm định năng lực.`
      };
    }
  }

  // 3. Official VNU-HCM Examination Schedule (Kỳ thi ĐGNL ĐHQG TP.HCM)
  let examYear = currentYear;
  let dot1 = new Date(examYear, 2, 28, 8, 0, 0); // Late March
  let dot2 = new Date(examYear, 4, 23, 8, 0, 0); // Late May

  if (now > dot2) {
    examYear = currentYear + 1;
    dot1 = new Date(examYear, 2, 28, 8, 0, 0);
    dot2 = new Date(examYear, 4, 23, 8, 0, 0);
  }

  if (now <= dot1) {
    return {
      name: `ĐGNL Đợt 1 (${examYear})`,
      date: dot1,
      formattedDate: formatExamDate(dot1),
      type: 'vact_dot1',
      round: 1,
      examYear,
      regPeriod: `20/01/${examYear} - 05/03/${examYear}`,
      description: `Kỳ thi Đánh giá Năng lực ĐHQG TP.HCM Đợt 1 năm ${examYear}`
    };
  }

  return {
    name: `ĐGNL Đợt 2 (${examYear})`,
    date: dot2,
    formattedDate: formatExamDate(dot2),
    type: 'vact_dot2',
    round: 2,
    examYear,
    regPeriod: `15/04/${examYear} - 08/05/${examYear}`,
    description: `Kỳ thi Đánh giá Năng lực ĐHQG TP.HCM Đợt 2 năm ${examYear}`
  };
}

export default function AccountNavbar({
  role = 'student',
  pageTitle = 'Tổng quan',
  currentUser,
  portalMetrics = {},
  onLogout,
  onOpenLandingPage,
  onOpenSettings,
  onOpenNavigation
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);

  const [academicTerms, setAcademicTerms] = useState([]);
  const [alertsData, setAlertsData] = useState({ alerts: [], unreadCount: 0 });
  const [_loadingAlerts, setLoadingAlerts] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const alertsRef = useRef(null);

  const roleLabel = accountRoleLabel(role, currentUser);
  const displayName = currentUser?.fullName?.trim() || roleLabel;
  const initials =
    displayName
      .split(/\s+/)
      .slice(-2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'VE';

  const rawStreak = Number(portalMetrics.studentDashboard?.streakAnalytics?.currentStreak ?? 0);
  const streak = Number.isFinite(rawStreak) ? Math.max(0, Math.floor(rawStreak)) : 0;

  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Bangkok'
  }).format(new Date());

  // Resolved student ID (for student role or active child of parent role)
  const resolvedStudentId = useMemo(() => {
    if (role === 'parent') {
      return (
        portalMetrics?.activeChild?.studentId ||
        portalMetrics?.parentActiveChildId ||
        portalMetrics?.parentPortalData?.children?.[0]?.studentId ||
        null
      );
    }
    return currentUser?.id || currentUser?.userId || null;
  }, [role, portalMetrics?.activeChild, portalMetrics?.parentActiveChildId, portalMetrics?.parentPortalData?.children, currentUser]);

  // Active child for parent portal
  const activeChild = useMemo(() => {
    if (role !== 'parent') return null;
    return (
      portalMetrics?.activeChild ||
      portalMetrics?.parentPortalData?.children?.find(
        (c) => c.studentId === portalMetrics?.parentActiveChildId
      ) ||
      portalMetrics?.parentPortalData?.children?.[0] ||
      null
    );
  }, [role, portalMetrics?.activeChild, portalMetrics?.parentActiveChildId, portalMetrics?.parentPortalData?.children]);

  // Fetch Academic Terms from CSDL
  useEffect(() => {
    let isMounted = true;
    practiceService
      .getAcademicTerms()
      .then((terms) => {
        if (isMounted && Array.isArray(terms)) {
          setAcademicTerms(terms);
        }
      })
      .catch((err) => {
        console.warn('[AccountNavbar] getAcademicTerms non-fatal fallback:', err?.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Alerts for current identity & listen to Flow 6 updates
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await practiceService.getMyAlerts({ unreadOnly: false, studentId: resolvedStudentId });
      if (res && Array.isArray(res.alerts)) {
        setAlertsData(res);
      }
    } catch (err) {
      console.warn('[AccountNavbar] getMyAlerts non-fatal error:', err?.message);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const handleFlowUpdate = () => {
      fetchAlerts();
    };

    window.addEventListener('veval:flow6-updated', handleFlowUpdate);
    return () => {
      window.removeEventListener('veval:flow6-updated', handleFlowUpdate);
    };
  }, [resolvedStudentId]);

  // Handle Mark Alert as Read
  const handleMarkAsRead = async (alertId) => {
    try {
      await practiceService.markAlertAsRead(alertId, resolvedStudentId);
      setAlertsData((prev) => {
        const nextAlerts = (prev.alerts || []).map((a) => (a.alertId === alertId ? { ...a, isRead: true } : a));
        const nextUnread = nextAlerts.filter((a) => !a.isRead).length;
        return {
          ...prev,
          alerts: nextAlerts,
          unreadCount: nextUnread
        };
      });
    } catch (err) {
      console.error('[AccountNavbar] Failed to mark alert read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadAlerts = (alertsData.alerts || []).filter((a) => !a.isRead);
    for (const a of unreadAlerts) {
      try {
        await practiceService.markAlertAsRead(a.alertId, resolvedStudentId);
      } catch {
        // Continue marking remaining
      }
    }
    setAlertsData((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).map((a) => ({ ...a, isRead: true })),
      unreadCount: 0
    }));
  };

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuOpen && !containerRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
      if (alertsOpen && !alertsRef.current?.contains(event.target)) {
        setAlertsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false);
        setAlertsOpen(false);
        setExamModalOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen, alertsOpen]);

  // Calculate upcoming exam & remaining days dynamically
  const upcomingExam = useMemo(() => {
    return getUpcomingExam(academicTerms, portalMetrics.studentDashboard, currentUser);
  }, [academicTerms, portalMetrics.studentDashboard, currentUser]);

  const daysLeft = useMemo(() => {
    if (!upcomingExam?.date) return 0;
    const now = new Date();
    const diff = upcomingExam.date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [upcomingExam]);

  const runAccountAction = (action) => {
    setAccountMenuOpen(false);
    triggerRef.current?.focus();
    action?.();
  };

  const menuKeys = (event) => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
    if (event.key === 'Tab') setAccountMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="flex h-18 items-center justify-between gap-3 px-4 sm:h-20 sm:gap-6 sm:px-6 lg:px-8">
          {/* ========================================================= */}
          {/* 1. LEFT: Clean Navigation & Page Title (No Truncation!)   */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <button
              type="button"
              onClick={onOpenNavigation}
              aria-label="Mở menu điều hướng"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 sm:flex">
              <LayoutDashboard className="h-5 w-5" />
            </span>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-[11px]">
                <span className="font-semibold tracking-wide text-blue-600">V-Eval</span>
                <ChevronRight className="h-3 w-3" />
                <span>{roleLabel}</span>
              </div>
              <p className="text-base font-bold tracking-tight text-slate-900 sm:text-lg whitespace-nowrap">
                {pageTitle}
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. CENTER: Sleek Minimalist Mission Control Pill          */}
          {/* ========================================================= */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-2">
            <button
              type="button"
              onClick={() => setExamModalOpen(true)}
              className="group flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-slate-50/80 hover:bg-indigo-50/70 hover:border-indigo-200/90 px-4 py-1.5 text-xs text-slate-700 transition-all duration-200 hover:shadow-xs"
              title="Nhấn để xem lịch thi chi tiết và cấu trúc đề thi ĐGNL"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="font-bold text-slate-800 group-hover:text-indigo-700">
                {upcomingExam.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-extrabold text-indigo-600">
                {daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? 'Hôm nay thi!' : 'Đã diễn ra'}
              </span>
              <span className="text-[11px] text-slate-400 hidden xl:inline">
                ({upcomingExam.formattedDate})
              </span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT: Unified Telemetry, Child Chip, Alerts, Profile  */}
          {/* ========================================================= */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
            {/* Live Today Date - Only on extra large screens */}
            <div className="hidden 2xl:flex items-center gap-1.5 border-r border-slate-200/70 pr-3.5 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium capitalize">{today}</span>
            </div>

            {/* Parent Role: Compact Student Companion Badge */}
            {role === 'parent' && activeChild && (
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 text-xs text-blue-900 shadow-2xs"
                title={`Học sinh: ${activeChild.studentName || activeChild.fullName}${activeChild.school ? ` • ${activeChild.school}` : ''}${activeChild.grade ? ` • ${activeChild.grade}` : ''}`}
              >
                <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 font-normal hidden md:inline">Con:</span>
                <strong className="font-bold text-slate-800 max-w-[120px] truncate">
                  {activeChild.studentName || activeChild.fullName}
                </strong>
              </div>
            )}

            {/* Student Role: Campus Badge if assigned */}
            {role === 'student' && currentUser?.campusName && (
              <div
                className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-600 shadow-2xs"
                title={currentUser.campusName}
              >
                <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate max-w-[150px] font-medium">{currentUser.campusName}</span>
              </div>
            )}

            {/* Student Role: Streak Pill */}
            {role === 'student' && streak > 0 && (
              <span
                title={`Chuỗi học tập liên tục: ${streak} ngày`}
                aria-label={`Chuỗi học tập ${streak} ngày`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200/80 bg-orange-50/80 px-2.5 py-1.5 text-xs text-orange-700 shadow-2xs"
              >
                <Flame className="h-4 w-4 fill-orange-400 text-orange-500" />
                <strong className="font-extrabold">{streak} ngày</strong>
              </span>
            )}

            {/* ========================================================= */}
            {/* Interactive Notification Bell & Popover                  */}
            {/* ========================================================= */}
            <div className="relative" ref={alertsRef}>
              <button
                type="button"
                onClick={() => setAlertsOpen((prev) => !prev)}
                aria-label={`Thông báo (${alertsData.unreadCount || 0} chưa đọc)`}
                className={`relative rounded-xl border p-2 transition-all focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  alertsOpen
                    ? 'border-blue-300 bg-blue-50 text-blue-600'
                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bell className="h-4.5 w-4.5" />
                {alertsData.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {alertsData.unreadCount > 9 ? '9+' : alertsData.unreadCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown Drawer */}
              {alertsOpen && (
                <div
                  className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-900/15 z-40 animate-in fade-in zoom-in-95 duration-150"
                  role="dialog"
                  aria-label="Hộp thông báo & Cảnh báo học tập"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Bell className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Thông Báo & Lời Khuyên</h3>
                    </div>
                    {alertsData.unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Đọc tất cả ({alertsData.unreadCount})
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {alertsData.alerts && alertsData.alerts.length > 0 ? (
                      alertsData.alerts.map((alert) => {
                        const isRed = alert.alertType === 'RED';
                        const isYellow = alert.alertType === 'YELLOW';
                        return (
                          <div
                            key={alert.alertId}
                            onClick={() => !alert.isRead && handleMarkAsRead(alert.alertId)}
                            className={`group flex items-start gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer ${
                              alert.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isRed ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                  <AlertTriangle className="h-4 w-4" />
                                </span>
                              ) : isYellow ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                  <AlertCircle className="h-4 w-4" />
                                </span>
                              ) : (
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                  <Info className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-slate-800 leading-snug">{alert.message}</p>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>{formatRelativeTime(alert.createdAt)}</span>
                                {!alert.isRead && (
                                  <span className="flex items-center gap-1 font-semibold text-blue-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                    Chưa đọc
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center px-4">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
                          <Sparkles className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Không có cảnh báo nào</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Bạn và học sinh đang duy trì nhịp độ học tập và ôn luyện rất tốt!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2 px-1 text-center">
                    <p className="text-[10px] text-slate-400">Hệ thống Cảnh báo Sớm Sư phạm V-Eval BR-04</p>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* User Profile Pill Capsule & Dropdown                      */}
            {/* ========================================================= */}
            <div
              className="relative border-l border-slate-200/80 pl-2 sm:pl-3"
              ref={containerRef}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setAccountMenuOpen(false);
              }}
            >
              <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="account-actions"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setAccountMenuOpen(true);
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl border p-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  accountMenuOpen
                    ? 'border-blue-200 bg-blue-50/70'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm shadow-blue-200">
                    {initials}
                  </span>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                    title="Đang trực tuyến"
                  />
                </div>
                <span className="hidden md:block max-w-32 leading-tight">
                  <span className="block truncate text-sm font-semibold text-slate-800">{displayName}</span>
                  <span className="block truncate text-[10px] font-medium text-slate-500">{roleLabel}</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div
                  ref={menuRef}
                  id="account-actions"
                  role="menu"
                  aria-label="Tài khoản"
                  onKeyDown={menuKeys}
                  className="absolute right-0 top-full mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200/80 bg-white p-2.5 shadow-2xl shadow-slate-900/15 z-40 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="mb-2 rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-blue-200"
                        >
                          {initials}
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-slate-900">{displayName}</p>
                        <span className="mt-1 inline-flex rounded-full border border-blue-100 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    {currentUser?.email && (
                      <p className="mt-3 truncate text-xs text-slate-500" title={currentUser.email}>
                        {currentUser.email}
                      </p>
                    )}
                    {currentUser?.campusName && (
                      <p className="mt-1 truncate text-[11px] text-slate-400" title={currentUser.campusName}>
                        📍 {currentUser.campusName}
                      </p>
                    )}
                  </div>

                  {onOpenSettings && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => runAccountAction(onOpenSettings)}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-300"
                    >
                      <span className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-500 group-hover:border-blue-100 group-hover:bg-white group-hover:text-blue-600">
                        <Settings className="h-4 w-4" />
                      </span>
                      Cài đặt tài khoản
                    </button>
                  )}

                  {onOpenLandingPage && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => runAccountAction(onOpenLandingPage)}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-300"
                    >
                      <span className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-500 group-hover:border-blue-100 group-hover:bg-white group-hover:text-blue-600">
                        <Home className="h-4 w-4" />
                      </span>
                      Về trang chủ
                    </button>
                  )}

                  {onLogout && (
                    <div className="mt-2 border-t border-slate-100 px-1 pt-3 pb-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runAccountAction(onLogout)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        <LogOut className="h-4 w-4 text-white" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 4. EXAM TIMELINE & MISSION CONTROL MODAL                 */}
      {/* ========================================================= */}
      {examModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setExamModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20 sm:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Kế Hoạch & Tiến Độ Kỳ Thi ĐGNL</h2>
                  <p className="text-xs text-slate-500">
                    Lộ trình chuẩn ĐHQG TP.HCM • Đếm ngược còn <strong>{daysLeft > 0 ? `${daysLeft} ngày` : 'Sẵn sàng'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Exam Rounds Schedule */}
            <div className="mt-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lịch Thi ĐGNL ĐHQG TP.HCM</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Round 1 */}
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                      Đợt 1
                    </span>
                    <span className="text-xs font-bold text-indigo-700">Chủ Nhật</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">Cuối Tháng 3</p>
                  <p className="text-xs text-slate-500">Mở đăng ký: Tháng 1 - Tháng 3</p>
                  <div className="mt-3 rounded-xl bg-white/80 border border-indigo-100 p-2.5 text-[11px] text-slate-600">
                    Địa điểm: TP.HCM, Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Bến Tre, Tiền Giang, An Giang, Cần Thơ, Bạc Liêu, Kiên Giang, Lâm Đồng, Bình Thuận, Khánh Hòa, Phú Yên, Bình Định, Quảng Ngãi, Đà Nẵng, Thừa Thiên Huế.
                  </div>
                </div>

                {/* Round 2 */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-sky-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                      Đợt 2
                    </span>
                    <span className="text-xs font-bold text-blue-700">Chủ Nhật</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">Cuối Tháng 5</p>
                  <p className="text-xs text-slate-500">Mở đăng ký: Tháng 4 - Tháng 5</p>
                  <div className="mt-3 rounded-xl bg-white/80 border border-blue-100 p-2.5 text-[11px] text-slate-600">
                    Địa điểm: TP.HCM, Thừa Thiên Huế, Bình Định, Khánh Hòa, Lâm Đồng, Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Tiền Giang, An Giang, Cần Thơ, Cà Mau.
                  </div>
                </div>
              </div>

              {/* Exam Format Blueprint */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cấu Trúc Đề Thi Chuẩn Hóa</h4>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                    120 câu hỏi trắc nghiệm
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                    Thời gian: 150 phút
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                    Thang điểm: 1.200 điểm (Mô hình IRT)
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/70">
                    <p className="font-bold text-slate-900">1. Ngôn ngữ</p>
                    <p className="text-[11px] text-slate-500">40 câu (Việt & Anh)</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/70">
                    <p className="font-bold text-slate-900">2. Toán & Logic</p>
                    <p className="text-[11px] text-slate-500">30 câu (Toán, Logic, Số liệu)</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/70">
                    <p className="font-bold text-slate-900">3. Giải quyết vấn đề</p>
                    <p className="text-[11px] text-slate-500">50 câu (KHTN & KHXH)</p>
                  </div>
                </div>
              </div>

              {/* Student Personal Goal if available */}
              {(portalMetrics.studentDashboard?.targetScore || activeChild?.targetScore) && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Mục Tiêu Cá Nhân</span>
                    <p className="text-sm font-extrabold text-emerald-950">
                      Chinh phục {portalMetrics.studentDashboard?.targetScore || activeChild?.targetScore} / 1.200 điểm
                    </p>
                  </div>
                  {portalMetrics.studentDashboard?.currentEstimatedScore && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-medium">Ước lượng hiện tại</span>
                      <p className="text-sm font-bold text-emerald-900">
                        {portalMetrics.studentDashboard.currentEstimatedScore} điểm
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
              >
                Đã nắm rõ lộ trình
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
