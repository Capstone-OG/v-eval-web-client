import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  Mail, 
  Phone, 
  Key, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  Unlock, 
  UserCheck, 
  Briefcase, 
  Crown, 
  X,
  Check,
  Loader2,
  Archive,
  RotateCcw,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { validateEmailComprehensive } from '../../utils/emailValidator';
import { toast } from '../../context/ToastContext';

const ROLE_CONFIG = {
  TEACHER: {
    label: 'Giảng viên Cơ sở',
    code: 'TEACHER',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    avatarClass: 'from-blue-600 to-indigo-600 shadow-blue-500/20',
    icon: GraduationCap,
    desc: 'Giảng dạy, luyện thi chuyên sâu, chấm bài & hướng dẫn Socratic Live'
  },
  ACADEMIC_MANAGER: {
    label: 'Quản lý Học thuật Cơ sở',
    code: 'ACADEMIC_MANAGER',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    avatarClass: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    icon: Briefcase,
    desc: 'Điều phối lớp học, phân cụm học viên AI Clustering & quản trị cơ sở'
  },
  ACADEMIC_DIRECTOR: {
    label: 'Giám đốc Học thuật',
    code: 'ACADEMIC_DIRECTOR',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    avatarClass: 'from-purple-600 to-indigo-700 shadow-purple-500/20',
    icon: Crown,
    desc: 'Toàn quyền học thuật liên cơ sở, phê duyệt ngân hàng câu hỏi & lộ trình'
  },
  ADMINISTRATOR: {
    label: 'Quản trị viên Hệ thống',
    code: 'ADMINISTRATOR',
    badgeClass: 'bg-slate-900 text-white border-slate-800',
    avatarClass: 'from-slate-700 to-slate-900 shadow-slate-500/20',
    icon: ShieldCheck,
    desc: 'Quản trị hệ thống, cấp phát tài khoản toàn quyền & bảo mật IAM'
  },
  PARENT: {
    label: 'Phụ huynh Học sinh',
    code: 'PARENT',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200/80',
    avatarClass: 'from-pink-500 to-rose-600 shadow-pink-500/20',
    icon: UserCheck,
    desc: 'Cổng theo dõi điểm ước lượng ĐGNL, tiến độ & cảnh báo AI'
  },
  STUDENT: {
    label: 'Học viên ĐGNL',
    code: 'STUDENT',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    avatarClass: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    icon: BookOpen,
    desc: 'Luyện thi thích ứng ZPD, đề thi chẩn đoán & Socratic AI Tutor'
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getUnitDisplay = (user, primaryRole) => {
  const rawCampus = user.campusName || '';
  const shortCampus = rawCampus
    .replace('Cơ sở 1 - Khu đô thị ĐHQG-HCM, TP. Thủ Đức', 'Cơ sở 1 — ĐHQG TP. Thủ Đức')
    .replace('Cơ sở 2 - Quận 10, TP.HCM', 'Cơ sở 2 — Quận 10, TP.HCM');

  if (primaryRole === 'ACADEMIC_DIRECTOR') {
    return {
      title: 'Hội đồng Học thuật Toàn trường',
      subtitle: 'Điều phối đào tạo liên cơ sở',
      subtitleColor: 'text-purple-600'
    };
  }
  if (primaryRole === 'ADMINISTRATOR') {
    return {
      title: 'Trung tâm Quản trị Hệ thống (IAM)',
      subtitle: 'Toàn quyền cấu hình & bảo mật',
      subtitleColor: 'text-slate-500'
    };
  }
  if (primaryRole === 'PARENT') {
    return {
      title: 'Cổng Phụ huynh Đồng hành',
      subtitle: 'Theo dõi lộ trình & điểm số học viên',
      subtitleColor: 'text-pink-600'
    };
  }
  if (primaryRole === 'TEACHER') {
    return {
      title: shortCampus || 'Cơ sở 1 — ĐHQG TP. Thủ Đức',
      subtitle: user.specialty ? `Chuyên môn: ${user.specialty}` : 'Giảng viên luyện thi ĐGNL',
      subtitleColor: 'text-indigo-600'
    };
  }
  if (primaryRole === 'ACADEMIC_MANAGER') {
    return {
      title: shortCampus || 'Cơ sở 1 — ĐHQG TP. Thủ Đức',
      subtitle: 'Quản lý vận hành & ma trận lớp học',
      subtitleColor: 'text-amber-600'
    };
  }
  return {
    title: shortCampus || 'Cơ sở 1 — ĐHQG TP. Thủ Đức',
    subtitle: 'Học viên luyện thi V-ACT 2026',
    subtitleColor: 'text-emerald-600'
  };
};

export default function AccountProvisioningView({ onBackToDashboard }) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [campuses, setCampuses] = useState([]);

  // Status & Role Filters
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [statusTab, setStatusTab] = useState('ACTIVE'); // 'ACTIVE' | 'INACTIVE' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  // Status Action Modals (Soft Delete / Reactivate)
  const [deactivateModalUser, setDeactivateModalUser] = useState(null);
  const [reactivateModalUser, setReactivateModalUser] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roleName: 'TEACHER',
    fullName: '',
    email: '',
    phone: '',
    campusId: '',
    specialty: 'Toán & Tư duy Logic',
    password: 'Password123@'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Multi-layer Email Validation State
  const [emailValidationStatus, setEmailValidationStatus] = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [emailValidationMsg, setEmailValidationMsg] = useState('');
  const [emailSuggestedFix, setEmailSuggestedFix] = useState(null);

  const handleEmailBlur = async (rawEmail) => {
    const trimmed = (rawEmail || '').trim().toLowerCase();
    if (!trimmed) {
      setEmailValidationStatus('idle');
      setEmailValidationMsg('');
      setEmailSuggestedFix(null);
      return;
    }

    setEmailValidationStatus('checking');
    setEmailValidationMsg('');
    setEmailSuggestedFix(null);

    try {
      const res = await validateEmailComprehensive(trimmed, (em) =>
        authService.validateEmail(em)
      );

      if (res.isValid) {
        setEmailValidationStatus('valid');
        setEmailValidationMsg(res.message || 'Email hợp lệ (Máy chủ thư MX hoạt động).');
        setEmailSuggestedFix(null);
        setErrorMsg('');
      } else {
        setEmailValidationStatus('invalid');
        setEmailValidationMsg(res.message || 'Email không hợp lệ.');
        setEmailSuggestedFix(res.suggestedEmail || null);
        setErrorMsg(res.message || 'Email không hợp lệ.');
      }
    } catch {
      setEmailValidationStatus('idle');
    }
  };

  // Load Campuses & Users
  useEffect(() => {
    loadCampuses();
    loadUsers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [selectedRole, statusTab]);

  const loadCampuses = async () => {
    try {
      const data = await userService.getCampuses();
      setCampuses(data || []);
      if (data?.length > 0 && !formData.campusId) {
        setFormData(prev => ({ ...prev, campusId: data[0].campusId }));
      }
    } catch (err) {
      console.warn('Lỗi tải cơ sở:', err);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        search: searchQuery.trim() || undefined,
        isActive: statusTab === 'ALL' ? undefined : (statusTab === 'ACTIVE'),
        page: 1,
        pageSize: 50
      };
      const res = await userService.getUsers(params);
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
      if (typeof res.activeCount === 'number') setActiveCount(res.activeCount);
      if (typeof res.inactiveCount === 'number') setInactiveCount(res.inactiveCount);
    } catch (err) {
      console.warn('Lỗi tải danh sách người dùng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateModalUser) return;
    setIsUpdatingStatus(true);
    try {
      await userService.toggleUserStatus(deactivateModalUser.userId, false);
      toast.success(`Đã ngừng hoạt động và ẩn tài khoản ${deactivateModalUser.fullName || deactivateModalUser.email} khỏi danh sách chính!`);
      setDeactivateModalUser(null);
      await loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.description || err.message || 'Lỗi khi ngừng hoạt động tài khoản';
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateModalUser) return;
    setIsUpdatingStatus(true);
    try {
      await userService.toggleUserStatus(reactivateModalUser.userId, true);
      toast.success(`Đã khôi phục tài khoản ${reactivateModalUser.fullName || reactivateModalUser.email} thành công!`);
      setReactivateModalUser(null);
      await loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.description || err.message || 'Lỗi khi khôi phục tài khoản';
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitProvision = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = (formData.email || '').trim().toLowerCase();
    if (!trimmedEmail) {
      const err = 'Vui lòng nhập Email công tác.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Kiểm tra toàn diện tính hợp lệ của Email trước khi cấp
      const emailCheck = await validateEmailComprehensive(trimmedEmail, (em) =>
        authService.validateEmail(em)
      );

      if (!emailCheck.isValid) {
        setEmailValidationStatus('invalid');
        setEmailValidationMsg(emailCheck.message || 'Email không hợp lệ.');
        setEmailSuggestedFix(emailCheck.suggestedEmail || null);
        setErrorMsg(emailCheck.message || 'Email không hợp lệ.');
        toast.error(emailCheck.message || 'Email không hợp lệ.');
        setIsSubmitting(false);
        return;
      }

      setEmailValidationStatus('valid');
      setEmailValidationMsg(emailCheck.message || 'Email hợp lệ.');

      // 2. Thực hiện gọi API cấp tài khoản
      const created = await userService.provisionUser({
        ...formData,
        email: trimmedEmail
      });

      setSuccessInfo({
        ...created,
        tempPassword: formData.password
      });

      // Refresh list
      loadUsers();
      setShowModal(false);
      toast.success(`Cấp phát tài khoản thành công cho ${created.fullName || trimmedEmail}!`);

      // Reset form
      setFormData({
        roleName: 'TEACHER',
        fullName: '',
        email: '',
        phone: '',
        campusId: campuses[0]?.campusId || '',
        specialty: 'Toán & Tư duy Logic',
        password: 'Password123@'
      });
      setEmailValidationStatus('idle');
      setEmailValidationMsg('');
      setEmailSuggestedFix(null);
    } catch (err) {
      const msg =
        err.response?.data?.error?.description ||
        err.response?.data?.error?.message ||
        err.message ||
        'Lỗi cấp tài khoản';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successInfo) return;
    const text = `THÔNG TIN TÀI KHOẢN NỘI BỘ V-EVAL:\n- Họ tên: ${successInfo.fullName}\n- Email: ${successInfo.email}\n- Mật khẩu tạm thời: ${successInfo.tempPassword}\n- Vai trò: ${successInfo.roles?.join(', ')}\n- Cơ sở: ${successInfo.campusName || 'Hệ thống V-Eval'}\n- Cổng đăng nhập: http://localhost:5173/`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  // Stats calculation
  const teacherCount = users.filter(u => u.roles?.includes('TEACHER')).length;
  const managerCount = users.filter(u => u.roles?.includes('ACADEMIC_MANAGER') || u.roles?.includes('ACADEMIC_DIRECTOR')).length;
  const studentParentCount = users.filter(u => u.roles?.includes('STUDENT') || u.roles?.includes('PARENT')).length;
  const activeRate = users.length > 0 ? Math.round((users.filter(u => u.isActive).length / users.length) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân Hệ Quản Trị Cán Bộ & Cấp Phát Quyền (IAM)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Cấp Phát Tài Khoản Nội Bộ Đa Vai Trò</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              PostgreSQL Direct
            </span>
          </h1>
          <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
            Khởi tạo trực tiếp tài khoản Giảng viên, Quản lý học thuật cơ sở, Giám đốc đào tạo và Quản trị viên. Tài khoản kích hoạt ngay lập tức mà không cần xác thực OTP email.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Quay lại Bảng điều khiển
            </button>
          )}
          <button
            onClick={() => {
              setErrorMsg('');
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cấp Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Real-time Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusTab('ACTIVE')}
          className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center gap-4 cursor-pointer transition-all ${
            statusTab === 'ACTIVE' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200/80 hover:border-emerald-300'
          }`}
          title="Bấm để lọc danh sách tài khoản đang hoạt động"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Đang hoạt động</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sẵn sàng truy cập</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Giảng viên Cơ sở</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{teacherCount}</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              Phụ trách các lớp luyện thi
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Quản lý / Giám đốc</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{managerCount}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Học thuật & điều phối
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('INACTIVE')}
          className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center gap-4 cursor-pointer transition-all ${
            statusTab === 'INACTIVE' ? 'ring-2 ring-rose-500 border-rose-300' : 'border-slate-200/80 hover:border-rose-300'
          }`}
          title="Bấm để xem danh sách tài khoản đã ngừng hoạt động (đã ẩn)"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Đã ngừng hoạt động</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{inactiveCount}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
              <span>Bị ẩn khỏi danh sách</span>
              <span className="underline text-[10px]">(Bấm để xem)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner after provision */}
      {successInfo && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span>Cấp phát tài khoản thành công cho:</span>
                <span className="text-emerald-700 underline font-mono">{successInfo.fullName}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                  {successInfo.roles?.join(', ')}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Email: <strong>{successInfo.email}</strong> • Mật khẩu tạm: <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-bold">{successInfo.tempPassword}</code> • Cơ sở: <strong>{successInfo.campusName || 'Hệ thống V-Eval'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCredentials}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Đã sao chép!' : 'Sao chép thông tin bàn giao'}</span>
            </button>
            <button
              onClick={() => setSuccessInfo(null)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Command Toolbar: Status Switcher + Search + Role Filter Pills */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Top Row: Segmented Status Switcher & Search Box */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 max-w-full overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusTab('ACTIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusTab === 'ACTIVE'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đang hoạt động</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('INACTIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusTab === 'INACTIVE'
                  ? 'bg-white text-rose-700 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Đã ngừng hoạt động (Ẩn)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-black">
                {inactiveCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusTab === 'ALL'
                  ? 'bg-white text-slate-800 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({activeCount + inactiveCount})
            </button>
          </div>

          {/* Search & Refresh Actions */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Tên, Email, Số điện thoại..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={loadUsers}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {/* Bottom Row: Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedRole('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedRole === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả vai trò ({totalCount})
          </button>
          {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => {
            const Icon = conf.icon;
            const isSelected = selectedRole === roleKey;
            return (
              <button
                type="button"
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {statusTab === 'INACTIVE' && (
          <div className="text-[11px] text-rose-700 font-medium flex items-center gap-2 px-3.5 py-2 bg-rose-50/80 rounded-xl border border-rose-200/70">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>
              <strong>Kho lưu trữ tài khoản đã ngừng hoạt động:</strong> Các tài khoản tại đây đang bị vô hiệu hóa đăng nhập và tự động ẩn khỏi danh sách chính. Toàn bộ lịch sử bài thi và dữ liệu học tập được bảo toàn 100%.
            </span>
          </div>
        )}
      </div>

      {/* Main Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6 whitespace-nowrap">Tài Khoản / Họ Tên</th>
                <th className="py-4 px-4 whitespace-nowrap">Vai Trò (RBAC)</th>
                <th className="py-4 px-4 whitespace-nowrap">Đơn Vị / Chuyên Môn</th>
                <th className="py-4 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-4 px-4 whitespace-nowrap">Ngày Tạo</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Đang tải danh sách tài khoản từ cơ sở dữ liệu...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    {statusTab === 'INACTIVE' ? (
                      <div className="space-y-1.5 py-4">
                        <Archive className="w-9 h-9 mx-auto text-slate-300 stroke-[1.5]" />
                        <div className="font-bold text-slate-700 text-sm">Không có tài khoản nào trong danh mục đã ngừng hoạt động.</div>
                        <div className="text-xs text-slate-400">Tất cả tài khoản hệ thống hiện đang ở trạng thái hoạt động bình thường.</div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-4">
                        <Users className="w-9 h-9 mx-auto text-slate-300 stroke-[1.5]" />
                        <div className="font-bold text-slate-700 text-sm">Không tìm thấy tài khoản nào phù hợp bộ lọc.</div>
                        <div className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc vai trò.</div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const primaryRole = user.roles?.[0] || 'STUDENT';
                  const roleConf = ROLE_CONFIG[primaryRole] || {
                    label: primaryRole,
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    avatarClass: 'from-slate-600 to-slate-800',
                    icon: Users
                  };
                  const RoleIcon = roleConf.icon;
                  const unitInfo = getUnitDisplay(user, primaryRole);

                  return (
                    <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Column 1: Name, Avatar & Contact */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleConf.avatarClass || 'from-blue-600 to-indigo-600'} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                              {getInitials(user.fullName)}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-[13px] leading-snug">
                              {user.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{user.email}</span>
                              </span>
                              {user.phone && user.phone !== '0900000000' && (
                                <span className="text-slate-400">
                                  • {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Role Pill (Single-line strict) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0 ${roleConf.badgeClass}`}>
                          <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{roleConf.label}</span>
                        </span>
                      </td>

                      {/* Column 3: Unit / Campus & Specialty (Single-line strict) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs whitespace-nowrap" title={user.campusName || unitInfo.title}>
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{unitInfo.title}</span>
                          </div>
                          <div className={`text-[11px] font-semibold mt-0.5 pl-5 whitespace-nowrap ${unitInfo.subtitleColor}`}>
                            {unitInfo.subtitle}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Active Status Badge (Single-line strict) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                            <span>Ngừng hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Column 6: Action Button (Single-line strict) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => setDeactivateModalUser(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                            title="Ngừng hoạt động (Ẩn tài khoản khỏi hệ thống)"
                          >
                            <UserX className="w-3.5 h-3.5 shrink-0" />
                            <span>Ngừng hoạt động</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReactivateModalUser(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                            title="Khôi phục tài khoản về trạng thái hoạt động"
                          >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>Khôi phục</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Cấp Phát Tài Khoản Nội Bộ Mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kích hoạt ngay lập tức vào CSDL PostgreSQL mà không cần qua OTP.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProvision} className="space-y-4">
              
              {/* Role Selector Grid */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2">
                  1. Chọn vai trò chức danh <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => {
                    const isSelected = formData.roleName === roleKey;
                    const Icon = conf.icon;
                    return (
                      <button
                        type="button"
                        key={roleKey}
                        onClick={() => setFormData(prev => ({ ...prev, roleName: roleKey }))}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                        <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                          {conf.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campus Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  2. Cơ sở học vụ công tác <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.campusId}
                  onChange={(e) => setFormData(prev => ({ ...prev, campusId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {campuses.map(c => (
                    <option key={c.campusId} value={c.campusId}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Họ và tên cán bộ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ví dụ: Thầy Trần Quang Đức"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Email công tác <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        if (emailValidationStatus !== 'idle') setEmailValidationStatus('idle');
                        setEmailValidationMsg('');
                        setEmailSuggestedFix(null);
                        setErrorMsg('');
                      }}
                      onBlur={() => handleEmailBlur(formData.email)}
                      placeholder="canbo@veval.edu.vn hoặc hoten@gmail.com"
                      className={`w-full pl-3 pr-8 py-2 text-xs bg-slate-50 border rounded-xl font-semibold text-slate-800 focus:outline-none transition-all ${
                        emailValidationStatus === 'invalid'
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                          : emailValidationStatus === 'valid'
                          ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                      }`}
                      required
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {emailValidationStatus === 'checking' && (
                        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      )}
                      {emailValidationStatus === 'valid' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {emailValidationStatus === 'invalid' && (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                  </div>

                  {/* Realtime Email Validation Feedback */}
                  {emailValidationStatus === 'checking' && (
                    <p className="text-[10.5px] font-bold text-blue-600 mt-1 flex items-center gap-1 animate-fade">
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      <span>Đang kiểm tra tính hợp lệ & máy chủ thư (DNS MX)...</span>
                    </p>
                  )}
                  {emailValidationStatus === 'valid' && (
                    <p className="text-[10.5px] font-bold text-emerald-600 mt-1 flex items-center gap-1 animate-fade">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{emailValidationMsg || 'Email hợp lệ (Máy chủ thư MX hoạt động)'}</span>
                    </p>
                  )}
                  {emailValidationStatus === 'invalid' && (
                    <div className="mt-1 space-y-1 animate-fade">
                      <p className="text-[10.5px] font-bold text-rose-600 flex items-start gap-1 leading-tight">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{emailValidationMsg}</span>
                      </p>
                      {emailSuggestedFix && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, email: emailSuggestedFix }));
                            handleEmailBlur(emailSuggestedFix);
                          }}
                          className="text-[10.5px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Sửa thành: <strong>{emailSuggestedFix}</strong></span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone & Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Số điện thoại liên lạc
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Bộ môn / Chuyên môn
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Toán & Tư duy Logic">Toán & Tư duy Logic</option>
                    <option value="Ngôn ngữ Tiếng Việt & Đọc hiểu">Ngôn ngữ Tiếng Việt & Đọc hiểu</option>
                    <option value="Tiếng Anh Học thuật">Tiếng Anh Học thuật</option>
                    <option value="Khoa học Tự nhiên & Số liệu">Khoa học Tự nhiên & Số liệu</option>
                    <option value="Khoa học Xã hội">Khoa học Xã hội</option>
                  </select>
                </div>
              </div>

              {/* Password Initial Setup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sinh mật khẩu mạnh</span>
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-800 font-medium leading-relaxed">
                💡 <strong>Kích hoạt trực tiếp:</strong> Tài khoản này sẽ được nạp thẳng vào bảng <code>v_eval_identity."Users"</code> và liên kết hồ sơ chuyên môn với trạng thái <code>IsActive = true</code>. Cán bộ có thể đăng nhập ngay lập tức.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu vào CSDL...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Xác Nhận Cấp Tài Khoản</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận Ngừng hoạt động (Soft Delete / Inactive) */}
      {deactivateModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <UserX className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Xác Nhận Ngừng Hoạt Động Tài Khoản
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tài khoản sẽ bị vô hiệu hóa đăng nhập và tự động ẩn khỏi danh sách hoạt động chính.
              </p>
            </div>

            {/* User summary card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-left">
              <div className="font-extrabold text-sm text-slate-900">{deactivateModalUser.fullName}</div>
              <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{deactivateModalUser.email}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Vai trò: <span className="font-bold text-slate-700">{deactivateModalUser.roles?.join(', ')}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo toàn dữ liệu 100%:</strong> Không có dữ liệu nào bị xóa vĩnh viễn. Toàn bộ điểm thi, bài làm và lịch sử học tập được giữ nguyên. Bạn có thể khôi phục tài khoản bất kỳ lúc nào tại tab <em>"Đã ngừng hoạt động"</em>.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setDeactivateModalUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmDeactivate}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Xác Nhận Ngừng</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận Khôi phục hoạt động */}
      {reactivateModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Khôi Phục Trạng Thái Hoạt Động
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kích hoạt lại tài khoản và đưa người dùng trở về danh sách hoạt động chính.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-left">
              <div className="font-extrabold text-sm text-slate-900">{reactivateModalUser.fullName}</div>
              <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{reactivateModalUser.email}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Vai trò: <span className="font-bold text-slate-700">{reactivateModalUser.roles?.join(', ')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Sau khi khôi phục, tài khoản có thể đăng nhập lại ngay lập tức và hiển thị trong danh sách <em>"Tài Khoản Đang Hoạt Động"</em>.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setReactivateModalUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmReactivate}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khôi phục...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Khôi Phục Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
