import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ChevronRight, 
  HelpCircle,
  Table as TableIcon,
  TrendingUp,
  Percent,
  Sliders,
  Calculator,
  FlaskConical,
  Atom,
  RefreshCw
} from 'lucide-react';
import MathText from '../common/MathText';
import VariationTable from '../common/VariationTable';
import MathGraphView from '../common/MathGraphView';

export const FORMULA_TEMPLATES = [
  { id: 'chemistry', name: '🧪 Hóa Học & Nồng Độ', icon: '🧪', desc: 'CM = n/V, C%, m = n×M, Hiệu suất H%' },
  { id: 'fraction', name: '➗ Phân Số & Tính Toán', icon: '➗', desc: 'Chèn số vào tử/mẫu & tự tính kết quả' },
  { id: 'limit', name: '🎯 Giới Hạn & Đạo Hàm Số Gia', icon: '🎯', desc: 'f\'(x0) = lim Δy/Δx có tính số' },
  { id: 'sqrt', name: '📐 Căn Thức √x', icon: '📐', desc: 'Căn bậc 2 hoặc bậc n' },
  { id: 'power', name: '⚡ Lũy Thừa x^n', icon: '⚡', desc: 'Cơ số & Số mũ' },
  { id: 'integral', name: '📉 Tích Phân ∫', icon: '📉', desc: 'Cận dưới, cận trên & f(x)' },
  { id: 'system', name: '📋 Hệ Phương Trình', icon: '📋', desc: 'Hệ 2 phương trình' },
  { id: 'variation_table', name: '📊 Bảng Biến Thiên', icon: '📊', desc: 'Chuẩn SGK GDPT 2018' },
  { id: 'math_graph', name: '📈 Đồ Thị Hàm Số', icon: '📈', desc: 'Oxy & Desmos tương tác' }
];

export default function InteractiveFormulaBuilderModal({
  isOpen,
  onClose,
  onInsert,
  initialTemplate = 'chemistry'
}) {
  const [activeTab, setActiveTab] = useState(initialTemplate);

  useEffect(() => {
    if (initialTemplate) {
      setActiveTab(initialTemplate);
    }
  }, [initialTemplate]);

  // Form states for each template
  // 0. Chemistry Formulas (Chèn số vào và tự động tính toán)
  const [chemType, setChemType] = useState('cm'); // 'cm' | 'c_percent' | 'mass' | 'yield' | 'gas'
  const [chemN, setChemN] = useState('0.2'); // mol
  const [chemV, setChemV] = useState('0.5'); // Lít
  const [chemMct, setChemMct] = useState('20'); // g
  const [chemMdd, setChemMdd] = useState('200'); // g
  const [chemMolar, setChemMolar] = useState('40'); // g/mol (NaOH = 40)
  const [chemMtt, setChemMtt] = useState('18'); // g thực tế
  const [chemMlt, setChemMlt] = useState('20'); // g lý thuyết
  const [chemIncludeResult, setChemIncludeResult] = useState(true);

  // 1. Fraction
  const [fracNum, setFracNum] = useState('12');
  const [fracDen, setFracDen] = useState('4');
  const [fracAutoCalc, setFracAutoCalc] = useState(true);

  // 2. Square root / N-th root
  const [sqrtDeg, setSqrtDeg] = useState('2');
  const [sqrtExpr, setSqrtExpr] = useState('16');

  // 3. Power & Subscript
  const [powBase, setPowBase] = useState('x');
  const [powExp, setPowExp] = useState('2');
  const [powSub, setPowSub] = useState('');

  // 4. Integral
  const [intLower, setIntLower] = useState('0');
  const [intUpper, setIntUpper] = useState('1');
  const [intExpr, setIntExpr] = useState('2x + 3');
  const [intVar, setIntVar] = useState('x');

  // 5. Limit & Derivative by Increment (Đạo hàm bằng số gia)
  const [limMode, setLimMode] = useState('derivative'); // 'standard' | 'derivative'
  const [limFx, setLimFx] = useState('2x');
  const [limX0, setLimX0] = useState('3');
  const [limVar, setLimVar] = useState('x');
  const [limTo, setLimTo] = useState('x_0');
  const [limExpr, setLimExpr] = useState('\\frac{f(x) - f(x_0)}{x - x_0}');

  // 6. System of Equations
  const [sysEq1, setSysEq1] = useState('2x + 3y = 7');
  const [sysEq2, setSysEq2] = useState('x - y = 1');

  // 7. Variation Table
  const [varPreset, setVarPreset] = useState('cubic_up');
  const [varTitle, setVarTitle] = useState('Bảng biến thiên hàm số bậc ba');
  const [varX, setVarX] = useState('-\\infty | -1 | 1 | +\\infty');
  const [varYPrime, setVarYPrime] = useState('+ | 0 | - | 0 | +');
  const [varY, setVarY] = useState('-\\infty | 4 | 0 | +\\infty');
  const [varDir, setVarDir] = useState('up | down | up');

  // Preset picker for Variation Table
  const handleSelectVarPreset = (presetKey) => {
    setVarPreset(presetKey);
    if (presetKey === 'cubic_up') {
      setVarTitle('Bảng biến thiên hàm số bậc ba (a > 0)');
      setVarX('-\\infty | -1 | 1 | +\\infty');
      setVarYPrime('+ | 0 | - | 0 | +');
      setVarY('-\\infty | 4 | 0 | +\\infty');
      setVarDir('up | down | up');
    } else if (presetKey === 'cubic_down') {
      setVarTitle('Bảng biến thiên hàm số bậc ba (a < 0)');
      setVarX('-\\infty | -1 | 1 | +\\infty');
      setVarYPrime('- | 0 | + | 0 | -');
      setVarY('+\\infty | 0 | 4 | -\\infty');
      setVarDir('down | up | down');
    } else if (presetKey === 'rational') {
      setVarTitle('Bảng biến thiên hàm số phân thức y = (2x+1)/(x-1)');
      setVarX('-\\infty | 1 | +\\infty');
      setVarYPrime('- | || | -');
      setVarY('2 | -\\infty | +\\infty | 2');
      setVarDir('down | down');
    } else if (presetKey === 'quartic') {
      setVarTitle('Bảng biến thiên hàm số bậc bốn trùng phương');
      setVarX('-\\infty | -1 | 0 | 1 | +\\infty');
      setVarYPrime('- | 0 | + | 0 | - | 0 | +');
      setVarY('+\\infty | -2 | 1 | -2 | +\\infty');
      setVarDir('down | up | down | up');
    }
  };

  // 8. Math Graph
  const [graphType, setGraphType] = useState('cubic');
  const [graphFormula, setGraphFormula] = useState('y = x^3 - 3x + 1');
  const [graphExtrema, setGraphExtrema] = useState('cd=-1,3 | ct=1,-1');

  // Chemistry Evaluation Logic
  const calculateChemistry = () => {
    switch (chemType) {
      case 'cm': {
        const n = parseFloat(chemN) || 0;
        const v = parseFloat(chemV) || 1;
        const res = v !== 0 ? (n / v).toFixed(2).replace(/\.00$/, '') : '0';
        return {
          formula: `C_M = \\frac{n}{V}`,
          substituted: `C_M = \\frac{${chemN}}{${chemV}}`,
          result: `${res}\\text{ M}`,
          full: `C_M = \\frac{n}{V} = \\frac{${chemN}}{${chemV}} = ${res}\\text{ M}`
        };
      }
      case 'c_percent': {
        const mct = parseFloat(chemMct) || 0;
        const mdd = parseFloat(chemMdd) || 1;
        const res = mdd !== 0 ? ((mct / mdd) * 100).toFixed(2).replace(/\.00$/, '') : '0';
        return {
          formula: `C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%`,
          substituted: `C\\% = \\frac{${chemMct}}{${chemMdd}} \\times 100\\%`,
          result: `${res}\\%`,
          full: `C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\% = \\frac{${chemMct}}{${chemMdd}} \\times 100\\% = ${res}\\%`
        };
      }
      case 'mass': {
        const n = parseFloat(chemN) || 0;
        const M = parseFloat(chemMolar) || 0;
        const res = (n * M).toFixed(2).replace(/\.00$/, '');
        return {
          formula: `m = n \\times M`,
          substituted: `m = ${chemN} \\times ${chemMolar}`,
          result: `${res}\\text{ g}`,
          full: `m = n \\times M = ${chemN} \\times ${chemMolar} = ${res}\\text{ gam}`
        };
      }
      case 'yield': {
        const mtt = parseFloat(chemMtt) || 0;
        const mlt = parseFloat(chemMlt) || 1;
        const res = mlt !== 0 ? ((mtt / mlt) * 100).toFixed(2).replace(/\.00$/, '') : '0';
        return {
          formula: `H = \\frac{m_{tt}}{m_{lt}} \\times 100\\%`,
          substituted: `H = \\frac{${chemMtt}}{${chemMlt}} \\times 100\\%`,
          result: `${res}\\%`,
          full: `H = \\frac{m_{tt}}{m_{lt}} \\times 100\\% = \\frac{${chemMtt}}{${chemMlt}} \\times 100\\% = ${res}\\%`
        };
      }
      default:
        return { formula: '', substituted: '', result: '', full: '' };
    }
  };

  // Fraction Evaluation Logic
  const calculateFraction = () => {
    const num = parseFloat(fracNum);
    const den = parseFloat(fracDen);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      const val = num / den;
      const formatted = Number.isInteger(val) ? `${val}` : `${val.toFixed(2).replace(/\.00$/, '')}`;
      return { isValid: true, val: formatted };
    }
    return { isValid: false, val: '' };
  };

  if (!isOpen) return null;

  // Build the snippet to insert based on activeTab
  const generateSnippet = () => {
    switch (activeTab) {
      case 'chemistry': {
        const chem = calculateChemistry();
        return chemIncludeResult ? chem.full : chem.substituted;
      }
      case 'fraction': {
        const fracCalc = calculateFraction();
        if (fracAutoCalc && fracCalc.isValid) {
          return `\\frac{${fracNum.trim() || 'a'}}{${fracDen.trim() || 'b'}} = ${fracCalc.val}`;
        }
        return `\\frac{${fracNum.trim() || 'a'}}{${fracDen.trim() || 'b'}}`;
      }
      case 'sqrt':
        return sqrtDeg.trim() === '2' || !sqrtDeg.trim()
          ? `\\sqrt{${sqrtExpr.trim() || 'x'}}`
          : `\\sqrt[${sqrtDeg.trim()}]{${sqrtExpr.trim() || 'x'}}`;
      case 'power': {
        let res = powBase.trim() || 'x';
        if (powSub.trim()) res += `_{${powSub.trim()}}`;
        if (powExp.trim()) res += `^{${powExp.trim()}}`;
        return res;
      }
      case 'integral':
        return `\\int_{${intLower.trim() || 'a'}}^{${intUpper.trim() || 'b'}} ${intExpr.trim() || 'f(x)'} d${intVar.trim() || 'x'}`;
      case 'limit': {
        if (limMode === 'derivative') {
          // Mẫu đạo hàm bằng số gia chuẩn SGK: f'(x0) = lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x}
          return `f'(${limX0}) = \\lim_{\\Delta x \\to 0}\\frac{f(${limX0} + \\Delta x) - f(${limX0})}{\\Delta x}`;
        }
        return `\\lim_{${limVar.trim() || 'x'} \\to ${limTo.trim() || 'x_0'}} ${limExpr.trim() || 'f(x)'}`;
      }
      case 'system':
        return `\\begin{cases} ${sysEq1.trim() || 'ax + by = c'} \\\\ ${sysEq2.trim() || 'dx + ey = f'} \\end{cases}`;
      case 'variation_table':
        return `\n\n[VARIATION_TABLE]\ntitle: ${varTitle.trim()}\nx: ${varX.trim()}\ny': ${varYPrime.trim()}\ny: ${varY.trim()}\ndir: ${varDir.trim()}\n[/VARIATION_TABLE]\n\n`;
      case 'math_graph':
        return `\n\n[GRAPH: type=${graphType} | formula=${graphFormula.trim()} | ${graphExtrema.trim()}]\n\n`;
      default:
        return '';
    }
  };

  const handleConfirm = () => {
    const snippet = generateSnippet();
    if (snippet) {
      // If it's variation table or graph, insert directly without $
      if (activeTab === 'variation_table' || activeTab === 'math_graph') {
        onInsert(null, snippet, true); // true = raw block
      } else {
        onInsert(null, snippet, false); // false = math expression
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && e.ctrlKey) handleConfirm();
        }}
      >
        {/* Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">
                Soạn Thảo Công Thức Trực Quan (Click-to-Fill)
              </h3>
              <p className="text-[11px] text-indigo-200">
                Điền số và chữ vào các ô tương ứng mà không cần phải nhớ hay gõ mã LaTeX.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div className="flex items-center gap-1.5 p-2 px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-thin">
          {FORMULA_TEMPLATES.map((tmpl) => {
            const isActive = activeTab === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setActiveTab(tmpl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-400/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{tmpl.icon}</span>
                <span>{tmpl.name}</span>
              </button>
            );
          })}
        </div>

        {/* Body & Live Preview */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 0: HÓA HỌC THỰC TẾ & TÍNH TOÁN */}
          {activeTab === 'chemistry' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80">
                <span className="text-[11px] font-bold text-teal-950 block mb-2 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                  <span>Chọn công thức hóa học cần chèn số và tính toán:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChemType('cm')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                      chemType === 'cm'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span>🧪 Nồng độ mol</span>
                    <span className="text-[10px] opacity-80 font-mono">CM = n / V</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('c_percent')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                      chemType === 'c_percent'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span>💧 Nồng độ %</span>
                    <span className="text-[10px] opacity-80 font-mono">C% = (mct/mdd)×100</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('mass')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                      chemType === 'mass'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span>⚖️ Khối lượng chất</span>
                    <span className="text-[10px] opacity-80 font-mono">m = n × M</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('yield')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col ${
                      chemType === 'yield'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    <span>⚡ Hiệu suất H%</span>
                    <span className="text-[10px] opacity-80 font-mono">H = (mtt/mlt)×100</span>
                  </button>
                </div>
              </div>

              {/* Các ô chèn số tương ứng theo công thức hóa học */}
              {chemType === 'cm' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Số mol chất tan (n - mol):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemN}
                      onChange={(e) => setChemN(e.target.value)}
                      placeholder="Ví dụ: 0.2"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Thể tích dung dịch (V - Lít):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemV}
                      onChange={(e) => setChemV(e.target.value)}
                      placeholder="Ví dụ: 0.5"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {chemType === 'c_percent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng chất tan (mct - gam):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemMct}
                      onChange={(e) => setChemMct(e.target.value)}
                      placeholder="Ví dụ: 20"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng dung dịch (mdd - gam):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemMdd}
                      onChange={(e) => setChemMdd(e.target.value)}
                      placeholder="Ví dụ: 200"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {chemType === 'mass' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Số mol (n - mol):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemN}
                      onChange={(e) => setChemN(e.target.value)}
                      placeholder="Ví dụ: 0.5"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng mol (M - g/mol):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemMolar}
                      onChange={(e) => setChemMolar(e.target.value)}
                      placeholder="Ví dụ: 40 (NaOH) hoặc 98 (H2SO4)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {chemType === 'yield' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng thực tế thu được (mtt - gam):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemMtt}
                      onChange={(e) => setChemMtt(e.target.value)}
                      placeholder="Ví dụ: 18"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng theo lý thuyết (mlt - gam):</label>
                    <input
                      type="number"
                      step="any"
                      value={chemMlt}
                      onChange={(e) => setChemMlt(e.target.value)}
                      placeholder="Ví dụ: 20"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tùy chọn tính toán */}
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-teal-600" />
                  <span>Kết quả tính toán tự động: <strong>{calculateChemistry().result}</strong></span>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-teal-950">
                  <input
                    type="checkbox"
                    checked={chemIncludeResult}
                    onChange={(e) => setChemIncludeResult(e.target.checked)}
                    className="w-3.5 h-3.5 text-teal-600 rounded"
                  />
                  <span>Chèn cả phép tính và kết quả</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 1: PHÂN SỐ & TÍNH TOÁN */}
          {activeTab === 'fraction' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Tử số (Phía trên):</span>
                  </label>
                  <input
                    type="text"
                    value={fracNum}
                    onChange={(e) => setFracNum(e.target.value)}
                    placeholder="Ví dụ: 12 hoặc 2x^2 - 3x + 1"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>Mẫu số (Phía dưới):</span>
                  </label>
                  <input
                    type="text"
                    value={fracDen}
                    onChange={(e) => setFracDen(e.target.value)}
                    placeholder="Ví dụ: 4 hoặc x - 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tự động tính toán phân số */}
              {calculateFraction().isValid && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Kết quả rút gọn / chia: <strong>{calculateFraction().val}</strong></span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-indigo-950">
                    <input
                      type="checkbox"
                      checked={fracAutoCalc}
                      onChange={(e) => setFracAutoCalc(e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded"
                    />
                    <span>Chèn kèm đáp số (= {calculateFraction().val})</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CĂN THỨC */}
          {activeTab === 'sqrt' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Bậc căn (n):</label>
                  <input
                    type="text"
                    value={sqrtDeg}
                    onChange={(e) => setSqrtDeg(e.target.value)}
                    placeholder="2 (Căn bậc 2) hoặc 3, 4..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Để trống hoặc điền 2 cho căn bậc 2</span>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Biểu thức bên trong căn:</label>
                  <input
                    type="text"
                    value={sqrtExpr}
                    onChange={(e) => setSqrtExpr(e.target.value)}
                    placeholder="Ví dụ: x^2 + 5x - 6"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LŨY THỪA & CHỈ SỐ */}
          {activeTab === 'power' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cơ số:</label>
                  <input
                    type="text"
                    value={powBase}
                    onChange={(e) => setPowBase(e.target.value)}
                    placeholder="Ví dụ: x hoặc (2x+1)"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số mũ (Lũy thừa trên):</label>
                  <input
                    type="text"
                    value={powExp}
                    onChange={(e) => setPowExp(e.target.value)}
                    placeholder="Ví dụ: n + 1 hoặc 3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chỉ số dưới (Tùy chọn):</label>
                  <input
                    type="text"
                    value={powSub}
                    onChange={(e) => setPowSub(e.target.value)}
                    placeholder="Ví dụ: 0 cho x_0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TÍCH PHÂN */}
          {activeTab === 'integral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cận dưới (a):</label>
                  <input
                    type="text"
                    value={intLower}
                    onChange={(e) => setIntLower(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cận trên (b):</label>
                  <input
                    type="text"
                    value={intUpper}
                    onChange={(e) => setIntUpper(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Hàm f(x):</label>
                  <input
                    type="text"
                    value={intExpr}
                    onChange={(e) => setIntExpr(e.target.value)}
                    placeholder="2x + 3"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GIỚI HẠN & ĐẠO HÀM SỐ GIA */}
          {activeTab === 'limit' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setLimMode('derivative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    limMode === 'derivative'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎯 Đạo hàm bằng số gia f'(x0)
                </button>
                <button
                  type="button"
                  onClick={() => setLimMode('standard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    limMode === 'standard'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📐 Giới hạn tổng quát lim f(x)
                </button>
              </div>

              {limMode === 'derivative' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Điểm cần tính đạo hàm (x0):</label>
                      <input
                        type="text"
                        value={limX0}
                        onChange={(e) => setLimX0(e.target.value)}
                        placeholder="Ví dụ: 3"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Hàm số f(x):</label>
                      <input
                        type="text"
                        value={limFx}
                        onChange={(e) => setLimFx(e.target.value)}
                        placeholder="Ví dụ: 2x hoặc x^2"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    💡 <strong>Công thức số gia SGK:</strong> Số gia đối số {'$\\Delta x = x - x_0$'}, số gia hàm số {'$\\Delta y = f(x_0 + \\Delta x) - f(x_0)$'}. Khi đó đạo hàm là {'$f\'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{\\Delta y}{\\Delta x}$'}.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Biến tiến tới (x → x0):</label>
                    <input
                      type="text"
                      value={limTo}
                      onChange={(e) => setLimTo(e.target.value)}
                      placeholder="x_0 hoặc 0 hoặc +\\infty"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Biểu thức f(x):</label>
                    <input
                      type="text"
                      value={limExpr}
                      onChange={(e) => setLimExpr(e.target.value)}
                      placeholder="\\frac{x^2 - 1}{x - 1}"
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HỆ PHƯƠNG TRÌNH */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Phương trình 1:</label>
                <input
                  type="text"
                  value={sysEq1}
                  onChange={(e) => setSysEq1(e.target.value)}
                  placeholder="2x + 3y = 7"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Phương trình 2:</label>
                <input
                  type="text"
                  value={sysEq2}
                  onChange={(e) => setSysEq2(e.target.value)}
                  placeholder="x - y = 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 7: BẢNG BIẾN THIÊN */}
          {activeTab === 'variation_table' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200/80">
                <span className="text-[11px] font-bold text-indigo-950 block mb-2">
                  ⚡ Chọn nhanh mẫu bảng biến thiên phổ biến:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectVarPreset('cubic_up')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      varPreset === 'cubic_up'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    📈 Hàm bậc ba (a &gt; 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVarPreset('cubic_down')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      varPreset === 'cubic_down'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    📉 Hàm bậc ba (a &lt; 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVarPreset('rational')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      varPreset === 'rational'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    ⚡ Hàm phân thức (x = 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVarPreset('quartic')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      varPreset === 'quartic'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    〰️ Hàm bậc 4 trùng phương
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dòng x (phân cách bằng |):</label>
                  <input
                    type="text"
                    value={varX}
                    onChange={(e) => setVarX(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dòng y' (+, -, 0, ||):</label>
                  <input
                    type="text"
                    value={varYPrime}
                    onChange={(e) => setVarYPrime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dòng y (giá trị đỉnh/đáy):</label>
                  <input
                    type="text"
                    value={varY}
                    onChange={(e) => setVarY(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mũi tên (up | down):</label>
                  <input
                    type="text"
                    value={varDir}
                    onChange={(e) => setVarDir(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ĐỒ THỊ HÀM SỐ */}
          {activeTab === 'math_graph' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dạng hàm:</label>
                  <select
                    value={graphType}
                    onChange={(e) => setGraphType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="cubic">Hàm bậc ba (Cubic)</option>
                    <option value="quartic">Hàm bậc bốn trùng phương</option>
                    <option value="rational">Hàm phân thức bậc 1 / bậc 1</option>
                    <option value="quadratic">Parabol bậc hai</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Phương trình hàm số:</label>
                  <input
                    type="text"
                    value={graphFormula}
                    onChange={(e) => setGraphFormula(e.target.value)}
                    placeholder="y = x^3 - 3x + 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Điểm cực trị dóng nét đứt (cd=x,y | ct=x,y):</label>
                <input
                  type="text"
                  value={graphExtrema}
                  onChange={(e) => setGraphExtrema(e.target.value)}
                  placeholder="cd=-1,3 | ct=1,-1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* LIVE PREVIEW BOX */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>👀 Khung Xem Trước Trực Quan Học Sinh Thấy (Live KaTeX Preview)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeTab === 'variation_table' ? 'Thẻ Bảng Biến Thiên' : activeTab === 'math_graph' ? 'Thẻ Đồ Thị Hàm Số' : `$${generateSnippet()}$`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center min-h-[70px] overflow-x-auto text-base">
              {activeTab === 'variation_table' ? (
                <VariationTable
                  data={{
                    title: varTitle,
                    xValues: varX.split('|').map(s => s.trim()),
                    yPrime: varYPrime.split('|').map(s => s.trim()),
                    yValues: {
                      values: varY.split('|').map(s => s.trim()),
                      directions: varDir.split('|').map(s => s.trim())
                    }
                  }}
                  className="w-full max-w-lg my-0"
                />
              ) : activeTab === 'math_graph' ? (
                <MathGraphView
                  data={{
                    type: graphType,
                    formula: graphFormula,
                    title: 'Đồ thị hàm số minh họa'
                  }}
                  className="w-full max-w-md my-0"
                />
              ) : (
                <div className="text-indigo-950 font-serif text-lg">
                  <MathText text={`$$${generateSnippet()}$$`} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕ Hủy bỏ (Esc)
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chèn Vào Bài Giảng (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
