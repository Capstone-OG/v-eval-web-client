import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import { useToast } from '../../context/ToastContext';
import { getStoredTextbookContext, saveStoredTextbookContext } from './textbookStateBridge';
import aiService from '../../services/aiService';

export default function TextbookStudioView({ onBack, onNavigateTab }) {
  const { toast } = useToast();
  const initCtx = getStoredTextbookContext();

  const [activeContext, setActiveContext] = useState(initCtx);
  const [activePattern, setActivePattern] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  useEffect(() => {
    const ctx = getStoredTextbookContext();
    setActiveContext(ctx);

    const loadContextData = async () => {
      if (ctx.selectedSourceId) {
        try {
          const res = await aiService.getTextbookChunks(ctx.selectedSourceId);
          const chunks = res?.chunks || [];
          const combinedTheory = chunks.map(c => c.text).slice(0, 10).join('\n\n');

          setActivePattern({
            patternId: `SGK_${ctx.subjectCode || 'PHYS'}_G${ctx.grade || 10}_P${(ctx.selectedPatternIdx || 0) + 1}`,
            name: `Dạng ${(ctx.selectedPatternIdx || 0) + 1}: Chuyên đề chuẩn SGK ${ctx.subjectName || 'Vật lí'}`,
            theoryRecap: combinedTheory || 'Lý thuyết trích xuất từ sách giáo khoa chuẩn GDPT 2018.',
            solutionMethod: 'Phương pháp giải từng bước chuẩn sư phạm.',
            level: 'L2'
          });

          setActiveLesson({
            title: `Bài ${(ctx.selectedLessonIdx || 0) + 1}: Bài học bóc tách từ SGK`
          });

          setActiveChapter({
            title: `Chương ${(ctx.selectedChapterIdx || 0) + 1}: Kiến thức trọng tâm`
          });
        } catch (err) {
          console.warn('Lỗi lấy chunks cho Studio:', err);
        }
      }
    };
    loadContextData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <header className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          )}
          <div>
            <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Trang 3: Studio Biên Soạn Nội Dung Sách Giáo Khoa (SGK)</span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Không gian biên soạn sư phạm chuyên sâu: Lý thuyết KaTeX, Phương pháp giải, Bẫy ĐGNL & Câu hỏi rèn luyện
            </p>
          </div>
        </div>

        {/* Quick Tabs Navigation Pills */}
        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                type="button"
                onClick={() => onNavigateTab('textbook-standard')}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>← Sang SGK Chuẩn</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('textbook-ingest')}
                className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>← Sang Nạp Tài Liệu</span>
              </button>
            </>
          )}

          <div className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeContext.subjectName || 'Vật lí'} Lớp {activeContext.grade || 10}</span>
          </div>
        </div>
      </header>

      {/* 2. FULL CURRICULUM STUDIO EDITOR EMBEDDED */}
      <div className="flex-1 min-h-[85vh]">
        <CurriculumStudioEditor
          mode="textbook"
          pattern={
            activePattern || {
              patternId: `SGK_${activeContext.subjectCode || 'PHYS'}_G${activeContext.grade || 10}`,
              name: 'Biên soạn nội dung SGK chuyên sâu',
              theoryRecap: 'Lý thuyết bóc tách từ SGK chuẩn GDPT 2018.',
              solutionMethod: 'Phương pháp giải từng bước kèm KaTeX.',
              level: 'L2'
            }
          }
          domain={{
            name: activeContext.subjectName || 'Vật lí',
            code: activeContext.subjectCode || 'PHYS'
          }}
          chapter={{
            name: activeChapter?.title || 'Chương SGK'
          }}
          lesson={{
            name: activeLesson?.title || 'Bài SGK'
          }}
          onClose={() => {
            if (onNavigateTab) onNavigateTab('textbook-standard');
            else if (onBack) onBack();
          }}
          onSaveSuccess={() => {
            toast.success('Đã lưu nội dung biên soạn SGK thành công!');
          }}
        />
      </div>
    </div>
  );
}
