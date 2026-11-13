# UPDATE

## [13/11/2026] - Tối Giản Bố Cục Trang Tổng Quan Hài Hòa, Nâng Cấp Ảnh Học Sinh & Khắc Phục Lỗi Lịch Sử Làm Bài

- **Tái cấu trúc bố cục trang Tổng quan theo thứ tự thị giác chuẩn mực ([`App.jsx`](./src/App.jsx))**:
  - Đưa `HeroBanner` lên vị trí đầu trang làm điểm nhấn chào đón học viên và truyền cảm hứng chủ đạo.
  - Đặt `MetricsGrid` 4 chỉ số KPI ngay phía dưới banner, giúp học sinh nắm bắt toàn diện dữ liệu học tập (Điểm dự báo 1200, Streak chuyên cần, Tiến độ lộ trình, Trọng tâm cần ôn tập).
  - Bố trí khối hành động kép (`DiagnosticOnboardingCard` 70% + `StudentParentLinkCard` 30%) ở phía chân trang, tạo điểm kết cân đối, hài hòa trước footer, loại bỏ tình trạng trang bị cụt đột ngột.
- **Nâng cấp thẻ ảnh học sinh & Bỏ khối chặng học giả lập ([`HeroBanner.jsx`](./src/components/dashboard/HeroBanner.jsx), [`App.jsx`](./src/App.jsx))**:
  - Gỡ bỏ hoàn toàn khối `MilestoneCard` và `LiveQnACard` giả lập không có thực.
  - Chuyển đổi ảnh học sinh sang chân dung học sinh THPT Việt Nam thực tế (`vietnamese_student_real.jpg`) bọc trong khung thẻ kính mờ bán trong suốt sang trọng.
  - Thay thế toàn bộ thuật ngữ kỹ thuật khó hiểu ("ZPD", "DAG", "Flow 5", "IRT 2PL") bằng thông điệp sư phạm trực quan, thân thiện.
- **Gia cố cơ chế tự hồi phục (Graceful Fallback) nạp lịch sử thi ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - Bọc từng lời gọi lấy chi tiết bài nộp trong `try/catch` độc lập, tự động fallback về dữ liệu tóm tắt (`theta0`, `placementClass`, điểm số) khi gặp bài thi cũ không còn câu hỏi trên Backend Content Service.
  - Xóa bỏ triệt để lỗi crash 500 hiển thị *"Không tải được lịch sử: Đã xảy ra lỗi nội bộ trên hệ thống máy chủ Practice Service"*.
- **Phân tách 2 chế độ Lộ trình học tập & Ràng buộc học phí ([`StudentCurriculumView.jsx`](./src/components/curriculum/StudentCurriculumView.jsx), [`TuitionRequiredModal.jsx`](./src/components/modals/TuitionRequiredModal.jsx))**:
  - Hỗ trợ chuyển đổi linh hoạt giữa *🏫 Lớp Học Chung* và *🎯 Lộ Trình Cá Nhân Riêng* 3 chặng thích ứng.
  - Học sinh sau khi thi chỉ được xem cấu trúc tổng quát của lộ trình; chặn mở bài học chi tiết và luyện tập củng cố khi chưa hoàn tất học phí qua PayOS VietQR.
- **Kiểm thử & Biên dịch**:
  - Toàn bộ 31/31 unit tests vượt qua 100%, `npm run lint` đạt 0 lỗi, `npm run build` thành công trong 1.05s.
