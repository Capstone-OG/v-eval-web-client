# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [06/11/2026] - Phân Chia Cổng Giao Diện 5 Vai Trò, Đồng Bộ Template Màu Sắc Chuẩn Trang Chủ (`#FDFBF7`), Kiểm Tra Đa Tầng Email Đăng Ký (DNS MX), Liên Kết Phụ Huynh - Học Sinh 3 Phương Thức & Đấu Nối 100% Dữ Liệu Thực Từ Backend API

- **Triển Khai Hệ Thống Liên Kết Phụ Huynh - Học Sinh 3 Phương Thức Trực Tiếp Trên Web ([`StudentParentLinkCard.jsx`](./src/components/dashboard/StudentParentLinkCard.jsx), [`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`userService.js`](./src/services/userService.js), [`App.jsx`](./src/App.jsx))**:
  - **Cổng Học Viên (`StudentParentLinkCard.jsx`)**:
    - Cung cấp **Mã học sinh cố định (`VE-XXXXXX`)**, **Mã PIN 6 số động (30 phút)**, **Đường liên kết mời 1-Click** và **Mã QR trực quan** ngay trên Dashboard Học sinh.
    - Hiển thị banner thông báo nổi bật khi có Phụ huynh gửi yêu cầu liên kết kèm nút **`✓ Chấp Nhận Liên Kết`** / **`Từ chối`** trực tiếp trên Web.
  - **Cổng Phụ Huynh Đồng Hành (`ParentDashboardView.jsx`)**:
    - Tích hợp **Trung Tâm Liên Kết Tài Khoản Học Sinh** với 3 Tab: (1) Nhập Mã Code `VE-XXXXXX` / Mã PIN 6 số / Dán đường liên kết mời; (2) Tìm theo Email hoặc SĐT của con để gửi yêu cầu xác nhận 2 chiều; (3) Hướng dẫn quét Mã QR từ màn hình của con.
    - Tự động nhận diện tham số `?parentLinkCode=...` trên URL khi Phụ huynh bấm đường liên kết mời hoặc quét QR để kết nối tức thì.
    - Xóa bỏ hoàn toàn chuỗi văn bản mẫu `'Phạm Minh Hoàng'`, hiển thị 100% danh sách học sinh thật từ cơ sở dữ liệu.
- **Triển Khai Kiểm Tra Tính Hợp Lệ Đa Tầng & Bản Ghi DNS MX Cho Email Đăng Ký ([`emailValidator.js`](./src/utils/emailValidator.js), [`RegisterForm.jsx`](./src/components/auth/RegisterForm.jsx), [`WebLoginPage.jsx`](./src/components/auth/WebLoginPage.jsx), [`ForgotPasswordModal.jsx`](./src/components/auth/ForgotPasswordModal.jsx), [`authService.js`](./src/services/authService.js), [`App.jsx`](./src/App.jsx))**:
  - Đấu nối chuẩn xác `onOpenLogin`, `onOpenRegister`, `onOpenDashboard`, `onOpenDiagnostic`, `onOpenArchModal` từ `App.jsx` xuống `PublicLandingPage.jsx`.
  - Xây dựng bộ kiểm tra email đa tầng `emailValidator.js` kết hợp gọi `GET /api/auth/validate-email` và đối soát bản ghi DNS `MX`.
- **Loại Bỏ 100% Chế Độ Demo / Hardcode / Mock Fallback & Phân Chia 5 Cổng Vai Trò Độc Lập (`student`, `parent`, `teacher`, `manager`, `admin`)**:
  - Xóa bỏ toàn bộ nút 1-Click Demo Login, thanh chuyển role thủ công, các hàm dữ liệu giả `buildSeed*`, `mockData.js` và thư mục `tests/`.
  - `npm run build` hoàn thành sạch sẽ 100% (`3008 modules transformed`, **0 Error**).
