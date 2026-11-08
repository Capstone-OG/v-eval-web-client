import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Plus, Minus } from 'lucide-react';

function renderMath(latex) {
  if (!latex || !String(latex).trim()) return '<span class="text-indigo-400 text-[10px] font-sans">Thả số</span>';
  const clean = String(latex).trim().replace(/^\$+|\$+$/g, '');
  try {
    return katex.renderToString(clean, { throwOnError: false, strict: 'ignore' });
  } catch {
    return clean;
  }
}

/**
 * Tách các ô trên 1 dòng BBT theo dấu '|' nhưng bảo toàn tuyệt đối ký hiệu tiệm cận đứng '||'
 * cũng như giữ nguyên các ô đang để trống ("") để không bị mất cột hay nhảy giá trị.
 */
export function splitVariationRow(rawStr, removeEmpty = false) {
  if (rawStr === undefined || rawStr === null) return [];
  const protectedStr = String(rawStr).replace(/\|\|/g, '__VEVAL_DBL_BAR__');
  const tokens = protectedStr
    .split('|')
    .map((s) => s.trim().replace(/\$/g, '').replace(/__VEVAL_DBL_BAR__/g, '||'));
  return removeEmpty ? tokens.filter(Boolean) : tokens;
}

/**
 * Hiển thị ký hiệu toán học thân thiện trong ô input "Gõ số/chữ" (VD: -∞ thay vì -\infty)
 */
export function formatSlotDisplayValue(latex) {
  if (latex === undefined || latex === null) return '';
  const raw = String(latex).trim();
  if (!raw) return '';
  return raw
    .replace(/-\\infty/g, '-∞')
    .replace(/\+\\infty/g, '+∞')
    .replace(/\\infty/g, '∞')
    .replace(/\\parallel/g, '||')
    .replace(/-\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '-$1/$2')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/-\\sqrt\{([^{}]+)\}/g, '-√$1')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√$1')
    .replace(/y_\{\\text\{CĐ\}\}|y_\{CĐ\}/g, 'y_CĐ')
    .replace(/y_\{\\text\{CT\}\}|y_\{CT\}/g, 'y_CT');
}

/**
 * Chuyển chuỗi người dùng gõ trong ô input (VD: -∞, +∞, 1/2, -1/2, √2) về chuẩn LaTeX
 */
export function parseSlotInputToLatex(rawInput) {
  if (rawInput === undefined || rawInput === null) return '';
  const s = String(rawInput).trim().replace(/^\$+|\$+$/g, '');
  if (!s) return '';
  if (s === '||' || s === '\\parallel' || s.includes('Tiệm cận')) return '||';
  if (s === '-∞' || s === '-oo' || s === '-inf' || s === '-infinity' || s === '-\\infty') return '-\\infty';
  if (s === '+∞' || s === '+oo' || s === '+inf' || s === '+infinity' || s === '+\\infty') return '+\\infty';
  if (s === '∞' || s === 'oo' || s === 'inf' || s === 'infinity' || s === '\\infty') return '+\\infty';
  if (s === 'y_CĐ') return 'y_{CĐ}';
  if (s === 'y_CT') return 'y_{CT}';

  const fracMatch = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const num = fracMatch[1];
    const den = fracMatch[2];
    if (num.startsWith('-')) {
      return `-\\frac{${num.slice(1)}}{${den}}`;
    }
    return `\\frac{${num}}{${den}}`;
  }

  const sqrtMatch = s.match(/^(-?)√([a-zA-Z0-9]+)$/);
  if (sqrtMatch) {
    return `${sqrtMatch[1]}\\sqrt{${sqrtMatch[2]}}`;
  }

  return s
    .replace(/-∞/g, '-\\infty')
    .replace(/\+∞/g, '+\\infty')
    .replace(/∞/g, '\\infty');
}

function healSplitDoubleBars(arr) {
  if (!Array.isArray(arr)) return [];
  const res = [];
  let i = 0;
  while (i < arr.length) {
    if (
      String(arr[i] ?? '').trim() === '' &&
      i + 2 < arr.length &&
      String(arr[i + 1] ?? '').trim() === '' &&
      String(arr[i + 2] ?? '').trim() === ''
    ) {
      res.push('||');
      i += 3;
    } else {
      res.push(String(arr[i] ?? ''));
      i += 1;
    }
  }
  return res;
}

function sanitizeIncomingTableData(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    yPrime: Array.isArray(raw.yPrime) ? healSplitDoubleBars(raw.yPrime) : raw.yPrime,
    yValues: raw.yValues
      ? {
          ...raw.yValues,
          values: Array.isArray(raw.yValues.values) ? healSplitDoubleBars(raw.yValues.values) : raw.yValues.values
        }
      : raw.yValues
  };
}

function splitAsymptotePair(val) {
  const raw = val !== undefined && val !== null ? String(val) : '-\\infty||+\\infty';
  if (raw.includes('||')) {
    const pieces = raw.split('||');
    return [(pieces[0] ?? '').trim(), (pieces[1] ?? '').trim()];
  }
  return [raw.trim(), '+\\infty'];
}

function extractAsymptoteFromRawVals(rawVals, cursor) {
  const tok = rawVals[cursor] ?? '-\\infty';
  if (tok.includes('||') && tok !== '||') {
    return { combined: tok, nextCursor: cursor + 1 };
  }
  const leftSide = tok === '||' ? '' : tok;
  let stepCursor = cursor + 1;
  if (rawVals[stepCursor] === '||' || rawVals[stepCursor] === 'double') {
    stepCursor += 1;
  }
  const rightSide = rawVals[stepCursor] ?? '+\\infty';
  return {
    combined: `${leftSide}||${rightSide}`,
    nextCursor: stepCursor + 1
  };
}

function applySlotUpdate({ slot, newVal, normX, normY, pointSigns, N, commitGrid, setSelectedSlot }) {
  if (!slot) return;
  const parsedVal = parseSlotInputToLatex(newVal);
  const isAsymToken = parsedVal === '||' || parsedVal === '\\parallel' || String(newVal).includes('Tiệm cận');

  // Xử lý khi áp dụng ký hiệu Tiệm cận đứng ||
  if (isAsymToken) {
    if (slot.idx > 0 && slot.idx < N - 1) {
      const ptIdx = slot.idx - 1;
      const nextPtArr = [...pointSigns];
      const nextYArr = [...normY];
      const nextXArr = [...normX];

      // Đảo trạng thái: nếu đang là tiệm cận thì chuyển về cực trị 0, ngược lại chuyển thành tiệm cận ||
      const willBeAsym = nextPtArr[ptIdx] !== '||';
      nextPtArr[ptIdx] = willBeAsym ? '||' : '0';
      nextYArr[slot.idx] = willBeAsym ? '-\\infty||+\\infty' : '0';

      // Bảo toàn giá trị x, nếu x đang rỗng hoặc là || thì đặt giá trị mặc định hợp lệ
      if (willBeAsym && (!nextXArr[slot.idx] || nextXArr[slot.idx] === '||')) {
        nextXArr[slot.idx] = '1';
      }

      commitGrid({ pointSigns: nextPtArr, normY: nextYArr, normX: nextXArr });
      if (setSelectedSlot) {
        setSelectedSlot({ type: willBeAsym ? 'yLeft' : 'y', idx: slot.idx });
      }
      return;
    }
    return;
  }

  if (slot.type === 'x') {
    const nextXArr = [...normX];
    nextXArr[slot.idx] = parsedVal;
    commitGrid({ normX: nextXArr });
  } else if (slot.type === 'y') {
    const nextYArr = [...normY];
    nextYArr[slot.idx] = parsedVal;
    commitGrid({ normY: nextYArr });
  } else if (slot.type === 'yLeft' || slot.type === 'yRight') {
    const [curL, curR] = splitAsymptotePair(normY[slot.idx]);
    const nextL = slot.type === 'yLeft' ? parsedVal : curL;
    const nextR = slot.type === 'yRight' ? parsedVal : curR;
    const nextYArr = [...normY];
    nextYArr[slot.idx] = `${nextL}||${nextR}`;
    commitGrid({ normY: nextYArr });
  }
}

function renderAsymptoteCell({
  m,
  normY,
  intervalDirs,
  isEditable,
  selectedSlot,
  setSelectedSlot,
  handleDragStartChip,
  handleDropOnSlot
}) {
  const [asymLeft, asymRight] = splitAsymptotePair(normY[m]);
  const isLeftTop = intervalDirs[m - 1] === 'up';
  const isRightTop = intervalDirs[m] === 'down';
  const leftChosen = isEditable && selectedSlot?.type === 'yLeft' && selectedSlot?.idx === m;
  const rightChosen = isEditable && selectedSlot?.type === 'yRight' && selectedSlot?.idx === m;

  return (
    <td key={`y-asym-${m}`} className="p-0 align-stretch h-24 overflow-hidden">
      <div className="w-full h-24 flex items-stretch justify-center gap-0.5 px-0.5">
        <div className={`flex flex-1 min-w-0 ${isLeftTop ? 'items-start pt-1.5' : 'items-end pb-1.5'} justify-end`}>
          {isEditable ? (
            <div
              draggable
              onDragStart={(e) => handleDragStartChip(e, asymLeft)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnSlot(e, { type: 'yLeft', idx: m })}
              onClick={() => setSelectedSlot({ type: 'yLeft', idx: m })}
              className={`px-1 py-0.5 rounded border text-xs font-bold cursor-pointer max-w-full ${
                leftChosen
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-300'
                  : 'border-slate-300 bg-white hover:border-indigo-400'
              }`}
            >
              <span className="text-[12px] font-bold text-slate-900 truncate inline-block max-w-full" dangerouslySetInnerHTML={{ __html: renderMath(asymLeft) }} />
            </div>
          ) : (
            <span className="font-bold text-slate-900 text-[12px] truncate inline-block max-w-full" dangerouslySetInnerHTML={{ __html: renderMath(asymLeft) }} />
          )}
        </div>

        <div className="flex items-center justify-center gap-1 px-0.5 shrink-0">
          <span className="w-[1.5px] h-full bg-slate-400" />
          <span className="w-[1.5px] h-full bg-slate-400" />
        </div>

        <div className={`flex flex-1 min-w-0 ${isRightTop ? 'items-start pt-1.5' : 'items-end pb-1.5'} justify-start`}>
          {isEditable ? (
            <div
              draggable
              onDragStart={(e) => handleDragStartChip(e, asymRight)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnSlot(e, { type: 'yRight', idx: m })}
              onClick={() => setSelectedSlot({ type: 'yRight', idx: m })}
              className={`px-1 py-0.5 rounded border text-xs font-bold cursor-pointer max-w-full ${
                rightChosen
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-300'
                  : 'border-slate-300 bg-white hover:border-indigo-400'
              }`}
            >
              <span className="text-[12px] font-bold text-slate-900 truncate inline-block max-w-full" dangerouslySetInnerHTML={{ __html: renderMath(asymRight) }} />
            </div>
          ) : (
            <span className="font-bold text-slate-900 text-[12px] truncate inline-block max-w-full" dangerouslySetInnerHTML={{ __html: renderMath(asymRight) }} />
          )}
        </div>
      </div>
    </td>
  );
}

function QuickEditorToolbar({ selectedSlot, rawVal, updateSlotValue, handleDropOnSlot, handleStepNumber }) {
  const inputRef = useRef(null);
  const isFirstRender = useRef(true);
  const displayStr = formatSlotDisplayValue(rawVal);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.select();
    }
  }, [selectedSlot?.type, selectedSlot?.idx]);

  const slotLabel =
    selectedSlot?.type === 'x'
      ? `Dòng x (Cột ${selectedSlot.idx + 1})`
      : selectedSlot?.type === 'yLeft'
      ? `Dòng y (Cột ${selectedSlot.idx + 1} - Trái ||)`
      : selectedSlot?.type === 'yRight'
      ? `Dòng y (Cột ${selectedSlot.idx + 1} - Phải ||)`
      : `Dòng y (Cột ${(selectedSlot?.idx ?? 0) + 1})`;

  const handleKeyDownInput = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const specialTokens = ['-\\infty', '+\\infty', '\\infty', 'y_{CĐ}', 'y_{CT}', '||'];
      if (specialTokens.includes(String(rawVal).trim())) {
        e.preventDefault();
        updateSlotValue(selectedSlot, '');
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-200/80">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10.5px] font-bold">
          Đang chọn ô: {slotLabel}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10.5px] font-bold text-slate-600">Gõ số/chữ:</span>
          <input
            ref={inputRef}
            type="text"
            value={displayStr}
            onChange={(e) => updateSlotValue(selectedSlot, e.target.value)}
            onKeyDown={handleKeyDownInput}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnSlot(e, selectedSlot)}
            className="w-24 px-2 py-0.5 rounded-lg border border-indigo-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="VD: 2, -∞, 1/2"
          />
          {displayStr && (
            <button
              type="button"
              onClick={() => updateSlotValue(selectedSlot, '')}
              className="px-1.5 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-[10.5px] cursor-pointer"
              title="Xóa trống ô đang chọn"
            >
              ✕ Xóa ô
            </button>
          )}
          <button
            type="button"
            onClick={() => handleStepNumber(-1)}
            className="px-2 py-0.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 font-bold text-[11px] cursor-pointer"
            title="Giảm 1 đơn vị"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => handleStepNumber(1)}
            className="px-2 py-0.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 font-bold text-[11px] cursor-pointer"
            title="Tăng 1 đơn vị"
          >
            +1
          </button>
        </div>
      </div>

      <span className="text-[10px] text-slate-500 font-medium">
        💡 <strong>Cách sửa:</strong> Nhấp vào ô trên bảng rồi gõ số trực tiếp, bấm thẻ bên dưới hoặc kéo thẻ thả vào ô
      </span>
    </div>
  );
}

/**
 * Khay Ký Hiệu Kéo - Thả & Chạm Gán Nhanh (Đặt cố định bên dưới bảng)
 */
const QUICK_CHIPS = [
  { code: '-\\infty', preview: '-\\infty', title: 'Âm vô cực' },
  { code: '+\\infty', preview: '+\\infty', title: 'Dương vô cực' },
  { code: '||', preview: '\\parallel', title: 'Không xác định / Tiệm cận đứng (||)', isDouble: true },
  { code: '-3', preview: '-3' },
  { code: '-2', preview: '-2' },
  { code: '-1', preview: '-1' },
  { code: '-\\frac{1}{2}', preview: '-\\frac{1}{2}' },
  { code: '0', preview: '0' },
  { code: '\\frac{1}{2}', preview: '\\frac{1}{2}' },
  { code: '1', preview: '1' },
  { code: '2', preview: '2' },
  { code: '3', preview: '3' },
  { code: '4', preview: '4' },
  { code: '-\\sqrt{2}', preview: '-\\sqrt{2}' },
  { code: '\\sqrt{2}', preview: '\\sqrt{2}' },
  { code: 'x_1', preview: 'x_1' },
  { code: 'x_2', preview: 'x_2' },
  { code: 'y_{CĐ}', preview: 'y_{\\text{CĐ}}' },
  { code: 'y_{CT}', preview: 'y_{\\text{CT}}' },
  { code: 'm', preview: 'm' }
];

/**
 * Chuẩn hóa dữ liệu bảng biến thiên về lưới cột chuẩn SGK (2N - 1 cột):
 * - N mốc giá trị x: normX[0..N-1]
 * - N - 1 khoảng dấu đạo hàm y': intervalSigns[0..N-2] ('+' hoặc '-')
 * - N - 2 điểm đạo hàm tại mốc cực trị/tiệm cận ở giữa: pointSigns[0..N-3] ('0' hoặc '||')
 * - N - 1 hướng mũi tên: intervalDirs[0..N-2] ('up' hoặc 'down')
 * - N giá trị y tại các mốc: normY[0..N-1] (nếu mốc m là tiệm cận đứng '||', có thể lưu dạng "leftLim||rightLim", VD: "-\\infty||+\\infty")
 */
function normalizeVariationGrid(data) {
  data = sanitizeIncomingTableData(data);
  const normX = Array.isArray(data?.xValues) && data.xValues.length >= 2
    ? data.xValues.map(String)
    : ['-\\infty', '0', '2', '+\\infty'];
  const numMilestones = normX.length;

  const rawYP = Array.isArray(data?.yPrime) ? data.yPrime.map(String) : [];
  const intervalSigns = [];
  const pointSigns = [];

  if (rawYP.length === 2 * numMilestones - 3) {
    for (let k = 0; k < numMilestones - 1; k++) {
      const s = rawYP[2 * k];
      intervalSigns.push(s === '-' ? '-' : '+');
      if (k < numMilestones - 2) {
        const p = rawYP[2 * k + 1];
        pointSigns.push(p === '||' || p === 'double' ? '||' : '0');
      }
    }
  } else {
    // Fallback thông minh khi mảng y' từ AI không đúng độ dài 2N-3
    const onlySigns = rawYP.filter((s) => s === '+' || s === '-');
    const onlyPoints = rawYP.filter((s) => s === '0' || s === '||' || s === 'double');
    for (let k = 0; k < numMilestones - 1; k++) {
      intervalSigns.push(onlySigns[k] || (k % 2 === 0 ? '+' : '-'));
      if (k < numMilestones - 2) {
        const pt = onlyPoints[k];
        pointSigns.push(pt === '||' || pt === 'double' ? '||' : '0');
      }
    }
  }

  const rawDirs = Array.isArray(data?.yValues?.directions) ? data.yValues.directions : [];
  const cleanDirs = rawDirs.filter((d) => d === 'up' || d === 'down');
  const intervalDirs = intervalSigns.map((sig, k) => {
    if (cleanDirs[k]) return cleanDirs[k];
    return sig === '-' ? 'down' : 'up';
  });

  // Chuẩn hóa mảng giá trị y theo đúng N mốc x
  const rawVals = Array.isArray(data?.yValues?.values) ? data.yValues.values.map(String) : [];
  const normY = [];

  // Kiểm tra nếu rawVals có chứa '||' (dạng hàm phân thức: [2, -\infty, ||, +\infty, 2] hoặc [2, -\infty, +\infty, 2])
  if (pointSigns.includes('||')) {
    let cursor = 0;
    for (let m = 0; m < numMilestones; m++) {
      const isAsymptote = m > 0 && m < numMilestones - 1 && pointSigns[m - 1] === '||';
      if (isAsymptote) {
        const pairInfo = extractAsymptoteFromRawVals(rawVals, cursor);
        normY.push(pairInfo.combined);
        cursor = pairInfo.nextCursor;
      } else {
        if (rawVals[cursor] === '||' || rawVals[cursor] === 'double') cursor++;
        normY.push(rawVals[cursor] ?? (m === 0 ? '-\\infty' : m === numMilestones - 1 ? '+\\infty' : '0'));
        cursor++;
      }
    }
  } else {
    for (let m = 0; m < numMilestones; m++) {
      normY.push(rawVals[m] ?? (m === 0 ? '-\\infty' : m === numMilestones - 1 ? '+\\infty' : '0'));
    }
  }

  return {
    title: data?.title || 'Bảng biến thiên hàm số',
    normX,
    intervalSigns,
    pointSigns,
    intervalDirs,
    normY
  };
}

/**
 * Đóng gói từ cấu trúc chuẩn hóa 2N-1 cột về lại object data & chuỗi [VARIATION_TABLE]
 */
function buildDataFromGrid({ title, normX, intervalSigns, pointSigns, intervalDirs, normY }) {
  const numMilestones = normX.length;
  const yPrime = [];
  for (let k = 0; k < numMilestones - 1; k++) {
    yPrime.push(intervalSigns[k] || '+');
    if (k < numMilestones - 2) {
      yPrime.push(pointSigns[k] || '0');
    }
  }

  const expandedY = [];
  for (let m = 0; m < numMilestones; m++) {
    const isAsymptote = m > 0 && m < numMilestones - 1 && pointSigns[m - 1] === '||';
    const val = normY[m] ?? '0';
    if (isAsymptote) {
      const [asymL, asymR] = splitAsymptotePair(val);
      expandedY.push(asymL, '||', asymR);
    } else {
      expandedY.push(val);
    }
  }

  return {
    title: title || 'Bảng biến thiên hàm số',
    xValues: normX,
    yPrime,
    yValues: {
      values: expandedY,
      directions: intervalDirs
    }
  };
}

/**
 * Serialize structured variation table data back to [VARIATION_TABLE]...[/VARIATION_TABLE]
 */
export function serializeVariationTableData(tableData) {
  if (!tableData) return '';
  const title = tableData.title || 'Bảng biến thiên hàm số';
  const xStr = (tableData.xValues || []).join(' | ');
  const ypStr = (tableData.yPrime || []).join(' | ');
  const yStr = (tableData.yValues?.values || []).join(' | ');
  const dirStr = (tableData.yValues?.directions || []).join(' | ');
  let out = `[VARIATION_TABLE]\ntitle: ${title}\nx: ${xStr}\ny': ${ypStr}\ny: ${yStr}`;
  if (dirStr) out += `\ndir: ${dirStr}`;
  out += `\n[/VARIATION_TABLE]`;
  return out;
}

/**
 * VariationTable Component - Bảng Biến Thiên Chuẩn Sách Giáo Khoa GDPT 2018
 * - Căn thẳng hàng tuyệt đối theo lưới 2N - 1 cột (Mỗi mốc x_i thẳng hàng dọc với đạo hàm 0/|| và cực trị y_i; mỗi dấu +/- nằm đúng khoảng giữa và thẳng hàng dọc với mũi tên ↗/↘)
 * - Không bao giờ nhảy layout khi click: Chiều cao dòng cố định, thanh công cụ Kéo-Thả nằm gọn bên dưới bảng
 */
export default function VariationTable({ data, className = '', onChange = null }) {
  const isEditable = Boolean(onChange);
  // selectedSlot: { type: 'x' | 'y' | 'yLeft' | 'yRight', idx: number }
  const [selectedSlot, setSelectedSlot] = useState({ type: 'x', idx: 1 });
  const [dragOverKey, setDragOverKey] = useState(null);

  if (!data) return null;

  const grid = normalizeVariationGrid(data);
  const { title, normX, intervalSigns, pointSigns, intervalDirs, normY } = grid;
  const N = normX.length;

  const commitGrid = (nextPartial) => {
    if (!onChange) return;
    const mergedGrid = {
      title: nextPartial.title ?? title,
      normX: nextPartial.normX ?? normX,
      intervalSigns: nextPartial.intervalSigns ?? intervalSigns,
      pointSigns: nextPartial.pointSigns ?? pointSigns,
      intervalDirs: nextPartial.intervalDirs ?? intervalDirs,
      normY: nextPartial.normY ?? normY
    };
    const nextDataObj = buildDataFromGrid(mergedGrid);
    onChange(serializeVariationTableData(nextDataObj), nextDataObj);
  };

  // Đổi giá trị tại ô x[m] hoặc y[m]
  const updateSlotValue = (slot, newVal) => {
    applySlotUpdate({
      slot,
      newVal,
      normX,
      normY,
      pointSigns,
      N,
      commitGrid,
      setSelectedSlot
    });
  };

  // Đảo dấu khoảng k (+ <-> -) và tự động đồng bộ chiều mũi tên (↗ <-> ↘)
  const toggleIntervalSign = (k, forcedSign = null) => {
    if (!isEditable) return;
    const curr = intervalSigns[k] || '+';
    const nextSign =
      forcedSign === '+' || forcedSign === 'up' || forcedSign === '\\nearrow'
        ? '+'
        : forcedSign === '-' || forcedSign === 'down' || forcedSign === '\\searrow'
        ? '-'
        : curr === '+'
        ? '-'
        : '+';
    const nextSigns = [...intervalSigns];
    nextSigns[k] = nextSign;
    const nextDirs = [...intervalDirs];
    nextDirs[k] = nextSign === '+' ? 'up' : 'down';
    commitGrid({ intervalSigns: nextSigns, intervalDirs: nextDirs });
  };

  // Đảo trạng thái tại mốc giữa m (0 <-> ||)
  const togglePointSign = (ptIdx, forcedVal = null) => {
    if (!isEditable) return;
    const curr = pointSigns[ptIdx] || '0';
    const nextVal =
      forcedVal === '||' || forcedVal === '\\parallel'
        ? '||'
        : forcedVal === '0'
        ? '0'
        : curr === '||'
        ? '0'
        : '||';
    const nextPts = [...pointSigns];
    nextPts[ptIdx] = nextVal;
    const nextY = [...normY];
    const m = ptIdx + 1;
    if (nextVal === '||' && !String(nextY[m]).includes('||')) {
      nextY[m] = '-\\infty||+\\infty';
    } else if (nextVal === '0' && String(nextY[m]).includes('||')) {
      nextY[m] = '0';
    }
    commitGrid({ pointSigns: nextPts, normY: nextY });
  };

  // Thêm 1 cột mốc cực trị x mới vào trước +∞
  const handleAddColumn = () => {
    const insertIdx = N - 1;
    const nextX = [...normX];
    nextX.splice(insertIdx, 0, `${insertIdx}`);

    const lastSign = intervalSigns[intervalSigns.length - 1] || '+';
    const newSign = lastSign === '+' ? '-' : '+';
    const nextSigns = [...intervalSigns, newSign];
    const nextDirs = [...intervalDirs, newSign === '+' ? 'up' : 'down'];
    const nextPts = [...pointSigns, '0'];

    const nextY = [...normY];
    nextY.splice(insertIdx, 0, newSign === '+' ? '0' : '4');
    nextY[nextY.length - 1] = newSign === '+' ? '+\\infty' : '-\\infty';

    commitGrid({
      normX: nextX,
      intervalSigns: nextSigns,
      pointSigns: nextPts,
      intervalDirs: nextDirs,
      normY: nextY
    });
    setSelectedSlot({ type: 'x', idx: insertIdx });
  };

  // Thêm 1 cột tiệm cận đứng || mới vào bảng
  const handleAddAsymptoteColumn = (insertAt = null) => {
    const insertIdx = insertAt !== null && insertAt > 0 && insertAt < N ? insertAt : N - 1;
    const nextX = [...normX];

    // Tính hoành độ x_0 hợp lý tại vị trí chèn
    let newXVal = '1';
    const leftX = parseFloat(normX[insertIdx - 1]);
    const rightX = parseFloat(normX[insertIdx]);
    if (Number.isFinite(leftX) && Number.isFinite(rightX)) {
      const mid = Math.round(((leftX + rightX) / 2) * 10) / 10;
      newXVal = String(mid);
    } else if (Number.isFinite(leftX)) {
      newXVal = String(Math.round((leftX + 1) * 10) / 10);
    } else if (Number.isFinite(rightX)) {
      newXVal = String(Math.round((rightX - 1) * 10) / 10);
    } else {
      newXVal = `${insertIdx}`;
    }
    nextX.splice(insertIdx, 0, newXVal);

    const prevSign = intervalSigns[Math.min(insertIdx - 1, intervalSigns.length - 1)] || '-';
    const nextSigns = [...intervalSigns];
    nextSigns.splice(insertIdx - 1, 0, prevSign);

    const prevDir = prevSign === '+' ? 'up' : 'down';
    const nextDirs = [...intervalDirs];
    nextDirs.splice(insertIdx - 1, 0, prevDir);

    const nextPts = [...pointSigns];
    nextPts.splice(insertIdx - 1, 0, '||');

    const nextY = [...normY];
    const asymYVal = prevDir === 'up' ? '+\\infty||-\\infty' : '-\\infty||+\\infty';
    nextY.splice(insertIdx, 0, asymYVal);

    commitGrid({
      normX: nextX,
      intervalSigns: nextSigns,
      pointSigns: nextPts,
      intervalDirs: nextDirs,
      normY: nextY
    });
    setSelectedSlot({ type: 'x', idx: insertIdx });
  };

  // Xóa 1 cột mốc cực trị ở giữa
  const handleRemoveColumnAt = (mIdx = null) => {
    if (N <= 2) return;
    const targetM = mIdx !== null && mIdx > 0 && mIdx < N - 1 ? mIdx : N - 2;
    const nextX = normX.filter((_, i) => i !== targetM);
    const nextY = normY.filter((_, i) => i !== targetM);
    const nextPts = pointSigns.filter((_, i) => i !== targetM - 1);
    const nextSigns = intervalSigns.filter((_, i) => i !== targetM);
    const nextDirs = intervalDirs.filter((_, i) => i !== targetM);

    commitGrid({
      normX: nextX,
      intervalSigns: nextSigns,
      pointSigns: nextPts,
      intervalDirs: nextDirs,
      normY: nextY
    });
    setSelectedSlot({ type: 'x', idx: Math.max(0, targetM - 1) });
  };

  // Áp dụng nhanh 4 mẫu BBT chuẩn SGK
  const handleApplyPreset = (presetType) => {
    if (presetType === 'cubic_up') {
      commitGrid({
        title: 'Bảng biến thiên hàm số bậc ba (a > 0)',
        normX: ['-\\infty', '0', '2', '+\\infty'],
        intervalSigns: ['+', '-', '+'],
        pointSigns: ['0', '0'],
        intervalDirs: ['up', 'down', 'up'],
        normY: ['-\\infty', '4', '0', '+\\infty']
      });
    } else if (presetType === 'cubic_down') {
      commitGrid({
        title: 'Bảng biến thiên hàm số bậc ba (a < 0)',
        normX: ['-\\infty', '-1', '1', '+\\infty'],
        intervalSigns: ['-', '+', '-'],
        pointSigns: ['0', '0'],
        intervalDirs: ['down', 'up', 'down'],
        normY: ['+\\infty', '-2', '2', '-\\infty']
      });
    } else if (presetType === 'quartic') {
      commitGrid({
        title: 'Bảng biến thiên hàm số trùng phương',
        normX: ['-\\infty', '-1', '0', '1', '+\\infty'],
        intervalSigns: ['-', '+', '-', '+'],
        pointSigns: ['0', '0', '0'],
        intervalDirs: ['down', 'up', 'down', 'up'],
        normY: ['+\\infty', '-2', '1', '-2', '+\\infty']
      });
    } else if (presetType === 'rational') {
      commitGrid({
        title: 'Bảng biến thiên hàm phân thức hữu tỉ',
        normX: ['-\\infty', '1', '+\\infty'],
        intervalSigns: ['-', '-'],
        pointSigns: ['||'],
        intervalDirs: ['down', 'down'],
        normY: ['2', '-\\infty||+\\infty', '2']
      });
    }
  };

  // Lấy giá trị hiện tại của ô đang chọn để hiển thị trên thanh chỉnh nhanh
  const getSelectedSlotValue = () => {
    if (!selectedSlot) return '';
    if (selectedSlot.type === 'x') return normX[selectedSlot.idx] ?? '';
    if (selectedSlot.type === 'y') return normY[selectedSlot.idx] ?? '';
    if (selectedSlot.type === 'yLeft' || selectedSlot.type === 'yRight') {
      const [asymLeftVal, asymRightVal] = splitAsymptotePair(normY[selectedSlot.idx]);
      return selectedSlot.type === 'yLeft' ? asymLeftVal : asymRightVal;
    }
    return '';
  };

  const handleStepNumber = (delta) => {
    const curr = getSelectedSlotValue();
    const num = parseFloat(curr);
    const next = Number.isFinite(num) ? num + delta : delta;
    updateSlotValue(selectedSlot, String(next));
  };

  const handleDragStartChip = (e, code) => {
    e.dataTransfer.setData('text/veval-bbt', code);
    e.dataTransfer.setData('text/veval-math', code);
    e.dataTransfer.setData('text/plain', code);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDropOnSlot = (e, slot) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
    const dropped =
      e.dataTransfer.getData('text/veval-bbt') ||
      e.dataTransfer.getData('text/veval-math') ||
      e.dataTransfer.getData('text/plain');
    if (!dropped) return;

    // Nếu thả thẻ tiệm cận vào khoảng giữa (interval) k -> chèn thêm 1 cột tiệm cận vào đúng vị trí đó
    if (slot?.type === 'interval') {
      const isAsym = dropped === '||' || dropped === '\\parallel' || String(dropped).includes('Tiệm cận');
      if (isAsym) {
        handleAddAsymptoteColumn(slot.k + 1);
      }
      return;
    }

    setSelectedSlot(slot);
    updateSlotValue(slot, dropped);
  };

  // Xác định vị trí Cao (Đỉnh) hay Thấp (Đáy) tại mốc m dựa trên chiều mũi tên liền kề
  const isMilestoneAtTop = (m) => {
    if (m === 0) {
      return intervalDirs[0] === 'down';
    }
    return intervalDirs[m - 1] === 'up';
  };

  // Tạo danh sách 2N - 1 cột: cột chẵn (2m) là Mốc x_m, cột lẻ (2k+1) là Khoảng biến thiên (x_k, x_{k+1})
  const totalCols = 2 * N - 1;
  const columns = Array.from({ length: totalCols }, (_, colIdx) => {
    if (colIdx % 2 === 0) {
      return { isMilestone: true, m: colIdx / 2, colIdx };
    }
    return { isMilestone: false, k: (colIdx - 1) / 2, colIdx };
  });

  // Độ rộng chuẩn từng cột để bảng tự co giãn & cuộn ngang mượt mà, không bao giờ bị bóp méo hay tràn số khi thêm nhiều cực trị
  const milestoneWidth = 74;
  const asymMilestoneWidth = 104;
  const intervalWidth = 68;
  const headerWidth = 56;

  const calculatedTableMinWidth =
    headerWidth +
    columns.reduce((acc, col) => {
      if (col.isMilestone) {
        const isAsym = col.m > 0 && col.m < N - 1 && pointSigns[col.m - 1] === '||';
        return acc + (isAsym ? asymMilestoneWidth : milestoneWidth);
      }
      return acc + intervalWidth;
    }, 0);

  return (
    <div
      onClick={(e) => {
        if (isEditable) e.stopPropagation();
      }}
      className={`my-2.5 p-3.5 rounded-2xl bg-white border ${
        isEditable ? 'border-indigo-300 shadow-sm' : 'border-slate-300 shadow-2xs'
      } overflow-x-auto select-none ${className}`}
    >
      {/* 1. HEADER: TIÊU ĐỀ & CÁC NÚT MẪU CHUẨN SGK */}
      <div className="text-xs font-black text-slate-800 mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          {isEditable ? (
            <input
              type="text"
              value={title}
              onChange={(e) => commitGrid({ title: e.target.value })}
              className="px-2 py-0.5 rounded-lg border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 bg-slate-50/70 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none w-full max-w-xs transition-colors"
              placeholder="Tiêu đề bảng biến thiên..."
            />
          ) : (
            <span>{title || 'Bảng biến thiên hàm số'}</span>
          )}
        </div>

        {isEditable && (
          <div className="flex flex-wrap items-center gap-1 pr-14">
            <button
              type="button"
              onClick={() => handleApplyPreset('cubic_up')}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold cursor-pointer transition-colors"
              title="Mẫu hàm bậc ba a > 0 (2 cực trị)"
            >
              Bậc 3 (a&gt;0)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('cubic_down')}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold cursor-pointer transition-colors"
              title="Mẫu hàm bậc ba a < 0"
            >
              Bậc 3 (a&lt;0)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('quartic')}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold cursor-pointer transition-colors"
              title="Mẫu hàm trùng phương 3 cực trị"
            >
              Bậc 4
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('rational')}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold cursor-pointer transition-colors"
              title="Mẫu hàm phân thức có tiệm cận đứng ||"
            >
              Phân thức ||
            </button>
            <button
              type="button"
              onClick={handleAddColumn}
              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
              title="Thêm 1 mốc cực trị x"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm cực trị</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddAsymptoteColumn(null)}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Thêm 1 đường tiệm cận đứng || (vách kép không xác định)"
            >
              <span className="font-mono font-black text-xs leading-none">||</span>
              <span>Thêm tiệm cận</span>
            </button>
            {N > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveColumnAt(null)}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                title="Bớt 1 mốc cực trị x"
              >
                <Minus className="w-3 h-3" />
                <span>Bớt cột</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. BẢNG BIẾN THIÊN CHUẨN LƯỚI CỘT 2N - 1 (CỐ ĐỊNH CHIỀU CAO, KHÔNG BAO GIỜ NHẢY BẢNG) */}
      <div className="w-full overflow-x-auto pb-1.5 custom-scrollbar">
        <table
          className="border-collapse border border-slate-400 text-xs text-center table-fixed"
          style={{ width: '100%', minWidth: `${calculatedTableMinWidth}px` }}
        >
          <colgroup>
            <col style={{ width: `${headerWidth}px`, minWidth: `${headerWidth}px` }} />
            {columns.map((col, idx) => {
              if (col.isMilestone) {
                const isAsym = col.m > 0 && col.m < N - 1 && pointSigns[col.m - 1] === '||';
                const w = isAsym ? asymMilestoneWidth : milestoneWidth;
                return <col key={`col-${idx}`} style={{ width: `${w}px`, minWidth: `${w}px` }} />;
              }
              return (
                <col
                  key={`col-${idx}`}
                  style={{ width: `${intervalWidth}px`, minWidth: `${intervalWidth}px` }}
                />
              );
            })}
          </colgroup>
          <tbody>
            {/* ==================== DÒNG 1: x ==================== */}
            <tr className="border-b border-slate-300 bg-slate-50/80 h-11">
              <td className="w-14 min-w-[56px] max-w-[56px] py-2 px-1 font-bold border-r border-slate-400 text-slate-900 bg-slate-100 italic font-serif text-sm">
                x
              </td>
              {columns.map((col) => {
                if (!col.isMilestone) {
                  // Cột khoảng giữa (x_k, x_{k+1}) -> Cho phép kéo thả thẻ || vào đây để chèn thêm tiệm cận đứng
                  const k = col.k;
                  const intKey = `x-int-${k}`;
                  const isDragOver = isEditable && dragOverKey === intKey;

                  return (
                    <td
                      key={intKey}
                      onDragOver={(e) => {
                        if (!isEditable) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragEnter={() => setDragOverKey(intKey)}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(e) => handleDropOnSlot(e, { type: 'interval', k })}
                      title={isEditable ? 'Thả thẻ || vào đây để chèn thêm tiệm cận đứng' : ''}
                      className={`py-2 px-1 overflow-hidden transition-colors ${
                        isDragOver ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                      }`}
                    />
                  );
                }
                const m = col.m;
                const xVal = normX[m];
                const slotKey = `x-${m}`;
                const isSelected = isEditable && selectedSlot?.type === 'x' && selectedSlot?.idx === m;
                const isDragOver = isEditable && dragOverKey === slotKey;

                return (
                  <td
                    key={slotKey}
                    onDragOver={(e) => {
                      if (!isEditable) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDragEnter={() => setDragOverKey(slotKey)}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(e) => handleDropOnSlot(e, { type: 'x', idx: m })}
                    className={`py-1 px-1 font-medium text-slate-900 relative group/xcell overflow-hidden transition-colors ${
                      isDragOver ? 'bg-amber-50 ring-2 ring-amber-300' : ''
                    }`}
                  >
                    {isEditable ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStartChip(e, xVal)}
                        onClick={() => setSelectedSlot({ type: 'x', idx: m })}
                        title="Nhấp để chọn ô hoặc kéo thả giá trị vào đây"
                        className={`inline-flex items-center justify-center max-w-full min-w-[38px] h-7 px-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isDragOver
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            : isSelected
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 font-bold'
                            : 'border-slate-300/90 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                        }`}
                      >
                        <span
                          className="text-[12.5px] font-bold text-slate-900 truncate max-w-full"
                          dangerouslySetInnerHTML={{ __html: renderMath(xVal) }}
                        />
                      </div>
                    ) : (
                      <span
                        className="text-[12.5px] font-bold text-slate-900 truncate max-w-full inline-block"
                        dangerouslySetInnerHTML={{ __html: renderMath(xVal) }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>

            {/* ==================== DÒNG 2: y' ==================== */}
            <tr className="border-b border-slate-300 bg-white h-11">
              <td className="w-14 min-w-[56px] max-w-[56px] py-2 px-1 font-bold border-r border-slate-400 text-slate-900 bg-slate-100 italic font-serif text-sm">
                y&apos;
              </td>
              {columns.map((col) => {
                if (col.isMilestone) {
                  const m = col.m;
                  // Hai đầu mút m = 0 và m = N - 1 trống ở dòng y'
                  if (m === 0 || m === N - 1) {
                    return <td key={`yp-end-${m}`} className="py-1.5 px-1 overflow-hidden" />;
                  }
                  const ptIdx = m - 1;
                  const ptSign = pointSigns[ptIdx] || '0';
                  const isDouble = ptSign === '||';
                  const dropKey = `yp-pt-${ptIdx}`;
                  const isDragOver = isEditable && dragOverKey === dropKey;

                  return (
                    <td
                      key={dropKey}
                      onDragOver={(e) => {
                        if (!isEditable) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragEnter={() => setDragOverKey(dropKey)}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(e) => {
                        if (!isEditable) return;
                        e.preventDefault();
                        setDragOverKey(null);
                        const dropped =
                          e.dataTransfer.getData('text/veval-bbt') ||
                          e.dataTransfer.getData('text/veval-math') ||
                          e.dataTransfer.getData('text/plain');
                        togglePointSign(ptIdx, dropped);
                      }}
                      className={`py-1 px-1 relative overflow-hidden transition-colors ${
                        isDragOver ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      {isEditable ? (
                        <button
                          type="button"
                          onClick={() => togglePointSign(ptIdx)}
                          title="Nhấp để đổi giữa 0 (Cực trị) và || (Không xác định / Tiệm cận đứng)"
                          className={`inline-flex items-center justify-center min-w-[34px] max-w-full h-7 px-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isDouble
                              ? 'border-amber-400 bg-amber-50 text-amber-900 font-black'
                              : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 text-slate-800 font-bold'
                          }`}
                        >
                          {isDouble ? (
                            <span className="inline-flex items-center gap-1 h-4">
                              <span className="w-[1.5px] h-full bg-slate-700 rounded-full" />
                              <span className="w-[1.5px] h-full bg-slate-700 rounded-full" />
                            </span>
                          ) : (
                            <span className="text-[13px] font-bold">0</span>
                          )}
                        </button>
                      ) : isDouble ? (
                        <div className="inline-flex items-center justify-center gap-1 h-5">
                          <span className="w-[1.5px] h-full bg-slate-500 rounded-full" />
                          <span className="w-[1.5px] h-full bg-slate-500 rounded-full" />
                        </div>
                      ) : (
                        <span className="text-[13px] font-bold text-slate-700">0</span>
                      )}
                    </td>
                  );
                }

                // Cột lẻ: Khoảng dấu k (giữa x_k và x_{k+1})
                const k = col.k;
                const sign = intervalSigns[k] || '+';
                const dropKey = `yp-int-${k}`;
                const isDragOver = isEditable && dragOverKey === dropKey;

                return (
                  <td
                    key={dropKey}
                    onDragOver={(e) => {
                      if (!isEditable) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDragEnter={() => setDragOverKey(dropKey)}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(e) => {
                      if (!isEditable) return;
                      e.preventDefault();
                      setDragOverKey(null);
                      const dropped =
                        e.dataTransfer.getData('text/veval-bbt') ||
                        e.dataTransfer.getData('text/veval-math') ||
                        e.dataTransfer.getData('text/plain');
                      if (dropped === '||' || dropped === '\\parallel' || String(dropped).includes('Tiệm cận')) {
                        handleAddAsymptoteColumn(k + 1);
                      } else {
                        toggleIntervalSign(k, dropped);
                      }
                    }}
                    className={`py-1 px-1 overflow-hidden transition-colors ${
                      isDragOver ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                    }`}
                  >
                    {isEditable ? (
                      <button
                        type="button"
                        onClick={() => toggleIntervalSign(k)}
                        title="Nhấp 1 lần để đổi dấu + / - (Tự động đảo chiều mũi tên bên dưới)"
                        className={`inline-flex items-center justify-center min-w-[36px] max-w-full h-7 px-1.5 rounded-lg border text-sm font-black transition-colors cursor-pointer ${
                          sign === '+'
                            ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        {sign}
                      </button>
                    ) : (
                      <span
                        className={`text-sm font-black ${
                          sign === '+' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {sign}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* ==================== DÒNG 3: CHIỀU BIẾN THIÊN CỦA y ==================== */}
            <tr className="bg-slate-50/30 h-24">
              <td className="w-14 min-w-[56px] max-w-[56px] py-2 px-1 font-bold border-r border-slate-400 text-slate-900 bg-slate-100 italic font-serif text-sm align-middle">
                y
              </td>
              {columns.map((col) => {
                if (col.isMilestone) {
                  const m = col.m;
                  const isAsymptote = m > 0 && m < N - 1 && pointSigns[m - 1] === '||';

                  if (isAsymptote) {
                    return renderAsymptoteCell({
                      m,
                      normY,
                      intervalDirs,
                      isEditable,
                      selectedSlot,
                      setSelectedSlot,
                      handleDragStartChip,
                      handleDropOnSlot
                    });
                  }

                  // Cột mốc liên tục bình thường: tự động đặt ở Đỉnh (trên) hoặc Đáy (dưới) trong khung cố định h-24
                  const yVal = normY[m] ?? '0';
                  const atTop = isMilestoneAtTop(m);
                  const slotKey = `y-${m}`;
                  const isSelected = isEditable && selectedSlot?.type === 'y' && selectedSlot?.idx === m;
                  const isDragOver = isEditable && dragOverKey === slotKey;

                  return (
                    <td
                      key={slotKey}
                      onDragOver={(e) => {
                        if (!isEditable) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDragEnter={() => setDragOverKey(slotKey)}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(e) => handleDropOnSlot(e, { type: 'y', idx: m })}
                      className={`p-1 align-stretch h-24 overflow-hidden transition-colors ${
                        isDragOver ? 'bg-amber-50 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <div
                        className={`w-full h-20 flex justify-center ${
                          atTop ? 'items-start pt-0.5' : 'items-end pb-0.5'
                        }`}
                      >
                        {isEditable ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStartChip(e, yVal)}
                            onClick={() => setSelectedSlot({ type: 'y', idx: m })}
                            title="Nhấp chọn ô hoặc kéo thả giá trị y vào đây"
                            className={`inline-flex items-center justify-center max-w-full min-w-[38px] h-7 px-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 font-bold'
                                : 'border-amber-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
                            }`}
                          >
                            <span
                              className="text-[12.5px] font-bold text-slate-900 truncate max-w-full"
                              dangerouslySetInnerHTML={{ __html: renderMath(yVal) }}
                            />
                          </div>
                        ) : (
                          <span
                            className="text-[12.5px] font-bold text-slate-900 truncate max-w-full inline-block"
                            dangerouslySetInnerHTML={{ __html: renderMath(yVal) }}
                          />
                        )}
                      </div>
                    </td>
                  );
                }

                // Cột lẻ: Mũi tên biến thiên trên khoảng k (giữa mốc k và k+1)
                const k = col.k;
                const dir = intervalDirs[k] || 'up';
                const isUp = dir === 'up';

                return (
                  <td
                    key={`y-dir-${k}`}
                    onDragOver={(e) => {
                      if (!isEditable) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDragEnter={() => setDragOverKey(`y-dir-${k}`)}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(e) => {
                      if (!isEditable) return;
                      e.preventDefault();
                      setDragOverKey(null);
                      const dropped =
                        e.dataTransfer.getData('text/veval-bbt') ||
                        e.dataTransfer.getData('text/veval-math') ||
                        e.dataTransfer.getData('text/plain');
                      if (dropped === '||' || dropped === '\\parallel' || String(dropped).includes('Tiệm cận')) {
                        handleAddAsymptoteColumn(k + 1);
                      } else if (dropped === '+' || dropped === '-' || dropped === '\\nearrow' || dropped === '\\searrow') {
                        toggleIntervalSign(k, dropped);
                      }
                    }}
                    className={`p-1 align-middle h-24 overflow-hidden transition-colors ${
                      isEditable && dragOverKey === `y-dir-${k}` ? 'bg-amber-100 ring-2 ring-amber-300' : ''
                    }`}
                    title={isEditable ? 'Thả || vào đây để chèn thêm tiệm cận đứng, hoặc nhấp vào mũi tên để đổi chiều' : ''}
                  >
                    <div className="w-full h-20 flex items-center justify-center">
                      {isEditable ? (
                        <button
                          type="button"
                          onClick={() => toggleIntervalSign(k)}
                          title="Nhấp để đảo chiều mũi tên (↗ Đồng biến / ↘ Nghịch biến)"
                          className={`w-full max-w-[62px] h-13 rounded-xl border border-dashed flex items-center justify-center transition-colors cursor-pointer ${
                            isUp
                              ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-600'
                              : 'border-rose-300 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600'
                          }`}
                        >
                          <svg viewBox="0 0 60 40" className="w-10 h-7 overflow-visible">
                            {isUp ? (
                              <g stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="6" y1="34" x2="54" y2="6" />
                                <polyline points="43,6 54,6 52,17" />
                              </g>
                            ) : (
                              <g stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="6" y1="6" x2="54" y2="34" />
                                <polyline points="52,23 54,34 43,34" />
                              </g>
                            )}
                          </svg>
                        </button>
                      ) : (
                        <svg
                          viewBox="0 0 60 40"
                          className={`w-10 h-7 overflow-visible ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}
                        >
                          {isUp ? (
                            <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="6" y1="34" x2="54" y2="6" />
                              <polyline points="43,6 54,6 52,17" />
                            </g>
                          ) : (
                            <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="6" y1="6" x2="54" y2="34" />
                              <polyline points="52,23 54,34 43,34" />
                            </g>
                          )}
                        </svg>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. THANH KÉO - THẢ & CHỈNH NHANH BÊN DƯỚI BẢNG (KHÔNG BAO GIỜ ĐẨY BẢNG NHẢY LÊN/XUỐNG) */}
      {isEditable && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          {/* Hàng điều khiển trực tiếp cho ô đang chọn */}
          <QuickEditorToolbar
            selectedSlot={selectedSlot}
            rawVal={getSelectedSlotValue()}
            updateSlotValue={updateSlotValue}
            handleDropOnSlot={handleDropOnSlot}
            handleStepNumber={handleStepNumber}
          />

          {/* Hàng các thẻ ký hiệu toán học Kéo - Thả / Chạm Gán Nhanh */}
          <div className="flex flex-wrap items-center gap-1">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                draggable
                onDragStart={(e) => handleDragStartChip(e, chip.code)}
                onClick={() => updateSlotValue(selectedSlot, chip.code)}
                title={chip.title || `Nhấp để điền vào ô đang chọn hoặc kéo thả vào bảng`}
                className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-400 text-slate-800 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              >
                {chip.isDouble ? (
                  <span className="font-mono font-black text-amber-800">|| (Tiệm cận)</span>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: renderMath(chip.preview) }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
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
        xValues = splitVariationRow(line.slice(2), false);
      } else if (lower.startsWith("y':") || lower.startsWith('yprime:') || lower.startsWith("f':") || lower.startsWith("f'(x):")) {
        yPrime = splitVariationRow(line.includes(':') ? line.slice(line.indexOf(':') + 1) : '', true);
      } else if (lower.startsWith('y:') || lower.startsWith('f(x):') || lower.startsWith('f:')) {
        yValuesArr = splitVariationRow(line.includes(':') ? line.slice(line.indexOf(':') + 1) : '', false);
      } else if (lower.startsWith('dir:') || lower.startsWith('direction:') || lower.startsWith('directions:')) {
        directions = splitVariationRow(line.includes(':') ? line.slice(line.indexOf(':') + 1) : '', true).map((s) => s.toLowerCase());
        hasExplicitDir = true;
      }
    }

    if (!hasExplicitDir || directions.length === 0) {
      directions = [];
      yPrime.forEach(sig => {
        if (sig === '+') directions.push('up');
        else if (sig === '-') directions.push('down');
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
