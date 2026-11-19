import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  GitBranch,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  RefreshCw,
  Loader2,
  Plus,
  Minus,
  Trash2,
  Lightbulb,
  FolderTree,
  Clock,
  RotateCcw,
  Lock
} from 'lucide-react';
import aiService from '../../services/aiService';
import ExamRichContent from './ExamRichContent';
import { useToast } from '../../context/ToastContext';
import { formatSubjectLabel } from '../../utils/examParserUtils';
import { extractGradeFromName } from '../../utils/examCurriculumMatcher';
import {
  BLOOM_LEVEL_DETAILS,
  normalizeGeneratedExerciseToDraft
} from '../../utils/examOrganizerUtils';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const BLOOM_PRESETS = [
  { id: 'all6', label: 'Đều 6 mức (6 câu)', counts: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } },
  { id: 'dgnl', label: 'Chuẩn ĐGNL (6 câu)', counts: { 1: 1, 2: 2, 3: 2, 4: 1, 5: 0, 6: 0 } },
  { id: 'vdc', label: 'Vận dụng cao (4 câu)', counts: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1 } }
];

/**
 * ExamBloomAiGeneratorTab — AI 6-Level Bloom Question Generator + Human-in-the-Loop Approval Queue
 */
export default function ExamBloomAiGeneratorTab({
  exam,
  isLocked,
  flatCurriculumNodes = [],
  drafts = [],
  setDrafts,
  selectedSkillNode,
  onSelectSkillNode,
  onOpenSkillPicker,
  onApproveDraft,
  onApproveAllPending,
  onZoomImage
}) {
  const { toast } = useToast();

  const [bloomCounts, setBloomCounts] = useState({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 });
  const [gradeOverride, setGradeOverride] = useState(12);
  const [extraContext, setExtraContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(null); // { currentLevel, doneSteps, totalSteps, label }
  const [regeneratingDraftId, setRegeneratingDraftId] = useState(null);

  // Queue filter & inline editing state
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [bloomQueueFilter, setBloomQueueFilter] = useState(0);
  const [editingDraftId, setEditingDraftId] = useState(null);

  // Quick-select skills already appearing in current exam (or first 8 matching subject nodes)
  const quickSkillSuggestions = useMemo(() => {
    const seen = new Set();
    const list = [];
    const addIfNew = (node) => {
      if (!node?.skillId || seen.has(node.skillId)) return;
      seen.add(node.skillId);
      list.push(node);
    };

    (exam?.passages || []).forEach((p) =>
      (p.questions || []).forEach((q) => {
        if (q.curriculumNode?.skillId) addIfNew(q.curriculumNode);
      })
    );
    (exam?.singleQuestions || []).forEach((q) => {
      if (q.curriculumNode?.skillId) addIfNew(q.curriculumNode);
    });

    if (list.length < 6) {
      for (const n of flatCurriculumNodes) {
        if (list.length >= 6) break;
        if (exam?.subjectCode && exam.subjectCode !== 'GENERAL' && n.subSubject !== exam.subjectCode) continue;
        addIfNew(n);
      }
    }
    return list.slice(0, 6);
  }, [exam, flatCurriculumNodes]);

  const effectiveSkillNode = selectedSkillNode || quickSkillSuggestions[0] || flatCurriculumNodes[0] || null;
  const effectiveGrade =
    extractGradeFromName(effectiveSkillNode?.chapterName) ||
    extractGradeFromName(effectiveSkillNode?.lessonName) ||
    gradeOverride;

  const totalToGenerate = Object.values(bloomCounts).reduce((s, v) => s + (Number(v) || 0), 0);

  const pendingCount = drafts.filter((d) => d.status === 'pending').length;
  const approvedCount = drafts.filter((d) => d.status === 'approved').length;
  const rejectedCount = drafts.filter((d) => d.status === 'rejected').length;

  const visibleDrafts = useMemo(() => {
    return drafts.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (bloomQueueFilter > 0 && Number(d.difficultyLevel) !== bloomQueueFilter) return false;
      return true;
    });
  }, [drafts, statusFilter, bloomQueueFilter]);

  const adjustBloomCount = (level, delta) => {
    setBloomCounts((prev) => ({
      ...prev,
      [level]: Math.min(5, Math.max(0, (Number(prev[level]) || 0) + delta))
    }));
  };

  const handleGenerateBloomQuestions = async () => {
    if (isLocked || generating) return;
    if (!effectiveSkillNode) {
      toast.warning('Vui lòng chọn một nút Kỹ năng / Dạng bài từ Cây Khung Chương Trình trước khi sinh câu hỏi.');
      return;
    }
    if (totalToGenerate <= 0) {
      toast.warning('Vui lòng chọn ít nhất 1 câu hỏi ở một trong 6 mức độ Bloom.');
      return;
    }

    const activeLevels = BLOOM_LEVEL_DETAILS.filter((b) => (Number(bloomCounts[b.level]) || 0) > 0);
    setGenerating(true);
    setGenProgress({ currentLevel: activeLevels[0].level, doneSteps: 0, totalSteps: activeLevels.length, label: '' });

    const newDrafts = [];
    let failedLevels = 0;

    try {
      for (let i = 0; i < activeLevels.length; i++) {
        const b = activeLevels[i];
        const count = Number(bloomCounts[b.level]) || 1;
        setGenProgress({
          currentLevel: b.level,
          doneSteps: i,
          totalSteps: activeLevels.length,
          label: `Đang sinh ${count} câu mức ${b.code} · ${b.name}...`
        });

        try {
          const res = await aiService.generatePatternExercises({
            subject: effectiveSkillNode.domainName || formatSubjectLabel(exam?.subjectCode),
            grade: effectiveGrade,
            chapter: effectiveSkillNode.chapterName || '',
            lesson: effectiveSkillNode.lessonName || '',
            patternName: effectiveSkillNode.patternName || effectiveSkillNode.lessonName || 'Dạng bài trọng tâm',
            bloomLevel: b.level,
            theoryContext: extraContext.trim()
              ? `${extraContext.trim()} (Yêu cầu chuẩn bậc Bloom ${b.code} - ${b.name}: ${b.shortDesc})`
              : `Chuẩn GDPT 2018 & ĐGNL ĐHQG-HCM, bậc Bloom ${b.code} - ${b.name}: ${b.shortDesc}`,
            count
          });

          const rawList = Array.isArray(res?.exercises)
            ? res.exercises
            : Array.isArray(res)
            ? res
            : [];

          for (const item of rawList) {
            newDrafts.push(
              normalizeGeneratedExerciseToDraft(item, {
                bloomLevel: b.level,
                curriculumNode: effectiveSkillNode
              })
            );
          }
        } catch (lvlErr) {
          failedLevels += 1;
          console.warn(`Lỗi sinh câu hỏi Bloom L${b.level}:`, lvlErr);
        }
      }

      if (newDrafts.length > 0) {
        setDrafts((prev) => [...newDrafts, ...prev]);
        setStatusFilter('pending');
        toast.success(
          `AI đã sinh thành công ${newDrafts.length} câu hỏi theo ${activeLevels.length - failedLevels} mức Bloom — mời bạn kiểm duyệt ở hàng đợi bên phải!`
        );
      } else {
        toast.error('Không thể sinh câu hỏi từ AI Engine lúc này. Vui lòng kiểm tra kết nối dịch vụ AI Engine.');
      }
    } finally {
      setGenerating(false);
      setGenProgress(null);
    }
  };

  const handleRegenerateSingleDraft = async (draft) => {
    if (isLocked || regeneratingDraftId) return;
    const node = draft.curriculumNode || effectiveSkillNode;
    if (!node) return;
    const bloom =
      BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(draft.difficultyLevel)) || BLOOM_LEVEL_DETAILS[1];

    setRegeneratingDraftId(draft.draftId);
    try {
      const res = await aiService.generatePatternExercises({
        subject: node.domainName || formatSubjectLabel(exam?.subjectCode),
        grade: extractGradeFromName(node.chapterName) || effectiveGrade,
        chapter: node.chapterName || '',
        lesson: node.lessonName || '',
        patternName: node.patternName || node.lessonName || draft.suggestedSkillName,
        bloomLevel: bloom.level,
        theoryContext: `Sinh 1 câu hỏi mới khác hoàn toàn với câu cũ. Bậc Bloom ${bloom.code} (${bloom.name}): ${bloom.shortDesc}.`,
        count: 1
      });
      const rawList = Array.isArray(res?.exercises) ? res.exercises : [];
      if (rawList.length > 0) {
        const replacement = normalizeGeneratedExerciseToDraft(rawList[0], {
          bloomLevel: bloom.level,
          curriculumNode: node
        });
        setDrafts((prev) =>
          prev.map((d) => (d.draftId === draft.draftId ? { ...replacement, draftId: d.draftId } : d))
        );
        toast.success(`Đã sinh lại câu hỏi mới mức ${bloom.code}!`);
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể sinh lại câu hỏi lúc này.');
    } finally {
      setRegeneratingDraftId(null);
    }
  };

  const updateDraft = (draftId, updater) => {
    setDrafts((prev) => prev.map((d) => (d.draftId === draftId ? updater({ ...d }) : d)));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT PANEL: Skill Selector + 6-Level Bloom Configuration */}
      <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[136px] rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECEAE4] bg-gradient-to-r from-[#EEF2F7] via-indigo-50/40 to-white">
          <div className="flex items-center gap-2 text-[#1E3A5F]">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
            <h2 className="text-sm font-extrabold">AI Sinh Câu Hỏi Theo 6 Mức Bloom</h2>
          </div>
          <p className="text-[11.5px] text-slate-500 mt-0.5">
            Chọn đúng Kỹ năng (Node Chương/Bài/Dạng bài), phân bổ 6 bậc Bloom, sinh câu hỏi và duyệt đưa vào đề thi.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {isLocked && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Hãy mở khóa đề thi để sinh và duyệt thêm câu hỏi mới.</span>
            </div>
          )}

          {/* Step 1: Target Skill / Curriculum Node */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                1. Chọn Skill / Dạng bài mục tiêu
              </label>
              <button
                type="button"
                onClick={onOpenSkillPicker}
                className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Duyệt toàn cây ({flatCurriculumNodes.length})</span>
              </button>
            </div>

            <div className="p-3 rounded-xl border border-indigo-200/90 bg-indigo-50/40 space-y-1">
              {effectiveSkillNode ? (
                <>
                  <div className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{effectiveSkillNode.patternName || effectiveSkillNode.lessonName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {effectiveSkillNode.domainName} › {effectiveSkillNode.chapterName}
                    {effectiveSkillNode.lessonName &&
                    effectiveSkillNode.lessonName !== effectiveSkillNode.patternName
                      ? ` › ${effectiveSkillNode.lessonName}`
                      : ''}
                  </div>
                </>
              ) : (
                <div className="text-xs text-amber-800 font-semibold">
                  Chưa chọn kỹ năng. Nhấn "Duyệt toàn cây" để chọn.
                </div>
              )}
            </div>

            {/* Quick pick chips from exam skills */}
            {quickSkillSuggestions.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {quickSkillSuggestions.map((node) => {
                  const active = effectiveSkillNode?.skillId === node.skillId;
                  return (
                    <button
                      key={node.skillId}
                      type="button"
                      onClick={() => onSelectSkillNode?.(node)}
                      title={`${node.chapterName} › ${node.patternName || node.lessonName}`}
                      className={`px-2 py-0.5 rounded-md border text-[10.5px] font-semibold max-w-[180px] truncate transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {node.patternName || node.lessonName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: 6 Bloom Levels Allocation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                2. Phân bổ 6 mức độ Bloom
              </label>
              <span className="text-[11px] font-extrabold text-[#1E3A5F] bg-[#EEF2F7] px-2 py-0.5 rounded-full">
                Tổng: {totalToGenerate} câu
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {BLOOM_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBloomCounts({ ...p.counts })}
                  className="px-2 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[10.5px] font-bold text-[#1E3A5F] cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 6 Bloom Cards */}
            <div className="space-y-1.5">
              {BLOOM_LEVEL_DETAILS.map((b) => {
                const count = Number(bloomCounts[b.level]) || 0;
                return (
                  <div
                    key={b.level}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      count > 0
                        ? 'border-[#D4DFED] bg-[#F7F9FC]'
                        : 'border-[#ECEAE4] bg-[#FCFCFA] opacity-75'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${b.chipClass}`}>
                          {b.code}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800">{b.name}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate mt-0.5">{b.shortDesc}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={generating || count <= 0}
                        onClick={() => adjustBloomCount(b.level, -1)}
                        className="w-6 h-6 rounded-lg border border-[#DCD9D0] bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-extrabold text-[#1E3A5F]">
                        {count}
                      </span>
                      <button
                        type="button"
                        disabled={generating || count >= 5}
                        onClick={() => adjustBloomCount(b.level, 1)}
                        className="w-6 h-6 rounded-lg border border-[#DCD9D0] bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Grade & Custom Directive */}
          <div className="grid grid-cols-12 gap-2">
            <label className="col-span-4 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500">Khối lớp</span>
              <select
                value={effectiveGrade}
                onChange={(e) => setGradeOverride(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-bold text-slate-800"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </label>
            <label className="col-span-8 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500">Yêu cầu bổ sung cho AI</span>
              <input
                type="text"
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="VD: Số liệu đẹp, bẫy chuẩn ĐGNL..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>

          {/* Live Progress Bar */}
          {genProgress && (
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  {genProgress.label}
                </span>
                <span>
                  {genProgress.doneSteps}/{genProgress.totalSteps}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-indigo-200/70 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      12,
                      Math.round(((genProgress.doneSteps + 0.5) / Math.max(1, genProgress.totalSteps)) * 100)
                    )}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Generate CTA */}
          <button
            type="button"
            disabled={isLocked || generating || totalToGenerate <= 0 || !effectiveSkillNode}
            onClick={handleGenerateBloomQuestions}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E3A5F] via-indigo-700 to-cyan-700 hover:opacity-95 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang sinh câu hỏi theo 6 mức Bloom...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Sinh {totalToGenerate} Câu Hỏi Đưa Vào Hàng Duyệt</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* RIGHT PANEL: Human-in-the-Loop Review & Approval Queue */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4 min-w-0">
        {/* Queue Header & Bulk Actions */}
        <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm font-extrabold text-[#1E3A5F]">
                Hàng Đợi Kiểm Duyệt Câu Hỏi AI ({drafts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Rà soát công thức, sửa tại chỗ nếu cần rồi bấm <strong>Duyệt & Thêm Vào Đề</strong> để đưa câu hỏi đạt chuẩn vào đề thi.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {pendingCount > 0 && !isLocked && (
                <button
                  type="button"
                  onClick={onApproveAllPending}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Duyệt Tất Cả ({pendingCount}) Vào Đề</span>
                </button>
              )}

              {rejectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setDrafts((prev) => prev.filter((d) => d.status !== 'rejected'))}
                  className="px-2.5 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-rose-50 hover:text-rose-700 text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dọn đã loại ({rejectedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Queue Status & Bloom Filter Bar */}
          <div className="pt-2 border-t border-[#ECEAE4] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'pending', label: `Chờ duyệt (${pendingCount})` },
                { id: 'approved', label: `Đã duyệt (${approvedCount})` },
                { id: 'rejected', label: `Đã loại (${rejectedCount})` },
                { id: 'all', label: `Tất cả (${drafts.length})` }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStatusFilter(t.id)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                    statusFilter === t.id
                      ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                      : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600 hover:border-[#2C4C7E]/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBloomQueueFilter(0)}
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border cursor-pointer ${
                  bloomQueueFilter === 0
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-[#E5E3DC]'
                }`}
              >
                L1–L6
              </button>
              {BLOOM_LEVEL_DETAILS.map((b) => (
                <button
                  key={b.level}
                  type="button"
                  onClick={() => setBloomQueueFilter(b.level === bloomQueueFilter ? 0 : b.level)}
                  className={`px-1.5 py-0.5 rounded-md text-[10.5px] font-bold border cursor-pointer ${
                    bloomQueueFilter === b.level ? b.activeClass : 'bg-white text-slate-600 border-[#E5E3DC]'
                  }`}
                >
                  {b.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review Queue Cards */}
        {visibleDrafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DCD9D0] bg-white p-14 text-center space-y-2.5">
            <Sparkles className="w-9 h-9 text-indigo-300 mx-auto" />
            <div className="text-sm font-extrabold text-slate-700">
              {drafts.length === 0
                ? 'Hàng đợi kiểm duyệt đang trống'
                : 'Không có câu hỏi AI nào thuộc trạng thái đang lọc'}
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Chọn 1 kỹ năng / dạng bài ở bảng bên trái, phân bổ số lượng cho từng bậc nhận thức Bloom L1–L6 rồi bấm{' '}
              <strong>AI Sinh Câu Hỏi</strong>. Câu hỏi sẽ xuất hiện tại đây để bạn duyệt và sửa trước khi chèn vào đề.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {visibleDrafts.map((draft, idx) => {
              const bloom =
                BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(draft.difficultyLevel)) ||
                BLOOM_LEVEL_DETAILS[1];
              const isEditing = editingDraftId === draft.draftId;
              const isRegen = regeneratingDraftId === draft.draftId;

              return (
                <article
                  key={draft.draftId}
                  className={`rounded-2xl border bg-white overflow-hidden transition-all shadow-[0_1px_4px_rgba(15,23,42,0.03)] ${
                    draft.status === 'approved'
                      ? 'border-emerald-300 bg-emerald-50/15'
                      : draft.status === 'rejected'
                      ? 'border-rose-200 opacity-75'
                      : 'border-[#E7E5DF] hover:border-indigo-300'
                  }`}
                >
                  {/* Draft Header */}
                  <div className="px-4 py-3 border-b border-[#ECEAE4] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg border text-xs font-extrabold ${bloom.chipClass}`}>
                        {bloom.code} · {bloom.name}
                      </span>

                      {draft.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10.5px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã duyệt · Câu #{draft.insertedQuestionNumber}
                        </span>
                      ) : draft.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10.5px] font-bold">
                          <XCircle className="w-3 h-3" /> Đã từ chối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10.5px] font-bold">
                          <Clock className="w-3 h-3" /> Chờ kiểm duyệt #{idx + 1}
                        </span>
                      )}

                      {draft.curriculumNode?.chapterName && (
                        <span className="text-[11px] font-semibold text-indigo-700 truncate max-w-[260px]">
                          {draft.curriculumNode.chapterName}
                        </span>
                      )}
                    </div>

                    {/* Review Action Buttons */}
                    {!isLocked && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {draft.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingDraftId(isEditing ? null : draft.draftId)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                                isEditing
                                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                                  : 'bg-white border-[#E5E3DC] text-slate-700 hover:bg-[#EEF2F7]'
                              }`}
                            >
                              {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                              <span>{isEditing ? 'Xong' : 'Sửa'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={Boolean(regeneratingDraftId)}
                              onClick={() => handleRegenerateSingleDraft(draft)}
                              title="AI sinh lại 1 câu khác thay thế"
                              className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${isRegen ? 'animate-spin' : ''}`} />
                              <span>Sinh lại</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingDraftId(null);
                                onApproveDraft?.(draft);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt Vào Đề</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateDraft(draft.draftId, (d) => ({ ...d, status: 'rejected' }))
                              }
                              title="Từ chối câu hỏi này"
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {draft.status === 'rejected' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft(draft.draftId, (d) => ({ ...d, status: 'pending' }))
                            }
                            className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] text-[#1E3A5F] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Khôi phục chờ duyệt</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Draft Body */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-500 mr-1">Mức Bloom:</span>
                          {BLOOM_LEVEL_DETAILS.map((b) => (
                            <button
                              key={b.level}
                              type="button"
                              onClick={() =>
                                updateDraft(draft.draftId, (d) => ({ ...d, difficultyLevel: b.level }))
                              }
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border cursor-pointer ${
                                Number(draft.difficultyLevel) === b.level
                                  ? b.activeClass
                                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-slate-600'
                              }`}
                            >
                              {b.code}
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={3}
                          value={draft.content}
                          onChange={(e) =>
                            updateDraft(draft.draftId, (d) => ({ ...d, content: e.target.value }))
                          }
                          className="w-full p-2.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] focus:bg-white text-xs font-mono"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPTION_KEYS.map((key) => {
                            const isCorrect = draft.correctOption === key;
                            return (
                              <div key={key} className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDraft(draft.draftId, (d) => ({ ...d, correctOption: key }))
                                  }
                                  className={`w-7 h-7 rounded-lg text-xs font-extrabold shrink-0 cursor-pointer ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {key}
                                </button>
                                <input
                                  type="text"
                                  value={draft.options?.[key] || ''}
                                  onChange={(e) =>
                                    updateDraft(draft.draftId, (d) => ({
                                      ...d,
                                      options: { ...(d.options || {}), [key]: e.target.value }
                                    }))
                                  }
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E5E3DC] text-xs font-mono"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <textarea
                          rows={2}
                          value={draft.explanation}
                          onChange={(e) =>
                            updateDraft(draft.draftId, (d) => ({ ...d, explanation: e.target.value }))
                          }
                          placeholder="Lời giải chi tiết..."
                          className="w-full p-2.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] focus:bg-white text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <>
                        <ExamRichContent text={draft.content} onImageClick={onZoomImage} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {OPTION_KEYS.map((key) => {
                            const isCorrect = draft.correctOption === key;
                            return (
                              <div
                                key={key}
                                className={`px-3 py-2 rounded-xl border flex items-start gap-2.5 text-xs ${
                                  isCorrect
                                    ? 'border-emerald-400 bg-emerald-50/70'
                                    : 'border-[#ECEAE4] bg-[#FCFCFA]'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white border border-[#DCD9D0] text-slate-700'
                                  }`}
                                >
                                  {key}
                                </span>
                                <div className="flex-1 min-w-0 leading-relaxed text-slate-800">
                                  <ExamRichContent text={draft.options?.[key] || ''} inline onImageClick={onZoomImage} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {draft.explanation && (
                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-slate-800">
                            <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              <span>Lời giải gợi ý từ AI</span>
                            </div>
                            <ExamRichContent text={draft.explanation} onImageClick={onZoomImage} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

