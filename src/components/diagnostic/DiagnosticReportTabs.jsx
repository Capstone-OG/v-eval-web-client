import { BarChart3, BookOpenCheck, Brain } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'answers', label: 'Bài làm của tôi', icon: BookOpenCheck },
  { id: 'analysis', label: 'Phân tích năng lực', icon: Brain },
];

export default function DiagnosticReportTabs({ value, onChange }) {
  return <div className="sticky top-0 z-20 rounded-2xl border border-indigo-200 bg-white/95 p-1.5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)] backdrop-blur-xl">
    <div role="tablist" aria-label="Báo cáo kiểm tra đầu vào" className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
      {tabs.map(({ id, label, icon: Icon }, index) => <button key={id} id={`report-tab-${id}`}
        type="button" role="tab" aria-selected={value === id} aria-controls={`report-panel-${id}`}
        tabIndex={value === id ? 0 : -1}
        onClick={() => onChange(id)}
        onKeyDown={(event) => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next === undefined) return;
          event.preventDefault();
          onChange(tabs[next].id);
          document.getElementById(`report-tab-${tabs[next].id}`)?.focus();
        }}
        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition-colors sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${value === id
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 ring-indigo-600'
          : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'}`}>
        <Icon className={`hidden h-4 w-4 shrink-0 min-[400px]:block ${value === id ? 'text-white' : 'text-slate-500'}`} />
        <span>{label}</span>
      </button>)}
    </div>
  </div>;
}

export function DiagnosticReportPanel({ id, active, children }) {
  if (id !== active) return null;
  return <section role="tabpanel" id={`report-panel-${id}`} aria-labelledby={`report-tab-${id}`}
    tabIndex={0} className="space-y-5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded-2xl">
    {children}
  </section>;
}
