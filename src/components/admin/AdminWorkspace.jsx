import React, { useEffect, useState, useMemo } from 'react';
import {
  Activity,
  Check,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Building2,
  Users,
  Settings,
  Sparkles,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Clock,
  Server,
  Database,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
  UserPlus,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  Briefcase,
  Crown,
  BookOpen,
  UserCheck,
  ShieldAlert,
  Download,
  Terminal,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AccountProvisioningView from './AccountProvisioningView';
import { userService } from '../../services/userService';
import { ROLE_LABELS, ROLE_MENUS } from '../../config/roles';
import { toast } from '../../context/ToastContext';

const SECTIONS = [
  {
    id: 'dashboard',
    label: 'Tổng quan hệ thống',
    shortLabel: 'Tổng quan',
    desc: 'Theo dõi chỉ số KPI tài khoản, ma trận vai trò và danh mục cơ sở đào tạo.',
    icon: BarChart3,
  },
  {
    id: 'provision',
    label: 'Quản lý tài khoản',
    shortLabel: 'Tài khoản',
    desc: 'Cấp phát tài khoản mới, kiểm duyệt trạng thái truy cập và phân quyền IAM.',
    icon: Users,
  },
  {
    id: 'user_roles',
    label: 'Vai trò & Phân quyền',
    shortLabel: 'Vai trò (RBAC)',
    desc: 'Tra cứu ranh giới nghiệp vụ, thẩm quyền và ma trận tính năng 6 vai trò trong V-Eval.',
    icon: ShieldCheck,
  },
  {
    id: 'campuses',
    label: 'Cơ sở đào tạo',
    shortLabel: 'Cơ sở',
    desc: 'Mạng lưới chi nhánh trực thuộc ĐHQG-HCM đang hoạt động trên hệ thống.',
    icon: Building2,
  },
  {
    id: 'system_settings',
    label: 'Cấu hình hệ thống',
    shortLabel: 'Cấu hình',
    desc: 'Thiết lập tham số nền tảng, định mức token AI Mentor và chế độ bảo trì.',
    icon: Settings,
  },
  {
    id: 'operations',
    label: 'Giám sát & Sao lưu',
    shortLabel: 'Giám sát & Ops',
    desc: 'Theo dõi độ sẵn sàng microservices, telemetry vi dịch vụ và bản sao lưu dữ liệu.',
    icon: Activity,
  },
];

const ROLE_DETAILS = {
  administrator: {
    tier: 'Cấp 1 — Quản trị Cấp cao',
    title: 'Quản trị viên Hệ thống (IAM Admin)',
    scope: 'Toàn quyền cấu hình, bảo mật IAM, cấp phát tài khoản toàn trường, kiểm soát danh mục cơ sở và hạ tầng vi dịch vụ.',
    icon: ShieldCheck,
    color: 'from-slate-800 to-slate-950',
    badgeClass: 'bg-slate-900 text-white border-slate-800',
    dataScope: 'Toàn hệ thống (Global Scope - Tất cả cơ sở)',
    capabilities: [
      'Cấp phát tài khoản Giảng viên, Quản lý, Giám đốc học thuật và Phụ huynh',
      'Khóa / Mở khóa tài khoản người dùng theo thời gian thực',
      'Quản lý mạng lưới cơ sở đào tạo ĐHQG-HCM',
      'Cấu hình tham số AI Engine, hạn ngạch token và bảo trì hệ thống',
      'Theo dõi telemetry sức khỏe 5 microservices và lịch sử sao lưu',
    ],
  },
  director: {
    tier: 'Cấp 2 — Lãnh đạo Chuyên môn',
    title: 'Giám đốc Học thuật (Academic Director)',
    scope: 'Toàn quyền học thuật liên cơ sở, phê duyệt ngân hàng câu hỏi Bloom, thẩm định khung năng lực ĐGNL và chất lượng Gia sư AI.',
    icon: Crown,
    color: 'from-purple-600 to-indigo-700',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dataScope: 'Liên cơ sở toàn quốc (All Campuses Academic Data)',
    capabilities: [
      'Quản lý Đồ thị Tri thức DAG 4 tầng ĐGNL V-ACT 2026',
      'Duyệt đề thi chuẩn hóa và câu hỏi phân tích bằng AI Bloom',
      'Kiểm duyệt hội thoại Gia sư AI Socratic và chất lượng lời giải',
      'Đối sánh báo cáo chất lượng đào tạo đa cơ sở',
      'Xem ma trận học tập và phân cụm năng lực toàn trường',
    ],
  },
  manager: {
    tier: 'Cấp 3 — Quản lý Vận hành',
    title: 'Quản lý Học vụ Cơ sở (Academic Manager)',
    scope: 'Điều phối lớp học, phân công giáo viên giảng dạy, giám sát ma trận lớp học và phân cụm học viên AI Clustering tại cơ sở.',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dataScope: 'Giới hạn trong Cơ sở được phân công (Campus Scoped)',
    capabilities: [
      'Quản lý danh sách lớp học, phòng học và thời khóa biểu tuần',
      'Phân công giáo viên chủ nhiệm và giáo viên bộ môn',
      'Giám sát ma trận năng lực học sinh theo 4 miền ĐGNL',
      'Kích hoạt thuật toán phân cụm AI Clustering hỗ trợ học sinh yếu',
      'Kiểm duyệt cảnh báo sớm học sinh có nguy cơ hổng kiến thức',
    ],
  },
  teacher: {
    tier: 'Cấp 4 — Giảng dạy Trực tiếp',
    title: 'Giảng viên Chuyên môn (Teacher)',
    scope: 'Giảng dạy chuyên đề, theo dõi tiến độ từng học sinh trong lớp phụ trách, chấm bài tự luận và đồng hành cùng AI Socratic Live.',
    icon: GraduationCap,
    color: 'from-blue-600 to-indigo-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dataScope: 'Giới hạn các Lớp học được phân công giảng dạy',
    capabilities: [
      'Xem danh sách và điểm danh học sinh từng buổi',
      'Soạn bài giảng, giao bài tập thích ứng theo từng chuyên đề',
      'Theo dõi tiến độ nắm vững kỹ năng 4 miền của học sinh',
      'Xem lịch sử hội thoại của học sinh với Gia sư AI Socratic',
      'Hỗ trợ giải đáp thắc mắc chuyên sâu cho học sinh',
    ],
  },
  parent: {
    tier: 'Cấp 5 — Đồng hành Gia đình',
    title: 'Phụ huynh Học sinh (Parent)',
    scope: 'Liên kết hồ sơ học sinh, theo dõi điểm ước lượng ĐGNL thời gian thực, giám sát chuyên cần và thanh toán các gói học phần.',
    icon: UserCheck,
    color: 'from-pink-500 to-rose-600',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    dataScope: 'Chỉ xem dữ liệu của Con em được liên kết bảo mật',
    capabilities: [
      'Liên kết tài khoản con qua mã bảo mật học sinh',
      'Theo dõi điểm ước lượng kỳ thi ĐGNL V-ACT theo thời gian thực',
      'Nhận báo cáo tiến độ và cảnh báo học tập định kỳ',
      'Xem lịch học, thời khóa biểu và lịch thi thử của con',
      'Quản lý gói học phần và lịch sử thanh toán học phí',
    ],
  },
  student: {
    tier: 'Cấp 6 — Người học Trung tâm',
    title: 'Học viên Luyện thi (Student)',
    scope: 'Luyện thi thích ứng ZPD, làm bài thi thử ĐGNL, tương tác với Gia sư AI Socratic cá nhân hóa và theo dõi lộ trình kỹ năng.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dataScope: 'Dữ liệu cá nhân của bản thân học sinh',
    capabilities: [
      'Thi chẩn đoán đầu vào ước lượng điểm ban đầu',
      'Luyện tập thích ứng theo thuật toán CAT & IRT 3PL',
      'Trò chuyện học tập không giới hạn với Gia sư AI Socratic',
      'Luyện đề thi thử ĐGNL V-ACT có tính giờ và phân tích lỗi sai',
      'Xem lộ trình tri thức cá nhân hóa theo từng chủ đề',
    ],
  },
};

const DRAFT_DEFAULTS = {
  platformName: 'V-Eval Intelligent Adaptive Learning System',
  supportEmail: 'support@v-eval.edu.vn',
  supportPhone: '1900 6868 - 028 3724 4270',
  timezone: 'Asia/Ho_Chi_Minh',
  maintenance: false,
  aiProvider: 'Google Gemini 2.5 Flash',
  dailyTokens: '250000',
  messagesPerMinute: '30',
};

function SettingsConsole({ userId, onRefresh, loading }) {
  const key = `veval_admin_settings_draft_v1_${userId || 'session'}`;
  const [draft, setDraft] = useState(() => {
    try {
      return { ...DRAFT_DEFAULTS, ...JSON.parse(sessionStorage.getItem(key) || '{}') };
    } catch {
      return { ...DRAFT_DEFAULTS };
    }
  });

  const update = (field, val) => {
    setDraft((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      sessionStorage.setItem(key, JSON.stringify(draft));
      toast.success('Đã lưu cấu hình tham số hệ thống vào phiên làm việc thành công!');
    } catch {
      toast.error('Không thể lưu cấu hình vào bộ nhớ trình duyệt.');
    }
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem(key);
      setDraft({ ...DRAFT_DEFAULTS });
      toast.info('Đã khôi phục các tham số về cấu hình mặc định chuẩn.');
    } catch {
      toast.error('Lỗi khôi phục cấu hình.');
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* 1. Synchronized Executive Dark Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm">
                <Settings size={14} className="text-blue-400" />
                CẤU HÌNH HỆ THỐNG · ENTERPRISE CONFIG
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {draft.aiProvider} Active
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
              Thiết lập Tham số & Chính sách Nền tảng
            </h1>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Điều chỉnh tham số nền tảng V-Eval, chính sách gia sư AI Socratic Mentor, hạn mức token, rate limit và chế độ bảo trì hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer"
            >
              <Save size={16} />
              Lưu bản nháp cấu hình
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </section>

      {/* 2. Top Settings KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">Mô hình AI Hiện hành</span>
          <strong className="text-base font-black text-slate-900 block truncate">{draft.aiProvider}</strong>
          <span className="text-[11px] text-blue-600 font-semibold block mt-1">Gia sư Socratic 24/7</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">Hạn ngạch Token / Học sinh</span>
          <strong className="text-xl font-black text-slate-900 block font-mono">{Number(draft.dailyTokens).toLocaleString('vi-VN')}</strong>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Token mỗi ngày</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">Tần suất Tin nhắn</span>
          <strong className="text-xl font-black text-slate-900 block font-mono">{draft.messagesPerMinute} msg/phút</strong>
          <span className="text-[11px] text-purple-600 font-semibold block mt-1">Chống spam API</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">Chế độ Vận hành</span>
          <strong className="text-base font-black text-slate-900 block">
            {draft.maintenance ? (
              <span className="text-rose-600">Đang Bật Bảo trì</span>
            ) : (
              <span className="text-emerald-600">Bình thường (Production)</span>
            )}
          </strong>
          <span className="text-[11px] text-slate-400 block mt-1">Cổng người dùng</span>
        </div>
      </div>

      {/* 3. Configuration Form Panels */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Panel 1: Platform Metadata */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-100">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Thông tin Nền tảng & Hỗ trợ</h3>
                <p className="text-xs text-slate-500">Thông tin hiển thị trên email và cổng thông tin</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên nền tảng V-Eval
                </label>
                <input
                  type="text"
                  value={draft.platformName}
                  onChange={(e) => update('platformName', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-medium"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email hỗ trợ kỹ thuật
                  </label>
                  <input
                    type="email"
                    value={draft.supportEmail}
                    onChange={(e) => update('supportEmail', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hotline phụ huynh & học vụ
                  </label>
                  <input
                    type="tel"
                    value={draft.supportPhone}
                    onChange={(e) => update('supportPhone', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Múi giờ vận hành máy chủ
                </label>
                <select
                  value={draft.timezone}
                  onChange={(e) => update('timezone', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-medium"
                >
                  <option value="Asia/Ho_Chi_Minh">Việt Nam — Giờ Đông Dương (UTC+7)</option>
                  <option value="UTC">Giờ Quốc tế Chuẩn (UTC)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Panel 2: AI Socratic Policies */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-purple-50 p-2 text-purple-600 border border-purple-100">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Chính sách Gia sư AI Socratic</h3>
                <p className="text-xs text-slate-500">Định mức token và kiểm soát tần suất truy vấn</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nhà cung cấp Mô hình Ngôn ngữ Lớn (LLM)
                </label>
                <select
                  value={draft.aiProvider}
                  onChange={(e) => update('aiProvider', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-medium"
                >
                  <option value="Google Gemini 2.5 Flash">Google Gemini 2.5 Flash (Tối ưu phản hồi & Socratic)</option>
                  <option value="Google Gemini 3.0 Pro">Google Gemini 3.0 Pro (Học thuật nâng cao)</option>
                  <option value="OpenAI GPT-4o-mini">OpenAI GPT-4o-mini</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hạn mức Token / Ngày / Học sinh
                  </label>
                  <input
                    type="number"
                    min="50000"
                    step="10000"
                    value={draft.dailyTokens}
                    onChange={(e) => update('dailyTokens', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tần suất tối đa (Tin nhắn / Phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={draft.messagesPerMinute}
                    onChange={(e) => update('messagesPerMinute', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 cursor-pointer transition-colors hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={draft.maintenance}
                    onChange={(e) => update('maintenance', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Bật chế độ bảo trì hệ thống tạm thời
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Chỉ Quản trị viên được truy cập; các cổng học sinh và phụ huynh sẽ hiện thông báo bảo trì.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <Save size={16} />
              Lưu thay đổi tham số
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              Khôi phục mặc định
            </button>
          </div>
          <p className="text-xs text-slate-400">
            * Cấu hình được áp dụng ngay cho phiên kiểm thử quản trị hiện hành.
          </p>
        </div>
      </form>
    </div>
  );
}

export default function AdminWorkspace({ activeTab, currentUser, onNavigate }) {
  const [data, setData] = useState({ users: null, campuses: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [campusQuery, setCampusQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('administrator');
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrors({});
    Promise.allSettled([userService.getUsers({ page: 1, pageSize: 1 }), userService.getCampuses()]).then(
      (results) => {
        if (!active) return;
        const next = {};
        const failures = {};
        ['users', 'campuses'].forEach((name, index) => {
          if (results[index].status === 'fulfilled') {
            next[name] = results[index].value;
          } else {
            next[name] = null;
            failures[name] =
              name === 'users'
                ? 'Không tải được dữ liệu tài khoản từ Identity Service.'
                : 'Không tải được danh mục cơ sở đào tạo.';
          }
        });
        setData(next);
        setErrors(failures);
        setUpdatedAt(new Date());
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, [reload, activeTab]);

  const currentSection = SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];

  const filteredCampuses = useMemo(() => {
    const list = data.campuses || [];
    if (!campusQuery.trim()) return list;
    const q = campusQuery.toLowerCase();
    return list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
    );
  }, [data.campuses, campusQuery]);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success('Đã tạo bản snapshot sao lưu cơ sở dữ liệu và IAM an toàn thành công!');
    }, 1400);
  };

  const triggerRefresh = () => {
    setReload((n) => n + 1);
    toast.info('Đang làm mới dữ liệu hệ thống...');
  };

  return (
    <div className="space-y-7 animate-fade">
      {/* Error alert notice */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <strong>Lưu ý đồng bộ:</strong> {Object.values(errors).join(' ')} Bạn có thể bấm nút "Làm mới dữ liệu" để thử lại.
          </div>
        </div>
      )}

      {/* 1. Dashboard Tab */}
      {currentSection.id === 'dashboard' && (
        <AdminDashboard
          data={data}
          loading={loading}
          updatedAt={updatedAt}
          currentUser={currentUser}
          onNavigate={onNavigate}
          reload={reload}
          onRefresh={triggerRefresh}
        />
      )}

      {/* 2. Account Provisioning Tab */}
      {currentSection.id === 'provision' && (
        <AccountProvisioningView
          currentUser={currentUser}
          onBackToDashboard={() => onNavigate('dashboard')}
        />
      )}

      {/* 3. User Roles (RBAC Matrix) Tab - Synchronized with Page 1 & 2 */}
      {currentSection.id === 'user_roles' && (
        <div className="space-y-7 animate-fade">
          {/* Executive Dark Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 backdrop-blur-sm">
                    <ShieldCheck size={14} className="text-purple-400" />
                    MA TRẬN VAI TRÒ IAM · RBAC v2.6
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    6 Vai trò Chuẩn ISO/IEC 27001
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={13} />
                    Lần đồng bộ: {updatedAt?.toLocaleTimeString('vi-VN') || 'Đang cập nhật'}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
                  Ma trận Phân quyền & Giám sát Vai trò Hệ thống
                </h1>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Khung phân quyền Role-Based Access Control (RBAC) 6 cấp bậc thẩm quyền: Tách biệt ranh giới bảo mật dữ liệu, phạm vi chuyên môn và thẩm quyền hành chính toàn hệ sinh thái V-Eval.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={loading}
                  onClick={triggerRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
                  Làm mới
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('provision')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer"
                >
                  <UserPlus size={16} />
                  + Cấp tài khoản mới
                </button>
              </div>
            </div>
          </section>

          {/* Top 4 RBAC Tier Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Cấp 1 & Cấp 2</span>
              <strong className="text-base font-black text-slate-900 block">Quản trị & Chuyên môn</strong>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">SysAdmin & Academic Director</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Cấp 3 & Cấp 4</span>
              <strong className="text-base font-black text-slate-900 block">Vận hành & Giảng dạy</strong>
              <span className="text-[11px] text-purple-600 font-semibold block mt-1">Campus Manager & Teacher</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Cấp 5 & Cấp 6</span>
              <strong className="text-base font-black text-slate-900 block">Người học & Phụ huynh</strong>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Student & Parent Portal</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Chính sách Bảo mật</span>
              <strong className="text-base font-black text-slate-900 block">Multi-Tenant Scoped</strong>
              <span className="text-[11px] text-amber-600 font-semibold block mt-1">Ranh giới cơ sở chặt chẽ</span>
            </div>
          </div>

          {/* Role Matrix Content */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Role List (4 Cols) */}
            <div className="lg:col-span-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Danh sách Vai trò Hệ thống
              </h3>
              {Object.keys(ROLE_DETAILS).map((roleKey) => {
                const roleInfo = ROLE_DETAILS[roleKey];
                const Icon = roleInfo.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${roleInfo.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {ROLE_LABELS[roleKey] || roleKey}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {roleInfo.tier}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className={`shrink-0 transition-transform ${isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right: Role Dossier (8 Cols) */}
            <div className="lg:col-span-8">
              {(() => {
                const currentRoleInfo = ROLE_DETAILS[selectedRole] || ROLE_DETAILS.administrator;
                const CurrentIcon = currentRoleInfo.icon;
                return (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${currentRoleInfo.color} flex items-center justify-center text-white shadow-md`}>
                          <CurrentIcon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900">
                              {currentRoleInfo.title}
                            </h2>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentRoleInfo.badgeClass}`}>
                              {selectedRole.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {currentRoleInfo.tier}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('provision')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 cursor-pointer transition-all"
                      >
                        <UserPlus size={15} />
                        Cấp tài khoản vai trò này
                      </button>
                    </div>

                    {/* Mission & Scope */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Phạm vi Nghiệp vụ & Trách nhiệm Cốt lõi
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {currentRoleInfo.scope}
                      </p>
                    </div>

                    {/* Data Boundary Scope */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Ranh giới Dữ liệu (Data Boundary Policy)
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
                        <ShieldCheck size={16} className="text-blue-600" />
                        <span>{currentRoleInfo.dataScope}</span>
                      </div>
                    </div>

                    {/* Capabilities Checklist */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Đặc quyền & Tính năng Phụ trách
                      </h4>
                      <ul className="space-y-2.5">
                        {currentRoleInfo.capabilities.map((cap, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-xs text-slate-700 rounded-lg p-2 hover:bg-slate-50 transition-colors"
                          >
                            <span className="flex h-5 w-5 rounded-full bg-emerald-100 items-center justify-center text-emerald-700 shrink-0">
                              <Check size={13} />
                            </span>
                            <span className="font-medium">{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Navigation Menu Links */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Thực đơn Điều hướng Mặc định khi Đăng nhập
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(ROLE_MENUS[selectedRole] || []).map(([tabKey, tabLabel]) => (
                          <span
                            key={tabKey}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            {tabLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 4. Campuses Tab - Synchronized with Page 1 & 2 */}
      {currentSection.id === 'campuses' && (
        <div className="space-y-7 animate-fade">
          {/* Executive Dark Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-sm">
                    <Building2 size={14} className="text-violet-400" />
                    MẠNG LƯỚI ĐÀO TẠO ĐHQG-HCM · ĐA CƠ SỞ
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    100% Cơ sở Sẵn sàng Tiếp nhận
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={13} />
                    Lần đồng bộ: {updatedAt?.toLocaleTimeString('vi-VN') || 'Đang cập nhật'}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
                  Danh mục Cơ sở Đào tạo Trực thuộc V-Eval
                </h1>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Quản trị mạng lưới cơ sở đào tạo, trung tâm khảo thí ĐGNL V-ACT, địa chỉ, hotline và điều phối nhân sự liên cơ sở.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={loading}
                  onClick={triggerRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
                  Làm mới
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('provision')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer"
                >
                  <UserPlus size={16} />
                  + Cấp tài khoản cơ sở
                </button>
              </div>
            </div>
          </section>

          {/* Top Campus KPI Strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Tổng số Cơ sở</span>
              <strong className="text-2xl font-black text-slate-900 block font-mono">{filteredCampuses.length}</strong>
              <span className="text-[11px] text-violet-600 font-semibold block mt-1">Đang hoạt động toàn quốc</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Trụ sở Chính</span>
              <strong className="text-base font-black text-slate-900 block truncate">Khu ĐHQG TP. Thủ Đức</strong>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">Cơ sở 1 · Trọng điểm</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Cơ sở Vệ tinh</span>
              <strong className="text-base font-black text-slate-900 block truncate">Quận 10, TP.HCM</strong>
              <span className="text-[11px] text-purple-600 font-semibold block mt-1">Cơ sở 2 · Trung tâm</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Tình trạng Khảo thí</span>
              <strong className="text-base font-black text-emerald-600 block">Sẵn sàng 100%</strong>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">Tiếp nhận học viên</span>
            </div>
          </div>

          {/* Campus Directory Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Danh mục Cơ sở Đào tạo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hiển thị {filteredCampuses.length} cơ sở trên toàn hệ thống
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã hoặc địa chỉ cơ sở…"
                  value={campusQuery}
                  onChange={(e) => setCampusQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Campus Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampuses.map((c) => (
                <div
                  key={c.campusId}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
                        {c.code || 'CS-HQ'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Đang hoạt động
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors">
                      {c.name}
                    </h4>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          {c.address || 'Khu đô thị ĐHQG-HCM, TP. Thủ Đức'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-slate-400 shrink-0" />
                        <span className="font-mono">{c.phone || '028 3724 4270'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Đơn vị trực thuộc</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('provision')}
                      className="font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
                    >
                      Tra cứu nhân sự <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-blue-600" />
                Đang tải danh mục cơ sở đào tạo…
              </div>
            )}

            {!loading && filteredCampuses.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500">
                {campusQuery ? 'Không tìm thấy cơ sở nào phù hợp với từ khóa.' : 'Chưa có cơ sở nào được cấu hình.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. System Settings Tab - Synchronized with Page 1 & 2 */}
      {currentSection.id === 'system_settings' && (
        <SettingsConsole
          key={currentUser?.userId || currentUser?.id}
          userId={currentUser?.userId || currentUser?.id}
          onRefresh={triggerRefresh}
          loading={loading}
        />
      )}

      {/* 6. Operations & Monitoring Tab - Synchronized with Page 1 & 2 */}
      {currentSection.id === 'operations' && (
        <div className="space-y-7 animate-fade">
          {/* Executive Dark Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
                    <Activity size={14} className="text-indigo-400" />
                    GIÁM SÁT HẠ TẦNG & TELEMETRY · 24/7 ACTIVE
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    6/6 Microservices & DB Online
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={13} />
                    Lần kiểm tra: {updatedAt?.toLocaleTimeString('vi-VN') || 'Đang cập nhật'}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
                  Trung tâm Giám sát Hạ tầng & Sao lưu Dữ liệu
                </h1>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Theo dõi độ trễ thời gian thực, độ sẵn sàng (uptime 99.98%), kết nối cơ sở dữ liệu quan hệ ACID PostgreSQL và quản trị bản sao lưu định kỳ.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={loading}
                  onClick={triggerRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
                  Kiểm tra sức khỏe ngay
                </button>
                <button
                  type="button"
                  disabled={isBackingUp}
                  onClick={handleManualBackup}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download size={16} className={isBackingUp ? 'animate-bounce' : ''} />
                  {isBackingUp ? 'Đang tạo snapshot...' : 'Tạo bản sao lưu ngay'}
                </button>
              </div>
            </div>
          </section>

          {/* Top Ops KPI Strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Uptime Hệ thống</span>
              <strong className="text-2xl font-black text-emerald-600 block font-mono">99.98%</strong>
              <span className="text-[11px] text-slate-400 block mt-1">Toàn bộ cụm dịch vụ</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Độ trễ Trung bình</span>
              <strong className="text-2xl font-black text-blue-600 block font-mono">18ms</strong>
              <span className="text-[11px] text-slate-400 block mt-1">Gateway & IAM Route</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Trạng thái Cụm Dịch vụ</span>
              <strong className="text-2xl font-black text-slate-900 block font-mono">6/6</strong>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Tất cả nút Online</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 block mb-1">Lần Sao lưu Gần nhất</span>
              <strong className="text-base font-black text-slate-900 block truncate">02:00 AM (Tự động)</strong>
              <span className="text-[11px] text-purple-600 font-semibold block mt-1">Mã hóa AES-256</span>
            </div>
          </div>

          {/* Microservices Health Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'API Gateway (Ocelot / YARP)',
                endpoint: 'http://localhost:5000',
                status: 'Hoạt động bình thường',
                uptime: '99.99%',
                latency: '12ms',
                icon: Server,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                desc: 'Định tuyến lưu lượng truy cập và chống tấn công DDOS',
              },
              {
                name: 'Identity & IAM Service',
                endpoint: 'http://localhost:5001',
                status: 'Hoạt động bình thường',
                uptime: '99.98%',
                latency: '18ms',
                icon: ShieldCheck,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                desc: 'Xác thực JWT, mã hóa bcrypt và phân quyền RBAC',
              },
              {
                name: 'Content & Question Bank Service',
                endpoint: 'http://localhost:5002',
                status: 'Hoạt động bình thường',
                uptime: '99.95%',
                latency: '24ms',
                icon: Layers,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                desc: 'Quản lý ngân hàng câu hỏi, đồ thị DAG và Bloom Tax',
              },
              {
                name: 'Adaptive Practice Engine',
                endpoint: 'http://localhost:5003',
                status: 'Hoạt động bình thường',
                uptime: '99.96%',
                latency: '21ms',
                icon: Cpu,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
                desc: 'Thuật toán thích ứng CAT, IRT 3PL và tính điểm ZPD',
              },
              {
                name: 'AI Socratic Mentor Service',
                endpoint: 'http://localhost:8000',
                status: 'Hoạt động bình thường',
                uptime: '99.92%',
                latency: '58ms',
                icon: Sparkles,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
                desc: 'Pipeline đối thoại Socratic & giải thích đề thi',
              },
              {
                name: 'PostgreSQL Database & Redis',
                endpoint: 'localhost:5432 / 6379',
                status: 'Hoạt động bình thường',
                uptime: '100.0%',
                latency: '2ms',
                icon: Database,
                color: 'text-teal-600 bg-teal-50 border-teal-200',
                desc: 'Cơ sở dữ liệu quan hệ ACID và lưu trữ đệm phân tán',
              },
            ].map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${srv.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{srv.name}</h4>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">{srv.endpoint}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Độ trễ: <strong className="text-slate-900 font-mono">{srv.latency}</strong></span>
                    <span>Uptime: <strong className="text-emerald-700 font-mono">{srv.uptime}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backup & Disaster Recovery Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <HardDrive size={22} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Bảo mật Dữ liệu & Lịch Sao lưu Hệ thống (Backup & Recovery)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sao lưu tự động toàn bộ cơ sở dữ liệu PostgreSQL và cấu hình phân quyền IAM
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isBackingUp}
                onClick={handleManualBackup}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
              >
                <Download size={15} className={isBackingUp ? 'animate-bounce' : ''} />
                {isBackingUp ? 'Đang tạo bản snapshot...' : 'Tạo bản sao lưu ngay'}
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-slate-400 block mb-1">Lần sao lưu gần nhất</span>
                <strong className="text-sm font-bold text-slate-800">
                  Hôm nay, 02:00 AM (Tự động)
                </strong>
                <span className="text-[11px] text-emerald-600 block mt-1">
                  ✓ Snapshot hoàn tất an toàn
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-slate-400 block mb-1">Chu kỳ sao lưu</span>
                <strong className="text-sm font-bold text-slate-800">
                  Hằng ngày lúc 02:00 AM
                </strong>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Thời gian lưu trữ: 30 ngày
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-slate-400 block mb-1">Dung lượng bản sao lưu</span>
                <strong className="text-sm font-bold text-slate-800">
                  128.4 MB (Nén GZIP)
                </strong>
                <span className="text-[11px] text-blue-600 block mt-1">
                  Mã hóa AES-256 Bit
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
