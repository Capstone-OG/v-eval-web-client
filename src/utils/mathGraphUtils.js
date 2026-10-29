/**
 * Math Graph & 3D Spatial Geometry Utilities
 * Shared parsing, compilation, and canonical serialization for JSXGraph 2D/3D models
 */

/**
 * Safely compiles a mathematical expression string (e.g. "x^3 - 3*x + 1", "sin(x) + cos(2*x)") into a JS function
 */
export function compileMathFunction(exprStr) {
  if (!exprStr || typeof exprStr !== 'string') return null;
  try {
    let s = exprStr.trim().toLowerCase();
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
 * Generates canonical 3D base vertices dictionary for standard spatial shapes
 */
export function getDefaultBasePoints(shapeType, a = 4, b = 3.5, h = 4) {
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
    case 'tetrahedron':
      return {
        A: { label: 'A', x: a / 3, y: b / 3, z: h, desc: 'Đỉnh', color: '#dc2626' },
        B: { label: 'B', x: 0, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
        C: { label: 'C', x: a, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
        D: { label: 'D', x: a / 2, y: b, z: 0, desc: 'Đáy', color: '#0f172a' }
      };
    case 'pyramid_regular_quad':
      return {
        O: { label: 'O', x: 0, y: 0, z: 0, desc: 'Tâm đáy', color: '#dc2626' },
        A: { label: 'A', x: -a / 2, y: -b / 2, z: 0, desc: 'Đáy', color: '#0f172a' },
        B: { label: 'B', x: a / 2, y: -b / 2, z: 0, desc: 'Đáy', color: '#0f172a' },
        C: { label: 'C', x: a / 2, y: b / 2, z: 0, desc: 'Đáy', color: '#0f172a' },
        D: { label: 'D', x: -a / 2, y: b / 2, z: 0, desc: 'Đáy', color: '#0f172a' },
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
 * Normalizes shapeType aliases (e.g. 'pyramid' -> 'pyramid_rect_sa')
 */
export function normalizeShapeType(type) {
  if (!type) return 'pyramid_rect_sa';
  const t = String(type).trim().toLowerCase();
  if (t === 'pyramid' || t === 'pyramid_rect' || t === 'pyramid_quad') return 'pyramid_rect_sa';
  if (t === 'pyramid_tri' || t === 'pyramid_triangle') return 'pyramid_tri_sa';
  if (t === 'tetrahedron' || t === 'tu_dien' || t === 'tudien') return 'tetrahedron';
  if (t === 'prism' || t === 'prism_triangle') return 'prism_tri';
  if (t === 'cube' || t === 'box' || t === 'box_cube') return 'box_cube';
  return t;
}

/**
 * Parses [MATH_GRAPH]...[/MATH_GRAPH] tag string into structured 2D graph config
 */
export function parseMathGraphTag(tagString) {
  if (!tagString) return null;
  try {
    const content = tagString.replace(/^\[MATH_GRAPH\]/i, '').replace(/\[\/MATH_GRAPH\]$/i, '').trim();
    if (!content) return null;

    const config = {
      is3D: false,
      title: 'Đồ thị hàm số',
      type: 'cubic',
      examMode: 'standard',
      formula: '',
      params: { a: 1, b: 0, c: -3, d: 1, e: 1 },
      customExpr: '',
      auxExpr: '-x + 1',
      slopeM: 0,
      paramM: 1,
      absTransform: 'none',
      shiftM: 0,
      tangentX0: 1,
      showTangent: false,
      integralUpper: '4 - x^2',
      integralLower: 'x + 2',
      hideCurveLabels: false
    };

    // 1. JSON parsing support
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const json = JSON.parse(content);
        if (json.title) config.title = json.title;
        if (json.type) config.type = json.type;
        if (json.formula) config.formula = json.formula;
        if (json.examMode) config.examMode = json.examMode;
        if (json.customExpr || json.expr || json.fn) config.customExpr = json.customExpr || json.expr || json.fn;
        if (json.auxExpr) config.auxExpr = json.auxExpr;
        if (json.slopeM !== undefined) config.slopeM = parseFloat(json.slopeM) || 0;
        if (json.paramM !== undefined) config.paramM = parseFloat(json.paramM) || 0;
        if (json.absTransform) config.absTransform = json.absTransform;
        if (json.shiftM !== undefined) config.shiftM = parseFloat(json.shiftM) || 0;
        if (json.tangentX0 !== undefined) config.tangentX0 = parseFloat(json.tangentX0) || 0;
        if (json.showTangent !== undefined) config.showTangent = Boolean(json.showTangent);
        if (json.hideCurveLabels !== undefined) config.hideCurveLabels = Boolean(json.hideCurveLabels);
        if (json.params && typeof json.params === 'object') {
          config.params = { ...config.params, ...json.params };
        }
        return config;
      } catch (err) {
        // Fall back to line-by-line parsing
      }
    }

    // 2. Line-by-line key:value parsing
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      const colonIdx = line.indexOf(':');
      const equalIdx = line.indexOf('=');
      let key = '';
      let val = '';

      if (colonIdx > 0 && (equalIdx === -1 || colonIdx < equalIdx)) {
        key = line.slice(0, colonIdx).trim().toLowerCase();
        val = line.slice(colonIdx + 1).trim();
      } else if (equalIdx > 0) {
        key = line.slice(0, equalIdx).trim().toLowerCase();
        val = line.slice(equalIdx + 1).trim();
      } else {
        return;
      }

      switch (key) {
        case 'title':
          config.title = val;
          break;
        case 'type':
          config.type = val;
          break;
        case 'exammode':
          config.examMode = val;
          break;
        case 'formula':
          config.formula = val;
          break;
        case 'customexpr':
        case 'expr':
        case 'fn':
          try { config.customExpr = decodeURIComponent(val); } catch { config.customExpr = val; }
          break;
        case 'auxexpr':
          try { config.auxExpr = decodeURIComponent(val); } catch { config.auxExpr = val; }
          break;
        case 'slopem':
          config.slopeM = parseFloat(val) || 0;
          break;
        case 'paramm':
          config.paramM = parseFloat(val) || 0;
          break;
        case 'abstransform':
          config.absTransform = val;
          break;
        case 'shiftm':
          config.shiftM = parseFloat(val) || 0;
          break;
        case 'tangentx0':
          config.tangentX0 = parseFloat(val) || 0;
          break;
        case 'showtangent':
          config.showTangent = val === 'true';
          break;
        case 'integralupper':
          try { config.integralUpper = decodeURIComponent(val); } catch { config.integralUpper = val; }
          break;
        case 'integrallower':
          try { config.integralLower = decodeURIComponent(val); } catch { config.integralLower = val; }
          break;
        case 'hidecurvelabels':
          config.hideCurveLabels = val === 'true';
          break;
        case 'params':
          if (val.startsWith('expr=')) {
            const raw = val.slice(5);
            try { config.customExpr = decodeURIComponent(raw); } catch { config.customExpr = raw; }
            config.type = 'custom';
          } else {
            val.split(',').forEach(p => {
              const [pk, pv] = p.split('=').map(s => s.trim());
              if (pk && pv !== undefined) {
                config.params[pk] = parseFloat(pv) || 0;
              }
            });
          }
          break;
        default:
          break;
      }
    });

    return config;
  } catch (err) {
    console.warn("Parse [MATH_GRAPH] tag error:", err);
    return null;
  }
}

/**
 * Parses [MATH_GRAPH_3D]...[/MATH_GRAPH_3D] tag string into structured 3D spatial config
 */
export function parseMathGraph3DTag(tagString) {
  if (!tagString) return null;
  try {
    const content = tagString.replace(/^\[MATH_GRAPH_3D\]/i, '').replace(/\[\/MATH_GRAPH_3D\]$/i, '').trim();
    if (!content) return null;

    const config = {
      is3D: true,
      title: 'Mô hình hình học không gian 3D',
      shapeType: 'pyramid_rect_sa',
      preset: 'distance_model',
      formula: '',
      dimensions: { h: 4, w: 4, d: 3.5, r: 3, planeD: 1.8 },
      vertices: {},
      extraPoints: [],
      auxLines: [],
      azimuth: 0.85,
      elevation: 0.35
    };

    // 1. JSON parsing support
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const json = JSON.parse(content);
        if (json.title) config.title = json.title;
        if (json.shapeType || json.shape_type) {
          config.shapeType = normalizeShapeType(json.shapeType || json.shape_type);
        }
        if (json.preset) config.preset = json.preset;
        if (json.formula) config.formula = json.formula;
        if (json.azimuth !== undefined) config.azimuth = parseFloat(json.azimuth) || 0.85;
        if (json.elevation !== undefined) config.elevation = parseFloat(json.elevation) || 0.35;
        if (json.dimensions && typeof json.dimensions === 'object') {
          config.dimensions = { ...config.dimensions, ...json.dimensions };
        }
        // Vertices can be { "S": [0,0,4], "A": [0,0,0] } or { "S": { label: "S", x: 0, y: 0, z: 4 } }
        if (json.vertices && typeof json.vertices === 'object') {
          Object.entries(json.vertices).forEach(([k, val]) => {
            if (Array.isArray(val) && val.length >= 3) {
              config.vertices[k] = { label: k, x: Number(val[0]) || 0, y: Number(val[1]) || 0, z: Number(val[2]) || 0 };
            } else if (val && typeof val === 'object') {
              config.vertices[k] = {
                label: val.label || k,
                x: Number(val.x) || 0,
                y: Number(val.y) || 0,
                z: Number(val.z) || 0
              };
            }
          });
        }
        // Extra points
        if (Array.isArray(json.extraPoints || json.extra_points)) {
          const list = json.extraPoints || json.extra_points;
          config.extraPoints = list.map((p, idx) => ({
            id: p.id || p.name || `P_${idx}`,
            name: p.name || p.id || `P_${idx}`,
            edge: Array.isArray(p.edge) ? p.edge : (typeof p.edge === 'string' ? p.edge.split(',') : ['S', 'C']),
            ratio: p.ratio !== undefined ? Number(p.ratio) : 0.5,
            color: p.color || '#ec4899',
            isPresetProjection: Boolean(p.isPresetProjection || p.projection)
          }));
        }
        // Aux lines
        if (Array.isArray(json.auxLines || json.aux_lines)) {
          const lines = json.auxLines || json.aux_lines;
          config.auxLines = lines.map(l => ({
            from: l.from || (Array.isArray(l.edge) ? l.edge[0] : 'A'),
            to: l.to || (Array.isArray(l.edge) ? l.edge[1] : 'C'),
            dash: l.dash !== undefined ? Number(l.dash) : (l.dashed ? 2 : 0),
            color: l.color || '#ef4444'
          }));
        }

        const defPoints = getDefaultBasePoints(
          config.shapeType,
          config.dimensions.w,
          config.dimensions.d,
          config.dimensions.h
        );
        config.vertices = { ...defPoints, ...config.vertices };
        return config;
      } catch (jsonErr) {
        // Fall back to line-by-line parsing
      }
    }

    // 2. Line-by-line key:value parsing
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();

      switch (key) {
        case 'title':
          config.title = val;
          break;
        case 'shapetype':
          config.shapeType = normalizeShapeType(val);
          break;
        case 'preset':
          config.preset = val;
          break;
        case 'formula':
          config.formula = val;
          break;
        case 'azimuth':
          config.azimuth = parseFloat(val) || 0.85;
          break;
        case 'elevation':
          config.elevation = parseFloat(val) || 0.35;
          break;
        case 'dimensions':
          val.split(',').forEach(d => {
            const [dk, dv] = d.split('=').map(s => s.trim());
            const num = parseFloat(dv);
            if (dk && !isNaN(num)) {
              if (dk === 'h') config.dimensions.h = num;
              else if (dk === 'w') config.dimensions.w = num;
              else if (dk === 'd') config.dimensions.d = num;
              else if (dk === 'r') config.dimensions.r = num;
              else if (dk === 'planed') config.dimensions.planeD = num;
            }
          });
          break;
        case 'vertices':
          // Format: S:S(0,0,4);A:A(0,0,0);B:B(4,0,0)... or S:P(0,0,4)...
          val.split(';').forEach(vItem => {
            const item = vItem.trim();
            if (!item) return;
            // Key:Label(X,Y,Z)
            const match = item.match(/^([^:]+):([^(]+)\(([^)]+)\)$/);
            if (match) {
              const k = match[1].trim();
              const label = match[2].trim();
              const [x, y, z] = match[3].split(',').map(n => parseFloat(n.trim()) || 0);
              config.vertices[k] = { label, x, y, z };
            }
          });
          break;
        case 'extrapoints':
          // Format: M:name=M:edge=S,C:ratio=0.5:color=#ec4899;K:name=K:projection=true:color=#ef4444
          val.split(';').forEach(pItem => {
            const item = pItem.trim();
            if (!item) return;
            const parts = item.split(':');
            const ptId = parts[0].trim();
            const ptObj = { id: ptId, name: ptId, color: '#ec4899' };

            parts.slice(1).forEach(prop => {
              const [pk, pv] = prop.split('=').map(s => s.trim());
              if (pk === 'name') ptObj.name = pv;
              else if (pk === 'edge') ptObj.edge = pv.split(',').map(s => s.trim());
              else if (pk === 'ratio') ptObj.ratio = parseFloat(pv) || 0.5;
              else if (pk === 'color') ptObj.color = pv;
              else if (pk === 'projection') ptObj.isPresetProjection = pv === 'true';
            });
            config.extraPoints.push(ptObj);
          });
          break;
        case 'auxlines':
          // Format: A-C:dash=2:color=#94a3b8;B-D:dash=2:color=#94a3b8;A-K:dash=2:color=#ef4444
          val.split(';').forEach(lItem => {
            const item = lItem.trim();
            if (!item) return;
            const parts = item.split(':');
            const edgeParts = parts[0].split('-').map(s => s.trim());
            if (edgeParts.length === 2) {
              const lineObj = { from: edgeParts[0], to: edgeParts[1], dash: 2, color: '#ef4444' };
              parts.slice(1).forEach(prop => {
                const [lk, lv] = prop.split('=').map(s => s.trim());
                if (lk === 'dash') lineObj.dash = parseInt(lv, 10) || 0;
                else if (lk === 'color') lineObj.color = lv;
              });
              config.auxLines.push(lineObj);
            }
          });
          break;
        default:
          break;
      }
    });

    // Fallback base points if not provided in tag
    const defPoints = getDefaultBasePoints(
      config.shapeType,
      config.dimensions.w,
      config.dimensions.d,
      config.dimensions.h
    );
    config.vertices = { ...defPoints, ...config.vertices };

    return config;
  } catch (err) {
    console.warn("Parse [MATH_GRAPH_3D] tag error:", err);
    return null;
  }
}

/**
 * Formats a 2D configuration into a canonical [MATH_GRAPH] tag
 */
export function formatMathGraphTag({
  title = 'Đồ thị hàm số',
  formula = '',
  examMode = 'standard',
  type = 'cubic',
  params = { a: 1, b: 0, c: -3, d: 1, e: 1 },
  customExpr = '',
  auxExpr = '',
  slopeM = 0,
  paramM = 1,
  absTransform = 'none',
  shiftM = 0,
  tangentX0 = 1,
  showTangent = false,
  integralUpper = '',
  integralLower = '',
  hideCurveLabels = false
}) {
  const isCustom = type === 'custom' || Boolean(customExpr);
  const paramStr = isCustom
    ? `expr=${encodeURIComponent(customExpr || '')}`
    : `a=${params.a ?? 1},b=${params.b ?? 0},c=${params.c ?? -3},d=${params.d ?? 1},e=${params.e ?? 1}`;

  let extra = '';
  if (auxExpr) extra += `\nauxExpr=${encodeURIComponent(auxExpr)}`;
  if (slopeM !== 0 || paramM !== 1) extra += `\nslopeM=${slopeM}\nparamM=${paramM}`;
  if (absTransform && absTransform !== 'none') extra += `\nabsTransform=${absTransform}\nshiftM=${shiftM}`;
  if (showTangent) extra += `\ntangentX0=${tangentX0}\nshowTangent=true`;
  if (integralUpper) extra += `\nintegralUpper=${encodeURIComponent(integralUpper)}`;
  if (integralLower) extra += `\nintegralLower=${encodeURIComponent(integralLower)}`;
  if (hideCurveLabels) extra += `\nhideCurveLabels=true`;

  return `\n\n[MATH_GRAPH]\ntitle: ${title}\nformula: ${formula}\nexamMode: ${examMode}\ntype: ${isCustom ? 'custom' : type}\nparams: ${paramStr}${extra}\n[/MATH_GRAPH]\n\n`;
}

/**
 * Formats a 3D configuration into a canonical [MATH_GRAPH_3D] tag
 */
export function formatMathGraph3DTag({
  title = 'Mô hình hình học không gian 3D',
  shapeType = 'pyramid_rect_sa',
  preset = 'distance_model',
  formula = '',
  dimensions = { h: 4, w: 4, d: 3.5, r: 3, planeD: 1.8 },
  vertices = {},
  extraPoints = [],
  auxLines = [],
  azimuth = 0.85,
  elevation = 0.35
}) {
  const verticesSummary = Object.entries(vertices)
    .map(([k, v]) => `${k}:${v.label || k}(${v.x},${v.y},${v.z})`)
    .join(';');

  const extraPointsSummary = extraPoints.map(p => {
    if (p.isPresetProjection) {
      return `${p.id}:name=${p.name || p.id}:projection=true:color=${p.color || '#ef4444'}`;
    }
    const edgeStr = p.edge ? p.edge.join(',') : 'S,C';
    return `${p.id}:name=${p.name || p.id}:edge=${edgeStr}:ratio=${p.ratio !== undefined ? p.ratio : 0.5}:color=${p.color || '#ec4899'}`;
  }).join(';');

  const auxLinesSummary = auxLines
    .map(l => `${l.from}-${l.to}:dash=${l.dash || 0}:color=${l.color || '#ef4444'}`)
    .join(';');

  const dimStr = `h=${dimensions.h || 4},w=${dimensions.w || 4},d=${dimensions.d || 3.5},r=${dimensions.r || 3},planeD=${dimensions.planeD || 1.8}`;

  return `\n\n[MATH_GRAPH_3D]\ntitle: ${title}\nshapeType: ${shapeType}\npreset: ${preset}\nformula: ${formula}\ndimensions: ${dimStr}\nvertices: ${verticesSummary}\nextraPoints: ${extraPointsSummary}\nauxLines: ${auxLinesSummary}\nazimuth: ${azimuth}\nelevation: ${elevation}\n[/MATH_GRAPH_3D]\n\n`;
}

/**
 * Intelligently synthesizes a 3D spatial geometry model tag [MATH_GRAPH_3D]
 * from natural Vietnamese mathematical descriptions (text-to-geometry auto-reconstruction)
 * when no diagram tag is present in the text.
 */
export function autoSynthesizeMathGraph3DFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // If already contains a 3D/2D tag or variation table, do not synthesize
  if (
    rawText.includes('[MATH_GRAPH_3D]') ||
    rawText.includes('[MATH_GRAPH]') ||
    rawText.includes('[MATH_GEOMETRY_2D]') ||
    rawText.includes('[VARIATION_TABLE]')
  ) {
    return null;
  }

  // Normalize text for detection (strip LaTeX formatting tags & multiple spaces)
  const clean = rawText
    .replace(/\$+/g, '')
    .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, '$1')
    .replace(/\\(?:parallel|subset|in|cup|cap|to|times)/g, ' ')
    .replace(/\s+/g, ' ');

  let shapeType = null;
  let title = '';
  let vertices = {};
  const extraPoints = [];
  const auxLines = [];
  const dim = { h: 4, w: 4, d: 3.5, r: 3, planeD: 1.8 };

  // 1. Dạng Tứ diện (Tetrahedron) e.g. "Cho tứ diện ABCD", "khối tứ diện ABCD"
  const tetraMatch = clean.match(/(?:tứ\s*diện|khối\s*tứ\s*diện)\s*([A-Z]{4})/i);
  if (tetraMatch) {
    const letters = tetraMatch[1].toUpperCase().split('');
    shapeType = 'tetrahedron';
    title = `Cho tứ diện ${letters.join('')}`;
    vertices = {
      [letters[0]]: { label: letters[0], x: 1.3, y: 1.2, z: 4, desc: 'Đỉnh', color: '#dc2626' },
      [letters[1]]: { label: letters[1], x: 0, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
      [letters[2]]: { label: letters[2], x: 4, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
      [letters[3]]: { label: letters[3], x: 2, y: 3.5, z: 0, desc: 'Đáy', color: '#0f172a' }
    };
  }

  // 2. Dạng Hình chóp (Pyramid) e.g. "Cho hình chóp S.ABCD", "chóp S.ABC", "khối chóp S.ABCD"
  if (!shapeType) {
    const pyramidMatch = clean.match(/(?:hình\s*chóp|khối\s*chóp|chóp)\s*([A-Z])\s*[\.\s]\s*([A-Z]{3,5})/i);
    if (pyramidMatch) {
      const apex = pyramidMatch[1].toUpperCase();
      const baseLetters = pyramidMatch[2].toUpperCase().split('');
      const isRegular = /đều/i.test(clean);

      if (baseLetters.length >= 4) {
        // Đáy tứ giác (ABCD)
        shapeType = isRegular ? 'pyramid_regular_quad' : 'pyramid_rect_sa';
        title = `Cho hình chóp ${apex}.${baseLetters.join('')}`;
        vertices = {
          [apex]: { label: apex, x: 0, y: 0, z: 4, desc: 'Đỉnh chóp', color: '#dc2626' },
          [baseLetters[0]]: { label: baseLetters[0], x: 0, y: 0, z: 0, desc: 'Chân cao', color: '#dc2626' },
          [baseLetters[1]]: { label: baseLetters[1], x: 4, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
          [baseLetters[2]]: { label: baseLetters[2], x: 4, y: 3.5, z: 0, desc: 'Đáy', color: '#0f172a' },
          [baseLetters[3]]: { label: baseLetters[3], x: 0, y: 3.5, z: 0, desc: 'Đáy', color: '#0f172a' }
        };
      } else if (baseLetters.length === 3) {
        // Đáy tam giác (ABC)
        shapeType = isRegular ? 'pyramid_regular_tri' : 'pyramid_tri_sa';
        title = `Cho hình chóp ${apex}.${baseLetters.join('')}`;
        vertices = {
          [apex]: { label: apex, x: 0, y: 0, z: 4, desc: 'Đỉnh chóp', color: '#dc2626' },
          [baseLetters[0]]: { label: baseLetters[0], x: 0, y: 0, z: 0, desc: 'Chân cao', color: '#dc2626' },
          [baseLetters[1]]: { label: baseLetters[1], x: 4, y: 0, z: 0, desc: 'Đáy', color: '#0f172a' },
          [baseLetters[2]]: { label: baseLetters[2], x: 2, y: 3.5, z: 0, desc: 'Đáy', color: '#0f172a' }
        };
      }
    }
  }

  // 3. Dạng Lăng trụ tam giác e.g. "lăng trụ ABC.A'B'C'"
  if (!shapeType) {
    const prismMatch = clean.match(/(?:hình\s*lăng\s*trụ|lăng\s*trụ)\s*([A-Z]{3})/i);
    if (prismMatch) {
      shapeType = 'prism_tri';
      title = `Lăng trụ tam giác ${prismMatch[1].toUpperCase()}`;
      vertices = getDefaultBasePoints('prism_tri');
    }
  }

  // 4. Dạng Hình hộp / Lập phương e.g. "hình hộp chữ nhật ABCD", "hình lập phương ABCD"
  if (!shapeType) {
    const boxMatch = clean.match(/(?:hình\s*hộp\s*chữ\s*nhật|hình\s*lập\s*phương|khối\s*hộp|hình\s*hộp)\s*([A-Z]{4})?/i);
    if (boxMatch) {
      shapeType = 'box_cube';
      title = boxMatch[1] ? `Khối hộp ${boxMatch[1].toUpperCase()}` : 'Khối hộp chữ nhật';
      vertices = getDefaultBasePoints('box_cube');
    }
  }

  // Nếu không nhận diện được loại hình không gian kinh điển, không tự ý suy diễn
  if (!shapeType) return null;

  // 5. Trích xuất các điểm phụ / trung điểm (e.g. "M là trung điểm SC", "gọi M là trung điểm CD")
  const midpointRegex = /(?:gọi\s+)?([A-Z])\s+là\s+trung\s+điểm(?:\s+của)?\s+([A-Z]{2})/gi;
  let midMatch;
  while ((midMatch = midpointRegex.exec(clean)) !== null) {
    const ptName = midMatch[1].toUpperCase();
    const edgeLetters = midMatch[2].toUpperCase().split('');
    extraPoints.push({
      id: ptName,
      name: ptName,
      edge: edgeLetters,
      ratio: 0.5,
      color: '#ec4899'
    });
  }

  // 6. Trích xuất các đường phụ từ câu hỏi (e.g. "giao điểm của AC và BM", "giao tuyến... (MSB) và (SAC)")
  if (extraPoints.length > 0) {
    extraPoints.forEach(p => {
      // Nối điểm phụ tới một đỉnh đáy hoặc đỉnh chóp nếu có đề cập trong văn bản
      if (clean.includes(`M${p.id}`) || clean.includes(`${p.id}B`) || clean.includes(`B${p.id}`)) {
        auxLines.push({ from: 'B', to: p.id, dash: 2, color: '#ef4444' });
      }
      if (clean.includes(`A${p.id}`) || clean.includes(`${p.id}A`)) {
        auxLines.push({ from: 'A', to: p.id, dash: 2, color: '#ef4444' });
      }
      if (clean.includes(`S${p.id}`) || clean.includes(`${p.id}S`)) {
        auxLines.push({ from: 'S', to: p.id, dash: 0, color: '#ef4444' });
      }
    });
  }

  // Giao điểm đường chéo hoặc giao tuyến nếu có
  if (/giao\s*điểm\s*của\s*AC\s*và\s*BD/i.test(clean) || /O\s*là\s*giao\s*điểm/i.test(clean)) {
    auxLines.push({ from: 'A', to: 'C', dash: 2, color: '#64748b' });
    auxLines.push({ from: 'B', to: 'D', dash: 2, color: '#64748b' });
  } else if (/AC\s*và\s*BM/i.test(clean)) {
    auxLines.push({ from: 'A', to: 'C', dash: 2, color: '#64748b' });
    auxLines.push({ from: 'B', to: 'M', dash: 2, color: '#ef4444' });
  }

  return formatMathGraph3DTag({
    title,
    shapeType,
    dimensions: dim,
    vertices,
    extraPoints,
    auxLines,
    azimuth: 0.85,
    elevation: 0.35
  });
}

/**
 * Synthesizes a 2D math function graph tag [MATH_GRAPH] from text
 */
export function autoSynthesizeMathGraph2DFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Never synthesize if text already has a math graph or variation table,
  // or if text describes a variation table / sign chart
  if (
    rawText.includes('[MATH_GRAPH]') ||
    rawText.includes('[MATH_GRAPH_3D]') ||
    rawText.includes('[MATH_GEOMETRY_2D]') ||
    rawText.includes('[VARIATION_TABLE]') ||
    rawText.includes('[GRAPH:') ||
    /bảng\s*biến\s*thiên/i.test(rawText) ||
    /bảng\s*xét\s*dấu/i.test(rawText)
  ) {
    return null;
  }

  // Scan line by line for explicit function formulas
  const lines = rawText.split('\n');
  for (const rawLine of lines) {
    const line = rawLine
      .replace(/\$+/g, '')
      .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, '$1')
      .trim();

    // Match y = <expr> or f(x) = <expr>
    const match = line.match(/(?:(?:hàm\s*số|đồ\s*thị(?:\s*\(C\))?)\s+)?(?:y|f\(x\))\s*=\s*([^,\.;\n]+)/i);
    if (!match) continue;

    let expr = match[1].trim();

    // Reject abstract function references like f(x), f'(x), g(x), u(x), v(x)
    if (/^[fghuvy]\s*\(/i.test(expr)) continue;

    // Cut off at common boundary phrases
    const cut = expr.search(/\s+(?:có|với|tại|cắt|như|trên|trong|đồng\s*biến|nghịch\s*biến|cực\s*trị|đạt|liên\s*tục|xác\s*định|dưới\s*đây|đáp\s*án)/i);
    if (cut !== -1) {
      expr = expr.slice(0, cut).trim();
    }

    // Must not contain tags, brackets, or suspicious keywords
    if (/[\[\]\{\}]/.test(expr) || /(?:bảng|biến\s*thiên|nghịch\s*biến|đồng\s*biến)/i.test(expr)) continue;

    // Must contain variable x and be of reasonable algebraic length
    if (!/\bx\b/i.test(expr) || expr.length > 35 || expr.length < 2) continue;

    let type = 'custom';
    let params = { a: 1, b: 0, c: -3, d: 1, e: 1 };

    if (/x\^3/i.test(expr)) {
      type = 'cubic';
    } else if (/x\^4/i.test(expr)) {
      type = 'quartic';
    } else if (/\//.test(expr) || /\\frac/.test(expr)) {
      type = 'rational';
    } else if (/x\^2/i.test(expr)) {
      type = 'quadratic';
    }

    return formatMathGraphTag({
      title: `Đồ thị hàm số y = ${expr}`,
      formula: `y = ${expr}`,
      type,
      params,
      customExpr: expr,
      isCustom: type === 'custom'
    });
  }

  return null;
}

/**
 * Synthesizes a variation table tag [VARIATION_TABLE] from text if text describes a variation table
 */
export function autoSynthesizeVariationTableFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  if (
    rawText.includes('[VARIATION_TABLE]') ||
    rawText.includes('[MATH_GRAPH]') ||
    rawText.includes('[MATH_GRAPH_3D]')
  ) {
    return null;
  }

  // Check if text discusses a variation table
  if (!/bảng\s*biến\s*thiên/i.test(rawText)) return null;

  // Normalize potential single-line variation descriptors
  const normalized = rawText
    .replace(/\s+(x:|y':|yprime:|f':|f'\(x\):|y:|f\(x\):|f:|dir:|direction:|directions:)/gi, '\n$1');

  // Look for inline variation table pattern e.g. x: ..., y': ..., y: ...
  const xMatch = normalized.match(/\bx\s*:\s*([^;\n]+)/i);
  const ypMatch = normalized.match(/\by'?\s*:\s*([^;\n]+)/i) || normalized.match(/\bf'?\(x\)\s*:\s*([^;\n]+)/i);
  const yMatch = normalized.match(/\by\s*:\s*([^;\n]+)/i) || normalized.match(/\bf\(x\)\s*:\s*([^;\n]+)/i);

  if (xMatch && (ypMatch || yMatch)) {
    const x = xMatch[1].trim();
    const yp = ypMatch ? ypMatch[1].trim() : '+ | 0 | - | 0 | +';
    const y = yMatch ? yMatch[1].trim() : '-\\infty | 4 | 0 | +\\infty';
    return `\n\n[VARIATION_TABLE]\ntitle: Bảng biến thiên hàm số\nx: ${x}\ny': ${yp}\ny: ${y}\n[/VARIATION_TABLE]\n\n`;
  }

  return null;
}


/**
 * Returns default 2D points for each canonical 2D plane geometry model
 */
export function getDefault2DGeometryPoints(shape2DType = 'right_triangle') {
  switch (shape2DType) {
    case 'acute_triangle':
      return {
        A: { name: 'A', x: 1, y: 4.5 },
        B: { name: 'B', x: -3.5, y: -1.5 },
        C: { name: 'C', x: 4.5, y: -1.5 }
      };
    case 'circle_tangent':
      return {
        O: { name: 'O', x: 0, y: 0 },
        M: { name: 'M', x: 6, y: 0 },
        A: { name: 'A', x: 1.5, y: 2.598 }
      };
    case 'quadrilateral_cyclic':
      return {
        A: { name: 'A', x: -2.2, y: 2.6 },
        B: { name: 'B', x: 2.5, y: 2.3 },
        C: { name: 'C', x: 2.8, y: -1.9 },
        D: { name: 'D', x: -2.6, y: -2.2 }
      };
    case 'parallelogram_rhombus':
      return {
        A: { name: 'A', x: -3.5, y: -1.8 },
        B: { name: 'B', x: 1.5, y: -1.8 },
        C: { name: 'C', x: 3.5, y: 2.2 },
        D: { name: 'D', x: -1.5, y: 2.2 }
      };
    case 'trapezoid_right':
      return {
        A: { name: 'A', x: -3, y: 2.2 },
        B: { name: 'B', x: 1.5, y: 2.2 },
        C: { name: 'C', x: 4, y: -1.8 },
        D: { name: 'D', x: -3, y: -1.8 }
      };
    case 'right_triangle':
    default:
      // Right triangle at A(0,0), B(6,0), C(0,3.5) -> H(1.53, 2.61) and M(3.0, 1.75) are well separated!
      return {
        A: { name: 'A', x: 0, y: 0 },
        B: { name: 'B', x: 6, y: 0 },
        C: { name: 'C', x: 0, y: 3.5 }
      };
  }
}

/**
 * Formats a 2D Plane Geometry configuration into a [MATH_GEOMETRY_2D] tag string
 */
export function formatMathGeometry2DTag(config) {
  const {
    shapeType = 'right_triangle',
    title = 'Hình học phẳng 2D tương tác',
    formula = '\\triangle ABC',
    vertices = null,
    extraPoints = [],
    auxLines = [],
    showCircumcircle = true,
    showAltitude = true,
    showMedian = true,
    showAxes = false
  } = config || {};

  let tag = `\n\n[MATH_GEOMETRY_2D]\n`;
  tag += `shape: ${shapeType}\n`;
  tag += `title: ${title}\n`;
  tag += `formula: ${formula}\n`;
  tag += `circumcircle: ${showCircumcircle ? 'true' : 'false'}\n`;
  tag += `altitude: ${showAltitude ? 'true' : 'false'}\n`;
  tag += `median: ${showMedian ? 'true' : 'false'}\n`;
  tag += `axes: ${showAxes ? 'true' : 'false'}\n`;

  if (vertices && typeof vertices === 'object') {
    const vStr = Object.entries(vertices)
      .map(([k, v]) => `${k}:${v.name || k}(${Number(v.x ?? 0)},${Number(v.y ?? 0)})`)
      .join('; ');
    if (vStr) tag += `vertices: ${vStr}\n`;
  }

  if (Array.isArray(extraPoints) && extraPoints.length > 0) {
    const epStr = extraPoints
      .map(ep => `${ep.id}:${ep.name || ep.id}@${ep.parentA}-${ep.parentB}:${ep.ratio ?? 0.5}`)
      .join('; ');
    if (epStr) tag += `extra_points: ${epStr}\n`;
  }

  if (Array.isArray(auxLines) && auxLines.length > 0) {
    const auxStr = auxLines
      .map(l => `${l.from}-${l.to}:${l.style || 'dashed'}:${l.color || '#f97316'}:${l.label || ''}`)
      .join('; ');
    if (auxStr) tag += `aux_lines: ${auxStr}\n`;
  }

  tag += `[/MATH_GEOMETRY_2D]\n\n`;
  return tag;
}

/**
 * Parses a [MATH_GEOMETRY_2D]...[/MATH_GEOMETRY_2D] tag into a configuration object
 */
export function parseMathGeometry2DTag(tagString) {
  if (!tagString || typeof tagString !== 'string') return null;

  const match = tagString.match(/\[MATH_GEOMETRY_2D\]([\s\S]*?)\[\/MATH_GEOMETRY_2D\]/i);
  if (!match) return null;

  const content = match[1].trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  const config = {
    is2DGeometry: true,
    shapeType: 'right_triangle',
    title: 'Hình học phẳng 2D tương tác',
    formula: '\\triangle ABC',
    showCircumcircle: true,
    showAltitude: true,
    showMedian: true,
    showAxes: false,
    vertices: null,
    extraPoints: [],
    auxLines: []
  };

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'shape' || key === 'type') {
      config.shapeType = val;
    } else if (key === 'title') {
      config.title = val;
    } else if (key === 'formula') {
      config.formula = val;
    } else if (key === 'circumcircle') {
      config.showCircumcircle = val.toLowerCase() !== 'false';
    } else if (key === 'altitude') {
      config.showAltitude = val.toLowerCase() !== 'false';
    } else if (key === 'median') {
      config.showMedian = val.toLowerCase() !== 'false';
    } else if (key === 'axes') {
      config.showAxes = val.toLowerCase() === 'true';
    } else if (key === 'vertices') {
      const parsedVertices = {};
      val.split(';').map(s => s.trim()).filter(Boolean).forEach(part => {
        const m = part.match(/^([A-Za-z0-9_]+):([^(]+)\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/);
        if (m) {
          parsedVertices[m[1]] = {
            name: m[2].trim(),
            x: parseFloat(m[3]),
            y: parseFloat(m[4])
          };
        }
      });
      if (Object.keys(parsedVertices).length > 0) {
        config.vertices = parsedVertices;
      }
    } else if (key === 'extra_points') {
      val.split(';').map(s => s.trim()).filter(Boolean).forEach(part => {
        const m = part.match(/^([^:]+):([^@]+)@([^-]+)-([^:]+):([-\d.]+)$/);
        if (m) {
          config.extraPoints.push({
            id: m[1].trim(),
            name: m[2].trim(),
            parentA: m[3].trim(),
            parentB: m[4].trim(),
            ratio: parseFloat(m[5])
          });
        }
      });
    } else if (key === 'aux_lines') {
      val.split(';').map(s => s.trim()).filter(Boolean).forEach(part => {
        const parts = part.split(':');
        if (parts.length >= 1) {
          const [from, to] = parts[0].split('-').map(s => s.trim());
          if (from && to) {
            config.auxLines.push({
              from,
              to,
              style: parts[1] || 'dashed',
              color: parts[2] || '#f97316',
              label: parts.slice(3).join(':') || ''
            });
          }
        }
      });
    }
  }

  if (!config.vertices) {
    config.vertices = getDefault2DGeometryPoints(config.shapeType);
  }

  return config;
}

export const SHAPES_2D_META = {
  right_triangle: {
    id: 'right_triangle',
    label: 'Tam giác vuông ABC',
    title: 'Tam giác vuông ABC (Đường cao AH, Trung tuyến AM)',
    formula: '\\triangle ABC \\text{ vuông tại } A, AH \\perp BC',
    desc: 'Tam giác vuông $ABC$ tại $A$, đường cao $AH \\perp BC$ ($AH^2 = BH \\cdot HC$), trung tuyến $AM = \\frac{1}{2}BC$ và đường tròn ngoại tiếp tâm $M$.'
  },
  acute_triangle: {
    id: 'acute_triangle',
    label: 'Tam giác & Đường tròn (O)',
    title: 'Tam giác nhọn ABC (Trực tâm H, Trọng tâm G, Tâm O)',
    formula: '\\triangle ABC, (O), H, G',
    desc: 'Tam giác $ABC$ nội tiếp đường tròn $(O)$, đường cao $AH_a, BH_b$ cắt nhau tại trực tâm $H$, trung tuyến $AM$ và trọng tâm $G$.'
  },
  circle_tangent: {
    id: 'circle_tangent',
    label: 'Đường tròn & Tiếp tuyến MA, MB',
    title: 'Hai tiếp tuyến MA, MB của đường tròn (O; R)',
    formula: 'MA, MB \\text{ là tiếp tuyến của } (O; R)',
    desc: 'Từ điểm $M$ nằm ngoài đường tròn $(O; R)$ kẻ hai tiếp tuyến $MA, MB$ ($A, B$ là tiếp điểm). Khi đó $OM \\perp AB$ tại $H$ và $OA^2 = OH \\cdot OM$.'
  },
  quadrilateral_cyclic: {
    id: 'quadrilateral_cyclic',
    label: 'Tứ giác nội tiếp ABCD',
    title: 'Tứ giác nội tiếp ABCD & Giao điểm hai đường chéo',
    formula: 'ABCD \\text{ nội tiếp } (O)',
    desc: 'Tứ giác $ABCD$ nội tiếp đường tròn $(O)$ có tổng hai góc đối bằng $180^\\circ$ và hai đường chéo $AC, BD$ cắt nhau tại $I$.'
  },
  parallelogram_rhombus: {
    id: 'parallelogram_rhombus',
    label: 'Hình bình hành / Hình thoi ABCD',
    title: 'Hình bình hành ABCD & Giao điểm hai đường chéo O',
    formula: 'ABCD \\text{ là hình bình hành}, AC \\cap BD = O',
    desc: 'Hình bình hành $ABCD$ có hai đường chéo $AC, BD$ cắt nhau tại trung điểm $O$ của mỗi đường và đường cao $AH \\perp CD$.'
  },
  trapezoid_right: {
    id: 'trapezoid_right',
    label: 'Hình thang vuông ABCD',
    title: 'Hình thang vuông ABCD (Vuông tại A và D)',
    formula: 'ABCD \\text{ là hình thang vuông tại } A, D',
    desc: 'Hình thang vuông $ABCD$ ($AB \\parallel CD$, $\\hat{A} = \\hat{D} = 90^\\circ$) với đường cao $BH \\perp CD$ và hai đường chéo $AC, BD$.'
  }
};

/**
 * Renders an interactive 2D Plane Geometry model onto an initialized JSXGraph board
 */
export function mount2DGeometryBoard(board, config = {}, interactive = true) {
  if (!board) return {};

  const shapeType = config.shapeType || 'right_triangle';
  const rawVertices = config.vertices || getDefault2DGeometryPoints(shapeType);
  const showCircumcircle = config.showCircumcircle !== false;
  const showAltitude = config.showAltitude !== false;
  const showMedian = config.showMedian !== false;

  const ptsMap = {};

  const createVertex = (key, fallbackX, fallbackY, color = '#2563eb', labelOffset = [8, 10], extraLabel = '') => {
    const v = rawVertices[key] || { name: key, x: fallbackX, y: fallbackY };
    const displayName = extraLabel ? `${v.name || key} ${extraLabel}` : (v.name || key);
    const pt = board.create('point', [Number(v.x ?? fallbackX), Number(v.y ?? fallbackY)], {
      name: displayName,
      size: 4,
      color,
      fixed: !interactive,
      label: {
        offset: labelOffset,
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 12
      }
    });
    ptsMap[key] = pt;
    return pt;
  };

  if (shapeType === 'right_triangle') {
    const pA = createVertex('A', 0, 0, '#ef4444', [-18, -16], '(Góc vuông)');
    const pB = createVertex('B', 6, 0, '#2563eb', [10, -10]);
    const pC = createVertex('C', 0, 3.5, '#10b981', [-18, 12]);

    board.create('polygon', [pA, pB, pC], {
      fillColor: '#e0e7ff',
      fillOpacity: 0.28,
      borders: { strokeColor: '#1e293b', strokeWidth: 2.4 }
    });

    // Right angle marker at A
    board.create('angle', [pB, pA, pC], {
      type: 'square',
      orthoType: 'square',
      radius: 0.45,
      fillColor: '#fca5a5',
      fillOpacity: 0.45,
      strokeColor: '#ef4444',
      withLabel: false
    });

    const lineBC = board.create('line', [pB, pC], { visible: false });

    if (showAltitude) {
      const perpAH = board.create('perpendicular', [lineBC, pA], { visible: false });
      const pH = board.create('intersection', [lineBC, perpAH, 0], {
        name: 'H (Chân đường cao)',
        size: 3.5,
        color: '#f97316',
        label: { offset: [-65, -18], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['H'] = pH;
      board.create('segment', [pA, pH], {
        strokeColor: '#f97316',
        dash: 2,
        strokeWidth: 2.2
      });
      board.create('angle', [pA, pH, pB], {
        type: 'square',
        orthoType: 'square',
        radius: 0.35,
        fillColor: '#fdba74',
        fillOpacity: 0.4,
        strokeColor: '#ea580c',
        withLabel: false
      });
    }

    if (showMedian) {
      const pM = board.create('midpoint', [pB, pC], {
        name: 'M (Tâm ngoại tiếp)',
        size: 3.5,
        color: '#6366f1',
        label: { offset: [12, 14], color: '#4338ca', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['M'] = pM;
      board.create('segment', [pA, pM], {
        strokeColor: '#6366f1',
        dash: 3,
        strokeWidth: 1.8
      });
    }

    if (showCircumcircle) {
      board.create('circumcircle', [pA, pB, pC], {
        strokeColor: '#8b5cf6',
        dash: 2,
        strokeWidth: 1.6,
        center: { visible: false }
      });
    }
  } else if (shapeType === 'acute_triangle') {
    const pA = createVertex('A', 1, 4.5, '#ef4444', [0, 14]);
    const pB = createVertex('B', -3.5, -1.5, '#2563eb', [-20, -12]);
    const pC = createVertex('C', 4.5, -1.5, '#10b981', [10, -12]);

    board.create('polygon', [pA, pB, pC], {
      fillColor: '#dbeafe',
      fillOpacity: 0.25,
      borders: { strokeColor: '#1e293b', strokeWidth: 2.4 }
    });

    const lineBC = board.create('line', [pB, pC], { visible: false });
    const lineAC = board.create('line', [pA, pC], { visible: false });

    if (showAltitude) {
      const perpA = board.create('perpendicular', [lineBC, pA], { visible: false });
      const perpB = board.create('perpendicular', [lineAC, pB], { visible: false });
      const pHa = board.create('intersection', [lineBC, perpA, 0], {
        name: 'H_a',
        size: 2.8,
        color: '#f97316',
        label: { offset: [-8, -16], color: '#c2410c', fontSize: 10, fontWeight: 'bold' }
      });
      const pHb = board.create('intersection', [lineAC, perpB, 0], {
        name: 'H_b',
        size: 2.8,
        color: '#f97316',
        label: { offset: [10, 6], color: '#c2410c', fontSize: 10, fontWeight: 'bold' }
      });
      const pH = board.create('intersection', [perpA, perpB, 0], {
        name: 'H (Trực tâm)',
        size: 3.5,
        color: '#ea580c',
        label: { offset: [-55, 12], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['H'] = pH;
      ptsMap['Ha'] = pHa;
      ptsMap['Hb'] = pHb;
      board.create('segment', [pA, pHa], { strokeColor: '#f97316', dash: 2, strokeWidth: 1.8 });
      board.create('segment', [pB, pHb], { strokeColor: '#f97316', dash: 2, strokeWidth: 1.8 });
    }

    if (showMedian) {
      const pM = board.create('midpoint', [pB, pC], {
        name: 'M',
        size: 3,
        color: '#10b981',
        label: { offset: [6, -16], color: '#047857', fontWeight: 'bold', fontSize: 11 }
      });
      const pN = board.create('midpoint', [pA, pC], { visible: false });
      const medA = board.create('segment', [pA, pM], { strokeColor: '#10b981', dash: 3, strokeWidth: 1.7 });
      const medB = board.create('line', [pB, pN], { visible: false });
      const pG = board.create('intersection', [medA, medB, 0], {
        name: 'G (Trọng tâm)',
        size: 3.5,
        color: '#059669',
        label: { offset: [10, 10], color: '#065f46', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['M'] = pM;
      ptsMap['G'] = pG;
    }

    if (showCircumcircle) {
      const pO = board.create('circumcenter', [pA, pB, pC], {
        name: 'O (Tâm ngoại tiếp)',
        size: 3.5,
        color: '#7c3aed',
        label: { offset: [10, -14], color: '#5b21b6', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['O'] = pO;
      board.create('circumcircle', [pA, pB, pC], {
        strokeColor: '#8b5cf6',
        dash: 2,
        strokeWidth: 1.6,
        center: { visible: false }
      });
    }
  } else if (shapeType === 'circle_tangent') {
    const pO = createVertex('O', 0, 0, '#7c3aed', [-16, -14]);
    const pM = createVertex('M', 6, 0, '#ef4444', [10, -12]);
    const pA = createVertex('A', 1.5, 2.598, '#2563eb', [-8, 14]);

    const circle = board.create('circle', [pO, pA], {
      strokeColor: '#4f46e5',
      strokeWidth: 2.4,
      fillColor: '#eef2ff',
      fillOpacity: 0.2
    });

    const lineOM = board.create('line', [pO, pM], { visible: false });
    const pB = board.create('reflection', [pA, lineOM], {
      name: 'B (Tiếp điểm)',
      size: 3.8,
      color: '#2563eb',
      label: { offset: [-8, -18], color: '#1e40af', fontWeight: 'bold', fontSize: 11 }
    });
    ptsMap['B'] = pB;

    board.create('segment', [pM, pA], { strokeColor: '#1e293b', strokeWidth: 2.4 });
    board.create('segment', [pM, pB], { strokeColor: '#1e293b', strokeWidth: 2.4 });
    board.create('segment', [pO, pA], { strokeColor: '#7c3aed', dash: 2, strokeWidth: 1.8 });
    board.create('segment', [pO, pB], { strokeColor: '#7c3aed', dash: 2, strokeWidth: 1.8 });

    if (showMedian) {
      board.create('segment', [pO, pM], { strokeColor: '#6366f1', dash: 3, strokeWidth: 1.8 });
    }

    if (showAltitude) {
      const segAB = board.create('segment', [pA, pB], { strokeColor: '#f97316', strokeWidth: 2 });
      const pH = board.create('intersection', [lineOM, segAB, 0], {
        name: 'H',
        size: 3.2,
        color: '#ea580c',
        label: { offset: [-14, 12], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['H'] = pH;
    }

    if (showCircumcircle) {
      board.create('circumcircle', [pO, pA, pM], {
        strokeColor: '#ec4899',
        dash: 2,
        strokeWidth: 1.5,
        center: { visible: false }
      });
    }
  } else if (shapeType === 'quadrilateral_cyclic') {
    const pA = createVertex('A', -2.2, 2.6, '#ef4444', [-16, 12]);
    const pB = createVertex('B', 2.5, 2.3, '#2563eb', [10, 12]);
    const pC = createVertex('C', 2.8, -1.9, '#10b981', [10, -14]);
    const pD = createVertex('D', -2.6, -2.2, '#f59e0b', [-18, -14]);

    board.create('polygon', [pA, pB, pC, pD], {
      fillColor: '#e0e7ff',
      fillOpacity: 0.25,
      borders: { strokeColor: '#1e293b', strokeWidth: 2.4 }
    });

    if (showAltitude) {
      const diagAC = board.create('segment', [pA, pC], { strokeColor: '#f97316', dash: 2, strokeWidth: 1.8 });
      const diagBD = board.create('segment', [pB, pD], { strokeColor: '#f97316', dash: 2, strokeWidth: 1.8 });
      const pI = board.create('intersection', [diagAC, diagBD, 0], {
        name: 'I (Giao 2 đường chéo)',
        size: 3.5,
        color: '#ea580c',
        label: { offset: [10, 10], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['I'] = pI;
    }

    if (showCircumcircle) {
      const pO = board.create('circumcenter', [pA, pB, pC], {
        name: 'O',
        size: 3.2,
        color: '#7c3aed',
        label: { offset: [-14, -14], color: '#5b21b6', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['O'] = pO;
      board.create('circumcircle', [pA, pB, pC], {
        strokeColor: '#8b5cf6',
        dash: 2,
        strokeWidth: 1.7,
        center: { visible: false }
      });
    }
  } else if (shapeType === 'parallelogram_rhombus') {
    const pA = createVertex('A', -3.5, -1.8, '#ef4444', [-18, -14]);
    const pB = createVertex('B', 1.5, -1.8, '#2563eb', [10, -14]);
    const pD = createVertex('D', -1.5, 2.2, '#f59e0b', [-18, 12]);
    const pC = board.create('point', [
      () => pB.X() + pD.X() - pA.X(),
      () => pB.Y() + pD.Y() - pA.Y()
    ], {
      name: rawVertices.C?.name || 'C',
      size: 3.8,
      color: '#10b981',
      label: { offset: [10, 12], color: '#0f172a', fontWeight: 'bold', fontSize: 12 }
    });
    ptsMap['C'] = pC;

    board.create('polygon', [pA, pB, pC, pD], {
      fillColor: '#dcfce7',
      fillOpacity: 0.25,
      borders: { strokeColor: '#1e293b', strokeWidth: 2.4 }
    });

    if (showMedian) {
      board.create('segment', [pA, pC], { strokeColor: '#6366f1', dash: 2, strokeWidth: 1.8 });
      board.create('segment', [pB, pD], { strokeColor: '#6366f1', dash: 2, strokeWidth: 1.8 });
      const pO = board.create('midpoint', [pA, pC], {
        name: 'O (Tâm đối xứng)',
        size: 3.5,
        color: '#4f46e5',
        label: { offset: [10, -14], color: '#3730a3', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['O'] = pO;
    }

    if (showAltitude) {
      const lineAB = board.create('line', [pA, pB], { visible: false });
      const perpDH = board.create('perpendicular', [lineAB, pD], { visible: false });
      const pH = board.create('intersection', [lineAB, perpDH, 0], {
        name: 'H (Đường cao)',
        size: 3.2,
        color: '#f97316',
        label: { offset: [-10, -18], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['H'] = pH;
      board.create('segment', [pD, pH], { strokeColor: '#f97316', dash: 2, strokeWidth: 2 });
    }
  } else if (shapeType === 'trapezoid_right') {
    const pA = createVertex('A', -3, 2.2, '#ef4444', [-18, 12]);
    const pB = createVertex('B', 1.5, 2.2, '#2563eb', [8, 12]);
    const pC = createVertex('C', 4, -1.8, '#10b981', [10, -14]);
    const pD = createVertex('D', -3, -1.8, '#f59e0b', [-18, -14]);

    board.create('polygon', [pA, pB, pC, pD], {
      fillColor: '#fef3c7',
      fillOpacity: 0.3,
      borders: { strokeColor: '#1e293b', strokeWidth: 2.4 }
    });

    board.create('angle', [pD, pA, pB], {
      type: 'square', orthoType: 'square', radius: 0.4,
      fillColor: '#fca5a5', fillOpacity: 0.4, strokeColor: '#ef4444', withLabel: false
    });
    board.create('angle', [pC, pD, pA], {
      type: 'square', orthoType: 'square', radius: 0.4,
      fillColor: '#fca5a5', fillOpacity: 0.4, strokeColor: '#ef4444', withLabel: false
    });

    if (showAltitude) {
      const lineCD = board.create('line', [pC, pD], { visible: false });
      const perpBH = board.create('perpendicular', [lineCD, pB], { visible: false });
      const pH = board.create('intersection', [lineCD, perpBH, 0], {
        name: 'H',
        size: 3.2,
        color: '#f97316',
        label: { offset: [-6, -18], color: '#c2410c', fontWeight: 'bold', fontSize: 11 }
      });
      ptsMap['H'] = pH;
      board.create('segment', [pB, pH], { strokeColor: '#f97316', dash: 2, strokeWidth: 2 });
    }

    if (showMedian) {
      board.create('segment', [pA, pC], { strokeColor: '#6366f1', dash: 3, strokeWidth: 1.7 });
      board.create('segment', [pB, pD], { strokeColor: '#6366f1', dash: 3, strokeWidth: 1.7 });
    }
  }

  // Render extra points (midpoints / ratio points on segments)
  if (Array.isArray(config.extraPoints)) {
    config.extraPoints.forEach(ep => {
      const p1 = ptsMap[ep.parentA];
      const p2 = ptsMap[ep.parentB];
      if (p1 && p2) {
        const r = Number(ep.ratio ?? 0.5);
        const pt = board.create('point', [
          () => (1 - r) * p1.X() + r * p2.X(),
          () => (1 - r) * p1.Y() + r * p2.Y()
        ], {
          name: ep.name || ep.id,
          size: 3.5,
          color: '#ec4899',
          label: { offset: [8, 10], color: '#be185d', fontWeight: 'bold', fontSize: 11 }
        });
        ptsMap[ep.id] = pt;
      }
    });
  }

  // Render custom auxiliary lines
  if (Array.isArray(config.auxLines)) {
    config.auxLines.forEach(line => {
      const p1 = ptsMap[line.from];
      const p2 = ptsMap[line.to];
      if (p1 && p2) {
        board.create('segment', [p1, p2], {
          strokeColor: line.color || '#f97316',
          strokeWidth: 2.2,
          dash: line.style === 'solid' ? 0 : 2,
          name: line.label || '',
          withLabel: Boolean(line.label),
          label: { position: 'top', color: line.color || '#ea580c', fontWeight: 'bold', fontSize: 11 }
        });
      }
    });
  }

  return ptsMap;
}
