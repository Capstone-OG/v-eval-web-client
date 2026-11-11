import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { AlertTriangle, Sparkles, BookOpen, FileText } from 'lucide-react';
import VariationTable, { parseVariationTableString } from './VariationTable';
import MathGraphView, { parseGraphTag } from './MathGraphView';
import InteractiveMathRenderer from './InteractiveMathRenderer';
import { autoSynthesizeMathGraph3DFromText, autoSynthesizeMathGraph2DFromText, autoSynthesizeVariationTableFromText } from '../../utils/mathGraphUtils';

/**
 * Safe KaTeX HTML generator with fallback
 */
export function renderKatexHtml(latex, displayMode = false) {
  try {
    let clean = String(latex || '')
      .replace(/\\?undefined/gi, '')
      .replace(/\\?null/gi, '')
      .trim();
    if (!clean) return '';

    // Strip unescaped $ inside math mode to prevent syntax errors
    clean = clean.replace(/(?<!\\)\$/g, '');

    // Balance braces { and } to prevent KaTeX parse errors
    let openB = 0;
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '{' && (i === 0 || clean[i - 1] !== '\\')) openB++;
      else if (clean[i] === '}' && (i === 0 || clean[i - 1] !== '\\')) openB--;
    }
    while (openB > 0) { clean += '}'; openB--; }
    while (openB < 0) { clean = '{' + clean; openB++; }

    const html = katex.renderToString(clean, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml'
    });
    return html.replace(/<span[^>]*class="katex-error"[^>]*>.*?undefined.*?<\/span>/gi, '');
  } catch (err) {
    console.warn('KaTeX render error:', err);
    return latex;
  }
}

/**
 * Unescapes literal '\n' string escapes to real newlines,
 * while protecting actual LaTeX commands that start with '\n':
 * \neq, \notin, \nabla, \nu, \natural, \nearrow, \nwarrow, \nsubseteq, etc.
 */
export function unescapeLiteralNewlines(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\+\s*(?=\r?\n|$)/g, '')
    .replace(
      /\\n(?!(?:eq|otin|abla|u|atural|earrow|warrow|subseteq|supseteq|gtr|less|parallel|ormalsize|ot|ewcommand)\b)/g,
      '\n'
    );
}

export function mergeUnclosedLatexLines(str) {
  if (!str || !str.includes('\n')) return str;
  const rawLines = str.split(/\r?\n/);
  const merged = [];
  let buf = '';
  let openB = 0;
  let mergeCount = 0;

  for (let l of rawLines) {
    if (buf === '') {
      let b = 0;
      for (let i = 0; i < l.length; i++) {
        if (l[i] === '{' && (i === 0 || l[i - 1] !== '\\')) b++;
        else if (l[i] === '}' && (i === 0 || l[i - 1] !== '\\')) b--;
      }
      if (b > 0 && (/\\[a-zA-Z]+|[_^]\{/.test(l))) {
        buf = l.trimEnd();
        openB = b;
        mergeCount = 0;
      } else {
        merged.push(l);
      }
    } else {
      let b = 0;
      for (let i = 0; i < l.length; i++) {
        if (l[i] === '{' && (i === 0 || l[i - 1] !== '\\')) b++;
        else if (l[i] === '}' && (i === 0 || l[i - 1] !== '\\')) b--;
      }
      buf += ' ' + l.trim();
      openB += b;
      mergeCount++;
      if (openB <= 0 || mergeCount >= 6) {
        merged.push(buf);
        buf = '';
        openB = 0;
        mergeCount = 0;
      }
    }
  }
  if (buf) merged.push(buf);
  return merged.join('\n');
}

/**
 * Intelligently normalizes text strings containing math & chemistry expressions:
 * 1. Unescapes literal '\n' to actual newlines (protecting \neq, \notin, \nabla, \nu).
 * 2. Restores corrupted LaTeX commands (e.g. \text, \times).
 * 3. In non-math segments, automatically encloses isolated raw LaTeX expressions
 *    and chemistry formulas (such as H^+, OH^-, SO_4^{2-}, H_2O, H_2SO_4, HNO_3, x_0) in $...$.
 */
export function normalizeMathString(text) {
  if (!text) return '';
  let str = String(text);

  // 1. Unescape literal string escaped newlines e.g. "\n" -> real newlines
  str = unescapeLiteralNewlines(str);

  // Khắc phục khoảng trắng sai vị trí sau dấu gạch dưới chỉ số e.g. (OH)_ 3 -> (OH)_3, C_ 2 -> C_2
  str = str.replace(/_\s+(\d+|[a-zA-Z]|\{[^}]+\})/g, '_$1');

  // Chuẩn hóa khoảng trắng giữa gốc hydrocarbon và nhóm chức hữu cơ e.g. C_{15}H_{31} COOH -> C_{15}H_{31}COOH
  str = str.replace(/([A-Z][a-zA-Z0-9_\\\{\}\^]*_\{\d+\})\s+(COOH|OH|CHO|COONa|NH_2|COOCH_3)\b/g, '$1$2');

  // Phục hồi công thức tính hiệu suất phản ứng nếu bị lỗi undefined
  str = str.replace(/H\\?%\s*undefined\s*%?\s*\$*/gi, 'H\\% = \\frac{m_{\\text{thực tế}}}{m_{\\text{lí thuyết}}} \\times 100\\%');
  str = str.replace(/H\\?%\s*=\s*undefined\s*%?\s*\$*/gi, 'H\\% = \\frac{m_{\\text{thực tế}}}{m_{\\text{lí thuyết}}} \\times 100\\%');

  // Triệt tiêu triệt để các token rác 'undefined' lơ lửng
  str = str.replace(/(?:^|\n)\s*\\?undefined\s*(?=\n|$)/gi, '\n');
  str = str.replace(/\\?undefined/gi, '');

  // Tách rời tiêu đề markdown ### nếu bị dính liền sau câu hoặc công thức
  str = str.replace(/([^\r\n])\s*(###\s+[^\r\n]+)/g, '$1\n\n$2');

  // Nối các dòng bị ngắt cụt gây gãy layout
  str = str.replace(/\r?\n\s*:\s*/g, ': ');
  str = str.replace(/(\*[\s]*\([A-F]\))\r?\n\s*/g, '$1 ');

  // Nối công thức ester bị ngắt giữa chuỗi C-H và Oxy (kể cả có khoảng trắng hoặc xuống dòng)
  str = str.replace(/(\$?C_\{?[0-9n\+\-]+\}?H_\{?[0-9a-zA-Z\+\-]+\}?\$?)\s*(?:\r?\n|\s+)\s*(\$?O_\{?[0-9]+\}?\$?)/gi, (m, c, o) => {
    const cleanC = c.replace(/\$/g, '');
    const cleanO = o.replace(/\$/g, '');
    return '$' + cleanC + cleanO + '$';
  });

  // Nối công thức hóa học bị ngắt dòng sau dấu nối hóa trị - hoặc = (kể cả có \text{})
  str = str.replace(/(\$?[A-Za-z0-9_\\\{\}']+[-=])\s*\r?\n\s*(\$?[A-Za-z0-9_\\\{\}']+)/g, (m, part1, part2) => {
    const c1 = part1.replace(/\$/g, '');
    const c2 = part2.replace(/\$/g, '');
    return '$' + c1 + c2 + '$';
  });

  // Nối chuỗi este đa chức bị ngắt dòng nhiều cấp
  str = str.replace(/([A-Za-z0-9_\\\{\}']+-)\s*\r?\n\s*([A-Za-z0-9_\\\{\}']+-)\s*\r?\n\s*([A-Za-z0-9_\\\{\}']+)/g, '$$$1$2$3$$');

  // Nối nhóm ngoặc chỉ số )_2, )_3 bị rớt xuống dòng riêng
  str = str.replace(/([A-Za-z0-9_\\\{\}']+)\s*\r?\n\s*(\)[_0-9]+)/g, '$1$2');

  // Sửa điều kiện bất đẳng thức có dấu $ bị đặt nhầm: (n \ge 2$) hoặc ($n$ \ge 4$) hoặc (n \ge 2)
  str = str.replace(/\(\s*\$?([a-zA-Z])\$?\s*\\(?:ge|le|gt|lt)\s*(\d+)\s*\$?\s*\)/gi, '($$$1 \\ge $2$$)');
  str = str.replace(/\(\s*([a-zA-Z])\s*\\(?:ge|le|gt|lt)\s*(\d+)\s*\$\s*\)/gi, '($$$1 \\ge $2$$)');

  // Sửa lỗi dấu $ đóng nhầm trước số thập phân: \times$ 0,5 -> \times 0,5$
  str = str.replace(/\\times\s*\$\s*(\d+[,\.]?\d*)/g, '\\times $1$');

  // Sửa lỗi dính lệnh LaTeX không có khoảng trắng: \equivC -> \equiv C
  str = str.replace(/\\(equiv|times|rightarrow|leftarrow|rightleftharpoons)([A-Za-z0-9])/g, '\\$1 $2');
  str = str.replace(/([A-Za-z0-9_]+)\$\s*=\s*\$([A-Za-z0-9_]+)/g, '$1=$2');
  str = str.replace(/\$\s*(-[A-Za-z0-9]+-)\s*,?/g, '$1,');

  // Sửa phương trình phản ứng bị đóng mở $ vụn vặt: RCOOH$+ R'OH -> RCOOH + R'OH
  str = str.replace(/([A-Za-z0-9_\x27]+)\s*\$\s*([+=])\s*\$?\s*([A-Za-z0-9_\x27]+)/g, '$1 $2 $3');

  // Hàn gắn các dòng công thức LaTeX bị ngắt dòng ở giữa dấu ngoặc nhọn
  str = mergeUnclosedLatexLines(str);

  // Sửa các dòng có dấu $ lẻ ở cuối dòng (như 'A. HCOOC_2H_5$' -> 'A. $HCOOC_2H_5$')
  str = str.replace(/^([A-D][\.\:\)]\s*)([^\$\r\n]+)\$$/gm, '$1$$$2$$');
  str = str.replace(/\$\s*\.\s*\$/g, '.');

  // Xử lý các phương trình hóa học và công thức toán đứng riêng dòng (Xử lý theo từng dòng, KHÔNG ghép qua dòng mới)
  const arrowRegex = /\\(?:rightleftharpoons|xrightarrow|longrightarrow|rightarrow|leftrightharpoons|leftrightarrow)\b/;
  str = str.split('\n').map(line => {
    let trimmed = line.trim();
    if (arrowRegex.test(trimmed)) {
      // Tách nhãn mở đầu như "Phương trình: ..." hoặc "PTHH: ..."
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        const label = trimmed.slice(0, colonIdx + 1).trim();
        let eq = trimmed.slice(colonIdx + 1).trim().replace(/\.$/, '').trim();
        if (!eq.startsWith('$$')) {
          eq = eq.replace(/(?<!\\)\$/g, '');
          return `${label}\n$$${eq}$$`;
        }
      } else if (!trimmed.includes('$') && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trimmed)) {
        let eq = trimmed.replace(/\.$/, '').trim();
        return '$$' + eq + '$$';
      }
    } else if (!trimmed.includes('$')) {
      // Công thức toán/hóa chứa dấu = và \frac hoặc \sqrt (không chứa từ tiếng Việt)
      if (trimmed.includes('=') && /\\(?:frac|sqrt|lim|sum|prod|int)\b/.test(trimmed) &&
          !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trimmed)) {
        return '$$' + trimmed + '$$';
      }
    }
    return line;
  }).join('\n');

  // Cân bằng dấu $ đơn lẻ bị cô lập trên từng dòng để triệt tiêu việc rò rỉ math mode sang dòng tiếp theo
  str = str.split('\n').map(line => {
    let dMatches = (line.match(/(?<!\\)\$/g) || []).length;
    if (dMatches % 2 !== 0) {
      if (line.trimEnd().endsWith('$.') || line.trimEnd().endsWith('$')) {
        let lastIdx = line.lastIndexOf('$');
        line = line.slice(0, lastIdx) + line.slice(lastIdx + 1);
      } else {
        line = line.replace(/(?<![\$\w])\$([A-Za-z0-9_+\-^\\\{\}\x27]+)(?=[\s\.,;\*\)]|$)/g, '$$$1$$');
        let left = (line.match(/(?<!\\)\$/g) || []).length;
        if (left % 2 !== 0) {
          line = line.replace(/\$/, '');
        }
      }
    }
    return line;
  }).join('\n');

  // Recover LaTeX commands that may have lost their backslash from past tab-replacement or JSON parsing
  str = str.replace(/(?<!\\)\bext\{/g, '\\text{');
  str = str.replace(/(?<!\\)\bimes\b/g, '\\times');

  // Strip stray 'text' or '\text' immediately glued to chemical formulas or ions (e.g. textSO_4^{2-}, \textSO_4^{2-} -> SO_4^{2-})
  str = str.replace(/(?:\\text|\btext)(?=[A-Z])/g, '');
  str = str.replace(/(?:\\text|\btext)\{([A-Z][a-zA-Z0-9_+\-^]*)\}/g, '$1');

  // Fix orphaned trailing :** (e.g. "Bài toán mẫu:**" or "Ví dụ:**" where leading ** got stripped)
  str = str.replace(/(^|[\n•\-]\s*)(?!\*)([A-ZÀ-Ỹa-zà-ỹ0-9\s&]{2,30}):\*\*/g, '$1**$2:**');
  str = str.replace(/(?<!\*)\b(Bài toán mẫu|Bài mẫu|Ví dụ minh họa|Ví dụ|Hướng dẫn giải|Lời giải|Phương pháp giải|Phương pháp|Gợi ý phương pháp giải|Bước \d+):\*\*/gi, '**$1:**');
  str = str.replace(/\*\*(Bài toán mẫu|Bài mẫu|Ví dụ minh họa|Ví dụ|Hướng dẫn giải|Lời giải|Phương pháp giải|Phương pháp|Gợi ý phương pháp giải|Bước \d+):(?!\*)/gi, '**$1:**');

  // 2. Tokenize by existing explicit math delimiters AND special tags ([VARIATION_TABLE], [MATH_GRAPH], etc.)
  // Inline math is strictly matched without newline ($[^$\r\n]+?$) so math mode NEVER spans multiple lines!
  const specialBlockAndMathDelimiterRegex = /(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]|\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[GRAPH:[\s\S]*?\]|\$\$[\s\S]*?\$\$|\$[^\$\r\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/gi;
  const parts = str.split(specialBlockAndMathDelimiterRegex);

  const processed = parts.map((part) => {
    if (!part) return '';
    // If it's already an explicit math delimiter block or a special tag, preserve 100% as-is
    const trimmedPart = part.trim().toUpperCase();
    if (
      (part.startsWith('$$') && part.endsWith('$$')) ||
      (part.startsWith('$') && part.endsWith('$')) ||
      (part.startsWith('\\[') && part.endsWith('\\]')) ||
      (part.startsWith('\\(') && part.endsWith('\\)')) ||
      (trimmedPart.startsWith('[VARIATION_TABLE]') && trimmedPart.endsWith('[/VARIATION_TABLE]')) ||
      (trimmedPart.startsWith('[MATH_GRAPH]') && trimmedPart.endsWith('[/MATH_GRAPH]')) ||
      (trimmedPart.startsWith('[MATH_GRAPH_3D]') && trimmedPart.endsWith('[/MATH_GRAPH_3D]')) ||
      (trimmedPart.startsWith('[MATH_GEOMETRY_2D]') && trimmedPart.endsWith('[/MATH_GEOMETRY_2D]')) ||
      (trimmedPart.startsWith('[GRAPH:') && trimmedPart.endsWith(']'))
    ) {
      // Phục hồi an toàn nếu văn bản tiếng Việt bị nuốt nhầm vào trong $...$
      if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$')) {
        const inner = part.slice(1, -1);
        if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(inner) && !inner.includes('\\text{')) {
          // Bóc trả lại văn bản gốc để hiển thị tự nhiên
          return inner;
        }
      }
      return part;
    }

    let textChunk = part;

    // Wrap LaTeX commands with curly braces or sub/superscripts e.g. \frac{a}{b}, \sqrt{x}, \lim_{x \to 0}, \Delta, \xrightarrow
    textChunk = textChunk.replace(
      /(\\(?:text|mathrm|mathbf|Delta|frac|sqrt|lim|int|sum|prod|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|Omega|left|right|partial|infty|vec|le|ge|neq|approx|equiv|pm|times|div|cdot|in|notin|subset|cap|cup|forall|exists|mathbb|xrightarrow|rightleftharpoons|longrightarrow|leftarrow|longleftarrow|implies|iff)\b(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|_[a-zA-Z0-9{}]*(?:\{[^{}]*\})?|\^[a-zA-Z0-9{}]*(?:\{[^{}]*\})?)*)/g,
      '$$$1$$'
    );

    // Wrap chemical formulas containing subscript braces like C_{15}H_{31}COOH or C_nH_{2n}
    textChunk = textChunk.replace(
      /(?<![\$\\\w])([A-Z][a-zA-Z0-9]*_\{[0-9a-zA-Z\+\-]+\}[A-Za-z0-9_\{\}\(\)]*)(?![\$\w])/g,
      '$$$1$$'
    );

    // Wrap chemical ions with charges like H^+, OH^-, Fe^{3+}, Fe^3+, SO_4^{2-}, NO_3^-, Na^+, Cl^-
    textChunk = textChunk.replace(
      /(?<![$\\\w])((?:[A-Z][a-z]?(?:_\d+)?)+\^\{?[+-]?\d*[+-]?\}?)(?![$\w])/g,
      '$$$1$$'
    );

    // Wrap chemical compounds with subscripts like H_2O, H_2SO_4, HNO_3, CO_2, Fe_2O_3, KMnO_4, O_2, N_2
    textChunk = textChunk.replace(
      /(?<![$\\\w])((?:[A-Z][a-z]?(?:_\d+)?)*(?:[A-Z][a-z]?_\d+)(?:[A-Z][a-z]?(?:_\d+)?)*)(?![$\w])/g,
      '$$$1$$'
    );

    // Wrap single variable subscripts like x_0, y_0, x_1, f'(x_0)
    textChunk = textChunk.replace(/(?<![$\\\w])([a-zA-Z]_[0-9a-zA-Z])(?![$\w])/g, '$$$1$$');

    // Wrap mathematical intervals e.g. (-\infty; +\infty), [0; +\infty)
    textChunk = textChunk.replace(/([(\[][\s]*[+-]?(?:\\infty|\d+)\s*;\s*[+-]?(?:\\infty|\d+)[\s]*[)\]])/g, '$$$1$$');

    return textChunk;
  });

  return processed.join('');
}

/**
 * Render purely inline content without any block wrappers.
 * Everything returned is inline (<span>, <strong>, <em>, <img>) so that text,
 * math, punctuation, and parentheses flow seamlessly on the same line.
 */
function renderInlineContent(text, keyPrefix = '') {
  if (!text) return null;
  if (typeof text !== 'string') return text;

  // Split by explicit math delimiters (inline math $[^$\r\n]+?$ never spans across newlines)
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\r\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
  const parts = text.split(mathRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    const partKey = `${keyPrefix}-m${idx}`;

    // Block math in inline context -> render as inline-block KaTeX
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = part.slice(2, -2).trim();
      return (
        <span
          key={partKey}
          className="inline-block mx-1 align-middle select-all font-serif"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
        />
      );
    }

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1).trim();
      // Nếu chứa tiếng Việt có dấu mà không nằm trong \text{}, hiển thị thành văn bản thuần
      if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(math) && !math.includes('\\text{')) {
        return <span key={partKey} className="mx-0.5">{math}</span>;
      }
      return (
        <span
          key={partKey}
          className="inline-math mx-0.5 align-baseline select-all font-serif"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
        />
      );
    }

    // Block math \[...\]
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      const math = part.slice(2, -2).trim();
      return (
        <span
          key={partKey}
          className="inline-block mx-1 align-middle select-all font-serif"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
        />
      );
    }

    // Inline math \(...\)
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const math = part.slice(2, -2).trim();
      return (
        <span
          key={partKey}
          className="inline-math mx-0.5 align-baseline select-all font-serif"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
        />
      );
    }

    // Non-math text: parse markdown images, bold-italic, bold, italic
    const mdParts = part.split(/(!\[.*?\]\(.*?\)|\*\*\*[^\*\n]+?\*\*\*|\*\*[^\*\n]+?\*\*|\*[^\*\n\s][^\*\n]*?[^\*\n\s]\*|\*[^\*\n\s]\*)/g);

    return (
      <React.Fragment key={partKey}>
        {mdParts.map((chunk, cIdx) => {
          if (!chunk) return null;
          const chunkKey = `${partKey}-c${cIdx}`;

          // Markdown image ![alt](url)
          const imgMatch = chunk.match(/^!\[(.*?)\]\((.*?)\)$/);
          if (imgMatch) {
            const alt = imgMatch[1] || 'Hình minh họa';
            const src = imgMatch[2];
            return (
              <img
                key={chunkKey}
                src={src}
                alt={alt}
                className="inline-block max-h-36 rounded-xl border border-slate-200/90 shadow-sm object-contain bg-white p-1 my-1 mx-1 align-middle"
                loading="lazy"
              />
            );
          }

          // Markdown bold + italic ***text***
          if (chunk.startsWith('***') && chunk.endsWith('***') && chunk.length >= 6) {
            return (
              <strong key={chunkKey} className="font-extrabold italic">
                {chunk.slice(3, -3)}
              </strong>
            );
          }

          // Markdown bold **text**
          if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length >= 4) {
            return (
              <strong key={chunkKey} className="font-extrabold">
                {chunk.slice(2, -2)}
              </strong>
            );
          }

          // Markdown italic *text*
          if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length >= 2) {
            return (
              <em key={chunkKey} className="italic opacity-95">
                {chunk.slice(1, -1)}
              </em>
            );
          }

          // Clean stray asterisks if any remain unclosed e.g. "***" or "**" at edge
          const cleanChunk = chunk.replace(/^\*{2,3}$/, '');
          if (!cleanChunk) return null;

          // Plain text chunk
          return <span key={chunkKey}>{cleanChunk}</span>;
        })}
      </React.Fragment>
    );
  });
}

/**
 * Render structured multi-line text (paragraphs, bullet lists, step highlights, callouts).
 */
export function renderMarkdownTable(tableLines, tableKey) {
  if (!tableLines || tableLines.length < 2) return null;
  const headerLine = tableLines[0];
  const rowLines = tableLines.slice(2);

  const parseCells = (line) => {
    let raw = line.trim();
    if (raw.startsWith('|')) raw = raw.slice(1);
    if (raw.endsWith('|')) raw = raw.slice(0, -1);
    return raw.split('|').map((c) => {
      let cell = c.trim();
      if (/^[A-Za-z0-9_\(\)\+\-\*\^=]+$/.test(cell) && cell.includes('_') && !cell.startsWith('$')) {
        cell = '$' + cell + '$';
      }
      return cell;
    });
  };

  const headers = parseCells(headerLine);
  const rows = rowLines.map((r) => parseCells(r));

  return (
    <div key={tableKey} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
            {headers.map((h, hIdx) => (
              <th key={hIdx} className="px-3 py-2 text-[11px] font-extrabold border-r last:border-r-0 border-slate-200/80">
                {renderInlineContent(h, tableKey + '-th-' + hIdx)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-[11px] text-slate-700 font-medium border-r last:border-r-0 border-slate-200/60">
                  {renderInlineContent(cell, tableKey + '-r' + rIdx + '-c' + cIdx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderStructuredContent(raw, onEditMathGraph = null) {
  // Check if text describes 3D spatial geometry or 2D function graphs without tags, and auto-synthesize
  let effectiveRaw = raw;
  if (
    typeof effectiveRaw === 'string' &&
    !effectiveRaw.includes('[MATH_GRAPH_3D]') &&
    !effectiveRaw.includes('[MATH_GRAPH]') &&
    !effectiveRaw.includes('[MATH_GEOMETRY_2D]') &&
    !effectiveRaw.includes('[VARIATION_TABLE]') &&
    !effectiveRaw.includes('[GRAPH:')
  ) {
    const synth3D = autoSynthesizeMathGraph3DFromText(effectiveRaw);
    if (synth3D) {
      effectiveRaw = effectiveRaw + synth3D;
    } else {
      const synth2D = autoSynthesizeMathGraph2DFromText(effectiveRaw);
      if (synth2D) {
        effectiveRaw = effectiveRaw + synth2D;
      } else {
        const synthVar = autoSynthesizeVariationTableFromText(effectiveRaw);
        if (synthVar) {
          effectiveRaw = effectiveRaw + synthVar;
        }
      }
    }
  }

  // First split by special block tags:
  // 1. [MATH_GRAPH_3D]...[/MATH_GRAPH_3D]
  // 2. [MATH_GRAPH]...[/MATH_GRAPH]
  // 3. [MATH_GEOMETRY_2D]...[/MATH_GEOMETRY_2D]
  // 4. [VARIATION_TABLE]...[/VARIATION_TABLE]
  // 5. [GRAPH:...]
  // 6. Display math $$...$$ or \[...\]
  const blockRegex = /(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]|\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[GRAPH:[\s\S]*?\]|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/gi;
  const blocks = effectiveRaw.split(blockRegex);

  return blocks.map((block, bIdx) => {
    if (!block) return null;

    const trimmedBlock = typeof block === 'string' ? block.trim() : '';

    // Interactive 3D Spatial Geometry Block [MATH_GRAPH_3D]...[/MATH_GRAPH_3D]
    if (trimmedBlock.toUpperCase().startsWith('[MATH_GRAPH_3D]') && trimmedBlock.toUpperCase().endsWith('[/MATH_GRAPH_3D]')) {
      return <InteractiveMathRenderer key={`mg3d-${bIdx}`} rawTag={trimmedBlock} onEdit={onEditMathGraph} />;
    }

    // Interactive 2D Function Calculus Block [MATH_GRAPH]...[/MATH_GRAPH]
    if (trimmedBlock.toUpperCase().startsWith('[MATH_GRAPH]') && trimmedBlock.toUpperCase().endsWith('[/MATH_GRAPH]')) {
      return <InteractiveMathRenderer key={`mg2d-${bIdx}`} rawTag={trimmedBlock} onEdit={onEditMathGraph} />;
    }

    // Interactive 2D Geometry Block [MATH_GEOMETRY_2D]...[/MATH_GEOMETRY_2D]
    if (trimmedBlock.toUpperCase().startsWith('[MATH_GEOMETRY_2D]') && trimmedBlock.toUpperCase().endsWith('[/MATH_GEOMETRY_2D]')) {
      return <InteractiveMathRenderer key={`mg2dg-${bIdx}`} rawTag={trimmedBlock} onEdit={onEditMathGraph} />;
    }

    // Variation Table Block [VARIATION_TABLE]...[/VARIATION_TABLE]
    if (trimmedBlock.toUpperCase().startsWith('[VARIATION_TABLE]') && trimmedBlock.toUpperCase().endsWith('[/VARIATION_TABLE]')) {
      const content = trimmedBlock.replace(/^\[VARIATION_TABLE\]/i, '').replace(/\[\/VARIATION_TABLE\]$/i, '').trim();
      const parsed = parseVariationTableString(content);
      return <VariationTable key={`vt-${bIdx}`} data={parsed} />;
    }

    // Math Graph Block [GRAPH: ...] (Legacy fallback)
    if (block.toUpperCase().startsWith('[GRAPH:') && block.endsWith(']')) {
      const parsed = parseGraphTag(block);
      return <MathGraphView key={`mg-${bIdx}`} data={parsed} />;
    }

    // Multi-line display math block
    if (block.startsWith('$$') && block.endsWith('$$')) {
      const math = block.slice(2, -2).trim();
      return (
        <div
          key={`b-${bIdx}`}
          className="my-2.5 overflow-x-auto text-center select-all py-1"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
        />
      );
    }
    if (block.startsWith('\\[') && block.endsWith('\\]')) {
      const math = block.slice(2, -2).trim();
      return (
        <div
          key={`b-${bIdx}`}
          className="my-2.5 overflow-x-auto text-center select-all py-1"
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
        />
      );
    }

    // Text block: process line by line, grouping markdown tables together
    const lines = block.split('\n');
    const elements = [];
    let lIdx = 0;

    while (lIdx < lines.length) {
      const rawLine = lines[lIdx];
      const trimmed = rawLine.replace(/\\+\s*$/, '').trim();

      // Check for Markdown Table start: line starts with '|' and contains another '|' AND next line is separator
      const isTableRow = (l) => {
        const t = (l || '').trim();
        return t.startsWith('|') && t.includes('|', 1);
      };
      const isTableSep = (l) => {
        const t = (l || '').trim();
        return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(t);
      };

      if (isTableRow(trimmed) && lIdx + 1 < lines.length && isTableSep(lines[lIdx + 1])) {
        const tableLines = [trimmed, lines[lIdx + 1].trim()];
        let nextIdx = lIdx + 2;
        while (nextIdx < lines.length && isTableRow(lines[nextIdx])) {
          tableLines.push(lines[nextIdx].trim());
          nextIdx++;
        }
        elements.push(renderMarkdownTable(tableLines, 'b-' + bIdx + '-tbl-' + lIdx));
        lIdx = nextIdx;
        continue;
      }

      const lineKey = 'b-' + bIdx + '-l-' + lIdx;
      lIdx++;
      const line = rawLine.replace(/\\+\s*$/, '').trimEnd();

      // Empty line or stray AI placeholder e.g. 'undefined' -> ignore
      if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'undefined\\') {
        if (!trimmed) elements.push(<div key={lineKey} className="h-1.5" />);
        continue;
      }

          // Callout Warning e.g. "### ⚠️ Các bẫy đề thi:" or "⚠️ ..."
          if (line.includes('### ⚠️') || line.startsWith('⚠️')) {
            const cleanHeading = line
              .replace(/^###\s*/, '')
              .replace(/^\*\*\s*⚠️\s*/, '')
              .replace(/^⚠️\s*/, '')
              .replace(/\\+\s*$/, '')
              .replace(/^\*\*(.*)\*\*$/, '$1')
              .replace(/:\*\*$/, ':')
              .trim();
            elements.push(
              <div
                key={lineKey}
                className="my-2.5 p-3 rounded-xl bg-rose-50/95 border border-rose-200/90 text-rose-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1 min-w-0 font-extrabold text-rose-950">{renderInlineContent(cleanHeading, lineKey)}</span>
              </div>
            );
          continue;
        }

          // Callout Tip e.g. "### 💡 Mẹo Casio:" or "💡 ..."
          if (line.includes('### 💡') || line.startsWith('💡')) {
            const cleanHeading = line
              .replace(/^###\s*/, '')
              .replace(/^\*\*\s*💡\s*/, '')
              .replace(/^💡\s*/, '')
              .replace(/\\+\s*$/, '')
              .replace(/^\*\*(.*)\*\*$/, '$1')
              .replace(/:\*\*$/, ':')
              .trim();
            elements.push(
              <div
                key={lineKey}
                className="my-2.5 p-3 rounded-xl bg-indigo-50/95 border border-indigo-200/90 text-indigo-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="flex-1 min-w-0 font-extrabold text-indigo-950">{renderInlineContent(cleanHeading, lineKey)}</span>
              </div>
            );
          continue;
        }

          // Callout Pedagogical Example SGK e.g. "### 📌 Ví dụ minh họa SGK:" or "📌 ..."
          if (line.includes('### 📌') || line.startsWith('📌')) {
            const cleanHeading = line
              .replace(/^###\s*/, '')
              .replace(/^\*\*\s*📌\s*/, '')
              .replace(/^📌\s*/, '')
              .replace(/\\+\s*$/, '')
              .replace(/^\*\*(.*)\*\*$/, '$1')
              .replace(/:\*\*$/, ':')
              .trim();
            elements.push(
              <div
                key={lineKey}
                className="my-2.5 p-2.5 rounded-xl bg-teal-50/95 border border-teal-200/90 text-teal-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="flex-1 min-w-0 font-extrabold text-teal-950">{renderInlineContent(cleanHeading, lineKey)}</span>
              </div>
            );
          continue;
        }

          // Callout Sample Problem / Practice Heading e.g. "### 📝 Bài toán mẫu..." or "### 📄 Bài toán mẫu áp dụng phương pháp:"
          // CRITICAL: MUST be a real markdown heading (starting with ###) or a standalone heading label (e.g. "📄 Bài toán mẫu:").
          // It MUST NOT match normal content lines like "**Bài toán mẫu:** Cho tứ diện ABCD..." or "- Bài toán mẫu: ...".
          const isSampleHeadingCallout =
            /^(?:###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Bài toán mẫu áp dụng|Bài toán mẫu|Bài mẫu áp dụng|Bài mẫu minh họa|Bài mẫu))\b/iu.test(trimmed) ||
            /^[📝📄✍️]\s*(?:Bài toán mẫu|Bài mẫu)(?:[^\n:]*)?:?$/iu.test(trimmed);

          if (isSampleHeadingCallout) {
            // Strip ###, and strip leading emojis, quotes, or bullets (do NOT strip asterisks)
            let cleanHeading = line
              .replace(/^###\s*/, '')
              .replace(/^[📝📄✍️📌💡⚠️•\-\s]+(?=(?:Bài toán|Bài mẫu|Ví dụ|Các bẫy|Kỹ thuật|Mẹo))/iu, '')
              .replace(/\\+\s*$/, '')
              .trim();

            // Auto-repair any orphaned bold marker in the heading e.g. "Bài toán mẫu:**" -> "**Bài toán mẫu:**"
            cleanHeading = cleanHeading.replace(/(?<!\*)\b(Bài toán mẫu|Bài mẫu|Ví dụ minh họa|Ví dụ):\*\*/gi, '**$1:**');

            // If the heading line also contains the problem body (e.g. "Bài toán mẫu: Cho tứ diện ABCD..."):
            // Split into badge title and body text so the problem is rendered as body text, not jammed into the heading!
            let badgeTitle = cleanHeading;
            let bodyText = null;

            const splitColon = cleanHeading.match(/^(?:(?:\*\*)?(?:Bài toán mẫu áp dụng phương pháp|Bài toán mẫu|Bài mẫu áp dụng phương pháp|Bài mẫu minh họa|Bài mẫu)(?:\*\*)?:?)\s*(.+)$/is);
            if (splitColon && splitColon[1] && splitColon[1].trim()) {
              badgeTitle = cleanHeading.slice(0, cleanHeading.length - splitColon[1].length).replace(/:\s*$/, '').trim();
              bodyText = splitColon[1].trim();
          continue;
        }

            elements.push(
              <div key={lineKey} className="my-2.5 space-y-1.5">
                <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-300/90 text-amber-950 font-bold text-xs flex items-center gap-2 shadow-2xs">
                  <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="flex-1 min-w-0 font-extrabold">{renderInlineContent(badgeTitle, `${lineKey}-title`)}</span>
                </div>
                {bodyText && (
                  <div className="text-slate-800 text-xs leading-relaxed px-1">
                    {renderInlineContent(bodyText, `${lineKey}-body`)}
                  </div>
                )}
              </div>
            );
          continue;
        }

          // General Markdown Headings (# H1, ## H2, ### H3, #### H4)
          const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const headingText = headingMatch[2].trim();
            const headingStyles = {
              1: 'text-base font-black text-slate-900 border-b border-slate-200 pb-1.5 mt-3 mb-2',
              2: 'text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1 mt-2.5 mb-1.5',
              3: 'text-xs font-bold text-slate-800 mt-2 mb-1 flex items-center gap-1.5',
              4: 'text-xs font-semibold text-slate-700 mt-1.5 mb-1'
            };
            elements.push(
              <div key={lineKey} className={headingStyles[level] || headingStyles[3]}>
                {renderInlineContent(headingText, lineKey)}
              </div>
            );
          continue;
        }

          // Bullet list items e.g. "- ...", "* ...", "• ...", or duplicate "• - ..."
          // NOTE: Must have whitespace after bullet marker so bold "**text**" or "***text***" is NOT treated as a bullet!
          const bulletMatch = line.match(/^(\s*)(?:[-+•\u2022]|\*(?!\*))\s+(?:[-+•\u2022]\s+)?(.*)$/);
          if (bulletMatch) {
            const indentSpaces = bulletMatch[1].length;
            const indentClass = indentSpaces >= 4 ? 'ml-6' : indentSpaces >= 2 ? 'ml-3.5' : 'ml-1';
            const bulletContent = bulletMatch[2];
            elements.push(
              <div key={lineKey} className={`flex items-start gap-2 ${indentClass} leading-relaxed my-0.5`}>
                <span className="text-indigo-500 font-bold select-none leading-relaxed">•</span>
                <span className="flex-1 min-w-0">{renderInlineContent(bulletContent, lineKey)}</span>
              </div>
            );
          continue;
        }

          // Numbered list items e.g. "1. ...", "2) ..."
          const numMatch = line.match(/^(\s*)(\d+[\.\)])\s+(.*)$/);
          if (numMatch) {
            const indentSpaces = numMatch[1].length;
            const indentClass = indentSpaces >= 4 ? 'ml-6' : indentSpaces >= 2 ? 'ml-3.5' : 'ml-1';
            const numMarker = numMatch[2];
            const numContent = numMatch[3];
            elements.push(
              <div key={lineKey} className={`flex items-start gap-2 ${indentClass} leading-relaxed my-0.5`}>
                <span className="font-bold text-indigo-500 select-none leading-relaxed text-xs pt-0.5 shrink-0">
                  {numMarker}
                </span>
                <span className="flex-1 min-w-0">{renderInlineContent(numContent, lineKey)}</span>
              </div>
            );
          continue;
        }

          // Step highlight line e.g. "**Bước 1: ...**" or "Bước 1: ..."
          const isStepLine = /^\s*(\*\*Bước \d+:|Bước \d+:)/i.test(line);
          if (isStepLine) {
            elements.push(
              <div key={lineKey} className="font-bold mt-2.5 mb-1 leading-relaxed">
                {renderInlineContent(line, lineKey)}
              </div>
            );
          continue;
        }

          // Default regular line/paragraph
          elements.push(
            <div key={lineKey} className="leading-relaxed my-0.5">
              {renderInlineContent(line, lineKey)}
            </div>
          );
        }

        return <React.Fragment key={'b-' + bIdx}>{elements}</React.Fragment>;
  });
}

/**
 * MathText Component:
 * Automatically parses and renders LaTeX math formulas embedded in text:
 * - Block display math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Raw math expressions: auto-normalized and wrapped in $...$
 * - Markdown features: bold (**...**), bold-italic (***...***), images (![alt](url)), bullets (- / * / •), numbered lists (1. / 2.)
 * - Callout blocks: "### ⚠️ ...", "### 💡 ...", "### 📌 ...", "### 📝 ..." / "### 📄 ..."
 * - Markdown headings: #, ##, ###, ####
 *
 * Designed to preserve natural inline text flow so that formulas, numbers,
 * commas, periods, and parentheses never shatter across separate lines.
 */
export default function MathText({ text, className = '', onEditMathGraph = null }) {
  if (!text) return null;
  if (typeof text !== 'string') {
    return <span className={className}>{String(text)}</span>;
  }
  const raw = normalizeMathString(text);

  // Check if content has document structure (multiple lines, block math, bullets, callouts, tables, graphs, headings)
  const hasLinebreaks = raw.includes('\n');
  const hasBlockMath = raw.includes('$$') || raw.includes('\\[');
  const hasBullets = /^\s*(?:[-+•\u2022]|\*(?!\*))\s+/m.test(raw);
  const hasCallouts = /###\s*[⚠️💡📌📝📄]/m.test(raw) || /^[⚠️💡📌📝📄]/m.test(raw);
  const hasHeadings = /^(?:#{1,4})\s+/m.test(raw);
  const hasSpecialBlocks = raw.includes('[VARIATION_TABLE]') || raw.includes('[GRAPH:') || raw.includes('[MATH_GRAPH') || raw.includes('[MATH_GRAPH_3D');
  const isStructured = hasLinebreaks || hasBlockMath || hasBullets || hasCallouts || hasHeadings || hasSpecialBlocks;

  if (!isStructured) {
    return (
      <span className={`inline leading-relaxed ${className}`}>
        {renderInlineContent(raw, 'root')}
      </span>
    );
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      {renderStructuredContent(raw, onEditMathGraph)}
    </div>
  );
}
