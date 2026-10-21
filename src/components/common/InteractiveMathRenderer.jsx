import React, { useEffect, useRef, useState, useMemo, useId } from 'react';
import JXG from 'jsxgraph';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Box,
  Activity,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Info,
  Layers,
  Sparkles,
  Compass,
  Edit2
} from 'lucide-react';
import {
  compileMathFunction,
  parseMathGraphTag,
  parseMathGraph3DTag,
  getDefaultBasePoints
} from '../../utils/mathGraphUtils';

function renderMath(latex) {
  if (!latex) return '';
  try {
    const clean = latex.replace(/^\$+|\$+$/g, '').trim();
    return katex.renderToString(clean, { throwOnError: false });
  } catch {
    return latex;
  }
}

/**
 * InteractiveMathRenderer Component:
 * Standalone, reusable, client-side live 2D & 3D mathematical graph renderer
 * Powered by JSXGraph v1.14.0 native engine.
 *
 * Supports:
 * - 3D Spatial Geometry: 9 canonical models, customized base vertices & labels, extra points, auxiliary dashed/solid lines, 360° trackball rotation, zoom, reset view.
 * - 2D Advanced Calculus: Polynomials, rationals, custom formulas, derivatives, intersection with y=mx+m, area between curves, triple curve identification.
 */
export default function InteractiveMathRenderer({
  rawTag,
  data,
  className = '',
  height = 320,
  interactive = true,
  showControls = true,
  allowExpand = true,
  onEdit = null
}) {
  const generatedId = useId().replace(/[:]/g, '_');
  const boardId = useMemo(() => `jxg_math_${generatedId}_${Math.random().toString(36).substring(2, 7)}`, [generatedId]);
  
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const view3dRef = useRef(null);
  const axesElementsRef = useRef([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [boardReady, setBoardReady] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [showAxes, setShowAxes] = useState(false);

  // Parse configuration from rawTag string or direct data prop
  const config = useMemo(() => {
    if (data) return data;
    if (!rawTag || typeof rawTag !== 'string') return null;

    const trimmed = rawTag.trim();
    if (trimmed.toUpperCase().startsWith('[MATH_GRAPH_3D]')) {
      return parseMathGraph3DTag(trimmed);
    }
    if (trimmed.toUpperCase().startsWith('[MATH_GRAPH]')) {
      return parseMathGraphTag(trimmed);
    }
    return null;
  }, [rawTag, data]);

  const is3D = config?.is3D ?? false;

  // Mount JSXGraph Board
  useEffect(() => {
    if (!config || !containerRef.current) return;

    // Destroy any existing board on this container
    if (boardRef.current) {
      try {
        JXG.JSXGraph.freeBoard(boardRef.current);
      } catch (e) {
        console.warn('Freeing board warning:', e);
      }
      boardRef.current = null;
      view3dRef.current = null;
    }

    try {
      const containerElem = containerRef.current;
      const elId = containerElem.id || boardId;
      containerElem.id = elId;

      // =========================================================
      // 1. RENDER 3D SPATIAL GEOMETRY MODEL
      // =========================================================
      if (is3D) {
        const board = JXG.JSXGraph.initBoard(elId, {
          boundingbox: [-7, 7, 7, -7],
          axis: false,
          showNavigation: false,
          showCopyright: false,
          pan: { enabled: false },
          zoom: { factorX: 1.25, factorY: 1.25, wheel: interactive, needOption: false }
        });

        const view = board.create(
          'view3d',
          [[-5, -4], [10, 8], [[-6, 6], [-6, 6], [-2, 8]]],
          {
            az: config.azimuth || 0.85,
            el: config.elevation || 0.35,
            trackball: { enabled: interactive },
            axesPosition: 'none',
            // Tắt hoàn toàn các mặt phẳng thành hộp (rear/front walls) để tránh lỗi vạch chia nửa trắng/nửa lưới
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
        view3dRef.current = view;

        // =========================================================
        // HỆ TRỤC TỌA ĐỘ OXYZ CHUYÊN NGHIỆP (CHUẨN SGK TOÁN GDPT 2018)
        // =========================================================
        const axesList = [];

        // Gốc O(0, 0, 0)
        const ptO = view.create('point3d', [0, 0, 0], {
          name: 'O',
          size: 2.5,
          color: '#475569',
          fixed: true,
          visible: showAxes,
          withLabel: true,
          label: { offset: [-12, -8], color: '#334155', fontWeight: 'bold', fontSize: 11 }
        });
        axesList.push(ptO);

        // Trục Ox (Vector [1, 0, 0], màu đỏ #ef4444)
        const ptX = view.create('point3d', [5.5, 0, 0], {
          name: 'x',
          size: 1.5,
          color: '#ef4444',
          fixed: true,
          visible: showAxes,
          withLabel: true,
          label: { offset: [6, 2], color: '#dc2626', fontWeight: 'bold', fontSize: 12 }
        });
        const lineOx = view.create('line3d', [ptO, ptX], {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeColor: '#ef4444',
          strokeWidth: 2,
          visible: showAxes
        });
        axesList.push(ptX, lineOx);

        // Trục Oy (Vector [0, 1, 0], màu xanh lá #10b981)
        const ptY = view.create('point3d', [0, 5.5, 0], {
          name: 'y',
          size: 1.5,
          color: '#10b981',
          fixed: true,
          visible: showAxes,
          withLabel: true,
          label: { offset: [6, 6], color: '#059669', fontWeight: 'bold', fontSize: 12 }
        });
        const lineOy = view.create('line3d', [ptO, ptY], {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeColor: '#10b981',
          strokeWidth: 2,
          visible: showAxes
        });
        axesList.push(ptY, lineOy);

        // Trục Oz (Vector [0, 0, 1], màu xanh dương #3b82f6)
        const ptZ = view.create('point3d', [0, 0, 6.5], {
          name: 'z',
          size: 1.5,
          color: '#3b82f6',
          fixed: true,
          visible: showAxes,
          withLabel: true,
          label: { offset: [-4, 10], color: '#2563eb', fontWeight: 'bold', fontSize: 12 }
        });
        const lineOz = view.create('line3d', [ptO, ptZ], {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeColor: '#3b82f6',
          strokeWidth: 2,
          visible: showAxes
        });
        axesList.push(ptZ, lineOz);

        // Các tia âm nét đứt (Negative axis rays)
        const ptXNeg = view.create('point3d', [-2.5, 0, 0], { visible: false, fixed: true });
        const lineOxNeg = view.create('line3d', [ptO, ptXNeg], {
          straightFirst: false,
          straightLast: false,
          dash: 2,
          strokeColor: '#fca5a5',
          strokeWidth: 1.2,
          visible: showAxes
        });
        const ptYNeg = view.create('point3d', [0, -2.5, 0], { visible: false, fixed: true });
        const lineOyNeg = view.create('line3d', [ptO, ptYNeg], {
          straightFirst: false,
          straightLast: false,
          dash: 2,
          strokeColor: '#86efac',
          strokeWidth: 1.2,
          visible: showAxes
        });
        const ptZNeg = view.create('point3d', [0, 0, -2], { visible: false, fixed: true });
        const lineOzNeg = view.create('line3d', [ptO, ptZNeg], {
          straightFirst: false,
          straightLast: false,
          dash: 2,
          strokeColor: '#93c5fd',
          strokeWidth: 1.2,
          visible: showAxes
        });
        axesList.push(ptXNeg, lineOxNeg, ptYNeg, lineOyNeg, ptZNeg, lineOzNeg);

        axesElementsRef.current = axesList;

        const ptsMap = {};
        const coordMap = {};

        const regPt = (key, coords, opts) => {
          coordMap[key] = coords;
          ptsMap[key] = view.create('point3d', coords, opts);
          return ptsMap[key];
        };

        // Render base vertices (custom or default)
        const basePts = config.vertices || getDefaultBasePoints(
          config.shapeType || 'pyramid_rect_sa',
          config.dimensions?.w || 4,
          config.dimensions?.d || 3.5,
          config.dimensions?.h || 4
        );

        Object.entries(basePts).forEach(([key, ptData]) => {
          regPt(key, [ptData.x, ptData.y, ptData.z], {
            name: ptData.label || key,
            size: key === 'S' || key === 'O' || key === 'G' ? 4 : 3.5,
            color: ptData.color || '#0f172a'
          });
        });

        const shapeType = config.shapeType || 'pyramid_rect_sa';

        // Render primary geometry wireframe edges
        if (shapeType === 'pyramid_rect_sa' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        } else if (shapeType === 'pyramid_tri_sa' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['S']) {
          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        } else if ((shapeType === 'tetrahedron' || shapeType === 'pyramid_tri_sa') && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D']) {
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });

          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
        } else if (shapeType === 'pyramid_regular_quad' && ptsMap['O'] && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
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
        } else if (shapeType === 'pyramid_regular_tri' && ptsMap['G'] && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['S']) {
          view.create('line3d', [ptsMap['S'], ptsMap['G']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        } else if (shapeType === 'pyramid_side_perp' && ptsMap['A'] && ptsMap['B'] && ptsMap['H'] && ptsMap['C'] && ptsMap['D'] && ptsMap['S']) {
          view.create('line3d', [ptsMap['S'], ptsMap['H']], { straightFirst: false, straightLast: false, strokeColor: '#dc2626', strokeWidth: 2.5, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap['C'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap['S'], ptsMap['A']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['S'], ptsMap['D']], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        } else if (shapeType === 'prism_tri' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap["A'"] && ptsMap["B'"] && ptsMap["C'"]) {
          view.create('line3d', [ptsMap['A'], ptsMap['B']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap["A'"], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap["B'"], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });
          view.create('line3d', [ptsMap["C'"], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#0f172a', strokeWidth: 2 });

          view.create('line3d', [ptsMap['A'], ptsMap["A'"]], { straightFirst: false, straightLast: false, strokeColor: '#475569', strokeWidth: 1.8, dash: 2 });
          view.create('line3d', [ptsMap['B'], ptsMap["B'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptsMap['C'], ptsMap["C'"]], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
        } else if (shapeType === 'box_cube' && ptsMap['A'] && ptsMap['B'] && ptsMap['C'] && ptsMap['D'] && ptsMap["A'"] && ptsMap["B'"] && ptsMap["C'"] && ptsMap["D'"]) {
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
        } else if (shapeType === 'solid_revolution') {
          const R = config.dimensions?.r || 3;
          const H = config.dimensions?.h || 4;
          const ptO = view.create('point3d', [0, 0, 0], { name: 'O', size: 3, color: '#0f172a' });
          const ptS = view.create('point3d', [0, 0, H], { name: 'S', size: 4, color: '#ef4444' });
          view.create('line3d', [ptS, ptO], { straightFirst: false, straightLast: false, strokeColor: '#ef4444', strokeWidth: 2, dash: 2 });
          view.create('circle3d', [ptO, [0, 0, 1], R], { strokeColor: '#2563eb', strokeWidth: 2 });
          const ptA = view.create('point3d', [-R, 0, 0], { name: 'A', size: 3 });
          const ptB = view.create('point3d', [R, 0, 0], { name: 'B', size: 3 });
          view.create('line3d', [ptS, ptA], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptS, ptB], { straightFirst: false, straightLast: false, strokeColor: '#2563eb', strokeWidth: 2 });
          view.create('line3d', [ptA, ptB], { straightFirst: false, straightLast: false, strokeColor: '#94a3b8', strokeWidth: 1.5, dash: 2 });
        } else if (shapeType === 'sphere_plane') {
          const R = config.dimensions?.r || 3;
          const d = Math.min(config.dimensions?.planeD || 1.8, R - 0.2);
          const rIntersection = Math.sqrt(Math.max(0.1, R * R - d * d));
          const ptI = view.create('point3d', [0, 0, 0], { name: 'I', size: 4, color: '#ef4444' });
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

        // Render extra user-defined points
        if (config.extraPoints && Array.isArray(config.extraPoints)) {
          config.extraPoints.forEach(pt => {
            if (pt.isPresetProjection && ptsMap['S'] && ptsMap['B']) {
              const cS = coordMap['S'] || [0, 0, config.dimensions?.h || 4];
              const cB = coordMap['B'] || [config.dimensions?.w || 4, 0, 0];
              const aVal = cB[0];
              const hVal = cS[2];
              const kX = (aVal * (hVal ** 2)) / (aVal ** 2 + hVal ** 2);
              const kZ = ((aVal ** 2) * hVal) / (aVal ** 2 + hVal ** 2);
              ptsMap[pt.id] = view.create('point3d', [kX, 0, kZ], { name: pt.name || pt.id, size: 4, color: pt.color || '#ef4444' });
              coordMap[pt.id] = [kX, 0, kZ];
            } else if (pt.edge && pt.edge.length === 2) {
              const c1 = coordMap[pt.edge[0]];
              const c2 = coordMap[pt.edge[1]];
              if (c1 && c2) {
                const k = pt.ratio !== undefined ? pt.ratio : 0.5;
                const px = (1 - k) * c1[0] + k * c2[0];
                const py = (1 - k) * c1[1] + k * c2[1];
                const pz = (1 - k) * c1[2] + k * c2[2];
                ptsMap[pt.id] = view.create('point3d', [px, py, pz], { name: pt.name || pt.id, size: 3.5, color: pt.color || '#ec4899' });
                coordMap[pt.id] = [px, py, pz];
              }
            }
          });
        }

        // Preset constructions
        if (config.preset === 'distance_model' && ptsMap['A'] && ptsMap['K']) {
          view.create('line3d', [ptsMap['A'], ptsMap['K']], {
            straightFirst: false, straightLast: false, strokeColor: '#ef4444', strokeWidth: 3, dash: 2
          });
          if (ptsMap['S'] && ptsMap['B'] && ptsMap['C']) {
            view.create('polygon3d', [ptsMap['S'], ptsMap['B'], ptsMap['C']], {
              fillColor: '#93c5fd', fillOpacity: 0.28, borders: { visible: false }
            });
          }
        } else if (config.preset === 'angle_line_plane' && ptsMap['S'] && ptsMap['C'] && ptsMap['A']) {
          view.create('line3d', [ptsMap['A'], ptsMap['C']], { straightFirst: false, straightLast: false, strokeColor: '#f59e0b', strokeWidth: 2.2, dash: 2 });
          view.create('polygon3d', [ptsMap['S'], ptsMap['A'], ptsMap['C']], {
            fillColor: '#fde68a', fillOpacity: 0.35, borders: { strokeColor: '#f59e0b', strokeWidth: 1.5 }
          });
        }

        // Custom auxiliary lines
        if (config.auxLines && Array.isArray(config.auxLines)) {
          config.auxLines.forEach(line => {
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
        }

        boardRef.current = board;
      }

      // =========================================================
      // 2. RENDER 2D FUNCTION CALCULUS GRAPH
      // =========================================================
      else {
        const board = JXG.JSXGraph.initBoard(elId, {
          boundingbox: [-6.5, 7, 6.5, -6],
          axis: true,
          showNavigation: false,
          showCopyright: false,
          pan: { enabled: interactive },
          zoom: { factorX: 1.25, factorY: 1.25, wheel: interactive, needOption: false }
        });

        const examMode = config.examMode || 'standard';

        // Mode: Nhận dạng 3 đường cong f(x), f'(x), F(x)
        if (examMode === 'three_curves_recognition') {
          const f0 = (x) => x ** 3 - 3 * x;
          const fPrime = (x) => 3 * x ** 2 - 3;
          const fIntegral = (x) => (x ** 4) / 4 - (3 * x ** 2) / 2;

          board.create('functiongraph', [f0, -6, 6], {
            strokeColor: '#2563eb', strokeWidth: 2.8,
            name: config.hideCurveLabels ? '(C₁)' : 'f(x) = x³ - 3x',
            withLabel: true, label: { position: 'top', color: '#2563eb', fontWeight: 'bold' }
          });
          board.create('functiongraph', [fPrime, -6, 6], {
            strokeColor: '#dc2626', strokeWidth: 2.2, dash: 2,
            name: config.hideCurveLabels ? '(C₂)' : "f'(x) = 3x² - 3",
            withLabel: true, label: { position: 'top', color: '#dc2626', fontWeight: 'bold' }
          });
          board.create('functiongraph', [fIntegral, -6, 6], {
            strokeColor: '#10b981', strokeWidth: 2.2, dash: 3,
            name: config.hideCurveLabels ? '(C₃)' : 'F(x) = ∫f(x)dx',
            withLabel: true, label: { position: 'top', color: '#10b981', fontWeight: 'bold' }
          });
        }
        // Mode: Ứng dụng tích phân diện tích hình phẳng
        else if (examMode === 'area_integral') {
          const f1 = compileMathFunction(config.integralUpper || '4 - x^2') || ((x) => 4 - x ** 2);
          const f2 = compileMathFunction(config.integralLower || 'x + 2') || ((x) => x + 2);

          board.create('functiongraph', [f1, -6, 6], {
            strokeColor: '#2563eb', strokeWidth: 2.5,
            name: `f₁(x) = ${config.integralUpper || '4 - x²'}`,
            withLabel: true, label: { position: 'top', color: '#2563eb', fontWeight: 'bold', fontSize: 11 }
          });
          board.create('functiongraph', [f2, -6, 6], {
            strokeColor: '#f97316', strokeWidth: 2.5,
            name: `f₂(x) = ${config.integralLower || 'x + 2'}`,
            withLabel: true, label: { position: 'top', color: '#f97316', fontWeight: 'bold', fontSize: 11 }
          });

          // Integral Area Shading
          const intersectX = [];
          let prevDiff = f1(-5) - f2(-5);
          for (let x = -5; x <= 5; x += 0.05) {
            const currDiff = f1(x) - f2(x);
            if (!isNaN(prevDiff) && !isNaN(currDiff) && prevDiff * currDiff <= 0) {
              intersectX.push(x - 0.025);
            }
            prevDiff = currDiff;
          }

          if (intersectX.length >= 2) {
            const start = Math.min(intersectX[0], intersectX[1]);
            const end = Math.max(intersectX[0], intersectX[1]);
            const steps = 60;
            const dx = (end - start) / steps;
            const polyPoints = [];
            for (let x = start; x <= end; x += dx) polyPoints.push([x, f1(x)]);
            for (let x = end; x >= start; x -= dx) polyPoints.push([x, f2(x)]);

            const jxgPts = polyPoints.map(pt => board.create('point', pt, { visible: false }));
            board.create('polygon', jxgPts, {
              fillColor: '#818cf8', fillOpacity: 0.35, borders: { visible: false }
            });
          }
        }
        // Mode Standard / Absolute / Intersection / Derivative
        else {
          let baseFn = null;
          if (config.type === 'custom' || config.customExpr) {
            baseFn = compileMathFunction(config.customExpr) || ((x) => x ** 3 - 3 * x + 1);
          } else {
            const { a = 1, b = 0, c = -3, d = 1, e = 1 } = config.params || {};
            if (config.type === 'quartic') {
              baseFn = (x) => a * (x ** 4) + b * (x ** 2) + c;
            } else if (config.type === 'rational') {
              baseFn = (x) => {
                if (Math.abs(c * x + d) < 0.001) return NaN;
                return (a * x + b) / (c * x + d);
              };
            } else if (config.type === 'rational_21') {
              baseFn = (x) => {
                if (Math.abs(d * x + e) < 0.001) return NaN;
                return (a * (x ** 2) + b * x + c) / (d * x + e);
              };
            } else if (config.type === 'quadratic') {
              baseFn = (x) => a * (x ** 2) + b * x + c;
            } else {
              // cubic
              baseFn = (x) => a * (x ** 3) + b * (x ** 2) + c * x + d;
            }
          }

          // Absolute value transformation
          let finalFn = baseFn;
          const shiftM = config.shiftM || 0;
          if (config.absTransform === 'abs_total') {
            finalFn = (x) => Math.abs(baseFn(x));
          } else if (config.absTransform === 'abs_x') {
            finalFn = (x) => baseFn(Math.abs(x));
          } else if (config.absTransform === 'abs_both') {
            finalFn = (x) => Math.abs(baseFn(Math.abs(x)));
          } else if (config.absTransform === 'abs_shifted') {
            finalFn = (x) => Math.abs(baseFn(x) + shiftM);
          }

          const isRational = config.type === 'rational' || config.type === 'rational_21';
          const isCleanFormula = config.formula &&
            config.formula.length < 35 &&
            !config.formula.includes('[') &&
            !config.formula.includes('bảng') &&
            !/^[fghuvy]\s*\(/i.test(config.formula.replace(/^y\s*=\s*/i, ''));
          const graphLabel = isCleanFormula
            ? (config.formula.startsWith('y =') || config.formula.startsWith('y=') ? config.formula : `y = ${config.formula}`)
            : 'y = f(x)';

          board.create('functiongraph', [finalFn, -6.5, 6.5], {
            strokeColor: '#2563eb',
            strokeWidth: 2.6,
            discontinuous: isRational,
            name: graphLabel.length < 25 ? graphLabel : 'y = f(x)',
            withLabel: Boolean(isCleanFormula),
            label: { position: 'top', color: '#1e40af', fontWeight: 'bold', fontSize: 11 }
          });

          // Vẽ đường tiệm cận đứng và tiệm cận ngang cho hàm phân thức bậc 1/1
          if (config.type === 'rational') {
            const { a = 1, b = 0, c = 1, d = -1 } = config.params || {};
            if (c !== 0) {
              const xAsymp = -d / c;
              const yAsymp = a / c;
              // Tiệm cận đứng x = -d/c
              const p1 = board.create('point', [xAsymp, -6.5], { visible: false });
              const p2 = board.create('point', [xAsymp, 6.5], { visible: false });
              board.create('line', [p1, p2], {
                strokeColor: '#94a3b8',
                strokeWidth: 1.5,
                dash: 2,
                name: `TCĐ: x = ${Number.isInteger(xAsymp) ? xAsymp : xAsymp.toFixed(2)}`,
                withLabel: true,
                label: { position: 'top', color: '#64748b', fontSize: 10, fontWeight: 'bold' }
              });

              // Tiệm cận ngang y = a/c
              const h1 = board.create('point', [-6.5, yAsymp], { visible: false });
              const h2 = board.create('point', [6.5, yAsymp], { visible: false });
              board.create('line', [h1, h2], {
                strokeColor: '#94a3b8',
                strokeWidth: 1.5,
                dash: 2,
                name: `TCN: y = ${Number.isInteger(yAsymp) ? yAsymp : yAsymp.toFixed(2)}`,
                withLabel: true,
                label: { position: 'right', color: '#64748b', fontSize: 10, fontWeight: 'bold' }
              });

              // Tâm đối xứng I(xAsymp, yAsymp)
              board.create('point', [xAsymp, yAsymp], {
                name: 'I',
                size: 2.5,
                color: '#6366f1',
                fixed: true,
                label: { position: 'top-left', color: '#4f46e5', fontWeight: 'bold', fontSize: 11 }
              });
            }
          }
          // Tiệm cận đứng và tiệm cận xiên cho hàm phân thức bậc 2/1
          else if (config.type === 'rational_21') {
            const { a = 1, b = 0, c = 0, d = 1, e = -1 } = config.params || {};
            if (d !== 0) {
              const xAsymp = -e / d;
              // Tiệm cận đứng x = -e/d
              const p1 = board.create('point', [xAsymp, -6.5], { visible: false });
              const p2 = board.create('point', [xAsymp, 6.5], { visible: false });
              board.create('line', [p1, p2], {
                strokeColor: '#94a3b8',
                strokeWidth: 1.5,
                dash: 2,
                name: `TCĐ: x = ${Number.isInteger(xAsymp) ? xAsymp : xAsymp.toFixed(2)}`,
                withLabel: true,
                label: { position: 'top', color: '#64748b', fontSize: 10, fontWeight: 'bold' }
              });

              // Tiệm cận xiên y = (a/d)*x + (b*d - a*e)/(d^2)
              const slope = a / d;
              const intercept = (b * d - a * e) / (d ** 2);
              const slantFn = (x) => slope * x + intercept;
              board.create('functiongraph', [slantFn, -6.5, 6.5], {
                strokeColor: '#94a3b8',
                strokeWidth: 1.5,
                dash: 2,
                name: `TCX`,
                withLabel: true,
                label: { position: 'top', color: '#64748b', fontSize: 10, fontWeight: 'bold' }
              });
            }
          }

          // Biện luận giao điểm y = slopeM * x + paramM
          if (examMode === 'intersection' || config.slopeM !== 0 || config.paramM !== 1) {
            const lineFn = (x) => config.slopeM * x + config.paramM;
            board.create('functiongraph', [lineFn, -6.5, 6.5], {
              strokeColor: '#ef4444',
              strokeWidth: 2.2,
              dash: 2,
              name: `d: y = ${config.slopeM !== 0 ? `${config.slopeM}x + ` : ''}${config.paramM}`,
              withLabel: true,
              label: { position: 'top', color: '#dc2626', fontWeight: 'bold', fontSize: 11 }
            });
          }

          // Đường cong phụ / Đạo hàm
          if (examMode === 'derivative' && config.auxExpr) {
            const auxFn = compileMathFunction(config.auxExpr);
            if (auxFn) {
              board.create('functiongraph', [auxFn, -6.5, 6.5], {
                strokeColor: '#f59e0b',
                strokeWidth: 2,
                dash: 3,
                name: `h(x) = ${config.auxExpr}`,
                withLabel: true,
                label: { position: 'top', color: '#b45309', fontWeight: 'bold', fontSize: 11 }
              });
            }
          }
        }

        boardRef.current = board;
      }

      setBoardReady(true);
      setRenderError(null);
    } catch (err) {
      console.error('InteractiveMathRenderer mounting error:', err);
      setRenderError(err.message || 'Không thể khởi tạo mô hình toán học.');
    }

    return () => {
      if (boardRef.current) {
        try {
          JXG.JSXGraph.freeBoard(boardRef.current);
        } catch (e) {
          console.warn('Board free on unmount:', e);
        }
        boardRef.current = null;
        view3dRef.current = null;
        axesElementsRef.current = [];
      }
    };
  }, [config, is3D, interactive, boardId]);

  // Controls Handlers
  const handleToggleAxes = () => {
    const next = !showAxes;
    setShowAxes(next);
    if (axesElementsRef.current.length > 0 && boardRef.current) {
      try {
        axesElementsRef.current.forEach(el => {
          if (el) {
            if (typeof el.setAttribute === 'function') {
              el.setAttribute({ visible: next });
            }
            if (el.element2D && typeof el.element2D.setAttribute === 'function') {
              el.element2D.setAttribute({ visible: next });
            }
          }
        });
        boardRef.current.update();
      } catch (e) {
        console.warn('Toggle axes error:', e);
      }
    }
  };

  const handleResetView = () => {
    if (!view3dRef.current) return;
    try {
      view3dRef.current.az = config?.azimuth || 0.85;
      view3dRef.current.el = config?.elevation || 0.35;
      boardRef.current?.update();
    } catch (e) {
      console.warn('Reset view error:', e);
    }
  };

  const handleZoomIn = () => {
    if (!boardRef.current) return;
    try {
      boardRef.current.zoomIn();
    } catch (e) {
      console.warn('Zoom in error:', e);
    }
  };

  const handleZoomOut = () => {
    if (!boardRef.current) return;
    try {
      boardRef.current.zoomOut();
    } catch (e) {
      console.warn('Zoom out error:', e);
    }
  };

  if (!config) {
    return (
      <div className="p-3 my-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Thẻ đồ thị toán học không đúng định dạng.</span>
      </div>
    );
  }

  return (
    <div
      className={`my-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden text-slate-800 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl bg-white/95 backdrop-blur-md' : 'relative'
      } ${className}`}
    >
      {/* ========================================================= */}
      {/* HEADER BAR: TITLE, FORMULA, BADGES & INTERACTION CONTROLS */}
      {/* ========================================================= */}
      <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              is3D
                ? 'bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-xs'
                : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs'
            }`}
          >
            {is3D ? <Box className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-slate-800 text-xs tracking-tight">
              {config.title && config.title.length < 50 && !config.title.includes('[') && !config.title.includes('bảng')
                ? config.title
                : (is3D ? 'Mô hình Không gian 3D' : 'Đồ thị Hàm số 2D')}
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                is3D
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                  : 'bg-blue-50 text-blue-700 border border-blue-200/70'
              }`}
            >
              {is3D ? '3D Trackball 360°' : 'Oxy Tương Tác'}
            </span>

            {config.formula && config.formula.length < 35 && !config.formula.includes('[') && !config.formula.includes('bảng') && !/^[fghuvy]\s*\(/i.test(config.formula.replace(/^y\s*=\s*/i, '')) && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 text-[11px] font-bold shadow-2xs">
                <span dangerouslySetInnerHTML={{ __html: renderMath(config.formula) }} />
              </span>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        {showControls && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(rawTag || config)}
                title="Chỉnh sửa mô hình trong MathLab Workbench"
                className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs flex items-center gap-1 text-[10px] font-bold"
              >
                <Edit2 className="w-3 h-3 text-indigo-600" />
                <span>Chỉnh sửa</span>
              </button>
            )}

            {is3D && (
              <>
                <button
                  type="button"
                  onClick={handleToggleAxes}
                  title={showAxes ? 'Ẩn hệ trục tọa độ Oxyz' : 'Hiện hệ trục tọa độ Oxyz'}
                  className={`p-1.5 rounded-lg border transition-all shadow-2xs flex items-center gap-1.5 text-[10px] font-bold cursor-pointer ${
                    showAxes
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'
                  }`}
                >
                  <Compass className={`w-3 h-3 ${showAxes ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="hidden sm:inline">{showAxes ? 'Đang bật Oxyz' : 'Trục Oxyz'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Đặt lại góc nhìn chuẩn"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-2xs flex items-center gap-1 text-[10px] font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Góc nhìn</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleZoomIn}
              title="Phóng to"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-2xs"
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              title="Thu nhỏ"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-2xs"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            {allowExpand && (
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-2xs"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* CANVAS CONTAINER FOR JSXGRAPH */}
      {/* ========================================================= */}
      <div
        className={`relative w-full flex-1 overflow-hidden select-none ${
          is3D ? 'bg-grid-notebook' : 'bg-slate-50/50'
        }`}
        style={{ minHeight: isFullscreen ? 'auto' : `${height}px`, height: isFullscreen ? '100%' : `${height}px` }}
      >
        <div
          ref={containerRef}
          id={boardId}
          className={`w-full h-full jxgbox ${is3D ? 'jxgbox-3d-grid' : ''}`}
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        />

        {/* Dynamic Help Overlay Pill */}
        <div className="absolute bottom-2 left-2 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-semibold shadow-md opacity-80 hover:opacity-100 transition-opacity">
          {is3D ? (
            <>
              <Compass className="w-3 h-3 text-rose-400 animate-spin-slow" />
              <span>Kéo chuột xoay không gian 360° • Cuộn chuột thu phóng</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Rê chuột kiểm tra tọa độ • Cuộn chuột thu phóng</span>
            </>
          )}
        </div>

        {renderError && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 text-center max-w-sm">
              <p className="font-bold">Lỗi khởi tạo đồ thị</p>
              <p className="text-[11px] text-rose-600">{renderError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
