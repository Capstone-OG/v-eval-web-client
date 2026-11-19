import { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from 'react';
import aiService from '../../services/aiService';
import contentService from '../../services/contentService';
import { useToast } from '../../context/ToastContext';
import {
  normalizeExamData,
  createBlankExam,
  buildImportExamPayload,
  buildOrderedExamView,
  nextLocalId
} from '../../utils/examParserUtils';
import {
  flattenCurriculumTree,
  autoMapExamQuestions,
  applyAiNodeMappingsToExam,
  buildExamBlueprintStats
} from '../../utils/examCurriculumMatcher';
import {
  duplicateQuestionInExam,
  convertDraftToExamQuestion
} from '../../utils/examOrganizerUtils';
import {
  getExamWorkspaceState,
  subscribeExamWorkspaceState,
  updateExamWorkspaceState,
  startPdfExtractionJob,
  cancelPdfExtractionJob
} from './examStateBridge';

let lastHandledNotificationId = 0;

/**
 * Shared React controller hook backing the 3 Exam pages:
 *  1. ExamBankView   (exam-bank)   — Kho Đề, Xem Đề Thi & Sắp Xếp Đề
 *  2. ExamIngestView (exam-ingest) — Parse PDF AI Vision & AI Bloom 6 Mức
 *  3. ExamStudioView (exam-studio) — Studio Biên Soạn Từng Câu Hỏi
 */
export function useExamWorkspaceController({ onNavigateTab, enableClipboardPaste = false } = {}) {
  const { toast } = useToast();
  const state = useSyncExternalStore(subscribeExamWorkspaceState, getExamWorkspaceState);

  const {
    currentExam,
    selectedQuestionLocalId,
    isLocked,
    hasUnsavedChanges,
    aiBloomDrafts,
    bloomTargetSkillNode,
    bankSubView,
    ingestPart,
    dbExams,
    dbLoaded,
    dbLoading,
    dbError,
    curriculumDomains,
    curriculumLoaded,
    processingJob,
    lastJobNotification
  } = state;

  // Local UI / transient states for current mounted page
  const [busyExamId, setBusyExamId] = useState(null);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [publishingExam, setPublishingExam] = useState(false);
  const [loadingExamDetail, setLoadingExamDetail] = useState(false);
  const [classifyingNodes, setClassifyingNodes] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const [nodePickerState, setNodePickerState] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [fullStudioTarget, setFullStudioTarget] = useState(null);
  const [pasteTarget, setPasteTarget] = useState(null);

  const pasteTargetRef = useRef(null);
  useEffect(() => {
    pasteTargetRef.current = pasteTarget;
  }, [pasteTarget]);

  const flatCurriculumNodes = useMemo(
    () => flattenCurriculumTree(curriculumDomains),
    [curriculumDomains]
  );
  const flatNodesRef = useRef(flatCurriculumNodes);
  useEffect(() => {
    flatNodesRef.current = flatCurriculumNodes;
  }, [flatCurriculumNodes]);

  // Derived exam views & Blueprint stats
  const orderedView = useMemo(() => buildOrderedExamView(currentExam), [currentExam]);
  const blueprintStats = useMemo(() => buildExamBlueprintStats(currentExam), [currentExam]);
  const pendingBloomCount = useMemo(
    () => aiBloomDrafts.filter((d) => d.status === 'pending').length,
    [aiBloomDrafts]
  );

  // Surface background PDF job notifications once across whichever page is active
  useEffect(() => {
    if (!lastJobNotification || lastJobNotification.id <= lastHandledNotificationId) return;
    lastHandledNotificationId = lastJobNotification.id;
    if (lastJobNotification.type === 'success') {
      toast.success(lastJobNotification.message);
    } else if (lastJobNotification.type === 'error') {
      toast.error(lastJobNotification.message);
    }
  }, [lastJobNotification, toast]);

  // Fetch Database Exams
  const fetchDatabaseExams = useCallback(
    async (notify = false) => {
      updateExamWorkspaceState({ dbLoading: true, dbError: null });
      try {
        const list = await contentService.getMockExams();
        const safeList = Array.isArray(list) ? list : [];
        updateExamWorkspaceState({
          dbExams: safeList,
          dbLoaded: true,
          dbLoading: false,
          dbError: null
        });
        if (notify) toast.success(`Đã đồng bộ ${safeList.length} đề thi từ Database!`);
      } catch (err) {
        const msg = err?.message || 'Không thể kết nối đến Content Service qua API Gateway.';
        updateExamWorkspaceState({ dbLoading: false, dbError: msg });
        if (notify) toast.error(msg);
      }
    },
    [toast]
  );

  // Initial hydrate (cached across the 3 pages so navigation is instant)
  useEffect(() => {
    let active = true;
    if (!dbLoaded) {
      contentService
        .getMockExams()
        .then((list) => {
          if (!active) return;
          updateExamWorkspaceState({
            dbExams: Array.isArray(list) ? list : [],
            dbLoaded: true,
            dbError: null
          });
        })
        .catch((err) => {
          if (!active) return;
          updateExamWorkspaceState({
            dbError: err?.message || 'Không thể kết nối đến Content Service qua API Gateway.'
          });
        });
    }

    if (!curriculumLoaded) {
      contentService
        .getCurriculum()
        .then((domains) => {
          if (!active) return;
          updateExamWorkspaceState({
            curriculumDomains: Array.isArray(domains) ? domains : [],
            curriculumLoaded: true
          });
        })
        .catch((err) => {
          console.warn('Không thể tải cây Khung chương trình:', err);
        });
    }

    return () => {
      active = false;
    };
  }, [dbLoaded, curriculumLoaded]);

  // Mutators synced directly to examStateBridge
  const mutateExam = useCallback((updater) => {
    updateExamWorkspaceState((prev) => ({
      currentExam: prev.currentExam ? updater(prev.currentExam) : prev.currentExam,
      hasUnsavedChanges: true
    }));
  }, []);

  const setCurrentExamDirect = useCallback((nextExam, unsaved = true) => {
    updateExamWorkspaceState({
      currentExam: nextExam,
      hasUnsavedChanges: unsaved
    });
  }, []);

  const setSelectedQuestionLocalId = useCallback((localId) => {
    updateExamWorkspaceState({ selectedQuestionLocalId: localId });
  }, []);

  const toggleLock = useCallback(() => {
    updateExamWorkspaceState((prev) => ({ isLocked: !prev.isLocked }));
  }, []);

  const setBankSubView = useCallback((view) => {
    updateExamWorkspaceState({ bankSubView: view === 'organize' ? 'organize' : 'paper' });
  }, []);

  const setIngestPart = useCallback((part) => {
    updateExamWorkspaceState({ ingestPart: part === 'bloom' ? 'bloom' : 'pdf' });
  }, []);

  const setAiBloomDrafts = useCallback((updaterOrList) => {
    updateExamWorkspaceState((prev) => ({
      aiBloomDrafts:
        typeof updaterOrList === 'function' ? updaterOrList(prev.aiBloomDrafts) : updaterOrList
    }));
  }, []);

  const setBloomTargetSkillNode = useCallback((node) => {
    updateExamWorkspaceState({ bloomTargetSkillNode: node });
  }, []);

  const handleUpdatePassage = useCallback(
    (passageLocalId, updater) => {
      if (getExamWorkspaceState().isLocked) return;
      mutateExam((prev) => ({
        ...prev,
        passages: prev.passages.map((p) => (p.localId === passageLocalId ? updater({ ...p }) : p))
      }));
    },
    [mutateExam]
  );

  const handleUpdateQuestion = useCallback(
    (questionLocalId, parentPassageLocalId, updater) => {
      if (getExamWorkspaceState().isLocked) return;
      mutateExam((prev) => {
        if (parentPassageLocalId) {
          return {
            ...prev,
            passages: prev.passages.map((p) =>
              p.localId === parentPassageLocalId
                ? {
                    ...p,
                    questions: p.questions.map((q) => (q.localId === questionLocalId ? updater({ ...q }) : q))
                  }
                : p
            )
          };
        }
        return {
          ...prev,
          singleQuestions: prev.singleQuestions.map((q) =>
            q.localId === questionLocalId ? updater({ ...q }) : q
          )
        };
      });
    },
    [mutateExam]
  );

  // Global Ctrl+V Clipboard Image Paste
  useEffect(() => {
    if (!enableClipboardPaste || !currentExam || isLocked || fullStudioTarget) return undefined;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      let imageFile = null;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }
      if (!imageFile) return;

      const target = pasteTargetRef.current;
      if (!target) {
        toast.info('Di chuột hoặc chọn một Câu hỏi / Chùm bài trước khi nhấn Ctrl + V để dán ảnh.');
        return;
      }

      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (!dataUrl) return;
        if (target.type === 'passage') {
          handleUpdatePassage(target.localId, (p) => ({
            ...p,
            imageUrl: dataUrl,
            imageUserAttached: true
          }));
          toast.success('Đã dán ảnh từ Clipboard vào ngữ cảnh chùm bài!');
        } else {
          handleUpdateQuestion(target.localId, target.parentPassageLocalId, (q) => ({
            ...q,
            imageUrl: dataUrl,
            imageUserAttached: true
          }));
          toast.success('Đã dán ảnh từ Clipboard vào câu hỏi!');
        }
      };
      reader.readAsDataURL(imageFile);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [
    enableClipboardPaste,
    currentExam,
    isLocked,
    fullStudioTarget,
    handleUpdatePassage,
    handleUpdateQuestion,
    toast
  ]);

  // Open an exam cleanly & optionally switch page
  const openExam = useCallback(
    (examObj, { unsaved = false, navigateTo = null, subView = null } = {}) => {
      const enriched =
        flatNodesRef.current.length > 0
          ? autoMapExamQuestions(examObj, flatNodesRef.current, { force: false })
          : examObj;
      const firstQ = buildOrderedExamView(enriched).allQuestions[0];

      updateExamWorkspaceState({
        currentExam: enriched,
        selectedQuestionLocalId: firstQ?.localId || null,
        isLocked: false,
        hasUnsavedChanges: unsaved,
        ...(subView ? { bankSubView: subView } : {})
      });

      if (navigateTo && onNavigateTab) {
        onNavigateTab(navigateTo);
      }
      return enriched;
    },
    [onNavigateTab]
  );

  const handleCreateBlankExam = useCallback(
    ({ navigateTo = 'exam-studio' } = {}) => {
      const blank = createBlankExam();
      openExam(blank, { unsaved: true, navigateTo });
      toast.success('Đã khởi tạo đề thi mới trong Studio!');
    },
    [openExam, toast]
  );

  // Load Exam Detail from Supabase Database
  const handleLoadExamFromDb = useCallback(
    async (examSummary, { navigateTo = null, subView = 'paper' } = {}) => {
      const examId = examSummary?.examId || examSummary;
      if (!examId) return;

      setBusyExamId(examId);
      setLoadingExamDetail(true);
      setDbModalOpen(false);
      try {
        const detail = await contentService.getExamDetail(examId);
        const normalized = normalizeExamData(detail, {
          source: 'database',
          isPublished: Boolean(examSummary?.isPublished)
        });
        const enriched = openExam(normalized, { unsaved: false, navigateTo, subView });
        toast.success(`Đã nạp đề thi "${enriched.title}" từ Database!`);
      } catch (err) {
        toast.error(err?.message || 'Lỗi tải chi tiết đề thi từ Database.');
      } finally {
        setBusyExamId(null);
        setLoadingExamDetail(false);
      }
    },
    [openExam, toast]
  );

  // PDF Upload & Background Polling (persists across the 3 pages)
  const handleStartPdfExtraction = useCallback(
    async (file) => {
      const result = await startPdfExtractionJob(file, aiService);
      if (!result.ok && result.error) {
        toast.error(result.error);
      }
    },
    [toast]
  );

  const handleCancelPdfExtraction = useCallback(() => {
    cancelPdfExtractionJob();
    toast.info('Đã dừng theo dõi tiến trình bóc tách PDF.');
  }, [toast]);

  // Fast local Curriculum Node auto-mapping
  const handleRunLocalAutoMap = useCallback(
    (force = true) => {
      const examNow = getExamWorkspaceState().currentExam;
      if (!examNow) return;
      if (flatNodesRef.current.length === 0) {
        toast.warning('Chưa có dữ liệu cây Khung chương trình từ Content Service để so khớp.');
        return;
      }
      const nextExam = autoMapExamQuestions(examNow, flatNodesRef.current, { force });
      const nextStats = buildExamBlueprintStats(nextExam);
      updateExamWorkspaceState({ currentExam: nextExam, hasUnsavedChanges: true });
      toast.success(
        `Đã tự động nhận diện Chương / Bài / Dạng bài cho ${nextStats.mappedCount}/${nextStats.totalQuestions} câu hỏi!`
      );
    },
    [toast]
  );

  // Deep AI Node Classification via AI Engine (POST /api/ai-engine/exams/classify-nodes)
  const handleRunAiNodeClassification = useCallback(async () => {
    const examNow = getExamWorkspaceState().currentExam;
    if (!examNow || classifyingNodes) return;
    if (flatNodesRef.current.length === 0) {
      toast.warning('Chưa có dữ liệu cây Khung chương trình từ Content Service để AI phân loại.');
      return;
    }

    const questionsPayload = [];
    (examNow.passages || []).forEach((p) => {
      const excerpt = (p.content || '').slice(0, 260);
      (p.questions || []).forEach((q) => {
        questionsPayload.push({
          question_number: q.questionNumber,
          content: q.content || '',
          passage_excerpt: excerpt,
          suggested_skill_name: q.suggestedSkillName || ''
        });
      });
    });
    (examNow.singleQuestions || []).forEach((q) => {
      questionsPayload.push({
        question_number: q.questionNumber,
        content: q.content || '',
        passage_excerpt: null,
        suggested_skill_name: q.suggestedSkillName || ''
      });
    });

    if (questionsPayload.length === 0) {
      toast.info('Đề thi chưa có câu hỏi nào để phân loại.');
      return;
    }

    setClassifyingNodes(true);
    try {
      const taxonomyPayload = flatNodesRef.current.map((n) => ({
        skill_id: n.skillId,
        domain_id: n.domainId || null,
        domain_name: n.domainName || '',
        chapter_id: n.chapterId || null,
        chapter_name: n.chapterName || '',
        lesson_id: n.lessonId || null,
        lesson_name: n.lessonName || '',
        pattern_id: n.patternId || n.skillId,
        pattern_name: n.patternName || ''
      }));

      const res = await aiService.classifyExamNodes({
        subject_code: examNow.subjectCode || 'GENERAL',
        exam_title: examNow.title || '',
        taxonomy_nodes: taxonomyPayload,
        questions: questionsPayload
      });

      const mappings = res?.mappings || [];
      if (mappings.length === 0) {
        handleRunLocalAutoMap(true);
        return;
      }

      const updatedExam = applyAiNodeMappingsToExam(examNow, mappings, flatNodesRef.current);
      updateExamWorkspaceState({ currentExam: updatedExam, hasUnsavedChanges: true });
      const providerLabel = res?.provider === 'Gemini' ? 'Gemini AI' : 'Bộ phân loại ngữ nghĩa';
      toast.success(
        `${providerLabel} đã phân loại ${mappings.length}/${questionsPayload.length} câu hỏi vào đúng Chương / Bài / Dạng bài!`
      );
    } catch (err) {
      console.warn('AI classifyExamNodes fallback:', err);
      handleRunLocalAutoMap(true);
      toast.info('AI Engine tạm bận — đã tự động chạy bộ nhận diện Chương / Bài cục bộ.');
    } finally {
      setClassifyingNodes(false);
    }
  }, [classifyingNodes, handleRunLocalAutoMap, toast]);

  // Save current Exam to Supabase PostgreSQL
  const handleSaveExamToDb = useCallback(async () => {
    const examNow = getExamWorkspaceState().currentExam;
    if (!examNow) return;
    const stats = buildOrderedExamView(examNow).stats;
    if (stats.totalQuestions === 0) {
      toast.warning('Đề thi chưa có câu hỏi nào để lưu vào Database.');
      return;
    }

    setSavingExam(true);
    try {
      const payload = buildImportExamPayload(examNow);
      const res = await contentService.importExam(payload);
      const newExamId = res?.exam_id || res?.examId || examNow.examId;

      updateExamWorkspaceState((prev) => ({
        currentExam: prev.currentExam
          ? { ...prev.currentExam, examId: newExamId, source: 'database', isPublished: false }
          : prev.currentExam,
        hasUnsavedChanges: false
      }));
      toast.success('Đã lưu toàn bộ cấu trúc đề thi kèm liên kết Node vào Supabase PostgreSQL!');
      fetchDatabaseExams(false);
    } catch (err) {
      toast.error(err?.message || 'Không thể lưu đề thi vào Database.');
    } finally {
      setSavingExam(false);
    }
  }, [fetchDatabaseExams, toast]);

  // Publish Exam in Database
  const handlePublishExam = useCallback(
    async (examTarget) => {
      const examId = examTarget?.examId;
      if (!examId) return;

      setBusyExamId(examId);
      setPublishingExam(true);
      try {
        await contentService.publishExam(examId);
        toast.success(`Đã phê duyệt và xuất bản đề thi "${examTarget.title || ''}"!`);
        updateExamWorkspaceState((prev) => ({
          dbExams: prev.dbExams.map((e) => (e.examId === examId ? { ...e, isPublished: true } : e)),
          currentExam:
            prev.currentExam?.examId === examId
              ? { ...prev.currentExam, isPublished: true }
              : prev.currentExam
        }));
      } catch (err) {
        toast.error(err?.message || 'Không thể phê duyệt đề thi.');
      } finally {
        setBusyExamId(null);
        setPublishingExam(false);
      }
    },
    [toast]
  );

  // Delete Exam from Database OR discard current unsaved AI/Manual draft exam
  const requestDeleteExam = useCallback(
    (examTarget) => {
      if (!examTarget) return;

      const isSavedInDb = Boolean(examTarget.examId) && (!examTarget.source || examTarget.source === 'database');

      if (!isSavedInDb) {
        setConfirmDialog({
          title: 'Xóa đề thi đang soạn?',
          message: `Bạn có chắc chắn muốn xóa đề "${examTarget.title || 'Đề thi mới'}" khỏi phiên làm việc hiện tại? Các thay đổi chưa lưu vào Database sẽ bị hủy bỏ.`,
          confirmLabel: 'Xóa đề',
          onConfirm: () => {
            setConfirmDialog(null);
            updateExamWorkspaceState({
              currentExam: null,
              selectedQuestionLocalId: null,
              hasUnsavedChanges: false
            });
            toast.success(`Đã xóa đề "${examTarget.title || 'Đề thi'}" khỏi phiên làm việc!`);
          }
        });
        return;
      }

      setConfirmDialog({
        title: 'Xóa đề thi khỏi Database?',
        message: `Bạn có chắc chắn muốn xóa vĩnh viễn đề thi "${examTarget.title || 'Đề thi'}" khỏi Supabase PostgreSQL? Toàn bộ câu hỏi và ngữ cảnh độc quyền của đề này sẽ bị xóa vĩnh viễn.`,
        confirmLabel: 'Xóa vĩnh viễn',
        onConfirm: async () => {
          setConfirmDialog(null);
          setBusyExamId(examTarget.examId);
          try {
            await contentService.deleteExam(examTarget.examId);
            toast.success(`Đã xóa đề thi "${examTarget.title}" khỏi Database thành công!`);
            updateExamWorkspaceState((prev) => ({
              dbExams: prev.dbExams.filter((e) => e.examId !== examTarget.examId),
              ...(prev.currentExam?.examId === examTarget.examId
                ? {
                    currentExam: null,
                    selectedQuestionLocalId: null,
                    hasUnsavedChanges: false
                  }
                : {})
            }));
            await fetchDatabaseExams(false);
          } catch (err) {
            toast.error(err?.message || 'Không thể xóa đề thi khỏi Database.');
          } finally {
            setBusyExamId(null);
          }
        }
      });
    },
    [fetchDatabaseExams, toast]
  );

  // Question / Passage Authoring Operations
  const handleAddSingleQuestion = useCallback(() => {
    const snap = getExamWorkspaceState();
    if (snap.isLocked || !snap.currentExam) return null;
    const stats = buildOrderedExamView(snap.currentExam).stats;
    const nextNum = stats.maxQuestionNumber + 1;
    const newQ = {
      localId: nextLocalId('q'),
      questionId: null,
      questionNumber: nextNum,
      pageNumber: 1,
      content: `Nhập nội dung câu hỏi số ${nextNum}...`,
      options: { A: '', B: '', C: '', D: '' },
      correctOption: 'A',
      explanation: '',
      difficultyLevel: snap.currentExam.difficultyLevel || 2,
      suggestedSkillName: 'Trắc nghiệm tổng hợp',
      imageUrl: null,
      imageUserAttached: false,
      images: [],
      curriculumNode: null
    };
    updateExamWorkspaceState((prev) => ({
      currentExam: prev.currentExam
        ? { ...prev.currentExam, singleQuestions: [...prev.currentExam.singleQuestions, newQ] }
        : prev.currentExam,
      selectedQuestionLocalId: newQ.localId,
      hasUnsavedChanges: true
    }));
    toast.success(`Đã thêm Câu ${nextNum}.`);
    return newQ;
  }, [toast]);

  const handleAddPassageCluster = useCallback(() => {
    const snap = getExamWorkspaceState();
    if (snap.isLocked || !snap.currentExam) return null;
    const stats = buildOrderedExamView(snap.currentExam).stats;
    const nextNum = stats.maxQuestionNumber + 1;
    const childLocalId = nextLocalId('q');
    const newPassage = {
      localId: nextLocalId('p'),
      passageId: null,
      startQuestion: nextNum,
      endQuestion: nextNum,
      content: 'Nhập đoạn văn đọc hiểu, dữ liệu thí nghiệm hoặc bảng biểu dùng chung cho chùm câu hỏi...',
      imageUrl: null,
      imageUserAttached: false,
      images: [],
      questions: [
        {
          localId: childLocalId,
          questionId: null,
          questionNumber: nextNum,
          pageNumber: 1,
          content: `Câu hỏi đọc hiểu số ${nextNum}...`,
          options: { A: '', B: '', C: '', D: '' },
          correctOption: 'A',
          explanation: '',
          difficultyLevel: 2,
          suggestedSkillName: 'Đọc hiểu',
          imageUrl: null,
          imageUserAttached: false,
          images: [],
          curriculumNode: null
        }
      ]
    };
    updateExamWorkspaceState((prev) => ({
      currentExam: prev.currentExam
        ? { ...prev.currentExam, passages: [...prev.currentExam.passages, newPassage] }
        : prev.currentExam,
      selectedQuestionLocalId: childLocalId,
      hasUnsavedChanges: true
    }));
    toast.success(`Đã thêm chùm đọc hiểu bắt đầu từ Câu ${nextNum}.`);
    return newPassage;
  }, [toast]);

  const handleDuplicateQuestion = useCallback(
    (qLocalId, parentPassageLocalId) => {
      const snap = getExamWorkspaceState();
      if (snap.isLocked || !snap.currentExam) return;
      const { exam: nextExam, newQuestion } = duplicateQuestionInExam(
        snap.currentExam,
        qLocalId,
        parentPassageLocalId
      );
      if (!newQuestion) return;
      updateExamWorkspaceState({
        currentExam: nextExam,
        selectedQuestionLocalId: newQuestion.localId,
        hasUnsavedChanges: true
      });
      toast.success('Đã nhân bản câu hỏi và tự đánh lại số thứ tự.');
    },
    [toast]
  );

  const requestDeleteQuestion = useCallback(
    (question, parentPassageLocalId) => {
      setConfirmDialog({
        title: `Xóa Câu ${question.questionNumber}?`,
        message: 'Câu hỏi này sẽ bị gỡ bỏ khỏi đề thi hiện tại.',
        confirmLabel: 'Xóa câu hỏi',
        onConfirm: () => {
          setConfirmDialog(null);
          mutateExam((prev) => {
            if (parentPassageLocalId) {
              return {
                ...prev,
                passages: prev.passages.map((p) =>
                  p.localId === parentPassageLocalId
                    ? { ...p, questions: p.questions.filter((q) => q.localId !== question.localId) }
                    : p
                )
              };
            }
            return {
              ...prev,
              singleQuestions: prev.singleQuestions.filter((q) => q.localId !== question.localId)
            };
          });
          toast.info(`Đã xóa Câu ${question.questionNumber}.`);
        }
      });
    },
    [mutateExam, toast]
  );

  // Ensure an exam container exists before inserting AI Bloom approved drafts
  const ensureTargetExamForBloom = (draftSample) => {
    const snap = getExamWorkspaceState();
    if (snap.currentExam) return snap.currentExam;
    const subjectCode = draftSample?.curriculumNode?.subSubject || 'MATH';
    return normalizeExamData(
      {
        title: `Đề thi mới (Sinh bằng AI Bloom 6 mức)`,
        subjectCode,
        examCategory: 'SUBJECT_PRACTICE',
        durationMinutes: 60,
        passages: [],
        singleQuestions: []
      },
      { source: 'manual', isPublished: false }
    );
  };

  // Approve single AI Bloom draft into active exam (or auto-create new exam!)
  const handleApproveBloomDraft = useCallback(
    (draft) => {
      const snap = getExamWorkspaceState();
      if (snap.isLocked || draft.status === 'approved') return;
      const targetExam = ensureTargetExamForBloom(draft);
      const nextNum = buildOrderedExamView(targetExam).stats.maxQuestionNumber + 1;
      const examQuestion = convertDraftToExamQuestion(draft, nextNum);

      updateExamWorkspaceState((prev) => ({
        currentExam: {
          ...targetExam,
          singleQuestions: [...targetExam.singleQuestions, examQuestion]
        },
        selectedQuestionLocalId: examQuestion.localId,
        hasUnsavedChanges: true,
        aiBloomDrafts: prev.aiBloomDrafts.map((d) =>
          d.draftId === draft.draftId
            ? { ...d, status: 'approved', insertedQuestionNumber: nextNum }
            : d
        )
      }));

      toast.success(
        snap.currentExam
          ? `Đã duyệt & thêm vào đề thành Câu ${nextNum} (Bloom L${examQuestion.difficultyLevel})!`
          : `Đã tự tạo đề mới & duyệt thành Câu ${nextNum} (Bloom L${examQuestion.difficultyLevel})!`
      );
    },
    [toast]
  );

  // Approve all pending AI Bloom drafts into active exam (or auto-create new exam!)
  const handleApproveAllPendingBloomDrafts = useCallback(() => {
    const snap = getExamWorkspaceState();
    if (snap.isLocked) return;
    const pendings = snap.aiBloomDrafts.filter((d) => d.status === 'pending');
    if (pendings.length === 0) return;

    const targetExam = ensureTargetExamForBloom(pendings[0]);
    let cursor = buildOrderedExamView(targetExam).stats.maxQuestionNumber + 1;
    const newQuestions = [];
    const assignedMap = new Map();

    for (const draft of pendings) {
      const qNum = cursor++;
      newQuestions.push(convertDraftToExamQuestion(draft, qNum));
      assignedMap.set(draft.draftId, qNum);
    }

    updateExamWorkspaceState((prev) => ({
      currentExam: {
        ...targetExam,
        singleQuestions: [...targetExam.singleQuestions, ...newQuestions]
      },
      selectedQuestionLocalId: newQuestions[0]?.localId || prev.selectedQuestionLocalId,
      hasUnsavedChanges: true,
      aiBloomDrafts: prev.aiBloomDrafts.map((d) =>
        assignedMap.has(d.draftId)
          ? { ...d, status: 'approved', insertedQuestionNumber: assignedMap.get(d.draftId) }
          : d
      )
    }));

    toast.success(`Đã duyệt và chèn ${newQuestions.length} câu hỏi Bloom vào "${targetExam.title}"!`);
  }, [toast]);

  // Cross-page navigation helpers
  const handleEditQuestionInStudio = useCallback(
    (qLocalId) => {
      updateExamWorkspaceState({ selectedQuestionLocalId: qLocalId });
      onNavigateTab?.('exam-studio');
    },
    [onNavigateTab]
  );

  const handleCloseExamToBank = useCallback(() => {
    updateExamWorkspaceState({
      currentExam: null,
      selectedQuestionLocalId: null,
      hasUnsavedChanges: false
    });
    fetchDatabaseExams(false);
    onNavigateTab?.('exam-bank');
  }, [fetchDatabaseExams, onNavigateTab]);

  return {
    // Shared state
    currentExam,
    selectedQuestionLocalId,
    isLocked,
    hasUnsavedChanges,
    aiBloomDrafts,
    bloomTargetSkillNode,
    bankSubView,
    ingestPart,
    dbExams,
    dbLoading,
    dbError,
    curriculumDomains,
    flatCurriculumNodes,
    processingJob,

    // Derived views
    orderedView,
    blueprintStats,
    pendingBloomCount,

    // Transient UI states
    busyExamId,
    dbModalOpen,
    setDbModalOpen,
    savingExam,
    publishingExam,
    loadingExamDetail,
    classifyingNodes,
    blueprintOpen,
    setBlueprintOpen,
    nodePickerState,
    setNodePickerState,
    lightboxImage,
    setLightboxImage,
    confirmDialog,
    setConfirmDialog,
    fullStudioTarget,
    setFullStudioTarget,
    pasteTarget,
    setPasteTarget,

    // Actions
    fetchDatabaseExams,
    openExam,
    handleCreateBlankExam,
    handleLoadExamFromDb,
    handleStartPdfExtraction,
    handleCancelPdfExtraction,
    handleRunLocalAutoMap,
    handleRunAiNodeClassification,
    handleSaveExamToDb,
    handlePublishExam,
    requestDeleteExam,
    mutateExam,
    setCurrentExamDirect,
    setSelectedQuestionLocalId,
    toggleLock,
    setBankSubView,
    setIngestPart,
    setAiBloomDrafts,
    setBloomTargetSkillNode,
    handleUpdatePassage,
    handleUpdateQuestion,
    handleAddSingleQuestion,
    handleAddPassageCluster,
    handleDuplicateQuestion,
    requestDeleteQuestion,
    handleApproveBloomDraft,
    handleApproveAllPendingBloomDrafts,
    handleEditQuestionInStudio,
    handleCloseExamToBank
  };
}

