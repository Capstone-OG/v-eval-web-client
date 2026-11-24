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
  ArrowRight,
  RefreshCw,
  FileText,
  Check,
  X,
  MessageSquare,
  Award,
  Zap,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';
import MathText from '../common/MathText';
import FlaggedQuestionsReviewPanel from './FlaggedQuestionsReviewPanel';
import { getPendingFlagCount } from '../../utils/questionFlagStore';
import { practiceService } from '../../services/practiceService';
import { scopeInteractions } from '../../utils/aiTutorScoping';
import { toast } from '../../context/ToastContext';

const TUTOR_PROPOSALS_STORAGE_KEY = 'veval_tutor_proposals';

const getStoredProposals = () => {
  try {
    const raw = localStorage.getItem(TUTOR_PROPOSALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredProposals = (data) => {
  try {
    localStorage.setItem(TUTOR_PROPOSALS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[AiTutorModerationView] Failed to save proposals:', err);
  }
};

export default function AiTutorModerationView({ currentUser, onBackToDashboard, role = 'director' }) {
  const isTeacher = role === 'teacher';
  const isDirector = !isTeacher;

  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [pendingQuestionFlags, setPendingQuestionFlags] = useState(() => getPendingFlagCount());
  // Teachers are strictly dedicated to AI Tutor conversation review; Directors can access question flag review
  const [workspaceSection, setWorkspaceSection] = useState(() => (isTeacher ? 'ai_tutor' : (getPendingFlagCount() > 0 ? 'flagged_questions' : 'ai_tutor')));
  const [filterMode, setFilterMode] = useState('pending'); // 'pending' | 'proposals' | 'all' | 'resolved' | 'reported'
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for question flag count changes
  useEffect(() => {
    const handleFlagChange = () => {
      setPendingQuestionFlags(getPendingFlagCount());
    };
    window.addEventListener('storage', handleFlagChange);
    return () => window.removeEventListener('storage', handleFlagChange);
  }, []);

  // Teacher dynamic classes and student roster mapping
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loadingTeacherClasses, setLoadingTeacherClasses] = useState(false);
  const [classStudentsMap, setClassStudentsMap] = useState({}); // { [classId]: Set<studentId> }
  const [selectedClassFilter, setSelectedClassFilter] = useState(() => (isTeacher ? '' : 'all'));

  // Persistent proposals from Teachers (Hybrid localStorage + runtime state)
  const [proposals, setProposals] = useState(getStoredProposals);

  // Mentor Action Form States
  const [actionTab, setActionTab] = useState('override'); // 'override' | 'add_trap' | 'verify'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form: Override / Propose Golden Exemplar
  const [goldenSolution, setGoldenSolution] = useState('');
  const [socraticSteps, setSocraticSteps] = useState('');

  // Form: Add / Propose Novel Cognitive Trap
  const [trapCode, setTrapCode] = useState('');
  const [trapName, setTrapName] = useState('');
  const [trapOption, setTrapOption] = useState('B');
  const [trapExplanation, setTrapExplanation] = useState('');
  const [trapSocraticHint, setTrapSocraticHint] = useState('');

  // Form: Verify & Dismiss (Director only)
  const [verifyNotes, setVerifyNotes] = useState('');

  // Load interactions from real API
  const loadInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await practiceService.getAiTutorInteractions({ reportedOnly: false });
      const rawList = Array.isArray(data) ? data : data?.items || [];
      const storedProposals = getStoredProposals();

      const list = rawList.map((item) => {
        const sid = item.student_id ? String(item.student_id).slice(0, 6).toUpperCase() : 'HS';
        const qid = item.question_id ? String(item.question_id).slice(0, 8).toUpperCase() : '';
        const itemId = item.id || item.interaction_id || item.interactionId;
        const currentProposal = storedProposals[itemId] || null;

        return {
          id: itemId,
          student_id: item.student_id || 'unknown',
          student_name: item.student_name || item.studentName || (item.student_id ? `Học sinh ${sid}` : 'Học sinh'),
          class_name: item.class_name || item.className || 'Lớp phụ trách',
          class_id: item.class_id || item.classId || 'class_01',
          question_id: item.question_id,
          question_latex:
            item.question_latex ||
            item.core_theory_latex ||
            item.questionLatex ||
            (qid ? `Câu hỏi khảo thí #${qid}` : 'Nội dung câu hỏi khảo thí'),
          options: item.options || null,
          student_selected_option: item.student_selected_option || item.studentSelectedOption || 'Chưa chọn',
          correct_option: item.correct_option || item.correctOption || 'Chưa xác định',
          pattern_code: item.pattern_code || item.patternCode || 'PAT_DEFAULT',
          pattern_name: item.pattern_name || item.patternName || 'Chuyên đề kiến thức trọng tâm',
          matched_trap_id: item.matched_trap_id || item.matchedTrapId,
          trap_code: item.trap_code || item.trapCode || 'TRAP_LOGIC',
          trap_name: item.trap_name || item.trapName || 'Lỗ hổng tư duy học sinh',
          misconception_explanation: item.misconception_explanation || item.misconceptionExplanation || '',
          ai_guidance_transcript: Array.isArray(item.ai_guidance_transcript) ? item.ai_guidance_transcript : [],
          student_reported: Boolean(item.student_reported ?? item.studentReported),
          report_reason:
            item.report_reason ||
            item.reason ||
            (item.student_reported ? 'Học sinh báo cáo câu trả lời của trợ lý AI cần thẩm duyệt sư phạm' : ''),
          validation_status: item.validation_status || item.validationStatus || 'PASSED',
          mentor_resolution: item.mentor_resolution || item.mentorResolution || null,
          mentor_notes: item.mentor_notes || '',
          created_at: item.created_at || item.createdAt || new Date().toISOString(),
          proposal: currentProposal
        };
      });

      setInteractions(list);
    } catch (err) {
      console.warn('[AiTutorModerationView] Error loading interactions:', err?.message);
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  // 1. Fetch Dynamic Classes assigned to this Teacher
  useEffect(() => {
    if (!isTeacher) return;
    let isMounted = true;
    const fetchTeacherClasses = async () => {
      setLoadingTeacherClasses(true);
      try {
        const teacherId = currentUser?.id || currentUser?.teacherId || currentUser?.userId;
        const classes = await practiceService.getClasses({ teacherId });
        if (isMounted) {
          let formatted = (classes || []).map((c) => ({
            id: c.classId || c.id || c.class_id,
            name: c.className || c.name || c.class_name || `Lớp ${c.classId || c.id}`
          })).filter((c) => Boolean(c.id));

          // Fallback if no classes returned from API
          if (formatted.length === 0) {
            if (currentUser?.classId) {
              formatted = [{
                id: currentUser.classId,
                name: currentUser.className || 'Lớp phụ trách'
              }];
            } else if (interactions.length > 0) {
              const classMap = new Map();
              interactions.forEach((item) => {
                const cId = item.class_id || item.classId || 'class_01';
                const cName = item.class_name || item.className || 'Lớp phụ trách';
                if (!classMap.has(cId)) {
                  classMap.set(cId, { id: cId, name: cName });
                }
              });
              formatted = Array.from(classMap.values());
            } else {
              formatted = [{ id: 'class_01', name: 'Lớp Nền tảng (Foundation) 01' }];
            }
          }

          setTeacherClasses(formatted);
          if (formatted.length > 0) {
            setSelectedClassFilter((prev) => {
              const exists = formatted.some((c) => String(c.id).toLowerCase() === String(prev).toLowerCase());
              return exists ? prev : formatted[0].id;
            });
          }
        }
      } catch (err) {
        console.warn('[AiTutorModerationView] Failed to fetch teacher classes:', err?.message);
        if (isMounted) {
          const fallbackId = currentUser?.classId || 'class_01';
          const fallbackName = currentUser?.className || 'Lớp Nền tảng (Foundation) 01';
          setTeacherClasses([{ id: fallbackId, name: fallbackName }]);
          setSelectedClassFilter(fallbackId);
        }
      } finally {
        if (isMounted) setLoadingTeacherClasses(false);
      }
    };
    fetchTeacherClasses();
    return () => {
      isMounted = false;
    };
  }, [isTeacher, currentUser, interactions]);

  // 2. Fetch Class Roster (Student IDs) via Class Heatmap for Active Class
  useEffect(() => {
    if (!isTeacher || !selectedClassFilter || selectedClassFilter === 'all') return;
    if (classStudentsMap[selectedClassFilter]) return;

    let isMounted = true;
    const fetchClassRoster = async () => {
      try {
        const data = await practiceService.getClassHeatmap(selectedClassFilter);
        if (isMounted && data?.rows && Array.isArray(data.rows)) {
          const studentIds = new Set(
            data.rows.map((r) => String(r.student_id || r.studentId || '').toLowerCase()).filter(Boolean)
          );
          setClassStudentsMap((prev) => ({
            ...prev,
            [selectedClassFilter]: studentIds
          }));
        }
      } catch (err) {
        console.warn('[AiTutorModerationView] Failed to fetch class roster:', err?.message);
      }
    };
    fetchClassRoster();
    return () => {
      isMounted = false;
    };
  }, [isTeacher, selectedClassFilter, classStudentsMap]);

  // Active class object and student roster
  const selectedClassObj = useMemo(() => {
    if (!isTeacher) return null;
    return (
      teacherClasses.find((c) => String(c.id).toLowerCase() === String(selectedClassFilter).toLowerCase()) ||
      teacherClasses[0] ||
      null
    );
  }, [isTeacher, teacherClasses, selectedClassFilter]);

  const activeRosterSet = useMemo(() => {
    if (!isTeacher || !selectedClassFilter) return null;
    return classStudentsMap[selectedClassFilter] || null;
  }, [isTeacher, selectedClassFilter, classStudentsMap]);

  // Extract distinct classes for Director class filter dropdown
  const availableClasses = useMemo(() => {
    if (isTeacher) return [];
    const classSet = new Set();
    interactions.forEach((item) => {
      if (item.class_name) classSet.add(item.class_name);
    });
    return Array.from(classSet);
  }, [isTeacher, interactions]);

  // Scoped interactions based on Role, Selected Class, and Student Roster
  const scopedInteractions = useMemo(() => {
    return scopeInteractions({
      interactions,
      isTeacher,
      selectedClassId: selectedClassFilter,
      selectedClassName: selectedClassObj?.name || '',
      classStudentIds: activeRosterSet,
      teacherClasses
    });
  }, [interactions, isTeacher, selectedClassFilter, selectedClassObj, activeRosterSet, teacherClasses]);

  // Filtered interaction list based on Role, Class, Status Tab, Search
  const filteredList = useMemo(() => {
    return scopedInteractions.filter((item) => {
      const itemProposal = proposals[item.id] || item.proposal;

      // 1. Tab filter
      if (filterMode === 'pending') {
        if (item.mentor_resolution || !item.student_reported) return false;
      } else if (filterMode === 'proposals') {
        if (!itemProposal) return false;
      } else if (filterMode === 'resolved') {
        if (!item.mentor_resolution) return false;
      } else if (filterMode === 'reported') {
        if (!item.student_reported) return false;
      }

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
  }, [scopedInteractions, proposals, filterMode, searchQuery]);

  // Status counts & dynamic telemetry strictly derived from scopedInteractions
  const counts = useMemo(() => {
    const pending = scopedInteractions.filter((i) => i.student_reported && !i.mentor_resolution).length;
    const resolved = scopedInteractions.filter((i) => Boolean(i.mentor_resolution)).length;
    const reported = scopedInteractions.filter((i) => Boolean(i.student_reported)).length;
    const proposalsCount = scopedInteractions.filter((i) => Boolean(proposals[i.id] || i.proposal)).length;

    return {
      total: scopedInteractions.length,
      pending,
      resolved,
      reported,
      proposalsCount
    };
  }, [scopedInteractions, proposals]);

  // Selected item reference enriched with latest proposal
  const selectedItem = useMemo(() => {
    const found = filteredList.find((item) => item.id === selectedId) || filteredList[0] || null;
    if (!found) return null;
    return {
      ...found,
      proposal: proposals[found.id] || found.proposal || null
    };
  }, [filteredList, selectedId, proposals]);

  // Synchronize selectedId with filteredList
  useEffect(() => {
    if (filteredList.length > 0) {
      const exists = filteredList.some((item) => item.id === selectedId);
      if (!exists) {
        const firstPending = filteredList.find((i) => (i.student_reported && !i.mentor_resolution) || Boolean(proposals[i.id] || i.proposal));
        setSelectedId(firstPending ? firstPending.id : filteredList[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [filteredList, selectedId, proposals]);

  // Pre-fill action forms when selected item changes
  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.proposal && selectedItem.proposal.type === 'exemplar') {
        setGoldenSolution(selectedItem.proposal.goldenSolution || '');
        setSocraticSteps(selectedItem.proposal.socraticSteps || '');
      } else {
        setGoldenSolution(
          selectedItem.core_theory_latex ||
          (selectedItem.pattern_name ? `Lời giải chuẩn hóa chuyên môn: ${selectedItem.pattern_name}` : '')
        );
        setSocraticSteps('');
      }

      if (selectedItem.proposal && selectedItem.proposal.type === 'trap') {
        setTrapCode(selectedItem.proposal.trapCode || '');
        setTrapName(selectedItem.proposal.trapName || '');
        setTrapOption(selectedItem.proposal.trapOption || 'B');
        setTrapExplanation(selectedItem.proposal.trapExplanation || '');
        setTrapSocraticHint(selectedItem.proposal.trapSocraticHint || '');
      } else {
        setTrapCode(selectedItem.trap_code ? `${selectedItem.trap_code}_REVISED` : (selectedItem.pattern_code ? `TRAP_${selectedItem.pattern_code}` : ''));
        setTrapName(selectedItem.trap_name || '');
        setTrapOption(selectedItem.student_selected_option || 'B');
        setTrapExplanation(selectedItem.misconception_explanation || '');
        setTrapSocraticHint('');
      }
      setVerifyNotes('');
    }
  }, [selectedItem]);

  const socraticReliability = useMemo(() => {
    if (counts.total === 0) return '100.0';
    const accurateCount = counts.total - counts.pending;
    return Math.max(70, Math.min(100, (accurateCount / counts.total) * 100)).toFixed(1);
  }, [counts]);

  const exemplarsCount = useMemo(() => {
    return scopedInteractions.filter((i) => i.mentor_resolution === 'OVERRIDDEN_EXEMPLAR_SAVED').length;
  }, [scopedInteractions]);

  const trapsCount = useMemo(() => {
    return scopedInteractions.filter((i) => i.mentor_resolution === 'NEW_TRAP_ADDED' || Boolean(i.matched_trap_id)).length;
  }, [scopedInteractions]);

  // --- TEACHER ACTIONS: Gửi Đề Xuất (Chờ Director duyệt) ---
  const handleTeacherProposeExemplar = (e) => {
    e.preventDefault();
    if (!selectedItem || !goldenSolution.trim()) return;

    const newProposal = {
      type: 'exemplar',
      interactionId: selectedItem.id,
      teacherName: currentUser?.fullName || currentUser?.name || 'Giảng viên phụ trách',
      teacherId: currentUser?.id || 'teacher_current',
      goldenSolution: goldenSolution.trim(),
      socraticSteps: socraticSteps.trim(),
      proposedAt: new Date().toISOString(),
      status: 'PENDING_DIRECTOR_REVIEW'
    };

    const nextProposals = { ...proposals, [selectedItem.id]: newProposal };
    setProposals(nextProposals);
    saveStoredProposals(nextProposals);

    setInteractions((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, proposal: newProposal } : item))
    );

    toast.success('Đã gửi đề xuất Lời Giải Mẫu Chuẩn lên Giám đốc Học thuật phê duyệt!');
  };

  const handleTeacherProposeTrap = (e) => {
    e.preventDefault();
    if (!selectedItem || !trapCode.trim() || !trapName.trim()) return;

    const newProposal = {
      type: 'trap',
      interactionId: selectedItem.id,
      teacherName: currentUser?.fullName || currentUser?.name || 'Giảng viên phụ trách',
      teacherId: currentUser?.id || 'teacher_current',
      trapCode: trapCode.trim(),
      trapName: trapName.trim(),
      trapOption,
      trapExplanation: trapExplanation.trim(),
      trapSocraticHint: trapSocraticHint.trim(),
      proposedAt: new Date().toISOString(),
      status: 'PENDING_DIRECTOR_REVIEW'
    };

    const nextProposals = { ...proposals, [selectedItem.id]: newProposal };
    setProposals(nextProposals);
    saveStoredProposals(nextProposals);

    setInteractions((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, proposal: newProposal } : item))
    );

    toast.success(`Đã gửi đề xuất Bẫy tư duy (${trapCode.trim()}) lên Giám đốc Học thuật phê duyệt!`);
  };

  const handleCancelProposal = (interactionId) => {
    const nextProposals = { ...proposals };
    delete nextProposals[interactionId];
    setProposals(nextProposals);
    saveStoredProposals(nextProposals);

    setInteractions((prev) =>
      prev.map((item) => (item.id === interactionId ? { ...item, proposal: null } : item))
    );

    toast.info('Đã hủy đề xuất sư phạm.');
  };

  // --- DIRECTOR ACTIONS: Phê Duyệt Đề Xuất của Giảng viên & Can Thiệp Trực Tiếp ---
  const handleApproveProposal = async () => {
    if (!selectedItem || !selectedItem.proposal) return;
    const prop = selectedItem.proposal;

    try {
      setIsSubmitting(true);
      if (prop.type === 'exemplar') {
        const stepsList = (prop.socraticSteps || '').split('\n').filter((s) => s.trim().length > 0);
        await practiceService.overrideTutorExemplar({
          interactionId: selectedItem.id,
          archetypePatternId: selectedItem.matched_trap_id || selectedItem.id,
          questionLatex: selectedItem.question_latex,
          goldenSolution: prop.goldenSolution,
          correctOption: selectedItem.correct_option,
          explanationSteps: stepsList
        });

        setInteractions((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  proposal: null,
                  mentor_resolution: 'OVERRIDDEN_EXEMPLAR_SAVED',
                  mentor_notes: `Đã phê duyệt đề xuất từ GV ${prop.teacherName} và lưu vào Knowledge Graph.`
                }
              : item
          )
        );
      } else if (prop.type === 'trap') {
        await practiceService.addTutorNovelTrap({
          interactionId: selectedItem.id,
          archetypePatternId: selectedItem.matched_trap_id || selectedItem.id,
          trapCode: prop.trapCode,
          trapName: prop.trapName,
          wrongOption: prop.trapOption,
          misconceptionExplanation: prop.trapExplanation,
          socraticHint: prop.trapSocraticHint
        });

        setInteractions((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  proposal: null,
                  mentor_resolution: 'NEW_TRAP_ADDED',
                  trap_code: prop.trapCode,
                  trapName: prop.trapName,
                  misconception_explanation: prop.trapExplanation,
                  mentor_notes: `Đã phê duyệt bẫy tư duy từ GV ${prop.teacherName} và lưu vào Knowledge Graph.`
                }
              : item
          )
        );
      }

      // Xóa proposal sau khi đã duyệt thành công
      const nextProposals = { ...proposals };
      delete nextProposals[selectedItem.id];
      setProposals(nextProposals);
      saveStoredProposals(nextProposals);

      toast.success('Đã phê duyệt & ghi đè đề xuất của Giảng viên vào kho RAG toàn trường!');
    } catch (err) {
      toast.error('Lỗi khi phê duyệt đề xuất: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProposal = () => {
    if (!selectedItem || !selectedItem.proposal) return;
    const prop = selectedItem.proposal;

    const nextProposals = { ...proposals };
    delete nextProposals[selectedItem.id];
    setProposals(nextProposals);
    saveStoredProposals(nextProposals);

    setInteractions((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, proposal: null } : item))
    );

    toast.info(`Đã từ chối đề xuất của Giảng viên (${prop.teacherName}).`);
  };

  // Director Direct Action 1: Submit Override Golden Exemplar
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

      // Update state in-place & clear proposal if any
      const nextProposals = { ...proposals };
      delete nextProposals[selectedItem.id];
      setProposals(nextProposals);
      saveStoredProposals(nextProposals);

      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                proposal: null,
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

  // Director Direct Action 2: Submit Add Novel Cognitive Trap
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

      // Update state in-place & clear proposal if any
      const nextProposals = { ...proposals };
      delete nextProposals[selectedItem.id];
      setProposals(nextProposals);
      saveStoredProposals(nextProposals);

      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                proposal: null,
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

  // Director Direct Action 3: Verify / Mark as Accurate
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

      const nextProposals = { ...proposals };
      delete nextProposals[selectedItem.id];
      setProposals(nextProposals);
      saveStoredProposals(nextProposals);

      setInteractions(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                proposal: null,
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
    <div className="space-y-6 animate-fade w-full pb-12 font-sans">
      {/* 1. Header Hero Banner - Matching Student Portal Gradient & Card Layout */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 lg:p-8 shadow-xl border border-blue-600/30">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FACC15]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Title, Subtitle, Metric Chips & Actions */}
          <div className="space-y-4 max-w-2xl flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#FACC15] text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4 text-[#FACC15]" />
              <span>
                {isTeacher
                  ? 'Phân hệ Giảng viên • Đề xuất Sư phạm Gia sư AI'
                  : 'Phân hệ Quản trị Học thuật • Core Flow 4: Socratic AI & GraphRAG'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              {isTeacher
                ? 'Kiểm Duyệt Gia Sư AI — Lớp Phụ Trách & Đề Xuất Sư Phạm'
                : 'Trung Tâm Kiểm Duyệt Phản Hồi Gia Sư AI & Báo Cáo Học Sinh'}
            </h1>

            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {isTeacher
                ? 'Theo dõi tương tác của Gia sư AI với học sinh trong các lớp bạn giảng dạy. Đóng góp đề xuất Lời giải chuẩn hoặc Bẫy tư duy mới để Giám đốc Học thuật thẩm định & ghi đè vào kho tri thức RAG.'
                : 'Tiếp nhận các phiên trả lời bị học sinh báo cáo sai hoặc ảo giác kiến thức. Ban Chuyên môn thẩm định đề xuất từ Giảng viên hoặc trực tiếp can thiệp sư phạm vào Knowledge Graph.'}
            </p>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold pt-1">
              <span className="flex items-center gap-1.5 font-extrabold text-slate-950 bg-[#FACC15] px-3 py-1.5 rounded-xl shadow-sm">
                <Clock className="w-3.5 h-3.5 text-slate-950" />
                {isTeacher ? 'Báo cáo lớp cần xem:' : 'Chờ thẩm định:'}{' '}
                <strong className="font-black">{counts.pending} báo cáo</strong>
              </span>

              <span className="flex items-center gap-1.5 text-amber-200 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/30 font-bold">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                {isTeacher ? 'Đề xuất đã gửi:' : 'Đề xuất từ GV:'}{' '}
                <strong className="text-white font-extrabold">{counts.proposalsCount} đề xuất</strong>
              </span>

              <span className="flex items-center gap-1.5 text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Đã giải quyết: <strong className="text-white font-extrabold">{counts.resolved} phiên</strong>
              </span>

              <span className="flex items-center gap-1.5 text-slate-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                {isTeacher ? 'Phạm vi lớp:' : 'CSDL PostgreSQL:'}{' '}
                <strong className="text-white font-extrabold">{counts.total} đàm thoại</strong>
                {isTeacher && selectedClassObj?.name && (
                  <span className="text-slate-300 font-normal">({selectedClassObj.name})</span>
                )}
              </span>
            </div>

            {/* Banner Action Buttons & Teacher Class Filter */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isTeacher ? (
                teacherClasses.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                    <span className="text-xs font-bold text-[#FACC15]">Lớp phụ trách:</span>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="bg-slate-900/80 text-white border border-white/20 text-xs font-bold px-2.5 py-1 rounded-xl outline-none cursor-pointer"
                    >
                      {teacherClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                availableClasses.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                    <span className="text-xs font-bold text-[#FACC15]">Lớp:</span>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="bg-slate-900/80 text-white border border-white/20 text-xs font-bold px-2.5 py-1 rounded-xl outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả lớp ({availableClasses.length} lớp)</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={loadInteractions}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FACC15] text-slate-950 font-black text-xs hover:bg-[#eab308] transition-all shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Đồng bộ CSDL Supabase</span>
              </button>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-[#FACC15]" />
                  <span>Quay lại Tổng quan</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: GraphRAG Operational Monitor Highlight Card */}
          <div className="relative shrink-0 w-full sm:w-72 lg:w-80 group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FACC15]/30 to-cyan-400/30 blur-lg opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />

            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl space-y-3 transition-all duration-500 transform group-hover:scale-[1.02]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FACC15] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GraphRAG Monitor</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-300" />
                  Live Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-200">
                  <span>Độ tin cậy Socratic:</span>
                  <strong className="text-white font-black text-sm">{socraticReliability}%</strong>
                </div>
                <div className="w-full bg-slate-950/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FACC15] to-emerald-400 h-full rounded-full" style={{ width: `${socraticReliability}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-blue-100 pt-1">
                  <span>Knowledge Graph:</span>
                  <span className="text-[#FACC15] font-black">{exemplarsCount} Lời giải mẫu • {trapsCount} Bẫy tư duy</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/40 border border-white/10 flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Cơ chế thẩm duyệt:</span>
                <span className="text-cyan-300 font-extrabold">
                  {isTeacher ? 'Đề xuất 2 tầng' : 'Human-in-the-Loop'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Flagged Questions Review vs AI Tutor Moderation (Academic Director only) */}
      {isDirector && (
        <div className="flex items-center gap-2 flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setWorkspaceSection('flagged_questions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              workspaceSection === 'flagged_questions'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Xét Duyệt Câu Hỏi Bị Gắn Cờ</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-black ${
                workspaceSection === 'flagged_questions'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {pendingQuestionFlags} chờ duyệt
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceSection('ai_tutor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              workspaceSection === 'ai_tutor'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Kiểm Duyệt Phản Hồi Gia Sư AI ({counts.pending})</span>
          </button>
        </div>
      )}

      {isDirector && workspaceSection === 'flagged_questions' ? (
        <FlaggedQuestionsReviewPanel
          currentUser={currentUser}
          onPendingCountChange={setPendingQuestionFlags}
        />
      ) : (
      <>
      {/* 2. MetricsGrid: 4 High-End KPI Cards (Exact Student MetricsGrid Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 my-6">
        {/* CARD 1: Pending Reports */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-rose-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                {isTeacher ? 'Báo cáo lớp phụ trách' : 'Yêu cầu cần xử lý'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Cần xem xét
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{counts.pending}</span>
              <span className="text-sm font-semibold text-slate-400">/ {counts.reported} báo cáo</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Trạng thái hàng đợi:</span>
              <strong className={counts.pending > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {counts.pending > 0 ? 'Có báo cáo chờ duyệt' : 'Đã xử lý sạch'}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('pending')}
            className="w-full flex items-center justify-between text-xs font-bold text-rose-600 group-hover:text-rose-700 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Lọc danh sách chờ duyệt</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 2: Proposals (GV: Đã gửi / Director: Chờ phê duyệt) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-amber-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                {isTeacher ? 'Đề xuất của bạn' : 'Đề xuất từ Giảng viên'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" />
                {isTeacher ? 'Chờ Director duyệt' : 'Cần thẩm định'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{counts.proposalsCount}</span>
              <span className="text-sm font-semibold text-slate-400">đề xuất</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Phân loại:</span>
              <strong className="text-amber-700 font-bold">Lời giải mẫu & Bẫy tư duy</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('proposals')}
            className="w-full flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>{isTeacher ? 'Xem các đề xuất của tôi' : 'Xem đề xuất từ Giảng viên'}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 3: Resolved & Ingested into Graph */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-emerald-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Đã xử lý & Lưu Graph
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Đã lưu Graph
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{counts.resolved}</span>
              <span className="text-sm font-semibold text-slate-400">phiên hoàn tất</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>Knowledge Graph:</span>
              <strong className="text-emerald-700 font-bold">Node Exemplar & Trap</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('resolved')}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Xem lịch sử can thiệp</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 4: Total System AI Interactions Monitored */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow flex flex-col justify-between hover:border-blue-300 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                {isTeacher ? 'Giám sát lớp mình' : 'Giám sát hệ thống'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1">
                <Bot className="w-3 h-3 text-blue-600" />
                {isTeacher ? 'Lớp Phụ Trách' : 'Supabase Pooler'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{counts.total}</span>
              <span className="text-sm font-semibold text-slate-400">phiên đàm thoại</span>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
              <span>CSDL đàm thoại:</span>
              <strong className="text-blue-700 font-bold">ai_tutor_interaction_logs</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="w-full flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Xem toàn bộ đàm thoại</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Split Pane (Left: Interaction Queue, Right: Inspector & Workbench) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Filter Tabs, Search & Interaction Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 card-shadow space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Hàng Đợi Kiểm Duyệt & Đối Soát
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {filteredList.length} phiên
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'pending'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Chờ xử lý</span>
                {counts.pending > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'pending' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'}`}>
                    {counts.pending}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('proposals')}
                className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'proposals'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{isTeacher ? 'Đề xuất GV' : 'Đề xuất GV'}</span>
                {counts.proposalsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'proposals' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-700'}`}>
                    {counts.proposalsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('reported')}
                className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'reported'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Báo cáo</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'reported' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {counts.reported}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('resolved')}
                className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterMode === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Đã xử lý</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'resolved' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {counts.resolved}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 min-w-[60px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interaction List */}
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p className="font-extrabold text-slate-700">
                    {isTeacher
                      ? `Không có báo cáo nào trong ${selectedClassObj?.name || 'lớp này'}`
                      : 'Không có phản hồi nào trong danh sách'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isTeacher
                      ? 'Học sinh lớp bạn đang tương tác tốt với Gia sư AI hoặc các báo cáo đã được giải quyết.'
                      : 'Các báo cáo đã được giải quyết hoặc không khớp với bộ lọc hiện tại.'}
                  </p>
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected = item.id === selectedId;
                  const itemProposal = proposals[item.id] || item.proposal;
                  const isPending = item.student_reported && !item.mentor_resolution;
                  const isResolved = Boolean(item.mentor_resolution);

                  // Border accent color
                  let borderAccent = 'border-l-4 border-l-slate-300';
                  if (itemProposal) borderAccent = 'border-l-4 border-l-amber-500';
                  else if (isPending) borderAccent = 'border-l-4 border-l-rose-500';
                  else if (isResolved) borderAccent = 'border-l-4 border-l-emerald-500';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${borderAccent} ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-300 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Student Avatar, Name, Class & Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${
                            itemProposal
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isPending
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isResolved
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            {item.student_name ? item.student_name.slice(-2).toUpperCase() : 'HS'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.student_name}</h4>
                            <p className="text-[10px] font-medium text-slate-500 truncate">{item.class_name}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 text-right">
                          {itemProposal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              <Award className="w-2.5 h-2.5 text-amber-600" />
                              <span>{isTeacher ? 'Đề xuất của bạn' : 'Đề xuất GV'}</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                              <Flag className="w-2.5 h-2.5" />
                              <span>Cần xử lý</span>
                            </span>
                          ) : isResolved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" />
                              <span>Đã xử lý</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Bình thường</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Preview Snippet */}
                      <div className="text-xs text-slate-700 line-clamp-2 font-medium bg-slate-50/80 p-2.5 rounded-xl mb-2.5 border border-slate-100">
                        <MathText text={item.question_latex} />
                      </div>

                      {/* Pattern & Trap Tag */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 truncate max-w-[210px]">
                          {item.pattern_name}
                        </span>
                        {item.trap_code && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200 truncate max-w-[140px]">
                            {item.trap_code}
                          </span>
                        )}
                        {itemProposal && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            {itemProposal.type === 'exemplar' ? '💡 Đề xuất lời giải' : '⚡ Đề xuất bẫy tư duy'}
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
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 card-shadow text-slate-400 space-y-3">
              <Bot className="w-12 h-12 mx-auto text-blue-400 opacity-60" />
              <p className="font-extrabold text-slate-700 text-sm">Vui lòng chọn một phiên tương tác bên trái để xem chi tiết</p>
              <p className="text-xs text-slate-400">Hệ thống sẽ hiển thị toàn bộ đề bài, đáp án đối soát, nhật ký đối thoại và bàn làm việc can thiệp sư phạm.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Inspection Card Container */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 card-shadow space-y-5">
                {/* Header: Code, Badges & Student Metadata */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black font-mono">
                        {selectedItem.pattern_code}
                      </span>
                      {selectedItem.student_reported && (
                        <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                          <Flag className="w-3.5 h-3.5 text-rose-600" />
                          <span>Học sinh báo cáo lỗi</span>
                        </span>
                      )}
                      {selectedItem.mentor_resolution && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{selectedItem.mentor_resolution}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {selectedItem.pattern_name}
                    </h3>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <div className="font-black text-slate-900 text-sm">{selectedItem.student_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(selectedItem.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* Student Report Reason Highlight Box */}
                {selectedItem.student_reported && (
                  <div className="p-4 bg-rose-50/80 border-2 border-rose-200 rounded-2xl space-y-1.5 animate-fade">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Ý kiến phản ánh từ học sinh:</span>
                    </div>
                    <p className="text-xs text-rose-900 font-semibold leading-relaxed pl-6">
                      "{selectedItem.report_reason}"
                    </p>
                  </div>
                )}

                {/* Section: Proposal Callout (Director Approval / Teacher Pending Notice) */}
                {selectedItem.proposal && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/80 border-2 border-amber-300 shadow-sm space-y-3.5 animate-fade">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-amber-200">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                            {isDirector ? 'Đề Xuất Cải Tiến Sư Phạm Từ Giảng Viên' : 'Đề Xuất Của Bạn Đang Chờ Duyệt'}
                          </h4>
                          <span className="text-[11px] text-amber-800 font-medium">
                            Giảng viên: <strong>{selectedItem.proposal.teacherName}</strong> • Gửi lúc{' '}
                            {new Date(selectedItem.proposal.proposedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                        ⏳ Chờ Giám đốc phê duyệt
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-amber-950">
                      <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Loại đề xuất: </span>
                        <strong className="text-amber-950 underline">
                          {selectedItem.proposal.type === 'exemplar'
                            ? 'Lời Giải Mẫu Chuẩn & Tư Duy Socratic'
                            : `Bẫy Tư Duy Mới (${selectedItem.proposal.trapCode})`}
                        </strong>
                      </div>

                      {selectedItem.proposal.type === 'exemplar' ? (
                        <div className="space-y-1.5 pl-3 border-l-2 border-amber-300">
                          <div>
                            <span className="font-bold text-slate-700">Lời giải đề xuất:</span>
                            <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 mt-1 font-mono text-[11px] text-slate-800">
                              <MathText text={selectedItem.proposal.goldenSolution} />
                            </div>
                          </div>
                          {selectedItem.proposal.socraticSteps && (
                            <div>
                              <span className="font-bold text-slate-700">Các bước gợi mở Socratic:</span>
                              <pre className="p-2.5 bg-white/90 rounded-xl border border-amber-200 mt-1 text-[11px] text-slate-800 whitespace-pre-wrap font-sans">
                                {selectedItem.proposal.socraticSteps}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5 pl-3 border-l-2 border-amber-300 text-xs">
                          <div><strong>Tên bẫy:</strong> {selectedItem.proposal.trapName} (Phương án {selectedItem.proposal.trapOption})</div>
                          <div><strong>Giải thích sai lầm:</strong> {selectedItem.proposal.trapExplanation}</div>
                          {selectedItem.proposal.trapSocraticHint && (
                            <div><strong>Gợi ý phản tư:</strong> {selectedItem.proposal.trapSocraticHint}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons on Proposal */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-200">
                      {isDirector ? (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleApproveProposal}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Phê Duyệt & Ghi Đè Vào Kho RAG Toàn Trường</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleRejectProposal}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Từ Chối Đề Xuất</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] text-amber-800 italic">
                            Đề xuất của bạn đã được chuyển tới hàng đợi thẩm định của Giám đốc Học thuật.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancelProposal(selectedItem.id)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-amber-300 text-rose-700 text-xs font-bold cursor-pointer"
                          >
                            Hủy đề xuất
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section: Question Context & Answer Truth Comparison */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Nội dung Câu Hỏi & Đối Soát Đáp Án (Ground Truth)</span>
                  </h4>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 leading-relaxed">
                    <MathText text={selectedItem.question_latex} />
                  </div>

                  {/* Options Grid or Answer Summary */}
                  {selectedItem.options && Object.keys(selectedItem.options).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedItem.options).map(([optKey, optVal]) => {
                        const isCorrect = optKey === selectedItem.correct_option;
                        const isStudentSelected = optKey === selectedItem.student_selected_option;
                        const optionText = typeof optVal === 'string' ? optVal : `Phương án ${optKey}`;

                        let borderClass = 'border-slate-200 bg-white text-slate-800';
                        if (isCorrect) borderClass = 'border-emerald-300 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                        if (isStudentSelected && !isCorrect) borderClass = 'border-rose-300 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-500/20';

                        return (
                          <div
                            key={optKey}
                            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${borderClass}`}
                          >
                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 shadow-xs ${
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
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-black">
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
                  ) : (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Học sinh chọn:</span>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-200 font-black text-slate-800">
                          {selectedItem.student_selected_option || 'Chưa chọn'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Đáp án chuẩn:</span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-black">
                          {selectedItem.correct_option || 'Chưa xác định'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Identified Cognitive Trap Tag */}
                  {selectedItem.trap_name && (
                    <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-amber-900">Bẫy tư duy được gắn mã ({selectedItem.trap_code}): </span>
                        <span className="font-bold text-amber-800">{selectedItem.trap_name}. </span>
                        <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">{selectedItem.misconception_explanation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Socratic Dialogue Chat Reconstruction */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Nhật Ký Đàm Thoại Giữa Học Sinh & Gia Sư AI Socratic</span>
                  </h4>

                  <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 max-h-80 overflow-y-auto">
                    {(selectedItem.ai_guidance_transcript || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">Chưa có dữ liệu đoạn chat chi tiết.</p>
                    ) : (
                      selectedItem.ai_guidance_transcript.map((msg, mIdx) => {
                        const isAI = msg.role === 'tutor' || msg.role === 'ai';
                        return (
                          <div key={mIdx} className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                            {isAI && (
                              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium max-w-[85%] leading-relaxed ${
                              isAI
                                ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                                : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-tr-none shadow-2xs'
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

              {/* 4. Pedagogical Action Workbench (Phân tầng: Teacher Propose vs Director Graph Overwrite) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200 card-shadow space-y-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {isTeacher
                        ? 'Bàn Làm Việc Đề Xuất Sư Phạm (Chờ Director duyệt)'
                        : 'Bàn Làm Việc Thẩm Định & Can Thiệp Sư Phạm (Human-in-the-Loop)'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    {isTeacher ? 'Đề xuất nâng cấp RAG' : 'GraphRAG Knowledge Update'}
                  </span>
                </div>

                {/* Sub Action Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setActionTab('override')}
                    className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      actionTab === 'override'
                        ? 'bg-white text-indigo-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{isTeacher ? '1. Đề Xuất Lời Giải Chuẩn' : '1. Ghi đè Lời Giải Mẫu Chuẩn'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionTab('add_trap')}
                    className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      actionTab === 'add_trap'
                        ? 'bg-white text-indigo-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>{isTeacher ? '2. Đề Xuất Bẫy Tư Duy' : '2. Bổ sung Bẫy Tư Duy Mới'}</span>
                  </button>

                  {!isTeacher && (
                    <button
                      type="button"
                      onClick={() => setActionTab('verify')}
                      className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        actionTab === 'verify'
                          ? 'bg-white text-emerald-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>3. Xác Nhận AI Đúng & Đóng Báo Cáo</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: Override / Propose Golden Exemplar */}
                {actionTab === 'override' && (
                  <form
                    onSubmit={isTeacher ? handleTeacherProposeExemplar : handleOverrideExemplar}
                    className="space-y-4 animate-fade"
                  >
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mục tiêu:</strong>{' '}
                        {isTeacher
                          ? 'Soạn thảo lời giải chuẩn và các bước tư duy gợi mở Socratic gửi lên Giám đốc Học thuật thẩm duyệt trước khi ghi đè vào Knowledge Graph toàn trường.'
                          : 'Soạn thảo lời giải chuẩn và các bước tư duy gợi mở Socratic. Hệ thống sẽ lưu trực tiếp vào node PatternExemplar trong Knowledge Graph làm dữ liệu mẫu (few-shot) tối ưu cho các lần đàm thoại tiếp theo.'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lời giải mẫu chuẩn (Hỗ trợ định dạng LaTeX KaTeX $...$):</span>
                      </label>
                      <textarea
                        rows={4}
                        value={goldenSolution}
                        onChange={(e) => setGoldenSolution(e.target.value)}
                        placeholder="Nhập lời giải mẫu chuẩn của giảng viên..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Các bước tư duy gợi mở Socratic (Mỗi dòng là một bước gợi ý):</span>
                      </label>
                      <textarea
                        rows={3}
                        value={socraticSteps}
                        onChange={(e) => setSocraticSteps(e.target.value)}
                        placeholder="Bước 1: Nhắc lại định nghĩa...&#10;Bước 2: Hướng dẫn đặt ẩn phụ...&#10;Bước 3: Đặt câu hỏi phản tư..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !goldenSolution.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-[#FACC15] hover:bg-[#eab308] text-slate-950 text-xs font-black rounded-2xl shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Award className="w-4 h-4 text-slate-950" />
                        <span>
                          {isSubmitting
                            ? 'Đang xử lý...'
                            : isTeacher
                            ? 'Gửi Đề Xuất Lời Giải Cho Giám Đốc Duyệt'
                            : 'Ghi Đè Lời Giải Mẫu Chuẩn Vào Graph'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: Add / Propose Novel Cognitive Trap */}
                {actionTab === 'add_trap' && (
                  <form
                    onSubmit={isTeacher ? handleTeacherProposeTrap : handleAddTrap}
                    className="space-y-4 animate-fade"
                  >
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mục tiêu:</strong>{' '}
                        {isTeacher
                          ? 'Đề xuất gắn nhãn một bẫy tư duy mới phát hiện từ phản ánh của học sinh lớp bạn để Giám đốc Học thuật thẩm định & bổ sung vào Knowledge Graph.'
                          : 'Gắn nhãn một bẫy tư duy mới phát hiện từ phản ánh của học sinh, lưu vào node PatternTrap trong Knowledge Graph để RAG tự động nhận diện sai lầm này ở các học sinh khác.'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800">Mã bẫy tư duy (Trap Code):</label>
                        <input
                          type="text"
                          value={trapCode}
                          onChange={(e) => setTrapCode(e.target.value)}
                          placeholder="TRAP_ASYMPTOTE_ROOT_CANCEL"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-800">Gắn với phương án sai:</label>
                        <select
                          value={trapOption}
                          onChange={(e) => setTrapOption(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <option key={opt} value={opt}>Phương án {opt} {opt === selectedItem.student_selected_option ? '(Học sinh chọn)' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800">Tên bẫy nhận thức:</label>
                      <input
                        type="text"
                        value={trapName}
                        onChange={(e) => setTrapName(e.target.value)}
                        placeholder="Quên kiểm tra nghiệm triệt tiêu tử số..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800">Giải thích nguyên nhân sai lầm tư duy:</label>
                      <textarea
                        rows={2}
                        value={trapExplanation}
                        onChange={(e) => setTrapExplanation(e.target.value)}
                        placeholder="Học sinh ngộ nhận rằng chỉ cần mẫu số có 2 nghiệm..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800">Câu hỏi gợi mở Socratic phản tư (Socratic Hint):</label>
                      <input
                        type="text"
                        value={trapSocraticHint}
                        onChange={(e) => setTrapSocraticHint(e.target.value)}
                        placeholder="Em hãy thử thay nghiệm của mẫu vào tử xem có bị rút gọn không?"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !trapCode.trim() || !trapName.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-[#FACC15] hover:bg-[#eab308] text-slate-950 text-xs font-black rounded-2xl shadow-xl shadow-yellow-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4 text-slate-950" />
                        <span>
                          {isSubmitting
                            ? 'Đang xử lý...'
                            : isTeacher
                            ? 'Gửi Đề Xuất Bẫy Cho Giám Đốc Duyệt'
                            : 'Bổ Sung Bẫy Tư Duy Mới Vào Graph'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: Verify & Dismiss (Director Only) */}
                {actionTab === 'verify' && !isTeacher && (
                  <form onSubmit={handleVerifyAccurate} className="space-y-4 animate-fade">
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Mục tiêu:</strong> Xác nhận câu trả lời của AI Tutor là hoàn toàn chuẩn xác và đúng phương pháp sư phạm gợi mở Socratic. Báo cáo của học sinh xuất phát từ hiểu nhầm hoặc cố tình muốn AI giải hộ trực tiếp.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-800">Ghi chú thẩm định của Quản lý học thuật:</label>
                      <textarea
                        rows={3}
                        value={verifyNotes}
                        onChange={(e) => setVerifyNotes(e.target.value)}
                        placeholder="Ghi chú: Lời giải của AI chuẩn Socratic, không lộ đáp án, học sinh hiểu nhầm quy tắc tiệm cận..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSubmitting ? 'Đang cập nhật...' : 'Xác Nhận AI Đạt Chuẩn & Đóng Báo Cáo'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
