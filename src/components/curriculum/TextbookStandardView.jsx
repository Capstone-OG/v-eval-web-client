import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Edit3,
  BookMarked,
  Target,
  Check,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Save,
  Compass,
  Columns,
  HelpCircle,
  Lightbulb,
  Filter,
  RefreshCw
} from 'lucide-react';
import aiService from '../../services/aiService';
import contentService from '../../services/contentService';
import MathText from '../common/MathText';
import { useToast } from '../../context/ToastContext';
import {
  getStoredTextbookContext,
  saveStoredTextbookContext,
  isNonPedagogical,
  filterPedagogicalChapters,
  cleanPrefix,
  getGdptPreset,
  getDefaultLessonTheory,
  buildTheoryFromChunks,
  buildMethodFromChunks,
  getChunksForLesson,
  extractKeyFormulasFromChunks,
  isGenericPlaceholder,
  getSavedTextbookData,
  saveTextbookData,
  clearSavedTextbookData,
  mergeSavedExercisesIntoChapters,
  resolvePersistedChapters,
  syncTextbookSkeletonToCurriculum,
  normalizeViText
} from './textbookStateBridge';

const BLOOM_LEVELS = [
  { level: 1, label: 'Nhận biết', shortLabel: 'Nhận biết', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { level: 2, label: 'Thông hiểu', shortLabel: 'Thông hiểu', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { level: 3, label: 'Vận dụng cơ bản', shortLabel: 'VD cơ bản', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  { level: 4, label: 'Vận dụng cao', shortLabel: 'VD cao', color: 'bg-sky-50 text-sky-700 border-sky-300' },
  { level: 5, label: 'Đánh giá', shortLabel: 'Đánh giá', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { level: 6, label: 'Sáng tạo', shortLabel: 'Sáng tạo', color: 'bg-purple-50 text-purple-700 border-purple-300' }
];

const normalizeSubjectKey = (code = '') => {
  const c = String(code || '').trim().toUpperCase();
  if (c === 'GEOG' || c === 'DIA' || c === 'ĐỊA') return 'GEO';
  if (c === 'PHY' || c === 'PHYSICS') return 'PHYS';
  return c;
};

function CleanTextbookRenderer({ content }) {
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
          <div className="min-w-0 flex-1">
            <MathText text={itemText} />
          </div>
        </div>
      );
    } else {
      blocks.push(
        <div key={idx} className="text-sm text-slate-700 leading-relaxed">
          <MathText text={line} />
        </div>
      );
    }
  });

  return <div className="space-y-2 overflow-x-hidden break-words">{blocks}</div>;
}

const SUBJECT_OPTIONS = [
  { code: 'MATH', name: 'Toán học' },
  { code: 'PHYS', name: 'Vật lí' },
  { code: 'CHEM', name: 'Hóa học' },
  { code: 'BIO', name: 'Sinh học' },
  { code: 'LIT', name: 'Ngữ văn' },
  { code: 'HIST', name: 'Lịch sử' },
  { code: 'GEO', name: 'Địa lí' },
  { code: 'ENG', name: 'Tiếng Anh' }
];

export default function TextbookStandardView({ onBack, onNavigateTab, isSidebarCollapsed = false }) {
  const { toast } = useToast();
  const initCtx = getStoredTextbookContext();

  const [ingestedSources, setIngestedSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState(initCtx.selectedSourceId || '');
  const selectedSourceIdRef = useRef(initCtx.selectedSourceId || '');
  useEffect(() => {
    selectedSourceIdRef.current = selectedSourceId;
  }, [selectedSourceId]);
  const [sourceChunks, setSourceChunks] = useState([]);

  const [skeleton, setSkeleton] = useState(() => {
    const saved = getSavedTextbookData(initCtx.selectedSourceId, initCtx.fileName);
    const preset = getGdptPreset(initCtx.subjectCode || 'PHYS', initCtx.grade || 10);
    const baseChapters = saved?.skeleton?.chapters && saved.skeleton.chapters.length > 0
      ? saved.skeleton.chapters
      : (preset?.chapters || []);
    const merged = mergeSavedExercisesIntoChapters(baseChapters, saved);

    return {
      fileName: saved?.skeleton?.fileName || initCtx.fileName || '',
      subjectCode: saved?.skeleton?.subjectCode || initCtx.subjectCode || 'PHYS',
      subjectName: saved?.skeleton?.subjectName || initCtx.subjectName || 'Vật lí',
      grade: saved?.skeleton?.grade || initCtx.grade || 10,
      bookEdition: saved?.skeleton?.bookEdition || initCtx.bookEdition || preset?.bookEdition || 'Cánh Diều',
      versionTag: saved?.skeleton?.versionTag || initCtx.versionTag || '2025-2026',
      isVersionLocked: false,
      status: 'ACCEPTED',
      totalPages: saved?.skeleton?.totalPages || 0,
      chapters: merged
    };
  });

  const skeletonRef = useRef(skeleton);
  useEffect(() => {
    skeletonRef.current = skeleton;
  }, [skeleton]);

  // Lắng nghe sự kiện đồng bộ câu hỏi & cấu trúc từ các view khác
  useEffect(() => {
    const handleSync = (e) => {
      const detail = e.detail;
      if (!detail?.skeleton?.chapters) return;
      if (detail.sourceId === selectedSourceId || detail.fileName === skeletonRef.current.fileName) {
        setSkeleton(prev => {
          const updated = {
            ...prev,
            chapters: mergeSavedExercisesIntoChapters(prev.chapters, detail)
          };
          skeletonRef.current = updated;
          return updated;
        });
      }
    };
    window.addEventListener('veval:textbook-saved', handleSync);
    return () => window.removeEventListener('veval:textbook-saved', handleSync);
  }, [selectedSourceId]);

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(initCtx.selectedChapterIdx || 0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(initCtx.selectedLessonIdx || 0);
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(initCtx.selectedPatternIdx || 0);

  // Tree view expansion state
  const [expandedChapters, setExpandedChapters] = useState({ 0: true, 1: true });
  const [expandedLessons, setExpandedLessons] = useState({ '0_0': true });

  // Theory & Method editing state
  const [isEditingTheory, setIsEditingTheory] = useState(false);
  const [editedTheory, setEditedTheory] = useState('');
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const [editedMethod, setEditedMethod] = useState('');
  const [isTheoryExpanded, setIsTheoryExpanded] = useState(true);
  const [isMethodExpanded, setIsMethodExpanded] = useState(true);
  const [activeContentTab, setActiveContentTab] = useState('theory'); // 'theory' | 'method' | 'questions'
  const [enrichingKnowledge, setEnrichingKnowledge] = useState(false);
  const [syncingCurriculum, setSyncingCurriculum] = useState(false);

  // Trạng thái thu gọn Mục lục SGK (tương tự như thu gọn Sidebar)
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  // Bộ lọc & xem câu hỏi / bài tập SGK của bài học (đồng bộ trực tiếp từ v_eval_content.Questions)
  const [exerciseFilterScope, setExerciseFilterScope] = useState('pattern'); // 'lesson' | 'pattern'
  const [selectedBloomFilter, setSelectedBloomFilter] = useState(0); // 0 = Tất cả, 1..6
  const [expandedExerciseSolutions, setExpandedExerciseSolutions] = useState({});
  const [skillLookupMap, setSkillLookupMap] = useState(() => ({ byPair: new Map(), byName: new Map() }));
  const [dbQuestionsBySkill, setDbQuestionsBySkill] = useState({});
  const [loadingDbQuestions, setLoadingDbQuestions] = useState(false);

  // Tải cây khung chương trình 1 lần từ GET /api/content/curriculum để map chính xác pattern -> skillId dưới CSDL
  useEffect(() => {
    let active = true;
    contentService.getCurriculum()
      .then((res) => {
        if (!active) return;
        const domains = Array.isArray(res) ? res : (res?.domains || res?.data || []);
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

          (dom.skills || []).forEach((sk) => {
            const sid = sk.skillId || sk.id;
            const rawName = sk.name || '';
            if (!sid || !rawName) return;
            const kn = normalizeViText(cleanPrefix(rawName, 'pattern') || rawName);
            if (kn && !byName.has(kn)) byName.set(kn, String(sid));
          });
        });

        setSkillLookupMap({ byPair, byName });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Parsed SGK Dropdown & Sub-Pagination state (Mặc định đóng để chống tràn màn hình)
  const [isOcrDropdownOpen, setIsOcrDropdownOpen] = useState(false);
  const [ocrCurrentPage, setOcrCurrentPage] = useState(1);
  const [ocrScope, setOcrScope] = useState('lesson'); // 'lesson' | 'book'

  const validChapters = (skeleton.chapters || []).filter(ch => ch && !isNonPedagogical(ch.title));
  const hasData = validChapters.length > 0;
  const activeChapter = hasData ? (validChapters[selectedChapterIdx] || validChapters[0]) : null;
  const validLessons = (activeChapter?.lessons || []).filter(l => l && !isNonPedagogical(l.title));
  const activeLesson = validLessons.length > 0 ? (validLessons[selectedLessonIdx] || validLessons[0]) : null;
  const validPatterns = (activeLesson?.patterns || []).filter(p => p && !isNonPedagogical(p.name));
  const activePattern = validPatterns.length > 0 ? (validPatterns[selectedPatternIdx] || validPatterns[0]) : null;
  const isLocked = skeleton.isVersionLocked;

  const resolvePatternSkillId = (les, pat) => {
    if (!pat) return '';
    if (pat.skillId) return String(pat.skillId);
    const kn = normalizeViText(cleanPrefix(pat.name, 'pattern') || pat.name || '');
    const kp = normalizeViText(cleanPrefix(les?.title || '', 'lesson') || les?.title || '');
    if (!kn) return '';
    const exact = skillLookupMap.byPair.get(`${kp}__${kn}`) || skillLookupMap.byName.get(kn);
    if (exact) return exact;
    for (const [k, sid] of skillLookupMap.byName.entries()) {
      if (k.length >= 8 && (k.includes(kn) || kn.includes(k))) {
        return sid;
      }
    }
    return '';
  };

  // Tự động tải câu hỏi thật từ v_eval_content."Questions" cho tất cả các dạng bài của bài học đang mở
  useEffect(() => {
    if (!activeLesson) return;
    const pats = (activeLesson.patterns || []).filter(p => p && !isNonPedagogical(p.name));
    const missingIds = [];
    pats.forEach((pat) => {
      const sid = resolvePatternSkillId(activeLesson, pat);
      if (sid && dbQuestionsBySkill[sid] === undefined && !missingIds.includes(sid)) {
        missingIds.push(sid);
      }
    });
    if (missingIds.length === 0) return;

    let cancelled = false;
    setLoadingDbQuestions(true);
    Promise.all(
      missingIds.map((sid) =>
        contentService.getQuestionsBySkill(sid)
          .then((res) => {
            const rawList = Array.isArray(res) ? res : (res?.questions || res?.data?.questions || []);
            const mapped = rawList.map((q) => {
              const opts = Array.isArray(q.options) && q.options.length > 0
                ? q.options.map((o) => (typeof o === 'string' ? o : (o?.content ?? '')))
                : [q.optionA, q.optionB, q.optionC, q.optionD].filter((x) => x !== undefined && x !== null);
              const corrLetter = String(q.correctOption || 'A').trim().toUpperCase().slice(0, 1);
              const corrIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(corrLetter));
              return {
                id: q.questionId || q.id,
                stem: q.contentLatex || q.content || '',
                options: opts,
                correctIndex: corrIdx,
                solution: q.explanation || '',
                bloomLevel: Number(q.difficultyLevel || 2)
              };
            });
            return [sid, mapped];
          })
          .catch(() => [sid, []])
      )
    ).then((entries) => {
      if (cancelled) return;
      setDbQuestionsBySkill((prev) => {
        const next = { ...prev };
        entries.forEach(([sid, list]) => { next[sid] = list; });
        return next;
      });
    }).finally(() => {
      if (!cancelled) setLoadingDbQuestions(false);
    });
    return () => { cancelled = true; };
  }, [activeLesson, skillLookupMap]);

  const mergeExercisesWithDb = (les, pat) => {
    if (!pat) return [];
    const sid = resolvePatternSkillId(les, pat);
    const dbList = sid ? (dbQuestionsBySkill[sid] || []) : [];
    const localList = pat.exercises || [];
    const seen = new Set();
    const merged = [];
    [...dbList, ...localList].forEach((ex) => {
      const key = String(ex.id || (ex.stem || '').slice(0, 80));
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push({
        ...ex,
        patternName: pat.name,
        patternCode: pat.patternCode,
        bloomLevel: ex.bloomLevel || pat.bloomLevel || 2
      });
    });
    return merged;
  };

  // Danh sách bài tập thuộc bài học hiện tại (gộp CSDL thật + bộ lưu cục bộ)
  const activeLessonExercises = useMemo(() => {
    if (!activeLesson) return [];
    const list = [];
    (activeLesson.patterns || []).filter(p => !isNonPedagogical(p.name)).forEach(pat => {
      list.push(...mergeExercisesWithDb(activeLesson, pat));
    });
    return list;
  }, [activeLesson, dbQuestionsBySkill, skillLookupMap]);

  // Danh sách bài tập thuộc dạng bài đang chọn
  const activePatternExercises = useMemo(() => {
    if (!activePattern) return [];
    return mergeExercisesWithDb(activeLesson, activePattern);
  }, [activeLesson, activePattern, dbQuestionsBySkill, skillLookupMap]);

  // Danh sách bài tập thực tế hiển thị theo bộ lọc
  const displayedExercises = useMemo(() => {
    const base = exerciseFilterScope === 'pattern' ? activePatternExercises : activeLessonExercises;
    if (!selectedBloomFilter || selectedBloomFilter === 0) return base;
    return base.filter(ex => (ex.bloomLevel || 2) === selectedBloomFilter);
  }, [exerciseFilterScope, activeLessonExercises, activePatternExercises, selectedBloomFilter]);

  // Lấy các chunks bóc tách từ SGK thuộc về bài học đang chọn
  const currentLessonChunks = getChunksForLesson(activeLesson, sourceChunks, skeleton.subjectCode);

  // Tự động đồng bộ trang bắt đầu của bài học vào bộ phân trang SGK bóc tách
  useEffect(() => {
    if (activeLesson?.pageStart) {
      setOcrCurrentPage(activeLesson.pageStart);
    } else {
      setOcrCurrentPage(1);
    }
  }, [activeLesson?.title, activeLesson?.pageStart]);

  // Khớp trực tiếp chunk chuyên sâu của đúng Dạng bài đang chọn (nếu đã nạp chuẩn 4 phần từ bộ SGK thật)
  const matchedPatternChunkText = useMemo(() => {
    if (!activePattern || !Array.isArray(currentLessonChunks) || currentLessonChunks.length === 0) return '';
    const targetNorm = normalizeViText(cleanPrefix(activePattern.name, 'pattern') || activePattern.name || '');
    if (!targetNorm) return '';
    const found = currentLessonChunks.find((c) => {
      const pNorm = normalizeViText(cleanPrefix(c.patternName || '', 'pattern') || c.patternName || '');
      return pNorm && (pNorm === targetNorm || pNorm.includes(targetNorm) || targetNorm.includes(pNorm));
    });
    return (found?.text || found?.content || found?.contentSnippet || '').trim();
  }, [activePattern, currentLessonChunks]);

  const splitStructuredChunk = useMemo(() => {
    if (!matchedPatternChunkText) {
      return { theoryPart: '', methodPart: '' };
    }
    const match = matchedPatternChunkText.match(/^#{2,4}\s*3\./m);
    if (!match || match.index === undefined) {
      return { theoryPart: matchedPatternChunkText, methodPart: '' };
    }
    const splitIdx = match.index;
    return {
      theoryPart: matchedPatternChunkText.slice(0, splitIdx).trim(),
      methodPart: matchedPatternChunkText.slice(splitIdx).trim()
    };
  }, [matchedPatternChunkText]);

  // Tạo lý thuyết thực tế từ các chunks thực tế bóc tách từ SGK trong CSDL
  const rawTheoryFromChunks = splitStructuredChunk.theoryPart
    || buildTheoryFromChunks(currentLessonChunks, activeLesson?.title || '', skeleton.subjectCode);
  const theoryFromChunks = (!isGenericPlaceholder(rawTheoryFromChunks) && rawTheoryFromChunks) ? rawTheoryFromChunks : '';

  // Nội dung lý thuyết thuần của bài học: Ưu tiên 100% dữ liệu thực từ Chunks SGK (loại bỏ triệt để mọi placeholder generic)
  const activeTheoryContent = (activeLesson?.isEdited && activeLesson?.theory && !isGenericPlaceholder(activeLesson.theory))
    ? activeLesson.theory
    : (theoryFromChunks
       || (!isGenericPlaceholder(activeLesson?.theory) && activeLesson?.theory ? activeLesson.theory : '')
       || getDefaultLessonTheory(skeleton.subjectCode, skeleton.grade, activeLesson?.title || '')
       || 'Chưa có nội dung lý thuyết cho bài học này. Vui lòng nạp SGK hoặc bấm nút AI (✨) để sinh lý thuyết.');

  // Lý thuyết chuyên sâu riêng của Dạng bài
  const activePatternTheory = useMemo(() => {
    if (!activePattern) return '';
    if (activePattern.isEdited && activePattern.theoryRecap && !isGenericPlaceholder(activePattern.theoryRecap)) {
      return activePattern.theoryRecap;
    }
    if (splitStructuredChunk.theoryPart) {
      return splitStructuredChunk.theoryPart;
    }
    if (activePattern.theoryRecap && !isGenericPlaceholder(activePattern.theoryRecap)) {
      return activePattern.theoryRecap;
    }
    return '';
  }, [activePattern, splitStructuredChunk.theoryPart]);

  const activePatternMethod = useMemo(() => {
    if (!activePattern) return '';
    if (activePattern.isEdited && activePattern.solutionMethod && !isGenericPlaceholder(activePattern.solutionMethod)) {
      return activePattern.solutionMethod.trim();
    }
    if (splitStructuredChunk.methodPart) {
      return splitStructuredChunk.methodPart;
    }
    const explicitMethod = (activePattern.solutionMethod && !isGenericPlaceholder(activePattern.solutionMethod))
      ? activePattern.solutionMethod.trim()
      : ((activePattern.method && !isGenericPlaceholder(activePattern.method)) ? activePattern.method.trim() : '');

    const isDetailedMethod = explicitMethod && (activePattern.isEdited || explicitMethod.includes('\n') || explicitMethod.length >= 140);
    if (isDetailedMethod) {
      return explicitMethod;
    }

    const synthesized = buildMethodFromChunks(currentLessonChunks, activeLesson, activePattern, skeleton.subjectCode);
    if (synthesized && !isGenericPlaceholder(synthesized)) {
      return synthesized;
    }

    return explicitMethod;
  }, [activePattern, activeLesson, currentLessonChunks, skeleton.subjectCode, splitStructuredChunk.methodPart]);

  // Lý thuyết hiển thị: Ưu tiên lý thuyết của dạng bài nếu có, nếu chưa có thì lấy lý thuyết bài học
  const displayedTheoryContent = (activePatternTheory && activePatternTheory.trim())
    ? activePatternTheory
    : activeTheoryContent;

  useEffect(() => {
    setIsEditingTheory(false);
    setIsEditingMethod(false);
  }, [selectedChapterIdx, selectedLessonIdx, selectedPatternIdx]);

  // Tải danh sách nguồn SGK từ CSDL Supabase
  const loadIngestedSources = async () => {
    try {
      const res = await aiService.getIngestedTextbooks();
      const list = res?.sources || [];
      setIngestedSources(list);

      const savedLatest = getSavedTextbookData(selectedSourceIdRef.current, skeletonRef.current?.fileName)
        || getSavedTextbookData();

      const currentSidValid = selectedSourceIdRef.current && list.some(s => s.sourceId === selectedSourceIdRef.current);
      const savedSidValid = savedLatest?.sourceId && list.some(s => s.sourceId === savedLatest.sourceId);
      const savedFileMatch = !savedSidValid && savedLatest?.fileName
        ? list.find(s => s.fileName && s.fileName.toLowerCase().trim() === savedLatest.fileName.toLowerCase().trim())
        : null;

      // Nếu người dùng mới parse Bước 1 & đã lưu (chưa nạp Bước 2 vào DB): giữ nguyên bản đã lưu thay vì nhảy về sách khác
      if (!currentSidValid && !savedSidValid && !savedFileMatch && savedLatest?.skeleton?.hasUserSavedStructure && savedLatest.skeleton.chapters?.length > 0) {
        selectedSourceIdRef.current = '';
        setSelectedSourceId('');
        return;
      }

      const sidToLoad = currentSidValid
        ? selectedSourceIdRef.current
        : (savedSidValid
            ? savedLatest.sourceId
            : (savedFileMatch?.sourceId || list[0]?.sourceId));

      if (sidToLoad) {
        selectedSourceIdRef.current = sidToLoad;
        setSelectedSourceId(sidToLoad);
        await handleSelectSource(sidToLoad, list);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách SGK:', err);
    }
  };

  useEffect(() => {
    loadIngestedSources();
  }, []);

  const handleSelectSource = async (sourceId, sourceList = ingestedSources) => {
    if (!sourceId) {
      selectedSourceIdRef.current = '';
      setSelectedSourceId('');
      setSkeleton(prev => ({ ...prev, fileName: '', totalPages: 0, chapters: [] }));
      return;
    }
    const found = sourceList.find(s => s.sourceId === sourceId);
    if (!found) return;

    selectedSourceIdRef.current = sourceId;
    setSelectedSourceId(sourceId);
    saveStoredTextbookContext({ selectedSourceId: sourceId, fileName: found.fileName });

    try {
      // 0. Đọc dữ liệu đã lưu từ Persistent Storage theo sourceId (Mã định danh ID SGK dưới Database Supabase)
      const cachedData = getSavedTextbookData(sourceId, found.fileName);

      const savedPatternData = new Map();
      if (cachedData?.skeleton?.chapters) {
        cachedData.skeleton.chapters.forEach(ch => {
          (ch.lessons || []).forEach(les => {
            (les.patterns || []).forEach(pat => {
              const pKey = `${cleanPrefix(les.title, 'lesson').toLowerCase()}__${cleanPrefix(pat.name, 'pattern').toLowerCase()}`;
              savedPatternData.set(pKey, {
                bloomLevel: pat.bloomLevel,
                exercises: pat.exercises || []
              });
            });
          });
        });
      }

      const res = await aiService.getTextbookChunks(sourceId);
      const chunks = res?.chunks || [];
      setSourceChunks(chunks);

      // Nhận diện chương & bài học từ chunks (lọc sạch 100% bìa sách, trang trắng, N/A)
      const chapterMap = new Map();
      chunks.forEach(chunk => {
        const sType = (chunk.sectionType || '').toUpperCase();
        if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return;

        const rawCName = chunk.chapterName?.trim() || '';
        const rawLName = chunk.lessonName?.trim() || '';
        const rawPName = chunk.patternName?.trim() || '';

        // Bỏ qua nếu cả bài học và dạng bài đều là nhãn phi sư phạm
        if (isNonPedagogical(rawLName) && (isNonPedagogical(rawPName) || !rawPName)) return;

        const cName = !isNonPedagogical(rawCName) && rawCName ? rawCName : 'Chủ đề 1: Kiến thức trọng tâm';
        const lName = !isNonPedagogical(rawLName) && rawLName ? rawLName : '';

        if (!lName) return;

        if (!chapterMap.has(cName)) {
          chapterMap.set(cName, new Map());
        }
        const lessonMap = chapterMap.get(cName);
        if (!lessonMap.has(lName)) {
          lessonMap.set(lName, {
            lessonNumber: lessonMap.size + 1,
            title: lName,
            status: 'ACCEPTED',
            pageStart: chunk.pageNumber,
            pageEnd: chunk.pageNumber,
            keyFormulas: [],
            patterns: []
          });
        }
        const lesObj = lessonMap.get(lName);
        if (chunk.pageNumber < lesObj.pageStart) lesObj.pageStart = chunk.pageNumber;
        if (chunk.pageNumber > lesObj.pageEnd) lesObj.pageEnd = chunk.pageNumber;

        // Chỉ nạp dạng bài sư phạm
        if (rawPName && !isNonPedagogical(rawPName) && !lesObj.patterns.some(p => p.name === rawPName)) {
          const pKey = `${cleanPrefix(lName, 'lesson').toLowerCase()}__${cleanPrefix(rawPName, 'pattern').toLowerCase()}`;
          const saved = savedPatternData.get(pKey);
          lesObj.patterns.push({
            patternCode: `P${lesObj.patterns.length + 1}`,
            skillId: chunk.skillId || '',
            name: rawPName,
            bloomLevel: saved?.bloomLevel || 2,
            status: 'ACCEPTED',
            description: '',
            method: '',
            exercises: saved?.exercises || []
          });
        }
      });

      const rawChapters = [];
      let chIdx = 1;

      // Tự động nhận diện chuẩn xác Môn học & Khối lớp từ metadata nguồn hoặc tên file
      let targetSub = found.subjectCode;
      let targetG = found.grade;
      const fNameUpper = (found.fileName || '').toUpperCase();
      if (!targetSub || targetSub === 'PHYS') {
        if (fNameUpper.includes('HÓA') || fNameUpper.includes('HOÁ') || fNameUpper.includes('HOA') || fNameUpper.includes('CHEM')) {
          targetSub = 'CHEM';
        } else if (fNameUpper.includes('TOÁN') || fNameUpper.includes('TOAN') || fNameUpper.includes('MATH')) {
          targetSub = 'MATH';
        } else if (fNameUpper.includes('SINH') || fNameUpper.includes('BIO')) {
          targetSub = 'BIO';
        } else if (fNameUpper.includes('VẬT LÍ') || fNameUpper.includes('VẬT LÝ') || fNameUpper.includes('VAT LI') || fNameUpper.includes('VL') || fNameUpper.includes('PHYS')) {
          targetSub = 'PHYS';
        }
      }
      if (!targetG || targetG === 10) {
        if (fNameUpper.includes('12') || fNameUpper.includes('L12')) targetG = 12;
        else if (fNameUpper.includes('11') || fNameUpper.includes('L11')) targetG = 11;
        else if (fNameUpper.includes('10') || fNameUpper.includes('L10')) targetG = 10;
      }

      const subNameMap = {
        'CHEM': 'Hóa học',
        'MATH': 'Toán học',
        'PHYS': 'Vật lí',
        'BIO': 'Sinh học'
      };
      const targetSubName = subNameMap[targetSub] || found.subjectName || skeleton.subjectName;
      const preset = getGdptPreset(targetSub, targetG);

      chapterMap.forEach((lessonMap, cName) => {
        const lessons = Array.from(lessonMap.values()).filter(l => !isNonPedagogical(l.title));
        if (lessons.length === 0) return;
        const minPage = Math.min(...lessons.map(l => l.pageStart));
        const maxPage = Math.max(...lessons.map(l => l.pageEnd));

        lessons.forEach((les, lIdx) => {
          les.lessonNumber = lIdx + 1;
          if (!les.keyFormulas || les.keyFormulas.length === 0) {
            const cleanedLesTitle = cleanPrefix(les.title, 'lesson').toLowerCase();
            let matchedLessonPreset = null;
            if (preset?.chapters) {
              for (const pCh of preset.chapters) {
                const pLes = (pCh.lessons || []).find(pl => {
                  const plClean = cleanPrefix(pl.title, 'lesson').toLowerCase();
                  return cleanedLesTitle.includes(plClean) || plClean.includes(cleanedLesTitle);
                });
                if (pLes) {
                  matchedLessonPreset = pLes;
                  break;
                }
              }
            }

            if (!les.keyFormulas || les.keyFormulas.length === 0) {
              let matchedFormulas = matchedLessonPreset?.keyFormulas || [];
              if (matchedFormulas.length === 0 && (targetSub === 'PHYS' || targetSub === 'Vật lí')) {
                matchedFormulas = ['v = \\frac{s}{t}', 'a = \\frac{\\Delta v}{\\Delta t}', 'F = m \\cdot a'];
              }
              les.keyFormulas = matchedFormulas;
            }

            // Nạp và đa dạng hóa dạng bài (Bloom L1 - L4) từ preset nếu bài học chỉ có <= 1 dạng chung chung
            const currentValidPatterns = (les.patterns || []).filter(p => !isNonPedagogical(p.name));
            const isSingleOrGeneric = currentValidPatterns.length <= 1 && (
              currentValidPatterns.length === 0 ||
              currentValidPatterns[0].name.toLowerCase().includes('kiến thức') ||
              currentValidPatterns[0].name.toLowerCase().includes('cốt lõi') ||
              currentValidPatterns[0].name.toLowerCase().includes('trọng tâm') ||
              currentValidPatterns[0].name.toLowerCase().includes('dạng 1')
            );

            if (isSingleOrGeneric && matchedLessonPreset?.patterns?.length > 0) {
              const existingExercises = currentValidPatterns[0]?.exercises || [];
              les.patterns = matchedLessonPreset.patterns.map((presetPat, pIdx) => {
                const pKey = `${cleanPrefix(les.title, 'lesson').toLowerCase()}__${cleanPrefix(presetPat.name, 'pattern').toLowerCase()}`;
                const saved = savedPatternData.get(pKey);
                return {
                  ...presetPat,
                  patternCode: `P${pIdx + 1}`,
                  status: 'ACCEPTED',
                  bloomLevel: saved?.bloomLevel || presetPat.bloomLevel || 2,
                  exercises: saved?.exercises || (pIdx === 0 && existingExercises.length > 0 ? existingExercises : (presetPat.exercises || []))
                };
              });
            } else if (les.patterns?.length > 0) {
              const allSameL2 = les.patterns.every(p => !p.bloomLevel || p.bloomLevel === 2);
              les.patterns = les.patterns.map((p, pIdx) => {
                const pKey = `${cleanPrefix(les.title, 'lesson').toLowerCase()}__${cleanPrefix(p.name, 'pattern').toLowerCase()}`;
                const saved = savedPatternData.get(pKey);
                return {
                  ...p,
                  patternCode: `P${pIdx + 1}`,
                  bloomLevel: saved?.bloomLevel || (allSameL2 ? Math.min(4, Math.max(1, pIdx + 1)) : (p.bloomLevel || 2)),
                  exercises: saved?.exercises || p.exercises || []
                };
              });
            }
          }

          // Gán lý thuyết thuần & công thức KaTeX từ Vector Chunks thực tế hoặc bộ chuẩn sư phạm (loại bỏ hoàn toàn generic placeholder)
          const chunksOfLesson = getChunksForLesson(les, chunks, targetSub);
          if (!les.keyFormulas || les.keyFormulas.length === 0) {
            const extractedFormulas = extractKeyFormulasFromChunks(chunksOfLesson);
            if (extractedFormulas.length > 0) {
              les.keyFormulas = extractedFormulas;
            }
          }
          let synTheory = '';
          if (chunksOfLesson.length > 0) {
            synTheory = buildTheoryFromChunks(chunksOfLesson, les.title, targetSub);
          }
          if (!synTheory || isGenericPlaceholder(synTheory)) {
            synTheory = getDefaultLessonTheory(targetSub, targetG, les.title) || '';
          }
          les.theory = synTheory;
        });

        rawChapters.push({
          chapterNumber: chIdx,
          title: cName,
          status: 'ACCEPTED',
          pageStart: minPage,
          pageEnd: maxPage,
          lessons
        });
        chIdx++;
      });

      // Sắp xếp các chương tuần tự theo số trang tăng dần (khắc phục xáo trộn thứ tự chương)
      rawChapters.sort((a, b) => (a.pageStart || 0) - (b.pageStart || 0));
      rawChapters.forEach((ch, idx) => {
        ch.chapterNumber = idx + 1;
      });

      const detectedChapters = filterPedagogicalChapters(rawChapters);

      const fallbackChapters = (preset?.chapters || []).map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).map(les => ({
          ...les,
          patterns: (les.patterns || []).map(pat => {
            const pKey = `${cleanPrefix(les.title, 'lesson').toLowerCase()}__${cleanPrefix(pat.name, 'pattern').toLowerCase()}`;
            const saved = savedPatternData.get(pKey);
            return {
              ...pat,
              bloomLevel: saved?.bloomLevel || pat.bloomLevel || 2,
              exercises: saved?.exercises || pat.exercises || []
            };
          })
        }))
      }));

      const finalChapters = resolvePersistedChapters(detectedChapters, cachedData, fallbackChapters);

      setSkeleton(prev => {
        const next = {
          ...prev,
          fileName: found.fileName,
          subjectCode: targetSub,
          subjectName: targetSubName,
          grade: targetG,
          bookEdition: found.bookEdition || cachedData?.skeleton?.bookEdition || prev.bookEdition,
          totalPages: found.totalPages || cachedData?.skeleton?.totalPages || prev.totalPages,
          hasUserSavedStructure: Boolean(cachedData?.skeleton?.hasUserSavedStructure),
          chapters: finalChapters.length > 0 ? finalChapters : prev.chapters
        };
        skeletonRef.current = next;
        return next;
      });

      saveStoredTextbookContext({
        selectedSourceId: sourceId,
        fileName: found.fileName,
        subjectCode: targetSub,
        subjectName: targetSubName,
        grade: targetG
      });

      setSelectedChapterIdx(0);
      setSelectedLessonIdx(0);
      setSelectedPatternIdx(0);
    } catch (err) {
      console.warn('Lỗi lấy chunks:', err);
    }
  };

  const updateLesson = (updater) => {
    if (isLocked || !activeChapter || !activeLesson) return;
    setSkeleton(prev => {
      const chapters = prev.chapters.map(ch => {
        if (ch.chapterNumber !== activeChapter.chapterNumber && ch.title !== activeChapter.title) {
          return ch;
        }
        const lessons = (ch.lessons || []).map(les => {
          if (les.lessonNumber !== activeLesson.lessonNumber && les.title !== activeLesson.title) {
            return les;
          }
          return updater({ ...les });
        });
        return { ...ch, lessons };
      });
      const next = { ...prev, chapters };
      skeletonRef.current = next;
      saveTextbookData({
        sourceId: selectedSourceId,
        fileName: next.fileName,
        skeleton: next
      });
      return next;
    });
  };

  const toggleLessonStatus = (targetLesson) => {
    updateLesson(les => ({
      ...les,
      status: les.status === 'ACCEPTED' ? 'PENDING_REVIEW' : 'ACCEPTED'
    }));
    toast.success('Đã cập nhật trạng thái kiểm duyệt Bài học!');
  };

  const handleAddNewChapter = () => {
    setSkeleton(prev => {
      const nextNum = (prev.chapters || []).length + 1;
      return {
        ...prev,
        chapters: [
          ...(prev.chapters || []),
          {
            chapterNumber: nextNum,
            title: `Chương ${nextNum}: Tiêu đề chương mới`,
            status: 'ACCEPTED',
            pageStart: 1,
            pageEnd: 20,
            lessons: [
              {
                lessonNumber: 1,
                title: 'Bài 1: Bài học trọng tâm',
                status: 'ACCEPTED',
                pageStart: 1,
                pageEnd: 15,
                theory: '',
                keyFormulas: [],
                patterns: [
                  {
                    patternCode: 'P1',
                    name: 'Dạng 1: Dạng bài cơ bản',
                    bloomLevel: 2,
                    status: 'ACCEPTED',
                    description: 'Mô tả dạng bài',
                    method: 'Phương pháp giải',
                    exercises: []
                  }
                ]
              }
            ]
          }
        ]
      };
    });
    toast.success('Đã thêm Chương mới vào cây thư mục!');
  };

  const handleAddNewLessonToChapter = (cIdx) => {
    setSkeleton(prev => {
      const chapters = [...prev.chapters];
      const ch = { ...chapters[cIdx] };
      const nextNum = (ch.lessons || []).length + 1;
      ch.lessons = [
        ...(ch.lessons || []),
        {
          lessonNumber: nextNum,
          title: `Bài ${nextNum}: Tiêu đề bài học mới`,
          status: 'ACCEPTED',
          pageStart: ch.pageStart || 1,
          pageEnd: (ch.pageStart || 1) + 10,
          theory: '',
          keyFormulas: [],
          patterns: []
        }
      ];
      chapters[cIdx] = ch;
      return { ...prev, chapters };
    });
    setExpandedChapters(prev => ({ ...prev, [cIdx]: true }));
    toast.success('Đã thêm Bài học mới vào chương!');
  };

  const handleAddNewPatternToLesson = (cIdx, lIdx) => {
    setSkeleton(prev => {
      const chapters = [...prev.chapters];
      const ch = { ...chapters[cIdx] };
      const lessons = [...ch.lessons];
      const les = { ...lessons[lIdx] };
      const nextNum = (les.patterns || []).length + 1;
      les.patterns = [
        ...(les.patterns || []),
        {
          patternCode: `P${nextNum}`,
          name: `Dạng ${nextNum}: Dạng bài mới`,
          bloomLevel: 2,
          status: 'ACCEPTED',
          description: 'Mô tả dạng bài',
          method: 'Phương pháp giải',
          exercises: []
        }
      ];
      lessons[lIdx] = les;
      ch.lessons = lessons;
      chapters[cIdx] = ch;
      return { ...prev, chapters };
    });
    setExpandedLessons(prev => ({ ...prev, [`${cIdx}_${lIdx}`]: true }));
    toast.success('Đã thêm Dạng bài mới vào bài học!');
  };

  const handleAiEnrichTheory = async (targetPatIdx = selectedPatternIdx) => {
    if (!activeLesson) return;
    setEnrichingKnowledge(true);
    const targetPattern = validPatterns[targetPatIdx] || activePattern;
    const patClean = cleanPrefix(targetPattern?.name || 'Trọng tâm bài học', 'pattern');
    const lesClean = cleanPrefix(activeLesson.title, 'lesson');

    toast.info(`✨ AI đang phân tích và mở rộng kiến thức lý thuyết & phương pháp cho "${patClean}"...`);
    try {
      let enriched = null;
      try {
        enriched = await aiService.analyzePatternWithAi({
          patternName: targetPattern?.name || `Toàn bộ lý thuyết bài học ${activeLesson.title}`,
          lessonName: activeLesson.title,
          domainName: `${skeleton.subjectName} Lớp ${skeleton.grade}`,
          context: (activeLesson.keyFormulas || []).join('\n')
        });
      } catch (apiErr) {
        console.warn('API call failed or offline, applying intelligent pedagogical synthesis fallback:', apiErr);
      }

      // Tạo nội dung lý thuyết và phương pháp giải chuẩn sư phạm GDPT 2018
      const theoryRecap = enriched?.theory_recap || `### 1. Khái Niệm & Định Lý Trọng Tâm (${patClean})
- **Khái niệm bản chất**: Phân tích cốt lõi của dạng bài "${patClean}" thuộc bài học **${lesClean}** (${skeleton.subjectName} Lớp ${skeleton.grade}).
- **Định luật & Hệ thức**: Vận dụng chuẩn xác các tiên đề, định nghĩa và công thức toán học/khoa học tự nhiên theo chương trình GDPT 2018.
- **Phạm vi áp dụng**: Nhận diện dấu hiệu đặc trưng trong đề thi đánh giá năng lực V-ACT và các kỳ thi chuẩn hóa.`;

      const solutionMethod = enriched?.solution_method || `### 2. Phương Pháp Giải & Các Bước Vận Dụng Chuẩn Mực
- **Bước 1 (Nhận dạng & Phân tích)**: Đọc kỹ đề bài, xác định từ khóa đặc trưng của dạng "${patClean}", phân loại dữ kiện đề bài cho và yêu cầu cần tìm.
- **Bước 2 (Lựa chọn công thức)**: Thiết lập mối liên hệ giữa các đại lượng bằng các công thức và định luật trọng tâm của bài học.
- **Bước 3 (Thực hiện biến đổi)**: Triển khai các bước tính toán, biến đổi đại số hoặc phân tích đồ thị/bảng số liệu một cách khoa học.
- **Bước 4 (Biện luận & Kết luận)**: Đối chiếu với điều kiện bài toán, loại trừ các bẫy thường gặp và chọn đáp án chính xác.`;

      updateLesson(les => {
        const patterns = [...(les.patterns || [])];
        if (targetPattern && patterns[targetPatIdx]) {
          patterns[targetPatIdx] = {
            ...patterns[targetPatIdx],
            theoryRecap: enriched?.theory_recap || theoryRecap,
            description: enriched?.theory_recap || theoryRecap,
            method: enriched?.solution_method || solutionMethod,
            solutionMethod: enriched?.solution_method || solutionMethod,
            bloomLevel: enriched?.bloom_level || patterns[targetPatIdx].bloomLevel || 2,
            status: 'ACCEPTED',
            isEdited: true
          };
        }
        return {
          ...les,
          theory: les.theory ? `${les.theory}\n\n---\n\n${theoryRecap}` : theoryRecap,
          patterns,
          status: 'ACCEPTED',
          isEdited: true
        };
      });

      toast.success(`✨ Đã mở rộng lý thuyết & phương pháp giải cho Dạng "${patClean}"!`);
    } catch (err) {
      toast.error('Lỗi khi mở rộng nội dung AI: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setEnrichingKnowledge(false);
    }
  };

  const handleSaveTheory = () => {
    updateLesson(les => {
      const patterns = [...(les.patterns || [])];
      if (activePattern && patterns[selectedPatternIdx]) {
        patterns[selectedPatternIdx] = {
          ...patterns[selectedPatternIdx],
          theoryRecap: editedTheory,
          description: editedTheory,
          isEdited: true
        };
      }
      return {
        ...les,
        theory: editedTheory,
        patterns,
        isEdited: true
      };
    });
    setIsEditingTheory(false);
    toast.success('Đã lưu nội dung lý thuyết thành công!');
  };

  const handleSaveMethod = () => {
    if (!activePattern) return;
    updateLesson(les => {
      const patterns = [...(les.patterns || [])];
      if (patterns[selectedPatternIdx]) {
        patterns[selectedPatternIdx] = {
          ...patterns[selectedPatternIdx],
          method: editedMethod,
          solutionMethod: editedMethod,
          isEdited: true
        };
      }
      return {
        ...les,
        patterns,
        isEdited: true
      };
    });
    setIsEditingMethod(false);
    toast.success('Đã lưu phương pháp giải dạng bài thành công!');
  };

  const handleOpenStudio = (pat = activePattern) => {
    saveToStorage(skeleton, selectedSourceId);
    saveStoredTextbookContext({
      selectedSourceId,
      fileName: skeleton.fileName,
      subjectCode: skeleton.subjectCode,
      subjectName: skeleton.subjectName,
      grade: skeleton.grade,
      bookEdition: skeleton.bookEdition,
      selectedChapterIdx,
      selectedLessonIdx,
      selectedPatternIdx,
      activeChapterTitle: activeChapter?.title || '',
      activeLessonTitle: activeLesson?.title || '',
      activePatternName: (pat || activePattern)?.name || '',
      activeTheoryPreview: displayedTheoryContent || '',
      activeMethodPreview: activePatternMethod || ''
    });
    if (onNavigateTab) {
      onNavigateTab('textbook-studio');
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedSourceId) return;
    const bookName = skeleton.fileName || `${skeleton.subjectName} Lớp ${skeleton.grade}`;
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa cuốn sách "${bookName}" và toàn bộ ${sourceChunks.length} chunks tri thức khỏi hệ thống? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      await aiService.deleteTextbookSource(selectedSourceId);
      clearSavedTextbookData(selectedSourceId, skeleton.fileName || bookName);
      toast.success(`Đã xóa thành công cuốn sách "${bookName}" và đồng bộ xóa cache Khung chương trình!`);

      const updatedSources = ingestedSources.filter(s => s.sourceId !== selectedSourceId);
      setIngestedSources(updatedSources);

      if (updatedSources.length > 0) {
        setSelectedSourceId(updatedSources[0].sourceId);
        await handleSelectSource(updatedSources[0].sourceId, updatedSources);
      } else {
        setSelectedSourceId('');
        setSourceChunks([]);
        setSkeleton(prev => ({ ...prev, fileName: '', totalPages: 0, chapters: [] }));
      }
    } catch (err) {
      toast.error('Lỗi khi xóa cuốn sách: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleSyncToCurriculum = async () => {
    if (!skeleton?.chapters || validChapters.length === 0) {
      toast.warning('Chưa có dữ liệu Chương / Bài học SGK để đồng bộ sang Khung Chương Trình!');
      return;
    }
    setSyncingCurriculum(true);
    toast.info(`⏳ Đang đồng bộ ${validChapters.length} Chương SGK "${skeleton.subjectName} Lớp ${skeleton.grade}" sang CSDL Khung Chương Trình...`);
    try {
      await syncTextbookSkeletonToCurriculum({
        skeleton,
        chunks: sourceChunks,
        contentService
      });
      toast.success(`🎉 Đã đồng bộ 100% Lý thuyết, Phương pháp & Câu hỏi SGK sang Khung Chương Trình & Dàn Kiến Thức!`);
    } catch (err) {
      toast.error('Lỗi đồng bộ Khung Chương Trình: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSyncingCurriculum(false);
    }
  };

  const handleResetToStandardGdpt = () => {
    const preset = getGdptPreset(skeleton.subjectCode, skeleton.grade);
    if (!preset || !preset.chapters) {
      toast.error(`Chưa có preset chuẩn GDPT 2018 cho môn ${skeleton.subjectName} Lớp ${skeleton.grade}`);
      return;
    }
    const sanitizedPresetChapters = filterPedagogicalChapters(preset.chapters).map(ch => ({
      ...ch,
      lessons: (ch.lessons || []).map(les => ({
        ...les,
        theory: les.theory || getDefaultLessonTheory(skeleton.subjectCode, skeleton.grade, les.title)
      }))
    }));

    setSkeleton(prev => ({
      ...prev,
      bookEdition: preset.bookEdition || prev.bookEdition,
      chapters: sanitizedPresetChapters
    }));
    setSelectedChapterIdx(0);
    setSelectedLessonIdx(0);
    setSelectedPatternIdx(0);
    toast.success(`Đã chuẩn hóa cây cấu trúc ${preset.subjectName} Lớp ${preset.grade} theo GDPT 2018!`);
  };

  // Tổng số trang và phạm vi trang cho bộ phân trang SGK bóc tách
  const totalBookPages = skeleton.totalPages 
    || (ingestedSources.find(s => s.sourceId === selectedSourceId)?.totalPages) 
    || 122;

  const minOcrPage = ocrScope === 'lesson' && activeLesson?.pageStart ? activeLesson.pageStart : 1;
  const maxOcrPage = ocrScope === 'lesson' && activeLesson?.pageEnd ? activeLesson.pageEnd : totalBookPages;

  // Nếu sidebar hoặc mục lục đang thu gọn: hiển thị 2 trang; nếu cả 2 đều mở: 1 trang
  const pageSize = (isSidebarCollapsed || isTocCollapsed) ? 2 : 1;
  const safeCurrentPage = Math.min(Math.max(minOcrPage, ocrCurrentPage), maxOcrPage);

  const handlePrevOcrPage = () => {
    setOcrCurrentPage(prev => Math.max(minOcrPage, prev - pageSize));
  };

  const handleNextOcrPage = () => {
    setOcrCurrentPage(prev => Math.min(maxOcrPage - (pageSize - 1), prev + pageSize));
  };

  // Lọc danh sách phiên bản SGK theo đúng Môn học + Khối lớp đang chọn
  const filteredSourcesForSubjectGrade = useMemo(() => {
    const targetSub = normalizeSubjectKey(skeleton.subjectCode);
    const targetGrade = Number(skeleton.grade);
    return (ingestedSources || []).filter(
      (s) => normalizeSubjectKey(s.subjectCode) === targetSub && Number(s.grade) === targetGrade
    );
  }, [ingestedSources, skeleton.subjectCode, skeleton.grade]);

  const handleChangeSubjectOrGrade = async (newSubCode, newGrade) => {
    const normSub = normalizeSubjectKey(newSubCode);
    const numGrade = Number(newGrade);
    const sub = SUBJECT_OPTIONS.find(s => s.code === normSub);
    const newSubName = sub?.name || normSub;

    // Ưu tiên map trực tiếp tới cuốn SGK đã nạp khớp đúng Môn học + Khối lớp
    const matchedBook = (ingestedSources || []).find(
      (s) => normalizeSubjectKey(s.subjectCode) === normSub && Number(s.grade) === numGrade
    );

    setSelectedChapterIdx(0);
    setSelectedLessonIdx(0);
    setSelectedPatternIdx(0);

    if (matchedBook) {
      await handleSelectSource(matchedBook.sourceId, ingestedSources);
      return;
    }

    // Nếu chưa có bản nạp DB cho môn/lớp này thì load khung GDPT 2018 mặc định
    selectedSourceIdRef.current = '';
    setSelectedSourceId('');
    setSourceChunks([]);
    const newPreset = getGdptPreset(normSub, numGrade);
    setSkeleton(prev => ({
      ...prev,
      fileName: '',
      subjectCode: normSub,
      subjectName: newSubName,
      grade: numGrade,
      totalPages: 0,
      chapters: (newPreset?.chapters && newPreset.chapters.length > 0) ? newPreset.chapters : []
    }));
  };

  // Thống kê toàn cuốn sách
  const totalLessonsInBook = validChapters.reduce((acc, c) => acc + (c.lessons?.filter(l => !isNonPedagogical(l.title)).length || 0), 0);
  const totalPatternsInBook = validChapters.reduce((acc, c) => acc + (c.lessons?.reduce((lAcc, l) => lAcc + (l.patterns?.filter(p => !isNonPedagogical(p.name)).length || 0), 0) || 0), 0);

  // Render thẻ 1 trang con trong bộ bóc tách SGK
  const renderOcrPageCard = (pageNum) => {
    const pageChunks = (sourceChunks || []).filter(c => Number(c.pageNumber) === pageNum);
    const sTypes = [...new Set(pageChunks.map(c => c.sectionType).filter(Boolean))];

    return (
      <div key={pageNum} className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col min-h-[360px]">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-xs shadow-2xs">
              Trang {pageNum}
            </span>
            <span className="text-[11px] font-bold text-slate-600">
              {pageChunks.length} khối nội dung
            </span>
          </div>
          {sTypes.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {sTypes.map((st, i) => (
                <span key={i} className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {st}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-[440px] pr-1">
          {pageChunks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <FileText className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-600">Trang {pageNum}</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Trang bài tập, sơ đồ hình ảnh lớn hoặc chưa có đoạn text bóc tách qua Vision AI.
              </p>
            </div>
          ) : (
            pageChunks.map((chunk, cIdx) => (
              <div key={chunk.chunkId || cIdx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">Đoạn #{chunk.chunkIndex || cIdx + 1}</span>
                  {chunk.patternName && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {chunk.patternName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-800 leading-relaxed overflow-x-auto">
                  <MathText text={chunk.text || chunk.content || ''} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER ĐIỀU HƯỚNG */}
      <header className="bg-white border-b border-emerald-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          )}
          <div>
            <h1 className="text-base font-black text-emerald-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Sách Giáo Khoa Chuẩn (GDPT 2018)</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Cây mục lục chuẩn hóa, lý thuyết thuần chuyên sâu và nội dung bóc tách đa trang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={syncingCurriculum || validChapters.length === 0}
            onClick={handleSyncToCurriculum}
            title="Đẩy toàn bộ Lý thuyết, Phương pháp & Câu hỏi SGK hiện tại vào CSDL Khung Chương Trình & Dàn Kiến Thức"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingCurriculum ? 'animate-spin' : ''}`} />
            <span>{syncingCurriculum ? 'Đang đồng bộ...' : 'Đồng Bộ Khung CT'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToStandardGdpt}
            title="Đồng bộ cấu trúc GDPT 2018"
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Chuẩn Hóa GDPT 2018</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('ingest')}
            title="Chuyển sang trang nạp & bóc tách SGK mới"
            className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <span>Sang Trang Nạp SGK</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenStudio()}
            title="Mở Studio biên soạn bài học & câu hỏi cho dạng bài đang chọn"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Mở Studio Biên Soạn</span>
          </button>

          <button
            type="button"
            onClick={() => setSkeleton(prev => ({ ...prev, isVersionLocked: !prev.isVersionLocked }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isLocked
                ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-100'
                : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isLocked ? `Đã Khóa (${skeleton.versionTag})` : `Mở Khóa (${skeleton.versionTag})`}</span>
          </button>
        </div>
      </header>

      {/* THÂN TRANG */}
      <div className="px-6 py-4 space-y-4">
        {/* 2. KHỐI TIÊU ĐỀ CƠ BẢN CỦA SGK (CHIỀU NGANG BẰNG 2 KHỐI BÊN DƯỚI CỘNG LẠI) */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200/90 p-5 shadow-xs flex flex-col gap-4">
          {/* Hàng 1: Tiêu đề cuốn sách, tập tin nguồn, trạng thái và bộ chọn SGK */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-emerald-100 pb-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-emerald-950 truncate">
                    Sách Giáo Khoa {skeleton.subjectName} Lớp {skeleton.grade} – Bộ {skeleton.bookEdition}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black inline-flex items-center gap-1 border ${
                    skeleton.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {skeleton.status === 'ACCEPTED' ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Clock className="w-3 h-3 text-amber-700" />}
                    <span>{skeleton.status === 'ACCEPTED' ? 'Đã duyệt SGK Chuẩn' : 'Chờ review (Pending)'}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-semibold text-slate-700">Tập tin nguồn:</span>
                  <span className="font-mono text-emerald-800 font-bold">{skeleton.fileName || 'SGK Chuẩn GDPT 2018 (Hệ thống)'}</span>
                  <span>•</span>
                  <span>Niên khóa: <strong className="text-slate-800">{skeleton.versionTag}</strong></span>
                  <span>•</span>
                  <span>Tổng số trang: <strong className="text-emerald-900">{totalBookPages} trang</strong></span>
                </div>
              </div>
            </div>

            {/* Bộ chọn phiên bản SGK theo đúng Môn học & Khối lớp đang lọc */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-xs font-black text-slate-700 shrink-0">Phiên bản SGK:</span>
                <select
                  value={selectedSourceId}
                  onChange={e => handleSelectSource(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs font-bold text-emerald-950 max-w-xs truncate cursor-pointer outline-none"
                >
                  {filteredSourcesForSubjectGrade.length === 0 ? (
                    <option value="">-- Chưa nạp bản SGK cho {skeleton.subjectName} Lớp {skeleton.grade} --</option>
                  ) : (
                    filteredSourcesForSubjectGrade.map(s => (
                      <option key={s.sourceId} value={s.sourceId}>
                        {s.fileName} ({s.totalPages} trang)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedSourceId && (
                <button
                  type="button"
                  onClick={handleDeleteBook}
                  title="Xóa cuốn sách này khỏi kho CSDL"
                  className="px-3 py-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-105"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa sách</span>
                </button>
              )}
            </div>
          </div>

          {/* Hàng 2: Lưới thông số nhanh và bộ lọc Môn học / Khối lớp (map trực tiếp sang bản SGK tương ứng) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-emerald-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">Môn học</span>
              <select
                value={normalizeSubjectKey(skeleton.subjectCode)}
                onChange={e => handleChangeSubjectOrGrade(e.target.value, skeleton.grade)}
                className="w-full text-xs font-bold text-emerald-950 bg-transparent outline-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-emerald-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">Khối lớp</span>
              <select
                value={skeleton.grade}
                onChange={e => handleChangeSubjectOrGrade(skeleton.subjectCode, Number(e.target.value))}
                className="w-full text-xs font-bold text-emerald-950 bg-transparent outline-none cursor-pointer"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Bộ sách</span>
              <input
                disabled={isLocked}
                value={skeleton.bookEdition}
                onChange={e => setSkeleton(prev => ({ ...prev, bookEdition: e.target.value }))}
                placeholder="Cánh Diều..."
                className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none"
              />
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Niên khóa</span>
              <input
                disabled={isLocked}
                value={skeleton.versionTag}
                onChange={e => setSkeleton(prev => ({ ...prev, versionTag: e.target.value }))}
                placeholder="2025-2026"
                className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent outline-none"
              />
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Quy mô cấu trúc</span>
              <span className="text-xs font-bold text-slate-900">
                {validChapters.length} Chương • {totalLessonsInBook} Bài
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Dạng bài & OCR</span>
              <span className="text-xs font-bold text-emerald-800">
                {totalPatternsInBook} Dạng • {sourceChunks.length} Chunks
              </span>
            </div>
          </div>
        </div>

        {/* 3. KHÔNG GIAN SƯ PHẠM 2 CỘT: CÂY MỤC LỤC BÊN TRÁI & NỘI DUNG LÝ THUYẾT + SGK PARSE BÊN PHẢI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* CỘT BÊN TRÁI: CÂY MỤC LỤC CẤU TRÚC SÁCH PHÂN CẤP (CHO PHÉP THU GỌN NHƯ SIDEBAR) */}
          {isTocCollapsed ? (
            <div className="lg:col-span-1 bg-white rounded-3xl border border-emerald-200/80 p-3 shadow-xs flex flex-col items-center gap-4 transition-all">
              <button
                type="button"
                onClick={() => setIsTocCollapsed(false)}
                title="Mở rộng mục lục SGK"
                className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer transition-all shadow-2xs hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 [writing-mode:vertical-lr] rotate-180 select-none py-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Mục Lục SGK ({validChapters.length} Chương)</span>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-4 bg-white rounded-3xl border border-emerald-200/80 p-4 shadow-xs flex flex-col gap-3 transition-all">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Mục Lục Cấu Trúc SGK ({validChapters.length} Chương)
                    </h2>
                    <span className="text-[10px] text-slate-400 font-medium">Chương ▾ Bài học ▾ Dạng bài</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={handleAddNewChapter}
                      className="px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-emerald-200"
                    >
                      <Plus className="w-3 h-3" /> Thêm chương
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsTocCollapsed(true)}
                    title="Thu gọn thanh mục lục"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Danh sách các Chương & Bài học (Mở rộng tự nhiên theo toàn bộ danh sách chương) */}
            <div className="space-y-3 pr-1">
              {validChapters.map((ch, cIdx) => {
                const isChapterExpanded = expandedChapters[cIdx] !== false;
                const isChapterActive = cIdx === selectedChapterIdx;
                const lessonsInChapter = (ch.lessons || []).filter(l => !isNonPedagogical(l.title));
                const totalPatterns = lessonsInChapter.reduce((acc, l) => acc + (l.patterns?.filter(p => !isNonPedagogical(p.name)).length || 0), 0);

                return (
                  <div key={cIdx} className="rounded-2xl border border-slate-300/80 overflow-hidden bg-slate-100/70 shadow-2xs">
                    {/* Header Chương */}
                    <div
                      onClick={() => {
                        setSelectedChapterIdx(cIdx);
                        setSelectedLessonIdx(0);
                        setSelectedPatternIdx(0);
                      }}
                      className={`p-3 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isChapterActive
                          ? 'bg-emerald-100/80 border-b border-emerald-200 text-emerald-950'
                          : 'hover:bg-slate-200/70 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedChapters(prev => ({ ...prev, [cIdx]: !isChapterExpanded }));
                          }}
                          className="p-1 rounded-md hover:bg-emerald-200/60 text-emerald-900 cursor-pointer"
                        >
                          {isChapterExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-white bg-emerald-700 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                              C.{ch.chapterNumber || cIdx + 1}
                            </span>
                            <span className="text-xs sm:text-[13px] font-black truncate text-slate-900">
                              {cleanPrefix(ch.title, 'chapter') || ch.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {lessonsInChapter.length} bài • {totalPatterns} dạng • Tr.{ch.pageStart}–{ch.pageEnd}
                          </div>
                        </div>
                      </div>

                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNewLessonToChapter(cIdx);
                          }}
                          title="Thêm bài học vào chương này"
                          className="p-1 rounded-md bg-white border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Danh sách Bài học con (Thụt lùi vô trong, tách layer màu và có border riêng) */}
                    {isChapterExpanded && (
                      <div className="p-2.5 bg-slate-50/60 border-t border-slate-200/90 space-y-2">
                        {lessonsInChapter.map((les, lIdx) => {
                          const isLessonActive = isChapterActive && lIdx === selectedLessonIdx;
                          const isLessonExpanded = expandedLessons[`${cIdx}_${lIdx}`] !== false;
                          const patterns = (les.patterns || []).filter(p => !isNonPedagogical(p.name));

                          return (
                            <div
                              key={lIdx}
                              className={`ml-3.5 rounded-xl transition-all ${
                                isLessonActive
                                  ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-xs ring-2 ring-emerald-100'
                                  : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
                              }`}
                            >
                              {/* Thanh Bài học */}
                              <div
                                onClick={() => {
                                  setSelectedChapterIdx(cIdx);
                                  setSelectedLessonIdx(lIdx);
                                  setSelectedPatternIdx(0);
                                }}
                                className="p-2 flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedLessons(prev => ({ ...prev, [`${cIdx}_${lIdx}`]: !isLessonExpanded }));
                                    }}
                                    className="p-0.5 rounded hover:bg-slate-200/60 text-slate-500 cursor-pointer"
                                  >
                                    {isLessonExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </button>
                                  <BookMarked className={`w-3.5 h-3.5 shrink-0 ${isLessonActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/70 px-1 rounded shrink-0">
                                        B.{les.lessonNumber || lIdx + 1}
                                      </span>
                                      {/* Chữ của bài học nhỏ hơn chữ của chương */}
                                      <span className={`text-[11px] leading-snug truncate ${isLessonActive ? 'font-black text-emerald-950' : 'font-semibold text-slate-800'}`}>
                                        {cleanPrefix(les.title, 'lesson') || les.title}
                                      </span>
                                    </div>
                                    <div className="text-[9.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                      <span>{patterns.length} dạng</span>
                                      <span>•</span>
                                      <span>Tr.{les.pageStart}–{les.pageEnd}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                                    les.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {les.status === 'ACCEPTED' ? '✓' : '⏳'}
                                  </span>
                                  {!isLocked && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddNewPatternToLesson(cIdx, lIdx);
                                      }}
                                      title="Thêm dạng bài"
                                      className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Dạng bài con bên trong bài học (Thụt lùi tiếp vào trong) */}
                              {isLessonExpanded && patterns.length > 0 && (
                                <div className="ml-5 mr-1 mb-2 pt-1 border-t border-slate-100 space-y-1">
                                  {patterns.map((pat, pIdx) => {
                                    const isPatternActive = isLessonActive && pIdx === selectedPatternIdx;
                                    const bloomMeta = BLOOM_LEVELS.find(b => b.level === pat.bloomLevel) || BLOOM_LEVELS[1];
                                    return (
                                      <div
                                        key={pIdx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedChapterIdx(cIdx);
                                          setSelectedLessonIdx(lIdx);
                                          setSelectedPatternIdx(pIdx);
                                        }}
                                        className={`p-1.5 rounded-lg flex items-center justify-between gap-1 cursor-pointer text-[10px] transition-colors ${
                                          isPatternActive
                                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                            : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                          <Target className={`w-3 h-3 shrink-0 ${isPatternActive ? 'text-emerald-100' : 'text-emerald-600'}`} />
                                          <span className="truncate">
                                            Dạng {pIdx + 1}: {cleanPrefix(pat.name, 'pattern') || pat.name}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextLevel = ((pat.bloomLevel || 2) % 6) + 1;
                                            setSkeleton(prev => {
                                              const chapters = [...prev.chapters];
                                              const ch = { ...chapters[cIdx] };
                                              const lessons = [...ch.lessons];
                                              const les = { ...lessons[lIdx] };
                                              const patterns = [...(les.patterns || [])];
                                              patterns[pIdx] = { ...patterns[pIdx], bloomLevel: nextLevel };
                                              les.patterns = patterns;
                                              lessons[lIdx] = les;
                                              ch.lessons = lessons;
                                              chapters[cIdx] = ch;
                                              return { ...prev, chapters };
                                            });
                                            const nextBloom = BLOOM_LEVELS.find(b => b.level === nextLevel) || BLOOM_LEVELS[1];
                                            toast.success(`Đã đổi Dạng ${pIdx + 1} sang mức ${nextBloom.label}!`);
                                          }}
                                          title={`Nhấn để đổi mức độ nhận thức (hiện tại: ${bloomMeta.label})`}
                                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all shrink-0 ${
                                            isPatternActive ? 'bg-white/20 text-white' : bloomMeta.color
                                          }`}
                                        >
                                          {bloomMeta.shortLabel} ▾
                                        </button>
                                      </div>
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
          </div>
        )}

        {/* CỘT BÊN PHẢI: LÝ THUYẾT CHUẨN, CÂU HỎI BÀI TẬP & NỘI DUNG SGK PARSE */}
        <div className={`${isTocCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'} flex flex-col gap-5 min-h-0 transition-all`}>
          {!activeLesson || isNonPedagogical(activeLesson.title) ? (
            <div className="bg-white rounded-3xl border border-emerald-200/80 p-12 text-center text-slate-400 text-xs">
              Vui lòng chọn bài học từ mục lục bên trái để xem lý thuyết và tri thức SGK.
            </div>
          ) : (
            <>
              {/* 1. KHỐI TIÊU ĐỀ DẠNG BÀI */}
              <div className="bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-xs">
                {/* Header bài học với Breadcrumb & Các nút thao tác tinh gọn */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
                      {isTocCollapsed && (
                        <button
                          type="button"
                          onClick={() => setIsTocCollapsed(false)}
                          className="mr-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Mở rộng mục lục SGK"
                        >
                          <ChevronRight className="w-3 h-3" /> Mục lục
                        </button>
                      )}
                      <span className="text-emerald-700 font-bold">{cleanPrefix(activeChapter?.title, 'chapter') || activeChapter?.title}</span>
                      <span>›</span>
                      <span>{cleanPrefix(activeLesson?.title, 'lesson') || activeLesson?.title}</span>
                      <span>›</span>
                      <span>Trang {activeLesson.pageStart}–{activeLesson.pageEnd}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-emerald-950">
                        {activePattern
                          ? `Dạng ${selectedPatternIdx + 1}: ${cleanPrefix(activePattern.name, 'pattern') || activePattern.name}`
                          : `Bài ${activeLesson.lessonNumber || selectedLessonIdx + 1}: ${cleanPrefix(activeLesson.title, 'lesson') || activeLesson.title}`}
                      </h2>
                      {activePattern && (() => {
                        const patBloom = BLOOM_LEVELS.find(b => b.level === (activePattern.bloomLevel || 2)) || BLOOM_LEVELS[1];
                        return (
                          <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${patBloom.color}`}>
                            {patBloom.label}
                          </span>
                        );
                      })()}
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                        {validPatterns.length} Dạng bài
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleLessonStatus(activeLesson)}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold cursor-pointer inline-flex items-center gap-1 ${
                          (activePattern ? activePattern.status === 'ACCEPTED' : activeLesson.status === 'ACCEPTED')
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {(activePattern ? activePattern.status === 'ACCEPTED' : activeLesson.status === 'ACCEPTED') ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{(activePattern ? activePattern.status === 'ACCEPTED' : activeLesson.status === 'ACCEPTED') ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* NÚT AI MỞ RỘNG & SINH LÝ THUYẾT & PHƯƠNG PHÁP */}
                    <button
                      type="button"
                      disabled={enrichingKnowledge}
                      onClick={() => handleAiEnrichTheory(selectedPatternIdx)}
                      title="AI sinh & mở rộng lý thuyết, phương pháp giải chuyên sâu chuẩn GDPT 2018"
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${enrichingKnowledge ? 'animate-spin' : ''}`} />
                      <span>{enrichingKnowledge ? 'Đang phân tích...' : '✨ AI Mở Rộng Dạng Này'}</span>
                    </button>

                    {/* Nút mở Studio biên soạn */}
                    <button
                      type="button"
                      onClick={() => handleOpenStudio()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Mở Studio</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* MODERN 3-TAB STUDIO BAR (Đơn giản, hiện đại, không cuộn lồng nhau) */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab('theory')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      activeContentTab === 'theory'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>1. Lý Thuyết &amp; Công Thức</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab('method')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      activeContentTab === 'method'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>2. Ví Dụ &amp; Phương Pháp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab('questions')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      activeContentTab === 'questions'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>3. Câu Hỏi &amp; Bài Tập</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      activeContentTab === 'questions' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {displayedExercises.length}
                    </span>
                  </button>
                </div>

                {!isLocked && activeContentTab === 'theory' && !isEditingTheory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditedTheory(displayedTheoryContent);
                      setIsEditingTheory(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
                {!isLocked && activeContentTab === 'method' && !isEditingMethod && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditedMethod(activePatternMethod || '');
                      setIsEditingMethod(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>

              {/* TAB 1: LÝ THUYẾT & CÔNG THỨC (Full-height, Zero nested scrollbar) */}
              {activeContentTab === 'theory' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
                {isEditingTheory ? (
                      <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-emerald-600" />
                            Chỉnh sửa lý thuyết dạng bài / bài học
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingTheory(false)}
                              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveTheory}
                              className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" /> Lưu lý thuyết
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={12}
                          value={editedTheory}
                          onChange={e => setEditedTheory(e.target.value)}
                          placeholder="Nhập nội dung lý thuyết định nghĩa, định luật, nguyên lý vận hành..."
                          className="w-full p-4 rounded-xl border border-emerald-300 bg-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    ) : (
                      <CleanTextbookRenderer content={displayedTheoryContent} />
                    )}
              </div>
              )}

              {/* TAB 2: VÍ DỤ & PHƯƠNG PHÁP GIẢI (Full-height, Zero nested scrollbar) */}
              {activeContentTab === 'method' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
                {isEditingMethod ? (
                      <div className="space-y-3 p-4 rounded-2xl bg-amber-50/40 border border-amber-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-amber-600" />
                            Chỉnh sửa ví dụ &amp; phương pháp giải
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingMethod(false)}
                              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveMethod}
                              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" /> Lưu phương pháp
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={10}
                          value={editedMethod}
                          onChange={e => setEditedMethod(e.target.value)}
                          placeholder="Nhập các bước giải: Bước 1: ..., Bước 2: ..., Bước 3: ..."
                          className="w-full p-4 rounded-xl border border-amber-300 bg-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    ) : activePatternMethod && activePatternMethod.trim() ? (
                      <CleanTextbookRenderer content={activePatternMethod} />
                    ) : (
                      <div className="p-8 rounded-2xl bg-amber-50/40 border border-dashed border-amber-300 text-center space-y-2.5">
                        <Lightbulb className="w-7 h-7 text-amber-500 mx-auto" />
                        <div className="text-sm font-bold text-slate-800">Chưa có ví dụ &amp; phương pháp giải riêng cho dạng bài này</div>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Bấm nút bên dưới để AI sinh ngay ví dụ mẫu kèm lời giải chi tiết bám sát SGK GDPT 2018.
                        </p>
                        <button
                          type="button"
                          disabled={enrichingKnowledge}
                          onClick={() => handleAiEnrichTheory(selectedPatternIdx)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sinh Ví Dụ &amp; Phương Pháp Bằng AI</span>
                        </button>
                      </div>
                    )}
              </div>
              )}

                {/* TAB 3: NGÂN HÀNG CÂU HỎI & BÀI TẬP SGK */}
                {activeContentTab === 'questions' && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                  {/* Header Section */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        3
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950">
                            Khối 3: Ngân Hàng Câu Hỏi & Bài Tập SGK
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                            {displayedExercises.length} câu hỏi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {activePattern ? `Dạng ${selectedPatternIdx + 1}: ${cleanPrefix(activePattern.name, 'pattern') || activePattern.name}` : `Bài ${activeLesson.lessonNumber || selectedLessonIdx + 1}: ${cleanPrefix(activeLesson.title, 'lesson') || activeLesson.title}`} • Phân hóa theo mức độ nhận thức (Nhận biết – Sáng tạo)
                        </p>
                      </div>
                    </div>

                    {/* Scope & Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tab Filter: Bài này vs Dạng đang chọn */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setExerciseFilterScope('lesson')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exerciseFilterScope === 'lesson'
                              ? 'bg-white text-emerald-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Cả bài ({activeLessonExercises.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setExerciseFilterScope('pattern')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exerciseFilterScope === 'pattern'
                              ? 'bg-white text-emerald-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {activePattern ? cleanPrefix(activePattern.name, 'pattern') : 'Dạng bài'} ({activePatternExercises.length})
                        </button>
                      </div>

                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('ingest')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                          title="Chuyển sang trang Nạp SGK để AI sinh câu hỏi mới"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Sinh thêm ở Trang Nạp</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bloom Level Filters (nếu có câu hỏi) */}
                  {activeLessonExercises.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Lọc cấp độ:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedBloomFilter(0)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          selectedBloomFilter === 0
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Tất cả ({exerciseFilterScope === 'pattern' ? activePatternExercises.length : activeLessonExercises.length})
                      </button>
                      {BLOOM_LEVELS.map(b => {
                        const count = (exerciseFilterScope === 'pattern' ? activePatternExercises : activeLessonExercises).filter(ex => (ex.bloomLevel || 2) === b.level).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={b.level}
                            type="button"
                            onClick={() => setSelectedBloomFilter(b.level)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                              selectedBloomFilter === b.level
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                : `${b.color} hover:opacity-80`
                            }`}
                          >
                            {b.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Exercise List or Empty State */}
                  {displayedExercises.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 text-center flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="max-w-md">
                        <h4 className="text-xs font-bold text-slate-800">
                          {activeLessonExercises.length === 0
                            ? 'Chưa có bài tập nào được lưu cho bài học này'
                            : 'Không có bài tập nào phù hợp với bộ lọc hiện tại'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {activeLessonExercises.length === 0
                            ? 'Bài tập được đồng bộ tự động theo ID tài liệu dưới CSDL. Bạn có thể sang Trang Nạp SGK để AI tự động sinh câu hỏi theo chuẩn Bloom L1–L6.'
                            : 'Hãy thử chọn cấp độ Bloom khác hoặc xem tất cả bài tập trong bài.'}
                        </p>
                      </div>
                      {activeLessonExercises.length === 0 && onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('ingest')}
                          className="mt-1 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-105"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Đến Trang Nạp SGK để sinh câu hỏi</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedExercises.map((ex, exIdx) => {
                        const bloomInfo = BLOOM_LEVELS.find(b => b.level === (ex.bloomLevel || 2)) || BLOOM_LEVELS[1];
                        const isSolutionExpanded = !!expandedExerciseSolutions[ex.id || exIdx];

                        return (
                          <div
                            key={ex.id || exIdx}
                            className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col gap-3"
                          >
                            {/* Card Top: Number, Bloom Badge, Pattern info */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white text-[11px] font-black flex items-center justify-center shadow-2xs">
                                  {exIdx + 1}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${bloomInfo.color}`}>
                                  {bloomInfo.label}
                                </span>
                                {ex.patternName && (
                                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10.5px] font-medium">
                                    {cleanPrefix(ex.patternName, 'pattern')}
                                  </span>
                                )}
                              </div>

                              {ex.sourcePage && (
                                <span className="text-[10px] font-medium text-slate-400">
                                  Nguồn: Trang {ex.sourcePage}
                                </span>
                              )}
                            </div>

                            {/* Question Stem */}
                            <div className="text-[12.5px] font-medium text-slate-900 leading-relaxed pl-1">
                              <MathText text={ex.stem} />
                            </div>

                            {/* Options A, B, C, D */}
                            {ex.options && ex.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {ex.options.map((opt, optIdx) => {
                                  const isCorrect = optIdx === ex.correctIndex;
                                  const letter = String.fromCharCode(65 + optIdx);
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${
                                        isCorrect
                                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-400/50 shadow-2xs'
                                          : 'bg-white border-slate-200/90 text-slate-800'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10.5px] font-black shrink-0 ${
                                          isCorrect
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {letter}
                                      </span>
                                      <div className="flex-1 leading-snug">
                                        <MathText text={opt} />
                                      </div>
                                      {isCorrect && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Solution toggle & display */}
                            {ex.solution && (
                              <div className="pt-2 border-t border-slate-200/70">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedExerciseSolutions(prev => ({
                                      ...prev,
                                      [ex.id || exIdx]: !prev[ex.id || exIdx]
                                    }))
                                  }
                                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{isSolutionExpanded ? 'Thu gọn lời giải' : 'Xem phương pháp & lời giải chi tiết'}</span>
                                  {isSolutionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {isSolutionExpanded && (
                                  <div className="mt-2 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 leading-relaxed shadow-2xs">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                                      💡 Hướng Dẫn Giải Chi Tiết:
                                    </span>
                                    <MathText text={ex.solution} />
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

                {/* 4. KHỐI 4: NỘI DUNG SGK PARSE RA (DROPDOWN BẢNG BIỂU & OCR TỪNG TRANG) */}
                <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                  {/* Header Dropdown Toggle */}
                  <div
                    onClick={() => setIsOcrDropdownOpen(prev => !prev)}
                    className="p-4 bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        4
                      </span>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <span>Khối 4: Nội Dung Bóc Tách Từ SGK Gốc (OCR)</span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                            {sourceChunks.length} Đoạn Trích OCR
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Bóc tách từng trang sách gốc qua Vision AI (công thức KaTeX, bảng số liệu, hình vẽ)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">
                        {isOcrDropdownOpen ? 'Thu gọn' : 'Mở rộng'}
                      </span>
                      {isOcrDropdownOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Thân Dropdown chứa bộ phân trang con */}
                  {isOcrDropdownOpen && (
                    <div className="p-4 space-y-4">
                      {/* Thanh điều khiển phân trang con với mũi tên trái/phải < > */}
                      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOcrScope('lesson')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              ocrScope === 'lesson'
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Bài học này (Trang {activeLesson?.pageStart || 1}–{activeLesson?.pageEnd || 1})
                          </button>
                          <button
                            type="button"
                            onClick={() => setOcrScope('book')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              ocrScope === 'book'
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Toàn cuốn sách ({totalBookPages} trang)
                          </button>
                        </div>

                        {/* Mũi tên trái phải < > */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={safeCurrentPage <= minOcrPage}
                            onClick={handlePrevOcrPage}
                            title="Trang trước"
                            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <div className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-black text-slate-800">
                            {pageSize === 2 ? (
                              <span>
                                Trang {safeCurrentPage} & {Math.min(safeCurrentPage + 1, maxOcrPage)} / {maxOcrPage}
                              </span>
                            ) : (
                              <span>
                                Trang {safeCurrentPage} / {maxOcrPage}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={safeCurrentPage >= maxOcrPage - (pageSize - 1)}
                            onClick={handleNextOcrPage}
                            title="Trang tiếp theo"
                            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Huy hiệu chế độ xem 1 trang hoặc 2 trang */}
                          <div className="hidden sm:flex items-center gap-1 text-[10.5px] font-bold text-slate-500 pl-2 border-l border-slate-200">
                            <Columns className="w-3.5 h-3.5 text-slate-400" />
                            <span>{pageSize === 2 ? '2 Trang (Mục lục / Sidebar thu gọn)' : '1 Trang (Mục lục mở)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hiển thị các trang con: 2 trang nếu sidebar đóng, 1 trang nếu sidebar mở */}
                      <div className={`grid gap-4 ${pageSize === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        {renderOcrPageCard(safeCurrentPage)}
                        {pageSize === 2 && safeCurrentPage + 1 <= maxOcrPage && renderOcrPageCard(safeCurrentPage + 1)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
