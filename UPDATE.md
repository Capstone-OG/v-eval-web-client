# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [06/10/2026] - Đấu Nối 100% API Thực Tế Cho Luồng Đăng Nhập, Đăng Ký, Đăng Xuất & Khôi Phục Phiên Đăng Nhập

- **Loại Bỏ Hoàn Toàn Mock Data Giả Lập & Pre-fill Trong Phân Hệ Xác Thực (`src/components/auth/`)**:
  - Tích hợp `authService.login()`, `authService.register()`, `authService.verifyOtp()`, `authService.forgotPassword()`, `authService.resetPassword()` trực tiếp vào `WebLoginPage.jsx` và `AuthModal.jsx`.
  - Đặt lại trạng thái ô Email & Password ban đầu về chuỗi rỗng `''` (xoá hoàn toàn pre-fill giả `minhhoang.vnu@gmail.com` và `••••••••`).
  - Thay thế toàn bộ mã giả `setTimeout` và JWT token hardcode bằng các lời gọi HTTP thực tế qua API Gateway (`http://localhost:5212`).
  - Xử lý mã lỗi `Auth.AccountNotActivated` (403/Forbidden) tự động mở modal nhập mã OTP 6 số kích hoạt tài khoản.
- **Hoàn Thiện Luồng Đăng Xuất & Khôi Phục Phiên Làm Việc (Session Restoration)**:
  - Tích hợp `authService.logout()` thu hồi Refresh Token trên backend và xóa thông tin xác thực tại `localStorage`.
  - Lắng nghe sự kiện mount trang trong `App.jsx` khôi phục tự động vai trò (`activeRole`) và thông tin người dùng (`currentUser`) khi người dùng bấm F5 reload trang.
  - Truyền prop `currentUser` vào `Navbar.jsx` hiển thị Họ tên & Email thực tế.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - Chạy kiểm thử thành công `npx vite build` trong 1.40s (0 error, 0 warning).
