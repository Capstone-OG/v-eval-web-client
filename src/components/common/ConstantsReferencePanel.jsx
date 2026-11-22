import React, { useState, useMemo } from 'react';
import katex from 'katex';
import { Search, Copy, Check } from 'lucide-react';

function KatexCell({ latex }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  }, [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const CONSTANT_GROUPS = [
  {
    id: 'math',
    title: '1. Hằng số Toán học & Giá trị gần đúng hay dùng',
    items: [
      { symbol: 'π', name: 'Số Pi (tỉ số chu vi / đường kính)', display: '3,14159265...', copy: '3.14159265' },
      { symbol: 'e', name: 'Số Euler (cơ số logarit tự nhiên)', display: '2,71828182...', copy: '2.71828182' },
      { symbol: 'φ', name: 'Tỉ lệ vàng (1 + √5)/2', display: '1,61803398...', copy: '1.618034' },
      { symbol: '√2', name: 'Căn bậc hai của 2', display: '1,41421356...', copy: '1.41421' },
      { symbol: '√3', name: 'Căn bậc hai của 3', display: '1,73205081...', copy: '1.73205' },
      { symbol: '√5', name: 'Căn bậc hai của 5', display: '2,23606798...', copy: '2.23607' },
      { symbol: 'ln 2', name: 'Logarit tự nhiên của 2 (dùng trong phóng xạ)', display: '0,693147...', copy: '0.69315' },
      { symbol: 'ln 10', name: 'Logarit tự nhiên của 10', display: '2,302585...', copy: '2.30259' },
      { symbol: '1 rad', name: '1 Radian sang Độ', display: '57,2958° (≈ 57°17\'45")', copy: '57.2958' },
      { symbol: '1°', name: '1 Độ sang Radian', display: 'π/180 ≈ 0,017453 rad', copy: '0.017453' }
    ]
  },
  {
    id: 'mechanics',
    title: '2. Vật lý — Cơ học, Hấp dẫn & Thiên văn',
    items: [
      { symbol: 'g', name: 'Gia tốc trọng trường chuẩn (hay lấy 9,8 hoặc 10)', display: '9,80665 m/s²', copy: '9.80665' },
      { symbol: 'G', name: 'Hằng số hấp dẫn vũ trụ', display: '6,674 × 10⁻¹¹ N·m²/kg²', copy: '6.674e-11' },
      { symbol: 'R_TĐ', name: 'Bán kính trung bình Trái Đất', display: '6.371 km (≈ 6,4 × 10⁶ m)', copy: '6371000' },
      { symbol: 'M_TĐ', name: 'Khối lượng Trái Đất', display: '5,972 × 10²⁴ kg', copy: '5.972e24' },
      { symbol: 'v_âm', name: 'Tốc độ âm thanh trong không khí (20°C)', display: '343 m/s (≈ 340 m/s)', copy: '343' },
      { symbol: 'ρ_nước', name: 'Khối lượng riêng của nước tinh khiết (4°C)', display: '1.000 kg/m³ (1 g/cm³)', copy: '1000' },
      { symbol: 'p₀', name: 'Áp suất khí quyển tiêu chuẩn (1 atm)', display: '1,01325 × 10⁵ Pa = 760 mmHg', copy: '101325' },
      { symbol: '1 ly', name: '1 Năm ánh sáng', display: '9,461 × 10¹⁵ m', copy: '9.461e15' }
    ]
  },
  {
    id: 'em_optics',
    title: '3. Vật lý — Điện học, Từ trường & Quang học',
    items: [
      { symbol: 'c', name: 'Tốc độ ánh sáng trong chân không', display: '2,9979 × 10⁸ ≈ 3 × 10⁸ m/s', copy: '3e8' },
      { symbol: 'e', name: 'Điện tích nguyên tố', display: '1,60218 × 10⁻¹⁹ C', copy: '1.60218e-19' },
      { symbol: 'k', name: 'Hằng số Coulomb (1 / 4πε₀)', display: '8,988 × 10⁹ ≈ 9 × 10⁹ N·m²/C²', copy: '9e9' },
      { symbol: 'ε₀', name: 'Hằng số điện môi chân không', display: '8,854 × 10⁻¹² F/m', copy: '8.854e-12' },
      { symbol: 'μ₀', name: 'Độ từ thẩm chân không', display: '4π × 10⁻⁷ ≈ 1,257 × 10⁻⁶ T·m/A', copy: '1.2566e-6' },
      { symbol: 'n_nước', name: 'Chiết suất của nước', display: '≈ 1,333 (4/3)', copy: '1.333' },
      { symbol: 'n_tt', name: 'Chiết suất thủy tinh thường', display: '≈ 1,50', copy: '1.5' },
      { symbol: 'n_kc', name: 'Chiết suất kim cương', display: '≈ 2,42', copy: '2.42' }
    ]
  },
  {
    id: 'thermo',
    title: '4. Vật lý Nhiệt & Khí lý tưởng (Lớp 12 GDPT 2018)',
    items: [
      { symbol: 'R', name: 'Hằng số khí lý tưởng', display: '8,314 J/(mol·K) ≈ 0,082 L·atm/(mol·K)', copy: '8.314' },
      { symbol: 'k_B', name: 'Hằng số Boltzmann (R / N_A)', display: '1,38065 × 10⁻²³ J/K', copy: '1.38065e-23' },
      { symbol: 'N_A', name: 'Số Avogadro', display: '6,02214 × 10²³ mol⁻¹', copy: '6.02214e23' },
      { symbol: 'T₀', name: 'Độ không tuyệt đối (0°C sang Kelvin)', display: '0°C = 273,15 K (hay lấy 273 K)', copy: '273.15' },
      { symbol: 'c_nước', name: 'Nhiệt dung riêng của nước', display: '4.180 ≈ 4.200 J/(kg·K)', copy: '4200' },
      { symbol: 'λ_đá', name: 'Nhiệt nóng chảy riêng của nước đá (0°C)', display: '3,34 × 10⁵ J/kg', copy: '3.34e5' },
      { symbol: 'L_nước', name: 'Nhiệt hóa hơi riêng của nước (100°C)', display: '2,26 × 10⁶ J/kg', copy: '2.26e6' },
      { symbol: 'σ', name: 'Hằng số Stefan–Boltzmann', display: '5,67 × 10⁻⁸ W/(m²·K⁴)', copy: '5.67e-8' }
    ]
  },
  {
    id: 'quantum_nuclear',
    title: '5. Lượng tử Ánh sáng & Vật lý Hạt nhân',
    items: [
      { symbol: 'h', name: 'Hằng số Planck', display: '6,62607 × 10⁻³⁴ ≈ 6,625 × 10⁻³⁴ J·s', copy: '6.625e-34' },
      { symbol: 'ħ', name: 'Hằng số Planck rút gọn (h / 2π)', display: '1,05457 × 10⁻³⁴ J·s', copy: '1.05457e-34' },
      { symbol: 'h·c', name: 'Tích hc tính nhanh năng lượng photon', display: '1,9875 × 10⁻²⁵ J·m ≈ 1,242 eV·µm', copy: '1.9875e-25' },
      { symbol: 'm_e', name: 'Khối lượng nghỉ electron', display: '9,10938 × 10⁻³¹ kg (≈ 0,511 MeV/c²)', copy: '9.10938e-31' },
      { symbol: 'm_p', name: 'Khối lượng nghỉ proton', display: '1,67262 × 10⁻²⁷ kg (≈ 1,00728 u)', copy: '1.67262e-27' },
      { symbol: 'm_n', name: 'Khối lượng nghỉ neutron', display: '1,67493 × 10⁻²⁷ kg (≈ 1,00866 u)', copy: '1.67493e-27' },
      { symbol: '1 u', name: 'Đơn vị khối lượng nguyên tử', display: '1,66055 × 10⁻²⁷ kg = 931,5 MeV/c²', copy: '931.5' },
      { symbol: '1 eV', name: '1 Electron-volt sang Joule', display: '1,6 × 10⁻¹⁹ J (1 MeV = 1,6 × 10⁻¹³ J)', copy: '1.6e-19' },
      { symbol: 'r₀', name: 'Bán kính Bohr quỹ đạo K của Hiđrô', display: '5,3 × 10⁻¹¹ m', copy: '5.3e-11' },
      { symbol: 'E₁', name: 'Năng lượng trạng thái cơ bản nguyên tử H', display: '-13,6 eV (E_n = -13,6 / n² eV)', copy: '-13.6' },
      { symbol: 'R_H', name: 'Hằng số Rydberg', display: '1,097 × 10⁷ m⁻¹', copy: '1.097e7' }
    ]
  },
  {
    id: 'chemistry',
    title: '6. Hằng số Hóa học (Chuẩn GDPT 2018)',
    items: [
      { symbol: 'V_đkc', name: 'Thể tích 1 mol khí ở đkc (25°C, 1 bar — GDPT 2018)', display: '24,79 L/mol', copy: '24.79' },
      { symbol: 'V_đktc', name: 'Thể tích 1 mol khí ở đktc cũ (0°C, 1 atm)', display: '22,4 L/mol', copy: '22.4' },
      { symbol: 'F', name: 'Hằng số Faraday (điện phân)', display: '96.485 ≈ 96.500 C/mol', copy: '96500' },
      { symbol: 'K_w', name: 'Tích số ion của nước (ở 25°C)', display: '1,0 × 10⁻¹⁴ ([H⁺][OH⁻] = 10⁻¹⁴)', copy: '1e-14' },
      { symbol: 'M_kk', name: 'Khối lượng mol trung bình không khí', display: '≈ 29 g/mol (20% O₂, 80% N₂)', copy: '29' }
    ]
  }
];

const TRIG_ANGLES_TABLE = [
  { deg: '0°', rad: '0', dec: '0', sin: '0', cos: '1', tan: '0', cot: '\\text{KXĐ}' },
  { deg: '30°', rad: '\\frac{\\pi}{6}', dec: '0,524', sin: '\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '\\frac{\\sqrt{3}}{3}', cot: '\\sqrt{3}' },
  { deg: '45°', rad: '\\frac{\\pi}{4}', dec: '0,785', sin: '\\frac{\\sqrt{2}}{2}', cos: '\\frac{\\sqrt{2}}{2}', tan: '1', cot: '1' },
  { deg: '60°', rad: '\\frac{\\pi}{3}', dec: '1,047', sin: '\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '\\sqrt{3}', cot: '\\frac{\\sqrt{3}}{3}' },
  { deg: '90°', rad: '\\frac{\\pi}{2}', dec: '1,571', sin: '1', cos: '0', tan: '\\text{KXĐ}', cot: '0' },
  { deg: '120°', rad: '\\frac{2\\pi}{3}', dec: '2,094', sin: '\\frac{\\sqrt{3}}{2}', cos: '-\\frac{1}{2}', tan: '-\\sqrt{3}', cot: '-\\frac{\\sqrt{3}}{3}' },
  { deg: '135°', rad: '\\frac{3\\pi}{4}', dec: '2,356', sin: '\\frac{\\sqrt{2}}{2}', cos: '-\\frac{\\sqrt{2}}{2}', tan: '-1', cot: '-1' },
  { deg: '150°', rad: '\\frac{5\\pi}{6}', dec: '2,618', sin: '\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '-\\frac{\\sqrt{3}}{3}', cot: '-\\sqrt{3}' },
  { deg: '180°', rad: '\\pi', dec: '3,142', sin: '0', cos: '-1', tan: '0', cot: '\\text{KXĐ}' },
  { deg: '210°', rad: '\\frac{7\\pi}{6}', dec: '3,665', sin: '-\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '\\frac{\\sqrt{3}}{3}', cot: '\\sqrt{3}' },
  { deg: '225°', rad: '\\frac{5\\pi}{4}', dec: '3,927', sin: '-\\frac{\\sqrt{2}}{2}', cos: '-\\frac{\\sqrt{2}}{2}', tan: '1', cot: '1' },
  { deg: '240°', rad: '\\frac{4\\pi}{3}', dec: '4,189', sin: '-\\frac{\\sqrt{3}}{2}', cos: '-\\frac{1}{2}', tan: '\\sqrt{3}', cot: '\\frac{\\sqrt{3}}{3}' },
  { deg: '270°', rad: '\\frac{3\\pi}{2}', dec: '4,712', sin: '-1', cos: '0', tan: '\\text{KXĐ}', cot: '0' },
  { deg: '300°', rad: '\\frac{5\\pi}{3}', dec: '5,236', sin: '-\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '-\\sqrt{3}', cot: '-\\frac{\\sqrt{3}}{3}' },
  { deg: '315°', rad: '\\frac{7\\pi}{4}', dec: '5,498', sin: '-\\frac{\\sqrt{2}}{2}', cos: '\\frac{\\sqrt{2}}{2}', tan: '-1', cot: '-1' },
  { deg: '330°', rad: '\\frac{11\\pi}{6}', dec: '5,760', sin: '-\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '-\\frac{\\sqrt{3}}{3}', cot: '-\\sqrt{3}' },
  { deg: '360°', rad: '2\\pi', dec: '6,283', sin: '0', cos: '1', tan: '0', cot: '\\text{KXĐ}' }
];

export default function ConstantsReferencePanel() {
  const [subView, setSubView] = useState('constants'); // 'constants' | 'angles'
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONSTANT_GROUPS;
    return CONSTANT_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (it) =>
          it.symbol.toLowerCase().includes(q) ||
          it.name.toLowerCase().includes(q) ||
          it.display.toLowerCase().includes(q)
      )
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const handleCopy = (item) => {
    navigator.clipboard?.writeText(item.copy).catch(() => {});
    setCopiedKey(item.symbol + item.name);
    setTimeout(() => setCopiedKey(''), 1400);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70">
          <button
            type="button"
            onClick={() => setSubView('constants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subView === 'constants' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bảng Hằng số Tổng quát (48 hằng số)
          </button>
          <button
            type="button"
            onClick={() => setSubView('angles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subView === 'angles' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bảng 17 Góc Đặc biệt (Độ · Radian π · sin/cos/tan)
          </button>
        </div>
      </div>

      {/* VIEW 1: ALL 48 CONSTANTS */}
      {subView === 'constants' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh hằng số (vd: g, Planck, Faraday, Avogadro, 24.79, Bohr, eV, π)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {filteredGroups.map((grp) => (
            <section key={grp.id} className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 px-1">
                {grp.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {grp.items.map((c) => {
                  const key = c.symbol + c.name;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-xs font-extrabold shrink-0">
                            {c.symbol}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate" title={c.name}>
                            {c.name}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-indigo-700 mt-1">{c.display}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(c)}
                        title={`Sao chép ${c.copy}`}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 shrink-0 cursor-pointer"
                      >
                        {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* VIEW 2: SPECIAL ANGLES & PI RADIANS TABLE */}
      {subView === 'angles' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs text-slate-600">
            Công thức đổi nhanh: <strong className="text-slate-900">180° = π rad</strong> ·{' '}
            <strong className="text-slate-900">rad = độ × π / 180</strong> ·{' '}
            <strong className="text-slate-900">độ = rad × 180 / π</strong>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3">Độ (°)</th>
                  <th className="py-2.5 px-3">Radian (π)</th>
                  <th className="py-2.5 px-3">Thập phân</th>
                  <th className="py-2.5 px-3 text-rose-700">sin α</th>
                  <th className="py-2.5 px-3 text-blue-700">cos α</th>
                  <th className="py-2.5 px-3">tan α</th>
                  <th className="py-2.5 px-3">cot α</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {TRIG_ANGLES_TABLE.map((row) => (
                  <tr key={row.deg} className="hover:bg-indigo-50/40">
                    <td className="py-2 px-3 font-bold text-slate-900">{row.deg}</td>
                    <td className="py-2 px-3 font-semibold text-indigo-700"><KatexCell latex={row.rad} /></td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{row.dec}</td>
                    <td className="py-2 px-3 text-rose-700"><KatexCell latex={row.sin} /></td>
                    <td className="py-2 px-3 text-blue-700"><KatexCell latex={row.cos} /></td>
                    <td className="py-2 px-3 text-slate-800"><KatexCell latex={row.tan} /></td>
                    <td className="py-2 px-3 text-slate-800"><KatexCell latex={row.cot} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
