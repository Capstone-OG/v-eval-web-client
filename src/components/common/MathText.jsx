import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { AlertTriangle, Sparkles, BookOpen, FileText } from 'lucide-react';
import VariationTable, { parseVariationTableString } from './VariationTable';
import MathGraphView, { parseGraphTag } from './MathGraphView';

/**
 * Safe KaTeX HTML generator with fallback
 */
export function renderKatexHtml(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml'
    });
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

  // Recover LaTeX commands that may have lost their backslash from past tab-replacement or JSON parsing
  str = str.replace(/(?<!\\)\bext\{/g, '\\text{');
  str = str.replace(/(?<!\\)\bimes\b/g, '\\times');

  // Strip stray 'text' or '\text' immediately glued to chemical formulas or ions (e.g. textSO_4^{2-}, \textSO_4^{2-} -> SO_4^{2-})
  str = str.replace(/(?:\\text|\btext)(?=[A-Z])/g, '');
  str = str.replace(/(?:\\text|\btext)\{([A-Z][a-zA-Z0-9_+\-^]*)\}/g, '$1');

  // Fix orphaned trailing :** (e.g. "Ví dụ:**" or "- Ví dụ:**" where leading ** got stripped)
  str = str.replace(/(^|[\n•\-*]\s*)([A-ZÀ-Ỹa-zà-ỹ0-9\s&]{2,30}):\*\*/g, '$1**$2:**');

  // 2. Tokenize by existing explicit math delimiters
  const mathDelimiterRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
  const parts = str.split(mathDelimiterRegex);

  const processed = parts.map((part) => {
    if (!part) return '';
    // If it's already an explicit math delimiter block, preserve as-is
    if (
      (part.startsWith('$$') && part.endsWith('$$')) ||
      (part.startsWith('$') && part.endsWith('$')) ||
      (part.startsWith('\\[') && part.endsWith('\\]')) ||
      (part.startsWith('\\(') && part.endsWith('\\)'))
    ) {
      return part;
    }

    let textChunk = part;

    // Wrap LaTeX commands with curly braces or sub/superscripts e.g. \frac{a}{b}, \sqrt{x}, \lim_{x \to 0}, \Delta
    textChunk = textChunk.replace(
      /(\\(?:text|mathrm|mathbf|Delta|frac|sqrt|lim|int|sum|prod|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|omega|Omega|left|right|partial|infty|vec|le|ge|neq|approx|equiv|pm|times|div|cdot|in|notin|subset|cap|cup|forall|exists|mathbb)\b(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|_[a-zA-Z0-9{}]*(?:\{[^{}]*\})?|\^[a-zA-Z0-9{}]*(?:\{[^{}]*\})?)*)/g,
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

  // Split by explicit math delimiters
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
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
              <strong key={chunkKey} className="font-bold italic text-slate-900">
                {chunk.slice(3, -3)}
              </strong>
            );
          }

          // Markdown bold **text**
          if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length >= 4) {
            return (
              <strong key={chunkKey} className="font-bold text-slate-900">
                {chunk.slice(2, -2)}
              </strong>
            );
          }

          // Markdown italic *text*
          if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length >= 2) {
            return (
              <em key={chunkKey} className="italic text-slate-800">
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
function renderStructuredContent(raw) {
  // First split by special block tags:
  // 1. [VARIATION_TABLE]...[/VARIATION_TABLE]
  // 2. [GRAPH:...]
  // 3. Display math $$...$$ or \[...\]
  const blockRegex = /(\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]|\[GRAPH:[\s\S]*?\]|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/gi;
  const blocks = raw.split(blockRegex);

  return blocks.map((block, bIdx) => {
    if (!block) return null;

    // Variation Table Block [VARIATION_TABLE]...[/VARIATION_TABLE]
    if (block.toUpperCase().startsWith('[VARIATION_TABLE]') && block.toUpperCase().endsWith('[/VARIATION_TABLE]')) {
      const content = block.slice(17, -18).trim();
      const parsed = parseVariationTableString(content);
      return <VariationTable key={`vt-${bIdx}`} data={parsed} />;
    }

    // Math Graph Block [GRAPH: ...]
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

    // Text block: process line by line
    const lines = block.split('\n');

    return (
      <React.Fragment key={`b-${bIdx}`}>
        {lines.map((rawLine, lIdx) => {
          const lineKey = `b-${bIdx}-l-${lIdx}`;
          // Strip trailing backslashes e.g. text\ or text\\ at line endings
          const line = rawLine.replace(/\\+\s*$/, '').trimEnd();
          const trimmed = line.trim();

          // Empty line -> spacing
          if (!trimmed) {
            return <div key={lineKey} className="h-1.5" />;
          }

          // Callout Warning e.g. "### ⚠️ Các bẫy đề thi:" or "⚠️ ..."
          if (line.includes('### ⚠️') || line.startsWith('⚠️')) {
            const cleanHeading = line.replace(/^###\s*/, '').replace(/^⚠️\s*/, '').replace(/\\+\s*$/, '').trim();
            return (
              <div
                key={lineKey}
                className="my-2.5 p-3 rounded-xl bg-rose-50/90 border border-rose-200/90 text-rose-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cleanHeading}</span>
              </div>
            );
          }

          // Callout Tip e.g. "### 💡 Mẹo Casio:" or "💡 ..."
          if (line.includes('### 💡') || line.startsWith('💡')) {
            const cleanHeading = line.replace(/^###\s*/, '').replace(/^💡\s*/, '').replace(/\\+\s*$/, '').trim();
            return (
              <div
                key={lineKey}
                className="my-2.5 p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/90 text-indigo-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{cleanHeading}</span>
              </div>
            );
          }

          // Callout Pedagogical Example SGK e.g. "### 📌 Ví dụ minh họa SGK:" or "📌 ..."
          if (line.includes('### 📌') || line.startsWith('📌')) {
            const cleanHeading = line.replace(/^###\s*/, '').replace(/^📌\s*/, '').replace(/\\+\s*$/, '').trim();
            return (
              <div
                key={lineKey}
                className="my-2.5 p-2.5 rounded-xl bg-teal-50/90 border border-teal-200/90 text-teal-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{cleanHeading}</span>
              </div>
            );
          }

          // Callout Sample Problem / Practice e.g. "### 📝 Bài toán mẫu..." or "### 📄 Bài toán mẫu..." or "📝 ..." or "📄 ..."
          if (line.includes('### 📝') || line.includes('### 📄') || line.includes('### ✍️') || line.startsWith('📝') || line.startsWith('📄') || line.startsWith('✍️')) {
            const cleanHeading = line.replace(/^###\s*/, '').replace(/^[📝📄✍️]\s*/, '').replace(/\\+\s*$/, '').trim();
            return (
              <div
                key={lineKey}
                className="my-2.5 p-2.5 rounded-lg bg-amber-50/90 border border-amber-300/90 text-amber-950 font-bold text-xs flex items-center gap-2 shadow-2xs"
              >
                <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{cleanHeading}</span>
              </div>
            );
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
            return (
              <div key={lineKey} className={headingStyles[level] || headingStyles[3]}>
                {renderInlineContent(headingText, lineKey)}
              </div>
            );
          }

          // Bullet list items e.g. "- ...", "* ...", "• ...", or duplicate "• - ..."
          // NOTE: Must have whitespace after bullet marker so bold "**text**" or "***text***" is NOT treated as a bullet!
          const bulletMatch = line.match(/^(\s*)(?:[-+•\u2022]|\*(?!\*))\s+(?:[-+•\u2022]\s+)?(.*)$/);
          if (bulletMatch) {
            const indentSpaces = bulletMatch[1].length;
            const indentClass = indentSpaces >= 4 ? 'ml-6' : indentSpaces >= 2 ? 'ml-3.5' : 'ml-1';
            const bulletContent = bulletMatch[2];
            return (
              <div key={lineKey} className={`flex items-start gap-2 ${indentClass} text-slate-700 leading-relaxed my-0.5`}>
                <span className="text-indigo-500 font-bold select-none leading-relaxed">•</span>
                <span className="flex-1 min-w-0">{renderInlineContent(bulletContent, lineKey)}</span>
              </div>
            );
          }

          // Numbered list items e.g. "1. ...", "2) ..."
          const numMatch = line.match(/^(\s*)(\d+[\.\)])\s+(.*)$/);
          if (numMatch) {
            const indentSpaces = numMatch[1].length;
            const indentClass = indentSpaces >= 4 ? 'ml-6' : indentSpaces >= 2 ? 'ml-3.5' : 'ml-1';
            const numMarker = numMatch[2];
            const numContent = numMatch[3];
            return (
              <div key={lineKey} className={`flex items-start gap-2 ${indentClass} text-slate-700 leading-relaxed my-0.5`}>
                <span className="font-bold text-indigo-600 select-none leading-relaxed text-xs pt-0.5 shrink-0">
                  {numMarker}
                </span>
                <span className="flex-1 min-w-0">{renderInlineContent(numContent, lineKey)}</span>
              </div>
            );
          }

          // Step highlight line e.g. "**Bước 1: ...**" or "Bước 1: ..."
          const isStepLine = /^\s*(\*\*Bước \d+:|Bước \d+:)/i.test(line);
          if (isStepLine) {
            return (
              <div key={lineKey} className="font-bold text-slate-900 mt-2.5 mb-1 leading-relaxed">
                {renderInlineContent(line, lineKey)}
              </div>
            );
          }

          // Default regular line/paragraph
          return (
            <div key={lineKey} className="leading-relaxed text-slate-700 my-0.5">
              {renderInlineContent(line, lineKey)}
            </div>
          );
        })}
      </React.Fragment>
    );
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
export default function MathText({ text, className = '' }) {
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
  const hasSpecialBlocks = raw.includes('[VARIATION_TABLE]') || raw.includes('[GRAPH:');
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
      {renderStructuredContent(raw)}
    </div>
  );
}
