import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Plus, Trash2, SlidersHorizontal, Check } from 'lucide-react';

const ACADEMIC_COLORS = ['#2C4C7E', '#3A7D6C', '#C48A3A', '#B55858', '#6B5B8E', '#4F7CAC'];

export function parseDataChartString(raw) {
  const fallback = {
    type: 'bar',
    title: 'Biểu đồ số liệu',
    items: [
      { label: 'Nhóm A', value: 35 },
      { label: 'Nhóm B', value: 52 },
      { label: 'Nhóm C', value: 28 },
      { label: 'Nhóm D', value: 44 }
    ]
  };
  if (!raw || typeof raw !== 'string') return fallback;

  const clean = raw
    .replace(/^\[DATA_CHART\]/i, '')
    .replace(/\[\/DATA_CHART\]$/i, '')
    .trim();

  const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let type = 'bar';
  let title = 'Biểu đồ số liệu';
  const items = [];

  for (const line of lines) {
    if (/^type\s*:/i.test(line)) {
      const t = line.replace(/^type\s*:/i, '').trim().toLowerCase();
      if (t === 'line' || t === 'pie' || t === 'bar') type = t;
    } else if (/^title\s*:/i.test(line)) {
      title = line.replace(/^title\s*:/i, '').trim() || title;
    } else if (/^data\s*:/i.test(line)) {
      const rawData = line.replace(/^data\s*:/i, '').trim();
      rawData.split('|').forEach(pair => {
        const idx = pair.lastIndexOf('=');
        if (idx > 0) {
          const label = pair.slice(0, idx).trim();
          const val = parseFloat(pair.slice(idx + 1).trim().replace(',', '.'));
          if (label && !Number.isNaN(val)) {
            items.push({ label, value: val });
          }
        }
      });
    }
  }

  return {
    type,
    title,
    items: items.length > 0 ? items : fallback.items
  };
}

export function serializeDataChart(chartObj) {
  const safe = chartObj || parseDataChartString('');
  const type = safe.type || 'bar';
  const title = (safe.title || 'Biểu đồ số liệu').replace(/\r?\n/g, ' ').trim();
  const dataStr = (safe.items || [])
    .filter(it => (it.label || '').trim() !== '')
    .map(it => `${String(it.label).replace(/[|=]/g, '').trim()}=${Number(it.value) || 0}`)
    .join(' | ');
  return `[DATA_CHART]\ntype: ${type}\ntitle: ${title}\ndata: ${dataStr || 'Mục 1=10 | Mục 2=20'}\n[/DATA_CHART]`;
}

export default function AcademicChartBlock({ data, editable = false, onChange = null, onDelete = null }) {
  const chart = data && Array.isArray(data.items) ? data : parseDataChartString('');
  const [isEditingData, setIsEditingData] = useState(false);

  const emitChange = (next) => {
    if (onChange) onChange(next);
  };

  const handleItemChange = (idx, field, val) => {
    const nextItems = chart.items.map((it, i) =>
      i === idx
        ? { ...it, [field]: field === 'value' ? (val === '' ? 0 : parseFloat(val) || 0) : val }
        : it
    );
    emitChange({ ...chart, items: nextItems });
  };

  const handleAddRow = () => {
    emitChange({
      ...chart,
      items: [...chart.items, { label: `Mục ${chart.items.length + 1}`, value: 20 }]
    });
  };

  const handleRemoveRow = (idx) => {
    if (chart.items.length <= 1) return;
    emitChange({
      ...chart,
      items: chart.items.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="my-3 rounded-xl border border-[#E5E3DC] bg-[#FCFCFA] overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#ECEAE4] bg-[#F7F6F2] flex items-center justify-between gap-2 flex-wrap">
        {editable && isEditingData ? (
          <input
            type="text"
            value={chart.title}
            onChange={(e) => emitChange({ ...chart, title: e.target.value })}
            placeholder="Tiêu đề biểu đồ"
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25 min-w-[200px]"
          />
        ) : (
          <span className="text-xs font-semibold text-slate-800">{chart.title}</span>
        )}

        {editable && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5">
              {[
                { id: 'bar', icon: BarChart3, title: 'Biểu đồ cột' },
                { id: 'line', icon: TrendingUp, title: 'Biểu đồ đường' },
                { id: 'pie', icon: PieIcon, title: 'Biểu đồ tròn' }
              ].map((t) => {
                const Icon = t.icon;
                const active = chart.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => emitChange({ ...chart, type: t.id })}
                    title={t.title}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      active ? 'bg-[#EEF2F7] text-[#1E3A5F]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsEditingData(v => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                isEditingData
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isEditingData ? <Check className="w-3 h-3" /> : <SlidersHorizontal className="w-3 h-3" />}
              <span>{isEditingData ? 'Xong' : 'Số liệu'}</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa biểu đồ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chart Body */}
      <div className="p-4 bg-white">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'line' ? (
              <LineChart data={chart.items} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E5E3DC', fontSize: 12 }} />
                <Line type="monotone" dataKey="value" name="Giá trị" stroke="#2C4C7E" strokeWidth={2.5} dot={{ r: 4, fill: '#2C4C7E' }} />
              </LineChart>
            ) : chart.type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chart.items}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  label={({ name, percent }) => `${name} (${Math.round((percent || 0) * 100)}%)`}
                  labelLine={false}
                >
                  {chart.items.map((_, index) => (
                    <Cell key={index} fill={ACADEMIC_COLORS[index % ACADEMIC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E5E3DC', fontSize: 12 }} />
              </PieChart>
            ) : (
              <BarChart data={chart.items} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E5E3DC', fontSize: 12 }} />
                <Bar dataKey="value" name="Giá trị" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {chart.items.map((_, index) => (
                    <Cell key={index} fill={ACADEMIC_COLORS[index % ACADEMIC_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Inline Excel-like Data Editor */}
        {editable && isEditingData && (
          <div className="mt-3 pt-3 border-t border-[#ECEAE4] space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 px-1">
              <span className="col-span-6">Nhãn</span>
              <span className="col-span-4">Giá trị</span>
              <span className="col-span-2 text-right"></span>
            </div>
            <div className="space-y-1.5">
              {chart.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                    className="col-span-6 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                  />
                  <input
                    type="number"
                    step="any"
                    value={item.value}
                    onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                    className="col-span-4 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                  />
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      disabled={chart.items.length <= 1}
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#1E3A5F] bg-[#EEF2F7] hover:bg-[#E2E9F2] inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm dòng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
