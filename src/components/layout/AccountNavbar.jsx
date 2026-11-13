import { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, ChevronRight, Flame, Home, LayoutDashboard, LogOut, Menu, Settings } from 'lucide-react';
import { accountRoleLabel } from '../../utils/accountPresentation';

export default function AccountNavbar({ role = 'student', pageTitle = 'Tổng quan', currentUser,
  portalMetrics = {}, onLogout, onOpenLandingPage, onOpenSettings, onOpenNavigation }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const roleLabel = accountRoleLabel(role, currentUser);
  const displayName = currentUser?.fullName?.trim() || roleLabel;
  const initials = displayName.split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase();
  const rawStreak = Number(portalMetrics.studentDashboard?.streakAnalytics?.currentStreak ?? 0);
  const streak = Number.isFinite(rawStreak) ? Math.max(0, Math.floor(rawStreak)) : 0;
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'Asia/Bangkok'
  }).format(new Date());

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector('[role="menuitem"]')?.focus();
    const outside = (event) => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const run = (action) => { setOpen(false); trigger.current?.focus(); action?.(); };
  const menuKeys = (event) => {
    const items = [...menu.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
    if (event.key === 'Tab') setOpen(false);
  };

  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-gradient-to-r from-white via-white to-blue-50/40 shadow-sm shadow-slate-200/30 backdrop-blur-md">
    <div className="flex h-18 items-center justify-between gap-3 px-4 sm:h-20 sm:gap-5 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" onClick={onOpenNavigation} aria-label="Mở menu điều hướng"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 sm:flex">
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-[11px]">
            <span className="font-semibold tracking-wide text-blue-600">V-Eval</span>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate">{roleLabel}</span>
          </div>
          <p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-lg">{pageTitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:gap-4">
        <div className="hidden items-center gap-2 border-r border-slate-200/70 pr-4 text-slate-500 xl:flex">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium capitalize">{today}</span>
        </div>
        {role === 'student' && <span title={`Chuỗi học tập: ${streak} ngày`} aria-label={`Chuỗi học tập ${streak} ngày`}
          className={`inline-flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-xs ${streak ? 'border-orange-100 bg-orange-50/80 text-orange-700' : 'border-slate-200/70 bg-white text-slate-500'}`}>
          <Flame className={`h-4 w-4 sm:h-5 sm:w-5 ${streak ? 'fill-orange-300 text-orange-500' : 'text-orange-400'}`} />
          <span className="flex flex-col leading-tight">
            <span className="hidden text-[9px] font-medium text-slate-500 sm:block">Chuỗi học tập</span>
            <strong className="mt-0.5 text-xs sm:text-sm">{streak}<span className="hidden sm:inline"> ngày</span></strong>
          </span>
        </span>}
        <button type="button" disabled title="Thông báo đang được hoàn thiện" aria-label="Thông báo đang được hoàn thiện"
          className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-400 shadow-xs"><Bell className="h-4.5 w-4.5" /></button>
        <div className="relative border-l border-slate-100 pl-2 sm:pl-3" ref={container}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
          <button ref={trigger} type="button" aria-haspopup="menu" aria-expanded={open} aria-controls="account-actions"
            onClick={() => setOpen((value) => !value)}
            onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}
            className={`flex items-center gap-2.5 rounded-2xl border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${open ? 'border-blue-200 bg-blue-50/70' : 'border-transparent hover:border-slate-200 hover:bg-white'}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm shadow-blue-200">{initials}</span>
            <span className="hidden max-w-36 sm:block">
              <span className="block truncate text-sm font-semibold text-slate-800">{displayName}</span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-500">{roleLabel}</span>
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && <div ref={menu} id="account-actions" role="menu" aria-label="Tài khoản" onKeyDown={menuKeys}
            className="absolute right-0 top-full mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200/80 bg-white p-2.5 shadow-2xl shadow-slate-900/15">
            <div className="mb-2 rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-blue-200">{initials}</span>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">{displayName}</p>
                  <span className="mt-1 inline-flex rounded-full border border-blue-100 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{roleLabel}</span>
                </div>
              </div>
              <p className="mt-3 truncate text-xs text-slate-500" title={currentUser?.email}>{currentUser?.email}</p>
            </div>
            {onOpenSettings && <button type="button" role="menuitem" onClick={() => run(onOpenSettings)} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-300"><span className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-500 group-hover:border-blue-100 group-hover:bg-white group-hover:text-blue-600"><Settings className="h-4 w-4" /></span>Cài đặt tài khoản</button>}
            {onOpenLandingPage && <button type="button" role="menuitem" onClick={() => run(onOpenLandingPage)} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-300"><span className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-500 group-hover:border-blue-100 group-hover:bg-white group-hover:text-blue-600"><Home className="h-4 w-4" /></span>Về trang chủ</button>}
            {onLogout && <div className="mt-2 border-t border-slate-100 px-1 pt-3 pb-1"><button type="button" role="menuitem" onClick={() => run(onLogout)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"><LogOut className="h-4 w-4 text-white" />Đăng xuất</button></div>}
          </div>}
        </div>
      </div>
    </div>
  </header>;
}
