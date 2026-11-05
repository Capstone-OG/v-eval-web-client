# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [05/11/2026] - Khắc Phục Triệt Để Trạng Thái Bắt Thi Lại Chẩn Đoán, Thay Thế AI Widget Bằng Floating FAB Nhỏ Gọn & Tối Ưu Stream Socratic Tutor

- **Loại Bỏ Hoàn Toàn Trạng Thái Bắt Thi Lại Khảo Sát Chẩn Đoán ([`MilestoneCard.jsx`](./src/components/dashboard/MilestoneCard.jsx))**:
  - Tách bạch điều kiện kiểm tra `checkExamHistory`: Chỉ cần `!studentDashboard.needsOnboarding` hoặc có bài làm trong `recentMockExams`, hệ thống xác nhận học sinh đã hoàn thành chẩn đoán đầu vào kể cả khi điểm số ước lượng ban đầu đang ở mức 0.
  - Khi chưa có lộ trình được lưu, hệ thống tự động gọi hàm `autoGenRoadmap` với `diagnosticSubmissionId` sẵn có từ bài khảo sát gần nhất thay vì chuyển giao diện sang thẻ nhắc thi lại.
  - Tuyệt đối không bật trạng thái `hasNoRoadmap = true` cho học sinh đã có lịch sử làm bài, mở khóa trực tiếp Chặng 01 và danh sách nhiệm vụ ôn luyện trọng tâm.
- **Tối Giản Giao Diện Dashboard: Thay Thế Khối Chat Cồng Kềnh Bằng Icon Nổi Góc Phải ([`App.jsx`](./src/App.jsx))**:
  - Loại bỏ hoàn toàn khối widget AI Tutor cồng kềnh nằm trong lưới nội dung trang Dashboard.
  - Tích hợp nút Floating Action Button (FAB) nhỏ gọn, hiện đại ở góc phải phía dưới màn hình với huy hiệu online màu xanh và hiệu ứng viền phát sáng, mở modal Socratic Tutor toàn màn hình khi nhấp chuột.
- **Chống Treo Ba Dấu Chấm & Xử Lý Độc Lập Lời Thoại ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`practiceService.js`](./src/services/practiceService.js))**:
  - Đảm bảo giải phóng `isTyping = false` và hủy controller trong callback `onError`, bảo đảm khung chat không bao giờ bị kẹt ở trạng thái ba dấu chấm `...` khi mạng gián đoạn.
  - Không truyền nhầm phương án chọn giả lập khi học sinh gửi lời chào hỏi hoặc câu hỏi mở.
- **Kiểm Thử & Đóng Gói**:
  - `npm run build` hoàn thành sạch sẽ trong 905ms (3.013 modules transformed, 0 lỗi).
