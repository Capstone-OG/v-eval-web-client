import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Sigma,
  FlaskConical,
  Atom,
  Dna,
  BookOpen,
  Landmark,
  Globe,
  Languages,
  X,
  Plus
} from 'lucide-react';
import { renderKatexHtml } from '../common/MathText';

/**
 * Comprehensive GDPT 2018 (Lớp 10, 11, 12) Academic Subject Palette Catalog
 * Strictly organized per subject into:
 *  - symbolGroups: categorized symbols, ions, functional groups, reaction conditions, units & notation
 *  - formulaGroups: categorized chemical compounds (inorganic & organic), equations, laws & calculation formulas
 * All items render via KaTeX with zero raw LaTeX syntax ever shown to the user.
 */
export const SUBJECT_PALETTE_CATALOG = {
  /* ==========================================================================
   * 1. TOÁN HỌC (LỚP 10, 11, 12 & ĐGNL — ĐẦY ĐỦ CHUYÊN SÂU)
   * ========================================================================== */
  math: {
    id: 'math',
    name: 'Toán học',
    shortName: 'Toán',
    icon: Sigma,
    symbolGroups: [
      {
        title: 'Phép toán, Quan hệ & Bất đẳng thức',
        items: [
          { label: 'Cộng trừ', code: '\\pm', desc: 'Dấu cộng hoặc trừ hai giá trị đối nhau.' },
          { label: 'Trừ cộng', code: '\\mp', desc: 'Dấu trừ hoặc cộng đảo dấu.' },
          { label: 'Nhân chấm', code: '\\cdot', desc: 'Dấu nhân đại số hoặc tích vô hướng.' },
          { label: 'Nhân chéo', code: '\\times', desc: 'Phép nhân số học hoặc tích Đề-các.' },
          { label: 'Phép chia', code: '\\div', desc: 'Phép chia số học.' },
          { label: 'Khác nhau', code: '\\neq', desc: 'Quan hệ không bằng nhau (điều kiện xác định).' },
          { label: 'Nhỏ hơn bằng', code: '\\le', desc: 'Bất đẳng thức nhỏ hơn hoặc bằng.' },
          { label: 'Lớn hơn bằng', code: '\\ge', desc: 'Bất đẳng thức lớn hơn hoặc bằng.' },
          { label: 'Nhỏ hơn rất nhiều', code: '\\ll', desc: 'Nhỏ hơn rất nhiều so với.' },
          { label: 'Lớn hơn rất nhiều', code: '\\gg', desc: 'Lớn hơn rất nhiều so với.' },
          { label: 'Xấp xỉ', code: '\\approx', desc: 'Giá trị xấp xỉ gần bằng.' },
          { label: 'Đồng nhất / Đồng dư', code: '\\equiv', desc: 'Đồng nhất thức hoặc đồng dư thức.' },
          { label: 'Tỉ lệ thuận', code: '\\propto', desc: 'Ký hiệu tỉ lệ thuận.' },
          { label: 'Giai thừa n!', code: 'n!', desc: 'Tích từ 1 đến n (0! = 1).' },
          { label: 'Trị tuyệt đối', code: '|x|', desc: 'Giá trị tuyệt đối của số thực x.' },
          { label: 'Phần nguyên [x]', code: '\\lfloor x \\rfloor', desc: 'Số nguyên lớn nhất không vượt quá x.' },
          { label: 'Vô cực', code: '\\infty', desc: 'Ký hiệu vô cực (vô cùng).' },
          { label: 'Âm vô cực', code: '-\\infty', desc: 'Giới hạn tiến về âm vô cực.' },
          { label: 'Dương vô cực', code: '+\\infty', desc: 'Giới hạn tiến về dương vô cực.' },
          { label: 'Đồng biến', code: '\\nearrow', desc: 'Mũi tên hàm số đồng biến đi lên.' },
          { label: 'Nghịch biến', code: '\\searrow', desc: 'Mũi tên hàm số nghịch biến đi xuống.' }
        ]
      },
      {
        title: 'Tập hợp, Mệnh đề & Khoảng – Đoạn',
        items: [
          { label: 'Suy ra', code: '\\Rightarrow', desc: 'Phép kéo theo / suy ra mệnh đề.' },
          { label: 'Tương đương', code: '\\Leftrightarrow', desc: 'Biến đổi tương đương hai chiều.' },
          { label: 'Ánh xạ tới', code: '\\mapsto', desc: 'Quy tắc ánh xạ phần tử x ↦ f(x).' },
          { label: 'Với mọi', code: '\\forall', desc: 'Lượng từ phổ quát: với mọi phần tử.' },
          { label: 'Tồn tại', code: '\\exists', desc: 'Lượng từ tồn tại ít nhất một phần tử.' },
          { label: 'Không tồn tại', code: '\\nexists', desc: 'Không tồn tại phần tử nào thỏa mãn.' },
          { label: 'Thuộc', code: '\\in', desc: 'Phần tử thuộc tập hợp.' },
          { label: 'Không thuộc', code: '\\notin', desc: 'Phần tử không thuộc tập hợp.' },
          { label: 'Tập con', code: '\\subset', desc: 'Quan hệ tập hợp con.' },
          { label: 'Tập con hoặc bằng', code: '\\subseteq', desc: 'Tập hợp con hoặc trùng nhau.' },
          { label: 'Chứa tập con', code: '\\supset', desc: 'Tập hợp chứa tập hợp con.' },
          { label: 'Hợp tập hợp', code: '\\cup', desc: 'Phép hợp hai tập hợp A ∪ B.' },
          { label: 'Giao tập hợp', code: '\\cap', desc: 'Phép giao hai tập hợp A ∩ B.' },
          { label: 'Hiệu tập hợp', code: '\\setminus', desc: 'Phép hiệu hai tập hợp A \\ B.' },
          { label: 'Phần bù', code: 'C_E A', desc: 'Phần bù của tập con A trong tập E.' },
          { label: 'Tập rỗng', code: '\\emptyset', desc: 'Tập hợp rỗng không chứa phần tử.' },
          { label: 'Tập số tự nhiên', code: '\\mathbb{N}', desc: 'Tập hợp các số tự nhiên 0, 1, 2...' },
          { label: 'Tập tự nhiên khác 0', code: '\\mathbb{N}^*', desc: 'Tập hợp các số tự nhiên dương 1, 2, 3...' },
          { label: 'Tập số nguyên', code: '\\mathbb{Z}', desc: 'Tập hợp các số nguyên âm, 0, dương.' },
          { label: 'Tập số hữu tỉ', code: '\\mathbb{Q}', desc: 'Tập hợp các số hữu tỉ a/b.' },
          { label: 'Tập số thực', code: '\\mathbb{R}', desc: 'Tập hợp toàn bộ các số thực.' },
          { label: 'Tập số phức', code: '\\mathbb{C}', desc: 'Tập hợp các số phức z = a + bi.' },
          { label: 'Khoảng (a; b)', code: '(a; b)', desc: 'Khoảng mở từ a đến b.' },
          { label: 'Đoạn [a; b]', code: '[a; b]', desc: 'Đoạn đóng lấy cả hai đầu mút a và b.' }
        ]
      },
      {
        title: 'Ký tự Hy Lạp & Hằng số Toán học',
        items: [
          { label: 'Alpha', code: '\\alpha', desc: 'Góc hoặc nghiệm Alpha.' },
          { label: 'Beta', code: '\\beta', desc: 'Góc hoặc nghiệm Beta.' },
          { label: 'Gamma', code: '\\gamma', desc: 'Góc hoặc hằng số Gamma.' },
          { label: 'Delta thường', code: '\\delta', desc: 'Số gia nhỏ Delta.' },
          { label: 'Delta hoa', code: '\\Delta', desc: 'Biệt thức Delta hoặc đường thẳng Δ.' },
          { label: 'Delta phẩy', code: "\\Delta'", desc: 'Biệt thức Delta thu gọn.' },
          { label: 'Epsilon', code: '\\varepsilon', desc: 'Đại lượng vô cùng bé Epsilon.' },
          { label: 'Zeta', code: '\\zeta', desc: 'Ký tự Hy Lạp Zeta.' },
          { label: 'Eta', code: '\\eta', desc: 'Ký tự Hy Lạp Eta.' },
          { label: 'Theta', code: '\\theta', desc: 'Góc lượng giác Theta.' },
          { label: 'Lambda', code: '\\lambda', desc: 'Tham số tỉ lệ Lambda.' },
          { label: 'Mu', code: '\\mu', desc: 'Kỳ vọng hoặc tham số Mu.' },
          { label: 'Số Pi', code: '\\pi', desc: 'Hằng số Pi ≈ 3,14159265.' },
          { label: 'Cơ số tự nhiên e', code: 'e', desc: 'Hằng số Euler e ≈ 2,7182818.' },
          { label: 'Đơn vị ảo i', code: 'i^2 = -1', desc: 'Đơn vị ảo trong tập số phức.' },
          { label: 'Rho', code: '\\rho', desc: 'Bán kính cong hoặc mật độ Rho.' },
          { label: 'Sigma thường', code: '\\sigma', desc: 'Độ lệch chuẩn thống kê Sigma.' },
          { label: 'Sigma hoa', code: '\\Sigma', desc: 'Ký hiệu tổng Sigma.' },
          { label: 'Tau', code: '\\tau', desc: 'Ký tự Hy Lạp Tau.' },
          { label: 'Phi thường', code: '\\varphi', desc: 'Góc pha ban đầu Phi.' },
          { label: 'Phi hoa', code: '\\Phi', desc: 'Hàm phân phối chuẩn Phi.' },
          { label: 'Omega thường', code: '\\omega', desc: 'Tần số góc Omega.' },
          { label: 'Omega hoa', code: '\\Omega', desc: 'Không gian mẫu xác suất Omega.' }
        ]
      },
      {
        title: 'Hình học Phẳng, Không gian & Vectơ',
        items: [
          { label: 'Vuông góc', code: '\\perp', desc: 'Quan hệ vuông góc giữa hai đường hoặc mặt.' },
          { label: 'Song song', code: '\\parallel', desc: 'Quan hệ song song.' },
          { label: 'Trùng nhau', code: '\\equiv', desc: 'Hai đường thẳng hoặc hai mặt phẳng trùng nhau.' },
          { label: 'Góc', code: '\\angle', desc: 'Ký hiệu góc hình học.' },
          { label: 'Góc đỉnh B', code: '\\widehat{ABC}', desc: 'Góc tạo bởi ba điểm A, B, C.' },
          { label: 'Cung lượng giác', code: '\\overset{\\frown}{AB}', desc: 'Cung tròn nối hai điểm A và B.' },
          { label: 'Tam giác', code: '\\triangle ABC', desc: 'Tam giác ABC.' },
          { label: 'Đồng dạng', code: '\\sim', desc: 'Quan hệ hai hình đồng dạng.' },
          { label: 'Bằng nhau hình học', code: '\\cong', desc: 'Hai hình bằng nhau (đồng dạng tỉ số 1).' },
          { label: 'Độ góc', code: '^{\\circ}', desc: 'Đơn vị độ của góc.' },
          { label: 'Vectơ a', code: '\\vec{a}', desc: 'Ký hiệu vectơ có hướng.' },
          { label: 'Vectơ AB', code: '\\vec{AB}', desc: 'Vectơ có điểm đầu A, điểm cuối B.' },
          { label: 'Vectơ-không', code: '\\vec{0}', desc: 'Vectơ có điểm đầu và điểm cuối trùng nhau.' },
          { label: 'Vectơ đơn vị Ox, Oy, Oz', code: '\\vec{i},\\; \\vec{j},\\; \\vec{k}', desc: 'Ba vectơ đơn vị trên ba trục tọa độ Oxyz.' },
          { label: 'Vectơ pháp tuyến', code: '\\vec{n}', desc: 'Vectơ pháp tuyến vuông góc mặt phẳng/đường thẳng.' },
          { label: 'Vectơ chỉ phương', code: '\\vec{u}', desc: 'Vectơ chỉ phương song song hoặc trùng đường thẳng.' },
          { label: 'Độ dài vectơ', code: '|\\vec{a}|', desc: 'Độ dài / môđun của vectơ.' },
          { label: 'Mặt phẳng (P)', code: '(P)', desc: 'Ký hiệu mặt phẳng (P) trong không gian.' },
          { label: 'Mặt phẳng (α)', code: '(\\alpha)', desc: 'Ký hiệu mặt phẳng (α) trong không gian.' },
          { label: 'Mặt cầu (S)', code: '(S)', desc: 'Ký hiệu mặt cầu (S) trong không gian.' }
        ]
      },
      {
        title: 'Giải tích: Giới hạn, Đạo hàm & Tích phân',
        items: [
          { label: 'Giới hạn lim', code: '\\lim_{x \\to x_0}', desc: 'Giới hạn khi x tiến tới x₀.' },
          { label: 'Giới hạn phải', code: 'x \\to x_0^+', desc: 'x tiến tới x₀ về bên phải (x > x₀).' },
          { label: 'Giới hạn trái', code: 'x \\to x_0^-', desc: 'x tiến tới x₀ về bên trái (x < x₀).' },
          { label: 'Đạo hàm cấp 1', code: "f'(x)", desc: 'Đạo hàm cấp một của hàm số f(x).' },
          { label: 'Đạo hàm cấp 2', code: "f''(x)", desc: 'Đạo hàm cấp hai của hàm số f(x).' },
          { label: 'Đạo hàm cấp n', code: 'f^{(n)}(x)', desc: 'Đạo hàm cấp n của hàm số f(x).' },
          { label: 'Ký hiệu Leibniz', code: '\\frac{dy}{dx}', desc: 'Đạo hàm dy trên dx.' },
          { label: 'Điểm cực đại', code: 'x_{CĐ}', desc: 'Hoành độ điểm cực đại của hàm số.' },
          { label: 'Điểm cực tiểu', code: 'x_{CT}', desc: 'Hoành độ điểm cực tiểu của hàm số.' },
          { label: 'Giá trị cực đại', code: 'y_{CĐ}', desc: 'Giá trị cực đại của hàm số.' },
          { label: 'Giá trị cực tiểu', code: 'y_{CT}', desc: 'Giá trị cực tiểu của hàm số.' },
          { label: 'Nguyên hàm', code: '\\int', desc: 'Dấu nguyên hàm / tích phân.' },
          { label: 'Tích phân cận a→b', code: '\\int_{a}^{b}', desc: 'Tích phân xác định từ cận dưới a đến cận trên b.' },
          { label: 'Thế cận F(x)|', code: '\\Big|_{a}^{b}', desc: 'Ký hiệu thế cận Newton – Leibniz.' },
          { label: 'Vi phân dx', code: '\\,dx', desc: 'Vi phân theo biến x.' }
        ]
      },
      {
        title: 'Tổ hợp, Xác suất & Thống kê',
        items: [
          { label: 'Hoán vị Pn', code: 'P_n', desc: 'Số hoán vị của n phần tử.' },
          { label: 'Chỉnh hợp A(n,k)', code: 'A_n^k', desc: 'Số chỉnh hợp chập k của n phần tử.' },
          { label: 'Tổ hợp C(n,k)', code: 'C_n^k', desc: 'Số tổ hợp chập k của n phần tử.' },
          { label: 'Biến cố đối', code: '\\bar{A}', desc: 'Biến cố đối của biến cố A.' },
          { label: 'Xác suất P(A)', code: 'P(A)', desc: 'Xác suất của biến cố A.' },
          { label: 'Xác suất điều kiện', code: 'P(A|B)', desc: 'Xác suất của A với điều kiện B đã xảy ra.' },
          { label: 'Số trung bình', code: '\\bar{x}', desc: 'Số trung bình cộng của mẫu số liệu.' },
          { label: 'Trung vị Me', code: 'M_e', desc: 'Trung vị của mẫu số liệu.' },
          { label: 'Mốt Mo', code: 'M_o', desc: 'Giá trị có tần số lớn nhất trong mẫu.' },
          { label: 'Tứ phân vị Q₁, Q₂, Q₃', code: 'Q_1,\\; Q_2,\\; Q_3', desc: 'Ba tứ phân vị chia mẫu số liệu thành 4 phần bằng nhau.' },
          { label: 'Khoảng biến thiên R', code: 'R', desc: 'Hiệu giữa giá trị lớn nhất và nhỏ nhất.' },
          { label: 'Khoảng tứ phân vị', code: '\\Delta_Q = Q_3 - Q_1', desc: 'Hiệu giữa tứ phân vị thứ ba và thứ nhất.' },
          { label: 'Phương sai mẫu', code: 's^2', desc: 'Phương sai của mẫu số liệu.' },
          { label: 'Độ lệch chuẩn mẫu', code: 's', desc: 'Độ lệch chuẩn của mẫu số liệu (s = √s²).' },
          { label: 'Kỳ vọng & Phương sai BNN', code: 'E(X),\\; V(X)', desc: 'Kỳ vọng và phương sai của biến ngẫu nhiên rời rạc X.' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Đại số, Căn thức, Lũy thừa & 7 Hằng đẳng thức',
        items: [
          { label: 'Phân số & Tính chất tỉ lệ thức', code: '\\frac{a}{b} = \\frac{c}{d} = \\frac{a \\pm c}{b \\pm d}', desc: 'Tính chất dãy tỉ số bằng nhau.' },
          { label: 'Căn bậc hai & Hằng đẳng thức căn', code: '\\sqrt{A^2} = |A|, \\quad \\sqrt{A \\cdot B} = \\sqrt{A}\\cdot\\sqrt{B} \\ (A,B \\ge 0)', desc: 'Khai căn tích và bình phương.' },
          { label: 'Liên hợp khử căn mẫu số', code: '\\frac{1}{\\sqrt{A} \\pm \\sqrt{B}} = \\frac{\\sqrt{A} \\mp \\sqrt{B}}{A - B}', desc: 'Nhân lượng liên hợp để trục căn thức ở mẫu.' },
          { label: 'Các quy tắc Lũy thừa số thực', code: 'a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{m \\cdot n}', desc: 'Ba phép biến đổi lũy thừa cùng cơ số a > 0.' },
          { label: 'Lũy thừa mũ âm & Mũ phân số', code: 'a^{-n} = \\frac{1}{a^n}, \\quad a^{\\frac{m}{n}} = \\sqrt[n]{a^m}', desc: 'Chuyển đổi số mũ nguyên âm và số mũ hữu tỉ.' },
          { label: '1. Bình phương của một tổng', code: '(a + b)^2 = a^2 + 2ab + b^2', desc: 'Hằng đẳng thức đáng nhớ số 1.' },
          { label: '2. Bình phương của một hiệu', code: '(a - b)^2 = a^2 - 2ab + b^2', desc: 'Hằng đẳng thức đáng nhớ số 2.' },
          { label: '3. Hiệu hai bình phương', code: 'a^2 - b^2 = (a - b)(a + b)', desc: 'Hằng đẳng thức đáng nhớ số 3.' },
          { label: '4. Lập phương của một tổng', code: '(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3 = a^3 + b^3 + 3ab(a+b)', desc: 'Hằng đẳng thức đáng nhớ số 4.' },
          { label: '5. Lập phương của một hiệu', code: '(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3 = a^3 - b^3 - 3ab(a-b)', desc: 'Hằng đẳng thức đáng nhớ số 5.' },
          { label: '6. Tổng hai lập phương', code: 'a^3 + b^3 = (a + b)(a^2 - ab + b^2)', desc: 'Hằng đẳng thức đáng nhớ số 6.' },
          { label: '7. Hiệu hai lập phương', code: 'a^3 - b^3 = (a - b)(a^2 + ab + b^2)', desc: 'Hằng đẳng thức đáng nhớ số 7.' }
        ]
      },
      {
        title: 'Phương trình Bậc 2, Vi-ét & Bất đẳng thức Cổ điển',
        items: [
          { label: 'Biệt thức Delta & Delta phẩy', code: "\\Delta = b^2 - 4ac, \\quad \\Delta' = b'^2 - ac \\ (b = 2b')", desc: 'Xét số nghiệm của phương trình bậc hai ax² + bx + c = 0.' },
          { label: 'Công thức nghiệm phương trình bậc hai', code: 'x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-b\\prime \\pm \\sqrt{\\Delta\\prime}}{a}', desc: 'Nghiệm tổng quát và nghiệm thu gọn khi Δ ≥ 0.' },
          { label: 'Định lí Vi-ét thuận & đảo', code: '\\begin{cases} S = x_1 + x_2 = -\\frac{b}{a} \\\\ P = x_1 x_2 = \\frac{c}{a} \\end{cases} \\Rightarrow X^2 - SX + P = 0', desc: 'Liên hệ giữa tổng và tích hai nghiệm với hệ số phương trình.' },
          { label: 'Biểu thức đối xứng hai nghiệm Vi-ét', code: 'x_1^2 + x_2^2 = S^2 - 2P, \\quad x_1^3 + x_2^3 = S^3 - 3SP, \\quad |x_1 - x_2| = \\sqrt{S^2 - 4P}', desc: 'Biểu diễn các tổng đối xứng qua S = x₁+x₂ và P = x₁x₂.' },
          { label: 'Điều kiện dấu hai nghiệm bậc hai', code: 'P < 0 \\text{ (trái dấu)}; \\quad \\begin{cases} \\Delta \\ge 0, P > 0 \\\\ S > 0 \\end{cases} \\text{ (2 nghiệm dương)}', desc: 'Điều kiện phương trình bậc hai có nghiệm trái dấu hoặc cùng dương.' },
          { label: 'Định lí dấu tam thức bậc hai', code: 'a \\cdot f(x) > 0, \\; \\forall x \\in \\mathbb{R} \\Leftrightarrow \\begin{cases} a \\neq 0 \\\\ \\Delta < 0 \\end{cases}', desc: 'Tam thức bậc hai luôn cùng dấu hệ số a trên ℝ khi Δ < 0.' },
          { label: 'Bất đẳng thức AM-GM (Cauchy 2 & 3 số)', code: 'a + b \\ge 2\\sqrt{ab}, \\quad a + b + c \\ge 3\\sqrt[3]{abc} \\quad (a,b,c \\ge 0)', desc: 'Dấu bằng xảy ra khi và chỉ khi các số bằng nhau.' },
          { label: 'Bất đẳng thức Bunyakovsky (Cauchy-Schwarz)', code: '(a^2 + b^2)(x^2 + y^2) \\ge (ax + by)^2, \\quad \\frac{a^2}{x} + \\frac{b^2}{y} \\ge \\frac{(a+b)^2}{x+y}', desc: 'Bất đẳng thức Bunyakovsky dạng tích và dạng cộng mẫu Engels.' },
          { label: 'Bất đẳng thức trị tuyệt đối / Minkowski', code: '|a| - |b| \\le |a + b| \\le |a| + |b|', desc: 'Dấu bằng bên phải xảy ra khi a·b ≥ 0.' }
        ]
      },
      {
        title: 'Dãy số, Cấp số cộng, Cấp số nhân & Nhị thức Newton',
        items: [
          { label: 'Số hạng tổng quát Cấp số cộng', code: 'u_n = u_1 + (n - 1)d = u_k + (n - k)d', desc: 'Số hạng thứ n của cấp số cộng có công sai d.' },
          { label: 'Tính chất trung bình cộng CSC', code: 'u_k = \\frac{u_{k-1} + u_{k+1}}{2} \\quad (k \\ge 2)', desc: 'Mỗi số hạng (trừ số đầu, cuối) bằng trung bình cộng hai số kề nó.' },
          { label: 'Tổng n số hạng đầu Cấp số cộng', code: 'S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n-1)d]}{2}', desc: 'Tổng n số hạng đầu tiên của cấp số cộng.' },
          { label: 'Số hạng tổng quát Cấp số nhân', code: 'u_n = u_1 \\cdot q^{n-1} = u_k \\cdot q^{n-k}', desc: 'Số hạng thứ n của cấp số nhân có công bội q.' },
          { label: 'Tính chất trung bình nhân CSN', code: 'u_k^2 = u_{k-1} \\cdot u_{k+1} \\quad (k \\ge 2)', desc: 'Bình phương mỗi số hạng bằng tích hai số hạng kề nó.' },
          { label: 'Tổng n số hạng đầu Cấp số nhân', code: 'S_n = u_1 \\cdot \\frac{1 - q^n}{1 - q} \\quad (q \\neq 1)', desc: 'Tổng n số hạng đầu tiên của cấp số nhân.' },
          { label: 'Tổng Cấp số nhân lùi vô hạn', code: 'S = u_1 + u_2 + \\dots = \\frac{u_1}{1 - q} \\quad (|q| < 1)', desc: 'Tổng của cấp số nhân lùi vô hạn có công bội |q| < 1.' },
          { label: 'Khai triển Nhị thức Newton', code: '(a + b)^n = \\sum_{k=0}^{n} C_n^k a^{n-k} b^k, \\quad T_{k+1} = C_n^k a^{n-k} b^k', desc: 'Khai triển nhị thức Newton và số hạng tổng quát thứ k+1.' }
        ]
      },
      {
        title: 'Bảng Đạo hàm Sơ cấp & Hàm hợp (Đầy đủ)',
        items: [
          { label: 'Đạo hàm lũy thừa & hàm hợp u^n', code: "(x^n)' = n x^{n-1}, \\quad (u^n)' = n u^{n-1} \\cdot u'", desc: 'Công thức đạo hàm của hàm lũy thừa.' },
          { label: 'Đạo hàm căn bậc hai & hàm hợp √u', code: "(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}, \\quad (\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}", desc: 'Công thức đạo hàm của căn bậc hai.' },
          { label: 'Đạo hàm nghịch đảo 1/x và 1/u', code: "\\left(\\frac{1}{x}\\right)' = -\\frac{1}{x^2}, \\quad \\left(\\frac{1}{u}\\right)' = -\\frac{u'}{u^2}", desc: 'Đạo hàm của hàm phân thức nghịch đảo.' },
          { label: 'Quy tắc đạo hàm Tổng – Tích – Thương', code: "(u \\pm v)' = u' \\pm v', \\quad (uv)' = u'v + uv', \\quad \\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}", desc: 'Ba quy tắc tính đạo hàm cơ bản.' },
          { label: 'Đạo hàm lượng giác sin & cos', code: "(\\sin x)' = \\cos x, \\quad (\\cos x)' = -\\sin x, \\quad (\\sin u)' = u'\\cos u", desc: 'Đạo hàm của hàm số sin và cos.' },
          { label: 'Đạo hàm lượng giác tan & cot', code: "(\\tan x)' = \\frac{1}{\\cos^2 x} = 1 + \\tan^2 x, \\quad (\\cot x)' = -\\frac{1}{\\sin^2 x}", desc: 'Đạo hàm của hàm số tan và cot.' },
          { label: 'Đạo hàm hàm số Mũ', code: "(e^x)' = e^x, \\quad (e^u)' = u' e^u, \\quad (a^x)' = a^x \\ln a", desc: 'Đạo hàm của hàm số mũ tự nhiên và cơ số a.' },
          { label: 'Đạo hàm hàm số Logarit', code: "(\\ln|x|)' = \\frac{1}{x}, \\quad (\\ln|u|)' = \\frac{u'}{u}, \\quad (\\log_a|x|)' = \\frac{1}{x \\ln a}", desc: 'Đạo hàm của hàm logarit tự nhiên và cơ số a.' },
          { label: 'Đạo hàm nhanh hàm phân thức bậc 1/1', code: "\\left(\\frac{ax + b}{cx + d}\\right)' = \\frac{ad - bc}{(cx + d)^2}", desc: 'Định thức tử số ad - bc quyết định tính đơn điệu hàm nhất biến.' },
          { label: 'Đạo hàm nhanh hàm phân thức bậc 2/1', code: "\\left(\\frac{ax^2 + bx + c}{mx + n}\\right)' = \\frac{am x^2 + 2an x + bn - cm}{(mx + n)^2}", desc: 'Công thức đạo hàm nhanh hàm hữu tỉ bậc 2 trên bậc 1 (Lớp 12).' },
          { label: 'Phương trình tiếp tuyến tại M(x₀; y₀)', code: "y = f'(x_0)(x - x_0) + f(x_0)", desc: 'Phương trình tiếp tuyến đồ thị với hệ số góc k = f’(x₀).' }
        ]
      },
      {
        title: 'Khảo sát Hàm số: Cực trị, Tiệm cận & Bảng biến thiên',
        items: [
          { label: 'Hàm bậc 3 đơn điệu trên ℝ', code: "y = ax^3 + bx^2 + cx + d \\text{ ĐB trên } \\mathbb{R} \\Leftrightarrow \\begin{cases} a > 0 \\\\ \\Delta_{y'} = b^2 - 3ac \\le 0 \\end{cases}", desc: 'Điều kiện hàm số bậc ba đồng biến (hoặc nghịch biến) trên toàn trục số.' },
          { label: 'Điều kiện hàm bậc 3 có 2 cực trị', code: "y' = 3ax^2 + 2bx + c = 0 \\text{ có 2 nghiệm PB} \\Leftrightarrow b^2 - 3ac > 0", desc: 'Hàm bậc ba có cực đại và cực tiểu khi và chỉ khi b² - 3ac > 0.' },
          { label: 'Cực trị hàm trùng phương y = ax⁴ + bx² + c', code: '\\text{Có 3 cực trị } \\Leftrightarrow a \\cdot b < 0; \\quad \\text{Có 1 cực trị } \\Leftrightarrow a \\cdot b \\ge 0', desc: 'Điều kiện số điểm cực trị của hàm số bậc bốn trùng phương.' },
          { label: 'Tiệm cận ngang của đồ thị hàm số', code: '\\lim_{x \\to +\\infty} f(x) = y_0 \\text{ hoặc } \\lim_{x \\to -\\infty} f(x) = y_0 \\Rightarrow \\text{TCN: } y = y_0', desc: 'Đường tiệm cận ngang khi x tiến ra vô cực.' },
          { label: 'Tiệm cận đứng của đồ thị hàm số', code: '\\lim_{x \\to x_0^+} f(x) = \\pm\\infty \\text{ hoặc } \\lim_{x \\to x_0^-} f(x) = \\pm\\infty \\Rightarrow \\text{TCĐ: } x = x_0', desc: 'Đường tiệm cận đứng tại điểm làm mẫu số bằng 0.' },
          { label: 'Tiệm cận xiên y = ax + b (GDPT 2018 Lớp 12)', code: 'a = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x} \\neq 0, \\quad b = \\lim_{x \\to \\pm\\infty} [f(x) - ax]', desc: 'Công thức tìm hệ số a, b hoặc chia đa thức tử cho mẫu của hàm bậc 2/1.' },
          { label: 'Tâm đối xứng của đồ thị hàm bậc 3', code: "y'' = 6ax + 2b = 0 \\Leftrightarrow x_I = -\\frac{b}{3a} = \\frac{x_{CĐ} + x_{CT}}{2}", desc: 'Điểm uốn I(x_I; y_I) là tâm đối xứng của đồ thị hàm số bậc ba.' }
        ]
      },
      {
        title: 'Bảng Nguyên hàm, Tích phân & Ứng dụng Hình học – Vật lí',
        items: [
          { label: 'Nguyên hàm hàm lũy thừa', code: '\\int x^\\alpha\\,dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C, \\quad \\int (ax+b)^\\alpha\\,dx = \\frac{1}{a}\\cdot\\frac{(ax+b)^{\\alpha+1}}{\\alpha+1} + C', desc: 'Nguyên hàm lũy thừa với α ≠ -1.' },
          { label: 'Nguyên hàm hàm phân thức bậc nhất', code: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C, \\quad \\int \\frac{1}{ax+b}\\,dx = \\frac{1}{a}\\ln|ax+b| + C', desc: 'Nguyên hàm của nghịch đảo nhị thức bậc nhất.' },
          { label: 'Nguyên hàm hàm số Mũ', code: '\\int e^x\\,dx = e^x + C, \\quad \\int e^{ax+b}\\,dx = \\frac{1}{a}e^{ax+b} + C, \\quad \\int a^x\\,dx = \\frac{a^x}{\\ln a} + C', desc: 'Nguyên hàm của hàm số mũ.' },
          { label: 'Nguyên hàm Lượng giác sin & cos', code: '\\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\cos x\\,dx = \\sin x + C', desc: 'Nguyên hàm cơ bản của sin x và cos x.' },
          { label: 'Nguyên hàm 1/cos²x và 1/sin²x', code: '\\int \\frac{1}{\\cos^2 x}\\,dx = \\tan x + C, \\quad \\int \\frac{1}{\\sin^2 x}\\,dx = -\\cot x + C', desc: 'Nguyên hàm lượng giác mở rộng.' },
          { label: 'Công thức Tích phân Newton – Leibniz', code: '\\int_{a}^{b} f(x)\\,dx = F(x)\\Big|_{a}^{b} = F(b) - F(a)', desc: 'Tính tích phân xác định thông qua nguyên hàm F(x).' },
          { label: 'Công thức Tích phân từng phần', code: '\\int_{a}^{b} u\\,dv = u v\\Big|_{a}^{b} - \\int_{a}^{b} v\\,du', desc: 'Thứ tự ưu tiên đặt u: Nhất lô (ln) – Nhì đa (đa thức) – Tam lượng – Tứ mũ.' },
          { label: 'Diện tích hình phẳng giới hạn bởi 2 đồ thị', code: 'S = \\int_{a}^{b} |f(x) - g(x)|\\,dx', desc: 'Ứng dụng tích phân tính diện tích hình phẳng.' },
          { label: 'Thể tích vật thể & Khối tròn xoay quanh Ox', code: 'V = \\int_{a}^{b} S(x)\\,dx, \\quad V_{Ox} = \\pi \\int_{a}^{b} [f(x)]^2\\,dx', desc: 'Thể tích theo thiết diện S(x) và thể tích khối tròn xoay.' },
          { label: 'Bài toán Chuyển động (Quãng đường – Vận tốc – Gia tốc)', code: 'v(t) = \\int a(t)\\,dt, \\quad s = \\int_{t_1}^{t_2} v(t)\\,dt', desc: 'Liên hệ nguyên hàm – tích phân giữa gia tốc, vận tốc và quãng đường.' }
        ]
      },
      {
        title: 'Hàm số Mũ, Logarit & Toán Lãi suất – Tăng trưởng',
        items: [
          { label: 'Định nghĩa & Tính chất Logarit cơ bản', code: '\\log_a b = c \\Leftrightarrow a^c = b, \\quad \\log_a 1 = 0, \\quad \\log_a a = 1, \\quad a^{\\log_a b} = b', desc: 'Các hằng đẳng thức logarit cơ bản với 0 < a ≠ 1, b > 0.' },
          { label: 'Logarit của Tích, Thương & Lũy thừa', code: '\\log_a(xy) = \\log_a x + \\log_a y, \\quad \\log_a\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y, \\quad \\log_a(x^\\alpha) = \\alpha\\log_a x', desc: 'Các quy tắc biến đổi biểu thức logarit.' },
          { label: 'Công thức Đổi cơ số Logarit', code: '\\log_a b = \\frac{\\log_c b}{\\log_c a} = \\frac{\\ln b}{\\ln a}, \\quad \\log_a b = \\frac{1}{\\log_b a}', desc: 'Công thức đổi cơ số và nghịch đảo cơ số.' },
          { label: 'Phương trình Mũ & Logarit cơ bản', code: 'a^{f(x)} = b \\Leftrightarrow f(x) = \\log_a b, \\quad \\log_a f(x) = b \\Leftrightarrow f(x) = a^b', desc: 'Nghiệm của phương trình mũ và logarit cơ bản.' },
          { label: 'Bài toán Lãi kép ngân hàng', code: 'T_n = P(1 + r)^n \\Rightarrow n = \\log_{1+r}\\left(\\frac{T_n}{P}\\right)', desc: 'Số tiền cả vốn lẫn lãi sau n kỳ hạn với vốn gốc P, lãi suất r/kỳ.' },
          { label: 'Tăng trưởng liên tục (Dân số / Vi khuẩn)', code: 'N(t) = N_0 \\cdot e^{r \\cdot t}', desc: 'Công thức tăng trưởng mũ liên tục theo tỉ lệ r và thời gian t.' }
        ]
      },
      {
        title: 'Công thức Lượng giác & Phương trình Lượng giác (Đầy đủ)',
        items: [
          { label: '4 Hệ thức lượng giác cơ bản', code: '\\sin^2 x + \\cos^2 x = 1, \\quad \\tan x \\cdot \\cot x = 1, \\quad 1 + \\tan^2 x = \\frac{1}{\\cos^2 x}, \\quad 1 + \\cot^2 x = \\frac{1}{\\sin^2 x}', desc: 'Bốn hằng đẳng thức lượng giác cơ bản.' },
          { label: 'Công thức Cộng góc sin, cos, tan', code: '\\sin(a \\pm b) = \\sin a\\cos b \\pm \\cos a\\sin b, \\quad \\cos(a \\pm b) = \\cos a\\cos b \\mp \\sin a\\sin b', desc: 'Khai triển lượng giác của tổng và hiệu hai góc.' },
          { label: 'Công thức Nhân đôi & Nhân ba', code: '\\sin 2x = 2\\sin x\\cos x, \\quad \\cos 2x = 2\\cos^2 x - 1 = 1 - 2\\sin^2 x, \\quad \\sin 3x = 3\\sin x - 4\\sin^3 x, \\quad \\cos 3x = 4\\cos^3 x - 3\\cos x', desc: 'Công thức góc nhân đôi và góc nhân ba.' },
          { label: 'Công thức Hạ bậc bậc 2 & bậc 3', code: '\\sin^2 x = \\frac{1 - \\cos 2x}{2}, \\quad \\cos^2 x = \\frac{1 + \\cos 2x}{2}, \\quad \\tan^2 x = \\frac{1 - \\cos 2x}{1 + \\cos 2x}', desc: 'Hạ bậc bình phương lượng giác để tính tích phân hoặc giải phương trình.' },
          { label: 'Biến đổi Tổng thành Tích', code: '\\cos a + \\cos b = 2\\cos\\frac{a+b}{2}\\cos\\frac{a-b}{2}, \\quad \\sin a + \\sin b = 2\\sin\\frac{a+b}{2}\\cos\\frac{a-b}{2}', desc: 'Biến đổi tổng hai hàm lượng giác thành tích.' },
          { label: 'Biến đổi Tích thành Tổng', code: '\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b) + \\cos(a+b)], \\quad \\sin a\\sin b = \\frac{1}{2}[\\cos(a-b) - \\cos(a+b)]', desc: 'Biến đổi tích hai hàm lượng giác thành tổng.' },
          { label: 'Nghiệm phương trình sin u = sin v & cos u = cos v', code: '\\sin u = \\sin v \\Leftrightarrow \\begin{bmatrix} u = v + k2\\pi \\\\ u = \\pi - v + k2\\pi \\end{bmatrix}, \\quad \\cos u = \\cos v \\Leftrightarrow u = \\pm v + k2\\pi', desc: 'Họ nghiệm của phương trình lượng giác sin và cos.' },
          { label: 'Nghiệm phương trình tan u = tan v & cot u = cot v', code: '\\tan u = \\tan v \\Leftrightarrow u = v + k\\pi, \\quad \\cot u = \\cot v \\Leftrightarrow u = v + k\\pi \\quad (k \\in \\mathbb{Z})', desc: 'Họ nghiệm của phương trình lượng giác tan và cot.' },
          { label: 'Phương trình bậc nhất đối với sin x và cos x', code: 'a\\sin x + b\\cos x = c \\text{ có nghiệm} \\Leftrightarrow a^2 + b^2 \\ge c^2', desc: 'Điều kiện có nghiệm của phương trình cổ điển a·sin x + b·cos x = c.' }
        ]
      },
      {
        title: 'Hình học Phẳng, Đa diện & Khối Tròn xoay',
        items: [
          { label: 'Định lí Cosin & Định lí Sin trong tam giác', code: 'a^2 = b^2 + c^2 - 2bc\\cos A, \\quad \\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', desc: 'Hai định lí nền tảng giải tam giác.' },
          { label: 'Công thức độ dài đường trung tuyến', code: 'm_a^2 = \\frac{2(b^2 + c^2) - a^2}{4}', desc: 'Tính bình phương độ dài đường trung tuyến ứng với cạnh a.' },
          { label: '5 Công thức diện tích tam giác', code: 'S = \\frac{1}{2}a h_a = \\frac{1}{2}bc\\sin A = \\frac{abc}{4R} = p \\cdot r = \\sqrt{p(p-a)(p-b)(p-c)}', desc: 'Năm công thức tính diện tích tam giác ABC.' },
          { label: 'Hệ thức lượng trong tam giác vuông', code: 'b^2 = a \\cdot b\\prime, \\quad h^2 = b\\prime \\cdot c\\prime, \\quad a \\cdot h = b \\cdot c, \\quad \\frac{1}{h^2} = \\frac{1}{b^2} + \\frac{1}{c^2}', desc: 'Các hệ thức lượng trong tam giác vuông có đường cao h.' },
          { label: 'Thể tích Khối chóp & Khối lăng trụ', code: 'V_{\\text{chóp}} = \\frac{1}{3} S_{\\text{đáy}} \\cdot h, \\quad V_{\\text{lăng trụ}} = S_{\\text{đáy}} \\cdot h', desc: 'Công thức thể tích khối đa diện.' },
          { label: 'Tỉ số thể tích Simson (Chóp tam giác)', code: '\\frac{V_{S.A\\prime B\\prime C\\prime}}{V_{S.ABC}} = \\frac{SA\\prime}{SA} \\cdot \\frac{SB\\prime}{SB} \\cdot \\frac{SC\\prime}{SC}', desc: 'Công thức tỉ số thể tích của khối chóp tam giác S.ABC.' },
          { label: 'Hình Nón (Đường sinh, Diện tích, Thể tích)', code: 'l = \\sqrt{r^2 + h^2}, \\quad S_{xq} = \\pi r l, \\quad S_{tp} = \\pi r l + \\pi r^2, \\quad V = \\frac{1}{3}\\pi r^2 h', desc: 'Đầy đủ các công thức của hình nón và khối nón.' },
          { label: 'Hình Trụ & Mặt Cầu – Khối Cầu', code: 'S_{xq\\text{ trụ}} = 2\\pi r h, \\quad V_{\\text{trụ}} = \\pi r^2 h, \\quad S_{\\text{cầu}} = 4\\pi R^2, \\quad V_{\\text{cầu}} = \\frac{4}{3}\\pi R^3', desc: 'Diện tích và thể tích của hình trụ và mặt cầu.' }
        ]
      },
      {
        title: 'Hình học Tọa độ Không gian Oxyz (Lớp 12)',
        items: [
          { label: 'Tọa độ Vectơ, Trung điểm & Trọng tâm tam giác', code: '\\vec{AB} = (x_B - x_A;\\, y_B - y_A;\\, z_B - z_A), \\quad G\\left(\\frac{x_A+x_B+x_C}{3};\\dots\\right)', desc: 'Công thức tọa độ vectơ và trọng tâm G trong Oxyz.' },
          { label: 'Tích vô hướng & Góc giữa hai vectơ', code: '\\vec{u}\\cdot\\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2, \\quad \\cos(\\vec{u},\\vec{v}) = \\frac{x_1 x_2 + y_1 y_2 + z_1 z_2}{\\sqrt{x_1^2+y_1^2+z_1^2}\\cdot\\sqrt{x_2^2+y_2^2+z_2^2}}', desc: 'Biểu thức tọa độ của tích vô hướng và cosin góc giữa hai vectơ.' },
          { label: 'Tích có hướng & Diện tích tam giác – Thể tích tứ diện', code: '[\\vec{u},\\vec{v}] = (y_1 z_2 - z_1 y_2;\\, z_1 x_2 - x_1 z_2;\\, x_1 y_2 - y_1 x_2), \\quad S_{\\triangle ABC} = \\frac{1}{2}|[\\vec{AB},\\vec{AC}]|, \\quad V_{ABCD} = \\frac{1}{6}|[\\vec{AB},\\vec{AC}]\\cdot\\vec{AD}|', desc: 'Ứng dụng tích có hướng tính diện tích và thể tích trong Oxyz.' },
          { label: 'Phương trình Mặt phẳng tổng quát & Đoạn chắn', code: '(P): Ax + By + Cz + D = 0, \\quad \\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1', desc: 'Phương trình tổng quát và phương trình mặt phẳng theo đoạn chắn.' },
          { label: 'Khoảng cách từ Điểm đến Mặt phẳng', code: 'd(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}', desc: 'Khoảng cách từ điểm M₀(x₀; y₀; z₀) đến mặt phẳng (P).' },
          { label: 'Phương trình Tham số & Chính tắc của Đường thẳng', code: 'd: \\begin{cases} x = x_0 + a t \\\\ y = y_0 + b t \\\\ z = z_0 + c t \\end{cases}, \\quad \\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c}', desc: 'Hai dạng phương trình đường thẳng đi qua M₀ có VTCP u=(a; b; c).' },
          { label: 'Góc giữa Đường thẳng và Mặt phẳng', code: '\\sin(d, (P)) = |\\cos(\\vec{u}_d, \\vec{n}_P)| = \\frac{|\\vec{u}_d \\cdot \\vec{n}_P|}{|\\vec{u}_d|\\cdot|\\vec{n}_P|}', desc: 'Sin góc giữa đường thẳng d và mặt phẳng (P).' },
          { label: 'Phương trình Mặt cầu trong Oxyz', code: '(S): (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2 \\Leftrightarrow x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0', desc: 'Mặt cầu tâm I(a; b; c) bán kính R = √(a² + b² + c² - d).' }
        ]
      },
      {
        title: 'Xác suất Có điều kiện, Bayes & Thống kê Ghép nhóm (Lớp 11 – 12)',
        items: [
          { label: 'Hoán vị – Chỉnh hợp – Tổ hợp', code: 'P_n = n!, \\quad A_n^k = \\frac{n!}{(n-k)!}, \\quad C_n^k = \\frac{n!}{k!(n-k)!}', desc: 'Ba công thức giải tích tổ hợp.' },
          { label: 'Quy tắc Cộng & Nhân xác suất', code: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B), \\quad P(A \\cap B) = P(A)\\cdot P(B)\\text{ (độc lập)}', desc: 'Xác suất của biến cố hợp và biến cố giao.' },
          { label: 'Xác suất có điều kiện & Công thức nhân tổng quát', code: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\Rightarrow P(A \\cap B) = P(B)\\cdot P(A|B)', desc: 'Xác suất của biến cố A khi biết biến cố B đã xảy ra (Lớp 12).' },
          { label: 'Công thức Xác suất toàn phần', code: 'P(A) = P(B)\\cdot P(A|B) + P(\\bar{B})\\cdot P(A|\\bar{B})', desc: 'Tính xác suất biến cố A thông qua cặp biến cố xung khắc B và B̄.' },
          { label: 'Công thức Bayes (GDPT 2018 Lớp 12)', code: 'P(B_k|A) = \\frac{P(B_k)\\cdot P(A|B_k)}{\\sum_{i=1}^{n} P(B_i)\\cdot P(A|B_i)}', desc: 'Công thức Bayes cập nhật xác suất hậu nghiệm.' },
          { label: 'Số trung bình & Mốt của mẫu số liệu ghép nhóm', code: '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{k} m_i c_i, \\quad M_o = u_m + \\frac{m_m - m_{m-1}}{(m_m - m_{m-1}) + (m_m - m_{m+1})}\\cdot(u_{m+1} - u_m)', desc: 'Số trung bình và mốt của mẫu số liệu ghép nhóm.' },
          { label: 'Trung vị & Tứ phân vị mẫu số liệu ghép nhóm', code: 'Q_r = u_m + \\frac{\\frac{r \\cdot n}{4} - C}{m_m} \\cdot (u_{m+1} - u_m) \\quad (r \\in \\{1,2,3\\},\\; M_e = Q_2)', desc: 'Công thức tính trung vị và các tứ phân vị Q₁, Q₂, Q₃.' },
          { label: 'Phương sai & Độ lệch chuẩn mẫu ghép nhóm (Lớp 12)', code: 's^2 = \\frac{1}{n}\\sum_{i=1}^{k} m_i(c_i - \\bar{x})^2 = \\frac{1}{n}\\sum_{i=1}^{k} m_i c_i^2 - \\bar{x}^2, \\quad s = \\sqrt{s^2}', desc: 'Hai công thức tương đương tính phương sai và độ lệch chuẩn mẫu ghép nhóm.' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 2. HÓA HỌC (TỔNG HỢP ĐẦY ĐỦ VÔ CƠ, HỮU CƠ, ION, HỢP CHẤT & CÔNG THỨC)
   * ========================================================================== */
  chem: {
    id: 'chem',
    name: 'Hóa học',
    shortName: 'Hóa',
    icon: FlaskConical,
    symbolGroups: [
      {
        title: 'Mũi tên & Điều kiện phản ứng',
        items: [
          { label: 'Mũi tên phản ứng', code: '\\rightarrow', desc: 'Phản ứng hóa học xảy ra một chiều.' },
          { label: 'Thuận nghịch', code: '\\rightleftharpoons', desc: 'Phản ứng thuận nghịch / cân bằng hóa học hai chiều.' },
          { label: 'Khí thoát ra', code: '\\uparrow', desc: 'Chất khí bay hơi thoát khỏi dung dịch.' },
          { label: 'Kết tủa', code: '\\downarrow', desc: 'Chất rắn kết tủa lắng xuống đáy ống nghiệm.' },
          { label: 'Đun nóng (t°)', code: '\\xrightarrow{t^{\\circ}}', desc: 'Phản ứng thực hiện khi đun nóng nhiệt độ.' },
          { label: 'Xúc tác (xt)', code: '\\xrightarrow{\\text{xt}}', desc: 'Phản ứng có mặt chất xúc tác.' },
          { label: 'Nhiệt độ, xúc tác, áp suất', code: '\\xrightarrow{t^{\\circ},\\,\\text{xt},\\,p}', desc: 'Điều kiện tổng hợp công nghiệp (như Haber-Bosch, polime hóa).' },
          { label: 'Điện phân dung dịch', code: '\\xrightarrow{\\text{đpdd}}', desc: 'Điều kiện điện phân dung dịch trên điện cực.' },
          { label: 'Điện phân nóng chảy', code: '\\xrightarrow{\\text{đpnc}}', desc: 'Điều kiện điện phân nóng chảy điều chế kim loại mạnh (Na, Mg, Al).' },
          { label: 'Ánh sáng khuếch tán', code: '\\xrightarrow{\\text{askt}}', desc: 'Phản ứng thế halogen hoặc quang hợp dưới ánh sáng.' },
          { label: 'Lên men enzyme', code: '\\xrightarrow{\\text{enzyme}}', desc: 'Phản ứng lên men sinh học nhờ xúc tác enzyme.' },
          { label: 'Môi trường axit đun nóng', code: '\\xrightarrow{\\text{H}^+,\\,t^{\\circ}}', desc: 'Thủy phân este hoặc cacbohiđrat trong môi trường axit.' },
          { label: 'H₂SO₄ đặc, t°', code: '\\xrightarrow{\\text{H}_2\\text{SO}_4\\text{ đặc},\\,t^{\\circ}}', desc: 'Điều kiện phản ứng este hóa hoặc tách nước ancol.' },
          { label: 'Ni, t° (Cộng H₂)', code: '\\xrightarrow{\\text{Ni},\\,t^{\\circ}}', desc: 'Xúc tác Niken đun nóng cho phản ứng hiđro hóa liên kết bội.' },
          { label: 'Pd/PbCO₃ (Lindlar)', code: '\\xrightarrow{\\text{Pd/PbCO}_3,\\,t^{\\circ}}', desc: 'Khử chọn lọc ankin thành anken mà không về ankan.' }
        ]
      },
      {
        title: 'Hạt cơ bản, Nguyên tử & Cấu hình Electron',
        items: [
          { label: 'Ký hiệu nguyên tử', code: '^{A}_{Z}\\text{X}', desc: 'Nguyên tử X có số hiệu nguyên tử Z và số khối A = Z + N.' },
          { label: 'Electron', code: 'e^-', desc: 'Hạt electron mang điện tích âm (-1).' },
          { label: 'Proton', code: 'p^+', desc: 'Hạt proton trong hạt nhân mang điện tích dương (+1).' },
          { label: 'Neutron', code: 'n^0', desc: 'Hạt neutron trong hạt nhân không mang điện.' },
          { label: 'Phân lớp s²', code: 'ns^2', desc: 'Phân lớp s bão hòa tối đa 2 electron.' },
          { label: 'Phân lớp p⁶', code: 'np^6', desc: 'Phân lớp p bão hòa tối đa 6 electron.' },
          { label: 'Phân lớp d¹⁰', code: '(n-1)d^{10}', desc: 'Phân lớp d bão hòa tối đa 10 electron.' },
          { label: 'Cấu hình khí hiếm [Ne]', code: '[\\text{Ne}]\\,3s^2 3p^1', desc: 'Viết gọn cấu hình electron theo lõi khí hiếm Neon (Z=10).' },
          { label: 'Cấu hình khí hiếm [Ar]', code: '[\\text{Ar}]\\,3d^6 4s^2', desc: 'Cấu hình electron của Sắt Fe (Z=26) theo lõi Argon (Z=18).' },
          { label: 'Cấu hình Cu (bán bão hòa)', code: '[\\text{Ar}]\\,3d^{10} 4s^1', desc: 'Cấu hình electron đặc biệt của Đồng Cu (Z=29).' },
          { label: 'Cấu hình Cr (bán bão hòa)', code: '[\\text{Ar}]\\,3d^5 4s^1', desc: 'Cấu hình electron đặc biệt của Crom Cr (Z=24).' },
          { label: 'Lai hóa sp³', code: 'sp^3', desc: 'Lai hóa tứ diện đều (góc 109,5° như CH₄, NH₃, H₂O).' },
          { label: 'Lai hóa sp²', code: 'sp^2', desc: 'Lai hóa tam giác phẳng (góc 120° như C₂H₄, BF₃).' },
          { label: 'Lai hóa sp', code: 'sp', desc: 'Lai hóa đường thẳng (góc 180° như C₂H₂, CO₂).' },
          { label: 'Liên kết Sigma', code: '\\sigma', desc: 'Liên kết cộng hóa trị bền hình thành do xen phủ trục.' },
          { label: 'Liên kết Pi', code: '\\pi', desc: 'Liên kết cộng hóa trị kém bền do xen phủ bên.' }
        ]
      },
      {
        title: 'Cation (Ion Dương) Phổ Biến',
        items: [
          { label: 'Ion Hiđro H⁺', code: '\\text{H}^+', desc: 'Cation đặc trưng cho môi trường axit.' },
          { label: 'Ion Oxoni H₃O⁺', code: '\\text{H}_3\\text{O}^+', desc: 'Dạng tồn tại thực tế của proton H⁺ trong dung dịch nước.' },
          { label: 'Ion Amoni NH₄⁺', code: '\\text{NH}_4^+', desc: 'Cation amoni tạo khí NH₃ mùi khai khi gặp kiềm.' },
          { label: 'Ion Natri Na⁺', code: '\\text{Na}^+', desc: 'Cation kim loại kiềm Natri (mọi muối đều tan).' },
          { label: 'Ion Kali K⁺', code: '\\text{K}^+', desc: 'Cation kim loại kiềm Kali (ngọn lửa màu tím).' },
          { label: 'Ion Bạc Ag⁺', code: '\\text{Ag}^+', desc: 'Cation Bạc dùng nhận biết ion halogenua (Cl⁻, Br⁻, I⁻).' },
          { label: 'Ion Magie Mg²⁺', code: '\\text{Mg}^{2+}', desc: 'Cation Magie gây độ cứng của nước tự nhiên.' },
          { label: 'Ion Canxi Ca²⁺', code: '\\text{Ca}^{2+}', desc: 'Cation Canxi tạo kết tủa trắng với CO₃²⁻.' },
          { label: 'Ion Bari Ba²⁺', code: '\\text{Ba}^{2+}', desc: 'Cation Bari tạo kết tủa trắng bền BaSO₄ với SO₄²⁻.' },
          { label: 'Ion Kẽm Zn²⁺', code: '\\text{Zn}^{2+}', desc: 'Cation Kẽm tạo hiđroxit lưỡng tính Zn(OH)₂.' },
          { label: 'Ion Đồng(II) Cu²⁺', code: '\\text{Cu}^{2+}', desc: 'Cation Đồng(II) có màu xanh lam đặc trưng trong nước.' },
          { label: 'Ion Sắt(II) Fe²⁺', code: '\\text{Fe}^{2+}', desc: 'Cation Sắt(II) vừa có tính khử vừa có tính oxi hóa.' },
          { label: 'Ion Sắt(III) Fe³⁺', code: '\\text{Fe}^{3+}', desc: 'Cation Sắt(III) màu vàng nâu, tính oxi hóa mạnh.' },
          { label: 'Ion Nhôm Al³⁺', code: '\\text{Al}^{3+}', desc: 'Cation Nhôm tạo kết tủa keo trắng Al(OH)₃ lưỡng tính.' },
          { label: 'Ion Crom(III) Cr³⁺', code: '\\text{Cr}^{3+}', desc: 'Cation Crom(III) có tính chất tương tự Al³⁺.' },
          { label: 'Ion Chì(II) Pb²⁺', code: '\\text{Pb}^{2+}', desc: 'Cation Chì tạo kết tủa đen PbS với H₂S.' }
        ]
      },
      {
        title: 'Anion (Ion Âm) & Gốc Axit',
        items: [
          { label: 'Ion Hiđroxit OH⁻', code: '\\text{OH}^-', desc: 'Anion đặc trưng cho môi trường kiềm / bazơ.' },
          { label: 'Ion Clorua Cl⁻', code: '\\text{Cl}^-', desc: 'Tạo kết tủa trắng AgCl với dung dịch AgNO₃.' },
          { label: 'Ion Bromua Br⁻', code: '\\text{Br}^-', desc: 'Tạo kết tủa vàng nhạt AgBr với dung dịch AgNO₃.' },
          { label: 'Ion Iotua I⁻', code: '\\text{I}^-', desc: 'Tạo kết tủa vàng đậm AgI với dung dịch AgNO₃.' },
          { label: 'Ion Sunfua S²⁻', code: '\\text{S}^{2-}', desc: 'Gốc axit yếu H₂S, tạo kết tủa đen CuS, PbS, Ag₂S.' },
          { label: 'Ion Sunfit SO₃²⁻', code: '\\text{SO}_3^{2-}', desc: 'Gốc sunfit tác dụng axit giải phóng khí SO₂ mùi hắc.' },
          { label: 'Ion Sunfat SO₄²⁻', code: '\\text{SO}_4^{2-}', desc: 'Gốc axit mạnh, tạo kết tủa trắng BaSO₄ không tan trong axit.' },
          { label: 'Ion Hiđrosunfat HSO₄⁻', code: '\\text{HSO}_4^-', desc: 'Anion axit phân li mạnh cung cấp H⁺ như axit loãng.' },
          { label: 'Ion Nitrat NO₃⁻', code: '\\text{NO}_3^-', desc: 'Anion nitrat có tính oxi hóa mạnh trong môi trường H⁺.' },
          { label: 'Ion Nitrit NO₂⁻', code: '\\text{NO}_2^-', desc: 'Anion của axit nitrơ HNO₂.' },
          { label: 'Ion Cacbonat CO₃²⁻', code: '\\text{CO}_3^{2-}', desc: 'Tác dụng với H⁺ tạo khí CO₂ làm đục nước vôi trong.' },
          { label: 'Ion Hiđrocacbonat HCO₃⁻', code: '\\text{HCO}_3^-', desc: 'Anion lưỡng tính tác dụng được với cả H⁺ và OH⁻.' },
          { label: 'Ion Photphat PO₄³⁻', code: '\\text{PO}_4^{3-}', desc: 'Tạo kết tủa màu vàng Ag₃PO₄ với AgNO₃.' },
          { label: 'Ion Silicat SiO₃²⁻', code: '\\text{SiO}_3^{2-}', desc: 'Tạo kết tủa keo trắng H₂SiO₃ khi gặp axit.' },
          { label: 'Ion Aluminat [Al(OH)₄]⁻', code: '[\\text{Al(OH)}_4]^-', desc: 'Phức hiđroxo tạo thành khi Al hoặc Al(OH)₃ tan trong kiềm.' },
          { label: 'Ion Pemanganat MnO₄⁻', code: '\\text{MnO}_4^-', desc: 'Ion thuốc tím có màu tím hồng và tính oxi hóa cực mạnh.' },
          { label: 'Ion Cromat CrO₄²⁻', code: '\\text{CrO}_4^{2-}', desc: 'Anion cromat màu vàng tươi bền trong môi trường kiềm.' },
          { label: 'Ion Đicromat Cr₂O₇²⁻', code: '\\text{Cr}_2\\text{O}_7^{2-}', desc: 'Anion đicromat màu da cam bền trong môi trường axit.' },
          { label: 'Ion Axetat CH₃COO⁻', code: '\\text{CH}_3\\text{COO}^-', desc: 'Anion gốc axit axetic hữu cơ.' }
        ]
      },
      {
        title: 'Nhóm Chức & Gốc Hiđrocacbon Hữu Cơ',
        items: [
          { label: 'Nhóm Hiđroxyl (-OH)', code: '-\\text{OH}', desc: 'Nhóm chức đặc trưng của Ancol và Phenol.' },
          { label: 'Nhóm Anđehit (-CHO)', code: '-\\text{CHO}', desc: 'Nhóm chức anđehit tham gia phản ứng tráng bạc.' },
          { label: 'Nhóm Cacboxyl (-COOH)', code: '-\\text{COOH}', desc: 'Nhóm chức axit cacboxylic làm quỳ tím hóa đỏ.' },
          { label: 'Nhóm Este (-COO-)', code: '-\\text{COO}-', desc: 'Nhóm chức este bị thủy phân trong axit hoặc kiềm.' },
          { label: 'Nhóm Cacbonyl (>C=O)', code: '>\\text{C}=\\text{O}', desc: 'Nhóm chức xeton.' },
          { label: 'Nhóm Amino (-NH₂)', code: '-\\text{NH}_2', desc: 'Nhóm chức amin mang tính bazơ.' },
          { label: 'Nhóm Nitro (-NO₂)', code: '-\\text{NO}_2', desc: 'Nhóm thế nitro trong hợp chất thơm.' },
          { label: 'Liên kết Peptit', code: '-\\text{CO}-\\text{NH}-', desc: 'Liên kết peptit nối các gốc α-amino axit.' },
          { label: 'Gốc Metyl (-CH₃)', code: '-\\text{CH}_3', desc: 'Gốc ankyl hóa trị I có 1 cacbon (M = 15).' },
          { label: 'Gốc Etyl (-C₂H₅)', code: '-\\text{C}_2\\text{H}_5', desc: 'Gốc ankyl hóa trị I có 2 cacbon (M = 29).' },
          { label: 'Gốc Propyl (-C₃H₇)', code: '-\\text{C}_3\\text{H}_7', desc: 'Gốc propyl mạch thẳng hoặc isopropyl (M = 43).' },
          { label: 'Gốc Isopropyl', code: '-\\text{CH(CH}_3)_2', desc: 'Gốc ankyl nhánh bậc hai.' },
          { label: 'Gốc Vinyl (-CH=CH₂)', code: '-\\text{CH}=\\text{CH}_2', desc: 'Gốc không no có 1 nối đôi (M = 27).' },
          { label: 'Gốc Allyl', code: '-\\text{CH}_2-\\text{CH}=\\text{CH}_2', desc: 'Gốc không no có 3 nguyên tử cacbon (M = 41).' },
          { label: 'Gốc Phenyl (-C₆H₅)', code: '-\\text{C}_6\\text{H}_5', desc: 'Vòng benzen tách 1 nguyên tử H (M = 77).' },
          { label: 'Gốc Benzyl', code: '-\\text{CH}_2-\\text{C}_6\\text{H}_5', desc: 'Gốc thơm đính qua nhóm -CH₂- (M = 91).' }
        ]
      },
      {
        title: 'Trạng thái, Số oxi hóa & Đơn vị Hóa học',
        items: [
          { label: 'Trạng thái rắn (s)', code: '(\\text{s})', desc: 'Chất ở thể rắn (solid).' },
          { label: 'Trạng thái lỏng (l)', code: '(\\text{l})', desc: 'Chất ở thể lỏng (liquid).' },
          { label: 'Trạng thái khí (g)', code: '(\\text{g})', desc: 'Chất ở thể khí / hơi (gas).' },
          { label: 'Dung dịch nước (aq)', code: '(\\text{aq})', desc: 'Chất hòa tan trong nước (aqueous).' },
          { label: 'Enthalpy tạo thành', code: '\\Delta_f H^{\\circ}_{298}', desc: 'Biến thiên enthalpy tạo thành chuẩn ở 298K.' },
          { label: 'Enthalpy phản ứng', code: '\\Delta_r H^{\\circ}_{298}', desc: 'Biến thiên enthalpy chuẩn của phản ứng hóa học.' },
          { label: 'Nồng độ mol [X]', code: '[\\text{X}]', desc: 'Nồng độ mol/L của chất X tại trạng thái cân bằng.' },
          { label: 'Đơn vị Mol/L (M)', code: '\\text{mol/L}', desc: 'Đơn vị đo nồng độ mol dung dịch.' },
          { label: 'Đơn vị kJ/mol', code: '\\text{kJ/mol}', desc: 'Đơn vị đo năng lượng / biến thiên enthalpy.' },
          { label: 'Số oxi hóa +1', code: '\\overset{+1}{\\text{X}}', desc: 'Biểu diễn số oxi hóa +1 ngay trên đầu nguyên tố.' },
          { label: 'Số oxi hóa +2', code: '\\overset{+2}{\\text{X}}', desc: 'Biểu diễn số oxi hóa +2 trên đầu nguyên tố.' },
          { label: 'Số oxi hóa +3', code: '\\overset{+3}{\\text{X}}', desc: 'Biểu diễn số oxi hóa +3 trên đầu nguyên tố.' },
          { label: 'Số oxi hóa -2', code: '\\overset{-2}{\\text{O}}', desc: 'Số oxi hóa -2 thông thường của Oxi trong hợp chất.' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Đơn chất Kim loại, Phi kim & Khí',
        items: [
          { label: 'Khí Hiđro & Khí Oxi', code: '\\text{H}_2, \\quad \\text{O}_2, \\quad \\text{O}_3\\text{ (Ozon)}', desc: 'H₂ chất khử (M = 2); O₂ và O₃ chất oxi hóa mạnh (M = 32 và M = 48).' },
          { label: 'Khí Nitơ (Liên kết ba bền)', code: '\\text{N}_2 \\quad (\\text{N}\\equiv\\text{N})', desc: 'Khí Nitơ chiếm ~78% không khí, khá trơ ở nhiệt độ thường (M = 28).' },
          { label: 'Dãy đơn chất Halogen', code: '\\text{F}_2, \\quad \\text{Cl}_2, \\quad \\text{Br}_2, \\quad \\text{I}_2', desc: 'Flo (khí lục nhạt, M=38), Clo (khí vàng lục, M=71), Brom (lỏng nâu đỏ, M=160), Iot (rắn tím đen, M=254).' },
          { label: 'Lưu huỳnh, Photpho, Cacbon & Silic', code: '\\text{S}, \\quad \\text{P}, \\quad \\text{C}, \\quad \\text{Si}', desc: 'Các phi kim rắn trọng tâm (S=32, P=31, C=12, Si=28).' },
          { label: 'Kim loại Kiềm (Nhóm IA)', code: '\\text{Li}, \\quad \\text{Na}, \\quad \\text{K}, \\quad \\text{Rb}, \\quad \\text{Cs}', desc: 'Kim loại kiềm có 1e lớp ngoài cùng, khử nước mãnh liệt ở nhiệt độ thường (Na=23, K=39).' },
          { label: 'Kim loại Kiềm thổ (Nhóm IIA)', code: '\\text{Be}, \\quad \\text{Mg}, \\quad \\text{Ca}, \\quad \\text{Sr}, \\quad \\text{Ba}', desc: 'Kim loại nhóm IIA hóa trị II (Mg=24, Ca=40, Ba=137).' },
          { label: 'Nhôm, Kẽm, Crom & Sắt', code: '\\text{Al}, \\quad \\text{Zn}, \\quad \\text{Cr}, \\quad \\text{Fe}', desc: 'Al=27, Zn=65, Cr=52, Fe=56; Al, Fe, Cr bị thụ động hóa trong HNO₃ đặc nguội và H₂SO₄ đặc nguội.' },
          { label: 'Đồng, Bạc & Vàng', code: '\\text{Cu}, \\quad \\text{Ag}, \\quad \\text{Au}', desc: 'Kim loại đứng sau H trong dãy điện hóa (Cu=64, Ag=108, Au=197).' },
          { label: 'Dãy điện hóa của kim loại', code: '\\text{K} > \\text{Ba} > \\text{Ca} > \\text{Na} > \\text{Mg} > \\text{Al} > \\text{Zn} > \\text{Fe} > \\text{Ni} > \\text{Sn} > \\text{Pb} > \\text{(H)} > \\text{Cu} > \\text{Fe}^{3+}/\\text{Fe}^{2+} > \\text{Ag}', desc: 'Chiều giảm dần tính khử của kim loại và tăng dần tính oxi hóa của cation.' }
        ]
      },
      {
        title: 'Phức chất & Nước cứng (GDPT 2018 Lớp 12)',
        items: [
          { label: 'Phức chất Aqua của Đồng(II)', code: '[\\text{Cu(H}_2\\text{O)}_6]^{2+}', desc: 'Phức bát diện màu xanh lam của ion Cu²⁺ trong dung dịch nước.' },
          { label: 'Phức chất Ammine của Đồng(II)', code: '[\\text{Cu(NH}_3)_4(\\text{H}_2\\text{O})_2]^{2+}', desc: 'Phức màu xanh lam thẫm tạo thành khi nhỏ NH₃ dư vào dung dịch muối Cu²⁺.' },
          { label: 'Phức chất Bạc – Amoniac (Tollens)', code: '[\\text{Ag(NH}_3)_2]^+\\text{OH}^-', desc: 'Phức chất đường thẳng trong thuốc thử Tollens dùng tráng bạc anđehit, glucozơ.' },
          { label: 'Phức chất Tetrahiđroxoaluminat', code: '[\\text{Al(OH)}_4]^-', desc: 'Phức tứ diện tạo thành khi Al(OH)₃ tan trong dung dịch kiềm dư.' },
          { label: 'Phức chất Tetrahiđroxozincat', code: '[\\text{Zn(OH)}_4]^{2-}, \\quad [\\text{Zn(NH}_3)_4]^{2+}', desc: 'Phức chất của Kẽm trong dung dịch kiềm dư và dung dịch NH₃ dư.' },
          { label: 'Nước cứng tạm thời', code: '\\text{Ca}^{2+}, \\; \\text{Mg}^{2+}, \\; \\text{HCO}_3^-', desc: 'Chứa muối Ca(HCO₃)₂ và Mg(HCO₃)₂; làm mềm bằng cách đun sôi, dùng Ca(OH)₂ vừa đủ hoặc Na₂CO₃.' },
          { label: 'Nước cứng vĩnh cửu', code: '\\text{Ca}^{2+}, \\; \\text{Mg}^{2+}, \\; \\text{Cl}^-, \\; \\text{SO}_4^{2-}', desc: 'Không mất tính cứng khi đun sôi; làm mềm bằng Na₂CO₃, Na₃PO₄ hoặc nhựa trao đổi ion.' }
        ]
      },
      {
        title: 'Phương trình Phản ứng Vô cơ & Hữu cơ Trọng tâm',
        items: [
          { label: 'Tổng hợp Amoniac (Haber – Bosch)', code: '\\text{N}_2 + 3\\text{H}_2 \\xrightleftharpoons{t^{\\circ},\\,p,\\,\\text{Fe}} 2\\text{NH}_3 \\quad (\\Delta_r H^{\\circ}_{298} < 0)', desc: 'Phản ứng thuận nghịch tỏa nhiệt điều chế NH₃ trong công nghiệp.' },
          { label: 'Oxi hóa SO₂ thành SO₃', code: '2\\text{SO}_2 + \\text{O}_2 \\xrightleftharpoons{450^{\\circ}\\text{C},\\,\\text{V}_2\\text{O}_5} 2\\text{SO}_3', desc: 'Giai đoạn tiếp xúc trong sản xuất axit sunfuric H₂SO₄.' },
          { label: 'Điện phân dung dịch NaCl có màng ngăn', code: '2\\text{NaCl} + 2\\text{H}_2\\text{O} \\xrightarrow{\\text{đpdd, cmn}} 2\\text{NaOH} + \\text{Cl}_2\\uparrow + \\text{H}_2\\uparrow', desc: 'Phương trình điều chế xút NaOH và khí Clo trong công nghiệp.' },
          { label: 'Điện phân nóng chảy Al₂O₃', code: '2\\text{Al}_2\\text{O}_3 \\xrightarrow{\\text{đpnc, criolit}} 4\\text{Al} + 3\\text{O}_2\\uparrow', desc: 'Sản xuất Nhôm trong công nghiệp với xúc tác criolit Na₃AlF₆.' },
          { label: 'Phản ứng Nhiệt nhôm', code: '2\\text{Al} + \\text{Fe}_2\\text{O}_3 \\xrightarrow{t^{\\circ}} \\text{Al}_2\\text{O}_3 + 2\\text{Fe}', desc: 'Phản ứng tỏa nhiệt lớn dùng hàn đường ray tàu hỏa.' },
          { label: 'Khử Sắt(III) bằng Fe hoặc Cu', code: '\\text{Fe} + 2\\text{Fe}^{3+} \\rightarrow 3\\text{Fe}^{2+}, \\quad \\text{Cu} + 2\\text{Fe}^{3+} \\rightarrow \\text{Cu}^{2+} + 2\\text{Fe}^{2+}', desc: 'Phản ứng ion thu gọn kinh điển trong bài toán Sắt – Đồng.' },
          { label: 'Phản ứng Este hóa thuận nghịch', code: '\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\xrightleftharpoons{\\text{H}_2\\text{SO}_4\\text{ đặc},\\,t^{\\circ}} \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}', desc: 'Phản ứng điều chế etyl axetat từ axit axetic và ancol etylic.' },
          { label: 'Phản ứng Xà phòng hóa Este (1 chiều)', code: '\\text{RCOO}\\text{R}\\prime + \\text{NaOH} \\xrightarrow{t^{\\circ}} \\text{RCOONa} + \\text{R}\\prime\\text{OH}', desc: 'Thủy phân este trong môi trường kiềm tạo muối và ancol.' },
          { label: 'Xà phòng hóa Chất béo (Triglyceride)', code: '\\text{(RCOO)}_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\xrightarrow{t^{\\circ}} 3\\text{RCOONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3', desc: 'Tỉ lệ mol 1 chất béo : 3 NaOH tạo 3 muối xà phòng + 1 glixerol.' },
          { label: 'Phản ứng Tráng bạc Anđehit (Tollens)', code: '\\text{RCHO} + 2[\\text{Ag(NH}_3)_2]\\text{OH} \\xrightarrow{t^{\\circ}} \\text{RCOONH}_4 + 2\\text{Ag}\\downarrow + 3\\text{NH}_3 + \\text{H}_2\\text{O}', desc: '1 mol nhóm -CHO tạo 2 mol kết tủa Ag (riêng HCHO tạo 4 mol Ag).' },
          { label: 'Lên men Glucozơ thành Etanol', code: '\\text{C}_6\\text{H}_{12}\\text{O}_6 \\xrightarrow{\\text{enzyme},\\,30-35^{\\circ}\\text{C}} 2\\text{C}_2\\text{H}_5\\text{OH} + 2\\text{CO}_2\\uparrow', desc: '1 mol glucozơ lên men tạo 2 mol ancol etylic và 2 mol khí CO₂.' },
          { label: 'Thủy phân Tinh bột / Xenlulozơ', code: '(\\text{C}_6\\text{H}_{10}\\text{O}_5)_n + n\\text{H}_2\\text{O} \\xrightarrow{\\text{H}^+,\\,t^{\\circ}} n\\text{C}_6\\text{H}_{12}\\text{O}_6', desc: 'Thủy phân hoàn toàn polisaccarit tạo glucozơ.' }
        ]
      },
      {
        title: 'Axit Vô Cơ & Hữu Cơ (Đầy đủ)',
        items: [
          { label: 'Axit Clohiđric', code: '\\text{HCl}', desc: 'Axit mạnh 1 nấc, khí hiđro clorua tan trong nước (M = 36,5).' },
          { label: 'Axit Sunfuric', code: '\\text{H}_2\\text{SO}_4', desc: 'Axit mạnh 2 nấc; đặc nóng có tính oxi hóa mạnh và háo nước (M = 98).' },
          { label: 'Axit Nitric', code: '\\text{HNO}_3', desc: 'Axit mạnh có tính oxi hóa cực mạnh, hòa tan hầu hết kim loại trừ Au, Pt (M = 63).' },
          { label: 'Axit Photphoric', code: '\\text{H}_3\\text{PO}_4', desc: 'Axit trung bình 3 nấc, không có tính oxi hóa mạnh như HNO₃ (M = 98).' },
          { label: 'Axit Sunfuhiđric', code: '\\text{H}_2\\text{S}', desc: 'Axit rất yếu 2 nấc, khí mùi trứng thối, tính khử mạnh (M = 34).' },
          { label: 'Axit Sunfurơ', code: '\\text{H}_2\\text{SO}_3', desc: 'Axit yếu không bền, dễ phân hủy thành SO₂↑ và H₂O.' },
          { label: 'Axit Cacbonic', code: '\\text{H}_2\\text{CO}_3', desc: 'Axit yếu 2 nấc không bền, phân hủy thành CO₂↑ và H₂O.' },
          { label: 'Axit Flohiđric', code: '\\text{HF}', desc: 'Axit yếu nhưng có khả năng ăn mòn thủy tinh SiO₂ (M = 20).' },
          { label: 'Axit Bromhiđric', code: '\\text{HBr}', desc: 'Axit mạnh, tính khử mạnh hơn HCl (M = 81).' },
          { label: 'Axit Iothiđric', code: '\\text{HI}', desc: 'Axit mạnh nhất và tính khử mạnh nhất trong dãy HX (M = 128).' },
          { label: 'Axit Hipoclorơ', code: '\\text{HClO}', desc: 'Axit rất yếu nhưng có tính oxi hóa và tẩy màu, sát trùng mạnh.' },
          { label: 'Axit Pecloric', code: '\\text{HClO}_4', desc: 'Axit mạnh nhất trong các axit có oxi của Clo (Cl số oxi hóa +7).' },
          { label: 'Axit Silixic', code: '\\text{H}_2\\text{SiO}_3', desc: 'Axit ở dạng kết tủa keo trắng không tan trong nước.' },
          { label: 'Axit Fomic (Methanoic)', code: '\\text{HCOOH}', desc: 'Axit cacboxylic đơn giản nhất, tham gia phản ứng tráng bạc (M = 46).' },
          { label: 'Axit Axetic (Ethanoic)', code: '\\text{CH}_3\\text{COOH}', desc: 'Axit hữu cơ đơn chức trong giấm ăn 2–5% (M = 60).' },
          { label: 'Axit Propionic', code: '\\text{C}_2\\text{H}_5\\text{COOH}', desc: 'Axit cacboxylic no đơn chức có 3 nguyên tử C (M = 74).' },
          { label: 'Axit Acrylic', code: '\\text{CH}_2=\\text{CH}-\\text{COOH}', desc: 'Axit không no có 1 nối đôi C=C, làm mất màu nước Brom (M = 72).' },
          { label: 'Axit Metacrylic', code: '\\text{CH}_2=\\text{C(CH}_3)-\\text{COOH}', desc: 'Đồng đẳng của axit acrylic, dùng tổng hợp thủy tinh hữu cơ (M = 86).' },
          { label: 'Axit Oxalic', code: '\\text{HOOC}-\\text{COOH}', desc: 'Axit cacboxylic hai chức mạch thẳng (M = 90).' },
          { label: 'Axit Benzoic', code: '\\text{C}_6\\text{H}_5\\text{COOH}', desc: 'Axit thơm đơn chức giản đơn nhất (M = 122).' }
        ]
      },
      {
        title: 'Bazơ, Kiềm & Hiđroxit Lưỡng Tính',
        items: [
          { label: 'Natri Hiđroxit (Xút ăn da)', code: '\\text{NaOH}', desc: 'Bazơ kiềm mạnh, tan hoàn toàn trong nước tỏa nhiệt (M = 40).' },
          { label: 'Kali Hiđroxit', code: '\\text{KOH}', desc: 'Bazơ kiềm mạnh, phân li hoàn toàn trong nước (M = 56).' },
          { label: 'Canxi Hiđroxit (Nước vôi trong)', code: '\\text{Ca(OH)}_2', desc: 'Bazơ kiềm ít tan, dùng nhận biết và hấp thụ khí CO₂, SO₂ (M = 74).' },
          { label: 'Bari Hiđroxit', code: '\\text{Ba(OH)}_2', desc: 'Bazơ kiềm mạnh hai nấc, tạo kết tủa với cả CO₃²⁻ và SO₄²⁻ (M = 171).' },
          { label: 'Liti Hiđroxit', code: '\\text{LiOH}', desc: 'Bazơ kiềm nhóm IA (M = 24).' },
          { label: 'Magie Hiđroxit', code: '\\text{Mg(OH)}_2\\downarrow', desc: 'Bazơ kết tủa màu trắng, bị nhiệt phân thành MgO + H₂O (M = 58).' },
          { label: 'Đồng(II) Hiđroxit', code: '\\text{Cu(OH)}_2\\downarrow', desc: 'Kết tủa màu xanh lam, hòa tan poliancol (glixerol, glucozơ) tạo phức xanh thẫm (M = 98).' },
          { label: 'Sắt(II) Hiđroxit', code: '\\text{Fe(OH)}_2\\downarrow', desc: 'Kết tủa màu trắng xanh, dễ bị oxi hóa ngoài không khí thành Fe(OH)₃ nâu đỏ (M = 90).' },
          { label: 'Sắt(III) Hiđroxit', code: '\\text{Fe(OH)}_3\\downarrow', desc: 'Kết tủa màu nâu đỏ đặc trưng của ion Fe³⁺ (M = 107).' },
          { label: 'Nhôm Hiđroxit (Lưỡng tính)', code: '\\text{Al(OH)}_3\\downarrow', desc: 'Kết tủa keo trắng lưỡng tính, tan trong cả axit mạnh và kiềm mạnh (M = 78).' },
          { label: 'Kẽm Hiđroxit (Lưỡng tính)', code: '\\text{Zn(OH)}_2\\downarrow', desc: 'Kết tủa trắng lưỡng tính và tạo phức tan với dung dịch NH₃ (M = 99).' },
          { label: 'Crom(III) Hiđroxit (Lưỡng tính)', code: '\\text{Cr(OH)}_3\\downarrow', desc: 'Kết tủa lục xám mang tính lưỡng tính tương tự Al(OH)₃ (M = 103).' },
          { label: 'Crom(II) Hiđroxit', code: '\\text{Cr(OH)}_2\\downarrow', desc: 'Kết tủa màu vàng, có tính khử mạnh.' },
          { label: 'Amoniac', code: '\\text{NH}_3', desc: 'Khí mùi khai, bazơ yếu trong nước: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ (M = 17).' }
        ]
      },
      {
        title: 'Muối Vô Cơ, Thuốc Thử & Phân Bón Hóa Học',
        items: [
          { label: 'Natri Clorua (Muối ăn)', code: '\\text{NaCl}', desc: 'Muối trung hòa dùng điện phân điều chế NaOH, Cl₂, H₂ (M = 58,5).' },
          { label: 'Canxi Cacbonat (Đá vôi)', code: '\\text{CaCO}_3\\downarrow', desc: 'Kết tủa trắng tan trong axit và nước có hòa tan CO₂ (M = 100).' },
          { label: 'Canxi Hiđrocacbonat', code: '\\text{Ca(HCO}_3)_2', desc: 'Muối tan gây độ cứng tạm thời của nước, dễ bị nhiệt phân (M = 162).' },
          { label: 'Bari Cacbonat', code: '\\text{BaCO}_3\\downarrow', desc: 'Kết tủa trắng tan trong axit mạnh HCl, HNO₃ (M = 197).' },
          { label: 'Bari Sunfat', code: '\\text{BaSO}_4\\downarrow', desc: 'Kết tủa trắng bền vững, KHÔNG tan trong các axit mạnh (M = 233).' },
          { label: 'Bari Clorua', code: '\\text{BaCl}_2', desc: 'Thuốc thử nhận biết ion sunfat SO₄²⁻ (M = 208).' },
          { label: 'Natri Cacbonat (Soda)', code: '\\text{Na}_2\\text{CO}_3', desc: 'Muối làm mềm nước cứng, môi trường kiềm làm hồng phenolphtalein (M = 106).' },
          { label: 'Natri Hiđrocacbonat (Baking soda)', code: '\\text{NaHCO}_3', desc: 'Muối lưỡng tính dùng làm thuốc đau dạ dày và bột nở (M = 84).' },
          { label: 'Bạc Nitrat (Thuốc thử)', code: '\\text{AgNO}_3', desc: 'Thuốc thử nhận biết Cl⁻, Br⁻, I⁻, PO₄³⁻ và phản ứng tráng bạc (M = 170).' },
          { label: 'Bạc Clorua (Kết tủa trắng)', code: '\\text{AgCl}\\downarrow', desc: 'Kết tủa màu trắng hóa đen ngoài ánh sáng (M = 143,5).' },
          { label: 'Bạc Bromua (Vàng nhạt)', code: '\\text{AgBr}\\downarrow', desc: 'Kết tủa màu vàng nhạt không tan trong HNO₃ (M = 188).' },
          { label: 'Bạc Iotua (Vàng đậm)', code: '\\text{AgI}\\downarrow', desc: 'Kết tủa màu vàng đậm không tan trong axit (M = 235).' },
          { label: 'Sắt(II) Sunfat', code: '\\text{FeSO}_4', desc: 'Muối sắt(II) có tính khử, làm mất màu thuốc tím KMnO₄/H₂SO₄ (M = 152).' },
          { label: 'Sắt(III) Sunfat', code: '\\text{Fe}_2(\\text{SO}_4)_3', desc: 'Muối sắt(III) có tính oxi hóa (M = 400).' },
          { label: 'Sắt(II) Clorua & Sắt(III) Clorua', code: '\\text{FeCl}_2, \\quad \\text{FeCl}_3', desc: 'Hai muối clorua của Sắt (M = 127 và M = 162,5).' },
          { label: 'Đồng(II) Sunfat & Tinh thể ngậm nước', code: '\\text{CuSO}_4 \\cdot 5\\text{H}_2\\text{O}', desc: 'Phèn xanh (M = 250); CuSO₄ khan màu trắng dùng phát hiện dấu vết nước (M = 160).' },
          { label: 'Nhôm Clorua & Nhôm Sunfat', code: '\\text{AlCl}_3, \\quad \\text{Al}_2(\\text{SO}_4)_3', desc: 'Muối nhôm thủy phân cho môi trường axit (M = 133,5 và M = 342).' },
          { label: 'Phèn chua', code: '\\text{K}_2\\text{SO}_4 \\cdot \\text{Al}_2(\\text{SO}_4)_3 \\cdot 24\\text{H}_2\\text{O}', desc: 'Phèn nhôm – kali dùng làm trong nước đục.' },
          { label: 'Kali Pemanganat (Thuốc tím)', code: '\\text{KMnO}_4', desc: 'Chất oxi hóa mạnh trong cả môi trường axit, trung tính và kiềm (M = 158).' },
          { label: 'Kali Đicromat', code: '\\text{K}_2\\text{Cr}_2\\text{O}_7', desc: 'Tinh thể màu đỏ da cam, chất oxi hóa mạnh trong môi trường axit (M = 294).' },
          { label: 'Nước Javel & Clorua vôi', code: '\\text{NaClO}, \\quad \\text{CaOCl}_2', desc: 'Muối có tính oxi hóa mạnh dùng tẩy trắng và khử trùng.' },
          { label: 'Amoni Clorua & Đạm hai lá', code: '\\text{NH}_4\\text{Cl}, \\quad \\text{NH}_4\\text{NO}_3', desc: 'Muối amoni và phân đạm amoni nitrat (M = 53,5 và M = 80).' },
          { label: 'Phân đạm Urê', code: '\\text{(NH}_2)_2\\text{CO}', desc: 'Phân đạm có hàm lượng Nitơ cao nhất ~46% N (M = 60).' },
          { label: 'Supephotphat kép', code: '\\text{Ca(H}_2\\text{PO}_4)_2', desc: 'Thành phần chính của phân lân supephotphat (M = 234).' }
        ]
      },
      {
        title: 'Oxit Kim Loại, Oxit Phi Kim & Khoáng Vật',
        items: [
          { label: 'Cacbon Monoxit & Cacbon Đioxit', code: '\\text{CO}, \\quad \\text{CO}_2', desc: 'CO là oxit trung tính khử mạnh (M = 28); CO₂ là oxit axit (M = 44).' },
          { label: 'Lưu huỳnh Đioxit & Trioxit', code: '\\text{SO}_2, \\quad \\text{SO}_3', desc: 'SO₂ vừa khử vừa oxi hóa (M = 64); SO₃ tác dụng nước tạo H₂SO₄ (M = 80).' },
          { label: 'Các Oxit của Nitơ', code: '\\text{NO}, \\quad \\text{NO}_2, \\quad \\text{N}_2\\text{O}', desc: 'NO không màu hóa nâu ngoài không khí (M = 30); NO₂ khí màu nâu đỏ (M = 46).' },
          { label: 'Điphotpho Pentaoxit', code: '\\text{P}_2\\text{O}_5', desc: 'Oxit axit hút ẩm cực mạnh tạo H₃PO₄ (M = 142).' },
          { label: 'Silic Đioxit (Cát thạch anh)', code: '\\text{SiO}_2', desc: 'Oxit axit tan trong kiềm nóng chảy và dung dịch HF (M = 60).' },
          { label: 'Canxi Oxit (Vôi sống)', code: '\\text{CaO}', desc: 'Oxit bazơ tác dụng mạnh với nước tạo Ca(OH)₂ (M = 56).' },
          { label: 'Natri Oxit & Kali Oxit', code: '\\text{Na}_2\\text{O}, \\quad \\text{K}_2\\text{O}', desc: 'Oxit kim loại kiềm tan hoàn toàn trong nước (M = 62 và M = 94).' },
          { label: 'Magie Oxit & Đồng(II) Oxit', code: '\\text{MgO}, \\quad \\text{CuO}', desc: 'MgO bền nhiệt (M = 40); CuO bột màu đen bị khử bởi H₂, CO (M = 80).' },
          { label: 'Nhôm Oxit (Boxit – Lưỡng tính)', code: '\\text{Al}_2\\text{O}_3', desc: 'Oxit lưỡng tính bền, nguyên liệu điện phân nóng chảy sản xuất Nhôm (M = 102).' },
          { label: 'Kẽm Oxit & Crom(III) Oxit', code: '\\text{ZnO}, \\quad \\text{Cr}_2\\text{O}_3', desc: 'Hai oxit lưỡng tính tan trong axit mạnh và kiềm đặc (M = 81 và M = 152).' },
          { label: 'Crom(VI) Oxit', code: '\\text{CrO}_3', desc: 'Oxit axit màu đỏ thẫm, tính oxi hóa rất mạnh, bốc cháy khi tiếp xúc P, C₂H₅OH (M = 100).' },
          { label: 'Sắt(II) Oxit & Sắt(III) Oxit (Hematit)', code: '\\text{FeO}, \\quad \\text{Fe}_2\\text{O}_3', desc: 'FeO màu đen tính khử (M = 72); Fe₂O₃ màu đỏ nâu trong quặng hematit (M = 160).' },
          { label: 'Oxit Sắt Từ (Manhetit)', code: '\\text{Fe}_3\\text{O}_4', desc: 'Oxit hỗn tạp FeO·Fe₂O₃ có từ tính (M = 232).' },
          { label: 'Quặng Pirit Sắt & Xiderit', code: '\\text{FeS}_2, \\quad \\text{FeCO}_3', desc: 'Quặng pirit dùng sản xuất H₂SO₄ (M = 120); quặng xiderit (M = 116).' }
        ]
      },
      {
        title: 'Hiđrocacbon: Ankan, Anken, Ankađien, Ankin & Aren',
        items: [
          { label: 'Dãy đồng đẳng Ankan', code: '\\text{C}_n\\text{H}_{2n+2} \\quad (n \\ge 1)', desc: 'Hiđrocacbon no mạch hở, chỉ chứa liên kết đơn σ (M = 14n + 2).' },
          { label: 'Metan – Etan – Propan – Butan', code: '\\text{CH}_4, \\quad \\text{C}_2\\text{H}_6, \\quad \\text{C}_3\\text{H}_8, \\quad \\text{C}_4\\text{H}_{10}', desc: '4 ankan thể khí ở điều kiện thường (M = 16, 30, 44, 58).' },
          { label: 'Dãy đồng đẳng Anken', code: '\\text{C}_n\\text{H}_{2n} \\quad (n \\ge 2)', desc: 'Hiđrocacbon không no mạch hở có 1 liên kết đôi C=C (M = 14n).' },
          { label: 'Etilen – Propen – Buten', code: '\\text{C}_2\\text{H}_4, \\quad \\text{C}_3\\text{H}_6, \\quad \\text{C}_4\\text{H}_8', desc: 'Các anken tiêu biểu làm mất màu dung dịch Brom và KMnO₄ (M = 28, 42, 56).' },
          { label: 'Dãy Ankađien & Ankin', code: '\\text{C}_n\\text{H}_{2n-2} \\quad (n \\ge 2)', desc: 'Hiđrocacbon có 2 liên kết đôi hoặc 1 liên kết ba C≡C (M = 14n - 2).' },
          { label: 'Buta-1,3-đien & Isopren', code: '\\text{CH}_2=\\text{CH}-\\text{CH}=\\text{CH}_2, \\quad \\text{C}_5\\text{H}_8', desc: 'Hai ankađien liên hợp dùng trùng hợp cao su Buna và cao su Isopren (M = 54, 68).' },
          { label: 'Axetilen & Propin', code: '\\text{CH}\\equiv\\text{CH}, \\quad \\text{CH}\\equiv\\text{C}-\\text{CH}_3', desc: 'Ankin đầu dãy tạo kết tủa vàng với AgNO₃/NH₃ (M = 26 và M = 40).' },
          { label: 'Vinylaxetilen', code: '\\text{CH}\\equiv\\text{C}-\\text{CH}=\\text{CH}_2', desc: 'Hợp chất vừa có liên kết ba đầu mạch vừa có liên kết đôi (M = 52).' },
          { label: 'Dãy đồng đẳng Benzen (Aren)', code: '\\text{C}_n\\text{H}_{2n-6} \\quad (n \\ge 6)', desc: 'Hiđrocacbon thơm đơn vòng (M = 14n - 6).' },
          { label: 'Benzen & Toluen', code: '\\text{C}_6\\text{H}_6, \\quad \\text{C}_6\\text{H}_5\\text{CH}_3', desc: 'Benzen (M = 78) và Toluen (M = 92) trong dãy hiđrocacbon thơm.' },
          { label: 'Stiren (Vinylbenzen)', code: '\\text{C}_6\\text{H}_5-\\text{CH}=\\text{CH}_2', desc: 'Chất lỏng thơm có nhánh không no, trùng hợp tạo polistiren PS (M = 104).' },
          { label: 'Naphtalen', code: '\\text{C}_{10}\\text{H}_8', desc: 'Hiđrocacbon thơm hai vòng ngưng tụ có tính thăng hoa (M = 128).' }
        ]
      },
      {
        title: 'Ancol, Phenol, Anđehit & Xeton',
        items: [
          { label: 'Ancol no, đơn chức, mạch hở', code: '\\text{C}_n\\text{H}_{2n+1}\\text{OH} \\quad (n \\ge 1)', desc: 'Công thức tổng quát ancol no đơn chức mạch hở (M = 14n + 18).' },
          { label: 'Metanol & Etanol (Ancol etylic)', code: '\\text{CH}_3\\text{OH}, \\quad \\text{C}_2\\text{H}_5\\text{OH}', desc: 'Hai ancol đầu dãy (M = 32 và M = 46), tác dụng Na giải phóng 1/2 H₂.' },
          { label: 'Propan-1-ol & Propan-2-ol', code: '\\text{CH}_3\\text{CH}_2\\text{CH}_2\\text{OH}, \\quad \\text{CH}_3\\text{CH(OH)CH}_3', desc: 'Ancol bậc I và ancol bậc II có 3 cacbon (M = 60).' },
          { label: 'Etilen Glicol (Ancol 2 chức)', code: '\\text{C}_2\\text{H}_4\\text{(OH)}_2', desc: 'Poliancol hòa tan Cu(OH)₂ ở nhiệt độ thường tạo dung dịch xanh lam (M = 62).' },
          { label: 'Glixerol (Glycerol – 3 chức)', code: '\\text{C}_3\\text{H}_5\\text{(OH)}_3', desc: 'Ancol 3 chức thu được khi xà phòng hóa chất béo (M = 92).' },
          { label: 'Phenol', code: '\\text{C}_6\\text{H}_5\\text{OH}', desc: 'Hợp chất thơm có nhóm -OH đính trực tiếp vòng benzen, tác dụng NaOH và Br₂ (M = 94).' },
          { label: '2,4,6-Tribromphenol', code: '\\text{C}_6\\text{H}_2\\text{Br}_3\\text{OH}\\downarrow', desc: 'Kết tủa màu trắng khi cho phenol hoặc anilin tác dụng nước Brom (M = 331).' },
          { label: 'Anđehit no, đơn chức, mạch hở', code: '\\text{C}_n\\text{H}_{2n}\\text{O} \\quad (n \\ge 1)', desc: 'Công thức tổng quát anđehit no đơn chức (M = 14n + 16).' },
          { label: 'Anđehit Fomic (Methanal)', code: '\\text{HCHO}', desc: 'Anđehit đơn giản nhất, 1 mol HCHO tráng bạc tạo 4 mol Ag↓ (M = 30).' },
          { label: 'Anđehit Axetic (Ethanal)', code: '\\text{CH}_3\\text{CHO}', desc: 'Anđehit đơn chức tráng bạc tạo 2 mol Ag↓ (M = 44).' },
          { label: 'Anđehit Oxalic (2 chức)', code: '\\text{(CHO)}_2', desc: 'Anđehit 2 chức no đơn giản nhất, tráng bạc tạo 4 mol Ag↓ (M = 58).' },
          { label: 'Axeton (Propan-2-on)', code: '\\text{CH}_3-\\text{CO}-\\text{CH}_3', desc: 'Xeton đơn giản nhất, không tham gia phản ứng tráng bạc (M = 58).' }
        ]
      },
      {
        title: 'Este, Chất Béo & Xà Phòng (Lớp 12)',
        items: [
          { label: 'Công thức tổng quát Este', code: '\\text{RCOO}\\text{R}\\prime, \\quad \\text{C}_n\\text{H}_{2n}\\text{O}_2 \\ (n \\ge 2)', desc: 'Este no, đơn chức, mạch hở (M = 14n + 32).' },
          { label: 'Metyl Fomat', code: '\\text{HCOOCH}_3', desc: 'Este nhỏ nhất có 2C, đồng phân với CH₃COOH, có tráng bạc (M = 60).' },
          { label: 'Etyl Fomat & Metyl Axetat', code: '\\text{HCOOC}_2\\text{H}_5, \\quad \\text{CH}_3\\text{COOCH}_3', desc: 'Hai este đồng phân C₃H₆O₂ (M = 74).' },
          { label: 'Etyl Axetat', code: '\\text{CH}_3\\text{COOC}_2\\text{H}_5', desc: 'Este C₄H₈O₂ mùi thơm đặc trưng, dung môi phổ biến (M = 88).' },
          { label: 'Isoamyl Axetat (Dầu chuối)', code: '\\text{CH}_3\\text{COOCH}_2\\text{CH}_2\\text{CH(CH}_3)_2', desc: 'Este có mùi thơm chuối chín đặc trưng (M = 130).' },
          { label: 'Vinyl Axetat', code: '\\text{CH}_3\\text{COOCH}=\\text{CH}_2', desc: 'Este không no thủy phân tạo muối axetat và anđehit CH₃CHO (M = 86).' },
          { label: 'Metyl Acrylat & Metyl Metacrylat', code: '\\text{CH}_2=\\text{CHCOOCH}_3, \\quad \\text{CH}_2=\\text{C(CH}_3)\\text{COOCH}_3', desc: 'Monome tổng hợp thủy tinh hữu cơ plexiglas (M = 86 và M = 100).' },
          { label: 'Phenyl Axetat (Este của Phenol)', code: '\\text{CH}_3\\text{COOC}_6\\text{H}_5', desc: 'Tác dụng với NaOH theo tỉ lệ mol 1:2 tạo 2 muối và H₂O (M = 136).' },
          { label: 'Tripalmitin (Chất béo rắn)', code: '\\text{(C}_{15}\\text{H}_{31}\\text{COO)}_3\\text{C}_3\\text{H}_5', desc: 'Triglyceride no của axit panmitic C₁₅H₃₁COOH (M = 806).' },
          { label: 'Tristearin (Chất béo rắn)', code: '\\text{(C}_{17}\\text{H}_{35}\\text{COO)}_3\\text{C}_3\\text{H}_5', desc: 'Triglyceride no của axit stearic C₁₇H₃₅COOH (M = 890).' },
          { label: 'Triolein (Chất béo lỏng)', code: '\\text{(C}_{17}\\text{H}_{33}\\text{COO)}_3\\text{C}_3\\text{H}_5', desc: 'Triglyceride không no có 3 liên kết đôi C=C ở gốc axit (M = 884).' },
          { label: 'Trilinolein (Chất béo lỏng)', code: '\\text{(C}_{17}\\text{H}_{31}\\text{COO)}_3\\text{C}_3\\text{H}_5', desc: 'Triglyceride không no có 6 liên kết đôi C=C ở gốc axit (M = 878).' },
          { label: 'Natri Stearat (Xà phòng)', code: '\\text{C}_{17}\\text{H}_{35}\\text{COONa}', desc: 'Muối natri của axit béo là thành phần chính của xà phòng (M = 306).' }
        ]
      },
      {
        title: 'Amin, Amino Axit, Peptit & Protein (Lớp 12)',
        items: [
          { label: 'Amin no, đơn chức, mạch hở', code: '\\text{C}_n\\text{H}_{2n+3}\\text{N} \\quad (n \\ge 1)', desc: 'Công thức tổng quát amin no đơn chức mạch hở (M = 14n + 17).' },
          { label: 'Metylamin & Etylamin', code: '\\text{CH}_3\\text{NH}_2, \\quad \\text{C}_2\\text{H}_5\\text{NH}_2', desc: 'Amin bậc I làm xanh quỳ tím ẩm, tính bazơ mạnh hơn NH₃ (M = 31 và M = 45).' },
          { label: 'Đimetylamin & Trimetylamin', code: '\\text{(CH}_3)_2\\text{NH}, \\quad \\text{(CH}_3)_3\\text{N}', desc: 'Amin bậc II (M = 45) và amin bậc III (M = 59).' },
          { label: 'Anilin (Phenylamin)', code: '\\text{C}_6\\text{H}_5\\text{NH}_2', desc: 'Amin thơm bậc I, không làm đổi màu quỳ tím, tạo kết tủa trắng với Br₂ (M = 93).' },
          { label: 'Glyxin (Gly – M = 75)', code: '\\text{H}_2\\text{N}-\\text{CH}_2-\\text{COOH}', desc: 'Amino axit nhỏ nhất (1 nhóm NH₂, 1 nhóm COOH), môi trường trung tính (M = 75).' },
          { label: 'Alanin (Ala – M = 89)', code: '\\text{CH}_3-\\text{CH(NH}_2)-\\text{COOH}', desc: 'α-Amino axit có 3C, không làm đổi màu quỳ tím (M = 89).' },
          { label: 'Valin (Val – M = 117)', code: '\\text{(CH}_3)_2\\text{CH}-\\text{CH(NH}_2)-\\text{COOH}', desc: 'α-Amino axit mạch nhánh có 5C (M = 117).' },
          { label: 'Axit Glutamic (Glu – M = 147)', code: '\\text{HOOC}-[\\text{CH}_2]_2-\\text{CH(NH}_2)-\\text{COOH}', desc: 'Amino axit có 2 nhóm -COOH và 1 nhóm -NH₂, làm quỳ tím hóa hồng (M = 147).' },
          { label: 'Bột ngọt (Mì chính)', code: '\\text{NaOOC}-[\\text{CH}_2]_2-\\text{CH(NH}_2)-\\text{COOH}', desc: 'Muối mononatri glutamat của axit glutamic (M = 169).' },
          { label: 'Lysin (Lys – M = 146)', code: '\\text{H}_2\\text{N}-[\\text{CH}_2]_4-\\text{CH(NH}_2)-\\text{COOH}', desc: 'Amino axit có 2 nhóm -NH₂ và 1 nhóm -COOH, làm quỳ tím hóa xanh (M = 146).' },
          { label: 'Phân tử khối n-peptit', code: 'M_{\\text{peptit}} = \\sum M_{\\text{aa}} - (n - 1) \\times 18', desc: 'Công thức tính nhanh khối lượng mol của n-peptit từ các amino axit.' }
        ]
      },
      {
        title: 'Cacbohiđrat & Polime (Lớp 12)',
        items: [
          { label: 'Glucozơ & Fructozơ', code: '\\text{C}_6\\text{H}_{12}\\text{O}_6', desc: 'Monosaccarit đồng phân (M = 180); hòa tan Cu(OH)₂ và tráng bạc tạo 2Ag.' },
          { label: 'Saccarozơ & Mantozơ', code: '\\text{C}_{12}\\text{H}_{22}\\text{O}_{11}', desc: 'Đisaccarit (M = 342); thủy phân 1 mol tạo 2 mol monosaccarit.' },
          { label: 'Tinh bột & Xenlulozơ', code: '(\\text{C}_6\\text{H}_{10}\\text{O}_5)_n', desc: 'Polisaccarit thiên nhiên (M mắt xích = 162).' },
          { label: 'Xenlulozơ Trinitrat (Thuốc súng không khói)', code: '[\\text{C}_6\\text{H}_7\\text{O}_2(\\text{ONO}_2)_3]_n', desc: 'Sản phẩm este hóa xenlulozơ với HNO₃ đặc / H₂SO₄ đặc (M mắt xích = 297).' },
          { label: 'Polietilen (PE)', code: '(-\\text{CH}_2-\\text{CH}_2-)_n', desc: 'Nhựa nhiệt dẻo trùng hợp từ etilen CH₂=CH₂ (M mắt xích = 28).' },
          { label: 'Poli(vinyl clorua) (PVC)', code: '(-\\text{CH}_2-\\text{CHCl}-)_n', desc: 'Nhựa trùng hợp từ vinyl clorua CH₂=CHCl (M mắt xích = 62,5).' },
          { label: 'Polistiren (PS)', code: '(-\\text{CH}_2-\\text{CH(C}_6\\text{H}_5)-)_n', desc: 'Polime trùng hợp từ stiren (M mắt xích = 104).' },
          { label: 'Poli(metyl metacrylat) (PMMA)', code: '(-\\text{CH}_2-\\text{C(CH}_3)(\\text{COOCH}_3)-)_n', desc: 'Thủy tinh hữu cơ plexiglas trong suốt (M mắt xích = 100).' },
          { label: 'Cao su Buna', code: '(-\\text{CH}_2-\\text{CH}=\\text{CH}-\\text{CH}_2-)_n', desc: 'Cao su tổng hợp trùng hợp từ buta-1,3-đien (M mắt xích = 54).' },
          { label: 'Tơ Nilon-6 (Tơ Capron)', code: '(-\\text{NH}-[\\text{CH}_2]_5-\\text{CO}-)_n', desc: 'Poliamit tổng hợp từ axit ε-aminocaproic hoặc caprolactam (M mắt xích = 113).' },
          { label: 'Tơ Nilon-6,6', code: '(-\\text{NH}-[\\text{CH}_2]_6-\\text{NH}-\\text{CO}-[\\text{CH}_2]_4-\\text{CO}-)_n', desc: 'Poliamit đồng trùng ngưng từ hexametylenđiamin và axit ađipic (M mắt xích = 226).' }
        ]
      },
      {
        title: 'Công thức Số Mol, Nồng Độ, Tỉ Khối & Độ Bất Bão Hòa',
        items: [
          { label: 'Số mol theo khối lượng', code: 'n = \\frac{m}{M} \\Rightarrow m = n \\cdot M', desc: 'Liên hệ giữa số mol (mol), khối lượng (g) và khối lượng mol (g/mol).' },
          { label: 'Số mol khí ở đkc (25°C, 1 bar)', code: 'n = \\frac{V}{24{,}79}', desc: 'Số mol chất khí ở điều kiện chuẩn GDPT 2018 (25°C, 1 bar).' },
          { label: 'Số mol khí ở đktc (0°C, 1 atm)', code: 'n = \\frac{V}{22{,}4}', desc: 'Số mol chất khí ở điều kiện tiêu chuẩn cũ (0°C, 1 atm).' },
          { label: 'Phương trình trạng thái khí lí tưởng', code: 'p V = n R T \\Rightarrow n = \\frac{p V}{R T}', desc: 'Tính số mol khí ở nhiệt độ T (K) và áp suất p bất kỳ (R = 0,082).' },
          { label: 'Nồng độ mol dung dịch (CM)', code: 'C_M = \\frac{n}{V_{\\text{dd}}}\\text{ (mol/L)}', desc: 'Số mol chất tan trong 1 lít dung dịch.' },
          { label: 'Nồng độ phần trăm (C%)', code: 'C\\% = \\frac{m_{\\text{ct}}}{m_{\\text{dd}}} \\times 100\\%', desc: 'Số gam chất tan trong 100 gam dung dịch.' },
          { label: 'Liên hệ giữa CM và C%', code: 'C_M = \\frac{10 \\cdot D \\cdot C\\%}{M}', desc: 'Chuyển đổi nhanh giữa nồng độ mol và nồng độ phần trăm qua khối lượng riêng D (g/mL).' },
          { label: 'Khối lượng dung dịch sau phản ứng', code: 'm_{\\text{dd sau}} = \\sum m_{\\text{vào}} - m_{\\text{kết tủa}} - m_{\\text{khí}}', desc: 'Định luật bảo toàn khối lượng áp dụng cho dung dịch sau phản ứng.' },
          { label: 'Tỉ khối của khí A so với khí B', code: 'd_{A/B} = \\frac{M_A}{M_B}, \\quad d_{A/\\text{kk}} = \\frac{M_A}{29}', desc: 'Công thức tính tỉ khối chất khí và tỉ khối so với không khí.' },
          { label: 'Khối lượng mol trung bình hỗn hợp', code: '\\bar{M} = \\frac{m_{\\text{hh}}}{n_{\\text{hh}}} = \\frac{m_1 + m_2}{n_1 + n_2}', desc: 'Khối lượng mol trung bình của hỗn hợp nhiều chất.' },
          { label: 'Hiệu suất phản ứng hóa học', code: 'H\\% = \\frac{n_{\\text{thực tế}}}{n_{\\text{lí thuyết}}} \\times 100\\% = \\frac{m_{\\text{tt}}}{m_{\\text{lt}}} \\times 100\\%', desc: 'Công thức tính hiệu suất phản ứng theo lượng thực tế trên lượng lí thuyết.' },
          { label: 'Độ bất bão hòa k (Số liên kết π + vòng)', code: 'k = \\frac{2C + 2 + N - H - X}{2}', desc: 'Tính tổng số liên kết π và số vòng của hợp chất hữu cơ CₓHᵧO₂NₜXᵤ.' }
        ]
      },
      {
        title: 'Bảo Toàn, Nhiệt Hóa Học, Tốc Độ, Cân Bằng, pH & Điện Hóa',
        items: [
          { label: 'Định luật Bảo toàn Khối lượng', code: '\\sum m_{\\text{trước}} = \\sum m_{\\text{sau}}', desc: 'Tổng khối lượng các chất tham gia bằng tổng khối lượng các sản phẩm.' },
          { label: 'Định luật Bảo toàn Điện tích', code: '\\sum n_{\\text{điện tích (+)}} = \\sum n_{\\text{điện tích (-)}}', desc: 'Dung dịch luôn trung hòa về điện: tổng mol điện tích dương bằng tổng mol điện tích âm.' },
          { label: 'Định luật Bảo toàn Electron', code: '\\sum n_{e\\text{ nhường}} = \\sum n_{e\\text{ nhận}}', desc: 'Trong phản ứng oxi hóa – khử, tổng số mol e chất khử nhường bằng tổng số mol e chất oxi hóa nhận.' },
          { label: 'Biến thiên Enthalpy theo nhiệt tạo thành', code: '\\Delta_r H^{\\circ}_{298} = \\sum \\Delta_f H^{\\circ}_{298}(\\text{sp}) - \\sum \\Delta_f H^{\\circ}_{298}(\\text{cđ})', desc: 'Tính nhiệt phản ứng chuẩn từ enthalpy tạo thành của sản phẩm trừ chất đầu (Lớp 10).' },
          { label: 'Biến thiên Enthalpy theo năng lượng liên kết', code: '\\Delta_r H^{\\circ}_{298} = \\sum E_b(\\text{cđ}) - \\sum E_b(\\text{sp})', desc: 'Tính nhiệt phản ứng cho chất khí từ tổng năng lượng liên kết chất đầu trừ sản phẩm.' },
          { label: 'Tốc độ trung bình của phản ứng', code: '\\bar{v} = \\pm \\frac{\\Delta C}{\\Delta t}', desc: 'Độ biến thiên nồng độ của một chất trong một đơn vị thời gian.' },
          { label: 'Hệ số nhiệt độ Van’t Hoff', code: '\\frac{v_2}{v_1} = \\gamma^{\\frac{T_2 - T_1}{10}}', desc: 'Khi nhiệt độ tăng thêm 10°C thì tốc độ phản ứng tăng từ 2 đến 4 lần (hệ số γ).' },
          { label: 'Hằng số cân bằng hóa học KC', code: 'K_C = \\frac{[\\text{C}]^c \\cdot [\\text{D}]^d}{[\\text{A}]^a \\cdot [\\text{B}]^b}', desc: 'Biểu thức hằng số cân bằng cho phản ứng thuận nghịch aA + bB ⇌ cC + dD (Lớp 11).' },
          { label: 'Công thức tính pH & pOH', code: '\\text{pH} = -\\log[\\text{H}^+], \\quad \\text{pOH} = -\\log[\\text{OH}^-], \\quad \\text{pH} + \\text{pOH} = 14', desc: 'Đánh giá độ axit / kiềm của dung dịch ở 25°C.' },
          { label: 'Tích số ion của nước', code: 'K_w = [\\text{H}^+]\\cdot[\\text{OH}^-] = 10^{-14}', desc: 'Hằng số phân li của nước ở 25°C.' },
          { label: 'Suất điện động chuẩn của Pin Galvani', code: 'E^{\\circ}_{\\text{pin}} = E^{\\circ}_{\\text{cathode (+)}} - E^{\\circ}_{\\text{anode (-)}}', desc: 'Hiệu thế điện cực chuẩn giữa cực dương (khử) và cực âm (oxi hóa) (Lớp 12).' },
          { label: 'Định luật Faraday về Điện phân', code: 'm = \\frac{A \\cdot I \\cdot t}{n \\cdot F} \\quad (F = 96500\\text{ C/mol})', desc: 'Khối lượng chất thoát ra ở điện cực khi dòng điện I (A) chạy qua trong thời gian t (s).' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 3. VẬT LÍ (LỚP 10, 11, 12 — ĐẦY ĐỦ CƠ, NHIỆT, ĐIỆN, TỪ, QUANG, LƯỢNG TỬ & HẠT NHÂN)
   * ========================================================================== */
  physics: {
    id: 'physics',
    name: 'Vật lí',
    shortName: 'Lí',
    icon: Atom,
    symbolGroups: [
      {
        title: 'Đại lượng Cơ học & Nhiệt học',
        items: [
          { label: 'Vectơ vận tốc', code: '\\vec{v}', desc: 'Vectơ vận tốc tức thời của vật (m/s).' },
          { label: 'Vectơ gia tốc', code: '\\vec{a}', desc: 'Vectơ gia tốc biến thiên vận tốc (m/s²).' },
          { label: 'Vectơ lực', code: '\\vec{F}', desc: 'Vectơ lực tác dụng lên vật (N).' },
          { label: 'Vectơ động lượng', code: '\\vec{p}', desc: 'Vectơ động lượng p = m·v (kg·m/s).' },
          { label: 'Xung lượng lực', code: '\\Delta \\vec{p}', desc: 'Độ biến thiên động lượng của vật.' },
          { label: 'Moment lực', code: 'M = F\\cdot d', desc: 'Moment lực đối với một trục quay (N·m).' },
          { label: 'Động năng Wđ', code: 'W_{\\text{đ}}', desc: 'Năng lượng vật có được do chuyển động (J).' },
          { label: 'Thế năng Wt', code: 'W_{\\text{t}}', desc: 'Thế năng trọng trường hoặc thế năng đàn hồi (J).' },
          { label: 'Công suất P', code: '\\mathcal{P}', desc: 'Công thực hiện trong một đơn vị thời gian (W).' },
          { label: 'Hiệu suất H%', code: 'H\\%', desc: 'Tỉ số giữa năng lượng có ích và năng lượng toàn phần.' },
          { label: 'Hệ số ma sát', code: '\\mu', desc: 'Hệ số ma sát trượt hoặc ma sát nghỉ.' },
          { label: 'Độ cứng lò xo', code: 'k', desc: 'Độ cứng của lò xo (N/m).' },
          { label: 'Gia tốc trọng trường', code: 'g', desc: 'Gia tốc rơi tự do (g ≈ 9,8 m/s²).' },
          { label: 'Tần số góc', code: '\\omega', desc: 'Tần số góc dao động hoặc chuyển động tròn (rad/s).' },
          { label: 'Chu kì & Tần số', code: 'T,\\; f', desc: 'Chu kì T (s) và tần số f (Hz).' },
          { label: 'Bước sóng', code: '\\lambda', desc: 'Bước sóng cơ hoặc sóng điện từ (m).' },
          { label: 'Pha ban đầu', code: '\\varphi', desc: 'Pha ban đầu của dao động (rad).' },
          { label: 'Độ biến thiên nội năng', code: '\\Delta U', desc: 'Độ biến thiên nội năng trong nhiệt động lực học (J).' },
          { label: 'Nhiệt lượng Q', code: 'Q', desc: 'Nhiệt lượng vật thu vào hoặc tỏa ra (J).' },
          { label: 'Nhiệt dung riêng', code: 'c', desc: 'Nhiệt dung riêng của chất (J/(kg·K)).' },
          { label: 'Nhiệt nóng chảy riêng', code: '\\lambda_{\\text{nc}}', desc: 'Nhiệt nóng chảy riêng ở nhiệt độ nóng chảy (J/kg).' },
          { label: 'Nhiệt hóa hơi riêng', code: 'L', desc: 'Nhiệt hóa hơi riêng của chất lỏng (J/kg).' },
          { label: 'Áp suất & Thể tích khí', code: 'p,\\; V,\\; T', desc: 'Ba thông số trạng thái của một lượng khí.' },
          { label: 'Hằng số Boltzmann', code: 'k_B', desc: 'Hằng số Boltzmann k ≈ 1,38·10⁻²³ J/K.' }
        ]
      },
      {
        title: 'Đại lượng Điện học, Từ học & Quang học',
        items: [
          { label: 'Điện tích điểm', code: 'q,\\; Q', desc: 'Điện tích thử q và điện tích nguồn Q (C).' },
          { label: 'Cường độ điện trường', code: '\\vec{E}', desc: 'Vectơ cường độ điện trường (V/m).' },
          { label: 'Hiệu điện thế', code: 'U_{MN}', desc: 'Hiệu điện thế giữa hai điểm M và N (V).' },
          { label: 'Điện dung tụ điện', code: 'C', desc: 'Điện dung của tụ điện (F, μF, nF, pF).' },
          { label: 'Hằng số điện môi', code: '\\varepsilon', desc: 'Hằng số điện môi của môi trường (ε ≥ 1).' },
          { label: 'Cường độ dòng điện', code: 'I,\\; i(t)', desc: 'Cường độ dòng điện không đổi I và tức thời i (A).' },
          { label: 'Điện trở & Điện trở suất', code: 'R,\\; \\rho', desc: 'Điện trở R (Ω) và điện trở suất ρ (Ω·m).' },
          { label: 'Suất điện động nguồn', code: '\\mathcal{E},\\; r', desc: 'Suất điện động E (V) và điện trở trong r (Ω).' },
          { label: 'Vectơ cảm ứng từ', code: '\\vec{B}', desc: 'Vectơ cảm ứng từ đặc trưng cho từ trường (T).' },
          { label: 'Từ thông', code: '\\Phi', desc: 'Từ thông gửi qua diện tích S (Wb).' },
          { label: 'Độ tự cảm cuộn dây', code: 'L', desc: 'Hệ số tự cảm của ống dây (H).' },
          { label: 'Suất điện động cảm ứng', code: 'e_c', desc: 'Suất điện động cảm ứng Faraday (V).' },
          { label: 'Cảm kháng & Dung kháng', code: 'Z_L,\\; Z_C', desc: 'Cảm kháng cuộn dây và dung kháng tụ điện (Ω).' },
          { label: 'Tổng trở mạch RLC', code: 'Z', desc: 'Tổng trở đoạn mạch xoay chiều (Ω).' },
          { label: 'Hệ số công suất', code: '\\cos\\varphi', desc: 'Hệ số công suất của mạch điện xoay chiều.' },
          { label: 'Chiết suất môi trường', code: 'n', desc: 'Chiết suất tuyệt đối hoặc tỉ đối của môi trường.' },
          { label: 'Khoảng vân giao thoa', code: 'i', desc: 'Khoảng cách giữa hai vân sáng/tối liên tiếp (mm).' },
          { label: 'Độ tụ thấu kính', code: 'D = \\frac{1}{f}', desc: 'Độ tụ của thấu kính mỏng (dp).' }
        ]
      },
      {
        title: 'Đại lượng Lượng tử, Hạt nhân & Vi mô',
        items: [
          { label: 'Hằng số Planck', code: 'h', desc: 'Hằng số Planck h = 6,625·10⁻³⁴ J·s.' },
          { label: 'Tốc độ ánh sáng', code: 'c', desc: 'Tốc độ ánh sáng trong chân không c = 3·10⁸ m/s.' },
          { label: 'Năng lượng photon', code: '\\varepsilon = hf', desc: 'Năng lượng một lượng tử ánh sáng (J hoặc eV).' },
          { label: 'Giới hạn quang điện', code: '\\lambda_0', desc: 'Bước sóng giới hạn gây ra hiện tượng quang điện.' },
          { label: 'Công thoát electron', code: 'A_{\\text{th}}', desc: 'Công thoát của electron khỏi kim loại.' },
          { label: 'Ký hiệu hạt nhân', code: '^{A}_{Z}\\text{X}', desc: 'Hạt nhân X có Z proton và A = Z + N nucleon.' },
          { label: 'Hạt Alpha (Heli)', code: '^{4}_{2}\\text{He}\\; (\\alpha)', desc: 'Hạt phóng xạ Alpha (hạt nhân nguyên tử Heli).' },
          { label: 'Hạt Beta trừ (e⁻)', code: '^{0}_{-1}e\\; (\\beta^-)', desc: 'Hạt phóng xạ Beta trừ (electron).' },
          { label: 'Hạt Beta cộng (e⁺)', code: '^{0}_{+1}e\\; (\\beta^+)', desc: 'Hạt phóng xạ Beta cộng (positron).' },
          { label: 'Hạt Proton & Neutron', code: '^{1}_{1}p,\\; ^{1}_{0}n', desc: 'Hai nucleon cấu tạo nên hạt nhân nguyên tử.' },
          { label: 'Độ hụt khối Δm', code: '\\Delta m', desc: 'Độ hụt khối của hạt nhân (u).' },
          { label: 'Năng lượng liên kết', code: 'W_{\\text{lk}}', desc: 'Năng lượng liên kết hạt nhân (MeV).' },
          { label: 'Năng lượng liên kết riêng', code: 'W_{\\text{lkr}} = \\frac{W_{\\text{lk}}}{A}', desc: 'Đặc trưng cho mức độ bền vững của hạt nhân (MeV/nucleon).' },
          { label: 'Hằng số phóng xạ', code: '\\lambda = \\frac{\\ln 2}{T}', desc: 'Hằng số phân rã phóng xạ (s⁻¹).' },
          { label: 'Độ phóng xạ H(t)', code: 'H(t)', desc: 'Số phân rã trong một giây (Bq hoặc Ci).' }
        ]
      },
      {
        title: 'Đơn vị SI & Tiền tố Đo lường',
        items: [
          { label: 'Ohm (Điện trở)', code: '\\Omega', desc: 'Đơn vị điện trở, cảm kháng, dung kháng, tổng trở.' },
          { label: 'Micro (10⁻⁶)', code: '\\mu\\text{F},\\; \\mu\\text{m}', desc: 'Tiền tố micro = 10⁻⁶.' },
          { label: 'Nano (10⁻⁹)', code: '\\text{nm},\\; \\text{nC}', desc: 'Tiền tố nano = 10⁻⁹.' },
          { label: 'Pico (10⁻¹²)', code: '\\text{pF}', desc: 'Tiền tố pico = 10⁻¹².' },
          { label: 'Angstrom (10⁻¹⁰ m)', code: '\\text{\\AA}', desc: '1 Å = 10⁻¹⁰ m = 0,1 nm.' },
          { label: 'Độ Celsius & Kelvin', code: '^{\\circ}\\text{C},\\; \\text{K}', desc: 'T(K) = t(°C) + 273,15.' },
          { label: 'Hertz (Tần số)', code: '\\text{Hz}', desc: 'Đơn vị tần số (1 Hz = 1 s⁻¹).' },
          { label: 'Decibel (Mức âm)', code: '\\text{dB}', desc: 'Đơn vị đo mức cường độ âm (1 B = 10 dB).' },
          { label: 'Newton & Joule & Watt', code: '\\text{N},\\; \\text{J},\\; \\text{W}', desc: 'Đơn vị lực (N), công/năng lượng (J) và công suất (W).' },
          { label: 'Pascal & Atm & Bar', code: '\\text{Pa},\\; \\text{atm},\\; \\text{bar}', desc: '1 atm ≈ 1,013·10⁵ Pa; 1 bar = 10⁵ Pa.' },
          { label: 'Tesla & Weber & Henry', code: '\\text{T},\\; \\text{Wb},\\; \\text{H}', desc: 'Đơn vị cảm ứng từ (T), từ thông (Wb) và độ tự cảm (H).' },
          { label: 'Electron-Volt & MeV', code: '\\text{eV},\\; \\text{MeV}', desc: '1 eV = 1,6·10⁻¹⁹ J; 1 MeV = 1,6·10⁻¹³ J.' },
          { label: 'Đơn vị khối lượng nguyên tử', code: '1\\text{ u} \\approx 931{,}5\\text{ MeV}/c^2', desc: 'Hệ thức quy đổi khối lượng hạt nhân sang năng lượng.' },
          { label: 'Becquerel & Curie', code: '\\text{Bq},\\; \\text{Ci}', desc: 'Đơn vị độ phóng xạ (1 Ci = 3,7·10¹⁰ Bq).' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Động học Chất điểm & Chuyển động Ném (Lớp 10)',
        items: [
          { label: 'Tốc độ trung bình & Vận tốc trung bình', code: 'v_{\\text{tb}} = \\frac{s}{t}, \\quad \\vec{v}_{\\text{tb}} = \\frac{\\Delta \\vec{d}}{\\Delta t}', desc: 'Phân biệt tốc độ trung bình (quãng đường/thời gian) và vận tốc trung bình (độ dịch chuyển/thời gian).' },
          { label: 'Công thức Cộng vận tốc', code: '\\vec{v}_{13} = \\vec{v}_{12} + \\vec{v}_{23}', desc: 'Vận tốc tuyệt đối bằng tổng vectơ vận tốc tương đối và vận tốc kéo theo.' },
          { label: 'Vận tốc, Quãng đường & Phương trình biến đổi đều', code: 'v = v_0 + at, \\quad s = v_0 t + \\frac{1}{2}at^2, \\quad x = x_0 + v_0 t + \\frac{1}{2}at^2', desc: 'Ba phương trình cơ bản của chuyển động thẳng biến đổi đều.' },
          { label: 'Hệ thức độc lập với thời gian', code: 'v^2 - v_0^2 = 2 a d', desc: 'Liên hệ giữa vận tốc đầu, vận tốc cuối, gia tốc và độ dịch chuyển.' },
          { label: 'Sự rơi tự do', code: 'v = g t, \\quad h = \\frac{1}{2} g t^2, \\quad v = \\sqrt{2gh}', desc: 'Chuyển động rơi tự do không vận tốc đầu dưới tác dụng của trọng lực.' },
          { label: 'Chuyển động Ném ngang từ độ cao h', code: 'x = v_0 t, \\quad y = \\frac{1}{2}gt^2, \\quad L = v_0\\sqrt{\\frac{2h}{g}}, \\quad v = \\sqrt{v_0^2 + (gt)^2}', desc: 'Phương trình tọa độ, tầm bay xa L và vận tốc chạm đất của vật ném ngang.' },
          { label: 'Chuyển động Ném xiên góc α', code: 'H = \\frac{v_0^2 \\sin^2\\alpha}{2g}, \\quad L = \\frac{v_0^2 \\sin 2\\alpha}{g}', desc: 'Độ cao cực đại H và tầm bay xa L của vật ném xiên.' },
          { label: 'Sai số tuyệt đối & Sai số tỉ đối phép đo', code: 'A = \\bar{A} \\pm \\Delta A, \\quad \\Delta A = \\overline{\\Delta A} + \\Delta A_{\\text{dc}}, \\quad \\delta A = \\frac{\\Delta A}{\\bar{A}}\\times 100\\%', desc: 'Xử lý sai số trong thực hành thí nghiệm Vật lí.' }
        ]
      },
      {
        title: 'Động lực học, Các Lực Cơ học & Cân bằng Rắn (Lớp 10)',
        items: [
          { label: 'Định luật II & III Newton', code: '\\vec{F}_{\\text{hl}} = m\\vec{a} \\Rightarrow \\vec{a} = \\frac{\\vec{F}_{\\text{hl}}}{m}, \\quad \\vec{F}_{AB} = -\\vec{F}_{BA}', desc: 'Định luật cơ bản của động lực học và cặp lực – phản lực.' },
          { label: 'Định luật Vạn vật hấp dẫn & Trọng lực', code: 'F_{\\text{hd}} = G\\frac{m_1 m_2}{r^2}, \\quad P = mg, \\quad g = \\frac{GM}{(R+h)^2}', desc: 'Lực hấp dẫn và gia tốc trọng trường ở độ cao h.' },
          { label: 'Định luật Hooke (Lực đàn hồi lò xo)', code: 'F_{\\text{đh}} = k|\\Delta l| = k|l - l_0|', desc: 'Trong giới hạn đàn hồi, độ lớn lực đàn hồi tỉ lệ thuận với độ biến dạng.' },
          { label: 'Lực ma sát trượt & Chuyển động mặt phẳng nghiêng', code: 'F_{\\text{mst}} = \\mu_t N, \\quad a = g(\\sin\\alpha - \\mu_t\\cos\\alpha)', desc: 'Lực ma sát trượt và gia tốc vật trượt xuống mặt phẳng nghiêng góc α.' },
          { label: 'Lực đẩy Archimedes & Khối lượng riêng – Áp suất', code: 'F_A = \\rho_{\\text{lỏng}} g V_{\\text{chìm}}, \\quad p = p_0 + \\rho g h', desc: 'Lực đẩy Archimedes và áp suất thủy tĩnh ở độ sâu h.' },
          { label: 'Moment lực & Điều kiện cân bằng vật rắn', code: '\\sum \\vec{F} = \\vec{0}, \\quad \\sum M = 0 \\quad (M = F \\cdot d)', desc: 'Hai điều kiện cân bằng tổng quát của vật rắn có trục quay.' }
        ]
      },
      {
        title: 'Công, Năng lượng, Động lượng & Chuyển động Tròn (Lớp 10)',
        items: [
          { label: 'Công cơ học, Công suất & Hiệu suất', code: 'A = F s \\cos\\alpha, \\quad \\mathcal{P} = \\frac{A}{t} = F v \\cos\\alpha, \\quad H = \\frac{A_{\\text{ích}}}{A_{\\text{tp}}}\\times 100\\%', desc: 'Công của lực không đổi, công suất tức thời và hiệu suất.' },
          { label: 'Động năng & Định lí Biến thiên Động năng', code: 'W_{\\text{đ}} = \\frac{1}{2}mv^2, \\quad \\Delta W_{\\text{đ}} = \\frac{1}{2}mv_2^2 - \\frac{1}{2}mv_1^2 = A_{\\text{ngoại lực}}', desc: 'Độ biến thiên động năng bằng tổng công của các ngoại lực tác dụng lên vật.' },
          { label: 'Thế năng Trọng trường, Đàn hồi & Bảo toàn Cơ năng', code: 'W_{\\text{t}} = mgh, \\quad W_{\\text{t đh}} = \\frac{1}{2}k(\\Delta l)^2, \\quad W = W_{\\text{đ}} + W_{\\text{t}} = \\text{const}', desc: 'Biểu thức thế năng và định luật bảo toàn cơ năng khi không có ma sát.' },
          { label: 'Động lượng, Xung lượng & Bảo toàn Động lượng', code: '\\vec{p} = m\\vec{v}, \\quad \\Delta\\vec{p} = \\vec{F}\\cdot\\Delta t, \\quad m_1\\vec{v}_1 + m_2\\vec{v}_2 = m_1\\vec{v}_1\\prime + m_2\\vec{v}_2\\prime', desc: 'Xung lượng của lực và định luật bảo toàn động lượng cho hệ cô lập.' },
          { label: 'Va chạm mềm & Va chạm đàn hồi trực diện', code: 'v_{\\text{mềm}} = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}, \\quad v_1\\prime = \\frac{(m_1-m_2)v_1 + 2m_2 v_2}{m_1+m_2}', desc: 'Vận tốc sau va chạm mềm và va chạm hoàn toàn đàn hồi.' },
          { label: 'Chuyển động tròn đều & Lực hướng tâm', code: '\\omega = \\frac{\\Delta\\varphi}{\\Delta t} = \\frac{2\\pi}{T} = 2\\pi f, \\quad v = \\omega r, \\quad F_{\\text{ht}} = m a_{\\text{ht}} = m\\frac{v^2}{r} = m\\omega^2 r', desc: 'Tốc độ góc, tốc độ dài, gia tốc hướng tâm và lực hướng tâm.' }
        ]
      },
      {
        title: 'Dao động Điều hòa, Con lắc Lò xo & Con lắc Đơn (Lớp 11)',
        items: [
          { label: 'Phương trình Li độ, Vận tốc & Gia tốc dao động', code: 'x = A\\cos(\\omega t + \\varphi), \\quad v = x\\prime = -\\omega A\\sin(\\omega t + \\varphi), \\quad a = -\\omega^2 x', desc: 'Ba phương trình tức thời của dao động điều hòa.' },
          { label: 'Hệ thức độc lập thời gian trong dao động', code: 'A^2 = x^2 + \\frac{v^2}{\\omega^2}, \\quad \\left(\\frac{x}{A}\\right)^2 + \\left(\\frac{v}{v_{\\max}}\\right)^2 = 1, \\quad \\left(\\frac{a}{a_{\\max}}\\right)^2 + \\left(\\frac{v}{v_{\\max}}\\right)^2 = 1', desc: 'Các hệ thức elip độc lập thời gian giữa x, v, a.' },
          { label: 'Chu kì, Tần số & Năng lượng Con lắc lò xo', code: 'T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{\\Delta l_0}{g}}, \\quad W = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2', desc: 'Chu kì và cơ năng của con lắc lò xo (tỉ lệ với bình phương biên độ).' },
          { label: 'Lực đàn hồi Cực đại & Cực tiểu con lắc lò xo đứng', code: 'F_{\\text{đh max}} = k(\\Delta l_0 + A), \\quad F_{\\text{đh min}} = \\begin{cases} k(\\Delta l_0 - A) & (\\Delta l_0 > A) \\\\ 0 & (\\Delta l_0 \\le A) \\end{cases}', desc: 'Lực đàn hồi lớn nhất và nhỏ nhất của con lắc lò xo treo thẳng đứng.' },
          { label: 'Chu kì, Vận tốc & Lực căng dây Con lắc đơn', code: 'T = 2\\pi\\sqrt{\\frac{l}{g}}, \\quad v = \\sqrt{2gl(\\cos\\alpha - \\cos\\alpha_0)}, \\quad \\tau = mg(3\\cos\\alpha - 2\\cos\\alpha_0)', desc: 'Chu kì dao động nhỏ, tốc độ và lực căng dây của con lắc đơn tại li độ góc α.' },
          { label: 'Tổng hợp hai dao động điều hòa cùng tần số', code: 'A^2 = A_1^2 + A_2^2 + 2A_1 A_2\\cos(\\varphi_2 - \\varphi_1), \\quad \\tan\\varphi = \\frac{A_1\\sin\\varphi_1 + A_2\\sin\\varphi_2}{A_1\\cos\\varphi_1 + A_2\\cos\\varphi_2}', desc: 'Biên độ và pha ban đầu của dao động tổng hợp.' }
        ]
      },
      {
        title: 'Sóng Cơ, Giao thoa Sóng, Sóng Dừng & Âm học (Lớp 11)',
        items: [
          { label: 'Bước sóng, Phương trình sóng & Độ lệch pha', code: '\\lambda = v T = \\frac{v}{f}, \\quad u_M = A\\cos\\left(\\omega t - \\frac{2\\pi x}{\\lambda}\\right), \\quad \\Delta\\varphi = \\frac{2\\pi d}{\\lambda}', desc: 'Bước sóng, phương trình truyền sóng và độ lệch pha giữa hai điểm.' },
          { label: 'Giao thoa sóng cơ (2 nguồn cùng pha)', code: 'd_2 - d_1 = k\\lambda \\text{ (Cực đại)}, \\quad d_2 - d_1 = \\left(k + \\frac{1}{2}\\right)\\lambda \\text{ (Cực tiểu)}', desc: 'Điều kiện biên độ cực đại và cực tiểu trong giao thoa hai nguồn đồng bộ.' },
          { label: 'Điều kiện Sóng dừng trên sợi dây', code: 'l = k\\frac{\\lambda}{2} \\text{ (2 đầu cố định)}, \\quad l = (2k + 1)\\frac{\\lambda}{4} \\text{ (1 cố định, 1 tự do)}', desc: 'Chiều dài sợi dây để có sóng dừng với k bó sóng.' },
          { label: 'Cường độ âm & Mức cường độ âm (dB)', code: 'I = \\frac{\\mathcal{P}}{4\\pi r^2}, \\quad L(\\text{dB}) = 10\\log\\left(\\frac{I}{I_0}\\right), \\quad L_2 - L_1 = 10\\log\\left(\\frac{I_2}{I_1}\\right) = 20\\log\\left(\\frac{r_1}{r_2}\\right)', desc: 'Cường độ âm và mức cường độ âm theo thang Decibel (I₀ = 10⁻¹² W/m²).' }
        ]
      },
      {
        title: 'Sóng Điện từ, Giao thoa Ánh sáng & Quang hình (Lớp 11 – 12)',
        items: [
          { label: 'Bước sóng điện từ trong chân không', code: '\\lambda = c \\cdot T = \\frac{c}{f} \\quad (c = 3\\cdot 10^8\\text{ m/s})', desc: 'Liên hệ giữa bước sóng, tần số và tốc độ ánh sáng của sóng điện từ.' },
          { label: 'Khoảng vân & Vị trí vân giao thoa khe Young', code: 'i = \\frac{\\lambda D}{a}, \\quad x_s = k i, \\quad x_t = \\left(k + \\frac{1}{2}\\right)i', desc: 'Khoảng vân, tọa độ vân sáng bậc k và vân tối thứ k+1.' },
          { label: 'Số vân sáng & Vân tối trên trường giao thoa L', code: 'N_s = 2\\left\\lfloor \\frac{L}{2i} \\right\\rfloor + 1, \\quad N_t = 2\\left\\lfloor \\frac{L}{2i} + 0{,}5 \\right\\rfloor', desc: 'Công thức tính nhanh tổng số vân sáng và vân tối đối xứng qua vân trung tâm.' },
          { label: 'Định luật Khúc xạ & Phản xạ toàn phần', code: 'n_1 \\sin i = n_2 \\sin r, \\quad \\sin i_{\\text{gh}} = \\frac{n_2}{n_1}\\ (n_1 > n_2)', desc: 'Định luật Snell và góc giới hạn phản xạ toàn phần.' },
          { label: 'Công thức Thấu kính mỏng & Độ phóng đại', code: 'D = \\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\\prime}, \\quad k = -\\frac{d\\prime}{d} = \\frac{f}{f - d}', desc: 'Công thức vị trí vật – ảnh và số phóng đại ảnh qua thấu kính.' }
        ]
      },
      {
        title: 'Điện trường, Điện thế, Tụ điện & Dòng điện Không đổi (Lớp 11)',
        items: [
          { label: 'Định luật Coulomb & Cường độ Điện trường', code: 'F = k\\frac{|q_1 q_2|}{\\varepsilon r^2}, \\quad E = \\frac{F}{|q|} = k\\frac{|Q|}{\\varepsilon r^2} \\quad (k = 9\\cdot 10^9)', desc: 'Lực tương tác tĩnh điện và cường độ điện trường của điện tích điểm.' },
          { label: 'Công của lực điện & Hiệu điện thế đều', code: 'A_{MN} = q E d = q(V_M - V_N) = q U_{MN}, \\quad E = \\frac{U}{d}', desc: 'Công của lực điện trường đều không phụ thuộc hình dạng đường đi.' },
          { label: 'Điện dung, Ghép tụ điện & Năng lượng tụ điện', code: 'C = \\frac{Q}{U} = \\frac{\\varepsilon S}{4\\pi k d}, \\quad C_{\\text{//}} = C_1 + C_2, \\quad \\frac{1}{C_{\\text{nt}}} = \\frac{1}{C_1} + \\frac{1}{C_2}, \\quad W = \\frac{1}{2}CU^2 = \\frac{Q^2}{2C}', desc: 'Điện dung tụ phẳng, ghép tụ và năng lượng điện trường trong tụ.' },
          { label: 'Cường độ dòng điện & Điện trở dây dẫn', code: 'I = \\frac{\\Delta q}{\\Delta t}, \\quad R = \\rho\\frac{l}{S}, \\quad R_t = R_0[1 + \\alpha(t - t_0)]', desc: 'Cường độ dòng điện và sự phụ thuộc điện trở vào kích thước, nhiệt độ.' },
          { label: 'Định luật Ohm toàn mạch & Hiệu suất nguồn điện', code: 'I = \\frac{\\mathcal{E}}{R_N + r}, \\quad U_N = \\mathcal{E} - I r = I R_N, \\quad H = \\frac{U_N}{\\mathcal{E}} = \\frac{R_N}{R_N + r}', desc: 'Định luật Ohm cho toàn mạch kín và hiệu suất của nguồn điện.' },
          { label: 'Điện năng, Công suất điện & Định luật Joule – Lenz', code: 'A = UIt, \\quad \\mathcal{P} = UI = I^2 R = \\frac{U^2}{R}, \\quad Q = R I^2 t, \\quad \\mathcal{P}_{\\text{nguồn}} = \\mathcal{E} I', desc: 'Điện năng tiêu thụ, nhiệt lượng tỏa ra trên điện trở và công suất nguồn.' }
        ]
      },
      {
        title: 'Vật lí Nhiệt & Động học Phân tử Chất khí (Lớp 12 GDPT 2018)',
        items: [
          { label: 'Chuyển đổi Thang nhiệt độ Kelvin – Celsius – Fahrenheit', code: 'T(\\text{K}) = t(^{\\circ}\\text{C}) + 273{,}15, \\quad t(^{\\circ}\\text{F}) = 1{,}8\\cdot t(^{\\circ}\\text{C}) + 32', desc: 'Công thức quy đổi giữa ba thang nhiệt độ chuẩn.' },
          { label: 'Định luật I Nhiệt động lực học', code: '\\Delta U = A + Q \\quad (Q > 0:\\text{ nhận nhiệt};\\; A > 0:\\text{ nhận công})', desc: 'Độ biến thiên nội năng của vật bằng tổng công và nhiệt lượng vật nhận được.' },
          { label: 'Nhiệt lượng & Phương trình Cân bằng nhiệt', code: 'Q = m c \\Delta T = m c(t_2 - t_1), \\quad Q_{\\text{tỏa}} = Q_{\\text{thu}}', desc: 'Nhiệt lượng làm thay đổi nhiệt độ và phương trình cân bằng nhiệt.' },
          { label: 'Nhiệt nóng chảy riêng & Nhiệt hóa hơi riêng', code: 'Q_{\\text{nc}} = \\lambda m, \\quad Q_{\\text{hh}} = L m', desc: 'Nhiệt lượng cần thiết trong quá trình nóng chảy và hóa hơi ở nhiệt độ không đổi.' },
          { label: 'Định luật Boyle (Đẳng nhiệt) & Charles (Đẳng áp)', code: 'p_1 V_1 = p_2 V_2 \\ (T = \\text{const}), \\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\ (p = \\text{const}), \\quad \\frac{p_1}{T_1} = \\frac{p_2}{T_2} \\ (V = \\text{const})', desc: 'Ba đẳng quá trình cơ bản của một khối khí xác định.' },
          { label: 'Phương trình Trạng thái & Clapeyron – Mendeleev', code: '\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}, \\quad p V = n R T = \\frac{m}{M} R T \\quad (R = 8{,}31\\text{ J/(mol}\\cdot\\text{K)})', desc: 'Phương trình trạng thái khí lí tưởng (đơn vị SI: p (Pa), V (m³), T (K)).' },
          { label: 'Áp suất khí theo Mô hình động học phân tử & Động năng TB', code: 'p = \\frac{1}{3}\\mu m_0 \\overline{v^2} = \\frac{2}{3}\\mu \\overline{E_{\\text{đ}}}, \\quad \\overline{E_{\\text{đ}}} = \\frac{1}{2}m_0 \\overline{v^2} = \\frac{3}{2} k_B T', desc: 'Liên hệ giữa áp suất vi mô, mật độ phân tử μ = N/V và động năng tịnh tiến trung bình.' }
        ]
      },
      {
        title: 'Từ trường, Lực từ & Cảm ứng Điện từ (Lớp 12 GDPT 2018)',
        items: [
          { label: 'Lực từ tác dụng lên đoạn dây dẫn mang dòng điện', code: 'F = B I l \\sin\\alpha \\Rightarrow B = \\frac{F}{I l \\sin\\alpha}', desc: 'Độ lớn lực từ Ampere với α là góc giữa vectơ B và đoạn dây dẫn l.' },
          { label: 'Cảm ứng từ của Dây thẳng dài, Vòng tròn & Ống dây', code: 'B_{\\text{thẳng}} = 2\\cdot 10^{-7}\\frac{I}{r}, \\quad B_{\\text{vòng}} = 2\\pi\\cdot 10^{-7}\\frac{N I}{R}, \\quad B_{\\text{ống}} = 4\\pi\\cdot 10^{-7}\\frac{N}{l}I', desc: 'Cảm ứng từ của các dòng điện có dạng hình học đặc biệt trong không khí.' },
          { label: 'Lực Lorentz & Bán kính quỹ đạo hạt điện tích trong từ trường', code: 'f = |q| v B \\sin\\alpha, \\quad R = \\frac{m v}{|q| B}\\ (\\vec{v} \\perp \\vec{B})', desc: 'Lực từ tác dụng lên hạt mang điện chuyển động và bán kính quỹ đạo tròn.' },
          { label: 'Từ thông & Định luật Cảm ứng điện từ Faraday', code: '\\Phi = N B S \\cos\\alpha, \\quad e_c = -\\frac{\\Delta \\Phi}{\\Delta t}, \\quad |e_c| = B l v \\sin\\alpha', desc: 'Từ thông, suất điện động cảm ứng trong khung dây và trong đoạn dây chuyển động.' },
          { label: 'Từ thông riêng, Suất điện động tự cảm & Năng lượng từ trường', code: '\\Phi_{\\text{tc}} = L i, \\quad e_{\\text{tc}} = -L\\frac{\\Delta i}{\\Delta t}, \\quad W_{\\text{từ}} = \\frac{1}{2} L i^2', desc: 'Hiện tượng tự cảm và năng lượng từ trường trong cuộn cảm.' }
        ]
      },
      {
        title: 'Dòng điện Xoay chiều, Mạch RLC, Máy biến áp & Truyền tải (Lớp 12)',
        items: [
          { label: 'Từ thông & Suất điện động xoay chiều máy phát', code: '\\Phi = \\Phi_0\\cos(\\omega t + \\varphi), \\quad e = E_0\\cos\\left(\\omega t + \\varphi - \\frac{\\pi}{2}\\right), \\quad E_0 = N B S \\omega', desc: 'Nguyên tắc tạo ra dòng điện xoay chiều dựa trên hiện tượng cảm ứng điện từ.' },
          { label: 'Giá trị Hiệu dụng của Dòng điện & Điện áp xoay chiều', code: 'I = \\frac{I_0}{\\sqrt{2}}, \\quad U = \\frac{U_0}{\\sqrt{2}}, \\quad E = \\frac{E_0}{\\sqrt{2}}', desc: 'Giá trị hiệu dụng bằng giá trị cực đại chia căn bậc hai của 2.' },
          { label: 'Cảm kháng, Dung kháng & Tổng trở mạch RLC nối tiếp', code: 'Z_L = \\omega L, \\quad Z_C = \\frac{1}{\\omega C}, \\quad Z = \\sqrt{R^2 + (Z_L - Z_C)^2}, \\quad I = \\frac{U}{Z}', desc: 'Định luật Ohm cho đoạn mạch R, L, C mắc nối tiếp.' },
          { label: 'Độ lệch pha u so với i & Cộng hưởng điện', code: '\\tan\\varphi = \\frac{Z_L - Z_C}{R} = \\frac{U_L - U_C}{U_R}, \\quad \\text{Cộng hưởng: } Z_L = Z_C \\Leftrightarrow \\omega = \\frac{1}{\\sqrt{LC}}', desc: 'Công thức độ lệch pha và điều kiện cộng hưởng điện (Z_min = R, I_max = U/R, cos φ = 1).' },
          { label: 'Công suất tiêu thụ & Hệ số công suất mạch xoay chiều', code: 'P = U I \\cos\\varphi = I^2 R, \\quad \\cos\\varphi = \\frac{R}{Z} = \\frac{U_R}{U}', desc: 'Công suất điện tiêu thụ trung bình và hệ số công suất của mạch RLC.' },
          { label: 'Máy biến áp & Công suất hao phí truyền tải điện năng', code: '\\frac{U_2}{U_1} = \\frac{N_2}{N_1} = \\frac{I_1}{I_2}, \\quad \\Delta P = \\frac{P^2 R}{U^2 \\cos^2\\varphi}, \\quad H = 1 - \\frac{\\Delta P}{P}', desc: 'Công thức máy biến áp lí tưởng và hao phí nhiệt trên đường dây truyền tải.' }
        ]
      },
      {
        title: 'Lượng tử Ánh sáng & Vật lí Hạt nhân (Lớp 12 GDPT 2018)',
        items: [
          { label: 'Năng lượng Photon, Công thoát & Phương trình Quang điện Einstein', code: '\\varepsilon = h f = \\frac{h c}{\\lambda}, \\quad \\lambda_0 = \\frac{h c}{A}, \\quad h f = A + \\frac{1}{2}m v_{0\\max}^2 = A + |e|U_h', desc: 'Lượng tử năng lượng, giới hạn quang điện và công thức Einstein.' },
          { label: 'Tiên đề Bohr về Bức xạ và Bán kính quỹ đạo dừng Hiđro', code: 'r_n = n^2 r_0 \\ (r_0 = 5{,}3\\cdot 10^{-11}\\text{ m}), \\quad \\varepsilon = h f_{mn} = \\frac{h c}{\\lambda_{mn}} = E_n - E_m', desc: 'Bán kính quỹ đạo dừng thứ n và năng lượng photon phát xạ/hấp thụ.' },
          { label: 'Hệ thức Einstein & Bán kính Hạt nhân', code: 'E = m c^2, \\quad m = \\frac{m_0}{\\sqrt{1 - v^2/c^2}}, \\quad R = 1{,}2\\cdot 10^{-15} \\cdot A^{\\frac{1}{3}}\\text{ (m)}', desc: 'Hệ thức năng lượng – khối lượng tương đối tính và bán kính hạt nhân.' },
          { label: 'Độ hụt khối, Năng lượng liên kết & Năng lượng liên kết riêng', code: '\\Delta m = Z m_p + (A - Z) m_n - m_X, \\quad W_{\\text{lk}} = \\Delta m \\cdot c^2, \\quad W_{\\text{lkr}} = \\frac{W_{\\text{lk}}}{A}', desc: 'Độ hụt khối và năng lượng liên kết đặc trưng cho độ bền hạt nhân.' },
          { label: 'Định luật Bảo toàn & Năng lượng Phản ứng hạt nhân', code: '\\Delta E = (m_{\\text{trước}} - m_{\\text{sau}})c^2 = (\\Delta m_{\\text{sau}} - \\Delta m_{\\text{trước}})c^2 = W_{\\text{đ sau}} - W_{\\text{đ trước}}', desc: 'ΔE > 0: phản ứng tỏa năng lượng; ΔE < 0: phản ứng thu năng lượng.' },
          { label: 'Định luật Phóng xạ: Số hạt còn lại & Khối lượng còn lại', code: 'N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\quad m(t) = m_0 \\cdot 2^{-\\frac{t}{T}}, \\quad \\lambda = \\frac{\\ln 2}{T}', desc: 'Số hạt nhân và khối lượng chất phóng xạ còn lại sau thời gian t.' },
          { label: 'Số hạt bị phân rã, Tỉ số hạt con/mẹ & Độ phóng xạ H', code: '\\Delta N = N_0\\left(1 - 2^{-\\frac{t}{T}}\\right), \\quad \\frac{N_{\\text{con}}}{N_{\\text{mẹ}}} = 2^{\\frac{t}{T}} - 1, \\quad H(t) = \\lambda N(t) = H_0 \\cdot 2^{-\\frac{t}{T}}', desc: 'Số hạt đã phân rã (= số hạt nhân con tạo thành) và độ phóng xạ H(t).' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 4. SINH HỌC (LỚP 10, 11, 12 — ĐẦY ĐỦ TẾ BÀO, PHÂN TỬ, DI TRUYỀN, QUẦN THỂ & SINH THÁI)
   * ========================================================================== */
  biology: {
    id: 'biology',
    name: 'Sinh học',
    shortName: 'Sinh',
    icon: Dna,
    symbolGroups: [
      {
        title: 'Ký hiệu Phép lai, Phả hệ & Giới tính',
        items: [
          { label: 'Thế hệ bố mẹ P', code: '\\text{P}', desc: 'Thế hệ xuất phát (Parent) trong phép lai.' },
          { label: 'Giao tử G', code: '\\text{G}_P,\\; \\text{G}_{F_1}', desc: 'Giao tử sinh ra từ thế hệ bố mẹ P hoặc F₁.' },
          { label: 'Thế hệ con F₁, F₂', code: '\\text{F}_1,\\; \\text{F}_2,\\; \\text{F}_n', desc: 'Thế hệ con lai thứ nhất, thứ hai, thứ n.' },
          { label: 'Phép lai (×)', code: '\\times', desc: 'Ký hiệu phép lai hữu tính giữa hai cơ thể.' },
          { label: 'Giới tính cái (♀)', code: '\\text{♀}', desc: 'Ký hiệu cá thể cái / mẹ.' },
          { label: 'Giới tính đực (♂)', code: '\\text{♂}', desc: 'Ký hiệu cá thể đực / bố.' },
          { label: 'Cặp NST giới tính', code: '\\text{XX},\\; \\text{XY},\\; \\text{XO}', desc: 'Cặp nhiễm sắc thể giới tính ở các nhóm loài.' },
          { label: 'Kiểu gen đồng hợp', code: '\\text{AA},\\; \\text{aa},\\; \\text{AABB}', desc: 'Kiểu gen đồng hợp tử trội hoặc lặn.' },
          { label: 'Kiểu gen dị hợp', code: '\\text{Aa},\\; \\text{AaBb}', desc: 'Kiểu gen dị hợp tử 1 hoặc 2 cặp gen.' },
          { label: 'Đa alen nhóm máu ABO', code: 'I^A,\\; I^B,\\; I^O', desc: 'Ba alen quy định nhóm máu hệ ABO ở người.' },
          { label: 'Gen trên NST X', code: 'X^A X^a,\\; X^a Y', desc: 'Ký hiệu gen di truyền liên kết với giới tính trên NST X.' },
          { label: 'Gen trên NST Y', code: 'X Y^a', desc: 'Gen nằm trên vùng không tương đồng của NST Y (di truyền thẳng).' }
        ]
      },
      {
        title: 'Ký hiệu Bộ NST & Đột biến Nhiễm sắc thể',
        items: [
          { label: 'Bộ NST lưỡng bội', code: '2n', desc: 'Bộ nhiễm sắc thể lưỡng bội trong tế bào sinh dưỡng.' },
          { label: 'Bộ NST đơn bội', code: 'n', desc: 'Bộ nhiễm sắc thể đơn bội trong giao tử.' },
          { label: 'Thể một nhiễm', code: '2n - 1', desc: 'Đột biến lệch bội thiếu 1 chiếc NST ở một cặp.' },
          { label: 'Thể ba nhiễm', code: '2n + 1', desc: 'Đột biến lệch bội thừa 1 chiếc NST (VD: Hội chứng Down 3 NST 21).' },
          { label: 'Thể không nhiễm', code: '2n - 2', desc: 'Đột biến lệch bội mất cả hai chiếc của một cặp NST.' },
          { label: 'Thể bốn nhiễm', code: '2n + 2', desc: 'Đột biến lệch bội có 4 chiếc ở một cặp NST.' },
          { label: 'Thể một kép & ba kép', code: '2n - 1 - 1,\\; 2n + 1 + 1', desc: 'Đột biến lệch bội xảy ra đồng thời ở hai cặp NST.' },
          { label: 'Thể tam bội & tứ bội', code: '3n,\\; 4n', desc: 'Đột biến tự đa bội lẻ (3n) và tự đa bội chẵn (4n).' },
          { label: 'Thể song nhị bội', code: '2n_A + 2n_B', desc: 'Thể dị đa bội hình thành do lai xa và đa bội hóa.' }
        ]
      },
      {
        title: 'Ký hiệu Phân tử ADN, ARN, Protein & Operon Lac',
        items: [
          { label: '4 Nucleotit của ADN', code: '\\text{A},\\; \\text{T},\\; \\text{G},\\; \\text{C}', desc: 'Adenine, Thymine, Guanine, Cytosine.' },
          { label: '4 Ribonucleotit của ARN', code: '\\text{rA},\\; \\text{rU},\\; \\text{rG},\\; \\text{rC}', desc: 'Adenine, Uracil, Guanine, Cytosine của ARN.' },
          { label: 'Nguyên tắc bổ sung ADN', code: '\\text{A} - \\text{T}\\ (2\\text{ lk H}),\\; \\text{G} \\equiv \\text{C}\\ (3\\text{ lk H})', desc: 'A liên kết T bằng 2 liên kết hiđro; G liên kết C bằng 3 liên kết hiđro.' },
          { label: 'Chiều mạch 5’ → 3’', code: '5^{\\prime}\\rightarrow 3^{\\prime}', desc: 'Chiều tổng hợp mạch mới của ADN polymerase và ARN polymerase.' },
          { label: 'Chiều mạch khuôn 3’ → 5’', code: '3^{\\prime}\\rightarrow 5^{\\prime}', desc: 'Chiều mạch gốc ADN làm khuôn phiên mã.' },
          { label: 'Bộ ba mở đầu AUG', code: '5^{\\prime}\\text{AUG}3^{\\prime}', desc: 'Codon mở đầu mã hóa Methionine (SV nhân thực) hoặc fMet (nhân sơ).' },
          { label: '3 Bộ ba kết thúc', code: '5^{\\prime}\\text{UAA}3^{\\prime},\\; 5^{\\prime}\\text{UAG}3^{\\prime},\\; 5^{\\prime}\\text{UGA}3^{\\prime}', desc: 'Ba bộ ba kết thúc dịch mã không mã hóa axit amin.' },
          { label: 'Cấu trúc Operon Lac', code: '\\text{P (Khởi động)} - \\text{O (Vận hành)} - \\text{Z, Y, A (Gen cấu trúc)}', desc: 'Cấu trúc Operon Lac ở vi khuẩn E. coli theo Jacob và Monod.' },
          { label: 'Đồng tiền năng lượng ATP', code: '\\text{ATP} \\rightarrow \\text{ADP} + \\text{P}_i + \\text{Năng lượng}', desc: 'Adenosine triphosphate cung cấp năng lượng cho tế bào.' }
        ]
      },
      {
        title: 'Ký hiệu Liên kết Gen, Hoán vị & Quần thể',
        items: [
          { label: 'Dị hợp đều (Cis)', code: '\\frac{\\underline{AB}}{ab}', desc: 'Hai alen trội A, B cùng nằm trên một NST.' },
          { label: 'Dị hợp chéo (Trans)', code: '\\frac{\\underline{Ab}}{aB}', desc: 'Alen trội A đi cùng alen lặn b trên một NST.' },
          { label: 'Đồng hợp liên kết', code: '\\frac{\\underline{AB}}{AB},\\; \\frac{\\underline{ab}}{ab}', desc: 'Kiểu gen đồng hợp trội và đồng hợp lặn liên kết.' },
          { label: 'Tần số hoán vị gen f', code: 'f\\% \\le 50\\%\\; (1\\% = 1\\text{ cM})', desc: 'Tần số hoán vị gen đo khoảng cách tương đối trên bản đồ di truyền.' },
          { label: 'Tần số alen p, q', code: 'p(A) + q(a) = 1', desc: 'Tổng tần số các alen của một gen trong quần thể bằng 1.' },
          { label: 'Cấu trúc quần thể', code: 'd\\,\\text{AA} : h\\,\\text{Aa} : r\\,\\text{aa}', desc: 'Tần số các kiểu gen trong quần thể (d + h + r = 1).' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Chuyển hóa Tế bào, Quang hợp, Hô hấp & Sinh lí (Lớp 10 – 11)',
        items: [
          { label: 'Phương trình tổng quát Quang hợp', code: '6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow{\\text{Ánh sáng, Diệp lục}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2\\uparrow + 6\\text{H}_2\\text{O}', desc: 'Oxi giải phóng trong quang hợp có nguồn gốc 100% từ phân tử nước H₂O.' },
          { label: 'Phương trình tổng quát Hô hấp hiếu khí', code: '\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Q (30–32 ATP + Nhiệt)}', desc: 'Quá trình phân giải hiếu khí 1 phân tử glucose qua Đường phân, Krebs và Chuỗi truyền e.' },
          { label: 'Thế nước tế bào & Sức trương', code: '\\psi = \\psi_s + \\psi_p', desc: 'Thế nước bằng tổng thế thẩm thấu (ψ_s < 0) và thế áp suất (ψ_p).' },
          { label: 'Lưu lượng tim & Chu kì tim (Sinh lí động vật)', code: 'Q = V_s \\times f\\text{ (mL/phút)}, \\quad T_{\\text{tim}} = \\frac{60}{f}\\text{ (s)} \\ (0{,}1\\text{s nhĩ co} + 0{,}3\\text{s thất co} + 0{,}4\\text{s dãn chung})', desc: 'Lưu lượng tim bằng thể tích tâm thu nhân nhịp tim; chu kì tim người chuẩn 0,8s (75 nhịp/phút).' }
        ]
      },
      {
        title: 'Cấu trúc Không gian & Hóa học của ADN / Gen',
        items: [
          { label: 'Tổng số Nucleotit & Tỉ lệ phần trăm của Gen', code: 'N = 2A + 2G = 2T + 2C, \\quad \\%A + \\%G = \\%T + \\%C = 50\\%', desc: 'Hệ thức nguyên tắc bổ sung A = T, G = C trong ADN mạch kép.' },
          { label: 'Tương quan các loại Nucleotit trên 2 mạch đơn ADN', code: 'A_1 = T_2, \\quad T_1 = A_2, \\quad G_1 = C_2, \\quad C_1 = G_2, \\quad A = T = A_1 + A_2 = A_1 + T_1', desc: 'Quan hệ bổ sung giữa mạch 1 và mạch 2 của phân tử ADN.' },
          { label: 'Tỉ lệ % từng loại Nucleotit theo 2 mạch đơn', code: '\\%A = \\%T = \\frac{\\%A_1 + \\%A_2}{2} = \\frac{\\%A_1 + \\%T_1}{2}, \\quad \\%G = \\%C = \\frac{\\%G_1 + \\%C_1}{2}', desc: 'Phần trăm mỗi loại nu của gen bằng trung bình cộng phần trăm trên 2 mạch.' },
          { label: 'Chiều dài L & Số chu kì xoắn C của Gen', code: 'L = \\frac{N}{2} \\times 3{,}4\\text{ \\AA} = \\frac{N}{2} \\times 0{,}34\\text{ nm}, \\quad C = \\frac{N}{20} = \\frac{L(\\text{\\AA})}{34}', desc: 'Mỗi chu kì xoắn gồm 10 cặp nu (20 nu) dài 34 Å = 3,4 nm.' },
          { label: 'Khối lượng phân tử M của Gen', code: 'M = N \\times 300\\text{ đvC}', desc: 'Khối lượng trung bình của 1 nucleotit là 300 đvC.' },
          { label: 'Số liên kết Hiđro & Liên kết Cộng hóa trị trong Gen', code: 'H = 2A + 3G, \\quad HT_{\\text{giữa các nu}} = N - 2, \\quad HT_{\\text{toàn gen}} = 2N - 2', desc: 'Số liên kết hiđro và số liên kết cộng hóa trị photphodieste trong gen mạch thẳng.' }
        ]
      },
      {
        title: 'Tái bản (Nhân đôi) ADN & Đột biến Gen',
        items: [
          { label: 'Số phân tử ADN con sau k lần nhân đôi', code: 'N_{\\text{ADN con}} = a \\cdot 2^k, \\quad N_{\\text{ADN mới hoàn toàn}} = a \\cdot (2^k - 2)', desc: 'Từ a phân tử ADN ban đầu nhân đôi k lần theo nguyên tắc bán bảo toàn (luôn còn 2 mạch cũ cho mỗi ADN gốc).' },
          { label: 'Số Nucleotit môi trường nội bào cung cấp', code: 'N_{\\text{mt}} = a \\cdot N \\cdot (2^k - 1), \\quad A_{\\text{mt}} = T_{\\text{mt}} = a \\cdot A \\cdot (2^k - 1), \\quad G_{\\text{mt}} = C_{\\text{mt}} = a \\cdot G \\cdot (2^k - 1)', desc: 'Số nu tự do môi trường cung cấp cho a gen nhân đôi k lần.' },
          { label: 'Số Nucleotit cung cấp cho các ADN có 2 mạch mới hoàn toàn', code: 'N_{\\text{mt mới hoàn toàn}} = a \\cdot N \\cdot (2^k - 2)', desc: 'Trừ đi 2 phân tử ADN con còn mang 1 mạch cũ của ADN mẹ ban đầu.' },
          { label: 'Số liên kết Hiđro bị phá vỡ & Hình thành trong nhân đôi', code: 'H_{\\text{phá vỡ}} = a \\cdot H \\cdot (2^k - 1), \\quad H_{\\text{hình thành}} = a \\cdot H \\cdot 2^k, \\quad HT_{\\text{hình thành}} = a(N - 2)(2^k - 1)', desc: 'Tổng số liên kết hiđro bị đứt và liên kết hóa trị được nối mới qua k đợt tái bản.' },
          { label: 'Biến thiên liên kết Hiđro trong Đột biến điểm', code: '\\text{Thay } (A-T) \\rightarrow (G-C): \\Delta H = +1; \\quad \\text{Mất/Thêm } 1(A-T): \\Delta H = \\mp 2; \\quad \\text{Mất/Thêm } 1(G-C): \\Delta H = \\mp 3', desc: 'Xác định nhanh dạng đột biến điểm dựa vào độ thay đổi số liên kết hiđro ΔH.' }
        ]
      },
      {
        title: 'Phiên mã (Tổng hợp ARN) & Dịch mã (Tổng hợp Protein)',
        items: [
          { label: 'Tương quan giữa Gen và phân tử mARN phiên mã', code: 'rN = \\frac{N}{2} = rA + rU + rG + rC, \\quad A = T = rA + rU, \\quad G = C = rG + rC', desc: 'Số ribonucleotit của mARN bằng một nửa số nucleotit của gen (ở sinh vật nhân sơ).' },
          { label: 'Số Ribonucleotit môi trường cung cấp cho k lần phiên mã', code: 'rN_{\\text{mt}} = k \\cdot rN, \\quad rA_{\\text{mt}} = k \\cdot T_{\\text{gốc}}, \\quad rU_{\\text{mt}} = k \\cdot A_{\\text{gốc}}, \\quad rG_{\\text{mt}} = k \\cdot C_{\\text{gốc}}, \\quad rC_{\\text{mt}} = k \\cdot G_{\\text{gốc}}', desc: 'Số ribonucleotit từng loại bổ sung trực tiếp với mạch gốc 3’→5’ của gen.' },
          { label: 'Số bộ ba (Codon) & Số axit amin môi trường cung cấp', code: 'N_{\\text{codon}} = \\frac{rN}{3} = \\frac{N}{6}, \\quad N_{\\text{aa môi trường}} = \\frac{rN}{3} - 1 = \\frac{N}{6} - 1', desc: 'Trừ 1 bộ ba kết thúc không mã hóa axit amin.' },
          { label: 'Số axit amin trong Protein hoàn chỉnh & Liên kết Peptit', code: 'N_{\\text{aa hoàn chỉnh}} = \\frac{rN}{3} - 2, \\quad N_{\\text{H}_2\\text{O giải phóng}} = N_{\\text{lk peptit}} = N_{\\text{aa mt}} - 1 = \\frac{rN}{3} - 2', desc: 'Chuỗi polipeptit hoàn chỉnh cắt bỏ thêm axit amin mở đầu.' },
          { label: 'Dịch mã đồng thời (Poliriboxom)', code: '\\sum N_{\\text{aa mt}} = k_{\\text{mARN}} \\cdot n_{\\text{riboxom}} \\cdot \\left(\\frac{rN}{3} - 1\\right)', desc: 'Tổng axit amin môi trường cung cấp khi k phân tử mARN đều có n riboxom trượt qua.' }
        ]
      },
      {
        title: 'Nguyên phân (Mitosis), Giảm phân (Meiosis) & Thụ tinh',
        items: [
          { label: 'Số tế bào con & Số NST môi trường cung cấp cho Nguyên phân', code: 'N_{\\text{tb con}} = a \\cdot 2^k, \\quad N_{\\text{NST mt}} = a \\cdot 2n \\cdot (2^k - 1), \\quad N_{\\text{NST mới hoàn toàn}} = a \\cdot 2n \\cdot (2^k - 2)', desc: 'Từ a tế bào lưỡng bội 2n nguyên phân liên tiếp k đợt.' },
          { label: 'Số NST cung cấp cho Tế bào sinh dục nguyên phân k lần rồi Giảm phân', code: 'N_{\\text{NST mt tổng}} = a \\cdot 2n \\cdot (2^{k+1} - 1), \\quad N_{\\text{NST mt riêng giảm phân}} = a \\cdot 2n \\cdot 2^k', desc: 'Tổng số NST đơn môi trường cung cấp cho cả vùng sinh sản và vùng chín.' },
          { label: 'Số giao tử tạo thành từ Giảm phân & Hiệu suất thụ tinh', code: 'N_{\\text{tinh trùng}} = 4 \\cdot N_{\\text{tb sinh tinh}}, \\quad N_{\\text{trứng}} = 1 \\cdot N_{\\text{tb sinh trứng}}, \\quad H\\% = \\frac{N_{\\text{giao tử thụ tinh}}}{N_{\\text{tổng giao tử}}}\\times 100\\%', desc: '1 tế bào sinh tinh giảm phân tạo 4 tinh trùng; 1 tế bào sinh trứng tạo 1 trứng và 3 thể cực.' },
          { label: 'Số loại Giao tử tối đa của Cơ thể 2n (Không TĐC & Có TĐC)', code: 'N_{\\text{giao tử}} = 2^n \\text{ (không TĐC)}, \\quad N_{\\text{giao tử}} = 2^{n+m} \\text{ (TĐC đơn ở } m \\text{ cặp)}, \\quad N_{\\text{giao tử}} = 2^n \\cdot 3^m \\text{ (TĐC kép)}', desc: 'Số loại giao tử khác nhau về nguồn gốc NST của loài có n cặp NST tương đồng.' }
        ]
      },
      {
        title: 'Quy luật Menđen & Tương tác Gen Không Alen (Lớp 12)',
        items: [
          { label: 'Công thức tổng quát Phép lai n cặp gen dị hợp phân li độc lập', code: 'N_{\\text{giao tử}} = 2^n, \\quad N_{\\text{tổ hợp}} = 4^n, \\quad N_{\\text{kiểu gen}} = 3^n, \\quad N_{\\text{kiểu hình}} = 2^n, \\quad N_{\\text{dòng thuần}} = 2^n', desc: 'Áp dụng cho phép tự thụ hoặc lai hai cơ thể dị hợp n cặp gen trội hoàn toàn.' },
          { label: 'Tỉ lệ Kiểu hình mang k tính trạng trội & (n - k) tính trạng lặn', code: 'P(k\\text{ trội}) = C_n^k \\cdot \\left(\\frac{3}{4}\\right)^k \\cdot \\left(\\frac{1}{4}\\right)^{n-k}', desc: 'Tính nhanh xác suất đời con F₂ mang đúng k tính trạng trội trong phép lai n cặp dị hợp.' },
          { label: 'Tỉ lệ Kiểu gen mang k cặp dị hợp hoặc k alen trội', code: 'P(k\\text{ dị hợp}) = C_n^k \\cdot \\left(\\frac{1}{2}\\right)^n, \\quad P(k\\text{ alen trội}) = \\frac{C_{2n}^k}{4^n}', desc: 'Ứng dụng trong bài toán xác suất kiểu gen và tương tác cộng gộp.' },
          { label: 'Các tỉ lệ F₂ đặc trưng của Tương tác gen hai cặp dị hợp', code: '\\text{Bổ sung: } 9:7,\\; 9:6:1,\\; 9:3:3:1; \\quad \\text{Át chế: } 12:3:1,\\; 13:3,\\; 9:3:4; \\quad \\text{Cộng gộp: } 15:1', desc: 'Nhận diện nhanh quy luật tương tác gen khi tổng tỉ lệ kiểu hình F₂ bằng 16 tổ hợp.' }
        ]
      },
      {
        title: 'Liên kết Gen, Hoán vị Gen & Công thức Giải nhanh Morgan',
        items: [
          { label: 'Tỉ lệ Giao tử Liên kết và Giao tử Hoán vị (Dị hợp đều AB/ab)', code: '\\underline{AB} = \\underline{ab} = \\frac{1 - f}{2} > 25\\%, \\quad \\underline{Ab} = \\underline{aB} = \\frac{f}{2} \\le 25\\%', desc: 'Cơ thể dị hợp đều cho 2 giao tử liên kết chiếm đa số và 2 giao tử hoán vị ≤ 25%.' },
          { label: 'Tỉ lệ Giao tử của Cơ thể Dị hợp chéo (Ab/aB)', code: '\\underline{Ab} = \\underline{aB} = \\frac{1 - f}{2} > 25\\%, \\quad \\underline{AB} = \\underline{ab} = \\frac{f}{2} \\le 25\\%', desc: 'Cơ thể dị hợp chéo cho giao tử Ab và aB là giao tử liên kết.' },
          { label: 'Công thức Giải nhanh F₁ dị hợp 2 cặp gen (A,B cùng nằm trên 1 NST)', code: '\\%(A-B-) = 50\\% + \\%(aabb), \\quad \\%(A-bb) = \\%(aaB-) = 25\\% - \\%(aabb)', desc: 'Hệ thức vàng giải mọi bài toán hoán vị gen F₁ × F₁ dù hoán vị 1 bên hay 2 bên!' },
          { label: 'Hệ thức Tổng hai kiểu hình luôn không đổi', code: '\\%(A-B-) + \\%(A-bb) = 75\\%, \\quad \\%(A-bb) + \\%(aabb) = 25\\%', desc: 'Tổng tỉ lệ kiểu hình trội-trội và trội-lặn luôn bằng 75%.' }
        ]
      },
      {
        title: 'Di truyền Quần thể (Tự phối & Cân bằng Hardy – Weinberg)',
        items: [
          { label: 'Tần số Alen từ Cấu trúc kiểu gen d AA : h Aa : r aa', code: 'p(A) = d + \\frac{h}{2}, \\quad q(a) = r + \\frac{h}{2}, \\quad p + q = 1, \\quad d + h + r = 1', desc: 'Công thức tính tần số tương đối của alen A và alen a trong quần thể bất kỳ.' },
          { label: 'Cấu trúc Quần thể Tự thụ phấn sau n thế hệ', code: 'h_n(Aa) = \\frac{h}{2^n}, \\quad d_n(AA) = d + \\frac{h(1 - 1/2^n)}{2}, \\quad r_n(aa) = r + \\frac{h(1 - 1/2^n)}{2}', desc: 'Quần thể tự phối có tỉ lệ dị hợp giảm dần và đồng hợp tăng dần, tần số alen không đổi.' },
          { label: 'Định luật Cân bằng Di truyền Hardy – Weinberg', code: 'p^2\\,\\text{AA} + 2pq\\,\\text{Aa} + q^2\\,\\text{aa} = 1 \\Leftrightarrow d \\cdot r = \\left(\\frac{h}{2}\\right)^2', desc: 'Điều kiện cần và đủ để quần thể ngẫu phối đạt trạng thái cân bằng di truyền.' },
          { label: 'Số loại Kiểu gen tối đa trong Quần thể (Đa alen & Giới tính)', code: 'N_{\\text{KG thường}} = \\frac{m(m+1)}{2}, \\quad N_{\\text{KG 2 gen LK}} = \\frac{mn(mn+1)}{2}, \\quad N_{\\text{KG trên X}} = \\frac{m(m+1)}{2} + m', desc: 'Công thức tính tổng số kiểu gen tối đa khi gen có m, n alen.' }
        ]
      },
      {
        title: 'Đột biến Đa bội (4n), Nhóm máu ABO & Phả hệ Di truyền Người',
        items: [
          { label: 'Tỉ lệ giao tử 2n của Thể tứ bội AAAA, AAAa, Aaaa, aaaa', code: '\\text{AAAA}\\rightarrow 1\\,\\text{AA}; \\quad \\text{AAAa}\\rightarrow \\frac{1}{2}\\text{AA}:\\frac{1}{2}\\text{Aa}; \\quad \\text{Aaaa}\\rightarrow \\frac{1}{2}\\text{Aa}:\\frac{1}{2}\\text{aa}', desc: 'Qui tắc đường chéo hình chữ nhật tính giao tử lưỡng bội 2n của thể tứ bội 4n.' },
          { label: 'Tỉ lệ giao tử 2n của Thể tứ bội AAaa', code: '\\text{AAaa} \\rightarrow \\frac{1}{6}\\,\\text{AA} : \\frac{4}{6}\\,\\text{Aa} : \\frac{1}{6}\\,\\text{aa}', desc: 'Cơ thể tứ bội AAaa giảm phân tạo giao tử lưỡng bội theo tỉ lệ 1 : 4 : 1.' },
          { label: 'Hệ nhóm máu ABO ở người (3 alen: I^A, I^B, I^O)', code: '\\text{Máu A: } I^A I^A, I^A I^O; \\quad \\text{Máu B: } I^B I^B, I^B I^O; \\quad \\text{Máu AB: } I^A I^B; \\quad \\text{Máu O: } I^O I^O', desc: 'Alen I^A và I^B đồng trội so với nhau và trội hoàn toàn so với alen I^O.' },
          { label: 'Cân bằng Quần thể cho Hệ nhóm máu ABO (p + q + r = 1)', code: 'p^2 I^A I^A + 2pr I^A I^O + q^2 I^B I^B + 2qr I^B I^O + 2pq I^A I^B + r^2 I^O I^O = 1', desc: 'Tính tần số r(I^O) = √(%Máu O), p(I^A) = √(%Máu A + %Máu O) - r.' },
          { label: 'Di truyền Bệnh Mù màu & Máu khó đông (Lặn trên NST X)', code: '\\text{Nữ bình thường: } X^A X^A, X^A X^a; \\quad \\text{Nữ bệnh: } X^a X^a; \\quad \\text{Nam bình thường: } X^A Y; \\quad \\text{Nam bệnh: } X^a Y', desc: 'Gen lặn trên NST X không có alen trên Y: bệnh gặp ở nam nhiều hơn nữ và di truyền chéo.' },
          { label: 'Xác suất Sinh con trong Bài toán Phả hệ (Bố mẹ bình thường có em ruột bệnh aa)', code: 'P(\\text{Bố/Mẹ có KG } Aa \\mid \\text{KH trội}) = \\frac{2}{3} \\Rightarrow P(\\text{Con bệnh } aa) = \\frac{2}{3} \\times \\frac{2}{3} \\times \\frac{1}{4} = \\frac{1}{9}', desc: 'Khi bố mẹ của một người là Aa × Aa và người đó bình thường (A-), xác suất mang kiểu gen dị hợp Aa là 2/3.' }
        ]
      },
      {
        title: 'Sinh thái học Quần thể & Hiệu suất Sinh thái (Lớp 12)',
        items: [
          { label: 'Kích thước Quần thể & Phương pháp Bắt – Đánh dấu – Thả lại', code: 'N_t = N_0 + B - D + I - E, \\quad N = \\frac{M \\times C}{R}', desc: 'Biến động kích thước quần thể và công thức Lincoln-Petersen ước lượng quân số N.' },
          { label: 'Tăng trưởng Quần thể & Hiệu suất Sinh thái 10%', code: '\\frac{\\Delta N}{\\Delta t} = r N \\left(\\frac{K - N}{K}\\right), \\quad H_{\\text{sinh thái}}\\% = \\frac{E_{n+1}}{E_n}\\times 100\\% \\approx 10\\%', desc: 'Mô hình tăng trưởng logistic giới hạn K và hiệu suất sinh thái qua các bậc dinh dưỡng.' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 5. TIẾNG ANH (ENGLISH — NGỮ PHÁP, 12 THÌ, BỊ ĐỘNG, ĐIỀU KIỆN, ĐẢO NGỮ & IPA)
   * ========================================================================== */
  english: {
    id: 'english',
    name: 'Tiếng Anh',
    shortName: 'Anh',
    icon: Languages,
    symbolGroups: [
      {
        title: 'Thành phần Câu & Từ loại (Parts of Speech)',
        items: [
          { label: 'Chủ ngữ (Subject)', code: '\\text{S}', desc: 'Subject – Chủ ngữ của câu.' },
          { label: 'Động từ (Verb)', code: '\\text{V}', desc: 'Verb – Động từ chính trong câu.' },
          { label: 'Tân ngữ (Object)', code: '\\text{O}', desc: 'Object – Tân ngữ trực tiếp hoặc gián tiếp.' },
          { label: 'Bổ ngữ (Complement)', code: '\\text{C}', desc: 'Complement – Bổ ngữ cho chủ ngữ hoặc tân ngữ.' },
          { label: 'Động từ nguyên mẫu', code: '\\text{V}_0 / \\text{V}_{\\text{inf}}', desc: 'Bare infinitive – Động từ nguyên mẫu không to.' },
          { label: 'To + Nguyên mẫu', code: '\\text{to V}_0', desc: 'Full infinitive – Động từ nguyên mẫu có to.' },
          { label: 'Danh động từ / Hiện tại phân từ', code: '\\text{V-ing}', desc: 'Gerund / Present Participle.' },
          { label: 'Quá khứ đơn V₂/ed', code: '\\text{V}_2 / \\text{V}_{\\text{ed}}', desc: 'Past simple form – Động từ chia quá khứ đơn.' },
          { label: 'Quá khứ phân từ V₃/ed', code: '\\text{V}_3 / \\text{V}_{\\text{p.p}}', desc: 'Past Participle – Dùng trong các thì hoàn thành và câu bị động.' },
          { label: 'Danh từ (Noun)', code: '\\text{N}', desc: 'Noun – Danh từ đếm được hoặc không đếm được.' },
          { label: 'Tính từ (Adjective)', code: '\\text{Adj}', desc: 'Adjective – Tính từ bổ nghĩa cho danh từ.' },
          { label: 'Trạng từ (Adverb)', code: '\\text{Adv}', desc: 'Adverb – Trạng từ bổ nghĩa cho động từ, tính từ, cả câu.' },
          { label: 'Giới từ (Preposition)', code: '\\text{Prep}', desc: 'Preposition – Giới từ (in, on, at, for, with, of...); sau Prep + V-ing/N.' },
          { label: 'Trợ động từ (Auxiliary)', code: '\\text{Aux}', desc: 'Auxiliary verb (do/does/did, have/has/had, be).' },
          { label: 'Động từ khuyết thiếu', code: '\\text{Modal}', desc: 'Modal verb (can, could, may, might, must, should, will, would).' }
        ]
      },
      {
        title: 'Ký hiệu Phiên âm Quốc tế IPA (Nguyên âm & Phụ âm)',
        items: [
          { label: 'Nguyên âm /i:/ & /ɪ/', code: '/\\text{i:}/,\\; /\\text{ɪ}/', desc: 'Nguyên âm i dài (meet) và i ngắn (sit).' },
          { label: 'Nguyên âm /e/ & /æ/', code: '/\\text{e}/,\\; /\\text{æ}/', desc: 'Nguyên âm e (bed) và e bẹt (cat).' },
          { label: 'Nguyên âm /ɑ:/, /ɒ/, /ɔ:/', code: '/\\text{ɑ:}/,\\; /\\text{ɒ}/,\\; /\\text{ɔ:}/', desc: 'Nguyên âm a dài (car), o ngắn (hot), o dài (saw).' },
          { label: 'Nguyên âm /ʊ/ & /u:/', code: '/\\text{ʊ}/,\\; /\\text{u:}/', desc: 'Nguyên âm u ngắn (book) và u dài (food).' },
          { label: 'Nguyên âm /ʌ/, /ɜ:/, /ə/', code: '/\\text{ʌ}/,\\; /\\text{ɜ:}/,\\; /\\text{ə}/', desc: 'Nguyên âm ă (cup), ơ dài (bird) và ơ ngắn schwa (about).' },
          { label: 'Nguyên âm đôi /eɪ/, /aɪ/, /ɔɪ/', code: '/\\text{eɪ}/,\\; /\\text{aɪ}/,\\; /\\text{ɔɪ}/', desc: 'Ba nguyên âm đôi hướng tới /ɪ/ (day, buy, boy).' },
          { label: 'Nguyên âm đôi /aʊ/, /əʊ/', code: '/\\text{aʊ}/,\\; /\\text{əʊ}/', desc: 'Hai nguyên âm đôi hướng tới /ʊ/ (now, go).' },
          { label: 'Phụ âm /θ/ & /ð/ (th)', code: '/\\theta/,\\; /\\text{ð}/', desc: 'Âm th vô thanh (think) và th hữu thanh (this).' },
          { label: 'Phụ âm /ʃ/, /ʒ/, /tʃ/, /dʒ/', code: '/\\text{ʃ}/,\\; /\\text{ʒ}/,\\; /\\text{tʃ}/,\\; /\\text{dʒ}/', desc: 'Các phụ âm xuýt và tắc xát (she, vision, check, jam).' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: '12 Thì Tiếng Anh Trọng Tâm (12 English Tenses)',
        items: [
          { label: '1. Hiện tại đơn (Present Simple)', code: '\\text{S + V}_{s/es}\\text{ (am/is/are)} \\quad | \\quad \\text{S + do/does + not + V}_0', desc: 'Diễn tả thói quen, sự thật hiển nhiên, lịch trình cố định (always, usually, every...).' },
          { label: '2. Hiện tại tiếp diễn (Present Continuous)', code: '\\text{S + am/is/are + V-ing}', desc: 'Hành động đang diễn ra tại thời điểm nói hoặc kế hoạch gần (now, at the moment, Look!).' },
          { label: '3. Hiện tại hoàn thành (Present Perfect)', code: '\\text{S + have/has + V}_3/\\text{V}_{\\text{ed}}', desc: 'Hành động bắt đầu trong quá khứ kéo dài đến hiện tại hoặc vừa mới xảy ra (since, for, just, already, yet).' },
          { label: '4. Hiện tại hoàn thành tiếp diễn', code: '\\text{S + have/has + been + V-ing}', desc: 'Nhấn mạnh tính liên tục của hành động kéo dài từ quá khứ đến hiện tại (all day, for hours).' },
          { label: '5. Quá khứ đơn (Past Simple)', code: '\\text{S + V}_2/\\text{V}_{\\text{ed}}\\text{ (was/were)} \\quad | \\quad \\text{S + did + not + V}_0', desc: 'Hành động đã xảy ra và chấm dứt hoàn toàn trong quá khứ (yesterday, ago, last, in 2020).' },
          { label: '6. Quá khứ tiếp diễn (Past Continuous)', code: '\\text{S + was/were + V-ing}', desc: 'Hành động đang diễn ra tại một thời điểm xác định trong quá khứ hoặc đang diễn ra thì hành động khác xen vào.' },
          { label: '7. Quá khứ hoàn thành (Past Perfect)', code: '\\text{S + had + V}_3/\\text{V}_{\\text{ed}}', desc: 'Hành động xảy ra và hoàn tất trước một thời điểm hoặc một hành động khác trong quá khứ (before, after, by the time).' },
          { label: '8. Tương lai đơn & Tương lai gần', code: '\\text{S + will + V}_0 \\quad | \\quad \\text{S + am/is/are + going to + V}_0', desc: 'Quyết định tại thời điểm nói (will) so với dự định có kế hoạch/dấu hiệu từ trước (be going to).' },
          { label: '9. Tương lai tiếp diễn & Tương lai hoàn thành', code: '\\text{S + will be + V-ing} \\quad | \\quad \\text{S + will have + V}_3/\\text{V}_{\\text{ed}}', desc: 'Đang diễn ra tại thời điểm tương lai (will be V-ing) hoặc hoàn tất trước mốc tương lai (by + mốc tương lai).' }
        ]
      },
      {
        title: 'Sự Phối hợp Thì & Cấu trúc Thời gian (Sequence of Tenses)',
        items: [
          { label: 'Cấu trúc Since (Hiện tại hoàn thành – Quá khứ đơn)', code: '\\text{S + have/has + V}_3/\\text{V}_{\\text{ed}} + \\textbf{since} + \\text{S + V}_2/\\text{V}_{\\text{ed}}', desc: 'Mệnh đề trước since chia Hiện tại hoàn thành, mệnh đề sau since chia Quá khứ đơn.' },
          { label: 'Cấu trúc By the time ở Quá khứ & Tương lai', code: '\\textbf{By the time} + \\text{S + V}_2/\\text{ed},\\; \\text{S + had + V}_3/\\text{ed}; \\quad \\textbf{By the time} + \\text{S + V}_{s/es},\\; \\text{S + will have + V}_3/\\text{ed}', desc: 'Lưu ý mệnh đề trạng ngữ chỉ thời gian ở tương lai dùng Hiện tại đơn thay cho Tương lai đơn.' },
          { label: 'Hành động đang diễn ra thì hành động khác xen vào', code: '\\textbf{When/While} + \\text{S}_1 + \\text{was/were + V-ing},\\; \\text{S}_2 + \\text{V}_2/\\text{V}_{\\text{ed}}', desc: 'Hành động kéo dài dùng Quá khứ tiếp diễn, hành động cắt ngang dùng Quá khứ đơn.' },
          { label: 'Cấu trúc It is the first/second time...', code: '\\text{It is the first time + S + have/has + (ever) + V}_3/\\text{V}_{\\text{ed}}', desc: 'Nếu là It was the first time thì mệnh đề sau lùi về had + V₃/ed.' },
          { label: 'Cấu trúc It’s (high/about) time (Đã đến lúc)', code: '\\text{It is (high) time + S + V}_2/\\text{V}_{\\text{ed}} \\; = \\; \\text{It is time for sb + to V}_0', desc: 'Động từ sau chủ ngữ lùi một bậc về Quá khứ giả định dù mang nghĩa hiện tại.' }
        ]
      },
      {
        title: 'Câu Bị Động & Thể Sai Khiến (Passive Voice & Causative)',
        items: [
          { label: 'Công thức tổng quát Câu Bị động', code: '\\text{Chủ động: S + V + O} \\;\\Rightarrow\\; \\text{Bị động: S}_{\\text{(O)}} + \\textbf{be + V}_3/\\text{V}_{\\text{ed}} + (\\text{by O}_{\\text{(S)}})', desc: 'Động từ to be chia theo đúng thì của động từ chính ở câu chủ động.' },
          { label: 'Bị động với Động từ khuyết thiếu (Modals)', code: '\\text{S + Modal + be + V}_3/\\text{V}_{\\text{ed}} \\quad | \\quad \\text{S + Modal + have been + V}_3/\\text{V}_{\\text{ed}}', desc: 'Bị động hiện tại/tương lai và bị động hoàn thành với Modal verbs.' },
          { label: 'Bị động Kép (Động từ tường thuật think, say, believe, report)', code: '\\text{It is said that + S + V} \\;\\Leftrightarrow\\; \\text{S + is/are said + } \\textbf{to V}_0\\text{ (cùng thời) / }\\textbf{to have V}_3/\\text{ed}\\text{ (trước thời)}', desc: 'Dùng to have + V₃/ed khi hành động mệnh đề sau xảy ra trước động từ tường thuật.' },
          { label: 'Thể Sai khiến (Causative Form: Have / Get)', code: '\\text{Have sb + V}_0 / \\text{Get sb + to V}_0 \\;\\Rightarrow\\; \\text{Bị động: } \\textbf{Have / Get + sth + V}_3/\\text{V}_{\\text{ed}}', desc: 'Nhờ hoặc thuê ai làm việc gì (chủ động) và có cái gì được làm bởi ai (bị động).' },
          { label: 'Bị động với Need, Make, Let, Động từ giác quan', code: '\\text{S}_{\\text{vật}} + \\text{need + V-ing / to be V}_3; \\quad \\text{be made + to V}_0; \\quad \\text{be seen + V-ing / to V}_0', desc: 'Các trường hợp bị động đặc biệt thường gặp trong đề thi.' }
        ]
      },
      {
        title: 'Câu Điều Kiện, Điều Kiện Hỗn Hợp & Câu Ước (Conditionals & Wishes)',
        items: [
          { label: 'Câu điều kiện Loại 1 (Có thật ở hiện tại / tương lai)', code: '\\textbf{If} + \\text{S + V}_{s/es}\\text{ (HTĐ)},\\; \\text{S + will/can/may + V}_0', desc: 'Giả thiết có thể xảy ra ở hiện tại hoặc tương lai.' },
          { label: 'Câu điều kiện Loại 2 (Không có thật ở hiện tại)', code: '\\textbf{If} + \\text{S + V}_2/\\text{V}_{\\text{ed}}\\text{ (were)},\\; \\text{S + would/could + V}_0', desc: 'Giả thiết trái ngược với thực tế ở hiện tại (to be luôn dùng were cho mọi ngôi).' },
          { label: 'Câu điều kiện Loại 3 (Không có thật trong quá khứ)', code: '\\textbf{If} + \\text{S + had + V}_3/\\text{V}_{\\text{ed}},\\; \\text{S + would/could + have + V}_3/\\text{V}_{\\text{ed}}', desc: 'Giả thiết trái ngược với sự việc đã xảy ra trong quá khứ.' },
          { label: 'Câu điều kiện Hỗn hợp (Mixed Conditional 3 – 2)', code: '\\textbf{If} + \\text{S + had + V}_3/\\text{V}_{\\text{ed}}\\text{ (quá khứ)},\\; \\text{S + would/could + V}_0\\text{ (now / today)}', desc: 'Nguyên nhân trái với quá khứ nhưng kết quả còn ảnh hưởng tới hiện tại (có now, today).' },
          { label: 'Đảo ngữ Câu điều kiện Loại 1, 2, 3', code: '\\text{L1: } \\textbf{Should} + \\text{S + V}_0; \\quad \\text{L2: } \\textbf{Were} + \\text{S + (to V}_0); \\quad \\text{L3: } \\textbf{Had} + \\text{S + V}_3/\\text{V}_{\\text{ed}}', desc: 'Bỏ If và đảo Should / Were / Had lên trước chủ ngữ.' },
          { label: 'Câu ước Wish / If only (Hiện tại – Quá khứ – Tương lai)', code: '\\text{S + wish(es) + S + } \\begin{cases} \\text{V}_2/\\text{ed (were)} & \\text{(ước trái hiện tại)} \\\\ \\text{had + V}_3/\\text{ed} & \\text{(ước trái quá khứ)} \\\\ \\text{would/could + V}_0 & \\text{(ước tương lai)} \\end{cases}', desc: 'Ba cấu trúc câu ước tương ứng với ba mốc thời gian.' }
        ]
      },
      {
        title: 'So sánh, Mệnh đề Quan hệ & Rút gọn Mệnh đề',
        items: [
          { label: 'So sánh Hơn & So sánh Nhất', code: '\\text{Adj-er / more Adj + than}; \\quad \\text{the + Adj-est / the most Adj}', desc: 'Phân biệt tính từ/trạng từ ngắn (1 âm tiết) và dài (≥ 2 âm tiết).' },
          { label: 'So sánh Kép (Càng... càng...)', code: '\\textbf{The + comparative} + \\text{S}_1 + \\text{V}_1,\\; \\textbf{the + comparative} + \\text{S}_2 + \\text{V}_2', desc: 'Ví dụ: The harder you study, the higher score you get.' },
          { label: 'So sánh Gấp bội (Multiple Numbers Comparison)', code: '\\text{S + V + half / twice / three times + } \\textbf{as + Adj/Adv/many/much + as} + \\dots', desc: 'So sánh gấp số lần luôn dùng cấu trúc as ... as (không dùng more than).' },
          { label: 'Rút gọn Mệnh đề Quan hệ (V-ing, V₃/ed, to V₀)', code: '\\text{Chủ động} \\rightarrow \\textbf{V-ing}; \\quad \\text{Bị động} \\rightarrow \\textbf{V}_3/\\text{V}_{\\text{ed}}; \\quad \\text{Sau the first/last/only/so sánh nhất} \\rightarrow \\textbf{to V}_0', desc: 'Ba quy tắc rút gọn mệnh đề quan hệ trọng tâm.' },
          { label: 'Rút gọn Mệnh đề đồng chủ ngữ (Participle Clauses)', code: '\\textbf{V-ing / Having + V}_3/\\text{ed},\\; \\text{S + V (chủ động)}; \\quad \\textbf{V}_3/\\text{ed / Having been + V}_3/\\text{ed},\\; \\text{S + V (bị động)}', desc: 'Hai mệnh đề phải cùng chủ ngữ S khi rút gọn trạng ngữ đầu câu.' }
        ]
      },
      {
        title: 'Đảo ngữ & Giả định thức (Inversion & Subjunctive)',
        items: [
          { label: 'Đảo ngữ Hardly... when / No sooner... than (Vừa mới... thì)', code: '\\textbf{Hardly/Scarcely + had + S + V}_3/\\text{ed + when} + \\text{S + V}_2/\\text{ed} \\;\\Leftrightarrow\\; \\textbf{No sooner + had + S + V}_3/\\text{ed + than} + \\text{S + V}_2/\\text{ed}', desc: 'Cặp đảo ngữ kinh điển: Hardly/Scarcely đi với when; No sooner đi với than.' },
          { label: 'Đảo ngữ với Trạng từ phủ định & Only', code: '\\textbf{Never / Rarely / Seldom / Little / Only after / Not until...} + \\textbf{Aux + S + V}_0', desc: 'Đưa trạng từ phủ định hoặc cụm Only lên đầu câu thì đảo trợ động từ ở mệnh đề chính.' },
          { label: 'Đảo ngữ với So... that và Such... that', code: '\\textbf{So + Adj/Adv + Aux + S + V}_0 + \\text{that...} \\quad | \\quad \\textbf{Such + be + N + that...}', desc: 'Đảo ngữ nhấn mạnh quá... đến nỗi mà.' },
          { label: 'Thức Giả định (Subjunctive Mood với suggest, insist, essential)', code: '\\text{S}_1 + \\text{suggest/insist/recommend/demand + that + S}_2 + \\textbf{(should) + V}_0\\text{ (bị động: be + V}_3/\\text{ed)}', desc: 'Động từ sau that luôn ở dạng nguyên mẫu V₀ cho mọi chủ ngữ và mọi thì.' }
        ]
      },
      {
        title: 'Danh động từ (V-ing), Động từ nguyên mẫu (To V), Liên từ & Cụm động từ',
        items: [
          { label: 'Nhóm Động từ + to V₀ (Decide, Hope, Plan, Agree, Refuse...)', code: '\\text{decide / hope / plan / agree / refuse / promise / afford / manage / tend + } \\textbf{to V}_0', desc: 'Các động từ theo sau bởi động từ nguyên mẫu có to.' },
          { label: 'Nhóm Động từ + V-ing (Enjoy, Avoid, Mind, Suggest, Deny...)', code: '\\text{enjoy / avoid / mind / suggest / finish / deny / admit / consider / postpone + } \\textbf{V-ing}', desc: 'Các động từ theo sau bởi danh động từ V-ing.' },
          { label: 'Remember / Forget / Regret + to V₀ vs. V-ing', code: '\\textbf{+ to V}_0\\text{ (việc chưa làm / bổn phận)} \\quad \\leftrightarrow \\quad \\textbf{+ V-ing}\\text{ (việc đã làm trong quá khứ)}', desc: 'Phân biệt sắc thái nghĩa khi theo sau là to V₀ hoặc V-ing.' },
          { label: 'Stop / Try + to V₀ vs. V-ing', code: '\\text{stop + to V}_0\\text{ (dừng lại để làm)} \\leftrightarrow \\text{stop + V-ing (dừng hẳn)}; \\quad \\text{try + to V}_0\\text{ (cố gắng)} \\leftrightarrow \\text{try + V-ing (thử)}', desc: 'Cặp động từ đổi nghĩa hoàn toàn khi đi với to V₀ và V-ing.' },
          { label: 'Used to V₀ vs. Be / Get used to V-ing', code: '\\textbf{used to + V}_0\\text{ (đã từng làm trong QK)} \\quad \\leftrightarrow \\quad \\textbf{be / get used to + V-ing / N}\\text{ (quen với việc gì)}', desc: 'Cấu trúc thói quen trong quá khứ so với sự thích nghi ở hiện tại.' },
          { label: 'Would rather (Thích hơn / Muốn ai làm gì)', code: '\\text{S + would rather + } \\textbf{V}_0\\text{ (than V}_0) \\quad | \\quad \\text{S}_1 + \\text{would rather + S}_2 + \\textbf{V}_2/\\text{ed (HT) / had V}_3/\\text{ed (QK)}', desc: 'Cấu trúc would rather cùng chủ ngữ và khác chủ ngữ.' },
          { label: 'Liên từ Nhượng bộ & Nguyên nhân (Mệnh đề ↔ Cụm danh từ)', code: '\\textbf{Although/Though + S + V} \\leftrightarrow \\textbf{Despite/In spite of + N/V-ing}; \\quad \\textbf{Because + S + V} \\leftrightarrow \\textbf{Because of/Due to + N/V-ing}', desc: 'Chuyển đổi giữa mệnh đề (S + V) và cụm danh từ / V-ing.' },
          { label: 'Cụm động từ trọng tâm (Core Phrasal Verbs)', code: '\\text{look forward to + V-ing} \\cdot \\text{put off (delay)} \\cdot \\text{give up (quit)} \\cdot \\text{turn down (refuse)} \\cdot \\text{carry out (conduct)} \\cdot \\text{make up for}', desc: 'Các cụm động từ xuất hiện tần suất cao nhất trong đề thi THPT & ĐGNL.' }
        ]
      },
      {
        title: 'Quy tắc Phát âm (-s/-es, -ed), Trật tự Tính từ (OSASCOMP) & Câu hỏi đuôi',
        items: [
          { label: 'Quy tắc Phát âm đuôi -s / -es', code: '/\\text{s}/:\\text{ p, k, t, f, }\\theta; \\quad /\\text{ɪz}/:\\text{ s, ss, sh, ch, x, z, ge, ce}; \\quad /\\text{z}/:\\text{ còn lại}', desc: 'Ba cách phát âm đuôi -s/-es trong bài ngữ âm.' },
          { label: 'Quy tắc Phát âm đuôi -ed', code: '/\\text{ɪd}/:\\text{ t, d}; \\quad /\\text{t}/:\\text{ p, k, f, s, sh, ch, }\\theta; \\quad /\\text{d}/:\\text{ nguyên âm và phụ âm hữu thanh còn lại}', desc: 'Ba cách phát âm đuôi -ed của động từ có quy tắc.' },
          { label: 'Trật tự Tính từ trước Danh từ (OSASCOMP)', code: '\\text{Opinion} \\rightarrow \\text{Size} \\rightarrow \\text{Age} \\rightarrow \\text{Shape} \\rightarrow \\text{Color} \\rightarrow \\text{Origin} \\rightarrow \\text{Material} \\rightarrow \\text{Purpose} + \\text{Noun}', desc: 'Quy tắc sắp xếp nhiều tính từ đứng trước một danh từ.' },
          { label: 'Câu hỏi đuôi (Tag Questions) & Trường hợp đặc biệt', code: '\\text{S + V}_{(+)},\\; \\text{Aux}_{(-)} + \\text{S?} \\quad | \\quad \\text{I am} \\rightarrow \\text{aren’t I?}; \\quad \\text{Let’s} \\rightarrow \\text{shall we?}; \\quad \\text{Mệnh lệnh} \\rightarrow \\text{will you?}', desc: 'Quy tắc câu hỏi đuôi khẳng định – phủ định và các trường hợp bất quy tắc.' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 5. NGỮ VĂN
   * ========================================================================== */
  literature: {
    id: 'literature',
    name: 'Ngữ văn',
    shortName: 'Văn',
    icon: BookOpen,
    symbolGroups: [
      {
        title: 'Ký hiệu Bố cục & Dàn ý Nghị luận',
        items: [
          { label: 'Suy ra', code: '\\Rightarrow', desc: 'Dẫn tới kết luận hoặc hệ quả lập luận.' },
          { label: 'Tương đương', code: '\\Leftrightarrow', desc: 'Hai luận điểm tương đương hoặc bổ trợ nhau.' },
          { label: 'Mạch vận động', code: '\\rightarrow', desc: 'Mạch vận động của hình tượng hoặc tâm trạng.' },
          { label: 'Luận điểm 1', code: '\\text{LĐ}_1', desc: 'Ký hiệu Luận điểm 1 trong dàn ý nghị luận.' },
          { label: 'Luận điểm 2', code: '\\text{LĐ}_2', desc: 'Ký hiệu Luận điểm 2 trong dàn ý nghị luận.' },
          { label: 'Luận điểm 3', code: '\\text{LĐ}_3', desc: 'Ký hiệu Luận điểm 3 trong dàn ý nghị luận.' },
          { label: 'Luận cứ', code: '\\text{LC}', desc: 'Ký hiệu lí lẽ và luận cứ triển khai.' },
          { label: 'Dẫn chứng', code: '\\text{DC}', desc: 'Ký hiệu dẫn chứng văn học hoặc thực tế.' },
          { label: 'Đối lập', code: '\\neq', desc: 'Quan hệ đối lập / tương phản giữa hai hình ảnh.' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Biện pháp tu từ Tiếng Việt',
        items: [
          { label: 'So sánh', code: '\\text{So sánh: } A \\text{ như / là / tựa } B', desc: 'Đối chiếu hai sự vật hiện tượng có nét tương đồng nhằm tăng sức gợi hình, gợi cảm.' },
          { label: 'Ẩn dụ (So sánh ngầm)', code: '\\text{Ẩn dụ (Tương đồng ngầm: hình thức, cách thức, phẩm chất, chuyển đổi cảm giác)}', desc: 'Gọi tên sự vật hiện tượng này bằng tên sự vật khác có nét tương đồng.' },
          { label: 'Hoán dụ (Quan hệ gần gũi)', code: '\\text{Hoán dụ (Bộ phận – Toàn thể, Vật chứa – Vật bị chứa, Dấu hiệu – Sự vật)}', desc: 'Gọi tên sự vật này bằng tên sự vật khác có quan hệ gần gũi, đi đôi.' },
          { label: 'Nhân hóa', code: '\\text{Nhân hóa: Gán từ ngữ / hành động / tâm trạng của người cho vật}', desc: 'Làm cho thế giới loài vật, cây cối, đồ vật trở nên gần gũi, sinh động.' },
          { label: 'Điệp từ / Điệp ngữ / Điệp cấu trúc', code: '\\text{Điệp ngữ (Điệp nối tiếp, Điệp cách quãng, Điệp vòng)}', desc: 'Lặp lại từ ngữ hoặc cấu trúc câu nhằm nhấn mạnh cảm xúc và tạo nhịp điệu.' },
          { label: 'Nói quá & Nói giảm nói tránh', code: '\\text{Nói quá (Phóng đại)} \\;\\leftrightarrow\\; \\text{Nói giảm nói tránh (Tế nhị)}', desc: 'Phóng đại quy mô để gây ấn tượng hoặc diễn đạt tế nhị để giảm cảm giác đau buồn.' },
          { label: 'Liệt kê, Tương phản & Câu hỏi tu từ', code: '\\text{Liệt kê: } X_1, X_2, X_3 \\dots \\;\\cdot\\; \\text{Tương phản} \\;\\cdot\\; \\text{Câu hỏi tu từ}', desc: 'Phối hợp các biện pháp tu từ cú pháp làm nổi bật tư tưởng chủ đề.' }
        ]
      },
      {
        title: 'Thao tác lập luận & Phương thức biểu đạt',
        items: [
          { label: '6 Phương thức biểu đạt', code: '\\text{Tự sự} \\cdot \\text{Miêu tả} \\cdot \\text{Biểu cảm} \\cdot \\text{Thuyết minh} \\cdot \\text{Nghị luận} \\cdot \\text{Hành chính}', desc: 'Sáu phương thức biểu đạt trong chương trình Đọc hiểu.' },
          { label: 'Thao tác Giải thích & Phân tích', code: '\\text{Giải thích (Làm rõ khái niệm)} \\rightarrow \\text{Phân tích (Chia tách các khía cạnh)}', desc: 'Hai thao tác nền tảng mở đầu bài văn nghị luận.' },
          { label: 'Thao tác Chứng minh & Bình luận', code: '\\text{Chứng minh (Dẫn chứng xác thực)} \\rightarrow \\text{Bình luận (Đánh giá và Bài học)}', desc: 'Dùng dẫn chứng làm sáng tỏ luận điểm và bàn luận mở rộng.' },
          { label: 'Thao tác So sánh & Bác bỏ', code: '\\text{So sánh (Tương đồng / Khác biệt)} \\cdot \\text{Bác bỏ (Phê phán quan niệm sai)}', desc: 'Đối chiếu làm nổi bật giá trị và phản biện sắc bén.' }
        ]
      },
      {
        title: 'Cấu trúc đoạn văn, Phép liên kết & Thể thơ',
        items: [
          { label: 'Đoạn văn Diễn dịch & Quy nạp', code: '\\text{Diễn dịch (Câu chủ đề đầu đoạn)} \\;\\leftrightarrow\\; \\text{Quy nạp (Câu chủ đề cuối đoạn)}', desc: 'Hai mô hình đoạn văn cơ bản trong làm văn nghị luận.' },
          { label: 'Đoạn văn Tổng – Phân – Hợp', code: '\\text{Câu chủ đề (Tổng)} \\rightarrow \\text{Phân tích (Phân)} \\rightarrow \\text{Khái quát nâng cao (Hợp)}', desc: 'Mô hình đoạn văn nghị luận xã hội 200 chữ chuẩn mực.' },
          { label: 'Các phép liên kết câu và đoạn', code: '\\text{Phép lặp} \\cdot \\text{Phép thế} \\cdot \\text{Phép nối} \\cdot \\text{Phép liên tưởng / đồng nghĩa}', desc: 'Bốn phép liên kết hình thức phổ biến trong đọc hiểu văn bản.' },
          { label: '6 Phong cách ngôn ngữ', code: '\\text{Sinh hoạt} \\cdot \\text{Nghệ thuật} \\cdot \\text{Báo chí} \\cdot \\text{Chính luận} \\cdot \\text{Khoa học} \\cdot \\text{Hành chính}', desc: 'Sáu phong cách chức năng ngôn ngữ tiếng Việt.' },
          { label: 'Các thể thơ truyền thống & hiện đại', code: '\\text{Lục bát (6-8)} \\cdot \\text{Song thất lục bát} \\cdot \\text{Thất ngôn bát cú} \\cdot \\text{Tự do}', desc: 'Nhận diện thể thơ dựa vào số chữ trong dòng và quy tắc gieo vần.' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 6. LỊCH SỬ
   * ========================================================================== */
  history: {
    id: 'history',
    name: 'Lịch sử',
    shortName: 'Sử',
    icon: Landmark,
    symbolGroups: [
      {
        title: 'Ký hiệu Tiến trình & Niên đại',
        items: [
          { label: 'Tiến trình', code: '\\rightarrow', desc: 'Mũi tên diễn biến thời gian lịch sử.' },
          { label: 'Bước ngoặt', code: '\\Rightarrow', desc: 'Sự kiện dẫn tới bước ngoặt lịch sử.' },
          { label: 'Tác động qua lại', code: '\\Leftrightarrow', desc: 'Quan hệ tác động hai chiều giữa các yếu tố lịch sử.' },
          { label: 'Thế kỷ XIX', code: '\\text{TK XIX}', desc: 'Thế kỷ mười chín (1801 – 1900).' },
          { label: 'Thế kỷ XX', code: '\\text{TK XX}', desc: 'Thế kỷ hai mươi (1901 – 2000).' },
          { label: 'Thế kỷ XXI', code: '\\text{TK XXI}', desc: 'Thế kỷ hai mươi mốt (2001 – nay).' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Mô hình Phân tích Sự kiện & Niên biểu Lịch sử',
        items: [
          { label: 'Khung phân tích Sự kiện lịch sử', code: '\\text{Bối cảnh} \\rightarrow \\text{Diễn biến chính} \\rightarrow \\text{Kết quả} \\rightarrow \\text{Ý nghĩa và Bài học}', desc: 'Mô hình 4 bước chuẩn phân tích một sự kiện hoặc chiến dịch lịch sử.' },
          { label: 'Trật tự Thế giới Thế kỷ XX', code: '\\text{Ianta (1945)} \\rightarrow \\text{Chiến tranh lạnh (1947–1989)} \\rightarrow \\text{Đa cực (sau 1991)}', desc: 'Tiến trình biến đổi trật tự quan hệ quốc tế sau Chiến tranh thế giới thứ hai.' },
          { label: 'Tiến trình Liên hợp quốc & ASEAN', code: '\\text{LHQ (24/10/1945)} \\cdot \\text{ASEAN (08/08/1967)} \\cdot \\text{Việt Nam gia nhập ASEAN (28/07/1995)}', desc: 'Các mốc thành lập tổ chức quốc tế và khu vực trọng tâm.' },
          { label: 'Mốc son Lịch sử Việt Nam hiện đại', code: '1930\\text{ (Đảng ra đời)} \\rightarrow 1945\\text{ (CMT8)} \\rightarrow 1954\\text{ (Điện Biên Phủ)} \\rightarrow 1975\\text{ (Thống nhất)} \\rightarrow 1986\\text{ (Đổi mới)}', desc: 'Chuỗi mốc lịch sử cốt lõi của cách mạng Việt Nam hiện đại.' }
        ]
      }
    ]
  },

  /* ==========================================================================
   * 7. ĐỊA LÍ
   * ========================================================================== */
  geography: {
    id: 'geography',
    name: 'Địa lí',
    shortName: 'Địa',
    icon: Globe,
    symbolGroups: [
      {
        title: 'Đơn vị & Ký hiệu Địa lí',
        items: [
          { label: 'Phần trăm', code: '\\%', desc: 'Đơn vị tỉ trọng cơ cấu (%).' },
          { label: 'Phần nghìn', code: '\\text{‰}', desc: 'Đơn vị tỉ suất sinh, tỉ suất tử (‰).' },
          { label: 'Độ C', code: '^{\\circ}\\text{C}', desc: 'Đơn vị đo nhiệt độ không khí.' },
          { label: 'Milimét mưa', code: '\\text{mm}', desc: 'Đơn vị đo lượng mưa.' },
          { label: 'Lưu lượng m³/s', code: '\\text{m}^3\\text{/s}', desc: 'Đơn vị đo lưu lượng dòng chảy sông ngòi.' },
          { label: 'Mật độ người/km²', code: '\\text{người/km}^2', desc: 'Đơn vị đo mật độ dân số.' },
          { label: 'Tạ/ha', code: '\\text{tạ/ha}', desc: 'Đơn vị đo năng suất cây trồng.' },
          { label: 'Tỉ USD', code: '\\text{tỉ USD}', desc: 'Đơn vị quy mô GDP hoặc kim ngạch XNK.' },
          { label: 'Độ Vĩ Bắc / Kinh Đông', code: '^{\\circ}\\text{B}, \\; ^{\\circ}\\text{Đ}', desc: 'Ký hiệu tọa độ địa lí vĩ độ Bắc, kinh độ Đông.' }
        ]
      }
    ],
    formulaGroups: [
      {
        title: 'Dân số, Lao động & Đô thị hóa',
        items: [
          { label: 'Mật độ dân số', code: '\\text{MĐDS} = \\frac{\\text{Số dân (người)}}{\\text{Diện tích (km}^2\\text{)}}\\text{ (người/km}^2\\text{)}', desc: 'Tính mật độ dân số trung bình (nhớ đổi triệu người ra người).' },
          { label: 'Tỉ suất gia tăng dân số tự nhiên', code: 'T_g = S - T \\quad (\\% \\text{ hoặc } \\text{‰},\\; 1\\% = 10\\text{‰})', desc: 'Hiệu số giữa tỉ suất sinh thô (S) và tỉ suất tử thô (T).' },
          { label: 'Tỉ lệ dân số thành thị', code: '\\%\\text{ Thành thị} = \\frac{\\text{Dân số thành thị}}{\\text{Tổng số dân}} \\times 100\\%', desc: 'Đánh giá trình độ đô thị hóa theo quy mô dân cư.' },
          { label: 'Tỉ số giới tính', code: '\\text{Tỉ số giới tính} = \\frac{\\text{Dân số nam}}{\\text{Dân số nữ}} \\times 100\\text{ (nam/100 nữ)}', desc: 'Số nam tương ứng với 100 nữ.' }
        ]
      },
      {
        title: 'Khí hậu & Thủy văn',
        items: [
          { label: 'Nhiệt độ trung bình năm', code: '\\bar{T} = \\frac{\\sum_{i=1}^{12} T_i}{12}\\text{ (}^{\\circ}\\text{C)}', desc: 'Tổng nhiệt độ trung bình 12 tháng chia cho 12.' },
          { label: 'Biên độ nhiệt độ năm', code: '\\Delta T = T_{\\max} - T_{\\min}\\text{ (}^{\\circ}\\text{C)}', desc: 'Hiệu số giữa nhiệt độ tháng cao nhất và tháng thấp nhất.' },
          { label: 'Tổng lượng mưa năm & Cân bằng ẩm', code: 'P_{\\text{năm}} = \\sum_{i=1}^{12} P_i\\text{ (mm)}, \\quad \\text{Cân bằng ẩm} = P - E\\text{ (mm)}', desc: 'Tổng lượng mưa 12 tháng và hiệu số giữa lượng mưa (P) với lượng bốc hơi (E).' },
          { label: 'Lưu lượng nước trung bình & Tháng lũ', code: '\\bar{Q} = \\frac{\\sum_{i=1}^{12} Q_i}{12}\\text{ (m}^3\\text{/s)}', desc: 'Các tháng có lưu lượng Qᵢ > Q̄ liên tiếp tạo thành mùa lũ.' }
        ]
      },
      {
        title: 'Kinh tế, Thương mại, Nông nghiệp & Biểu đồ',
        items: [
          { label: 'Cán cân & Tổng kim ngạch Xuất nhập khẩu', code: '\\text{Cán cân XNK} = \\text{XK} - \\text{NK}, \\quad \\text{Tổng XNK} = \\text{XK} + \\text{NK}', desc: 'Cán cân thương mại (>0: xuất siêu, <0: nhập siêu).' },
          { label: 'Tỉ lệ Xuất nhập khẩu', code: '\\text{Tỉ lệ XK/NK} = \\frac{\\text{Giá trị Xuất khẩu}}{\\text{Giá trị Nhập khẩu}} \\times 100\\%', desc: 'Tỉ số phần trăm giữa giá trị xuất khẩu so với nhập khẩu.' },
          { label: 'Tỉ trọng cơ cấu & Tốc độ tăng trưởng', code: '\\%_i = \\frac{\\text{Giá trị } i}{\\text{Tổng}} \\times 100\\%, \\quad \\text{TĐTT} = \\frac{Y_n}{Y_0} \\times 100\\%', desc: 'Công thức xử lý số liệu vẽ biểu đồ tròn, miền (cơ cấu) và đường (tăng trưởng).' },
          { label: 'Thu nhập GDP bình quân đầu người', code: '\\text{GDP/người} = \\frac{\\text{Tổng GDP (USD)}}{\\text{Tổng số dân (người)}}\\text{ (USD/người)}', desc: 'Chỉ tiêu phản ánh mức sống và quy mô kinh tế theo dân số.' },
          { label: 'Năng suất cây trồng & Bình quân lương thực', code: '\\text{Năng suất} = \\frac{\\text{Sản lượng}}{\\text{Diện tích}}, \\quad \\text{BQLT} = \\frac{\\text{Sản lượng (kg)}}{\\text{Số dân (người)}}', desc: 'Công thức tính năng suất lúa (tạ/ha hoặc tấn/ha) và bình quân lương thực (kg/người).' },
          { label: 'Độ che phủ rừng & Bán kính biểu đồ tròn', code: 'R_{\\text{rừng}}\\% = \\frac{S_{\\text{rừng}}}{S_{\\text{tự nhiên}}} \\times 100\\%, \\quad R_n = R_1 \\sqrt{\\frac{S_n}{S_1}}', desc: 'Tỉ lệ độ che phủ rừng và bán kính biểu đồ tròn theo quy mô.' },
          { label: 'Cự li vận chuyển trung bình', code: '\\text{Cự li TB} = \\frac{\\text{Khối lượng luân chuyển (tấn.km)}}{\\text{Khối lượng vận chuyển (tấn)}}\\text{ (km)}', desc: 'Tính cự li vận chuyển hàng hóa hoặc hành khách trung bình.' }
        ]
      }
    ]
  }
};

// Backwards-compatible alias
export const HIERARCHICAL_CATALOG = SUBJECT_PALETTE_CATALOG;

const SUBJECT_KEYS = Object.keys(SUBJECT_PALETTE_CATALOG);

/**
 * Normalize Vietnamese diacritics + LaTeX formatting so typing "H2SO4", "ca(oh)2", "este", "glucozo",
 * "ket tua", "trang bac", "dao ham", "punnett", etc. matches 100% accurately!
 */
export function normalizePaletteSearchKey(str = '') {
  return String(str)
    .normalize('NFC')
    .toLowerCase()
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:quad|qquad|cdot|times|rightarrow|rightleftharpoons|uparrow|downarrow)/g, ' ')
    .replace(/[_^{}\\]/g, '')
    .replace(/[-–—]/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesPaletteItem(item, rawQuery, groupTitle = '') {
  if (!rawQuery) return true;
  const qRaw = rawQuery.trim().toLowerCase();
  const qNorm = normalizePaletteSearchKey(rawQuery);
  const qCompact = qNorm.replace(/\s+/g, '');

  const labelLower = (item.label || '').toLowerCase();
  const descLower = (item.desc || '').toLowerCase();
  const codeLower = (item.code || '').toLowerCase();
  const groupLower = (groupTitle || '').toLowerCase();

  if (
    labelLower.includes(qRaw) ||
    descLower.includes(qRaw) ||
    codeLower.includes(qRaw) ||
    groupLower.includes(qRaw)
  ) {
    return true;
  }

  const labelNorm = normalizePaletteSearchKey(item.label || '');
  const descNorm = normalizePaletteSearchKey(item.desc || '');
  const codeNorm = normalizePaletteSearchKey(item.code || '');
  const groupNorm = normalizePaletteSearchKey(groupTitle || '');
  const codeCompact = codeNorm.replace(/\s+/g, '');

  return (
    labelNorm.includes(qNorm) ||
    descNorm.includes(qNorm) ||
    codeNorm.includes(qNorm) ||
    groupNorm.includes(qNorm) ||
    (qCompact.length >= 2 && codeCompact.includes(qCompact))
  );
}

export default function HierarchicalMathPalette({
  isCollapsed = false,
  onToggleCollapse,
  activeTarget = 'theoryRecap',
  onInsertSnippet,
  initialSubject = 'math'
}) {
  const [selectedSubject, setSelectedSubject] = useState(
    SUBJECT_PALETTE_CATALOG[initialSubject] ? initialSubject : 'math'
  );
  // Two clean tabs right underneath Subject: 'symbols' (Ký hiệu) | 'formulas' (Công thức & Hợp chất)
  const [activeTab, setActiveTab] = useState('formulas');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Rich Hover Preview Card state
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverPos, setHoverPos] = useState({ top: 80, left: 265 });
  const hoverTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);

  useEffect(() => {
    if (initialSubject && SUBJECT_PALETTE_CATALOG[initialSubject]) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    };
  }, []);

  const currentSubject = SUBJECT_PALETTE_CATALOG[selectedSubject] || SUBJECT_PALETTE_CATALOG.math;

  // Flatten counts for tab badges
  const symbolTotalCount = useMemo(
    () => (currentSubject.symbolGroups || []).reduce((acc, g) => acc + (g.items?.length || 0), 0),
    [currentSubject]
  );
  const formulaTotalCount = useMemo(
    () => (currentSubject.formulaGroups || []).reduce((acc, g) => acc + (g.items?.length || 0), 0),
    [currentSubject]
  );

  // Filtered groups for current tab (or deep search across current subject + cross-subject fallback when query is typed)
  const activeGroups = useMemo(() => {
    const rawGroups =
      activeTab === 'symbols' ? currentSubject.symbolGroups || [] : currentSubject.formulaGroups || [];
    const q = searchQuery.trim();
    if (!q) return rawGroups;

    // 1. Search across BOTH Ký hiệu and Công thức of the selected subject
    const subjectGroups = [
      ...(currentSubject.symbolGroups || []).map(g => ({ ...g, tabType: 'symbols' })),
      ...(currentSubject.formulaGroups || []).map(g => ({ ...g, tabType: 'formulas' }))
    ]
      .map(group => ({
        ...group,
        items: (group.items || []).filter(item => matchesPaletteItem(item, q, group.title))
      }))
      .filter(group => group.items.length > 0);

    // 2. Also gather matches from other subjects so user can find anything even if another subject is active
    const otherSubjectGroups = [];
    SUBJECT_KEYS.forEach((subjKey) => {
      if (subjKey === selectedSubject) return;
      const subj = SUBJECT_PALETTE_CATALOG[subjKey];
      const matchedItems = [
        ...(subj.symbolGroups || []).flatMap(g => (g.items || []).filter(item => matchesPaletteItem(item, q, g.title))),
        ...(subj.formulaGroups || []).flatMap(g => (g.items || []).filter(item => matchesPaletteItem(item, q, g.title)))
      ];

      if (matchedItems.length > 0) {
        otherSubjectGroups.push({
          title: `${subj.name} (${matchedItems.length})`,
          tabType: 'formulas',
          items: matchedItems
        });
      }
    });

    return [...subjectGroups, ...otherSubjectGroups];
  }, [currentSubject, selectedSubject, activeTab, searchQuery]);

  const handleToggleGroup = (groupTitle, gIdx = 0) => {
    const key = `${selectedSubject}-${activeTab}-${groupTitle}`;
    setCollapsedGroups(prev => {
      const currentCollapsed = prev[key] !== undefined ? Boolean(prev[key]) : gIdx !== 0;
      return { ...prev, [key]: !currentCollapsed };
    });
  };

  const handleExpandCollapseAll = (collapse) => {
    const rawGroups =
      activeTab === 'symbols' ? currentSubject.symbolGroups || [] : currentSubject.formulaGroups || [];
    const next = { ...collapsedGroups };
    rawGroups.forEach(g => {
      next[`${selectedSubject}-${activeTab}-${g.title}`] = collapse;
    });
    setCollapsedGroups(next);
  };

  const handleInsert = (item) => {
    if (!item?.code || !onInsertSnippet) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
    onInsertSnippet(activeTarget, item.code);
  };

  const handleDragStart = (e, item) => {
    if (!item?.code) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
    e.dataTransfer.setData('text/veval-math', item.code);
    e.dataTransfer.setData('text/plain', item.code);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleMouseEnterItem = (e, item, groupTitle) => {
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      const top = Math.min(Math.max(16, rect.top - 12), Math.max(16, window.innerHeight - 260));
      const left = Math.min(window.innerWidth - 360, rect.right + 12);
      setHoverPos({ top, left });
      setHoveredItem({ ...item, groupTitle, subjectName: currentSubject.name });
    }, 140);
  };

  const handleMouseLeaveItem = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 220);
  };

  // Collapsed slim rail
  if (isCollapsed) {
    return (
      <aside className="w-11 bg-white border-r border-[#E7E5DF] flex flex-col items-center py-3 gap-2 shrink-0 select-none z-10">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg bg-[#F7F6F2] hover:bg-[#EEF2F7] text-slate-600 hover:text-[#1E3A5F] border border-[#E5E3DC] flex items-center justify-center transition-colors cursor-pointer"
          title="Mở bảng ký hiệu & công thức"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-5 h-px bg-[#E7E5DF] my-0.5" />

        {SUBJECT_KEYS.map((key) => {
          const subj = SUBJECT_PALETTE_CATALOG[key];
          const Icon = subj.icon;
          const isActive = selectedSubject === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedSubject(key);
                if (onToggleCollapse) onToggleCollapse();
              }}
              title={subj.name}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A5F] text-white shadow-2xs'
                  : 'text-slate-500 hover:bg-[#F4F3EE] hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </aside>
    );
  }

  return (
    <aside className="w-64 sm:w-[272px] bg-white border-r border-[#E7E5DF] flex flex-col shrink-0 select-none h-full min-h-0 overflow-hidden z-10">
      {/* 1. TOP: SUBJECT SELECTOR */}
      <div className="px-3 pt-3 pb-2.5 border-b border-[#ECEAE4] space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="relative flex-1">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 pr-7 rounded-xl bg-[#F7F6F2] hover:bg-[#F0EFE9] border border-[#E2E0D8] text-xs font-semibold text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#2C4C7E]/25 cursor-pointer transition-colors"
            >
              {SUBJECT_KEYS.map((key) => (
                <option key={key} value={key}>
                  Môn: {SUBJECT_PALETTE_CATALOG[key].name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F4F3EE] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Thu gọn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 2. SPLIT SEGMENTED TABS: KÝ HIỆU | CÔNG THỨC */}
        <div className="grid grid-cols-2 p-0.5 rounded-xl bg-[#F4F3EE] border border-[#E7E5DF]">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveTab('symbols')}
            className={`py-1.5 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'symbols'
                ? 'bg-white text-[#1E3A5F] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Ký hiệu</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EEF2F7] text-[#2C4C7E]">
              {symbolTotalCount}
            </span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveTab('formulas')}
            className={`py-1.5 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'formulas'
                ? 'bg-white text-[#1E3A5F] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Công thức</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EEF2F7] text-[#2C4C7E]">
              {formulaTotalCount}
            </span>
          </button>
        </div>

        {/* 3. INSTANT DEEP SEARCH + EXPAND/COLLAPSE ALL */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm trong ${currentSubject.name} (VD: H2SO4, este, đạo hàm)...`}
              className="w-full bg-[#FAF9F6] focus:bg-white border border-[#E7E5DF] focus:border-[#2C4C7E]/50 rounded-lg pl-8 pr-6 py-1.5 text-[11px] text-slate-700 placeholder-slate-400 outline-none transition-all"
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

          {!searchQuery && (
            <div className="flex items-center justify-between px-0.5 text-[10px] text-slate-400">
              <span>{activeGroups.length} chuyên mục</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleExpandCollapseAll(false)}
                  className="hover:text-[#1E3A5F] font-medium cursor-pointer"
                >
                  Mở hết
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleExpandCollapseAll(true)}
                  className="hover:text-[#1E3A5F] font-medium cursor-pointer"
                >
                  Thu gọn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CATEGORIZED ACCORDION BODY */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
        {activeGroups.length === 0 ? (
          <div className="py-10 px-4 text-center text-xs text-slate-400">
            Không tìm thấy ký hiệu, hợp chất hoặc công thức phù hợp.
          </div>
        ) : (
          activeGroups.map((group, gIdx) => {
            const collapseKey = `${selectedSubject}-${activeTab}-${group.title}`;
            const isGroupCollapsed = searchQuery
              ? false
              : (collapsedGroups[collapseKey] !== undefined ? Boolean(collapsedGroups[collapseKey]) : gIdx !== 0);
            const renderAsGrid = (group.tabType || activeTab) === 'symbols';

            return (
              <div
                key={`${selectedSubject}-grp-${gIdx}-${group.title}`}
                className="rounded-xl border border-[#EAE8E1] bg-white overflow-hidden"
              >
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleToggleGroup(group.title, gIdx)}
                  className="w-full px-2.5 py-2 bg-[#FAF9F6] hover:bg-[#F3F2EC] flex items-center justify-between gap-1.5 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                        !isGroupCollapsed ? 'rotate-90 text-[#2C4C7E]' : ''
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {group.title}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full bg-white border border-[#E7E5DF] text-[9.5px] font-semibold text-slate-500 shrink-0">
                    {group.items.length}
                  </span>
                </button>

                {/* Accordion Group Items */}
                {!isGroupCollapsed && (
                  <div className="p-2 bg-white border-t border-[#F2F0E8]">
                    {renderAsGrid ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {group.items.map((item, idx) => (
                          <button
                            key={`${selectedSubject}-sym-${gIdx}-${idx}`}
                            type="button"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleInsert(item)}
                            onMouseEnter={(e) => handleMouseEnterItem(e, item, group.title)}
                            onMouseLeave={handleMouseLeaveItem}
                            className="min-h-[42px] px-1.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#EEF2F7] border border-[#EAE8E1] hover:border-[#2C4C7E]/40 text-slate-800 hover:text-[#1E3A5F] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95"
                          >
                            <span
                              className="text-[12.5px] leading-none pointer-events-none overflow-hidden max-w-full"
                              dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.code, false) }}
                            />
                            <span className="text-[9px] text-slate-500 truncate max-w-full leading-tight">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {group.items.map((item, idx) => (
                          <button
                            key={`${selectedSubject}-f-${gIdx}-${idx}`}
                            type="button"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleInsert(item)}
                            onMouseEnter={(e) => handleMouseEnterItem(e, item, group.title)}
                            onMouseLeave={handleMouseLeaveItem}
                            className="w-full text-left px-2.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#EEF2F7]/85 border border-[#EAE8E1] hover:border-[#2C4C7E]/40 transition-all cursor-pointer group active:scale-[0.99]"
                          >
                            <div className="text-[10.5px] font-semibold text-slate-600 group-hover:text-[#1E3A5F] mb-1 truncate">
                              {item.label}
                            </div>
                            <div
                              className="text-[12.5px] text-slate-900 overflow-x-auto scrollbar-none pointer-events-none"
                              dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.code, false) }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. SCHOLARLY HOVER PREVIEW CARD (PORTAL) */}
      {hoveredItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
            }}
            onMouseLeave={handleMouseLeaveItem}
            style={{ top: `${hoverPos.top}px`, left: `${hoverPos.left}px`, position: 'fixed' }}
            className="z-[99999] w-80 bg-white rounded-2xl border border-[#DCE4F0] shadow-[0_12px_36px_rgba(15,23,42,0.14)] p-3.5 text-slate-800 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#ECEAE4] text-[10.5px] text-slate-500">
              <span className="font-semibold text-[#1E3A5F] truncate">{hoveredItem.subjectName}</span>
              <span className="truncate">{hoveredItem.groupTitle}</span>
            </div>

            <div className="py-3 px-3 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4] flex items-center justify-center min-h-[54px] overflow-x-auto">
              <div
                className="text-base text-slate-900"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(hoveredItem.code, false) }}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-900">{hoveredItem.label}</div>
              {hoveredItem.desc && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{hoveredItem.desc}</p>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsert(hoveredItem)}
                className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#162C49] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Chèn vào bài</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}
