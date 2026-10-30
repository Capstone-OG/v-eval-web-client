import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  Sparkles, 
  Check, 
  Trash2, 
  Zap, 
  BookOpen, 
  FileEdit, 
  AlertTriangle 
} from 'lucide-react';
import { renderKatexHtml, normalizeMathString, unescapeLiteralNewlines } from '../common/MathText';
import VariationTable, { parseVariationTableString } from '../common/VariationTable';
import InteractiveMathRenderer from '../common/InteractiveMathRenderer';

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
 * Automatically calculates and evaluates arithmetic or fractions in any math equation
 * Examples:
 * - "\frac{12}{4}" -> "\frac{12}{4} = 3"
 * - "\frac{12}{4} = 5" -> "\frac{12}{4} = 3" (updates wrong result)
 * - "C_M = \frac{0.2}{0.5}" -> "C_M = \frac{0.2}{0.5} = 0.4\text{ M}"
 * - "C\% = \frac{20}{200} \times 100\%" -> "C\% = \frac{20}{200} \times 100\% = 10\%"
 * - "\sqrt{16}" -> "\sqrt{16} = 4"
 * - "12/4" -> "12/4 = 3"
 * - "10 + 2 * 5" -> "10 + 2 * 5 = 20"
 */
export function autoCalculateEquation(latex) {
  if (!latex || typeof latex !== 'string') return latex;
  const str = latex.trim();

  // 1. Chemistry CM: C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}
  const chemCmMatch = str.match(/C_M\s*=\s*(?:\\frac\{n\}\{V\}\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}(?:\s*=\s*[^\\$]+)?/);
  if (chemCmMatch) {
    const num = parseFloat(chemCmMatch[1]);
    const den = parseFloat(chemCmMatch[2]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      const val = num / den;
      const formatted = Number.isInteger(val) ? `${val}` : val.toFixed(2).replace(/\.00$/, '');
      return `C_M = \\frac{n}{V} = \\frac{${chemCmMatch[1]}}{${chemCmMatch[2]}} = ${formatted}\\text{ M}`;
    }
  }

  // 2. Chemistry C%: C\% = \frac{m_{ct}}{m_{dd}} \times 100\% = \frac{20}{200} \times 100\% = 10\%
  const chemCpMatch = str.match(/C\\%\s*=\s*(?:\\frac\{m_\{ct\}\}\{m_\{dd\}\}\s*\\times\s*100\\%\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}\s*\\times\s*100\\%(?:\s*=\s*[^%\\$]+\\%)?/);
  if (chemCpMatch) {
    const num = parseFloat(chemCpMatch[1]);
    const den = parseFloat(chemCpMatch[2]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      const val = (num / den) * 100;
      const formatted = Number.isInteger(val) ? `${val}` : val.toFixed(1).replace(/\.0$/, '');
      return `C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\% = \\frac{${chemCpMatch[1]}}{${chemCpMatch[2]}} \\times 100\\% = ${formatted}\\%`;
    }
  }

  // 3. Fraction: \frac{A}{B} or prefix \frac{A}{B}
  const fracMatch = str.match(/^([\s\S]*?)\\frac\{([0-9.]+)\}\{([0-9.]+)\}(?:\s*=\s*([0-9.]+))?$/);
  if (fracMatch) {
    const prefix = fracMatch[1] || '';
    const num = parseFloat(fracMatch[2]);
    const den = parseFloat(fracMatch[3]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      const val = num / den;
      const formatted = Number.isInteger(val) ? `${val}` : val.toFixed(2).replace(/\.00$/, '');
      return `${prefix}\\frac{${fracMatch[2]}}{${fracMatch[3]}} = ${formatted}`;
    }
  }

  // 4. Square root: \sqrt{16} or \sqrt[3]{27}
  const sqrtMatch = str.match(/^([\s\S]*?)\\sqrt(?:\[([0-9.]+)\])?\{([0-9.]+)\}(?:\s*=\s*([0-9.]+))?$/);
  if (sqrtMatch) {
    const prefix = sqrtMatch[1] || '';
    const deg = parseFloat(sqrtMatch[2]) || 2;
    const val = parseFloat(sqrtMatch[3]);
    if (!isNaN(val) && val >= 0) {
      const res = deg === 2 ? Math.sqrt(val) : Math.pow(val, 1 / deg);
      const formatted = Number.isInteger(res) ? `${res}` : res.toFixed(2).replace(/\.00$/, '');
      return deg === 2
        ? `${prefix}\\sqrt{${sqrtMatch[3]}} = ${formatted}`
        : `${prefix}\\sqrt[${deg}]{${sqrtMatch[3]}} = ${formatted}`;
    }
  }

  // 5. General Arithmetic or division: "12/4", "10 + 2*5", "25 - 5", etc.
  let exprToEval = str;
  let prefix = '';
  if (str.includes('=')) {
    const lastEqIdx = str.lastIndexOf('=');
    prefix = str.substring(0, lastEqIdx).trim();
    exprToEval = prefix;
  }

  const sanitized = exprToEval
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/:/g, '/')
    .replace(/\^\{?([0-9]+)\}?/g, '**$1')
    .trim();

  if (/^[0-9\.\s\+\-\*\/\(\)]+$/.test(sanitized)) {
    try {
      const res = Function(`"use strict"; return (${sanitized})`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        const formatted = Number.isInteger(res) ? `${res}` : res.toFixed(2).replace(/\.00$/, '');
        return `${prefix || exprToEval} = ${formatted}`;
      }
    } catch {
      // ignore
    }
  }

  return str;
}

/**
 * Sanitize a single line of text by stripping any accidental trailing backslashes
 * (e.g. text\ or text\\ or text\ ) that cause ugly '\' or '/' at the line ends
 */
export function sanitizeLineText(text) {
  if (!text) return '';
  let s = String(text).replace(/\\+\s*$/, '').trimEnd();
  // Strip stray outer single quotes around a sentence e.g. 'Hàm số đồng biến trên $(0; 2)$.'
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'") && !s.slice(1, -1).includes("'")) {
    s = s.slice(1, -1).trim();
  }
  return s;
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
  const fracMatch = str.match(/^\\frac\{([^}]*)\}\{([^}]*)\}(?:\s*=\s*([^\s$]*))?$/);
  if (fracMatch) {
    return {
      type: 'FRACTION',
      num: fracMatch[1] ?? '',
      den: fracMatch[2] ?? '',
      hasEqual: fracMatch[3] !== undefined,
      result: fracMatch[3] || '',
      raw: str
    };
  }

  // 4. Power: A^{B} or A^B
  const powMatch = str.match(/^([a-zA-Z0-9\(\)]*)\^\{?([a-zA-Z0-9+-]*)\}?$/);
  if (powMatch) {
    return {
      type: 'POWER',
      base: powMatch[1] ?? '',
      exp: powMatch[2] ?? '',
      raw: str
    };
  }

  // 5. Square Root: \sqrt{A} = B or \sqrt[n]{A} = B or \sqrt{A}
  const sqrtMatch = str.match(/^\\sqrt(?:\[([^\]]*)\])?\{([^}]*)\}(?:\s*=\s*([^\s$]*))?$/);
  if (sqrtMatch) {
    return {
      type: 'SQRT',
      deg: sqrtMatch[1] || '2',
      expr: sqrtMatch[2] ?? '',
      hasEqual: sqrtMatch[3] !== undefined,
      result: sqrtMatch[3] || '',
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
      const num = struct.num ?? '0';
      const den = struct.den ?? '1';
      const res = struct.result || safeCalcDivision(num, den);
      return `C_M = \\frac{n}{V} = \\frac{${num}}{${den}} = ${res}\\text{ M}`;
    }
    case 'CHEM_CPERCENT': {
      const mct = struct.mct ?? '0';
      const mdd = struct.mdd ?? '1';
      const res = struct.result || '0';
      return `C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\% = \\frac{${mct}}{${mdd}} \\times 100\\% = ${res}\\%`;
    }
    case 'FRACTION': {
      const num = struct.num ?? '';
      const den = struct.den ?? '';
      if (struct.hasEqual || struct.result) {
        return `\\frac{${num}}{${den}} = ${struct.result ?? ''}`;
      }
      return `\\frac{${num}}{${den}}`;
    }
    case 'POWER': {
      const b = struct.base ?? '';
      const e = struct.exp ?? '';
      return `${b}^{${e}}`;
    }
    case 'SQRT': {
      const expr = struct.expr ?? '';
      const deg = struct.deg?.trim();
      const rootStr = deg && deg !== '2' ? `\\sqrt[${deg}]{${expr}}` : `\\sqrt{${expr}}`;
      if (struct.hasEqual || struct.result) {
        return `${rootStr} = ${struct.result ?? ''}`;
      }
      return rootStr;
    }
    default:
      return struct.raw || '';
  }
}

/**
 * Convert any LaTeX formula into human-readable Natural Math notation
 * (NEVER exposes \frac, \sqrt, \cdot, etc. to teachers / end-users)
 */
export function latexToNaturalMath(latex) {
  if (!latex) return '';
  let s = String(latex).trim();
  s = s.replace(/^\$+|\$+$/g, '').trim();

  // Balanced-brace replacer for \frac{a}{b}
  while (s.includes('\\frac{')) {
    const idx = s.indexOf('\\frac{');
    let depth = 0;
    let numEnd = -1;
    let denStart = -1;
    let denEnd = -1;
    for (let i = idx + 5; i < s.length; i++) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}') {
        depth--;
        if (depth === 0) {
          numEnd = i;
          break;
        }
      }
    }
    if (numEnd !== -1 && s[numEnd + 1] === '{') {
      denStart = numEnd + 1;
      depth = 0;
      for (let i = denStart; i < s.length; i++) {
        if (s[i] === '{') depth++;
        else if (s[i] === '}') {
          depth--;
          if (depth === 0) {
            denEnd = i;
            break;
          }
        }
      }
    }
    if (numEnd !== -1 && denEnd !== -1) {
      const num = s.substring(idx + 6, numEnd);
      const den = s.substring(denStart + 1, denEnd);
      const isSimpleNum = /^[a-zA-Z0-9.]+$/.test(num.trim());
      const isSimpleDen = /^[a-zA-Z0-9.]+$/.test(den.trim());
      const fracStr = (isSimpleNum && isSimpleDen) ? `${num.trim()}/${den.trim()}` : `(${num.trim()})/(${den.trim()})`;
      s = s.substring(0, idx) + fracStr + s.substring(denEnd + 1);
    } else {
      break;
    }
  }

  // Sqrt
  s = s.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Text
  s = s.replace(/\\text\{\s*([^}]+)\s*\}/g, ' $1');

  // Math symbols
  s = s.replace(/\\cdot/g, '*');
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\div/g, '÷');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\le/g, '≤');
  s = s.replace(/\\ge/g, '≥');
  s = s.replace(/\\ne/g, '≠');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\to/g, '→');
  s = s.replace(/\\rightarrow/g, '→');
  s = s.replace(/\\Delta/g, 'Δ');
  s = s.replace(/\\pi/g, 'π');
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\theta/g, 'θ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\Omega/g, 'Ω');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/x_0/g, 'x₀');
  s = s.replace(/x_1/g, 'x₁');
  s = s.replace(/x_2/g, 'x₂');
  s = s.replace(/y_0/g, 'y₀');
  s = s.replace(/\\lim_\{([^}]+)\s*\\to\s*([^}]+)\}/g, 'lim($1 → $2)');
  s = s.replace(/\\lim/g, 'lim');
  s = s.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫($1 → $2)');
  s = s.replace(/\\int/g, '∫');
  s = s.replace(/\\sum/g, '∑');
  s = s.replace(/\\vec\{([^}]+)\}/g, '$1⃗');

  return s.trim();
}

/**
 * Convert Natural Math back to clean LaTeX
 */
export function naturalMathToLatex(natural) {
  if (!natural) return '';
  let s = String(natural).trim();

  // lim
  s = s.replace(/lim\s*\(\s*([^→\-]+)\s*(?:→|->)\s*([^)]+)\)/gi, '\\lim_{$1 \\to $2}');
  s = s.replace(/\\?lim\s*_\s*\{([^}]+)\}/gi, '\\lim_{$1}');
  s = s.replace(/\\?lim\b/gi, '\\lim');

  // Sqrt
  s = s.replace(/(?:√|sqrt)\s*\(([^)]+)\)/gi, '\\sqrt{$1}');

  // Fractions: (expr1)/(expr2)
  s = s.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');
  // Simple fractions: 12/4
  s = s.replace(/\b([a-zA-Z0-9.]+)\/([a-zA-Z0-9.]+)\b/g, '\\frac{$1}{$2}');

  // Symbols
  s = s.replace(/x₀/g, 'x_0');
  s = s.replace(/x₁/g, 'x_1');
  s = s.replace(/x₂/g, 'x_2');
  s = s.replace(/y₀/g, 'y_0');
  s = s.replace(/→/g, '\\to');
  s = s.replace(/∞/g, '\\infty');
  s = s.replace(/Δ/g, '\\Delta');
  s = s.replace(/π/g, '\\pi');
  s = s.replace(/α/g, '\\alpha');
  s = s.replace(/β/g, '\\beta');
  s = s.replace(/θ/g, '\\theta');
  s = s.replace(/λ/g, '\\lambda');
  s = s.replace(/Ω/g, '\\Omega');
  s = s.replace(/≤/g, '\\le');
  s = s.replace(/≥/g, '\\ge');
  s = s.replace(/≠/g, '\\ne');
  s = s.replace(/≈/g, '\\approx');
  s = s.replace(/±/g, '\\pm');
  s = s.replace(/×/g, '\\times');
  s = s.replace(/·/g, '\\cdot');

  // Chemistry unit: e.g. "0.4 M" -> "0.4\text{ M}"
  s = s.replace(/(\d+(?:\.\d+)?)\s*M\b/g, '$1\\text{ M}');

  return s.trim();
}

/**
 * Tokenize a single line of text into plain text chunks and explicit $...$ / $$...$$ formula tokens
 */
function tokenizeLine(lineText, lineIdx) {
  const rawClean = sanitizeLineText(lineText);
  if (rawClean === '' || rawClean === undefined) {
    return [{
      id: `line-${lineIdx}-tok-0`,
      isFormula: false,
      text: ''
    }];
  }
  const cleanLine = normalizeMathString(rawClean);
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
 * Parse full document into Lines, each containing its tokens or visual block tags
 */
function parseDocumentLines(rawText) {
  if (!rawText) return [];
  const normalized = unescapeLiteralNewlines(String(rawText))
    .replace(/\\+\s*$/gm, '');

  const blockRegex = /(\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|!\[[^\]]*\]\([^\)]+\))/gi;
  const segments = normalized.split(blockRegex);
  const resultLines = [];
  let lineIdx = 0;

  segments.forEach((segment) => {
    if (!segment) return;
    const trimmed = segment.trim();
    const upper = trimmed.toUpperCase();

    if (
      (upper.startsWith('[VARIATION_TABLE]') && upper.endsWith('[/VARIATION_TABLE]')) ||
      (upper.startsWith('[MATH_GRAPH_3D]') && upper.endsWith('[/MATH_GRAPH_3D]')) ||
      (upper.startsWith('[MATH_GEOMETRY_2D]') && upper.endsWith('[/MATH_GEOMETRY_2D]')) ||
      (upper.startsWith('[MATH_GRAPH]') && upper.endsWith('[/MATH_GRAPH]')) ||
      /^!\[[^\]]*\]\([^\)]+\)$/.test(trimmed)
    ) {
      const blockType = upper.startsWith('[VARIATION_TABLE]')
        ? 'VARIATION_TABLE'
        : upper.startsWith('[MATH_GRAPH_3D]')
        ? 'MATH_GRAPH_3D'
        : upper.startsWith('[MATH_GEOMETRY_2D]')
        ? 'MATH_GEOMETRY_2D'
        : upper.startsWith('[MATH_GRAPH]')
        ? 'MATH_GRAPH'
        : 'IMAGE';

      resultLines.push({
        id: `line-block-${lineIdx}`,
        lineIdx,
        isBlock: true,
        blockType,
        rawBlock: trimmed,
        raw: trimmed,
        tokens: []
      });
      lineIdx++;
      return;
    }

    const subLines = segment.split('\n');
    subLines.forEach((line, subIdx) => {
      // Skip leading/trailing empty newline right around a block tag to avoid extra blank gaps
      if ((subIdx === 0 || subIdx === subLines.length - 1) && line.trim() === '' && segments.length > 1) {
        return;
      }
      const clean = sanitizeLineText(line);
      const isHeading = clean.trim().startsWith('###') || clean.trim().startsWith('##') || clean.trim().startsWith('#');
      const isBullet = clean.trim().startsWith('- ') || clean.trim().startsWith('* ') || clean.trim().startsWith('• ');
      resultLines.push({
        id: `line-${lineIdx}`,
        lineIdx,
        isBlock: false,
        raw: clean,
        isHeading,
        isBullet,
        tokens: tokenizeLine(clean, lineIdx)
      });
      lineIdx++;
    });
  });

  return resultLines;
}

/**
 * Reassemble document lines back to raw Markdown/LaTeX
 */
function serializeDocumentLines(lines) {
  return lines.map(line => {
    if (line.isBlock) {
      return line.rawBlock || line.raw || '';
    }
    const assembled = (line.tokens || []).map(t => {
      if (!t.isFormula) return t.text;
      const latex = t.structure ? buildLatexFromStructure(t.structure) : t.latex;
      return t.displayMode ? `$$${(latex || '').trim() || '\\square'}$$` : `$${(latex || '').trim() || '\\square'}$`;
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
  math_adv: {
    name: '📐 Oxyz & XSTK',
    items: [
      { label: 'u⃗·v⃗', code: '\\vec{u} \\cdot \\vec{v}', title: 'Tích vô hướng' },
      { label: '[u⃗,v⃗]', code: '[\\vec{u}, \\vec{v}]', title: 'Tích có hướng' },
      { label: '(P) mp', code: '(P): Ax + By + Cz + D = 0', title: 'Mặt phẳng Oxyz' },
      { label: 'd(M,(P))', code: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}', title: 'Khoảng cách điểm đến mp' },
      { label: 'C_n^k', code: 'C_n^k = \\frac{n!}{k!(n-k)!}', title: 'Tổ hợp C_n^k' },
      { label: 'A_n^k', code: 'A_n^k = \\frac{n!}{(n-k)!}', title: 'Chỉnh hợp A_n^k' },
      { label: 'P(A|B)', code: 'P(A|B) = \\frac{P(AB)}{P(B)}', title: 'Xác suất có điều kiện' },
      { label: 'E(X)', code: 'E(X) = \\sum x_i p_i', title: 'Kỳ vọng toán' },
      { label: 'σ(X)', code: '\\sigma(X) = \\sqrt{V(X)}', title: 'Độ lệch chuẩn' }
    ]
  },
  physics: {
    name: '⚛️ Vật lý',
    items: [
      { label: 'x(t)', code: 'x = A\\cos(\\omega t + \\varphi)', title: 'DĐ điều hòa' },
      { label: 'v(t)', code: 'v = -\\omega A\\sin(\\omega t + \\varphi)', title: 'Vận tốc' },
      { label: 'a(t)', code: 'a = -\\omega^2 x', title: 'Gia tốc' },
      { label: 'T lò xo', code: 'T = 2\\pi \\sqrt{\\frac{m}{k}}', title: 'Chu kỳ lò xo' },
      { label: 'λ = v/f', code: '\\lambda = \\frac{v}{f}', title: 'Bước sóng' },
      { label: 'Z mạch', code: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}', title: 'Tổng trở RLC' },
      { label: 'Khoảng vân', code: 'i = \\frac{\\lambda D}{a}', title: 'Khoảng vân Y-âng' },
      { label: 'E = mc²', code: 'E = mc^2', title: 'Năng lượng Einstein' }
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
  biology: {
    name: '🧬 Sinh học',
    items: [
      { label: 'N = 2A+2G', code: 'N = 2A + 2G', title: 'Tổng số nucleotit gen' },
      { label: 'Chiều dài L', code: 'L = \\frac{N}{2} \\times 3.4\\text{ \\AA}', title: 'Chiều dài ADN' },
      { label: 'Liên kết H', code: 'H = 2A + 3G', title: 'Số liên kết hidro' },
      { label: 'Chu kỳ C', code: 'C = \\frac{N}{20}', title: 'Chu kỳ xoắn ADN' },
      { label: '2^k tế bào', code: '2^k', title: 'Số tế bào nguyên phân' },
      { label: 'F2 3:1', code: '3 : 1 \\quad (1AA:2Aa:1aa)', title: 'Menđen 1 cặp tính trạng' },
      { label: 'F2 9:3:3:1', code: '9 : 3 : 3 : 1', title: 'Menđen phân ly độc lập' },
      { label: 'Hardy-Weinberg', code: 'p^2 AA + 2pq Aa + q^2 aa = 1', title: 'Cân bằng di truyền' }
    ]
  },
  literature: {
    name: '📖 Ngữ văn',
    items: [
      { label: 'So sánh', code: '\\text{So sánh}', title: 'Biện pháp so sánh' },
      { label: 'Ẩn dụ', code: '\\text{Ẩn dụ}', title: 'Ẩn dụ chuyển đổi cảm giác' },
      { label: 'Hoán dụ', code: '\\text{Hoán dụ}', title: 'Hoán dụ tương cận' },
      { label: 'Nhân hóa', code: '\\text{Nhân hóa}', title: 'Biện pháp nhân hóa' },
      { label: 'Điệp ngữ', code: '\\text{Điệp từ/ngữ}', title: 'Điệp từ điệp cấu trúc' },
      { label: 'Nói quá', code: '\\text{Nói quá}', title: 'Phóng đại cường điệu' },
      { label: 'Nói giảm', code: '\\text{Nói giảm nói tránh}', title: 'Diễn đạt tế nhị' },
      { label: 'Lục bát', code: '\\text{Thể thơ Lục bát (6-8)}', title: 'Thể thơ lục bát' },
      { label: 'Song thất LB', code: '\\text{Song thất lục bát (7-7-6-8)}', title: 'Song thất lục bát' },
      { label: 'Diễn dịch', code: '\\text{Đoạn Diễn dịch}', title: 'Mở đầu câu chủ đề' },
      { label: 'Quy nạp', code: '\\text{Đoạn Quy nạp}', title: 'Đúc kết cuối đoạn' },
      { label: 'Tổng-Phân-Hợp', code: '\\text{Đoạn Tổng - Phân - Hợp}', title: 'Tổng phân hợp' }
    ]
  },
  geography: {
    name: '🌍 Địa lý',
    items: [
      { label: 'Mật độ DS', code: '\\text{MĐDS} = \\frac{\\text{Dân số}}{\\text{Diện tích}}', title: 'Mật độ dân số (người/km2)' },
      { label: 'Gia tăng TN', code: 'T_g = S - T', title: 'Gia tăng tự nhiên (%)' },
      { label: 'Biên độ nhiệt', code: 'A_T = T_{\\max} - T_{\\min}', title: 'Biên độ nhiệt độ (°C)' },
      { label: 'Nhiệt độ TB', code: '\\bar{T} = \\frac{\\sum T_i}{12}', title: 'Nhiệt độ trung bình năm' },
      { label: 'Cán cân XNK', code: '\\text{Cán cân} = \\text{XK} - \\text{NK}', title: 'Cán cân xuất nhập khẩu' },
      { label: 'Cơ cấu %', code: '\\%_i = \\frac{X_i}{\\text{Tổng}} \\times 100\\%', title: 'Tỉ trọng cơ cấu kinh tế' },
      { label: 'Tốc độ TT', code: '\\text{TĐTT} = \\frac{Y_n}{Y_0} \\times 100\\%', title: 'Tốc độ tăng trưởng năm gốc' },
      { label: 'Năng suất', code: '\\text{Năng suất} = \\frac{\\text{Sản lượng}}{\\text{Diện tích}}', title: 'Năng suất cây trồng' },
      { label: 'Bán kính R', code: 'R_n = R_1 \\sqrt{\\frac{S_n}{S_1}}', title: 'Bán kính biểu đồ tròn' }
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
  accentColor: _accentColor = "cyan",
  compact = false,
  singleLine = false,
  isStem: _isStem = false,
  onEditMathGraph = null,
  onOpenAdvancedModal = null
}, ref) {
  const [docLines, setDocLines] = useState(() => parseDocumentLines(content || ''));
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const [bubbleTab, setBubbleTab] = useState('structures');
  
  const activeFormulaRef = useRef(null);
  const activeInputRef = useRef(null);
  const containerRef = useRef(null);
  const lineRefs = useRef({});
  const lastCommittedContentRef = useRef(content || '');

  // Active cursor tracking for precise insertion at cursor location
  const activePositionRef = useRef({
    lineId: null,
    tokenId: null,
    offset: 0
  });

  // Sync incoming content only if changed externally (never wipe active editing state on internal keystrokes)
  useEffect(() => {
    if (content === lastCommittedContentRef.current) return;
    const currentSerialized = serializeDocumentLines(docLines);
    if (content !== currentSerialized) {
      lastCommittedContentRef.current = content || '';
      setDocLines(parseDocumentLines(content || ''));
    }
  }, [content]);

  // Update floating bubble position relative to active formula element (never obscure the formula)
  useEffect(() => {
    if (activeFormulaId && activeFormulaRef.current && containerRef.current) {
      const formulaRect = activeFormulaRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const bubbleHeight = 200;
      const spaceAbove = formulaRect.top - containerRect.top;

      let topPos;
      if (spaceAbove > bubbleHeight + 15) {
        topPos = formulaRect.top - containerRect.top - bubbleHeight - 12;
      } else {
        topPos = formulaRect.bottom - containerRect.top + 8;
      }

      setBubblePos({
        top: Math.max(6, topPos),
        left: Math.max(8, formulaRect.left - containerRect.left + (formulaRect.width / 2) - 170)
      });
    }
  }, [activeFormulaId]);

  // Propagate changes upstream
  const commitDocLines = (newLines) => {
    setDocLines(newLines);
    const serialized = serializeDocumentLines(newLines);
    lastCommittedContentRef.current = serialized;
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
      const trimmedSnippet = latexSnippet.trim();

      // If inserting a full visual block ([VARIATION_TABLE], [MATH_GRAPH], [MATH_GRAPH_3D], [MATH_GEOMETRY_2D], or image ![...](...))
      if (
        /\[(VARIATION_TABLE|MATH_GRAPH|MATH_GRAPH_3D|MATH_GEOMETRY_2D)\]/i.test(trimmedSnippet) ||
        /^!\[[^\]]*\]\([^\)]+\)$/.test(trimmedSnippet) ||
        trimmedSnippet.includes('\n')
      ) {
        const currentRaw = serializeDocumentLines(docLines);
        const combined = currentRaw ? `${currentRaw}\n${trimmedSnippet}` : trimmedSnippet;
        const nextLines = parseDocumentLines(combined);
        commitDocLines(nextLines);
        return;
      }

      const formulaLatex = trimmedSnippet.replace(/^\$+|\$+$/g, '').trim();
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

    let currLineTokens = null;
    let nextLineTokens = [{ id: newTokId, isFormula: false, text: '' }];

    if (idx !== -1 && activePositionRef.current?.lineId === targetLineId) {
      const currLine = docLines[idx];
      const targetTokenId = activePositionRef.current.tokenId;
      const caretOffset = activePositionRef.current.offset ?? 0;
      const tokIdx = currLine.tokens.findIndex(t => t.id === targetTokenId);

      if (tokIdx !== -1) {
        const currTok = currLine.tokens[tokIdx];
        if (!currTok.isFormula) {
          const fullText = currTok.text || '';
          const before = fullText.slice(0, caretOffset);
          const after = fullText.slice(caretOffset);

          currLineTokens = [
            ...currLine.tokens.slice(0, tokIdx),
            { ...currTok, text: before }
          ];

          nextLineTokens = [
            { id: newTokId, isFormula: false, text: after },
            ...currLine.tokens.slice(tokIdx + 1)
          ];
        }
      }
    }

    const newLine = {
      id: newLId,
      lineIdx: idx + 1,
      raw: '',
      isHeading: false,
      isBullet: false,
      tokens: nextLineTokens
    };

    let nextLines;
    if (idx === -1) {
      nextLines = [...docLines, newLine];
    } else {
      const updatedCurr = currLineTokens ? { ...docLines[idx], tokens: currLineTokens } : docLines[idx];
      nextLines = [
        ...docLines.slice(0, idx),
        updatedCurr,
        newLine,
        ...docLines.slice(idx + 1)
      ];
    }

    flushSync(() => {
      commitDocLines(nextLines);
    });

    // Auto-focus the newly created line immediately
    const lineEl = lineRefs.current[newLId];
    if (lineEl) {
      const span = lineEl.querySelector('[contenteditable="true"]');
      if (span) {
        span.focus();
        activePositionRef.current = { lineId: newLId, tokenId: newTokId, offset: 0 };
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(span);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  // Delete empty line or merge line with previous line (triggered by Backspace)
  const handleDeleteOrMergeLine = (targetLineId) => {
    if (docLines.length <= 1) return; // Keep at least 1 line
    const idx = docLines.findIndex(l => l.id === targetLineId);
    if (idx <= 0) return; // Cannot delete/merge line 0 upward

    const prevLine = docLines[idx - 1];
    const currLine = docLines[idx];

    // Check if current line is completely empty in DOM and state
    const currLineEl = lineRefs.current[targetLineId];
    const hasFormulas = currLine.tokens.some(t => t.isFormula);
    const domLineText = currLineEl ? (currLineEl.innerText || '').replace(/\r?\n/g, '').trim() : '';
    const isLineEmpty = !hasFormulas && (domLineText === '' || currLine.tokens.every(t => !t.isFormula && (!t.text || t.text.trim() === '')));

    let nextLines;
    let targetFocusTokenId = null;
    let targetFocusOffset = null;

    if (isLineEmpty) {
      // CASE 1: Line is completely empty -> DISCARD line completely without leaving any ghost tokens!
      nextLines = docLines.filter(l => l.id !== targetLineId);

      const prevTextTokens = prevLine.tokens.filter(t => !t.isFormula);
      const lastPrevTok = prevTextTokens[prevTextTokens.length - 1];
      targetFocusTokenId = lastPrevTok?.id;
      targetFocusOffset = (lastPrevTok?.text || '').length;
    } else {
      // CASE 2: Line has content and cursor is at start of line -> Merge with previous line
      const updatedCurrTokens = currLine.tokens.map(t => {
        if (!t.isFormula && currLineEl) {
          const span = currLineEl.querySelector(`[data-token-id="${t.id}"]`);
          if (span) return { ...t, text: span.textContent || '' };
        }
        return t;
      });

      const prevTextTokens = prevLine.tokens.filter(t => !t.isFormula);
      const lastPrevTok = prevTextTokens[prevTextTokens.length - 1];
      targetFocusTokenId = lastPrevTok?.id;
      targetFocusOffset = (lastPrevTok?.text || '').length;

      const mergedTokens = [...prevLine.tokens, ...updatedCurrTokens];
      const updatedPrevLine = {
        ...prevLine,
        tokens: mergedTokens
      };

      nextLines = [
        ...docLines.slice(0, idx - 1),
        updatedPrevLine,
        ...docLines.slice(idx + 1)
      ];
    }

    flushSync(() => {
      commitDocLines(nextLines);
    });

    // Auto-focus previous line immediately so repeat Backspace deletes seamlessly
    const prevLineEl = lineRefs.current[prevLine.id];
    if (prevLineEl) {
      const spans = prevLineEl.querySelectorAll('[contenteditable="true"]');
      if (spans.length > 0) {
        let targetSpan = targetFocusTokenId
          ? prevLineEl.querySelector(`[data-token-id="${targetFocusTokenId}"]`)
          : spans[spans.length - 1];
        if (!targetSpan) targetSpan = spans[spans.length - 1];

        targetSpan.focus();
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(targetSpan);
          if (targetFocusOffset !== null && targetSpan.firstChild) {
            try {
              const maxOff = targetSpan.firstChild.textContent?.length || 0;
              const off = Math.min(targetFocusOffset, maxOff);
              range.setStart(targetSpan.firstChild, off);
              range.setEnd(targetSpan.firstChild, off);
            } catch (err) {
              range.collapse(false);
            }
          } else {
            range.collapse(false);
          }
          sel.removeAllRanges();
          sel.addRange(range);
        }

        activePositionRef.current = {
          lineId: prevLine.id,
          tokenId: targetFocusTokenId || prevLine.tokens[prevLine.tokens.length - 1]?.id,
          offset: targetFocusOffset ?? 0
        };
      }
    }
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

  // Update specific slot of structured equation (Fraction num/den, Sqrt expr, Power base/exp, Chem)
  const handleSlotUpdate = (field, val) => {
    if (!activeFormulaId || !activeTokenInfo) return;
    const targetTokenInfo = activeTokenInfo;
    const currentStruct = targetTokenInfo.token.structure || parseEquationStructure(targetTokenInfo.token.latex);
    const nextStruct = { ...currentStruct, [field]: val };
    if (field === 'result' && val) {
      nextStruct.hasEqual = true;
    }
    const nextLatex = buildLatexFromStructure(nextStruct);

    const updated = docLines.map(line => {
      if (line.id !== targetTokenInfo.lineId) return line;
      const nextTokens = line.tokens.map(t => {
        if (t.id !== targetTokenInfo.token.id) return t;
        return {
          ...t,
          latex: nextLatex,
          structure: nextStruct
        };
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Modify formula via Natural Math (0% LaTeX, automatically converts to clean KaTeX)
  const handleNaturalMathChange = (lineId, tokenId, naturalVal) => {
    const convertedLatex = naturalMathToLatex(naturalVal);
    const nextStruct = parseEquationStructure(convertedLatex);

    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const nextTokens = line.tokens.map(t => {
        if (t.id !== tokenId) return t;
        return {
          ...t,
          latex: convertedLatex,
          structure: nextStruct
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
        const struct = t.structure || parseEquationStructure(t.latex || '');

        if (struct.type === 'FRACTION') {
          const res = safeCalcDivision(struct.num, struct.den);
          const nextStruct = { ...struct, hasEqual: true, result: res };
          const nextLatex = buildLatexFromStructure(nextStruct);
          return { ...t, latex: nextLatex, structure: nextStruct };
        } else if (struct.type === 'SQRT') {
          const val = parseFloat(struct.expr);
          if (!isNaN(val) && val >= 0) {
            const res = Math.sqrt(val);
            const formatted = Number.isInteger(res) ? `${res}` : res.toFixed(2).replace(/\.00$/, '');
            const nextStruct = { ...struct, hasEqual: true, result: formatted };
            const nextLatex = buildLatexFromStructure(nextStruct);
            return { ...t, latex: nextLatex, structure: nextStruct };
          }
        } else if (struct.type === 'CHEM_CM') {
          const res = safeCalcDivision(struct.num, struct.den);
          const nextStruct = { ...struct, result: res };
          const nextLatex = buildLatexFromStructure(nextStruct);
          return { ...t, latex: nextLatex, structure: nextStruct };
        }

        const calculatedLatex = autoCalculateEquation(t.latex || '');
        return {
          ...t,
          latex: calculatedLatex,
          structure: parseEquationStructure(calculatedLatex)
        };
      });
      return { ...line, tokens: nextTokens };
    });
    commitDocLines(updated);
  };

  // Delete active formula (Ensure line still has at least 1 text token so user can always type or drag back into it)
  const handleDeleteActiveFormula = (lineId, tokenId) => {
    const updated = docLines.map(line => {
      if (line.id !== lineId) return line;
      const remaining = line.tokens.filter(t => t.id !== tokenId);
      if (remaining.length === 0 || !remaining.some(t => !t.isFormula)) {
        remaining.push({ id: `tok-t-${Date.now()}`, isFormula: false, text: '' });
      }
      return { ...line, tokens: remaining };
    });
    setActiveFormulaId(null);
    commitDocLines(updated);
  };

  // Insert quick symbol into active formula (Cursor-aware insertion and text wrapping)
  const handleInsertSymbolIntoActive = (symbolItem) => {
    if (!activeFormulaId || !activeTokenInfo) return;

    const lineId = activeTokenInfo.lineId;
    const tokenId = activeTokenInfo.token.id;
    const currentLatex = activeTokenInfo.token.latex || '';

    // Switch to FRACTION slots if user clicked fraction button
    if (symbolItem.code === '\\frac{a}{b}') {
      const curNat = latexToNaturalMath(currentLatex);
      const nextStruct = {
        type: 'FRACTION',
        num: curNat || '12',
        den: '4',
        hasEqual: false,
        result: ''
      };
      const nextLatex = buildLatexFromStructure(nextStruct);
      const updated = docLines.map(line => {
        if (line.id !== lineId) return line;
        const nextTokens = line.tokens.map(t => {
          if (t.id !== tokenId) return t;
          return { ...t, latex: nextLatex, structure: nextStruct };
        });
        return { ...line, tokens: nextTokens };
      });
      commitDocLines(updated);
      return;
    }

    // Switch to SQRT slots if user clicked sqrt button
    if (symbolItem.code === '\\sqrt{x}') {
      const curNat = latexToNaturalMath(currentLatex);
      const nextStruct = {
        type: 'SQRT',
        deg: '2',
        expr: curNat || '16',
        hasEqual: false,
        result: ''
      };
      const nextLatex = buildLatexFromStructure(nextStruct);
      const updated = docLines.map(line => {
        if (line.id !== lineId) return line;
        const nextTokens = line.tokens.map(t => {
          if (t.id !== tokenId) return t;
          return { ...t, latex: nextLatex, structure: nextStruct };
        });
        return { ...line, tokens: nextTokens };
      });
      commitDocLines(updated);
      return;
    }

    // Insert natural symbol into active natural math input
    const inputEl = activeInputRef.current;
    let cursorStart = inputEl ? inputEl.selectionStart : null;
    let cursorEnd = inputEl ? inputEl.selectionEnd : null;

    const naturalSymbol = latexToNaturalMath(symbolItem.code);
    const currentNatural = latexToNaturalMath(currentLatex);

    let nextNatural = '';
    let newCursorPos = 0;
    if (cursorStart !== null && cursorEnd !== null && cursorStart <= currentNatural.length) {
      const before = currentNatural.substring(0, cursorStart);
      const selected = currentNatural.substring(cursorStart, cursorEnd);
      const after = currentNatural.substring(cursorEnd);

      if (selected && symbolItem.code.includes('^2')) {
        const ins = `(${selected})^2`;
        nextNatural = before + ins + after;
        newCursorPos = before.length + ins.length;
      } else if (selected && naturalSymbol.includes('√')) {
        const ins = `√(${selected})`;
        nextNatural = before + ins + after;
        newCursorPos = before.length + ins.length;
      } else {
        nextNatural = before + naturalSymbol + after;
        newCursorPos = before.length + naturalSymbol.length;
      }
    } else {
      nextNatural = currentNatural + (currentNatural && !currentNatural.endsWith(' ') ? ' ' : '') + naturalSymbol;
      newCursorPos = nextNatural.length;
    }

    handleNaturalMathChange(lineId, tokenId, nextNatural);

    setTimeout(() => {
      if (activeInputRef.current) {
        activeInputRef.current.focus();
        try {
          activeInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        } catch {
          // ignore
        }
      }
    }, 10);
  };

  // Handle Drag-and-Drop of formula/compound/block chips from HierarchicalMathPalette
  const handleDropSnippetOnCanvas = (e, targetLineId = null) => {
    const blockCode = e.dataTransfer?.getData('text/veval-block');
    const mathCode = e.dataTransfer?.getData('text/veval-math') || e.dataTransfer?.getData('text/veval-bbt');
    if (!blockCode && !mathCode) return;

    e.preventDefault();
    e.stopPropagation();

    const rawSnippet = (blockCode || mathCode || '').trim();
    if (!rawSnippet) return;

    // Case 1: Block tag (e.g. [VARIATION_TABLE]...[/VARIATION_TABLE])
    if (
      rawSnippet.startsWith('[VARIATION_TABLE]') ||
      rawSnippet.startsWith('[MATH_GRAPH]') ||
      rawSnippet.startsWith('[MATH_GRAPH_3D]') ||
      rawSnippet.startsWith('[MATH_GEOMETRY_2D]')
    ) {
      const bType = rawSnippet.startsWith('[VARIATION_TABLE]')
        ? 'VARIATION_TABLE'
        : rawSnippet.startsWith('[MATH_GRAPH_3D]')
        ? 'MATH_GRAPH_3D'
        : rawSnippet.startsWith('[MATH_GEOMETRY_2D]')
        ? 'MATH_GEOMETRY_2D'
        : 'MATH_GRAPH';
      const newBlockLine = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        lineIdx: docLines.length,
        raw: rawSnippet,
        isBlock: true,
        blockType: bType,
        rawBlock: rawSnippet,
        tokens: []
      };
      if (targetLineId) {
        const idx = docLines.findIndex((l) => l.id === targetLineId);
        if (idx !== -1) {
          const next = [...docLines];
          next.splice(idx + 1, 0, newBlockLine);
          commitDocLines(next);
          return;
        }
      }
      commitDocLines([...docLines, newBlockLine]);
      return;
    }

    // Case 2: Formula or chemical compound token
    const cleanLatex = rawSnippet.replace(/^\$+|\$+$/g, '').trim();
    const formulaStructure = parseEquationStructure(cleanLatex);
    const newFormulaId = `tok-f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const formulaToken = {
      id: newFormulaId,
      isFormula: true,
      displayMode: false,
      latex: cleanLatex,
      structure: formulaStructure
    };

    if (docLines.length === 0) {
      const newLId = `line-${Date.now()}`;
      const afterId = `tok-t-${Date.now() + 1}`;
      commitDocLines([
        {
          id: newLId,
          lineIdx: 0,
          raw: '',
          isHeading: false,
          isBullet: false,
          tokens: [formulaToken, { id: afterId, isFormula: false, text: ' ' }]
        }
      ]);
      setActiveFormulaId(newFormulaId);
      return;
    }

    const resolvedLineId =
      targetLineId && docLines.some((l) => l.id === targetLineId && !l.isBlock)
        ? targetLineId
        : [...docLines].reverse().find((l) => !l.isBlock)?.id;

    if (!resolvedLineId) {
      const newLId = `line-${Date.now()}`;
      const afterId = `tok-t-${Date.now() + 1}`;
      commitDocLines([
        ...docLines,
        {
          id: newLId,
          lineIdx: docLines.length,
          raw: '',
          isHeading: false,
          isBullet: false,
          tokens: [formulaToken, { id: afterId, isFormula: false, text: ' ' }]
        }
      ]);
      setActiveFormulaId(newFormulaId);
      return;
    }

    const updated = docLines.map((line) => {
      if (line.id !== resolvedLineId) return line;
      const afterId = `tok-t-${Date.now()}`;
      return {
        ...line,
        tokens: [...line.tokens, formulaToken, { id: afterId, isFormula: false, text: ' ' }]
      };
    });
    commitDocLines(updated);
    setActiveFormulaId(newFormulaId);
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
      
      {/* UNIVERSAL FORMULA FLOATING STUDIO & CURSOR-AWARE INSERTER */}
      {activeFormulaId && activeTokenInfo && (() => {
        const token = activeTokenInfo.token;
        const struct = token.structure || parseEquationStructure(token.latex);
        const naturalMath = latexToNaturalMath(token.latex);
        const structType = struct.type;

        return (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(6, bubblePos.top)}px`,
              left: `${Math.max(8, bubblePos.left)}px`,
              zIndex: 50
            }}
            className="bg-white/98 text-slate-900 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-indigo-500/80 p-3.5 flex flex-col gap-3 min-w-[380px] max-w-[620px] animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Row 1: Header Bar with Structure Badge & Quick Action Buttons */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black shrink-0 uppercase tracking-wider shadow-2xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>
                    {structType === 'FRACTION' ? 'Phân Số' :
                     structType === 'SQRT' ? 'Căn Thức' :
                     structType === 'POWER' ? 'Lũy Thừa' :
                     structType === 'CHEM_CM' ? 'Nồng Độ C_M' :
                     structType === 'CHEM_CPERCENT' ? 'Nồng Độ C%' :
                     'Soạn Công Thức'}
                  </span>
                </span>
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                  (Điền số trực tiếp vào ô bên dưới)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAutoCalc(activeTokenInfo.lineId, activeTokenInfo.token.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-102"
                  title="Tự tính đáp số tự động cho mọi phép toán (12/4 = 3, căn bậc 2, nồng độ...)"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteActiveFormula(activeTokenInfo.lineId, activeTokenInfo.token.id)}
                  className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Xóa công thức này khỏi bài giảng (Delete / Backspace)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormulaId(null)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-transform hover:scale-102"
                  title="Hoàn tất soạn thảo (Enter / Esc)"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Xong</span>
                </button>
              </div>
            </div>

            {/* Row 2: INTERACTIVE VISUAL SLOTS (CHỈNH SỬA SỐ & BIỂU THỨC TRỰC TIẾP TRÊN Ô MẪU SGK) */}
            {structType === 'FRACTION' && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/90 flex items-center justify-between gap-3 shadow-inner">
                <span className="text-[11px] font-extrabold text-indigo-900 shrink-0">
                  Ô điền phân số:
                </span>
                <div className="flex items-center gap-2.5">
                  {/* Vertical Fraction */}
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={struct.num ?? ''}
                      onChange={(e) => handleSlotUpdate('num', e.target.value)}
                      placeholder="Tử số"
                      className="w-16 px-2 py-0.5 text-center font-bold text-xs bg-white rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      title="Tử số (Nhập số hoặc biểu thức phía trên)"
                    />
                    <div className="w-full h-0.5 bg-indigo-900 my-1 rounded-full"></div>
                    <input
                      type="text"
                      value={struct.den ?? ''}
                      onChange={(e) => handleSlotUpdate('den', e.target.value)}
                      placeholder="Mẫu số"
                      className="w-16 px-2 py-0.5 text-center font-bold text-xs bg-white rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      title="Mẫu số (Nhập số hoặc biểu thức phía dưới)"
                    />
                  </div>

                  <span className="text-base font-black text-slate-700">=</span>

                  {/* Result */}
                  <input
                    type="text"
                    value={struct.result ?? ''}
                    onChange={(e) => handleSlotUpdate('result', e.target.value)}
                    placeholder="Đáp số"
                    className="w-16 px-2 py-1 text-center font-black text-xs bg-white rounded-lg border border-emerald-300 text-emerald-800 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    title="Đáp số (Nhấp nút Tính để tự động tính)"
                  />
                </div>
              </div>
            )}

            {structType === 'SQRT' && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/90 flex items-center justify-between gap-3 shadow-inner">
                <span className="text-[11px] font-extrabold text-indigo-900 shrink-0">
                  Ô điền căn thức:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-serif font-black text-indigo-950">√</span>
                  <input
                    type="text"
                    value={struct.expr ?? ''}
                    onChange={(e) => handleSlotUpdate('expr', e.target.value)}
                    placeholder="Số trong căn"
                    className="w-20 px-2 py-1 text-center font-bold text-xs bg-white rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  <span className="text-base font-black text-slate-700">=</span>
                  <input
                    type="text"
                    value={struct.result ?? ''}
                    onChange={(e) => handleSlotUpdate('result', e.target.value)}
                    placeholder="Đáp số"
                    className="w-16 px-2 py-1 text-center font-black text-xs bg-white rounded-lg border border-emerald-300 text-emerald-800 shadow-2xs"
                  />
                </div>
              </div>
            )}

            {structType === 'POWER' && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/90 flex items-center justify-between gap-3 shadow-inner">
                <span className="text-[11px] font-extrabold text-indigo-900 shrink-0">
                  Ô điền lũy thừa:
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={struct.base ?? ''}
                    onChange={(e) => handleSlotUpdate('base', e.target.value)}
                    placeholder="Cơ số (x)"
                    className="w-16 px-2 py-1 text-center font-bold text-xs bg-white rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                  <span className="text-xs font-bold text-slate-400">^</span>
                  <input
                    type="text"
                    value={struct.exp ?? ''}
                    onChange={(e) => handleSlotUpdate('exp', e.target.value)}
                    placeholder="Số mũ"
                    className="w-14 px-2 py-1 text-center font-bold text-xs bg-white rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            )}

            {structType === 'CHEM_CM' && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-50/90 to-emerald-50/90 border border-teal-200/90 flex items-center justify-between gap-3 shadow-inner">
                <span className="text-[11px] font-extrabold text-teal-950 font-serif">
                  C_M = n / V =
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={struct.num ?? ''}
                      onChange={(e) => handleSlotUpdate('num', e.target.value)}
                      placeholder="n (mol)"
                      className="w-14 px-1 py-0.5 text-center font-bold text-xs bg-white rounded border border-teal-300"
                    />
                    <div className="w-full h-0.5 bg-teal-800 my-0.5"></div>
                    <input
                      type="text"
                      value={struct.den ?? ''}
                      onChange={(e) => handleSlotUpdate('den', e.target.value)}
                      placeholder="V (lít)"
                      className="w-14 px-1 py-0.5 text-center font-bold text-xs bg-white rounded border border-teal-300"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">=</span>
                  <input
                    type="text"
                    value={struct.result ?? ''}
                    onChange={(e) => handleSlotUpdate('result', e.target.value)}
                    placeholder="Đáp số"
                    className="w-14 px-1 py-0.5 text-center font-black text-xs bg-white rounded border border-emerald-300 text-emerald-800"
                  />
                  <span className="text-xs font-bold text-teal-900 font-serif">M</span>
                </div>
              </div>
            )}

            {/* Row 3: UNIVERSAL NATURAL MATH BAR (SOẠN NHANH TOÀN NĂNG - 0% LATEX) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-slate-700 shrink-0">
                Toán tự nhiên:
              </span>
              <input
                ref={activeInputRef}
                type="text"
                value={naturalMath}
                onChange={(e) => handleNaturalMathChange(activeTokenInfo.lineId, activeTokenInfo.token.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !naturalMath) {
                    e.preventDefault();
                    handleDeleteActiveFormula(activeTokenInfo.lineId, activeTokenInfo.token.id);
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setActiveFormulaId(null);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setActiveFormulaId(null);
                  }
                }}
                placeholder="Gõ hoặc dán mọi biểu thức tự nhiên: 12/4 = 3, căn(16) = 4, (x+1)/(x-1)..."
                className="flex-1 bg-slate-50 hover:bg-white focus:bg-white border-2 border-indigo-300 focus:border-indigo-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none shadow-inner transition-colors"
                title="Gõ công thức theo dạng toán tự nhiên thông thường (không cần gõ mã LaTeX)"
              />
            </div>

            {/* Row 4: LIVE KATEX TYPOGRAPHY PREVIEW DOCK (CHUẨN SGK TRỰC QUAN 100%) */}
            <div 
              onClick={() => {
                if (activeInputRef.current) activeInputRef.current.focus();
              }}
              className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200/90 flex items-center justify-between gap-3 shadow-inner cursor-pointer hover:bg-indigo-50 transition-colors"
              title="Nhấp vào đây để tiếp tục nhập chỉnh sửa biểu thức"
            >
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Học sinh thấy:</span>
                </span>
                <div 
                  className="text-sm sm:text-base text-indigo-950 font-serif whitespace-nowrap overflow-x-auto py-0.5"
                  dangerouslySetInnerHTML={{ 
                    __html: renderKatexHtml(token.latex || '\\text{(Trống)}', false) 
                  }}
                />
              </div>
              {onOpenAdvancedModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFormulaId(null);
                    onOpenAdvancedModal();
                  }}
                  className="text-[10.5px] font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-300 shadow-2xs whitespace-nowrap cursor-pointer transition-colors shrink-0"
                  title="Mở Studio đầy đủ để vẽ đồ thị hàm số hoặc bảng biến thiên"
                >
                  🚀 Mở Studio
                </button>
              )}
            </div>

            {/* Row 5: Quick Symbol Inserter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 border-t border-slate-100 pt-1.5">
              {Object.keys(HIERARCHICAL_BUBBLE_INSERTER).map((tabKey) => {
                const tab = HIERARCHICAL_BUBBLE_INSERTER[tabKey];
                const isAct = bubbleTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setBubbleTab(tabKey)}
                    className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isAct 
                        ? 'bg-indigo-600 text-white shadow-2xs font-extrabold' 
                        : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Row 6: Quick Symbol Inserter Buttons */}
            <div className="flex flex-wrap items-center gap-1 max-h-[68px] overflow-y-auto scrollbar-none p-1 bg-slate-50/80 rounded-xl border border-slate-200/80">
              {HIERARCHICAL_BUBBLE_INSERTER[bubbleTab]?.items?.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleInsertSymbolIntoActive(item)}
                  title={item.title || item.label}
                  className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-950 font-serif font-bold text-xs rounded-lg border border-slate-200 hover:border-indigo-400 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* THE ACTUAL DOCUMENT CANVAS */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => handleDropSnippetOnCanvas(e, null)}
        className={
          singleLine
            ? 'bg-transparent border-0 shadow-none px-1 py-0.5 min-h-[26px] text-[13.5px] leading-snug select-text cursor-text flex-1'
            : compact
            ? 'bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-3.5 min-h-[84px] text-[13.5px] leading-relaxed select-text space-y-1.5 cursor-text focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/70 transition-all'
            : 'bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 min-h-[380px] text-[14px] leading-relaxed select-text space-y-2 cursor-text'
        }
      >
        {docLines.length === 0 ? (
          <div 
            onClick={() => handleInsertNewLineAfter(null)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => handleDropSnippetOnCanvas(e, null)}
            className={`${singleLine ? 'py-0.5 text-left' : compact ? 'py-3 text-left px-1' : 'py-12 text-center'} text-slate-400 text-xs italic cursor-pointer hover:text-slate-600`}
          >
            {placeholder} {!singleLine && !compact && '(Nhấp vào đây hoặc kéo thả công thức vào để bắt đầu soạn bài giảng)'}
          </div>
        ) : (
          docLines.map((line) => {
            if (line.isBlock) {
              const handleDeleteBlock = (e) => {
                e.stopPropagation();
                const filtered = docLines.filter((l) => l.id !== line.id);
                if (filtered.length === 0) {
                  const newLId = `line-${Date.now()}`;
                  const newTokId = `tok-${Date.now()}`;
                  commitDocLines([
                    {
                      id: newLId,
                      lineIdx: 0,
                      isBlock: false,
                      raw: '',
                      isHeading: false,
                      isBullet: false,
                      tokens: [{ id: newTokId, isFormula: false, text: '' }]
                    }
                  ]);
                  return;
                }
                commitDocLines(filtered);
              };

              if (line.blockType === 'VARIATION_TABLE') {
                const tableData = parseVariationTableString(line.rawBlock);
                const handleUpdateVariationBlock = (newRawBlock) => {
                  const updated = docLines.map((l) =>
                    l.id === line.id ? { ...l, rawBlock: newRawBlock, raw: newRawBlock } : l
                  );
                  commitDocLines(updated);
                };
                return (
                  <div key={line.id} className="relative group my-2">
                    <button
                      type="button"
                      onClick={handleDeleteBlock}
                      title="Xóa bảng biến thiên này"
                      className="absolute top-3 right-3 z-20 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                    {tableData ? (
                      <VariationTable
                        data={tableData}
                        onChange={handleUpdateVariationBlock}
                      />
                    ) : (
                      <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto">
                        {line.rawBlock}
                      </pre>
                    )}
                  </div>
                );
              }

              if (
                line.blockType === 'MATH_GRAPH' ||
                line.blockType === 'MATH_GRAPH_3D' ||
                line.blockType === 'MATH_GEOMETRY_2D'
              ) {
                return (
                  <div key={line.id} className="relative group my-2">
                    <button
                      type="button"
                      onClick={handleDeleteBlock}
                      title="Xóa đồ thị / mô hình này"
                      className="absolute top-2.5 right-24 z-20 opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa mô hình</span>
                    </button>
                    <InteractiveMathRenderer
                      rawTag={line.rawBlock}
                      height={compact ? 250 : 300}
                      onEdit={onEditMathGraph ? () => onEditMathGraph(line.rawBlock) : null}
                    />
                  </div>
                );
              }

              if (line.blockType === 'IMAGE') {
                const imgMatch = line.rawBlock.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
                const altText = imgMatch ? imgMatch[1] : 'Hình minh họa';
                const imgUrl = imgMatch ? imgMatch[2] : '';
                return (
                  <div key={line.id} className="relative group my-2 inline-block max-w-full">
                    <button
                      type="button"
                      onClick={handleDeleteBlock}
                      title="Xóa ảnh minh họa"
                      className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa ảnh</span>
                    </button>
                    <img
                      src={imgUrl}
                      alt={altText}
                      className="max-h-64 rounded-xl border border-slate-200 shadow-xs object-contain bg-white p-1"
                    />
                  </div>
                );
              }
            }

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
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => handleDropSnippetOnCanvas(e, line.id)}
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
                        data-token-id={token.id}
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
                            if (!singleLine) handleInsertNewLineAfter(line.id);
                          } else if (e.key === 'Backspace') {
                            const sel = window.getSelection();
                            const spanText = e.currentTarget.textContent || '';
                            const isAtStart = sel && (sel.anchorOffset === 0 && sel.focusOffset === 0);
                            const isFirstToken = line.tokens[0]?.id === token.id;

                            // If at start of text span immediately after a formula, Backspace deletes the formula!
                            if (isAtStart && !isFirstToken) {
                              const tokenIdx = line.tokens.findIndex(t => t.id === token.id);
                              if (tokenIdx > 0 && line.tokens[tokenIdx - 1]?.isFormula) {
                                e.preventDefault();
                                handleDeleteActiveFormula(line.id, line.tokens[tokenIdx - 1].id);
                                return;
                              }
                            }

                            const lineEl = lineRefs.current[line.id];
                            const domLineText = lineEl ? (lineEl.innerText || '').replace(/\r?\n/g, '').trim() : '';
                            const isLineEmpty = !line.tokens.some(t => t.isFormula) && (domLineText === '' || spanText === '');

                            if (docLines.length > 1) {
                              const lineIdx = docLines.findIndex(l => l.id === line.id);
                              if (lineIdx > 0) {
                                if (isLineEmpty) {
                                  e.preventDefault();
                                  handleDeleteOrMergeLine(line.id);
                                  return;
                                }

                                if (isAtStart && isFirstToken) {
                                  e.preventDefault();
                                  handleDeleteOrMergeLine(line.id);
                                  return;
                                }
                              }
                            }
                          }
                        }}
                        className="outline-none focus:bg-cyan-50/50 rounded-xs transition-colors whitespace-pre-wrap font-sans align-baseline min-w-[8px] min-h-[1.25em] inline-block"
                      >
                        {displayText}
                      </span>
                    );
                  }

                  // CASE 2: FORMULA TOKEN (COMPACT INLINE FOOTPRINT)
                  const isActive = token.id === activeFormulaId;

                  // ACTIVE EDITING STATE: CLEAN VISUAL HIGHLIGHT IN PLACE
                  if (isActive) {
                    const handleDropOnFormulaInput = (e) => {
                      const dropped =
                        e.dataTransfer?.getData('text/veval-math') ||
                        e.dataTransfer?.getData('text/veval-bbt') ||
                        e.dataTransfer?.getData('text/plain');
                      if (!dropped) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const cleanDrop = String(dropped).trim().replace(/^\$+|\$+$/g, '');
                      if (!cleanDrop) return;
                      handleGenericLatexChange(line.id, token.id, cleanDrop);
                    };

                    return (
                      <span
                        key={token.id}
                        ref={activeFormulaRef}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDrop={handleDropOnFormulaInput}
                        className="inline-flex items-center align-baseline mx-0.5 px-1.5 py-0.5 bg-indigo-50/90 border-2 border-indigo-500 rounded-lg shadow-sm z-30 transition-all cursor-pointer"
                        title="Đang sửa công thức trong khung Studio nổi phía trên"
                      >
                        <span 
                          className="text-[13.5px] text-indigo-950 font-serif select-none"
                          dangerouslySetInnerHTML={{ __html: renderKatexHtml(token.latex || '\\text{(Trống)}', false) }}
                        />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse ml-1.5 shrink-0"></span>
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

      </div>

    </div>
  );
});

export default WordStyleFormulaCanvas;
