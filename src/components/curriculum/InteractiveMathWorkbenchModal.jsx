import React, { useState, useEffect, useRef, useMemo } from 'react';
import JXG from 'jsxgraph';
import { formatMathGraphTag, formatMathGraph3DTag, parseMathGraphTag, parseMathGraph3DTag } from '../../utils/mathGraphUtils';
import { 
  X, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Layers, 
  Compass, 
  Eye, 
  Copy, 
  Sliders, 
  Info,
  Box,
  TrendingUp,
  Triangle,
  Circle,
  Shapes,
  Maximize2,
  ChevronRight,
  Split,
  Edit2,
  Crosshair,
  Percent,
  Calculator,
  Plus,
  Trash2,
  Wand2,
  Zap,
  Activity,
  Maximize,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Share2,
  SlidersHorizontal,
  Move
} from 'lucide-react';
import MathText from '../common/MathText';

/**
 * Robust compiler from user math expressions to JavaScript callable functions
 * Handles: ^ -> **, 2x -> 2*x, sin, cos, tan, sqrt, abs, ln, exp, pi, e
 */
function compileMathFunction(exprStr) {
  if (!exprStr || typeof exprStr !== 'string') return null;
  try {
    let s = exprStr.toLowerCase().trim();
    const fnMap = [
      ['sin', 'Math.sin'],
      ['cos', 'Math.cos'],
      ['tan', 'Math.tan'],
      ['sqrt', 'Math.sqrt'],
      ['abs', 'Math.abs'],
      ['ln', 'Math.log'],
      ['log', 'Math.log10'],
      ['exp', 'Math.exp']
    ];
    fnMap.forEach(([k], i) => {
      s = s.replace(new RegExp(`\\b${k}\\b`, 'g'), `__FN_${i}__`);
    });
    s = s.replace(/\bpi\b/g, 'Math.PI');
    s = s.replace(/\be\b/g, 'Math.E');
    s = s.replace(/\^/g, '**');
    s = s.replace(/(\d)\s*([x(])/g, '$1*$2');
    s = s.replace(/(\))\s*([\dx(])/g, '$1*$2');
    s = s.replace(/([x])\s*(\()/g, '$1*$2');
    fnMap.forEach(([_, repl], i) => {
      s = s.replace(new RegExp(`__FN_${i}__`, 'g'), repl);
    });

    const fn = new Function('x', `
      try {
        const res = ${s};
        return (typeof res === 'number' && !isNaN(res) && isFinite(res)) ? res : NaN;
      } catch(e) {
        return NaN;
      }
    `);
    fn(1);
    return fn;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to generate default 3D base vertices dictionary for any shape
 */
function getDefaultBasePoints(shapeType, a, b, h) {
  switch (shapeType) {
    case 'pyramid_rect_sa':
      return {
        A: { label: 'A', x: 0, y: 0, z: 0, desc: 'Chân cao', color: '#dc2626' },
        B: { label: 'B', x: a, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
        C: { label: 'C', x: a, y: b, z: 0, desc: 'Đáy', color: '#0f172a' },
        D: { label: 'D', x: 0, y: b, z: 0, desc: 'Đáy', color: '#0f172a' },
        S: { label: 'S', x: 0, y: 0, z: h, desc: 'Đỉnh chóp', color: '#dc2626' }
      };
    case 'pyramid_tri_sa':
      return {
        A: { label: 'A', x: 0, y: 0, z: 0, desc: 'Chân cao', color: '#dc2626' },
        B: { label: 'B', x: a, y: 0, z: 0, desc: 'Đáy vuông', color: '#0f172a' },
        C: { label: 'C', x: a, y: b, z: 0, desc: 'Đáy', color: '#0f172a' },
        S: { label: 'S', x: 0, y: 0, z: h, desc: 'Đỉnh chóp', color: '#dc2626' }
      };
    case 'pyramid_regular_quad':
      return {
        O: { label: 'O', x: 0, y: 0, z: 0, desc: 'Tâm đáy', color: '#dc2626' },
        A: { label: 'A', x: -a/2, y: -b/2, z: 0, desc: 'Đáy', color: '#0f172a' },
        B: { label: 'B', x: a/2, y: -b/2, z: 0, desc: 'Đáy', color: '#0f172a' },
        C: { label: 'C', x: a/2, y: b/2, z: 0, desc: 'Đáy', color: '#0f172a' },
        D: { label: 'D', x: -a/2, y: b/2, z: 0, desc: 'Đáy', color: '#0f172a' },
        S: { label: 'S', x: 0, y: 0, z: h, desc: 'Đỉnh chóp', color: '#dc2626' }
      };
    case 'pyramid_regular_tri':
      return {
        G: { label: 'G', x: 0, y: 0, z: 0, desc: 'Trọng tâm', color: '#dc2626' },
        A: { label: 'A', x: 0, y: -b * 0.7, z: 0, desc: 'Đáy', color: '#0f172a' },
        B: { label: 'B', x: -a * 0.6, y: b * 0.4, z: 0, desc: 'Đáy', color: '#0f172a' },
        C: { label: 'C', x: a * 0.6, y: b * 0.4, z: 0, desc: 'Đáy', color: '#0f172a' },
        S: { label: 'S', x: 0, y: 0, z: h, desc: 'Đỉnh chóp', color: '#dc2626' }
      };
    case 'pyramid_side_perp':
      return {
        A: { label: 'A', x: 0, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
        B: { label: 'B', x: a, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
        H: { label: 'H', x: a / 2, y: 0, z: 0, desc: 'Chân cao', color: '#dc2626' },
        C: { label: 'C', x: a, y: b, z: 0, desc: 'Đáy', color: '#0f172a' },
        D: { label: 'D', x: 0, y: b, z: 0, desc: 'Đáy', color: '#0f172a' },
        S: { label: 'S', x: a / 2, y: 0, z: h, desc: 'Đỉnh chóp', color: '#dc2626' }
      };
    case 'prism_tri':
      return {
        A: { label: 'A', x: 0, y: 0, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        B: { label: 'B', x: a, y: 0, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        C: { label: 'C', x: a / 2, y: b, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        "A'": { label: "A'", x: 0, y: 0, z: h, desc: 'Đáy trên', color: '#2563eb' },
        "B'": { label: "B'", x: a, y: 0, z: h, desc: 'Đáy trên', color: '#2563eb' },
        "C'": { label: "C'", x: a / 2, y: b, z: h, desc: 'Đáy trên', color: '#2563eb' }
      };
    case 'box_cube':
      return {
        A: { label: 'A', x: 0, y: 0, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        B: { label: 'B', x: a, y: 0, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        C: { label: 'C', x: a, y: b, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        D: { label: 'D', x: 0, y: b, z: 0, desc: 'Đáy dưới', color: '#0f172a' },
        "A'": { label: "A'", x: 0, y: 0, z: h, desc: 'Đáy trên', color: '#2563eb' },
        "B'": { label: "B'", x: a, y: 0, z: h, desc: 'Đáy trên', color: '#2563eb' },
        "C'": { label: "C'", x: a, y: b, z: h, desc: 'Đáy trên', color: '#2563eb' },
        "D'": { label: "D'", x: 0, y: b, z: h, desc: 'Đáy trên', color: '#2563eb' }
      };
    default:
      return {};
  }
}

/**
 * Advanced Interactive MathLab Modal (JSXGraph Native Engine)
 * 2D Calculus VD/VDC & 3D Spatial Geometry with Vertex Repositioning/Renaming & Auxiliary Suite
 */
export default function InteractiveMathWorkbenchModal({
  isOpen,
  onClose,
  onInsert,
  targetField = 'sampleQuestion',
  initialTab = '2d_function',
  initialTag = ''
}) {
  if (!isOpen) return null;

  // JSXGraph Primary Sub-Modes: '2d_function' | '3d_space' | '2d_geometry'
  const [jsxSubTab, setJsxSubTab] = useState(
    initialTab === '3d_space' || initialTab === '2d_geometry' ? initialTab : '2d_function'
  );

  // Flow 3 Student Simulation Drawer
  const [showStudentPreview, setShowStudentPreview] = useState(false);

  // Copy toast state
  const [copiedText, setCopiedText] = useState('');

  // =============================================================
  // 1. STATE FOR 2D FUNCTION GRAPHING (ADVANCED VD / VDC EXAM TYPES)
  // =============================================================
  // 2D Exam Mode:
  // 'standard': SGK Standard & Asymptotes (Bậc 3, Trùng phương, Phân thức 1/1, Phân thức 2/1 có Tiệm Cận Xiên, Parabol, Lượng giác)
  // 'absolute_transform': Biến đổi trị tuyệt đối phức hợp: |f(x)|, f(|x|), |f(|x|)|, |f(x) + m| (tịnh tiến & đếm cực trị)
  // 'derivative_fprime': Đồ thị đạo hàm f'(x) & Bài toán hàm hợp tương giao f'(x) = h(x)
  // 'parametric_line': Biện luận tương giao f(x) = ax + m hoặc |f(x)| = m (đếm số nghiệm thời gian thực)
  // 'area_integral': Ứng dụng tích phân tính diện tích miền phẳng giới hạn bởi 2 đường cong
  // 'three_curves_recognition': Nhận dạng bộ 3 đồ thị f(x), f'(x), F(x) (đề thi THPT)
  const [exam2DMode, setExam2DMode] = useState('standard');

  const [funcInputMode, setFuncInputMode] = useState('preset'); // 'preset' | 'custom'
  const [funcType, setFuncType] = useState('cubic'); // 'cubic' | 'quartic' | 'rational_1_1' | 'rational_2_1' | 'quadratic' | 'trig'
  const [customExpr, setCustomExpr] = useState('x^3 - 3*x + 1');
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(0);
  const [paramC, setParamC] = useState(-3);
  const [paramD, setParamD] = useState(1);
  const [paramE, setParamE] = useState(1); // Hệ số e cho mẫu phân thức bậc 2/1

  // Phép biến đổi đồ thị trị tuyệt đối:
  // 'none' | 'abs_total' (|f(x)|) | 'abs_x' (f(|x|)) | 'abs_both' (|f(|x|)|) | 'abs_shifted' (|f(x) + m|) | 'abs_half' (f(x) + |f(x)|)
  const [absTransformType, setAbsTransformType] = useState('none');
  const [paramShiftM, setParamShiftM] = useState(0); // Tham số m dịch đồ thị trước khi lấy trị tuyệt đối

  // Đồ thị đạo hàm f'(x) & Bài toán tương giao f'(x) = h(x)
  const [showDerivativeCurve, setShowDerivativeCurve] = useState(true);
  const [showAuxiliaryCurve, setShowAuxiliaryCurve] = useState(true);
  const [auxiliaryType, setAuxiliaryType] = useState('linear'); // 'linear' | 'parabola' | 'custom'
  const [auxiliaryExpr, setAuxiliaryExpr] = useState('-x + 1');
  const [auxParamA, setAuxParamA] = useState(-0.5);
  const [auxParamB, setAuxParamB] = useState(1);

  // Biện luận nghiệm đường xiên tham số: y = slopeM * x + paramM
  const [slopeM, setSlopeM] = useState(0); // 0 = đường ngang y = m, khác 0 = đường xiên
  const [paramM, setParamM] = useState(1);
  const [foundRoots, setFoundRoots] = useState([]);

  // Ứng dụng tích phân tính diện tích giới hạn bởi 2 đường cong
  const [showIntegralArea, setShowIntegralArea] = useState(true);
  const [integralUpperExpr, setIntegralUpperExpr] = useState('4 - x^2');
  const [integralLowerExpr, setIntegralLowerExpr] = useState('x + 2');
  const [calculatedArea, setCalculatedArea] = useState(0);

  // Nhận dạng bộ 3 đường cong f(x), f'(x), F(x)
  const [showC1, setShowC1] = useState(true); // f(x)
  const [showC2, setShowC2] = useState(true); // f'(x)
  const [showC3, setShowC3] = useState(true); // F(x)
  const [hideCurveLabels, setHideCurveLabels] = useState(false); // Chế độ đố học sinh

  // Tiếp tuyến động & Cực trị
  const [showTangent, setShowTangent] = useState(false);
  const [tangentX0, setTangentX0] = useState(1);
  const [showInflectionLine, setShowInflectionLine] = useState(false); // Đường thẳng qua 2 điểm cực trị bậc 3

  // =============================================================
  // 2. STATE FOR 3D SPATIAL GEOMETRY (ĐA DẠNG HÌNH & KẺ ĐƯỜNG PHỤ)
  // =============================================================
  // 3D Shape Models:
  // 'pyramid_rect_sa': Chóp S.ABCD, SA perp (ABCD), đáy chữ nhật/vuông
  // 'pyramid_tri_sa': Chóp S.ABC, SA perp (ABC), đáy tam giác vuông
  // 'pyramid_regular_quad': Chóp tứ giác đều S.ABCD (SO perp đáy)
  // 'pyramid_regular_tri': Chóp tam giác đều S.ABC (SG perp đáy)
  // 'pyramid_side_perp': Chóp có (SAB) perp (ABCD), SH perp AB
  // 'prism_tri': Lăng trụ tam giác ABC.A'B'C' (đứng hoặc xiên)
  // 'box_cube': Hình hộp chữ nhật / Hình lập phương ABCD.A'B'C'D'
  // 'solid_revolution': Khối nón / Trụ tròn xoay
  // 'sphere_plane': Mặt cầu cắt mặt phẳng Oxyz
  const [shape3DType, setShape3DType] = useState('pyramid_rect_sa');

  // Dimension parameters
  const [shape3dHeight, setShape3dHeight] = useState(4);
  const [shape3dWidth, setShape3dWidth] = useState(4);
  const [shape3dDepth, setShape3dDepth] = useState(3.5);
  const [shape3dRadius, setShape3dRadius] = useState(3);
  const [planeD, setPlaneD] = useState(1.8);
  const [azimuthAngle, setAzimuthAngle] = useState(0.85);
  const [elevationAngle, setElevationAngle] = useState(0.35);
  const [show3DAxes, setShow3DAxes] = useState(false);

  // =============================================================
  // 3. TÙY CHỈNH VỊ TRÍ & ĐỔI TÊN CÁC ĐỈNH CỦA HÌNH 3D (USER REQUEST)
  // =============================================================
  const [isCustomizingBasePoints, setIsCustomizingBasePoints] = useState(false);
  const [customBasePoints, setCustomBasePoints] = useState(() => 
    getDefaultBasePoints('pyramid_rect_sa', 4, 3.5, 4)
  );

  // Reset base points to default according to current shape & dimensions
  const handleResetBasePoints = () => {
    setCustomBasePoints(getDefaultBasePoints(shape3DType, shape3dWidth, shape3dDepth, shape3dHeight));
  };

  // Update a single field (label, x, y, z) of a base vertex
  const handleUpdateBasePoint = (key, field, value) => {
    setCustomBasePoints(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'label' ? value : (parseFloat(value) || 0)
      }
    }));
  };

  // Switch 3D shape and reload corresponding base points
  const handleSelectShape3D = (newShape) => {
    setShape3DType(newShape);
    setCustomBasePoints(getDefaultBasePoints(newShape, shape3dWidth, shape3dDepth, shape3dHeight));
  };

  // Sync dimensions with base points if user is NOT in manual override mode
  useEffect(() => {
    if (!isCustomizingBasePoints) {
      setCustomBasePoints(getDefaultBasePoints(shape3DType, shape3dWidth, shape3dDepth, shape3dHeight));
    }
  }, [shape3DType, shape3dWidth, shape3dDepth, shape3dHeight, isCustomizingBasePoints]);

  // 3D Construction Presets (Các mô hình kẻ phụ kinh điển):
  // 'none': Khung cơ bản
  // 'distance_model': Mô hình khoảng cách 2 bước: kẻ AH perp BC, AK perp SH => d(A, (SBC)) = AK
  // 'angle_line_plane': Góc giữa đường thẳng và mặt phẳng (SC, (ABCD)) = góc SCA
  // 'cross_section_mid': Thiết diện cắt qua các trung điểm (MNPQ)
  const [exam3DConstructionPreset, setExam3DConstructionPreset] = useState('distance_model');

  // Toggle các đường phụ kinh điển:
  const [showPresetAuxLine2, setShowPresetAuxLine2] = useState(true); // Bước 2: AK perp SH
  const [showCrossSectionPlane, setShowCrossSectionPlane] = useState(true); // Thiết diện tô bóng

  // =============================================================
  // DYNAMIC AUXILIARY VERTICES & SEGMENT STUDIO (TỰ DO KẺ THÊM ĐƯỜNG)
  // =============================================================
  // Danh sách các ĐIỂM PHỤ do người dùng thêm vào (trên cạnh hoặc tự do)
  const [extraPoints, setExtraPoints] = useState([
    { id: 'M', name: 'M (Trung điểm SC)', edge: ['S', 'C'], ratio: 0.5, color: '#ec4899' },
    { id: 'K', name: 'K (AK ⊥ SH)', isPresetProjection: true, color: '#ef4444' }
  ]);

  // Form tạo điểm phụ mới
  const [newPtName, setNewPtName] = useState('N');
  const [newPtEdge1, setNewPtEdge1] = useState('S');
  const [newPtEdge2, setNewPtEdge2] = useState('B');
  const [newPtRatio, setNewPtRatio] = useState(0.5);
  const [newPtColor, setNewPtColor] = useState('#8b5cf6');

  // Danh sách các ĐƯỜNG KẺ PHỤ TỰ DO (Arbitrary Auxiliary Lines)
  const [customAuxLines, setCustomAuxLines] = useState([
    { id: '1', from: 'A', to: 'C', dash: 2, color: '#94a3b8', name: 'Đường chéo AC' },
    { id: '2', from: 'B', to: 'D', dash: 2, color: '#94a3b8', name: 'Đường chéo BD' },
    { id: '3', from: 'A', to: 'K', dash: 2, color: '#ef4444', name: 'AK ⊥ SB (Bước 2)' }
  ]);

  // Form thêm đường phụ mới
  const [newLineFrom, setNewLineFrom] = useState('S');
  const [newLineTo, setNewLineTo] = useState('C');
  const [newLineDash, setNewLineDash] = useState(2); // 2 = dashed (nét đứt SGK), 0 = solid (nét liền)
  const [newLineColor, setNewLineColor] = useState('#ef4444');

  // Parse initialTag if provided to hydrate edit mode
  useEffect(() => {
    if (!initialTag || typeof initialTag !== 'string') return;
    const tag = initialTag.trim();
    if (tag.toUpperCase().startsWith('[MATH_GRAPH_3D]')) {
      const parsed = parseMathGraph3DTag(tag);
      if (parsed) {
        setJsxSubTab('3d_space');
        if (parsed.shapeType) setShape3DType(parsed.shapeType);
        if (parsed.preset) setExam3DConstructionPreset(parsed.preset);
        if (parsed.dimensions) {
          if (parsed.dimensions.h) setShape3dHeight(parsed.dimensions.h);
          if (parsed.dimensions.w) setShape3dWidth(parsed.dimensions.w);
          if (parsed.dimensions.d) setShape3dDepth(parsed.dimensions.d);
          if (parsed.dimensions.r) setShape3dRadius(parsed.dimensions.r);
          if (parsed.dimensions.planeD) setPlaneD(parsed.dimensions.planeD);
        }
        if (parsed.vertices && Object.keys(parsed.vertices).length > 0) {
          setCustomBasePoints(parsed.vertices);
          setIsCustomizingBasePoints(true);
        }
        if (parsed.extraPoints && parsed.extraPoints.length > 0) {
          setExtraPoints(parsed.extraPoints);
        }
        if (parsed.auxLines && parsed.auxLines.length > 0) {
          setCustomAuxLines(parsed.auxLines);
        }
        if (parsed.azimuth !== undefined) setAzimuthAngle(parsed.azimuth);
        if (parsed.elevation !== undefined) setElevationAngle(parsed.elevation);
      }
    } else if (tag.toUpperCase().startsWith('[MATH_GRAPH]')) {
      const parsed = parseMathGraphTag(tag);
      if (parsed) {
        setJsxSubTab('2d_function');
        if (parsed.type === 'custom' || parsed.customExpr) {
          setFuncInputMode('custom');
          if (parsed.customExpr) setCustomExpr(parsed.customExpr);
        } else {
          setFuncInputMode('preset');
          if (parsed.type) setFuncType(parsed.type);
          if (parsed.params) {
            if (parsed.params.a !== undefined) setParamA(parsed.params.a);
            if (parsed.params.b !== undefined) setParamB(parsed.params.b);
            if (parsed.params.c !== undefined) setParamC(parsed.params.c);
            if (parsed.params.d !== undefined) setParamD(parsed.params.d);
            if (parsed.params.e !== undefined) setParamE(parsed.params.e);
          }
        }
        if (parsed.examMode) setExam2DMode(parsed.examMode);
        if (parsed.auxExpr) setAuxiliaryExpr(parsed.auxExpr);
        if (parsed.slopeM !== undefined) setSlopeM(parsed.slopeM);
        if (parsed.paramM !== undefined) setParamM(parsed.paramM);
        if (parsed.absTransform) setAbsTransformType(parsed.absTransform);
        if (parsed.shiftM !== undefined) setParamShiftM(parsed.shiftM);
        if (parsed.tangentX0 !== undefined) setTangentX0(parsed.tangentX0);
        if (parsed.showTangent !== undefined) setShowTangent(parsed.showTangent);
        if (parsed.integralUpper) setIntegralUpperExpr(parsed.integralUpper);
        if (parsed.integralLower) setIntegralLowerExpr(parsed.integralLower);
        if (parsed.hideCurveLabels !== undefined) setHideCurveLabels(parsed.hideCurveLabels);
      }
    }
  }, [initialTag]);

  // -------------------------------------------------------------
  // REFS FOR JSXGRAPH BOARDS
  // -------------------------------------------------------------
  const jxgContainerRef = useRef(null);
  const boardInstanceRef = useRef(null);

  // Helper copy to clipboard
  const handleCopyCode = (text, label = 'mã') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(`Đã copy ${label} vào Clipboard!`);
      setTimeout(() => setCopiedText(''), 2500);
    }
  };

  // Quick Preset switchers for 2D Functions
  const handleSelectFuncPreset = (type) => {
    setFuncInputMode('preset');
    setFuncType(type);
    if (type === 'cubic') {
      setParamA(1); setParamB(0); setParamC(-3); setParamD(1);
    } else if (type === 'quartic') {
      setParamA(1); setParamB(-2); setParamC(-1); setParamD(0);
    } else if (type === 'rational_1_1') {
      setParamA(2); setParamB(-1); setParamC(1); setParamD(1);
    } else if (type === 'rational_2_1') {
      // Phân thức bậc 2/1 có Tiệm cận xiên: y = (x^2 - x + 1)/(x - 1) = x + 1/(x-1)
      setParamA(1); setParamB(-1); setParamC(1); setParamD(1); setParamE(-1);
    } else if (type === 'quadratic') {
      setParamA(1); setParamB(-2); setParamC(-1); setParamD(0);
    } else if (type === 'trig') {
      setParamA(2); setParamB(1); setParamC(0); setParamD(0);
    }
  };

  // Thêm ĐIỂM PHỤ MỚI vào danh sách
  const handleAddExtraPoint = () => {
    if (!newPtName.trim()) return;
    const cleanName = newPtName.trim().toUpperCase();
    if (extraPoints.some(p => p.id === cleanName)) return;

    setExtraPoints(prev => [
      ...prev,
      {
        id: cleanName,
        name: `${cleanName} (∈ ${newPtEdge1}${newPtEdge2}, k=${newPtRatio})`,
        edge: [newPtEdge1, newPtEdge2],
        ratio: newPtRatio,
        color: newPtColor
      }
    ]);
    // Tự động gợi ý tên điểm tiếp theo
    const nextChars = ['P', 'Q', 'I', 'J', 'E', 'F', 'H', 'K', 'T'];
    const available = nextChars.find(c => !extraPoints.some(p => p.id === c) && c !== cleanName);
    if (available) setNewPtName(available);
  };

  const handleRemoveExtraPoint = (id) => {
    setExtraPoints(prev => prev.filter(p => p.id !== id));
    // Xóa luôn các đường phụ liên quan đến điểm này
    setCustomAuxLines(prev => prev.filter(l => l.from !== id && l.to !== id));
  };

  // Thêm ĐƯỜNG KẺ PHỤ MỚI vào danh sách
  const handleAddCustomLine = () => {
    if (newLineFrom === newLineTo) return;
    const exists = customAuxLines.some(l => 
      (l.from === newLineFrom && l.to === newLineTo) || 
      (l.from === newLineTo && l.to === newLineFrom)
    );
    if (exists) return;

    setCustomAuxLines(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        from: newLineFrom,
        to: newLineTo,
        dash: newLineDash,
        color: newLineColor,
        name: `Đoạn ${newLineFrom}${newLineTo}`
      }
    ]);
  };

  const handleRemoveCustomLine = (id) => {
    setCustomAuxLines(prev => prev.filter(l => l.id !== id));
  };

  // Danh sách tất cả các điểm có thể kẻ nối (bao gồm đỉnh gốc và điểm phụ với nhãn tùy biến)
  const availablePointsList = useMemo(() => {
    const baseList = Object.entries(customBasePoints).map(([key, data]) => ({
      id: key,
      label: `${data.label} (Gốc ${key})`
    }));
    const extraList = extraPoints.map(p => ({
      id: p.id,
      label: `${p.name} (Điểm phụ)`
    }));
    return [...baseList, ...extraList];
  }, [customBasePoints, extraPoints]);

  // Generate Current Formula String LaTeX
  const getCurrentFormulaString = () => {
    if (jsxSubTab === '2d_function') {
      if (exam2DMode === 'area_integral') {
        return `S = \\int_{x_1}^{x_2} |(${integralUpperExpr}) - (${integralLowerExpr})| dx \\approx ${calculatedArea.toFixed(2)}`;
      }
      if (exam2DMode === 'three_curves_recognition') {
        return `C_1: f(x) = x^3 - 3x,\\ C_2: f'(x) = 3x^2 - 3,\\ C_3: F(x) = \\frac{x^4}{4} - \\frac{3x^2}{2}`;
      }
      if (exam2DMode === 'derivative_fprime') {
        return `y = f'(x),\\ Tương\\ giao\\ với\\ d: y = ${auxiliaryExpr}`;
      }

      let baseFormula = '';
      if (funcInputMode === 'custom') {
        baseFormula = customExpr;
      } else if (funcType === 'cubic') {
        baseFormula = `${paramA === 1 ? '' : paramA === -1 ? '-' : paramA}x^3 ${paramB !== 0 ? (paramB > 0 ? `+ ${paramB}x^2` : `- ${Math.abs(paramB)}x^2`) : ''} ${paramC !== 0 ? (paramC > 0 ? `+ ${paramC}x` : `- ${Math.abs(paramC)}x`) : ''} ${paramD !== 0 ? (paramD > 0 ? `+ ${paramD}` : `- ${Math.abs(paramD)}`) : ''}`.trim();
      } else if (funcType === 'rational_1_1') {
        baseFormula = `\\frac{${paramA}x ${paramB >= 0 ? `+ ${paramB}` : `- ${Math.abs(paramB)}`}}{${paramC}x ${paramD >= 0 ? `+ ${paramD}` : `- ${Math.abs(paramD)}`}}`;
      } else if (funcType === 'rational_2_1') {
        baseFormula = `\\frac{${paramA}x^2 ${paramB >= 0 ? `+ ${paramB}x` : `- ${Math.abs(paramB)}x`} ${paramC >= 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`}}{${paramD}x ${paramE >= 0 ? `+ ${paramE}` : `- ${Math.abs(paramE)}`}}`;
      } else {
        baseFormula = `${paramA}x^2 ${paramB >= 0 ? `+ ${paramB}x` : `- ${Math.abs(paramB)}x`} ${paramC >= 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`}`;
      }

      if (absTransformType === 'abs_total') return `y = |${baseFormula}|`;
      if (absTransformType === 'abs_x') return `y = f(|x|)`;
      if (absTransformType === 'abs_both') return `y = |f(|x|)|`;
      if (absTransformType === 'abs_shifted') return `y = |f(x) ${paramShiftM >= 0 ? `+ ${paramShiftM}` : `- ${Math.abs(paramShiftM)}`}|`;
      if (absTransformType === 'abs_half') return `y = f(x) + |f(x)|`;
      if (exam2DMode === 'parametric_line') return `f(x) = ${baseFormula},\\ d: y = ${slopeM !== 0 ? `${slopeM}x + ` : ''}${paramM}`;
      return `y = ${baseFormula}`;
    }
    if (jsxSubTab === '3d_space') {
      const topLabel = customBasePoints['S']?.label || 'S';
      const baseLabels = ['A', 'B', 'C', 'D'].map(k => customBasePoints[k]?.label || k).join('');
      if (exam3DConstructionPreset === 'distance_model') return `Khoảng\\ cách\\ d(${customBasePoints['A']?.label || 'A'},\\ (${topLabel}BC)) = AK = \\frac{SA \\cdot AB}{\\sqrt{SA^2 + AB^2}}`;
      if (exam3DConstructionPreset === 'angle_line_plane') return `Góc\\ giữa\\ ${topLabel}C\\ và\\ (${baseLabels}):\\ \\widehat{${topLabel}CA}`;
      if (exam3DConstructionPreset === 'cross_section_mid') return `Thiết\\ diện\\ qua\\ các\\ trung\\ điểm\\ (MNPQ)`;
      if (shape3DType === 'solid_revolution') return `Khối\\ nón\\ tròn\\ xoay\\ (S,\\ R=${shape3dRadius},\\ h=${shape3dHeight})`;
      if (shape3DType === 'sphere_plane') return `Mặt\\ cầu\\ cắt\\ mặt\\ phẳng\\ theo\\ đường\\ tròn\\ r = \\sqrt{R^2 - d^2}`;
      return `Mô\\ hình\\ không\\ gian\\ đa\\ diện\\ ${topLabel}.${baseLabels}`;
    }
    return `Tam\\ giác\\ vuông\\ ABC\\ tại\\ A`;
  };

  // -------------------------------------------------------------
  // EFFECT: RENDER JSXGRAPH BOARD WITH DEEP VD/VDC CAPABILITIES
  // -------------------------------------------------------------
  useEffect(() => {
    if (!jxgContainerRef.current) return;

    if (boardInstanceRef.current) {
      try {
        JXG.JSXGraph.freeBoard(boardInstanceRef.current);
      } catch (err) {
        console.warn('Error freeing board:', err);
      }
      boardInstanceRef.current = null;
    }

    const containerId = jxgContainerRef.current.id;

    // ---------------------------------------------------------
    // A. 2D FUNCTION GRAPHING BOARD (EXAM VD / VDC SUITE)
    // ---------------------------------------------------------
    if (jsxSubTab === '2d_function') {
      const board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-6.5, 7, 6.5, -6],
        axis: true,
        showNavigation: true,
        showCopyright: false,
        pan: { enabled: true },
        zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needOption: false }
      });

      // 1. NHẬN DẠNG BỘ BA ĐỒ THỊ f(x), f'(x), F(x)
      if (exam2DMode === 'three_curves_recognition') {
        const f0 = (x) => x ** 3 - 3 * x;
        const fPrime = (x) => 3 * x ** 2 - 3;
        const fIntegral = (x) => (x ** 4) / 4 - (3 * x ** 2) / 2;

        if (showC1) {
          board.create('functiongraph', [f0, -6, 6], {
            strokeColor: '#2563eb',
            strokeWidth: 2.8,
            name: hideCurveLabels ? '(C_1)' : 'f(x) = x³ - 3x',
            withLabel: true,
            label: { position: 'top', color: '#2563eb', fontWeight: 'bold' }
          });
        }
        if (showC2) {
          board.create('functiongraph', [fPrime, -6, 6], {
            strokeColor: '#dc2626',
            strokeWidth: 2.2,
            dash: 2,
            name: hideCurveLabels ? '(C_2)' : "f'(x) = 3x² - 3",
            withLabel: true,
            label: { position: 'top', color: '#dc2626', fontWeight: 'bold' }
          });
        }
        if (showC3) {
          board.create('functiongraph', [fIntegral, -6, 6], {
            strokeColor: '#10b981',
            strokeWidth: 2.2,
            dash: 3,
            name: hideCurveLabels ? '(C_3)' : 'F(x) = ∫f(x)dx',
            withLabel: true,
            label: { position: 'top', color: '#10b981', fontWeight: 'bold' }
          });
        }
        boardInstanceRef.current = board;
        return;
      }

      // 2. DIỆN TÍCH HÌNH PHẲNG GIỚI HẠN BỞI 2 ĐƯỜNG CONG (TÍCH PHÂN ỨNG DỤNG)
      if (exam2DMode === 'area_integral') {
        const f1 = compileMathFunction(integralUpperExpr) || ((x) => 4 - x ** 2);
        const f2 = compileMathFunction(integralLowerExpr) || ((x) => x + 2);

        board.create('functiongraph', [f1, -6, 6], {
          strokeColor: '#2563eb',
          strokeWidth: 2.5,
          name: `f₁(x) = ${integralUpperExpr}`,
          withLabel: true,
          label: { position: 'top', color: '#2563eb', fontWeight: 'bold', fontSize: 11 }
        });

        board.create('functiongraph', [f2, -6, 6], {
          strokeColor: '#f97316',
          strokeWidth: 2.5,
          name: `f₂(x) = ${integralLowerExpr}`,
          withLabel: true,
          label: { position: 'top', color: '#f97316', fontWeight: 'bold', fontSize: 11 }
        });

        // Tìm giao điểm giữa f1 và f2
        const intersectX = [];
        let prevDiff = f1(-5) - f2(-5);
        for (let x = -5; x <= 5; x += 0.05) {
          const currDiff = f1(x) - f2(x);
          if (!isNaN(prevDiff) && !isNaN(currDiff) && prevDiff * currDiff <= 0) {
            intersectX.push(x - 0.025);
          }
          prevDiff = currDiff;
        }

        let areaVal = 0;
        if (intersectX.length >= 2) {
          const start = Math.min(intersectX[0], intersectX[1]);
          const end = Math.max(intersectX[0], intersectX[1]);
          const steps = 80;
          const dx = (end - start) / steps;
          const polyPoints = [];

          // upper curve points
          for (let x = start; x <= end; x += dx) {
            polyPoints.push([x, f1(x)]);
          }
          // lower curve points backwards
          for (let x = end; x >= start; x -= dx) {
            polyPoints.push([x, f2(x)]);
          }

          // calculate area
          for (let i = 0; i < steps; i++) {
            const xMid = start + i * dx + dx / 2;
            areaVal += Math.abs(f1(xMid) - f2(xMid)) * dx;
          }
          setCalculatedArea(areaVal);

          board.create('polygon', polyPoints, {
            fillColor: '#06b6d4',
            fillOpacity: 0.35,
            borders: { strokeColor: '#0891b2', strokeWidth: 1.5, dash: 2 },
            vertices: { visible: false },
            highlight: false
          });

          board.create('point', [start, f1(start)], {
            name: `A(${start.toFixed(2)})`, size: 3.5, color: '#0891b2', fixed: true
          });
          board.create('point', [end, f1(end)], {
            name: `B(${end.toFixed(2)})`, size: 3.5, color: '#0891b2', fixed: true
          });
        }
        boardInstanceRef.current = board;
        return;
      }

      // Base function evaluator f(x)
      let rawF = (x) => x;
      if (funcInputMode === 'custom') {
        const compiled = compileMathFunction(customExpr);
        if (compiled) rawF = compiled;
      } else {
        rawF = (x) => {
          if (funcType === 'cubic') return paramA * x ** 3 + paramB * x ** 2 + paramC * x + paramD;
          if (funcType === 'quartic') return paramA * x ** 4 + paramB * x ** 2 + paramC;
          if (funcType === 'rational_1_1') {
            const den = paramC * x + paramD;
            if (Math.abs(den) < 0.001) return NaN;
            return (paramA * x + paramB) / den;
          }
          if (funcType === 'rational_2_1') {
            const den = paramD * x + paramE;
            if (Math.abs(den) < 0.001) return NaN;
            return (paramA * x ** 2 + paramB * x + paramC) / den;
          }
          if (funcType === 'quadratic') return paramA * x ** 2 + paramB * x + paramC;
          if (funcType === 'trig') return paramA * Math.sin(paramB * x);
          return x;
        };
      }

      // Derivative function f'(x)
      const derivativeF = (x) => {
        const h = 0.0001;
        return (rawF(x + h) - rawF(x - h)) / (2 * h);
      };

      // Applied Transformation: |f(x)|, f(|x|), |f(|x|)|, |f(x) + m|, f(x) + |f(x)|
      const evaluateTransformedF = (x) => {
        if (absTransformType === 'abs_total') {
          return Math.abs(rawF(x));
        }
        if (absTransformType === 'abs_x') {
          return rawF(Math.abs(x));
        }
        if (absTransformType === 'abs_both') {
          return Math.abs(rawF(Math.abs(x)));
        }
        if (absTransformType === 'abs_shifted') {
          return Math.abs(rawF(x) + paramShiftM);
        }
        if (absTransformType === 'abs_half') {
          const val = rawF(x);
          return val + Math.abs(val);
        }
        return rawF(x);
      };

      // 3. TIỆM CẬN ĐỨNG & TIỆM CẬN XIÊN (GDPT 2018 - Hàm phân thức bậc 2/1)
      if (funcType === 'rational_2_1' && funcInputMode === 'preset') {
        const d = paramD;
        const e = paramE;
        const a = paramA;
        const b = paramB;
        const c = paramC;

        if (d !== 0) {
          // Tiệm cận đứng: x = -e / d
          const vertX = -e / d;
          board.create('line', [[vertX, -10], [vertX, 10]], {
            strokeColor: '#ef4444',
            strokeWidth: 2,
            dash: 2,
            name: `TCĐ: x = ${vertX.toFixed(2)}`,
            withLabel: true,
            label: { position: 'top', color: '#ef4444', fontWeight: 'bold', fontSize: 11 }
          });

          // Tiệm cận xiên: chia đa thức (ax^2 + bx + c) / (dx + e) = Ax + B + R/(dx+e)
          const slopeA = a / d;
          const interceptB = (b - slopeA * e) / d;
          board.create('line', [
            [0, interceptB],
            [1, slopeA + interceptB]
          ], {
            strokeColor: '#8b5cf6',
            strokeWidth: 2.2,
            dash: 2,
            name: `TCX: y = ${slopeA.toFixed(1)}x ${interceptB >= 0 ? `+ ${interceptB.toFixed(1)}` : `- ${Math.abs(interceptB).toFixed(1)}`}`,
            withLabel: true,
            label: { position: 'right', color: '#8b5cf6', fontWeight: 'bold', fontSize: 11 }
          });

          // Tâm đối xứng I (giao của 2 tiệm cận)
          const iy = slopeA * vertX + interceptB;
          board.create('point', [vertX, iy], {
            name: `I(${vertX.toFixed(1)}; ${iy.toFixed(1)}) - Tâm đối xứng`,
            size: 4,
            color: '#8b5cf6',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            fixed: true
          });
        }
      }

      // Plot Main Curve
      board.create('functiongraph', [evaluateTransformedF, -10, 10], {
        strokeColor: '#2563eb',
        strokeWidth: 2.8,
        highlight: false
      });

      // Ghost Curve when absolute transform is active (shows original underbelly in dashed gray)
      if (absTransformType !== 'none') {
        board.create('functiongraph', [rawF, -10, 10], {
          strokeColor: '#94a3b8',
          strokeWidth: 1.5,
          dash: 3,
          highlight: false
        });
      }

      // 4. CHUYÊN ĐỀ ĐỒ THỊ ĐẠO HÀM f'(x) & HÀM HỢP TƯƠNG GIAO
      if (exam2DMode === 'derivative_fprime') {
        if (showDerivativeCurve) {
          board.create('functiongraph', [derivativeF, -10, 10], {
            strokeColor: '#dc2626',
            strokeWidth: 2.4,
            dash: 2,
            name: "f'(x)",
            withLabel: true,
            label: { position: 'top', color: '#dc2626', fontWeight: 'bold' }
          });
        }

        if (showAuxiliaryCurve) {
          const evalAux = compileMathFunction(auxiliaryExpr) || ((x) => -x + 1);
          board.create('functiongraph', [evalAux, -10, 10], {
            strokeColor: '#f97316',
            strokeWidth: 2.2,
            name: `h(x) = ${auxiliaryExpr}`,
            withLabel: true,
            label: { position: 'top', color: '#f97316', fontWeight: 'bold', fontSize: 11 }
          });

          // Scan for intersection between f'(x) and h(x)
          const step = 0.05;
          let prevDiff = derivativeF(-6) - evalAux(-6);
          for (let x = -6; x <= 6; x += step) {
            const currDiff = derivativeF(x) - evalAux(x);
            if (!isNaN(prevDiff) && !isNaN(currDiff) && prevDiff * currDiff <= 0) {
              const rootX = x - step / 2;
              const rootY = evalAux(rootX);
              board.create('point', [rootX, rootY], {
                name: `x=${rootX.toFixed(2)}`,
                size: 4,
                color: '#dc2626',
                strokeColor: '#ffffff',
                strokeWidth: 2,
                fixed: true
              });
            }
            prevDiff = currDiff;
          }
        }
      }

      // 5. ĐƯỜNG THẲNG QUA 2 ĐIỂM CỰC TRỊ BẬC 3
      if (showInflectionLine && funcType === 'cubic' && paramA !== 0) {
        const A = 3 * paramA;
        const B = 2 * paramB;
        const C = paramC;
        const delta = B * B - 4 * A * C;
        if (delta > 0) {
          const x1 = (-B - Math.sqrt(delta)) / (2 * A);
          const x2 = (-B + Math.sqrt(delta)) / (2 * A);
          const y1 = rawF(x1);
          const y2 = rawF(x2);
          board.create('line', [[x1, y1], [x2, y2]], {
            strokeColor: '#8b5cf6',
            strokeWidth: 2,
            dash: 2,
            name: 'Đường thẳng qua 2 cực trị',
            withLabel: true,
            label: { position: 'top', color: '#8b5cf6', fontWeight: 'bold' }
          });
        }
      }

      // 6. ĐƯỜNG XIÊN THAM SỐ d: y = ax + m (BIỆN LUẬN SỐ NGHIỆM)
      if (exam2DMode === 'parametric_line') {
        board.create('line', [
          [0, paramM],
          [1, slopeM + paramM]
        ], {
          strokeColor: '#db2777',
          strokeWidth: 2.5,
          dash: 3,
          name: `d: y = ${slopeM !== 0 ? `${slopeM}x + ` : ''}${paramM.toFixed(2)}`,
          withLabel: true,
          label: { position: 'right', color: '#db2777', fontWeight: 'bold', fontSize: 12 }
        });

        // Scan for roots
        const detectedRoots = [];
        const step = 0.04;
        let prevDiff = evaluateTransformedF(-6) - (slopeM * -6 + paramM);
        for (let x = -6; x <= 6; x += step) {
          const currDiff = evaluateTransformedF(x) - (slopeM * x + paramM);
          if (!isNaN(prevDiff) && !isNaN(currDiff) && prevDiff * currDiff <= 0) {
            const rootX = x - step / 2;
            const rootY = slopeM * rootX + paramM;
            detectedRoots.push(rootX);
            board.create('point', [rootX, rootY], {
              name: `(${rootX.toFixed(2)}; ${rootY.toFixed(2)})`,
              size: 4.5,
              color: '#db2777',
              strokeColor: '#ffffff',
              strokeWidth: 2,
              fixed: true
            });
          }
          prevDiff = currDiff;
        }
        setFoundRoots(detectedRoots);
      }

      // 7. TIẾP TUYẾN ĐỘNG TẠI M(x0, y0)
      if (showTangent) {
        const y0 = evaluateTransformedF(tangentX0);
        const slope = (evaluateTransformedF(tangentX0 + 0.0001) - evaluateTransformedF(tangentX0 - 0.0001)) / 0.0002;
        board.create('point', [tangentX0, y0], {
          name: `M(${tangentX0.toFixed(2)}; ${y0.toFixed(2)})`,
          size: 4.5, color: '#f59e0b', strokeColor: '#ffffff', strokeWidth: 2, fixed: true
        });

        if (!isNaN(slope) && isFinite(slope)) {
          board.create('line', [
            [tangentX0, y0],
            [tangentX0 + 1, y0 + slope]
          ], {
            strokeColor: '#d97706', strokeWidth: 1.8, dash: 3,
            name: `k = ${slope.toFixed(2)}`, withLabel: true,
            label: { position: 'top', color: '#b45309', fontWeight: 'bold', fontSize: 11 }
          });
        }
      }

      boardInstanceRef.current = board;
    }

    // ---------------------------------------------------------
    // B. 3D SPATIAL GEOMETRY BOARD (DIVERSE SHAPES & AUXILIARY SUITE)
    // ---------------------------------------------------------
    else if (jsxSubTab === '3d_space') {
      const board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-7, 7, 7, -7],
        axis: false,
        showNavigation: true,
        showCopyright: false,
        pan: { enabled: false },
        zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needOption: false }
      });

      const view = board.create('view3d',
        [[-5, -4], [10, 8], [[-6, 6], [-6, 6], [-2, 8]]],
        {
          az: azimuthAngle,
          el: elevationAngle,
          trackball: { enabled: true },
          axesPosition: 'none',
          // Tắt các mặt phẳng thành hộp phía sau/trước để loại bỏ hoàn toàn hiện tượng vách lưới chia nửa màn hình
          xPlaneRear: { visible: false },
          yPlaneRear: { visible: false },
          zPlaneRear: { visible: false },
          xPlaneFront: { visible: false },
          yPlaneFront: { visible: false },
          zPlaneFront: { visible: false },
          xAxis: { visible: false },
          yAxis: { visible: false },
          zAxis: { visible: false }
        }
      );

      // Render custom vector Oxyz axes if enabled
      if (show3DAxes) {
        const ptO = view.create('point3d', [0, 0, 0], {
          name: 'O',
          size: 2.5,
          color: '#475569',
          fixed: true,
          withLabel: true,
          label: { offset: [-12, -8], color: '#334155', fontWeight: 'bold', fontSize: 11 }
        });
        const ptX = view.create('point3d', [5.5, 0, 0], {
          name: 'x',
          size: 1.5,
          color: '#ef4444',
          fixed: true,
          withLabel: true,
          label: { offset: [6, 2], color: '#dc2626', fontWeight: 'bold', fontSize: 12 }
        });
        view.create('line3d', [ptO, ptX], { straightFirst: false, straightLast: false, lastArrow: true, strokeColor: '#ef4444', strokeWidth: 2 });

        const ptY = view.create('point3d', [0, 5.5, 0], {
          name: 'y',
          size: 1.5,
          color: '#10b981',
          fixed: true,
          withLabel: true,
          label: { offset: [6, 6], color: '#059669', fontWeight: 'bold', fontSize: 12 }
        });
        view.create('line3d', [ptO, ptY], { straightFirst: false, straightLast: false, lastArrow: true, strokeColor: '#10b981', strokeWidth: 2 });

        const ptZ = view.create('point3d', [0, 0, 6.5], {
          name: 'z',
          size: 1.5,
          color: '#3b82f6',
          fixed: true,
          withLabel: true,
          label: { offset: [-4, 10], color: '#2563eb', fontWeight: 'bold', fontSize: 12 }
        });
        view.create('line3d', [ptO, ptZ], { straightFirst: false, straightLast: false, lastArrow: true, strokeColor: '#3b82f6', strokeWidth: 2 });

        // Negative rays
        const ptXNeg = view.create('point3d', [-2.5, 0, 0], { visible: false, fixed: true });
        view.create('line3d', [ptO, ptXNeg], { straightFirst: false, straightLast: false, dash: 2, strokeColor: '#fca5a5', strokeWidth: 1.2 });
        const ptYNeg = view.create('point3d', [0, -2.5, 0], { visible: false, fixed: true });
        view.create('line3d', [ptO, ptYNeg], { straightFirst: false, straightLast: false, dash: 2, strokeColor: '#86efac', strokeWidth: 1.2 });
        const ptZNeg = view.create('point3d', [0, 0, -2], { visible: false, fixed: true });
        view.create('line3d', [ptO, ptZNeg], { straightFirst: false, straightLast: false, dash: 2, strokeColor: '#93c5fd', strokeWidth: 1.2 });
      }

      // Dictionary to store all 3D points
      const ptsMap = {};
      const coordMap = {};

      // Helper to register points
      const regPt = (key, coords, opts) => {
        coordMap[key] = coords;
        ptsMap[key] = view.create('point3d', coords, opts);
        return ptsMap[key];
      };

      // 1. DỰNG TẤT CẢ CÁC ĐỈNH CƠ BẢN DỰA TRÊN customBasePoints (HỖ TRỢ SỬA TỌA ĐỘ VÀ ĐỔI TÊN)
      Object.entries(customBasePoints).forEach(([key, ptData]) => {
        regPt(key, [ptData.x, ptData.y, ptData.z], {
          name: ptData.label || key,
          size: key === 'S' || key === 'O' || key === 'G' ? 4 : 3.5,
          color: ptData.color || '#0f172a'
        });
      });

      // 2. VẼ CÁC CẠNH KHUNG HÌNH HỌC DỰA TRÊN LOẠI HÌNH ĐANG CHỌN
      if (shape3DType === 'pyramid_rect_sa' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'pyramid_tri_sa' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['S']) {
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'pyramid_regular_quad' && ptsMap['O'] && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
        view.create('line3d', [ptsMap['S'], ptsMap['O']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#94a3b8', strokeWidth: 1.5, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#94a3b8', strokeWidth: 1.5, dash: 2 });

        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'pyramid_regular_tri' && ptsMap['G'] && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['S']) {
        view.create('line3d', [ptsMap['S'], ptsMap['G']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'pyramid_side_perp' && ptsMap['A'] && ptsMap['B'] && ptsMap['H'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
        view.create('line3d', [ptsMap['S'], ptsMap['H']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.5, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['S'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'prism_tri' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap["A'"] && ptsMap["B'"] && ptsMap["C'"]) {
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap["A'"], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap["B'"], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap["C'"], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

        view.create('line3d', [ptsMap['A'], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
      }
      else if (shape3DType === 'box_cube' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap["A'"] && ptsMap["B'"] && ptsMap["C'"] && ptsMap["D'"]) {
        view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        view.create('line3d', [ptsMap['A'], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });

        view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap['B'], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['C'], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptsMap['D'], ptsMap["D'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });

        view.create('line3d', [ptsMap["A'"], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap["B'"], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap["C'"], ptsMap["D'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
        view.create('line3d', [ptsMap["D'"], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
      }
      else if (shape3DType === 'solid_revolution') {
        const R = shape3dRadius;
        const ptO = view.create('point3d', [0, 0, 0], { name: 'O (Tâm đáy)', size: 3, color: '#0f172a' });
        const ptS = view.create('point3d', [0, 0, shape3dHeight], { name: 'S (Đỉnh nón)', size: 4, color: '#ef4444' });
        view.create('line3d', [ptS, ptO], { straightFirst: false, straightLast: false, strokeColor: '#ef4444', strokeWidth: 2, dash: 2 });
        view.create('circle3d', [ptO, [0, 0, 1], R], { strokeColor: '#2563eb', strokeWidth: 2 });
        const ptA = view.create('point3d', [-R, 0, 0], { name: 'A', size: 3 });
        const ptB = view.create('point3d', [R, 0, 0], { name: 'B', size: 3 });
        view.create('line3d', [ptS, ptA], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptS, ptB], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        view.create('line3d', [ptA, ptB], { straightFirst: false, straightLast: false, strokeColor: '#94a3b8', strokeWidth: 1.5, dash: 2 });
      }
      else if (shape3DType === 'sphere_plane') {
        const R = shape3dRadius;
        const d = Math.min(planeD, R - 0.2);
        const rIntersection = Math.sqrt(Math.max(0.1, R * R - d * d));
        const ptI = view.create('point3d', [0, 0, 0], { name: 'I(0,0,0)', size: 4, color: '#ef4444' });
        const ptH = view.create('point3d', [0, 0, d], { name: 'H', size: 3.5, color: '#f59e0b' });
        view.create('sphere3d', [ptI, R], { fillColor: '#93c5fd', fillOpacity: 0.2, strokeColor: '#3b82f6', strokeWidth: 1.2 });
        const s = 4.5;
        const p1 = view.create('point3d', [-s, -s, d], { visible: false });
        const p2 = view.create('point3d', [s, -s, d], { visible: false });
        const p3 = view.create('point3d', [s, s, d], { visible: false });
        const p4 = view.create('point3d', [-s, s, d], { visible: false });
        view.create('polygon3d', [p1, p2, p3, p4], { fillColor: '#a7f3d0', fillOpacity: 0.35, borders: { strokeColor: '#10b981', strokeWidth: 1.8 } });
        view.create('circle3d', [ptH, [0, 0, 1], rIntersection], { strokeColor: '#dc2626', strokeWidth: 3 });
        view.create('line3d', [ptI, ptH], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2, dash: 2 });
      }

      // 3. DỰNG TẤT CẢ CÁC ĐIỂM PHỤ TÙY Ý (EXTRA POINTS)
      extraPoints.forEach(pt => {
        if (pt.isPresetProjection && ptsMap['S'] && ptsMap['B']) {
          const cS = coordMap['S'] || [0, 0, shape3dHeight];
          const cB = coordMap['B'] || [shape3dWidth, 0, 0];
          const aVal = cB[0];
          const hVal = cS[2];
          const kX = (aVal * (hVal ** 2)) / (aVal ** 2 + hVal ** 2);
          const kZ = ((aVal ** 2) * hVal) / (aVal ** 2 + hVal ** 2);
          ptsMap[pt.id] = view.create('point3d', [kX, 0, kZ], { name: pt.name, size: 4, color: pt.color || '#ef4444' });
          coordMap[pt.id] = [kX, 0, kZ];
        } else if (pt.edge && pt.edge.length === 2) {
          const c1 = coordMap[pt.edge[0]];
          const c2 = coordMap[pt.edge[1]];
          if (c1 && c2) {
            const k = pt.ratio !== undefined ? pt.ratio : 0.5;
            const px = (1 - k) * c1[0] + k * c2[0];
            const py = (1 - k) * c1[1] + k * c2[1];
            const pz = (1 - k) * c1[2] + k * c2[2];
            ptsMap[pt.id] = view.create('point3d', [px, py, pz], { name: pt.name, size: 3.5, color: pt.color || '#ec4899' });
            coordMap[pt.id] = [px, py, pz];
          }
        }
      });

      // 4. MÔ HÌNH KINH ĐIỂN PRESET (Khoảng cách d(A, (SBC)), góc mặt phẳng, thiết diện)
      if (exam3DConstructionPreset === 'distance_model' && ptsMap['A'] && ptsMap['K']) {
        if (showPresetAuxLine2) {
          // Đường vuông góc phụ AK (màu đỏ rực nét đứt)
          view.create('line3d', [ptsMap['A'], ptsMap['K']], {
            straightFirst: false, straightLast: false, strokeColor: '#ef4444', strokeWidth: 3, dash: 2
          });
        }
        if (ptsMap['S'] && ptsMap['B'] && ptsMap['C']) {
          view.create('polygon3d', [ptsMap['S'], ptsMap['B'], ptsMap['C']], {
            fillColor: '#93c5fd', fillOpacity: 0.28, borders: { visible: false }
          });
        }
      }
      else if (exam3DConstructionPreset === 'angle_line_plane' && ptsMap['S'] && ptsMap['C'] && ptsMap['A']) {
        view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#f59e0b', strokeWidth: 2.2, dash: 2 });
        view.create('polygon3d', [ptsMap['S'], ptsMap['A'], ptsMap['C']], {
          fillColor: '#fde68a', fillOpacity: 0.35, borders: { strokeColor: '#f59e0b', strokeWidth: 1.5 }
        });
      }
      else if (exam3DConstructionPreset === 'cross_section_mid' && ptsMap['S'] && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D']) {
        const cS = coordMap['S'] || [0, 0, shape3dHeight];
        const cA = coordMap['A'] || [0, 0, 0];
        const cB = coordMap['B'] || [shape3dWidth, 0, 0];
        const cC = coordMap['C'] || [shape3dWidth, shape3dDepth, 0];
        const cD = coordMap['D'] || [0, shape3dDepth, 0];

        const pM = view.create('point3d', [(cS[0] + cA[0]) / 2, (cS[1] + cA[1]) / 2, (cS[2] + cA[2]) / 2], { name: 'M (∈ SA)', size: 3.5, color: '#ec4899' });
        const pN = view.create('point3d', [(cS[0] + cB[0]) / 2, (cS[1] + cB[1]) / 2, (cS[2] + cB[2]) / 2], { name: 'N (∈ SB)', size: 3.5, color: '#ec4899' });
        const pP = view.create('point3d', [(cS[0] + cC[0]) / 2, (cS[1] + cC[1]) / 2, (cS[2] + cC[2]) / 2], { name: 'P (∈ SC)', size: 3.5, color: '#ec4899' });
        const pQ = view.create('point3d', [(cS[0] + cD[0]) / 2, (cS[1] + cD[1]) / 2, (cS[2] + cD[2]) / 2], { name: 'Q (∈ SD)', size: 3.5, color: '#ec4899' });

        if (showCrossSectionPlane) {
          view.create('polygon3d', [pM, pN, pP, pQ], {
            fillColor: '#f472b6', fillOpacity: 0.45, borders: { strokeColor: '#db2777', strokeWidth: 2.5 }
          });
        }
      }

      // 5. RENDER TẤT CẢ CÁC ĐƯỜNG PHỤ DO NGƯỜI DÙNG THÊM TÙY Ý (CUSTOM AUX LINES)
      customAuxLines.forEach((line) => {
        const p1 = ptsMap[line.from];
        const p2 = ptsMap[line.to];
        if (p1 && p2) {
          view.create('line3d', [p1, p2], {
            straightFirst: false,
            straightLast: false,
            strokeColor: line.color || '#ef4444',
            strokeWidth: 2.4,
            dash: line.dash || 0
          });
        }
      });

      boardInstanceRef.current = board;
    }

    // ---------------------------------------------------------
    // C. 2D PLANE GEOMETRY BOARD
    // ---------------------------------------------------------
    else if (jsxSubTab === '2d_geometry') {
      const board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-5, 6, 7, -4],
        axis: false,
        showNavigation: true,
        showCopyright: false
      });

      const pA = board.create('point', [0, 0], { name: 'A (Góc vuông)', size: 4, color: '#ef4444', fixed: true });
      const pB = board.create('point', [5, 0], { name: 'B', size: 4, color: '#2563eb' });
      const pC = board.create('point', [0, 4], { name: 'C', size: 4, color: '#10b981' });

      board.create('segment', [pA, pB], { strokeColor: '#0f172a', strokeWidth: 2.5 });
      board.create('segment', [pA, pC], { strokeColor: '#0f172a', strokeWidth: 2.5 });
      const hyp = board.create('segment', [pB, pC], { strokeColor: '#0f172a', strokeWidth: 2.5 });

      const pH = board.create('glider', [2, 1.5, hyp], { name: 'H (Đường cao)', size: 3.5, color: '#f59e0b' });
      board.create('segment', [pA, pH], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });

      const pM = board.create('midpoint', [pB, pC], { name: 'M (Tâm ngoại tiếp)', size: 3, color: '#8b5cf6' });
      board.create('circle', [pM, pB], { strokeColor: '#8b5cf6', strokeWidth: 1.5, dash: 3 });

      boardInstanceRef.current = board;
    }

    return () => {
      if (boardInstanceRef.current) {
        try {
          JXG.JSXGraph.freeBoard(boardInstanceRef.current);
        } catch (e) {
          console.warn('Free board on unmount:', e);
        }
        boardInstanceRef.current = null;
      }
    };
  }, [
    jsxSubTab,
    exam2DMode,
    funcInputMode,
    funcType,
    customExpr,
    paramA,
    paramB,
    paramC,
    paramD,
    paramE,
    absTransformType,
    paramShiftM,
    showDerivativeCurve,
    showAuxiliaryCurve,
    auxiliaryExpr,
    slopeM,
    paramM,
    showIntegralArea,
    integralUpperExpr,
    integralLowerExpr,
    showC1,
    showC2,
    showC3,
    hideCurveLabels,
    showTangent,
    tangentX0,
    showInflectionLine,
    shape3DType,
    customBasePoints,
    exam3DConstructionPreset,
    shape3dHeight,
    shape3dWidth,
    shape3dDepth,
    shape3dRadius,
    planeD,
    showPresetAuxLine2,
    showCrossSectionPlane,
    extraPoints,
    customAuxLines,
    azimuthAngle,
    elevationAngle,
    show3DAxes
  ]);

  // Compute the current canonical snippet tag for insert & simulation preview
  const currentSnippetTag = useMemo(() => {
    if (jsxSubTab === '2d_function') {
      return formatMathGraphTag({
        title: funcInputMode === 'custom' ? 'Đồ thị hàm số tùy chọn' : 'Đồ thị hàm số Vận dụng & Vận dụng cao',
        formula: getCurrentFormulaString(),
        examMode: exam2DMode,
        type: funcInputMode === 'custom' ? 'custom' : funcType,
        params: { a: paramA, b: paramB, c: paramC, d: paramD, e: paramE },
        customExpr: funcInputMode === 'custom' ? customExpr : '',
        auxExpr: auxiliaryExpr,
        slopeM,
        paramM,
        absTransform: absTransformType,
        shiftM: paramShiftM,
        tangentX0,
        showTangent,
        integralUpper: integralUpperExpr,
        integralLower: integralLowerExpr,
        hideCurveLabels
      });
    } else if (jsxSubTab === '3d_space') {
      return formatMathGraph3DTag({
        title: 'Mô hình không gian tùy biến đỉnh & kẻ đường phụ',
        shapeType: shape3DType,
        preset: exam3DConstructionPreset,
        formula: `$${getCurrentFormulaString()}$`,
        dimensions: { h: shape3dHeight, w: shape3dWidth, d: shape3dDepth, r: shape3dRadius, planeD },
        vertices: customBasePoints,
        extraPoints,
        auxLines: customAuxLines,
        azimuth: azimuthAngle,
        elevation: elevationAngle
      });
    } else {
      return `\n\n[MATH_GEOMETRY_2D]\ntitle: Hình học phẳng 2D\nformula: $Tam\\ giác\\ vuông\\ ABC\\ tại\\ A$\n[/MATH_GEOMETRY_2D]\n\n`;
    }
  }, [
    jsxSubTab, funcInputMode, funcType, paramA, paramB, paramC, paramD, paramE, customExpr,
    exam2DMode, auxiliaryExpr, slopeM, paramM, absTransformType, paramShiftM, tangentX0, showTangent,
    integralUpperExpr, integralLowerExpr, hideCurveLabels, shape3DType, exam3DConstructionPreset,
    shape3dHeight, shape3dWidth, shape3dDepth, shape3dRadius, planeD, customBasePoints, extraPoints,
    customAuxLines, azimuthAngle, elevationAngle
  ]);

  // Handle Insert into Current Authoring Studio (Flow 2)
  const handleInsertToStudio = () => {
    if (onInsert) {
      onInsert(currentSnippetTag, targetField);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* ========================================================= */}
        {/* MODAL HEADER: CLEAN JSXGRAPH ENGINE TITLE & SUB-TABS */}
        {/* ========================================================= */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  MathLab 2D / 3D (JSXGraph Native Engine)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Offline • 60 FPS Canvas/SVG • Đổi tên & Sửa tọa độ đỉnh
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Hình học không gian chỉnh đỉnh tùy ý, kẻ đường phụ • Đồ thị VD/VDC tiệm cận xiên, trị tuyệt đối & đạo hàm
              </p>
            </div>
          </div>

          {/* Sub-Tabs Selector Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setJsxSubTab('2d_function')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                jsxSubTab === '2d_function'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>📈 Đồ Thị VD / VDC</span>
            </button>

            <button
              type="button"
              onClick={() => setJsxSubTab('3d_space')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                jsxSubTab === '3d_space'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-4 h-4 text-indigo-600" />
              <span>🧊 Không Gian 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setJsxSubTab('2d_geometry')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                jsxSubTab === '2d_geometry'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Triangle className="w-4 h-4 text-indigo-600" />
              <span>📐 Hình Phẳng 2D</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy toast */}
        {copiedText && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copiedText}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* BODY CONTENT */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-3">
          
          <div className="flex flex-col gap-3 flex-1">
            
            {/* Formula Preview Header Badge */}
            <div className="flex items-center justify-between gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-800">
                  {jsxSubTab === '2d_function' && 'Đồ Thị Tọa Độ Oxy Chuyên Sâu (VD / VDC)'}
                  {jsxSubTab === '3d_space' && 'Không Gian Oxyz (Chỉnh Tọa Độ Đỉnh, Đổi Tên & Kẻ Đường Phụ)'}
                  {jsxSubTab === '2d_geometry' && 'Mặt Phẳng Hình Học Tương Tác'}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500">Mô hình:</span>
                <span className="text-xs font-extrabold text-indigo-700">
                  <MathText text={`$${getCurrentFormulaString()}$`} />
                </span>
              </div>
            </div>

            {/* Main Grid: Controls on Left, Live Board on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[520px]">
              
              {/* --------------------------------------------------- */}
              {/* LEFT COLUMN: HIGH CUSTOMIZATION CONTROLS */}
              {/* --------------------------------------------------- */}
              <div className="lg:col-span-5 flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto max-h-[640px]">
                
                {/* ================================================= */}
                {/* A. 2D FUNCTION CONTROLS (VD & VDC SPECIALTIES) */}
                {/* ================================================= */}
                {jsxSubTab === '2d_function' && (
                  <div className="flex flex-col gap-3">
                    
                    {/* Chuyên đề Toán THPT Selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        Chọn Chuyên đề Đồ thị VD / VDC:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'standard', label: '1. Khảo sát & Tiệm cận xiên' },
                          { id: 'absolute_transform', label: '2. Biến đổi trị tuyệt đối' },
                          { id: 'derivative_fprime', label: '3. Đạo hàm f\'(x) & Tương giao' },
                          { id: 'parametric_line', label: '4. Biện luận y = ax + m' },
                          { id: 'area_integral', label: '5. Tích phân 2 đường cong' },
                          { id: 'three_curves_recognition', label: '6. Nhận dạng f, f\', F(x)' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setExam2DMode(item.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                              exam2DMode === item.id
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CHUYÊN ĐỀ 1: KHẢO SÁT & TIỆM CẬN XIÊN (GDPT 2018) */}
                    {exam2DMode === 'standard' && (
                      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex p-0.5 bg-slate-200 rounded-lg text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setFuncInputMode('preset')}
                            className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                              funcInputMode === 'preset' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Dạng Chuẩn SGK
                          </button>
                          <button
                            type="button"
                            onClick={() => setFuncInputMode('custom')}
                            className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                              funcInputMode === 'custom' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Gõ Hàm Tự Do
                          </button>
                        </div>

                        {funcInputMode === 'preset' ? (
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'cubic', label: 'Bậc 3' },
                                { id: 'rational_2_1', label: 'TC Xiên (2/1)' },
                                { id: 'rational_1_1', label: 'Phân thức 1/1' },
                                { id: 'quartic', label: 'Trùng phương' },
                                { id: 'quadratic', label: 'Parabol' },
                                { id: 'trig', label: 'Lượng giác' }
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => handleSelectFuncPreset(t.id)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                    funcType === t.id ? 'bg-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>

                            {funcType === 'rational_2_1' && (
                              <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-medium">
                                💡 <b>Hàm phân thức bậc 2 trên bậc 1 (GDPT 2018):</b> Tự động vẽ <b>Tiệm Cận Đứng</b> (đỏ nét đứt), <b>Tiệm Cận Xiên</b> (tím nét đứt) và giao điểm <b>Tâm đối xứng I</b>!
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
                              <div className="flex items-center gap-2">
                                <span className="w-12">Hệ số a:</span>
                                <input type="range" min="-4" max="4" step="0.5" value={paramA} onChange={(e) => setParamA(parseFloat(e.target.value) || 0)} className="flex-1 accent-indigo-600" />
                                <span className="w-6">{paramA}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-12">Hệ số b:</span>
                                <input type="range" min="-4" max="4" step="0.5" value={paramB} onChange={(e) => setParamB(parseFloat(e.target.value) || 0)} className="flex-1 accent-indigo-600" />
                                <span className="w-6">{paramB}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-12">Hệ số c:</span>
                                <input type="range" min="-4" max="4" step="0.5" value={paramC} onChange={(e) => setParamC(parseFloat(e.target.value) || 0)} className="flex-1 accent-indigo-600" />
                                <span className="w-6">{paramC}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={customExpr}
                              onChange={(e) => setCustomExpr(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-indigo-300 rounded-lg bg-white"
                              placeholder="x^3 - 3*x + 1..."
                            />
                            <div className="flex flex-wrap gap-1">
                              {['abs(x^2 - 4)', '(x^2 - 2*x + 3)/(x - 1)', 'sqrt(9 - x^2)', 'sin(2*x) + cos(x)', 'x * exp(-x)'].map((ex, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setCustomExpr(ex)}
                                  className="px-2 py-0.5 rounded bg-white text-[10px] font-bold border hover:bg-indigo-50"
                                >
                                  {ex}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CHUYÊN ĐỀ 2: BIẾN ĐỔI ĐỒ THỊ TRỊ TUYỆT ĐỐI (VD/VDC) */}
                    {exam2DMode === 'absolute_transform' && (
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 flex flex-col gap-2.5">
                        <span className="text-xs font-black text-purple-900">
                          Phép biến đổi đồ thị chứa dấu giá trị tuyệt đối:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'none', label: '1. Đồ thị gốc f(x)' },
                            { id: 'abs_total', label: '2. y = |f(x)| (Lật dưới Ox)' },
                            { id: 'abs_x', label: '3. y = f(|x|) (Đối xứng qua Oy)' },
                            { id: 'abs_both', label: '4. y = |f(|x|)| (Kết hợp)' },
                            { id: 'abs_shifted', label: '5. y = |f(x) + m| (Tịnh tiến)' },
                            { id: 'abs_half', label: '6. y = f(x) + |f(x)|' }
                          ].map((abs) => (
                            <button
                              key={abs.id}
                              type="button"
                              onClick={() => setAbsTransformType(abs.id)}
                              className={`px-2 py-1.5 rounded-lg text-left text-xs font-bold border cursor-pointer ${
                                absTransformType === abs.id
                                  ? 'bg-purple-600 text-white shadow-2xs'
                                  : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-100'
                              }`}
                            >
                              {abs.label}
                            </button>
                          ))}
                        </div>

                        {absTransformType === 'abs_shifted' && (
                          <div className="p-2 bg-white rounded-lg border border-purple-200 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                              <span>Tham số dịch chuyển m:</span>
                              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">{paramShiftM}</span>
                            </div>
                            <input
                              type="range" min="-5" max="5" step="0.5" value={paramShiftM}
                              onChange={(e) => setParamShiftM(parseFloat(e.target.value) || 0)}
                              className="w-full accent-purple-600"
                            />
                          </div>
                        )}

                        <div className="text-[11px] text-purple-800 italic">
                          💡 Đường nét đứt màu xám hiển thị dáng điệu đồ thị gốc trước khi biến đổi.
                        </div>
                      </div>
                    )}

                    {/* CHUYÊN ĐỀ 3: ĐỒ THỊ ĐẠO HÀM f'(x) & HÀM HỢP TƯƠNG GIAO */}
                    {exam2DMode === 'derivative_fprime' && (
                      <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col gap-2.5">
                        <span className="text-xs font-black text-rose-950">
                          Khảo sát đồ thị Đạo Hàm f'(x) & Tương giao hàm hợp:
                        </span>
                        <label className="flex items-center gap-2 text-xs font-bold text-rose-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showDerivativeCurve}
                            onChange={(e) => setShowDerivativeCurve(e.target.checked)}
                            className="rounded text-rose-600"
                          />
                          <span>Vẽ đường cong Đạo Hàm f'(x) (màu đỏ nét đứt)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-rose-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showAuxiliaryCurve}
                            onChange={(e) => setShowAuxiliaryCurve(e.target.checked)}
                            className="rounded text-rose-600"
                          />
                          <span>Vẽ đường phụ h(x) để xét f'(x) = h(x)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-900">Hàm h(x):</span>
                          <input
                            type="text"
                            value={auxiliaryExpr}
                            onChange={(e) => setAuxiliaryExpr(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs font-mono font-bold border border-rose-300 rounded-lg bg-white"
                            placeholder="-x + 1..."
                          />
                        </div>
                        <div className="text-[11px] text-rose-800 italic">
                          💡 Các chấm đỏ đánh dấu các nghiệm x_i (hoành độ giao điểm), là các điểm cực trị của hàm hiệu g(x) = f(x) - ∫h(x)dx.
                        </div>
                      </div>
                    )}

                    {/* CHUYÊN ĐỀ 4: BIỆN LUẬN NGHIỆM VỚI ĐƯỜNG XIÊN y = ax + m */}
                    {exam2DMode === 'parametric_line' && (
                      <div className="p-3 rounded-xl bg-pink-50/80 border border-pink-200 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-pink-950">
                            Đường thẳng tham số d: y = {slopeM !== 0 ? `${slopeM}x + ` : ''}m
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-200 text-pink-900">
                            {foundRoots.length} Nghiệm
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-pink-900">
                          <span className="w-12">Hệ số a:</span>
                          <input
                            type="range" min="-2" max="2" step="0.5" value={slopeM}
                            onChange={(e) => setSlopeM(parseFloat(e.target.value) || 0)}
                            className="flex-1 accent-pink-600"
                          />
                          <span className="w-8">{slopeM}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-pink-900">
                          <span className="w-12">Tham số m:</span>
                          <input
                            type="range" min="-5" max="5" step="0.2" value={paramM}
                            onChange={(e) => setParamM(parseFloat(e.target.value) || 0)}
                            className="flex-1 accent-pink-600"
                          />
                          <span className="w-8">{paramM}</span>
                        </div>
                      </div>
                    )}

                    {/* CHUYÊN ĐỀ 5: DIỆN TÍCH TÍCH PHÂN 2 ĐƯỜNG CONG */}
                    {exam2DMode === 'area_integral' && (
                      <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 flex flex-col gap-2">
                        <span className="text-xs font-black text-cyan-950">
                          Diện tích hình phẳng giới hạn bởi 2 đường cong:
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-900">
                          <span className="w-16">Đường 1:</span>
                          <input
                            type="text"
                            value={integralUpperExpr}
                            onChange={(e) => setIntegralUpperExpr(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs font-mono font-bold border border-cyan-300 rounded-lg bg-white"
                            placeholder="4 - x^2"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-900">
                          <span className="w-16">Đường 2:</span>
                          <input
                            type="text"
                            value={integralLowerExpr}
                            onChange={(e) => setIntegralLowerExpr(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs font-mono font-bold border border-cyan-300 rounded-lg bg-white"
                            placeholder="x + 2"
                          />
                        </div>
                        <div className="p-2 rounded bg-white border border-cyan-200 text-xs font-bold text-cyan-800 flex items-center justify-between">
                          <span>Diện tích miền phẳng S:</span>
                          <span className="text-sm font-black text-cyan-600">≈ {calculatedArea.toFixed(3)}</span>
                        </div>
                      </div>
                    )}

                    {/* CHUYÊN ĐỀ 6: NHẬN DẠNG BỘ BA ĐỒ THỊ f(x), f'(x), F(x) */}
                    {exam2DMode === 'three_curves_recognition' && (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-2 text-xs font-bold text-emerald-950">
                        <span>Nhận dạng bộ 3 đồ thị THPT:</span>
                        <div className="flex flex-col gap-1.5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showC1} onChange={(e) => setShowC1(e.target.checked)} className="rounded text-blue-600" />
                            <span className="text-blue-700">Đường C₁: f(x) = x³ - 3x (Xanh dương)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showC2} onChange={(e) => setShowC2(e.target.checked)} className="rounded text-red-600" />
                            <span className="text-red-700">Đường C₂: f'(x) = 3x² - 3 (Đỏ nét đứt)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showC3} onChange={(e) => setShowC3(e.target.checked)} className="rounded text-emerald-600" />
                            <span className="text-emerald-700">Đường C₃: F(x) = x⁴/4 - 3x²/2 (Xanh lá)</span>
                          </label>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-emerald-200/60">
                          <input type="checkbox" checked={hideCurveLabels} onChange={(e) => setHideCurveLabels(e.target.checked)} className="rounded text-emerald-600" />
                          <span>Ẩn tên hàm (Chế độ câu hỏi trắc nghiệm đố học sinh)</span>
                        </label>
                      </div>
                    )}

                    {/* TIỆN ÍCH PHỤ: ĐƯỜNG NỐI CỰC TRỊ, TIẾP TUYẾN */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs font-medium text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showInflectionLine}
                          onChange={(e) => setShowInflectionLine(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>📍 Đường thẳng qua 2 điểm Cực Đại & Cực Tiểu</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTangent}
                          onChange={(e) => setShowTangent(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        <span>📐 Tiếp tuyến động tại M(x₀)</span>
                      </label>
                    </div>

                  </div>
                )}

                {/* ================================================= */}
                {/* B. 3D SPATIAL GEOMETRY (ĐA DẠNG HÌNH & KẺ ĐƯỜNG PHỤ) */}
                {/* ================================================= */}
                {jsxSubTab === '3d_space' && (
                  <div className="flex flex-col gap-3">
                    
                    {/* B1. Chọn Loại Hình Không Gian Đa Dạng */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        1. Chọn Loại Hình Không Gian THPT:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'pyramid_rect_sa', label: 'Chóp S.ABCD (SA ⊥ đáy)' },
                          { id: 'pyramid_tri_sa', label: 'Chóp S.ABC (SA ⊥ đáy)' },
                          { id: 'pyramid_regular_quad', label: 'Chóp Tứ Giác Đều (SO ⊥ đáy)' },
                          { id: 'pyramid_regular_tri', label: 'Chóp Tam Giác Đều (SG ⊥ đáy)' },
                          { id: 'pyramid_side_perp', label: 'Mặt bên vuông đáy (SAB ⊥)' },
                          { id: 'prism_tri', label: 'Lăng Trụ Tam Giác ABC.A\'B\'C\'' },
                          { id: 'box_cube', label: 'Hình Hộp / Lập Phương' },
                          { id: 'solid_revolution', label: 'Nón / Trụ Tròn Xoay' },
                          { id: 'sphere_plane', label: 'Cầu cắt Phẳng Oxyz' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectShape3D(item.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-left text-[11px] font-bold border transition-all cursor-pointer ${
                              shape3DType === item.id
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* B2. TOGGLE TÙY CHỈNH VỊ TRÍ & ĐỔI TÊN ĐỈNH (USER REQUEST) */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/90 border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={isCustomizingBasePoints}
                          onChange={(e) => setIsCustomizingBasePoints(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                        <span className="flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Tùy chỉnh vị trí (X, Y, Z) & Đổi tên các đỉnh</span>
                        </span>
                      </label>
                      {isCustomizingBasePoints && (
                        <button
                          type="button"
                          onClick={handleResetBasePoints}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                          title="Khôi phục lại tọa độ và tên đỉnh mặc định"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Mặc định</span>
                        </button>
                      )}
                    </div>

                    {/* B2.1. BẢNG DANH SÁCH ĐỈNH ĐỂ SỬA TỌA ĐỘ VÀ TÊN */}
                    {isCustomizingBasePoints && (
                      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex flex-col gap-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-950 flex items-center gap-1">
                            <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Bảng tọa độ và tên đỉnh của hình:</span>
                          </span>
                          <span className="text-[10px] text-indigo-700 font-bold">
                            {Object.keys(customBasePoints).length} Đỉnh
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                          {Object.entries(customBasePoints).map(([key, pt]) => (
                            <div key={key} className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col gap-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pt.color || '#0f172a' }} />
                                  <span>Gốc <b>{key}</b> ({pt.desc || 'Đỉnh'}):</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-500 font-medium">Tên hiển thị:</span>
                                  <input
                                    type="text"
                                    value={pt.label}
                                    onChange={(e) => handleUpdateBasePoint(key, 'label', e.target.value)}
                                    className="w-16 px-1.5 py-0.5 font-bold text-xs text-indigo-700 border border-indigo-200 rounded bg-indigo-50/50 text-center uppercase"
                                    maxLength={6}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-600 pt-0.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-red-600 font-black">X:</span>
                                  <input
                                    type="number"
                                    step="0.2"
                                    value={pt.x}
                                    onChange={(e) => handleUpdateBasePoint(key, 'x', e.target.value)}
                                    className="w-full px-1 py-0.5 border rounded bg-slate-50 text-slate-800 text-center"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600 font-black">Y:</span>
                                  <input
                                    type="number"
                                    step="0.2"
                                    value={pt.y}
                                    onChange={(e) => handleUpdateBasePoint(key, 'y', e.target.value)}
                                    className="w-full px-1 py-0.5 border rounded bg-slate-50 text-slate-800 text-center"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600 font-black">Z:</span>
                                  <input
                                    type="number"
                                    step="0.2"
                                    value={pt.z}
                                    onChange={(e) => handleUpdateBasePoint(key, 'z', e.target.value)}
                                    className="w-full px-1 py-0.5 border rounded bg-slate-50 text-slate-800 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                          💡 Thay đổi tên hoặc tọa độ sẽ cập nhật ngay lập tức các cạnh và đường phụ trên mô hình 3D.
                        </div>
                      </div>
                    )}

                    {/* B3. Chọn Mô hình Kẻ Đường Phụ Đề Thi */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        2. Mô hình Kẻ Phụ Kinh Điển (VD / VDC):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'distance_model', label: 'Khoảng cách d(A, (SBC))' },
                          { id: 'angle_line_plane', label: 'Góc Đường và Mặt phẳng' },
                          { id: 'cross_section_mid', label: 'Thiết diện cắt (MNPQ)' },
                          { id: 'none', label: 'Tự do hoàn toàn' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setExam3DConstructionPreset(m.id)}
                            className={`px-2 py-1 rounded-lg text-left text-xs font-bold border cursor-pointer ${
                              exam3DConstructionPreset === m.id
                                ? 'bg-amber-50 border-amber-500 text-amber-800'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* B4. MÔ TẢ MÔ HÌNH 2 BƯỚC KẺ d(A, (SBC)) */}
                    {exam3DConstructionPreset === 'distance_model' && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col gap-1.5 text-xs">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-600" />
                          <span>Mô hình 2 bước kẻ khoảng cách từ chân đường cao:</span>
                        </span>
                        <div className="space-y-1 text-slate-700 text-[11px]">
                          <div>• <b>Bước 1:</b> Kẻ $AH \perp BC$ (đáy vuông tại $B$ nên $H \equiv B$).</div>
                          <div>• <b>Bước 2:</b> Trong $(SAB)$, kẻ $AK \perp SB$ tại $K$.</div>
                          <div>• <b>Kết luận:</b> $AK \perp (SBC) \Rightarrow d(A, (SBC)) = AK$.</div>
                        </div>
                        <label className="flex items-center gap-2 font-bold text-amber-900 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={showPresetAuxLine2}
                            onChange={(e) => setShowPresetAuxLine2(e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span>Hiện đường vuông góc phụ AK (màu đỏ nét đứt)</span>
                        </label>
                      </div>
                    )}

                    {/* B5. CÔNG CỤ TẠO ĐIỂM PHỤ MỚI TRÊN CẠNH */}
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-950 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-purple-600" />
                          <span>Thêm Điểm Phụ Trên Cạnh (Trung điểm / Trọng tâm):</span>
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold">
                          {extraPoints.length} Điểm
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-slate-700">
                        <div>
                          <span>Tên điểm:</span>
                          <input
                            type="text"
                            value={newPtName}
                            onChange={(e) => setNewPtName(e.target.value.toUpperCase())}
                            className="w-full mt-1 p-1 border rounded-lg bg-white text-xs font-bold uppercase"
                            placeholder="M, N..."
                            maxLength={3}
                          />
                        </div>
                        <div>
                          <span>Trên cạnh:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <select
                              value={newPtEdge1}
                              onChange={(e) => setNewPtEdge1(e.target.value)}
                              className="w-1/2 p-1 border rounded bg-white text-xs"
                            >
                              {availablePointsList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                            <select
                              value={newPtEdge2}
                              onChange={(e) => setNewPtEdge2(e.target.value)}
                              className="w-1/2 p-1 border rounded bg-white text-xs"
                            >
                              {availablePointsList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <span>Tỉ lệ k ({newPtRatio}):</span>
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              type="button"
                              onClick={() => setNewPtRatio(0.5)}
                              className="px-1 py-1 rounded bg-white border text-[10px] hover:bg-purple-100"
                              title="Trung điểm (1/2)"
                            >
                              1/2
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewPtRatio(0.33)}
                              className="px-1 py-1 rounded bg-white border text-[10px] hover:bg-purple-100"
                              title="Trọng tâm (1/3)"
                            >
                              1/3
                            </button>
                            <input
                              type="range" min="0.1" max="0.9" step="0.1" value={newPtRatio}
                              onChange={(e) => setNewPtRatio(parseFloat(e.target.value))}
                              className="w-12 accent-purple-600"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddExtraPoint}
                        className="w-full py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo Điểm {newPtName} trên cạnh này</span>
                      </button>

                      {/* List of custom points */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {extraPoints.map((pt) => (
                          <span key={pt.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-900">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pt.color }} />
                            <span>{pt.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExtraPoint(pt.id)}
                              className="text-slate-400 hover:text-rose-600 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* B6. CÔNG CỤ KẺ THÊM ĐƯỜNG PHỤ TỰ DO */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-950 flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Kẻ Đường Thẳng Phụ (Nối 2 Điểm Bất Kỳ):</span>
                        </span>
                        <span className="text-[10px] text-indigo-700 font-bold">
                          {customAuxLines.length} Đường
                        </span>
                      </div>

                      {/* Controls to add new line */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                        <div>
                          <span>Từ điểm:</span>
                          <select
                            value={newLineFrom}
                            onChange={(e) => setNewLineFrom(e.target.value)}
                            className="w-full mt-1 p-1.5 border rounded-lg bg-white"
                          >
                            {availablePointsList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <span>Đến điểm:</span>
                          <select
                            value={newLineTo}
                            onChange={(e) => setNewLineTo(e.target.value)}
                            className="w-full mt-1 p-1.5 border rounded-lg bg-white"
                          >
                            {availablePointsList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <div className="flex-1">
                          <span>Kiểu nét:</span>
                          <select
                            value={newLineDash}
                            onChange={(e) => setNewLineDash(parseInt(e.target.value, 10))}
                            className="w-full mt-1 p-1.5 border rounded-lg bg-white text-xs"
                          >
                            <option value={2}>Nét đứt (Khuất - SGK)</option>
                            <option value={0}>Nét liền (Nhìn thấy)</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <span>Màu nét:</span>
                          <select
                            value={newLineColor}
                            onChange={(e) => setNewLineColor(e.target.value)}
                            className="w-full mt-1 p-1.5 border rounded-lg bg-white text-xs"
                          >
                            <option value="#ef4444">Đỏ rực</option>
                            <option value="#f59e0b">Vàng cam</option>
                            <option value="#8b5cf6">Tím neon</option>
                            <option value="#10b981">Xanh lá</option>
                            <option value="#2563eb">Xanh dương</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCustomLine}
                        className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kẻ đường thẳng {newLineFrom}{newLineTo} này</span>
                      </button>

                      {/* List of custom lines */}
                      <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pt-1">
                        {customAuxLines.map((line) => (
                          <div key={line.id} className="flex items-center justify-between px-2 py-1 bg-white rounded border border-slate-200 text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                              <span>Đoạn {line.from}{line.to} ({line.dash === 2 ? 'Nét đứt' : 'Nét liền'})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomLine(line.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Xóa đường này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dimension Sliders */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Kích thước tổng thể:
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="w-16">Cao h:</span>
                        <input type="range" min="2" max="7" step="0.5" value={shape3dHeight} onChange={(e) => setShape3dHeight(parseFloat(e.target.value) || 4)} className="flex-1 accent-indigo-600" />
                        <span className="w-6">{shape3dHeight}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="w-16">Đáy a:</span>
                        <input type="range" min="2" max="6" step="0.5" value={shape3dWidth} onChange={(e) => setShape3dWidth(parseFloat(e.target.value) || 4)} className="flex-1 accent-indigo-600" />
                        <span className="w-6">{shape3dWidth}</span>
                      </div>
                    </div>

                    {/* 3D Orbit Tip */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Nhấn giữ chuột trái để xoay 3D 360°</span>
                      <button
                        type="button"
                        onClick={() => { setAzimuthAngle(0.85); setElevationAngle(0.35); }}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Góc SGK
                      </button>
                    </div>

                  </div>
                )}

                {/* ================================================= */}
                {/* C. 2D PLANE GEOMETRY */}
                {/* ================================================= */}
                {jsxSubTab === '2d_geometry' && (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Hình học phẳng 2D:</span>
                    <p>Tam giác vuông $ABC$ tại $A$, đường cao $AH$, đường tròn ngoại tiếp tâm $M$. Dùng chuột kéo các đỉnh để quan sát.</p>
                  </div>
                )}

              </div>

              {/* --------------------------------------------------- */}
              {/* RIGHT COLUMN: INTERACTIVE JSXGRAPH CANVAS BOARD */}
              {/* --------------------------------------------------- */}
              <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-300 shadow-sm p-3 relative">
                
                {/* Canvas Toolbar Badge */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800">
                      {jsxSubTab === '2d_function' && 'Đồ Thị Oxy Chuyên Sâu (VD / VDC)'}
                      {jsxSubTab === '3d_space' && 'Không Gian Oxyz (Chỉnh Đỉnh Tùy Ý & Kẻ Đường Phụ)'}
                      {jsxSubTab === '2d_geometry' && 'Mặt Phẳng Hình Học Tương Tác'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                      Lăn chuột Zoom • Kéo Di chuyển
                    </span>
                    {jsxSubTab === '3d_space' && (
                      <button
                        type="button"
                        onClick={() => setShow3DAxes(!show3DAxes)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          show3DAxes
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        title={show3DAxes ? 'Ẩn hệ trục tọa độ Oxyz' : 'Hiện hệ trục tọa độ Oxyz'}
                      >
                        <Compass className={`w-3.5 h-3.5 ${show3DAxes ? 'text-white' : 'text-indigo-600'}`} />
                        <span>{show3DAxes ? 'Đang bật Oxyz' : 'Trục Oxyz'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(getCurrentFormulaString(), 'công thức')}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy công thức LaTeX"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy LaTeX</span>
                    </button>
                  </div>
                </div>

                {/* JSXGraph Canvas DOM Container */}
                <div className={`flex-1 w-full min-h-[440px] relative rounded-xl overflow-hidden border border-slate-200 ${
                  jsxSubTab === '3d_space' ? 'bg-grid-notebook' : 'bg-white'
                }`}>
                  <div
                    id="jsxgraph_board_container"
                    ref={jxgContainerRef}
                    className={`jxgbox w-full h-full min-h-[440px] ${
                      jsxSubTab === '3d_space' ? 'jxgbox-3d-grid' : ''
                    }`}
                  />
                </div>

                {/* High-contrast status indicator */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Engine: <b>JSXGraph v1.14.0</b> (Native React Vector Engine)</span>
                  <span className="font-semibold text-indigo-600">Render 60 FPS Canvas/SVG</span>
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================= */}
          {/* FLOW 3 PREVIEW DRAWER (STUDENT ADAPTIVE QUIZ VIEW) */}
          {/* ======================================================= */}
          {showStudentPreview && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1.5">
                <span className="text-xs font-black text-indigo-950">
                  👁️ Mô phỏng Giao Diện Học Sinh khi làm bài thi Adaptive Quiz (Flow 3)
                </span>
                <button
                  type="button"
                  onClick={() => setShowStudentPreview(false)}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Thu gọn
                </button>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm flex flex-col gap-2.5">
                <div className="text-xs font-bold text-slate-800">
                  <b>Câu hỏi (Mức độ Vận dụng cao):</b> Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \perp (ABCD)$. Kẻ đường cao phụ $AK \perp SB$. Tính khoảng cách $d(A, (SBC))$?
                </div>
                <div className="rounded-xl border border-indigo-100 overflow-hidden shadow-xs">
                  <MathText text={currentSnippetTag} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white cursor-pointer font-medium">
                    A. <MathText text="$d(A, (SBC)) = AK = \frac{SA \cdot AB}{\sqrt{SA^2 + AB^2}}$" />
                  </div>
                  <div className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white cursor-pointer font-medium">
                    B. <MathText text="$d(A, (SBC)) = \frac{1}{2} SC$" />
                  </div>
                  <div className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white cursor-pointer font-medium">
                    C. <MathText text="$d(A, (SBC)) = SB$" />
                  </div>
                  <div className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white cursor-pointer font-medium">
                    D. <MathText text="$d(A, (SBC)) = \frac{a \sqrt{3}}{2}$" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER: ACTION BUTTONS (FLOW 2 & FLOW 3) */}
        {/* ========================================================= */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStudentPreview(!showStudentPreview)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{showStudentPreview ? 'Đóng xem thử Flow 3' : 'Mô phỏng Flow 3 (Học sinh)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopyCode(getCurrentFormulaString(), 'công thức')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy LaTeX</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleInsertToStudio}
              className="px-5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>📥 Chèn Mô Hình Này Vào Bài Soạn (Flow 2)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
