# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [31/10/2026] - Tối Giản Bảng STEM (Search Đầu Trang, Không Icon/GDPT 2018, Gỡ Bỏ Dropdown Header & Chèn Chuẩn Xác Tại Con Trỏ)

- **Tối Giản Hóa Toàn Diện Bảng Slide-Over STEM Drawer (`CurriculumStudioEditor.jsx`)**:
  - *Gỡ Bỏ Hoàn Toàn Dropdown STEM Trên Header Trên Cùng*:
    + Loại bỏ nút `StemToolsDropdown` khỏi top header, triệt tiêu sự trùng lặp (dư thừa công cụ STEM) khi đã có mini-tab `< STEM` neo cạnh phải màn hình.
  - *Làm Sạch Bảng Drawer & Bổ Sung Thanh Tìm Kiếm Search Ở Đầu*:
    + Xóa bỏ huy hiệu `GDPT 2018` và các badge công nghệ phụ (`JSXGraph`, `SGK 2018`, `Auto Calc`, `Vi Tích Phân`, `Thực Nghiệm`) gây rối mắt.
    + Thêm ô tìm kiếm trực tiếp (`Search input`) ở đầu bảng trượt, lọc thời gian thực toàn bộ 8 công cụ theo tiêu đề, mô tả và từ khóa.
    + Tinh giản danh sách công cụ: Chỉ hiển thị rõ nét Tiêu đề công cụ (`font-bold text-xs`) và Mô tả ngắn gọn (`text-[11px] text-slate-500`), loại bỏ 100% icon/emoji màu mè và các nút lồng nhau.
  - *Tự Động Bắt Mục Tiêu & Loại Bỏ Dropdown Thủ Công*:
    + Xóa bỏ dropdown `🎯 Chèn vào mục`, tự động bắt chính xác canvas và dòng con trỏ mà giáo viên đang thao tác.

- **Động Cơ Chèn Khối Đồ Thị, Bảng Biến Thiên & Công Thức Chuẩn Xác Tại Con Trỏ (`WordStyleFormulaCanvas.jsx`)**:
  - Nâng cấp hàm `insertSnippet`: Đối với các khối trực quan lớn (`[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]`, `[MATH_GEOMETRY_2D]`), hệ thống chèn trực tiếp tại đúng chỉ mục dòng (`targetIdx`) con trỏ đang đứng thay vì vứt xuống cuối tài liệu.
  - Tự động thay thế dòng trống hoặc chèn ngay sau dòng văn bản hiện tại và cập nhật con trỏ tiếp theo mượt mà.

- **Khắc Phục Lỗi Cú Pháp Import Dấu Phẩy & Tinh Chỉnh Nút STEM Trôi Nổi Cạnh Phải Siêu Gọn Nhẹ (`CurriculumStudioEditor.jsx`)**:
  - Bổ sung dấu phẩy kết thúc `Table2,` trong khối import `lucide-react`, triệt tiêu hoàn toàn lỗi TS1005 `',' expected`.
  - Thay thế tab dài 160px bằng mini-tab `[ < ✨ STEM ]` kích thước chỉ ~55px x ~20px (`pl-1.5 pr-1 py-2 rounded-l-xl`), ôm sát mép phải màn hình, không đè lấn trang soạn thảo.

- **Chuẩn Hóa UI Khối 4 Ngân Hàng Đề & Xóa Bỏ Nút Dán Ảnh Rời Rạc (`CurriculumStudioEditor.jsx`)**:
  - Căn thẳng hàng 1 dòng header Khối 4 (`AI Sinh Câu Hỏi` & `Thêm Câu Hỏi Mới`), loại bỏ emoji trùng lặp.
  - Xóa bỏ nút phụ `🖼️ Dán/Tải Ảnh`, hỗ trợ phím tắt `Ctrl+V` dán ảnh clipboard trực tiếp.
