import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MenuItem, Select } from '@mui/material';
import JXG from 'jsxgraph';
import {
  formatMathGraphTag,
  formatMathGraph3DTag,
  formatMathGeometry2DTag,
  parseMathGraphTag,
  parseMathGraph3DTag,
  parseMathGeometry2DTag,
  getDefault2DGeometryPoints,
  mount2DGeometryBoard,
  SHAPES_2D_META
} from '../../utils/mathGraphUtils';
import {
  X,
  Check,
  RotateCcw,
  Compass,
  Eye,
  Copy,
  Box,
  TrendingUp,
  Triangle,
  Plus,
  Trash2,
  SlidersHorizontal,
  GitBranch,
  MapPin
} from 'lucide-react';
import MathText, { renderKatexHtml } from '../common/MathText';

const COLOR_SWATCHES = [
  { hex: '#ef4444', label: 'Đỏ' },
  { hex: '#f59e0b', label: 'Cam' },
  { hex: '#10b981', label: 'Xanh lá' },
  { hex: '#2563eb', label: 'Xanh dương' },
  { hex: '#6366f1', label: 'Chàm' },
  { hex: '#ec4899', label: 'Hồng' },
  { hex: '#0f172a', label: 'Đen' }
];

const COMPACT_MUI_SELECT_SX = {
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  fontSize: '12px',
  fontWeight: 600,
  color: '#1e293b',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#64748b' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1E3A5F', borderWidth: '1.5px' },
  '& .MuiSelect-select': { py: '5px', px: '10px', minHeight: 'unset' }
};

function KatexInline({ latex, className = '' }) {
  const html = useMemo(() => renderKatexHtml(latex || '', false), [latex]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

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
export default function InteractiveMathWorkbenchModal(props) {
  if (!props.isOpen) return null;
  return <OpenMathWorkbench {...props} />;
}

function OpenMathWorkbench({
  isOpen,
  onClose,
  onInsert,
  targetField = 'sampleQuestion',
  initialTab = '2d_function',
  initialTag = ''
}) {

  // JSXGraph Primary Sub-Modes: '2d_function' | '3d_space' | '2d_geometry'
  const [jsxSubTab, setJsxSubTab] = useState(
    initialTab === '3d_space' || initialTab === '2d_geometry' ? initialTab : '2d_function'
  );

  // Flow 3 Student Simulation Drawer
  const [showStudentPreview, setShowStudentPreview] = useState(false);

  // Left Inspector Sub-Tabs for clean organization
  const [panel3DTab, setPanel3DTab] = useState('shape'); // 'shape' | 'aux' | 'vertices'
  const [panel2DFuncTab, setPanel2DFuncTab] = useState('function'); // 'function' | 'analysis'
  const [panel2DGeoTab, setPanel2DGeoTab] = useState('shape'); // 'shape' | 'aux'

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
  // Danh sách các ĐIỂM PHỤ do người dùng thêm vào (trên cạnh, chân đường vuông góc, hoặc tự do — đều sửa được nhãn trực tiếp!)
  const [extraPoints, setExtraPoints] = useState([
    { id: 'M', name: 'M', edge: ['S', 'C'], ratio: 0.5, color: '#ec4899' },
    { id: 'K', name: 'K', isPerpendicularFoot: true, fromPoint: 'A', edge: ['S', 'B'], color: '#ef4444' }
  ]);

  // Form tạo điểm phụ mới trên cạnh
  const [newPtName, setNewPtName] = useState('N');
  const [newPtLabel, setNewPtLabel] = useState('');
  const [newPtEdge1, setNewPtEdge1] = useState('S');
  const [newPtEdge2, setNewPtEdge2] = useState('B');
  const [newPtRatio, setNewPtRatio] = useState(0.5);
  const [newPtColor, setNewPtColor] = useState('#6366f1');

  // Form hạ đường vuông góc 3D (Chân đường cao + đoạn vuông góc + ký hiệu ⊥ trong 1 click)
  const [perpFromPt, setPerpFromPt] = useState('A');
  const [perpEdge1, setPerpEdge1] = useState('S');
  const [perpEdge2, setPerpEdge2] = useState('C');
  const [perpFootName, setPerpFootName] = useState('H');
  const [perpFootLabel, setPerpFootLabel] = useState('');
  const [perpDash, setPerpDash] = useState(2);
  const [perpColor, setPerpColor] = useState('#ef4444');

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

  // =============================================================
  // 4. STATE FOR 2D PLANE GEOMETRY (HÌNH HỌC PHẲNG 2D TƯƠNG TÁC)
  // =============================================================
  const [shape2DType, setShape2DType] = useState('right_triangle');
  const [custom2DPoints, setCustom2DPoints] = useState(() => getDefault2DGeometryPoints('right_triangle'));
  const [show2DCircumcircle, setShow2DCircumcircle] = useState(true);
  const [show2DAltitude, setShow2DAltitude] = useState(true);
  const [show2DMedian, setShow2DMedian] = useState(true);
  const [show2DAxes, setShow2DAxes] = useState(false);
  const [extra2DPoints, setExtra2DPoints] = useState([]);
  const [custom2DAuxLines, setCustom2DAuxLines] = useState([]);
  const [new2DPtName, setNew2DPtName] = useState('E');
  const [new2DPtParentA, setNew2DPtParentA] = useState('A');
  const [new2DPtParentB, setNew2DPtParentB] = useState('B');
  const [new2DPtRatio, setNew2DPtRatio] = useState(0.5);
  const [new2DLineFrom, setNew2DLineFrom] = useState('A');
  const [new2DLineTo, setNew2DLineTo] = useState('C');
  const [new2DLineStyle, setNew2DLineStyle] = useState('dashed');
  const [new2DLineColor, setNew2DLineColor] = useState('#f97316');

  const handleSelectShape2D = (newShape) => {
    setShape2DType(newShape);
    const defaults = getDefault2DGeometryPoints(newShape);
    setCustom2DPoints(defaults);
    const keys = Object.keys(defaults);
    if (keys.length >= 2) {
      setNew2DPtParentA(keys[0]);
      setNew2DPtParentB(keys[1]);
      setNew2DLineFrom(keys[0]);
      setNew2DLineTo(keys[keys.length - 1]);
    }
  };

  const handleUpdate2DPoint = (key, field, value) => {
    setCustom2DPoints(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'name' ? value : (parseFloat(value) || 0)
      }
    }));
  };

  const handleAdd2DExtraPoint = () => {
    const clean = new2DPtName.trim().toUpperCase();
    if (!clean || new2DPtParentA === new2DPtParentB) return;
    if (extra2DPoints.some(p => p.id === clean)) return;
    setExtra2DPoints(prev => [
      ...prev,
      {
        id: clean,
        name: clean,
        parentA: new2DPtParentA,
        parentB: new2DPtParentB,
        ratio: Number(new2DPtRatio ?? 0.5)
      }
    ]);
    const nextChars = ['E', 'F', 'N', 'P', 'Q', 'K', 'T'];
    const avail = nextChars.find(c => c !== clean && !extra2DPoints.some(p => p.id === c));
    if (avail) setNew2DPtName(avail);
  };

  const handleRemove2DExtraPoint = (id) => {
    setExtra2DPoints(prev => prev.filter(p => p.id !== id));
    setCustom2DAuxLines(prev => prev.filter(l => l.from !== id && l.to !== id));
  };

  const handleAdd2DAuxLine = () => {
    if (!new2DLineFrom || !new2DLineTo || new2DLineFrom === new2DLineTo) return;
    setCustom2DAuxLines(prev => [
      ...prev,
      {
        from: new2DLineFrom,
        to: new2DLineTo,
        style: new2DLineStyle,
        color: new2DLineColor,
        label: ''
      }
    ]);
  };

  const handleRemove2DAuxLine = (idx) => {
    setCustom2DAuxLines(prev => prev.filter((_, i) => i !== idx));
  };

  const available2DPointKeys = useMemo(() => {
    const baseKeys = Object.keys(custom2DPoints || {});
    const derivedKeys = ['H', 'M', 'O', 'G', 'I'];
    const extraKeys = extra2DPoints.map(p => p.id);
    return Array.from(new Set([...baseKeys, ...derivedKeys, ...extraKeys]));
  }, [custom2DPoints, extra2DPoints]);

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
    } else if (tag.toUpperCase().startsWith('[MATH_GEOMETRY_2D]')) {
      const parsed = parseMathGeometry2DTag(tag);
      if (parsed) {
        setJsxSubTab('2d_geometry');
        if (parsed.shapeType) setShape2DType(parsed.shapeType);
        if (parsed.vertices) setCustom2DPoints(parsed.vertices);
        if (parsed.showCircumcircle !== undefined) setShow2DCircumcircle(parsed.showCircumcircle);
        if (parsed.showAltitude !== undefined) setShow2DAltitude(parsed.showAltitude);
        if (parsed.showMedian !== undefined) setShow2DMedian(parsed.showMedian);
        if (parsed.showAxes !== undefined) setShow2DAxes(parsed.showAxes);
        if (parsed.extraPoints) setExtra2DPoints(parsed.extraPoints);
        if (parsed.auxLines) setCustom2DAuxLines(parsed.auxLines);
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
    const cleanId = newPtName.trim().toUpperCase();
    if (extraPoints.some(p => p.id === cleanId)) return;

    const displayLabel = newPtLabel.trim() || cleanId;
    setExtraPoints(prev => [
      ...prev,
      {
        id: cleanId,
        name: displayLabel,
        edge: [newPtEdge1, newPtEdge2],
        ratio: newPtRatio,
        color: newPtColor
      }
    ]);
    setNewPtLabel('');
    const nextChars = ['P', 'Q', 'I', 'J', 'E', 'F', 'H', 'K', 'T'];
    const available = nextChars.find(c => !extraPoints.some(p => p.id === c) && c !== cleanId);
    if (available) setNewPtName(available);
  };

  // Hạ đường vuông góc 3D: tự tính chân đường cao + kẻ đoạn thẳng + vẽ ký hiệu góc vuông ⊥
  const handleAddPerpendicular3D = () => {
    const cleanId = perpFootName.trim().toUpperCase();
    if (!cleanId || !perpFromPt || perpEdge1 === perpEdge2) return;
    if (extraPoints.some(p => p.id === cleanId)) return;

    const cFrom = customBasePoints[perpFromPt];
    const c1 = customBasePoints[perpEdge1];
    const c2 = customBasePoints[perpEdge2];
    let ratio = 0.5;
    if (cFrom && c1 && c2) {
      const vx = c2.x - c1.x, vy = c2.y - c1.y, vz = c2.z - c1.z;
      const lenSq = vx * vx + vy * vy + vz * vz;
      if (lenSq > 1e-6) {
        ratio = ((cFrom.x - c1.x) * vx + (cFrom.y - c1.y) * vy + (cFrom.z - c1.z) * vz) / lenSq;
      }
    }

    const displayLabel = perpFootLabel.trim() || cleanId;
    setExtraPoints(prev => [
      ...prev,
      {
        id: cleanId,
        name: displayLabel,
        isPerpendicularFoot: true,
        fromPoint: perpFromPt,
        edge: [perpEdge1, perpEdge2],
        ratio,
        color: perpColor
      }
    ]);

    setCustomAuxLines(prev => [
      ...prev,
      {
        id: `perp-${Date.now()}`,
        from: perpFromPt,
        to: cleanId,
        dash: perpDash,
        color: perpColor,
        name: `${perpFromPt}${cleanId} ⊥ ${perpEdge1}${perpEdge2}`
      }
    ]);

    setPerpFootLabel('');
    const nextChars = ['H', 'K', 'I', 'E', 'F', 'P', 'Q'];
    const available = nextChars.find(c => !extraPoints.some(p => p.id === c) && c !== cleanId);
    if (available) setPerpFootName(available);
  };

  // Cập nhật trực tiếp nhãn / tỷ lệ / màu của điểm phụ đã có
  const handleUpdateExtraPoint = (id, patch) => {
    setExtraPoints(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
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

  // Danh sách tất cả các điểm có thể kẻ nối (hiển thị gọn đẹp không bị cắt chữ)
  const availablePointsList = useMemo(() => {
    const baseList = Object.entries(customBasePoints).map(([key, data]) => ({
      id: key,
      shortLabel: data.label || key,
      label: `${data.label || key}${data.desc ? ` · ${data.desc}` : ''}`
    }));
    const extraList = extraPoints.map(p => ({
      id: p.id,
      shortLabel: p.id,
      label: `${p.id} · Điểm phụ`
    }));
    return [...baseList, ...extraList];
  }, [customBasePoints, extraPoints]);

  // Chuyển chuỗi biểu thức người dùng (x^3 - 3*x + 1, sqrt(...), abs(...)) sang LaTeX đẹp để hiển thị KaTeX
  const exprToCleanLatex = (expr = '') =>
    String(expr)
      .replace(/\*/g, ' \\cdot ')
      .replace(/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}')
      .replace(/abs\(([^)]+)\)/gi, '|$1|')
      .replace(/exp\(([^)]+)\)/gi, 'e^{$1}')
      .replace(/\bpi\b/gi, '\\pi');

  // Trả về { prefix, latex } tách biệt để render 100% KaTeX (TUYỆT ĐỐI không hiện mã \frac/\sqrt thô)
  const getCurrentFormulaDisplay = () => {
    if (jsxSubTab === '2d_function') {
      if (exam2DMode === 'area_integral') {
        return {
          prefix: 'Diện tích miền phẳng',
          latex: `S = \\int_{x_1}^{x_2} \\left|(${exprToCleanLatex(integralUpperExpr)}) - (${exprToCleanLatex(integralLowerExpr)})\\right|\\,dx \\approx ${calculatedArea.toFixed(2)}`
        };
      }
      if (exam2DMode === 'three_curves_recognition') {
        return {
          prefix: 'Bộ 3 đồ thị',
          latex: `f(x)=x^3-3x,\\; f'(x)=3x^2-3,\\; F(x)=\\frac{x^4}{4}-\\frac{3x^2}{2}`
        };
      }
      if (exam2DMode === 'derivative_fprime') {
        return {
          prefix: 'Tương giao đạo hàm',
          latex: `y = f'(x) \\cap d: y = ${exprToCleanLatex(auxiliaryExpr)}`
        };
      }

      let baseFormula = '';
      if (funcInputMode === 'custom') {
        baseFormula = exprToCleanLatex(customExpr);
      } else if (funcType === 'cubic') {
        baseFormula = `${paramA === 1 ? '' : paramA === -1 ? '-' : paramA}x^3 ${paramB !== 0 ? (paramB > 0 ? `+ ${paramB}x^2` : `- ${Math.abs(paramB)}x^2`) : ''} ${paramC !== 0 ? (paramC > 0 ? `+ ${paramC}x` : `- ${Math.abs(paramC)}x`) : ''} ${paramD !== 0 ? (paramD > 0 ? `+ ${paramD}` : `- ${Math.abs(paramD)}`) : ''}`.trim();
      } else if (funcType === 'quartic') {
        baseFormula = `${paramA === 1 ? '' : paramA === -1 ? '-' : paramA}x^4 ${paramB !== 0 ? (paramB > 0 ? `+ ${paramB}x^2` : `- ${Math.abs(paramB)}x^2`) : ''} ${paramC !== 0 ? (paramC > 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`) : ''}`.trim();
      } else if (funcType === 'rational_1_1') {
        baseFormula = `\\frac{${paramA}x ${paramB >= 0 ? `+ ${paramB}` : `- ${Math.abs(paramB)}`}}{${paramC}x ${paramD >= 0 ? `+ ${paramD}` : `- ${Math.abs(paramD)}`}}`;
      } else if (funcType === 'rational_2_1') {
        baseFormula = `\\frac{${paramA}x^2 ${paramB >= 0 ? `+ ${paramB}x` : `- ${Math.abs(paramB)}x`} ${paramC >= 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`}}{${paramD}x ${paramE >= 0 ? `+ ${paramE}` : `- ${Math.abs(paramE)}`}}`;
      } else if (funcType === 'trig') {
        baseFormula = `${paramA === 1 ? '' : paramA}\\sin(${paramB === 1 ? '' : paramB}x ${paramC !== 0 ? (paramC > 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`) : ''})`;
      } else {
        baseFormula = `${paramA === 1 ? '' : paramA === -1 ? '-' : paramA}x^2 ${paramB !== 0 ? (paramB > 0 ? `+ ${paramB}x` : `- ${Math.abs(paramB)}x`) : ''} ${paramC !== 0 ? (paramC > 0 ? `+ ${paramC}` : `- ${Math.abs(paramC)}`) : ''}`.trim();
      }

      if (absTransformType === 'abs_total') return { prefix: '', latex: `y = \\left|${baseFormula}\\right|` };
      if (absTransformType === 'abs_x') return { prefix: '', latex: `y = f(|x|)` };
      if (absTransformType === 'abs_both') return { prefix: '', latex: `y = |f(|x|)|` };
      if (absTransformType === 'abs_shifted') return { prefix: '', latex: `y = \\left|f(x) ${paramShiftM >= 0 ? `+ ${paramShiftM}` : `- ${Math.abs(paramShiftM)}`}\\right|` };
      if (absTransformType === 'abs_half') return { prefix: '', latex: `y = f(x) + |f(x)|` };
      if (exam2DMode === 'parametric_line') {
        return {
          prefix: '',
          latex: `f(x) = ${baseFormula},\\quad d: y = ${slopeM !== 0 ? `${slopeM}x + ` : ''}${paramM}`
        };
      }
      return { prefix: '', latex: `y = ${baseFormula}` };
    }

    if (jsxSubTab === '3d_space') {
      const topLabel = customBasePoints['S']?.label || 'S';
      const aLabel = customBasePoints['A']?.label || 'A';
      const bLabel = customBasePoints['B']?.label || 'B';
      const cLabel = customBasePoints['C']?.label || 'C';
      const baseLabels = Object.entries(customBasePoints)
        .filter(([k]) => !['S', 'O', 'G', 'H', "A'", "B'", "C'", "D'"].includes(k))
        .map(([, v]) => v.label)
        .join('') || 'ABCD';
      if (shape3DType === 'solid_revolution') {
        return { prefix: 'Khối nón tròn xoay', latex: `R = ${shape3dRadius},\\; h = ${shape3dHeight}` };
      }
      if (shape3DType === 'sphere_plane') {
        return { prefix: 'Mặt cầu cắt phẳng', latex: `r = \\sqrt{R^2 - d^2},\\; R = ${shape3dRadius},\\; d = ${planeD}` };
      }
      if (exam3DConstructionPreset === 'distance_model') {
        return {
          prefix: 'Khoảng cách',
          latex: `d(${aLabel}, (${topLabel}${bLabel}${cLabel})) = AK = \\frac{${topLabel}${aLabel} \\cdot ${aLabel}${bLabel}}{\\sqrt{${topLabel}${aLabel}^2 + ${aLabel}${bLabel}^2}}`
        };
      }
      if (exam3DConstructionPreset === 'angle_line_plane') {
        return {
          prefix: 'Góc đường – mặt',
          latex: `(${topLabel}${cLabel}, (${baseLabels})) = \\widehat{${topLabel}${cLabel}${aLabel}}`
        };
      }
      if (exam3DConstructionPreset === 'cross_section_mid') {
        return { prefix: 'Thiết diện qua trung điểm', latex: `(MNPQ)` };
      }
      return { prefix: 'Đa diện không gian', latex: `${topLabel}.${baseLabels}` };
    }

    if (jsxSubTab === '2d_geometry') {
      if (shape2DType === 'acute_triangle') return { prefix: 'Tam giác nhọn nội tiếp', latex: `\\triangle ABC \\subset (O),\\; H, G` };
      if (shape2DType === 'circle_tangent') return { prefix: 'Đường tròn & 2 tiếp tuyến', latex: `(O; R),\\; MA = MB` };
      if (shape2DType === 'quadrilateral_cyclic') return { prefix: 'Tứ giác nội tiếp', latex: `ABCD \\subset (O)` };
      if (shape2DType === 'parallelogram_rhombus') return { prefix: 'Hình bình hành', latex: `ABCD,\\; O = AC \\cap BD,\\; DH \\perp AB` };
      if (shape2DType === 'trapezoid_right') return { prefix: 'Hình thang vuông', latex: `ABCD\\; (\\widehat{A} = \\widehat{D} = 90^\\circ)` };
      return { prefix: 'Tam giác vuông tại A', latex: `\\triangle ABC,\\; AH \\perp BC,\\; AM = \\frac{BC}{2}` };
    }
    return { prefix: '', latex: '' };
  };

  // Generate Current Formula String LaTeX (for tag serialization & copy)
  const getCurrentFormulaString = () => {
    const { prefix, latex } = getCurrentFormulaDisplay();
    if (!latex) return prefix;
    return prefix ? `${prefix}: $${latex}$` : `$${latex}$`;
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

      // 3. DỰNG TẤT CẢ CÁC ĐIỂM PHỤ TÙY Ý (EXTRA POINTS + CHÂN ĐƯỜNG VUÔNG GÓC 3D KÈM KÝ HIỆU ⊥)
      extraPoints.forEach(pt => {
        if (pt.isPerpendicularFoot && pt.fromPoint && pt.edge && pt.edge.length === 2) {
          const cFrom = coordMap[pt.fromPoint];
          const c1 = coordMap[pt.edge[0]];
          const c2 = coordMap[pt.edge[1]];
          if (cFrom && c1 && c2) {
            const vx = c2[0] - c1[0], vy = c2[1] - c1[1], vz = c2[2] - c1[2];
            const lenSq = vx * vx + vy * vy + vz * vz;
            const t = lenSq > 1e-6
              ? ((cFrom[0] - c1[0]) * vx + (cFrom[1] - c1[1]) * vy + (cFrom[2] - c1[2]) * vz) / lenSq
              : 0.5;
            const fx = c1[0] + t * vx;
            const fy = c1[1] + t * vy;
            const fz = c1[2] + t * vz;
            ptsMap[pt.id] = view.create('point3d', [fx, fy, fz], { name: pt.name ?? pt.id, size: 4, color: pt.color || '#ef4444' });
            coordMap[pt.id] = [fx, fy, fz];

            // Vẽ ký hiệu góc vuông 3D (⊥) ngay tại chân đường cao
            const u1x = cFrom[0] - fx, u1y = cFrom[1] - fy, u1z = cFrom[2] - fz;
            const n1 = Math.hypot(u1x, u1y, u1z);
            const n2 = Math.hypot(vx, vy, vz);
            if (n1 > 1e-4 && n2 > 1e-4) {
              const dirSign = t > 0.5 ? -1 : 1;
              const s = Math.min(0.32, n1 * 0.25, n2 * 0.25);
              const a1 = [fx + (u1x / n1) * s, fy + (u1y / n1) * s, fz + (u1z / n1) * s];
              const a2 = [fx + dirSign * (vx / n2) * s, fy + dirSign * (vy / n2) * s, fz + dirSign * (vz / n2) * s];
              const corner = [
                a1[0] + dirSign * (vx / n2) * s,
                a1[1] + dirSign * (vy / n2) * s,
                a1[2] + dirSign * (vz / n2) * s
              ];
              const pA1 = view.create('point3d', a1, { visible: false });
              const pA2 = view.create('point3d', a2, { visible: false });
              const pC = view.create('point3d', corner, { visible: false });
              view.create('line3d', [pA1, pC], { straightFirst: false, straightLast: false, strokeColor: pt.color || '#ef4444', strokeWidth: 1.5 });
              view.create('line3d', [pA2, pC], { straightFirst: false, straightLast: false, strokeColor: pt.color || '#ef4444', strokeWidth: 1.5 });
            }
          }
        } else if (pt.isPresetProjection && ptsMap['S'] && ptsMap['B']) {
          const cS = coordMap['S'] || [0, 0, shape3dHeight];
          const cB = coordMap['B'] || [shape3dWidth, 0, 0];
          const aVal = cB[0];
          const hVal = cS[2];
          const kX = (aVal * (hVal ** 2)) / (aVal ** 2 + hVal ** 2);
          const kZ = ((aVal ** 2) * hVal) / (aVal ** 2 + hVal ** 2);
          ptsMap[pt.id] = view.create('point3d', [kX, 0, kZ], { name: pt.name ?? pt.id, size: 4, color: pt.color || '#ef4444' });
          coordMap[pt.id] = [kX, 0, kZ];
        } else if (pt.edge && pt.edge.length === 2) {
          const c1 = coordMap[pt.edge[0]];
          const c2 = coordMap[pt.edge[1]];
          if (c1 && c2) {
            const k = pt.ratio !== undefined ? pt.ratio : 0.5;
            const px = (1 - k) * c1[0] + k * c2[0];
            const py = (1 - k) * c1[1] + k * c2[1];
            const pz = (1 - k) * c1[2] + k * c2[2];
            ptsMap[pt.id] = view.create('point3d', [px, py, pz], { name: pt.name ?? pt.id, size: 3.5, color: pt.color || '#ec4899' });
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
        boundingbox: [-6, 6, 8, -4.5],
        axis: Boolean(show2DAxes),
        showNavigation: true,
        showCopyright: false,
        pan: { enabled: true },
        zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needOption: false }
      });

      mount2DGeometryBoard(
        board,
        {
          shapeType: shape2DType,
          vertices: custom2DPoints,
          showCircumcircle: show2DCircumcircle,
          showAltitude: show2DAltitude,
          showMedian: show2DMedian,
          showAxes: show2DAxes,
          extraPoints: extra2DPoints,
          auxLines: custom2DAuxLines
        },
        true
      );

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
    show3DAxes,
    shape2DType,
    custom2DPoints,
    show2DCircumcircle,
    show2DAltitude,
    show2DMedian,
    show2DAxes,
    extra2DPoints,
    custom2DAuxLines
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
        formula: getCurrentFormulaString(),
        dimensions: { h: shape3dHeight, w: shape3dWidth, d: shape3dDepth, r: shape3dRadius, planeD },
        vertices: customBasePoints,
        extraPoints,
        auxLines: customAuxLines,
        azimuth: azimuthAngle,
        elevation: elevationAngle
      });
    } else {
      const meta = SHAPES_2D_META[shape2DType] || SHAPES_2D_META.right_triangle;
      return formatMathGeometry2DTag({
        shapeType: shape2DType,
        title: meta.title,
        formula: meta.formula,
        vertices: custom2DPoints,
        extraPoints: extra2DPoints,
        auxLines: custom2DAuxLines,
        showCircumcircle: show2DCircumcircle,
        showAltitude: show2DAltitude,
        showMedian: show2DMedian,
        showAxes: show2DAxes
      });
    }
  }, [
    jsxSubTab, funcInputMode, funcType, paramA, paramB, paramC, paramD, paramE, customExpr,
    exam2DMode, auxiliaryExpr, slopeM, paramM, absTransformType, paramShiftM, tangentX0, showTangent,
    integralUpperExpr, integralLowerExpr, hideCurveLabels, shape3DType, exam3DConstructionPreset,
    shape3dHeight, shape3dWidth, shape3dDepth, shape3dRadius, planeD, customBasePoints, extraPoints,
    customAuxLines, azimuthAngle, elevationAngle, shape2DType, custom2DPoints, extra2DPoints,
    custom2DAuxLines, show2DCircumcircle, show2DAltitude, show2DMedian, show2DAxes
  ]);

  // Handle Insert into Current Authoring Studio (Flow 2)
  const handleInsertToStudio = () => {
    if (onInsert) {
      onInsert(currentSnippetTag, targetField);
    }
    onClose();
  };

  const formulaDisplay = getCurrentFormulaDisplay();

  const isRevolutionOrSphere = shape3DType === 'solid_revolution' || shape3DType === 'sphere_plane';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/55 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[1360px] h-[92vh] max-h-[860px] flex flex-col bg-[#F8F7F4] rounded-2xl shadow-2xl border border-[#E2DFD7] overflow-hidden text-slate-800">

        {/* MODAL HEADER */}
        <header className="px-5 py-3 border-b border-[#E5E3DC] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1E3A5F] leading-tight">Phòng Dựng Hình & Đồ Thị 2D / 3D</h2>
              <p className="text-[11px] text-slate-500">Tùy biến tham số, tọa độ đỉnh, điểm phụ, đường phụ và góc nhìn trực quan</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#F2F1EC] p-1 rounded-xl border border-[#E5E3DC]">
            {[
              { id: '2d_function', label: 'Đồ thị 2D', Icon: TrendingUp },
              { id: '3d_space', label: 'Không gian 3D', Icon: Box },
              { id: '2d_geometry', label: 'Hình phẳng 2D', Icon: Triangle }
            ].map(({ id, label, Icon }) => {
              const active = jsxSubTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setJsxSubTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-[#1E3A5F] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#1E3A5F] hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Copy toast */}
        {copiedText && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-xs font-bold shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copiedText}</span>
          </div>
        )}

        {/* MAIN 2-PANE STUDIO BODY */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 p-3.5 overflow-hidden">

          {/* LEFT INSPECTOR PANEL */}
          <aside className="w-full lg:w-[410px] xl:w-[430px] shrink-0 bg-white rounded-2xl border border-[#E5E3DC] shadow-[0_1px_6px_rgba(15,23,42,0.03)] flex flex-col min-h-0 overflow-hidden">

            {/* === A. 2D FUNCTION INSPECTOR === */}
            {jsxSubTab === '2d_function' && (
              <>
                <div className="p-2.5 border-b border-[#ECEAE4] bg-[#FAF9F6] shrink-0">
                  <div className="grid grid-cols-2 p-0.5 rounded-xl bg-[#EFECE6] border border-[#E5E3DC]">
                    {[
                      { id: 'function', label: 'Hàm số & Hệ số', Icon: SlidersHorizontal },
                      { id: 'analysis', label: 'Tương giao & Tiếp tuyến', Icon: TrendingUp }
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPanel2DFuncTab(id)}
                        className={`py-1.5 px-2 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          panel2DFuncTab === id
                            ? 'bg-white text-[#1E3A5F] shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
                  {panel2DFuncTab === 'function' ? (
                    <>
                      {/* Chuyên đề đồ thị */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Chuyên đề đồ thị
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'standard', label: 'Khảo sát & Tiệm cận' },
                            { id: 'absolute_transform', label: 'Biến đổi trị tuyệt đối' },
                            { id: 'derivative_fprime', label: 'Đạo hàm', latex: "f'(x)" },
                            { id: 'parametric_line', label: 'Tương giao', latex: 'y=ax+m' },
                            { id: 'area_integral', label: 'Tích phân 2 đường cong' },
                            { id: 'three_curves_recognition', label: 'Nhận dạng', latex: "f,\\,f',\\,F" }
                          ].map((item) => {
                            const active = exam2DMode === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setExam2DMode(item.id);
                                  if (item.id !== 'standard') setPanel2DFuncTab('analysis');
                                }}
                                className={`px-2.5 py-2 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                                  active
                                    ? 'bg-[#EEF2F7] border-[#1E3A5F] text-[#1E3A5F]'
                                    : 'bg-white border-[#E5E3DC] text-slate-700 hover:border-[#2C4C7E]/50 hover:bg-[#FAF9F6]'
                                }`}
                              >
                                <span className="truncate">{item.label}</span>
                                {item.latex && <KatexInline latex={item.latex} className="text-[11px] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nguồn hàm số */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-3">
                        <div className="grid grid-cols-2 p-0.5 bg-[#EBE8E1] rounded-lg text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setFuncInputMode('preset')}
                            className={`py-1 rounded-md transition-all cursor-pointer ${
                              funcInputMode === 'preset' ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Hàm mẫu chuẩn
                          </button>
                          <button
                            type="button"
                            onClick={() => setFuncInputMode('custom')}
                            className={`py-1 rounded-md transition-all cursor-pointer ${
                              funcInputMode === 'custom' ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Nhập biểu thức tự do
                          </button>
                        </div>

                        {funcInputMode === 'preset' ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: 'cubic', label: 'Bậc 3', latex: 'ax^3+\\dots' },
                                { id: 'rational_2_1', label: 'Phân thức 2/1', latex: '\\frac{ax^2}{dx+e}' },
                                { id: 'rational_1_1', label: 'Phân thức 1/1', latex: '\\frac{ax+b}{cx+d}' },
                                { id: 'quartic', label: 'Trùng phương', latex: 'ax^4+bx^2' },
                                { id: 'quadratic', label: 'Parabol', latex: 'ax^2+bx' },
                                { id: 'trig', label: 'Lượng giác', latex: 'a\\sin(bx)' }
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => handleSelectFuncPreset(t.id)}
                                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                                    funcType === t.id
                                      ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                                      : 'bg-white border-[#E5E3DC] text-slate-700 hover:bg-[#EEF2F7]'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>

                            {/* Full parameter sliders a, b, c, d, e */}
                            <div className="space-y-2 pt-1">
                              {[
                                { key: 'a', val: paramA, set: setParamA, min: -4, max: 4, step: 0.5, show: true },
                                { key: 'b', val: paramB, set: setParamB, min: -5, max: 5, step: 0.5, show: true },
                                { key: 'c', val: paramC, set: setParamC, min: -5, max: 5, step: 0.5, show: true },
                                { key: 'd', val: paramD, set: setParamD, min: -5, max: 5, step: 0.5, show: funcType === 'cubic' || funcType === 'rational_1_1' || funcType === 'rational_2_1' },
                                { key: 'e', val: paramE, set: setParamE, min: -4, max: 4, step: 0.5, show: funcType === 'rational_2_1' }
                              ].filter((p) => p.show).map((p) => (
                                <div key={p.key} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                                  <span className="w-7 text-center py-0.5 rounded bg-white border border-[#E5E3DC] text-[#1E3A5F]">
                                    <KatexInline latex={p.key} />
                                  </span>
                                  <input
                                    type="range"
                                    min={p.min}
                                    max={p.max}
                                    step={p.step}
                                    value={p.val}
                                    onChange={(e) => p.set(parseFloat(e.target.value) || 0)}
                                    className="flex-1 accent-[#1E3A5F] cursor-pointer"
                                  />
                                  <span className="w-9 text-right tabular-nums text-[#1E3A5F]">{p.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={customExpr}
                              onChange={(e) => setCustomExpr(e.target.value)}
                              className="w-full px-3 py-2 text-xs font-semibold border border-[#CBD5E1] focus:border-[#1E3A5F] rounded-xl bg-white outline-none"
                              placeholder="Ví dụ: x^3 - 3*x + 1"
                            />
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { expr: 'abs(x^2 - 4)', latex: '|x^2 - 4|' },
                                { expr: '(x^2 - 2*x + 3)/(x - 1)', latex: '\\frac{x^2-2x+3}{x-1}' },
                                { expr: 'sqrt(9 - x^2)', latex: '\\sqrt{9-x^2}' },
                                { expr: 'sin(2*x) + cos(x)', latex: '\\sin 2x + \\cos x' },
                                { expr: 'x * exp(-x)', latex: 'x e^{-x}' }
                              ].map((ex, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setCustomExpr(ex.expr)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#1E3A5F] hover:bg-[#EEF2F7] text-xs text-slate-800 cursor-pointer transition-colors"
                                >
                                  <KatexInline latex={ex.latex} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Biến đổi trị tuyệt đối */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Phép biến đổi trị tuyệt đối
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'none', latex: 'f(x)' },
                            { id: 'abs_total', latex: '|f(x)|' },
                            { id: 'abs_x', latex: 'f(|x|)' },
                            { id: 'abs_both', latex: '|f(|x|)|' },
                            { id: 'abs_shifted', latex: '|f(x)+m|' },
                            { id: 'abs_half', latex: 'f(x)+|f(x)|' }
                          ].map((abs) => (
                            <button
                              key={abs.id}
                              type="button"
                              onClick={() => {
                                setAbsTransformType(abs.id);
                                if (abs.id !== 'none') setExam2DMode('absolute_transform');
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                absTransformType === abs.id
                                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                                  : 'bg-white border-[#E5E3DC] text-slate-700 hover:bg-[#EEF2F7]'
                              }`}
                            >
                              <KatexInline latex={abs.latex} />
                            </button>
                          ))}
                        </div>

                        {absTransformType === 'abs_shifted' && (
                          <div className="flex items-center gap-2.5 pt-1 text-xs font-bold text-slate-700">
                            <span className="w-8"><KatexInline latex="m" /></span>
                            <input
                              type="range"
                              min="-5"
                              max="5"
                              step="0.5"
                              value={paramShiftM}
                              onChange={(e) => setParamShiftM(parseFloat(e.target.value) || 0)}
                              className="flex-1 accent-[#1E3A5F] cursor-pointer"
                            />
                            <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{paramShiftM}</span>
                          </div>
                        )}
                      </div>

                      {/* Tương giao đường thẳng y = ax + m */}
                      {exam2DMode === 'parametric_line' && (
                        <div className="p-3 rounded-xl bg-[#EEF2F7]/70 border border-[#D4DFED] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#1E3A5F]">
                              <KatexInline latex={`d: y = ${slopeM !== 0 ? `${slopeM}x + ` : ''}m`} />
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1E3A5F] text-white">
                              {foundRoots.length} nghiệm
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                            <span className="w-8"><KatexInline latex="a" /></span>
                            <input type="range" min="-2" max="2" step="0.5" value={slopeM} onChange={(e) => setSlopeM(parseFloat(e.target.value) || 0)} className="flex-1 accent-[#1E3A5F]" />
                            <span className="w-8 text-right tabular-nums">{slopeM}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                            <span className="w-8"><KatexInline latex="m" /></span>
                            <input type="range" min="-5" max="5" step="0.2" value={paramM} onChange={(e) => setParamM(parseFloat(e.target.value) || 0)} className="flex-1 accent-[#1E3A5F]" />
                            <span className="w-8 text-right tabular-nums">{paramM}</span>
                          </div>
                        </div>
                      )}

                      {/* Đạo hàm f'(x) */}
                      {exam2DMode === 'derivative_fprime' && (
                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2 text-xs font-bold text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showDerivativeCurve} onChange={(e) => setShowDerivativeCurve(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Hiện đồ thị <KatexInline latex="f'(x)" /></span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showAuxiliaryCurve} onChange={(e) => setShowAuxiliaryCurve(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Hiện đường phụ <KatexInline latex="h(x)" /></span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="shrink-0"><KatexInline latex="h(x) =" /></span>
                            <input
                              type="text"
                              value={auxiliaryExpr}
                              onChange={(e) => setAuxiliaryExpr(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs font-semibold border border-[#CBD5E1] rounded-lg bg-white"
                              placeholder="-x + 1"
                            />
                          </div>
                        </div>
                      )}

                      {/* Tích phân 2 đường cong */}
                      {exam2DMode === 'area_integral' && (
                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0">Đường 1</span>
                            <input type="text" value={integralUpperExpr} onChange={(e) => setIntegralUpperExpr(e.target.value)} className="flex-1 px-2.5 py-1 border border-[#CBD5E1] rounded-lg bg-white" placeholder="4 - x^2" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 shrink-0">Đường 2</span>
                            <input type="text" value={integralLowerExpr} onChange={(e) => setIntegralLowerExpr(e.target.value)} className="flex-1 px-2.5 py-1 border border-[#CBD5E1] rounded-lg bg-white" placeholder="x + 2" />
                          </div>
                          <div className="px-3 py-2 rounded-lg bg-white border border-[#E5E3DC] flex items-center justify-between">
                            <span>Diện tích hình phẳng</span>
                            <span className="text-sm font-extrabold text-[#1E3A5F]">
                              <KatexInline latex={`S \\approx ${calculatedArea.toFixed(3)}`} />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Nhận dạng 3 đồ thị */}
                      {exam2DMode === 'three_curves_recognition' && (
                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2 text-xs font-bold text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer text-blue-700">
                            <input type="checkbox" checked={showC1} onChange={(e) => setShowC1(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <KatexInline latex="C_1: f(x) = x^3 - 3x" />
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-rose-700">
                            <input type="checkbox" checked={showC2} onChange={(e) => setShowC2(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <KatexInline latex="C_2: f'(x) = 3x^2 - 3" />
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-emerald-700">
                            <input type="checkbox" checked={showC3} onChange={(e) => setShowC3(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <KatexInline latex="C_3: F(x) = \frac{x^4}{4} - \frac{3x^2}{2}" />
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer pt-1.5 border-t border-[#E5E3DC] text-slate-700">
                            <input type="checkbox" checked={hideCurveLabels} onChange={(e) => setHideCurveLabels(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Ẩn công thức trên nhãn (chế độ đố học sinh)</span>
                          </label>
                        </div>
                      )}

                      {/* Tiếp tuyến động & Đường cực trị */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5 text-xs font-semibold text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showInflectionLine} onChange={(e) => setShowInflectionLine(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                          <span>Đường thẳng qua 2 điểm cực trị</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showTangent} onChange={(e) => setShowTangent(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                          <span>Tiếp tuyến động tại <KatexInline latex="M(x_0;\,f(x_0))" /></span>
                        </label>
                        {showTangent && (
                          <div className="flex items-center gap-2.5 pt-1 pl-5">
                            <span className="w-8"><KatexInline latex="x_0" /></span>
                            <input
                              type="range"
                              min="-4"
                              max="4"
                              step="0.25"
                              value={tangentX0}
                              onChange={(e) => setTangentX0(parseFloat(e.target.value) || 0)}
                              className="flex-1 accent-[#1E3A5F] cursor-pointer"
                            />
                            <span className="w-9 text-right tabular-nums text-[#1E3A5F]">{tangentX0}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* === B. 3D SPATIAL GEOMETRY INSPECTOR === */}
            {jsxSubTab === '3d_space' && (
              <>
                <div className="p-2.5 border-b border-[#ECEAE4] bg-[#FAF9F6] shrink-0">
                  <div className="grid grid-cols-3 p-0.5 rounded-xl bg-[#EFECE6] border border-[#E5E3DC]">
                    {[
                      { id: 'shape', label: 'Hình khối', Icon: Box },
                      { id: 'aux', label: 'Điểm & Đường', Icon: GitBranch },
                      { id: 'vertices', label: 'Tọa độ đỉnh', Icon: MapPin }
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPanel3DTab(id)}
                        className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          panel3DTab === id
                            ? 'bg-white text-[#1E3A5F] shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
                  {panel3DTab === 'shape' && (
                    <>
                      {/* 9 Hình khối 3D */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Chọn hình khối 3D
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'pyramid_rect_sa', label: 'Chóp S.ABCD (SA ⊥)' },
                            { id: 'pyramid_tri_sa', label: 'Chóp S.ABC (SA ⊥)' },
                            { id: 'pyramid_regular_quad', label: 'Chóp tứ giác đều' },
                            { id: 'pyramid_regular_tri', label: 'Chóp tam giác đều' },
                            { id: 'pyramid_side_perp', label: 'Mặt bên vuông đáy' },
                            { id: 'prism_tri', label: "Lăng trụ ABC.A'B'C'" },
                            { id: 'box_cube', label: 'Hình hộp / Lập phương' },
                            { id: 'solid_revolution', label: 'Nón / Trụ tròn xoay' },
                            { id: 'sphere_plane', label: 'Cầu cắt mặt phẳng' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectShape3D(item.id)}
                              className={`px-2.5 py-2 rounded-xl text-left text-[11.5px] font-bold border transition-all cursor-pointer ${
                                shape3DType === item.id
                                  ? 'bg-[#EEF2F7] border-[#1E3A5F] text-[#1E3A5F]'
                                  : 'bg-white border-[#E5E3DC] text-slate-700 hover:border-[#2C4C7E]/50 hover:bg-[#FAF9F6]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Đường phụ mẫu */}
                      {!isRevolutionOrSphere && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Mô hình đường phụ mẫu
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'distance_model', label: 'Khoảng cách', latex: 'd(A,(SBC))' },
                              { id: 'angle_line_plane', label: 'Góc đường – mặt' },
                              { id: 'cross_section_mid', label: 'Thiết diện (MNPQ)' },
                              { id: 'none', label: 'Khung tự do' }
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setExam3DConstructionPreset(m.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                                  exam3DConstructionPreset === m.id
                                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                                    : 'bg-white border-[#E5E3DC] text-slate-600 hover:bg-[#FAF9F6]'
                                }`}
                              >
                                <span className="truncate">{m.label}</span>
                                {m.latex && <KatexInline latex={m.latex} className="text-[11px] shrink-0" />}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold text-slate-700">
                            {exam3DConstructionPreset === 'distance_model' && (
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={showPresetAuxLine2} onChange={(e) => setShowPresetAuxLine2(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                                <span>Hiện đường vuông góc <KatexInline latex="AK" /></span>
                              </label>
                            )}
                            {exam3DConstructionPreset === 'cross_section_mid' && (
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={showCrossSectionPlane} onChange={(e) => setShowCrossSectionPlane(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                                <span>Tô bóng mặt thiết diện</span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Kích thước khối */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Kích thước hình khối
                        </span>
                        {!isRevolutionOrSphere ? (
                          <div className="space-y-2 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2.5">
                              <span className="w-14 shrink-0">Cao <KatexInline latex="h" /></span>
                              <input type="range" min="1.5" max="7" step="0.5" value={shape3dHeight} onChange={(e) => setShape3dHeight(parseFloat(e.target.value) || 4)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                              <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{shape3dHeight}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-14 shrink-0">Rộng <KatexInline latex="a" /></span>
                              <input type="range" min="1.5" max="6.5" step="0.5" value={shape3dWidth} onChange={(e) => setShape3dWidth(parseFloat(e.target.value) || 4)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                              <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{shape3dWidth}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="w-14 shrink-0">Sâu <KatexInline latex="b" /></span>
                              <input type="range" min="1.5" max="6.5" step="0.5" value={shape3dDepth} onChange={(e) => setShape3dDepth(parseFloat(e.target.value) || 3.5)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                              <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{shape3dDepth}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2.5">
                              <span className="w-16 shrink-0">Bán kính <KatexInline latex="R" /></span>
                              <input type="range" min="1.5" max="5" step="0.2" value={shape3dRadius} onChange={(e) => setShape3dRadius(parseFloat(e.target.value) || 3)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                              <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{shape3dRadius}</span>
                            </div>
                            {shape3DType === 'solid_revolution' ? (
                              <div className="flex items-center gap-2.5">
                                <span className="w-16 shrink-0">Cao <KatexInline latex="h" /></span>
                                <input type="range" min="2" max="7" step="0.5" value={shape3dHeight} onChange={(e) => setShape3dHeight(parseFloat(e.target.value) || 4)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                                <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{shape3dHeight}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <span className="w-16 shrink-0">Cắt <KatexInline latex="d" /></span>
                                <input type="range" min="0" max={Math.max(0.5, shape3dRadius - 0.3)} step="0.2" value={planeD} onChange={(e) => setPlaneD(parseFloat(e.target.value) || 0)} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                                <span className="w-8 text-right tabular-nums text-[#1E3A5F]">{planeD}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Góc nhìn 3D */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Góc xoay không gian
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAzimuthAngle(0.85); setElevationAngle(0.35); }}
                            className="text-[11px] font-bold text-[#2C4C7E] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Đặt lại</span>
                          </button>
                        </div>

                        <div className="space-y-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <span className="w-16 shrink-0">Xoay ngang</span>
                            <input type="range" min="-3.14" max="3.14" step="0.05" value={azimuthAngle} onChange={(e) => setAzimuthAngle(parseFloat(e.target.value))} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                            <span className="w-9 text-right tabular-nums text-[#1E3A5F]">{Math.round((azimuthAngle * 180) / Math.PI)}°</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-16 shrink-0">Góc nghiêng</span>
                            <input type="range" min="-1.2" max="1.4" step="0.05" value={elevationAngle} onChange={(e) => setElevationAngle(parseFloat(e.target.value))} className="flex-1 accent-[#1E3A5F] cursor-pointer" />
                            <span className="w-9 text-right tabular-nums text-[#1E3A5F]">{Math.round((elevationAngle * 180) / Math.PI)}°</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                          {[
                            { label: 'Chuẩn', az: 0.85, el: 0.35 },
                            { label: 'Chính diện', az: 0.25, el: 0.2 },
                            { label: 'Từ trên', az: 0.85, el: 1.05 },
                            { label: 'Trái', az: 2.2, el: 0.35 }
                          ].map((cam) => (
                            <button
                              key={cam.label}
                              type="button"
                              onClick={() => { setAzimuthAngle(cam.az); setElevationAngle(cam.el); }}
                              className="py-1 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#1E3A5F] hover:bg-[#EEF2F7] text-[11px] font-bold text-slate-700 cursor-pointer transition-colors"
                            >
                              {cam.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {panel3DTab === 'aux' && (
                    <>
                      {/* 1. HẠ ĐƯỜNG VUÔNG GÓC 3D (CHÂN ĐƯỜNG CAO + KÝ HIỆU ⊥ TRONG 1 CLICK) */}
                      <div className="p-3 rounded-xl bg-amber-50/55 border border-amber-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#1E3A5F]">Hạ đường vuông góc (<KatexInline latex="\perp" />)</span>
                          <span className="text-[10.5px] font-semibold text-amber-800">Tự vẽ ký hiệu góc vuông</span>
                        </div>

                        <div className="grid grid-cols-12 gap-1.5 items-end">
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Từ điểm</label>
                            <Select
                              size="small"
                              fullWidth
                              value={perpFromPt}
                              onChange={(e) => setPerpFromPt(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">⊥ Cạnh (đầu)</label>
                            <Select
                              size="small"
                              fullWidth
                              value={perpEdge1}
                              onChange={(e) => setPerpEdge1(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">⊥ Cạnh (cuối)</label>
                            <Select
                              size="small"
                              fullWidth
                              value={perpEdge2}
                              onChange={(e) => setPerpEdge2(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Tên chân</label>
                            <input
                              type="text"
                              value={perpFootName}
                              onChange={(e) => setPerpFootName(e.target.value.toUpperCase())}
                              placeholder="H"
                              maxLength={3}
                              className="w-full h-[31px] px-2 rounded-[10px] border border-[#cbd5e1] bg-white text-xs font-extrabold text-center text-[#1E3A5F] uppercase outline-none focus:border-[#1E3A5F]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#EBE8E1] text-[11px] font-bold shrink-0">
                            <button
                              type="button"
                              onClick={() => setPerpDash(2)}
                              className={`px-2 py-1 rounded-md cursor-pointer ${perpDash === 2 ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'}`}
                            >
                              Nét đứt
                            </button>
                            <button
                              type="button"
                              onClick={() => setPerpDash(0)}
                              className={`px-2 py-1 rounded-md cursor-pointer ${perpDash === 0 ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'}`}
                            >
                              Nét liền
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            {COLOR_SWATCHES.slice(0, 5).map((sw) => (
                              <button
                                key={sw.hex}
                                type="button"
                                title={sw.label}
                                onClick={() => setPerpColor(sw.hex)}
                                className={`w-4.5 h-4.5 rounded-full cursor-pointer transition-transform ${
                                  perpColor === sw.hex ? 'ring-2 ring-offset-1 ring-[#1E3A5F] scale-110' : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: sw.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={perpFootLabel}
                            onChange={(e) => setPerpFootLabel(e.target.value)}
                            placeholder={`Nhãn hiển thị (mặc định: ${perpFootName || 'H'})`}
                            className="flex-1 h-[31px] px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-xs text-slate-700 outline-none focus:border-[#1E3A5F]"
                          />
                          <button
                            type="button"
                            onClick={handleAddPerpendicular3D}
                            className="px-3 h-[31px] rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Hạ {perpFromPt}{perpFootName || 'H'} ⊥ {perpEdge1}{perpEdge2}</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. THÊM ĐIỂM PHỤ TRÊN CẠNH & SỬA TRỰC TIẾP NHÃN ĐIỂM */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#1E3A5F]">Điểm phụ trên cạnh</span>
                          <span className="text-[11px] font-bold text-slate-500">{extraPoints.length} điểm</span>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Mã điểm</label>
                            <input
                              type="text"
                              value={newPtName}
                              onChange={(e) => setNewPtName(e.target.value.toUpperCase())}
                              className="w-full h-[31px] px-2 rounded-[10px] border border-[#cbd5e1] bg-white text-xs font-extrabold text-center text-[#1E3A5F] uppercase outline-none focus:border-[#1E3A5F]"
                              placeholder="N"
                              maxLength={3}
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Đầu cạnh 1</label>
                            <Select
                              size="small"
                              fullWidth
                              value={newPtEdge1}
                              onChange={(e) => setNewPtEdge1(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-5">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Đầu cạnh 2</label>
                            <Select
                              size="small"
                              fullWidth
                              value={newPtEdge2}
                              onChange={(e) => setNewPtEdge2(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                        </div>

                        {/* Tỷ lệ k & Chọn màu điểm */}
                        <div className="space-y-2 pt-0.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span className="shrink-0"><KatexInline latex={`k = ${newPtRatio}`} /></span>
                            <div className="flex items-center gap-1">
                              {[
                                { v: 0.5, lbl: '1/2' },
                                { v: 0.33, lbl: '1/3' },
                                { v: 0.67, lbl: '2/3' }
                              ].map((r) => (
                                <button
                                  key={r.lbl}
                                  type="button"
                                  onClick={() => setNewPtRatio(r.v)}
                                  className={`px-1.5 py-0.5 rounded-md border text-[10.5px] font-bold cursor-pointer ${
                                    Math.abs(newPtRatio - r.v) < 0.02
                                      ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                                      : 'bg-white border-[#DCD9D0] text-slate-600 hover:bg-[#EEF2F7]'
                                  }`}
                                >
                                  {r.lbl}
                                </button>
                              ))}
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="0.9"
                              step="0.05"
                              value={newPtRatio}
                              onChange={(e) => setNewPtRatio(parseFloat(e.target.value))}
                              className="flex-1 accent-[#1E3A5F] cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {COLOR_SWATCHES.slice(0, 6).map((sw) => (
                                <button
                                  key={sw.hex}
                                  type="button"
                                  title={sw.label}
                                  onClick={() => setNewPtColor(sw.hex)}
                                  className={`w-4.5 h-4.5 rounded-full cursor-pointer transition-transform ${
                                    newPtColor === sw.hex ? 'ring-2 ring-offset-1 ring-[#1E3A5F] scale-110' : 'opacity-80 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: sw.hex }}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleAddExtraPoint}
                              className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm {newPtName || 'điểm'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Danh sách điểm phụ — Sửa trực tiếp nhãn hiển thị trên hình 3D */}
                        {extraPoints.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-[#ECEAE4]">
                            <div className="text-[10.5px] font-bold text-slate-500">
                              Sửa trực tiếp nhãn hiển thị trên hình (xóa trống để ẩn chữ):
                            </div>
                            {extraPoints.map((pt) => (
                              <div key={pt.id} className="p-2 rounded-lg bg-white border border-[#E5E3DC] space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pt.color }} />
                                  <span className="text-[11px] font-extrabold text-[#1E3A5F] w-6 shrink-0">{pt.id}</span>
                                  <input
                                    type="text"
                                    value={pt.name ?? ''}
                                    onChange={(e) => handleUpdateExtraPoint(pt.id, { name: e.target.value })}
                                    placeholder="Nhãn trên hình..."
                                    className="flex-1 min-w-0 px-2 py-0.5 rounded-md border border-[#CBD5E1] focus:border-[#1E3A5F] bg-[#FAF9F6] focus:bg-white text-[11.5px] font-semibold text-slate-800 outline-none"
                                  />
                                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                    {pt.isPerpendicularFoot
                                      ? `${pt.fromPoint}${pt.id}⊥${pt.edge?.join('')}`
                                      : pt.edge
                                      ? `∈${pt.edge.join('')}`
                                      : ''}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExtraPoint(pt.id)}
                                    title="Xóa điểm này"
                                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {!pt.isPerpendicularFoot && !pt.isPresetProjection && pt.edge && (
                                  <div className="flex items-center gap-2 pl-4 text-[10.5px] font-semibold text-slate-500">
                                    <span>Tỷ lệ k:</span>
                                    <input
                                      type="range"
                                      min="0.05"
                                      max="0.95"
                                      step="0.05"
                                      value={pt.ratio ?? 0.5}
                                      onChange={(e) => handleUpdateExtraPoint(pt.id, { ratio: parseFloat(e.target.value) })}
                                      className="flex-1 accent-[#1E3A5F] cursor-pointer"
                                    />
                                    <span className="w-7 text-right tabular-nums text-[#1E3A5F]">{pt.ratio ?? 0.5}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Kẻ đường phụ */}
                      <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#1E3A5F]">Kẻ đoạn thẳng / Đường phụ</span>
                          <span className="text-[11px] font-bold text-slate-500">{customAuxLines.length} đường</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Từ điểm</label>
                            <Select
                              size="small"
                              fullWidth
                              value={newLineFrom}
                              onChange={(e) => setNewLineFrom(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Đến điểm</label>
                            <Select
                              size="small"
                              fullWidth
                              value={newLineTo}
                              onChange={(e) => setNewLineTo(e.target.value)}
                              sx={COMPACT_MUI_SELECT_SX}
                              renderValue={(v) => availablePointsList.find((p) => p.id === v)?.shortLabel || v}
                            >
                              {availablePointsList.map((p) => (
                                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                  {p.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#EBE8E1] text-[11px] font-bold shrink-0">
                            <button
                              type="button"
                              onClick={() => setNewLineDash(2)}
                              className={`px-2.5 py-1 rounded-md cursor-pointer ${
                                newLineDash === 2 ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'
                              }`}
                            >
                              Nét đứt
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewLineDash(0)}
                              className={`px-2.5 py-1 rounded-md cursor-pointer ${
                                newLineDash === 0 ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'
                              }`}
                            >
                              Nét liền
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {COLOR_SWATCHES.slice(0, 5).map((sw) => (
                              <button
                                key={sw.hex}
                                type="button"
                                title={sw.label}
                                onClick={() => setNewLineColor(sw.hex)}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                                  newLineColor === sw.hex ? 'ring-2 ring-offset-1 ring-[#1E3A5F] scale-110' : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: sw.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCustomLine}
                          className="w-full py-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Kẻ đoạn {newLineFrom}{newLineTo}</span>
                        </button>

                        {customAuxLines.length > 0 && (
                          <div className="space-y-1 max-h-36 overflow-y-auto pt-1 border-t border-[#ECEAE4]">
                            {customAuxLines.map((line) => (
                              <div key={line.id} className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-[#E5E3DC] text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                                  <span>{line.from}{line.to}</span>
                                  <span className="text-[10.5px] font-medium text-slate-400">({line.dash === 2 ? 'Nét đứt' : 'Nét liền'})</span>
                                </span>
                                <button type="button" onClick={() => handleRemoveCustomLine(line.id)} className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {panel3DTab === 'vertices' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF]">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1E3A5F]">
                          <input
                            type="checkbox"
                            checked={isCustomizingBasePoints}
                            onChange={(e) => setIsCustomizingBasePoints(e.target.checked)}
                            className="w-4 h-4 rounded accent-[#1E3A5F]"
                          />
                          <span>Bật chỉnh tọa độ & đổi tên đỉnh</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleResetBasePoints}
                          className="px-2 py-1 rounded-lg bg-white border border-[#E5E3DC] text-[11px] font-bold text-slate-600 hover:text-[#1E3A5F] flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Mặc định</span>
                        </button>
                      </div>

                      {Object.keys(customBasePoints).length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          Hình khối tròn xoay / mặt cầu điều chỉnh qua bán kính và chiều cao ở tab Hình khối.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(customBasePoints).map(([key, pt]) => (
                            <div key={key} className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E7E5DF] space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pt.color || '#0f172a' }} />
                                  <span>Đỉnh {key}</span>
                                  {pt.desc && <span className="text-[10.5px] font-normal text-slate-400">· {pt.desc}</span>}
                                </span>
                                <input
                                  type="text"
                                  value={pt.label}
                                  onChange={(e) => {
                                    setIsCustomizingBasePoints(true);
                                    handleUpdateBasePoint(key, 'label', e.target.value);
                                  }}
                                  className="w-16 px-2 py-0.5 font-extrabold text-xs text-[#1E3A5F] border border-[#CBD5E1] rounded-lg bg-white text-center uppercase"
                                  maxLength={6}
                                  title="Đổi tên hiển thị của đỉnh"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-600">
                                {[
                                  { axis: 'x', label: 'X', cls: 'text-rose-600' },
                                  { axis: 'y', label: 'Y', cls: 'text-emerald-600' },
                                  { axis: 'z', label: 'Z', cls: 'text-blue-600' }
                                ].map(({ axis, label, cls }) => (
                                  <div key={axis} className="flex items-center gap-1">
                                    <span className={cls}>{label}</span>
                                    <input
                                      type="number"
                                      step="0.2"
                                      value={pt[axis]}
                                      onChange={(e) => {
                                        setIsCustomizingBasePoints(true);
                                        handleUpdateBasePoint(key, axis, e.target.value);
                                      }}
                                      className="w-full px-1.5 py-1 border border-[#CBD5E1] rounded-lg bg-white text-slate-800 text-center"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* === C. 2D PLANE GEOMETRY INSPECTOR === */}
            {jsxSubTab === '2d_geometry' && (
              <>
                <div className="p-2.5 border-b border-[#ECEAE4] bg-[#FAF9F6] shrink-0">
                  <div className="grid grid-cols-2 p-0.5 rounded-xl bg-[#EFECE6] border border-[#E5E3DC]">
                    {[
                      { id: 'shape', label: 'Hình & Tọa độ đỉnh', Icon: Triangle },
                      { id: 'aux', label: 'Điểm & Đoạn phụ', Icon: GitBranch }
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPanel2DGeoTab(id)}
                        className={`py-1.5 px-2 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          panel2DGeoTab === id
                            ? 'bg-white text-[#1E3A5F] shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
                  {panel2DGeoTab === 'shape' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Chọn mẫu hình phẳng
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.values(SHAPES_2D_META).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectShape2D(item.id)}
                              className={`px-2.5 py-2 rounded-xl border text-left text-[11.5px] font-bold transition-all cursor-pointer ${
                                shape2DType === item.id
                                  ? 'bg-[#EEF2F7] border-[#1E3A5F] text-[#1E3A5F]'
                                  : 'bg-white border-[#E5E3DC] text-slate-700 hover:bg-[#FAF9F6]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5DF] space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Yếu tố hiển thị</span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={show2DAltitude} onChange={(e) => setShow2DAltitude(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Đường cao (H)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={show2DMedian} onChange={(e) => setShow2DMedian(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Trung tuyến (M, G, O)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={show2DCircumcircle} onChange={(e) => setShow2DCircumcircle(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Đường tròn ngoại tiếp</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={show2DAxes} onChange={(e) => setShow2DAxes(e.target.checked)} className="rounded accent-[#1E3A5F]" />
                            <span>Hệ trục Oxy</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5DF] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tọa độ đỉnh (x; y)</span>
                          <button
                            type="button"
                            onClick={() => setCustom2DPoints(getDefault2DGeometryPoints(shape2DType))}
                            className="text-[11px] font-bold text-[#2C4C7E] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Mặc định</span>
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {Object.entries(custom2DPoints || {}).map(([key, pt]) => (
                            <div key={key} className="grid grid-cols-12 gap-1.5 items-center text-xs">
                              <span className="col-span-2 font-extrabold text-[#1E3A5F] bg-[#EEF2F7] px-2 py-1 rounded-lg text-center border border-[#D4DFED]">
                                {key}
                              </span>
                              <input
                                type="text"
                                value={pt.name ?? key}
                                onChange={(e) => handleUpdate2DPoint(key, 'name', e.target.value)}
                                className="col-span-4 px-2 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs font-bold text-slate-800"
                                placeholder="Tên"
                              />
                              <div className="col-span-3 flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-bold">X</span>
                                <input type="number" step="0.5" value={pt.x ?? 0} onChange={(e) => handleUpdate2DPoint(key, 'x', e.target.value)} className="w-full px-1.5 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs text-slate-800 text-center" />
                              </div>
                              <div className="col-span-3 flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-bold">Y</span>
                                <input type="number" step="0.5" value={pt.y ?? 0} onChange={(e) => handleUpdate2DPoint(key, 'y', e.target.value)} className="w-full px-1.5 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs text-slate-800 text-center" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Điểm phụ 2D */}
                      <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5DF] space-y-2.5">
                        <span className="text-xs font-extrabold text-[#1E3A5F]">Thêm điểm phụ trên cạnh</span>
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-3">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Tên</label>
                            <input
                              type="text"
                              value={new2DPtName}
                              onChange={(e) => setNew2DPtName(e.target.value.toUpperCase())}
                              placeholder="E"
                              maxLength={3}
                              className="w-full h-[31px] px-2 rounded-[10px] border border-[#cbd5e1] bg-white text-xs font-extrabold text-center text-[#1E3A5F] uppercase"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Từ đỉnh</label>
                            <Select size="small" fullWidth value={new2DPtParentA} onChange={(e) => setNew2DPtParentA(e.target.value)} sx={COMPACT_MUI_SELECT_SX}>
                              {Object.keys(custom2DPoints || {}).map((k) => (
                                <MenuItem key={k} value={k} sx={{ fontSize: '12px', fontWeight: 600 }}>{k}</MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-5">
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Đến đỉnh</label>
                            <Select size="small" fullWidth value={new2DPtParentB} onChange={(e) => setNew2DPtParentB(e.target.value)} sx={COMPACT_MUI_SELECT_SX}>
                              {Object.keys(custom2DPoints || {}).map((k) => (
                                <MenuItem key={k} value={k} sx={{ fontSize: '12px', fontWeight: 600 }}>{k}</MenuItem>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span><KatexInline latex={`k = ${new2DPtRatio}`} /></span>
                            {[
                              { v: 0.5, lbl: '1/2' },
                              { v: 0.33, lbl: '1/3' },
                              { v: 0.67, lbl: '2/3' }
                            ].map((r) => (
                              <button
                                key={r.lbl}
                                type="button"
                                onClick={() => setNew2DPtRatio(r.v)}
                                className={`px-1.5 py-0.5 rounded-md border text-[10.5px] font-bold cursor-pointer ${
                                  Math.abs(new2DPtRatio - r.v) < 0.02
                                    ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                                    : 'bg-white border-[#DCD9D0] text-slate-600'
                                }`}
                              >
                                {r.lbl}
                              </button>
                            ))}
                            <input type="range" min="0.1" max="0.9" step="0.05" value={new2DPtRatio} onChange={(e) => setNew2DPtRatio(parseFloat(e.target.value))} className="flex-1 accent-[#1E3A5F]" />
                          </div>
                          <button type="button" onClick={handleAdd2DExtraPoint} className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm</span>
                          </button>
                        </div>

                        {extra2DPoints.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#ECEAE4]">
                            {extra2DPoints.map((ep) => (
                              <span key={ep.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E3DC] text-slate-700 text-[11px] font-bold">
                                <span>{ep.name} ({ep.parentA}{ep.parentB}, k={ep.ratio})</span>
                                <button type="button" onClick={() => handleRemove2DExtraPoint(ep.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Đoạn phụ 2D */}
                      <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E7E5DF] space-y-2.5">
                        <span className="text-xs font-extrabold text-[#1E3A5F]">Kẻ đoạn thẳng phụ</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Nối từ</label>
                            <Select size="small" fullWidth value={new2DLineFrom} onChange={(e) => setNew2DLineFrom(e.target.value)} sx={COMPACT_MUI_SELECT_SX}>
                              {available2DPointKeys.map((k) => (
                                <MenuItem key={k} value={k} sx={{ fontSize: '12px', fontWeight: 600 }}>{k}</MenuItem>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="text-[10.5px] font-bold text-slate-500 block mb-1">Tới điểm</label>
                            <Select size="small" fullWidth value={new2DLineTo} onChange={(e) => setNew2DLineTo(e.target.value)} sx={COMPACT_MUI_SELECT_SX}>
                              {available2DPointKeys.map((k) => (
                                <MenuItem key={k} value={k} sx={{ fontSize: '12px', fontWeight: 600 }}>{k}</MenuItem>
                              ))}
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#EBE8E1] text-[11px] font-bold">
                            <button type="button" onClick={() => setNew2DLineStyle('dashed')} className={`px-2.5 py-1 rounded-md cursor-pointer ${new2DLineStyle === 'dashed' ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'}`}>Nét đứt</button>
                            <button type="button" onClick={() => setNew2DLineStyle('solid')} className={`px-2.5 py-1 rounded-md cursor-pointer ${new2DLineStyle === 'solid' ? 'bg-white text-[#1E3A5F] shadow-2xs' : 'text-slate-600'}`}>Nét liền</button>
                          </div>
                          <div className="flex items-center gap-1">
                            {COLOR_SWATCHES.slice(0, 5).map((sw) => (
                              <button
                                key={sw.hex}
                                type="button"
                                title={sw.label}
                                onClick={() => setNew2DLineColor(sw.hex)}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                                  new2DLineColor === sw.hex ? 'ring-2 ring-offset-1 ring-[#1E3A5F] scale-110' : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: sw.hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <button type="button" onClick={handleAdd2DAuxLine} className="w-full py-1.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C49] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Kẻ đoạn {new2DLineFrom}{new2DLineTo}</span>
                        </button>

                        {custom2DAuxLines.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#ECEAE4]">
                            {custom2DAuxLines.map((line, idx) => (
                              <span key={`${line.from}-${line.to}-${idx}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E3DC] text-slate-700 text-[11px] font-bold">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color || '#f97316' }} />
                                <span>{line.from}{line.to} ({line.style === 'solid' ? 'liền' : 'đứt'})</span>
                                <button type="button" onClick={() => handleRemove2DAuxLine(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </aside>

          {/* RIGHT CANVAS WORKSPACE */}
          <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-white rounded-2xl border border-[#E5E3DC] shadow-[0_1px_6px_rgba(15,23,42,0.03)] p-3 overflow-hidden">
            {/* Formula & Canvas Toolbar (100% Rendered KaTeX — Zero raw \frac text) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#ECEAE4] px-1 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-xs font-extrabold text-[#1E3A5F] shrink-0">
                  {jsxSubTab === '2d_function' && 'Hệ trục Oxy'}
                  {jsxSubTab === '3d_space' && 'Không gian Oxyz'}
                  {jsxSubTab === '2d_geometry' && 'Hình phẳng 2D'}
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4F6FA] border border-[#DCE4F0] text-xs font-semibold text-[#1E3A5F] max-w-full overflow-x-auto">
                  {formulaDisplay.prefix && (
                    <span className="text-slate-600 font-bold shrink-0">{formulaDisplay.prefix}:</span>
                  )}
                  {formulaDisplay.latex && <KatexInline latex={formulaDisplay.latex} className="text-[13px] text-[#1E3A5F]" />}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {jsxSubTab === '3d_space' && (
                  <button
                    type="button"
                    onClick={() => setShow3DAxes(!show3DAxes)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      show3DAxes
                        ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                        : 'bg-white border-[#DCD9D0] text-slate-700 hover:bg-[#EEF2F7]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Trục Oxyz</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyCode(getCurrentFormulaString(), 'công thức')}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DCD9D0] bg-white hover:bg-[#EEF2F7] text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép công thức</span>
                </button>
              </div>
            </div>

            {/* Interactive JSXGraph Board */}
            <div
              className={`flex-1 min-h-0 w-full relative rounded-xl overflow-hidden border border-[#E5E3DC] ${
                jsxSubTab === '3d_space' ? 'bg-grid-notebook' : 'bg-white'
              }`}
            >
              <div
                id="jsxgraph_board_container"
                ref={jxgContainerRef}
                className={`jxgbox w-full h-full min-h-[420px] ${
                  jsxSubTab === '3d_space' ? 'jxgbox-3d-grid' : ''
                }`}
              />
            </div>

            {/* Optional Student Preview Overlay Drawer */}
            {showStudentPreview && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#DCE4F0] space-y-2 shrink-0 max-h-[210px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-1.5">
                  <span className="text-xs font-extrabold text-[#1E3A5F]">Xem trước hiển thị trong đề thi</span>
                  <button
                    type="button"
                    onClick={() => setShowStudentPreview(false)}
                    className="text-xs font-bold text-[#2C4C7E] hover:underline cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E5E3DC] space-y-2">
                  <div className="text-xs font-semibold text-slate-800 flex flex-wrap items-center gap-1">
                    {formulaDisplay.prefix && <span>{formulaDisplay.prefix}:</span>}
                    {formulaDisplay.latex && <KatexInline latex={formulaDisplay.latex} />}
                  </div>
                  <div className="rounded-lg border border-[#E5E3DC] overflow-hidden">
                    <MathText text={currentSnippetTag} />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* MODAL FOOTER */}
        <footer className="px-5 py-3 border-t border-[#E5E3DC] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowStudentPreview(!showStudentPreview)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] text-xs font-bold border border-[#DCD9D0] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{showStudentPreview ? 'Ẩn xem trước' : 'Xem trước'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleInsertToStudio}
              className="px-5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-[#1E3A5F] hover:bg-[#162C49] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Chèn mô hình</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
