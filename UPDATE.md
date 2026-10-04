# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [04/10/2026] - Triển Khai Hoàn Chỉnh Trang Cấp Phát & Quản Lý Tài Khoản Đa Vai Trò (IAM Provisioning Page), Smart RBAC & Móc Nối Backend CSDL

- **Triển Khai Trang Quản Trị Cấp Phát Tài Khoản Đa Vai Trò (`AccountProvisioningView.jsx`)**:
  - Giao diện quản trị cấp cao chuẩn executive: Thống kê số lượng tài khoản theo thời gian thực (Tổng số, Giảng viên, Quản lý, Học sinh & Phụ huynh, Tỷ lệ kích hoạt).
  - Bộ lọc vai trò tức thì (Tất cả, `TEACHER`, `ACADEMIC_MANAGER`, `ACADEMIC_DIRECTOR`, `ADMINISTRATOR`, `PARENT`, `STUDENT`) và ô tìm kiếm thông minh theo Họ tên, Email, Số điện thoại.
  - Bảng dữ liệu người dùng trực quan: Avatar gradient, Huy hiệu vai trò RBAC sắc nét, Cơ sở công tác, Bộ môn chuyên môn, và Nút gạt chuyển đổi trạng thái Khóa / Mở khóa tài khoản thời gian thực gọi trực tiếp API `PATCH /api/v1/users/{id}/toggle-status`.
  - Modal **Cấp Phát Tài Khoản Mới**:
    + Card lựa chọn trực quan 6 vai trò kèm mô tả chức năng chi tiết.
    + Dropdown nạp danh sách cơ sở đào tạo thực tế từ CSDL PostgreSQL (`GET /api/v1/campuses`).
    + Form nhập thông tin cán bộ, chuyên môn phụ trách, bộ tạo mật khẩu ngẫu nhiên an toàn hoặc mật khẩu tùy chỉnh.
    + Hộp thông báo cấp tài khoản thành công kèm nút **"Sao chép thông tin bàn giao"** một chạm để gửi ngay cho cán bộ.
- **Tầng Dịch Vụ Người Dùng Mới (`src/services/userService.js`)**:
  - `getUsers(params)`: Gọi API `GET /api/v1/users` qua Gateway YARP `:5212`.
  - `provisionUser(userData)`: Gọi API `POST /api/v1/users/provision` nạp thẳng vào CSDL PostgreSQL, kích hoạt ngay không cần OTP.
  - `toggleUserStatus(userId)`: Gọi API `PATCH /api/v1/users/{id}/toggle-status`.
- **Tích Hợp Điều Hướng & Trải Nghiệm Người Dùng (`App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `CampusManagerDashboardView.jsx`)**:
  - Nút chuyển tab **"Cấp Tài Khoản (IAM)"** trên Thanh điều hướng đầu trang và Menu người dùng.
  - Nút liên kết nhanh "Quản lý IAM" trên Bảng điều khiển Quản lý cơ sở (`CampusManagerDashboardView.jsx`).
  - Nối thành công hàm cấp giảng viên nhanh trong bảng điều khiển cơ sở gọi trực tiếp API thật.
- **Kiểm Thử Vận Hành & Build Verification**:
  - `npm run build` thành công 100% trong 758ms (0 warning, 0 error).
  - Kết nối trực tiếp Gateway YARP `:5212` và CSDL Supabase PostgreSQL.
