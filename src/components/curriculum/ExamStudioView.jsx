import React, { useMemo } from 'react';
import { MenuItem, Select } from '@mui/material';
import {
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  GitBranch,
  PenTool,
  Plus,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { ExamDatabaseCardsGrid } from './ExamDatabaseModal';
import ExamQuestionStudioTab from './ExamQuestionStudioTab';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import ExamWorkspaceHeader, { ExamPageFlowBar } from './ExamWorkspaceHeader';
import ExamSharedModals from './ExamSharedModals';
import { useExamWorkspaceController } from './useExamWorkspaceController';
import { formatSubjectLabel, normalizeOptionLetter } from '../../utils/examParserUtils';

/**
 * Trang 3 (exam-studio) — Studio Biên Soạn Từng Câu Hỏi Đề Thi (2-Pane Editor + Full 838-Item Studio)
 * Mirrors SGK Page 3 (TextbookStudioView) in the 3-page workflow.
 */
export default function ExamStudioView({ onNavigateTab }) {
  const controller = useExamWorkspaceController({
    onNavigateTab,
    enableClipboardPaste: true
  });

  const {
    currentExam,
    orderedView,
    selectedQuestionLocalId,
    setSelectedQuestionLocalId,
    pendingBloomCount,
    processingJob,
    isLocked,
    dbExams,
    dbLoading,
    dbError,
    busyExamId,
    fetchDatabaseExams,
    handleCreateBlankExam,
    handleLoadExamFromDb,
    handlePublishExam,
    requestDeleteExam,
    handleUpdateQuestion,
    handleUpdatePassage,
    handleAddSingleQuestion,
    handleAddPassageCluster,
    handleDuplicateQuestion,
    requestDeleteQuestion,
    setNodePickerState,
    setFullStudioTarget,
    setLightboxImage,
    setPasteTarget,
    setBankSubView,
    setIngestPart
  } = controller;

  const allQuestions = orderedView?.allQuestions || [];
  const activeIndex = useMemo(() => {
    if (allQuestions.length === 0) return -1;
    const idx = allQuestions.findIndex((q) => q.localId === selectedQuestionLocalId);
    return idx >= 0 ? idx : 0;
  }, [allQuestions, selectedQuestionLocalId]);
  const activeQuestion = activeIndex >= 0 ? allQuestions[activeIndex] : null;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F6F5F1] -m-4 sm:-m-6 p-4 sm:p-6 text-slate-900 space-y-4">
      <ExamPageFlowBar
        activePage="exam-studio"
        onNavigateTab={onNavigateTab}
        pendingBloomCount={pendingBloomCount}
        processingJob={processingJob}
      />

      {!currentExam ? (
        <div className="max-w-7xl mx-auto space-y-5 pb-8">
          {/* Studio Quick-Start Banner */}
          <div className="rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2F7] border border-[#D4DFED] text-[#1E3A5F] text-[11px] font-extrabold">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trang 3 / 3 · Studio Biên Soạn Từng Câu Hỏi Đề Thi</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Studio Biên Soạn & Chỉnh Sửa Từng Câu Hỏi
                </h1>
                <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                  Chọn một đề thi bên dưới để bắt đầu biên tập từng câu hỏi trong giao diện 2 cột (KaTeX live preview,
                  6 mức độ Bloom, gắn Node Chương/Bài, dán ảnh <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">Ctrl+V</kbd>,
                  và tích hợp Full Studio 838 ký hiệu &amp; 3D MathLab) — hoặc tạo mới đề thi ngay lập tức.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCreateBlankExam({ navigateTo: null })}
                  className="px-4 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Tạo Đề Trống &amp; Soạn Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIngestPart('pdf');
                    onNavigateTab?.('exam-ingest');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-[#DCD9D0] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Phân Tích Đề</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIngestPart('bloom');
                    onNavigateTab?.('exam-ingest');
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Câu Hỏi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct Database Exam Selector to enter Studio in 1 click */}
          <ExamDatabaseCardsGrid
            exams={dbExams}
            loading={dbLoading}
            error={dbError}
            activeExamId={currentExam?.examId}
            busyExamId={busyExamId}
            onRefresh={fetchDatabaseExams}
            onSelectExam={(examSummary) => handleLoadExamFromDb(examSummary)}
            onPublishExam={handlePublishExam}
            onDeleteExam={requestDeleteExam}
          />
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          <ExamWorkspaceHeader
            controller={controller}
            activePage="exam-studio"
            onNavigateTab={onNavigateTab}
            showBackToBank={false}
            leftRow2Slot={
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-extrabold">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Studio Sửa Từng Câu</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setBankSubView('paper');
                    onNavigateTab?.('exam-bank');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem Đề Thi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBankSubView('organize');
                    onNavigateTab?.('exam-bank');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sắp Xếp Đề</span>
                </button>
              </>
            }
          />

          {activeQuestion && !isLocked ? (
            <div className="space-y-3">
              {/* Thanh chuyển câu nhanh ngay phía trên Full Studio */}
              <div className="rounded-xl border border-[#E5E3DC] bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg p-0.5">
                    <button
                      type="button"
                      disabled={activeIndex <= 0}
                      onClick={() => setSelectedQuestionLocalId(allQuestions[activeIndex - 1].localId)}
                      title="Câu trước"
                      className="p-1 rounded-md text-slate-600 hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 text-xs font-extrabold text-[#1E3A5F]">
                      Câu {activeQuestion.questionNumber}{' '}
                      <span className="font-semibold text-slate-400">
                        ({activeIndex + 1}/{allQuestions.length})
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={activeIndex >= allQuestions.length - 1}
                      onClick={() => setSelectedQuestionLocalId(allQuestions[activeIndex + 1].localId)}
                      title="Câu sau"
                      className="p-1 rounded-md text-slate-600 hover:bg-[#EEF2F7] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <Select
                    size="small"
                    value={activeQuestion.localId}
                    onChange={(e) => setSelectedQuestionLocalId(e.target.value)}
                    sx={{
                      height: 30,
                      maxWidth: 320,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: '#fff',
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                      '& .MuiSelect-select': { py: 0.5, pl: 1.25, pr: '28px !important' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { borderRadius: '10px', mt: 0.5, maxWidth: 420, border: '1px solid #cbd5e1', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' }
                      }
                    }}
                  >
                    {allQuestions.map((q) => (
                      <MenuItem key={q.localId} value={q.localId} sx={{ fontSize: '0.76rem' }}>
                        Câu {q.questionNumber} (ĐA: {q.correctOption || 'A'}) — {(q.content || '').replace(/\$[^$]*\$/g, '[CT]').slice(0, 55)}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setNodePickerState({
                        mode: 'question',
                        question: activeQuestion,
                        parentPassageLocalId: activeQuestion.parentPassageLocalId || null,
                        passageContent: ''
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{activeQuestion.curriculumNode?.chapterName ? 'Đổi Node' : 'Gắn Node'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSingleQuestion}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu</span>
                  </button>
                </div>
              </div>

              {/* Vào thẳng Full Studio (CurriculumStudioEditor) không qua màn hình trung gian */}
              <div className="rounded-2xl border border-[#E5E3DC] bg-white overflow-hidden shadow-2xs">
                <CurriculumStudioEditor
                  key={activeQuestion.localId}
                  mode="exam"
                  pattern={{
                    patternId: `EXAM_Q${activeQuestion.questionNumber}`,
                    name: `Câu ${activeQuestion.questionNumber} · ${
                      activeQuestion.suggestedSkillName || formatSubjectLabel(currentExam.subjectCode)
                    }`,
                    theoryRecap: activeQuestion.content || '',
                    solutionMethod: activeQuestion.explanation || '',
                    level: `L${activeQuestion.difficultyLevel || 2}`,
                    sampleQuestion: {
                      questionId: activeQuestion.questionId,
                      difficultyLevel: activeQuestion.difficultyLevel || 2,
                      content: activeQuestion.content || '',
                      options: [
                        `A. ${activeQuestion.options?.A || ''}`,
                        `B. ${activeQuestion.options?.B || ''}`,
                        `C. ${activeQuestion.options?.C || ''}`,
                        `D. ${activeQuestion.options?.D || ''}`
                      ],
                      correct: Math.max(0, ['A', 'B', 'C', 'D'].indexOf(activeQuestion.correctOption || 'A')),
                      explanation: activeQuestion.explanation || ''
                    }
                  }}
                  domain={{
                    name: formatSubjectLabel(currentExam.subjectCode),
                    code: currentExam.subjectCode || 'MATH'
                  }}
                  chapter={{ name: currentExam.title || 'Đề thi thực tế' }}
                  lesson={{ name: `Câu ${activeQuestion.questionNumber}` }}
                  onClose={() => {
                    setBankSubView('paper');
                    onNavigateTab?.('exam-bank');
                  }}
                  onSaveSuccess={(updated) => {
                    if (!updated) return;
                    const sq = updated.sampleQuestion;
                    const bloomFromLevel = (() => {
                      const m = String(updated.level || '').match(/L([1-6])/i);
                      return m ? Number(m[1]) : null;
                    })();
                    handleUpdateQuestion(
                      activeQuestion.localId,
                      activeQuestion.parentPassageLocalId || null,
                      (q) => ({
                        ...q,
                        content: updated.theoryRecap !== undefined ? updated.theoryRecap : q.content,
                        explanation: updated.solutionMethod !== undefined ? updated.solutionMethod : q.explanation,
                        difficultyLevel: bloomFromLevel || Number(sq?.difficultyLevel) || q.difficultyLevel,
                        ...(sq
                          ? {
                              options: {
                                A: sq.optionA !== undefined ? sq.optionA : q.options?.A || '',
                                B: sq.optionB !== undefined ? sq.optionB : q.options?.B || '',
                                C: sq.optionC !== undefined ? sq.optionC : q.options?.C || '',
                                D: sq.optionD !== undefined ? sq.optionD : q.options?.D || ''
                              },
                              correctOption: sq.correctOption
                                ? normalizeOptionLetter(sq.correctOption)
                                : q.correctOption
                            }
                          : {})
                      })
                    );
                  }}
                />
              </div>
            </div>
          ) : (
            <ExamQuestionStudioTab
              exam={currentExam}
              orderedView={orderedView}
              isLocked={isLocked}
              selectedQuestionLocalId={selectedQuestionLocalId}
              onSelectQuestionLocalId={setSelectedQuestionLocalId}
              onUpdateQuestion={handleUpdateQuestion}
              onUpdatePassage={handleUpdatePassage}
              onAddSingleQuestion={handleAddSingleQuestion}
              onAddPassageCluster={handleAddPassageCluster}
              onDuplicateQuestion={handleDuplicateQuestion}
              onDeleteQuestion={requestDeleteQuestion}
              onOpenNodePicker={(q, passageId, passageContent) =>
                setNodePickerState({
                  mode: 'question',
                  question: q,
                  parentPassageLocalId: passageId,
                  passageContent: passageContent || ''
                })
              }
              onOpenFullStudio={(questionObj, passageId) =>
                setFullStudioTarget({ question: questionObj, parentPassageLocalId: passageId })
              }
              onZoomImage={(src, caption) => setLightboxImage({ src, caption })}
              onHoverTarget={setPasteTarget}
            />
          )}
        </div>
      )}

      <ExamSharedModals
        controller={controller}
        onJumpToQuestion={(num) => {
          const qObj = orderedView.questionMap.get(num);
          if (qObj) setSelectedQuestionLocalId(qObj.localId);
        }}
        onFilterByChapter={() => {
          setBankSubView('paper');
          onNavigateTab?.('exam-bank');
        }}
      />
    </div>
  );
}
