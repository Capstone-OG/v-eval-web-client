import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react';
import {
  Check,
  Trash2,
  Zap,
  Plus,
  Minus,
  SlidersHorizontal,
  Keyboard,
  X
} from 'lucide-react';
import {
  renderKatexHtml,
  normalizeMathString,
  unescapeLiteralNewlines
} from '../common/MathText';
import VariationTable, { parseVariationTableString } from '../common/VariationTable';
import InteractiveMathRenderer from '../common/InteractiveMathRenderer';
import AcademicChartBlock, {
  parseDataChartString,
  serializeDataChart
} from '../common/AcademicChartBlock';
import VisualMathField from './VisualMathField';

/* ============================================================================
 * 1. VISUAL FORMULA STRUCTURE PARSING & NATURAL UNICODE CONVERSION (0% RAW CODE)
 * ============================================================================ */

export function autoCalculateEquation(latex) {
  if (!latex || typeof latex !== 'string') return latex;
  const str = latex.trim();

  const chemCm = str.match(/C_M\s*=\s*(?:\\frac\{n\}\{V\}\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}(?:\s*=\s*[^\\$]+)?/);
  if (chemCm) {
    const num = parseFloat(chemCm[1]);
    const den = parseFloat(chemCm[2]);
    if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
      const val = num / den;
      const fmt = Number.isInteger(val) ? `${val}` : val.toFixed(2).replace(/\.00$/, '');
      return `C_M = \\frac{${chemCm[1]}}{${chemCm[2]}} = ${fmt}\\text{ M}`;
    }
  }

  const chemCp = str.match(/C\\%\s*=\s*(?:\\frac\{m_\{ct\}\}\{m_\{dd\}\}\s*\\times\s*100\\%\s*=\s*)?\\frac\{([^}]+)\}\{([^}]+)\}\s*\\times\s*100\\%(?:\s*=\s*[^%\\$]+\\%)?/);
  if (chemCp) {
    const num = parseFloat(chemCp[1]);
    const den = parseFloat(chemCp[2]);
    if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
      const val = (num / den) * 100;
      const fmt = Number.isInteger(val) ? `${val}` : val.toFixed(1).replace(/\.0$/, '');
      return `C\\% = \\frac{${chemCp[1]}}{${chemCp[2]}} \\times 100\\% = ${fmt}\\%`;
    }
  }

  const fracMatch = str.match(/^([\s\S]*?)\\frac\{([0-9.]+)\}\{([0-9.]+)\}(?:\s*=\s*([0-9.]+))?$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[2]);
    const den = parseFloat(fracMatch[3]);
    if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
      const val = num / den;
      const fmt = Number.isInteger(val) ? `${val}` : val.toFixed(2).replace(/\.00$/, '');
      return `${fracMatch[1] || ''}\\frac{${fracMatch[2]}}{${fracMatch[3]}} = ${fmt}`;
    }
  }

  const sqrtMatch = str.match(/^([\s\S]*?)\\sqrt(?:\[([0-9.]+)\])?\{([0-9.]+)\}(?:\s*=\s*([0-9.]+))?$/);
  if (sqrtMatch) {
    const deg = parseFloat(sqrtMatch[2]) || 2;
    const val = parseFloat(sqrtMatch[3]);
    if (!Number.isNaN(val) && val >= 0) {
      const res = deg === 2 ? Math.sqrt(val) : Math.pow(val, 1 / deg);
      const fmt = Number.isInteger(res) ? `${res}` : res.toFixed(2).replace(/\.00$/, '');
      return deg === 2
        ? `${sqrtMatch[1] || ''}\\sqrt{${sqrtMatch[3]}} = ${fmt}`
        : `${sqrtMatch[1] || ''}\\sqrt[${deg}]{${sqrtMatch[3]}} = ${fmt}`;
    }
  }

  let exprToEval = str;
  if (str.includes('=')) {
    exprToEval = str.slice(0, str.lastIndexOf('=')).trim();
  }
  const sanitized = exprToEval
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\div/g, '/')
    .replace(/×/g, '*')
    .replace(/·/g, '*')
    .replace(/\^\{?([0-9]+)\}?/g, '**$1')
    .trim();

  if (/^[0-9.\s+\-*/()]+$/.test(sanitized)) {
    try {
      const res = Function(`"use strict"; return (${sanitized})`)();
      if (typeof res === 'number' && !Number.isNaN(res) && Number.isFinite(res)) {
        const fmt = Number.isInteger(res) ? `${res}` : res.toFixed(2).replace(/\.00$/, '');
        return `${exprToEval} = ${fmt}`;
      }
    } catch {
      // ignore invalid math expression
    }
  }
  return str;
}

export function parseEquationStructure(latex) {
  if (!latex || typeof latex !== 'string') return { type: 'GENERAL', raw: '' };
  const s = latex.trim();

  const cmMatch = s.match(/^C_M\s*=\s*(?:\\frac\{n\}\{V\}\s*=\s*)?\\frac\{([^{}]+)\}\{([^{}]+)\}(?:\s*=\s*([0-9.,]+))?(?:\s*\\text\{\s*M\s*\})?$/);
  if (cmMatch) {
    return { type: 'CHEM_CM', num: cmMatch[1], den: cmMatch[2], result: cmMatch[3] || '' };
  }

  const cpMatch = s.match(/^C\\%\s*=\s*(?:\\frac\{m_\{ct\}\}\{m_\{dd\}\}\s*\\times\s*100\\%\s*=\s*)?\\frac\{([^{}]+)\}\{([^{}]+)\}\s*\\times\s*100\\%(?:\s*=\s*([0-9.,]+)\\%?)?$/);
  if (cpMatch) {
    return { type: 'CHEM_CPERCENT', num: cpMatch[1], den: cpMatch[2], result: cpMatch[3] || '' };
  }

  const intMatch = s.match(/^\\int_\{([^{}]+)\}\^\{([^{}]+)\}\s*([\s\S]+?)(?:\\,|\s*)dx$/);
  if (intMatch) {
    return { type: 'INTEGRAL', lower: intMatch[1], upper: intMatch[2], expr: intMatch[3].trim() };
  }

  const limMatch = s.match(/^\\lim_\{([^\s\\]+)\s*\\to\s*([^{}]+)\}\s*([\s\S]+)$/);
  if (limMatch) {
    return { type: 'LIMIT', variable: limMatch[1].trim(), target: limMatch[2].trim(), expr: limMatch[3].trim() };
  }

  const fracMatch = s.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}(?:\s*=\s*([^\\]+))?$/);
  if (fracMatch) {
    return { type: 'FRACTION', num: fracMatch[1], den: fracMatch[2], result: (fracMatch[3] || '').trim() };
  }

  const sqrtMatch = s.match(/^\\sqrt(?:\[([0-9a-zA-Z]+)\])?\{([^{}]+)\}(?:\s*=\s*([^\\]+))?$/);
  if (sqrtMatch) {
    return { type: 'SQRT', deg: sqrtMatch[1] || '2', expr: sqrtMatch[2], result: (sqrtMatch[3] || '').trim() };
  }

  const powMatch = s.match(/^([a-zA-Z0-9()]+)\^(?:\{([^{}]+)\}|([a-zA-Z0-9]+))$/);
  if (powMatch) {
    return { type: 'POWER', base: powMatch[1], exp: powMatch[2] || powMatch[3] };
  }

  const subMatch = s.match(/^([a-zA-Z0-9]+)_\{([^{}]+)\}$/) || s.match(/^([a-zA-Z0-9]+)_([a-zA-Z0-9]+)$/);
  if (subMatch) {
    return { type: 'SUBSCRIPT', base: subMatch[1], sub: subMatch[2] };
  }

  return { type: 'GENERAL', raw: s };
}

export function buildLatexFromStructure(struct) {
  if (!struct) return '';
  switch (struct.type) {
    case 'CHEM_CM':
      return `C_M = \\frac{${struct.num || 'n'}}{${struct.den || 'V'}}${struct.result ? ` = ${struct.result}\\text{ M}` : ''}`;
    case 'CHEM_CPERCENT':
      return `C\\% = \\frac{${struct.num || 'm_{ct}'}}{${struct.den || 'm_{dd}'}} \\times 100\\%${struct.result ? ` = ${struct.result}\\%` : ''}`;
    case 'INTEGRAL':
      return `\\int_{${struct.lower || 'a'}}^{${struct.upper || 'b'}} ${struct.expr || 'f(x)'}\\,dx`;
    case 'LIMIT':
      return `\\lim_{${struct.variable || 'x'} \\to ${struct.target || 'x_0'}} ${struct.expr || 'f(x)'}`;
    case 'FRACTION':
      return `\\frac{${struct.num || 'a'}}{${struct.den || 'b'}}${struct.result ? ` = ${struct.result}` : ''}`;
    case 'SQRT':
      return `${struct.deg && struct.deg !== '2' ? `\\sqrt[${struct.deg}]` : '\\sqrt'}{${struct.expr || 'x'}}${struct.result ? ` = ${struct.result}` : ''}`;
    case 'POWER':
      return `${struct.base || 'x'}^{${struct.exp || 'n'}}`;
    case 'SUBSCRIPT':
      return `${struct.base || 'x'}_{${struct.sub || '0'}}`;
    default:
      return struct.raw || '';
  }
}

/**
 * Convert internal LaTeX into readable natural academic typography (NEVER showing raw \frac or ///)
 */
export function latexToNaturalMath(latex) {
  if (!latex || typeof latex !== 'string') return '';
  let out = latex.trim();

  // Strip \text{...} wrapper cleanly
  out = out.replace(/\\text\{([^{}]*)\}/g, '$1');
  out = out.replace(/\\mathbb\{R\}/g, 'ℝ');

  // Iteratively unwrap innermost braced constructs (\sqrt, \vec, ^, _, \frac) from inside out
  for (let i = 0; i < 6; i++) {
    out = out
      .replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, 'căn[$1]($2)')
      .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
      .replace(/\\vec\{([^{}]+)\}/g, '$1⃗')
      .replace(/\^\{2\}/g, '²')
      .replace(/\^\{3\}/g, '³')
      .replace(/\^\{([^{}]+)\}/g, '^($1)')
      .replace(/_\{([^{}]+)\}/g, '_$1')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, a, b) => {
        const ca = a.trim();
        const cb = b.trim();
        const left = /[\s+\-±∓]/.test(ca) ? `(${ca})` : ca;
        const right = /[\s+\-±∓]/.test(cb) ? `(${cb})` : cb;
        return `${left}/${right}`;
      });
  }

  out = out
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\Longleftrightarrow|\\Leftrightarrow|\\iff/g, '⇔')
    .replace(/\\Longrightarrow|\\Rightarrow|\\implies/g, '⇒')
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\neq/g, '≠')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\varphi|\\phi/g, 'φ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\pi/g, 'π')
    .replace(/\\mu/g, 'μ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\eta/g, 'η')
    .replace(/\\perp/g, '⊥')
    .replace(/\\parallel/g, '∥')
    .replace(/\\angle/g, '∠')
    .replace(/\\in\b/g, '∈')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\subset\b/g, '⊂')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\forall\b/g, '∀')
    .replace(/\\exists\b/g, '∃')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\lim/g, 'lim')
    .replace(/\\%/g, '%')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\left|\\right/g, '')
    .replace(/\\vec\{([^{}]+)\}/g, '$1⃗')
    .replace(/\^\{2\}/g, '²')
    .replace(/\^2\b/g, '²')
    .replace(/\^\{3\}/g, '³')
    .replace(/\^3\b/g, '³')
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/_\{([^{}]+)\}/g, '_$1')
    .replace(/\{\,\}/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  return out;
}

/**
 * Convert readable natural academic typography back into valid KaTeX LaTeX
 */
export function naturalMathToLatex(natural) {
  if (!natural || typeof natural !== 'string') return '';
  let s = natural.trim();
  if (!s) return '';

  s = s
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/ℝ/g, '\\mathbb{R}')
    .replace(/⇌/g, ' \\rightleftharpoons ')
    .replace(/⇔/g, ' \\Leftrightarrow ')
    .replace(/⇒/g, ' \\Rightarrow ')
    .replace(/→/g, ' \\rightarrow ')
    .replace(/↑/g, '\\uparrow ')
    .replace(/↓/g, '\\downarrow ')
    .replace(/×/g, ' \\times ')
    .replace(/·/g, ' \\cdot ')
    .replace(/÷/g, ' \\div ')
    .replace(/±/g, ' \\pm ')
    .replace(/∓/g, ' \\mp ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≈/g, ' \\approx ')
    .replace(/∞/g, '\\infty')
    .replace(/Δ/g, '\\Delta ')
    .replace(/α/g, '\\alpha ')
    .replace(/β/g, '\\beta ')
    .replace(/γ/g, '\\gamma ')
    .replace(/θ/g, '\\theta ')
    .replace(/λ/g, '\\lambda ')
    .replace(/ω/g, '\\omega ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/φ/g, '\\varphi ')
    .replace(/Φ/g, '\\Phi ')
    .replace(/π/g, '\\pi ')
    .replace(/μ/g, '\\mu ')
    .replace(/ρ/g, '\\rho ')
    .replace(/η/g, '\\eta ')
    .replace(/⊥/g, ' \\perp ')
    .replace(/∥/g, ' \\parallel ')
    .replace(/∠/g, '\\angle ')
    .replace(/∈/g, ' \\in ')
    .replace(/∉/g, ' \\notin ')
    .replace(/⊂/g, ' \\subset ')
    .replace(/∪/g, ' \\cup ')
    .replace(/∩/g, ' \\cap ')
    .replace(/∀/g, '\\forall ')
    .replace(/∃/g, '\\exists ')
    .replace(/∅/g, '\\emptyset')
    .replace(/∑/g, '\\sum ')
    .replace(/∫/g, '\\int ')
    .replace(/căn\[([^\]]+)\]\(([^)]+)\)/gi, '\\sqrt[$1]{$2}')
    .replace(/(?:căn|sqrt|√)\(([^)]+)\)/gi, '\\sqrt{$1}')
    .replace(/\^\(([^)]+)\)/g, '^{$1}')
    .replace(/([A-Za-z0-9])_([A-Za-z0-9đĐ]{2,})/g, '$1_{$2}')
    .replace(/([^\\])%/g, '$1\\%');

  // Convert clean fractions like (a+b)/(c+d) or 12/4 into \frac{...}{...}
  s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
  s = s.replace(/([A-Za-z0-9_{}^.]+)\s*\/\s*([A-Za-z0-9_{}^.]+)/g, '\\frac{$1}{$2}');

  return s.replace(/\s+/g, ' ').trim();
}

/* ============================================================================
 * 2. MARKDOWN <-> RICH DOCUMENT BLOCK CONVERTERS (WORD + EXCEL + KATEX)
 * ============================================================================ */

let blockUidSeq = 1;
const nextUid = (prefix = 'blk') => `${prefix}-${Date.now()}-${blockUidSeq++}`;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFormulaChipHtml(latex, displayMode = false) {
  const safeLatex = (latex || '').trim();
  const rendered = renderKatexHtml(safeLatex || '\\square', Boolean(displayMode));
  const encoded = encodeURIComponent(safeLatex);
  return `<span class="veval-formula-chip" contenteditable="false" data-latex="${encoded}" data-display="${displayMode ? '1' : '0'}">${rendered}</span>`;
}

/**
 * Phát hiện chuỗi LaTeX thực chất chỉ là văn bản tiếng Việt thuần (vd: \text{Ẩn dụ (...)},
 * hoặc \text{Nói quá (Phóng đại)} \leftrightarrow \text{Nói giảm nói tránh (Tế nhị)} từ bảng Ngữ văn)
 * để giữ là chữ thường chỉnh sửa trực tiếp thay vì biến thành formula-chip bị khóa.
 */
function unwrapPureVietnameseTextLatex(latex) {
  if (!latex || typeof latex !== 'string') return null;
  let inner = latex.trim();

  // Giải nén tất cả các cụm \text{...}, \textbf{...}, \textit{...} và mũi tên nối đơn giản
  inner = inner
    .replace(/\\(?:text|textbf|textit|textrm|mathrm)\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:Longleftrightarrow|Leftrightarrow|iff)\b/g, '⇔')
    .replace(/\\(?:longleftrightarrow|leftrightarrow)\b/g, '↔')
    .replace(/\\(?:Longrightarrow|Rightarrow|implies)\b/g, '⇒')
    .replace(/\\(?:longrightarrow|rightarrow|to)\b/g, '→')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\quad/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const hasVietnameseDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(inner);
  const hasMathSyntax = /\\[a-zA-Z]+|[\^_{}=<>±×÷∑∫√∞≤≥≠≈]/.test(inner);
  if (hasVietnameseDiacritics && !hasMathSyntax) {
    return inner;
  }
  return null;
}

function inlineMarkdownToHtml(rawLine) {
  if (!rawLine) return '';
  // Normalize math safely so bare formulas never leak raw \frac into the editor
  let prepared = rawLine;
  if (/\\(?:frac|sqrt|sum|int|lim|vec|Delta|alpha|beta|pi|rightarrow|rightleftharpoons)\b/.test(prepared) && !prepared.includes('$')) {
    prepared = normalizeMathString(prepared);
  }

  // 1. Extract explicit $...$ and $$...$$ formulas into placeholders first
  // (Tránh biến văn bản tiếng Việt thuần như \text{Ẩn dụ (...)} thành formula-chip bị bôi xanh cả đoạn khi click)
  const formulas = [];
  const withPlaceholders = prepared.replace(/(\$\$[\s\S]*?\$\$|\$[^$\r\n]+?\$)/g, (match) => {
    const isDisplay = match.startsWith('$$') && match.endsWith('$$');
    const latex = (isDisplay ? match.slice(2, -2) : match.slice(1, -1)).trim();
    const plainVi = unwrapPureVietnameseTextLatex(latex);
    if (plainVi !== null) {
      return plainVi;
    }
    const idx = formulas.length;
    formulas.push({ latex, isDisplay });
    return `@@VF${idx}@@`;
  });

  // 2. Preserve <u>...</u> tags across HTML escaping
  const underlines = [];
  const withUnderlineTokens = withPlaceholders.replace(/<u>([\s\S]*?)<\/u>/gi, (_, inner) => {
    const idx = underlines.length;
    underlines.push(inner);
    return `@@VU${idx}@@`;
  });

  // 3. Escape raw HTML
  let html = escapeHtml(withUnderlineTokens);

  // 4. Apply inline Markdown styling cleanly
  html = html
    .replace(/\*\*\*([^*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+?)\*(?=$|[\s.,;:!?)])/g, '$1<em>$2</em>')
    .replace(/~~([^~\n]+?)~~/g, '<s>$1</s>');

  // 5. Restore <u>...</u>
  html = html.replace(/@@VU(\d+)@@/g, (_, idxStr) => {
    const rawInner = underlines[Number(idxStr)] || '';
    const innerHtml = escapeHtml(rawInner)
      .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
    return `<u>${innerHtml}</u>`;
  });

  // 6. Restore KaTeX visual formula chips
  html = html.replace(/@@VF(\d+)@@/g, (_, idxStr) => {
    const f = formulas[Number(idxStr)];
    return f ? buildFormulaChipHtml(f.latex, f.isDisplay) : '';
  });

  return html;
}

function markdownTextToRichHtml(mdText, singleLine = false) {
  if (!mdText || !String(mdText).trim()) return '';
  const lines = String(mdText).split(/\r?\n/);

  if (singleLine) {
    return inlineMarkdownToHtml(lines.join(' ').trim());
  }

  const out = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      continue;
    }

    // Headings
    const h2Match = trimmed.match(/^#{1,2}\s+(.*)$/);
    if (h2Match) {
      closeLists();
      out.push(`<h2>${inlineMarkdownToHtml(h2Match[1])}</h2>`);
      continue;
    }
    const h3Match = trimmed.match(/^#{3,6}\s+(.*)$/);
    if (h3Match) {
      closeLists();
      out.push(`<h3>${inlineMarkdownToHtml(h3Match[1])}</h3>`);
      continue;
    }

    // Bullet list
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inlineMarkdownToHtml(ulMatch[1])}</li>`);
      continue;
    }

    // Numbered list
    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (olMatch) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inlineMarkdownToHtml(olMatch[1])}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`);
  }

  closeLists();
  return out.join('');
}

function parseTableBlockLines(tableLines) {
  const splitRow = (line) => {
    let raw = line.trim();
    if (raw.startsWith('|')) raw = raw.slice(1);
    if (raw.endsWith('|')) raw = raw.slice(0, -1);
    return raw.split('|').map(c => c.trim());
  };
  const headers = splitRow(tableLines[0]);
  const colCount = Math.max(1, headers.length);
  const rows = tableLines.slice(2).map(line => {
    const cells = splitRow(line);
    while (cells.length < colCount) cells.push('');
    return cells.slice(0, colCount);
  });
  return {
    headers,
    rows: rows.length > 0 ? rows : [Array(colCount).fill('')]
  };
}

function serializeTableBlock(tableData) {
  const headers = (tableData.headers || ['Cột 1', 'Cột 2']).map(h => String(h || '').replace(/\|/g, '/').trim() || ' ');
  const sep = headers.map(() => '---');
  const rows = (tableData.rows || []).map(row =>
    headers.map((_, cIdx) => String(row[cIdx] ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ').trim())
  );
  return [
    `| ${headers.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`)
  ].join('\n');
}

function parseMarkdownToBlocks(rawText, singleLine = false) {
  if (!rawText || !String(rawText).trim()) {
    return [{ id: nextUid('rich'), type: 'rich', html: '' }];
  }

  const normalized = unescapeLiteralNewlines(String(rawText)).replace(/\\+\s*$/gm, '');
  if (singleLine) {
    return [{ id: nextUid('rich'), type: 'rich', html: markdownTextToRichHtml(normalized, true) }];
  }

  const specialBlockRegex = /(\[DATA_CHART\][\s\S]*?\[\/DATA_CHART\]|\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|!\[[^\]]*\]\([^\)]+\))/gi;
  const segments = normalized.split(specialBlockRegex);
  const blocks = [];

  const pushTextWithTables = (textChunk) => {
    const lines = textChunk.split(/\r?\n/);
    let textBuf = [];
    let i = 0;

    const flushText = () => {
      const joined = textBuf.join('\n').trim();
      textBuf = [];
      if (!joined) return;
      blocks.push({
        id: nextUid('rich'),
        type: 'rich',
        html: markdownTextToRichHtml(joined, false)
      });
    };

    while (i < lines.length) {
      const cur = lines[i].trim();
      const next = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const isTableStart =
        cur.startsWith('|') &&
        cur.includes('|') &&
        /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(next);

      if (isTableStart) {
        flushText();
        const tableLines = [lines[i], lines[i + 1]];
        i += 2;
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        blocks.push({
          id: nextUid('table'),
          type: 'table',
          ...parseTableBlockLines(tableLines)
        });
      } else {
        textBuf.push(lines[i]);
        i++;
      }
    }
    flushText();
  };

  segments.forEach((seg) => {
    if (!seg) return;
    const trimmed = seg.trim();
    if (!trimmed) return;
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('[DATA_CHART]') && upper.endsWith('[/DATA_CHART]')) {
      blocks.push({ id: nextUid('chart'), type: 'chart', data: parseDataChartString(trimmed) });
      return;
    }
    if (upper.startsWith('[VARIATION_TABLE]') && upper.endsWith('[/VARIATION_TABLE]')) {
      blocks.push({ id: nextUid('var'), type: 'variation', rawBlock: trimmed });
      return;
    }
    if (
      (upper.startsWith('[MATH_GRAPH_3D]') && upper.endsWith('[/MATH_GRAPH_3D]')) ||
      (upper.startsWith('[MATH_GEOMETRY_2D]') && upper.endsWith('[/MATH_GEOMETRY_2D]')) ||
      (upper.startsWith('[MATH_GRAPH]') && upper.endsWith('[/MATH_GRAPH]'))
    ) {
      const blockType = upper.startsWith('[MATH_GRAPH_3D]')
        ? 'MATH_GRAPH_3D'
        : upper.startsWith('[MATH_GEOMETRY_2D]')
        ? 'MATH_GEOMETRY_2D'
        : 'MATH_GRAPH';
      blocks.push({ id: nextUid('graph'), type: 'graph', blockType, rawBlock: trimmed });
      return;
    }
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
    if (imgMatch) {
      blocks.push({ id: nextUid('img'), type: 'image', alt: imgMatch[1] || 'Hình minh họa', url: imgMatch[2] });
      return;
    }

    pushTextWithTables(seg);
  });

  if (blocks.length === 0) {
    return [{ id: nextUid('rich'), type: 'rich', html: '' }];
  }
  return blocks;
}

function domNodeToMarkdown(node) {
  if (!node) return '';
  if (node.nodeType === 3) {
    return (node.nodeValue || '').replace(/\u00A0/g, ' ');
  }
  if (node.nodeType !== 1) return '';

  const el = node;
  if (el.classList?.contains('veval-formula-chip')) {
    const latex = decodeURIComponent(el.getAttribute('data-latex') || '').trim();
    if (!latex) return '';
    const isDisplay = el.getAttribute('data-display') === '1';
    return isDisplay ? `$$${latex}$$` : `$${latex}$`;
  }

  const tag = el.tagName.toUpperCase();
  const childrenMd = () => Array.from(el.childNodes).map(domNodeToMarkdown).join('');

  switch (tag) {
    case 'BR':
      return '\n';
    case 'STRONG':
    case 'B': {
      const inner = childrenMd().trim();
      return inner ? `**${inner}**` : '';
    }
    case 'EM':
    case 'I': {
      const inner = childrenMd().trim();
      return inner ? `*${inner}*` : '';
    }
    case 'U': {
      const inner = childrenMd().trim();
      return inner ? `<u>${inner}</u>` : '';
    }
    case 'S':
    case 'STRIKE':
    case 'DEL': {
      const inner = childrenMd().trim();
      return inner ? `~~${inner}~~` : '';
    }
    case 'H1':
    case 'H2': {
      const inner = childrenMd().trim();
      return inner ? `## ${inner}\n` : '';
    }
    case 'H3':
    case 'H4': {
      const inner = childrenMd().trim();
      return inner ? `### ${inner}\n` : '';
    }
    case 'UL': {
      const items = Array.from(el.children)
        .filter(c => c.tagName.toUpperCase() === 'LI')
        .map(li => {
          const t = Array.from(li.childNodes).map(domNodeToMarkdown).join('').trim();
          return t ? `- ${t}` : '';
        })
        .filter(Boolean);
      return items.length > 0 ? `${items.join('\n')}\n` : '';
    }
    case 'OL': {
      const items = Array.from(el.children)
        .filter(c => c.tagName.toUpperCase() === 'LI')
        .map((li, idx) => {
          const t = Array.from(li.childNodes).map(domNodeToMarkdown).join('').trim();
          return t ? `${idx + 1}. ${t}` : '';
        })
        .filter(Boolean);
      return items.length > 0 ? `${items.join('\n')}\n` : '';
    }
    case 'LI': {
      const inner = childrenMd().trim();
      return inner ? `- ${inner}\n` : '';
    }
    case 'P':
    case 'DIV': {
      const inner = childrenMd().replace(/\n+$/g, '').trim();
      return inner ? `${inner}\n` : '\n';
    }
    default:
      return childrenMd();
  }
}

function richHtmlToMarkdown(html, singleLine = false) {
  if (!html || typeof document === 'undefined') return '';
  const container = document.createElement('div');
  container.innerHTML = html;
  const raw = Array.from(container.childNodes).map(domNodeToMarkdown).join('');
  if (singleLine) {
    return raw.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return raw.replace(/\n{3,}/g, '\n\n').trim();
}

function serializeBlocksToMarkdown(blocks, singleLine = false) {
  const parts = [];
  blocks.forEach((blk) => {
    if (blk.type === 'rich') {
      const md = richHtmlToMarkdown(blk.html, singleLine);
      if (md) parts.push(md);
    } else if (blk.type === 'table') {
      parts.push(serializeTableBlock(blk));
    } else if (blk.type === 'chart') {
      parts.push(serializeDataChart(blk.data));
    } else if (blk.type === 'variation') {
      parts.push(blk.rawBlock);
    } else if (blk.type === 'graph') {
      parts.push(blk.rawBlock);
    } else if (blk.type === 'image') {
      parts.push(`![${blk.alt || 'Hình minh họa'}](${blk.url})`);
    }
  });
  return singleLine ? parts.join(' ').trim() : parts.join('\n\n').trim();
}

/* ============================================================================
 * 3. EXCEL-LIKE INLINE EDITABLE TABLE BLOCK
 * ============================================================================ */

function EditableTableBlock({ block, onChange, onDelete }) {
  const [editingCell, setEditingCell] = useState(null); // { section: 'head'|'body', r, c }
  const cellInputRefs = useRef({});

  const colCount = block.headers.length;
  const rowCount = block.rows.length;

  const focusCell = (section, r, c) => {
    setEditingCell({ section, r, c });
    setTimeout(() => {
      const el = cellInputRefs.current[`${section}-${r}-${c}`];
      if (el) {
        el.focus();
        const len = typeof el.value === 'string' ? el.value.length : 0;
        if (typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(len, len);
        }
      }
    }, 0);
  };

  const handleHeaderChange = (cIdx, val) => {
    const nextHeaders = block.headers.map((h, i) => (i === cIdx ? val : h));
    onChange({ ...block, headers: nextHeaders });
  };

  const handleCellChange = (rIdx, cIdx, val) => {
    const nextRows = block.rows.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? val : cell)) : row
    );
    onChange({ ...block, rows: nextRows });
  };

  const addRow = () => {
    const nextRows = [...block.rows, Array(colCount).fill('')];
    onChange({ ...block, rows: nextRows });
    focusCell('body', nextRows.length - 1, 0);
  };

  const removeLastRow = () => {
    if (rowCount <= 1) return;
    onChange({ ...block, rows: block.rows.slice(0, -1) });
  };

  const addCol = () => {
    const nextHeaders = [...block.headers, `Cột ${colCount + 1}`];
    const nextRows = block.rows.map(r => [...r, '']);
    onChange({ ...block, headers: nextHeaders, rows: nextRows });
  };

  const removeLastCol = () => {
    if (colCount <= 1) return;
    onChange({
      ...block,
      headers: block.headers.slice(0, -1),
      rows: block.rows.map(r => r.slice(0, -1))
    });
  };

  const handleCellKeyDown = (e, section, r, c) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (c > 0) focusCell(section, r, c - 1);
        else if (section === 'body' && r > 0) focusCell('body', r - 1, colCount - 1);
        else if (section === 'body' && r === 0) focusCell('head', 0, colCount - 1);
      } else {
        if (c + 1 < colCount) focusCell(section, r, c + 1);
        else if (section === 'head') focusCell('body', 0, 0);
        else if (r + 1 < rowCount) focusCell('body', r + 1, 0);
        else addRow();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (section === 'head') focusCell('body', 0, c);
      else if (r + 1 < rowCount) focusCell('body', r + 1, c);
      else addRow();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const renderCellDisplay = (text) => {
    if (!text || !String(text).trim()) {
      return <span className="text-slate-300 select-none">—</span>;
    }
    return (
      <span
        className="inline-block leading-snug"
        dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(String(text)) }}
      />
    );
  };

  return (
    <div className="my-3 rounded-xl border border-[#E5E3DC] bg-white overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.03)] group">
      {/* Subtle Excel Toolbar */}
      <div className="px-3 py-1.5 bg-[#F7F6F2] border-b border-[#ECEAE4] flex items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold text-slate-500">
          Bảng ({rowCount + 1} × {colCount})
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addRow}
            className="px-2 py-0.5 rounded-md bg-white hover:bg-[#EEF2F7] text-slate-600 hover:text-[#1E3A5F] border border-[#E5E3DC] font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Hàng
          </button>
          <button
            type="button"
            onClick={addCol}
            className="px-2 py-0.5 rounded-md bg-white hover:bg-[#EEF2F7] text-slate-600 hover:text-[#1E3A5F] border border-[#E5E3DC] font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Cột
          </button>
          <button
            type="button"
            disabled={rowCount <= 1}
            onClick={removeLastRow}
            className="px-1.5 py-0.5 rounded-md bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-[#E5E3DC] disabled:opacity-35 cursor-pointer"
            title="Xóa hàng cuối"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            disabled={colCount <= 1}
            onClick={removeLastCol}
            className="px-1.5 py-0.5 rounded-md bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-[#E5E3DC] disabled:opacity-35 cursor-pointer"
            title="Xóa cột cuối"
          >
            <span className="text-[10px] font-bold">−C</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
            title="Xóa bảng"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF9F6] border-b border-[#E5E3DC]">
              {block.headers.map((header, cIdx) => {
                const isEd = editingCell?.section === 'head' && editingCell?.c === cIdx;
                return (
                  <th
                    key={cIdx}
                    onClick={() => focusCell('head', 0, cIdx)}
                    className={`p-0 border-r last:border-r-0 border-[#ECEAE4] text-left font-semibold text-slate-800 cursor-text min-w-[110px] ${
                      isEd ? 'ring-2 ring-inset ring-[#2C4C7E]/50 bg-white' : ''
                    }`}
                  >
                    {isEd ? (
                      <input
                        ref={el => (cellInputRefs.current[`head-0-${cIdx}`] = el)}
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => handleCellKeyDown(e, 'head', 0, cIdx)}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-transparent outline-none"
                      />
                    ) : (
                      <div className="px-3 py-2 min-h-[34px]">{renderCellDisplay(header)}</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECEAE4]">
            {block.rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#FDFCFA]' : 'bg-white'}>
                {row.map((cell, cIdx) => {
                  const isEd = editingCell?.section === 'body' && editingCell?.r === rIdx && editingCell?.c === cIdx;
                  return (
                    <td
                      key={cIdx}
                      onClick={() => focusCell('body', rIdx, cIdx)}
                      className={`p-0 border-r last:border-r-0 border-[#ECEAE4] text-slate-700 cursor-text ${
                        isEd ? 'ring-2 ring-inset ring-[#2C4C7E]/50 bg-white' : 'hover:bg-[#FAF9F6]'
                      }`}
                    >
                      {isEd ? (
                        <input
                          ref={el => (cellInputRefs.current[`body-${rIdx}-${cIdx}`] = el)}
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => handleCellKeyDown(e, 'body', rIdx, cIdx)}
                          className="w-full px-3 py-2 text-xs text-slate-900 bg-transparent outline-none"
                        />
                      ) : (
                        <div className="px-3 py-2 min-h-[34px]">{renderCellDisplay(cell)}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. UNIFIED WORD-LIKE RICH EDITABLE BLOCK (NATIVE SELECTION, ENTER, BACKSPACE)
 * ============================================================================ */

const RichTextBlock = forwardRef(function RichTextBlock(
  {
    html,
    placeholder,
    singleLine,
    compact,
    onChangeHtml,
    onFocusBlock,
    onClickFormulaChip,
    onDropSnippet,
    onPasteImage,
    onBackspaceAtStart
  },
  ref
) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef(null);
  const savedRangeRef = useRef(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (html !== lastHtmlRef.current) {
      el.innerHTML = html || '';
      lastHtmlRef.current = html || '';
    }
  }, [html]);

  const saveSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const emitHtml = () => {
    const el = editorRef.current;
    if (!el) return;
    const next = el.innerHTML;
    lastHtmlRef.current = next;
    onChangeHtml(next);
  };

  const restoreOrEndSelection = () => {
    const el = editorRef.current;
    if (!el) return null;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return null;
    if (savedRangeRef.current && el.contains(savedRangeRef.current.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      return sel.getRangeAt(0);
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
    return range;
  };

  const transformSelectionCase = (mode) => {
    const el = editorRef.current;
    if (!el) return;
    const range = restoreOrEndSelection();
    if (!range || range.collapsed) return;

    const applyCase = (str) => {
      if (mode === 'uppercase') return str.toLocaleUpperCase('vi-VN');
      if (mode === 'lowercase') return str.toLocaleLowerCase('vi-VN');
      // capitalize
      return str
        .toLocaleLowerCase('vi-VN')
        .replace(/(^|[\s.,;:!?(-])([^\s.,;:!?(-])/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase('vi-VN'));
    };

    const walker = document.createTreeWalker(
      range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes = [];
    let current = walker.nextNode();
    while (current) {
      const inFormula = current.parentElement?.closest?.('.veval-formula-chip');
      if (!inFormula && range.intersectsNode(current)) {
        textNodes.push(current);
      }
      current = walker.nextNode();
    }

    if (textNodes.length === 0 && range.startContainer.nodeType === 3) {
      const node = range.startContainer;
      if (!node.parentElement?.closest?.('.veval-formula-chip')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((node) => {
      const val = node.nodeValue || '';
      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : val.length;
      if (end > start) {
        node.nodeValue = val.slice(0, start) + applyCase(val.slice(start, end)) + val.slice(end);
      }
    });

    emitHtml();
  };

  useImperativeHandle(ref, () => ({
    focusEnd: () => {
      restoreOrEndSelection();
    },
    insertFormula: (latex, displayMode = false) => {
      const el = editorRef.current;
      if (!el) return;
      const range = restoreOrEndSelection();
      if (!range) return;

      const wrapper = document.createElement('span');
      wrapper.innerHTML = buildFormulaChipHtml(latex, displayMode);
      const chip = wrapper.firstChild;
      const spacer = document.createTextNode('\u00A0');

      range.deleteContents();
      range.insertNode(spacer);
      range.insertNode(chip);

      const nextRange = document.createRange();
      nextRange.setStartAfter(spacer);
      nextRange.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(nextRange);
      }
      savedRangeRef.current = nextRange.cloneRange();
      emitHtml();
    },
    insertHtmlFragment: (fragmentHtml) => {
      const el = editorRef.current;
      if (!el) return;
      const range = restoreOrEndSelection();
      if (!range) return;
      try {
        if (document.execCommand('insertHTML', false, fragmentHtml)) {
          saveSelection();
          emitHtml();
          return;
        }
      } catch {
        // fallback below
      }
      range.deleteContents();
      const temp = document.createElement('div');
      temp.innerHTML = fragmentHtml;
      const frag = document.createDocumentFragment();
      let lastNode = null;
      while (temp.firstChild) {
        lastNode = frag.appendChild(temp.firstChild);
      }
      range.insertNode(frag);
      if (lastNode) {
        const nextRange = document.createRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(nextRange);
        }
        savedRangeRef.current = nextRange.cloneRange();
      }
      emitHtml();
    },
    execFormat: (cmd, value = null) => {
      const el = editorRef.current;
      if (!el) return;
      restoreOrEndSelection();

      if (cmd === 'uppercase' || cmd === 'lowercase' || cmd === 'capitalize') {
        transformSelectionCase(cmd);
        return;
      }
      if (cmd === 'heading2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (cmd === 'heading3') {
        document.execCommand('formatBlock', false, '<h3>');
      } else if (cmd === 'paragraph') {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        document.execCommand(cmd, false, value);
      }
      saveSelection();
      emitHtml();
    },
    updateFormulaChipElement: (chipEl, nextLatex) => {
      if (!chipEl || !editorRef.current?.contains(chipEl)) return;
      const isDisplay = chipEl.getAttribute('data-display') === '1';
      chipEl.setAttribute('data-latex', encodeURIComponent(nextLatex));
      chipEl.innerHTML = renderKatexHtml(nextLatex || '\\square', isDisplay);
      emitHtml();
    },
    deleteFormulaChipElement: (chipEl) => {
      if (!chipEl || !editorRef.current?.contains(chipEl)) return;
      chipEl.remove();
      emitHtml();
    }
  }));

  const handleClick = (e) => {
    const chip = e.target?.closest?.('.veval-formula-chip');
    if (chip && editorRef.current?.contains(chip)) {
      e.preventDefault();
      e.stopPropagation();
      const latex = decodeURIComponent(chip.getAttribute('data-latex') || '');
      onClickFormulaChip(chip, latex);
      return;
    }
    saveSelection();
  };

  const handleKeyDown = (e) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace' && onBackspaceAtStart) {
      const el = editorRef.current;
      const sel = window.getSelection();
      if (el && sel && sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = document.createRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = preRange.toString().replace(/\u200B/g, '');
        if (textBefore.length === 0 && !preRange.cloneContents().querySelector('.veval-formula-chip')) {
          const plainAll = (el.textContent || '').trim();
          const hasChips = Boolean(el.querySelector('.veval-formula-chip'));
          if (!plainAll && !hasChips) {
            e.preventDefault();
            onBackspaceAtStart();
          }
        }
      }
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob && onPasteImage) {
            const reader = new FileReader();
            reader.onload = (ev) => onPasteImage(ev.target.result);
            reader.readAsDataURL(blob);
          }
          return;
        }
      }
    }

    const plain = e.clipboardData?.getData('text/plain');
    if (plain && (plain.includes('$') || plain.includes('**') || plain.includes('\\frac') || plain.includes('\\sqrt'))) {
      e.preventDefault();
      const converted = singleLine
        ? inlineMarkdownToHtml(plain.replace(/\r?\n/g, ' '))
        : markdownTextToRichHtml(plain, false);
      const range = restoreOrEndSelection();
      if (range) {
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = converted;
        const frag = document.createDocumentFragment();
        let last = null;
        while (temp.firstChild) last = frag.appendChild(temp.firstChild);
        range.insertNode(frag);
        if (last) {
          const nr = document.createRange();
          nr.setStartAfter(last);
          nr.collapse(true);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(nr);
          }
        }
        emitHtml();
      }
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onFocus={() => {
        onFocusBlock?.();
        saveSelection();
      }}
      onInput={() => {
        saveSelection();
        emitHtml();
      }}
      onKeyUp={saveSelection}
      onMouseUp={saveSelection}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        const dropped =
          e.dataTransfer?.getData('text/veval-math') ||
          e.dataTransfer?.getData('text/veval-bbt') ||
          e.dataTransfer?.getData('text/plain');
        if (dropped) {
          e.preventDefault();
          e.stopPropagation();
          onDropSnippet?.(dropped);
        }
      }}
      className={`veval-rich-editor outline-none text-slate-800 ${
        singleLine
          ? 'text-[13.5px] leading-snug min-h-[24px] py-0.5'
          : compact
          ? 'text-[13.5px] leading-relaxed min-h-[72px]'
          : 'text-[15px] leading-[1.78] min-h-[280px]'
      }`}
    />
  );
});

/* ============================================================================
 * 5. QUICK VISUAL KEYPAD FOR FORMULA POPOVER (100% KATEX RENDERED, 0% RAW CODE)
 * ============================================================================ */

const POPOVER_VISUAL_KEYS = [
  { label: 'Phân số', code: '\\frac{a}{b}', isTemplate: true },
  { label: 'Căn bậc 2', code: '\\sqrt{x}', isTemplate: true },
  { label: 'Lũy thừa', code: 'x^2', isTemplate: true },
  { label: 'Chỉ số', code: 'x_0', isTemplate: true },
  { label: 'Cộng trừ', insert: '±', preview: '\\pm' },
  { label: 'Nhân', insert: '×', preview: '\\times' },
  { label: 'Chấm nhân', insert: '·', preview: '\\cdot' },
  { label: 'Khác', insert: '≠', preview: '\\neq' },
  { label: 'Nhỏ hơn bằng', insert: '≤', preview: '\\le' },
  { label: 'Lớn hơn bằng', insert: '≥', preview: '\\ge' },
  { label: 'Mũi tên', insert: '→', preview: '\\rightarrow' },
  { label: 'Thuận nghịch', insert: '⇌', preview: '\\rightleftharpoons' },
  { label: 'Khí lên', insert: '↑', preview: '\\uparrow' },
  { label: 'Kết tủa', insert: '↓', preview: '\\downarrow' },
  { label: 'Delta', insert: 'Δ', preview: '\\Delta' },
  { label: 'Pi', insert: 'π', preview: '\\pi' },
  { label: 'Vô cực', insert: '∞', preview: '\\infty' }
];

/* ============================================================================
 * 6. MAIN EXPORTED COMPONENT: WordStyleFormulaCanvas
 * ============================================================================ */

const WordStyleFormulaCanvas = forwardRef(function WordStyleFormulaCanvas(
  {
    content = '',
    onChange,
    onOpenAdvancedModal = null,
    onEditMathGraph = null,
    compact = false,
    singleLine = false,
    placeholder = 'Bắt đầu nhập nội dung...'
  },
  ref
) {
  const [blocks, setBlocks] = useState(() => parseMarkdownToBlocks(content, singleLine));
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const lastSerializedRef = useRef(serializeBlocksToMarkdown(blocks, singleLine));

  const containerRef = useRef(null);
  const richRefs = useRef({});
  const activeBlockIdRef = useRef(blocks[0]?.id || null);

  // Active formula chip popover state
  const [activeFormula, setActiveFormula] = useState(null); // { blockId, chipEl, latex, struct, top, left }
  const popoverRef = useRef(null);
  const visualMathRef = useRef(null);
  const [mathKbVisible, setMathKbVisible] = useState(false);
  const [mathKbHeight, setMathKbHeight] = useState(290);

  // Theo dõi trạng thái mở/đóng và chiều cao bàn phím ảo MathLive để đặt nút Đóng ngay trên mép trên bàn phím
  useEffect(() => {
    const kb = window.mathVirtualKeyboard;
    if (!kb) return undefined;
    const syncKb = () => {
      const visible = Boolean(kb.visible);
      setMathKbVisible(visible);
      const h = kb.boundingRect?.height;
      if (visible && h > 50) {
        setMathKbHeight(Math.round(h));
      }
    };
    syncKb();
    kb.addEventListener?.('virtual-keyboard-toggle', syncKb);
    kb.addEventListener?.('geometrychange', syncKb);
    return () => {
      kb.removeEventListener?.('virtual-keyboard-toggle', syncKb);
      kb.removeEventListener?.('geometrychange', syncKb);
    };
  }, [activeFormula]);

  // Sync external content changes (e.g., AI enrich, switching tabs, loading pattern)
  useEffect(() => {
    const incoming = (content || '').trim();
    if (incoming !== (lastSerializedRef.current || '').trim()) {
      const parsed = parseMarkdownToBlocks(content, singleLine);
      blocksRef.current = parsed;
      lastSerializedRef.current = serializeBlocksToMarkdown(parsed, singleLine);
      setBlocks(parsed);
      activeBlockIdRef.current = parsed.find(b => b.type === 'rich')?.id || parsed[0]?.id || null;
      setActiveFormula(null);
    }
  }, [content, singleLine]);

  // Close formula popover on outside click / Escape
  useEffect(() => {
    if (!activeFormula) return;
    const handleOutside = (e) => {
      if (popoverRef.current?.contains(e.target)) return;
      if (e.target?.closest?.('.veval-formula-chip')) return;
      if (e.target?.closest?.('.ML__keyboard, math-virtual-keyboard, [data-mathlive-keyboard-close]')) return;
      if (window.mathVirtualKeyboard?.container?.contains?.(e.target)) return;
      setActiveFormula(null);
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveFormula(null);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [activeFormula]);

  const commitBlocks = useCallback((nextBlocks) => {
    const safeBlocks = nextBlocks.length > 0 ? nextBlocks : [{ id: nextUid('rich'), type: 'rich', html: '' }];
    blocksRef.current = safeBlocks;
    setBlocks(safeBlocks);
    const md = serializeBlocksToMarkdown(safeBlocks, singleLine);
    lastSerializedRef.current = md;
    if (onChange) onChange(md);
  }, [onChange, singleLine]);

  const getTargetRichBlockId = () => {
    const cur = blocksRef.current;
    const active = cur.find(b => b.id === activeBlockIdRef.current && b.type === 'rich');
    if (active) return active.id;
    const lastRich = [...cur].reverse().find(b => b.type === 'rich');
    return lastRich?.id || null;
  };

  const insertEmbeddedBlock = (newBlock) => {
    const cur = blocksRef.current;
    const activeIdx = cur.findIndex(b => b.id === activeBlockIdRef.current);
    const insertAt = activeIdx >= 0 ? activeIdx + 1 : cur.length;
    const next = [...cur];
    next.splice(insertAt, 0, newBlock);

    // Ensure there is always a rich text block right after an embedded block so user can keep typing below
    if (!next[insertAt + 1] || next[insertAt + 1].type !== 'rich') {
      const trailing = { id: nextUid('rich'), type: 'rich', html: '' };
      next.splice(insertAt + 1, 0, trailing);
      activeBlockIdRef.current = trailing.id;
    } else {
      activeBlockIdRef.current = next[insertAt + 1].id;
    }
    commitBlocks(next);
  };

  const handleInsertSnippet = (rawSnippet) => {
    if (!rawSnippet) return;
    const trimmed = String(rawSnippet).trim();
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('[DATA_CHART]') && upper.endsWith('[/DATA_CHART]')) {
      insertEmbeddedBlock({ id: nextUid('chart'), type: 'chart', data: parseDataChartString(trimmed) });
      return;
    }
    if (upper.startsWith('[VARIATION_TABLE]') && upper.endsWith('[/VARIATION_TABLE]')) {
      insertEmbeddedBlock({ id: nextUid('var'), type: 'variation', rawBlock: trimmed });
      return;
    }
    if (
      (upper.startsWith('[MATH_GRAPH_3D]') && upper.endsWith('[/MATH_GRAPH_3D]')) ||
      (upper.startsWith('[MATH_GEOMETRY_2D]') && upper.endsWith('[/MATH_GEOMETRY_2D]')) ||
      (upper.startsWith('[MATH_GRAPH]') && upper.endsWith('[/MATH_GRAPH]'))
    ) {
      const blockType = upper.startsWith('[MATH_GRAPH_3D]')
        ? 'MATH_GRAPH_3D'
        : upper.startsWith('[MATH_GEOMETRY_2D]')
        ? 'MATH_GEOMETRY_2D'
        : 'MATH_GRAPH';
      insertEmbeddedBlock({ id: nextUid('graph'), type: 'graph', blockType, rawBlock: trimmed });
      return;
    }
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
    if (imgMatch) {
      insertEmbeddedBlock({ id: nextUid('img'), type: 'image', alt: imgMatch[1] || 'Hình minh họa', url: imgMatch[2] });
      return;
    }

    // Inline KaTeX formula (hoặc văn bản tiếng Việt thuần từ bảng Ngữ văn)
    const isDisplay = trimmed.startsWith('$$') && trimmed.endsWith('$$');
    const cleanLatex = trimmed.replace(/^\$+|\$+$/g, '').trim();
    const plainVi = unwrapPureVietnameseTextLatex(cleanLatex);
    const richId = getTargetRichBlockId();
    if (plainVi !== null) {
      const escapedPlain = `${escapeHtml(plainVi)} `;
      if (richId && richRefs.current[richId]) {
        richRefs.current[richId].insertHtmlFragment(escapedPlain);
      } else {
        const newRich = { id: nextUid('rich'), type: 'rich', html: `<p>${escapedPlain}</p>` };
        commitBlocks([...blocksRef.current, newRich]);
        activeBlockIdRef.current = newRich.id;
      }
      return;
    }
    if (richId && richRefs.current[richId]) {
      richRefs.current[richId].insertFormula(cleanLatex, isDisplay);
    } else {
      const newRich = { id: nextUid('rich'), type: 'rich', html: `<p>${buildFormulaChipHtml(cleanLatex, isDisplay)}&nbsp;</p>` };
      commitBlocks([...blocksRef.current, newRich]);
      activeBlockIdRef.current = newRich.id;
    }
  };

  useImperativeHandle(ref, () => ({
    insertSnippet: handleInsertSnippet,
    execFormat: (cmd, value = null) => {
      const richId = getTargetRichBlockId();
      if (richId && richRefs.current[richId]) {
        richRefs.current[richId].execFormat(cmd, value);
      }
    },
    insertTable: (rows = 3, cols = 3, preset = null) => {
      const headers = preset?.headers || Array.from({ length: cols }, (_, i) => `Cột ${i + 1}`);
      const bodyRows = preset?.rows || Array.from({ length: Math.max(1, rows - 1) }, () => Array(headers.length).fill(''));
      insertEmbeddedBlock({
        id: nextUid('table'),
        type: 'table',
        headers,
        rows: bodyRows
      });
    },
    insertChart: (chartType = 'bar', preset = null) => {
      const data = preset || {
        type: chartType,
        title: 'Biểu đồ số liệu',
        items: [
          { label: 'Nhóm A', value: 30 },
          { label: 'Nhóm B', value: 48 },
          { label: 'Nhóm C', value: 36 },
          { label: 'Nhóm D', value: 60 }
        ]
      };
      insertEmbeddedBlock({
        id: nextUid('chart'),
        type: 'chart',
        data
      });
    },
    insertImage: (url, alt = 'Hình minh họa') => {
      if (!url) return;
      insertEmbeddedBlock({
        id: nextUid('img'),
        type: 'image',
        alt,
        url
      });
    },
    insertHtml: (htmlFragment) => {
      const richId = getTargetRichBlockId();
      if (richId && richRefs.current[richId]) {
        richRefs.current[richId].insertHtmlFragment(htmlFragment);
      }
    },
    openMathComposer: (openKeyboard = true) => {
      const blockId = getTargetRichBlockId();
      setActiveFormula({
        blockId,
        chipEl: null,
        isNew: true,
        latex: '',
        struct: parseEquationStructure(''),
        top: 40,
        left: 12
      });
      if (openKeyboard) {
        setTimeout(() => {
          visualMathRef.current?.focus?.();
          requestAnimationFrame(() => {
            try {
              window.mathVirtualKeyboard?.show?.();
              setMathKbVisible(true);
            } catch {
              // ignore
            }
          });
        }, 60);
      }
    }
  }));

  const handleOpenFormulaPopover = (blockId, chipEl, latex) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const chipRect = chipEl.getBoundingClientRect();
    const top = containerRect ? chipRect.bottom - containerRect.top + 8 : 40;
    const left = containerRect ? Math.max(8, Math.min(chipRect.left - containerRect.left, containerRect.width - 360)) : 12;

    setActiveFormula({
      blockId,
      chipEl,
      latex,
      struct: parseEquationStructure(latex),
      top,
      left
    });
  };

  const applyActiveFormulaLatex = (nextLatex, nextStruct = null) => {
    if (!activeFormula) return;
    if (!activeFormula.isNew && activeFormula.chipEl) {
      const richApi = richRefs.current[activeFormula.blockId];
      richApi?.updateFormulaChipElement(activeFormula.chipEl, nextLatex);
    }
    setActiveFormula(prev =>
      prev
        ? {
            ...prev,
            latex: nextLatex,
            struct: nextStruct || parseEquationStructure(nextLatex)
          }
        : null
    );
  };

  const commitActiveFormula = () => {
    if (!activeFormula) return;
    if (activeFormula.isNew) {
      const cleanLatex = (activeFormula.latex || '').trim();
      if (cleanLatex) {
        const plainVi = unwrapPureVietnameseTextLatex(cleanLatex);
        const richId = activeFormula.blockId || getTargetRichBlockId();
        if (plainVi !== null) {
          const escapedPlain = `${escapeHtml(plainVi)} `;
          if (richId && richRefs.current[richId]) {
            richRefs.current[richId].insertHtmlFragment(escapedPlain);
          } else {
            const newRich = { id: nextUid('rich'), type: 'rich', html: `<p>${escapedPlain}</p>` };
            commitBlocks([...blocksRef.current, newRich]);
            activeBlockIdRef.current = newRich.id;
          }
        } else if (richId && richRefs.current[richId]) {
          richRefs.current[richId].insertFormula(cleanLatex, false);
        } else {
          const newRich = { id: nextUid('rich'), type: 'rich', html: `<p>${buildFormulaChipHtml(cleanLatex, false)}&nbsp;</p>` };
          commitBlocks([...blocksRef.current, newRich]);
          activeBlockIdRef.current = newRich.id;
        }
      }
    }
    try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
    setMathKbVisible(false);
    setActiveFormula(null);
  };

  const handleSlotFieldChange = (field, val) => {
    if (!activeFormula) return;
    const nextStruct = { ...activeFormula.struct, [field]: val };
    const nextLatex = buildLatexFromStructure(nextStruct);
    applyActiveFormulaLatex(nextLatex, nextStruct);
  };

  const handleFormulaAutoCalc = () => {
    if (!activeFormula) return;
    const calc = autoCalculateEquation(activeFormula.latex);
    applyActiveFormulaLatex(calc);
  };

  const handleDeleteFormulaChip = () => {
    if (!activeFormula) return;
    if (!activeFormula.isNew && activeFormula.chipEl) {
      richRefs.current[activeFormula.blockId]?.deleteFormulaChipElement(activeFormula.chipEl);
    }
    try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
    setMathKbVisible(false);
    setActiveFormula(null);
  };

  const handleDeleteBlock = (blockId) => {
    const filtered = blocksRef.current.filter(b => b.id !== blockId);
    commitBlocks(filtered);
  };

  // Highlight công thức đang sửa ngay trong dòng văn bản
  useEffect(() => {
    const chipEl = activeFormula?.chipEl;
    if (!chipEl) return undefined;
    chipEl.classList.add('veval-formula-chip-active');
    return () => {
      chipEl.classList.remove('veval-formula-chip-active');
    };
  }, [activeFormula?.chipEl]);

  return (
    <div ref={containerRef} className="relative font-sans text-slate-800">
      {/* Scoped editorial styling for Word-like editing & atomic KaTeX chips */}
      <style>{`
        .veval-rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
        .veval-rich-editor h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.9rem 0 0.4rem;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .veval-rich-editor h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e3a5f;
          margin: 0.75rem 0 0.3rem;
          line-height: 1.4;
        }
        .veval-rich-editor p {
          margin: 0.3rem 0;
        }
        .veval-rich-editor ul {
          list-style-type: disc;
          padding-left: 1.4rem;
          margin: 0.35rem 0;
        }
        .veval-rich-editor ol {
          list-style-type: decimal;
          padding-left: 1.4rem;
          margin: 0.35rem 0;
        }
        .veval-rich-editor li {
          margin: 0.2rem 0;
        }
        .veval-formula-chip {
          display: inline-flex;
          align-items: center;
          vertical-align: baseline;
          margin: 0 2px;
          padding: 1px 5px;
          border-radius: 6px;
          background: #F4F6FA;
          border: 1px solid #DCE4F0;
          cursor: pointer;
          transition: background 120ms ease, border-color 120ms ease;
          user-select: none;
        }
        .veval-formula-chip:hover {
          background: #E8EEF8;
          border-color: #2C4C7E;
        }
        .veval-formula-chip-active {
          background: #E0E7FF !important;
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
      `}</style>

      {/* DOCKED EQUATION BAR (Cố định phía trên tài liệu, KHÔNG che nội dung đang soạn, cập nhật trực tiếp tại chỗ) */}
      {activeFormula && (
        <div
          ref={popoverRef}
          className="mb-2.5 rounded-xl border border-indigo-200/90 bg-[#F8FAFF] px-3 py-2.5 shadow-2xs space-y-2"
        >
          {/* Row 1: Loại công thức + Hành động nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                {activeFormula.isNew
                  ? 'Soạn công thức mới'
                  : activeFormula.struct.type === 'FRACTION' ? 'Phân số' :
                    activeFormula.struct.type === 'SQRT' ? 'Căn thức' :
                    activeFormula.struct.type === 'POWER' ? 'Lũy thừa' :
                    activeFormula.struct.type === 'SUBSCRIPT' ? 'Chỉ số' :
                    activeFormula.struct.type === 'INTEGRAL' ? 'Tích phân' :
                    activeFormula.struct.type === 'LIMIT' ? 'Giới hạn' :
                    activeFormula.struct.type === 'CHEM_CM' ? 'Nồng độ CM' :
                    activeFormula.struct.type === 'CHEM_CPERCENT' ? 'Nồng độ C%' :
                    'Thanh sửa công thức'}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {activeFormula.isNew
                  ? 'Gõ hoặc dùng bàn phím toán • Bấm Xong (Enter) để chèn vào vị trí con trỏ'
                  : 'Cập nhật trực tiếp ngay trong dòng • Enter để xong'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const kb = window.mathVirtualKeyboard;
                  if (!kb) return;
                  if (kb.visible) {
                    kb.hide();
                    setMathKbVisible(false);
                  } else {
                    visualMathRef.current?.focus();
                    requestAnimationFrame(() => {
                      try { kb.show(); } catch { /* ignore */ }
                      setMathKbVisible(true);
                    });
                  }
                }}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  mathKbVisible
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
                title={mathKbVisible ? 'Đóng bàn phím toán MathLive' : 'Mở bàn phím toán MathLive'}
              >
                {mathKbVisible ? <X className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
                <span>{mathKbVisible ? 'Đóng bàn phím' : 'Bàn phím toán'}</span>
              </button>
              <button
                type="button"
                onClick={handleFormulaAutoCalc}
                className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 text-[#1E3A5F] border border-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                title="Tự tính kết quả"
              >
                <Zap className="w-3 h-3" />
                <span>Tính</span>
              </button>
              {onOpenAdvancedModal && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormula(null);
                    onOpenAdvancedModal();
                  }}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 text-[#1E3A5F] border border-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="Mở bộ dựng công thức trực quan"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Bộ dựng</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteFormulaChip}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Xóa công thức"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={commitActiveFormula}
                className="px-2.5 py-1 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{activeFormula.isNew ? 'Chèn' : 'Xong'}</span>
              </button>
            </div>
          </div>

          {/* Sửa trực tiếp trên công thức hiển thị (WYSIWYG MathLive — không hiện text thô 2x^2 hay x_2) */}
          <div className="space-y-1.5">
            <VisualMathField
              ref={visualMathRef}
              value={activeFormula.latex || ''}
              onChange={(nextLatex) => {
                applyActiveFormulaLatex(nextLatex, { type: 'GENERAL', raw: nextLatex });
              }}
              onDone={commitActiveFormula}
            />
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Phân số', preview: '\\frac{a}{b}', snippet: '\\frac{#0}{#?}' },
                { label: 'Căn bậc 2', preview: '\\sqrt{x}', snippet: '\\sqrt{#0}' },
                { label: 'Lũy thừa', preview: 'x^2', snippet: '^{#?}' },
                { label: 'Chỉ số dưới', preview: 'x_0', snippet: '_{#?}' },
                { label: 'Cộng trừ', preview: '\\pm', snippet: '\\pm ' },
                { label: 'Nhân', preview: '\\times', snippet: '\\times ' },
                { label: 'Chấm nhân', preview: '\\cdot', snippet: '\\cdot ' },
                { label: 'Khác', preview: '\\neq', snippet: '\\neq ' },
                { label: 'Nhỏ hơn bằng', preview: '\\le', snippet: '\\le ' },
                { label: 'Lớn hơn bằng', preview: '\\ge', snippet: '\\ge ' },
                { label: 'Mũi tên', preview: '\\to', snippet: '\\to ' },
                { label: 'Suy ra', preview: '\\Rightarrow', snippet: '\\Rightarrow ' },
                { label: 'Tương đương', preview: '\\Leftrightarrow', snippet: '\\Leftrightarrow ' },
                { label: 'Delta', preview: '\\Delta', snippet: '\\Delta ' },
                { label: 'Pi', preview: '\\pi', snippet: '\\pi ' },
                { label: 'Vô cực', preview: '\\infty', snippet: '\\infty ' }
              ].map((k, idx) => (
                <button
                  key={idx}
                  type="button"
                  title={k.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => visualMathRef.current?.insertLatex(k.snippet)}
                  className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs cursor-pointer"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderKatexHtml(k.preview, false) }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nút Đóng bàn phím toán nằm ngay trên mép trên cùng bên phải của bàn phím MathLive */}
      {mathKbVisible && (
        <button
          type="button"
          data-mathlive-keyboard-close="1"
          style={{ bottom: `${mathKbHeight + 10}px`, right: '16px', zIndex: 2147483647 }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
            setMathKbVisible(false);
          }}
          className="fixed px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Đóng bàn phím toán</span>
        </button>
      )}

      {/* DOCUMENT SURFACE */}
      <div
        className={
          singleLine
            ? 'bg-transparent px-1 py-0.5 flex-1'
            : compact
            ? 'bg-white rounded-xl border border-[#E5E3DC] px-3.5 py-2.5 min-h-[84px] focus-within:border-[#2C4C7E]/50 focus-within:ring-2 focus-within:ring-[#2C4C7E]/10 transition-all space-y-2'
            : 'bg-white px-2 sm:px-4 py-2 min-h-[420px] space-y-2'
        }
      >
        {blocks.map((block, idx) => {
          if (block.type === 'rich') {
            return (
              <RichTextBlock
                key={block.id}
                ref={el => {
                  if (el) richRefs.current[block.id] = el;
                  else delete richRefs.current[block.id];
                }}
                html={block.html}
                placeholder={idx === 0 ? placeholder : ''}
                singleLine={singleLine}
                compact={compact}
                onFocusBlock={() => {
                  activeBlockIdRef.current = block.id;
                }}
                onChangeHtml={(nextHtml) => {
                  const nextBlocks = blocksRef.current.map(b =>
                    b.id === block.id ? { ...b, html: nextHtml } : b
                  );
                  blocksRef.current = nextBlocks;
                  const md = serializeBlocksToMarkdown(nextBlocks, singleLine);
                  lastSerializedRef.current = md;
                  if (onChange) onChange(md);
                }}
                onClickFormulaChip={(chipEl, latex) => handleOpenFormulaPopover(block.id, chipEl, latex)}
                onDropSnippet={(dropped) => {
                  activeBlockIdRef.current = block.id;
                  handleInsertSnippet(dropped);
                }}
                onPasteImage={(base64Url) => {
                  activeBlockIdRef.current = block.id;
                  insertEmbeddedBlock({
                    id: nextUid('img'),
                    type: 'image',
                    alt: 'Hình minh họa',
                    url: base64Url
                  });
                }}
                onBackspaceAtStart={
                  idx > 0
                    ? () => {
                        const prev = blocksRef.current[idx - 1];
                        const next = blocksRef.current.filter(b => b.id !== block.id);
                        commitBlocks(next);
                        if (prev?.type === 'rich') {
                          setTimeout(() => richRefs.current[prev.id]?.focusEnd(), 0);
                        }
                      }
                    : null
                }
              />
            );
          }

          if (block.type === 'table') {
            return (
              <EditableTableBlock
                key={block.id}
                block={block}
                onChange={(updatedTable) => {
                  commitBlocks(blocksRef.current.map(b => (b.id === block.id ? updatedTable : b)));
                }}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            );
          }

          if (block.type === 'chart') {
            return (
              <AcademicChartBlock
                key={block.id}
                data={block.data}
                editable
                onChange={(nextChartData) => {
                  commitBlocks(blocksRef.current.map(b => (b.id === block.id ? { ...b, data: nextChartData } : b)));
                }}
                onDelete={() => handleDeleteBlock(block.id)}
              />
            );
          }

          if (block.type === 'variation') {
            const tableData = parseVariationTableString(block.rawBlock);
            return (
              <div key={block.id} className="relative group my-3">
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(block.id)}
                  title="Xóa bảng biến thiên"
                  className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
                {tableData && (
                  <VariationTable
                    data={tableData}
                    onChange={(newRaw) => {
                      commitBlocks(blocksRef.current.map(b => (b.id === block.id ? { ...b, rawBlock: newRaw } : b)));
                    }}
                  />
                )}
              </div>
            );
          }

          if (block.type === 'graph') {
            return (
              <div key={block.id} className="relative group my-3">
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(block.id)}
                  title="Xóa mô hình"
                  className="absolute top-2.5 right-24 z-20 opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
                <InteractiveMathRenderer
                  rawTag={block.rawBlock}
                  height={compact ? 240 : 300}
                  onEdit={onEditMathGraph ? () => onEditMathGraph(block.rawBlock) : null}
                />
              </div>
            );
          }

          if (block.type === 'image') {
            return (
              <figure key={block.id} className="relative group my-3 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] p-3 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(block.id)}
                  title="Xóa ảnh"
                  className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <img
                  src={block.url}
                  alt={block.alt || 'Hình minh họa'}
                  className="max-h-72 rounded-lg object-contain bg-white border border-[#ECEAE4] p-1"
                />
                <input
                  type="text"
                  value={block.alt || ''}
                  onChange={(e) => {
                    const nextAlt = e.target.value;
                    commitBlocks(blocksRef.current.map(b => (b.id === block.id ? { ...b, alt: nextAlt } : b)));
                  }}
                  placeholder="Chú thích hình ảnh..."
                  className="text-center text-xs text-slate-500 bg-transparent focus:bg-white px-2.5 py-1 rounded-md border border-transparent focus:border-[#E5E3DC] outline-none w-full max-w-md"
                />
              </figure>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
});

export default WordStyleFormulaCanvas;
