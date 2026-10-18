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
  Edit2
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

  // 1. Chemistry CM: C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}
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

  // 2. Chemistry C%: C\% = \frac{m_{ct}}{m_{dd}} \times 100\% = 10\%
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

  // 3. Fraction: \frac{A}{B} = C or \frac{A}{B}
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
 * Tokenize a single line of text into plain text chunks and explicit $...$ / $$...$$ formula tokens
 */
function tokenizeLine(lineText, lineIdx) {
  if (lineText === '' || lineText === undefined) {
    return [{
      id: `line-${lineIdx}-tok-0`,
      isFormula: false,
      text: ''
    }];
  }
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  const parts = lineText.split(regex);
  const tokens = [];

  parts.forEach((part, partIdx) => {
    if (!part) return;
    const uniqueId = `line-${lineIdx}-tok-${partIdx}`;
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const latex = part.slice(2, -2).trim();
      tokens.push({
        id: uniqueId,
        isFormula: true,
        displayMode: true,
        latex,
        structure: parseEquationStructure(latex)
      });
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const latex = part.slice(1, -1).trim();
      tokens.push({
        id: uniqueId,
        isFormula: true,
        displayMode: false,
        latex,
        structure: parseEquationStructure(latex)
      });
    } else {
      tokens.push({
        id: uniqueId,
        isFormula: false,
        text: part
      });
    }
  });

  return tokens;
}

/**
 * Parse full document into Lines, each containing its tokens
 */
function parseDocumentLines(rawText) {
  if (!rawText) return [];
  const rawLines = String(rawText).split('\n');
  return rawLines.map((line, lineIdx) => {
    const isHeading = line.trim().startsWith('###') || line.trim().startsWith('##') || line.trim().startsWith('#');
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
    return {
      id: `line-${lineIdx}`,
      lineIdx,
      raw: line,
      isHeading,
      isBullet,
      tokens: tokenizeLine(line, lineIdx)
    };
  });
}

/**
 * Reassemble document lines back to raw Markdown/LaTeX
 */
function serializeDocumentLines(lines) {
  return lines.map(line => {
    return line.tokens.map(t => {
      if (!t.isFormula) return t.text;
      const latex = t.structure ? buildLatexFromStructure(t.structure) : t.latex;
      return t.displayMode ? `$$${latex}$$` : `$${latex}$`;
    }).join('');
  }).join('\n');
}

/**
 * Compact Quick Math Symbols for Floating Bubble
 */
const QUICK_BUBBLE_SYMBOLS = [
  { label: '+', code: '+' },
  { label: '−', code: '-' },
  { label: '×', code: '\\times ' },
  { label: '÷', code: '\\div ' },
  { label: '±', code: '\\pm ' },
  { label: '√', code: '\\sqrt{x}' },
  { label: 'x²', code: '^2' },
  { label: 'π', code: '\\pi ' },
  { label: 'Δ', code: '\\Delta ' },
  { label: '∞', code: '\\infty ' },
  { label: '≠', code: '\\neq ' },
  { label: '≈', code: '\\approx ' },
  { label: '→', code: '\\rightarrow ' },
  { label: '⇔', code: '\\Leftrightarrow ' }
];

/**
 * RE-ENGINEERED WORD-STYLE FORMULA CANVAS
 * Fixes all visual layout hopping, oversized footprints, and cluttered duplicate toolbars.
 * Features:
 * 1. Strict Paragraph/Line flow: Text flows naturally with inline-block formulas (no jumpy flex-wrap).
 * 2. Minimalist formula footprint: In idle state, formulas blend seamlessly into the sentence font size.
 * 3. In-place micro slot editing: Click to edit numbers in-place without expanding line-height.
 * 4. Floating Math Bubble: Micro actions right above the active token.
 */
export default function WordStyleFormulaCanvas({
  content,
  onChange,
  placeholder = "Nhập nội dung bài giảng tại đây...",
  accentColor = "cyan"
}) {
  const [docLines, setDocLines] = useState(() => parseDocumentLines(content || ''));
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const activeFormulaRef = useRef(null);
  const containerRef = useRef(null);

  // Sync incoming content if changed externally
  useEffect(() => {
    const currentSerialized = serializeDocumentLines(docLines);
    if (content !== currentSerialized) {
      setDocLines(parseDocumentLines(content || ''));
    }
  }, [content]);

  // Update floating bubble position relative to active formula element
  useEffect(() => {
    if (activeFormulaId && activeFormulaRef.current && containerRef.current) {
      const formulaRect = activeFormulaRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setBubblePos({
        top: formulaRect.top - containerRect.top - 42,
        left: Math.max(8, formulaRect.left - containerRect.left + (formulaRect.width / 2) - 130)
      });
    }
  }, [activeFormulaId]);

  // Propagate changes upstream
  const commitDocLines = (newLines) => {
    setDocLines(newLines);
    const serialized = serializeDocumentLines(newLines);
    if (onChange) onChange(serialized);
  };

  // Modify text token on line
  const handleTextChange = (lineId, tokenId, newText) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const nextTokens = line.tokens.map(t => t.id === tokenId ? { ...t, text: newText } : t);
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Insert new line after target line (triggered by Enter key)
  const handleInsertNewLineAfter = (targetLineId) => {
    const idx = docLines.findIndex(l => l.id === targetLineId);
    const newLine = {
      id: `line-${Date.now()}`,
      lineIdx: idx + 1,
      raw: '',
      isHeading: false,
      isBullet: false,
      tokens: [{ id: `line-${Date.now()}-tok-0`, isFormula: false, text: '' }]
    };
    if (idx === -1) {
      commitDocLines([...docLines, newLine]);
    } else {
      commitDocLines([
        ...docLines.slice(0, idx + 1),
        newLine,
        ...docLines.slice(idx + 1)
      ]);
    }
  };

  // Add new line at bottom
  const handleAddNewLine = () => {
    const newLine = {
      id: `line-${Date.now()}`,
      lineIdx: docLines.length,
      raw: '',
      isHeading: false,
      isBullet: false,
      tokens: [{ id: `line-${Date.now()}-tok-0`, isFormula: false, text: '' }]
    };
    commitDocLines([...docLines, newLine]);
  };

  // Modify formula slot value
  const handleSlotChange = (lineId, tokenId, field, val) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const nextTokens = line.tokens.map(t => {
        if (t.id !== tokenId) return t;
        const nextStruct = { ...t.structure, [field]: val };
        return {
          ...t,
          structure: nextStruct,
          latex: buildLatexFromStructure(nextStruct)
        };
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Modify generic formula latex
  const handleGenericLatexChange = (lineId, tokenId, newLatex) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const nextTokens = line.tokens.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          latex: newLatex,
          structure: parseEquationStructure(newLatex)
        };
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Auto-calculate formula numbers
  const handleAutoCalc = (lineId, tokenId) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const nextTokens = line.tokens.map(t => {
        if (t.id !== tokenId) return t;
        if (t.structure.type === 'FRACTION') {
          const res = safeCalcDivision(t.structure.num, t.structure.den);
          const nextStruct = { ...t.structure, hasEqual: true, result: res };
          return { ...t, structure: nextStruct, latex: buildLatexFromStructure(nextStruct) };
        } else if (t.structure.type === 'CHEM_CM') {
          const res = safeCalcDivision(t.structure.num, t.structure.den);
          const nextStruct = { ...t.structure, result: res };
          return { ...t, structure: nextStruct, latex: buildLatexFromStructure(nextStruct) };
        } else if (t.structure.type === 'SQRT') {
          const val = parseFloat(t.structure.expr);
          if (!isNaN(val) && val >= 0) {
            const res = Math.sqrt(val);
            const formatted = Number.isInteger(res) ? `${res}` : `${res.toFixed(2)}`;
            const nextLatex = `\\sqrt{${t.structure.expr}} = ${formatted}`;
            return { ...t, latex: nextLatex, structure: { type: 'GENERIC', raw: nextLatex } };
          }
        }
        return t;
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Delete active formula
  const handleDeleteActiveFormula = (lineId, tokenId) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      return { ...line, tokens: line.tokens.filter(t => t.id !== tokenId) };
    });
    setActiveFormulaId(null);
    commitDocLines(updated);
  };

  // Insert quick symbol into active formula
  const handleInsertSymbolIntoActive = (symbolCode) => {
    if (!activeFormulaId) return;
    const updated = docLines.map(line => {
      const targetToken = line.tokens.find(t => t.id === activeFormulaId);
      if (!targetToken) return line;

      const nextTokens = line.tokens.map(t => {
        if (t.id !== activeFormulaId) return t;
        const nextLatex = (t.latex || '') + symbolCode;
        return {
          ...t,
          latex: nextLatex,
          structure: parseEquationStructure(nextLatex)
        };
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Find active token object
  let activeTokenInfo = null;
  docLines.forEach(line => {
    const found = line.tokens.find(t => t.id === activeFormulaId);
    if (found) {
      activeTokenInfo = { lineId: line.id, token: found };
    }
  });

  return (
    <div className="relative font-sans text-slate-800" ref={containerRef}>
      
      {/* FLOATING MATH BUBBLE TOOLBAR (Micro footprint, only shows when formula active) */}
      {activeFormulaId && activeTokenInfo && (
        <div
          style={{
            position: 'absolute',
            top: `${Math.max(6, bubblePos.top)}px`,
            left: `${Math.max(8, bubblePos.left)}px`,
            zIndex: 40
          }}
          className="bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-xl border border-slate-700/80 px-2 py-1 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 border-r border-slate-700 pr-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sửa:</span>
          </div>

          {/* Quick symbol chips */}
          <div className="flex items-center gap-0.5 max-w-[210px] overflow-x-auto scrollbar-none py-0.5">
            {QUICK_BUBBLE_SYMBOLS.slice(0, 8).map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleInsertSymbolIntoActive(s.code)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono cursor-pointer transition-colors"
                title={`Chèn ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
            {(activeTokenInfo.token.structure?.type === 'FRACTION' || activeTokenInfo.token.structure?.type === 'CHEM_CM' || activeTokenInfo.token.structure?.type === 'SQRT') && (
              <button
                type="button"
                onClick={() => handleAutoCalc(activeTokenInfo.lineId, activeTokenInfo.token.id)}
                className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                title="Tự tính kết quả số"
              >
                <Zap className="w-2.5 h-2.5 fill-slate-950" />
                <span>Tính</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDeleteActiveFormula(activeTokenInfo.lineId, activeTokenInfo.token.id)}
              className="p-1 rounded-lg hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
              title="Xóa công thức"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => setActiveFormulaId(null)}
              className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              <Check className="w-2.5 h-2.5" />
              <span>Xong</span>
            </button>
          </div>
        </div>
      )}

      {/* THE ACTUAL DOCUMENT CANVAS (Standard typography, natural paragraph flow) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 min-h-[380px] text-[14px] leading-relaxed select-text space-y-2">
        {docLines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            {placeholder}
          </div>
        ) : (
          docLines.map((line) => {
            const isHeading = line.isHeading;
            const isBullet = line.isBullet;

            return (
              <div
                key={line.id}
                className={`transition-colors rounded px-1.5 py-0.5 ${
                  isHeading
                    ? 'font-bold text-slate-900 text-[15px] mt-3 mb-1 border-b border-slate-100 pb-1'
                    : isBullet
                    ? 'pl-3 relative text-[13.5px] text-slate-800 my-0.5'
                    : 'text-[13.5px] text-slate-800 my-0.5'
                }`}
              >
                {line.tokens.map((token) => {
                  // CASE 1: PLAIN TEXT CHUNK (NATURAL INLINE FLOW, NO LINE HOPPING)
                  if (!token.isFormula) {
                    return (
                      <span
                        key={token.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange(line.id, token.id, e.currentTarget.textContent || '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInsertNewLineAfter(line.id);
                          }
                        }}
                        className="outline-none focus:bg-cyan-50/50 rounded-xs transition-colors whitespace-pre-wrap font-sans align-baseline min-w-[6px] inline-block"
                      >
                        {token.text}
                      </span>
                    );
                  }

                  // CASE 2: FORMULA TOKEN (COMPACT INLINE FOOTPRINT)
                  const isActive = token.id === activeFormulaId;
                  const struct = token.structure;

                  // ACTIVE EDITING STATE: MINIMALIST SLOT BOX
                  if (isActive) {
                    return (
                      <span
                        key={token.id}
                        ref={activeFormulaRef}
                        className="inline-flex items-center align-middle mx-0.5 px-1 py-0.5 bg-amber-50/90 ring-1 ring-amber-400 rounded-lg shadow-2xs z-30"
                      >
                        {struct?.type === 'FRACTION' ? (
                          /* COMPACT FRACTION SLOTS */
                          <span className="inline-flex items-center gap-0.5 text-xs">
                            <span className="inline-flex flex-col items-center justify-center">
                              <input
                                type="text"
                                value={struct.num}
                                onChange={(e) => handleSlotChange(line.id, token.id, 'num', e.target.value)}
                                className="text-center font-bold text-amber-950 bg-white border border-amber-300 rounded px-1 py-0 text-[11px] font-mono outline-none"
                                style={{ width: `${Math.max(20, (struct.num || '').length * 8 + 8)}px` }}
                              />
                              <span className="w-full h-[1px] bg-slate-700 my-0.5"></span>
                              <input
                                type="text"
                                value={struct.den}
                                onChange={(e) => handleSlotChange(line.id, token.id, 'den', e.target.value)}
                                className="text-center font-bold text-cyan-950 bg-white border border-cyan-300 rounded px-1 py-0 text-[11px] font-mono outline-none"
                                style={{ width: `${Math.max(20, (struct.den || '').length * 8 + 8)}px` }}
                              />
                            </span>
                            {(struct.hasEqual || struct.result) && (
                              <span className="inline-flex items-center gap-0.5 font-bold text-slate-700 ml-0.5 text-xs">
                                <span>=</span>
                                <input
                                  type="text"
                                  value={struct.result}
                                  onChange={(e) => handleSlotChange(line.id, token.id, 'result', e.target.value)}
                                  className="text-center font-extrabold text-emerald-900 bg-white border border-emerald-300 rounded px-1 py-0 text-[11px] font-mono outline-none"
                                  style={{ width: `${Math.max(22, (struct.result || '').length * 8 + 8)}px` }}
                                />
                              </span>
                            )}
                          </span>
                        ) : struct?.type === 'POWER' ? (
                          /* COMPACT POWER SLOTS */
                          <span className="inline-flex items-baseline gap-0.5 text-xs">
                            <input
                              type="text"
                              value={struct.base}
                              onChange={(e) => handleSlotChange(line.id, token.id, 'base', e.target.value)}
                              className="text-center font-bold text-indigo-950 bg-white border border-indigo-300 rounded px-1 py-0 text-[11px] font-mono outline-none"
                              style={{ width: `${Math.max(16, (struct.base || '').length * 8 + 6)}px` }}
                            />
                            <input
                              type="text"
                              value={struct.exp}
                              onChange={(e) => handleSlotChange(line.id, token.id, 'exp', e.target.value)}
                              className="text-center font-extrabold text-rose-950 bg-white border border-rose-300 rounded px-0.5 py-0 text-[10px] font-mono -translate-y-1 outline-none"
                              style={{ width: `${Math.max(14, (struct.exp || '').length * 7 + 6)}px` }}
                            />
                          </span>
                        ) : struct?.type === 'SQRT' ? (
                          /* COMPACT SQRT SLOT */
                          <span className="inline-flex items-center gap-0.5 text-xs font-mono">
                            <span className="text-sm font-serif">√</span>
                            <input
                              type="text"
                              value={struct.expr}
                              onChange={(e) => handleSlotChange(line.id, token.id, 'expr', e.target.value)}
                              className="text-center font-bold text-emerald-950 bg-white border-b border-emerald-500 rounded-t px-1 py-0 text-[11px] outline-none"
                              style={{ width: `${Math.max(20, (struct.expr || '').length * 8 + 8)}px` }}
                            />
                          </span>
                        ) : (
                          /* GENERIC SHORT INLINE INPUT */
                          <input
                            type="text"
                            value={token.latex}
                            onChange={(e) => handleGenericLatexChange(line.id, token.id, e.target.value)}
                            className="font-mono text-center text-xs font-bold bg-white text-slate-900 border border-amber-400 rounded px-1.5 py-0 outline-none shadow-2xs"
                            style={{ width: `${Math.max(32, token.latex.length * 8 + 14)}px` }}
                          />
                        )}
                      </span>
                    );
                  }

                  // IDLE NATURAL STATE: ZERO OVERSIZED PADDING, SEAMLESS INLINE FLOW
                  return (
                    <span
                      key={token.id}
                      onClick={() => setActiveFormulaId(token.id)}
                      className="inline-block align-baseline mx-0.5 px-0.5 py-0 rounded-xs border-b border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/70 text-[13.5px] cursor-pointer transition-colors"
                      title="Nhấp để sửa số hoặc ký hiệu trực tiếp trên công thức"
                      dangerouslySetInnerHTML={{ __html: renderKatexHtml(token.latex, false) }}
                    />
                  );
                })}
              </div>
            );
          })
        )}

        {/* BOTTOM QUICK ACTIONS FOR CANVAS */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={handleAddNewLine}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>+ Thêm dòng mới</span>
          </button>
          <span className="text-[11px] text-slate-400 italic">
            💡 Gõ bình thường như Word • Bấm Enter để xuống dòng • Nhấp vào công thức để sửa số tại chỗ
          </span>
        </div>
      </div>

    </div>
  );
}
