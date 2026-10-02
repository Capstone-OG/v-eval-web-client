# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [02/10/2026] - Hoàn Thiện Khảo Sát 30 Câu: Tích Hợp Đề Content Service & AI Cloud, Bảng Đáp Án Chi Tiết, Phân Tích Tốc Độ Pacing & Render KaTeX

- **Hỗ Trợ Đa Nguồn Đề Thi Khảo Sát 30 Câu Chuẩn Hóa V-ACT (`DiagnosticAssessmentPage.jsx`)**:
  - **Nguồn 1 (Đề Có Sẵn - Content Service)**: Lấy trực tiếp từ Database PostgreSQL của Content Service (`GET /api/v1/content/exams/11111111-1111-1111-1111-111111111111`), tự động bóc tách các bài đọc hiểu (Passages), ngữ liệu ngữ văn và bảng đáp án chính xác.
  - **Nguồn 2 (Sinh Đề AI Cloud - Google Gemini)**: Gọi API Gemini 3.6 Flash sinh đề thi mới 100% cân bằng ma trận Bloom 6 cấp độ.
  - **Nguồn 3 (Hiệu Chuẩn AI Fast Bank)**: Trích xuất siêu tốc (<500ms) từ ngân hàng câu hỏi đã gán sẵn tham số Psychometrics.
- **Phân Tích Tốc Độ & Chiến Thuật Làm Bài (Pacing & Speed Analysis)**:
  - Thống kê thời gian trung bình từng câu (`s / câu`).
  - Phân loại 3 nhóm tốc độ phản xạ: **Làm nhanh (<25s)**, **Chuẩn nhịp độ (25-90s)**, và **Tốn nhiều thời gian (>90s)**.
  - Thống kê câu phân vân đã gắn cờ 🚩 và độ nhạy bén trực giác của thí sinh.
- **Bảng Đánh Giá Chi Tiết & Tra Cứu Đáp Án 30 Câu Hỏi (Answer Key & Review Table)**:
  - Bộ lọc thông minh: `Tất cả (30)`, `✅ Câu đúng`, `❌ Câu sai`, `🚩 Câu phân vân`.
  - Hiển thị trực quan từng câu hỏi: Lĩnh vực, Kỹ năng, Cấp độ Bloom, Badge tốc độ thời gian làm câu.
  - Đối chiếu phương án thí sinh chọn (xanh lá nếu đúng, đỏ nếu sai) với phương án đúng chính thức.
  - Hộp lời giải chi tiết (Explanation) render KaTeX toán học sắc nét.
- **Biểu Đồ Năng Lực Chuẩn Xác & Không Bịa**:
  - Dữ liệu Recharts Radar Chart 5 trục (Toán học, Logic, Ngôn ngữ, KHTN, KHXH) được tính toán trực tiếp từ kết quả 30 câu hỏi thực tế của thí sinh so với chuẩn 900+.
  - Ước lượng năng lực IRT 2PL `\theta_0` và xếp lớp đề xuất (`Lớp Bứt Phá`, `Lớp Tăng Tốc`, `Lớp Nền Tảng`).
- **Tích Hợp Trình Render Toán Học KaTeX Toàn Diện (`MathText.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet `katex/dist/katex.min.css`.
  - Hỗ trợ công thức toán học phân số, căn thức, số mũ đa thức, khoảng vô cực cho đề thi, 4 phương án A/B/C/D, gia sư AI Socratic và bảng lời giải chi tiết.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - `npm run build` thành công 100% trong 1.26s (0 lỗi cú pháp, toàn bộ assets font KaTeX woff/woff2/ttf được đóng gói chuẩn).
