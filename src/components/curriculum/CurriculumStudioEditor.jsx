import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Image as ImageIcon,
  Video,
  BookOpen,
  Compass,
  FileText,
  RefreshCw,
  Check,
  X,
  Sliders,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  FlaskConical,
  ChevronDown,
  Table2,
  BarChart3,
  TrendingUp,
  PieChart,
  Upload,
  Dna,
  Box,
  Triangle,
  CaseSensitive,
  PanelRight,
  Sigma,
  Keyboard,
  Search,
  Layers,
  Activity,
  Divide,
  LineChart
} from 'lucide-react';
import MathText, { unescapeLiteralNewlines } from '../common/MathText';
import { serializeDataChart } from '../common/AcademicChartBlock';
import InteractiveFormulaBuilderModal from './InteractiveFormulaBuilderModal';
import InteractiveMathWorkbenchModal from './InteractiveMathWorkbenchModal';
import WordStyleFormulaCanvas from './WordStyleFormulaCanvas';
import HierarchicalMathPalette from './HierarchicalMathPalette';
import {
  isValidGuid,
  saveStudioPatternToTextbookStorage,
  upsertSinglePatternToCurriculumDb
} from './textbookStateBridge';
import contentService from '../../services/contentService';
import aiService from '../../services/aiService';
import { toast } from '../../context/ToastContext';

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
      { label: 'Bảng biến thiên SGK (Điền số)', code: 'Bảng biến thiên', templateId: 'variation_table', isFillable: true },
      { label: 'Đồ thị hàm số', code: 'Đồ thị Oxy', templateId: 'math_graph', isFillable: true },
      { label: "Đạo hàm f'(x)", code: "f'(x)" },
      { label: "Đạo hàm cấp 2 f''(x)", code: "f''(x)" },
      { label: "Đạo hàm tại x0", code: "f'(x_0)" },
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
      { label: 'Tích phân cận a đến b', code: '\\int_{a}^{b} f(x)dx', templateId: 'integral', isFillable: true },
      { label: 'Giới hạn x dần tới x0', code: '\\lim_{x \\to x_0} f(x)', templateId: 'limit', isFillable: true },
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
      { label: 'Vector pháp tuyến', code: '\\vec{n} = (A; B; C)' },
      { label: 'Vector chỉ phương', code: '\\vec{u} = (a; b; c)' },
      { label: 'Vuông góc', code: '\\perp' },
      { label: 'Song song', code: '\\parallel' },
      { label: 'Góc', code: '\\angle ABC' },
      { label: 'Khoảng cách điểm – mp', code: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}' },
      { label: 'Mặt phẳng Alpha', code: '(\\alpha)' },
      { label: 'Mặt phẳng Beta', code: '(\\beta)' },
      { label: 'Mặt cầu (S)', code: '(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2' }
    ]
  },
  systems_brackets: {
    name: 'Hệ PT & Dấu ngoặc',
    icon: '🧱',
    items: [
      { label: 'Hệ 2 phương trình', code: '\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}', templateId: 'system', isFillable: true },
      { label: 'Hệ 3 phương trình', code: '\\begin{cases} a_1 x + b_1 y + c_1 z = d_1 \\\\ a_2 x + b_2 y + c_2 z = d_2 \\\\ a_3 x + b_3 y + c_3 z = d_3 \\end{cases}' },
      { label: 'Dấu ngoặc vuông hoặc', code: '\\begin{bmatrix} x = a \\\\ x = b \\end{bmatrix}' },
      { label: 'Ngoặc tròn lớn', code: '\\left( \\frac{a}{b} \\right)' },
      { label: 'Ngoặc vuông lớn', code: '\\left[ a; b \\right]' },
      { label: 'Khoảng (a; b)', code: '(a; b)' },
      { label: 'Đoạn [a; b]', code: '[a; b]' },
      { label: 'Nửa khoảng [a; b)', code: '[a; b)' },
      { label: 'Tập hợp', code: '\\{ x \\in \\mathbb{R} \\mid P(x) \\}' }
    ]
  },
  sets_logic: {
    name: 'Tập hợp & Logic',
    icon: '🧩',
    items: [
      { label: 'Suy ra', code: '\\Rightarrow' },
      { label: 'Tương đương', code: '\\Leftrightarrow' },
      { label: 'Với mọi', code: '\\forall x \\in D' },
      { label: 'Tồn tại', code: '\\exists x' },
      { label: 'Thuộc', code: '\\in' },
      { label: 'Không thuộc', code: '\\notin' },
      { label: 'Tập rỗng', code: '\\emptyset' },
      { label: 'Tập số thực R', code: '\\mathbb{R}' },
      { label: 'Tập số tự nhiên N', code: '\\mathbb{N}' },
      { label: 'Tập số nguyên Z', code: '\\mathbb{Z}' },
      { label: 'Tập số hữu tỉ Q', code: '\\mathbb{Q}' },
      { label: 'Tập con', code: '\\subset' },
      { label: 'Hợp', code: '\\cup' },
      { label: 'Giao', code: '\\cap' },
      { label: 'Hiệu', code: '\\setminus' }
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
      { label: 'Biến cố đối', code: 'P(\\bar{A}) = 1 - P(A)' },
      { label: 'Xác suất có điều kiện', code: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}' },
      { label: 'Công thức Bernoulli', code: 'P_n(k) = C_n^k p^k (1-p)^{n-k}' },
      { label: 'Kỳ vọng E(X)', code: 'E(X) = \\sum x_i p_i' },
      { label: 'Phương sai V(X)', code: 'V(X) = E(X^2) - [E(X)]^2' },
      { label: 'Độ lệch chuẩn', code: '\\sigma = \\sqrt{V(X)}' },
      { label: 'Số trung bình', code: '\\bar{X}' }
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
    lower.includes('hoá') ||
    lower.includes('chem') ||
    lower.includes('sinh') ||
    lower.includes('bio') ||
    lower.includes('khoa học tự nhiên') ||
    lower.includes('định lượng')
  ) {
    return true;
  }
  return false;
}

/**
 * Auto-detect active subject for the Left Palette based on domain, chapter, lesson & pattern metadata.
 */
export function detectStudioSubject(domain, chapter, lesson, pattern) {
  const corpus = [
    typeof domain === 'string' ? domain : '',
    domain?.title,
    domain?.name,
    domain?.domainName,
    domain?.code,
    domain?.domainCode,
    chapter?.title,
    chapter?.name,
    lesson?.title,
    lesson?.name,
    pattern?.name,
    pattern?.patternName,
    pattern?.code
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(hóa|hoá|\bchem|nguyên tử|bảng tuần hoàn|liên kết hóa|liên kết hoá|phản ứng|halogen|ester|hidrocacbon|hydrocarbon|axit|acid|bazơ|base|nồng độ|mol|oxi hóa|oxi hoá|enthalpy)/i.test(corpus)) {
    return 'chem';
  }
  if (/(sinh học|\bbio\b|tế bào|di truyền|tiến hóa|tiến hoá|sinh thái|adn|arn|protein|nhiễm sắc thể|punnett|quang hợp|hô hấp)/i.test(corpus)) {
    return 'biology';
  }
  if (/(vật lí|vật lý|\bphys|động học|động lực|cơ học|nhiệt học|điện trường|từ trường|dao động|sóng cơ|quang học|hạt nhân)/i.test(corpus)) {
    return 'physics';
  }
  if (/(tiếng anh|ngoại ngữ|\benglish\b|\beng\b|grammar|vocabulary|reading comprehension|phonetics|tenses|passive voice|conditional)/i.test(corpus)) {
    return 'english';
  }
  if (/(ngữ văn|văn học|tiếng việt|nghị luận|tác phẩm|thơ|truyện ngắn|literature)/i.test(corpus)) {
    return 'literature';
  }
  if (/(lịch sử|cách mạng|kháng chiến|triều đại|chiến tranh|history)/i.test(corpus)) {
    return 'history';
  }
  if (/(địa lí|địa lý|khí hậu|địa hình|dân số|kinh tế vùng|geography)/i.test(corpus)) {
    return 'geography';
  }
  return 'math';
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
    /(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Bài toán mẫu áp dụng|Bài toán mẫu|Ví dụ áp dụng|Bài toán minh họa|Đoạn trích \/ Bài mẫu minh họa|Bài mẫu áp dụng phương pháp|Bài mẫu áp dụng|Bài mẫu minh họa|Bài mẫu)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy|Bẫy đề thi|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/iu
  );
  if (sampleMatch) {
    sampleProblem = sampleMatch[1]
      .replace(/(?:^|\n)\s*undefined\s*(?=\n|$)/gi, '\n')
      .replace(/\bundefined\b/gi, '')
      .trim();
  }

  const trapsMatch = method.match(
    /(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy đề thi ĐGNL thường gặp|Các bẫy đề thi|Bẫy đề thi thường gặp|Bẫy đề thi|Các bẫy)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Bài toán mẫu|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/iu
  );
  if (trapsMatch) {
    traps = trapsMatch[1].trim();
  }

  const casioMatch = method.match(
    /(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Kỹ thuật Casio & Mẹo tư duy nhanh|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy & Chiến thuật làm bài|Mẹo tư duy|Chiến thuật làm bài|Mẹo làm bài)[^\n]*(?:\r?\n)([\s\S]*?)(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy đề thi|Bẫy đề thi|Bài toán mẫu)|$))/iu
  );
  if (casioMatch) {
    casio = casioMatch[1].trim();
  }

  method = method
    .replace(/(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Bài toán mẫu áp dụng|Bài toán mẫu|Ví dụ áp dụng|Bài toán minh họa|Đoạn trích \/ Bài mẫu minh họa|Bài mẫu áp dụng phương pháp|Bài mẫu áp dụng|Bài mẫu minh họa|Bài mẫu)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy|Bẫy đề thi|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/giu, '')
    .replace(/(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy đề thi ĐGNL thường gặp|Các bẫy đề thi|Bẫy đề thi thường gặp|Bẫy đề thi|Các bẫy)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Bài toán mẫu|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy)|$))/giu, '')
    .replace(/(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Kỹ thuật Casio & Mẹo tư duy nhanh|Kỹ thuật Casio|Mẹo Casio|Mẹo tư duy & Chiến thuật làm bài|Mẹo tư duy|Chiến thuật làm bài|Mẹo làm bài)[^\n]*(?:\r?\n)[\s\S]*?(?=(?:(?:^|\n)###\s*(?:[^\p{L}\p{N}\s#]+\s*)?(?:Các bẫy đề thi|Bẫy đề thi|Bài toán mẫu)|$))/giu, '')
    .trim();

  return { method, sampleProblem, traps, casio };
}

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
  } catch {
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
  isStem = true
}) {
  const categories = Object.keys(MATH_CATEGORIES);
  const currentCat = MATH_CATEGORIES[activeCategory] || MATH_CATEGORIES.algebra;

  return (
    <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E7E5DF] space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE8E1] pb-2">
        <span className="text-[11px] font-semibold text-[#1E3A5F] uppercase tracking-wider">
          Bảng công thức & ký hiệu
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenBuilder && (
            <button
              type="button"
              onClick={() => onOpenBuilder('fraction', activeTarget)}
              className="px-2.5 py-1 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bộ dựng công thức</span>
            </button>
          )}
          {onSelectTarget && (
            <select
              value={activeTarget}
              onChange={(e) => onSelectTarget(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#E5E3DC] bg-white text-[11px] font-medium text-slate-700"
            >
              <option value="theoryRecap">Lý thuyết</option>
              <option value="solutionMethod">Phương pháp</option>
              <option value="examTraps">Bẫy đề thi</option>
              <option value="casioTricks">{isStem ? 'Mẹo Casio' : 'Mẹo làm bài'}</option>
              <option value="sampleQuestion">Đề bài mẫu</option>
              <option value="sampleExplanation">Lời giải mẫu</option>
            </select>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium">
        {categories.map((catKey) => {
          const cat = MATH_CATEGORIES[catKey];
          const isActive = activeCategory === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(catKey)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white hover:bg-[#EEF2F7] text-slate-600 border border-[#E7E5DF]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-[#EAE8E1]">
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
            className="px-2.5 py-1.5 rounded-lg border bg-[#FAF9F6] hover:bg-[#EEF2F7] border-[#EAE8E1] hover:border-[#2C4C7E]/40 text-slate-800 flex items-center justify-center min-h-[30px] cursor-pointer transition-colors"
            title={snip.label}
          >
            <MathText text={`$${snip.code}$`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function normalizeBloomLevel(rawLevel) {
  if (!rawLevel) return 'Vận dụng (L3)';
  const s = String(rawLevel).trim().toLowerCase();
  if (s.includes('l1') || s.includes('nhớ') || s.includes('nhận biết') || s.includes('remember')) return 'Nhớ / Nhận biết (L1)';
  if (s.includes('l2') || s.includes('hiểu') || s.includes('understand')) return 'Hiểu / Thông hiểu (L2)';
  if (s.includes('l6') || s.includes('sáng tạo') || s.includes('create')) return 'Sáng tạo (L6)';
  if (s.includes('l5') || s.includes('đánh giá') || s.includes('evaluate')) return 'Đánh giá (L5)';
  if (s.includes('l4') || s.includes('phân tích') || s.includes('vận dụng cao') || s.includes('analyze')) return 'Phân tích (L4)';
  if (s.includes('l3') || s.includes('vận dụng') || s.includes('apply')) return 'Vận dụng (L3)';
  return 'Vận dụng (L3)';
}

function cleanOptionOrText(str) {
  if (!str) return '';
  let s = unescapeLiteralNewlines(String(str)).replace(/\\+\s*$/gm, '').trim();
  s = s.replace(/^['"`‘’“”\s]+|['"`‘’“”\s]+$/g, '');
  s = s.replace(/^(?:\([A-D]\)|[A-D][\.\:\)])\s*/i, '').trim();
  s = s.replace(/^['"`‘’“”\s]+|['"`‘’“”\s]+$/g, '');

  if (/^[A-Z][a-zA-Z0-9\(\)\-+]*$/.test(s) && /\d/.test(s)) {
    s = s.replace(/([A-Z][a-z]?|\))(\d+)/g, '$1_$2');
  }

  if (/^[A-Za-z0-9_\(\)\+\-\*\^]+$/.test(s) && /_/.test(s) && !s.startsWith('$')) {
    s = `$${s}$`;
  }

  return s;
}

function getReadableStats(markdownText) {
  const cleaned = String(markdownText || '')
    .replace(/!\[[^\]]*\]\(data:image\/[^)]+\)/g, ' [ảnh] ')
    .replace(/\[DATA_CHART\][\s\S]*?\[\/DATA_CHART\]/gi, ' [biểu đồ] ')
    .replace(/\[VARIATION_TABLE\][\s\S]*?\[\/VARIATION_TABLE\]/gi, ' [bảng biến thiên] ')
    .replace(/\[MATH_GRAPH(?:_3D)?\][\s\S]*?\[\/MATH_GRAPH(?:_3D)?\]/gi, ' [đồ thị] ')
    .replace(/\[MATH_GEOMETRY_2D\][\s\S]*?\[\/MATH_GEOMETRY_2D\]/gi, ' [hình học] ')
    .replace(/[#*_~`$]/g, ' ')
    .trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
  return { words, chars: cleaned.length };
}

function buildMarkdownTable(headers, rows) {
  const safeH = headers.map(h => String(h ?? '').replace(/\|/g, '/').trim() || ' ');
  const sep = safeH.map(() => '---');
  const safeRows = rows.map(r =>
    safeH.map((_, i) => String(r?.[i] ?? '').replace(/\|/g, '/').trim())
  );
  return [
    `| ${safeH.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...safeRows.map(r => `| ${r.join(' | ')} |`)
  ].join('\n');
}

/* ============================================================================
 * WORD-LIKE FORMATTING RIBBON (REAL IN-PLACE FORMATTING, ZERO RAW SYNTAX)
 * ============================================================================ */

function WordFormattingRibbon({
  onExecFormat,
  onInsertTable,
  onInsertChart,
  onOpenFormulaBuilder,
  onTriggerUpload,
  extraActions = null,
  stickyTopClass = 'top-0'
}) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const caseMenuRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });

  const syncFormatStates = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList')
      });
    } catch {
      // ignore if browser blocks queryCommandState
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', syncFormatStates);
    document.addEventListener('keyup', syncFormatStates);
    document.addEventListener('mouseup', syncFormatStates);
    return () => {
      document.removeEventListener('selectionchange', syncFormatStates);
      document.removeEventListener('keyup', syncFormatStates);
      document.removeEventListener('mouseup', syncFormatStates);
    };
  }, []);

  const triggerFormat = (cmd, val) => {
    onExecFormat(cmd, val);
    setTimeout(syncFormatStates, 0);
  };

  useEffect(() => {
    if (!caseMenuOpen) return;
    const handleOutside = (e) => {
      if (caseMenuRef.current && !caseMenuRef.current.contains(e.target)) {
        setCaseMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [caseMenuOpen]);

  const iconBtn =
    'h-7 min-w-[28px] px-1.5 rounded-lg text-slate-600 hover:text-[#1E3A5F] hover:bg-[#EEF2F7] transition-colors flex items-center justify-center cursor-pointer';
  const activeIconBtn =
    'h-7 min-w-[28px] px-1.5 rounded-lg bg-[#1E3A5F] text-white shadow-2xs transition-colors flex items-center justify-center cursor-pointer';
  const textBtn =
    'h-7 px-2 rounded-lg text-[11.5px] font-medium text-slate-600 hover:text-[#1E3A5F] hover:bg-[#EEF2F7] transition-colors flex items-center gap-1 cursor-pointer';
  const divider = <span className="w-px h-4 bg-[#E2DFD7] mx-0.5 shrink-0" />;

  return (
    <div className={`sticky ${stickyTopClass} z-20 px-3 sm:px-4 py-2 bg-[#FAF9F6]/95 backdrop-blur border-b border-[#EAE8E1] rounded-t-2xl flex flex-wrap items-center justify-between gap-y-1.5 gap-x-1 shadow-[0_1px_4px_rgba(15,23,42,0.04)]`}>
      <div className="flex flex-wrap items-center gap-0.5">
        {/* Paragraph / Headings */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('paragraph')}
          className={textBtn}
          title="Đoạn văn bản thường"
        >
          <span>Văn bản</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('heading2')}
          className={`${textBtn} font-semibold`}
          title="Tiêu đề mục lớn (H2)"
        >
          <span>H2</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('heading3')}
          className={`${textBtn} font-semibold`}
          title="Tiêu đề mục phụ (H3)"
        >
          <span>H3</span>
        </button>

        {divider}

        {/* Bold / Italic / Underline / Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('bold')}
          className={activeFormats.bold ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.bold}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('italic')}
          className={activeFormats.italic ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.italic}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('underline')}
          className={activeFormats.underline ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.underline}
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('strikeThrough')}
          className={activeFormats.strikeThrough ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.strikeThrough}
          title="Gạch ngang chữ"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        {/* Aa Change Case Menu */}
        <div className="relative" ref={caseMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setCaseMenuOpen(prev => !prev)}
            className={`${textBtn} ${caseMenuOpen ? 'bg-[#EEF2F7] text-[#1E3A5F]' : ''}`}
            title="Đổi kiểu chữ Hoa / thường (bôi đen đoạn văn trước)"
          >
            <CaseSensitive className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {caseMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-white rounded-xl border border-[#E5E3DC] shadow-[0_8px_24px_rgba(15,23,42,0.1)] p-1 space-y-0.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onExecFormat('uppercase');
                  setCaseMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-[#EEF2F7] hover:text-[#1E3A5F] font-medium cursor-pointer"
              >
                CHỮ IN HOA
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onExecFormat('lowercase');
                  setCaseMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-[#EEF2F7] hover:text-[#1E3A5F] font-medium cursor-pointer"
              >
                chữ viết thường
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onExecFormat('capitalize');
                  setCaseMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-[#EEF2F7] hover:text-[#1E3A5F] font-medium cursor-pointer"
              >
                Viết Hoa Đầu Từ
              </button>
            </div>
          )}
        </div>

        {divider}

        {/* Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('justifyLeft')}
          className={activeFormats.justifyLeft ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.justifyLeft}
          title="Căn trái"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('justifyCenter')}
          className={activeFormats.justifyCenter ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.justifyCenter}
          title="Căn giữa"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('justifyRight')}
          className={activeFormats.justifyRight ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.justifyRight}
          title="Căn phải"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        {divider}

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('insertUnorderedList')}
          className={activeFormats.insertUnorderedList ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.insertUnorderedList}
          title="Danh sách gạch đầu dòng"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => triggerFormat('insertOrderedList')}
          className={activeFormats.insertOrderedList ? activeIconBtn : iconBtn}
          aria-pressed={activeFormats.insertOrderedList}
          title="Danh sách đánh số"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        {divider}

        {/* Direct Academic Inserts */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertTable}
          className={textBtn}
          title="Chèn bảng dữ liệu kiểu Excel"
        >
          <Table2 className="w-3.5 h-3.5 text-[#2C4C7E]" />
          <span className="hidden sm:inline">Bảng</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertChart}
          className={textBtn}
          title="Chèn biểu đồ số liệu"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#2C4C7E]" />
          <span className="hidden sm:inline">Biểu đồ</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onOpenFormulaBuilder}
          className="h-7 px-2.5 rounded-lg text-[11.5px] font-semibold text-[#1E3A5F] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Mở bàn phím soạn thảo công thức và chèn tại vị trí con trỏ"
        >
          <Keyboard className="w-4 h-4 text-indigo-700" />
          <span>Bàn phím soạn thảo</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTriggerUpload}
          className={textBtn}
          title="Tải ảnh từ máy tính"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#2C4C7E]" />
          <span className="hidden sm:inline">Ảnh</span>
        </button>

        {extraActions}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onExecFormat('undo')}
          className={iconBtn}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onExecFormat('redo')}
          className={iconBtn}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * RIGHT DOCKED PANEL: STEM & MÔ HÌNH HỌC (TABLES, CHARTS, MATH, BIO, CHEM, IMAGES)
 * ============================================================================ */

function StemModelsPanel({
  isOpen,
  onClose,
  onInsertTable,
  onInsertChart,
  onOpenFormulaBuilder,
  onOpenMathWorkbench,
  onTriggerUpload,
  onOpenImageModal
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const groups = useMemo(
    () => [
      {
        title: 'Bảng & Biểu đồ',
        items: [
          {
            id: 'excel_table',
            title: 'Bảng dữ liệu (Excel)',
            desc: 'Nhập trực tiếp, nhấn Tab chuyển ô',
            icon: Table2,
            keywords: 'bang du lieu excel o luoi sheet table',
            action: () =>
              onInsertTable(3, 3, {
                headers: ['Đại lượng', 'Đơn vị', 'Giá trị'],
                rows: [
                  ['', '', ''],
                  ['', '', '']
                ]
              })
          },
          {
            id: 'compare_table',
            title: 'Bảng so sánh 2 cột',
            desc: 'Đối chiếu tính chất, khái niệm',
            icon: Layers,
            keywords: 'bang so sanh doi chieu 2 cot tieu chi',
            action: () =>
              onInsertTable(3, 3, {
                headers: ['Tiêu chí', 'Đối tượng A', 'Đối tượng B'],
                rows: [
                  ['Khái niệm', '', ''],
                  ['Đặc điểm', '', '']
                ]
              })
          },
          {
            id: 'bar_chart',
            title: 'Biểu đồ cột',
            desc: 'So sánh số liệu theo nhóm',
            icon: BarChart3,
            keywords: 'bieu do cot bar chart thong ke so lieu',
            action: () =>
              onInsertChart('bar', {
                type: 'bar',
                title: 'Biểu đồ so sánh số liệu',
                items: [
                  { label: 'Mẫu 1', value: 25 },
                  { label: 'Mẫu 2', value: 42 },
                  { label: 'Mẫu 3', value: 36 },
                  { label: 'Mẫu 4', value: 58 }
                ]
              })
          },
          {
            id: 'line_chart',
            title: 'Biểu đồ đường',
            desc: 'Xu hướng biến thiên theo thời gian',
            icon: TrendingUp,
            keywords: 'bieu do duong line chart bien thien thoi gian',
            action: () =>
              onInsertChart('line', {
                type: 'line',
                title: 'Đồ thị biến thiên theo thời gian',
                items: [
                  { label: 't1', value: 12 },
                  { label: 't2', value: 28 },
                  { label: 't3', value: 45 },
                  { label: 't4', value: 64 }
                ]
              })
          },
          {
            id: 'pie_chart',
            title: 'Biểu đồ tròn',
            desc: 'Tỉ trọng phần trăm thành phần',
            icon: PieChart,
            keywords: 'bieu do tron pie chart ti le phan tram co cau',
            action: () =>
              onInsertChart('pie', {
                type: 'pie',
                title: 'Cơ cấu thành phần (%)',
                items: [
                  { label: 'Thành phần A', value: 45 },
                  { label: 'Thành phần B', value: 35 },
                  { label: 'Thành phần C', value: 20 }
                ]
              })
          }
        ]
      },
      {
        title: 'Mô hình Toán học',
        items: [
          {
            id: 'math_2d',
            title: 'Đồ thị hàm số 2D',
            desc: 'Hệ trục Oxy, đường cong, tiệm cận',
            icon: LineChart,
            keywords: 'do thi ham so oxy 2d duong cong',
            action: () => onOpenMathWorkbench('2d_function')
          },
          {
            id: 'math_3d',
            title: 'Hình không gian 3D',
            desc: 'Hình chóp, lăng trụ, mặt cầu Oxyz',
            icon: Box,
            keywords: 'hinh khong gian 3d chop lang tru mat cau oxyz',
            action: () => onOpenMathWorkbench('3d_space')
          },
          {
            id: 'math_plane',
            title: 'Hình học phẳng 2D',
            desc: 'Tam giác, đường tròn, vectơ',
            icon: Triangle,
            keywords: 'hinh hoc phang 2d tam giac duong tron vecto',
            action: () => onOpenMathWorkbench('2d_geometry')
          },
          {
            id: 'variation_table',
            title: 'Bảng biến thiên',
            desc: 'Cực trị, dấu đạo hàm, chiều biến thiên',
            icon: Table2,
            keywords: 'bang bien thien bbt cuc tri tiem can',
            action: () => onOpenFormulaBuilder('variation_table')
          }
        ]
      },
      {
        title: 'Hóa · Sinh · Vật lí',
        items: [
          {
            id: 'lab_table',
            title: 'Bảng số liệu thí nghiệm',
            desc: 'Ghi nhận kết quả đo thực nghiệm',
            icon: FlaskConical,
            keywords: 'bang thi nghiem vat li hoa hoc do dac ket qua',
            action: () =>
              onInsertTable(4, 4, {
                headers: ['Lần đo', 'Đại lượng', 'Kết quả', 'Nhận xét'],
                rows: [
                  ['1', '', '', ''],
                  ['2', '', '', ''],
                  ['3', '', '', '']
                ]
              })
          },
          {
            id: 'bio_punnett',
            title: 'Bảng lai Punnett (Sinh học)',
            desc: 'Sơ đồ tổ hợp giao tử di truyền',
            icon: Dna,
            keywords: 'sinh hoc bang lai punnett di truyen giao tu kieu gen',
            action: () =>
              onInsertTable(3, 3, {
                headers: ['Giao tử', 'A', 'a'],
                rows: [
                  ['A', 'AA', 'Aa'],
                  ['a', 'Aa', 'aa']
                ]
              })
          },
          {
            id: 'bio_compare',
            title: 'Bảng phân loại Sinh học',
            desc: 'So sánh cấu trúc tế bào / cơ chế',
            icon: Dna,
            keywords: 'sinh hoc te bao so sanh phan loai co che',
            action: () =>
              onInsertTable(4, 3, {
                headers: ['Đặc điểm', 'Nhóm 1', 'Nhóm 2'],
                rows: [
                  ['Cấu trúc', '', ''],
                  ['Chức năng', '', ''],
                  ['Ví dụ', '', '']
                ]
              })
          }
        ]
      },
      {
        title: 'Hình ảnh & Tư liệu',
        items: [
          {
            id: 'upload_img',
            title: 'Tải ảnh từ máy tính',
            desc: 'Chèn ảnh sơ đồ, hình chụp SGK',
            icon: Upload,
            keywords: 'tai anh upload hinh anh may tinh sgk',
            action: () => onTriggerUpload()
          },
          {
            id: 'url_img',
            title: 'Chèn ảnh từ URL / mẫu',
            desc: 'Dán đường dẫn hoặc chọn hình mẫu',
            icon: ImageIcon,
            keywords: 'chen anh url hinh mau minh hoa',
            action: () => onOpenImageModal()
          }
        ]
      }
    ],
    [onInsertTable, onInsertChart, onOpenFormulaBuilder, onOpenMathWorkbench, onTriggerUpload, onOpenImageModal]
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(g => ({
        ...g,
        items: g.items.filter(
          item =>
            item.title.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            item.keywords.includes(q)
        )
      }))
      .filter(g => g.items.length > 0);
  }, [groups, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside className="w-[268px] shrink-0 h-full min-h-0 overflow-hidden bg-white border-l border-[#E7E5DF] flex flex-col select-none z-10">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-[#ECEAE4] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2C4C7E]" />
            <span className="text-xs font-semibold text-slate-800">Mô hình STEM</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-[#F3F2EC] flex items-center justify-center transition-colors cursor-pointer"
            title="Ẩn bảng STEM"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bảng, biểu đồ, mô hình..."
            className="w-full bg-[#FAF9F6] focus:bg-white border border-[#E7E5DF] focus:border-[#2C4C7E]/50 rounded-lg pl-8 pr-6 py-1.5 text-[11.5px] text-slate-700 placeholder-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Categorized Learning Models */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {filteredGroups.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Không tìm thấy mô hình phù hợp.</div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={item.action}
                      className="w-full text-left px-2.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#EEF2F7] border border-[#ECEAE4] hover:border-[#CFD9E8] transition-all flex items-start gap-2.5 cursor-pointer group active:scale-[0.99]"
                    >
                      <span className="w-7 h-7 rounded-lg bg-white border border-[#E7E5DF] group-hover:border-[#CFD9E8] text-[#2C4C7E] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-slate-800 group-hover:text-[#1E3A5F] leading-snug">
                          {item.title}
                        </span>
                        <span className="block text-[10.5px] text-slate-500 leading-snug mt-0.5">
                          {item.desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quiet Footer Tip */}
      <div className="px-3.5 py-2 border-t border-[#ECEAE4] bg-[#FAF9F6] text-[10.5px] text-slate-500 shrink-0">
        Mẹo: Dán ảnh trực tiếp bằng <span className="font-semibold text-slate-700">Ctrl + V</span> vào trang soạn thảo.
      </div>
    </aside>
  );
}

/* ============================================================================
 * MAIN STUDIO EDITOR
 * ============================================================================ */

export default function CurriculumStudioEditor({
  pattern,
  domain,
  chapter,
  lesson,
  mode = 'pattern',
  role = 'director',
  headerActions = null,
  embedded = false,
  onClose,
  onSaveSuccess
}) {
  const isTeacher = role === 'teacher';
  const isStem = isMathOrStemDomain(domain);
  const detectedSubject = useMemo(
    () => detectStudioSubject(domain, chapter, lesson, pattern),
    [domain, chapter, lesson, pattern]
  );

  // Single unified visual workspace; optional quiet Preview drawer (default OFF)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('theory'); // 'theory' | 'method' | 'video' | 'questions' | 'settings'
  const [activeFormulaTarget, setActiveFormulaTarget] = useState('theoryRecap');
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isStemPanelOpen, setIsStemPanelOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : true
  );

  const parsedInitial = parseSolutionMethodSections(pattern?.solutionMethod || '');

  const [form, setForm] = useState({
    patternId: pattern?.patternId || '',
    name: cleanOptionOrText(pattern?.name || pattern?.patternName || ''),
    weight: pattern?.weight ? String(pattern.weight).replace('%', '').trim() : '5',
    level: normalizeBloomLevel(pattern?.level || pattern?.classification || 'Vận dụng (L3)'),
    theoryRecap: unescapeLiteralNewlines(pattern?.theoryRecap || ''),
    solutionMethod: unescapeLiteralNewlines(parsedInitial.method),
    sampleProblem: unescapeLiteralNewlines(parsedInitial.sampleProblem || ''),
    examTraps: cleanOptionOrText(pattern?.examTraps || parsedInitial.traps || ''),
    casioTricks: cleanOptionOrText(pattern?.casioTricks || parsedInitial.casio || ''),
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
      contentLatex: cleanOptionOrText(pattern?.sampleQuestion?.content || ''),
      optionA: cleanOptionOrText(pattern?.sampleQuestion?.options?.[0]?.replace(/^A\.\s*/, '') || ''),
      optionB: cleanOptionOrText(pattern?.sampleQuestion?.options?.[1]?.replace(/^B\.\s*/, '') || ''),
      optionC: cleanOptionOrText(pattern?.sampleQuestion?.options?.[2]?.replace(/^C\.\s*/, '') || ''),
      optionD: cleanOptionOrText(pattern?.sampleQuestion?.options?.[3]?.replace(/^D\.\s*/, '') || ''),
      correctOption:
        pattern?.sampleQuestion?.correct !== undefined
          ? String.fromCharCode(65 + pattern.sampleQuestion.correct)
          : 'A',
      explanation: cleanOptionOrText(pattern?.sampleQuestion?.explanation || '')
    }
  });

  // Gracefully sync async pattern updates (e.g. when TextbookStudioView loads chunks/saved data after mount)
  const lastPatternKeyRef = useRef(
    `${pattern?.patternId || ''}::${pattern?.theoryRecap?.length || 0}::${pattern?.solutionMethod?.length || 0}`
  );
  useEffect(() => {
    const nextKey = `${pattern?.patternId || ''}::${pattern?.theoryRecap?.length || 0}::${pattern?.solutionMethod?.length || 0}`;
    if (!pattern) return;

    const parsed = parseSolutionMethodSections(pattern?.solutionMethod || '');
    const buildSampleQ = (sq) => ({
      questionId: sq?.questionId || null,
      difficultyLevel: Number(sq?.difficultyLevel) || 2,
      contentLatex: cleanOptionOrText(sq?.content || sq?.contentLatex || ''),
      optionA: cleanOptionOrText(sq?.optionA || sq?.options?.[0]?.replace(/^A\.\s*/, '') || ''),
      optionB: cleanOptionOrText(sq?.optionB || sq?.options?.[1]?.replace(/^B\.\s*/, '') || ''),
      optionC: cleanOptionOrText(sq?.optionC || sq?.options?.[2]?.replace(/^C\.\s*/, '') || ''),
      optionD: cleanOptionOrText(sq?.optionD || sq?.options?.[3]?.replace(/^D\.\s*/, '') || ''),
      correctOption:
        sq?.correctOption ||
        (sq?.correct !== undefined ? String.fromCharCode(65 + Number(sq.correct || 0)) : 'A'),
      explanation: cleanOptionOrText(sq?.explanation || '')
    });

    if (pattern.patternId && pattern.patternId !== form.patternId) {
      setForm(prev => ({
        ...prev,
        patternId: pattern.patternId || '',
        name: cleanOptionOrText(pattern.name || pattern.patternName || prev.name || ''),
        weight: pattern.weight ? String(pattern.weight).replace('%', '').trim() : prev.weight || '5',
        level: normalizeBloomLevel(pattern.level || pattern.classification || 'Vận dụng (L3)'),
        theoryRecap: unescapeLiteralNewlines(pattern.theoryRecap || ''),
        solutionMethod: unescapeLiteralNewlines(parsed.method),
        sampleProblem: unescapeLiteralNewlines(parsed.sampleProblem || ''),
        examTraps: cleanOptionOrText(pattern.examTraps || parsed.traps || ''),
        casioTricks: cleanOptionOrText(pattern.casioTricks || parsed.casio || ''),
        sampleQuestion: pattern.sampleQuestion ? buildSampleQ(pattern.sampleQuestion) : prev.sampleQuestion
      }));
      lastPatternKeyRef.current = nextKey;
    } else if (lastPatternKeyRef.current !== nextKey) {
      setForm(prev => ({
        ...prev,
        name: prev.name || cleanOptionOrText(pattern.name || pattern.patternName || ''),
        theoryRecap: prev.theoryRecap || unescapeLiteralNewlines(pattern.theoryRecap || ''),
        solutionMethod: prev.solutionMethod || unescapeLiteralNewlines(parsed.method || ''),
        sampleProblem: prev.sampleProblem || unescapeLiteralNewlines(parsed.sampleProblem || ''),
        examTraps: prev.examTraps || cleanOptionOrText(pattern.examTraps || parsed.traps || ''),
        casioTricks: prev.casioTricks || cleanOptionOrText(pattern.casioTricks || parsed.casio || ''),
        sampleQuestion:
          !prev.sampleQuestion?.contentLatex && pattern.sampleQuestion
            ? buildSampleQ(pattern.sampleQuestion)
            : prev.sampleQuestion
      }));
      lastPatternKeyRef.current = nextKey;
    }
  }, [pattern?.patternId, pattern?.theoryRecap, pattern?.solutionMethod, pattern?.sampleQuestion]);

  // Canvas imperative refs
  const theoryCanvasRef = useRef(null);
  const methodCanvasRef = useRef(null);
  const examTrapsCanvasRef = useRef(null);
  const casioTricksCanvasRef = useRef(null);
  const sampleQuestionCanvasRef = useRef(null);
  const sampleExplanationCanvasRef = useRef(null);

  const getEffectiveTargetField = () => {
    if (activeSection === 'theory') return 'theoryRecap';
    if (activeSection === 'method') {
      if (['solutionMethod', 'examTraps', 'casioTricks'].includes(activeFormulaTarget)) {
        return activeFormulaTarget;
      }
      return 'solutionMethod';
    }
    if (activeSection === 'questions') {
      if (['sampleQuestion', 'sampleExplanation'].includes(activeFormulaTarget)) {
        return activeFormulaTarget;
      }
      return 'sampleQuestion';
    }
    return 'theoryRecap';
  };

  const getCanvasRefByField = (field) => {
    const f = field || getEffectiveTargetField();
    if (f === 'theoryRecap') return theoryCanvasRef.current;
    if (f === 'solutionMethod') return methodCanvasRef.current;
    if (f === 'examTraps') return examTrapsCanvasRef.current;
    if (f === 'casioTricks') return casioTricksCanvasRef.current;
    if (f === 'sampleQuestion') return sampleQuestionCanvasRef.current;
    if (f === 'sampleExplanation') return sampleExplanationCanvasRef.current;
    return null;
  };

  // Question Bank & Modal States
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [deletingQId, setDeletingQId] = useState(null);
  const [newQuestionModalOpen, setNewQuestionModalOpen] = useState(false);
  const [aiQuestionModalOpen, setAiQuestionModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageModalTarget, setImageModalTarget] = useState(null);

  // Interactive Formula Builder Modal
  const [formulaBuilderOpen, setFormulaBuilderOpen] = useState(false);
  const [formulaBuilderTemplate, setFormulaBuilderTemplate] = useState('fraction');
  const fileInputRef = useRef(null);
  const [uploadTargetField, setUploadTargetField] = useState('theoryRecap');

  // Interactive MathLab & 3D Geometry Modal
  const [mathWorkbenchOpen, setMathWorkbenchOpen] = useState(false);
  const [mathWorkbenchEngine, setMathWorkbenchEngine] = useState('2d_function');
  const [mathWorkbenchInitialTag, setMathWorkbenchInitialTag] = useState('');
  const [customWorkbenchCallback, setCustomWorkbenchCallback] = useState(null);

  // Status & AI states
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiIdentificationResult, setAiIdentificationResult] = useState(null);

  // Fetch questions for pattern (only query Content Service API when patternId is a valid GUID)
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!pattern?.patternId) return;
      if (!isValidGuid(pattern.patternId)) {
        if (Array.isArray(pattern?.exercises) && pattern.exercises.length > 1) {
          setQuestionsList(
            pattern.exercises.slice(1).map((ex, idx) => ({
              questionId: ex.id || `local-ex-${idx}`,
              contentLatex: ex.contentLatex || ex.stem || ex.content || '',
              optionA: ex.optionA || ex.options?.[0] || '',
              optionB: ex.optionB || ex.options?.[1] || '',
              optionC: ex.optionC || ex.options?.[2] || '',
              optionD: ex.optionD || ex.options?.[3] || '',
              correctOption:
                ex.correctOption ||
                String.fromCharCode(65 + Math.max(0, Number(ex.correctIndex || 0))),
              explanation: ex.explanation || ex.solution || '',
              difficultyLevel: Number(ex.difficultyLevel || ex.bloomLevel) || 2
            }))
          );
        }
        return;
      }
      setLoadingQuestions(true);
      try {
        const data = await contentService.getQuestionsBySkill(pattern.patternId);
        if (data && Array.isArray(data)) {
          setQuestionsList(data);
        } else if (data && Array.isArray(data.questions)) {
          setQuestionsList(data.questions);
        }
      } catch (err) {
        console.warn('Chưa tải được danh sách câu hỏi:', err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [pattern?.patternId]);

  const handleOpenFormulaBuilder = (templateId = 'fraction', targetField = null) => {
    const field = targetField || getEffectiveTargetField();
    setActiveFormulaTarget(field);
    setFormulaBuilderTemplate(templateId);
    setFormulaBuilderOpen(true);
  };

  const handleOpenMathWorkbench = (engine = '2d_function', targetField = null, initialTag = '') => {
    const field = targetField || getEffectiveTargetField();
    setActiveFormulaTarget(field);
    setMathWorkbenchEngine(engine);
    setMathWorkbenchInitialTag(initialTag || '');
    setMathWorkbenchOpen(true);
  };

  // Word Formatting Command Dispatcher
  const handleExecFormat = (targetField, cmd, value = null) => {
    const field = targetField || getEffectiveTargetField();
    const canvas = getCanvasRefByField(field);
    if (canvas?.execFormat) {
      canvas.execFormat(cmd, value);
    }
  };

  const handleOpenMathKeyboard = (targetField) => {
    const field = targetField || getEffectiveTargetField();
    const canvas = getCanvasRefByField(field);
    if (canvas?.openMathComposer) {
      canvas.openMathComposer(true);
      return;
    }
    handleOpenFormulaBuilder('fraction', field);
  };

  // Insert Excel-like Editable Table
  const handleInsertTable = (rows = 3, cols = 3, preset = null, targetField = null) => {
    const field = targetField || getEffectiveTargetField();
    const canvas = getCanvasRefByField(field);
    if (canvas?.insertTable) {
      canvas.insertTable(rows, cols, preset);
      return;
    }
    const headers = preset?.headers || Array.from({ length: cols }, (_, i) => `Cột ${i + 1}`);
    const bodyRows = preset?.rows || Array.from({ length: Math.max(1, rows - 1) }, () => Array(headers.length).fill(''));
    const mdTable = buildMarkdownTable(headers, bodyRows);
    setForm(prev => ({
      ...prev,
      theoryRecap: prev.theoryRecap ? `${prev.theoryRecap}\n\n${mdTable}` : mdTable
    }));
    setActiveSection('theory');
    toast.success('Đã chèn bảng vào phần Lý thuyết.');
  };

  // Insert Interactive Embedded Chart
  const handleInsertChart = (chartType = 'bar', preset = null, targetField = null) => {
    const field = targetField || getEffectiveTargetField();
    const canvas = getCanvasRefByField(field);
    if (canvas?.insertChart) {
      canvas.insertChart(chartType, preset);
      return;
    }
    const chartTag = serializeDataChart(
      preset || {
        type: chartType,
        title: 'Biểu đồ số liệu',
        items: [
          { label: 'Nhóm A', value: 30 },
          { label: 'Nhóm B', value: 48 },
          { label: 'Nhóm C', value: 36 },
          { label: 'Nhóm D', value: 60 }
        ]
      }
    );
    setForm(prev => ({
      ...prev,
      theoryRecap: prev.theoryRecap ? `${prev.theoryRecap}\n\n${chartTag}` : chartTag
    }));
    setActiveSection('theory');
    toast.success('Đã chèn biểu đồ vào phần Lý thuyết.');
  };

  // Insert Math / KaTeX / Graph / Variation Table
  const handleInsertMath = (targetField, snippet, isRaw = false) => {
    const field = targetField || getEffectiveTargetField();

    // If user edited an existing graph tag, replace it in-place cleanly
    if (mathWorkbenchInitialTag && isRaw) {
      const replaceExisting = (oldText) => {
        if (!oldText) return snippet;
        if (oldText.includes(mathWorkbenchInitialTag)) {
          return oldText.replace(mathWorkbenchInitialTag, snippet.trim());
        }
        return `${oldText}\n\n${snippet.trim()}`;
      };
      if (field === 'sampleQuestion') {
        setForm(prev => ({
          ...prev,
          sampleQuestion: { ...prev.sampleQuestion, contentLatex: replaceExisting(prev.sampleQuestion?.contentLatex) }
        }));
      } else if (field === 'sampleExplanation') {
        setForm(prev => ({
          ...prev,
          sampleQuestion: { ...prev.sampleQuestion, explanation: replaceExisting(prev.sampleQuestion?.explanation) }
        }));
      } else {
        setForm(prev => ({ ...prev, [field]: replaceExisting(prev[field]) }));
      }
      setMathWorkbenchInitialTag('');
      return;
    }

    const canvas = getCanvasRefByField(field);
    if (canvas?.insertSnippet) {
      canvas.insertSnippet(snippet);
      return;
    }

    const insertText = isRaw ? snippet : `$${snippet}$`;
    if (field === 'sampleQuestion') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          contentLatex: prev.sampleQuestion?.contentLatex
            ? `${prev.sampleQuestion.contentLatex} ${insertText}`
            : insertText
        }
      }));
    } else if (field === 'sampleExplanation') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          explanation: prev.sampleQuestion?.explanation
            ? `${prev.sampleQuestion.explanation} ${insertText}`
            : insertText
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}\n\n${insertText}` : insertText
      }));
      if (activeSection !== 'theory' && activeSection !== 'method') {
        setActiveSection('theory');
      }
    }
  };

  // Insert Image visually into active document canvas
  const handleInsertImage = (targetField, url, label = 'Hình minh họa') => {
    if (!url) return;
    const field = targetField || getEffectiveTargetField();
    const canvas = getCanvasRefByField(field);
    if (canvas?.insertImage) {
      canvas.insertImage(url, label);
      setCustomImageUrl('');
      setImageModalTarget(null);
      return;
    }

    const imgMarkdown = `\n\n![${label}](${url})\n\n`;
    if (field === 'sampleQuestion') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          contentLatex: `${prev.sampleQuestion?.contentLatex || ''}${imgMarkdown}`
        }
      }));
    } else if (field === 'sampleExplanation') {
      setForm(prev => ({
        ...prev,
        sampleQuestion: {
          ...prev.sampleQuestion,
          explanation: `${prev.sampleQuestion?.explanation || ''}${imgMarkdown}`
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: `${prev[field] || ''}${imgMarkdown}`
      }));
      if (activeSection !== 'theory' && activeSection !== 'method') {
        setActiveSection('theory');
      }
    }
    setCustomImageUrl('');
    setImageModalTarget(null);
  };

  // Clipboard image paste fallback on outer wrapper
  const handlePasteEvent = (e, targetField) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData || !clipboardData.items) return;
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          handleInsertImage(targetField, event.target.result, 'Hình minh họa');
          setSaveSuccessMsg('Đã dán hình ảnh vào trang soạn thảo.');
          setTimeout(() => setSaveSuccessMsg(''), 3500);
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  const handleTriggerUpload = (field = null) => {
    setUploadTargetField(field || getEffectiveTargetField());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleInsertImage(uploadTargetField, event.target.result, file.name.replace(/\.[^.]+$/, '') || 'Hình minh họa');
      setSaveSuccessMsg('Đã chèn hình ảnh từ máy tính.');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    };
    reader.readAsDataURL(file);
  };

  // AI Knowledge Pattern Reasoning
  const handleAIApplyStandardMethod = async () => {
    setIsAiAnalyzing(true);
    setSaveErrorMsg('');
    try {
      const targetPatternName = form.name?.trim() || pattern?.name || 'Dạng bài trọng tâm';
      const result = await aiService.analyzePatternWithAi({
        patternName: targetPatternName,
        lessonName: lesson?.name || '',
        domainName: domain?.title || domain?.name || 'Toán học & Tư duy định lượng'
      });

      if (result) {
        setAiIdentificationResult(result);
        const parsedMethod = parseSolutionMethodSections(result.solution_method || '');
        setForm(prev => ({
          ...prev,
          theoryRecap: prev.theoryRecap?.trim() ? prev.theoryRecap : unescapeLiteralNewlines(result.theory_recap),
          solutionMethod: unescapeLiteralNewlines(parsedMethod.method || result.solution_method),
          sampleProblem: unescapeLiteralNewlines(parsedMethod.sampleProblem || prev.sampleProblem || ''),
          examTraps: unescapeLiteralNewlines(result.exam_traps || parsedMethod.traps || prev.examTraps),
          casioTricks: unescapeLiteralNewlines(result.casio_tricks || parsedMethod.casio || prev.casioTricks),
          sampleQuestion: result.sample_question
            ? {
                questionId: prev.sampleQuestion?.questionId || null,
                difficultyLevel: result.sample_question.difficulty_level || 2,
                contentLatex: result.sample_question.content_latex || '',
                optionA: result.sample_question.option_a || '',
                optionB: result.sample_question.option_b || '',
                optionC: result.sample_question.option_c || '',
                optionD: result.sample_question.option_d || '',
                correctOption: result.sample_question.correct_option || 'A',
                explanation: result.sample_question.explanation || ''
              }
            : prev.sampleQuestion
        }));
        setSaveSuccessMsg(`AI đã chuẩn hóa dạng bài: "${result.classification}" (Bloom L${result.bloom_level}).`);
        setTimeout(() => setSaveSuccessMsg(''), 4500);
      }
    } catch (err) {
      console.warn('AI pattern analysis fallback:', err);
      const standardProcedure = isStem
        ? `### Quy trình tư duy giải chuẩn:
**Bước 1: Xác định điều kiện & Dữ kiện trọng tâm**
- Đọc kỹ giả thiết, xác định đại lượng đã cho và đại lượng cần tìm.
- Viết điều kiện xác định hoặc hệ quy chiếu phù hợp.

**Bước 2: Thiết lập biểu thức / Phương trình liên hệ**
- Vận dụng định luật, định lí hoặc công thức trọng tâm của bài học.
- Biến đổi tương đương về dạng chuẩn.

**Bước 3: Tính toán & Lập bảng đối chiếu**
- Thực hiện phép tính cẩn thận, kiểm tra đơn vị và dấu biểu thức.

**Bước 4: Đối chiếu điều kiện & Kết luận**
- So sánh nghiệm với điều kiện ban đầu và chọn đáp án chính xác.`
        : `### Quy trình xử lý dạng bài:
**Bước 1: Phân tích đề bài & Xác định từ khóa trọng tâm**
- Gạch chân yêu cầu cốt lõi, phạm vi dẫn chứng và thể loại văn bản.

**Bước 2: Lập dàn ý & Huy động kiến thức nền**
- Liệt kê các luận điểm chính và dẫn chứng tiêu biểu, sát ngữ cảnh.

**Bước 3: Triển khai đoạn văn / bài viết mạch lạc**
- Kết hợp chặt chẽ giữa lí lẽ sắc bén và dẫn chứng cụ thể.

**Bước 4: Soát lỗi diễn đạt & Đối chiếu tiêu chí chấm điểm**
- Kiểm tra tính liên kết, chính tả và độ bao phủ ý.`;

      const standardTraps = isStem
        ? `- Bỏ sót điều kiện xác định hoặc quên đổi đơn vị trước khi thay số.\n- Nhầm lẫn giữa các đại lượng có ký hiệu gần giống nhau.`
        : `- Diễn xuôi văn bản thay vì phân tích đặc sắc nghệ thuật và nội dung.\n- Thiếu dẫn chứng cụ thể cho luận điểm trọng tâm.`;

      const standardTips = isStem
        ? `- Kiểm tra nhanh bằng tính năng TABLE [Menu 8] hoặc thử giá trị đặc biệt để loại trừ phương án nhiễu.`
        : `- Gạch chân từ khóa yêu cầu đề trong 30 giây đầu và lập dàn ý ngắn trước khi viết.`;

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

  // Save all changes to Textbook Storage + PostgreSQL Content Service (3-tier resilient upsert)
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    try {
      const rawWeight = parseFloat(form.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.05;
      const safeName =
        form.name?.trim() ||
        pattern?.name ||
        pattern?.patternName ||
        (lesson?.name || lesson?.title ? `Dạng 1: Trọng tâm ${lesson.name || lesson.title}` : 'Dạng bài trọng tâm');

      const parsedCleanMethod = parseSolutionMethodSections(form.solutionMethod || '');
      let fullSolutionMethod = (parsedCleanMethod.method || form.solutionMethod || '').trim();

      if (form.sampleProblem?.trim()) {
        const sampleHeading = isStem
          ? '### 📄 Bài toán mẫu áp dụng phương pháp:'
          : '### 📄 Bài mẫu áp dụng phương pháp:';
        fullSolutionMethod = fullSolutionMethod
          ? `${fullSolutionMethod}\n\n${sampleHeading}\n${form.sampleProblem.trim()}`
          : `${sampleHeading}\n${form.sampleProblem.trim()}`;
      }
      if (form.examTraps?.trim()) {
        fullSolutionMethod = fullSolutionMethod
          ? `${fullSolutionMethod}\n\n### ⚠️ Các bẫy đề thi ĐGNL thường gặp:\n${form.examTraps.trim()}`
          : `### ⚠️ Các bẫy đề thi ĐGNL thường gặp:\n${form.examTraps.trim()}`;
      }
      if (form.casioTricks?.trim()) {
        const tipHeading = isStem
          ? '### 💡 Kỹ thuật Casio & Mẹo tư duy nhanh:'
          : '### 💡 Mẹo tư duy & Chiến thuật làm bài:';
        fullSolutionMethod = fullSolutionMethod
          ? `${fullSolutionMethod}\n\n${tipHeading}\n${form.casioTricks.trim()}`
          : `${tipHeading}\n${form.casioTricks.trim()}`;
      }

      const bloomLevelNum = form.level?.includes('L1')
        ? 1
        : form.level?.includes('L3')
        ? 3
        : form.level?.includes('L4') || form.level?.includes('L5') || form.level?.includes('L6')
        ? 4
        : 2;

      // Chế độ biên tập câu hỏi Đề thi (ExamParserStudioView)
      if (mode === 'exam') {
        const examUpdated = {
          ...form,
          name: safeName,
          solutionMethod: fullSolutionMethod,
          weight: `${Math.round(weightVal * 100)}%`
        };
        setSaveSuccessMsg('Đã lưu thành công nội dung câu hỏi đề thi.');
        toast.success('Đã lưu thay đổi câu hỏi đề thi!');
        if (onSaveSuccess) onSaveSuccess(examUpdated);
        setTimeout(() => setSaveSuccessMsg(''), 3200);
        return;
      }

      const validSampleQId = isValidGuid(form.sampleQuestion?.questionId)
        ? form.sampleQuestion.questionId.trim()
        : null;
      const validPrereqIds = (pattern?.prerequisiteIds || []).filter(isValidGuid);

      const payload = {
        name: safeName,
        weight: weightVal,
        theoryRecap: form.theoryRecap || '',
        solutionMethod: fullSolutionMethod,
        videoUrl: form.videoUrl?.trim() || null,
        durationSeconds: parseInt(form.durationSeconds, 10) || 600,
        prerequisiteSkillIds: validPrereqIds,
        sampleQuestion: form.sampleQuestion?.contentLatex?.trim()
          ? {
              questionId: validSampleQId,
              difficultyLevel: parseInt(form.sampleQuestion.difficultyLevel, 10) || bloomLevelNum,
              contentLatex: form.sampleQuestion.contentLatex.trim(),
              optionA: form.sampleQuestion.optionA || '',
              optionB: form.sampleQuestion.optionB || '',
              optionC: form.sampleQuestion.optionC || '',
              optionD: form.sampleQuestion.optionD || '',
              correctOption: form.sampleQuestion.correctOption || 'A',
              explanation: form.sampleQuestion.explanation || ''
            }
          : null
      };

      // Bước 1: Luôn ghi nhận ngay lập tức vào kho lưu trữ SGK bền vững & Studio Overrides (đảm bảo F5 giữ 100%)
      saveStudioPatternToTextbookStorage({
        domain,
        chapter,
        lesson,
        pattern,
        updatedFields: {
          patternId: form.patternId,
          name: safeName,
          weight: `${Math.round(weightVal * 100)}%`,
          level: form.level,
          bloomLevel: bloomLevelNum,
          theoryRecap: form.theoryRecap || '',
          solutionMethod: fullSolutionMethod,
          examTraps: form.examTraps || '',
          casioTricks: form.casioTricks || '',
          videoUrl: payload.videoUrl,
          durationSeconds: payload.durationSeconds,
          sampleQuestion: payload.sampleQuestion,
          forceCreateTextbookEntry: mode === 'textbook'
        }
      });

      // Bước 2: Lưu xuống PostgreSQL Content Service (kèm cơ chế tự động Upsert khi ID chưa phải GUID hoặc chưa có trong bảng Skills)
      let updated = null;
      const currentPatId = String(form.patternId || '').trim();

      if (isValidGuid(currentPatId)) {
        try {
          updated = await contentService.updatePattern(currentPatId, payload);
        } catch (updateErr) {
          // Nếu GUID này chưa tồn tại trong bảng Skills (404 Not Found), tự động chuyển sang Upsert
          console.warn('Pattern GUID chưa tồn tại trong bảng Skills, tự động chuyển sang Upsert:', updateErr?.message);
          updated = await upsertSinglePatternToCurriculumDb({
            domain,
            chapter,
            lesson,
            pattern,
            detectedSubject,
            payload,
            contentService
          });
        }
      } else {
        try {
          updated = await upsertSinglePatternToCurriculumDb({
            domain,
            chapter,
            lesson,
            pattern,
            detectedSubject,
            payload,
            contentService
          });
        } catch (upsertErr) {
          if (mode !== 'textbook') {
            console.warn('Không thể đồng bộ trực tiếp lên Content Service, đã lưu bền vững vào bộ nhớ:', upsertErr?.message);
          }
        }
      }

      const resolvedPatternId =
        (updated?.patternId && isValidGuid(updated.patternId) ? updated.patternId : null) ||
        currentPatId ||
        `STUDIO_${Date.now()}`;

      if (resolvedPatternId !== form.patternId) {
        setForm(prev => ({ ...prev, patternId: resolvedPatternId, name: safeName }));
      }

      // Nếu lấy được GUID thực từ PostgreSQL, cập nhật lại patternId vào kho SGK
      if (isValidGuid(resolvedPatternId)) {
        saveStudioPatternToTextbookStorage({
          domain,
          chapter,
          lesson,
          pattern,
          updatedFields: {
            patternId: resolvedPatternId,
            name: safeName,
            weight: `${Math.round(weightVal * 100)}%`,
            level: form.level,
            bloomLevel: bloomLevelNum,
            theoryRecap: form.theoryRecap || '',
            solutionMethod: fullSolutionMethod,
            examTraps: form.examTraps || '',
            casioTricks: form.casioTricks || '',
            videoUrl: payload.videoUrl,
            durationSeconds: payload.durationSeconds,
            sampleQuestion: payload.sampleQuestion
          }
        });
      }

      const finalOutput = {
        ...form,
        ...(updated || {}),
        patternId: resolvedPatternId,
        name: safeName,
        theoryRecap: form.theoryRecap || '',
        solutionMethod: fullSolutionMethod,
        weight: `${Math.round(weightVal * 100)}%`
      };

      setSaveSuccessMsg('Đã lưu thành công nội dung bài giảng.');
      toast.success('Đã lưu thành công nội dung bài giảng!');
      if (onSaveSuccess) {
        onSaveSuccess(finalOutput);
      }
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Lỗi khi lưu Studio:', err);
      setSaveErrorMsg(err?.response?.data?.message || err.message || 'Không thể lưu vào cơ sở dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const theoryStats = useMemo(() => getReadableStats(form.theoryRecap), [form.theoryRecap]);
  const methodStats = useMemo(() => getReadableStats(form.solutionMethod), [form.solutionMethod]);

  const effectiveTarget = getEffectiveTargetField();

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F6F5F1] text-slate-800 font-sans">
      {/* 1. REFINED ACADEMIC TOP BAR */}
      <header className="h-[54px] bg-white border-b border-[#E7E5DF] px-4 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-2.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F1EFE9] text-slate-700 hover:text-[#1E3A5F] border border-[#E5E3DC] flex items-center gap-1.5 transition-colors shrink-0 text-xs font-medium cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
              <span className="font-medium text-[#2C4C7E] truncate max-w-[140px]">
                {domain?.title || domain?.name || 'Môn học'}
              </span>
              <span className="text-slate-300">/</span>
              <span className="truncate max-w-[180px]">{lesson?.name || lesson?.title || 'Bài học'}</span>
              {pattern?.code && (
                <span className="hidden md:inline px-1.5 py-0.2 rounded bg-[#F4F3EE] text-slate-600 border border-[#E7E5DF] font-mono text-[10px]">
                  {pattern.code}
                </span>
              )}
            </div>
            {form.name && (
              <h1 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                {form.name}
              </h1>
            )}
          </div>
        </div>

        {/* Quiet Scholarly Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {headerActions}

          <button
            type="button"
            onClick={() => {
              setIsPreviewOpen(prev => {
                const next = !prev;
                if (next && typeof window !== 'undefined' && window.innerWidth < 1536) {
                  setIsStemPanelOpen(false);
                }
                return next;
              });
            }}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPreviewOpen
                ? 'bg-[#EEF2F7] border-[#CFD9E8] text-[#1E3A5F]'
                : 'bg-white hover:bg-[#FAF9F6] border-[#E5E3DC] text-slate-600 hover:text-slate-900'
            }`}
            title="Bật/tắt khung xem thử học sinh"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Xem thử</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStemPanelOpen(prev => !prev)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isStemPanelOpen
                ? 'bg-[#EEF2F7] border-[#CFD9E8] text-[#1E3A5F]'
                : 'bg-white hover:bg-[#FAF9F6] border-[#E5E3DC] text-slate-600 hover:text-slate-900'
            }`}
            title="Mở bảng mô hình STEM, bảng & biểu đồ"
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mô hình STEM</span>
          </button>

          <button
            type="button"
            disabled={isAiAnalyzing}
            onClick={handleAIApplyStandardMethod}
            className="h-8 px-2.5 rounded-lg bg-[#FAF9F6] hover:bg-[#EEF2F7] text-[#1E3A5F] border border-[#E5E3DC] hover:border-[#CFD9E8] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="AI gợi ý chuẩn hóa bài giảng"
          >
            {isAiAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C4C7E]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#2C4C7E]" />
            )}
            <span className="hidden lg:inline">AI Gợi ý</span>
          </button>

          {isTeacher ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAll}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                title="Lưu bản nháp cá nhân"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-slate-600" />}
                <span>Lưu bản nháp</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAll}
                className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                title="Gửi bài soạn lên Giám đốc Học thuật phê duyệt xuất bản toàn hệ thống"
              >
                <span>Gửi duyệt (PENDING_REVIEW)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              className="h-8 px-3.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Đang lưu...' : 'Lưu & Phê Duyệt'}</span>
            </button>
          )}
        </div>
      </header>

      {/* MAKER MODE BANNER CHO ROLE TEACHER */}
      {isTeacher && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              <strong>Chế độ Soạn thảo (Maker):</strong> Giảng viên biên soạn dạng bài và gửi duyệt lên Giám đốc Học thuật. Bản lưu giữ trạng thái Chờ duyệt (PENDING_REVIEW).
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-black text-[11px] shrink-0">
            Chờ duyệt (PENDING_REVIEW)
          </span>
        </div>
      )}

      {/* 2. EDITORIAL UNDERLINE SECTION NAVIGATION BAR */}
      <nav className="bg-white border-b border-[#ECEAE4] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'theory', label: 'Lý thuyết', icon: BookOpen },
            { id: 'method', label: 'Phương pháp', icon: Compass },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'questions', label: `Câu hỏi (${questionsList.length || 1})`, icon: FileText },
            { id: 'settings', label: 'Cài đặt', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSection(tab.id);
                  if (tab.id === 'theory') setActiveFormulaTarget('theoryRecap');
                  else if (tab.id === 'method') setActiveFormulaTarget('solutionMethod');
                  else if (tab.id === 'questions') setActiveFormulaTarget('sampleQuestion');
                }}
                className={`relative px-3 py-2.5 text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#1E3A5F] font-semibold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1E3A5F]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute left-2 right-2 bottom-0 h-[2px] bg-[#1E3A5F] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#ECEAE4] text-slate-600 font-medium">
            {form.level}
          </span>
          <span>Trọng số {form.weight}%</span>
        </div>
      </nav>

      {/* 3. MAIN 3-COLUMN STUDIO BODY (2 cột bên tự giãn khớp 100% chiều cao khung nội dung giữa) */}
      <div className="flex-1 flex items-stretch relative">
        {/* LEFT SIDEBAR: SUBJECT -> KÝ HIỆU | CÔNG THỨC */}
        <div className={`relative shrink-0 ${isPaletteCollapsed ? 'w-11' : 'w-64 sm:w-[272px]'}`}>
          <div className="absolute inset-0">
            <HierarchicalMathPalette
              initialSubject={detectedSubject}
              isCollapsed={isPaletteCollapsed}
              onToggleCollapse={() => setIsPaletteCollapsed(prev => !prev)}
              activeTarget={effectiveTarget}
              onInsertSnippet={(target, snippet) => handleInsertMath(target, snippet, false)}
            />
          </div>
        </div>

        {/* CENTER DOCUMENT WORKSPACE */}
        <main className="flex-1 min-w-0 px-4 sm:px-7 py-5 space-y-4">
          {/* Calm Status Banners */}
          {aiIdentificationResult && (
            <div className="max-w-4xl mx-auto px-4 py-2.5 rounded-xl bg-[#EEF2F7] border border-[#CFD9E8] text-[#1E3A5F] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-4 h-4 text-[#2C4C7E] shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="font-semibold">{aiIdentificationResult.classification}</span>
                  {aiIdentificationResult.core_skill && (
                    <span className="text-slate-600"> · {aiIdentificationResult.core_skill}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiIdentificationResult(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="max-w-4xl mx-auto px-4 py-2.5 rounded-xl bg-[#F2F9F5] border border-[#C7E3D2] text-xs font-medium text-[#1E6B47] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="max-w-4xl mx-auto px-4 py-2.5 rounded-xl bg-[#FFF6F6] border border-[#F2D5D5] text-xs font-medium text-[#8F2D2D] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          {/* UNIFIED DOCUMENT (+ OPTIONAL SIDE PREVIEW WHEN TOGGLED) */}
          <div className={isPreviewOpen ? 'grid grid-cols-1 xl:grid-cols-12 gap-5 items-start' : 'max-w-4xl mx-auto'}>
            {/* AUTHORING SHEET COLUMN */}
            <div className={isPreviewOpen ? 'xl:col-span-7 space-y-5' : 'space-y-5'}>
              {/* ============ SECTION 1: LÝ THUYẾT ============ */}
              {activeSection === 'theory' && (
                <article
                  onPaste={(e) => handlePasteEvent(e, 'theoryRecap')}
                  onClick={() => setActiveFormulaTarget('theoryRecap')}
                  className="bg-white rounded-2xl border border-[#E7E5DF] shadow-[0_2px_16px_rgba(15,23,42,0.04)] flex flex-col"
                >
                  <WordFormattingRibbon
                    stickyTopClass={embedded ? 'top-14 sm:top-16' : 'top-0'}
                    onExecFormat={(cmd, val) => handleExecFormat('theoryRecap', cmd, val)}
                    onInsertTable={() => handleInsertTable(3, 3, null, 'theoryRecap')}
                    onInsertChart={() => handleInsertChart('bar', null, 'theoryRecap')}
                    onOpenFormulaBuilder={() => handleOpenMathKeyboard('theoryRecap')}
                    onTriggerUpload={() => handleTriggerUpload('theoryRecap')}
                    extraActions={
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          theoryCanvasRef.current?.insertHtml(
                            '<h3>Ví dụ minh họa</h3><ul><li><strong>Đề bài:</strong>&nbsp;</li><li><strong>Lời giải:</strong>&nbsp;</li></ul>'
                          );
                        }}
                        className="h-7 px-2 rounded-lg text-[11.5px] font-medium text-[#1E3A5F] bg-[#EEF2F7] hover:bg-[#E1E8F2] transition-colors flex items-center gap-1 cursor-pointer ml-0.5"
                        title="Chèn khung ví dụ minh họa"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ví dụ</span>
                      </button>
                    }
                  />

                  {/* Academic Paper Surface */}
                  <div className="px-6 sm:px-10 py-7 min-h-[540px] flex-1">
                    <div className="pb-4 mb-5 border-b border-[#F0EFE9]">
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2C4C7E]/80 mb-1">
                        Lý thuyết trọng tâm
                      </div>
                      <div className="text-base font-semibold text-slate-900 leading-snug">
                        {form.name || lesson?.name || 'Nội dung bài học'}
                      </div>
                    </div>

                    <WordStyleFormulaCanvas
                      ref={theoryCanvasRef}
                      content={form.theoryRecap}
                      onChange={(val) => setForm(prev => ({ ...prev, theoryRecap: val }))}
                      isStem={isStem}
                      onEditMathGraph={(tag) => handleOpenMathWorkbench('2d_function', 'theoryRecap', tag)}
                      onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'theoryRecap')}
                      placeholder="Bắt đầu soạn thảo lý thuyết... Bôi đen văn bản để định dạng, nhấp công thức để chỉnh sửa, hoặc dán ảnh trực tiếp (Ctrl+V)."
                    />
                  </div>

                  {/* Subtle Editorial Footer */}
                  <div className="px-6 sm:px-10 py-2.5 border-t border-[#F0EFE9] bg-[#FDFCFA] rounded-b-2xl flex items-center justify-between text-[11px] text-slate-400">
                    <span>Nhấp vào công thức để chỉnh sửa trực quan · Enter để xuống dòng</span>
                    <span className="tabular-nums">
                      {theoryStats.words} từ · {theoryStats.chars} ký tự
                    </span>
                  </div>
                </article>
              )}

              {/* ============ SECTION 2: PHƯƠNG PHÁP ============ */}
              {activeSection === 'method' && (
                <div className="space-y-5">
                  <article
                    onPaste={(e) => handlePasteEvent(e, 'solutionMethod')}
                    onClick={() => setActiveFormulaTarget('solutionMethod')}
                    className="bg-white rounded-2xl border border-[#E7E5DF] shadow-[0_2px_16px_rgba(15,23,42,0.04)] flex flex-col"
                  >
                    <WordFormattingRibbon
                      stickyTopClass={embedded ? 'top-14 sm:top-16' : 'top-0'}
                      onExecFormat={(cmd, val) => handleExecFormat('solutionMethod', cmd, val)}
                      onInsertTable={() => handleInsertTable(3, 3, null, 'solutionMethod')}
                      onInsertChart={() => handleInsertChart('bar', null, 'solutionMethod')}
                      onOpenFormulaBuilder={() => handleOpenMathKeyboard('solutionMethod')}
                      onTriggerUpload={() => handleTriggerUpload('solutionMethod')}
                      extraActions={
                        <>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const stepCount = (form.solutionMethod?.match(/Bước \d+/gi) || []).length + 1;
                              methodCanvasRef.current?.insertHtml(`<p><strong>Bước ${stepCount}:</strong>&nbsp;</p>`);
                            }}
                            className="h-7 px-2 rounded-lg text-[11.5px] font-medium text-[#1E3A5F] bg-[#EEF2F7] hover:bg-[#E1E8F2] transition-colors flex items-center gap-1 cursor-pointer ml-0.5"
                            title="Thêm bước giải mới"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Bước</span>
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleAIApplyStandardMethod}
                            className="h-7 px-2 rounded-lg text-[11.5px] font-medium text-[#7A5612] bg-[#FDF8EC] hover:bg-[#F7EED7] border border-[#ECE2C8] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Tạo khung phương pháp 4 bước"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span className="hidden sm:inline">Mẫu 4 bước</span>
                          </button>
                        </>
                      }
                    />

                    <div className="px-6 sm:px-10 py-7 min-h-[380px] flex-1">
                      <div className="pb-4 mb-5 border-b border-[#F0EFE9]">
                        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2C4C7E]/80 mb-1">
                          Phương pháp giải chi tiết
                        </div>
                        <div className="text-base font-semibold text-slate-900 leading-snug">
                          {form.name || 'Quy trình tư duy & Các bước giải'}
                        </div>
                      </div>

                      <WordStyleFormulaCanvas
                        ref={methodCanvasRef}
                        content={form.solutionMethod}
                        onChange={(val) => setForm(prev => ({ ...prev, solutionMethod: val }))}
                        isStem={isStem}
                        onEditMathGraph={(tag) => handleOpenMathWorkbench('2d_function', 'solutionMethod', tag)}
                        onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'solutionMethod')}
                        placeholder="Trình bày quy trình giải từng bước, công thức vận dụng và ví dụ minh họa..."
                      />
                    </div>

                    <div className="px-6 sm:px-10 py-2.5 border-t border-[#F0EFE9] bg-[#FDFCFA] rounded-b-2xl flex items-center justify-between text-[11px] text-slate-400">
                      <span>Trình bày mạch lạc từng bước để học sinh dễ theo dõi</span>
                      <span className="tabular-nums">
                        {methodStats.words} từ · {methodStats.chars} ký tự
                      </span>
                    </div>
                  </article>

                  {/* Soft Academic Callout Cards: Bẫy đề thi & Mẹo giải nhanh */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveFormulaTarget('examTraps')}
                      onPaste={(e) => handlePasteEvent(e, 'examTraps')}
                      className="bg-white rounded-2xl border border-[#F0D9D9] p-5 space-y-3 shadow-[0_1px_8px_rgba(15,23,42,0.03)]"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F7E8E8]">
                        <span className="text-xs font-semibold text-[#8F2D2D] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Bẫy đề thi cần tránh</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => examTrapsCanvasRef.current?.execFormat('insertUnorderedList')}
                            className="px-2 py-1 rounded-md bg-[#FFF8F8] hover:bg-[#FBECEC] text-[#8F2D2D] text-[11px] font-medium border border-[#F2D5D5] cursor-pointer"
                          >
                            + Ý
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleOpenFormulaBuilder('fraction', 'examTraps')}
                            className="px-2 py-1 rounded-md bg-[#FAF9F6] hover:bg-[#EEF2F7] text-slate-600 text-[11px] font-medium border border-[#E5E3DC] cursor-pointer"
                          >
                            Công thức
                          </button>
                        </div>
                      </div>
                      <WordStyleFormulaCanvas
                        ref={examTrapsCanvasRef}
                        compact
                        content={form.examTraps}
                        onChange={(val) => setForm(prev => ({ ...prev, examTraps: val }))}
                        onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'examTraps')}
                        placeholder="Ghi chú các lỗi sai học sinh thường mắc phải..."
                      />
                    </div>

                    <div
                      onClick={() => setActiveFormulaTarget('casioTricks')}
                      onPaste={(e) => handlePasteEvent(e, 'casioTricks')}
                      className="bg-white rounded-2xl border border-[#DCE4F0] p-5 space-y-3 shadow-[0_1px_8px_rgba(15,23,42,0.03)]"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EDF1F7]">
                        <span className="text-xs font-semibold text-[#1E3A5F] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#2C4C7E]" />
                          <span>{isStem ? 'Mẹo Casio & Giải nhanh' : 'Mẹo tư duy & Làm bài'}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => casioTricksCanvasRef.current?.execFormat('insertUnorderedList')}
                            className="px-2 py-1 rounded-md bg-[#EEF2F7] hover:bg-[#E1E8F2] text-[#1E3A5F] text-[11px] font-medium border border-[#CFD9E8] cursor-pointer"
                          >
                            + Mẹo
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleOpenFormulaBuilder('fraction', 'casioTricks')}
                            className="px-2 py-1 rounded-md bg-[#FAF9F6] hover:bg-[#EEF2F7] text-slate-600 text-[11px] font-medium border border-[#E5E3DC] cursor-pointer"
                          >
                            Công thức
                          </button>
                        </div>
                      </div>
                      <WordStyleFormulaCanvas
                        ref={casioTricksCanvasRef}
                        compact
                        content={form.casioTricks}
                        onChange={(val) => setForm(prev => ({ ...prev, casioTricks: val }))}
                        onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'casioTricks')}
                        placeholder={isStem ? 'Nhập mẹo bấm máy hoặc ước lượng nhanh...' : 'Nhập chiến thuật xử lý đề nhanh...'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============ SECTION 3: VIDEO ============ */}
              {activeSection === 'video' && (
                <div className="bg-white rounded-2xl border border-[#E7E5DF] p-6 sm:p-8 space-y-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
                  <div className="pb-3 border-b border-[#F0EFE9]">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2C4C7E]/80 mb-1">
                      Video bài giảng
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Liên kết video & mốc thời gian học tập</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Đường dẫn video</label>
                      <input
                        type="text"
                        value={form.videoUrl}
                        onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25 focus:border-[#2C4C7E]/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Thời lượng (giây)</label>
                      <input
                        type="number"
                        min="60"
                        step="60"
                        value={form.durationSeconds}
                        onChange={(e) => setForm(prev => ({ ...prev, durationSeconds: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      <span>Xem trước video</span>
                      <span className="text-[11px] text-[#2C4C7E] font-medium">
                        {Math.max(1, Math.round((parseInt(form.durationSeconds, 10) || 0) / 60))} phút
                      </span>
                    </div>

                    {form.videoUrl ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E5E3DC] bg-slate-950">
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
                            <PlayCircle className="w-10 h-10 text-slate-300 mx-auto" />
                            <div className="truncate">{form.videoUrl}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-[#DCD9D0] bg-[#FAF9F6] rounded-xl text-center text-slate-400 text-xs space-y-1.5">
                        <PlayCircle className="w-7 h-7 text-slate-300 mx-auto" />
                        <div>Dán liên kết YouTube hoặc video bài giảng để xem trước.</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[#F0EFE9]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">Mốc thời gian bài giảng</label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            videoTimestamps: [...prev.videoTimestamps, { time: '10:00', title: 'Mốc mới' }]
                          }))
                        }
                        className="text-xs font-medium text-[#1E3A5F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm mốc</span>
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
                                updated[tIdx] = { ...updated[tIdx], time: val };
                                return { ...prev, videoTimestamps: updated };
                              });
                            }}
                            placeholder="00:00"
                            className="w-20 px-2.5 py-1.5 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-mono text-slate-800 text-center"
                          />
                          <input
                            type="text"
                            value={ts.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm(prev => {
                                const updated = [...prev.videoTimestamps];
                                updated[tIdx] = { ...updated[tIdx], title: val };
                                return { ...prev, videoTimestamps: updated };
                              });
                            }}
                            placeholder="Nội dung mục..."
                            className="flex-1 px-3 py-1.5 rounded-lg border border-[#E5E3DC] bg-white text-xs text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm(prev => ({
                                ...prev,
                                videoTimestamps: prev.videoTimestamps.filter((_, idx) => idx !== tIdx)
                              }))
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============ SECTION 4: CÂU HỎI ============ */}
              {activeSection === 'questions' && (
                <div className="bg-white rounded-2xl border border-[#E7E5DF] p-6 sm:p-8 space-y-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F0EFE9]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2C4C7E]/80 mb-0.5">
                        Ngân hàng câu hỏi
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        Câu hỏi mẫu & danh sách luyện tập ({questionsList.length})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const effectiveSkillId = form.patternId || pattern?.patternId;
                          if (!effectiveSkillId) {
                            toast.warning('Vui lòng bấm "Lưu" trước khi sinh câu hỏi bằng AI.');
                            return;
                          }
                          setAiQuestionModalOpen(true);
                        }}
                        className="h-8 px-3 rounded-lg bg-[#EEF2F7] hover:bg-[#E1E8F2] text-[#1E3A5F] border border-[#CFD9E8] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#2C4C7E]" />
                        <span>AI Sinh câu hỏi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewQuestionModalOpen(true)}
                        className="h-8 px-3 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm câu hỏi</span>
                      </button>
                    </div>
                  </div>

                  {/* Câu hỏi mẫu */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E7E5DF] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1E3A5F] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Câu hỏi mẫu</span>
                      </span>
                      <span className="text-[11px] font-semibold text-[#1E6B47] bg-[#F2F9F5] border border-[#C7E3D2] px-2.5 py-0.5 rounded-full">
                        Đáp án đúng: {form.sampleQuestion?.correctOption || 'A'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 block">Đề bài</label>
                      <div
                        onClick={() => setActiveFormulaTarget('sampleQuestion')}
                        onPaste={(e) => handlePasteEvent(e, 'sampleQuestion')}
                        className="bg-white rounded-xl border border-[#E5E3DC] p-3"
                      >
                        <WordStyleFormulaCanvas
                          ref={sampleQuestionCanvasRef}
                          compact
                          content={form.sampleQuestion?.contentLatex || ''}
                          onChange={(val) =>
                            setForm(prev => ({
                              ...prev,
                              sampleQuestion: { ...prev.sampleQuestion, contentLatex: val }
                            }))
                          }
                          onEditMathGraph={(tag) => handleOpenMathWorkbench('2d_function', 'sampleQuestion', tag)}
                          onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'sampleQuestion')}
                          placeholder="Nhập nội dung đề bài mẫu..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const fieldName = `option${optKey}`;
                        const isCorrect = form.sampleQuestion?.correctOption === optKey;
                        return (
                          <div
                            key={optKey}
                            className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-colors ${
                              isCorrect
                                ? 'bg-[#F2F9F5] border-[#A7D7BC]'
                                : 'bg-white border-[#E5E3DC]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="sampleCorrectRadio"
                              checked={isCorrect}
                              onChange={() =>
                                setForm(prev => ({
                                  ...prev,
                                  sampleQuestion: { ...prev.sampleQuestion, correctOption: optKey }
                                }))
                              }
                              className="w-3.5 h-3.5 accent-[#1E6B47] cursor-pointer shrink-0"
                            />
                            <span className="font-semibold text-xs text-slate-700 shrink-0">{optKey}.</span>
                            <div className="flex-1 min-w-0">
                              <WordStyleFormulaCanvas
                                singleLine
                                content={form.sampleQuestion?.[fieldName] || ''}
                                onChange={(val) =>
                                  setForm(prev => ({
                                    ...prev,
                                    sampleQuestion: { ...prev.sampleQuestion, [fieldName]: val }
                                  }))
                                }
                                placeholder={`Phương án ${optKey}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 block">Lời giải chi tiết</label>
                      <div
                        onClick={() => setActiveFormulaTarget('sampleExplanation')}
                        onPaste={(e) => handlePasteEvent(e, 'sampleExplanation')}
                        className="bg-white rounded-xl border border-[#E5E3DC] p-3"
                      >
                        <WordStyleFormulaCanvas
                          ref={sampleExplanationCanvasRef}
                          compact
                          content={form.sampleQuestion?.explanation || ''}
                          onChange={(val) =>
                            setForm(prev => ({
                              ...prev,
                              sampleQuestion: { ...prev.sampleQuestion, explanation: val }
                            }))
                          }
                          onEditMathGraph={(tag) => handleOpenMathWorkbench('2d_function', 'sampleExplanation', tag)}
                          onOpenAdvancedModal={() => handleOpenFormulaBuilder('fraction', 'sampleExplanation')}
                          placeholder="Trình bày lời giải chi tiết..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Danh sách câu hỏi bổ sung */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Danh sách câu hỏi bổ sung ({questionsList.length})</span>
                      {loadingQuestions && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C4C7E]" />}
                    </div>

                    {questionsList.length === 0 ? (
                      <div className="p-8 border border-dashed border-[#DCD9D0] bg-[#FAF9F6] rounded-xl text-center text-slate-500 text-xs space-y-3">
                        <div>Chưa có câu hỏi bổ sung cho dạng bài này.</div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const effectiveSkillId = form.patternId || pattern?.patternId;
                              if (!effectiveSkillId) {
                                toast.warning('Vui lòng bấm "Lưu" trước khi sinh câu hỏi bằng AI.');
                                return;
                              }
                              setAiQuestionModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#EEF2F7] hover:bg-[#E1E8F2] text-[#1E3A5F] border border-[#CFD9E8] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Sinh câu hỏi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewQuestionModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F3F2EC] border border-[#E5E3DC] text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm thủ công</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questionsList.map((q, idx) => {
                          const optA = q.optionA || q.options?.find(o => (o.key || o.optionKey) === 'A')?.content || '';
                          const optB = q.optionB || q.options?.find(o => (o.key || o.optionKey) === 'B')?.content || '';
                          const optC = q.optionC || q.options?.find(o => (o.key || o.optionKey) === 'C')?.content || '';
                          const optD = q.optionD || q.options?.find(o => (o.key || o.optionKey) === 'D')?.content || '';
                          const hasOptions = Boolean(optA || optB || optC || optD);

                          return (
                            <div
                              key={q.questionId || idx}
                              className="p-4 rounded-xl border border-[#E7E5DF] bg-white space-y-3"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-[#F0EFE9]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-[#1E3A5F] bg-[#EEF2F7] px-2 py-0.5 rounded-md text-xs">
                                    Câu {idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#F4F3EE] text-slate-600 text-[10.5px] font-medium">
                                    L{q.difficultyLevel || 2}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#F2F9F5] text-[#1E6B47] border border-[#C7E3D2] text-[10.5px] font-semibold">
                                    Đáp án {q.correctOption || 'A'}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (deletingQId !== q.questionId) {
                                      setDeletingQId(q.questionId);
                                      toast.warning('Bấm lại để xác nhận xóa câu hỏi.');
                                      setTimeout(() => setDeletingQId(null), 5000);
                                      return;
                                    }
                                    try {
                                      if (isValidGuid(q.questionId)) {
                                        await contentService.deleteQuestion(q.questionId);
                                      }
                                      setQuestionsList(prev => prev.filter(item => item.questionId !== q.questionId));
                                      setDeletingQId(null);
                                      toast.success('Đã xóa câu hỏi.');
                                    } catch (e) {
                                      toast.error('Không thể xóa câu hỏi: ' + e.message);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    deletingQId === q.questionId
                                      ? 'bg-rose-600 text-white'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title={deletingQId === q.questionId ? 'Xác nhận xóa' : 'Xóa câu hỏi'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-xs text-slate-800 leading-relaxed overflow-x-auto">
                                <MathText text={q.contentLatex} />
                              </div>

                              {hasOptions && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {[
                                    { key: 'A', text: optA },
                                    { key: 'B', text: optB },
                                    { key: 'C', text: optC },
                                    { key: 'D', text: optD }
                                  ].map((opt) => {
                                    if (!opt.text) return null;
                                    const isCorrect = (q.correctOption || '').toUpperCase() === opt.key;
                                    return (
                                      <div
                                        key={opt.key}
                                        className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                                          isCorrect
                                            ? 'bg-[#F2F9F5] border-[#C7E3D2] text-[#1E6B47] font-medium'
                                            : 'bg-[#FAF9F6] border-[#EAE8E1] text-slate-700'
                                        }`}
                                      >
                                        <span
                                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                            isCorrect ? 'bg-[#1E6B47] text-white' : 'bg-[#EAE8E1] text-slate-600'
                                          }`}
                                        >
                                          {opt.key}
                                        </span>
                                        <div className="flex-1 break-words overflow-x-auto">
                                          <MathText text={cleanOptionOrText(opt.text)} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EAE8E1] text-xs text-slate-700 space-y-1">
                                  <div className="font-semibold text-slate-800">Lời giải</div>
                                  <div className="leading-relaxed break-words whitespace-pre-line overflow-x-auto">
                                    <MathText text={q.explanation} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============ SECTION 5: CÀI ĐẶT ============ */}
              {activeSection === 'settings' && (
                <div className="bg-white rounded-2xl border border-[#E7E5DF] p-6 sm:p-8 space-y-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
                  <div className="pb-3 border-b border-[#F0EFE9]">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2C4C7E]/80 mb-1">
                      Thiết lập học liệu
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Thông tin nhận diện & mức độ nhận thức</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Tên dạng bài</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Trọng số (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.weight}
                        onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700">Mức độ Bloom</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { value: 'Nhớ / Nhận biết (L1)', label: 'L1 · Nhận biết' },
                        { value: 'Hiểu / Thông hiểu (L2)', label: 'L2 · Thông hiểu' },
                        { value: 'Vận dụng (L3)', label: 'L3 · Vận dụng' },
                        { value: 'Phân tích (L4)', label: 'L4 · Phân tích' },
                        { value: 'Đánh giá (L5)', label: 'L5 · Đánh giá' },
                        { value: 'Sáng tạo (L6)', label: 'L6 · Sáng tạo' }
                      ].map((lvl) => {
                        const isSelected = normalizeBloomLevel(form.level) === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, level: lvl.value }))}
                            className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                                : 'bg-[#FAF9F6] border-[#E7E5DF] text-slate-700 hover:bg-[#EEF2F7]'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OPTIONAL QUIET STUDENT PREVIEW COLUMN (ONLY SHOWN WHEN USER CLICKS "XEM THỬ") */}
            {isPreviewOpen && (
              <aside className="xl:col-span-5">
                <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-[0_2px_16px_rgba(15,23,42,0.04)] p-6 space-y-6 sticky top-0">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EFE9]">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Bản xem thử học sinh
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">
                        {form.name || 'Chưa đặt tên dạng bài'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-[#F3F2EC] cursor-pointer"
                      title="Đóng xem thử"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2C4C7E]">
                      1. Lý thuyết
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE8E1] text-xs text-slate-800 leading-relaxed">
                      <MathText text={form.theoryRecap || 'Chưa có nội dung lý thuyết.'} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2C4C7E]">
                      2. Phương pháp giải
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE8E1] text-xs text-slate-800 leading-relaxed space-y-2.5">
                      <MathText text={form.solutionMethod || 'Chưa có phương pháp giải.'} />
                      {form.examTraps && (
                        <div className="p-3 rounded-lg bg-[#FFF8F8] border border-[#F2D5D5] text-[#8F2D2D] text-xs">
                          <div className="font-semibold mb-1">Bẫy đề thi</div>
                          <MathText text={form.examTraps} />
                        </div>
                      )}
                      {form.casioTricks && (
                        <div className="p-3 rounded-lg bg-[#EEF2F7] border border-[#CFD9E8] text-[#1E3A5F] text-xs">
                          <div className="font-semibold mb-1">{isStem ? 'Mẹo Casio' : 'Mẹo làm bài'}</div>
                          <MathText text={form.casioTricks} />
                        </div>
                      )}
                    </div>
                  </div>

                  {form.sampleQuestion?.contentLatex && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2C4C7E]">
                        3. Câu hỏi mẫu
                      </div>
                      <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE8E1] text-xs space-y-2.5">
                        <div className="font-medium text-slate-900">
                          <MathText text={form.sampleQuestion.contentLatex} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <div
                              key={opt}
                              className={`p-2 rounded-lg border text-xs ${
                                form.sampleQuestion.correctOption === opt
                                  ? 'bg-[#F2F9F5] border-[#C7E3D2] text-[#1E6B47] font-medium'
                                  : 'bg-white border-[#EAE8E1] text-slate-700'
                              }`}
                            >
                              <MathText text={`${opt}. ${form.sampleQuestion[`option${opt}`]}`} />
                            </div>
                          ))}
                        </div>
                        {form.sampleQuestion.explanation && (
                          <div className="p-2.5 rounded-lg bg-white border border-[#EAE8E1] text-slate-700">
                            <strong className="text-slate-800">Lời giải: </strong>
                            <MathText text={form.sampleQuestion.explanation} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </main>

        {/* RIGHT DOCKABLE STEM MODELS PANEL */}
        {isStemPanelOpen && (
          <div className="relative shrink-0 w-[268px]">
            <div className="absolute inset-0">
              <StemModelsPanel
                isOpen={isStemPanelOpen}
                onClose={() => setIsStemPanelOpen(false)}
                onInsertTable={(r, c, preset) => handleInsertTable(r, c, preset, effectiveTarget)}
                onInsertChart={(type, preset) => handleInsertChart(type, preset, effectiveTarget)}
                onOpenFormulaBuilder={(tplId) => handleOpenFormulaBuilder(tplId, effectiveTarget)}
                onOpenMathWorkbench={(engine) => handleOpenMathWorkbench(engine, effectiveTarget)}
                onTriggerUpload={() => handleTriggerUpload(effectiveTarget)}
                onOpenImageModal={() => setImageModalTarget(effectiveTarget)}
              />
            </div>
          </div>
        )}
      </div>

      {/* IMAGE URL / SAMPLE MODAL */}
      {imageModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E7E5DF] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-[#ECEAE4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2C4C7E]" />
                <h3 className="text-sm font-semibold text-slate-900">Chèn hình ảnh</h3>
              </div>
              <button
                type="button"
                onClick={() => setImageModalTarget(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F3F2EC] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Đường dẫn hình ảnh (URL)</label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Hình minh họa mẫu
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_DIAGRAM_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertImage(imageModalTarget, img.url, img.label)}
                      className="p-2 rounded-xl border border-[#E7E5DF] hover:border-[#2C4C7E]/50 bg-[#FAF9F6] hover:bg-[#EEF2F7]/50 text-left transition-all space-y-1.5 cursor-pointer"
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-700 truncate">{img.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = imageModalTarget;
                  setImageModalTarget(null);
                  handleTriggerUpload(target);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E5E3DC] bg-white hover:bg-[#EEF2F7] text-xs font-medium text-[#1E3A5F] flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải từ máy</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E5E3DC] bg-white text-xs font-medium text-slate-600 hover:bg-[#F3F2EC] cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={!customImageUrl.trim()}
                  onClick={() => handleInsertImage(imageModalTarget, customImageUrl.trim(), 'Hình minh họa')}
                  className="px-4 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Chèn ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW QUESTION MODAL */}
      {newQuestionModalOpen && (
        <NewQuestionDialog
          skillId={form.patternId || pattern?.patternId}
          patternInfo={{
            patternName: form.name || pattern?.name || pattern?.patternName || '',
            lessonName: lesson?.name || '',
            domainName: domain?.name || domain?.title || '',
            theoryRecap: form.theoryRecap || '',
            solutionMethod: form.solutionMethod || '',
            difficultyLevel: form.level?.includes('L1') ? 1 : form.level?.includes('L3') ? 3 : form.level?.includes('L4') ? 4 : 2,
            existingQuestions: [
              form.sampleQuestion?.contentLatex,
              ...questionsList.map(q => q.contentLatex)
            ].filter(Boolean)
          }}
          onClose={() => setNewQuestionModalOpen(false)}
          onCreated={(newQ) => {
            setQuestionsList(prev => [newQ, ...prev]);
            setNewQuestionModalOpen(false);
          }}
          onOpenWorkbench={(cb, existingText) => {
            let initialTag = '';
            if (existingText) {
              const match = existingText.match(/(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\])/i);
              if (match) initialTag = match[0];
            }
            setMathWorkbenchInitialTag(initialTag);
            setCustomWorkbenchCallback(() => cb);
            setMathWorkbenchOpen(true);
          }}
        />
      )}

      {/* AI QUESTION GENERATOR MODAL */}
      {aiQuestionModalOpen && (
        <AiQuestionGeneratorModal
          skillId={form.patternId || pattern?.patternId}
          patternInfo={{
            patternName: form.name || pattern?.name || pattern?.patternName || '',
            lessonName: lesson?.name || '',
            domainName: domain?.name || domain?.title || '',
            theoryRecap: form.theoryRecap || '',
            solutionMethod: form.solutionMethod || '',
            difficultyLevel: form.level?.includes('L1') ? 1 : form.level?.includes('L3') ? 3 : form.level?.includes('L4') ? 4 : 2,
            existingQuestions: [
              form.sampleQuestion?.contentLatex,
              ...questionsList.map(q => q.contentLatex)
            ].filter(Boolean)
          }}
          onClose={() => setAiQuestionModalOpen(false)}
          onSuccessBatch={(createdQuestions) => {
            setQuestionsList(prev => [...createdQuestions, ...prev]);
            setAiQuestionModalOpen(false);
          }}
        />
      )}

      {/* INTERACTIVE FORMULA BUILDER MODAL */}
      {formulaBuilderOpen && (
        <InteractiveFormulaBuilderModal
          isOpen={formulaBuilderOpen}
          initialTemplateId={formulaBuilderTemplate}
          targetField={activeFormulaTarget}
          onClose={() => setFormulaBuilderOpen(false)}
          onInsert={handleInsertMath}
        />
      )}

      {/* INTERACTIVE MATHLAB & 3D GEOMETRY WORKBENCH MODAL */}
      {mathWorkbenchOpen && (
        <InteractiveMathWorkbenchModal
          isOpen={mathWorkbenchOpen}
          initialTab={mathWorkbenchEngine}
          targetField={activeFormulaTarget}
          initialTag={mathWorkbenchInitialTag}
          onClose={() => {
            setMathWorkbenchOpen(false);
            setCustomWorkbenchCallback(null);
            setMathWorkbenchInitialTag('');
          }}
          onInsert={(snippet, field) => {
            if (customWorkbenchCallback) {
              customWorkbenchCallback(snippet);
              setCustomWorkbenchCallback(null);
            } else {
              handleInsertMath(field || activeFormulaTarget, snippet, true);
            }
          }}
        />
      )}

      {/* HIDDEN FILE INPUT FOR IMAGE UPLOAD */}
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

/* ============================================================================
 * SUBCOMPONENT: NEW QUESTION MODAL (PURE VISUAL FORMULA EDITING, ZERO RAW LATEX)
 * ============================================================================ */

function NewQuestionDialog({ skillId, patternInfo, onClose, onCreated, onOpenWorkbench }) {
  const [contentLatex, setContentLatex] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [difficultyLevel, setDifficultyLevel] = useState(patternInfo?.difficultyLevel || 2);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiPrefillQuestion = async () => {
    if (!patternInfo?.patternName) {
      toast.warning('Chưa có thông tin tên Dạng bài để AI tạo câu hỏi.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await aiService.generatePatternQuestions({
        patternName: patternInfo.patternName,
        lessonName: patternInfo.lessonName || '',
        domainName: patternInfo.domainName || '',
        theoryRecap: patternInfo.theoryRecap || '',
        solutionMethod: patternInfo.solutionMethod || '',
        count: 1,
        existingQuestions: patternInfo.existingQuestions || []
      });

      const q = res?.questions?.[0];
      if (q) {
        setContentLatex(q.contentLatex || '');
        setOptionA(q.optionA || '');
        setOptionB(q.optionB || '');
        setOptionC(q.optionC || '');
        setOptionD(q.optionD || '');
        setCorrectOption(q.correctOption || 'A');
        setDifficultyLevel(q.difficultyLevel || patternInfo.difficultyLevel || 2);
        setExplanation(q.explanation || '');
        toast.success('AI đã tự động soạn câu hỏi bám sát dạng bài.');
      } else {
        toast.warning('AI không trả về câu hỏi nào. Vui lòng thử lại.');
      }
    } catch (err) {
      toast.error('Lỗi khi AI sinh câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentLatex.trim()) {
      toast.warning('Vui lòng nhập đề bài câu hỏi.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        skillId,
        difficultyLevel: parseInt(difficultyLevel, 10) || 2,
        contentLatex: contentLatex.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption,
        explanation: explanation.trim()
      };
      let result = null;
      if (isValidGuid(skillId)) {
        try {
          result = await contentService.createQuestion(payload);
        } catch (apiErr) {
          console.warn('Lưu câu hỏi cục bộ khi SkillId chưa đồng bộ CSDL:', apiErr?.message);
        }
      }
      const createdItem = result || { ...payload, questionId: `studio_q_${Date.now()}` };
      toast.success('Đã thêm câu hỏi vào danh sách.');
      if (onCreated) onCreated(createdItem);
    } catch (err) {
      toast.error('Lỗi khi thêm câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E7E5DF] overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-3.5 border-b border-[#ECEAE4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2C4C7E]" />
            <h3 className="text-sm font-semibold text-slate-900">Thêm câu hỏi mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F3F2EC] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Đề bài</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={handleAiPrefillQuestion}
                  className="px-2.5 py-1 rounded-lg bg-[#EEF2F7] hover:bg-[#E1E8F2] text-[#1E3A5F] border border-[#CFD9E8] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>{aiGenerating ? 'Đang soạn...' : 'AI Tự điền'}</span>
                </button>
                {onOpenWorkbench && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenWorkbench((snippet) => {
                        setContentLatex(prev => {
                          const graphRegex = /(\[MATH_GRAPH_3D\][\s\S]*?\[\/MATH_GRAPH_3D\]|\[MATH_GRAPH\][\s\S]*?\[\/MATH_GRAPH\])/i;
                          if (graphRegex.test(prev)) return prev.replace(graphRegex, snippet.trim());
                          return prev ? `${prev}\n\n${snippet}` : snippet;
                        });
                      }, contentLatex);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#EEF2F7] text-slate-700 text-[11px] font-medium border border-[#E5E3DC] flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3 text-[#2C4C7E]" />
                    <span>Đồ thị</span>
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E3DC] bg-white p-3">
              <WordStyleFormulaCanvas
                compact
                content={contentLatex}
                onChange={setContentLatex}
                placeholder="Nhập nội dung đề bài trực tiếp..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const val = opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD;
              const setter = opt === 'A' ? setOptionA : opt === 'B' ? setOptionB : opt === 'C' ? setOptionC : setOptionD;
              return (
                <div
                  key={opt}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                    correctOption === opt ? 'bg-[#F2F9F5] border-[#A7D7BC]' : 'bg-[#FAF9F6] border-[#E5E3DC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="newQuestionRadio"
                    checked={correctOption === opt}
                    onChange={() => setCorrectOption(opt)}
                    className="w-3.5 h-3.5 accent-[#1E6B47] cursor-pointer shrink-0"
                  />
                  <span className="font-semibold text-xs text-slate-700 shrink-0">{opt}.</span>
                  <div className="flex-1 min-w-0">
                    <WordStyleFormulaCanvas
                      singleLine
                      content={val}
                      onChange={setter}
                      placeholder={`Phương án ${opt}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Mức độ Bloom</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#E5E3DC] text-xs font-medium bg-white text-slate-900"
              >
                <option value={1}>L1 · Nhận biết</option>
                <option value={2}>L2 · Thông hiểu</option>
                <option value={3}>L3 · Vận dụng</option>
                <option value={4}>L4 · Vận dụng cao</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Đáp án đúng</label>
              <div className="p-2 bg-[#F2F9F5] border border-[#C7E3D2] rounded-xl text-xs font-semibold text-[#1E6B47] text-center">
                Phương án {correctOption}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Lời giải</label>
            <div className="rounded-xl border border-[#E5E3DC] bg-white p-3">
              <WordStyleFormulaCanvas
                compact
                content={explanation}
                onChange={setExplanation}
                placeholder="Nhập lời giải chi tiết..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#ECEAE4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E5E3DC] text-xs font-medium text-slate-600 hover:bg-[#FAF9F6] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
 * SUBCOMPONENT: AI QUESTION GENERATOR MODAL
 * ============================================================================ */

function AiQuestionGeneratorModal({ skillId, patternInfo, onClose, onSuccessBatch }) {
  const [count, setCount] = useState(2);
  const [level, setLevel] = useState(patternInfo?.difficultyLevel || 2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [processingTime, setProcessingTime] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedIndices([]);
    try {
      const res = await aiService.generatePatternQuestions({
        patternName: patternInfo?.patternName || '',
        lessonName: patternInfo?.lessonName || '',
        domainName: patternInfo?.domainName || '',
        theoryRecap: patternInfo?.theoryRecap || '',
        solutionMethod: patternInfo?.solutionMethod || '',
        count,
        existingQuestions: patternInfo?.existingQuestions || []
      });

      const questions = res?.questions || [];
      if (questions.length === 0) {
        toast.warning('AI không trả về câu hỏi nào. Vui lòng thử lại.');
      } else {
        const mapped = questions.map(q => ({
          ...q,
          difficultyLevel: q.difficultyLevel || level
        }));
        setGeneratedQuestions(mapped);
        setSelectedIndices(mapped.map((_, idx) => idx));
        setProcessingTime(res?.processing_time_seconds || 0);
        toast.success(`AI đã sinh ${questions.length} câu hỏi bám sát dạng bài.`);
      }
    } catch (err) {
      toast.error('Lỗi khi AI sinh câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelect = (idx) => {
    setSelectedIndices(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.length === generatedQuestions.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(generatedQuestions.map((_, i) => i));
    }
  };

  const handleSaveToDb = async () => {
    const toSave = generatedQuestions.filter((_, idx) => selectedIndices.includes(idx));
    if (toSave.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 câu hỏi để lưu.');
      return;
    }
    setIsSaving(true);
    const createdResults = [];
    let failureCount = 0;

    for (let i = 0; i < toSave.length; i++) {
      const q = toSave[i];
      try {
        const payload = {
          skillId,
          difficultyLevel: parseInt(q.difficultyLevel, 10) || 2,
          contentLatex: q.contentLatex,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          explanation: q.explanation || ''
        };
        let created = null;
        if (isValidGuid(skillId)) {
          try {
            created = await contentService.createQuestion(payload);
          } catch {}
        }
        createdResults.push(created || { ...payload, questionId: `studio_ai_q_${Date.now()}_${i}` });
      } catch {
        failureCount++;
      }
    }

    setIsSaving(false);
    if (createdResults.length > 0) {
      toast.success(`Đã lưu ${createdResults.length} câu hỏi vào ngân hàng đề.`);
      if (onSuccessBatch) onSuccessBatch(createdResults);
    }
    if (failureCount > 0) {
      toast.error(`Có ${failureCount} câu hỏi bị lỗi khi lưu.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-[#E7E5DF] overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-[#2C4C7E] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">AI Sinh câu hỏi luyện tập</h3>
              {patternInfo?.patternName && (
                <p className="text-[11px] text-slate-500 truncate">{patternInfo.patternName}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#EFECE4] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E7E5DF] flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Số lượng câu hỏi</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setCount(cnt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                      count === cnt
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'bg-white text-slate-700 border-[#E5E3DC] hover:bg-[#EEF2F7]'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Mức độ Bloom</label>
              <select
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value, 10))}
                className="w-full p-2 rounded-lg border border-[#E5E3DC] text-xs font-medium bg-white text-slate-900"
              >
                <option value={1}>L1 · Nhận biết</option>
                <option value={2}>L2 · Thông hiểu</option>
                <option value={3}>L3 · Vận dụng</option>
                <option value={4}>L4 · Vận dụng cao</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isGenerating || isSaving}
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Đang sinh...' : generatedQuestions.length > 0 ? 'Sinh lại' : 'Sinh câu hỏi'}</span>
            </button>
          </div>

          {isGenerating && (
            <div className="p-8 border border-dashed border-[#CFD9E8] rounded-xl text-center space-y-2 bg-[#EEF2F7]/50">
              <RefreshCw className="w-5 h-5 animate-spin text-[#2C4C7E] mx-auto" />
              <div className="text-xs font-medium text-[#1E3A5F]">Đang biên soạn câu hỏi...</div>
            </div>
          )}

          {!isGenerating && generatedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Kết quả ({generatedQuestions.length})
                  </span>
                  {processingTime > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#F4F3EE] text-slate-500 text-[10px] font-mono">
                      {processingTime}s
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-medium text-[#1E3A5F] hover:underline cursor-pointer"
                >
                  {selectedIndices.length === generatedQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#CFD9E8] bg-white'
                          : 'border-[#EAE8E1] bg-[#FAF9F6] opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0EFE9]">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(idx)}
                            className="w-4 h-4 accent-[#1E3A5F] rounded cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-[#1E3A5F]">Câu {idx + 1}</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#F4F3EE] text-slate-600 text-[10px] font-medium">
                            L{q.difficultyLevel || level}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#F2F9F5] text-[#1E6B47] border border-[#C7E3D2] text-[10px] font-semibold">
                            Đáp án {q.correctOption}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed mb-3">
                        <MathText text={q.contentLatex} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                          const isCorrect = (q.correctOption || '').toUpperCase() === optKey;
                          const optText = q[`option${optKey}`] || '';
                          return (
                            <div
                              key={optKey}
                              className={`p-2 rounded-lg border text-xs flex items-start gap-1.5 ${
                                isCorrect
                                  ? 'bg-[#F2F9F5] border-[#C7E3D2] text-[#1E6B47] font-medium'
                                  : 'bg-[#FAF9F6] border-[#EAE8E1] text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                                  isCorrect ? 'bg-[#1E6B47] text-white' : 'bg-[#EAE8E1] text-slate-600'
                                }`}
                              >
                                {optKey}
                              </span>
                              <div className="flex-1 break-words">
                                <MathText text={optText} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#EAE8E1] text-xs text-slate-600 space-y-1">
                          <span className="font-semibold text-slate-800 block text-[11px]">Lời giải</span>
                          <div className="text-[11px] leading-relaxed">
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isGenerating && generatedQuestions.length === 0 && (
            <div className="p-8 border border-dashed border-[#DCD9D0] bg-[#FAF9F6] rounded-xl text-center text-xs text-slate-400">
              Chọn số lượng và bấm &quot;Sinh câu hỏi&quot;.
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            {generatedQuestions.length > 0 ? (
              <span>
                Đã chọn <strong className="text-[#1E3A5F]">{selectedIndices.length}</strong>/{generatedQuestions.length}
              </span>
            ) : (
              <span>Sẵn sàng</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E5E3DC] bg-white text-xs font-medium text-slate-600 hover:bg-[#F3F2EC] cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={isGenerating || isSaving || selectedIndices.length === 0}
              onClick={handleSaveToDb}
              className="px-5 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu {selectedIndices.length > 0 ? `${selectedIndices.length} câu hỏi` : 'câu hỏi'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
