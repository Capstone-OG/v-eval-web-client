import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Calculator, 
  FlaskConical, 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  Zap, 
  BookOpen,
  FileEdit,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { renderKatexHtml, unescapeLiteralNewlines } from '../common/MathText';

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
 * Sanitize a single line of text by stripping any accidental trailing backslashes
 * (e.g. text\ or text\\ or text\ ) that cause ugly '\' or '/' at the line ends
 */
export function sanitizeLineText(text) {
  if (!text) return '';
  return String(text).replace(/\\+\s*$/, '').trimEnd();
}

/**
 * Parse an equation string into known editable structures
 */
export function parseEquationStructure(latex) {
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
export function buildLatexFromStructure(struct) {
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
  const cleanLine = sanitizeLineText(lineText);
  if (cleanLine === '' || cleanLine === undefined) {
    return [{
      id: `line-${lineIdx}-tok-0`,
      isFormula: false,
      text: ''
    }];
  }
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  const parts = cleanLine.split(regex);
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

  return tokens.length > 0 ? tokens : [{ id: `line-${lineIdx}-tok-0`, isFormula: false, text: '' }];
}

/**
 * Parse full document into Lines, each containing its tokens
 */
function parseDocumentLines(rawText) {
  if (!rawText) return [];
  const normalized = unescapeLiteralNewlines(String(rawText));
  const rawLines = normalized.split('\n');

  return rawLines.map((line, lineIdx) => {
    const clean = sanitizeLineText(line);
    const isHeading = clean.trim().startsWith('###') || clean.trim().startsWith('##') || clean.trim().startsWith('#');
    const isBullet = clean.trim().startsWith('- ') || clean.trim().startsWith('* ') || clean.trim().startsWith('• ');
    return {
      id: `line-${lineIdx}`,
      lineIdx,
      raw: clean,
      isHeading,
      isBullet,
      tokens: tokenizeLine(clean, lineIdx)
    };
  });
}

/**
 * Reassemble document lines back to raw Markdown/LaTeX
 */
function serializeDocumentLines(lines) {
  return lines.map(line => {
    const assembled = line.tokens.map(t => {
      if (!t.isFormula) return t.text;
      const latex = t.structure ? buildLatexFromStructure(t.structure) : t.latex;
      return t.displayMode ? `$$${latex}$$` : `$${latex}$`;
    }).join('');
    return sanitizeLineText(assembled);
  }).join('\n');
}

/**
 * Compact Quick Math Symbols for Floating Bubble
 */
export const HIERARCHICAL_BUBBLE_INSERTER = {
  structures: {
    name: '📐 Cấu trúc',
    items: [
      { label: 'a/b', code: '\\frac{a}{b}', title: 'Phân số a/b' },
      { label: '√x', code: '\\sqrt{x}', title: 'Căn bậc hai' },
      { label: 'ⁿ√x', code: '\\sqrt[n]{x}', title: 'Căn bậc n' },
      { label: 'x²', code: '^2', title: 'Bình phương' },
      { label: 'xⁿ', code: '^{n}', title: 'Số mũ tổng quát' },
      { label: 'x₀', code: '_0', title: 'Chỉ số dưới' },
      { label: '|x|', code: '|x|', title: 'Trị tuyệt đối' },
      { label: 'y\'', code: 'y\'', title: 'Đạo hàm' },
      { label: '∫', code: '\\int', title: 'Tích phân' },
      { label: 'lim', code: '\\lim_{x \\to x_0}', title: 'Giới hạn' },
      { label: '∑', code: '\\sum', title: 'Tổng' },
      { label: 'v⃗', code: '\\vec{v}', title: 'Vectơ' }
    ]
  },
  chem: {
    name: '🧪 Hóa học',
    items: [
      { label: 'CM', code: 'C_M = \\frac{n}{V}', title: 'Nồng độ CM' },
      { label: 'C%', code: 'C\\%', title: 'Nồng độ C%' },
      { label: 'H₂SO₄', code: 'H_2SO_4', title: 'Axit H2SO4' },
      { label: 'HCl', code: 'HCl', title: 'Axit Clohidric' },
      { label: 'HNO₃', code: 'HNO_3', title: 'Axit Nitric' },
      { label: 'NaOH', code: 'NaOH', title: 'Natri Hidroxit' },
      { label: 'SO₄²⁻', code: 'SO_4^{2-}', title: 'Ion Sunfat' },
      { label: 'OH⁻', code: 'OH^-', title: 'Ion Hidroxit' },
      { label: 'Fe³⁺', code: 'Fe^{3+}', title: 'Ion Sắt III' },
      { label: '0', code: '0', title: 'Số oxi hóa 0' },
      { label: '+1', code: '+1', title: 'Số oxi hóa +1' },
      { label: '+2', code: '+2', title: 'Số oxi hóa +2' },
      { label: '+6', code: '+6', title: 'Số oxi hóa +6' },
      { label: '-2', code: '-2', title: 'Số oxi hóa -2' },
      { label: '→', code: '\\rightarrow ', title: 'Phản ứng 1 chiều' },
      { label: '⇌', code: '\\rightleftharpoons ', title: 'Thuận nghịch' },
      { label: '↑', code: '\\uparrow ', title: 'Khí thoát' },
      { label: '↓', code: '\\downarrow ', title: 'Kết tủa' }
    ]
  },
  symbols: {
    name: '🔣 Ký hiệu',
    items: [
      { label: '±', code: '\\pm ', title: 'Cộng trừ' },
      { label: '×', code: '\\times ', title: 'Dấu nhân' },
      { label: '÷', code: '\\div ', title: 'Dấu chia' },
      { label: '≠', code: '\\neq ', title: 'Khác' },
      { label: '≈', code: '\\approx ', title: 'Xấp xỉ' },
      { label: '≤', code: '\\le ', title: 'Nhỏ hơn bằng' },
      { label: '≥', code: '\\ge ', title: 'Lớn hơn bằng' },
      { label: '∞', code: '\\infty ', title: 'Vô cực' },
      { label: '·', code: '\\cdot ', title: 'Chấm nhân' },
      { label: 'π', code: '\\pi ', title: 'Số Pi' },
      { label: 'Δ', code: '\\Delta ', title: 'Delta' },
      { label: 'α', code: '\\alpha ', title: 'Alpha' },
      { label: 'β', code: '\\beta ', title: 'Beta' },
      { label: 'θ', code: '\\theta ', title: 'Theta' },
      { label: 'λ', code: '\\lambda ', title: 'Lambda' },
      { label: 'Ω', code: '\\Omega ', title: 'Omega' }
    ]
  },
  brackets: {
    name: '🧱 Ngoặc & Logic',
    items: [
      { label: '( )', code: '(x)', title: 'Ngoặc tròn' },
      { label: '[ ]', code: '[x]', title: 'Ngoặc vuông' },
      { label: '{ }', code: '\\{x\\}', title: 'Ngoặc nhọn' },
      { label: '⇒', code: '\\Rightarrow ', title: 'Suy ra' },
      { label: '⇔', code: '\\Leftrightarrow ', title: 'Tương đương' },
      { label: '∈', code: '\\in ', title: 'Thuộc' },
      { label: '∉', code: '\\notin ', title: 'Không thuộc' },
      { label: '∀', code: '\\forall ', title: 'Với mọi' },
      { label: '∃', code: '\\exists ', title: 'Tồn tại' },
      { label: 'ℝ', code: '\\mathbb{R}', title: 'Tập số thực' }
    ]
  }
};

const WordStyleFormulaCanvas = forwardRef(function WordStyleFormulaCanvas({
  content,
  onChange,
  placeholder = "Nhập nội dung bài giảng tại đây...",
  accentColor = "cyan"
}, ref) {
  const [docLines, setDocLines] = useState(() => parseDocumentLines(content || ''));
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [bubbleTab, setBubbleTab] = useState('structures');
  
  const activeFormulaRef = useRef(null);
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  // Active cursor tracking for precise insertion at cursor location
  const activePositionRef = useRef({
    lineId: null,
    tokenId: null,
    offset: 0
  });

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

  // Record active caret position inside an editable span
  const updateActiveCaret = (lineId, tokenId) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      activePositionRef.current = {
        lineId,
        tokenId,
        offset: range.startOffset
      };
    } else {
      activePositionRef.current = {
        lineId,
        tokenId,
        offset: 0
      };
    }
  };

  /**
   * REQUIREMENT 4: Click on line whitespace automatically places cursor at end of line
   */
  const handleLineRowClick = (e, lineId) => {
    // If the user clicked directly on an editable span, an input, or a formula button, let natural focus happen
    if (e.target.closest('[contenteditable="true"]') || e.target.closest('input') || e.target.closest('button')) {
      return;
    }

    // User clicked the whitespace/empty margin of the line
    const lineEl = lineRefs.current[lineId];
    if (!lineEl) return;

    const editableSpans = lineEl.querySelectorAll('[contenteditable="true"]');
    if (editableSpans.length > 0) {
      const lastSpan = editableSpans[editableSpans.length - 1];
      lastSpan.focus();

      // Place caret at the very end of the text
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(lastSpan);
        range.collapse(false); // false = collapse to end
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Update active position
      const targetLine = docLines.find(l => l.id === lineId);
      if (targetLine && targetLine.tokens.length > 0) {
        for (let i = targetLine.tokens.length - 1; i >= 0; i--) {
          if (!targetLine.tokens[i].isFormula) {
            activePositionRef.current = {
              lineId,
              tokenId: targetLine.tokens[i].id,
              offset: (targetLine.tokens[i].text || '').length
            };
            break;
          }
        }
      }
    }
  };

  /**
   * REQUIREMENT 1: INSERT DIRECTLY AT CURSOR (CHÈN NGAY TẠI CON TRỎ, KHÔNG PHẢI VỨT XUỐNG CUỐI)
   * Expose imperative handle so left palette or quick inserter inserts directly where user was typing
   */
  useImperativeHandle(ref, () => ({
    insertSnippet: (latexSnippet) => {
      if (!latexSnippet) return;
      const formulaLatex = latexSnippet.trim();
      const formulaStructure = parseEquationStructure(formulaLatex);

      let targetLineId = activePositionRef.current?.lineId;
      let targetTokenId = activePositionRef.current?.tokenId;
      let caretOffset = activePositionRef.current?.offset ?? 0;

      // If document is empty, initialize first line
      if (docLines.length === 0) {
        const newLId = `line-${Date.now()}`;
        const fId = `tok-f-${Date.now()}`;
        const afterId = `tok-t-${Date.now() + 1}`;
        const newLines = [{
          id: newLId,
          lineIdx: 0,
          raw: '',
          isHeading: false,
          isBullet: false,
          tokens: [
            { id: fId, isFormula: true, displayMode: false, latex: formulaLatex, structure: formulaStructure },
            { id: afterId, isFormula: false, text: ' ' }
          ]
        }];
        commitDocLines(newLines);
        setActiveFormulaId(fId);
        activePositionRef.current = { lineId: newLId, tokenId: afterId, offset: 1 };
        return;
      }

      // If no active line or active line not found in doc, target the last line
      if (!targetLineId || !docLines.some(l => l.id === targetLineId)) {
        const lastLine = docLines[docLines.length - 1];
        targetLineId = lastLine.id;
        const lastTok = lastLine.tokens[lastLine.tokens.length - 1];
        targetTokenId = lastTok?.id;
        caretOffset = (lastTok?.text || '').length;
      }

      const newFormulaId = `tok-f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const formulaToken = {
        id: newFormulaId,
        isFormula: true,
        displayMode: false,
        latex: formulaLatex,
        structure: formulaStructure
      };

      const updatedLines = docLines.map(line => {
        if (line.id !== targetLineId) return line;

        // Find token index
        const tokIdx = line.tokens.findIndex(t => t.id === targetTokenId);
        if (tokIdx === -1) {
          // Append to end of tokens
          const afterId = `tok-t-${Date.now()}`;
          activePositionRef.current = { lineId: line.id, tokenId: afterId, offset: 1 };
          return {
            ...line,
            tokens: [...line.tokens, formulaToken, { id: afterId, isFormula: false, text: ' ' }]
          };
        }

        const currentTok = line.tokens[tokIdx];
        if (currentTok.isFormula) {
          // Insert formula immediately after current formula token
          const afterId = `tok-t-${Date.now()}`;
          activePositionRef.current = { lineId: line.id, tokenId: afterId, offset: 1 };
          const nextTokens = [...line.tokens];
          nextTokens.splice(tokIdx + 1, 0, formulaToken, { id: afterId, isFormula: false, text: ' ' });
          return { ...line, tokens: nextTokens };
        }

        // Text token: split at caretOffset
        const textVal = currentTok.text || '';
        const safeOffset = Math.min(caretOffset, textVal.length);
        const beforeText = textVal.slice(0, safeOffset);
        const afterText = textVal.slice(safeOffset);

        const afterId = `tok-after-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`;
        const nextTokens = [...line.tokens];

        const replacements = [
          { ...currentTok, text: beforeText },
          formulaToken,
          { id: afterId, isFormula: false, text: afterText.startsWith(' ') ? afterText : ` ${afterText}` }
        ];

        nextTokens.splice(tokIdx, 1, ...replacements);
        activePositionRef.current = { lineId: line.id, tokenId: afterId, offset: 1 };
        return { ...line, tokens: nextTokens };
      });

      commitDocLines(updatedLines);
      setActiveFormulaId(newFormulaId);
    }
  }));

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
    const newLId = `line-${Date.now()}`;
    const newTokId = `tok-${Date.now()}`;
    const newLine = {
      id: newLId,
      lineIdx: idx + 1,
      raw: '',
      isHeading: false,
      isBullet: false,
      tokens: [{ id: newTokId, isFormula: false, text: '' }]
    };

    let nextLines;
    if (idx === -1) {
      nextLines = [...docLines, newLine];
    } else {
      nextLines = [
        ...docLines.slice(0, idx + 1),
        newLine,
        ...docLines.slice(idx + 1)
      ];
    }
    commitDocLines(nextLines);

    // Auto-focus the newly created line
    setTimeout(() => {
      const lineEl = lineRefs.current[newLId];
      if (lineEl) {
        const span = lineEl.querySelector('[contenteditable="true"]');
        if (span) {
          span.focus();
          activePositionRef.current = { lineId: newLId, tokenId: newTokId, offset: 0 };
        }
      }
    }, 20);
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
      
      {/* HIERARCHICAL FORMULA QUICK INSPECTOR & INSERTER */}
      {activeFormulaId && activeTokenInfo && (
        <div
          style={{
            position: 'absolute',
            top: `${Math.max(6, bubblePos.top)}px`,
            left: `${Math.max(8, bubblePos.left)}px`,
            zIndex: 50
          }}
          className="bg-white/98 text-slate-900 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-cyan-500/80 p-2.5 flex flex-col gap-2 min-w-[340px] max-w-[440px] animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Row 1: Header with Live KaTeX Preview & Actions */}
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-bold">
                {activeTokenInfo.token.structure?.type === 'FRACTION' ? 'Phân Số' :
                 activeTokenInfo.token.structure?.type === 'CHEM_CM' ? 'Nồng Độ CM' :
                 activeTokenInfo.token.structure?.type === 'CHEM_CPERCENT' ? 'Nồng Độ C%' :
                 activeTokenInfo.token.structure?.type === 'POWER' ? 'Số Mũ' :
                 activeTokenInfo.token.structure?.type === 'SQRT' ? 'Căn Thức' : 'Công Thức'}
              </span>
              <div 
                className="text-xs text-cyan-900 font-serif max-w-[140px] overflow-hidden truncate"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(activeTokenInfo.token.latex || 'x', false) }}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {(activeTokenInfo.token.structure?.type === 'FRACTION' || activeTokenInfo.token.structure?.type === 'CHEM_CM' || activeTokenInfo.token.structure?.type === 'SQRT') && (
                <button
                  type="button"
                  onClick={() => handleAutoCalc(activeTokenInfo.lineId, activeTokenInfo.token.id)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10.5px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
                  title="Tự tính kết quả số"
                >
                  <Zap className="w-2.5 h-2.5 fill-slate-950" />
                  <span>Tính</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDeleteActiveFormula(activeTokenInfo.lineId, activeTokenInfo.token.id)}
                className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                title="Xóa công thức"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveFormulaId(null)}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-0.5 cursor-pointer shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Xong</span>
              </button>
            </div>
          </div>

          {/* Row 2: Hierarchical Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {Object.keys(HIERARCHICAL_BUBBLE_INSERTER).map((tabKey) => {
              const tab = HIERARCHICAL_BUBBLE_INSERTER[tabKey];
              const isAct = bubbleTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setBubbleTab(tabKey)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isAct 
                      ? 'bg-cyan-600 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Row 3: Quick Insertion Chips of Active Tab */}
          <div className="flex flex-wrap items-center gap-1 max-h-[68px] overflow-y-auto scrollbar-thin p-1 rounded-lg bg-slate-50 border border-slate-200">
            {HIERARCHICAL_BUBBLE_INSERTER[bubbleTab]?.items?.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbolIntoActive(item.code)}
                className="px-1.5 py-0.5 rounded bg-white hover:bg-cyan-100 hover:text-cyan-800 border border-slate-200 text-slate-700 text-[10.5px] font-mono cursor-pointer transition-colors shadow-2xs"
                title={`${item.title} (Nhấp để chèn)`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Row 4: Direct LaTeX Input Line for Ultimate Flexibility */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
            <span className="text-[10px] font-bold text-cyan-700 font-mono shrink-0">LaTeX:</span>
            <input
              type="text"
              value={activeTokenInfo.token.latex}
              onChange={(e) => handleGenericLatexChange(activeTokenInfo.lineId, activeTokenInfo.token.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setActiveFormulaId(null);
                }
              }}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-cyan-500 rounded px-2 py-0.5 text-[11px] font-mono text-cyan-900 outline-none transition-colors"
              placeholder="Gõ hoặc dán mã LaTeX..."
            />
          </div>
        </div>
      )}

      {/* THE ACTUAL DOCUMENT CANVAS */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 min-h-[380px] text-[14px] leading-relaxed select-text space-y-2 cursor-text">
        {docLines.length === 0 ? (
          <div 
            onClick={() => handleInsertNewLineAfter(null)}
            className="py-12 text-center text-slate-400 text-xs italic cursor-pointer hover:text-slate-600"
          >
            {placeholder} (Nhấp vào đây để bắt đầu soạn bài giảng)
          </div>
        ) : (
          docLines.map((line) => {
            const isHeading = line.isHeading;
            const isBullet = line.isBullet;

            // Safe icon badges for pedagogic headings (replaces broken emojis)
            const isPin = line.raw?.includes('### 📌') || line.raw?.startsWith('📌');
            const isSample = line.raw?.includes('### 📝') || line.raw?.includes('### 📄') || line.raw?.includes('### ✍️') || line.raw?.startsWith('📝') || line.raw?.startsWith('📄');
            const isTrap = line.raw?.includes('### ⚠️') || line.raw?.startsWith('⚠️');
            const isTip = line.raw?.includes('### 💡') || line.raw?.startsWith('💡');

            return (
              <div
                key={line.id}
                ref={(el) => { lineRefs.current[line.id] = el; }}
                onClick={(e) => handleLineRowClick(e, line.id)}
                className={`transition-colors rounded px-1.5 py-0.5 cursor-text ${
                  isHeading
                    ? isPin
                      ? 'font-bold text-teal-900 bg-teal-50/70 border border-teal-200/80 rounded-xl p-2 my-2 text-[14px]'
                      : isSample
                      ? 'font-bold text-amber-950 bg-amber-50/80 border border-amber-300/80 rounded-xl p-2 my-2 text-[14px]'
                      : isTrap
                      ? 'font-bold text-rose-950 bg-rose-50/80 border border-rose-300/80 rounded-xl p-2 my-2 text-[14px]'
                      : isTip
                      ? 'font-bold text-indigo-950 bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-2 my-2 text-[14px]'
                      : 'font-bold text-slate-900 text-[15px] mt-3 mb-1 border-b border-slate-100 pb-1'
                    : isBullet
                    ? 'pl-3 relative text-[13.5px] text-slate-800 my-0.5'
                    : 'text-[13.5px] text-slate-800 my-0.5'
                }`}
              >
                {/* SVG badge icon in headings to eliminate broken emoji display */}
                {isPin && <BookOpen className="w-4 h-4 text-teal-600 inline mr-1.5 -translate-y-0.5 shrink-0" />}
                {isSample && <FileEdit className="w-4 h-4 text-amber-600 inline mr-1.5 -translate-y-0.5 shrink-0" />}
                {isTrap && <AlertTriangle className="w-4 h-4 text-rose-600 inline mr-1.5 -translate-y-0.5 shrink-0" />}
                {isTip && <Sparkles className="w-4 h-4 text-indigo-600 inline mr-1.5 -translate-y-0.5 shrink-0" />}

                {line.tokens.map((token) => {
                  // CASE 1: PLAIN TEXT CHUNK (NATURAL INLINE FLOW, NO LINE HOPPING)
                  if (!token.isFormula) {
                    // Clean heading prefix symbols from text display if icon is already shown
                    let displayText = token.text;
                    if (isPin) displayText = displayText.replace(/^###\s*📌?\s*/, '').replace(/^📌\s*/, '');
                    if (isSample) displayText = displayText.replace(/^###\s*[📝📄✍️]?\s*/, '').replace(/^[📝📄✍️]\s*/, '');
                    if (isTrap) displayText = displayText.replace(/^###\s*⚠️?\s*/, '').replace(/^⚠️\s*/, '');
                    if (isTip) displayText = displayText.replace(/^###\s*💡?\s*/, '').replace(/^💡\s*/, '');

                    return (
                      <span
                        key={token.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange(line.id, token.id, e.currentTarget.textContent || '')}
                        onKeyUp={() => updateActiveCaret(line.id, token.id)}
                        onMouseUp={() => updateActiveCaret(line.id, token.id)}
                        onFocus={() => updateActiveCaret(line.id, token.id)}
                        onInput={() => updateActiveCaret(line.id, token.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInsertNewLineAfter(line.id);
                          }
                        }}
                        className="outline-none focus:bg-cyan-50/50 rounded-xs transition-colors whitespace-pre-wrap font-sans align-baseline min-w-[6px] inline-block"
                      >
                        {displayText}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFormulaId(token.id);
                        activePositionRef.current = {
                          lineId: line.id,
                          tokenId: token.id,
                          offset: 0
                        };
                      }}
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

        {/* REQUIREMENT 5: REMOVED "+ THÊM DÒNG MỚI" BUTTON (ENTER KEY NATURALLY CREATES NEW LINE) */}
        <div className="flex items-center justify-end pt-3 mt-3 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400 italic">
            💡 Gõ văn bản như Word • Bấm Enter để xuống dòng • Nhấp khoảng trống tự nhảy trỏ về cuối dòng • Nhấp công thức để sửa số tại chỗ
          </span>
        </div>
      </div>

    </div>
  );
});

export default WordStyleFormulaCanvas;
