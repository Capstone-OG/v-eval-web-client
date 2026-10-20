import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderMath(latex) {
  if (!latex) return '';
  const clean = String(latex).trim().replace(/^\$+|\$+$/g, '');
  try {
    return katex.renderToString(clean, { throwOnError: false });
  } catch {
    return clean;
  }
}

/**
 * VariationTable Component - Bảng Biến Thiên Chuẩn Sách Giáo Khoa GDPT 2018
 * 
 * Hỗ trợ toàn diện:
 * 1. Hàm đa thức liên tục (bậc ba, bậc bốn trùng phương, parabol...)
 * 2. Hàm phân thức hữu tỉ có tiệm cận đứng / vạch kép (||)
 * 3. Tự động suy luận chiều mũi tên (↗, ↘) từ dấu của y' nếu thiếu dòng dir
 */
export default function VariationTable({ data, className = '' }) {
  if (!data) return null;

  const {
    title = 'Bảng biến thiên hàm số',
    xValues = ['-\\infty', '-1', '1', '+\\infty'],
    yPrime = ['+', '0', '-', '0', '+'],
    yValues = {
      values: ['-\\infty', '4', '0', '+\\infty'],
      directions: ['up', 'down', 'up']
    }
  } = data;

  // Chuẩn hóa mảng yValues
  const rawVals = Array.isArray(yValues?.values) ? yValues.values : [];
  const rawDirs = Array.isArray(yValues?.directions) ? yValues.directions : [];

  // Tách các nhánh nếu có vạch kép || trong dòng y (hàm phân thức)
  const branches = [];
  let currentBranch = { values: [], directions: [] };

  rawVals.forEach((val, idx) => {
    if (val === '||' || val === 'double') {
      if (currentBranch.values.length > 0) {
        branches.push(currentBranch);
      }
      branches.push({ isDivider: true });
      currentBranch = { values: [], directions: [] };
    } else {
      currentBranch.values.push(val);
      if (rawDirs[idx]) {
        currentBranch.directions.push(rawDirs[idx]);
      }
    }
  });
  if (currentBranch.values.length > 0) {
    branches.push(currentBranch);
  }

  // Nếu không có nhánh nào (hoặc không có ||), dùng 1 nhánh duy nhất
  const hasBranches = branches.length > 1;

  return (
    <div className={`my-3 p-3 rounded-2xl bg-white border border-slate-300 shadow-sm overflow-x-auto ${className}`}>
      {title && (
        <div className="text-xs font-black text-slate-800 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs"></span>
          <span>{title}</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Chuẩn SGK GDPT 2018</span>
        </div>
      )}

      <div className="inline-block min-w-full border-collapse">
        <table className="w-full border border-slate-400 text-xs text-center select-all">
          <tbody>
            {/* DÒNG 1: Giá trị của x */}
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

            {/* DÒNG 2: Dấu của y' (đạo hàm) */}
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
                      isDoubleLine ? 'bg-slate-50 border-x-2 border-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {isDoubleLine ? (
                      <div className="flex justify-center items-center gap-0.5 select-none">
                        <span className="w-0.5 h-4 bg-slate-400 rounded-full inline-block"></span>
                        <span className="w-0.5 h-4 bg-slate-400 rounded-full inline-block"></span>
                      </div>
                    ) : isZero ? (
                      <span className="text-slate-600 font-bold">0</span>
                    ) : sign === '+' ? (
                      <span className="text-emerald-600 font-black text-sm">+</span>
                    ) : (
                      <span className="text-rose-600 font-black text-sm">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* DÒNG 3: Chiều biến thiên của y */}
            <tr className="bg-slate-50/30">
              <td className="w-16 py-4 px-3 font-bold border-r border-slate-400 text-slate-900 bg-slate-100/90 italic font-serif align-middle">
                y
              </td>
              <td colSpan={Math.max(xValues.length, yPrime.length)} className="p-3">
                <div className="flex items-center justify-between px-4 py-2 min-h-[75px]">
                  {hasBranches ? (
                    // Hiển thị đa nhánh cho hàm phân thức có vạch kép ||
                    <div className="w-full flex items-center justify-around gap-2 text-xs font-bold text-slate-900">
                      {branches.map((b, bIdx) => {
                        if (b.isDivider) {
                          return (
                            <div key={`div-${bIdx}`} className="flex flex-col items-center justify-center px-2 select-none">
                              <div className="h-14 flex items-center gap-1">
                                <span className="w-[1.5px] h-full bg-slate-400 rounded-full inline-block"></span>
                                <span className="w-[1.5px] h-full bg-slate-400 rounded-full inline-block"></span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={`br-${bIdx}`} className="flex-1 flex items-center justify-between px-2">
                            {b.values.map((v, vIdx) => {
                              const dir = b.directions[vIdx] || (vIdx % 2 === 0 ? 'down' : 'up');
                              const hasNext = vIdx < b.values.length - 1;
                              const isTop = dir === 'down' ? (vIdx === 0) : (vIdx > 0);
                              return (
                                <React.Fragment key={`v-${vIdx}`}>
                                  <div className={`flex flex-col items-center transition-transform ${isTop ? '-translate-y-3.5' : 'translate-y-3.5'}`}>
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
                        );
                      })}
                    </div>
                  ) : (
                    // Layout chuẩn mực cho hàm liên tục thông thường
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-900">
                      {rawVals.map((v, vIdx) => {
                        const hasNext = vIdx < rawVals.length - 1;
                        const dir = rawDirs[vIdx] || (vIdx % 2 === 0 ? 'up' : 'down');
                        const isTop = dir === 'up' ? hasNext : !hasNext;
                        return (
                          <React.Fragment key={vIdx}>
                            <div className={`flex flex-col items-center transition-transform ${isTop ? '-translate-y-3.5' : 'translate-y-3.5'}`}>
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
  if (!textBlock) return null;
  try {
    // Normalize potential single-line, semicolon-separated, or literal \n variation tables
    let normalized = String(textBlock)
      .replace(/\\n/g, '\n')
      .replace(/\s+(x:|y':|yprime:|f':|f'\(x\):|y:|f\(x\):|f:|dir:|direction:|directions:)/gi, '\n$1')
      .trim();

    const lines = normalized.split('\n');
    let title = 'Bảng biến thiên';
    let xValues = ['-\\infty', '-1', '1', '+\\infty'];
    let yPrime = ['+', '0', '-', '0', '+'];
    let yValuesArr = ['-\\infty', '4', '0', '+\\infty'];
    let directions = [];
    let hasExplicitDir = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const lower = line.toLowerCase();
      if (lower.startsWith('title:')) {
        let t = line.slice(6).trim();
        const cutIdx = t.search(/\b(x:|y':|y:)/i);
        if (cutIdx !== -1) t = t.slice(0, cutIdx).trim();
        title = t || 'Bảng biến thiên';
      } else if (lower.startsWith('x:')) {
        xValues = line.slice(2).split(/[|,]/).map(s => s.trim().replace(/\$/g, '')).filter(Boolean);
      } else if (lower.startsWith("y':") || lower.startsWith('yprime:') || lower.startsWith("f':") || lower.startsWith("f'(x):")) {
        const after = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
        yPrime = after.split(/[|,]/).map(s => s.trim().replace(/\$/g, '')).filter(Boolean);
      } else if (lower.startsWith('y:') || lower.startsWith('f(x):') || lower.startsWith('f:')) {
        const after = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
        // Split by pipe or comma, preserving values
        yValuesArr = after.split(/[|,]/).map(s => s.trim().replace(/\$/g, '')).filter(Boolean);
      } else if (lower.startsWith('dir:') || lower.startsWith('direction:') || lower.startsWith('directions:')) {
        const after = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
        directions = after.split(/[|,]/).map(s => s.trim().toLowerCase()).filter(Boolean);
        hasExplicitDir = true;
      }
    }

    // Tự động suy luận hướng mũi tên từ y' nếu không có dòng dir rõ ràng
    if (!hasExplicitDir || directions.length === 0) {
      directions = [];
      yPrime.forEach(sig => {
        if (sig === '+') directions.push('up');
        else if (sig === '-') directions.push('down');
        else if (sig === '||' || sig === 'double') directions.push('||');
      });
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
