import React, { useState, useRef } from 'react';
import MathText from './MathText';

const SPECIAL_ANGLES = [
  { deg: 0, rad: '0', cos: '1', sin: '0', tan: '0' },
  { deg: 30, rad: '\\frac{\\pi}{6}', cos: '\\frac{\\sqrt{3}}{2}', sin: '\\frac{1}{2}', tan: '\\frac{\\sqrt{3}}{3}' },
  { deg: 45, rad: '\\frac{\\pi}{4}', cos: '\\frac{\\sqrt{2}}{2}', sin: '\\frac{\\sqrt{2}}{2}', tan: '1' },
  { deg: 60, rad: '\\frac{\\pi}{3}', cos: '\\frac{1}{2}', sin: '\\frac{\\sqrt{3}}{2}', tan: '\\sqrt{3}' },
  { deg: 90, rad: '\\frac{\\pi}{2}', cos: '0', sin: '1', tan: '\\text{KXĐ}' },
  { deg: 120, rad: '\\frac{2\\pi}{3}', cos: '-\\frac{1}{2}', sin: '\\frac{\\sqrt{3}}{2}', tan: '-\\sqrt{3}' },
  { deg: 135, rad: '\\frac{3\\pi}{4}', cos: '-\\frac{\\sqrt{2}}{2}', sin: '\\frac{\\sqrt{2}}{2}', tan: '-1' },
  { deg: 150, rad: '\\frac{5\\pi}{6}', cos: '-\\frac{\\sqrt{3}}{2}', sin: '\\frac{1}{2}', tan: '-\\frac{\\sqrt{3}}{3}' },
  { deg: 180, rad: '\\pi', cos: '-1', sin: '0', tan: '0' },
  { deg: 210, rad: '\\frac{7\\pi}{6}', cos: '-\\frac{\\sqrt{3}}{2}', sin: '-\\frac{1}{2}', tan: '\\frac{\\sqrt{3}}{3}' },
  { deg: 225, rad: '\\frac{5\\pi}{4}', cos: '-\\frac{\\sqrt{2}}{2}', sin: '-\\frac{\\sqrt{2}}{2}', tan: '1' },
  { deg: 240, rad: '\\frac{4\\pi}{3}', cos: '-\\frac{1}{2}', sin: '-\\frac{\\sqrt{3}}{2}', tan: '\\sqrt{3}' },
  { deg: 270, rad: '\\frac{3\\pi}{2}', cos: '0', sin: '-1', tan: '\\text{KXĐ}' },
  { deg: 300, rad: '\\frac{5\\pi}{3}', cos: '\\frac{1}{2}', sin: '-\\frac{\\sqrt{3}}{2}', tan: '-\\sqrt{3}' },
  { deg: 315, rad: '\\frac{7\\pi}{4}', cos: '\\frac{\\sqrt{2}}{2}', sin: '-\\frac{\\sqrt{2}}{2}', tan: '-1' },
  { deg: 330, rad: '\\frac{11\\pi}{6}', cos: '\\frac{\\sqrt{3}}{2}', sin: '-\\frac{1}{2}', tan: '-\\frac{\\sqrt{3}}{3}' }
];

export default function UnitCircleSimulator() {
  const [angleDeg, setAngleDeg] = useState(60);
  const [physicsMode, setPhysicsMode] = useState(false);
  const [eqMode, setEqMode] = useState('none'); // 'none' | 'sin' | 'cos'
  const [eqValue, setEqValue] = useState(0.5);
  const svgRef = useRef(null);
  const draggingRef = useRef(false);

  const normalizedDeg = ((angleDeg % 360) + 360) % 360;
  const rad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const tanUndef = Math.abs(cosVal) < 1e-6;
  const tanVal = tanUndef ? null : sinVal / cosVal;

  const exactMatch = SPECIAL_ANGLES.find((a) => Math.abs(a.deg - normalizedDeg) < 0.6);

  // SVG geometry
  const cx = 170;
  const cy = 170;
  const R = 115;
  const px = cx + R * cosVal;
  const py = cy - R * sinVal;

  const updateAngleFromPointer = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 340 - cx;
    const y = cy - ((clientY - rect.top) / rect.height) * 340;
    let deg = Math.round((Math.atan2(y, x) * 180) / Math.PI);
    if (deg < 0) deg += 360;
    // Snap softly within 3 degrees of special angles
    const snapped = SPECIAL_ANGLES.find((a) => Math.abs(a.deg - deg) <= 3);
    setAngleDeg(snapped ? snapped.deg : deg);
  };

  // Equation roots for sin(x) = m or cos(x) = m
  const clampedM = Math.max(-1, Math.min(1, Number(eqValue) || 0));
  const eqPoints = [];
  if (eqMode === 'sin' && Math.abs(clampedM) <= 1) {
    const a1 = Math.asin(clampedM);
    const a2 = Math.PI - a1;
    eqPoints.push(
      { rad: a1, deg: Math.round((a1 * 180) / Math.PI), x: cx + R * Math.cos(a1), y: cy - R * Math.sin(a1) },
      { rad: a2, deg: Math.round((a2 * 180) / Math.PI), x: cx + R * Math.cos(a2), y: cy - R * Math.sin(a2) }
    );
  } else if (eqMode === 'cos' && Math.abs(clampedM) <= 1) {
    const a1 = Math.acos(clampedM);
    const a2 = -a1;
    eqPoints.push(
      { rad: a1, deg: Math.round((a1 * 180) / Math.PI), x: cx + R * Math.cos(a1), y: cy - R * Math.sin(a1) },
      { rad: a2, deg: Math.round((a2 * 180) / Math.PI), x: cx + R * Math.cos(a2), y: cy - R * Math.sin(a2) }
    );
  }

  // Arc path for angle indicator
  const arcR = 32;
  const arcEndX = cx + arcR * Math.cos((normalizedDeg * Math.PI) / 180);
  const arcEndY = cy - arcR * Math.sin((normalizedDeg * Math.PI) / 180);
  const largeArc = normalizedDeg > 180 ? 1 : 0;

  return (
    <div className="space-y-4">
      {/* Mode toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPhysicsMode((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              physicsMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {physicsMode ? 'Chế độ Vật lý: Pha dao động x = A·cos(φ)' : 'Bật chế độ Pha Dao Động (Vật lý)'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Giải PT:</span>
          {[
            { id: 'none', label: 'Tắt' },
            { id: 'sin', label: 'sin α = m' },
            { id: 'cos', label: 'cos α = m' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setEqMode(m.id)}
              className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                eqMode === m.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: SVG Interactive Circle + Live Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-3 flex flex-col items-center">
          <svg
            ref={svgRef}
            viewBox="0 0 340 340"
            className="w-full max-w-[330px] h-auto select-none touch-none cursor-crosshair"
            onPointerDown={(e) => {
              draggingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              updateAngleFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!draggingRef.current) return;
              updateAngleFromPointer(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
          >
            {/* Quadrant shading for Physics mode */}
            {physicsMode && (
              <>
                <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="#fef2f2" opacity="0.6" />
                <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 0 ${cx + R} ${cy} Z`} fill="#ecfdf5" opacity="0.6" />
                <text x={cx} y={cy - R - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">
                  Chiều âm (v &lt; 0) ←
                </text>
                <text x={cx} y={cy + R + 18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#059669">
                  → Chiều dương (v &gt; 0)
                </text>
              </>
            )}

            {/* Axes */}
            <line x1="20" y1={cy} x2="320" y2={cy} stroke="#94a3b8" strokeWidth="1.2" />
            <line x1={cx} y1="320" x2={cx} y2="20" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="310" y={cy - 8} fontSize="11" fontWeight="bold" fill="#2563eb">
              {physicsMode ? '+A' : 'cos'}
            </text>
            <text x="22" y={cy - 8} fontSize="11" fontWeight="bold" fill="#64748b">
              {physicsMode ? '-A' : '-1'}
            </text>
            <text x={cx + 8} y="28" fontSize="11" fontWeight="bold" fill="#e11d48">
              {physicsMode ? 'v' : 'sin'}
            </text>

            {/* Unit Circle */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth="2" />

            {/* Special angle tick dots */}
            {SPECIAL_ANGLES.map((a) => {
              const rA = (a.deg * Math.PI) / 180;
              return (
                <circle
                  key={a.deg}
                  cx={cx + R * Math.cos(rA)}
                  cy={cy - R * Math.sin(rA)}
                  r="2.2"
                  fill="#94a3b8"
                />
              );
            })}

            {/* Equation reference line & root markers */}
            {eqMode === 'sin' && (
              <line
                x1="28"
                y1={cy - R * clampedM}
                x2="312"
                y2={cy - R * clampedM}
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
            )}
            {eqMode === 'cos' && (
              <line
                x1={cx + R * clampedM}
                y1="28"
                x2={cx + R * clampedM}
                y2="312"
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
            )}
            {eqPoints.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                <text x={pt.x + 8} y={pt.y - 6} fontSize="10" fontWeight="bold" fill="#b45309">
                  α{i + 1}={pt.deg}°
                </text>
              </g>
            ))}

            {/* Angle Arc */}
            {normalizedDeg > 0 && normalizedDeg < 360 && (
              <path
                d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
              />
            )}

            {/* Projections */}
            <line x1={px} y1={py} x2={px} y2={cy} stroke="#e11d48" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1={px} y1={py} x2={cx} y2={py} stroke="#2563eb" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#2563eb" strokeWidth="3" />
            <line x1={cx} y1={cy} x2={cx} y2={py} stroke="#e11d48" strokeWidth="3" />

            {/* Radius vector OM */}
            <line x1={cx} y1={cy} x2={px} y2={py} stroke="#4f46e5" strokeWidth="2.4" />
            <circle cx={cx} cy={cy} r="3.5" fill="#0f172a" />
            <circle cx={px} cy={py} r="7" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            <text x={px + 10} y={py - 8} fontSize="11" fontWeight="bold" fill="#312e81">
              M ({normalizedDeg}°)
            </text>
          </svg>
          <p className="text-[11px] text-slate-400 mt-1">
            Kéo điểm M trực tiếp trên vòng tròn để đo góc & tọa độ
          </p>
        </div>

        {/* Right Controls & Readout */}
        <div className="md:col-span-6 space-y-3">
          {/* Angle Slider */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Góc lượng giác α (hoặc pha φ)</span>
              <span className="font-extrabold text-indigo-700">
                {angleDeg}° {exactMatch ? <MathText text={`($${exactMatch.rad}$)`} /> : `(${(rad / Math.PI).toFixed(2)}π)`}
              </span>
            </div>
            <input
              type="range"
              min="-360"
              max="360"
              step="1"
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            {/* Quick Special Angle Buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 330].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setAngleDeg(d)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${
                    normalizedDeg === d
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {d}°
                </button>
              ))}
            </div>
          </div>

          {/* Exact Values Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-center">
              <div className="text-[11px] font-bold text-blue-700">cos α</div>
              <div className="text-sm font-black text-blue-950 mt-1">
                {exactMatch ? <MathText text={`$${exactMatch.cos}$`} /> : cosVal.toFixed(3)}
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">{cosVal.toFixed(3)}</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center">
              <div className="text-[11px] font-bold text-rose-700">sin α</div>
              <div className="text-sm font-black text-rose-950 mt-1">
                {exactMatch ? <MathText text={`$${exactMatch.sin}$`} /> : sinVal.toFixed(3)}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">{sinVal.toFixed(3)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="text-[11px] font-bold text-slate-600">tan α</div>
              <div className="text-sm font-black text-slate-900 mt-1">
                {exactMatch ? <MathText text={`$${exactMatch.tan}$`} /> : tanUndef ? 'KXĐ' : tanVal.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{tanUndef ? '∞' : tanVal.toFixed(3)}</div>
            </div>
          </div>

          {/* Physics Oscillation Readout */}
          {physicsMode && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs space-y-1 text-emerald-950">
              <div className="font-bold">Trạng thái dao động điều hòa (x = A·cos φ):</div>
              <div>
                • Li độ: <strong>x = {cosVal.toFixed(3)}·A</strong>
              </div>
              <div>
                • Chiều chuyển động:{' '}
                <strong>
                  {Math.abs(sinVal) < 0.01 ? 'Đang ở biên (v = 0)' : sinVal > 0 ? 'Đi theo chiều ÂM (v < 0)' : 'Đi theo chiều DƯƠNG (v > 0)'}
                </strong>
              </div>
              <div className="text-[11px] text-emerald-800">
                Công thức thời gian quét góc: Δt = Δφ / ω = (Δφ° / 360°) · T
              </div>
            </div>
          )}

          {/* Equation Solver Controls */}
          {eqMode !== 'none' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950">
                  Giải phương trình: {eqMode === 'sin' ? 'sin α = m' : 'cos α = m'}
                </span>
                <span className="font-black text-amber-800">m = {clampedM.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={clampedM}
                onChange={(e) => setEqValue(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="text-amber-900 font-semibold">
                {eqMode === 'sin'
                  ? `Họ nghiệm: α₁ ≈ ${eqPoints[0]?.deg}° + k·360°  hoặc  α₂ ≈ ${eqPoints[1]?.deg}° + k·360°`
                  : `Họ nghiệm: α ≈ ±${eqPoints[0]?.deg}° + k·360°`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
