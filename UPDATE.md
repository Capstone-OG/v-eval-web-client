# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [07/11/2026] - Triển Khai Toàn Diện Core Flow 6 Trên Frontend: Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI, Cảnh Báo Sớm BR-04 & Sổ Tay Lỗi Sai SM-2

- **Tầng Dịch Vụ API Client Core Flow 6 ([`apiClient.js`](./src/services/apiClient.js), [`practiceService.js`](./src/services/practiceService.js), [`practiceService.flow6.test.js`](./tests/practiceService.flow6.test.js))**:
  - Bổ sung `apiClient.patch`, trích xuất thông báo lỗi từ cấu trúc `Result<T>` và đấu nối trọn bộ 13 API Core Flow 6 qua YARP Gateway (`:5212`) kèm unit test (`8/8 tests pass`).
- **Giao Diện Dự Báo Điểm SEM 95%, Toa Thuốc Knapsack ROI & Modal Luyện Tập Biến Thể ([`ScorePredictionPanel.jsx`](./src/components/dashboard/ScorePredictionPanel.jsx), [`PrescriptionPracticeModal.jsx`](./src/components/modals/PrescriptionPracticeModal.jsx), [`LearningAnalyticsView.jsx`](./src/components/dashboard/LearningAnalyticsView.jsx), [`App.jsx`](./src/App.jsx))**:
  - Trực quan hóa dải điểm tin cậy 95% SEM (`[Min, Max]` trên thang 1200), bảng cân đối thiếu hụt mục tiêu (`ON_TRACK` / `AT_RISK` / `CRITICAL`), nút tái tính toán dự báo SEM và danh sách Toa thuốc bù điểm tối ưu `ROI = ΔScore / Số giờ ôn`.
  - Xây dựng modal làm 3-5 câu hỏi đồng cấu render KaTeX, tự động gạch nợ dạng bài khi đạt độ chính xác `>= 67%`, cập nhật `P(L_t)` và tích hợp hỏi Gia sư AI Socratic sau khi nộp bài.
