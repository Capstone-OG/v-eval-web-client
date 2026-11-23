import React, { useMemo } from 'react';
import { Box, Shapes, Activity, Compass } from 'lucide-react';

/**
 * Deterministic, zero-hallucination Visual Scratchpad detector for Math & Physics oscillation topics.
 * Opens the right-edge StudentBookmarkDrawer pre-switched to the closest canonical 3D/2D/Graph/UnitCircle tool.
 */
export function detectMathScratchpadTarget(text = '', subjectHint = '') {
  const s = `${subjectHint || ''} ${text || ''}`.toLowerCase();
  if (!s.trim()) return null;

  const isNonStemText =
    (s.includes('ngữ văn') || s.includes('lịch sử') || s.includes('địa lí') || s.includes('địa lý') || s.includes('tiếng anh') || s.includes('sinh học')) &&
    !s.includes('toán');
  if (isNonStemText) return null;

  // 1. 3D Spatial Geometry
  if (s.includes('mặt cầu') || s.includes('hình cầu') || s.includes('khối cầu')) {
    return { simMode: 'math3d', shape3D: 'sphere_plane', label: 'Mở nháp 3D · Mặt cầu', icon: Box };
  }
  if (s.includes('hình trụ') || s.includes('khối trụ')) {
    return { simMode: 'math3d', shape3D: 'cylinder', label: 'Mở nháp 3D · Hình trụ', icon: Box };
  }
  if (s.includes('hình nón') || s.includes('khối nón')) {
    return { simMode: 'math3d', shape3D: 'solid_revolution', label: 'Mở nháp 3D · Hình nón', icon: Box };
  }
  if (s.includes('lập phương') || s.includes('hình hộp')) {
    return { simMode: 'math3d', shape3D: 'box_cube', label: 'Mở nháp 3D · Hình hộp', icon: Box };
  }
  if (s.includes('lăng trụ')) {
    return { simMode: 'math3d', shape3D: 'prism_tri', label: 'Mở nháp 3D · Lăng trụ', icon: Box };
  }
  if (s.includes('tứ diện')) {
    return { simMode: 'math3d', shape3D: 'tetrahedron', label: 'Mở nháp 3D · Tứ diện', icon: Box };
  }
  if (s.includes('chóp tam giác đều')) {
    return { simMode: 'math3d', shape3D: 'pyramid_regular_tri', label: 'Mở nháp 3D · Chóp tam giác đều', icon: Box };
  }
  if (s.includes('chóp tứ giác đều') || s.includes('hình chóp đều')) {
    return { simMode: 'math3d', shape3D: 'pyramid_regular_quad', label: 'Mở nháp 3D · Chóp đều', icon: Box };
  }
  if (s.includes('s.abc') && !s.includes('s.abcd')) {
    return { simMode: 'math3d', shape3D: 'pyramid_tri_sa', label: 'Mở nháp 3D · Chóp S.ABC', icon: Box };
  }
  if (s.includes('hình chóp') || s.includes('khối chóp') || s.includes('s.abcd') || s.includes('oxyz') || s.includes('không gian')) {
    return { simMode: 'math3d', shape3D: 'pyramid_rect_sa', label: 'Mở nháp 3D · Hình chóp', icon: Box };
  }

  // 2. Unit Circle / Trigonometry / Harmonic Oscillation
  if (
    s.includes('lượng giác') ||
    s.includes('dao động điều hòa') ||
    s.includes('pha ban đầu') ||
    /\\(sin|cos|tan)\b|\b(sin|cos)\s*\(/i.test(s)
  ) {
    return { simMode: 'unit_circle', label: 'Mở Vòng tròn lượng giác', icon: Compass };
  }

  // 3. 2D Plane Geometry
  if (s.includes('tiếp tuyến') && s.includes('đường tròn')) {
    return { simMode: 'math2d', shape2D: 'circle_tangent', label: 'Mở nháp 2D · Tiếp tuyến', icon: Shapes };
  }
  if (s.includes('tứ giác nội tiếp')) {
    return { simMode: 'math2d', shape2D: 'quadrilateral_cyclic', label: 'Mở nháp 2D · Tứ giác nội tiếp', icon: Shapes };
  }
  if (s.includes('hình bình hành') || s.includes('hình thoi')) {
    return { simMode: 'math2d', shape2D: 'parallelogram_rhombus', label: 'Mở nháp 2D · Hình bình hành', icon: Shapes };
  }
  if (s.includes('hình thang vuông')) {
    return { simMode: 'math2d', shape2D: 'trapezoid_right', label: 'Mở nháp 2D · Hình thang vuông', icon: Shapes };
  }
  if (s.includes('tam giác vuông')) {
    return { simMode: 'math2d', shape2D: 'right_triangle', label: 'Mở nháp 2D · Tam giác vuông', icon: Shapes };
  }
  if (s.includes('tam giác') && (s.includes('trực tâm') || s.includes('trọng tâm') || s.includes('ngoại tiếp') || s.includes('hệ thức lượng'))) {
    return { simMode: 'math2d', shape2D: 'acute_triangle', label: 'Mở nháp 2D · Tam giác', icon: Shapes };
  }

  // 4. Function Graph
  if (s.includes('đồ thị') || s.includes('tiệm cận') || s.includes('cực trị') || s.includes('parabol') || s.includes('hàm số bậc')) {
    let graphPreset = 'cubic';
    if (s.includes('trùng phương') || s.includes('x^4')) graphPreset = 'quartic';
    else if (s.includes('tiệm cận') || s.includes('phân thức')) graphPreset = 'rational11';
    else if (s.includes('parabol') || s.includes('bậc hai')) graphPreset = 'quadratic';
    else if (s.includes('lôgarit') || s.includes('logarit') || s.includes('ln(')) graphPreset = 'ln';
    else if (s.includes('hàm số mũ') || s.includes('e^x')) graphPreset = 'exp';
    return { simMode: 'graph', graphPreset, label: 'Mở nháp Đồ thị hàm số', icon: Activity };
  }

  return null;
}

export default function MathScratchpadButton({ text = '', subjectHint = '', className = '' }) {
  const target = useMemo(() => detectMathScratchpadTarget(text, subjectHint), [text, subjectHint]);
  if (!target) return null;

  const Icon = target.icon;

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('veval:open-math-scratchpad', { detail: target }));
      }}
      title="Mở bảng nháp mô phỏng tương tác tham khảo trong Sổ tra cứu"
      className={`inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors cursor-pointer shrink-0 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{target.label}</span>
    </button>
  );
}
