import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { ROLE_LABELS, ROLE_MENUS } from '../../config/roles';

export default function RoleWorkspace({ role, activeTab, currentUser, onNavigate }) {
  const menu = ROLE_MENUS[role] || ROLE_MENUS.unknown;
  const title = menu.find(([id]) => id === activeTab)?.[1] || 'Tổng quan';
  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"><LayoutDashboard size={18} />{ROLE_LABELS[role]}</div>
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Xin chào {currentUser?.fullName || 'bạn'}. {role === 'unknown' ? 'Tài khoản chưa có vai trò được hỗ trợ. Vui lòng liên hệ quản trị viên.' : 'Chọn chức năng trong menu để vào khu vực làm việc của bạn.'}</p>
    </section>
    {activeTab === 'dashboard' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {menu.filter(([id]) => id !== 'dashboard').map(([id, label]) => <button key={id} type="button" onClick={() => onNavigate(id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600">
        {label}<ArrowRight size={18} className="shrink-0" />
      </button>)}
    </div> : <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-800">Chức năng đang được hoàn thiện</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">Khu vực {title.toLocaleLowerCase('vi-VN')} đã được bố trí cho vai trò {ROLE_LABELS[role]}. Màn hình nghiệp vụ chưa được kết nối dữ liệu.</p>
      <button type="button" onClick={() => onNavigate('dashboard')} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Về tổng quan</button>
    </section>}
  </div>;
}
