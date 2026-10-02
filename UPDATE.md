# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [02/10/2026] - Ra Mắt Trang Khảo Sát Năng Lực 30 Câu Thật Với AI & Tích Hợp Render Công Thức Toán Học KaTeX

- **Phát Triển Trang Khảo Sát Năng Lực 30 Câu Chuẩn Hóa V-ACT (`DiagnosticAssessmentPage.jsx`)**:
  - Khởi tạo trang làm bài thi thực chiến [`src/components/diagnostic/DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx):
    - Cho phép thí sinh chọn sinh đề mới 100% bằng **Google Gemini AI** hoặc lấy từ **Calibrated Question Bank** (&lt;500ms).
    - Bộ câu hỏi 30 câu bao phủ trọn vẹn 5 lĩnh vực (Toán học, Logic, Ngôn ngữ, KHTN, KHXH).
    - Đồng hồ đếm ngược 45 phút, bảng điều hướng 30 ô câu hỏi, gắn cờ phân vân 🚩.
    - Tích hợp khung **Gia sư AI Socratic RAG** gợi ý hướng giải tư duy từng bước ngay khi đang làm bài mà không làm lộ đáp án.
    - Báo cáo kết quả chuẩn Psychometrics: Ước lượng năng lực IRT 2PL `\theta_0`, phân lớp học viên (`FOUNDATION`, `ACCELERATION`, `BREAKTHROUGH`), vẽ **Recharts Radar Chart 5 trục năng lực** so sánh với chuẩn 900+, và lời nhận xét sư phạm Socratic AI Commentary từ Gemini.
  - Tích hợp tab **"Khảo Sát 30 Câu AI (Core Flow 1)"** vào thanh điều hướng chính của [`App.jsx`](./src/App.jsx).
- **Tích Hợp Trình Render Công Thức Toán Học KaTeX Toàn Diện (`MathText.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet chuẩn `katex/dist/katex.min.css`.
  - Xây dựng component dùng chung [`src/components/common/MathText.jsx`](./src/components/common/MathText.jsx) với thuật toán tự động nhận diện và bao bọc công thức toán học (`normalizeMathString`):
    - Tự động bọc và hiển thị sắc nét các khoảng giá trị toán học: `(-\infty; +\infty)`, `[0; +\infty)`, `[-1; 1]`.
    - Phân tích và render các cấu trúc LaTeX phức tạp: phân số `\frac{...}{...}`, căn thức `\sqrt{...}`, số mũ đa thức `y = x^4 + 2x^2`, `y = x^3 + 3x - 1`, đạo hàm `f'(x) = 3x^2 - 6x`.
    - Phân biệt chính xác giữa công thức toán học và câu văn tiếng Việt có dấu, tuyệt đối không gây lỗi font hay vỡ giao diện.
    - Áp dụng đồng bộ cho nội dung câu hỏi, 4 phương án A/B/C/D, và lời giải gia sư AI Socratic Tutor.
- **Móc Nối 14+ API AI Engine Qua Gateway YARP (`http://localhost:5212`)**:
  - Nâng cấp toàn diện [`src/services/aiService.js`](./src/services/aiService.js): Bóc tách OCR đề thi PDF, nạp SGK 250MB, sinh đề thi AI Bloom, phân tích chẩn đoán IRT/BKT, và chat SSE Token Streaming.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - Chạy `npm run build` thành công 100% (0 lỗi cú pháp, toàn bộ font chữ KaTeX woff/woff2/ttf được đóng gói hoàn chỉnh).
