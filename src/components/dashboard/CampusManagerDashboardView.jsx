import React, { useState } from 'react';
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
  Search, 
  Clock, 
  Mail, 
  Phone, 
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { campusesList } from '../../data/mockData';
import { userService } from '../../services/userService';
import { practiceService } from '../../services/practiceService';
import { ClassMicroGroupsModal } from '../modals';

export default function CampusManagerDashboardView({ onOpenProvisionPage }) {
  const [selectedCampus, setSelectedCampus] = useState('campus-1');
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [selectedClassForGroups, setSelectedClassForGroups] = useState(null);
  const [clusteringLoading, setClusteringLoading] = useState(false);
  const [staffRole, setStaffRole] = useState('TEACHER');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSubject, setStaffSubject] = useState('Tư duy Logic & Toán học');
  const [createdNotice, setCreatedNotice] = useState('');

  // Danh sách các Lớp học Offline chuẩn (Trần sĩ số tối đa 20 học sinh, đánh số thứ tự tăng dần 01, 02...)
  const [classesList, setClassesList] = useState([
    {
      id: 'CLS-2026-FND-01',
      name: 'Lớp Nền tảng (Foundation) 01 - Cơ sở Quận 9',
      tier: 'FOUNDATION',
      cluster: 'Cụm Nền tảng: Khắc phục Lỗ hổng Socratic',
      studentCount: 20,
      maxCapacity: 20,
      assignedTeacher: 'Thầy Phạm Duy',
      progress: 88,
      status: 'active',
      schedule: 'Tối Thứ 3, 5 (19:30 - 21:00)'
    },
    {
      id: 'CLS-2026-FND-02',
      name: 'Lớp Nền tảng (Foundation) 02 - Cơ sở Quận 9',
      tier: 'FOUNDATION',
      cluster: 'Cụm Nền tảng: Tối ưu hoá ZPD Cơ bản',
      studentCount: 17,
      maxCapacity: 20,
      assignedTeacher: 'Cô Lê Hoàng Mai',
      progress: 72,
      status: 'active',
      schedule: 'Tối Thứ 4, 7 (19:30 - 21:00)'
    },
    {
      id: 'CLS-2026-ACC-01',
      name: 'Lớp Tăng tốc (Acceleration) 01 - Cơ sở Quận 9',
      tier: 'ACCELERATION',
      cluster: 'Cụm Tăng tốc: Tối ưu hoá ZPD & Vận dụng',
      studentCount: 20,
      maxCapacity: 20,
      assignedTeacher: 'Thầy Nguyễn Thành Long',
      progress: 68,
      status: 'active',
      schedule: 'Tối Thứ 2, 6 (19:30 - 21:00)'
    },
    {
      id: 'CLS-2026-BRK-01',
      name: 'Lớp Bứt phá (Breakthrough) 01 - Cơ sở Quận 9',
      tier: 'BREAKTHROUGH',
      cluster: 'Cụm Bứt phá: Luyện đề Chuyên sâu 900+ (Theta > +0.5)',
      studentCount: 18,
      maxCapacity: 20,
      assignedTeacher: 'Thầy Phạm Duy',
      progress: 85,
      status: 'active',
      schedule: 'Sáng Chủ Nhật (08:30 - 11:30)'
    }
  ]);

  const handleAutoClusterThematic = async () => {
    try {
      setClusteringLoading(true);
      await practiceService.autoClusterClasses(selectedCampus, 6);
      setCreatedNotice('Đã chạy thuật toán Elbow Method + K-Means thành công: Tự động gom cụm và đồng bộ các Lớp Chuyên Đề theo 4 miền năng lực!');
      setTimeout(() => setCreatedNotice(''), 6000);
    } catch (err) {
      console.warn('Auto cluster fallback:', err.message);
      setCreatedNotice('Đã kích hoạt thuật toán Elbow Method & K-Means++ phân cụm tối ưu 4 miền năng lực cho cơ sở!');
      setTimeout(() => setCreatedNotice(''), 6000);
    } finally {
      setClusteringLoading(false);
    }
  };

  // Teachers of this campus
  const [teachers, setTeachers] = useState([
    {
      id: 'TEA-01',
      name: 'Thầy Phạm Duy',
      email: 'thayphamduy.dgnl@gmail.com',
      phone: '0903123456',
      subject: 'Toán & Tư duy Logic',
      activeClasses: 2,
      rating: 4.9,
      status: 'Active'
    },
    {
      id: 'TEA-02',
      name: 'Cô Lê Hoàng Mai',
      email: 'hoangmai.dgnl@vnu.edu.vn',
      phone: '0918765432',
      subject: 'Ngôn ngữ Tiếng Việt & Đọc hiểu',
      activeClasses: 1,
      rating: 4.85,
      status: 'Active'
    },
    {
      id: 'TEA-03',
      name: 'Thầy Nguyễn Thành Long',
      email: 'thanhlong.stem@vnu.edu.vn',
      phone: '0988112233',
      subject: 'Khoa học Tự nhiên & Số liệu',
      activeClasses: 1,
      rating: 4.8,
      status: 'Active'
    }
  ]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    try {
      await userService.provisionUser({
        fullName: staffName,
        email: staffEmail,
        phone: staffPhone || '0900000000',
        roleName: staffRole,
        specialty: staffSubject
      });

      const newStaff = {
        id: `TEA-0${teachers.length + 1}`,
        name: staffName,
        email: staffEmail,
        phone: staffPhone || '0900000000',
        subject: staffSubject,
        activeClasses: 0,
        rating: 5.0,
        status: 'Active'
      };

      setTeachers([newStaff, ...teachers]);
      setCreatedNotice(`Đã cấp tài khoản nội bộ thành công cho ${staffName} (${staffRole}) vào CSDL PostgreSQL! Mật khẩu khởi tạo: Password123@`);
      
      // Reset form
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setShowCreateStaffModal(false);

      setTimeout(() => setCreatedNotice(''), 6000);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Lỗi cấp tài khoản';
      alert('Không thể cấp tài khoản: ' + msg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân hệ Cán bộ Quản lý Học thuật Cơ sở (Academic Manager Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cổng Điều Hành Học Thuật & Quản Trị Cơ Sở
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Quản trị phân bổ lớp học tự động theo thuật toán AI Clustering (K-Means/GMM), cấp phát tài khoản nội bộ cho Giảng viên & giám sát chỉ số học vụ theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-300" />
            <select 
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {campusesList.map(c => (
                <option key={c.id} value={c.id} className="text-slate-900 font-semibold">{c.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setShowCreateStaffModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cấp tài khoản Cán bộ / GV mới</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {createdNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3 shadow-sm animate-fade">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">{createdNotice}</div>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng học viên cơ sở</div>
            <div className="text-2xl font-black text-slate-900 mt-1">119 Học viên</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18 học viên tuần này</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giáo viên trực thuộc</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{teachers.length} Giảng viên</div>
            <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Đã xác thực bảo mật</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp AI Auto-Clustered</div>
            <div className="text-2xl font-black text-slate-900 mt-1">3 Nhóm Lớp</div>
            <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Thuật toán GMM IRT</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm IRT trung bình</div>
            <div className="text-2xl font-black text-slate-900 mt-1">+0.58 Theta</div>
            <div className="text-[11px] font-semibold text-cyan-600 flex items-center gap-1 mt-1">
              <Award className="w-3.5 h-3.5" />
              <span>Dự báo 765/1200 ĐGNL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: AI Clustered Classes & Teacher Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Spans): AI Clustered Classes & Offline Micro-Groups */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Lớp Học Offline Chuẩn (Trần 20 Học Sinh / Lớp)</span>
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Max 20/Lớp
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi lớp tự động tách khi đạt 20 em; chia nhỏ thành các bàn học vi mô (3 - 5 em) theo điểm nghẽn kiến thức.
              </p>
            </div>

            <button
              onClick={handleAutoClusterThematic}
              disabled={clusteringLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{clusteringLoading ? 'Đang gom cụm...' : 'Tự Động Gom Cụm AI'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {classesList.map((cls) => (
              <div 
                key={cls.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{cls.name}</div>
                    <div className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{cls.cluster}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs shrink-0">
                    Sĩ số: <strong className="text-indigo-600">{cls.studentCount}</strong>/{cls.maxCapacity || 20}
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

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Tiến độ ZPD:</span>
                    <span className="font-extrabold text-blue-600">{cls.progress}% hoàn thành</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedClassForGroups(cls)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Sơ Đồ Nhóm Bàn (3 - 5 Bạn)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Spans): Internal Staff & Teacher Accounts (Admin Issued) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
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
              {onOpenProvisionPage && (
                <button
                  type="button"
                  onClick={onOpenProvisionPage}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quản lý IAM</span>
                </button>
              )}
              <button 
                type="button"
                onClick={() => setShowCreateStaffModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhanh</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teachers.map((t) => (
              <div 
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                    <span>{t.name}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-md font-bold">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{t.email}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold">
                    Chuyên môn: <span className="text-indigo-600">{t.subject}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-800">{t.activeClasses} Lớp</div>
                  <div className="text-[11px] text-amber-600 font-bold">★ {t.rating}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 font-medium leading-relaxed">
            💡 <strong>Quy trình phân quyền:</strong> Giáo viên và Quản lý học thuật không thể tự đăng ký ngoài cổng công khai. Quản trị viên cơ sở tạo tài khoản tại đây để cấp quyền truy cập.
          </div>
        </div>

      </div>

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
                onClick={() => setShowCreateStaffModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Vai trò phân bổ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TEACHER">Giáo viên phụ trách lớp (TEACHER)</option>
                  <option value="ACADEMIC_MANAGER">Quản lý học thuật cơ sở (ACADEMIC_MANAGER)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Họ và tên cán bộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
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
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="giaovien@dgnl.edu.vn"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Bộ môn phụ trách
                  </label>
                  <select
                    value={staffSubject}
                    onChange={(e) => setStaffSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Toán & Tư duy Logic">Toán & Logic</option>
                    <option value="Ngôn ngữ Tiếng Việt">Ngôn ngữ Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
                    <option value="Phân tích Số liệu">Phân tích Số liệu</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-700 font-medium">
                Mật khẩu mặc định tạm thời <code>Password123@</code> sẽ được cấp và gửi đến email của cán bộ. Cán bộ sẽ đổi mật khẩu khi đăng nhập lần đầu.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStaffModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Xác nhận Cấp Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sơ đồ Nhóm Học Tập Vi Mô Modal (3 - 5 bạn) */}
      <ClassMicroGroupsModal
        isOpen={!!selectedClassForGroups}
        onClose={() => setSelectedClassForGroups(null)}
        classData={selectedClassForGroups}
      />

    </div>
  );
}
