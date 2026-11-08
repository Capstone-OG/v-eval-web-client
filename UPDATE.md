# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [08/11/2026] - Chuẩn Hóa Ngôn Ngữ Học Tập Thân Thiện Cho Học Sinh Trên Trang Kết Quả, Dự Báo Điểm, Sổ Tay Câu Sai & Gia Sư AI

- **Trung Tâm Kết Quả Học Tập & Dự Báo Điểm Thi ([`LearningAnalyticsView.jsx`](./src/components/dashboard/LearningAnalyticsView.jsx), [`ScorePredictionPanel.jsx`](./src/components/dashboard/ScorePredictionPanel.jsx), [`PrescriptionPracticeModal.jsx`](./src/components/modals/PrescriptionPracticeModal.jsx))**:
  - Loại bỏ toàn bộ nhãn thuật toán/kỹ thuật nội bộ (`Core Flow 5 & 6`, `Live Gateway API (:5212)`, nút debug `Xem Thử Ghost Onboarding`, `IRT 2PL`, `Theta`, `SEM 95%`, `Greedy Knapsack ROI`, `AUTO_INIT`, `PAT_SKILL_*`, `Isomorphic Variants`), thay bằng ngôn ngữ ôn luyện tự nhiên, dễ hiểu cho học sinh (**Khoảng điểm dự kiến**, **Chủ đề cần ôn ngay để tăng điểm nhanh**, **Thói quen tự học 7 ngày qua**, **Lịch sử làm bài gần đây**).
- **Nhắc Nhở Học Tập, Sổ Tay Câu Sai, Sidebar & Gia Sư AI Đồng Hành ([`StudentEarlyWarningsCard.jsx`](./src/components/dashboard/StudentEarlyWarningsCard.jsx), [`MistakeNotebookSM2View.jsx`](./src/components/dashboard/MistakeNotebookSM2View.jsx), [`NotificationBellPopover.jsx`](./src/components/layout/NotificationBellPopover.jsx), [`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`AdaptiveQuizModal.jsx`](./src/components/modals/AdaptiveQuizModal.jsx), [`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`App.jsx`](./src/App.jsx))**:
  - Đổi toàn bộ nhãn `Gia sư AI Socratic` / `AI Socratic Tutor` sang **Gia sư AI** / **Gia sư AI Đồng Hành**; ẩn các mã nội bộ (`Flow 1..6`, `BR-04`, `SM-2`, `EaseFactor`, `BKT P(Lt)`) trên Sidebar, Chuông thông báo, Hộp thư nhắc nhở và Sổ tay câu làm sai.
- **Kiểm Thử & Đóng Gói**:
  - `npm test` đạt `8/8 tests pass` (`3 suites`), `oxlint` đạt `0 errors` trên các file chỉnh sửa và `npm run build` hoàn tất sạch 100%.
