# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [03/11/2026] - Triển Khai Giao Diện Thanh Toán Học Phí PayOS (VietQR) & Kích Hoạt Lộ Trình Thích Ứng PLAR

- **Triển Khai Dịch Vụ Thanh Toán (`src/services/paymentService.js`)**:
  - Tích hợp giao tiếp API Gateway (`:5212`) ➔ Practice Service (`:5261`) tại đường dẫn `/api/practice/payments`:
    - `createPaymentLink`: Tạo link thanh toán PayOS VietQR với cơ chế fallback giả lập an toàn khi chạy offline.
    - `getPaymentStatus`: Thăm dò (polling) tự động trạng thái thanh toán từ PayOS qua `orderCode`.
    - `getPaymentTransactions`: Tra cứu nhật ký kiểm toán giao dịch (Audit Logs).
  - Đăng ký và xuất khẩu đồng bộ qua `src/services/index.js`.

- **Xây Dựng Modal Thanh Toán PayOS VietQR (`src/components/modals/PayOsCheckoutModal.jsx`)**:
  - Giao diện thanh toán hiện đại chuẩn ngân hàng, hiển thị thông tin gói học, mã đơn hàng, số tiền học phí và nút chuyển hướng sang cổng thanh toán chính thức của PayOS.
  - Cơ chế tự động lắng nghe (polling mỗi 3 giây) kết quả Webhook IPN từ cổng PayOS.
  - Hiệu ứng pháo hoa (`canvas-confetti`) và màn hình chúc mừng khi thanh toán thành công, thông báo kích hoạt lộ trình thích ứng PLAR tức thì kèm nút điều hướng trực tiếp vào chặng học đầu tiên.
  - Hỗ trợ chế độ giả lập xác nhận tức thì (Instant Verify) phục vụ kiểm thử và demo.

- **Xây Dựng Màn Hình Quản Lý Học Phí & Đăng Ký Khóa Học (`src/components/payment/TuitionPaymentView.jsx`)**:
  - Giới thiệu 3 gói đào tạo chuẩn ĐGNL: Gói Cấp Tốc (Fast-Track - 8 tuần), Gói Chuẩn (Standard Adaptive - 12 tuần) và Gói Bứt Phá (Intensive Plus - 16 tuần).
  - Bảng tra cứu lịch sử giao dịch và đối soát học phí chi tiết.
  - Tích hợp trực tiếp vào Cổng Phụ Huynh (`ParentDashboardView.jsx`) với banner nhắc nộp học phí và nút hành động nhanh qua VietQR PayOS.
  - Bổ sung tab điều hướng `Học phí & Gói học` (`tuition`) trên `Sidebar.jsx` và cập nhật định tuyến trong `App.jsx`.

- **Kiểm Thử & Đóng Gói (Build & Test)**:
  - Bổ sung bài kiểm thử `tests/paymentService.test.js`: **6/6 tests PASS 100%**.
  - `npm run build` thành công trong 1.40s với 0 lỗi cú pháp.
