import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { renderKatexHtml } from '../common/MathText';

/**
 * HIERARCHICAL SUBJECT & FORMULA CATALOG
 * Level 1: Domain / Subject (Toán, Hóa, Lý, Ký hiệu đặc biệt)
 * Level 2: Category (Đại số, Hình học, Nồng độ, Số oxi hóa, v.v.)
 * Level 3: Formula / Symbol items with rich pedagogical descriptions
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
          { 
            label: 'Phân số a/b', 
            code: '\\frac{a}{b}', 
            preview: '\\frac{a}{b}',
            desc: 'Phân số đại số 2 tầng (tử số / mẫu số). Cho phép click sửa số tại chỗ hoặc bấm tính.',
            latexNote: '\\frac{tử}{mẫu}'
          },
          { 
            label: 'Phân số có số 12/4', 
            code: '\\frac{12}{4} = 3', 
            preview: '\\frac{12}{4}',
            desc: 'Phân số số học có sẵn số cụ thể và kết quả thương số. Nhấp để thay đổi số.',
            latexNote: '\\frac{12}{4} = 3'
          },
          { 
            label: 'Căn bậc hai √x', 
            code: '\\sqrt{x}', 
            preview: '\\sqrt{x}',
            desc: 'Căn bậc hai số học chuẩn SGK. Hỗ trợ tự động tính căn bậc hai khi nhập số.',
            latexNote: '\\sqrt{biểu_thức}'
          },
          { 
            label: 'Căn bậc n', 
            code: '\\sqrt[n]{x}', 
            preview: '\\sqrt[n]{x}',
            desc: 'Căn bậc n tổng quát với chỉ số bậc căn n và biểu thức dưới dấu căn.',
            latexNote: '\\sqrt[n]{x}'
          },
          { 
            label: 'Số mũ x²', 
            code: 'x^2', 
            preview: 'x^2',
            desc: 'Lũy thừa bậc hai (bình phương). Click cơ số hoặc số mũ để chỉnh sửa.',
            latexNote: 'x^2'
          },
          { 
            label: 'Số mũ tổng quát xⁿ', 
            code: 'x^{n}', 
            preview: 'x^{n}',
            desc: 'Lũy thừa bậc n với số mũ tự do (số nguyên, phân số hoặc biểu thức).',
            latexNote: 'x^{n}'
          },
          { 
            label: 'Chỉ số dưới x₀', 
            code: 'x_0', 
            preview: 'x_0',
            desc: 'Chỉ số tọa độ điểm ban đầu hoặc nghiệm đặc biệt trong giải tích SGK.',
            latexNote: 'x_0'
          },
          { 
            label: 'Trị tuyệt đối |x|', 
            code: '|x|', 
            preview: '|x|',
            desc: 'Dấu giá trị tuyệt đối hai vạch thẳng đứng song song quanh biểu thức.',
            latexNote: '|x|'
          },
          { 
            label: 'Hằng đẳng thức (a+b)²', 
            code: '(a + b)^2 = a^2 + 2ab + b^2', 
            preview: '(a+b)^2',
            desc: 'Hằng đẳng thức bình phương của một tổng trong chương trình Đại số phổ thông.',
            latexNote: '(a+b)^2 = a^2+2ab+b^2'
          }
        ]
      },
      calculus: {
        name: 'Đạo hàm & Giải tích',
        items: [
          { 
            label: 'Đạo hàm số gia f\'(x₀)', 
            code: 'f\'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}', 
            preview: 'f\'(x_0)',
            desc: 'Định nghĩa đạo hàm bằng giới hạn tỉ số gia số của hàm số và gia số của đối số chuẩn SGK Toán 11-12.',
            latexNote: 'f\'(x_0) = \\lim_{\\Delta x \\to 0}...'
          },
          { 
            label: 'Đạo hàm y\'', 
            code: 'y\' = f\'(x)', 
            preview: 'y\'',
            desc: 'Ký hiệu đạo hàm cấp 1 theo biến x dùng trong khảo sát sự biến thiên hàm số.',
            latexNote: 'y\' = f\'(x)'
          },
          { 
            label: 'Giới hạn lim', 
            code: '\\lim_{x \\to x_0} f(x)', 
            preview: '\\lim',
            desc: 'Giới hạn của hàm số f(x) khi x tiến dần về điểm x₀ hoặc vô cực.',
            latexNote: '\\lim_{x \\to x_0} f(x)'
          },
          { 
            label: 'Tích phân xác định', 
            code: '\\int_{a}^{b} f(x) dx', 
            preview: '\\int',
            desc: 'Tích phân xác định từ cận dưới a đến cận trên b tính diện tích hình phẳng.',
            latexNote: '\\int_{a}^{b} f(x) dx'
          },
          { 
            label: 'Vi phân dy/dx', 
            code: '\\frac{dy}{dx}', 
            preview: '\\frac{dy}{dx}',
            desc: 'Ký hiệu Leibniz vi phân thương số dy trên dx.',
            latexNote: '\\frac{dy}{dx}'
          },
          { 
            label: 'Tổng Sigma ∑', 
            code: '\\sum_{i=1}^{n} x_i', 
            preview: '\\sum',
            desc: 'Phép lấy tổng liên tiếp các phần tử từ chỉ số dưới i=1 đến n.',
            latexNote: '\\sum_{i=1}^{n} x_i'
          }
        ]
      },
      geometry: {
        name: 'Hình học & Oxyz',
        items: [
          { 
            label: 'Vectơ u', 
            code: '\\vec{u}', 
            preview: '\\vec{u}',
            desc: 'Vectơ có hướng mũi tên phía trên trong hình học không gian Oxyz.',
            latexNote: '\\vec{u}'
          },
          { 
            label: 'Độ dài vectơ |AB|', 
            code: '|\\vec{AB}|', 
            preview: '|\\vec{AB}|',
            desc: 'Độ dài đoạn thẳng định hướng nối từ điểm A đến điểm B.',
            latexNote: '|\\vec{AB}|'
          },
          { 
            label: 'Góc ∠ABC', 
            code: '\\angle ABC', 
            preview: '\\angle ABC',
            desc: 'Ký hiệu góc hình học tạo bởi hai tia BA và BC.',
            latexNote: '\\angle ABC'
          },
          { 
            label: 'Song song ∥', 
            code: '\\parallel', 
            preview: '\\parallel',
            desc: 'Ký hiệu hai đường thẳng hoặc hai mặt phẳng song song với nhau.',
            latexNote: '\\parallel'
          },
          { 
            label: 'Vuông góc ⊥', 
            code: '\\perp', 
            preview: '\\perp',
            desc: 'Ký hiệu hai đường thẳng hoặc đường thẳng vuông góc với mặt phẳng.',
            latexNote: '\\perp'
          },
          { 
            label: 'Mặt phẳng (α)', 
            code: '(\\alpha)', 
            preview: '(\\alpha)',
            desc: 'Ký hiệu mặt phẳng đặt tên theo ký tự Hy Lạp trong hình học không gian.',
            latexNote: '(\\alpha)'
          },
          { 
            label: 'Mặt cầu (S)', 
            code: '(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2', 
            preview: '(S)',
            desc: 'Phương trình chính tắc của mặt cầu tâm I(a,b,c) bán kính R trong không gian Oxyz.',
            latexNote: '(S): (x-a)^2 + ... = R^2'
          }
        ]
      },
      trigonometry: {
        name: 'Lượng giác',
        items: [
          { label: 'sin x', code: '\\sin x', preview: '\\sin x', desc: 'Hàm số lượng giác sin x chu kỳ 2π.', latexNote: '\\sin x' },
          { label: 'cos x', code: '\\cos x', preview: '\\cos x', desc: 'Hàm số lượng giác cosin x chu kỳ 2π.', latexNote: '\\cos x' },
          { label: 'tan x', code: '\\tan x', preview: '\\tan x', desc: 'Hàm số lượng giác tang x (sin x / cos x).', latexNote: '\\tan x' },
          { label: 'cot x', code: '\\cot x', preview: '\\cot x', desc: 'Hàm số lượng giác côtang x (cos x / sin x).', latexNote: '\\cot x' },
          { label: 'sin²x + cos²x = 1', code: '\\sin^2 x + \\cos^2 x = 1', preview: '\\sin^2+\\cos^2', desc: 'Công thức lượng giác cơ bản trong tam giác vuông.', latexNote: '\\sin^2 x + \\cos^2 x = 1' }
        ]
      },
      logic_sets: {
        name: 'Tập hợp & Logic',
        items: [
          { label: 'Suy ra ⇒', code: '\\Rightarrow', preview: '\\Rightarrow', desc: 'Mệnh đề kéo theo A suy ra B trong suy luận toán học.', latexNote: '\\Rightarrow' },
          { label: 'Tương đương ⇔', code: '\\Leftrightarrow', preview: '\\Leftrightarrow', desc: 'Mệnh đề tương đương (nếu và chỉ nếu) hai chiều.', latexNote: '\\Leftrightarrow' },
          { label: 'Với mọi ∀', code: '\\forall x \\in D', preview: '\\forall', desc: 'Lượng từ phổ dụng: Đúng với mọi phần tử thuộc tập xác định D.', latexNote: '\\forall x \\in D' },
          { label: 'Tồn tại ∃', code: '\\exists x', preview: '\\exists', desc: 'Lượng từ tồn tại: Tồn tại ít nhất một phần tử thỏa mãn tính chất.', latexNote: '\\exists x' },
          { label: 'Thuộc ∈', code: '\\in', preview: '\\in', desc: 'Ký hiệu quan hệ phần tử thuộc vào một tập hợp.', latexNote: '\\in' },
          { label: 'Không thuộc ∉', code: '\\notin', preview: '\\notin', desc: 'Ký hiệu quan hệ phần tử không thuộc tập hợp.', latexNote: '\\notin' },
          { label: 'Tập số thực R', code: '\\mathbb{R}', preview: '\\mathbb{R}', desc: 'Tập hợp tất cả các số thực trên trục số.', latexNote: '\\mathbb{R}' }
        ]
      },
      probability: {
        name: 'Xác suất & Thống kê',
        items: [
          { label: 'Tổ hợp C(n, k)', code: 'C_n^k', preview: 'C_n^k', desc: 'Số tổ hợp chập k của n phần tử không tính thứ tự.', latexNote: 'C_n^k' },
          { label: 'Chỉnh hợp A(n, k)', code: 'A_n^k', preview: 'A_n^k', desc: 'Số chỉnh hợp chập k của n phần tử có thứ tự sắp xếp.', latexNote: 'A_n^k' },
          { label: 'Giai thừa n!', code: 'n!', preview: 'n!', desc: 'Tích các số tự nhiên liên tiếp từ 1 đến n.', latexNote: 'n!' },
          { label: 'Xác suất P(A)', code: 'P(A) = \\frac{n(A)}{n(\\Omega)}', preview: 'P(A)', desc: 'Xác suất cổ điển biến cố A trên không gian mẫu Omega.', latexNote: 'P(A) = \\frac{n(A)}{n(\\Omega)}' }
        ]
      }
    }
  },
  chem: {
    name: 'Hóa Học',
    shortName: 'Hóa',
    icon: '🧪',
    badgeColor: 'teal',
    categories: {
      concentration: {
        name: 'Nồng độ & Khối lượng',
        items: [
          { 
            label: 'Nồng độ CM = n/V', 
            code: 'C_M = \\frac{n}{V} = \\frac{0.2}{0.5} = 0.4\\text{ M}', 
            preview: 'C_M=\\frac{n}{V}',
            desc: 'Nồng độ mol dung dịch bằng số mol chất tan chia thể tích dung dịch (Lít). Có ô sửa số và tự tính.',
            latexNote: 'C_M = \\frac{n}{V}'
          },
          { 
            label: 'Nồng độ C%', 
            code: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%', 
            preview: 'C\\%',
            desc: 'Nồng độ phần trăm khối lượng chất tan trên khối lượng dung dịch nhân 100%.',
            latexNote: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%'
          },
          { 
            label: 'Khối lượng m = n×M', 
            code: 'm = n \\times M', 
            preview: 'm=n\\times M',
            desc: 'Khối lượng chất bằng số mol nhân khối lượng mol phân tử (gam).',
            latexNote: 'm = n \\times M'
          },
          { 
            label: 'Hiệu suất H%', 
            code: 'H = \\frac{m_{tt}}{m_{lt}} \\times 100\\%', 
            preview: 'H\\%',
            desc: 'Hiệu suất phản ứng hóa học tính bằng khối lượng thực tế chia lý thuyết nhân 100%.',
            latexNote: 'H = \\frac{m_{tt}}{m_{lt}} \\times 100\\%'
          },
          { 
            label: 'Thể tích khí chuẩn V', 
            code: 'V = n \\times 24.79', 
            preview: 'V=n\\times 24.79',
            desc: 'Thể tích khí ở điều kiện chuẩn (đkc 25°C, 1 bar) theo chương trình GDPT 2018.',
            latexNote: 'V = n \\times 24.79'
          }
        ]
      },
      oxidation: {
        name: 'Số Oxi Hóa',
        items: [
          { label: 'Số oxi hóa 0', code: '0', preview: '0', desc: 'Số oxi hóa của đơn chất tự do (ví dụ Cu, H₂, O₂).', latexNote: '0' },
          { label: 'Số oxi hóa +1', code: '+1', preview: '+1', desc: 'Số oxi hóa thông thường của H và kim loại kiềm nhóm IA.', latexNote: '+1' },
          { label: 'Số oxi hóa +2', code: '+2', preview: '+2', desc: 'Số oxi hóa của kim loại kiềm thổ nhóm IIA, Zn, Fe(II).', latexNote: '+2' },
          { label: 'Số oxi hóa +3', code: '+3', preview: '+3', desc: 'Số oxi hóa của nhôm Al, sắt Fe(III).', latexNote: '+3' },
          { label: 'Số oxi hóa +6', code: '+6', preview: '+6', desc: 'Số oxi hóa cực đại của lưu huỳnh S trong phân tử H₂SO₄.', latexNote: '+6' },
          { label: 'Số oxi hóa -1', code: '-1', preview: '-1', desc: 'Số oxi hóa của halogen trong hợp chất halide.', latexNote: '-1' },
          { label: 'Số oxi hóa -2', code: '-2', preview: '-2', desc: 'Số oxi hóa thông thường của nguyên tố oxi trong oxit.', latexNote: '-2' }
        ]
      },
      ions: {
        name: 'Ion & Điện tích',
        items: [
          { label: 'H⁺ (Cation hydro)', code: 'H^+', preview: 'H^+', desc: 'Cation hydro quyết định tính axit trong dung dịch nước.', latexNote: 'H^+' },
          { label: 'OH⁻ (Anion hidroxit)', code: 'OH^-', preview: 'OH^-', desc: 'Anion hidroxit quyết định tính bazơ (kiềm).', latexNote: 'OH^-' },
          { label: 'Fe²⁺ (Sắt II)', code: 'Fe^{2+}', preview: 'Fe^{2+}', desc: 'Cation sắt mang 2 điện tích dương.', latexNote: 'Fe^{2+}' },
          { label: 'Fe³⁺ (Sắt III)', code: 'Fe^{3+}', preview: 'Fe^{3+}', desc: 'Cation sắt mang 3 điện tích dương.', latexNote: 'Fe^{3+}' },
          { label: 'SO₄²⁻ (Sunfat)', code: 'SO_4^{2-}', preview: 'SO_4^{2-}', desc: 'Gốc axit sunfat trong dung dịch muối hoặc axit sunfuric.', latexNote: 'SO_4^{2-}' },
          { label: 'NO₃⁻ (Nitrat)', code: 'NO_3^-', preview: 'NO_3^-', desc: 'Gốc axit nitrat trong muối tan và axit nitric.', latexNote: 'NO_3^-' },
          { label: 'CO₃²⁻ (Cacbonat)', code: 'CO_3^{2-}', preview: 'CO_3^{2-}', desc: 'Gốc axit cacbonat tạo kết tủa trắng với Ca²⁺ hoặc Ba²⁺.', latexNote: 'CO_3^{2-}' }
        ]
      },
      compounds: {
        name: 'Hợp chất phổ biến',
        items: [
          { label: 'H₂SO₄ (Axit sunfuric)', code: 'H_2SO_4', preview: 'H_2SO_4', desc: 'Axit sunfuric đậm đặc hoặc loãng chuẩn SGK Hóa.', latexNote: 'H_2SO_4' },
          { label: 'HNO₃ (Axit nitric)', code: 'HNO_3', preview: 'HNO_3', desc: 'Axit nitric có tính oxi hóa mạnh.', latexNote: 'HNO_3' },
          { label: 'H₂O (Nước)', code: 'H_2O', preview: 'H_2O', desc: 'Phân tử nước dung môi phổ biến.', latexNote: 'H_2O' },
          { label: 'NaOH (Xút ăn da)', code: 'NaOH', preview: 'NaOH', desc: 'Natri hidroxit dung dịch bazơ mạnh.', latexNote: 'NaOH' },
          { label: 'CO₂ (Khí cacbonic)', code: 'CO_2', preview: 'CO_2', desc: 'Khí cacbonic gây hiệu ứng nhà kính và tạo kết tủa với nước vôi trong.', latexNote: 'CO_2' }
        ]
      },
      reaction_arrows: {
        name: 'Mũi tên phản ứng',
        items: [
          { label: 'Một chiều →', code: '\\rightarrow', preview: '\\rightarrow', desc: 'Phản ứng một chiều diễn ra hoàn toàn.', latexNote: '\\rightarrow' },
          { label: 'Thuận nghịch ⇌', code: '\\rightleftharpoons', preview: '\\rightleftharpoons', desc: 'Cân bằng hóa học phản ứng hai chiều thuận nghịch.', latexNote: '\\rightleftharpoons' },
          { label: 'Đun nóng t°', code: '\\xrightarrow{t^o}', preview: '\\xrightarrow{t^o}', desc: 'Phản ứng hóa học cần điều kiện xúc tác nhiệt độ.', latexNote: '\\xrightarrow{t^o}' },
          { label: 'Kết tủa ↓', code: '\\downarrow', preview: '\\downarrow', desc: 'Chất rắn tạo thành kết tủa lắng xuống đáy dung dịch.', latexNote: '\\downarrow' },
          { label: 'Bay hơi ↑', code: '\\uparrow', preview: '\\uparrow', desc: 'Khí sinh ra bay hơi thoát khỏi bình phản ứng.', latexNote: '\\uparrow' }
        ]
      }
    }
  },
  physics: {
    name: 'Vật Lí',
    shortName: 'Lý',
    icon: '⚡',
    badgeColor: 'amber',
    categories: {
      mechanics: {
        name: 'Cơ học & Dao động',
        items: [
          { label: 'Vận tốc v = s/t', code: 'v = \\frac{s}{t}', preview: 'v=\\frac{s}{t}', desc: 'Công thức tính vận tốc trung bình của chuyển động thẳng đều.', latexNote: 'v = \\frac{s}{t}' },
          { label: 'Gia tốc a', code: 'a = \\frac{v - v_0}{t}', preview: 'a=\\frac{\\Delta v}{t}', desc: 'Gia tốc bằng biến thiên vận tốc theo thời gian.', latexNote: 'a = \\frac{v - v_0}{t}' },
          { label: 'Dao động điều hòa', code: 'x = A \\cos(\\omega t + \\varphi)', preview: 'x=A\\cos(\\omega t+\\varphi)', desc: 'Phương trình dao động điều hòa ly độ x theo thời gian t.', latexNote: 'x = A \\cos(\\omega t + \\varphi)' },
          { label: 'Chu kỳ T', code: 'T = \\frac{2\\pi}{\\omega}', preview: 'T=\\frac{2\\pi}{\\omega}', desc: 'Chu kỳ dao động điều hòa hoặc sóng cơ học.', latexNote: 'T = \\frac{2\\pi}{\\omega}' },
          { label: 'Động năng Wđ', code: 'W_đ = \\frac{1}{2}mv^2', preview: 'W_đ=\\frac{1}{2}mv^2', desc: 'Động năng của vật khối lượng m chuyển động với vận tốc v.', latexNote: 'W_đ = \\frac{1}{2}mv^2' }
        ]
      },
      electricity: {
        name: 'Điện xoay chiều',
        items: [
          { label: 'Định luật Ohm I=U/R', code: 'I = \\frac{U}{R}', preview: 'I=\\frac{U}{R}', desc: 'Cường độ dòng điện qua điện trở R khi đặt điện áp U.', latexNote: 'I = \\frac{U}{R}' },
          { label: 'Tổng trở Z', code: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}', preview: 'Z=\\sqrt{R^2+...}', desc: 'Tổng trở của mạch xoay chiều RLC nối tiếp.', latexNote: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}' },
          { label: 'Công suất P', code: 'P = U I \\cos\\varphi', preview: 'P=UI\\cos\\varphi', desc: 'Công suất tiêu thụ trong mạch xoay chiều với hệ số công suất cosφ.', latexNote: 'P = U I \\cos\\varphi' }
        ]
      }
    }
  },
  symbols: {
    name: 'Ký Tự Đặc Biệt',
    shortName: 'Ký hiệu',
    icon: '🔣',
    badgeColor: 'slate',
    categories: {
      greek: {
        name: 'Ký tự Hy Lạp',
        items: [
          { label: 'alpha (α)', code: '\\alpha', preview: '\\alpha', desc: 'Ký tự alpha thường dùng cho góc hình học hoặc gia tốc góc.', latexNote: '\\alpha' },
          { label: 'beta (β)', code: '\\beta', preview: '\\beta', desc: 'Ký tự beta dùng trong góc hoặc hạt phóng xạ beta.', latexNote: '\\beta' },
          { label: 'gamma (γ)', code: '\\gamma', preview: '\\gamma', desc: 'Ký tự gamma thường dùng trong vật lý hạt nhân.', latexNote: '\\gamma' },
          { label: 'Delta lớn (Δ)', code: '\\Delta', preview: '\\Delta', desc: 'Độ biến thiên, biệt thức Delta phương trình bậc hai.', latexNote: '\\Delta' },
          { label: 'pi (π)', code: '\\pi', preview: '\\pi', desc: 'Hằng số Pi xấp xỉ 3.14159...', latexNote: '\\pi' },
          { label: 'theta (θ)', code: '\\theta', preview: '\\theta', desc: 'Ký hiệu góc trong tọa độ cực và vật lý sóng.', latexNote: '\\theta' },
          { label: 'lambda (λ)', code: '\\lambda', preview: '\\lambda', desc: 'Ký hiệu bước sóng hoặc hằng số phân rã.', latexNote: '\\lambda' },
          { label: 'omega (ω)', code: '\\omega', preview: '\\omega', desc: 'Tần số góc dao động điều hòa (rad/s).', latexNote: '\\omega' },
          { label: 'Omega lớn (Ω)', code: '\\Omega', preview: '\\Omega', desc: 'Đơn vị điện trở Ôm (Ω) hoặc không gian mẫu xác suất.', latexNote: '\\Omega' }
        ]
      },
      operators: {
        name: 'Phép toán & So sánh',
        items: [
          { label: 'Cộng trừ ±', code: '\\pm', preview: '\\pm', desc: 'Dấu cộng hoặc trừ đồng thời, nghiệm kép phương trình.', latexNote: '\\pm' },
          { label: 'Nhân ×', code: '\\times', preview: '\\times', desc: 'Dấu nhân chữ thập cho phép tính số học hoặc tích có hướng.', latexNote: '\\times' },
          { label: 'Chia ÷', code: '\\div', preview: '\\div', desc: 'Dấu chia số học.', latexNote: '\\div' },
          { label: 'Khác ≠', code: '\\neq', preview: '\\neq', desc: 'Dấu khác biệt giữa hai vế phương trình hoặc điều kiện xác định.', latexNote: '\\neq' },
          { label: 'Xấp xỉ ≈', code: '\\approx', preview: '\\approx', desc: 'Dấu xấp xỉ giá trị làm tròn.', latexNote: '\\approx' },
          { label: 'Nhỏ hơn bằng ≤', code: '\\le', preview: '\\le', desc: 'Quan hệ bất đẳng thức nhỏ hơn hoặc bằng.', latexNote: '\\le' },
          { label: 'Lớn hơn bằng ≥', code: '\\ge', preview: '\\ge', desc: 'Quan hệ bất đẳng thức lớn hơn hoặc bằng.', latexNote: '\\ge' },
          { label: 'Vô cực ∞', code: '\\infty', preview: '\\infty', desc: 'Dương vô cực hoặc âm vô cực trong khảo sát giới hạn.', latexNote: '\\infty' },
          { label: 'Chấm nhân ·', code: '\\cdot', preview: '\\cdot', desc: 'Dấu chấm nhân đại số giữa hai biến số hoặc số học.', latexNote: '\\cdot' }
        ]
      }
    }
  }
};

/**
 * COMPACT HIERARCHICAL FORMULA TOOLBAR WITH 2-SECOND HOVER CARD
 * Clean, structured, space-efficient sidebar palette
 */
export default function HierarchicalMathPalette({
  onInsertSnippet,
  isCollapsed = false,
  onToggleCollapse,
  activeTarget = 'theoryRecap'
}) {
  const [selectedDomain, setSelectedDomain] = useState('math');
  const [selectedCategory, setSelectedCategory] = useState('algebra');

  // 2-second hover timer state
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverCardPos, setHoverCardPos] = useState({ top: 100, left: 300 });
  const hoverTimerRef = useRef(null);

  const domainKeys = Object.keys(HIERARCHICAL_CATALOG);
  const currentDomain = HIERARCHICAL_CATALOG[selectedDomain] || HIERARCHICAL_CATALOG.math;
  const categoryKeys = Object.keys(currentDomain.categories);
  const currentCategory = currentDomain.categories[selectedCategory] || currentDomain.categories[categoryKeys[0]];

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // When domain changes, auto-select first category of that domain
  const handleDomainChange = (domKey) => {
    setSelectedDomain(domKey);
    const firstCat = Object.keys(HIERARCHICAL_CATALOG[domKey].categories)[0];
    setSelectedCategory(firstCat);
  };

  // Hover 2s handler
  const handleItemMouseEnter = (item, e) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Exactly 2 seconds (2000ms) hover trigger as requested by user
    hoverTimerRef.current = setTimeout(() => {
      setHoveredItem(item);
      setHoverCardPos({
        top: Math.min(window.innerHeight - 280, Math.max(20, rect.top - 10)),
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

  if (isCollapsed) {
    return (
      <div className="w-11 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 space-y-3 shrink-0 select-none h-full z-20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          title="Mở rộng thanh công cụ ký hiệu"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
        <div className="w-5 h-[1px] bg-slate-800 my-1"></div>
        {domainKeys.map((key) => {
          const dom = HIERARCHICAL_CATALOG[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                handleDomainChange(key);
                if (onToggleCollapse) onToggleCollapse();
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer ${
                selectedDomain === key
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

  return (
    <div className="w-64 sm:w-72 bg-slate-900 text-white border-r border-slate-800 flex flex-col shrink-0 select-none text-xs h-full relative z-20">
      
      {/* Top Header of Palette with Collapse Button */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">
            Ký Hiệu Phân Cấp
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Thu gọn sidebar sang thanh icon siêu mỏng"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* LEVEL 1: DOMAIN TABS (Toán, Hóa, Lý, Ký hiệu) */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-900/90 grid grid-cols-4 gap-1">
        {domainKeys.map((domKey) => {
          const dom = HIERARCHICAL_CATALOG[domKey];
          const isAct = selectedDomain === domKey;
          return (
            <button
              key={domKey}
              type="button"
              onClick={() => handleDomainChange(domKey)}
              className={`py-1.5 px-1 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isAct
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'
              }`}
              title={dom.name}
            >
              <span className="text-sm">{dom.icon}</span>
              <span className="text-[10px] truncate max-w-full">{dom.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* LEVEL 2: CATEGORY PILLS (Đại số, Hình học, Nồng độ, v.v.) */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-950/40">
        {categoryKeys.map((catKey) => {
          const cat = currentDomain.categories[catKey];
          const isAct = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                isAct
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* LEVEL 3: CLEAN HIGH-DENSITY CHIPS (Click để chèn, Di chuột 2 giây hiện công thức to & mô tả) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
        <div className="text-[10px] font-bold text-slate-400 px-1 pb-1 flex items-center justify-between">
          <span>{currentCategory?.name || 'Ký hiệu'}</span>
          <span className="text-slate-500 font-mono text-[9px] flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-cyan-400" />
            <span>Rê chuột 2s xem chi tiết</span>
          </span>
        </div>

        <div className="space-y-1">
          {currentCategory?.items?.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) => handleItemMouseEnter(item, e)}
              onMouseLeave={handleItemMouseLeave}
              className="w-full text-left px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 hover:border-cyan-500/50 border border-slate-700/50 text-slate-200 transition-all flex items-center justify-between gap-2 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {item.label}
                </span>
              </div>
              <div 
                className="text-xs text-cyan-400 font-mono shrink-0 px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800 group-hover:border-cyan-500/40"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.preview || item.code, false) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Nhấp để chèn • Rê chuột 2s xem mô tả SGK</span>
      </div>

      {/* 2-SECOND HOVER CARD (Floating rich preview card) */}
      {hoveredItem && (
        <div
          style={{ 
            top: `${hoverCardPos.top}px`, 
            left: `${hoverCardPos.left}px`,
            position: 'fixed'
          }}
          className="z-[999] w-80 bg-slate-900/98 backdrop-blur-md rounded-2xl border border-cyan-500/60 shadow-2xl p-4 text-white pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10.5px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{currentDomain?.name} • {currentCategory?.name}</span>
            </span>
            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Live KaTeX
            </span>
          </div>

          {/* Big Live KaTeX Formula */}
          <div className="my-3 py-3 px-3 rounded-xl bg-slate-950/90 border border-slate-800 text-center flex items-center justify-center min-h-[60px] shadow-inner">
            <div 
              className="text-lg text-cyan-300 font-serif leading-none"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(hoveredItem.preview || hoveredItem.code, true) }}
            />
          </div>

          {/* Title & Pedagogical Description */}
          <div className="space-y-1">
            <div className="font-extrabold text-[12.5px] text-white">
              {hoveredItem.label}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {hoveredItem.desc || 'Chèn ký hiệu hoặc công thức vào văn bản soạn thảo tại vị trí con trỏ.'}
            </p>
          </div>

          {/* LaTeX Syntax */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-400 font-medium">Mã nguồn LaTeX:</span>
            <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono text-[11px]">
              ${hoveredItem.code}$
            </code>
          </div>

          <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span>⚡ Nhấp chuột để chèn ngay vào vị trí con trỏ</span>
          </div>
        </div>
      )}

    </div>
  );
}
