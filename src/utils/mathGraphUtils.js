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

