# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [06/11/2026] - Hợp Nhất Nhánh `ThinhTT/feature-curriculum-studio-formula-editor` Vào `develop`, Khắc Phục Triệt Để Lỗi Nuốt Exception SSE & Tự Động Điền Lời Dẫn Sư Phạm

- **Hợp Nhất Tự Động Nhánh `ThinhTT/feature-curriculum-studio-formula-editor` Vào `develop` ([`App.jsx`](./src/App.jsx), [`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`Sidebar.jsx`](./src/components/layout/Sidebar.jsx), [`modals/index.js`](./src/components/modals/index.js))**:
  - Hợp nhất toàn diện phân hệ **Curriculum Studio & Word-Style Formula Editor (JSXGraph 2D/3D, Bảng Biến Thiên Vector `2N-1`, AI Sinh Câu Hỏi)**, **Thanh toán học phí PayOS VietQR (`TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`, `paymentService.js`)**, và **Xác thực OTP 6 chữ số chuẩn Fintech (`ForgotPasswordModal.jsx`, `WebLoginPage.jsx`)** cùng với **Gia sư AI Socratic (Core Flow 4)** và **Trung tâm Phân tích Học tập Đa tác nhân & Ma trận Nhiệt (Core Flow 5)** trên nhánh `develop`.
  - Tại `ParentDashboardView.jsx`: Kết hợp trọn vẹn dữ liệu Cổng Phụ Huynh Đồng Hành Core Flow 5 (`R_exam` 3 trụ cột, tiến độ kỷ luật 12h/tuần, cảnh báo AI) với Banner đóng học phí nhanh qua VietQR PayOS và `PayOsCheckoutModal`.
  - Tại `Sidebar.jsx`, `App.jsx` và `src/components/modals/index.js`: Giữ đầy đủ cả `AISocraticTutorModal` lẫn `PayOsCheckoutModal`, tab `Lịch sử & Sổ tay lỗi sai` (`history`) và tab `Học phí & Gói học` (`tuition`).
- **Khắc Phục Lỗi Nuốt Exception Trong Trình Đọc Stream SSE ([`practiceService.js`](./src/services/practiceService.js))**:
  - Tách bạch hoàn toàn khối `try...catch` của `JSON.parse` khỏi logic xử lý nghiệp vụ: Khi nhận sự kiện lỗi từ máy chủ (`parsed.error`), lập tức kích hoạt `onError(new Error(parsed.error))` và ném lỗi ra ngoài thay vì bị khối `catch` con nuốt mất.
  - Xử lý các dòng dữ liệu raw không phải JSON một cách mượt mà và an toàn.
- **Triệt Tiêu Hoàn Toàn Hiện Tượng Treo Dấu Ba Chấm `...` Vĩnh Viễn ([`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx))**:
  - Tại sự kiện hoàn tất luồng stream `onComplete`: Nếu nội dung phản hồi `finalAnswer` hoặc tin nhắn cuối của AI bị rỗng, hệ thống tự động điền thông điệp gợi mở sư phạm thân thiện: *"Chào em! Thầy đang lắng nghe thắc mắc của em. Em hãy chia sẻ cụ thể hơn về bài tập hoặc hướng suy luận em muốn thầy gợi mở nhé!"* thay vì hiển thị ba dấu chấm `...`.
  - Tại sự kiện lỗi `onError`: Nếu gặp mã lỗi 429, ngoài việc hiển thị banner cảnh báo hạn mức, hệ thống đồng thời cập nhật bong bóng tin nhắn giải thích rõ ràng lý do hạn mức gọi câu hỏi để học sinh nắm bắt.
- **Kiểm Thử & Đóng Gói**:
  - `npm test` đạt **9/9 tests PASS (100%)** (`paymentService.test.js`, `practiceService.flow5.test.js`, `tokenStorage.test.js`).
  - `npm run build` hoàn thành sạch sẽ 100% (`3017 modules transformed`, **0 Error**).
