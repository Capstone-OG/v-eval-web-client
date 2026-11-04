# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [04/11/2026] - Tối Ưu Hóa Số Liệu Dashboard, Tự Động Kích Hoạt Lộ Trình DAG & Chuyển Đổi Gia Sư AI Sang Icon Góc Phải Nhỏ Gọn

- **Nút Nổi FAB Gia Sư AI Socratic Góc Phải ([`App.jsx`](./src/App.jsx))**:
  - Gỡ bỏ hoàn toàn `AISocraticTutorWidget` cồng kềnh chiếm không gian trong lưới Dashboard, giải phóng không gian để tập trung 100% vào các chỉ số phân tích và tiến độ chặng học.
  - Thiết kế nút nổi Floating Action Button (FAB) tại góc dưới bên phải (`fixed bottom-6 right-6 z-40`) với hiệu ứng aura phát sáng, chấm xanh trực tuyến 24/7 và tooltip tinh gọn. Bấm vào nút sẽ kích hoạt modal đối thoại chuyên sâu `AISocraticTutorModal`.
- **Khắc Phục Tình Trạng Bắt Thi Lại Chẩn Đoán & Tự Động Kích Hoạt Lộ Trình DAG ([`MilestoneCard.jsx`](./src/components/dashboard/MilestoneCard.jsx), [`practiceService.js`](./src/services/practiceService.js), [`LearningAnalyticsView.jsx`](./src/components/dashboard/LearningAnalyticsView.jsx))**:
  - Bổ sung tham số `?studentId={guid}` và header `X-User-Id` cho API `getMyRoadmap`, kết nối trơn tru với `RoadmapsController.cs` của Practice Service.
  - Nhận diện trạng thái đã hoàn thành bài khảo sát chẩn đoán để ngăn chặn tuyệt đối việc bắt học sinh làm lại bài test 30 câu.
  - Hiển thị trực tiếp chặng học DAG thực tế từ cơ sở dữ liệu (`Chặng 01 (Tổng hợp): Luyện tập chuyên đề thích ứng`) kèm các nhiệm vụ học tập trọng tâm (`Chương 01: Quan Hệ Song Song`, `Bài 2: Hai Đường Thẳng Song Song`...).
  - Ngăn ngừa tình trạng ghost onboarding trên `LearningAnalyticsView` khi tài khoản đã có dữ liệu thi thực tế.
- **Bảo Toàn Điểm Ước Tính IRT 2PL Chuẩn Xác Trên Dashboard ([`practiceService.js`](./src/services/practiceService.js))**:
  - Loại bỏ các bài thi hết hạn/hủy dở dang (`status === 'EXPIRED'`) khỏi danh sách tính điểm chính; bảo toàn điểm số thực tế từ Backend (320/1200 điểm, dải tin cậy `275 - 365`), chấm dứt triệt để hiện tượng ghi đè về `0 / 1200 điểm` và `0 - 45`.
- **Kiểm Thử & Đóng Gói Vận Hành**:
  - `npm test` đạt 6/6 tests passed (100%).
  - `npm run build` Vite hoàn thành sạch sẽ trong 1.88s.
