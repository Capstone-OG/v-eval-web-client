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
  { id: 'variation_table', category: 'math', name: 'Bảng Biến Thiên', icon: '📊', iconComponent: Table2, desc: 'Bảng 3 dòng vector, cực trị & tiệm cận', color: 'emerald' },
  { id: 'fraction', category: 'math', name: 'Phân Số & Tính Số', icon: '➗', iconComponent: Divide, desc: 'Tử/mẫu & tự động tính rút gọn', color: 'indigo' },
  { id: 'limit', category: 'math', name: 'Đạo Hàm Số Gia & Giới Hạn', icon: '🎯', iconComponent: Activity, desc: "f'(x0) = lim Δy/Δx chuẩn SGK", color: 'rose' },
  { id: 'sqrt', category: 'math', name: 'Căn Thức √x & Bậc n', icon: '📐', iconComponent: SquareCode, desc: 'Căn bậc 2 hoặc căn bậc n', color: 'cyan' },
  { id: 'power', category: 'math', name: 'Lũy Thừa & Chỉ Số', icon: '⚡', iconComponent: Binary, desc: 'Cơ số, số mũ xⁿ và chỉ số x₀', color: 'violet' },
  { id: 'integral', category: 'math', name: 'Tích Phân & Nguyên Hàm', icon: '📉', iconComponent: Sigma, desc: 'Cận a đến b và biểu thức f(x)dx', color: 'blue' },
  { id: 'system', category: 'math', name: 'Hệ Phương Trình', icon: '📋', iconComponent: Layers, desc: 'Hệ 2 phương trình chuẩn mực', color: 'sky' },
  { id: 'math_graph', category: 'math', name: 'Đồ Thị Hàm Số Oxy', icon: '📈', iconComponent: LineChart, desc: 'Đồ thị hàm số, dóng nét đứt cực trị', color: 'amber' },
  { id: 'chemistry', category: 'stem', name: 'Hóa Học & Nồng Độ', icon: '🧪', iconComponent: FlaskConical, desc: 'CM = n/V, C%, m = n×M, Hiệu suất H%', color: 'teal' }
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
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Studio Công Cụ Toán Học, STEM & Bảng Biến Thiên
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Chuẩn GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Biên soạn trực quan WYSIWYG, tự động tính toán số liệu và xuất công thức chuẩn xác
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY: 2-COLUMN STUDIO LAYOUT ================= */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* CỘT TRÁI: SIDEBAR ĐIỀU HƯỚNG DANH MỤC CÔNG CỤ (280px) */}
          <div className="w-72 bg-slate-50/80 border-r border-slate-200/80 flex flex-col shrink-0 overflow-y-auto p-3 space-y-4">
            
            {/* NHÓM 1: TOÁN HỌC & GIẢI TÍCH */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3 h-3 text-indigo-500" />
                <span>Toán Học & Giải Tích</span>
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
                      className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-white text-indigo-950 font-black shadow-xs border border-indigo-200/90 ring-2 ring-indigo-500/15'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/80'
                      }`}>
                        {Icon ? <Icon className="w-4 h-4" /> : <span>{tmpl.icon}</span>}
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

            {/* NHÓM 2: STEM & HÓA HỌC THỰC NGHIỆM */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3 h-3 text-teal-600" />
                <span>STEM & Hóa Học Thực Nghiệm</span>
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
                      className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-white text-teal-950 font-black shadow-xs border border-teal-200/90 ring-2 ring-teal-500/15'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-200/70 text-slate-700 group-hover:bg-slate-300/80'
                      }`}>
                        {Icon ? <Icon className="w-4 h-4" /> : <span>{tmpl.icon}</span>}
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

          {/* CỘT PHẢI: KHÔNG GIAN SOẠN THẢO CHUYÊN SÂU & LIVE PREVIEW (EXPANSIVE WORKSPACE) */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white p-6 sm:p-7 space-y-6">
            
            {/* Active Tool Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-purple-50/20 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl shrink-0">
                  {currentTemplate.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span>{currentTemplate.name}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Soạn Thảo Trực Quan
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentTemplate.desc}
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-400 italic hidden sm:block">
                Nhấp nút Chèn ở góc dưới để đưa công thức vào bài giảng
              </div>
            </div>

            {/* TAB 0: HÓA HỌC THỰC TẾ & TÍNH TOÁN */}
            {activeTab === 'chemistry' && (
              <div className="space-y-5">
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-3">
                  <span className="text-xs font-extrabold text-teal-950 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-teal-600" />
                    <span>Chọn công thức hóa học cần chèn số và tính toán:</span>
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setChemType('cm')}
                      className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                        chemType === 'cm'
                          ? 'bg-teal-600 text-white shadow-xs scale-101'
                          : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                      }`}
                    >
                      <span className="font-extrabold">🧪 Nồng độ mol</span>
                      <span className="text-[10.5px] opacity-80 font-mono mt-0.5">CM = n / V</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChemType('c_percent')}
                      className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                        chemType === 'c_percent'
                          ? 'bg-teal-600 text-white shadow-xs scale-101'
                          : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                      }`}
                    >
                      <span className="font-extrabold">💧 Nồng độ %</span>
                      <span className="text-[10.5px] opacity-80 font-mono mt-0.5">C% = (mct/mdd)×100</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChemType('mass')}
                      className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                        chemType === 'mass'
                          ? 'bg-teal-600 text-white shadow-xs scale-101'
                          : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                      }`}
                    >
                      <span className="font-extrabold">⚖️ Khối lượng chất</span>
                      <span className="text-[10.5px] opacity-80 font-mono mt-0.5">m = n × M</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChemType('yield')}
                      className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col cursor-pointer ${
                        chemType === 'yield'
                          ? 'bg-teal-600 text-white shadow-xs scale-101'
                          : 'bg-white text-teal-950 border border-teal-200/90 hover:bg-teal-50'
                      }`}
                    >
                      <span className="font-extrabold">⚡ Hiệu suất H%</span>
                      <span className="text-[10.5px] opacity-80 font-mono mt-0.5">H = (mtt/mlt)×100</span>
                    </button>
                  </div>
                </div>

                {/* Các ô chèn số tương ứng theo công thức hóa học */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  {chemType === 'cm' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Số mol chất tan (n - mol):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemN}
                            onChange={(e) => setChemN(e.target.value)}
                            placeholder="Ví dụ: 0.2"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mol</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Thể tích dung dịch (V - Lít):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemV}
                            onChange={(e) => setChemV(e.target.value)}
                            placeholder="Ví dụ: 0.5"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Lít</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'c_percent' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng chất tan (mct - gam):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMct}
                            onChange={(e) => setChemMct(e.target.value)}
                            placeholder="Ví dụ: 20"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">gam</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng dung dịch (mdd - gam):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMdd}
                            onChange={(e) => setChemMdd(e.target.value)}
                            placeholder="Ví dụ: 200"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">gam</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'mass' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Số mol (n - mol):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemN}
                            onChange={(e) => setChemN(e.target.value)}
                            placeholder="Ví dụ: 0.5"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mol</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng mol (M - g/mol):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMolar}
                            onChange={(e) => setChemMolar(e.target.value)}
                            placeholder="Ví dụ: 40 (NaOH) hoặc 98 (H2SO4)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">g/mol</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {chemType === 'yield' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng thực tế thu được (mtt - gam):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMtt}
                            onChange={(e) => setChemMtt(e.target.value)}
                            placeholder="Ví dụ: 18"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">gam</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Khối lượng theo lý thuyết (mlt - gam):</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={chemMlt}
                            onChange={(e) => setChemMlt(e.target.value)}
                            placeholder="Ví dụ: 20"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">gam</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kết quả tự động */}
                  <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-teal-950 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-teal-600" />
                      <span>Kết quả tính toán tự động: <strong className="text-emerald-700 text-sm font-extrabold">{calculateChemistry().result}</strong></span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950 select-none">
                      <input
                        type="checkbox"
                        checked={chemIncludeResult}
                        onChange={(e) => setChemIncludeResult(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span>Chèn cả phép tính và kết quả</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: PHÂN SỐ & TÍNH TOÁN */}
            {activeTab === 'fraction' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  {/* Presets nạp mẫu phân số 1-click */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Mẫu phân số thông dụng (Nhấp để nạp số vào ô):</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setFracNum('1'); setFracDen('2'); }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition-colors cursor-pointer"
                      >
                        1/2 (Một nửa)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFracNum('3'); setFracDen('4'); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        3/4 (Ba phần tư)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFracNum('12'); setFracDen('4'); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        12/4 = 3 (Số chẵn)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFracNum('2x + 1'); setFracDen('x - 1'); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        (2x+1)/(x-1) (Đại số)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFracNum('x^2 - 4'); setFracDen('x - 2'); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                      >
                        (x²-4)/(x-2)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">1</span>
                        <span>Tử số (Nhập số hoặc biểu thức phía trên):</span>
                      </label>
                      <input
                        type="text"
                        value={fracNum}
                        onChange={(e) => setFracNum(e.target.value)}
                        placeholder="Ví dụ: 12 hoặc 2x + 1"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">2</span>
                        <span>Mẫu số (Nhập số hoặc biểu thức phía dưới):</span>
                      </label>
                      <input
                        type="text"
                        value={fracDen}
                        onChange={(e) => setFracDen(e.target.value)}
                        placeholder="Ví dụ: 4 hoặc x - 1"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {calculateFraction().isValid && (
                    <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-950 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-indigo-600" />
                        <span>Kết quả rút gọn tự động: <strong className="text-indigo-700 text-sm font-extrabold">{calculateFraction().val}</strong></span>
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-950 select-none">
                        <input
                          type="checkbox"
                          checked={fracAutoCalc}
                          onChange={(e) => setFracAutoCalc(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span>Chèn kèm đáp số (= {calculateFraction().val})</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CĂN THỨC */}
            {activeTab === 'sqrt' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Bậc căn (n):</label>
                      <input
                        type="text"
                        value={sqrtDeg}
                        onChange={(e) => setSqrtDeg(e.target.value)}
                        placeholder="2 (Căn bậc 2) hoặc 3, 4..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-[10.5px] text-slate-400">Để trống hoặc điền 2 cho căn bậc 2</span>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Biểu thức bên trong căn:</label>
                      <input
                        type="text"
                        value={sqrtExpr}
                        onChange={(e) => setSqrtExpr(e.target.value)}
                        placeholder="Ví dụ: x^2 + 5x - 6"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LŨY THỪA & CHỈ SỐ */}
            {activeTab === 'power' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Cơ số:</label>
                      <input
                        type="text"
                        value={powBase}
                        onChange={(e) => setPowBase(e.target.value)}
                        placeholder="Ví dụ: x hoặc (2x+1)"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Số mũ (Lũy thừa trên):</label>
                      <input
                        type="text"
                        value={powExp}
                        onChange={(e) => setPowExp(e.target.value)}
                        placeholder="Ví dụ: n + 1 hoặc 3"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Chỉ số dưới (Tùy chọn):</label>
                      <input
                        type="text"
                        value={powSub}
                        onChange={(e) => setPowSub(e.target.value)}
                        placeholder="Ví dụ: 0 cho x₀"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TÍCH PHÂN */}
            {activeTab === 'integral' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Cận dưới (a):</label>
                      <input
                        type="text"
                        value={intLower}
                        onChange={(e) => setIntLower(e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Cận trên (b):</label>
                      <input
                        type="text"
                        value={intUpper}
                        onChange={(e) => setIntUpper(e.target.value)}
                        placeholder="1"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: GIỚI HẠN & ĐẠO HÀM SỐ GIA */}
            {activeTab === 'limit' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLimMode('derivative');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      limMode === 'derivative'
                        ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🎯 Đạo hàm bằng số gia f'(x0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLimMode('standard');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      limMode === 'standard'
                        ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📐 Giới hạn tổng quát lim f(x)
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  {limMode === 'derivative' ? (
                    <div className="space-y-4">
                      {/* Presets nhanh cho Đạo hàm số gia */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Mẫu đạo hàm số gia thông dụng (Nhấp để nạp số vào ô):</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setLimX0('3'); setLimFx('2x'); }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                          >
                            f'(3) với f(x) = 2x
                          </button>
                          <button
                            type="button"
                            onClick={() => { setLimX0('1'); setLimFx('x²'); }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            f'(1) với f(x) = x²
                          </button>
                          <button
                            type="button"
                            onClick={() => { setLimX0('x₀'); setLimFx('f(x)'); }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            f'(x₀) dạng tổng quát
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Điểm cần tính đạo hàm (x0):</label>
                          <input
                            type="text"
                            value={limX0}
                            onChange={(e) => setLimX0(e.target.value)}
                            placeholder="Ví dụ: 3 hoặc x₀"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Hàm số f(x):</label>
                          <input
                            type="text"
                            value={limFx}
                            onChange={(e) => setLimFx(e.target.value)}
                            placeholder="Ví dụ: 2x hoặc x²"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        💡 <strong>Định nghĩa số gia SGK:</strong> Số gia đối số <code>Δx = x - x₀</code>, số gia hàm số <code>Δy = f(x₀ + Δx) - f(x₀)</code>. Đạo hàm tại điểm là <code>{"f'(x₀) = lim (Δy / Δx)"}</code>.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Presets nhanh cho giới hạn SGK */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Mẫu giới hạn thường gặp SGK 2018 (Nhấp để nạp số vào ô):</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setLimVar('x');
                              setLimTo('x₀');
                              setLimExprType('fraction');
                              setLimNum('f(x) - f(x₀)');
                              setLimDen('x - x₀');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                          >
                            🎯 f'(x₀) Định nghĩa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLimVar('x');
                              setLimTo('0');
                              setLimExprType('fraction');
                              setLimNum('sin(x)');
                              setLimDen('x');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            📐 sin(x)/x = 1
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLimVar('x');
                              setLimTo('+∞');
                              setLimExprType('fraction');
                              setLimNum('2x + 1');
                              setLimDen('x - 3');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            📊 Phân thức hữu tỉ
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLimVar('x');
                              setLimTo('1');
                              setLimExprType('fraction');
                              setLimNum('x² - 1');
                              setLimDen('x - 1');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            🔍 Khử vô định 0/0
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLimVar('n');
                              setLimTo('+∞');
                              setLimExprType('fraction');
                              setLimNum('1');
                              setLimDen('n');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          >
                            ⚡ Dãy số 1/n
                          </button>
                        </div>
                      </div>

                      {/* Tùy chọn dạng biểu thức */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Biến tiến tới (x → x0):</label>
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
                              placeholder="x₀ hoặc 0 hoặc +∞"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">Dạng biểu thức dưới dấu lim:</label>
                            <div className="flex items-center gap-1 text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => setLimExprType('fraction')}
                                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                                  limExprType === 'fraction' ? 'bg-rose-100 text-rose-800 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Phân thức P(x)/Q(x)
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setLimExprType('single')}
                                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                                  limExprType === 'single' ? 'bg-rose-100 text-rose-800 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Đơn lẻ f(x)
                              </button>
                            </div>
                          </div>

                          {limExprType === 'fraction' ? (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 w-16 shrink-0">Tử P(x):</span>
                                <input
                                  type="text"
                                  value={limNum}
                                  onChange={(e) => setLimNum(e.target.value)}
                                  placeholder="f(x) - f(x₀)"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                              </div>
                              <div className="h-px bg-slate-200"></div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 w-16 shrink-0">Mẫu Q(x):</span>
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
                              placeholder="2x + 1 hoặc x^2"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phương trình 1:</label>
                      <input
                        type="text"
                        value={sysEq1}
                        onChange={(e) => setSysEq1(e.target.value)}
                        placeholder="2x + 3y = 7"
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phương trình 2:</label>
                      <input
                        type="text"
                        value={sysEq2}
                        onChange={(e) => setSysEq2(e.target.value)}
                        placeholder="x - y = 1"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: BẢNG BIẾN THIÊN (KHÔNG GIAN LỚN THÊNH THANG 700PX+) */}
            {activeTab === 'variation_table' && (
              <div className="space-y-4">
                {/* Thanh Preset nhanh */}
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Table2 className="w-4 h-4 text-emerald-600" />
                    <span>Nạp mẫu hàm số chuẩn SGK:</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectVarPreset('cubic_up')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        varPreset === 'cubic_up'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Bậc 3 (a &gt; 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVarPreset('cubic_down')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        varPreset === 'cubic_down'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Bậc 3 (a &lt; 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVarPreset('rational')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        varPreset === 'rational'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Phân thức ||
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVarPreset('quartic')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        varPreset === 'quartic'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      Bậc 4 trùng phương
                    </button>
                  </div>
                </div>

                {/* Bảng biến thiên tương tác hoàn chỉnh */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
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
                      setVarTitle(nextObj.title || 'Bảng biến thiên hàm số');
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
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Dạng hàm:</label>
                      <select
                        value={graphType}
                        onChange={(e) => setGraphType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LIVE PREVIEW BOX (Ẩn khi ở tab variation_table vì bảng biến thiên phía trên đã là bảng trực quan) */}
            {activeTab !== 'variation_table' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 shadow-2xs space-y-2.5 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>👀 Khung Xem Trước Trực Quan (Kết quả chuẩn SGK học sinh nhìn thấy)</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Ký hiệu toán học thực tế
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center min-h-[90px] overflow-x-auto text-base shadow-inner">
                  {activeTab === 'math_graph' ? (
                    <MathGraphView
                      data={{
                        type: graphType,
                        formula: graphFormula,
                        title: 'Đồ thị hàm số minh họa'
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

        {/* ================= MODAL FOOTER ACTIONS ================= */}
        <div className="h-16 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕ Hủy bỏ (Esc)
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chèn Vào Bài Giảng (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
