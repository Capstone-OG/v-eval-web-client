import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Table2,
  LineChart,
  Divide,
  Activity,
  SquareCode,
  Binary,
  Sigma,
  Layers,
  FlaskConical,
  Calculator,
  Sliders,
  Info,
  Zap,
  ArrowRight,
  CornerDownRight,
  CheckCircle2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import MathText from '../common/MathText';
import VariationTable from '../common/VariationTable';
import MathGraphView from '../common/MathGraphView';

export const FORMULA_TEMPLATES = [
  { id: 'variation_table', category: 'math', name: 'Bảng biến thiên', icon: '', iconComponent: Table2, desc: 'Cực trị, tiệm cận, chiều biến thiên', color: 'emerald' },
  { id: 'fraction', category: 'math', name: 'Phân số', icon: '', iconComponent: Divide, desc: 'Tử, mẫu & rút gọn', color: 'indigo' },
  { id: 'limit', category: 'math', name: 'Giới hạn & Đạo hàm', icon: '', iconComponent: Activity, desc: "f'(x₀), lim f(x)", color: 'rose' },
  { id: 'sqrt', category: 'math', name: 'Căn thức', icon: '', iconComponent: SquareCode, desc: 'Căn bậc 2, bậc n', color: 'cyan' },
  { id: 'power', category: 'math', name: 'Lũy thừa & Chỉ số', icon: '', iconComponent: Binary, desc: 'Số mũ xⁿ, chỉ số x₀', color: 'violet' },
  { id: 'integral', category: 'math', name: 'Tích phân', icon: '', iconComponent: Sigma, desc: 'Cận a → b, f(x)dx', color: 'blue' },
  { id: 'system', category: 'math', name: 'Hệ phương trình', icon: '', iconComponent: Layers, desc: 'Hệ 2 phương trình', color: 'sky' },
  { id: 'math_graph', category: 'math', name: 'Đồ thị Oxy', icon: '', iconComponent: LineChart, desc: 'Hàm số & cực trị', color: 'amber' },
  { id: 'chemistry', category: 'stem', name: 'Hóa học & Nồng độ', icon: '', iconComponent: FlaskConical, desc: 'CM, C%, m, H%', color: 'teal' }
];

export default function InteractiveFormulaBuilderModal({
  isOpen,
  onClose,
  onInsert,
  initialTemplate = 'variation_table',
  initialTemplateId = null,
  targetField = null
}) {
  const [activeTab, setActiveTab] = useState(initialTemplateId || initialTemplate || 'variation_table');

  useEffect(() => {
    const nextTab = initialTemplateId || initialTemplate;
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, [initialTemplate, initialTemplateId]);

  // ================= FORM STATES FOR EACH TEMPLATE =================
  // 0. Chemistry Formulas (Chèn số vào và tự động tính toán)
  const [chemType, setChemType] = useState('cm'); // 'cm' | 'c_percent' | 'mass' | 'yield'
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

  // 5. Limit & Derivative by Increment (Đạo hàm bằng số gia & giới hạn)
  const [limMode, setLimMode] = useState('derivative'); // 'standard' | 'derivative'
  const [limFx, setLimFx] = useState('2x');
  const [limX0, setLimX0] = useState('3');
  const [limVar, setLimVar] = useState('x');
  const [limTo, setLimTo] = useState('x₀');
  const [limExprType, setLimExprType] = useState('fraction'); // 'fraction' | 'single'
  const [limNum, setLimNum] = useState('f(x) - f(x₀)');
  const [limDen, setLimDen] = useState('x - x₀');
  const [limExpr, setLimExpr] = useState('2x + 1');

  // 6. System of Equations
  const [sysEq1, setSysEq1] = useState('2x + 3y = 7');
  const [sysEq2, setSysEq2] = useState('x - y = 1');

  // 7. Variation Table
  const [varPreset, setVarPreset] = useState('cubic_up');
  const [varTitle, setVarTitle] = useState('Bảng biến thiên hàm số bậc ba (a > 0)');
  const [varX, setVarX] = useState('-\\infty | -1 | 1 | +\\infty');
  const [varYPrime, setVarYPrime] = useState('+ | 0 | - | 0 | +');
  const [varY, setVarY] = useState('-\\infty | 4 | 0 | +\\infty');
  const [varDir, setVarDir] = useState('up | down | up');

  // 8. Math Graph
  const [graphType, setGraphType] = useState('cubic');
  const [graphFormula, setGraphFormula] = useState('y = x^3 - 3x + 1');
  const [graphExtrema, setGraphExtrema] = useState('cd=-1,3 | ct=1,-1');

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
          const x0Clean = limX0.trim() === 'x₀' ? 'x_0' : (limX0.trim() || 'x_0');
          return `f'(${x0Clean}) = \\lim_{\\Delta x \\to 0}\\frac{f(${x0Clean} + \\Delta x) - f(${x0Clean})}{\\Delta x}`;
        }
        let expr = '';
        if (limExprType === 'fraction') {
          let num = limNum.trim() || 'P(x)';
          let den = limDen.trim() || 'Q(x)';
          num = num.replace(/x₀/g, 'x_0').replace(/f\(x₀\)/g, 'f(x_0)').replace(/x²/g, 'x^2').replace(/\bsin\b/g, '\\sin ').replace(/\bcos\b/g, '\\cos ');
          den = den.replace(/x₀/g, 'x_0').replace(/x²/g, 'x^2').replace(/\bsin\b/g, '\\sin ').replace(/\bcos\b/g, '\\cos ');
          expr = `\\frac{${num}}{${den}}`;
        } else {
          let single = limExpr.trim() || 'f(x)';
          single = single.replace(/x₀/g, 'x_0').replace(/x²/g, 'x^2').replace(/\bsin\b/g, '\\sin ').replace(/\bcos\b/g, '\\cos ');
          expr = single;
        }
        let toVal = limTo.trim() || 'x_0';
        if (toVal === 'x₀' || toVal === 'x_0') toVal = 'x_0';
        else if (toVal === '+∞' || toVal === '+oo' || toVal === '+vô cùng' || toVal === '+\\infty') toVal = '+\\infty';
        else if (toVal === '-∞' || toVal === '-oo' || toVal === '-vô cùng' || toVal === '-\\infty') toVal = '-\\infty';
        else if (toVal === '∞' || toVal === 'oo' || toVal === 'vô cùng' || toVal === '\\infty') toVal = '\\infty';
        return `\\lim_{${limVar.trim() || 'x'} \\to ${toVal}} ${expr}`;
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
      if (activeTab === 'variation_table' || activeTab === 'math_graph') {
        onInsert(targetField, snippet, true); // raw block
      } else {
        onInsert(targetField, snippet, false); // math expression
      }
    }
    onClose();
  };

  const currentTemplate = FORMULA_TEMPLATES.find(t => t.id === activeTab) || FORMULA_TEMPLATES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade">
      <div 
        className="w-full max-w-5xl h-[88vh] max-h-[820px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col text-slate-800"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && e.ctrlKey) handleConfirm();
        }}
      >
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="h-14 px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Công thức & Bảng biến thiên
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 flex overflow-hidden">

          {/* CỘT TRÁI */}
          <div className="w-64 bg-slate-50/80 border-r border-slate-200/80 flex flex-col shrink-0 overflow-y-auto p-3 space-y-4">

            {/* NHÓM 1: TOÁN HỌC */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3 h-3 text-indigo-500" />
                <span>Toán học</span>
              </div>
              <div className="space-y-1">
                {FORMULA_TEMPLATES.filter(t => t.category === 'math').map((tmpl) => {
                  const isActive = activeTab === tmpl.id;
                  const Icon = tmpl.iconComponent;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setActiveTab(tmpl.id)}
                      className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer group ${
                        isActive
                          ? 'bg-white text-indigo-950 font-black shadow-xs border border-indigo-200/90 ring-2 ring-indigo-500/15'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/80'
                      }`}>
                        {Icon ? <Icon className="w-3.5 h-3.5" /> : <span>{tmpl.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">{tmpl.name}</div>
                        <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{tmpl.desc}</div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NHÓM 2: HÓA HỌC & STEM */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3 h-3 text-teal-600" />
                <span>Hóa học & STEM</span>
              </div>
              <div className="space-y-1">
                {FORMULA_TEMPLATES.filter(t => t.category === 'stem').map((tmpl) => {
                  const isActive = activeTab === tmpl.id;
                  const Icon = tmpl.iconComponent;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setActiveTab(tmpl.id)}
                      className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer group ${
                        isActive
                          ? 'bg-white text-teal-950 font-black shadow-xs border border-teal-200/90 ring-2 ring-teal-500/15'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/80'
                      }`}>
                        {Icon ? <Icon className="w-3.5 h-3.5" /> : <span>{tmpl.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">{tmpl.name}</div>
                        <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{tmpl.desc}</div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white p-5 space-y-5">

            {/* TAB 0: HÓA HỌC */}
            {activeTab === 'chemistry' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setChemType('cm')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                      chemType === 'cm'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                    }`}
                  >
                    <span className="font-extrabold">Nồng độ mol</span>
                    <span className="text-[10.5px] opacity-80 font-mono mt-0.5">CM = n / V</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('c_percent')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                      chemType === 'c_percent'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                    }`}
                  >
                    <span className="font-extrabold">Nồng độ %</span>
                    <span className="text-[10.5px] opacity-80 font-mono mt-0.5">C% = (mct/mdd)×100</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('mass')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                      chemType === 'mass'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                    }`}
                  >
                    <span className="font-extrabold">Khối lượng</span>
                    <span className="text-[10.5px] opacity-80 font-mono mt-0.5">m = n × M</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChemType('yield')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                      chemType === 'yield'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                    }`}
                  >
                    <span className="font-extrabold">Hiệu suất H%</span>
                    <span className="text-[10.5px] opacity-80 font-mono mt-0.5">H = (mtt/mlt)×100</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                  {chemType === 'cm' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Số mol (n)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemN}
                            onChange={(e) => setChemN(e.target.value)}
                            placeholder="0.2"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">mol</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Thể tích (V)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemV}
                            onChange={(e) => setChemV(e.target.value)}
                            placeholder="0.5"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">L</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'c_percent' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Chất tan (mct)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMct}
                            onChange={(e) => setChemMct(e.target.value)}
                            placeholder="20"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">g</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Dung dịch (mdd)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMdd}
                            onChange={(e) => setChemMdd(e.target.value)}
                            placeholder="200"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">g</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'mass' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Số mol (n)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemN}
                            onChange={(e) => setChemN(e.target.value)}
                            placeholder="0.5"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">mol</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng mol (M)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMolar}
                            onChange={(e) => setChemMolar(e.target.value)}
                            placeholder="40"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">g/mol</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'yield' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Thực tế (mtt)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMtt}
                            onChange={(e) => setChemMtt(e.target.value)}
                            placeholder="18"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">g</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Lý thuyết (mlt)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMlt}
                            onChange={(e) => setChemMlt(e.target.value)}
                            placeholder="20"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">g</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-teal-950 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-teal-600" />
                      <span>Kết quả: <strong className="text-emerald-700">{calculateChemistry().result}</strong></span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950 select-none">
                      <input
                        type="checkbox"
                        checked={chemIncludeResult}
                        onChange={(e) => setChemIncludeResult(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span>Kèm kết quả</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: PHÂN SỐ */}
            {activeTab === 'fraction' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => { setFracNum('1'); setFracDen('2'); }} className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 cursor-pointer">1/2</button>
                  <button type="button" onClick={() => { setFracNum('3'); setFracDen('4'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">3/4</button>
                  <button type="button" onClick={() => { setFracNum('12'); setFracDen('4'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">12/4</button>
                  <button type="button" onClick={() => { setFracNum('2x + 1'); setFracDen('x - 1'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">(2x+1)/(x-1)</button>
                  <button type="button" onClick={() => { setFracNum('x^2 - 4'); setFracDen('x - 2'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">(x²-4)/(x-2)</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tử số</label>
                    <input
                      type="text"
                      value={fracNum}
                      onChange={(e) => setFracNum(e.target.value)}
                      placeholder="12 hoặc 2x + 1"
                      autoFocus
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mẫu số</label>
                    <input
                      type="text"
                      value={fracDen}
                      onChange={(e) => setFracDen(e.target.value)}
                      placeholder="4 hoặc x - 1"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {calculateFraction().isValid && (
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      <span>Kết quả: <strong className="text-indigo-700">{calculateFraction().val}</strong></span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-950 select-none">
                      <input
                        type="checkbox"
                        checked={fracAutoCalc}
                        onChange={(e) => setFracAutoCalc(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>Kèm đáp số (= {calculateFraction().val})</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CĂN THỨC */}
            {activeTab === 'sqrt' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Bậc căn (n)</label>
                  <input
                    type="text"
                    value={sqrtDeg}
                    onChange={(e) => setSqrtDeg(e.target.value)}
                    placeholder="2"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Biểu thức</label>
                  <input
                    type="text"
                    value={sqrtExpr}
                    onChange={(e) => setSqrtExpr(e.target.value)}
                    placeholder="x^2 + 5x - 6"
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: LŨY THỪA */}
            {activeTab === 'power' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cơ số</label>
                  <input
                    type="text"
                    value={powBase}
                    onChange={(e) => setPowBase(e.target.value)}
                    placeholder="x"
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số mũ</label>
                  <input
                    type="text"
                    value={powExp}
                    onChange={(e) => setPowExp(e.target.value)}
                    placeholder="n + 1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chỉ số dưới</label>
                  <input
                    type="text"
                    value={powSub}
                    onChange={(e) => setPowSub(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: TÍCH PHÂN */}
            {activeTab === 'integral' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cận dưới (a)</label>
                  <input
                    type="text"
                    value={intLower}
                    onChange={(e) => setIntLower(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cận trên (b)</label>
                  <input
                    type="text"
                    value={intUpper}
                    onChange={(e) => setIntUpper(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Hàm f(x)</label>
                  <input
                    type="text"
                    value={intExpr}
                    onChange={(e) => setIntExpr(e.target.value)}
                    placeholder="2x + 3"
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: GIỚI HẠN & ĐẠO HÀM */}
            {activeTab === 'limit' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLimMode('derivative')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      limMode === 'derivative'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Đạo hàm f'(x₀)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLimMode('standard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      limMode === 'standard'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Giới hạn lim f(x)
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                  {limMode === 'derivative' ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => { setLimX0('3'); setLimFx('2x'); }} className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 cursor-pointer">f'(3), f(x) = 2x</button>
                        <button type="button" onClick={() => { setLimX0('1'); setLimFx('x²'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">f'(1), f(x) = x²</button>
                        <button type="button" onClick={() => { setLimX0('x₀'); setLimFx('f(x)'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">f'(x₀) tổng quát</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Điểm x₀</label>
                          <input
                            type="text"
                            value={limX0}
                            onChange={(e) => setLimX0(e.target.value)}
                            placeholder="3"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Hàm f(x)</label>
                          <input
                            type="text"
                            value={limFx}
                            onChange={(e) => setLimFx(e.target.value)}
                            placeholder="2x"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => { setLimVar('x'); setLimTo('x₀'); setLimExprType('fraction'); setLimNum('f(x) - f(x₀)'); setLimDen('x - x₀'); }} className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 cursor-pointer">f'(x₀)</button>
                        <button type="button" onClick={() => { setLimVar('x'); setLimTo('0'); setLimExprType('fraction'); setLimNum('sin(x)'); setLimDen('x'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">sin(x)/x</button>
                        <button type="button" onClick={() => { setLimVar('x'); setLimTo('+∞'); setLimExprType('fraction'); setLimNum('2x + 1'); setLimDen('x - 3'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">Phân thức</button>
                        <button type="button" onClick={() => { setLimVar('x'); setLimTo('1'); setLimExprType('fraction'); setLimNum('x² - 1'); setLimDen('x - 1'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">Vô định 0/0</button>
                        <button type="button" onClick={() => { setLimVar('n'); setLimTo('+∞'); setLimExprType('fraction'); setLimNum('1'); setLimDen('n'); }} className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer">Dãy 1/n</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Biến</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={limVar}
                              onChange={(e) => setLimVar(e.target.value)}
                              placeholder="x"
                              className="w-14 px-2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                            <span className="text-slate-400 font-bold">→</span>
                            <input
                              type="text"
                              value={limTo}
                              onChange={(e) => setLimTo(e.target.value)}
                              placeholder="x₀"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">Biểu thức</label>
                            <div className="flex items-center gap-1 text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => setLimExprType('fraction')}
                                className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                                  limExprType === 'fraction' ? 'bg-rose-100 text-rose-800 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Phân thức
                              </button>
                              <button
                                type="button"
                                onClick={() => setLimExprType('single')}
                                className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                                  limExprType === 'single' ? 'bg-rose-100 text-rose-800 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Đơn thức
                              </button>
                            </div>
                          </div>

                          {limExprType === 'fraction' ? (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 w-12 shrink-0">Tử</span>
                                <input
                                  type="text"
                                  value={limNum}
                                  onChange={(e) => setLimNum(e.target.value)}
                                  placeholder="f(x) - f(x₀)"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 w-12 shrink-0">Mẫu</span>
                                <input
                                  type="text"
                                  value={limDen}
                                  onChange={(e) => setLimDen(e.target.value)}
                                  placeholder="x - x₀"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={limExpr}
                              onChange={(e) => setLimExpr(e.target.value)}
                              placeholder="2x + 1"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: HỆ PHƯƠNG TRÌNH */}
            {activeTab === 'system' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phương trình 1</label>
                  <input
                    type="text"
                    value={sysEq1}
                    onChange={(e) => setSysEq1(e.target.value)}
                    placeholder="2x + 3y = 7"
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phương trình 2</label>
                  <input
                    type="text"
                    value={sysEq2}
                    onChange={(e) => setSysEq2(e.target.value)}
                    placeholder="x - y = 1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 7: BẢNG BIẾN THIÊN */}
            {activeTab === 'variation_table' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Table2 className="w-4 h-4 text-emerald-600" />
                    <span>Mẫu hàm số</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => handleSelectVarPreset('cubic_up')} className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${varPreset === 'cubic_up' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'}`}>Bậc 3 (a &gt; 0)</button>
                    <button type="button" onClick={() => handleSelectVarPreset('cubic_down')} className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${varPreset === 'cubic_down' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'}`}>Bậc 3 (a &lt; 0)</button>
                    <button type="button" onClick={() => handleSelectVarPreset('rational')} className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${varPreset === 'rational' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'}`}>Phân thức</button>
                    <button type="button" onClick={() => handleSelectVarPreset('quartic')} className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${varPreset === 'quartic' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'}`}>Trùng phương</button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 overflow-x-auto">
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
                    onChange={(_, nextObj) => {
                      if (!nextObj) return;
                      setVarTitle(nextObj.title || 'Bảng biến thiên');
                      setVarX((nextObj.xValues || []).join(' | '));
                      setVarYPrime((nextObj.yPrime || []).join(' | '));
                      setVarY((nextObj.yValues?.values || []).join(' | '));
                      setVarDir((nextObj.yValues?.directions || []).join(' | '));
                    }}
                    className="w-full my-0"
                  />
                </div>
              </div>
            )}

            {/* TAB 8: ĐỒ THỊ HÀM SỐ */}
            {activeTab === 'math_graph' && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dạng hàm</label>
                    <select
                      value={graphType}
                      onChange={(e) => setGraphType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="cubic">Bậc ba</option>
                      <option value="quartic">Trùng phương</option>
                      <option value="rational">Phân thức 1/1</option>
                      <option value="quadratic">Parabol</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Phương trình</label>
                    <input
                      type="text"
                      value={graphFormula}
                      onChange={(e) => setGraphFormula(e.target.value)}
                      placeholder="y = x^3 - 3x + 1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Điểm cực trị</label>
                  <input
                    type="text"
                    value={graphExtrema}
                    onChange={(e) => setGraphExtrema(e.target.value)}
                    placeholder="cd=-1,3 | ct=1,-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PREVIEW BOX */}
            {activeTab !== 'variation_table' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Xem trước</span>
                <div className="p-5 rounded-xl bg-white border border-slate-200 flex items-center justify-center min-h-[84px] overflow-x-auto text-base">
                  {activeTab === 'math_graph' ? (
                    <MathGraphView
                      data={{
                        type: graphType,
                        formula: graphFormula,
                        title: 'Đồ thị'
                      }}
                      className="w-full max-w-md my-0"
                    />
                  ) : (
                    <div className="text-indigo-950 font-serif text-2xl tracking-wide select-none">
                      <MathText text={`$$${generateSnippet()}$$`} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="h-14 px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Chèn công thức</span>
          </button>
        </div>
      </div>
    </div>
  );
}
