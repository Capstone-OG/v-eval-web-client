# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [07/11/2026] - Tái Thiết Kế Thanh Điều Hướng Dạng Segmented Control, Nhận Diện Động Giám Đốc Học Thuật (Academic Director) & Tích Hợp Kiểm Tra Email Đa Tầng Cho Cấp Phát Tài Khoản

- **Tái Thiết Kế Thanh Điều Hướng Subpage Chuẩn Segmented Control Hiện Đại ([`App.jsx`](./src/App.jsx))**:
  - Khắc phục hoàn toàn lỗi rớt dòng 2 hàng gây vỡ giao diện trên Cổng Quản lý Học thuật bằng thanh điều hướng dạng Segmented Control nguyên khối (`bg-slate-100/90`, bo tròn `rounded-2xl`, hỗ trợ cuộn mượt `overflow-x-auto scrollbar-none`).
  - Thẻ tab đang chọn chuyển thành dạng card nổi bật (`bg-white text-blue-700 shadow-sm font-extrabold ring-1 ring-slate-200/80`), tab không chọn đổi sang hover mềm mại (`text-slate-600 hover:text-slate-900 hover:bg-slate-200/60`).
  - Rút gọn nhãn các tab trực quan, súc tích: *"So sánh Cơ sở"*, *"Ma trận Lớp học"*, *"Khung Chương trình"*, *"Cấp phát Tài khoản"*, *"Báo cáo Chất lượng"*.
- **Nhận Diện Động Vai Trò Giám Đốc Học Thuật Toàn Trường ([`App.jsx`](./src/App.jsx))**:
  - Bổ sung logic kiểm tra vai trò `ACADEMIC_DIRECTOR` trong thông tin tài khoản người dùng (`currentUser.roles`).
  - Khi là Giám đốc học thuật, tự động nâng cấp tiêu đề cổng thành *"Cổng Giám Đốc Học Thuật Toàn Trường"* đi kèm biểu tượng vương miện hoàng gia `Crown` và huy hiệu nổi bật `ACADEMIC DIRECTOR PORTAL`.
- **Tích Hợp Bộ Kiểm Tra Email Đa Tầng Vào Modal Cấp Phát Tài Khoản ([`AccountProvisioningView.jsx`](./src/components/admin/AccountProvisioningView.jsx), [`emailValidator.js`](./src/utils/emailValidator.js))**:
  - Bổ sung phát hiện lỗi gõ nhầm tên miền `mail.com` thành `gmail.com` trong `COMMON_DOMAIN_TYPOS`.
  - Kết nối hàm kiểm tra `validateEmailComprehensive` trực tiếp vào ô nhập email với cơ chế kiểm tra thời gian thực khi rời ô (`onBlur`) và trước khi gửi form (`handleSubmitProvision`).
  - Tích hợp giao diện phản hồi trạng thái: vòng xoay spinner khi đang tra cứu DNS MX, dấu tích xanh khi hợp lệ, và hộp cảnh báo màu đỏ/vàng kèm nút 1-Click *"Sửa thành: ...@gmail.com"* khi phát hiện gõ nhầm tên miền.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build` hoàn thành sạch sẽ 100% (`3008 modules transformed`, 0 Error, 0 Warning nghiêm trọng).
