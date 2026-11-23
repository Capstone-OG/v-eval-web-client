// Textbook-Verified GDPT 2018 (Grades 10-12) Formula Bank & Reference Data
// Each formula item uses clean `parts: string[]` of pure KaTeX so formulas wrap naturally with ZERO scrollbars!

export const MATH_FORMULAS = [
  {
    group: 'Lớp 10 · Mệnh đề, Tập hợp, Hàm bậc 2 & Hệ thức lượng',
    items: [
      { name: 'Luật De Morgan (Tập hợp)', parts: ['\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}', '\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}'] },
      { name: 'Đỉnh Parabol & Tam thức bậc hai', parts: ['I\\left(-\\frac{b}{2a};\\,-\\frac{\\Delta}{4a}\\right)', '\\Delta = b^2 - 4ac', 'x_1 + x_2 = -\\frac{b}{a}', 'x_1 x_2 = \\frac{c}{a}'] },
      { name: 'Định lý Cosin & Định lý Sin', parts: ['a^2 = b^2 + c^2 - 2bc\\cos A', '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R'] },
      { name: '5 Công thức diện tích tam giác', parts: ['S = \\frac{1}{2}a h_a = \\frac{1}{2}ab\\sin C', 'S = \\frac{abc}{4R} = pr', 'S = \\sqrt{p(p-a)(p-b)(p-c)}'] },
      { name: 'Đường trung tuyến & Tích vô hướng', parts: ['m_a^2 = \\frac{2(b^2+c^2)-a^2}{4}', '\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos(\\vec{a},\\vec{b}) = x_1x_2 + y_1y_2'] },
      { name: 'Khoảng cách, Đường tròn & Elip (Oxy)', parts: ['d(M,\\Delta)=\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}', '(x-a)^2+(y-b)^2=R^2', '\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1\\;(c^2=a^2-b^2)'] },
      { name: 'Hoán vị · Chỉnh hợp · Tổ hợp · Newton', parts: ['P_n = n!', 'A_n^k = \\frac{n!}{(n-k)!}', 'C_n^k = \\frac{n!}{k!(n-k)!}', '(a+b)^n = \\sum_{k=0}^{n} C_n^k a^{n-k}b^k'] }
    ]
  },
  {
    group: 'Lớp 11 · Lượng giác, Dãy số, Giới hạn, Mũ–Logarit & Đạo hàm',
    items: [
      { name: 'Hệ thức lượng giác cơ bản', parts: ['\\sin^2 x + \\cos^2 x = 1', '1+\\tan^2 x = \\frac{1}{\\cos^2 x}', '1+\\cot^2 x = \\frac{1}{\\sin^2 x}'] },
      { name: 'Công thức cộng & nhân đôi', parts: ['\\sin(a\\pm b)=\\sin a\\cos b\\pm\\cos a\\sin b', '\\cos(a\\pm b)=\\cos a\\cos b\\mp\\sin a\\sin b', '\\sin 2x = 2\\sin x\\cos x', '\\cos 2x = 2\\cos^2 x - 1'] },
      { name: 'Công thức hạ bậc & Tích thành tổng', parts: ['\\cos^2 x = \\frac{1+\\cos 2x}{2}', '\\sin^2 x = \\frac{1-\\cos 2x}{2}', '\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b)+\\cos(a+b)]'] },
      { name: 'Họ nghiệm PT lượng giác cơ bản', parts: ['\\sin x = \\sin\\alpha \\Leftrightarrow x=\\alpha+k2\\pi \\text{ hoặc } x=\\pi-\\alpha+k2\\pi', '\\cos x = \\cos\\alpha \\Leftrightarrow x = \\pm\\alpha + k2\\pi'] },
      { name: 'Cấp số cộng (CSC) & Cấp số nhân (CSN)', parts: ['u_n = u_1+(n-1)d', 'S_n = \\frac{n(u_1+u_n)}{2}', 'u_n = u_1 q^{n-1}', 'S_n = u_1\\frac{1-q^n}{1-q}', 'S_\\infty = \\frac{u_1}{1-q}\\;(|q|<1)'] },
      { name: 'Giới hạn cơ bản', parts: ['\\lim_{x\\to 0}\\frac{\\sin x}{x}=1', '\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^x = e', '\\lim_{n\\to\\infty} q^n = 0\\;(|q|<1)'] },
      { name: 'Lũy thừa, Logarit & Lãi kép', parts: ['\\log_a(xy)=\\log_a x+\\log_a y', '\\log_a\\frac{x}{y}=\\log_a x-\\log_a y', '\\log_{a^\\alpha}b^\\beta=\\frac{\\beta}{\\alpha}\\log_a b', 'T_n = A(1+r)^n'] },
      { name: 'Quy tắc & Bảng đạo hàm', parts: ["(uv)'=u'v+uv'", "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}", "(u^n)'=nu^{n-1}u'", "(\\sqrt{u})'=\\frac{u'}{2\\sqrt{u}}"] },
      { name: 'Đạo hàm Mũ, Logarit & Lượng giác', parts: ["(e^u)'=u'e^u", "(a^u)'=u'a^u\\ln a", "(\\ln|u|)'=\\frac{u'}{u}", "(\\sin u)'=u'\\cos u", "(\\cos u)'=-u'\\sin u", "(\\tan u)'=\\frac{u'}{\\cos^2 u}"] }
    ]
  },
  {
    group: 'Lớp 12 · Khảo sát hàm số, Tích phân, Oxyz, Thống kê & Bayes',
    items: [
      { name: 'Tiếp tuyến & Tiệm cận hàm bậc 1/1', parts: ["y = f'(x_0)(x-x_0)+f(x_0)", "y=\\frac{ax+b}{cx+d} \\Rightarrow \\text{TCĐ: } x=-\\frac{d}{c},\\; \\text{TCN: } y=\\frac{a}{c}"] },
      { name: 'Cực trị bậc 3 & Trùng phương', parts: ['y=ax^3+bx^2+cx+d:\\; b^2-3ac>0 \\Rightarrow 2\\text{ cực trị}', 'y=ax^4+bx^2+c:\\; ab<0 \\Rightarrow 3\\text{ cực trị}'] },
      { name: 'Nguyên hàm cơ bản', parts: ['\\int x^\\alpha dx=\\frac{x^{\\alpha+1}}{\\alpha+1}+C', '\\int\\frac{dx}{x}=\\ln|x|+C', '\\int e^{ax+b}dx=\\frac{1}{a}e^{ax+b}+C', '\\int\\frac{dx}{\\cos^2 x}=\\tan x+C'] },
      { name: 'Tích phân từng phần & Ứng dụng', parts: ['\\int_a^b u\\,dv = uv\\Big|_a^b - \\int_a^b v\\,du', 'S=\\int_a^b|f(x)-g(x)|\\,dx', 'V_{Ox}=\\pi\\int_a^b f^2(x)\\,dx'] },
      { name: 'Thể tích Chóp · Lăng trụ · Nón · Trụ · Cầu', parts: ['V_{\\text{chóp}}=\\frac{1}{3}Bh', 'V_{\\text{nón}}=\\frac{1}{3}\\pi r^2 h', 'V_{\\text{trụ}}=\\pi r^2 h', 'S_{\\text{cầu}}=4\\pi R^2', 'V_{\\text{cầu}}=\\frac{4}{3}\\pi R^3'] },
      { name: 'Tích có hướng, Diện tích & Thể tích Oxyz', parts: ['S_{\\triangle ABC}=\\frac{1}{2}|[\\overrightarrow{AB},\\overrightarrow{AC}]|', 'V_{ABCD}=\\frac{1}{6}|[\\overrightarrow{AB},\\overrightarrow{AC}]\\cdot\\overrightarrow{AD}|'] },
      { name: 'Khoảng cách & Góc trong Oxyz', parts: ['d(M,(P))=\\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}', '\\sin(d,(P))=\\frac{|\\vec{u}\\cdot\\vec{n}|}{|\\vec{u}||\\vec{n}|}', 'd(d_1,d_2)=\\frac{|[\\vec{u}_1,\\vec{u}_2]\\cdot\\overrightarrow{M_1M_2}|}{|[\\vec{u}_1,\\vec{u}_2]|}'] },
      { name: 'Mẫu số liệu ghép nhóm (Qₖ, s², s)', parts: ['Q_k = u_m + \\frac{\\frac{kn}{4}-C}{n_m}(u_{m+1}-u_m)', 's^2 = \\frac{1}{n}\\sum n_i(x_i-\\bar{x})^2', 's = \\sqrt{s^2}'] },
      { name: 'Xác suất có điều kiện & Công thức Bayes', parts: ['P(A|B)=\\frac{P(A\\cap B)}{P(B)}', 'P(B|A)=\\frac{P(B)P(A|B)}{P(B)P(A|B)+P(\\bar{B})P(A|\\bar{B})}'] }
    ]
  }
];

export const PHYSICS_FORMULAS = [
  {
    group: 'Lớp 10 · Động học, Động lực học, Moment, Công – Năng lượng & Động lượng',
    items: [
      { name: 'Chuyển động thẳng biến đổi đều & Rơi tự do', parts: ['v = v_0 + at', 'd = v_0 t + \\frac{1}{2}at^2', 'v^2 - v_0^2 = 2ad', 'h = \\frac{1}{2}gt^2'] },
      { name: 'Chuyển động Ném ngang & Ném xiên', parts: ['L_{\\text{ngang}} = v_0\\sqrt{\\frac{2h}{g}}', 'L_{\\text{xiên}} = \\frac{v_0^2\\sin 2\\alpha}{g}', 'H_{\\max} = \\frac{v_0^2\\sin^2\\alpha}{2g}'] },
      { name: 'Newton, Ma sát, Đàn hồi Hooke & Moment', parts: ['\\vec{F}=m\\vec{a}', 'F_{ms}=\\mu N', 'F_{dh}=k|\\Delta l|', 'M = F\\cdot d'] },
      { name: 'Công, Công suất, Cơ năng & Hiệu suất', parts: ['A = Fs\\cos\\alpha', '\\mathcal{P}=\\frac{A}{t}=Fv', 'W = \\frac{1}{2}mv^2 + mgh', 'H = \\frac{A_i}{A_{tp}}\\cdot 100\\%'] },
      { name: 'Động lượng & Chuyển động tròn đều', parts: ['\\vec{p}=m\\vec{v}', '\\vec{F}\\Delta t = \\Delta\\vec{p}', 'v = \\omega r', 'a_{ht}=\\frac{v^2}{r}=\\omega^2 r'] }
    ]
  },
  {
    group: 'Lớp 11 · Dao động, Sóng, Điện trường & Dòng điện không đổi',
    items: [
      { name: 'Dao động điều hòa & Độc lập thời gian', parts: ['x = A\\cos(\\omega t+\\varphi)', 'v = -\\omega A\\sin(\\omega t+\\varphi)', 'a = -\\omega^2 x', 'A^2 = x^2 + \\frac{v^2}{\\omega^2}'] },
      { name: 'Con lắc lò xo, Con lắc đơn & Năng lượng', parts: ['T_{lx}=2\\pi\\sqrt{\\frac{m}{k}}', 'T_{\\text{đơn}}=2\\pi\\sqrt{\\frac{l}{g}}', 'W = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2'] },
      { name: 'Sóng cơ, Giao thoa & Sóng dừng', parts: ['\\lambda = vT = \\frac{v}{f}', '\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}', 'd_2-d_1 = k\\lambda', '\\ell = k\\frac{\\lambda}{2}'] },
      { name: 'Giao thoa ánh sáng khe Y-âng', parts: ['i = \\frac{\\lambda D}{a}', 'x_{\\text{sáng}} = ki', 'x_{\\text{tối}} = (k+0{,}5)i'] },
      { name: 'Coulomb, Điện trường & Tụ điện', parts: ['F = k\\frac{|q_1 q_2|}{\\varepsilon r^2}', 'E = k\\frac{|Q|}{\\varepsilon r^2}', 'U = Ed', 'Q = CU', 'W = \\frac{1}{2}CU^2'] },
      { name: 'Định luật Ohm toàn mạch & Công suất', parts: ['I = \\frac{\\mathcal{E}}{R_N + r}', 'U_N = \\mathcal{E} - Ir', 'P = UI = I^2 R', 'H = \\frac{R_N}{R_N+r}'] }
    ]
  },
  {
    group: 'Lớp 12 (GDPT 2018) · Vật lý nhiệt, Khí lý tưởng, Từ trường & Hạt nhân',
    items: [
      { name: 'Nhiệt lượng, Nóng chảy, Hóa hơi & Nguyên lý I', parts: ['Q = mc\\Delta T', 'Q_{\\text{nc}} = \\lambda m', 'Q_{\\text{hh}} = Lm', '\\Delta U = A + Q'] },
      { name: 'Khí lý tưởng & Thuyết động học phân tử', parts: ['\\frac{p_1V_1}{T_1}=\\frac{p_2V_2}{T_2}', 'pV = nRT', 'p = \\frac{1}{3}\\mu m\\overline{v^2}', '\\overline{E_d}=\\frac{3}{2}k_B T'] },
      { name: 'Lực từ, Lực Lorentz & Cảm ứng Faraday', parts: ['F = BI\\ell\\sin\\alpha', 'f_L = |q|vB\\sin\\alpha', '\\Phi = NBS\\cos\\alpha', 'e_c = -\\frac{\\Delta\\Phi}{\\Delta t}'] },
      { name: 'Dòng điện xoay chiều & Máy biến áp', parts: ['Z = \\sqrt{R^2+(Z_L-Z_C)^2}', 'P = UI\\cos\\varphi', '\\frac{U_1}{U_2}=\\frac{N_1}{N_2}=\\frac{I_2}{I_1}'] },
      { name: 'Quang học & Lượng tử ánh sáng', parts: ['n_1\\sin i = n_2\\sin r', '\\sin i_{gh}=\\frac{n_2}{n_1}', '\\varepsilon = hf = \\frac{hc}{\\lambda}', '\\varepsilon = A + \\frac{1}{2}mv_{0\\max}^2'] },
      { name: 'Độ hụt khối, Năng lượng liên kết & Phóng xạ', parts: ['\\Delta m = Zm_p+(A-Z)m_n-m_X', 'W_{lk} = \\Delta m\\cdot c^2', 'N = N_0\\cdot 2^{-t/T}', 'H = \\lambda N = \\frac{\\ln 2}{T}N'] }
    ]
  }
];

export const CHEMISTRY_FORMULAS = [
  {
    group: 'Lớp 10 · Nguyên tử, Mol chuẩn đkc, Nhiệt hóa học & Tốc độ phản ứng',
    items: [
      { name: 'Cấu tạo nguyên tử & Nguyên tử khối TB', parts: ['Z = p = e', 'A = Z + N', '\\bar{A} = \\frac{A_1 x_1 + A_2 x_2}{100}'] },
      { name: 'Số mol (khí đkc 25°C – 1 bar) & Nồng độ', parts: ['n = \\frac{m}{M}', 'n_{\\text{khí (đkc)}} = \\frac{V}{24{,}79}', 'C_M = \\frac{n}{V}', 'C\\% = \\frac{m_{ct}}{m_{dd}}\\cdot 100\\%', 'C_M = \\frac{10 D C\\%}{M}'] },
      { name: 'Biến thiên Enthalpy chuẩn (Lớp 10 GDPT 2018)', parts: ['\\Delta_r H^\\circ_{298} = \\sum \\Delta_f H^\\circ_{\\text{sp}} - \\sum \\Delta_f H^\\circ_{\\text{cđ}}', '\\Delta_r H^\\circ_{298} = \\sum E_b(\\text{cđ}) - \\sum E_b(\\text{sp})'] },
      { name: 'Tốc độ phản ứng & Hệ số Van\'t Hoff', parts: ['v = k C_A^a C_B^b', '\\frac{v_2}{v_1} = \\gamma^{\\frac{T_2 - T_1}{10}}'] }
    ]
  },
  {
    group: 'Lớp 11–12 · Cân bằng, pH, Pin điện – Điện phân & Bảo toàn',
    items: [
      { name: 'Hằng số cân bằng K_C & Độ pH', parts: ['K_C = \\frac{[C]^c[D]^d}{[A]^a[B]^b}', '\\text{pH} = -\\log[\\text{H}^+]', '\\text{pH} + \\text{pOH} = 14'] },
      { name: 'Pin điện hóa & Điện phân Faraday (Lớp 12)', parts: ['E^\\circ_{\\text{pin}} = E^\\circ_{\\text{catot}} - E^\\circ_{\\text{anot}}', 'm = \\frac{A I t}{n F}\\;(F = 96500)', 'n_e = \\frac{It}{F}'] },
      { name: 'Các định luật Bảo toàn cốt lõi', parts: ['\\sum m_{\\text{trước}} = \\sum m_{\\text{sau}}', '\\sum n_{e\\text{ cho}} = \\sum n_{e\\text{ nhận}}', '\\sum n_+ q_+ = \\sum n_- q_-'] },
      { name: 'Độ bất bão hòa k & Bài toán CO₂ + OH⁻', parts: ['k = \\frac{2x+2-y+t}{2}', 'T = \\frac{n_{\\text{OH}^-}}{n_{\\text{CO}_2}}\\;(T\\le 1: \\text{HCO}_3^-,\\; T\\ge 2: \\text{CO}_3^{2-})'] }
    ]
  }
];

export const CHEMISTRY_PRECIPITATES = [
  { color: 'Trắng', dot: 'bg-slate-200 border-slate-400', compounds: 'AgCl, BaSO₄, CaCO₃, BaCO₃, Al(OH)₃ (keo trắng), Mg(OH)₂, Zn(OH)₂, CaSO₃, BaSO₃, PbSO₄, H₂SiO₃', note: 'AgCl và BaSO₄ KHÔNG tan trong axit mạnh (HNO₃, HCl). Al(OH)₃ và Zn(OH)₂ lưỡng tính — tan trong cả axit và kiềm dư.' },
  { color: 'Vàng nhạt / Vàng đậm', dot: 'bg-amber-300 border-amber-500', compounds: 'AgBr (vàng nhạt), AgI (vàng đậm), Ag₃PO₄ (vàng), PbI₂ (vàng tươi)', note: 'Ag₃PO₄ tan trong HNO₃; AgBr và AgI không tan trong HNO₃.' },
  { color: 'Đỏ nâu / Đỏ gạch', dot: 'bg-amber-800 border-amber-950', compounds: 'Fe(OH)₃ (đỏ nâu), Cu₂O (đỏ gạch — glucozơ/anđehit + Cu(OH)₂ đun nóng)', note: 'Fe(OH)₂ trắng xanh để ngoài không khí hóa nâu đỏ thành Fe(OH)₃.' },
  { color: 'Xanh lam', dot: 'bg-blue-500 border-blue-700', compounds: 'Cu(OH)₂', note: 'Tan trong NH₃ dư tạo phức xanh thẫm [Cu(NH₃)₄](OH)₂; hòa tan poliancol (glixerol, glucozơ, saccarozơ) tạo phức xanh lam.' },
  { color: 'Trắng xanh / Lục xám', dot: 'bg-emerald-300 border-emerald-600', compounds: 'Fe(OH)₂ (trắng xanh), Cr(OH)₃ (lục xám — lưỡng tính)', note: 'Cr(OH)₃ tan trong NaOH đặc tạo NaCrO₂.' },
  { color: 'Đen', dot: 'bg-slate-900 border-slate-950', compounds: 'CuS, Ag₂S, PbS, FeS', note: 'CuS, Ag₂S, PbS KHÔNG tan trong HCl/H₂SO₄ loãng; FeS tan được trong HCl sinh khí H₂S mùi trứng thối.' }
];

export const CHEMISTRY_KEY_REACTIONS = [
  {
    group: '1. Dãy điện hóa kim loại & Quy tắc Alpha (α)',
    summary: 'K⁺ Na⁺ Mg²⁺ Al³⁺ Zn²⁺ Fe²⁺ Ni²⁺ Sn²⁺ Pb²⁺ H⁺ Cu²⁺ Fe³⁺/Fe²⁺ Ag⁺ Au³⁺',
    equations: [
      'Quy tắc α: Chất oxi hóa mạnh + Chất khử mạnh → Chất oxi hóa yếu + Chất khử yếu',
      'Fe + 2FeCl₃ → 3FeCl₂   |   Cu + 2FeCl₃ → CuCl₂ + 2FeCl₂',
      'Fe(NO₃)₂ + AgNO₃ → Fe(NO₃)₃ + Ag↓',
      'Thụ động hóa trong HNO₃ đặc nguội, H₂SO₄ đặc nguội: Al, Fe, Cr'
    ]
  },
  {
    group: '2. Hợp chất lưỡng tính (Al, Zn, Cr, HCO₃⁻, Amino axit)',
    summary: 'Tác dụng được với cả dung dịch Axit mạnh (H⁺) và Bazơ mạnh (OH⁻)',
    equations: [
      '2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑',
      'Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O',
      'NaAlO₂ + CO₂ + 2H₂O → Al(OH)₃↓ + NaHCO₃ (CO₂ dư không hòa tan kết tủa)'
    ]
  },
  {
    group: '3. Nhiệt phân muối Nitrat (NO₃⁻) & Amoni',
    summary: 'Chia 3 vùng rõ rệt theo dãy hoạt động kim loại',
    equations: [
      'Trước Mg (K, Na, Ba, Ca): 2KNO₃ → 2KNO₂ + O₂↑',
      'Từ Mg đến Cu: 2Cu(NO₃)₂ → 2CuO + 4NO₂↑ + O₂↑',
      'Sau Cu (Ag, Hg): 2AgNO₃ → 2Ag + 2NO₂↑ + O₂↑',
      'NH₄NO₃ → N₂O↑ + 2H₂O (t°);   NH₄NO₂ → N₂↑ + 2H₂O (t°)'
    ]
  },
  {
    group: '4. Phản ứng Hữu cơ đặc trưng (Este · Cacbohiđrat · Amin · Peptit)',
    summary: 'Xà phòng hóa, Tráng bạc, Lên men, Màu Biure, Brom hóa',
    equations: [
      'Este thường + NaOH: RCOOR\' + NaOH → RCOONa + R\'OH (t°)',
      'Este của phenol + 2NaOH: RCOOC₆H₅ + 2NaOH → RCOONa + C₆H₅ONa + H₂O',
      'Tráng bạc (Glucozơ, Fructozơ, HCOOH, RCHO): 1 nhóm -CHO → 2Ag↓ (riêng HCHO → 4Ag↓)',
      'Lên men rượu: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂↑',
      'Màu Biure: Tripeptit trở lên + Cu(OH)₂ → phức màu tím đặc trưng',
      'Anilin + 3Br₂ → 2,4,6-tribromanilin↓ (trắng) + 3HBr'
    ]
  }
];

export const BIOLOGY_FORMULAS = [
  {
    group: 'Lớp 10–11 · Tế bào, Phân bào & Chuyển hóa năng lượng',
    items: [
      { name: 'Nguyên phân (k lần từ a tế bào 2n)', parts: ['\\text{Số TB con} = a\\cdot 2^k', '\\text{NST mt cung cấp} = a\\cdot 2n(2^k-1)'] },
      { name: 'Giảm phân & Tạo giao tử', parts: ['1\\text{ TB sinh tinh} \\to 4\\text{ tinh trùng}', '1\\text{ TB sinh trứng} \\to 1\\text{ trứng} + 3\\text{ thể cực}'] },
      { name: 'Quang hợp & Hô hấp tế bào', parts: ['6\\text{CO}_2+6\\text{H}_2\\text{O} \\xrightarrow{\\text{AS}} \\text{C}_6\\text{H}_{12}\\text{O}_6+6\\text{O}_2', '\\text{C}_6\\text{H}_{12}\\text{O}_6+6\\text{O}_2 \\to 6\\text{CO}_2+6\\text{H}_2\\text{O}+30\\text{–}32\\text{ ATP}'] }
    ]
  },
  {
    group: 'Lớp 12 · Di truyền phân tử, Quần thể & Sinh thái học',
    items: [
      { name: 'Cấu trúc ADN (Nucleotit, Chiều dài, Khối lượng)', parts: ['N = 2A + 2G', 'L = \\frac{N}{2}\\cdot 3{,}4\\;(\\text{\\AA})', 'M = 300N', 'H = 2A + 3G'] },
      { name: 'Nhân đôi ADN, Phiên mã & Dịch mã', parts: ['\\text{ADN con} = 2^k', 'N_{mt} = N(2^k-1)', 'rN = \\frac{N}{2}', '\\text{aa chuỗi} = \\frac{rN}{3}-1'] },
      { name: 'Tần số hoán vị gen f & Tự thụ phấn', parts: ['f = \\frac{\\text{Tổng giao tử hoán vị}}{\\text{Tổng giao tử}} \\le 50\\%', 'Aa_n = \\left(\\frac{1}{2}\\right)^n y'] },
      { name: 'Quần thể cân bằng Hardy–Weinberg & Hiệu suất sinh thái', parts: ['p^2 AA + 2pq Aa + q^2 aa = 1', 'p + q = 1', 'H = \\frac{E_{\\text{sau}}}{E_{\\text{trước}}}\\cdot 100\\%'] }
    ]
  }
];

export const HISTORY_REFERENCE = {
  sections: [
    {
      grade: 'Lớp 10 · Văn minh Thế giới, Đông Nam Á & Văn minh Đại Việt',
      milestones: [
        { year: 'Cổ – Trung đại', title: 'Các nền văn minh lớn Phương Đông & Phương Tây', detail: 'Ai Cập (chữ tượng hình, Kim tự tháp), Ấn Độ (chữ số 0, Phật giáo – Hinđu giáo), Trung Hoa (Tứ đại phát minh: giấy, in, thuốc súng, la bàn), Hy Lạp – La Mã (dân chủ, chữ Latinh, Olympic, luật La Mã).' },
        { year: 'TK XV – XIX', title: 'Phong trào Văn hóa Phục hưng & 4 Cuộc Cách mạng Công nghiệp', detail: 'CMCN 1 (Anh, máy hơi nước James Watt) → CMCN 2 (điện, động cơ đốt trong, dây chuyền) → CMCN 3 (máy tính, Internet) → CMCN 4 (AI, IoT, Big Data).' },
        { year: 'TK X – XIX', title: 'Văn minh Đại Việt (Lý – Trần – Lê sơ – Nguyễn)', detail: 'Dời đô Thăng Long (1010), Văn Miếu – Quốc Tử Giám (1070–1076), 3 lần đánh thắng Mông–Nguyên (TK XIII), Bộ luật Hồng Đức (Lê sơ), Chữ Nôm & chữ Quốc ngữ.' }
      ]
    },
    {
      grade: 'Lớp 11 · Cách mạng Tư sản, Thực dân hóa & Đấu tranh ở VN (1858–1930)',
      milestones: [
        { year: '1642 – 1789', title: '3 Cuộc Cách mạng Tư sản tiêu biểu', detail: 'CMTS Anh (1642–1688, quân chủ lập hiến) · Chiến tranh giành độc lập 13 thuộc địa Anh ở Bắc Mỹ (1776, Tuyên ngôn Độc lập Mỹ) · CMTS Pháp (1789, Tuyên ngôn Nhân quyền & Dân quyền).' },
        { year: '1858 – 1918', title: 'Pháp xâm lược Việt Nam & Phong trào Yêu nước đầu TK XX', detail: 'Pháp nổ súng Đà Nẵng (01/09/1858) → Hiệp ước Pa-tơ-nốt (1884) → Phong trào Cần Vương (1885–1896) → Khởi nghĩa Yên Thế (Hoàng Hoa Thám) → Xu hướng bạo động (Phan Bội Châu – Đông Du) & cải cách (Phan Châu Trinh – Duy Tân).' },
        { year: '1914 – 1945', title: 'Hai cuộc Chiến tranh Thế giới & Cách mạng Tháng Mười Nga (1917)', detail: 'CTTG I (1914–1918) · Cách mạng Tháng Mười Nga (1917, nhà nước XHCN đầu tiên) · CTTG II (1939–1945, khối Đồng minh tiêu diệt phát xít Đức – Ý – Nhật).' }
      ]
    },
    {
      grade: 'Lớp 12 · Trật tự Thế giới sau 1945 & Cách mạng Việt Nam (1930 – Nay)',
      milestones: [
        { year: '1919 – 1930', title: 'Nguyễn Ái Quốc tìm đường cứu nước & Thành lập ĐCSVN (03/02/1930)', detail: 'Yêu sách 8 điểm Véc-xai (1919) → Đọc Sơ thảo Luận cương Lênin (7/1920) → Hội VN Cách mạng Thanh niên (6/1925) → Hợp nhất 3 tổ chức cộng sản thành ĐCSVN (đầu 1930).' },
        { year: '1930 – 1945', title: '3 Cao trào Cách mạng & Cách mạng tháng Tám 1945', detail: '1930–1931 (Xô viết Nghệ – Tĩnh) → 1936–1939 (Dân chủ) → 1939–1945 (Mặt trận Việt Minh 19/05/1941, Đội VN Tuyên truyền GPQ 22/12/1944) → Tổng khởi nghĩa Tháng 8 & Tuyên ngôn Độc lập 02/09/1945.' },
        { year: '1945 – 1954', title: 'Kháng chiến chống Pháp & Chiến thắng Điện Biên Phủ', detail: 'Toàn quốc kháng chiến (19/12/1946) → Việt Bắc Thu–Đông 1947 → Biên giới Thu–Đông 1950 → Đông–Xuân 1953–1954 & Điện Biên Phủ (07/05/1954) → Hiệp định Giơnevơ (21/07/1954).' },
        { year: '1954 – 1975', title: 'Kháng chiến chống Mỹ & Đại thắng Mùa Xuân 1975', detail: 'Đồng khởi (1959–1960) → Chiến tranh đặc biệt (1961–1965) → Chiến tranh cục bộ & Mậu Thân 1968 → Việt Nam hóa chiến tranh & "Điện Biên Phủ trên không" (12/1972) → Hiệp định Pari (27/01/1973) → Chiến dịch Hồ Chí Minh (30/04/1975).' },
        { year: '1986 – Nay', title: 'Đổi mới & Hội nhập Quốc tế', detail: 'Đại hội VI (12/1986, trọng tâm Đổi mới kinh tế) → Gia nhập ASEAN (28/07/1995) → Bình thường hóa Việt–Mỹ (1995) → Gia nhập WTO (2007).' },
        { year: '1945 – Nay (TG)', title: 'Trật tự Ianta, Liên Hợp Quốc, Chiến tranh Lạnh & ASEAN', detail: 'Hội nghị Ianta (2/1945) · LHQ (24/10/1945) · Chiến tranh Lạnh (1947–1989) · ASEAN (08/08/1967 tại Băng Cốc) · Liên Xô tan rã (12/1991) → Xu thế đa cực.' }
      ]
    }
  ],
  didYouKnow: [
    'Phân biệt bẫy ĐGNL: Hội nghị thành lập Đảng (đầu 1930) do Nguyễn Ái Quốc chủ trì thông qua Cương lĩnh chính trị đầu tiên; còn Luận cương chính trị (10/1930) do Trần Phú soạn thảo.',
    'Hiệp định Giơnevơ (1954) quy định vĩ tuyến 17 chỉ là giới tuyến quân sự TẠM THỜI, không phải biên giới quốc gia hay chính trị.',
    'Chiến thắng "Điện Biên Phủ trên không" (12 ngày đêm tháng 12/1972) là đòn quyết định buộc Mỹ ký Hiệp định Pari (27/01/1973).',
    'Chiến dịch Việt Bắc (1947) là chiến dịch PHẢN CÔNG lớn đầu tiên; Chiến dịch Biên giới (1950) là chiến dịch CHỦ ĐỘNG TIẾN CÔNG lớn đầu tiên của bộ đội ta.',
    'Việt Nam là thành viên thứ 7 của ASEAN (28/07/1995). Hiến chương ASEAN được thông qua năm 2007 và Cộng đồng ASEAN chính thức thành lập ngày 31/12/2015.',
    'Hai nền văn minh cổ đại phương Đông gắn với lưu vực sông: Ai Cập (sông Nin), Lưỡng Hà (Tigơrơ–Ơphrát), Ấn Độ (sông Ấn–Hằng), Trung Hoa (Hoàng Hà–Trường Giang).'
  ]
};

export const GEOGRAPHY_REFERENCE = {
  formulas: [
    { name: 'Mật độ dân số (người/km²)', parts: ['D = \\frac{\\text{Dân số (người)}}{\\text{Diện tích (km}^2\\text{)}}'] },
    { name: 'Tỉ suất gia tăng tự nhiên (%)', parts: ['T_g = \\frac{S - T}{10}\\;(\\%)', 'S,\\,T\\text{ tính bằng }\\%\\text{o}'] },
    { name: 'Năng suất & Bình quân đầu người', parts: ['\\text{Năng suất} = \\frac{\\text{Sản lượng}}{\\text{Diện tích}}', '\\text{BQ đầu người} = \\frac{\\text{Sản lượng / GDP}}{\\text{Dân số}}'] },
    { name: 'Cán cân XNK & Tổng kim ngạch', parts: ['\\text{Cán cân} = \\text{XK} - \\text{NK}', '\\text{Tổng KN} = \\text{XK} + \\text{NK}'] },
    { name: 'Tốc độ tăng trưởng & Tỉ trọng (%)', parts: ['T_i = \\frac{X_i}{X_{\\text{gốc}}}\\times 100\\%', '\\text{Tỉ trọng} = \\frac{\\text{Thành phần}}{\\text{Tổng}}\\times 100\\%'] },
    { name: 'Biên độ nhiệt, Độ che phủ rừng & Múi giờ', parts: ['A_t = t_{\\max} - t_{\\min}', '\\text{Che phủ} = \\frac{S_{\\text{rừng}}}{S_{\\text{tự nhiên}}}\\times 100\\%', 'T_m = T_0 \\pm m'] }
  ],
  regionsAndWorld: [
    { title: 'Lớp 10 · Trái Đất, Khí quyển & Thủy quyển', detail: 'Hệ quả chuyển động tự quay: luân phiên ngày đêm, giờ địa phương (24 múi giờ, mỗi múi 15° kinh tuyến), lực Côriôlit (lệch phải ở BBC, lệch trái ở NBC). Hệ quả quay quanh Mặt Trời: 4 mùa, ngày đêm dài ngắn theo vĩ độ.' },
    { title: 'Lớp 11 · Địa lý Khu vực & Các nền kinh tế lớn', detail: 'EU (thị trường chung, đồng Euro, trung tâm kinh tế hàng đầu) · ASEAN (10 nước ĐNA, nông nghiệp nhiệt đới & công nghiệp đang phát triển) · Hoa Kỳ (kinh tế số 1 thế giới, dịch vụ ~80%) · Nhật Bản (nghèo khoáng sản, giàu nhân lực & công nghệ cao) · Trung Quốc (công xưởng thế giới, tập trung ven biển phía Đông).' },
    { title: 'Lớp 12 · 7 Vùng kinh tế Việt Nam', detail: '1. Trung du & MN Bắc Bộ (rộng nhất, giàu thủy điện & khoáng sản) · 2. ĐB Sông Hồng (mật độ dân cao nhất) · 3. Bắc Trung Bộ (hẹp ngang, gió Phơn Tây Nam) · 4. Duyên hải Nam Trung Bộ (kinh tế biển, cảng nước sâu) · 5. Tây Nguyên (không giáp biển, đất badan, cà phê số 1) · 6. Đông Nam Bộ (đầu tàu kinh tế, dầu khí, công nghiệp) · 7. ĐB Sông Cửu Long (vựa lúa, trái cây & thủy sản số 1).' }
  ],
  didYouKnow: [
    '4 điểm cực phần đất liền Việt Nam: Cực Bắc (Lũng Cú – Hà Giang), Cực Nam (Đất Mũi – Cà Mau), Cực Tây (Sín Thầu – Điện Biên), Cực Đông (Vạn Thạnh – Khánh Hòa).',
    'Việt Nam nằm hoàn toàn trong múi giờ số 7 (GMT+7), thuộc vùng nội chí tuyến Bắc bán cầu nên có 2 lần Mặt Trời lên thiên đỉnh mỗi năm.',
    'Quy tắc chọn biểu đồ ĐGNL: Tròn (cơ cấu 1–3 năm) · Miền (chuyển dịch cơ cấu ≥ 4 năm) · Đường (tốc độ tăng trưởng %) · Cột chồng/ghép (quy mô) · Kết hợp Cột–Đường (2 đại lượng khác đơn vị đo).',
    'Dãy Bạch Mã (16°B) là ranh giới tự nhiên phân chia khí hậu miền Bắc (có mùa đông lạnh do gió mùa Đông Bắc) và miền Nam (cận xích đạo nóng quanh năm, 2 mùa mưa–khô).',
    'Sông ngòi Việt Nam có 2 hướng chính: Tây Bắc – Đông Nam (sông Hồng, sông Đà, sông Mã, sông Cả) và hướng vòng cung (sông Lô, sông Gâm, sông Cầu, sông Thương, sông Lục Nam).'
  ]
};

export const PHYSICAL_CONSTANTS = [
  { symbol: 'g', name: 'Gia tốc trọng trường chuẩn', value: '9.80665', display: '9,81 m/s² (hay lấy 10 m/s²)', unit: 'm/s²' },
  { symbol: 'c', name: 'Vận tốc ánh sáng trong chân không', value: '2.99792458e8', display: '3 × 10⁸ m/s', unit: 'm/s' },
  { symbol: 'h', name: 'Hằng số Planck', value: '6.62607e-34', display: '6,625 × 10⁻³⁴ J·s', unit: 'J·s' },
  { symbol: 'e', name: 'Điện tích nguyên tố', value: '1.60218e-19', display: '1,6 × 10⁻¹⁹ C', unit: 'C' },
  { symbol: 'k', name: 'Hằng số Coulomb', value: '9e9', display: '9 × 10⁹ N·m²/C²', unit: 'N·m²/C²' },
  { symbol: 'mₑ', name: 'Khối lượng electron', value: '9.10938e-31', display: '9,1 × 10⁻³¹ kg', unit: 'kg' },
  { symbol: 'mₚ', name: 'Khối lượng proton', value: '1.67262e-27', display: '1,6726 × 10⁻²⁷ kg', unit: 'kg' },
  { symbol: '1 u', name: 'Đơn vị khối lượng nguyên tử', value: '931.5', display: '1,66055 × 10⁻²⁷ kg ≈ 931,5 MeV/c²', unit: 'MeV/c²' },
  { symbol: 'Nₐ', name: 'Số Avogadro', value: '6.02214e23', display: '6,022 × 10²³ mol⁻¹', unit: 'mol⁻¹' },
  { symbol: 'R', name: 'Hằng số khí lý tưởng', value: '8.314', display: '8,31 J/(mol·K) ≈ 0,082 L·atm/(mol·K)', unit: 'J/(mol·K)' },
  { symbol: 'k_B', name: 'Hằng số Boltzmann', value: '1.38065e-23', display: '1,38 × 10⁻²³ J/K', unit: 'J/K' },
  { symbol: '1 eV', name: 'Electron-volt sang Joule', value: '1.6e-19', display: '1,6 × 10⁻¹⁹ J', unit: 'J' }
];

export const SI_PREFIXES = [
  { prefix: 'Tera', sym: 'T', factor: '10¹²' },
  { prefix: 'Giga', sym: 'G', factor: '10⁹' },
  { prefix: 'Mega', sym: 'M', factor: '10⁶' },
  { prefix: 'Kilo', sym: 'k', factor: '10³' },
  { prefix: 'Deci', sym: 'd', factor: '10⁻¹' },
  { prefix: 'Centi', sym: 'c', factor: '10⁻²' },
  { prefix: 'Mili', sym: 'm', factor: '10⁻³' },
  { prefix: 'Micro', sym: 'µ', factor: '10⁻⁶' },
  { prefix: 'Nano', sym: 'n', factor: '10⁻⁹' },
  { prefix: 'Pico', sym: 'p', factor: '10⁻¹²' },
  { prefix: 'Femto', sym: 'f', factor: '10⁻¹⁵' }
];

export const PHET_SIMULATIONS = [
  { id: 'circuit-dc', subject: 'Vật lý', title: 'Mạch điện một chiều (Lắp ráp mạch ảo)', desc: 'Lắp pin, điện trở, bóng đèn, ampe kế, vôn kế và quan sát dòng electron chạy trực tiếp.', url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_vi.html' },
  { id: 'bending-light', subject: 'Vật lý', title: 'Khúc xạ & Đường đi tia sáng', desc: 'Mô phỏng tia laser qua không khí, nước, thủy tinh, lăng kính và phản xạ toàn phần.', url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_vi.html' },
  { id: 'faraday-em', subject: 'Vật lý', title: 'Từ trường & Cảm ứng điện từ Faraday', desc: 'Trực quan hóa đường sức từ, nam châm, cuộn dây và dòng điện cảm ứng.', url: 'https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_vi.html' },
  { id: 'projectile', subject: 'Vật lý', title: 'Chuyển động ném xiên', desc: 'Thay đổi góc bắn, vận tốc đầu, sức cản không khí để quan sát quỹ đạo parabol.', url: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_vi.html' },
  { id: 'wave-string', subject: 'Vật lý', title: 'Sóng trên dây & Sóng dừng', desc: 'Điều chỉnh tần số, biên độ, lực căng dây để quan sát bước sóng, nút và bụng sóng.', url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_vi.html' },
  { id: 'masses-springs', subject: 'Vật lý', title: 'Con lắc lò xo & Dao động điều hòa', desc: 'Khảo sát độ cứng k, khối lượng m, chu kỳ T và chuyển hóa động năng – thế năng.', url: 'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_vi.html' },
  { id: 'build-atom', subject: 'Hóa học', title: 'Xây dựng nguyên tử (Build an Atom)', desc: 'Thêm proton, neutron, electron để xem số khối, điện tích ion và vị trí bảng tuần hoàn.', url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_vi.html' },
  { id: 'balancing-chem', subject: 'Hóa học', title: 'Cân bằng phương trình hóa học', desc: 'Trực quan hóa số nguyên tử hai vế giúp cân bằng phản ứng nhanh và chính xác.', url: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_vi.html' },
  { id: 'ph-scale', subject: 'Hóa học', title: 'Thang đo pH Axit – Bazơ', desc: 'Đo pH, nồng độ [H₃O⁺] và [OH⁻] khi pha loãng các dung dịch axit, bazơ.', url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_vi.html' },
  { id: 'molecule-shapes', subject: 'Hóa học', title: 'Hình dạng phân tử 3D (VSEPR)', desc: 'Xoay 3D cấu trúc hình học không gian của H₂O, CO₂, CH₄, NH₃ và góc liên kết.', url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_vi.html' }
];
