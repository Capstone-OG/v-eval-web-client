import React, { useState } from 'react';
import {
  BookOpen,
  ImagePlus,
  Edit3,
  Check,
  Trash2,
  Plus,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sigma,
  Tag,
  FileText,
  ClipboardPaste,
  GitBranch,
  ChevronRight
} from 'lucide-react';
import ExamRichContent from './ExamRichContent';
import { ExamFigureBox } from './ExamMediaLightbox';
import { BLOOM_LEVELS, KATEX_QUICK_SNIPPETS } from '../../utils/examParserUtils';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function readFileAsDataUrl(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) callback(e.target.result, file.name);
  };
  reader.readAsDataURL(file);
}

/**
 * Passage Card (Chùm câu hỏi đọc hiểu / Ngữ liệu thí nghiệm)
 */
export function ExamPassageCard({
  passage,
  isLocked,
  isPasteTarget,
  onHoverTarget,
  onUpdatePassage,
  onDeletePassage,
  onAddQuestionToPassage,
  onZoomImage
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsDataUrl(file, (dataUrl) => {
      onUpdatePassage(passage.localId, (p) => ({
        ...p,
        imageUrl: dataUrl,
        imageUserAttached: true
      }));
    });
    e.target.value = '';
  };

  return (
    <article
      onMouseEnter={() => onHoverTarget?.({ type: 'passage', localId: passage.localId })}
      onClick={() => onHoverTarget?.({ type: 'passage', localId: passage.localId })}
      className={`rounded-2xl border bg-white shadow-xs transition-all overflow-hidden border-l-4 border-l-cyan-500 ${
        isPasteTarget
          ? 'border-cyan-300 ring-2 ring-cyan-500/15'
          : 'border-slate-200/90 hover:border-cyan-300/80'
      }`}
    >
      {/* Passage Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-cyan-50/80 via-emerald-50/40 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-xs font-extrabold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              Ngữ cảnh chùm câu {passage.startQuestion} – {passage.endQuestion}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-cyan-800 border border-cyan-200">
            {passage.questions?.length || 0} câu hỏi con
          </span>
          {isPasteTarget && !isLocked && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/80">
              <ClipboardPaste className="w-3 h-3" /> Sẵn sàng Ctrl+V dán ảnh
            </span>
          )}
        </div>

        {!isLocked && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <label
              title="Đính kèm ảnh ngữ liệu gốc"
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-cyan-50 hover:border-cyan-300 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5 text-cyan-600" />
              <span>Chèn ảnh</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
              }`}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isEditing ? 'Xong' : 'Sửa ngữ cảnh'}</span>
            </button>

            <button
              type="button"
              onClick={() => onAddQuestionToPassage?.(passage.localId)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu</span>
            </button>

            <button
              type="button"
              onClick={() => onDeletePassage?.(passage)}
              title="Xóa chùm bài đọc hiểu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Passage Body */}
      <div className="p-5 space-y-3">
        {isEditing && !isLocked ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                <span>Từ câu:</span>
                <input
                  type="number"
                  min={1}
                  value={passage.startQuestion}
                  onChange={(e) =>
                    onUpdatePassage(passage.localId, (p) => ({
                      ...p,
                      startQuestion: Number(e.target.value) || 1
                    }))
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono text-slate-900"
                />
              </label>
              <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                <span>Đến câu:</span>
                <input
                  type="number"
                  min={1}
                  value={passage.endQuestion}
                  onChange={(e) =>
                    onUpdatePassage(passage.localId, (p) => ({
                      ...p,
                      endQuestion: Number(e.target.value) || p.startQuestion
                    }))
                  }
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono text-slate-900"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Sigma className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              {KATEX_QUICK_SNIPPETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onUpdatePassage(passage.localId, (p) => ({
                      ...p,
                      content: `${p.content || ''} ${s.code}`.trim()
                    }))
                  }
                  className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10.5px] font-semibold text-emerald-800 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={passage.content}
              onChange={(e) =>
                onUpdatePassage(passage.localId, (p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Nhập nội dung đoạn văn, ngữ liệu thí nghiệm, bảng Markdown hoặc công thức KaTeX..."
              className="w-full p-3 rounded-xl border border-cyan-200 bg-slate-50/40 focus:bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Xem trước ngữ cảnh
              </div>
              <ExamRichContent text={passage.content} onImageClick={onZoomImage} />
            </div>
          </div>
        ) : (
          <ExamRichContent text={passage.content} onImageClick={onZoomImage} />
        )}

        <ExamFigureBox
          imageUrl={passage.imageUrl}
          images={passage.images}
          imageUserAttached={passage.imageUserAttached}
          content={passage.content}
          isPassage
          isLocked={isLocked}
          onZoom={onZoomImage}
          onRemoveImage={() =>
            onUpdatePassage(passage.localId, (p) => ({
              ...p,
              imageUrl: null,
              imageUserAttached: false,
              images: []
            }))
          }
        />
      </div>
    </article>
  );
}

/**
 * Question Card (Câu hỏi trắc nghiệm)
 */
export function ExamQuestionCard({
  question,
  parentPassageLocalId = null,
  isLocked = false,
  showAnswerKey = true,
  showExplanationGlobal = false,
  selectedPreviewOption = null,
  isActiveInNav = false,
  isPasteTarget = false,
  onSelectPreviewOption,
  onHoverTarget,
  onUpdateQuestion,
  onDeleteQuestion,
  onOpenStudio,
  onOpenNodePicker,
  onZoomImage
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localExpOpen, setLocalExpOpen] = useState(false);

  const bloom = BLOOM_LEVELS.find((b) => b.level === Number(question.difficultyLevel)) || BLOOM_LEVELS[1];
  const hasExplanation = Boolean(question.explanation && question.explanation.trim());
  const isExpExpanded = showExplanationGlobal || localExpOpen;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsDataUrl(file, (dataUrl) => {
      onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
        ...q,
        imageUrl: dataUrl,
        imageUserAttached: true
      }));
    });
    e.target.value = '';
  };

  return (
    <article
      id={`exam-q-${question.questionNumber}`}
      data-qnum={question.questionNumber}
      onMouseEnter={() =>
        onHoverTarget?.({ type: 'question', localId: question.localId, parentPassageLocalId })
      }
      onClick={() =>
        onHoverTarget?.({ type: 'question', localId: question.localId, parentPassageLocalId })
      }
      className={`scroll-mt-24 rounded-2xl border bg-white transition-all shadow-xs ${
        isActiveInNav
          ? 'border-emerald-400 ring-2 ring-emerald-500/15 shadow-sm'
          : isPasteTarget
          ? 'border-cyan-300 ring-1 ring-cyan-400/20'
          : 'border-slate-200/90 hover:border-emerald-300/80'
      } ${parentPassageLocalId ? 'sm:ml-4 border-l-4 border-l-emerald-400/70' : ''}`}
    >
      {/* Question Header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold tracking-tight shadow-2xs">
            Câu {question.questionNumber}
          </span>

          {question.suggestedSkillName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
              <Tag className="w-3 h-3 shrink-0" />
              <span className="max-w-[220px] truncate" title={question.suggestedSkillName}>
                {question.suggestedSkillName}
              </span>
            </span>
          )}

          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${bloom.badgeClass}`}>
            {bloom.label}
          </span>

          {question.pageNumber > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10.5px] font-medium">
              <FileText className="w-3 h-3" />
              Tr. {question.pageNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {!isLocked && (
            <>
              <label
                title="Đính kèm ảnh / đồ thị gốc cho câu hỏi"
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-cyan-50 hover:border-cyan-300 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">Ảnh</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isEditing
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                }`}
              >
                {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isEditing ? 'Xong' : 'Sửa nhanh'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenStudio?.(question, parentPassageLocalId)}
                title="Mở Studio biên tập công thức Word/Excel & 3D"
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Studio</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteQuestion?.(question, parentPassageLocalId)}
                title="Xóa câu hỏi này"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Question Body */}
      <div className="p-5 space-y-4">
        {/* Curriculum Node Lineage Breadcrumb Strip */}
        {(() => {
          const node = question.curriculumNode;
          const hasNode = Boolean(node && (node.chapterName || node.lessonName || node.domainName));
          const sourceLabel =
            node?.matchSource === 'database'
              ? 'DB'
              : node?.matchSource === 'manual'
              ? 'Đã duyệt'
              : node?.matchSource === 'ai'
              ? `AI ${Math.round((node.confidence || 0.88) * 100)}%`
              : `Tự động ${Math.round((node?.confidence || 0.7) * 100)}%`;

          const sourceStyle =
            node?.matchSource === 'database' || node?.matchSource === 'manual'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : node?.matchSource === 'ai'
              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
              : 'bg-cyan-100 text-cyan-800 border-cyan-200';

          return hasNode ? (
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50/70 via-cyan-50/40 to-emerald-50/40 border border-indigo-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600 shrink-0 mr-0.5" />
                {node.domainName && (
                  <span className="font-bold text-indigo-800">{node.domainName}</span>
                )}
                {node.chapterName && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800">{node.chapterName}</span>
                  </>
                )}
                {node.lessonName && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-cyan-800">{node.lessonName}</span>
                  </>
                )}
                {node.patternName && node.patternName !== node.lessonName && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-emerald-800">{node.patternName}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  title={node.reason || 'Nguồn nhận diện nút Khung chương trình'}
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-extrabold ${sourceStyle}`}
                >
                  {sourceLabel}
                </span>
                {!isLocked && onOpenNodePicker && (
                  <button
                    type="button"
                    onClick={() => onOpenNodePicker(question, parentPassageLocalId)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    Đổi Node
                  </button>
                )}
              </div>
            </div>
          ) : (
            !isLocked &&
            onOpenNodePicker && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onOpenNodePicker(question, parentPassageLocalId)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Chưa gắn Chương / Bài học · Nhấn để gắn Node Khung chương trình</span>
                </button>
              </div>
            )
          );
        })()}

        {isEditing && !isLocked ? (
          <div className="space-y-4">
            {/* Metadata row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Số thứ tự câu</span>
                <input
                  type="number"
                  min={1}
                  value={question.questionNumber}
                  onChange={(e) =>
                    onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                      ...q,
                      questionNumber: Number(e.target.value) || 1
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Mức độ Bloom</span>
                <select
                  value={question.difficultyLevel}
                  onChange={(e) =>
                    onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                      ...q,
                      difficultyLevel: Number(e.target.value) || 2
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  {BLOOM_LEVELS.map((b) => (
                    <option key={b.level} value={b.level}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600">Kỹ năng / Chuyên đề gợi ý</span>
                <input
                  type="text"
                  value={question.suggestedSkillName}
                  onChange={(e) =>
                    onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                      ...q,
                      suggestedSkillName: e.target.value
                    }))
                  }
                  placeholder="VD: Cực trị hàm số, Đọc hiểu..."
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </label>
            </div>

            {/* KaTeX Snippets */}
            <div className="flex flex-wrap items-center gap-1">
              <Sigma className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              {KATEX_QUICK_SNIPPETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                      ...q,
                      content: `${q.content || ''} ${s.code}`.trim()
                    }))
                  }
                  className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10.5px] font-semibold text-emerald-800 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Stem Textarea + Preview */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600">Nội dung câu hỏi (Hỗ trợ KaTeX, Bảng Markdown)</label>
              <textarea
                rows={4}
                value={question.content}
                onChange={(e) =>
                  onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                    ...q,
                    content: e.target.value
                  }))
                }
                className="w-full p-3 rounded-xl border border-emerald-200 bg-slate-50/40 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                <div className="text-[10.5px] font-bold text-emerald-800 mb-1">Xem trước trực quan</div>
                <ExamRichContent text={question.content} onImageClick={onZoomImage} />
              </div>
            </div>

            {/* Options Editor */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-600">
                Các phương án trắc nghiệm (Nhấn chữ cái A/B/C/D để đặt làm đáp án đúng)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {OPTION_KEYS.map((key) => {
                  const isCorrect = question.correctOption === key;
                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 transition-colors ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                            ...q,
                            correctOption: key
                          }))
                        }
                        title={`Chọn ${key} làm đáp án đúng`}
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700'
                        }`}
                      >
                        {key}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1">
                        <input
                          type="text"
                          value={question.options?.[key] || ''}
                          onChange={(e) =>
                            onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                              ...q,
                              options: { ...(q.options || {}), [key]: e.target.value }
                            }))
                          }
                          placeholder={`Nội dung phương án ${key}...`}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        {question.options?.[key] && (
                          <div className="text-xs text-slate-700 px-1">
                            <ExamRichContent text={question.options[key]} inline />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation Editor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">Lời giải chi tiết (tùy chọn)</label>
              <textarea
                rows={3}
                value={question.explanation}
                onChange={(e) =>
                  onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                    ...q,
                    explanation: e.target.value
                  }))
                }
                placeholder="Nhập hướng dẫn giải chi tiết bằng văn bản / LaTeX..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Rendered Question Stem */}
            <ExamRichContent text={question.content} onImageClick={onZoomImage} />

            {/* Extracted or Attached Image Figure */}
            <ExamFigureBox
              imageUrl={question.imageUrl}
              images={question.images}
              imageUserAttached={question.imageUserAttached}
              content={question.content}
              isPassage={false}
              isLocked={isLocked}
              onZoom={onZoomImage}
              onRemoveImage={() =>
                onUpdateQuestion(question.localId, parentPassageLocalId, (q) => ({
                  ...q,
                  imageUrl: null,
                  imageUserAttached: false,
                  images: []
                }))
              }
            />

            {/* Options 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {OPTION_KEYS.map((key) => {
                const val = question.options?.[key] ?? '';
                const isCorrect = showAnswerKey && question.correctOption === key;
                const isPicked = selectedPreviewOption === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectPreviewOption?.(question.questionNumber, key)}
                    className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                      isCorrect
                        ? 'border-emerald-400 bg-emerald-50/70 shadow-2xs'
                        : isPicked
                        ? 'border-cyan-400 bg-cyan-50/70'
                        : 'border-slate-200/90 bg-slate-50/40 hover:border-emerald-300 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isPicked
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {key}
                    </span>

                    <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-slate-800">
                      {val ? (
                        <ExamRichContent text={val} inline onImageClick={onZoomImage} />
                      ) : (
                        <span className="italic text-slate-400 text-xs">(Trống)</span>
                      )}
                    </div>

                    {isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" title="Đáp án đúng" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Collapsible Explanation */}
            {hasExplanation && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setLocalExpOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{isExpExpanded ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                  {isExpExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpExpanded && (
                  <div className="mt-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-slate-800">
                    <ExamRichContent text={question.explanation} onImageClick={onZoomImage} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

