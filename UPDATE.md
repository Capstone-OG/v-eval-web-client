# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [07/11/2026] - Triển Khai Phân Hệ Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive), Tái Thiết Kế Thanh Điều Hướng Dạng Segmented Control, Nhận Diện Động Giám Đốc Học Thuật & Kiểm Tra Email Đa Tầng Cấp Phát IAM

- **Phân Hệ Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive) & Thùng Rác Lưu Trữ ([`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`userService.js`](./src/services/userService.js))**:
  - **Tách Biệt Hai Chế Độ Xem (Segmented Navigation)**:
    - Tab 1: **"Tài Khoản Đang Hoạt Động"** (badge số lượng `activeCount` xanh lá): Mặc định chỉ hiển thị tài khoản đang hoạt động, tài khoản bị vô hiệu hóa sẽ **tự động bị ẩn (hidden)** hoàn toàn khỏi danh sách chính.
    - Tab 2: **"Tài Khoản Đã Ngừng Hoạt Động (Ẩn)"** (badge số lượng `inactiveCount` đỏ): Kho lưu trữ toàn bộ các tài khoản bị vô hiệu hóa kèm banner giải thích cơ chế bảo toàn dữ liệu điểm thi và lịch sử học tập 100%.
    - Tab 3: **"Tất cả"**: Hiển thị toàn bộ danh sách khi cần tra cứu tổng thể.
  - **Modal Xác Nhận Ngừng Hoạt Động (Deactivation Modal)**:
    - Cột thao tác hiển thị nút đỏ *"Ngừng hoạt động"* (icon `UserX`). Bấm vào mở modal xác nhận với thông tin tài khoản, cảnh báo bảo toàn dữ liệu và nút *"Xác Nhận Ngừng"*.
  - **Modal Xác Nhận Khôi Phục Hoạt Động (Reactivation Modal)**:
    - Tại tab *"Đã ngừng hoạt động"*, cột thao tác hiển thị nút xanh *"Khôi phục"* (icon `RotateCcw`). Xác nhận khôi phục sẽ chuyển `isActive = true`, mở khóa đăng nhập và tài khoản lập tức quay trở lại danh sách *"Tài Khoản Đang Hoạt Động"*.
  - **Liên Kết Tương Tác Thẻ Thống Kê (Stat Cards)**: Thẻ 1 (*"Đang hoạt động"*) và Thẻ 4 (*"Đã ngừng hoạt động"*) hỗ trợ bấm trực tiếp để chuyển nhanh chế độ xem tương ứng.

- **Tái Thiết Kế Thanh Điều Hướng Subpage Chuẩn Segmented Control Hiện Đại ([`App.jsx`](./src/App.jsx))**:
  - Khắc phục hoàn toàn lỗi rớt dòng 2 hàng gây vỡ giao diện trên Cổng Quản lý Học thuật bằng thanh điều hướng dạng Segmented Control nguyên khối (`bg-slate-100/90`, bo tròn `rounded-2xl`, hỗ trợ cuộn mượt `overflow-x-auto scrollbar-none`).
  - Thẻ tab đang chọn chuyển thành dạng card nổi bật (`bg-white text-blue-700 shadow-sm font-extrabold ring-1 ring-slate-200/80`), tab không chọn đổi sang hover mềm mại (`text-slate-600 hover:text-slate-900 hover:bg-slate-200/60`).
  - Rút gọn nhãn các tab trực quan, súc tích: *"So sánh Cơ sở"*, *"Ma trận Lớp học"*, *"Khung Chương trình"*, *"Cấp phát Tài khoản"*, *"Báo cáo Chất lượng"*.

- **Nhận Diện Động Vai Trò Giám Đốc Học Thuật Toàn Trường ([`App.jsx`](./src/App.jsx))**:
  - Tự động nhận diện vai trò `ACADEMIC_DIRECTOR` trong `currentUser.roles`, nâng cấp tiêu đề cổng thành *"Cổng Giám Đốc Học Thuật Toàn Trường"* đi kèm biểu tượng vương miện hoàng gia `Crown` và huy hiệu nổi bật `ACADEMIC DIRECTOR PORTAL`.

- **Tích Hợp Bộ Kiểm Tra Email Đa Tầng Vào Modal Cấp Phát Tài Khoản ([`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`emailValidator.js`](./src/utils/emailValidator.js))**:
  - Bổ sung phát hiện lỗi gõ nhầm tên miền `mail.com` thành `gmail.com` trong `COMMON_DOMAIN_TYPOS`.
  - Kết nối hàm kiểm tra `validateEmailComprehensive` trực tiếp vào ô nhập email với cơ chế kiểm tra thời gian thực khi rời ô (`onBlur`) và trước khi gửi form (`handleSubmitProvision`).
  - Tích hợp giao diện phản hồi trạng thái: vòng xoay spinner khi đang tra cứu DNS MX, dấu tích xanh khi hợp lệ, và hộp cảnh báo màu đỏ/vàng kèm nút 1-Click *"Sửa thành: ...@gmail.com"*.

- **Kiểm Thử & Biên Dịch**:
  - `npm run build` hoàn thành sạch sẽ 100% (`3008 modules transformed`, 0 Error).
