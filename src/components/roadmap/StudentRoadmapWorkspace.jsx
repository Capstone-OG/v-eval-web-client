import { useState } from 'react';
import { Compass, BookOpen } from 'lucide-react';
import ConnectedRoadmapPage from './ConnectedRoadmapPage';

export default function StudentRoadmapWorkspace({
  curriculum,
  onNavigateDiagnostic,
  onNavigateDashboard,
  onNavigateTuition,
  onOpenAiTutorWithContext
}) {
  // Mặc định mở thẳng Lộ trình cá nhân hóa THẬT từ Backend & Chu trình PLAR 4 pha
  const [view, setView] = useState('connected');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('connected')}
            aria-pressed={view === 'connected'}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              view === 'connected'
                ? 'bg-gradient-to-r from-[#1E3A5F] to-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Lộ Trình Cá Nhân &amp; Chu Trình P-L-A-R</span>
          </button>
          <button
            type="button"
            onClick={() => setView('curriculum')}
            aria-pressed={view === 'curriculum'}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              view === 'curriculum'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho Chương Trình &amp; Học Liệu SGK 9 Môn</span>
          </button>
        </div>
        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          Đồng bộ 100% dữ liệu chuẩn GDPT 2018 • BKT + ZPD + PLAR
        </span>
      </div>

      {view === 'connected' ? (
        <ConnectedRoadmapPage
          onNavigateDiagnostic={onNavigateDiagnostic}
          onNavigateDashboard={onNavigateDashboard}
          onNavigateTuition={onNavigateTuition}
          onOpenAiTutorWithContext={onOpenAiTutorWithContext}
        />
      ) : (
        curriculum
      )}
    </div>
  );
}
