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
  Check
} from 'lucide-react';
import { userService } from '../../services/userService';

const ROLE_CONFIG = {
  TEACHER: {
    label: 'Giảng viên Cơ sở',
    code: 'TEACHER',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: GraduationCap,
    desc: 'Giảng dạy, luyện thi chuyên sâu, chấm bài & hướng dẫn Socratic Live'
  },
  ACADEMIC_MANAGER: {
    label: 'Quản lý Học thuật Cơ sở',
    code: 'ACADEMIC_MANAGER',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Briefcase,
    desc: 'Điều phối lớp học, phân cụm học viên AI Clustering & quản trị cơ sở'
  },
  ACADEMIC_DIRECTOR: {
    label: 'Giám đốc Học thuật',
    code: 'ACADEMIC_DIRECTOR',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Crown,
    desc: 'Toàn quyền học thuật liên cơ sở, phê duyệt ngân hàng câu hỏi & lộ trình'
  },
  ADMINISTRATOR: {
    label: 'Quản trị viên Hệ thống',
    code: 'ADMINISTRATOR',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldCheck,
    desc: 'Quản trị hệ thống, cấp phát tài khoản toàn quyền & bảo mật IAM'
  },
  PARENT: {
    label: 'Phụ huynh Học sinh',
    code: 'PARENT',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: UserCheck,
    desc: 'Cổng theo dõi điểm ước lượng ĐGNL, tiến độ & cảnh báo AI'
  },
  STUDENT: {
    label: 'Học viên ĐGNL',
    code: 'STUDENT',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: BookOpen,
    desc: 'Luyện thi thích ứng ZPD, đề thi chẩn đoán & Socratic AI Tutor'
  }
};

export default function AccountProvisioningView({ onBackToDashboard }) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [campuses, setCampuses] = useState([]);

  // Filters
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Load Campuses & Users
  useEffect(() => {
    loadCampuses();
    loadUsers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

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
        page: 1,
        pageSize: 50
      };
      const res = await userService.getUsers(params);
      setUsers(res.items || []);
      setTotalCount(res.totalCount || 0);
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

  const handleToggleStatus = async (user) => {
    try {
      const updatedActive = await userService.toggleUserStatus(user.userId);
      setUsers(prev => prev.map(u => u.userId === user.userId ? { ...u, isActive: updatedActive } : u));
    } catch (err) {
      alert('Không thể đổi trạng thái tài khoản: ' + err.message);
    }
  };

  const handleSubmitProvision = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const created = await userService.provisionUser(formData);
      setSuccessInfo({
        ...created,
        tempPassword: formData.password
      });
      // Refresh list
      loadUsers();
      setShowModal(false);
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
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Lỗi cấp tài khoản';
      setErrorMsg(msg);
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
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tổng tài khoản CSDL</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Đã nạp qua Gateway :5212</span>
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

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">Tỷ lệ kích hoạt</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{activeRate}%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Trạng thái Active sẵn sàng
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedRole === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          {Object.entries(ROLE_CONFIG).map(([roleKey, conf]) => {
            const Icon = conf.icon;
            const isSelected = selectedRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, Email, Số điện thoại..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={loadUsers}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Main Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Tài Khoản / Cán Bộ</th>
                <th className="py-4 px-4">Vai Trò (RBAC)</th>
                <th className="py-4 px-4">Cơ Sở / Chuyên Môn</th>
                <th className="py-4 px-4">Trạng Thái</th>
                <th className="py-4 px-4">Ngày Tạo</th>
                <th className="py-4 px-6 text-right">Khóa / Mở</th>
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
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <span>Không tìm thấy tài khoản nào phù hợp bộ lọc.</span>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const primaryRole = user.roles?.[0] || 'STUDENT';
                  const roleConf = ROLE_CONFIG[primaryRole] || {
                    label: primaryRole,
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: Users
                  };
                  const RoleIcon = roleConf.icon;

                  return (
                    <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {(user.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{user.fullName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {user.email}
                              </span>
                              {user.phone && user.phone !== '0900000000' && (
                                <span className="flex items-center gap-1 font-mono text-slate-400">
                                  • {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleConf.badgeClass}`}>
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleConf.label}</span>
                        </span>
                      </td>

                      {/* Campus & Specialty */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{user.campusName || 'Cơ sở chính (ĐHQG Thủ Đức)'}</span>
                          </div>
                          {user.specialty && (
                            <div className="text-[10px] font-bold text-indigo-600 mt-0.5">
                              Chuyên môn: {user.specialty}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="py-3.5 px-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Action Toggle */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            user.isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                          }`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
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
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="canbo@veval.edu.vn"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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

    </div>
  );
}
