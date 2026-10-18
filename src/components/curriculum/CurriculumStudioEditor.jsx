import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Columns, 
  Sparkles, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Compass, 
  FileText, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  Sliders,
  AlertCircle,
  FolderOpen,
  PenTool,
  Code2,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  FileEdit,
  Calculator,
  FlaskConical
} from 'lucide-react';
import MathText, { unescapeLiteralNewlines } from '../common/MathText';
import InteractiveFormulaBuilderModal from './InteractiveFormulaBuilderModal';
import WordStyleFormulaCanvas from './WordStyleFormulaCanvas';
import HierarchicalMathPalette from './HierarchicalMathPalette';
import contentService from '../../services/contentService';
import aiService from '../../services/aiService';

export const MATH_CATEGORIES = {
  algebra: {
    name: 'Đại số & Căn thức',
    icon: '🔢',
    items: [
      { label: 'Phân số a/b (Điền số)', code: '\\frac{a}{b}', templateId: 'fraction', isFillable: true },
      { label: 'Căn bậc 2 (Điền số)', code: '\\sqrt{x}', templateId: 'sqrt', isFillable: true },
      { label: 'Căn bậc n (Điền số)', code: '\\sqrt[n]{x}', templateId: 'sqrt', isFillable: true },
      { label: 'Lũy thừa x^n (Điền số)', code: 'x^n', templateId: 'power', isFillable: true },
      { label: 'Chỉ số dưới x_0', code: 'x_0', templateId: 'power', isFillable: true },
      { label: 'Trị tuyệt đối |x|', code: '|x|' },
      { label: 'Cộng trừ \\pm', code: '\\pm' },
      { label: 'Trừ cộng \\mp', code: '\\mp' },
      { label: 'Gần bằng \\approx', code: '\\approx' },
      { label: 'Khác \\neq', code: '\\neq' },
      { label: 'Lớn hơn bằng \\ge', code: '\\ge' },
      { label: 'Nhỏ hơn bằng \\le', code: '\\le' },
      { label: 'Vô cực \\infty', code: '\\infty' },
      { label: 'Nhân dấu chấm', code: '\\cdot' }
    ]
  },
  calculus_diff: {
    name: 'Đạo hàm & Biến thiên',
    icon: '📈',
    items: [
      { label: '📊 Bảng biến thiên SGK (Điền số)', code: 'Bảng biến thiên', templateId: 'variation_table', isFillable: true },
      { label: '📈 Đồ thị hàm số (Oxy/Desmos)', code: 'Đồ thị Oxy', templateId: 'math_graph', isFillable: true },
      { label: 'Đạo hàm f\'(x)', code: "f'(x)" },
      { label: 'Đạo hàm cấp 2 f\'\'(x)', code: "f''(x)" },
      { label: 'Đạo hàm tại x0', code: "f'(x_0)" },
      { label: 'dy/dx', code: '\\frac{dy}{dx}', templateId: 'fraction', isFillable: true },
      { label: 'Điểm cực đại', code: 'x_{CĐ}' },
      { label: 'Điểm cực tiểu', code: 'x_{CT}' },
      { label: 'Giá trị cực đại', code: 'y_{CĐ}' },
      { label: 'Giá trị cực tiểu', code: 'y_{CT}' },
      { label: 'Max hàm số', code: '\\max_{[a;b]} f(x)' },
      { label: 'Min hàm số', code: '\\min_{[a;b]} f(x)' },
      { label: 'Biệt thức Delta', code: '\\Delta = b^2 - 4ac' },
      { label: 'Delta phẩy', code: "\\Delta' = b'^2 - ac" },
      { label: 'Đạo hàm phân số u/v', code: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}" },
      { label: 'Đạo hàm tích u.v', code: "(uv)' = u'v + uv'" }
    ]
  },
  calculus_int: {
    name: 'Tích phân & Giới hạn',
    icon: '📉',
    items: [
      { label: 'Tích phân cận a đến b (Điền số)', code: '\\int_{a}^{b} f(x)dx', templateId: 'integral', isFillable: true },
      { label: 'Giới hạn x dần tới x0 (Điền số)', code: '\\lim_{x \\to x_0} f(x)', templateId: 'limit', isFillable: true },
      { label: 'Nguyên hàm f(x)dx', code: '\\int f(x)dx' },
      { label: 'Giới hạn tại +vô cực', code: '\\lim_{x \\to +\\infty} f(x)', templateId: 'limit', isFillable: true },
      { label: 'Giới hạn tại -vô cực', code: '\\lim_{x \\to -\\infty} f(x)', templateId: 'limit', isFillable: true },
      { label: 'Tổng xích-ma', code: '\\sum_{i=1}^{n} a_i' },
      { label: 'Tích Pi', code: '\\prod_{i=1}^{n} a_i' },
      { label: 'Tích phân từng phần', code: '\\int u dv = uv - \\int v du' },
      { label: 'Diện tích hình phẳng', code: 'S = \\int_{a}^{b} |f(x) - g(x)| dx' },
      { label: 'Thể tích tròn xoay', code: 'V = \\pi \\int_{a}^{b} [f(x)]^2 dx' }
    ]
  },
  exponent_log: {
    name: 'Mũ & Logarit',
    icon: '⚡',
    items: [
      { label: 'Logarit cơ số a của b', code: '\\log_a b' },
      { label: 'Logarit tự nhiên ln(x)', code: '\\ln x' },
      { label: 'Logarit thập phân log(x)', code: '\\log x' },
      { label: 'Hàm số e^x', code: 'e^x' },
      { label: 'Hàm số a^x', code: 'a^x' },
      { label: 'Logarit cơ số 2', code: '\\log_2 x' },
      { label: 'Đạo hàm ln(x)', code: "(\\ln x)' = \\frac{1}{x}" },
      { label: 'Đạo hàm a^x', code: "(a^x)' = a^x \\ln a" },
      { label: 'Đổi cơ số log', code: '\\log_a b = \\frac{\\ln b}{\\ln a}' },
      { label: 'Công thức log tích', code: '\\log_a (xy) = \\log_a x + \\log_a y' }
    ]
  },
  trigonometry: {
    name: 'Lượng giác',
    icon: '📐',
    items: [
      { label: 'sin(x)', code: '\\sin x' },
      { label: 'cos(x)', code: '\\cos x' },
      { label: 'tan(x)', code: '\\tan x' },
      { label: 'cot(x)', code: '\\cot x' },
      { label: 'sin^2 + cos^2 = 1', code: '\\sin^2 x + \\cos^2 x = 1' },
      { label: 'sin 2x', code: '\\sin 2x = 2\\sin x \\cos x' },
      { label: 'cos 2x', code: '\\cos 2x = \\cos^2 x - \\sin^2 x' },
      { label: 'Số Pi', code: '\\pi' },
      { label: 'Pi / 2', code: '\\frac{\\pi}{2}' },
      { label: 'Pi / 4', code: '\\frac{\\pi}{4}' },
      { label: 'arcsin(x)', code: '\\arcsin x' },
      { label: 'arccos(x)', code: '\\arccos x' }
    ]
  },
  geometry_oxyz: {
    name: 'Hình học & Oxyz',
    icon: '🌐',
    items: [
      { label: 'Vector a', code: '\\vec{a}' },
      { label: 'Vector AB', code: '\\vec{AB}' },
      { label: 'Độ dài vector', code: '|\\vec{a}|' },
      { label: 'Tích vô hướng', code: '\\vec{u} \\cdot \\vec{v}' },
      { label: 'Tích có hướng', code: '[\\vec{u}, \\vec{v}]' },
      { label: 'Vector pháp tuyến n=(A;B;C)', code: '\\vec{n} = (A; B; C)' },
      { label: 'Vector chỉ phương u=(a;b;c)', code: '\\vec{u} = (a; b; c)' },
      { label: 'Vuông góc', code: '\\perp' },
      { label: 'Song song', code: '\\parallel' },
      { label: 'Góc', code: '\\angle ABC' },
      { label: 'Khoảng cách từ điểm tới mp', code: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}' },
      { label: 'Mặt phẳng Alpha', code: '(\\alpha)' },
      { label: 'Mặt phẳng Beta', code: '(\\beta)' },
      { label: 'Mặt cầu (S)', code: '(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2' }
    ]
  },
  systems_brackets: {
    name: 'Hệ PT & Dấu ngoặc',
    icon: '🧱',
    items: [
      { label: 'Hệ 2 phương trình (Điền số)', code: '\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}', templateId: 'system', isFillable: true },
      { label: 'Hệ 3 phương trình', code: '\\begin{cases} a_1 x + b_1 y + c_1 z = d_1 \\\\ a_2 x + b_2 y + c_2 z = d_2 \\\\ a_3 x + b_3 y + c_3 z = d_3 \\end{cases}' },
      { label: 'Dấu ngoặc vuông hoặc', code: '\\begin{bmatrix} x = a \\\\ x = b \\end{bmatrix}' },
      { label: 'Ngoặc tròn lớn \\left( ... \\right)', code: '\\left( \\frac{a}{b} \\right)' },
      { label: 'Ngoặc vuông lớn \\left[ ... \\right]', code: '\\left[ a; b \\right]' },
      { label: 'Khoảng (a; b)', code: '(a; b)' },
      { label: 'Đoạn [a; b]', code: '[a; b]' },
      { label: 'Nửa khoảng [a; b)', code: '[a; b)' },
      { label: 'Tập hợp { x | ... }', code: '\\{ x \\in \\mathbb{R} \\mid P(x) \\}' }
    ]
  },
  sets_logic: {
    name: 'Tập hợp & Logic',
    icon: '🧩',
    items: [
      { label: 'Suy ra =>', code: '\\Rightarrow' },
      { label: 'Tương đương <=>', code: '\\Leftrightarrow' },
      { label: 'Với mọi \\forall', code: '\\forall x \\in D' },
      { label: 'Tồn tại \\exists', code: '\\exists x' },
      { label: 'Thuộc \\in', code: '\\in' },
      { label: 'Không thuộc \\notin', code: '\\notin' },
      { label: 'Tập rỗng \\emptyset', code: '\\emptyset' },
      { label: 'Tập số thực R', code: '\\mathbb{R}' },
      { label: 'Tập số tự nhiên N', code: '\\mathbb{N}' },
      { label: 'Tập số nguyên Z', code: '\\mathbb{Z}' },
      { label: 'Tập số hữu tỉ Q', code: '\\mathbb{Q}' },
      { label: 'Tập con \\subset', code: '\\subset' },
      { label: 'Hợp \\cup', code: '\\cup' },
      { label: 'Giao \\cap', code: '\\cap' },
      { label: 'Hiệu \\setminus', code: '\\setminus' }
    ]
  },
  greek_letters: {
    name: 'Ký tự Hy Lạp',
    icon: '🔤',
    items: [
      { label: 'alpha', code: '\\alpha' },
      { label: 'beta', code: '\\beta' },
      { label: 'gamma', code: '\\gamma' },
      { label: 'delta nhỏ', code: '\\delta' },
      { label: 'Delta lớn', code: '\\Delta' },
      { label: 'epsilon', code: '\\epsilon' },
      { label: 'theta', code: '\\theta' },
      { label: 'lambda', code: '\\lambda' },
      { label: 'mu', code: '\\mu' },
      { label: 'pi', code: '\\pi' },
      { label: 'rho', code: '\\rho' },
      { label: 'sigma nhỏ', code: '\\sigma' },
      { label: 'Sigma lớn', code: '\\Sigma' },
      { label: 'tau', code: '\\tau' },
      { label: 'phi', code: '\\phi' },
      { label: 'omega', code: '\\omega' },
      { label: 'Omega lớn', code: '\\Omega' }
    ]
  },
  probability_stats: {
    name: 'Xác suất & Thống kê',
    icon: '🎲',
    items: [
      { label: 'Tổ hợp C(n, k)', code: 'C_n^k = \\frac{n!}{k!(n-k)!}' },
      { label: 'Chỉnh hợp A(n, k)', code: 'A_n^k = \\frac{n!}{(n-k)!}' },
      { label: 'Hoán vị P_n', code: 'P_n = n!' },
      { label: 'Xác suất biến cố P(A)', code: 'P(A) = \\frac{n(A)}{n(\\Omega)}' },
      { label: 'Biến cố đối P(A ngang)', code: 'P(\\bar{A}) = 1 - P(A)' },
      { label: 'Xác suất có điều kiện', code: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}' },
      { label: 'Công thức Bernoulli', code: 'P_n(k) = C_n^k p^k (1-p)^{n-k}' },
      { label: 'Kỳ vọng E(X)', code: 'E(X) = \\sum x_i p_i' },
      { label: 'Phương sai V(X)', code: 'V(X) = E(X^2) - [E(X)]^2' },
      { label: 'Độ lệch chuẩn', code: '\\sigma = \\sqrt{V(X)}' },
      { label: 'Số trung bình X ngang', code: '\\bar{X}' }
    ]
  }
};

/**
 * Helper to determine whether a domain is STEM/Math (using Casio) vs Literature/Social (no Casio)
 */
export function isMathOrStemDomain(domain) {
  if (!domain) return false;
  const name = typeof domain === 'string' ? domain : (domain.title || domain.name || domain.domainName || domain.domainCode || '');
  const lower = name.toLowerCase();
  if (
    lower.includes('văn') ||
    lower.includes('ngữ') ||
    lower.includes('tiếng việt') ||
    lower.includes('ngoại ngữ') ||
    lower.includes('tiếng anh') ||
    lower.includes('english') ||
    lower.includes('sử') ||
    lower.includes('địa') ||
    lower.includes('lịch sử') ||
    lower.includes('địa lí') ||
    lower.includes('địa lý') ||
    lower.includes('triết') ||
    lower.includes('xã hội') ||
    lower.includes('định tính')
  ) {
    return false;
  }
  if (
    lower.includes('toán') ||
    lower.includes('math') ||
    lower.includes('lý') ||
    lower.includes('lí') ||
    lower.includes('physics') ||
    lower.includes('hóa') ||
    lower.includes('chem') ||
    lower.includes('sinh') ||
    lower.includes('bio') ||
    lower.includes('định lượng')
  ) {
    return true;
  }
  return false;
}

export function parseTheoryRecapSections(rawTheory) {
  if (!rawTheory) return { theory: '', example: '' };
  let theory = unescapeLiteralNewlines(String(rawTheory));
  let example = '';

  const exampleMatch = theory.match(/(?:^|\n)###\s*(?:📌\s*)?(?:Ví dụ minh họa SGK|Ví dụ minh họa|Ví dụ)[^\n]*(?:\r?\n)([\s\S]*)$/i);
  if (exampleMatch) {
    example = exampleMatch[1].trim();
    theory = theory.replace(/(?:^|\n)###\s*(?:📌\s*)?(?:Ví dụ minh họa SGK|Ví dụ minh họa|Ví dụ)[^\n]*(?:\r?\n)[\s\S]*$/i, '').trim();
  }

  return { theory, example };
}

export function parseSolutionMethodSections(rawMethod) {
  if (!rawMethod) return { method: '', sampleProblem: '', traps: '', casio: '' };
  let method = unescapeLiteralNewlines(String(rawMethod));
  let sampleProblem = '';
  let traps = '';
  let casio = '';

  const sampleMatch = method.match(
    /(?:^|\n)###\s*(?:[📝📄]\s*)?(?:Bài toán mẫu áp dụng|Bài toán mẫu|Ví dụ áp dụng|Bài toán minh họa|Đoạn trích \/ Bài mẫu minh họa|Bài mẫu áp dụng phương pháp|Bài mẫu áp dụng|Bài mẫu minh họa|Bài mẫu)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[⚠️💡]|Các bẫy đề thi|Bẫy đề thi|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/i
  );
  if (sampleMatch) {
    sampleProblem = sampleMatch[1].trim();
  }

  const trapsMatch = method.match(
    /(?:^|\n)###\s*(?:⚠️\s*)?(?:Các bẫy đề thi ĐGNL thường gặp|Các bẫy đề thi|Bẫy đề thi thường gặp|Bẫy đề thi|Các bẫy)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[💡📝📄]|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/i
  );
  if (trapsMatch) {
    traps = trapsMatch[1].trim();
  }

  const casioMatch = method.match(
    /(?:^|\n)###\s*(?:💡\s*)?(?:Kỹ thuật Casio & Mẹo tư duy nhanh|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy & Chiến thuật làm bài|Mẹo tư duy|Chiến thuật làm bài|Mẹo làm bài)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[⚠️📝📄]|Các bẫy đề thi|Bẫy đề thi)|$))/i
  );
  if (casioMatch) {
    casio = casioMatch[1].trim();
  }

  method = method
    .replace(/(?:^|\n)###\s*(?:[📝📄]\s*)?(?:Bài toán mẫu áp dụng|Bài toán mẫu|Ví dụ áp dụng|Bài toán minh họa|Đoạn trích \/ Bài mẫu minh họa|Bài mẫu áp dụng phương pháp|Bài mẫu áp dụng|Bài mẫu minh họa|Bài mẫu)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[⚠️💡]|Các bẫy đề thi|Bẫy đề thi|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/gi, '')
    .replace(/(?:^|\n)###\s*(?:⚠️\s*)?(?:Các bẫy đề thi ĐGNL thường gặp|Các bẫy đề thi|Bẫy đề thi thường gặp|Bẫy đề thi|Các bẫy)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[💡📝📄]|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/gi, '')
    .replace(/(?:^|\n)###\s*(?:💡\s*)?(?:Kỹ thuật Casio & Mẹo tư duy nhanh|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy & Chiến thuật làm bài|Mẹo tư duy|Chiến thuật làm bài|Mẹo làm bài)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[⚠️📝📄]|Các bẫy đề thi|Bẫy đề thi)|$))/gi, '')
    .trim();

  return { method, sampleProblem, traps, casio };
}

/**
 * Visual Helpers for Khối 1: Lý Thuyết Nền Tảng SGK
 */
export function parseTheoryRecapVisual(rawText) {
  if (!rawText) return { definition: '', formula: '', rules: [''], imageUrl: '', imageAlt: '' };
  const text = unescapeLiteralNewlines(rawText);

  let imageUrl = '';
  let imageAlt = '';
  const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) {
    imageAlt = imgMatch[1];
    imageUrl = imgMatch[2];
  }
  const cleanText = text.replace(/!\[(.*?)\]\((.*?)\)/g, '').trim();

  let formula = '';
  const formulaMatch = cleanText.match(/\$\$([\s\S]*?)\$\$/);
  let textWithoutFormula = cleanText;
  if (formulaMatch) {
    formula = formulaMatch[1].trim();
    textWithoutFormula = cleanText.replace(/\$\$[\s\S]*?\$\$/g, '').trim();
  }

  const lines = textWithoutFormula.split('\n');
  const defLines = [];
  const rules = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      rules.push(bulletMatch[1].trim());
    } else {
      defLines.push(trimmed);
    }
  });

  return {
    definition: defLines.join('\n'),
    formula,
    rules: rules.length > 0 ? rules : [''],
    imageUrl,
    imageAlt
  };
}

export function buildTheoryRecapMarkdown({ definition, formula, rules, imageUrl, imageAlt }) {
  const parts = [];
  if (definition && definition.trim()) {
    parts.push(definition.trim());
  }
  if (formula && formula.trim()) {
    parts.push(`$$${formula.trim()}$$`);
  }
  if (rules && rules.length > 0) {
    const validRules = rules.filter(r => r && r.trim());
    if (validRules.length > 0) {
      parts.push(validRules.map(r => `- ${r.trim()}`).join('\n'));
    }
  }
  if (imageUrl && imageUrl.trim()) {
    parts.push(`![${imageAlt || 'Hình minh họa'}](${imageUrl.trim()})`);
  }
  return parts.join('\n\n');
}

/**
 * Visual Helpers for Khối 2: Phương Pháp Giải Chi Tiết
 */
export function parseSolutionStepsVisual(rawMethod) {
  if (!rawMethod) return [''];
  const text = unescapeLiteralNewlines(rawMethod);
  const lines = text.split('\n');
  const steps = [];
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const stepMatch = trimmed.match(/^(?:\*\*Bước \d+:?\*\*|Bước \d+:?|\d+[\.\)])\s*(.*)$/i);
    if (stepMatch && stepMatch[1]) {
      steps.push(stepMatch[1].trim());
    } else {
      steps.push(trimmed);
    }
  });
  return steps.length > 0 ? steps : [''];
}

export function buildSolutionStepsMarkdown(steps) {
  const validSteps = steps.filter(s => s && s.trim());
  if (validSteps.length === 0) return '';
  return validSteps.map((s, idx) => `**Bước ${idx + 1}:** ${s.trim()}`).join('\n\n');
}

const SAMPLE_DIAGRAM_IMAGES = [
  { label: 'Đồ thị hàm bậc ba (2 cực trị)', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bảng biến thiên mẫu', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hình chóp tam giác S.ABC', url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hệ trục tọa độ Oxyz', url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=800&q=80' }
];

const getEmbedVideoUrl = (url) => {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

export function MathFormulaPalette({
  activeCategory,
  onSelectCategory,
  onInsert,
  onOpenBuilder,
  activeTarget,
  onSelectTarget,
  accentColor = 'indigo',
  isStem = true
}) {
  const categories = Object.keys(MATH_CATEGORIES);
  const currentCat = MATH_CATEGORIES[activeCategory] || MATH_CATEGORIES.algebra;

  return (
    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Bảng Ký Hiệu KaTeX STEM Chuyên Sâu</span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">10 Chuyên Mục</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBuilder && (
            <button
              type="button"
              onClick={() => onOpenBuilder('fraction', activeTarget)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-[11px] font-black shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ Mở Trình Điền Công Thức (Click-to-Fill)</span>
            </button>
          )}

          {/* Target Field Pill Selector */}
          {onSelectTarget && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 font-bold">Chèn vào:</span>
              <select
                value={activeTarget}
                onChange={(e) => onSelectTarget(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="theoryRecap">Khối 1: Lý Thuyết SGK</option>
                <option value="solutionMethod">Khối 2: Quy Trình Giải</option>
                <option value="examTraps">Khối 2: Bẫy Đề Thi ĐGNL</option>
                <option value="casioTricks">{isStem ? 'Khối 2: Mẹo Casio' : 'Khối 2: Mẹo tư duy & Chiến thuật'}</option>
                <option value="sampleQuestion">Khối 4: Đề Bài Mẫu</option>
                <option value="sampleExplanation">Khối 4: Lời Giải Mẫu</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-thin">
        {categories.map((catKey) => {
          const cat = MATH_CATEGORIES[catKey];
          const isActive = activeCategory === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(catKey)}
              className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Formula Buttons Grid with Live KaTeX Preview */}
      <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200/70">
        {currentCat.items.map((snip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (snip.templateId && onOpenBuilder) {
                onOpenBuilder(snip.templateId, activeTarget);
              } else {
                onInsert(activeTarget, snip.code);
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg border transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center min-h-[30px] gap-1.5 cursor-pointer ${
              snip.isFillable
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-950 font-bold'
                : 'bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-800 border-slate-200/90'
            }`}
            title={`${snip.label}${snip.isFillable ? ' (Click để mở ô điền tham số)' : ''}`}
          >
            {snip.isFillable && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-200 text-indigo-800 font-black">
                Điền
              </span>
            )}
            <MathText text={`$${snip.code}$`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CurriculumStudioEditor({ pattern, domain, chapter, lesson, onClose, onSaveSuccess }) {
  const isStem = isMathOrStemDomain(domain);

  // View mode: 'editor' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState('split');
  const [activeSection, setActiveSection] = useState('theory'); // 'theory' | 'method' | 'video' | 'questions' | 'settings'
  const [mathCategory, setMathCategory] = useState('algebra');
  const [activeFormulaTarget, setActiveFormulaTarget] = useState('theoryRecap'); // 'theoryRecap' | 'solutionMethod' | 'examTraps' | 'casioTricks' | 'sampleQuestion' | 'sampleExplanation'
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  const parsedInitial = parseSolutionMethodSections(pattern?.solutionMethod || '');

  // Form State for Pattern Content
  const [form, setForm] = useState({
    patternId: pattern?.patternId || '',
    name: pattern?.name || pattern?.patternName || '',
    weight: pattern?.weight ? String(pattern.weight).replace('%', '').trim() : '5',
    level: pattern?.level || pattern?.classification || 'Vận dụng',
    theoryRecap: unescapeLiteralNewlines(pattern?.theoryRecap || ''),
    solutionMethod: unescapeLiteralNewlines(parsedInitial.method),
    examTraps: unescapeLiteralNewlines(pattern?.examTraps || parsedInitial.traps || ''),
    casioTricks: unescapeLiteralNewlines(pattern?.casioTricks || parsedInitial.casio || ''),
    videoUrl: pattern?.videoLesson?.videoUrl || '',
    durationSeconds: pattern?.videoLesson?.durationSeconds || 600,
    videoTimestamps: [
      { time: '00:00', title: 'Giới thiệu & Lý thuyết cốt lõi' },
      { time: '03:15', title: 'Quy trình giải chi tiết từng bước' },
      { time: '07:30', title: 'Ví dụ minh họa & Phân tích bẫy đề thi' }
    ],
    sampleQuestion: {
      questionId: pattern?.sampleQuestion?.questionId || null,
      difficultyLevel: 2,
      contentLatex: pattern?.sampleQuestion?.content || '',
      optionA: pattern?.sampleQuestion?.options?.[0]?.replace(/^A\.\s*/, '') || '',
      optionB: pattern?.sampleQuestion?.options?.[1]?.replace(/^B\.\s*/, '') || '',
      optionC: pattern?.sampleQuestion?.options?.[2]?.replace(/^C\.\s*/, '') || '',
      optionD: pattern?.sampleQuestion?.options?.[3]?.replace(/^D\.\s*/, '') || '',
      correctOption: pattern?.sampleQuestion?.correct !== undefined ? String.fromCharCode(65 + pattern.sampleQuestion.correct) : 'A',
      explanation: pattern?.sampleQuestion?.explanation || ''
    }
  });

  // Dual-mode switcher: 'visual' (Soạn thảo trực tiếp như Word) vs 'markdown' (Mã nguồn LaTeX thuần từ AI)
  const [theoryMode, setTheoryMode] = useState('visual');
  const [methodMode, setMethodMode] = useState('visual');

  // Word Document Canvas View Mode: 'edit' (Soạn thảo trực tiếp tại chỗ) | 'preview' (Xem trang in KaTeX)
  const [theoryCanvasView, setTheoryCanvasView] = useState('edit');
  const [methodCanvasView, setMethodCanvasView] = useState('edit');

  // Submode for Document Canvas: 'wysiwyg' (Ký hiệu thật trực quan & chèn số tính toán) vs 'text' (Gõ văn bản bàn phím)
  const [theorySubMode, setTheorySubMode] = useState('wysiwyg');
  const [methodSubMode, setMethodSubMode] = useState('wysiwyg');

  // Textarea DOM refs for precision cursor insertion
  const textareaRefs = useRef({});

  // Handle Word-like text formatting (Bold, Italic, Headings, Lists, Callouts)
  const handleFormatText = (targetField, prefix = '', suffix = '') => {
    const field = targetField || activeFormulaTarget;
    const el = textareaRefs.current[field];
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value || '';
      const selected = val.slice(start, end);
      const insertText = `${prefix}${selected || ''}${suffix}`;
      const nextVal = val.slice(0, start) + insertText + val.slice(end);

      if (field === 'sampleQuestion') {
        setForm(prev => ({ ...prev, sampleQuestion: { ...prev.sampleQuestion, contentLatex: nextVal } }));
      } else if (field === 'sampleExplanation') {
        setForm(prev => ({ ...prev, sampleQuestion: { ...prev.sampleQuestion, explanation: nextVal } }));
      } else {
        setForm(prev => ({ ...prev, [field]: nextVal }));
      }

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 0));
      }, 0);
    } else {
      setForm(prev => ({ ...prev, [field]: `${prev[field] || ''}${prefix}${suffix}` }));
    }
  };

  // Question Bank State for this Pattern
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [newQuestionModalOpen, setNewQuestionModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageModalTarget, setImageModalTarget] = useState(null); // 'theory' | 'method' | 'question'

  // Interactive Formula Builder Modal State
  const [formulaBuilderOpen, setFormulaBuilderOpen] = useState(false);
  const [formulaBuilderTemplate, setFormulaBuilderTemplate] = useState('fraction');
  const fileInputRef = useRef(null);
  const [uploadTargetField, setUploadTargetField] = useState('theoryRecap');

  // Status & saving
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // AI Knowledge Pattern Reasoning State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiIdentificationResult, setAiIdentificationResult] = useState(null);

  // Open interactive formula builder modal
  const handleOpenFormulaBuilder = (templateId = 'fraction', targetField = null) => {
    if (targetField) setActiveFormulaTarget(targetField);
    setFormulaBuilderTemplate(templateId);
    setFormulaBuilderOpen(true);
  };

  // Universal Clipboard Paste Handler (Ctrl + V Image paste)
  const handlePasteEvent = (e, targetField) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          handleInsertImage(targetField, base64Url, 'Ảnh chụp minh họa đề bài');
          setSaveSuccessMsg('✨ Đã dán thành công ảnh chụp màn hình (Ctrl+V) vào bài giảng!');
          setTimeout(() => setSaveSuccessMsg(''), 4000);
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  // Trigger file upload dialog
  const handleTriggerUpload = (field) => {
    setUploadTargetField(field || activeFormulaTarget);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle uploaded file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      handleInsertImage(uploadTargetField, base64Url, file.name || 'Ảnh minh họa');
      setSaveSuccessMsg('✨ Đã tải ảnh lên bài giảng thành công!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Fetch Questions from Database for this Pattern
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!pattern?.patternId) return;
      setLoadingQuestions(true);
      try {
        const data = await contentService.getQuestionsBySkill(pattern.patternId);
        if (data && Array.isArray(data)) {
          setQuestionsList(data);
        }
      } catch (err) {
        console.warn("Chưa tải được danh sách câu hỏi:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [pattern?.patternId]);

  // Insert math formula at target field (universal across Khối 1, 2, 4 with cursor precision)
  const handleInsertMath = (targetField, snippet, isRaw = false) => {
    const field = targetField || activeFormulaTarget;
    const insertText = isRaw ? snippet : `$${snippet}$`;

    const el = textareaRefs.current[field];
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value || '';
      const nextVal = val.slice(0, start) + insertText + val.slice(end);

      if (field === 'sampleQuestion') {
        setForm(prev => ({
          ...prev,
          sampleQuestion: { ...prev.sampleQuestion, contentLatex: nextVal }
        }));
      } else if (field === 'sampleExplanation') {
        setForm(prev => ({
          ...prev,
          sampleQuestion: { ...prev.sampleQuestion, explanation: nextVal }
        }));
      } else {
        setForm(prev => ({ ...prev, [field]: nextVal }));
      }

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 0);
      return;
    }

    if (field === 'sampleQuestion') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          contentLatex: prev.sampleQuestion.contentLatex ? `${prev.sampleQuestion.contentLatex} ${insertText}` : insertText
        }
      }));
    } else if (field === 'sampleExplanation') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          explanation: prev.sampleQuestion.explanation ? `${prev.sampleQuestion.explanation} ${insertText}` : insertText
        }
      }));
    } else {
      setForm(prev => {
        const current = prev[field] || '';
        return {
          ...prev,
          [field]: current ? `${current} ${insertText}` : insertText
        };
      });
    }
  };

  // Insert image markdown at cursor or end
  const handleInsertImage = (targetField, url, label = 'Hình minh họa') => {
    if (!url) return;
    const field = targetField || activeFormulaTarget || 'theoryRecap';
    const imgMarkdown = `\n\n![${label}](${url})\n\n`;

    const el = textareaRefs.current[field];
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value || '';
      const nextVal = val.slice(0, start) + imgMarkdown + val.slice(end);
      setForm(prev => ({ ...prev, [field]: nextVal }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: `${prev[field] || ''}${imgMarkdown}`
      }));
    }
    setCustomImageUrl('');
    setImageModalTarget(null);
  };

  // AI Tri Thức Nhận Diện & Chuẩn Hóa Dạng Bài Sư Phạm
  const handleAIApplyStandardMethod = async () => {
    setIsAiAnalyzing(true);
    setSaveErrorMsg('');
    try {
      const targetPatternName = form.name?.trim() || pattern?.name || 'Dạng bài toán trọng tâm';
      const result = await aiService.analyzePatternWithAi({
        patternName: targetPatternName,
        lessonName: lesson?.name || '',
        domainName: domain?.title || 'Toán học & Tư duy định lượng'
      });

      if (result) {
        setAiIdentificationResult(result);
        const parsedMethod = parseSolutionMethodSections(result.solution_method || '');
        setForm(prev => ({
          ...prev,
          theoryRecap: prev.theoryRecap?.trim() ? prev.theoryRecap : unescapeLiteralNewlines(result.theory_recap),
          solutionMethod: unescapeLiteralNewlines(parsedMethod.method || result.solution_method),
          examTraps: unescapeLiteralNewlines(result.exam_traps || parsedMethod.traps || prev.examTraps),
          casioTricks: unescapeLiteralNewlines(result.casio_tricks || parsedMethod.casio || prev.casioTricks),
          sampleQuestion: result.sample_question ? {
            questionId: prev.sampleQuestion?.questionId || null,
            difficultyLevel: result.sample_question.difficulty_level || 2,
            contentLatex: result.sample_question.content_latex || '',
            optionA: result.sample_question.option_a || '',
            optionB: result.sample_question.option_b || '',
            optionC: result.sample_question.option_c || '',
            optionD: result.sample_question.option_d || '',
            correctOption: result.sample_question.correct_option || 'A',
            explanation: result.sample_question.explanation || ''
          } : prev.sampleQuestion
        }));
        setSaveSuccessMsg(`AI Tri Thức đã nhận diện thành công: "${result.classification}" (Bloom L${result.bloom_level})`);
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      }
    } catch (err) {
      console.warn("AI pattern analysis fallback:", err);
      // Fallback template adapted to domain
      const standardProcedure = isStem ? `### Quy trình tư duy giải nhanh chuẩn ĐGNL VNU-HCM:
**Bước 1: Tìm tập xác định & Phân tích cấu trúc hàm số**
- Xác định tập xác định $D$ của biểu thức / hàm số.
- Nhận diện các tham số $m$ và điều kiện ràng buộc.

**Bước 2: Tính đạo hàm / Biến đổi đại số tương đương**
- Tính đạo hàm $y' = f'(x)$.
- Giải phương trình $y' = 0$ để tìm các điểm tới hạn $x_1, x_2, ... \\in D$.

**Bước 3: Lập bảng biến thiên hoặc trục số xét dấu**
- Lập bảng biến thiên trên các khoảng xác định.
- Xác định chiều biến thiên, điểm cực đại, cực tiểu hoặc tiệm cận.

**Bước 4: Đối chiếu điều kiện & Kết luận trắc nghiệm**
- Rút ra kết quả thỏa mãn yêu cầu đề bài.
- Loại trừ các phương án nhiễu (bẫy đề thi).` : `### Quy trình xử lý dạng bài & Đọc hiểu/Làm văn:
**Bước 1: Phân tích đề bài & Xác định từ khóa trọng tâm**
- Gạch chân các yêu cầu cốt lõi, phạm vi dẫn chứng, kiểu bài và dung lượng.
- Nhận diện phương thức biểu đạt, thể loại hoặc thao tác lập luận.

**Bước 2: Lập dàn ý & Huy động kiến thức nền**
- Liệt kê các luận điểm, luận cứ chính ra nháp.
- Lựa chọn dẫn chứng tiêu biểu, giàu sức thuyết phục và sát với ngữ cảnh.

**Bước 3: Viết bài/đoạn văn bám sát cấu trúc sư phạm**
- Mở đoạn/bài: Giới thiệu trực tiếp vấn đề nghị luận.
- Thân đoạn/bài: Triển khai các luận điểm chặt chẽ, kết hợp lí lẽ và dẫn chứng.
- Kết đoạn/bài: Khái quát lại vấn đề, liên hệ bài học bản thân.

**Bước 4: Soát lỗi chính tả, diễn đạt & Tiêu chí chấm điểm**
- Kiểm tra lại tính liên kết câu, ngữ pháp và tính mạch lạc của bài viết.`;

      const standardTraps = isStem 
        ? `- Học sinh hay quên kiểm tra điều kiện tập xác định trước khi tính đạo hàm.\n- Nhầm lẫn giữa "giá trị cực trị" ($y_{CT}$) và "điểm cực trị" ($x_{CT}$).\n- Khi xét dấu đạo hàm hàm chứa tham số, quên xét trường hợp hệ số $a = 0$.`
        : `- Diễn xuôi lại ý thơ/văn bản thay vì phân tích nghệ thuật và nội dung tư tưởng.\n- Lạc đề hoặc sa vào kể lể dài dòng, không bám sát yêu cầu từ khóa đề thi.\n- Thiếu dẫn chứng cụ thể hoặc phân tích dẫn chứng còn chung chung, hời hợt.`;

      const standardTips = isStem
        ? `- Dùng tính năng TABLE [Menu 8]: Nhập hàm số, Start: -5, End: 5, Step: 0.5 để quan sát chiều tăng/giảm giá trị $f(x)$.\n- Dùng đạo hàm tại điểm [Shift $\\frac{d}{dx}$] để thử các giá trị nghiệm biên.`
        : `- Kỹ thuật gạch chân từ khóa trong 30 giây đầu tiên để không bỏ sót yêu cầu Tiếng Việt.\n- Phân bổ thời gian hợp lý: 3-5 phút lập dàn ý nhanh ra nháp, 15 phút hành văn súc tích.\n- Mẹo ghi điểm mở rộng: Liên hệ thực tế xã hội thời sự hoặc trải nghiệm cá nhân sâu sắc.`;

      setForm(prev => ({
        ...prev,
        solutionMethod: prev.solutionMethod ? `${prev.solutionMethod}\n\n${standardProcedure}` : standardProcedure,
        examTraps: prev.examTraps || standardTraps,
        casioTricks: prev.casioTricks || standardTips
      }));
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Save all changes to PostgreSQL Database
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    try {
      const rawWeight = parseFloat(form.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.05;

      // Combine step-by-step method with traps & tricks
      let fullSolutionMethod = form.solutionMethod || '';
      if (form.examTraps?.trim()) {
        fullSolutionMethod += `\n\n### ⚠️ Các bẫy đề thi ĐGNL thường gặp:\n${form.examTraps.trim()}`;
      }
      if (form.casioTricks?.trim()) {
        const tipHeading = isStem ? '### 💡 Kỹ thuật Casio & Mẹo tư duy nhanh:' : '### 💡 Mẹo tư duy & Chiến thuật làm bài:';
        fullSolutionMethod += `\n\n${tipHeading}\n${form.casioTricks.trim()}`;
      }

      const payload = {
        name: form.name.trim(),
        weight: weightVal,
        theoryRecap: form.theoryRecap,
        solutionMethod: fullSolutionMethod,
        videoUrl: form.videoUrl?.trim() || null,
        durationSeconds: parseInt(form.durationSeconds, 10) || 600,
        prerequisiteSkillIds: pattern?.prerequisiteIds || [],
        sampleQuestion: form.sampleQuestion?.contentLatex?.trim() ? {
          questionId: form.sampleQuestion.questionId || null,
          difficultyLevel: parseInt(form.sampleQuestion.difficultyLevel, 10) || 2,
          contentLatex: form.sampleQuestion.contentLatex,
          optionA: form.sampleQuestion.optionA,
          optionB: form.sampleQuestion.optionB,
          optionC: form.sampleQuestion.optionC,
          optionD: form.sampleQuestion.optionD,
          correctOption: form.sampleQuestion.correctOption || 'A',
          explanation: form.sampleQuestion.explanation
        } : null
      };

      let updated;
      if (form.patternId) {
        updated = await contentService.updatePattern(form.patternId, payload);
      } else {
        const createPayload = {
          domainId: domain?.domainId || (domain?.id ? domain.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da'),
          parentId: lesson?.lessonId,
          name: form.name.trim(),
          weight: weightVal,
          theoryRecap: form.theoryRecap,
          solutionMethod: fullSolutionMethod,
          videoUrl: form.videoUrl?.trim() || null,
          durationSeconds: parseInt(form.durationSeconds, 10) || 600
        };
        const newId = await contentService.createNode(createPayload);
        setForm(prev => ({ ...prev, patternId: newId }));
        updated = { ...form, patternId: newId, weight: `${Math.round(weightVal * 100)}%` };
      }

      setSaveSuccessMsg('Đã lưu thành công toàn bộ nội dung sư phạm & đồ thị vào cơ sở dữ liệu PostgreSQL!');
      
      if (onSaveSuccess) {
        onSaveSuccess(updated || { ...form, weight: `${Math.round(weightVal * 100)}%` });
      }

      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Lỗi khi lưu Studio:", err);
      setSaveErrorMsg(err?.response?.data?.message || err.message || 'Không thể lưu vào cơ sở dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. TOP STUDIO CONTROL BAR (Fixed Height Standalone Navbar) */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0 text-xs font-bold cursor-pointer"
            title="Trở về Lộ trình & Dàn kiến thức"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Quay lại Lộ trình</span>
          </button>
          
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono font-bold truncate">
              <span>{domain?.title || "Môn học"}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 truncate max-w-[140px]">{lesson?.name || "Bài học"}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                {pattern?.code}
              </span>
            </div>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-xs font-extrabold text-white truncate hidden md:inline">
              {form.name}
            </span>
          </div>
        </div>

        {/* View mode switcher & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-300">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Biên soạn</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia đôi (Split)</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'preview' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Review Học sinh</span>
            </button>
          </div>

          <button
            disabled={isAiAnalyzing}
            onClick={handleAIApplyStandardMethod}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-indigo-200 border border-purple-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title={`AI Tri Thức nhận diện bản chất dạng bài, nạp quy trình các bước`}
          >
            {isAiAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span className="hidden md:inline">AI Nhận Diện</span>
          </button>

          <button
            disabled={saving}
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* 2. STUDIO BODY: LEFT HIERARCHICAL SIDEBAR (REPLACES APP SIDEBAR) + RIGHT FULL-WIDTH WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR: HIERARCHICAL FORMULA TOOLBAR */}
        <HierarchicalMathPalette
          isCollapsed={isPaletteCollapsed}
          onToggleCollapse={() => setIsPaletteCollapsed(prev => !prev)}
          activeTarget={activeSection === 'theory' ? 'theoryRecap' : activeSection === 'method' ? 'solutionMethod' : activeFormulaTarget}
          onInsertSnippet={(target, snippet) => handleInsertMath(target, snippet, false)}
        />

        {/* RIGHT WORKSPACE: SCROLLABLE WITH MAXIMUM UNRESTRICTED WIDTH */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/40 p-4 sm:p-6 space-y-4">
          
          {/* AI Identification Result Banner */}
          {aiIdentificationResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>AI Tri Thức Sư Phạm Đã Nhận Diện Dạng Bài</span>
                  </div>
                  <div className="text-xs font-extrabold text-white">
                    {aiIdentificationResult.classification}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Kỹ năng cốt lõi: <strong>{aiIdentificationResult.core_skill}</strong>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[11px] font-bold">
                  Bloom L{aiIdentificationResult.bloom_level}
                </span>
                <button
                  onClick={() => setAiIdentificationResult(null)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs transition-colors"
                  title="Đóng thông báo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Alert Messages */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm animate-fade">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          {saveErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2 shadow-sm animate-fade">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          {/* 3. MAIN WORKSPACE (Split view or single view) */}
          <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* ================= LEFT: AUTHORING STUDIO (7 Cols in Split, Full in Editor) ================= */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} space-y-6`}>
            
            {/* Studio Navigation Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'theory', label: 'Khối 1: Nền tảng SGK & Hình ảnh', icon: BookOpen, color: 'text-cyan-600' },
                { id: 'method', label: 'Khối 2: Phương pháp giải & Bẫy', icon: Compass, color: 'text-amber-600' },
                { id: 'video', label: 'Khối 3: Video bài giảng', icon: Video, color: 'text-emerald-600' },
                { id: 'questions', label: `Khối 4: Ngân hàng câu hỏi (${questionsList.length || 1})`, icon: FileText, color: 'text-indigo-600' },
                { id: 'settings', label: 'Cài đặt định danh', icon: Sliders, color: 'text-slate-600' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ================= SECTION: KHỐI 1 - NỀN TẢNG SGK & HÌNH ẢNH ================= */}
            {activeSection === 'theory' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-black">1</span>
                      <span>Khối 1: Kiến Thức Nền Tảng & Hình Ảnh Minh Họa SGK</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Định nghĩa, định lý, điều kiện xác định, đồ thị hàm số và hình học không gian chuẩn GDPT 2018
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setImageModalTarget('theoryRecap')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1.5 border border-cyan-200 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                    <span>+ Đính kèm Hình ảnh</span>
                  </button>
                </div>

                {/* UNIFIED WORKSPACE: WORD CANVAS (FULL WIDTH) */}
                <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm min-h-[580px] p-4 sm:p-5 space-y-3">
                  
                  {/* THANH CÔNG CỤ ĐỊNH DẠNG PHONG CÁCH MICROSOFT WORD (WORD RIBBON TOOLBAR) */}
                    <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                      {/* Nhóm định dạng chữ & danh sách */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Văn bản:</span>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '**', '**')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-black text-xs transition-colors"
                          title="In đậm (Bold) - Ctrl+B"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '*', '*')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-serif italic text-xs transition-colors"
                          title="In nghiêng (Italic) - Ctrl+I"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '\n\n### ', '\n')}
                          className="px-2 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors gap-1"
                          title="Tiêu đề mục (Heading 3)"
                        >
                          <Heading className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Tiêu đề</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '\n- ', '')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors"
                          title="Gạch đầu dòng (Bullet list)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '\n1. ', '')}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors"
                          title="Đánh số (Numbered list)"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Nhóm công cụ Sư phạm STEM */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('chemistry', 'theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chèn công thức hóa học (CM, C%, m, Hiệu suất H%) có thể chèn số và tự động tính toán"
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                          <span>🧪 Hóa Học & Nồng Độ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('fraction', 'theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chèn phân số A/B có thể chèn số vào tử/mẫu và tự tính kết quả"
                        >
                          <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                          <span>➗ Phân Số & Tính Toán</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('limit', 'theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chèn đạo hàm số gia f'(x0) hoặc giới hạn"
                        >
                          <span>🎯 Đạo Hàm Số Gia</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('variation_table', 'theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chèn bảng biến thiên SGK chuẩn 3 dòng vector"
                        >
                          <span>📊 Bảng Biến Thiên</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('math_graph', 'theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Chèn đồ thị Oxy / Desmos Calculator"
                        >
                          <span>📈 Đồ Thị Hàm Số</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload('theoryRecap')}
                          className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Tải ảnh minh họa hoặc bấm Ctrl+V để dán trực tiếp ảnh chụp màn hình"
                        >
                          <ImageIcon className="w-3 h-3 text-cyan-600" />
                          <span>🖼️ Dán (Ctrl+V) / Tải Ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormatText('theoryRecap', '\n\n### 📌 Ví dụ minh họa SGK:\n- Ví dụ: ', '\n- Lời giải & Phân tích: ')}
                          className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors flex items-center gap-1"
                          title="Chèn khối thẻ Ví dụ minh họa SGK"
                        >
                          <BookOpen className="w-3 h-3 text-teal-600" />
                          <span>+ Ví Dụ SGK</span>
                        </button>
                      </div>

                      {/* Chuyển đổi chế độ: Sửa Trực Tiếp vs Xem Trang In vs Mã Nguồn LaTeX Raw */}
                      <div className="p-0.5 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center gap-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => { setTheoryMode('visual'); setTheoryCanvasView('edit'); }}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            theoryMode === 'visual' && theoryCanvasView === 'edit'
                              ? 'bg-white text-cyan-900 shadow-2xs font-extrabold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Edit3 className="w-3 h-3 text-cyan-600" />
                          <span>✍️ Sửa Trực Tiếp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTheoryMode('visual'); setTheoryCanvasView('preview'); }}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            theoryMode === 'visual' && theoryCanvasView === 'preview'
                              ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>👁️ Trang In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheoryMode('markdown')}
                          className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            theoryMode === 'markdown'
                              ? 'bg-slate-900 text-white shadow-2xs font-mono font-bold'
                              : 'text-slate-600 hover:text-slate-900 font-mono'
                          }`}
                        >
                          <Code2 className="w-3 h-3 text-slate-400" />
                          <span>Raw</span>
                        </button>
                      </div>
                    </div>

                    {/* CONTENT BODY */}
                    {theoryMode === 'markdown' ? (
                      /* RAW LATEX TEXTAREA */
                      <div className="space-y-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Mã nguồn LaTeX & Markdown thuần:</span>
                          <span className="text-slate-400 font-mono">{(form.theoryRecap || '').length} ký tự</span>
                        </div>
                        <textarea
                          ref={el => (textareaRefs.current['theoryRecap'] = el)}
                          rows={14}
                          value={form.theoryRecap}
                          onFocus={() => setActiveFormulaTarget('theoryRecap')}
                          onChange={(e) => setForm(prev => ({ ...prev, theoryRecap: e.target.value }))}
                          placeholder="Dán toàn bộ mã nguồn Markdown / LaTeX trực tiếp từ ChatGPT, Gemini hoặc AI Engine tại đây..."
                          className="w-full flex-1 p-4 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900 text-emerald-400 shadow-inner"
                        />
                      </div>
                    ) : theoryCanvasView === 'preview' ? (
                      /* PREVIEW PRINT SHEET */
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[380px] overflow-x-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                          <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Trang In Giáo Khoa KaTeX (Học Sinh Thấy)</span>
                        </div>
                        {form.theoryRecap?.trim() ? (
                          <div className="text-sm leading-relaxed text-slate-900 overflow-x-auto min-h-[200px] p-2">
                            <MathText text={form.theoryRecap} />
                          </div>
                        ) : (
                          <div className="p-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Chưa có nội dung lý thuyết. Chuyển sang "Sửa Trực Tiếp" để nhập nội dung.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* WYSIWYG CANVAS */
                      <WordStyleFormulaCanvas
                        content={form.theoryRecap}
                        onChange={(val) => setForm(prev => ({ ...prev, theoryRecap: val }))}
                        isStem={isStem}
                        accentColor="cyan"
                        placeholder="Gõ lý thuyết nền tảng SGK tại đây. Nhấp các ký hiệu ở thanh công cụ bên trái để chèn công thức, nhấp vào công thức để sửa số trực tiếp..."
                      />
                    )}

                    {/* FOOTER STATS */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-medium">
                      <span>Số ký tự: <strong>{(form.theoryRecap || '').length}</strong></span>
                      <span className="italic">💡 Mẹo: Nhấp chuột vào bất kỳ công thức nào để sửa số tại chỗ mà không làm nhảy dòng.</span>
                    </div>
                  </div>
                </div>
              )}

            {/* ================= SECTION: KHỐI 2 - PHƯƠNG PHÁP GIẢI & BẪY ĐỀ THI ================= */}
            {activeSection === 'method' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">2</span>
                      <span>Khối 2: Phương Pháp Giải Chuyên Biệt, Bẫy Đề Thi & {isStem ? 'Mẹo Casio' : 'Mẹo Tư Duy & Chiến Thuật'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Giúp học sinh định hình thuật toán giải từng bước và khắc phục các sai lầm kinh điển
                    </p>
                  </div>

                  <button
                    onClick={handleAIApplyStandardMethod}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nạp mẫu chuẩn 4 bước</span>
                  </button>
                </div>

                {/* UNIFIED WORKSPACE: WORD CANVAS (FULL WIDTH) */}
                <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm min-h-[580px] p-4 sm:p-5 space-y-4">
                  {/* THANH CÔNG CỤ WORD RIBBON TOOLBAR CHO QUY TRÌNH GIẢI */}
                    <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                        {/* Nhóm 1: Định dạng chữ & Tiêu đề như Word */}
                        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                          <button
                            type="button"
                            onClick={() => handleFormatText('solutionMethod', '**', '**')}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors"
                            title="In đậm (Bold - **chữ**)"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('solutionMethod', '*', '*')}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors"
                            title="In nghiêng (Italic - *chữ*)"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const stepCount = (form.solutionMethod?.match(/\*\*Bước \d+:/g) || []).length + 1;
                              handleFormatText('solutionMethod', `\n\n**Bước ${stepCount}:** `, '');
                            }}
                            className="px-2 py-1 rounded-lg hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                            title="Chèn tiêu đề Bước giải"
                          >
                            <Heading className="w-3.5 h-3.5 text-amber-600" />
                            <span>Bước</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('solutionMethod', '\n- ', '')}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors"
                            title="Danh sách gạch đầu dòng"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormatText('solutionMethod', '\n1. ', '')}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors"
                            title="Danh sách đánh số thứ tự"
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Nhóm 2: Chèn công cụ Toán STEM, Hóa Học & Minh họa */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('chemistry', 'solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Chèn công thức hóa học (CM, C%, m, Hiệu suất H%) có thể chèn số và tự động tính toán"
                          >
                            <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                            <span>🧪 Hóa Học & Nồng Độ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('fraction', 'solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Mở bảng điền công thức phân số, tích phân, căn, mũ... có thể tính toán tự động"
                          >
                            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                            <span>➗ Phân Số & Tính Toán</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('limit', 'solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Chèn đạo hàm số gia f'(x0) hoặc giới hạn"
                          >
                            <span>🎯 Đạo Hàm Số Gia</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('variation_table', 'solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Chèn bảng biến thiên SGK chuẩn 3 dòng vector"
                          >
                            <span>📊 Bảng Biến Thiên</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('math_graph', 'solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Chèn đồ thị Oxy / Desmos Calculator"
                          >
                            <span>📈 Đồ Thị Hàm Số</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerUpload('solutionMethod')}
                            className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Tải ảnh minh họa hoặc bấm Ctrl+V để dán trực tiếp ảnh chụp màn hình"
                          >
                            <ImageIcon className="w-3 h-3 text-cyan-600" />
                            <span>🖼️ Dán (Ctrl+V) / Tải Ảnh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const stepCount = (form.solutionMethod?.match(/\*\*Bước \d+:/g) || []).length + 1;
                              const insertText = `\n\n**Bước ${stepCount}:** `;
                              const el = textareaRefs.current['solutionMethod'];
                              if (el && typeof el.selectionStart === 'number') {
                                const start = el.selectionStart;
                                const val = el.value || '';
                                setForm(prev => ({ ...prev, solutionMethod: val.slice(0, start) + insertText + val.slice(el.selectionEnd) }));
                              } else {
                                setForm(prev => ({ ...prev, solutionMethod: (prev.solutionMethod || '') + insertText }));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors"
                          >
                            + Thêm Bước mới
                          </button>
                        </div>

                        {/* Nhóm 3: Chuyển đổi chế độ: Sửa Trực Tiếp vs Xem Trang In vs Mã Nguồn LaTeX Raw */}
                        <div className="p-0.5 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center gap-0.5 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => { setMethodMode('visual'); setMethodCanvasView('edit'); }}
                            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              methodMode === 'visual' && methodCanvasView === 'edit'
                                ? 'bg-white text-amber-900 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            <span>✍️ Sửa Trực Tiếp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMethodMode('visual'); setMethodCanvasView('preview'); }}
                            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              methodMode === 'visual' && methodCanvasView === 'preview'
                                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>👁️ Trang In</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethodMode('markdown')}
                            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              methodMode === 'markdown'
                                ? 'bg-slate-900 text-white shadow-2xs font-mono font-bold'
                                : 'text-slate-600 hover:text-slate-900 font-mono'
                            }`}
                          >
                            <Code2 className="w-3 h-3 text-slate-400" />
                            <span>Raw</span>
                          </button>
                        </div>
                      </div>

                    {/* VISUAL WORKSPACE FOR KHỐI 2 */}
                    {methodMode !== 'markdown' && (
                      <div className="space-y-6 animate-fade">
                        {/* 1. Quy trình thuật toán giải */}
                        <div className="space-y-3">
                          {methodCanvasView === 'preview' ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[350px] overflow-x-auto">
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-4">
                            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                              Trang In Quy Trình Giải KaTeX (Học Sinh Thấy)
                            </span>
                          </div>
                          {form.solutionMethod?.trim() ? (
                            <div className="text-sm leading-relaxed text-slate-900 overflow-x-auto min-h-[180px] p-2">
                              <MathText text={form.solutionMethod} />
                            </div>
                          ) : (
                            <div className="p-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              Chưa có quy trình giải. Chuyển sang "Sửa Trực Tiếp" hoặc "Nạp mẫu chuẩn 4 bước" để gõ bài giảng.
                            </div>
                          )}
                        </div>
                      ) : (
                        <WordStyleFormulaCanvas
                          content={form.solutionMethod}
                          onChange={(val) => setForm(prev => ({ ...prev, solutionMethod: val }))}
                          isStem={isStem}
                          accentColor="amber"
                          placeholder="Gõ quy trình giải và các bước thuật toán tại đây. Nhấp các ký hiệu ở thanh công cụ bên trái để chèn công thức, nhấp vào công thức để sửa số trực tiếp..."
                        />
                      )}
                    </div>

                    {/* 2. Bẫy đề thi ĐGNL - Thẻ Cảnh Báo Sư Phạm Trực Tiếp */}
                    <div className="p-5 rounded-2xl bg-rose-50/60 border-2 border-rose-200 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-2.5">
                        <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>2. Các Bẫy Đề Thi ĐGNL Thường Gặp & Lưu Ý Dễ Sai (Sửa Trực Tiếp Trên Thẻ Cảnh Báo):</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleFormatText('examTraps', '\n- ⚠️ Bẫy: ', ' (Học sinh thường nhầm lẫn)')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors shadow-2xs"
                          >
                            + Thêm mục bẫy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('fraction', 'examTraps')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-rose-500" />
                            <span>Điền KaTeX</span>
                          </button>
                        </div>
                      </div>

                      {/* Soạn thảo trực tiếp trong thẻ cảnh báo */}
                      <textarea
                        ref={el => (textareaRefs.current['examTraps'] = el)}
                        rows={3}
                        value={form.examTraps}
                        onFocus={() => setActiveFormulaTarget('examTraps')}
                        onPaste={(e) => handlePasteEvent(e, 'examTraps')}
                        onChange={(e) => setForm(prev => ({ ...prev, examTraps: e.target.value }))}
                        placeholder="Gõ trực tiếp các bẫy đề thi cần cảnh báo cho học sinh tại đây:&#10;- Quên xét điều kiện xác định khi rút gọn biểu thức...&#10;- Nhầm lẫn giữa cực trị của hàm số y và điểm cực trị x..."
                        className="w-full p-3.5 rounded-xl border border-rose-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-rose-950 shadow-2xs placeholder:text-rose-300 resize-y"
                      />
                    </div>

                    {/* 3. Mẹo Casio / Mẹo tư duy nhanh - Thẻ Mẹo Trực Tiếp */}
                    <div className="p-5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/80 pb-2.5">
                        <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>3. {isStem ? 'Kỹ Thuật Casio & Mẹo Tư Duy Nhanh Độc Quyền' : 'Mẹo Tư Duy & Chiến Thuật Làm Bài Độc Quyền'} (Sửa Trực Tiếp Trên Thẻ Mẹo):</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleFormatText('casioTricks', isStem ? '\n- 💡 Mẹo bấm máy [Menu 8]: ' : '\n- 💡 Mẹo làm bài: ', isStem ? ' để dò nhanh giá trị' : ' để ghi điểm tối đa')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition-colors shadow-2xs"
                          >
                            + {isStem ? 'Thêm mẹo Casio' : 'Thêm mẹo làm bài'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFormulaBuilder('fraction', 'casioTricks')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Điền KaTeX</span>
                          </button>
                        </div>
                      </div>

                      {/* Soạn thảo trực tiếp trong thẻ mẹo Casio */}
                      <textarea
                        ref={el => (textareaRefs.current['casioTricks'] = el)}
                        rows={3}
                        value={form.casioTricks}
                        onFocus={() => setActiveFormulaTarget('casioTricks')}
                        onPaste={(e) => handlePasteEvent(e, 'casioTricks')}
                        onChange={(e) => setForm(prev => ({ ...prev, casioTricks: e.target.value }))}
                        placeholder={isStem ? "Gõ trực tiếp các kỹ thuật bấm máy tính Casio & công thức giải nhanh tại đây:\n- Bấm [Menu 8] nhập f(x) để dò dấu và cực trị nhanh trong 15s...\n- Kỹ thuật Cal x = 1000..." : "Gõ trực tiếp các mẹo làm bài & chiến thuật tư duy nhanh tại đây:\n- Kỹ thuật gạch chân từ khóa đề bài trong 30s...\n- Công thức phân bổ thời gian và mẹo liên hệ thực tế ghi điểm tối đa..."}
                        className="w-full p-3.5 rounded-xl border border-indigo-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-indigo-950 shadow-2xs placeholder:text-indigo-300 resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 2: MÃ NGUỒN LATEX THUẦN CHUYÊN DỤNG (DÀNH CHO AI & COPY-PASTE) */}
                {methodMode === 'markdown' && (
                  <div className="space-y-4 animate-fade">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>1. Quy trình giải chi tiết từng bước (Mã nguồn Markdown & KaTeX):</span>
                        <span className="text-slate-400 font-mono">{(form.solutionMethod || '').length} ký tự</span>
                      </div>
                      <textarea
                        ref={el => (textareaRefs.current['solutionMethod'] = el)}
                        rows={8}
                        value={form.solutionMethod}
                        onFocus={() => setActiveFormulaTarget('solutionMethod')}
                        onChange={(e) => setForm(prev => ({ ...prev, solutionMethod: e.target.value }))}
                        placeholder="**Bước 1:** ...\n\n**Bước 2:** ..."
                        className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-900 text-amber-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>2. Các bẫy đề thi ĐGNL thường gặp & Lưu ý học sinh hay sai:</span>
                      </label>
                      <textarea
                        ref={el => (textareaRefs.current['examTraps'] = el)}
                        rows={4}
                        value={form.examTraps}
                        onFocus={() => setActiveFormulaTarget('examTraps')}
                        onChange={(e) => setForm(prev => ({ ...prev, examTraps: e.target.value }))}
                        placeholder="- Quên xét điều kiện tập xác định...\n- Nhầm lẫn giữa cực đại và giá trị cực đại..."
                        className="w-full p-3.5 rounded-2xl border border-rose-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-rose-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>3. {isStem ? 'Kỹ thuật Casio & Mẹo tư duy nhanh độc quyền:' : 'Mẹo tư duy & Chiến thuật làm bài độc quyền:'}</span>
                      </label>
                      <textarea
                        ref={el => (textareaRefs.current['casioTricks'] = el)}
                        rows={3}
                        value={form.casioTricks}
                        onFocus={() => setActiveFormulaTarget('casioTricks')}
                        onChange={(e) => setForm(prev => ({ ...prev, casioTricks: e.target.value }))}
                        placeholder={isStem ? "- Dùng tính năng TABLE [Menu 8] để dò nghiệm...\n- Kỹ thuật Cal x = 1000..." : "- Kỹ thuật gạch chân từ khóa đề bài trong 30s...\n- Mẹo liên hệ thực tế ghi điểm mở rộng..."}
                        className="w-full p-3.5 rounded-2xl border border-indigo-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-indigo-950"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-slate-500">Mã nguồn sẽ tự động đồng bộ sang Trình Soạn Thảo Trực Tiếp Như Word khi chuyển tab.</span>
                      <button
                        type="button"
                        onClick={() => setMethodMode('visual')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Mở Trình Soạn Thảo Trực Tiếp (Như Word)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        )}

            {/* ================= SECTION: KHỐI 3 - VIDEO BÀI GIẢNG & TIMESTAMPS ================= */}
            {activeSection === 'video' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">3</span>
                    <span>Khối 3: Video Bài Giảng & Phân Đoạn Thời Gian (Timestamps)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Hỗ trợ phát video trực tiếp, gắn nhãn thời lượng FSM Gate ≥ 80% và phân đoạn mục lục video
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Link Video bài giảng (YouTube, Cloudflare Stream, Vimeo, MP4):</label>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Thời lượng (Giây):</label>
                    <input
                      type="number"
                      min="60"
                      step="60"
                      value={form.durationSeconds}
                      onChange={(e) => setForm(prev => ({ ...prev, durationSeconds: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Embedded Video Test Player */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Trình phát thử nghiệm video trực tiếp (Embedded Live Test):</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {Math.max(1, Math.round((parseInt(form.durationSeconds, 10) || 0) / 60))} phút
                    </span>
                  </div>

                  {form.videoUrl ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 shadow-md">
                      {form.videoUrl.includes('youtube.com') || form.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getEmbedVideoUrl(form.videoUrl)}
                          title="Video preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                          <PlayCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                          <div>Đường dẫn video ngoài YouTube: <strong>{form.videoUrl}</strong></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs space-y-1">
                      <PlayCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>Chưa có link video bài giảng. Nhập link YouTube ở trên để phát thử nghiệm.</div>
                    </div>
                  )}
                </div>

                {/* Timestamps Table */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Mục lục các mốc thời gian trong video (Timestamps):</label>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        videoTimestamps: [...prev.videoTimestamps, { time: '10:00', title: 'Ví dụ củng cố mới' }]
                      }))}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Thêm mốc</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.videoTimestamps.map((ts, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ts.time}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const updated = [...prev.videoTimestamps];
                              updated[tIdx].time = val;
                              return { ...prev, videoTimestamps: updated };
                            });
                          }}
                          placeholder="00:00"
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 text-center"
                        />
                        <input
                          type="text"
                          value={ts.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const updated = [...prev.videoTimestamps];
                              updated[tIdx].title = val;
                              return { ...prev, videoTimestamps: updated };
                            });
                          }}
                          placeholder="Tiêu đề phân đoạn..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({
                            ...prev,
                            videoTimestamps: prev.videoTimestamps.filter((_, idx) => idx !== tIdx)
                          }))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECTION: KHỐI 4 - NGÂN HÀNG CÂU HỎI DẠNG BÀI ================= */}
            {activeSection === 'questions' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">4</span>
                      <span>Khối 4: Ngân Hàng Câu Hỏi Dạng Bài & Bài Toán Mẫu</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Quản lý ngân hàng câu hỏi thích ứng (API 16-18) bốc tự động cho học sinh luyện tập vi mô
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNewQuestionModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Câu Hỏi Mới</span>
                  </button>
                </div>

                {/* Flagship Sample Question of Pattern */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4">
                  <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Bài toán mẫu minh họa chính của Dạng bài:</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Đáp án đúng: {form.sampleQuestion?.correctOption || 'A'}
                    </span>
                  </div>

                  {/* STEM Helpers are embedded directly on question & explanation headers */}

                  <div className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700">Đề bài (KaTeX, Markdown & Ctrl+V dán ảnh):</label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('fraction', 'sampleQuestion')}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>✨ Điền Công Thức</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('variation_table', 'sampleQuestion')}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>📊 Bảng Biến Thiên</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('math_graph', 'sampleQuestion')}
                          className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>📈 Đồ Thị Hàm Số</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload('sampleQuestion')}
                          className="px-2 py-0.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3 text-cyan-600" />
                          <span>🖼️ Dán/Tải Ảnh</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      ref={el => (textareaRefs.current['sampleQuestion'] = el)}
                      rows={3}
                      value={form.sampleQuestion?.contentLatex || ''}
                      onFocus={() => setActiveFormulaTarget('sampleQuestion')}
                      onPaste={(e) => handlePasteEvent(e, 'sampleQuestion')}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, contentLatex: e.target.value }
                      }))}
                      placeholder="Cho hàm số y = f(x)... Hỗ trợ gõ text, bấm 'Điền Công Thức' hoặc bấm Ctrl+V để dán ảnh đề bài."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const fieldName = `option${optKey}`;
                      const isCorrect = form.sampleQuestion?.correctOption === optKey;
                      return (
                        <div 
                          key={optKey}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-colors ${
                            isCorrect ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' : 'bg-white border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sampleCorrectRadio"
                            checked={isCorrect}
                            onChange={() => setForm(prev => ({
                              ...prev,
                              sampleQuestion: { ...prev.sampleQuestion, correctOption: optKey }
                            }))}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-bold text-xs text-slate-800">{optKey}.</span>
                          <input
                            type="text"
                            value={form.sampleQuestion?.[fieldName] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                sampleQuestion: { ...prev.sampleQuestion, [fieldName]: val }
                              }));
                            }}
                            placeholder={`Phương án ${optKey}...`}
                            className="w-full text-xs font-medium focus:outline-none bg-transparent"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700">Lời giải chi tiết từng bước (Hỗ trợ text thường & Ctrl+V dán ảnh):</label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('fraction', 'sampleExplanation')}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>✨ Điền Công Thức</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('variation_table', 'sampleExplanation')}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>📊 Bảng Biến Thiên</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenFormulaBuilder('math_graph', 'sampleExplanation')}
                          className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>📈 Đồ Thị Hàm Số</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload('sampleExplanation')}
                          className="px-2 py-0.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3 text-cyan-600" />
                          <span>🖼️ Dán/Tải Ảnh</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      ref={el => (textareaRefs.current['sampleExplanation'] = el)}
                      rows={3}
                      value={form.sampleQuestion?.explanation || ''}
                      onFocus={() => setActiveFormulaTarget('sampleExplanation')}
                      onPaste={(e) => handlePasteEvent(e, 'sampleExplanation')}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, explanation: e.target.value }
                      }))}
                      placeholder="Lời giải chi tiết theo các bước của Dạng bài... Hỗ trợ gõ text, bấm 'Điền Công Thức' hoặc bấm Ctrl+V để dán ảnh giải thích."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Additional Questions from Database */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                    <span>Các câu hỏi khác thuộc Dạng bài trong cơ sở dữ liệu ({questionsList.length} câu):</span>
                    {loadingQuestions && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                  </div>

                  {questionsList.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                      Chưa có câu hỏi bổ sung nào. Bấm <strong>"+ Thêm Câu Hỏi Mới"</strong> để làm phong phú ngân hàng đề.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {questionsList.map((q, idx) => (
                        <div key={q.questionId || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-700">Câu #{idx + 1}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                Bloom L{q.difficultyLevel || 2}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Đáp án: {q.correctOption}
                              </span>
                            </div>
                            <div className="text-slate-800 font-medium">
                              <MathText text={q.contentLatex} />
                            </div>
                          </div>
                          
                          <button
                            onClick={async () => {
                              if (!window.confirm("Thầy/Cô có chắc chắn muốn xóa câu hỏi này?")) return;
                              try {
                                await contentService.deleteQuestion(q.questionId);
                                setQuestionsList(prev => prev.filter(item => item.questionId !== q.questionId));
                              } catch (e) {
                                alert("Không thể xóa câu hỏi: " + e.message);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= SECTION: CÀI ĐẶT ĐỊNH DANH & TRỌNG SỐ ================= */}
            {activeSection === 'settings' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-700" />
                    <span>Cài Đặt Định Danh & Thuộc Tính Sư Phạm Dạng Bài</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tên Dạng bài:</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Trọng số năng lực (%):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.weight}
                      onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mức độ nhận thức chuẩn Bloom:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Nhận biết (L1)', 'Thông hiểu (L2)', 'Vận dụng (L3)', 'Vận dụng cao (L4)'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, level: lvl }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          form.level === lvl 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= RIGHT: HIGH-FIDELITY LIVE STUDENT PREVIEW (5 Cols in Split, Full in Preview) ================= */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'w-full'} space-y-4`}>
            
            {/* Preview Banner Header */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                Thời gian thực
              </span>
            </div>

            {/* The Actual Simulated Student Container */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-6">
              
              {/* Pattern Header */}
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black font-mono">
                    {pattern?.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                    Trọng số: {form.weight}%
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                    {form.level}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {form.name}
                </h2>
              </div>

              {/* Khối 1: Nền tảng SGK & Hình ảnh */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Khối 1: Kiến thức nền tảng SGK</span>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 text-xs text-slate-800 font-medium leading-relaxed">
                  <MathText text={form.theoryRecap || "*(Chưa nhập lý thuyết)*"} />
                </div>
              </div>

              {/* Khối 2: Phương pháp giải & Bẫy đề thi */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Khối 2: Phương pháp giải chi tiết</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-xs text-slate-800 font-medium leading-relaxed space-y-2">
                  <MathText text={form.solutionMethod || "*(Chưa nhập phương pháp giải)*"} />
                  {form.examTraps && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mt-2">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bẫy đề thi ĐGNL cần tránh:</span>
                      </div>
                      <MathText text={form.examTraps} />
                    </div>
                  )}
                  {form.casioTricks && (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs mt-2">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isStem ? 'Kỹ thuật Casio & Mẹo tư duy nhanh:' : 'Mẹo tư duy & Chiến thuật làm bài:'}</span>
                      </div>
                      <MathText text={form.casioTricks} />
                    </div>
                  )}
                </div>
              </div>

              {/* Khối 3: Video bài giảng */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Khối 3: Video bài giảng & Lời giải</span>
                </div>
                {form.videoUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <iframe
                      src={getEmbedVideoUrl(form.videoUrl)}
                      title="Video preview student"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                    Chưa đính kèm video bài giảng.
                  </div>
                )}
              </div>

              {/* Khối 4: Bài toán mẫu */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">4</span>
                  <span>Khối 4: Bài toán mẫu & Luyện tập củng cố</span>
                </div>
                {form.sampleQuestion?.contentLatex ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="font-bold text-slate-900">
                      <MathText text={form.sampleQuestion.contentLatex} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div 
                          key={opt}
                          className={`p-2 rounded-xl border text-xs ${
                            form.sampleQuestion.correctOption === opt 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <MathText text={`${opt}. ${form.sampleQuestion[`option${opt}`]}`} />
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                      <strong>Lời giải: </strong>
                      <MathText text={form.sampleQuestion.explanation} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                    Chưa nhập câu hỏi mẫu.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
      
        </div> {/* End right workspace */}
      </div> {/* End studio body flex */}

      {/* 3. MODAL ĐÍNH KÈM HÌNH ẢNH MINH HỌA (IMAGE UPLOADER & LINKER) */}
      {imageModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold">Đính Kèm Hình Ảnh Minh Họa / Đồ Thị</h3>
              </div>
              <button 
                onClick={() => setImageModalTarget(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nhập URL hình ảnh (Đồ thị hàm số, Bảng biến thiên, Hình Oxyz):</label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/graph-derivative.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Sample images list for quick testing */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hoặc chọn hình vẽ mẫu chuẩn:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_DIAGRAM_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertImage(imageModalTarget, img.url, img.label)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/50 text-left transition-all space-y-1"
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 truncate">{img.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setImageModalTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!customImageUrl.trim()}
                onClick={() => handleInsertImage(imageModalTarget, customImageUrl.trim(), 'Hình đồ thị minh họa')}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
              >
                Chèn Ảnh Vào Nội Dung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL THÊM CÂU HỎI MỚI VÀO NGÂN HÀNG ĐỀ (API 16) */}
      {newQuestionModalOpen && (
        <NewQuestionDialog
          skillId={form.patternId || pattern?.patternId}
          onClose={() => setNewQuestionModalOpen(false)}
          onCreated={(newQ) => {
            setQuestionsList(prev => [newQ, ...prev]);
            setNewQuestionModalOpen(false);
          }}
        />
      )}

      {/* 5. INTERACTIVE FORMULA BUILDER MODAL (CLICK-TO-FILL) */}
      {formulaBuilderOpen && (
        <InteractiveFormulaBuilderModal
          isOpen={formulaBuilderOpen}
          initialTemplateId={formulaBuilderTemplate}
          targetField={activeFormulaTarget}
          onClose={() => setFormulaBuilderOpen(false)}
          onInsert={handleInsertMath}
        />
      )}

      {/* HIDDEN FILE INPUT FOR IMAGE UPLOAD & CLIPBOARD PASTING */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

    </div>
  );
}

// Subcomponent: New Question Modal
function NewQuestionDialog({ skillId, onClose, onCreated }) {
  const [contentLatex, setContentLatex] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentLatex.trim()) {
      alert("Vui lòng nhập đề bài câu hỏi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        skillId: skillId,
        difficultyLevel: parseInt(difficultyLevel, 10) || 2,
        contentLatex: contentLatex.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption: correctOption,
        explanation: explanation.trim()
      };
      const result = await contentService.createQuestion(payload);
      alert("Đã thêm câu hỏi thành công vào ngân hàng đề!");
      if (onCreated) onCreated(result || payload);
    } catch (err) {
      alert("Lỗi khi thêm câu hỏi: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-extrabold">Thêm Câu Hỏi Mới Vào Ngân Hàng Đề (API 16)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Đề bài (KaTeX / Markdown):</label>
            <textarea
              rows={3}
              value={contentLatex}
              onChange={(e) => setContentLatex(e.target.value)}
              placeholder="Cho hàm số y = f(x)..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((opt) => (
              <div key={opt} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                <input
                  type="radio"
                  name="newQuestionRadio"
                  checked={correctOption === opt}
                  onChange={() => setCorrectOption(opt)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-xs text-slate-800">{opt}.</span>
                <input
                  type="text"
                  value={opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (opt === 'A') setOptionA(val);
                    if (opt === 'B') setOptionB(val);
                    if (opt === 'C') setOptionC(val);
                    if (opt === 'D') setOptionD(val);
                  }}
                  placeholder={`Phương án ${opt}...`}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mức độ Bloom (1-4):</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value={1}>Bloom L1: Nhận biết</option>
                <option value={2}>Bloom L2: Thông hiểu</option>
                <option value={3}>Bloom L3: Vận dụng</option>
                <option value={4}>Bloom L4: Vận dụng cao</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Đáp án đúng đã chọn:</label>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 text-center">
                Phương án {correctOption}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Lời giải chi tiết từng bước:</label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích từng bước..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu Câu Hỏi Vào Database"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
