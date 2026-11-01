# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [01/11/2026] - Triển Khai Toàn Diện Frontend Core Flow 5 (Learning Analytics, Teacher 2D Class Heatmap, Parent Readiness Portal & Campus Comparative Heatmap)

- **Chuẩn Hóa Tầng Dịch Vụ API Client Core Flow 5 ([`practiceService.js`](./src/services/practiceService.js), [`practiceService.flow5.test.js`](./tests/practiceService.flow5.test.js))**:
  - Đồng bộ toàn bộ đường dẫn gọi `Practice Service` qua API Gateway sang chuẩn `/api/practice/...`.
  - Bổ sung trọn bộ 5 phương thức API Core Flow 5 (`getStudentDashboard`, `getClassHeatmap`, `forceAggregateClassHeatmap`, `getParentDashboard`, `getCampusComparativeHeatmap`) kèm chuẩn hóa GUID (`FLOW5_DEFAULTS`) và dữ liệu dự phòng đúng chuẩn DTO ASP.NET Core.
- **Trung Tâm Phân Tích Học Tập Học Sinh ([`LearningAnalyticsView.jsx`](./src/components/dashboard/LearningAnalyticsView.jsx), [`MetricsGrid.jsx`](./src/components/dashboard/MetricsGrid.jsx), [`HeroBanner.jsx`](./src/components/dashboard/HeroBanner.jsx), [`RadarChartModal.jsx`](./src/components/modals/RadarChartModal.jsx), [`App.jsx`](./src/App.jsx))**:
  - Đấu nối trực tiếp `GET /api/practice/analytics/student/{studentId}/dashboard`, hỗ trợ trạng thái Ghost Onboarding (`needsOnboarding`), biểu đồ Dual Radar 4 miền năng lực, chuỗi 7 ngày chuyên cần kèm khiên bảo vệ Streak Freeze, tiến độ DAG và lịch sử đề thi thử ĐGNL.
- **Ma Trận Nhiệt Lớp Học 2D Cho Giáo Viên & Nhóm Bàn Vi Mô 1-Click ([`TeacherDashboardView.jsx`](./src/components/dashboard/TeacherDashboardView.jsx))**:
  - Đấu nối `GET /api/practice/classes/{classId}/heatmap` và nút **Cập nhật tức thì (`POST .../force-aggregate`)**, bộ lọc Domain/Mastery/Risk, cảnh báo đỏ `CRITICAL_RED`, nhãn phân hóa 2 cực `isBimodal` và nút 1-Click mở `ClassMicroGroupsModal` chia bàn 3–5 học sinh & phát phiếu bài tập thích ứng.
- **Kiểm Thử & Xác Thực**:
  - `npm test` (5/5 tests pass) và `npm run build` (`vite build`) thành công 100%.
