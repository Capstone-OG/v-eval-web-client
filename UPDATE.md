# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [02/11/2026] - Đồng Bộ Kết Quả Chẩn Đoán Thực Tế Sang Trung Tâm Phân Tích Học Tập Core Flow 5, Navbar & Sidebar

- **Đồng Bộ Kết Quả Khảo Thí Lên Backend & Bù Đắp Dữ Liệu Tức Thì ([`practiceService.js`](./src/services/practiceService.js), [`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx), [`practiceService.flow5.test.js`](./tests/practiceService.flow5.test.js))**:
  - Sửa lỗi đọc `user?.userId` sang `user?.id || user?.userId` khi nộp bài khảo sát 30 câu và tự động đồng bộ bài làm lên `POST /api/practice/diagnostic-submissions` kèm siêu dữ liệu chấm điểm từng câu hỏi (`correctOption`, `domainId`, `skillId`, `difficultyLevel`).
  - Triển khai `hydrateStudentDashboardWithLocalHistory` và `syncUnsyncedSubmissions`: Tự động tổng hợp kết quả từ lịch sử làm bài thực tế của học sinh (quy đổi điểm chuẩn V-ACT `0..1200`, `Theta_0`, biểu đồ Radar 4 miền năng lực, chuỗi tự học 7 ngày thực tế, họ tên `fullName` và danh sách đề đã hoàn thành) ngay cả khi Backend chưa khởi động lại và trả về `needsOnboarding = true`, đồng thời đẩy ngầm các bài chưa đồng bộ lên PostgreSQL.
- **Cập Nhật Số Liệu Sống Trên Giao Diện Phân Tích & Khung Điều Hướng ([`LearningAnalyticsView.jsx`](./src/components/dashboard/LearningAnalyticsView.jsx), [`App.jsx`](./src/App.jsx), [`Navbar.jsx`](./src/components/layout/Navbar.jsx), [`Sidebar.jsx`](./src/components/layout/Sidebar.jsx))**:
  - Lắng nghe sự kiện `veval:submission-updated` để làm mới tức thì Dashboard & Trung tâm Phân tích sau khi nộp hoặc xóa bài làm; tính toán nhãn thứ động cho 7 ngày gần nhất kết thúc ở `Hôm nay` và sửa nút xem trước trạng thái Onboarding hai chiều.
  - Thay thế hoàn toàn số liệu cứng trên `Navbar.jsx` (`12 Ngày`) và `Sidebar.jsx` (`Theta 0: +0.65 | 82% Trúng tuyển`) bằng chuỗi chuyên cần, `Theta 0` và tiến độ đạt mục tiêu thực tế của học sinh.
- **Kiểm Thử & Xác Thực**:
  - `npx oxlint`, `npm test` (`6/6 tests pass`) và `npm run build` (`vite build`) thành công 100%.
