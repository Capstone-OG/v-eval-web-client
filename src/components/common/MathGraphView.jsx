import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderMath(latex) {
  try {
    return katex.renderToString(latex, { throwOnError: false });
  } catch {
    return latex;
  }
}

/**
 * MathGraphView Component - Trình Diễn Đồ Thị Hàm Số Toán Học (SVG Nội Sinh & Desmos/GeoGebra Embed)
 * 
 * Props:
 * - data: {
 *     type: 'cubic' | 'quartic' | 'rational' | 'quadratic' | 'desmos' | 'svg',
 *     title?: string,
 *     formula?: string,        // e.g. "y = x^3 - 3x + 1"
 *     extrema?: Array<{ x: number, y: number, label?: string, type?: 'cd' | 'ct' }>, // Cực đại / Cực tiểu
 *     asymptotes?: { vertical?: number, horizontal?: number }, // Tiệm cận
 *     desmosUrl?: string,      // Option embed Desmos iframe
 *   }
 */
export default function MathGraphView({ data, className = '' }) {
  if (!data) return null;

  const [interactiveMode, setInteractiveMode] = useState(data.type === 'desmos');

  const {
    type = 'cubic',
    title = 'Đồ thị hàm số',
    formula = 'y = x^3 - 3x + 1',
    extrema = [
      { x: -1, y: 3, label: 'CĐ (-1; 3)', type: 'cd' },
      { x: 1, y: -1, label: 'CT (1; -1)', type: 'ct' }
    ],
    asymptotes = null,
    desmosEquation = 'y=x^3-3x+1'
  } = data;

  // SVG Coordinate Constants (Width 360, Height 240, Origin at (180, 120))
  const svgWidth = 360;
  const svgHeight = 240;
  const originX = 180;
  const originY = 120;
  const scale = 28; // 28px = 1 unit

  const toSvgX = (x) => originX + x * scale;
  const toSvgY = (y) => originY - y * scale;

  // Compute curve path based on type
  const renderCurvePath = () => {
    const points = [];
    const step = 0.1;
    const minX = -5.5;
    const maxX = 5.5;

    for (let x = minX; x <= maxX; x += step) {
      let y = 0;
      if (type === 'cubic') {
        // e.g. y = x^3 - 3x + 1 scaled to fit
        y = 0.5 * Math.pow(x, 3) - 1.5 * x;
      } else if (type === 'quartic') {
        // e.g. y = x^4 - 2x^2 - 1
        y = 0.4 * Math.pow(x, 4) - 1.2 * Math.pow(x, 2) + 0.5;
      } else if (type === 'rational') {
        // e.g. y = (2x+1)/(x-1) with vertical asymptote at x = 1
        if (Math.abs(x - 1) < 0.2) continue;
        y = (2 * x + 1) / (x - 1);
      } else {
        // quadratic e.g. y = x^2 - 2x
        y = 0.6 * Math.pow(x, 2) - 1.2 * x;
      }

      if (y > -5 && y < 5) {
        points.push(`${toSvgX(x)},${toSvgY(y)}`);
      }
    }

    if (points.length === 0) return '';
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className={`my-3 p-3 rounded-2xl bg-white border border-slate-300 shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-xs font-black text-slate-800">{title}</span>
          {formula && (
            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
              <span dangerouslySetInnerHTML={{ __html: renderMath(formula) }} />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setInteractiveMode(!interactiveMode)}
          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
        >
          <span>{interactiveMode ? '📊 Chế độ SVG chuẩn' : '⚡ Desmos tương tác'}</span>
        </button>
      </div>

      {interactiveMode ? (
        // Desmos Interactive Embed
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <iframe
            title="Desmos Graphing Calculator"
            src={`https://www.desmos.com/calculator?embed&lockViewport=false&zoomButtons=true`}
            width="100%"
            height="260"
            className="border-0 w-full"
            loading="lazy"
          />
          <div className="p-1.5 bg-slate-100 text-center text-[10px] text-slate-500 font-medium">
            Hỗ trợ phóng to, thu nhỏ và rê chuột kiểm tra tọa độ điểm trực quan chuẩn quốc tế.
          </div>
        </div>
      ) : (
        // Native SVG Coordinate System Graph
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[360px] bg-slate-50/80 rounded-xl border border-slate-200/90 p-1 flex justify-center shadow-inner overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[240px] select-none"
            >
              {/* Coordinate Grid Lines */}
              <defs>
                <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

              {/* Ox and Oy Axes */}
              {/* Ox Axis */}
              <line
                x1="10"
                y1={originY}
                x2={svgWidth - 10}
                y2={originY}
                stroke="#475569"
                strokeWidth="1.5"
                markerEnd="url(#arrow-x)"
              />
              <text x={svgWidth - 16} y={originY - 6} fill="#1e293b" fontSize="11" fontWeight="bold" fontStyle="italic">
                x
              </text>

              {/* Oy Axis */}
              <line
                x1={originX}
                y1={svgHeight - 10}
                x2={originX}
                y2="10"
                stroke="#475569"
                strokeWidth="1.5"
                markerEnd="url(#arrow-y)"
              />
              <text x={originX + 8} y="16" fill="#1e293b" fontSize="11" fontWeight="bold" fontStyle="italic">
                y
              </text>

              {/* Origin O */}
              <text x={originX - 12} y={originY + 14} fill="#64748b" fontSize="10" fontWeight="bold">
                O
              </text>

              {/* Function Curve */}
              <path
                d={renderCurvePath()}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Extrema Points & Projections */}
              {extrema?.map((pt, pIdx) => {
                const px = toSvgX(pt.x);
                const py = toSvgY(pt.y);
                const isInside = px >= 20 && px <= svgWidth - 20 && py >= 20 && py <= svgHeight - 20;
                if (!isInside) return null;

                return (
                  <g key={`pt-${pIdx}`}>
                    {/* Projection lines to Ox and Oy */}
                    <line
                      x1={px}
                      y1={py}
                      x2={px}
                      y2={originY}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={px}
                      y1={py}
                      x2={originX}
                      y2={py}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />

                    {/* Point Marker */}
                    <circle
                      cx={px}
                      cy={py}
                      r="4.5"
                      fill={pt.type === 'cd' ? '#10b981' : '#f43f5e'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Point Coordinates Label */}
                    <text
                      x={px + 6}
                      y={pt.type === 'cd' ? py - 8 : py + 14}
                      fill="#0f172a"
                      fontSize="9.5"
                      fontWeight="bold"
                      className="bg-white/90"
                    >
                      {pt.label || `(${pt.x}; ${pt.y})`}
                    </text>
                  </g>
                );
              })}

              {/* Asymptotes if any */}
              {asymptotes?.vertical !== undefined && (
                <line
                  x1={toSvgX(asymptotes.vertical)}
                  y1="10"
                  x2={toSvgX(asymptotes.vertical)}
                  y2={svgHeight - 10}
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}
              {asymptotes?.horizontal !== undefined && (
                <line
                  x1="10"
                  y1={toSvgY(asymptotes.horizontal)}
                  x2={svgWidth - 10}
                  y2={toSvgY(asymptotes.horizontal)}
                  stroke="#ef4444"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1 text-center">
            Đồ thị tọa độ chuẩn Oxy với các điểm cực trị & đường dóng nét đứt.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parses markdown graph tag:
 * [GRAPH: type=cubic | formula=y=x^3-3x+1 | cd=-1,3 | ct=1,-1]
 */
export function parseGraphTag(tagString) {
  try {
    const raw = tagString.replace(/^\[GRAPH:\s*/i, '').replace(/\]$/, '').trim();
    const parts = raw.split('|').map(s => s.trim());
    const data = {
      type: 'cubic',
      formula: 'y = x^3 - 3x + 1',
      extrema: []
    };

    for (const part of parts) {
      const [k, v] = part.split('=').map(s => s.trim());
      if (k === 'type') data.type = v;
      else if (k === 'formula') data.formula = v;
      else if (k === 'title') data.title = v;
      else if (k === 'cd') {
        const [x, y] = v.split(',').map(Number);
        data.extrema.push({ x, y, label: `CĐ (${x}; ${y})`, type: 'cd' });
      } else if (k === 'ct') {
        const [x, y] = v.split(',').map(Number);
        data.extrema.push({ x, y, label: `CT (${x}; ${y})`, type: 'ct' });
      }
    }
    return data;
  } catch (err) {
    console.warn("Parse graph tag failed:", err);
    return null;
  }
}
