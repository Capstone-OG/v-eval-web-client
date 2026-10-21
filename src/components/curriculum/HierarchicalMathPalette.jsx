import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Search,
  FolderOpen,
  Layers,
  Atom,
  BookOpen
} from 'lucide-react';
import { renderKatexHtml } from '../common/MathText';

/**
 * HIERARCHICAL STEM CATALOG (MASSIVE REPOSITORY)
 * Level 1: Domain / Subject (Toán, Hóa, Lý, Ký hiệu & Logic)
 * Level 2: Category (Accordion Toggle Cây Thư Mục)
 * Level 3: Compact Formula / Chemical Compound Chips with 2s Rich Guidance Tooltip
 */
export const HIERARCHICAL_CATALOG = {
  math: {
    name: 'Toán Học',
    shortName: 'Toán',
    icon: '📐',
    badgeColor: 'indigo',
    categories: {
      algebra: {
        name: 'Đại số & Căn thức',
        items: [
          { label: 'a/b', code: '\\frac{a}{b}', preview: '\\frac{a}{b}', desc: 'Phân số đại số 2 tầng (tử số / mẫu số). Click vào phân số để sửa số hoặc tự tính.', latexNote: '\\frac{tử}{mẫu}' },
          { label: '12/4', code: '\\frac{12}{4} = 3', preview: '\\frac{12}{4}', desc: 'Phân số số học có thương số cụ thể. Nhấp để thay đổi số.', latexNote: '\\frac{12}{4} = 3' },
          { label: '√x', code: '\\sqrt{x}', preview: '\\sqrt{x}', desc: 'Căn bậc hai số học chuẩn SGK. Hỗ trợ tự động tính căn bậc hai khi nhập số.', latexNote: '\\sqrt{x}' },
          { label: 'ⁿ√x', code: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}', desc: 'Căn bậc n tổng quát với chỉ số bậc căn n và biểu thức dưới dấu căn.', latexNote: '\\sqrt[n]{x}' },
          { label: 'x²', code: 'x^2', preview: 'x^2', desc: 'Lũy thừa bậc hai (bình phương). Click cơ số hoặc số mũ để chỉnh sửa.', latexNote: 'x^2' },
          { label: 'xⁿ', code: 'x^{n}', preview: 'x^{n}', desc: 'Lũy thừa bậc n với số mũ tự do (số nguyên, phân số hoặc biểu thức).', latexNote: 'x^{n}' },
          { label: 'x₀', code: 'x_0', preview: 'x_0', desc: 'Chỉ số tọa độ điểm ban đầu hoặc nghiệm đặc biệt trong giải tích SGK.', latexNote: 'x_0' },
          { label: '|x|', code: '|x|', preview: '|x|', desc: 'Dấu giá trị tuyệt đối hai vạch thẳng đứng song song quanh biểu thức.', latexNote: '|x|' },
          { label: '(a+b)²', code: '(a + b)^2 = a^2 + 2ab + b^2', preview: '(a+b)^2', desc: 'Hằng đẳng thức bình phương của một tổng trong chương trình Đại số.', latexNote: '(a+b)^2 = a^2+2ab+b^2' },
          { label: 'a²-b²', code: 'a^2 - b^2 = (a-b)(a+b)', preview: 'a^2-b^2', desc: 'Hằng đẳng thức hiệu hai bình phương.', latexNote: 'a^2-b^2' },
          { label: 'Δ', code: '\\Delta = b^2 - 4ac', preview: '\\Delta', desc: 'Biệt thức Delta của phương trình bậc hai ax² + bx + c = 0.', latexNote: '\\Delta = b^2 - 4ac' },
          { label: "Δ'", code: "\\Delta' = b'^2 - ac", preview: "\\Delta'", desc: "Biệt thức Delta phẩy khi b = 2b'.", latexNote: "\\Delta' = b'^2 - ac" }
        ]
      },
      calculus_diff: {
        name: 'Đạo hàm & Hàm số',
        items: [
          { label: "y'", code: "y' = f'(x)", preview: "y'", desc: 'Ký hiệu đạo hàm cấp 1 theo biến x dùng trong xét chiều biến thiên hàm số.', latexNote: "y' = f'(x)" },
          { label: "y''", code: "y'' = f''(x)", preview: "y''", desc: 'Đạo hàm cấp hai dùng để tìm điểm uốn và xét tính lồi lõm của đồ thị.', latexNote: "y'' = f''(x)" },
          { label: "f'(x₀)", code: "f'(x_0)", preview: "f'(x_0)", desc: 'Hệ số góc tiếp tuyến của đồ thị hàm số tại điểm có hoành độ x₀.', latexNote: "f'(x_0)" },
          { label: 'dy/dx', code: '\\frac{dy}{dx}', preview: '\\frac{dy}{dx}', desc: 'Ký hiệu Leibniz vi phân thương số dy trên dx.', latexNote: '\\frac{dy}{dx}' },
          { label: 'x_CĐ', code: 'x_{CĐ}', preview: 'x_{CĐ}', desc: 'Điểm cực đại của hàm số chuẩn GDPT 2018.', latexNote: 'x_{CĐ}' },
          { label: 'x_CT', code: 'x_{CT}', preview: 'x_{CT}', desc: 'Điểm cực tiểu của hàm số.', latexNote: 'x_{CT}' },
          { label: 'y_CĐ', code: 'y_{CĐ}', preview: 'y_{CĐ}', desc: 'Giá trị cực đại (cực đại) của hàm số.', latexNote: 'y_{CĐ}' },
          { label: 'y_CT', code: 'y_{CT}', preview: 'y_{CT}', desc: 'Giá trị cực tiểu của hàm số.', latexNote: 'y_{CT}' },
          { label: '(uv)', code: "(uv)' = u'v + uv'", preview: "(uv)'", desc: 'Công thức đạo hàm của một tích hai hàm số.', latexNote: "(uv)' = u'v + uv'" },
          { label: '(u/v)', code: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}", preview: "\\left(\\frac{u}{v}\\right)'", desc: 'Công thức đạo hàm của một thương hai hàm số.', latexNote: "(u/v)' = (u'v - uv') / v^2" },
          { label: 'TCN', code: '\\lim_{x \\to \\pm\\infty} f(x) = y_0', preview: '\\lim_{x\\to\\infty}', desc: 'Điều kiện tiệm cận ngang y = y₀ của đồ thị hàm số.', latexNote: '\\lim_{x \\to \\pm\\infty} f(x) = y_0' },
          { label: 'TCĐ', code: '\\lim_{x \\to x_0^+} f(x) = \\infty', preview: '\\lim_{x\\to x_0}', desc: 'Điều kiện tiệm cận đứng x = x₀ của đồ thị hàm số.', latexNote: '\\lim_{x \\to x_0} f(x) = \\infty' }
        ]
      },
      calculus_int: {
        name: 'Tích phân & Giới hạn',
        items: [
          { label: '∫ f(x)', code: '\\int f(x) dx', preview: '\\int f(x)', desc: 'Nguyên hàm bất định của hàm số f(x).', latexNote: '\\int f(x) dx' },
          { label: '∫[a,b]', code: '\\int_{a}^{b} f(x) dx', preview: '\\int_{a}^{b}', desc: 'Tích phân xác định từ cận a đến cận b.', latexNote: '\\int_{a}^{b} f(x) dx' },
          { label: 'lim', code: '\\lim_{x \\to x_0} f(x)', preview: '\\lim', desc: 'Giới hạn của hàm số khi x dần tới x₀.', latexNote: '\\lim_{x \\to x_0} f(x)' },
          { label: 'lim +∞', code: '\\lim_{x \\to +\\infty} f(x)', preview: '\\lim_{+\\infty}', desc: 'Giới hạn hàm số khi x tiến ra dương vô cực.', latexNote: '\\lim_{x \\to +\\infty}' },
          { label: 'lim -∞', code: '\\lim_{x \\to -\\infty} f(x)', preview: '\\lim_{-\\infty}', desc: 'Giới hạn hàm số khi x tiến ra âm vô cực.', latexNote: '\\lim_{x \\to -\\infty}' },
          { label: '∑', code: '\\sum_{i=1}^{n} x_i', preview: '\\sum', desc: 'Phép lấy tổng liên tiếp các số hạng từ 1 đến n.', latexNote: '\\sum_{i=1}^{n}' },
          { label: '∫ u dv', code: '\\int u dv = uv - \\int v du', preview: '\\int u dv', desc: 'Công thức tích phân từng phần kinh điển SGK 12.', latexNote: '\\int u dv = uv - \\int v du' },
          { label: 'S hình phẳng', code: 'S = \\int_{a}^{b} |f(x) - g(x)| dx', preview: 'S = \\int', desc: 'Công thức diện tích hình phẳng giới hạn bởi hai đồ thị.', latexNote: 'S = \\int_{a}^{b} |f - g| dx' },
          { label: 'V tròn xoay', code: 'V = \\pi \\int_{a}^{b} [f(x)]^2 dx', preview: 'V = \\pi\\int', desc: 'Thể tích khối tròn xoay quay quanh trục hoành Ox.', latexNote: 'V = \\pi \\int [f(x)]^2 dx' }
        ]
      },
      trigonometry: {
        name: 'Lượng giác',
        items: [
          { label: 'sin x', code: '\\sin x', preview: '\\sin x', desc: 'Hàm số lượng giác sin x.', latexNote: '\\sin x' },
          { label: 'cos x', code: '\\cos x', preview: '\\cos x', desc: 'Hàm số lượng giác cos x.', latexNote: '\\cos x' },
          { label: 'tan x', code: '\\tan x', preview: '\\tan x', desc: 'Hàm số lượng giác tan x (sin x / cos x).', latexNote: '\\tan x' },
          { label: 'cot x', code: '\\cot x', preview: '\\cot x', desc: 'Hàm số lượng giác cot x (cos x / sin x).', latexNote: '\\cot x' },
          { label: 'sin²+cos²', code: '\\sin^2 x + \\cos^2 x = 1', preview: '\\sin^2+\\cos^2', desc: 'Hằng đẳng thức lượng giác cơ bản nhất.', latexNote: '\\sin^2 x + \\cos^2 x = 1' },
          { label: 'sin 2x', code: '\\sin 2x = 2\\sin x \\cos x', preview: '\\sin 2x', desc: 'Công thức nhân đôi của hàm sin.', latexNote: '\\sin 2x = 2\\sin x \\cos x' },
          { label: 'cos 2x', code: '\\cos 2x = \\cos^2 x - \\sin^2 x', preview: '\\cos 2x', desc: 'Công thức nhân đôi của hàm cos.', latexNote: '\\cos 2x = \\cos^2 x - \\sin^2 x' },
          { label: 'tan 2x', code: '\\tan 2x = \\frac{2\\tan x}{1 - \\tan^2 x}', preview: '\\tan 2x', desc: 'Công thức nhân đôi của hàm tan.', latexNote: '\\tan 2x' },
          { label: 'π', code: '\\pi', preview: '\\pi', desc: 'Hằng số Pi trong đơn vị Radian (≈ 3.14159).', latexNote: '\\pi' },
          { label: 'π/2', code: '\\frac{\\pi}{2}', preview: '\\frac{\\pi}{2}', desc: 'Góc 90 độ (vuông góc) biểu diễn theo radian.', latexNote: '\\frac{\\pi}{2}' },
          { label: 'π/4', code: '\\frac{\\pi}{4}', preview: '\\frac{\\pi}{4}', desc: 'Góc 45 độ biểu diễn theo radian.', latexNote: '\\frac{\\pi}{4}' }
        ]
      },
      exponent_log: {
        name: 'Mũ & Logarit',
        items: [
          { label: 'log_a(b)', code: '\\log_a b', preview: '\\log_a b', desc: 'Logarit cơ số a của b với điều kiện a > 0, a ≠ 1, b > 0.', latexNote: '\\log_a b' },
          { label: 'ln x', code: '\\ln x', preview: '\\ln x', desc: 'Logarit tự nhiên (cơ số e ≈ 2.71828).', latexNote: '\\ln x' },
          { label: 'log x', code: '\\log x', preview: '\\log x', desc: 'Logarit thập phân (cơ số 10).', latexNote: '\\log x' },
          { label: 'eˣ', code: 'e^x', preview: 'e^x', desc: 'Hàm số mũ tự nhiên e mũ x.', latexNote: 'e^x' },
          { label: 'aˣ', code: 'a^x', preview: 'a^x', desc: 'Hàm số mũ cơ số a.', latexNote: 'a^x' },
          { label: 'log_2(x)', code: '\\log_2 x', preview: '\\log_2 x', desc: 'Logarit cơ số 2 thường gặp trong đề thi THPT.', latexNote: '\\log_2 x' },
          { label: "(ln x)'", code: "(\\ln x)' = \\frac{1}{x}", preview: "(\\ln x)'", desc: 'Đạo hàm của hàm logarit tự nhiên ln(x).', latexNote: "(\\ln x)' = 1/x" },
          { label: "(aˣ)'", code: "(a^x)' = a^x \\ln a", preview: "(a^x)'", desc: 'Đạo hàm của hàm số mũ cơ số a.', latexNote: "(a^x)' = a^x \\ln a" },
          { label: 'log(xy)', code: '\\log_a (xy) = \\log_a x + \\log_a y', preview: '\\log(xy)', desc: 'Công thức logarit của một tích bằng tổng các logarit.', latexNote: '\\log_a (xy)' }
        ]
      },
      geometry_oxyz: {
        name: 'Hình học Không gian & Oxyz',
        items: [
          { label: 'v⃗', code: '\\vec{v}', preview: '\\vec{v}', desc: 'Vectơ trong không gian tọa độ Oxyz.', latexNote: '\\vec{v}' },
          { label: 'AB⃗', code: '\\vec{AB}', preview: '\\vec{AB}', desc: 'Vectơ định hướng từ điểm A đến điểm B.', latexNote: '\\vec{AB}' },
          { label: '|a⃗|', code: '|\\vec{a}|', preview: '|\\vec{a}|', desc: 'Độ dài (môđun) của vectơ.', latexNote: '|\\vec{a}|' },
          { label: 'u⃗·v⃗', code: '\\vec{u} \\cdot \\vec{v}', preview: '\\vec{u}\\cdot\\vec{v}', desc: 'Tích vô hướng của hai vectơ: |u||v|cos(u,v).', latexNote: '\\vec{u} \\cdot \\vec{v}' },
          { label: '[u⃗, v⃗]', code: '[\\vec{u}, \\vec{v}]', preview: '[\\vec{u},\\vec{v}]', desc: 'Tích có hướng của hai vectơ trong không gian Oxyz.', latexNote: '[\\vec{u}, \\vec{v}]' },
          { label: '∠ABC', code: '\\angle ABC', preview: '\\angle ABC', desc: 'Ký hiệu góc hình học tạo bởi ba điểm A, B, C.', latexNote: '\\angle ABC' },
          { label: '∥', code: '\\parallel', preview: '\\parallel', desc: 'Ký hiệu hai đường thẳng hoặc hai mặt phẳng song song.', latexNote: '\\parallel' },
          { label: '⊥', code: '\\perp', preview: '\\perp', desc: 'Ký hiệu vuông góc giữa hai đường thẳng hoặc đường thẳng và mặt phẳng.', latexNote: '\\perp' },
          { label: '(α)', code: '(\\alpha)', preview: '(\\alpha)', desc: 'Ký hiệu mặt phẳng Alpha trong hình học.', latexNote: '(\\alpha)' },
          { label: '(P) mp', code: '(P): Ax + By + Cz + D = 0', preview: 'Ax+By+Cz+D=0', desc: 'Phương trình tổng quát mặt phẳng (P) trong Oxyz.', latexNote: '(P): Ax+By+Cz+D=0' },
          { label: 'PT tham số', code: '\\begin{cases} x = x_0 + at \\\\ y = y_0 + bt \\\\ z = z_0 + ct \\end{cases}', preview: '\\begin{cases} x=x_0+at \\end{cases}', desc: 'Phương trình tham số đường thẳng Oxyz.', latexNote: 'PT tham số d' },
          { label: 'PT chính tắc', code: '\\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}', preview: '\\frac{x-x_0}{a}=\\frac{y-y_0}{b}', desc: 'Phương trình chính tắc của đường thẳng Oxyz.', latexNote: 'PT chính tắc d' },
          { label: '(S)', code: '(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2', preview: '(S)', desc: 'Phương trình mặt cầu tâm I(a,b,c) bán kính R trong Oxyz.', latexNote: '(S): (x-a)^2...' },
          { label: 'd(M,(P))', code: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}', preview: 'd(M,(P))', desc: 'Khoảng cách từ điểm M(x₀,y₀,z₀) đến mặt phẳng (P).', latexNote: 'd(M, (P))' },
          { label: 'V tứ diện', code: 'V = \\frac{1}{6} |[\\vec{AB}, \\vec{AC}] \\cdot \\vec{AD}|', preview: 'V = \\frac{1}{6}|[\\vec{u},\\vec{v}]\\cdot\\vec{w}|', desc: 'Thể tích tứ diện ABCD bằng tích hỗn tạp Oxyz.', latexNote: 'V tứ diện' }
        ]
      },
      prob_stats: {
        name: 'Xác suất & Thống kê GDPT 2018',
        items: [
          { label: 'C_n^k', code: 'C_n^k = \\frac{n!}{k!(n-k)!}', preview: 'C_n^k', desc: 'Số tổ hợp chập k của n phần tử.', latexNote: 'C_n^k' },
          { label: 'A_n^k', code: 'A_n^k = \\frac{n!}{(n-k)!}', preview: 'A_n^k', desc: 'Số chỉnh hợp chập k của n phần tử.', latexNote: 'A_n^k' },
          { label: 'P_n', code: 'P_n = n!', preview: 'P_n = n!', desc: 'Số hoán vị của n phần tử.', latexNote: 'P_n = n!' },
          { label: 'P(A)', code: 'P(A) = \\frac{n(A)}{n(\\Omega)}', preview: 'P(A)', desc: 'Công thức tính xác suất cổ điển của biến cố A.', latexNote: 'P(A)' },
          { label: 'P(A|B)', code: 'P(A|B) = \\frac{P(AB)}{P(B)}', preview: 'P(A|B)', desc: 'Xác suất có điều kiện của A khi biết B đã xảy ra (Lớp 12).', latexNote: 'P(A|B)' },
          { label: 'CT Bayes', code: 'P(A_k|B) = \\frac{P(A_k) P(B|A_k)}{\\sum P(A_i) P(B|A_i)}', preview: 'P(A_k|B)', desc: 'Công thức Bayes và công thức xác suất toàn phần.', latexNote: 'Bayes' },
          { label: 'E(X)', code: 'E(X) = \\sum x_i p_i', preview: 'E(X)', desc: 'Kỳ vọng toán học của biến ngẫu nhiên rời rạc.', latexNote: 'E(X)' },
          { label: 'V(X)', code: 'V(X) = E(X^2) - [E(X)]^2', preview: 'V(X)', desc: 'Phương sai của biến ngẫu nhiên rời rạc.', latexNote: 'V(X)' },
          { label: 'σ(X)', code: '\\sigma(X) = \\sqrt{V(X)}', preview: '\\sigma(X)', desc: 'Độ lệch chuẩn của biến ngẫu nhiên.', latexNote: '\\sigma(X)' },
          { label: 'x̄ nhóm', code: '\\bar{x} = \\frac{\\sum m_i c_i}{n}', preview: '\\bar{x}', desc: 'Số trung bình của mẫu số liệu ghép nhóm (Lớp 11 & 12).', latexNote: '\\bar{x}' }
        ]
      },
      complex_nums: {
        name: 'Số Phức',
        items: [
          { label: 'z = a+bi', code: 'z = a + bi', preview: 'z = a+bi', desc: 'Dạng đại số của số phức với phần thực a và phần ảo b (i² = -1).', latexNote: 'z = a + bi' },
          { label: 'z̄', code: '\\bar{z} = a - bi', preview: '\\bar{z}', desc: 'Số phức liên hợp của số phức z = a + bi.', latexNote: '\\bar{z} = a - bi' },
          { label: '|z|', code: '|z| = \\sqrt{a^2 + b^2}', preview: '|z|', desc: 'Môđun của số phức z.', latexNote: '|z| = \\sqrt{a^2+b^2}' },
          { label: 'z₁·z₂', code: 'z_1 \\cdot z_2', preview: 'z_1 z_2', desc: 'Tích hai số phức.', latexNote: 'z_1 z_2' },
          { label: 'z₁/z₂', code: '\\frac{z_1}{z_2} = \\frac{z_1 \\bar{z}_2}{|z_2|^2}', preview: '\\frac{z_1}{z_2}', desc: 'Thương hai số phức.', latexNote: 'z_1 / z_2' }
        ]
      }
    }
  },
  chem: {
    name: 'Hóa Học',
    shortName: 'Hóa',
    icon: '🧪',
    badgeColor: 'emerald',
    categories: {
      acids: {
        name: 'Axit Vô Cơ & Hữu Cơ',
        items: [
          { label: 'H₂SO₄', code: 'H_2SO_4', preview: 'H_2SO_4', desc: 'Axit Sunfuric - Axit mạnh 2 nấc, chất lỏng sánh, háo nước cực mạnh.', latexNote: 'H_2SO_4' },
          { label: 'HCl', code: 'HCl', preview: 'HCl', desc: 'Axit Clohiđric - Axit mạnh 1 nấc trong dạ dày và phòng thí nghiệm.', latexNote: 'HCl' },
          { label: 'HNO₃', code: 'HNO_3', preview: 'HNO_3', desc: 'Axit Nitric - Axit có tính oxi hóa rất mạnh, hòa tan hầu hết kim loại.', latexNote: 'HNO_3' },
          { label: 'H₃PO₄', code: 'H_3PO_4', preview: 'H_3PO_4', desc: 'Axit Photphoric - Axit trung bình 3 nấc.', latexNote: 'H_3PO_4' },
          { label: 'CH₃COOH', code: 'CH_3COOH', preview: 'CH_3COOH', desc: 'Axit Axetic (Giấm ăn) - Axit cacboxylic đơn chức.', latexNote: 'CH_3COOH' },
          { label: 'HCOOH', code: 'HCOOH', preview: 'HCOOH', desc: 'Axit Fomic - Axit đơn chức có phản ứng tráng bạc.', latexNote: 'HCOOH' },
          { label: 'H₂S', code: 'H_2S', preview: 'H_2S', desc: 'Hiđro Sunfua - Khí mùi trứng thối, tính khử mạnh.', latexNote: 'H_2S' },
          { label: 'H₂CO₃', code: 'H_2CO_3', preview: 'H_2CO_3', desc: 'Axit Cacbonic - Axit yếu, không bền phân hủy ra CO₂ + H₂O.', latexNote: 'H_2CO_3' },
          { label: 'HF', code: 'HF', preview: 'HF', desc: 'Axit Flohiđric - Ăn mòn thủy tinh (SiO₂).', latexNote: 'HF' },
          { label: 'HBr', code: 'HBr', preview: 'HBr', desc: 'Axit Bromhiđric - Axit mạnh hơn HCl.', latexNote: 'HBr' },
          { label: 'HI', code: 'HI', preview: 'HI', desc: 'Axit Iothiđric - Axit mạnh nhất trong dãy halogen.', latexNote: 'HI' }
        ]
      },
      bases: {
        name: 'Bazơ & Kiềm',
        items: [
          { label: 'NaOH', code: 'NaOH', preview: 'NaOH', desc: 'Natri Hiđroxit (Xút ăn da) - Bazơ mạnh kiềm tan tốt trong nước.', latexNote: 'NaOH' },
          { label: 'KOH', code: 'KOH', preview: 'KOH', desc: 'Kali Hiđroxit (Potash kiềm).', latexNote: 'KOH' },
          { label: 'Ca(OH)₂', code: 'Ca(OH)_2', preview: 'Ca(OH)_2', desc: 'Canxi Hiđroxit (Nước vôi trong) - Dùng nhận biết khí CO₂.', latexNote: 'Ca(OH)_2' },
          { label: 'Ba(OH)₂', code: 'Ba(OH)_2', preview: 'Ba(OH)_2', desc: 'Bari Hiđroxit - Dung dịch kiềm dùng kết tủa ion Sunfat.', latexNote: 'Ba(OH)_2' },
          { label: 'Cu(OH)₂', code: 'Cu(OH)_2', preview: 'Cu(OH)_2', desc: 'Đồng(II) Hiđroxit - Kết tủa màu xanh lam, tan trong glixerol tạo phức.', latexNote: 'Cu(OH)_2' },
          { label: 'Fe(OH)₃', code: 'Fe(OH)_3', preview: 'Fe(OH)_3', desc: 'Sắt(III) Hiđroxit - Kết tủa màu nâu đỏ.', latexNote: 'Fe(OH)_3' },
          { label: 'Fe(OH)₂', code: 'Fe(OH)_2', preview: 'Fe(OH)_2', desc: 'Sắt(II) Hiđroxit - Kết tủa trắng xanh, hóa nâu đỏ trong không khí.', latexNote: 'Fe(OH)_2' },
          { label: 'Al(OH)₃', code: 'Al(OH)_3', preview: 'Al(OH)_3', desc: 'Nhôm Hiđroxit - Hiđroxit lưỡng tính, kết tủa keo trắng.', latexNote: 'Al(OH)_3' },
          { label: 'NH₃', code: 'NH_3', preview: 'NH_3', desc: 'Amoniac - Khí mùi khai, bazơ yếu tan rất nhiều trong nước.', latexNote: 'NH_3' }
        ]
      },
      salts: {
        name: 'Muối Vô Cơ',
        items: [
          { label: 'NaCl', code: 'NaCl', preview: 'NaCl', desc: 'Natri Clorua (Muối ăn) - Muối trung hòa phổ biến nhất.', latexNote: 'NaCl' },
          { label: 'CaCO₃', code: 'CaCO_3', preview: 'CaCO_3', desc: 'Canxi Cacbonat (Đá vôi) - Kết tủa trắng tan trong axit mạnh.', latexNote: 'CaCO_3' },
          { label: 'BaSO₄', code: 'BaSO_4', preview: 'BaSO_4', desc: 'Bari Sunfat - Kết tủa trắng không tan trong axit mạnh.', latexNote: 'BaSO_4' },
          { label: 'FeSO₄', code: 'FeSO_4', preview: 'FeSO_4', desc: 'Sắt(II) Sunfat - Dung dịch màu xanh nhạt.', latexNote: 'FeSO_4' },
          { label: 'FeCl₃', code: 'FeCl_3', preview: 'FeCl_3', desc: 'Sắt(III) Clorua - Dung dịch vàng nâu, có tính oxi hóa.', latexNote: 'FeCl_3' },
          { label: 'CuSO₄', code: 'CuSO_4', preview: 'CuSO_4', desc: 'Đồng(II) Sunfat - Muối khan màu trắng, ngậm nước màu xanh lam.', latexNote: 'CuSO_4' },
          { label: 'NaHCO₃', code: 'NaHCO_3', preview: 'NaHCO_3', desc: 'Natri Hiđrocacbonat (Baking soda) - Muối lưỡng tính.', latexNote: 'NaHCO_3' },
          { label: 'Na₂CO₃', code: 'Na_2CO_3', preview: 'Na_2CO_3', desc: 'Natri Cacbonat (Soda) - Dung dịch có tính bazơ mạnh.', latexNote: 'Na_2CO_3' },
          { label: 'Al₂(SO₄)₃', code: 'Al_2(SO_4)_3', preview: 'Al_2(SO_4)_3', desc: 'Nhôm Sunfat (Thành phần phèn chua làm trong nước).', latexNote: 'Al_2(SO_4)_3' },
          { label: 'AgNO₃', code: 'AgNO_3', preview: 'AgNO_3', desc: 'Bạc Nitrat - Thuốc thử ion halogenua (Cl⁻, Br⁻, I⁻).', latexNote: 'AgNO_3' },
          { label: 'NH₄Cl', code: 'NH_4Cl', preview: 'NH_4Cl', desc: 'Amoni Clorua - Muối amoni thăng hoa khi đun nóng.', latexNote: 'NH_4Cl' }
        ]
      },
      oxides: {
        name: 'Oxit Axit & Oxit Bazơ',
        items: [
          { label: 'CO₂', code: 'CO_2', preview: 'CO_2', desc: 'Cacbon Đioxit - Khí nhà kính, làm đục nước vôi trong Ca(OH)₂.', latexNote: 'CO_2' },
          { label: 'SO₂', code: 'SO_2', preview: 'SO_2', desc: 'Lưu huỳnh Đioxit - Khí mùi hắc, làm mất màu dung dịch Brom.', latexNote: 'SO_2' },
          { label: 'P₂O₅', code: 'P_2O_5', preview: 'P_2O_5', desc: 'Điphotpho Pentaoxit - Hút ẩm cực mạnh, tác dụng nước tạo H₃PO₄.', latexNote: 'P_2O_5' },
          { label: 'Fe₂O₃', code: 'Fe_2O_3', preview: 'Fe_2O_3', desc: 'Sắt(III) Oxit - Bột màu nâu đỏ trong quặng hematit.', latexNote: 'Fe_2O_3' },
          { label: 'Fe₃O₄', code: 'Fe_3O_4', preview: 'Fe_3O_4', desc: 'Oxit Sắt từ - Màu nâu đen, quặng manhetit có từ tính.', latexNote: 'Fe_3O_4' },
          { label: 'CuO', code: 'CuO', preview: 'CuO', desc: 'Đồng(II) Oxit - Chất rắn màu đen, bị khử bởi H₂ hoặc CO ra Cu đỏ.', latexNote: 'CuO' },
          { label: 'Al₂O₃', code: 'Al_2O_3', preview: 'Al_2O_3', desc: 'Nhôm Oxit - Oxit lưỡng tính, thành phần quặng boxit và đá quý.', latexNote: 'Al_2O_3' },
          { label: 'CaO', code: 'CaO', preview: 'CaO', desc: 'Canxi Oxit (Vôi sống) - Tác dụng mạnh với nước tỏa nhiều nhiệt.', latexNote: 'CaO' },
          { label: 'NO₂', code: 'NO_2', preview: 'NO_2', desc: 'Nitơ Đioxit - Khí màu nâu đỏ độc hại.', latexNote: 'NO_2' }
        ]
      },
      organic: {
        name: 'Hợp Chất Hữu Cơ',
        items: [
          { label: 'CH₄', code: 'CH_4', preview: 'CH_4', desc: 'Metan - Hiđrocacbon no đơn giản nhất trong khí thiên nhiên.', latexNote: 'CH_4' },
          { label: 'C₂H₄', code: 'C_2H_4', preview: 'C_2H_4', desc: 'Etilen - Anken có 1 liên kết đôi C=C, làm mất màu dd Brom.', latexNote: 'C_2H_4' },
          { label: 'C₂H₂', code: 'C_2H_2', preview: 'C_2H_2', desc: 'Axetilen - Ankin có 1 liên kết ba C≡C, tác dụng AgNO₃/NH₃ tạo kết tủa vàng.', latexNote: 'C_2H_2' },
          { label: 'C₆H₆', code: 'C_6H_6', preview: 'C_6H_6', desc: 'Benzen - Hiđrocacbon thơm với vòng benzen 6 cạnh bền vững.', latexNote: 'C_6H_6' },
          { label: 'C₂H₅OH', code: 'C_2H_5OH', preview: 'C_2H_5OH', desc: 'Etanol (Cồn) - Ancol no đơn chức bậc 1 lên men từ tinh bột.', latexNote: 'C_2H_5OH' },
          { label: 'CH₃CHO', code: 'CH_3CHO', preview: 'CH_3CHO', desc: 'Axetanđehit - Anđehit đơn chức có phản ứng tráng bạc.', latexNote: 'CH_3CHO' },
          { label: 'HCOOCH₃', code: 'HCOOCH_3', preview: 'HCOOCH_3', desc: 'Metyl Fomat - Este đơn giản nhất có tráng bạc.', latexNote: 'HCOOCH_3' },
          { label: 'CH₃COOC₂H₅', code: 'CH_3COOC_2H_5', preview: 'CH_3COOC_2H_5', desc: 'Etyl Axetat - Este mùi thơm hoa quả, dung môi hữu cơ.', latexNote: 'CH_3COOC_2H_5' },
          { label: 'CH₃NH₂', code: 'CH_3NH_2', preview: 'CH_3NH_2', desc: 'Metylamin - Khí mùi khai tương tự amoniac, tính bazơ mạnh hơn NH₃.', latexNote: 'CH_3NH_2' },
          { label: 'Gly', code: 'H_2N-CH_2-COOH', preview: 'Gly', desc: 'Glyxin - Amino axit đơn giản nhất không làm đổi màu quỳ tím.', latexNote: 'H_2N-CH_2-COOH' },
          { label: 'Ala', code: 'CH_3-CH(NH_2)-COOH', preview: 'Ala', desc: 'Alanin - Amino axit có 3 nguyên tử cacbon.', latexNote: 'Ala' },
          { label: 'C₆H₁₂O₆', code: 'C_6H_{12}O_6', preview: 'C_6H_{12}O_6', desc: 'Glucozơ - Monosaccarit cung cấp năng lượng trong máu (0.1%).', latexNote: 'C_6H_{12}O_6' },
          { label: 'C₁₂H₂₂O₁₁', code: 'C_{12}H_{22}O_{11}', preview: 'C_{12}H_{22}O_{11}', desc: 'Saccarozơ (Đường mía) - Đisaccarit thủy phân ra Glucozơ + Fructozơ.', latexNote: 'C_{12}H_{22}O_{11}' }
        ]
      },
      ions_redox: {
        name: 'Điện Tích Ion & Số Oxi Hóa',
        items: [
          { label: 'H⁺', code: 'H^+', preview: 'H^+', desc: 'Cation Hiđro xác định môi trường axit và độ pH.', latexNote: 'H^+' },
          { label: 'OH⁻', code: 'OH^-', preview: 'OH^-', desc: 'Anion Hiđroxit đặc trưng cho môi trường kiềm bazơ.', latexNote: 'OH^-' },
          { label: 'Na⁺', code: 'Na^+', preview: 'Na^+', desc: 'Cation Natri điện tích 1+.', latexNote: 'Na^+' },
          { label: 'Ca²⁺', code: 'Ca^{2+}', preview: 'Ca^{2+}', desc: 'Cation Canxi gây độ cứng của nước.', latexNote: 'Ca^{2+}' },
          { label: 'Fe²⁺', code: 'Fe^{2+}', preview: 'Fe^{2+}', desc: 'Cation Sắt II có tính khử và tính oxi hóa.', latexNote: 'Fe^{2+}' },
          { label: 'Fe³⁺', code: 'Fe^{3+}', preview: 'Fe^{3+}', desc: 'Cation Sắt III có tính oxi hóa mạnh.', latexNote: 'Fe^{3+}' },
          { label: 'Al³⁺', code: 'Al^{3+}', preview: 'Al^{3+}', desc: 'Cation Nhôm III.', latexNote: 'Al^{3+}' },
          { label: 'SO₄²⁻', code: 'SO_4^{2-}', preview: 'SO_4^{2-}', desc: 'Anion Sunfat gốc axit mạnh.', latexNote: 'SO_4^{2-}' },
          { label: 'NO₃⁻', code: 'NO_3^-', preview: 'NO_3^-', desc: 'Anion Nitrat hầu như mọi muối đều tan tốt.', latexNote: 'NO_3^-' },
          { label: 'CO₃²⁻', code: 'CO_3^{2-}', preview: 'CO_3^{2-}', desc: 'Anion Cacbonat.', latexNote: 'CO_3^{2-}' },
          { label: '+1', code: '+1', preview: '+1', desc: 'Số oxi hóa dương một (+1).', latexNote: '+1' },
          { label: '+2', code: '+2', preview: '+2', desc: 'Số oxi hóa dương hai (+2).', latexNote: '+2' },
          { label: '+3', code: '+3', preview: '+3', desc: 'Số oxi hóa dương ba (+3).', latexNote: '+3' },
          { label: '+6', code: '+6', preview: '+6', desc: 'Số oxi hóa cực đại của Lưu huỳnh trong H₂SO₄.', latexNote: '+6' },
          { label: '-2', code: '-2', preview: '-2', desc: 'Số oxi hóa thông thường của Oxi (-2).', latexNote: '-2' },
          { label: '0', code: '0', preview: '0', desc: 'Số oxi hóa của đơn chất tự do bằng 0.', latexNote: '0' }
        ]
      },
      reactions: {
        name: 'Mũi Tên & Ký Hiệu Phản Ứng',
        items: [
          { label: '→', code: '\\rightarrow ', preview: '\\rightarrow', desc: 'Mũi tên phản ứng một chiều không thuận nghịch.', latexNote: '\\rightarrow' },
          { label: '⇌', code: '\\rightleftharpoons ', preview: '\\rightleftharpoons', desc: 'Mũi tên cân bằng hóa học thuận nghịch hai chiều.', latexNote: '\\rightleftharpoons' },
          { label: '↑', code: '\\uparrow ', preview: '\\uparrow', desc: 'Ký hiệu chất khí thoát ra khỏi dung dịch.', latexNote: '\\uparrow' },
          { label: '↓', code: '\\downarrow ', preview: '\\downarrow', desc: 'Ký hiệu kết tủa lắng xuống đáy dung dịch.', latexNote: '\\downarrow' },
          { label: 't°', code: '\\xrightarrow{t^\\circ} ', preview: '\\xrightarrow{t^\\circ}', desc: 'Phản ứng cần đun nóng nhiệt độ.', latexNote: '\\xrightarrow{t^\\circ}' },
          { label: 'xt', code: '\\xrightarrow{xt} ', preview: '\\xrightarrow{xt}', desc: 'Phản ứng có mặt chất xúc tác.', latexNote: '\\xrightarrow{xt}' }
        ]
      },
      calc: {
        name: 'Công Thức Tính Nồng Độ & Mol',
        items: [
          { label: 'CM', code: 'C_M = \\frac{n}{V} = \\frac{0.2}{0.5} = 0.4\\text{ M}', preview: 'C_M = \\frac{n}{V}', desc: 'Nồng độ mol/lít (C_M). Hỗ trợ bấm nút tự động tính số liệu!', latexNote: 'C_M = \\frac{n}{V}' },
          { label: 'C%', code: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%', preview: 'C\\%', desc: 'Nồng độ phần trăm khối lượng dung dịch.', latexNote: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%' },
          { label: 'n = m/M', code: 'n = \\frac{m}{M}', preview: 'n = \\frac{m}{M}', desc: 'Công thức tính số mol từ khối lượng chất.', latexNote: 'n = \\frac{m}{M}' },
          { label: 'n = V/22.4', code: 'n = \\frac{V}{22.4}', preview: 'n = \\frac{V}{22.4}', desc: 'Số mol chất khí ở điều kiện tiêu chuẩn (đktc 0°C, 1 atm).', latexNote: 'n = \\frac{V}{22.4}' },
          { label: 'pH', code: 'pH = -\\log[H^+]', preview: 'pH', desc: 'Chỉ số đo độ axit hay bazơ của dung dịch nước.', latexNote: 'pH = -\\log[H^+]' }
        ]
      }
    }
  },
  physics: {
    name: 'Vật Lý',
    shortName: 'Vật Lý',
    icon: '⚛️',
    badgeColor: 'amber',
    categories: {
      oscillations: {
        name: 'Dao Động Điều Hòa',
        items: [
          { label: 'x(t)', code: 'x = A\\cos(\\omega t + \\varphi)', preview: 'x(t)', desc: 'Phương trình dao động điều hòa li độ theo thời gian t.', latexNote: 'x = A\\cos(\\omega t + \\varphi)' },
          { label: 'v(t)', code: 'v = -\\omega A \\sin(\\omega t + \\varphi)', preview: 'v(t)', desc: 'Phương trình vận tốc sớm pha π/2 so với li độ.', latexNote: 'v = x\'' },
          { label: 'a(t)', code: 'a = -\\omega^2 x', preview: 'a(t)', desc: 'Gia tốc luôn hướng về vị trí cân bằng và ngược pha với li độ.', latexNote: 'a = -\\omega^2 x' },
          { label: 'T lò xo', code: 'T = 2\\pi \\sqrt{\\frac{m}{k}}', preview: 'T = 2\\pi\\sqrt{\\frac{m}{k}}', desc: 'Chu kỳ dao động của con lắc lò xo.', latexNote: 'T = 2\\pi \\sqrt{m/k}' },
          { label: 'T con lắc đơn', code: 'T = 2\\pi \\sqrt{\\frac{l}{g}}', preview: 'T = 2\\pi\\sqrt{\\frac{l}{g}}', desc: 'Chu kỳ dao động con lắc đơn chiều dài l trong trọng trường g.', latexNote: 'T = 2\\pi \\sqrt{l/g}' }
        ]
      },
      waves: {
        name: 'Sóng Cơ & Âm Học',
        items: [
          { label: 'λ = v/f', code: '\\lambda = \\frac{v}{f} = v \\cdot T', preview: '\\lambda = \\frac{v}{f}', desc: 'Bước sóng là quãng đường sóng truyền đi trong một chu kỳ.', latexNote: '\\lambda = v / f' },
          { label: 'u(t, x)', code: 'u = A\\cos\\left(\\omega t - \\frac{2\\pi x}{\\lambda}\\right)', preview: 'u(x,t)', desc: 'Phương trình sóng cơ hình sin tại điểm cách nguồn khoảng x.', latexNote: 'u = A\\cos(...)' },
          { label: 'Mức âm L', code: 'L = 10\\log\\left(\\frac{I}{I_0}\\right)', preview: 'L(dB)', desc: 'Mức cường độ âm tính theo đơn vị Đềxiben (dB).', latexNote: 'L = 10\\log(I/I_0)' }
        ]
      },
      ac_current: {
        name: 'Dòng Điện Xoay Chiều',
        items: [
          { label: 'i(t)', code: 'i = I_0 \\cos(\\omega t)', preview: 'i = I_0\\cos', desc: 'Phương trình cường độ dòng điện tức thời.', latexNote: 'i = I_0 \\cos(\\omega t)' },
          { label: 'Z tổng trở', code: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}', preview: 'Z', desc: 'Tổng trở của đoạn mạch RLC mắc nối tiếp.', latexNote: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}' },
          { label: 'Z_L', code: 'Z_L = \\omega L', preview: 'Z_L', desc: 'Cảm kháng của cuộn cảm thuần L.', latexNote: 'Z_L = \\omega L' },
          { label: 'Z_C', code: 'Z_C = \\frac{1}{\\omega C}', preview: 'Z_C', desc: 'Dung kháng của tụ điện C.', latexNote: 'Z_C = \\frac{1}{\\omega C}' },
          { label: 'P công suất', code: 'P = U I \\cos\\varphi', preview: 'P = UI\\cos', desc: 'Công suất tiêu thụ của dòng điện xoay chiều.', latexNote: 'P = UI\\cos\\varphi' }
        ]
      },
      optics_nuclear: {
        name: 'Sóng Ánh Sáng & Hạt Nhân',
        items: [
          { label: 'Khoảng vân i', code: 'i = \\frac{\\lambda D}{a}', preview: 'i = \\frac{\\lambda D}{a}', desc: 'Khoảng vân giao thoa khe Y-âng trong thí nghiệm ánh sáng.', latexNote: 'i = \\frac{\\lambda D}{a}' },
          { label: 'ε = hf', code: '\\varepsilon = hf = \\frac{hc}{\\lambda}', preview: '\\varepsilon = hf', desc: 'Năng lượng của một lượng tử ánh sáng (photon).', latexNote: '\\varepsilon = hf' },
          { label: 'E = mc²', code: 'E = mc^2', preview: 'E = mc^2', desc: 'Hệ thức tương đối Einstein giữa khối lượng và năng lượng.', latexNote: 'E = mc^2' },
          { label: 'Độ hụt khối', code: '\\Delta m = Z m_p + (A - Z) m_n - m_X', preview: '\\Delta m', desc: 'Độ hụt khối khi liên kết các nucleon thành hạt nhân.', latexNote: '\\Delta m' }
        ]
      }
    }
  },
  biology: {
    name: 'Sinh Học',
    shortName: 'Sinh',
    icon: '🧬',
    badgeColor: 'teal',
    categories: {
      dna_genetics: {
        name: 'Di Truyền Phân Tử (ADN & ARN)',
        items: [
          { label: 'N = 2A+2G', code: 'N = 2A + 2G = 2T + 2X', preview: 'N = 2A + 2G', desc: 'Tổng số nucleotit của gen ADN mạch kép.', latexNote: 'N = 2A+2G' },
          { label: 'Chiều dài L', code: 'L = \\frac{N}{2} \\times 3.4\\text{ \\AA}', preview: 'L = \\frac{N}{2} \\times 3.4', desc: 'Chiều dài ADN theo Angstrom (1 nm = 10 Å = 10⁻⁴ μm).', latexNote: 'L = (N/2)*3.4' },
          { label: 'Khối lượng M', code: 'M = N \\times 300\\text{ đvC}', preview: 'M = N \\times 300', desc: 'Khối lượng phân tử của gen ADN (1 nu = 300 đvC).', latexNote: 'M = N * 300' },
          { label: 'Chu kỳ C', code: 'C = \\frac{N}{20} = \\frac{L}{34}', preview: 'C = \\frac{N}{20}', desc: 'Số chu kỳ xoắn của ADN (mỗi chu kỳ 10 cặp nu = 34 Å).', latexNote: 'C = N/20' },
          { label: 'Liên kết H', code: 'H = 2A + 3G = 2T + 3X', preview: 'H = 2A + 3G', desc: 'Số liên kết hidro giữa các bazơ nitơ theo NTBS.', latexNote: 'H = 2A+3G' },
          { label: 'Liên kết HT', code: 'HT = 2N - 2', preview: 'HT = 2N - 2', desc: 'Số liên kết hóa trị photphodieste trong gen.', latexNote: 'HT = 2N - 2' },
          { label: 'mARN rN', code: 'rN = rA + rU + rG + rX = \\frac{N}{2}', preview: 'rN = \\frac{N}{2}', desc: 'Số ribonucleotit của phân tử mARN phiên mã từ 1 mạch gốc.', latexNote: 'rN = N/2' },
          { label: 'Số axit amin', code: 'N_{aa} = \\frac{rN}{3} - 1 = \\frac{N}{6} - 1', preview: 'N_{aa} = \\frac{rN}{3} - 1', desc: 'Số axit amin trong chuỗi polipeptit hoàn chỉnh (trừ bộ ba mở đầu và kết thúc).', latexNote: 'N_aa' }
        ]
      },
      cell_div: {
        name: 'Nguyên Phân & Giảm Phân',
        items: [
          { label: '2^k tế bào', code: '2^k', preview: '2^k', desc: 'Số tế bào con tạo thành sau k lần nguyên phân liên tiếp.', latexNote: '2^k' },
          { label: 'NST cung cấp', code: '2n \\times (2^k - 1)', preview: '2n(2^k - 1)', desc: 'Số NST đơn môi trường cung cấp cho tế bào 2n nguyên phân k lần.', latexNote: '2n(2^k - 1)' },
          { label: 'Bộ NST 2n', code: '2n = 46', preview: '2n = 46', desc: 'Bộ NST lưỡng bội loài (người 2n = 46).', latexNote: '2n' },
          { label: 'Giao tử đực', code: '4 \\times \\text{Tế bào sinh tinh}', preview: '4 \\times \\text{TB tinh}', desc: 'Mỗi tế bào sinh tinh qua giảm phân tạo 4 tinh trùng thụ tinh.', latexNote: '4 tinh trùng' },
          { label: 'Giao tử cái', code: '1 \\times \\text{Trứng} + 3 \\times \\text{Thể cực}', preview: '1 \\text{ trứng} + 3 \\text{ cực}', desc: 'Mỗi tế bào sinh trứng qua giảm phân tạo 1 trứng và 3 thể cực.', latexNote: '1 trứng + 3 cực' },
          { label: 'Hiệu suất TT', code: 'H = \\frac{\\text{Số hợp tử}}{\\text{Tổng giao tử}} \\times 100\\%', preview: 'H = \\frac{\\text{Hợp tử}}{\\text{Giao tử}}', desc: 'Hiệu suất thụ tinh của giao tử đực hoặc giao tử cái.', latexNote: 'H thụ tinh' }
        ]
      },
      mendel_pop: {
        name: 'Quy Luật Di Truyền & Quần Thể',
        items: [
          { label: 'F2 Menđen', code: '3 : 1 \\quad (1AA : 2Aa : 1aa)', preview: '3:1 \\ (1:2:1)', desc: 'Tỉ lệ kiểu hình 3:1 và kiểu gen 1:2:1 ở F2 khi lai 1 cặp tính trạng.', latexNote: '3:1' },
          { label: 'F2 Phân ly ĐL', code: '9 : 3 : 3 : 1', preview: '9:3:3:1', desc: 'Tỉ lệ phân ly kiểu hình F2 của phép lai hai cặp tính trạng độc lập.', latexNote: '9:3:3:1' },
          { label: 'Tương tác 9:7', code: '9 : 7', preview: '9 : 7', desc: 'Tỉ lệ tương tác gen bổ sung hai gen không alen.', latexNote: '9:7' },
          { label: 'Hardy-Weinberg', code: 'p^2 AA + 2pq Aa + q^2 aa = 1', preview: 'p^2+2pq+q^2=1', desc: 'Định luật Hacdi - Vanbec về cân bằng di truyền quần thể ngẫu phối (p + q = 1).', latexNote: 'p^2+2pq+q^2=1' },
          { label: 'Tần số alen p', code: 'p_A = d + \\frac{h}{2}', preview: 'p_A = d + \\frac{h}{2}', desc: 'Tần số alen trội A từ cấu trúc dAA + hAa + raa = 1.', latexNote: 'p_A = d + h/2' },
          { label: 'Tần số alen q', code: 'q_a = r + \\frac{h}{2}', preview: 'q_a = r + \\frac{h}{2}', desc: 'Tần số alen lặn a (p + q = 1).', latexNote: 'q_a = r + h/2' },
          { label: 'Hoán vị gen f', code: 'f = \\frac{\\text{Số cá thể HV}}{\\text{Tổng số cá thể}} \\times 100\\% \\quad (f \\le 50\\%)', preview: 'f \\le 50\\%', desc: 'Tần số hoán vị gen giữa hai gen trên cùng 1 NST.', latexNote: 'f hoán vị gen' }
        ]
      }
    }
  },
  literature: {
    name: 'Ngữ Văn',
    shortName: 'Văn',
    icon: '📖',
    badgeColor: 'rose',
    categories: {
      rhetoric_devices: {
        name: 'Biện Pháp Tu Từ',
        items: [
          { label: 'So sánh', code: '\\text{So sánh: } A \\text{ như/là } B', preview: '\\text{So sánh}', desc: 'Đối chiếu hai sự vật hiện tượng có nét tương đồng nhằm tăng gợi hình gợi cảm.', latexNote: 'So sánh' },
          { label: 'Ẩn dụ', code: '\\text{Ẩn dụ (So sánh ngầm dựa trên nét tương đồng)}', preview: '\\text{Ẩn dụ}', desc: 'Gọi tên sự vật hiện tượng này bằng tên sự vật khác dựa trên nét tương đồng ngầm.', latexNote: 'Ẩn dụ' },
          { label: 'Hoán dụ', code: '\\text{Hoán dụ (Dựa trên quan hệ tương cận/gần gũi)}', preview: '\\text{Hoán dụ}', desc: 'Gọi tên sự vật này bằng tên sự vật khác có quan hệ đi đôi, gần gũi.', latexNote: 'Hoán dụ' },
          { label: 'Nhân hóa', code: '\\text{Nhân hóa: Gán tính chất/hành động người cho vật}', preview: '\\text{Nhân hóa}', desc: 'Gán cho loài vật, đồ vật tâm tư tình cảm và hành động như con người.', latexNote: 'Nhân hóa' },
          { label: 'Điệp từ/ngữ', code: '\\text{Điệp từ / Điệp ngữ / Điệp cấu trúc}', preview: '\\text{Điệp ngữ}', desc: 'Lặp lại từ ngữ cấu trúc nhằm nhấn mạnh cảm xúc, tạo nhịp điệu sinh động.', latexNote: 'Điệp ngữ' },
          { label: 'Nói quá', code: '\\text{Nói quá (Phóng đại, thậm xưng)}', preview: '\\text{Nói quá}', desc: 'Phóng đại quy mô, mức độ tính chất sự vật nhằm gây ấn tượng mạnh.', latexNote: 'Nói quá' },
          { label: 'Nói giảm tránh', code: '\\text{Nói giảm nói tránh (Nhã nhặn, tế nhị)}', preview: '\\text{Nói giảm}', desc: 'Diễn đạt nhã nhặn, tế nhị tránh cảm giác đau buồn, nặng nề.', latexNote: 'Nói giảm nói tránh' },
          { label: 'Liệt kê', code: '\\text{Liệt kê: } X_1, X_2, X_3, \\dots', preview: '\\text{Liệt kê}', desc: 'Sắp xếp nối tiếp hàng loạt từ cụm từ cùng loại để diễn tả đầy đủ các khía cạnh.', latexNote: 'Liệt kê' },
          { label: 'Tương phản', code: '\\text{Tương phản / Đối lập}', preview: '\\text{Tương phản}', desc: 'Đặt các sự vật hình ảnh trái ngược nhau cạnh nhau làm nổi bật tư tưởng.', latexNote: 'Tương phản' },
          { label: 'Câu hỏi tu từ', code: '\\text{Câu hỏi tu từ (?)}', preview: '\\text{Câu hỏi tu từ}', desc: 'Câu hỏi bộc lộ cảm xúc, khẳng định ý mà không cần trả lời.', latexNote: 'Câu hỏi tu từ' }
        ]
      },
      argumentation: {
        name: 'Thao Tác Lập Luận & Diễn Đạt',
        items: [
          { label: 'Giải thích', code: '\\text{Thao tác Giải thích: Làm rõ khái niệm/nghĩa đen/nghĩa bóng}', preview: '\\text{Giải thích}', desc: 'Dùng lí lẽ để chỉ rõ bản chất, nội dung khái niệm vấn đề.', latexNote: 'Giải thích' },
          { label: 'Phân tích', code: '\\text{Thao tác Phân tích: Chia nhỏ đối tượng thành các khía cạnh}', preview: '\\text{Phân tích}', desc: 'Chia nhỏ đối tượng thành nhiều mặt để xem xét toàn diện, thấu đáo.', latexNote: 'Phân tích' },
          { label: 'Chứng minh', code: '\\text{Thao tác Chứng minh: Dẫn chứng thực tế xác thực}', preview: '\\text{Chứng minh}', desc: 'Dùng dẫn chứng thực tế, số liệu tin cậy để làm sáng tỏ luận điểm.', latexNote: 'Chứng minh' },
          { label: 'Bác bỏ', code: '\\text{Thao tác Bác bỏ: Chỉ ra chỗ sai lầm, phi lí}', preview: '\\text{Bác bỏ}', desc: 'Chỉ ra cái sai, lệch lạc của một ý kiến để khẳng định quan điểm đúng đắn.', latexNote: 'Bác bỏ' },
          { label: 'Bình luận', code: '\\text{Thao tác Bình luận: Đánh giá đúng/sai và bài học}', preview: '\\text{Bình luận}', desc: 'Đưa ra nhận xét, đánh giá đúng sai và rút ra bài học nhận thức, hành động.', latexNote: 'Bình luận' },
          { label: 'So sánh', code: '\\text{Thao tác So sánh: Đối chiếu tìm nét tương đồng/dị biệt}', preview: '\\text{So sánh}', desc: 'Đặt các đối tượng cạnh nhau để làm rõ nét giống và khác biệt.', latexNote: 'So sánh' }
        ]
      },
      paragraph_types: {
        name: 'Cấu Trúc Đoạn Văn & Liên Kết Câu',
        items: [
          { label: 'Diễn dịch', code: '\\text{Đoạn Diễn dịch: Câu chủ đề ở đầu đoạn}', preview: '\\text{Diễn dịch}', desc: 'Câu chủ đề nằm ở đầu đoạn văn, các câu sau triển khai chi tiết.', latexNote: 'Diễn dịch' },
          { label: 'Quy nạp', code: '\\text{Đoạn Quy nạp: Câu chủ đề ở cuối đoạn}', preview: '\\text{Quy nạp}', desc: 'Các câu trước nêu dẫn chứng phân tích, câu cuối đúc kết chủ đề.', latexNote: 'Quy nạp' },
          { label: 'Tổng-Phân-Hợp', code: '\\text{Đoạn Tổng - Phân - Hợp}', preview: '\\text{Tổng-Phân-Hợp}', desc: 'Mở ý khái quát (Tổng), phân tích chi tiết (Phân), đúc kết nâng cao (Hợp).', latexNote: 'Tổng-Phân-Hợp' },
          { label: 'Song hành', code: '\\text{Đoạn Song hành: Các câu bình đẳng về ý nghĩa}', preview: '\\text{Song hành}', desc: 'Các câu trong đoạn có quan hệ bình đẳng ngang hàng.', latexNote: 'Song hành' },
          { label: 'Móc xích', code: '\\text{Đoạn Móc xích: Từ ngữ câu sau gối đầu câu trước}', preview: '\\text{Móc xích}', desc: 'Ý câu sau kế thừa, gối đầu từ ý câu đi liền trước.', latexNote: 'Móc xích' },
          { label: 'Phép thế', code: '\\text{Phép thế: Dùng đại từ/từ đồng nghĩa}', preview: '\\text{Phép thế}', desc: 'Dùng đại từ hoặc từ ngữ tương đương để thay thế, tránh lặp từ.', latexNote: 'Phép thế' },
          { label: 'Phép nối', code: '\\text{Phép nối: Tuy nhiên, Mặc dù, Do đó, Hơn nữa}', preview: '\\text{Phép nối}', desc: 'Dùng quan hệ từ nối liên kết chặt chẽ các câu và các đoạn.', latexNote: 'Phép nối' }
        ]
      },
      poetry_genres: {
        name: 'Thể Thơ & Phong Cách Ngôn Ngữ',
        items: [
          { label: 'Lục bát', code: '\\text{Thể thơ Lục bát (6 - 8, gieo vần lưng)}', preview: '\\text{Lục bát}', desc: 'Thể thơ truyền thống dân tộc: câu 6 hiệp vần tiếng thứ 6 câu 8.', latexNote: 'Lục bát' },
          { label: 'Song thất LB', code: '\\text{Thể thơ Song thất lục bát (7 - 7 - 6 - 8)}', preview: '\\text{Song thất LB}', desc: 'Kết hợp hai câu thất (7 chữ) và một cặp lục bát (6-8 chữ).', latexNote: 'Song thất LB' },
          { label: 'Thất ngôn bát cú', code: '\\text{Thất ngôn bát cú Đường luật (Đề - Thực - Luận - Kết)}', preview: '\\text{Thất ngôn}', desc: '8 câu, mỗi câu 7 chữ, niêm luật chặt chẽ, đối ở liên thực và luận.', latexNote: 'Thất ngôn bát cú' },
          { label: 'Thơ tự do', code: '\\text{Thể thơ Tự do (Số chữ linh hoạt, nhịp điệu mở)}', preview: '\\text{Thơ tự do}', desc: 'Không gò bó số câu số chữ, nhịp điệu cảm xúc khoáng đạt.', latexNote: 'Thơ tự do' },
          { label: 'PC Ngôn ngữ', code: '\\text{PC Ngôn ngữ: Sinh hoạt, Nghệ thuật, Báo chí, Chính luận, Khoa học, Hành chính}', preview: '\\text{PC Ngôn ngữ}', desc: '6 phong cách chức năng ngôn ngữ THPT.', latexNote: 'Phong cách ngôn ngữ' }
        ]
      }
    }
  },
  geography: {
    name: 'Địa Lý',
    shortName: 'Địa',
    icon: '🌍',
    badgeColor: 'sky',
    categories: {
      pop_labor: {
        name: 'Dân Số & Lao Động',
        items: [
          { label: 'Mật độ DS', code: '\\text{MĐDS} = \\frac{\\text{Số dân (người)}}{\\text{Diện tích (km}^2\\text{)}} \\text{ (người/km}^2\\text{)}', preview: '\\text{MĐDS} = \\frac{\\text{Dân}}{\\text{Diện tích}}', desc: 'Mật độ dân số: Số dân chia cho diện tích tự nhiên tương ứng.', latexNote: 'MĐDS = Dân / Diện tích' },
          { label: 'Gia tăng TN', code: 'T_g = S - T \\quad (\\% \\text{ hoặc } \\text{\\textperthousand})', preview: 'T_g = S - T', desc: 'Tỉ suất gia tăng tự nhiên bằng tỉ suất sinh (S) trừ tỉ suất tử (T).', latexNote: 'Tg = Sinh - Tử' },
          { label: 'Tỉ lệ thành thị', code: '\\% \\text{ Thành thị} = \\frac{\\text{Dân số thành thị}}{\\text{Tổng dân số}} \\times 100\\%', preview: '\\% \\text{Thành thị}', desc: 'Tỉ lệ dân số thành thị trong quá trình đô thị hóa.', latexNote: '% Thành thị' },
          { label: 'Tỉ lệ thất nghiệp', code: '\\% \\text{ TN} = \\frac{\\text{Số người thất nghiệp}}{\\text{Lực lượng lao động}} \\times 100\\%', preview: '\\% \\text{Thất nghiệp}', desc: 'Tỉ lệ thất nghiệp trong độ tuổi lao động.', latexNote: '% Thất nghiệp' }
        ]
      },
      climate_hydro: {
        name: 'Khí Hậu & Thủy Văn',
        items: [
          { label: 'Biên độ nhiệt', code: 'A_T = T_{\\max} - T_{\\min} \\text{ (}^\\circ\\text{C)}', preview: 'A_T = T_{\\max} - T_{\\min}', desc: 'Biên độ nhiệt độ năm (hoặc ngày) bằng nhiệt độ cao nhất trừ thấp nhất.', latexNote: 'Biên độ nhiệt' },
          { label: 'Nhiệt độ TB', code: '\\bar{T} = \\frac{\\sum_{i=1}^{12} T_i}{12} \\text{ (}^\\circ\\text{C)}', preview: '\\bar{T} = \\frac{\\sum T_i}{12}', desc: 'Nhiệt độ trung bình năm bằng tổng nhiệt độ 12 tháng chia cho 12.', latexNote: 'Nhiệt độ trung bình' },
          { label: 'Tổng lượng mưa', code: '\\sum P = \\sum_{i=1}^{12} P_i \\text{ (mm)}', preview: '\\sum P = \\sum P_i', desc: 'Tổng lượng mưa cả năm bằng tổng lượng mưa của cả 12 tháng.', latexNote: 'Tổng lượng mưa' },
          { label: 'Cân bằng ẩm', code: '\\text{Cân bằng ẩm} = P - E \\text{ (mm)}', preview: 'P - E \\text{ (mm)}', desc: 'Cân bằng ẩm bằng lượng mưa (P) trừ đi lượng bốc hơi (E).', latexNote: 'Cân bằng ẩm = Mưa - Bốc hơi' },
          { label: 'Lưu lượng nước', code: 'Q = \\frac{W}{t} \\text{ (m}^3\\text{/s)}', preview: 'Q = \\frac{W}{t}', desc: 'Lưu lượng dòng chảy sông ngòi (thể tích nước qua mặt cắt trên giây).', latexNote: 'Q = W / t' }
        ]
      },
      econ_trade: {
        name: 'Kinh Tế & Xuất Nhập Khẩu',
        items: [
          { label: 'Cán cân XNK', code: '\\text{Cán cân XNK} = \\text{Xuất khẩu} - \\text{Nhập khẩu (triệu USD)}', preview: '\\text{Cán cân} = \\text{XK} - \\text{NK}', desc: 'Cán cân xuất nhập khẩu (>0 xuất siêu, <0 nhập siêu).', latexNote: 'XK - NK' },
          { label: 'Tỉ số XK/NK', code: '\\text{Tỉ lệ} = \\frac{\\text{Xuất khẩu}}{\\text{Nhập khẩu}} \\times 100\\%', preview: '\\frac{\\text{XK}}{\\text{NK}} \\times 100\\%', desc: 'Tỉ số phần trăm giữa giá trị xuất khẩu so với nhập khẩu.', latexNote: 'XK / NK * 100%' },
          { label: 'Cơ cấu (%)', code: '\\%_i = \\frac{\\text{Giá trị } i}{\\text{Tổng số}} \\times 100\\%', preview: '\\%_i = \\frac{X_i}{\\text{Tổng}} \\times 100\\%', desc: 'Tỉ trọng của một ngành/thành phần trong tổng thể kinh tế (biểu đồ tròn/miền).', latexNote: 'Cơ cấu %' },
          { label: 'Tốc độ TT', code: '\\text{TĐTT} = \\frac{\\text{Giá trị năm sau}}{\\text{Giá trị năm gốc}} \\times 100\\% \\text{ (gốc = 100\\%)}', preview: '\\text{TĐTT} = \\frac{Y_n}{Y_0} \\times 100\\%', desc: 'Tốc độ tăng trưởng lấy năm đầu làm mốc 100% (biểu đồ đường).', latexNote: 'Tốc độ tăng trưởng' },
          { label: 'GDP / người', code: '\\text{GDP/người} = \\frac{\\text{Tổng GDP}}{\\text{Tổng dân số}} \\text{ (USD/người)}', preview: '\\text{GDP/người}', desc: 'Thu nhập bình quân GDP trên đầu người.', latexNote: 'GDP / người' }
        ]
      },
      agri_resources: {
        name: 'Nông Nghiệp & Tài Nguyên',
        items: [
          { label: 'Năng suất', code: '\\text{Năng suất} = \\frac{\\text{Sản lượng (tạ)}}{\\text{Diện tích gieo trồng (ha)}} \\text{ (tạ/ha)}', preview: '\\text{Năng suất} = \\frac{\\text{Sản lượng}}{\\text{Diện tích}}', desc: 'Năng suất cây trồng tính bằng tạ/ha hoặc tấn/ha.', latexNote: 'Sản lượng / Diện tích' },
          { label: 'Sản lượng', code: '\\text{Sản lượng} = \\text{Diện tích} \\times \\text{Năng suất}', preview: '\\text{Sản lượng} = S \\times NS', desc: 'Sản lượng nông nghiệp bằng diện tích nhân năng suất.', latexNote: 'Sản lượng = S * NS' },
          { label: 'Bình quân LT', code: '\\text{BQLT} = \\frac{\\text{Sản lượng lương thực (kg)}}{\\text{Dân số (người)}} \\text{ (kg/người)}', preview: '\\text{BQLT} = \\frac{\\text{Sản lượng}}{\\text{Dân số}}', desc: 'Bình quân lương thực có hạt trên đầu người hàng năm.', latexNote: 'BQLT / người' },
          { label: 'Độ che phủ rừng', code: 'R\\% = \\frac{\\text{Diện tích rừng}}{\\text{Tổng diện tích tự nhiên}} \\times 100\\%', preview: 'R\\% = \\frac{\\text{DT rừng}}{\\text{DT tự nhiên}}', desc: 'Tỉ lệ che phủ rừng so với diện tích tự nhiên.', latexNote: 'Độ che phủ rừng' }
        ]
      },
      carto_coords: {
        name: 'Tọa Độ & Kỹ Năng Biểu Đồ',
        items: [
          { label: 'Tọa độ VN', code: '23^\\circ 23\'\\text{B} - 8^\\circ 34\'\\text{B}, \\ 102^\\circ 09\'\\text{Đ} - 109^\\circ 28\'\\text{Đ}', preview: '23^\\circ 23\'\\text{B} \\dots', desc: 'Khung tọa độ các điểm cực phần đất liền nước ta (Lũng Cú, Đất Mũi, A Pa Chải, Mũi Đôi).', latexNote: 'Tọa độ cực VN' },
          { label: 'Bán kính R tròn', code: 'R_n = R_1 \\times \\sqrt{\\frac{S_n}{S_1}}', preview: 'R_n = R_1 \\sqrt{S_n / S_1}', desc: 'Bán kính biểu đồ tròn thể hiện quy mô và cơ cấu.', latexNote: 'R_n = R_1 * sqrt(S_n/S_1)' },
          { label: 'Tỉ lệ bản đồ', code: '\\frac{1}{M} = \\frac{d}{D}', preview: '1 / M = d / D', desc: 'Tỉ lệ bản đồ: khoảng cách trên bản đồ (d) so với thực địa (D).', latexNote: '1/M = d/D' }
        ]
      }
    }
  },
  symbols: {
    name: 'Ký Hiệu & Logic',
    shortName: 'Ký Hiệu',
    icon: '🔣',
    badgeColor: 'purple',
    categories: {
      math_sym: {
        name: 'Ký Hiệu Phép Tính',
        items: [
          { label: '±', code: '\\pm ', preview: '\\pm', desc: 'Dấu cộng trừ.', latexNote: '\\pm' },
          { label: '∓', code: '\\mp ', preview: '\\mp', desc: 'Dấu trừ cộng.', latexNote: '\\mp' },
          { label: '×', code: '\\times ', preview: '\\times', desc: 'Dấu nhân đại số.', latexNote: '\\times' },
          { label: '÷', code: '\\div ', preview: '\\div', desc: 'Dấu chia.', latexNote: '\\div' },
          { label: '·', code: '\\cdot ', preview: '\\cdot', desc: 'Dấu chấm nhân.', latexNote: '\\cdot' },
          { label: '≠', code: '\\neq ', preview: '\\neq', desc: 'Dấu khác nhau.', latexNote: '\\neq' },
          { label: '≈', code: '\\approx ', preview: '\\approx', desc: 'Dấu xấp xỉ gần bằng.', latexNote: '\\approx' },
          { label: '≤', code: '\\le ', preview: '\\le', desc: 'Nhỏ hơn hoặc bằng.', latexNote: '\\le' },
          { label: '≥', code: '\\ge ', preview: '\\ge', desc: 'Lớn hơn hoặc bằng.', latexNote: '\\ge' },
          { label: '∞', code: '\\infty ', preview: '\\infty', desc: 'Ký hiệu vô cực (vô cùng).', latexNote: '\\infty' }
        ]
      },
      greek: {
        name: 'Ký Tự Hy Lạp',
        items: [
          { label: 'π', code: '\\pi ', preview: '\\pi', desc: 'Ký tự Pi.', latexNote: '\\pi' },
          { label: 'Δ', code: '\\Delta ', preview: '\\Delta', desc: 'Ký tự Delta in hoa.', latexNote: '\\Delta' },
          { label: 'α', code: '\\alpha ', preview: '\\alpha', desc: 'Ký tự Alpha.', latexNote: '\\alpha' },
          { label: 'β', code: '\\beta ', preview: '\\beta', desc: 'Ký tự Beta.', latexNote: '\\beta' },
          { label: 'γ', code: '\\gamma ', preview: '\\gamma', desc: 'Ký tự Gamma.', latexNote: '\\gamma' },
          { label: 'θ', code: '\\theta ', preview: '\\theta', desc: 'Ký tự Theta (góc).', latexNote: '\\theta' },
          { label: 'λ', code: '\\lambda ', preview: '\\lambda', desc: 'Ký tự Lambda (bước sóng).', latexNote: '\\lambda' },
          { label: 'μ', code: '\\mu ', preview: '\\mu', desc: 'Ký tự Mu (vi mô, micro 10⁻⁶).', latexNote: '\\mu' },
          { label: 'σ', code: '\\sigma ', preview: '\\sigma', desc: 'Ký tự Sigma thường (độ lệch chuẩn).', latexNote: '\\sigma' },
          { label: 'ω', code: '\\omega ', preview: '\\omega', desc: 'Ký tự Omega thường (tần số góc).', latexNote: '\\omega' },
          { label: 'Ω', code: '\\Omega ', preview: '\\Omega', desc: 'Ký tự Omega in hoa (Ohm đơn vị điện trở).', latexNote: '\\Omega' }
        ]
      },
      logic_set: {
        name: 'Tập Hợp & Mệnh Đề Logic',
        items: [
          { label: '⇒', code: '\\Rightarrow ', preview: '\\Rightarrow', desc: 'Dấu suy ra (kéo theo).', latexNote: '\\Rightarrow' },
          { label: '⇔', code: '\\Leftrightarrow ', preview: '\\Leftrightarrow', desc: 'Dấu tương đương (khi và chỉ khi).', latexNote: '\\Leftrightarrow' },
          { label: '∈', code: '\\in ', preview: '\\in', desc: 'Ký hiệu phần tử thuộc tập hợp.', latexNote: '\\in' },
          { label: '∉', code: '\\notin ', preview: '\\notin', desc: 'Ký hiệu không thuộc tập hợp.', latexNote: '\\notin' },
          { label: '⊂', code: '\\subset ', preview: '\\subset', desc: 'Tập hợp con.', latexNote: '\\subset' },
          { label: '∪', code: '\\cup ', preview: '\\cup', desc: 'Phép hợp hai tập hợp.', latexNote: '\\cup' },
          { label: '∩', code: '\\cap ', preview: '\\cap', desc: 'Phép giao hai tập hợp.', latexNote: '\\cap' },
          { label: '∀', code: '\\forall ', preview: '\\forall', desc: 'Ký hiệu với mọi.', latexNote: '\\forall' },
          { label: '∃', code: '\\exists ', preview: '\\exists', desc: 'Ký hiệu tồn tại.', latexNote: '\\exists' },
          { label: 'ℝ', code: '\\mathbb{R}', preview: '\\mathbb{R}', desc: 'Tập hợp số thực.', latexNote: '\\mathbb{R}' },
          { label: 'ℕ', code: '\\mathbb{N}', preview: '\\mathbb{N}', desc: 'Tập hợp số tự nhiên.', latexNote: '\\mathbb{N}' },
          { label: 'ℤ', code: '\\mathbb{Z}', preview: '\\mathbb{Z}', desc: 'Tập hợp số nguyên.', latexNote: '\\mathbb{Z}' },
          { label: '∅', code: '\\emptyset ', preview: '\\emptyset', desc: 'Tập hợp rỗng.', latexNote: '\\emptyset' }
        ]
      },
      brackets_sys: {
        name: 'Dấu Ngoặc & Hệ PT',
        items: [
          { label: '( )', code: '(x)', preview: '(x)', desc: 'Ngoặc tròn.', latexNote: '(x)' },
          { label: '[ ]', code: '[x]', preview: '[x]', desc: 'Ngoặc vuông.', latexNote: '[x]' },
          { label: '{ }', code: '\\{x\\}', preview: '\\{x\\}', desc: 'Ngoặc nhọn tập hợp.', latexNote: '\\{x\\}' },
          { label: 'Hệ 2 PT', code: '\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}', preview: '\\begin{cases} ... \\end{cases}', desc: 'Hệ hai phương trình đại số.', latexNote: '\\begin{cases} ... \\end{cases}' },
          { label: '(a; b)', code: '(a; b)', preview: '(a; b)', desc: 'Khoảng mở từ a đến b.', latexNote: '(a; b)' },
          { label: '[a; b]', code: '[a; b]', preview: '[a; b)', desc: 'Đoạn đóng từ a đến b.', latexNote: '[a; b]' },
          { label: '[a; b)', code: '[a; b)', preview: '[a; b)', desc: 'Nửa khoảng lấy đầu mút a.', latexNote: '[a; b)' }
        ]
      }
    }
  }
};

export default function HierarchicalMathPalette({
  isCollapsed = false,
  onToggleCollapse,
  activeTarget = 'theoryRecap',
  onInsertSnippet
}) {
  const [selectedDomain, setSelectedDomain] = useState('math');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accordion toggle state: map categoryKey -> boolean (default all open)
  const [openCategories, setOpenCategories] = useState(() => {
    const initial = {};
    Object.keys(HIERARCHICAL_CATALOG).forEach(domKey => {
      Object.keys(HIERARCHICAL_CATALOG[domKey].categories).forEach((catKey, idx) => {
        // Open first 2 categories by default for fast reach
        initial[`${domKey}-${catKey}`] = idx < 2;
      });
    });
    return initial;
  });

  // 2-second hover card state
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverCardPos, setHoverCardPos] = useState({ top: 0, left: 0 });
  const hoverTimerRef = useRef(null);

  const domainKeys = Object.keys(HIERARCHICAL_CATALOG);
  const currentDomain = HIERARCHICAL_CATALOG[selectedDomain] || HIERARCHICAL_CATALOG.math;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const toggleCategoryOpen = (domKey, catKey) => {
    const key = `${domKey}-${catKey}`;
    setOpenCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Hover 2s handler
  const handleItemMouseEnter = (item, catName, e) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Exactly 2 seconds (2000ms) hover trigger as requested by user
    hoverTimerRef.current = setTimeout(() => {
      setHoveredItem({ ...item, categoryName: catName });
      setHoverCardPos({
        top: Math.min(window.innerHeight - 300, Math.max(20, rect.top - 20)),
        left: rect.right + 12
      });
    }, 2000);
  };

  const handleItemMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
  };

  const handleItemClick = (item) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
    if (onInsertSnippet) {
      onInsertSnippet(activeTarget, item.code);
    }
  };

  // Filtered search results across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.trim().toLowerCase();
    const results = [];

    Object.keys(HIERARCHICAL_CATALOG).forEach(domKey => {
      const dom = HIERARCHICAL_CATALOG[domKey];
      Object.keys(dom.categories).forEach(catKey => {
        const cat = dom.categories[catKey];
        cat.items.forEach(item => {
          if (
            item.label.toLowerCase().includes(query) ||
            item.desc?.toLowerCase().includes(query) ||
            item.code.toLowerCase().includes(query)
          ) {
            results.push({ ...item, domainName: dom.name, categoryName: cat.name });
          }
        });
      });
    });

    return results;
  }, [searchQuery]);

  // COLLAPSED ULTRA-THIN SIDEBAR (CLEAN WHITE TONE)
  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-3 space-y-3 shrink-0 select-none h-full z-20 shadow-xs">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer border border-slate-200"
          title="Mở rộng thanh công cụ ký hiệu"
        >
          <ChevronRight className="w-4 h-4 text-cyan-600" />
        </button>
        <div className="w-6 h-[1px] bg-slate-200 my-1"></div>
        {domainKeys.map((key) => {
          const dom = HIERARCHICAL_CATALOG[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedDomain(key);
                if (onToggleCollapse) onToggleCollapse();
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer ${
                selectedDomain === key
                  ? 'bg-cyan-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
              title={dom.name}
            >
              <span>{dom.icon}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // EXPANDED SIDEBAR: PURE WHITE TONE WITH ACCORDION TOGGLE TREE
  return (
    <div className="w-72 sm:w-80 bg-white text-slate-800 border-r border-slate-200 flex flex-col shrink-0 select-none text-xs h-full relative z-20 shadow-sm">
      
      {/* 1. Header with Collapse Button & Active Target Display */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse"></span>
          <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
            Thư Viện Ký Hiệu & Hợp Chất
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Thu gọn sidebar sang thanh icon siêu mỏng"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Fast Instant Search Input */}
      <div className="p-2 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm nhanh H2SO4, √x, ADN, MĐDS, So sánh, a/b..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Domain Switcher Tabs (Toán, Hóa, Lý, Sinh, Văn, Địa, Ký Hiệu) */}
      {!searchResults && (
        <div className="p-2 border-b border-slate-200 bg-slate-50/70 grid grid-cols-4 gap-1">
          {domainKeys.map((domKey) => {
            const dom = HIERARCHICAL_CATALOG[domKey];
            const isAct = selectedDomain === domKey;
            return (
              <button
                key={domKey}
                type="button"
                onClick={() => setSelectedDomain(domKey)}
                className={`py-1.5 px-1 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isAct
                    ? 'bg-cyan-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
                }`}
                title={dom.name}
              >
                <span className="text-sm">{dom.icon}</span>
                <span className="text-[10px] truncate max-w-full font-medium">{dom.shortName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. MAIN BODY: ACCORDION TOGGLE TREE (CÂY THƯ MỤC CÔNG THỨC & HỢP CHẤT ĐỒ SỘ) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        
        {/* CASE A: SEARCH RESULTS LIST */}
        {searchResults ? (
          <div className="space-y-1.5">
            <div className="text-[10.5px] font-bold text-slate-500 px-1 pb-1 flex items-center justify-between">
              <span>Tìm thấy {searchResults.length} kết quả:</span>
              <span className="text-cyan-700 font-mono text-[9px]">Click chèn ngay</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                Không tìm thấy công thức hoặc hợp chất phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => handleItemMouseEnter(item, item.categoryName, e)}
                    onMouseLeave={handleItemMouseLeave}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50/80 hover:border-cyan-400 border border-slate-200 text-slate-700 hover:text-cyan-900 transition-all flex flex-col items-start gap-1 cursor-pointer group shadow-2xs"
                  >
                    <div className="w-full flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold truncate">{item.label}</span>
                      <span className="text-[9px] text-slate-400 font-normal truncate max-w-[50px]">{item.domainName}</span>
                    </div>
                    <div 
                      className="text-xs text-cyan-800 font-serif self-center"
                      dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.preview || item.code, false) }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CASE B: ACCORDION TREE OF CATEGORIES */
          Object.keys(currentDomain.categories).map((catKey) => {
            const cat = currentDomain.categories[catKey];
            const isCatOpen = openCategories[`${selectedDomain}-${catKey}`] ?? true;

            return (
              <div 
                key={catKey}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-colors"
              >
                {/* Accordion Folder Header */}
                <button
                  type="button"
                  onClick={() => toggleCategoryOpen(selectedDomain, catKey)}
                  className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-2 text-slate-800 font-bold text-[11.5px] transition-colors cursor-pointer border-b border-slate-200/60"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {isCatOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9.5px] font-mono shrink-0">
                    {cat.items?.length || 0}
                  </span>
                </button>

                {/* Accordion Folder Content (Compact Formula/Compound Chips) */}
                {isCatOpen && (
                  <div className="p-2 bg-white">
                    <div className="grid grid-cols-2 gap-1.5">
                      {cat.items?.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={(e) => handleItemMouseEnter(item, cat.name, e)}
                          onMouseLeave={handleItemMouseLeave}
                          className="px-2 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50/80 hover:border-cyan-400 border border-slate-200 text-slate-700 hover:text-cyan-900 transition-all flex items-center justify-between gap-1 cursor-pointer group shadow-2xs"
                        >
                          <span className="text-[11px] font-semibold text-slate-800 group-hover:text-cyan-800 truncate">
                            {item.label}
                          </span>
                          <div 
                            className="text-[11.5px] text-cyan-700 font-serif shrink-0 px-1 py-0.5 rounded bg-white border border-slate-200 group-hover:border-cyan-300"
                            dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.preview || item.code, false) }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Minimalist Footer Guidance */}
      <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10.5px] text-slate-500 text-center flex items-center justify-center gap-1.5">
        <Clock className="w-3 h-3 text-cyan-600" />
        <span>Rê chuột 2s xem hướng dẫn SGK • Nhấp để chèn tại con trỏ</span>
      </div>

      {/* 6. 2-SECOND HOVER CARD (CLEAN WHITE PREVIEW MODAL) */}
      {hoveredItem && (
        <div
          style={{ 
            top: `${hoverCardPos.top}px`, 
            left: `${hoverCardPos.left}px`,
            position: 'fixed'
          }}
          className="z-[999] w-80 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-cyan-500 shadow-2xl p-4 text-slate-900 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-[10.5px] font-black uppercase text-cyan-700 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentDomain?.name} • {hoveredItem.categoryName}</span>
            </span>
            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono font-bold">
              Chuẩn GDPT 2018
            </span>
          </div>

          {/* Large Live KaTeX Formula */}
          <div className="my-3 py-3 px-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex items-center justify-center min-h-[60px] shadow-inner">
            <div 
              className="text-lg text-cyan-900 font-serif leading-none"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(hoveredItem.preview || hoveredItem.code, true) }}
            />
          </div>

          {/* Title & Pedagogical Description */}
          <div className="space-y-1">
            <div className="font-extrabold text-[13px] text-slate-900">
              {hoveredItem.label}
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal">
              {hoveredItem.desc || 'Chèn ký hiệu hoặc công thức vào bài giảng tại vị trí con trỏ.'}
            </p>
          </div>

          {/* LaTeX Syntax */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-500 font-medium">Mã nguồn LaTeX:</span>
            <code className="text-cyan-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] font-bold">
              ${hoveredItem.code}$
            </code>
          </div>

          <div className="mt-2 text-[10.5px] text-emerald-700 font-extrabold flex items-center gap-1">
            <span>⚡ Nhấp chuột để chèn ngay vào vị trí con trỏ</span>
          </div>
        </div>
      )}

    </div>
  );
}
