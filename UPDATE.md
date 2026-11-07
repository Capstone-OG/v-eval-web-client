# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [07/11/2026] - Mở Rộng Không Gian Làm Việc Toàn Màn Hình (`w-full`), Tinh Chỉnh Giao Diện Bảng Tài Khoản IAM 1 Dòng Không Cuộn Ngang & Hoàn Thiện Phân Hệ Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive)

- **Mở Rộng Không Gian Làm Việc Cổng Vai Trò Toàn Chiều Ngang (`w-full`) Sát Sidebar ([`App.jsx`](./src/App.jsx), [`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`CampusManagerDashboardView.jsx`](./src/components/dashboard/CampusManagerDashboardView.jsx), [`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx), [`TuitionPaymentView.jsx`](./src/components/payment/TuitionPaymentView.jsx))**:
  - Thay thế giới hạn `max-w-7xl mx-auto` bằng `w-full` kèm `px-4 sm:px-6` đồng bộ thẳng hàng với `Navbar` và `Sidebar`.
  - Xóa bỏ hoàn toàn khoảng trống thừa hai bên cạnh `Sidebar`, giải phóng 100% chiều ngang màn hình giúp bảng danh sách tài khoản hiển thị trọn vẹn 6 cột mà không cần thanh cuộn ngang.

- **Tái Thiết Kế Bảng Quản Trị Tài Khoản IAM Sắc Nét Trên 1 Dòng & Nâng Cấp `apiClient.js` ([`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`apiClient.js`](./src/services/apiClient.js))**:
  - **Hỗ Trợ Query Params (`options.params`) & `PATCH` Trong `apiClient.js`**: Bổ sung tuần tự hóa `URLSearchParams` cho `options.params` và phương thức `apiClient.patch()`, đảm bảo tham số lọc `isActive=true/false` được gửi chính xác xuống Backend để ẩn hoàn toàn tài khoản đã khóa khỏi danh sách đang hoạt động.
  - **Thanh Công Cụ Hợp Nhất (Unified Command Toolbar)**: Gộp bộ chuyển đổi trạng thái (*"Đang hoạt động"*, *"Đã ngừng hoạt động (Ẩn)"*, *"Tất cả"*), ô tìm kiếm và hàng nút lọc vai trò vào một khung điều khiển đồng nhất.
  - **Chống Rớt Dòng Tuyệt Đối (`whitespace-nowrap`)**: Chuẩn hóa toàn bộ huy hiệu Vai trò, huy hiệu Trạng thái và nút thao tác (*"Ngừng hoạt động"* / *"Khôi phục"*) nằm gọn trên 1 dòng duy nhất, kết hợp avatar chữ cái viết tắt 2 ký tự theo màu vai trò và nhãn đơn vị/chuyên môn thông minh.

- **Phân Hệ Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive) & Kiểm Tra Email Đa Tầng ([`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`userService.js`](./src/services/userService.js), [`emailValidator.js`](./src/utils/emailValidator.js))**:
  - Tách biệt 2 chế độ xem *"Tài Khoản Đang Hoạt Động"* và *"Tài Khoản Đã Ngừng Hoạt Động (Ẩn)"* kèm Modal xác nhận Ngừng hoạt động / Khôi phục bảo toàn 100% dữ liệu học tập.
  - Tích hợp thanh điều hướng Subpage chuẩn Segmented Control hiện đại, nhận diện động Cổng Giám Đốc Học Thuật (`ACADEMIC_DIRECTOR`) và kiểm tra email đa tầng DNS MX kèm gợi ý sửa lỗi tên miền 1-Click (`@mail.com` -> `@gmail.com`).

- **Kiểm Thử & Biên Dịch**:
  - `npm run build` hoàn thành sạch sẽ 100% (`3008 modules transformed`, 0 Error).
