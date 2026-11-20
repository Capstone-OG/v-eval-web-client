import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import MathText from '../common/MathText';
import apiClient from '../../services/apiClient';
import {
  sanitizeExamMathAndLatex,
  splitExamContentBlocks,
  extractInlineChartsFromText,
  resolveExamMediaUrl
} from '../../utils/examParserUtils';

const CHART_PALETTE = [
  '#0891b2', // cyan-600
  '#059669', // emerald-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#d97706', // amber-600
  '#4f46e5', // indigo-600
  '#0d9488'  // teal-600
];

function TwoTierExamTable({ table }) {
  if (!table) return null;
  const { headerRows, hasTwoTierGroups, groups, bodyRows } = table;

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-emerald-200/90 bg-white shadow-xs">
      <table className="w-full border-collapse text-xs">
        <thead>
          {hasTwoTierGroups ? (
            <>
              <tr className="bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-950 border-b border-emerald-200">
                {groups.map((g, idx) =>
                  g.type === 'single' ? (
                    <th
                      key={`g1-${idx}`}
                      rowSpan={2}
                      className="px-3 py-2.5 text-center font-bold border-r last:border-r-0 border-emerald-200/80 align-middle"
                    >
                      <MathText text={g.title} inline />
                    </th>
                  ) : (
                    <th
                      key={`g1-${idx}`}
                      colSpan={g.colspan}
                      className="px-3 py-2 text-center font-bold border-r last:border-r-0 border-emerald-200/80"
                    >
                      <MathText text={g.mainTitle} inline />
                    </th>
                  )
                )}
              </tr>
              <tr className="bg-emerald-50/60 text-emerald-900 border-b border-emerald-200">
                {groups.flatMap((g, gIdx) =>
                  g.type === 'group'
                    ? g.subCols.map((sub, sIdx) => (
                        <th
                          key={`g2-${gIdx}-${sIdx}`}
                          className="px-3 py-1.5 text-center font-semibold border-r last:border-r-0 border-emerald-200/70"
                        >
                          <MathText text={sub} inline />
                        </th>
                      ))
                    : []
                )}
              </tr>
            </>
          ) : (
            headerRows.map((hRow, hrIdx) => (
              <tr
                key={`hr-${hrIdx}`}
                className="bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-950 border-b border-emerald-200"
              >
                {hRow.map((cell, cIdx) => (
                  <th
                    key={`hc-${cIdx}`}
                    className="px-3 py-2 text-left font-bold border-r last:border-r-0 border-emerald-200/80"
                  >
                    <MathText text={cell} inline />
                  </th>
                ))}
              </tr>
            ))
          )}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bodyRows.map((rowCells, rIdx) => (
            <tr
              key={`br-${rIdx}`}
              className={`transition-colors hover:bg-emerald-50/40 ${
                rIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
              }`}
            >
              {rowCells.map((cell, cIdx) => (
                <td
                  key={`bc-${cIdx}`}
                  className="px-3 py-2 text-slate-700 font-medium border-r last:border-r-0 border-slate-200/70"
                >
                  <MathText text={cell} inline />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StructuredHtmlExamTable({ table }) {
  if (!table || !Array.isArray(table.rows) || table.rows.length === 0) return null;

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-[#D4DFED] bg-white shadow-xs">
      <table className="w-full border-collapse text-xs">
        <tbody className="divide-y divide-slate-100">
          {table.rows.map((row, rIdx) => (
            <tr
              key={`htr-${rIdx}`}
              className={
                row.isHeader
                  ? 'bg-[#EEF2F7] text-[#1E3A5F] border-b border-[#D4DFED]'
                  : rIdx % 2 === 1
                  ? 'bg-[#FAF9F6]'
                  : 'bg-white'
              }
            >
              {row.cells.map((cell, cIdx) =>
                cell.tag === 'th' ? (
                  <th
                    key={`hc-${rIdx}-${cIdx}`}
                    rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                    colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                    className="px-3 py-2 text-center font-bold border-r last:border-r-0 border-[#D4DFED]/80 align-middle"
                  >
                    <MathText text={cell.content} inline />
                  </th>
                ) : (
                  <td
                    key={`hc-${rIdx}-${cIdx}`}
                    rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                    colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                    className="px-3 py-2 text-slate-700 font-medium border-r last:border-r-0 border-slate-200/70 align-middle"
                  >
                    <MathText text={cell.content} inline />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExamDetectedChart({ chart }) {
  if (!chart || !Array.isArray(chart.items) || chart.items.length < 2) return null;
  const maxVal = Math.max(...chart.items.map((i) => Number(i.value) || 0), 10);

  return (
    <div className="my-3.5 rounded-2xl border border-cyan-200/80 bg-white overflow-hidden shadow-xs">
      <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-50/90 to-emerald-50/60 border-b border-cyan-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          {chart.type === 'pie' ? (
            <PieChartIcon className="w-4 h-4 text-cyan-600 shrink-0" />
          ) : (
            <BarChart3 className="w-4 h-4 text-cyan-600 shrink-0" />
          )}
          <span>{chart.title}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-cyan-100/80 text-cyan-800 border border-cyan-200">
          {chart.type === 'pie' ? 'Biểu đồ tròn tương tác' : 'Biểu đồ cột tương tác'}
        </span>
      </div>

      <div className="p-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chart.items}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={88}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {chart.items.map((_, index) => (
                    <Cell
                      key={`slice-${index}`}
                      fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#cbd5e1',
                    fontSize: 12,
                    boxShadow: '0 8px 20px rgba(15,23,42,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            ) : (
              <BarChart data={chart.items} margin={{ top: 22, right: 16, left: -6, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11.5, fill: '#334155', fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, Math.ceil(maxVal * 1.2)]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#cbd5e1',
                    fontSize: 12,
                    boxShadow: '0 8px 20px rgba(15,23,42,0.08)'
                  }}
                />
                <Bar dataKey="value" name="Tỷ lệ (%)" radius={[8, 8, 0, 0]} maxBarSize={52}>
                  {chart.items.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v) => `${v}%`}
                    style={{ fill: '#0e7490', fontSize: 11.5, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function rewriteRelativeMarkdownImages(text, baseUrl) {
  if (!text || !text.includes('![')) return text;
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const resolved = resolveExamMediaUrl(url, baseUrl);
    return `![${alt}](${resolved})`;
  });
}

/**
 * ExamRichContent
 * Renders exam passage/question/option/explanation content with:
 * - Full 6-stage OCR math sanitizer
 * - 2-tier Markdown tables (rowspan/colspan)
 * - Auto-detected interactive Bar/Pie Recharts
 * - KaTeX & MathGraph rendering via MathText
 * - Clickable inline images -> Lightbox
 */
export default function ExamRichContent({
  text,
  inline = false,
  detectCharts = true,
  className = '',
  onImageClick = null
}) {
  const baseUrl = apiClient.getBaseUrl();

  const { blocks, charts } = useMemo(() => {
    if (!text) return { blocks: [], charts: [] };
    const sanitized = rewriteRelativeMarkdownImages(sanitizeExamMathAndLatex(text), baseUrl);
    if (inline) {
      return { blocks: [{ type: 'text', content: sanitized }], charts: [] };
    }
    return {
      blocks: splitExamContentBlocks(sanitized),
      charts: detectCharts ? extractInlineChartsFromText(sanitized) : []
    };
  }, [text, inline, detectCharts, baseUrl]);

  if (!text) return null;

  const handleContainerClick = (e) => {
    if (onImageClick && e.target?.tagName === 'IMG' && e.target.src) {
      e.preventDefault();
      e.stopPropagation();
      onImageClick(e.target.src, e.target.alt || 'Hình ảnh đề thi');
    }
  };

  if (inline) {
    return (
      <span className={className} onClick={handleContainerClick}>
        <MathText text={blocks[0]?.content || ''} inline />
      </span>
    );
  }

  return (
    <div
      className={`exam-rich-content space-y-2 text-[14.5px] leading-relaxed text-slate-800 ${
        onImageClick ? '[&_img]:cursor-zoom-in' : ''
      } ${className}`}
      onClick={handleContainerClick}
    >
      {blocks.map((blk, idx) =>
        blk.type === 'table' ? (
          <TwoTierExamTable key={`tbl-${idx}`} table={blk.table} />
        ) : blk.type === 'html-table' ? (
          <StructuredHtmlExamTable key={`htbl-${idx}`} table={blk.table} />
        ) : (
          <div key={`txt-${idx}`}>
            <MathText text={blk.content} />
          </div>
        )
      )}

      {charts.map((chart, cIdx) => (
        <ExamDetectedChart key={`chart-${cIdx}`} chart={chart} />
      ))}
    </div>
  );
}
