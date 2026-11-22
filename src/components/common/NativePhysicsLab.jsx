import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { PHET_SIMULATIONS } from '../../data/referenceFormulasData';

export default function NativePhysicsLab() {
  const [phetFilter, setPhetFilter] = useState('ALL');
  const [selectedPhetId, setSelectedPhetId] = useState(PHET_SIMULATIONS[0].id);

  const visiblePhet = useMemo(
    () => (phetFilter === 'ALL' ? PHET_SIMULATIONS : PHET_SIMULATIONS.filter((s) => s.subject === phetFilter)),
    [phetFilter]
  );
  const activePhet = PHET_SIMULATIONS.find((s) => s.id === selectedPhetId) || PHET_SIMULATIONS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Vật lý', 'Hóa học'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setPhetFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                phetFilter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {f === 'ALL' ? 'Tất cả (10 mô phỏng)' : f}
            </button>
          ))}
        </div>

        <a
          href={activePhet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <span>Mở toàn màn hình</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visiblePhet.map((sim) => {
          const active = sim.id === activePhet.id;
          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => setSelectedPhetId(sim.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span
                className={`mr-1.5 text-[10px] font-bold ${
                  active ? 'text-indigo-300' : sim.subject === 'Vật lý' ? 'text-sky-600' : 'text-emerald-600'
                }`}
              >
                [{sim.subject === 'Vật lý' ? 'Lý' : 'Hóa'}]
              </span>
              {sim.title}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <span className="font-bold text-slate-900">{activePhet.title}</span>
            <span className="hidden sm:inline text-slate-400"> · {activePhet.desc}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 shrink-0">PhET Colorado</span>
        </div>
        <iframe
          key={activePhet.id}
          src={activePhet.url}
          title={activePhet.title}
          className="w-full h-[500px] border-0 bg-slate-100"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
