# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Nâng Cấp Toàn Diện Giao Diện Cổng Phụ Huynh, Top Navbar "EdTech Mission Control" & Left Sidebar Tinh Giản 1 Dòng (Modern SaaS)

- **Tái Thiết Kế Thanh Điều Hướng Dọc Tinh Giản 1 Dòng - Phương Án 1 ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx))**:
  - **Triệt tiêu hoàn toàn lỗi cụt chữ (Zero Truncation)**: Loại bỏ huy hiệu `VietQR` cồng kềnh chiếm hơn 60px gây ép cụt chữ thành `Đóng Học phí & ...`; rút gọn nhãn danh mục thành `Học phí & Gói học` thanh thoát, rõ ràng trên khung rộng 288px.
  - **Bố cục 1 dòng tinh gọn (Single-Line Compact Row - ~40px)**: Chuyển các mục điều hướng từ khối hộp 2 dòng (tiêu đề + mô tả) dày cộm sang hàng ngang 1 dòng tiêu chuẩn Modern SaaS (Linear & Notion style).
  - **Biểu tượng inline tinh tế**: Sử dụng Lucide icon trực quan (`w-4.5 h-4.5`), loại bỏ các ô vuông xám xịt buồn tẻ; chuyển mô tả phụ vào tooltip tiêu chuẩn `title={item.sublabel ? `${item.label} (${item.sublabel})` : item.label}` giúp thanh điều hướng thông thoáng, không bị ngợp thị giác.
  - **Hiệu ứng kích hoạt & di chuột trang nhã**: Trạng thái Active dùng dải màu gradient hoàng gia `from-blue-600 to-indigo-600` với bóng đổ dịu nhẹ `shadow-sm shadow-blue-500/20` và phông chữ đậm nét; Hover có nền xanh dịu nhẹ `hover:bg-blue-50/60` phản hồi thị giác nhạy bén.
  - **Tối ưu thẻ chân trang học sinh liên kết (Footer Student Card)**: Hiển thị tên học sinh kèm tên trường THPT thực tế (`${firstChild.studentName} • ${firstChild.school}`) thay vì chuỗi tên chuyên đề dài 54 ký tự gây tràn chữ.
- **Tái Cấu Trúc Toàn Diện Hero Header Cổng Phụ Huynh ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - **Triệt tiêu 100% hardcode**: Toàn bộ thông tin học sinh (`child.studentName`, `child.school`, `child.grade`, `child.targetMajor`) được lấy từ CSDL Backend qua `portalData.children[selectedChildIdx]`.
  - **Hồ sơ học sinh trang nhã (Top Row)**: Bổ sung avatar ký tự con (`childInitials` - ví dụ `PL`), chấm xanh live trực quan, tiêu đề nổi bật và nhãn ĐGNL ĐHQG-HCM tinh gọn.
  - **Dải thông tin 3 cột cân đối (Bottom Strip)**: Trường THPT (`GraduationCap` cyan), Khóa học & Lớp học (`BookOpen` amber, `truncate` kèm tooltip), Nguyện vọng mục tiêu NV1 (`Target` emerald).
  - **Hài hòa hóa nút hành động**: Chuyển nút `+ Liên kết con` từ màu vàng chói sang phong cách kính mờ cao cấp (`bg-white/10 hover:bg-white/20 border border-white/20`).
- **Tối Ưu Bố Cục Top Navbar Theo Concept "EdTech Mission Control" ([`AccountNavbar.jsx`](./src/components/layout/AccountNavbar.jsx))**:
  - **Khắc phục triệt để lỗi ép cụt chữ (Zero Title Truncation)**: Cố định tiêu đề `Tổng quan Đồng hành` hiển thị sắc nét, thoáng đãng không bị co cụt (`whitespace-nowrap shrink-0`).
  - **Viên Nang Đếm Ngược 1 Dòng Kính Mờ (Center Pill)**: Viên nang thanh mảnh 1 dòng (`● ĐGNL Đợt 1 (2027) • Còn 129 ngày (28/03/2027)`), nằm chính giữa thanh điều hướng; click mở Modal chi tiết 2 đợt thi và cấu trúc 120 câu / 150 phút.
  - **Tối Ưu Cụm Hành Động & Phân Nhánh Quyền (Right Actions)**: Chuyển chip học sinh đồng hành sang góc phải nhỏ gọn (`👦 Con: [Tên con]`), ẩn bớt ngày tháng thứ yếu, tích hợp chuông cảnh báo tương tác Flow 6 và căn chỉnh chấm xanh online chuẩn xác.
- **Kiểm Thử & Biên Dịch Toàn Bộ Web Client**:
  - `npm run build`: Thành công 100% trong 1.06s, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Đạt **22/22 tests passed**.
