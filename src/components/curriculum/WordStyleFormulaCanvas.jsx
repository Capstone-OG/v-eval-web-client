import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  FlaskConical, 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  Zap, 
  Plus, 
  ChevronRight,
  HelpCircle,
  Edit2,
  Maximize2,
  Eye,
  CornerDownLeft,
  MoveHorizontal
} from 'lucide-react';
import { renderKatexHtml } from '../common/MathText';

/**
 * Helper to safely evaluate simple arithmetic strings (e.g. "12/4", "0.2/0.5")
 */
function safeCalcDivision(numStr, denStr) {
  const num = parseFloat(numStr);
  const den = parseFloat(denStr);
  if (!isNaN(num) && !isNaN(den) && den !== 0) {
    const val = num / den;
    return Number.isInteger(val) ? `${val}` : `${val.toFixed(2).replace(/\.00$/, '')}`;
  }
  return '';
}

/**
 * Parse an equation string into known editable structures
 */
function parseEquationStructure(latex) {
  if (!latex) return { type: 'GENERIC', raw: '' };
  const str = latex.trim();

  // 1. Chemistry CM: C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M} or C_M = \frac{0.2}{0.5} = 0.4\text{ M}
  const chemCmMatch = str.match(/C_M\s*=\s*(?:\\frac\{n\}\{V\}\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}(?:\s*=\s*([^\\$\s]+)\\text\{\s*M\})?/);
  if (chemCmMatch) {
    return {
      type: 'CHEM_CM',
      num: chemCmMatch[1] || '0.2',
      den: chemCmMatch[2] || '0.5',
      result: chemCmMatch[3] || safeCalcDivision(chemCmMatch[1] || '0.2', chemCmMatch[2] || '0.5'),
      raw: str
    };
  }

  // 2. Chemistry C%: C\% = \frac{m_{ct}}{m_{dd}} \times 100\% = \frac{20}{200} \times 100\% = 10\%
  const chemCpMatch = str.match(/C\\%\s*=\s*(?:\\frac\{m_\{ct\}\}\{m_\{dd\}\}\s*\\times\s*100\\%\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}\s*\\times\s*100\\%(?:\s*=\s*([^%\\$\s]+)\s*\\%)?/);
  if (chemCpMatch) {
    const n = parseFloat(chemCpMatch[1]) || 20;
    const d = parseFloat(chemCpMatch[2]) || 200;
    const calc = d !== 0 ? ((n / d) * 100).toFixed(1).replace(/\.0$/, '') : '10';
    return {
      type: 'CHEM_CPERCENT',
      mct: chemCpMatch[1] || '20',
      mdd: chemCpMatch[2] || '200',
      result: chemCpMatch[3] || calc,
      raw: str
    };
  }

  // 3. Fraction with optional equality: \frac{A}{B} = C or \frac{A}{B}
  const fracMatch = str.match(/^\\frac\{([^}]+)\}\{([^}]+)\}(?:\s*=\s*([^\s$]+))?$/);
  if (fracMatch) {
    return {
      type: 'FRACTION',
      num: fracMatch[1],
      den: fracMatch[2],
      hasEqual: !!fracMatch[3],
      result: fracMatch[3] || '',
      raw: str
    };
  }

  // 4. Power: A^{B} or A^B
  const powMatch = str.match(/^([a-zA-Z0-9\(\)]+)\^\{?([a-zA-Z0-9+-]+)\}?$/);
  if (powMatch) {
    return {
      type: 'POWER',
      base: powMatch[1],
      exp: powMatch[2],
      raw: str
    };
  }

  // 5. Square Root: \sqrt{A} or \sqrt[n]{A}
  const sqrtMatch = str.match(/^\\sqrt(?:\[([^\]]+)\])?\{([^}]+)\}$/);
  if (sqrtMatch) {
    return {
      type: 'SQRT',
      deg: sqrtMatch[1] || '2',
      expr: sqrtMatch[2],
      raw: str
    };
  }

  return { type: 'GENERIC', raw: str };
}

/**
 * Assemble back to LaTeX string from parsed structure
 */
function buildLatexFromStructure(struct) {
  if (!struct) return '';
  switch (struct.type) {
    case 'CHEM_CM': {
      const num = struct.num || '0';
      const den = struct.den || '1';
      const res = struct.result || safeCalcDivision(num, den);
      return `C_M = \\frac{n}{V} = \\frac{${num}}{${den}} = ${res}\\text{ M}`;
    }
    case 'CHEM_CPERCENT': {
      const mct = struct.mct || '0';
      const mdd = struct.mdd || '1';
      const res = struct.result || '0';
      return `C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\% = \\frac{${mct}}{${mdd}} \\times 100\\% = ${res}\\%`;
    }
    case 'FRACTION': {
      const num = struct.num || '1';
      const den = struct.den || '1';
      if (struct.hasEqual && struct.result) {
        return `\\frac{${num}}{${den}} = ${struct.result}`;
      }
      return `\\frac{${num}}{${den}}`;
    }
    case 'POWER': {
      const b = struct.base || 'x';
      const e = struct.exp || '2';
      return `${b}^{${e}}`;
    }
    case 'SQRT': {
      const expr = struct.expr || 'x';
      const deg = struct.deg?.trim();
      return deg && deg !== '2' ? `\\sqrt[${deg}]{${expr}}` : `\\sqrt{${expr}}`;
    }
    default:
      return struct.raw || '';
  }
}

/**
 * Tokenize a paragraph or text into plain text chunks and explicit $...$ / $$...$$ formula tokens
 */
function tokenizeText(rawText) {
  if (!rawText) return [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  const parts = rawText.split(regex);
  const tokens = [];

  parts.forEach((part, idx) => {
    if (!part) return;
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const latex = part.slice(2, -2).trim();
      tokens.push({
        id: `token-display-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        isFormula: true,
        displayMode: true,
        latex,
        structure: parseEquationStructure(latex)
      });
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const latex = part.slice(1, -1).trim();
      tokens.push({
        id: `token-inline-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        isFormula: true,
        displayMode: false,
        latex,
        structure: parseEquationStructure(latex)
      });
    } else {
      tokens.push({
        id: `token-text-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        isFormula: false,
        text: part
      });
    }
  });

  return tokens;
}

/**
 * Reassemble tokens into raw Markdown/LaTeX text
 */
function serializeTokens(tokens) {
  return tokens.map(t => {
    if (!t.isFormula) return t.text;
    const latex = t.structure ? buildLatexFromStructure(t.structure) : t.latex;
    return t.displayMode ? `$$${latex}$$` : `$${latex}$`;
  }).join('');
}

/**
 * Quick Math Symbols Palette for the Floating Bubble
 */
const QUICK_SYMBOLS = [
  { label: '+', code: '+' },
  { label: '−', code: '-' },
  { label: '×', code: '\\times ' },
  { label: '÷', code: '\\div ' },
  { label: '±', code: '\\pm ' },
  { label: '√', code: '\\sqrt{x}' },
  { label: 'x²', code: '^2' },
  { label: 'xⁿ', code: '^{n}' },
  { label: 'x₀', code: '_0' },
  { label: 'π', code: '\\pi ' },
  { label: 'Δ', code: '\\Delta ' },
  { label: 'α', code: '\\alpha ' },
  { label: 'β', code: '\\beta ' },
  { label: '∞', code: '\\infty ' },
  { label: '≠', code: '\\neq ' },
  { label: '≈', code: '\\approx ' },
  { label: '≤', code: '\\le ' },
  { label: '≥', code: '\\ge ' },
  { label: '→', code: '\\rightarrow ' },
  { label: '⇔', code: '\\Leftrightarrow ' },
  { label: '∈', code: '\\in ' }
];

/**
 * WORD-STYLE IN-PLACE EQUATION & DOCUMENT CANVAS
 * Provides true in-place WYSIWYG editing:
 * 1. Click directly on numbers/variables inside formulas to edit them in real-time.
 * 2. Floating math bubble toolbar attached to the active equation.
 * 3. 1-click ribbon insertion that inserts active slots immediately without modal popups.
 */
export default function WordStyleFormulaCanvas({
  content,
  onChange,
  placeholder = "Nhập nội dung bài giảng tại đây. Bấm các nút công thức trên thanh công cụ để chèn phân số, căn thức, số mũ hoặc công thức hóa học...",
  accentColor = "cyan",
  title = "Trang Soạn Thảo Ký Hiệu Trực Quan (WYSIWYG) • Microsoft Word Style",
  isStem = true
}) {
  const [tokens, setTokens] = useState(() => tokenizeText(content || ''));
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const activeFormulaRef = useRef(null);
  const containerRef = useRef(null);

  // Sync incoming content if changed externally (e.g. from AI or raw mode)
  useEffect(() => {
    const currentSerialized = serializeTokens(tokens);
    if (content !== currentSerialized) {
      setTokens(tokenizeText(content || ''));
    }
  }, [content]);

  // Update position of floating bubble when active formula changes
  useEffect(() => {
    if (activeFormulaId && activeFormulaRef.current && containerRef.current) {
      const formulaRect = activeFormulaRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setBubblePos({
        top: formulaRect.top - containerRect.top - 48,
        left: Math.max(10, formulaRect.left - containerRect.left + (formulaRect.width / 2) - 180)
      });
    }
  }, [activeFormulaId]);

  // Handle token changes and propagate serialized text upstream
  const commitTokens = (newTokens) => {
    setTokens(newTokens);
    const serialized = serializeTokens(newTokens);
    if (onChange) onChange(serialized);
  };

  // Modify text token
  const handleTextChange = (id, newText) => {
    const updated = tokens.map(t => t.id === id ? { ...t, text: newText } : t);
    commitTokens(updated);
  };

  // Modify formula structure slots directly
  const handleFormulaSlotChange = (id, field, value) => {
    const updated = tokens.map(t => {
      if (t.id !== id) return t;
      const nextStruct = { ...t.structure, [field]: value };
      const nextLatex = buildLatexFromStructure(nextStruct);
      return {
        ...t,
        structure: nextStruct,
        latex: nextLatex
      };
    });
    commitTokens(updated);
  };

  // Auto-calculate formula values (e.g. fraction or chemistry)
  const handleAutoCalculate = (id) => {
    const updated = tokens.map(t => {
      if (t.id !== id) return t;
      if (t.structure.type === 'FRACTION') {
        const res = safeCalcDivision(t.structure.num, t.structure.den);
        const nextStruct = { ...t.structure, hasEqual: true, result: res };
        return {
          ...t,
          structure: nextStruct,
          latex: buildLatexFromStructure(nextStruct)
        };
      } else if (t.structure.type === 'CHEM_CM') {
        const res = safeCalcDivision(t.structure.num, t.structure.den);
        const nextStruct = { ...t.structure, result: res };
        return {
          ...t,
          structure: nextStruct,
          latex: buildLatexFromStructure(nextStruct)
        };
      } else if (t.structure.type === 'SQRT') {
        const val = parseFloat(t.structure.expr);
        if (!isNaN(val) && val >= 0) {
          const res = Math.sqrt(val);
          const formatted = Number.isInteger(res) ? `${res}` : `${res.toFixed(2)}`;
          const nextLatex = `\\sqrt{${t.structure.expr}} = ${formatted}`;
          return {
            ...t,
            latex: nextLatex,
            structure: { type: 'GENERIC', raw: nextLatex }
          };
        }
      }
      return t;
    });
    commitTokens(updated);
  };

  // Delete formula
  const handleDeleteFormula = (id) => {
    const updated = tokens.filter(t => t.id !== id);
    setActiveFormulaId(null);
    commitTokens(updated);
  };

  // Insert a new symbol or snippet into active formula
  const handleInsertSymbolIntoActive = (symbolCode) => {
    if (!activeFormulaId) return;
    const updated = tokens.map(t => {
      if (t.id !== activeFormulaId) return t;
      // If it's generic, append code to raw
      if (t.structure.type === 'GENERIC') {
        const nextRaw = (t.structure.raw || '') + symbolCode;
        return {
          ...t,
          latex: nextRaw,
          structure: { type: 'GENERIC', raw: nextRaw }
        };
      }
      // If fraction, append to numerator if focused, or fallback to generic
      const nextRaw = buildLatexFromStructure(t.structure) + symbolCode;
      return {
        ...t,
        latex: nextRaw,
        structure: parseEquationStructure(nextRaw)
      };
    });
    commitTokens(updated);
  };

  // 1-Click Ribbon Insertion: Insert formula immediately at end or after active token
  const handleInsertTemplate1Click = (templateType) => {
    let newFormulaLatex = '';
    let struct = null;

    switch (templateType) {
      case 'fraction':
        newFormulaLatex = '\\frac{12}{4} = 3';
        struct = { type: 'FRACTION', num: '12', den: '4', hasEqual: true, result: '3', raw: newFormulaLatex };
        break;
      case 'fraction_empty':
        newFormulaLatex = '\\frac{a}{b}';
        struct = { type: 'FRACTION', num: 'a', den: 'b', hasEqual: false, result: '', raw: newFormulaLatex };
        break;
      case 'sqrt':
        newFormulaLatex = '\\sqrt{16}';
        struct = { type: 'SQRT', deg: '2', expr: '16', raw: newFormulaLatex };
        break;
      case 'power':
        newFormulaLatex = 'x^{2}';
        struct = { type: 'POWER', base: 'x', exp: '2', raw: newFormulaLatex };
        break;
      case 'chem_cm':
        newFormulaLatex = 'C_M = \\frac{n}{V} = \\frac{0.2}{0.5} = 0.4\\text{ M}';
        struct = { type: 'CHEM_CM', num: '0.2', den: '0.5', result: '0.4', raw: newFormulaLatex };
        break;
      case 'chem_cpercent':
        newFormulaLatex = 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\% = \\frac{20}{200} \\times 100\\% = 10\\%';
        struct = { type: 'CHEM_CPERCENT', mct: '20', mdd: '200', result: '10', raw: newFormulaLatex };
        break;
      case 'derivative':
        newFormulaLatex = 'f\'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}';
        struct = { type: 'GENERIC', raw: newFormulaLatex };
        break;
      case 'integral':
        newFormulaLatex = '\\int_{0}^{1} (2x + 1) dx';
        struct = { type: 'GENERIC', raw: newFormulaLatex };
        break;
      case 'system':
        newFormulaLatex = '\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}';
        struct = { type: 'GENERIC', raw: newFormulaLatex };
        break;
      default:
        newFormulaLatex = 'x = 1';
        struct = { type: 'GENERIC', raw: newFormulaLatex };
        break;
    }

    const newFormulaId = `token-formula-new-${Date.now()}`;
    const newFormulaToken = {
      id: newFormulaId,
      isFormula: true,
      displayMode: false,
      latex: newFormulaLatex,
      structure: struct
    };

    // If an active token is selected, insert right after it; otherwise insert at end with a space
    let nextTokens = [];
    if (activeFormulaId) {
      const activeIdx = tokens.findIndex(t => t.id === activeFormulaId);
      if (activeIdx >= 0) {
        nextTokens = [
          ...tokens.slice(0, activeIdx + 1),
          { id: `sp-${Date.now()}`, isFormula: false, text: ' ' },
          newFormulaToken,
          { id: `sp2-${Date.now()}`, isFormula: false, text: ' ' },
          ...tokens.slice(activeIdx + 1)
        ];
      } else {
        nextTokens = [...tokens, { id: `sp-${Date.now()}`, isFormula: false, text: ' ' }, newFormulaToken];
      }
    } else {
      nextTokens = [...tokens, { id: `sp-${Date.now()}`, isFormula: false, text: ' ' }, newFormulaToken];
    }

    commitTokens(nextTokens);
    // Immediately open slot-editing for the newly inserted formula!
    setActiveFormulaId(newFormulaId);
  };

  const activeToken = tokens.find(t => t.id === activeFormulaId);

  return (
    <div className="space-y-4" ref={containerRef}>
      
      {/* 1. TOP WORD-STYLE EQUATION RIBBON (1-CLICK INSERTION - NO MODAL DIALOGS) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-3.5 shadow-md border border-slate-700/80">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-black text-xs">
              ∑
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Thanh Công Cụ Ký Hiệu Word Equation (Chèn & Sửa Số Trực Tiếp)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  WYSIWYG
                </span>
              </h4>
              <p className="text-[10.5px] text-slate-300">
                Nhấp nút ký hiệu bên dưới để chèn thẳng vào văn bản và gõ số trực tiếp trên trang, không cần mở hộp thoại điền số.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-300 italic hidden sm:inline">
              Mẹo: Nhấp chuột vào bất kỳ phân số hay số mũ nào trên trang để sửa số tại chỗ!
            </span>
          </div>
        </div>

        {/* 1-Click Fast Ribbon Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/70">
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('fraction')}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Chèn phân số có tính toán số trực tiếp"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              <span>➗ Phân Số & Số (12/4)</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('fraction_empty')}
              className="px-2 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Chèn phân số đại số a/b"
            >
              <span>a/b</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('sqrt')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Chèn căn bậc hai"
            >
              <span>√16</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('power')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Chèn số mũ x^2"
            >
              <span>x²</span>
            </button>
          </div>

          {/* Chemistry & STEM Specials */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/70">
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('chem_cm')}
              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Chèn công thức tính nồng độ mol CM = n/V với số thực tế và tự tính"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
              <span>🧪 Nồng Độ CM (n/V)</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('chem_cpercent')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Chèn công thức C% = (m_ct / m_dd) * 100%"
            >
              <span>💧 C%</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('derivative')}
              className="px-2 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Chèn đạo hàm bằng số gia SGK"
            >
              <span>🎯 Đạo Hàm Số Gia</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('system')}
              className="px-2 py-1 rounded-lg hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Chèn hệ phương trình"
            >
              <span>📋 Hệ PT</span>
            </button>
          </div>

          {/* Direct fast symbols */}
          <div className="hidden xl:flex items-center gap-0.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/50">
            {['\\Delta', '\\pi', '\\infty', '\\pm', '\\times', '\\approx', '\\rightarrow'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  const token = {
                    id: `token-sym-${Date.now()}`,
                    isFormula: true,
                    displayMode: false,
                    latex: sym,
                    structure: { type: 'GENERIC', raw: sym }
                  };
                  commitTokens([...tokens, { id: `sp-${Date.now()}`, isFormula: false, text: ' ' }, token]);
                }}
                className="px-1.5 py-0.5 rounded hover:bg-slate-700 text-cyan-300 font-mono text-xs transition-colors cursor-pointer"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(sym) }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE WORD DOCUMENT CANVAS (TRANG GIẤY SOẠN THẢO TRỰC TIẾP TẠI CHỖ) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl p-6 sm:p-10 min-h-[420px] relative transition-all font-sans text-slate-900 leading-relaxed text-sm selection:bg-cyan-100">
        
        {/* Document Header watermark & page styling */}
        <div className="absolute top-3 right-5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 select-none pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Trang Sách Giáo Khoa WYSIWYG</span>
        </div>

        {/* FLOATING MATH BUBBLE TOOLBAR (Appears directly over active formula) */}
        {activeFormulaId && activeToken && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(10, bubblePos.top)}px`,
              left: `${Math.max(10, bubblePos.left)}px`,
              zIndex: 40
            }}
            className="bg-slate-950/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-1 px-1 border-r border-slate-700 text-xs font-black text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sửa Công Thức:</span>
            </div>

            {/* Quick symbol insertion chips */}
            <div className="flex items-center gap-0.5 max-w-[260px] overflow-x-auto scrollbar-none py-0.5">
              {QUICK_SYMBOLS.slice(0, 10).map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleInsertSymbolIntoActive(s.code)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                  title={`Chèn ký hiệu ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
              {(activeToken.structure?.type === 'FRACTION' || activeToken.structure?.type === 'CHEM_CM' || activeToken.structure?.type === 'SQRT') && (
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(activeFormulaId)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                  title="Tự động tính ra kết quả số học mới từ các ô đã điền"
                >
                  <Zap className="w-3 h-3 fill-slate-950" />
                  <span>⚡ Tính</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteFormula(activeFormulaId)}
                className="p-1 rounded-xl hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                title="Xóa công thức này khỏi trang"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveFormulaId(null)}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all"
                title="Hoàn tất và đóng thanh công cụ"
              >
                <Check className="w-3 h-3" />
                <span>Xong</span>
              </button>
            </div>
          </div>
        )}

        {/* TOKENS RENDERING CONTAINER: INTERACTIVE WORD PARAGRAPH */}
        <div className="space-y-3 min-h-[300px]">
          {tokens.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs italic bg-slate-50/60 rounded-xl border border-dashed border-slate-300">
              Tài liệu đang trống. Hãy gõ văn bản hoặc bấm nút <strong>"➗ Phân Số & Số"</strong> hoặc <strong>"🧪 Nồng Độ CM"</strong> trên thanh Ribbon ở trên để bắt đầu soạn thảo bài giảng.
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-y-2 leading-loose">
              {tokens.map((token) => {
                // CASE 1: PLAIN TEXT CHUNK (EDITABLE IN-LINE AS WORD TEXT)
                if (!token.isFormula) {
                  return (
                    <span
                      key={token.id}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange(token.id, e.currentTarget.textContent || '')}
                      className="outline-none focus:bg-cyan-50/60 focus:rounded px-1 transition-colors whitespace-pre-wrap font-sans text-slate-800 text-[14.5px]"
                    >
                      {token.text}
                    </span>
                  );
                }

                // CASE 2: FORMULA TOKEN (INTERACTIVE WORD EQUATION WIDGET)
                const isActive = token.id === activeFormulaId;
                const struct = token.structure;

                return (
                  <span
                    key={token.id}
                    ref={isActive ? activeFormulaRef : null}
                    onClick={() => setActiveFormulaId(token.id)}
                    className={`inline-flex items-center align-middle mx-1.5 transition-all cursor-pointer relative select-none ${
                      isActive
                        ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50/70 rounded-xl p-1.5 shadow-md z-30'
                        : 'border border-indigo-200/90 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/70 hover:shadow-xs rounded-lg px-2 py-0.5'
                    }`}
                    title="Nhấp vào để chỉnh sửa số hoặc biểu thức trực tiếp trên công thức"
                  >
                    {/* SUB-WIDGET 1: FRACTION IN-PLACE SLOT EDITOR */}
                    {struct?.type === 'FRACTION' ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex flex-col items-center justify-center align-middle">
                          {/* Numerator Slot */}
                          <input
                            type="text"
                            value={struct.num}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'num', e.target.value)}
                            className="text-center font-bold text-amber-950 bg-amber-100/90 hover:bg-amber-200/90 focus:bg-white border border-amber-300 focus:border-amber-600 rounded px-1.5 py-0 text-xs font-mono focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                            style={{ width: `${Math.max(26, (struct.num || '').length * 10 + 10)}px` }}
                            title="Tử số (Nhấp để sửa số)"
                          />
                          {/* Fraction Bar */}
                          <span className="w-full h-[1.5px] bg-slate-800 my-0.5 rounded-full"></span>
                          {/* Denominator Slot */}
                          <input
                            type="text"
                            value={struct.den}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'den', e.target.value)}
                            className="text-center font-bold text-cyan-950 bg-cyan-100/90 hover:bg-cyan-200/90 focus:bg-white border border-cyan-300 focus:border-cyan-600 rounded px-1.5 py-0 text-xs font-mono focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                            style={{ width: `${Math.max(26, (struct.den || '').length * 10 + 10)}px` }}
                            title="Mẫu số (Nhấp để sửa số)"
                          />
                        </span>

                        {/* Optional equality and result slot */}
                        {(struct.hasEqual || struct.result || isActive) && (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 ml-0.5">
                            <span>=</span>
                            <input
                              type="text"
                              value={struct.result}
                              placeholder="Kết quả"
                              onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                              onChange={(e) => handleFormulaSlotChange(token.id, 'result', e.target.value)}
                              className="text-center font-extrabold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/90 focus:bg-white border border-emerald-300 focus:border-emerald-600 rounded px-1.5 py-0 text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                              style={{ width: `${Math.max(30, (struct.result || '').length * 10 + 12)}px` }}
                            />
                            {isActive && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleAutoCalculate(token.id); }}
                                className="p-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shadow-2xs"
                                title="Tự tính tử số / mẫu số"
                              >
                                ⚡
                              </button>
                            )}
                          </span>
                        )}
                      </span>
                    ) : struct?.type === 'POWER' ? (
                      /* SUB-WIDGET 2: POWER IN-PLACE SLOT EDITOR */
                      <span className="inline-flex items-baseline gap-0.5">
                        {/* Base Slot */}
                        <input
                          type="text"
                          value={struct.base}
                          onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                          onChange={(e) => handleFormulaSlotChange(token.id, 'base', e.target.value)}
                          className="text-center font-bold text-indigo-950 bg-indigo-100/80 hover:bg-indigo-200 focus:bg-white border border-indigo-300 rounded px-1 text-xs font-mono outline-none"
                          style={{ width: `${Math.max(22, (struct.base || '').length * 9 + 8)}px` }}
                          title="Cơ số"
                        />
                        {/* Exponent Slot */}
                        <input
                          type="text"
                          value={struct.exp}
                          onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                          onChange={(e) => handleFormulaSlotChange(token.id, 'exp', e.target.value)}
                          className="text-center font-extrabold text-rose-950 bg-rose-100/90 hover:bg-rose-200 focus:bg-white border border-rose-300 rounded px-1 text-[11px] font-mono -translate-y-1.5 outline-none"
                          style={{ width: `${Math.max(18, (struct.exp || '').length * 8 + 8)}px` }}
                          title="Số mũ"
                        />
                      </span>
                    ) : struct?.type === 'SQRT' ? (
                      /* SUB-WIDGET 3: SQUARE ROOT SLOT EDITOR */
                      <span className="inline-flex items-center gap-0.5 font-mono">
                        <span className="text-base font-serif text-slate-800">√</span>
                        <input
                          type="text"
                          value={struct.expr}
                          onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                          onChange={(e) => handleFormulaSlotChange(token.id, 'expr', e.target.value)}
                          className="text-center font-bold text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200 focus:bg-white border-b-2 border-emerald-500 rounded-t px-1.5 text-xs outline-none"
                          style={{ width: `${Math.max(26, (struct.expr || '').length * 9 + 10)}px` }}
                          title="Biểu thức trong căn (Nhấp để sửa)"
                        />
                      </span>
                    ) : struct?.type === 'CHEM_CM' ? (
                      /* SUB-WIDGET 4: CHEMISTRY CM SLOT EDITOR */
                      <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-slate-900">
                        <span>C_M = </span>
                        <span className="inline-flex flex-col items-center justify-center align-middle">
                          <input
                            type="text"
                            value={struct.num}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'num', e.target.value)}
                            className="text-center font-bold text-teal-950 bg-teal-100/90 hover:bg-teal-200 focus:bg-white border border-teal-300 rounded px-1 text-xs font-mono outline-none"
                            style={{ width: `${Math.max(26, (struct.num || '').length * 9 + 8)}px` }}
                            title="Số mol n"
                          />
                          <span className="w-full h-[1.5px] bg-slate-800 my-0.5"></span>
                          <input
                            type="text"
                            value={struct.den}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'den', e.target.value)}
                            className="text-center font-bold text-teal-950 bg-teal-100/90 hover:bg-teal-200 focus:bg-white border border-teal-300 rounded px-1 text-xs font-mono outline-none"
                            style={{ width: `${Math.max(26, (struct.den || '').length * 9 + 8)}px` }}
                            title="Thể tích V (Lít)"
                          />
                        </span>
                        <span>=</span>
                        <input
                          type="text"
                          value={struct.result}
                          onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                          onChange={(e) => handleFormulaSlotChange(token.id, 'result', e.target.value)}
                          className="text-center font-extrabold text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 focus:bg-white border border-emerald-300 rounded px-1 text-xs font-mono outline-none"
                          style={{ width: `${Math.max(28, (struct.result || '').length * 9 + 8)}px` }}
                          title="Nồng độ mol kết quả"
                        />
                        <span className="font-sans font-bold text-teal-800">M</span>
                      </span>
                    ) : struct?.type === 'CHEM_CPERCENT' ? (
                      /* SUB-WIDGET 5: CHEMISTRY C% SLOT EDITOR */
                      <span className="inline-flex items-center gap-1 text-xs font-serif font-bold text-slate-900">
                        <span>C% = </span>
                        <span className="inline-flex flex-col items-center justify-center align-middle">
                          <input
                            type="text"
                            value={struct.mct}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'mct', e.target.value)}
                            className="text-center font-bold text-cyan-950 bg-cyan-100/90 border border-cyan-300 rounded px-1 text-xs font-mono outline-none"
                            style={{ width: `${Math.max(26, (struct.mct || '').length * 9 + 8)}px` }}
                            title="Khối lượng chất tan m_ct"
                          />
                          <span className="w-full h-[1.5px] bg-slate-800 my-0.5"></span>
                          <input
                            type="text"
                            value={struct.mdd}
                            onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                            onChange={(e) => handleFormulaSlotChange(token.id, 'mdd', e.target.value)}
                            className="text-center font-bold text-cyan-950 bg-cyan-100/90 border border-cyan-300 rounded px-1 text-xs font-mono outline-none"
                            style={{ width: `${Math.max(26, (struct.mdd || '').length * 9 + 8)}px` }}
                            title="Khối lượng dung dịch m_dd"
                          />
                        </span>
                        <span>× 100% =</span>
                        <input
                          type="text"
                          value={struct.result}
                          onClick={(e) => { e.stopPropagation(); setActiveFormulaId(token.id); }}
                          onChange={(e) => handleFormulaSlotChange(token.id, 'result', e.target.value)}
                          className="text-center font-extrabold text-emerald-950 bg-emerald-100/90 border border-emerald-300 rounded px-1 text-xs font-mono outline-none"
                          style={{ width: `${Math.max(28, (struct.result || '').length * 9 + 8)}px` }}
                        />
                        <span>%</span>
                      </span>
                    ) : (
                      /* SUB-WIDGET 6: GENERIC LATEX (LIVE KATEX OR INLINE LATEX INPUT WHEN ACTIVE) */
                      isActive ? (
                        <span className="inline-flex items-center gap-1.5 p-1 bg-white rounded-lg border border-indigo-300 shadow-sm">
                          <input
                            type="text"
                            value={token.latex}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newLatex = e.target.value;
                              const updated = tokens.map(t => t.id === token.id ? {
                                ...t,
                                latex: newLatex,
                                structure: parseEquationStructure(newLatex)
                              } : t);
                              commitTokens(updated);
                            }}
                            className="font-mono text-xs text-indigo-900 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            style={{ width: `${Math.max(100, token.latex.length * 8 + 20)}px` }}
                            placeholder="Mã LaTeX..."
                          />
                          <span
                            className="text-xs px-1 text-slate-800"
                            dangerouslySetInnerHTML={{ __html: renderKatexHtml(token.latex, false) }}
                          />
                        </span>
                      ) : (
                        <span
                          dangerouslySetInnerHTML={{ __html: renderKatexHtml(token.latex, token.displayMode) }}
                        />
                      )
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-2xs"></span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Document Status Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono">
              Tổng số khối: {tokens.length}
            </span>
            <span>•</span>
            <span className="text-slate-600">
              Số công thức tương tác: <strong>{tokens.filter(t => t.isFormula).length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInsertTemplate1Click('fraction')}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chèn thêm công thức</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
