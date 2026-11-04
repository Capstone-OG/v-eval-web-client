# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [04/11/2026] - Nâng Cấp Giao Diện Fintech Hiện Đại Cho Modal OTP & Hoàn Thiện Luồng Quên Mật Khẩu (UC 05 / UC 06)

- **Nâng Cấp Giao Diện Nhập Mã OTP Chuẩn Fintech Cao Cấp (`ForgotPasswordModal.jsx`)**:
  - **Lưới 6 ô vuông nhập số độc lập (6-Digit PIN Grid)**: Thay thế ô nhập đơn điệu bằng 6 ô vuông bo tròn hiện đại (`w-12 h-14`), cỡ chữ số lớn nổi bật (`text-2xl font-black`), viền xanh neon và hiệu ứng phóng to vi mô (`scale-102`) khi nhập.
  - **Tương tác bàn phím & dán mã thông minh (Smart Paste & Key Navigation)**: Tự động nhảy con trỏ sang ô tiếp theo khi nhập số, lùi ô khi nhấn Backspace, điều hướng phím mũi tên trái/phải, và tự động bóc tách 6 chữ số khi dán (`Ctrl + V`) mã OTP từ email.
  - **Đồng hồ đếm ngược & Nút gửi lại mã (Resend Countdown Timer)**: Tích hợp đếm ngược 60 giây và nút `Gửi lại mã OTP` có hiệu ứng icon xoay tròn `RefreshCw`.
  - **Huy hiệu thông tin email tinh tế**: Hiển thị chip email người nhận `✉️ thaithinh03456@gmail.com` trang nhã thay vì khối cảnh báo xanh cồng kềnh.
  - **Thanh chỉ báo tiến trình 3 bước (Step Progress Indicator)**: Trực quan hóa tiến trình thực hiện: `[1. Email] ── [2. Mã OTP] ── [3. Mật khẩu mới]`.

- **Hoàn Thiện Bước 3 (Thiết Lập Mật Khẩu Mới)**:
  - Bổ sung nút bật/tắt ẩn hiện mật khẩu (`Eye` / `EyeOff`) cho cả 2 ô `Mật khẩu mới` và `Xác nhận mật khẩu`.
  - Bảng đối soát chính sách bảo mật thời gian thực (Real-time Checklist) với 4 tích xanh: Tối thiểu 8 ký tự, Chữ in hoa (A-Z), Chữ thường (a-z), Chữ số (0-9) và trạng thái trùng khớp mật khẩu.

- **Kiểm Tra Email Tồn Tại Khi Quên Mật Khẩu & Bóc Tách Lỗi Tường Minh**:
  - Tinh chỉnh `apiClient.js` tự động bóc tách `data.error.description` triệt tiêu lỗi `Error: [object Object]`.
  - Nếu email không tồn tại trong hệ thống (HTTP 404): Báo lỗi chuẩn xác *"Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại."* và giữ nguyên ở Bước 1.

- **Kiểm Thử & Đóng Gói (Build & Test)**:
  - Kiểm thử `npm test`: **6/6 tests PASS 100%**.
  - `npm run build` hoàn thành trong 1.12s, 0 lỗi cú pháp.
