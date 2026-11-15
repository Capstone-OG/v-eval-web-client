import { useState } from 'react';
import ConnectedRoadmapPage from './ConnectedRoadmapPage';

export default function StudentRoadmapWorkspace({ curriculum, onNavigateDiagnostic, onNavigateDashboard }) {
  const [view, setView] = useState('curriculum');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        <button
          type="button"
          onClick={() => setView('curriculum')}
          aria-pressed={view === 'curriculum'}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${view === 'curriculum' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Chương trình & lộ trình cá nhân
        </button>
        <button
          type="button"
          onClick={() => setView('connected')}
          aria-pressed={view === 'connected'}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${view === 'connected' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Roadmap backend, video & quiz
        </button>
      </div>
      {view === 'curriculum'
        ? curriculum
        : <ConnectedRoadmapPage onNavigateDiagnostic={onNavigateDiagnostic} onNavigateDashboard={onNavigateDashboard} />}
    </div>
  );
}
