import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import ExamDatabaseModal from './ExamDatabaseModal';
import { ExamImageLightbox } from './ExamMediaLightbox';
import ExamNodePickerModal from './ExamNodePickerModal';
import ExamBlueprintDrawer from './ExamBlueprintDrawer';
import { useToast } from '../../context/ToastContext';
import { formatSubjectLabel, normalizeOptionLetter } from '../../utils/examParserUtils';

/**
 * ExamSharedModals — Renders the common modals/overlays across all 3 Exam pages
 */
export default function ExamSharedModals({
  controller,
  onJumpToQuestion,
  onFilterByChapter,
  onSelectExamFromModal
}) {
  const { toast } = useToast();
  const {
    currentExam,
    dbExams,
    dbLoading,
    busyExamId,
    dbModalOpen,
    setDbModalOpen,
    loadingExamDetail,
    lightboxImage,
    setLightboxImage,
    blueprintOpen,
    setBlueprintOpen,
    blueprintStats,
    classifyingNodes,
    nodePickerState,
    setNodePickerState,
    bloomTargetSkillNode,
    setBloomTargetSkillNode,
    curriculumDomains,
    flatCurriculumNodes,
    confirmDialog,
    setConfirmDialog,
    fullStudioTarget,
    setFullStudioTarget,
    fetchDatabaseExams,
    handleLoadExamFromDb,
    handlePublishExam,
    requestDeleteExam,
    handleRunLocalAutoMap,
    handleRunAiNodeClassification,
    handleUpdateQuestion
  } = controller;

  return (
    <>
      {/* Loading Detail Overlay */}
      {loadingExamDetail && (
        <div className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E7E5DF] shadow-xl px-6 py-5 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#1E3A5F] animate-spin" />
            <span className="text-sm font-bold text-slate-800">Đang tải cấu trúc đề thi từ Database...</span>
          </div>
        </div>
      )}

      {/* Database Quick Switcher Modal */}
      <ExamDatabaseModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        exams={dbExams}
        loading={dbLoading}
        activeExamId={currentExam?.examId}
        busyExamId={busyExamId}
        onRefresh={fetchDatabaseExams}
        onSelectExam={(examSummary) => {
          if (onSelectExamFromModal) {
            onSelectExamFromModal(examSummary);
          } else {
            handleLoadExamFromDb(examSummary);
          }
        }}
        onPublishExam={handlePublishExam}
        onDeleteExam={requestDeleteExam}
      />

      {/* Full-Screen Image Lightbox */}
      <ExamImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

      {/* Exam Specification Blueprint Matrix Modal */}
      <ExamBlueprintDrawer
        isOpen={blueprintOpen}
        examTitle={currentExam?.title}
        blueprint={blueprintStats}
        classifyingAi={classifyingNodes}
        onRunAutoMap={() => handleRunLocalAutoMap(true)}
        onRunAiClassify={handleRunAiNodeClassification}
        onJumpToQuestion={(num) => {
          setBlueprintOpen(false);
          onJumpToQuestion?.(num);
        }}
        onFilterByChapter={(chapName) => {
          setBlueprintOpen(false);
          onFilterByChapter?.(chapName);
        }}
        onClose={() => setBlueprintOpen(false)}
      />

      {/* Shared 4-Tier Cascading Curriculum Node Picker Modal */}
      <ExamNodePickerModal
        key={
          nodePickerState?.mode === 'question'
            ? nodePickerState.question?.localId
            : nodePickerState?.mode || 'picker'
        }
        isOpen={Boolean(nodePickerState)}
        question={
          nodePickerState?.mode === 'question'
            ? nodePickerState.question
            : {
                questionNumber: 'AI',
                content: 'Chọn Kỹ năng / Dạng bài để AI sinh câu hỏi theo 6 mức độ Bloom (L1 – L6)',
                curriculumNode: bloomTargetSkillNode
              }
        }
        passageContent={nodePickerState?.passageContent || ''}
        examSubjectCode={currentExam?.subjectCode || 'GENERAL'}
        curriculumDomains={curriculumDomains}
        flatNodes={flatCurriculumNodes}
        onSelectNode={(pickedNode) => {
          if (nodePickerState?.mode === 'bloom-skill') {
            setBloomTargetSkillNode(pickedNode);
            toast.success(`Đã chọn Skill "${pickedNode.patternName || pickedNode.lessonName}" để sinh câu Bloom!`);
            setNodePickerState(null);
            return;
          }
          if (nodePickerState?.question) {
            handleUpdateQuestion(
              nodePickerState.question.localId,
              nodePickerState.parentPassageLocalId,
              (q) => ({
                ...q,
                suggestedSkillName: pickedNode.patternName || pickedNode.lessonName || q.suggestedSkillName,
                curriculumNode: pickedNode
              })
            );
            toast.success(
              `Đã gắn Câu ${nodePickerState.question.questionNumber} vào "${pickedNode.chapterName || pickedNode.lessonName}"!`
            );
          }
          setNodePickerState(null);
        }}
        onClearNode={
          nodePickerState?.mode === 'question'
            ? () => {
                if (!nodePickerState?.question) return;
                handleUpdateQuestion(
                  nodePickerState.question.localId,
                  nodePickerState.parentPassageLocalId,
                  (q) => ({ ...q, curriculumNode: null })
                );
                toast.info(`Đã gỡ liên kết Node của Câu ${nodePickerState.question.questionNumber}.`);
                setNodePickerState(null);
              }
            : null
        }
        onClose={() => setNodePickerState(null)}
      />

      {/* In-App Confirmation Dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[65] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDialog(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E7E5DF] shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {confirmDialog.confirmLabel || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen 838-Item Word/Excel & 3D MathLab Studio Editor Bridge */}
      {fullStudioTarget?.question && currentExam && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <CurriculumStudioEditor
            mode="exam"
            pattern={{
              patternId: `EXAM_Q${fullStudioTarget.question.questionNumber}`,
              name: `Câu ${fullStudioTarget.question.questionNumber} · ${
                fullStudioTarget.question.suggestedSkillName || formatSubjectLabel(currentExam.subjectCode)
              }`,
              theoryRecap: fullStudioTarget.question.content,
              solutionMethod: fullStudioTarget.question.explanation,
              level: `L${fullStudioTarget.question.difficultyLevel || 2}`,
              sampleQuestion: {
                questionId: fullStudioTarget.question.questionId,
                difficultyLevel: fullStudioTarget.question.difficultyLevel || 2,
                content: fullStudioTarget.question.content,
                options: [
                  `A. ${fullStudioTarget.question.options?.A || ''}`,
                  `B. ${fullStudioTarget.question.options?.B || ''}`,
                  `C. ${fullStudioTarget.question.options?.C || ''}`,
                  `D. ${fullStudioTarget.question.options?.D || ''}`
                ],
                correct: Math.max(0, ['A', 'B', 'C', 'D'].indexOf(fullStudioTarget.question.correctOption || 'A')),
                explanation: fullStudioTarget.question.explanation
              }
            }}
            domain={{
              name: formatSubjectLabel(currentExam.subjectCode),
              code: currentExam.subjectCode || 'MATH'
            }}
            chapter={{ name: currentExam.title || 'Đề thi thực tế' }}
            lesson={{ name: `Câu ${fullStudioTarget.question.questionNumber}` }}
            onClose={() => setFullStudioTarget(null)}
            onSaveSuccess={(updated) => {
              if (updated) {
                const sq = updated.sampleQuestion;
                const bloomFromLevel = (() => {
                  const m = String(updated.level || '').match(/L([1-6])/i);
                  return m ? Number(m[1]) : null;
                })();

                handleUpdateQuestion(
                  fullStudioTarget.question.localId,
                  fullStudioTarget.parentPassageLocalId,
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
              }
              setFullStudioTarget(null);
            }}
          />
        </div>
      )}
    </>
  );
}

