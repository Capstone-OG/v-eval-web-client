// Shared session state bridge for Textbook views (Standard, Ingest, Studio)
// Allows completely decoupled components to share the active textbook context without cross-file bugs.

const STORAGE_KEY = 'veval_active_textbook_context';

export const NON_PEDAGOGICAL_TERMS = [
  'bìa sách', 'bìa', 'trang bìa', 'bìa trước', 'bìa sau',
  'trang trắng', 'trang trống', 'trang lót',
  'n/a', 'na', 'null', 'undefined', 'none',
  'mục lục', 'lời nói đầu', 'lời mở đầu', 'lời giới thiệu',
  'hướng dẫn sử dụng sách', 'chưa xác định', 'không xác định',
  'thông tin xuất bản'
];

/**
 * Kiểm tra xem một tiêu đề (Chương, Bài, Dạng) có phải là trang phụ/không chứa kiến thức bài học (bìa sách, trang trắng, N/A) hay không
 */
export const isNonPedagogical = (name) => {
  if (!name || typeof name !== 'string') return true;
  const clean = name.toLowerCase().trim();
  if (!clean || clean === 'n/a' || clean === 'na' || clean === 'null' || clean === 'undefined' || clean === 'none') {
    return true;
  }
  // Check exact or prefix for short terms
  if (['bìa', 'trang bìa', 'bìa trước', 'bìa sau', 'mục lục', 'table of contents'].some(t =>
    clean === t ||
    clean.startsWith(t + ' ') ||
    clean.startsWith(t + ':') ||
    clean.startsWith(t + ' -') ||
    clean.startsWith(t + ' •')
  )) {
    return true;
  }
  // Check substring inclusion for obvious junk phrases
  const junkPhrases = [
    'bìa sách', 'trang trắng', 'trang trống', 'trang lót',
    'lời nói đầu', 'lời mở đầu', 'lời giới thiệu', 'hướng dẫn sử dụng sách',
    'thông tin xuất bản', 'chưa xác định', 'không xác định'
  ];
  if (junkPhrases.some(p => clean.includes(p))) {
    return true;
  }
  return false;
};

/**
 * Bóc tách tiền tố trùng lặp (Chương X:, Bài Y:, Dạng Z:) để hiển thị giao diện sư phạm thanh thoát, không bị lặp từ
 */
export const cleanPrefix = (str, type = 'chapter') => {
  if (!str || typeof str !== 'string') return '';
  let trimmed = str.trim();
  if (type === 'chapter') {
    // Xử lý tiền tố danh sách chuyên đề / chương (vd: Chuyên đề 4, 5, 6, 7 & 8: hoặc Chương 1 & 2:)
    trimmed = trimmed.replace(/^(chương|chủ\s*đề|chuyên\s*đề)\s*[\d,\s&–\-\/]+\s*[:.\-•]\s*/i, '').trim();
    // Xử lý tiền tố chương đơn lẻ (vd: Chương 1: hoặc Chủ đề 2 -)
    trimmed = trimmed.replace(/^(chương|chủ\s*đề|chuyên\s*đề)\s*\d+\s*[:.\-•]\s*/i, '').trim();
  } else if (type === 'lesson') {
    if (/^(bài)\s*\d+\s*[:.\-•]\s*/i.test(trimmed)) {
      trimmed = trimmed.replace(/^(bài)\s*\d+\s*[:.\-•]\s*/i, '').trim();
    }
  } else if (type === 'pattern') {
    if (/^(dạng)\s*\d+\s*[:.\-•]\s*/i.test(trimmed)) {
      trimmed = trimmed.replace(/^(dạng)\s*\d+\s*[:.\-•]\s*/i, '').trim();
    }
  }
  // Loại bỏ các dấu phẩy hoặc dấu hai chấm lơ lửng ở đầu chuỗi
  trimmed = trimmed.replace(/^[,;:\s\-•]+/, '').trim();
  return trimmed || str.trim();
};

/**
 * Chuẩn hóa dấu thanh tiếng Việt cũ/mới (hoá <-> hóa, lí <-> lý...) phục vụ so khớp tên môn/bài học
 */
export const normalizeViText = (str = '') => {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFC')
    .toLowerCase()
    .replace(/hoá/g, 'hóa')
    .replace(/toá/g, 'tóa')
    .replace(/oà/g, 'òa')
    .replace(/oá/g, 'óa')
    .replace(/oả/g, 'ỏa')
    .replace(/oã/g, 'õa')
    .replace(/oạ/g, 'ọa')
    .replace(/uỳ/g, 'ùy')
    .replace(/uý/g, 'úy')
    .replace(/uỷ/g, 'ủy')
    .replace(/uỹ/g, 'ũy')
    .replace(/uỵ/g, 'ụy')
    .replace(/vật lý/g, 'vật lí')
    .replace(/địa lý/g, 'địa lí')
    .trim();
};

/**
 * Kiểm tra xem một chuỗi lý thuyết / mô tả / phương pháp có phải là template placeholder rỗng/chung chung hay không
 */
export const isGenericPlaceholder = (text) => {
  if (!text || typeof text !== 'string') return false;
  const clean = normalizeViText(text);
  if (clean.length === 0) return true;

  // Các câu mẫu stub tự sinh bởi backend/frontend (luôn bị coi là placeholder nếu ngắn hơn 320 ký tự)
  const stubPrefixes = [
    'mục tiêu nhận thức và kỹ năng áp dụng cho',
    'áp dụng phương pháp sư phạm chuẩn sgk',
    'dạng bài bóc tách từ sgk',
    'phương pháp chuẩn sgk',
    'phương pháp sư phạm chuẩn sgk',
    'mô tả dạng bài',
    'phương pháp giải',
    'áp dụng quy tắc lý thuyết',
    'quy trình giải quyết vấn đề',
    'nhận diện các đặc trưng cốt lõi',
    'vận dụng phân tích trường hợp cụ thể',
    'lý thuyết trích xuất từ sách giáo khoa chuẩn gdpt 2018',
    'lý thuyết bóc tách từ sgk chuẩn gdpt 2018',
    'phương pháp giải từng bước chuẩn sư phạm',
    'phương pháp giải từng bước kèm katex',
    '(đang cập nhật lý thuyết sgk)',
    '(đang cập nhật phương pháp giải)',
    'phương pháp tư duy chuẩn hóa đgnl đhqg-hcm',
    'kiến thức nền tảng trong cơ sở dữ liệu',
    'phương pháp giải chi tiết trong cơ sở dữ liệu'
  ];

  if (clean.length < 320 && stubPrefixes.some(p => clean === p || clean === `${p}.` || clean.startsWith(p))) {
    return true;
  }

  // Các câu mẫu generic template cần lọc bỏ triệt để
  const placeholderPhrases = [
    'nội dung định nghĩa cốt lõi của bài học',
    'các hiện tượng, quy luật khoa học và nguyên lý vận hành cơ bản',
    'các đại lượng vật lí / toán học / hóa học đo lường trong bài học',
    'đơn vị đo lường chuẩn quốc tế (si)',
    'ý nghĩa thực tiễn & bẫy tư duy trong đề thi',
    'các câu hỏi thực tế, thí nghiệm kiểm chứng và ứng dụng',
    'các sai sót thường gặp của học sinh trong các đề thi',
    'nội dung định nghĩa cốt lõi',
    'nguyên lý vận hành cơ bản cần ghi nhớ',
    'bẫy tư duy trong đề thi'
  ];

  const matchCount = placeholderPhrases.filter(p => clean.includes(p)).length;
  if (matchCount >= 2) return true;
  if (matchCount >= 1 && clean.length < 350) return true;

  return false;
};

/**
 * Kho Khung Chương Trình Chuẩn GDPT 2018 (Vật lí, Toán học, Hóa học...)
 * Đảm bảo khi chọn môn học & khối lớp, cấu trúc Chương -> Bài -> Dạng bài -> Công thức luôn đầy đủ 100% chuẩn sư phạm
 */
export const GDPT_PRESETS = {
  'PHYS_10': {
    bookEdition: 'Cánh Diều',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chủ đề 1: Mô tả chuyển động',
        status: 'ACCEPTED',
        pageStart: 15,
        pageEnd: 42,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Tốc độ, độ dịch chuyển và vận tốc',
            status: 'ACCEPTED',
            pageStart: 15,
            pageEnd: 24,
            keyFormulas: [
              'v = \\frac{s}{t}',
              '\\vec{v} = \\frac{\\Delta \\vec{d}}{\\Delta t}',
              'v_{tb} = \\frac{d_2 - d_1}{t_2 - t_1}',
              '\\vec{v}_{13} = \\vec{v}_{12} + \\vec{v}_{23}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Xác định độ dịch chuyển, quãng đường và vận tốc trung bình',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Xác định độ dịch chuyển và vận tốc trên quỹ đạo thẳng.',
                method: 'Dùng công thức \\vec{d} = \\vec{x}_2 - \\vec{x}_1 và v_{tb} = \\frac{d}{\\Delta t}.',
                exercises: [
                  {
                    id: 'ex_phys10_b1_p1_1',
                    stem: 'Một vận động viên bơi lội bơi xuôi theo chiều dài $50\\text{ m}$ của bể bơi hết $20\\text{ s}$, rồi lập tức quay đầu bơi ngược lại về chỗ xuất phát trong $22\\text{ s}$. Tốc độ trung bình và độ lớn vận tốc trung bình của người đó trong cả hành trình lần lượt là:',
                    options: [
                      'Tốc độ trung bình $2,38\\text{ m/s}$; Vận tốc trung bình $0\\text{ m/s}$',
                      'Tốc độ trung bình $0\\text{ m/s}$; Vận tốc trung bình $2,38\\text{ m/s}$',
                      'Tốc độ trung bình $2,50\\text{ m/s}$; Vận tốc trung bình $2,27\\text{ m/s}$',
                      'Tốc độ trung bình $1,19\\text{ m/s}$; Vận tốc trung bình $1,19\\text{ m/s}$'
                    ],
                    correctIndex: 0,
                    bloomLevel: 2,
                    solution: 'Tổng quãng đường bơi cả đi lẫn về là $s = 50 + 50 = 100\\text{ m}$. Tổng thời gian bơi là $t = 20 + 22 = 42\\text{ s}$. Do đó tốc độ trung bình: $v_{tb} = \\frac{s}{t} = \\frac{100}{42} \\approx 2,38\\text{ m/s}$. Vì điểm kết thúc trùng với điểm xuất phát nên độ dịch chuyển tổng cộng $d = 0\\text{ m}$. Độ lớn vận tốc trung bình: $v = \\frac{d}{t} = 0\\text{ m/s}$.',
                    sourcePage: 16
                  },
                  {
                    id: 'ex_phys10_b1_p1_2',
                    stem: 'Một xe ô tô chạy từ thành phố A đến thành phố B. Trong nửa đoạn đường đầu ô tô chuyển động với tốc độ không đổi $v_1 = 60\\text{ km/h}$, trong nửa đoạn đường còn lại chuyển động với tốc độ $v_2 = 40\\text{ km/h}$. Tốc độ trung bình của ô tô trên toàn bộ quãng đường $AB$ là:',
                    options: [
                      '$48\\text{ km/h}$',
                      '$50\\text{ km/h}$',
                      '$45\\text{ km/h}$',
                      '$52\\text{ km/h}$'
                    ],
                    correctIndex: 0,
                    bloomLevel: 3,
                    solution: 'Gọi chiều dài cả quãng đường là $s$. Thời gian đi nửa đầu: $t_1 = \\frac{s/2}{v_1} = \\frac{s}{120}$. Thời gian đi nửa sau: $t_2 = \\frac{s/2}{v_2} = \\frac{s}{80}$. Tổng thời gian chuyển động: $t = t_1 + t_2 = \\frac{s}{120} + \\frac{s}{80} = \\frac{5s}{240} = \\frac{s}{48}$. Tốc độ trung bình trên cả đoạn đường: $v_{tb} = \\frac{s}{t} = \\frac{s}{s/48} = 48\\text{ km/h}$.',
                    sourcePage: 18
                  }
                ]
              },
              {
                patternCode: 'P2',
                name: 'Dạng 2: Vận tốc tổng hợp và tính tương đối của chuyển động',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Cộng vectơ vận tốc trong hệ quy chiếu đứng yên và chuyển động.',
                method: 'Áp dụng công thức cộng vận tốc \\vec{v}_{13} = \\vec{v}_{12} + \\vec{v}_{23}.',
                exercises: [
                  {
                    id: 'ex_phys10_b1_p2_1',
                    stem: 'Một chiếc ca nô chạy xuôi dòng nước từ bến A đến bến B mất $2\\text{ giờ}$. Biết vận tốc của ca nô đối với dòng nước là $v_{12} = 15\\text{ km/h}$ và vận tốc của dòng nước đối với bờ là $v_{23} = 3\\text{ km/h}$. Khoảng cách giữa hai bến A và B là:',
                    options: [
                      '$36\\text{ km}$',
                      '$30\\text{ km}$',
                      '$24\\text{ km}$',
                      '$18\\text{ km}$'
                    ],
                    correctIndex: 0,
                    bloomLevel: 3,
                    solution: 'Khi ca nô chuyển động xuôi dòng, vectơ vận tốc của ca nô cùng hướng với dòng nước. Vận tốc của ca nô đối với bờ là: $v_{13} = v_{12} + v_{23} = 15 + 3 = 18\\text{ km/h}$. Khoảng cách giữa hai bến: $s = v_{13} \\times t = 18 \\times 2 = 36\\text{ km}$.',
                    sourcePage: 22
                  }
                ]
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Bài 2: Đồ thị độ dịch chuyển – thời gian và gia tốc',
            status: 'ACCEPTED',
            pageStart: 25,
            pageEnd: 32,
            keyFormulas: [
              'a = \\frac{v - v_0}{t}',
              'v = v_0 + at',
              'd = v_0 t + \\frac{1}{2}at^2',
              'v^2 - v_0^2 = 2ad'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Khai thác đồ thị d - t và v - t xác định vận tốc, gia tốc',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Độ dốc đồ thị d-t là vận tốc, độ dốc v-t là gia tốc.',
                method: 'Hệ số góc k = \\frac{\\Delta d}{\\Delta t} biểu thị vận tốc.',
                exercises: [
                  {
                    id: 'ex_phys10_b2_p1_1',
                    stem: 'Đồ thị độ dịch chuyển – thời gian ($d - t$) của một chất điểm là một đường thẳng đi qua gốc tọa độ và qua điểm $M(t = 4\\text{ s};\\ d = 12\\text{ m})$. Tính chất chuyển động và vận tốc của vật là:',
                    options: [
                      'Chuyển động thẳng đều với vận tốc $v = 3\\text{ m/s}$',
                      'Chuyển động nhanh dần đều với gia tốc $a = 3\\text{ m/s}^2$',
                      'Chuyển động thẳng đều với vận tốc $v = 48\\text{ m/s}$',
                      'Vật đứng yên tại tọa độ $d = 12\\text{ m}$'
                    ],
                    correctIndex: 0,
                    bloomLevel: 2,
                    solution: 'Đồ thị $d - t$ là đường thẳng xiên góc chứng tỏ vận tốc của vật không đổi theo thời gian (chuyển động thẳng đều). Hệ số góc của đồ thị biểu thị vận tốc: $v = \\frac{\\Delta d}{\\Delta t} = \\frac{12 - 0}{4 - 0} = 3\\text{ m/s}$.',
                    sourcePage: 26
                  }
                ]
              },
              {
                patternCode: 'P2',
                name: 'Dạng 2: Chuyển động thẳng biến đổi đều và rơi tự do',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Tính quãng đường, thời gian và vận tốc trong chuyển động thẳng biến đổi đều.',
                method: 'Dùng hệ phương trình độc lập thời gian v^2 - v_0^2 = 2ad.',
                exercises: [
                  {
                    id: 'ex_phys10_b2_p2_1',
                    stem: 'Một đoàn tàu đang chạy với tốc độ $72\\text{ km/h}$ thì hãm phanh chuyển động chậm dần đều, sau thời gian $10\\text{ s}$ thì dừng hẳn. Quãng đường đoàn tàu đi được kể từ lúc hãm phanh đến khi dừng hẳn là:',
                    options: [
                      '$100\\text{ m}$',
                      '$200\\text{ m}$',
                      '$360\\text{ m}$',
                      '$50\\text{ m}$'
                    ],
                    correctIndex: 0,
                    bloomLevel: 3,
                    solution: 'Đổi vận tốc ban đầu: $v_0 = 72\\text{ km/h} = 20\\text{ m/s}$. Vận tốc khi dừng hẳn: $v = 0\\text{ m/s}$. Gia tốc của tàu: $a = \\frac{v - v_0}{t} = \\frac{0 - 20}{10} = -2\\text{ m/s}^2$. Quãng đường tàu đi được: áp dụng hệ thức độc lập thời gian $v^2 - v_0^2 = 2ad \\implies 0^2 - 20^2 = 2 \\times (-2) \\times d \\implies d = \\frac{-400}{-4} = 100\\text{ m}$.',
                    sourcePage: 30
                  }
                ]
              }
            ]
          },
          {
            lessonNumber: 3,
            title: 'Bài 3: Chuyển động ném ngang và ném xiên',
            status: 'ACCEPTED',
            pageStart: 33,
            pageEnd: 42,
            keyFormulas: [
              'x = v_0 t',
              'y = \\frac{1}{2} g t^2',
              'L = v_0 \\sqrt{\\frac{2h}{g}}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Xác định tầm xa và thời gian rơi của vật ném ngang',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Phân tích chuyển động ném ngang thành 2 phương vuông góc Ox và Oy.',
                method: 'Ox chuyển động thẳng đều, Oy rơi tự do.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 2,
        title: 'Chủ đề 2: Lực và chuyển động',
        status: 'ACCEPTED',
        pageStart: 43,
        pageEnd: 78,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Ba định luật Newton về chuyển động',
            status: 'ACCEPTED',
            pageStart: 43,
            pageEnd: 55,
            keyFormulas: [
              '\\vec{F} = m\\vec{a}',
              '\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}',
              'P = mg'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Áp dụng định luật II Newton tìm hợp lực và gia tốc',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Tổng hợp lực và tính gia tốc của vật.',
                method: 'Chiếu phương trình vectơ lên các trục tọa độ.',
                exercises: []
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Bài 2: Một số lực trong thực tiễn (Ma sát, Trọng lực, Căng)',
            status: 'ACCEPTED',
            pageStart: 56,
            pageEnd: 68,
            keyFormulas: [
              'F_{ms} = \\mu N',
              'F_{dh} = k |\\Delta l|'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Lực ma sát và chuyển động trên mặt phẳng nghiêng',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Tính lực ma sát trượt và phân tích phản lực trên mặt phẳng nghiêng.',
                method: 'N = mg \\cos\\alpha và F_{ms} = \\mu mg \\cos\\alpha.',
                exercises: []
              }
            ]
          },
          {
            lessonNumber: 3,
            title: 'Bài 3: Moment lực và điều kiện cân bằng của vật rắn',
            status: 'ACCEPTED',
            pageStart: 69,
            pageEnd: 78,
            keyFormulas: [
              'M = F d',
              '\\sum M_{\\text{thuận}} = \\sum M_{\\text{nghịch}}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Quy tắc moment lực cho đòn bẩy và vật có trục quay',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Xác định cánh tay đòn d và phương trình cân bằng moment lực.',
                method: 'Cánh tay đòn d là khoảng cách vuông góc từ trục quay đến giá của lực.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 3,
        title: 'Chủ đề 3: Năng lượng và công',
        status: 'ACCEPTED',
        pageStart: 79,
        pageEnd: 98,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Công cơ học và công suất',
            status: 'ACCEPTED',
            pageStart: 79,
            pageEnd: 88,
            keyFormulas: [
              'A = F s \\cos \\alpha',
              '\\mathcal{P} = \\frac{A}{t} = F v',
              'H = \\frac{A_{ch}}{A_{tp}} \\times 100\\%'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Tính công phát động, công cản và hiệu suất máy cơ',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Biện luận dấu của công dựa vào góc hợp bởi lực và hướng dịch chuyển.',
                method: 'Góc nhọn: công phát động; góc tù: công cản.',
                exercises: []
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Bài 2: Động năng, thế năng và bảo toàn cơ năng',
            status: 'ACCEPTED',
            pageStart: 89,
            pageEnd: 98,
            keyFormulas: [
              'W_d = \\frac{1}{2} m v^2',
              'W_t = mgh',
              'W = W_d + W_t = \\text{const}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Áp dụng bảo toàn cơ năng tìm độ cao cực đại và vận tốc',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Bảo toàn cơ năng khi vật chuyển động trong trọng trường không ma sát.',
                method: 'W_A = W_B \\iff \\frac{1}{2}mv_A^2 + mgh_A = \\frac{1}{2}mv_B^2 + mgh_B.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 4,
        title: 'Chủ đề 4: Động lượng',
        status: 'ACCEPTED',
        pageStart: 99,
        pageEnd: 114,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Định luật bảo toàn động lượng',
            status: 'ACCEPTED',
            pageStart: 99,
            pageEnd: 114,
            keyFormulas: [
              '\\vec{p} = m \\vec{v}',
              '\\Delta \\vec{p} = \\vec{F} \\Delta t',
              'm_1 \\vec{v}_1 + m_2 \\vec{v}_2 = (m_1 + m_2) \\vec{V}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Xung lượng của lực và độ biến thiên động lượng',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Tính lực tương tác trung bình trong thời gian va chạm.',
                method: '\\vec{F}_{tb} = \\frac{\\Delta \\vec{p}}{\\Delta t}.',
                exercises: []
              },
              {
                patternCode: 'P2',
                name: 'Dạng 2: Va chạm mềm và chuyển động bằng phản lực (tên lửa)',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Áp dụng định luật bảo toàn động lượng cho hệ kín.',
                method: 'Chiếu phương trình bảo toàn động lượng lên hướng chuyển động.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 5,
        title: 'Chủ đề 5: Chuyển động tròn và biến dạng vật rắn',
        status: 'ACCEPTED',
        pageStart: 115,
        pageEnd: 122,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Động lực học chuyển động tròn đều',
            status: 'ACCEPTED',
            pageStart: 115,
            pageEnd: 122,
            keyFormulas: [
              'v = \\omega r',
              'a_{ht} = \\frac{v^2}{r} = \\omega^2 r',
              'F_{ht} = m \\frac{v^2}{r}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Tính tốc độ góc, gia tốc hướng tâm và lực hướng tâm',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Xác định hợp lực đóng vai trò lực hướng tâm.',
                method: 'Thiết lập F_{ht} = m \\frac{v^2}{r}.',
                exercises: []
              }
            ]
          }
        ]
      }
    ]
  },
  'PHYS_12': {
    bookEdition: 'Cánh Diều',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chương 1: Vật lí nhiệt',
        status: 'ACCEPTED',
        pageStart: 5,
        pageEnd: 34,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Sự chuyển thể và nhiệt dung riêng',
            status: 'ACCEPTED',
            pageStart: 5,
            pageEnd: 18,
            keyFormulas: [
              'Q = mc\\Delta T',
              'Q = m\\lambda',
              'Q = mL'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Phương trình cân bằng nhiệt và nhiệt dung riêng',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Xác định nhiệt lượng tỏa ra và thu vào khi thay đổi nhiệt độ.',
                method: 'Áp dụng Q_{tỏa} = Q_{thu}.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 2,
        title: 'Chương 2: Khí lí tưởng',
        status: 'ACCEPTED',
        pageStart: 35,
        pageEnd: 66,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Định luật Boyle, Charles và Phương trình trạng thái khí lí tưởng',
            status: 'ACCEPTED',
            pageStart: 35,
            pageEnd: 52,
            keyFormulas: [
              'p_1 V_1 = p_2 V_2',
              '\\frac{V_1}{T_1} = \\frac{V_2}{T_2}',
              '\\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}',
              'p = \\frac{1}{3} \\frac{N}{V} m \\overline{v^2}',
              'E_d = \\frac{3}{2} k T'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Định luật Boyle và đồ thị quá trình đẳng nhiệt',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Khảo sát mối quan hệ giữa áp suất và thể tích ở nhiệt độ không đổi.',
                method: 'Áp dụng p_1 V_1 = p_2 V_2 trên đồ thị p - V.',
                exercises: []
              },
              {
                patternCode: 'P2',
                name: 'Dạng 2: Định luật Charles và phương trình trạng thái khí lí tưởng Clapeyron',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Biến đổi trạng thái khí lí tưởng với cả 3 thông số p, V, T.',
                method: 'Áp dụng \\frac{p_1 V_1}{T_1} = \\frac{p_2 V_2}{T_2}.',
                exercises: []
              },
              {
                patternCode: 'P3',
                name: 'Dạng 3: Áp suất khí theo mô hình động học phân tử và động năng trung bình',
                bloomLevel: 3,
                status: 'ACCEPTED',
                description: 'Mối liên hệ giữa áp suất, mật độ phân tử và nhiệt độ tuyệt đối T.',
                method: 'Áp dụng p = \\frac{2}{3} n_0 E_d = n_0 k T.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 3,
        title: 'Chương 3: Từ trường',
        status: 'ACCEPTED',
        pageStart: 67,
        pageEnd: 98,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Lực từ và cảm ứng từ',
            status: 'ACCEPTED',
            pageStart: 67,
            pageEnd: 82,
            keyFormulas: [
              'F = B I l \\sin \\alpha',
              '\\Phi = B S \\cos \\alpha',
              'e_c = -\\frac{\\Delta \\Phi}{\\Delta t}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Lực từ tác dụng lên đoạn dây dẫn mang dòng điện',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Xác định độ lớn và hướng của lực từ theo quy tắc bàn tay trái.',
                method: 'F = B I l \\sin\\alpha.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 4,
        title: 'Chương 4: Vật lí hạt nhân',
        status: 'ACCEPTED',
        pageStart: 99,
        pageEnd: 122,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Năng lượng liên kết và phản ứng hạt nhân',
            status: 'ACCEPTED',
            pageStart: 99,
            pageEnd: 122,
            keyFormulas: [
              'E = m c^2',
              '\\Delta m = [Z m_p + (A - Z) m_n] - m_X',
              'W_{lk} = \\Delta m \\cdot c^2'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Độ hụt khối, năng lượng liên kết và năng lượng liên kết riêng',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Đánh giá mức độ bền vững của hạt nhân qua năng lượng liên kết riêng.',
                method: 'w_{lkr} = \\frac{W_{lk}}{A}.',
                exercises: []
              }
            ]
          }
        ]
      }
    ]
  },
  'MATH_10': {
    bookEdition: 'Cánh Diều',
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chương 1: Mệnh đề và Tập hợp',
        status: 'ACCEPTED',
        pageStart: 5,
        pageEnd: 24,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Mệnh đề toán học',
            status: 'ACCEPTED',
            pageStart: 5,
            pageEnd: 14,
            keyFormulas: [
              'P \\Rightarrow Q',
              'P \\Leftrightarrow Q',
              '\\forall x \\in X, P(x)',
              '\\exists x \\in X, P(x)'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Nhận diện mệnh đề và xét tính đúng sai',
                bloomLevel: 1,
                status: 'ACCEPTED',
                description: 'Phân biệt câu khẳng định là mệnh đề và mệnh đề chứa biến.',
                method: 'Kiểm tra tính khẳng định đúng hoặc sai duy nhất.',
                exercises: []
              },
              {
                patternCode: 'P2',
                name: 'Dạng 2: Mệnh đề phủ định, kéo theo và tương đương',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Lập mệnh đề đảo, phủ định và suy luận logic.',
                method: 'Phủ định của \\forall là \\exists, phủ định của P là \\overline{P}.',
                exercises: []
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Bài 2: Tập hợp và các phép toán trên tập hợp',
            status: 'ACCEPTED',
            pageStart: 15,
            pageEnd: 24,
            keyFormulas: [
              'A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}',
              'A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}',
              'A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Các phép toán giao, hợp, hiệu trên tập số thực',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Xác định giao, hợp, hiệu của khoảng, đoạn, nửa khoảng.',
                method: 'Vẽ trục số và biểu diễn tập hợp bằng gạch bỏ.',
                exercises: []
              }
            ]
          }
        ]
      },
      {
        chapterNumber: 2,
        title: 'Chương 2: Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn',
        status: 'ACCEPTED',
        pageStart: 25,
        pageEnd: 46,
        lessons: [
          {
            lessonNumber: 1,
            title: 'Bài 1: Bất phương trình bậc nhất hai ẩn',
            status: 'ACCEPTED',
            pageStart: 25,
            pageEnd: 34,
            keyFormulas: [
              'ax + by \\le c',
              'ax + by > c'
            ],
            patterns: [
              {
                patternCode: 'P1',
                name: 'Dạng 1: Biểu diễn hình học miền nghiệm trên mặt phẳng Oxy',
                bloomLevel: 2,
                status: 'ACCEPTED',
                description: 'Vẽ đường thẳng bờ ax + by = c và thử điểm O(0,0).',
                method: 'Gạch bỏ nửa mặt phẳng không chứa nghiệm.',
                exercises: []
              }
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Lấy nội dung lý thuyết thuần chuẩn SGK GDPT 2018 theo Môn học, Khối lớp và Tên bài học
 */
export const getDefaultLessonTheory = (subjectCode = 'PHYS', grade = 10, lessonTitle = '') => {
  const clean = cleanPrefix(lessonTitle, 'lesson').toLowerCase();

  // Vật lí 10
  if (subjectCode === 'PHYS' || subjectCode === 'Vật lí') {
    if (clean.includes('tốc độ') || clean.includes('độ dịch chuyển') || clean.includes('vận tốc')) {
      return `### 1. Chuyển động cơ & Hệ quy chiếu
- **Chuyển động cơ**: Là sự thay đổi vị trí của một vật so với các vật khác theo thời gian. Chuyển động có tính tương đối.
- **Chất điểm**: Một vật có kích thước rất nhỏ so với phạm vi chuyển động của nó.
- **Hệ quy chiếu**: Bao gồm vật mốc, hệ trục toạ độ gắn với vật mốc, gốc thời gian và đồng hồ đo thời gian.

### 2. Độ dịch chuyển & Quãng đường
- **Quãng đường ($s$)**: Là độ dài toàn bộ quỹ đạo mà vật đã đi qua (luôn là đại lượng vô hướng không âm: $s \\ge 0$).
- **Độ dịch chuyển ($\\vec{d}$)**: Là vectơ nối từ vị trí ban đầu đến vị trí cuối cùng của vật: $\\vec{d} = \\vec{x}_2 - \\vec{x}_1$.
  + Khi vật chuyển động thẳng và không đổi chiều: $d = s$.
  + Khi vật đổi chiều chuyển động hoặc đi theo đường cong: $d < s$.

### 3. Tốc độ & Vận tốc trong chuyển động
- **Tốc độ trung bình**: Đo mức độ nhanh chậm của chuyển động trên quãng đường:
  $$v_{tb} = \\frac{s}{t}$$
- **Vận tốc trung bình**: Đại lượng vectơ đặc trưng cho cả tốc độ và hướng chuyển động:
  $$\\vec{v}_{tb} = \\frac{\\Delta \\vec{d}}{\\Delta t} = \\frac{\\vec{d}_2 - \\vec{d}_1}{t_2 - t_1}$$
- **Vận tốc tức thời**: Vận tốc của vật tại một thời điểm hoặc một vị trí xác định trên quỹ đạo.

### 4. Tính tương đối của chuyển động & Công thức cộng vận tốc
- Quỹ đạo và vận tốc của cùng một vật phụ thuộc vào hệ quy chiếu được chọn.
- **Định luật cộng vận tốc**:
  $$\\vec{v}_{13} = \\vec{v}_{12} + \\vec{v}_{23}$$
  + Trong đó: $\\vec{v}_{13}$ là vận tốc tuyệt đối (vật đối với hệ quy chiếu đứng yên); $\\vec{v}_{12}$ là vận tốc tương đối (vật đối với hệ quy chiếu chuyển động); $\\vec{v}_{23}$ là vận tốc kéo theo (hệ quy chiếu chuyển động đối với hệ quy chiếu đứng yên).`;
    }

    if (clean.includes('đồ thị') || clean.includes('gia tốc') || clean.includes('biến đổi đều')) {
      return `### 1. Đồ thị Độ dịch chuyển – Thời gian ($d - t$)
- Đồ thị $d - t$ của chuyển động thẳng đều là một đường thẳng xiên góc.
- Độ dốc (hệ số góc) của đường biểu diễn $d - t$ bằng vận tốc của vật:
  $$v = \\frac{\\Delta d}{\\Delta t}$$
- Nếu đường biểu diễn nằm ngang song song trục thời gian: Vật đứng yên ($v = 0$).

### 2. Gia tốc trong chuyển động biến đổi
- **Khái niệm**: Đại lượng vectơ đặc trưng cho tốc độ biến thiên của vận tốc theo thời gian:
  $$\\vec{a} = \\frac{\\Delta \\vec{v}}{\\Delta t} = \\frac{\\vec{v} - \\vec{v}_0}{t - t_0}$$
- Đơn vị đo gia tốc trong hệ SI là mét trên giây bình phương ($m/s^2$).
- **Tính chất**:
  + Chuyển động nhanh dần đều: Vectơ gia tốc $\\vec{a}$ cùng hướng với vectơ vận tốc $\\vec{v}$ ($a \\cdot v > 0$).
  + Chuyển động chậm dần đều: Vectơ gia tốc $\\vec{a}$ ngược hướng với vectơ vận tốc $\\vec{v}$ ($a \\cdot v < 0$).

### 3. Các phương trình chuyển động thẳng biến đổi đều
- Phương trình vận tốc: $v = v_0 + at$
- Phương trình độ dịch chuyển: $d = v_0 t + \\frac{1}{2}at^2$
- Công thức liên hệ độc lập với thời gian: $v^2 - v_0^2 = 2ad$

### 4. Sự rơi tự do
- Là sự rơi chỉ dưới tác dụng của trọng lực trong chân không.
- Gia tốc rơi tự do tại cùng một nơi trên Trái Đất là như nhau: $g \\approx 9.8\\,m/s^2$ (hoặc $g \\approx 10\\,m/s^2$).
- Các công thức: $v = gt$, $h = \\frac{1}{2}gt^2$, $v = \\sqrt{2gh}$.`;
    }

    if (clean.includes('ném ngang') || clean.includes('ném xiên')) {
      return `### 1. Phân tích Chuyển động ném ngang
- Chuyển động ném ngang có thể phân tích thành hai chuyển động thành phần độc lập trên hệ toạ độ $Oxy$:
  + **Theo phương nằm ngang ($Ox$)**: Vật không chịu lực tác dụng ($a_x = 0$), chuyển động thẳng đều với vận tốc ban đầu:
    $$v_x = v_0, \\quad x = v_0 t$$
  + **Theo phương thẳng đứng ($Oy$)**: Vật chỉ chịu trọng lực ($a_y = g$), chuyển động rơi tự do với vận tốc ban đầu $v_{0y} = 0$:
    $$v_y = gt, \\quad y = \\frac{1}{2}gt^2$$

### 2. Phương trình quỹ đạo & Thời gian chuyển động
- Rút $t = \\frac{x}{v_0}$ thay vào $y$, ta được phương trình quỹ đạo dạng parabol:
  $$y = \\frac{g}{2v_0^2} x^2$$
- Thời gian rơi của vật từ độ cao $h$:
  $$t = \\sqrt{\\frac{2h}{g}}$$
  *(Lưu ý: Thời gian rơi của vật ném ngang bằng thời gian rơi tự do của vật rơi từ cùng độ cao $h$).*
- **Tầm bay xa ($L$)**:
  $$L = x_{max} = v_0 t = v_0 \\sqrt{\\frac{2h}{g}}$$
- **Vận tốc khi chạm đất**:
  $$v = \\sqrt{v_x^2 + v_y^2} = \\sqrt{v_0^2 + 2gh}$$`;
    }

    if (clean.includes('newton') || clean.includes('ba định luật')) {
      return `### 1. Định luật I Newton (Định luật Quán tính)
- Nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực có hợp lực bằng không, thì vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều.
- **Quán tính**: Là tính chất của mọi vật có xu hướng bảo toàn trạng thái chuyển động hoặc đứng yên. Khối lượng là số đo mức quán tính của vật.

### 2. Định luật II Newton
- Vectơ gia tốc của một vật cùng hướng với hợp lực tác dụng lên vật. Độ lớn của gia tốc tỉ lệ thuận với độ lớn của hợp lực và tỉ lệ nghịch với khối lượng của vật:
  $$\\vec{a} = \\frac{\\vec{F}_{hl}}{m} \\iff \\vec{F}_{hl} = m\\vec{a}$$
- Đơn vị của lực trong hệ SI là Newton ($N$): $1\\,N = 1\\,kg \\cdot m/s^2$.

### 3. Định luật III Newton (Cặp lực Trực đối)
- Trong mọi trường hợp, khi vật $A$ tác dụng lên vật $B$ một lực thì đồng thời vật $B$ cũng tác dụng lại vật $A$ một lực. Hai lực này cùng giá, cùng độ lớn nhưng ngược chiều:
  $$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$
- **Đặc điểm của lực và phản lực**:
  + Xuất hiện và triệt tiêu đồng thời.
  + Cùng bản chất (ví dụ cùng là lực hấp dẫn, cùng là lực đàn hồi).
  + Đặt vào hai vật khác nhau nên **không cân bằng nhau**.`;
    }

    if (clean.includes('ma sát') || clean.includes('trọng lực') || clean.includes('lực')) {
      return `### 1. Trọng lực & Trọng lượng
- **Trọng lực**: Là lực hút của Trái Đất tác dụng lên vật, phương thẳng đứng, chiều hướng về tâm Trái Đất: $\\vec{P} = m\\vec{g}$.
- **Trọng lượng**: Là độ lớn của trọng lực tác dụng lên vật: $P = mg$.

### 2. Lực Ma sát trượt
- Xuất hiện ở mặt tiếp xúc khi một vật trượt trên bề mặt của vật khác, có hướng ngược hướng vận tốc tương đối của vật:
  $$F_{mst} = \\mu_t N$$
  + Trong đó: $\\mu_t$ là hệ số ma sát trượt (phụ thuộc vào vật liệu và tình trạng bề mặt tiếp xúc, không có đơn vị); $N$ là áp lực vuông góc với mặt tiếp xúc.

### 3. Lực Đàn hồi (Định luật Hooke)
- Trong giới hạn đàn hồi, lực đàn hồi của lò xo tỉ lệ thuận với độ biến dạng của lò xo:
  $$F_{dh} = k |\\Delta l|$$
  + $k$: Độ cứng (hệ số đàn hồi) của lò xo (đơn vị $N/m$).
  + $\\Delta l = |l - l_0|$: Độ biến dạng của lò xo (đơn vị $m$).
  + Hướng của lực đàn hồi luôn ngược với hướng biến dạng.`;
    }

    if (clean.includes('công') || clean.includes('công suất') || clean.includes('năng lượng')) {
      return `### 1. Công cơ học ($A$)
- Khi lực $\\vec{F}$ không đổi tác dụng lên vật và làm vật dịch chuyển quãng đường $s$ theo hướng hợp với hướng của lực một góc $\\alpha$:
  $$A = F \\cdot s \\cdot \\cos\\alpha$$
  + Nếu $\\alpha < 90^\\circ$: $\\cos\\alpha > 0 \\implies A > 0$ (Công phát động).
  + Nếu $\\alpha = 90^\\circ$: $\\cos\\alpha = 0 \\implies A = 0$ (Lực vuông góc với hướng chuyển động không sinh công).
  + Nếu $90^\\circ < \\alpha \\le 180^\\circ$: $\\cos\\alpha < 0 \\implies A < 0$ (Công cản).
- Đơn vị đo công trong hệ SI là Joule ($J$): $1\\,J = 1\\,N \\cdot m$.

### 2. Công suất ($\\mathcal{P}$)
- Là đại lượng đo bằng công thực hiện được trong một đơn vị thời gian:
  $$\\mathcal{P} = \\frac{A}{t} = \\vec{F} \\cdot \\vec{v} = F \\cdot v \\cdot \\cos\\alpha$$
- Đơn vị công suất là Watt ($W$): $1\\,W = 1\\,J/s$. Ngoài ra còn có đơn vị mã lực ($1\\,HP \\approx 746\\,W$).

### 3. Hiệu suất ($H$)
- Tỉ số giữa năng lượng có ích và tổng năng lượng toàn phần:
  $$H = \\frac{A_{ích}}{A_{tp}} \\times 100\\% = \\frac{\\mathcal{P}_{ích}}{\\mathcal{P}_{tp}} \\times 100\\%$$`;
    }

    if (clean.includes('động năng') || clean.includes('thế năng') || clean.includes('cơ năng')) {
      return `### 1. Động năng ($W_d$)
- Là dạng năng lượng mà vật có được do nó đang chuyển động:
  $$W_d = \\frac{1}{2} m v^2$$
- **Định lí động năng**: Độ biến thiên động năng của một vật bằng tổng công của các lực tác dụng lên vật:
  $$\\Delta W_d = W_{d2} - W_{d1} = A$$

### 2. Thế năng trọng trường ($W_t$)
- Là dạng năng lượng tương tác giữa Trái Đất và vật, phụ thuộc vào vị trí của vật trong trọng trường:
  $$W_t = mgz$$
  + $z$: Độ cao của vật so với mốc thế năng được chọn ($z$ có thể âm, dương hoặc bằng 0).
- Công của trọng lực bằng độ giảm thế năng: $A_{P} = W_{t1} - W_{t2}$.

### 3. Định luật Bảo toàn cơ năng
- Cơ năng của vật bằng tổng động năng và thế năng: $W = W_d + W_t = \\frac{1}{2}mv^2 + mgz$.
- Khi vật chuyển động trong trọng trường chỉ chịu tác dụng của trọng lực, cơ năng của vật được bảo toàn:
  $$W = \\text{const} \\iff \\frac{1}{2}mv_1^2 + mgz_1 = \\frac{1}{2}mv_2^2 + mgz_2$$`;
    }

    if (clean.includes('động lượng') || clean.includes('xung lượng')) {
      return `### 1. Động lượng ($\\vec{p}$)
- Động lượng của một vật có khối lượng $m$ đang chuyển động với vận tốc $\\vec{v}$ là một đại lượng vectơ:
  $$\\vec{p} = m\\vec{v}$$
- Vectơ động lượng cùng hướng với vectơ vận tốc. Đơn vị đo là $kg \\cdot m/s$ (hoặc $N \\cdot s$).

### 2. Xung lượng của lực & Độ biến thiên động lượng
- Khi một lực $\\vec{F}$ tác dụng lên vật trong khoảng thời gian $\\Delta t$:
  $$\\Delta \\vec{p} = \\vec{p}_2 - \\vec{p}_1 = \\vec{F} \\Delta t$$
- Xung lượng của lực tác dụng lên vật bằng độ biến thiên động lượng của vật đó.

### 3. Định luật Bảo toàn động lượng
- **Hệ kín (hệ cô lập)**: Là hệ chỉ có các nội lực tương tác giữa các vật trong hệ, không có ngoại lực tác dụng hoặc tổng ngoại lực bằng không.
- Tổng động lượng của một hệ kín được bảo toàn:
  $$\\vec{p}_1 + \\vec{p}_2 + \\dots = \\vec{p}_1' + \\vec{p}_2' + \\dots$$
- **Ứng dụng**:
  + Va chạm mềm: $m_1 \\vec{v}_1 + m_2 \\vec{v}_2 = (m_1 + m_2) \\vec{V}$.
  + Chuyển động bằng phản lực: $M\\vec{V} + m\\vec{v} = \\vec{0}$.`;
    }
  }

  // Không hardcode template chung chung: trả về rỗng để ưu tiên 100% dữ liệu bóc tách từ SGK thực tế
  return '';
};

/**
 * Trích xuất các Vector Chunks thuộc về bài học từ toàn bộ danh sách Chunks của cuốn sách
 */
export const getChunksForLesson = (lesson, allChunks = [], expectedSubject = '') => {
  if (!lesson || !Array.isArray(allChunks) || allChunks.length === 0) return [];

  const sub = (expectedSubject || '').toUpperCase();
  const valid = allChunks.filter(c => {
    const sType = (c.sectionType || '').toUpperCase();
    if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return false;
    if (isNonPedagogical(c.lessonName) && isNonPedagogical(c.patternName)) return false;
    if (sub && c.subjectCode && c.subjectCode.toUpperCase() !== sub) return false;
    return true;
  });

  if (valid.length === 0) return [];

  const aLName = normalizeViText(cleanPrefix(lesson.title || '', 'lesson'));

  // 1. Ưu tiên khớp chính xác hoặc chứa tên bài học (đã chuẩn hóa dấu thanh tiếng Việt hoá/hóa)
  if (aLName) {
    const matchedByName = valid.filter(c => {
      const cLName = normalizeViText(cleanPrefix(c.lessonName || '', 'lesson'));
      if (!cLName) return false;
      return cLName === aLName || cLName.includes(aLName) || aLName.includes(cLName);
    });
    if (matchedByName.length > 0) return matchedByName;
  }

  // 2. Nếu tên bài không khớp trực tiếp, đối chiếu theo phạm vi trang của bài học
  if (lesson.pageStart && lesson.pageEnd) {
    const matchedByPage = valid.filter(c => {
      const p = Number(c.pageNumber);
      return p >= Number(lesson.pageStart) && p <= Number(lesson.pageEnd);
    });
    if (matchedByPage.length > 0) return matchedByPage;
  }

  return [];
};

/**
 * Tự động bóc tách danh sách công thức KaTeX đặc trưng từ các đoạn trích SGK của bài học
 */
export const extractKeyFormulasFromChunks = (chunks = []) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];
  const results = [];
  const seen = new Set();

  const tryAdd = (rawFormula) => {
    const cleaned = (rawFormula || '').replace(/\s+/g, ' ').trim();
    if (cleaned.length < 3 || cleaned.length > 180) return;
    // Chỉ giữ các biểu thức thực sự là công thức/phương trình toán-lý-hóa
    const looksLikeFormula = /[=≈≠≤≥<>]|\\frac|\\rightarrow|\\xrightarrow|\\rightleftharpoons|\\Delta|\\sum|\\vec|\\sqrt|\\cdot|\\times|_\{|\^\{/.test(cleaned);
    if (!looksLikeFormula) return;
    const norm = cleaned.toLowerCase();
    if (seen.has(norm)) return;
    seen.add(norm);
    results.push(`$${cleaned}$`);
  };

  chunks.forEach(c => {
    const text = (c.text || c.content || c.contentSnippet || '').trim();
    if (!text) return;

    // 1. Block math $$...$$
    const blockMatches = text.matchAll(/\$\$([\s\S]+?)\$\$/g);
    for (const m of blockMatches) {
      tryAdd(m[1]);
    }
    // 2. Inline math $...$
    const inlineMatches = text.matchAll(/(?<!\$)\$(?!\$)([^$\n]{3,160}?)(?<!\$)\$(?!\$)/g);
    for (const m of inlineMatches) {
      tryAdd(m[1]);
    }
  });

  return results.slice(0, 12);
};

/**
 * Xây dựng tài liệu lý thuyết thuần chuẩn sư phạm, tổng hợp và cô đặc chi tiết từ các Vector Chunks trong CSDL
 * Tuyệt đối không ghi số trang SGK, không copy ồ ạt, phân chia theo cấu trúc trọng tâm đàng hoàng
 */
export const buildTheoryFromChunks = (chunks = [], lessonTitle = '', expectedSubject = '') => {
  if (!Array.isArray(chunks) || chunks.length === 0) return '';

  const cleanLesson = normalizeViText(lessonTitle || '');
  const sub = (expectedSubject || '').toUpperCase() || (
    cleanLesson.includes('hóa') || cleanLesson.includes('este') || cleanLesson.includes('halogen') ||
    cleanLesson.includes('enthalpy') || cleanLesson.includes('phản ứng') || cleanLesson.includes('nguyên tử') ||
    cleanLesson.includes('hydrocarbon') || cleanLesson.includes('cân bằng') ? 'CHEM' :
    cleanLesson.includes('vật lí') || cleanLesson.includes('vận tốc') || cleanLesson.includes('gia tốc') ||
    cleanLesson.includes('động lượng') || cleanLesson.includes('newton') ? 'PHYS' :
    cleanLesson.includes('toán') || cleanLesson.includes('xác suất') || cleanLesson.includes('hàm số') ||
    cleanLesson.includes('mệnh đề') || cleanLesson.includes('vectơ') ? 'MATH' : ''
  );

  const validChunks = chunks.filter(c => {
    const sType = (c.sectionType || '').toUpperCase();
    if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return false;

    // Lọc loại trừ chunks sai khác môn học (Cross-subject safety filter)
    if (sub && c.subjectCode) {
      const cSub = c.subjectCode.toUpperCase();
      if ((sub === 'MATH' && cSub !== 'MATH') ||
          (sub === 'CHEM' && cSub !== 'CHEM') ||
          (sub === 'PHYS' && cSub !== 'PHYS')) {
        return false;
      }
    }
    return true;
  });

  if (validChunks.length === 0) return '';

  // Nhóm các đoạn bóc tách theo dạng bài hoặc chủ điểm
  const patternGroups = new Map();
  const generalDefinitions = [];
  const formulasAndEquations = [];
  const importantNotes = [];

  const seenSentences = new Set();

  validChunks.forEach(c => {
    let text = (c.text || c.content || c.contentSnippet || c.Text || c.Content || c.content_snippet || '').trim();
    if (!text) return;

    // 1. Loại bỏ triệt để mọi thẻ [TAXONOMY: ...] rò rỉ từ AI Vision
    text = text.replace(/\[TAXONOMY\s*:[^\]]+\]/gi, '');
    // 2. Loại bỏ các dòng thông tin xuất bản, bản quyền, số trang kết thúc bài học
    text = text.replace(/^[ \t]*(?:Tên sách|Bộ sách|Tổng chủ biên|Chủ biên|Các tác giả|Nhà xuất bản|Chịu trách nhiệm xuất bản|Mã số sách|Giấy phép xuất bản|In tại)[^\r\n]*(\r?\n)?/gmi, '');
    text = text.replace(/\(Trang\s+\d+\s+là\s+trang\s+kết\s+thúc\s+bài\s+học[^\)]*\)/gi, '');
    // 3. Loại bỏ tiền tố/hậu tố số trang thô hoặc rác OCR
    text = text.replace(/^(Trang|Page)\s*\d+[:.\s-]*/gi, '');
    text = text.replace(/\[IMAGE_PLACEHOLDER:[^\]]+\]/g, '');

    // 4. Khắc phục ngắt dòng gãy ký tự / biến số toán học / hình học
    text = text.replace(/\r?\n\s*([,;:\.\)])/g, '$1');
    text = text.replace(/([\(])\s*\r?\n\s*/g, '$1');
    text = text.replace(/([A-Z]{1,2})\s*\r?\n\s*([,\.\:\;])/g, '$1$2');
    text = text.replace(/(vecto|vectơ|đoạn thẳng|điểm|đỉnh|tam giác|hình bình hành)\s*\r?\n\s*([A-Za-z0-9_]{1,3})/gi, '$1 $2');
    text = text.replace(/[\|\∣]\s*\r?\n\s*([A-Z]{1,2})\s*\r?\n\s*[\|\∣]/g, '|$1|');
    text = text.replace(/([A-Z]{2})\s*\r?\n\s*2\b/g, '$1^2');

    // 5. Chuẩn hóa vectơ và điểm hình học sang KaTeX nếu chưa có KaTeX
    text = text.replace(/\b(?:vecto|vectơ)\s+([A-Z]{2})(?![a-zA-Zà-ỹ])/gi, (match, p1) => 'vectơ $\\vec{' + p1 + '}$');
    text = text.replace(/\b(?:vecto|vectơ)\s+([a-z])(?![a-zA-Zà-ỹ])/gi, (match, p1) => 'vectơ $\\vec{' + p1 + '}$');
    text = text.replace(/[\|\∣]\s*([A-Za-z0-9_]{1,2})\s*[\|\∣]/g, (match, p1) => '$|\\vec{' + p1 + '}|$');

    // Bỏ qua nếu toàn bộ chunk chỉ là rác thông tin xuất bản
    const lowerClean = text.toLowerCase();
    if (lowerClean.includes('tổng chủ biên') || lowerClean.includes('nhà xuất bản') || (lowerClean.includes('tên sách:') && lowerClean.includes('bộ sách:'))) {
      return;
    }

    const rawPName = c.patternName && !isNonPedagogical(c.patternName)
      ? c.patternName.replace(/^[#\s]+/, '').trim()
      : '';
    const pName = rawPName ? cleanPrefix(rawPName, 'pattern') : '';

    // Tách các đoạn hoặc câu có giá trị khoa học
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    paragraphs.forEach(p => {
      // Bỏ qua các đoạn bài tập thô hoặc dòng tiêu đề lẻ
      if (/^(Câu|Bài|Bài tập|Luyện tập|Vận dụng)\s*\d+[:.\s-]/i.test(p) && p.length < 150) {
        return;
      }
      if (/^(Tên sách|Bộ sách|Tổng chủ biên|Chủ biên|Các tác giả|Nhà xuất bản|Chịu trách nhiệm)\b/i.test(p)) {
        return;
      }
      if (/^#+\s*$/i.test(p)) {
        return;
      }
      if (isGenericPlaceholder(p)) {
        return;
      }

      // Lọc bỏ ghi chú meta của AI Vision OCR (vd: "chứa các bài tập củng cố... không chứa lý thuyết mới")
      const pNorm = normalizeViText(p);
      if (
        pNorm.includes('không chứa lý thuyết mới') ||
        pNorm.includes('không chứa lí thuyết mới') ||
        pNorm.includes('thuộc phần bài tập cuối bài') ||
        pNorm.includes('chứa các bài tập củng cố') ||
        pNorm.includes('trang này chỉ chứa bài tập') ||
        pNorm.includes('không có nội dung lý thuyết') ||
        pNorm.includes('là trang kết thúc bài học')
      ) {
        return;
      }

      // Khử bài toán ví dụ giải mẫu chen ngang vào phần khái niệm
      if (/^(Ví dụ\s*\d*|Lời giải|Giải\s*:|Hướng dẫn giải)/i.test(p)) {
        if (pName) {
          if (!patternGroups.has(pName)) patternGroups.set(pName, []);
          if ((patternGroups.get(pName) || []).length < 2) patternGroups.get(pName).push(p);
        }
        return;
      }

      // Khử nội dung tạp nhiễm chéo môn học (Cross-subject contamination guard)
      const pLower = p.toLowerCase();
      if (sub === 'MATH') {
        if (pLower.includes('electron') || pLower.includes('phân lớp') || pLower.includes('orbital') ||
            pLower.includes('nguyên tử') || pLower.includes('hóa trị') || pLower.includes('halogen') ||
            pLower.includes('đồng phân') || pLower.includes('phản ứng thế')) {
          return;
        }
      } else if (sub === 'CHEM') {
        if (pLower.includes('bất phương trình bậc hai') || pLower.includes('bất đẳng thức') ||
            pLower.includes('vectơ') || pLower.includes('hình học toạ độ') || pLower.includes('không gian mẫu')) {
          return;
        }
      }

      // Chuẩn hóa phát hiện trùng lặp
      const normalizedSentence = p.toLowerCase().replace(/[\s\W_]+/g, ' ').trim();
      if (normalizedSentence.length > 20 && seenSentences.has(normalizedSentence)) {
        return;
      }
      seenSentences.add(normalizedSentence);

      // Phân loại nội dung cô đặc
      // 1. Lưu ý / Bẫy tư duy / Chú ý sư phạm
      if (/^(lưu\s*ý|chú\s*ý|đặc\s*biệt|lưu\s*tâm|điều\s*kiện|sai\s*lầm|bẫy)/i.test(p) || p.toLowerCase().includes('lưu ý')) {
        importantNotes.push(p);
      }
      // 2. Công thức toán, lý, phương trình phản ứng hóa học (KaTeX hoặc công thức)
      else if (
        p.includes('$$') || p.includes('\\frac') || p.includes('\\rightarrow') ||
        p.includes('\\Delta') || p.includes('\\sum') || p.includes('\\vec') ||
        p.includes('\\rightleftharpoons') || p.includes(' = ') || p.includes('\\cdot')
      ) {
        formulasAndEquations.push(p);
      }
      // 3. Phương pháp giải theo Dạng bài
      else if (pName && (/^(phương\s*pháp|dạng|cách\s*giải|vận\s*dụng|các\s*bước)/i.test(p) || (patternGroups.get(pName) || []).length < 2)) {
        if (!patternGroups.has(pName)) {
          patternGroups.set(pName, []);
        }
        patternGroups.get(pName).push(p);
      }
      // 4. Khái niệm, định nghĩa, nội dung lý thuyết trọng tâm
      else {
        generalDefinitions.push(p);
      }
    });
  });

  // Bảo đảm luôn có nội dung định nghĩa trọng tâm nếu chunks có dữ liệu
  if (generalDefinitions.length === 0 && patternGroups.size > 0) {
    patternGroups.forEach((items) => {
      items.forEach(it => {
        if (generalDefinitions.length < 6 && it.length > 40) {
          generalDefinitions.push(it);
        }
      });
    });
  }

  // Xây dựng văn bản lý thuyết thuần chuẩn mực, cô đặc, chia cấu trúc đàng hoàng
  const doc = [];

  // Mục 1: Khái niệm & Định nghĩa cốt lõi
  const coreTexts = generalDefinitions.slice(0, 8);
  if (coreTexts.length > 0) {
    doc.push(`### 1. Khái Niệm & Định Nghĩa Trọng Tâm`);
    coreTexts.forEach(item => {
      doc.push(`- ${item}`);
    });
  }

  // Mục 2: Công thức & Phương trình Đặc trưng
  if (formulasAndEquations.length > 0) {
    doc.push(`\n### 2. Công Thức & Phương Trình Đặc Trưng`);
    formulasAndEquations.slice(0, 6).forEach(eq => {
      doc.push(eq);
    });
  }

  // Mục 3: Phân Loại Dạng Bài & Trọng Tâm Vận Dụng
  if (patternGroups.size > 0) {
    doc.push(`\n### 3. Phân Loại Dạng Bài & Trọng Tâm Vận Dụng`);
    let pIdx = 1;
    patternGroups.forEach((items, pName) => {
      const cleanName = cleanPrefix(pName.replace(/^[#\s]+/, ''), 'pattern');
      const validItems = items.filter(it =>
        !it.startsWith('Tên sách') &&
        !it.startsWith('Bộ sách') &&
        !it.startsWith('Tổng chủ biên') &&
        !it.includes('Nhà xuất bản')
      );
      if (validItems.length > 0 || cleanName) {
        doc.push(`\n#### ${cleanName || pName}`);
        validItems.slice(0, 3).forEach(it => {
          const cleanIt = String(it || '').replace(/^#{1,4}\s+/gm, '').replace(/\s*#{2,4}\s+/g, '\n').trim();
          if (cleanIt) doc.push(`- ${cleanIt}`);
        });
        pIdx++;
      }
    });
  }

  // Mục 4: Lưu ý Sư phạm & Bẫy Tư duy Thường Gặp
  if (importantNotes.length > 0) {
    doc.push(`\n### 4. Lưu Ý Sư Phạm & Bẫy Tư Duy`);
    importantNotes.slice(0, 4).forEach(n => {
      doc.push(`> ⚠️ **Lưu ý**: ${n}`);
    });
  }

  // Nếu chưa có phân mục chi tiết, gom tụ mượt mà không kèm nhãn trang
  if (doc.length === 0) {
    const rawFiltered = validChunks
      .map(c => {
        let t = (c.text || c.content || c.contentSnippet || '').trim();
        t = t.replace(/\[TAXONOMY\s*:[^\]]+\]/gi, '');
        t = t.replace(/^[ \t]*(?:Tên sách|Bộ sách|Tổng chủ biên|Chủ biên|Các tác giả|Nhà xuất bản|Chịu trách nhiệm xuất bản)[^\r\n]*(\r?\n)?/gmi, '');
        return t.replace(/^(Trang|Page)\s*\d+[:.\s-]*/gi, '').trim();
      })
      .filter(Boolean);
    return rawFiltered.slice(0, 10).join('\n\n');
  }

  return doc.join('\n\n');
};

/**
 * Trích xuất các Ví dụ mẫu & Lời giải bóc tách trực tiếp từ Vector Chunks SGK
 */
export const extractExamplesFromChunks = (chunks = []) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];
  const examples = [];
  const seen = new Set();

  chunks.forEach(c => {
    const sType = (c.sectionType || '').toUpperCase();
    if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return;

    let text = (c.text || c.content || c.contentSnippet || '').trim();
    if (!text) return;
    text = text
      .replace(/\[TAXONOMY\s*:[^\]]+\]/gi, '')
      .replace(/\[IMAGE_PLACEHOLDER:[^\]]+\]/g, '')
      .replace(/^(Trang|Page)\s*\d+[:.\s-]*/gi, '')
      .trim();

    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      if (/^(Ví\s*dụ\s*\d*|Thí\s*dụ\s*\d*|Bài\s*toán\s*mẫu|Câu\s*hỏi\s*mẫu)/i.test(p) || sType === 'EXAMPLE') {
        let prompt = p;
        let solution = '';
        // Nếu đoạn kế tiếp là lời giải/hướng dẫn giải thì ghép cặp luôn
        if (i + 1 < paragraphs.length && /^(Lời\s*giải|Giải\s*:|Hướng\s*dẫn\s*giải|Trả\s*lời)/i.test(paragraphs[i + 1])) {
          solution = paragraphs[i + 1];
          i++;
        } else {
          // Hoặc tách phần "Lời giải:" nằm cùng đoạn
          const splitMatch = p.match(/([\s\S]+?)\n+(?=(?:Lời\s*giải|Giải\s*:|Hướng\s*dẫn\s*giải))/i);
          if (splitMatch) {
            prompt = splitMatch[1].trim();
            solution = p.slice(splitMatch[1].length).trim();
          }
        }

        const normKey = normalizeViText(prompt).slice(0, 80);
        if (normKey && !seen.has(normKey) && prompt.length >= 20) {
          seen.add(normKey);
          examples.push({
            pageNumber: c.pageNumber || null,
            prompt,
            solution
          });
        }
      }
    }
  });

  return examples.slice(0, 6);
};

/**
 * Tổng hợp Phương Pháp Giải Cơ Bản Chuẩn SGK (Khối 2) cho Dạng bài từ:
 * 1. Gợi ý phương pháp ngắn từ khung cấu trúc (nếu có)
 * 2. Công thức & Hệ thức KaTeX thực tế bóc từ bài học / chunks SGK
 * 3. Các đoạn hướng dẫn giải, quy tắc tính toán & lưu ý bóc trực tiếp từ chunks SGK
 * 4. Ví dụ minh họa kèm lời giải bóc từ SGK (nếu có)
 */
export const buildMethodFromChunks = (chunks = [], lesson = null, pattern = null, expectedSubject = '') => {
  const validChunks = Array.isArray(chunks)
    ? chunks.filter(c => {
        const sType = (c.sectionType || '').toUpperCase();
        if (sType === 'COVER' || sType === 'PREFACE' || sType === 'INDEX') return false;
        const sub = (expectedSubject || '').toUpperCase();
        if (sub && c.subjectCode && c.subjectCode.toUpperCase() !== sub) return false;
        return true;
      })
    : [];

  const rawHint = (pattern?.method && !isGenericPlaceholder(pattern.method))
    ? pattern.method.trim()
    : ((pattern?.description && !isGenericPlaceholder(pattern.description)) ? pattern.description.trim() : '');

  const lessonFormulas = Array.isArray(lesson?.keyFormulas) && lesson.keyFormulas.length > 0
    ? lesson.keyFormulas
    : extractKeyFormulasFromChunks(validChunks);

  // Nếu không có chunks, không có công thức và cũng không có gợi ý phương pháp thì trả về rỗng
  if (validChunks.length === 0 && lessonFormulas.length === 0 && !rawHint) {
    return '';
  }

  const methodSnippets = [];
  const cautionNotes = [];
  const seen = new Set();

  validChunks.forEach(c => {
    let text = (c.text || c.content || c.contentSnippet || '').trim();
    if (!text) return;
    text = text
      .replace(/\[TAXONOMY\s*:[^\]]+\]/gi, '')
      .replace(/\[IMAGE_PLACEHOLDER:[^\]]+\]/g, '')
      .replace(/^[ \t]*(?:Tên sách|Bộ sách|Tổng chủ biên|Chủ biên|Các tác giả|Nhà xuất bản|Chịu trách nhiệm xuất bản)[^\r\n]*(\r?\n)?/gmi, '')
      .replace(/^(Trang|Page)\s*\d+[:.\s-]*/gi, '')
      .trim();

    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    paragraphs.forEach(p => {
      const pNorm = normalizeViText(p);
      if (
        p.length < 25 ||
        isGenericPlaceholder(p) ||
        pNorm.includes('không chứa lý thuyết mới') ||
        pNorm.includes('thuộc phần bài tập cuối bài') ||
        pNorm.includes('chứa các bài tập củng cố') ||
        pNorm.includes('tổng chủ biên') ||
        pNorm.includes('nhà xuất bản')
      ) {
        return;
      }

      const key = pNorm.replace(/[\s\W_]+/g, ' ').slice(0, 70);
      if (seen.has(key)) return;

      if (/^(lưu\s*ý|chú\s*ý|điều\s*kiện|sai\s*lầm|nhận\s*xét|quy\s*ước)/i.test(p)) {
        seen.add(key);
        if (cautionNotes.length < 3) cautionNotes.push(p);
      } else if (
        !/^(Ví\s*dụ\s*\d*|Thí\s*dụ\s*\d*|Lời\s*giải|Giải\s*:|Hướng\s*dẫn\s*giải)/i.test(p) &&
        (
          /^(phương\s*pháp|cách\s*giải|các\s*bước|bước\s*\d|quy\s*tắc|hướng\s*dẫn|để\s*tính|để\s*xác\s*định|ta\s*có|áp\s*dụng)/i.test(p) ||
          (p.includes('=') && (p.includes('$') || p.includes('\\frac') || p.includes('\\cdot') || p.includes('\\times')))
        )
      ) {
        seen.add(key);
        if (methodSnippets.length < 4) methodSnippets.push(p);
      }
    });
  });

  const examples = extractExamplesFromChunks(validChunks);
  const patLabel = cleanPrefix(pattern?.name || lesson?.title || 'Dạng bài trọng tâm', 'pattern') || pattern?.name || '';
  const lesLabel = cleanPrefix(lesson?.title || '', 'lesson') || lesson?.title || '';

  const sections = [];

  // 1. Hướng tiếp cận cốt lõi
  sections.push(`### 1. Hướng Tiếp Cận Cơ Bản (${patLabel})`);
  if (rawHint) {
    sections.push(`- **Ý tưởng cốt lõi**: ${rawHint}`);
  }
  if (lesLabel) {
    sections.push(`- **Cơ sở kiến thức áp dụng**: Vận dụng định nghĩa, tính chất và hệ thức trọng tâm của bài **${lesLabel}**.`);
  }

  // 2. Công thức & Hệ thức áp dụng trực tiếp
  if (lessonFormulas.length > 0) {
    sections.push(`\n### 2. Công Thức & Hệ Thức Áp Dụng`);
    lessonFormulas.slice(0, 6).forEach(f => {
      const formatted = f.trim().startsWith('$') ? f.trim() : `$${f.trim()}$`;
      sections.push(`- ${formatted}`);
    });
  }

  // 3. Các bước giải cơ bản chuẩn SGK
  const stepNum = lessonFormulas.length > 0 ? 3 : 2;
  sections.push(`\n### ${stepNum}. Quy Trình Các Bước Giải Cơ Bản`);
  sections.push(`- **Bước 1 (Tóm tắt & Phân tích dữ kiện)**: Đọc kỹ đề bài thuộc dạng *${patLabel}*, xác định rõ các đại lượng đã cho, đại lượng cần tìm và đổi đơn vị về chuẩn thống nhất.`);
  sections.push(
    rawHint
      ? `- **Bước 2 (Thiết lập phương trình / Công thức)**: ${rawHint}${lessonFormulas.length > 0 ? ' — kết hợp các hệ thức trọng tâm đã tổng hợp ở trên.' : '.'}`
      : `- **Bước 2 (Thiết lập phương trình / Công thức)**: Chọn công thức liên hệ trực tiếp giữa giả thiết và yêu cầu bài toán từ cơ sở lý thuyết bài học.`
  );
  sections.push(`- **Bước 3 (Biến đổi & Tính toán)**: Thay số liệu cẩn thận, rút gọn biểu thức hoặc giải hệ phương trình để tìm giá trị ẩn số.`);
  sections.push(`- **Bước 4 (Kiểm tra điều kiện & Kết luận)**: Kiểm tra tính hợp lí về dấu, thứ nguyên/đơn vị và đối chiếu với điều kiện bài toán trước khi kết luận.`);

  if (methodSnippets.length > 0) {
    sections.push(`\n### ${stepNum + 1}. Chi Tiết Biến Đổi & Quy Tắc Trích Từ SGK`);
    methodSnippets.forEach(s => {
      sections.push(`- ${s}`);
    });
  }

  if (examples.length > 0) {
    sections.push(`\n### Ví Dụ Minh Họa Bóc Tách Từ SGK`);
    examples.slice(0, 2).forEach(ex => {
      sections.push(`- ${ex.prompt}`);
      if (ex.solution) {
        sections.push(`  > ${ex.solution}`);
      }
    });
  }

  if (cautionNotes.length > 0) {
    sections.push(`\n### Lưu Ý & Bẫy Thường Gặp`);
    cautionNotes.forEach(n => {
      sections.push(`> ⚠️ ${n}`);
    });
  }

  return sections.join('\n\n');
};

/**
 * Lấy cấu trúc chuẩn GDPT 2018 theo Môn học và Khối lớp
 */
export const getGdptPreset = (subjectCode = 'PHYS', grade = 10) => {
  const key = `${subjectCode}_${grade}`;
  if (GDPT_PRESETS[key]) {
    return JSON.parse(JSON.stringify(GDPT_PRESETS[key]));
  }
  // Fallback: PHYS_10
  return JSON.parse(JSON.stringify(GDPT_PRESETS['PHYS_10']));
};

/**
 * Lọc sạch 100% các mục rác (Bìa sách, Trang trắng, N/A, Mục lục) khỏi cấu trúc Chương, Bài học và Dạng bài
 */
export const filterPedagogicalChapters = (chapters = []) => {
  if (!Array.isArray(chapters)) return [];
  return chapters
    .filter(ch => ch && !isNonPedagogical(ch.title))
    .map((ch, chIdx) => {
      const validLessons = (ch.lessons || [])
        .filter(l => l && !isNonPedagogical(l.title))
        .map((l, lIdx) => ({
          ...l,
          lessonNumber: lIdx + 1,
          patterns: (l.patterns || []).filter(p => p && !isNonPedagogical(p.name))
        }));
      return {
        ...ch,
        chapterNumber: chIdx + 1,
        lessons: validLessons
      };
    })
    .filter(ch => ch.lessons && ch.lessons.length > 0);
};

const DEFAULT_STATE = {
  selectedSourceId: '',
  fileName: '',
  subjectCode: 'PHYS',
  subjectName: 'Vật lí',
  grade: 10,
  bookEdition: 'Cánh Diều',
  versionTag: '2025-2026',
  selectedChapterIdx: 0,
  selectedLessonIdx: 0,
  selectedPatternIdx: 0
};

const ACTIVE_CTX_LOCAL_KEY = 'veval_active_textbook_context_v2';

export const getStoredTextbookContext = () => {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && (parsed.selectedSourceId || parsed.fileName)) {
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch {}
  try {
    const rawLocal = localStorage.getItem(ACTIVE_CTX_LOCAL_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && (parsed.selectedSourceId || parsed.fileName)) {
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_STATE;
};

export const saveStoredTextbookContext = (updates) => {
  try {
    const current = getStoredTextbookContext();
    // Tuyệt đối không nhồi toàn bộ mảng chapters khổng lồ vào context pointer (tránh tràn quota 5MB)
    const { chapters: _omitChapters, ...safeUpdates } = updates || {};
    const { chapters: _omitCurrChapters, ...safeCurrent } = current || {};
    const merged = { ...safeCurrent, ...safeUpdates };
    const serialized = JSON.stringify(merged);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(ACTIVE_CTX_LOCAL_KEY, serialized);
    return merged;
  } catch {
    return DEFAULT_STATE;
  }
};

/**
 * Thu gọn payload SGK trước khi ghi localStorage (giảm 75-90% dung lượng, tránh QuotaExceededError)
 * - Giữ nguyên 100% cấu trúc Chương/Bài/Dạng bài, Bloom, Bài tập, Công thức, và mọi Lý thuyết/Phương pháp đã chỉnh sửa
 * - Nếu đã có sourceId trên CSDL, bỏ qua text `les.theory` tự sinh chưa sửa (vì luôn tái tạo tức thì từ chunks DB)
 */
const compactSkeletonForStorage = (skeleton, hasSourceInDb = false) => {
  if (!skeleton) return skeleton;
  return {
    ...skeleton,
    chapters: (skeleton.chapters || []).map(ch => ({
      ...ch,
      lessons: (ch.lessons || []).map(les => {
        const keepTheory = !hasSourceInDb || Boolean(les.isEdited);
        return {
          ...les,
          theory: keepTheory ? (les.theory || '') : '',
          patterns: (les.patterns || []).map(pat => ({
            ...pat,
            exercises: Array.isArray(pat.exercises) ? pat.exercises : []
          }))
        };
      })
    }))
  };
};

const readStorageEntry = (key) => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.isPointer && parsed.targetKey && parsed.targetKey !== key) {
      const targetRaw = localStorage.getItem(parsed.targetKey);
      if (targetRaw) {
        return JSON.parse(targetRaw);
      }
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Lấy dữ liệu SGK đã lưu từ localStorage theo đúng sourceId / fileName (hỗ trợ pointer chống trùng lặp và chống lấy nhầm sách khác)
 */
export const getSavedTextbookData = (sourceId, fileName) => {
  const keys = [];
  if (sourceId) keys.push(`veval_textbook_saved_${sourceId}`);
  if (fileName) {
    keys.push(`veval_textbook_saved_file_${fileName}`);
    keys.push(`veval_textbook_saved_${fileName}`);
  }

  for (const k of keys) {
    const parsed = readStorageEntry(k);
    if (parsed && (parsed.skeleton || parsed.textbookExercises || parsed.chapters)) {
      return parsed;
    }
  }

  // Kiểm tra khóa mặc định: chỉ trả về nếu không truyền filter HOẶC khớp đúng cuốn sách đang hỏi
  const defParsed = readStorageEntry('veval_textbook_saved_default');
  if (defParsed && (defParsed.skeleton || defParsed.textbookExercises || defParsed.chapters)) {
    const noFilter = !sourceId && !fileName;
    const matchesSource = sourceId && defParsed.sourceId && String(defParsed.sourceId) === String(sourceId);
    const matchesFile = fileName && (
      (defParsed.fileName && defParsed.fileName.toLowerCase().trim() === fileName.toLowerCase().trim()) ||
      (defParsed.skeleton?.fileName && defParsed.skeleton.fileName.toLowerCase().trim() === fileName.toLowerCase().trim())
    );
    if (noFilter || matchesSource || matchesFile) {
      return defParsed;
    }
  }

  return null;
};

/**
 * Lưu dữ liệu SGK bền vững (1 bản duy nhất đã nén + pointer nhẹ, tự động dọn khóa cũ nếu đầy Quota)
 */
export const saveTextbookData = ({ sourceId, fileName, skeleton, textbookExercises = [] }) => {
  if (!skeleton) return false;
  const resolvedSourceId = sourceId || '';
  const resolvedFileName = fileName || skeleton.fileName || '';
  const canonicalKey = resolvedSourceId
    ? `veval_textbook_saved_${resolvedSourceId}`
    : (resolvedFileName ? `veval_textbook_saved_file_${resolvedFileName}` : 'veval_textbook_saved_default');

  const compactSkeleton = compactSkeletonForStorage(skeleton, Boolean(resolvedSourceId));
  const payload = {
    sourceId: resolvedSourceId,
    fileName: resolvedFileName,
    skeleton: compactSkeleton,
    // Chỉ lưu textbookExercises nếu chưa nằm sẵn trong chapters (tránh nhân đôi dung lượng)
    textbookExercises: Array.isArray(textbookExercises) && textbookExercises.length <= 200 ? textbookExercises : [],
    savedAt: new Date().toISOString()
  };

  const str = JSON.stringify(payload);
  const pointerStr = JSON.stringify({
    isPointer: true,
    targetKey: canonicalKey,
    sourceId: resolvedSourceId,
    fileName: resolvedFileName,
    savedAt: payload.savedAt
  });

  const writeAll = () => {
    localStorage.setItem(canonicalKey, str);
    if (canonicalKey !== 'veval_textbook_saved_default') {
      localStorage.setItem('veval_textbook_saved_default', pointerStr);
    }
    if (resolvedFileName) {
      const fileAlias = `veval_textbook_saved_file_${resolvedFileName}`;
      if (fileAlias !== canonicalKey) {
        localStorage.setItem(fileAlias, pointerStr);
      }
      // Xóa bản đầy đủ cũ dạng legacy key nếu trùng tên file để giải phóng quota
      const legacyKey = `veval_textbook_saved_${resolvedFileName}`;
      if (legacyKey !== canonicalKey) {
        try { localStorage.removeItem(legacyKey); } catch {}
      }
    }
  };

  try {
    writeAll();
  } catch (err) {
    // Tự phục hồi khi localStorage đầy (QuotaExceededError): dọn bớt các khóa legacy/trùng lặp cũ rồi ghi lại
    try {
      const keysToEvict = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('veval_textbook_saved_') && k !== canonicalKey && k !== 'veval_textbook_saved_default') {
          keysToEvict.push(k);
        }
      }
      keysToEvict.forEach(k => localStorage.removeItem(k));
      writeAll();
    } catch (retryErr) {
      console.warn('Lỗi lưu trữ dữ liệu SGK (vượt giới hạn bộ nhớ trình duyệt):', retryErr);
      return false;
    }
  }

  saveStoredTextbookContext({
    selectedSourceId: resolvedSourceId,
    fileName: resolvedFileName,
    subjectCode: skeleton.subjectCode,
    subjectName: skeleton.subjectName,
    grade: skeleton.grade,
    bookEdition: skeleton.bookEdition,
    versionTag: skeleton.versionTag
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('veval:textbook-saved', { detail: payload }));
  }
  return true;
};

/**
 * Hợp nhất bài tập, lý thuyết đã biên soạn và phương pháp giải đã lưu vào cây cấu trúc chương/bài học
 */
export const mergeSavedExercisesIntoChapters = (targetChapters = [], savedData) => {
  if (!targetChapters || targetChapters.length === 0) {
    if (savedData?.skeleton?.chapters && savedData.skeleton.chapters.length > 0) {
      return savedData.skeleton.chapters;
    }
    return [];
  }
  if (!savedData) return targetChapters;

  const savedLessonMap = new Map();
  const savedPatternMap = new Map();
  const allSavedExercises = [];

  const sourceChapters = savedData.skeleton?.chapters || savedData.chapters || [];
  sourceChapters.forEach(ch => {
    (ch.lessons || []).forEach(les => {
      const lKey = normalizeViText(cleanPrefix(les.title, 'lesson'));
      if (lKey) {
        const hasValidTheory = les.theory && !isGenericPlaceholder(les.theory);
        const hasFormulas = Array.isArray(les.keyFormulas) && les.keyFormulas.length > 0;
        if (hasValidTheory || hasFormulas || les.isEdited) {
          savedLessonMap.set(lKey, {
            theory: hasValidTheory ? les.theory : '',
            isEdited: !!les.isEdited,
            keyFormulas: hasFormulas ? les.keyFormulas : []
          });
        }
      }

      (les.patterns || []).forEach(pat => {
        const pKey = `${lKey}__${normalizeViText(cleanPrefix(pat.name, 'pattern'))}`;
        const hasValidRecap = pat.theoryRecap && !isGenericPlaceholder(pat.theoryRecap);
        const hasValidMethod = (pat.method && !isGenericPlaceholder(pat.method)) || (pat.solutionMethod && !isGenericPlaceholder(pat.solutionMethod));
        const hasExercises = Array.isArray(pat.exercises) && pat.exercises.length > 0;

        if (hasExercises || hasValidRecap || hasValidMethod || pat.isEdited) {
          savedPatternMap.set(pKey, {
            bloomLevel: pat.bloomLevel,
            exercises: pat.exercises || [],
            theoryRecap: hasValidRecap ? pat.theoryRecap : '',
            method: (pat.method && !isGenericPlaceholder(pat.method)) ? pat.method : '',
            solutionMethod: (pat.solutionMethod && !isGenericPlaceholder(pat.solutionMethod)) ? pat.solutionMethod : '',
            isEdited: !!pat.isEdited
          });
          if (hasExercises) {
            allSavedExercises.push(...pat.exercises);
          }
        }
      });
    });
  });

  if (savedData.textbookExercises && savedData.textbookExercises.length > 0) {
    allSavedExercises.push(...savedData.textbookExercises);
  }

  return targetChapters.map(ch => {
    const lessons = (ch.lessons || []).map(les => {
      const lKey = normalizeViText(cleanPrefix(les.title, 'lesson'));
      const savedLes = savedLessonMap.get(lKey);

      const patterns = (les.patterns || []).map(pat => {
        const pKey = `${lKey}__${normalizeViText(cleanPrefix(pat.name, 'pattern'))}`;
        const found = savedPatternMap.get(pKey);
        const existing = pat.exercises || [];

        let mergedExercises = existing;
        if (found?.exercises && found.exercises.length > 0) {
          const idSet = new Set(existing.map(e => e.id || e.stem));
          const toAdd = found.exercises.filter(e => !idSet.has(e.id || e.stem));
          mergedExercises = [...existing, ...toAdd];
        }

        const currentRecap = (pat.theoryRecap && !isGenericPlaceholder(pat.theoryRecap)) ? pat.theoryRecap : '';
        const currentMethod = (pat.method && !isGenericPlaceholder(pat.method)) ? pat.method : '';
        const currentSolMethod = (pat.solutionMethod && !isGenericPlaceholder(pat.solutionMethod)) ? pat.solutionMethod : '';

        return {
          ...pat,
          bloomLevel: found?.bloomLevel || pat.bloomLevel || 2,
          theoryRecap: found?.theoryRecap || currentRecap,
          method: found?.method || currentMethod,
          solutionMethod: found?.solutionMethod || currentSolMethod,
          isEdited: Boolean(found?.isEdited || pat.isEdited),
          exercises: mergedExercises
        };
      });

      const currentLesTheory = (les.theory && !isGenericPlaceholder(les.theory)) ? les.theory : '';
      const mergedTheory = (savedLes?.isEdited && savedLes?.theory)
        ? savedLes.theory
        : (currentLesTheory || savedLes?.theory || '');
      const mergedFormulas = (les.keyFormulas && les.keyFormulas.length > 0)
        ? les.keyFormulas
        : (savedLes?.keyFormulas || []);

      return {
        ...les,
        theory: mergedTheory,
        isEdited: Boolean(savedLes?.isEdited || les.isEdited),
        keyFormulas: mergedFormulas,
        patterns
      };
    });
    return { ...ch, lessons };
  });
};

/**
 * So sánh giữa cây chương dựng từ chunks thô và cây chương người dùng đã quét Bước 1 / biên soạn & lưu:
 * Luôn ưu tiên bảo toàn cây đã lưu của người dùng khi đầy đủ hơn (tránh việc F5 bị chunks thô đè mất bài/dạng bài)
 */
export const resolvePersistedChapters = (detectedChapters = [], cachedData = null, fallbackChapters = []) => {
  const cachedChapters = filterPedagogicalChapters(cachedData?.skeleton?.chapters || cachedData?.chapters || []);
  const cleanDetected = filterPedagogicalChapters(detectedChapters);

  const countMetrics = (chs) => {
    let lessons = 0;
    let patterns = 0;
    (chs || []).forEach(c => {
      (c.lessons || []).forEach(l => {
        lessons++;
        patterns += (l.patterns || []).length;
      });
    });
    return { chapters: (chs || []).length, lessons, patterns };
  };

  if (cachedChapters.length > 0) {
    if (cleanDetected.length === 0) {
      return mergeSavedExercisesIntoChapters(cachedChapters, cachedData);
    }
    const cm = countMetrics(cachedChapters);
    const dm = countMetrics(cleanDetected);
    const userSaved = Boolean(cachedData?.skeleton?.hasUserSavedStructure);
    if (userSaved || cm.lessons > dm.lessons || cm.patterns > dm.patterns) {
      return mergeSavedExercisesIntoChapters(cachedChapters, cachedData);
    }
  }

  const base = cleanDetected.length > 0
    ? cleanDetected
    : (cachedChapters.length > 0 ? cachedChapters : fallbackChapters);
  return mergeSavedExercisesIntoChapters(base, cachedData);
};

/**
 * Xóa sạch dữ liệu cache localStorage/sessionStorage của một cuốn SGK đã bị xóa khỏi CSDL
 * và phát tín hiệu real-time để Khung chương trình & Dàn kiến thức làm mới ngay lập tức
 */
export const clearSavedTextbookData = (sourceId, fileName = '') => {
  try {
    if (sourceId) localStorage.removeItem(`veval_textbook_saved_${sourceId}`);
    if (fileName) {
      localStorage.removeItem(`veval_textbook_saved_${fileName}`);
      localStorage.removeItem(`veval_textbook_saved_file_${fileName}`);
    }

    // Nếu cache mặc định đang trỏ/lưu đúng cuốn sách bị xóa thì xóa luôn để không còn "bóng ma" sách cũ
    const rawDefault = localStorage.getItem('veval_textbook_saved_default');
    if (rawDefault) {
      const parsed = JSON.parse(rawDefault);
      if (
        (sourceId && parsed?.sourceId === sourceId) ||
        (fileName && (parsed?.fileName === fileName || parsed?.skeleton?.fileName === fileName))
      ) {
        localStorage.removeItem('veval_textbook_saved_default');
      }
    }

    [sessionStorage, localStorage].forEach((st, idx) => {
      const key = idx === 0 ? STORAGE_KEY : ACTIVE_CTX_LOCAL_KEY;
      const rawCtx = st.getItem(key);
      if (rawCtx) {
        const parsedCtx = JSON.parse(rawCtx);
        if (
          (sourceId && parsedCtx?.selectedSourceId === sourceId) ||
          (fileName && parsedCtx?.fileName === fileName)
        ) {
          st.removeItem(key);
        }
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('veval:textbook-deleted', { detail: { sourceId, fileName } }));
    }
    return true;
  } catch (err) {
    console.warn('Lỗi dọn cache SGK đã xóa:', err);
    return false;
  }
};

export const STUDIO_OVERRIDES_STORAGE_KEY = 'veval_textbook_saved_studio_overrides';

/**
 * Kiểm tra chuỗi có phải định dạng GUID 36 ký tự chuẩn của PostgreSQL / ASP.NET Core hay không
 */
export const isValidGuid = (val) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

/**
 * Tra cứu nội dung đã chỉnh sửa / AI mở rộng / bài tập từ kho lưu trữ SGK (chỉ duyệt các sourceId còn tồn tại trong DB)
 * giúp Khung Chương Trình & Dàn Kiến Thức đồng bộ 100% với SGK mà không bị bóng ma dữ liệu từ sách đã xóa
 */
export const findSavedNodeData = (lessonName = '', patternName = '', activeSourceIds = []) => {
  if (typeof localStorage === 'undefined') return null;
  const targetLesson = normalizeViText(cleanPrefix(lessonName || '', 'lesson'));
  const targetPattern = normalizeViText(cleanPrefix(patternName || '', 'pattern'));
  if (!targetLesson && !targetPattern) return null;

  const validIdSet = Array.isArray(activeSourceIds) && activeSourceIds.length > 0
    ? new Set(activeSourceIds.map(String))
    : null;

  // Luôn ưu tiên kiểm tra bản ghi vừa được giảng viên chỉnh sửa trực tiếp trong Studio
  const candidateKeys = [STUDIO_OVERRIDES_STORAGE_KEY];
  if (validIdSet) {
    validIdSet.forEach(sid => candidateKeys.push(`veval_textbook_saved_${sid}`));
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        k.startsWith('veval_textbook_saved_') &&
        k !== 'veval_textbook_saved_default' &&
        k !== STUDIO_OVERRIDES_STORAGE_KEY
      ) {
        candidateKeys.push(k);
      }
    }
    candidateKeys.push('veval_textbook_saved_default');
  }

  for (const k of candidateKeys) {
    try {
      const parsed = readStorageEntry(k);
      if (!parsed) continue;
      if (
        k !== STUDIO_OVERRIDES_STORAGE_KEY &&
        validIdSet &&
        parsed?.sourceId &&
        !validIdSet.has(String(parsed.sourceId))
      ) {
        continue;
      }
      const chapters = parsed?.skeleton?.chapters || parsed?.chapters || [];

      for (const ch of chapters) {
        for (const les of (ch.lessons || [])) {
          const lKey = normalizeViText(cleanPrefix(les.title || '', 'lesson'));
          const lessonMatched = targetLesson && lKey && (lKey === targetLesson || lKey.includes(targetLesson) || targetLesson.includes(lKey));

          for (const pat of (les.patterns || [])) {
            const pKey = normalizeViText(cleanPrefix(pat.name || '', 'pattern'));
            const patternMatched = targetPattern && pKey && (pKey === targetPattern || pKey.includes(targetPattern) || targetPattern.includes(pKey));

            if (patternMatched || (lessonMatched && !targetPattern)) {
              return { sourceId: parsed.sourceId || '', lesson: les, pattern: pat };
            }
          }

          if (lessonMatched) {
            return { sourceId: parsed.sourceId || '', lesson: les, pattern: les.patterns?.[0] || null };
          }
        }
      }
    } catch {}
  }

  return null;
};

/**
 * Lưu thay đổi từ Studio (CurriculumStudioEditor / TextbookStudioView) vào kho dữ liệu SGK bền vững
 * đảm bảo F5 tải lại trang hoặc chuyển đổi qua lại giữa SGK Chuẩn <-> Nạp SGK <-> Khung Chương Trình luôn giữ 100% nội dung vừa sửa
 */
export const saveStudioPatternToTextbookStorage = ({
  context = null,
  domain = null,
  chapter = null,
  lesson = null,
  pattern = null,
  updatedFields = {}
}) => {
  if (typeof localStorage === 'undefined') return false;

  const ctx = context || getStoredTextbookContext();
  const lessonTitle = (lesson?.title || lesson?.name || ctx?.activeLessonTitle || 'Bài 1: Nội dung trọng tâm').trim();
  const chapterTitle = (chapter?.title || chapter?.name || ctx?.activeChapterTitle || 'Chương 1: Kiến thức trọng tâm').trim();
  const oldPatternName = (pattern?.name || pattern?.patternName || ctx?.activePatternName || '').trim();
  const newPatternName = (updatedFields.name || oldPatternName || `Dạng 1: Trọng tâm ${cleanPrefix(lessonTitle, 'lesson') || lessonTitle}`).trim();

  const normLesTarget = normalizeViText(cleanPrefix(lessonTitle, 'lesson'));
  const normPatOld = normalizeViText(cleanPrefix(oldPatternName, 'pattern'));
  const normPatNew = normalizeViText(cleanPrefix(newPatternName, 'pattern'));

  const buildSampleExercise = (sq) => {
    if (!sq || !sq.contentLatex || !String(sq.contentLatex).trim()) return null;
    const corrChar = String(sq.correctOption || 'A').toUpperCase().trim()[0] || 'A';
    const corrIdx = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(corrChar));
    return {
      id: sq.questionId || `studio_ex_${Date.now()}`,
      stem: sq.contentLatex.trim(),
      contentLatex: sq.contentLatex.trim(),
      options: [
        sq.optionA || '',
        sq.optionB || '',
        sq.optionC || '',
        sq.optionD || ''
      ],
      optionA: sq.optionA || '',
      optionB: sq.optionB || '',
      optionC: sq.optionC || '',
      optionD: sq.optionD || '',
      correctIndex: corrIdx,
      correctOption: corrChar,
      bloomLevel: Number(sq.difficultyLevel) || Number(updatedFields.bloomLevel) || 2,
      difficultyLevel: Number(sq.difficultyLevel) || Number(updatedFields.bloomLevel) || 2,
      solution: sq.explanation || '',
      explanation: sq.explanation || ''
    };
  };

  const sampleEx = buildSampleExercise(updatedFields.sampleQuestion);

  const applyUpdateToPattern = (pat, pIdx = 0) => {
    const existingExercises = Array.isArray(pat?.exercises) ? [...pat.exercises] : [];
    if (sampleEx) {
      const existingIdx = existingExercises.findIndex(
        e =>
          (sampleEx.id && e.id === sampleEx.id) ||
          normalizeViText(e.stem || e.contentLatex || '') === normalizeViText(sampleEx.stem)
      );
      if (existingIdx >= 0) {
        existingExercises[existingIdx] = { ...existingExercises[existingIdx], ...sampleEx };
      } else if (existingExercises.length > 0) {
        existingExercises[0] = { ...existingExercises[0], ...sampleEx };
      } else {
        existingExercises.push(sampleEx);
      }
    }

    return {
      ...pat,
      ...(isValidGuid(updatedFields.patternId) ? { patternId: updatedFields.patternId } : {}),
      patternCode: pat?.patternCode || `P${pIdx + 1}`,
      name: newPatternName,
      bloomLevel: Number(updatedFields.bloomLevel) || pat?.bloomLevel || 2,
      level: updatedFields.level || pat?.level || 'Vận dụng (L3)',
      weight: updatedFields.weight || pat?.weight || '5%',
      status: 'ACCEPTED',
      theoryRecap: updatedFields.theoryRecap ?? pat?.theoryRecap ?? '',
      solutionMethod: updatedFields.solutionMethod ?? pat?.solutionMethod ?? '',
      method: updatedFields.solutionMethod ?? pat?.method ?? '',
      examTraps: updatedFields.examTraps ?? pat?.examTraps ?? '',
      casioTricks: updatedFields.casioTricks ?? pat?.casioTricks ?? '',
      videoUrl: updatedFields.videoUrl ?? pat?.videoUrl ?? null,
      durationSeconds: updatedFields.durationSeconds ?? pat?.durationSeconds ?? 600,
      isEdited: true,
      exercises: existingExercises
    };
  };

  let updatedAnyTextbook = false;

  // 1. Cập nhật vào cuốn SGK đang mở (hoặc bất kỳ cuốn SGK đã lưu nào khớp bài học / dạng bài)
  const targetSaved = getSavedTextbookData(ctx?.selectedSourceId, ctx?.fileName);
  if (targetSaved && (targetSaved.skeleton?.chapters || targetSaved.chapters)) {
    const rawChapters = targetSaved.skeleton?.chapters || targetSaved.chapters || [];
    let matchedInBook = false;

    const nextChapters = rawChapters.map((ch, cIdx) => {
      const nextLessons = (ch.lessons || []).map((les, lIdx) => {
        const lNorm = normalizeViText(cleanPrefix(les.title || '', 'lesson'));
        const isTargetLessonByName =
          normLesTarget &&
          lNorm &&
          (lNorm === normLesTarget || lNorm.includes(normLesTarget) || normLesTarget.includes(lNorm));
        const isTargetLessonByIdx =
          !normLesTarget &&
          cIdx === Number(ctx?.selectedChapterIdx || 0) &&
          lIdx === Number(ctx?.selectedLessonIdx || 0);

        let lessonHit = false;
        const nextPatterns = (les.patterns || []).map((pat, pIdx) => {
          const pNorm = normalizeViText(cleanPrefix(pat.name || '', 'pattern'));
          const patMatchesName =
            (normPatOld && pNorm && (pNorm === normPatOld || pNorm.includes(normPatOld) || normPatOld.includes(pNorm))) ||
            (normPatNew && pNorm && (pNorm === normPatNew || pNorm.includes(normPatNew) || normPatNew.includes(pNorm)));
          const patMatchesIdx =
            cIdx === Number(ctx?.selectedChapterIdx || 0) &&
            lIdx === Number(ctx?.selectedLessonIdx || 0) &&
            pIdx === Number(ctx?.selectedPatternIdx || 0);

          if ((isTargetLessonByName && (patMatchesName || (les.patterns || []).length === 1)) || patMatchesName || (isTargetLessonByIdx && patMatchesIdx)) {
            matchedInBook = true;
            lessonHit = true;
            return applyUpdateToPattern(pat, pIdx);
          }
          return pat;
        });

        if (lessonHit) {
          const nextTheory =
            updatedFields.theoryRecap && !isGenericPlaceholder(updatedFields.theoryRecap)
              ? updatedFields.theoryRecap
              : (les.theory || '');
          return {
            ...les,
            theory: nextTheory,
            isEdited: true,
            patterns: nextPatterns
          };
        }
        return les;
      });
      return { ...ch, lessons: nextLessons };
    });

    // Nếu không khớp bằng tên nhưng đang ở đúng cuốn sách trong TextbookStudioView, cập nhật theo index đang chọn
    if (!matchedInBook && nextChapters.length > 0) {
      const cIdx = Math.min(nextChapters.length - 1, Math.max(0, Number(ctx?.selectedChapterIdx || 0)));
      const targetCh = { ...nextChapters[cIdx] };
      const chLessons = [...(targetCh.lessons || [])];
      if (chLessons.length > 0) {
        const lIdx = Math.min(chLessons.length - 1, Math.max(0, Number(ctx?.selectedLessonIdx || 0)));
        const targetLes = { ...chLessons[lIdx] };
        const lesPatterns = [...(targetLes.patterns || [])];
        const pIdx = Math.min(Math.max(0, lesPatterns.length - 1), Math.max(0, Number(ctx?.selectedPatternIdx || 0)));
        if (lesPatterns.length > 0) {
          lesPatterns[pIdx] = applyUpdateToPattern(lesPatterns[pIdx], pIdx);
        } else {
          lesPatterns.push(applyUpdateToPattern({}, 0));
        }
        targetLes.patterns = lesPatterns;
        if (updatedFields.theoryRecap && !isGenericPlaceholder(updatedFields.theoryRecap)) {
          targetLes.theory = updatedFields.theoryRecap;
        }
        targetLes.isEdited = true;
        chLessons[lIdx] = targetLes;
        targetCh.lessons = chLessons;
        nextChapters[cIdx] = targetCh;
        matchedInBook = true;
      }
    }

    if (matchedInBook) {
      saveTextbookData({
        sourceId: targetSaved.sourceId || ctx?.selectedSourceId || '',
        fileName: targetSaved.fileName || ctx?.fileName || targetSaved.skeleton?.fileName || '',
        skeleton: {
          ...(targetSaved.skeleton || {}),
          hasUserSavedStructure: true,
          chapters: nextChapters
        },
        textbookExercises: targetSaved.textbookExercises || []
      });
      updatedAnyTextbook = true;
    }
  } else if (updatedFields.forceCreateTextbookEntry) {
    // Khởi tạo bản ghi SGK mới nếu người dùng mở thẳng Studio SGK khi chưa bấm Lưu ở trang SGK
    const subCode = (ctx?.subjectCode || domain?.code || 'MATH').toUpperCase();
    const grade = Number(ctx?.grade) || 10;
    const newPat = applyUpdateToPattern({}, 0);
    const initialSkeleton = {
      fileName: ctx?.fileName || `SGK_${subCode}_G${grade}.pdf`,
      subjectCode: subCode,
      subjectName: ctx?.subjectName || domain?.name || domain?.title || 'Sách giáo khoa',
      grade,
      bookEdition: ctx?.bookEdition || 'Kết nối tri thức với cuộc sống',
      hasUserSavedStructure: true,
      chapters: [
        {
          chapterNumber: 1,
          title: chapterTitle,
          status: 'ACCEPTED',
          lessons: [
            {
              lessonNumber: 1,
              title: lessonTitle,
              status: 'ACCEPTED',
              theory: updatedFields.theoryRecap || '',
              isEdited: true,
              patterns: [newPat]
            }
          ]
        }
      ]
    };
    saveTextbookData({
      sourceId: ctx?.selectedSourceId || '',
      fileName: initialSkeleton.fileName,
      skeleton: initialSkeleton,
      textbookExercises: []
    });
    updatedAnyTextbook = true;
  }

  // 2. Luôn ghi nhận vào kho Studio Overrides để UnifiedNodeDetailView & SGK đồng bộ tức thì mọi chỉnh sửa từ Studio
  try {
    const existingOverrides = readStorageEntry(STUDIO_OVERRIDES_STORAGE_KEY) || {
      sourceId: '',
      fileName: 'studio_overrides',
      skeleton: { chapters: [{ chapterNumber: 1, title: 'Studio Overrides', lessons: [] }] }
    };
    const overrideChapters = existingOverrides.skeleton?.chapters?.length > 0
      ? [...existingOverrides.skeleton.chapters]
      : [{ chapterNumber: 1, title: 'Studio Overrides', lessons: [] }];
    const lessonsList = [...(overrideChapters[0].lessons || [])];

    let lesIdx = lessonsList.findIndex(l => {
      const lk = normalizeViText(cleanPrefix(l.title || '', 'lesson'));
      return lk && normLesTarget && (lk === normLesTarget || lk.includes(normLesTarget) || normLesTarget.includes(lk));
    });

    if (lesIdx < 0) {
      lessonsList.push({
        lessonNumber: lessonsList.length + 1,
        title: lessonTitle,
        theory: updatedFields.theoryRecap || '',
        isEdited: true,
        patterns: [applyUpdateToPattern({}, 0)]
      });
    } else {
      const targetLes = { ...lessonsList[lesIdx] };
      const pats = [...(targetLes.patterns || [])];
      const patIdx = pats.findIndex(p => {
        const pk = normalizeViText(cleanPrefix(p.name || '', 'pattern'));
        return (
          (normPatOld && pk && (pk === normPatOld || pk.includes(normPatOld) || normPatOld.includes(pk))) ||
          (normPatNew && pk && (pk === normPatNew || pk.includes(normPatNew) || normPatNew.includes(pk)))
        );
      });
      if (patIdx >= 0) {
        pats[patIdx] = applyUpdateToPattern(pats[patIdx], patIdx);
      } else {
        pats.push(applyUpdateToPattern({}, pats.length));
      }
      if (updatedFields.theoryRecap && !isGenericPlaceholder(updatedFields.theoryRecap)) {
        targetLes.theory = updatedFields.theoryRecap;
      }
      targetLes.isEdited = true;
      targetLes.patterns = pats;
      lessonsList[lesIdx] = targetLes;
    }

    overrideChapters[0] = { ...overrideChapters[0], lessons: lessonsList };
    const overridePayload = {
      sourceId: '',
      fileName: 'studio_overrides',
      skeleton: { chapters: overrideChapters },
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STUDIO_OVERRIDES_STORAGE_KEY, JSON.stringify(overridePayload));

    if (typeof window !== 'undefined' && !updatedAnyTextbook) {
      window.dispatchEvent(new CustomEvent('veval:textbook-saved', { detail: overridePayload }));
    }
  } catch (err) {
    console.warn('Không thể ghi cache studio_overrides:', err);
  }

  return true;
};

/**
 * Tự động ánh xạ hoặc khởi tạo (Upsert) Dạng bài từ Studio xuống PostgreSQL Content Service
 * khi patternId không phải GUID (vd: "SGK_CHEM_G10_P1") hoặc chưa tồn tại trong bảng Skills (tránh lỗi 404 Not Found)
 */
export const upsertSinglePatternToCurriculumDb = async ({
  domain = null,
  chapter = null,
  lesson = null,
  pattern = null,
  detectedSubject = '',
  payload,
  contentService
}) => {
  if (!contentService) return null;

  const rawDomainCandidate =
    domain?.domainId ||
    (domain?.id ? String(domain.id).replace(/^domain-/i, '') : '');
  const rawLessonId = lesson?.lessonId || '';

  // Tầng 1: Nếu đã có lessonId và domainId là GUID hợp lệ trong CSDL -> tạo trực tiếp Node Dạng bài dưới Bài học đó
  if (isValidGuid(rawLessonId) && isValidGuid(rawDomainIdCandidate(rawDomainCandidate))) {
    const validDomainGuid = rawDomainIdCandidate(rawDomainCandidate);
    const newId = await contentService.createNode({
      domainId: validDomainGuid,
      parentId: rawLessonId,
      name: payload.name,
      weight: payload.weight,
      theoryRecap: payload.theoryRecap,
      solutionMethod: payload.solutionMethod,
      videoUrl: payload.videoUrl,
      durationSeconds: payload.durationSeconds
    });

    if (isValidGuid(String(newId))) {
      const guidStr = String(newId).trim();
      if (payload.sampleQuestion) {
        try {
          return await contentService.updatePattern(guidStr, payload);
        } catch {}
      }
      return {
        patternId: guidStr,
        name: payload.name,
        weight: `${Math.round((payload.weight || 0.05) * 100)}%`,
        theoryRecap: payload.theoryRecap,
        solutionMethod: payload.solutionMethod
      };
    }
  }

  // Tầng 2: Truy vấn cây Khung Chương Trình hiện có để khớp Chương / Bài học / Dạng bài hoặc Upsert qua importCurriculum
  const existingDomains = await contentService.getCurriculum();
  if (!Array.isArray(existingDomains) || existingDomains.length === 0) {
    return null;
  }

  const subUpper = String(detectedSubject || domain?.code || domain?.domainCode || '').toUpperCase();
  const targetDomainCode =
    subUpper.includes('PHYS') || subUpper.includes('CHEM') || subUpper.includes('BIO') || subUpper.includes('VẬT') || subUpper.includes('HÓA') || subUpper.includes('SINH') || subUpper.includes('NATURAL')
      ? 'NATURAL_SCIENCES'
      : subUpper.includes('HIST') || subUpper.includes('GEO') || subUpper.includes('CIV') || subUpper.includes('SỬ') || subUpper.includes('ĐỊA') || subUpper.includes('SOCIAL')
      ? 'SOCIAL_SCIENCES'
      : subUpper.includes('LIT') || subUpper.includes('VIET') || subUpper.includes('ENG') || subUpper.includes('VĂN') || subUpper.includes('ANH') || subUpper.includes('LANG')
      ? 'LANGUAGE'
      : 'MATH_LOGIC';

  const matchedDomain =
    (isValidGuid(rawDomainCandidate) && existingDomains.find(d => String(d.domainId).toLowerCase() === rawDomainCandidate.toLowerCase())) ||
    existingDomains.find(d => (d.domainCode || '').toUpperCase() === targetDomainCode) ||
    existingDomains[0];

  if (!matchedDomain?.domainId) return null;

  const chapTitle = (chapter?.name || chapter?.title || 'Chương 1: Kiến thức trọng tâm').trim();
  const lesTitle = (lesson?.name || lesson?.title || 'Bài 1: Nội dung trọng tâm').trim();
  const oldPatTitle = (pattern?.name || pattern?.patternName || payload.name || '').trim();
  const newPatTitle = (payload.name || oldPatTitle || 'Dạng 1: Trọng tâm bài học').trim();

  const normChap = normalizeViText(cleanPrefix(chapTitle.replace(/\([^)]*lớp\s*\d+[^)]*\)|\[[^\]]*lớp\s*\d+[^\]]*\]/gi, ''), 'chapter'));
  const normLes = normalizeViText(cleanPrefix(lesTitle, 'lesson'));
  const normPatOld = normalizeViText(cleanPrefix(oldPatTitle, 'pattern'));
  const normPatNew = normalizeViText(cleanPrefix(newPatTitle, 'pattern'));

  const existingChapters = matchedDomain.chapters || [];
  const foundChap = existingChapters.find(ec => {
    if (isValidGuid(chapter?.chapterId) && ec.chapterId === chapter.chapterId) return true;
    const ecClean = normalizeViText(cleanPrefix(String(ec.name || '').replace(/\([^)]*lớp\s*\d+[^)]*\)|\[[^\]]*lớp\s*\d+[^\]]*\]/gi, ''), 'chapter'));
    return ecClean && normChap && (ecClean === normChap || ecClean.includes(normChap) || normChap.includes(ecClean));
  });

  const foundLes = (foundChap?.lessons || []).find(el => {
    if (isValidGuid(lesson?.lessonId) && el.lessonId === lesson.lessonId) return true;
    const elClean = normalizeViText(cleanPrefix(el.name || '', 'lesson'));
    return elClean && normLes && (elClean === normLes || elClean.includes(normLes) || normLes.includes(elClean));
  });

  const foundPat = (foundLes?.patterns || []).find(ep => {
    const epClean = normalizeViText(cleanPrefix(ep.name || '', 'pattern'));
    return (
      (normPatOld && epClean && (epClean === normPatOld || epClean.includes(normPatOld) || normPatOld.includes(epClean))) ||
      (normPatNew && epClean && (epClean === normPatNew || epClean.includes(normPatNew) || normPatNew.includes(epClean)))
    );
  }) || ((foundLes?.patterns || []).length === 1 ? foundLes.patterns[0] : null);

  // 2a. Nếu tìm thấy đúng Dạng bài đã có GUID trong CSDL -> gọi updatePattern trực tiếp
  if (foundPat && isValidGuid(foundPat.patternId)) {
    return await contentService.updatePattern(foundPat.patternId, payload);
  }

  // 2b. Nếu đã có Bài học (lessonId GUID hợp lệ) nhưng chưa có Dạng bài này -> gọi createNode
  if (foundLes && isValidGuid(foundLes.lessonId)) {
    const newId = await contentService.createNode({
      domainId: matchedDomain.domainId,
      parentId: foundLes.lessonId,
      name: newPatTitle,
      weight: payload.weight,
      theoryRecap: payload.theoryRecap,
      solutionMethod: payload.solutionMethod,
      videoUrl: payload.videoUrl,
      durationSeconds: payload.durationSeconds
    });
    if (isValidGuid(String(newId))) {
      const guidStr = String(newId).trim();
      if (payload.sampleQuestion) {
        try {
          return await contentService.updatePattern(guidStr, payload);
        } catch {}
      }
      return {
        patternId: guidStr,
        name: newPatTitle,
        weight: `${Math.round((payload.weight || 0.05) * 100)}%`,
        theoryRecap: payload.theoryRecap,
        solutionMethod: payload.solutionMethod
      };
    }
  }

  // 2c. Upsert trọn vẹn Chương -> Bài học -> Dạng bài qua importCurriculum
  const importPayload = {
    domainId: matchedDomain.domainId,
    domainName: matchedDomain.title || matchedDomain.name,
    domainDescription: matchedDomain.subtitle || '',
    chapters: [
      {
        ...(foundChap && isValidGuid(foundChap.chapterId) ? { chapterId: foundChap.chapterId } : {}),
        chapterName: foundChap?.name || chapTitle,
        weight: 0.25,
        lessons: [
          {
            ...(foundLes && isValidGuid(foundLes.lessonId) ? { lessonId: foundLes.lessonId } : {}),
            lessonName: foundLes?.name || lesTitle,
            weight: 0.08,
            summary: (payload.theoryRecap || '').slice(0, 260),
            patterns: [
              {
                patternName: newPatTitle,
                weight: payload.weight || 0.05,
                theoryRecap: payload.theoryRecap || '',
                solutionMethod: payload.solutionMethod || '',
                videoUrl: payload.videoUrl || null,
                durationSeconds: payload.durationSeconds || 600,
                questions: payload.sampleQuestion ? [payload.sampleQuestion] : []
              }
            ]
          }
        ]
      }
    ]
  };

  await contentService.importCurriculum(importPayload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('veval:curriculum-synced', {
      detail: { domainId: matchedDomain.domainId, chaptersCount: 1 }
    }));
  }

  // Lấy lại GUID của pattern vừa được import để đồng bộ state cho Studio
  try {
    const refreshedDomains = await contentService.getCurriculum();
    const refDom = (refreshedDomains || []).find(d => d.domainId === matchedDomain.domainId) || refreshedDomains?.[0];
    for (const c of (refDom?.chapters || [])) {
      for (const l of (c.lessons || [])) {
        for (const p of (l.patterns || [])) {
          const pk = normalizeViText(cleanPrefix(p.name || '', 'pattern'));
          if (pk && normPatNew && (pk === normPatNew || pk.includes(normPatNew) || normPatNew.includes(pk))) {
            return p;
          }
        }
      }
    }
  } catch {}

  return {
    name: newPatTitle,
    weight: `${Math.round((payload.weight || 0.05) * 100)}%`,
    theoryRecap: payload.theoryRecap,
    solutionMethod: payload.solutionMethod
  };
};

function rawDomainIdCandidate(val) {
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * Đồng bộ trực tiếp toàn bộ cây Chương -> Bài học -> Dạng bài + Lý thuyết + Phương pháp giải + Câu hỏi
 * từ Sách Giáo Khoa (AI Engine / Studio) xuống CSDL Khung Chương Trình (Content Service: POST /api/content/curriculum/import)
 * Tự động ánh xạ ChapterId / LessonId / PatternId hiện có để cập nhật tại chỗ (Upsert), tuyệt đối không tạo chương trùng lặp
 */
export const syncTextbookSkeletonToCurriculum = async ({ skeleton, chunks = [], contentService }) => {
  if (!skeleton || !Array.isArray(skeleton.chapters) || skeleton.chapters.length === 0) {
    throw new Error('Chưa có cấu trúc Chương / Bài học SGK để đồng bộ.');
  }
  if (!contentService || typeof contentService.getCurriculum !== 'function' || typeof contentService.importCurriculum !== 'function') {
    throw new Error('Content Service chưa sẵn sàng.');
  }

  const subCode = (skeleton.subjectCode || 'MATH').toUpperCase();
  const grade = Number(skeleton.grade) || 10;
  const subNameMap = {
    MATH: 'Toán học',
    PHYS: 'Vật lí',
    CHEM: 'Hóa học',
    BIO: 'Sinh học',
    LIT: 'Ngữ văn',
    VIET: 'Ngữ văn',
    ENG: 'Tiếng Anh',
    ENGL: 'Tiếng Anh',
    HIST: 'Lịch sử',
    GEO: 'Địa lí',
    CIV: 'GDKT & Pháp luật'
  };
  const subjectLabel = skeleton.subjectName || subNameMap[subCode] || 'Toán học';

  const targetDomainCode =
    ['PHYS', 'CHEM', 'BIO'].includes(subCode) ? 'NATURAL_SCIENCES' :
    ['HIST', 'GEO', 'CIV'].includes(subCode) ? 'SOCIAL_SCIENCES' :
    ['LIT', 'VIET', 'ENG', 'ENGL'].includes(subCode) ? 'LANGUAGE' : 'MATH_LOGIC';

  const existingDomains = await contentService.getCurriculum();
  const matchedDomain = (existingDomains || []).find(d => (d.domainCode || '').toUpperCase() === targetDomainCode)
    || (existingDomains || [])[0];

  if (!matchedDomain?.domainId) {
    throw new Error('Không tìm thấy Miền tri thức phù hợp trong Content Service.');
  }

  const stripMetaSuffix = (s) => normalizeViText(
    cleanPrefix(String(s || '').replace(/\([^)]*lớp\s*\d+[^)]*\)|\[[^\]]*lớp\s*\d+[^\]]*\]/gi, ''), 'chapter')
  );
  const normLesson = (s) => normalizeViText(cleanPrefix(String(s || ''), 'lesson'));
  const normPattern = (s) => normalizeViText(cleanPrefix(String(s || ''), 'pattern'));

  const existingChapters = matchedDomain.chapters || [];
  const validChapters = filterPedagogicalChapters(skeleton.chapters);

  const importChapters = validChapters.map((ch, chIdx) => {
    const cleanCh = stripMetaSuffix(ch.title);
    const foundChap = existingChapters.find(ec => {
      const ecText = normalizeViText(ec.name || '');
      const hasSameGrade = !ecText.includes('lớp ') || ecText.includes(`lớp ${grade}`);
      if (!hasSameGrade) return false;
      const ecClean = stripMetaSuffix(ec.name);
      return ecClean && cleanCh && (ecClean === cleanCh || ecClean.includes(cleanCh) || cleanCh.includes(ecClean));
    });

    const formattedChapterName = ch.title.toLowerCase().includes('lớp')
      ? ch.title
      : `${ch.title} (${subjectLabel} - Lớp ${grade})`;

    const importLessons = (ch.lessons || []).map((les) => {
      const cleanLes = normLesson(les.title);
      const foundLes = (foundChap?.lessons || []).find(el => {
        const elClean = normLesson(el.name);
        return elClean && cleanLes && (elClean === cleanLes || elClean.includes(cleanLes) || cleanLes.includes(elClean));
      });

      const lesChunks = getChunksForLesson(les, chunks, subCode);
      const compiledLessonTheory = (les.isEdited && les.theory && !isGenericPlaceholder(les.theory))
        ? les.theory
        : (buildTheoryFromChunks(lesChunks, les.title, subCode) || (!isGenericPlaceholder(les.theory) ? (les.theory || '') : ''));

      const validPats = (les.patterns || []).filter(p => p && !isNonPedagogical(p.name));
      const importPatterns = (validPats.length > 0 ? validPats : [{ name: `Dạng 1: Trọng tâm ${cleanPrefix(les.title, 'lesson') || les.title}`, bloomLevel: 2, exercises: [] }]).map((pat, pIdx) => {
        const cleanPat = normPattern(pat.name);
        const foundPat = (foundLes?.patterns || []).find(ep => {
          const epClean = normPattern(ep.name);
          return epClean && cleanPat && (epClean === cleanPat || epClean.includes(cleanPat) || cleanPat.includes(epClean));
        }) || (validPats.length === 1 && foundLes?.patterns?.length === 1 ? foundLes.patterns[0] : null);

        const patTheory = (pat.theoryRecap && !isGenericPlaceholder(pat.theoryRecap))
          ? pat.theoryRecap
          : compiledLessonTheory;

        const explicitMethod = (pat.solutionMethod && !isGenericPlaceholder(pat.solutionMethod))
          ? pat.solutionMethod.trim()
          : ((pat.method && !isGenericPlaceholder(pat.method)) ? pat.method.trim() : '');
        const patMethod = (explicitMethod && (pat.isEdited || explicitMethod.includes('\n') || explicitMethod.length >= 140))
          ? explicitMethod
          : (buildMethodFromChunks(lesChunks, les, pat, subCode) || explicitMethod);

        const mappedQuestions = (pat.exercises || []).map(ex => {
          const opts = Array.isArray(ex.options) ? ex.options : [];
          return {
            contentLatex: ex.contentLatex || ex.stem || ex.content || '',
            optionA: ex.optionA || opts[0] || '',
            optionB: ex.optionB || opts[1] || '',
            optionC: ex.optionC || opts[2] || '',
            optionD: ex.optionD || opts[3] || '',
            correctOption: ex.correctOption !== undefined ? ex.correctOption : (ex.correctIndex ?? 0),
            explanation: ex.explanation || ex.solution || '',
            difficultyLevel: Number(ex.difficultyLevel || ex.bloomLevel || pat.bloomLevel) || 2
          };
        }).filter(q => q.contentLatex && q.optionA && q.optionB);

        return {
          ...(foundPat?.patternId ? { patternId: foundPat.patternId } : {}),
          patternName: pat.name || `Dạng ${pIdx + 1}`,
          theoryRecap: patTheory || '',
          solutionMethod: patMethod || '',
          questions: mappedQuestions
        };
      });

      return {
        ...(foundLes?.lessonId ? { lessonId: foundLes.lessonId } : {}),
        lessonName: les.title,
        summary: compiledLessonTheory ? compiledLessonTheory.slice(0, 260) : '',
        patterns: importPatterns
      };
    });

    return {
      ...(foundChap?.chapterId ? { chapterId: foundChap.chapterId } : {}),
      chapterName: formattedChapterName || `Chương ${chIdx + 1}`,
      description: `Đồng bộ chuẩn từ SGK ${subjectLabel} Lớp ${grade} (${skeleton.bookEdition || 'GDPT 2018'})`,
      lessons: importLessons
    };
  });

  const payload = {
    domainId: matchedDomain.domainId,
    domainName: matchedDomain.title || matchedDomain.name,
    domainDescription: matchedDomain.subtitle || '',
    chapters: importChapters
  };

  const result = await contentService.importCurriculum(payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('veval:curriculum-synced', {
      detail: { domainId: matchedDomain.domainId, subjectCode: subCode, grade, chaptersCount: importChapters.length }
    }));
  }

  return result;
};
