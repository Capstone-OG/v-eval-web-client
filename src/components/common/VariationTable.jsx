import React from 'react';
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
 * VariationTable Component - Bảng Biến Thiên Chuẩn Sách Giáo Khoa GDPT 2018
 * 
 * Cấu trúc 3 dòng chuẩn mực:
 * 1. Dòng x: Liệt kê các giá trị từ -\infty, các nghiệm đạo hàm/tiệm cận đứng, đến +\infty
 * 2. Dòng y': Dấu của đạo hàm (+, -, 0, || nếu không xác định)
 * 3. Dòng y: Mũi tên tăng (↗), giảm (↘), giá trị cực đại, cực tiểu, tiệm cận
 * 
 * Props:
 * - data: {
 *     title?: string,
 *     xValues: string[],       // e.g. ['-\\infty', '-1', '1', '+\\infty']
 *     yPrimeValues: string[],  // e.g. ['+', '0', '-', '0', '+'] hoặc ['+', '||', '+']
 *     yRows?: {
 *       top?: (string | null)[],
 *       middle?: (string | null)[],
 *       bottom?: (string | null)[],
 *       arrows?: string[]      // e.g. ['up', 'down', 'up'] hoặc ['\\nearrow', '\\searrow', '\\nearrow']
 *     }
 *   }
 */
export default function VariationTable({ data, className = '' }) {
  if (!data) return null;

  const {
    title = 'Bảng biến thiên hàm số',
    xValues = ['-\\infty', '-1', '1', '+\\infty'],
    yPrime = ['+', '0', '-', '0', '+'],
    yValues = {
      values: ['-\\infty', '4', '0', '+\\infty'],
      directions: ['up', 'down', 'up'] // up: ↗, down: ↘
    }
  } = data;

  return (
    <div className={`my-3 p-3 rounded-2xl bg-white border border-slate-300 shadow-sm overflow-x-auto ${className}`}>
      {title && (
        <div className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{title}</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Chuẩn SGK</span>
        </div>
      )}

      <div className="inline-block min-w-full border-collapse">
        <table className="w-full border border-slate-400 text-xs text-center select-all">
          <tbody>
            {/* Dòng 1: Giá trị của x */}
            <tr className="border-b border-slate-300 bg-slate-50/70">
              <td className="w-16 py-2 px-3 font-bold border-r border-slate-400 text-slate-900 bg-slate-100/90 italic font-serif">
                x
              </td>
              {xValues.map((xVal, idx) => (
                <td key={`x-${idx}`} className="py-2 px-3 font-medium text-slate-800">
                  <span dangerouslySetInnerHTML={{ __html: renderMath(xVal) }} />
                </td>
              ))}
            </tr>

            {/* Dòng 2: Dấu của y' (đạo hàm) */}
            <tr className="border-b border-slate-300 bg-white">
              <td className="w-16 py-2 px-3 font-bold border-r border-slate-400 text-slate-900 bg-slate-100/90 italic font-serif">
                y'
              </td>
              {yPrime.map((sign, idx) => {
                const isDoubleLine = sign === '||' || sign === 'double';
                const isZero = sign === '0';
                return (
                  <td
                    key={`yp-${idx}`}
                    className={`py-2 px-3 font-bold ${
                      isDoubleLine ? 'text-slate-400 border-x-2 border-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {isDoubleLine ? (
                      <span className="text-slate-400 font-mono select-none">||</span>
                    ) : isZero ? (
                      <span className="text-slate-500 font-bold">0</span>
                    ) : sign === '+' ? (
                      <span className="text-emerald-600 font-black text-sm">+</span>
                    ) : (
                      <span className="text-rose-600 font-black text-sm">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Dòng 3: Chiều biến thiên của y */}
            <tr className="bg-slate-50/30">
              <td className="w-16 py-4 px-3 font-bold border-r border-slate-400 text-slate-900 bg-slate-100/90 italic font-serif align-middle">
                y
              </td>
              <td colSpan={Math.max(xValues.length, yPrime.length)} className="p-3">
                <div className="flex items-center justify-between px-4 py-2 min-h-[70px]">
                  {yValues?.steps ? (
                    yValues.steps.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`flex flex-col items-center ${st.pos === 'top' ? '-translate-y-3' : st.pos === 'bottom' ? 'translate-y-3' : ''}`}>
                          <span className="font-bold text-slate-900 text-xs" dangerouslySetInnerHTML={{ __html: renderMath(st.val) }} />
                        </div>
                        {st.arrow && (
                          <span className="text-lg text-indigo-600 font-black select-none">
                            {st.arrow === 'up' ? '↗' : '↘'}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    // Default layout for 3 or 4 points
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-900">
                      {yValues.values?.map((v, vIdx) => {
                        const isEven = vIdx % 2 === 0;
                        const hasNext = vIdx < yValues.values.length - 1;
                        const dir = yValues.directions?.[vIdx] || (isEven ? 'up' : 'down');
                        return (
                          <React.Fragment key={vIdx}>
                            <div className={`flex flex-col items-center ${dir === 'up' && hasNext ? 'translate-y-3' : '-translate-y-3'}`}>
                              <span className="font-bold text-slate-900" dangerouslySetInnerHTML={{ __html: renderMath(v) }} />
                            </div>
                            {hasNext && (
                              <div className="flex-1 px-2 flex justify-center">
                                <span className={`text-xl font-black ${dir === 'up' ? 'text-emerald-600' : 'text-rose-600'} select-none`}>
                                  {dir === 'up' ? '↗' : '↘'}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Parser for text-based variation table syntax:
 * [VARIATION_TABLE]
 * title: Bảng biến thiên hàm số bậc ba
 * x: -\infty | -1 | 1 | +\infty
 * y': + | 0 | - | 0 | +
 * y: -\infty | 4 | 0 | +\infty
 * dir: up | down | up
 * [/VARIATION_TABLE]
 */
export function parseVariationTableString(textBlock) {
  try {
    const lines = textBlock.trim().split('\n');
    let title = 'Bảng biến thiên';
    let xValues = ['-\\infty', '-1', '1', '+\\infty'];
    let yPrime = ['+', '0', '-', '0', '+'];
    let yValuesArr = ['-\\infty', '4', '0', '+\\infty'];
    let directions = ['up', 'down', 'up'];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.toLowerCase().startsWith('title:')) {
        title = line.slice(6).trim();
      } else if (line.toLowerCase().startsWith('x:')) {
        xValues = line.slice(2).split('|').map(s => s.trim());
      } else if (line.toLowerCase().startsWith("y':") || line.toLowerCase().startsWith('yprime:')) {
        const after = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
        yPrime = after.split('|').map(s => s.trim());
      } else if (line.toLowerCase().startsWith('y:')) {
        yValuesArr = line.slice(2).split('|').map(s => s.trim());
      } else if (line.toLowerCase().startsWith('dir:') || line.toLowerCase().startsWith('direction:')) {
        const after = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
        directions = after.split('|').map(s => s.trim());
      }
    }

    return {
      title,
      xValues,
      yPrime,
      yValues: {
        values: yValuesArr,
        directions
      }
    };
  } catch (err) {
    console.warn("Parse variation table failed:", err);
    return null;
  }
}
