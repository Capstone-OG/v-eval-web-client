# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [07/11/2026] - Triển Khai Toàn Diện Core Flow 6 Trên Frontend: Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI, Cảnh Báo Sớm BR-04 & Sổ Tay Lỗi Sai SM-2

- **Tầng Dịch Vụ API Client Core Flow 6 ([`apiClient.js`](./src/services/apiClient.js), [`practiceService.js`](./src/services/practiceService.js), [`practiceService.flow6.test.js`](./tests/practiceService.flow6.test.js))**:
  - Bổ sung `apiClient.patch` và trích xuất thông điệp lỗi chi tiết từ cấu trúc `Result<T>` của ASP.NET Core.
  - Triển khai trọn bộ 13 API Core Flow 6 qua YARP Gateway (`:5212`): Dự báo điểm khoảng tin cậy 95% SEM & Toa thuốc bù điểm Knapsack ROI (`getMyForecast`, `getPrescriptionPracticeSession`, `submitPrescriptionPracticeSession`, `recalculatePrediction`), Cảnh báo sớm 3 tầng BR-04 (`getMyAlerts`, `markAlertAsRead`, `getEarlyWarningsDashboard`, `resolveEarlyWarningAlert`, `scheduleAlertCounseling`), và Sổ tay lỗi sai lặp lại ngắt quãng SM-2 (`getMistakeNotebook`, `getDailyMistakeReview`, `tagMistakeCognitiveError`, `submitDailyMistakeReview`).
  - Tích hợp chuẩn hóa song ngữ `snake_case` / `camelCase`, lưu trữ trạng thái fallback bền vững và unit test (`8/8 tests pass`, `vite build` sạch 100%).
