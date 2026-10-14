import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
 * Intelligently normalizes text strings containing math expressions:
 * 1. If explicit delimiters are present ($$, $, \[, \]), preserves them.
 * 2. If it's a standalone math expression (e.g. "y = x^4 + 2x^2", "y = \frac{2x - 1}{x + 1}"), wraps it into $...$.
 * 3. If it's a natural language sentence with embedded math patterns (e.g. "đồng biến trên khoảng (-\infty; +\infty) ?"),
 *    auto-encloses the isolated intervals/LaTeX commands in $...$ without corrupting Vietnamese diacritics.
 */
export function normalizeMathString(text) {
  if (!text) return '';
  let str = String(text).trim();

  // If already has explicit delimiters, keep as is
  if (str.includes('$') || str.includes('\\(') || str.includes('\\[') || str.includes('$$')) {
    return str;
  }

  // Check if string contains multi-word natural language text
  const hasVietnameseWords = /[a-zA-Z\u00C0-\u024F]{2,}\s+[a-zA-Z\u00C0-\u024F]{2,}/i.test(str);
  const isPureMathExpr = !hasVietnameseWords && (
    /\\[a-zA-Z]+|[\^_]|(\b[a-zA-Z]_{?[a-zA-Z0-9]+}?)|(^[a-zA-Z](\([a-zA-Z0-9, ]+\))?\s*=)/i.test(str) ||
    /^\s*[(\[][\s]*[+-]?\\infty/i.test(str)
  );

  if (isPureMathExpr) {
    return `$${str}$`;
  }

  // Mixed sentence: auto-wrap mathematical intervals e.g. (-\infty; +\infty), [0; +\infty)
  str = str.replace(/([(\[][\s]*[+-]?\\infty\s*;\s*[+-]?\\infty[\s]*[)\]])/g, '$$$1$$');
  // Auto-wrap isolated LaTeX commands like \frac{...}{...}, \sqrt{...}
  str = str.replace(/(\\[a-zA-Z]+(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})+(?:\^[a-zA-Z0-9]+)?)/g, '$$$1$$');

  return str;
}

/**
 * MathText Component:
 * Automatically parses and renders LaTeX math formulas embedded in text:
 * - Block math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Raw math expressions: auto-normalized and rendered beautifully
 */
/**
 * Helper to render non-math text with support for Markdown images ![alt](url)
 */
function renderTextWithMarkdown(text) {
  if (!text) return null;
  if (typeof text !== 'string') return text;
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  if (!imageRegex.test(text)) {
    return text;
  }
  const elements = [];
  let lastIndex = 0;
  let match;
  imageRegex.lastIndex = 0;
  while ((match = imageRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    const alt = match[1] || 'Hình minh họa';
    const src = match[2];
    elements.push(
      <span key={`img-${match.index}`} className="block my-3 text-center">
        <img
          src={src}
          alt={alt}
          className="inline-block max-w-full max-h-80 rounded-2xl border border-slate-200/90 shadow-md object-contain bg-white p-1 hover:shadow-lg transition-shadow"
          loading="lazy"
        />
        {alt && alt !== 'Hình minh họa' && (
          <span className="block text-[11px] text-slate-500 font-medium mt-1 italic">
            {alt}
          </span>
        )}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  return elements;
}

export default function MathText({ text, className = '' }) {
  if (!text) return null;
  if (typeof text !== 'string') {
    return <span className={className}>{String(text)}</span>;
  }
  const raw = normalizeMathString(text);

  // Split by explicit delimiters: $$, $, \[, \], \(, \)
  const parts = raw.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);

  return (
    <span className={`inline-block align-baseline ${className}`}>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Block display: $$...$$
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          return (
            <span
              key={idx}
              className="my-2 block text-center overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
            />
          );
        }

        // Inline display: $...$
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          return (
            <span
              key={idx}
              className="inline-math mx-0.5"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
            />
          );
        }

        // Block display: \[...\]
        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = part.slice(2, -2).trim();
          return (
            <span
              key={idx}
              className="my-2 block text-center overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
            />
          );
        }

        // Inline display: \(...\)
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2).trim();
          return (
            <span
              key={idx}
              className="inline-math mx-0.5"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, false) }}
            />
          );
        }

        // Regular text with image support
        return <span key={idx}>{renderTextWithMarkdown(part)}</span>;
      })}
    </span>
  );
}

