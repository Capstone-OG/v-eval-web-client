/**
 * V-Eval Diagnostic Assessment Data & Psychometric Benchmarks
 * Provides initial test history, sample 30-question diagnostic results,
 * and psychometric radar/trend data compatible with IRT 2PL.
 */

// 5 Miền năng lực chuẩn V-ACT 2026
export const DOMAINS = {
  dom_math: { name: 'Toán học & Phân tích số liệu', color: 'from-blue-600 to-cyan-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  dom_logic: { name: 'Tư duy Logic & Suy luận', color: 'from-purple-600 to-indigo-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  dom_lang: { name: 'Sử dụng Ngôn ngữ & Văn học', color: 'from-emerald-600 to-teal-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dom_nat_sci: { name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', color: 'from-amber-600 to-orange-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  dom_soc_sci: { name: 'Khoa học Xã hội (Sử - Địa)', color: 'from-rose-600 to-pink-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
};

// 30 câu hỏi mẫu chuẩn hóa khảo sát chẩn đoán đầu vào V-ACT 2026
export const SAMPLE_30_QUESTIONS = [
  // 1. TOÁN HỌC & PHÂN TÍCH SỐ LIỆU (Câu 1 - 6)
  {
    id: 'diag_q_1',
    question_number: 1,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Khảo sát hàm số & Cực trị',
    bloom: 2,
    content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực đại của đồ thị hàm số đã cho có tọa độ là:',
    options: ['(0; 2)', '(2; -2)', '(1; 0)', '(-1; -2)'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 35,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Ta có đạo hàm $y\' = 3x^2 - 6x = 3x(x - 2)$. Giải $y\' = 0 \\iff x = 0$ hoặc $x = 2$. Do đạo hàm đổi dấu từ dương sang âm khi qua $x = 0$ nên điểm cực đại là $(0; y(0)) = (0; 2)$.'
  },
  {
    id: 'diag_q_2',
    question_number: 2,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Xác suất & Tổ hợp',
    bloom: 3,
    content: 'Một hộp chứa 5 quả cầu đỏ và 7 quả cầu xanh có kích thước giống nhau. Lấy ngẫu nhiên đồng thời 3 quả cầu. Xác suất để lấy được ít nhất 1 quả cầu đỏ là:',
    options: ['$\\frac{37}{44}$', '$\\frac{7}{44}$', '$\\frac{21}{44}$', '$\\frac{5}{12}$'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 52,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Số phần tử không gian mẫu là $n(\\Omega) = C_{12}^3 = 220$. Biến cố đối $A$: "Cả 3 quả lấy ra đều màu xanh", $n(A) = C_7^3 = 35$. Vậy xác suất cần tìm là $P = 1 - \\frac{35}{220} = 1 - \\frac{7}{44} = \\frac{37}{44}$.'
  },
  {
    id: 'diag_q_3',
    question_number: 3,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Phân tích số liệu biểu đồ kinh tế',
    bloom: 3,
    content: 'Biểu đồ cho thấy doanh thu của công ty A năm 2024 tăng 25% so với năm 2023, nhưng năm 2025 lại giảm 10% so với năm 2024. So với năm 2023, doanh thu năm 2025 đã thay đổi như thế nào?',
    options: ['Tăng 12.5%', 'Tăng 15.0%', 'Tăng 10.0%', 'Giảm 2.5%'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 28,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Gọi doanh thu năm 2023 là $X$. Doanh thu 2024 là $1.25X$. Doanh thu 2025 là $1.25X \\times (1 - 0.10) = 1.25 \\times 0.90 X = 1.125X$. Như vậy so với năm 2023, doanh thu tăng $12.5\\%$.'
  },
  {
    id: 'diag_q_4',
    question_number: 4,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Tích phân & Ứng dụng hình học',
    bloom: 4,
    content: 'Diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2 - 4x + 3$ và trục hoành $Ox$ bằng:',
    options: ['$\\frac{4}{3}$', '$\\frac{2}{3}$', '$\\frac{8}{3}$', '$\\frac{5}{3}$'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 48,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Phương trình hoành độ giao điểm: $x^2 - 4x + 3 = 0 \\iff x = 1$ hoặc $x = 3$. Diện tích $S = \\int_1^3 |x^2 - 4x + 3| dx = - \\left[ \\frac{x^3}{3} - 2x^2 + 3x \\right]_1^3 = \\frac{4}{3}$.'
  },
  {
    id: 'diag_q_5',
    question_number: 5,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Hình học không gian Oxyz',
    bloom: 4,
    content: 'Trong không gian $Oxyz$, cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0$. Bán kính $R$ của mặt cầu $(S)$ bằng:',
    options: ['4', '16', '$\\sqrt{14}$', '$\\sqrt{12}$'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 30,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Tâm mặt cầu là $I(1; -2; 3)$, hệ số tự do $d = -2$. Bán kính $R = \\sqrt{a^2 + b^2 + c^2 - d} = \\sqrt{1^2 + (-2)^2 + 3^2 - (-2)} = \\sqrt{1 + 4 + 9 + 2} = \\sqrt{16} = 4$.'
  },
  {
    id: 'diag_q_6',
    question_number: 6,
    domain_id: 'dom_math',
    domain_name: 'Toán học & Phân tích số liệu',
    skill_name: 'Bất đẳng thức & Cực trị đại số',
    bloom: 5,
    content: 'Cho các số thực dương $a, b, c$ thỏa mãn $a + b + c = 3$. Giá trị nhỏ nhất của biểu thức $P = \\frac{1}{a} + \\frac{1}{b} + \\frac{1}{c}$ là:',
    options: ['3', '1', '9', '$\\frac{1}{3}$'],
    studentChoice: 'C',
    correctChoice: 'A',
    isCorrect: false,
    timeSpent: 110,
    speedCategory: 'slow',
    isFlagged: true,
    explanation: 'Áp dụng bất đẳng thức Cauchy-Schwarz dạng phân thức: $P = \\frac{1}{a} + \\frac{1}{b} + \\frac{1}{c} \\ge \\frac{(1+1+1)^2}{a+b+c} = \\frac{9}{3} = 3$. Dấu bằng xảy ra khi $a = b = c = 1$. Thí sinh chọn nhầm tổng trên tử (9) thay vì chia cho mẫu (3).'
  },

  // 2. TƯ DUY LOGIC & SUY LUẬN (Câu 7 - 12)
  {
    id: 'diag_q_7',
    question_number: 7,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Mệnh đề logic kéo theo & Phủ định',
    bloom: 3,
    content: 'Cho mệnh đề: "Nếu một học sinh đạt giải quốc gia thì học sinh đó được tuyển thẳng đại học". Mệnh đề nào sau đây tương đương về mặt logic với mệnh đề đã cho?',
    options: [
      'Nếu học sinh không được tuyển thẳng đại học thì học sinh đó không đạt giải quốc gia',
      'Nếu học sinh được tuyển thẳng đại học thì học sinh đó đạt giải quốc gia',
      'Nếu học sinh không đạt giải quốc gia thì học sinh đó không được tuyển thẳng',
      'Học sinh đạt giải quốc gia khi và chỉ khi được tuyển thẳng đại học'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 22,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Theo nguyên lý phản đảo (Contrapositive): Mệnh đề $P \\implies Q$ tương đương logic với $\\neg Q \\implies \\neg P$. "Không được tuyển thẳng" suy ra "Không đạt giải quốc gia".'
  },
  {
    id: 'diag_q_8',
    question_number: 8,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Quy nạp & Bài toán sắp xếp thứ tự',
    bloom: 4,
    content: 'Có 5 bạn An, Bình, Chi, Dũng, Giang đứng thành một hàng dọc. An đứng trước Bình nhưng đứng sau Chi. Giang đứng ở vị trí đầu tiên. Dũng đứng ngay sau Bình. Bạn nào đứng ở vị trí thứ 3?',
    options: ['An', 'Chi', 'Bình', 'Dũng'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 44,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Vị trí 1 là Giang. Thứ tự tương đối: Chi trước An, An trước Bình, Dũng sau Bình $\\implies$ Chi -> An -> Bình -> Dũng. Do Giang đứng đầu nên thứ tự từ 1 đến 5 là: 1: Giang, 2: Chi, 3: An, 4: Bình, 5: Dũng. Vị trí thứ 3 là An.'
  },
  {
    id: 'diag_q_9',
    question_number: 9,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Suy luận ma trận điều kiện',
    bloom: 4,
    content: 'Trong một buổi phỏng vấn có 4 ứng viên: Nam, Phúc, Quang, Sơn ứng tuyển vào 2 vị trí IT và Marketing (mỗi vị trí đúng 2 người). Biết rằng: (1) Nếu Nam làm IT thì Quang làm Marketing; (2) Phúc và Quang luôn làm cùng một vị trí; (3) Sơn làm IT. Hỏi Nam làm ở vị trí nào?',
    options: ['Marketing', 'IT', 'Không xác định được', 'Cả hai vị trí'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 62,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Sơn đã làm IT (1 suất IT). Phúc và Quang làm cùng vị trí: nếu họ làm IT thì IT có 3 người (Sơn, Phúc, Quang), vô lý. Do đó Phúc và Quang phải làm Marketing (2 suất Marketing đầy). Vậy suất IT còn lại duy nhất thuộc về Nam? Khoan, nếu Nam làm IT thì theo (1) Quang phải làm Marketing (thỏa). Nhưng nếu Phúc và Quang làm Marketing thì Marketing đủ 2 người, do đó Nam và Sơn phải làm IT? Tuy nhiên kiểm tra lại: Nếu Nam làm Marketing thì vi phạm số lượng. Vậy suy ra Nam làm IT.'
  },
  {
    id: 'diag_q_10',
    question_number: 10,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Phủ định mệnh đề lượng từ',
    bloom: 3,
    content: 'Mệnh đề phủ định của mệnh đề: "Mọi số nguyên tố đều là số lẻ" là:',
    options: [
      'Tồn tại ít nhất một số nguyên tố không phải là số lẻ',
      'Mọi số nguyên tố đều không phải là số lẻ',
      'Tồn tại số nguyên tố là số chẵn',
      'Tất cả các số lẻ đều là số nguyên tố'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 18,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Phủ định của mệnh đề $\\forall x \\in P, Q(x)$ là $\\exists x \\in P, \\neg Q(x)$: "Tồn tại ít nhất một số nguyên tố không phải là số lẻ" (chính là số 2).'
  },
  {
    id: 'diag_q_11',
    question_number: 11,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Tam đoạn luận & Loại trừ phương án',
    bloom: 4,
    content: 'Biết rằng: "Tất cả các nhà toán học đều yêu thích tư duy logic. Một số người yêu thích tư duy logic là những người chơi cờ vua giỏi." Kết luận nào sau đây chắc chắn đúng?',
    options: [
      'Chưa thể khẳng định chắc chắn có nhà toán học nào chơi cờ vua giỏi hay không',
      'Tất cả các nhà toán học đều chơi cờ vua giỏi',
      'Không có nhà toán học nào chơi cờ vua giỏi',
      'Một số người chơi cờ vua giỏi không thích tư duy logic'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 38,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Tập hợp "Nhà toán học" là tập con của "Yêu thích logic". Tập "Chơi cờ giỏi" giao với "Yêu thích logic". Ta không có thông tin về việc giao điểm đó có chứa nhà toán học hay không, do đó chưa thể khẳng định chắc chắn.'
  },
  {
    id: 'diag_q_12',
    question_number: 12,
    domain_id: 'dom_logic',
    domain_name: 'Tư duy Logic & Suy luận',
    skill_name: 'Logic quy nạp số liệu & Ma trận',
    bloom: 5,
    content: 'Cho dãy số quy luật: 2, 6, 12, 20, 30, ... Số hạng thứ 10 của dãy số là:',
    options: ['110', '90', '100', '132'],
    studentChoice: 'B',
    correctChoice: 'A',
    isCorrect: false,
    timeSpent: 95,
    speedCategory: 'slow',
    isFlagged: true,
    explanation: 'Quy luật của dãy số là tích 2 số tự nhiên liên tiếp: $u_1 = 1 \\times 2 = 2$; $u_2 = 2 \\times 3 = 6$; $u_3 = 3 \\times 4 = 12$; ... Do đó số hạng thứ 10 là $u_{10} = 10 \\times 11 = 110$. Thí sinh tính nhầm $u_9 = 9 \\times 10 = 90$.'
  },

  // 3. SỬ DỤNG NGÔN NGỮ & VĂN HỌC (Câu 13 - 18)
  {
    id: 'diag_q_13',
    question_number: 13,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Biện pháp tu từ tiếng Việt',
    bloom: 2,
    content: 'Trong câu thơ: "Bàn tay ta làm nên tất cả / Có sức người sỏi đá cũng thành cơm" (Hoàng Trung Thông), tác giả đã sử dụng biện pháp tu từ nổi bật nào?',
    options: ['Hoán dụ', 'Ẩn dụ', 'So sánh', 'Nhân hóa'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 20,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: '"Bàn tay" lấy bộ phận để chỉ toàn thể (sức lao động của con người) $\\implies$ Biện pháp tu từ hoán dụ.'
  },
  {
    id: 'diag_q_14',
    question_number: 14,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Từ Hán - Việt & Nghĩa của từ',
    bloom: 3,
    content: 'Từ "bất cập" trong câu: "Quy định mới còn nhiều điểm bất cập cần sớm sửa đổi" có nghĩa là gì?',
    options: [
      'Chưa đáp ứng được yêu cầu, chưa theo kịp thực tế',
      'Hoàn toàn sai trái và vi phạm pháp luật',
      'Được thực hiện một cách khẩn cấp',
      'Đạt đến mức độ tối ưu ngoài mong đợi'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 16,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: '"Bất" là không, "cập" là theo kịp/đạt tới. "Bất cập" nghĩa là không theo kịp, không tương xứng hoặc chưa đáp ứng được yêu cầu thực tiễn.'
  },
  {
    id: 'diag_q_15',
    question_number: 15,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Chữa lỗi ngữ pháp & Câu ghép',
    bloom: 3,
    content: 'Câu nào sau đây mắc lỗi sai ngữ pháp (lỗi thiếu chủ ngữ hoặc lẫn lộn trạng ngữ với chủ ngữ)?',
    options: [
      'Qua tác phẩm "Tắt đèn" đã cho ta thấy nỗi khổ cực của người nông dân trước cách mạng.',
      'Tác phẩm "Tắt đèn" đã cho ta thấy nỗi khổ cực của người nông dân trước cách mạng.',
      'Qua tác phẩm "Tắt đèn", tác giả đã cho ta thấy nỗi khổ cực của người nông dân.',
      'Đọc tác phẩm "Tắt đèn", chúng ta thấy rõ nỗi bất công trong xã hội cũ.'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 26,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Câu "Qua tác phẩm Tắt đèn đã cho ta thấy..." biến danh từ thành trạng ngữ bằng giới từ "Qua", khiến câu không có chủ ngữ.'
  },
  {
    id: 'diag_q_16',
    question_number: 16,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Đọc hiểu văn bản & Phong cách ngôn ngữ',
    bloom: 4,
    content: 'Phong cách ngôn ngữ của một văn bản nghị quyết đại hội cổ đông doanh nghiệp thuộc phong cách nào?',
    options: ['Phong cách hành chính - công vụ', 'Phong cách khoa học', 'Phong cách báo chí', 'Phong cách chính luận'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 24,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Nghị quyết đại hội cổ đông mang tính quy phạm pháp lý nội bộ, có khuôn mẫu quy chuẩn nên thuộc phong cách hành chính - công vụ.'
  },
  {
    id: 'diag_q_17',
    question_number: 17,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Phân tích văn học trung đại',
    bloom: 4,
    content: 'Cảm hứng nhân đạo sâu sắc trong "Truyện Kiều" của Nguyễn Du thể hiện rõ nhất qua phương diện nào?',
    options: [
      'Sự xót thương số phận bi kịch của người phụ nữ tài hoa và trân trọng khát vọng tình yêu tự do',
      'Sự ca ngợi tài sắc vẹn toàn vượt bậc của Thúy Kiều',
      'Sự phê phán các quan lại phong kiến tham lam vô độ',
      'Mô tả chân thực cảnh chia tay giữa Thúy Kiều và Kim Trọng'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 32,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Cốt lõi giá trị nhân đạo của Truyện Kiều là niềm xót thương định mệnh trớ trêu của người tài hoa bạc mệnh và tiếng nói đòi quyền sống, tình yêu tự do.'
  },
  {
    id: 'diag_q_18',
    question_number: 18,
    domain_id: 'dom_lang',
    domain_name: 'Sử dụng Ngôn ngữ & Văn học',
    skill_name: 'Đọc hiểu ngữ liệu & Lập luận văn bản',
    bloom: 5,
    content: 'Trong một đoạn văn lập luận bác bỏ, yếu tố nào đóng vai trò quan trọng nhất để tạo nên tính thuyết phục cao?',
    options: [
      'Dẫn chứng thực tế xác thực kết hợp phân tích logic chỉ ra điểm sai lầm của luận điểm đối lập',
      'Sử dụng nhiều từ ngữ biểu cảm mạnh và câu hỏi tu từ',
      'Trích dẫn nhiều câu danh ngôn của các vĩ nhân thế giới',
      'Lặp lại luận điểm của bản thân nhiều lần để nhấn mạnh'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 31,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Nghị luận bác bỏ đòi hỏi tính khách quan, luận cứ xác thực và lập luận sắc bén để vạch rõ lỗ hổng logic của luận điểm bị bác bỏ.'
  },

  // 4. KHOA HỌC TỰ NHIÊN (LÝ - HÓA - SINH) (Câu 19 - 24)
  {
    id: 'diag_q_19',
    question_number: 19,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Dao động cơ học & Năng lượng (Vật lý)',
    bloom: 3,
    content: 'Một con lắc lò xo gồm vật nhỏ khối lượng $m$ và lò xo có độ cứng $k$ dao động điều hòa với biên độ $A$. Khi vật ở vị trí có li độ $x = \\frac{A}{2}$ thì tỉ số giữa động năng và thế năng của vật là:',
    options: ['3', '$\\frac{1}{3}$', '4', '$\\frac{1}{4}$'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 42,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Thế năng $W_t = \\frac{1}{2} k x^2 = \\frac{1}{4} W$. Cơ năng $W = W_d + W_t \\implies W_d = \\frac{3}{4} W$. Tỉ số $\\frac{W_d}{W_t} = \\frac{3/4}{1/4} = 3$.'
  },
  {
    id: 'diag_q_20',
    question_number: 20,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Cân bằng hóa học & pH dung dịch (Hóa học)',
    bloom: 3,
    content: 'Dung dịch $HCl$ có nồng độ $0.001\\text{ M}$. Giá trị $pH$ của dung dịch này bằng:',
    options: ['3', '11', '1', '4'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 19,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: '$HCl$ phân li hoàn toàn: $[H^+] = 0.001\\text{ M} = 10^{-3}\\text{ M} \\implies pH = -\\log[H^+] = 3$.'
  },
  {
    id: 'diag_q_21',
    question_number: 21,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Quy luật di truyền Men-đen (Sinh học)',
    bloom: 3,
    content: 'Ở đậu Hà Lan, gen A quy định hạt vàng trội hoàn toàn so với gen a quy định hạt xanh. Cho cây hạt vàng dị hợp $Aa$ tự thụ phấn, tỉ lệ kiểu hình thu được ở đời con $F_1$ là:',
    options: ['3 hạt vàng : 1 hạt xanh', '1 hạt vàng : 1 hạt xanh', '100% hạt vàng', '1 hạt vàng : 2 hạt xanh'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 22,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Phép lai $Aa \\times Aa \\implies$ Tỉ lệ kiểu gen: $1 AA : 2 Aa : 1 aa$. Tỉ lệ kiểu hình: 3 hạt vàng (1AA + 2Aa) : 1 hạt xanh (1aa).'
  },
  {
    id: 'diag_q_22',
    question_number: 22,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Sóng dừng & Bước sóng (Vật lý)',
    bloom: 4,
    content: 'Trên một sợi dây đàn hồi dài $1.2\\text{ m}$ hai đầu cố định đang có sóng dừng với 3 bụng sóng. Bước sóng $\\lambda$ trên dây là:',
    options: ['0.8 m', '0.4 m', '1.2 m', '2.4 m'],
    studentChoice: 'C',
    correctChoice: 'A',
    isCorrect: false,
    timeSpent: 75,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Điều kiện sóng dừng hai đầu cố định: $L = k \\frac{\\lambda}{2}$. Với 3 bụng sóng $\\implies k = 3$. Do đó $1.2 = 3 \\frac{\\lambda}{2} \\implies \\lambda = \\frac{2.4}{3} = 0.8\\text{ m}$. Thí sinh chọn nhầm $L = \\lambda$.'
  },
  {
    id: 'diag_q_23',
    question_number: 23,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Hóa học hữu cơ & Phản ứng Este hóa (Hóa học)',
    bloom: 4,
    content: 'Đun nóng $6.0\\text{ g}$ axit axetic ($CH_3COOH$) với lượng dư ancol etylic ($C_2H_5OH$) có $H_2SO_4$ đặc xúc tác, thu được $5.28\\text{ g}$ etyl axetat. Hiệu suất của phản ứng este hóa là:',
    options: ['60%', '75%', '80%', '50%'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 68,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: '$n_{axit} = 6 / 60 = 0.1\\text{ mol}$. Lượng este lý thuyết thu được là $0.1 \\times 88 = 8.8\\text{ g}$. Hiệu suất $H = \\frac{5.28}{8.8} \\times 100\\% = 60\\%$.'
  },
  {
    id: 'diag_q_24',
    question_number: 24,
    domain_id: 'dom_nat_sci',
    domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)',
    skill_name: 'Sinh thái học & Dòng năng lượng (Sinh học)',
    bloom: 4,
    content: 'Trong hệ sinh thái, hiệu suất sinh thái chuyển giao năng lượng giữa các bậc dinh dưỡng kế tiếp nhau thông thường chỉ đạt khoảng bao nhiêu phần trăm?',
    options: ['Khoảng 10%', 'Khoảng 50%', 'Khoảng 75%', 'Khoảng 25%'],
    studentChoice: 'B',
    correctChoice: 'A',
    isCorrect: false,
    timeSpent: 80,
    speedCategory: 'normal',
    isFlagged: true,
    explanation: 'Theo quy luật Lindeman, chỉ có khoảng $10\\%$ năng lượng được truyền lên bậc dinh dưỡng cao hơn kế tiếp, $90\\%$ còn lại bị thất thoát qua bài tiết, hô hấp và nhiệt.'
  },

  // 5. KHOA HỌC XÃ HỘI (SỬ - ĐỊA) (Câu 25 - 30)
  {
    id: 'diag_q_25',
    question_number: 25,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Lịch sử kháng chiến chống Pháp (Lịch sử)',
    bloom: 2,
    content: 'Chiến thắng nào của quân và dân ta đã làm phá sản hoàn toàn kế hoạch Nava của thực dân Pháp năm 1954?',
    options: ['Chiến dịch Điện Biên Phủ', 'Chiến dịch Biên giới 1950', 'Chiến dịch Việt Bắc 1947', 'Chiến dịch Tây Bắc 1952'],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 18,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Chiến dịch Điện Biên Phủ 1954 "lừng lẫy năm châu, chấn động địa cầu" đã đập tan tập đoàn cứ điểm mạnh nhất Đông Dương, xóa sổ hoàn toàn kế hoạch Nava.'
  },
  {
    id: 'diag_q_26',
    question_number: 26,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Địa lý tự nhiên Việt Nam & Gió mùa (Địa lý)',
    bloom: 3,
    content: 'Gió mùa Đông Bắc hoạt động ở miền Bắc nước ta trong khoảng thời gian nào và gây ra thời tiết điển hình gì vào nửa sau mùa đông?',
    options: [
      'Từ tháng 11 đến tháng 4 năm sau; thời tiết lạnh ẩm, mưa phùn',
      'Từ tháng 5 đến tháng 10; thời tiết nóng ẩm mưa nhiều',
      'Từ tháng 9 đến tháng 12; thời tiết khô hanh, rét buốt kéo dài',
      'Quanh năm; thời tiết dịu mát không mưa'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 25,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Vào nửa sau mùa đông, khối khí lạnh di chuyển lệch đông qua biển mang theo nhiều hơi ẩm gây nên hiện tượng thời tiết lạnh ẩm, mưa phùn ở Bắc Bộ và Bắc Trung Bộ.'
  },
  {
    id: 'diag_q_27',
    question_number: 27,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Lịch sử Việt Nam cận đại & Phong trào Cần Vương (Lịch sử)',
    bloom: 3,
    content: 'Phong trào Cần Vương (1885 - 1896) bùng nổ sau sự kiện lịch sử nào dưới sự lãnh đạo danh nghĩa của vị vua nào?',
    options: [
      'Cuộc phản công tại kinh thành Huế; vua Hàm Nghi',
      'Hiệp ước Patenôtre; vua Tự Đức',
      'Chiến thắng Cầu Giấy; vua Đồng Khánh',
      'Khởi nghĩa Yên Thế; vua Duy Tân'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 20,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Tháng 7/1885, sau cuộc phản công thất bại ở kinh thành Huế, Tôn Thất Thuyết đưa vua Hàm Nghi lên căn cứ Tân Sở (Quảng Trị) và ban Chiếu Cần Vương.'
  },
  {
    id: 'diag_q_28',
    question_number: 28,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Chuyển dịch cơ cấu ngành kinh tế (Địa lý)',
    bloom: 4,
    content: 'Xu hướng chuyển dịch cơ cấu ngành kinh tế của nước ta trong thời kỳ đổi mới và công nghiệp hóa - hiện đại hóa là:',
    options: [
      'Giảm tỉ trọng Nông - Lâm - Ngư nghiệp, tăng tỉ trọng Công nghiệp - Xây dựng và Dịch vụ',
      'Tăng tỉ trọng Nông nghiệp, giảm mạnh Công nghiệp',
      'Giữ nguyên tỉ trọng Nông nghiệp và tập trung hoàn toàn vào Dịch vụ',
      'Tăng tỉ trọng khu vực kinh tế Nhà nước, xóa bỏ kinh tế tư nhân'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 22,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Đường lối công nghiệp hóa hiện đại hóa định hướng giảm tỉ trọng khu vực I (Nông - Lâm - Thủy sản), tăng tỉ trọng khu vực II (Công nghiệp - Xây dựng) và khu vực III (Dịch vụ).'
  },
  {
    id: 'diag_q_29',
    question_number: 29,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Hiệp định Paris 1973 & Ý nghĩa lịch sử (Lịch sử)',
    bloom: 4,
    content: 'Thắng lợi quân sự nào của quân dân ta đã buộc chính quyền Mỹ phải ký kết Hiệp định Paris ngày 27/01/1973 chấm dứt chiến tranh ở Việt Nam?',
    options: [
      'Trận "Điện Biên Phủ trên không" 12 ngày đêm cuối năm 1972',
      'Chiến dịch Đường 9 - Nam Lào 1971',
      'Cuộc Tổng tiến công và nổi dậy Tết Mậu Thân 1968',
      'Chiến dịch Tây Nguyên 1975'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 24,
    speedCategory: 'fast',
    isFlagged: false,
    explanation: 'Thất bại nặng nề trong cuộc tập kích chiến lược đường không B-52 vào Hà Nội, Hải Phòng cuối năm 1972 ("Điện Biên Phủ trên không") đã buộc Mỹ ký Hiệp định Paris.'
  },
  {
    id: 'diag_q_30',
    question_number: 30,
    domain_id: 'dom_soc_sci',
    domain_name: 'Khoa học Xã hội (Sử - Địa)',
    skill_name: 'Địa lý kinh tế vùng Đông Nam Bộ (Địa lý)',
    bloom: 4,
    content: 'Vùng kinh tế trọng điểm phía Nam (với hạt nhân là vùng Đông Nam Bộ) có thế mạnh nổi trội nào sau đây?',
    options: [
      'Thu hút vốn đầu tư FDI lớn nhất, cơ cấu kinh tế năng động và công nghiệp công nghệ cao',
      'Diện tích đất phù sa màu mỡ lớn nhất để trồng lúa nước xuất khẩu',
      'Tiềm năng thủy điện bậc thang lớn nhất cả nước',
      'Tập trung trữ lượng than đá và khoáng sản kim loại lớn nhất'
    ],
    studentChoice: 'A',
    correctChoice: 'A',
    isCorrect: true,
    timeSpent: 28,
    speedCategory: 'normal',
    isFlagged: false,
    explanation: 'Đông Nam Bộ là đầu tàu kinh tế cả nước, thu hút FDI đứng đầu, có hệ sinh thái khu công nghiệp hiện đại, cơ sở hạ tầng giao thông kết nối hoàn chỉnh.'
  }
];

/**
 * Sinh đối tượng kết quả chẩn đoán hoàn chỉnh
 * @param {number|null} customTheta - Chỉ số IRT theta mong muốn (mặc định +0.85)
 */
export function getFallbackDiagnosticResult(customTheta = null) {
  const theta = customTheta != null ? Number(customTheta) : 0.85;
  const placementClass = theta >= 0.5 ? 'BREAKTHROUGH' : theta >= -0.5 ? 'ACCELERATION' : 'FOUNDATION';
  const totalCorrect = 24;
  const totalQuestions = 30;

  const domainScores = [
    { domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', total_questions: 6, correct_count: 5, accuracy_pct: 83 },
    { domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', total_questions: 6, correct_count: 5, accuracy_pct: 83 },
    { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', total_questions: 6, correct_count: 6, accuracy_pct: 100 },
    { domain_id: 'dom_nat_sci', domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', total_questions: 6, correct_count: 3, accuracy_pct: 50 },
    { domain_id: 'dom_soc_sci', domain_name: 'Khoa học Xã hội (Sử - Địa)', total_questions: 6, correct_count: 5, accuracy_pct: 83 }
  ];

  const radarChart = [
    { domain_id: 'dom_math', domain_name: 'Toán & Số liệu', student_pct: 83, benchmark_pct: 85 },
    { domain_id: 'dom_logic', domain_name: 'Tư duy Logic', student_pct: 83, benchmark_pct: 80 },
    { domain_id: 'dom_lang', domain_name: 'Ngôn ngữ', student_pct: 100, benchmark_pct: 75 },
    { domain_id: 'dom_nat_sci', domain_name: 'KHTN', student_pct: 50, benchmark_pct: 75 },
    { domain_id: 'dom_soc_sci', domain_name: 'KHXH', student_pct: 83, benchmark_pct: 70 }
  ];

  const aiCommentary = `Dựa trên kết quả bài khảo sát 30 câu (24/30 đúng - 80%), năng lực trắc lượng học IRT của bạn ước đạt theta = ${theta > 0 ? '+' : ''}${theta.toFixed(2)}, xếp vào nhóm ${placementClass === 'BREAKTHROUGH' ? 'Lớp Bứt Phá (Mục tiêu 900+)' : placementClass === 'ACCELERATION' ? 'Lớp Tăng Tốc (750-900)' : 'Lớp Nền Tảng'}.
  
Điểm mạnh xuất sắc của bạn thể hiện ở phân môn "Sử dụng Ngôn ngữ & Văn học" (100%) và "Tư duy Logic & Suy luận" (83%). Lĩnh vực bạn cần tập trung bổ trợ là "Khoa học Tự nhiên" (50%), đặc biệt là các câu hỏi vận dụng hiện tượng vật lý và sinh thái học. Lộ trình học thích ứng (DAG) đã được tinh chỉnh tự động để giúp bạn bứt phá 900+ ĐHQG-HCM!`;

  return {
    submission_id: 'sub_diag_vact_benchmark',
    theta_0: theta,
    placement_class: placementClass,
    campus_name: 'Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)',
    domain_scores: domainScores,
    radar_chart: radarChart,
    ai_commentary: aiCommentary,
    reviewedQuestions: SAMPLE_30_QUESTIONS,
    pacing: {
      totalCorrect,
      totalQuestions,
      totalTimeSpent: 1845, // ~30.7 phút
      avgTimePerQ: 61,
      fastCount: 10,
      normalCount: 16,
      slowCount: 4,
      flaggedCount: 3
    }
  };
}

/**
 * Sinh danh sách lịch sử các lần thi khởi điểm
 */
export function getDefaultExamHistory() {
  const fallbackResult = getFallbackDiagnosticResult(0.85);

  return [
    {
      id: 'sub_attempt_003',
      examId: 'diag_30_vact',
      examTitle: 'Bài Khảo Sát Năng Lực Đầu Vào 30 Câu V-ACT 2026 (Lần 2)',
      completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 giờ trước
      totalCorrect: 24,
      totalQuestions: 30,
      accuracy: 80,
      theta: 0.85,
      placementClass: 'BREAKTHROUGH',
      timeSpentSeconds: 1845,
      resultData: fallbackResult
    },
    {
      id: 'sub_attempt_002',
      examId: 'logic_15_quick',
      examTitle: 'Đề Kiểm Tra Nhanh Tư Duy Logic & Phân Tích Biểu Đồ',
      completedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 ngày trước
      totalCorrect: 12,
      totalQuestions: 15,
      accuracy: 80,
      theta: 0.65,
      placementClass: 'BREAKTHROUGH',
      timeSpentSeconds: 980,
      resultData: {
        ...fallbackResult,
        submission_id: 'sub_attempt_002',
        theta_0: 0.65,
        pacing: {
          totalCorrect: 12,
          totalQuestions: 15,
          totalTimeSpent: 980,
          avgTimePerQ: 65,
          fastCount: 4,
          normalCount: 9,
          slowCount: 2,
          flaggedCount: 1
        }
      }
    },
    {
      id: 'sub_attempt_001',
      examId: 'diag_30_vact',
      examTitle: 'Bài Khảo Sát Năng Lực Đầu Vào 30 Câu V-ACT 2026 (Lần 1)',
      completedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 ngày trước
      totalCorrect: 19,
      totalQuestions: 30,
      accuracy: 63,
      theta: 0.35,
      placementClass: 'ACCELERATION',
      timeSpentSeconds: 2420,
      resultData: {
        ...fallbackResult,
        submission_id: 'sub_attempt_001',
        theta_0: 0.35,
        placement_class: 'ACCELERATION',
        pacing: {
          totalCorrect: 19,
          totalQuestions: 30,
          totalTimeSpent: 2420,
          avgTimePerQ: 80,
          fastCount: 5,
          normalCount: 17,
          slowCount: 8,
          flaggedCount: 5
        }
      }
    }
  ];
}
