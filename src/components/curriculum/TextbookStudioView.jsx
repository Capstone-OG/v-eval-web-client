import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  Copy,
  ChevronRight,
  BookMarked,
  Lightbulb,
  Target,
  FlaskConical,
  ExternalLink,
  Save,
  Check,
  Zap,
  FolderOpen,
  Eye,
  Search,
  X
} from 'lucide-react';
import aiService from '../../services/aiService';
import MathText from '../common/MathText';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import { useToast } from '../../context/ToastContext';

const BLOOM_LEVELS = [
  { level: 1, label: 'L1. Nhớ (Remember)', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { level: 2, label: 'L2. Hiểu (Understand)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { level: 3, label: 'L3. Vận dụng (Apply)', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  { level: 4, label: 'L4. Phân tích (Analyze)', color: 'bg-sky-50 text-sky-700 border-sky-300' },
  { level: 5, label: 'L5. Đánh giá (Evaluate)', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { level: 6, label: 'L6. Sáng tạo (Create)', color: 'bg-purple-50 text-purple-700 border-purple-300' }
];

const KATEX_SNIPPETS = [
  { label: 'Phân số', code: '$\\frac{a}{b}$' },
  { label: 'Mũ', code: '$x^2$' },
  { label: 'Căn', code: '$\\sqrt{x}$' },
  { label: 'Tích phân', code: '$\\int_{a}^{b} f(x)\\,dx$' },
  { label: 'Tổng', code: '$\\sum_{i=1}^{n} x_i$' },
  { label: 'Hợp', code: '$A \\cup B$' },
  { label: 'Giao', code: '$A \\cap B$' },
  { label: 'Thuộc', code: '$x \\in \\mathbb{R}$' },
  { label: 'Với mọi', code: '$\\forall x$' },
  { label: 'Tồn tại', code: '$\\exists x$' },
  { label: 'Suy ra', code: '$\\Rightarrow$' },
  { label: 'Phản ứng', code: '$\\xrightarrow{t^\\circ}$' },
  { label: 'Vectơ', code: '$\\vec{v}$' }
];

const SUBJECT_OPTIONS = [
  { code: 'MATH', name: 'Toán học' },
  { code: 'PHYS', name: 'Vật lí' },
  { code: 'CHEM', name: 'Hóa học' },
  { code: 'LIT', name: 'Ngữ văn' },
  { code: 'ENG', name: 'Tiếng Anh' },
  { code: 'BIO', name: 'Sinh học' },
  { code: 'HIST', name: 'Lịch sử' },
  { code: 'GEO', name: 'Địa lí' }
];

export default function TextbookStudioView({ onBack, onRefreshSources }) {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('');
  const [filling, setFilling] = useState(false);
  const [fillProgress, setFillProgress] = useState(null);
  const [generatingExercises, setGeneratingExercises] = useState(false);

  // Kho SGK từ Database
  const [ingestedSources, setIngestedSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [filledChunks, setFilledChunks] = useState([]);

  // Lọc lý thuyết trong Sector 1: 'lesson' (theo bài) | 'all' (toàn sách)
  const [theoryFilterMode, setTheoryFilterMode] = useState('lesson');
  const [theorySearchQuery, setTheorySearchQuery] = useState('');

  // Active Sector Tab: 'theory' | 'formulas' | 'examples' | 'patterns' | 'exercises'
  const [activeSector, setActiveSector] = useState('theory');

  // Modal Studio & Modal Reader
  const [studioTarget, setStudioTarget] = useState(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);

  // Skeleton Cấu Trúc SGK (Mặc định rỗng khi chưa parse hoặc chưa chọn sách)
  const [skeleton, setSkeleton] = useState({
    fileName: '',
    subjectCode: 'PHYS',
    subjectName: 'Vật lí',
    grade: 10,
    bookEdition: 'Cánh Diều',
    versionTag: '2025-2026',
    isVersionLocked: false,
    totalPages: 0,
    chapters: []
  });

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(0);

  const [newFormulaInput, setNewFormulaInput] = useState('');
  const [copiedFormula, setCopiedFormula] = useState(null);
  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);

  const handleCopyChunkText = (text, idx) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedChunkIdx(idx);
      toast.success('Đã sao chép đoạn lý thuyết!');
      setTimeout(() => setCopiedChunkIdx(null), 2000);
    }
  };

  const hasData = skeleton.chapters && skeleton.chapters.length > 0;
  const activeChapter = hasData ? (skeleton.chapters[selectedChapterIdx] || skeleton.chapters[0]) : null;
  const activeLesson = activeChapter?.lessons ? (activeChapter.lessons[selectedLessonIdx] || activeChapter.lessons[0]) : null;
  const activePattern = activeLesson?.patterns ? (activeLesson.patterns[selectedPatternIdx] || activeLesson.patterns[0]) : null;
  const isLocked = skeleton.isVersionLocked;

  // Lọc Chunks thực tế từ CSDL SGK tương ứng với bài học đang chọn (ĐẢM BẢO 100% CÓ NỘI DUNG ĐỔ LÊN)
  const currentLessonChunks = React.useMemo(() => {
    if (!filledChunks || filledChunks.length === 0) return [];

    // Nếu người dùng chọn xem toàn bộ SGK
    if (theoryFilterMode === 'all') {
      return filledChunks;
    }

    // Nếu có tìm kiếm từ khóa
    if (theorySearchQuery.trim()) {
      const q = theorySearchQuery.toLowerCase().trim();
      return filledChunks.filter(c => (c.text || '').toLowerCase().includes(q) || (c.patternName || '').toLowerCase().includes(q));
    }

    // 1. Khớp theo khoảng trang bài học (ƯU TIÊN TUYỆT ĐỐI - CHÍNH XÁC NHẤT CHO SGK)
    if (activeLesson?.pageStart && activeLesson?.pageEnd) {
      const byPage = filledChunks.filter(c => c.pageNumber >= activeLesson.pageStart && c.pageNumber <= activeLesson.pageEnd);
      if (byPage.length > 0) return byPage;
    }

    // 2. Khớp theo tiêu đề bài học
    if (activeLesson?.title) {
      const cleanLTitle = activeLesson.title.toLowerCase().replace(/^(bài\s*\d*[:\.\-]?\s*)/i, '').trim();
      const byLessonName = filledChunks.filter(c => {
        if (!c.lessonName || c.lessonName === 'N/A') return false;
        const cleanCName = c.lessonName.toLowerCase().replace(/^(bài\s*\d*[:\.\-]?\s*)/i, '').trim();
        return cleanLTitle.includes(cleanCName) || cleanCName.includes(cleanLTitle);
      });
      if (byLessonName.length > 0) return byLessonName;

      // 3. Khớp theo từ khóa trong nội dung
      const keywords = cleanLTitle.split(/[\s,\-]+/).filter(w => w.length >= 4);
      if (keywords.length > 0) {
        const byKeywords = filledChunks.filter(c => {
          const txt = (c.text || '').toLowerCase();
          return keywords.some(k => txt.includes(k));
        });
        if (byKeywords.length > 0) return byKeywords.slice(0, 10);
      }
    }

    // 4. Nếu bài học chưa khớp, hiển thị các trang thuộc Chương đang chọn
    if (activeChapter?.pageStart && activeChapter?.pageEnd) {
      const byChapter = filledChunks.filter(c => c.pageNumber >= activeChapter.pageStart && c.pageNumber <= activeChapter.pageEnd);
      if (byChapter.length > 0) return byChapter;
    }

    // 5. Fallback hiển thị các chunks gần nhất của sách (không bao giờ để trắng!)
    return filledChunks.slice(0, 12);
  }, [filledChunks, activeLesson, activeChapter, theoryFilterMode, theorySearchQuery]);

  // Hàm tải chunks thực tế cho cuốn sách từ CSDL
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

    const found = sourceList.find(s => s.sourceId === sid);
    if (found?.chunks && found.chunks.length > 0) {
      setFilledChunks(found.chunks);
      return found.chunks;
    }

    try {
      const res = await aiService.getTextbookChunks(sid);
      const chunks = res?.chunks || [];
      setFilledChunks(chunks);
      return chunks;
    } catch (err) {
      console.warn('Lỗi lấy chunks của sách:', err);
      return [];
    }
  };

  // Tải danh sách nguồn SGK đã nạp vào Database khi khởi động & TỰ ĐỘNG NẠP CHUNKS VÀO STATE
  const loadIngestedSources = async (targetSourceId = null) => {
    try {
      const res = await aiService.getIngestedTextbooks();
      const list = res?.sources || [];
      setIngestedSources(list);

      const sidToLoad = targetSourceId 
        || selectedSourceId 
        || (skeleton.fileName && list.find(s => s.fileName?.toLowerCase() === skeleton.fileName.toLowerCase())?.sourceId)
        || (list.find(s => s.fileName?.includes('VL 10 CD')) || list[0])?.sourceId;

      if (sidToLoad) {
        setSelectedSourceId(sidToLoad);
        await loadChunksForSource(sidToLoad, list);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách SGK:', err);
    }
  };

  useEffect(() => {
    loadIngestedSources();
  }, []);

  // Xử lý khi người dùng CHỦ ĐỘNG chọn một cuốn sách từ Kho SGK
  const handleSelectSourceFromVault = async (sourceId) => {
    if (!sourceId) {
      setSelectedSourceId('');
      setFilledChunks([]);
      setSkeleton(prev => ({ ...prev, fileName: '', totalPages: 0, chapters: [] }));
      return;
    }
    const found = ingestedSources.find(s => s.sourceId === sourceId);
    if (!found) return;

    setSelectedSourceId(sourceId);
    const chunks = await loadChunksForSource(sourceId, ingestedSources);

    // Nhận diện Chương & Bài từ các chunks đã lưu (chỉ khi skeleton chưa có sẵn khung chi tiết)
    if (!skeleton.chapters || skeleton.chapters.length <= 1) {
      const detectedChapters = [];
      const chapterMap = new Map();

      (chunks || []).forEach(chunk => {
        const cName = chunk.chapterName?.trim() || 'Chương 1: Kiến thức trọng tâm';
        const lName = chunk.lessonName?.trim() || 'Bài 1: Lý thuyết cơ bản';
        const pName = chunk.patternName?.trim() || '';

        if (!chapterMap.has(cName)) {
          chapterMap.set(cName, new Map());
        }
        const lessonMap = chapterMap.get(cName);
        if (!lessonMap.has(lName)) {
          lessonMap.set(lName, {
            lessonNumber: lessonMap.size + 1,
            title: lName,
            pageStart: chunk.pageNumber,
            pageEnd: chunk.pageNumber,
            keyFormulas: [],
            patterns: []
          });
        }

        const lesObj = lessonMap.get(lName);
        if (chunk.pageNumber < lesObj.pageStart) lesObj.pageStart = chunk.pageNumber;
        if (chunk.pageNumber > lesObj.pageEnd) lesObj.pageEnd = chunk.pageNumber;

        if (pName && !lesObj.patterns.some(p => p.name === pName)) {
          lesObj.patterns.push({
            patternCode: `P${lesObj.patterns.length + 1}`,
            name: pName,
            bloomLevel: 2,
            description: 'Dạng bài bóc tách từ SGK.',
            method: 'Phương pháp sư phạm chuẩn SGK.',
            exercises: []
          });
        }
      });

      let chIdx = 1;
      chapterMap.forEach((lessonMap, cName) => {
        const lessons = Array.from(lessonMap.values());
        const minPage = lessons.length > 0 ? Math.min(...lessons.map(l => l.pageStart)) : 1;
        const maxPage = lessons.length > 0 ? Math.max(...lessons.map(l => l.pageEnd)) : 20;

        detectedChapters.push({
          chapterNumber: chIdx,
          title: cName,
          pageStart: minPage,
          pageEnd: maxPage,
          lessons: lessons
        });
        chIdx++;
      });

      setSkeleton(prev => ({
        ...prev,
        fileName: found.fileName,
        subjectCode: found.subjectCode || prev.subjectCode,
        subjectName: found.subjectName || prev.subjectName,
        grade: found.grade || prev.grade,
        bookEdition: found.bookEdition || prev.bookEdition,
        totalPages: found.totalPages || prev.totalPages,
        chapters: detectedChapters.length > 0 ? detectedChapters : prev.chapters
      }));
    } else {
      // Giữ nguyên các Chương/Bài học chuẩn GDPT 2018 đã quét ở Bước 1, chỉ cập nhật fileName & totalPages
      setSkeleton(prev => ({
        ...prev,
        fileName: found.fileName,
        totalPages: found.totalPages || prev.totalPages
      }));
    }

    setSelectedChapterIdx(0);
    setSelectedLessonIdx(0);
    setSelectedPatternIdx(0);
    toast.success(`Đã nạp ${chunks.length} trang/chunks lý thuyết của SGK "${found.fileName}"!`);
  };

  // Bước 1: Quét Nhanh Khung Mục Lục & Dạng Bài (5-10s)
  const handleScanSkeleton = async () => {
    if (!pdfFile) {
      toast.warning('Vui lòng chọn file PDF SGK trước khi quét mục lục!');
      return;
    }
    setScanning(true);
    setScanStatusMsg('🚀 Bước 1: Đang quét Mục lục & Cấu trúc để dựng toàn bộ cây Chương → Bài → Dạng bài...');
    try {
      const data = await aiService.scanTextbookSkeleton(pdfFile, {
        subjectCode: skeleton.subjectCode,
        grade: skeleton.grade,
        bookEdition: skeleton.bookEdition
      });
      const chapCount = data.chapters?.length || 0;
      setSkeleton(prev => ({
        ...prev,
        ...data,
        chapters: chapCount > 0 ? data.chapters : prev.chapters
      }));
      setSelectedChapterIdx(0);
      setSelectedLessonIdx(0);
      setSelectedPatternIdx(0);
      setScanStatusMsg(
        chapCount > 0
          ? `✅ [Bước 1 Hoàn tất] Đã bóc tách thành công ${chapCount} Chương, ${data.chapters?.reduce((a, c) => a + (c.lessons?.length || 0), 0)} Bài học chuẩn GDPT 2018!`
          : '⚠️ Không nhận diện được mục lục tự động. Vui lòng kiểm tra lại file.'
      );
      toast.success(`Đã quét xong khung mục lục (${chapCount} chương)!`);

      // Tự động kết nối Chunks tri thức nếu file này đã có sẵn trong CSDL
      const matchedSource = ingestedSources.find(s => s.fileName?.toLowerCase() === pdfFile.name.toLowerCase());
      if (matchedSource) {
        setSelectedSourceId(matchedSource.sourceId);
        await loadChunksForSource(matchedSource.sourceId);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setScanStatusMsg(`❌ Lỗi quét khung: ${msg}`);
      toast.error('Lỗi quét khung: ' + msg);
    } finally {
      setScanning(false);
    }
  };

  // Bước 2: Quét Sâu Toàn Bộ Nội Dung SGK (Độ phủ 70% - 80%)
  const handleStartFillKnowledge = async () => {
    if (!pdfFile) {
      toast.warning('Vui lòng chọn file PDF SGK để quét sâu toàn bộ nội dung!');
      return;
    }
    setFilling(true);
    setScanStatusMsg('⏳ Bước 2: Đang dùng Vision AI quét sâu toàn bộ trang SGK (độ phủ 70%-80%), bóc tách Lý thuyết, Công thức và Ví dụ...');
    try {
      const job = await aiService.uploadTextbookPdf(pdfFile, {
        domainId: `Domain-${skeleton.subjectCode || 'PHYS'}`,
        skillId: 'Skill-SGK',
        docType: 'TEXTBOOK',
        ocrMode: 'VISION_AI', // Đảm bảo PDF scan thuần ảnh được gửi ảnh trực tiếp đến Gemini Vision
        forceReingest: true,  // Nạp lại sạch sẽ không bị vướng checkpoint cũ
        targetDpi: 72,        // Nâng DPI 72 để chữ và công thức KaTeX rõ nét
        batchSize: 4          // 4 trang/lượt tối ưu siêu tốc cho Vision AI
      });
      setFillProgress(job);

      const poll = setInterval(async () => {
        try {
          const st = await aiService.getTextbookJobStatus(job.jobId);
          setFillProgress(st);
          if (st.status === 'COMPLETED') {
            clearInterval(poll);
            setFilling(false);
            setScanStatusMsg(`🎉 [Bước 2 Hoàn tất] Đã nạp thành công ${st.totalPages || ''} trang SGK vào Database Supabase!`);
            toast.success('Đã quét sâu và nạp toàn bộ nội dung SGK vào Database!');
            const finishedSid = st.sourceId || st.result?.documentId;
            if (finishedSid) {
              setSelectedSourceId(finishedSid);
            }
            if (st.result?.chunks && st.result.chunks.length > 0) {
              setFilledChunks(st.result.chunks);
            }
            await loadIngestedSources(finishedSid);
            onRefreshSources?.();
          } else if (st.status === 'FAILED') {
            clearInterval(poll);
            setFilling(false);
            setScanStatusMsg(`❌ Bước 2 thất bại: ${st.errorMessage || 'Lỗi không xác định'}`);
            toast.error('Quét sâu nội dung thất bại: ' + (st.errorMessage || 'Lỗi'));
          }
        } catch {
          // ignore transient polling error
        }
      }, 2000);
    } catch (err) {
      setFilling(false);
      setScanStatusMsg('❌ Không thể bắt đầu quét sâu: ' + err.message);
      toast.error('Lỗi khởi động quét sâu: ' + err.message);
    }
  };

  // AI Sinh Bài Tập Cho Dạng Bài (Sector 5)
  const handleGenerateExercisesForPattern = async () => {
    if (!activePattern || !activeLesson) return;
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

      const newExList = res?.exercises || [];
      if (newExList.length > 0) {
        updatePattern(pat => ({
          ...pat,
          exercises: [...(pat.exercises || []), ...newExList]
        }));
        toast.success(`AI đã sinh thành công ${newExList.length} bài tập cho dạng "${activePattern.name}"!`);
      } else {
        toast.warning('Chưa sinh được bài tập mới từ AI.');
      }
    } catch (err) {
      toast.error('Lỗi sinh bài tập: ' + (err?.response?.data?.message || err.message));
    } finally {
      setGeneratingExercises(false);
    }
  };

  // Helper cập nhật Lesson
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

  // Helper cập nhật Pattern
  const updatePattern = (updater) => {
    if (isLocked || !activeLesson || !activePattern) return;
    updateLesson(les => {
      const patterns = [...(les.patterns || [])];
      patterns[selectedPatternIdx] = updater({ ...patterns[selectedPatternIdx] });
      return { ...les, patterns };
    });
  };

  // Thao tác Thêm / Xóa
  const addChapter = () => {
    if (isLocked) return;
    const nextNum = skeleton.chapters.length + 1;
    setSkeleton(prev => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        { chapterNumber: nextNum, title: `Chương ${nextNum}: Tiêu đề chương mới`, pageStart: 1, pageEnd: 30, lessons: [] }
      ]
    }));
    setSelectedChapterIdx(skeleton.chapters.length);
    setSelectedLessonIdx(0);
    setSelectedPatternIdx(0);
  };

  const addLesson = () => {
    if (isLocked || !activeChapter) return;
    const nextNum = (activeChapter.lessons?.length || 0) + 1;
    setSkeleton(prev => {
      const chapters = [...prev.chapters];
      const ch = { ...chapters[selectedChapterIdx] };
      ch.lessons = [
        ...(ch.lessons || []),
        { lessonNumber: nextNum, title: `Bài ${nextNum}: Bài học mới`, pageStart: 1, pageEnd: 15, keyFormulas: [], patterns: [] }
      ];
      chapters[selectedChapterIdx] = ch;
      return { ...prev, chapters };
    });
    setSelectedLessonIdx(activeChapter.lessons?.length || 0);
    setSelectedPatternIdx(0);
  };

  const addPattern = () => {
    if (isLocked || !activeLesson) return;
    const nextNum = (activeLesson.patterns?.length || 0) + 1;
    updateLesson(les => ({
      ...les,
      patterns: [
        ...(les.patterns || []),
        {
          patternCode: `C${selectedChapterIdx + 1}_B${selectedLessonIdx + 1}_D${nextNum}`,
          name: `Dạng ${nextNum}: Tên dạng bài mới`,
          bloomLevel: 2,
          description: 'Mô tả mục tiêu kỹ năng của dạng bài này.',
          method: 'Phương pháp giải từng bước.',
          exercises: []
        }
      ]
    }));
    setSelectedPatternIdx(activeLesson.patterns?.length || 0);
  };

  const addExerciseManual = () => {
    if (isLocked || !activePattern) return;
    const nextId = (activePattern.exercises?.length || 0) + 1;
    updatePattern(pat => ({
      ...pat,
      exercises: [
        ...(pat.exercises || []),
        {
          id: `ex_manual_${Date.now()}`,
          stem: `Câu hỏi bài tập số ${nextId}: Nhập nội dung câu hỏi...`,
          options: ['A. Lựa chọn A', 'B. Lựa chọn B', 'C. Lựa chọn C', 'D. Lựa chọn D'],
          correctIndex: 0,
          bloomLevel: pat.bloomLevel || 2,
          solution: 'Hướng dẫn giải chi tiết cho câu hỏi.'
        }
      ]
    }));
  };

  const handleCopyFormula = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedFormula(code);
    setTimeout(() => setCopiedFormula(null), 1500);
    toast.success('Đã sao chép công thức KaTeX!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER HIỆN ĐẠI (Emerald & Slate) */}
      <header className="bg-white border-b border-emerald-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
          <div>
            <h1 className="text-base font-black text-emerald-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Studio Sách Giáo Khoa & Số Hóa Sư Phạm</span>
            </h1>
            <p className="text-[11px] text-emerald-700">
              Quy trình chuẩn: Bước 1 (Mục lục & Dạng bài 5–10s) → Bước 2 (Quét sâu nội dung 70%–80%) → Phân 5 Sector chuyên biệt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filledChunks.length > 0 && (
            <button
              type="button"
              onClick={() => setIsReaderModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Mở trình xem toàn văn SGK theo từng trang"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Toàn Văn SGK ({filledChunks.length} chunks)</span>
            </button>
          )}

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
            <span>{isLocked ? `Đã Khóa Phiên Bản (${skeleton.versionTag})` : `Mở Khóa (${skeleton.versionTag})`}</span>
          </button>
        </div>
      </header>

      {/* 2. PIPELINE STEPPER & ACTION TOOLBAR (2 BƯỚC RÕ RÀNG) */}
      <div className="bg-white border-b border-emerald-100 px-6 py-3 space-y-3">
        {/* Hàng 1: Stepper 2 bước lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Box Bước 1 */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <div className="text-xs font-black text-emerald-950">Bước 1: Quét Mục Lục & Nhận Diện Toàn Bộ Chương - Bài (5-10s)</div>
                <div className="text-[11px] text-emerald-700">Tách toàn bộ Chương, Bài học, Công thức cốt lõi và Dạng bài của sách</div>
              </div>
            </div>
            <button
              type="button"
              disabled={scanning || !pdfFile}
              onClick={handleScanSkeleton}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
            >
              {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{scanning ? 'Đang quét...' : 'Chạy Bước 1'}</span>
            </button>
          </div>

          {/* Box Bước 2 */}
          <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <div className="text-xs font-black text-teal-950">Bước 2: Quét Sâu Toàn Bộ Nội Dung SGK (Độ phủ 70%-80%)</div>
                <div className="text-[11px] text-teal-700">Bóc tách sâu Lý thuyết, Ví dụ SGK và lưu trữ vào Supabase Database</div>
              </div>
            </div>
            <button
              type="button"
              disabled={filling || !pdfFile}
              onClick={handleStartFillKnowledge}
              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
            >
              {filling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{filling ? `Đang quét (${fillProgress?.progressPercent || 0}%)` : 'Chạy Bước 2'}</span>
            </button>
          </div>
        </div>

        {/* Hàng 2: Bộ chọn tham số Lớp/Môn/Năm học & Upload file & Kho SGK */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              disabled={isLocked}
              value={skeleton.grade}
              onChange={e => setSkeleton(prev => ({ ...prev, grade: Number(e.target.value) }))}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs font-bold text-emerald-900"
            >
              <option value={10}>Lớp 10</option>
              <option value={11}>Lớp 11</option>
              <option value={12}>Lớp 12</option>
            </select>

            <select
              disabled={isLocked}
              value={skeleton.subjectCode}
              onChange={e => {
                const sub = SUBJECT_OPTIONS.find(s => s.code === e.target.value);
                setSkeleton(prev => ({ ...prev, subjectCode: e.target.value, subjectName: sub?.name || e.target.value }));
              }}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs font-bold text-emerald-900"
            >
              {SUBJECT_OPTIONS.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>

            <input
              disabled={isLocked}
              value={skeleton.bookEdition}
              onChange={e => setSkeleton(prev => ({ ...prev, bookEdition: e.target.value }))}
              placeholder="Bộ sách (Cánh Diều, Chân trời...)"
              className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs font-semibold w-36"
            />

            <input
              disabled={isLocked}
              value={skeleton.versionTag}
              onChange={e => setSkeleton(prev => ({ ...prev, versionTag: e.target.value }))}
              placeholder="Năm học (2025-2026)"
              className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs font-mono w-24"
            />

            <label className="px-3 py-1.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer flex items-center gap-1.5 transition-colors">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[180px] truncate">{pdfFile ? pdfFile.name : 'Chọn file PDF SGK...'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0] || null;
                  setPdfFile(f);
                  if (f) {
                    setSkeleton(prev => ({
                      ...prev,
                      fileName: f.name
                    }));
                    const existing = ingestedSources.find(s => s.fileName?.toLowerCase() === f.name.toLowerCase());
                    if (existing) {
                      setSelectedSourceId(existing.sourceId);
                      await loadChunksForSource(existing.sourceId);
                      toast.info(`Phát hiện SGK "${f.name}" đã có trong CSDL (${existing.totalPages} trang). Đã tự động kết nối tri thức!`);
                    } else {
                      setSelectedSourceId('');
                      setFilledChunks([]);
                    }
                  }
                }}
              />
            </label>
          </div>

          {/* Dropdown Kho SGK đã nạp (Người dùng chủ động chọn mới nạp) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">Tải từ Kho SGK:</span>
            <select
              value={selectedSourceId}
              onChange={e => handleSelectSourceFromVault(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-emerald-950 max-w-xs truncate"
            >
              <option value="">-- Chọn cuốn SGK đã lưu trong CSDL --</option>
              {ingestedSources.map(s => (
                <option key={s.sourceId} value={s.sourceId}>
                  {s.fileName} ({s.subjectName} L{s.grade} • {s.totalPages} trang)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. STATUS NOTIFICATION BANNER */}
      {(scanStatusMsg || fillProgress) && (
        <div className="bg-emerald-950 text-emerald-100 px-6 py-2.5 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">{scanStatusMsg || fillProgress?.currentStep}</span>
          </div>
          {fillProgress && (
            <span className="font-mono font-bold text-emerald-300">
              {fillProgress.status} • {fillProgress.progressPercent || 0}%
            </span>
          )}
        </div>
      )}

      {/* 4. WORKSPACE CHÍNH (EMPTY STATE KHI CHƯA CHỌN SÁCH HOẶC 2 CỘT CHUYÊN BIỆT KHI CÓ DỮ LIỆU) */}
      {!hasData ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Studio Parse & Biên Soạn Sách Giáo Khoa (SGK)</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Trang này được thiết kế chuyên biệt để tách Mục lục, Chương, Bài, Dạng bài, Công thức và bóc tách sâu tri thức SGK.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Cách 1: Nạp file mới
                </div>
                <div className="text-[11px] text-emerald-700">
                  Chọn file PDF SGK ở trên rồi bấm <strong>"Chạy Bước 1"</strong> để quét toàn bộ Mục lục & Dạng bài.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-600" /> Cách 2: Xem sách đã có
                </div>
                <div className="text-[11px] text-slate-600">
                  Chọn một cuốn trong dropdown <strong>"Tải từ Kho SGK"</strong> ở trên để nạp tri thức vào Studio.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* CỘT TRÁI (3.5/12): Điều hướng Chương & Bài Học */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-emerald-200/80 p-4 shadow-sm flex flex-col gap-4">
            {/* Header Chương */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Chương & Cấu Trúc ({skeleton.chapters.length})
                </h2>
              </div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={addChapter}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Thêm
                </button>
              )}
            </div>

            {/* Danh sách Chương */}
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              {skeleton.chapters.map((ch, idx) => {
                const isSel = idx === selectedChapterIdx;
                const totalPatterns = (ch.lessons || []).reduce((acc, l) => acc + (l.patterns?.length || 0), 0);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedChapterIdx(idx); setSelectedLessonIdx(0); setSelectedPatternIdx(0); }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-xs font-black line-clamp-1">{ch.title}</div>
                    <div className={`mt-1 text-[10.5px] flex items-center justify-between ${isSel ? 'text-emerald-100' : 'text-emerald-700'}`}>
                      <span>{ch.lessons?.length || 0} bài • {totalPatterns} dạng</span>
                      <span>Tr.{ch.pageStart}–{ch.pageEnd}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Header Bài Học */}
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5 pt-2">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Bài Học Trong Chương ({activeChapter?.lessons?.length || 0})
                </h3>
              </div>
              {!isLocked && activeChapter && (
                <button
                  type="button"
                  onClick={addLesson}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Thêm bài
                </button>
              )}
            </div>

            {/* Danh sách Bài Học */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {(activeChapter?.lessons || []).map((les, idx) => {
                const isSel = idx === selectedLessonIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSelectedLessonIdx(idx); setSelectedPatternIdx(0); }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold line-clamp-2">{les.title}</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-emerald-700 font-semibold">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100/70">{les.patterns?.length || 0} dạng bài</span>
                      <span>{les.keyFormulas?.length || 0} công thức</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (8.5/12): 5 SECTOR CHUYÊN BIỆT (KHÔNG DỒN CHUNG 1 KHUNG) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-sm flex flex-col gap-4">
            {!activeLesson ? (
              <div className="py-20 text-center text-slate-400 text-xs">Vui lòng chọn hoặc thêm một Bài học từ danh sách bên trái.</div>
            ) : (
              <>
                {/* Top Banner Bài Học + Nút Mở Studio Toàn Màn Hình */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                        {skeleton.subjectName} Lớp {skeleton.grade}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Trang {activeLesson.pageStart} – {activeLesson.pageEnd}
                      </span>
                    </div>
                    <input
                      disabled={isLocked}
                      value={activeLesson.title}
                      onChange={e => updateLesson(les => ({ ...les, title: e.target.value }))}
                      className="mt-1 text-base font-black text-slate-900 bg-transparent border-b border-transparent focus:border-emerald-400 outline-none w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const combinedTheory = currentLessonChunks.map(c => c.text).join('\n\n')
                        || (activeLesson.keyFormulas || []).join('\n');
                      setStudioTarget({
                        pattern: {
                          patternId: activePattern?.patternCode || `SGK_${skeleton.subjectCode}_G${skeleton.grade}`,
                          name: activeLesson.title,
                          theoryRecap: combinedTheory,
                          solutionMethod: (activeLesson.keyFormulas || []).join('\n'),
                          level: `L${activePattern?.bloomLevel || 2}`
                        },
                        domain: { name: skeleton.subjectName, code: skeleton.subjectCode },
                        chapter: { name: activeChapter?.title || 'Chương SGK' },
                        lesson: { name: activeLesson.title }
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Mở Studio Biên Soạn Sư Phạm (Full)</span>
                  </button>
                </div>

                {/* 5 SECTOR TABS (Phân chia khu vực rõ ràng) */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveSector('theory')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSector === 'theory'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sector 1: Lý Thuyết Cốt Lõi</span>
                    {currentLessonChunks.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-950 text-[10px]">
                        {currentLessonChunks.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSector('formulas')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSector === 'formulas'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sigma className="w-3.5 h-3.5" />
                    <span>Sector 2: Kho Công Thức ({activeLesson.keyFormulas?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSector('examples')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSector === 'examples'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Sector 3: Ví Dụ Mẫu SGK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSector('patterns')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSector === 'patterns'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Sector 4: Dạng Bài & Bloom ({activeLesson.patterns?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSector('exercises')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeSector === 'exercises'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-teal-800 bg-teal-50 hover:bg-teal-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Sector 5: Sinh & Tùy Biến Bài Tập</span>
                    {(activePattern?.exercises?.length || 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-teal-900 text-white text-[10px]">
                        {activePattern.exercises.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ======================================================== */}
                {/* SECTOR 1: LÝ THUYẾT & KHÁI NIỆM CỐT LÕI TỪ SGK           */}
                {/* ======================================================== */}
                {activeSector === 'theory' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Lý thuyết trích xuất từ SGK (Độ phủ 70%-80%)</h4>
                        <p className="text-[11px] text-slate-500">
                          {theoryFilterMode === 'all'
                            ? `Đang hiển thị toàn bộ ${currentLessonChunks.length} trang tri thức của cuốn SGK`
                            : `Đang hiển thị ${currentLessonChunks.length} đoạn lý thuyết (Trang ${activeLesson?.pageStart || '?'}-${activeLesson?.pageEnd || '?'})`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Chuyển chế độ xem Bài học vs Toàn bộ sách */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setTheoryFilterMode('lesson')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              theoryFilterMode === 'lesson'
                                ? 'bg-white text-emerald-800 shadow-2xs font-black'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            📖 Bài này
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheoryFilterMode('all')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              theoryFilterMode === 'all'
                                ? 'bg-white text-emerald-800 shadow-2xs font-black'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            🌐 Toàn bộ SGK ({filledChunks.length})
                          </button>
                        </div>

                        {/* Nút đồng bộ lại CSDL */}
                        <button
                          type="button"
                          onClick={() => loadChunksForSource(selectedSourceId)}
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Tải lại lý thuyết từ CSDL"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Thanh tìm kiếm nhanh nội dung SGK */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={theorySearchQuery}
                        onChange={e => setTheorySearchQuery(e.target.value)}
                        placeholder="Tìm kiếm định nghĩa, công thức hoặc từ khóa trong trang SGK..."
                        className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-400 outline-none transition-all"
                      />
                      {theorySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTheorySearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {currentLessonChunks.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500 space-y-3">
                        <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                        {filledChunks.length === 0 ? (
                          <>
                            <p className="font-semibold text-slate-700">Tri thức SGK chưa được nạp vào bộ nhớ trình duyệt.</p>
                            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                              Nếu bạn đã quét sách trước đó, hãy bấm nút dưới đây để nạp trực tiếp 122 trang từ Supabase Database vào giao diện.
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => loadChunksForSource(selectedSourceId || (ingestedSources[0]?.sourceId))}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>⚡ Nạp ngay từ CSDL Supabase</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-slate-700">
                              Không tìm thấy đoạn lý thuyết nào phù hợp với bộ lọc hiện tại.
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              {theorySearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setTheorySearchQuery('')}
                                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                                >
                                  Xóa tìm kiếm
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setTheoryFilterMode('all')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                              >
                                Xem toàn bộ sách ({filledChunks.length} trang)
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                        {currentLessonChunks.map((chunk, cIdx) => (
                          <div key={cIdx} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-2.5 shadow-2xs hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                                Trang {chunk.pageNumber} • Đoạn {chunk.chunkIndex}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 font-mono text-[10px]">
                                  {chunk.sectionType || 'THEORY'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleCopyChunkText(chunk.text || '', cIdx)}
                                  className="p-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                                  title="Sao chép đoạn"
                                >
                                  {copiedChunkIdx === cIdx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudioTarget({
                                      pattern: {
                                        patternId: activePattern?.patternCode || `SGK_P${chunk.pageNumber}`,
                                        name: activeLesson?.title || `Lý thuyết Trang ${chunk.pageNumber}`,
                                        theoryRecap: chunk.text || '',
                                        solutionMethod: (activeLesson?.keyFormulas || []).join('\n'),
                                        level: `L${activePattern?.bloomLevel || 2}`
                                      },
                                      domain: { name: skeleton.subjectName, code: skeleton.subjectCode },
                                      chapter: { name: activeChapter?.title || 'Chương SGK' },
                                      lesson: { name: activeLesson?.title || 'Bài SGK' }
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Đưa đoạn này vào Studio biên soạn sư phạm"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Đưa vào Studio</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-800 leading-relaxed font-sans">
                              <MathText text={chunk.text || ''} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* SECTOR 2: KHO CÔNG THỨC & KATEX VAULT                    */}
                {/* ======================================================== */}
                {activeSector === 'formulas' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Hệ Thống Công Thức KaTeX Đặc Trưng</h4>
                        <p className="text-[11px] text-slate-500">Các công thức toán/lý/hóa chuẩn xác liên kết trực tiếp với bài học</p>
                      </div>
                    </div>

                    {/* Danh sách Công Thức dạng Glass Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                      {(activeLesson.keyFormulas || []).map((formula, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-3 group hover:border-emerald-400 transition-all"
                        >
                          <div className="text-sm font-semibold text-slate-900 overflow-x-auto py-1">
                            <MathText text={formula} />
                          </div>
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleCopyFormula(formula)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                              title="Sao chép KaTeX"
                            >
                              {copiedFormula === formula ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {!isLocked && (
                              <button
                                type="button"
                                onClick={() => updateLesson(les => ({ ...les, keyFormulas: les.keyFormulas.filter((_, i) => i !== fIdx) }))}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer"
                                title="Xóa công thức"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Thanh Chèn Nhanh KaTeX Snippets */}
                    {!isLocked && (
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Sigma className="w-3.5 h-3.5 text-emerald-600" /> Thêm công thức KaTeX vào kho:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {KATEX_SNIPPETS.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewFormulaInput(prev => `${prev}${prev ? ' ' : ''}${s.code}`)}
                              className="px-2 py-0.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-[11px] font-medium text-emerald-800 cursor-pointer transition-colors"
                            >
                              + {s.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            value={newFormulaInput}
                            onChange={e => setNewFormulaInput(e.target.value)}
                            placeholder="Nhập mã KaTeX (VD: $F = m.a$ hoặc $y = ax^2 + bx + c$)..."
                            className="flex-1 px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newFormulaInput.trim()) return;
                              updateLesson(les => ({ ...les, keyFormulas: [...(les.keyFormulas || []), newFormulaInput.trim()] }));
                              setNewFormulaInput('');
                              toast.success('Đã thêm công thức mới vào kho!');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-2xs"
                          >
                            Chèn
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* SECTOR 3: VÍ DỤ MẪU & PHÂN TÍCH SGK                     */}
                {/* ======================================================== */}
                {activeSector === 'examples' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Ví Dụ Mẫu & Lời Giải Từng Bước Từ SGK</h4>
                        <p className="text-[11px] text-slate-500">Các bài toán mẫu minh họa phương pháp tư duy và áp dụng công thức</p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                        <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Ví dụ mẫu trọng tâm của bài học:
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-800 leading-relaxed font-mono">
                          <MathText text="Một vật có khối lượng $m = 2\\text{ kg}$ chuyển động thẳng nhanh dần đều từ trạng thái nghỉ dưới tác dụng của lực kéo $F = 10\\text{ N}$. Bỏ qua ma sát. Tính gia tốc và quãng đường vật đi được sau $4\\text{ s}$." />
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                          <div className="font-bold text-emerald-900">Hướng dẫn giải từng bước:</div>
                          <MathText text="1. Áp dụng định luật II Newton: $a = \\frac{F}{m} = \\frac{10}{2} = 5\\text{ m/s}^2$.&#10;&#10;2. Quãng đường vật đi được sau $t = 4\\text{ s}$:&#10;$$s = v_0 t + \\frac{1}{2} a t^2 = 0 + \\frac{1}{2}\\times 5\\times 4^2 = 40\\text{ m}.$$" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SECTOR 4: DẠNG BÀI & PHÂN LOẠI BLOOM (6 CẤP ĐỘ)          */}
                {/* ======================================================== */}
                {activeSector === 'patterns' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Hệ Thống Dạng Bài Đi Kèm & Bloom Taxonomy (6 Cấp Độ)</h4>
                        <p className="text-[11px] text-slate-500">Mỗi dạng bài được định vị chuẩn mực nhận thức từ Nhớ (L1) đến Sáng tạo (L6)</p>
                      </div>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={addPattern}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm dạng bài mới
                        </button>
                      )}
                    </div>

                    {/* Danh sách Dạng bài */}
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                      {(activeLesson.patterns || []).map((pat, pIdx) => {
                        const isSel = pIdx === selectedPatternIdx;
                        const bloomMeta = BLOOM_LEVELS.find(b => b.level === pat.bloomLevel) || BLOOM_LEVELS[1];
                        return (
                          <div
                            key={pIdx}
                            onClick={() => setSelectedPatternIdx(pIdx)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSel
                                ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-100 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                                  {pat.patternCode}
                                </span>
                                <input
                                  disabled={isLocked}
                                  value={pat.name}
                                  onChange={e => updatePattern(p => ({ ...p, name: e.target.value }))}
                                  className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-emerald-400 outline-none flex-1"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  disabled={isLocked}
                                  value={pat.bloomLevel || 2}
                                  onChange={e => updatePattern(p => ({ ...p, bloomLevel: Number(e.target.value) }))}
                                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${bloomMeta.color}`}
                                >
                                  {BLOOM_LEVELS.map(b => (
                                    <option key={b.level} value={b.level}>{b.label}</option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPatternIdx(pIdx);
                                    setActiveSector('exercises');
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Chuyển sang Sector 5 để sinh bài tập cho dạng này"
                                >
                                  <Zap className="w-3 h-3 text-amber-300" />
                                  <span>Sinh bài tập ({pat.exercises?.length || 0})</span>
                                </button>

                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateLesson(les => ({ ...les, patterns: les.patterns.filter((_, i) => i !== pIdx) }));
                                    }}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Chi tiết Dấu hiệu nhận biết & Phương pháp */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
                              <div>
                                <span className="font-bold text-slate-700">Dấu hiệu nhận biết: </span>
                                <span className="text-slate-600">{pat.description || 'Chưa có mô tả'}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Phương pháp giải: </span>
                                <span className="text-slate-600">{pat.method || 'Theo quy trình chuẩn SGK'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SECTOR 5: SINH & TÙY BIẾN BÀI TẬP DẠNG BÀI (AI EXERCISE) */}
                {/* ======================================================== */}
                {activeSector === 'exercises' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">
                          AI Exercise Lab: Sinh & Tùy Biến Bài Tập
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Đang chọn dạng: <strong className="text-teal-800">{activePattern?.name || 'Chưa chọn'}</strong> (Bloom Cấp {activePattern?.bloomLevel || 2})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={generatingExercises || !activePattern}
                          onClick={handleGenerateExercisesForPattern}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          {generatingExercises ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                          <span>{generatingExercises ? 'AI Đang sinh bài tập...' : 'AI Sinh Bài Tập Tự Động'}</span>
                        </button>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={addExerciseManual}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm bài thủ công
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Danh sách Bài tập cho Dạng bài này */}
                    {(!activePattern?.exercises || activePattern.exercises.length === 0) ? (
                      <div className="p-10 text-center rounded-2xl bg-teal-50/40 border border-dashed border-teal-200 space-y-3">
                        <p className="text-xs text-slate-600">Dạng bài này hiện chưa có bài tập luyện tập nào.</p>
                        <button
                          type="button"
                          disabled={generatingExercises}
                          onClick={handleGenerateExercisesForPattern}
                          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Bấm vào đây để AI sinh tự động 3 bài tập trắc nghiệm có KaTeX</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                        {activePattern.exercises.map((ex, exIdx) => (
                          <div key={ex.id || exIdx} className="p-4 rounded-2xl bg-white border border-teal-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-teal-950 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center text-[10.5px]">
                                  {exIdx + 1}
                                </span>
                                <span>Câu hỏi luyện tập dạng bài</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Bloom L{ex.bloomLevel || activePattern.bloomLevel || 2}
                                </span>
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updatePattern(pat => ({
                                        ...pat,
                                        exercises: pat.exercises.filter((_, i) => i !== exIdx)
                                      }));
                                    }}
                                    className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Đề bài */}
                            <div className="space-y-1">
                              <textarea
                                disabled={isLocked}
                                rows={2}
                                value={ex.stem}
                                onChange={e => {
                                  const val = e.target.value;
                                  updatePattern(pat => {
                                    const exercises = [...(pat.exercises || [])];
                                    exercises[exIdx] = { ...exercises[exIdx], stem: val };
                                    return { ...pat, exercises };
                                  });
                                }}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                              />
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                                <MathText text={ex.stem} />
                              </div>
                            </div>

                            {/* 4 Phương án lựa chọn */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(ex.options || []).map((opt, optIdx) => {
                                const isCorrect = ex.correctIndex === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      if (isLocked) return;
                                      updatePattern(pat => {
                                        const exercises = [...(pat.exercises || [])];
                                        exercises[exIdx] = { ...exercises[exIdx], correctIndex: optIdx };
                                        return { ...pat, exercises };
                                      });
                                    }}
                                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-100'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="overflow-x-auto py-0.5">
                                      <MathText text={opt} />
                                    </div>
                                    {isCorrect && (
                                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Lời giải chi tiết */}
                            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs space-y-1">
                              <span className="font-bold text-teal-900">Lời giải KaTeX chi tiết:</span>
                              <div className="text-slate-800 leading-relaxed">
                                <MathText text={ex.solution || 'Chưa có lời giải'} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL STUDIO BIÊN SOẠN SƯ PHẠM (CurriculumStudioEditor dùng chung) */}
      {studioTarget && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <CurriculumStudioEditor
            mode="textbook"
            pattern={studioTarget.pattern}
            domain={studioTarget.domain}
            chapter={studioTarget.chapter}
            lesson={studioTarget.lesson}
            onClose={() => setStudioTarget(null)}
            onSaveSuccess={() => {
              setStudioTarget(null);
              onRefreshSources?.();
              loadIngestedSources();
            }}
          />
        </div>
      )}

      {/* MODAL XEM TOÀN VĂN SGK THEO TỪNG TRANG (READER MODE) */}
      {isReaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">{skeleton.fileName || 'Toàn văn Sách Giáo Khoa'}</h3>
                  <p className="text-[11px] text-slate-500">Duyệt tuần tự {filledChunks.length} trang/chunks đã lưu trong CSDL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReaderModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer"
              >
                Đóng
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filledChunks.map((c, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span>Trang {c.pageNumber} • Đoạn {c.chunkIndex}</span>
                    <span className="font-mono text-slate-500">{c.sectionType || 'THEORY'}</span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed">
                    <MathText text={c.text || ''} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
