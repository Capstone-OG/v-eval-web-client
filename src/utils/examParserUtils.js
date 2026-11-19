/**
 * Exam Parser Utilities
 * Ported & upgraded from V-Eval AI Engine (view-exam.html) to pure modular ES utilities.
 * Handles:
 *  - OCR LaTeX & STEM unit recovery (sanitizeExamMathAndLatex)
 *  - 2-tier Markdown Table parsing with rowspan/colspan headers
 *  - Vietnamese Bar/Pie statistical chart extraction
 *  - Unified normalization between AI Engine ParsedExamDto & Content Service MockExamDetailDto
 *  - ImportMockExamCommand payload construction
 */

export const SUBJECT_OPTIONS = [
  { code: 'MATH', label: 'Toán học' },
  { code: 'VIET', label: 'Tiếng Việt / Ngữ văn' },
  { code: 'ENGL', label: 'Tiếng Anh' },
  { code: 'PHYS', label: 'Vật lý' },
  { code: 'CHEM', label: 'Hóa học' },
  { code: 'BIOL', label: 'Sinh học' },
  { code: 'HIST', label: 'Lịch sử' },
  { code: 'GEO', label: 'Địa lý' },
  { code: 'LOGIC', label: 'Tư duy Logic' },
  { code: 'GENERAL', label: 'Tổng hợp ĐGNL' }
];

export const EXAM_CATEGORY_OPTIONS = [
  { value: 'FULL_MOCK', label: 'Đề thi thử đầy đủ (Full Mock)' },
  { value: 'SUBJECT_PRACTICE', label: 'Đề luyện theo môn' },
  { value: 'TOPICAL_PRACTICE', label: 'Đề luyện chuyên đề' }
];

export const BLOOM_LEVELS = [
  { level: 1, label: 'L1 · Nhận biết', short: 'L1', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  { level: 2, label: 'L2 · Thông hiểu', short: 'L2', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { level: 3, label: 'L3 · Vận dụng', short: 'L3', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { level: 4, label: 'L4 · Phân tích', short: 'L4', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { level: 5, label: 'L5 · Đánh giá', short: 'L5', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { level: 6, label: 'L6 · Sáng tạo', short: 'L6', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' }
];

export const KATEX_QUICK_SNIPPETS = [
  { label: 'Phân số', code: '$\\frac{a}{b}$' },
  { label: 'Lũy thừa', code: '$x^2$' },
  { label: 'Căn bậc 2', code: '$\\sqrt{x}$' },
  { label: 'Tích phân', code: '$\\int_{a}^{b} f(x)\\,dx$' },
  { label: 'Tổng Sigma', code: '$\\sum_{i=1}^{n} x_i$' },
  { label: 'Delta', code: '$\\Delta$' },
  { label: 'Suy ra', code: '$\\Rightarrow$' },
  { label: 'Tương đương', code: '$\\Leftrightarrow$' },
  { label: 'Vecto', code: '$\\vec{a}$' }
];

let localIdSeq = 0;
export function nextLocalId(prefix = 'item') {
  localIdSeq += 1;
  return `${prefix}_${Date.now()}_${localIdSeq}`;
}

export function formatSubjectLabel(code) {
  if (!code) return 'Tổng hợp';
  const upper = String(code).trim().toUpperCase();
  const found = SUBJECT_OPTIONS.find((s) => s.code === upper);
  if (found) return found.label;
  if (upper === 'BIO') return 'Sinh học';
  if (upper === 'LIT') return 'Ngữ văn';
  if (upper === 'ENG') return 'Tiếng Anh';
  return code;
}

export function formatExamDate(dateStr) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateStr);
  }
}

export function formatTimerSeconds(totalSeconds = 0) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safe / 60).toString().padStart(2, '0');
  const secs = (safe % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function normalizeOptionLetter(raw) {
  if (raw === null || raw === undefined) return 'A';
  if (typeof raw === 'number') {
    if (raw >= 0 && raw <= 3) return String.fromCharCode(65 + raw);
    if (raw >= 1 && raw <= 4) return String.fromCharCode(64 + raw);
    return 'A';
  }
  const str = String(raw).trim().toUpperCase();
  if (!str) return 'A';
  const stripped = str.replace(/^[ \t\r\n.:();,[\]'"\-_]+|[ \t\r\n.:();,[\]'"\-_]+$/g, '');
  if (stripped.length === 1 && stripped >= 'A' && stripped <= 'D') return stripped;
  const m = str.match(/(?:ĐÁP\s*ÁN|PHƯƠNG\s*ÁN|CHỌN|OPTION|ANSWER)\s*[:\-.]?\s*([A-D])\b/i);
  if (m?.[1]) return m[1].toUpperCase();
  for (const ch of str) {
    if (ch >= 'A' && ch <= 'D') return ch;
  }
  return 'A';
}

/**
 * Resolve relative extracted_images / uploads URLs against API Gateway base URL.
 */
export function resolveExamMediaUrl(url, baseUrl = '') {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
  if (trimmed.startsWith('/')) {
    return cleanBase ? `${cleanBase}${trimmed}` : trimmed;
  }
  return cleanBase ? `${cleanBase}/uploads/images/${trimmed}` : `/uploads/images/${trimmed}`;
}

/**
 * Complete 6-stage OCR Math & LaTeX sanitizer ported from view-exam.html
 */
export function sanitizeExamMathAndLatex(text) {
  if (!text) return '';
  let s = String(text);

  // 1. Phục hồi các ký tự điều khiển ASCII bị nuốt do JSON decode (\f -> \frac, \t -> \times, \b -> \bar)
  /* eslint-disable no-control-regex */
  s = s.replace(/\x0crac/g, '\\frac');
  s = s.replace(/\x09imes/g, '\\times');
  s = s.replace(/\x09ext/g, '\\text');
  s = s.replace(/\x08ar/g, '\\bar');
  s = s.replace(/\x08eta/g, '\\beta');
  s = s.replace(/\x09heta/g, '\\theta');
  s = s.replace(/\x09au/g, '\\tau');
  /* eslint-enable no-control-regex */

  // 2. Sửa lỗi OCR nhìn nhầm ký hiệu biến thiên Delta (∆) thành ar{ ext{A}} hoặc \bar{\text{A}}
  s = s.replace(/ar\{\s*ext\{A\}\}/g, '\\Delta');
  s = s.replace(/\\bar\{\\text\{A\}\}/g, '\\Delta');
  s = s.replace(/\\bar\{A\}/g, '\\Delta');
  s = s.replace(/\[\s*ext\{([^}]+)\}\]/g, '[\\text{$1}]');
  s = s.replace(/∆/g, '\\Delta');

  // 3. Chuẩn hóa công thức tốc độ phản ứng
  s = s.replace(
    /R\s*=\s*-?\\Delta\s*\[\\text\{([^}]+)\}\]\s*\/\s*\\Delta\s*([a-zA-Z]+)/g,
    (_, chem, timeVar) => `$R = -\\frac{\\Delta[\\text{${chem}}]}{\\Delta ${timeVar}}$`
  );
  s = s.replace(
    /R\s*=\s*-?\\Delta\s*\[([^\]]+)\]\s*\/\s*\\Delta\s*([a-zA-Z]+)/g,
    (_, chem, timeVar) => `$R = -\\frac{\\Delta[\\text{${chem}}]}{\\Delta ${timeVar}}$`
  );

  // Bọc (\Delta[\text{Acetone}]) và (\Delta t)
  s = s.replace(
    /\(\\Delta\s*\[\\text\{([^}]+)\}\]\)/g,
    (_, chem) => `($\\Delta[\\text{${chem}}]$)`
  );
  s = s.replace(
    /\(\\Delta\s*\[([^\]]+)\]\)/g,
    (_, chem) => `($\\Delta[\\text{${chem}}]$)`
  );
  s = s.replace(/\(\\Delta\s*([a-zA-Z]+)\)/g, (_, v) => `($\\Delta ${v}$)`);

  // 4. Chuẩn hóa công thức hiệu suất truyền tải điện
  s = s.replace(
    /(?:^|\n|\s)(H\s*=\s*(?:\\frac|rac)?\{?P_?n?\s*-\s*P_?\{?hp\}?\}?\{?P_?n?\}?(?:\s*(?:\\times|imes)?\s*100\\?%)?)(?=\s|\.|\n|$)/g,
    () => ` $$H = \\frac{P_n - P_{hp}}{P_n} \\times 100\\%$$ `
  );

  // 5. Đơn vị hóa học/vật lý có số mũ âm như 2,33.10-3 mol.l-1.phút-1
  s = s.replace(
    /(\d+[.,]\d+)\.10-(\d+)\s*mol\.l-1\.phút-1/g,
    (_, num, exp) => `$${num} \\cdot 10^{-${exp}}\\text{ mol}\\cdot\\text{l}^{-1}\\cdot\\text{phút}^{-1}$`
  );
  s = s.replace(
    /(\d+[.,]\d+)\s*mol\.l-1\.phút-1/g,
    (_, num) => `$${num}\\text{ mol}\\cdot\\text{l}^{-1}\\cdot\\text{phút}^{-1}$`
  );

  // 6. Xử lý các đại lượng ngoài vùng $: P_{hp}, P_n, k^2
  const parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      parts[i] = parts[i]
        .replace(/(?<![a-zA-Z0-9_$])(P_\{hp\}|P_hp)(?![a-zA-Z0-9_$])/g, () => '$P_{hp}$')
        .replace(/(?<![a-zA-Z0-9_$])(P_\{n\}|P_n)(?![a-zA-Z0-9_$])/g, () => '$P_n$')
        .replace(/(?<![a-zA-Z0-9_$])(k\^2)(?![a-zA-Z0-9_$])/g, () => '$k^2$');
    }
  }
  s = parts.join('');

  return s;
}

export function isMarkdownTableLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  return trimmed.includes('|') && (trimmed.split('|').length >= 3 || /^[|\s\-:]+$/.test(trimmed));
}

/**
 * Parse a group of Markdown table rows into structured 1-tier or 2-tier (rowspan/colspan) table data.
 * Exact algorithm from view-exam.html convertMarkdownTableToHtml, returning safe React data structures.
 */
export function parseTwoTierMarkdownTable(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return null;

  let sepIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (/^[|\s\-:]+$/.test(rows[i]) && rows[i].includes('-')) {
      sepIdx = i;
      break;
    }
  }

  const parseRowCells = (rowStr) => {
    const cells = rowStr.split('|').map((c) => c.trim());
    if (cells.length > 0 && cells[0] === '') cells.shift();
    if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    return cells;
  };

  const headerRows = [];
  const bodyRows = [];

  if (sepIdx > 0) {
    for (let i = 0; i < sepIdx; i++) headerRows.push(parseRowCells(rows[i]));
    for (let i = sepIdx + 1; i < rows.length; i++) bodyRows.push(parseRowCells(rows[i]));
  } else {
    headerRows.push(parseRowCells(rows[0]));
    for (let i = 1; i < rows.length; i++) bodyRows.push(parseRowCells(rows[i]));
  }

  let hasTwoTierGroups = false;
  const groups = [];

  if (headerRows.length === 1) {
    const headerCells = headerRows[0];
    for (let i = 0; i < headerCells.length; i++) {
      const cell = headerCells[i];
      const match = cell.match(/^(.*?):\s*(.*)$/);
      if (match && match[1].trim().length >= 3 && match[2].trim().length > 0) {
        const mainTitle = match[1].trim();
        const firstSub = match[2].trim();
        const subCols = [firstSub];
        let j = i + 1;
        while (j < headerCells.length) {
          const nextCell = headerCells[j];
          const isShortOrNum = /^[\d.,\s]+$/.test(nextCell) || nextCell.length <= 4;
          if (isShortOrNum) {
            subCols.push(nextCell);
            j++;
          } else {
            break;
          }
        }
        if (subCols.length >= 2) {
          hasTwoTierGroups = true;
          groups.push({
            type: 'group',
            mainTitle,
            subCols,
            colspan: subCols.length
          });
          i = j - 1;
          continue;
        }
      }
      groups.push({ type: 'single', title: cell });
    }
  }

  return {
    headerRows,
    hasTwoTierGroups,
    groups,
    bodyRows
  };
}

/**
 * Safely parse an HTML <table>...</table> string (supporting rowspan/colspan) into structured React rows.
 */
export function parseHtmlExamTable(htmlTableStr) {
  if (!htmlTableStr || typeof htmlTableStr !== 'string') return null;
  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(htmlTableStr)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [];
    const cellRegex = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const tag = cellMatch[1].toLowerCase();
      const attrs = cellMatch[2] || '';
      const rawContent = (cellMatch[3] || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p\b[^>]*>/gi, '')
        .trim();
      const rsMatch = attrs.match(/rowspan\s*=\s*["']?(\d+)["']?/i);
      const csMatch = attrs.match(/colspan\s*=\s*["']?(\d+)["']?/i);
      cells.push({
        tag,
        rowSpan: rsMatch ? Math.max(1, Number(rsMatch[1])) : 1,
        colSpan: csMatch ? Math.max(1, Number(csMatch[1])) : 1,
        content: rawContent
      });
    }
    if (cells.length > 0) {
      rows.push({
        isHeader: cells.every((c) => c.tag === 'th'),
        cells
      });
    }
  }
  return rows.length > 0 ? { rows } : null;
}

/**
 * Split raw exam text into ordered segments: plain/math text, Markdown tables, and HTML tables.
 * Preserves [VARIATION_TABLE], [MATH_GRAPH], [MATH_GRAPH_3D], and [DATA_CHART] blocks intact for MathText.
 */
export function splitExamContentBlocks(text) {
  if (!text) return [];
  const raw = String(text);

  // First separate any raw HTML <table>...</table> segments cleanly
  const htmlTableSegments = raw.split(/(<table\b[\s\S]*?<\/table>)/gi);
  const blocks = [];

  for (const segment of htmlTableSegments) {
    if (!segment) continue;
    if (/^<table\b[\s\S]*<\/table>$/i.test(segment.trim())) {
      const htmlTable = parseHtmlExamTable(segment);
      if (htmlTable) {
        blocks.push({ type: 'html-table', table: htmlTable });
        continue;
      }
    }

    const lines = segment.split(/\r?\n/);
    let textBuffer = [];
    let tableBuffer = [];
    let inProtectedBlock = false;

    const flushText = () => {
      if (textBuffer.length > 0) {
        const joined = textBuffer.join('\n');
        if (joined.trim().length > 0) {
          blocks.push({ type: 'text', content: joined });
        }
        textBuffer = [];
      }
    };

    const flushTable = () => {
      if (tableBuffer.length >= 2) {
        const parsed = parseTwoTierMarkdownTable(tableBuffer);
        if (parsed && (parsed.bodyRows.length > 0 || parsed.headerRows.length > 0)) {
          blocks.push({ type: 'table', table: parsed });
        } else {
          textBuffer.push(...tableBuffer);
        }
      } else if (tableBuffer.length > 0) {
        textBuffer.push(...tableBuffer);
      }
      tableBuffer = [];
    };

    for (const line of lines) {
      const trimmedUpper = line.trim().toUpperCase();
      if (/^\[(VARIATION_TABLE|MATH_GRAPH|MATH_GRAPH_3D|MATH_GEOMETRY_2D|DATA_CHART)\]$/.test(trimmedUpper)) {
        if (tableBuffer.length > 0) flushTable();
        inProtectedBlock = true;
        textBuffer.push(line);
        continue;
      }
      if (/^\[\/(VARIATION_TABLE|MATH_GRAPH|MATH_GRAPH_3D|MATH_GEOMETRY_2D|DATA_CHART)\]$/.test(trimmedUpper)) {
        inProtectedBlock = false;
        textBuffer.push(line);
        continue;
      }

      if (!inProtectedBlock && isMarkdownTableLine(line)) {
        if (tableBuffer.length === 0) flushText();
        tableBuffer.push(line.trim());
      } else {
        if (tableBuffer.length > 0) flushTable();
        textBuffer.push(line);
      }
    }
    flushTable();
    flushText();
  }

  return blocks;
}

/**
 * Parse percentage chart data string e.g. "Nông nghiệp (25,5%), Công nghiệp (42%), Dịch vụ (32,5%)"
 */
export function parseChartDataString(dataStr) {
  if (!dataStr) return [];
  const normalized = String(dataStr).replace(/(\d+),(\d+)/g, '$1.$2');
  const parts = normalized.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const items = [];

  parts.forEach((part) => {
    const m = part.match(/^(.*?)\s*(?:\(|:|=)?\s*(\d+(?:\.\d+)?)\s*%/);
    if (m) {
      const label = m[1].trim().replace(/^[([\s]+|[)\]\s]+$/g, '');
      const value = parseFloat(m[2]);
      if (label && !Number.isNaN(value)) {
        items.push({ label, value });
      }
    }
  });
  return items;
}

/**
 * Auto-detect Bar Chart & Pie Chart descriptions from Vietnamese exam text (view-exam.html lines 1261-1444).
 */
export function extractInlineChartsFromText(text) {
  if (!text) return [];
  const str = String(text);
  const charts = [];

  const barMatch = str.match(/(?:\[Hình vẽ\]:?\s*)?(Biểu đồ cột[^\n:]*?):\s*([^\n]+)/i);
  if (barMatch) {
    const title = barMatch[1].trim();
    const cleanDataStr = barMatch[2].trim().replace(/\)+$/, '');
    const items = parseChartDataString(cleanDataStr);
    if (items.length >= 2) {
      charts.push({ type: 'bar', title, items });
    }
  }

  const pieMatch = str.match(/(?:\[Hình vẽ\]:?\s*)?(Biểu đồ (?:hình tròn|tròn)[^\n:]*?):\s*([^\n]+)/i);
  if (pieMatch) {
    const title = pieMatch[1].trim();
    const cleanDataStr = pieMatch[2].trim().replace(/\)+$/, '');
    const items = parseChartDataString(cleanDataStr);
    if (items.length >= 2) {
      charts.push({ type: 'pie', title, items });
    }
  }

  return charts;
}

/**
 * Detect whether a passage or question already renders an interactive chart or table,
 * matching view-exam.html logic to avoid duplicating raw PDF crop screenshot.
 */
export function hasChartOrTableInContent(content, isPassage = false) {
  if (!content) return false;
  const raw = String(content);
  const lower = raw.toLowerCase();
  if (raw.includes('| --- |') || raw.includes('<table') || /\[DATA_CHART\]/i.test(raw)) {
    return true;
  }
  if (isPassage) {
    return (
      lower.includes('biểu đồ cột') ||
      lower.includes('biểu đồ tròn') ||
      lower.includes('biểu đồ hình tròn') ||
      lower.includes('bảng số liệu')
    );
  }
  return lower.includes('biểu đồ') || lower.includes('bảng số liệu');
}

/**
 * Extract leading markdown image `![alt](url)` inserted by ImportMockExamCommandHandler when loading back from DB.
 */
export function extractLeadingMarkdownImage(content) {
  if (!content || typeof content !== 'string') {
    return { imageUrl: null, cleanContent: content || '' };
  }
  const m = content.match(/^\s*!\[[^\]]*\]\(([^)]+)\)\s*(?:\r?\n){1,2}([\s\S]*)$/);
  if (m) {
    return {
      imageUrl: m[1].trim(),
      cleanContent: m[2]
    };
  }
  return { imageUrl: null, cleanContent: content };
}

function normalizeQuestionItem(q, fallbackNum = 1) {
  const rawContent = (q?.content ?? q?.contentLatex ?? q?.stem ?? '').toString();
  const extracted = extractLeadingMarkdownImage(rawContent);
  const explicitImg = q?.image_url ?? q?.imageUrl ?? null;

  let optionsObj = { A: '', B: '', C: '', D: '' };
  if (Array.isArray(q?.options)) {
    optionsObj = {
      A: String(q.options[0] || '').replace(/^A\.\s*/i, ''),
      B: String(q.options[1] || '').replace(/^B\.\s*/i, ''),
      C: String(q.options[2] || '').replace(/^C\.\s*/i, ''),
      D: String(q.options[3] || '').replace(/^D\.\s*/i, '')
    };
  } else if (q?.options && typeof q.options === 'object') {
    optionsObj = {
      A: String(q.options.A ?? q.options.a ?? ''),
      B: String(q.options.B ?? q.options.b ?? ''),
      C: String(q.options.C ?? q.options.c ?? ''),
      D: String(q.options.D ?? q.options.d ?? '')
    };
  } else if (q?.optionA !== undefined) {
    optionsObj = {
      A: String(q.optionA || ''),
      B: String(q.optionB || ''),
      C: String(q.optionC || ''),
      D: String(q.optionD || '')
    };
  }

  const incomingSkillId = q?.curriculumNode?.skillId ?? q?.skill_id ?? q?.skillId ?? null;
  const incomingChapterName = q?.curriculumNode?.chapterName ?? q?.chapter_name ?? q?.chapterName ?? '';
  const incomingLessonName = q?.curriculumNode?.lessonName ?? q?.lesson_name ?? q?.lessonName ?? '';
  const incomingPatternName = q?.curriculumNode?.patternName ?? q?.pattern_name ?? q?.patternName ?? '';
  const incomingDomainName = q?.curriculumNode?.domainName ?? q?.domain_name ?? q?.domainName ?? '';

  const hasCurriculumLineage = Boolean(
    incomingSkillId && (incomingChapterName || incomingLessonName || incomingDomainName)
  );

  return {
    localId: q?.localId || nextLocalId('q'),
    questionId: q?.question_id ?? q?.questionId ?? null,
    questionNumber: Number(q?.question_number ?? q?.questionNumber ?? fallbackNum) || fallbackNum,
    pageNumber: Number(q?.page_number ?? q?.pageNumber ?? 1) || 1,
    content: explicitImg ? rawContent : extracted.cleanContent,
    options: optionsObj,
    correctOption: normalizeOptionLetter(q?.correct_option ?? q?.correctOption ?? q?.correctIndex ?? 'A'),
    explanation: (q?.explanation ?? q?.solution ?? '').toString(),
    difficultyLevel: Number(q?.difficulty_level ?? q?.difficultyLevel ?? q?.bloomLevel ?? 2) || 2,
    suggestedSkillName: (q?.suggested_skill_name ?? q?.suggestedSkillName ?? 'Trắc nghiệm tổng hợp').toString(),
    imageUrl: explicitImg || extracted.imageUrl || null,
    imageUserAttached: Boolean(q?.imageUserAttached),
    images: Array.isArray(q?.images) ? q.images.filter(Boolean) : [],
    curriculumNode: hasCurriculumLineage
      ? {
          skillId: incomingSkillId,
          domainId: q?.curriculumNode?.domainId ?? q?.domain_id ?? q?.domainId ?? null,
          domainName: incomingDomainName,
          chapterId: q?.curriculumNode?.chapterId ?? q?.chapter_id ?? q?.chapterId ?? null,
          chapterName: incomingChapterName,
          lessonId: q?.curriculumNode?.lessonId ?? q?.lesson_id ?? q?.lessonId ?? null,
          lessonName: incomingLessonName,
          patternId: q?.curriculumNode?.patternId ?? q?.pattern_id ?? q?.patternId ?? incomingSkillId,
          patternName: incomingPatternName || (q?.suggested_skill_name ?? q?.suggestedSkillName ?? ''),
          confidence: q?.curriculumNode?.confidence ?? 1.0,
          matchSource: q?.curriculumNode?.matchSource ?? 'database',
          reason: q?.curriculumNode?.reason ?? 'Đã liên kết trên cây Khung chương trình'
        }
      : null
  };
}

/**
 * Normalize either AI Engine ParsedExamDto or Content Service MockExamDetailDto into unified React state.
 */
export function normalizeExamData(raw, { source = 'ai', isPublished = false } = {}) {
  const safe = raw || {};
  const rawTitle = safe.title || safe.file_name || safe.fileName || 'Đề thi mới';
  const cleanTitle = String(rawTitle).replace(/\.pdf$/i, '').trim() || 'Đề thi mới';

  const passages = (safe.passages || []).map((p, pIdx) => {
    const questions = (p.questions || []).map((q, qIdx) =>
      normalizeQuestionItem(q, (p.start_question ?? p.startQuestion ?? 1) + qIdx)
    );
    const nums = questions.map((q) => q.questionNumber);
    const startQ = Number(p.start_question ?? p.startQuestion) || (nums.length ? Math.min(...nums) : pIdx + 1);
    const endQ = Number(p.end_question ?? p.endQuestion) || (nums.length ? Math.max(...nums) : startQ);

    return {
      localId: p.localId || nextLocalId('p'),
      passageId: p.passage_id ?? p.passageId ?? null,
      startQuestion: startQ,
      endQuestion: endQ,
      content: (p.content ?? '').toString(),
      imageUrl: p.image_url ?? p.imageUrl ?? null,
      imageUserAttached: Boolean(p.imageUserAttached),
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
      questions
    };
  });

  const singleQuestions = (safe.single_questions || safe.singleQuestions || []).map((q, idx) =>
    normalizeQuestionItem(q, idx + 1)
  );

  return {
    examId: safe.exam_id ?? safe.examId ?? null,
    source,
    isPublished: Boolean(safe.is_published ?? safe.isPublished ?? isPublished),
    title: cleanTitle,
    fileName: safe.file_name ?? safe.fileName ?? `${cleanTitle}.pdf`,
    format: safe.format || 'V-ACT Exam',
    subjectCode: (safe.subject_code ?? safe.subjectCode ?? 'GENERAL').toUpperCase(),
    examCategory: safe.exam_category ?? safe.examCategory ?? 'FULL_MOCK',
    durationMinutes: Number(safe.duration_minutes ?? safe.durationMinutes ?? 150) || 150,
    difficultyLevel: Number(safe.difficulty_level ?? safe.difficultyLevel ?? 2) || 2,
    totalPages: Number(safe.total_pages ?? safe.totalPages ?? 0) || 0,
    pdfUrl: safe.pdf_url ?? safe.pdfUrl ?? '',
    createdAt: safe.created_at ?? safe.createdAt ?? null,
    passages,
    singleQuestions
  };
}

/**
 * Create a clean blank exam for manual authoring.
 */
export function createBlankExam() {
  return normalizeExamData(
    {
      title: 'Đề thi trắc nghiệm mới',
      subjectCode: 'MATH',
      examCategory: 'SUBJECT_PRACTICE',
      durationMinutes: 90,
      difficultyLevel: 2,
      passages: [],
      singleQuestions: [
        {
          questionNumber: 1,
          pageNumber: 1,
          content: 'Cho hàm số $y = x^3 - 3x + 1$. Tìm giá trị cực đại của hàm số đã cho.',
          options: { A: '$3$', B: '$-1$', C: '$1$', D: '$2$' },
          correctOption: 'A',
          explanation: "Ta có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = -1$, hàm số đạt cực đại $y_{CĐ} = 3$.",
          difficultyLevel: 2,
          suggestedSkillName: 'Cực trị hàm số'
        }
      ]
    },
    { source: 'manual', isPublished: false }
  );
}

/**
 * Build ImportMockExamCommand payload matching Content Service backend DTO 100%.
 */
export function buildImportExamPayload(exam) {
  if (!exam) return null;
  const cleanTitle = (exam.title || exam.fileName || 'Đề thi trắc nghiệm')
    .replace(/\.[^/.]+$/, '')
    .trim();

  const mapQuestion = (q, defaultSkill) => {
    const node = q.curriculumNode;
    const isGuid = (v) =>
      typeof v === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim());
    return {
      questionNumber: Number(q.questionNumber) || 1,
      pageNumber: Number(q.pageNumber) || 1,
      content: q.content || '',
      options: {
        A: q.options?.A || '',
        B: q.options?.B || '',
        C: q.options?.C || '',
        D: q.options?.D || ''
      },
      correctOption: normalizeOptionLetter(q.correctOption),
      explanation: q.explanation || '',
      difficultyLevel: Number(q.difficultyLevel) || 2,
      suggestedSkillName: node?.patternName || q.suggestedSkillName || defaultSkill,
      imageUrl: q.imageUrl || null,
      skillId: isGuid(node?.skillId) ? node.skillId.trim() : null,
      domainName: node?.domainName || null,
      chapterName: node?.chapterName || null,
      lessonName: node?.lessonName || null
    };
  };

  return {
    title: cleanTitle || 'Đề thi trắc nghiệm',
    durationMinutes: Number(exam.durationMinutes) || 150,
    examCategory: exam.examCategory || 'FULL_MOCK',
    subjectCode: exam.subjectCode || 'MATH',
    difficultyLevel: Number(exam.difficultyLevel) || 2,
    passages: (exam.passages || []).map((p) => ({
      startQuestion: Number(p.startQuestion) || 1,
      endQuestion: Number(p.endQuestion) || Number(p.startQuestion) || 1,
      content: p.content || '',
      imageUrl: p.imageUrl || null,
      questions: (p.questions || []).map((q) => mapQuestion(q, 'Đọc hiểu'))
    })),
    singleQuestions: (exam.singleQuestions || []).map((q) => mapQuestion(q, 'Trắc nghiệm tổng hợp'))
  };
}

/**
 * Combine passages and single questions in strict question-number order + compute comprehensive stats.
 */
export function buildOrderedExamView(exam) {
  if (!exam) {
    return {
      items: [],
      allQuestions: [],
      stats: {
        totalQuestions: 0,
        totalPassages: 0,
        totalSingles: 0,
        maxQuestionNumber: 0,
        withImages: 0,
        withExplanations: 0
      },
      questionMap: new Map(),
      passageQuestionNumbers: new Set()
    };
  }

  const items = [];
  const allQuestions = [];
  const questionMap = new Map();
  const passageQuestionNumbers = new Set();

  (exam.passages || []).forEach((p) => {
    const sortedQs = [...(p.questions || [])].sort((a, b) => a.questionNumber - b.questionNumber);
    const order = p.startQuestion || (sortedQs[0] ? sortedQs[0].questionNumber : 0);
    items.push({ type: 'passage', order, data: { ...p, questions: sortedQs } });
    sortedQs.forEach((q) => {
      allQuestions.push({ ...q, parentPassageLocalId: p.localId });
      questionMap.set(q.questionNumber, { ...q, parentPassageLocalId: p.localId });
      passageQuestionNumbers.add(q.questionNumber);
    });
  });

  (exam.singleQuestions || []).forEach((q) => {
    items.push({ type: 'question', order: q.questionNumber, data: q });
    allQuestions.push({ ...q, parentPassageLocalId: null });
    questionMap.set(q.questionNumber, { ...q, parentPassageLocalId: null });
  });

  items.sort((a, b) => a.order - b.order);
  allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);

  const maxQuestionNumber = allQuestions.reduce((max, q) => Math.max(max, q.questionNumber || 0), 0);
  const withImages =
    allQuestions.filter((q) => Boolean(q.imageUrl) || (q.images && q.images.length > 0)).length +
    (exam.passages || []).filter((p) => Boolean(p.imageUrl) || (p.images && p.images.length > 0)).length;
  const withExplanations = allQuestions.filter((q) => Boolean(q.explanation && q.explanation.trim())).length;

  return {
    items,
    allQuestions,
    stats: {
      totalQuestions: allQuestions.length,
      totalPassages: (exam.passages || []).length,
      totalSingles: (exam.singleQuestions || []).length,
      maxQuestionNumber,
      withImages,
      withExplanations
    },
    questionMap,
    passageQuestionNumbers
  };
}
