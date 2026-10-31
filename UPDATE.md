# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [31/10/2026] - Triển Khai Phân Hệ Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic (`SubmissionHistoryView`)

- **Xây Dựng Phân Hệ Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Cá Nhân (`src/components/diagnostic/SubmissionHistoryView.jsx`)**:
  - Hiển thị danh sách toàn bộ các bài khảo sát ĐGNL (30 câu), phiếu luyện tập thích ứng ZPD và bài kiểm tra chuyên đề đã hoàn thành kèm bộ lọc theo loại bài và 4 thẻ thống kê tổng quan.
  - Cho phép học sinh bấm vào bất kỳ bài thi cũ nào để mở **Bảng Đáp Án Chi Tiết** (lọc Tất cả / Đúng / Sai, xem lời giải gốc) và bấm **"💡 Hỏi Gia Sư AI Socratic Về Câu Này"** (stream phân tích tại chỗ) hoặc **"Chat Socratic Chuyên Sâu"** (mở modal chat chuyên sâu).
  - Tích hợp tab **Sổ Tay Câu Làm Sai (Mistake Notebook)** tự động tổng hợp tất cả các câu học sinh làm sai qua các lần thi để ôn tập lại cùng Gia sư AI.
- **Móc Nối API Lịch Sử Làm Bài & Đồng Bộ Lưu Trữ Đa Luồng (`src/services/practiceService.js`, `DiagnosticAssessmentPage.jsx`, `AdaptiveQuizModal.jsx`, `CurriculumExplorerView.jsx`)**:
  - Bổ sung `getStudentDiagnosticHistory`, `getDiagnosticSubmissionById`, `getMistakeNotebook` kết nối Backend Practice Service qua Gateway và bộ đồng bộ lịch sử `saveSubmissionToHistory` / `getSubmissionHistory`.
  - Tự động lưu lịch sử ngay khi nộp bài ở cả 3 luồng: Khảo sát 30 câu, Luyện tập ZPD và Kiểm tra Chuyên đề; bổ sung danh sách **Lịch Sử Làm Bài Gần Đây** ngay tại màn hình Setup của trang Khảo thí (`DiagnosticAssessmentPage.jsx`) và mục **Lịch sử làm bài** trên thanh điều hướng `Sidebar.jsx` & `App.jsx`.
- **Kiểm Thử Đóng Gói & Unit Test**:
  - Chạy `npm test` (3/3 pass) và `npm run build` (`vite build`, 0 error) thành công 100%.
