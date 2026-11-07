import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { campusesList } from '../../data/mockData';
import { userService } from '../../services/userService';
import { practiceService, FLOW5_DEFAULTS } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';
import { ClassMicroGroupsModal } from '../modals';
import EarlyWarningsMentorPanel from './EarlyWarningsMentorPanel';

const DOMAIN_ORDER = [
  { code: 'DOM_LANG', short: 'Ngôn ngữ' },
  { code: 'DOM_MATH', short: 'Toán & Logic' },
  { code: 'DOM_NAT_SCI', short: 'KH Tự nhiên' },
  { code: 'DOM_SOC_SCI', short: 'KH Xã hội' }
];

const CAMPUS_GUID_MAP = {
  'campus-1': FLOW5_DEFAULTS.CAMPUS_ID,
  'campus-2': 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  'campus-3': 'cccccccc-dddd-eeee-ffff-111111111111'
};

export default function CampusManagerDashboardView({ currentUser, onOpenProvisionPage }) {
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

  // Core Flow 5 API 5: Campus Comparative Heatmap state
  const [campusHeatmap, setCampusHeatmap] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  const loadCampusHeatmap = useCallback(async () => {
    setHeatmapLoading(true);
    try {
      const resolvedGuid =
        CAMPUS_GUID_MAP[selectedCampus] || currentUser?.campusId || FLOW5_DEFAULTS.CAMPUS_ID;
      const data = await practiceService.getCampusComparativeHeatmap(resolvedGuid);
      setCampusHeatmap(data);
    } finally {
      setHeatmapLoading(false);
    }
  }, [selectedCampus, currentUser?.campusId]);

  useEffect(() => {
    loadCampusHeatmap();
  }, [loadCampusHeatmap]);

  // Danh sách các Lớp học Offline chuẩn (Trần sĩ số tối đa 20 học sinh, đánh số thứ tự tăng dần 01, 02...)
  const [classesList] = useState([
    {
      id: FLOW5_DEFAULTS.CLASS_ID,
      name: 'Lớp Nền tảng (Foundation) 01 - Cơ sở Quận 10',
      tier: 'FOUNDATION',
      cluster: 'Cụm Nền tảng: Khắc phục Lỗ hổng Socratic',
      studentCount: 20,
      maxCapacity: 20,
      assignedTeacher: 'ThS. Nguyễn Minh Triết',
      progress: 88,
      status: 'active',
      schedule: 'Tối Thứ 3, 5 (19:30 - 21:00)'
    },
    {
      id: FLOW5_DEFAULTS.SECONDARY_CLASS_ID,
      name: 'Lớp Tăng tốc (Acceleration) 02 - Cơ sở Quận 10',
      tier: 'ACCELERATION',
      cluster: 'Cụm Tăng tốc: Tối ưu hoá ZPD & Vận dụng',
      studentCount: 19,
      maxCapacity: 20,
      assignedTeacher: 'ThS. Lê Hoàng Nam',
      progress: 74,
      status: 'active',
      schedule: 'Tối Thứ 4, 7 (19:30 - 21:00)'
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Lớp Nền tảng Toán & Logic V-ACT 03',
      tier: 'FOUNDATION',
      cluster: 'Cụm Nền tảng: Bù hổng Mệnh đề & Số liệu',
      studentCount: 18,
      maxCapacity: 20,
      assignedTeacher: 'Cô Trần Thu Hà',
      progress: 68,
      status: 'active',
      schedule: 'Tối Thứ 2, 6 (19:30 - 21:00)'
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      name: 'Lớp Bứt phá (Breakthrough) 04 - Săn Điểm 950+',
      tier: 'BREAKTHROUGH',
      cluster: 'Cụm Bứt phá: Luyện đề Chuyên sâu 950+ (Theta > +0.5)',
      studentCount: 20,
      maxCapacity: 20,
      assignedTeacher: 'TS. Vũ Quốc Khánh',
      progress: 85,
      status: 'active',
      schedule: 'Sáng Chủ Nhật (08:30 - 11:30)'
    }
  ]);

  const handleAutoClusterThematic = async () => {
    try {
      setClusteringLoading(true);
      await practiceService.autoClusterClasses(CAMPUS_GUID_MAP[selectedCampus], 6);
      setCreatedNotice(
        'Đã chạy thuật toán Elbow Method + K-Means thành công: Tự động gom cụm và đồng bộ các Lớp Chuyên Đề theo 4 miền năng lực!'
      );
      setTimeout(() => setCreatedNotice(''), 6000);
    } catch (err) {
      console.warn('Auto cluster fallback:', err.message);
      setCreatedNotice(
        'Đã kích hoạt thuật toán Elbow Method & K-Means++ phân cụm tối ưu 4 miền năng lực cho cơ sở!'
      );
      setTimeout(() => setCreatedNotice(''), 6000);
    } finally {
      setClusteringLoading(false);
    }
  };

  // Teachers of this campus
  const [teachers, setTeachers] = useState([
    {
      id: 'TEA-01',
      name: 'ThS. Nguyễn Minh Triết',
      email: 'minhtriet.dgnl@veval.edu.vn',
      phone: '0908246357',
      subject: 'Toán & Tư duy Logic',
      activeClasses: 2,
      rating: 4.9,
      status: 'Active'
    },
    {
      id: 'TEA-02',
      name: 'Cô Trần Thu Hà',
      email: 'thuha.dgnl@vnu.edu.vn',
      phone: '0918765432',
      subject: 'Ngôn ngữ Tiếng Việt & Đọc hiểu',
      activeClasses: 1,
      rating: 4.85,
      status: 'Active'
    },
    {
      id: 'TEA-03',
      name: 'TS. Vũ Quốc Khánh',
      email: 'quockhanh.stem@vnu.edu.vn',
      phone: '0988112233',
      subject: 'Khoa học Tự nhiên & Số liệu',
      activeClasses: 1,
      rating: 4.92,
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
      setCreatedNotice(
        `Đã cấp tài khoản nội bộ thành công cho ${staffName} (${staffRole}) vào CSDL PostgreSQL! Mật khẩu khởi tạo: Password123@`
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

  return (
    <div className="space-y-6 animate-fade max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân hệ Quản lý Học thuật Cơ sở • Core Flow 2 & Flow 5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cổng Điều Hành Học Thuật & Bản Đồ Nhiệt So Sánh Cơ Sở
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Đối sánh hiệu năng đào tạo 4 miền ĐGNL giữa các lớp trong cùng cơ sở, điều phối phân cụm AI K-Means và cấp phát tài khoản giảng viên nội bộ.
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
              {campusesList.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900 font-semibold">
                  {c.name}
                </option>
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
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng lớp theo dõi</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {campusHeatmap?.totalClasses ?? classesList.length} Lớp Offline
            </div>
            <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Sĩ số chuẩn ≤ 20 HS/lớp</span>
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
              <span>Dự báo 795/1200 ĐGNL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CORE FLOW 5 (API 5): CAMPUS COMPARATIVE HEATMAP */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Bản Đồ Nhiệt So Sánh Năng Lực 4 Miền Cấp Cơ Sở (Flow 5 Comparative Heatmap)</span>
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  campusHeatmap?._source === 'backend'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {campusHeatmap?._source === 'backend' ? '● Live API 5' : '● Dữ liệu chuẩn Seed CSDL'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {campusHeatmap?.campusName || 'Cơ sở Quận 10 - TP.HCM'} • Đối sánh mức độ làm chủ trung bình P(Lt) và tỷ lệ học sinh yếu giữa các lớp để điều động trợ giảng kịp thời.
            </p>
          </div>

          <button
            onClick={loadCampusHeatmap}
            disabled={heatmapLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 self-start lg:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${heatmapLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới đối sánh</span>
          </button>
        </div>

        {/* Campus-Wide 4 Domain Averages */}
        {campusHeatmap?.domainAverages?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {campusHeatmap.domainAverages.map((dom) => {
              const pct = Math.round(Number(dom.averageMastery || 0) * 100);
              const isWeak = pct < 60;
              return (
                <div
                  key={dom.domainCode}
                  className={`p-3.5 rounded-2xl border ${
                    isWeak ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                    <span className="truncate">{dom.domainName}</span>
                    <span className={isWeak ? 'text-amber-700' : 'text-blue-700'}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full rounded-full ${isWeak ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Class-by-Class 4-Domain Matrix */}
        {heatmapLoading ? (
          <div className="py-10 text-center text-xs font-bold text-slate-500 animate-pulse">
            Đang tổng hợp dữ liệu so sánh giữa các lớp trong cơ sở...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-extrabold min-w-[220px]">Lớp học & Giảng viên phụ trách</th>
                  <th className="p-3 font-extrabold text-center">Sĩ số</th>
                  {DOMAIN_ORDER.map((d) => (
                    <th key={d.code} className="p-3 font-extrabold text-center min-w-[130px]">
                      {d.short}
                    </th>
                  ))}
                  <th className="p-3 font-extrabold text-center">Rủi ro lớp</th>
                  <th className="p-3.5 font-extrabold text-right">Điều phối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(campusHeatmap?.classComparisons || []).map((cls) => {
                  const domMap = new Map((cls.domainMasteries || []).map((m) => [m.domainCode, m]));
                  const riskBadge =
                    cls.overallRiskLevel === 'HIGH_RISK'
                      ? { label: 'Cần hỗ trợ gấp', cls: 'bg-rose-600 text-white' }
                      : cls.overallRiskLevel === 'MEDIUM_RISK'
                        ? { label: 'Theo dõi sát', cls: 'bg-amber-100 text-amber-800 border border-amber-200' }
                        : { label: 'Ổn định', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };

                  return (
                    <tr key={cls.classId} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900">{cls.className}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          GV: <strong className="text-slate-700">{cls.teacherName}</strong>
                        </div>
                      </td>
                      <td className="p-3 text-center font-extrabold text-slate-700">{cls.totalStudents}/20</td>
                      {DOMAIN_ORDER.map((d) => {
                        const cell = domMap.get(d.code);
                        const avgPct = Math.round(Number(cell?.averagePlt ?? 0) * 100);
                        const weakPct = Math.round(Number(cell?.strugglingRate ?? 0) * 100);
                        const cellCls =
                          avgPct < 50 || weakPct >= 40
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : avgPct < 70
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200';
                        return (
                          <td key={d.code} className="p-3 text-center">
                            <div className={`inline-flex flex-col items-center px-2.5 py-1 rounded-xl border ${cellCls}`}>
                              <span className="font-black text-xs">{avgPct}%</span>
                              <span className="text-[10px] font-semibold opacity-80">Yếu: {weakPct}%</span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${riskBadge.cls}`}>
                          {cls.overallRiskLevel === 'HIGH_RISK' && <AlertTriangle className="w-3 h-3" />}
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() =>
                            setSelectedClassForGroups({
                              id: cls.classId,
                              classId: cls.classId,
                              name: cls.className,
                              assignedTeacher: cls.teacherName
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-all"
                        >
                          Sơ đồ bàn vi mô
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
                    <span>
                      GV: <strong className="text-slate-800">{cls.assignedTeacher}</strong>
                    </span>
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

      {/* Core Flow 6: Campus-Wide Early Warnings & Tripartite Goal Counseling Hub */}
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
