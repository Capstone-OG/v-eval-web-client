import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  BookMarked,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Bot,
  Target,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import aiService from '../../services/aiService';
import contentService from '../../services/contentService';
import MathText from '../common/MathText';
import MathScratchpadButton from '../common/MathScratchpadButton';
import {
  isNonPedagogical,
  cleanPrefix,
  normalizeViText
} from './textbookStateBridge';

const SUBJECTS = [
  { code: 'MATH', label: 'Toán học' },
  { code: 'PHYS', label: 'Vật lí' },
  { code: 'CHEM', label: 'Hóa học' },
  { code: 'BIO', label: 'Sinh học' },
  { code: 'LIT', label: 'Ngữ văn' },
  { code: 'ENG', label: 'Tiếng Anh' },
  { code: 'HIST', label: 'Lịch sử' },
  { code: 'GEO', label: 'Địa lí' }
];

const BLOOM_META = {
  1: { label: 'Nhận biết', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  2: { label: 'Thông hiểu', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  3: { label: 'Vận dụng cơ bản', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  4: { label: 'Vận dụng cao', cls: 'bg-sky-50 text-sky-700 border-sky-200' }
};

function normSub(code = '') {
  const c = String(code || '').trim().toUpperCase();
  if (c === 'GEOG' || c === 'DIA' || c === 'ĐỊA') return 'GEO';
  if (c === 'PHY' || c === 'PHYSICS') return 'PHYS';
  return c;
}

function CleanKnowledgeMarkdown({ content }) {
  if (!content) return null;
  const normalized = String(content)
    .replace(/\r\n/g, '\n')
    .replace(/\s*>\s*⚠️\s*\*\*Lưu ý\*\*:\s*/gi, '\n> ')
    .replace(/([^\n#])\s*(#{2,4}\s+\d*\.)/g, '$1\n\n$2');
  const lines = normalized.split('\n');
  const blocks = [];

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line || /^#+$/.test(line)) return;

    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={idx} className="text-base sm:text-lg font-black text-slate-900 pt-1">
          <MathText text={line.slice(3).trim()} />
        </h3>
      );
    } else if (line.startsWith('### ')) {
      blocks.push(
        <div key={idx} className="mt-4 mb-2 border-l-4 border-emerald-600 bg-emerald-50/50 px-3.5 py-2 rounded-r-xl text-sm font-black text-emerald-950">
          <MathText text={line.slice(4).trim()} />
        </div>
      );
    } else if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={idx} className="mt-3 mb-1 text-sm font-extrabold text-slate-900">
          <MathText text={line.slice(5).trim()} />
        </h4>
      );
    } else if (line.startsWith('> ')) {
      const qText = line.slice(2).replace(/^#{1,4}\s+/, '').trim();
      blocks.push(
        <div key={idx} className="my-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-sm text-amber-950 leading-relaxed">
          <MathText text={qText} />
        </div>
      );
    } else if (/^[-•+]\s+/.test(line)) {
      const itemText = line.replace(/^[-•+]\s+/, '').replace(/^#{1,4}\s+/, '');
      blocks.push(
        <div key={idx} className="flex items-start gap-2.5 pl-1.5 text-sm text-slate-800 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
          <div className="min-w-0 flex-1 break-words">
            <MathText text={itemText} />
          </div>
        </div>
      );
    } else {
      blocks.push(
        <div key={idx} className="text-sm text-slate-700 leading-relaxed break-words">
          <MathText text={line} />
        </div>
      );
    }
  });

  return <div className="space-y-2 overflow-x-hidden break-words">{blocks}</div>;
}

function splitPatternContent(raw = '') {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!text) return { theory: '', examples: '' };
  const m3 = text.match(/^#{2,4}\s*3\./m);
  if (!m3 || m3.index === undefined) return { theory: text, examples: '' };
  return {
    theory: text.slice(0, m3.index).trim(),
    examples: text.slice(m3.index).trim()
  };
}

export default function StudentFoundationKnowledgeView({ onOpenAiTutorWithContext }) {
  const [sources, setSources] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('MATH');
  const [selectedGrade, setSelectedGrade] = useState(10);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [loadingBook, setLoadingBook] = useState(true);

  const [chapters, setChapters] = useState([]);
  const [selectedChIdx, setSelectedChIdx] = useState(0);
  const [selectedLesIdx, setSelectedLesIdx] = useState(0);
  const [selectedPatIdx, setSelectedPatIdx] = useState(0);
  const [expandedCh, setExpandedCh] = useState({ 0: true });
  const [expandedLes, setExpandedLes] = useState({ '0_0': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  // Right reading tabs: 'theory' | 'examples' | 'questions'
  const [activeTab, setActiveTab] = useState('theory');

  // Skill map + real DB questions
  const [skillMap, setSkillMap] = useState(() => ({ byPair: new Map(), byName: new Map() }));
  const [questionsBySkill, setQuestionsBySkill] = useState({});
  const [bloomFilter, setBloomFilter] = useState(0);
  const [selfCheckAnswers, setSelfCheckAnswers] = useState({});
  const [expandedSolutions, setExpandedSolutions] = useState({});

  // Load ingested textbooks & curriculum skill map once
  useEffect(() => {
    let mounted = true;
    Promise.all([
      aiService.getIngestedTextbooks().catch(() => ({ sources: [] })),
      contentService.getCurriculum().catch(() => [])
    ]).then(([tbRes, currRes]) => {
      if (!mounted) return;
      const list = tbRes?.sources || [];
      setSources(list);

      const domains = Array.isArray(currRes) ? currRes : (currRes?.domains || currRes?.data || []);
      const byPair = new Map();
      const byName = new Map();
      domains.forEach((dom) => {
        (dom.chapters || []).forEach((ch) => {
          (ch.lessons || []).forEach((les) => {
            const kp = normalizeViText(cleanPrefix(les.name || '', 'lesson') || les.name || '');
            (les.patterns || []).forEach((pat) => {
              const sid = pat.patternId || pat.skillId || pat.id;
              const rawName = pat.name || '';
              if (!sid || !rawName) return;
              const kn = normalizeViText(cleanPrefix(rawName, 'pattern') || rawName);
              if (kn) {
                if (kp) byPair.set(`${kp}__${kn}`, String(sid));
                if (!byName.has(kn)) byName.set(kn, String(sid));
              }
            });
          });
        });
      });
      setSkillMap({ byPair, byName });

      const firstMatch = list.find((s) => normSub(s.subjectCode) === 'MATH' && Number(s.grade) === 10) || list[0];
      if (firstMatch) {
        setSelectedSubject(normSub(firstMatch.subjectCode));
        setSelectedGrade(Number(firstMatch.grade || 10));
        setSelectedSourceId(firstMatch.sourceId);
      } else {
        setLoadingBook(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const matchingSources = useMemo(() => {
    return sources.filter(
      (s) => normSub(s.subjectCode) === selectedSubject && Number(s.grade) === selectedGrade
    );
  }, [sources, selectedSubject, selectedGrade]);

  const handleSelectSubjectOrGrade = (sub, grade) => {
    setSelectedSubject(sub);
    setSelectedGrade(grade);
    const match = sources.find((s) => normSub(s.subjectCode) === sub && Number(s.grade) === grade);
    setSelectedSourceId(match ? match.sourceId : '');
  };

  // Load chunks whenever selectedSourceId changes
  useEffect(() => {
    if (!selectedSourceId) {
      setChapters([]);
      setLoadingBook(false);
      return;
    }
    let cancelled = false;
    setLoadingBook(true);
    aiService
      .getTextbookChunks(selectedSourceId)
      .then((res) => {
        if (cancelled) return;
        const chunks = res?.chunks || [];
        const chMap = new Map();
        chunks.forEach((chunk) => {
          const sType = String(chunk.sectionType || '').toUpperCase();
          if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return;
          const rawC = chunk.chapterName?.trim() || 'Chủ đề trọng tâm';
          const rawL = chunk.lessonName?.trim() || '';
          const rawP = chunk.patternName?.trim() || '';
          if (!rawL || isNonPedagogical(rawL)) return;

          if (!chMap.has(rawC)) chMap.set(rawC, new Map());
          const lesMap = chMap.get(rawC);
          if (!lesMap.has(rawL)) {
            lesMap.set(rawL, { title: rawL, patterns: [] });
          }
          const lesObj = lesMap.get(rawL);
          const text = (chunk.text || chunk.content || chunk.contentSnippet || '').trim();
          if (rawP && !isNonPedagogical(rawP)) {
            const existing = lesObj.patterns.find((p) => p.name === rawP);
            if (!existing) {
              lesObj.patterns.push({
                name: rawP,
                skillId: chunk.skillId || '',
                content: text
              });
            } else if (text.length > existing.content.length) {
              existing.content = text;
            }
          }
        });

        const built = [];
        chMap.forEach((lesMap, cTitle) => {
          const lessons = [];
          lesMap.forEach((lObj) => {
            if (lObj.patterns.length > 0) lessons.push(lObj);
          });
          if (lessons.length > 0) built.push({ title: cTitle, lessons });
        });

        setChapters(built);
        setSelectedChIdx(0);
        setSelectedLesIdx(0);
        setSelectedPatIdx(0);
        setExpandedCh({ 0: true });
        setExpandedLes({ '0_0': true });
        setActiveTab('theory');
      })
      .catch(() => {
        if (!cancelled) setChapters([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBook(false);
      });
    return () => { cancelled = true; };
  }, [selectedSourceId]);

  const activeChapter = chapters[selectedChIdx] || null;
  const activeLesson = activeChapter?.lessons?.[selectedLesIdx] || null;
  const activePattern = activeLesson?.patterns?.[selectedPatIdx] || null;

  const activeSkillId = useMemo(() => {
    if (!activePattern) return '';
    if (activePattern.skillId) return String(activePattern.skillId);
    const kn = normalizeViText(cleanPrefix(activePattern.name, 'pattern') || activePattern.name || '');
    const kp = normalizeViText(cleanPrefix(activeLesson?.title || '', 'lesson') || activeLesson?.title || '');
    return skillMap.byPair.get(`${kp}__${kn}`) || skillMap.byName.get(kn) || '';
  }, [activePattern, activeLesson, skillMap]);

  // Fetch real questions for active pattern
  useEffect(() => {
    if (!activeSkillId || questionsBySkill[activeSkillId] !== undefined) return;
    let cancelled = false;
    contentService
      .getQuestionsBySkill(activeSkillId)
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
        const mapped = raw.map((q) => {
          const opts = Array.isArray(q.options) && q.options.length > 0
            ? q.options.map((o, i) => ({ key: o.key || ['A', 'B', 'C', 'D'][i], content: o.content || '' }))
            : ['A', 'B', 'C', 'D'].map((k, i) => ({ key: k, content: q[`option${k}`] || '' })).filter((x) => x.content);
          return {
            id: String(q.questionId || q.id),
            stem: q.contentLatex || q.content || '',
            options: opts,
            correct: String(q.correctOption || 'A').trim().toUpperCase().slice(0, 1),
            explanation: q.explanation || '',
            bloom: Math.max(1, Math.min(4, Number(q.difficultyLevel || 2)))
          };
        });
        setQuestionsBySkill((prev) => ({ ...prev, [activeSkillId]: mapped }));
      })
      .catch(() => {
        if (!cancelled) setQuestionsBySkill((prev) => ({ ...prev, [activeSkillId]: [] }));
      });
    return () => { cancelled = true; };
  }, [activeSkillId]);

  const patternQuestions = activeSkillId ? (questionsBySkill[activeSkillId] || []) : [];
  const displayedQuestions = useMemo(() => {
    if (!bloomFilter) return patternQuestions;
    return patternQuestions.filter((q) => q.bloom === bloomFilter);
  }, [patternQuestions, bloomFilter]);

  const { theory, examples } = useMemo(
    () => splitPatternContent(activePattern?.content || ''),
    [activePattern?.content]
  );

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chapters.map((ch, cIdx) => ({ ...ch, _origCIdx: cIdx }));
    return chapters
      .map((ch, cIdx) => {
        const lessons = ch.lessons
          .map((les, lIdx) => {
            const matchLes = les.title.toLowerCase().includes(q);
            const patterns = les.patterns
              .map((pat, pIdx) => ({ ...pat, _origPIdx: pIdx }))
              .filter((pat) => matchLes || pat.name.toLowerCase().includes(q));
            return { ...les, _origLIdx: lIdx, patterns };
          })
          .filter((les) => les.patterns.length > 0);
        return { ...ch, _origCIdx: cIdx, lessons };
      })
      .filter((ch) => ch.lessons.length > 0);
  }, [chapters, searchQuery]);

  const subjectLabel = SUBJECTS.find((s) => s.code === selectedSubject)?.label || selectedSubject;

  return (
    <div className="space-y-4 animate-fade">
      {/* 1. CLEAN STUDENT KNOWLEDGE HEADER & FILTER BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                Kiến Thức Nền Chuẩn SGK (GDPT 2018)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Tra cứu nhanh lý thuyết, công thức KaTeX, ví dụ mẫu có lời giải và tự kiểm tra câu hỏi theo từng dạng bài
              </p>
            </div>
          </div>

          {/* Grade selector pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[10, 11, 12].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectSubjectOrGrade(selectedSubject, g)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Pill Strip + Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECTS.map((sub) => {
              const active = selectedSubject === sub.code;
              return (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => handleSelectSubjectOrGrade(sub.code, selectedGrade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {matchingSources.length > 1 && (
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[200px]"
              >
                {matchingSources.map((s) => (
                  <option key={s.sourceId} value={s.sourceId}>
                    {s.fileName}
                  </option>
                ))}
              </select>
            )}
            <div className="relative min-w-[200px] flex-1 sm:w-56 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh bài / dạng bài..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN READING WORKSPACE */}
      {loadingBook ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-xs text-slate-500">
          Đang mở sách giáo khoa {subjectLabel} Lớp {selectedGrade}...
        </div>
      ) : chapters.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-14 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-black text-slate-700">
            Chưa có dữ liệu sách {subjectLabel} Lớp {selectedGrade}
          </div>
          <p className="text-xs text-slate-500">Hãy chọn môn học hoặc khối lớp khác ở thanh bên trên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: CLEAN TABLE OF CONTENTS */}
          {isTocCollapsed ? (
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-2.5 flex flex-col items-center gap-2 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsTocCollapsed(false)}
                title="Mở rộng mục lục"
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[760px]">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">
                    Mục Lục • {subjectLabel} {selectedGrade}
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-medium">
                    {chapters.length} chương • Bộ Chân trời sáng tạo
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTocCollapsed(true)}
                  title="Thu gọn mục lục"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredChapters.map((ch) => {
                  const cIdx = ch._origCIdx;
                  const chOpen = searchQuery.trim() ? true : !!expandedCh[cIdx];
                  return (
                    <div key={cIdx} className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/40">
                      <button
                        type="button"
                        onClick={() => setExpandedCh((prev) => ({ ...prev, [cIdx]: !chOpen }))}
                        className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100/70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {chOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                          <span className="text-xs font-extrabold text-slate-900 truncate">
                            {ch.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {ch.lessons.length} bài
                        </span>
                      </button>

                      {chOpen && (
                        <div className="px-2 pb-2 space-y-1.5">
                          {ch.lessons.map((les, lLocalIdx) => {
                            const lIdx = les._origLIdx !== undefined ? les._origLIdx : lLocalIdx;
                            const lesKey = `${cIdx}_${lIdx}`;
                            const lesOpen = searchQuery.trim() ? true : !!expandedLes[lesKey];
                            const isLesActive = cIdx === selectedChIdx && lIdx === selectedLesIdx;
                            return (
                              <div key={lesKey} className="rounded-xl bg-white border border-slate-200/80 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedLes((prev) => ({ ...prev, [lesKey]: !lesOpen }));
                                    setSelectedChIdx(cIdx);
                                    setSelectedLesIdx(lIdx);
                                    setSelectedPatIdx(0);
                                  }}
                                  className={`w-full px-2.5 py-2 flex items-center gap-1.5 text-left text-[11.5px] cursor-pointer ${
                                    isLesActive ? 'bg-emerald-50/70 font-black text-emerald-950' : 'font-semibold text-slate-800 hover:bg-slate-50'
                                  }`}
                                >
                                  {lesOpen ? <ChevronDown className="w-3 h-3 shrink-0 text-slate-400" /> : <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />}
                                  <BookMarked className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                  <span className="truncate">{les.title}</span>
                                </button>

                                {lesOpen && (
                                  <div className="px-2 pb-2 pt-1 border-t border-slate-100 space-y-1">
                                    {les.patterns.map((pat, pLocalIdx) => {
                                      const pIdx = pat._origPIdx !== undefined ? pat._origPIdx : pLocalIdx;
                                      const isPatActive = isLesActive && pIdx === selectedPatIdx;
                                      return (
                                        <button
                                          key={pIdx}
                                          type="button"
                                          onClick={() => {
                                            setSelectedChIdx(cIdx);
                                            setSelectedLesIdx(lIdx);
                                            setSelectedPatIdx(pIdx);
                                            setBloomFilter(0);
                                          }}
                                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                                            isPatActive
                                              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                              : 'text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          <Target className={`w-3 h-3 shrink-0 ${isPatActive ? 'text-emerald-100' : 'text-emerald-600'}`} />
                                          <span className="truncate">
                                            {cleanPrefix(pat.name, 'pattern') || pat.name}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          {/* RIGHT: 3-TAB STUDENT READING STUDIO */}
          <div className={`${isTocCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'} space-y-4 min-w-0`}>
            {activePattern && (
              <>
                {/* Pattern Header Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-700">{subjectLabel} {selectedGrade}</span>
                        <span>›</span>
                        <span className="truncate">{activeChapter?.title}</span>
                        <span>›</span>
                        <span className="truncate">{activeLesson?.title}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {cleanPrefix(activePattern.name, 'pattern') || activePattern.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <MathScratchpadButton
                        text={`${activePattern.name || ''} ${activePattern.lessonName || ''} ${activePattern.chapterName || ''}`}
                        subjectHint={subjectLabel}
                        className="py-2"
                      />
                      {onOpenAiTutorWithContext && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenAiTutorWithContext({
                              topic: activePattern.name,
                              subject: `${subjectLabel} Lớp ${selectedGrade}`,
                              questionContent: `Giải thích chi tiết kiến thức nền & ví dụ cho dạng bài: ${activePattern.name}`
                            })
                          }
                          className="px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Bot className="w-4 h-4" />
                          <span>Hỏi Gia sư AI</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Clean Reading Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    {[
                      { id: 'theory', label: '1. Lý Thuyết & Công Thức', icon: BookOpen },
                      { id: 'examples', label: '2. Ví Dụ Mẫu & Lời Giải', icon: Lightbulb },
                      { id: 'questions', label: `3. Tự Luyện Nhanh (${patternQuestions.length})`, icon: HelpCircle }
                    ].map(({ id, label, icon: Icon }) => {
                      const active = activeTab === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setActiveTab(id)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            active
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                  {activeTab === 'theory' && (
                    theory ? (
                      <CleanKnowledgeMarkdown content={theory} />
                    ) : (
                      <div className="py-10 text-center text-xs text-slate-400">
                        Chưa có nội dung lý thuyết cho dạng bài này.
                      </div>
                    )
                  )}

                  {activeTab === 'examples' && (
                    examples ? (
                      <CleanKnowledgeMarkdown content={examples} />
                    ) : (
                      <div className="py-10 text-center space-y-1.5 text-slate-500">
                        <Lightbulb className="w-7 h-7 text-amber-400 mx-auto" />
                        <div className="text-sm font-bold text-slate-700">Ví dụ minh họa nằm ngay trong mục Lý thuyết</div>
                        <p className="text-xs">Bạn có thể chuyển sang tab <strong>3. Tự Luyện Nhanh</strong> để thực hành câu hỏi có lời giải chi tiết.</p>
                      </div>
                    )
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      {patternQuestions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pb-3 border-b border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => setBloomFilter(0)}
                            className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                              bloomFilter === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Tất cả ({patternQuestions.length})
                          </button>
                          {[1, 2, 3, 4].map((lvl) => {
                            const cnt = patternQuestions.filter((q) => q.bloom === lvl).length;
                            if (!cnt) return null;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setBloomFilter(lvl)}
                                className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                                  bloomFilter === lvl ? 'bg-emerald-700 text-white border-emerald-700' : BLOOM_META[lvl].cls
                                }`}
                              >
                                {BLOOM_META[lvl].label} ({cnt})
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {displayedQuestions.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-500">
                          Chưa có câu hỏi tự luyện riêng cho dạng bài này.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {displayedQuestions.map((q, qIdx) => {
                            const picked = selfCheckAnswers[q.id];
                            const showSol = Boolean(expandedSolutions[q.id] || picked);
                            return (
                              <div key={q.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-[11px] font-black flex items-center justify-center">
                                      {qIdx + 1}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold ${(BLOOM_META[q.bloom] || BLOOM_META[2]).cls}`}>
                                      {(BLOOM_META[q.bloom] || BLOOM_META[2]).label}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                                  <MathText text={q.stem} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt) => {
                                    const isPicked = picked === opt.key;
                                    const isRight = opt.key === q.correct;
                                    let cls = 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800';
                                    if (picked) {
                                      if (isRight) cls = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                                      else if (isPicked) cls = 'bg-rose-50 border-rose-400 text-rose-950';
                                      else cls = 'bg-white/60 border-slate-200 text-slate-400';
                                    }
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setSelfCheckAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                                        className={`p-2.5 rounded-xl border text-left text-xs flex items-start gap-2 cursor-pointer transition-all ${cls}`}
                                      >
                                        <span className="font-black shrink-0">{opt.key}.</span>
                                        <div className="flex-1 min-w-0 break-words"><MathText text={opt.content} /></div>
                                        {picked && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                        {picked && isPicked && !isRight && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {q.explanation && (
                                  <div className="pt-2 border-t border-slate-200/70">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedSolutions((prev) => ({ ...prev, [q.id]: !showSol }))}
                                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 cursor-pointer"
                                    >
                                      {showSol ? 'Thu gọn lời giải' : 'Xem lời giải chi tiết'}
                                    </button>
                                    {showSol && (
                                      <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 leading-relaxed">
                                        <MathText text={q.explanation} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
