import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  BookOpen,
  Compass,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  HelpCircle,
  Pencil,
  Activity,
  Lightbulb,
  AlertCircle,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';
import MathText from '../common/MathText';
import InteractiveMathRenderer from '../common/InteractiveMathRenderer';
import {
  buildTheoryFromChunks,
  buildMethodFromChunks,
  extractKeyFormulasFromChunks,
  cleanPrefix,
  findSavedNodeData,
  isGenericPlaceholder,
  isValidGuid,
  normalizeViText
} from './textbookStateBridge';
import contentService from '../../services/contentService';
import { toast } from '../../context/ToastContext';

/**
 * UnifiedNodeDetailView
 * Hiển thị 3 tầng sư phạm chuẩn mực cho 1 Node (Bài học / Dạng bài):
 * - Tầng 1: Lý Thuyết Trọng Tâm từ SGK Chuẩn (kết nối trực tiếp Vector Chunks từ DB)
 * - Tầng 2: Dạng Đề & Phương Pháp Giải Chuyên Sâu (kèm JSXGraph Interactive Board nhúng trực tiếp)
 * - Tầng 3: Ngân Hàng Câu Hỏi Thực Tế & ĐGNL của Node (truy vấn trực tiếp CSDL qua API 16/17/by-skill)
 */
export default function UnifiedNodeDetailView({
  selectedPattern,
  parentLesson,
  parentChapter,
  matchedSgkChunks = [],
  activeSourceIds = [],
  onOpenStudio,
  onOpenQuickEdit,
  onLaunchAdaptiveQuiz,
  onSelectPattern,
  instructorMode = true
}) {
  // 1. Quản lý trạng thái đóng/mở 3 tầng sư phạm (Lý thuyết trọng tâm mặc định mở)
  const [isTheoryExpanded, setIsTheoryExpanded] = useState(true);
  const [isMethodExpanded, setIsMethodExpanded] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  // Luôn tự mở khối Lý thuyết trọng tâm khi chuyển sang dạng bài khác
  useEffect(() => {
    setIsTheoryExpanded(true);
  }, [selectedPattern?.patternId]);

  // Lắng nghe sự kiện đồng bộ real-time khi bên SGK lưu/sửa/xóa sách
  useEffect(() => {
    const bump = () => setSyncVersion(v => v + 1);
    window.addEventListener('veval:textbook-saved', bump);
    window.addEventListener('veval:textbook-deleted', bump);
    window.addEventListener('veval:curriculum-synced', bump);
    return () => {
      window.removeEventListener('veval:textbook-saved', bump);
      window.removeEventListener('veval:textbook-deleted', bump);
      window.removeEventListener('veval:curriculum-synced', bump);
    };
  }, []);

  // Tra cứu dữ liệu mới nhất bên SGK (chỉ duyệt các sourceId còn tồn tại trong DB, triệt tiêu bóng ma sách đã xóa)
  const savedSgkNode = useMemo(() => {
    if (!selectedPattern) return null;
    return findSavedNodeData(parentLesson?.name || '', selectedPattern?.name || '', activeSourceIds);
  }, [parentLesson?.name, selectedPattern?.name, activeSourceIds, syncVersion]);

  const detectedSub = useMemo(() => {
    if (matchedSgkChunks && matchedSgkChunks.length > 0 && matchedSgkChunks[0]?.subjectCode) {
      return String(matchedSgkChunks[0].subjectCode).toUpperCase();
    }
    const ctxLabel = normalizeViText(`${parentChapter?.name || ''} ${parentLesson?.name || ''} ${selectedPattern?.name || ''}`);
    if (ctxLabel.includes('hóa') || ctxLabel.includes('nguyên tử') || ctxLabel.includes('phản ứng') || ctxLabel.includes('halogen') || ctxLabel.includes('ester') || ctxLabel.includes('hydrocarbon')) return 'CHEM';
    if (ctxLabel.includes('vật lí') || ctxLabel.includes('chuyển động') || ctxLabel.includes('newton') || ctxLabel.includes('động lượng')) return 'PHYS';
    if (ctxLabel.includes('sinh học') || ctxLabel.includes('di truyền')) return 'BIO';
    if (ctxLabel.includes('toán') || ctxLabel.includes('hàm số') || ctxLabel.includes('xác suất') || ctxLabel.includes('vectơ')) return 'MATH';
    return '';
  }, [matchedSgkChunks, parentChapter?.name, parentLesson?.name, selectedPattern?.name]);

  // 2. State Ngân hàng câu hỏi thực tế của Node
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionFilterLevel, setQuestionFilterLevel] = useState('ALL'); // 'ALL' | 'L1' | 'L2' | 'L3' | 'L4'
  const [expandedExplanationMap, setExpandedExplanationMap] = useState({});

  // 3. Tự động truy vấn câu hỏi thực tế từ Content Service (Database) & hợp nhất câu hỏi SGK còn hiệu lực
  useEffect(() => {
    let isMounted = true;
    const fetchNodeQuestions = async () => {
      const patternId = selectedPattern?.patternId;
      if (!patternId) {
        setQuestions([]);
        return;
      }

      setLoadingQuestions(true);
      const localExercises = Array.isArray(savedSgkNode?.pattern?.exercises)
        ? savedSgkNode.pattern.exercises.map((ex, idx) => ({
            questionId: ex.id || `sgk-q-${idx}`,
            contentLatex: ex.contentLatex || ex.stem || ex.content || '',
            optionA: ex.optionA || ex.options?.[0] || '',
            optionB: ex.optionB || ex.options?.[1] || '',
            optionC: ex.optionC || ex.options?.[2] || '',
            optionD: ex.optionD || ex.options?.[3] || '',
            correctOption: typeof ex.correctOption === 'string'
              ? ex.correctOption
              : String.fromCharCode(65 + (Number(ex.correctIndex) || 0)),
            explanation: ex.explanation || ex.solution || '',
            difficultyLevel: Number(ex.difficultyLevel || ex.bloomLevel) || 2
          }))
        : [];

      try {
        // Truy vấn câu hỏi từ CSDL thông qua API Content Service (chỉ gọi khi patternId là GUID chuẩn)
        const res = isValidGuid(patternId) ? await contentService.getQuestionsBySkill(patternId) : [];
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : (res.questions || []);

          // Gộp không trùng lặp giữa CSDL Content Service và câu hỏi mới sinh bên SGK
          const combined = [...list];
          localExercises.forEach(locQ => {
            const locText = (locQ.content || locQ.contentLatex || '').trim();
            const exists = combined.some(q => (q.content || q.contentLatex || '').trim() === locText);
            if (!exists && locText) {
              combined.push(locQ);
            }
          });

          setQuestions(combined);
        }
      } catch (err) {
        // Fallback: Lấy từ câu hỏi SGK còn hiệu lực hoặc sampleQuestion nếu API chưa có
        if (isMounted) {
          const fallbackList = [...localExercises];
          if (fallbackList.length === 0 && selectedPattern.sampleQuestion) {
            fallbackList.push({
              questionId: 'sample-' + (selectedPattern.patternId || '0'),
              contentLatex: selectedPattern.sampleQuestion.content,
              optionA: selectedPattern.sampleQuestion.options?.[0] || '',
              optionB: selectedPattern.sampleQuestion.options?.[1] || '',
              optionC: selectedPattern.sampleQuestion.options?.[2] || '',
              optionD: selectedPattern.sampleQuestion.options?.[3] || '',
              correctOption: String.fromCharCode(65 + (selectedPattern.sampleQuestion.correct || 0)),
              explanation: selectedPattern.sampleQuestion.explanation,
              difficultyLevel: 2
            });
          }
          setQuestions(fallbackList);
        }
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };

    fetchNodeQuestions();
    return () => { isMounted = false; };
  }, [selectedPattern?.patternId, selectedPattern?.name, savedSgkNode, syncVersion]);

  // 4. Tổng hợp lý thuyết thuần đồng nhất 100% với bên SGK:
  //    Ưu tiên 1: Lý thuyết giảng viên vừa chỉnh sửa / AI mở rộng bên SGK (còn hiệu lực trong DB)
  //    Ưu tiên 2: Dữ liệu thực tế từ cuốn SGK mới nhất đang khớp trong DB (matchedSgkChunks) — không để dữ liệu seed cũ đè lên sách mới
  //    Ưu tiên 3: Lý thuyết đã lưu trong Content Service DB (nếu chưa nạp sách SGK cho bài này)
  const synthesizedTheory = useMemo(() => {
    if (savedSgkNode?.pattern?.isEdited && savedSgkNode?.pattern?.theoryRecap && !isGenericPlaceholder(savedSgkNode.pattern.theoryRecap)) {
      return savedSgkNode.pattern.theoryRecap;
    }
    if (savedSgkNode?.lesson?.isEdited && savedSgkNode?.lesson?.theory && !isGenericPlaceholder(savedSgkNode.lesson.theory)) {
      return savedSgkNode.lesson.theory;
    }
    if (matchedSgkChunks && matchedSgkChunks.length > 0) {
      const pure = buildTheoryFromChunks(matchedSgkChunks, parentLesson?.name || selectedPattern?.name || '', detectedSub);
      if (pure && pure.trim() && !isGenericPlaceholder(pure)) return pure;
    }
    if (selectedPattern?.theoryRecap && selectedPattern.theoryRecap.trim() && !isGenericPlaceholder(selectedPattern.theoryRecap)) {
      return selectedPattern.theoryRecap;
    }
    return '';
  }, [savedSgkNode, matchedSgkChunks, parentLesson?.name, selectedPattern?.name, selectedPattern?.theoryRecap, detectedSub]);

  // 4.1. Công thức KaTeX đặc trưng đồng bộ trực tiếp từ SGK chunks + bài học đã lưu + CSDL
  const displayedKeyFormulas = useMemo(() => {
    const out = [];
    const seen = new Set();
    const pushItem = (f) => {
      const latex = typeof f === 'string' ? f.trim() : (f?.latex || '').trim();
      if (!latex) return;
      const norm = latex.replace(/^\$+|\$+$/g, '').trim().toLowerCase();
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      out.push(typeof f === 'string' ? { label: 'Công thức', latex: latex.replace(/^\$+|\$+$/g, '').trim() } : f);
    };

    if (matchedSgkChunks && matchedSgkChunks.length > 0) {
      extractKeyFormulasFromChunks(matchedSgkChunks).forEach(pushItem);
    }
    (savedSgkNode?.lesson?.keyFormulas || []).forEach(pushItem);
    (selectedPattern?.keyFormulas || []).forEach(pushItem);
    return out;
  }, [matchedSgkChunks, savedSgkNode?.lesson?.keyFormulas, selectedPattern?.keyFormulas]);

  // 4.2. Phương pháp giải đồng bộ 100% với Khối 2 bên SGK (ưu tiên biên soạn mới -> tổng hợp từ SGK mới nhất -> CSDL Content Service)
  const synthesizedMethod = useMemo(() => {
    const savedMethod = (savedSgkNode?.pattern?.solutionMethod && !isGenericPlaceholder(savedSgkNode.pattern.solutionMethod))
      ? savedSgkNode.pattern.solutionMethod.trim()
      : ((savedSgkNode?.pattern?.method && !isGenericPlaceholder(savedSgkNode.pattern.method)) ? savedSgkNode.pattern.method.trim() : '');

    if (savedMethod && (savedSgkNode?.pattern?.isEdited || savedMethod.includes('\n') || savedMethod.length >= 140)) {
      return savedMethod;
    }

    const dbMethod = (selectedPattern?.solutionMethod && !isGenericPlaceholder(selectedPattern.solutionMethod))
      ? selectedPattern.solutionMethod.trim()
      : '';

    if (matchedSgkChunks && matchedSgkChunks.length > 0) {
      const fromSgk = buildMethodFromChunks(
        matchedSgkChunks,
        { title: parentLesson?.name || '', keyFormulas: displayedKeyFormulas.map(f => f.latex || f) },
        { name: selectedPattern?.name || '', method: savedMethod || (dbMethod.length < 140 ? dbMethod : '') },
        detectedSub
      );
      if (fromSgk && !isGenericPlaceholder(fromSgk)) {
        return fromSgk;
      }
    }

    return dbMethod || savedMethod || '';
  }, [savedSgkNode, matchedSgkChunks, parentLesson?.name, selectedPattern?.name, selectedPattern?.solutionMethod, displayedKeyFormulas, detectedSub]);

  // 5. Trích xuất tag đồ thị JSXGraph từ phương pháp giải hoặc đề mẫu
  const embeddedGraphTag = useMemo(() => {
    const textSources = [
      selectedPattern?.solutionMethod,
      selectedPattern?.theoryRecap,
      selectedPattern?.sampleQuestion?.content,
      selectedPattern?.sampleQuestion?.explanation
    ].filter(Boolean);

    for (const src of textSources) {
      const match = src.match(/(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\])/i);
      if (match) return match[0];
    }
    return null;
  }, [selectedPattern]);

  // 6. Lọc câu hỏi theo mức độ nhận thức Bloom
  const filteredQuestions = useMemo(() => {
    if (questionFilterLevel === 'ALL') return questions;
    const targetLvl = Number(questionFilterLevel.replace('L', '')) || 2;
    return questions.filter(q => (q.difficultyLevel || q.bloomLevel || 2) === targetLvl);
  }, [questions, questionFilterLevel]);

  const toggleExplanation = (qId) => {
    setExpandedExplanationMap(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 lg:p-6 space-y-5 animate-fade">

      {/* HEADER TỐI GIẢN (MUI) */}
      <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
              {parentChapter?.name && `${parentChapter.name} • `}
              {parentLesson?.name || ''}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.35 }}>
                {selectedPattern?.name}
              </Typography>
              {(() => {
                const raw = String(selectedPattern?.level || '').trim();
                const num = Number(selectedPattern?.bloomLevel || selectedPattern?.difficultyLevel || (raw.match(/(\d)/)?.[1] || 0));
                const levelText =
                  num === 1 || /nhận biết/i.test(raw) ? 'Nhận biết' :
                  num === 2 || /thông hiểu/i.test(raw) ? 'Thông hiểu' :
                  num === 3 || /vận dụng(?!\s*cao)/i.test(raw) ? 'Vận dụng' :
                  num >= 4 || /vận dụng cao/i.test(raw) ? 'Vận dụng cao' :
                  raw.replace(/bloom\s*l?\d*\s*[:•\-–]?\s*/gi, '').replace(/^l\d+\s*[:•\-–]?\s*/i, '').trim() || 'Vận dụng';
                return <Chip size="small" color="primary" variant="outlined" label={levelText} sx={{ height: 22, fontSize: '0.72rem' }} />;
              })()}
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0, pt: 0.25 }}>
            {onOpenStudio && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<Sparkles size={13} />}
                sx={{ height: 30, px: 1.25, py: 0, fontSize: '0.74rem' }}
                onClick={() =>
                  onOpenStudio({
                    ...selectedPattern,
                    theoryRecap: synthesizedTheory || selectedPattern?.theoryRecap || '',
                    solutionMethod: synthesizedMethod || selectedPattern?.solutionMethod || ''
                  })
                }
              >
                Studio
              </Button>
            )}
            {instructorMode && (
              <Tooltip title="Sửa nhanh dạng bài">
                <IconButton
                  size="small"
                  onClick={() => onOpenQuickEdit && onOpenQuickEdit(selectedPattern)}
                  sx={{ width: 30, height: 30, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                >
                  <Pencil size={14} />
                </IconButton>
              </Tooltip>
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Zap size={13} />}
              sx={{ height: 30, px: 1.5, py: 0, fontSize: '0.74rem' }}
              onClick={() => onLaunchAdaptiveQuiz && onLaunchAdaptiveQuiz(selectedPattern)}
            >
              Luyện tập (5 câu)
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* 1. LÝ THUYẾT TRỌNG TÂM */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden transition-all">
        <div
          onClick={() => setIsTheoryExpanded(!isTheoryExpanded)}
          className="px-4 py-2.5 bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-200 hover:bg-slate-100/70 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Lý thuyết trọng tâm
            </h3>
          </div>
          {isTheoryExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>

        {isTheoryExpanded && (
          <div className="p-5 space-y-4">
            {/* Nội dung lý thuyết thuần cô đặc */}
            {synthesizedTheory && synthesizedTheory.trim() ? (
              <div className="p-4 rounded-xl bg-white border border-cyan-100 text-xs text-slate-800 leading-relaxed font-medium shadow-2xs max-h-[480px] overflow-y-auto">
                <MathText text={synthesizedTheory} />
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-dashed border-cyan-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-700">Chưa có nội dung lý thuyết</div>
                <div className="text-[11px] text-slate-400">Nội dung lý thuyết trọng tâm đang được cập nhật cho dạng bài này.</div>
              </div>
            )}

            {/* Danh sách công thức KaTeX đặc trưng nếu có */}
            {displayedKeyFormulas.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  <span>Công thức & Phương trình đặc trưng ({displayedKeyFormulas.length}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {displayedKeyFormulas.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2 border border-slate-800 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-300">{f.label || `Công thức ${idx + 1}`}:</span>
                      <div className="text-cyan-300 text-xs font-semibold overflow-x-auto py-0.5">
                        <MathText text={`$$${f.latex || f}$$`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* [TẦNG 2] 💡 DẠNG ĐỀ & PHƯƠNG PHÁP GIẢI CHUYÊN SÂU (NATIVE JSXGRAPH)        */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 overflow-hidden transition-all shadow-2xs">
        <div
          onClick={() => setIsMethodExpanded(!isMethodExpanded)}
          className="p-4 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white flex items-center justify-between cursor-pointer border-b border-amber-100/80 hover:bg-amber-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Phương pháp giải &amp; Ví dụ minh họa
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isMethodExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-700" />
            )}
          </div>
        </div>

        {isMethodExpanded && (
          <div className="p-5 space-y-4">
            {/* Phương pháp giải từng bước */}
            {synthesizedMethod && synthesizedMethod.trim() ? (
              <div className="p-4 rounded-xl bg-white border border-amber-100 text-xs text-slate-800 leading-relaxed font-medium shadow-2xs">
                <div className="font-extrabold text-amber-950 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Quy trình và phương pháp giải dạng bài:</span>
                </div>
                <MathText text={synthesizedMethod} />
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-dashed border-amber-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-700">Chưa có hướng dẫn phương pháp giải</div>
                <div className="text-[11px] text-slate-400">Quy trình giải quyết dạng bài đang được cập nhật cho chuyên đề này.</div>
              </div>
            )}

            {/* BẢNG VẼ NATIVE JSXGRAPH TƯƠNG TÁC NHÚNG TRỰC TIẾP (KHÔNG DÙNG POPUP) */}
            {embeddedGraphTag ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Mô Hình Trực Quan Toán Học & Vật Lý:</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono">
                    ⚡ Tương tác trực quan
                  </span>
                </div>
                <div className="flex justify-center p-2 bg-slate-950 rounded-lg overflow-hidden">
                  <InteractiveMathRenderer rawTag={embeddedGraphTag} />
                </div>
                <p className="text-[10.5px] text-slate-400 italic text-center">
                  Kéo chuột để xoay mô hình 3D. Bạn có thể đổi tham số và thu phóng đồ thị.
                </p>
              </div>
            ) : null}

            {/* Bẫy tư duy & Lưu ý sư phạm */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-900 font-bold">Lưu ý sư phạm & Bẫy tư duy thường gặp: </strong>
                <span className="text-rose-800 font-medium">
                  {selectedPattern?.pedagogicalNote || 'Chưa có lưu ý sư phạm cho dạng bài này.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* [TẦNG 3] 🎯 KHO CÂU HỎI THỰC TẾ & ĐỀ THI ĐGNL CỦA NODE                      */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/20 overflow-hidden transition-all shadow-2xs">
        <div
          onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
          className="p-4 bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-white flex items-center justify-between cursor-pointer border-b border-indigo-100/80 hover:bg-indigo-50 transition-colors select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Câu hỏi luyện tập</span>
              <span className="text-xs font-semibold text-slate-500">
                ({loadingQuestions ? 'Đang tải...' : `${questions.length} câu`})
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isQuestionsExpanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-700" />
            )}
          </div>
        </div>

        {isQuestionsExpanded && (
          <div className="p-5 space-y-4">
            
            {/* Bộ lọc nhanh cấp độ nhận thức */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-indigo-100/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Mức độ nhận thức:</span>
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'L1', label: 'Nhận biết' },
                  { key: 'L2', label: 'Thông hiểu' },
                  { key: 'L3', label: 'Vận dụng' },
                  { key: 'L4', label: 'Vận dụng cao' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuestionFilterLevel(key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      questionFilterLevel === key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {instructorMode && (
                <button
                  type="button"
                  onClick={() => onOpenStudio && onOpenStudio(selectedPattern)}
                  className="px-3 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm câu hỏi mới vào CSDL</span>
                </button>
              )}
            </div>

            {/* Danh sách câu hỏi */}
            {loadingQuestions ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                <div className="text-xs font-medium">Đang tải danh sách câu hỏi luyện tập...</div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-extrabold text-slate-700">Chưa có câu hỏi luyện tập cho dạng bài này</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Hiện chưa có câu hỏi được thêm vào cho chuyên đề này.
                </p>
                {instructorMode && (
                  <button
                    type="button"
                    onClick={() => onOpenStudio && onOpenStudio(selectedPattern)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 mt-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mở Studio Sinh & Nạp Câu Hỏi</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                {filteredQuestions.map((q, idx) => {
                  const qId = q.questionId || `q-${idx}`;
                  const isExp = expandedExplanationMap[qId];
                  const optA = q.optionA || q.options?.find(o => (o.key || o.optionKey) === 'A')?.content || '';
                  const optB = q.optionB || q.options?.find(o => (o.key || o.optionKey) === 'B')?.content || '';
                  const optC = q.optionC || q.options?.find(o => (o.key || o.optionKey) === 'C')?.content || '';
                  const optD = q.optionD || q.options?.find(o => (o.key || o.optionKey) === 'D')?.content || '';
                  const correct = (q.correctOption || 'A').toUpperCase();

                  return (
                    <div
                      key={qId}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Tiêu đề câu hỏi & Badge Bloom */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">
                            Câu #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {(() => {
                              const lvl = Number(q.difficultyLevel || q.bloomLevel || 2);
                              const lvlMap = { 1: 'Nhận biết', 2: 'Thông hiểu', 3: 'Vận dụng', 4: 'Vận dụng cao' };
                              return lvlMap[lvl] || `Mức độ ${lvl}`;
                            })()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            Đáp án: {correct}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExplanation(qId)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{isExp ? 'Ẩn lời giải' : 'Xem lời giải'}</span>
                        </button>
                      </div>

                      {/* Nội dung đề bài trắc nghiệm */}
                      <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                        <MathText text={q.contentLatex || q.content || ''} />
                      </div>

                      {/* 4 phương án trắc nghiệm A/B/C/D */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: 'A', text: optA },
                          { key: 'B', text: optB },
                          { key: 'C', text: optC },
                          { key: 'D', text: optD }
                        ].map((opt) => {
                          const isCorrect = opt.key === correct;
                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-300'
                                  : 'bg-slate-50/50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {opt.key}
                              </span>
                              <div className="leading-snug pt-0.5">
                                <MathText text={opt.text} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Lời giải chi tiết dạng toggle */}
                      {isExp && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1 animate-fade">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-indigo-900">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Phương pháp và Lời giải chi tiết:</span>
                          </div>
                          <div className="whitespace-pre-line text-slate-700 font-medium pl-5">
                            <MathText text={q.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.'} />
                          </div>
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

    </div>
  );
}
