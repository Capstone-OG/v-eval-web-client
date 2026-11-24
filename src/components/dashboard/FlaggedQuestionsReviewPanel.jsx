import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Flag,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  Edit3,
  Save,
  Sparkles
} from 'lucide-react';
import MathText from '../common/MathText';
import CurriculumStudioEditor from '../curriculum/CurriculumStudioEditor';
import apiClient from '../../services/apiClient';
import contentService from '../../services/contentService';
import {
  getFlaggedQuestions,
  resolveFlaggedQuestion
} from '../../utils/questionFlagStore';
import { toast } from '../../context/ToastContext';

const hasKatexSyntax = (text = '') =>
  /\$[^$]+\$|\\\(|\\\[|\\(frac|sqrt|sum|int|lim|pm|times|cdot|leq|geq|neq|approx|infty|alpha|beta|gamma|delta|theta|pi|vec|overline|overrightarrow|Leftarrow|Rightarrow|Leftrightarrow|begin\{)/i.test(
    String(text || '')
  );

export default function FlaggedQuestionsReviewPanel({ currentUser, onPendingCountChange }) {
  const [flags, setFlags] = useState(() => getFlaggedQuestions());
  const [loadingDb, setLoadingDb] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'RESOLVED' | 'ALL'
  const [searchText, setSearchText] = useState('');
  const [skillCatalog, setSkillCatalog] = useState([]);
  const [targetSkillByFlag, setTargetSkillByFlag] = useState({});
  const [skillFilterByFlag, setSkillFilterByFlag] = useState({});
  const [busyFlagId, setBusyFlagId] = useState('');
  const [fullStudioFlag, setFullStudioFlag] = useState(null);
  const [studioFlag, setStudioFlag] = useState(null);
  const [studioForm, setStudioForm] = useState({
    contentLatex: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    difficultyLevel: 2,
    explanation: ''
  });
  const [savingStudio, setSavingStudio] = useState(false);

  const quickEditHasKatex = useMemo(
    () =>
      [
        studioForm.contentLatex,
        studioForm.optionA,
        studioForm.optionB,
        studioForm.optionC,
        studioForm.optionD,
        studioForm.explanation
      ].some((part) => hasKatexSyntax(part)),
    [studioForm]
  );

  const reviewerName = currentUser?.fullName || currentUser?.email || 'Giảng viên / Quản lý';

  const loadMergedFlags = useCallback(async () => {
    setLoadingDb(true);
    const localList = getFlaggedQuestions();
    try {
      const res = await apiClient.get('/api/content/questions/flagged');
      const dbList = Array.isArray(res?.data) ? res.data : [];
      // Khi DB trả về danh sách PENDING chuẩn, chỉ giữ lại các mục ĐÃ XỬ LÝ từ local (tránh kẹt log cũ của câu đã xóa khỏi DB)
      const localResolvedOnly = localList.filter((l) => l.status !== 'PENDING');
      setFlags([...dbList, ...localResolvedOnly]);
    } catch {
      setFlags(localList);
    } finally {
      setLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    void loadMergedFlags();
    const sync = () => { void loadMergedFlags(); };
    window.addEventListener('veval:question-flags-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('veval:question-flags-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [loadMergedFlags]);

  useEffect(() => {
    let mounted = true;
    contentService
      .getCurriculum()
      .then((res) => {
        if (!mounted) return;
        const domains = Array.isArray(res) ? res : (res?.domains || res?.data || []);
        const list = [];
        const seen = new Set();
        domains.forEach((dom) => {
          const domTitle = dom.title || dom.name || '';
          (dom.chapters || []).forEach((ch) => {
            (ch.lessons || []).forEach((les) => {
              (les.patterns || []).forEach((pat) => {
                const sid = String(pat.patternId || pat.skillId || pat.id || '');
                if (!sid || seen.has(sid)) return;
                seen.add(sid);
                list.push({
                  skillId: sid,
                  label: `${domTitle} › ${les.name || ch.name || ''} › ${pat.name || ''}`
                });
              });
            });
          });
        });
        setSkillCatalog(list);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (statusFilter === 'PENDING' && f.status !== 'PENDING') return false;
      if (statusFilter === 'RESOLVED' && f.status === 'PENDING') return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const hay = `${f.questionContent} ${f.skillName} ${f.subjectName} ${f.reasonLabel} ${f.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [flags, statusFilter, searchText]);

  const pendingCount = flags.filter((f) => f.status === 'PENDING').length;

  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);

  const openStudioEditor = (flag) => {
    const opts = flag.options || [];
    setStudioFlag(flag);
    setStudioForm({
      contentLatex: flag.questionContent || '',
      optionA: opts[0] || '',
      optionB: opts[1] || '',
      optionC: opts[2] || '',
      optionD: opts[3] || '',
      correctOption: ['A', 'B', 'C', 'D'].includes(String(flag.correctOption || '').toUpperCase())
        ? String(flag.correctOption).toUpperCase()
        : 'A',
      difficultyLevel: Number(flag.difficultyLevel || 2),
      explanation: flag.explanation || ''
    });
  };

  const handleSaveFullStudio = async (updated) => {
    if (!fullStudioFlag || !updated) {
      setFullStudioFlag(null);
      return;
    }
    const sq = updated.sampleQuestion || {};
    const opts = fullStudioFlag.options || [];
    const bloomFromLevel = (() => {
      const m = String(updated.level || '').match(/L([1-6])/i);
      return m ? Number(m[1]) : null;
    })();
    const nextContent = (updated.theoryRecap !== undefined ? updated.theoryRecap : fullStudioFlag.questionContent || '').trim();
    const nextExplanation = (updated.solutionMethod !== undefined ? updated.solutionMethod : fullStudioFlag.explanation || '').trim();
    const nextOptionA = String(sq.optionA !== undefined ? sq.optionA : opts[0] || '').trim();
    const nextOptionB = String(sq.optionB !== undefined ? sq.optionB : opts[1] || '').trim();
    const nextOptionC = String(sq.optionC !== undefined ? sq.optionC : opts[2] || '').trim();
    const nextOptionD = String(sq.optionD !== undefined ? sq.optionD : opts[3] || '').trim();
    const nextCorrect = ['A', 'B', 'C', 'D'].includes(String(sq.correctOption || fullStudioFlag.correctOption || 'A').toUpperCase())
      ? String(sq.correctOption || fullStudioFlag.correctOption || 'A').toUpperCase()
      : 'A';

    setSavingStudio(true);
    try {
      const targetSkillId = targetSkillByFlag[fullStudioFlag.flagId] || fullStudioFlag.skillId;
      await contentService.updateQuestion(fullStudioFlag.questionId, {
        skillId: targetSkillId,
        passageId: null,
        difficultyLevel: bloomFromLevel || Number(sq.difficultyLevel || fullStudioFlag.difficultyLevel || 2),
        contentLatex: nextContent,
        optionA: nextOptionA,
        optionB: nextOptionB,
        optionC: nextOptionC,
        optionD: nextOptionD,
        correctOption: nextCorrect,
        explanation: nextExplanation
      });
      await apiClient.post(`/api/content/questions/${encodeURIComponent(fullStudioFlag.questionId)}/unflag`, {}).catch(() => {});
      resolveFlaggedQuestion(fullStudioFlag.flagId, {
        questionId: fullStudioFlag.questionId,
        status: 'KEPT',
        resolutionNote: 'Đã chỉnh sửa bằng Full Studio và mở khóa trên CSDL.',
        resolvedBy: reviewerName
      });
      setFullStudioFlag(null);
      await loadMergedFlags();
      toast.success('Đã lưu chỉnh sửa từ Full Studio lên CSDL và mở khóa câu hỏi!');
    } catch (err) {
      toast.error('Không thể lưu chỉnh sửa câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingStudio(false);
    }
  };

  const openFullStudioFromQuickEdit = () => {
    if (!studioFlag) return;
    const mergedFlag = {
      ...studioFlag,
      questionContent: studioForm.contentLatex,
      options: [studioForm.optionA, studioForm.optionB, studioForm.optionC, studioForm.optionD],
      correctOption: studioForm.correctOption,
      difficultyLevel: studioForm.difficultyLevel,
      explanation: studioForm.explanation
    };
    setStudioFlag(null);
    setFullStudioFlag(mergedFlag);
  };

  const handleSaveStudioEdit = async () => {
    if (!studioFlag) return;
    if (!studioForm.contentLatex.trim() || !studioForm.optionA.trim() || !studioForm.optionB.trim() || !studioForm.optionC.trim() || !studioForm.optionD.trim()) {
      toast.warning('Vui lòng nhập đầy đủ nội dung câu hỏi và cả 4 đáp án A, B, C, D.');
      return;
    }
    setSavingStudio(true);
    try {
      const targetSkillId = targetSkillByFlag[studioFlag.flagId] || studioFlag.skillId;
      await contentService.updateQuestion(studioFlag.questionId, {
        skillId: targetSkillId,
        passageId: null,
        difficultyLevel: Number(studioForm.difficultyLevel || 2),
        contentLatex: studioForm.contentLatex.trim(),
        optionA: studioForm.optionA.trim(),
        optionB: studioForm.optionB.trim(),
        optionC: studioForm.optionC.trim(),
        optionD: studioForm.optionD.trim(),
        correctOption: studioForm.correctOption,
        explanation: studioForm.explanation.trim()
      });
      await apiClient.post(`/api/content/questions/${encodeURIComponent(studioFlag.questionId)}/unflag`, {}).catch(() => {});
      resolveFlaggedQuestion(studioFlag.flagId, {
        questionId: studioFlag.questionId,
        status: 'KEPT',
        resolutionNote: 'Đã chỉnh sửa nội dung câu hỏi bằng Studio và mở khóa trên CSDL.',
        resolvedBy: reviewerName
      });
      setStudioFlag(null);
      await loadMergedFlags();
      toast.success('Đã lưu chỉnh sửa câu hỏi lên CSDL và mở khóa trở lại!');
    } catch (err) {
      toast.error('Không thể lưu chỉnh sửa câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingStudio(false);
    }
  };

  const handleReassignDomain = async (flag) => {
    const newSkillId = targetSkillByFlag[flag.flagId];
    if (!newSkillId) {
      toast.warning('Vui lòng chọn đúng miền / dạng bài mới trước khi chuyển.');
      return;
    }
    const targetObj = skillCatalog.find((s) => s.skillId === newSkillId);
    setBusyFlagId(flag.flagId);
    try {
      const opts = flag.options || [];
      await contentService.updateQuestion(flag.questionId, {
        skillId: newSkillId,
        passageId: null,
        difficultyLevel: flag.difficultyLevel || 2,
        contentLatex: flag.questionContent,
        optionA: opts[0] || '',
        optionB: opts[1] || '',
        optionC: opts[2] || '',
        optionD: opts[3] || '',
        correctOption: flag.correctOption || 'A',
        explanation: flag.explanation || ''
      });
      await apiClient.post(`/api/content/questions/${encodeURIComponent(flag.questionId)}/unflag`, {}).catch(() => {});
      resolveFlaggedQuestion(flag.flagId, {
        questionId: flag.questionId,
        status: 'REASSIGNED',
        newSkillName: targetObj?.label || newSkillId,
        resolvedBy: reviewerName
      });
      await loadMergedFlags();
      toast.success('Đã chuyển câu hỏi sang đúng chuyên đề và mở khóa trở lại trên CSDL!');
    } catch (err) {
      toast.error('Không thể cập nhật câu hỏi trên CSDL: ' + (err?.response?.data?.message || err.message));
    } finally {
      setBusyFlagId('');
    }
  };

  const handleDeleteFlaggedQuestion = async (flag) => {
    if (!window.confirm('Xóa vĩnh viễn câu hỏi này khỏi ngân hàng câu hỏi CSDL?')) return;
    setBusyFlagId(flag.flagId);
    try {
      await contentService.deleteQuestion(flag.questionId);
      resolveFlaggedQuestion(flag.flagId, {
        questionId: flag.questionId,
        status: 'DELETED',
        resolutionNote: 'Đã xóa câu hỏi lỗi khỏi ngân hàng CSDL',
        resolvedBy: reviewerName
      });
      await loadMergedFlags();
      toast.success('Đã xóa câu hỏi khỏi ngân hàng đề CSDL!');
    } catch (err) {
      const errMsg = String(err?.response?.data?.message || err?.message || '');
      if (err?.status === 404 || err?.response?.status === 404 || errMsg.toLowerCase().includes('không tìm thấy')) {
        resolveFlaggedQuestion(flag.flagId, {
          questionId: flag.questionId,
          status: 'DELETED',
          resolutionNote: 'Câu hỏi đã được xóa khỏi CSDL trước đó',
          resolvedBy: reviewerName
        });
        await loadMergedFlags();
        toast.info('Câu hỏi này đã bị xóa khỏi CSDL trước đó — đã dọn sạch khỏi hàng chờ.');
      } else {
        toast.error('Lỗi khi xóa câu hỏi: ' + errMsg);
      }
    } finally {
      setBusyFlagId('');
    }
  };

  const handleKeepQuestion = async (flag) => {
    setBusyFlagId(flag.flagId);
    try {
      await apiClient.post(`/api/content/questions/${encodeURIComponent(flag.questionId)}/unflag`, {}).catch(() => {});
      resolveFlaggedQuestion(flag.flagId, {
        questionId: flag.questionId,
        status: 'KEPT',
        resolutionNote: 'Đã thẩm định — Câu hỏi đúng miền và đạt chuẩn.',
        resolvedBy: reviewerName
      });
      await loadMergedFlags();
      toast.success('Đã mở khóa câu hỏi trên CSDL và đóng cờ báo lỗi.');
    } finally {
      setBusyFlagId('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'PENDING', label: `Chờ xét duyệt (${pendingCount})` },
            { id: 'RESOLVED', label: `Đã xử lý (${flags.length - pendingCount})` },
            { id: 'ALL', label: `Tất cả (${flags.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                statusFilter === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, môn, lý do..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* List */}
      {filteredFlags.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <Flag className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-black text-slate-700">
            {statusFilter === 'PENDING'
              ? 'Không có câu hỏi nào đang chờ xét duyệt'
              : 'Chưa có lịch sử báo lỗi câu hỏi nào'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi học sinh bấm <strong>Báo lỗi &amp; Đổi câu</strong> trong Lộ trình PLAR, Luyện tập ZPD hoặc Phòng Thi thử V-ACT, câu hỏi sẽ xuất hiện ngay tại đây để Giảng viên &amp; Ban quản lý xét duyệt.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlags.map((flag) => {
            const isBusy = busyFlagId === flag.flagId;
            const searchSkill = (skillFilterByFlag[flag.flagId] || '').toLowerCase().trim();
            const matchingSkills = searchSkill
              ? skillCatalog.filter((s) => s.label.toLowerCase().includes(searchSkill)).slice(0, 40)
              : skillCatalog.slice(0, 40);

            return (
              <div
                key={flag.flagId}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Meta header */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black inline-flex items-center gap-1 ${
                        flag.status === 'PENDING'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {flag.status === 'PENDING' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>
                        {flag.status === 'PENDING'
                          ? 'Chờ xét duyệt'
                          : flag.status === 'REASSIGNED'
                            ? 'Đã chuyển đúng miền'
                            : flag.status === 'DELETED'
                              ? 'Đã xóa khỏi CSDL'
                              : 'Đã xác nhận đúng miền'}
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                      Lý do: {flag.reasonLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                      Miền hiện tại: {flag.subjectName} › {flag.skillName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(flag.reportedAt).toLocaleString('vi-VN')} • {flag.sourcePage}
                  </span>
                </div>

                {flag.note && (
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950">
                    <strong>Ghi chú của học sinh:</strong> {flag.note}
                  </div>
                )}

                {/* Question Content */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-sm font-bold text-slate-900 leading-relaxed">
                    <MathText text={flag.questionContent} />
                  </div>
                  {flag.options?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {flag.options.map((opt, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][idx];
                        const isCorr = letter === flag.correctOption;
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border flex items-start gap-2 ${
                              isCorr ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-black">{letter}.</span>
                            <div className="flex-1 min-w-0 break-words"><MathText text={opt} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                {flag.status === 'PENDING' ? (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Xét duyệt &amp; Điều chuyển Miền Kiến Thức (Cập nhật trực tiếp CSDL Supabase)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        value={skillFilterByFlag[flag.flagId] || ''}
                        onChange={(e) =>
                          setSkillFilterByFlag((prev) => ({ ...prev, [flag.flagId]: e.target.value }))
                        }
                        placeholder="Lọc nhanh tên môn / bài / dạng bài..."
                        className="md:col-span-4 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-400"
                      />
                      <select
                        value={targetSkillByFlag[flag.flagId] || ''}
                        onChange={(e) =>
                          setTargetSkillByFlag((prev) => ({ ...prev, [flag.flagId]: e.target.value }))
                        }
                        className="md:col-span-8 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-blue-400"
                      >
                        <option value="">-- Chọn đúng Miền / Dạng bài mới để chuyển --</option>
                        {matchingSkills.map((sk) => (
                          <option key={sk.skillId} value={sk.skillId}>
                            {sk.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setFullStudioFlag(flag)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sửa câu hỏi (Full Studio)</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReassignDomain(flag)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                          <span>Chuyển Đúng Miền</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleKeepQuestion(flag)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Giữ Nguyên (Đúng Miền)</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteFlaggedQuestion(flag)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Câu Khỏi Ngân Hàng</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
                    <strong>Kết quả xử lý ({flag.resolvedBy}):</strong> {flag.resolutionNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* MUI Quick-Edit Dialog (sửa nhanh đáp án / text cơ bản, cảnh báo KaTeX -> vào thẳng Full Studio) */}
      <Dialog
        open={Boolean(studioFlag)}
        onClose={() => !savingStudio && setStudioFlag(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Sửa Nhanh Câu Hỏi (Đổi đáp án &amp; nội dung cơ bản)
          {studioFlag?.skillName && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
              Chuyên đề: {studioFlag.subjectName} › {studioFlag.skillName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {quickEditHasKatex && (
            <Alert
              severity="warning"
              sx={{ mb: 2, borderRadius: '10px', alignItems: 'center' }}
              action={
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={openFullStudioFromQuickEdit}
                  sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
                >
                  Vào thẳng Full Studio
                </Button>
              }
            >
              Câu hỏi có chứa công thức toán học (KaTeX). Nếu cần chỉnh sửa công thức, ký hiệu đặc biệt hoặc đồ thị, vui lòng vào thẳng <strong>Full Studio</strong> để tránh lỗi hiển thị!
            </Alert>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: 2.5 }}>
            {/* Cột trái: Form biên soạn cơ bản */}
            <Stack spacing={2}>
              <TextField
                label="Nội dung câu hỏi"
                multiline
                minRows={3}
                fullWidth
                size="small"
                value={studioForm.contentLatex}
                onChange={(e) => setStudioForm((p) => ({ ...p, contentLatex: e.target.value }))}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <TextField
                  label="Đáp án A"
                  size="small"
                  fullWidth
                  value={studioForm.optionA}
                  onChange={(e) => setStudioForm((p) => ({ ...p, optionA: e.target.value }))}
                />
                <TextField
                  label="Đáp án B"
                  size="small"
                  fullWidth
                  value={studioForm.optionB}
                  onChange={(e) => setStudioForm((p) => ({ ...p, optionB: e.target.value }))}
                />
                <TextField
                  label="Đáp án C"
                  size="small"
                  fullWidth
                  value={studioForm.optionC}
                  onChange={(e) => setStudioForm((p) => ({ ...p, optionC: e.target.value }))}
                />
                <TextField
                  label="Đáp án D"
                  size="small"
                  fullWidth
                  value={studioForm.optionD}
                  onChange={(e) => setStudioForm((p) => ({ ...p, optionD: e.target.value }))}
                />
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  label="Đáp án đúng"
                  size="small"
                  fullWidth
                  value={studioForm.correctOption}
                  onChange={(e) => setStudioForm((p) => ({ ...p, correctOption: e.target.value }))}
                >
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <MenuItem key={opt} value={opt}>Đáp án {opt}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Độ khó"
                  size="small"
                  fullWidth
                  value={studioForm.difficultyLevel}
                  onChange={(e) => setStudioForm((p) => ({ ...p, difficultyLevel: Number(e.target.value) }))}
                >
                  <MenuItem value={1}>Nhận biết</MenuItem>
                  <MenuItem value={2}>Thông hiểu</MenuItem>
                  <MenuItem value={3}>Vận dụng</MenuItem>
                  <MenuItem value={4}>Vận dụng cao</MenuItem>
                </TextField>
              </Stack>
              <TextField
                label="Lời giải chi tiết"
                multiline
                minRows={3}
                fullWidth
                size="small"
                value={studioForm.explanation}
                onChange={(e) => setStudioForm((p) => ({ ...p, explanation: e.target.value }))}
              />
            </Stack>

            {/* Cột phải: Live Preview chuẩn học sinh */}
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, bgcolor: 'background.default' }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                    Xem trước hiển thị (Live Preview)
                  </Typography>
                  <Chip size="small" color="success" label={`Đáp án đúng: ${studioForm.correctOption}`} />
                </Stack>
                <Box sx={{ fontSize: '0.92rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.6 }}>
                  <MathText text={studioForm.contentLatex || 'Nhập nội dung câu hỏi để xem trước...'} />
                </Box>
                <Stack spacing={1}>
                  {[
                    { k: 'A', v: studioForm.optionA },
                    { k: 'B', v: studioForm.optionB },
                    { k: 'C', v: studioForm.optionC },
                    { k: 'D', v: studioForm.optionD }
                  ].map((item) => {
                    const isRight = item.k === studioForm.correctOption;
                    return (
                      <Paper
                        key={item.k}
                        variant="outlined"
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          borderColor: isRight ? 'success.main' : 'divider',
                          bgcolor: isRight ? 'rgba(16,185,129,0.08)' : '#fff',
                          fontSize: '0.84rem'
                        }}
                      >
                        <strong>{item.k}.</strong> <MathText text={item.v || '...'} />
                      </Paper>
                    );
                  })}
                </Stack>
                {studioForm.explanation && (
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(79,70,229,0.04)', borderColor: 'primary.light' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5 }}>
                      Lời giải chi tiết:
                    </Typography>
                    <Box sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                      <MathText text={studioForm.explanation} />
                    </Box>
                  </Paper>
                )}
              </Stack>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Sparkles size={15} />}
            disabled={savingStudio}
            onClick={openFullStudioFromQuickEdit}
          >
            Mở Full Studio
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setStudioFlag(null)} disabled={savingStudio} color="inherit">
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save size={16} />}
              disabled={savingStudio}
              onClick={handleSaveStudioEdit}
            >
              {savingStudio ? 'Đang lưu...' : 'Lưu sửa nhanh & Mở khóa'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Full-Screen 838-Item & 3D MathLab Studio Editor cho câu hỏi bị báo cáo */}
      {fullStudioFlag && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <CurriculumStudioEditor
            mode="exam"
            pattern={{
              patternId: fullStudioFlag.questionId,
              name: fullStudioFlag.skillName || 'Câu hỏi bị báo cáo',
              theoryRecap: fullStudioFlag.questionContent || '',
              solutionMethod: fullStudioFlag.explanation || '',
              level: `L${fullStudioFlag.difficultyLevel || 2}`,
              sampleQuestion: {
                questionId: fullStudioFlag.questionId,
                difficultyLevel: fullStudioFlag.difficultyLevel || 2,
                content: fullStudioFlag.questionContent || '',
                options: [
                  `A. ${fullStudioFlag.options?.[0] || ''}`,
                  `B. ${fullStudioFlag.options?.[1] || ''}`,
                  `C. ${fullStudioFlag.options?.[2] || ''}`,
                  `D. ${fullStudioFlag.options?.[3] || ''}`
                ],
                correct: Math.max(0, ['A', 'B', 'C', 'D'].indexOf(String(fullStudioFlag.correctOption || 'A').toUpperCase())),
                explanation: fullStudioFlag.explanation || ''
              }
            }}
            domain={{
              name: fullStudioFlag.subjectName || 'Môn học',
              code: 'MATH'
            }}
            chapter={{ name: fullStudioFlag.subjectName || 'Kiểm duyệt câu hỏi' }}
            lesson={{ name: fullStudioFlag.skillName || 'Câu hỏi bị báo cáo' }}
            onClose={() => setFullStudioFlag(null)}
            onSaveSuccess={handleSaveFullStudio}
          />
        </div>
      )}
    </div>
  );
}
