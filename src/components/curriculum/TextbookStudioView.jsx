import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UploadCloud
} from 'lucide-react';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import {
  getStoredTextbookContext,
  getSavedTextbookData,
  GDPT_PRESETS,
  getChunksForLesson,
  buildTheoryFromChunks,
  buildMethodFromChunks,
  isGenericPlaceholder
} from './textbookStateBridge';
import aiService from '../../services/aiService';

export default function TextbookStudioView({ onBack, onNavigateTab, role = 'director' }) {
  const initCtx = getStoredTextbookContext();

  const [activeContext, setActiveContext] = useState(initCtx);
  const [activePattern, setActivePattern] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const ctx = getStoredTextbookContext();
    setActiveContext(ctx);

    const hydrateFromContextAndStorage = async () => {
      const savedData =
        getSavedTextbookData(ctx.selectedSourceId, ctx.fileName) ||
        getSavedTextbookData();

      const subCode = (
        savedData?.skeleton?.subjectCode ||
        ctx.subjectCode ||
        'PHYS'
      ).toUpperCase();
      const subName =
        savedData?.skeleton?.subjectName ||
        ctx.subjectName ||
        'Sách giáo khoa';
      const grade = Number(savedData?.skeleton?.grade || ctx.grade) || 10;

      let chunks = [];
      if (ctx.selectedSourceId) {
        try {
          const res = await aiService.getTextbookChunks(ctx.selectedSourceId);
          chunks = res?.chunks || [];
        } catch (err) {
          console.warn('Không tải được chunks trực tiếp cho Studio, dùng dữ liệu đã lưu:', err);
        }
      }

      if (!isMounted) return;

      const preset = GDPT_PRESETS[`${subCode}_${grade}`] || GDPT_PRESETS['PHYS_10'];
      const chapters =
        (savedData?.skeleton?.chapters?.length > 0 && savedData.skeleton.chapters) ||
        (savedData?.chapters?.length > 0 && savedData.chapters) ||
        preset?.chapters ||
        [];

      const cIdx = Math.max(0, Math.min(chapters.length - 1, Number(ctx.selectedChapterIdx || 0)));
      const chap = chapters[cIdx] || {
        title: ctx.activeChapterTitle || `Chương ${(Number(ctx.selectedChapterIdx) || 0) + 1}`
      };

      const lessons = chap?.lessons || [];
      const lIdx = Math.max(0, Math.min(lessons.length - 1, Number(ctx.selectedLessonIdx || 0)));
      const les = lessons[lIdx] || {
        title: ctx.activeLessonTitle || `Bài ${(Number(ctx.selectedLessonIdx) || 0) + 1}`,
        patterns: []
      };

      const patterns = les?.patterns || [];
      const pIdx = Math.max(0, Math.min(patterns.length - 1, Number(ctx.selectedPatternIdx || 0)));
      const pat = patterns[pIdx] || {
        name:
          ctx.activePatternName ||
          `Dạng ${(Number(ctx.selectedPatternIdx) || 0) + 1} · ${les?.title || subName}`,
        bloomLevel: 2,
        exercises: []
      };

      const lessonChunks = chunks.length > 0 ? getChunksForLesson(les, chunks, subCode) : [];
      const chunkTheory =
        lessonChunks.length > 0
          ? buildTheoryFromChunks(lessonChunks, les?.title || '', subCode)
          : chunks.length > 0
          ? buildTheoryFromChunks(chunks.slice(0, 12), les?.title || '', subCode)
          : '';

      const resolvedTheory =
        (pat?.theoryRecap && !isGenericPlaceholder(pat.theoryRecap) ? pat.theoryRecap : '') ||
        (les?.isEdited && les?.theory && !isGenericPlaceholder(les.theory) ? les.theory : '') ||
        (ctx.activeTheoryPreview && !isGenericPlaceholder(ctx.activeTheoryPreview) ? ctx.activeTheoryPreview : '') ||
        (!isGenericPlaceholder(chunkTheory) && chunkTheory ? chunkTheory : '') ||
        (!isGenericPlaceholder(les?.theory) && les?.theory ? les.theory : '');

      const explicitMethod =
        (pat?.solutionMethod && !isGenericPlaceholder(pat.solutionMethod)
          ? pat.solutionMethod.trim()
          : '') ||
        (pat?.method && !isGenericPlaceholder(pat.method) ? pat.method.trim() : '');

      const isDetailedExplicit =
        explicitMethod &&
        (pat?.isEdited || explicitMethod.includes('\n') || explicitMethod.length >= 140);

      const synthesizedMethod =
        !isDetailedExplicit && lessonChunks.length > 0
          ? buildMethodFromChunks(lessonChunks, les, pat, subCode)
          : '';

      const resolvedMethod =
        (isDetailedExplicit ? explicitMethod : '') ||
        (ctx.activeMethodPreview && !isGenericPlaceholder(ctx.activeMethodPreview)
          ? ctx.activeMethodPreview
          : '') ||
        (!isGenericPlaceholder(synthesizedMethod) && synthesizedMethod ? synthesizedMethod : '') ||
        explicitMethod ||
        '';

      const firstEx = Array.isArray(pat?.exercises) && pat.exercises.length > 0 ? pat.exercises[0] : null;
      const sampleQuestion = firstEx
        ? {
            questionId: firstEx.id || null,
            difficultyLevel: Number(firstEx.difficultyLevel || firstEx.bloomLevel || pat?.bloomLevel) || 2,
            content: firstEx.contentLatex || firstEx.stem || firstEx.content || '',
            options: [
              `A. ${firstEx.optionA || firstEx.options?.[0] || ''}`,
              `B. ${firstEx.optionB || firstEx.options?.[1] || ''}`,
              `C. ${firstEx.optionC || firstEx.options?.[2] || ''}`,
              `D. ${firstEx.optionD || firstEx.options?.[3] || ''}`
            ],
            correct:
              typeof firstEx.correctOption === 'string'
                ? Math.max(0, ['A', 'B', 'C', 'D'].indexOf(firstEx.correctOption.toUpperCase()))
                : Number(firstEx.correctIndex || 0),
            explanation: firstEx.explanation || firstEx.solution || ''
          }
        : null;

      const bloomLvl = Number(pat?.bloomLevel) || 2;

      setActiveChapter({
        ...chap,
        name: chap?.title || chap?.name || 'Chương 1'
      });

      setActiveLesson({
        ...les,
        name: les?.title || les?.name || 'Bài 1'
      });

      setActivePattern({
        ...pat,
        patternId:
          pat?.patternId ||
          `SGK_${subCode}_G${grade}_C${cIdx + 1}_L${lIdx + 1}_P${pIdx + 1}`,
        name: pat?.name || `Dạng ${pIdx + 1} · ${les?.title || subName}`,
        theoryRecap: resolvedTheory || '',
        solutionMethod: resolvedMethod || '',
        examTraps: pat?.examTraps || '',
        casioTricks: pat?.casioTricks || '',
        level: pat?.level || `L${bloomLvl}`,
        weight: pat?.weight || '5',
        sampleQuestion,
        exercises: pat?.exercises || []
      });
    };

    hydrateFromContextAndStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  const subjectLabel = `${activeContext.subjectName || 'SGK'} · Lớp ${activeContext.grade || 10}`;

  const headerActions = (
    <div className="flex items-center gap-1.5">
      {onNavigateTab && (
        <>
          <button
            type="button"
            onClick={() => onNavigateTab('textbook-standard')}
            className="h-8 px-2.5 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-slate-700 hover:text-[#1E3A5F] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2C4C7E]" />
            <span className="hidden lg:inline">SGK Chuẩn</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('textbook-ingest')}
            className="h-8 px-2.5 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-[#EEF2F7] text-slate-700 hover:text-[#1E3A5F] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#2C4C7E]" />
            <span className="hidden lg:inline">Nạp SGK</span>
          </button>
        </>
      )}
      <span className="px-2.5 py-1 rounded-md bg-[#F4F3EE] border border-[#E7E5DF] text-slate-700 text-[11px] font-medium hidden xl:inline">
        {subjectLabel}
      </span>
    </div>
  );

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
      <div className="flex-1 min-h-0">
        <CurriculumStudioEditor
          mode="textbook"
          role={role}
          headerActions={headerActions}
          pattern={
            activePattern || {
              patternId: `SGK_${activeContext.subjectCode || 'PHYS'}_G${activeContext.grade || 10}`,
              name: activeContext.activePatternName || subjectLabel,
              theoryRecap: activeContext.activeTheoryPreview || '',
              solutionMethod: activeContext.activeMethodPreview || '',
              level: 'L2'
            }
          }
          domain={{
            name: activeContext.subjectName || 'SGK',
            code: activeContext.subjectCode || 'PHYS'
          }}
          chapter={{
            name: activeChapter?.name || activeChapter?.title || activeContext.activeChapterTitle || 'Chương 1'
          }}
          lesson={{
            name: activeLesson?.name || activeLesson?.title || activeContext.activeLessonTitle || 'Bài 1'
          }}
          onClose={() => {
            if (onNavigateTab) onNavigateTab('textbook-standard');
            else if (onBack) onBack();
          }}
          onSaveSuccess={(updatedPat) => {
            if (updatedPat) {
              setActivePattern(prev => ({
                ...(prev || {}),
                ...updatedPat
              }));
            }
          }}
        />
      </div>
    </div>
  );
}
