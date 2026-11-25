import React, { useState } from 'react';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Shuffle,
  ListOrdered,
  TrendingUp,
  FolderTree,
  Undo2,
  BookOpen,
  Edit3,
  Unlink,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Lock,
  GitBranch
} from 'lucide-react';
import {
  BLOOM_LEVEL_DETAILS,
  renumberExamSequentially,
  reorderExamBlocks,
  reorderQuestionsInPassage,
  sortExamByBloom,
  sortExamByCurriculumNode,
  shuffleExamBlocks,
  shuffleAllExamOptions,
  moveSingleQuestionIntoPassage,
  detachQuestionFromPassage
} from '../../utils/examOrganizerUtils';

/**
 * ExamOrganizerTab — Drag-and-Drop Exam Reorder, Smart Bloom/Curriculum Sort & Shuffle Board
 */
export default function ExamOrganizerTab({
  exam,
  orderedView,
  isLocked,
  onApplyExamTransform,
  onEditInStudio
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const [collapsedPassages, setCollapsedPassages] = useState({});

  const { items } = orderedView;
  const passages = exam?.passages || [];

  const runTransform = (transformFn, message) => {
    if (isLocked || !exam) return;
    setUndoSnapshot(exam);
    const nextExam = transformFn(exam);
    onApplyExamTransform?.(nextExam, message);
  };

  const handleUndo = () => {
    if (!undoSnapshot || isLocked) return;
    onApplyExamTransform?.(undoSnapshot, 'Đã hoàn tác thao tác sắp xếp gần nhất.');
    setUndoSnapshot(null);
  };

  const handleDropBlock = (targetIdx) => {
    if (dragIndex === null || dragIndex === targetIdx || isLocked) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    runTransform(
      (cur) => reorderExamBlocks(cur, dragIndex, targetIdx),
      `Đã di chuyển khối từ vị trí #${dragIndex + 1} sang #${targetIdx + 1} và tự đánh lại số câu.`
    );
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Smart Reorder & Shuffle Toolbar */}
      <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-[#1E3A5F]">
              Sắp Xếp Cấu Trúc & Xáo Trộn Mã Đề
            </h2>
            <p className="text-xs text-slate-500">
              Kéo thả thẻ câu hỏi / chùm đọc hiểu để đổi vị trí, hoặc dùng các nút sắp xếp tự động theo Độ khó & Khung chương trình.
            </p>
          </div>

          {undoSnapshot && !isLocked && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Hoàn tác sắp xếp</span>
            </button>
          )}
        </div>

        {isLocked ? (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Đề thi đang ở trạng thái Khóa. Hãy bấm "Mở khóa" trên thanh công cụ để sắp xếp lại thứ tự câu hỏi.</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                runTransform(renumberExamSequentially, 'Đã đánh lại số thứ tự câu hỏi liên tục từ 1 đến hết.')
              }
              className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Đánh lại số 1 → N</span>
            </button>

            <button
              type="button"
              onClick={() =>
                runTransform(
                  (cur) => sortExamByBloom(cur, true),
                  'Đã sắp xếp toàn bộ đề theo độ khó tăng dần.'
                )
              }
              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Xếp theo Độ khó</span>
            </button>

            <button
              type="button"
              onClick={() =>
                runTransform(
                  sortExamByCurriculumNode,
                  'Đã gom nhóm câu hỏi theo Miền năng lực, Chương & Bài học.'
                )
              }
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Gom theo Chương / Bài</span>
            </button>

            <button
              type="button"
              onClick={() =>
                runTransform(
                  shuffleExamBlocks,
                  'Đã xáo trộn thứ tự câu hỏi (bảo toàn nguyên vẹn các chùm bài đọc hiểu).'
                )
              }
              className="px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Trộn thứ tự câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={() =>
                runTransform(
                  shuffleAllExamOptions,
                  'Đã xáo trộn 4 phương án A/B/C/D cho toàn bộ đề và tự cập nhật đúng đáp án!'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Trộn đáp án A/B/C/D toàn đề</span>
            </button>
          </div>
        )}
      </div>

      {/* Draggable Block List */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DCD9D0] bg-white p-12 text-center text-xs text-slate-500">
            Chưa có câu hỏi nào để sắp xếp.
          </div>
        ) : (
          items.map((item, idx) => {
            const isDraggingThis = dragIndex === idx;
            const isDropTarget = dropIndex === idx && dragIndex !== null && dragIndex !== idx;

            if (item.type === 'passage') {
              const p = item.data;
              const isCollapsed = Boolean(collapsedPassages[p.localId]);

              return (
                <div
                  key={p.localId}
                  draggable={!isLocked}
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dropIndex !== idx) setDropIndex(idx);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropBlock(idx);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDropIndex(null);
                  }}
                  className={`rounded-2xl border bg-white transition-all overflow-hidden ${
                    isDraggingThis
                      ? 'opacity-50 border-dashed border-[#2C4C7E]'
                      : isDropTarget
                      ? 'border-2 border-[#1E3A5F] shadow-md'
                      : 'border-[#D4DFED] hover:border-[#2C4C7E]/60'
                  }`}
                >
                  {/* Passage Row Header */}
                  <div className="px-4 py-3 bg-[#F7F9FC] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {!isLocked && (
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0" />
                      )}
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-extrabold shrink-0">
                        Chùm Câu {p.startQuestion}–{p.endQuestion}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2C4C7E] shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                        {p.questions?.length || 0} câu con
                      </span>
                      <p className="text-xs text-slate-600 truncate">{p.content}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedPassages((prev) => ({ ...prev, [p.localId]: !prev[p.localId] }))
                        }
                        className="p-1.5 rounded-lg hover:bg-white text-slate-500 cursor-pointer"
                        title={isCollapsed ? 'Mở rộng câu con' : 'Thu gọn câu con'}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>

                      {!isLocked && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() =>
                              runTransform(
                                (cur) => reorderExamBlocks(cur, idx, idx - 1),
                                'Đã chuyển chùm đọc hiểu lên trên.'
                              )
                            }
                            className="p-1.5 rounded-lg bg-white border border-[#E5E3DC] hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() =>
                              runTransform(
                                (cur) => reorderExamBlocks(cur, idx, idx + 1),
                                'Đã chuyển chùm đọc hiểu xuống dưới.'
                              )
                            }
                            className="p-1.5 rounded-lg bg-white border border-[#E5E3DC] hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Child Questions inside Passage */}
                  {!isCollapsed && (p.questions || []).length > 0 && (
                    <div className="p-3 pl-8 space-y-1.5 bg-white border-t border-[#ECEAE4]">
                      {p.questions.map((q, qIdx) => {
                        const bloom =
                          BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(q.difficultyLevel)) ||
                          BLOOM_LEVEL_DETAILS[1];
                        return (
                          <div
                            key={q.localId}
                            className="px-3 py-2 rounded-xl border border-[#ECEAE4] bg-[#FCFCFA] flex flex-wrap items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs font-extrabold text-[#1E3A5F] shrink-0">
                                Câu {q.questionNumber}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${bloom.chipClass}`}>
                                {bloom.name}
                              </span>
                              <span className="text-xs text-slate-700 truncate">{q.content}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => onEditInStudio?.(q.localId)}
                                className="px-2 py-1 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] text-[11px] font-bold text-[#1E3A5F] flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Sửa
                              </button>
                              {!isLocked && (
                                <>
                                  <button
                                    type="button"
                                    disabled={qIdx === 0}
                                    onClick={() =>
                                      runTransform(
                                        (cur) => reorderQuestionsInPassage(cur, p.localId, qIdx, qIdx - 1),
                                        'Đã đổi thứ tự câu hỏi trong chùm.'
                                      )
                                    }
                                    className="p-1 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={qIdx === p.questions.length - 1}
                                    onClick={() =>
                                      runTransform(
                                        (cur) => reorderQuestionsInPassage(cur, p.localId, qIdx, qIdx + 1),
                                        'Đã đổi thứ tự câu hỏi trong chùm.'
                                      )
                                    }
                                    className="p-1 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      runTransform(
                                        (cur) => detachQuestionFromPassage(cur, p.localId, q.localId),
                                        `Đã tách Câu ${q.questionNumber} ra thành câu hỏi đơn lẻ.`
                                      )
                                    }
                                    title="Tách khỏi chùm đọc hiểu thành câu đơn lẻ"
                                    className="p-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer"
                                  >
                                    <Unlink className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single Question Draggable Card
            const q = item.data;
            const bloom =
              BLOOM_LEVEL_DETAILS.find((b) => b.level === Number(q.difficultyLevel)) ||
              BLOOM_LEVEL_DETAILS[1];

            return (
              <div
                key={q.localId}
                draggable={!isLocked}
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dropIndex !== idx) setDropIndex(idx);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropBlock(idx);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropIndex(null);
                }}
                className={`rounded-xl border bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 transition-all ${
                  isDraggingThis
                    ? 'opacity-50 border-dashed border-[#2C4C7E]'
                    : isDropTarget
                    ? 'border-2 border-[#1E3A5F] shadow-md'
                    : 'border-[#E7E5DF] hover:border-[#2C4C7E]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {!isLocked && <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0" />}
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EEF2F7] text-[#1E3A5F] text-xs font-extrabold shrink-0">
                    Câu {q.questionNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border shrink-0 ${bloom.chipClass}`}>
                    {bloom.name}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {q.content || '(Trống)'}
                    </div>
                    {q.curriculumNode?.chapterName && (
                      <div className="text-[10.5px] text-indigo-700 font-medium truncate flex items-center gap-1">
                        <GitBranch className="w-3 h-3 shrink-0" />
                        <span>
                          {q.curriculumNode.chapterName}
                          {q.curriculumNode.lessonName ? ` › ${q.curriculumNode.lessonName}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-extrabold">
                    ĐA: {q.correctOption}
                  </span>

                  {!isLocked && passages.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const targetPid = e.target.value;
                        if (targetPid) {
                          runTransform(
                            (cur) => moveSingleQuestionIntoPassage(cur, q.localId, targetPid),
                            `Đã gộp Câu ${q.questionNumber} vào chùm đọc hiểu.`
                          );
                        }
                        e.target.value = '';
                      }}
                      className="px-2 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-[10.5px] font-semibold text-slate-600 max-w-[140px]"
                    >
                      <option value="">↳ Gộp vào chùm...</option>
                      {passages.map((p) => (
                        <option key={p.localId} value={p.localId}>
                          Chùm {p.startQuestion}–{p.endQuestion}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditInStudio?.(q.localId)}
                    className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[11px] font-bold text-[#1E3A5F] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Sửa
                  </button>

                  {!isLocked && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          runTransform(
                            (cur) => reorderExamBlocks(cur, idx, idx - 1),
                            `Đã chuyển Câu ${q.questionNumber} lên trên.`
                          )
                        }
                        className="p-1.5 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() =>
                          runTransform(
                            (cur) => reorderExamBlocks(cur, idx, idx + 1),
                            `Đã chuyển Câu ${q.questionNumber} xuống dưới.`
                          )
                        }
                        className="p-1.5 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
