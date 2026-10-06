# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [06/10/2026] - Hợp Nhất Giao Diện Xác Thực (TNhan UI/UX) Với Tầng API IAM (ThinhTT), Cấp Quyền Đa Vai Trò & Tích Hợp Discord CI Tracker

- **Hợp Nhất Toàn Diện Hệ Thống Xác Thực (Auth Subsystem)**:
  - Tiếp nhận và nâng cấp toàn bộ giao diện Auth hiện đại từ nhánh `TNhan`:
    + Split-screen layout 12 cột với ảnh sinh viên thật `vietnamese_student_real.jpg`, thanh ticker tin tức hoạt động thời gian thực (`liveActivities`), và hiệu ứng động mượt mà bằng Framer Motion.
    + Module hóa form đăng nhập (`LoginForm.jsx`), form đăng ký (`RegisterForm.jsx`), modal quên mật khẩu 4 bước OTP (`ForgotPasswordModal.jsx`) và popup modal nhanh (`AuthModal.jsx`).
    + Tích hợp Custom Rounded Select bo góc cao cấp cho lựa chọn Khối Lớp (12, 11, Thí sinh tự do) và Mục tiêu điểm ĐGNL (900+, 800+, 700+).
    + Hiển thị thông báo lỗi trực tiếp từng trường nhập liệu (`fieldErrors`), thanh đo độ mạnh mật khẩu 3 cấp độ (`passStrength`).
  - Đấu nối 100% logic API và Tầng dịch vụ IAM từ nhánh `ThinhTT`:
    + Thay thế toàn bộ mã giả lập `setTimeout` bằng các hàm gọi API thật qua `authService.js` (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify-account`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
    + Tích hợp nạp động danh sách Cơ sở Đào tạo (`GET /api/v1/campuses`) vào dropdown bo tròn trong `RegisterForm.jsx`.
    + Bắt mã lỗi tài khoản chưa kích hoạt (`Auth.AccountNotActivated`) để tự động mở bước xác thực mã OTP 6 số.
    + Bảo toàn 1-Click Demo Login cho 4 vai trò (Học sinh, Giáo viên, Quản lý cơ sở, Phụ huynh) với cơ chế fallback offline an toàn.
- **Bảo Toàn 100% Các Tính Năng Độc Quyền Của Nhánh ThinhTT**:
  - Trang Quản trị Cấp phát Tài khoản IAM (`src/components/admin/AccountProvisioningView.jsx`).
  - Bảng điều khiển Quản lý Học thuật Cơ sở (`src/components/dashboard/CampusManagerDashboardView.jsx`).
  - Bảng điều khiển Phụ huynh (`src/components/dashboard/ParentDashboardView.jsx`).
  - Tầng dịch vụ quản lý User và cấp phát tài khoản (`src/services/userService.js`).
  - Bộ định tuyến trung tâm và quản trị trạng thái phiên làm việc (`src/App.jsx`).
- **Sửa Lỗi Thiếu Thông Báo Discord & Thiết Lập CI/CD GitHub Actions Cho Web Client**:
  - Phát hiện nguyên nhân Web Client trước đó không gửi thông báo về Discord: Repo thiếu hoàn toàn thư mục cấu hình `.github/workflows`.
  - Thiết lập `.github/workflows/discord-commit-tracker.yml`: Tự động bắt sự kiện `push` trên mọi nhánh, bóc tách commit SHA, danh sách file thay đổi kèm emoji chỉ thị, đọc nội dung `UPDATE.md` và gửi tin nhắn embed thời gian thực về webhook Discord hệ thống.
  - Thiết lập `.github/workflows/ci.yml`: Tự động kiểm thử `npm ci` và biên dịch `npm run build` trên Node.js 20.x cho mỗi commit/PR.
- **Kiểm Thử Vận Hành & Build Verification**:
  - Chạy `npm run build` thành công 100% trong 679ms (0 error, 0 warning).
  - Xác nhận 2903 modules Vite được đóng gói hoàn hảo.
