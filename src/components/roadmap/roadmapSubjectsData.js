/**
 * Mock Data: Lộ Trình Học Cá Nhân Hóa Chuẩn ĐGNL VNU-HCM (Core Flow 2)
 * Phân lớp 9 môn học vào 3 Giai đoạn dựa theo Điểm Khảo Sát Đầu Vào (Diagnostic Test Score):
 * - Giai đoạn 1: Nền tảng cốt lõi (Score < 50%) -> Củng cố gốc SGK & công thức cơ bản.
 * - Giai đoạn 2: Tăng tốc chuyên sâu (Score 50% - 74%) -> Rèn luyện phương pháp giải nhanh & bẫy đề.
 * - Giai đoạn 3: Bứt phá 900+ Master (Score >= 75%) -> Chinh phục câu phân loại cao & thực chiến.
 */

export const MOCK_DIAGNOSTIC_SUMMARY = {
  examName: 'Khảo Sát Năng Lực Đầu Vào ĐGNL 2026 (Diagnostic Exam)',
  totalScore: 710,
  maxTotalScore: 1200,
  theta0: '+0.45',
  percentile: 'Top 15%',
  recommendedFocus: 'Củng cố ngay 3 môn Nền tảng (Toán học, Vật lý, Sinh học) để không bị mất điểm đáng tiếc; duy trì phong độ môn Bứt phá.',
  stageStats: {
    stage1Count: 3,
    stage2Count: 3,
    stage3Count: 3,
    totalSubjects: 9
  }
};

export const MOCK_SUBJECTS_DATA = [
  // ==========================================
  // GIAI ĐOẠN 1: NỀN TẢNG CỐT LÕI (3 MÔN)
  // ==========================================
  {
    id: 'sub_math',
    name: 'Toán học',
    domain: 'Toán học & Tư duy',
    weight: '300/1200 điểm',
    entryScore: 42,
    maxScore: 100,
    stage: 1,
    stageName: 'Giai đoạn 1: Nền tảng cốt lõi',
    badgeVariant: 'rose',
    statusText: 'Cần củng cố gốc SGK',
    teacher: 'ThS. Nguyễn Văn Đức (Khoa Toán - Tin ĐHKHTN ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 42/100 (Yếu). Cần học lại định nghĩa SGK, bảng biến thiên và phương pháp loại trừ nghiệm.',
    chapters: [
      {
        id: 'math_c1',
        title: 'Chương 1: Ứng dụng đạo hàm để khảo sát hàm số',
        lessonCount: 4,
        completedCount: 1,
        lessons: [
          {
            id: 'math_c1_l1',
            title: 'Bài 1: Tính đơn điệu & Cực trị của hàm số',
            duration: '26 phút',
            status: 'IN_PROGRESS', // COMPLETED | IN_PROGRESS | LOCKED
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: Kỹ thuật xử lý bẫy Cực trị & Giá trị cực trị đề ĐGNL',
              teacher: 'ThS. Nguyễn Văn Đức',
              teacherRole: 'Giảng viên chuyên môn ĐHQG-HCM',
              scheduledAt: '19:30 - 21:00, Thứ Năm tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED', // SCHEDULED | ATTENDED | ABSENT
              prepNotes: 'Học sinh đọc trước tài liệu tóm tắt công thức đạo hàm cấp 1, cấp 2 và tải file PDF 25 câu hỏi mẫu.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Cho hàm số $y = f(x)$ xác định trên khoảng $(a; b)$ và $x_0 \\in (a; b)$. Nếu tồn tại giới hạn hữu hạn $\\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$, thì giới hạn đó được gọi là đạo hàm của hàm số tại $x_0$, ký hiệu là $f\'(x_0)$.',
                formulaSummary: [
                  'Công thức số gia: $\\Delta x = x - x_0$, $\\Delta y = f(x_0 + \\Delta x) - f(x_0)$.',
                  'Điều kiện đủ cực trị: Nếu $f\'(x_0) = 0$ và $f\'(x)$ đổi dấu từ $(+)$ sang $(-)$ khi qua $x_0$ thì $x_0$ là điểm Cực Đại.',
                  'Nếu $f\'(x)$ đổi dấu từ $(-)$ sang $(+)$ khi qua $x_0$ thì $x_0$ là điểm Cực Tiểu.'
                ],
                example: 'Ví dụ minh họa SGK: Cho hàm số $f(x) = x^3 - 3x^2 + 2$. Ta có $f\'(x) = 3x^2 - 6x = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Đạo hàm đổi dấu qua cả 2 điểm, suy ra hàm số có 2 điểm cực trị.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải chi tiết & Bẫy đề ĐGNL',
                steps: [
                  'Bước 1: Tìm tập xác định $D$ của hàm số (Đặc biệt cẩn thận điều kiện mẫu số khác 0 và biểu thức căn bậc hai).',
                  'Bước 2: Tính đạo hàm $y\' = f\'(x)$, giải phương trình $y\' = 0$ và tìm các điểm làm cho $y\'$ không xác định.',
                  'Bước 3: Lập bảng biến thiên hoặc xét dấu $y\'$ để kết luận khoảng đồng biến, nghịch biến và các điểm cực trị.'
                ],
                traps: [
                  'Bẫy 1 (Phân biệt điểm cực trị và giá trị cực trị): "Điểm cực trị của hàm số" là $x$, còn "Giá trị cực trị" (hoặc "Cực trị của hàm số") là $y = f(x)$. Đề thi ĐGNL thường hỏi giá trị cực trị nhưng đáp án cho cả tọa độ $(x; y)$ hoặc $x$ để gây nhiễu!',
                  'Bẫy 2: Hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax+b}{cx+d}$ luôn đơn điệu trên từng khoảng xác định, hoàn toàn KHÔNG CÓ cực trị.'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu chuẩn đề ĐGNL & Lời giải',
                level: 'L2: Thông hiểu (Trọng số bài thi: 5%)',
                question: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm $f\'(x)$ đổi dấu qua $x = -2, 0, 2$, trong đó tại $x = 0$ là nghiệm kép. Số điểm cực trị của hàm số $y = f(x)$ là:',
                options: ['A. 1 điểm', 'B. 2 điểm', 'C. 3 điểm', 'D. 0 điểm'],
                correct: 'B',
                explanation: 'Nghiệm kép $x = 0$ không làm đạo hàm đổi dấu khi đi qua nó. Do đó đạo hàm chỉ đổi dấu 2 lần khi đi qua $x = -2$ và $x = 2$. Vậy hàm số có đúng 2 điểm cực trị.'
              }
            },
            quiz: [
              {
                id: 'm_q1',
                question: 'Điểm cực tiểu của hàm số $y = x^3 - 3x + 1$ là:',
                options: ['A. x = -1', 'B. x = 1', 'C. (1; -1)', 'D. y = -1'],
                correct: 'B',
                explanation: 'Đạo hàm $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Bảng biến thiên cho thấy tại $x = 1$ đạo hàm đổi dấu từ âm sang dương nên $x = 1$ là điểm cực tiểu.'
              },
              {
                id: 'm_q2',
                question: 'Hàm số nào dưới đây không có cực trị?',
                options: ['A. y = x^3 - 3x', 'B. y = x^4 + 2x^2', 'C. y = \\frac{2x - 1}{x + 1}', 'D. y = x^3 - 3x^2 + 3x'],
                correct: 'C',
                explanation: 'Hàm phân thức bậc nhất $y = \\frac{2x-1}{x+1}$ có đạo hàm $y\' = \\frac{3}{(x+1)^2} > 0$ với mọi $x \\ne -1$ nên không có cực trị.'
              }
            ]
          },
          {
            id: 'math_c1_l2',
            title: 'Bài 2: Giá trị lớn nhất, nhỏ nhất & Đường tiệm cận',
            duration: '24 phút',
            status: 'LOCKED',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: Kỹ thuật casio tìm tiệm cận đứng, ngang & GTLN-GTNN',
              teacher: 'ThS. Nguyễn Văn Đức',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '19:30 - 21:00, Thứ Bảy tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Mang theo máy tính Casio fx-580VNX hoặc fx-880BTG.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Đường thẳng $x = x_0$ là tiệm cận đứng của đồ thị nếu ít nhất một trong các giới hạn $\\lim_{x \\to x_0^\\pm} f(x) = \\pm\\infty$. Đường thẳng $y = y_0$ là tiệm cận ngang nếu $\\lim_{x \\to \\pm\\infty} f(x) = y_0$.',
                formulaSummary: [
                  'Với hàm phân thức $y = \\frac{P(x)}{Q(x)}$: Tiệm cận đứng là nghiệm của mẫu $Q(x) = 0$ không triệt tiêu tử $P(x)$.',
                  'Tiệm cận ngang tồn tại khi bậc tử $\\le$ bậc mẫu.'
                ],
                example: 'Đồ thị hàm số $y = \\frac{2x + 1}{x - 1}$ có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 2$.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp & Bẫy ĐGNL',
                steps: [
                  'Tìm nghiệm mẫu và kiểm tra xem có làm tử bằng 0 hay không.',
                  'Xét bậc của đa thức tử và mẫu để kết luận nhanh tiệm cận ngang.'
                ],
                traps: [
                  'Bẫy nghiệm kép triệt tiêu tử số nhưng bậc mẫu vẫn lớn hơn bậc tử!'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L2: Thông hiểu',
                question: 'Số đường tiệm cận của đồ thị hàm số $y = \\frac{x - 1}{x^2 - 1}$ là:',
                options: ['A. 1', 'B. 2', 'C. 3', 'D. 0'],
                correct: 'B',
                explanation: 'Ta có $y = \\frac{x-1}{(x-1)(x+1)} = \\frac{1}{x+1}$ với $x \\ne 1$. Do đó có 1 tiệm cận đứng $x = -1$ và 1 tiệm cận ngang $y = 0$. Tổng cộng 2 tiệm cận.'
              }
            },
            quiz: []
          }
        ]
      },
      {
        id: 'math_c2',
        title: 'Chương 2: Hàm số lũy thừa, mũ và logarit',
        lessonCount: 3,
        completedCount: 0,
        lessons: [
          {
            id: 'math_c2_l1',
            title: 'Bài 1: Công thức biến đổi Logarit & Phương trình mũ cơ bản',
            duration: '22 phút',
            status: 'LOCKED',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: 10 công thức Logarit thần thánh hay thi ĐGNL',
              teacher: 'ThS. Nguyễn Văn Đức',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Năm tuần sau',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Học thuộc bảng công thức Logarit trước buổi học.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Cho số thực $a > 0, a \\ne 1$ và $b > 0$. Số $\\alpha$ thỏa mãn $a^\\alpha = b$ được gọi là logarit cơ số $a$ của $b$, ký hiệu $\\log_a b$.',
                formulaSummary: ['$\\log_a(xy) = \\log_a x + \\log_a y$', '$\\log_a(x/y) = \\log_a x - \\log_a y$'],
                example: 'Tính $\\log_2 8 = 3$ vì $2^3 = 8$.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải',
                steps: ['Đặt điều kiện xác định cơ số $a > 0, a \\ne 1$ và biểu thức dưới logarit $> 0$.'],
                traps: ['Quên đặt điều kiện biểu thức trong logarit trước khi biến đổi!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L1: Nhận biết',
                question: 'Nghiệm của phương trình $2^{x+1} = 8$ là:',
                options: ['A. x = 1', 'B. x = 2', 'C. x = 3', 'D. x = 4'],
                correct: 'B',
                explanation: '$2^{x+1} = 2^3 \\Rightarrow x + 1 = 3 \\Rightarrow x = 2$.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_physics',
    name: 'Vật lý',
    domain: 'Khoa học Tự nhiên',
    weight: '40/1200 điểm',
    entryScore: 38,
    maxScore: 100,
    stage: 1,
    stageName: 'Giai đoạn 1: Nền tảng cốt lõi',
    badgeVariant: 'rose',
    statusText: 'Cần củng cố gốc SGK',
    teacher: 'TS. Trần Minh Hoàng (Bộ môn Vật lý Ứng dụng ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 38/100 (Yếu). Cần lấy lại gốc Dao động điều hòa, Sóng cơ và Mạch RLC cơ bản.',
    chapters: [
      {
        id: 'phy_c1',
        title: 'Chương 1: Dao động điều hòa & Sóng cơ học',
        lessonCount: 3,
        completedCount: 0,
        lessons: [
          {
            id: 'phy_c1_l1',
            title: 'Bài 1: Phương trình dao động điều hòa & Mối quan hệ x - v - a',
            duration: '25 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: Vòng tròn lượng giác đa trục giải nhanh Vật lý ĐGNL',
              teacher: 'TS. Trần Minh Hoàng',
              teacherRole: 'Giảng viên Vật lý ĐHQG-HCM',
              scheduledAt: '20:00, Thứ Ba tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Chuẩn bị compa và thước đo góc để vẽ trục đa giác lượng giác.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Dao động điều hòa là dao động mà tọa độ của vật là một hàm côsin (hoặc sin) theo thời gian: $x = A\\cos(\\omega t + \\varphi)$.',
                formulaSummary: [
                  'Vận tốc: $v = x\' = -\\omega A \\sin(\\omega t + \\varphi) = \\omega A \\cos(\\omega t + \\varphi + \\pi/2)$.',
                  'Gia tốc: $a = v\' = -\\omega^2 x$. Gia tốc luôn hướng về vị trí cân bằng và sớm pha hơn li độ góc $\\pi$.'
                ],
                example: 'Vật có $A = 5$ cm, $\\omega = 2\\pi$ rad/s. Vận tốc cực đại $v_{max} = \\omega A = 10\\pi$ cm/s.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải & Bẫy ĐGNL',
                steps: [
                  'Sử dụng hệ thức độc lập thời gian: $x^2 + \\frac{v^2}{\\omega^2} = A^2$.',
                  'Sử dụng vòng tròn lượng giác để tính thời gian ngắn nhất đi từ li độ $x_1$ đến $x_2$.'
                ],
                traps: [
                  'Bẫy đơn vị: Chu vi, biên độ đo bằng cm nhưng gia tốc đề bài cho $\\text{m/s}^2$ cần đổi đồng nhất!'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L2: Thông hiểu',
                question: 'Một chất điểm dao động điều hòa với phương trình $x = 4\\cos(2\\pi t + \\pi/3)$ cm. Gia tốc của chất điểm tại li độ $x = 2$ cm là:',
                options: ['A. -8\\pi^2 cm/s^2', 'B. 8\\pi^2 cm/s^2', 'C. -4\\pi^2 cm/s^2', 'D. 16\\pi^2 cm/s^2'],
                correct: 'A',
                explanation: '$a = -\\omega^2 x = -(2\\pi)^2 \\times 2 = -8\\pi^2$ cm/s$^2$.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_biology',
    name: 'Sinh học',
    domain: 'Khoa học Tự nhiên',
    weight: '40/1200 điểm',
    entryScore: 46,
    maxScore: 100,
    stage: 1,
    stageName: 'Giai đoạn 1: Nền tảng cốt lõi',
    badgeVariant: 'rose',
    statusText: 'Cần củng cố gốc SGK',
    teacher: 'ThS. Lê Thị Thảo (Khoa Sinh học - CNSH ĐHKHTN)',
    summaryDesc: 'Điểm đầu vào 46/100 (Yếu). Cần học lại cơ chế Di truyền cấp phân tử: ADN, ARN, Đột biến gen.',
    chapters: [
      {
        id: 'bio_c1',
        title: 'Chương 1: Di truyền học phân tử & Tế bào',
        lessonCount: 3,
        completedCount: 0,
        lessons: [
          {
            id: 'bio_c1_l1',
            title: 'Bài 1: Cơ chế nhân đôi ADN, Phiên mã và Dịch mã',
            duration: '22 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: Sơ đồ tư duy 3 cơ chế di truyền trọng tâm ĐGNL',
              teacher: 'ThS. Lê Thị Thảo',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Sáu tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Ôn tập nguyên tắc bổ sung A-T/U và G-X.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Nhân đôi ADN diễn ra theo nguyên tắc bổ sung (A-T, G-X) và nguyên tắc bán bảo toàn (trong mỗi phân tử con có 1 mạch cũ và 1 mạch mới tổng hợp).',
                formulaSummary: [
                  'Chiều tổng hợp mạch mới luôn là $5\' \\to 3\'$.',
                  'Mã di truyền có tính thoái hóa (nhiều bộ ba cùng mã hóa 1 axit amin) và tính phổ biến.'
                ],
                example: 'Bộ ba mở đầu $5\'AUG3\'$ trên mARN mã hóa cho axit amin Methionin ở sinh vật nhân thực.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp & Bẫy ĐGNL',
                steps: ['Xác định chiều mạch khuôn $3\' \\to 5\'$ để viết mạch bổ sung chính xác.'],
                traps: ['Đề bài ghi đảo chiều $3\'GUA5\'$ làm học sinh đọc nhầm bộ ba mở đầu!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L1: Nhận biết',
                question: 'Trong quá trình nhân đôi ADN, enzim ligaza có vai trò gì?',
                options: ['A. Tháo xoắn ADN', 'B. Nối các đoạn Okazaki', 'C. Kéo dài mạch mới', 'D. Cắt liên kết hidro'],
                correct: 'B',
                explanation: 'Enzim nối ligaza có vai trò hàn gắn các đoạn Okazaki thành mạch liên tục.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },

  // ==========================================
  // GIAI ĐOẠN 2: TĂNG TỐC CHUYÊN SÂU (3 MÔN)
  // ==========================================
  {
    id: 'sub_vietnamese',
    name: 'Tiếng Việt',
    domain: 'Sử dụng ngôn ngữ',
    weight: '200/1200 điểm',
    entryScore: 68,
    maxScore: 100,
    stage: 2,
    stageName: 'Giai đoạn 2: Tăng tốc chuyên sâu',
    badgeVariant: 'amber',
    statusText: 'Tập trung rèn phản xạ & bẫy',
    teacher: 'PGS.TS Phạm Văn Hùng (Khoa Văn học ĐHKHXH&NV ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 68/100 (Khá). Bỏ qua kiến thức cơ bản, tập trung bẫy lỗi dùng từ, câu đa tầng nghĩa và đọc hiểu văn bản khoa học.',
    chapters: [
      {
        id: 'viet_c1',
        title: 'Chương 1: Ngữ pháp, Quy tắc liên kết câu & Biện pháp tu từ',
        lessonCount: 4,
        completedCount: 2,
        lessons: [
          {
            id: 'viet_c1_l1',
            title: 'Bài 1: Nhận diện lỗi câu (Câu mơ hồ, Câu sai logic, Câu thiếu thành phần)',
            duration: '24 phút',
            status: 'COMPLETED',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: 15 dạng câu sai ngữ pháp xuất hiện nhiều nhất trong đề VNU-HCM',
              teacher: 'PGS.TS Phạm Văn Hùng',
              teacherRole: 'Trưởng bộ môn Ngôn ngữ ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Ba tuần trước',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'ATTENDED',
              prepNotes: 'Xem lại bài giảng ghi hình recap và file giải thích lỗi câu.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Câu đúng ngữ pháp tiếng Việt phải có đầy đủ nòng cốt Chủ ngữ - Vị ngữ, có sự tương thích ngữ nghĩa và phù hợp với quy tắc logic giao tiếp.',
                formulaSummary: [
                  'Lỗi thiếu chủ ngữ: Do nhầm trạng ngữ là chủ ngữ (thường bắt đầu bằng giới từ: "Qua...", "Bằng...", "Với...").',
                  'Lỗi sai logic: Các vế câu phản ánh quan hệ nguyên nhân - kết quả hoặc đồng vị không tương thích.'
                ],
                example: 'Ví dụ câu sai: "Qua tác phẩm Lão Hạc cho ta thấy số phận người nông dân nghèo." (Sai vì thiếu Chủ ngữ do nhầm trạng ngữ).'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải nhanh & Bẫy đề ĐGNL',
                steps: [
                  'Bước 1: Tìm cấu trúc nòng cốt C-V của câu.',
                  'Bước 2: Kiểm tra các liên từ nối (tuy... nhưng, không những... mà còn) xem có logic không.',
                  'Bước 3: Nhận diện bẫy: Đề thi thường đưa câu văn dài, hoa mỹ nhưng thực chất bị khuyết Chủ ngữ.'
                ],
                traps: [
                  'Bẫy từ Hán - Việt đồng âm khác nghĩa gây hiểu sai nghĩa biểu đạt của cả câu.'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu chuẩn ĐGNL',
                level: 'L2: Thông hiểu',
                question: 'Câu nào sau đây mắc lỗi ngữ pháp?',
                options: [
                  'A. Qua đợt khảo sát đã phản ánh đúng thực trạng học tập của học sinh.',
                  'B. Đợt khảo sát vừa qua đã phản ánh đúng thực trạng học tập của học sinh.',
                  'C. Nhờ đợt khảo sát, nhà trường đã nắm được thực trạng học tập của học sinh.',
                  'D. Thực trạng học tập của học sinh được phản ánh rõ qua đợt khảo sát.'
                ],
                correct: 'A',
                explanation: 'Câu A bị lỗi thiếu Chủ ngữ vì cụm từ "Qua đợt khảo sát" là trạng ngữ chỉ phương thức, câu không có danh từ nào làm chủ ngữ cho vị ngữ "đã phản ánh".'
              }
            },
            quiz: []
          },
          {
            id: 'viet_c1_l2',
            title: 'Bài 2: Đọc hiểu văn bản nhật dụng & Văn bản khoa học',
            duration: '28 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: Kỹ thuật định vị thông tin trong đoạn trích khoa học dài 600 từ',
              teacher: 'PGS.TS Phạm Văn Hùng',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Bảy tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'In tài liệu đọc hiểu 5 đoạn văn mẫu trước buổi Live.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Văn bản nhật dụng và khoa học đòi hỏi nắm vững thao tác lập luận (giải thích, chứng minh, bình luận, bác bỏ) và phương thức biểu đạt chính.',
                formulaSummary: ['Phương thức biểu đạt: Nghị luận, Thuyết minh, Tự sự, Miêu tả, Biểu cảm, Hành chính.'],
                example: 'Đoạn trích bàn về trí tuệ nhân tạo dùng phương thức chính là Nghị luận kết hợp Thuyết minh.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải',
                steps: ['Đọc câu hỏi trước để lấy từ khóa định vị dòng văn bản trong bài.'],
                traps: ['Bẫy suy diễn quá mức (over-extrapolation) không có trong dữ liệu văn bản!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L3: Vận dụng',
                question: 'Thao tác lập luận chủ đạo trong đoạn trích phê phán hiện tượng rác thải nhựa đại dương là gì?',
                options: ['A. Bác bỏ và chứng minh', 'B. Miêu tả và giải thích', 'C. Tự sự', 'D. Biểu cảm'],
                correct: 'A',
                explanation: 'Tác giả dùng số liệu thực tế để chứng minh tác hại và bác bỏ sự thờ ơ của con người.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_chemistry',
    name: 'Hóa học',
    domain: 'Khoa học Tự nhiên',
    weight: '40/1200 điểm',
    entryScore: 70,
    maxScore: 100,
    stage: 2,
    stageName: 'Giai đoạn 2: Tăng tốc chuyên sâu',
    badgeVariant: 'amber',
    statusText: 'Rèn phản xạ & bài toán thực tế',
    teacher: 'ThS. Đỗ Quốc Tuấn (Khoa Hóa học ĐHKHTN ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 70/100 (Khá). Nắm vững lý thuyết cơ bản, cần tăng tốc ở các bài toán este, đồ thị và hóa học ứng dụng đời sống.',
    chapters: [
      {
        id: 'chem_c1',
        title: 'Chương 1: Este - Lipit & Các hợp chất chứa Cacbon',
        lessonCount: 3,
        completedCount: 1,
        lessons: [
          {
            id: 'chem_c1_l1',
            title: 'Bài 1: Phản ứng xà phòng hóa & Bài toán đốt cháy este',
            duration: '25 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: Kỹ thuật dồn chất và bảo toàn nguyên tố este phân loại ĐGNL',
              teacher: 'ThS. Đỗ Quốc Tuấn',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '20:00, Thứ Tư tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Ôn tập công thức tính số mol $CO_2, H_2O$ và định luật bảo toàn khối lượng.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Este no, đơn chức, mạch hở có công thức chung $C_n H_{2n} O_2$ ($n \\ge 2$). Khi đốt cháy hoàn toàn luôn thu được số mol $CO_2$ bằng số mol $H_2O$.',
                formulaSummary: ['Đốt cháy: $n_{CO_2} = n_{H_2O} \\Rightarrow$ Este no, đơn chức, mạch hở.', 'Phản ứng xà phòng hóa: $RCOOR\' + NaOH \\to RCOONa + R\'OH$.'],
                example: 'Thủy phân etyl axetat $CH_3COOCH_2CH_3 + NaOH \\to CH_3COONa + CH_3CH_2OH$.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải',
                steps: ['Áp dụng bảo toàn khối lượng: $m_{este} + m_{NaOH} = m_{muối} + m_{ancol}$.'],
                traps: ['Este của phenol tạo ra 2 muối và nước, tỉ lệ $n_{NaOH} : n_{este} = 2 : 1$.']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L2: Thông hiểu',
                question: 'Thủy phân hoàn toàn 8,8g etyl axetat bằng dung dịch $NaOH$ vừa đủ thu được bao nhiêu gam muối khan?',
                options: ['A. 8,2 gam', 'B. 6,8 gam', 'C. 9,4 gam', 'D. 7,4 gam'],
                correct: 'A',
                explanation: '$n_{CH_3COOC_2H_5} = 8,8 / 88 = 0,1$ mol. Muối là $CH_3COONa$ ($M = 82$). $m_{muối} = 0,1 \\times 82 = 8,2$ g.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_history',
    name: 'Lịch sử',
    domain: 'Khoa học Xã hội',
    weight: '40/1200 điểm',
    entryScore: 72,
    maxScore: 100,
    stage: 2,
    stageName: 'Giai đoạn 2: Tăng tốc chuyên sâu',
    badgeVariant: 'amber',
    statusText: 'Rèn luyện kỹ năng so sánh & phân tích',
    teacher: 'TS. Nguyễn Thị Mai Hương (Khoa Lịch sử ĐHKHXH&NV)',
    summaryDesc: 'Điểm đầu vào 72/100 (Khá). Rèn luyện phân tích ý nghĩa lịch sử, bài học kinh nghiệm và so sánh giữa các phong trào cách mạng.',
    chapters: [
      {
        id: 'hist_c1',
        title: 'Chương 1: Cách mạng Việt Nam từ 1930 đến 1945',
        lessonCount: 3,
        completedCount: 1,
        lessons: [
          {
            id: 'hist_c1_l1',
            title: 'Bài 1: Phong trào 1930 - 1931 và Bài học cho Cách mạng Tháng Tám 1945',
            duration: '23 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: Các dạng câu hỏi so sánh thời cơ & lực lượng đề thi ĐGNL',
              teacher: 'TS. Nguyễn Thị Mai Hương',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Hai tuần tới',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Đọc trước bảng so sánh Cương lĩnh chính trị đầu tiên và Luận cương 10/1930.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Phong trào cách mạng 1930 - 1931 với đỉnh cao Xô viết Nghệ - Tĩnh là cuộc tập dượt đầu tiên chuẩn bị cho thắng lợi Cách mạng Tháng Tám năm 1945.',
                formulaSummary: ['Ý nghĩa cốt lõi: Khẳng định quyền lãnh đạo của Đảng Cộng sản và xây dựng khối liên minh công nông vững chắc.'],
                example: 'Chính quyền Xô viết đã thực hiện quyền làm chủ của nhân dân và chính sách ruộng đất.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải',
                steps: ['Phân tích từ khóa câu hỏi: "nguyên nhân trực tiếp", "nguyên nhân sâu xa", "ý nghĩa quyết định".'],
                traps: ['Nhầm lẫn giữa nhiệm vụ chiến lược và nhiệm vụ trước mắt!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L3: Vận dụng',
                question: 'Điểm khác biệt căn bản giữa Cương lĩnh chính trị (2/1930) và Luận cương chính trị (10/1930) là gì?',
                options: [
                  'A. Xác định kẻ thù và tập hợp lực lượng cách mạng',
                  'B. Mục tiêu cuối cùng của cách mạng',
                  'C. Vai trò lãnh đạo của Đảng',
                  'D. Mối quan hệ với cách mạng thế giới'
                ],
                correct: 'A',
                explanation: 'Cương lĩnh chủ trương đoàn kết toàn dân tộc, trong khi Luận cương nặng về đấu tranh giai cấp và chỉ tập hợp công - nông.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },

  // ==========================================
  // GIAI ĐOẠN 3: BỨT PHÁ 900+ MASTER (3 MÔN)
  // ==========================================
  {
    id: 'sub_logic_data',
    name: 'Tư duy Logic & Phân tích số liệu',
    domain: 'Toán học & Tư duy',
    weight: '300/1200 điểm',
    entryScore: 90,
    maxScore: 100,
    stage: 3,
    stageName: 'Giai đoạn 3: Bứt phá 900+ Master',
    badgeVariant: 'emerald',
    statusText: 'Chinh phục câu phân loại cao 900+',
    teacher: 'TS. Bùi Quốc Anh (Viện Công nghệ Thông tin ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 90/100 (Xuất sắc). Bỏ qua lý thuyết cơ bản, tập trung giải các đề ma trận số liệu phức tạp và tối ưu tốc độ < 1.5 phút/câu.',
    chapters: [
      {
        id: 'log_c1',
        title: 'Chương 1: Suy luận suy diễn & Mệnh đề logic phức tạp',
        lessonCount: 4,
        completedCount: 2,
        lessons: [
          {
            id: 'log_c1_l1',
            title: 'Bài 1: Logic mệnh đề, Quy tắc Modus Tollens & Phản chứng đa biến',
            duration: '30 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: Chiến thuật phá giải bài toán logic xếp chỗ & phân nhóm cực khó',
              teacher: 'TS. Bùi Quốc Anh',
              teacherRole: 'Chuyên gia Logic học & AI ĐHQG-HCM',
              scheduledAt: '20:00, Thứ Bảy tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'In bảng ma trận logic 6x6 trước khi vào phòng Meet.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK & Chuẩn Logic quốc tế',
                definition: 'Quy tắc suy luận Modus Tollens: Nếu mệnh đề kéo theo $P \\Rightarrow Q$ đúng, và thực tế $\\neg Q$ (không $Q$) là đúng, thì bắt buộc $\\neg P$ (không $P$) phải đúng.',
                formulaSummary: [
                  'Phủ định của mệnh đề "Tất cả": $\\neg(\\forall x, P(x)) \\Leftrightarrow \\exists x, \\neg P(x)$ (Tồn tại ít nhất một đối tượng không thỏa mãn).',
                  'Phủ định của mệnh đề "Nếu P thì Q": $P \\wedge \\neg Q$ (P xảy ra nhưng Q không xảy ra).'
                ],
                example: 'Ví dụ: "Nếu trời mưa thì đường ướt". Thực tế "Đường không ướt" $\\Rightarrow$ Suy ra chắc chắn: "Trời không mưa".'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải tốc biến & Bẫy đề 900+',
                steps: [
                  'Bước 1: Mã hóa các đối tượng thành chữ cái (A, B, C, D) và quan hệ thứ tự ($> , < , =$).',
                  'Bước 2: Lập bảng ma trận loại trừ nhị phân 0 - 1.',
                  'Bước 3: Tận dụng giả thiết độc lập mang tính hạn chế cao nhất (ví dụ: "A không bao giờ ngồi cạnh B") để thu hẹp không gian nghiệm.'
                ],
                traps: [
                  'Bẫy ngộ nhận đảo: Cho $P \\Rightarrow Q$, nhiều bạn ngộ nhận $Q \\Rightarrow P$ hoặc $\\neg P \\Rightarrow \\neg Q$ (đây là ngụy biện logic phổ biến nhất)!'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu phân loại 900+',
                level: 'L4: Vận dụng cao (Phân loại top 5%)',
                question: 'Có 5 bạn An, Bình, Cúc, Dũng, Em ngồi vào 5 ghế thẳng hàng. Biết rằng: (1) An ngồi cạnh Bình; (2) Cúc không ngồi cạnh An; (3) Dũng ngồi ở ghế đầu tiên; (4) Em ngồi cạnh Dũng. Hỏi bạn nào ngồi ở vị trí chính giữa?',
                options: ['A. An', 'B. Bình', 'C. Cúc', 'D. Em'],
                correct: 'B',
                explanation: 'Dũng ở vị trí 1, Em ở vị trí 2 (vì ngồi cạnh Dũng). Còn lại ghế 3, 4, 5 dành cho An, Bình, Cúc. An và Bình ngồi cạnh nhau nên phải chiếm ghế 3-4 hoặc 4-5. Nhưng Cúc không ngồi cạnh An, do đó An phải ở ghế 4, Bình ở ghế 3 và Cúc ở ghế 5. Vị trí chính giữa (ghế 3) là Bình.'
              }
            },
            quiz: []
          }
        ]
      },
      {
        id: 'log_c2',
        title: 'Chương 2: Đọc hiểu và phân tích biểu đồ số liệu đa biến',
        lessonCount: 3,
        completedCount: 1,
        lessons: [
          {
            id: 'log_c2_l1',
            title: 'Bài 1: Kỹ thuật ước lượng số liệu nhanh không cần bấm máy tính chi tiết',
            duration: '26 phút',
            status: 'LOCKED',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: 10 bài toán phân tích biểu đồ cột chồng & biểu đồ miền VNU-HCM',
              teacher: 'TS. Bùi Quốc Anh',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '20:00, Thứ Bảy tuần sau',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Chuẩn bị thước đo tỷ lệ phần trăm.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng',
                definition: 'Tốc độ tăng trưởng liên hoàn $T = \\frac{Y_t - Y_{t-1}}{Y_{t-1}} \\times 100\\%$. Tỷ trọng thành phần $S = \\frac{A_i}{\\sum A} \\times 100\\%$.',
                formulaSummary: ['Ước lượng sai số cho phép $\\pm 2\\%$.'],
                example: 'Năm 2024 đạt 120 tỷ, năm 2025 đạt 150 tỷ $\\Rightarrow$ Tăng $(30 / 120) = 25\\%$.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải nhanh',
                steps: ['Làm tròn số đến hàng chục để nhẩm tỷ số trước khi nhìn 4 đáp án.'],
                traps: ['Nhầm lẫn giữa "tăng nhiều nhất về số tuyệt đối" và "tăng nhanh nhất về tỷ lệ phần trăm"!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L3: Vận dụng',
                question: 'Biểu đồ cho thấy năm 2020 sản lượng đạt 50 tấn, năm 2024 đạt 125 tấn. Tốc độ tăng trưởng sau 4 năm là:',
                options: ['A. 150%', 'B. 250%', 'C. 75%', 'D. 125%'],
                correct: 'A',
                explanation: 'Tốc độ tăng trưởng = $(125 - 50) / 50 \\times 100\\% = 75 / 50 \\times 100\\% = 150\\%$.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_english',
    name: 'Tiếng Anh',
    domain: 'Sử dụng ngôn ngữ',
    weight: '200/1200 điểm',
    entryScore: 84,
    maxScore: 100,
    stage: 3,
    stageName: 'Giai đoạn 3: Bứt phá 900+ Master',
    badgeVariant: 'emerald',
    statusText: 'Luyện đề tốc độ & bẫy nâng cao',
    teacher: 'ThS. Sarah Jenkins & ThS. Trần Anh Thư (Khoa Ngữ văn Anh ĐHKHXH&NV)',
    summaryDesc: 'Điểm đầu vào 84/100 (Giỏi). Rèn luyện tốc độ đọc hiểu văn bản dài, bẫy Collocation và từ đồng nghĩa ngữ cảnh học thuật.',
    chapters: [
      {
        id: 'eng_c1',
        title: 'Chương 1: Kỹ năng đọc hiểu học thuật nâng cao (Academic Reading)',
        lessonCount: 4,
        completedCount: 2,
        lessons: [
          {
            id: 'eng_c1_l1',
            title: 'Bài 1: Kỹ thuật Skimming & Định vị bẫy từ đồng nghĩa (Paraphrasing)',
            duration: '28 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            liveSchedule: {
              title: 'Live Q&A: Bí kíp giải nhanh 20 câu tiếng Anh VNU-HCM dưới 12 phút',
              teacher: 'ThS. Trần Anh Thư',
              teacherRole: 'Giảng viên chuyên môn ĐHQG-HCM',
              scheduledAt: '19:30, Thứ Năm tuần này',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'In trước đề thi thử tiếng Anh 2026 đính kèm trong thư mục tài liệu.'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng & Chuẩn VNU-ENG',
                definition: 'Kỹ thuật Skimming giúp nắm ý chính (Main Idea) thông qua câu chủ đề (Topic Sentence) ở đầu hoặc cuối mỗi đoạn văn mà không cần dịch từng từ.',
                formulaSummary: [
                  'Từ nối tương phản (Contrast): However, Nevertheless, On the contrary, Whereas $\\to$ Chú ý ý sau từ nối.',
                  'Từ nối nguyên nhân - kết quả: Therefore, Consequently, As a result.'
                ],
                example: 'Dấu hiệu nhận biết câu hỏi suy luận: "It can be inferred from the passage that..."'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp & Bẫy đề 900+',
                steps: [
                  'Gạch chân từ khóa trong câu hỏi (Keywords).',
                  'Tìm từ đồng nghĩa (Paraphrased words) trong bài đọc thay vì tìm y nguyên từ gốc.',
                  'Loại bỏ các phương án có chứa từ cực đoan (Always, Never, Completely, Solely) nếu bài đọc không khẳng định tuyệt đối.'
                ],
                traps: [
                  'Bẫy thông tin có thật trong đời sống nhưng KHÔNG được nhắc tới trong bài đọc!'
                ]
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu chuẩn ĐGNL',
                level: 'L3: Vận dụng',
                question: 'The word "imperative" in paragraph 2 is closest in meaning to:',
                options: ['A. crucial', 'B. voluntary', 'C. negligible', 'D. traditional'],
                correct: 'A',
                explanation: '"Imperative" có nghĩa là cấp bách, cực kỳ quan trọng, đồng nghĩa với "crucial".'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  },
  {
    id: 'sub_geography',
    name: 'Địa lý',
    domain: 'Khoa học Xã hội',
    weight: '40/1200 điểm',
    entryScore: 80,
    maxScore: 100,
    stage: 3,
    stageName: 'Giai đoạn 3: Bứt phá 900+ Master',
    badgeVariant: 'emerald',
    statusText: 'Luyện đề tốc độ & biểu đồ kinh tế',
    teacher: 'TS. Hoàng Hải Yến (Khoa Địa lý ĐHKHXH&NV ĐHQG-HCM)',
    summaryDesc: 'Điểm đầu vào 80/100 (Giỏi). Rèn luyện phân tích biểu đồ kinh tế các vùng, Atlat Địa lý VN và biến đổi khí hậu.',
    chapters: [
      {
        id: 'geo_c1',
        title: 'Chương 1: Địa lý các vùng kinh tế trọng điểm Việt Nam',
        lessonCount: 3,
        completedCount: 1,
        lessons: [
          {
            id: 'geo_c1_l1',
            title: 'Bài 1: Khai thác thế mạnh kinh tế biển & Công nghiệp vùng Đông Nam Bộ',
            duration: '24 phút',
            status: 'IN_PROGRESS',
            videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
            liveSchedule: {
              title: 'Live Q&A: 10 câu hỏi khai thác biểu đồ địa lý kinh tế ĐGNL',
              teacher: 'TS. Hoàng Hải Yến',
              teacherRole: 'Giảng viên ĐHQG-HCM',
              scheduledAt: '20:00, Thứ Tư tuần tới',
              meetUrl: 'https://meet.google.com/xyz-veval-demo',
              attendanceStatus: 'SCHEDULED',
              prepNotes: 'Chuẩn bị Atlat Địa lý Việt Nam trang 29 (Vùng Đông Nam Bộ).'
            },
            lectureNotes: {
              block1_sgk: {
                title: 'Khối 1: Kiến thức nền tảng SGK',
                definition: 'Đông Nam Bộ là vùng kinh tế dẫn đầu cả nước về GDP, giá trị sản xuất công nghiệp và thu hút vốn đầu tư nước ngoài (FDI).',
                formulaSummary: ['Thế mạnh nổi bật: Dầu khí thềm lục địa, cảng biển nước sâu Cái Mép - Thị Vải, cây công nghiệp lâu năm (cao su, tiêu, điều).'],
                example: 'Cây cao su được trồng nhiều nhất ở Bình Dương, Bình Phước, Tây Ninh nhờ đất xám phù sa cổ.'
              },
              block2_method: {
                title: 'Khối 2: Phương pháp giải nhanh',
                steps: ['Dựa vào vị trí địa lý giáp biển và cơ sở hạ tầng giao thông kết nối để lý giải nguyên nhân phát triển.'],
                traps: ['Nhầm lẫn giữa thế mạnh tự nhiên và thế mạnh kinh tế - xã hội!']
              },
              block3_sample: {
                title: 'Khối 3: Bài toán mẫu',
                level: 'L3: Vận dụng',
                question: 'Nhân tố chủ yếu thúc đẩy ngành công nghiệp của vùng Đông Nam Bộ phát triển năng động nhất cả nước là:',
                options: [
                  'A. Thu hút mạnh nguồn vốn đầu tư trong và ngoài nước cùng cơ sở hạ tầng hoàn thiện',
                  'B. Nguồn tài nguyên khoáng sản kim loại màu phong phú',
                  'C. Nền nông nghiệp lúa nước phát triển mạnh',
                  'D. Mạng lưới sông ngòi dày đặc thuận lợi thủy điện'
                ],
                correct: 'A',
                explanation: 'Đông Nam Bộ dẫn đầu cả nước nhờ nguồn vốn FDI dồi dào, nguồn lao động lành nghề và cơ sở hạ tầng hiện đại.'
              }
            },
            quiz: []
          }
        ]
      }
    ]
  }
];
