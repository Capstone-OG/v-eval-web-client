import React, { useState, useEffect, useMemo } from 'react';
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
  HelpCircle
} from 'lucide-react';
import aiService from '../../services/aiService';
import MathText from '../common/MathText';
import { useToast } from '../../context/ToastContext';
import {
  getStoredTextbookContext,
  saveStoredTextbookContext,
  isNonPedagogical,
  filterPedagogicalChapters
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

  // Skeleton Cấu Trúc SGK
  const [skeleton, setSkeleton] = useState({
    fileName: initCtx.fileName || '',
    subjectCode: initCtx.subjectCode || 'PHYS',
    subjectName: initCtx.subjectName || 'Vật lí',
    grade: initCtx.grade || 10,
    bookEdition: initCtx.bookEdition || 'Cánh Diều',
    versionTag: initCtx.versionTag || '2025-2026',
    isVersionLocked: false,
    status: 'ACCEPTED',
    totalPages: 0,
    chapters: []
  });

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(initCtx.selectedChapterIdx || 0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(initCtx.selectedLessonIdx || 0);
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(initCtx.selectedPatternIdx || 0);

  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);
  const [textbookExercises, setTextbookExercises] = useState([]);

  const validChapters = (skeleton.chapters || []).filter(ch => ch && !isNonPedagogical(ch.title));
  const hasData = validChapters.length > 0;
  const activeChapter = hasData ? (validChapters[selectedChapterIdx] || validChapters[0]) : null;
  const validLessons = (activeChapter?.lessons || []).filter(l => l && !isNonPedagogical(l.title));
  const activeLesson = validLessons.length > 0 ? (validLessons[selectedLessonIdx] || validLessons[0]) : null;
  const validPatterns = (activeLesson?.patterns || []).filter(p => p && !isNonPedagogical(p.name));
  const activePattern = validPatterns.length > 0 ? (validPatterns[selectedPatternIdx] || validPatterns[0]) : null;
  const isLocked = skeleton.isVersionLocked;

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
    chapterMap.forEach((lessonMap, cName) => {
      const lessons = Array.from(lessonMap.values()).filter(l => !isNonPedagogical(l.title));
      if (lessons.length === 0) return;
      const minPage = Math.min(...lessons.map(l => l.pageStart));
      const maxPage = Math.max(...lessons.map(l => l.pageEnd));
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

    setSkeleton(prev => ({
      ...prev,
      fileName: found.fileName,
      subjectCode: targetSub,
      subjectName: targetSubName,
      grade: targetG,
      bookEdition: found.bookEdition || prev.bookEdition,
      totalPages: found.totalPages || prev.totalPages,
      chapters: detectedChapters.length > 0 ? detectedChapters : prev.chapters
    }));
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

  // AI SINH BÀI TẬP (PHẦN 3)
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

      const newEx = (res?.exercises || []).map(ex => ({
        ...ex,
        status: 'PENDING_REVIEW',
        sourcePage: activeLesson.pageStart || 1,
        reusable: true
      }));

      if (newEx.length > 0) {
        updatePattern(pat => ({
          ...pat,
          exercises: [...(pat.exercises || []), ...newEx]
        }));
        setTextbookExercises(prev => [...prev, ...newEx]);
        toast.success(`AI đã sinh ${newEx.length} bài tập mới (Chờ duyệt)!`);
      }
    } catch (err) {
      toast.error('Lỗi sinh bài tập: ' + (err?.response?.data?.message || err.message));
    } finally {
      setGeneratingExercises(false);
    }
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
      const chapters = [...prev.chapters];
      const ch = { ...chapters[selectedChapterIdx] };
      const lessons = [...ch.lessons];
      lessons[selectedLessonIdx] = updater({ ...lessons[selectedLessonIdx] });
      ch.lessons = lessons;
      chapters[selectedChapterIdx] = ch;
      return { ...prev, chapters };
    });
  };

  const updatePattern = (updater) => {
    if (isLocked || !activeLesson || !activePattern) return;
    updateLesson(les => {
      const patterns = [...(les.patterns || [])];
      patterns[selectedPatternIdx] = updater({ ...patterns[selectedPatternIdx] });
      return { ...les, patterns };
    });
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
          {/* CỘT TRÁI (3.5/12): CHƯƠNG & BÀI HỌC */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-teal-200/80 p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-teal-100 pb-2">
              <span className="text-xs font-black uppercase text-teal-950 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Chương & Cấu trúc ({validChapters.length})</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-[28vh] overflow-y-auto pr-1">
              {validChapters.map((ch, idx) => {
                const isSel = idx === selectedChapterIdx;
                const lessonsInCh = (ch.lessons || []).filter(l => !isNonPedagogical(l.title));
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedChapterIdx(idx); setSelectedLessonIdx(0); setSelectedPatternIdx(0); }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                        : 'bg-teal-50/20 border-teal-100 hover:border-teal-300 text-slate-800'
                    }`}
                  >
                    <div className="line-clamp-1">{ch.title}</div>
                    <div className={`text-[10px] flex items-center justify-between mt-1 ${isSel ? 'text-teal-100' : 'text-slate-500'}`}>
                      <span>{lessonsInCh.length} bài</span>
                      <span>Tr.{ch.pageStart}–{ch.pageEnd}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-b border-teal-100 pb-2 pt-1">
              <span className="text-xs font-black uppercase text-teal-950 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-teal-600" />
                <span>Bài học ({validLessons.length})</span>
              </span>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {validLessons.map((les, idx) => {
                const isSel = idx === selectedLessonIdx;
                const patCount = (les.patterns || []).filter(p => !isNonPedagogical(p.name)).length;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedLessonIdx(idx); setSelectedPatternIdx(0); }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="line-clamp-2">{les.title}</div>
                    <div className="text-[10px] text-teal-700 flex items-center justify-between mt-1 font-semibold">
                      <span>{patCount} dạng</span>
                      <span>Tr.{les.pageStart}–{les.pageEnd}</span>
                    </div>
                  </button>
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
                    <div className="text-xs font-black text-sky-950">Ngân Hàng Câu Hỏi & Bài Tập Trích Từ SGK</div>
                    <div className="text-[11px] text-sky-700 mt-0.5">Trích trực tiếp từ SGK, lưu vào ngân hàng để tái sử dụng lâu dài</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={generatingExercises || !activePattern}
                      onClick={handleGenerateExercises}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {generatingExercises ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      <span>{generatingExercises ? 'AI đang sinh...' : '⚡ AI Sinh Câu Hỏi Mới'}</span>
                    </button>
                  </div>
                </div>

                {(!activePattern?.exercises || activePattern.exercises.length === 0) ? (
                  <div className="p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 space-y-2">
                    <HelpCircle className="w-8 h-8 text-sky-500 mx-auto" />
                    <p className="font-bold text-slate-800">Chưa có bài tập nào được lưu trữ cho dạng bài này.</p>
                    <p className="text-[11px] text-slate-500">Bấm nút "⚡ AI Sinh Câu Hỏi Mới" ở trên để tạo câu hỏi trắc nghiệm kèm KaTeX.</p>
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
    </div>
  );
}
