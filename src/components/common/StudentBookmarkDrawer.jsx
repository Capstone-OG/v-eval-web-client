import React, { useState, useMemo, useEffect } from 'react';
import katex from 'katex';
import {
  Bookmark,
  X,
  Box,
  Shapes,
  Activity,
  FlaskConical,
  Search,
  Maximize2,
  Minimize2,
  BookMarked,
  Cpu,
  Plus,
  Trash2,
  RotateCcw,
  Compass,
  Lightbulb,
  Layers,
  Globe2,
  Calculator,
  ExternalLink
} from 'lucide-react';
import InteractiveMathRenderer from './InteractiveMathRenderer';
import MathText from './MathText';
import UnitCircleSimulator from './UnitCircleSimulator';
import UnitConverterPanel from './UnitConverterPanel';
import ConstantsReferencePanel from './ConstantsReferencePanel';
import NativePhysicsLab from './NativePhysicsLab';
import { SHAPES_2D_META, getDefaultBasePoints } from '../../utils/mathGraphUtils';
import { PERIODIC_ELEMENTS, ELEMENT_CATEGORIES } from '../../data/periodicTableData';
import { ENGLISH_GRAMMAR_CATEGORIES, ENGLISH_GRAMMAR_TOPICS } from '../../data/englishGrammarData';
import {
  MATH_FORMULAS,
  PHYSICS_FORMULAS,
  CHEMISTRY_FORMULAS,
  CHEMISTRY_PRECIPITATES,
  CHEMISTRY_KEY_REACTIONS,
  BIOLOGY_FORMULAS,
  HISTORY_REFERENCE,
  GEOGRAPHY_REFERENCE
} from '../../data/referenceFormulasData';

// Clean direct KaTeX renderer (never prints raw \frac text, zero scrollbars)
function KatexFormula({ latex }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  }, [latex]);
  return <span className="inline-block leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

// Normalize student-friendly math input ("x² - 2x + 1", "√(x)", "|x|") -> JSXGraph compiler expression
function normalizeFriendlyExpr(raw = '') {
  return String(raw || '')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/×|·/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√([a-z0-9]+)/gi, 'sqrt($1)')
    .replace(/\|([^|]+)\|/g, 'abs($1)');
}

const MODELS_3D = [
  { id: 'pyramid_rect_sa', label: 'Chóp S.ABCD (SA ⊥ đáy)', kind: 'poly', title: 'Hình chóp S.ABCD có SA ⊥ (ABCD)', formulas: ['V = \\frac{1}{3} a b h', 'd(S,(ABCD)) = SA = h'] },
  { id: 'pyramid_tri_sa', label: 'Chóp S.ABC (SA ⊥ đáy)', kind: 'poly', title: 'Hình chóp tam giác S.ABC có SA ⊥ (ABC)', formulas: ['V = \\frac{1}{3} S_{\\triangle ABC} \\cdot SA', 'R = \\sqrt{R_{\\text{đáy}}^2 + (h/2)^2}'] },
  { id: 'pyramid_regular_quad', label: 'Chóp tứ giác đều', kind: 'poly', title: 'Hình chóp tứ giác đều S.ABCD (SO ⊥ đáy)', formulas: ['V = \\frac{1}{3} a^2 \\cdot SO', 'R = \\frac{SA^2}{2SO}'] },
  { id: 'pyramid_regular_tri', label: 'Chóp tam giác đều', kind: 'poly', title: 'Hình chóp tam giác đều S.ABC (SG ⊥ đáy)', formulas: ['S_{\\text{đáy}} = \\frac{a^2\\sqrt{3}}{4}', 'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot SG'] },
  { id: 'pyramid_side_perp', label: 'Mặt bên (SAB) ⊥ đáy', kind: 'poly', title: 'Hình chóp S.ABCD có (SAB) ⊥ (ABCD)', formulas: ['SH \\perp AB \\Rightarrow SH \\perp (ABCD)', 'V = \\frac{1}{3} S_{ABCD} \\cdot SH'] },
  { id: 'tetrahedron', label: 'Tứ diện ABCD', kind: 'poly', title: 'Khối tứ diện ABCD tổng quát', formulas: ['V = \\frac{1}{6}|([\\overrightarrow{AB},\\overrightarrow{AC}]\\cdot\\overrightarrow{AD})|', 'V_{\\text{đều}} = \\frac{a^3\\sqrt{2}}{12}'] },
  { id: 'prism_tri', label: 'Lăng trụ đứng tam giác', kind: 'poly', title: 'Lăng trụ đứng tam giác ABC.A\'B\'C\'', formulas: ['V = S_{\\triangle ABC} \\cdot h', 'S_{xq} = C_{\\text{đáy}} \\cdot h'] },
  { id: 'box_cube', label: 'Hình hộp / Lập phương', kind: 'poly', title: 'Hình hộp chữ nhật / Lập phương ABCD.A\'B\'C\'D\'', formulas: ['V = a b h', 'AC\' = \\sqrt{a^2 + b^2 + h^2}'] },
  { id: 'solid_revolution', label: 'Hình Nón (r, h, l)', kind: 'cone', title: 'Hình Nón tròn xoay (Đỉnh S, tâm đáy O)', formulas: ['S_{xq} = \\pi r l', 'V = \\frac{1}{3}\\pi r^2 h', 'l = \\sqrt{r^2 + h^2}'] },
  { id: 'cylinder', label: 'Hình Trụ (r, h)', kind: 'cylinder', title: 'Hình Trụ tròn xoay (Trục OO\')', formulas: ['S_{xq} = 2\\pi r h', 'S_{tp} = 2\\pi r(h+r)', 'V = \\pi r^2 h'] },
  { id: 'sphere_plane', label: 'Mặt Cầu & Thiết diện', kind: 'sphere', title: 'Mặt cầu (I; R) cắt mặt phẳng (P) khoảng cách d', formulas: ['r_{\\text{thiết diện}} = \\sqrt{R^2 - d^2}', 'S = 4\\pi R^2', 'V = \\frac{4}{3}\\pi R^3'] }
];

const GRAPH_2D_PRESETS = [
  { id: 'linear', label: 'Đường thẳng', input: '2x - 1', formula: 'y = 2x - 1' },
  { id: 'quadratic', label: 'Parabol', input: 'x² - 2x - 3', formula: 'y = x^2 - 2x - 3' },
  { id: 'cubic', label: 'Bậc 3', input: 'x³ - 3x + 1', formula: 'y = x^3 - 3x + 1' },
  { id: 'quartic', label: 'Trùng phương', input: 'x⁴ - 2x² - 1', formula: 'y = x^4 - 2x^2 - 1' },
  { id: 'rational11', label: 'Phân thức 1/1', input: '(2x + 1)/(x - 1)', formula: 'y = \\frac{2x+1}{x-1}' },
  { id: 'rational21', label: 'Phân thức 2/1', input: '(x² - x + 1)/(x - 1)', formula: 'y = \\frac{x^2-x+1}{x-1}' },
  { id: 'sqrt', label: 'Căn thức', input: '√(x + 2)', formula: 'y = \\sqrt{x+2}' },
  { id: 'abs', label: 'Trị tuyệt đối', input: '|x² - 4|', formula: 'y = |x^2 - 4|' },
  { id: 'exp', label: 'Hàm mũ eˣ', input: 'exp(x)', formula: 'y = e^x' },
  { id: 'ln', label: 'Logarit ln(x)', input: 'ln(x)', formula: 'y = \\ln(x)' },
  { id: 'sin', label: 'sin(x)', input: '2sin(x)', formula: 'y = 2\\sin(x)' },
  { id: 'cos', label: 'cos(x)', input: '2cos(x)', formula: 'y = 2\\cos(x)' }
];

const GRAPH_KEYPAD = [
  { label: 'x²', insert: 'x²' },
  { label: 'x³', insert: 'x³' },
  { label: '√(x)', insert: '√(x)' },
  { label: '|x|', insert: '|x|' },
  { label: '1/x', insert: '1/x' },
  { label: 'sin(x)', insert: 'sin(x)' },
  { label: 'cos(x)', insert: 'cos(x)' },
  { label: 'ln(x)', insert: 'ln(x)' },
  { label: 'eˣ', insert: 'exp(x)' },
  { label: 'π', insert: 'π' },
  { label: '( )', insert: '()' },
  { label: '+', insert: ' + ' },
  { label: '-', insert: ' - ' },
  { label: '/', insert: '/' }
];

const SHAPES_2D_LIST = Object.values(SHAPES_2D_META);

export default function StudentBookmarkDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [mainTab, setMainTab] = useState('formulas'); // 'formulas' | 'simulations'

  // Tab 1 (Formulas) state
  const [formulaSubject, setFormulaSubject] = useState('math');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [chemSubTab, setChemSubTab] = useState('periodic');
  const [selectedElement, setSelectedElement] = useState(PERIODIC_ELEMENTS[0]);
  const [chemQuery, setChemQuery] = useState('');
  const [chemCategory, setChemCategory] = useState('ALL');
  const [engCategory, setEngCategory] = useState('tenses');
  const [engQuery, setEngQuery] = useState('');

  // Tab 2 (Simulations) state
  const [simMode, setSimMode] = useState('math3d'); // 'math3d' | 'math2d' | 'graph' | 'unit_circle' | 'physics_lab'

  // Math 3D state
  const [selected3D, setSelected3D] = useState('pyramid_rect_sa');
  const [dimA, setDimA] = useState(4);
  const [dimB, setDimB] = useState(3.5);
  const [dimH, setDimH] = useState(4.2);
  const [dimR, setDimR] = useState(3);
  const [planeD, setPlaneD] = useState(1.6);

  const [tool3D, setTool3D] = useState('median');
  const [extraPoints, setExtraPoints] = useState([]);
  const [auxLines, setAuxLines] = useState([]);
  const [auxPolygons, setAuxPolygons] = useState([]);

  const [medApex, setMedApex] = useState('S');
  const [medE1, setMedE1] = useState('B');
  const [medE2, setMedE2] = useState('C');
  const [centV1, setCentV1] = useState('S');
  const [centV2, setCentV2] = useState('B');
  const [centV3, setCentV3] = useState('C');
  const [newPtName, setNewPtName] = useState('M');
  const [newPtV1, setNewPtV1] = useState('S');
  const [newPtV2, setNewPtV2] = useState('C');
  const [newPtRatio, setNewPtRatio] = useState(0.5);
  const [newLineFrom, setNewLineFrom] = useState('A');
  const [newLineTo, setNewLineTo] = useState('C');
  const [newLineDash, setNewLineDash] = useState(2);
  const [newLineColor, setNewLineColor] = useState('#e11d48');
  const [planeV1, setPlaneV1] = useState('S');
  const [planeV2, setPlaneV2] = useState('A');
  const [planeV3, setPlaneV3] = useState('C');

  // Math 2D Geometry state (FIXED: passes `shapeType` + interactive toggles!)
  const [selected2D, setSelected2D] = useState('right_triangle');
  const [show2DAltitude, setShow2DAltitude] = useState(true);
  const [show2DMedian, setShow2DMedian] = useState(true);
  const [show2DCircum, setShow2DCircum] = useState(true);
  const [show2DAxes, setShow2DAxes] = useState(false);

  // Graph state (student-friendly input!)
  const [graphInput, setGraphInput] = useState('x³ - 3x + 1');
  const [graphFormula, setGraphFormula] = useState('y = x^3 - 3x + 1');

  // Listen for 1-click "Mở bảng nháp trực quan" shortcuts from Math questions & theory pages
  useEffect(() => {
    const handleOpenScratchpad = (event) => {
      const detail = event?.detail || {};
      setIsOpen(true);
      setMainTab('simulations');
      if (detail.simMode) setSimMode(detail.simMode);
      if (detail.shape3D) {
        setSelected3D(detail.shape3D);
        setExtraPoints([]);
        setAuxLines([]);
        setAuxPolygons([]);
      }
      if (detail.shape2D) setSelected2D(detail.shape2D);
      if (detail.graphPreset) {
        const preset = GRAPH_2D_PRESETS.find((g) => g.id === detail.graphPreset);
        if (preset) {
          setGraphInput(preset.input);
          setGraphFormula(preset.formula);
        }
      }
    };

    window.addEventListener('veval:open-math-scratchpad', handleOpenScratchpad);
    return () => window.removeEventListener('veval:open-math-scratchpad', handleOpenScratchpad);
  }, []);

  // 3D derived config
  const active3DMeta = useMemo(
    () => MODELS_3D.find((m) => m.id === selected3D) || MODELS_3D[0],
    [selected3D]
  );

  const baseVerticesMap = useMemo(
    () => (active3DMeta.kind === 'poly' ? getDefaultBasePoints(selected3D, dimA, dimB, dimH) : {}),
    [active3DMeta.kind, selected3D, dimA, dimB, dimH]
  );

  const allVertexKeys = useMemo(
    () => [...Object.keys(baseVerticesMap), ...extraPoints.map((p) => p.id)],
    [baseVerticesMap, extraPoints]
  );

  const config3D = useMemo(() => ({
    is3D: true,
    shapeType: selected3D,
    title: active3DMeta.title,
    dimensions: { w: dimA, d: dimB, h: dimH, r: dimR, planeD },
    vertices: active3DMeta.kind === 'poly' ? baseVerticesMap : undefined,
    extraPoints,
    auxLines,
    auxPolygons,
    azimuth: 0.85,
    elevation: 0.35
  }), [selected3D, active3DMeta, dimA, dimB, dimH, dimR, planeD, baseVerticesMap, extraPoints, auxLines, auxPolygons]);

  const handleSelect3DModel = (id) => {
    setSelected3D(id);
    setExtraPoints([]);
    setAuxLines([]);
    setAuxPolygons([]);
    const verts = Object.keys(getDefaultBasePoints(id, dimA, dimB, dimH));
    if (verts.length >= 3) {
      setMedApex(verts[verts.length - 1]);
      setMedE1(verts[1]);
      setMedE2(verts[2]);
      setCentV1(verts[verts.length - 1]);
      setCentV2(verts[1]);
      setCentV3(verts[2]);
      setNewPtV1(verts[verts.length - 1]);
      setNewPtV2(verts[2]);
      setNewLineFrom(verts[0]);
      setNewLineTo(verts[2]);
      setPlaneV1(verts[verts.length - 1]);
      setPlaneV2(verts[0]);
      setPlaneV3(verts[2]);
    }
  };

  const handleDrawMedian = () => {
    if (!medApex || !medE1 || !medE2 || medE1 === medE2) return;
    const midId = `M${extraPoints.length + 1}`;
    setExtraPoints((prev) => [...prev, { id: midId, name: midId, edge: [medE1, medE2], ratio: 0.5, color: '#ec4899' }]);
    setAuxLines((prev) => [...prev, { id: `med_${Date.now()}`, from: medApex, to: midId, color: '#059669', dash: 0, label: `Trung tuyến ${medApex}${midId}` }]);
  };

  const handleDrawCentroid = () => {
    if (new Set([centV1, centV2, centV3]).size < 3) return;
    const gId = `G${extraPoints.filter((p) => p.centroidOf).length + 1}`;
    setExtraPoints((prev) => [...prev, { id: gId, name: gId, centroidOf: [centV1, centV2, centV3], color: '#f59e0b' }]);
    setAuxLines((prev) => [...prev, { id: `cent_${Date.now()}`, from: centV1, to: gId, color: '#d97706', dash: 2, label: `Trọng tâm ${gId}` }]);
  };

  const handleAddExtraPoint = () => {
    const clean = newPtName.trim() || `P${extraPoints.length + 1}`;
    if (!newPtV1 || !newPtV2 || newPtV1 === newPtV2) return;
    setExtraPoints((prev) => [...prev.filter((p) => p.id !== clean), { id: clean, name: clean, edge: [newPtV1, newPtV2], ratio: Number(newPtRatio), color: '#ec4899' }]);
    setNewPtName(String.fromCharCode(Math.min(90, clean.charCodeAt(0) + 1)));
  };

  const handleAddAuxLine = () => {
    if (!newLineFrom || !newLineTo || newLineFrom === newLineTo) return;
    setAuxLines((prev) => [...prev, { id: `ln_${Date.now()}`, from: newLineFrom, to: newLineTo, color: newLineColor, dash: newLineDash, label: `Đoạn ${newLineFrom}${newLineTo}` }]);
  };

  const handleAddCrossSection = () => {
    if (new Set([planeV1, planeV2, planeV3]).size < 3) return;
    setAuxPolygons((prev) => [...prev, { id: `pl_${Date.now()}`, vertices: [planeV1, planeV2, planeV3], color: '#6366f1', opacity: 0.28, label: `(${planeV1}${planeV2}${planeV3})` }]);
  };

  // FIXED 2D Geometry config: passes `shapeType` (exact key expected by mount2DGeometryBoard!)
  const active2DMeta = SHAPES_2D_META[selected2D] || SHAPES_2D_LIST[0];
  const config2D = useMemo(() => ({
    is2DGeometry: true,
    is3D: false,
    shapeType: selected2D,
    showAltitude: show2DAltitude,
    showMedian: show2DMedian,
    showCircumcircle: show2DCircum,
    showAxes: show2DAxes,
    title: active2DMeta.title,
    formula: active2DMeta.formula
  }), [selected2D, show2DAltitude, show2DMedian, show2DCircum, show2DAxes, active2DMeta]);

  // Normalized Graph config
  const compiledGraphExpr = useMemo(() => normalizeFriendlyExpr(graphInput), [graphInput]);
  const configGraph = useMemo(() => ({
    is3D: false,
    is2DGeometry: false,
    type: 'custom',
    examMode: 'standard',
    title: 'Đồ thị hàm số tương tác',
    formula: graphFormula,
    customExpr: compiledGraphExpr
  }), [compiledGraphExpr, graphFormula]);

  // Periodic table grid & filters
  const periodicGridMap = useMemo(() => {
    const map = new Map();
    PERIODIC_ELEMENTS.forEach((el) => map.set(`${el.row}-${el.col}`, el));
    return map;
  }, []);

  const chemMatches = useMemo(() => {
    const q = chemQuery.trim().toLowerCase();
    const set = new Set();
    PERIODIC_ELEMENTS.forEach((el) => {
      const catOk = chemCategory === 'ALL' || el.category === chemCategory;
      const qOk = !q || el.symbol.toLowerCase().includes(q) || el.nameVi.toLowerCase().includes(q) || el.nameEn.toLowerCase().includes(q) || String(el.z) === q;
      if (catOk && qOk) set.add(el.z);
    });
    return set;
  }, [chemQuery, chemCategory]);

  const filterFormulaGroups = (groups) => {
    const q = formulaSearch.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            (it.parts || []).some((p) => p.toLowerCase().includes(q)) ||
            g.group.toLowerCase().includes(q)
        )
      }))
      .filter((g) => g.items.length > 0);
  };

  const filteredEngTopics = useMemo(() => {
    const q = engQuery.trim().toLowerCase();
    return ENGLISH_GRAMMAR_TOPICS.filter((t) => {
      const catOk = q ? true : t.category === engCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.usage.toLowerCase().includes(q) ||
        t.signals.toLowerCase().includes(q) ||
        t.formulas.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [engCategory, engQuery]);

  // Clean, open, textbook-grade formula layout — NO nested scrollbars, NO raw LaTeX!
  const renderFormulaGroups = (groups) => {
    const filtered = filterFormulaGroups(groups);
    if (filtered.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Không tìm thấy công thức khớp với "{formulaSearch}".
        </div>
      );
    }
    return (
      <div className="space-y-5">
        {filtered.map((grp) => (
          <section key={grp.group} className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 px-1">
              {grp.group}
            </h3>
            <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
              {grp.items.map((it) => (
                <div key={it.name} className="px-4 py-3 space-y-2">
                  <div className="text-xs font-bold text-slate-700">{it.name}</div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-slate-900">
                    {(it.parts || []).map((latex, idx) => (
                      <KatexFormula key={idx} latex={latex} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Right-Edge Vertical Bookmark Tabs (Tra cứu + Casio 580) */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-200 ${isOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
          }`}
      >
        <button
          type="button"
          onClick={() => {
            if (mainTab === 'calculator') setMainTab('formulas');
            setIsOpen(true);
          }}
          aria-label="Mở Sổ tay Công thức & Mô phỏng"
          title="Sổ tay Công thức & Phòng Mô phỏng (Toán · Lý · Hóa · Anh · Sinh · Sử · Địa)"
          className="group flex flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-indigo-200/90 bg-white/95 backdrop-blur-md px-2.5 py-3.5 shadow-lg shadow-slate-900/10 hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-200 cursor-pointer"
        >
          <Bookmark className="w-4.5 h-4.5 text-indigo-600 fill-indigo-100 group-hover:text-white group-hover:fill-white/20 transition-colors" />
          <span
            className="text-[11px] font-bold tracking-wide text-slate-700 group-hover:text-white transition-colors select-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            Tra cứu
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab('calculator');
            setIsOpen(true);
          }}
          aria-label="Mở Máy tính Casio 580"
          title="Máy tính khoa học Casio fx-580VN X (MathDA)"
          className="group flex flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-200/90 bg-white/95 backdrop-blur-md px-2.5 py-3 shadow-lg shadow-slate-900/10 hover:bg-slate-900 hover:border-slate-900 transition-all duration-200 cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
          <span
            className="text-[10px] font-bold tracking-wide text-slate-700 group-hover:text-white transition-colors select-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            FX-580
          </span>
        </button>
      </div>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className={`relative h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-200 ${isWide ? 'w-full max-w-[97vw]' : 'w-full max-w-5xl'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200/80 bg-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bookmark className="w-4 h-4 fill-indigo-200" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    Sổ Tay Công Thức &amp; Phòng Mô Phỏng
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    Tổng hợp đầy đủ SGK GDPT 2018 (Lớp 10–12) · Quy đổi SI · Dựng hình 3D/2D, Đồ thị &amp; PhET
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWide((w) => !w)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {isWide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{isWide ? 'Thu gọn' : 'Toàn màn hình'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Đóng sổ tra cứu"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* 3 PRIMARY TABS */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-200/80 bg-slate-50/80 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setMainTab('formulas')}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${mainTab === 'formulas'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>1. Công thức &amp; Tra cứu</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab('simulations')}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${mainTab === 'simulations'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
              >
                <Cpu className="w-4 h-4" />
                <span>2. Mô phỏng (Toán · Lý · Hóa)</span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab('calculator')}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${mainTab === 'calculator'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                  }`}
              >
                <Calculator className="w-4 h-4" />
                <span>3. Máy tính Casio 580</span>
              </button>
            </div>

            {/* ========================================================= */}
            {/* MAIN TAB 1: FORMULAS & REFERENCE                          */}
            {/* ========================================================= */}
            {mainTab === 'formulas' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'math', label: 'Toán học' },
                    { id: 'physics', label: 'Vật lý' },
                    { id: 'chemistry', label: 'Hóa học' },
                    { id: 'english', label: 'Tiếng Anh' },
                    { id: 'biology', label: 'Sinh học' },
                    { id: 'history', label: 'Lịch sử' },
                    { id: 'geography', label: 'Địa lý' },
                    { id: 'constants', label: 'Hằng số & Góc π' },
                    { id: 'units', label: 'Đổi đơn vị SI' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setFormulaSubject(s.id); setFormulaSearch(''); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${formulaSubject === s.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {(formulaSubject === 'math' || formulaSubject === 'physics' || formulaSubject === 'biology') && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formulaSearch}
                      onChange={(e) => setFormulaSearch(e.target.value)}
                      placeholder="Tìm nhanh công thức (vd: đạo hàm, Oxyz, Bayes, RLC, phóng xạ, ADN)..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}

                {formulaSubject === 'math' && renderFormulaGroups(MATH_FORMULAS)}
                {formulaSubject === 'physics' && renderFormulaGroups(PHYSICS_FORMULAS)}
                {formulaSubject === 'biology' && renderFormulaGroups(BIOLOGY_FORMULAS)}

                {/* CHEMISTRY */}
                {formulaSubject === 'chemistry' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/70 w-fit">
                      {[
                        { id: 'periodic', label: 'Bảng tuần hoàn (118)' },
                        { id: 'calc', label: 'Công thức tính & Bảo toàn' },
                        { id: 'precipitates', label: 'Kết tủa & Màu sắc' },
                        { id: 'reactions', label: 'Dãy điện hóa & Phản ứng' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setChemSubTab(t.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${chemSubTab === t.id ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {chemSubTab === 'calc' && renderFormulaGroups(CHEMISTRY_FORMULAS)}

                    {chemSubTab === 'periodic' && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={chemQuery}
                              onChange={(e) => setChemQuery(e.target.value)}
                              placeholder="Tìm theo ký hiệu (Fe, Na), tên (Sắt, Oxi) hoặc số Z (26)..."
                              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                          <select
                            value={chemCategory}
                            onChange={(e) => setChemCategory(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            <option value="ALL">Tất cả nhóm nguyên tố (118)</option>
                            {Object.entries(ELEMENT_CATEGORIES).map(([key, meta]) => (
                              <option key={key} value={key}>{meta.label}</option>
                            ))}
                          </select>
                        </div>

                        {selectedElement && (
                          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div
                              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${(ELEMENT_CATEGORIES[selectedElement.category] || ELEMENT_CATEGORIES.nonmetal).bg
                                } ${(ELEMENT_CATEGORIES[selectedElement.category] || ELEMENT_CATEGORIES.nonmetal).border}`}
                            >
                              <span className="text-[10px] font-bold text-slate-500">{selectedElement.z}</span>
                              <span className={`text-2xl font-black leading-none ${(ELEMENT_CATEGORIES[selectedElement.category] || ELEMENT_CATEGORIES.nonmetal).text}`}>
                                {selectedElement.symbol}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 mt-0.5">{selectedElement.mass}</span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-2 w-full">
                              <div className="flex items-center flex-wrap gap-2">
                                <h3 className="text-base font-bold text-slate-900">{selectedElement.nameVi}</h3>
                                <span className="text-xs text-slate-400">({selectedElement.nameEn})</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(ELEMENT_CATEGORIES[selectedElement.category] || ELEMENT_CATEGORIES.nonmetal).badge}`}>
                                  {(ELEMENT_CATEGORIES[selectedElement.category] || ELEMENT_CATEGORIES.nonmetal).label}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="rounded-lg bg-slate-50 px-2.5 py-1.5"><div className="text-[10px] text-slate-400">Nguyên tử khối</div><div className="font-bold text-slate-800">{selectedElement.mass}</div></div>
                                <div className="rounded-lg bg-slate-50 px-2.5 py-1.5"><div className="text-[10px] text-slate-400">Số oxi hóa</div><div className="font-bold text-slate-800">{selectedElement.oxStates}</div></div>
                                <div className="rounded-lg bg-slate-50 px-2.5 py-1.5"><div className="text-[10px] text-slate-400">Độ âm điện</div><div className="font-bold text-slate-800">{selectedElement.electronegativity}</div></div>
                                <div className="rounded-lg bg-slate-50 px-2.5 py-1.5"><div className="text-[10px] text-slate-400">Vị trí</div><div className="font-bold text-slate-800">CK {selectedElement.period} · N{selectedElement.group}</div></div>
                              </div>
                              <div className="text-xs text-slate-600">
                                <span className="text-slate-400">Cấu hình electron: </span>
                                <span className="font-semibold text-indigo-700">{selectedElement.config}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 overflow-x-auto">
                          <div className="min-w-[780px] space-y-1">
                            <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1 text-center text-[9px] font-bold text-slate-400 pb-1">
                              {Array.from({ length: 18 }, (_, i) => <div key={i + 1}>{i + 1}</div>)}
                            </div>
                            {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                              <div key={row} className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
                                {Array.from({ length: 18 }, (_, idx) => {
                                  const col = idx + 1;
                                  if (row === 6 && col === 3) return <div key="la" className="h-11 rounded-md border border-dashed border-pink-300 bg-pink-50/40 flex items-center justify-center text-[9px] font-bold text-pink-700">57–71</div>;
                                  if (row === 7 && col === 3) return <div key="ac" className="h-11 rounded-md border border-dashed border-fuchsia-300 bg-fuchsia-50/40 flex items-center justify-center text-[9px] font-bold text-fuchsia-700">89–103</div>;
                                  const el = periodicGridMap.get(`${row}-${col}`);
                                  if (!el) return <div key={col} className="h-11" />;
                                  const cat = ELEMENT_CATEGORIES[el.category] || ELEMENT_CATEGORIES.nonmetal;
                                  const isSelected = selectedElement?.z === el.z;
                                  const isMatched = chemMatches.has(el.z);
                                  return (
                                    <button
                                      key={el.z}
                                      type="button"
                                      onClick={() => setSelectedElement(el)}
                                      title={`${el.z} - ${el.nameVi} (${el.mass})`}
                                      className={`h-11 rounded-md border px-0.5 flex flex-col items-center justify-center transition-all cursor-pointer ${cat.bg} ${cat.border} ${isSelected ? 'ring-2 ring-indigo-600 scale-105 z-10' : ''} ${!isMatched ? 'opacity-20' : ''}`}
                                    >
                                      <span className="text-[8px] leading-none text-slate-500">{el.z}</span>
                                      <span className={`text-xs font-extrabold leading-tight ${cat.text}`}>{el.symbol}</span>
                                      <span className="text-[7px] leading-none text-slate-500 truncate max-w-full">{el.mass}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                            <div className="pt-2 space-y-1">
                              {[{ row: 9, label: 'Lantan' }, { row: 10, label: 'Actini' }].map(({ row, label }) => (
                                <div key={row} className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1 items-center">
                                  <div className="col-span-2 text-right pr-1.5 text-[9px] font-bold text-slate-400">{label}</div>
                                  {Array.from({ length: 15 }, (_, idx) => {
                                    const col = idx + 3;
                                    const el = periodicGridMap.get(`${row}-${col}`);
                                    if (!el) return <div key={col} className="h-11" />;
                                    const cat = ELEMENT_CATEGORIES[el.category] || ELEMENT_CATEGORIES.lanthanide;
                                    const isSelected = selectedElement?.z === el.z;
                                    const isMatched = chemMatches.has(el.z);
                                    return (
                                      <button
                                        key={el.z}
                                        type="button"
                                        onClick={() => setSelectedElement(el)}
                                        className={`h-11 rounded-md border px-0.5 flex flex-col items-center justify-center transition-all cursor-pointer ${cat.bg} ${cat.border} ${isSelected ? 'ring-2 ring-indigo-600 scale-105 z-10' : ''} ${!isMatched ? 'opacity-20' : ''}`}
                                      >
                                        <span className="text-[8px] leading-none text-slate-500">{el.z}</span>
                                        <span className={`text-xs font-extrabold leading-tight ${cat.text}`}>{el.symbol}</span>
                                        <span className="text-[7px] leading-none text-slate-500 truncate max-w-full">{el.mass}</span>
                                      </button>
                                    );
                                  })}
                                  <div />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {chemSubTab === 'precipitates' && (
                      <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                        {CHEMISTRY_PRECIPITATES.map((p) => (
                          <div key={p.color} className="p-4 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border ${p.dot}`} />
                              <h4 className="text-sm font-bold text-slate-900">Kết tủa màu {p.color}</h4>
                            </div>
                            <div className="text-sm font-semibold text-indigo-800">{p.compounds}</div>
                            <p className="text-xs text-slate-600 leading-relaxed">{p.note}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {chemSubTab === 'reactions' && (
                      <div className="space-y-3">
                        {CHEMISTRY_KEY_REACTIONS.map((r) => (
                          <div key={r.group} className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
                            <h4 className="text-sm font-bold text-slate-900">{r.group}</h4>
                            <p className="text-xs font-semibold text-indigo-700">{r.summary}</p>
                            <div className="space-y-1.5 pt-1 text-sm text-slate-800">
                              {r.equations.map((eq, i) => (
                                <div key={i} className="pl-3 border-l-2 border-indigo-200">{eq}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ENGLISH — NATURAL TYPOGRAPHY (NO CONSOLE MONO BOXES!) */}
                {formulaSubject === 'english' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={engQuery}
                        onChange={(e) => setEngQuery(e.target.value)}
                        placeholder="Tìm nhanh: Hiện tại hoàn thành, mạo từ, đảo ngữ, modal perfect, wish, tag question..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    {!engQuery.trim() && (
                      <div className="flex flex-wrap gap-1.5">
                        {ENGLISH_GRAMMAR_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setEngCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${engCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                              }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                      {filteredEngTopics.map((topic) => (
                        <article key={topic.id} className="p-4 sm:p-5 space-y-2.5">
                          <h3 className="text-sm font-bold text-slate-900">{topic.title}</h3>

                          {/* Clean, natural formula lines (no console font, no clunky inner box) */}
                          <div className="space-y-1.5 pl-3 border-l-2 border-indigo-400">
                            {topic.formulas.map((f, idx) => (
                              <div key={idx} className="text-[13px] font-semibold text-slate-900 leading-relaxed">
                                {f}
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800">Cách dùng: </strong>{topic.usage}
                          </p>
                          <p className="text-xs text-amber-900 leading-relaxed">
                            <strong className="text-amber-700">Dấu hiệu / Lưu ý: </strong>{topic.signals}
                          </p>
                          <div className="space-y-0.5 text-xs text-slate-500 italic">
                            {topic.examples.map((ex, idx) => (
                              <div key={idx}>• "{ex}"</div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* HISTORY: GRADES 10-11-12 TIMELINE + DID YOU KNOW */}
                {formulaSubject === 'history' && (
                  <div className="space-y-5">
                    {HISTORY_REFERENCE.sections.map((sec) => (
                      <section key={sec.grade} className="space-y-2.5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 px-1">
                          {sec.grade}
                        </h3>
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
                          <div className="space-y-3.5 border-l-2 border-indigo-200 pl-4">
                            {sec.milestones.map((m) => (
                              <div key={m.year + m.title} className="relative">
                                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                                <div className="text-xs font-extrabold text-indigo-700">{m.year}</div>
                                <div className="text-sm font-bold text-slate-900 mt-0.5">{m.title}</div>
                                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{m.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    ))}

                    <section className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        Bạn có biết? (Bẫy &amp; Điểm nhấn Lịch sử ĐGNL)
                      </h3>
                      <ul className="space-y-2 text-xs text-amber-950/90 leading-relaxed">
                        {HISTORY_REFERENCE.didYouKnow.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold text-amber-700">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                )}

                {/* GEOGRAPHY: FORMULAS + GRADES 10-12 REGIONS + DID YOU KNOW */}
                {formulaSubject === 'geography' && (
                  <div className="space-y-5">
                    <section className="space-y-2.5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 px-1">
                        Công thức Tính toán Địa lý
                      </h3>
                      <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                        {GEOGRAPHY_REFERENCE.formulas.map((f) => (
                          <div key={f.name} className="px-4 py-3 space-y-2">
                            <div className="text-xs font-bold text-slate-700">{f.name}</div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-slate-900">
                              {f.parts.map((latex, idx) => <KatexFormula key={idx} latex={latex} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2.5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-700 px-1 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5" />
                        Kiến thức trọng tâm Địa lý Thế giới &amp; Việt Nam (Lớp 10–12)
                      </h3>
                      <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                        {GEOGRAPHY_REFERENCE.regionsAndWorld.map((item) => (
                          <div key={item.title} className="p-4 space-y-1">
                            <div className="text-sm font-bold text-slate-900">{item.title}</div>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-600" />
                        Bạn có biết? (Địa lý Tự nhiên &amp; Mẹo Biểu đồ ĐGNL)
                      </h3>
                      <ul className="space-y-2 text-xs text-emerald-950/90 leading-relaxed">
                        {GEOGRAPHY_REFERENCE.didYouKnow.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-bold text-emerald-700">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                )}

                {formulaSubject === 'constants' && <ConstantsReferencePanel />}
                {formulaSubject === 'units' && <UnitConverterPanel />}
              </div>
            )}

            {/* ========================================================= */}
            {/* MAIN TAB 2: INTERACTIVE SIMULATIONS                       */}
            {/* ========================================================= */}
            {mainTab === 'simulations' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'math3d', label: 'Toán 3D (Dựng hình)', icon: Box },
                    { id: 'math2d', label: 'Toán 2D (Kéo-thả)', icon: Shapes },
                    { id: 'graph', label: 'Đồ thị hàm số', icon: Activity },
                    { id: 'unit_circle', label: 'Đường tròn Lượng giác & Pha Lý', icon: Compass },
                    { id: 'physics_lab', label: 'Phòng thí nghiệm PhET (Lý & Hóa)', icon: FlaskConical }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSimMode(m.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${simMode === m.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2.1 MATH 3D */}
                {simMode === 'math3d' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {MODELS_3D.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelect3DModel(m.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selected3D === m.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80">
                      {active3DMeta.kind === 'poly' && (
                        <>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Cạnh a</span><span className="text-indigo-600">{dimA}</span></div><input type="range" min="2" max="6" step="0.5" value={dimA} onChange={(e) => setDimA(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Cạnh b</span><span className="text-indigo-600">{dimB}</span></div><input type="range" min="2" max="6" step="0.5" value={dimB} onChange={(e) => setDimB(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Chiều cao h</span><span className="text-indigo-600">{dimH}</span></div><input type="range" min="2" max="6.5" step="0.5" value={dimH} onChange={(e) => setDimH(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                        </>
                      )}
                      {(active3DMeta.kind === 'cone' || active3DMeta.kind === 'cylinder') && (
                        <>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Bán kính đáy r</span><span className="text-indigo-600">{dimR}</span></div><input type="range" min="1.5" max="4.5" step="0.3" value={dimR} onChange={(e) => setDimR(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Chiều cao h</span><span className="text-indigo-600">{dimH}</span></div><input type="range" min="2" max="6.5" step="0.5" value={dimH} onChange={(e) => setDimH(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                        </>
                      )}
                      {active3DMeta.kind === 'sphere' && (
                        <>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Bán kính cầu R</span><span className="text-indigo-600">{dimR}</span></div><input type="range" min="2" max="4.5" step="0.2" value={dimR} onChange={(e) => setDimR(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                          <label className="text-xs"><div className="flex justify-between font-semibold text-slate-700 mb-1"><span>Khoảng cách cắt d</span><span className="text-indigo-600">{planeD}</span></div><input type="range" min="0" max={Math.max(0.5, Number((dimR - 0.3).toFixed(1)))} step="0.2" value={planeD} onChange={(e) => setPlaneD(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                        </>
                      )}
                    </div>

                    <InteractiveMathRenderer
                      key={`3d_${selected3D}_${dimA}_${dimB}_${dimH}_${dimR}_${planeD}_${extraPoints.length}_${auxLines.length}_${auxPolygons.length}`}
                      data={config3D}
                      height={360}
                      interactive
                      showControls
                    />

                    {active3DMeta.kind === 'poly' && allVertexKeys.length >= 3 && (
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            <span>Công cụ Dựng hình 3D (Trung tuyến · Trọng tâm · Cạnh phụ · Thiết diện)</span>
                          </div>
                          {(extraPoints.length > 0 || auxLines.length > 0 || auxPolygons.length > 0) && (
                            <button type="button" onClick={() => { setExtraPoints([]); setAuxLines([]); setAuxPolygons([]); }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer">
                              <RotateCcw className="w-3 h-3" /> Xóa tất cả nét dựng
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'median', label: 'Vẽ Trung tuyến' },
                            { id: 'centroid', label: 'Vẽ Trọng tâm Δ' },
                            { id: 'point', label: 'Chấm điểm chia cạnh' },
                            { id: 'line', label: 'Nối cạnh / đường phụ' },
                            { id: 'plane', label: 'Tô Mặt phẳng thiết diện' }
                          ].map((t) => (
                            <button key={t.id} type="button" onClick={() => setTool3D(t.id)} className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${tool3D === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'}`}>
                              {t.label}
                            </button>
                          ))}
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-xs">
                          {tool3D === 'median' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-600">Từ đỉnh</span>
                              <select value={medApex} onChange={(e) => setMedApex(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <span className="font-semibold text-slate-600">tới trung điểm cạnh</span>
                              <select value={medE1} onChange={(e) => setMedE1(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={medE2} onChange={(e) => setMedE2(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <button type="button" onClick={handleDrawMedian} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /> Vẽ trung tuyến</button>
                            </div>
                          )}
                          {tool3D === 'centroid' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-600">Trọng tâm tam giác:</span>
                              <select value={centV1} onChange={(e) => setCentV1(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={centV2} onChange={(e) => setCentV2(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={centV3} onChange={(e) => setCentV3(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <button type="button" onClick={handleDrawCentroid} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /> Chấm trọng tâm</button>
                            </div>
                          )}
                          {tool3D === 'point' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <input type="text" maxLength={3} value={newPtName} onChange={(e) => setNewPtName(e.target.value)} className="w-12 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-center" />
                              <span className="text-slate-500">trên cạnh</span>
                              <select value={newPtV1} onChange={(e) => setNewPtV1(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={newPtV2} onChange={(e) => setNewPtV2(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={newPtRatio} onChange={(e) => setNewPtRatio(Number(e.target.value))} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"><option value={0.5}>1/2 (Trung điểm)</option><option value={0.333}>1/3</option><option value={0.667}>2/3</option><option value={0.25}>1/4</option></select>
                              <button type="button" onClick={handleAddExtraPoint} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /> Chấm điểm</button>
                            </div>
                          )}
                          {tool3D === 'line' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-600">Nối</span>
                              <select value={newLineFrom} onChange={(e) => setNewLineFrom(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <span>→</span>
                              <select value={newLineTo} onChange={(e) => setNewLineTo(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={newLineDash} onChange={(e) => setNewLineDash(Number(e.target.value))} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"><option value={2}>Nét đứt</option><option value={0}>Nét liền</option></select>
                              <select value={newLineColor} onChange={(e) => setNewLineColor(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold"><option value="#e11d48">Đỏ</option><option value="#059669">Xanh lá</option><option value="#2563eb">Xanh dương</option><option value="#d97706">Cam</option></select>
                              <button type="button" onClick={handleAddAuxLine} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /> Kẻ đoạn</button>
                            </div>
                          )}
                          {tool3D === 'plane' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-600">Tô mặt phẳng qua 3 điểm:</span>
                              <select value={planeV1} onChange={(e) => setPlaneV1(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={planeV2} onChange={(e) => setPlaneV2(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <select value={planeV3} onChange={(e) => setPlaneV3(e.target.value)} className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold">{allVertexKeys.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                              <button type="button" onClick={handleAddCrossSection} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"><Plus className="w-3.5 h-3.5" /> Tô thiết diện</button>
                            </div>
                          )}
                        </div>

                        {(extraPoints.length > 0 || auxLines.length > 0 || auxPolygons.length > 0) && (
                          <div className="flex flex-wrap gap-1.5">
                            {extraPoints.map((pt) => (
                              <span key={pt.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-[11px] font-bold text-pink-700">
                                {pt.centroidOf ? `Trọng tâm ${pt.id}` : `${pt.id} ∈ ${pt.edge?.[0]}${pt.edge?.[1]}`}
                                <button type="button" onClick={() => setExtraPoints((prev) => prev.filter((x) => x.id !== pt.id))} className="cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                              </span>
                            ))}
                            {auxLines.map((ln) => (
                              <span key={ln.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700">
                                {ln.label || `${ln.from}${ln.to}`}
                                <button type="button" onClick={() => setAuxLines((prev) => prev.filter((x) => x.id !== ln.id))} className="cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                              </span>
                            ))}
                            {auxPolygons.map((pl) => (
                              <span key={pl.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700">
                                Mặt phẳng {pl.label}
                                <button type="button" onClick={() => setAuxPolygons((prev) => prev.filter((x) => x.id !== pl.id))} className="cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-800 px-1">
                      {active3DMeta.formulas.map((f, i) => <KatexFormula key={i} latex={f} />)}
                    </div>
                  </div>
                )}

                {/* 2.2 MATH 2D GEOMETRY (FIXED SWITCHING + TOGGLES) */}
                {simMode === 'math2d' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {SHAPES_2D_LIST.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelected2D(s.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${selected2D === s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Layer Toggles */}
                    <div className="flex flex-wrap items-center gap-4 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={show2DAltitude} onChange={(e) => setShow2DAltitude(e.target.checked)} className="accent-indigo-600" />
                        <span>Đường cao</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={show2DMedian} onChange={(e) => setShow2DMedian(e.target.checked)} className="accent-indigo-600" />
                        <span>Trung tuyến</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={show2DCircum} onChange={(e) => setShow2DCircum(e.target.checked)} className="accent-indigo-600" />
                        <span>Đường tròn ngoại tiếp</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={show2DAxes} onChange={(e) => setShow2DAxes(e.target.checked)} className="accent-indigo-600" />
                        <span>Hệ trục Oxy</span>
                      </label>
                    </div>

                    <InteractiveMathRenderer
                      key={`2d_${selected2D}_${show2DAltitude}_${show2DMedian}_${show2DCircum}_${show2DAxes}`}
                      data={config2D}
                      height={380}
                      interactive
                      showControls
                    />
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs text-slate-700 leading-relaxed">
                      <MathText text={active2DMeta.desc} />
                      <div className="text-[11px] text-slate-400 mt-1.5">
                        Kéo thả trực tiếp các đỉnh màu xanh/đỏ trên hình để thay đổi kích thước &amp; góc tức thì.
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.3 USER-FRIENDLY FUNCTION GRAPH STUDIO */}
                {simMode === 'graph' && (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {GRAPH_2D_PRESETS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => { setGraphInput(g.input); setGraphFormula(g.formula); }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${graphInput === g.input ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-700 pl-1">y =</span>
                        <input
                          type="text"
                          value={graphInput}
                          onChange={(e) => {
                            setGraphInput(e.target.value);
                            setGraphFormula(`y = ${normalizeFriendlyExpr(e.target.value)}`);
                          }}
                          placeholder="Gõ tự nhiên: x² - 2x - 3, 2sin(x), √(x+2), |x² - 4|..."
                          className="flex-1 text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => { setGraphInput(''); setGraphFormula('y ='); }}
                          className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Student Math Keypad */}
                      <div className="flex flex-wrap gap-1.5">
                        {GRAPH_KEYPAD.map((k) => (
                          <button
                            key={k.label}
                            type="button"
                            onClick={() => {
                              const next = `${graphInput}${k.insert}`;
                              setGraphInput(next);
                              setGraphFormula(`y = ${normalizeFriendlyExpr(next)}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                          >
                            {k.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <InteractiveMathRenderer
                      key={`graph_${compiledGraphExpr}`}
                      data={configGraph}
                      height={380}
                      interactive
                      showControls
                    />
                  </div>
                )}

                {/* 2.4 UNIT CIRCLE & PHYSICS OSCILLATION */}
                {simMode === 'unit_circle' && <UnitCircleSimulator />}

                {/* 2.5 PHET + QUICK LABS */}
                {simMode === 'physics_lab' && <NativePhysicsLab />}
              </div>
            )}

            {/* ========================================================= */}
            {/* MAIN TAB 3: PURE CASIO FX-580VN X CALCULATOR BODY ONLY    */}
            {/* ========================================================= */}
            {mainTab === 'calculator' && (
              <div className="flex-1 flex items-center justify-center p-4 bg-slate-100/70 min-h-0 overflow-auto">
                <div className="relative w-[416px] h-[640px] max-w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 shrink-0">
                  <iframe
                    src="https://mathda.com/calculator/vi"
                    title="Máy tính khoa học Casio fx-580VN X"
                    className="absolute border-0"
                    style={{
                      width: '1000px',
                      height: '696px',
                      top: '-48px',
                      left: '-566px'
                    }}
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
