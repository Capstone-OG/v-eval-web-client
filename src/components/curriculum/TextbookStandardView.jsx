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
  Columns
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
  getDefaultLessonTheory,
  buildTheoryFromChunks,
  getChunksForLesson,
  isGenericPlaceholder
} from './textbookStateBridge';

const BLOOM_LEVELS = [
  { level: 1, label: 'L1. Nhớ', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { level: 2, label: 'L2. Hiểu', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { level: 3, label: 'L3. Vận dụng', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  { level: 4, label: 'L4. Phân tích', color: 'bg-sky-50 text-sky-700 border-sky-300' },
  { level: 5, label: 'L5. Đánh giá', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { level: 6, label: 'L6. Sáng tạo', color: 'bg-purple-50 text-purple-700 border-purple-300' }
];

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
  const [sourceChunks, setSourceChunks] = useState([]);

  const [skeleton, setSkeleton] = useState(() => {
    const preset = getGdptPreset(initCtx.subjectCode || 'PHYS', initCtx.grade || 10);
    return {
      fileName: initCtx.fileName || '',
      subjectCode: initCtx.subjectCode || 'PHYS',
      subjectName: initCtx.subjectName || 'Vật lí',
      grade: initCtx.grade || 10,
      bookEdition: initCtx.bookEdition || preset?.bookEdition || 'Cánh Diều',
      versionTag: initCtx.versionTag || '2025-2026',
      isVersionLocked: false,
      status: 'ACCEPTED',
      totalPages: 0,
      chapters: preset?.chapters || []
    };
  });

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(initCtx.selectedChapterIdx || 0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(initCtx.selectedLessonIdx || 0);
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(initCtx.selectedPatternIdx || 0);

  // Tree view expansion state
  const [expandedChapters, setExpandedChapters] = useState({ 0: true, 1: true });
  const [expandedLessons, setExpandedLessons] = useState({ '0_0': true });

  // Theory editing state
  const [isEditingTheory, setIsEditingTheory] = useState(false);
  const [editedTheory, setEditedTheory] = useState('');
  const [enrichingKnowledge, setEnrichingKnowledge] = useState(false);

  // Parsed SGK Dropdown & Sub-Pagination state
  const [isOcrDropdownOpen, setIsOcrDropdownOpen] = useState(true);
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

  // Lấy các chunks bóc tách từ SGK thuộc về bài học đang chọn
  const currentLessonChunks = getChunksForLesson(activeLesson, sourceChunks);

  // Tự động đồng bộ trang bắt đầu của bài học vào bộ phân trang SGK bóc tách
  useEffect(() => {
    if (activeLesson?.pageStart) {
      setOcrCurrentPage(activeLesson.pageStart);
    } else {
      setOcrCurrentPage(1);
    }
  }, [activeLesson?.title, activeLesson?.pageStart]);

  // Tạo lý thuyết thực tế từ các chunks thực tế bóc tách từ SGK trong CSDL
  const rawTheoryFromChunks = buildTheoryFromChunks(currentLessonChunks, activeLesson?.title || '');
  const theoryFromChunks = (!isGenericPlaceholder(rawTheoryFromChunks) && rawTheoryFromChunks) ? rawTheoryFromChunks : '';

  // Nội dung lý thuyết thuần của bài học: Ưu tiên 100% dữ liệu thực từ Chunks SGK (loại bỏ triệt để mọi placeholder generic)
  const activeTheoryContent = (activeLesson?.isEdited && activeLesson?.theory && !isGenericPlaceholder(activeLesson.theory))
    ? activeLesson.theory
    : (theoryFromChunks
       || (!isGenericPlaceholder(activeLesson?.theory) && activeLesson?.theory ? activeLesson.theory : '')
       || getDefaultLessonTheory(skeleton.subjectCode, skeleton.grade, activeLesson?.title || '')
       || 'Chưa có nội dung lý thuyết cho bài học này. Vui lòng nạp SGK hoặc bấm nút AI (✨) để sinh lý thuyết.');

  // Tải danh sách nguồn SGK từ CSDL Supabase
  const loadIngestedSources = async () => {
    try {
      const res = await aiService.getIngestedTextbooks();
      const list = res?.sources || [];
      setIngestedSources(list);

      const sidToLoad = selectedSourceId 
        || (list.find(s => s.fileName?.includes('VL 10 CD')) || list[0])?.sourceId;

      if (sidToLoad) {
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
      setSelectedSourceId('');
      setSkeleton(prev => ({ ...prev, fileName: '', totalPages: 0, chapters: [] }));
      return;
    }
    const found = sourceList.find(s => s.sourceId === sourceId);
    if (!found) return;

    setSelectedSourceId(sourceId);
    saveStoredTextbookContext({ selectedSourceId: sourceId, fileName: found.fileName });

    try {
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
          lesObj.patterns.push({
            patternCode: `P${lesObj.patterns.length + 1}`,
            name: rawPName,
            bloomLevel: 2,
            status: 'ACCEPTED',
            description: 'Dạng bài bóc tách từ SGK.',
            method: 'Phương pháp sư phạm chuẩn SGK.',
            exercises: []
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
            let matchedFormulas = [];
            if (preset?.chapters) {
              for (const pCh of preset.chapters) {
                const pLes = (pCh.lessons || []).find(pl => {
                  const plClean = cleanPrefix(pl.title, 'lesson').toLowerCase();
                  return cleanedLesTitle.includes(plClean) || plClean.includes(cleanedLesTitle);
                });
                if (pLes && pLes.keyFormulas?.length > 0) {
                  matchedFormulas = pLes.keyFormulas;
                  break;
                }
              }
            }
            if (matchedFormulas.length === 0 && (targetSub === 'PHYS' || targetSub === 'Vật lí')) {
              matchedFormulas = ['v = \\frac{s}{t}', 'a = \\frac{\\Delta v}{\\Delta t}', 'F = m \\cdot a'];
            }
            les.keyFormulas = matchedFormulas;
          }

          les.patterns = (les.patterns || []).map((p, pIdx) => ({
            ...p,
            patternCode: `P${pIdx + 1}`
          }));

          // Gán lý thuyết thuần từ Vector Chunks thực tế hoặc bộ chuẩn sư phạm (loại bỏ hoàn toàn generic placeholder)
          const chunksOfLesson = getChunksForLesson(les, chunks);
          let synTheory = '';
          if (chunksOfLesson.length > 0) {
            synTheory = buildTheoryFromChunks(chunksOfLesson, les.title);
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

      setSkeleton(prev => ({
        ...prev,
        fileName: found.fileName,
        subjectCode: targetSub,
        subjectName: targetSubName,
        grade: targetG,
        bookEdition: found.bookEdition || prev.bookEdition,
        totalPages: found.totalPages || prev.totalPages,
        chapters: detectedChapters.length > 0 ? detectedChapters : (preset?.chapters || prev.chapters)
      }));

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
      return { ...prev, chapters };
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

  const handleAiEnrichTheory = async () => {
    if (!activeLesson) return;
    setEnrichingKnowledge(true);
    toast.info('✨ AI đang phân tích và mở rộng kiến thức lý thuyết chuyên sâu...');
    try {
      const enriched = await aiService.analyzePatternWithAi({
        patternName: `Toàn bộ lý thuyết bài học ${activeLesson.title}`,
        lessonName: activeLesson.title,
        domainName: `${skeleton.subjectName} Lớp ${skeleton.grade}`,
        context: (activeLesson.keyFormulas || []).join('\n')
      });
      const generatedTheory = `### 1. Tóm tắt Lý thuyết Cốt lõi & Định luật
${enriched.theory_recap || 'Định luật và nguyên lý vận hành trọng tâm của bài học.'}

### 2. Phương pháp Tiếp cận & Vận dụng Sư phạm
${enriched.solution_method || 'Phương pháp giải quyết các bài toán và hiện tượng liên quan.'}

### 3. Công thức & Quy luật Mở rộng
${(activeLesson.keyFormulas || []).map(f => `$${f}$`).join(', ')}`;

      updateLesson(les => ({
        ...les,
        theory: (les.theory ? `${les.theory}\n\n---\n\n${generatedTheory}` : generatedTheory),
        status: 'ACCEPTED'
      }));
      toast.success('✨ Đã bổ sung kiến thức lý thuyết chuẩn sư phạm!');
    } catch (err) {
      toast.error('Lỗi bổ sung AI: ' + (err?.response?.data?.message || err.message));
    } finally {
      setEnrichingKnowledge(false);
    }
  };

  const handleSaveTheory = () => {
    updateLesson(les => ({ ...les, theory: editedTheory }));
    setIsEditingTheory(false);
    toast.success('Đã lưu nội dung lý thuyết bài học!');
  };

  const handleOpenStudio = (pat = activePattern) => {
    saveStoredTextbookContext({
      selectedSourceId,
      fileName: skeleton.fileName,
      subjectCode: skeleton.subjectCode,
      subjectName: skeleton.subjectName,
      grade: skeleton.grade,
      bookEdition: skeleton.bookEdition,
      selectedChapterIdx,
      selectedLessonIdx,
      selectedPatternIdx
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
      toast.success(`Đã xóa thành công cuốn sách "${bookName}"!`);
      
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

  // Nếu sidebar đang thu gọn (isSidebarCollapsed === true): hiển thị 2 trang; nếu sidebar mở: 1 trang
  const pageSize = isSidebarCollapsed ? 2 : 1;
  const safeCurrentPage = Math.min(Math.max(minOcrPage, ocrCurrentPage), maxOcrPage);

  const handlePrevOcrPage = () => {
    setOcrCurrentPage(prev => Math.max(minOcrPage, prev - pageSize));
  };

  const handleNextOcrPage = () => {
    setOcrCurrentPage(prev => Math.min(maxOcrPage - (pageSize - 1), prev + pageSize));
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
            onClick={handleResetToStandardGdpt}
            title="Đồng bộ cấu trúc GDPT 2018"
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Chuẩn Hóa GDPT 2018</span>
          </button>

          {/* 2 nút điều hướng nhanh đã vô hiệu hóa theo yêu cầu (người dùng chuyển trang qua Sidebar chuyên biệt) */}
          <button
            type="button"
            disabled
            title="Đã phân tách vào menu Sidebar chuyên biệt"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-50"
          >
            <span>Sang Trang Nạp SGK</span>
          </button>
          <button
            type="button"
            disabled
            title="Đã phân tách vào menu Sidebar chuyên biệt"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-50"
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

            {/* Bộ chọn cuốn SGK đã nạp & Nút Xóa cuốn sách */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-xs font-black text-slate-700 shrink-0">Kho SGK đã nạp:</span>
                <select
                  value={selectedSourceId}
                  onChange={e => handleSelectSource(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs font-bold text-emerald-950 max-w-xs truncate cursor-pointer outline-none"
                >
                  <option value="">-- Chọn cuốn SGK --</option>
                  {ingestedSources.map(s => (
                    <option key={s.sourceId} value={s.sourceId}>
                      {s.fileName} ({s.subjectName} L{s.grade} • {s.totalPages} trang)
                    </option>
                  ))}
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

          {/* Hàng 2: Lưới thông số nhanh và chỉnh sửa cơ bản */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Môn học</span>
              <select
                disabled={isLocked}
                value={skeleton.subjectCode}
                onChange={e => {
                  const newSubCode = e.target.value;
                  const sub = SUBJECT_OPTIONS.find(s => s.code === newSubCode);
                  const newSubName = sub?.name || newSubCode;
                  const newPreset = getGdptPreset(newSubCode, skeleton.grade);
                  setSkeleton(prev => ({
                    ...prev,
                    subjectCode: newSubCode,
                    subjectName: newSubName,
                    chapters: (newPreset?.chapters && newPreset.chapters.length > 0) ? newPreset.chapters : prev.chapters
                  }));
                  setSelectedChapterIdx(0);
                  setSelectedLessonIdx(0);
                  setSelectedPatternIdx(0);
                }}
                className="w-full text-xs font-bold text-emerald-950 bg-transparent outline-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Khối lớp</span>
              <select
                disabled={isLocked}
                value={skeleton.grade}
                onChange={e => {
                  const newG = Number(e.target.value);
                  const newPreset = getGdptPreset(skeleton.subjectCode, newG);
                  setSkeleton(prev => ({
                    ...prev,
                    grade: newG,
                    chapters: (newPreset?.chapters && newPreset.chapters.length > 0) ? newPreset.chapters : prev.chapters
                  }));
                  setSelectedChapterIdx(0);
                  setSelectedLessonIdx(0);
                  setSelectedPatternIdx(0);
                }}
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
          {/* CỘT BÊN TRÁI (4/12): CÂY MỤC LỤC CẤU TRÚC SÁCH PHÂN CẤP */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-emerald-200/80 p-4 shadow-xs flex flex-col gap-3">
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
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddNewChapter}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-emerald-200"
                >
                  <Plus className="w-3 h-3" /> Thêm chương
                </button>
              )}
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
                                        <span className={`px-1 py-0.2 rounded text-[8px] font-bold shrink-0 ${
                                          isPatternActive ? 'bg-white/20 text-white' : bloomMeta.color
                                        }`}>
                                          L{pat.bloomLevel || 2}
                                        </span>
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

          {/* CỘT BÊN PHẢI (8/12): LÝ THUYẾT CHUẨN CỦA BÀI ĐÓ & NỘI DUNG SGK PARSE DROPDOWN */}
          <div className="lg:col-span-8 flex flex-col gap-5 min-h-0">
            {!activeLesson || isNonPedagogical(activeLesson.title) ? (
              <div className="bg-white rounded-3xl border border-emerald-200/80 p-12 text-center text-slate-400 text-xs">
                Vui lòng chọn bài học từ mục lục bên trái để xem lý thuyết và tri thức SGK.
              </div>
            ) : (
              <>
                {/* 1. KHỐI LÝ THUYẾT CHUẨN CỦA BÀI HỌC (Ô NỘI DUNG RẤT LỚN, KHÔNG RÂU RIA) */}
                <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-xs flex flex-col gap-4">
                  {/* Header bài học với Breadcrumb & Các nút thao tác tinh gọn */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
                        <span className="text-emerald-700 font-bold">{cleanPrefix(activeChapter?.title, 'chapter') || activeChapter?.title}</span>
                        <span>›</span>
                        <span>Trang {activeLesson.pageStart}–{activeLesson.pageEnd}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-emerald-950">
                          Bài {activeLesson.lessonNumber || selectedLessonIdx + 1}: {cleanPrefix(activeLesson.title, 'lesson') || activeLesson.title}
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {validPatterns.length} Dạng bài
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleLessonStatus(activeLesson)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 ${
                            activeLesson.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {activeLesson.status === 'ACCEPTED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{activeLesson.status === 'ACCEPTED' ? '✓ Đã duyệt bài học' : '⏳ Chưa duyệt'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* NÚT AI GEN: CHỈ CÓ ICON AI, KHÔNG CÓ LABEL TEXT */}
                      <button
                        type="button"
                        disabled={enrichingKnowledge}
                        onClick={handleAiEnrichTheory}
                        title="AI sinh & mở rộng lý thuyết chuẩn sư phạm"
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 cursor-pointer shadow-2xs hover:scale-105 transition-all disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 ${enrichingKnowledge ? 'animate-spin' : ''}`} />
                      </button>

                      {/* Nút sửa lý thuyết */}
                      {!isLocked && !isEditingTheory && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditedTheory(activeTheoryContent);
                            setIsEditingTheory(true);
                          }}
                          title="Chỉnh sửa lý thuyết bài học"
                          className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 cursor-pointer shadow-2xs hover:scale-105 transition-all"
                        >
                          <Edit3 className="w-4 h-4 text-emerald-700" />
                        </button>
                      )}

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

                  {/* Vùng nội dung lý thuyết thuần (Rộng lớn, chiếm toàn bộ không gian) */}
                  {isEditingTheory ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-emerald-600" />
                          Chỉnh sửa trực tiếp lý thuyết bài học
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
                        rows={16}
                        value={editedTheory}
                        onChange={e => setEditedTheory(e.target.value)}
                        placeholder="Nhập nội dung lý thuyết định nghĩa, định luật, nguyên lý vận hành..."
                        className="w-full p-4 rounded-xl border border-emerald-300 bg-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 min-h-[920px] overflow-y-auto max-h-[140vh]">
                      <div className="text-[12px] leading-relaxed text-slate-800 space-y-2.5">
                        <MathText text={activeTheoryContent} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. KHỐI NỘI DUNG SGK PARSE RA (DỜI XUỐNG DƯỚI TRONG 1 DROPDOWN ĐƯỢC PHÂN TRANG CON VỚI < >) */}
                <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                  {/* Header Dropdown Toggle */}
                  <div
                    onClick={() => setIsOcrDropdownOpen(prev => !prev)}
                    className="p-4 bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shadow-2xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <span>Nội Dung Bóc Tách Từ SGK Gốc</span>
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
                            <span>{pageSize === 2 ? '2 Trang (Sidebar đóng)' : '1 Trang (Sidebar mở)'}</span>
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
