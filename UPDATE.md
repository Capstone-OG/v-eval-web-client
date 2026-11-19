# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Tối Ưu Toàn Diện Hero Banner Cổng Phụ Huynh (Phương Án 1 - Grid 3 Cột) & Thanh Điều Hướng "EdTech Mission Control"

- **Tái Cấu Trúc Toàn Diện Hero Header Cổng Phụ Huynh ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - **Triệt tiêu 100% hardcode**: Toàn bộ thông tin học sinh (`child.studentName`, `child.school`, `child.grade`, `child.targetMajor`) được lấy từ CSDL Backend thông qua `portalData.children[selectedChildIdx]`.
  - **Triệt tiêu hiện tượng rớt dòng & hộp khối lổn nhổn**: Xóa bỏ các nhãn kỹ thuật thừa thãi và 3 viên nang bubble lộn xộn.
  - **Hồ sơ học sinh trang nhã (Top Row)**: Bổ sung avatar ký tự con (`childInitials` - ví dụ `PL`), chấm xanh live trực quan, tiêu đề nổi bật và nhãn ĐGNL ĐHQG-HCM tinh gọn.
  - **Dải thông tin 3 cột cân đối (Bottom Strip)**: Chuyển toàn bộ bối cảnh trường lớp thành dải card 3 cột thẳng hàng:
    - Cột 1: `Trường THPT` (`child.school`) với icon `GraduationCap` màu cyan.
    - Cột 2: `Khóa Học & Lớp Học` (`child.grade`) với icon `BookOpen` màu amber, văn bản dài tự động thu gọn `truncate` kèm tooltip đầy đủ.
    - Cột 3: `Nguyện Vọng Mục Tiêu NV1` (`child.targetMajor`) với icon `Target` màu emerald.
  - **Hài hòa hóa nút hành động**: Chuyển nút `+ Liên kết con` từ màu vàng chói sang phong cách kính mờ cao cấp (`bg-white/10 hover:bg-white/20 border border-white/20`), hài hòa tuyệt đối với giao diện.
- **Tối Ưu Bố Cục Top Navbar Theo Concept "EdTech Mission Control" ([`AccountNavbar.jsx`](./src/components/layout/AccountNavbar.jsx))**:
  - **Khắc phục triệt để lỗi ép cụt chữ (Zero Title Truncation)**: Loại bỏ chuỗi khóa học 54 ký tự chèn ép tiêu đề; cố định tiêu đề `Tổng quan Đồng hành` hiển thị sắc nét, thoáng đãng không bị co cụt (`whitespace-nowrap shrink-0`).
  - **Viên Nang Đếm Ngược 1 Dòng Kính Mờ (Center Pill)**: Chuyển đổi khối hộp 2 dòng cồng kềnh sang viên nang thanh mảnh 1 dòng (`● ĐGNL Đợt 1 (2027) • Còn 129 ngày (28/03/2027)`), nằm chính giữa thanh điều hướng tạo khoảng thở rộng rãi; click mở Modal chi tiết 2 đợt thi và cấu trúc 120 câu / 150 phút.
  - **Tối Ưu Cụm Hành Động & Phân Nhánh Quyền (Right Actions)**: Chuyển chip học sinh đồng hành sang góc phải nhỏ gọn (`👦 Con: [Tên con]`), ẩn bớt ngày tháng thứ yếu, tinh chỉnh chuông cảnh báo tương tác Flow 6 và căn chỉnh chấm xanh online chuẩn xác.
- **Kiểm Thử & Biên Dịch Toàn Bộ Web Client**:
  - `npm run build`: Thành công 100% trong 1.08s, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Đạt **22/22 tests passed**.
