import React, { useMemo, useState } from 'react';
import {
  X,
  Search,
  GitBranch,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  FolderTree,
  Unlink,
  BookOpen,
  Layers,
  Target
} from 'lucide-react';
import {
  foldVietnamese,
  matchQuestionToCurriculumNode
} from '../../utils/examCurriculumMatcher';

/**
 * Interactive 4-tier Cascading Curriculum Node Picker Modal
 * Lets teachers pick or refine exact Domain -> Chapter -> Lesson -> Pattern for any Exam Question.
 */
export default function ExamNodePickerModal({
  isOpen,
  question,
  passageContent = '',
  examSubjectCode = 'GENERAL',
  curriculumDomains = [],
  flatNodes = [],
  onSelectNode,
  onClearNode,
  onClose
}) {
  const [search, setSearch] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState(
    question?.curriculumNode?.domainId || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState(
    question?.curriculumNode?.chapterId || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState(
    question?.curriculumNode?.lessonId || ''
  );

  // Top auto-suggested candidates for this specific question
  const topSuggestions = useMemo(() => {
    if (!isOpen || !question || flatNodes.length === 0) return [];
    const { topCandidates } = matchQuestionToCurriculumNode(
      question,
      passageContent,
      examSubjectCode,
      flatNodes
    );
    return topCandidates.slice(0, 4);
  }, [isOpen, question, passageContent, examSubjectCode, flatNodes]);

  // Unified search across all flat nodes
  const searchResults = useMemo(() => {
    const q = foldVietnamese(search);
    if (!q) return [];
    const parts = q.split(' ').filter((p) => p.length >= 2);
    return flatNodes
      .filter((n) => {
        if (n.searchText.includes(q)) return true;
        return parts.length > 0 && parts.every((part) => n.searchText.includes(part));
      })
      .slice(0, 30);
  }, [search, flatNodes]);

  // Cascading tree selections
  const activeDomain = useMemo(() => {
    if (!curriculumDomains.length) return null;
    return (
      curriculumDomains.find((d) => (d.domainId || d.id) === selectedDomainId) ||
      curriculumDomains[0]
    );
  }, [curriculumDomains, selectedDomainId]);

  const chapters = useMemo(() => activeDomain?.chapters || [], [activeDomain]);
  const activeChapter = useMemo(() => {
    if (!chapters.length) return null;
    return (
      chapters.find((c) => (c.chapterId || c.id) === selectedChapterId) ||
      chapters[0]
    );
  }, [chapters, selectedChapterId]);

  const lessons = useMemo(() => activeChapter?.lessons || [], [activeChapter]);
  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    return (
      lessons.find((l) => (l.lessonId || l.id) === selectedLessonId) ||
      lessons[0]
    );
  }, [lessons, selectedLessonId]);

  const patterns = useMemo(() => activeLesson?.patterns || [], [activeLesson]);

  if (!isOpen || !question) return null;

  const currentSkillId = question.curriculumNode?.skillId;

  const emitPick = (node, confidence = 1.0) => {
    onSelectNode?.({
      skillId: node.skillId,
      domainId: node.domainId || null,
      domainName: node.domainName || '',
      chapterId: node.chapterId || null,
      chapterName: node.chapterName || '',
      lessonId: node.lessonId || null,
      lessonName: node.lessonName || '',
      patternId: node.patternId || node.skillId,
      patternName: node.patternName || '',
      confidence,
      matchSource: 'manual',
      reason: 'Giảng viên gắn trực tiếp vào cây Khung chương trình'
    });
  };

  return (
    <div
      className="fixed inset-0 z-[65] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-5xl max-h-[88vh] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-cyan-50/40 to-emerald-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FolderTree className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                Gắn Nút Khung Năng Lực & Khung Chương Trình — Câu {question.questionNumber}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {question.content?.slice(0, 120) || 'Chọn Miền năng lực › Chương › Bài học › Dạng bài'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentSkillId && onClearNode && (
              <button
                type="button"
                onClick={() => onClearNode()}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Gỡ Node</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Top Suggestions */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm nhanh trong ${flatNodes.length} nút Chương / Bài / Dạng bài (gõ không dấu, vd: cuc tri, ester, con lac lo xo, doc hieu)...`}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Top Auto-Suggested Candidates */}
          {!search && topSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gợi ý nút phù hợp nhất cho Câu {question.questionNumber}:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topSuggestions.map(({ node, confidence }) => {
                  const isPicked = currentSkillId && currentSkillId === node.skillId;
                  return (
                    <button
                      key={node.skillId}
                      type="button"
                      onClick={() => emitPick(node, confidence)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isPicked
                          ? 'border-emerald-400 bg-emerald-50/70'
                          : 'border-indigo-200/80 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-[11.5px] font-bold text-slate-900 line-clamp-1">
                          {node.patternName || node.lessonName}
                        </div>
                        <div className="text-[10.5px] text-slate-500 line-clamp-1">
                          {node.chapterName}
                          {node.lessonName && node.lessonName !== node.patternName ? ` › ${node.lessonName}` : ''}
                        </div>
                      </div>
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                        {Math.round(confidence * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Body: Search Results OR 4-Tier Cascading Tree */}
        <div className="flex-1 overflow-hidden">
          {search.trim() ? (
            <div className="h-full max-h-[52vh] overflow-y-auto p-4 space-y-2">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Không tìm thấy nút Chương / Bài học nào khớp với &ldquo;{search}&rdquo;.
                </div>
              ) : (
                searchResults.map((node) => {
                  const isPicked = currentSkillId && currentSkillId === node.skillId;
                  return (
                    <button
                      key={node.skillId}
                      type="button"
                      onClick={() => emitPick(node, 1.0)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isPicked
                          ? 'border-emerald-400 bg-emerald-50/60'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-indigo-700">
                          <span>{node.domainName}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-700">{node.chapterName}</span>
                          {node.lessonName && (
                            <>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span className="text-cyan-800">{node.lessonName}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {node.patternName || node.lessonName}
                        </div>
                      </div>
                      {isPicked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold shrink-0">
                          Chọn
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : curriculumDomains.length === 0 ? (
            <div className="py-14 text-center text-xs text-slate-500">
              Chưa tải được cây Khung chương trình từ Content Service (`GET /api/content/curriculum`).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 h-[50vh] divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Col 1: Domains */}
              <div className="md:col-span-3 overflow-y-auto p-3 space-y-1.5 bg-slate-50/40">
                <div className="px-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Target className="w-3 h-3" /> 1. Miền năng lực
                </div>
                {curriculumDomains.map((d) => {
                  const id = d.domainId || d.id;
                  const active = activeDomain && (activeDomain.domainId || activeDomain.id) === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedDomainId(id);
                        setSelectedChapterId('');
                        setSelectedLessonId('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="line-clamp-2">{d.title || d.name}</div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {(d.chapters || []).length} chương
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Col 2: Chapters */}
              <div className="md:col-span-3 overflow-y-auto p-3 space-y-1.5">
                <div className="px-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> 2. Chương ({chapters.length})
                </div>
                {chapters.map((c) => {
                  const id = c.chapterId || c.id;
                  const active = activeChapter && (activeChapter.chapterId || activeChapter.id) === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedChapterId(id);
                        setSelectedLessonId('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-cyan-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-cyan-50'
                      }`}
                    >
                      <div className="line-clamp-2">{c.name || c.title}</div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-cyan-100' : 'text-slate-400'}`}>
                        {(c.lessons || []).length} bài học
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Col 3: Lessons */}
              <div className="md:col-span-3 overflow-y-auto p-3 space-y-1.5">
                <div className="px-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> 3. Bài học ({lessons.length})
                </div>
                {lessons.map((l) => {
                  const id = l.lessonId || l.id;
                  const active = activeLesson && (activeLesson.lessonId || activeLesson.id) === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedLessonId(id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="line-clamp-2">{l.name || l.title}</div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {(l.patterns || []).length} dạng bài
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Col 4: Patterns (Leaf Skills) */}
              <div className="md:col-span-3 overflow-y-auto p-3 space-y-1.5 bg-emerald-50/20">
                <div className="px-2 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> 4. Dạng bài ({patterns.length})
                </div>
                {patterns.map((p) => {
                  const pId = p.patternId || p.skillId || p.id || activeLesson?.lessonId;
                  const isPicked = currentSkillId && currentSkillId === pId;
                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() =>
                        emitPick(
                          {
                            skillId: pId,
                            domainId: activeDomain?.domainId || activeDomain?.id,
                            domainName: activeDomain?.title || activeDomain?.name || '',
                            chapterId: activeChapter?.chapterId || activeChapter?.id,
                            chapterName: activeChapter?.name || activeChapter?.title || '',
                            lessonId: activeLesson?.lessonId || activeLesson?.id,
                            lessonName: activeLesson?.name || activeLesson?.title || '',
                            patternId: pId,
                            patternName: p.name || p.patternName || activeLesson?.name || ''
                          },
                          1.0
                        )
                      }
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isPicked
                          ? 'border-emerald-500 bg-emerald-100/70 text-emerald-950'
                          : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800'
                      }`}
                    >
                      <span className="leading-snug">{p.name || p.patternName}</span>
                      {isPicked && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
