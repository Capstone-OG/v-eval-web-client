/**
 * mathTokenizer.js
 * ---------------------------------------------------------------------------
 * Bộ phân tách Text/Math an toàn cho nội dung do LLM sinh ra (Hóa học, Toán học...).
 *
 * Nguyên tắc thiết kế (thay thế hoàn toàn cách "vá chuỗi bằng regex" cũ):
 *  1. Quét tuần tự từng ký tự để ghép cặp dấu `$` / `$$` / `\(..\)` / `\[..\]`.
 *     - Inline `$...$` chỉ được nằm trên 1 dòng (cho phép tối đa 2 dòng nếu tuân thủ
 *       quy tắc Pandoc: sau `$` mở và trước `$` đóng không phải khoảng trắng).
 *  2. Mỗi đoạn math ứng viên BẮT BUỘC qua 2 bước kiểm định:
 *     - Không phải văn xuôi (không chứa chữ tiếng Việt / chuỗi từ ngữ ngoài `\text{}`).
 *     - KaTeX parse thành công (throwOnError: true).
 *     Nếu không đạt -> dấu `$` mở bị coi là "mồ côi" và bị loại bỏ, phần nội dung trả về văn bản.
 *  3. Trên phần văn bản thuần còn lại, tự động nhận diện công thức (lệnh LaTeX, chỉ số
 *     dưới/trên, công thức hóa học phẳng CH3COOH, phương trình có mũi tên) theo từng "từ"
 *     và gom thành cụm, rồi cũng kiểm định KaTeX trước khi bọc.
 *  4. Kết quả là danh sách token { type: 'text' | 'math', content, display } -> không bao giờ
 *     sinh ra chuỗi `$a$$b$` mơ hồ.
 */
import katex from 'katex';

// Ký hiệu nguyên tố hóa học + gốc hữu cơ R (dùng cho nhận diện công thức hóa học phẳng)
const ELEMENTS = new Set([
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
  'Cs', 'Ba', 'La', 'Ce', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'U', 'W', 'R'
]);

// Chữ cái Latin có dấu (tiếng Việt) -> dấu hiệu văn xuôi khi nằm ngoài \text{}
const VIET_LETTER_RE = /[\u00C0-\u024F\u1E00-\u1EFF]/;

const katexValidityCache = new Map();

export function isValidLatex(src, displayMode = false) {
  const key = `${displayMode ? 'D' : 'I'}::${src}`;
  if (katexValidityCache.has(key)) return katexValidityCache.get(key);
  let ok = false;
  try {
    katex.renderToString(src, { throwOnError: true, strict: 'ignore', displayMode });
    ok = true;
  } catch {
    ok = false;
  }
  if (katexValidityCache.size > 5000) katexValidityCache.clear();
  katexValidityCache.set(key, ok);
  return ok;
}

/** Loại bỏ nội dung bên trong \text{..}, \mathrm{..}, \textbf{..}... (có cân bằng ngoặc) */
export function stripTextGroups(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const m = s.slice(i).match(/^\\(?:text|textbf|textit|textrm|mathrm|mathbf|operatorname|mbox)\s*\{/);
    if (m) {
      let depth = 1;
      let j = i + m[0].length;
      while (j < s.length && depth > 0) {
        if (s[j] === '\\') { j += 2; continue; }
        if (s[j] === '{') depth++;
        else if (s[j] === '}') depth--;
        j++;
      }
      out += ' ';
      i = j;
      continue;
    }
    out += s[i];
    i++;
  }
  return out;
}

/** Nhận diện đoạn "math" thực chất là văn xuôi (do ghép nhầm cặp `$`) */
export function looksLikeProse(content) {
  const bare = stripTextGroups(content);
  if (VIET_LETTER_RE.test(bare)) return true;
  const noCmds = bare.replace(/\\[a-zA-Z]+/g, ' ');
  // 2 từ thường (>= 3 chữ cái) liên tiếp nhau ngoài \text{} => văn xuôi (vd: "acid acetic", "is the")
  if (/(?:^|[^A-Za-z_\\^])[a-z]{3,}\s+[a-z]{3,}(?![A-Za-z_^])/.test(noCmds)) return true;
  // Markdown bold/list marker lọt vào trong math
  if (/\*\*|^\s*[-*•]\s/.test(bare)) return true;
  return false;
}

function acceptMath(content, displayMode) {
  const c = content.replace(/\s*\r?\n\s*/g, ' ').trim();
  if (!c) return null;
  if (looksLikeProse(c)) return null;
  if (!isValidLatex(c, displayMode)) return null;
  return c;
}

/** Tìm vị trí `$` đơn kế tiếp (không bị escape) trong [from, limit) */
function findClosingDollar(s, from, limit) {
  for (let k = from; k < limit; k++) {
    if (s[k] === '\\') { k++; continue; }
    if (s[k] === '$') return k;
  }
  return -1;
}

function findClosingDoubleDollar(s, from) {
  for (let k = from; k < s.length - 1; k++) {
    if (s[k] === '\\') { k++; continue; }
    if (s[k] === '$' && s[k + 1] === '$') return k;
  }
  return -1;
}

function nthNewlineIndex(s, from, n) {
  let idx = from;
  for (let c = 0; c < n; c++) {
    const nl = s.indexOf('\n', idx);
    if (nl < 0) return s.length;
    idx = nl + 1;
  }
  return idx - 1;
}

// ---------------------------------------------------------------------------
// Auto-detect công thức trong đoạn văn bản thuần
// ---------------------------------------------------------------------------

function splitTopLevelWords(line) {
  const out = [];
  let buf = '';
  let depth = 0;
  let mode = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const isWs = (ch === ' ' || ch === '\t') && depth === 0;
    if (mode === null) mode = isWs;
    if (isWs !== mode) {
      out.push({ text: buf, isSpace: mode });
      buf = '';
      mode = isWs;
    }
    buf += ch;
    if (ch === '\\' && i + 1 < line.length) { buf += line[i + 1]; i++; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
  }
  if (buf) out.push({ text: buf, isSpace: mode });
  return out;
}

function splitEdges(word) {
  const lead = (word.match(/^(?:\*{1,3}|["“”‘’])+/) || [''])[0];
  const rest = word.slice(lead.length);
  const trail = (rest.match(/(?:\*{1,3}|["“”‘’]|[.,;:!?…])+$/) || [''])[0];
  const core = rest.slice(0, rest.length - trail.length);
  return { lead, core, trail };
}

function elementSequenceOk(core, { allowDigits }) {
  const re = allowDigits
    ? /^(?:[A-Z][a-z]?\d*|\(|\)\d*|')+$/
    : /^-?(?:[A-Z][a-z]?|\(|\)|')+-?$/;
  if (!re.test(core)) return false;
  const symbols = core.match(/[A-Z][a-z]?/g) || [];
  if (symbols.length === 0) return false;
  return symbols.every((sym) => ELEMENTS.has(sym));
}

/** CH3COOH -> CH_3COOH ; C6H12O6 -> C_6H_{12}O_6 ; (CH3)2 -> (CH_3)_2 */
export function convertFlatChemFormula(core) {
  return core.replace(/([A-Z][a-z]?|\))(\d+)/g, (_, base, digits) =>
    digits.length > 1 ? `${base}_{${digits}}` : `${base}_${digits}`
  );
}

export function isFlatChemFormula(core) {
  if (!/\d/.test(core)) return false;
  if (!elementSequenceOk(core, { allowDigits: true })) return false;
  // Phải có ít nhất 1 chữ số đứng ngay sau ký hiệu nguyên tố / dấu ")"
  return /(?:[A-Z][a-z]?|\))\d/.test(core);
}

const OPERATOR_RE = /^(?:[+\-=<>×·→⇌⟶≥≤]|->|<->|<=>|>=|<=)$/;
const FORMULAISH_RE = /^[A-Za-z0-9_^{}()[\]'+\-=.,|*/<>!%]+$/;

function classifyCore(core) {
  if (!core) return 'punct';
  const bare = stripTextGroups(core);
  if (VIET_LETTER_RE.test(bare)) return 'word';
  if (/\\[a-zA-Z]+|\\%/.test(core)) return 'seed';
  if (/[_^]/.test(core) && FORMULAISH_RE.test(core) && /[A-Za-z0-9)]/.test(core)) return 'seed';
  if (isFlatChemFormula(core)) return 'chem';
  if (OPERATOR_RE.test(core)) return 'op';
  if (/^[-+]?\d+(?:[.,]\d+)*%?$/.test(core)) return 'num';
  if (/^[()[\]]+$/.test(core)) return 'paren';
  if (elementSequenceOk(core, { allowDigits: false })) return 'conn';
  if (/^\(?[a-zA-Z]'?\)?$/.test(core)) return 'conn';
  return 'word';
}

function countChar(s, ch) {
  let n = 0;
  for (const c of s) if (c === ch) n++;
  return n;
}

function finalizeRunContent(content) {
  let prefix = '';
  let suffix = '';
  let c = content;
  const pairs = [['(', ')'], ['[', ']']];
  for (const [open, close] of pairs) {
    while (c.startsWith(open) && countChar(c, open) > countChar(c, close)) {
      prefix += open;
      c = c.slice(1).trimStart();
    }
    while (c.endsWith(close) && countChar(c, close) > countChar(c, open)) {
      suffix = close + suffix;
      c = c.slice(0, -1).trimEnd();
    }
  }
  return { prefix, core: c, suffix };
}

function toLatexWord(core, cls) {
  let w = core;
  if (cls === 'chem') w = convertFlatChemFormula(w);
  w = w.replace(/<=>|⇌/g, '\\rightleftharpoons ').replace(/->|⟶/g, '\\rightarrow ');
  return w;
}

function autoDetectLine(line) {
  const tokens = [];
  if (!line) return tokens;
  const pieces = splitTopLevelWords(line);

  let textBuf = '';
  let run = []; // { core, cls, ws }

  const flushRun = () => {
    if (run.length === 0) return;
    // Bỏ toán tử ở hai đầu cụm
    while (run.length && (run[0].cls === 'op' || run[0].cls === 'punct')) {
      textBuf += run[0].raw + run[0].ws;
      run.shift();
    }
    const tail = [];
    while (run.length && (run[run.length - 1].cls === 'op' || run[run.length - 1].cls === 'punct')) {
      tail.unshift(run.pop());
    }
    const hasSeed = run.some((r) => r.cls === 'seed' || r.cls === 'chem');
    if (!hasSeed) {
      textBuf += run.map((r) => r.raw + r.ws).join('');
    } else {
      const latex = run.map((r, idx) => toLatexWord(r.core, r.cls) + (idx < run.length - 1 ? r.ws : '')).join('');
      const trailingWs = run[run.length - 1].ws;
      const { prefix, core, suffix } = finalizeRunContent(latex);
      const accepted = core && !looksLikeProse(core) && isValidLatex(core, false) ? core : null;
      if (accepted) {
        textBuf += prefix;
        if (textBuf) tokens.push({ type: 'text', content: textBuf });
        textBuf = '';
        tokens.push({ type: 'math', content: accepted, display: false });
        textBuf += suffix + trailingWs;
      } else {
        textBuf += run.map((r) => r.raw + r.ws).join('');
      }
    }
    textBuf += tail.map((r) => r.raw + r.ws).join('');
    run = [];
  };

  for (let p = 0; p < pieces.length; p++) {
    const piece = pieces[p];
    if (piece.isSpace) {
      if (run.length) run[run.length - 1].ws += piece.text;
      else textBuf += piece.text;
      continue;
    }
    const { lead, core, trail } = splitEdges(piece.text);
    const cls = classifyCore(core);

    if (cls === 'word') {
      flushRun();
      textBuf += piece.text;
      continue;
    }

    if (lead) {
      flushRun();
      textBuf += lead;
    }
    run.push({ raw: core, core, cls, ws: '' });
    if (trail) {
      flushRun();
      textBuf += trail;
    }
  }
  flushRun();
  if (textBuf) tokens.push({ type: 'text', content: textBuf });
  return tokens;
}

function autoDetectText(text) {
  const out = [];
  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    out.push(...autoDetectLine(line));
    if (idx < lines.length - 1) out.push({ type: 'text', content: '\n' });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Tiền xử lý
// ---------------------------------------------------------------------------

/**
 * Hàn gắn các dòng bị ngắt khi đang ở giữa cặp ngoặc nhọn LaTeX `{...}`
 * (vd: `\frac{\text{n}_{\n \text{thực tế}}}{...}`). Chỉ dựa vào ngoặc nhọn, không dựa vào `$`.
 */
export function mergeBrokenBraceLines(str) {
  if (!str || !str.includes('\n')) return str;
  const lines = str.split('\n');
  const merged = [];
  let buf = null;
  let depth = 0;
  let mergedCount = 0;

  const braceDelta = (l) => {
    let d = 0;
    for (let i = 0; i < l.length; i++) {
      if (l[i] === '\\') { i++; continue; }
      if (l[i] === '{') d++;
      else if (l[i] === '}') d--;
    }
    return d;
  };

  for (const line of lines) {
    if (buf === null) {
      const d = braceDelta(line);
      if (d > 0 && /\\[a-zA-Z]+|[_^]\{/.test(line)) {
        buf = line.trimEnd();
        depth = d;
        mergedCount = 0;
      } else {
        merged.push(line);
      }
      continue;
    }
    buf += ' ' + line.trim();
    depth += braceDelta(line);
    mergedCount++;
    if (depth <= 0 || mergedCount >= 6) {
      merged.push(buf);
      buf = null;
      depth = 0;
    }
  }
  if (buf !== null) merged.push(buf);
  return merged.join('\n');
}

// ---------------------------------------------------------------------------
// API chính
// ---------------------------------------------------------------------------

const PASSTHROUGH_BLOCK_RE = /(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\]|\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]|\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[GRAPH:[\s\S]*?\]|!\[[^\]\n]*\]\([^)\n]*\))/gi;

function tokenizeSegment(s) {
  const tokens = [];
  let text = '';
  const flushText = () => {
    if (text) {
      tokens.push(...autoDetectText(text));
      text = '';
    }
  };
  const pushMath = (content, display) => {
    flushText();
    tokens.push({ type: 'math', content, display });
  };

  const n = s.length;
  let i = 0;
  while (i < n) {
    const ch = s[i];

    if (ch === '\\' && s[i + 1] === '$') { text += '$'; i += 2; continue; }

    if (ch === '\\' && (s[i + 1] === '(' || s[i + 1] === '[')) {
      const display = s[i + 1] === '[';
      const close = display ? '\\]' : '\\)';
      const j = s.indexOf(close, i + 2);
      if (j >= 0) {
        const c = acceptMath(s.slice(i + 2, j), display);
        if (c) { pushMath(c, display); i = j + 2; continue; }
        text += s.slice(i + 2, j);
        i = j + 2;
        continue;
      }
      text += ch;
      i++;
      continue;
    }

    if (ch === '$') {
      if (s[i + 1] === '$') {
        const j = findClosingDoubleDollar(s, i + 2);
        if (j >= 0) {
          const c = acceptMath(s.slice(i + 2, j), true);
          if (c) { pushMath(c, true); i = j + 2; continue; }
        }
        i += 1; // `$` mồ côi -> bỏ 1 dấu, dấu còn lại được xét như `$` đơn
        continue;
      }

      const lineEnd = s.indexOf('\n', i);
      const limit = lineEnd < 0 ? n : lineEnd;
      const j = findClosingDollar(s, i + 1, limit);
      if (j >= 0) {
        const c = acceptMath(s.slice(i + 1, j), false);
        if (c) { pushMath(c, false); i = j + 1; continue; }
      } else if (lineEnd >= 0 && s[i + 1] && !/\s/.test(s[i + 1])) {
        // Cho phép inline math vắt qua tối đa 2 dòng (LLM ngắt dòng giữa công thức)
        const limit2 = nthNewlineIndex(s, i, 3);
        const j2 = findClosingDollar(s, i + 1, limit2);
        if (j2 >= 0 && !/\s/.test(s[j2 - 1])) {
          const c = acceptMath(s.slice(i + 1, j2), false);
          if (c) { pushMath(c, false); i = j2 + 1; continue; }
        }
      }
      i += 1; // `$` mồ côi -> loại bỏ, nội dung để auto-detect xử lý
      continue;
    }

    text += ch;
    i++;
  }
  flushText();
  return tokens;
}

function mergeTokens(tokens) {
  const out = [];
  for (const t of tokens) {
    if (!t.content && t.type === 'text') continue;
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text' && t.type === 'text' && !prev.passthrough && !t.passthrough) {
      prev.content += t.content;
      continue;
    }
    // 2 cụm math inline liền kề nhau (không có khoảng cách) -> gộp để tránh `$a$$b$`
    if (prev && prev.type === 'math' && t.type === 'math' && !prev.display && !t.display) {
      prev.content = `${prev.content} ${t.content}`;
      continue;
    }
    out.push({ ...t });
  }
  return out;
}

/**
 * Tách chuỗi đã tiền xử lý thành danh sách token text/math đã được kiểm định KaTeX.
 */
export function tokenizeMathText(input) {
  if (!input) return [];
  const str = mergeBrokenBraceLines(String(input));
  const segments = str.split(PASSTHROUGH_BLOCK_RE);
  const tokens = [];
  segments.forEach((seg) => {
    if (!seg) return;
    PASSTHROUGH_BLOCK_RE.lastIndex = 0;
    if (/^(?:\[MATH_GRAPH_3D\]|\[MATH_GRAPH\]|\[MATH_GEOMETRY_2D\]|\[VARIATION_TABLE\]|\[GRAPH:|!\[)/i.test(seg)) {
      tokens.push({ type: 'text', content: seg, passthrough: true });
    } else {
      tokens.push(...tokenizeSegment(seg));
    }
  });
  return mergeTokens(tokens);
}

/** Ghép token lại thành chuỗi. mode = 'dollar' ($..$ / $$..$$) hoặc 'paren' (\(..\) / \[..\]) */
export function serializeMathTokens(tokens, mode = 'paren') {
  return tokens
    .map((t) => {
      if (t.type !== 'math') return t.content;
      if (mode === 'dollar') return t.display ? `$$${t.content}$$` : `$${t.content}$`;
      return t.display ? `\\[${t.content}\\]` : `\\(${t.content}\\)`;
    })
    .join('');
}

