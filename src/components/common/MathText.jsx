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
      .replace(/\x0crac/g, '\\frac')
      .replace(/\x09imes/g, '\\times')
      .replace(/\x09ext/g, '\\text')
      .replace(/\x08ar/g, '\\bar')
      .replace(/\x08eta/g, '\\beta')
      .replace(/\x0c/g, '\\f')
      .replace(/\x09/g, '\\t')
      .replace(/\x08/g, '\\b')
      .replace(/\\?undefined/gi, '')
      .replace(/\\?null/gi, '')
      .trim();
    if (!clean) return '';

    // Chuẩn hóa khoảng trắng trong \frac và \text
    clean = clean.replace(/\\(text|mathrm|mathbf|mathit|mathsf|mathtt|mathbb|frac|sqrt)\s+\{/g, '\\$1{');
    clean = clean.replace(/(\\frac\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\s+(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$1$2');
    // Thu gọn gạch chéo kép \\ trước lệnh LaTeX để tránh KaTeX hiểu nhầm thành ngắt dòng:
    clean = clean.replace(/\\{2,}(text|frac|times|longrightarrow|xrightarrow|rightleftharpoons|mathrm|mathbf)\b/g, '\\$1');
    // Phục hồi lệnh \text{unit} nếu bị rớt mất gạch chéo \:
    clean = clean.replace(/(?<=[0-9,\.]|\w|\})\s*text\s*\{(mol|gam|g|kg|lít|lit|ml)\}/gi, ' \\text{$1}');
    // Nếu có \frac chỉ với 1 đối số {arg1} mà không có {arg2}, tự động bù {}:
    clean = clean.replace(/\\frac\{([^{}]*)\}(?!\s*\{)/g, '\\frac{$1}{}');
    // Nếu có \text trần không có ngoặc nhọn, loại bỏ để tránh KaTeX parse error:
    clean = clean.replace(/\\text\b(?!\s*\{)/g, '');
    // Làm sạch khoảng trắng bên trong ngoặc đơn giản {2 } -> {2}
    clean = clean.replace(/\{(\s*[0-9a-zA-Z\+\-\*\/]+\s*)\}/g, (m, g) => '{' + g.trim() + '}');

    // Strip unescaped $ inside math mode to prevent syntax errors
    clean = clean.replace(/(?<!\\)\$/g, '');

    // Sửa {k - 1$} hoặc {arg$}
    clean = clean.replace(/\{([^{}\$]+)\$\}/g, '{$1}');

    // Balance braces { and } to prevent KaTeX parse errors
    let openB = 0;
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '{' && (i === 0 || clean[i - 1] !== '\\')) openB++;
      else if (clean[i] === '}' && (i === 0 || clean[i - 1] !== '\\')) openB--;
    }
    while (openB > 0) { clean += '}'; openB--; }
    while (openB < 0) { clean = '{' + clean; openB++; }

    let html = katex.renderToString(clean, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml'
    });

    if (html.includes('class="katex-error"')) {
      // Emergency sanitization: strip invalid tokens and retry
      let sanitized = clean
        .replace(/\x0c/g, '\\f')
        .replace(/\x09/g, '\\t')
        .replace(/\x08/g, '\\b')
        .replace(/\\text\{([^{}]*)\}/g, '$1')
        .replace(/[\{\}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      try {
        const retryHtml = katex.renderToString(sanitized, { displayMode, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
        if (!retryHtml.includes('class="katex-error"')) {
          return retryHtml;
        }
      } catch (e) {
        // Fall through
      }
      // If still error, strip the katex-error tag and remove style="color:#cc0000" completely
      return `<span class="inline-math font-serif text-slate-800">${clean.replace(/\\text\{([^{}]*)\}/g, '$1')}</span>`;
    }

    return html.replace(/<span[^>]*class="katex-error"[^>]*>.*?undefined.*?<\/span>/gi, '');
  } catch (err) {
    console.warn('KaTeX render error:', err);
    return `<span class="inline-math font-serif text-slate-800">${latex}</span>`;
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

  // 0. Phục hồi ngay lập tức các ký tự điều khiển ASCII bị JSON.parse hoặc escape nuốt
  str = str.replace(/\x0crac/g, '\\frac')
           .replace(/\x09imes/g, '\\times')
           .replace(/\x09ext/g, '\\text')
           .replace(/\x08ar/g, '\\bar')
           .replace(/\x08eta/g, '\\beta')
           .replace(/\x0c/g, '\\f')
           .replace(/\x09/g, '\\t')
           .replace(/\x08/g, '\\b');

  // 1. Unescape literal string escaped newlines e.g. "\n" -> real newlines
  str = unescapeLiteralNewlines(str);

  // Dọn dẹp lỗi cú pháp đặt dấu $ lẫn lộn
  // Sửa lỗi dấu $ đặt sai vị trí bên trong ngoặc nhọn: {k - 1$} -> {k - 1}$
  str = str.replace(/\{([^{}\$]+)\$\}/g, '{$1}$');
  // Sửa lỗi dấu $ đặt ngay trước/sau dấu bằng hoặc toán tử: n_{\text{triglyceride}} $=\frac -> n_{\text{triglyceride}} = \frac
  str = str.replace(/(?<=\w|\})\s*\$\s*=\s*\$?/g, ' = ');
  str = str.replace(/\$\s*=\s*\$?|(?<=\w|\})\s*\$\s*=/g, ' = ');

  // Sửa lỗi đóng $$ ở cuối dòng không có mở $$: RCOOCH=CH_2 + NaOH \xrightarrow...$$ -> $$RCOOCH=CH_2...$$
  str = str.replace(/^(?!\$\$)(.+?\\xrightarrow[^\r\n]+)\$\$$/gm, '$$$$$1$$$$');

  // Giải phóng ngay văn bản tiếng Việt bị nuốt nhầm vào giữa cặp $...$ hoặc $$...$$ do thiếu đóng $
  const vietnameseLettersRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const vietnameseWordsRegex = /\b(?:suy\s+ra|dựa\s+vào|thu\s+được|phản\s+ứng|hoàn\s+toàn|tác\s+dụng|dung\s+dịch|chất|kết\s+tủa|khí|nhiệt\s+độ|hiệu\s+suất|khối\s+lượng|số\s+mol|gốc\s+acid|gốc\s+alcohol|đồng\s+phân|danh\s+pháp|tính\s+chất|khái\s+niệm|khi\s+thay|thì\s+được|ở\s+nhóm|của|bằng|trong|với|tối\s+đa|liên\s+kết)\b/i;

  str = str.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    const outsideText = inner.replace(/\\text\{[^{}]*\}/g, '').replace(/[_^]\{[^{}]*\}/g, '');
    if (vietnameseWordsRegex.test(outsideText) || (vietnameseLettersRegex.test(outsideText) && /\s+/.test(outsideText.trim()))) {
      return inner;
    }
    return match;
  });

  str = str.replace(/\$([^\$\r\n]+?)\$/g, (match, inner) => {
    const outsideText = inner.replace(/\\text\{[^{}]*\}/g, '').replace(/[_^]\{[^{}]*\}/g, '');
    if (vietnameseWordsRegex.test(outsideText) ||
        /\b[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{3,}\s+[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{2,}\b/i.test(outsideText)) {
      return inner;
    }
    return match;
  });

  // Chuẩn hóa tiếng Việt trong chỉ số dưới: m_{chất béo}, m_{chấtbéo}, n_{muối}, m_{muối}
  str = str.replace(/([a-zA-Z])_\{chấtbéo\}/gi, '$1_{\\text{chất béo}}');
  str = str.replace(/([a-zA-Z])_\{chất\s*béo\}/gi, '$1_{\\text{chất béo}}');
  str = str.replace(/([a-zA-Z])_\{muối\}/gi, '$1_{\\text{muối}}');
  str = str.replace(/([a-zA-Z])_\{ester\}/gi, '$1_{\\text{ester}}');
  str = str.replace(/([a-zA-Z])_\{glycerol\}/gi, '$1_{\\text{glycerol}}');
  str = str.replace(/([a-zA-Z])_\{phảnứng\}/gi, '$1_{\\text{phản ứng}}');
  str = str.replace(/([a-zA-Z])_\{thựctế\}/gi, '$1_{\\text{thực tế}}');
  str = str.replace(/([a-zA-Z])_\{lýthuyết\}/gi, '$1_{\\text{lý thuyết}}');
  str = str.replace(/([a-zA-Z])_\{líthuyết\}/gi, '$1_{\\text{lí thuyết}}');
  // Bọc an toàn mọi cụm từ tiếng Việt trong _{...} bằng \text{...}
  str = str.replace(/([a-zA-Z])_\{(?!\s*\\text\{)([a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s()]{2,})\}/g, '$1_{\\text{$2}}');

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

  // Khắc phục công thức ester dính liền O_2 ngay sau $C_nH_{2n}$ hoặc khoảng trắng e.g. $C_nH_{2n}$O_2 -> $C_nH_{2n}O_2$
  str = str.replace(/(\$C_\{?[0-9n\+\-]+\}?H_\{?[0-9a-zA-Z\+\-]+\}?)\$\s*(O_\{?[0-9]+\}?)/gi, '$1$2$');

  // Khắc phục công thức ester không có mở $ mà có đóng $ ở O_2 e.g. C_nH_{2n}$O_2 -> $C_nH_{2n}O_2$ hoặc C_nH_{2n}$O_2$ -> $C_nH_{2n}O_2$
  str = str.replace(/(?<![\$\w])(C_\{?[0-9n\+\-]+\}?H_\{?[0-9a-zA-Z\+\-]+\}?)\$\s*(O_\{?[0-9]+\}?)\$?/gi, '$$$1$2$$');
  str = str.replace(/(?<![\$\w])(C_\{?[0-9n\+\-]+\}?H_\{?[0-9a-zA-Z\+\-]+\}?)\s*(O_\{?[0-9]+\}?)(?![\$\w])/gi, '$$$1$2$$');

  // Sửa lỗi đóng mở $ bị lỗi trong {arg$} -> {arg}$
  str = str.replace(/\{([^{}\$]+)\$\}/g, '{$1}$');

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

  // Chuẩn hóa số thập phân có khoảng trắng sau dấu phẩy e.g. 9, 18 gam -> 9,18 gam
  str = str.replace(/(\d+),\s+(\d+)/g, '$1,$2');

  // Chuẩn hóa khoảng trắng lệnh LaTeX và dấu ngoặc nhọn: \text {mol} -> \text{mol}, \frac {a} {b} -> \frac{a}{b}
  str = str.replace(/\\(text|mathrm|mathbf|mathit|mathsf|mathtt|mathbb|frac|sqrt)\s+\{/g, '\\$1{');
  str = str.replace(/(\\frac\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\s+(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$1$2');
  str = str.replace(/\{(\s*[0-9a-zA-Z\+\-\*\/]+\s*)\}/g, (m, g) => '{' + g.trim() + '}');
  // 1. Dọn dẹp triệt để các mã lệnh \\text{gam}, \\text{mol}, text{gam} bị lọt vào văn bản tiếng Việt thường:
  str = str.replace(/(?<![A-Za-z_])([0-9]+(?:[,\.][0-9]+)?)\s*\\*text\s*\{\s*(mol|gam|g|kg|lít|lit|ml)\s*\}/gi, '$1 $2');
  str = str.replace(/(?<=[0-9,\.]|\w|\})\s*text\s*(mol|gam|g|kg|lít|lit|ml)\b/gi, ' \\text{$1}');
  str = str.replace(/\btext(mol|gam|g|kg)\b/gi, '\\text{$1}');
  str = str.replace(/\\text\s*(mol|gam|g|kg|lít|lit|ml)\b/gi, '\\text{$1}');

  // Chuẩn hóa biến đơn lẻ đứng trước đơn vị đo: a mol -> $a$ mol, V lít -> $V$ lít, m gam -> $m$ gam
  str = str.replace(/(?<![\$\w])([amVnxy])\s+(mol|gam|g|kg|lít|lit|ml)\b/gi, '$$$1$$ $2');

  // Chuẩn hóa chỉ số dưới tiếng Việt hóa học: k_{gốc} -> k_{\text{gốc}}, m_{dd} -> m_{\text{dd}}
  str = str.replace(/([a-zA-Z])_\{gốc\}/gi, '$1_{\\text{gốc}}');
  str = str.replace(/([a-zA-Z])_\{dd\}/gi, '$1_{\\text{dd}}');

  // 2. Thu gọn triệt để các dấu gạch chéo kép \\ trước lệnh LaTeX:
  str = str.replace(/\\{2,}(text|frac|times|longrightarrow|xrightarrow|rightleftharpoons|mathrm|mathbf)\b/g, '\\$1');

  // 3. Phục hồi ngoặc nhọn bị thiếu ở chỉ số dưới trước dấu bằng: n_{H_2O = -> n_{H_2O} =
  str = str.replace(/n_\{([A-Za-z0-9]+)\s*=/g, 'n_{$1} =');

  // Sửa lỗi dấu $ đặt ngay trước hoặc sau dấu bằng trong công thức e.g. n_{\text{triglyceride}} $=\frac{...} -> n_{\text{triglyceride}} = \frac{...}
  str = str.replace(/\$\s*=\s*\$?|(?<=\w|\})\s*\$\s*=/g, ' = ');

  // 4. Tự động bọc toàn diện chuỗi biểu thức tính toán nhiều vế và phương trình bảo toàn:
  // Ví dụ: 2n_X + 2n_{O_2} = 2n_{CO_2} + n_{H_2O} \longrightarrow 2n_X + 2 \times 0,35 = 2 \times 0,3 + 0,3 \longrightarrow n_X = 0,1 mol
  // 2n_{\text{ester}} + 2n_{O_2} = 2n_{CO_2} + n_{H_2O}
  // n = \frac{0,3}{0,1} = 3
  const opPattern = '(?:[-+\\=><]|\\\\times|\\\\cdot|\\\\pm|\\\\longrightarrow|\\\\rightarrow|\\\\implies|\\\\Rightarrow|\\\\ge|\\\\le|\\\\approx|\\\\equiv|\\\\rightleftharpoons|\\\\xrightarrow(?:\\s*\\{[^{}]*\\})*)';
  const subPattern = '(?:_\\{(?:[^{}]*|\\{[^{}]*\\})*\\}|_[a-zA-Z0-9]+)?';
  const unitPattern = '(?:\\s*\\\\*text\\s*\\{\\s*(?:mol|gam|g|kg|lít|lit|ml)\\s*\\}|\\s*\\\\*text\\s*(?:mol|gam|g|kg|lít|lit|ml)\\b|\\s*(?:mol|gam|g|kg|lít|lit|ml))';
  const expPattern = '(?:\\^\\s*(?:\\{[^{}]*\\}|[0-9a-zA-Z]))?';
  const coreAtom = `(?:\\d*\\s*[a-zA-Z]${subPattern}${expPattern}|\\\\frac\\s*\\{[^{}]*\\}\\s*\\{[^{}]*\\}|[0-9]+(?:[\\.,][0-9]+)?${expPattern}${unitPattern}?)`;
  const atomPattern = `(?:\\(\\s*)*${coreAtom}(?:\\s*\\))*`;
  const fullEqRegex = new RegExp(`(?<![\\$\\\\\\w\\{_\\^])(${atomPattern}(?:[ \\t]*${opPattern}[ \\t]*${atomPattern})+)(?![\\$\\\\\\w\\}_])`, 'g');
  const eqSrc = str;
  str = str.replace(fullEqRegex, (m, g, offset) => {
    // Bỏ qua nếu khớp nằm bên trong cặp $...$ đã có
    if (((eqSrc.slice(0, offset).match(/\$/g)) || []).length % 2 === 1) return m;
    let lead = '', trail = '';
    for (;;) {
      const tr = g.trim();
      const open = (tr.match(/\(/g) || []).length, close = (tr.match(/\)/g) || []).length;
      if (open > close && tr.startsWith('(')) { const k = g.indexOf('('); lead += g.slice(0, k + 1); g = g.slice(k + 1); }
      else if (close > open && tr.endsWith(')')) { const k = g.lastIndexOf(')'); trail = g.slice(k) + trail; g = g.slice(0, k); }
      else if (tr.startsWith('(') && tr.endsWith(')') && open === close) {
        let depth = 0, wrapsAll = true;
        for (let ci = 0; ci < tr.length; ci++) {
          if (tr[ci] === '(') depth++;
          else if (tr[ci] === ')') { depth--; if (depth === 0 && ci < tr.length - 1) { wrapsAll = false; break; } }
        }
        if (!wrapsAll) break;
        const k1 = g.indexOf('('), k2 = g.lastIndexOf(')');
        lead += g.slice(0, k1 + 1); trail = g.slice(k2) + trail; g = g.slice(k1 + 1, k2);
      } else break;
    }
    const leadWs = g.match(/^\s*/)[0];
    const trailWs = g.match(/\s*$/)[0];
    let clean = g.replace(/(?<!\\)\$/g, '').trim();
    clean = clean.replace(/(?<=\d)\s*(?:\\+text\s*\{\s*|\\*text\s*)(mol|gam|g|kg|lít|lit|ml)\}?/gi, '\\text{ $1}');
    clean = clean.replace(/(?<=\d)\s+(mol|gam|g|kg|lít|lit|ml)\b/gi, '\\text{ $1}');
    return lead + leadWs + '$' + clean + '$' + trailWs + trail;
  });

  // Sửa lỗi dính lệnh LaTeX không có khoảng trắng: \equivC -> \equiv C
  str = str.replace(/\\(equiv|times|rightarrow|leftarrow|rightleftharpoons)([A-Za-z0-9])/g, '\\$1 $2');
  str = str.replace(/([A-Za-z0-9_]+)\$\s*=\s*\$([A-Za-z0-9_]+)/g, '$1=$2');
  str = str.replace(/\$\s*(-[A-Za-z0-9]+-)\s*,?/g, '$1,');

  // Sửa lỗi đóng mở $ giữa công thức có dấu chấm/phẩy kết thúc trước chữ tiếng Việt e.g. $C_{17}H_{33}. 1 mol -> $C_{17}H_{33}$. 1 mol
  str = str.replace(/(\$(?:[A-Za-z0-9_\\\{\}\^]+))\.\s+([0-9a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])/gi, '$1$. $2');

  // Sửa phương trình phản ứng bị đóng mở $ vụn vặt: RCOOH$+ R'OH -> RCOOH + R'OH
  str = str.replace(/([A-Za-z0-9_\x27]+)\s*\$\s*([+=])\s*\$?\s*([A-Za-z0-9_\x27]+)/g, '$1 $2 $3');

  // Hàn gắn các dòng công thức LaTeX bị ngắt dòng ở giữa dấu ngoặc nhọn
  str = mergeUnclosedLatexLines(str);

  // Sửa các dòng có dấu $ lẻ ở cuối dòng (như 'A. HCOOC_2H_5$' -> 'A. $HCOOC_2H_5$')
  str = str.replace(/^([A-D][\.\:\)]\s*)([^\$\r\n]+)\$$/gm, '$1$$$2$$');
  str = str.replace(/\$\s*\.\s*\$/g, '.');

  // Chuẩn hóa tiêu đề mục phân tích & lời giải chuẩn:
  str = str.replace(/\*\*(?:Phân tích|Hướng dẫn)\s*&?\s*Lời giải:\*\*/gi, '**Phân tích & Lời giải:**');
  str = str.replace(/(?<!\*)\b((?:Phân tích\s*&\s*Lời giải|Hướng dẫn giải|Lời giải|Phương pháp giải|Bài toán mẫu|Ví dụ minh họa|Ví dụ)):\*\*/gi, '**$1:**');

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
        const eqWithoutText = eq.replace(/\\text\{[^{}]*\}/g, '');
        if (!vietnameseLettersRegex.test(eqWithoutText)) {
          eq = eq.replace(/^\${1,2}/, '').replace(/\${1,2}$/, '').trim();
          eq = eq.replace(/(?<!\\)\$/g, '');
          return `${label}\n$$${eq}$$`;
        }
      } else {
        const trimmedWithoutText = trimmed.replace(/\\text\{[^{}]*\}/g, '');
        if (!vietnameseLettersRegex.test(trimmedWithoutText)) {
          let eq = trimmed.replace(/\.$/, '').trim();
          eq = eq.replace(/^\${1,2}/, '').replace(/\${1,2}$/, '').trim();
          eq = eq.replace(/(?<!\\)\$/g, '');
          return '$$' + eq + '$$';
        }
      }
    } else {
      // Công thức toán/hóa đứng riêng dòng có chứa '=' và \frac hoặc \sqrt (không chứa từ tiếng Việt ngoài \text{})
      const trimmedWithoutText = trimmed.replace(/\\text\{[^{}]*\}/g, '');
      if (trimmed.includes('=') && /\\(?:frac|sqrt|lim|sum|prod|int)\b/.test(trimmed) &&
          !vietnameseLettersRegex.test(trimmedWithoutText)) {
        let eq = trimmed.replace(/^\${1,2}/, '').replace(/\${1,2}$/, '').trim();
        eq = eq.replace(/(?<!\\)\$/g, '');
        return '$$' + eq + '$$';
      }
    }
    return line;
  }).join('\n');

  // Dọn dẹp dấu $ dính nhầm vào đơn vị ở cuối câu e.g. "gam$." -> "gam." hoặc "mol$" -> "mol"
  str = str.replace(/\s*(mol|gam|g|kg|lít|lit|ml)\$\./gi, ' $1.');
  str = str.replace(/\s*(mol|gam|g|kg|lít|lit|ml)\$(?=[\s\.,;\*\)]|$)/gi, ' $1');

  // Cân bằng dấu $ đơn lẻ bị cô lập trên từng dòng để triệt tiêu việc rò rỉ math mode sang dòng tiếp theo
  str = str.split('\n').map(line => {
    let dMatches = (line.match(/(?<!\\)\$/g) || []).length;
    if (dMatches % 2 !== 0) {
      if (/\$\.?$/.test(line.trimEnd())) {
        line = line.trimEnd().replace(/\$\.$/, '.').replace(/\$$/, '');
      } else {
        // Tự động đóng $ cho công thức mở dở đứng trước từ tiếng Việt
        line = line.replace(/(?<![\$\w])\$([A-Za-z0-9_+\-^\\\{\}\x27]+)(?=\s+[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])/g, (m, g) => '$' + g + '$');
        line = line.replace(/(?<![\$\w])\$([A-Za-z0-9_+\-^\\\{\}\x27]+)\.\s+([0-9a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])/g, (m, g, v) => '$' + g + '$. ' + v);
        let left = (line.match(/(?<!\\)\$/g) || []).length;
        if (left % 2 !== 0) {
          line = line.replace(/(?<![\$\w])\$([A-Za-z0-9_+\-^\\\{\}\x27]+)(?=[\s\.,;\*\)]|$)/g, (m, g) => '$' + g + '$');
        }
        left = (line.match(/(?<!\\)\$/g) || []).length;
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
      // Phục hồi an toàn nếu văn bản tiếng Việt bị nuốt nhầm vào trong $...$ hoặc $$...$$
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const inner = part.slice(2, -2).trim();
        const innerOut = inner.replace(/\\text\{[^{}]*\}/g, '').replace(/[_^]\{[^{}]*\}/g, '');
        if (vietnameseWordsRegex.test(innerOut) || (vietnameseLettersRegex.test(innerOut) && !inner.includes('\\text{'))) {
          return inner;
        }
        return '$$' + inner.replace(/(?<!\\)\$/g, '') + '$$';
      }
      if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$')) {
        const inner = part.slice(1, -1);
        const innerOut = inner.replace(/\\text\{[^{}]*\}/g, '').replace(/[_^]\{[^{}]*\}/g, '');
        if (vietnameseWordsRegex.test(innerOut) ||
            /\b[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{3,}\s+[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{2,}\b/i.test(innerOut) ||
            (vietnameseLettersRegex.test(innerOut) && !inner.includes('\\text{'))) {
          return inner;
        }
        return '$' + inner.replace(/(?<!\\)\$/g, '') + '$';
      }
      return part;
    }

    let textChunk = part;

    function wrapUntouchedMath(s, regex, replacer) {
      const chunks = s.split(/(\$[^\$\r\n]+?\$)/);
      return chunks.map(chunk => {
        if (chunk.startsWith('$') && chunk.endsWith('$')) return chunk;
        return typeof replacer === 'function' ? chunk.replace(regex, replacer) : chunk.replace(regex, replacer);
      }).join('');
    }

    // Wrap LaTeX commands with curly braces or sub/superscripts e.g. \frac{a}{b}, \sqrt{x}, \lim_{x \to 0}, \Delta, \xrightarrow, \Rightarrow
    // KHÔNG match \text đứng trần nếu nó là chỉ số dưới _{...}
    textChunk = wrapUntouchedMath(
      textChunk,
      /(?<![_^])(\\(?:mathrm|mathbf|Delta|frac|sqrt|lim|int|sum|prod|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|Omega|left|right|partial|infty|vec|le|ge|neq|approx|equiv|pm|times|div|cdot|in|notin|subset|cap|cup|forall|exists|mathbb|xrightarrow|rightleftharpoons|longrightarrow|leftarrow|longleftarrow|implies|iff|Rightarrow|rightarrow|Leftarrow|Leftrightarrow|to)\b(?:\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|_[a-zA-Z0-9{}]*(?:\{[^{}]*\})?|\^[a-zA-Z0-9{}]*(?:\{[^{}]*\})?)*)/g,
      (m, g) => '$' + g + '$'
    );

    // 1. Bọc công thức cấu tạo ester có liên kết đôi/đơn (như CH_3COOCH=CH_2, CH_2=CH-COOCH_3, RCOOR')
    textChunk = wrapUntouchedMath(textChunk, /(?<![\$\w])([A-Z][a-zA-Z0-9_']*(?:COO|COOH|COONa)[A-Za-z0-9_\-='\(]+)(?![\$\w])/g, (m, g) => '$' + g + '$');

    // 2. Bọc công thức hóa học có gốc ngoặc hoặc chỉ số dưới phức tạp nhiều nguyên tố (như (RCOO)_3C_3H_5, C_{17}H_{33}, C_{15}H_{31}COOH)
    textChunk = wrapUntouchedMath(textChunk, /(?<![\$\\\w])((?:\([A-Z][a-zA-Z0-9_\\\{\}\^]*\)\d*|[A-Z][a-z]?(?:_\{\d+\}|_\d+)?)+[A-Za-z0-9_\\\{\}]*)(?![\$\\\w\}])/g, (m, g) => {
      if (g.includes('_') || g.includes('(') || /^(?:COOH|COONa|CH_3|C_2H_5)/.test(g)) {
        return '$' + g + '$';
      }
      return g;
    });

    // 3. Bọc toàn bộ biến vật lý / hóa học có chỉ số dưới kèm \text (như m_{\text{chất béo}}, n_{\text{muối}}, m_{\text{glycerol}})
    textChunk = wrapUntouchedMath(textChunk, /(?<![\$\\\w])([a-zA-Z]_(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|[a-zA-Z0-9]+))(?![\$\w])/g, (m, g) => '$' + g + '$');

    // 4. Wrap chemical ions with charges like H^+, OH^-, Fe^{3+}, Fe^3+, SO_4^{2-}, NO_3^-, Na^+, Cl^-, CH_3COO^-
    textChunk = wrapUntouchedMath(
      textChunk,
      /(?<![$\\\w])((?:[A-Z][a-z]?(?:_\d+)?)+\^\{?[+-]?\d*[+-]?\}?)(?![$\w])/g,
      (m, g) => '$' + g + '$'
    );

    // 5. Wrap chemical compounds with subscripts or numbers like C_3H_6O_2, H_2O, H_2SO_4, HNO_3, CO_2, Fe_2O_3, KMnO_4, O_2, N_2, H_2, CH_3COOH, C_2H_5OH
    textChunk = wrapUntouchedMath(
      textChunk,
      /(?<![\$\\\w\{_])([A-Z][a-z]?(?:_\d+|_\{\d+\}|_\{?[0-9a-zA-Z\+\-]+\}?|\d+)*(?:[A-Z][a-z]?(?:_\d+|_\{\d+\}|_\{?[0-9a-zA-Z\+\-]+\}?|\d+)*)*)(?![\$\\\w\}_])/g,
      (m, g) => {
        if (g.length > 1 && (g.includes('_') || /(?:COOH|COONa|OH|CHO|SO_4|NO_3)/.test(g) || (/[A-Z]/.test(g) && /\d/.test(g)))) {
          return '$' + g + '$';
        }
        return g;
      }
    );

    // 6. Wrap single variable subscripts like x_0, y_0, x_1, f'(x_0)
    textChunk = wrapUntouchedMath(textChunk, /(?<![$\\\w])([a-zA-Z]_[0-9a-zA-Z])(?![$\w])/g, (m, g) => '$' + g + '$');

    // 7. Wrap mathematical intervals e.g. (-\infty; +\infty), [0; +\infty)
    textChunk = wrapUntouchedMath(textChunk, /([(\[][\s]*[+-]?(?:\\infty|\d+)\s*;\s*[+-]?(?:\\infty|\d+)[\s]*[)\]])/g, (m, g) => '$' + g + '$');

    // Khắc phục triệt để lỗi lồng dấu $ bên trong ngoặc đơn e.g. $($C_{17}H_{35}COO$)_3C_3H_5$
    textChunk = textChunk.replace(/\$\(\$([^\$]+)\$([^\$]*)\$/g, '$($1)$2$');

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

  // 1. Process markdown bold-italic (***...***) and bold (**...**) first
  // so that bold blocks containing math (such as `**Công thức đốt cháy (chứa $\pi$):**`)
  // do not get their bold markers broken across math delimiter splits!
  const boldRegex = /(\*\*\*[^\*\n]+?\*\*\*|\*\*[^\*\n]+?\*\*)/g;
  if (boldRegex.test(text)) {
    const boldParts = text.split(boldRegex);
    return boldParts.map((bPart, bIdx) => {
      if (!bPart) return null;
      const bKey = `${keyPrefix}-b${bIdx}`;
      if (bPart.startsWith('***') && bPart.endsWith('***') && bPart.length >= 6) {
        return (
          <strong key={bKey} className="font-extrabold italic">
            {renderInlineMathAndText(bPart.slice(3, -3), `${bKey}-bi`)}
          </strong>
        );
      }
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
        return (
          <strong key={bKey} className="font-extrabold">
            {renderInlineMathAndText(bPart.slice(2, -2), `${bKey}-b`)}
          </strong>
        );
      }
      return renderInlineMathAndText(bPart, bKey);
    });
  }

  return renderInlineMathAndText(text, keyPrefix);
}

function renderInlineMathAndText(text, keyPrefix = '') {
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
      const vietnameseWordsRegex = /\b(?:suy\s+ra|dựa\s+vào|thu\s+được|phản\s+ứng|hoàn\s+toàn|tác\s+dụng|dung\s+dịch|chất|kết\s+tủa|khí|nhiệt\s+độ|hiệu\s+suất|khối\s+lượng|số\s+mol|gốc\s+acid|gốc\s+alcohol|đồng\s+phân|danh\s+pháp|tính\s+chất|khái\s+niệm|khi\s+thay|thì\s+được|ở\s+nhóm|của|bằng|trong|với|tối\s+đa|liên\s+kết)\b/i;
      const outsideText = math.replace(/\\text\{[^{}]*\}/g, '');
      if (vietnameseWordsRegex.test(outsideText) || /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(outsideText)) {
        return <span key={partKey} className="mx-0.5">{math}</span>;
      }
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
      const vietnameseWordsRegex = /\b(?:suy\s+ra|dựa\s+vào|thu\s+được|phản\s+ứng|hoàn\s+toàn|tác\s+dụng|dung\s+dịch|chất|kết\s+tủa|khí|nhiệt\s+độ|hiệu\s+suất|khối\s+lượng|số\s+mol|gốc\s+acid|gốc\s+alcohol|đồng\s+phân|danh\s+pháp|tính\s+chất|khái\s+niệm|khi\s+thay|thì\s+được|ở\s+nhóm|của|bằng|trong|với|tối\s+đa|liên\s+kết)\b/i;
      const outsideText = math.replace(/\\text\{[^{}]*\}/g, '');
      if (vietnameseWordsRegex.test(outsideText) || /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(outsideText)) {
        return <span key={partKey} className="mx-0.5">{math}</span>;
      }
      // Nếu bên ngoài \text{} có chuỗi chữ cái thường hoặc tiếng Việt có khoảng trắng:
      if (/\b[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{3,}\s+[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{2,}\b/i.test(outsideText)) {
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

    // Non-math text: parse markdown images, italic
    const mdParts = part.split(/(!\[.*?\]\(.*?\)|\*[^\*\n\s][^\*\n]*?[^\*\n\s]\*|\*[^\*\n\s]\*)/g);

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
      // Nếu khối display math chứa tiếng Việt mà không nằm trong \text{}, hiển thị thành khối văn bản thuần
      if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(math) && !math.includes('\\text{')) {
        return (
          <div key={`b-${bIdx}`} className="my-1.5 text-slate-800 text-xs leading-relaxed">
            {renderInlineContent(math, `b-${bIdx}-txt`)}
          </div>
        );
      }
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
