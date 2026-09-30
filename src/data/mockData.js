export const mockUser = {
  id: "STU-88902",
  name: "Minh Hoàng",
  email: "minhhoang.vnu@gmail.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  grade: "Lớp 12 - Chuyên Lý",
  campusId: "campus-1",
  campusName: "Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)",
  targetScore: 850,
  currentScore: 785,
  scoreRange: "810 - 870",
  targetMajor: "Khoa học Máy tính - ĐH Bách Khoa ĐHQG TP.HCM",
  targetMajorBenchmark: 850,
  admissionProb: 82,
  daysLeft: 44,
  streakDays: 12,
  roadmapProgress: 65,
  masteredSkillsCount: 18,
  totalSkillsCount: 28,
  weakSkillsCount: 2,
  classLevel: "Lớp Bứt Phá (Theta > +0.5)",
  assignedTeacher: "Thầy Phạm Duy"
};

export const campusesList = [
  { id: "campus-1", name: "Cơ sở 1: ĐHQG TP.HCM (Thủ Đức)" },
  { id: "campus-2", name: "Cơ sở 2: Quận 5 (227 Nguyễn Văn Cừ)" },
  { id: "campus-3", name: "Cơ sở 3: Bình Thạnh (Điện Biên Phủ)" }
];

export const mockMilestone = {
  currentMilestoneIndex: 3,
  totalMilestones: 8,
  title: "Tối ưu hoá Tư duy Logic & Ngôn ngữ",
  estimatedTime: "4.5h",
  progressPercent: 65,
  tasks: [
    {
      id: "task-1",
      type: "video",
      title: "Video: Phương pháp suy luận logic phủ định",
      meta: "Bài giảng 24 phút • Thầy Phạm Duy",
      status: "completed",
      badge: "Đã xem"
    },
    {
      id: "task-2",
      type: "quiz",
      title: "Quiz ZPD thích ứng: Suy luận quy nạp & bảng dữ liệu",
      meta: "Tiến trình 8/10 câu • Độ khó thích ứng IRT b: -0.20",
      status: "in_progress",
      badge: "Đang làm (8/10)",
      progressText: "(8/10)"
    },
    {
      id: "task-3",
      type: "mocktest",
      title: "Mini-mock test: Đề luyện tốc độ Ngôn ngữ Tiếng Việt",
      meta: "20 câu trắc nghiệm • 25 phút tiêu chuẩn",
      status: "pending",
      badge: "Chưa làm"
    }
  ],
  nextMilestoneTitle: "Kỹ thuật giải nhanh Đọc hiểu & Phân tích số liệu biểu đồ"
};

export const mockLiveSession = {
  id: "live-2001",
  title: "Chữa đề thi mẫu: Kỹ thuật xử lý bẫy Logic & Bảng ma trận",
  time: "TRỰC TIẾP TỐI NAY • 20:00",
  duration: "60p",
  teacherName: "Thầy Phạm Duy",
  teacherTitle: "Chuyên gia khảo thí Tư duy Logic ĐGNL",
  teacherAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  registeredCount: 142,
  description: "Giải đáp trực tiếp phương pháp loại trừ phương án nhiễu trong đề ĐGNL ĐHQG-HCM.",
  link: "#"
};

export const mockWeakSkills = [
  {
    id: "SKILL-LOGIC-04",
    name: "Toán logic mệnh đề & suy luận kéo theo",
    domain: "Toán & Tư duy Logic",
    masteryProb: 0.42,
    targetProb: 0.85,
    status: "critical",
    suggestedAction: "Luyện 5 câu ZPD b: -0.1"
  },
  {
    id: "SKILL-DATA-02",
    name: "Phân tích số liệu bảng ma trận & biểu đồ tròn",
    domain: "Phân tích số liệu",
    masteryProb: 0.48,
    targetProb: 0.85,
    status: "warning",
    suggestedAction: "Xem lại video chữa đề 15p"
  }
];

export const mockRadarData = [
  { subject: 'Tiếng Việt', score: 85, fullMark: 100 },
  { subject: 'Tiếng Anh', score: 78, fullMark: 100 },
  { subject: 'Toán học', score: 70, fullMark: 100 },
  { subject: 'Tư duy Logic', score: 62, fullMark: 100 },
  { subject: 'Phân tích số liệu', score: 65, fullMark: 100 },
  { subject: 'Khoa học Tự nhiên', score: 80, fullMark: 100 },
  { subject: 'Khoa học Xã hội', score: 88, fullMark: 100 },
];

export const mockTeacherHeatmap = [
  { studentId: "S1", name: "Nguyễn Minh Hoàng", logicProb: 0.42, dataProb: 0.48, langProb: 0.88, mathProb: 0.76, scienceProb: 0.82, riskLevel: "Cần chú ý" },
  { studentId: "S2", name: "Lê Thị Thu Thảo", logicProb: 0.78, dataProb: 0.82, langProb: 0.91, mathProb: 0.85, scienceProb: 0.89, riskLevel: "An toàn" },
  { studentId: "S3", name: "Trần Anh Dũng", logicProb: 0.35, dataProb: 0.40, langProb: 0.62, mathProb: 0.50, scienceProb: 0.55, riskLevel: "Nguy cơ cao" },
  { studentId: "S4", name: "Phạm Hải Yến", logicProb: 0.65, dataProb: 0.70, langProb: 0.80, mathProb: 0.72, scienceProb: 0.78, riskLevel: "An toàn" },
  { studentId: "S5", name: "Vũ Hoàng Long", logicProb: 0.45, dataProb: 0.52, langProb: 0.75, mathProb: 0.68, scienceProb: 0.70, riskLevel: "Cần chú ý" },
];

export const mockAiInitialMessage = {
  sender: "ai",
  text: "Xin chào Minh Hoàng! Thầy xem qua lịch sử học tập nhận thấy em vừa gặp khó khăn ở câu 8 phần Logic quy nạp (Độ khó IRT b = 0.45). Thầy không đưa đáp án ngay mà sẽ đặt câu hỏi gợi mở theo phương pháp Socratic để em tự tìm ra manh mối nhé! Em có muốn bắt đầu không?",
  timestamp: "10:42 AM",
  sourceConfidence: 0.94,
  retrievedChunk: "Giáo trình ĐGNL ĐHQG-HCM - Chuyên đề 4: Quy tắc phủ định mệnh đề kéo theo (Trang 84)"
};

export const sampleQuestionsForDiagnostic = [
  {
    id: 1,
    domain: "Ngôn ngữ - Tiếng Việt",
    skill: "Phân tích tác phẩm & Phong cách ngôn ngữ",
    question: "Chọn từ/cụm từ thích hợp nhất để điền vào chỗ trống trong câu sau: 'Nhà thơ đã sử dụng nghệ thuật ... để làm nổi bật vẻ đẹp kiên cường của người lính.'",
    options: ["A. Ẩn dụ chuyển đổi cảm giác", "B. Tương phản đối lập", "C. Nhân hóa và đòn bẩy", "D. Liệt kê tăng tiến"],
    correctOption: 1,
    difficulty: -0.2
  },
  {
    id: 2,
    domain: "Toán học & Logic",
    skill: "Toán logic mệnh đề kéo theo",
    question: "Cho phát biểu: 'Nếu trời mưa thì đường trượt'. Phát biểu nào sau đây tương đương về mặt logic?",
    options: ["A. Nếu đường không trượt thì trời không mưa", "B. Nếu đường trượt thì trời mưa", "C. Nếu trời không mưa thì đường không trượt", "D. Đường trượt khi và chỉ khi trời mưa"],
    correctOption: 0,
    difficulty: 0.1
  },
  {
    id: 3,
    domain: "Phân tích số liệu",
    skill: "Đọc biểu đồ & bảng biểu",
    question: "Một công ty có doanh thu tăng 20% trong năm 2024 và giảm 10% trong năm 2025. So với năm 2023, doanh thu năm 2025 tăng hay giảm bao nhiêu phần trăm?",
    options: ["A. Tăng 10%", "B. Tăng 8%", "C. Tăng 12%", "D. Giảm 2%"],
    correctOption: 1,
    difficulty: 0.3
  }
];

export const architectureAnswers = {
  question1: {
    title: "1. Cơ chế Chống Gian lận (Proctoring & Risk Mitigation)",
    context: "Phạm vi bài thi chẩn đoán & thi thử quyết định theta_0 và dải điểm gửi phụ huynh/giáo viên.",
    solution: [
      "Chiến lược triển khai 15 tuần: Tách biệt thành 2 tầng - (Tầng 1) Kỹ thuật nhẹ trong phạm vi web/app; (Tầng 2) Mô hình quy trình quản trị rủi ro sư phạm.",
      "Kỹ thuật áp dụng trong Web/App:",
      "• Single-Device Session Lock: Sử dụng WebSocket / Redis Session Token để hủy ngay lập tức phiên đăng nhập cũ nếu phát hiện tài khoản đăng nhập trên thiết bị thứ 2 khi đang làm bài thi thử.",
      "• Browser Focus & Tab Switch Detection: Sử dụng Page Visibility API (`visibilitychange` / `blur`) để ghi nhận số lần chuyển tab hoặc mở ứng dụng khác. Nếu vượt quá 3 lần, hệ thống tự động cảnh báo & tính cờ nghi vấn.",
      "• Time-bound Pattern Detection (Phát hiện trả lời siêu tốc bất thường): Nếu câu hỏi vận dụng cao (IRT difficulty b > 0.8) được chọn đúng trong dưới 3 giây, hệ thống không cộng điểm theta cao mà đánh dấu 'Fast Guess' để thuật toán BKT hạ bớt P(G).",
      "• Ngân hàng đề xáo trộn mã câu hỏi (Item Randomization & Shuffler): Mỗi học sinh nhận một mã đề hoán vị ngẫu nhiên cả thứ tự câu lẫn thứ tự 4 đáp án A/B/C/D.",
      "Tuyên bố phạm vi đồ án: Đánh dấu rõ trong báo cáo đây là 'Cơ chế giám sát môi trường thi trực tuyến cơ bản (Lightweight Online Proctoring)', không cài phần mềm can thiệp sâu hệ điều hành để đảm bảo thời gian 15 tuần."
    ]
  },
  question2: {
    title: "2. Tối ưu Luồng Real-time ZPD & BKT (Real-time Latency Optimization)",
    context: "Mỗi đáp án nộp kích hoạt 4 tác vụ: (1) BKT P(Lt), (2) Quét DAG mở chặng, (3) Đếm sai liên tiếp cho Remedial Node, (4) Lọc ngân hàng câu hỏi ZPD.",
    solution: [
      "Kiến trúc khuyến nghị: Tách biệt Đồng bộ (Synchronous Path) và Bất đồng bộ (Asynchronous Event-Driven Pipeline).",
      "Luồng Đồng bộ (Trả kết quả trong < 150ms):",
      "• (Step 1) Cập nhật nhanh P(Lt) cho 1 skill_id (công thức BKT thuần túy tốn < 1ms CPU).",
      "• (Step 2) Truy vấn nhanh 1 câu ZPD tiếp theo từ Redis Cache (Pre-computed ZPD Queue per student).",
      "• Trả ngay HTTP Response 200 kèm câu hỏi tiếp theo cho Học sinh.",
      "Luồng Bất đồng bộ (Async Event Pipeline via Redis Streams / RabbitMQ / Celery):",
      "• Phát Event `StudentAnswerSubmitted` vào Event Bus.",
      "• Consumer 1: Quét DAG Skill Prerequisites kiểm tra điều kiện BR-01 (Mở khóa chặng mới nếu P(Lt) >= 0.85 & đúng 2 câu b >= 0.50).",
      "• Consumer 2: Đếm sê-ri câu sai liên tiếp (BR-03), nếu >= 3 câu sai -> Tự động chèn Remedial Node vào DB.",
      "• Consumer 3: Ghi nhận log chi tiết vào CSDL Lịch sử (StudentAnswerLogs) để Background Analytics Worker dựng Class Heatmap."
    ]
  },
  question3: {
    title: "3. Đảm bảo Tính Nhất quán RAG Vector DB Qdrant (Atomic RAG Updates & BR-05)",
    context: "Khi giáo viên cập nhật bài giải mới, tránh lỗi tồn tại đồng thời 2 phiên bản làm AI trả lời sai bản mới.",
    solution: [
      "Chiến lược cập nhật Nguyên tử (Atomic Update Strategy):",
      "• Versioning & Soft Delete per Skill: Mỗi chunk dữ liệu lưu trong Qdrant mang metadata `{ skill_id: 'SKILL-01', version: 2, is_active: true, created_at: 1740000000 }`.",
      "• Upsert Transaction Pattern: Khi Giáo viên publish giáo trình mới cho `skill_id`: (1) Chèn các chunk mới với `version = N+1, is_active = false`; (2) Gọi lệnh Payload Update cập nhật hàng loạt chunk `version <= N` thành `is_active = false`; (3) Cập nhật chunk mới thành `is_active = true`.",
      "• Lọc theo Payload Constraint trong Query Qdrant: Trong request search Qdrant, luôn đính kèm Filter: `must: [{ key: 'is_active', match: { value: true } }]`.",
      "Bổ sung quy tắc BR-05:",
      "• Ngoài việc Cosine Similarity >= 0.78, RAG pipeline bắt buộc phải áp Filter `is_active == true` và ưu tiên chunk có `version` lớn nhất. Nhờ vậy triệt tiêu 100% tình trạng AI gợi ý theo tài liệu cũ!"
    ]
  }
};
