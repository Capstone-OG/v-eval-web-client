import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Sparkles,
  UploadCloud,
  RefreshCw,
  Layers,
  FileText,
  Sigma,
  Edit3,
  Copy,
  BookMarked,
  Lightbulb,
  Target,
  Check,
  Zap,
  Clock,
  Table2,
  Sliders,
  CheckSquare,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import aiService from '../../services/aiService';
import MathText from '../common/MathText';
import { useToast } from '../../context/ToastContext';
import {
  getStoredTextbookContext,
  saveStoredTextbookContext,
  isNonPedagogical,
  filterPedagogicalChapters,
  cleanPrefix,
  getGdptPreset,
  getSavedTextbookData,
  saveTextbookData,
  mergeSavedExercisesIntoChapters
} from './textbookStateBridge';

const BLOOM_LEVELS = [
  { level: 1, label: 'L1. Nhớ', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { level: 2, label: 'L2. Hiểu', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { level: 3, label: 'L3. Vận dụng', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  { level: 4, label: 'L4. Phân tích', color: 'bg-sky-50 text-sky-700 border-sky-300' },
  { level: 5, label: 'L5. Đánh giá', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { level: 6, label: 'L6. Sáng tạo', color: 'bg-purple-50 text-purple-700 border-purple-300' }
];

export default function TextbookIngestView({ onBack, onNavigateTab }) {
  const { toast } = useToast();
  const initCtx = getStoredTextbookContext();

  // ĐIỀU KHIỂN DPI NGHIÊM NGẶT: 60 <= DPI <= 90 (Mặc định: 72 DPI)
  const [targetDpi, setTargetDpi] = useState(72);

  // 3 GIAI ĐOẠN NẠP THỐNG NHẤT: 1 (Quét cấu trúc) | 2 (Nạp tài liệu lý thuyết) | 3 (Câu hỏi bài tập SGK)
  const [ingestStage, setIngestStage] = useState(1);
  const [ingestPart2Sector, setIngestPart2Sector] = useState('theory');

  // File PDF & Quét
  const [pdfFile, setPdfFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('');
  const [filling, setFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState(null);
  const [generatingExercises, setGeneratingExercises] = useState(false);
  const [enrichingKnowledge, setEnrichingKnowledge] = useState(false);

  // Kho SGK từ Database
  const [ingestedSources, setIngestedSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState(initCtx.selectedSourceId || '');
  const [filledChunks, setFilledChunks] = useState([]);

  // Skeleton Cấu Trúc SGK (Tự động nạp dữ liệu đã lưu từ Persistent Storage)
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

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(initCtx.selectedChapterIdx || 0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(initCtx.selectedLessonIdx || 0);
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(initCtx.selectedPatternIdx || 0);
  const [expandedChapters, setExpandedChapters] = useState({ 0: true, 1: true });
  const [expandedLessons, setExpandedLessons] = useState({ '0_0': true });

  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);
  const [textbookExercises, setTextbookExercises] = useState([]);
  const [batchProgress, setBatchProgress] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [exerciseGenScope, setExerciseGenScope] = useState('current'); // 'current' | 'lesson'
  const cancelBatchRef = useRef(false);

  const validChapters = (skeleton.chapters || []).filter(ch => ch && !isNonPedagogical(ch.title));
  const hasData = validChapters.length > 0;
  const activeChapter = hasData ? (validChapters[selectedChapterIdx] || validChapters[0]) : null;
  const validLessons = (activeChapter?.lessons || []).filter(l => l && !isNonPedagogical(l.title));
  const activeLesson = validLessons.length > 0 ? (validLessons[selectedLessonIdx] || validLessons[0]) : null;
  const validPatterns = (activeLesson?.patterns || []).filter(p => p && !isNonPedagogical(p.name));
  const activePattern = validPatterns.length > 0 ? (validPatterns[selectedPatternIdx] || validPatterns[0]) : null;
  const isLocked = skeleton.isVersionLocked;
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const saveToStorage = useCallback((currSkeleton) => {
    const target = currSkeleton || skeletonRef.current;
    if (!target) return false;
    const success = saveTextbookData({
      sourceId: selectedSourceId,
      fileName: target.fileName,
      skeleton: target,
      textbookExercises
    });
    if (success) {
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setLastSavedTime(timeStr);
    }
    return success;
  }, [selectedSourceId, textbookExercises]);

  // Lắng nghe sự kiện đồng bộ từ các view khác
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

  const handleSaveAll = () => {
    const success = saveToStorage(skeleton);
    if (success) {
      toast.success('✓ Đã lưu toàn bộ Cấu trúc, Lý thuyết & Ngân hàng câu hỏi SGK thành công!');
    } else {
      toast.error('Có lỗi khi lưu dữ liệu vào bộ nhớ trình duyệt.');
    }
  };

  const totalLessonCount = useMemo(() => {
    return validChapters.reduce((acc, ch) => {
      return acc + (ch.lessons || []).filter(l => !isNonPedagogical(l.title)).length;
    }, 0);
  }, [validChapters]);

  const totalPatternCount = useMemo(() => {
    return validChapters.reduce((acc, ch) => {
      return acc + (ch.lessons || []).reduce((lAcc, les) => {
        return lAcc + (les.patterns || []).filter(p => !isNonPedagogical(p.name)).length;
      }, 0);
    }, 0);
  }, [validChapters]);

  const totalExerciseCount = useMemo(() => {
    return validChapters.reduce((acc, ch) => {
      return acc + (ch.lessons || []).reduce((lAcc, les) => {
        return lAcc + (les.patterns || []).reduce((pAcc, pat) => {
          return pAcc + (pat.exercises || []).length;
        }, 0);
      }, 0);
    }, 0);
  }, [validChapters]);

  const handleDpiChange = (newVal) => {
    const val = Number(newVal);
    if (isNaN(val)) return;
    const clamped = Math.min(90, Math.max(60, val));
    setTargetDpi(clamped);
  };

  const handleCopyChunkText = (text, idx) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedChunkIdx(idx);
      toast.success('Đã sao chép đoạn lý thuyết!');
      setTimeout(() => setCopiedChunkIdx(null), 2000);
    }
  };

  const currentLessonChunks = useMemo(() => {
    if (!filledChunks || filledChunks.length === 0) return [];
    const pedagogicalChunks = filledChunks.filter(c => {
      const sType = (c.sectionType || '').toUpperCase();
      if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return false;
      if (isNonPedagogical(c.lessonName) && isNonPedagogical(c.patternName)) return false;
      return true;
    });

    if (activeLesson?.pageStart && activeLesson?.pageEnd) {
      const byPage = pedagogicalChunks.filter(c => c.pageNumber >= activeLesson.pageStart && c.pageNumber <= activeLesson.pageEnd);
      if (byPage.length > 0) return byPage;
    }
    if (activeLesson?.title) {
      const cleanLTitle = activeLesson.title.toLowerCase().replace(/^(bài\s*\d*[:\.\-]?\s*)/i, '').trim();
      const byLessonName = pedagogicalChunks.filter(c => {
        if (!c.lessonName || isNonPedagogical(c.lessonName)) return false;
        const cleanCName = c.lessonName.toLowerCase().replace(/^(bài\s*\d*[:\.\-]?\s*)/i, '').trim();
        return cleanLTitle.includes(cleanCName) || cleanCName.includes(cleanLTitle);
      });
      if (byLessonName.length > 0) return byLessonName;
    }
    return pedagogicalChunks.slice(0, 10);
  }, [filledChunks, activeLesson]);

  const loadChunksForSource = async (sourceId, sourceList = ingestedSources) => {
    let sid = sourceId;
    if (!sid && sourceList.length > 0) {
      const matched = sourceList.find(s => s.fileName && s.fileName.includes('VL 10 CD')) || sourceList[0];
      sid = matched?.sourceId;
      if (matched && !selectedSourceId) {
        setSelectedSourceId(matched.sourceId);
      }
    }
    if (!sid) return [];
    try {
      const res = await aiService.getTextbookChunks(sid);
      const chunks = res?.chunks || [];
      setFilledChunks(chunks);
      return chunks;
    } catch (err) {
      console.warn('Lỗi lấy chunks:', err);
      return [];
    }
  };

  const loadIngestedSources = async () => {
    try {
      const res = await aiService.getIngestedTextbooks();
      const list = res?.sources || [];
      setIngestedSources(list);

      const sidToLoad = selectedSourceId || (list.find(s => s.fileName?.includes('VL 10 CD')) || list[0])?.sourceId;
      if (sidToLoad) {
        setSelectedSourceId(sidToLoad);
        await loadChunksForSource(sidToLoad, list);
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
      setSelectedSourceId('');
      setFilledChunks([]);
      setSkeleton(prev => ({ ...prev, fileName: '', totalPages: 0, chapters: [] }));
      return;
    }
    const found = sourceList.find(s => s.sourceId === sourceId);
    if (!found) return;

    setSelectedSourceId(sourceId);
    
    // Phát hiện môn học và khối lớp chuẩn xác từ sourceId, subjectCode hoặc fileName
    let targetSub = found.subjectCode;
    let targetG = found.grade;
    const fNameUpper = (found.fileName || '').toUpperCase();
    if (!targetSub || targetSub === 'PHYS') {
      if (fNameUpper.includes('HÓA') || fNameUpper.includes('HOA') || fNameUpper.includes('CHEM')) {
        targetSub = 'CHEM';
      } else if (fNameUpper.includes('TOÁN') || fNameUpper.includes('TOAN') || fNameUpper.includes('MATH')) {
        targetSub = 'MATH';
      } else if (fNameUpper.includes('SINH') || fNameUpper.includes('BIO')) {
        targetSub = 'BIO';
      } else if (fNameUpper.includes('VẬT LÍ') || fNameUpper.includes('VAT LI') || fNameUpper.includes('VL') || fNameUpper.includes('PHYS')) {
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

    saveStoredTextbookContext({
      selectedSourceId: sourceId,
      fileName: found.fileName,
      subjectCode: targetSub,
      subjectName: targetSubName,
      grade: targetG
    });

    // 0. Đọc dữ liệu đã lưu từ Persistent Storage (CSDL / localStorage)
    const cachedData = getSavedTextbookData(sourceId, found.fileName);
    if (cachedData?.savedAt) {
      setLastSavedTime(new Date(cachedData.savedAt).toLocaleTimeString('vi-VN'));
    }

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

    const chunks = await loadChunksForSource(sourceId, sourceList);

    const chapterMap = new Map();
    chunks.forEach(chunk => {
      const sType = (chunk.sectionType || '').toUpperCase();
      if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return;

      const rawCName = chunk.chapterName?.trim() || '';
      const rawLName = chunk.lessonName?.trim() || '';
      const rawPName = chunk.patternName?.trim() || '';

      if (isNonPedagogical(rawLName) && (isNonPedagogical(rawPName) || !rawPName)) return;

      const cName = !isNonPedagogical(rawCName) && rawCName ? rawCName : 'Chủ đề 1: Kiến thức trọng tâm';
      const lName = !isNonPedagogical(rawLName) && rawLName ? rawLName : '';

      if (!lName) return;

      if (!chapterMap.has(cName)) chapterMap.set(cName, new Map());
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

      if (rawPName && !isNonPedagogical(rawPName) && !lesObj.patterns.some(p => p.name === rawPName)) {
        lesObj.patterns.push({
          patternCode: `P${lesObj.patterns.length + 1}`,
          name: rawPName,
          bloomLevel: 2,
          status: 'ACCEPTED',
          description: 'Dạng bài bóc tách từ SGK.',
          method: 'Phương pháp chuẩn SGK.',
          exercises: []
        });
      }
    });

    const rawChapters = [];
    let chIdx = 1;
    const preset = getGdptPreset(targetSub, targetG);

    chapterMap.forEach((lessonMap, cName) => {
      const lessons = Array.from(lessonMap.values()).filter(l => !isNonPedagogical(l.title));
      if (lessons.length === 0) return;
      const minPage = Math.min(...lessons.map(l => l.pageStart));
      const maxPage = Math.max(...lessons.map(l => l.pageEnd));

      lessons.forEach((les, lIdx) => {
        les.lessonNumber = lIdx + 1;
        const cleanedLesTitle = cleanPrefix(les.title, 'lesson').toLowerCase();

        // 1. Tìm preset bài học tương ứng
        let matchedLessonPreset = null;
        if (preset?.chapters) {
          for (const pCh of preset.chapters) {
            const foundPresetLes = (pCh.lessons || []).find(pl => {
              const plClean = cleanPrefix(pl.title, 'lesson').toLowerCase();
              return cleanedLesTitle.includes(plClean) || plClean.includes(cleanedLesTitle);
            });
            if (foundPresetLes) {
              matchedLessonPreset = foundPresetLes;
              break;
            }
          }
        }

        // 2. Nạp công thức nếu bài học chưa có
        if ((!les.keyFormulas || les.keyFormulas.length === 0) && matchedLessonPreset?.keyFormulas) {
          les.keyFormulas = matchedLessonPreset.keyFormulas;
        }

        // 3. Đa dạng hóa dạng bài và cấp độ Bloom Taxonomy (L1 - L4)
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
          les.patterns = matchedLessonPreset.patterns.map((presetPat, pIdx) => ({
            ...presetPat,
            patternCode: `P${pIdx + 1}`,
            status: 'ACCEPTED',
            exercises: pIdx === 0 ? existingExercises : []
          }));
        } else if (les.patterns?.length > 0) {
          const allSameL2 = les.patterns.every(p => !p.bloomLevel || p.bloomLevel === 2);
          les.patterns = les.patterns.map((p, pIdx) => ({
            ...p,
            patternCode: `P${pIdx + 1}`,
            bloomLevel: allSameL2 ? Math.min(4, Math.max(1, pIdx + 1)) : (p.bloomLevel || 2)
          }));
        }

        // Khôi phục bài tập và bloom level đã lưu từ cache (nếu có)
        les.patterns = les.patterns.map(p => {
          const pKey = `${cleanPrefix(les.title, 'lesson').toLowerCase()}__${cleanPrefix(p.name, 'pattern').toLowerCase()}`;
          const cachedEntry = savedPatternData.get(pKey);
          if (cachedEntry) {
            return {
              ...p,
              bloomLevel: cachedEntry.bloomLevel || p.bloomLevel || 2,
              exercises: (cachedEntry.exercises && cachedEntry.exercises.length > 0) ? cachedEntry.exercises : (p.exercises || [])
            };
          }
          return p;
        });
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

    // Sắp xếp các chương tuần tự theo số trang tăng dần
    rawChapters.sort((a, b) => (a.pageStart || 0) - (b.pageStart || 0));
    rawChapters.forEach((ch, idx) => {
      ch.chapterNumber = idx + 1;
    });

    const detectedChapters = filterPedagogicalChapters(rawChapters);

    if (cachedData?.textbookExercises && cachedData.textbookExercises.length > 0) {
      setTextbookExercises(cachedData.textbookExercises);
    }

    const baseChapters = detectedChapters.length > 0
      ? detectedChapters
      : (cachedData?.skeleton?.chapters || preset?.chapters || []);
    const finalChapters = mergeSavedExercisesIntoChapters(baseChapters, cachedData);

    setSkeleton(prev => {
      const next = {
        ...prev,
        fileName: found.fileName,
        subjectCode: targetSub,
        subjectName: targetSubName,
        grade: targetG,
        bookEdition: found.bookEdition || prev.bookEdition,
        totalPages: found.totalPages || prev.totalPages,
        chapters: finalChapters.length > 0 ? finalChapters : prev.chapters
      };
      skeletonRef.current = next;
      saveToStorage(next);
      return next;
    });
    setSelectedChapterIdx(0);
    setSelectedLessonIdx(0);
    setSelectedPatternIdx(0);
    toast.success(`Đã nạp ${chunks.length} trang tri thức của SGK "${found.fileName}"!`);
  };

  // BƯỚC 1: Quét Cấu Trúc Sách (DPI 60 - 90)
  const handleScanSkeleton = async () => {
    if (!pdfFile) {
      toast.warning('Vui lòng chọn file PDF SGK trước khi quét mục lục!');
      return;
    }
    const safeDpi = Math.min(90, Math.max(60, Number(targetDpi) || 72));
    setScanning(true);
    setScanStatusMsg(`🚀 [Phần 1]: Đang quét cấu trúc SGK với độ phân giải ${safeDpi} DPI...`);
    try {
      const data = await aiService.scanTextbookSkeleton(pdfFile, {
        subjectCode: skeleton.subjectCode,
        grade: skeleton.grade,
        bookEdition: skeleton.bookEdition,
        targetDpi: safeDpi
      });

      const normalized = (data.chapters || []).map(ch => ({
        ...ch,
        status: 'PENDING_REVIEW',
        lessons: (ch.lessons || []).map(les => ({
          ...les,
          status: 'PENDING_REVIEW',
          patterns: (les.patterns || []).map(pat => ({
            ...pat,
            status: 'PENDING_REVIEW',
            exercises: []
          }))
        }))
      }));

      const cleanNormalized = filterPedagogicalChapters(normalized);

      setSkeleton(prev => ({
        ...prev,
        ...data,
        status: 'PENDING_REVIEW',
        chapters: cleanNormalized.length > 0 ? cleanNormalized : prev.chapters
      }));
      setSelectedChapterIdx(0);
      setSelectedLessonIdx(0);
      setSelectedPatternIdx(0);
      toast.success(`Đã quét xong khung mục lục (${normalized.length} chương, chờ duyệt)!`);
    } catch (err) {
      toast.error('Lỗi quét khung: ' + (err?.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  // BƯỚC 2: Quét Sâu Toàn Bộ Nội Dung SGK (Độ phủ 70%-80%, DPI 60-90)
  const handleStartFillKnowledge = async () => {
    if (!pdfFile) {
      toast.warning('Vui lòng chọn file PDF SGK để quét sâu toàn bộ nội dung!');
      return;
    }
    const safeDpi = Math.min(90, Math.max(60, Number(targetDpi) || 72));
    setFilling(true);
    setScanStatusMsg(`⏳ [Phần 2]: Vision AI đang quét sâu SGK (${safeDpi} DPI, độ phủ 70%-80%)...`);
    try {
      const job = await aiService.uploadTextbookPdf(pdfFile, {
        domainId: `Domain-${skeleton.subjectCode || 'PHYS'}`,
        skillId: 'Skill-SGK',
        docType: 'TEXTBOOK',
        ocrMode: 'VISION_AI',
        forceReingest: true,
        targetDpi: safeDpi,
        batchSize: 4
      });
      setFillProgress(job);

      const poll = setInterval(async () => {
        try {
          const st = await aiService.getTextbookJobStatus(job.jobId);
          setFillProgress(st);
          if (st.status === 'COMPLETED') {
            clearInterval(poll);
            setFilling(false);
            setScanStatusMsg(`🎉 [Phần 2 Hoàn tất] Đã nạp thành công ${st.totalPages || ''} trang SGK vào Database!`);
            toast.success('Đã quét sâu và nạp toàn bộ nội dung SGK vào Database!');
            const finishedSid = st.sourceId || st.result?.documentId;
            if (finishedSid) {
              setSelectedSourceId(finishedSid);
              await loadChunksForSource(finishedSid);
            }
          } else if (st.status === 'FAILED') {
            clearInterval(poll);
            setFilling(false);
            setScanStatusMsg(`❌ Phần 2 thất bại: ${st.errorMessage || 'Lỗi'}`);
            toast.error('Quét sâu nội dung thất bại.');
          }
        } catch {}
      }, 2000);
    } catch (err) {
      setFilling(false);
      toast.error('Lỗi khởi động quét sâu: ' + err.message);
    }
  };

  // AI SINH BÀI TẬP (PHẦN 3) - 1 DẠNG BÀI (CHỈ SINH THÊM, BẢO TOÀN CÂU HỎI ĐÃ CÓ)
  const handleGenerateExercises = async () => {
    if (!activePattern || !activeLesson) {
      toast.warning('Vui lòng chọn Dạng bài để sinh bài tập!');
      return;
    }
    setGeneratingExercises(true);
    try {
      const res = await aiService.generatePatternExercises({
        subject: skeleton.subjectName,
        grade: skeleton.grade,
        chapter: activeChapter?.title || '',
        lesson: activeLesson?.title || '',
        patternName: activePattern.name,
        bloomLevel: activePattern.bloomLevel || 2,
        theoryContext: (activeLesson.keyFormulas || []).join('\n'),
        count: 3
      });

      const existing = activePattern.exercises || [];
      const newEx = (res?.exercises || []).map((ex, exIdx) => ({
        ...ex,
        id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${existing.length + exIdx + 1}`,
        status: 'PENDING_REVIEW',
        sourcePage: activeLesson.pageStart || 1,
        reusable: true
      }));

      if (newEx.length > 0) {
        updatePatternByName(activeChapter?.title, activeLesson?.title, activePattern.name, pat => ({
          ...pat,
          exercises: [...(pat.exercises || []), ...newEx]
        }));
        setTextbookExercises(prev => [...prev, ...newEx]);
        toast.success(`🎉 Đã sinh thêm ${newEx.length} bài tập mới cho "${cleanPrefix(activePattern.name, 'pattern')}" và tự động lưu! (Tổng cộng: ${existing.length + newEx.length} câu)`);
      }
    } catch (err) {
      toast.error('Lỗi sinh bài tập: ' + (err?.response?.data?.message || err.message));
    } finally {
      setGeneratingExercises(false);
    }
  };

  // THỰC THI TIẾN TRÌNH SINH HÀNG LOẠT CHO 1 BÀI HỌC (NỐI THÊM, KHÔNG THAY THẾ)
  const executeBatchLesson = async (cIdx, lIdx, targetPatterns, lessonTitle) => {
    const ch = skeleton.chapters?.[cIdx];
    const les = ch?.lessons?.[lIdx];
    if (!les) return;

    cancelBatchRef.current = false;
    setBatchProgress({
      current: 0,
      total: targetPatterns.length,
      currentPattern: '',
      targetName: `Bài: ${cleanPrefix(lessonTitle, 'lesson')}`
    });
    toast.info(`Bắt đầu sinh thêm câu hỏi tự động cho ${targetPatterns.length} dạng bài...`);

    let successCount = 0;
    for (let i = 0; i < targetPatterns.length; i++) {
      if (cancelBatchRef.current) {
        toast.info('Đã dừng tiến trình sinh câu hỏi theo yêu cầu!');
        break;
      }

      const pat = targetPatterns[i];
      const actualPIdx = (les.patterns || []).findIndex(p => p.name === pat.name);
      const safePIdx = actualPIdx >= 0 ? actualPIdx : i;

      setBatchProgress({
        current: i + 1,
        total: targetPatterns.length,
        currentPattern: pat.name,
        targetName: `Bài: ${cleanPrefix(lessonTitle, 'lesson')}`
      });

      try {
        const res = await aiService.generatePatternExercises({
          subject: skeleton.subjectName,
          grade: skeleton.grade,
          chapter: ch?.title || '',
          lesson: les?.title || '',
          patternName: pat.name,
          bloomLevel: pat.bloomLevel || 2,
          theoryContext: (les?.keyFormulas || []).join('\n'),
          count: 3
        });

        const newEx = res?.exercises || [];
        if (newEx.length > 0) {
          updatePatternByName(ch?.title, les?.title, pat.name, p => {
            const existing = p.exercises || [];
            const mappedNew = newEx.map((ex, exIdx) => ({
              ...ex,
              id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${existing.length + exIdx + 1}`,
              status: 'PENDING_REVIEW',
              sourcePage: les.pageStart || ch?.pageStart || 1,
              reusable: true
            }));
            return {
              ...p,
              exercises: [...existing, ...mappedNew]
            };
          });
          setTextbookExercises(prev => [...prev, ...newEx]);
          successCount++;
        }
      } catch (err) {
        console.error(`Lỗi sinh bài tập cho dạng ${pat.name}:`, err);
      }

      await new Promise(r => setTimeout(r, 400));
    }

    setBatchProgress(null);
    saveToStorage(skeletonRef.current);
    toast.success(`🎉 Đã sinh thêm câu hỏi thành công cho ${successCount}/${targetPatterns.length} dạng bài và tự động lưu toàn bộ!`);
  };

  // THỰC THI TIẾN TRÌNH SINH HÀNG LOẠT TOÀN CUỐN SÁCH (NỐI THÊM, KHÔNG THAY THẾ)
  const executeBatchBook = async (tasks) => {
    cancelBatchRef.current = false;
    setBatchProgress({
      current: 0,
      total: tasks.length,
      currentPattern: '',
      targetName: 'Toàn bộ SGK'
    });
    toast.info(`Bắt đầu sinh thêm câu hỏi cho ${tasks.length} dạng bài toàn cuốn sách...`);

    let successCount = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (cancelBatchRef.current) {
        toast.info('Đã dừng tiến trình sinh câu hỏi toàn sách!');
        break;
      }

      const task = tasks[i];
      setBatchProgress({
        current: i + 1,
        total: tasks.length,
        currentPattern: `${task.pattern.name} (${cleanPrefix(task.lessonTitle, 'lesson')})`,
        targetName: 'Toàn bộ SGK'
      });

      try {
        const res = await aiService.generatePatternExercises({
          subject: skeleton.subjectName,
          grade: skeleton.grade,
          chapter: task.chapterTitle,
          lesson: task.lessonTitle,
          patternName: task.pattern.name,
          bloomLevel: task.pattern.bloomLevel || 2,
          theoryContext: task.keyFormulas.join('\n'),
          count: 3
        });

        const newEx = res?.exercises || [];
        if (newEx.length > 0) {
          updatePatternByName(task.chapterTitle, task.lessonTitle, task.pattern.name, p => {
            const existing = p.exercises || [];
            const mappedNew = newEx.map((ex, exIdx) => ({
              ...ex,
              id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${existing.length + exIdx + 1}`,
              status: 'PENDING_REVIEW',
              sourcePage: task.pageStart,
              reusable: true
            }));
            return {
              ...p,
              exercises: [...existing, ...mappedNew]
            };
          });
          setTextbookExercises(prev => [...prev, ...newEx]);
          successCount++;
        }
      } catch (err) {
        console.error(`Lỗi sinh bài tập cho dạng ${task.pattern.name}:`, err);
      }

      await new Promise(r => setTimeout(r, 400));
    }

    setBatchProgress(null);
    saveToStorage(skeletonRef.current);
    toast.success(`🎉 Đã hoàn tất sinh thêm câu hỏi cho ${successCount}/${tasks.length} dạng bài toàn cuốn sách và tự động lưu toàn bộ!`);
  };

  // MỞ POPUP XÁC NHẬN SINH CHO TẤT CẢ DẠNG TRONG BÀI HỌC HIỆN TẠI
  const handleGenerateExercisesForCurrentLesson = () => {
    if (!activeLesson || validPatterns.length === 0) {
      toast.warning('Bài học hiện tại chưa có Dạng bài nào để sinh!');
      return;
    }

    const cIdx = selectedChapterIdx;
    const lIdx = selectedLessonIdx;
    const targetPatterns = (activeLesson.patterns || []).filter(p => !isNonPedagogical(p.name));

    if (targetPatterns.length === 0) {
      toast.warning('Không tìm thấy Dạng bài hợp lệ trong bài học này!');
      return;
    }

    setConfirmModal({
      title: 'Sinh Thêm Câu Hỏi Cho Bài Học',
      targetName: `Bài: ${cleanPrefix(activeLesson.title, 'lesson') || activeLesson.title}`,
      patternCount: targetPatterns.length,
      questionsPerPattern: 3,
      scope: 'lesson',
      onConfirm: () => executeBatchLesson(cIdx, lIdx, targetPatterns, activeLesson.title)
    });
  };

  // MỞ POPUP XÁC NHẬN SINH CHO 1 BÀI HỌC CỤ THỂ TỪ CÂY MỤC LỤC
  const handleGenerateForSpecificLesson = (cIdx, lIdx) => {
    const ch = skeleton.chapters?.[cIdx];
    const les = ch?.lessons?.[lIdx];
    if (!les) return;
    const targetPatterns = (les.patterns || []).filter(p => !isNonPedagogical(p.name));
    if (targetPatterns.length === 0) {
      toast.warning(`Bài "${cleanPrefix(les.title, 'lesson')}" chưa có Dạng bài nào!`);
      return;
    }

    setConfirmModal({
      title: 'Sinh Thêm Câu Hỏi Cho Bài Học',
      targetName: `Bài: ${cleanPrefix(les.title, 'lesson') || les.title}`,
      patternCount: targetPatterns.length,
      questionsPerPattern: 3,
      scope: 'lesson',
      onConfirm: () => executeBatchLesson(cIdx, lIdx, targetPatterns, les.title)
    });
  };

  // MỞ POPUP XÁC NHẬN SINH CHO TẤT CẢ DẠNG TRONG TOÀN BỘ CUỐN SÁCH
  const handleGenerateExercisesForAllPatternsInBook = () => {
    const tasks = [];
    (skeleton.chapters || []).forEach((ch, cIdx) => {
      if (isNonPedagogical(ch.title)) return;
      (ch.lessons || []).forEach((les, lIdx) => {
        if (isNonPedagogical(les.title)) return;
        (les.patterns || []).forEach((pat, pIdx) => {
          if (isNonPedagogical(pat.name)) return;
          tasks.push({
            cIdx,
            lIdx,
            pIdx,
            chapterTitle: ch.title,
            lessonTitle: les.title,
            pageStart: les.pageStart || ch.pageStart || 1,
            keyFormulas: les.keyFormulas || [],
            pattern: pat
          });
        });
      });
    });

    if (tasks.length === 0) {
      toast.warning('Chưa có Dạng bài nào trong toàn bộ cuốn sách để sinh!');
      return;
    }

    setConfirmModal({
      title: 'Sinh Thêm Câu Hỏi Cho Toàn Bộ Sách',
      targetName: `${skeleton.subjectName} Lớp ${skeleton.grade} (${validChapters.length} Chương)`,
      patternCount: tasks.length,
      questionsPerPattern: 3,
      scope: 'book',
      onConfirm: () => executeBatchBook(tasks)
    });
  };

  // AI BỔ SUNG KIẾN THỨC NỀN
  const handleAiEnrich = async () => {
    setEnrichingKnowledge(true);
    try {
      const patternName = activePattern?.name || `Dạng bài trọng tâm ${activeLesson?.title || ''}`;
      const lessonName = activeLesson?.title || 'Bài học SGK';
      const domainName = `${skeleton.subjectName} Lớp ${skeleton.grade}`;
      const context = (activeLesson?.keyFormulas || []).join('\n');

      toast.info('✨ AI đang phân tích và bổ sung kiến thức nền...');
      const enriched = await aiService.analyzePatternWithAi({
        patternName,
        lessonName,
        domainName,
        context
      });

      if (activePattern) {
        updatePattern(pat => ({
          ...pat,
          description: enriched.theory_recap || pat.description,
          method: enriched.solution_method || pat.method,
          bloomLevel: enriched.bloom_level || pat.bloomLevel || 2,
          status: 'ACCEPTED'
        }));
        toast.success(`✨ Đã bổ sung kiến thức nền cho Dạng "${activePattern.name}"!`);
      }
    } catch (err) {
      toast.error('Lỗi bổ sung AI: ' + err.message);
    } finally {
      setEnrichingKnowledge(false);
    }
  };

  const updateLesson = (updater) => {
    if (isLocked || !activeChapter || !activeLesson) return;
    setSkeleton(prev => {
      const chapters = (prev.chapters || []).map((ch, cIdx) => {
        if (activeChapter?.title ? ch.title !== activeChapter.title : cIdx !== selectedChapterIdx) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map((les, lIdx) => {
            if (activeLesson?.title ? les.title !== activeLesson.title : lIdx !== selectedLessonIdx) return les;
            return updater({ ...les });
          })
        };
      });
      const updated = { ...prev, chapters };
      skeletonRef.current = updated;
      saveToStorage(updated);
      return updated;
    });
  };

  const updatePattern = (updater) => {
    if (isLocked || !activeLesson || !activePattern) return;
    setSkeleton(prev => {
      const chapters = (prev.chapters || []).map((ch, cIdx) => {
        if (activeChapter?.title ? ch.title !== activeChapter.title : cIdx !== selectedChapterIdx) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map((les, lIdx) => {
            if (activeLesson?.title ? les.title !== activeLesson.title : lIdx !== selectedLessonIdx) return les;
            return {
              ...les,
              patterns: (les.patterns || []).map((pat, pIdx) => {
                if (activePattern?.name ? pat.name !== activePattern.name : pIdx !== selectedPatternIdx) return pat;
                return updater({ ...pat });
              })
            };
          })
        };
      });
      const updated = { ...prev, chapters };
      skeletonRef.current = updated;
      saveToStorage(updated);
      return updated;
    });
  };

  const updatePatternByName = (chapterTitle, lessonTitle, patternName, updater) => {
    setSkeleton(prev => {
      const chapters = (prev.chapters || []).map(ch => {
        if (chapterTitle && ch.title !== chapterTitle) return ch;
        return {
          ...ch,
          lessons: (ch.lessons || []).map(les => {
            if (lessonTitle && les.title !== lessonTitle) return les;
            return {
              ...les,
              patterns: (les.patterns || []).map(pat => {
                if (pat.name !== patternName) return pat;
                return updater({ ...pat });
              })
            };
          })
        };
      });
      const updated = { ...prev, chapters };
      skeletonRef.current = updated;
      saveToStorage(updated);
      return updated;
    });
  };

  const updatePatternAt = (cIdx, lIdx, pIdx, updater) => {
    setSkeleton(prev => {
      const chapters = [...(prev.chapters || [])];
      const targetCh = validChapters[cIdx] || chapters[cIdx];
      const realCIdx = targetCh ? chapters.findIndex(c => c.title === targetCh.title) : cIdx;
      if (realCIdx < 0 || !chapters[realCIdx]) return prev;

      const ch = { ...chapters[realCIdx] };
      const lessons = [...(ch.lessons || [])];
      const validLes = (ch.lessons || []).filter(l => !isNonPedagogical(l.title));
      const targetLes = validLes[lIdx] || lessons[lIdx];
      const realLIdx = targetLes ? lessons.findIndex(l => l.title === targetLes.title) : lIdx;
      if (realLIdx < 0 || !lessons[realLIdx]) return prev;

      const les = { ...lessons[realLIdx] };
      const patterns = [...(les.patterns || [])];
      const validPat = (les.patterns || []).filter(p => !isNonPedagogical(p.name));
      const targetPat = validPat[pIdx] || patterns[pIdx];
      const realPIdx = targetPat ? patterns.findIndex(p => p.name === targetPat.name) : pIdx;
      if (realPIdx < 0 || !patterns[realPIdx]) return prev;

      patterns[realPIdx] = updater({ ...patterns[realPIdx] });
      les.patterns = patterns;
      lessons[realLIdx] = les;
      ch.lessons = lessons;
      chapters[realCIdx] = ch;
      const updated = { ...prev, chapters };
      skeletonRef.current = updated;
      saveToStorage(updated);
      return updated;
    });
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
      const smartBloom = Math.min(4, Math.max(1, nextNum));
      les.patterns = [
        ...(les.patterns || []),
        {
          patternCode: `P${nextNum}`,
          name: `Dạng ${nextNum}: Dạng bài mới`,
          bloomLevel: smartBloom,
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

  const handleOpenStudio = () => {
    saveStoredTextbookContext({
      selectedSourceId,
      fileName: skeleton.fileName,
      selectedChapterIdx,
      selectedLessonIdx,
      selectedPatternIdx
    });
    if (onNavigateTab) onNavigateTab('textbook-studio');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-teal-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          )}
          <div>
            <h1 className="text-base font-black text-teal-950 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>Trang 2: Nạp Tài Liệu Sách Giáo Khoa (Vision AI Pipeline)</span>
            </h1>
            <p className="text-[11px] text-teal-700">
              Quy trình 3 phần: Quét cấu trúc (DPI 60-90) • Nạp 70%-80% Lý thuyết & Sơ đồ • Trích câu hỏi tái sử dụng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('textbook-standard')}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sang SGK Chuẩn</span>
              </button>
              <button
                type="button"
                onClick={handleOpenStudio}
                className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Mở Studio Biên Soạn</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* NOTIFICATION STATUS BANNER */}
      {(scanStatusMsg || fillProgress) && (
        <div className="bg-teal-950 text-teal-100 px-6 py-2 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-medium">{scanStatusMsg || fillProgress?.currentStep}</span>
          </div>
          {fillProgress && (
            <span className="font-mono font-bold text-teal-300">
              {fillProgress.status} • {fillProgress.progressPercent || 0}%
            </span>
          )}
        </div>
      )}

      {/* 2. TOOLBAR NẠP & ĐIỀU KHIỂN DPI (60 <= DPI <= 90) */}
      <div className="px-6 py-4 space-y-4">
        <div className="p-4 rounded-3xl bg-white border border-teal-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Box DPI Control: Bắt buộc không thấp hơn 60 và không cao hơn 90 */}
            <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-black text-teal-950">Độ phân giải DPI quét:</span>
                <span className="px-2 py-0.5 rounded-lg bg-teal-600 text-white font-mono font-black text-xs">
                  {targetDpi} DPI
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">60</span>
                <input
                  type="range"
                  min={60}
                  max={90}
                  step={1}
                  value={targetDpi}
                  onChange={e => handleDpiChange(e.target.value)}
                  className="w-36 accent-teal-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 font-bold">90</span>
              </div>

              <input
                type="number"
                min={60}
                max={90}
                value={targetDpi}
                onChange={e => handleDpiChange(e.target.value)}
                className="w-16 px-2 py-1 rounded-xl border border-teal-300 bg-white text-xs font-bold text-center text-teal-950"
              />

              <span className="text-[11px] text-teal-800">
                (Chuẩn bóc tách: min 60, max 90 DPI để tối ưu công thức KaTeX và tốc độ AI)
              </span>
            </div>

            {/* Chọn file & Kho SGK */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="px-3.5 py-2 rounded-xl border border-dashed border-teal-400 bg-teal-50/70 hover:bg-teal-100 text-xs font-bold text-teal-800 cursor-pointer flex items-center gap-2 transition-colors">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="max-w-[180px] truncate">{pdfFile ? pdfFile.name : 'Chọn file PDF SGK...'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0] || null;
                    setPdfFile(f);
                    if (f) setSkeleton(prev => ({ ...prev, fileName: f.name }));
                  }}
                />
              </label>

              <select
                value={selectedSourceId}
                onChange={e => handleSelectSource(e.target.value)}
                className="px-3 py-2 rounded-xl border border-teal-300 bg-white text-xs font-bold text-teal-950 max-w-xs truncate"
              >
                <option value="">-- Kho SGK đã nạp ({ingestedSources.length} cuốn) --</option>
                {ingestedSources.map(s => (
                  <option key={s.sourceId} value={s.sourceId}>
                    {s.fileName} ({s.subjectName} L{s.grade} • {s.totalPages} trang)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🌟 THANH TÁC VỤ TỔNG QUÁT: NÚT LƯU TOÀN BỘ SÁCH & SINH TOÀN SÁCH (NẰM TRÊN BỘ CHUYỂN 3 CHẾ ĐỘ) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/80 to-sky-50/80 border border-teal-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
                <Save className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-teal-950 truncate max-w-sm">
                    {skeleton.fileName || 'Chưa chọn tài liệu SGK'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{lastSavedTime ? `Đã lưu lúc ${lastSavedTime}` : 'Tự động lưu đang bật (Auto-save ON)'}</span>
                  </span>
                </div>
                <div className="text-[11px] text-teal-800 flex items-center gap-2 mt-0.5 font-medium flex-wrap">
                  <span>{validChapters.length} Chương</span>
                  <span>•</span>
                  <span>{totalLessonCount} Bài học</span>
                  <span>•</span>
                  <span>{totalPatternCount} Dạng bài</span>
                  <span>•</span>
                  <span className="font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md border border-sky-200">
                    {totalExerciseCount} Câu hỏi đã tạo
                  </span>
                </div>
              </div>
            </div>

            {/* CÁC NÚT HÀNH ĐỘNG TỔNG QUÁT (GLOBAL COMMANDS) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Nút 1: LƯU TOÀN BỘ SGK */}
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all ring-1 ring-emerald-600"
                title="Lưu toàn bộ Cấu trúc mục lục, Lý thuyết và Ngân hàng câu hỏi SGK"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>Lưu Toàn Bộ SGK</span>
              </button>

              {/* Nút 2: SINH CÂU HỎI TOÀN BỘ SÁCH */}
              <button
                type="button"
                disabled={batchProgress !== null || validChapters.length === 0}
                onClick={handleGenerateExercisesForAllPatternsInBook}
                className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all ring-1 ring-indigo-600"
                title="Sinh câu hỏi tự động cho tất cả dạng bài toàn cuốn sách"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sinh Toàn Bộ Sách</span>
              </button>
            </div>
          </div>

          {/* TAB 3 GIAI ĐOẠN NẠP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIngestStage(1)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                ingestStage === 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 bg-white text-emerald-700">
                  1
                </div>
                <div>
                  <div className="text-xs font-black">Phần 1: Quét Cấu Trúc Sách</div>
                  <div className="text-[10.5px] opacity-80">Mục lục, Chương, Bài, Dạng bài ({targetDpi} DPI)</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIngestStage(2)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                ingestStage === 2 ? 'bg-teal-700 text-white shadow-xs' : 'bg-teal-50/40 border-teal-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 bg-white text-teal-800">
                  2
                </div>
                <div>
                  <div className="text-xs font-black">Phần 2: Nạp Tài Liệu SGK</div>
                  <div className="text-[10.5px] opacity-80">Lý thuyết, Công thức, Bảng & Ảnh (70%-80%)</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIngestStage(3)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                ingestStage === 3 ? 'bg-sky-700 text-white shadow-xs' : 'bg-sky-50/40 border-sky-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 bg-white text-sky-800">
                  3
                </div>
                <div>
                  <div className="text-xs font-black">Phần 3: Câu Hỏi & Bài Tập SGK</div>
                  <div className="text-[10.5px] opacity-80">Trích trực tiếp từ SGK & Lưu để tái sử dụng</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. WORKSPACE 3 PHẦN THỐNG NHẤT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* CỘT TRÁI (4/12): CÂY MỤC LỤC CẤU TRÚC SÁCH PHÂN CẤP */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-teal-200/80 p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-teal-950">
                    Mục Lục Cấu Trúc SGK ({validChapters.length} Chương)
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">Chương ▾ Bài học ▾ Dạng bài</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isLocked && (
                  <button
                    type="button"
                    onClick={handleAddNewChapter}
                    className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-teal-200"
                  >
                    <Plus className="w-3 h-3" /> Thêm chương
                  </button>
                )}
                <button
                  type="button"
                  disabled={batchProgress !== null || validChapters.length === 0}
                  onClick={handleGenerateExercisesForAllPatternsInBook}
                  className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer border border-indigo-200 disabled:opacity-40"
                  title="Sinh câu hỏi tự động cho tất cả dạng bài toàn cuốn sách"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" /> Sinh toàn sách
                </button>
              </div>
            </div>

            {/* Danh sách các Chương & Bài học (Mở rộng tự nhiên theo toàn bộ danh sách chương) */}
            <div className="space-y-3 pr-1 max-h-[85vh] overflow-y-auto">
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
                          ? 'bg-teal-100/80 border-b border-teal-200 text-teal-950'
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
                          className="p-1 rounded-md hover:bg-teal-200/60 text-teal-900 cursor-pointer"
                        >
                          {isChapterExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase text-white bg-teal-700 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
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
                          className="p-1 rounded-md bg-white border border-slate-200 hover:bg-teal-50 text-slate-600 hover:text-teal-800 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Danh sách Bài học con (Thụt lùi vô trong) */}
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
                                  ? 'bg-teal-50/90 border-2 border-teal-500 shadow-xs ring-2 ring-teal-100'
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
                                    {isLessonExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <BookMarked className={`w-3.5 h-3.5 shrink-0 ${isLessonActive ? 'text-teal-700' : 'text-slate-400'}`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-bold text-teal-800 bg-teal-100/70 px-1 rounded shrink-0">
                                        B.{les.lessonNumber || lIdx + 1}
                                      </span>
                                      <span className={`text-[11px] leading-snug truncate ${isLessonActive ? 'font-black text-teal-950' : 'font-semibold text-slate-800'}`}>
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
                                  {patterns.length > 0 && (
                                    <button
                                      type="button"
                                      disabled={batchProgress !== null}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateForSpecificLesson(cIdx, lIdx);
                                      }}
                                      title={`AI sinh câu hỏi cho tất cả ${patterns.length} dạng trong bài này`}
                                      className="p-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 cursor-pointer disabled:opacity-40"
                                    >
                                      <Zap className="w-2.5 h-2.5 text-amber-500" />
                                    </button>
                                  )}
                                  {!isLocked && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddNewPatternToLesson(cIdx, lIdx);
                                      }}
                                      title="Thêm dạng bài"
                                      className="p-1 rounded bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-800 cursor-pointer"
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
                                            ? 'bg-teal-700 text-white font-bold shadow-2xs'
                                            : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                          <Target className={`w-3 h-3 shrink-0 ${isPatternActive ? 'text-teal-100' : 'text-teal-600'}`} />
                                          <span className="truncate">
                                            Dạng {pIdx + 1}: {cleanPrefix(pat.name, 'pattern') || pat.name}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextLevel = ((pat.bloomLevel || 2) % 6) + 1;
                                            updatePatternAt(cIdx, lIdx, pIdx, p => ({ ...p, bloomLevel: nextLevel }));
                                            toast.success(`Đã đổi Dạng ${pIdx + 1} sang mức Bloom L${nextLevel} (${BLOOM_LEVELS[nextLevel - 1].label})!`);
                                          }}
                                          title="Nhấn để đổi cấp độ nhận thức Bloom (L1 -> L6)"
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer hover:ring-2 hover:ring-amber-300 transition-all shrink-0 ${
                                            isPatternActive ? 'bg-white/20 text-white' : bloomMeta.color
                                          }`}
                                        >
                                          L{pat.bloomLevel || 2} ▾
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

          {/* CỘT PHẢI (8.5/12): HIỂN THỊ THEO GIAI ĐOẠN ĐANG CHỌN */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-teal-200/80 p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-black uppercase text-teal-700">
                  {skeleton.subjectName} Lớp {skeleton.grade} • Trang {activeLesson?.pageStart || '?'}-{activeLesson?.pageEnd || '?'}
                </div>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">{activeLesson?.title || 'Chưa chọn bài học'}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateLesson(les => ({ ...les, status: 'ACCEPTED' }));
                    toast.success('Đã duyệt bài học!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                  <span>✓ Duyệt Bài Này</span>
                </button>
                <button
                  type="button"
                  disabled={enrichingKnowledge}
                  onClick={handleAiEnrich}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{enrichingKnowledge ? 'Đang bổ sung...' : '✨ AI Bổ sung kiến thức'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenStudio}
                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </button>
              </div>
            </div>

            {/* GIAI ĐOẠN 1: QUÉT CẤU TRÚC SÁCH */}
            {ingestStage === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs font-black text-emerald-950">Quét Cấu Trúc Mục Lục & Dạng Bài ({targetDpi} DPI)</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Tách Chương, Bài học, Công thức cốt lõi và Dạng bài cơ bản</div>
                  </div>
                  <button
                    type="button"
                    disabled={scanning || !pdfFile}
                    onClick={handleScanSkeleton}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{scanning ? 'Đang quét...' : 'Chạy Quét Cấu Trúc (Bước 1)'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {validPatterns.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                      Bài học chưa có dạng bài nào. Bấm chạy Quét Cấu Trúc để AI trích xuất.
                    </div>
                  ) : (
                    validPatterns.map((p, pIdx) => (
                      <div key={p.patternCode || pIdx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10.5px] font-mono font-bold text-slate-700">
                            {p.patternCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                            p.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status === 'ACCEPTED' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setSelectedPatternIdx(pIdx); handleAiEnrich(); }}
                            className="p-1 rounded bg-amber-50 text-amber-700 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenStudio}
                            className="p-1 rounded bg-teal-50 text-teal-700 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* GIAI ĐOẠN 2: NẠP TÀI LIỆU SGK */}
            {ingestStage === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs font-black text-teal-950">Quét Sâu Toàn Bộ SGK (Độ phủ 70%-80%, {targetDpi} DPI)</div>
                    <div className="text-[11px] text-teal-700 mt-0.5">Bóc tách Lý thuyết, Công thức KaTeX, Bảng biểu & Sơ đồ vào CSDL</div>
                  </div>
                  <button
                    type="button"
                    disabled={filling || !pdfFile}
                    onClick={handleStartFillKnowledge}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {filling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>{filling ? `Đang nạp (${fillProgress?.progressPercent || 0}%)...` : 'Chạy Quét Sâu SGK (Bước 2)'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                  <button
                    type="button"
                    onClick={() => setIngestPart2Sector('theory')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                      ingestPart2Sector === 'theory' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lý thuyết ({currentLessonChunks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestPart2Sector('formulas')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                      ingestPart2Sector === 'formulas' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sigma className="w-3.5 h-3.5" />
                    <span>Công thức ({activeLesson?.keyFormulas?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestPart2Sector('tables')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                      ingestPart2Sector === 'tables' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Bảng & Sơ đồ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestPart2Sector('examples')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                      ingestPart2Sector === 'examples' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Ví dụ mẫu</span>
                  </button>
                </div>

                {ingestPart2Sector === 'theory' && (
                  <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                    {currentLessonChunks.map((chunk, cIdx) => (
                      <div key={cIdx} className="p-3.5 rounded-2xl bg-teal-50/20 border border-teal-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-teal-800">Trang {chunk.pageNumber} • Đoạn {chunk.chunkIndex}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyChunkText(chunk.text || '', cIdx)}
                              className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              {copiedChunkIdx === cIdx ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenStudio}
                              className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-800 text-[10px] font-bold cursor-pointer"
                            >
                              Studio
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-slate-800 leading-relaxed">
                          <MathText text={chunk.text || ''} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {ingestPart2Sector === 'formulas' && (
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                    {(activeLesson?.keyFormulas || []).map((f, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-900 overflow-x-auto">
                          <MathText text={f} />
                        </div>
                        <button type="button" onClick={handleOpenStudio} className="p-1 rounded text-teal-700 cursor-pointer">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {ingestPart2Sector === 'tables' && (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <Table2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-800">Bảng số liệu & Sơ đồ ảnh từ SGK ({targetDpi} DPI)</p>
                    <p className="text-[11px] text-slate-500">Mở Studio để tinh chỉnh hoặc chèn hình ảnh sơ đồ chuyên sâu.</p>
                  </div>
                )}

                {ingestPart2Sector === 'examples' && (
                  <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                      <div className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Ví dụ mẫu bóc tách từ SGK:</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 font-mono">
                        <MathText text="Một xe chuyển động thẳng đều với vận tốc $v = 15\\text{ m/s}$. Tính quãng đường vật đi được trong $t = 6\\text{ s}$." />
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-teal-950 flex items-center gap-1.5 flex-wrap">
                        <strong>Lời giải mẫu:</strong>
                        <MathText text="$s = v \times t = 15 \times 6 = 90\text{ m}$." />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GIAI ĐOẠN 3: CÂU HỎI VÀ BÀI TẬP SGK */}
            {ingestStage === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs font-black text-sky-950 flex items-center gap-2">
                      <span>Ngân Hàng Câu Hỏi & Bài Tập Trích Từ SGK</span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-200/80 text-sky-900 text-[10px] font-bold">
                        {activePattern?.exercises?.length || 0} câu hiện có
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-700 mt-0.5">
                      Đang chọn: <span className="font-bold text-sky-900">{cleanPrefix(activeLesson?.title || '', 'lesson')}</span> • {activePattern?.name || 'Chưa chọn dạng bài'}
                    </div>
                  </div>
                  {/* BỘ CHỌN PHẠM VI 1 TRONG 2 & NÚT SINH CÂU HỎI TINH GỌN */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1 bg-white border border-sky-200 p-1 rounded-xl shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-600 pl-2 pr-1">
                        Sinh câu hỏi:
                      </span>
                      <button
                        type="button"
                        onClick={() => setExerciseGenScope('current')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          exerciseGenScope === 'current'
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Dạng này
                      </button>
                      <button
                        type="button"
                        onClick={() => setExerciseGenScope('lesson')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          exerciseGenScope === 'lesson'
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Cả bài học ({validPatterns.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={
                        generatingExercises ||
                        batchProgress !== null ||
                        (exerciseGenScope === 'current' && !activePattern) ||
                        (exerciseGenScope === 'lesson' && validPatterns.length === 0)
                      }
                      onClick={() => {
                        if (exerciseGenScope === 'current') {
                          handleGenerateExercises();
                        } else {
                          handleGenerateExercisesForCurrentLesson();
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
                    >
                      {generatingExercises || batchProgress !== null ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang sinh...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sinh câu hỏi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* BANNER TIẾN TRÌNH SINH HÀNG LOẠT (NẾU ĐANG CHẠY) */}
                {batchProgress && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-900 via-teal-900 to-indigo-900 text-white shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black flex items-center gap-2 flex-wrap">
                          <span>Đang sinh câu hỏi tự động: {batchProgress.targetName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                            Dạng {batchProgress.current} / {batchProgress.total} ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-sky-200 truncate mt-0.5">
                          Đang xử lý: {cleanPrefix(batchProgress.currentPattern, 'pattern')}
                        </div>
                        {/* Thanh progress bar visual */}
                        <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cancelBatchRef.current = true;
                        toast.info('Đang dừng sau khi hoàn thành dạng hiện tại...');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs shrink-0"
                    >
                      Dừng Lại
                    </button>
                  </div>
                )}

                {/* THANH ĐIỀU CHỈNH CẤP ĐỘ BLOOM CHO DẠNG ĐANG CHỌN */}
                {activePattern && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Target className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {activePattern.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {activePattern.description || 'Mô tả dạng bài'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10.5px] font-bold text-slate-500">Mức Bloom mục tiêu:</span>
                      {BLOOM_LEVELS.map(b => {
                        const isCur = (activePattern.bloomLevel || 2) === b.level;
                        return (
                          <button
                            key={b.level}
                            type="button"
                            onClick={() => {
                              updatePattern(p => ({ ...p, bloomLevel: b.level }));
                              toast.success(`Đã chuyển dạng bài sang mức ${b.label}!`);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer transition-all border ${
                              isCur
                                ? 'bg-sky-700 text-white border-sky-700 shadow-xs ring-2 ring-sky-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(!activePattern?.exercises || activePattern.exercises.length === 0) ? (
                  <div className="p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 space-y-2">
                    <HelpCircle className="w-8 h-8 text-sky-500 mx-auto" />
                    <p className="font-bold text-slate-800">Chưa có bài tập nào được lưu trữ cho dạng bài này.</p>
                    <p className="text-[11px] text-slate-500">Bấm nút "Sinh câu hỏi" ở trên để tạo câu hỏi trắc nghiệm kèm KaTeX.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {activePattern.exercises.map((ex, exIdx) => (
                      <div key={ex.id || exIdx} className="p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center text-[10.5px] font-black">
                              {exIdx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              Bài tập SGK • Trang {ex.sourcePage || activeLesson?.pageStart || '?'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Bloom L{ex.bloomLevel || 2}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              ex.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ex.status === 'ACCEPTED' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                            </span>
                            <button type="button" onClick={handleOpenStudio} className="p-1 rounded text-sky-700 cursor-pointer">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                          <MathText text={ex.stem} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(ex.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                ex.correctIndex === optIdx ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-white border-slate-200'
                              }`}
                            >
                              <MathText text={opt} />
                              {ex.correctIndex === optIdx && <span className="text-emerald-700 font-bold text-xs">✓</span>}
                            </div>
                          ))}
                        </div>

                        {ex.solution && (
                          <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-sky-950">
                            <strong>Hướng dẫn giải KaTeX: </strong>
                            <MathText text={ex.solution} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP XÁC NHẬN SINH THÊM CÂU HỎI (THAY THẾ WINDOW.CONFIRM / ALERT) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{confirmModal.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Bổ sung bài tập tự động bằng AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Phạm vi áp dụng:</span>
                  <span className="font-bold text-slate-900">{confirmModal.targetName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tổng số dạng bài:</span>
                  <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                    {confirmModal.patternCount} dạng
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Số câu sinh thêm:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    +{confirmModal.patternCount * (confirmModal.questionsPerPattern || 3)} câu hỏi mới
                  </span>
                </div>
              </div>

              {/* Thông báo cam kết CHỈ SINH THÊM, KHÔNG THAY THẾ */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Cam kết chỉ sinh thêm, không thay thế:</div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed">
                    Hệ thống chỉ <strong>sinh thêm</strong> câu hỏi mới và nối tiếp vào danh sách. Toàn bộ các câu hỏi đã có trước đó đều được <strong>giữ nguyên 100%</strong>, tuyệt đối không bị ghi đè hoặc thay thế.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-all"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const onConfirm = confirmModal.onConfirm;
                  setConfirmModal(null);
                  if (onConfirm) onConfirm();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Bắt Đầu Sinh Thêm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
