import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calculator, 
  FlaskConical, 
  Zap, 
  Dna, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  Hash
} from 'lucide-react';
import { renderKatexHtml } from '../common/MathText';

/**
 * HIERARCHICAL SUBJECT & FORMULA CATALOG
 * Level 1: Domain / Subject (Toán, Hóa, Lý, Sinh, Ngữ văn, Ký hiệu đặc biệt)
 * Level 2: Category (Đại số, Hình học, Nồng độ, Số oxi hóa, v.v.)
 * Level 3: Compact Formula / Symbol items
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
          { label: 'Phân số a/b', code: '\\frac{a}{b}', preview: '\\frac{a}{b}' },
          { label: 'Phân số có số 12/4', code: '\\frac{12}{4} = 3', preview: '\\frac{12}{4}' },
          { label: 'Căn bậc hai √x', code: '\\sqrt{x}', preview: '\\sqrt{x}' },
          { label: 'Căn bậc n', code: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}' },
          { label: 'Số mũ x²', code: 'x^2', preview: 'x^2' },
          { label: 'Số mũ tổng quát xⁿ', code: 'x^{n}', preview: 'x^{n}' },
          { label: 'Chỉ số dưới x₀', code: 'x_0', preview: 'x_0' },
          { label: 'Trị tuyệt đối |x|', code: '|x|', preview: '|x|' },
          { label: 'Hằng đẳng thức (a+b)²', code: '(a + b)^2 = a^2 + 2ab + b^2', preview: '(a+b)^2' }
        ]
      },
      calculus: {
        name: 'Đạo hàm & Giải tích',
        items: [
          { label: 'Đạo hàm số gia f\'(x0)', code: 'f\'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}', preview: 'f\'(x_0)' },
          { label: 'Đạo hàm y\'', code: 'y\' = f\'(x)', preview: 'y\'' },
          { label: 'Giới hạn lim', code: '\\lim_{x \\to x_0} f(x)', preview: '\\lim' },
          { label: 'Tích phân xác định', code: '\\int_{a}^{b} f(x) dx', preview: '\\int' },
          { label: 'Vi phân dy/dx', code: '\\frac{dy}{dx}', preview: '\\frac{dy}{dx}' },
          { label: 'Tổng Sigma ∑', code: '\\sum_{i=1}^{n} x_i', preview: '\\sum' }
        ]
      },
      geometry: {
        name: 'Hình học & Oxyz',
        items: [
          { label: 'Vectơ u', code: '\\vec{u}', preview: '\\vec{u}' },
          { label: 'Độ dài vectơ', code: '|\\vec{AB}|', preview: '|\\vec{AB}|' },
          { label: 'Góc ∠ABC', code: '\\angle ABC', preview: '\\angle ABC' },
          { label: 'Song song ∥', code: '\\parallel', preview: '\\parallel' },
          { label: 'Vuông góc ⊥', code: '\\perp', preview: '\\perp' },
          { label: 'Mặt phẳng (α)', code: '(\\alpha)', preview: '(\\alpha)' },
          { label: 'Mặt cầu (S)', code: '(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2', preview: '(S)' }
        ]
      },
      trigonometry: {
        name: 'Lượng giác',
        items: [
          { label: 'sin x', code: '\\sin x', preview: '\\sin x' },
          { label: 'cos x', code: '\\cos x', preview: '\\cos x' },
          { label: 'tan x', code: '\\tan x', preview: '\\tan x' },
          { label: 'cot x', code: '\\cot x', preview: '\\cot x' },
          { label: 'sin²x + cos²x = 1', code: '\\sin^2 x + \\cos^2 x = 1', preview: '\\sin^2+\\cos^2' }
        ]
      },
      logic_sets: {
        name: 'Tập hợp & Logic',
        items: [
          { label: 'Suy ra ⇒', code: '\\Rightarrow', preview: '\\Rightarrow' },
          { label: 'Tương đương ⇔', code: '\\Leftrightarrow', preview: '\\Leftrightarrow' },
          { label: 'Với mọi ∀', code: '\\forall x \\in D', preview: '\\forall' },
          { label: 'Tồn tại ∃', code: '\\exists x', preview: '\\exists' },
          { label: 'Thuộc ∈', code: '\\in', preview: '\\in' },
          { label: 'Không thuộc ∉', code: '\\notin', preview: '\\notin' },
          { label: 'Tập con ⊂', code: '\\subset', preview: '\\subset' },
          { label: 'Tập rỗng ∅', code: '\\emptyset', preview: '\\emptyset' },
          { label: 'Tập số thực R', code: '\\mathbb{R}', preview: '\\mathbb{R}' }
        ]
      },
      probability: {
        name: 'Xác suất & Thống kê',
        items: [
          { label: 'Tổ hợp C(n, k)', code: 'C_n^k', preview: 'C_n^k' },
          { label: 'Chỉnh hợp A(n, k)', code: 'A_n^k', preview: 'A_n^k' },
          { label: 'Giai thừa n!', code: 'n!', preview: 'n!' },
          { label: 'Xác suất P(A)', code: 'P(A) = \\frac{n(A)}{n(\\Omega)}', preview: 'P(A)' },
          { label: 'Số trung bình x̄', code: '\\bar{x}', preview: '\\bar{x}' },
          { label: 'Phương sai s²', code: 's^2', preview: 's^2' }
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
          { label: 'Nồng độ CM = n/V', code: 'C_M = \\frac{n}{V} = \\frac{0.2}{0.5} = 0.4\\text{ M}', preview: 'C_M=\\frac{n}{V}' },
          { label: 'Nồng độ C%', code: 'C\\% = \\frac{m_{ct}}{m_{dd}} \\times 100\\%', preview: 'C\\%' },
          { label: 'Khối lượng m = n×M', code: 'm = n \\times M', preview: 'm=n\\times M' },
          { label: 'Hiệu suất H%', code: 'H = \\frac{m_{tt}}{m_{lt}} \\times 100\\%', preview: 'H\\%' },
          { label: 'Thể tích khí chuẩn V', code: 'V = n \\times 24.79', preview: 'V=n\\times 24.79' }
        ]
      },
      oxidation: {
        name: 'Số Oxi Hóa',
        items: [
          { label: 'Số 0', code: '0', preview: '0' },
          { label: '+1', code: '+1', preview: '+1' },
          { label: '+2', code: '+2', preview: '+2' },
          { label: '+3', code: '+3', preview: '+3' },
          { label: '+4', code: '+4', preview: '+4' },
          { label: '+6', code: '+6', preview: '+6' },
          { label: '-1', code: '-1', preview: '-1' },
          { label: '-2', code: '-2', preview: '-2' }
        ]
      },
      ions: {
        name: 'Ion & Điện tích',
        items: [
          { label: 'H⁺', code: 'H^+', preview: 'H^+' },
          { label: 'OH⁻', code: 'OH^-', preview: 'OH^-' },
          { label: 'Fe²⁺', code: 'Fe^{2+}', preview: 'Fe^{2+}' },
          { label: 'Fe³⁺', code: 'Fe^{3+}', preview: 'Fe^{3+}' },
          { label: 'SO₄²⁻', code: 'SO_4^{2-}', preview: 'SO_4^{2-}' },
          { label: 'NO₃⁻', code: 'NO_3^-', preview: 'NO_3^-' },
          { label: 'Cl⁻', code: 'Cl^-', preview: 'Cl^-' },
          { label: 'CO₃²⁻', code: 'CO_3^{2-}', preview: 'CO_3^{2-}' }
        ]
      },
      compounds: {
        name: 'Hợp chất phổ biến',
        items: [
          { label: 'H₂SO₄', code: 'H_2SO_4', preview: 'H_2SO_4' },
          { label: 'HNO₃', code: 'HNO_3', preview: 'HNO_3' },
          { label: 'H₂O', code: 'H_2O', preview: 'H_2O' },
          { label: 'NaOH', code: 'NaOH', preview: 'NaOH' },
          { label: 'Fe₂O₃', code: 'Fe_2O_3', preview: 'Fe_2O_3' },
          { label: 'CO₂', code: 'CO_2', preview: 'CO_2' }
        ]
      },
      reaction_arrows: {
        name: 'Mũi tên phản ứng',
        items: [
          { label: 'Một chiều →', code: '\\rightarrow', preview: '\\rightarrow' },
          { label: 'Thuận nghịch ⇌', code: '\\rightleftharpoons', preview: '\\rightleftharpoons' },
          { label: 'Nhiệt độ t°', code: '\\xrightarrow{t^o}', preview: '\\xrightarrow{t^o}' },
          { label: 'Kết tủa ↓', code: '\\downarrow', preview: '\\downarrow' },
          { label: 'Bay hơi ↑', code: '\\uparrow', preview: '\\uparrow' }
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
          { label: 'Vận tốc v = s/t', code: 'v = \\frac{s}{t}', preview: 'v=\\frac{s}{t}' },
          { label: 'Gia tốc a', code: 'a = \\frac{v - v_0}{t}', preview: 'a=\\frac{\\Delta v}{t}' },
          { label: 'Phương trình dao động', code: 'x = A \\cos(\\omega t + \\varphi)', preview: 'x=A\\cos(\\omega t+\\varphi)' },
          { label: 'Chu kỳ T', code: 'T = \\frac{2\\pi}{\\omega}', preview: 'T=\\frac{2\\pi}{\\omega}' },
          { label: 'Động năng Wđ', code: 'W_đ = \\frac{1}{2}mv^2', preview: 'W_đ=\\frac{1}{2}mv^2' }
        ]
      },
      electricity: {
        name: 'Điện xoay chiều',
        items: [
          { label: 'Định luật Ohm', code: 'I = \\frac{U}{R}', preview: 'I=\\frac{U}{R}' },
          { label: 'Trở kháng Z', code: 'Z = \\sqrt{R^2 + (Z_L - Z_C)^2}', preview: 'Z=\\sqrt{R^2+...}' },
          { label: 'Công suất P', code: 'P = U I \\cos\\varphi', preview: 'P=UI\\cos\\varphi' }
        ]
      },
      waves_optics: {
        name: 'Sóng & Quang học',
        items: [
          { label: 'Bước sóng λ', code: '\\lambda = \\frac{v}{f}', preview: '\\lambda=\\frac{v}{f}' },
          { label: 'Khoảng vân i', code: 'i = \\frac{\\lambda D}{a}', preview: 'i=\\frac{\\lambda D}{a}' }
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
          { label: 'alpha', code: '\\alpha', preview: '\\alpha' },
          { label: 'beta', code: '\\beta', preview: '\\beta' },
          { label: 'gamma', code: '\\gamma', preview: '\\gamma' },
          { label: 'delta nhỏ', code: '\\delta', preview: '\\delta' },
          { label: 'Delta lớn', code: '\\Delta', preview: '\\Delta' },
          { label: 'epsilon', code: '\\epsilon', preview: '\\epsilon' },
          { label: 'theta', code: '\\theta', preview: '\\theta' },
          { label: 'lambda', code: '\\lambda', preview: '\\lambda' },
          { label: 'pi', code: '\\pi', preview: '\\pi' },
          { label: 'sigma', code: '\\sigma', preview: '\\sigma' },
          { label: 'phi', code: '\\phi', preview: '\\phi' },
          { label: 'omega', code: '\\omega', preview: '\\omega' },
          { label: 'Omega lớn', code: '\\Omega', preview: '\\Omega' }
        ]
      },
      operators: {
        name: 'Phép toán & So sánh',
        items: [
          { label: 'Cộng trừ ±', code: '\\pm', preview: '\\pm' },
          { label: 'Trừ cộng ∓', code: '\\mp', preview: '\\mp' },
          { label: 'Nhân ×', code: '\\times', preview: '\\times' },
          { label: 'Chia ÷', code: '\\div', preview: '\\div' },
          { label: 'Khác ≠', code: '\\neq', preview: '\\neq' },
          { label: 'Xấp xỉ ≈', code: '\\approx', preview: '\\approx' },
          { label: 'Nhỏ hơn bằng ≤', code: '\\le', preview: '\\le' },
          { label: 'Lớn hơn bằng ≥', code: '\\ge', preview: '\\ge' },
          { label: 'Vô cực ∞', code: '\\infty', preview: '\\infty' },
          { label: 'Chấm nhân ·', code: '\\cdot', preview: '\\cdot' }
        ]
      }
    }
  }
};

/**
 * COMPACT HIERARCHICAL FORMULA TOOLBAR
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

  const domainKeys = Object.keys(HIERARCHICAL_CATALOG);
  const currentDomain = HIERARCHICAL_CATALOG[selectedDomain] || HIERARCHICAL_CATALOG.math;
  const categoryKeys = Object.keys(currentDomain.categories);
  const currentCategory = currentDomain.categories[selectedCategory] || currentDomain.categories[categoryKeys[0]];

  // When domain changes, auto-select first category of that domain
  const handleDomainChange = (domKey) => {
    setSelectedDomain(domKey);
    const firstCat = Object.keys(HIERARCHICAL_CATALOG[domKey].categories)[0];
    setSelectedCategory(firstCat);
  };

  if (isCollapsed) {
    return (
      <div className="w-11 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 space-y-3 shrink-0 select-none">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shadow-2xs"
          title="Mở rộng thanh công cụ ký hiệu"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
        <div className="w-5 h-[1px] bg-slate-700 my-1"></div>
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
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
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
    <div className="w-64 sm:w-72 bg-slate-900 text-white border-r border-slate-800 flex flex-col shrink-0 select-none text-xs h-full">
      {/* Top Header of Palette */}
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
          title="Thu gọn sidebar sang icon"
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
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* LEVEL 3: COMPACT CHIPS GRID (Các ký hiệu thực tế) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
        <div className="text-[10px] font-bold text-slate-400 px-1 flex items-center justify-between">
          <span>{currentCategory?.name || 'Ký hiệu'}</span>
          <span className="text-slate-400 font-mono">{currentCategory?.items?.length || 0} mục</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {currentCategory?.items?.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onInsertSnippet) {
                  onInsertSnippet(activeTarget, item.code);
                }
              }}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-cyan-950/80 hover:border-cyan-500/60 border border-slate-700/70 text-slate-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-2xs"
              title={`${item.label} (Nhấp để chèn: $${item.code}$)`}
            >
              <div 
                className="text-xs text-cyan-300 font-mono group-hover:scale-105 transition-transform max-w-full overflow-hidden text-center"
                dangerouslySetInnerHTML={{ __html: renderKatexHtml(item.preview || item.code, false) }}
              />
              <span className="text-[9.5px] text-slate-400 group-hover:text-slate-300 truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/60 text-[9.5px] text-slate-400 text-center italic">
        Nhấp ký hiệu để chèn thẳng vào vị trí con trỏ
      </div>
    </div>
  );
}
