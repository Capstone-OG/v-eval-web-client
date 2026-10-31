# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Chuyển Đổi Sắp Xếp Danh Sách Công Thức Sang 1 Cột Duy Nhất & Tinh Gọn Sidebar Ký Hiệu Studio

- **Chuyển Đổi Sắp Xếp Danh Sách Công Thức Sang 1 Cột Duy Nhất (`HierarchicalMathPalette.jsx`)**:
  - Thay thế toàn bộ bố cục 2 cột cũ (`grid-cols-2`) bằng bố cục 1 cột duy nhất (`grid-cols-1 gap-1.5`) cho cả cây thư mục và kết quả tìm kiếm.
  - Mỗi thẻ công thức tận dụng trọn vẹn bề ngang (~220px), hiển thị KaTeX trực quan, sắc nét, không bị co cụm hay cắt ngắn; tích hợp nhãn công thức, nút Chèn và tay nắm kéo thả (`GripVertical`).

- **Tinh Gọn Thanh Sidebar Ký Hiệu Bên Trái (`HierarchicalMathPalette.jsx` & `CurriculumStudioEditor.jsx`)**:
  - Giảm mạnh chiều rộng thanh Sidebar mở rộng từ `w-76 sm:w-84` (304px - 336px) xuống `w-60 sm:w-64` (240px - 256px), hoàn trả 80px - 96px chiều ngang cho khung soạn thảo bài giảng.
  - Thu gọn thanh ray khi đóng (Collapsed Rail) từ `w-12` xuống `w-10` với bộ nút icon tròn nhỏ gọn (`w-7 h-7`).
  - Nén Header thành 1 hàng ngang duy nhất (`text-[10px]`), tối ưu ô tìm kiếm nhanh (`Search Input`) với padding mỏng `py-1 text-[11px]`.

- **Tách Rời Từng Thẻ Câu Hỏi Linh Hoạt & Khung Chữ Nhật Lời Giải Chi Tiết (`CurriculumStudioEditor.jsx`)**:
  - Loại bỏ hoàn toàn `max-h-80 overflow-y-auto`, tách rời từng câu hỏi thành card độc lập (`h-auto`).
  - Hiển thị đầy đủ 4 phương án A-D và khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ.

- **Loại Bỏ Banner Header Live Preview Xanh Lá Cây (`CurriculumStudioEditor.jsx`)**:
  - Gỡ bỏ banner xanh ngọc ở đỉnh cột phải xem trước, tiết kiệm ~60px chiều cao màn hình.
