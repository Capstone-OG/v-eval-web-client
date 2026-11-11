import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Send,
  Search,
  Sparkles,
  Filter,
  RefreshCw,
  Layers,
  Zap,
  Split,
  Clock
} from 'lucide-react';
import { practiceService, FLOW5_DEFAULTS } from '../../services/practiceService';
import ClassMicroGroupsModal from '../modals/ClassMicroGroupsModal';
import EarlyWarningsMentorPanel from './EarlyWarningsMentorPanel';
import { toast } from '../../context/ToastContext';

const CLASS_OPTIONS = [
  {
    id: FLOW5_DEFAULTS.CLASS_ID,
    name: 'Lớp ĐGNL Cơ sở 1 - ĐHQG TP.HCM (Mã: 01)'
  },
  {
    id: FLOW5_DEFAULTS.SECONDARY_CLASS_ID,
    name: 'Lớp Chuyên Đề ĐGNL Tăng Tốc 01 (Mã: 02)'
  }
];

const DOMAIN_OPTIONS = [
  { code: 'ALL', label: 'Tất cả 4 miền năng lực' },
  { code: 'DOM_MATH', label: 'Toán & Tư duy Logic' },
  { code: 'DOM_LANG', label: 'Sử dụng Ngôn ngữ' },
  { code: 'DOM_NAT_SCI', label: 'Khoa học Tự nhiên' },
  { code: 'DOM_SOC_SCI', label: 'Khoa học Xã hội' }
];

const RISK_BADGE_MAP = {
  HIGH_RISK: { label: 'Nguy cơ cao', cls: 'bg-rose-600 text-white shadow-xs' },
  MEDIUM_RISK: { label: 'Cần chú ý', cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  SAFE: { label: 'An toàn', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }
};

export default function TeacherDashboardView({ currentUser }) {
  const [selectedClassId, setSelectedClassId] = useState(FLOW5_DEFAULTS.CLASS_ID);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [minMasteryFilter, setMinMasteryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);

  // Micro-Groups Modal (1-Click Offline Cohort Pedagogical Action)
  const [isMicroGroupsOpen, setIsMicroGroupsOpen] = useState(false);
  const [microGroupClassContext, setMicroGroupClassContext] = useState(null);

  // Student Pedagogical Note Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pedagogicalNote, setPedagogicalNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  const loadHeatmap = useCallback(async () => {
    setLoading(true);
    try {
      const data = await practiceService.getClassHeatmap(selectedClassId, {
        domainCode: domainFilter,
        minMastery: minMasteryFilter === '' ? null : Number(minMasteryFilter)
      });
      setHeatmap(data);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, domainFilter, minMasteryFilter]);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  const handleForceAggregate = async () => {
    setAggregating(true);
    try {
      const res = await practiceService.forceAggregateClassHeatmap(selectedClassId);
      toast.success(
        res?.message ||
          `Đã tái tổng hợp ${res?.totalSkillsCalculated || 0} kỹ năng trên ma trận nhiệt lớp học!`
      );
      await loadHeatmap();
    } catch (err) {
      toast.error(err?.message || 'Không thể cưỡng chế tổng hợp ma trận nhiệt lúc này.');
    } finally {
      setAggregating(false);
    }
  };

  const handleOpenMicroGroups = (focusSkillName = null) => {
    setMicroGroupClassContext({
      id: selectedClassId,
      classId: selectedClassId,
      name: heatmap?.className || 'Lớp ĐGNL Cơ sở 1 - ĐHQG TP.HCM',
      code: selectedClassId === FLOW5_DEFAULTS.SECONDARY_CLASS_ID ? 'CLS-HCM01-02' : 'CLS-HCM01-01',
      focusSkill: focusSkillName
    });
    setIsMicroGroupsOpen(true);
  };

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!pedagogicalNote.trim()) return;
    setNoteSent(true);
    toast.success(`Đã gửi nhận xét sư phạm đến ${selectedStudent?.studentName} & Phụ huynh!`);
    setTimeout(() => {
      setNoteSent(false);
      setPedagogicalNote('');
      setSelectedStudent(null);
    }, 1500);
  };

  const columns = heatmap?.columns || [];
  const filteredRows = useMemo(() => {
    const rawRows = heatmap?.rows || [];
    return rawRows.filter((row) => {
      if (riskFilter !== 'ALL' && row.riskStatus !== riskFilter) return false;
      if (
        searchQuery.trim() &&
        !String(row.studentName || '')
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [heatmap?.rows, riskFilter, searchQuery]);

  const highRiskCount = (heatmap?.rows || []).filter((r) => r.riskStatus === 'HIGH_RISK').length;
  const bimodalCount = columns.filter((c) => c.isBimodal).length;

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 lg:p-7 text-white border border-blue-900/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Core Flow 5 • Teacher 2D Class Heatmap
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                heatmap?._source === 'backend'
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : 'bg-amber-500/20 border-amber-400/30 text-amber-200'
              }`}
            >
              {heatmap?._source === 'backend' ? '● Live Cache < 300ms' : '● Dữ liệu chuẩn Seed CSDL'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Ma Trận Nhiệt Năng Lực Lớp Học 2D & Điều Phối Nhóm Vi Mô
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Giám sát xác suất thành thạo <code className="text-cyan-300 font-bold">P(Lt)</code> theo từng học sinh × kỹ năng, tự động phát hiện phân hóa 2 cực (<code className="text-amber-300 font-bold">Bimodal σ ≥ 0.28</code>) và chia nhóm bàn học offline 3–5 bạn để phát phiếu bài tập thích ứng tức thì.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleForceAggregate}
            disabled={aggregating}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs transition-all disabled:opacity-60"
            title="Kích hoạt API Force Aggregate quét lại toàn bộ BKT và làm tươi bộ nhớ đệm"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-300 ${aggregating ? 'animate-spin' : ''}`} />
            <span>{aggregating ? 'Đang tổng hợp...' : 'Cập nhật tức thì (Force Aggregate)'}</span>
          </button>

          <button
            onClick={() => handleOpenMicroGroups(null)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-[#eab308] text-slate-950 font-black text-xs shadow-lg shadow-yellow-500/20 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Chia Nhóm Bàn Vi Mô (3–5 Bạn)</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Sĩ số theo dõi</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{heatmap?.totalStudents ?? 0} học sinh</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Học sinh nguy cơ cao</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{highRiskCount} em</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Kỹ năng phân cực 2 đầu</div>
            <div className="text-2xl font-black text-indigo-600 mt-0.5">{bimodalCount} kỹ năng</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Split className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Đồng bộ gần nhất</div>
            <div className="text-sm font-extrabold text-slate-800 mt-1">
              {heatmap?.lastAggregatedAt
                ? new Date(heatmap.lastAggregatedAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                : '--:--'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dynamic Pedagogical Alerts (CRITICAL_RED & WARNING_AMBER) */}
      {(heatmap?.pedagogicalAlerts || []).length > 0 && (
        <div className="space-y-3">
          {heatmap.pedagogicalAlerts.map((alert) => {
            const isCritical = alert.alertLevel === 'CRITICAL_RED';
            return (
              <div
                key={alert.skillId}
                className={`p-4 lg:p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {isCritical ? 'Cảnh báo Đỏ Sư phạm' : 'Cảnh báo Vàng'}
                      </span>
                      <strong className="text-sm font-extrabold">{alert.skillName}</strong>
                      <span className="text-[11px] font-bold opacity-80">
                        • TB lớp: {(Number(alert.averagePlt || 0) * 100).toFixed(0)}% • Yếu:{' '}
                        {(Number(alert.strugglingRate || 0) * 100).toFixed(0)}% ({alert.strugglingCount} học sinh)
                      </span>
                    </div>
                    <p className="leading-relaxed opacity-90">{alert.suggestedAction}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenMicroGroups(alert.skillName)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shrink-0 flex items-center gap-2 transition-all shadow-sm ${
                    isCritical
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Xếp Nhóm & Giao Phiếu Thích Ứng</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Bar + 2D Class Heatmap Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {heatmap?.className || 'Bản đồ nhiệt Năng lực Lớp học (2D Matrix)'}
            </h2>
            <p className="text-xs text-slate-500">
              Rê chuột vào từng ô điểm để xem thời điểm cập nhật BKT gần nhất của học sinh.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> P(Lt) &lt; 50% (Hổng)
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 50% – 74% (Đang luyện)
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≥ 75% (Làm chủ)
            </span>
          </div>
        </div>

        {/* Multi-Dimensional Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Class Selector */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Lớp học phụ trách
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Miền năng lực
            </label>
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {DOMAIN_OPTIONS.map((dom) => (
                  <option key={dom.code} value={dom.code}>
                    {dom.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min Mastery Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Ngưỡng lọc cột kỹ năng
            </label>
            <select
              value={minMasteryFilter}
              onChange={(e) => setMinMasteryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Hiển thị mọi mức P(Lt)</option>
              <option value="0.55">Chỉ cột yếu (TB ≤ 55%)</option>
              <option value="0.70">Cần củng cố (TB ≤ 70%)</option>
            </select>
          </div>

          {/* Student Search & Risk Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Tìm tên / Lọc rủi ro
            </label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tên HS..."
                  className="w-full pl-7 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700"
              >
                <option value="ALL">Tất cả</option>
                <option value="HIGH_RISK">Đỏ</option>
                <option value="MEDIUM_RISK">Vàng</option>
                <option value="SAFE">Xanh</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2D Matrix Table */}
        {loading ? (
          <div className="py-14 text-center space-y-3 animate-pulse">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-600">Đang tải Ma trận nhiệt lớp học...</div>
          </div>
        ) : columns.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-extrabold text-slate-700">
              Không có cột kỹ năng nào khớp với bộ lọc hiện tại.
            </div>
            <button
              onClick={() => {
                setDomainFilter('ALL');
                setMinMasteryFilter('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3.5 font-extrabold min-w-[200px] sticky left-0 bg-slate-50 z-10">
                    Học sinh & Vector IRT θ
                  </th>
                  {columns.map((col) => {
                    const avgPct = Math.round(Number(col.classAveragePlt || 0) * 100);
                    const colPill =
                      col.alertStatus === 'CRITICAL_RED'
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : col.alertStatus === 'WARNING_AMBER'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    return (
                      <th key={col.skillId} className="p-3 text-center min-w-[165px] align-top">
                        <div className="space-y-1.5">
                          <div className="font-extrabold text-slate-900 leading-snug line-clamp-2" title={col.skillName}>
                            {col.skillName}
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${colPill}`}>
                              TB: {avgPct}%
                            </span>
                            {col.isBimodal && (
                              <span
                                className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-extrabold flex items-center gap-0.5"
                                title="Phân hóa 2 cực (σ ≥ 0.28): Lớp tách thành nhóm rất giỏi và nhóm mất gốc, cần chia bàn vi mô ngay"
                              >
                                <Split className="w-2.5 h-2.5" />
                                Phân cực
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3.5 font-extrabold text-center min-w-[115px]">Mức rủi ro</th>
                  <th className="p-3.5 font-extrabold text-right min-w-[150px]">Can thiệp</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => {
                  const cellMap = new Map((row.skillCells || []).map((c) => [c.skillId, c]));
                  const riskInfo = RISK_BADGE_MAP[row.riskStatus] || RISK_BADGE_MAP.SAFE;
                  const thetaNum = Number(row.thetaScore ?? 0);

                  return (
                    <tr key={row.studentId} className="hover:bg-blue-50/30 transition-all">
                      <td className="p-3.5 font-bold text-slate-900 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                            {String(row.studentName || 'H').charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{row.studentName}</div>
                            <div className="text-[10px] font-bold text-slate-500">
                              IRT θ ={' '}
                              <span className={thetaNum >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {thetaNum >= 0 ? `+${thetaNum.toFixed(2)}` : thetaNum.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {columns.map((col) => {
                        const cell = cellMap.get(col.skillId);
                        const plt = Number(cell?.plt ?? 0);
                        const pct = Math.round(plt * 100);
                        const cellStyle =
                          plt < 0.5
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 ring-1 ring-rose-500/10'
                            : plt < 0.75
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200';

                        return (
                          <td key={col.skillId} className="p-3 text-center">
                            <span
                              title={
                                cell?.lastUpdated
                                  ? `Cập nhật: ${new Date(cell.lastUpdated).toLocaleString('vi-VN')} • Mức: ${cell.masteryLevel}`
                                  : col.skillName
                              }
                              className={`inline-flex items-center justify-center min-w-[56px] px-2.5 py-1.5 rounded-xl font-black text-xs transition-transform hover:scale-105 cursor-default ${cellStyle}`}
                            >
                              {pct}%
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${riskInfo.cls}`}>
                          {riskInfo.label}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(row)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[11px] transition-all"
                          >
                            Nhận xét
                          </button>
                          <button
                            onClick={() => handleOpenMicroGroups(null)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[11px] transition-all"
                            title="Mở sơ đồ bàn vi mô 3-5 học sinh"
                          >
                            Xếp nhóm
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Core Flow 6: Early Warnings & Pedagogical Intervention Hub (BR-04) */}
      <EarlyWarningsMentorPanel
        currentUser={currentUser}
        defaultClassId={selectedClassId}
        roleLabel="Giáo Viên Phụ Trách Lớp"
      />

      {/* Offline Micro-Groups Station Modal (Core Flow 5 API 3) */}
      <ClassMicroGroupsModal
        isOpen={isMicroGroupsOpen}
        onClose={() => setIsMicroGroupsOpen(false)}
        classData={microGroupClassContext}
      />

      {/* Send Pedagogical Note Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <h3 className="text-base font-extrabold text-slate-900">
              Gửi Nhận xét Sư phạm đến:{' '}
              <span className="text-blue-600">{selectedStudent.studentName}</span>
            </h3>

            <p className="text-xs text-slate-500">
              Nhận xét sẽ được đồng bộ trực tiếp sang Cổng Học sinh & Cổng Phụ huynh đồng hành (Flow 5).
            </p>

            <form onSubmit={handleSendNote} className="space-y-3">
              <textarea
                value={pedagogicalNote}
                onChange={(e) => setPedagogicalNote(e.target.value)}
                placeholder="Ví dụ: Thầy đã xếp em vào Bàn vi mô 01 và giao Phiếu bài tập thích ứng 5 câu chuyên đề Logic mệnh đề để củng cố P(Lt) lên trên 0.70..."
                rows={4}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                required
              />

              {noteSent && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Đã gửi nhận xét thành công đến Học sinh & Phụ huynh!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi nhận xét</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
