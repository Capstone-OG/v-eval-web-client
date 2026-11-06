# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [06/11/2026] - Khắc Phục Triệt Để Lỗi Nuốt Exception SSE, Tự Động Điền Lời Dẫn Sư Phạm Khi Nội Dung Rỗng & Cảnh Báo Rate Limit Thân Thiện

- **Khắc Phục Lỗi Nuốt Exception Trong Trình Đọc Stream SSE ([`practiceService.js`](./src/services/practiceService.js))**:
  - Tách bạch hoàn toàn khối `try...catch` của `JSON.parse` khỏi logic xử lý nghiệp vụ: Khi nhận sự kiện lỗi từ máy chủ (`parsed.error`), lập tức kích hoạt `onError(new Error(parsed.error))` và ném lỗi ra ngoài thay vì bị khối `catch` con nuốt mất.
  - Xử lý các dòng dữ liệu raw không phải JSON một cách mượt mà và an toàn.
- **Triệt Tiêu Hoàn Toàn Hiện Tượng Treo Dấu Ba Chấm `...` Vĩnh Viễn ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx))**:
  - Tại sự kiện hoàn tất luồng stream `onComplete`: Nếu nội dung phản hồi `finalAnswer` hoặc tin nhắn cuối của AI bị rỗng, hệ thống tự động điền thông điệp gợi mở sư phạm thân thiện: *"Chào em! Thầy đang lắng nghe thắc mắc của em. Em hãy chia sẻ cụ thể hơn về bài tập hoặc hướng suy luận em muốn thầy gợi mở nhé!"* thay vì hiển thị ba dấu chấm `...`.
  - Tại sự kiện lỗi `onError`: Nếu gặp mã lỗi 429, ngoài việc hiển thị banner cảnh báo hạn mức, hệ thống đồng thời cập nhật bong bóng tin nhắn giải thích rõ ràng lý do hạn mức gọi câu hỏi để học sinh nắm bắt.
- **Kiểm Thử & Đóng Gói**:
  - `npm run build` hoàn thành sạch sẽ 100% không có lỗi.
