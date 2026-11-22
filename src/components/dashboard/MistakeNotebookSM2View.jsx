import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Play,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bot,
  BookOpen,
  NotebookPen,
  Save,
  Edit3,
  Eye,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import MathText from '../common/MathText';
import { practiceService } from '../../services/practiceService';
import contentService from '../../services/contentService';
import { toast } from '../../context/ToastContext';

const COGNITIVE_TAG_META = {
  CARELESS: {
    label: 'Tính nhẩm sai / Nhầm dấu',
    shortLabel: 'Tính ẩu',
    cls: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  MISREAD_QUESTION: {
    label: 'Đọc sót dữ kiện / Nhầm yêu cầu',
    shortLabel: 'Đọc sót đề',
    cls: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  MISSING_CONCEPT: {
    label: 'Chưa vững công thức / Lý thuyết',
    shortLabel: 'Chưa vững lý thuyết',
    cls: 'bg-rose-50 text-rose-700 border-rose-200'
  }
};

const LOCAL_BOOK_STORAGE_KEY = 'veval_mistake_book_custom_v1';

function readCustomBookMap() {
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCustomBookEntry(mistakeId, patch) {
  try {
    const all = readCustomBookMap();
    all[mistakeId] = { ...(all[mistakeId] || {}), ...patch, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(LOCAL_BOOK_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function extractFormulaSection(markdown = '') {
  const text = String(markdown || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  const m3 = text.match(/^#{2,4}\s*3\./m);
  const head = m3 && m3.index !== undefined ? text.slice(0, m3.index).trim() : text;
  return head.slice(0, 1500);
}

export default function MistakeNotebookSM2View({
  currentUser,
  onOpenAiTutorWithContext
}) {
  const [notebookData, setNotebookData] = useState(null);
  const [dailyReviewData, setDailyReviewData] = useState(null);
  const [roadmapNodeBySkill, setRoadmapNodeBySkill] = useState({});
  const [questionDetailsById, setQuestionDetailsById] = useState({});
  const [formulaBySkill, setFormulaBySkill] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [masteryFilter, setMasteryFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');

  // Book Page State: null = Outer List View | mistakeId = Open 2-Page White Book View
  const [openMistakeId, setOpenMistakeId] = useState(null);

  // Right-page editable fields
  const [editTag, setEditTag] = useState('MISSING_CONCEPT');
  const [editWrongDetail, setEditWrongDetail] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [savingBookPage, setSavingBookPage] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isBookFullscreen, setIsBookFullscreen] = useState(false);

  // Active SM-2 Review Runner State
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const questionStartRef = useRef(Date.now());

  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;

  const loadNotebookAndDue = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const isMasteredParam =
          masteryFilter === 'UNMASTERED' ? false : masteryFilter === 'MASTERED' ? true : null;

        const [nbRes, dueRes, rmRes] = await Promise.all([
          practiceService.getMistakeNotebook({
            studentId,
            cognitiveErrorTag: tagFilter === 'ALL' ? null : tagFilter,
            isMastered: isMasteredParam,
            pageIndex: 1,
            pageSize: 50
          }).catch(() => ({ items: [], totalCount: 0 })),
          practiceService.getDailyMistakeReview({ studentId }).catch(() => ({ questions: [] })),
          studentId ? practiceService.getMyRoadmap(studentId).catch(() => null) : Promise.resolve(null)
        ]);

        setNotebookData(nbRes);
        setDailyReviewData(dueRes);

        // Map skillId -> Roadmap stage info (Chặng #, Môn, Chương, Bài, Dạng)
        if (rmRes?.nodes?.length) {
          const map = {};
          rmRes.nodes.forEach((n) => {
            if (n.skillId) {
              map[String(n.skillId)] = {
                stepOrder: n.stepOrder,
                subjectName: n.subjectName || n.domainName || '',
                chapterName: n.chapterName || '',
                lessonName: n.lessonName || '',
                skillName: n.skillName || ''
              };
            }
          });
          setRoadmapNodeBySkill(map);
        }

        // Hydrate real question contents (stem, options A-D, correctOption, explanation) from Content Service
        const rawItems = nbRes?.items || [];
        const uniqueQIds = [...new Set(rawItems.map((i) => i.questionId || i.originalQuestionId).filter(Boolean))];
        if (uniqueQIds.length > 0) {
          const fetched = await Promise.all(
            uniqueQIds.slice(0, 40).map((qid) =>
              contentService
                .getQuestionById(qid)
                .then((q) => [String(qid), q])
                .catch(() => [String(qid), null])
            )
          );
          setQuestionDetailsById((prev) => {
            const next = { ...prev };
            fetched.forEach(([qid, q]) => {
              if (q) next[qid] = q;
            });
            return next;
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [studentId, masteryFilter, tagFilter]
  );

  useEffect(() => {
    loadNotebookAndDue(false);
  }, [loadNotebookAndDue]);

  useEffect(() => {
    const handleSync = () => loadNotebookAndDue(true);
    window.addEventListener('veval:flow6-updated', handleSync);
    return () => window.removeEventListener('veval:flow6-updated', handleSync);
  }, [loadNotebookAndDue]);

  // Enrich every mistake item with its Roadmap stage order + Chapter/Lesson/Pattern + Real Question Content
  const enrichedItems = useMemo(() => {
    const rawItems = notebookData?.items || [];
    const customMap = readCustomBookMap();
    return rawItems.map((item) => {
      const qid = String(item.questionId || item.originalQuestionId || '');
      const sid = String(item.skillId || '');
      const rm = roadmapNodeBySkill[sid] || {};
      const qDetail = questionDetailsById[qid] || null;
      const custom = customMap[item.id] || {};

      const opts = Array.isArray(qDetail?.options) && qDetail.options.length > 0
        ? qDetail.options.map((o, idx) => ({
            key: o.key || ['A', 'B', 'C', 'D'][idx],
            content: o.content || o.text || ''
          }))
        : [];

      return {
        ...item,
        _stepOrder: rm.stepOrder || null,
        _subjectName: rm.subjectName || item.subjectName || item.domainName || qDetail?.domainName || 'Chuyên đề ĐGNL',
        _chapterName: rm.chapterName || item.chapterName || '',
        _lessonName: rm.lessonName || item.lessonName || '',
        _skillName: rm.skillName || item.skillName || qDetail?.skillName || 'Dạng bài trọng tâm',
        _content: qDetail?.contentLatex || qDetail?.content || item.questionContent || item.content || '',
        _options: opts,
        _correctOption: String(qDetail?.correctOption || item.correctOption || '').trim().toUpperCase(),
        _wrongOption: String(item.wrongOption || item.selectedOption || '').trim().toUpperCase(),
        _explanation: qDetail?.explanation || item.explanation || '',
        _customWrongDetail: custom.wrongDetail || '',
        _customFormula: custom.formula || ''
      };
    });
  }, [notebookData, roadmapNodeBySkill, questionDetailsById]);

  const dueQuestions = dailyReviewData?.questions || [];
  const activeReviewQ = dueQuestions[reviewIdx] || null;

  const openIndex = enrichedItems.findIndex((i) => i.id === openMistakeId);
  const activeBookItem = openIndex >= 0 ? enrichedItems[openIndex] : null;

  // Populate Right-Page fields & fetch suggested SGK formula whenever a book page is opened
  useEffect(() => {
    if (!activeBookItem) return;
    setEditTag(activeBookItem.cognitiveErrorTag || 'MISSING_CONCEPT');
    setEditWrongDetail(activeBookItem._customWrongDetail || '');
    setEditNotes(activeBookItem.studentNotes || '');
    setIsEditingFormula(false);

    const sid = String(activeBookItem.skillId || '');
    if (activeBookItem._customFormula) {
      setEditFormula(activeBookItem._customFormula);
      return;
    }

    if (sid && formulaBySkill[sid] !== undefined) {
      setEditFormula(formulaBySkill[sid]);
      return;
    }

    if (sid) {
      setEditFormula('');
      contentService
        .getMaterialsBySkill(sid)
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.materials || res?.items || res?.data || []);
          const raw = list.map((m) => m.content || m.contentMarkdown || '').filter(Boolean).join('\n\n');
          const extracted = extractFormulaSection(raw);
          setFormulaBySkill((prev) => ({ ...prev, [sid]: extracted }));
          setEditFormula((cur) => (cur ? cur : extracted));
        })
        .catch(() => {
          setFormulaBySkill((prev) => ({ ...prev, [sid]: '' }));
        });
    }
  }, [activeBookItem?.id]);

  const handleSaveBookPage = async () => {
    if (!activeBookItem || savingBookPage) return;
    setSavingBookPage(true);
    try {
      writeCustomBookEntry(activeBookItem.id, {
        wrongDetail: editWrongDetail,
        formula: editFormula
      });
      await practiceService.tagMistakeCognitiveError(activeBookItem.id, {
        cognitiveErrorTag: editTag,
        studentNotes: editNotes
      });
      setIsEditingFormula(false);
      toast.success('Đã lưu đầy đủ trang sổ (lỗi sai, công thức & ghi chú cá nhân)!');
      await loadNotebookAndDue(true);
    } catch (err) {
      toast.error(err?.message || 'Không thể lưu trang sổ.');
    } finally {
      setSavingBookPage(false);
    }
  };

  const handleStartReviewSession = () => {
    if (dueQuestions.length === 0) {
      toast.info('Hôm nay chưa có câu hỏi nào đến lịch ôn lại!');
      return;
    }
    setReviewIdx(0);
    setSelectedOption(null);
    setReviewFeedback(null);
    questionStartRef.current = Date.now();
    setIsReviewMode(true);
  };

  const handleSubmitReviewAnswer = async () => {
    if (!activeReviewQ || !selectedOption || submittingReview) return;
    setSubmittingReview(true);
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    try {
      const res = await practiceService.submitDailyMistakeReview(activeReviewQ.mistakeNotebookId, {
        selectedOption,
        timeSpentSeconds: elapsedSec
      });
      setReviewFeedback(res);
      if (res?.isMastered) {
        try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.65 } }); } catch { /* ignore */ }
        toast.success('Xuất sắc! Bạn đã nắm vững hoàn toàn câu này!');
      } else if (res?.isCorrect) {
        toast.success('Chính xác! Đã cập nhật lịch nhắc ôn tiếp theo.');
      } else {
        toast.warning('Chưa chính xác! Sổ tay sẽ nhắc bạn ôn lại vào ngày mai.');
      }
    } catch (err) {
      toast.error(err?.message || 'Không thể nộp câu trả lời.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleNextReviewQuestion = async () => {
    if (reviewIdx + 1 < dueQuestions.length) {
      setReviewIdx((p) => p + 1);
      setSelectedOption(null);
      setReviewFeedback(null);
      questionStartRef.current = Date.now();
    } else {
      setIsReviewMode(false);
      setReviewFeedback(null);
      setSelectedOption(null);
      await loadNotebookAndDue(true);
      toast.success('Đã hoàn thành toàn bộ bài ôn tập hôm nay!');
    }
  };

  const unmasteredCount = enrichedItems.filter((i) => !i.isMastered).length;
  const masteredCount = enrichedItems.filter((i) => i.isMastered).length;

  // =========================================================================
  // VIEW 2: OPEN 2-PAGE PURE WHITE BOOK FOR 1 SELECTED MISTAKE
  // =========================================================================
  if (activeBookItem) {
    const tagKeys = Object.keys(COGNITIVE_TAG_META);
    const currentTagIdx = Math.max(0, tagKeys.indexOf(editTag));
    const cycleTag = (dir) => {
      const nextIdx = (currentTagIdx + dir + tagKeys.length) % tagKeys.length;
      setEditTag(tagKeys[nextIdx]);
    };

    return (
      <div className={isBookFullscreen ? 'fixed inset-0 z-50 bg-slate-100/95 p-4 sm:p-6 overflow-y-auto flex flex-col gap-3' : 'space-y-4 animate-fade'}>
        {/* Book Top Navigation Strip (Nút Lưu trang sổ & Phóng to đặt gọn ở thanh ngoài) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsBookFullscreen(false);
                setOpenMistakeId(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Danh sách câu sai ({enrichedItems.length})</span>
            </button>
            <span className="text-xs font-bold text-slate-400">
              Trang {openIndex + 1} / {enrichedItems.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={openIndex <= 0}
              onClick={() => setOpenMistakeId(enrichedItems[openIndex - 1].id)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
            <button
              type="button"
              disabled={openIndex >= enrichedItems.length - 1}
              onClick={() => setOpenMistakeId(enrichedItems[openIndex + 1].id)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsBookFullscreen((v) => !v)}
              title={isBookFullscreen ? 'Thu nhỏ cuốn sổ' : 'Phóng to cuốn sổ toàn màn hình'}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isBookFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isBookFullscreen ? 'Thu nhỏ sổ' : 'Phóng to sổ'}</span>
            </button>

            {onOpenAiTutorWithContext && (
              <button
                type="button"
                onClick={() =>
                  onOpenAiTutorWithContext({
                    questionId: activeBookItem.questionId,
                    skillId: activeBookItem.skillId,
                    skillName: activeBookItem._skillName,
                    questionContent: activeBookItem._content
                  })
                }
                className="px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Hỏi Gia sư AI</span>
              </button>
            )}

            <button
              type="button"
              disabled={savingBookPage}
              onClick={handleSaveBookPage}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingBookPage ? 'Đang lưu...' : 'Lưu trang sổ'}</span>
            </button>
          </div>
        </div>

        {/* PURE WHITE 2-PAGE OPEN BOOK SPREAD */}
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2 ${isBookFullscreen ? 'flex-1 min-h-0' : 'min-h-[600px]'}`}>
          {/* ==================== MẶT TRÁI (TRANG ĐỀ BÀI) ==================== */}
          <div className="bg-white p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col overflow-y-auto">
            {/* 1/4 TRANG ĐẦU TIÊN: ĐẦU MỤC CHƯƠNG, BÀI, DẠNG & CHẶNG */}
            <div className="pb-4 mb-4 border-b border-slate-200 space-y-1.5 min-h-[115px] flex flex-col justify-center">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeBookItem._stepOrder && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black">
                      Chặng #{activeBookItem._stepOrder}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {activeBookItem._subjectName}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {activeBookItem.nextReviewDate
                    ? `Nhắc ôn: ${new Date(activeBookItem.nextReviewDate).toLocaleDateString('vi-VN')}`
                    : 'Sổ tay SM-2'}
                </span>
              </div>

              {activeBookItem._chapterName && (
                <div className="text-xs font-semibold text-slate-500">
                  <span className="text-slate-400 font-bold uppercase text-[10px] mr-1.5">Chương:</span>
                  {activeBookItem._chapterName}
                </div>
              )}
              {activeBookItem._lessonName && (
                <div className="text-xs font-semibold text-slate-600">
                  <span className="text-slate-400 font-bold uppercase text-[10px] mr-1.5">Bài:</span>
                  {activeBookItem._lessonName}
                </div>
              )}
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug pt-0.5">
                {activeBookItem._skillName}
              </h2>
            </div>

            {/* 3/4 TRANG DƯỚI: NỘI DUNG CÂU HỎI & ĐÁP ÁN SAI / ĐÚNG */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Nội dung câu hỏi
                </div>
                <div className="text-sm sm:text-[15px] font-semibold text-slate-900 leading-relaxed">
                  {activeBookItem._content ? (
                    <MathText text={activeBookItem._content} />
                  ) : (
                    <span className="text-slate-400 italic">Đang tải nội dung câu hỏi từ ngân hàng đề...</span>
                  )}
                </div>
              </div>

              {/* Danh sách đáp án A, B, C, D hiện rõ Đúng / Sai */}
              {activeBookItem._options.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Các phương án trả lời
                  </div>
                  {activeBookItem._options.map((opt) => {
                    const isRight = opt.key === activeBookItem._correctOption;
                    const isWrongPick = opt.key === activeBookItem._wrongOption && !isRight;
                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                          isRight
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                            : isWrongPick
                              ? 'bg-rose-50/70 border-rose-400 text-rose-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isRight
                              ? 'bg-emerald-600 text-white'
                              : isWrongPick
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div className="flex-1 min-w-0 break-words pt-0.5">
                          <MathText text={opt.content} />
                        </div>
                        {isRight && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" /> Đúng
                          </span>
                        )}
                        {isWrongPick && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-black text-rose-600">
                            <XCircle className="w-4 h-4" /> Đã chọn sai
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeBookItem._explanation && (
                <div className="pt-4 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Lời giải tham khảo
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <MathText text={activeBookItem._explanation} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== MẶT PHẢI (TRANG KIẾN THỨC & GHI CHÉP) ==================== */}
          <div className="bg-white p-5 sm:p-6 flex flex-col gap-3.5 overflow-y-auto">
            {/* 1. DÒNG ĐẦU TIÊN GỌN GÀNG: SAI CHỖ NÀO? (‹ DROPDOWN › + GHI NHANH) */}
            <div className="pb-3.5 border-b border-slate-100 space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                  1. Sai chỗ nào?
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => cycleTag(-1)}
                    title="Nguyên nhân trước"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 text-xs font-bold text-rose-900 outline-none cursor-pointer"
                  >
                    {Object.entries(COGNITIVE_TAG_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => cycleTag(1)}
                    title="Nguyên nhân tiếp theo"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={editWrongDetail}
                onChange={(e) => setEditWrongDetail(e.target.value)}
                placeholder="Ghi ngắn gọn bước bị sai (vd: quên đổi đơn vị, nhầm dấu âm...)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-rose-400"
              />
            </div>

            {/* 2. PHẦN CHÍNH: CÔNG THỨC & KIẾN THỨC ÁP DỤNG (CÓ THỂ SỬA TAY) */}
            <div className="flex-1 flex flex-col min-h-[340px] space-y-2">
              <div className="flex items-center justify-between gap-2 shrink-0">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Công thức &amp; Kiến thức áp dụng cho dạng này</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingFormula((v) => !v)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  {isEditingFormula ? (
                    <>
                      <Eye className="w-3 h-3" /> Xem hiển thị
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3 h-3" /> Chỉnh sửa tay
                    </>
                  )}
                </button>
              </div>

              {isEditingFormula ? (
                <textarea
                  value={editFormula}
                  onChange={(e) => setEditFormula(e.target.value)}
                  placeholder="Nhập hoặc chỉnh sửa công thức áp dụng theo cách hiểu của bạn (hỗ trợ LaTeX $...$)..."
                  className="flex-1 min-h-[310px] w-full p-4 rounded-2xl border border-emerald-300 bg-white text-xs sm:text-sm font-mono text-slate-800 leading-relaxed outline-none focus:border-emerald-500 resize-y"
                />
              ) : (
                <div
                  onClick={() => setIsEditingFormula(true)}
                  title="Nhấn để chỉnh sửa tay công thức"
                  className="flex-1 min-h-[310px] p-4 rounded-2xl border border-slate-200 bg-slate-50/30 hover:border-emerald-300 text-sm text-slate-800 leading-relaxed overflow-y-auto cursor-text"
                >
                  {editFormula ? (
                    <MathText text={editFormula} />
                  ) : (
                    <span className="text-slate-400 italic">
                      Nhấn vào đây hoặc bấm "Chỉnh sửa tay" để tự ghi công thức trọng tâm cho dạng bài này...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 3. GHI CHÚ CÁ NHÂN (CÓ THỂ THU GỌN / MỞ RỘNG ĐỂ DÀNH KHÔNG GIAN CHO KIẾN THỨC) */}
            <div className="pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsNotesOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 text-xs font-black text-slate-700 cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>3. Ghi chú cá nhân</span>
                  {editNotes.trim() && !isNotesOpen && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Đã có ghi chú
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <span>{isNotesOpen ? 'Thu gọn' : 'Mở ghi chú'}</span>
                  {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {isNotesOpen && (
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú mẹo làm bài nhanh, dấu hiệu nhận biết hoặc bẫy cần nhớ của riêng bạn..."
                  className="mt-2 w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 leading-relaxed outline-none focus:border-blue-400"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: OUTER LIST OF ALL WRONG QUESTIONS (WITH STAGE # & TOPIC)
  // =========================================================================
  return (
    <div className="space-y-4 animate-fade">
      {/* Slim Header */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              Sổ Tay Lỗi Sai (SM-2)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Chọn bất kỳ câu nào bên dưới để mở trang sổ phân tích lỗi sai, công thức áp dụng &amp; ghi chú cá nhân
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            Cần ôn: <strong className="text-rose-600">{unmasteredCount}</strong> • Đã thuộc: <strong className="text-emerald-600">{masteredCount}</strong>
          </span>
          <button
            type="button"
            onClick={handleStartReviewSession}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Ôn tập đến hạn hôm nay ({dueQuestions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => loadNotebookAndDue(false)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {[
            { id: 'ALL', label: `Tất cả (${enrichedItems.length})` },
            { id: 'UNMASTERED', label: `Cần ôn (${unmasteredCount})` },
            { id: 'MASTERED', label: `Đã thuộc (${masteredCount})` }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setMasteryFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                masteryFilter === f.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'ALL', label: 'Mọi nguyên nhân' },
            { id: 'MISSING_CONCEPT', label: 'Chưa vững lý thuyết' },
            { id: 'MISREAD_QUESTION', label: 'Đọc sót đề' },
            { id: 'CARELESS', label: 'Tính ẩu' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTagFilter(t.id)}
              className={`px-2.5 py-1.5 rounded-lg border font-bold cursor-pointer ${
                tagFilter === t.id
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wrong Questions List */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
          Đang tải danh sách câu sai và đồng bộ nội dung đề bài...
        </div>
      ) : enrichedItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-2">
          <BookOpen className="w-9 h-9 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">Chưa có câu làm sai nào trong sổ tay</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Các câu bạn làm sai trong quá trình học P-L-A-R sẽ tự động được lưu tại đây kèm thứ tự Chặng, Chương, Bài và Dạng bài.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {enrichedItems.map((item, idx) => {
            const tagMeta = COGNITIVE_TAG_META[item.cognitiveErrorTag] || COGNITIVE_TAG_META.MISSING_CONCEPT;
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setOpenMistakeId(item.id)}
                className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md p-4 transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  {/* Top row: Stage # + Subject + Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item._stepOrder && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10.5px] font-black">
                          Chặng #{item._stepOrder}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                        {item._subjectName}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${tagMeta.cls}`}>
                      {tagMeta.shortLabel}
                    </span>
                  </div>

                  {/* Chapter > Lesson > Pattern */}
                  <div className="text-xs font-extrabold text-slate-900 leading-snug">
                    {item._skillName}
                  </div>
                  {(item._chapterName || item._lessonName) && (
                    <div className="text-[11px] text-slate-500 truncate">
                      {[item._chapterName, item._lessonName].filter(Boolean).join(' › ')}
                    </div>
                  )}

                  {/* Real question content preview */}
                  <div className="text-xs text-slate-700 line-clamp-2 leading-relaxed pt-1 border-t border-slate-100">
                    {item._content ? (
                      <MathText text={item._content} />
                    ) : (
                      <span className="text-slate-400 italic">Nhấn để mở chi tiết câu hỏi #{idx + 1}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <span className={item.isMastered ? 'text-emerald-600 flex items-center gap-1' : 'text-rose-600 flex items-center gap-1'}>
                    {item.isMastered ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Đã thuộc</>
                    ) : (
                      <><CalendarClock className="w-3.5 h-3.5" /> Ôn lại: {item.nextReviewDate ? new Date(item.nextReviewDate).toLocaleDateString('vi-VN') : 'Hôm nay'}</>
                    )}
                  </span>
                  <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Mở trang sổ <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive SM-2 Daily Review Runner Modal */}
      {isReviewMode && activeReviewQ && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Ôn Tập Biến Thể SM-2 • Câu {reviewIdx + 1} / {dueQuestions.length}
                </h3>
                <p className="text-xs text-slate-500">{activeReviewQ.skillName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewMode(false)}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
                <MathText text={activeReviewQ.content} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(activeReviewQ.options || []).map((opt) => {
                  const chosen = selectedOption === opt.key;
                  const showRes = Boolean(reviewFeedback);
                  const isCorr = showRes && reviewFeedback.correctOption === opt.key;
                  const isWrong = showRes && chosen && !reviewFeedback.isCorrect;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={showRes}
                      onClick={() => setSelectedOption(opt.key)}
                      className={`p-3 rounded-xl border text-left text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                        isCorr
                          ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950'
                          : isWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : chosen
                              ? 'bg-blue-50 border-blue-500 font-bold text-blue-950'
                              : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="font-black shrink-0">{opt.key}.</span>
                      <div className="flex-1 min-w-0 break-words"><MathText text={opt.text} /></div>
                    </button>
                  );
                })}
              </div>

              {reviewFeedback && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  reviewFeedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="font-black">
                    {reviewFeedback.isCorrect ? 'Chính xác!' : `Chưa chính xác. Đáp án đúng là ${reviewFeedback.correctOption}.`}
                  </div>
                  {reviewFeedback.explanation && <MathText text={reviewFeedback.explanation} />}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                {!reviewFeedback ? (
                  <button
                    type="button"
                    disabled={!selectedOption || submittingReview}
                    onClick={handleSubmitReviewAnswer}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer disabled:opacity-40"
                  >
                    {submittingReview ? 'Đang chấm...' : 'Kiểm tra đáp án'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextReviewQuestion}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{reviewIdx + 1 < dueQuestions.length ? 'Câu ôn tiếp theo' : 'Hoàn thành ôn tập'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
