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
  RotateCw,
  Layers,
  Zap,
  Split,
  Clock,
  ShieldAlert,
  Download,
  Eye,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  CheckCircle2,
  XCircle,
  X,
  LayoutGrid,
  Table,
  Flame,
  BookOpen,
  BarChart3,
  SlidersHorizontal
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import contentService from '../../services/contentService';
import ClassMicroGroupsModal from '../modals/ClassMicroGroupsModal';
import EarlyWarningsMentorPanel from './EarlyWarningsMentorPanel';
import TeacherProctoringReviewModal from '../modals/TeacherProctoringReviewModal';
import TeacherStudentDrillDownModal from '../modals/TeacherStudentDrillDownModal';
import { toast } from '../../context/ToastContext';

const DOMAIN_OPTIONS = [
  { code: 'ALL', label: 'Tất cả 4 miền năng lực' },
  { code: 'DOM_MATH', label: 'Toán & Tư duy Logic' },
  { code: 'DOM_LANG', label: 'Sử dụng Ngôn ngữ' },
  { code: 'DOM_NAT_SCI', label: 'Khoa học Tự nhiên' },
  { code: 'DOM_SOC_SCI', label: 'Khoa học Xã hội' }
];

const DOMAIN_LABELS_MAP = {
  DOM_MATH: { label: 'Toán & Tư duy Logic', shortLabel: 'Toán & Logic', icon: '📐', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  DOM_LANG: { label: 'Sử dụng Ngôn ngữ', shortLabel: 'Ngôn ngữ', icon: '📖', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  DOM_NAT_SCI: { label: 'Khoa học Tự nhiên', shortLabel: 'KHTN', icon: '🔬', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  DOM_SOC_SCI: { label: 'Khoa học Xã hội', shortLabel: 'KHXH', icon: '🌍', bg: 'bg-purple-50 text-purple-800 border-purple-200' }
};

const RISK_BADGE_MAP = {
  HIGH_RISK: { label: 'Cần kèm cặp', cls: 'bg-rose-600 text-white shadow-xs' },
  MEDIUM_RISK: { label: 'Cần theo dõi', cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
  SAFE: { label: 'Tiến độ tốt', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }
};

const formatStudentProficiency = (theta) => {
  const t = Number(theta ?? 0);
  if (t >= 1.0) return 'Xuất sắc';
  if (t >= 0.5) return 'Giỏi';
  if (t >= 0.0) return 'Khá';
  if (t >= -0.5) return 'Trung bình';
  return 'Cần bồi dưỡng';
};

export default function TeacherDashboardView({ currentUser, onOpenAdaptiveQuiz, initialView = 'heatmap' }) {
  // Navigation tabs inside Teacher Dashboard
  const [activeView, setActiveView] = useState(initialView || 'heatmap'); // 'heatmap' | 'warnings' | 'proctoring'

  // View Format: 'table' (Ma trận nhiệt) | 'cards' (Thẻ học sinh trực quan)
  const [viewFormat, setViewFormat] = useState('table');

  // Column View Mode: 'focus' (Mặc định: Top chuyên đề yếu cần cứu trợ) | 'domain' (Gom theo 4 Miền) | 'all' (Tất cả chuyên đề)
  const [columnViewMode, setColumnViewMode] = useState('focus');

  // Domain được bung ra khi ở chế độ 'domain'
  const [expandedDomain, setExpandedDomain] = useState(null);

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  // Dynamic Class Roster
  const [classesList, setClassesList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Filters for Heatmap
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [minMasteryFilter, setMinMasteryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Heatmap State
  const [heatmap, setHeatmap] = useState(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [aggregating, setAggregating] = useState(false);

  // Micro-Groups Modal
  const [isMicroGroupsOpen, setIsMicroGroupsOpen] = useState(false);
  const [microGroupClassContext, setMicroGroupClassContext] = useState(null);

  // Pedagogical Alerts Modal
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [expandedAlertSkillId, setExpandedAlertSkillId] = useState(null);

  // Student Drill-Down Modal
  const [drillDownStudent, setDrillDownStudent] = useState(null);

  // Proctoring / Thẩm định bài thi thử (Core Flow 3)
  const [flaggedExams, setFlaggedExams] = useState([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedReviewMeta, setSelectedReviewMeta] = useState({ studentName: '', examTitle: '' });
  const [examTitleMap, setExamTitleMap] = useState(() => new Map());

  const studentNameMap = useMemo(() => {
    const map = new Map();
    (heatmap?.rows || []).forEach((r) => {
      if (r.studentId && r.studentName) {
        map.set(String(r.studentId).toLowerCase(), r.studentName);
      }
    });
    return map;
  }, [heatmap]);

  // 1. Fetch Dynamic Classes assigned to this Teacher
  useEffect(() => {
    let active = true;
    setLoadingClasses(true);

    const teacherId = currentUser?.userId || currentUser?.id;
    practiceService.getClasses({ teacherId })
      .then((res) => {
        if (!active) return;
        const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const classes = raw.map((c) => ({
          ...c,
          id: c.classId || c.id,
          classId: c.classId || c.id
        }));
        setClassesList(classes);
        if (classes.length > 0) {
          setSelectedClassId((prev) => {
            const exists = classes.some((c) => c.id === prev);
            return exists ? prev : (currentUser?.classId || classes[0].id);
          });
        } else if (currentUser?.classId) {
          setSelectedClassId(currentUser.classId);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[TeacherDashboardView] Error fetching teacher classes:', err?.message);
        if (currentUser?.classId) {
          setSelectedClassId(currentUser.classId);
        }
      })
      .finally(() => {
        if (active) setLoadingClasses(false);
      });

    return () => { active = false; };
  }, [currentUser]);

  // 2. Load Real Class Heatmap Matrix
  const loadHeatmap = useCallback(async () => {
    if (!selectedClassId) {
      setHeatmap(null);
      return;
    }

    setLoadingHeatmap(true);
    try {
      const data = await practiceService.getClassHeatmap(selectedClassId, {
        domainCode: domainFilter,
        minMastery: minMasteryFilter === '' ? null : Number(minMasteryFilter)
      });
      setHeatmap(data);
    } catch (err) {
      console.warn('[TeacherDashboardView] Error loading heatmap:', err?.message);
      setHeatmap(null);
    } finally {
      setLoadingHeatmap(false);
    }
  }, [selectedClassId, domainFilter, minMasteryFilter]);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  // 3. Load Flagged Mock Exams for Proctoring Queue
  const loadFlaggedExams = useCallback(async () => {
    setLoadingFlagged(true);
    try {
      const [data, examsRes] = await Promise.all([
        practiceService.getFlaggedMockExams(selectedClassId || null),
        contentService.getMockExams().catch(() => [])
      ]);
      const examsList = Array.isArray(examsRes)
        ? examsRes
        : Array.isArray(examsRes?.value)
          ? examsRes.value
          : Array.isArray(examsRes?.data)
            ? examsRes.data
            : [];
      const nextExamMap = new Map();
      examsList.forEach((ex) => {
        const eid = ex.examId || ex.id;
        const title = ex.title || ex.examTitle || ex.name;
        if (eid && title) {
          nextExamMap.set(String(eid).toLowerCase(), title);
        }
      });
      setExamTitleMap(nextExamMap);
      setFlaggedExams(data);
    } catch (err) {
      console.warn('[TeacherDashboardView] Error loading flagged exams:', err?.message);
      setFlaggedExams([]);
    } finally {
      setLoadingFlagged(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (activeView === 'proctoring') {
      loadFlaggedExams();
    }
  }, [activeView, loadFlaggedExams]);

  // Force Aggregate
  const handleForceAggregate = async () => {
    if (!selectedClassId) return;
    setAggregating(true);
    try {
      const res = await practiceService.forceAggregateClassHeatmap(selectedClassId);
      toast.success(
        res?.message || 'Đã làm mới dữ liệu và cập nhật kết quả học tập mới nhất của học sinh!'
      );
      await loadHeatmap();
    } catch (err) {
      toast.error(err?.message || 'Chưa thể làm mới dữ liệu lúc này, vui lòng thử lại sau.');
    } finally {
      setAggregating(false);
    }
  };

  const handleOpenMicroGroups = (focusSkillName = null, focusSkillId = null, targetStudentIds = []) => {
    setIsAlertsModalOpen(false);
    const currentClass = classesList.find((c) => (c.classId || c.id) === selectedClassId);
    setMicroGroupClassContext({
      id: selectedClassId,
      classId: selectedClassId,
      name: currentClass?.name || heatmap?.className || 'Lớp phụ trách',
      code: currentClass?.code || `CLS-${selectedClassId?.slice(0, 8)}`,
      totalStudents: heatmap?.totalStudents || (heatmap?.rows || []).length || 0,
      assignedTeacher: currentClass?.assignedTeacher || 'Thầy/Cô phụ trách',
      focusSkill: focusSkillName,
      focusSkillId: focusSkillId,
      targetStudentIds: targetStudentIds || []
    });
    setIsMicroGroupsOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!heatmap || !heatmap.columns || heatmap.columns.length === 0) {
      toast.error('Không có dữ liệu để xuất file.');
      return;
    }

    const cols = heatmap.columns;
    const rows = filteredRows;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `STT,Mã Học Sinh,Tên Học Sinh,Trình Độ Năng Lực,Tình Trạng,${cols.map(c => `"${c.skillName}"`).join(',')}\n`;

    rows.forEach((row, idx) => {
      const cellMap = new Map((row.skillCells || []).map(c => [c.skillId, c]));
      const skillPcts = cols.map(c => {
        const cell = cellMap.get(c.skillId);
        return cell ? `${Math.round(Number(cell.plt || 0) * 100)}%` : '—';
      });

      const line = [
        idx + 1,
        `"${row.studentId}"`,
        `"${row.studentName}"`,
        `"${formatStudentProficiency(row.thetaScore)}"`,
        `"${RISK_BADGE_MAP[row.riskStatus]?.label || row.riskStatus}"`,
        ...skillPcts
      ].join(',');

      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ket_Qua_Hoc_Tap_${heatmap.className || 'Lop_Hoc'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file báo cáo kết quả học tập thành công!');
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

  // 1. Top chuyên đề lớp yếu nhất cần can thiệp gấp (Focus: classAveragePlt < 0.5 hoặc Top 8 thấp nhất)
  const focusColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    const struggling = columns.filter(
      (c) => c.alertStatus === 'CRITICAL_RED' || c.alertStatus === 'WARNING_AMBER' || Number(c.classAveragePlt || 0) < 0.5
    );
    if (struggling.length > 0) {
      return [...struggling].sort((a, b) => Number(a.classAveragePlt || 0) - Number(b.classAveragePlt || 0)).slice(0, 8);
    }
    return [...columns].sort((a, b) => Number(a.classAveragePlt || 0) - Number(b.classAveragePlt || 0)).slice(0, 6);
  }, [columns]);

  // 2. Gom nhóm các cột theo 4 Miền năng lực
  const domainColumnsMap = useMemo(() => {
    const map = {
      DOM_MATH: { domainCode: 'DOM_MATH', label: 'Toán & Tư duy Logic', shortLabel: 'Toán & Logic', icon: '📐', columns: [], color: 'blue' },
      DOM_LANG: { domainCode: 'DOM_LANG', label: 'Sử dụng Ngôn ngữ', shortLabel: 'Ngôn ngữ', icon: '📖', columns: [], color: 'amber' },
      DOM_NAT_SCI: { domainCode: 'DOM_NAT_SCI', label: 'Khoa học Tự nhiên', shortLabel: 'KHTN', icon: '🔬', columns: [], color: 'emerald' },
      DOM_SOC_SCI: { domainCode: 'DOM_SOC_SCI', label: 'Khoa học Xã hội', shortLabel: 'KHXH', icon: '🌍', columns: [], color: 'purple' },
      OTHER: { domainCode: 'OTHER', label: 'Chuyên đề khác', shortLabel: 'Khác', icon: '📑', columns: [], color: 'slate' }
    };
    columns.forEach((col) => {
      const code = col.domainCode && map[col.domainCode] ? col.domainCode : 'OTHER';
      map[code].columns.push(col);
    });
    return map;
  }, [columns]);

  // 3. Danh sách cột hiệu dụng sẽ render trên bảng
  const effectiveColumns = useMemo(() => {
    if (columnViewMode === 'focus') {
      return focusColumns;
    }
    if (columnViewMode === 'domain') {
      if (expandedDomain && domainColumnsMap[expandedDomain]?.columns?.length > 0) {
        return domainColumnsMap[expandedDomain].columns;
      }
      return focusColumns;
    }
    return columns; // 'all': đầy đủ toàn bộ cột
  }, [columnViewMode, focusColumns, columns, expandedDomain, domainColumnsMap]);

  // 4. Dữ liệu học sinh phong phú cho Cards View
  const studentCardsData = useMemo(() => {
    return filteredRows.map((row) => {
      const cellMap = new Map((row.skillCells || []).map((c) => [c.skillId, c]));
      const allPlts = (row.skillCells || []).map((c) => Number(c.plt || 0));
      const avgPlt = allPlts.length > 0 ? Math.round((allPlts.reduce((a, b) => a + b, 0) / allPlts.length) * 100) : 0;

      // Tìm 3 chuyên đề yếu nhất của em này (< 50% hoặc thấp nhất)
      const weakSkills = (row.skillCells || [])
        .map((cell) => {
          const colInfo = columns.find((c) => c.skillId === cell.skillId);
          return {
            skillId: cell.skillId,
            skillName: colInfo?.skillName || cell.skillId,
            plt: Number(cell.plt || 0),
            pct: Math.round(Number(cell.plt || 0) * 100)
          };
        })
        .filter((s) => s.pct < 50)
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 3);

      return {
        ...row,
        avgPlt,
        weakSkills,
        cellMap
      };
    });
  }, [filteredRows, columns]);

  const highRiskCount = (heatmap?.rows || []).filter((r) => r.riskStatus === 'HIGH_RISK').length;
  const bimodalCount = columns.filter((c) => c.isBimodal).length;

  return (
    <div className="space-y-6 animate-fade">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 lg:p-6 text-white border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Góc Giảng Dạy & Hỗ Trợ Học Sinh
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 border-emerald-400/30 text-emerald-300">
              ● Dữ liệu mới nhất
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
            Theo Dõi Tiến Độ & Mức Độ Hiểu Bài Của Lớp
          </h1>
          <p className="text-xs text-indigo-200/90 max-w-xl">
            Nắm bắt tình hình học tập của từng học sinh, phát hiện nhanh các em gặp khó khăn để xếp nhóm bồi dưỡng kịp thời.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleForceAggregate}
            disabled={aggregating || !selectedClassId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Cập nhật kết quả bài làm mới nhất của học sinh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${aggregating ? 'animate-spin' : ''}`} />
            <span>{aggregating ? 'Đang cập nhật...' : 'Cập Nhật Dữ Liệu'}</span>
          </button>

          <button
            onClick={() => handleOpenMicroGroups(null)}
            disabled={!selectedClassId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FACC15] hover:bg-[#eab308] text-slate-950 font-black text-xs shadow-lg shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            <span>Xếp Nhóm Học Tập (3–5 Em)</span>
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveView('heatmap')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeView === 'heatmap'
              ? 'bg-white text-indigo-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-indigo-600" />
          <span>Tiến Độ Học Tập Theo Chuyên Đề</span>
        </button>

        <button
          onClick={() => setActiveView('warnings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeView === 'warnings'
              ? 'bg-white text-indigo-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Học Sinh Cần Hỗ Trợ</span>
        </button>

        <button
          onClick={() => setActiveView('proctoring')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
            activeView === 'proctoring'
              ? 'bg-white text-indigo-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Kiểm Tra Bài Thi Bất Thường</span>
          {flaggedExams.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
              {flaggedExams.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: HEATMAP & MICRO-GROUPS */}
      {activeView === 'heatmap' && (
        <>
          {/* Quick KPI Strip: 4 ô nhỏ gọn, hiện đại */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sĩ số lớp</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">{heatmap?.totalStudents ?? 0} học sinh</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cần hỗ trợ</span>
                <div className="text-xl font-black text-rose-600 mt-0.5">{highRiskCount} em</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cần củng cố</span>
                <div className="text-xl font-black text-indigo-600 mt-0.5">{bimodalCount} chuyên đề</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Split className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 px-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dữ liệu lúc</span>
                <div className="text-xs font-black text-emerald-700 mt-1">
                  {heatmap?.lastAggregatedAt
                    ? new Date(heatmap.lastAggregatedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '--:--'}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Compact Pedagogical Alerts Strip (Thu gọn thành Alert Bar tinh tế) */}
          {(heatmap?.pedagogicalAlerts || []).length > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-extrabold text-rose-950">
                  Phát hiện {heatmap.pedagogicalAlerts.length} chuyên đề cần bồi dưỡng
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black">
                  {heatmap.pedagogicalAlerts.filter(a => a.alertLevel === 'CRITICAL_RED').length} khẩn cấp (&lt; 40%)
                </span>
                <span className="text-[11px] text-rose-700 hidden lg:inline">
                  — Hệ thống đã tự động lọc các chuyên đề này vào chế độ trọng tâm bên dưới.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAlertsModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ml-auto"
              >
                <Zap className="w-3 h-3" />
                <span>Xem danh sách ({heatmap.pedagogicalAlerts.length})</span>
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 card-shadow space-y-4">
            {/* Toolbar: Tiêu đề lớp + Bộ điều khiển chế độ hiển thị & View format */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{heatmap?.className || 'Lớp phụ trách'}</span>
                  <span className="text-xs font-bold text-slate-400">({filteredRows.length} học sinh)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {viewFormat === 'table'
                    ? 'Bấm vào tên học sinh để xem chi tiết quá trình làm bài và gửi nhận xét.'
                    : 'Theo dõi từng học sinh cùng các điểm yếu hổng kiến thức cần hỗ trợ kịp thời.'}
                </p>
              </div>

              {/* Action Controls Toolbar: Column View Modes & View Format & Legend */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Toggle Column Filter Mode (Chỉ hiện khi ở chế độ table) */}
                {viewFormat === 'table' && (
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setColumnViewMode('focus')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        columnViewMode === 'focus'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Chỉ hiển thị Top các chuyên đề lớp đang yếu nhất để tập trung bồi dưỡng"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Trọng tâm yếu ({focusColumns.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setColumnViewMode('domain')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        columnViewMode === 'domain'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={`Gom nhóm ${columns.length || 0} chuyên đề theo 4 Miền năng lực`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Theo 4 Miền</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setColumnViewMode('all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        columnViewMode === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={`Xem toàn bộ ${columns.length || 0} chuyên đề của chương trình`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tất cả ({columns.length})</span>
                    </button>
                  </div>
                )}

                {/* 2. Toggle View Format (Ma Trận Nhiệt vs Thẻ Học Sinh) */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewFormat('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      viewFormat === 'table'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Xem dạng ma trận nhiệt truyền thống"
                  >
                    <Table className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ma trận</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewFormat('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      viewFormat === 'cards'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Xem dạng thẻ học sinh trực quan"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Thẻ học sinh</span>
                  </button>
                </div>

                {/* 3. Export CSV */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Xuất bảng dữ liệu học sinh dạng CSV/Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            </div>

            {/* Dải hướng dẫn chế độ Domain Drill-Down */}
            {viewFormat === 'table' && columnViewMode === 'domain' && (
              <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs animate-fade">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Bấm vào từng miền để mở rộng chi tiết các chuyên đề con:
                  </span>
                  {Object.entries(domainColumnsMap).filter(([_, d]) => d.columns.length > 0).map(([domCode, d]) => {
                    const isExpanded = expandedDomain === domCode;
                    return (
                      <button
                        key={domCode}
                        type="button"
                        onClick={() => setExpandedDomain(isExpanded ? null : domCode)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isExpanded
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>{d.icon}</span>
                        <span>{d.shortLabel} ({d.columns.length})</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isExpanded ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {isExpanded ? '▲ Thu gọn' : '▼ Mở rộng'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ghi chú màu sắc nhỏ gọn khi ở chế độ table */}
            {viewFormat === 'table' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt; 50% (Chưa nắm vững)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 50% – 74% (Đang tiến bộ)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥ 75% (Đã nắm chắc)
                  </span>
                </div>

                {columnViewMode === 'focus' && (
                  <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    🔥 Đang tập trung Top {effectiveColumns.length} chuyên đề cần bồi dưỡng nhất
                  </span>
                )}
              </div>
            )}

            {/* Multi-Dimensional Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {/* Dynamic Class Selector */}
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Lớp học phụ trách ({classesList.length} lớp)
                </label>
                {loadingClasses ? (
                  <div className="py-2 text-xs text-slate-500 font-semibold animate-pulse">
                    Đang tải danh sách lớp...
                  </div>
                ) : classesList.length === 0 ? (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Chưa được phân công lớp học
                  </div>
                ) : (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {classesList.map((cls) => {
                      const cid = cls.classId || cls.id;
                      return (
                        <option key={cid} value={cid}>
                          {cls.name} {cls.code ? `(${cls.code})` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Domain Filter */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Môn / Miền năng lực
                </label>
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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
                  Lọc mức độ hiểu bài
                </label>
                <select
                  value={minMasteryFilter}
                  onChange={(e) => setMinMasteryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">Tất cả mức độ</option>
                  <option value="0.55">Chuyên đề nhiều em chưa hiểu (≤ 55%)</option>
                  <option value="0.70">Chuyên đề cần ôn tập thêm (≤ 70%)</option>
                </select>
              </div>

              {/* Student Search & Risk Filter */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Tìm tên / Tình trạng
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
                    className="px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="HIGH_RISK">Cần kèm cặp</option>
                    <option value="MEDIUM_RISK">Cần theo dõi</option>
                    <option value="SAFE">Tiến độ tốt</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DỮ LIỆU CHÍNH: BẢNG MA TRẬN HOẶC THẺ HỌC SINH */}
            {loadingHeatmap ? (
              <div className="py-16 text-center space-y-3 animate-pulse">
                <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-600">Đang tải bảng theo dõi lớp học...</div>
              </div>
            ) : !selectedClassId ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <div className="text-xs font-extrabold text-slate-700">
                  Chưa có thông tin phân công lớp giảng dạy cho tài khoản của bạn.
                </div>
                <p className="text-xs text-slate-500">
                  Vui lòng liên hệ Quản trị viên cơ sở để được phân công lớp học phụ trách.
                </p>
              </div>
            ) : columns.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-extrabold text-slate-700">
                  {heatmap?.totalStudents === 0
                    ? 'Lớp học hiện chưa có dữ liệu học sinh hoặc bài làm nào.'
                    : 'Không có chuyên đề nào khớp với bộ lọc hiện tại.'}
                </div>
                {heatmap?.totalStudents === 0 ? (
                  <p className="text-xs text-slate-500">
                    Khi học sinh làm bài khảo sát hoặc luyện tập, kết quả học tập sẽ tự động hiển thị tại đây.
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setDomainFilter('ALL');
                      setMinMasteryFilter('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Hiển thị tất cả
                  </button>
                )}
              </div>
            ) : viewFormat === 'cards' ? (
              /* ĐỊNH DẠNG 1: THẺ HỌC SINH TRỰC QUAN (STUDENT CARDS) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {studentCardsData.map((st) => {
                  const riskInfo = RISK_BADGE_MAP[st.riskStatus] || RISK_BADGE_MAP.SAFE;
                  const isCriticalRisk = st.riskStatus === 'HIGH_RISK';
                  const profLabel = formatStudentProficiency(st.thetaScore);

                  return (
                    <div
                      key={st.studentId}
                      className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 group ${
                        isCriticalRisk
                          ? 'border-rose-200 hover:border-rose-300 bg-gradient-to-b from-white to-rose-50/20'
                          : 'border-slate-200/90 hover:border-indigo-300'
                      }`}
                    >
                      <div className="space-y-3.5">
                        {/* Card Header: Avatar, Name, Risk & Theta */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {String(st.studentName || 'H').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h3
                                onClick={() => setDrillDownStudent(st)}
                                className="font-extrabold text-slate-900 text-sm truncate hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                {st.studentName}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-bold text-slate-500">Đánh giá:</span>
                                <span className="text-[11px] font-extrabold text-indigo-700">{profLabel}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${riskInfo.cls}`}>
                            {riskInfo.label}
                          </span>
                        </div>

                        {/* Overall Mastery Progress Bar */}
                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600">Độ hiểu bài toàn diện:</span>
                            <strong className={`font-black text-xs ${
                              st.avgPlt < 50 ? 'text-rose-600' : st.avgPlt < 75 ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              {st.avgPlt}%
                            </strong>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                st.avgPlt < 50
                                  ? 'bg-rose-500'
                                  : st.avgPlt < 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.max(5, st.avgPlt)}%` }}
                            />
                          </div>
                        </div>

                        {/* Weak Spots / Gaps */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Chuyên đề cần hỗ trợ ({st.weakSkills.length}):</span>
                          </div>

                          {st.weakSkills.length === 0 ? (
                            <p className="text-[11px] text-emerald-700 font-semibold italic bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                              ✓ Em đang nắm vững tốt các chuyên đề đã học.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {st.weakSkills.map((sk) => (
                                <span
                                  key={sk.skillId}
                                  title={sk.skillName}
                                  className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1.5 truncate max-w-[210px]"
                                >
                                  <span className="truncate">{sk.skillName}</span>
                                  <span className="font-black text-rose-600 bg-rose-100 px-1 py-0.2 rounded text-[10px]">
                                    {sk.pct}%
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setDrillDownStudent(st)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết bài làm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenMicroGroups(st.weakSkills[0]?.skillName || null, st.weakSkills[0]?.skillId || null, [st.studentId])}
                          className="py-2 px-3 rounded-xl bg-[#FACC15] hover:bg-[#eab308] text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          title="Xếp nhóm bồi dưỡng riêng cho em này"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Kèm cặp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ĐỊNH DẠNG 2: BẢNG MA TRẬN NHIỆT (HEATMAP TABLE VỚI CỘT HIỆU DỤNG GỌN GÀNG) */
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-3.5 font-extrabold min-w-[200px] sticky left-0 bg-slate-50 z-10">
                        Học sinh
                      </th>
                      {effectiveColumns.map((col) => {
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
                                    title="Nhiều em trong lớp chưa nắm vững chuyên đề này, nên phân nhóm ôn tập"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Cần củng cố
                                  </span>
                                )}
                              </div>
                            </div>
                          </th>
                        );
                      })}
                      <th className="p-3.5 font-extrabold text-center min-w-[115px]">Đánh giá</th>
                      <th className="p-3.5 font-extrabold text-right min-w-[130px]">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => {
                      const cellMap = new Map((row.skillCells || []).map((c) => [c.skillId, c]));
                      const riskInfo = RISK_BADGE_MAP[row.riskStatus] || RISK_BADGE_MAP.SAFE;

                      return (
                        <tr key={row.studentId} className="hover:bg-blue-50/30 transition-all">
                          <td
                            className="p-3.5 font-bold text-slate-900 sticky left-0 bg-white z-10 cursor-pointer"
                            onClick={() => setDrillDownStudent(row)}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                                {String(row.studentName || 'H').charAt(0)}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors">
                                  {row.studentName}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500">
                                  Đánh giá: <span className="font-extrabold text-indigo-700">{formatStudentProficiency(row.thetaScore)}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {effectiveColumns.map((col) => {
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
                                      ? `Cập nhật: ${new Date(cell.lastUpdated).toLocaleString('vi-VN')} • Mức độ hiểu: ${pct}%`
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
                            <button
                              onClick={() => setDrillDownStudent(row)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem chi tiết</span>
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
        </>
      )}

      {/* VIEW 2: EARLY WARNINGS & 3-WAY COUNSELING */}
      {activeView === 'warnings' && (
        <EarlyWarningsMentorPanel
          currentUser={currentUser}
          defaultClassId={selectedClassId || 'ALL'}
          classesList={classesList}
          roleLabel="Giáo Viên Phụ Trách Lớp"
        />
      )}

      {/* VIEW 3: PROCTORING & ACADEMIC INTEGRITY QUEUE */}
      {activeView === 'proctoring' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 card-shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Danh Sách Bài Thi Có Dấu Hiệu Bất Thường Cần Xem Lại
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống tự động ghi nhận các bài thi thử có dấu hiệu chuyển tab nhiều lần hoặc cần thầy cô kiểm tra lại tính trung thực.
              </p>
            </div>

            <button
              onClick={loadFlaggedExams}
              disabled={loadingFlagged}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFlagged ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>

          {loadingFlagged ? (
            <div className="py-16 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải danh sách bài thi cần xem lại...</p>
            </div>
          ) : flaggedExams.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/60 rounded-3xl border border-emerald-200 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-emerald-900">
                Tuyệt vời! Không có bài thi thử nào có dấu hiệu bất thường
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Tất cả học sinh trong lớp làm bài thi thử trực tuyến nghiêm túc, không có bài thi nào vi phạm quy định làm bài.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-3.5 font-extrabold">Thí sinh</th>
                    <th className="p-3.5 font-extrabold">Đề thi</th>
                    <th className="p-3.5 font-extrabold text-center">Thời gian nộp</th>
                    <th className="p-3.5 font-extrabold text-center">Chuyển tab khi thi</th>
                    <th className="p-3.5 font-extrabold text-center">Trạng thái xét duyệt</th>
                    <th className="p-3.5 font-extrabold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flaggedExams.map((exam) => {
                    const tabDepartures = exam.tabDepartureCount ?? 0;
                    const resolvedStudentName =
                      exam.studentName ||
                      studentNameMap.get(String(exam.studentId || '').toLowerCase()) ||
                      '';
                    const resolvedExamTitle =
                      exam.examTitle ||
                      examTitleMap.get(String(exam.examId || '').toLowerCase()) ||
                      'Đề thi thử ĐGNL';
                    const submittedTime =
                      exam.submittedAt ||
                      (exam.status !== 'IN_PROGRESS' ? exam.completedAt : null) ||
                      exam.startedAt;
                    const shortStudentCode = exam.studentId
                      ? `#${String(exam.studentId).slice(-6).toUpperCase()}`
                      : '';
                    return (
                      <tr key={exam.submissionId} className="hover:bg-rose-50/20 transition-all">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                              {String(resolvedStudentName || 'H').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">
                                {resolvedStudentName || (shortStudentCode ? `Học sinh ${shortStudentCode}` : 'Thí sinh')}
                              </div>
                              {shortStudentCode && (
                                <div className="text-[10px] text-slate-500 font-mono">Mã HS: {shortStudentCode}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-800">
                          {resolvedExamTitle}
                        </td>

                        <td className="p-3.5 text-center text-slate-500 font-medium">
                          {submittedTime ? new Date(submittedTime).toLocaleString('vi-VN') : '—'}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            tabDepartures > 3
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{tabDepartures} lần</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black">
                            {exam.integrityStatus === 'FLAGGED_FOR_REVIEW' || exam.integrityStatus === 'UNDER_REVIEW'
                              ? 'Chờ duyệt'
                              : exam.integrityStatus || 'Chờ duyệt'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedReviewMeta({
                                studentName: resolvedStudentName || (shortStudentCode ? `Học sinh ${shortStudentCode}` : ''),
                                examTitle: resolvedExamTitle
                              });
                              setSelectedReviewId(exam.submissionId);
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Xem & duyệt bài</span>
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
      )}

      {/* Offline Micro-Groups Station Modal */}
      <ClassMicroGroupsModal
        isOpen={isMicroGroupsOpen}
        onClose={() => setIsMicroGroupsOpen(false)}
        classData={microGroupClassContext}
      />

      {/* Student Drill-Down Profile Modal (TCH_06) */}
      <TeacherStudentDrillDownModal
        isOpen={Boolean(drillDownStudent)}
        onClose={() => setDrillDownStudent(null)}
        student={drillDownStudent}
        columns={columns}
        onOpenMicroGroups={handleOpenMicroGroups}
      />

      {/* Flagged Mock Exam Proctoring Review Modal (TCH_19 - TCH_27) */}
      <TeacherProctoringReviewModal
        isOpen={Boolean(selectedReviewId)}
        onClose={() => {
          setSelectedReviewId(null);
          setSelectedReviewMeta({ studentName: '', examTitle: '' });
        }}
        submissionId={selectedReviewId}
        fallbackStudentName={selectedReviewMeta.studentName}
        fallbackExamTitle={selectedReviewMeta.examTitle}
        onReviewSubmitted={() => {
          loadFlaggedExams();
        }}
      />

      {/* Pedagogical Alerts Modal Popup (Danh sách chuyên đề cần bồi dưỡng) */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Chuyên Đề Cần Bồi Dưỡng Gấp</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-200">
                      {heatmap?.pedagogicalAlerts?.length || 0} chuyên đề
                    </span>
                  </h3>
                  {/* Ngữ Cảnh Lớp Học Rõ Ràng */}
                  {(() => {
                    const currentClass = classesList.find((c) => (c.classId || c.id) === selectedClassId);
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <span>Lớp: <strong className="text-slate-900">{currentClass?.name || heatmap?.className || 'Lớp phụ trách'}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Mã: <strong className="text-indigo-600 font-bold">{currentClass?.code || selectedClassId?.slice(0, 8)}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Sĩ số: <strong className="text-slate-900">{heatmap?.totalStudents || (heatmap?.rows || []).length || 0} học sinh</strong></span>
                      </div>
                    );
                  })()}
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Danh sách các chuyên đề có tỷ lệ học sinh chưa đạt ≥ 40%. Thầy/cô có thể bấm xem cụ thể học sinh nào chưa đạt và tạo ngay nhóm vi mô 3–5 em kèm riêng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable list */}
            <div className="p-5 lg:p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
              {(heatmap?.pedagogicalAlerts || []).map((alert) => {
                const isCritical = alert.alertLevel === 'CRITICAL_RED';
                const isExpanded = expandedAlertSkillId === alert.skillId;
                const strugglingStudents = (heatmap?.rows || []).filter((r) => {
                  const cell = (r.skillCells || []).find((c) => c.skillId === alert.skillId);
                  return cell ? Number(cell.plt || 0) < 0.5 : false;
                });

                return (
                  <div
                    key={alert.skillId}
                    className="pt-3.5 first:pt-0 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="space-y-1 text-xs flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isCritical ? 'Cần bồi dưỡng gấp' : 'Cần lưu ý ôn tập'}
                          </span>
                          <strong className="text-sm font-extrabold text-slate-900">{alert.skillName}</strong>
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                          <span>
                            Hiểu bài: <strong className="text-slate-900">{(Number(alert.averagePlt || 0) * 100).toFixed(0)}%</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            Chưa đạt:{' '}
                            <strong className="text-rose-600">
                              {strugglingStudents.length > 0
                                ? `${((strugglingStudents.length / (heatmap?.totalStudents || (heatmap?.rows || []).length || 1)) * 100).toFixed(0)}% (${strugglingStudents.length} học sinh)`
                                : `${(Number(alert.strugglingRate || 0) * 100).toFixed(0)}% (${alert.strugglingCount || 0} học sinh)`}
                            </strong>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{alert.suggestedAction}</p>

                        {/* Nút Xem Danh Sách Học Sinh Cụ Thể */}
                        <button
                          type="button"
                          onClick={() => setExpandedAlertSkillId(isExpanded ? null : alert.skillId)}
                          className="mt-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {isExpanded 
                              ? 'Thu gọn danh sách học sinh ▲' 
                              : `Xem ${strugglingStudents.length} học sinh chưa đạt chuyên đề này ▼`}
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenMicroGroups(alert.skillName, alert.skillId, strugglingStudents.map(s => s.studentId))}
                        className={`px-3.5 py-2 rounded-xl font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-center ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                        }`}
                        title="Tạo nhóm học tập vi mô 3 - 5 bạn trọng tâm chuyên đề này"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Tạo Nhóm Bồi Dưỡng</span>
                      </button>
                    </div>

                    {/* Danh Sách Học Sinh Drill-down */}
                    {isExpanded && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-fade-in">
                        <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          <span>Học sinh chưa đạt ({strugglingStudents.length} em):</span>
                          <span className="text-slate-400 font-normal">Độ hiểu bài &lt; 50%</span>
                        </div>

                        {strugglingStudents.length === 0 ? (
                          <div className="text-xs text-slate-400 italic py-1">Không có học sinh nào dưới 50% ở thời điểm này.</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {strugglingStudents.map((st) => {
                              const cell = (st.skillCells || []).find((c) => c.skillId === alert.skillId);
                              const pltPct = cell ? Math.round(Number(cell.plt || 0) * 100) : 0;
                              return (
                                <div 
                                  key={st.studentId}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                      {(st.studentName || 'H').charAt(0)}
                                    </div>
                                    <span className="font-bold text-slate-800 truncate" title={st.studentName}>
                                      {st.studentName}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-black text-rose-600 shrink-0 ml-2">
                                    Hiểu: {pltPct}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
