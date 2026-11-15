import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bot,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  Sparkles,
  BookOpen,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Send,
  RefreshCw,
  FileText,
  Check,
  X,
  MessageSquare,
  HelpCircle,
  Award,
  Zap,
  ChevronRight,
  User,
  GraduationCap,
  History,
  AlertCircle
} from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

// Mock seed cases representing standard Core Flow 4 Human-in-the-Loop scenarios
const SEED_INTERACTIONS = [
  {
    id: '98e1f0fd-aed6-45f6-beac-be24686b573c',
    student_id: '4f7bf3f2-790c-45d7-a2a2-524bf0e6cb61',
    student_name: 'Nguyễn Minh Quân',
    class_name: 'Lớp ĐGNL Cơ sở 1 - ĐHQG TP.HCM',
    question_id: '22222222-2222-2222-2222-222222222222',
    question_latex: 'Tìm tất cả các giá trị của tham số thực $m$ để đồ thị hàm số $y = \\frac{x - 1}{x^2 - 2mx + 4}$ có đúng hai đường tiệm cận đứng.',
    options: {
      A: '$m \\in (-\\infty; -2) \\cup (2; +\\infty) \\setminus \\{\\frac{5}{2}\\}$',
      B: '$-2 < m < 2$',
      C: '$m > 2$',
      D: '$m \\in (-\\infty; -2) \\cup (2; +\\infty)$'
    },
    student_selected_option: 'B',
    correct_option: 'A',
    pattern_code: 'PAT_CALC_ASYMPTOTE_03',
    pattern_name: 'Tìm tham số m để đồ thị hàm phân thức có đúng k tiệm cận đứng',
    matched_trap_id: 'trap-001',
    trap_code: 'TRAP_DENOMINATOR_ROOT_CANCEL',
    trap_name: 'Quên kiểm tra nghiệm của mẫu số làm triệt tiêu tử số',
    misconception_explanation: 'Học sinh chỉ đặt điều kiện mẫu có 2 nghiệm phân biệt (Delta > 0) mà quên mất điều kiện nghiệm của mẫu phải khác nghiệm tử số (x = 1), dẫn đến chọn thiếu điều kiện loại trừ m = 5/2.',
    ai_guidance_transcript: [
      {
        role: 'student',
        option: 'B',
        option_text: '-2 < m < 2',
        text: 'Em chọn phương án B: -2 < m < 2 vì em nghĩ mẫu số phải có nghiệm.'
      },
      {
        role: 'tutor',
        text: 'Chào em! Đáp án đúng câu này phải là phương án A nhé. Vì mẫu số cần 2 nghiệm phân biệt và nghiệm đó không được làm triệt tiêu tử số $x = 1$. Khi thay $x = 1$ vào mẫu ta có $1 - 2m + 4 = 0 \\iff m = 5/2$, nên ta loại $m = 5/2$. Do đó đáp án là A.',
        is_fallback: false
      }
    ],
    student_reported: true,
    report_reason: 'revealed_direct_answer: AI nói thẳng đáp án là A ngay ở dòng đầu tiên, không có tính sư phạm gợi mở từng bước.',
    validation_status: 'FLAGGED',
    mentor_resolution: null,
    mentor_notes: '',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: '640f303e-5120-41a3-a9a9-c8931ec3fe14',
    student_id: '5e8bf3f2-120c-45d7-b3b3-624bf0e6cb72',
    student_name: 'Trần Thị Mai Lan',
    class_name: 'Lớp ĐGNL Tăng Tốc (750 - 900)',
    question_id: '33333333-3333-3333-3333-333333333333',
    question_latex: 'Trong một nhóm bạn gồm 6 người A, B, C, D, E, F ngồi quanh một bàn tròn. Biết A luôn ngồi cạnh B, nhưng C không ngồi cạnh D. Có bao nhiêu cách xếp chỗ thỏa mãn?',
    options: {
      A: '48 cách',
      B: '36 cách',
      C: '24 cách',
      D: '18 cách'
    },
    student_selected_option: 'C',
    correct_option: 'A',
    pattern_code: 'PAT_LOGIC_CIRCULAR_PERMUTATION',
    pattern_name: 'Tư duy hoán vị vòng quanh có điều kiện buộc và loại trừ',
    matched_trap_id: 'trap-002',
    trap_code: 'TRAP_CIRCULAR_FIX_POINT',
    trap_name: 'Nhầm lẫn công thức hoán vị thẳng n! với hoán vị tròn (n-1)!',
    misconception_explanation: 'Học sinh quên cố định 1 phần tử khi xếp bàn tròn, hoặc tính trùng lặp khi buộc cặp (A, B) thành 1 khối.',
    ai_guidance_transcript: [
      {
        role: 'student',
        option: 'C',
        option_text: '24 cách',
        text: 'Em tính ra 24 cách vì lấy 4! = 24.'
      },
      {
        role: 'tutor',
        text: 'Chào em! Để giải bài toán xếp bàn tròn này, em hãy dùng công thức tính nhanh đặc biệt $n! / 2$ của hình học phẳng nhé. Khi áp dụng cho 6 người ta có $6! / 2 = 360$ rồi chia cho số cặp...',
        is_fallback: false
      }
    ],
    student_reported: true,
    report_reason: 'hallucination: AI đưa ra công thức tính nhanh n! / 2 hoàn toàn lạ và sai lệch, không có trong phương pháp giải hoán vị tròn.',
    validation_status: 'FLAGGED',
    mentor_resolution: null,
    mentor_notes: '',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'b3de25cb-7cec-403b-a5da-3e3f8c68f85c',
    student_id: '6f9cf3f2-890c-45d7-c4c4-734bf0e6cb83',
    student_name: 'Lê Hoàng Nam',
    class_name: 'Lớp ĐGNL Nền Tảng (<750)',
    question_id: '44444444-4444-4444-4444-444444444444',
    question_latex: 'Cho $m$ gam bột sắt phản ứng hoàn toàn với dung dịch $HNO_3$ loãng dư, thu được $0,448$ lít khí $NO$ (đktc, sản phẩm khử duy nhất). Giá trị của $m$ là bao nhiêu?',
    options: {
      A: '1,12 gam',
      B: '1,68 gam',
      C: '0,56 gam',
      D: '2,24 gam'
    },
    student_selected_option: 'C',
    correct_option: 'A',
    pattern_code: 'PAT_CHEM_REDOX_ELECTRON_BALANCE',
    pattern_name: 'Bảo toàn electron kim loại tác dụng axit có tính oxi hóa mạnh',
    matched_trap_id: 'trap-003',
    trap_code: 'TRAP_FE_OXIDATION_STATE',
    trap_name: 'Nhầm số oxi hóa Fe lên +2 thay vì +3 khi HNO3 dư',
    misconception_explanation: 'Học sinh coi Fe lên Fe+2 nên nhường 2e thay vì nhường 3e lên Fe+3 khi gặp HNO3 dư.',
    ai_guidance_transcript: [
      {
        role: 'student',
        option: 'C',
        option_text: '0,56 gam',
        text: 'Em tính n_NO = 0.02 mol, bảo toàn e: 2 * n_Fe = 2 * n_NO nên n_Fe = 0.01 mol -> m = 0.56g.'
      },
      {
        role: 'tutor',
        text: 'Chào em! Em hãy kiểm tra lại bài học về tính oxi hóa của axit nhé. Axit này có tính oxi hóa rất mạnh đấy.',
        is_fallback: false
      }
    ],
    student_reported: true,
    report_reason: 'confusing_guidance: Lời gợi ý của AI quá ngắn và mơ hồ, không giúp chỉ ra em đang viết sai phương trình trao đổi electron ở đâu.',
    validation_status: 'FLAGGED',
    mentor_resolution: 'OVERRIDDEN_EXEMPLAR_SAVED',
    mentor_notes: 'Đã bổ sung lời giải mẫu chuẩn: Nhấn mạnh Fe + HNO3 dư -> Fe(NO3)3 (Fe nhường 3e).',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

export default function AiTutorModerationView({ currentUser, onBackToDashboard }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState('pending'); // 'pending' | 'all' | 'resolved' | 'reported'
  const [searchQuery, setSearchQuery] = useState('');

  // Mentor Action Form States
  const [actionTab, setActionTab] = useState('override'); // 'override' | 'add_trap' | 'verify'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form: Override Golden Exemplar
  const [goldenSolution, setGoldenSolution] = useState('');
  const [socraticSteps, setSocraticSteps] = useState('');

  // Form: Add Novel Cognitive Trap
  const [trapCode, setTrapCode] = useState('');
  const [trapName, setTrapName] = useState('');
  const [trapOption, setTrapOption] = useState('B');
  const [trapExplanation, setTrapExplanation] = useState('');
  const [trapSocraticHint, setTrapSocraticHint] = useState('');

  // Form: Verify / Dismiss
  const [verifyNotes, setVerifyNotes] = useState('');

  // Fetch interactions from Backend API
  const loadInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await practiceService.getAiTutorInteractions({ reportedOnly: false });
      const rawList = Array.isArray(data) ? data : data?.items || [];

      // Merge real backend data with seed interactions ensuring unique IDs
      const mergedMap = new Map();
      SEED_INTERACTIONS.forEach(item => mergedMap.set(item.id, item));

      rawList.forEach(item => {
        const mapped = {
          id: item.id || String(Math.random()),
          student_id: item.student_id || 'unknown',
          student_name: item.student_name || 'Học viên ĐGNL',
          class_name: item.class_name || 'Lớp ĐGNL Cơ sở 1',
          question_id: item.question_id,
          question_latex: item.question_latex || item.questionLatex || 'Câu hỏi ôn tập ĐGNL',
          options: item.options || { A: 'Phương án A', B: 'Phương án B', C: 'Phương án C', D: 'Phương án D' },
          student_selected_option: item.student_selected_option || item.studentSelectedOption || 'B',
          correct_option: item.correct_option || item.correctOption || 'A',
          pattern_code: item.pattern_code || item.patternCode || 'PAT_CORE_DEFAULT',
          pattern_name: item.pattern_name || item.patternName || 'Dạng bài chuẩn hóa V-ACT',
          matched_trap_id: item.matched_trap_id || item.matchedTrapId,
          trap_code: item.trap_code || item.trapCode || 'TRAP_CORE',
          trap_name: item.trap_name || item.trapName || 'Bẫy tư duy trọng tâm',
          misconception_explanation: item.misconception_explanation || item.misconceptionExplanation || 'Sai sót trong suy luận logic.',
          ai_guidance_transcript: Array.isArray(item.ai_guidance_transcript) ? item.ai_guidance_transcript : [],
          student_reported: Boolean(item.student_reported ?? item.studentReported),
          report_reason: item.report_reason || item.reason || (item.student_reported ? 'Học sinh báo cáo câu trả lời của AI chưa chính xác hoặc khó hiểu.' : ''),
          validation_status: item.validation_status || item.validationStatus || 'PASSED',
          mentor_resolution: item.mentor_resolution || item.mentorResolution || null,
          mentor_notes: item.mentor_notes || '',
          created_at: item.created_at || item.createdAt || new Date().toISOString()
        };
        mergedMap.set(mapped.id, mapped);
      });

      const list = Array.from(mergedMap.values());
      setInteractions(list);

      // Select first item by default
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch {
      // Fallback seamlessly to seed interactions
      setInteractions(SEED_INTERACTIONS);
      if (!selectedId && SEED_INTERACTIONS.length > 0) {
        setSelectedId(SEED_INTERACTIONS[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  // Selected item reference
  const selectedItem = useMemo(() => {
    return interactions.find(item => item.id === selectedId) || interactions[0] || null;
  }, [interactions, selectedId]);

  // Pre-fill action forms when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setGoldenSolution(
        selectedItem.correct_option === 'A'
          ? `Điều kiện có 2 tiệm cận đứng phân biệt:\\n1. Phương trình mẫu số $x^2 - 2mx + 4 = 0$ có 2 nghiệm phân biệt: $\\Delta' = m^2 - 4 > 0 \\iff m > 2$ hoặc $m < -2$.\\n2. Nghiệm của mẫu số khác nghiệm tử số ($x \\neq 1$): $1^2 - 2m(1) + 4 \\neq 0 \\iff 5 - 2m \\neq 0 \\iff m \\neq \\frac{5}{2}$.\\n\\nKết luận: $m \\in (-\\infty; -2) \\cup (2; +\\infty) \\setminus \\{\\frac{5}{2}\\}$.`
          : `Lời giải chuẩn hóa cho dạng bài ${selectedItem.pattern_name}`
      );
      setSocraticSteps(
        `Bước 1: Nhắc học sinh điều kiện để $x = x_0$ là tiệm cận đứng của $\\frac{P(x)}{Q(x)}$.\\nBước 2: Yêu cầu học sinh kiểm tra điều kiện mẫu số có 2 nghiệm phân biệt.\\nBước 3: Đặt câu hỏi: Nếu một trong hai nghiệm đó bằng $x = 1$ thì đồ thị còn giữ được 2 tiệm cận đứng không?`
      );
      setTrapCode(selectedItem.trap_code ? `${selectedItem.trap_code}_REVISED` : `TRAP_ACADEMIC_${selectedItem.pattern_code || '01'}`);
      setTrapName(selectedItem.trap_name || 'Bẫy nhận thức sai lầm mới');
      setTrapOption(selectedItem.student_selected_option || 'B');
      setTrapExplanation(selectedItem.misconception_explanation || 'Học sinh nhầm lẫn giữa điều kiện cần và điều kiện đủ.');
      setTrapSocraticHint('Em hãy thử thay nghiệm của phương trình mẫu vào tử số xem phân số có bị rút gọn không nhé?');
      setVerifyNotes('');
    }
  }, [selectedItem]);

  // Filtered interaction list
  const filteredList = useMemo(() => {
    return interactions.filter(item => {
      // 1. Tab filter
      if (filterMode === 'pending' && (item.mentor_resolution || !item.student_reported)) return false;
      if (filterMode === 'resolved' && !item.mentor_resolution) return false;
      if (filterMode === 'reported' && !item.student_reported) return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.student_name || '').toLowerCase().includes(q);
        const matchesQuestion = (item.question_latex || '').toLowerCase().includes(q);
        const matchesPattern = (item.pattern_name || '').toLowerCase().includes(q) || (item.pattern_code || '').toLowerCase().includes(q);
        const matchesTrap = (item.trap_name || '').toLowerCase().includes(q);
        if (!matchesName && !matchesQuestion && !matchesPattern && !matchesTrap) return false;
      }
      return true;
    });
  }, [interactions, filterMode, searchQuery]);

  // Status counts
  const counts = useMemo(() => {
    const pending = interactions.filter(i => i.student_reported && !i.mentor_resolution).length;
    const resolved = interactions.filter(i => Boolean(i.mentor_resolution)).length;
    const reported = interactions.filter(i => Boolean(i.student_reported)).length;
    return {
      total: interactions.length,
      pending,
      resolved,
      reported
    };
  }, [interactions]);

  // Action 1: Submit Override Golden Exemplar
  const handleOverrideExemplar = async (e) => {
    e.preventDefault();
    if (!selectedItem || !goldenSolution.trim()) return;

    try {
      setIsSubmitting(true);
      const stepsList = socraticSteps.split('\n').filter(s => s.trim().length > 0);
      await practiceService.overrideTutorExemplar({
        interactionId: selectedItem.id,
        archetypePatternId: selectedItem.matched_trap_id || selectedItem.id,
        questionLatex: selectedItem.question_latex,
        goldenSolution: goldenSolution.trim(),
        correctOption: selectedItem.correct_option,
        explanationSteps: stepsList
      });

      // Update state in-place
      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                mentor_resolution: 'OVERRIDDEN_EXEMPLAR_SAVED',
                mentor_notes: 'Đã lưu lời giải mẫu chuẩn vào Knowledge Graph.'
              }
            : item
        )
      );

      toast.success('Đã lưu Lời Giải Mẫu Chuẩn vào Knowledge Graph thành công!');
    } catch (err) {
      toast.error('Lỗi khi lưu lời giải mẫu: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 2: Submit Add Novel Cognitive Trap
  const handleAddTrap = async (e) => {
    e.preventDefault();
    if (!selectedItem || !trapCode.trim() || !trapName.trim()) return;

    try {
      setIsSubmitting(true);
      await practiceService.addTutorNovelTrap({
        interactionId: selectedItem.id,
        archetypePatternId: selectedItem.matched_trap_id || selectedItem.id,
        trapCode: trapCode.trim(),
        trapName: trapName.trim(),
        wrongOption: trapOption,
        misconceptionExplanation: trapExplanation.trim(),
        socraticHint: trapSocraticHint.trim()
      });

      // Update state in-place
      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                mentor_resolution: 'NEW_TRAP_ADDED',
                trap_code: trapCode.trim(),
                trap_name: trapName.trim(),
                misconception_explanation: trapExplanation.trim(),
                mentor_notes: `Đã bổ sung bẫy tư duy mới: ${trapCode.trim()}`
              }
            : item
        )
      );

      toast.success(`Đã bổ sung Bẫy tư duy mới (${trapCode.trim()}) vào Knowledge Graph thành công!`);
    } catch (err) {
      toast.error('Lỗi khi thêm bẫy tư duy: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 3: Verify / Mark as Accurate
  const handleVerifyAccurate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      await practiceService.resolveTutorReport({
        interactionId: selectedItem.id,
        resolution: 'VERIFIED_ACCURATE',
        notes: verifyNotes.trim() || 'Học sinh hiểu nhầm. Câu trả lời của Gia sư AI hoàn toàn đúng chuẩn sư phạm gợi mở.'
      });

      // Update state in-place
      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                mentor_resolution: 'VERIFIED_ACCURATE',
                mentor_notes: verifyNotes.trim() || 'Thẩm định: Câu trả lời của AI chính xác, đúng chuẩn Socratic.'
              }
            : item
        )
      );

      toast.success('Đã xác nhận phản hồi của AI đạt chuẩn & đóng báo cáo!');
    } catch (err) {
      toast.error('Lỗi khi xác nhận phản hồi: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade w-full pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Core Flow 4: GraphRAG AI Tutor • Human-in-the-Loop Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trung Tâm Kiểm Duyệt Phản Hồi Gia Sư AI & Báo Cáo Học Sinh
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 mt-1.5 max-w-2xl leading-relaxed">
            Tiếp nhận các phiên trả lời bị học sinh báo cáo sai hoặc ảo giác kiến thức. Ban Chuyên Môn / Quản lý học thuật thẩm định và can thiệp sư phạm: Ghi đè lời giải mẫu chuẩn hoặc Bổ sung bẫy tư duy mới vào Knowledge Graph.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={loadInteractions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Về Dashboard
            </button>
          )}
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chờ thẩm định</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{counts.pending} Báo cáo</div>
            <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Học sinh gắn cờ cần xử lý</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã giải quyết</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{counts.resolved} Phiên</div>
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã lưu KG / Xác nhận chuẩn</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng báo cáo học sinh</div>
            <div className="text-2xl font-black text-indigo-900 mt-1">{counts.reported} Lượt</div>
            <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Từ nút Báo cáo trên khung chat</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng phiên tương tác</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{counts.total} Lượt</div>
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <History className="w-3.5 h-3.5" />
              <span>Ghi nhận trong CSDL PostgreSQL</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Split Pane (Left: Interaction List, Right: Inspector & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Search, Filters & Interaction List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
              <button
                onClick={() => setFilterMode('pending')}
                className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'pending'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chờ xử lý</span>
                {counts.pending > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${filterMode === 'pending' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'}`}>
                    {counts.pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilterMode('reported')}
                className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'reported'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Tất cả Báo cáo</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${filterMode === 'reported' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {counts.reported}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('resolved')}
                className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Đã xử lý</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${filterMode === 'resolved' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {counts.resolved}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Toàn bộ</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, dạng bài, câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Cards List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700">Không có phản hồi nào phù hợp</p>
                  <p className="text-[11px] mt-1 text-slate-400">Các báo cáo đã được giải quyết hoặc không khớp bộ lọc.</p>
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected = item.id === selectedId;
                  const isPending = item.student_reported && !item.mentor_resolution;
                  const isResolved = Boolean(item.mentor_resolution);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Student info & Time */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                            isPending ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {item.student_name ? item.student_name[0] : 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.student_name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{item.class_name}</p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 text-right">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                              <Flag className="w-2.5 h-2.5" />
                              <span>Cần xử lý</span>
                            </span>
                          ) : isResolved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" />
                              <span>Đã xử lý</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Bình thường</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Preview snippet */}
                      <div className="text-xs text-slate-700 line-clamp-2 font-medium bg-slate-50/70 p-2 rounded-xl mb-2 border border-slate-100">
                        <MathText text={item.question_latex} />
                      </div>

                      {/* Pattern & Trap Tag */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 truncate max-w-[200px]">
                          {item.pattern_name}
                        </span>
                        {item.trap_code && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            {item.trap_code}
                          </span>
                        )}
                      </div>

                      {/* Student Reported Reason Banner */}
                      {item.student_reported && (
                        <div className="mt-2.5 pt-2 border-t border-rose-100 text-[11px] text-rose-700 font-medium flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                          <span className="line-clamp-2">{item.report_reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Interaction Inspector & Pedagogical Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedItem ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs text-slate-400">
              <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">Chọn một phiên tương tác bên trái để xem chi tiết</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Inspection Card Header */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold font-mono">
                        {selectedItem.pattern_code}
                      </span>
                      {selectedItem.student_reported && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-extrabold flex items-center gap-1">
                          <Flag className="w-3 h-3 text-rose-600" />
                          <span>Học sinh báo cáo lỗi</span>
                        </span>
                      )}
                      {selectedItem.mentor_resolution && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{selectedItem.mentor_resolution}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {selectedItem.pattern_name}
                    </h3>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <div className="font-bold text-slate-800">{selectedItem.student_name}</div>
                    <div className="text-[11px] text-slate-400">{new Date(selectedItem.created_at).toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                {/* Student Report Reason Alert */}
                {selectedItem.student_reported && (
                  <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-1.5 animate-fade">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Ý kiến phản ánh từ học sinh:</span>
                    </div>
                    <p className="text-xs text-rose-900 font-semibold leading-relaxed pl-6">
                      "{selectedItem.report_reason}"
                    </p>
                  </div>
                )}

                {/* Section: Question Context & Answer Truth Comparison */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Nội dung Câu Hỏi & Đối Soát Đáp Án (Ground Truth)</span>
                  </h4>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-900 leading-relaxed">
                    <MathText text={selectedItem.question_latex} />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const isCorrect = optKey === selectedItem.correct_option;
                      const isStudentSelected = optKey === selectedItem.student_selected_option;
                      const optionText = selectedItem.options?.[optKey] || `Phương án ${optKey}`;

                      let borderClass = 'border-slate-200 bg-white text-slate-800';
                      if (isCorrect) borderClass = 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                      if (isStudentSelected && !isCorrect) borderClass = 'border-rose-300 bg-rose-50/80 text-rose-950 font-bold ring-2 ring-rose-500/20';

                      return (
                        <div
                          key={optKey}
                          className={`p-3 rounded-2xl border flex items-start gap-2.5 ${borderClass}`}
                        >
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 mt-0.5 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isStudentSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {optKey}
                          </span>
                          <div className="min-w-0 flex-1">
                            <MathText text={optionText} />
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-extrabold">
                              {isCorrect && <span className="text-emerald-700">✓ ĐÁP ÁN ĐÚNG CSDL</span>}
                              {isStudentSelected && (
                                <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                  (Học sinh chọn {isCorrect ? 'đúng' : 'sai'})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Identified Cognitive Trap Pill */}
                  {selectedItem.trap_name && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-amber-900">Bẫy tư duy được gắn mã ({selectedItem.trap_code}): </span>
                        <span className="font-semibold text-amber-800">{selectedItem.trap_name}. </span>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">{selectedItem.misconception_explanation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Actual Chat Transcript with Socratic AI Tutor */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Nhật Ký Đàm Thoại Giữa Học Sinh & Gia Sư AI Socratic</span>
                  </h4>

                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80 max-h-80 overflow-y-auto">
                    {(selectedItem.ai_guidance_transcript || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">Chưa có dữ liệu đoạn chat chi tiết.</p>
                    ) : (
                      selectedItem.ai_guidance_transcript.map((msg, mIdx) => {
                        const isAI = msg.role === 'tutor' || msg.role === 'ai';
                        return (
                          <div key={mIdx} className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                            {isAI && (
                              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium max-w-[85%] leading-relaxed ${
                              isAI
                                ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs'
                                : 'bg-indigo-600 text-white rounded-tr-none shadow-2xs'
                            }`}>
                              <MathText text={msg.text || (msg.option ? `Em chọn phương án ${msg.option}: ${msg.option_text || ''}` : '')} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Pedagogical Workspace: 3 Human-in-the-Loop Action Tabs */}
              <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-md space-y-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Bàn Làm Việc Thẩm Định & Can Thiệp Sư Phạm (Academic Intervention)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    Human-in-the-Loop
                  </span>
                </div>

                {/* Sub Action Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setActionTab('override')}
                    className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionTab === 'override'
                        ? 'bg-white text-indigo-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>1. Ghi đè Lời Giải Mẫu Chuẩn</span>
                  </button>

                  <button
                    onClick={() => setActionTab('add_trap')}
                    className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionTab === 'add_trap'
                        ? 'bg-white text-indigo-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>2. Bổ sung Bẫy Tư Duy Mới</span>
                  </button>

                  <button
                    onClick={() => setActionTab('verify')}
                    className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionTab === 'verify'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>3. Xác Nhận AI Đúng & Đóng Báo Cáo</span>
                  </button>
                </div>

                {/* TAB 1: Override Golden Exemplar */}
                {actionTab === 'override' && (
                  <form onSubmit={handleOverrideExemplar} className="space-y-4 animate-fade">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Cơ chế cập nhật Tri thức:</strong> Lời giải mẫu chuẩn do Ban Chuyên Môn soạn thảo dưới đây sẽ được lưu trực tiếp vào node <code>PatternExemplar</code> trong Knowledge Graph. Khi các học sinh khác hỏi AI về dạng bài này, hệ thống sẽ ưu tiên trích xuất chính xác lời giải này để làm mẫu tham chiếu.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Lời giải mẫu chuẩn của Giảng viên (Hỗ trợ KaTeX LaTeX $...$):</span>
                        <span className="text-[11px] text-slate-400 font-normal">Súc tích, chuẩn tư duy ĐGNL</span>
                      </label>
                      <textarea
                        value={goldenSolution}
                        onChange={(e) => setGoldenSolution(e.target.value)}
                        rows={5}
                        required
                        placeholder="Nhập lời giải chuẩn xác từng bước..."
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Các bước dẫn dắt Socratic gợi mở (Mỗi dòng 1 bước):</span>
                        <span className="text-[11px] text-slate-400 font-normal">Dùng để huấn luyện AI không giải thay</span>
                      </label>
                      <textarea
                        value={socraticSteps}
                        onChange={(e) => setSocraticSteps(e.target.value)}
                        rows={3}
                        placeholder="Bước 1: ...&#10;Bước 2: ...&#10;Bước 3: ..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>{isSubmitting ? 'Đang lưu vào Knowledge Graph...' : 'Lưu Lời Giải Mẫu Chuẩn Vào Knowledge Graph'}</span>
                    </button>
                  </form>
                )}

                {/* TAB 2: Add Novel Cognitive Trap */}
                {actionTab === 'add_trap' && (
                  <form onSubmit={handleAddTrap} className="space-y-4 animate-fade">
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2">
                      <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Phát hiện Bẫy tư duy mới (Novel Trap Discovery):</strong> Nếu học sinh chọn sai do một quan niệm sai lầm mới chưa có trong hệ thống, hãy đặt tên và mô tả bẫy tư duy đó. AI sẽ ghi nhớ để tự động nhận diện và bắt lỗi cho các học sinh gặp tình huống tương tự.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">Mã Bẫy Tư Duy (Trap Code):</label>
                        <input
                          type="text"
                          value={trapCode}
                          onChange={(e) => setTrapCode(e.target.value)}
                          required
                          placeholder="VD: TRAP_ASYMPTOTE_ROOT_CANCEL"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">Phương án sai liên kết với bẫy:</label>
                        <select
                          value={trapOption}
                          onChange={(e) => setTrapOption(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="A">Phương án A</option>
                          <option value="B">Phương án B</option>
                          <option value="C">Phương án C</option>
                          <option value="D">Phương án D</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Tên Bẫy Tư Duy:</label>
                      <input
                        type="text"
                        value={trapName}
                        onChange={(e) => setTrapName(e.target.value)}
                        required
                        placeholder="VD: Quên kiểm tra nghiệm của mẫu làm triệt tiêu tử số"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Giải thích nguyên nhân sai lầm tư duy (Misconception):</label>
                      <textarea
                        value={trapExplanation}
                        onChange={(e) => setTrapExplanation(e.target.value)}
                        rows={2}
                        required
                        placeholder="Học sinh thường mắc lỗi gì khi chọn phương án này..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Câu hỏi gợi mở Socratic khi học sinh dính bẫy:</label>
                      <input
                        type="text"
                        value={trapSocraticHint}
                        onChange={(e) => setTrapSocraticHint(e.target.value)}
                        placeholder="VD: Em hãy thử thay nghiệm của mẫu vào tử số xem điều gì xảy ra..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-cyan-200" />
                      <span>{isSubmitting ? 'Đang thêm bẫy tư duy...' : 'Thêm Bẫy Tư Duy Mới Vào Knowledge Graph'}</span>
                    </button>
                  </form>
                )}

                {/* TAB 3: Verify / Dismiss */}
                {actionTab === 'verify' && (
                  <form onSubmit={handleVerifyAccurate} className="space-y-4 animate-fade">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Xác nhận AI hợp lệ:</strong> Sử dụng tùy chọn này khi câu trả lời của Gia sư AI hoàn toàn chính xác, đúng tinh thần gợi mở Socratic và phản ánh của học sinh là do hiểu nhầm.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Ghi chú thẩm định của Quản lý học thuật / Giảng viên:</label>
                      <textarea
                        value={verifyNotes}
                        onChange={(e) => setVerifyNotes(e.target.value)}
                        rows={3}
                        placeholder="Ghi nhận lý do xác nhận AI trả lời chuẩn..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>{isSubmitting ? 'Đang xác nhận...' : 'Xác Nhận AI Trả Lời Đạt Chuẩn (Đóng Phản Ánh)'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

